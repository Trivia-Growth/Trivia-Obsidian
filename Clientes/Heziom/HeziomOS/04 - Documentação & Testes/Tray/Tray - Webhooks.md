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
POST   /web_api/webhooks            → Registrar novo webhook
GET    /web_api/webhooks            → Listar webhooks registrados
GET    /web_api/webhooks/:id        → Detalhe
DELETE /web_api/webhooks/:id        → Remover webhook
```

### Registrar um webhook

```python
# Exemplo: registrar webhook para pagamento aprovado
payload = {
    "url": "https://heziom-sync.trivia.com.br/webhooks/tray",
    "event": "transaction",
    "action": "update"
}
resp = requests.post(f"https://{api_host}/web_api/webhooks?access_token={token}", json=payload)
```

> **Requisitos do receptor:**
> - HTTPS obrigatório
> - Responder HTTP 200 em < 5 segundos
> - Tray reenvia até 3× se não receber 200

### ⚠️ Limitação da Loja de Teste (validado 20/05/2026)

O endpoint `/web_api/webhooks` retorna **404** na loja de teste `1501119` porque a loja está em status `implantacao` (não inaugurada).

**Endpoints bloqueados em lojas não-inauguradas:**
- `/webhooks` — 404
- `/invoices` — 404
- `/statuses` — 404
- `/shipping` — 404
- `/payment_methods` — 404

**Endpoints que funcionam normalmente:**
- `/orders` — ✅ 200
- `/products` — ✅ 200
- `/customers` — ✅ 200
- `/categories` — ✅ 200
- `/payments` — ✅ 200
- `/brands` — ✅ 200
- `/info` — ✅ 200

**Solução:** Webhooks precisam ser testados na **loja de produção** da Heziom (após migrar o app para lá), ou pedir à Tray para inaugurar a loja de teste. Enquanto isso, usar **polling a cada 15min** (sync agent) como fallback — funciona perfeitamente com `GET /orders?modified=YYYY-MM-DD`.

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
