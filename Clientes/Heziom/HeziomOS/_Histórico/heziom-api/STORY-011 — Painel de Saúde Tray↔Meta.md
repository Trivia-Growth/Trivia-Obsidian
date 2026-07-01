---
id: STORY-011
titulo: "Painel de Saúde — Integração Tray ↔ Meta"
fase: 1
modulo: heziom-api / painel
status: review
prioridade: média
agente_responsavel: "@dev (Dex)"
criado: 2026-05-28
atualizado: 2026-05-28
---

# STORY-011 — Painel de Saúde (Integração Tray ↔ Meta)

## Status
`Review` — código implementado, migração aplicada e deploy feito (commit `b6d1a8c` em `main` → Netlify publica). **Falta só:** setar `PANEL_STATS_SECRET` no Netlify + ver 1 pedido real aparecer no `/painel` pra fechar o gate.

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

- [x] **T1 — Instrumentar dados no webhook + migração Supabase** *(AC: 7)*
  - [~] T1.1 — SQL da migração: tabela nova `tray_event_metrics` (decisão JG). **SQL entregue abaixo (Migração Supabase) — JG executa; não aplico DDL.**
  - [x] T1.2 — `processOrderForCAPI()` captura `order.status` e `order.total`/`partial_total`.
  - [x] T1.3 — Após `sendCAPIEvent()` (que agora retorna `{ok,error}`), grava `capi_status` (ok/falha), `capi_sent_at` e `error`.
  - [x] T1.4 — Status que não dispara → `capi_status='pulado'` com `order_status`. Falha ao buscar na Tray → `capi_status='falha'` com mensagem.
  - [x] T1.5 — `recordMetric` grava só status/valor/resultado — sem PII.
- [x] **T2 — Endpoint read-only `GET /api/health-stats`** *(AC: 1, 5)*
  - [x] T2.1 — `netlify/functions/health-stats.js`, valida `X-Panel-Secret` (fail-closed: 500 sem env, 401 sem header).
  - [x] T2.2 — Agregados: counts 24h/7d, token (sem expor o token), latência média, cobertura, erros recentes, conciliação, breakdown.
  - [x] T2.3 — Nunca `select` em `raw_payload`/`access_token`/`refresh_token`. Validado no smoke test.
  - [x] T2.4 — `/api/*` já roteia pro function; sem redirect extra.
- [x] **T3 — Painel HTML server-side na heziom-api** *(AC: 2, 3, 4)*
  - [x] T3.1 — `netlify/functions/health-panel.js` serve o HTML (CSS portado verbatim do mockup, tema claro/escuro + persistência).
  - [x] T3.2 — SSR consome `/api/health-stats` no servidor; segredo nunca vai pro cliente. Acesso por senha + cookie HMAC.
  - [x] T3.3 — Banner de homologação (até 13/08/2026) e indicadores do recorte aprovado.
- [x] **T4 — Documentação** *(AC: 6)*
  - [x] T4.1 — `specs/technical/API_SPECIFICATION.md` (endpoints + tabela).
  - [x] T4.2 — `architecture.md` (mermaid, estrutura, ADR-004, segurança). Também `PROJECT_REQUIREMENTS.md` e `SECURITY_DEBT.md`.

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

## Migração Supabase (projeto `eqsjvacbhrezlgqpwipv`)

> ✅ **Aplicada em 2026-05-28** (JG autorizou e forneceu token; rodada via Management API, HTTP 201). Tabela `tray_event_metrics` criada com RLS ligado.

```sql
create table if not exists tray_event_metrics (
  order_id            text primary key,
  order_status        text,
  order_value         numeric,
  capi_status         text,          -- 'ok' | 'falha' | 'pulado'
  capi_sent_at        timestamptz,
  webhook_received_at timestamptz,
  error               text,
  updated_at          timestamptz default now()
);
-- mesma postura das outras tabelas: RLS ligado, sem policy de usuário (acesso só via service_role)
alter table tray_event_metrics enable row level security;
```

---

## Change Log

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 2026-05-28 | 0.1 | Story criada no template do vault | @sm |
| 2026-05-28 | 1.0 | Reformatada no template TRIVIAIOX (story-template-v2); decisão "painel completo" + HTML standalone; tasks T1–T4 mapeadas aos CAs | @sm |
| 2026-05-28 | 1.1 | Implementação T1–T4 (instrumentação, endpoint, painel SSR, docs); smoke tests OK; status → Review | @dev |
| 2026-05-28 | 1.2 | Migração `tray_event_metrics` aplicada (Management API, HTTP 201); commit `b6d1a8c` em `main` → deploy Netlify | @dev |
| 2026-05-28 | 1.3 | ADR-005: login por email+senha do superadmin + `/painel/primeiro-acesso` (token de uso único, senha em scrypt); tabela `panel_users` criada (HTTP 201) + token semeado; commit `7ded098` | @dev |
| 2026-05-28 | 1.4 | ADR-006: resiliência do token Tray — cron de hora em hora garantido no `netlify.toml`; self-heal no webhook (renova token e refaz busca 1×); fuso da validade corrigido (GMT-3) → painel para de mostrar "vencido" à toa; tema instantâneo. commit `41c77cf` em `main` → deploy Netlify | @dev |
| 2026-05-29 | 1.5 | ADR-006 reforçado: validade do token convertida para **UTC ISO na gravação** (`trayExpiryToUtc()` em `tray-token-refresh.js` e self-heal do `webhooks-tray.js`) — corrige o card "vencido" mesmo com build antigo da função de leitura na Netlify. Deploy confirmado (resposta em `...Z`), token regravado com 3h de validade. commit `772b7b3` em `main` → deploy Netlify | @dev |

---

## Dev Agent Record
> ⚠️ Preenchido pelo @dev.

**Agent Model Used:** Claude (atuando como @dev/Dex no ciclo TRIVIAIOX)

**Debug Log References:** smoke tests locais (`node --check` nas 3 functions; render do painel com dados mock; agregação do endpoint com Supabase mockado).

**Completion Notes List:**
- T1: `webhooks-tray.js` instrumentado com `recordMetric()` (upsert por `order_id` em `tray_event_metrics`). `sendCAPIEvent()` passou a retornar `{ok,error}`. Fluxo de CAPI/dedup intacto — só **acrescentei** gravação de métrica (sem PII).
- T2: `health-stats.js` — fail-closed, agregados 24h/7d, token sem expor segredo. Validado: 401 sem header; sem `access_token`/`refresh_token`/`raw_payload` no JSON; cobertura/valor/latência corretos no teste.
- T3: `health-panel.js` — SSR + login por senha + cookie HMAC (`timingSafeEqual`). CSS portado verbatim do mockup aprovado. Validado: login/senha errada(401)/senha certa(302+cookie)/cookie adulterado→login; painel renderiza sem vazar o segredo; HTML escapado (anti-injeção).
- Decisões JG aplicadas: tabela nova `tray_event_metrics`; acesso por segredo server-side (padrão máquina-a-máquina do repo, ADR-003).
- **Pendências pro deploy:** (1) JG roda o SQL acima; (2) setar env `PANEL_STATS_SECRET` no Netlify; (3) push → deploy. Dados do painel só aparecem conforme novos webhooks chegam.

**File List:**
- `netlify/functions/webhooks-tray.js` (M) — instrumentação T1
- `netlify/functions/health-stats.js` (A) — endpoint T2
- `netlify/functions/health-panel.js` (A) — painel SSR T3
- `netlify.toml` (M) — rota `/painel`
- `.env.example` (M) — `PANEL_STATS_SECRET`
- `PROJECT_REQUIREMENTS.md`, `architecture.md`, `specs/technical/API_SPECIFICATION.md`, `SECURITY_DEBT.md` (M) — docs T4

---

## QA Results
> ⚠️ Preenchido pelo @qa.

**Gate:** `CONCERNS` — código aprovado em smoke test; gate vira `PASS` após validação ao vivo (SQL rodado + env setada + 1 pedido real rastreado no painel).

**Checklist:**
- [x] CA1/CA5 — endpoint só agregados, fail-closed, 401 sem credencial (testado)
- [x] CA2/CA5 — painel SSR consome o endpoint; segredo/PII não vão pro navegador (testado: sem leak do segredo no HTML)
- [x] CA3 — tema claro/escuro com persistência (CSS + JS portados do mockup)
- [x] CA4 — banner de homologação até 13/08/2026 no header
- [x] CA6 — docs atualizadas no mesmo commit
- [x] CA7 — webhook instrumentado sem mexer no caminho de CAPI/dedup; migração registrada (SQL acima)
- [x] Sem regressão no webhook: caminho feliz, status que não dispara (`pulado`) e erro (`falha`) cobertos pelas branches
- [ ] **Validação ao vivo pendente:** SQL aplicado + `PANEL_STATS_SECRET` setada + 1 pedido real refletido no `/painel`

**Ressalvas (débito conhecido):** login do `/painel` sem rate-limit (SEC-003 atualizado) — mitigado por senha forte + cookie HMAC.
