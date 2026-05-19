---
id: STORY-002
titulo: "Porte do motor para TypeScript com paridade"
fase: 1
modulo: "motor"
status: concluido
prioridade: alta
agente_responsavel: "claude"
criado: 2026-05-18
atualizado: 2026-05-18
---

# STORY-002 — Porte do motor para TypeScript com paridade

> Consolida STORY-002/003/004 do plano: constantes+utilitários, parsers e
> `gerarKpis`/`gerarQa` com gate de paridade.

## Contexto

O padrão Trivia não roda Python. Para reaproveitar os cálculos validados, o
`motor_relatorio_v2.py` foi portado função-a-função para TypeScript, com
igualdade exata contra `dados_relatorio.json` como critério de sucesso.

## Spec de Referência

- [[Clientes/Angioclam/Sistema/11 - Motor Python v2 - Codigo Referencia]]
- [[Clientes/Angioclam/Sistema/12 - Taxonomia de Exames]]
- [[Clientes/Angioclam/Sistema/03 - Decisões Travadas]]

## Critérios de Aceite

- [x] CA1 — Constantes/TAXONOMIA portadas verbatim (`src/lib/motor/constants.ts`)
- [x] CA2 — `stripAcc`/`normalizarNome` (NFKD ascii-ignore) + `roundHalfEven` (banker's)
- [x] CA3 — `classificar` ordem-sensível idêntica ao Python
- [x] CA4 — Parser CSV `;` próprio + XLSX (SheetJS) + `validarCsv` (integridade)
- [x] CA5 — `gerarKpis` + `gerarQa` completos (5 indicadores A/B, consolidados, epidem, panorama)
- [x] CA6 — `parity.test.ts` passa: epidem, panorama, indicadores, consolidados, cobertura
- [x] CA7 — Testes unitários normal/vazio/inválido por função

---

## Implementação

**Status:** `concluido`

**Arquivos:** `src/lib/motor/{constants,text,classify,operadora,parse,patients,
kpis,qa,index}.ts`, `src/types/motor.ts`, `src/lib/motor/__tests__/*.test.ts`.

**Notas:** Paridade obtida na 1ª execução. `roundHalfEven` validado pelo caso
1075×0,10=107,5→108. Integridade B2 = 14.549 registros (= `total_proc` do JSON).
31/31 testes verdes (`npx vitest run --project node`).

---

## QA

**Gate:** `PASS`

**Checklist:**
- [x] Critérios de aceite validados
- [x] TypeScript strict, sem `any` no motor
- [x] `parity.test.ts` PASS (gate de merge)
- [x] `npm audit` sem Critical/High

**Notas:** Build do app ainda falha de propósito — `router.tsx` referencia
`ReportPage` (UI da STORY-005/006/007, ainda não criada).

---

## Notas e Decisões

- `2026-05-18` — Motor é isomórfico (ADR-002): mesmo código servirá ao Web
  Worker (client) e à Edge Function `recompute-report` (STORY-008).
- Testes de paridade dependem de fixtures com PII real em `tests/fixtures/real/`
  (fora do git). Para CI, criar amostra anonimizada (SEC-008).
