---
tags: [literarius, schema, banco-de-dados, financeiro]
status: mapeado
criado: 2026-05-18
fonte: pymssql direto — 192.168.18.10:1433
---

# Literarius DB — Módulo Financeiro — Títulos

> Schema mapeado diretamente do banco SQL Server em produção (2026-05-18).
> Colunas, tipos reais e amostras de dados incluídos.

---

## `TituloFinanceiro`

**Contas a pagar e receber** · **50,263 linhas** · 41 colunas

> Central do financeiro. Todo A/P e A/R passa aqui. Campo `tipoTitulo`: R=Receber, P=Pagar. Campo `pago` indica liquidação. Base para DRE, fluxo de caixa e aging.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `idTituloFinanceiro` | bigint | INTEGER | **não** | PK |
| `TipoTitulo` | char(1) | TEXT | sim | enum |
| `Empresa` | int | INTEGER | sim |  |
| `Numero` | int | INTEGER | sim |  |
| `Parceiro` | int | INTEGER | sim |  |
| `Emissao` | datetime | TIMESTAMPTZ | sim |  |
| `Vencimento` | datetime | TIMESTAMPTZ | sim |  |
| `Portador` | int | INTEGER | sim |  |
| `Situacao` | int | INTEGER | sim | enum |
| `Moeda` | varchar(3) | TEXT | sim |  |
| `FormaPagto` | int | INTEGER | sim |  |
| `ContaBancaria` | int | INTEGER | sim |  |
| `Valor` | money | NUMERIC | sim | valor monetário |
| `ValorPago` | money | NUMERIC | sim | valor monetário |
| `ValorAbatido` | money | NUMERIC | sim | valor monetário |
| `Boleto` | varchar(50) | TEXT | sim |  |
| `Impresso` | bit | BOOLEAN | sim |  |
| `idCobrancaConfig` | int | INTEGER | sim |  |
| `idRemessa` | int | INTEGER | sim |  |
| `DataRemessa` | datetime | TIMESTAMPTZ | sim | data |
| `Referencia` | varchar(50) | TEXT | sim |  |
| `Pago` | bit | BOOLEAN | sim |  |
| `Origem` | int | INTEGER | sim |  |
| `OrigemIdRegistro` | bigint | INTEGER | sim |  |
| `TipoParcelamento` | char(1) | TEXT | sim | enum |
| `Parcela` | int | INTEGER | sim |  |
| `TotalParcela` | int | INTEGER | sim | valor monetário |
| `idPrimeiraParcela` | bigint | INTEGER | sim |  |
| `Observacao` | text(2147483647) | TEXT | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |
| `Agrupado` | bit | BOOLEAN | sim |  |
| `UsuarioAgrupamento` | varchar(20) | TEXT | sim |  |
| `DataAgrupamento` | datetime | TIMESTAMPTZ | sim | data |
| `idContasPagarConfig` | int | INTEGER | sim |  |
| `CodBarrasBoleto` | varchar(60) | TEXT | sim |  |
| `ValorAcrescimo` | money | NUMERIC | sim | valor monetário |
| `VencimentoOriginal` | datetime | TIMESTAMPTZ | sim |  |
| `ValorTaxa` | money | NUMERIC | sim | valor monetário |
| `DataPermissao` | datetime | TIMESTAMPTZ | sim | data |
| `UsuarioPermissao` | varchar(50) | TEXT | sim |  |

**Campos-chave:**

- PK: `idTituloFinanceiro`
- Datas: `DataRemessa`, `DataAlt`, `DataAgrupamento`, `DataPermissao`
- Valores: `Valor`, `ValorPago`, `ValorAbatido`, `TotalParcela`, `ValorAcrescimo`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `TituloFinanceiroBaixa`

**Baixas / liquidações** · **30,616 linhas** · 25 colunas

> Registra cada liquidação de um título. Um título pode ter múltiplas baixas (parcelas). Base para conciliação bancária.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `idTituloFinanceiroBaixa` | bigint | INTEGER | **não** | PK |
| `idTituloFinanceiro` | bigint | INTEGER | sim |  |
| `Item` | int | INTEGER | sim |  |
| `DataBaixa` | datetime | TIMESTAMPTZ | sim | data |
| `FormaPagto` | int | INTEGER | sim |  |
| `ContaBancaria` | int | INTEGER | sim |  |
| `ValorBaixa` | money | NUMERIC | sim | valor monetário |
| `ValorDesconto` | money | NUMERIC | sim | valor monetário |
| `ValorAbatimento` | money | NUMERIC | sim | valor monetário |
| `ValorAcrescimo` | money | NUMERIC | sim | valor monetário |
| `ValorMulta` | money | NUMERIC | sim | valor monetário |
| `ValorJuros` | money | NUMERIC | sim | valor monetário |
| `TipoBaixa` | int | INTEGER | sim | enum |
| `Observacoes` | varchar(250) | TEXT | sim |  |
| `Origem` | int | INTEGER | sim |  |
| `OrigemIdRegistro` | bigint | INTEGER | sim |  |
| `OrigemIdRegistroItens` | bigint | INTEGER | sim |  |
| `DataBanco` | datetime | TIMESTAMPTZ | sim | data |
| `Conciliado` | bit | BOOLEAN | sim |  |
| `idExtratoBanco` | varchar(250) | TEXT | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |
| `ValorTaxa` | money | NUMERIC | sim | valor monetário |
| `DataPermissao` | datetime | TIMESTAMPTZ | sim | data |
| `UsuarioPermissao` | varchar(50) | TEXT | sim |  |

**Campos-chave:**

- PK: `idTituloFinanceiroBaixa`
- Datas: `DataBaixa`, `DataBanco`, `DataAlt`, `DataPermissao`
- Valores: `ValorBaixa`, `ValorDesconto`, `ValorAbatimento`, `ValorAcrescimo`, `ValorMulta`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `TituloFinanceiroRateio`

**Rateio por plano de conta** · **50,723 linhas** · 8 colunas

> Distribui o valor do título entre planos de conta e centros de resultado. **Essencial para o DRE** — sem o rateio não há classificação contábil.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `idTituloFinanceiroRateio` | bigint | INTEGER | **não** | PK |
| `idTituloFinanceiro` | bigint | INTEGER | sim |  |
| `PlanoConta` | int | INTEGER | sim |  |
| `CentroResultado` | int | INTEGER | sim |  |
| `Percentual` | money | NUMERIC | sim |  |
| `Valor` | money | NUMERIC | sim | valor monetário |
| `Sinal` | varchar(1) | TEXT | sim |  |
| `AlteradoManual` | bit | BOOLEAN | sim |  |

**Campos-chave:**

- PK: `idTituloFinanceiroRateio`
- Valores: `Valor`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `TituloFinanceiroBaixaRateio`

**Rateio das baixas** · **30,849 linhas** · 11 colunas

> Rateio das baixas — distribui o valor pago entre categorias contábeis.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `idTituloFinanceiroBaixaRateio` | bigint | INTEGER | **não** | PK |
| `idTituloFinanceiroBaixa` | bigint | INTEGER | sim |  |
| `PlanoConta` | int | INTEGER | sim |  |
| `CentroResultado` | int | INTEGER | sim |  |
| `ValorBaixa` | money | NUMERIC | sim | valor monetário |
| `ValorDesconto` | money | NUMERIC | sim | valor monetário |
| `ValorAbatimento` | money | NUMERIC | sim | valor monetário |
| `ValorAcrescimo` | money | NUMERIC | sim | valor monetário |
| `ValorMulta` | money | NUMERIC | sim | valor monetário |
| `ValorJuros` | money | NUMERIC | sim | valor monetário |
| `ValorTaxa` | money | NUMERIC | sim | valor monetário |

**Campos-chave:**

- PK: `idTituloFinanceiroBaixaRateio`
- Valores: `ValorBaixa`, `ValorDesconto`, `ValorAbatimento`, `ValorAcrescimo`, `ValorMulta`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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
