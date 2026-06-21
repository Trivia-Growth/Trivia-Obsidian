---
id: STORY-006
titulo: Autenticar optimize-content e verificar assinatura mp-webhook
fase: 1
modulo: Segurança / Edge Functions
status: concluido
prioridade: P0
agente_responsavel: "@dev"
criado: 2026-06-13
atualizado: 2026-06-17
seguranca: SEC-017, SEC-019
---

# STORY-006 — Autenticar optimize-content e verificar assinatura mp-webhook

## Contexto

Dois problemas críticos em Edge Functions:

1. **`optimize-content`**: Completamente pública. Qualquer pessoa pode chamar o endpoint e disparar chamadas à Lovable AI Gateway sem limite às custas do projeto.

2. **`mp-webhook`**: Não valida a assinatura do Mercado Pago. Um atacante pode forjar webhooks e criar registros de compra sem pagamento real.

## Critérios de Aceite

### optimize-content
- [ ] CA-01: Função requer JWT válido via `Authorization: Bearer <token>`
- [ ] CA-02: Requisições sem token retornam 401
- [ ] CA-03: Tokens inválidos/expirados retornam 401
- [ ] CA-04: Frontend envia token corretamente (verificar onde é chamada)

### mp-webhook
- [ ] CA-05: Validação de assinatura implementada via header `x-signature`
- [ ] CA-06: Webhooks sem assinatura retornam 401
- [ ] CA-07: Webhooks com assinatura inválida retornam 401
- [ ] CA-08: Webhooks válidos continuam processando normalmente
- [ ] CA-09: Secret do webhook configurado via `supabase secrets set MERCADOPAGO_WEBHOOK_SECRET=...`

### Geral
- [ ] CA-10: CORS de `mp-webhook` e `mp-create-preference` e `ai-tutor` mudado de `"*"` para whitelist restritiva

## Escopo

**IN:**
- Autenticar `optimize-content` com JWT
- Validar assinatura Mercado Pago em `mp-webhook`
- Restringir CORS nas 3 funções identificadas

**OUT:**
- Rate limiting (story separada no P2)
- Outros endpoints

## Implementação

### optimize-content — Adicionar JWT

```typescript
// No início do handler, após CORS:
const authHeader = req.headers.get("Authorization");
if (!authHeader?.startsWith("Bearer ")) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: corsHeaders,
  });
}
const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
  authHeader.replace("Bearer ", "")
);
if (authError || !user) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: corsHeaders,
  });
}
```

### mp-webhook — Verificar assinatura MP

```typescript
// Referência: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
const xSignature = req.headers.get("x-signature");
const xRequestId = req.headers.get("x-request-id");
const dataId = url.searchParams.get("data.id");

if (!xSignature) {
  return new Response("Unauthorized", { status: 401 });
}

// Parse da assinatura
const parts = xSignature.split(",");
const ts = parts.find(p => p.startsWith("ts="))?.split("=")[1];
const v1 = parts.find(p => p.startsWith("v1="))?.split("=")[1];

// Montar manifest
const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

// Verificar HMAC
const secret = Deno.env.get("MERCADOPAGO_WEBHOOK_SECRET") ?? "";
const encoder = new TextEncoder();
const key = await crypto.subtle.importKey(
  "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
);
const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(manifest));
const expectedV1 = Array.from(new Uint8Array(sig))
  .map(b => b.toString(16).padStart(2, "0")).join("");

if (v1 !== expectedV1) {
  console.error("[MP-WEBHOOK] Invalid signature");
  return new Response("Unauthorized", { status: 401 });
}
```

### CORS restritivo

```typescript
// Substituir corsHeaders nas 3 funções
const ALLOWED_ORIGINS = [
  "https://triviaedutech.com",
  "https://app.triviaedutech.com",
  "http://localhost:8080",
  "http://localhost:5173",
];

const origin = req.headers.get("origin") ?? "";
const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

## Deploy

```bash
supabase secrets set MERCADOPAGO_WEBHOOK_SECRET=valor_do_painel_mp
supabase functions deploy optimize-content
supabase functions deploy mp-webhook
supabase functions deploy ai-tutor
supabase functions deploy mp-create-preference
```

## Testes

- [ ] POST para `optimize-content` sem token retorna 401
- [ ] POST para `optimize-content` com token válido funciona
- [ ] Webhook MP sem `x-signature` retorna 401
- [ ] Webhook MP com assinatura correta processa normalmente
- [ ] Teste de pagamento de ponta a ponta ainda funciona

## Lista de Arquivos

- `supabase/functions/optimize-content/index.ts`
- `supabase/functions/mp-webhook/index.ts`
- `supabase/functions/ai-tutor/index.ts`
- `supabase/functions/mp-create-preference/index.ts`
