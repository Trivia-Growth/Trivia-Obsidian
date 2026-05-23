# Story 021 — Dashboard com Gráficos e Indicadores

> ✅ **Concluída** — Deploy: 2026-05-08

## Objetivo
Transformar o dashboard atual (que só mostra contagem de pendentes) em um painel completo com KPIs, gráficos e visão executiva do financeiro.

## Indicadores (KPIs)
- **Saldo total** — soma de todas as contas bancárias
- **Receitas do mês** — total de entradas no período
- **Despesas do mês** — total de saídas no período
- **Resultado do mês** — receitas - despesas (com cor verde/vermelho)
- **Pendentes de revisão** — count de lançamentos não aprovados
- **Lançamentos no mês** — volume total

## Gráficos
1. **Receitas vs Despesas** — barras agrupadas, últimos 6 meses
2. **Evolução de saldo** — linha, últimos 6 meses
3. **Top 5 categorias de despesa** — pizza/donut do mês atual
4. **Fluxo diário** — barras empilhadas (entrada/saída) últimos 30 dias

## Implementação
- Usar Recharts (leve, React-native)
- Queries otimizadas com GROUP BY mês/dia no Supabase
- Dashboard do Contador: multi-client com seletor
- Dashboard do Cliente: single-client direto

## Critérios de Aceite
- [x] 6 KPIs com cards visuais (ícone, valor, variação)
- [x] 4 gráficos responsivos
- [x] Período selecionável (últimos 3, 6, 12 meses)
- [x] Loading states para cada seção
- [x] Build sem erros TypeScript
