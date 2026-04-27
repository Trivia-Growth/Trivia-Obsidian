---
tags: [literarius, tabela, financeiro]
fonte: Literarius
tipo: tabela
---

# ComissaoParametro

## Descrição

Parâmetros de comissão por colaborador/vendedor. Define como as comissões são calculadas — relevante para o financeiro ao apurar o custo de vendas e despesas com comissionamento.

---

## Colunas Relevantes para o Financeiro

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `idParametroComissao` | bigint | PK |
| `Empresa` | int | Código da empresa |
| `Colaborador` | int | FK → Colaborador/vendedor |
| `TipoComissao` | int | Tipo de cálculo da comissão |
| `TipoFaixa` | char(1) | Tipo de faixa (valor, percentual, volume) |

> **Nota:** os valores percentuais das faixas estão nas tabelas filhas `ComissaoParametroAgregados` e `ComissaoParametroItens`.

---

## Usada por

- [[Contas a Pagar]] — despesas com comissão de vendas

---

## Relações

- FK → Colaborador (tabela de RH)
- 1:N → `ComissaoParametroAgregados`
- 1:N → `ComissaoParametroItens`
