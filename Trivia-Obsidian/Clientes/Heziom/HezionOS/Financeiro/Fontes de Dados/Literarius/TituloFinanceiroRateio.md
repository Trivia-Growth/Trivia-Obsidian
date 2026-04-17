---
tags: [literarius, tabela, financeiro]
fonte: Literarius
tipo: tabela
---

# TituloFinanceiroRateio

## Descrição

Define o rateio contábil de um título financeiro por plano de contas e centro de resultado, **antes** da baixa. Permite pré-classificar a receita ou despesa no momento da emissão do título.

---

## Colunas Relevantes para o Financeiro

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `idTituloFinanceiroRateio` | bigint | PK |
| `idTituloFinanceiro` | bigint | FK → [[TituloFinanceiro]] |
| `PlanoConta` | int | FK → [[PlanoConta]] |
| `CentroResultado` | int | FK → [[CentroResultado]] |
| `Percentual` | money | Percentual do valor total a ratear |
| `Valor` | money | Valor absoluto rateado |
| `Sinal` | varchar(1) | Sinal do lançamento (`D` = débito, `C` = crédito) |
| `AlteradoManual` | bit | `1` = rateio editado manualmente |

---

## Usada por

- [[Contas a Receber]] — classificação contábil dos recebíveis
- [[Contas a Pagar]] — classificação contábil das despesas
- [[DRE e Fluxo de Caixa]] — base de competência (rateio no título, não na baixa)

---

## Relações

- FK → [[TituloFinanceiro]] via `idTituloFinanceiro`
- FK → [[PlanoConta]] via `PlanoConta`
- FK → [[CentroResultado]] via `CentroResultado`
