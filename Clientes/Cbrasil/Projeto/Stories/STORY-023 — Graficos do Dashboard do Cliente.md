---
id: STORY-023
titulo: "Graficos e Comparativos do Dashboard do Cliente"
fase: 1
modulo: dashboard
status: done
prioridade: média
agente_responsavel: ""
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-023 — Graficos e Comparativos do Dashboard do Cliente

## Contexto

As stories STORY-009 e STORY-015 entregaram o dashboard do cliente com os cards
de receita / despesa / saldo, mas a parte visual (graficos) ficou pendente. O
pacote Recharts ja esta instalado e as APIs de dados ja existem
(`getCategoryBreakdown`, `getMonthlyTrend`) — falta a renderizacao.

## Spec de Referencia

- [[GAP-ANALYSIS]] — secao "Dashboard Cliente (MELHORAR)"
- STORY-009, STORY-015 (entregas anteriores do dashboard)

## Criterios de Aceite

- [ ] Grafico de fluxo de caixa (entradas vs saidas) por periodo
- [ ] Visualizacao das principais categorias do mes (maiores receitas/despesas)
- [ ] Comparativo do mes atual com o mes anterior
- [ ] Graficos com loading state e empty state
- [ ] Layout responsivo (desktop e mobile)

## Implementacao

> Preenchido pelo `@dev` apos concluir.

## QA

> Preenchido pelo `@qa`.

## Notas e Decisoes

- Recharts ja instalado; reaproveitar as APIs de dados existentes em
  `src/features/dashboard/api/`.
