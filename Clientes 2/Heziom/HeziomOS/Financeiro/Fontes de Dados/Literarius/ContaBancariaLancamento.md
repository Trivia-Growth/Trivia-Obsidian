---
tags: [literarius, tabela, financeiro]
fonte: Literarius
tipo: tabela
---

# ContaBancariaLancamento

## Descrição

Lançamentos diretos em conta bancária — movimentações que não passam pelo módulo de títulos, como tarifas bancárias, transferências entre contas, aplicações e resgates. Também serve como base de conciliação bancária.

---

## Colunas Relevantes para o Financeiro

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `idLanctoContaBancaria` | bigint | PK |
| `Empresa` | int | Código da empresa |
| `Numero` | int | Número sequencial |
| `TipoLancto` | char(1) | `'C'` = crédito, `'D'` = débito |
| `DataLancto` | datetime | Data do lançamento |
| `Documento` | varchar(250) | Número do documento de referência |
| `Descricao` | varchar(30) | Descrição do lançamento |
| `ContaBancaria` | int | FK → [[Clientes 2/Heziom/HeziomOS/Financeiro/Fontes de Dados/Literarius/ContaBancaria]] (conta origem) |
| `ContaBancariaDestino` | int | FK → [[Clientes 2/Heziom/HeziomOS/Financeiro/Fontes de Dados/Literarius/ContaBancaria]] (conta destino, transferências) |
| `Valor` | money | Valor do lançamento |
| `CentroResultado` | int | FK → [[Clientes 2/Heziom/HeziomOS/Financeiro/Fontes de Dados/Literarius/CentroResultado]] |
| `PlanoConta` | int | FK → [[Clientes 2/Heziom/HeziomOS/Financeiro/Fontes de Dados/Literarius/PlanoConta]] |
| `Liquidado` | bit | `1` = confirmado no extrato |
| `Conciliado` | bit | `1` = conciliado |
| `idExtratoBanco` | varchar(250) | ID no extrato bancário |
| `idOrigemTransferencia` | int | ID da transferência de origem (espelho) |

---

## Usada por

- [[DRE e Fluxo de Caixa]] — lançamentos diretos no caixa (tarifas, transferências)

---

## Relações

- FK → [[Clientes 2/Heziom/HeziomOS/Financeiro/Fontes de Dados/Literarius/ContaBancaria]] via `ContaBancaria` e `ContaBancariaDestino`
- FK → [[Clientes 2/Heziom/HeziomOS/Financeiro/Fontes de Dados/Literarius/PlanoConta]] via `PlanoConta`
- FK → [[Clientes 2/Heziom/HeziomOS/Financeiro/Fontes de Dados/Literarius/CentroResultado]] via `CentroResultado`
