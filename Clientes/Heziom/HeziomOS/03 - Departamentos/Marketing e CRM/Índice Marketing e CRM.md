---
tags: [heziom, marketing, crm, módulo]
status: planejado
criado: 2026-05-19
fase: 2.2
substitui: Flowbiz
---

# Marketing e CRM — Índice do Módulo

> Módulo que unifica CRM B2B + B2C, absorve 40k+ contatos do Flowbiz, integra dados reais de compra (Tray + Literarius), e viabiliza segmentações impossíveis hoje.
> Referência: [[Mapeamento Completo da Operação Heziom]] §6 e [[HeziomOS — Módulos e Escopo Completo]]

---

## Equipe

- 4 internos + gestora de tráfego PJ + designer PJ
- Jimmy Studio (parceiro — criação de conteúdo e análise de ads)

---

## Métricas Atuais

| Métrica | Valor |
|---|---|
| Base de contatos (Flowbiz) | 40.000+ |
| Investimento mensal Meta Ads | R$ 80.000 |
| ROAS atual | ~2x (era 4x) |
| CAC médio | R$ 40,00 |
| Taxa de recompra | 25,27% |
| LTV | Não formalizado |

---

## Submódulos

| Submódulo | Status | Nota |
|---|---|---|
| [[CRM Unificado]] | ⬜ A criar | Perfil cross-channel (CPF), B2B + B2C |
| [[Segmentação e Réguas]] | ⬜ A criar | Comportamental, baseada em compras reais |
| [[Campanhas]] | ⬜ A criar | Email + WhatsApp, templates, métricas |
| [[Migração Flowbiz]] | ⬜ A criar | 40k contatos, mapeamento de campos |
| [[ROI de Tráfego]] | ⬜ A criar | Meta Ads + Google Ads → custo por canal |

---

## Segmentações Desejadas (impossíveis hoje no Flowbiz)

- "Clientes que compraram teologia reformada nos últimos 90 dias e não abriram últimos 3 e-mails"
- "Igrejas que fizeram pedido institucional há mais de 6 meses"
- "Compradores marketplace que também compraram D2C"
- "Clientes com LTV > R$ 500 sem compra há 60 dias"

---

## Fontes de Dados para CRM

| Fonte | Dados | Chave de cruzamento |
|---|---|---|
| Tray `GET /customers` | Compradores D2C | `customer.cpf` |
| Literarius `TParceiroController` | Clientes B2B (47k registros) | `Parceiro.CnpjCpf` |
| Marketplaces (via Tray) | Compradores ML/Amazon/Shopee | CPF quando disponível |
| Flowbiz (migração) | Base histórica de contatos | Email + telefone |
| Tray `GET /orders` | Histórico de compras online | `order.customer_id` |
| Literarius `PedidoVenda` | Histórico de compras offline | `PedidoVenda.Cliente` |

---

## Integrações

- Tray: clientes, pedidos, cupons, carrinhos abandonados
- Literarius SQL: parceiros (47k), pedidos, tipos de cliente
- Meta Ads API: custo por campanha, ROAS
- Google Ads API: custo por campanha
- WhatsApp Business API: canal de comunicação direta
- E-mail: réguas de relacionamento (Resend ou similar)

---

*Fase: 2.2 · Prioridade: Alta (ROAS em queda de 4x→2x, Flowbiz desconectado dos dados reais)*
