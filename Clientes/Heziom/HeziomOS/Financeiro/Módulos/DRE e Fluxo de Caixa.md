---
tags: [financeiro, modulo]
status: especificação
---

# DRE e Fluxo de Caixa

## Objetivo

Consolidar receitas e despesas por período para gerar a Demonstração de Resultado do Exercício (DRE) e o Fluxo de Caixa. A estrutura contábil é definida pelo [[PlanoConta]] com `GrupoDRE` e `TipoCategoria`, e os lançamentos vêm das baixas de títulos e lançamentos bancários.

---

## Fontes de Dados — Literarius

| Tabela | Campos-chave | Uso |
|--------|-------------|-----|
| [[TituloFinanceiroBaixaRateio]] | `PlanoConta`, `CentroResultado`, `ValorBaixa`, `ValorDesconto`, `ValorMulta`, `ValorJuros` | Base de todos os lançamentos realizados (receitas e despesas pagas) |
| [[PlanoConta]] | `Codigo`, `Descricao`, `TipoCategoria`, `GrupoDRE`, `Nivel`, `PlanoContaPai` | Estrutura hierárquica da DRE; `GrupoDRE` agrupa linhas do demonstrativo |
| [[CentroResultado]] | `Codigo`, `Descricao` | Dimensão de análise por área/unidade de negócio |
| [[ContaBancariaLancamento]] | `DataLancto`, `TipoLancto`, `Valor`, `PlanoConta`, `CentroResultado`, `Liquidado` | Lançamentos diretos (não via título): tarifas, transferências, etc. |
| [[TituloFinanceiro]] | `TipoTitulo`, `Vencimento`, `Valor`, `Pago` | Base para fluxo de caixa projetado (títulos em aberto) |

---

## Dados Reais Confirmados (via DB + DRE oficial — abril 2026)

### Resultado Mensal 2025 — Superávit/Déficit (DRE contábil oficial)

| Mês | Receita Bruta | Superávit/Déficit |
|-----|--------------|-------------------|
| Jan/2025 | R$ 509.204 | ✅ R$ 92.521 |
| Fev/2025 | R$ 380.451 | ✅ R$ 15.171 |
| Mar/2025 | R$ 464.165 | ✅ R$ 37.330 |
| Abr/2025 | R$ 363.716 | ❌ –R$ 41.856 |
| Mai/2025 | R$ 481.025 | ❌ –R$ 20.498 |
| Jun/2025 | R$ 380.671 | ✅ R$ 36.580 |
| Jul/2025 | R$ 347.396 | ✅ R$ 18.582 |
| Ago/2025 | R$ 475.477 | ✅ R$ 35.126 |
| Set/2025 | R$ 440.521 | ✅ R$ 86.320 |
| Out/2025 | R$ 649.720 | ✅ R$ 218.596 |
| Nov/2025 | R$ 817.640 | ✅ R$ 174.273 |
| Dez/2025 | **R$ 1.108.711** | ✅ R$ 169.470 |
| **2025 Total** | **R$ 6.619.840** | **✅ R$ 821.614** |
| Jan/2026 | R$ 881.339 | ✅ R$ 136.559 |
| Fev/2026 | R$ 648.395 | ✅ R$ 115.632 |
| **2026 YTD** | **R$ 1.529.734** | **✅ R$ 252.191** |

> Faturamento via DB (Literarius) é ligeiramente menor que DRE pois o DRE inclui ajustes contábeis. Pico em Out-Dez. Déficit apenas Abr/Mai 2025.

### Faturamento Mensal — Literarius (sistema, a partir de set/2025)

| Mês | Faturamento Líquido Literarius |
|-----|--------------------------------|
| Set/2025 | R$ 363.000 |
| Out/2025 | R$ 594.000 |
| Nov/2025 | R$ 818.000 |
| Dez/2025 | **R$ 1.058.000** (pico — alta temporada) |
| Jan/2026 | R$ 774.000 |
| Fev/2026 | R$ 599.000 |
| Mar/2026 | R$ 580.000 |
| Abr/2026 | R$ 170.000 (parcial) |

> Ritmo médio (out/25–mar/26): ~R$ 737K/mês → anualizado ~R$ 8.8M

### Estrutura de Despesas — DRE Manual (últimos 12 meses, pagas)

| Grupo | Conta | Nome | Valor |
|-------|-------|------|-------|
| CMV | 21 | Produção Material Próprio | R$ 962.000 |
| CMV | 20 | Materiais Para Revenda | R$ 468.000 |
| Desp. Operacional | 29 | Marketing E Publicidade | R$ 426.000 |
| Desp. Operacional | 30 | Frete Sobre Mercadorias | R$ 257.000 |
| Desp. Operacional | 32 | Direitos Autorais | R$ 222.000 |
| RH | 96 | Remuneração Autônomos - Administração | R$ 302.727 |
| RH | 28 | Remuneração Autônomos - Marketing | R$ 190.145 |
| RH | 99 | Diretoria - PJ | R$ 178.158 |
| RH | 98 | Remuneração Autônomos - Livraria | R$ 177.700 |
| RH | 23 | Salários A Pagar | R$ 163.684 |
| TI | 84 | Sistemas e Softwares | R$ 160.285 |
| RH | 33 | Remuneração Autônomos - Editorial | R$ 121.522 |
| RH | 93 | Remuneração Autônomos - Expedição | R$ 120.002 |
| RH | 95 | Remuneração Autônomos - Financeiro | R$ 108.250 |
| **Excluir** | 106 | TRANSFERENCIA ENTRE CONTAS | **R$ 676.704** |
| **Excluir** | 115 | Empréstimos e financiamentos | **R$ 60.000** |
| **Classificar** | 8 | A VERIFICAR | **R$ 132.015** |

> ⚠️ `TipoCategoria = 'A'` em 100% das contas — agrupamento acima é manual, baseado em nome da conta. Validar com equipe Literarius.

### Saldos Bancários (abril 2026)

| Conta | Tipo | Saldo |
|-------|------|-------|
| Santander | Banco | R$ 3.401.000 |
| CC 7369 | Carteira | R$ 252.000 |
| CC 9094 | Carteira | R$ 195.000 |
| CC 6277 | Carteira | R$ 76.000 |
| Stone | Gateway | R$ 25.000 |
| **Total caixa** | | **R$ 3.949.000** |

---

## Fontes de Dados — Tray (a mapear)

- [ ] Repasses financeiros do marketplace por período
- [ ] Tarifas e comissões descontadas nos repasses

---

## Regras de Negócio

### Identidade Contábil
- **Heziom é juridicamente vinculada ao IPP** (ASSOCIAÇÃO EDITORA PRESBITERIANA DE PINHEIROS, CNPJ 40.804.477/0001-44)
- Usa o termo **SUPERÁVIT** (não lucro) — entidade sem fins lucrativos
- Sistema contábil licenciado para **CONTABIL RIBEIRO LTDA**
- Ver [[DRE Acumulado 2025-2026]] para análise completa

### Margem Resumida (2025 anual)
| Linha | Valor | % Receita Bruta |
|-------|-------|-----------------|
| Receita Bruta | R$ 6.619.840 | 100% |
| CMV | –R$ 2.656.876 | 40,1% |
| Lucro Bruto | R$ 4.343.462 | 65,6% |
| Desp. Variáveis | –R$ 825.755 | 12,5% |
| Margem Contribuição | R$ 3.517.706 | 53,1% |
| Desp. Fixas | –R$ 2.696.092 | 40,7% |
| **Superávit líquido** | **R$ 821.614** | **12,4%** |

### DRE
- `PlanoConta.TipoCategoria` discrimina receita (`R`) vs. despesa (`D`)
- `PlanoConta.GrupoDRE` agrupa as linhas (ex: Receita Bruta, CMV, Despesas Operacionais)
- `PlanoConta.Nivel` e `PlanoContaPai` definem a hierarquia — somar apenas folhas ou usar hierarquia para sub-totais
- Base: **regime de caixa** (data das baixas); para regime de competência usar datas de emissão dos títulos

### Fluxo de Caixa
- **Realizado**: baixas de [[TituloFinanceiroBaixa]] + lançamentos de [[ContaBancariaLancamento]]
- **Projetado**: títulos em aberto de [[TituloFinanceiro]] agrupados por vencimento
- `ContaBancariaLancamento.Liquidado` indica se o lançamento direto já foi confirmado no extrato

---

## Queries de Referência

```sql
-- DRE por grupo (regime de caixa)
SELECT
    pc.GrupoDRE,
    pc.TipoCategoria,
    pc.Descricao AS PlanoConta,
    SUM(CASE WHEN pc.TipoCategoria = 'R' THEN tfbr.ValorBaixa ELSE -tfbr.ValorBaixa END) AS Valor,
    MONTH(tfb.DataBaixa) AS Mes,
    YEAR(tfb.DataBaixa) AS Ano
FROM Literarius.dbo.TituloFinanceiroBaixaRateio tfbr
JOIN Literarius.dbo.TituloFinanceiroBaixa tfb ON tfb.idTituloFinanceiroBaixa = tfbr.idTituloFinanceiroBaixa
JOIN Literarius.dbo.PlanoConta pc ON pc.Codigo = tfbr.PlanoConta
WHERE YEAR(tfb.DataBaixa) = YEAR(GETDATE())
GROUP BY pc.GrupoDRE, pc.TipoCategoria, pc.Descricao, MONTH(tfb.DataBaixa), YEAR(tfb.DataBaixa)
ORDER BY Ano, Mes, pc.GrupoDRE

-- Fluxo de caixa projetado (próximos 30 dias)
SELECT
    CAST(tf.Vencimento AS DATE) AS Vencimento,
    SUM(CASE WHEN tf.TipoTitulo = 'R' THEN tf.Valor - tf.ValorPago ELSE 0 END) AS Entradas,
    SUM(CASE WHEN tf.TipoTitulo = 'P' THEN tf.Valor - tf.ValorPago ELSE 0 END) AS Saidas
FROM Literarius.dbo.TituloFinanceiro tf
WHERE tf.Pago = 0
  AND tf.Vencimento BETWEEN GETDATE() AND DATEADD(DAY, 30, GETDATE())
GROUP BY CAST(tf.Vencimento AS DATE)
ORDER BY Vencimento

-- Saldo atual por conta bancária
SELECT
    cb.Descricao AS ContaBancaria,
    cb.SaldoInicial,
    SUM(CASE WHEN cbl.TipoLancto = 'C' THEN cbl.Valor ELSE -cbl.Valor END) AS MovimentoTotal,
    cb.SaldoInicial + SUM(CASE WHEN cbl.TipoLancto = 'C' THEN cbl.Valor ELSE -cbl.Valor END) AS SaldoAtual
FROM Literarius.dbo.ContaBancaria cb
LEFT JOIN Literarius.dbo.ContaBancariaLancamento cbl ON cbl.ContaBancaria = cb.idContaBancaria
WHERE cb.Inativa = 0
GROUP BY cb.idContaBancaria, cb.Descricao, cb.SaldoInicial
```

---

## Módulos Relacionados

- [[Contas a Receber]] — entradas realizadas
- [[Contas a Pagar]] — saídas realizadas
- [[Mapa de Dados]]
