---
tags: [tray, homologacao, evidencias, heziom-os]
status: pronto-para-anexar
criado: 2026-07-14
loja: 1501119
app: Heziom OS (id 8395)
relacionado: "[[Tray — Homologação do App (guia de preenchimento)]]"
---

# Tray — Evidências de Homologação (App Heziom OS)

> **Pacote pronto para anexar ao chamado de homologação.** Atende o mínimo exigido pela Tray:
> **≥2 POST + ≥2 PUT em ≥2 recursos diferentes**, com URLs e payloads (request/response).
> Access token **mascarado** (`***ACCESS***`) — a Tray identifica o app pelas chaves do ticket #1615764.

**Resumo:** 2 POST + 2 PUT com sucesso, em 2 recursos (**products**, **discount_coupons**), na loja de teste **1501119** (`lojatesteintegracaotray.commercesuite.com.br`). Executado em 2026-07-14.

## Como o acesso foi obtido (auth)

1. Autorização do app pela URL padrão da Tray: `GET /auth.php?response_type=code&consumer_key=<CK>&callback=<callback>` → tela "Autorização de aplicativo - Heziom OS" → o `code` (64 chars) veio no callback.
2. Troca do `code` por token: `POST /web_api/auth {consumer_key, consumer_secret, code}` → **201 Created** (access ~3h, refresh 30 dias).
3. Sanity de leitura: `GET /web_api/orders?limit=1` → **200**, `paging.total = 748` pedidos.

> Observação registrada: o **callback do app** (`www.editoraheziom.com.br/auth/tray/callback`) retorna **404** (aponta pra loja, sem handler). Não impede ler o `code` da URL, mas vale corrigir pra apontar ao backend `api.editoraheziom.com.br` (higiene — evita refazer isso a cada renovação).

---

## [POST 201] /products — criar produto

**Request**

```
POST https://lojatesteintegracaotray.commercesuite.com.br/web_api/products?access_token=***ACCESS***

{ "Product": { "name": "PRODUTO HOMOLOGACAO ...", "price": "10.00", "available": 0, "ncm": "49019900", "brand": "HEZIOM", "category_id": 0 } }
```

**Response (HTTP 201)**

```json
{ "message": "Created", "id": "1357145945", "code": 201 }
```

## [PUT 200] /products/1357145945 — atualizar produto

**Request**

```
PUT https://lojatesteintegracaotray.commercesuite.com.br/web_api/products/1357145945?access_token=***ACCESS***

{ "Product": { "price": "12.34", "stock": 77 } }
```

**Response (HTTP 200)**

```json
{ "message": "Saved", "code": 200, "id": "1357145945" }
```

## [POST 201] /discount_coupons — criar cupom

**Request**

```
POST https://lojatesteintegracaotray.commercesuite.com.br/web_api/discount_coupons?access_token=***ACCESS***

{ "DiscountCoupon": { "code": "HOMOLOG...", "description": "Cupom de homologacao Heziom OS", "type": "%", "value": "5.00", "starts_at": "2026-07-14", "ends_at": "2026-07-21", "usage_sum": 50, "for_all_products": 1, "cumulative_discount": 0 } }
```

**Response (HTTP 201)**

```json
{ "message": "Created", "id": "227", "code": 201 }
```

## [PUT 200] /discount_coupons/227 — atualizar cupom

**Request**

```
PUT https://lojatesteintegracaotray.commercesuite.com.br/web_api/discount_coupons/227?access_token=***ACCESS***

{ "DiscountCoupon": { "value": "10.00", "usage_sum": 100 } }
```

**Response (HTTP 200)**

```json
{ "message": "Saved", "code": 200, "id": "227" }
```

---

*Gerado automaticamente na loja de teste 1501119. Notas de sandbox: `PUT /orders/:id` retornou "Pedido bloqueado" nos pedidos legados (id baixo); `POST /orders/:id/invoices` (NF) tende a exigir loja fora de `implantacao` — retestar em produção se a Tray pedir cobertura desses recursos.*
