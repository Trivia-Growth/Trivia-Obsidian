---
id: STORY-009
titulo: "MVP 4A — Forecast Gerencial"
modulo: "Analytics"
status: "concluido"
fase: 4
prioridade: 1
agente_responsavel: "Claude Code"
atualizado: 2026-05-07
---

# STORY-009 — MVP 4A: Forecast Gerencial

## Contexto

Visão consolidada das camadas de forecast para o gestor decidir sobre o mês.
Edge function `forecast-aggregator` já existe mas não está conectada a uma UI dedicada.
Tabela `forecast_history` já existe no banco.

## O que fazer

### Edge Function — forecast-aggregator
- [ ] Revisar e conectar ao frontend
- [ ] Endpoint: POST com `{ workspace_id, period_month }`
- [ ] Retorna: por vendedor → commit_value, best_case_value, pipeline_value, weighted_value
- [ ] Registrar snapshot em `forecast_history` a cada chamada

### Frontend — Página /analytics ou tab "Forecast"
- [ ] Tabela de forecast por vendedor:
  - Colunas: Vendedor | Commit | Best Case | Pipeline | Receita Esperada | Meta | Gap
  - Commit = soma de deals com forecast_layer = 'commit' que fecham no mês
  - Best Case = soma deals com forecast_layer = 'best_case'
  - Receita Esperada = Σ (valor × close_probability / 100) por vendedor
- [ ] Linha de totais do time ao final da tabela
- [ ] Filtro de mês (padrão: mês atual)
- [ ] Comparativo com período anterior (mês passado)
- [ ] Lista de "Deals Commit": deals individuais com forecast_layer='commit' ordenados por valor
- [ ] Histórico de forecast: gráfico de linha mostrando evolução semana a semana

### Database
- [ ] Verificar se `forecast_history` tem campos suficientes (closed_value, week)
- [ ] Trigger ou cron semanal para snapshot automático

## Critérios de Aceite

- [ ] Gestor vê Commit / Best Case / Pipeline consolidado por vendedor
- [ ] Receita esperada ponderada calculada corretamente
- [ ] Comparativo com meta do mês visível (gap)
- [ ] Lista de deals Commit com link para deal drawer
- [ ] Histórico de forecast com evolução semanal
- [ ] Edge function deployada e respondendo em < 3s
