---
tags: [tray, sync, supabase, raspberry-pi, estratégia]
status: planejado
criado: 2026-05-19
---

# Tray — Sync Agent: Endpoints e Estratégia

> Quais endpoints sincronizar, com que frequência, como mapear para o Supabase,
> e como integrar com o sync do Literarius.

---

## Decisão: por que sincronizar a Tray além do Literarius?

O Literarius já recebe os pedidos Tray via `SiteIdPedido`. Mas a Tray tem dados que o Literarius **não captura**:

| Dado | Tray tem | Literarius tem | Por que importa |
|---|---|---|---|
| Status em tempo real do pedido | ✅ | ⚠️ defasado | Operação: separação, envio, entrega |
| Taxa exata do gateway por transação | ✅ | ❌ | Receita líquida real do e-commerce |
| Código de rastreio (Correios/transportadora) | ✅ | ❌ | Logística e SAC |
| Cupons e códigos de desconto usados | ✅ | ❌ | Análise de campanhas de marketing |
| `price_seller` (valor líquido pós-taxa) | ✅ | ❌ | DRE: receita líquida do canal Site |
| Webhooks de eventos (pagamento, cancelamento) | ✅ | ❌ | Reação em tempo real |

**Conclusão:** o sync da Tray complementa o Literarius. Juntos cobrem 100% do ciclo de um pedido e-commerce.

---

## Endpoints a sincronizar

### Prioridade 🔴 Alta — sincronizar desde o dia 1

| Endpoint | Frequência | Tabela Supabase | Chave de conciliação |
|---|---|---|---|
| `GET /orders` | **15 min** (delta) | `tray_orders` | `id` → `lit_pedido_venda.SiteIdPedido` |
| `GET /payments` | **15 min** (delta) | `tray_payments` | `order_id` → `tray_orders.id` |

### Prioridade 🟡 Média — sincronizar na fase 2

| Endpoint | Frequência | Tabela Supabase | Uso |
|---|---|---|---|
| `GET /invoices` | 1× dia | `tray_invoices` | Confirmar NFs emitidas e vinculadas |
| `GET /products` | 1× dia | `tray_products` | Conciliar `SiteID` com `Produto.Codigo` |
| `GET /customers` | 1× dia | `tray_customers` | CRM básico do e-commerce |

### Prioridade ⚪ Baixa — fase 3 ou sob demanda

| Endpoint | Uso |
|---|---|
| `GET /shipments` | Rastreio detalhado de entregas |
| `GET /coupons` | Análise de cupons e promoções |
| `GET /payment-options` | Catálogo de formas de pagamento |

---

## Schema Supabase — tabelas Tray

### `tray_orders`

```sql
CREATE TABLE tray_orders (
    id                   BIGINT PRIMARY KEY,        -- Tray order.id
    store_id             INT NOT NULL,
    date                 DATE,
    status               TEXT,
    status_id            INT,
    customer_id          BIGINT,
    partial_total        NUMERIC(12,2),
    discount             NUMERIC(12,2),
    shipment_value       NUMERIC(12,2),
    taxes                NUMERIC(12,2),
    total                NUMERIC(12,2),
    payment_method       TEXT,
    payment_method_rate  NUMERIC(6,4),
    installment          INT,
    sending_code         TEXT,                       -- código de rastreio
    shipment_integrator  TEXT,                       -- transportadora
    payment_date         TIMESTAMPTZ,
    -- Chave de conciliação com Literarius
    lit_pedido_id        BIGINT,                     -- PedidoVenda.idPedidoVenda (após JOIN)
    lit_nota_fiscal_id   BIGINT,                     -- NotaFiscal.idNotaFiscal (após JOIN)
    -- Controle de sync
    synced_at            TIMESTAMPTZ DEFAULT NOW(),
    updated_at           TIMESTAMPTZ
);

CREATE INDEX ON tray_orders (date);
CREATE INDEX ON tray_orders (status);
CREATE INDEX ON tray_orders (customer_id);
```

### `tray_payments`

```sql
CREATE TABLE tray_payments (
    id                   BIGINT PRIMARY KEY,        -- Tray payment.id
    order_id             BIGINT REFERENCES tray_orders(id),
    payment_method       TEXT,
    type                 TEXT,                       -- bank_billet, credit_card, pix
    value                NUMERIC(12,2),
    plots                INT,
    tax                  NUMERIC(6,4),
    status               TEXT,
    transaction_id       TEXT,
    date_transaction     TIMESTAMPTZ,
    price_payment        NUMERIC(12,2),              -- valor cobrado ao cliente
    price_seller         NUMERIC(12,2),              -- valor líquido recebido (pós-taxa)
    synced_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON tray_payments (order_id);
CREATE INDEX ON tray_payments (status);
CREATE INDEX ON tray_payments (date_transaction);
```

---

## Queries de análise — usando Tray + Literarius juntos

### Receita líquida do canal Site (após taxa gateway)
```sql
-- Faturamento bruto (Literarius) × taxa gateway (Tray) = receita líquida real
SELECT
    DATE_TRUNC('day', o.date)           AS dia,
    COUNT(DISTINCT o.id)                AS pedidos,
    SUM(o.total)                        AS bruto,
    SUM(p.price_seller)                 AS liquido_pos_taxa,
    SUM(o.total) - SUM(p.price_seller)  AS taxa_total_gateway,
    ROUND(
        (SUM(o.total) - SUM(p.price_seller)) / NULLIF(SUM(o.total), 0) * 100, 2
    )                                   AS pct_taxa
FROM tray_orders o
JOIN tray_payments p ON p.order_id = o.id AND p.status = 'approved'
WHERE o.date BETWEEN '2026-05-01' AND '2026-05-15'
GROUP BY 1 ORDER BY 1;
```

### Conversão: pedidos aprovados → NF emitida (detecta gaps)
```sql
-- Pedidos aprovados na Tray que ainda não têm NF no Literarius
SELECT
    o.id          AS tray_order_id,
    o.date,
    o.total,
    o.status
FROM tray_orders o
WHERE o.status = 'aprovado'
  AND o.lit_nota_fiscal_id IS NULL   -- ainda sem NF
  AND o.date >= '2026-05-01'
ORDER BY o.date DESC;
```

### Ticket médio e formas de pagamento
```sql
SELECT
    p.payment_method,
    p.type,
    COUNT(*)                    AS transacoes,
    AVG(o.total)                AS ticket_medio,
    AVG(p.tax * 100)            AS taxa_media_pct,
    SUM(p.price_seller)         AS liquido_total
FROM tray_payments p
JOIN tray_orders o ON o.id = p.order_id
WHERE p.status = 'approved'
  AND o.date BETWEEN '2026-05-01' AND '2026-05-15'
GROUP BY 1, 2
ORDER BY transacoes DESC;
```

---

## Fluxo de sync Tray — pseudocódigo do Raspberry Pi

```python
# sync_tray.py — executa a cada 15 min via cron

from tray_auth import get_valid_token      # renova se necessário
from tray_client import tray_fetch_all, limiter
from supabase_client import upsert_batch
from sync_state import get_last_sync, save_last_sync

def sync_orders():
    token, api_host = get_valid_token()
    ultima_sync = get_last_sync("tray_orders")

    novos = tray_fetch_all(
        "orders",
        params={"date": f"{ultima_sync},{hoje()}"},
        access_token=token,
        api_host=api_host,
        limiter=limiter,
    )

    if novos:
        # Enriquecer com lit_pedido_id (JOIN com Literarius via SiteIdPedido)
        for o in novos:
            o["lit_pedido_id"] = buscar_pedido_literarius(o["id"])

        upsert_batch("tray_orders", novos, conflict_column="id")
        print(f"Tray orders: {len(novos)} upserted")

    save_last_sync("tray_orders", hoje())

def sync_payments():
    token, api_host = get_valid_token()
    ultima_sync = get_last_sync("tray_payments")

    pagamentos = tray_fetch_all(
        "payments",
        params={"date": f"{ultima_sync},{hoje()}"},
        access_token=token,
        api_host=api_host,
        limiter=limiter,
    )

    if pagamentos:
        upsert_batch("tray_payments", pagamentos, conflict_column="id")
        print(f"Tray payments: {len(pagamentos)} upserted")

    save_last_sync("tray_payments", hoje())

if __name__ == "__main__":
    sync_orders()
    sync_payments()
```

---

## Integração com Webhooks (fase 2)

Para reação em tempo real (sem polling de 15 min), configurar webhooks na Tray:

```python
# Endpoint Flask no Raspberry Pi (ou Supabase Edge Function)
from flask import Flask, request

app = Flask(__name__)

@app.route("/webhook/tray", methods=["POST"])
def tray_webhook():
    event = request.json
    tipo = event.get("type")

    if tipo == "payment_approved":
        order_id = event["data"]["order_id"]
        # Baixar TituloFinanceiro no Literarius (via Supabase RPC)
        baixar_titulo_financeiro(order_id)

    elif tipo == "order_cancelled":
        order_id = event["data"]["order_id"]
        # Cancelar NF e título se existirem
        cancelar_pedido(order_id)

    return {"status": "ok"}, 200
```

> Ver [[Tray - Webhooks]] — lista completa de eventos disponíveis.

---

## Checklist de implementação

- [x] Obter `code` via OAuth URL direto (20/05/2026 — loja 1501119)
- [x] Executar `POST /web_api/auth` → tokens obtidos e refresh validado
- [x] Testar `GET /web_api/orders` → retorno confirmado, 2 pedidos na loja de teste
- [x] Testar `GET /web_api/products` → catálogo ok, EAN e stock confirmados
- [x] Testar `PUT /web_api/products/:id` (stock update) → funcional
- [ ] Criar tabelas `tray_orders` e `tray_payments` no Supabase
- [ ] Implementar `sync_tray.py` com rate limiter e paginação
- [ ] Adicionar ao cron do Raspberry Pi (a cada 15 min)
- [ ] Implementar JOIN `tray_orders.id` ↔ `lit_pedido_venda.SiteIdPedido`
- [ ] Testar query de receita líquida (bruto × taxa gateway)
- [ ] Resolver webhook endpoint — bloqueado porque loja está em `implantacao`. Opções: inaugurar loja teste ou testar em produção
- [ ] Migrar para loja de produção da Heziom
- [ ] Solicitar homologação à Tray até **13/08/2026**

## Notas técnicas da validação (20/05/2026)

- **Endpoint base:** `/web_api/` (sem `/v2/`) — tanto para auth quanto para dados
- **Stock update:** Usar `PUT /web_api/products/:id` com body `{"Product": {"stock": "N"}}`, NÃO existe endpoint `/products/:id/stock` dedicado
- **Invoices:** Endpoint `GET /invoices` retorna 404 — provável que seja `GET /orders/:id/invoices` ou precisa de pedido com NF vinculada
- **Webhooks:** `GET /hooks` retorna 404 — pode ser limitação do sandbox ou escopo insuficiente no app
- **Filtro incremental:** Usar `?modified=YYYY-MM-DD` ou `?date=YYYY-MM-DD,YYYY-MM-DD` para sync delta

---

## Referências

- [[Tray - Autenticação]] — fluxo OAuth completo com código
- [[Tray - Rate Limit e Paginação]] — rate limiter e paginação
- [[Tray - Pedidos]] — campos detalhados
- [[Tray - Pagamentos]] — campos de pagamento
- [[Tray - Webhooks]] — eventos disponíveis
- [[Tray — Correlação com Literarius]] — mapa completo de correlação
- [[Réplica Supabase — Schema e Estratégia de Sync]] — schema Supabase do Literarius
- [[ADR-001 — Sync Agent no Raspberry Pi]] — arquitetura do agente

---

*Documentado em 2026-05-19 — JG Novais (Trivia)*
