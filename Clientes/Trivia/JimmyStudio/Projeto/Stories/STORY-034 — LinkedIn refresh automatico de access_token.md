---
id: STORY-034
titulo: "LinkedIn — refresh automático de access_token"
fase: 2
modulo: linkedin
status: concluido
prioridade: alta
origem: claude
agente_responsavel: claude-code
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-034 — LinkedIn — refresh automático de access_token

## Contexto

`access_token` do LinkedIn expira em 60 dias e `refresh_token` em 365 dias. Antes desta story, 12 Edge Functions LinkedIn faziam `throw new Error('LinkedIn token expired. Please reconnect your account.')` quando o token vencia — sem tentar renovar, sem alertar a UI, sem job preventivo.

**Estado real em produção (snapshot pré-fix):**
- 20 contas LinkedIn ativas
- 16 com `refresh_token` armazenado
- **2 já expiradas** (cliente via dashboard quebrado)
- 4 expirando em ≤7 dias

## Spec de Referência

- `architecture.md` — ADR-012
- [LinkedIn OAuth 2.0 docs](https://learn.microsoft.com/en-us/linkedin/shared/authentication/programmatic-refresh-tokens)

## Critérios de Aceite

- [x] CA1 — Helper compartilhado `_shared/linkedin-token.ts` com `getValidLinkedInToken(supabase, account)` que refresha quando faltam ≤5min
- [x] CA2 — Helper marca `needs_reconnect=true` + grava razão em `token_refresh_error` se refresh foi rejeitado
- [x] CA3 — Helper muta `account` local pós-refresh (idiomático JS, evita re-fetch)
- [x] CA4 — 11 Edge Functions LinkedIn migradas (fetch-insights, fetch-analytics, fetch-followers, fetch-page-stats, fetch-post-details, fetch-connections, publish, reply-comment, refresh-pages, schedule-cron, sync-cron)
- [x] CA5 — Cron preventivo `linkedin-token-refresh-cron` varre tokens expirando em ≤7d e refresha em série com delay de 500ms
- [x] CA6 — UI mostra banner destrutivo quando `needs_reconnect=true`, com botão que dispara fluxo OAuth existente
- [x] CA7 — Migration aditiva: `needs_reconnect`, `last_token_refresh_at`, `token_refresh_error` em `linkedin_accounts` + índice parcial

---

## Implementação

**Status:** `concluido`

**Commit:** `d5591cb3` (origin/main)

**Arquivos alterados:**
- `supabase/migrations/20260504174224_linkedin_token_health.sql` (novo)
- `supabase/functions/_shared/linkedin-token.ts` (novo)
- `supabase/functions/linkedin-token-refresh-cron/index.ts` (novo)
- 11 Edge Functions LinkedIn modificadas
- `src/integrations/supabase/types.ts`
- `src/hooks/useLinkedInAccounts.ts`
- `src/pages/agencia/LinkedInInsights.tsx`
- `architecture.md` (ADR-012)

**Notas de implementação:**
- `linkedin-initial-sync` é orquestrador puro (chama outras Edge Functions via service_role) — não precisou de mudança
- `linkedin-oauth-callback` e `linkedin-oauth-init` geram tokens, não consomem
- Migração aplicada via `supabase db query --linked --file`
- Cron disparado uma vez manualmente após deploy: identificou 1 conta ativa sem refresh_token (Joana Stanieski) e marcou `needs_reconnect=true`

---

## QA

**Gate:** `PASS`

**Checklist:**
- [x] Critérios de aceite validados
- [x] Migration aditiva (3 ADD COLUMN), índice parcial não-bloqueante
- [x] Smoke test cron: candidates=1, refreshed=0, skipped_no_refresh_token=1 (esperado)
- [x] Banner UI funcional na página `/agencia/linkedin-insights` quando conta tem `needs_reconnect=true`
- [x] Edge Functions todas deployadas e respondendo

**Notas:**
- Helper retorna o token novo + muta o objeto `account` (caller que lê `account.token_expires_at` depois pega valor atualizado — usado em `linkedin-refresh-pages`)
- Trade-off documentado em ADR-012: cron precisa de agendamento externo (Supabase Scheduled Functions ou pg_cron) — deploy do código não cria schedule

---

## Notas e Decisões

- **Cron NÃO foi agendado** — fica como pendência manual do dev humano. Sugestão: `0 4 * * *` UTC.
- Sem agendamento, helper ainda funciona on-demand: a primeira chamada de qualquer Edge Function LinkedIn no dia já refresha automaticamente. Cron é otimização preventiva, não pré-requisito.
- Sem retry com backoff em caso de erro 5xx do LinkedIn — adicionar se cron mostrar falhas transitórias frequentes.
