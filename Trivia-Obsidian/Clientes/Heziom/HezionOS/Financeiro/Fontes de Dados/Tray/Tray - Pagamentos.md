---
tags: [tray, api, financeiro, pagamentos]
fonte: Tray API
tipo: endpoint
---

# Tray — Pagamentos (`/payments`)

## Endpoints

| Método | Path | Uso |
|--------|------|-----|
| `GET` | `/payments` | Lista registros de pagamento |
| `GET` | `/payments/:id` | Dados de um pagamento específico |
| `POST` | `/payments` | Registra pagamento manualmente |
| `PUT` | `/payments/:id` | Atualiza dados do pagamento |
| `DELETE` | `/payments/:id` | Remove pagamento |
| `GET` | `/payment-options` | Lista formas de pagamento disponíveis na loja |
| `GET` | `/payment-settings` | Configurações de pagamento da loja |

---

## Campos do pagamento

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | int | ID do registro de pagamento |
| `order_id` | int | FK → [[Tray - Pedidos]] (`order.id`) |
| `payment_method_id` | int | ID da forma de pagamento |
| `payment_method` | string | Nome da forma (ex: "Boleto Bancário", "Cartão Visa") |
| `display_name` | string | Nome exibido ao cliente |
| `type` | string | Tipo técnico: `bank_billet`, `credit_card`, `pix`, `debit_card` |
| `value` | decimal | Valor do pagamento |
| `plots` | int | Número de parcelas |
| `tax` | decimal | Taxa percentual da forma de pagamento |
| `status` | string | Status do pagamento — ver tabela abaixo |
| `transaction_id` / `token` | string | ID da transação no gateway |
| `date_transaction` | datetime | Data/hora da transação no gateway |
| `price_payment` | decimal | Valor cobrado ao cliente (com juros de parcelamento) |
| `price_seller` | decimal | Valor líquido recebido pelo lojista (após taxas) |

---

## Status de pagamento

| Status | Descrição | Ação financeira |
|--------|-----------|-----------------|
| `waiting_payment` / `aguardando_pagamento` | Aguardando | Não gerar título |
| `approved` / `aprovado` | Aprovado pelo gateway | Gerar título a receber / baixar se já existia |
| `refunded` / `reembolsado` | Estornado | Estornar baixa, gerar título a pagar |
| `cancelled` / `cancelado` | Cancelado | Cancelar título |
| `chargeback` | Chargeback recebido | Gerar despesa de estorno + título a pagar |

---

## Formas de pagamento (`/payment-options`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | int | ID da forma |
| `display_name` | string | Nome exibido |
| `type` | string | `bank_billet`, `credit_card`, `pix`, `debit_card` |
| `plots` | string | Opções de parcelas disponíveis |
| `value` | decimal | Valor mínimo da parcela |
| `tax` | decimal | Taxa aplicada (%) |

---

## Campos de transação (Tray Checkout)

> Quando o gateway é o Tray Checkout, a transação retorna campos adicionais:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `token` | string | Token único da transação |
| `status` | symbol | `:waiting_payment`, `:approved`, `:cancelled` |
| `price_payment` | decimal | Valor cobrado ao comprador |
| `price_seller` | decimal | Valor líquido recebido (= `price_payment` - taxa gateway) |
| `split` | int | Parcelas |
| `date_transaction` | datetime | Data da transação |
| `order_number` | string | Referência do pedido no ERP |
| `url_notification` | string | Webhook de notificação |

---

## Cálculo de receita líquida

```
Receita líquida Tray = total (pedido)
                       - shipment_value
                       - discount
                       - taxa gateway (payment_method_rate × total)

Equivalente Literarius:
  TituloFinanceiro.Valor        ← total do pedido
  TituloFinanceiroBaixa.ValorTaxa ← taxa gateway
```

---

## Conciliação com Literarius

```
Tray payment.order_id    →  PedidoVenda.SiteIdPedido
Tray payment.status = approved
  →  TituloFinanceiro.Pago = 1
  →  TituloFinanceiroBaixa (registro de baixa)

Tray price_seller  (valor líquido pós-taxa)
  ≈  TituloFinanceiroBaixa.ValorBaixa - TituloFinanceiroBaixa.ValorTaxa
```

---

## Usada por

- [[Contas a Receber]]
- [[DRE e Fluxo de Caixa]]
- [[Mapa de Dados]]

Ver: [[_a mapear]] · [[Tray - Pedidos]]
