---
tags: [tray, api, frete, logistica, envio, rastreio]
status: documentado
criado: 2026-05-19
fonte: Tray API v2 — developers.tray.com.br
---

# Tray — Frete e Logística (Shipping API)

> Endpoints de frete, transportadoras e rastreamento de envios.
> Integra com Correios, transportadoras privadas e cálculo de frete automático.

---

## Endpoints

```
GET    /shipping            → Listar métodos de frete configurados
POST   /shipping            → Criar/configurar método de frete
PUT    /shipping/:id        → Atualizar método
DELETE /shipping/:id        → Remover método
GET    /shipping/calculate  → Calcular frete para um destino
GET    /shipping/carriers   → Listar transportadoras disponíveis
GET    /shipments           → Listar envios/rastreios
```

---

## Calcular Frete

```
GET /shipping/calculate?zip_code=01310-100&products=[{id:123,qty:2}]
```

**Retorno:**
```json
{
  "shipping": [
    {
      "id": 1,
      "name": "Correios Sedex",
      "price": 25.90,
      "delivery_time": 3,
      "carrier": "Correios"
    },
    {
      "id": 2,
      "name": "Correios PAC",
      "price": 18.50,
      "delivery_time": 7,
      "carrier": "Correios"
    }
  ]
}
```

---

## Campos do Envio (Shipment)

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | int | ID do envio |
| `order_id` | int | FK para pedido |
| `tracking_code` | string | Código de rastreio (ex: `BR123456789BR`) |
| `carrier` | string | Transportadora |
| `shipping_method` | string | Método escolhido |
| `shipping_value` | decimal | Valor cobrado do cliente |
| `status` | string | `pending`, `shipped`, `delivered`, `returned` |
| `shipped_date` | datetime | Data de envio |
| `delivery_date` | datetime | Data de entrega |

---

## Campos do Pedido (relativos a frete)

Os seguintes campos do pedido (`GET /orders/:id`) são logísticos:

| Campo | Descrição |
|---|---|
| `shipment_value` | Valor do frete cobrado |
| `sending_code` | Código de rastreio |
| `shipment_integrator` | Integrador de frete (Correios, Mandaê, etc.) |
| `delivery_time` | Prazo estimado |

---

## Correlação com Literarius

| Dado | Literarius | Tray |
|---|---|---|
| Peso do produto | `Produto.Peso` | `product.weight` |
| Dimensões | `Produto.Altura/Largura/Profundidade` | `product.height/width/depth` |
| Volumes da NF | `NotaFiscalVolume` (24.490 registros) | — |
| Etiquetas | `LogisticaEtiqueta` (5.230) | — |
| Código de rastreio | — | `order.sending_code` |
| Transportadora | `NotaFiscal.TranspNome` | `shipment.carrier` |

> **Gap:** O Literarius tem dados da NF (peso, volumes) mas não o rastreio em tempo real. A Tray tem o rastreio mas não o detalhe fiscal do frete. HeziomOS une os dois.

---

## Oportunidades para o HeziomOS

| Funcionalidade | Como | Impacto |
|---|---|---|
| **Painel de logística** | `GET /orders?status=shipped` → listar enviados sem entrega | Alertar pedidos em trânsito há >X dias |
| **Frete grátis inteligente** | Se `order.total > R$500` → frete grátis atacado | Aumentar conversão B2B |
| **Custo de frete vs. margem** | `shipment_value / order.total` por pedido | Alertar quando frete > X% do pedido |
| **Comparação de transportadoras** | `GET /shipping/calculate` multi-destino | Escolher melhor custo/prazo |
| **Separação pendente** | Pedidos aprovados sem `sending_code` | Fila operacional para o depósito |
| **Sync peso/dimensões** | Literarius → Tray (`PUT /products/:id`) | Cálculo de frete preciso automático |

---

## Fluxo Logístico no HeziomOS

```
Pedido aprovado (Tray webhook: transaction.update)
    ↓
HeziomOS: marcar como "Aguardando separação"
    ↓
Depósito separa e embala (processo manual Heziom)
    ↓
Literarius: emite NF → gera NotaFiscalVolume
    ↓
HeziomOS: POST /invoices (vincula NF ao pedido Tray)
    ↓
Expedição: gera etiqueta → registra código de rastreio
    ↓
HeziomOS: PUT /orders/:id { sending_code: "BR123..." }
    ↓
Tray: notifica cliente por email com rastreio
    ↓
Entrega confirmada (tracking API ou webhook externo)
```

---

## Referências

- [[Tray - Pedidos]] — status e campos do pedido
- [[Tray - Invoices]] — vinculação de NF
- [[NotaFiscal]] — NF com dados de transporte
- [[Mapa Completo de APIs e Capacidades]] — visão consolidada

---

*Documentado em 2026-05-19 — JG Novais (Trivia)*
