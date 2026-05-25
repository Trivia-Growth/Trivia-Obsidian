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

## ⚠️ CORREÇÃO: Webhooks NÃO têm endpoint de API (confirmado pelo suporte 25/05/2026)

O suporte da Tray confirmou que:
- **`/web_api/hooks` NÃO EXISTE** na plataforma
- **`/web_api/webhooks` NÃO EXISTE** na plataforma
- Não há endpoint REST para registrar/listar/remover webhooks via API

### Como registrar webhooks na Tray (processo real)

O registro é **manual, via ticket de suporte**:

1. Abrir chamado em: https://atendimento.tray.com.br/hc/pt-br/requests/new
2. Selecionar: **TRAY DESENVOLVEDORES** → **INTEGRAÇÕES API**
3. Informar: nome do aplicativo + URL de notificação (HTTPS)
4. Inicialmente apenas o scope `order` é habilitado — solicitar scopes adicionais no mesmo ticket

> **Importante:** Não existe gerenciamento de webhooks self-service. Qualquer alteração (nova URL, novos scopes) requer novo ticket.

### Requisitos do receptor

- HTTPS obrigatório
- Responder HTTP 200 (Tray reenvia por até ~20 dias com backoff)
- Implementar idempotência — mesmo evento pode chegar mais de uma vez
- Notificações só disparam para eventos **após** ativação (sem backfill histórico)

---

## Rotas corrigidas (confirmação do suporte 25/05/2026)

| Rota que testamos (ERRADA) | Rota correta | Doc |
|---|---|---|
| `/web_api/hooks` | **NÃO EXISTE** | — |
| `/web_api/invoices` | `/web_api/orders/invoices` | [API de Nota Fiscal](https://developers.tray.com.br/#api-de-nota-fiscal) |
| `/web_api/statuses` | `/web_api/orders/statuses` | [API de Status do Pedido](https://developers.tray.com.br/#api-de-status-do-pedido) |
| `/web_api/shipping` | `/web_api/shippings` | [Listagem de Formas de Envio](https://developers.tray.com.br/#listagem-de-formas-de-envio-get) |
| `/web_api/payment_methods` | `/web_api/payments/options` | [Opções de Pagamentos](https://developers.tray.com.br/#opcoes-de-pagamentos-get) |

> **Conclusão:** Os 404 que reportamos NÃO eram por conta da loja não-inaugurada — eram rotas incorretas. As rotas corretas acima devem funcionar na loja de teste normalmente.

---

## Estratégia atualizada para o HeziomOS

1. **Abrir ticket na Tray** solicitando ativação de webhook para o app HeziomOS com a URL de callback
2. **Solicitar todos os scopes:** `order`, `product`, `product_price`, `product_stock`, `variant`, `customer`
3. **Enquanto o ticket não é atendido:** manter polling via sync agent (`GET /web_api/orders?modified=YYYY-MM-DD` a cada 15min)
4. **Após ativação:** webhook como trigger primário, polling como fallback de segurança

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
