---
tags: [projeto, backlog]
---

# Backlog — HeziomOS

Lista completa de stories organizadas por fase. Stories da Fase 2 e 3 serão detalhadas conforme a fase anterior for concluída.

---

## Fase 1 — Visibilidade

| ID | Story | Módulo | Status | Prioridade |
|----|-------|--------|--------|------------|
| [[STORY-001 — Setup Infraestrutura\|001]] | Setup Infraestrutura | Infra | pronto | 🔴 alta |
| [[STORY-002 — Deno Sync TituloFinanceiro e ContaBancaria\|002]] | Sync TituloFinanceiro + ContaBancaria | Sync | backlog | 🔴 alta |
| [[STORY-003 — Deno Sync NotaFiscal e PedidoVenda\|003]] | Sync NotaFiscal + PedidoVenda | Sync | backlog | 🔴 alta |
| [[STORY-004 — Dashboard CEO Posição Financeira\|004]] | Dashboard CEO — Posição Financeira | Dashboard | backlog | 🔴 alta |
| [[STORY-005 — Dashboard CEO DRE MTD\|005]] | Dashboard CEO — DRE MTD | Dashboard | backlog | 🟡 média |
| [[STORY-006 — Alertas Teams Briefing 7h\|006]] | Briefing Diário CEO no Teams | Alertas | backlog | 🟡 média |

---

## Fase 2 — Inteligência Assistida (rascunho)

> Stories serão detalhadas ao concluir a Fase 1.

| Módulo | Descrição | Spec |
|--------|-----------|------|
| Aprovação de Pagamentos | Workflow de alçadas para TipoTitulo='P' | [[Aprovação de Pagamentos]] |
| Conciliação Bancária | OFX × TituloFinanceiroBaixa, auto-match >95% | [[Conciliação Bancária]] |
| Alertas Inteligentes | A1 caixa, A2 vencidos, B3 repasse Tray | [[Alertas e Notificações]] |
| Faturamento por Canal | Receita líquida: bruto − comissão − frete | [[Comissões e Repasses]] |
| Dashboard CEO — Painéis 3 e 4 | Faturamento por canal + alertas críticos | [[Dashboard CEO]] |
| CNAB 240 | Geração de remessa para Santander | [[Aprovação de Pagamentos]] |
| Integração Qive NF-e | Captura automática de NF-e recebidas | [[Qive — NF-e Automática]] |

---

## Fase 3 — Autonomia (rascunho)

> Escopo a definir durante a Fase 2.

| Módulo | Descrição |
|--------|-----------|
| Gestão de Estoque e CMV | Posição por setor, cobertura, ruptura |
| Consignações | Aging dos R$1.15M em consignações abertas |
| Tray — Conciliação de Repasses | Automatch repasses Tray × extrato bancário |
| ML e Amazon | Integração marketplace (Fase 2 consolidada) |
| CNAB automático | Geração e envio sem intervenção humana |
