---
tags: [ceo, kpi, metricas, financeiro, definicoes]
status: especificação
criado: 2026-04-15
---

# KPIs e Métricas — Definições Formais

Definições precisas de cada indicador exibido no [[Dashboard CEO]]. Para cada KPI: o que mede, como calcular, qual a fonte de dados, e o que fazer quando está fora do normal.

---

## KPIs de Caixa e Liquidez

### Saldo Total (Caixa)
**O que mede:** Disponibilidade imediata de caixa em todas as contas.

| Campo | Valor |
|-------|-------|
| Fonte | `ContaBancaria.Saldo` (Literarius) |
| Contas incluídas | Santander (principal) + carteiras CC (7369, 9094, 6277) + Stone |
| Contas excluídas | Contas inativas ou de aplicação |
| Fórmula | `SUM(ContaBancaria.Saldo) WHERE Ativo=1` |
| Atualização | 15 minutos (leitura do Literarius) |
| Referência 2025 | Média ~R$3M; pico Dez ~R$4M |
| Alerta 🔴 | < R$500K |
| Alerta 🟡 | R$500K – R$1M |

---

### Cobertura de Caixa
**O que mede:** Quantos dias de operação o caixa atual suporta sem nenhuma receita.

| Campo | Valor |
|-------|-------|
| Fórmula | `Saldo Total / (Despesas últimos 90d / 90)` |
| Fonte despesas | `TituloFinanceiroBaixa` TipoTitulo='P', últimos 90d |
| Referência 2025 | ~55 dias (R$3M caixa / R$54K despesas diárias médias) |
| Alerta 🔴 | < 30 dias |
| Alerta 🟡 | 30–60 dias |

---

### Liquidez Líquida Projetada (30 dias)
**O que mede:** Posição de caixa esperada ao final dos próximos 30 dias.

| Campo | Valor |
|-------|-------|
| Fórmula | `Caixa atual + A receber (30d) − A pagar (30d)` |
| Fonte | `TituloFinanceiro` Pago=0, Vencimento ≤ GETDATE()+30 |
| Nota | Não considera receitas futuras não faturadas |
| Alerta 🔴 | Projeção negativa |
| Alerta 🟡 | 0 – R$500K |

---

## KPIs de Resultado

### Faturamento Bruto (MTD / YTD)
**O que mede:** Receita reconhecida via notas fiscais emitidas no período.

| Campo | Valor |
|-------|-------|
| Fonte | `NotaFiscal.TotalNota` |
| Filtros obrigatórios | `EntSai='S'`, `Cancelada=0`, `GeraFinanceiro=1` |
| Critério de data | `DataEmissao` (não DataSaida) |
| Não inclui | Consignações (GeraFinanceiro=0), NFs canceladas |
| Referência 2025 anual | R$6.619.840 |
| Referência jan/2026 | R$768.100 |
| Referência fev/2026 | R$763.500 |

---

### Receita Líquida por Canal
**O que mede:** Quanto efetivamente fica na Heziom após comissões de marketplace.

| Canal | Taxa comissão | Fórmula receita líq |
|-------|-------------|-------------------|
| ECOMMERCE (Tray) | 0% (taxa gateway ~2.5%) | Bruto − gateway |
| MERCADO LIVRE | ~16% | Bruto × 0,84 |
| AMAZON | ~15% | Bruto × 0,85 |
| LIVRARIA | 0% | = Bruto |
| ATACADO | 0% | = Bruto |

Fonte: [[Comissões e Repasses]]

---

### CMV — Custo da Mercadoria Vendida
**O que mede:** Custo direto dos produtos vendidos no período.

| Campo | Valor |
|-------|-------|
| Componentes | Custo de mercadoria + Direitos autorais + Royalties |
| Fonte custo | `vwProdutoCusto.Custo × NotaFiscalItens.Qtde` |
| Fonte royalties | `TituloFinanceiro` PlanoConta = royalties |
| Limitação | Custo = 0 para produtos sem custo cadastrado |
| Referência 2025 | R$2.656.876 = 40.1% do faturamento |
| Alerta | CMV% > 45% = investigar |

---

### Superávit Líquido e Margem
**O que mede:** Resultado final após todas as receitas e despesas.

| Campo | Valor |
|-------|-------|
| Fórmula | `Faturamento − CMV − Despesas Variáveis − Despesas Fixas` |
| Nota contábil | Entidade usa "Superávit" (sem fins lucrativos) não "Lucro" |
| Referência 2025 anual | R$821.614 (12.4% margem) |
| Referência jan/2026 | R$136.000 (17.7% margem) |
| Meses negativos 2025 | Apenas Abril (−R$56K) e Maio (−R$20K) |
| Alerta 🔴 | Margem < 0% (déficit) |
| Alerta 🟡 | Margem 0–5% |

---

## KPIs de Recebíveis

### Inadimplência (%)
**O que mede:** Proporção dos recebíveis que estão vencidos.

| Campo | Valor |
|-------|-------|
| Fórmula | `Σ Valor vencido / Σ Total recebíveis em aberto` |
| Referência abr/2026 | **84%** (crítico — investigar se é dado real ou lag de entrada) |
| Meta | < 20% |
| Alerta 🔴 | > 50% |
| Alerta 🟡 | 20–50% |

---

### Aging de Recebíveis
**O que mede:** Distribuição dos recebíveis por vencimento.

| Bucket | Definição |
|--------|----------|
| A vencer (futuro) | Vencimento > HOJE |
| Vencidos 1–30d | 0 < Vencimento ≤ 30 dias atrás |
| Vencidos 31–60d | — |
| Vencidos 61–90d | — |
| Vencidos >90d | Risco de inadimplência real |

**Referência abr/2026:**
- A vencer: R$384K (16%)
- Vencidos total: R$1.984K (84%)
- > 90 dias: R$1.040K (44%) — crítico

---

### Ticket Médio
**O que mede:** Valor médio por pedido/NF por canal.

| Campo | Valor |
|-------|-------|
| Fórmula | `SUM(TotalNota) / COUNT(DISTINCT idPedido)` |
| Por canal | Calcular separadamente |
| Sazonalidade | Maior em Dez (kits, coleções); menor em Jan |

---

## KPIs de Estoque

### Cobertura por Produto (dias)
**O que mede:** Por quantos dias o estoque atual sustenta as vendas ao ritmo atual.

| Campo | Valor |
|-------|-------|
| Fórmula | `QtdeEstoque / (Vendas90d / 90)` |
| Fonte | `vwProdutoResumo` (view HeziomOS no Literarius) |
| Alerta 🔴 | < 30 dias |
| Alerta 🟡 | 30–60 dias |

---

### CMV/Receita (%)
**O que mede:** Eficiência da operação — quanto do faturamento vai para o custo do produto.

| Campo | Valor |
|-------|-------|
| Meta | < 42% |
| Referência 2025 | 40.1% |
| Alerta 🔴 | > 50% |
| Alerta 🟡 | 42–50% |

---

## KPIs Operacionais

### Taxa de Conciliação Bancária
**O que mede:** % dos lançamentos do extrato conciliados automaticamente.

| Campo | Valor |
|-------|-------|
| Meta | > 95% automático |
| Fonte | HeziomOS `bank_reconciliations` |
| Alerta 🟡 | 80–95% automático |
| Alerta 🔴 | < 80% automático |

---

### Tempo Médio de Aprovação de Pagamentos
**O que mede:** Tempo entre criação e aprovação de um pagamento.

| Campo | Valor |
|-------|-------|
| Meta | < 24h |
| Fonte | HeziomOS `payment_approvals` (created_at → approved_at) |
| Alerta | > 24h para pagamentos de alto valor |

---

## Periodicidade de Atualização

| KPI | Frequência | Razão |
|-----|-----------|-------|
| Saldo de caixa | 15 min | Decisão de liquidez imediata |
| Faturamento MTD | 1h | Pedidos processados em batch |
| DRE | Diário | Processamento de todas as baixas |
| Aging recebíveis | Diário 6h | Antes do expediente |
| Alertas | Tempo real (webhook) | Ação imediata |
| KPIs de estoque | Diário 1h | Após movimentações do dia |

---

## Módulos Relacionados

- [[Dashboard CEO]] — onde estes KPIs são exibidos
- [[DRE e Fluxo de Caixa]] — fonte do DRE e projeção
- [[Contas a Receber]] — fonte dos KPIs de recebíveis
- [[Contas a Pagar]] — fonte dos KPIs de pagamentos
- [[Gestão de Estoque e CMV]] — fonte dos KPIs de estoque
- [[HeziomOS — Arquitetura]] — visão geral do sistema
