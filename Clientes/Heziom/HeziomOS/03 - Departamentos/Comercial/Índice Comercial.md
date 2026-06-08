---
tags: [heziom, comercial, módulo]
status: planejado
criado: 2026-05-19
fase: 2.3
substitui: WhatsApp manual + ClickUp + planilhas
---

# Comercial — Índice do Módulo

> Módulo que absorve a gestão de vendas multi-canal (atacado B2B + D2C + marketplaces + livraria física), metas CPC, pipeline e forecast.
> Referência: [[Mapeamento Completo da Operação Heziom]] §5 e [[HeziomOS — Módulos e Escopo Completo]]

---

## Equipe

- 3 internos (comercial)
- Volume: ~150 pedidos atacado/mês via WhatsApp

---

## Canais de Venda

| Canal | Receita 2025 | % | Sistema na ponta |
|---|---|---|---|
| E-commerce D2C | R$ 2,58M | 37,0% | Tray |
| Atacado (igrejas/livrarias) | R$ 1,78M | 25,4% | Literarius + WhatsApp |
| Livraria física (IPP + Embu) | R$ 1,31M | 19,7% | POS Controle + Literarius |
| Marketplaces (ML, Amazon, Magalu, Shopee) | R$ 729K | 11,0% | Tray + Amazon Vendor |
| Outros (showroom, eventos) | R$ 240K | 6,9% | Literarius manual |

---

## Metas CPC

- **Online:** R$ 214.503/mês (ROI mínimo 4:1)
- **Offline:** R$ 371.851/mês
- **Total:** R$ 586.354/mês

---

## Submódulos

| Submódulo | Status | Nota |
|---|---|---|
| [[Dashboard Comercial]] | ⬜ A criar | Vendas por canal, pace vs. meta, forecast |
| [[Pipeline Atacado]] | ⬜ A criar | Pedidos WhatsApp, status, conversão |
| [[Comissões CPC]] | ⬜ A criar | Faixas 0,5%–3,5%, cálculo automático |
| [[Agente de Vendas WhatsApp]] | ⬜ A criar | Fase 3 — auto-lançamento no Literarius |
| [[Amazon Seller Central — Mapeamento e Automação]] | ✅ Documentado | SP-API completa — 10 APIs, todos endpoints, rate limits, fluxo HeziomOS (3P) |
| [[Amazon Vendor Central — Mapeamento e Automação]] | ✅ Documentado | SP-API completa — Retail Procurement + Direct Fulfillment, todos endpoints (1P) |

---

## Fluxo Atacado Atual vs. HeziomOS

| Etapa | Hoje | HeziomOS |
|---|---|---|
| Recepção do pedido | WhatsApp | WhatsApp → captura automática |
| Lançamento | Manual no Literarius | `PUT /PedidoVenda` automático |
| Aviso expedição | ClickUp | Evento automático (status changed) |
| Geração boleto | Aviso manual ao financeiro | Trigger: pedido aprovado → título |
| Visão de vendas | Inexistente | Dashboard tempo real |

---

## Integrações

- Literarius REST: `PUT /PedidoVenda` (criar pedido) + `GET /PedidoVendaStatus` (mudar status)
- Tray: `GET /orders` (pedidos D2C + marketplaces)
- WhatsApp Business API: canal de entrada de pedidos atacado
- Meta/Google Ads API: ROI de tráfego (feeds do CRM)

---

## Necessidades Estratégicas

- **Cross-channel:** CPF como chave para saber se cliente marketplace já comprou D2C
- **APIs ML/Amazon:** ✅ Amazon SP-API mapeada em [[Amazon Seller Central — Mapeamento e Automação]] — Mercado Livre pendente (Fase 4)
- **Chat de vendas na Tray:** tema com IA que recomenda, mostra estoque e fecha carrinho
- **Agente 24/7:** consulta livros, calcula frete, finaliza compra

---

*Fase: 2.3 · Prioridade: Alta (setor com gestão amadora — sem posição de vendas, pace ou forecast)*
