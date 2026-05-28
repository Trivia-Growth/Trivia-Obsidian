// ============================================================================
// SNAPSHOT — espelho de netlify/functions/webhooks-tray.js no repo heziom-api
// Atualizado: 2026-05-28 (commit 6bf9269)
// FONTE DE VERDADE: github.com/heziom/heziom-api — este arquivo é só referência.
// URL final: https://api.editoraheziom.com.br/webhooks/tray
//
// Recebe webhooks da Tray (POST x-www-form-urlencoded ou JSON).
// Payload: { scope_name, scope_id, act, seller_id, app_code }
// Em order.update aprovado → dispara Meta CAPI Purchase (server-side, com dedup).
// ============================================================================

const crypto = require("crypto");

const PIXEL_ID = process.env.META_PIXEL_ID;
const CAPI_TOKEN = process.env.META_CAPI_TOKEN;
const TRAY_API_HOST = process.env.TRAY_API_HOST;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function getTrayToken() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return process.env.TRAY_ACCESS_TOKEN || "";
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/tray_tokens?store_key=eq.default&select=access_token&limit=1`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const rows = await res.json();
    if (rows[0]?.access_token) return rows[0].access_token;
  } catch (e) {}
  return process.env.TRAY_ACCESS_TOKEN || "";
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, body: "" };
  }

  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ok", service: "tray-webhook", timestamp: new Date().toISOString() }),
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const payload = parsePayload(event);
    const { scope_name, scope_id, act, seller_id, app_code } = payload;

    console.log(`[webhook] ${scope_name}.${act} | id=${scope_id} | seller=${seller_id}`);

    // Log no Supabase (async, não bloqueia resposta)
    const logPromise = logToSupabase(payload);

    // Processar evento de pedido para CAPI
    if (scope_name === "order" && act === "update") {
      await processOrderForCAPI(scope_id);
    }

    await logPromise;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ received: true, scope_name, scope_id, act }),
    };
  } catch (err) {
    console.error("[webhook] Error:", err.message);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ received: true, error: "logged" }),
    };
  }
};

function parsePayload(event) {
  const contentType = (event.headers["content-type"] || "").toLowerCase();
  if (contentType.includes("application/json")) {
    return JSON.parse(event.body || "{}");
  }
  const params = new URLSearchParams(event.body || "");
  const obj = {};
  for (const [key, value] of params.entries()) {
    obj[key] = value;
  }
  return obj;
}

async function logToSupabase(payload) {
  if (!SUPABASE_URL || !SUPABASE_KEY) return;

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/tray_webhook_log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        scope_name: payload.scope_name || "unknown",
        scope_id: String(payload.scope_id || ""),
        action: payload.act || "unknown",
        seller_id: String(payload.seller_id || ""),
        app_code: String(payload.app_code || ""),
        raw_payload: payload,
        processed: false,
      }),
    });
  } catch (err) {
    console.error("[webhook] Supabase log error:", err.message);
  }
}

async function processOrderForCAPI(orderId) {
  const accessToken = await getTrayToken();
  if (!TRAY_API_HOST || !accessToken) {
    console.log("[webhook] Tray credentials not configured, skipping CAPI");
    return;
  }

  try {
    // Deduplicação: verificar se já disparamos CAPI para este pedido
    if (SUPABASE_URL && SUPABASE_KEY) {
      const dedupRes = await fetch(
        `${SUPABASE_URL}/rest/v1/tray_webhook_log?scope_name=eq.order&scope_id=eq.${orderId}&action=eq.update&processed=eq.true&limit=1`,
        { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
      );
      const dedupRows = await dedupRes.json();
      if (dedupRows.length > 0) {
        console.log(`[webhook] Order #${orderId} CAPI already sent — dedup skip`);
        return;
      }
    }

    // Buscar pedido completo na Tray
    const orderUrl = `${TRAY_API_HOST}/web_api/orders/${orderId}/complete?access_token=${accessToken}`;
    const orderResp = await fetch(orderUrl);

    if (!orderResp.ok) {
      console.error(`[webhook] Tray order fetch failed: ${orderResp.status}`);
      return;
    }

    const orderData = await orderResp.json();
    const order = orderData.Order || orderData;

    // Disparar CAPI para pedidos com pagamento confirmado
    const status = (order.status || "").toLowerCase().trim();
    const approvedStatuses = [
      "a enviar", "a enviar master", "a enviar vindi",
      "enviado", "finalizado", "entregue",
      "aprovado", "approved", "payment_confirmed",
    ];
    if (!approvedStatuses.some((s) => status.includes(s))) {
      console.log(`[webhook] Order #${orderId} status="${status}" — skipping CAPI`);
      return;
    }

    // Disparar Meta CAPI Purchase
    await sendCAPIEvent(order, orderId);

    // Marcar como processado para deduplicação
    if (SUPABASE_URL && SUPABASE_KEY) {
      await fetch(
        `${SUPABASE_URL}/rest/v1/tray_webhook_log?scope_name=eq.order&scope_id=eq.${orderId}&action=eq.update&processed=eq.false`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ processed: true }),
        }
      );
    }
  } catch (err) {
    console.error(`[webhook] CAPI processing error for order ${orderId}:`, err.message);
  }
}

async function sendCAPIEvent(order, orderId) {
  if (!PIXEL_ID || !CAPI_TOKEN) {
    console.log("[webhook] Meta credentials not configured, skipping CAPI");
    return;
  }

  const customer = order.Customer || order.customer || {};
  const address = order.shipping_address || customer;

  const email = customer.email || "";
  const phone = (customer.phone || customer.cellphone || "").replace(/\D/g, "");
  const name = customer.name || "";
  const firstName = name.split(" ")[0] || "";
  const lastName = name.split(" ").slice(1).join(" ") || "";
  const zip = (address.zip_code || address.zip || "").replace(/\D/g, "");
  const city = address.city || "";
  const state = address.state || "";
  const value = parseFloat(order.total || order.partial_total || 0);

  const eventId = `tray_purchase_${orderId}`;

  const userData = {};
  if (email) userData.em = [sha256(email.toLowerCase().trim())];
  if (phone) userData.ph = [sha256(phone.startsWith("55") ? phone : "55" + phone)];
  if (firstName) userData.fn = [sha256(firstName.toLowerCase().trim())];
  if (lastName) userData.ln = [sha256(lastName.toLowerCase().trim())];
  if (zip) userData.zp = [sha256(zip)];
  if (city) userData.ct = [sha256(city.toLowerCase().trim())];
  if (state) userData.st = [sha256(state.toLowerCase().trim())];
  userData.country = [sha256("br")];

  const capiPayload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: "https://www.editoraheziom.com.br/",
        user_data: userData,
        custom_data: {
          currency: "BRL",
          value,
          order_id: String(orderId),
          content_name: `Pedido #${orderId}`,
        },
      },
    ],
    access_token: CAPI_TOKEN,
  };

  const res = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(capiPayload),
  });

  const result = await res.json();

  if (res.ok) {
    console.log(`[webhook] CAPI Purchase sent — Order #${orderId}, R$${value}, eventId=${eventId}`);
  } else {
    console.error(`[webhook] CAPI error:`, JSON.stringify(result));
  }
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
