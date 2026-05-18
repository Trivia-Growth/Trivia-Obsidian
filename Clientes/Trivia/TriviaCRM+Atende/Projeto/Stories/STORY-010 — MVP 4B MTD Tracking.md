---
id: STORY-010
titulo: "MVP 4B — MTD Tracking (Ritmo vs. Meta)"
modulo: "Analytics"
status: "concluido"
fase: 4
prioridade: 2
agente_responsavel: "Claude Code"
atualizado: 2026-05-07
---

# STORY-010 — MVP 4B: MTD Tracking

## Contexto

Painel de acompanhamento diário do ritmo de cada vendedor vs. meta do mês.
Workspace_members já tem monthly_target_value e monthly_target_deals.
Precisa de cron diário (mtd-tracker) e UI de progresso.

## O que fazer

### Edge Function — mtd-tracker (nova)
- [ ] Cron: diário às 9h BRT
- [ ] Para cada workspace_member com monthly_target_value > 0:
  - Calcula deals ganhos no mês corrente (status='won', close_date no mês)
  - Calcula revenue MTD = soma de valor dos deals ganhos no mês
  - Calcula pace = (revenue_mtd / dias_decorridos) × dias_no_mes
  - Se pace < 80% da meta E dia do mês ∈ {10, 15, 20}: gera notificação ao gestor
- [ ] Persiste resultado em `performance_snapshots` (period_month, MTD parcial)

### Frontend — Tab "MTD" em Analytics ou Dashboard
- [ ] Lista de vendedores com:
  - Nome + avatar
  - Barra de progresso: MTD atual / Meta do mês (%)
  - Valor MTD em R$ e meta em R$
  - Pace indicator: "No ritmo atual → X% da meta" com cor (verde ≥80%, amarelo 60-79%, vermelho <60%)
  - Deals ganhos no mês vs. meta em deals
- [ ] Filtro de mês
- [ ] Card de totais do time no topo
- [ ] Highlights: top performer do mês, maior gap em relação à meta

## Critérios de Aceite

- [ ] Barra de progresso mostra MTD real calculado dos deals won no mês
- [ ] Pace indicator calcula corretamente baseado no dia atual do mês
- [ ] Notificação gerada ao gestor nos dias D+10/15/20 quando vendedor abaixo de 80%
- [ ] Edge function mtd-tracker deployada
- [ ] UI atualiza com dados do mês atual ao mudar filtro de mês
