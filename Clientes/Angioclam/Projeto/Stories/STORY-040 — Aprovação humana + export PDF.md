---
id: STORY-040
titulo: "Aprovação humana + export PDF"
fase: 4
modulo: "report"
status: concluido
prioridade: alta
agente_responsavel: "claude"
criado: 2026-05-18
atualizado: 2026-05-18
---

# STORY-040 — Aprovação humana + export PDF

## Contexto

Fase 4: gate humano antes da entrega. Fluxo de status + export PDF do
relatório aprovado + regra travada de cor por operadora.

## Critérios de Aceite

- [x] CA1 — Migration: `reports.status` ∈ (rascunho|calculado|em_revisao|
  aprovado) + `aprovado_por`/`aprovado_em`
- [x] CA2 — Edge Function `set-report-status`: JWT+papel; `aprovado` só
  superadmin; grava aprovador + audit; 422 inválido / 404 inexistente
- [x] CA3 — UI (mockup validado: barra junto do "Salvar oficial"): badge de
  status + Enviar p/ revisão / Aprovar (superadmin) / Reabrir / Exportar PDF
- [x] CA4 — Export PDF = impressão do HTML print-ready (ADR-009); habilita só
  com `aprovado`
- [x] CA5 — Regra travada: SulAmérica `#771F1F` (nunca azul) — teste
- [x] CA6 — 52 testes verdes; build + lint; deploy + E2E produção

## Implementação

**Status:** `concluido`

**Arquivos:** `supabase/migrations/20260518205940_fase4_aprovacao.sql`,
`supabase/functions/set-report-status/index.ts`,
`src/features/report/api/useSetStatus.ts`,
`src/features/report/components/ReportPage.tsx`, `buildHtml.test.ts` (cor).

## QA

**Gate:** `PASS`

**E2E produção (2026-05-18):** criar→em_revisao→aprovado (aprovado_por/_em
preenchidos) →reabrir (limpa aprovador); status inválido 422; inexistente 404;
limpeza ok. Export só habilita aprovado. Audit registra cada transição
(imutável).

## Notas e Decisões

- `2026-05-18` — ADR-009. PDF por impressão (sem Chromium no Edge; máxima
  fidelidade do design vetorial). Papéis: analista/superadmin enviam p/
  revisão; só superadmin aprova/reabre.
