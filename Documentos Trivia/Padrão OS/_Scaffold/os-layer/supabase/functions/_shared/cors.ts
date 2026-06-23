// _shared/cors.ts — CORS para Edge Functions.
// Em produção, FIXE o domínio (SEC-002). Lista vinda de env, nunca "*".
const allowed = (Deno.env.get("CORS_ALLOWED_ORIGINS") ?? "").split(",").map((s) => s.trim());

export function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin && allowed.includes(origin) ? origin : (allowed[0] ?? "");
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}
