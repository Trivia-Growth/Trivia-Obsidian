---
tags: [tray, api, webhooks, financeiro]
fonte: Tray API
tipo: referencia
---

# Tray — Webhooks

Notificações enviadas por POST para uma URL do aplicativo quando eventos ocorrem na Tray. Permitem reação em tempo real sem polling.

---

## Eventos financeiramente relevantes

| Scope | Action | Quando disparar |
|-------|--------|-----------------|
| `order` | `insert` | Novo pedido criado |
| `order` | `update` | Status do pedido alterado — inclui aprovação de pagamento |
| `order` | `delete` | Pedido removido |
| `transaction` | `update` | Status da transação no gateway alterado (aprovado, cancelado, chargeback) |
| `invoice` | `insert` | NF vinculada ao pedido |
| `customer` | `insert` / `update` | Novo cliente ou atualização de dados |

---

## Payload típico

```json
{
  "scope_name": "order",
  "scope_id": 123456,
  "seller_id": 789,
  "act": "update",
  "datetime": "2024-01-15 14:30:00"
}
```

> O payload contém apenas o ID — é necessário buscar os dados completos via `GET /orders/:id/complete`

---

## Fluxo de integração financeira via webhook

```
Tray → POST webhook (order.update, status = aprovado)
  → HeziomOS busca GET /orders/:id/complete
  → Verifica PedidoVenda.SiteIdPedido no Literarius
  → Se NF ainda não emitida: dispara faturamento
  → Se título já existe: registra TituloFinanceiroBaixa
  → Se título não existe: cria TituloFinanceiro + TituloFinanceiroBaixa
```

---

## Notas de implementação

- URL de notificação deve ser HTTPS e responder 200 em menos de 5s
- Implementar idempotência — o mesmo evento pode chegar mais de uma vez
- Registrar todos os webhooks recebidos para auditoria

---

Ver: [[_a mapear]] · [[Tray - Pedidos]] · [[Tray - Pagamentos]]
