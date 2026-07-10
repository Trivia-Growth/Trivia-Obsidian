---
tags: [tray, api, financeiro, notas-fiscais]
fonte: Tray API
tipo: endpoint
---

# Tray — Invoices (`/invoices` + `/orders/:order_id/invoices`)

> ⚠️ **CORRIGIDO 08/07/2026** (ver [[Tray — Auditoria de Capacidades vs Produção]]): a EMISSÃO/registro da NF é **`POST /orders/:order_id/invoices`** (o `order_id` vai na URL, NÃO no corpo do `/invoices`). A resposta inclui o **link do DANFE (PDF)**. Consulta geral continua em `GET /invoices`.

## Endpoints

| Método | Path | Uso |
|--------|------|-----|
| `GET` | `/invoices` | Lista NFs |
| `GET` | `/invoices/:id` | Dados de uma NF |
| `GET` | `/orders/:order_id/invoices` | NF(s) de um pedido |
| `POST` | `/orders/:order_id/invoices` | **Registra NF no pedido** (após emissão no Literarius) — retorna link do DANFE |
| `PUT` | `/invoices/:id` | Atualiza dados da NF |

> ~~`POST /invoices` · `GET /invoices?order_id=:id`~~ — paths antigos/errados; usar as rotas por pedido acima.

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
3. `POST /orders/:order_id/invoices` na Tray com a chave de acesso → vincula NF ao pedido (retorna link do DANFE)

---

## Usada por

- [[Pedidos e Vendas]]

Ver: [[_a mapear]] · [[Tray - Pedidos]]
