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
| `SUPABASE_URL` | `https://xxx.supabase.co` | URL do projeto Supabase HeziomOS |
| `SUPABASE_SERVICE_KEY` | `eyJ...` | Service role key (não anon) |
| `TRAY_API_HOST` | `https://lojatesteintegracaotray.commercesuite.com.br` | Host da loja |
| `TRAY_CONSUMER_KEY` | `69a36f861...` | Consumer key do app |
| `TRAY_CONSUMER_SECRET` | `0a18522d3...` | Consumer secret do app |

---

## 4. Criar tabela no Supabase

```sql
CREATE TABLE IF NOT EXISTS tray_webhook_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  scope_name text NOT NULL,
  scope_id text NOT NULL,
  action text NOT NULL,
  seller_id text,
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
```

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

| Fase | O que faz | Quando |
|---|---|---|
| **Fase 1 (agora)** | Recebe webhook → loga no Supabase → responde 200 | Deploy imediato |
| **Fase 2** | Order insert/update → dispara Meta CAPI server-side (elimina dependência GTM) | Após validar payloads reais |
| **Fase 3** | Order/transaction → cria/baixa títulos financeiros no Supabase | Com sync agent HeziomOS |
| **Fase 4** | Product/stock → sync bidirecional com Literarius | Com módulo E-commerce |

---

## Referências

- [[Tray - Webhooks]] — documentação dos eventos e formato de payload
- [[Tray - Autenticação]] — credenciais e tokens
- [[Meta CAPI — Configuração Tray Ecommerce]] — CAPI já implementado via GTM
- Repo: `github.com/heziom/heziom-api`
