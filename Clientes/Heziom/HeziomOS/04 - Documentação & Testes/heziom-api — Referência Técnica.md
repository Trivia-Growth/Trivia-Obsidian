---
tags: [heziom-api, netlify, tray, capi, supabase, referencia]
status: operacional
criado: 2026-05-28
atualizado: 2026-05-28
repo: github.com/heziom/heziom-api
dominio: api.editoraheziom.com.br
---

# heziom-api — Referência Técnica

> Mapa do repositório `heziom/heziom-api`: o que é cada função, em que rota responde, quais variáveis e tabelas usa. **Fonte de verdade é o código no repo** — esta nota é o resumo navegável.

## Em uma frase

São pequenos serviços (Netlify Functions) que ficam no ar 24h em `api.editoraheziom.com.br` e fazem a ponte entre a **loja Tray** e o **Meta (Facebook Ads)**: toda vez que um pedido é aprovado, eles avisam o Meta server-side (Conversions API), além de manterem o token de acesso da Tray sempre renovado.

## Por que isso existe

O ecommerce da Tray tinha só o Pixel no navegador (client-side), sem CAPI server-side. Isso deixava ~68% das compras "invisíveis" para o algoritmo do Meta — risco direto de ROAS com o sprint de Meta Ads. Este repo fecha esse gap. Detalhe completo da estratégia em [[Meta CAPI — Configuração Tray Ecommerce]].

---

## Infraestrutura

| Item | Valor |
|---|---|
| Repositório | `github.com/heziom/heziom-api` |
| Hospedagem | Netlify (free tier, deploy automático no push) |
| Domínio | `api.editoraheziom.com.br` |
| Runtime | Node.js serverless — **sem dependências externas** (`package.json` → `dependencies: {}`), usa só `crypto` nativo e `fetch` global |
| Bundler | esbuild |
| Persistência | Supabase `eqsjvacbhrezlgqpwipv` (sa-east-1) |
| Versão | `1.1.0` |

### Rotas (netlify.toml)

| Rota pública | Função | Método |
|---|---|---|
| `/webhooks/tray` | `webhooks-tray.js` | POST (recebe webhook) / GET (health check) |
| `/api/tray-capi` | `tray-capi.js` | POST |
| `/api/tray-token-seed` | `tray-token-seed.js` | POST (bootstrap) / GET (info) |
| `/api/tray-token-refresh` | `tray-token-refresh.js` | GET (manual) + cron automático |
| `/api/*` | qualquer função em `netlify/functions/` | conforme `:splat` |

---

## As 4 funções

### 1. `webhooks-tray.js` — recebedor oficial de webhooks (PRIMÁRIO)

**Rota:** `POST /webhooks/tray` · **Health check:** `GET /webhooks/tray` → `{status:"ok"}`

É o caminho principal do CAPI hoje. Recebe os webhooks oficiais da Tray (formato `x-www-form-urlencoded` ou JSON) com `{scope_name, scope_id, act, seller_id, app_code}`.

Fluxo:
1. Loga **todo** webhook na tabela `tray_webhook_log` (`processed=false`) — auditoria.
2. Se `scope_name=order` e `act=update` → processa para CAPI:
   - **Dedup:** se já existe log `processed=true` para aquele pedido, ignora (evita disparo múltiplo quando a Tray manda vários `order.update`).
   - Busca o token de acesso em `tray_tokens` (fallback: env `TRAY_ACCESS_TOKEN`).
   - `GET /web_api/orders/{id}/complete` na Tray — pega dados do cliente.
   - Confere o status contra a lista de "aprovado" (ver tabela de status abaixo).
   - Dispara **Purchase** no Meta CAPI com `event_id = tray_purchase_{orderId}` (determinístico, p/ dedup com o Pixel browser) e `user_data` hasheado em SHA256.
   - Marca o log como `processed=true`.
3. Responde **sempre 200**, mesmo em erro, para a Tray não ficar reenviando.

### 2. `tray-capi.js` — recebedor direto/legado (FALLBACK)

**Rota:** `POST /api/tray-capi`

Versão mais simples e antiga: recebe um payload de pedido direto (`{type, store_id, order}`), mapeia o status e dispara o evento no Meta CAPI. Foi a primeira implementação (chamada pelo GTM no navegador).

- Validação: header `X-Tray-Webhook-Secret` **ou** query `?secret=`.
- CORS restrito a `https://www.editoraheziom.com.br`.
- Mapeamento: `approved`/`payment_confirmed` → **Purchase**; `new`/`pending` → **InitiateCheckout**.
- `event_id = tray_{evento}_{orderId}_{Date.now()}` — **não determinístico** (difere do `webhooks-tray.js`).

> ⚠️ **Hoje é standby.** Desde o GTM v20 (28/05/2026), a tag do navegador parou de chamar este endpoint — o CAPI passou a ser disparado só pelo `webhooks-tray.js`. Mantido como fallback manual.

### 3. `tray-token-refresh.js` — renovação automática de token

**Rota:** `GET /api/tray-token-refresh` (manual) + **cron `0 */2 * * *`** (a cada 2 horas)

O token de acesso da Tray expira. Esta função roda sozinha a cada 2h: lê o `refresh_token` de `tray_tokens`, chama o `/web_api/auth` da Tray com consumer key/secret, e grava o novo `access_token` + `refresh_token` + `expires_at` de volta no Supabase. Se nunca foi "semeado", retorna pedindo para rodar o seed primeiro.

### 4. `tray-token-seed.js` — bootstrap inicial do token

**Rota:** `POST /api/tray-token-seed` (uma vez) · `GET` → instruções

Coloca o primeiro par `access_token`/`refresh_token` no Supabase para a renovação automática assumir dali em diante. Protegido por header `X-Seed-Secret` (= `TRAY_WEBHOOK_SECRET`). É uma operação de configuração inicial, não roda no dia a dia.

---

## Tabelas no Supabase (`eqsjvacbhrezlgqpwipv`)

### `tray_webhook_log`

| Coluna | Tipo | Uso |
|---|---|---|
| `id` | uuid PK | — |
| `scope_name` | text | `order`, `product`, `customer`, etc. |
| `scope_id` | text | ID do recurso (ex.: nº do pedido) |
| `action` | text | `insert` / `update` |
| `seller_id` | text | ID do lojista |
| `app_code` | text | código do app (inserido pelo `webhooks-tray.js`) |
| `raw_payload` | jsonb | payload bruto recebido |
| `processed` | boolean | flag de deduplicação do CAPI |
| `created_at` | timestamptz | — |

### `tray_tokens`

| Coluna | Tipo | Uso |
|---|---|---|
| `store_key` | text | chave da loja (`default`) |
| `access_token` | text | token de acesso atual da Tray |
| `refresh_token` | text | usado para renovar |
| `expires_at` | text/timestamptz | validade do access_token |
| `refreshed_at` | timestamptz | última renovação |

---

## Variáveis de ambiente (Netlify)

| Variável | Valor / descrição |
|---|---|
| `META_PIXEL_ID` | `297709555050094` |
| `META_CAPI_TOKEN` | token do Gerenciador de Eventos Meta (secret) |
| `TRAY_WEBHOOK_SECRET` | `hz_tray_2026_xK9p4mR7vQs` (valida webhook e seed) |
| `TRAY_API_HOST` | `https://lojatesteintegracaotray.commercesuite.com.br` |
| `TRAY_CONSUMER_KEY` | `<CONSUMER_KEY no .secret.md local do HeziomOS>` |
| `TRAY_CONSUMER_SECRET` | consumer secret do app (secret) |
| `TRAY_ACCESS_TOKEN` | fallback se o Supabase falhar |
| `SUPABASE_URL` | `https://eqsjvacbhrezlgqpwipv.supabase.co` |
| `SUPABASE_SERVICE_KEY` | service role key (secret) |

> ⚠️ **Homologação até 13/08/2026:** `TRAY_API_HOST` aponta para a **loja de teste** (`lojatesteintegracaotray...`) **de propósito** — a integração está em homologação. Na migração para produção, trocar para `www.editoraheziom.com.br` (store ID **1345958**), reconfigurar `TRAY_CONSUMER_KEY/SECRET` e re-seed do token. O aviso fica como boa prática até o cutover.

---

## Status Tray → dispara CAPI Purchase?

(usado pelo `webhooks-tray.js` — comparação por `includes`, case-insensitive)

| Status Tray | Dispara Purchase? |
|---|---|
| `A ENVIAR` / `A ENVIAR MASTER` / `A ENVIAR VINDI` | ✅ |
| `ENVIADO` / `FINALIZADO` / `ENTREGUE` | ✅ |
| `APROVADO` / `approved` / `payment_confirmed` | ✅ |
| `AGUARDANDO PAGAMENTO` / `PENDENTE` / `CANCELADO` | ❌ |

---

## Deduplicação (3 camadas)

1. **Meta `event_id`** — browser (GTM v20) e server usam o mesmo `tray_purchase_{orderId}`; o Meta deduplica.
2. **Supabase `processed`** — não dispara CAPI 2x para o mesmo pedido.
3. **Status filtrado** — só status aprovados disparam.

---

## Privacidade (LGPD)

Email, telefone, nome, CEP, cidade, estado e país são **hasheados em SHA256** antes de irem ao Meta. Telefone é normalizado com prefixo `55`. Nenhum dado pessoal em texto puro sai do servidor.

---

## Histórico de evolução (commits)

| Data | Mudança |
|---|---|
| 26/05 | `tray-capi` inicial — CAPI server-side via GTM |
| 26/05 | CORS + hash do campo país |
| 27/05 | Recebedor de webhooks `webhooks-tray` com CAPI |
| 27/05 | Auto-refresh de token + função agendada |
| 27/05 | Migração do storage de token: Netlify Blobs → Supabase |
| 28/05 | Fix do check de status aprovado + dedup do CAPI |

---

## Referências

- [[Meta CAPI — Configuração Tray Ecommerce]] — estratégia completa de tracking (Pixel + CAPI + GA4 + LP)
- [[Tray - Webhook Deploy Guide]] — passo a passo de deploy e setup
- [[Tray - Webhooks]] — eventos e formato de payload da Tray
- [[Tray - Autenticação]] — credenciais e tokens da Tray
- Snapshot do código: `tray-webhook-function.js` (nesta pasta)
- Repo: `github.com/heziom/heziom-api`
