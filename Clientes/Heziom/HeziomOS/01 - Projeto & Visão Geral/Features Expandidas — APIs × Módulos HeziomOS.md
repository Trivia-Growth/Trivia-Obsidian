---
tags: [heziom, features, apis, roadmap, expansão]
status: proposta
criado: 2026-05-21
---

# Features Expandidas — O que as APIs Externas Habilitam no HeziomOS

> Análise cruzada: capacidades das 5 APIs pesquisadas (AppMax, Stone, Mercado Pago, Amazon SP-API, Mercado Livre) × módulos planejados do HeziomOS.
> Objetivo: identificar features de alto impacto que vão **além do fechamento mensal** e alimentam todo o ecossistema.

---

## Visão Geral: APIs × Módulos

```
                    FINANCEIRO  CEO DASH  COMERCIAL  CRM  LOGÍSTICA  ALERTAS  ATENDIMENTO
AppMax                 ✅         ✅        ✅       ✅      —         ✅        ✅
Stone Banking          ✅         ✅        —        —       —         ✅        —
Mercado Pago           ✅         ✅        —        ✅      —         ✅        —
Amazon SP-API          ✅         ✅        ✅       ✅      ✅         ✅        ✅
Mercado Livre          ✅         ✅        ✅       ✅      ✅         ✅        ✅
```

---

## 1. AppMax — Além do Extrato

### Features para o HeziomOS

| Feature | Módulo | Descrição | Impacto |
|---|---|---|---|
| **Webhook real-time de vendas D2C** | Financeiro + CEO Dashboard | 21 eventos (order.approved, payment.confirmed, refund.created) em tempo real → atualiza DRE instantâneo | 🔴 Alto — DRE em tempo real sem esperar sync |
| **Recuperação de vendas com IA** | CRM + Comercial | AppMax tem módulo nativo de recuperação de carrinho abandonado com IA | 🟡 Avaliar — pode conflitar com automação própria |
| **Split de pagamentos** | Financeiro + Pessoas | Quando a Heziom faz co-edição, pode configurar split automático com a editora parceira (ex: CEP) | 🟡 Médio — elimina cálculo manual de "Moda"/coproduções futuras |
| **Recorrência (assinaturas)** | Comercial + CRM | Se a Heziom lançar clube de assinatura de livros, a AppMax já suporta billing recorrente | 🟢 Futuro — oportunidade de receita |
| **Tokenização de cartão** | Atendimento | Vendas assistidas via WhatsApp podem cobrar com cartão tokenizado (PCI compliance) | 🟡 Médio — habilita venda por chat |
| **Conciliação exata D2C** | Conciliação Bancária | `price_seller` (valor líquido pós-taxa) por transação → match exato com repasse bancário | 🔴 Alto — elimina divergências de centavos |

### Dados exclusivos da AppMax para o DRE

```
AppMax: GET /v1/orders/{id}
├── total_amount (bruto)
├── gateway_fee (taxa do gateway por transação)
├── net_amount (líquido = o que cai na conta)
├── payment_method (cartão/PIX/boleto)
├── installments (parcelas)
├── customer_id → JOIN com CRM
└── refund_amount (se houve estorno)

HeziomOS pode calcular:
- Receita líquida D2C por dia/semana/mês (net_amount)
- Taxa média de gateway por forma de pagamento
- Ticket médio por canal (AppMax vs Tray vs ML vs Amazon)
- Projeção de recebíveis D2C (parcelas futuras)
```

---

## 2. Stone Banking — Além do Extrato

### Features para o HeziomOS

| Feature | Módulo | Descrição | Impacto |
|---|---|---|---|
| **Saldo em tempo real** | CEO Dashboard | `GET /balance` a cada 15 min → widget "Posição de Caixa" sempre atualizado | 🔴 Alto — alerta A1 (Cash <R$500K) fica instantâneo |
| **Extrato classificado automático** | Conciliação | `GET /statement` com metadata → match direto com ContaBancariaLancamento do Literarius | 🔴 Alto — conciliação >95% automática |
| **PIX em tempo real** | Financeiro + Alertas | Detectar PIX recebido → baixar título automaticamente no sistema | 🔴 Alto — elimina baixa manual de recebíveis PIX |
| **Transferências programáticas** | Aprovação de Pagamentos | Após CEO aprovar pagamento no HeziomOS → `POST /transfers` executa PIX/TED automaticamente | 🟠 Fase 2 — elimina login no banco para pagar |
| **Agenda de recebíveis** | Fluxo de Caixa Projetado | Stone sabe quando cada venda de cartão será liquidada (D+1, D+30) → projeção precisa | 🔴 Alto — fluxo de caixa projetado com dados reais, não estimativas |
| **Webhook de créditos** | Alertas | Notificação instantânea quando dinheiro cai na conta → confirma repasses Tray/ML/Amazon | 🟡 Médio — acelera conciliação de repasses |

### Fluxo integrado Stone → HeziomOS

```
Stone Banking API
    │
    ├── GET /balance (cada 15 min)
    │   └→ CEO Dashboard: widget "Caixa Atual: R$XXX"
    │   └→ Alerta A1 se < R$500K
    │
    ├── GET /statement (cada 15 min, delta)
    │   └→ Conciliação: match automático com Literarius
    │   └→ Se PIX recebido → baixa título (TituloFinanceiro.Pago=1)
    │   └→ Se crédito não identificado → fila manual
    │
    ├── GET /receivables-schedule
    │   └→ Fluxo de Caixa: projeção 90 dias com datas reais de liquidação
    │
    └── POST /transfers (fase 2)
        └→ Após aprovação no HeziomOS → executa pagamento
        └→ Registra comprovante → vincula ao título financeiro
```

---

## 3. Mercado Pago — Além do Extrato

### Features para o HeziomOS

| Feature | Módulo | Descrição | Impacto |
|---|---|---|---|
| **Settlement Reports automáticos** | Fechamento Mensal | Relatório CSV assíncrono com TODAS as transações do mês → reconciliação perfeita | 🔴 Alto — substitui download manual do portal |
| **Pagamentos search por período** | DRE por competência | `GET /v1/payments/search` com filtros por data, status, método → DRE granular por forma de pagamento | 🔴 Alto — receita líquida MP automática |
| **Refund tracking** | Financeiro + Alertas | Estornos aparecem na busca com status `refunded` → alerta + estorno automático de título | 🟡 Médio — detecta estornos antes do extrato bancário |
| **Chargeback notifications** | Alertas (🚨 CEO) | Webhook de chargeback → alerta urgente imediato | 🔴 Alto — chargeback é perda financeira real |
| **Balance real-time** | CEO Dashboard | Saldo MP disponível → somado ao saldo Stone para "Posição de Caixa Total" | 🟡 Médio — visão completa de caixa |
| **QR Code PIX dinâmico** | Comercial + Atendimento | Gerar cobranças PIX via API para vendas B2B/assistidas (sem maquininha) | 🟡 Médio — agiliza cobrança atacado |

### Dados exclusivos para DRE

```
Mercado Pago: GET /v1/payments/search
├── transaction_amount (bruto cobrado)
├── net_received_amount (líquido após taxa MP)
├── fee_details[] (breakdown de cada taxa: marketplace_fee, financing_fee, etc.)
├── money_release_date (quando o dinheiro fica disponível)
├── payment_method_id (credit_card, pix, bolbradesco, etc.)
└── installments + installment_rate

HeziomOS calcula:
- Receita líquida MP por dia (soma net_received_amount)
- Taxa média MP por forma de pagamento
- Projeção de liberação (money_release_date → fluxo de caixa)
- Comparativo taxa: MP vs AppMax vs Tray (qual gateway é mais barato?)
```

---

## 4. Amazon SP-API — Além das NFs

### Features para o HeziomOS

| Feature | Módulo | Descrição | Impacto |
|---|---|---|---|
| **Financial Events detalhados** | DRE por canal | Breakdown completo: preço, taxa Amazon, frete, promoção, taxa referral — por item | 🔴 Alto — margem REAL por livro na Amazon |
| **Settlement periods** | Fechamento + Conciliação | Amazon paga a cada 14 dias — saber exatamente quanto e quando vai cair | 🔴 Alto — fluxo de caixa preciso para canal Amazon |
| **FBA fees tracking** | Gestão de CMV | Se usar FBA, taxas de armazenamento + fulfillment por SKU → CMV real | 🟡 Fase futura (se ativar FBA) |
| **Refund & return events** | Alertas + Financeiro | Detectar devoluções e estornos Amazon → estornar título + devolver estoque | 🟡 Médio — automação de devoluções |
| **Orders API** | Logística + CRM | Pedidos Amazon com dados do comprador → unificar no CRM por CPF | 🟡 Médio — visão 360° do cliente cross-canal |
| **Tax withholding events** | Fiscal | Amazon retém impostos em alguns casos (BR) → registrar automaticamente | 🟡 Médio — compliance fiscal |
| **Reports API (settlements)** | Fechamento | Relatório flat-file com TODAS as transações de um período de liquidação | 🔴 Alto — reconciliação Amazon perfeita |

### Margem real por canal (feature killer)

```
HeziomOS: "Margem por Canal" (CEO Dashboard)

Para cada venda na Amazon:
  Preço de venda ..................... R$ 89,90
  - Referral fee (15%) .............. R$ 13,49
  - Closing fee ..................... R$  2,00
  - Frete (se FBM) ................. R$ 12,50
  = Receita líquida Amazon .......... R$ 61,91
  - CMV (custo livro Literarius) .... R$ 22,45
  = Margem bruta Amazon ............. R$ 39,46 (43,9%)

Comparando com mesmo livro na Tray:
  Preço de venda ..................... R$ 89,90
  - Taxa gateway AppMax (4,99%) ..... R$  4,49
  - Frete (Melhor Envio) ............ R$  9,80
  = Receita líquida Tray ............ R$ 75,61
  - CMV .............................. R$ 22,45
  = Margem bruta Tray ............... R$ 53,16 (59,1%)

→ Dashboard mostra: "Livro X rende 15pp a mais na Tray que na Amazon"
→ Decisão de pricing/canal informada por dados reais
```

---

## 5. Mercado Livre — Além dos Relatórios

### Features para o HeziomOS

| Feature | Módulo | Descrição | Impacto |
|---|---|---|---|
| **Orders em tempo real** | Logística + Financeiro | `GET /orders/search` — novos pedidos ML → criar título financeiro + enfileirar expedição | 🔴 Alto — elimina defasagem Literarius para ML |
| **Billing info por pedido** | DRE detalhado | `GET /orders/{id}/billing_info` — comissão ML + desconto + frete subsidiado por pedido | 🔴 Alto — margem real ML por venda |
| **Invoices (faturas ML)** | Fiscal + Fechamento | `GET /users/{id}/invoices` — faturas de comissão do ML → registrar como despesa automática | 🟡 Médio — automatiza "NFs TARIFAS mercado livre.zip" |
| **Customer unification** | CRM | Dados do comprador ML → dedup por CPF no CRM → perfil 360° | 🟡 Médio — saber que cliente X compra na ML E na Tray |
| **Métricas de seller** | CEO Dashboard | Reputação, reclamações, envios atrasados — indicadores de saúde do canal | 🟡 Médio — alerta se reputação cair |
| **Perguntas e mensagens** | Atendimento | API de mensagens do ML → unificar no módulo Atendimento (junto com WhatsApp) | 🟡 Fase 3 — atendimento multicanal |
| **Publicação automática** | Editorial → E-commerce | Quando editorial finaliza livro → `POST /items` cria listing no ML automaticamente | 🟡 Fase 3 — time-to-market reduzido |
| **Advertising API** | Marketing | Performance de anúncios ML → ROI por campanha no Dashboard | 🟢 Futuro — quando escalar ML Ads |

### Fluxo ML integrado

```
Mercado Livre API
    │
    ├── GET /orders/search (cada 15 min, delta por modified)
    │   ├→ Financeiro: criar título A/R (comissão já separada via billing_info)
    │   ├→ Logística: enfileirar pedido para expedição
    │   ├→ CRM: atualizar perfil do comprador (dedup CPF)
    │   └→ CEO Dashboard: atualizar faturamento ML do dia
    │
    ├── GET /users/{id}/invoices (mensal)
    │   └→ Fechamento: registrar fatura de comissão ML como despesa
    │       (substitui download manual de "NFs TARIFAS mercado livre.zip")
    │
    ├── GET /orders/{id}/billing_info (por pedido)
    │   └→ DRE: breakdown de margem por venda ML
    │       commission + shipping_discount + listing_fee
    │
    └── POST /items (trigger: editorial.book.published)
        └→ Criar listing automático no ML com:
           título, ISBN, preço, estoque, imagens, categoria
```

---

## 6. Feature Killer: "Margem por Canal" (Cross-API)

A feature de maior impacto estratégico para o CEO é ter **margem real por canal por produto** cruzando TODAS as APIs:

```
┌─────────────────────────────────────────────────────────────────┐
│  CEO Dashboard → Tab "Margem por Canal"                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Produto: "Devocional Mães da Aliança 2026" (ISBN 978655265)   │
│  Custo (Literarius CMV): R$ 22,45                               │
│                                                                 │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐      │
│  │  Canal   │ Preço    │ Taxas    │ Frete    │ Margem   │      │
│  ├──────────┼──────────┼──────────┼──────────┼──────────┤      │
│  │ Tray     │ R$149,90 │ R$ 7,49  │ R$ 9,80  │ 73,1%    │      │
│  │ AppMax   │ R$149,90 │ R$ 7,49  │ R$ 9,80  │ 73,1%    │      │
│  │ ML       │ R$139,90 │ R$20,99  │ R$ 0,00* │ 69,0%    │      │
│  │ Amazon   │ R$149,90 │ R$24,48  │ R$12,50  │ 60,3%    │      │
│  │ Atacado  │ R$ 89,94 │ R$ 0,00  │ R$ 5,40  │ 69,1%    │      │
│  │ Livraria │ R$149,90 │ R$ 2,50  │ R$ 0,00  │ 83,3%    │      │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘      │
│  * ML Full = frete grátis subsidiado pelo seller (incluído nas  │
│    taxas via billing_info.shipping_discount)                     │
│                                                                 │
│  Insight: "Livraria tem 83% de margem vs Amazon 60% — cada     │
│   venda na livraria vale 1,4x mais que na Amazon"              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Fontes de dados por coluna:**
- Preço: Literarius (PrecoTabela) ou cada plataforma
- Taxas: AppMax (gateway_fee), Tray (payment_method_rate), ML (billing_info.commission), Amazon (referral_fee + closing_fee)
- Frete: Melhor Envio API (custo real do envio por pedido)
- CMV: Literarius (vwProdutoCusto)

---

## 7. Feature: "Fluxo de Caixa Projetado Real" (Cross-API)

Hoje o fluxo de caixa projetado usa estimativas. Com as APIs, pode usar **datas reais de liquidação**:

```
Fontes de projeção de entrada:
├── Stone: agenda de recebíveis (cartão D+1 a D+30, exata)
├── AppMax: parcelas futuras com datas de liquidação
├── Mercado Pago: money_release_date por pagamento
├── Amazon: settlement period (cada 14 dias) 
├── Mercado Livre: via MP settlement (mesma lógica)
├── Tray: Payment.date_transaction + prazo do gateway
└── Literarius: TituloFinanceiro com Vencimento (atacado/boletos)

Resultado: projeção de 90 dias com precisão de ±2% 
(hoje é ±15-20% porque usa estimativas de prazo)
```

---

## 8. Feature: "Conciliação Multi-Gateway" (Cross-API)

Com todas as APIs conectadas, a conciliação bancária fica muito mais poderosa:

```
Extrato Stone (créditos do dia):
├── R$ 3.450,00 ← Match com: AppMax settlement D2C (sum net_amount = 3.450,00) ✅
├── R$ 8.921,33 ← Match com: Tray repasse (tray_payments WHERE date = hoje) ✅  
├── R$ 2.104,50 ← Match com: Amazon settlement (financial_event_group) ✅
├── R$ 1.890,00 ← Match com: ML via MP (money_release_date = hoje) ✅
├── R$   456,78 ← Match com: Literarius boleto recebido (TituloFinanceiroBaixa) ✅
└── R$   230,00 ← ❓ Não identificado → fila manual (< 5% dos casos)

Taxa de conciliação automática: >95%
```

---

## 9. Feature: "Alertas Financeiros Inteligentes" (Cross-API)

Novos alertas possíveis com dados das APIs:

| Alerta | Fonte | Trigger | Prioridade |
|---|---|---|---|
| 🚨 Chargeback recebido | MP webhook / AppMax webhook | Imediato | CRÍTICO |
| 🚨 Saldo Stone < R$500K | Stone GET /balance (15 min) | Imediato | CRÍTICO |
| ⚠️ Repasse Amazon atrasado | SP-API settlement_period > 16 dias sem crédito | Diário | ATENÇÃO |
| ⚠️ Taxa gateway subiu | AppMax/MP: taxa média mês > taxa mês anterior +0.5pp | Semanal | ATENÇÃO |
| ⚠️ Reputação ML caiu | ML GET /users/{id} → seller_reputation | Diário | ATENÇÃO |
| ℹ️ Novo settlement Amazon | SP-API financial_event_group criado | Imediato | INFO |
| ℹ️ PIX recebido > R$10K | Stone statement (realtime) | Imediato | INFO |
| ℹ️ Meta ML Full atingida | ML métricas de envio → free shipping threshold | Semanal | INFO |

---

## 10. Feature: "Painel de Canais" — CEO Dashboard (nova tab)

```
┌──────────────────────────────────────────────────────────────┐
│ HeziomOS > Dashboard CEO > 🏪 Canais                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Faturamento Maio/2026 (até dia 21)                          │
│                                                              │
│ ┌─────────────┬──────────┬────────┬────────┬────────┐       │
│ │ Canal       │ Bruto    │ Taxas  │ Líquido│ Margem │       │
│ ├─────────────┼──────────┼────────┼────────┼────────┤       │
│ │ E-commerce  │ R$ 142K  │ R$ 7K  │ R$ 135K│ 71,2%  │       │
│ │  └ Tray     │   R$ 89K │  R$ 4K │  R$ 85K│ 72,8%  │       │
│ │  └ AppMax   │   R$ 53K │  R$ 3K │  R$ 50K│ 68,4%  │       │
│ │ Atacado     │ R$  98K  │ R$ 0K  │ R$ 98K │ 67,3%  │       │
│ │ Marketplaces│ R$  67K  │ R$ 14K │ R$ 53K │ 58,1%  │       │
│ │  └ ML       │   R$ 45K │  R$ 9K │  R$ 36K│ 55,7%  │       │
│ │  └ Amazon   │   R$ 22K │  R$ 5K │  R$ 17K│ 63,2%  │       │
│ │ Livraria    │ R$  34K  │ R$ 1K  │ R$ 33K │ 81,5%  │       │
│ ├─────────────┼──────────┼────────┼────────┼────────┤       │
│ │ TOTAL       │ R$ 341K  │ R$ 22K │ R$ 319K│ 68,4%  │       │
│ └─────────────┴──────────┴────────┴────────┴────────┘       │
│                                                              │
│ 📊 Tendência: E-commerce +12% vs mês anterior               │
│ ⚠️ Amazon: margem caiu 3pp (referral fee aumentou?)         │
│ ✅ Livraria: melhor margem do mix (como sempre)              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Fontes dos dados:**
- E-commerce Tray: `tray_payments.price_seller`
- E-commerce AppMax: `AppMax API /v1/orders` → `net_amount`
- Atacado: Literarius `NotaFiscal WHERE CanalVenda = 'ATACADO'`
- ML: `ML API /orders/{id}/billing_info` → `net_received_amount`
- Amazon: `SP-API /finances/v0/financialEvents` → `ShipmentItemChargeList - FeeList`
- Livraria: Literarius `NotaFiscal WHERE CanalVenda IN ('LIVRARIA','SHOWROOM')`

---

## 11. Resumo: Features por Fase

### Fase 1 (Imediato — junto com sync agent)

| Feature | APIs envolvidas | Módulo |
|---|---|---|
| Saldo em tempo real | Stone | CEO Dashboard |
| DRE com receita líquida real por canal | Todas | Financeiro + Dashboard |
| Conciliação multi-gateway automática | Stone + AppMax + MP | Conciliação Bancária |
| Settlement reports automáticos | MP + Amazon | Fechamento Mensal |
| Alertas de chargeback/estorno | AppMax + MP | Alertas |
| Fluxo de caixa com datas reais de liquidação | Stone + AppMax + MP + Amazon | Fluxo Projetado |

### Fase 2 (Após credenciais obtidas, 1-2 meses)

| Feature | APIs envolvidas | Módulo |
|---|---|---|
| Margem por canal por produto | Todas + Literarius | CEO Dashboard (nova tab) |
| Painel de Canais consolidado | Todas | CEO Dashboard |
| Pedidos ML em tempo real → logística | ML | Logística + Financeiro |
| Invoices ML automáticas (substitui ZIP manual) | ML | Fechamento |
| Publicação automática de livros no ML | ML | Editorial → E-commerce |
| Unificação CRM cross-canal (CPF dedup) | ML + Amazon | CRM |
| Comparativo de taxas entre gateways | AppMax + Tray + MP | Financeiro |

### Fase 3 (3-6 meses — após estabilização)

| Feature | APIs envolvidas | Módulo |
|---|---|---|
| Pagamentos programáticos (PIX/TED via API) | Stone | Aprovação de Pagamentos |
| QR Code PIX para atacado | MP | Comercial |
| Atendimento unificado ML + WhatsApp | ML Messages | Atendimento |
| Advertising ROI (ML Ads + Meta) | ML + Meta | Marketing |
| Split automático para coproduções | AppMax | Financeiro + Editorial |
| FBA fees tracking | Amazon | Logística + CMV |

---

## 12. Decisões Arquiteturais Implicadas

### D1: Tabela unificada de transações

```sql
CREATE TABLE heziom_transactions (
    id              UUID PRIMARY KEY,
    source          TEXT NOT NULL,  -- 'tray', 'appmax', 'mercado_pago', 'amazon', 'mercado_livre', 'stone', 'literarius'
    source_id       TEXT NOT NULL,  -- ID na plataforma de origem
    order_id        TEXT,           -- ID do pedido (se aplicável)
    type            TEXT NOT NULL,  -- 'sale', 'refund', 'fee', 'transfer', 'settlement'
    gross_amount    NUMERIC(12,2),
    fee_amount      NUMERIC(12,2),
    net_amount      NUMERIC(12,2),
    payment_method  TEXT,           -- 'credit_card', 'pix', 'boleto', 'transfer'
    status          TEXT,           -- 'approved', 'pending', 'refunded', 'cancelled'
    transaction_date TIMESTAMPTZ,
    settlement_date TIMESTAMPTZ,    -- quando o dinheiro fica/ficou disponível
    channel         TEXT,           -- 'ecommerce_tray', 'ecommerce_appmax', 'marketplace_ml', 'marketplace_amazon', 'atacado', 'livraria'
    product_ids     TEXT[],         -- array de SKUs (para margem por produto)
    customer_id     UUID,           -- FK para crm_contacts (dedup CPF)
    lit_titulo_id   BIGINT,         -- FK para Literarius (após conciliação)
    metadata        JSONB,          -- dados específicos de cada fonte
    synced_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON heziom_transactions (source, transaction_date);
CREATE INDEX ON heziom_transactions (channel, transaction_date);
CREATE INDEX ON heziom_transactions (settlement_date);
CREATE INDEX ON heziom_transactions (customer_id);
```

### D2: View materializada para DRE por canal

```sql
CREATE MATERIALIZED VIEW mv_dre_por_canal AS
SELECT
    DATE_TRUNC('month', transaction_date) AS mes,
    channel,
    SUM(gross_amount) AS bruto,
    SUM(fee_amount) AS taxas,
    SUM(net_amount) AS liquido,
    COUNT(*) AS transacoes,
    AVG(gross_amount) AS ticket_medio
FROM heziom_transactions
WHERE type = 'sale' AND status = 'approved'
GROUP BY 1, 2;
```

### D3: Fluxo de caixa projetado (com settlement_date real)

```sql
-- Entradas projetadas nos próximos 90 dias
SELECT
    settlement_date::DATE AS dia,
    source,
    SUM(net_amount) AS entrada_projetada
FROM heziom_transactions
WHERE settlement_date > NOW()
  AND settlement_date < NOW() + INTERVAL '90 days'
  AND status IN ('approved', 'pending')
GROUP BY 1, 2
ORDER BY 1;
```

---

## Referências

- [[APIs Externas — Credenciais e Passo a Passo]] — como obter cada credencial
- [[Fechamento Mensal — Automação Completa]] — processo de fechamento
- [[Roadmap de Integração Tray × Literarius]] — roadmap Tray
- [[HeziomOS — Interligação Completa entre Módulos]] — arquitetura de módulos
- [[Tray — Correlação com Literarius]] — mapa campo a campo

---

*Análise realizada em 21/05/2026 — JG Novais (Trivia)*
*Base: pesquisa de APIs (AppMax, Stone, MP, Amazon SP-API, ML) × arquitetura HeziomOS (10 módulos, 52 eventos)*
