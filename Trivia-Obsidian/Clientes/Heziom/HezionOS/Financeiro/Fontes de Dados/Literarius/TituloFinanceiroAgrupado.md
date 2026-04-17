---
tags: [literarius, tabela, financeiro]
fonte: Literarius
tipo: tabela
---

# TituloFinanceiroAgrupado

## Descrição

Registra o agrupamento de múltiplos títulos em um único boleto ou instrumento de cobrança. Quando `TituloFinanceiro.Agrupado = 1`, os detalhes de cada parcela agrupada ficam aqui.

---

## Colunas Relevantes para o Financeiro

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `idTituloFinanceiroAgrupado` | bigint | PK |
| `idTituloFinanceiro` | bigint | FK → [[TituloFinanceiro]] (título agrupador) |
| `Numero` | int | Número do título agrupado |
| `Vencimento` | datetime | Vencimento da parcela agrupada |
| `Valor` | money | Valor da parcela agrupada |
| `Origem` | int | Tipo de origem |
| `OrigemIdRegistro` | bigint | ID de origem |

---

## Usada por

- [[Contas a Receber]] — agrupamento de boletos

---

## Relações

- FK → [[TituloFinanceiro]] via `idTituloFinanceiro`
