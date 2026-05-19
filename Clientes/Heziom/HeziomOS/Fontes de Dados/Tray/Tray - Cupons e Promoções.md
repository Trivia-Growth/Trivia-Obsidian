---
tags: [tray, api, cupons, promocoes, marketing, roi]
status: documentado
criado: 2026-05-19
fonte: Tray API v2 — developers.tray.com.br
---

# Tray — Cupons e Promoções (Coupons API)

> Gestão de cupons de desconto e campanhas promocionais.
> Base para medir ROI de marketing cruzando com dados financeiros do Literarius.

---

## Endpoints

```
GET    /coupons             → Listar cupons/promoções
GET    /coupons/:id         → Detalhe do cupom
POST   /coupons             → Criar cupom
PUT    /coupons/:id         → Atualizar cupom
DELETE /coupons/:id         → Remover cupom
```

---

## Campos do Cupom

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | int | ID interno |
| `code` | string | Código do cupom (ex: `LANCAMENTO20`) |
| `description` | string | Descrição interna |
| `type` | string | `fixed` (valor fixo) ou `percentage` (%) |
| `value` | decimal | Valor do desconto (R$ ou %) |
| `min_value` | decimal | Valor mínimo de compra para aplicar |
| `limit` | int | Máximo de usos (0 = ilimitado) |
| `limit_per_customer` | int | Máximo por cliente |
| `date_start` | date | Início da validade |
| `date_end` | date | Fim da validade |
| `status` | string | `active`, `inactive`, `expired` |
| `free_shipping` | boolean | Se dá frete grátis |
| `categories` | array | Categorias em que se aplica |
| `products` | array | Produtos específicos |

---

## Cupom no Pedido

Quando um cliente usa um cupom, o pedido (`GET /orders/:id`) traz:

| Campo | Descrição |
|---|---|
| `discount_coupon` | Código do cupom usado |
| `discount` | Valor total de desconto concedido |

---

## Análise de ROI — cruzamento com Literarius

```
Tray: GET /orders WHERE discount_coupon IS NOT NULL
    ↓ JOIN com tray_orders em Supabase
    ↓ GROUP BY discount_coupon
HeziomOS calcula:
    - Receita bruta por campanha
    - Desconto total concedido
    - Número de pedidos por cupom
    ↓ JOIN com lit_titulo_financeiro via SiteIdPedido
HeziomOS calcula:
    - Receita líquida real (após gateway, via price_seller)
    - CMV dos itens vendidos (via Literarius custo)
    - Margem real por campanha
```

---

## Exemplos de Cupons para Editora

| Código | Tipo | Valor | Cenário |
|---|---|---|---|
| `LANCAMENTO20` | percentage | 20% | Lançamento de livro novo |
| `FRETEGRATIS` | free_shipping | — | Campanha de frete grátis |
| `PASTOR15` | percentage | 15% | Desconto para pastores/igrejas |
| `KIT50` | fixed | R$ 50 | R$50 off em kits acima de R$200 |
| `NATAL2026` | percentage | 10% | Campanha sazonal |

---

## Oportunidades para o HeziomOS

| Funcionalidade | Como | Impacto |
|---|---|---|
| **Painel de ROI por campanha** | Cupom → pedidos → NF → receita líquida | Saber quais campanhas dão lucro real |
| **Alerta de margem comprimida** | Se desconto + taxa gateway > X% → alerta | Evitar vender com prejuízo |
| **Cupom por tipo de cliente** | Literarius `TipoCliente` → cupom exclusivo | Estratégia B2B vs B2C |
| **Cupom automático para recompra** | Cliente sem compra há 60 dias → cupom | Retenção automática |
| **Limite por CMV** | Desconto máximo = preço − CMV − royalties | Nunca vender abaixo do custo |

---

## Referências

- [[Tray - Pedidos]] — campo `discount_coupon` no pedido
- [[Tray - Pagamentos]] — `price_seller` para receita líquida
- [[Roadmap de Integração Tray × Literarius]] — Fase 2.3 (análise de cupons)
- [[Mapa Completo de APIs e Capacidades]] — visão consolidada

---

*Documentado em 2026-05-19 — JG Novais (Trivia)*
