---
id: STORY-060
titulo: "Tela de histórico de relatórios"
fase: 6
modulo: "report"
status: concluida
prioridade: media
agente_responsavel: "claude"
criado: 2026-05-19
atualizado: 2026-05-19
---

# STORY-060 — Tela de histórico de relatórios

## Contexto

Todo relatório gerado já é persistido na tabela `reports` (operadora,
clínica, período, KPIs completos — pacientes, atendimentos, faturamento,
economia —, versão dos parâmetros, autor, data) e cada ação fica no
`report_audit_log` imutável (create, mudança de status, alteração de
parâmetros, com antes/depois). **Os dados existem, mas não há tela que os
liste** — a interface só mostra o relatório recém-gerado. JG pediu uma
visão de histórico (validado no E2E Bradesco de 2026-05-19).

## Critérios de Aceite

- [ ] CA1 — rota `/historico` (AuthGuard) com lista de `reports` ordenada
  por data desc: operadora, clínica, período, status, nº pacientes,
  nº atendimentos, economia líquida (A), autor, data
- [ ] CA2 — filtros por operadora, clínica e intervalo de período
- [ ] CA3 — abrir um relatório do histórico → reexibe KPIs/HTML a partir
  do `kpis` salvo (sem reprocessar planilhas)
- [ ] CA4 — painel de auditoria do relatório (eventos do
  `report_audit_log` daquele `entidade_id`, com antes/depois)
- [ ] CA5 — RLS respeitada (leitor vê o que a policy `reports_read`
  permite; superadmin vê tudo); links no header
- [ ] CA6 — testes (lista, filtro, render a partir do kpis salvo)

## Implementação

**Status:** `concluida` (2026-05-19) — lista+filtros, detalhe /historico/:id reusa KpiDashboard/preview, painel de auditoria; reports_read libera leitura (sem migration); 69 testes verdes.
