---
tags: [tray, api, financeiro, indice]
fonte: Tray API
tipo: índice
---

# Tray API — Índice

Base URL: `https://{api_address}/web_api/v2/`
Autenticação: `access_token` em todos os requests (query param ou header)
Rate limit: **180 req/min** · 10.000 req/dia (padrão) · 50.000 req/dia (corporativo)

**Status:** Credenciais recebidas ✅ · `code` pendente (login manual) · Prazo homologação: 13/08/2026

---

## Endpoints mapeados

| Nota | Endpoint | Relevância |
|------|----------|------------|
| [[Tray - Autenticação]] | `POST /auth`, `GET /auth?refresh_token=` | Credenciais + fluxo OAuth completo + código Python ✅ |
| [[Tray - Pedidos]] | `GET /orders`, `GET /orders/:id/complete` | Receita bruta, descontos, frete |
| [[Tray - Pagamentos]] | `GET /payments`, `GET /payment-options` | Status de liquidação, taxa gateway, `price_seller` |
| [[Tray - Invoices]] | `GET /invoices` | NFs emitidas e vinculadas ao pedido |
| [[Tray - Webhooks]] | notificações POST | Eventos em tempo real (pagamento, cancelamento) |
| [[Tray - Rate Limit e Paginação]] | — | Rate limiter + paginação completa com código Python ✅ |
| [[Tray - Sync Agent — Endpoints e Estratégia]] | — | Schema Supabase, queries, checklist de implementação ✅ |

---

## Correlação com Literarius

[[Tray — Correlação com Literarius]] — mapa completo campo a campo, fluxo de um pedido do início ao fim, queries de conciliação prontas.

```
Tray: order.id
  ↕
Literarius: PedidoVenda.SiteIdPedido
           NotaFiscal.SiteIdPedido
```

---

## Módulos relacionados

- [[Pedidos e Vendas]]
- [[Contas a Receber]]
- [[DRE e Fluxo de Caixa]]
