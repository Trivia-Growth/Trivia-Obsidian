// Netlify Function: /webhooks/tray
// Arquivo: netlify/functions/webhooks-tray.js (no repo heziom-api)
// URL final: https://api.editoraheziom.com.br/webhooks/tray
//
// Recebe notificações webhook da Tray (POST x-www-form-urlencoded)
// Payload: { seller_id, scope_id, scope_name, act, app_code, url_notification }

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const TRAY_API_HOST = process.env.TRAY_API_HOST; // https://lojatesteintegracaotray.commercesuite.com.br
const TRAY_CONSUMER_KEY = process.env.TRAY_CONSUMER_KEY;
const TRAY_CONSUMER_SECRET = process.env.TRAY_CONSUMER_SECRET;

exports.handler = async (event) => {
  if (event.httpMethod === "GET") {
    return { statusCode: 200, body: JSON.stringify({ status: "ok", service: "tray-webhook" }) };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const payload = parsePayload(event);
    console.log("[tray-webhook] Received:", JSON.stringify(payload));

    // Responder 200 imediatamente (Tray exige resposta rápida)
    // Processamento pesado vai para fila async no futuro

    const { scope_name, scope_id, act, seller_id } = payload;

    // Log no Supabase para auditoria e processamento posterior
    if (SUPABASE_URL && SUPABASE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
      await supabase.from("tray_webhook_log").insert({
        scope_name,
        scope_id: String(scope_id),
        action: act,
        seller_id: String(seller_id),
        raw_payload: payload,
        processed: false,
      });
    }

    // Processamento imediato por scope (fase 1: só order e transaction)
    if (scope_name === "order" && (act === "insert" || act === "update")) {
      await handleOrderEvent(scope_id, act, seller_id);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true, scope_name, scope_id, act }),
    };
  } catch (err) {
    console.error("[tray-webhook] Error:", err.message);
    // Retornar 200 mesmo em erro para evitar retentativas infinitas da Tray
    // O erro fica logado para investigação
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true, error: "logged" }),
    };
  }
};

// --- Helpers ---

function parsePayload(event) {
  const contentType = event.headers["content-type"] || "";
  if (contentType.includes("application/json")) {
    return JSON.parse(event.body);
  }
  // x-www-form-urlencoded (padrão Tray)
  const params = new URLSearchParams(event.body);
  const obj = {};
  for (const [key, value] of params.entries()) {
    obj[key] = value;
  }
  return obj;
}

async function handleOrderEvent(orderId, action, sellerId) {
  // Fase 1: Log + buscar dados completos do pedido
  // Fase 2: Disparar CAPI Purchase (server-side, sem depender do GTM)
  // Fase 3: Criar/atualizar título financeiro no Supabase
  console.log(`[tray-webhook] Order ${action}: #${orderId} (seller: ${sellerId})`);

  // TODO: Buscar pedido completo via GET /web_api/orders/{orderId}/complete
  // TODO: Se action=insert && status=aprovado → disparar Meta CAPI Purchase
  // TODO: Se action=update → verificar mudança de status e reagir
}
