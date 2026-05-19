---
tags: [literarius, schema, banco-de-dados, direito-autoral]
status: mapeado
criado: 2026-05-18
fonte: pymssql direto — 192.168.18.10:1433
---

# Literarius DB — Módulo Direito Autoral — Royalties

> Schema mapeado diretamente do banco SQL Server em produção (2026-05-18).
> Colunas, tipos reais e amostras de dados incluídos.

---

## `DireitoAutoralFechamento`

**Fechamentos de royalties** · **503 linhas** · 28 colunas

> 503 fechamentos de royalties por período. Cabeçalho com autor, período, total calculado, status de pagamento.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `IdFechamentoAutoral` | bigint | INTEGER | **não** | PK |
| `Empresa` | int | INTEGER | sim |  |
| `Produto` | int | INTEGER | sim |  |
| `Autor` | int | INTEGER | sim |  |
| `TipoParticipacao` | int | INTEGER | sim | enum |
| `DataFechamento` | datetime | TIMESTAMPTZ | sim | data |
| `DataInicial` | datetime | TIMESTAMPTZ | sim | data |
| `DataFinal` | datetime | TIMESTAMPTZ | sim | data |
| `QtdeTotal` | numeric | NUMERIC | sim | valor monetário |
| `ValorAutoral` | money | NUMERIC | sim | valor monetário |
| `ValorAbatimento` | money | NUMERIC | sim | valor monetário |
| `ValorAdiantamento` | money | NUMERIC | sim | valor monetário |
| `ValorParticipacao` | money | NUMERIC | sim | valor monetário |
| `ValorIR` | money | NUMERIC | sim | valor monetário |
| `ValorFechamento` | money | NUMERIC | sim | valor monetário |
| `PeriodoApuracao` | char(1) | TEXT | sim |  |
| `UltimoFechamento` | datetime | TIMESTAMPTZ | sim |  |
| `Observacao` | varchar(250) | TEXT | sim |  |
| `Tiragem` | int | INTEGER | sim |  |
| `QtdeEntrada` | numeric | NUMERIC | sim |  |
| `SaldoEstoque` | numeric | NUMERIC | sim |  |
| `SaldoConsignado` | numeric | NUMERIC | sim |  |
| `idRoyalties` | bigint | INTEGER | sim |  |
| `updateRoyalties` | datetime | TIMESTAMPTZ | sim | data |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |
| `Agencia` | int | INTEGER | sim |  |
| `ValorAgencia` | money | NUMERIC | sim | valor monetário |

**Campos-chave:**

- PK: `IdFechamentoAutoral`
- Datas: `DataFechamento`, `DataInicial`, `DataFinal`, `updateRoyalties`, `DataAlt`
- Valores: `QtdeTotal`, `ValorAutoral`, `ValorAbatimento`, `ValorAdiantamento`, `ValorParticipacao`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `DireitoAutoralFechamentoItens`

**Itens de fechamento de royalties** · **14,039 linhas** · 25 colunas

> 14.039 itens. Detalhe por produto/tiragem: quantidade vendida × percentual = royalty por título. **Custo real de cada livro para o DRE.**

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `idFechamentoAutoralItens` | bigint | INTEGER | **não** | PK |
| `idFechamentoAutoral` | bigint | INTEGER | **não** | PK |
| `EmitidaRecebida` | char(1) | TEXT | **não** |  |
| `idNotaItens` | bigint | INTEGER | **não** | PK |
| `Qtde` | numeric | NUMERIC | sim |  |
| `ValorUnitario` | money | NUMERIC | sim | valor monetário |
| `PercDesconto` | money | NUMERIC | sim |  |
| `ValorDesconto` | money | NUMERIC | sim | valor monetário |
| `ValorUnitarioLiquido` | money | NUMERIC | sim | valor monetário |
| `ValorTotal` | money | NUMERIC | sim | valor monetário |
| `PercentualAutoral` | money | NUMERIC | sim |  |
| `ValorAutoral` | money | NUMERIC | sim | valor monetário |
| `PercentualAbatimento` | money | NUMERIC | sim |  |
| `ValorAbatimento` | money | NUMERIC | sim | valor monetário |
| `ValorAdiantamento` | money | NUMERIC | sim | valor monetário |
| `PercentualInvestimento` | money | NUMERIC | sim |  |
| `ValorParticipacao` | money | NUMERIC | sim | valor monetário |
| `TipoPreco` | int | INTEGER | sim | valor monetário |
| `PercentualComissao` | money | NUMERIC | sim |  |
| `ValorComissao` | money | NUMERIC | sim | valor monetário |
| `ValorCusto` | money | NUMERIC | sim | valor monetário |
| `ValorIR` | money | NUMERIC | sim | valor monetário |
| `ValorFechamento` | money | NUMERIC | sim | valor monetário |
| `PercentualAgencia` | money | NUMERIC | sim |  |
| `ValorAgencia` | money | NUMERIC | sim | valor monetário |

**Campos-chave:**

- PK: `idFechamentoAutoralItens`, `idFechamentoAutoral`, `idNotaItens`
- Valores: `ValorUnitario`, `ValorDesconto`, `ValorUnitarioLiquido`, `ValorTotal`, `ValorAutoral`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `DireitoAutoralParametro`

**Parâmetros de royalties** · **90 linhas** · 21 colunas

> 90 parâmetros de royalties — percentuais por autor, tipo de venda (física, e-commerce, consignação).

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `idParametroDireitoAutoral` | bigint | INTEGER | **não** | PK |
| `Empresa` | int | INTEGER | sim |  |
| `Produto` | int | INTEGER | sim |  |
| `Autor` | int | INTEGER | sim |  |
| `TipoParticipacao` | int | INTEGER | sim | enum |
| `TipoDireitoAutoral` | int | INTEGER | sim | enum |
| `PeriodoApuracao` | char(1) | TEXT | sim |  |
| `ValorAdiantamento` | money | NUMERIC | sim | valor monetário |
| `PercentualAbatimento` | money | NUMERIC | sim |  |
| `TipoFaixa` | char(1) | TEXT | sim | enum |
| `PercentualInvestimento` | money | NUMERIC | sim |  |
| `Quota` | int | INTEGER | sim |  |
| `TipoVenda` | int | INTEGER | sim | enum |
| `AbaterCusto` | bit | BOOLEAN | sim |  |
| `DocumentoAnexo` | varchar(255) | TEXT | sim |  |
| `Observacao` | text(2147483647) | TEXT | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |
| `Agencia` | int | INTEGER | sim |  |
| `AgenciaPercentual` | money | NUMERIC | sim |  |
| `VencimentoContrato` | datetime | TIMESTAMPTZ | sim |  |

**Campos-chave:**

- PK: `idParametroDireitoAutoral`
- Datas: `DataAlt`
- Valores: `ValorAdiantamento`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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
