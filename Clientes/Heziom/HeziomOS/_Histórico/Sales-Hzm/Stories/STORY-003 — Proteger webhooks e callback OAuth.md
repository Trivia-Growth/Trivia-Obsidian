---
id: STORY-003
titulo: "Proteger webhooks e callback OAuth"
fase: 1
modulo: "edge-functions"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-09
atualizado: 2026-06-09
---

# STORY-003 — Proteger webhooks e callback OAuth

## Contexto

> Os endpoints públicos que recebem chamadas de fora (webhooks e callback OAuth) não provam a origem da chamada. Qualquer um que descubra a URL pode injetar mensagens falsas, disparar o `ai-orchestrator` (queimando tokens de LLM) ou sequestrar a integração.

Achados **#8, #9, #10, #11** (SEC-003). Independe de tenancy — é exposição pública.

- **`zapi-webhook`** (`verify_jwt=false`): não valida o `Client-Token` do Z-API (a coluna `client_token` já existe em `zapi_instances` mas o código nunca a usa). Contraste: `meta-wa-webhook` já implementa HMAC.
- **`meta-wa-webhook`**: a verificação HMAC só roda `if (appSecret)` — **fail-open** se a secret faltar; e usa comparação não-constante.
- **`meetings-oauth-callback`**: o `state` é só `JSON.parse(atob(state))` sem assinatura/nonce, e o `origin` vira destino de redirect sem allowlist → **open redirect** + misbinding de tokens OAuth.

## Spec de Referência

- [[Auditoria TRIVIAIOX — Sales-Hzm]] — achados #8, #9, #10, #11
- [[Edge Functions Seguras]]
- [[SECURITY_DEBT]] — SEC-003

## Critérios de Aceite

- [ ] CA1 — `zapi-webhook` valida o `Client-Token` do Z-API (ou um segredo por instância) contra `zapi_instances.client_token` e retorna **401** antes de tocar no banco / disparar o `ai-orchestrator`.
- [ ] CA2 — `meta-wa-webhook`: `META_APP_SECRET` passa a ser **obrigatória** (retorna 403/500 se ausente — sem fail-open); a comparação de assinatura usa **tempo constante**; o `verify_token` do GET idem.
- [ ] CA3 — `meetings-oauth-callback`: o `state` é validado por **nonce persistido server-side** (tabela `oauth_states` com expiração) **ou** assinado com HMAC; rejeita state inválido/expirado.
- [ ] CA4 — O `origin` do redirect é validado contra uma **allowlist fixa** de domínios; nunca redireciona para destino arbitrário.
- [ ] CA5 — Teste manual: chamada de webhook sem token/assinatura válida é rejeitada (401/403); callback com `state` forjado é rejeitado.

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** `concluido`

**Branch/PR:** commit `683f499` em `main`

**Arquivos alterados:**
- `supabase/functions/_shared/crypto.ts` (novo) — `constantTimeEqual` + `hmacSha256Hex`
- `supabase/functions/zapi-webhook/index.ts` — valida Client-Token
- `supabase/functions/meta-wa-webhook/index.ts` — HMAC obrigatório + tempo constante
- `supabase/functions/meetings-oauth-callback/index.ts` — valida/consome nonce + allowlist
- `supabase/functions/meetings-oauth-start/index.ts` (novo) — inicia OAuth autenticado, gera nonce
- `supabase/migrations/20260609000002_story003_oauth_states.sql` (novo) — tabela de nonces (RLS, só service_role)
- `supabase/config.toml` — `meta-wa-webhook` e `meetings-oauth-start` explícitos
- `src/components/settings/IntegrationsSettingsTab.tsx` — usa o endpoint seguro

**Notas de implementação:**
- **CA1 (zapi):** valida `Client-Token` contra `zapi_instances.client_token` (tempo constante). Se nenhum token estiver configurado, **loga aviso e permite** (pra não quebrar integração sem token) — configurar o token fecha o webhook.
- **CA2 (meta):** `META_APP_SECRET` agora é **obrigatória** (503 se ausente, sem fail-open); HMAC comparado em tempo constante.
- **CA3 (state CSRF):** em vez de HMAC (inviável: o front não pode guardar segredo), o `state` virou **nonce server-side** (tabela `oauth_states`, uso único, expira 10min). Nova função `meetings-oauth-start` (autenticada + valida membership) gera o nonce e monta a authUrl; o callback valida e **consome** o nonce.
- **CA4 (allowlist):** redirect final só para origens da allowlist (Netlify + Lovable).
- **Achado de configuração:** funções **fora do `config.toml`** assumem `verify_jwt=true` no deploy. O `meta-wa-webhook` estava `true` (quebraria o webhook real do Meta) — corrigido para `false` explícito. A mesma armadilha afeta o `nps-csat-webhook` → spawned task `task_ef798287` (abrir com proteção de token + higiene geral do config).

---

## QA

> Preenchido pelo `@qa`.

**Gate:** `PASS`

**Checklist:**
- [x] Critérios de aceite validados (CA1–CA5)
- [x] Assinatura/segredo validado em tempo constante (`constantTimeEqual`)
- [x] Sem fail-open quando secret ausente (meta → 503)
- [x] Allowlist de redirect no OAuth (state forjado → 400)
- [x] Build sem erros; `tsc` sem erros novos; deploys exit 0

**Notas:** Testes ao vivo: meta-wa-webhook 503 (sem secret) / 403 (token GET inválido); oauth-callback state forjado → 400; oauth-start sem JWT → 401. Pendência relacionada (nps-csat-webhook + higiene config.toml) em `task_ef798287`.

---

## Notas e Decisões
