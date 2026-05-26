---
id: STORY-035
titulo: "Relatório Mensal por Marca — preview interno"
fase: 2
modulo: monthly-report
status: concluido
prioridade: alta
origem: claude
agente_responsavel: claude-code
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-035 — Relatório Mensal por Marca — preview interno

## Contexto

Briefing do produto: agência precisa de um modelo mensal robusto para enviar a cada marca cliente, mostrando desempenho consolidado de Instagram + LinkedIn. Função existente `send-instagram-monthly-report` cobria apenas IG, audiência interna (admin/gestor), email HTML pesado, sem comparativo, sem demografia rica, sem heatmap, sem stories.

Esta story entrega o **preview interno** (logado), base reutilizável para link público (Story 036) e PDF (Story 037).

## Spec de Referência

- `architecture.md` — ADR-013
- `PROJECT_REQUIREMENTS.md` — seção 5b

## Critérios de Aceite

- [x] CA1 — Edge Function `aggregate-monthly-report` recebe `{ brand_id, mes? }`, valida JWT contra `brand.org_id` (super_admin libera tudo), retorna payload único com IG + LinkedIn + comparativo vs mês anterior
- [x] CA2 — Unidade do relatório = brand (não org). FKs `brands.instagram_account_id` e `brands.linkedin_account_id`
- [x] CA3 — Sem persistência em DB: agregação on-demand. TanStack Query cacheia 5min no client
- [x] CA4 — Frontend Bulletproof React em `src/features/monthly-report/` com tipos compartilhados, hook `useMonthlyReport` e componentes modulares
- [x] CA5 — Página interna `/relatorio/mensal/:brandId` com seletor de mês (default = mês anterior)
- [x] CA6 — Top posts ordenados por engagement relativo a followers
- [x] CA7 — Brand sem IG ou sem LinkedIn degrada elegante (seção ausente vira `null`)
- [x] CA8 — Botão de entrada "Relatório Mensal" em `/agencia/clientes/:id`
- [x] CA9 — Heatmap de melhores horários (bucket 3h × 7 dias)

---

## Implementação

**Status:** `concluido`

**Commit:** `9002a2da` (origin/main)

**Arquivos alterados:**
- `supabase/functions/aggregate-monthly-report/index.ts` (novo)
- `src/features/monthly-report/types/report.ts` (novo)
- `src/features/monthly-report/hooks/useMonthlyReport.ts` (novo)
- `src/features/monthly-report/utils/formatters.ts` (novo)
- `src/features/monthly-report/components/MonthlyReport.tsx` (orquestrador)
- `src/features/monthly-report/components/ReportCover.tsx`
- `src/features/monthly-report/components/ExecutiveSummary.tsx`
- `src/features/monthly-report/components/InstagramSection.tsx`
- `src/features/monthly-report/components/LinkedInSection.tsx`
- `src/features/monthly-report/components/BestPostingTimes.tsx`
- `src/features/monthly-report/components/ReportFooter.tsx`
- `src/pages/agencia/MonthlyReportPreview.tsx` (novo)
- `src/pages/agencia/ClienteDetalhe.tsx` (botão "Relatório Mensal")
- `src/App.tsx` (rota `/relatorio/mensal/:brandId`)
- `PROJECT_REQUIREMENTS.md`
- `architecture.md` (ADR-013)

**Notas de implementação:**
- 16 arquivos · +1533 / -8 linhas
- Lógica de agregação foi posteriormente extraída para `_shared/monthly-report-aggregator.ts` na Story 036 para reuso entre rota autenticada e link público

---

## QA

**Gate:** `PASS`

**Checklist:**
- [x] Critérios de aceite validados
- [x] tsc + lint sem novos erros (baseline 2216 mantido)
- [x] Edge Function deployada (HTTP 401 sem JWT — esperado)
- [x] E2E em produção (validado na Story 038): Step 1 do spec carrega o preview com brand real (Francescato Family Case Management), capa, sumário, IG e LinkedIn renderizam

**Notas:**
- Comparativo agregado de "Sumário Executivo" usa só IG (se existir) ou LinkedIn como fallback. Refinamento futuro: mostrar 2 séries separadas

---

## Notas e Decisões

- **Trade-off:** on-demand é simples mas pode ficar lento para brands com 1000+ posts/mês (cenário improvável). Mitigado com staleTime 5min. Se virar gargalo, otimização via tabela cache `monthly_report_data` ou view materializada.
- **`send-instagram-monthly-report` segue ativo** (cron interno admin/gestor) — coexiste com novo fluxo. Deprecation note adicionada na Story 038.
