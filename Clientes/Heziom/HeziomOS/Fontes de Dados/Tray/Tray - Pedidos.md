---
tags: [tray, api, financeiro, pedidos]
fonte: Tray API
tipo: endpoint
---

# Tray — Pedidos (`/orders`)

## Endpoints

| Método | Path | Uso |
|--------|------|-----|
| `GET` | `/orders` | Lista pedidos (filtros: `date`, `status`, `customer_id`) |
| `GET` | `/orders/:id` | Dados básicos do pedido |
| `GET` | `/orders/:id/complete` | Pedido completo com produtos, pagamento e entrega |
| `PUT` | `/orders/:id` | Atualiza status, rastreio, etc. |
| `PUT` | `/orders/:id/cancel` | Cancela pedido |

### Filtros úteis para financeiro (`GET /orders`)

```
?date=2024-01-01,2024-01-31   → período
?status=aprovado              → só aprovados
?customer_id=123
?limit=50&page=1
```

---

## Campos do pedido — Financeiros

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | int | **ID do pedido** — chave de conciliação com `SiteIdPedido` no Literarius |
| `date` | date | Data do pedido (YYYY-MM-DD) |
| `hour` | time | Hora do pedido |
| `status` | string | Status atual do pedido |
| `status_id` | int | ID do status |
| `customer_id` | int | ID do cliente |
| `partial_total` | decimal | Subtotal dos produtos (sem frete e sem desconto) |
| `taxes` | decimal | Total de impostos aplicados |
| `discount` | decimal | Desconto total (cupom + promoções) |
| `discount_coupon` | string | Código do cupom utilizado |
| `point_sale` | decimal | Pontos usados como desconto |
| `shipment` | string | Nome do método de envio |
| `shipment_value` | decimal | Valor do frete cobrado ao cliente |
| `shipment_date` | date | Data de envio |
| `sending_code` | string | Código de rastreio da entrega |
| `sending_date` | date | Data de despacho |
| `delivered` | string | `"1"` = entregue |
| `shipping_cancelled` | string | `"1"` = frete cancelado |
| `payment_method_id` | int | ID da forma de pagamento |
| `payment_method` | string | Nome da forma de pagamento (ex: "Boleto", "Cartão Visa") |
| `payment_method_rate` | decimal | Taxa da forma de pagamento (%) |
| `installment` | int | Número de parcelas |
| `value_1` | decimal | Valor da primeira parcela |
| `total` | decimal | **Valor total do pedido** (subtotal + frete - descontos + impostos) |
| `payment_date` | datetime | Data/hora de confirmação do pagamento |
| `session_id` | string | ID da sessão de compra |
| `partner_id` | int | ID do parceiro/afiliado |
| `store_note` | string | Observação da loja |
| `customer_note` | string | Observação do cliente |
| `access_code` | string | Código de acesso do pedido |
| `shipment_integrator` | string | Transportadora/integrador de frete |
| `delivery_time` | int | Prazo de entrega em dias úteis |
| `billing_address` | object | Endereço de cobrança |

---

## Campos do pedido — Produtos (array `Order.ProductsSold`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `product_id` | int | ID do produto na Tray |
| `name` | string | Nome do produto |
| `quantity` | int | Quantidade vendida |
| `price` | decimal | Preço unitário de venda |
| `cost_price` | decimal | Custo unitário |
| `variant_id` | int | ID da variação |
| `ean` | string | EAN/código de barras |
| `weight` | decimal | Peso |

---

## Fórmula do total

```
total = partial_total - discount - point_sale + shipment_value + taxes
```

---

## Valores de `status` (principais)

| Status | Significado financeiro |
|--------|----------------------|
| `aprovado` | Pagamento confirmado → gerar NF e título a receber |
| `aguardando_pagamento` | Aguardando — não gerar financeiro ainda |
| `cancelado` | Pedido cancelado — estornar se já tinha título |
| `em_aberto` | Aberto sem pagamento |
| `entregue` | Entregue |

---

## Conciliação com Literarius

```
Tray order.id  →  PedidoVenda.SiteIdPedido
Tray order.id  →  NotaFiscal.SiteIdPedido

Tray total          ≈  NotaFiscal.TotalNota
Tray discount       ≈  NotaFiscal.Desconto
Tray shipment_value ≈  NotaFiscal.ValorFrete
Tray taxes          ≈  NotaFiscal.TotalImpostos
```

---

## Usada por

- [[Pedidos e Vendas]]
- [[Contas a Receber]]
- [[Mapa de Dados]]

Ver: [[_a mapear]] · [[Tray - Pagamentos]]
