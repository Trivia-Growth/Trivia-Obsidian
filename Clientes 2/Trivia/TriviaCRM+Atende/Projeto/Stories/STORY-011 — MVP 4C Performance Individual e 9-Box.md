---
id: STORY-011
titulo: "MVP 4C — Performance Individual e 9-Box de Performance"
modulo: "Analytics"
status: "backlog"
fase: 4
prioridade: 3
agente_responsavel: "—"
atualizado: 2026-05-06
---

# STORY-011 — MVP 4C: Performance Individual + 9-Box

## Contexto

Tabela `performance_snapshots` já existe. Edge function `performance-calculator` precisa ser criada.
O 9-Box é uma matriz 3×3 (resultado vs. competência) para posicionar vendedores.

## O que fazer

### Edge Function — performance-calculator (nova)
- [ ] Cron: mensal no dia 1 do mês seguinte
- [ ] Para cada workspace_member com role = agent/manager:
  - Win rate = deals won / (deals won + deals lost) no mês
  - Win rate por fase = win rate segmentado por stage_id
  - Ciclo médio = média de (close_date - first_contact_date) dos deals won
  - Ticket médio = média de valor dos deals won
  - ROAS = revenue_won / (ote_base/12 + ote_commission estimada)
  - Aderência ao playbook = % deals com next_step_what + forecast_layer + close_probability preenchidos
  - Score de roleplay = média dos últimos 3 roleplay_sessions.scores_json
- [ ] Persiste em `performance_snapshots` (period_month, todos os campos)

### Frontend — Tab "Performance" em Analytics

**Performance Individual (tabela):**
- [ ] Linha por vendedor com colunas: Win Rate | Ciclo Médio | Ticket Médio | ROAS | Aderência ao Playbook | Score Roleplay
- [ ] Drill-down: clicar no vendedor abre sidebar com win rate por fase (funil por stage)
- [ ] Filtro de mês (usar snapshots históricos)
- [ ] Comparativo com média do time

**9-Box (matriz visual):**
- [ ] Grid 3×3: eixo X = Resultado (deals/meta: baixo/médio/alto), eixo Y = Competência (win rate + aderência: baixo/médio/alto)
- [ ] Cada vendedor = bolha com avatar/iniciais posicionada no quadrante correto
- [ ] Tooltip: nome, win rate, resultado vs. meta, score roleplay
- [ ] Legenda dos 4 quadrantes: Top Performer | Alta competência/baixo resultado | Alto resultado/baixa competência | Atenção
- [ ] Admin configura thresholds: "Resultado alto = acima de X% da meta"
- [ ] Snapshot mensal salvo — slider para ver evolução mês a mês

### Settings — Thresholds 9-Box
- [ ] UI em Settings > Metas: campos "Resultado alto ≥ __% da meta", "Competência alta ≥ __% win rate"

## Critérios de Aceite

- [ ] performance-calculator deployado e popula performance_snapshots
- [ ] Tabela de performance com dados reais (não mockados)
- [ ] 9-Box posiciona vendedores corretamente com dados do mês atual
- [ ] Histórico mês a mês navegável
- [ ] Drill-down de win rate por fase funcional
- [ ] `npm run build` sem erros
