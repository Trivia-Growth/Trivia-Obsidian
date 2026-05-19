---
id: STORY-008
titulo: "Edge Function recompute-report + schema Supabase"
fase: 1
modulo: "backend"
status: concluido
prioridade: alta
agente_responsavel: "claude"
criado: 2026-05-18
atualizado: 2026-05-18
---

# STORY-008 — Edge Function recompute-report + Supabase

## Contexto

Regra Trivia: valores oficiais recalculados no backend, não confiando só no
cliente. A Edge Function recebe os KPIs, **re-deriva os consolidados** dos
indicadores (defesa em profundidade, ADR-002) e persiste o relatório.

## Critérios de Aceite

- [x] CA1 — Migration `app_users`, `operadoras` (seed 8), `reports`
- [x] CA2 — RLS + `FORCE ROW LEVEL SECURITY` nas 3 tabelas; policies por papel
- [x] CA3 — `is_superadmin`/`pode_gerar` SECURITY DEFINER (sem recursão de RLS)
- [x] CA4 — Edge Function: CORS, JWT via `auth.getUser()`, Zod, rate-limit
- [x] CA5 — Recálculo autoritativo ignora consolidado do cliente
- [x] CA6 — Teste de paridade backend reproduz consolidados do JSON de referência
- [x] CA7 — `supabase db push` aplicado + `functions deploy recompute-report` (com JWT) — projeto `zsksbhfdwlcwxlhdnaxp`

---

## Implementação

**Status:** `concluido` (código) · deploy pendente

**Arquivos:** `supabase/migrations/20260518132350_reports_core.sql`,
`supabase/functions/_shared/recompute.ts` (+ `.test.ts`),
`supabase/functions/recompute-report/index.ts`.

**Notas:** Projeto Supabase linkado: `zsksbhfdwlcwxlhdnaxp` (já integrado ao
GitHub). `recompute.test.ts` valida paridade backend (32 testes no total verdes).

---

## QA

**Gate:** `PASS` — código + deploy OK. Falta só teste manual end-to-end com usuário logado.

**Checklist:**
- [x] RLS + FORCE em todas as tabelas criadas
- [x] Zod + JWT + rate-limit na Edge Function
- [x] `npm audit` sem Critical/High; lint limpo; build OK
- [x] `supabase db push` executado (migration aplicada, "Remote database is up to date")
- [x] `supabase functions deploy recompute-report` executado (com verificação JWT)
- [ ] Teste manual: rejeita sem JWT / payload inválido / rate-limit (após criar 1º superadmin)

---

## Notas e Decisões

- `2026-05-18` — `app_users` começa vazia: criar 1º `superadmin` manualmente
  (`INSERT INTO app_users …`) após o primeiro login no Supabase Auth.
- Frontend ainda não chama a Edge Function (Fase 1 calcula no client). A
  integração `useReport` → `recompute-report` para gravar o oficial é o próximo
  passo (pequena STORY de wiring) — não bloqueia a fatia vertical.
- SEC-004: rate-limit é em memória (instância quente); solução robusta pendente.
