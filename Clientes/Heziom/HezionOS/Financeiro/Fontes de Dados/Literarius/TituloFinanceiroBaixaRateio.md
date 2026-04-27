---
tags: [literarius, tabela, financeiro]
fonte: Literarius
tipo: tabela
---

# TituloFinanceiroBaixaRateio

## Descrição

Rateio contábil **da baixa** (pagamento ou recebimento efetivo). Enquanto [[TituloFinanceiroRateio]] classifica o título em competência, esta tabela classifica o caixa realizado por plano de contas e centro de resultado.

É a principal fonte para DRE por regime de caixa.

---

## Colunas Relevantes para o Financeiro

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `idTituloFinanceiroBaixaRateio` | bigint | PK |
| `idTituloFinanceiroBaixa` | bigint | FK → [[TituloFinanceiroBaixa]] |
| `PlanoConta` | int | FK → [[PlanoConta]] |
| `CentroResultado` | int | FK → [[CentroResultado]] |
| `ValorBaixa` | money | Valor principal rateado |
| `ValorDesconto` | money | Desconto rateado |
| `ValorAbatimento` | money | Abatimento rateado |
| `ValorAcrescimo` | money | Acréscimo rateado |
| `ValorMulta` | money | Multa rateada |
| `ValorJuros` | money | Juros rateados |
| `ValorTaxa` | money | Tarifa rateada |

---

## Usada por

- [[DRE e Fluxo de Caixa]] — fonte principal do DRE por caixa
- [[Contas a Pagar]] — classificação dos pagamentos realizados

---

## Relações

- FK → [[TituloFinanceiroBaixa]] via `idTituloFinanceiroBaixa`
- FK → [[PlanoConta]] via `PlanoConta`
- FK → [[CentroResultado]] via `CentroResultado`
