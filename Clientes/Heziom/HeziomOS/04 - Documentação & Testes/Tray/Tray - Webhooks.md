---
tags: [tray, api, webhooks, financeiro]
fonte: Tray API
tipo: referencia
---

# Tray — Webhooks

Notificações enviadas por POST para uma URL do aplicativo quando eventos ocorrem na Tray. Permitem reação em tempo real sem polling.

---

## Todos os Eventos Disponíveis (10 no total)

| Scope | Action | Quando dispara | Prioridade HeziomOS |
|-------|--------|----------------|---------------------|
| `order` | `insert` | Novo pedido criado | 🔴 Alta |
| `order` | `update` | Status do pedido alterado (aprovação, envio, etc.) | 🔴 Alta |
| `order` | `delete` | Pedido cancelado/removido | 🔴 Alta |
| `transaction` | `update` | Status do gateway alterado (aprovado, recusado, estorno, chargeback) | 🔴 Alta |
| `invoice` | `insert` | NF-e vinculada ao pedido | 🟡 Média |
| `customer` | `insert` | Novo cliente cadastrado | 🟡 Média |
| `customer` | `update` | Dados do cliente alterados | ⚪ Baixa |
| `product` | `insert` | Produto criado (por outro integrador ou manualmente) | 🟡 Média |
| `product` | `update` | Produto modificado (preço, estoque por outro canal) | 🟡 Média |
| `product` | `delete` | Produto removido da loja | 🟡 Média |

> **Total: 10 eventos.** Os 4 primeiros (order + transaction) são os mais críticos para o fluxo financeiro.

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

---

## Endpoints para gerenciar webhooks

```
POST   /webhooks            → Registrar novo webhook
GET    /webhooks            → Listar webhooks registrados
GET    /webhooks/:id        → Detalhe
DELETE /webhooks/:id        → Remover webhook
```

### Registrar um webhook

```python
# Exemplo: registrar webhook para pagamento aprovado
payload = {
    "url": "https://heziom-sync.trivia.com.br/webhooks/tray",
    "event": "transaction",
    "action": "update"
}
resp = requests.post(f"https://{api_host}/web_api/v2/webhooks?access_token={token}", json=payload)
```

> **Requisitos do receptor:**
> - HTTPS obrigatório
> - Responder HTTP 200 em < 5 segundos
> - Tray reenvia até 3× se não receber 200

---

## Ações recomendadas por evento

| Evento | Ação no HeziomOS |
|---|---|
| `order.insert` | Log + verificar se existe no Literarius |
| `order.update` (status=aprovado) | Disparar faturamento se NF não emitida |
| `order.update` (status=enviado) | Registrar sending_code |
| `order.delete` | Cancelar NF + estornar título financeiro |
| `transaction.update` (approved) | Confirmar título financeiro |
| `transaction.update` (refunded) | Criar nota de crédito |
| `transaction.update` (chargeback) | 🚨 Alerta urgente ao CEO |
| `invoice.insert` | Confirmar vinculação NF ↔ pedido |
| `product.update` | Verificar se estoque mudou por outro canal |

---

Ver: [[Tray - Pedidos]] · [[Tray - Pagamentos]] · [[Tray - Frete e Logística]] · [[Mapa Completo de APIs e Capacidades]]
