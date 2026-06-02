/**
 * Netlify Function: /api/leads
 * Captura de lead da LP Bíblia 120 anos (IPP) + integração com Flowbiz (Mailclick)
 * + Meta Conversions API (CAPI) server-side para Match Quality alta.
 *
 * Variáveis de ambiente necessárias no painel Netlify:
 *   FLOWBIZ_API_KEY      – API Key da Flowbiz
 *   FLOWBIZ_LIST_ID      – ID numérico da lista "LP - Bíblia 120 anos"
 *   META_PIXEL_ID        – Pixel da Editora Heziom: 297709555050094
 *   META_CAPI_TOKEN      – CAPI Access Token gerado no Events Manager
 *   META_TEST_EVENT_CODE – (opcional) Test Event Code para validação
 */

const { createHash } = require('crypto');

function sha256(value) {
  return createHash('sha256').update(value.toLowerCase().trim()).digest('hex');
}

const ALLOWED_ORIGINS = new Set([
  'https://biblia120.editoraheziom.com.br',
  'https://lp-biblia120.netlify.app',
  'http://localhost:8888',
  'http://localhost:3000',
]);
const NETLIFY_PREVIEW_RE = /^https:\/\/[a-z0-9-]+--lp-biblia120\.netlify\.app$/i;

function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  return NETLIFY_PREVIEW_RE.test(origin);
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || '';
  const originAllowed = isAllowedOrigin(origin);

  const corsHeaders = {
    ...(originAllowed ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    if (origin && !originAllowed) return { statusCode: 403, body: '' };
    return { statusCode: 204, headers: corsHeaders, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Método não permitido' }),
    };
  }

  if (origin && !originAllowed) {
    console.warn('CORS: origem rejeitada:', origin);
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Origem não autorizada' }),
    };
  }

  try {
    const { email, nome, fonte, combo_interesse } = JSON.parse(event.body || '{}');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'E-mail inválido' }),
      };
    }

    if (!process.env.FLOWBIZ_API_KEY || !process.env.FLOWBIZ_LIST_ID) {
      console.error('Variáveis FLOWBIZ_API_KEY ou FLOWBIZ_LIST_ID não configuradas');
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Configuração do servidor incompleta' }),
      };
    }

    const clientIP =
      event.headers['x-nf-client-connection-ip'] ||
      event.headers['x-forwarded-for']?.split(',')[0].trim() ||
      '';

    // Flowbiz/Mailclick espera form-urlencoded.
    // Os Field IDs custom (Nome / Fonte / Combo) precisam ser confirmados na lista nova.
    const params = new URLSearchParams();
    params.append('APIKey', process.env.FLOWBIZ_API_KEY);
    params.append('Command', 'Subscriber.Subscribe');
    params.append('ResponseFormat', 'JSON');
    params.append('ListID', process.env.FLOWBIZ_LIST_ID);
    params.append('EmailAddress', email.trim().toLowerCase());
    if (nome) params.append('CustomField40612', nome);
    if (fonte) params.append('CustomField58000', fonte);
    if (combo_interesse) params.append('CustomField58001', combo_interesse);
    if (clientIP) params.append('IPAddress', clientIP);
    params.append('UpdateIfExists', '1');

    const flowbizResponse = await fetch('https://mbiz.mailclick.me/api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    const rawText = await flowbizResponse.text();
    console.log('Flowbiz status:', flowbizResponse.status);
    console.log('Flowbiz raw response:', rawText);

    let flowbizData;
    try {
      flowbizData = JSON.parse(rawText);
    } catch (parseErr) {
      console.error('Flowbiz respondeu não-JSON:', rawText);
      return {
        statusCode: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Resposta inesperada da Flowbiz', flowbiz_raw: rawText.substring(0, 300) }),
      };
    }

    if (!flowbizResponse.ok || flowbizData.Status === 'failure') {
      console.error('Flowbiz erro:', flowbizData);
      return {
        statusCode: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Falha ao cadastrar na Flowbiz', flowbiz: flowbizData }),
      };
    }

    // ----- Meta CAPI server-side -----
    const PIXEL_ID = process.env.META_PIXEL_ID;
    const CAPI_TOKEN = process.env.META_CAPI_TOKEN;
    const TEST_CODE = process.env.META_TEST_EVENT_CODE || '';
    const uniqueEventId = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

    if (PIXEL_ID && CAPI_TOKEN) {
      const userAgent = event.headers['user-agent'] || '';
      const fbpCookie = (event.headers.cookie || '').match(/_fbp=([^;]+)/)?.[1] || '';
      const fbcCookie = (event.headers.cookie || '').match(/_fbc=([^;]+)/)?.[1] || '';

      const capiPayload = {
        data: [{
          event_name: 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          event_id: uniqueEventId,
          action_source: 'website',
          event_source_url: 'https://biblia120.editoraheziom.com.br/',
          user_data: {
            em: [sha256(email)],
            client_ip_address: clientIP,
            client_user_agent: userAgent,
            ...(fbpCookie ? { fbp: fbpCookie } : {}),
            ...(fbcCookie ? { fbc: fbcCookie } : {}),
          },
          custom_data: {
            currency: 'BRL',
            value: 1,
            content_name: 'Cupom IPP120',
            content_category: fonte || 'desconhecido',
          },
        }],
        access_token: CAPI_TOKEN,
        ...(TEST_CODE ? { test_event_code: TEST_CODE } : {}),
      };

      fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(capiPayload),
      }).then(r => r.json()).then(d => {
        console.log('Meta CAPI response:', JSON.stringify(d));
      }).catch(err => {
        console.error('Meta CAPI error:', err.message);
      });
    } else {
      console.warn('META_PIXEL_ID ou META_CAPI_TOKEN não configurados — CAPI ignorado');
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        message: 'Cupom IPP120 enviado para seu e-mail',
        event_id: uniqueEventId,
        flowbiz: flowbizData,
      }),
    };
  } catch (error) {
    console.error('Erro no handler de leads:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Erro ao processar. Tente novamente.', detail: error.message }),
    };
  }
};
