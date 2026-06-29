// Proxy de captura de lead das LPs → crm-lead-intake do HeziomOS.
// Guarda o X-API-Token no servidor (env da Netlify), nunca no HTML público.
// Configurar na Netlify (Site settings → Environment variables):
//   HZ_LEAD_TOKEN = <token criado em HeziomOS: Configurações → Leads → API Tokens>
//   HZ_INTAKE_URL = https://ouvfthknhqcciuothrqb.supabase.co/functions/v1/crm-lead-intake
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: cors(), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors(), body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  const token = process.env.HZ_LEAD_TOKEN;
  const url = process.env.HZ_INTAKE_URL;
  if (!token || !url) {
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: 'Proxy de lead não configurado (HZ_LEAD_TOKEN/HZ_INTAKE_URL ausentes).' }) };
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Token': token },
      body: event.body || '{}',
    });
    const text = await res.text();
    return { statusCode: res.status, headers: { ...cors(), 'Content-Type': 'application/json' }, body: text };
  } catch (e) {
    return { statusCode: 502, headers: cors(), body: JSON.stringify({ error: 'Falha ao encaminhar o lead.', detail: String(e) }) };
  }
};
function cors() {
  return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
}
