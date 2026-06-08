---
tags: [heziom, amazon, vendor-central, sp-api, marketplace, automação, mapeamento]
status: documentado
criado: 2026-06-08
fonte: Amazon SP-API Documentation (developer-docs.amazon.com/sp-api)
módulo: Comercial
---

# Amazon Vendor Central — Mapeamento e Automação (1P)

> Mapeamento técnico completo da SP-API para operações de **Vendor Central (1P)**. Inclui todos os endpoints, rate limits, distinção read/write, notas Brasil e prioridades de integração no HeziomOS.
> Referência: [[Índice Comercial]] · [[Amazon Seller Central — Mapeamento e Automação]] · [[CDQ — Sistema de Cadastro Multi-Plataforma]]

---

## 1. Contexto

| Item | Dado |
|---|---|
| **Modelo** | Vendor Central 1P — Amazon compra da Heziom e revende |
| **Marketplace** | Amazon.com.br (`MarketplaceId: A2Q3Y263D00KWC`) |
| **Portal** | vendor.amazon.com.br |
| **Endpoint API** | `https://sellingpartnerapi-na.amazon.com` (Brasil usa região NA) |
| **Auth** | OAuth 2.0 (LWA) + Signature V4 |
| **Diferença do Seller** | Amazon emite Purchase Orders (POs) para a Heziom; Heziom envia estoque para Amazon; Amazon vende ao cliente final |

---

## 2. Dois modelos dentro do Vendor

| Modelo | Descrição | APIs usadas |
|---|---|---|
| **Retail Procurement** | Amazon compra estoque e armazena em FCs próprios. Amazon cuida do envio ao cliente. | Vendor Orders, Shipments, Invoices, Transaction Status |
| **Direct Fulfillment (DF)** | Heziom armazena estoque e envia diretamente ao cliente final em nome da Amazon. | DF Orders, DF Shipping, DF Inventory, DF Payments, DF Transactions |

> A Heziom provavelmente opera em **Retail Procurement** (o modelo padrão). Direct Fulfillment é menos comum e precisa ser confirmado.

---

## 3. Mapeamento Completo SP-API — Vendor

---

### BLOCO A — RETAIL PROCUREMENT

---

### A.1 Vendor Orders API v1

**O que faz:** Recupera Purchase Orders (POs) que a Amazon emitiu para a Heziom e permite confirmar/rejeitar cada PO.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | GET | `/vendor/orders/v1/purchaseOrders` | Lista POs com filtros de data, status, vendor code | R | 10 | 10 |
| 2 | GET | `/vendor/orders/v1/purchaseOrders/{purchaseOrderNumber}` | Detalhe de um PO específico (8 caracteres alfanumérico) | R | 10 | 10 |
| 3 | POST | `/vendor/orders/v1/acknowledgements` | Submete confirmação (aceite/rejeição) de POs | W | 10 | 10 |
| 4 | GET | `/vendor/orders/v1/purchaseOrdersStatus` | Status detalhado de POs (janela máx. 7 dias) | R | 10 | 10 |

**Filtros disponíveis no GET `/purchaseOrders`:**
- `limit` (1–100), `createdAfter`, `createdBefore`, `changedAfter`, `changedBefore`
- `sortOrder` (ASC/DESC), `nextToken` (paginação)
- `purchaseOrderState` (New / Acknowledged / Closed)
- `orderingVendorCode`, `includeDetails` (boolean)

**Filtros avançados no `purchaseOrdersStatus`:**
- `purchaseOrderStatus` (OPEN / CLOSED)
- `itemConfirmationStatus` (ACCEPTED / PARTIALLY_ACCEPTED / REJECTED / UNCONFIRMED)
- `itemReceiveStatus` (NOT_RECEIVED / PARTIALLY_RECEIVED / RECEIVED)
- `shipToPartyId`

**Dados disponíveis por PO:** purchaseOrderNumber, purchaseOrderState, orderDetails (orderDate, orderChangedDate, deliveryWindow, buyingParty, sellingParty, shipToParty, billToParty), items (itemSequenceNumber, amazonProductIdentifier, vendorProductIdentifier, orderedQuantity, isBackOrderAllowed, netCost, listPrice).

**SLA de confirmação:** Amazon exige acknowledgement em até 24h — automatizar é crítico.

**Nota Brasil:** Rota via NA endpoint. Campos de `listPrice` em BRL. `netCost` é o preço negociado. `deliveryWindow` define janela de entrega ao FC.

**Uso HeziomOS:**
- Polling a cada hora (ou webhook via Notifications `VENDOR_OFFER_CHANGED`) para novos POs
- Auto-acknowledgement em até 2h após recebimento
- Alert: PO não confirmado em 12h → notificar time Comercial
- Trigger: PO acknowledged → iniciar separação no estoque Literarius

---

### A.2 Vendor Shipments API v1

**O que faz:** Gerencia envios de estoque da Heziom para os centros de distribuição da Amazon (FCs). Confirma que a mercadoria foi despachada.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | POST | `/vendor/shipping/v1/shipmentConfirmations` | Confirma que a mercadoria foi enviada (com carrier + tracking) | W | 10 | 10 |
| 2 | POST | `/vendor/shipping/v1/shipments` | Submete solicitação de envio (anuncia intenção de enviar) | W | 10 | 10 |
| 3 | GET | `/vendor/shipping/v1/shipments` | Consulta envios — carrier, status, containers, datas | R | 10 | 10 |
| 4 | GET | `/vendor/shipping/v1/transportLabels` | Recupera etiquetas de envio (small parcel) | R | 10 | 10 |

**Filtros no GET `/shipments`:**
- `limit` (1–50, padrão 50), `sortOrder`, `nextToken`
- `createdAfter`, `createdBefore`, `shipmentConfirmedBefore`, `shippedAfter`
- `currentShipmentStatus`, `vendorShipmentIdentifier`, `buyerReferenceNumber`, `sellerWarehouseCode`

**Campos do shipment:** vendorShipmentIdentifier, shipmentType (TruckLoad/LessThanTruckLoad/SmallParcel), shipmentStatus, shipToParty, shipFromParty, warehouseId, estimatedDeliveryDate, shippedDate, containers (containerIdentifier, trackingNumber, weight, dimensions, items).

**Nota Brasil:** Carriers comuns: Correios, Jadlog, Braspress. `shipmentConfirmedBefore` para controle de SLA de entrega ao FC SP/RJ.

**Uso HeziomOS:**
- Após expedição confirmar saída física → POST `/shipmentConfirmations` automático com tracking
- GET `/transportLabels` para gerar etiquetas de envio para FCs Amazon
- Alert: mercadoria não confirmada dentro da `deliveryWindow` → notificar Logística

---

### A.3 Vendor Invoices API v1

**O que faz:** Submete faturas (NFs) e notas de crédito para Amazon processar o pagamento à Heziom. **Não existe GET** — status via Transaction Status API.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | POST | `/vendor/payments/v1/invoices` | Submete fatura(s) ou nota(s) de crédito | W | 10 | 10 |

**Estrutura da fatura (Invoice object):**
- `invoiceType`: Invoice ou CreditNote
- `id`: Número da NF (único por período fiscal)
- `date`: Data de emissão
- `remitToParty`: Dados bancários da Heziom (CNPJ, banco, conta)
- `shipToParty`: Endereço do FC Amazon
- `billToParty`: Dados de cobrança da Amazon BR
- `invoiceTotal`: Valor total em BRL
- `taxDetails`: Array com ICMS, PIS, COFINS (obrigatório para BR)
- `items`: Array com linha por ISBN/SKU (vendorProductIdentifier, invoicedQuantity, netCost, taxDetails por item)
- `charges` / `allowances`: Fretes, descontos, devoluções

**Fluxo assíncrono:** POST retorna `transactionId` → polling via Transaction Status API até `Success` ou `Failure`.

**Nota Brasil:** Campos de impostos **obrigatórios**: ICMS, PIS/COFINS. `id` deve corresponder ao número da NF-e emitida no Literarius. `remitToParty.taxRegistrationNumber` = CNPJ da Heziom. Moeda: BRL.

**Uso HeziomOS:**
- Após Amazon confirmar recebimento do estoque no FC → POST automático da fatura usando dados da NF-e do Literarius
- Nota de crédito automática quando há devolução de mercadoria ao estoque
- Polling de status → alertar Financeiro quando pagamento confirmado ou rejeitado

---

### A.4 Vendor Transaction Status API v1

**O que faz:** Verifica o status de processamento de qualquer operação assíncrona (POST de fatura, envio, etc.).

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | GET | `/vendor/transactions/v1/transactions/{transactionId}` | Status de uma transação por ID | R | 10 | 20 |

**Status possíveis:** `Processing` → `Success` ou `Failure` (com array de erros detalhados).

**Uso HeziomOS:** Polling a cada 30s após qualquer POST de fatura, envio ou acknowledgement até status final. Se `Failure` → extrair erros + alertar responsável.

---

### BLOCO B — DIRECT FULFILLMENT (DF)

> Verificar com Logística se a Heziom opera neste modelo antes de implementar.

---

### B.1 Vendor Direct Fulfillment Orders API (v1 e v2021-12-28)

**O que faz:** Busca POs do modelo DF — onde a Heziom envia diretamente ao cliente final.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) |
|---|---|---|---|---|---|
| 1 | GET | `/vendor-direct-fulfillment-orders/v1/orders` | Lista ordens DF com filtros de data/status | R | 10 |
| 2 | GET | `/vendor-direct-fulfillment-orders/v1/orders/{orderId}` | Detalhe de uma ordem DF (endereço cliente, itens, datas) | R | 10 |
| 3 | POST | `/vendor-direct-fulfillment-orders/v1/orders/{orderId}/acknowledgements` | Confirma DF order com data de entrega prometida | W | 10 |

**v2021-12-28** oferece os mesmos endpoints com melhorias no schema de resposta.

---

### B.2 Vendor Direct Fulfillment Shipping API (v1 e v2021-12-28)

**O que faz:** Gerencia etiquetas, confirmações de envio e packing slips para entregas DF direto ao cliente.

| # | Método | Endpoint (simplificado) | Operação | R/W | Rate (req/s) |
|---|---|---|---|---|---|
| 1 | POST | `.../shipping-labels` | Solicita geração de etiqueta de envio | W | 10 |
| 2 | GET | `.../shipping-labels` | Recupera etiquetas geradas (PDF/PNG) | R | 10 |
| 3 | POST | `.../shipmentConfirmations` | Confirma envio ao cliente com tracking | W | 10 |
| 4 | POST | `.../shipmentStatusUpdates` | Atualiza status do envio (em trânsito, entregue, exceção) | W | 10 |
| 5 | GET | `.../packingSlips` | Lista romaneios de embalagem | R | 10 |
| 6 | GET | `.../packingSlips/{id}` | Detalhe de um romaneio específico | R | 10 |

**v2021-12-28 adiciona:** `POST /createShippingLabels`, `POST /createContainerLabel` para geração programática.

**Nota Brasil:** Etiquetas devem incluir endereço BR completo. Carriers: Correios (Sedex/PAC), Jadlog, J&T. Prazo médio: 5–12 dias SP/RJ → demais estados.

---

### B.3 Vendor Direct Fulfillment Inventory API v1

**O que faz:** Atualiza o estoque disponível no armazém DF para que a Amazon saiba o que pode vender.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) |
|---|---|---|---|---|---|
| 1 | POST | `/vendor-direct-fulfillment-inventory/v1/inventory-updates` | Submete atualização de estoque por SKU/localização | W | 10 |

**Nota:** Sem GET — inventário só consultável via Catalog API. Retorna `transactionId` para polling de status.

---

### B.4 Vendor Direct Fulfillment Payments API v1

**O que faz:** Submete faturas para os serviços de fulfillment prestados no modelo DF.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) |
|---|---|---|---|---|---|
| 1 | POST | `/vendor-direct-fulfillment-payments/v1/invoices` | Submete fatura de serviços DF | W | 10 |

**Nota Brasil:** Inclui ISS (imposto sobre serviço) além de ICMS/PIS/COFINS. CNPJ da Heziom obrigatório em `remitToParty`.

---

### B.5 Vendor Direct Fulfillment Transactions API (v1 e v2021-12-28)

**O que faz:** Mesmo papel que a Transaction Status do Retail Procurement, mas para operações DF.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | GET | `/vendor-direct-fulfillment-transactions/v1/transactions/{transactionId}` | Status de transação DF | R | 10 | 20 |

---

### BLOCO C — ANALYTICS E NOTIFICAÇÕES VENDOR

---

### C.1 Vendor Retail Analytics API

**O que faz:** Métricas de performance de vendas e estoque para o canal Vendor.

**Disponibilidade:** Acesso limitado — normalmente requer aprovação explícita da Amazon para o app. Dados disponíveis:
- Velocidade de venda por ASIN/ISBN
- Taxa de rotação de estoque
- Top SKUs por receita
- Comparativo de períodos

**Nota:** Endpoints específicos não totalmente documentados publicamente. Pode ser acessado via **Data Kiosk** (GraphQL) para queries customizadas de dados de vendas Vendor.

---

### C.2 Reports API v2021-06-30 — Relatórios Vendor

**O que faz:** Solicita geração de relatórios batch e faz download do conteúdo. Vendor tem acesso a tipos de relatório exclusivos não disponíveis para Sellers 3P.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | POST | `/reports/2021-06-30/reports` | Cria solicitação de relatório | W | 0.0167 | 15 |
| 2 | GET | `/reports/2021-06-30/reports` | Lista relatórios com filtros | R | 0.0222 | 10 |
| 3 | GET | `/reports/2021-06-30/reports/{reportId}` | Consulta status/metadados de um relatório | R | 2 | 15 |
| 4 | GET | `/reports/2021-06-30/documents/{reportDocumentId}` | Download do conteúdo do relatório | R | 0.0167 | 15 |
| 5 | DELETE | `/reports/2021-06-30/reports/{reportId}` | Cancela relatório pendente | W | 0.0222 | 10 |
| 6 | GET | `/reports/2021-06-30/schedules` | Lista agendamentos de relatórios | R | 0.0222 | 10 |
| 7 | POST | `/reports/2021-06-30/schedules` | Cria agendamento recorrente | W | 0.0222 | 10 |
| 8 | DELETE | `/reports/2021-06-30/schedules/{reportScheduleId}` | Remove agendamento | W | 0.0222 | 10 |

**Tipos de relatório exclusivos do Vendor:**

| Tipo de Relatório | Conteúdo | Frequência recomendada |
|---|---|---|
| `GET_VENDOR_REAL_TIME_INVENTORY_REPORT` | Estoque atual nos FCs Amazon por ASIN/SKU | Diário |
| `GET_VENDOR_SALES_REPORT` | Vendas por ASIN — unidades vendidas, receita, devolução | Semanal |
| `GET_VENDOR_INVENTORY_HEALTH_REPORT` | Saúde do inventário — excesso, ruptura, semanas de cobertura | Semanal |
| `GET_VENDOR_NET_PURE_PRODUCT_MARGIN_REPORT` | Margem líquida por produto (deduz chargebacks e deduções) | Mensal |
| `GET_VENDOR_BOOKING_REPORT` | Resumo de POs recebidos vs confirmados | Semanal |
| `GET_VENDOR_SETTLING_FUNDS_REPORT` | Liquidações financeiras e pagamentos processados | Mensal |
| `GET_VENDOR_TRAFFIC_REPORT` | Tráfego de página por ASIN (glance views, sessions) | Semanal |
| `GET_VENDOR_CONVERSION_REPORT` | Taxa de conversão por ASIN | Mensal |

**Fluxo de uso:** POST `/reports` → polling GET `/{reportId}` até `status: DONE` → GET `/documents/{documentId}` para download (arquivo comprimido GZIP ou ZIP).

**Nota Brasil:** Relatórios financeiros em BRL. `GET_VENDOR_SETTLING_FUNDS_REPORT` mostra o ciclo de pagamento real (net 30/60/90) por fatura — usar para reconciliação Financeiro × Amazon.

**Uso HeziomOS:**
- Agendamento semanal automático: inventory health + sales report → alimentar dashboard Comercial
- Agendamento mensal: margin report + settling funds → reconciliação financeira automática
- Alert: ruptura de estoque detectada no inventory report → notificar Logística + Comercial

---

### C.3 Data Kiosk API v2023-11-15

**O que faz:** Interface GraphQL para queries customizadas de dados de vendas, inventário e tráfego Vendor. Substitui/complementa os relatórios batch com consultas mais flexíveis e granulares.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | POST | `/dataKiosk/2023-11-15/queries` | Submete query GraphQL | W | 0.0167 | 15 |
| 2 | GET | `/dataKiosk/2023-11-15/queries` | Lista queries submetidas | R | 0.0222 | 10 |
| 3 | GET | `/dataKiosk/2023-11-15/queries/{queryId}` | Status/metadados de uma query | R | 0.0167 | 15 |
| 4 | DELETE | `/dataKiosk/2023-11-15/queries/{queryId}` | Cancela query pendente | W | 0.0167 | 15 |
| 5 | GET | `/dataKiosk/2023-11-15/documents/{documentId}` | Download do resultado em JSON | R | 0.0167 | 15 |

**Schemas GraphQL disponíveis para Vendor:**

```graphql
# Exemplo de query para vendas Vendor por ASIN no período
analytics_salesAndTraffic_2023_11_15 {
  salesByAsin(
    marketplaceId: "A2Q3Y263D00KWC"
    startDate: "2026-06-01"
    endDate: "2026-06-30"
    asin: "B0XXXXXX"
  ) {
    asin
    orderedRevenue { amount currency }
    orderedUnits
    shippedRevenue { amount currency }
    shippedUnits
  }
}
```

**Schemas principais:**
- `analytics_salesAndTraffic_2023_11_15` — vendas + tráfego por ASIN/período
- `analytics_inventoryAndSales_2023_11_15` — inventário nos FCs + saúde de estoque
- `analytics_netPureProductMargin_2023_11_15` — margem líquida real (pós-chargebacks)

**Nota:** Data Kiosk é **assíncrono** — POST submete, polling até `processingStatus: DONE`, então GET download.

**Uso HeziomOS:** Queries ad hoc para análise de performance por lançamento editorial; ranking de ISBNs por receita; comparativo de períodos para relatórios de diretoria.

---

### C.4 Finances API v0 — ACESSO RESTRITO para Vendor

**O que faz:** Consulta eventos financeiros — pagamentos, chargebacks, ajustes de fatura.

> ⚠️ **IMPORTANTE — Vendors têm acesso restrito:** A Finances API v0 foi projetada para Sellers 3P. Vendors **não têm acesso ao stream completo de eventos financeiros** (Financial Events List / Financial Event Groups) que os Sellers têm. O acesso Vendor via Finances API é **limitado a sumários de settlement** — o detalhamento real vem do `GET_VENDOR_SETTLING_FUNDS_REPORT` (Reports API) e do portal Vendor Central.

| # | Método | Endpoint | Operação | Disponibilidade Vendor |
|---|---|---|---|---|
| 1 | GET | `/finances/v0/financialEventGroups` | Lista grupos de eventos financeiros por período | ⚠️ Acesso parcial |
| 2 | GET | `/finances/v0/financialEventGroups/{id}/financialEvents` | Eventos dentro de um grupo | ⚠️ Acesso parcial |
| 3 | GET | `/finances/v0/financialEvents` | Todos os eventos financeiros por data | ❌ Não disponível para Vendor puro |
| 4 | GET | `/finances/v0/financialEvents/order/{orderId}` | Eventos de um pedido específico | ❌ Não aplicável (Vendor não tem "orders" diretos) |

**Alternativas reais para Vendor:**
- **`GET_VENDOR_SETTLING_FUNDS_REPORT`** → resumo de liquidações por ciclo de pagamento
- **`GET_VENDOR_NET_PURE_PRODUCT_MARGIN_REPORT`** → margem por produto pós-deduções
- **Portal Vendor Central** → relatório financeiro detalhado, chargebacks, disputas

**Uso HeziomOS:** Não implementar Finances API v0 para Vendor — usar Reports API com os relatórios financeiros Vendor-specific. Alertar desenvolvedor: **não assumir que Finances API funciona igual ao Seller 3P**.

---

### C.5 A+ Content API v2020-11-01

**O que faz:** Cria, edita e publica conteúdo enriquecido nas páginas de produto Amazon (A+ Content / Enhanced Brand Content). Compartilhada entre Seller e Vendor — requer Brand Registry.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | GET | `/aplus/2020-11-01/contentDocuments` | Lista documentos A+ existentes | R | 10 | 10 |
| 2 | POST | `/aplus/2020-11-01/contentDocuments` | Cria novo documento A+ | W | 10 | 10 |
| 3 | GET | `/aplus/2020-11-01/contentDocuments/{contentReferenceKey}` | Detalhe de um documento | R | 10 | 10 |
| 4 | PUT | `/aplus/2020-11-01/contentDocuments/{contentReferenceKey}` | Atualiza documento A+ | W | 10 | 10 |
| 5 | POST | `/aplus/2020-11-01/contentDocuments/{contentReferenceKey}/approvalSubmissions` | Submete para aprovação Amazon | W | 10 | 10 |
| 6 | POST | `/aplus/2020-11-01/contentDocuments/{contentReferenceKey}/asins` | Associa documento a ASINs | W | 10 | 10 |
| 7 | GET | `/aplus/2020-11-01/contentDocuments/{contentReferenceKey}/asins` | Lista ASINs associados | R | 10 | 10 |
| 8 | GET | `/aplus/2020-11-01/contentPublishRecords` | Histórico de publicações por ASIN | R | 10 | 10 |

**Módulos de conteúdo disponíveis (A+ Standard):**
- `STANDARD_HEADER_IMAGE_TEXT` — cabeçalho com imagem + texto
- `STANDARD_IMAGE_TEXT` — imagem + texto lado a lado
- `STANDARD_FOUR_IMAGE_TEXT` — 4 imagens com textos
- `STANDARD_COMPARISON_TABLE` — tabela comparativa de produtos
- `STANDARD_IMAGE_SIDEBAR` — sidebar com imagem
- `STANDARD_TECH_SPECS` — especificações técnicas

**Fluxo de publicação:** POST documento → POST approval submission → aguardar revisão Amazon (1–7 dias) → status: `APPROVED` ou `REJECTED` com motivo.

**Nota Brasil:** Conteúdo em PT-BR obrigatório para marketplace A2Q3Y263D00KWC. Imagens: JPEG/PNG, mínimo 970×300px. Brand Registry necessário — confirmar se Heziom tem registro no INPI associado à conta Amazon.

**Uso HeziomOS:**
- Lançamentos editoriais → criar A+ Content via API com template padronizado (Editorial)
- Alert: A+ Content rejeitado → notificar Editorial com motivo
- Monitorar `contentPublishRecords` para garantir que novos ISBNs têm conteúdo enriquecido

---

### C.6 Catalog Items API v2022-04-01

**O que faz:** Busca informações do catálogo Amazon (dados de produto, ASINs, classificações, imagens, palavras-chave). Para Vendor, **somente leitura** — criação/atualização de catálogo é exclusiva do portal ou do processo de submissão de novos ISBNs via XLSM.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | GET | `/catalog/2022-04-01/items` | Busca itens por keyword, ASIN, ISBN, EAN, UPC | R | 2 | 2 |
| 2 | GET | `/catalog/2022-04-01/items/{asin}` | Detalhes completos de um item por ASIN | R | 2 | 2 |

**Parâmetros do GET `/items` (busca):**
- `identifiers` (ASIN, ISBN, EAN, UPC), `identifiersType`
- `keywords` (busca textual), `brandNames`, `classificationIds`
- `marketplaceIds`, `includedData` (attributes, dimensions, identifiers, images, productTypes, relationships, salesRanks, summaries, vendorDetails)
- `sellerId`, `keywordsLocale`

**Dados disponíveis por item:** título, marca, classificação browseTree, dimensões físicas (peso, medidas), imagens (main/variant/swatch), ASINs relacionados (parent/child para variantes), sales rank por categoria, identificadores (ASIN, EAN, ISBN, GTIN), `vendorDetails` (replenishment category, manufacturer reference number).

**Nota Brasil:** `vendorDetails.vendorDetailsAttributes` retorna dados específicos do relacionamento Vendor × Amazon, incluindo `replenishmentCategory` (se o item é AUTO_REPLENISHABLE ou OCCASIONAL_REPLENISH) — útil para planejamento de reposição de estoque.

**Uso HeziomOS:**
- Resolver ISBN → ASIN automaticamente no CDQ (sem lookup manual no portal)
- Verificar se novo ISBN já está catalogado antes de processar PO
- Enriquecer dashboard Comercial com título, imagem e sales rank por ASIN

---

### C.7 Product Fees API v0

**O que faz:** Estima as taxas que a Amazon cobra por venda de um item específico (comissão de referência, fulfillment fee, etc.). Para Vendor, os "fees" são estruturalmente diferentes (Amazon cobra deduções, chargebacks e co-op fees diretamente das faturas), mas a API ainda é útil para entender o custo do canal e calcular margem.

| # | Método | Endpoint | Operação | R/W | Rate (req/s) | Burst |
|---|---|---|---|---|---|---|
| 1 | GET | `/products/fees/v0/items/{Asin}/feesEstimate` | Estima fees para um ASIN específico | R | 1 | 2 |
| 2 | GET | `/products/fees/v0/listings/{SellerSKU}/feesEstimate` | Estima fees para um listing (SKU) | R | 1 | 2 |
| 3 | POST | `/products/fees/v0/feesEstimate` | Estima fees em batch (múltiplos ASINs) | W | 0.5 | 1 |

**Estrutura da estimativa retornada:**
- `referralFee`: comissão de referência da Amazon (% sobre preço de venda)
- `fulfillmentFee`: custo de fulfillment (peso + dimensões)
- `variableClosingFee`: taxa fixa por categoria (media items = USD 1.80, pode variar no BR)
- `estimatedFeeTotal`: soma de todos os fees

**Nota Vendor:** Para operações 1P, a Amazon **não cobra referral fee da mesma forma** — o relacionamento é de compra/venda com preço negociado (net cost), não de comissão. A API é mais útil para simular cenários onde Heziom eventualmente mude de modelo 1P → 3P para certos títulos.

**Uso HeziomOS:** Alimentar cálculo de margem no dashboard Comercial — simular "se esse título migrasse para Seller 3P, qual seria o fee?". Input para decisões de pricing e seleção de canal por ISBN.

---

### C.8 Notifications API — Eventos Vendor

Além dos eventos Seller, o Vendor tem eventos específicos:

| Evento | Trigger | Prioridade Heziom |
|---|---|---|
| `VENDOR_OFFER_CHANGED` | PO criado, alterado ou cancelado pela Amazon | 🔴 CRÍTICO |
| `REPORT_PROCESSING_FINISHED` | Relatório gerado e pronto para download | 🟡 Média |
| `DETAIL_PAGE_TRAFFIC_EVENT` | Métricas de tráfego por ASIN (horário) | ⚪ Baixa |
| `BRANDED_ITEM_CONTENT_CHANGE` | Conteúdo A+ aprovado/rejeitado/publicado | 🟡 Média |

**Uso HeziomOS:** `VENDOR_OFFER_CHANGED` substitui polling de POs — quando Amazon emite ou altera PO, webhook dispara em tempo real → acknowledgement automático em sequência. `REPORT_PROCESSING_FINISHED` elimina polling de relatórios batch — notifica quando download está disponível.

**Configuração de destino (obrigatória):**
- Criar SQS queue na AWS (região us-east-1)
- Registrar destination via POST `/notifications/v1/destinations`
- Subscrever eventos via POST `/notifications/v1/subscriptions/{notificationType}`

---

## 4. O que é PORTAL-ONLY — Requer Acesso Manual ao Vendor Central

| Operação | Frequência | Quem faz |
|---|---|---|
| **Cadastro/alteração de conta bancária** | Raro | Financeiro |
| **Solicitar saque / disbursement** | Mensal (prazo de pagamento Amazon: 30–90 dias) | Financeiro |
| **Verificar status de pagamento de fatura** (detalhado) | Quinzenal | Financeiro |
| **Responder chargebacks / Vendor Chargebacks** | Conforme ocorre | Financeiro/Comercial |
| **Responder disputas de qualidade (recalls, devoluções em massa)** | Conforme ocorre | Comercial |
| **Comunicação com Account Manager Amazon** | Conforme ocorre | Comercial |
| **Aprovar/rejeitar alterações de preço sugeridas pela Amazon** | Conforme ocorre | Comercial |
| **Acompanhar Vendor Central Analytics** (dashboard completo) | Semanal | Comercial |
| **Upload de imagens e conteúdo A+ / páginas de marca** | Lançamentos | Editorial |
| **Cadastro de novos ISBNs (XLSM upload)** | Lançamentos | Editorial (CDQ) |
| **Negociação de termos comerciais** | Anual | Diretoria/Comercial |

---

## 5. Fluxo Alvo com HeziomOS — Retail Procurement

```
EVENTO: Amazon emite Purchase Order para Heziom
│
├─► [Notifications API] VENDOR_OFFER_CHANGED webhook → HeziomOS
│       └─► Novo PO detectado
│       └─► Auto-acknowledgement via POST /vendor/orders/v1/acknowledgements (< 2h)
│       └─► Alert: PO registrado no dashboard Comercial
│       └─► Trigger: separação de estoque no Literarius
│
├─► [Logística] Mercadoria separada e embalada
│       └─► POST /vendor/shipping/v1/shipmentConfirmations (com tracking carrier)
│       └─► Alert: envio confirmado → Financeiro sabe que NF pode ser emitida
│
├─► [Literarius] NF-e emitida
│       └─► POST /vendor/payments/v1/invoices (dados da NF + impostos BR)
│       └─► Polling GET /vendor/transactions/v1/transactions/{id}
│              ├─► Success → Alert Financeiro: "Fatura processada — aguardar pagamento"
│              └─► Failure → Alert Urgente: "Fatura rejeitada — verificar erros"
│
└─► [MANUAL] Portal: aguardar ciclo de pagamento (30–90 dias) + solicitar saque
```

---

## 6. Credenciais necessárias para conectar

| Item | Onde obter |
|---|---|
| **LWA Client ID** | Vendor Central → Configurações → Acesso a Dados → Apps |
| **LWA Client Secret** | Mesmo lugar |
| **Refresh Token** | Fluxo OAuth com conta Vendor autorizada |
| **MarketplaceId** | `A2Q3Y263D00KWC` (Amazon.com.br) |
| **VendorGroupPartyId** | Vendor Central → Conta → Dados da Empresa |
| **Endpoint** | `https://sellingpartnerapi-na.amazon.com` |

> **Atenção:** Apps Vendor têm escopos diferentes de apps Seller. Criar app separado ou com escopos combinados se Heziom operar nos dois modelos.

---

## 7. Prioridades de implementação HeziomOS

| Prioridade | API | Endpoint/Recurso chave | Benefício |
|---|---|---|---|
| 🔴 1 | **Notifications** | `VENDOR_OFFER_CHANGED` | POs em tempo real; elimina polling manual |
| 🔴 2 | **Vendor Orders** | `POST /acknowledgements` | Auto-confirmação dentro do SLA (24h) |
| 🔴 3 | **Vendor Invoices** | `POST /invoices` | Eliminação do upload manual de fatura |
| 🟠 4 | **Vendor Shipments** | `POST /shipmentConfirmations` | Confirmação de envio automática |
| 🟠 5 | **Transaction Status** | `GET /transactions/{id}` | Rastrear status de faturas e envios |
| 🟠 6 | **Vendor Orders** | `GET /purchaseOrdersStatus` | Monitorar POs pendentes de recebimento |
| 🟠 7 | **Catalog Items** | `GET /items?identifiers=ISBN` | Resolver ISBN → ASIN automaticamente (CDQ) |
| 🟠 8 | **Notifications** | `REPORT_PROCESSING_FINISHED` | Download automático de relatórios batch |
| 🟡 9 | **Reports API** | `GET_VENDOR_SALES_REPORT` + inventory | Performance Vendor no dashboard semanal |
| 🟡 10 | **Data Kiosk** | GraphQL `salesByAsin` | Análise ad hoc por lançamento editorial |
| 🟡 11 | **A+ Content** | `POST /contentDocuments` | Publicação automática no lançamento de ISBNs |
| 🟡 12 | **Reports API** | `GET_VENDOR_SETTLING_FUNDS_REPORT` | Reconciliação financeira mensal automatizada |
| ⚪ 13 | **Product Fees** | `POST /feesEstimate` (batch) | Simulação de margem 1P vs 3P por título |
| ⚪ 14 | **DF APIs** | (todos) | Somente se Direct Fulfillment ativo |
| ❌ — | **Finances API v0** | — | **Não implementar para Vendor** — acesso restrito; usar Reports |

---

## 8. Questões abertas

| Questão | Status |
|---|---|
| A Heziom opera em Retail Procurement, Direct Fulfillment, ou ambos? | Confirmar com Comercial/Logística |
| Qual é o prazo de pagamento Amazon atual (net 30? net 60? net 90?)? | Confirmar com Financeiro |
| Frequência atual de chargebacks da Amazon? | Confirmar com Financeiro |
| Credenciais Vendor LWA já foram criadas? | Confirmar com TI/Comercial |
| Quem tem acesso admin ao Vendor Central? | Confirmar com Comercial |
| Amazon já cobra fine por não-confirmação de PO dentro do SLA? | Confirmar com Comercial |
| Heziom tem Brand Registry no INPI vinculado à conta Amazon? | Confirmar com Comercial — necessário para A+ Content API |
| `replenishmentCategory` dos títulos Vendor é AUTO_REPLENISHABLE? | Verificar via Catalog Items API após credenciais configuradas |
| Data Kiosk foi aprovado para a conta Vendor da Heziom? | Confirmar com TI — pode requerer aprovação separada |

---

*Fontes: developer-docs.amazon.com/sp-api · Dados coletados em 08/06/2026 · Expandido com Reports, Data Kiosk, Finances (acesso restrito), A+ Content, Catalog Items, Product Fees em 08/06/2026*
*Ver também: [[Amazon Seller Central — Mapeamento e Automação]] · [[Índice Comercial]] · [[CDQ — Sistema de Cadastro Multi-Plataforma]]*
