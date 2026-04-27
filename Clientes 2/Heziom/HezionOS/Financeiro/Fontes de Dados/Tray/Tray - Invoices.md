---
tags: [tray, api, financeiro, notas-fiscais]
fonte: Tray API
tipo: endpoint
---

# Tray — Invoices (`/invoices`)

## Endpoints

| Método | Path | Uso |
|--------|------|-----|
| `GET` | `/invoices` | Lista NFs |
| `GET` | `/invoices/:id` | Dados de uma NF |
| `GET` | `/invoices?order_id=:id` | NF por pedido |
| `POST` | `/invoices` | Registra NF na Tray (após emissão no Literarius) |
| `PUT` | `/invoices/:id` | Atualiza dados da NF |

---

## Campos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | int | ID da invoice na Tray |
| `order_id` | int | FK → [[Tray - Pedidos]] |
| `invoice_number` | string | Número da NF |
| `series` | string | Série da NF |
| `issue_date` | date | Data de emissão |
| `access_key` | string | Chave de acesso NF-e (44 dígitos) — mesmo que `NotaFiscal.NFeChave` |
| `url` | string | URL do DANFE/XML |
| `value` | decimal | Valor total da NF |

---

## Conciliação com Literarius

```
Tray invoice.order_id    →  NotaFiscal.SiteIdPedido
Tray invoice.access_key  =  NotaFiscal.NFeChave
Tray invoice.value       ≈  NotaFiscal.TotalNota
```

**Fluxo recomendado:**
1. Pedido aprovado na Tray (`order.status = aprovado`)
2. Emitir NF no Literarius → gera `NotaFiscal` com `NFeChave`
3. POST `/invoices` na Tray com a chave de acesso → vincula NF ao pedido

---

## Usada por

- [[Pedidos e Vendas]]

Ver: [[_a mapear]] · [[Tray - Pedidos]]
