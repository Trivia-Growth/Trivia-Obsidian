---
tags: [financeiro, modulo, comissoes, repasses, marketplace, tray]
status: especificação
criado: 2026-04-15
---

# Comissões e Repasses

Módulo que rastreia a receita líquida real por canal de venda, calculando comissões de marketplace, repasses do Tray/gateways e comissões de vendedores internos. Alimenta o DRE com receita líquida por canal ao invés de receita bruta.

---

## Problema Resolvido

| Problema atual | Impacto |
|---------------|---------|
| DRE usa receita bruta de todos os canais | Margens por canal distorcidas |
| Comissão do Mercado Livre (~16%) não é subtraída da receita | CMV/Receita subestimado para canal ML |
| Repasse da Tray não é rastreado sistematicamente | Não sabe se o valor que cai na conta está correto |
| Prazo de repasse Tray desconhecido no sistema | Sem alerta de repasse em atraso |
| Comissões de vendedores internos calculadas manualmente | Risco de erro, sem histórico |

---

## Objetivo

1. Calcular receita líquida por canal: faturamento bruto − comissão − gateway − frete
2. Rastrear repasses esperados × recebidos da Tray
3. Alertar repasses em atraso (N dias após aprovação do pedido)
4. Calcular comissões de vendedores internos com base em `ComissaoParametro`
5. Alimentar DRE com receita líquida por canal de venda

---

## Fontes de Dados

### Literarius (leitura)
| Tabela | Campos-chave | Uso |
|--------|-------------|-----|
| [[PedidoVenda]] | SiteIdPedido, CanalVenda, ValorPedido, DataPedido | Base de pedidos |
| [[NotaFiscal]] | TotalNota, CanalVenda, DataEmissao, Frete | Faturamento por canal |
| [[ComissaoParametro]] | Vendedor, PercComissao, CanalVenda, TipoCalculo | Regras de comissão interna |
| `CanalVenda` | Codigo, Descricao | 13 canais cadastrados |

### Tray API (leitura)
| Endpoint | Campos-chave | Uso |
|----------|-------------|-----|
| `GET /orders` | id, status, total, payment_method, store_id | Pedidos Tray |
| `GET /orders/{id}/payments` | status, date_approved, value | Status de pagamento |
| `GET /financial/releases` (se disponível) | date_release, value, order_id | Repasses |

### HeziomOS DB
| Tabela | Campos | Uso |
|--------|--------|-----|
| `marketplace_rates` | canal, taxa_comissao, taxa_gateway, prazo_repasse_dias | Taxas por canal |
| `repasse_tracking` | tray_order_id, valor_bruto, valor_repasse_esperado, data_aprovacao, data_repasse_esperada, data_repasse_recebida, status | Tracking de repasses |

---

## Taxas por Canal (a confirmar com Heziom)

| Canal | Comissão | Gateway | Prazo Repasse |
|-------|---------|---------|--------------|
| SITE (Tray) | 0% (próprio) | ~2.5% (Stone) | D+? (a confirmar) |
| MERCADO LIVRE | ~16% (variável por categoria) | incluso | D+14–D+20 |
| AMAZON | ~15% + fulfillment | incluso | D+14 |
| LIVRARIA | 0% | 0% | venda direta |
| ATACADO | 0% | 0% | conforme CondicaoPagto |

---

## Receita Líquida por Canal — Fórmula

```
Receita Líquida = Receita Bruta
                − Comissão Marketplace
                − Taxa Gateway
                − Frete (se absorvido pela Heziom)
                − Devoluções

Exemplo canal MERCADO LIVRE:
  Receita Bruta: R$ 61.500 (março/2026)
  Comissão ML:   R$  9.840 (16%)
  Gateway:       incluso na comissão ML
  Receita Líq:   R$ 51.660
  Margem canal:  84% do bruto
```

---

## Fluxo de Rastreamento de Repasses Tray

```
Tray: pedido aprovado (status = paid)
  │
  ├── HeziomOS lê via API Tray GET /orders?status=paid
  ├── INSERT em repasse_tracking:
  │   ├── tray_order_id
  │   ├── valor_bruto (total do pedido)
  │   ├── valor_repasse_esperado (bruto - taxa gateway)
  │   └── data_repasse_esperada = data_aprovacao + prazo_repasse_dias
  │
  ├── Job diário: busca repasses com data_repasse_esperada < HOJE
  │   e data_repasse_recebida = NULL
  │   → alerta Teams financeiro
  │
  └── Conciliação Bancária identifica crédito Tray
      → atualizar data_repasse_recebida + status = 'recebido'
```

---

## Comissões de Vendedores Internos

### Fonte: `ComissaoParametro` no Literarius

```sql
SELECT
    cp.Vendedor,
    cp.PercComissao,
    cp.CanalVenda,
    cp.TipoCalculo,  -- sobre valor líquido ou bruto?
    cp.Ativo
FROM Literarius.dbo.ComissaoParametro cp
WHERE cp.Ativo = 1;
```

### Cálculo
```
Comissão = Σ (Valor Faturado por Vendedor × PercComissao)
           por período (mensal)

Regras: aplicar apenas onde TipoCalculo define base (bruto/líquido)
Saída: gerar lançamento em TituloFinanceiro (TipoTitulo='P') [fase 2]
```

---

## DRE com Receita Líquida por Canal

| Canal | Bruto | Comissão | Gateway | Líquido | % Margem |
|-------|-------|---------|---------|---------|---------|
| ECOMMERCE (Tray) | R$165.200 | R$0 | R$4.130 | R$161.070 | 97.5% |
| MERCADO LIVRE | R$61.500 | R$9.840 | R$0 | R$51.660 | 84.0% |
| AMAZON | R$10.400 | R$1.560 | R$0 | R$8.840 | 85.0% |
| LIVRARIA | R$193.800 | R$0 | R$0 | R$193.800 | 100% |
| ATACADO | R$135.300 | R$0 | R$0 | R$135.300 | 100% |

*Valores de março/2026 — comissões estimadas, a calibrar com taxas reais*

---

## Tela — Repasses Pendentes

```
┌──────────────────────────────────────────────────────────────────┐
│  Repasses Tray — Pendentes                                       │
│                                                                  │
│  Pedido #1234  Aprovado: 01/04  Esperado: 15/04  R$  890,00  ⚠  │
│  Pedido #1187  Aprovado: 28/03  Esperado: 11/04  R$ 2.340,00  🔴 │
│  Pedido #1198  Aprovado: 30/03  Esperado: 13/04  R$ 1.120,00  🔴 │
│                                                                  │
│  🔴 = atrasado  ⚠ = vence hoje  ℹ = nos próximos 3 dias        │
│                                                                  │
│  Total pendente: R$ 14.820,00 (23 pedidos)                      │
└──────────────────────────────────────────────────────────────────┘
```

---

## Query de Referência

```sql
-- Faturamento bruto por canal no mês
SELECT
    cv.Descricao  AS Canal,
    COUNT(nf.idNota)    AS QtdeNFs,
    SUM(nf.TotalNota)   AS FaturamentoBruto,
    SUM(nf.Frete)       AS FreteTotal
FROM Literarius.dbo.NotaFiscal  nf
JOIN Literarius.dbo.CanalVenda  cv ON cv.Codigo = nf.CanalVenda
WHERE nf.EntSai         = 'S'
  AND nf.Cancelada      = 0
  AND nf.GeraFinanceiro = 1
  AND MONTH(nf.DataEmissao) = MONTH(GETDATE())
  AND YEAR(nf.DataEmissao)  = YEAR(GETDATE())
GROUP BY cv.Descricao
ORDER BY FaturamentoBruto DESC;
```

---

## Módulos Relacionados

- [[DRE e Fluxo de Caixa]] — receita líquida por canal alimenta o DRE
- [[Pedidos e Vendas]] — base de faturamento bruto
- [[Tray — Conciliação de Repasses]] — integração detalhada com a API Tray
- [[Conciliação Bancária]] — crédito Tray identificado na conta bancária
- [[Alertas e Notificações]] — alerta de repasse em atraso
- [[HeziomOS — Arquitetura]] — visão geral do sistema
