---
tags: [integracao, tray, repasses, conciliacao, ecommerce]
status: especificação
criado: 2026-04-15
---

# Tray — Conciliação de Repasses

Especificação da integração HeziomOS × Tray focada em rastrear os repasses financeiros do e-commerce, cruzando pedidos aprovados no Tray com os créditos recebidos na conta Santander.

Para autenticação e endpoints gerais, ver [[Tray - Autenticação]] e [[Tray - Pedidos]].

---

## Problema

O Tray processa os pagamentos do e-commerce (site.heziom.com.br) mas o dinheiro só chega na conta Santander após um prazo de repasse. Hoje:
- Não há controle do prazo de repasse esperado vs. recebido
- Não há alerta quando um repasse está atrasado
- A reconciliação entre "pedido X foi pago" e "crédito Y caiu na conta" é manual

---

## Fluxo de Pagamento Tray

```
Cliente faz pedido no site
  │
  ├── Pagamento processado (gateway Stone/cielo via Tray)
  ├── Status no Tray: approved
  │
  ├── [D+N dias] Tray realiza o repasse:
  │   ├── Crédito na conta Santander
  │   └── Descrição: "TRAY" ou "REPASSE TRAY" ou nome do gateway
  │
  └── PedidoVenda criado no Literarius com SiteIdPedido = Tray order.id
```

**Prazo de repasse:** a confirmar com Heziom (tipicamente D+2 para cartão, D+1 para PIX)

---

## Reconciliação Tray ↔ Literarius

### Chave de conciliação
`Tray order.id` ↔ `Literarius.PedidoVenda.SiteIdPedido`

```sql
-- Pedidos Tray que existem no Literarius
SELECT
    pv.idPedidoVenda,
    pv.SiteIdPedido    AS TrayOrderId,
    pv.DataPedido,
    pv.ValorPedido,
    nf.Numero          AS NF,
    tf.Valor           AS TituloValor,
    tf.Pago
FROM Literarius.dbo.PedidoVenda      pv
LEFT JOIN Literarius.dbo.NotaFiscal  nf ON nf.idPedidoVenda = pv.idPedidoVenda
LEFT JOIN Literarius.dbo.TituloFinanceiro tf ON tf.OrigemIdRegistro = pv.idPedidoVenda
WHERE pv.CanalVenda = (SELECT Codigo FROM Literarius.dbo.CanalVenda WHERE Descricao = 'ECOMMERCE')
  AND pv.DataPedido >= DATEADD(MONTH, -3, GETDATE())
ORDER BY pv.DataPedido DESC;
```

---

## Rastreamento de Repasses

### Tabela HeziomOS: `repasse_tracking`

```sql
CREATE TABLE repasse_tracking (
    id                      SERIAL PRIMARY KEY,
    tray_order_id           BIGINT NOT NULL UNIQUE,
    literarius_pedido_id    INTEGER,          -- NULL se não encontrado no Literarius
    data_aprovacao          DATE NOT NULL,
    valor_bruto             NUMERIC(12,2) NOT NULL,
    gateway_taxa            NUMERIC(12,2),    -- taxa do gateway (Stone/Cielo)
    valor_repasse_esperado  NUMERIC(12,2),    -- bruto - taxa
    data_repasse_esperada   DATE,             -- aprovacao + prazo_repasse_dias
    data_repasse_recebida   DATE,             -- preenchido pela conciliação bancária
    bank_statement_item_id  INTEGER,          -- FK para o crédito no extrato
    status                  TEXT DEFAULT 'pendente',
    -- pendente / recebido / atrasado / divergente
    criado_em               TIMESTAMP DEFAULT NOW()
);
```

---

## Endpoints Tray Utilizados

### GET /orders — Pedidos aprovados
```http
GET https://api.traycheckout.com.br/v2/orders
  ?status=approved
  &date_type=payment_date
  &start_date=2026-04-01
  &end_date=2026-04-15
  &per_page=50
  &page=1
Authorization: Bearer {access_token}
```

**Campos relevantes:**
| Campo Tray | Uso |
|-----------|-----|
| `id` | Chave para cruzar com SiteIdPedido |
| `status` | Filtrar: approved, canceled, shipped |
| `total` | Valor bruto do pedido |
| `payment.method` | credit_card, pix, boleto |
| `payment.installments` | Nº de parcelas |
| `approved_at` | Data de aprovação → base para prazo repasse |
| `store_id` | Para multi-loja futura |

### GET /orders/{id}/financial-release (se disponível)
- Endpoint de repasse por pedido (a confirmar existência)
- Alternativa: calcular pelo banco (crédito com descrição "TRAY")

---

## Job de Sincronização

```
Diário 6h — Sync de pedidos Tray aprovados

1. GET /orders?status=approved&date_type=payment_date
   &start_date=ONTEM&end_date=HOJE

2. Para cada pedido:
   a. Verificar se existe em repasse_tracking (idempotente)
   b. Se novo:
      - Buscar no Literarius: SELECT SiteIdPedido = tray_order.id
      - Calcular valor_repasse_esperado = total - gateway_taxa
      - Calcular data_repasse_esperada = approved_at + prazo_dias
      - INSERT em repasse_tracking (status='pendente')

3. Verificar repasses com data_repasse_esperada < HOJE e status='pendente'
   - status = 'atrasado'
   - Disparar alerta Teams B3
```

---

## Matching Crédito Bancário ↔ Repasse

A conciliação bancária ([[Conciliação Bancária]]) identifica créditos com descritivo "TRAY" ou similar.

```
OFX CREDIT com NAME='REPASSE TRAY' e TRNAMT=X.XXX,XX
  │
  ├── Buscar em repasse_tracking WHERE:
  │   valor_repasse_esperado ≈ TRNAMT (±5%)
  │   E data_repasse_esperada ≈ data_extrato (±3 dias úteis)
  │   E status = 'pendente' ou 'atrasado'
  │
  ├── Match encontrado:
  │   ├── UPDATE repasse_tracking SET status='recebido', data_repasse_recebida=data
  │   └── Link bank_statement_item_id para o crédito
  │
  └── Sem match: crédito Tray sem pedido associado → revisar manualmente
```

**Complicação:** Um crédito Tray pode ser um repasse agregado de múltiplos pedidos. Nesses casos:
- Crédito bancário X ≠ valor de 1 pedido
- Solução: comparar com soma de pedidos do período com status='pendente'

---

## Divergência de Valores

Quando `valor_repasse_recebido` ≠ `valor_repasse_esperado`:

| Causa possível | Ação |
|---------------|------|
| Chargeback descontado | Verificar pedidos cancelados no período |
| Taxa gateway diferente | Rever `marketplace_rates.taxa_gateway` |
| Estorno de pedido | Tray descontou estorno no repasse |
| Erro do Tray | Abrir chamado no suporte Tray |

---

## Análise de Performance por Canal Tray

```sql
-- Ticket médio e volume por mês — canal ECOMMERCE
SELECT
    FORMAT(nf.DataEmissao, 'yyyy-MM') AS Mes,
    COUNT(DISTINCT pv.idPedidoVenda)  AS QtdePedidos,
    SUM(nf.TotalNota)                 AS FaturamentoBruto,
    AVG(nf.TotalNota)                 AS TicketMedio
FROM Literarius.dbo.NotaFiscal    nf
JOIN Literarius.dbo.PedidoVenda   pv ON pv.idPedidoVenda = nf.idPedidoVenda
WHERE nf.EntSai         = 'S'
  AND nf.Cancelada      = 0
  AND nf.GeraFinanceiro = 1
  AND nf.DataEmissao   >= '2025-01-01'
  AND pv.SiteIdPedido IS NOT NULL   -- pedidos que vieram do site Tray
GROUP BY FORMAT(nf.DataEmissao, 'yyyy-MM')
ORDER BY Mes;
```

---

## Módulos Relacionados

- [[Pedidos e Vendas]] — PedidoVenda.SiteIdPedido é a chave de conciliação
- [[Contas a Receber]] — repasses Tray = baixa de títulos a receber
- [[Comissões e Repasses]] — cálculo de receita líquida Tray (bruto - gateway)
- [[Conciliação Bancária]] — crédito Tray identificado no extrato
- [[Alertas e Notificações]] — alerta B3 (repasse atrasado)
- [[Tray - Autenticação]], [[Tray - Pedidos]], [[Tray - Pagamentos]] — documentação API
- [[HeziomOS — Arquitetura]] — visão geral do sistema
