---
tags: [tray, literarius, correlação, sync, financeiro]
status: mapeado
criado: 2026-05-19
---

# Tray × Literarius — Mapa de Correlação

> Como os dois sistemas se conectam. Este é o documento central para qualquer
> operação que precise cruzar dados da loja Tray com o ERP Literarius.

---

## A chave de ouro: `SiteIdPedido`

Todos os pedidos do e-commerce que chegam no Literarius carregam o ID da Tray:

```
Tray: Order.id  (ex: 482901)
       ↕
Literarius: PedidoVenda.SiteIdPedido  (varchar)
            NotaFiscal.SiteIdPedido   (varchar)
```

Com esse campo é possível rastrear **qualquer pedido Tray** até a NF emitida, o título financeiro gerado e o repasse bancário recebido.

---

## Mapa completo — campo a campo

### Pedido

| Campo Tray | Campo Literarius | Tabela Literarius | Observação |
|---|---|---|---|
| `Order.id` | `SiteIdPedido` | `PedidoVenda`, `NotaFiscal` | Chave de conciliação primária |
| `Order.date` | `DataPedido` | `PedidoVenda` | Data de criação do pedido |
| `Order.total` | `TotalNota` | `NotaFiscal` | Valor total (pós-desconto + frete) |
| `Order.discount` | `Desconto` | `NotaFiscal` | Desconto aplicado |
| `Order.shipment_value` | `ValorFrete` | `NotaFiscal` | Frete cobrado |
| `Order.taxes` | `TotalImpostos` | `NotaFiscal` | Sempre 0 para livros (imunidade) |
| `Order.payment_method` | `FormaPagto.Descricao` | `FormaPagto` | Forma de pagamento |
| `Order.status = aprovado` | `TituloFinanceiro.TipoTitulo = 'R'` | `TituloFinanceiro` | Pedido aprovado → título a receber gerado |

### Nota Fiscal

| Campo Tray | Campo Literarius | Observação |
|---|---|---|
| `Invoice.order_id` | `NotaFiscal.SiteIdPedido` | Liga a NF Tray à NF do ERP |
| `Invoice.access_key` | `NotaFiscal.NFeChave` | Chave SEFAZ (44 dígitos) — campo idêntico |
| `Invoice.invoice_number` | `NotaFiscal.Numero` | Número da NF |
| `Invoice.value` | `NotaFiscal.TotalNota` | Deve coincidir |

**Fluxo de NF:**
```
1. Pedido aprovado na Tray
2. Literarius emite NF → gera NotaFiscal.NFeChave
3. POST /invoices na Tray com a NFeChave → vincula NF ao pedido
4. Tray exibe NF na área do cliente
```

### Pagamento / Liquidação

| Campo Tray | Campo Literarius | Observação |
|---|---|---|
| `Payment.order_id` | `TituloFinanceiro` via `PedidoVenda.SiteIdPedido` | Liquidação do título |
| `Payment.status = approved` | `TituloFinanceiro.Pago = 1` | Baixa do título a receber |
| `Payment.price_seller` | `TituloFinanceiroBaixa.ValorBaixa - ValorTaxa` | Valor líquido recebido (pós-taxa gateway) |
| `Payment.tax` | `TituloFinanceiroBaixa.ValorTaxa` | Taxa do gateway |
| `Payment.date_transaction` | `TituloFinanceiroBaixa.DataBaixa` | Data do recebimento |

### Produto

| Campo Tray | Campo Literarius | Observação |
|---|---|---|
| `ProductSold.ean` | `Produto.CodigoBarras` | EAN — melhor chave de conciliação de produto |
| `ProductSold.product_id` | `Produto.SiteID` (col na `vwProdutoEstoque`) | ID do produto na Tray |
| `ProductSold.quantity` | `NotaFiscalItens.Qtde` | Quantidade vendida |
| `ProductSold.price` | `NotaFiscalItens.ValorUnitario` | Preço unitário |

---

## Fluxo completo de um pedido e-commerce

```
TRAY                          LITERARIUS
──────────────────────────────────────────────────────────────
1. Cliente compra              
   → Order criado (id=482901)  
   → status = aguardando       

2. Pagamento aprovado          
   → Payment.status = approved  →  PedidoVenda (SiteIdPedido=482901)
                                →  TituloFinanceiro.TipoTitulo='R'
                                →  TituloFinanceiro.Pago=0

3. Separação e envio           
   → Order.status = enviado    →  PedidoVenda.Status atualizado
   → sending_code = (rastreio)  

4. NF emitida (Literarius)     
   → NotaFiscal criada         →  POST /invoices (NFeChave)
   → NFeChave enviada à Tray   →  Tray exibe NF para cliente

5. Repasse recebido            
   → Extrato bancário OFX      →  TituloFinanceiroBaixa
   → Conciliação bancária      →  TituloFinanceiro.Pago = 1
```

---

## O que a Tray tem que o Literarius NÃO tem

| Dado | Endpoint Tray | Por que importa |
|---|---|---|
| **Status em tempo real** do pedido | `GET /orders/:id` | Literarius só atualiza em batch — Tray tem o real-time |
| **Taxa exata do gateway** | `Payment.payment_method_rate` | Literarius não rastreia taxa por transação |
| **Código de rastreio** | `Order.sending_code` + `shipment_integrator` | Logística pós-venda |
| **ID do cliente na Tray** | `Order.customer_id` | CRM do e-commerce |
| **Cupons e promoções** | `Order.discount_coupon` | Análise de efetividade de campanhas |
| **Webhooks em tempo real** | `/hooks` | Reação imediata a pagamento, cancelamento, entrega |
| **Valor líquido pós-taxa** | `Payment.price_seller` | Receita líquida real do canal e-commerce |

---

## O que o Literarius tem que a Tray NÃO tem

| Dado | Tabela Literarius | Por que importa |
|---|---|---|
| **Títulos de todos os canais** | `TituloFinanceiro` | Atacado, livrarias, direto — não só e-commerce |
| **Saldo bancário** | `ContaBancaria` | Posição de caixa real |
| **Plano de contas / DRE** | `PlanoConta`, rateio | Resultado por categoria |
| **Estoque físico** | `Estoque`, `MovimentoEstoque` | Saldo, giro, cobertura |
| **Consignações** | `Consignacao` | R$2,06M em estoque com terceiros |
| **Royalties** | `DireitoAutoralFechamento` | CMV editorial real |
| **NFs de compra** | `Entrada` | CMV de compra |
| **Histórico completo** | todas as tabelas | Literarius tem desde o início da empresa |

---

## Dados exclusivos da interseção (precisam dos dois)

| Análise | Por que precisa dos dois |
|---|---|
| **Receita líquida e-commerce** | Tray dá a taxa do gateway, Literarius dá o faturamento bruto |
| **Ticket médio real** | Tray tem o pedido, Literarius tem a NF com itens e desconto final |
| **Conciliação de repasse** | Tray diz quando pagou, Literarius confirma quando recebeu no banco |
| **Conversão pedido → NF** | Tray tem pedidos aprovados, Literarius tem NFs emitidas — cruzar para encontrar gaps |
| **CMV por canal e-commerce** | Tray diz quais produtos foram vendidos no site, Literarius diz o custo de cada um |

---

## Queries de conciliação prontas

### Pedidos Tray sem NF no Literarius (gaps de faturamento)
```sql
-- Pedidos com SiteIdPedido preenchido mas sem NF associada
SELECT pv.idPedidoVenda, pv.SiteIdPedido, pv.DataPedido, pv.Total
FROM PedidoVenda pv
WHERE pv.SiteIdPedido IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM NotaFiscal nf
    WHERE nf.SiteIdPedido = pv.SiteIdPedido
      AND nf.Cancelada = 0
  )
  AND pv.DataPedido >= '2026-01-01'
ORDER BY pv.DataPedido DESC
```

### Volume e receita por canal (Literarius) × pedidos por canal (Tray)
```sql
-- Literarius: faturamento e-commerce por dia
SELECT 
    CAST(nf.DataEmissao AS DATE) AS Data,
    cv.Descricao AS Canal,
    COUNT(*) AS NFs,
    SUM(nf.TotalNota) AS Faturamento
FROM NotaFiscal nf
LEFT JOIN CanalVenda cv ON cv.Codigo = nf.CanalVenda
WHERE nf.EntSai = 'S'
  AND nf.Cancelada = 0
  AND nf.GeraFinanceiro = 1
  AND nf.SiteIdPedido IS NOT NULL   -- só pedidos vindos da Tray
  AND nf.DataEmissao >= '2026-05-01'
GROUP BY CAST(nf.DataEmissao AS DATE), cv.Descricao
ORDER BY Data, Canal
```

### Divergências de valor pedido × NF
```sql
-- Detecta pedidos onde o valor da NF diverge do total do pedido (>R$1 de diferença)
SELECT 
    pv.SiteIdPedido,
    pv.Total AS TotalPedido,
    nf.TotalNota AS TotalNF,
    ABS(pv.Total - nf.TotalNota) AS Divergencia
FROM PedidoVenda pv
JOIN NotaFiscal nf ON nf.SiteIdPedido = pv.SiteIdPedido
WHERE nf.Cancelada = 0
  AND ABS(pv.Total - nf.TotalNota) > 1.00
ORDER BY Divergencia DESC
```

---

## Webhooks Tray — Eventos para o HeziomOS

| Evento | Quando dispara | Ação no HeziomOS |
|---|---|---|
| `order_status_change` | Status do pedido muda | Atualizar `PedidoVenda.Status` em tempo real |
| `payment_approved` | Pagamento confirmado | Criar/baixar `TituloFinanceiro` |
| `payment_refunded` | Estorno | Gerar título a pagar de estorno |
| `order_shipped` | Pedido enviado | Registrar código de rastreio |
| `order_cancelled` | Cancelamento | Cancelar NF e título se existirem |

Documentação completa: [[Tray - Webhooks]]

---

## Status atual da integração (19/Mai/2026)

| Item | Status |
|---|---|
| Consumer Key + Secret recebidas | ✅ Recebido em 15/04/2026 |
| Loja de teste disponível | ✅ `loja=1225878` |
| `code` gerado (instalação do app) | ⬜ Pendente — fazer login na loja de teste |
| `access_token` obtido | ⬜ Pendente |
| Endpoints testados | ⬜ Pendente |
| Webhooks configurados | ⬜ Pendente |
| Sync agent conectado à Tray | ⬜ Pendente |
| Homologação concluída | ⬜ Prazo: até 13/08/2026 |

---

## Próximos passos — Integração Tray

1. **Instalar o app** na loja de teste (loja 1225878) para gerar o `code`
2. **Obter o Access Token** via `POST /auth` com consumer_key + consumer_secret + code
3. **Testar `GET /orders`** filtrando por data — confirmar retorno e campos
4. **Confirmar campo `SiteIdPedido`** no Literarius (já visto em queries, mas validar com dado real)
5. **Implementar webhook** para `payment_approved` → baixa automática de título
6. **Conciliar divergências** pedido × NF usando a query acima

---

## Referências

- [[Tray - Autenticação]] — credenciais, OAuth, rate limit
- [[Tray - Pedidos]] — campos detalhados de pedidos
- [[Tray - Pagamentos]] — campos de pagamento e taxa gateway
- [[Tray - Invoices]] — vinculação NF Tray ↔ Literarius
- [[Tray - Webhooks]] — eventos em tempo real
- [[NotaFiscal]] — NFs no ERP
- [[PedidoVenda]] — pedidos no ERP
- [[TituloFinanceiro]] — títulos financeiros

---

*Mapeado em 2026-05-19 — JG Novais (Trivia)*
