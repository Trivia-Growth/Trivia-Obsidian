---
tags: [tray, api, financeiro, indice]
fonte: Tray API
tipo: índice
---

# Tray API — Índice

Base URL: `https://{api_address}/web_api/v2/`
Autenticação: `access_token` em todos os requests (query param ou header)
Rate limit: 180 req/min · 10.000 req/dia (padrão) · 50.000 req/dia (corporativo)

---

## Endpoints mapeados

| Nota | Endpoint | Relevância financeira |
|------|----------|-----------------------|
| [[Tray - Pedidos]] | `GET /orders`, `GET /orders/:id/complete` | Receita bruta, descontos, frete |
| [[Tray - Pagamentos]] | `GET /payments`, `GET /payment-options` | Status de liquidação, parcelas, taxas |
| [[Tray - Invoices]] | `GET /invoices` | NFs emitidas pelo e-commerce |
| [[Tray - Webhooks]] | notificações POST | Eventos em tempo real |
| [[Tray - Autenticação]] | `POST /auth`, `GET /auth?refresh_token=` | Credenciais de acesso |

---

## Chave de conciliação com Literarius

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
