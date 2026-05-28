---
id: STORY-011
titulo: "Painel de Saúde — Integração Tray ↔ Meta"
fase: 1
modulo: heziom-api / painel
status: approved
prioridade: média
agente_responsavel: "@dev (Dex)"
criado: 2026-05-28
atualizado: 2026-05-28
---

# STORY-011 — Painel de Saúde (Integração Tray ↔ Meta)

## Status
`Approved`

> Fluxo TRIVIAIOX: `@sm` (story) → `@dev` (Diff Plan + implementação) → `@qa` (gate) → push.
> Story mora no vault (padrão da STORY-010), não em `docs/stories/`.

---

## Story

**Como** operação da Heziom (não-técnica),
**eu quero** um painel visual que mostre de relance se a integração Tray → Meta está saudável (token válido, webhooks chegando, compras sendo rastreadas no CAPI, erros em linguagem clara),
**para que** eu consiga responder "a Tray aprovou um pedido → o Meta recebeu o evento?" sem precisar abrir os logs do Netlify nem o Events Manager do Meta.

---

## Critérios de Aceite

1. **CA1** — Endpoint `GET /api/health-stats` protegido por segredo (header `X-Panel-Secret`), retornando **só agregados** (contagens, status, validade do token, latência, cobertura). Nunca o token, nunca PII, nunca `raw_payload`.
2. **CA2** — Painel renderiza os indicadores do recorte aprovado consumindo o endpoint (server-side render: o segredo e a service key **nunca** vão pro navegador).
3. **CA3** — Tema claro/escuro com persistência (padrão visual da LP `LPplanobomba`).
4. **CA4** — Banner de homologação (loja de teste, até 13/08/2026) visível no painel.
5. **CA5** — Segurança: nenhum segredo/PII trafega pro navegador; o endpoint nega acesso (401) sem credencial válida.
6. **CA6** — Documentação atualizada (`specs/technical/API_SPECIFICATION.md`, `architecture.md`) no mesmo commit da implementação.
7. **CA7** — `webhooks-tray.js` instrumentado **sem quebrar o fluxo atual** (caminho feliz + status que não dispara CAPI); migração Supabase registrada como SQL versionado (JG executa o DDL — o @dev não aplica).

---

## Tasks / Subtasks

- [ ] **T1 — Instrumentar dados no webhook + migração Supabase** *(AC: 7)*
  - [ ] T1.1 — Escrever SQL da migração: novas colunas em `tray_webhook_log` (`order_status text`, `order_value numeric`, `capi_status text` — `ok`/`falha`/`pulado`/`null`, `capi_sent_at timestamptz`, `error text`). Entregar o SQL pro JG rodar (não aplicar DDL via código).
  - [ ] T1.2 — Em `processOrderForCAPI()`, capturar `order.status` e `order.total`/`partial_total` e gravar no log via PATCH.
  - [ ] T1.3 — Após `sendCAPIEvent()`, gravar `capi_status` (ok/falha conforme `res.ok`), `capi_sent_at` (timestamp) e `error` (mensagem curta em caso de falha).
  - [ ] T1.4 — Para status que não dispara CAPI, gravar `capi_status='pulado'` com `order_status` preenchido (habilita "aprovados sem rastreio").
  - [ ] T1.5 — Garantir que nenhum dado novo gravado contenha PII (só status, valor e resultado — sem nome/email/telefone do cliente).
- [ ] **T2 — Endpoint read-only `GET /api/health-stats`** *(AC: 1, 5)*
  - [ ] T2.1 — Nova function `netlify/functions/health-stats.js`, validação de segredo no header `X-Panel-Secret` (espelhar o padrão de `tray-token-seed.js`; 401 sem credencial).
  - [ ] T2.2 — Queries agregadas no Supabase (counts por janela, status/validade do token sem expor o token, latência média webhook→CAPI, taxa de cobertura, erros recentes já sanitizados).
  - [ ] T2.3 — **Nunca** `select` em `raw_payload`, `access_token`, `refresh_token`. Retornar JSON só com agregados.
  - [ ] T2.4 — Redirect/rota: confirmar caminho `/api/health-stats` no `netlify.toml`.
- [ ] **T3 — Painel HTML server-side na heziom-api** *(AC: 2, 3, 4)*
  - [ ] T3.1 — Function que serve o HTML do painel (server-side render), portando o visual aprovado do mockup (LP + tema claro/escuro + persistência).
  - [ ] T3.2 — O HTML/JS chama o endpoint sem nunca embutir o segredo no cliente (decidir: render server-side já com os dados, ou proxy interno que injeta o segredo).
  - [ ] T3.3 — Banner de homologação (até 13/08/2026) e os indicadores do recorte aprovado.
- [ ] **T4 — Documentação** *(AC: 6)*
  - [ ] T4.1 — Atualizar `specs/technical/API_SPECIFICATION.md` (endpoint novo + painel).
  - [ ] T4.2 — Atualizar `architecture.md` (fluxo do painel, segurança, colunas novas).

---

## Dev Notes

> ⚠️ Contexto completo pro `@dev`. **Diff Plan obrigatório antes de implementar** (regra do repo). Mudanças mínimas. Documentação no mesmo commit. `git pull --rebase` antes do push.

### Arquitetura de segurança (inegociável)
O painel **nunca** lê o Supabase direto do navegador. `tray_tokens` guarda segredos (access/refresh token) e `raw_payload` guarda PII de cliente (LGPD). O painel consome **só agregados não-sensíveis** via endpoint read-only protegido por segredo. Nunca o token em si, nunca PII. A service key do Supabase e o `X-Panel-Secret` ficam **só no server-side** (Netlify Function), jamais no cliente.

### O que o banco guarda HOJE (levantamento)

**`tray_webhook_log`** (gravado por `webhooks-tray.js`): `scope_name`, `scope_id`, `action`, `seller_id`, `app_code`, `raw_payload` (só o ping do webhook — **não** o pedido completo), `processed` (bool), `created_at`.

**`tray_tokens`**: `store_key`, `access_token`, `refresh_token`, `expires_at`, `refreshed_at`.

| Indicador do mockup | Dá pra entregar hoje? | Observação |
|---|---|---|
| Webhooks recebidos | ✅ | `count` por janela |
| Compras rastreadas (CAPI) | ✅ | `count` de `order/update` com `processed=true` |
| Webhooks deduplicados | ✅ | pedidos com N webhooks → 1 processado |
| Status / validade do token | ✅ | de `tray_tokens` (sem expor o token) |
| Webhooks por status | ⚠️ parcial | só por `scope/action`; o status do pedido na Tray não é gravado HOJE → T1 resolve |
| Aprovados sem rastreio | ❌ hoje | status do pedido não é salvo; `processed=false` ≠ "aprovado e não rastreado" → T1 resolve |
| Valor rastreado (R$) | ❌ hoje | `total` do pedido é buscado na Tray mas **não é salvo** → T1 resolve |
| Latência webhook → CAPI | ❌ hoje | não há timestamp de "CAPI disparado" → T1 (`capi_sent_at`) resolve |
| Taxa de cobertura | ❌ hoje | falta a base de "aprovados" pra comparar → T1 resolve |
| Erros (24h) / erros recentes | ❌ hoje | erros só vão pro `console.log` do Netlify → T1 (`error`) resolve |
| Qualidade (EMQ) | ❌ (externo) | vem do Events Manager do Meta, não do banco local |

**Conclusão:** o painel completo exige instrumentar o webhook (T1). Sem isso, só dá MVP fino. Decisão tomada com JG: **painel completo** (T1 + T2 + T3).

### Pontos técnicos do `webhooks-tray.js` (alvo da T1)
- `getTrayToken()` lê `tray_tokens?store_key=eq.default&select=access_token`.
- Handler loga via `logToSupabase(payload)` (hoje: scope_name, scope_id, action, seller_id, app_code, raw_payload, processed:false).
- `processOrderForCAPI(scope_id)` roda só quando `scope_name === "order" && act === "update"`: dedup (processed=eq.true), busca pedido completo na Tray (`order.status`, `order.total`/`order.partial_total`), checa `approvedStatuses`, chama `sendCAPIEvent(order, orderId)`, depois PATCH `processed:true`.
- `sendCAPIEvent` monta userData com PII em SHA256, posta em `graph.facebook.com/v19.0/{PIXEL_ID}/events`, sabe `res.ok`.
- Status aprovados que disparam Purchase (via `.includes()`): "a enviar", "a enviar master", "a enviar vindi", "enviado", "finalizado", "entregue", "aprovado", "approved", "payment_confirmed".

### Padrão de validação de segredo (alvo da T2)
Espelhar `tray-token-seed.js`:
```
const secret = event.headers["x-panel-secret"];
if (PANEL_SECRET && secret !== PANEL_SECRET) return { statusCode: 401, ... };
```
Definir nova env var (ex.: `PANEL_STATS_SECRET`). `.env` é gitignored — nunca commitar.

### Restrições do projeto
- heziom-api: Node Netlify Functions, **zero dependências** (só `crypto` nativo + `fetch` global), CommonJS.
- Supabase `eqsjvacbhrezlgqpwipv` (sa-east-1), via REST/PostgREST com service_role. **Tabelas geridas manualmente** — @dev entrega SQL, JG roda; @dev não aplica DDL.
- Homologação: TRAY_API_HOST aponta pra loja de teste (intencional) até **13/08/2026**. Produção = `www.editoraheziom.com.br`, loja **1345958**.
- TRIVIAIOX `frameworkProtection`: não editar `.triviaiox-core/core/**`, tasks, templates, checklists, workflows.
- Memória: nunca usar "Claude" em dados de teste visíveis a terceiros.

### Spec de referência
- [[heziom-painel-saude-tray-meta-mockup]] — mockup visual aprovado (claro/escuro)
- [[heziom-api — Referência Técnica]]
- [[Tray - Webhook Deploy Guide]]
- [[Meta CAPI — Configuração Tray Ecommerce]]
- [[STORY-010 — Padronização do repo heziom-api]]

### Testing
- Sem framework de teste no repo (zero deps). Validação manual + revisão de Diff.
- Caminho feliz: webhook de `order/update` com status aprovado → CAPI dispara → log grava `order_status`, `order_value`, `capi_status='ok'`, `capi_sent_at`.
- Caminho "pulado": status não-aprovado → não dispara CAPI → log grava `capi_status='pulado'` sem erro.
- Caminho erro: forçar falha no CAPI (`res.ok=false`) → log grava `capi_status='falha'` + `error`.
- Dedup: 2º webhook do mesmo pedido não reprocessa.
- Segurança: `GET /api/health-stats` sem header → 401; com header correto → JSON só com agregados (grep no payload por token/email/raw_payload deve dar vazio).
- Regressão: confirmar que o fluxo atual de CAPI não muda comportamento.

---

## Change Log

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 2026-05-28 | 0.1 | Story criada no template do vault | @sm |
| 2026-05-28 | 1.0 | Reformatada no template TRIVIAIOX (story-template-v2); decisão "painel completo" + HTML standalone; tasks T1–T4 mapeadas aos CAs | @sm |

---

## Dev Agent Record
> ⚠️ Preenchido pelo @dev.

**Agent Model Used:**
**Debug Log References:**
**Completion Notes List:**
**File List:**

---

## QA Results
> ⚠️ Preenchido pelo @qa.

**Gate:** `—`
**Checklist:**
- [ ] Critérios de aceite (CA1–CA7) validados
- [ ] Sem segredo/PII no navegador nem no payload do endpoint
- [ ] Endpoint nega acesso sem credencial (401)
- [ ] Sem regressão no webhook (caminho feliz + status que não dispara + erro)
- [ ] Migração Supabase registrada e executada
- [ ] Docs atualizadas no mesmo commit
