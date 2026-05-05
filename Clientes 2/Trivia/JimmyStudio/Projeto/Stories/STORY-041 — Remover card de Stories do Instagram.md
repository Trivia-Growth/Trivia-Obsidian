---
id: STORY-041
titulo: "Remover card de Stories do relatório mensal de Instagram"
fase: 2
modulo: monthly-report
status: Done
prioridade: baixa
origem: piloto
agente_responsavel: dev
criado: 2026-05-04
atualizado: 2026-05-05
---

# STORY-041 — Remover card de Stories do relatório mensal de Instagram

## Contexto

A seção do Instagram no relatório mensal renderiza um card "Stories — visão
geral" com 6 métricas agregadas (count, alcance, views, respostas, avanços,
saídas) quando `data.stories.count > 0`. Decisão de produto: **remover esse
card** do relatório (web e PDF). O sinal de stories já é parcialmente coberto
em outros KPIs e o card adicionava ruído sem direcionar ação.

A coleta dos dados de stories no banco continua — só o render é removido.
Isso mantém histórico para análises futuras se a feature for reintroduzida em
outro formato.

## Spec de Referência

- Web: `src/features/monthly-report/components/InstagramSection.tsx:233-247`
  (bloco `{/* Stories */}`)
- PDF: `src/features/monthly-report/pdf/PdfInstagramSection.tsx:158-170`
- Tipo (manter por enquanto): `src/features/monthly-report/types/report.ts:78-86`
  (`InstagramReport.stories`)
- Aggregator (manter por enquanto): `supabase/functions/_shared/monthly-report-aggregator.ts`
  (campo `stories` continua sendo emitido)

## Critérios de Aceite

- [ ] CA1 — Bloco do card "Stories — visão geral" removido de
      `InstagramSection.tsx`.
- [ ] CA2 — Bloco equivalente removido de `PdfInstagramSection.tsx`.
- [ ] CA3 — Tipo `InstagramReport.stories` permanece (não remover do payload
      por enquanto, para não invalidar relatórios em cache).
- [ ] CA4 — Build limpo, sem variáveis/imports órfãos relacionados a
      `data.stories`.
- [ ] CA5 — E2E `monthly-report-e2e.spec.ts` continua passando (não há
      assertion de Stories hoje, então deve passar direto).
- [ ] CA6 — Conferir visualmente: relatório web e PDF de Abril/2026 da brand
      `Francescato Family Case Management - CLI-005` (que tem stories) não
      mostram mais o card.

---

## Implementação

**Status:** `concluido`

**Branch/PR:** `main` — commit `c05bb071`

**Arquivos alterados:**
- `src/features/monthly-report/components/InstagramSection.tsx`
- `src/features/monthly-report/pdf/PdfInstagramSection.tsx`

**Notas de implementação:**
- Apenas remoções (39 linhas). Tipo `InstagramReport.stories` e query no
  aggregator preservados intencionalmente para não invalidar payloads em
  cache.
- TypeScript limpo após remoção (sem imports órfãos).

---

## QA

> Preenchido pelo `@qa`.

**Gate:** `pendente`

**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Build sem erros, TypeScript strict
- [ ] Diff: apenas remoções (sem novas dependências)
- [ ] Relatório visualmente conferido (web + PDF)

**Notas:**

---

## Notas e Decisões

- Não remover o tipo `InstagramReport.stories` nem a query no aggregator nesta
  story. Se for decisão definitiva, criar story separada para limpeza
  completa do payload (incluindo migration de cleanup do schema da
  edge-function-cache se houver).
