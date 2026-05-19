---
tags: [literarius, schema, banco-de-dados, mapeamento-detalhado]
status: mapeado
criado: 2026-05-18
fonte: pymssql direto — 192.168.18.10:1433
---

# Literarius — Schema Detalhado das Tabelas

> Gerado automaticamente via script Python + pymssql.
> Data: 2026-05-18 22:38 (BRT)

---

## Financeiro

### `TituloFinanceiro`
**Contas a pagar e receber** · 50,263 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `idTituloFinanceiro` | bigint | **não** | — |
| `TipoTitulo` | char(1) | sim | — |
| `Empresa` | int | sim | — |
| `Numero` | int | sim | — |
| `Parceiro` | int | sim | — |
| `Emissao` | datetime | sim | — |
| `Vencimento` | datetime | sim | — |
| `Portador` | int | sim | — |
| `Situacao` | int | sim | — |
| `Moeda` | varchar(3) | sim | — |
| `FormaPagto` | int | sim | — |
| `ContaBancaria` | int | sim | — |
| `Valor` | money | sim | — |
| `ValorPago` | money | sim | — |
| `ValorAbatido` | money | sim | — |
| `Boleto` | varchar(50) | sim | — |
| `Impresso` | bit | sim | — |
| `idCobrancaConfig` | int | sim | — |
| `idRemessa` | int | sim | — |
| `DataRemessa` | datetime | sim | — |
| `Referencia` | varchar(50) | sim | — |
| `Pago` | bit | sim | — |
| `Origem` | int | sim | — |
| `OrigemIdRegistro` | bigint | sim | — |
| `TipoParcelamento` | char(1) | sim | — |
| `Parcela` | int | sim | — |
| `TotalParcela` | int | sim | — |
| `idPrimeiraParcela` | bigint | sim | — |
| `Observacao` | text(2147483647) | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |
| `Agrupado` | bit | sim | — |
| `UsuarioAgrupamento` | varchar(20) | sim | — |
| `DataAgrupamento` | datetime | sim | — |
| `idContasPagarConfig` | int | sim | — |
| `CodBarrasBoleto` | varchar(60) | sim | — |
| `ValorAcrescimo` | money | sim | — |
| `VencimentoOriginal` | datetime | sim | — |
| `ValorTaxa` | money | sim | — |
| `DataPermissao` | datetime | sim | — |
| `UsuarioPermissao` | varchar(50) | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "idTituloFinanceiro": 52260,
    "TipoTitulo": "R",
    "Empresa": 1,
    "Numero": 52261,
    "Parceiro": 10,
    "Emissao": "2026-05-18T21:57:40.637000",
    "Vencimento": "2026-05-19T00:00:00",
    "Portador": 1,
    "Situacao": 1,
    "Moeda": "R$",
    "FormaPagto": 3,
    "ContaBancaria": null,
    "Valor": 2044.8,
    "ValorPago": 2044.8,
    "ValorAbatido": 0.0,
    "Boleto": "",
    "Impresso": false,
    "idCobrancaConfig": null,
    "idRemessa": null,
    "DataRemessa": null,
    "Referencia": "R005504006-1/1",
    "Pago": true,
    "Origem": 1,
    "OrigemIdRegistro": 34135,
    "TipoParcelamento": "U",
    "Parcela": 1,
    "TotalParcela": 1,
    "idPrimeiraParcela": 52260,
    "Observacao": "",
    "UsuarioAlt": "claudevan",
    "DataAlt": "2026-05-18T21:57:46.820000",
    "Agrupado": false,
    "UsuarioAgrupamento": null,
    "DataAgrupamento": null,
    "idContasPagarConfig": null,
    "CodBarrasBoleto": "",
    "ValorAcrescimo": 0.0,
    "VencimentoOriginal": "2026-05-19T00:00:00",
    "ValorTaxa": 0.0,
    "DataPermissao": null,
    "UsuarioPermissao": ""
  },
  {
    "idTituloFinanceiro": 52259,
    "TipoTitulo": "R",
    "Empresa": 1,
    "Numero": 52260,
    "Parceiro": 10,
    "Emissao": "2026-05-18T21:41:41.293000",
    "Vencimento": "2026-05-19T00:00:00",
    "Portador": 1,
    "Situacao": 1,
    "Moeda": "R$",
    "FormaPagto": 3,
    "ContaBancaria": null,
    "Valor": 55.16,
    "ValorPago": 55.16,
    "ValorAbatido": 0.0,
    "Boleto": "",
    "Impresso": false,
    "idCobrancaConfig": null,
    "idRemessa": null,
    "DataRemessa": null,
    "Referencia": "R005503006-1/1",
    "Pago": true,
    "Origem": 1,
    "OrigemIdRegistro": 34134,
    "TipoParcelamento": "U",
    "Parcela": 1,
    "TotalParcela": 1,
    "idPrimeiraParcela": 52259,
    "Observacao": "",
    "UsuarioAlt": "claudevan",
    "DataAlt": "2026-05-18T21:41:41.927000",
    "Agrupado": false,
    "UsuarioAgrupamento": null,
    "DataAgrupamento": null,
    "idContasPagarConfig": null,
    "CodBarrasBoleto": "",
    "ValorAcrescimo": 0.0,
    "VencimentoOriginal": "2026-05-19T00:00:00",
    "ValorTaxa": 0.0,
    "DataPermissao": null,
    "UsuarioPermissao": ""
  },
  {
    "idTituloFinanceiro": 52258,
    "TipoTitulo": "R",
    "Empresa": 1,
    "Numero": 52259,
    "Parceiro": 10,
    "Emissao": "2026-05-18T21:29:37.027000",
    "Vencimento": "2026-05-18T00:00:00",
    "Portador": 1,
    "Situacao": 1,
    "Moeda": "R$",
    "FormaPagto": 12,
    "ContaBancaria": null,
    "Valor": 119.9,
    "ValorPago": 119.9,
    "ValorAbatido": 0.0,
    "Boleto": "",
    "Impresso": false,
    "idCobrancaConfig": null,
    "idRemessa": null,
    "DataRemessa": null,
    "Referencia": "R005502006-1/1",
    "Pago": true,
    "Origem": 1,
    "OrigemIdRegistro": 34133,
    "TipoParcelamento": "U",
    "Parcela": 1,
    "TotalParcela": 1,
    "idPrimeiraParcela": 52258,
    "Observacao": "",
    "UsuarioAlt": "claudevan",
    "DataAlt": "2026-05-18T21:29:38.300000",
    "Agrupado": false,
    "UsuarioAgrupamento": null,
    "DataAgrupamento": null,
    "idContasPagarConfig": null,
    "CodBarrasBoleto": "",
    "ValorAcrescimo": 0.0,
    "VencimentoOriginal": "2026-05-18T00:00:00",
    "ValorTaxa": 0.0,
    "DataPermissao": null,
    "UsuarioPermissao": ""
  }
]
```

</details>

---

### `TituloFinanceiroBaixa`
**Baixas / liquidações** · 30,616 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `idTituloFinanceiroBaixa` | bigint | **não** | — |
| `idTituloFinanceiro` | bigint | sim | — |
| `Item` | int | sim | — |
| `DataBaixa` | datetime | sim | — |
| `FormaPagto` | int | sim | — |
| `ContaBancaria` | int | sim | — |
| `ValorBaixa` | money | sim | — |
| `ValorDesconto` | money | sim | — |
| `ValorAbatimento` | money | sim | — |
| `ValorAcrescimo` | money | sim | — |
| `ValorMulta` | money | sim | — |
| `ValorJuros` | money | sim | — |
| `TipoBaixa` | int | sim | — |
| `Observacoes` | varchar(250) | sim | — |
| `Origem` | int | sim | — |
| `OrigemIdRegistro` | bigint | sim | — |
| `OrigemIdRegistroItens` | bigint | sim | — |
| `DataBanco` | datetime | sim | — |
| `Conciliado` | bit | sim | — |
| `idExtratoBanco` | varchar(250) | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |
| `ValorTaxa` | money | sim | — |
| `DataPermissao` | datetime | sim | — |
| `UsuarioPermissao` | varchar(50) | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "idTituloFinanceiroBaixa": 31561,
    "idTituloFinanceiro": 52260,
    "Item": 1,
    "DataBaixa": "2026-05-18T21:57:47.107000",
    "FormaPagto": 3,
    "ContaBancaria": null,
    "ValorBaixa": 2044.8,
    "ValorDesconto": 0.0,
    "ValorAbatimento": 0.0,
    "ValorAcrescimo": 0.0,
    "ValorMulta": 0.0,
    "ValorJuros": 0.0,
    "TipoBaixa": 1,
    "Observacoes": "",
    "Origem": null,
    "OrigemIdRegistro": null,
    "OrigemIdRegistroItens": null,
    "DataBanco": "2026-05-18T21:57:47.107000",
    "Conciliado": true,
    "idExtratoBanco": "claudevan",
    "UsuarioAlt": "claudevan",
    "DataAlt": "2026-05-18T21:57:47.147000",
    "ValorTaxa": 0.0,
    "DataPermissao": null,
    "UsuarioPermissao": ""
  },
  {
    "idTituloFinanceiroBaixa": 31560,
    "idTituloFinanceiro": 52259,
    "Item": 1,
    "DataBaixa": "2026-05-18T21:41:42.197000",
    "FormaPagto": 3,
    "ContaBancaria": null,
    "ValorBaixa": 55.16,
    "ValorDesconto": 0.0,
    "ValorAbatimento": 0.0,
    "ValorAcrescimo": 0.0,
    "ValorMulta": 0.0,
    "ValorJuros": 0.0,
    "TipoBaixa": 1,
    "Observacoes": "",
    "Origem": null,
    "OrigemIdRegistro": null,
    "OrigemIdRegistroItens": null,
    "DataBanco": "2026-05-18T21:41:42.197000",
    "Conciliado": true,
    "idExtratoBanco": "claudevan",
    "UsuarioAlt": "claudevan",
    "DataAlt": "2026-05-18T21:41:42.227000",
    "ValorTaxa": 0.0,
    "DataPermissao": null,
    "UsuarioPermissao": ""
  },
  {
    "idTituloFinanceiroBaixa": 31559,
    "idTituloFinanceiro": 52258,
    "Item": 1,
    "DataBaixa": "2026-05-18T21:29:38.703000",
    "FormaPagto": 12,
    "ContaBancaria": null,
    "ValorBaixa": 119.9,
    "ValorDesconto": 0.0,
    "ValorAbatimento": 0.0,
    "ValorAcrescimo": 0.0,
    "ValorMulta": 0.0,
    "ValorJuros": 0.0,
    "TipoBaixa": 1,
    "Observacoes": "",
    "Origem": null,
    "OrigemIdRegistro": null,
    "OrigemIdRegistroItens": null,
    "DataBanco": "2026-05-18T21:29:38.703000",
    "Conciliado": true,
    "idExtratoBanco": "claudevan",
    "UsuarioAlt": "claudevan",
    "DataAlt": "2026-05-18T21:29:38.757000",
    "ValorTaxa": 0.0,
    "DataPermissao": null,
    "UsuarioPermissao": ""
  }
]
```

</details>

---

### `TituloFinanceiroRateio`
**Rateio por plano de conta** · 50,723 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `idTituloFinanceiroRateio` | bigint | **não** | — |
| `idTituloFinanceiro` | bigint | sim | — |
| `PlanoConta` | int | sim | — |
| `CentroResultado` | int | sim | — |
| `Percentual` | money | sim | — |
| `Valor` | money | sim | — |
| `Sinal` | varchar(1) | sim | — |
| `AlteradoManual` | bit | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "idTituloFinanceiroRateio": 57349,
    "idTituloFinanceiro": 52260,
    "PlanoConta": 2,
    "CentroResultado": 1,
    "Percentual": 100.0,
    "Valor": 2044.8,
    "Sinal": "+",
    "AlteradoManual": false
  },
  {
    "idTituloFinanceiroRateio": 57348,
    "idTituloFinanceiro": 52259,
    "PlanoConta": 2,
    "CentroResultado": 1,
    "Percentual": 100.0,
    "Valor": 55.16,
    "Sinal": "+",
    "AlteradoManual": false
  },
  {
    "idTituloFinanceiroRateio": 57347,
    "idTituloFinanceiro": 52258,
    "PlanoConta": 2,
    "CentroResultado": 1,
    "Percentual": 100.0,
    "Valor": 119.9,
    "Sinal": "+",
    "AlteradoManual": false
  }
]
```

</details>

---

### `TituloFinanceiroBaixaRateio`
**Rateio das baixas** · 30,849 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `idTituloFinanceiroBaixaRateio` | bigint | **não** | — |
| `idTituloFinanceiroBaixa` | bigint | sim | — |
| `PlanoConta` | int | sim | — |
| `CentroResultado` | int | sim | — |
| `ValorBaixa` | money | sim | — |
| `ValorDesconto` | money | sim | — |
| `ValorAbatimento` | money | sim | — |
| `ValorAcrescimo` | money | sim | — |
| `ValorMulta` | money | sim | — |
| `ValorJuros` | money | sim | — |
| `ValorTaxa` | money | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "idTituloFinanceiroBaixaRateio": 31817,
    "idTituloFinanceiroBaixa": 31561,
    "PlanoConta": 2,
    "CentroResultado": 1,
    "ValorBaixa": 2044.8,
    "ValorDesconto": 0.0,
    "ValorAbatimento": 0.0,
    "ValorAcrescimo": 0.0,
    "ValorMulta": 0.0,
    "ValorJuros": 0.0,
    "ValorTaxa": 0.0
  },
  {
    "idTituloFinanceiroBaixaRateio": 31816,
    "idTituloFinanceiroBaixa": 31560,
    "PlanoConta": 2,
    "CentroResultado": 1,
    "ValorBaixa": 55.16,
    "ValorDesconto": 0.0,
    "ValorAbatimento": 0.0,
    "ValorAcrescimo": 0.0,
    "ValorMulta": 0.0,
    "ValorJuros": 0.0,
    "ValorTaxa": 0.0
  },
  {
    "idTituloFinanceiroBaixaRateio": 31815,
    "idTituloFinanceiroBaixa": 31559,
    "PlanoConta": 2,
    "CentroResultado": 1,
    "ValorBaixa": 119.9,
    "ValorDesconto": 0.0,
    "ValorAbatimento": 0.0,
    "ValorAcrescimo": 0.0,
    "ValorMulta": 0.0,
    "ValorJuros": 0.0,
    "ValorTaxa": 0.0
  }
]
```

</details>

---

### `ContaBancaria`
**Contas bancárias** · 11 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `idContaBancaria` | int | **não** | — |
| `Empresa` | int | sim | — |
| `Descricao` | varchar(50) | sim | — |
| `BancoNumero` | varchar(3) | sim | — |
| `BancoDescricao` | varchar(20) | sim | — |
| `AgenciaNumero` | varchar(10) | sim | — |
| `AgenciaDigito` | varchar(3) | sim | — |
| `ContaNumero` | varchar(20) | sim | — |
| `ContaDigito` | varchar(3) | sim | — |
| `DataInicial` | datetime | sim | — |
| `SaldoInicial` | money | sim | — |
| `Inativa` | bit | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "idContaBancaria": 11,
    "Empresa": 1,
    "Descricao": "APPMAX",
    "BancoNumero": "000",
    "BancoDescricao": "NÃO É UM BANCO",
    "AgenciaNumero": "",
    "AgenciaDigito": "",
    "ContaNumero": "",
    "ContaDigito": "",
    "DataInicial": "2026-03-12T00:00:00",
    "SaldoInicial": 0.0,
    "Inativa": false,
    "UsuarioAlt": "rafael",
    "DataAlt": "2026-03-25T14:25:03.637000"
  },
  {
    "idContaBancaria": 10,
    "Empresa": 1,
    "Descricao": "Pagarme",
    "BancoNumero": "000",
    "BancoDescricao": "NÃO É UM BANCO",
    "AgenciaNumero": "",
    "AgenciaDigito": "",
    "ContaNumero": "",
    "ContaDigito": "",
    "DataInicial": "2025-09-01T00:00:00",
    "SaldoInicial": 0.0,
    "Inativa": false,
    "UsuarioAlt": "rafael",
    "DataAlt": "2025-09-18T09:54:27.890000"
  },
  {
    "idContaBancaria": 9,
    "Empresa": 1,
    "Descricao": "Vindi",
    "BancoNumero": "000",
    "BancoDescricao": "NÃO É UM BANCO",
    "AgenciaNumero": "",
    "AgenciaDigito": "",
    "ContaNumero": "",
    "ContaDigito": "",
    "DataInicial": "2025-09-01T00:00:00",
    "SaldoInicial": 0.0,
    "Inativa": false,
    "UsuarioAlt": "rafael",
    "DataAlt": "2025-09-18T10:50:30.137000"
  }
]
```

</details>

---

### `ContaBancariaLancamento`
**Lançamentos bancários** · 5,188 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `idLanctoContaBancaria` | bigint | **não** | — |
| `Empresa` | int | sim | — |
| `Numero` | int | sim | — |
| `TipoLancto` | char(1) | sim | — |
| `DataLancto` | datetime | sim | — |
| `Documento` | varchar(250) | sim | — |
| `Descricao` | varchar(30) | sim | — |
| `ContaBancaria` | int | sim | — |
| `ContaBancariaDestino` | int | sim | — |
| `Valor` | money | sim | — |
| `CentroResultado` | int | sim | — |
| `PlanoConta` | int | sim | — |
| `Liquidado` | bit | sim | — |
| `Conciliado` | bit | sim | — |
| `idExtratoBanco` | varchar(250) | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |
| `idOrigemTransferencia` | int | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "idLanctoContaBancaria": 5283,
    "Empresa": 1,
    "Numero": 5283,
    "TipoLancto": "C",
    "DataLancto": "2026-04-21T18:25:35",
    "Documento": "",
    "Descricao": "PAGAMENTO CARTAO DE CREDITO",
    "ContaBancaria": 4,
    "ContaBancariaDestino": null,
    "Valor": 56180.11,
    "CentroResultado": 11,
    "PlanoConta": 106,
    "Liquidado": true,
    "Conciliado": true,
    "idExtratoBanco": "",
    "UsuarioAlt": "ana",
    "DataAlt": "2026-05-13T18:25:35.160000",
    "idOrigemTransferencia": null
  },
  {
    "idLanctoContaBancaria": 5282,
    "Empresa": 1,
    "Numero": 5282,
    "TipoLancto": "C",
    "DataLancto": "2026-04-10T17:32:36",
    "Documento": "",
    "Descricao": "PAGAMENTO CARTAO DE CREDITO",
    "ContaBancaria": 6,
    "ContaBancariaDestino": null,
    "Valor": 7422.4,
    "CentroResultado": 11,
    "PlanoConta": 106,
    "Liquidado": true,
    "Conciliado": true,
    "idExtratoBanco": "",
    "UsuarioAlt": "ana",
    "DataAlt": "2026-05-12T17:32:36.480000",
    "idOrigemTransferencia": null
  },
  {
    "idLanctoContaBancaria": 5281,
    "Empresa": 1,
    "Numero": 5281,
    "TipoLancto": "C",
    "DataLancto": "2026-04-10T16:57:51",
    "Documento": "",
    "Descricao": "PAGAMENTO CARTAO DE CREDITO",
    "ContaBancaria": 5,
    "ContaBancariaDestino": null,
    "Valor": 29321.51,
    "CentroResultado": 11,
    "PlanoConta": 106,
    "Liquidado": true,
    "Conciliado": true,
    "idExtratoBanco": "",
    "UsuarioAlt": "ana",
    "DataAlt": "2026-05-12T16:57:51.740000",
    "idOrigemTransferencia": null
  }
]
```

</details>

---

### `PlanoConta`
**Plano de contas (DRE)** · 115 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `Codigo` | int | **não** | — |
| `Descricao` | varchar(100) | sim | — |
| `Grupo` | varchar(5) | sim | — |
| `ContaContabil` | varchar(20) | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |
| `PlanoContaPai` | int | sim | — |
| `Nivel` | smallint | sim | — |
| `TipoCategoria` | varchar(1) | sim | — |
| `GrupoDRE` | int | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "Codigo": 116,
    "Descricao": "Outras receitas",
    "Grupo": null,
    "ContaContabil": "",
    "UsuarioAlt": "ana",
    "DataAlt": "2026-03-16T17:40:05.323000",
    "PlanoContaPai": 7,
    "Nivel": 3,
    "TipoCategoria": "A",
    "GrupoDRE": 0
  },
  {
    "Codigo": 115,
    "Descricao": "Empréstimos e financiamentos",
    "Grupo": null,
    "ContaContabil": "88",
    "UsuarioAlt": "ana",
    "DataAlt": "2026-01-20T11:28:07.700000",
    "PlanoContaPai": 7,
    "Nivel": 3,
    "TipoCategoria": "A",
    "GrupoDRE": 0
  },
  {
    "Codigo": 114,
    "Descricao": "Cod 1162",
    "Grupo": null,
    "ContaContabil": "62",
    "UsuarioAlt": "ana",
    "DataAlt": "2025-12-22T12:54:05.610000",
    "PlanoContaPai": 7,
    "Nivel": 3,
    "TipoCategoria": "A",
    "GrupoDRE": 0
  }
]
```

</details>

---

### `CentroResultado`
**Centros de resultado** · 13 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `Codigo` | int | **não** | — |
| `Descricao` | varchar(50) | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "Codigo": 13,
    "Descricao": "Receita de vendas",
    "UsuarioAlt": "rafael",
    "DataAlt": "2025-09-23T16:02:56.587000"
  },
  {
    "Codigo": 12,
    "Descricao": "Investimento",
    "UsuarioAlt": "rafael",
    "DataAlt": "2025-09-23T11:09:38.953000"
  },
  {
    "Codigo": 11,
    "Descricao": "TRANSFERENCIAS ENTRE CONTAS",
    "UsuarioAlt": "rafael",
    "DataAlt": "2025-09-16T15:08:58.637000"
  }
]
```

</details>

---

### `ControleCaixa`
**Abertura/fechamento de caixa** · 502 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `idControleCaixa` | bigint | **não** | — |
| `Empresa` | int | sim | — |
| `Caixa` | int | sim | — |
| `DataAbertura` | datetime | sim | — |
| `ValorAbertura` | money | sim | — |
| `UsuarioAbertura` | varchar(20) | sim | — |
| `DataFechamento` | datetime | sim | — |
| `ValorFechamento` | money | sim | — |
| `UsuarioFechamento` | varchar(20) | sim | — |
| `Justificativa` | varchar(250) | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "idControleCaixa": 502,
    "Empresa": 1,
    "Caixa": 1,
    "DataAbertura": "2026-05-18T18:39:26.170000",
    "ValorAbertura": 0.0,
    "UsuarioAbertura": "claudevan",
    "DataFechamento": "2026-05-18T22:05:36.207000",
    "ValorFechamento": 2876.22,
    "UsuarioFechamento": "claudevan",
    "Justificativa": ""
  },
  {
    "idControleCaixa": 501,
    "Empresa": 1,
    "Caixa": 3,
    "DataAbertura": "2026-05-18T18:38:57.287000",
    "ValorAbertura": 0.0,
    "UsuarioAbertura": "caixa2",
    "DataFechamento": "2026-05-18T22:05:04.747000",
    "ValorFechamento": 75.0,
    "UsuarioFechamento": "caixa2",
    "Justificativa": ""
  },
  {
    "idControleCaixa": 500,
    "Empresa": 1,
    "Caixa": 5,
    "DataAbertura": "2026-05-18T09:09:00.967000",
    "ValorAbertura": 0.0,
    "UsuarioAbertura": "hevelyn",
    "DataFechamento": "2026-05-18T17:37:28.440000",
    "ValorFechamento": 45.43,
    "UsuarioFechamento": "hevelyn",
    "Justificativa": ""
  }
]
```

</details>

---

### `ControleCaixaItens`
**Itens do caixa (vendas balcão)** · 1,861 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `idControleCaixaItens` | bigint | **não** | — |
| `idControleCaixa` | bigint | **não** | — |
| `Valor` | money | sim | — |
| `ValorFechamento` | money | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "idControleCaixaItens": 1861,
    "idControleCaixa": 502,
    "Valor": 2454.42,
    "ValorFechamento": 0.0,
    "UsuarioAlt": "claudevan",
    "DataAlt": "2026-05-18T22:05:36.260000"
  },
  {
    "idControleCaixaItens": 1860,
    "idControleCaixa": 502,
    "Valor": 381.8,
    "ValorFechamento": 0.0,
    "UsuarioAlt": "claudevan",
    "DataAlt": "2026-05-18T22:05:36.250000"
  },
  {
    "idControleCaixaItens": 1859,
    "idControleCaixa": 502,
    "Valor": 40.0,
    "ValorFechamento": 0.0,
    "UsuarioAlt": "claudevan",
    "DataAlt": "2026-05-18T22:05:36.237000"
  }
]
```

</details>

---

### `AjusteManualCusto`
**Ajustes manuais de CMV** · 2,649 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `idAjusteCusto` | bigint | **não** | — |
| `Empresa` | int | **não** | — |
| `Produto` | int | **não** | — |
| `DataAjuste` | datetime | sim | — |
| `CustoAnterior` | money | sim | — |
| `SaldoEstoque` | numeric | sim | — |
| `CustoAjuste` | money | sim | — |
| `Observacao` | varchar(255) | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "idAjusteCusto": 2651,
    "Empresa": 1,
    "Produto": 122,
    "DataAjuste": "2026-05-01T23:59:59",
    "CustoAnterior": 4.56,
    "SaldoEstoque": 0.0,
    "CustoAjuste": 0.0,
    "Observacao": "",
    "UsuarioAlt": "rafael",
    "DataAlt": "2026-05-12T11:25:06.930000"
  },
  {
    "idAjusteCusto": 2650,
    "Empresa": 1,
    "Produto": 2833,
    "DataAjuste": "2026-04-01T23:59:59",
    "CustoAnterior": 0.0,
    "SaldoEstoque": 0.0,
    "CustoAjuste": 12.5,
    "Observacao": "",
    "UsuarioAlt": "rafael",
    "DataAlt": "2026-05-12T11:03:40.907000"
  },
  {
    "idAjusteCusto": 2649,
    "Empresa": 1,
    "Produto": 1533,
    "DataAjuste": "2026-04-01T23:59:59",
    "CustoAnterior": 0.0,
    "SaldoEstoque": 0.0,
    "CustoAjuste": 25.95,
    "Observacao": "",
    "UsuarioAlt": "rafael",
    "DataAlt": "2026-05-12T11:03:40.847000"
  }
]
```

</details>

---

## Vendas

### `PedidoVenda`
**Pedidos de venda** · 22,857 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `idPedidoVenda` | bigint | **não** | — |
| `Empresa` | int | **não** | — |
| `Numero` | int | **não** | — |
| `TipoPedido` | int | sim | — |
| `Cliente` | int | sim | — |
| `DataPedido` | datetime | sim | — |
| `Vendedor` | int | sim | — |
| `CanalVenda` | int | sim | — |
| `Setor` | int | sim | — |
| `OperacaoFiscal` | bigint | sim | — |
| `PedidoCliente` | varchar(50) | sim | — |
| `Status` | int | sim | — |
| `Separado` | bit | sim | — |
| `Conferido` | bit | sim | — |
| `EnderecoEntrega` | int | sim | — |
| `Transportadora` | int | sim | — |
| `QtdeFrete` | int | sim | — |
| `FretePorConta` | int | sim | — |
| `Especie` | varchar(50) | sim | — |
| `Marca` | varchar(50) | sim | — |
| `PesoBruto` | numeric | sim | — |
| `PesoLiquido` | numeric | sim | — |
| `TotalProduto` | money | sim | — |
| `Desconto` | money | sim | — |
| `OutrasDespesas` | money | sim | — |
| `ValorFrete` | money | sim | — |
| `TotalImpostos` | money | sim | — |
| `TotalPedido` | money | sim | — |
| `FormaPagto` | int | sim | — |
| `Comanda` | int | sim | — |
| `Observacao` | text(2147483647) | sim | — |
| `SiteIdPedido` | varchar(60) | sim | — |
| `SiteStatusPedido` | varchar(20) | sim | — |
| `cNF` | bigint | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |
| `Agrupado` | bit | sim | — |
| `UsuarioAgrupamento` | varchar(20) | sim | — |
| `DataAgrupamento` | datetime | sim | — |
| `NumeroFrete` | varchar(10) | sim | — |
| `DataPedidoOriginal` | datetime | sim | — |
| `ObservacaoLogistica` | text(2147483647) | sim | — |
| `Revisao` | bit | sim | — |
| `Impresso` | bit | sim | — |
| `idPedidoOrigem` | bigint | sim | — |
| `PedidoMercus` | bit | sim | — |
| `PreFaturado` | bit | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "idPedidoVenda": 22914,
    "Empresa": 1,
    "Numero": 22924,
    "TipoPedido": 4,
    "Cliente": 47019,
    "DataPedido": "2026-05-18T17:14:43",
    "Vendedor": 39958,
    "CanalVenda": 8,
    "Setor": null,
    "OperacaoFiscal": 13,
    "PedidoCliente": "",
    "Status": 12,
    "Separado": false,
    "Conferido": false,
    "EnderecoEntrega": 1,
    "Transportadora": 39688,
    "QtdeFrete": 1,
    "FretePorConta": 0,
    "Especie": "",
    "Marca": "",
    "PesoBruto": 0.0,
    "PesoLiquido": 0.0,
    "TotalProduto": 49.9,
    "Desconto": 0.0,
    "OutrasDespesas": 0.0,
    "ValorFrete": 0.0,
    "TotalImpostos": 0.0,
    "TotalPedido": 49.9,
    "FormaPagto": null,
    "Comanda": null,
    "Observacao": "",
    "SiteIdPedido": "",
    "SiteStatusPedido": "",
    "cNF": null,
    "UsuarioAlt": "hevelyn",
    "DataAlt": "2026-05-18T17:14:43.373000",
    "Agrupado": false,
    "UsuarioAgrupamento": null,
    "DataAgrupamento": null,
    "NumeroFrete": "",
    "DataPedidoOriginal": "2026-05-18T17:14:43",
    "ObservacaoLogistica": "",
    "Revisao": false,
    "Impresso": false,
    "idPedidoOrigem": 0,
    "PedidoMercus": null,
    "PreFaturado": false
  },
  {
    "idPedidoVenda": 22913,
    "Empresa": 1,
    "Numero": 22923,
    "TipoPedido": 1,
    "Cliente": 47018,
    "DataPedido": "2026-05-18T00:00:00",
    "Vendedor": 11,
    "CanalVenda": 3,
    "Setor": 1,
    "OperacaoFiscal": 1,
    "PedidoCliente": "85201",
    "Status": 12,
    "Separado": false,
    "Conferido": false,
    "EnderecoEntrega": 2,
    "Transportadora": null,
    "QtdeFrete": 0,
    "FretePorConta": 1,
    "Especie": "",
    "Marca": "",
    "PesoBruto": 0.0,
    "PesoLiquido": 0.0,
    "TotalProduto": 39.9,
    "Desconto": 0.0,
    "OutrasDespesas": 0.0,
    "ValorFrete": 0.0,
    "TotalImpostos": 0.0,
    "TotalPedido": 39.9,
    "FormaPagto": 10,
    "Comanda": null,
    "Observacao": "",
    "SiteIdPedido": "85201",
    "SiteStatusPedido": "faturamento",
    "cNF": null,
    "UsuarioAlt": "IntegraLoja",
    "DataAlt": "2026-05-18T17:14:02.183000",
    "Agrupado": false,
    "UsuarioAgrupamento": null,
    "DataAgrupamento": null,
    "NumeroFrete": "",
    "DataPedidoOriginal": "2026-05-18T00:00:00",
    "ObservacaoLogistica": "",
    "Revisao": false,
    "Impresso": false,
    "idPedidoOrigem": 0,
    "PedidoMercus": null,
    "PreFaturado": false
  },
  {
    "idPedidoVenda": 22912,
    "Empresa": 1,
    "Numero": 22922,
    "TipoPedido": 4,
    "Cliente": 26275,
    "DataPedido": "2026-05-18T17:09:53",
    "Vendedor": 39958,
    "CanalVenda": 8,
    "Setor": null,
    "OperacaoFiscal": 13,
    "PedidoCliente": "",
    "Status": 12,
    "Separado": false,
    "Conferido": false,
    "EnderecoEntrega": 1,
    "Transportadora": 39688,
    "QtdeFrete": 1,
    "FretePorConta": 0,
    "Especie": "",
    "Marca": "",
    "PesoBruto": 0.0,
    "PesoLiquido": 0.0,
    "TotalProduto": 136.7,
    "Desconto": 0.0,
    "OutrasDespesas": 0.0,
    "ValorFrete": 0.0,
    "TotalImpostos": 0.0,
    "TotalPedido": 136.7,
    "FormaPagto": null,
    "Comanda": null,
    "Observacao": "",
    "SiteIdPedido": "",
    "SiteStatusPedido": "",
    "cNF": null,
    "UsuarioAlt": "hevelyn",
    "DataAlt": "2026-05-18T17:09:53.347000",
    "Agrupado": false,
    "UsuarioAgrupamento": null,
    "DataAgrupamento": null,
    "NumeroFrete": "",
    "DataPedidoOriginal": "2026-05-18T17:09:53",
    "ObservacaoLogistica": "",
    "Revisao": false,
    "Impresso": false,
    "idPedidoOrigem": 0,
    "PedidoMercus": null,
    "PreFaturado": false
  }
]
```

</details>

---

### `PedidoVendaItens`
**Itens dos pedidos** · 43,041 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `idPedidoVendaItens` | bigint | **não** | — |
| `idPedidoVenda` | bigint | sim | — |
| `Item` | int | sim | — |
| `Produto` | int | sim | — |
| `Descricao` | varchar(150) | sim | — |
| `UnidadeMedida` | varchar(6) | sim | — |
| `QtdePedido` | numeric | sim | — |
| `QtdeFaturado` | numeric | sim | — |
| `QtdeCancelado` | numeric | sim | — |
| `ValorUnitario` | money | sim | — |
| `PercDesconto` | money | sim | — |
| `ValorDesconto` | money | sim | — |
| `ValorUnitarioLiquido` | money | sim | — |
| `ValorTotal` | money | sim | — |
| `QtdeConferencia` | numeric | sim | — |
| `BoxConferencia` | varchar(20) | sim | — |
| `PesoBruto` | money | sim | — |
| `PesoLiquido` | money | sim | — |
| `Separado` | bit | sim | — |
| `Conferido` | bit | sim | — |
| `Excluido` | bit | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |
| `SiteIdPedido` | varchar(80) | sim | — |
| `idMontagemKit` | int | sim | — |
| `QtdeReservado` | numeric | sim | — |
| `TabelaPreco` | int | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "idPedidoVendaItens": 48667,
    "idPedidoVenda": 22914,
    "Item": 1,
    "Produto": 4977,
    "Descricao": "Família: um lugar seguro",
    "UnidadeMedida": "UN",
    "QtdePedido": 1.0,
    "QtdeFaturado": 0.0,
    "QtdeCancelado": 0.0,
    "ValorUnitario": 49.9,
    "PercDesconto": 0.0,
    "ValorDesconto": 0.0,
    "ValorUnitarioLiquido": 49.9,
    "ValorTotal": 49.9,
    "QtdeConferencia": null,
    "BoxConferencia": null,
    "PesoBruto": 0.0,
    "PesoLiquido": 0.0,
    "Separado": false,
    "Conferido": false,
    "Excluido": false,
    "UsuarioAlt": "hevelyn",
    "DataAlt": "2026-05-18T17:14:43.363000",
    "SiteIdPedido": "",
    "idMontagemKit": null,
    "QtdeReservado": 1.0,
    "TabelaPreco": 0
  },
  {
    "idPedidoVendaItens": 48666,
    "idPedidoVenda": 22913,
    "Item": 1,
    "Produto": 4977,
    "Descricao": "Família: um lugar seguro",
    "UnidadeMedida": "UN",
    "QtdePedido": 1.0,
    "QtdeFaturado": 0.0,
    "QtdeCancelado": 0.0,
    "ValorUnitario": 39.9,
    "PercDesconto": 0.0,
    "ValorDesconto": 0.0,
    "ValorUnitarioLiquido": 39.9,
    "ValorTotal": 39.9,
    "QtdeConferencia": null,
    "BoxConferencia": null,
    "PesoBruto": 0.0,
    "PesoLiquido": 0.0,
    "Separado": false,
    "Conferido": false,
    "Excluido": false,
    "UsuarioAlt": "IntegraLoja",
    "DataAlt": "2026-05-18T17:14:01.777000",
    "SiteIdPedido": "85201",
    "idMontagemKit": null,
    "QtdeReservado": 1.0,
    "TabelaPreco": 0
  },
  {
    "idPedidoVendaItens": 48665,
    "idPedidoVenda": 22912,
    "Item": 3,
    "Produto": 4978,
    "Descricao": "Efésios",
    "UnidadeMedida": "UN",
    "QtdePedido": 1.0,
    "QtdeFaturado": 0.0,
    "QtdeCancelado": 0.0,
    "ValorUnitario": 64.9,
    "PercDesconto": 0.0,
    "ValorDesconto": 0.0,
    "ValorUnitarioLiquido": 64.9,
    "ValorTotal": 64.9,
    "QtdeConferencia": null,
    "BoxConferencia": null,
    "PesoBruto": 0.0,
    "PesoLiquido": 0.0,
    "Separado": false,
    "Conferido": false,
    "Excluido": false,
    "UsuarioAlt": "hevelyn",
    "DataAlt": "2026-05-18T17:09:53.337000",
    "SiteIdPedido": "",
    "idMontagemKit": null,
    "QtdeReservado": 1.0,
    "TabelaPreco": 0
  }
]
```

</details>

---

### `PedidoVendaVencimento`
**Vencimentos dos pedidos** · 37,842 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `idPedidoVendaVencimento` | bigint | **não** | — |
| `idPedidoVenda` | bigint | sim | — |
| `Item` | int | sim | — |
| `Prazo` | int | sim | — |
| `DataVencto` | datetime | sim | — |
| `Valor` | money | sim | — |
| `FormaPagto` | int | sim | — |
| `Alterado` | bit | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |
| `CondicaoPagto` | int | sim | — |
| `ValorTaxa` | money | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "idPedidoVendaVencimento": 40963,
    "idPedidoVenda": 22913,
    "Item": 1,
    "Prazo": 0,
    "DataVencto": "2026-05-18T00:00:00",
    "Valor": 39.9,
    "FormaPagto": 10,
    "Alterado": false,
    "UsuarioAlt": "IntegraLoja",
    "DataAlt": "2026-05-18T17:14:01.833000",
    "CondicaoPagto": null,
    "ValorTaxa": 0.0
  },
  {
    "idPedidoVendaVencimento": 40962,
    "idPedidoVenda": 22910,
    "Item": 1,
    "Prazo": 0,
    "DataVencto": "2026-05-18T00:00:00",
    "Valor": 113.52,
    "FormaPagto": 12,
    "Alterado": false,
    "UsuarioAlt": "ivanise",
    "DataAlt": "2026-05-18T17:00:03.617000",
    "CondicaoPagto": null,
    "ValorTaxa": 0.0
  },
  {
    "idPedidoVendaVencimento": 40960,
    "idPedidoVenda": 22909,
    "Item": 1,
    "Prazo": 0,
    "DataVencto": "2026-05-18T00:00:00",
    "Valor": 99.9,
    "FormaPagto": 3,
    "Alterado": false,
    "UsuarioAlt": "IntegraLoja",
    "DataAlt": "2026-05-18T16:27:26.563000",
    "CondicaoPagto": null,
    "ValorTaxa": 0.0
  }
]
```

</details>

---

### `PedidoVendaStatus`
**Status disponíveis** · 12 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `Codigo` | int | **não** | — |
| `Descricao` | varchar(50) | sim | — |
| `Cor` | varchar(50) | sim | — |
| `Ordem` | int | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "Codigo": 12,
    "Descricao": "Liberar para Expedicao",
    "Cor": "$00C9C9C9",
    "Ordem": 3
  },
  {
    "Codigo": 11,
    "Descricao": "Erro Faturamento",
    "Cor": "$0000FF",
    "Ordem": -1
  },
  {
    "Codigo": 10,
    "Descricao": "Pedido Enviado",
    "Cor": "$00F960B4",
    "Ordem": 10
  }
]
```

</details>

---

### `NotaFiscal`
**Notas fiscais emitidas** · 33,418 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `idNotaFiscal` | bigint | **não** | — |
| `Empresa` | int | **não** | — |
| `Numero` | int | sim | — |
| `Serie` | int | sim | — |
| `Cliente` | int | sim | — |
| `EntSai` | char(1) | sim | — |
| `TipoNota` | int | sim | — |
| `DataEmissao` | datetime | sim | — |
| `DataSaida` | datetime | sim | — |
| `OperacaoFiscal` | bigint | sim | — |
| `DescricaoOpFiscal` | varchar(50) | sim | — |
| `Nome` | varchar(200) | sim | — |
| `FisJur` | char(1) | sim | — |
| `CnpjCpf` | varchar(14) | sim | — |
| `InscEstRg` | varchar(15) | sim | — |
| `Cep` | varchar(8) | sim | — |
| `Endereco` | varchar(250) | sim | — |
| `EndNumero` | varchar(10) | sim | — |
| `Complemento` | varchar(60) | sim | — |
| `Bairro` | varchar(100) | sim | — |
| `CodPais` | int | sim | — |
| `Pais` | varchar(150) | sim | — |
| `CodEstado` | int | sim | — |
| `Estado` | varchar(2) | sim | — |
| `CodCidade` | int | sim | — |
| `Cidade` | varchar(150) | sim | — |
| `Email` | varchar(250) | sim | — |
| `Fone` | varchar(15) | sim | — |
| `Vendedor` | int | sim | — |
| `EnderecoEntrega` | int | sim | — |
| `TotalProduto` | money | sim | — |
| `Desconto` | money | sim | — |
| `OutrasDespesas` | money | sim | — |
| `ValorFrete` | money | sim | — |
| `TotalImpostos` | money | sim | — |
| `TotalNota` | money | sim | — |
| `IcmsBase` | money | sim | — |
| `IcmsValor` | money | sim | — |
| `IcmsStBase` | money | sim | — |
| `IcmsStValor` | money | sim | — |
| `IpiValor` | money | sim | — |
| `PisValor` | money | sim | — |
| `CofinsValor` | money | sim | — |
| `IiValor` | money | sim | — |
| `Transportadora` | int | sim | — |
| `TranspPlaca` | varchar(8) | sim | — |
| `TranspUf` | varchar(2) | sim | — |
| `FretePorConta` | int | sim | — |
| `QtdeFrete` | int | sim | — |
| `Especie` | varchar(50) | sim | — |
| `Marca` | varchar(50) | sim | — |
| `NumeroFrete` | varchar(100) | sim | — |
| `PesoBruto` | numeric | sim | — |
| `PesoLiquido` | numeric | sim | — |
| `Observacao` | text(2147483647) | sim | — |
| `ObservacaoFisco` | text(2147483647) | sim | — |
| `ObservacaoAutomatica` | text(2147483647) | sim | — |
| `Cancelada` | bit | sim | — |
| `Setor` | int | sim | — |
| `SetorDestino` | int | sim | — |
| `Situacao` | int | sim | — |
| `Portador` | int | sim | — |
| `FormaPagto` | int | sim | — |
| `MoveEstoque` | bit | sim | — |
| `GeraFinanceiro` | bit | sim | — |
| `AtualizaCusto` | bit | sim | — |
| `CanalVenda` | int | sim | — |
| `Consignacao` | bigint | sim | — |
| `ExposicaoFeira` | bigint | sim | — |
| `idPedidoVenda` | bigint | sim | — |
| `PedidoCliente` | varchar(60) | sim | — |
| `Caixa` | int | sim | — |
| `CupomDesconto` | varchar(20) | sim | — |
| `UFEmbarque` | char(2) | sim | — |
| `LocalEmbarque` | varchar(60) | sim | — |
| `LocalDespacho` | varchar(60) | sim | — |
| `NFeModeloDoctoFiscal` | int | sim | — |
| `NFeFinalidade` | int | sim | — |
| `NFeLote` | bigint | sim | — |
| `NFeCodigo` | bigint | sim | — |
| `NFeStatus` | int | sim | — |
| `NFeIdentificadorDestino` | int | sim | — |
| `NFeOcorrencia` | int | sim | — |
| `NFeMotivoOcorrencia` | varchar(250) | sim | — |
| `NFeChave` | varchar(50) | sim | — |
| `NFeRecibo` | varchar(20) | sim | — |
| `NFeDataHoraRecibo` | varchar(20) | sim | — |
| `NFeProtocolo` | varchar(50) | sim | — |
| `NFeIndicadorPresenca` | int | sim | — |
| `NFeIndicadorIntermediador` | int | sim | — |
| `NFeCnpjIntermediador` | varchar(14) | sim | — |
| `NFeIdentificacaoIntermediador` | varchar(60) | sim | — |
| `NFeProtocoloCancelamento` | varchar(50) | sim | — |
| `NFeDataHoraCancelamento` | varchar(20) | sim | — |
| `NFeJustificativaCancelamento` | varchar(200) | sim | — |
| `SiteIdPedido` | varchar(60) | sim | — |
| `SiteStatusPedido` | varchar(20) | sim | — |
| `FoiGerada` | bit | sim | — |
| `GerarNotaRelacao` | bit | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |
| `Enviado` | bit | sim | — |
| `AbaterCredito` | bit | sim | — |
| `UsuarioFaturamento` | varchar(20) | sim | — |
| `DataFaturamento` | datetime | sim | — |
| `TipoEmissao` | int | sim | — |
| `integradaMaisVendidos` | bit | sim | — |
| `IBSCBSBase` | money | sim | — |
| `CBSValor` | money | sim | — |
| `IBSUFValor` | money | sim | — |
| `IBSMUNValor` | money | sim | — |
| `PreFaturado` | bit | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "idNotaFiscal": 34135,
    "Empresa": 1,
    "Numero": 5504,
    "Serie": 6,
    "Cliente": 10,
    "EntSai": "S",
    "TipoNota": 13,
    "DataEmissao": "2026-05-18T21:57:40.637000",
    "DataSaida": "2026-05-18T21:57:40.637000",
    "OperacaoFiscal": 57,
    "DescricaoOpFiscal": "VENDA DE MERCADORIA",
    "Nome": "CONSUMIDOR FINAL",
    "FisJur": "F",
    "CnpjCpf": "",
    "InscEstRg": "",
    "Cep": "05511020",
    "Endereco": "RUA MIRAGAIA",
    "EndNumero": "121",
    "Complemento": "",
    "Bairro": "BUTANTÃ",
    "CodPais": 1058,
    "Pais": "BRASIL",
    "CodEstado": 35,
    "Estado": "SP",
    "CodCidade": 3550308,
    "Cidade": "SAO PAULO",
    "Email": "",
    "Fone": "",
    "Vendedor": 26844,
    "EnderecoEntrega": 1,
    "TotalProduto": 2044.8,
    "Desconto": 0.0,
    "OutrasDespesas": 0.0,
    "ValorFrete": 0.0,
    "TotalImpostos": 0.0,
    "TotalNota": 2044.8,
    "IcmsBase": 0.0,
    "IcmsValor": 0.0,
    "IcmsStBase": 0.0,
    "IcmsStValor": 0.0,
    "IpiValor": 0.0,
    "PisValor": 0.0,
    "CofinsValor": 0.0,
    "IiValor": null,
    "Transportadora": null,
    "TranspPlaca": "",
    "TranspUf": "",
    "FretePorConta": 0,
    "QtdeFrete": 0,
    "Especie": "",
    "Marca": "",
    "NumeroFrete": "",
    "PesoBruto": 0.0,
    "PesoLiquido": 0.0,
    "Observacao": "",
    "ObservacaoFisco": "",
    "ObservacaoAutomatica": null,
    "Cancelada": false,
    "Setor": 2,
    "SetorDestino": null,
    "Situacao": null,
    "Portador": null,
    "FormaPagto": null,
    "MoveEstoque": true,
    "GeraFinanceiro": true,
    "AtualizaCusto": null,
    "CanalVenda": 6,
    "Consignacao": null,
    "ExposicaoFeira": null,
    "idPedidoVenda": null,
    "PedidoCliente": "",
    "Caixa": 1,
    "CupomDesconto": null,
    "UFEmbarque": null,
    "LocalEmbarque": null,
    "LocalDespacho": null,
    "NFeModeloDoctoFiscal": 65,
    "NFeFinalidade": 1,
    "NFeLote": 34135,
    "NFeCodigo": 69900609,
    "NFeStatus": 1,
    "NFeIdentificadorDestino": 0,
    "NFeOcorrencia": 100,
    "NFeMotivoOcorrencia": "Autorizado o uso da NF-e",
    "NFeChave": "35260540804477000144650060000055041699006092",
    "NFeRecibo": "",
    "NFeDataHoraRecibo": "18/05/2026 21:57:50",
    "NFeProtocolo": "135263364482996",
    "NFeIndicadorPresenca": 1,
    "NFeIndicadorIntermediador": 0,
    "NFeCnpjIntermediador": "",
    "NFeIdentificacaoIntermediador": "",
    "NFeProtocoloCancelamento": null,
    "NFeDataHoraCancelamento": null,
    "NFeJustificativaCancelamento": null,
    "SiteIdPedido": null,
    "SiteStatusPedido": null,
    "FoiGerada": false,
    "GerarNotaRelacao": null,
    "UsuarioAlt": "claudevan",
    "DataAlt": "2026-05-18T21:57:40.667000",
    "Enviado": false,
    "AbaterCredito": false,
    "UsuarioFaturamento": null,
    "DataFaturamento": null,
    "TipoEmissao": 0,
    "integradaMaisVendidos": null,
    "IBSCBSBase": 0.0,
    "CBSValor": 0.0,
    "IBSUFValor": 0.0,
    "IBSMUNValor": 0.0,
    "PreFaturado": false
  },
  {
    "idNotaFiscal": 34134,
    "Empresa": 1,
    "Numero": 5503,
    "Serie": 6,
    "Cliente": 10,
    "EntSai": "S",
    "TipoNota": 13,
    "DataEmissao": "2026-05-18T21:41:41.293000",
    "DataSaida": "2026-05-18T21:41:41.293000",
    "OperacaoFiscal": 57,
    "DescricaoOpFiscal": "VENDA DE MERCADORIA",
    "Nome": "CONSUMIDOR FINAL",
    "FisJur": "F",
    "CnpjCpf": "",
    "InscEstRg": "",
    "Cep": "05511020",
    "Endereco": "RUA MIRAGAIA",
    "EndNumero": "121",
    "Complemento": "",
    "Bairro": "BUTANTÃ",
    "CodPais": 1058,
    "Pais": "BRASIL",
    "CodEstado": 35,
    "Estado": "SP",
    "CodCidade": 3550308,
    "Cidade": "SAO PAULO",
    "Email": "",
    "Fone": "",
    "Vendedor": 26844,
    "EnderecoEntrega": 1,
    "TotalProduto": 64.9,
    "Desconto": 9.74,
    "OutrasDespesas": 0.0,
    "ValorFrete": 0.0,
    "TotalImpostos": 0.0,
    "TotalNota": 55.16,
    "IcmsBase": 0.0,
    "IcmsValor": 0.0,
    "IcmsStBase": 0.0,
    "IcmsStValor": 0.0,
    "IpiValor": 0.0,
    "PisValor": 0.0,
    "CofinsValor": 0.0,
    "IiValor": null,
    "Transportadora": null,
    "TranspPlaca": "",
    "TranspUf": "",
    "FretePorConta": 0,
    "QtdeFrete": 0,
    "Especie": "",
    "Marca": "",
    "NumeroFrete": "",
    "PesoBruto": 0.0,
    "PesoLiquido": 0.0,
    "Observacao": "",
    "ObservacaoFisco": "",
    "ObservacaoAutomatica": null,
    "Cancelada": false,
    "Setor": 2,
    "SetorDestino": null,
    "Situacao": null,
    "Portador": null,
    "FormaPagto": null,
    "MoveEstoque": true,
    "GeraFinanceiro": true,
    "AtualizaCusto": null,
    "CanalVenda": 6,
    "Consignacao": null,
    "ExposicaoFeira": null,
    "idPedidoVenda": null,
    "PedidoCliente": "",
    "Caixa": 1,
    "CupomDesconto": null,
    "UFEmbarque": null,
    "LocalEmbarque": null,
    "LocalDespacho": null,
    "NFeModeloDoctoFiscal": 65,
    "NFeFinalidade": 1,
    "NFeLote": 34134,
    "NFeCodigo": 24136138,
    "NFeStatus": 1,
    "NFeIdentificadorDestino": 0,
    "NFeOcorrencia": 100,
    "NFeMotivoOcorrencia": "Autorizado o uso da NF-e",
    "NFeChave": "35260540804477000144650060000055031241361383",
    "NFeRecibo": "",
    "NFeDataHoraRecibo": "18/05/2026 21:41:44",
    "NFeProtocolo": "135263364327674",
    "NFeIndicadorPresenca": 1,
    "NFeIndicadorIntermediador": 0,
    "NFeCnpjIntermediador": "",
    "NFeIdentificacaoIntermediador": "",
    "NFeProtocoloCancelamento": null,
    "NFeDataHoraCancelamento": null,
    "NFeJustificativaCancelamento": null,
    "SiteIdPedido": null,
    "SiteStatusPedido": null,
    "FoiGerada": false,
    "GerarNotaRelacao": null,
    "UsuarioAlt": "claudevan",
    "DataAlt": "2026-05-18T21:41:41.337000",
    "Enviado": false,
    "AbaterCredito": false,
    "UsuarioFaturamento": null,
    "DataFaturamento": null,
    "TipoEmissao": 0,
    "integradaMaisVendidos": null,
    "IBSCBSBase": 0.0,
    "CBSValor": 0.0,
    "IBSUFValor": 0.0,
    "IBSMUNValor": 0.0,
    "PreFaturado": false
  },
  {
    "idNotaFiscal": 34133,
    "Empresa": 1,
    "Numero": 5502,
    "Serie": 6,
    "Cliente": 10,
    "EntSai": "S",
    "TipoNota": 13,
    "DataEmissao": "2026-05-18T21:29:37.027000",
    "DataSaida": "2026-05-18T21:29:37.027000",
    "OperacaoFiscal": 57,
    "DescricaoOpFiscal": "VENDA DE MERCADORIA",
    "Nome": "CONSUMIDOR FINAL",
    "FisJur": "F",
    "CnpjCpf": "",
    "InscEstRg": "",
    "Cep": "05511020",
    "Endereco": "RUA MIRAGAIA",
    "EndNumero": "121",
    "Complemento": "",
    "Bairro": "BUTANTÃ",
    "CodPais": 1058,
    "Pais": "BRASIL",
    "CodEstado": 35,
    "Estado": "SP",
    "CodCidade": 3550308,
    "Cidade": "SAO PAULO",
    "Email": "",
    "Fone": "",
    "Vendedor": 26844,
    "EnderecoEntrega": 1,
    "TotalProduto": 119.9,
    "Desconto": 0.0,
    "OutrasDespesas": 0.0,
    "ValorFrete": 0.0,
    "TotalImpostos": 0.0,
    "TotalNota": 119.9,
    "IcmsBase": 0.0,
    "IcmsValor": 0.0,
    "IcmsStBase": 0.0,
    "IcmsStValor": 0.0,
    "IpiValor": 0.0,
    "PisValor": 0.0,
    "CofinsValor": 0.0,
    "IiValor": null,
    "Transportadora": null,
    "TranspPlaca": "",
    "TranspUf": "",
    "FretePorConta": 0,
    "QtdeFrete": 0,
    "Especie": "",
    "Marca": "",
    "NumeroFrete": "",
    "PesoBruto": 0.0,
    "PesoLiquido": 0.0,
    "Observacao": "",
    "ObservacaoFisco": "",
    "ObservacaoAutomatica": null,
    "Cancelada": false,
    "Setor": 2,
    "SetorDestino": null,
    "Situacao": null,
    "Portador": null,
    "FormaPagto": null,
    "MoveEstoque": true,
    "GeraFinanceiro": true,
    "AtualizaCusto": null,
    "CanalVenda": 6,
    "Consignacao": null,
    "ExposicaoFeira": null,
    "idPedidoVenda": null,
    "PedidoCliente": "",
    "Caixa": 1,
    "CupomDesconto": null,
    "UFEmbarque": null,
    "LocalEmbarque": null,
    "LocalDespacho": null,
    "NFeModeloDoctoFiscal": 65,
    "NFeFinalidade": 1,
    "NFeLote": 34133,
    "NFeCodigo": 42187075,
    "NFeStatus": 1,
    "NFeIdentificadorDestino": 0,
    "NFeOcorrencia": 100,
    "NFeMotivoOcorrencia": "Autorizado o uso da NF-e",
    "NFeChave": "35260540804477000144650060000055021421870750",
    "NFeRecibo": "",
    "NFeDataHoraRecibo": "18/05/2026 21:29:42",
    "NFeProtocolo": "135263364195318",
    "NFeIndicadorPresenca": 1,
    "NFeIndicadorIntermediador": 0,
    "NFeCnpjIntermediador": "",
    "NFeIdentificacaoIntermediador": "",
    "NFeProtocoloCancelamento": null,
    "NFeDataHoraCancelamento": null,
    "NFeJustificativaCancelamento": null,
    "SiteIdPedido": null,
    "SiteStatusPedido": null,
    "FoiGerada": false,
    "GerarNotaRelacao": null,
    "UsuarioAlt": "claudevan",
    "DataAlt": "2026-05-18T21:29:37.087000",
    "Enviado": false,
    "AbaterCredito": false,
    "UsuarioFaturamento": null,
    "DataFaturamento": null,
    "TipoEmissao": 0,
    "integradaMaisVendidos": null,
    "IBSCBSBase": 0.0,
    "CBSValor": 0.0,
    "IBSUFValor": 0.0,
    "IBSMUNValor": 0.0,
    "PreFaturado": false
  }
]
```

</details>

---

### `NotaFiscalItens`
**Itens das NFs** · 71,986 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `idNotaFiscalItens` | bigint | **não** | — |
| `idNotaFiscal` | bigint | **não** | — |
| `Item` | int | **não** | — |
| `Produto` | int | sim | — |
| `Descricao` | varchar(150) | sim | — |
| `Unidade` | varchar(6) | sim | — |
| `Qtde` | numeric | sim | — |
| `ValorUnitario` | money | sim | — |
| `PercDesconto` | money | sim | — |
| `ValorDesconto` | money | sim | — |
| `ValorUnitarioLiquido` | money | sim | — |
| `ValorTotal` | money | sim | — |
| `Cfop` | varchar(5) | sim | — |
| `PlanoConta` | int | sim | — |
| `CentroResultado` | int | sim | — |
| `IsEstoque` | bit | sim | — |
| `Origem` | int | sim | — |
| `ValorFrete` | money | sim | — |
| `ValorSeguro` | money | sim | — |
| `ValorOutrasDespesas` | money | sim | — |
| `ImpostoManual` | bit | sim | — |
| `IcmsCst` | varchar(3) | sim | — |
| `IcmsBase` | money | sim | — |
| `IcmsReducao` | money | sim | — |
| `IcmsAcrescimo` | money | sim | — |
| `IcmsAliq` | money | sim | — |
| `IcmsValor` | money | sim | — |
| `IcmsIncidencia` | int | sim | — |
| `IcmsModalidade` | int | sim | — |
| `IpiCst` | varchar(3) | sim | — |
| `IpiBase` | money | sim | — |
| `IpiReducao` | money | sim | — |
| `IpiAcrescimo` | money | sim | — |
| `IpiAliq` | money | sim | — |
| `IpiValor` | money | sim | — |
| `IpiIncidencia` | int | sim | — |
| `IpiEnquadramento` | varchar(5) | sim | — |
| `PisCst` | varchar(3) | sim | — |
| `PisBase` | money | sim | — |
| `PisReducao` | money | sim | — |
| `PisAcrescimo` | money | sim | — |
| `PisAliq` | money | sim | — |
| `PisValor` | money | sim | — |
| `PisIncidencia` | int | sim | — |
| `CofinsCst` | varchar(3) | sim | — |
| `CofinsBase` | money | sim | — |
| `CofinsReducao` | money | sim | — |
| `CofinsAcrescimo` | money | sim | — |
| `CofinsAliq` | money | sim | — |
| `CofinsValor` | money | sim | — |
| `CofinsIncidencia` | int | sim | — |
| `IcmsStBase` | money | sim | — |
| `IcmsStReducao` | money | sim | — |
| `IcmsStAcrescimo` | money | sim | — |
| `IcmsStAliq` | money | sim | — |
| `IcmsStValor` | money | sim | — |
| `IcmsStIncidencia` | int | sim | — |
| `IcmsStModalidade` | int | sim | — |
| `DifalBaseDestino` | money | sim | — |
| `DifalAliqInternaDestino` | money | sim | — |
| `DifalAliqInterestadual` | money | sim | — |
| `DifalPercentualProvisorio` | money | sim | — |
| `DifalValorOrigem` | money | sim | — |
| `DifalValorDestino` | money | sim | — |
| `FcpBase` | money | sim | — |
| `FcpAliq` | money | sim | — |
| `FcpValor` | money | sim | — |
| `IiBase` | money | sim | — |
| `IiValor` | money | sim | — |
| `IiDespAdu` | money | sim | — |
| `IiIof` | money | sim | — |
| `IbptTribFedNac` | money | sim | — |
| `IbptTribFedImp` | money | sim | — |
| `IbptTribEst` | money | sim | — |
| `IbptTribMun` | money | sim | — |
| `IbptChave` | varchar(20) | sim | — |
| `IbptVersao` | varchar(10) | sim | — |
| `IbptFonte` | varchar(20) | sim | — |
| `idPedidoVenda` | bigint | sim | — |
| `idPedidoVendaItens` | bigint | sim | — |
| `RelacaoNotaEmitidaRecebida` | char(1) | sim | — |
| `RelacaoNotaEmpresa` | int | sim | — |
| `RelacaoNotaParceiro` | int | sim | — |
| `RelacaoNotaNumero` | int | sim | — |
| `RelacaoNotaSerie` | int | sim | — |
| `RelacaoNotaIdItem` | bigint | sim | — |
| `NFexPed` | varchar(30) | sim | — |
| `NFenItemPed` | int | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |
| `SiteIdPedido` | varchar(80) | sim | — |
| `idMontagemKit` | int | sim | — |
| `TabelaPreco` | int | sim | — |
| `ISCst` | varchar(10) | sim | — |
| `ISClassTrib` | varchar(50) | sim | — |
| `ISBase` | money | sim | — |
| `ISAliq` | money | sim | — |
| `ISAliqEspec` | money | sim | — |
| `ISUNTrib` | varchar(10) | sim | — |
| `ISValor` | money | sim | — |
| `IBSCBSCst` | varchar(10) | sim | — |
| `IBSCBSClassTrib` | varchar(50) | sim | — |
| `IBSCBSBase` | money | sim | — |
| `IBSUFAliq` | money | sim | — |
| `IBSUFPercDif` | money | sim | — |
| `IBSUFValorDif` | money | sim | — |
| `IBSUFPercRedAliq` | money | sim | — |
| `IBSUFAliqEfet` | money | sim | — |
| `IBSUFValor` | money | sim | — |
| `IBSMUNAliq` | money | sim | — |
| `IBSMUNPercDif` | money | sim | — |
| `IBSMUNValorDif` | money | sim | — |
| `IBSMUNPercRedAliq` | money | sim | — |
| `IBSMUNAliqEfet` | money | sim | — |
| `IBSMUNValor` | money | sim | — |
| `CBSAliq` | money | sim | — |
| `CBSPercDif` | money | sim | — |
| `CBSValorDif` | money | sim | — |
| `CBSPercRedAliq` | money | sim | — |
| `CBSAliqEfet` | money | sim | — |
| `CBSValor` | money | sim | — |
| `IBSUFIncidencia` | int | sim | — |
| `IBSMUNIncidencia` | int | sim | — |
| `CBSIncidencia` | int | sim | — |
| `ISIncidencia` | int | sim | — |
| `CodigoBeneficio` | varchar(20) | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "idNotaFiscalItens": 90011,
    "idNotaFiscal": 34135,
    "Item": 1,
    "Produto": 1073,
    "Descricao": "MANUAL PRATICO PARA A VIDA APLICANDO A PALAVRA DE",
    "Unidade": "UN",
    "Qtde": 5.0,
    "ValorUnitario": 75.0,
    "PercDesconto": 0.0,
    "ValorDesconto": 0.0,
    "ValorUnitarioLiquido": 75.0,
    "ValorTotal": 375.0,
    "Cfop": "5.102",
    "PlanoConta": 2,
    "CentroResultado": 1,
    "IsEstoque": true,
    "Origem": 0,
    "ValorFrete": 0.0,
    "ValorSeguro": null,
    "ValorOutrasDespesas": 0.0,
    "ImpostoManual": false,
    "IcmsCst": "40",
    "IcmsBase": 0.0,
    "IcmsReducao": 0.0,
    "IcmsAcrescimo": 0.0,
    "IcmsAliq": 0.0,
    "IcmsValor": 0.0,
    "IcmsIncidencia": 1,
    "IcmsModalidade": 3,
    "IpiCst": "54",
    "IpiBase": 0.0,
    "IpiReducao": 0.0,
    "IpiAcrescimo": 0.0,
    "IpiAliq": 0.0,
    "IpiValor": 0.0,
    "IpiIncidencia": 1,
    "IpiEnquadramento": "001",
    "PisCst": "08",
    "PisBase": 0.0,
    "PisReducao": 0.0,
    "PisAcrescimo": 0.0,
    "PisAliq": 0.0,
    "PisValor": 0.0,
    "PisIncidencia": 1,
    "CofinsCst": "08",
    "CofinsBase": 0.0,
    "CofinsReducao": 0.0,
    "CofinsAcrescimo": 0.0,
    "CofinsAliq": 0.0,
    "CofinsValor": 0.0,
    "CofinsIncidencia": 1,
    "IcmsStBase": 0.0,
    "IcmsStReducao": 0.0,
    "IcmsStAcrescimo": 0.0,
    "IcmsStAliq": 0.0,
    "IcmsStValor": 0.0,
    "IcmsStIncidencia": 1,
    "IcmsStModalidade": 0,
    "DifalBaseDestino": null,
    "DifalAliqInternaDestino": null,
    "DifalAliqInterestadual": null,
    "DifalPercentualProvisorio": null,
    "DifalValorOrigem": null,
    "DifalValorDestino": null,
    "FcpBase": null,
    "FcpAliq": null,
    "FcpValor": null,
    "IiBase": null,
    "IiValor": null,
    "IiDespAdu": null,
    "IiIof": null,
    "IbptTribFedNac": null,
    "IbptTribFedImp": null,
    "IbptTribEst": null,
    "IbptTribMun": null,
    "IbptChave": null,
    "IbptVersao": null,
    "IbptFonte": null,
    "idPedidoVenda": 0,
    "idPedidoVendaItens": 0,
    "RelacaoNotaEmitidaRecebida": null,
    "RelacaoNotaEmpresa": null,
    "RelacaoNotaParceiro": null,
    "RelacaoNotaNumero": null,
    "RelacaoNotaSerie": null,
    "RelacaoNotaIdItem": null,
    "NFexPed": null,
    "NFenItemPed": null,
    "UsuarioAlt": "claudevan",
    "DataAlt": "2026-05-18T21:57:46.263000",
    "SiteIdPedido": null,
    "idMontagemKit": null,
    "TabelaPreco": 0,
    "ISCst": null,
    "ISClassTrib": null,
    "ISBase": null,
    "ISAliq": null,
    "ISAliqEspec": null,
    "ISUNTrib": null,
    "ISValor": null,
    "IBSCBSCst": "410",
    "IBSCBSClassTrib": "410008",
    "IBSCBSBase": 0.0,
    "IBSUFAliq": 0.0,
    "IBSUFPercDif": null,
    "IBSUFValorDif": null,
    "IBSUFPercRedAliq": 0.0,
    "IBSUFAliqEfet": 0.0,
    "IBSUFValor": 0.0,
    "IBSMUNAliq": 0.0,
    "IBSMUNPercDif": null,
    "IBSMUNValorDif": null,
    "IBSMUNPercRedAliq": 0.0,
    "IBSMUNAliqEfet": 0.0,
    "IBSMUNValor": 0.0,
    "CBSAliq": 0.0,
    "CBSPercDif": null,
    "CBSValorDif": null,
    "CBSPercRedAliq": 0.0,
    "CBSAliqEfet": 0.0,
    "CBSValor": 0.0,
    "IBSUFIncidencia": 1,
    "IBSMUNIncidencia": 1,
    "CBSIncidencia": 1,
    "ISIncidencia": null,
    "CodigoBeneficio": null
  },
  {
    "idNotaFiscalItens": 90010,
    "idNotaFiscal": 34135,
    "Item": 2,
    "Produto": 1210,
    "Descricao": "O LEGADO DA CRUZ",
    "Unidade": "UN",
    "Qtde": 3.0,
    "ValorUnitario": 60.0,
    "PercDesconto": 0.0,
    "ValorDesconto": 0.0,
    "ValorUnitarioLiquido": 60.0,
    "ValorTotal": 180.0,
    "Cfop": "5.102",
    "PlanoConta": 2,
    "CentroResultado": 1,
    "IsEstoque": true,
    "Origem": 0,
    "ValorFrete": 0.0,
    "ValorSeguro": null,
    "ValorOutrasDespesas": 0.0,
    "ImpostoManual": false,
    "IcmsCst": "40",
    "IcmsBase": 0.0,
    "IcmsReducao": 0.0,
    "IcmsAcrescimo": 0.0,
    "IcmsAliq": 0.0,
    "IcmsValor": 0.0,
    "IcmsIncidencia": 1,
    "IcmsModalidade": 3,
    "IpiCst": "54",
    "IpiBase": 0.0,
    "IpiReducao": 0.0,
    "IpiAcrescimo": 0.0,
    "IpiAliq": 0.0,
    "IpiValor": 0.0,
    "IpiIncidencia": 1,
    "IpiEnquadramento": "001",
    "PisCst": "08",
    "PisBase": 0.0,
    "PisReducao": 0.0,
    "PisAcrescimo": 0.0,
    "PisAliq": 0.0,
    "PisValor": 0.0,
    "PisIncidencia": 1,
    "CofinsCst": "08",
    "CofinsBase": 0.0,
    "CofinsReducao": 0.0,
    "CofinsAcrescimo": 0.0,
    "CofinsAliq": 0.0,
    "CofinsValor": 0.0,
    "CofinsIncidencia": 1,
    "IcmsStBase": 0.0,
    "IcmsStReducao": 0.0,
    "IcmsStAcrescimo": 0.0,
    "IcmsStAliq": 0.0,
    "IcmsStValor": 0.0,
    "IcmsStIncidencia": 1,
    "IcmsStModalidade": 0,
    "DifalBaseDestino": null,
    "DifalAliqInternaDestino": null,
    "DifalAliqInterestadual": null,
    "DifalPercentualProvisorio": null,
    "DifalValorOrigem": null,
    "DifalValorDestino": null,
    "FcpBase": null,
    "FcpAliq": null,
    "FcpValor": null,
    "IiBase": null,
    "IiValor": null,
    "IiDespAdu": null,
    "IiIof": null,
    "IbptTribFedNac": null,
    "IbptTribFedImp": null,
    "IbptTribEst": null,
    "IbptTribMun": null,
    "IbptChave": null,
    "IbptVersao": null,
    "IbptFonte": null,
    "idPedidoVenda": 0,
    "idPedidoVendaItens": 0,
    "RelacaoNotaEmitidaRecebida": null,
    "RelacaoNotaEmpresa": null,
    "RelacaoNotaParceiro": null,
    "RelacaoNotaNumero": null,
    "RelacaoNotaSerie": null,
    "RelacaoNotaIdItem": null,
    "NFexPed": null,
    "NFenItemPed": null,
    "UsuarioAlt": "claudevan",
    "DataAlt": "2026-05-18T21:57:46.027000",
    "SiteIdPedido": null,
    "idMontagemKit": null,
    "TabelaPreco": 0,
    "ISCst": null,
    "ISClassTrib": null,
    "ISBase": null,
    "ISAliq": null,
    "ISAliqEspec": null,
    "ISUNTrib": null,
    "ISValor": null,
    "IBSCBSCst": "410",
    "IBSCBSClassTrib": "410008",
    "IBSCBSBase": 0.0,
    "IBSUFAliq": 0.0,
    "IBSUFPercDif": null,
    "IBSUFValorDif": null,
    "IBSUFPercRedAliq": 0.0,
    "IBSUFAliqEfet": 0.0,
    "IBSUFValor": 0.0,
    "IBSMUNAliq": 0.0,
    "IBSMUNPercDif": null,
    "IBSMUNValorDif": null,
    "IBSMUNPercRedAliq": 0.0,
    "IBSMUNAliqEfet": 0.0,
    "IBSMUNValor": 0.0,
    "CBSAliq": 0.0,
    "CBSPercDif": null,
    "CBSValorDif": null,
    "CBSPercRedAliq": 0.0,
    "CBSAliqEfet": 0.0,
    "CBSValor": 0.0,
    "IBSUFIncidencia": 1,
    "IBSMUNIncidencia": 1,
    "CBSIncidencia": 1,
    "ISIncidencia": null,
    "CodigoBeneficio": null
  },
  {
    "idNotaFiscalItens": 90009,
    "idNotaFiscal": 34135,
    "Item": 3,
    "Produto": 1073,
    "Descricao": "MANUAL PRATICO PARA A VIDA APLICANDO A PALAVRA DE",
    "Unidade": "UN",
    "Qtde": 2.0,
    "ValorUnitario": 75.0,
    "PercDesconto": 0.0,
    "ValorDesconto": 0.0,
    "ValorUnitarioLiquido": 75.0,
    "ValorTotal": 150.0,
    "Cfop": "5.102",
    "PlanoConta": 2,
    "CentroResultado": 1,
    "IsEstoque": true,
    "Origem": 0,
    "ValorFrete": 0.0,
    "ValorSeguro": null,
    "ValorOutrasDespesas": 0.0,
    "ImpostoManual": false,
    "IcmsCst": "40",
    "IcmsBase": 0.0,
    "IcmsReducao": 0.0,
    "IcmsAcrescimo": 0.0,
    "IcmsAliq": 0.0,
    "IcmsValor": 0.0,
    "IcmsIncidencia": 1,
    "IcmsModalidade": 3,
    "IpiCst": "54",
    "IpiBase": 0.0,
    "IpiReducao": 0.0,
    "IpiAcrescimo": 0.0,
    "IpiAliq": 0.0,
    "IpiValor": 0.0,
    "IpiIncidencia": 1,
    "IpiEnquadramento": "001",
    "PisCst": "08",
    "PisBase": 0.0,
    "PisReducao": 0.0,
    "PisAcrescimo": 0.0,
    "PisAliq": 0.0,
    "PisValor": 0.0,
    "PisIncidencia": 1,
    "CofinsCst": "08",
    "CofinsBase": 0.0,
    "CofinsReducao": 0.0,
    "CofinsAcrescimo": 0.0,
    "CofinsAliq": 0.0,
    "CofinsValor": 0.0,
    "CofinsIncidencia": 1,
    "IcmsStBase": 0.0,
    "IcmsStReducao": 0.0,
    "IcmsStAcrescimo": 0.0,
    "IcmsStAliq": 0.0,
    "IcmsStValor": 0.0,
    "IcmsStIncidencia": 1,
    "IcmsStModalidade": 0,
    "DifalBaseDestino": null,
    "DifalAliqInternaDestino": null,
    "DifalAliqInterestadual": null,
    "DifalPercentualProvisorio": null,
    "DifalValorOrigem": null,
    "DifalValorDestino": null,
    "FcpBase": null,
    "FcpAliq": null,
    "FcpValor": null,
    "IiBase": null,
    "IiValor": null,
    "IiDespAdu": null,
    "IiIof": null,
    "IbptTribFedNac": null,
    "IbptTribFedImp": null,
    "IbptTribEst": null,
    "IbptTribMun": null,
    "IbptChave": null,
    "IbptVersao": null,
    "IbptFonte": null,
    "idPedidoVenda": 0,
    "idPedidoVendaItens": 0,
    "RelacaoNotaEmitidaRecebida": null,
    "RelacaoNotaEmpresa": null,
    "RelacaoNotaParceiro": null,
    "RelacaoNotaNumero": null,
    "RelacaoNotaSerie": null,
    "RelacaoNotaIdItem": null,
    "NFexPed": null,
    "NFenItemPed": null,
    "UsuarioAlt": "claudevan",
    "DataAlt": "2026-05-18T21:57:45.803000",
    "SiteIdPedido": null,
    "idMontagemKit": null,
    "TabelaPreco": 0,
    "ISCst": null,
    "ISClassTrib": null,
    "ISBase": null,
    "ISAliq": null,
    "ISAliqEspec": null,
    "ISUNTrib": null,
    "ISValor": null,
    "IBSCBSCst": "410",
    "IBSCBSClassTrib": "410008",
    "IBSCBSBase": 0.0,
    "IBSUFAliq": 0.0,
    "IBSUFPercDif": null,
    "IBSUFValorDif": null,
    "IBSUFPercRedAliq": 0.0,
    "IBSUFAliqEfet": 0.0,
    "IBSUFValor": 0.0,
    "IBSMUNAliq": 0.0,
    "IBSMUNPercDif": null,
    "IBSMUNValorDif": null,
    "IBSMUNPercRedAliq": 0.0,
    "IBSMUNAliqEfet": 0.0,
    "IBSMUNValor": 0.0,
    "CBSAliq": 0.0,
    "CBSPercDif": null,
    "CBSValorDif": null,
    "CBSPercRedAliq": 0.0,
    "CBSAliqEfet": 0.0,
    "CBSValor": 0.0,
    "IBSUFIncidencia": 1,
    "IBSMUNIncidencia": 1,
    "CBSIncidencia": 1,
    "ISIncidencia": null,
    "CodigoBeneficio": null
  }
]
```

</details>

---

### `NotaFiscalVencimento`
**Vencimentos das NFs** · 48,152 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `idNotaFiscalVencimento` | bigint | **não** | — |
| `idNotaFiscal` | bigint | **não** | — |
| `Item` | int | **não** | — |
| `Prazo` | int | sim | — |
| `DataVencto` | datetime | sim | — |
| `Valor` | money | sim | — |
| `ValorTroco` | money | sim | — |
| `FormaPagto` | int | sim | — |
| `CondicaoPagto` | int | sim | — |
| `Alterado` | bit | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |
| `ValorTaxa` | money | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "idNotaFiscalVencimento": 54791,
    "idNotaFiscal": 34135,
    "Item": 1,
    "Prazo": 1,
    "DataVencto": "2026-05-19T00:00:00",
    "Valor": 2044.8,
    "ValorTroco": 0.0,
    "FormaPagto": 3,
    "CondicaoPagto": 3,
    "Alterado": false,
    "UsuarioAlt": "claudevan",
    "DataAlt": "2026-05-18T21:57:46.313000",
    "ValorTaxa": 0.0
  },
  {
    "idNotaFiscalVencimento": 54790,
    "idNotaFiscal": 34134,
    "Item": 1,
    "Prazo": 1,
    "DataVencto": "2026-05-19T00:00:00",
    "Valor": 55.16,
    "ValorTroco": 0.0,
    "FormaPagto": 3,
    "CondicaoPagto": 3,
    "Alterado": false,
    "UsuarioAlt": "claudevan",
    "DataAlt": "2026-05-18T21:41:41.743000",
    "ValorTaxa": 0.0
  },
  {
    "idNotaFiscalVencimento": 54789,
    "idNotaFiscal": 34133,
    "Item": 1,
    "Prazo": 0,
    "DataVencto": "2026-05-18T00:00:00",
    "Valor": 119.9,
    "ValorTroco": 0.0,
    "FormaPagto": 12,
    "CondicaoPagto": 2,
    "Alterado": false,
    "UsuarioAlt": "claudevan",
    "DataAlt": "2026-05-18T21:29:37.950000",
    "ValorTaxa": 0.0
  }
]
```

</details>

---

### `ProdutoPreco`
**Tabela de preços** · 6,090 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `Produto` | int | **não** | — |
| `Item` | int | **não** | — |
| `FaixaInicial` | int | sim | — |
| `FaixaFinal` | int | sim | — |
| `DataVigencia` | datetime | sim | — |
| `Preco` | money | sim | — |
| `DescontoMaximo` | money | sim | — |
| `TipoCliente` | int | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |
| `TipoTabela` | int | sim | — |
| `TabelaPreco` | int | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "Produto": 5073,
    "Item": 1,
    "FaixaInicial": 0,
    "FaixaFinal": 0,
    "DataVigencia": "2026-05-18T00:00:00",
    "Preco": 114.8,
    "DescontoMaximo": 0.0,
    "TipoCliente": 0,
    "UsuarioAlt": "diego",
    "DataAlt": "2026-05-18T00:00:00",
    "TipoTabela": 0,
    "TabelaPreco": 0
  },
  {
    "Produto": 5072,
    "Item": 1,
    "FaixaInicial": 0,
    "FaixaFinal": 0,
    "DataVigencia": "2026-05-11T00:00:00",
    "Preco": 164.9,
    "DescontoMaximo": 0.0,
    "TipoCliente": 0,
    "UsuarioAlt": "claudevan",
    "DataAlt": "2026-05-11T19:47:36.877000",
    "TipoTabela": 0,
    "TabelaPreco": 0
  },
  {
    "Produto": 5071,
    "Item": 1,
    "FaixaInicial": 0,
    "FaixaFinal": 0,
    "DataVigencia": "2026-05-11T00:00:00",
    "Preco": 4.49,
    "DescontoMaximo": 0.4464,
    "TipoCliente": 0,
    "UsuarioAlt": "ana",
    "DataAlt": "2026-05-11T12:33:59.473000",
    "TipoTabela": 0,
    "TabelaPreco": 0
  }
]
```

</details>

---

## Estoque

### `Estoque`
**Saldo atual por produto/setor** · 6,521 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `Empresa` | int | **não** | — |
| `Setor` | int | **não** | — |
| `Produto` | int | **não** | — |
| `QtdeFisica` | numeric | sim | — |
| `QtdeRecebido` | numeric | sim | — |
| `QtdeEnviado` | numeric | sim | — |
| `SaldoProprio` | numeric | sim | — |
| `UsuarioAlt` | varchar(50) | sim | — |
| `DataAlt` | datetime | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "Empresa": 1,
    "Setor": 99,
    "Produto": 5040,
    "QtdeFisica": 1.0,
    "QtdeRecebido": null,
    "QtdeEnviado": null,
    "SaldoProprio": 1.0,
    "UsuarioAlt": "arthur",
    "DataAlt": "2026-05-18T11:31:00.140000"
  },
  {
    "Empresa": 1,
    "Setor": 99,
    "Produto": 5013,
    "QtdeFisica": 18.0,
    "QtdeRecebido": null,
    "QtdeEnviado": null,
    "SaldoProprio": 18.0,
    "UsuarioAlt": "arthur",
    "DataAlt": "2026-05-18T17:50:05.893000"
  },
  {
    "Empresa": 1,
    "Setor": 99,
    "Produto": 5007,
    "QtdeFisica": 0.0,
    "QtdeRecebido": null,
    "QtdeEnviado": null,
    "SaldoProprio": 0.0,
    "UsuarioAlt": "igor",
    "DataAlt": "2026-04-28T08:16:17.323000"
  }
]
```

</details>

---

### `MovimentoEstoque`
**Histórico completo de movimentação** · 163,604 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `IdMovimento` | bigint | **não** | — |
| `Empresa` | int | sim | — |
| `Setor` | int | sim | — |
| `Box` | varchar(20) | **não** | — |
| `DataMovto` | datetime | sim | — |
| `EntSai` | char(1) | sim | — |
| `Produto` | int | sim | — |
| `Qtde` | numeric | sim | — |
| `Saldo` | numeric | sim | — |
| `Origem` | int | sim | — |
| `OrigemIdRegistro` | bigint | sim | — |
| `OrigemIdRegistroItens` | bigint | sim | — |
| `Consignacao` | bigint | sim | — |
| `Observacao` | text(2147483647) | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "IdMovimento": 167387,
    "Empresa": 1,
    "Setor": 2,
    "Box": "",
    "DataMovto": "2026-05-18T21:57:40.637000",
    "EntSai": "S",
    "Produto": 4822,
    "Qtde": 1.0,
    "Saldo": null,
    "Origem": 1,
    "OrigemIdRegistro": 34135,
    "OrigemIdRegistroItens": 89992,
    "Consignacao": null,
    "Observacao": "",
    "UsuarioAlt": "claudevan",
    "DataAlt": "2026-05-18T21:57:46.723000"
  },
  {
    "IdMovimento": 167386,
    "Empresa": 1,
    "Setor": 2,
    "Box": "",
    "DataMovto": "2026-05-18T21:57:40.637000",
    "EntSai": "S",
    "Produto": 4823,
    "Qtde": 1.0,
    "Saldo": null,
    "Origem": 1,
    "OrigemIdRegistro": 34135,
    "OrigemIdRegistroItens": 89993,
    "Consignacao": null,
    "Observacao": "",
    "UsuarioAlt": "claudevan",
    "DataAlt": "2026-05-18T21:57:46.713000"
  },
  {
    "IdMovimento": 167385,
    "Empresa": 1,
    "Setor": 2,
    "Box": "",
    "DataMovto": "2026-05-18T21:57:40.637000",
    "EntSai": "S",
    "Produto": 691,
    "Qtde": 2.0,
    "Saldo": null,
    "Origem": 1,
    "OrigemIdRegistro": 34135,
    "OrigemIdRegistroItens": 89994,
    "Consignacao": null,
    "Observacao": "",
    "UsuarioAlt": "claudevan",
    "DataAlt": "2026-05-18T21:57:46.693000"
  }
]
```

</details>

---

### `Produto`
**Catálogo de produtos** · 5,073 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `Codigo` | int | **não** | — |
| `Titulo` | varchar(150) | sim | — |
| `SubTitulo` | varchar(100) | sim | — |
| `CodigoOriginal` | varchar(20) | sim | — |
| `ProdutoLivro` | char(1) | sim | — |
| `TipoProduto` | int | sim | — |
| `IsCompra` | bit | sim | — |
| `IsVenda` | bit | sim | — |
| `IsConsignacao` | bit | sim | — |
| `IsEstoque` | bit | sim | — |
| `Origem` | int | sim | — |
| `UnidadeMedida` | varchar(6) | sim | — |
| `DataCadastro` | datetime | sim | — |
| `Ncm` | varchar(15) | sim | — |
| `CEST` | varchar(10) | sim | — |
| `CBenef` | varchar(10) | sim | — |
| `GrupoProduto` | int | sim | — |
| `EstoqueMinimo` | numeric | sim | — |
| `EstoqueMaximo` | numeric | sim | — |
| `Altura` | numeric | sim | — |
| `Largura` | numeric | sim | — |
| `Profundidade` | numeric | sim | — |
| `PesoBruto` | numeric | sim | — |
| `PesoLiquido` | numeric | sim | — |
| `NumeroPagina` | int | sim | — |
| `Inativo` | bit | sim | — |
| `Editora` | int | sim | — |
| `Selo` | int | sim | — |
| `Genero` | int | sim | — |
| `Idioma` | int | sim | — |
| `Situacao` | varchar(3) | sim | — |
| `CaracteristicaFiscal` | char(1) | sim | — |
| `TipoPreco` | char(1) | sim | — |
| `Desconto` | money | sim | — |
| `CodigoBarras` | varchar(30) | sim | — |
| `CodigoIsbn` | varchar(30) | sim | — |
| `CodigoIssn` | varchar(30) | sim | — |
| `Encadernacao` | varchar(30) | sim | — |
| `Edicao` | varchar(30) | sim | — |
| `EdicaoAno` | varchar(10) | sim | — |
| `Tiragem` | int | sim | — |
| `Sinopse` | text(2147483647) | sim | — |
| `Observacao` | text(2147483647) | sim | — |
| `Imagem1` | varchar(250) | sim | — |
| `Imagem2` | varchar(250) | sim | — |
| `Imagem3` | varchar(250) | sim | — |
| `Imagem4` | varchar(250) | sim | — |
| `Imagem5` | varchar(250) | sim | — |
| `Imagem6` | varchar(250) | sim | — |
| `Imagem7` | varchar(250) | sim | — |
| `LancamentoAte` | datetime | sim | — |
| `Lancamento` | int | **não** | — |
| `Localizacao` | varchar(30) | sim | — |
| `SiteID` | varchar(50) | sim | — |
| `idRoyalties` | bigint | sim | — |
| `updateRoyalties` | datetime | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |
| `Url` | varchar(250) | sim | — |
| `Bisac` | varchar(10) | sim | — |
| `UsuarioCadastro` | varchar(20) | sim | — |
| `CodigoBarrasCaixa` | varchar(30) | sim | — |
| `QtdeEmbalagem` | numeric | sim | — |
| `UnidadeMedidaCompra` | varchar(6) | sim | — |
| `EstoqueMinimoPicking` | numeric | sim | — |
| `AtualizaPickingMinimo` | bit | sim | — |
| `DataLancamento` | datetime | sim | — |
| `QtdePalete` | numeric | sim | — |
| `Preco` | money | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "Codigo": 1,
    "Titulo": "Josué",
    "SubTitulo": "Deus cumpre suas promessas",
    "CodigoOriginal": "",
    "ProdutoLivro": "L",
    "TipoProduto": 1,
    "IsCompra": true,
    "IsVenda": true,
    "IsConsignacao": true,
    "IsEstoque": true,
    "Origem": 0,
    "UnidadeMedida": "UN",
    "DataCadastro": "2025-08-25T14:01:13.350000",
    "Ncm": "49019900",
    "CEST": "",
    "CBenef": "SP070130",
    "GrupoProduto": null,
    "EstoqueMinimo": 0.0,
    "EstoqueMaximo": 0.0,
    "Altura": 23.0,
    "Largura": 16.0,
    "Profundidade": 3.0,
    "PesoBruto": 0.45,
    "PesoLiquido": 0.45,
    "NumeroPagina": 240,
    "Inativo": false,
    "Editora": 1,
    "Selo": 1,
    "Genero": null,
    "Idioma": 1,
    "Situacao": "DIS",
    "CaracteristicaFiscal": "C",
    "TipoPreco": "D",
    "Desconto": 0.0,
    "CodigoBarras": "9786552650504",
    "CodigoIsbn": "9786552650504",
    "CodigoIssn": "",
    "Encadernacao": "",
    "Edicao": "1",
    "EdicaoAno": "2025",
    "Tiragem": 0,
    "Sinopse": "O livro de Josué é um chamado vibrante à coragem, à obediência e à confiança no Deus que cumpre infalivelmente cada uma de suas promessas. Desde a travessia do Jordão até a distribuição da Terra Prometida, a narrativa nos mostra que a fidelidade de Deus permanece inabalável, mesmo diante da fragilidade humana. A liderança de Josué, a santidade exigida do povo e a presença constante do Senhor revelam verdades espirituais que ecoam até os nossos dias.    Nesta obra, o pastor e teólogo Arival Dias Casimiro apresenta um comentário exegético, teológico e pastoral profundamente enraizado na teologia da aliança. Josué é retratado como tipo de Cristo, aquele que conduz o povo de Deus rumo à herança prometida, antecipando o descanso eterno que será plenamente consumado em Jesus. O leitor encontrará aqui não apenas explicações rigorosas do texto bíblico, mas aplicações práticas para a vida cristã que fortalecem a fé, encorajam a liderança e sustentam a esperança.    Josué nos ensina que a vitória não está nas estratégias humanas, mas na presença de Deus entre o seu povo. E é pela Palavra, pela fidelidade e pela graça que caminhamos com segurança rumo à promessa final.    A Série Comentário Bíblico Heziom reúne comentários bíblicos profundos e acessíveis, rigorosos exegeticamente e aplicáveis à vida. Cada volume busca auxiliar na devoção e no estudo pessoais, contribuindo para debates que desafiam e edificam, além de auxiliar no ensino e na pregação. Você encontrará em cada volume:    - Esboço completo e detalhado de cada livro bíblico;  - Reflexões devocionais;  - Perguntas para debate em grupos pequenos;  - Espaço para anotações quando o material for utilizado em escolas bíblicas;  - Apontamentos e esboço homilético de cada perícope importante.    Você tem agora uma ferramenta instrutiva, interativa e prática, sem deixar de estar ancorada nos mais confiáveis princípios de interpretação das Escrituras, para se aprofundar e crescer na Palavra de Deus!",
    "Observacao": "",
    "Imagem1": "\\\\192.168.18.10\\Literarius\\Imagens\\9786552650504.jpg",
    "Imagem2": "",
    "Imagem3": "",
    "Imagem4": "",
    "Imagem5": "",
    "Imagem6": "",
    "Imagem7": "",
    "LancamentoAte": null,
    "Lancamento": 0,
    "Localizacao": "",
    "SiteID": "698795",
    "idRoyalties": null,
    "updateRoyalties": null,
    "UsuarioAlt": "Metadados",
    "DataAlt": "2026-03-05T11:02:18.240000",
    "Url": "https://fl-storage.bookinfometadados.com.br/uploads/book/first_cover/thumb_9786552650504.jpg",
    "Bisac": "REL006060",
    "UsuarioCadastro": null,
    "CodigoBarrasCaixa": "",
    "QtdeEmbalagem": 0.0,
    "UnidadeMedidaCompra": "",
    "EstoqueMinimoPicking": 0.0,
    "AtualizaPickingMinimo": false,
    "DataLancamento": "2025-08-22T00:00:00",
    "QtdePalete": 0.0,
    "Preco": 77.9
  },
  {
    "Codigo": 8,
    "Titulo": "Mães da aliança 2025",
    "SubTitulo": "Orando pelos filhos com base nas promessas de Deus",
    "CodigoOriginal": "",
    "ProdutoLivro": "L",
    "TipoProduto": 1,
    "IsCompra": true,
    "IsVenda": true,
    "IsConsignacao": true,
    "IsEstoque": true,
    "Origem": 0,
    "UnidadeMedida": "UN",
    "DataCadastro": "2025-08-28T13:26:12.120000",
    "Ncm": "49019900",
    "CEST": "",
    "CBenef": "SP070130",
    "GrupoProduto": null,
    "EstoqueMinimo": 0.0,
    "EstoqueMaximo": 0.0,
    "Altura": 23.0,
    "Largura": 16.0,
    "Profundidade": 2.5,
    "PesoBruto": 0.59,
    "PesoLiquido": 0.59,
    "NumeroPagina": 400,
    "Inativo": false,
    "Editora": 1,
    "Selo": 1,
    "Genero": null,
    "Idioma": 1,
    "Situacao": "DIS",
    "CaracteristicaFiscal": "C",
    "TipoPreco": "D",
    "Desconto": 0.0,
    "CodigoBarras": "9786552650009",
    "CodigoIsbn": "9786552650009",
    "CodigoIssn": "",
    "Encadernacao": "",
    "Edicao": "2",
    "EdicaoAno": "2024",
    "Tiragem": 0,
    "Sinopse": "Nos dias de hoje, nossas famílias enfrentam um mundo repleto de desafios espirituais e influências negativas. É por isso que as mães precisam unir forças como mães da aliança, levantando um exército de oração pelas novas gerações. As promessas de Deus são nossa garantia de que ele ouvirá nossas súplicas e nos dará o livramento.  Este devocional foi criado especialmente para você, mãe crente e guerreira espiritual. A cada dia, você encontrará nas páginas de Mães da aliança um lembrete da fidelidade de Deus, que estende suas bênçãos não apenas a você, mas a seus filhos e às gerações futuras. Seu papel é semear a Palavra e orar pela transformação e santificação de seus filhos, confiando que o Senhor cumprirá suas promessas.  Mães da aliança já alcançou mais de 30 mil mães, transformando vidas e fortalecendo famílias. Testemunhos de fé e vitória continuam a surgir, revelando o poder da oração persistente e a fidelidade de Deus em cumprir suas promessas. Este devocional é mais que um recurso   é uma experiência de fé que você compartilha com milhares de outras mães. Descubra como a oração pode transformar o destino de gerações",
    "Observacao": "",
    "Imagem1": "\\\\192.168.18.10\\Literarius\\Imagens\\9786552650009.jpg",
    "Imagem2": "",
    "Imagem3": "",
    "Imagem4": "",
    "Imagem5": "",
    "Imagem6": "",
    "Imagem7": "",
    "LancamentoAte": null,
    "Lancamento": 0,
    "Localizacao": "",
    "SiteID": null,
    "idRoyalties": null,
    "updateRoyalties": null,
    "UsuarioAlt": "Metadados",
    "DataAlt": "2026-03-05T11:02:55.483000",
    "Url": "https://fl-storage.bookinfometadados.com.br/uploads/book/first_cover/thumb_9786552650009.jpg",
    "Bisac": "REL012080",
    "UsuarioCadastro": null,
    "CodigoBarrasCaixa": "",
    "QtdeEmbalagem": 0.0,
    "UnidadeMedidaCompra": "",
    "EstoqueMinimoPicking": 0.0,
    "AtualizaPickingMinimo": false,
    "DataLancamento": "2024-10-25T00:00:00",
    "QtdePalete": 0.0,
    "Preco": 89.9
  },
  {
    "Codigo": 9,
    "Titulo": "Mães orando, Deus agindo 2025 - Projeto Ana",
    "SubTitulo": "Especial 140 anos SAF",
    "CodigoOriginal": "",
    "ProdutoLivro": "L",
    "TipoProduto": 1,
    "IsCompra": true,
    "IsVenda": true,
    "IsConsignacao": true,
    "IsEstoque": true,
    "Origem": 0,
    "UnidadeMedida": "UN",
    "DataCadastro": "2025-08-28T13:26:12.167000",
    "Ncm": "49019900",
    "CEST": "",
    "CBenef": "SP070130",
    "GrupoProduto": null,
    "EstoqueMinimo": 0.0,
    "EstoqueMaximo": 0.0,
    "Altura": 23.0,
    "Largura": 16.0,
    "Profundidade": 2.5,
    "PesoBruto": 0.59,
    "PesoLiquido": 0.59,
    "NumeroPagina": 400,
    "Inativo": false,
    "Editora": 1,
    "Selo": 1,
    "Genero": null,
    "Idioma": 1,
    "Situacao": "DIS",
    "CaracteristicaFiscal": "C",
    "TipoPreco": "D",
    "Desconto": 0.0,
    "CodigoBarras": "9786552650016",
    "CodigoIsbn": "9786552650016",
    "CodigoIssn": "",
    "Encadernacao": "",
    "Edicao": "2",
    "EdicaoAno": "2024",
    "Tiragem": 0,
    "Sinopse": "Nos dias de hoje, nossas famílias enfrentam um mundo repleto de desafios espirituais e influências negativas. Por isso, precisamos unir forças como mulheres, formando um exército de oração pelas novas gerações. As promessas de Deus são nossa garantia de que ele ouvirá nossas súplicas e nos concederá o livramento.  Este devocional foi criado especialmente para você, mãe crente e guerreira espiritual. A cada dia, você encontrará nas páginas de Mães orando, Deus agindo um lembrete da fidelidade de Deus, que estende suas bênçãos não apenas a você, mas também a seus filhos e às gerações futuras. Seu papel é semear a Palavra, orar pela transformação e santificação de seus filhos e confiar que o Senhor cumprirá suas promessas.  Este projeto de mães de oração já alcançou mais de 30 mil mães, transformando vidas e fortalecendo famílias. Testemunhos de fé e vitória continuam a surgir, revelando o poder da oração persistente e a fidelidade de Deus em cumprir Suas promessas. Este devocional é mais que um recurso   é uma experiência de fé que você compartilha com milhares de outras mães. Descubra como a oração pode transformar o destino de gerações.",
    "Observacao": "",
    "Imagem1": "\\\\192.168.18.10\\Literarius\\Imagens\\9786552650016.jpg",
    "Imagem2": "",
    "Imagem3": "",
    "Imagem4": "",
    "Imagem5": "",
    "Imagem6": "",
    "Imagem7": "",
    "LancamentoAte": null,
    "Lancamento": 0,
    "Localizacao": "",
    "SiteID": "698471",
    "idRoyalties": null,
    "updateRoyalties": null,
    "UsuarioAlt": "Metadados",
    "DataAlt": "2026-03-05T11:02:54.083000",
    "Url": "https://fl-storage.bookinfometadados.com.br/uploads/book/first_cover/thumb_9786552650016.jpg",
    "Bisac": "REL012080",
    "UsuarioCadastro": null,
    "CodigoBarrasCaixa": "",
    "QtdeEmbalagem": 0.0,
    "UnidadeMedidaCompra": "",
    "EstoqueMinimoPicking": 0.0,
    "AtualizaPickingMinimo": false,
    "DataLancamento": "2024-10-25T00:00:00",
    "QtdePalete": 0.0,
    "Preco": 94.9
  }
]
```

</details>

---

### `ProdutoAutor`
**Autores por produto** · 2,583 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `Produto` | int | **não** | — |
| `Item` | int | **não** | — |
| `Autor` | int | **não** | — |
| `TipoParticipacao` | int | **não** | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "Produto": 5033,
    "Item": 1,
    "Autor": 15,
    "TipoParticipacao": 1,
    "UsuarioAlt": "rafael",
    "DataAlt": "2026-04-30T15:54:25.017000"
  },
  {
    "Produto": 5032,
    "Item": 1,
    "Autor": 26803,
    "TipoParticipacao": 1,
    "UsuarioAlt": "rafael",
    "DataAlt": "2026-04-30T15:52:49.143000"
  },
  {
    "Produto": 5030,
    "Item": 2,
    "Autor": 28159,
    "TipoParticipacao": 1,
    "UsuarioAlt": "rafael",
    "DataAlt": "2026-04-30T15:44:42.840000"
  }
]
```

</details>

---

### `Inventario`
**Inventários realizados** · 1,200 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `idInventario` | bigint | **não** | — |
| `Empresa` | int | sim | — |
| `Numero` | int | sim | — |
| `DataInventario` | datetime | sim | — |
| `Setor` | int | sim | — |
| `Box` | varchar(20) | sim | — |
| `Processado` | bit | **não** | — |
| `Observacao` | varchar(250) | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "idInventario": 1210,
    "Empresa": 1,
    "Numero": 1200,
    "DataInventario": "2026-05-06T15:14:10.930000",
    "Setor": 98,
    "Box": "PKR01M04P2",
    "Processado": true,
    "Observacao": "INVENTÁRIO COMPLEMENTAR\r\nProduto: 120 Adicionado +1 unidades na posição anterior.\r\n",
    "UsuarioAlt": "igor",
    "DataAlt": "2026-05-06T15:14:10.937000"
  },
  {
    "idInventario": 1209,
    "Empresa": 1,
    "Numero": 1199,
    "DataInventario": "2026-05-06T15:13:53.147000",
    "Setor": 98,
    "Box": "PKR01M01P3",
    "Processado": true,
    "Observacao": "INVENTÁRIO COMPLEMENTAR\r\nProduto: 88 Adicionado +1 unidades na posição anterior.\r\n",
    "UsuarioAlt": "igor",
    "DataAlt": "2026-05-06T15:13:53.150000"
  },
  {
    "idInventario": 1208,
    "Empresa": 1,
    "Numero": 1198,
    "DataInventario": "2026-05-06T14:41:44.067000",
    "Setor": 98,
    "Box": "PKR01M02P3",
    "Processado": true,
    "Observacao": "INVENTÁRIO COMPLEMENTAR\r\nProduto: 61 Adicionado +1 unidades na posição anterior.\r\n",
    "UsuarioAlt": "igor",
    "DataAlt": "2026-05-06T14:41:44.070000"
  }
]
```

</details>

---

### `InventarioItens`
**Itens dos inventários** · 9,176 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `idInventarioItens` | bigint | **não** | — |
| `idInventario` | bigint | sim | — |
| `Item` | int | sim | — |
| `Produto` | int | sim | — |
| `Descricao` | varchar(150) | sim | — |
| `Unidade` | varchar(6) | sim | — |
| `QtdeContada` | numeric | sim | — |
| `SaldoEstoque` | numeric | sim | — |
| `QtdeDiferenca` | numeric | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "idInventarioItens": 9221,
    "idInventario": 1210,
    "Item": 1,
    "Produto": 120,
    "Descricao": "A ilusão do Livre-Arbítrio",
    "Unidade": "UN",
    "QtdeContada": 1.0,
    "SaldoEstoque": 2.0,
    "QtdeDiferenca": 1.0,
    "UsuarioAlt": "igor",
    "DataAlt": "2026-05-06T15:14:10.983000"
  },
  {
    "idInventarioItens": 9220,
    "idInventario": 1209,
    "Item": 1,
    "Produto": 88,
    "Descricao": "Tratado sobre a oração",
    "Unidade": "UN",
    "QtdeContada": 1.0,
    "SaldoEstoque": 23.0,
    "QtdeDiferenca": 22.0,
    "UsuarioAlt": "igor",
    "DataAlt": "2026-05-06T15:13:53.227000"
  },
  {
    "idInventarioItens": 9219,
    "idInventario": 1208,
    "Item": 1,
    "Produto": 61,
    "Descricao": "O talão de cheques do banco da fé",
    "Unidade": "UN",
    "QtdeContada": 1.0,
    "SaldoEstoque": 19.0,
    "QtdeDiferenca": 18.0,
    "UsuarioAlt": "igor",
    "DataAlt": "2026-05-06T14:41:44.137000"
  }
]
```

</details>

---

### `LancamentoEstoque`
**Lançamentos manuais de estoque** · 720 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `IdLanctoEstoque` | bigint | **não** | — |
| `Empresa` | int | **não** | — |
| `Numero` | int | **não** | — |
| `DataLancto` | datetime | sim | — |
| `Setor` | int | sim | — |
| `TipoLanctoEstoque` | int | sim | — |
| `EntSai` | char(1) | sim | — |
| `Observacao` | varchar(250) | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "IdLanctoEstoque": 723,
    "Empresa": 1,
    "Numero": 720,
    "DataLancto": "2026-05-18T15:23:18",
    "Setor": 1,
    "TipoLanctoEstoque": 1,
    "EntSai": "E",
    "Observacao": "",
    "UsuarioAlt": "arthur",
    "DataAlt": "2026-05-18T15:23:18.007000"
  },
  {
    "IdLanctoEstoque": 722,
    "Empresa": 1,
    "Numero": 719,
    "DataLancto": "2026-05-18T15:15:17",
    "Setor": 1,
    "TipoLanctoEstoque": 1,
    "EntSai": "E",
    "Observacao": "",
    "UsuarioAlt": "arthur",
    "DataAlt": "2026-05-18T15:15:17.633000"
  },
  {
    "IdLanctoEstoque": 721,
    "Empresa": 1,
    "Numero": 718,
    "DataLancto": "2026-05-18T13:44:00",
    "Setor": 1,
    "TipoLanctoEstoque": 1,
    "EntSai": "E",
    "Observacao": "",
    "UsuarioAlt": "diego",
    "DataAlt": "2026-05-18T13:44:00.033000"
  }
]
```

</details>

---

## Consignação

### `Consignacao`
**Consignações abertas** · 50 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `idConsignacao` | bigint | **não** | — |
| `Empresa` | int | **não** | — |
| `Parceiro` | int | sim | — |
| `TipoConsignacao` | char(1) | sim | — |
| `DataInicio` | datetime | sim | — |
| `DataFim` | datetime | sim | — |
| `TipoDesconto` | char(1) | sim | — |
| `Desconto` | money | sim | — |
| `TipoPreco` | char(1) | sim | — |
| `Observacao` | text(2147483647) | sim | — |
| `Encerrado` | bit | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |
| `LimiteCredito` | money | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "idConsignacao": 50,
    "Empresa": 1,
    "Parceiro": 46576,
    "TipoConsignacao": "V",
    "DataInicio": null,
    "DataFim": null,
    "TipoDesconto": "M",
    "Desconto": 0.0,
    "TipoPreco": "C",
    "Observacao": "",
    "Encerrado": false,
    "UsuarioAlt": "igor",
    "DataAlt": "2026-05-13T09:33:58.493000",
    "LimiteCredito": 0.0
  },
  {
    "idConsignacao": 49,
    "Empresa": 1,
    "Parceiro": 19516,
    "TipoConsignacao": "V",
    "DataInicio": null,
    "DataFim": null,
    "TipoDesconto": "M",
    "Desconto": 0.0,
    "TipoPreco": "C",
    "Observacao": "",
    "Encerrado": false,
    "UsuarioAlt": "igor",
    "DataAlt": "2026-04-28T11:13:25.477000",
    "LimiteCredito": 0.0
  },
  {
    "idConsignacao": 48,
    "Empresa": 1,
    "Parceiro": 44193,
    "TipoConsignacao": "V",
    "DataInicio": null,
    "DataFim": null,
    "TipoDesconto": "M",
    "Desconto": 0.0,
    "TipoPreco": "C",
    "Observacao": "",
    "Encerrado": false,
    "UsuarioAlt": "igor",
    "DataAlt": "2026-04-16T14:01:06.090000",
    "LimiteCredito": 0.0
  }
]
```

</details>

---

### `ConsignacaoItens`
**Itens das consignações** · 3,360 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `idConsignacaoItens` | bigint | **não** | — |
| `idConsignacao` | bigint | **não** | — |
| `Produto` | int | **não** | — |
| `QtdeConsig` | numeric | sim | — |
| `QtdeVendida` | numeric | sim | — |
| `QtdeDevolvida` | numeric | sim | — |
| `Saldo` | numeric | sim | — |
| `ValorPraticado` | money | sim | — |
| `DescontoPraticado` | money | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "idConsignacaoItens": 3753,
    "idConsignacao": 50,
    "Produto": 4977,
    "QtdeConsig": 200.0,
    "QtdeVendida": null,
    "QtdeDevolvida": null,
    "Saldo": 200.0,
    "ValorPraticado": 49.9,
    "DescontoPraticado": 50.0,
    "UsuarioAlt": null,
    "DataAlt": null
  },
  {
    "idConsignacaoItens": 3752,
    "idConsignacao": 9,
    "Produto": 1512,
    "QtdeConsig": 15.0,
    "QtdeVendida": null,
    "QtdeDevolvida": null,
    "Saldo": 15.0,
    "ValorPraticado": 98.0,
    "DescontoPraticado": 50.0,
    "UsuarioAlt": null,
    "DataAlt": null
  },
  {
    "idConsignacaoItens": 3751,
    "idConsignacao": 9,
    "Produto": 5069,
    "QtdeConsig": 5.0,
    "QtdeVendida": null,
    "QtdeDevolvida": null,
    "Saldo": 5.0,
    "ValorPraticado": 278.0,
    "DescontoPraticado": 50.0,
    "UsuarioAlt": null,
    "DataAlt": null
  }
]
```

</details>

---

### `ConsignacaoNotasDevolucao`
**Devoluções de consignação** · 5,860 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `IdDevolucao` | bigint | **não** | — |
| `Empresa` | int | sim | — |
| `Parceiro` | int | sim | — |
| `NotaFiscal` | int | sim | — |
| `Serie` | int | sim | — |
| `EmitidaRecebida` | char(1) | sim | — |
| `NotaOrigemEmpresa` | int | sim | — |
| `NotaOrigemNumero` | int | sim | — |
| `NotaOrigemSerie` | int | sim | — |
| `NotaOrigemParceiro` | int | sim | — |
| `NotaOrigemEmitidaRecebida` | char(1) | sim | — |
| `NotaOrigemItem` | int | sim | — |
| `Qtde` | numeric | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "IdDevolucao": 199574,
    "Empresa": 1,
    "Parceiro": 27237,
    "NotaFiscal": 86595,
    "Serie": 1,
    "EmitidaRecebida": "E",
    "NotaOrigemEmpresa": 1,
    "NotaOrigemNumero": 147438,
    "NotaOrigemSerie": 1,
    "NotaOrigemParceiro": 27237,
    "NotaOrigemEmitidaRecebida": "R",
    "NotaOrigemItem": 6,
    "Qtde": 1.0,
    "UsuarioAlt": "rafael",
    "DataAlt": "2026-05-14T14:09:23.753000"
  },
  {
    "IdDevolucao": 199573,
    "Empresa": 1,
    "Parceiro": 27237,
    "NotaFiscal": 86595,
    "Serie": 1,
    "EmitidaRecebida": "E",
    "NotaOrigemEmpresa": 1,
    "NotaOrigemNumero": 17,
    "NotaOrigemSerie": 0,
    "NotaOrigemParceiro": 27237,
    "NotaOrigemEmitidaRecebida": "E",
    "NotaOrigemItem": 65,
    "Qtde": 1.0,
    "UsuarioAlt": "rafael",
    "DataAlt": "2026-05-14T14:09:23.607000"
  },
  {
    "IdDevolucao": 199572,
    "Empresa": 1,
    "Parceiro": 27237,
    "NotaFiscal": 86595,
    "Serie": 1,
    "EmitidaRecebida": "E",
    "NotaOrigemEmpresa": 1,
    "NotaOrigemNumero": 17,
    "NotaOrigemSerie": 0,
    "NotaOrigemParceiro": 27237,
    "NotaOrigemEmitidaRecebida": "E",
    "NotaOrigemItem": 36,
    "Qtde": 1.0,
    "UsuarioAlt": "rafael",
    "DataAlt": "2026-05-14T14:09:23.473000"
  }
]
```

</details>

---

## Direito Autoral

### `DireitoAutoralFechamento`
**Fechamentos de royalties** · 503 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `IdFechamentoAutoral` | bigint | **não** | — |
| `Empresa` | int | sim | — |
| `Produto` | int | sim | — |
| `Autor` | int | sim | — |
| `TipoParticipacao` | int | sim | — |
| `DataFechamento` | datetime | sim | — |
| `DataInicial` | datetime | sim | — |
| `DataFinal` | datetime | sim | — |
| `QtdeTotal` | numeric | sim | — |
| `ValorAutoral` | money | sim | — |
| `ValorAbatimento` | money | sim | — |
| `ValorAdiantamento` | money | sim | — |
| `ValorParticipacao` | money | sim | — |
| `ValorIR` | money | sim | — |
| `ValorFechamento` | money | sim | — |
| `PeriodoApuracao` | char(1) | sim | — |
| `UltimoFechamento` | datetime | sim | — |
| `Observacao` | varchar(250) | sim | — |
| `Tiragem` | int | sim | — |
| `QtdeEntrada` | numeric | sim | — |
| `SaldoEstoque` | numeric | sim | — |
| `SaldoConsignado` | numeric | sim | — |
| `idRoyalties` | bigint | sim | — |
| `updateRoyalties` | datetime | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |
| `Agencia` | int | sim | — |
| `ValorAgencia` | money | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "IdFechamentoAutoral": 505,
    "Empresa": 1,
    "Produto": 4791,
    "Autor": 15,
    "TipoParticipacao": 1,
    "DataFechamento": "2026-04-30T23:59:59",
    "DataInicial": "2026-04-01T00:00:00",
    "DataFinal": "2026-04-30T23:59:59",
    "QtdeTotal": 33.0,
    "ValorAutoral": 123.5,
    "ValorAbatimento": 0.0,
    "ValorAdiantamento": 0.0,
    "ValorParticipacao": 0.0,
    "ValorIR": 0.0,
    "ValorFechamento": 123.5,
    "PeriodoApuracao": "M",
    "UltimoFechamento": "2026-03-31T23:59:59",
    "Observacao": "",
    "Tiragem": 0,
    "QtdeEntrada": 0.0,
    "SaldoEstoque": 1248.0,
    "SaldoConsignado": 154.0,
    "idRoyalties": null,
    "updateRoyalties": null,
    "UsuarioAlt": "ana",
    "DataAlt": "2026-05-05T10:06:36.570000",
    "Agencia": null,
    "ValorAgencia": 0.0
  },
  {
    "IdFechamentoAutoral": 504,
    "Empresa": 1,
    "Produto": 4731,
    "Autor": 15,
    "TipoParticipacao": 1,
    "DataFechamento": "2026-04-30T23:59:59",
    "DataInicial": "2026-04-01T00:00:00",
    "DataFinal": "2026-04-30T23:59:59",
    "QtdeTotal": 4096.0,
    "ValorAutoral": 18737.65,
    "ValorAbatimento": 0.0,
    "ValorAdiantamento": 0.0,
    "ValorParticipacao": 0.0,
    "ValorIR": 0.0,
    "ValorFechamento": 18737.65,
    "PeriodoApuracao": "Q",
    "UltimoFechamento": "2026-03-31T23:59:59",
    "Observacao": "",
    "Tiragem": 0,
    "QtdeEntrada": 0.0,
    "SaldoEstoque": 14.0,
    "SaldoConsignado": 853.0,
    "idRoyalties": null,
    "updateRoyalties": null,
    "UsuarioAlt": "ana",
    "DataAlt": "2026-05-05T10:06:32.963000",
    "Agencia": null,
    "ValorAgencia": 0.0
  },
  {
    "IdFechamentoAutoral": 503,
    "Empresa": 1,
    "Produto": 4648,
    "Autor": 15,
    "TipoParticipacao": 1,
    "DataFechamento": "2026-04-30T23:59:59",
    "DataInicial": "2026-04-01T00:00:00",
    "DataFinal": "2026-04-30T23:59:59",
    "QtdeTotal": 1919.0,
    "ValorAutoral": 15373.7,
    "ValorAbatimento": 0.0,
    "ValorAdiantamento": 0.0,
    "ValorParticipacao": 0.0,
    "ValorIR": 0.0,
    "ValorFechamento": 15373.7,
    "PeriodoApuracao": "M",
    "UltimoFechamento": "2026-03-31T23:59:59",
    "Observacao": "",
    "Tiragem": 0,
    "QtdeEntrada": 0.0,
    "SaldoEstoque": 912.0,
    "SaldoConsignado": 145.0,
    "idRoyalties": null,
    "updateRoyalties": null,
    "UsuarioAlt": "ana",
    "DataAlt": "2026-05-05T10:06:23.813000",
    "Agencia": null,
    "ValorAgencia": 0.0
  }
]
```

</details>

---

### `DireitoAutoralFechamentoItens`
**Itens de fechamento de royalties** · 14,039 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `idFechamentoAutoralItens` | bigint | **não** | — |
| `idFechamentoAutoral` | bigint | **não** | — |
| `EmitidaRecebida` | char(1) | **não** | — |
| `idNotaItens` | bigint | **não** | — |
| `Qtde` | numeric | sim | — |
| `ValorUnitario` | money | sim | — |
| `PercDesconto` | money | sim | — |
| `ValorDesconto` | money | sim | — |
| `ValorUnitarioLiquido` | money | sim | — |
| `ValorTotal` | money | sim | — |
| `PercentualAutoral` | money | sim | — |
| `ValorAutoral` | money | sim | — |
| `PercentualAbatimento` | money | sim | — |
| `ValorAbatimento` | money | sim | — |
| `ValorAdiantamento` | money | sim | — |
| `PercentualInvestimento` | money | sim | — |
| `ValorParticipacao` | money | sim | — |
| `TipoPreco` | int | sim | — |
| `PercentualComissao` | money | sim | — |
| `ValorComissao` | money | sim | — |
| `ValorCusto` | money | sim | — |
| `ValorIR` | money | sim | — |
| `ValorFechamento` | money | sim | — |
| `PercentualAgencia` | money | sim | — |
| `ValorAgencia` | money | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "idFechamentoAutoralItens": 14059,
    "idFechamentoAutoral": 505,
    "EmitidaRecebida": "E",
    "idNotaItens": 84238,
    "Qtde": 10.0,
    "ValorUnitario": 39.9,
    "PercDesconto": 50.0,
    "ValorDesconto": 19.95,
    "ValorUnitarioLiquido": 19.95,
    "ValorTotal": 199.5,
    "PercentualAutoral": 15.0,
    "ValorAutoral": 29.92,
    "PercentualAbatimento": 0.0,
    "ValorAbatimento": 0.0,
    "ValorAdiantamento": 0.0,
    "PercentualInvestimento": 0.0,
    "ValorParticipacao": 0.0,
    "TipoPreco": 2,
    "PercentualComissao": 0.0,
    "ValorComissao": 0.0,
    "ValorCusto": 0.0,
    "ValorIR": 0.0,
    "ValorFechamento": 29.92,
    "PercentualAgencia": null,
    "ValorAgencia": null
  },
  {
    "idFechamentoAutoralItens": 14058,
    "idFechamentoAutoral": 505,
    "EmitidaRecebida": "E",
    "idNotaItens": 83653,
    "Qtde": 1.0,
    "ValorUnitario": 27.9,
    "PercDesconto": 10.0,
    "ValorDesconto": 2.79,
    "ValorUnitarioLiquido": 25.11,
    "ValorTotal": 25.11,
    "PercentualAutoral": 15.0,
    "ValorAutoral": 3.77,
    "PercentualAbatimento": 0.0,
    "ValorAbatimento": 0.0,
    "ValorAdiantamento": 0.0,
    "PercentualInvestimento": 0.0,
    "ValorParticipacao": 0.0,
    "TipoPreco": 2,
    "PercentualComissao": 0.0,
    "ValorComissao": 0.0,
    "ValorCusto": 0.0,
    "ValorIR": 0.0,
    "ValorFechamento": 3.77,
    "PercentualAgencia": null,
    "ValorAgencia": null
  },
  {
    "idFechamentoAutoralItens": 14057,
    "idFechamentoAutoral": 505,
    "EmitidaRecebida": "E",
    "idNotaItens": 81881,
    "Qtde": 1.0,
    "ValorUnitario": 39.94,
    "PercDesconto": 36.71,
    "ValorDesconto": 14.66,
    "ValorUnitarioLiquido": 25.28,
    "ValorTotal": 25.28,
    "PercentualAutoral": 15.0,
    "ValorAutoral": 3.79,
    "PercentualAbatimento": 0.0,
    "ValorAbatimento": 0.0,
    "ValorAdiantamento": 0.0,
    "PercentualInvestimento": 0.0,
    "ValorParticipacao": 0.0,
    "TipoPreco": 2,
    "PercentualComissao": 0.0,
    "ValorComissao": 0.0,
    "ValorCusto": 0.0,
    "ValorIR": 0.0,
    "ValorFechamento": 3.79,
    "PercentualAgencia": null,
    "ValorAgencia": null
  }
]
```

</details>

---

### `DireitoAutoralParametro`
**Parâmetros de royalties** · 90 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `idParametroDireitoAutoral` | bigint | **não** | — |
| `Empresa` | int | sim | — |
| `Produto` | int | sim | — |
| `Autor` | int | sim | — |
| `TipoParticipacao` | int | sim | — |
| `TipoDireitoAutoral` | int | sim | — |
| `PeriodoApuracao` | char(1) | sim | — |
| `ValorAdiantamento` | money | sim | — |
| `PercentualAbatimento` | money | sim | — |
| `TipoFaixa` | char(1) | sim | — |
| `PercentualInvestimento` | money | sim | — |
| `Quota` | int | sim | — |
| `TipoVenda` | int | sim | — |
| `AbaterCusto` | bit | sim | — |
| `DocumentoAnexo` | varchar(255) | sim | — |
| `Observacao` | text(2147483647) | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |
| `Agencia` | int | sim | — |
| `AgenciaPercentual` | money | sim | — |
| `VencimentoContrato` | datetime | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "idParametroDireitoAutoral": 103,
    "Empresa": 1,
    "Produto": 4855,
    "Autor": 42082,
    "TipoParticipacao": 1,
    "TipoDireitoAutoral": 1,
    "PeriodoApuracao": "M",
    "ValorAdiantamento": 0.0,
    "PercentualAbatimento": 0.0,
    "TipoFaixa": "F",
    "PercentualInvestimento": 0.0,
    "Quota": 0,
    "TipoVenda": 1,
    "AbaterCusto": false,
    "DocumentoAnexo": "",
    "Observacao": "",
    "UsuarioAlt": "ana",
    "DataAlt": "2026-03-03T18:04:05.357000",
    "Agencia": null,
    "AgenciaPercentual": null,
    "VencimentoContrato": null
  },
  {
    "idParametroDireitoAutoral": 101,
    "Empresa": 1,
    "Produto": 4856,
    "Autor": 16447,
    "TipoParticipacao": 1,
    "TipoDireitoAutoral": 1,
    "PeriodoApuracao": "M",
    "ValorAdiantamento": 0.0,
    "PercentualAbatimento": 0.0,
    "TipoFaixa": "F",
    "PercentualInvestimento": 0.0,
    "Quota": 0,
    "TipoVenda": 1,
    "AbaterCusto": false,
    "DocumentoAnexo": "",
    "Observacao": "",
    "UsuarioAlt": "ana",
    "DataAlt": "2026-03-03T17:58:28.843000",
    "Agencia": null,
    "AgenciaPercentual": null,
    "VencimentoContrato": null
  },
  {
    "idParametroDireitoAutoral": 99,
    "Empresa": 1,
    "Produto": 4759,
    "Autor": 42251,
    "TipoParticipacao": 1,
    "TipoDireitoAutoral": 1,
    "PeriodoApuracao": "M",
    "ValorAdiantamento": 0.0,
    "PercentualAbatimento": 0.0,
    "TipoFaixa": "F",
    "PercentualInvestimento": 0.0,
    "Quota": 0,
    "TipoVenda": 1,
    "AbaterCusto": false,
    "DocumentoAnexo": "",
    "Observacao": "",
    "UsuarioAlt": "ana",
    "DataAlt": "2026-03-03T11:13:43.617000",
    "Agencia": null,
    "AgenciaPercentual": null,
    "VencimentoContrato": null
  }
]
```

</details>

---

## Compras

### `Entrada`
**NFs de entrada (compra)** · 217 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `IdEntrada` | bigint | **não** | — |
| `Empresa` | int | **não** | — |
| `Fornecedor` | int | **não** | — |
| `NotaFiscal` | int | **não** | — |
| `Serie` | int | **não** | — |
| `TipoEntrada` | int | sim | — |
| `ModeloNota` | int | sim | — |
| `DataEmissao` | datetime | sim | — |
| `DataRecepcao` | datetime | sim | — |
| `OperacaoFiscal` | bigint | sim | — |
| `Comprador` | int | sim | — |
| `Transportadora` | int | sim | — |
| `FretePorConta` | int | sim | — |
| `ValorFrete` | money | sim | — |
| `ValorSeguro` | money | sim | — |
| `OutrasDespesas` | money | sim | — |
| `Desconto` | money | sim | — |
| `TotalProduto` | money | sim | — |
| `TotalNota` | money | sim | — |
| `Setor` | int | sim | — |
| `SetorOrigem` | int | sim | — |
| `Situacao` | int | sim | — |
| `Portador` | int | sim | — |
| `FormaPagto` | int | sim | — |
| `Consignacao` | bigint | sim | — |
| `ChaveNFe` | varchar(44) | sim | — |
| `MoveEstoque` | bit | sim | — |
| `GeraFinanceiro` | bit | sim | — |
| `AtualizaCusto` | bit | sim | — |
| `CTeTipo` | int | sim | — |
| `CTeCodCidadeIni` | int | sim | — |
| `CTeCidadeIni` | varchar(150) | sim | — |
| `CTeCodCidadeFim` | int | sim | — |
| `CTeCidadeFim` | varchar(150) | sim | — |
| `Observacao` | text(2147483647) | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |
| `AbaterCredito` | bit | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "IdEntrada": 228,
    "Empresa": 1,
    "Fornecedor": 27055,
    "NotaFiscal": 109365,
    "Serie": 1,
    "TipoEntrada": 10,
    "ModeloNota": 55,
    "DataEmissao": "2026-05-15T00:00:00",
    "DataRecepcao": "2026-05-15T14:20:32",
    "OperacaoFiscal": 2,
    "Comprador": null,
    "Transportadora": null,
    "FretePorConta": 1,
    "ValorFrete": 0.0,
    "ValorSeguro": 0.0,
    "OutrasDespesas": 0.0,
    "Desconto": 0.0,
    "TotalProduto": 1745.9,
    "TotalNota": 1745.9,
    "Setor": 1,
    "SetorOrigem": null,
    "Situacao": 1,
    "Portador": 1,
    "FormaPagto": 1,
    "Consignacao": null,
    "ChaveNFe": "35260533579376000402550010001093651539549026",
    "MoveEstoque": true,
    "GeraFinanceiro": true,
    "AtualizaCusto": true,
    "CTeTipo": -1,
    "CTeCodCidadeIni": 0,
    "CTeCidadeIni": "",
    "CTeCodCidadeFim": 0,
    "CTeCidadeFim": "",
    "Observacao": "CF.ART.150,INC.VI, ALINEAS\"C\", \"D\", E, \"E\". CTN, ART. 9, INC. IV, ALINEA \"C\". CARGA TRIB. 0,00 (0%)-VALOR APROX. DOS TRIB. 0,00 (0%) IMUNE AO ICMS, CONF: CONTATO: COM IGOR +55 11 91855-6040 - CRM_VENDAS--PEDIDO: 5793663/SO-PRE-NF: 2168259/SO",
    "UsuarioAlt": "ana",
    "DataAlt": "2026-05-15T14:20:32.910000",
    "AbaterCredito": false
  },
  {
    "IdEntrada": 227,
    "Empresa": 1,
    "Fornecedor": 27201,
    "NotaFiscal": 9052,
    "Serie": 0,
    "TipoEntrada": 3,
    "ModeloNota": 55,
    "DataEmissao": "2026-05-12T00:00:00",
    "DataRecepcao": "2026-05-14T14:34:02",
    "OperacaoFiscal": 5,
    "Comprador": null,
    "Transportadora": null,
    "FretePorConta": 0,
    "ValorFrete": 0.0,
    "ValorSeguro": 0.0,
    "OutrasDespesas": 0.0,
    "Desconto": 577.9,
    "TotalProduto": 1155.8,
    "TotalNota": 577.9,
    "Setor": 1,
    "SetorOrigem": null,
    "Situacao": 1,
    "Portador": 1,
    "FormaPagto": 1,
    "Consignacao": 32,
    "ChaveNFe": "35260503748687000136550000000090521011317013",
    "MoveEstoque": false,
    "GeraFinanceiro": true,
    "AtualizaCusto": false,
    "CTeTipo": -1,
    "CTeCodCidadeIni": 0,
    "CTeCidadeIni": "",
    "CTeCodCidadeFim": 0,
    "CTeCidadeFim": "",
    "Observacao": "ACERTO CONFORME NF 86034 | SIMPLES FATURAMENTO DE MERCADORIA EM CONSIGNACAO - NF N 8771 DE 13/02/2026 | |Trib aprox R$: 77,72 Federal e 104,01 Estadual Fonte: IBPT/FECOMERCIO SP 81AAFF |End. Entrega: RUA MIRAGAIA, N 121 LOJA 2 BUTANTA SAO PAULO - SP CEP:05511020; Nro. Pedido: 9923; Resp.: 2 - EDMILSON; Quantidade de Itens: 12; Quantidade de Titulos: 7; ;Nao incide ICMS cf. Artigo 7 . Inciso XIII do RICMS decreto 45.490/2000. Nao incide IPI cf. Artigo 18 . Inciso i do RIPI decreto 2.637/1998. Conforme Artigo 150 Inciso VI letra D da Constituicao Federal. NAO INCIDENCIA DE ICMS CONFORME ARTIGO 7 INCISO XIII DECRETO 45490/00 RICMS/SP IMUNIDADE DO IPI REGISTRO ESPECIAL DE CONTROLE DE PAPEL IMUNE N CNPJ: 03.748.687/0001-36 - ART. 150,VI,d, da CF/1988 Lei n 11.945/2009;Operacao esta sujeita ao disposto na LC n 224, de 2025",
    "UsuarioAlt": "rafael",
    "DataAlt": "2026-05-14T14:34:04.690000",
    "AbaterCredito": false
  },
  {
    "IdEntrada": 226,
    "Empresa": 1,
    "Fornecedor": 26661,
    "NotaFiscal": 16828,
    "Serie": 1,
    "TipoEntrada": 3,
    "ModeloNota": 55,
    "DataEmissao": "2026-04-30T00:00:00",
    "DataRecepcao": "2026-05-14T14:13:42",
    "OperacaoFiscal": 5,
    "Comprador": null,
    "Transportadora": null,
    "FretePorConta": 0,
    "ValorFrete": 0.0,
    "ValorSeguro": 0.0,
    "OutrasDespesas": 0.0,
    "Desconto": 351.15,
    "TotalProduto": 702.3,
    "TotalNota": 351.15,
    "Setor": 1,
    "SetorOrigem": null,
    "Situacao": 1,
    "Portador": 1,
    "FormaPagto": 1,
    "Consignacao": 17,
    "ChaveNFe": "35260409448257000185550010000168281097703403",
    "MoveEstoque": false,
    "GeraFinanceiro": true,
    "AtualizaCusto": false,
    "CTeTipo": -1,
    "CTeCodCidadeIni": 0,
    "CTeCidadeIni": "",
    "CTeCodCidadeFim": 0,
    "CTeCidadeFim": "",
    "Observacao": "PEDIDO GERADO AUTOMATICAMENTE - PRE-FECHAMENTO DO BALANCO DE CONSIGNACAO POR RECEPCAO NF, CONTRATO 202 | SIMPLES FATURAMENTO DE MERCADORIA EM CONSIGNACAO - NF N 11182 DE 18/08/2022 | NF N 11603 DE 14/11/2022 | NF N 11775 DE 04/01/2023 | NF N 12357 DE 01/06/2023 | NF N 13167 DE 22/11/2023 | NF N 13724 DE 01/04/2024 | NF N 13782 DE 09/04/2024 | NF N 15028 DE 06/03/2025 | NF N 15168 DE 03/04/2025 | NF N 16177 DE 05/11/2025 | NF N 16795 DE 23/04/2026 | |Trib aprox R$: 47,23 Federal e 63,23 Estadual Fonte: IBPT/FECOMERCIO SP 81AAFF |End. Entrega: RUA MIRAGAIA, N 121 LOJA 2 BUTANTA SAO PAULO - SP CEP:05511020; Nro. Pedido: 14685; Quantidade de Itens: 16; Quantidade de Titulos: 9; ;Optante pelo Simples Nacional;Operacao esta sujeita ao disposto na LC n 224, de 2025",
    "UsuarioAlt": "rafael",
    "DataAlt": "2026-05-14T14:13:45.973000",
    "AbaterCredito": false
  }
]
```

</details>

---

### `EntradaItens`
**Itens das entradas** · 5,527 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `idEntradaItens` | bigint | **não** | — |
| `IdEntrada` | bigint | **não** | — |
| `Item` | int | **não** | — |
| `Produto` | int | sim | — |
| `Descricao` | varchar(150) | sim | — |
| `Unidade` | varchar(6) | sim | — |
| `Qtde` | numeric | sim | — |
| `ValorUnitario` | money | sim | — |
| `Desconto` | money | sim | — |
| `PercDesconto` | money | sim | — |
| `ValorTotal` | money | sim | — |
| `Cfop` | varchar(5) | sim | — |
| `PlanoConta` | int | sim | — |
| `CentroResultado` | int | sim | — |
| `IsEstoque` | bit | sim | — |
| `Origem` | int | sim | — |
| `IcmsCst` | varchar(3) | sim | — |
| `IcmsBase` | money | sim | — |
| `IcmsAliq` | money | sim | — |
| `IcmsValor` | money | sim | — |
| `IcmsStBase` | money | sim | — |
| `IcmsStAliq` | money | sim | — |
| `IcmsStValor` | money | sim | — |
| `IpiCst` | varchar(3) | sim | — |
| `IpiBase` | money | sim | — |
| `IpiAliq` | money | sim | — |
| `IpiValor` | money | sim | — |
| `PisCst` | varchar(3) | sim | — |
| `PisBase` | money | sim | — |
| `PisAliq` | money | sim | — |
| `PisValor` | money | sim | — |
| `CofinsCst` | varchar(3) | sim | — |
| `CofinsBase` | money | sim | — |
| `CofinsAliq` | money | sim | — |
| `CofinsValor` | money | sim | — |
| `ValorSeguro` | money | sim | — |
| `ValorFrete` | money | sim | — |
| `OutrasDespesas` | money | sim | — |
| `OutrosDescontos` | money | sim | — |
| `CustoUnitario` | money | sim | — |
| `idPedidoCompra` | bigint | sim | — |
| `idPedidoCompraItens` | bigint | sim | — |
| `RelacaoNotaEmitidaRecebida` | char(1) | sim | — |
| `RelacaoNotaEmpresa` | int | sim | — |
| `RelacaoNotaParceiro` | int | sim | — |
| `RelacaoNotaNumero` | int | sim | — |
| `RelacaoNotaSerie` | int | sim | — |
| `RelacaoNotaIdItem` | bigint | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "idEntradaItens": 5626,
    "IdEntrada": 228,
    "Item": 1,
    "Produto": 518,
    "Descricao": "BIBLIA SEMENTE - VERSAO NAA",
    "Unidade": "UN",
    "Qtde": 260.0,
    "ValorUnitario": 6.715,
    "Desconto": 0.0,
    "PercDesconto": 0.0,
    "ValorTotal": 1745.9,
    "Cfop": "1102",
    "PlanoConta": 3,
    "CentroResultado": 1,
    "IsEstoque": true,
    "Origem": 0,
    "IcmsCst": "40",
    "IcmsBase": 0.0,
    "IcmsAliq": 0.0,
    "IcmsValor": 0.0,
    "IcmsStBase": 0.0,
    "IcmsStAliq": 0.0,
    "IcmsStValor": 0.0,
    "IpiCst": "04",
    "IpiBase": 0.0,
    "IpiAliq": 0.0,
    "IpiValor": 0.0,
    "PisCst": "08",
    "PisBase": 0.0,
    "PisAliq": 0.0,
    "PisValor": 0.0,
    "CofinsCst": "08",
    "CofinsBase": 0.0,
    "CofinsAliq": 0.0,
    "CofinsValor": 0.0,
    "ValorSeguro": 0.0,
    "ValorFrete": 0.0,
    "OutrasDespesas": 0.0,
    "OutrosDescontos": null,
    "CustoUnitario": 6.715,
    "idPedidoCompra": null,
    "idPedidoCompraItens": null,
    "RelacaoNotaEmitidaRecebida": null,
    "RelacaoNotaEmpresa": null,
    "RelacaoNotaParceiro": null,
    "RelacaoNotaNumero": null,
    "RelacaoNotaSerie": null,
    "RelacaoNotaIdItem": null,
    "UsuarioAlt": "ana",
    "DataAlt": "2026-05-15T14:20:33"
  },
  {
    "idEntradaItens": 5625,
    "IdEntrada": 227,
    "Item": 7,
    "Produto": 4061,
    "Descricao": "Abigail - Série mulheres da Bíblia",
    "Unidade": "UN",
    "Qtde": 2.0,
    "ValorUnitario": 43.9,
    "Desconto": 21.95,
    "PercDesconto": 50.0,
    "ValorTotal": 43.9,
    "Cfop": "1113",
    "PlanoConta": 3,
    "CentroResultado": 1,
    "IsEstoque": true,
    "Origem": 0,
    "IcmsCst": "40",
    "IcmsBase": 0.0,
    "IcmsAliq": 0.0,
    "IcmsValor": 0.0,
    "IcmsStBase": 0.0,
    "IcmsStAliq": 0.0,
    "IcmsStValor": 0.0,
    "IpiCst": "04",
    "IpiBase": 0.0,
    "IpiAliq": 0.0,
    "IpiValor": 0.0,
    "PisCst": "08",
    "PisBase": 0.0,
    "PisAliq": 0.0,
    "PisValor": 0.0,
    "CofinsCst": "08",
    "CofinsBase": 0.0,
    "CofinsAliq": 0.0,
    "CofinsValor": 0.0,
    "ValorSeguro": 0.0,
    "ValorFrete": 0.0,
    "OutrasDespesas": 0.0,
    "OutrosDescontos": null,
    "CustoUnitario": 21.95,
    "idPedidoCompra": null,
    "idPedidoCompraItens": null,
    "RelacaoNotaEmitidaRecebida": "E",
    "RelacaoNotaEmpresa": 1,
    "RelacaoNotaParceiro": 27201,
    "RelacaoNotaNumero": 86034,
    "RelacaoNotaSerie": 1,
    "RelacaoNotaIdItem": 87343,
    "UsuarioAlt": "rafael",
    "DataAlt": "2026-05-14T14:34:04.910000"
  },
  {
    "idEntradaItens": 5624,
    "IdEntrada": 227,
    "Item": 6,
    "Produto": 4002,
    "Descricao": "ROMANOS - VOL. 9 SOBERANO PROPOSITO DE DEUS (NOVA",
    "Unidade": "UN",
    "Qtde": 1.0,
    "ValorUnitario": 92.9,
    "Desconto": 46.45,
    "PercDesconto": 50.0,
    "ValorTotal": 46.45,
    "Cfop": "1113",
    "PlanoConta": 3,
    "CentroResultado": 1,
    "IsEstoque": true,
    "Origem": 0,
    "IcmsCst": "40",
    "IcmsBase": 0.0,
    "IcmsAliq": 0.0,
    "IcmsValor": 0.0,
    "IcmsStBase": 0.0,
    "IcmsStAliq": 0.0,
    "IcmsStValor": 0.0,
    "IpiCst": "04",
    "IpiBase": 0.0,
    "IpiAliq": 0.0,
    "IpiValor": 0.0,
    "PisCst": "08",
    "PisBase": 0.0,
    "PisAliq": 0.0,
    "PisValor": 0.0,
    "CofinsCst": "08",
    "CofinsBase": 0.0,
    "CofinsAliq": 0.0,
    "CofinsValor": 0.0,
    "ValorSeguro": 0.0,
    "ValorFrete": 0.0,
    "OutrasDespesas": 0.0,
    "OutrosDescontos": null,
    "CustoUnitario": 46.45,
    "idPedidoCompra": null,
    "idPedidoCompraItens": null,
    "RelacaoNotaEmitidaRecebida": "E",
    "RelacaoNotaEmpresa": 1,
    "RelacaoNotaParceiro": 27201,
    "RelacaoNotaNumero": 86034,
    "RelacaoNotaSerie": 1,
    "RelacaoNotaIdItem": 87342,
    "UsuarioAlt": "rafael",
    "DataAlt": "2026-05-14T14:34:04.897000"
  }
]
```

</details>

---

### `EntradaVencimento`
**Vencimentos das entradas** · 477 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `idEntradaVencimento` | bigint | **não** | — |
| `IdEntrada` | bigint | **não** | — |
| `Item` | int | **não** | — |
| `Prazo` | int | sim | — |
| `DataVencto` | datetime | sim | — |
| `Valor` | money | sim | — |
| `Alterado` | bit | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "idEntradaVencimento": 515,
    "IdEntrada": 228,
    "Item": 4,
    "Prazo": 122,
    "DataVencto": "2026-09-14T00:00:00",
    "Valor": 436.47,
    "Alterado": true,
    "UsuarioAlt": "ana",
    "DataAlt": "2026-05-15T14:20:33.150000"
  },
  {
    "idEntradaVencimento": 514,
    "IdEntrada": 228,
    "Item": 3,
    "Prazo": 91,
    "DataVencto": "2026-08-14T00:00:00",
    "Valor": 436.48,
    "Alterado": true,
    "UsuarioAlt": "ana",
    "DataAlt": "2026-05-15T14:20:33.137000"
  },
  {
    "idEntradaVencimento": 513,
    "IdEntrada": 228,
    "Item": 2,
    "Prazo": 61,
    "DataVencto": "2026-07-15T00:00:00",
    "Valor": 436.47,
    "Alterado": true,
    "UsuarioAlt": "ana",
    "DataAlt": "2026-05-15T14:20:33.087000"
  }
]
```

</details>

---

## Cadastros

### `Parceiro`
**Clientes e fornecedores** · 47,000 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `Codigo` | int | **não** | — |
| `Nome` | varchar(200) | sim | — |
| `Fantasia` | varchar(100) | sim | — |
| `IsCliente` | bit | sim | — |
| `IsFornecedor` | bit | sim | — |
| `IsTransportador` | bit | sim | — |
| `IsEmpresa` | bit | sim | — |
| `IsFuncionario` | bit | sim | — |
| `IsEditora` | bit | sim | — |
| `IsAutor` | bit | sim | — |
| `Contato` | varchar(30) | sim | — |
| `FisJur` | char(1) | sim | — |
| `CnpjCpf` | varchar(14) | sim | — |
| `InscEstRg` | varchar(20) | sim | — |
| `InscMun` | varchar(20) | sim | — |
| `PerfilTributario` | int | sim | — |
| `Cep` | varchar(8) | sim | — |
| `Endereco` | varchar(100) | sim | — |
| `Numero` | varchar(10) | sim | — |
| `Complemento` | varchar(50) | sim | — |
| `Bairro` | varchar(80) | sim | — |
| `CodPais` | int | sim | — |
| `Pais` | varchar(60) | sim | — |
| `CodEstado` | int | sim | — |
| `Estado` | varchar(2) | sim | — |
| `CodCidade` | int | sim | — |
| `Cidade` | varchar(150) | sim | — |
| `Email` | varchar(250) | sim | — |
| `Fone1` | varchar(15) | sim | — |
| `Fone2` | varchar(15) | sim | — |
| `Fax` | varchar(15) | sim | — |
| `Sexo` | char(1) | sim | — |
| `DataAniversario` | datetime | sim | — |
| `DataCadastro` | datetime | sim | — |
| `Status` | int | sim | — |
| `Observacao` | text(2147483647) | sim | — |
| `CodigoAnterior` | int | sim | — |
| `EmpresaMatriz` | int | sim | — |
| `EmpresaRegimeTributario` | int | sim | — |
| `EmpresaWebSite` | varchar(100) | sim | — |
| `EmpresaCaminhoLogo` | varchar(250) | sim | — |
| `ClienteTipoCliente` | int | sim | — |
| `ClienteDesconto` | money | sim | — |
| `ClienteSituacao` | int | sim | — |
| `ClientePortador` | int | sim | — |
| `ClienteFormaPagto` | int | sim | — |
| `ClientePrazoPagto` | varchar(150) | sim | — |
| `ClienteLimiteCredito` | money | sim | — |
| `ClienteTransportadora` | int | sim | — |
| `ClienteVendedor` | int | sim | — |
| `ClienteCanalVenda` | int | sim | — |
| `FornecedorDesconto` | money | sim | — |
| `FornecedorFormaPagto` | int | sim | — |
| `FornecedorPrazoPagto` | varchar(150) | sim | — |
| `TransportadoraRNTRC` | varchar(20) | sim | — |
| `AutorBanco` | varchar(50) | sim | — |
| `AutorAgencia` | varchar(50) | sim | — |
| `AutorConta` | varchar(50) | sim | — |
| `FuncionarioBanco` | varchar(50) | sim | — |
| `FuncionarioAgencia` | varchar(50) | sim | — |
| `FuncionarioConta` | varchar(50) | sim | — |
| `idRoyalties` | bigint | sim | — |
| `updateRoyalties` | datetime | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |
| `UsuarioCadastro` | varchar(20) | sim | — |
| `AutorCalculaIRRF` | char(1) | sim | — |
| `AutorAliquotaIRRF` | money | sim | — |
| `ClienteFretePorConta` | smallint | sim | — |
| `syncRoyalties` | bit | sim | — |
| `lastEmailRoyalties` | datetime | sim | — |
| `FornecedorBanco` | varchar(50) | sim | — |
| `FornecedorAgencia` | varchar(10) | sim | — |
| `FornecedorConta` | varchar(20) | sim | — |
| `FornecedorContaDigito` | varchar(10) | sim | — |
| `FornecedorTipoContaBancaria` | varchar(30) | sim | — |
| `FornecedorTipoChavePix` | smallint | sim | — |
| `FornecedorChavePix` | varchar(150) | sim | — |
| `FuncionarioContaDigito` | varchar(10) | sim | — |
| `FuncionarioTipoContaBancaria` | varchar(30) | sim | — |
| `FuncionarioTipoChavePix` | smallint | sim | — |
| `FuncionarioChavePix` | varchar(150) | sim | — |
| `AutorContaDigito` | varchar(10) | sim | — |
| `AutorTipoContaBancaria` | varchar(30) | sim | — |
| `AutorTipoChavePix` | smallint | sim | — |
| `AutorChavePix` | varchar(150) | sim | — |
| `CodigoSeloBookInfo` | varchar(30) | sim | — |
| `CodigoSeloMB` | varchar(30) | sim | — |
| `ClienteFidelidade` | bit | sim | — |
| `AutorNomeBeneficiario` | varchar(150) | sim | — |
| `AutorCpfCnpjBeneficiario` | varchar(20) | sim | — |
| `syncMercus` | bit | sim | — |
| `FornecedorEnviaPedidoBookHub` | int | sim | — |
| `EmpresaTokenBookHub` | text(2147483647) | sim | — |
| `TipoLogradouro` | varchar(15) | sim | — |
| `RacaCor` | varchar(10) | sim | — |
| `EstadoCivil` | varchar(15) | sim | — |
| `Cbo` | varchar(15) | sim | — |
| `GrauInstrucao` | varchar(150) | sim | — |
| `Profissao` | varchar(100) | sim | — |
| `DataContrato` | datetime | sim | — |
| `Matricula` | varchar(30) | sim | — |
| `Nacionalidade` | varchar(40) | sim | — |
| `PaisNascimento` | varchar(60) | sim | — |
| `TempoResidenciaBrasil` | varchar(20) | sim | — |
| `CondicaoIngressoBrasil` | varchar(20) | sim | — |
| `PcdFisica` | char(1) | sim | — |
| `PcdVisual` | char(1) | sim | — |
| `PcdAuditiva` | char(1) | sim | — |
| `PcdMental` | char(1) | sim | — |
| `PcdIntelectual` | char(1) | sim | — |
| `Reabilitado` | char(1) | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "Codigo": 11,
    "Nome": "Vendedor Site",
    "Fantasia": "Vendedor Site",
    "IsCliente": false,
    "IsFornecedor": false,
    "IsTransportador": false,
    "IsEmpresa": false,
    "IsFuncionario": true,
    "IsEditora": false,
    "IsAutor": false,
    "Contato": "",
    "FisJur": "F",
    "CnpjCpf": "",
    "InscEstRg": "",
    "InscMun": "",
    "PerfilTributario": 9,
    "Cep": "",
    "Endereco": "",
    "Numero": "",
    "Complemento": "",
    "Bairro": "",
    "CodPais": null,
    "Pais": "",
    "CodEstado": null,
    "Estado": "",
    "CodCidade": null,
    "Cidade": "",
    "Email": "",
    "Fone1": "",
    "Fone2": "",
    "Fax": "",
    "Sexo": " ",
    "DataAniversario": null,
    "DataCadastro": "2021-04-08T16:54:02.343000",
    "Status": 1,
    "Observacao": "",
    "CodigoAnterior": null,
    "EmpresaMatriz": null,
    "EmpresaRegimeTributario": null,
    "EmpresaWebSite": null,
    "EmpresaCaminhoLogo": null,
    "ClienteTipoCliente": null,
    "ClienteDesconto": null,
    "ClienteSituacao": null,
    "ClientePortador": null,
    "ClienteFormaPagto": null,
    "ClientePrazoPagto": null,
    "ClienteLimiteCredito": null,
    "ClienteTransportadora": null,
    "ClienteVendedor": null,
    "ClienteCanalVenda": null,
    "FornecedorDesconto": null,
    "FornecedorFormaPagto": null,
    "FornecedorPrazoPagto": null,
    "TransportadoraRNTRC": null,
    "AutorBanco": null,
    "AutorAgencia": null,
    "AutorConta": null,
    "FuncionarioBanco": "",
    "FuncionarioAgencia": "",
    "FuncionarioConta": "",
    "idRoyalties": null,
    "updateRoyalties": null,
    "UsuarioAlt": "master",
    "DataAlt": "2021-04-08T16:54:07.020000",
    "UsuarioCadastro": null,
    "AutorCalculaIRRF": null,
    "AutorAliquotaIRRF": null,
    "ClienteFretePorConta": null,
    "syncRoyalties": null,
    "lastEmailRoyalties": null,
    "FornecedorBanco": null,
    "FornecedorAgencia": null,
    "FornecedorConta": null,
    "FornecedorContaDigito": null,
    "FornecedorTipoContaBancaria": null,
    "FornecedorTipoChavePix": null,
    "FornecedorChavePix": null,
    "FuncionarioContaDigito": null,
    "FuncionarioTipoContaBancaria": null,
    "FuncionarioTipoChavePix": null,
    "FuncionarioChavePix": null,
    "AutorContaDigito": null,
    "AutorTipoContaBancaria": null,
    "AutorTipoChavePix": null,
    "AutorChavePix": null,
    "CodigoSeloBookInfo": null,
    "CodigoSeloMB": null,
    "ClienteFidelidade": null,
    "AutorNomeBeneficiario": null,
    "AutorCpfCnpjBeneficiario": null,
    "syncMercus": null,
    "FornecedorEnviaPedidoBookHub": null,
    "EmpresaTokenBookHub": null,
    "TipoLogradouro": null,
    "RacaCor": null,
    "EstadoCivil": null,
    "Cbo": null,
    "GrauInstrucao": null,
    "Profissao": null,
    "DataContrato": null,
    "Matricula": null,
    "Nacionalidade": null,
    "PaisNascimento": null,
    "TempoResidenciaBrasil": null,
    "CondicaoIngressoBrasil": null,
    "PcdFisica": null,
    "PcdVisual": null,
    "PcdAuditiva": null,
    "PcdMental": null,
    "PcdIntelectual": null,
    "Reabilitado": null
  },
  {
    "Codigo": 10,
    "Nome": "CONSUMIDOR FINAL",
    "Fantasia": "CONSUMIDOR",
    "IsCliente": true,
    "IsFornecedor": false,
    "IsTransportador": false,
    "IsEmpresa": false,
    "IsFuncionario": false,
    "IsEditora": false,
    "IsAutor": false,
    "Contato": "",
    "FisJur": "F",
    "CnpjCpf": "10619783893",
    "InscEstRg": null,
    "InscMun": null,
    "PerfilTributario": null,
    "Cep": null,
    "Endereco": null,
    "Numero": null,
    "Complemento": null,
    "Bairro": null,
    "CodPais": null,
    "Pais": null,
    "CodEstado": null,
    "Estado": null,
    "CodCidade": null,
    "Cidade": null,
    "Email": null,
    "Fone1": null,
    "Fone2": null,
    "Fax": null,
    "Sexo": null,
    "DataAniversario": null,
    "DataCadastro": "2016-05-20T00:00:00",
    "Status": 1,
    "Observacao": null,
    "CodigoAnterior": null,
    "EmpresaMatriz": null,
    "EmpresaRegimeTributario": null,
    "EmpresaWebSite": null,
    "EmpresaCaminhoLogo": null,
    "ClienteTipoCliente": null,
    "ClienteDesconto": null,
    "ClienteSituacao": null,
    "ClientePortador": null,
    "ClienteFormaPagto": null,
    "ClientePrazoPagto": null,
    "ClienteLimiteCredito": null,
    "ClienteTransportadora": null,
    "ClienteVendedor": null,
    "ClienteCanalVenda": null,
    "FornecedorDesconto": null,
    "FornecedorFormaPagto": null,
    "FornecedorPrazoPagto": null,
    "TransportadoraRNTRC": null,
    "AutorBanco": null,
    "AutorAgencia": null,
    "AutorConta": null,
    "FuncionarioBanco": null,
    "FuncionarioAgencia": null,
    "FuncionarioConta": null,
    "idRoyalties": null,
    "updateRoyalties": null,
    "UsuarioAlt": "master",
    "DataAlt": "2016-05-20T14:10:20.973000",
    "UsuarioCadastro": null,
    "AutorCalculaIRRF": null,
    "AutorAliquotaIRRF": null,
    "ClienteFretePorConta": null,
    "syncRoyalties": null,
    "lastEmailRoyalties": null,
    "FornecedorBanco": null,
    "FornecedorAgencia": null,
    "FornecedorConta": null,
    "FornecedorContaDigito": null,
    "FornecedorTipoContaBancaria": null,
    "FornecedorTipoChavePix": null,
    "FornecedorChavePix": null,
    "FuncionarioContaDigito": null,
    "FuncionarioTipoContaBancaria": null,
    "FuncionarioTipoChavePix": null,
    "FuncionarioChavePix": null,
    "AutorContaDigito": null,
    "AutorTipoContaBancaria": null,
    "AutorTipoChavePix": null,
    "AutorChavePix": null,
    "CodigoSeloBookInfo": null,
    "CodigoSeloMB": null,
    "ClienteFidelidade": null,
    "AutorNomeBeneficiario": null,
    "AutorCpfCnpjBeneficiario": null,
    "syncMercus": null,
    "FornecedorEnviaPedidoBookHub": null,
    "EmpresaTokenBookHub": null,
    "TipoLogradouro": null,
    "RacaCor": null,
    "EstadoCivil": null,
    "Cbo": null,
    "GrauInstrucao": null,
    "Profissao": null,
    "DataContrato": null,
    "Matricula": null,
    "Nacionalidade": null,
    "PaisNascimento": null,
    "TempoResidenciaBrasil": null,
    "CondicaoIngressoBrasil": null,
    "PcdFisica": null,
    "PcdVisual": null,
    "PcdAuditiva": null,
    "PcdMental": null,
    "PcdIntelectual": null,
    "Reabilitado": null
  },
  {
    "Codigo": 2,
    "Nome": "LIVRARIA HEZIOM",
    "Fantasia": "LIVRARIA HEZIOM",
    "IsCliente": true,
    "IsFornecedor": false,
    "IsTransportador": false,
    "IsEmpresa": true,
    "IsFuncionario": false,
    "IsEditora": false,
    "IsAutor": false,
    "Contato": "",
    "FisJur": "J",
    "CnpjCpf": "40804477000144",
    "InscEstRg": "130597948110",
    "InscMun": "",
    "PerfilTributario": 1,
    "Cep": "05511020",
    "Endereco": "RUA MIRAGAIA",
    "Numero": "121",
    "Complemento": "",
    "Bairro": "BUTANTÃ",
    "CodPais": 1058,
    "Pais": "BRASIL",
    "CodEstado": 35,
    "Estado": "SP",
    "CodCidade": 3550308,
    "Cidade": "SÃO PAULO",
    "Email": "",
    "Fone1": "",
    "Fone2": "",
    "Fax": "",
    "Sexo": " ",
    "DataAniversario": null,
    "DataCadastro": null,
    "Status": 1,
    "Observacao": "",
    "CodigoAnterior": null,
    "EmpresaMatriz": 0,
    "EmpresaRegimeTributario": 1,
    "EmpresaWebSite": "",
    "EmpresaCaminhoLogo": "\\\\192.168.18.10\\Literarius\\logo heziom.jpeg",
    "ClienteTipoCliente": 0,
    "ClienteDesconto": null,
    "ClienteSituacao": null,
    "ClientePortador": null,
    "ClienteFormaPagto": null,
    "ClientePrazoPagto": "",
    "ClienteLimiteCredito": null,
    "ClienteTransportadora": null,
    "ClienteVendedor": null,
    "ClienteCanalVenda": null,
    "FornecedorDesconto": null,
    "FornecedorFormaPagto": null,
    "FornecedorPrazoPagto": null,
    "TransportadoraRNTRC": null,
    "AutorBanco": null,
    "AutorAgencia": null,
    "AutorConta": null,
    "FuncionarioBanco": null,
    "FuncionarioAgencia": null,
    "FuncionarioConta": null,
    "idRoyalties": null,
    "updateRoyalties": null,
    "UsuarioAlt": "master",
    "DataAlt": "2025-08-28T11:38:17.737000",
    "UsuarioCadastro": null,
    "AutorCalculaIRRF": null,
    "AutorAliquotaIRRF": null,
    "ClienteFretePorConta": 0,
    "syncRoyalties": null,
    "lastEmailRoyalties": null,
    "FornecedorBanco": null,
    "FornecedorAgencia": null,
    "FornecedorConta": null,
    "FornecedorContaDigito": null,
    "FornecedorTipoContaBancaria": null,
    "FornecedorTipoChavePix": null,
    "FornecedorChavePix": null,
    "FuncionarioContaDigito": null,
    "FuncionarioTipoContaBancaria": null,
    "FuncionarioTipoChavePix": null,
    "FuncionarioChavePix": null,
    "AutorContaDigito": null,
    "AutorTipoContaBancaria": null,
    "AutorTipoChavePix": null,
    "AutorChavePix": null,
    "CodigoSeloBookInfo": null,
    "CodigoSeloMB": null,
    "ClienteFidelidade": false,
    "AutorNomeBeneficiario": null,
    "AutorCpfCnpjBeneficiario": null,
    "syncMercus": null,
    "FornecedorEnviaPedidoBookHub": null,
    "EmpresaTokenBookHub": "",
    "TipoLogradouro": null,
    "RacaCor": null,
    "EstadoCivil": null,
    "Cbo": null,
    "GrauInstrucao": null,
    "Profissao": null,
    "DataContrato": null,
    "Matricula": null,
    "Nacionalidade": null,
    "PaisNascimento": null,
    "TempoResidenciaBrasil": null,
    "CondicaoIngressoBrasil": null,
    "PcdFisica": null,
    "PcdVisual": null,
    "PcdAuditiva": null,
    "PcdMental": null,
    "PcdIntelectual": null,
    "Reabilitado": null
  }
]
```

</details>

---

### `CanalVenda`
**Canais de venda** · 13 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `Codigo` | int | **não** | — |
| `Descricao` | varchar(50) | sim | — |
| `DestacaNFe` | bit | sim | — |
| `NFeIndicadorPresenca` | int | sim | — |
| `NFeIndicadorIntermediador` | int | sim | — |
| `NFeCnpjIntermediador` | varchar(14) | sim | — |
| `NFeIdentificacaoIntermediador` | varchar(60) | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "Codigo": 13,
    "Descricao": "EDITORIAL",
    "DestacaNFe": false,
    "NFeIndicadorPresenca": null,
    "NFeIndicadorIntermediador": null,
    "NFeCnpjIntermediador": "",
    "NFeIdentificacaoIntermediador": "",
    "UsuarioAlt": "mococa",
    "DataAlt": "2026-01-20T17:10:29.160000"
  },
  {
    "Codigo": 12,
    "Descricao": "MERCADO LIVRE - FULL",
    "DestacaNFe": false,
    "NFeIndicadorPresenca": null,
    "NFeIndicadorIntermediador": null,
    "NFeCnpjIntermediador": "",
    "NFeIdentificacaoIntermediador": "",
    "UsuarioAlt": "rafael",
    "DataAlt": "2025-10-14T19:29:06.737000"
  },
  {
    "Codigo": 11,
    "Descricao": "AMAZON - FBA",
    "DestacaNFe": false,
    "NFeIndicadorPresenca": null,
    "NFeIndicadorIntermediador": null,
    "NFeCnpjIntermediador": "",
    "NFeIdentificacaoIntermediador": "",
    "UsuarioAlt": "rafael",
    "DataAlt": "2025-10-14T19:28:51.737000"
  }
]
```

</details>

---

### `FormaPagto`
**Formas de pagamento** · 13 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `Codigo` | int | **não** | — |
| `Descricao` | varchar(100) | sim | — |
| `Avista` | bit | sim | — |
| `CodigoExterno` | varchar(5) | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |
| `DataAlt` | datetime | sim | — |
| `Taxa` | money | sim | — |
| `Prazo` | int | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "Codigo": 13,
    "Descricao": "MERCADO PAGO",
    "Avista": false,
    "CodigoExterno": "03",
    "UsuarioAlt": "master",
    "DataAlt": "2025-09-16T15:14:09.057000",
    "Taxa": 0.0,
    "Prazo": 0
  },
  {
    "Codigo": 12,
    "Descricao": "PIX",
    "Avista": true,
    "CodigoExterno": "17",
    "UsuarioAlt": "master",
    "DataAlt": "2025-09-01T12:09:45.590000",
    "Taxa": 0.0,
    "Prazo": 0
  },
  {
    "Codigo": 11,
    "Descricao": "BOLETO SANTANDER",
    "Avista": false,
    "CodigoExterno": "15",
    "UsuarioAlt": "master",
    "DataAlt": "2025-08-27T14:03:38.340000",
    "Taxa": 0.0,
    "Prazo": 0
  }
]
```

</details>

---

### `TipoCliente`
**Tipos de cliente** · 7 linhas

| Coluna | Tipo | Nullable | Default |
|---|---|---|---|
| `Codigo` | int | **não** | — |
| `Descricao` | varchar(50) | sim | — |
| `DataAlt` | datetime | sim | — |
| `UsuarioAlt` | varchar(20) | sim | — |

<details>
<summary>Amostra (3 linhas)</summary>

```json
[
  {
    "Codigo": 7,
    "Descricao": "Empresas",
    "DataAlt": "2026-03-05T14:59:42.977000",
    "UsuarioAlt": "mococa"
  },
  {
    "Codigo": 6,
    "Descricao": "Colaborador",
    "DataAlt": "2025-09-16T09:38:19.630000",
    "UsuarioAlt": "rafael"
  },
  {
    "Codigo": 5,
    "Descricao": "PF",
    "DataAlt": "2025-09-16T09:38:11.563000",
    "UsuarioAlt": "rafael"
  }
]
```

</details>

---
