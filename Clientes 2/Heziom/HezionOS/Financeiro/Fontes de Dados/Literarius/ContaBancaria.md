---
tags: [literarius, tabela, financeiro]
fonte: Literarius
tipo: tabela
---

# ContaBancaria

## Descrição

Cadastro das contas bancárias da empresa. Referenciada por títulos e lançamentos para identificar a conta de origem/destino de cada movimentação.

---

## Colunas Relevantes para o Financeiro

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `idContaBancaria` | int | PK |
| `Empresa` | int | Código da empresa |
| `Descricao` | varchar(50) | Nome/apelido da conta |
| `BancoNumero` | varchar(3) | Código COMPE do banco |
| `BancoDescricao` | varchar(20) | Nome do banco |
| `AgenciaNumero` | varchar(10) | Número da agência |
| `AgenciaDigito` | varchar(3) | Dígito da agência |
| `ContaNumero` | varchar(20) | Número da conta corrente |
| `ContaDigito` | varchar(3) | Dígito da conta |
| `DataInicial` | datetime | Data de abertura / início no sistema |
| `SaldoInicial` | money | Saldo inicial na data de abertura |
| `Inativa` | bit | `1` = conta inativa |

---

## Contas Cadastradas — Saldos Confirmados (abril 2026)

| ID | Descrição | Tipo | Saldo Atual |
|----|-----------|------|-------------|
| 1 | CONTA CAIXA | Caixa físico | — |
| 2 | Santander | Banco tradicional | **R$ 3.401.000** |
| 3 | Stone | Gateway pagamento | R$ 25.000 |
| 4 | CC 9094 | Carteira/conta | R$ 195.000 |
| 5 | CC 6277 | Carteira/conta | R$ 76.000 |
| 6 | CC 7369 | Carteira/conta | R$ 252.000 |
| 7 | CONTAMAX | Carteira | — |
| 8 | Mercado Pago | Gateway marketplace | R$ 0 (não utilizado) |
| 9 | Vindi | Gateway recorrência | R$ 0 (não utilizado) |
| 10 | Pagarme | Gateway | R$ 0 (não utilizado) |
| 11 | APPMAX | Gateway | R$ 0 (não utilizado) |

> **Saldo principal em uso:** Santander (R$3.4M) + CC7369 (R$252K) + CC9094 (R$195K) + CC6277 (R$76K) + Stone (R$25K)  
> Gateways Mercado Pago, Vindi, Pagarme e APPMAX com saldo zero — provavelmente recebimentos liquidados direto para o Santander sem saldo intermediário no Literarius.

---

## Usada por

- [[Contas a Receber]] — conta de crédito dos recebimentos
- [[Contas a Pagar]] — conta de débito dos pagamentos
- [[DRE e Fluxo de Caixa]] — saldo por conta

---

## Relações

- 1:N → [[TituloFinanceiro]] via `ContaBancaria`
- 1:N → [[TituloFinanceiroBaixa]] via `ContaBancaria`
- 1:N → [[ContaBancariaLancamento]] via `ContaBancaria`
