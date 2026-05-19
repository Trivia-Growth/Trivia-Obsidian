---
id: STORY-005
titulo: "UI tela única: upload + KPIs + relatório HTML"
fase: 1
modulo: "report"
status: concluido
prioridade: alta
agente_responsavel: "claude"
criado: 2026-05-18
atualizado: 2026-05-18
---

# STORY-005 — UI tela única (upload + KPIs + HTML)

> Consolida STORY-005/006/007 do plano. Mockup validado com JG antes de codar.

## Contexto

Fatia vertical visível: o analista sobe B1/B2/B3, o motor roda no Web Worker
(PII não sai da máquina) e a tela mostra KPIs + prévia/download do relatório.

## Decisão de design (validada com JG em 2026-05-18)

- Layout: **tela única com rolagem** (upload no topo → KPIs → prévia do relatório)
- Identidade: **vinho Angioclam #771F1F**, fundo claro, tipografia Inter

## Critérios de Aceite

- [x] CA1 — Web Worker (Comlink) roda o motor fora da thread da UI
- [x] CA2 — 3 slots tipados (B1/B2/B3), botão habilita só com os 3
- [x] CA3 — Estados loading / erro (com retry) / vazio; Error Boundary
- [x] CA4 — Painel de KPIs (consolidado + 5 indicadores)
- [x] CA5 — Prévia do relatório (9 slides) em iframe + download HTML
- [x] CA6 — Log de QA visível (cobertura B2/B1)
- [x] CA7 — `npm run build` ok, `npm test` 31/31, `npm run lint` limpo

---

## Implementação

**Status:** `concluido`

**Arquivos:** `src/workers/motor.worker.ts`, `src/features/report/api/useReport.ts`,
`src/features/report/lib/buildHtml.ts`,
`src/features/report/components/{ReportPage,UploadArea,KpiDashboard,IndicadorCard,ReportHtmlPreview}.tsx`,
`src/components/layout/ErrorBoundary.tsx`, `src/app/{router,providers,App}.tsx`.

**Notas:** Vitest movido para `vitest.config.ts` separado (conflito de tipos
Vite 8 rolldown × vitest/config no `tsc -b`). Worker bundle ~383 kB (inclui xlsx).

---

## QA

**Gate:** `PASS`

**Checklist:**
- [x] Build sem erros, TypeScript strict
- [x] Loading + Error (retry) + vazio implementados
- [x] Error Boundary presente
- [x] Rotas com lazy() + Suspense
- [x] `npm audit` sem Critical/High
- [ ] Testes de componente (3 estados) — backlog (priorizado parity gate)

---

## Notas e Decisões

- `2026-05-18` — `buildHtml` é fiel em estrutura ao HTML de referência, não
  byte-idêntico; refinamento visual fino fica para a Fase 4 (export PDF).
- `2026-05-18` — Fix Slide 3 (Indicador 4): o helper genérico mostrava `0`
  (Ind 4 usa `angiotc_*`/`cat_*`, não `evitadas_vs_*`). Criada
  `indicador4Slide` com detalhamento AngioTC + Cateterismo e totais 119 (A) /
  90 (B). Motor intacto. +5 testes (`buildHtml.test.ts`), total 37 verdes.
  Também tornado `vitest.setup.ts` defensivo p/ `localStorage` (1º teste browser).
- Auth/RLS/persistência ficam na STORY-008.
