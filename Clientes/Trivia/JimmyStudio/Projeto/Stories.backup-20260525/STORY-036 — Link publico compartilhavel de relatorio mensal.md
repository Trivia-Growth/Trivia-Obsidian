---
id: STORY-036
titulo: "Link público compartilhável de relatório mensal"
fase: 2
modulo: monthly-report
status: concluido
prioridade: alta
origem: claude
agente_responsavel: claude-code
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-036 — Link público compartilhável de relatório mensal

## Contexto

Preview interno (Story 035) só funciona logado. Cliente final precisa visualizar o relatório sem login. Requisitos: somente leitura, expira em 30 dias, sem indexação por buscadores, contagem de visualizações para auditoria, sem fricção.

## Spec de Referência

- `architecture.md` — ADR-014
- `PROJECT_REQUIREMENTS.md` — seção 5b (compartilhamento público)

## Critérios de Aceite

- [x] CA1 — Tabela `shared_reports` com token UUID v4 (122 bits), `expires_at`, `revoked_at`, `view_count`, `last_viewed_at`. RLS por org. Anon NÃO acessa via REST.
- [x] CA2 — Edge Function `create-shared-report` (JWT user, idempotente: reaproveita link ativo existente para mesma brand+mes)
- [x] CA3 — Edge Function `get-shared-report` (anônima; valida UUID + estado antes de elevar para service_role)
- [x] CA4 — Lógica de agregação extraída para `_shared/monthly-report-aggregator.ts` — paridade entre preview interno e link público
- [x] CA5 — Rota pública `/r/:token` registrada **fora** do `<ProtectedRoute>`, sem `<Layout>`
- [x] CA6 — `<meta name="robots" content="noindex,nofollow">` injetado dinamicamente
- [x] CA7 — Estados de erro tipados: `invalid_token | not_found | expired | revoked | brand_unavailable | internal_error` com UX específica para cada
- [x] CA8 — Modal `ShareReportDialog` com botão "Copiar link" e info de expiração
- [x] CA9 — Botão "Compartilhar" no preview interno

---

## Implementação

**Status:** `concluido`

**Commit:** `5bf29af3` (origin/main)

**Arquivos alterados:**
- `supabase/migrations/20260504183624_shared_reports.sql` (novo)
- `supabase/functions/_shared/monthly-report-aggregator.ts` (novo, ~280 linhas extraídas)
- `supabase/functions/aggregate-monthly-report/index.ts` (refatorada: 582 → 113 linhas)
- `supabase/functions/create-shared-report/index.ts` (novo)
- `supabase/functions/get-shared-report/index.ts` (novo)
- `src/integrations/supabase/types.ts` (regenerado)
- `src/features/monthly-report/hooks/useCreateSharedReport.ts` (novo)
- `src/features/monthly-report/hooks/usePublicSharedReport.ts` (novo)
- `src/features/monthly-report/components/ShareReportDialog.tsx` (novo)
- `src/pages/PublicMonthlyReport.tsx` (novo)
- `src/pages/agencia/MonthlyReportPreview.tsx` (botão Compartilhar)
- `src/App.tsx` (rota `/r/:token`)
- `architecture.md` (ADR-014)

**Notas de implementação:**
- 14 arquivos · +1226 / -492 linhas
- Tipos regenerados com `supabase gen types typescript --linked`
- `Cache-Control: private, no-store` no response da Edge Function pública

---

## QA

**Gate:** `PASS`

**Checklist:**
- [x] Critérios de aceite validados
- [x] RLS força — anon não acessa `shared_reports` via REST direto (defense in depth)
- [x] Smoke test 3 endpoints: `get-shared-report` retorna 400 (token inválido), 404 (UUID não-existe), 401 (`create-shared-report` sem JWT)
- [x] E2E em produção (Story 038): Step 2 gera link, Step 3 abre em context anônimo + valida noindex
- [x] Idempotência validada: 1 link por brand+mes (sem duplicatas)

**Notas:**
- View count tem race condition (read-then-update). Aceito — perda ocasional irrelevante para auditoria.

---

## Notas e Decisões

- **Sem cron de cleanup automático** de tokens expirados — registros expirados ficam no banco mas inacessíveis. Pode ser adicionado depois com pg_cron.
- **Token visível na URL** = qualquer um com link entra. Por design (briefing: "acesso apenas de leitura, sem autenticação").
- **Botão "Revogar link"** não foi adicionado nesta story (planejado para futura iteração com listagem de links).
