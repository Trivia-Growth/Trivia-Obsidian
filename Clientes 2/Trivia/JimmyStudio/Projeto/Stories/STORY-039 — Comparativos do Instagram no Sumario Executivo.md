---
id: STORY-039
titulo: "Corrigir comparativos do Instagram no Sumário Executivo (Seguidores e Crescimento)"
fase: 2
modulo: monthly-report
status: Draft
prioridade: alta
origem: piloto
agente_responsavel: ""
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-039 — Corrigir comparativos do Instagram no Sumário Executivo (Seguidores e Crescimento)

## Contexto

No Sumário Executivo do relatório mensal (`/relatorio/mensal/:brandId`), o bloco
**Instagram** mostra 6 KPIs com badge "vs. mês anterior". Quatro KPIs (Alcance,
Engajamento, Posts, Taxa de engajamento) usam corretamente os campos do objeto
`instagram.comparison.*VsLastMonth` que vêm do aggregator com a janela de mês
anterior. Mas dois KPIs estão errados:

- **"Seguidores"** — badge mostra `instagram.summary.followersGrowthPct`, que é
  o **percentual de crescimento dentro do próprio mês** (start vs end), não vs.
  mês anterior. O label "vs. mês anterior" é enganoso.
- **"Crescimento no mês"** — mesmo problema: o badge reutiliza
  `followersGrowthPct`. Isso é redundante com o próprio valor exibido (é o mesmo
  número em formato diferente) e não responde a pergunta "esse mês cresceu mais
  ou menos que o anterior?".

O aggregator (`supabase/functions/_shared/monthly-report-aggregator.ts`) já tem
todos os dados necessários para o mês anterior (faz `aggregateInstagram` para
`prevRange`), mas não expõe os campos `followersStartPrev/EndPrev/GrowthPrev`
no `comparison`. Ou seja, o trabalho é **duas pontas**: aggregator emite os
campos novos, UI consome.

A mesma correção precisa ser feita no PDF (`PdfExecutiveSummary.tsx`).

## Spec de Referência

- Implementação atual com bug: `src/features/monthly-report/components/ExecutiveSummary.tsx:78-82,91-95`
- PDF: `src/features/monthly-report/pdf/PdfExecutiveSummary.tsx`
- Aggregator: `supabase/functions/_shared/monthly-report-aggregator.ts` (função `aggregateInstagram`, retorno `comparison`)
- Tipo: `src/features/monthly-report/types/report.ts` (`InstagramReport.comparison`)

## Critérios de Aceite

- [ ] CA1 — Aggregator do IG retorna em `comparison` os campos novos
      `followersGrowthVsLastMonth` (delta absoluto entre crescimento desse mês
      vs. anterior) e `followersEndVsLastMonth` (variação % do total de
      seguidores fim do mês vs. fim do mês anterior).
- [ ] CA2 — Tipo `InstagramReport.comparison` em `types/report.ts` atualizado.
- [ ] CA3 — `ExecutiveSummary.tsx` (web) consome os novos campos:
      "Seguidores" usa `followersEndVsLastMonth`; "Crescimento no mês" usa
      `followersGrowthVsLastMonth`.
- [ ] CA4 — `PdfExecutiveSummary.tsx` (PDF) idem.
- [ ] CA5 — Quando não há dados de mês anterior (brand nova), o badge mostra
      "vs. mês anterior: —" (já é o comportamento atual quando `comparison` é
      `null`).
- [ ] CA6 — E2E `monthly-report-e2e.spec.ts` passa sem regressões; opcional
      adicionar assertion específica para os badges corretos.

---

## Implementação

> Preenchido pelo `@dev` após concluir.

**Status:** `pendente`

**Branch/PR:**

**Arquivos alterados:**
-

**Notas de implementação:**

---

## QA

> Preenchido pelo `@qa`.

**Gate:** `pendente`

**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Build sem erros, TypeScript strict (sem `any`)
- [ ] Edge function `aggregate-monthly-report` redeployada
- [ ] E2E passa
- [ ] PDF gerado para uma brand com 2+ meses de dados — badges corretos

**Notas:**

---

## Notas e Decisões

- O LinkedIn tem o mesmo problema teórico nos cards "Seguidores" e "Crescimento
  no mês" (atualmente `comparison: null` hardcoded na UI), mas isso é tratado
  na STORY-040 que cuida do LinkedIn como um todo.
