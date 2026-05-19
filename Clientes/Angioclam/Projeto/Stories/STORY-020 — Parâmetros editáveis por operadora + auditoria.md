---
id: STORY-020
titulo: "Parâmetros editáveis por operadora + audit log"
fase: 2
modulo: "parameters"
status: concluido
prioridade: alta
agente_responsavel: "claude"
criado: 2026-05-18
atualizado: 2026-05-18
---

# STORY-020 — Parâmetros editáveis por operadora + auditoria

## Contexto

Os custos e benchmarks estavam travados no código. Cada operadora pode ter
valores diferentes. A Fase 2 torna-os editáveis sem quebrar a paridade do
motor validado (default == constantes).

## Spec de Referência

- [[Clientes/Angioclam/Sistema/21 - Parametros Editaveis]]
- [[Clientes/Angioclam/Sistema/03 - Decisões Travadas]]
- Mockup `/parametros` validado com JG (página própria) em 2026-05-18

## Critérios de Aceite

- [x] CA1 — `gerarKpis(dados, params?)` e `rodarMotor(...,params?)`; `DEFAULT_PARAMS`
- [x] CA2 — Sem params == referência (parity intacta); +4 testes (params.test)
- [x] CA3 — `report_parameters` (seed por operadora) + RLS+FORCE (escrita superadmin)
- [x] CA4 — `report_audit_log` imutável (só SELECT/INSERT, sem UPDATE/DELETE)
- [x] CA5 — `reports.parameter_set_id`
- [x] CA6 — Tela `/parametros`: editar custos/benchmarks, pré-visualizar
  impacto (recalcula via worker), salvar nova versão + auditoria
- [x] CA7 — 42 testes verdes, build + lint limpos

---

## Implementação

**Status:** `concluido`

**Arquivos:** `src/types/motor.ts` (MotorParams), `src/lib/motor/{constants,kpis,index}.ts`,
`src/lib/{motor-client,dataset-store}.ts`, `src/features/parameters/**`,
`src/app/router.tsx`, `ReportPage` (link + setDataset),
`supabase/migrations/20260518143315_fase2_parametros_auditoria.sql`,
`src/lib/motor/__tests__/params.test.ts`.

**Notas:** worker e dataset compartilhados em `src/lib` para não acoplar features.
Editor remontado por `key={atual.id}` (sem setState em effect).

---

## QA

**Gate:** `PASS`

**Checklist:**
- [x] Parity preservada (sem params == JSON de referência)
- [x] RLS+FORCE nas tabelas novas; audit imutável por construção (sem policy UPDATE/DELETE)
- [x] `npm audit` sem Critical/High; lint; build
- [x] Deploy: commit `1e26714`, migration aplicada, Netlify publicado
- [x] Live: 8 conjuntos ativos legíveis por superadmin; rotas /,/login,/parametros 200

---

## Notas e Decisões

- `2026-05-18` — recompute-report (Edge) inalterado: na Fase 2 os parâmetros
  afetam o cálculo no client/worker; o recálculo autoritativo de consolidados
  segue derivando dos indicadores (ADR-002). Recompute server-side completo com
  params → quando o motor for portado para Deno (futuro).
- Backlog Fase 2+: taxonomia editável; edição manual de campos do relatório
  com `report_edits`; UI de histórico/auditoria.
