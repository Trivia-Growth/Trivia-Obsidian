---
tags: [literarius, tabela, financeiro]
fonte: Literarius
tipo: tabela
---

# CentroResultado

## Descrição

Centros de resultado (cost centers) para análise de receitas e despesas por área, departamento ou unidade de negócio. Dimensão analítica ortogonal ao [[Clientes/Heziom/HeziomOS/Fontes de Dados/Literarius/Banco de Dados/PlanoConta]].

---

## Colunas Relevantes para o Financeiro

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `Codigo` | int | PK |
| `Descricao` | varchar(50) | Nome do centro de resultado |
| `UsuarioAlt` | varchar(20) | Último usuário que alterou |
| `DataAlt` | datetime | Data da última alteração |

---

## Usada por

- [[DRE e Fluxo de Caixa]] — análise por área/unidade
- [[Contas a Receber]] — rateio por centro
- [[Contas a Pagar]] — rateio por centro

---

## Relações

- Referenciada por [[Clientes/Heziom/HeziomOS/Fontes de Dados/Literarius/Banco de Dados/TituloFinanceiroRateio]], [[Clientes/Heziom/HeziomOS/Fontes de Dados/Literarius/Banco de Dados/TituloFinanceiroBaixaRateio]], [[Clientes/Heziom/HeziomOS/Fontes de Dados/Literarius/Banco de Dados/ContaBancariaLancamento]]
