---
tags: [literarius, tabela, financeiro]
fonte: Literarius
tipo: tabela
---

# TituloFinanceiro

## Descrição

Tabela central do financeiro. Armazena todos os títulos financeiros da empresa — tanto a receber (`TipoTitulo = 'R'`) quanto a pagar (`TipoTitulo = 'P'`). Cada registro representa uma obrigação financeira com vencimento, parcela, forma de pagamento e situação.

---

## Colunas Relevantes para o Financeiro

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `idTituloFinanceiro` | bigint | PK |
| `TipoTitulo` | char(1) | `'R'` = Receber, `'P'` = Pagar |
| `Empresa` | int | Código da empresa |
| `Numero` | int | Número sequencial do título |
| `Parceiro` | int | FK → Parceiro (cliente ou fornecedor) |
| `Emissao` | datetime | Data de emissão |
| `Vencimento` | datetime | Data de vencimento |
| `VencimentoOriginal` | datetime | Vencimento antes de renegociação |
| `Portador` | int | FK → Portador (banco cobrador) |
| `Situacao` | int | Estado do título |
| `FormaPagto` | int | FK → [[FormaPagto]] |
| `ContaBancaria` | int | FK → [[ContaBancaria]] |
| `Valor` | money | Valor original do título |
| `ValorPago` | money | Total já pago |
| `ValorAbatido` | money | Valor abatido (crédito/desconto) |
| `ValorAcrescimo` | money | Acréscimos aplicados |
| `ValorTaxa` | money | Tarifa bancária |
| `Pago` | bit | `1` = título totalmente liquidado |
| `Agrupado` | bit | `1` = faz parte de agrupamento de boleto |
| `Parcela` | int | Número da parcela |
| `TotalParcela` | int | Total de parcelas do parcelamento |
| `idPrimeiraParcela` | bigint | FK → primeira parcela do parcelamento |
| `Origem` | int | Tipo de origem (NF, pedido, manual, etc.) |
| `OrigemIdRegistro` | bigint | ID do registro de origem |
| `idContasPagarConfig` | int | FK → configuração de convênio bancário (a pagar) |
| `idRemessa` | int | ID da remessa bancária |
| `DataRemessa` | datetime | Data do envio para remessa |
| `CodBarrasBoleto` | varchar(60) | Código de barras do boleto |
| `DataPermissao` | datetime | Data de autorização do pagamento |
| `UsuarioPermissao` | varchar(50) | Usuário que autorizou |
| `Observacao` | text | Observações livres |

---

## Usada por

- [[Contas a Receber]] — `TipoTitulo = 'R'`
- [[Contas a Pagar]] — `TipoTitulo = 'P'`
- [[DRE e Fluxo de Caixa]] — fluxo projetado

---

## Relações

- FK → [[FormaPagto]] via `FormaPagto`
- FK → [[ContaBancaria]] via `ContaBancaria`
- 1:N → [[TituloFinanceiroBaixa]] via `idTituloFinanceiro`
- 1:N → [[TituloFinanceiroRateio]] via `idTituloFinanceiro`
- 1:N → [[TituloFinanceiroAgrupado]] via `idTituloFinanceiro`
- Origem → [[NotaFiscal]] ou [[PedidoVenda]] via `Origem` + `OrigemIdRegistro`
