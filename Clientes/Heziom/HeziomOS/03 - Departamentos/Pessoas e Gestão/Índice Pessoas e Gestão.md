---
tags: [heziom, pessoas, gestão, rh, módulo]
status: planejado
criado: 2026-05-19
fase: 2.6
substitui: Planilhas + processos manuais
---

# Pessoas e Gestão — Índice do Módulo

> Módulo que cobre comissões CPC, estrutura organizacional, avaliação de desempenho e onboarding.
> Referência: [[Mapeamento Completo da Operação Heziom]] §10 e [[HeziomOS — Módulos e Escopo Completo]]

---

## Equipe Total

~20 pessoas distribuídas em 7 áreas:

| Área | Pessoas |
|---|---|
| Marketing | 4 + 2 PJ |
| Expedição | 3 + freelancers |
| Financeiro | 2 |
| Editorial | 1 + terceirizados |
| Comercial | 3 |
| Livraria física | 1 + 4 freelancers |
| Atendimento | 2 |

---

## Submódulos

| Submódulo | Status | Nota |
|---|---|---|
| [[Comissões CPC]] | ⬜ A criar | Faixas 0,5%–3,5%, cálculo automático |
| [[Estrutura Organizacional]] | ⬜ A criar | Org chart, cargos, funções |
| [[Avaliação de Desempenho]] | ⬜ A criar | KPIs por função, ciclos |
| [[Onboarding]] | ⬜ A criar | Checklist para novos colaboradores |

---

## Comissões CPC

Modelo unificado Marketing + Comercial + Atendimento:

| Faixa de atingimento | Comissão |
|---|---|
| < 80% da meta | 0,5% |
| 80%–100% | 1,5% |
| 100%–120% | 2,5% |
| > 120% | 3,5% |

*(Valores exatos a confirmar com CEO — pendência D7)*

---

## Integrações

- Literarius SQL: `PedidoVenda` (vendas por vendedor) para cálculo de comissão
- Módulo Comercial: metas e atingimento
- Módulo Financeiro: pagamento de comissões (título a pagar)

---

## Visão Futura

- Superagente autônomo que interage com todas as áreas (elimina reuniões de diretoria)
- Dados consolidados para reuniões vêm do sistema, não de planilhas manuais
- Avaliação baseada em métricas do próprio OS (tarefas concluídas, metas atingidas, SLA)

---

*Fase: 2.6 · Prioridade: Média (comissões são urgentes; RH/DP pode esperar)*
