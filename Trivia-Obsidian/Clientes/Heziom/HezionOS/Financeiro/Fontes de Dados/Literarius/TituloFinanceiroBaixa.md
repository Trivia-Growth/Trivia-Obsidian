---
tags: [literarius, tabela, financeiro]
fonte: Literarius
tipo: tabela
---

# TituloFinanceiroBaixa

## Descrição

Registra cada evento de baixa (recebimento ou pagamento) de um título financeiro. Um título pode ter múltiplas baixas (pagamentos parciais). Inclui conciliação bancária via `idExtratoBanco`.

---

## Colunas Relevantes para o Financeiro

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `idTituloFinanceiroBaixa` | bigint | PK |
| `idTituloFinanceiro` | bigint | FK → [[TituloFinanceiro]] |
| `Item` | int | Sequência da baixa para o mesmo título |
| `DataBaixa` | datetime | Data em que o pagamento/recebimento ocorreu |
| `DataBanco` | datetime | Data de crédito/débito no banco |
| `FormaPagto` | int | FK → [[FormaPagto]] (pode diferir do título) |
| `ContaBancaria` | int | FK → [[ContaBancaria]] |
| `ValorBaixa` | money | Valor principal baixado |
| `ValorDesconto` | money | Desconto concedido |
| `ValorAbatimento` | money | Abatimento aplicado |
| `ValorAcrescimo` | money | Acréscimo cobrado |
| `ValorMulta` | money | Multa por atraso |
| `ValorJuros` | money | Juros por atraso |
| `ValorTaxa` | money | Tarifa bancária da baixa |
| `TipoBaixa` | int | Tipo da baixa (manual, automática, remessa) |
| `Conciliado` | bit | `1` = conciliado com extrato bancário |
| `idExtratoBanco` | varchar(250) | ID do lançamento no extrato (conciliação) |
| `Origem` | int | Tipo de origem da baixa |
| `OrigemIdRegistro` | bigint | ID do registro de origem |
| `Observacoes` | varchar(250) | Observações da baixa |
| `DataPermissao` | datetime | Data de autorização |
| `UsuarioPermissao` | varchar(50) | Usuário que autorizou |

---

## Usada por

- [[Contas a Receber]] — recebimentos
- [[Contas a Pagar]] — pagamentos realizados
- [[DRE e Fluxo de Caixa]] — base do realizado

---

## Relações

- FK → [[TituloFinanceiro]] via `idTituloFinanceiro`
- FK → [[FormaPagto]] via `FormaPagto`
- FK → [[ContaBancaria]] via `ContaBancaria`
- 1:N → [[TituloFinanceiroBaixaRateio]] via `idTituloFinanceiroBaixa`
