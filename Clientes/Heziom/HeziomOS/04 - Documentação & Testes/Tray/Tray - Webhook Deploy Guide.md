---
tags: [tray, webhook, deploy, netlify, heziom-api]
status: operacional
criado: 2026-05-27
atualizado: 2026-05-28
---

# Tray Webhook — Deploy Guide

> Instruções para adicionar a function de webhook no repo `heziom-api` (Netlify).
> **Status:** ✅ **OPERACIONAL** — Webhooks ativos, CAPI disparando, deduplicação funcionando (28/05/2026).

---

## 1. Criar a function no repo

No repo `github.com/heziom/heziom-api`, criar o arquivo:

```
netlify/functions/webhooks-tray.js
```

Copiar o conteúdo de `tray-webhook-function.js` (nesta mesma pasta do vault).

---

## 2. Configurar redirect (netlify.toml)

Adicionar ao `netlify.toml` para que a URL limpa funcione:

```toml
[[redirects]]
  from = "/webhooks/tray"
  to = "/.netlify/functions/webhooks-tray"
  status = 200
```

---

## 3. Environment variables (Netlify Dashboard)

| Variável | Valor | Descrição |
|---|---|---|
| `META_PIXEL_ID` | `297709555050094` | Pixel do Meta |
| `META_CAPI_TOKEN` | `EAA...` | Token CAPI do Gerenciador de Eventos (secret) |
| `TRAY_WEBHOOK_SECRET` | `hz_tray_2026_xK9p4mR7vQs` | Valida webhook e o seed de token |
| `SUPABASE_URL` | `https://eqsjvacbhrezlgqpwipv.supabase.co` | URL do projeto Supabase HeziomOS |
| `SUPABASE_SERVICE_KEY` | `eyJ...` | Service role key (não anon) |
| `TRAY_API_HOST` | `https://lojatesteintegracaotray.commercesuite.com.br` | Host da loja (⚠️ hoje é a loja de **teste**) |
| `TRAY_CONSUMER_KEY` | `69a36f861...` | Consumer key do app |
| `TRAY_CONSUMER_SECRET` | `0a18522d3...` | Consumer secret do app (secret) |
| `TRAY_ACCESS_TOKEN` | `...` | Fallback se o Supabase falhar |

---

## 4. Criar tabelas no Supabase

A function usa **duas** tabelas: `tray_webhook_log` (auditoria + dedup) e `tray_tokens` (token da Tray renovado a cada 2h).

```sql
-- Log de webhooks + flag de deduplicação do CAPI
CREATE TABLE IF NOT EXISTS tray_webhook_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  scope_name text NOT NULL,
  scope_id text NOT NULL,
  action text NOT NULL,
  seller_id text,
  app_code text,
  raw_payload jsonb,
  processed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Index para queries de processamento
CREATE INDEX idx_webhook_log_unprocessed 
  ON tray_webhook_log (processed, created_at) 
  WHERE processed = false;

-- RLS: só service role acessa
ALTER TABLE tray_webhook_log ENABLE ROW LEVEL SECURITY;

-- Token da Tray (gerenciado por tray-token-seed.js e tray-token-refresh.js)
CREATE TABLE IF NOT EXISTS tray_tokens (
  store_key text PRIMARY KEY,
  access_token text,
  refresh_token text,
  expires_at text,
  refreshed_at timestamptz
);

ALTER TABLE tray_tokens ENABLE ROW LEVEL SECURITY;
```

> Após criar `tray_tokens`, semear o token inicial uma vez via `POST /api/tray-token-seed` (header `X-Seed-Secret: <TRAY_WEBHOOK_SECRET>`, body `{ access_token, refresh_token }`). A partir daí o `tray-token-refresh.js` (cron 2h) renova sozinho.

---

## 5. Testar

Após deploy, verificar que o endpoint responde:

```bash
curl -X GET https://api.editoraheziom.com.br/webhooks/tray
# Esperado: {"status":"ok","service":"tray-webhook"}

curl -X POST https://api.editoraheziom.com.br/webhooks/tray \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "seller_id=1501119&scope_id=12345&scope_name=order&act=insert&app_code=8395"
# Esperado: {"received":true,"scope_name":"order","scope_id":"12345","act":"insert"}
```

---

## 6. Scopes ativados (confirmado pela Tray 27/05/2026)

| Scope | scope_name (payload) |
|---|---|
| Produtos | `product` |
| Clientes | `customer` |
| Pedidos | `order` |
| Preço dos produtos | `product_price` |
| Estoque de produtos | `product_stock` |
| Variações | `variant` |
| Preço das variações | `variant_price` |
| Estoque das variações | `variant_stock` |
| Pagamentos | `transaction` |
| Dados da loja | `store_config` |
| Cobrança de pedidos | `order_invoice` |
| Perfil de Cliente / Lista de Preço | `customer_profile` |

---

## 7. Evolução planejada

| Fase | O que faz | Status |
|---|---|---|
| **Fase 1** | Recebe webhook → loga no Supabase → responde 200 | ✅ No ar |
| **Fase 2** | Order update → dispara Meta CAPI server-side (elimina dependência GTM) | ✅ No ar (28/05/2026) — 8 pedidos reais com CAPI disparado, dedup validada |
| **Fase 3** | Order/transaction → cria/baixa títulos financeiros no Supabase | ⏳ Com sync agent HeziomOS |
| **Fase 4** | Product/stock → sync bidirecional com Literarius | ⏳ Com módulo E-commerce |

> Detalhe técnico de todas as funções do repo em [[heziom-api — Referência Técnica]].

---

## Referências

- [[heziom-api — Referência Técnica]] — mapa completo das 4 funções, rotas, env vars e tabelas
- [[Tray - Webhooks]] — documentação dos eventos e formato de payload
- [[Tray - Autenticação]] — credenciais e tokens
- [[Meta CAPI — Configuração Tray Ecommerce]] — estratégia completa de tracking (Pixel + CAPI + GA4)
- Repo: `github.com/heziom/heziom-api`
