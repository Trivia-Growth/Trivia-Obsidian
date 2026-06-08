---
tags: [heziom, amazon, seller-central, sp-api, marketplace, automação, mapeamento]
status: documentado
criado: 2026-06-08
fonte: Amazon SP-API Documentation (developer-docs.amazon.com/sp-api)
módulo: Comercial
---

# Amazon Seller Central — Mapeamento e Automação (3P)

> Mapeamento técnico completo da SP-API para operações de **Seller Central (3P)**. Inclui todos os endpoints, rate limits, distinção read/write, notas Brasil e prioridades de integração no HeziomOS.
> Referência: [[Índice Comercial]] · [[Amazon Vendor Central — Mapeamento e Automação]] · [[CDQ — Sistema de Cadastro Multi-Plataforma]]

---

## 1. Contexto

| Item | Dado |
|---|---|
| **Modelo** | Seller Central 3P — Heziom lista, precifica e envia |
| **Marketplace** | Amazon.com.br (`MarketplaceId: A2Q3Y263D00KWC`) |
| **Portal** | sellercentral.amazon.com.br |
| **Endpoint API** | `https://sellingpartnerapi-na.amazon.com` (Brasil usa região NA) |
| **Auth** | OAuth 2.0 (LWA) + Signature V4 |
| **Fluxo atual** | Pedidos → Tray → NF Literarius |
| **Gap atual** | Tudo fora do fluxo de pedidos: account health, saques, atendimento, devoluções |

---

## 2. O que a Tray já resolve (não duplicar)

| Operação | Via |
|---|---|
| Recebimento de pedidos | Tray nativa |
| Atualização de tracking/status | Tray nativa |
| Emissão de NF | Literarius (trigger pós-pedido Tray) |
| Upload de catálogo | CDQ → portal manual |

---

## 3. Mapeamento Completo SP-API — Seller

---

### 3.1 Orders API v0

**O que faz:** Lê e gerencia pedidos do Seller Central — o dado mais crítico para integração com Literarius e o dashboard comercial.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | GET | `/orders-v0/orders` | Lista pedidos (filtros: status, data, marketplace) | R | 0,0167 | 20 |
| 2 | GET | `/orders-v0/orders/{orderId}` | Detalhe de um pedido | R | 0,5 | 30 |
| 3 | GET | `/orders-v0/orders/{orderId}/buyerinfo` | Dados do comprador (nome, e-mail) | R | 0,5 | 30 |
| 4 | GET | `/orders-v0/orders/{orderId}/address` | Endereço de entrega | R | 0,5 | 30 |
| 5 | GET | `/orders-v0/orders/{orderId}/orderitems` | Itens do pedido (SKU, qtd, preço) | R | 0,5 | 30 |
| 6 | GET | `/orders-v0/orders/{orderId}/orderitems/buyerinfo` | Info do comprador por item | R | 0,5 | 30 |
| 7 | POST | `/orders-v0/orders/{orderId}/shipment` | Atualiza status de envio | W | 5 | 15 |
| 8 | GET | `/orders-v0/orders/{orderId}/regulatedinfo` | Info fiscal/regulatória (NF-e) | R | 0,5 | 30 |
| 9 | PATCH | `/orders-v0/orders/{orderId}/verification` | Atualiza status de verificação | W | 0,5 | 30 |
| 10 | POST | `/orders-v0/orders/{orderId}/confirm-shipment` | Confirma envio com tracking | W | 2 | 10 |

**Dados disponíveis por pedido:** orderId, purchaseDate, orderStatus, fulfillmentChannel, salesChannel, orderTotal (BRL), numberOfItemsShipped, numberOfItemsUnshipped, paymentMethod, buyerEmail, shipmentServiceLevelCategory.

**Retenção histórica:** Últimos 2 anos. Pedidos mais antigos só via Reports API.

**Nota Brasil:** `regulatedinfo` retorna dados para conformidade com NF-e. Usar junto com Literarius para emissão automática.

**Uso HeziomOS:**
- Sync automático de pedidos no dashboard comercial
- Trigger de NF no Literarius ao receber novo pedido
- `confirmShipment` automático após tracking registrado na expedição

---

### 3.2 Listings Items API v2021-08-01

**O que faz:** Cria, atualiza e remove listings programaticamente — peça-chave da integração CDQ → Amazon.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | GET | `/listings/2021-08-01/items` | Busca listings do seller (filtros por SKU, status) | R | 5 | 5 |
| 2 | GET | `/listings/2021-08-01/items/{sellerId}/{sku}` | Detalhe de um listing específico | R | 5 | 5 |
| 3 | PUT | `/listings/2021-08-01/items/{sellerId}/{sku}` | Cria ou substitui listing completo | W | 5 | 5 |
| 4 | PATCH | `/listings/2021-08-01/items/{sellerId}/{sku}` | Atualiza campos específicos (preço, estoque, título) | W | 5 (validação: 20) | 5 |
| 5 | DELETE | `/listings/2021-08-01/items/{sellerId}/{sku}` | Remove listing | W | 5 | 5 |

**Campos editáveis via PATCH:** `purchasable_offer` (preço), `fulfillment_availability` (estoque), `product_description`, `bullet_points`, `generic_keyword`.

**Operações em batch:** PATCH aceita até 500 itens por chamada em modo feed — reduz impacto de throttling.

**Nota Brasil:** Requer `Product Type Definitions API` para compliance de categoria. Livros: `BOOK` como product type. ISBN como identificador principal.

**Uso HeziomOS:**
- CDQ cadastra livro → PUT automático publica na Amazon
- Atualização de estoque em massa (quando Literarius atualiza posição)
- Remover listing quando livro esgotado definitivamente

---

### 3.3 Finances API v0 + v2024-06-19

**O que faz:** Retorna todos os eventos financeiros em tempo real — vendas, taxas, reembolsos, deduções — sem esperar fechamento mensal.

**v0 — Endpoints:**

| # | Método | Endpoint | Operação | R/W | Rate (req/s) |
|---|---|---|---|---|---|
| 1 | GET | `/finances/v0/financialEventGroups` | Lista grupos de liquidação (settlements) | R | 0,5 |
| 2 | GET | `/finances/v0/financialEventGroups/{groupId}/financialEvents` | Todos os eventos de um settlement | R | 0,5 |
| 3 | GET | `/finances/v0/orders/{orderId}/financialEvents` | Eventos de um pedido específico | R | 0,5 |
| 4 | GET | `/finances/v0/financialEvents` | Todos os eventos por intervalo de datas | R | 0,5 |

**v2024-06-19 — Novos endpoints:**

| # | Método | Endpoint | Operação | R/W |
|---|---|---|---|---|
| 5 | GET | `/finances/v2024-06-19/transactions` | Lista transações com filtros avançados | R |

**Tipos de evento financeiro disponíveis:** `ShipmentEvent`, `RefundEvent`, `GuaranteeClaimEvent`, `ChargebackEvent`, `PayWithAmazonEvent`, `ServiceFeeEvent`, `RetroChargeSalesTaxEvent`, `RentalTransactionEvent`, `SellerReviewEnrollmentPaymentEvent`, `FBALiquidationEvent`, `DebtRecoveryEvent`, `LoanServicingEvent`.

**Nota Brasil:** Eventos incluem ICMS e outros impostos BR. Campo `TaxWithheld` presente para retenções. Moeda BRL nas transações Amazon.com.br.

**Uso HeziomOS:**
- Reconciliação automática diária: receita Amazon × Literarius
- Detectar `ChargebackEvent` e `GuaranteeClaimEvent` automaticamente → alertar atendimento
- Alimentar KR3 (Dia a Dia Financeiro) com dados Amazon em tempo real
- Calcular margem líquida por pedido (preço venda − tarifa Amazon − frete)

---

### 3.4 Messaging API v1

**O que faz:** Envia mensagens pré-aprovadas pela Amazon para compradores. Não substitui atendimento livre — apenas tipos definidos.

| # | Método | Endpoint | Operação | R/W |
|---|---|---|---|---|
| 1 | GET | `/messaging/v1/orders/{orderId}/messages` | Lista ações de mensagem disponíveis para o pedido | R |
| 2 | POST | `.../messages/confirmCustomizationDetails` | Confirma detalhes de personalização | W |
| 3 | POST | `.../messages/confirmDeliveryDetails` | Confirma detalhes de entrega | W |
| 4 | POST | `.../messages/legalDisclosure` | Envia divulgação legal obrigatória | W |
| 5 | POST | `.../messages/confirmOrderDetails` | Confirma detalhes do pedido | W |
| 6 | POST | `.../messages/confirmServiceDetails` | Confirma detalhes de serviço | W |
| 7 | POST | `.../messages/warranty` | Envia informações de garantia | W |
| 8 | POST | `.../messages/digitalAccessKey` | Envia chave de acesso digital (e-books) | W |
| 9 | POST | `.../messages/unexpectedProblem` | Notifica problema inesperado no pedido | W |
| 10 | POST | `.../messages/invoice` | Envia NF ao comprador | W |
| 11 | GET | `/messaging/v1/attributes` | Retorna atributos de mensagem disponíveis | R |

**Limitação crítica:** Apenas tipos listados acima. Respostas a mensagens livres dos compradores (perguntas, reclamações) **somente via portal**. `legalDisclosure` exige conformidade com CDC (Código de Defesa do Consumidor) em PT-BR.

**Uso HeziomOS:**
- Auto-envio de NF via `invoice` após despacho
- Confirmação de entrega automática após tracking atualizado

---

### 3.5 Notifications API v1

**O que faz:** Infraestrutura de webhooks — elimina polling, entrega eventos em tempo real via AWS EventBridge ou SQS.

**Endpoints de gestão:**

| # | Método | Endpoint | Operação | R/W |
|---|---|---|---|---|
| 1 | POST | `/notifications/v1/destinations` | Cria destino (EventBridge ARN ou SQS URL) | W |
| 2 | GET | `/notifications/v1/destinations` | Lista destinos configurados | R |
| 3 | GET | `/notifications/v1/destinations/{destinationId}` | Detalhe de um destino | R |
| 4 | DELETE | `/notifications/v1/destinations/{destinationId}` | Remove destino | W |
| 5 | POST | `/notifications/v1/subscriptions/{notificationType}` | Cria assinatura de evento | W |
| 6 | GET | `/notifications/v1/subscriptions/{notificationType}` | Consulta assinatura ativa | R |
| 7 | GET | `/notifications/v1/subscriptions/{notificationType}/{subscriptionId}` | Detalhe de assinatura | R |
| 8 | DELETE | `/notifications/v1/subscriptions/{notificationType}/{subscriptionId}` | Remove assinatura | W |
| 9 | POST | `/notifications/v1/notifications/test/{notificationType}` | Dispara notificação de teste | W |

**Todos os tipos de evento disponíveis para Sellers:**

| Evento | Trigger | Prioridade Heziom |
|---|---|---|
| `ORDER_CHANGE` | Novo pedido ou mudança de status | 🔴 CRÍTICO |
| `ITEM_ORDER_RETURN_BUYER_REQUESTED` | Comprador solicitou devolução | 🔴 CRÍTICO |
| `ANY_OFFER_CHANGED` | Mudança no top-20 ofertas / Buy Box | 🟠 Alta |
| `ACCOUNT_STATUS_CHANGED` | Conta em risco / suspensa | 🔴 CRÍTICO |
| `BRANDED_ITEM_CONTENT_CHANGE` | Título/descrição/imagem de ASIN alterado | 🟠 Alta |
| `LISTING_DATA_QUALITY_CHANGED` | Completude do listing degradou | 🟠 Alta |
| `PRODUCT_FEES_CHANGED` | Mudança de tarifas da Amazon | 🟡 Média |
| `SHIPMENT_STATE_CHANGE` | Estado do envio atualizado | 🟡 Média |
| `FBA_INVENTORY_AVAILABILITY_CHANGES` | Estoque FBA mudou (se usar FBA) | 🟡 Média |
| `FBA_OUTBOUND_ORDER_STATUS_CHANGE` | Status MCF atualizado (se usar MCF) | 🟡 Média |
| `EXTERNAL_FULFILLMENT_SHIPMENT_STATUS_CHANGE` | Integração warehouse externa | 🟡 Média |
| `REPORT_PROCESSING_FINISHED` | Relatório gerado e pronto para download | 🟡 Média |
| `B2B_ANY_OFFER_CHANGED` | Mudança em ofertas B2B | ⚪ Baixa |
| `DETAIL_PAGE_TRAFFIC_EVENT` | Métricas de tráfego por ASIN (horário) | ⚪ Baixa |

**Uso HeziomOS:**
- `ORDER_CHANGE` → trigger automático: criar pedido no Literarius + emitir NF
- `ITEM_ORDER_RETURN_BUYER_REQUESTED` → alerta imediato para atendimento + iniciar processo de autorização
- `ACCOUNT_STATUS_CHANGED` → alerta urgente para Comercial se conta entrar em `AT_RISK` ou `DEACTIVATED`
- `LISTING_DATA_QUALITY_CHANGED` → alerta para Editorial quando listing for degradado

---

### 3.6 Catalog Items API v2022-04-01

**O que faz:** Pesquisa e consulta o catálogo global da Amazon por ASIN, ISBN, EAN, SKU — fundamental para CDQ.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | GET | `/catalog/2022-04-01/items` | Busca por keywords ou identificadores (máx. 20 por chamada) | R | 5 | 5 |
| 2 | GET | `/catalog/2022-04-01/items/{asin}` | Detalhe completo de um ASIN | R | 5 | 5 |

**Parâmetros de busca:** `identifiers` (ASIN/EAN/GTIN/ISBN/SKU/UPC), `keywords`, `brandNames`, `classificationIds`, `pageSize` (1–20), `locale`.

**Dados retornados por ASIN:** `attributes`, `classifications`, `dimensions`, `identifiers`, `images`, `productTypes`, `relationships`, `salesRanks`, `summaries`, `vendorDetails`.

**Uso HeziomOS / CDQ:**
- Verificar se ISBN já existe na Amazon antes de criar listing
- Buscar ASIN correspondente a um ISBN para completar cadastro no CDQ
- Verificar ranking de vendas de concorrentes por categoria

---

### 3.7 Product Pricing API v0

**O que faz:** Dados de preços competitivos, ofertas ativas e rastreamento de Buy Box em tempo real.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) |
|---|---|---|---|---|---|
| 1 | GET | `/pricing/v0/pricing` | Preço atual dos próprios listings | R | 1 |
| 2 | GET | `/pricing/v0/competitivePricing` | Preços competitivos e Buy Box por ASIN | R | 1 |
| 3 | GET | `/pricing/v0/listingOffers` | Todas as ofertas ativas para um SKU | R | 1 |
| 4 | GET | `/pricing/v0/itemOffers` | Todas as ofertas ativas para um ASIN | R | 1 |
| 5 | POST | `/pricing/v0/itemOffers/batch` | Consulta em batch (até 10 ASINs) | R | 0,1 |
| 6 | POST | `/pricing/v0/listingOffers/batch` | Consulta em batch (até 10 SKUs) | R | 0,1 |

**Uso HeziomOS:**
- Monitorar perda de Buy Box nos bestsellers
- Alertar quando concorrente estiver com preço X% abaixo

---

### 3.8 Fulfillment Outbound API v2020-07-01 (MCF)

**O que faz:** Multi-Channel Fulfillment — usa estoque FBA da Amazon para entregar pedidos de outros canais (Tray D2C, atacado, etc.). Só relevante se a Heziom usar FBA.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) |
|---|---|---|---|---|---|
| 1 | POST | `/fba/outbound/2020-07-01/fulfillmentOrders/preview` | Preview de custos/prazos antes de criar | W | — |
| 2 | POST | `/fba/outbound/2020-07-01/deliveryOffers` | Opções de entrega disponíveis | W | — |
| 3 | GET | `/fba/outbound/2020-07-01/fulfillmentOrders` | Lista todas as ordens MCF | R | — |
| 4 | POST | `/fba/outbound/2020-07-01/fulfillmentOrders` | Cria ordem de fulfillment | W | 2 |
| 5 | GET | `/fba/outbound/2020-07-01/fulfillmentOrders/{id}` | Detalhe de uma ordem MCF | R | — |
| 6 | PUT | `/fba/outbound/2020-07-01/fulfillmentOrders/{id}` | Atualiza ordem | W | — |
| 7 | PUT | `/fba/outbound/2020-07-01/fulfillmentOrders/{id}/cancel` | Cancela ordem MCF | W | — |
| 8 | GET | `/fba/outbound/2020-07-01/shipments/{shipmentId}/tracking` | Tracking de envio MCF | R | — |
| 9 | GET | `/fba/outbound/2020-07-01/returnReasonCodes` | Códigos de motivo de devolução | R | — |
| 10 | PUT | `/fba/outbound/2020-07-01/fulfillmentOrders/{id}/return` | Cria solicitação de devolução MCF | W | — |

**Nota Brasil:** MCF limitado a FCs em SP/RJ; janela de entrega 5–12 dias. Verificar se a Heziom tem estoque em FBA BR.

---

### 3.9 Reports API v2021-06-30

**O que faz:** Solicita, agenda e faz download de relatórios batch (assíncronos) de pedidos, financeiro, inventário e performance.

**Endpoints:**

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | POST | `/reports/2021-06-30/reports` | Cria solicitação de relatório | W | 0.0167 | 15 |
| 2 | GET | `/reports/2021-06-30/reports` | Lista relatórios com filtros de tipo/data/status | R | 0.0222 | 10 |
| 3 | GET | `/reports/2021-06-30/reports/{reportId}` | Status/metadados de um relatório | R | 2 | 15 |
| 4 | DELETE | `/reports/2021-06-30/reports/{reportId}` | Cancela relatório pendente | W | 0.0222 | 10 |
| 5 | GET | `/reports/2021-06-30/documents/{reportDocumentId}` | Download do conteúdo (GZIP/ZIP) | R | 0.0167 | 15 |
| 6 | GET | `/reports/2021-06-30/schedules` | Lista agendamentos recorrentes | R | 0.0222 | 10 |
| 7 | POST | `/reports/2021-06-30/schedules` | Cria agendamento recorrente | W | 0.0222 | 10 |
| 8 | GET | `/reports/2021-06-30/schedules/{reportScheduleId}` | Detalhe de um agendamento | R | 0.0222 | 10 |
| 9 | DELETE | `/reports/2021-06-30/schedules/{reportScheduleId}` | Remove agendamento | W | 0.0222 | 10 |

**Report types mais relevantes para Heziom:**

| Report Type | Conteúdo | Frequência recomendada |
|---|---|---|
| `GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE` | Todos os pedidos com dados completos (CSV) | Diário |
| `GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE` | Relatório de liquidação — receita bruta, tarifas, reembolsos | Por settlement (~14 dias) |
| `GET_SELLER_FEEDBACK_DATA` | Avaliações recebidas (rating + comentário + ASIN) | Semanal |
| `GET_FLAT_FILE_OPEN_LISTINGS_DATA` | Inventário de listings ativos (SKU, preço, qtd) | Diário |
| `GET_MERCHANT_CANCELLED_LISTINGS_DATA` | Listings suprimidos/cancelados | Semanal |
| `GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA` | Inventário FBA por SKU (se FBA) | Diário |
| `GET_DATE_RANGE_FINANCIAL_TRANSACTION_DATA` | Transações financeiras em intervalo (alternativo à Finances API) | Diário |
| `GET_AMAZON_FULFILLED_SHIPMENTS_DATA_GENERAL` | Remessas FBA com tracking | Diário |
| `GET_SELLER_PERFORMANCE_REPORT` | Account health metrics (ODR, LSR, CR) | Semanal |

**Fluxo:** POST `/reports` → polling GET `/{reportId}` até `processingStatus: DONE` → GET `/documents/{docId}` para download. Ou subscrever `REPORT_PROCESSING_FINISHED` via Notifications para eliminar polling.

**Uso HeziomOS:**
- Agendamento diário de orders report → comparar com posição no Literarius
- Settlement report automático → reconciliação Financeiro após cada ciclo de pagamento
- Alert: listing suprimido detectado no cancelled listings report → notificar Editorial

---

### 3.10 Data Kiosk API v2023-11-15

**O que faz:** Interface GraphQL para queries customizadas de dados de vendas, tráfego e inventário com granularidade fina. Mais flexível que Reports API para análises ad hoc.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | POST | `/dataKiosk/2023-11-15/queries` | Submete query GraphQL | W | 0.0167 | 15 |
| 2 | GET | `/dataKiosk/2023-11-15/queries` | Lista queries submetidas | R | 0.0222 | 10 |
| 3 | GET | `/dataKiosk/2023-11-15/queries/{queryId}` | Status/metadados de uma query | R | 0.0167 | 15 |
| 4 | DELETE | `/dataKiosk/2023-11-15/queries/{queryId}` | Cancela query pendente | W | 0.0167 | 15 |
| 5 | GET | `/dataKiosk/2023-11-15/documents/{documentId}` | Download do resultado em JSON | R | 0.0167 | 15 |

**Schemas GraphQL disponíveis para Sellers:**
- `analytics_salesAndTraffic_2023_11_15` — vendas + tráfego por ASIN/período (unidades, receita, sessions, conversion)
- `analytics_inventoryAndSales_2023_11_15` — inventário FBA + velocidade de venda

**Exemplo de query:**
```graphql
analytics_salesAndTraffic_2023_11_15 {
  salesByAsin(
    marketplaceId: "A2Q3Y263D00KWC"
    startDate: "2026-06-01"
    endDate: "2026-06-30"
  ) {
    asin
    orderedProductSales { amount currency }
    orderedUnits
    sessions
    unitSessionPercentage
  }
}
```

**Uso HeziomOS:** Ranking de bestsellers por receita para relatório semanal; análise de conversão por ASIN para o time Editorial.

---

### 3.11 Feeds API v2021-06-30

**O que faz:** Submete updates em massa via arquivo (JSON/TSV/XML) — preços, estoque, criação de listings, imagens. Para operações bulk em centenas de ISBNs, é mais eficiente que chamadas individuais à Listings API.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | POST | `/feeds/2021-06-30/feeds` | Submete novo feed (aponta para document já criado) | W | 0.0083 | 15 |
| 2 | GET | `/feeds/2021-06-30/feeds` | Lista feeds com filtros de tipo/status | R | 0.0222 | 10 |
| 3 | GET | `/feeds/2021-06-30/feeds/{feedId}` | Status de um feed | R | 2 | 15 |
| 4 | DELETE | `/feeds/2021-06-30/feeds/{feedId}` | Cancela feed pendente | W | 0.0222 | 10 |
| 5 | POST | `/feeds/2021-06-30/documents` | Cria document (obtém URL S3 para upload do arquivo) | W | 0.5 | 15 |
| 6 | GET | `/feeds/2021-06-30/documents/{feedDocumentId}` | Obtém URL de resultado do feed | R | 0.5 | 15 |

**Feed types relevantes:**

| Feed Type | O que faz |
|---|---|
| `POST_PRODUCT_DATA` | Cria/atualiza atributos de produto (equivalente ao PUT /listings em massa) |
| `POST_INVENTORY_AVAILABILITY_DATA` | Atualiza estoque de múltiplos SKUs |
| `POST_PRODUCT_PRICING_DATA` | Atualiza preços em massa |
| `POST_PRODUCT_IMAGE_DATA` | Upload de imagens principais e variantes |
| `POST_FLAT_FILE_LISTINGS_DATA` | Criação/atualização de listings via TSV |
| `POST_ORDER_FULFILLMENT_DATA` | Confirmação em massa de envios (tracking bulk) |
| `POST_FLAT_FILE_FULFILLMENT_DATA` | Mesmo que acima em TSV |

**Fluxo:** POST `/documents` → upload arquivo na URL S3 retornada → POST `/feeds` com o documentId → polling GET `/{feedId}` até `processingStatus: DONE` → GET document result para verificar erros linha a linha.

**Uso HeziomOS / CDQ:**
- Atualização de estoque em massa após sync com Literarius (centenas de SKUs de uma vez)
- Atualização de preços bulk (ex.: campanha promocional em toda a linha editorial)
- Upload de imagens de novos títulos no lançamento

---

### 3.12 Tokens API v2021-03-01

**O que faz:** Gera Restricted Data Tokens (RDT) para acessar dados de PII (Personally Identifiable Information) — endereço de entrega, nome do comprador, e-mail. **Obrigatório** para usar os endpoints `buyerinfo`, `address` da Orders API e dados de comprador na Messaging API.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | POST | `/tokens/2021-03-01/restrictedDataToken` | Cria RDT com escopo de acesso a PII | W | 1 | 10 |

**Como funciona:**
- POST body especifica o(s) `path` que precisa acessar (ex.: `/orders-v0/orders/{orderId}/address`) e o `dataElements` solicitado (ex.: `["buyerInfo", "shippingAddress"]`)
- Resposta: `restrictedDataToken` (JWT válido por ~1h) + `expiresIn`
- Usar o RDT no header `x-amz-access-token` em lugar do access token normal para chamar os endpoints restritos

**Escopos PII disponíveis:**
- `buyerInfo` — email, nome, endereço de cobrança
- `shippingAddress` — endereço completo de entrega (obrigatório para gerar NF e etiqueta)
- `buyerTaxInfo` — dados fiscais do comprador

**Nota Brasil:** Para emissão de NF-e via Literarius, o endereço de entrega do comprador (CPF, endereço completo) é **obrigatório** — este endpoint é pré-requisito do fluxo fiscal.

**Uso HeziomOS:** Ao receber `ORDER_CHANGE` via Notifications → chamar Tokens API → usar RDT para obter `shippingAddress` → alimentar Literarius com dados completos para emissão da NF.

---

### 3.13 Account Health Rating API v1 + Seller Account Health API

**O que faz:** Consulta métricas de saúde da conta (Account Health) — Order Defect Rate (ODR), Late Shipment Rate (LSR), Cancellation Rate (CR), Policy Compliance. Complementa o alerta de `ACCOUNT_STATUS_CHANGED` (Notifications) com dados granulares.

**Account Health Rating API v1:**

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | GET | `/account-health/v1/monitoring/metrics` | Métricas de desempenho (ODR, LSR, CR) | R | 2 | 10 |
| 2 | GET | `/account-health/v1/monitoring/rating` | Account Health Score (Good/At Risk/Critical) | R | 2 | 10 |
| 3 | GET | `/account-health/v1/monitoring/incidents` | Incidentes de política ativos e histórico | R | 2 | 10 |

**Métricas monitoradas:**

| Métrica | Limiar de risco | Limiar crítico (suspensão) |
|---|---|---|
| **Order Defect Rate (ODR)** | > 0,5% | > 1% (90 dias) |
| **Late Shipment Rate (LSR)** | > 4% | > 10% (7 dias) |
| **Pre-Fulfillment Cancellation Rate (CR)** | > 1,5% | > 2,5% (7 dias) |
| **Valid Tracking Rate (VTR)** | < 95% | < 90% (30 dias) |

**Nota:** A API de Account Health pode requerer permissão adicional no app. Se não disponível, as métricas ficam acessíveis via `GET_SELLER_PERFORMANCE_REPORT` (Reports API) e pelo portal Seller Central.

**Uso HeziomOS:**
- Polling diário das métricas → dashboard Account Health no HeziomOS
- Alert: ODR > 0,5% → notificar urgente Comercial antes de atingir limiar de suspensão
- Alert: LSR > 4% → acionar Logística imediatamente
- Cruzar com `ACCOUNT_STATUS_CHANGED` para contexto quando conta entrar em AT_RISK

---

### 3.14 Seller Wallet API

**O que faz:** Consulta saldo disponível na Amazon Seller Wallet — o saldo de receitas retido antes do saque. **Somente leitura** — solicitação de saque ainda é portal.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | GET | `/sellerWallet/2024-03-01/accounts` | Lista contas na Seller Wallet | R | 0.5 | 5 |
| 2 | GET | `/sellerWallet/2024-03-01/accounts/{accountId}` | Saldo e detalhes de uma conta | R | 0.5 | 5 |
| 3 | GET | `/sellerWallet/2024-03-01/accounts/{accountId}/transfers` | Histórico de transferências | R | 0.5 | 5 |
| 4 | GET | `/sellerWallet/2024-03-01/accounts/{accountId}/transactions` | Transações da Wallet | R | 0.5 | 5 |

**Dados disponíveis:** `availableBalance` (BRL), `pendingBalance`, `reservedBalance`, histórico de saques (transfers), `marketplaceName`.

**Nota:** Saques automáticos ocorrem a cada ~14 dias para contas brasileiras saudáveis (net-14). Saque manual via portal. A API não expõe data do próximo saque automático.

**Uso HeziomOS:**
- Dashboard Financeiro: widget "Saldo Amazon disponível: R$ X"
- Alert: saldo acima de threshold definido → lembrar Financeiro de verificar saque manual
- Cruzar `availableBalance` com receita esperada via Finances API para detectar retenções anômalas

---

### 3.15 Sales API v1

**O que faz:** Retorna métricas de vendas agregadas por intervalo de tempo — unidades vendidas, receita, pedidos. Mais leve que Reports API para consultas de dashboard em tempo real.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | GET | `/sales/v1/orderMetrics` | Métricas de pedidos por granularidade (hora/dia/semana/mês) | R | 0.5 | 30 |

**Parâmetros:** `marketplaceIds`, `interval` (ISO 8601 — ex.: `2026-06-01T00:00:00-03:00/2026-06-30T23:59:59-03:00`), `granularity` (Hour/Day/Week/Month/Total), `granularityTimeZone`, `asin`, `sku`, `firstDayOfWeek`.

**Dados retornados:** `unitCount`, `orderItemCount`, `orderCount`, `averageUnitPrice`, `totalSales` (BRL), `averageSellingPrice`, por slot de granularidade.

**Nota Brasil:** Usar `granularityTimeZone: America/Sao_Paulo` para alinhamento com dashboards internos. `interval` aceita timezone offset -03:00.

**Uso HeziomOS:**
- KPI em tempo real no dashboard Comercial: vendas do dia/semana/mês na Amazon
- Cálculo de pace vs. meta mensal (comparar `totalSales` acumulado com target do CPC)
- Alertar se vendas diárias caírem mais de X% em relação à média da semana

---

### 3.16 Uploads API v2020-11-01

**O que faz:** Cria destinos de upload para enviar arquivos binários (imagens, vídeos, documentos) que serão usados por outras APIs (A+ Content, Listings Items). Necessário para enviar imagens de produto via API.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | POST | `/uploads/2020-11-01/uploadDestinations/{resource}` | Cria destino de upload (URL S3 pré-assinada) | W | 10 | 10 |

**Como funciona:**
1. POST `/uploadDestinations/{resource}` com `contentType` (image/jpeg, image/png, video/mp4) e `contentMD5`
2. Resposta: `uploadDestinationId` + `url` (S3 pré-assinado) + `headers`
3. PUT para a URL S3 com o arquivo binário + headers retornados
4. Usar `uploadDestinationId` na criação de A+ Content ou PATCH de listing como referência da imagem

**Tipos de resource suportados:**
- `/aplus/2020-11-01/contentDocuments` — imagens para A+ Content
- `/listings/2021-08-01/items/{sellerId}/{sku}` — imagens de produto para listings

**Uso HeziomOS / CDQ:**
- Pipeline de lançamento: upload automático de capa e imagens complementares do título
- Garantir que imagem principal (main image) seja enviada antes do PUT /listings

---

### 3.17 Returns API v2024-03-20

**O que faz:** Gerencia solicitações de devolução de compradores — leitura de status, motivos e itens devolvidos. Autorização de devolução ainda é portal.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) |
|---|---|---|---|---|---|
| 1 | GET | `/returns/v2024-03-20/returns` | Lista devoluções com filtros (status, data, orderId) | R | 10 |
| 2 | GET | `/returns/v2024-03-20/returns/{returnId}` | Detalhe de uma devolução específica | R | 10 |

**Dados disponíveis por devolução:** returnId, orderId, returnStatus (INITIATED/APPROVED/COMPLETED), returnItems (ASIN, SKU, título, qtd, motivo), returnShipmentId, refundAmount, returnCreatedDate.

**Motivos de devolução comuns para livros:** `DEFECTIVE` (defeito físico), `WRONG_ITEM` (item errado), `UNWANTED_ITEM` (não quero mais), `NOT_AS_DESCRIBED` (diferente do anunciado).

**Limitação:** Autorizar/negar devolução e emitir reembolso ainda são operações de portal.

**Uso HeziomOS:** Cruzar com `ITEM_ORDER_RETURN_BUYER_REQUESTED` (Notifications) — webhook avisa + Returns API detalha → alerta completo para atendimento com motivo e item.

---

### 3.19 Product Fees API v0

**O que faz:** Calcula estimativa de tarifas Amazon (referral fee, FBA fee, closing fee) antes ou após listagem — essencial para calcular margem líquida real por título.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | POST | `/products/fees/v0/estimateFeesForSKU` | Estimativa de fees por SKU próprio | R (POST) | 10 | 10 |
| 2 | POST | `/products/fees/v0/estimateFeesForASIN` | Estimativa de fees por ASIN | R (POST) | 10 | 10 |
| 3 | POST | `/products/fees/v0/feesEstimate` | Estimativa batch (múltiplos ASINs/SKUs) | R (POST) | 10 | 10 |

**Fees retornadas:** `ReferralFee` (% sobre preço de venda), `FBAFees` (fulfillment + armazenagem, se FBA), `VariableClosingFee` (para livros: fixed closing fee), `TotalFees` (soma de todas).

**Para livros no Brasil:** Referral fee da categoria Books Amazon.com.br = ~15%. Closing fee fixa por item vendido.

**Uso HeziomOS:**
- CDQ ao cadastrar novo livro → calcular automaticamente margem líquida para cada preço simulado
- Dashboard Financeiro: "Receita líquida por título após tarifas Amazon"
- Alertar quando precificação resulta em margem abaixo do mínimo definido

---

### 3.20 A+ Content API v2020-11-01

**O que faz:** Cria e gerencia conteúdo A+ (Enhanced Brand Content) nas páginas de produto — imagens, textos comparativos, banners. Requer Brand Registry ativo.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) |
|---|---|---|---|---|---|
| 1 | GET | `/aplus/2020-11-01/contentDocuments` | Lista documentos A+ existentes | R | 10 |
| 2 | POST | `/aplus/2020-11-01/contentDocuments` | Cria novo conteúdo A+ | W | 10 |
| 3 | GET | `/aplus/2020-11-01/contentDocuments/{contentReferenceKey}` | Detalhe de um documento A+ | R | 10 |
| 4 | POST | `/aplus/2020-11-01/contentDocuments/{contentReferenceKey}` | Atualiza documento A+ existente | W | 10 |
| 5 | DELETE | `/aplus/2020-11-01/contentDocuments/{contentReferenceKey}` | Remove conteúdo A+ | W | 10 |
| 6 | POST | `/aplus/2020-11-01/contentDocuments/{contentReferenceKey}/submit` | Submete para aprovação Amazon | W | 10 |
| 7 | GET | `/aplus/2020-11-01/contentPublishRecords` | Histórico de publicações A+ | R | 10 |

**Módulos disponíveis de conteúdo A+:** imagem com texto lateral, comparativo de produtos, banner de cabeçalho, texto com imagem quatro quadrantes, vídeo (A+ Premium).

**Pré-requisito:** Brand Registry ativo na Amazon com a marca/editora registrada.

**Uso HeziomOS / CDQ:** Pipeline de lançamento → após publicar listing → acionar criação de A+ com assets aprovados pela Editorial. Automatizar submit para aprovação.

---

### 3.21 Listings Restrictions API v2021-08-01

**O que faz:** Verifica se um ASIN/SKU tem restrições de listagem (gating de categoria, aprovação de marca, restrição de condição) antes de tentar publicar.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | GET | `/listings-restrictions/2021-08-01/restrictions` | Consulta restrições para ASIN + SellerId + MarketplaceId | R | 5 | 5 |

**Parâmetros:** `asin`, `sellerId`, `marketplaceIds`, `conditionType` (New/Used/Refurbished), `reasonLocale` (pt_BR).

**Resposta:** `restrictions[]` — lista de restrições ativas com `reasonCodes[]` e links de aprovação quando aplicável.

**Uso HeziomOS / CDQ:** Antes de tentar `PUT /listings` para um ASIN existente → verificar restrições → se restrito, alertar Editorial com link de aprovação.

---

### 3.22 Shipping API v2 + Merchant Fulfillment API v0

**O que faz:** Gerencia etiquetas de envio e tracking para pedidos FBM (Fulfilled by Merchant — a própria Heziom envia).

**Shipping API v2 — Endpoints:**

| # | Método | Endpoint | Operação | R/W | Rate (req/s) |
|---|---|---|---|---|---|
| 1 | POST | `/shipping/v2/shipments` | Cria envio (compra etiqueta de carrier) | W | 10 |
| 2 | GET | `/shipping/v2/shipments/{shipmentId}` | Detalhe de um envio | R | 10 |
| 3 | GET | `/shipping/v2/tracking` | Rastreia envio por tracking number | R | 10 |
| 4 | POST | `/shipping/v2/shipments/{shipmentId}/cancel` | Cancela envio | W | 10 |
| 5 | POST | `/shipping/v2/rates` | Consulta tarifas de frete por carrier/destino | R (POST) | 10 |

**Merchant Fulfillment v0 — Endpoints:**

| # | Método | Endpoint | Operação | R/W | Rate (req/s) |
|---|---|---|---|---|---|
| 1 | POST | `/mfn/v0/shipments` | Cria envio FBM com etiqueta | W | 20 |
| 2 | GET | `/mfn/v0/shipments/{shipmentId}` | Detalhe do envio | R | 20 |
| 3 | DELETE | `/mfn/v0/shipments/{shipmentId}` | Cancela envio | W | 20 |
| 4 | POST | `/mfn/v0/eligibleShipmentServices` | Carriers elegíveis para o endereço | R (POST) | 20 |

**Nota Brasil:** Relevante apenas se FBM. Se FBA, esta API não se aplica — Amazon gerencia o envio.

**Uso HeziomOS:** Comprar etiqueta de carrier automaticamente após pedido confirmado → confirmar tracking via `confirmShipment` (Orders API) → alertar expedição.

---

### 3.23 FBA Inventory API v1

**O que faz:** Consulta inventário armazenado nos FCs da Amazon — quantidades disponíveis, reservadas, com defeito, em trânsito. Relevante apenas se a Heziom usar FBA.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | GET | `/fba/inventory/v1/summaries` | Lista inventário FBA com filtros (granularidade: SKU/MSKU) | R | 3 | 3 |

**Dados retornados:** `asin`, `sellerSku`, `condition`, `inventoryDetails` (fulfillableQuantity, inboundWorkingQuantity, inboundShippedQuantity, reservedQuantity, unfulfillableQuantity).

**Uso HeziomOS:** Dashboard de estoque Amazon FBA — cruzar com posição no Literarius para detectar divergências.

---

### 3.24 Product Type Definitions API v2020-09-01

**O que faz:** Retorna schema de atributos obrigatórios e opcionais por tipo de produto — necessário para construir corretamente o payload do `PUT /listings`.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | GET | `/definitions/2020-09-01/productTypes` | Lista tipos de produto disponíveis | R | 5 | 5 |
| 2 | GET | `/definitions/2020-09-01/productTypes/{productType}` | Schema completo de um tipo (ex: `BOOK`) | R | 5 | 5 |

**Uso HeziomOS / CDQ:** Usar `getDefinitionsProductType?productType=BOOK` para garantir que o payload gerado pelo CDQ tem todos os campos obrigatórios antes de tentar publicar.

---

## 4. O que é PORTAL-ONLY — Requer Acesso Manual ao Seller Central

| Operação | Frequência | Quem faz | Obs. |
|---|---|---|---|
| **Cadastro/alteração de conta bancária** | Raro | Financeiro | Sem API |
| **Solicitar saque** | A cada ~14 dias (automático) ou manual | Financeiro | Sem API — Seller Wallet API é só leitura |
| **Account Health Dashboard** | Semanal | Comercial | Monitorar Late Shipment Rate, Order Defect Rate, Cancellation Rate |
| **Responder A-to-Z Claims** | Conforme ocorre | Atendimento | API retorna dados, resposta é portal |
| **Responder mensagens livres** | Diário | Atendimento | Messaging API só para tipos pré-aprovados |
| **Autorizar/negar devolução** | Conforme ocorre | Atendimento | Returns API (2024) oferece leitura; autorização ainda é portal |
| **Emitir reembolso manual** | Conforme ocorre | Financeiro/Atendimento | Sem API |
| **Gerenciar suspensões** | Conforme ocorre | Comercial | Sem API |
| **Aprovar alterações de preço (Buy Box rules)** | Estratégico | Comercial | Pricing API é leitura; regras são portal |
| **Campanhas Sponsored Products/Brands** | Semanal | Marketing | Advertising API separada (não SP-API) |
| **Brand Registry** | Inicial + manutenção | Editorial/Comercial | Portal exclusivo |
| **Configuração fiscal (CNPJ, IE)** | Inicial | Financeiro | Portal exclusivo |

---

## 5. Fluxo Alvo com HeziomOS

```
EVENTO: Comprador realiza pedido na Amazon
│
├─► [Notifications API] ORDER_CHANGE webhook → HeziomOS
│       └─► Dashboard Comercial atualizado em tempo real
│       └─► Trigger: criar pedido Literarius + emitir NF
│       └─► Messaging API: POST .../messages/invoice → envia NF ao comprador
│
├─► [Notifications API] ITEM_ORDER_RETURN_BUYER_REQUESTED
│       └─► Alerta automático → Atendimento no HeziomOS
│       └─► [MANUAL] Portal: autorizar/negar devolução
│
├─► [Finances API] Reconciliação diária automática
│       └─► ChargebackEvent detectado → alerta Financeiro
│       └─► Dashboard KR3: receita Amazon D-1
│
├─► [Notifications API] ACCOUNT_STATUS_CHANGED
│       └─► Se AT_RISK ou DEACTIVATED → alerta urgente Comercial
│       └─► [MANUAL] Portal: corrigir métricas Account Health
│
└─► [Seller Wallet API] Leitura de saldo
        └─► Dashboard: "Saldo Amazon disponível: R$ X"
        └─► [MANUAL] Portal: solicitar saque (sem API)
```

---

## 6. Credenciais necessárias para conectar

| Item | Onde obter |
|---|---|
| **LWA Client ID** | Seller Central → Apps e Serviços → Desenvolver Apps |
| **LWA Client Secret** | Mesmo lugar |
| **Refresh Token** | Fluxo OAuth com conta Seller autorizada |
| **MarketplaceId** | `A2Q3Y263D00KWC` (Amazon.com.br) |
| **SellerId** | Seller Central → Configurações → Informações da Conta |
| **Endpoint** | `https://sellingpartnerapi-na.amazon.com` |
| **AWS Region** | `us-east-1` (para EventBridge/SQS das Notifications) |

---

## 7. Prioridades de implementação HeziomOS

| Prioridade | API | Endpoint/Recurso chave | Benefício |
|---|---|---|---|
| 🔴 1 | **Notifications** | `ORDER_CHANGE` | Pedidos em tempo real; elimina polling |
| 🔴 2 | **Tokens API** | `POST /restrictedDataToken` | PII obrigatório para endereço na NF-e |
| 🔴 3 | **Notifications** | `ACCOUNT_STATUS_CHANGED` | Alerta imediato se conta em risco |
| 🔴 4 | **Finances API v0** | `listFinancialEvents` | Reconciliação diária automática |
| 🟠 5 | **Orders API** | `getOrder` + `getOrderItems` + `address` | Dashboard comercial completo + dados p/ NF |
| 🟠 6 | **Account Health API** | `GET /monitoring/metrics` | Monitor ODR/LSR/CR antes de suspensão |
| 🟠 7 | **Notifications** | `ITEM_ORDER_RETURN_BUYER_REQUESTED` | Alerta devolução → atendimento |
| 🟠 8 | **Messaging API** | `invoice` | Auto-envio NF ao comprador |
| 🟠 9 | **Listings API** | `PUT` + `PATCH` | CDQ → Amazon automático |
| 🟠 10 | **Feeds API** | `POST_INVENTORY_AVAILABILITY_DATA` | Sync de estoque em massa com Literarius |
| 🟡 11 | **Sales API v1** | `GET /orderMetrics` | KPI de vendas em tempo real no dashboard |
| 🟡 12 | **Seller Wallet API** | `GET /accounts/{id}` | Saldo Amazon disponível no dashboard |
| 🟡 13 | **Catalog Items API** | `searchCatalogItems` | ISBN → ASIN lookup no CDQ |
| 🟡 14 | **Pricing API** | `competitivePricing` batch | Monitor Buy Box |
| 🟡 15 | **Reports/Data Kiosk** | Settlement report + Data Kiosk GraphQL | Cruzamento financeiro + análise por ASIN |
| 🟡 16 | **Uploads API** | `POST /uploadDestinations` | Pipeline de upload de imagens no lançamento |
| ⚪ 17 | **Returns API** | `GET /returns` | Detalhamento de devoluções (Notifications já avisa) |
| ⚪ 18 | **Product Fees** | `POST /feesEstimate` batch | Margem líquida por título no CDQ |
| ⚪ 19 | **A+ Content** | `POST /contentDocuments` | Publicação automatizada de conteúdo rich |
| ⚪ 20 | **FBA APIs (Inventory + MCF)** | — | Somente se Heziom usar FBA |

---

## 8. Questões abertas

| Questão | Status |
|---|---|
| FBM (envio próprio) ou FBA (estoque na Amazon)? | Confirmar com Logística |
| Credenciais LWA (Client ID/Secret) já existem? | Confirmar com TI/Comercial |
| Saques são automáticos (~14 dias) ou manuais? | Confirmar com Financeiro |
| Volume atual de A-to-Z Claims e devoluções/mês? | Confirmar com Atendimento |
| Existe conta de Advertising (Sponsored Products)? | Confirmar com Marketing |
| Brand Registry ativo? (necessário para A+ Content API) | Confirmar com Editorial/Comercial |
| App Seller já tem permissão `sellerAccountHealth`? | Confirmar com TI — pode requerer re-autorização |
| Seller Wallet está configurada (conta bancária BR vinculada)? | Confirmar com Financeiro |
| Qual é o ODR/LSR/CR atual da conta? | Acessar Account Health no portal e registrar baseline |
| A conta tem histórico de incidentes de política? | Verificar seção Compliance no Seller Central |

---

*Fontes: developer-docs.amazon.com/sp-api · Dados coletados em 08/06/2026 · Expandido com Feeds, Data Kiosk, Tokens, Account Health, Seller Wallet, Sales, Uploads em 08/06/2026*
*Ver também: [[Amazon Vendor Central — Mapeamento e Automação]] · [[Índice Comercial]] · [[CDQ — Sistema de Cadastro Multi-Plataforma]]*
