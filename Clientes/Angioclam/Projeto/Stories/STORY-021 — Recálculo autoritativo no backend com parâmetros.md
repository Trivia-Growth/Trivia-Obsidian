---
id: STORY-021
titulo: "Recálculo autoritativo no backend com parâmetros (sem PII)"
fase: 2
modulo: "backend"
status: concluido
prioridade: alta
agente_responsavel: "claude"
criado: 2026-05-18
atualizado: 2026-05-18
---

# STORY-021 — Recálculo autoritativo no backend com parâmetros

## Contexto

Limitação da STORY-020: a Edge Function só re-derivava consolidados; a
matemática dos indicadores e os parâmetros eram aplicados no cliente. Os números
persistidos confiavam no cálculo do cliente. Corrigir mantendo PII fora do
backend.

## Solução (ADR-007)

Os parâmetros só entram na etapa final do motor. O cliente extrai um
**AggregadoBruto PII-free** (~1,5 KB de contagens/somas; sem nome/id de
paciente) e envia só ele. A Edge Function carrega o `report_parameters` ativo
da operadora e roda `calcularKpis` (fonte única `@motor-core`) para gerar
indicadores/consolidados autoritativos. PII nunca trafega.

## Critérios de Aceite

- [x] CA1 — `@motor-core` puro (Deno-safe) com `calcularKpis`/`mergeParams`/
  `DEFAULT_PARAMS`/`AggregadoBruto`; alias `@motor-core` no Vite/TS/Vitest
- [x] CA2 — `gerarAggregado` (PII-free) + `gerarKpis = calcularKpis(agg,merged)`;
  `rodarMotor` retorna `aggregado`; `MOTOR_VERSAO=v2-ts-2.0`
- [x] CA3 — Edge Function: body `{aggregado,...}`, resolve operadora →
  `report_parameters` ativo (ou default), `calcularKpis` autoritativo, persiste
  `reports` + `parameter_set_id` + audit `report/create`
- [x] CA4 — `useSaveReport` envia agregado; UI mostra kpis oficiais do backend
- [x] CA5 — 44 testes verdes (paridade núcleo == cliente == referência; agregado
  PII-free; params alteram resultado); build + lint
- [x] CA6 — Deploy + E2E produção

## Implementação

**Status:** `concluido`

**Arquivos:** `supabase/functions/_shared/motor-core.ts` (novo, fonte única),
`recompute-report/index.ts` (reescrito), `src/lib/motor/{kpis,index,constants}.ts`,
`src/types/motor.ts`, `vite.config.ts`, `vitest.config.ts`, `tsconfig.app.json`,
`useSaveReport.ts`, `ReportPage.tsx`. Removidos `_shared/recompute.ts(.test)`.

## QA

**Gate:** `PASS`

**E2E produção (2026-05-18):**
- save default → `econ_liq_A=1.244.519` + `parameter_set_id` da SulAmérica.
- alterado `report_parameters` no banco (cintilografia 2500→5000), **mesmo
  agregado, sem mudar cliente** → backend recalculou `econ_liq_A=1.524.519`,
  `ind1.econ_bruta_A=560.000=112×5000`. Params restaurados.
- agregado verificado PII-free (1,5 KB, sem nome/id de paciente).

## Notas e Decisões

- `2026-05-18` — ADR-007 supera ADR-002. SEC-003/004/005/006 marcados resolvidos.
- Audit log é imutável: as entradas geradas no E2E permanecem (comportamento
  correto — não há policy de DELETE).
- Pendência menor: recompute-report ainda guarda `qa_text` do cliente (texto,
  sem PII e não-econômico) — aceitável; QA autoritativo é item futuro.
