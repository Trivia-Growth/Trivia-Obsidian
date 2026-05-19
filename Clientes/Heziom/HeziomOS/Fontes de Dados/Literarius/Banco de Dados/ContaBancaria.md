---
tags: [literarius, schema, banco-de-dados, financeiro]
status: mapeado
criado: 2026-05-18
fonte: pymssql direto — 192.168.18.10:1433
---

# Literarius DB — Módulo Financeiro — Banco e Caixa

> Schema mapeado diretamente do banco SQL Server em produção (2026-05-18).
> Colunas, tipos reais e amostras de dados incluídos.

---

## `ContaBancaria`

**Contas bancárias** · **11 linhas** · 14 colunas

> Contas bancárias cadastradas. 11 registros = contas ativas (Santander, Stone, etc.). Saldo calculado via lançamentos.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `idContaBancaria` | int | INTEGER | **não** | PK |
| `Empresa` | int | INTEGER | sim |  |
| `Descricao` | varchar(50) | TEXT | sim |  |
| `BancoNumero` | varchar(3) | TEXT | sim |  |
| `BancoDescricao` | varchar(20) | TEXT | sim |  |
| `AgenciaNumero` | varchar(10) | TEXT | sim |  |
| `AgenciaDigito` | varchar(3) | TEXT | sim |  |
| `ContaNumero` | varchar(20) | TEXT | sim |  |
| `ContaDigito` | varchar(3) | TEXT | sim |  |
| `DataInicial` | datetime | TIMESTAMPTZ | sim | data |
| `SaldoInicial` | money | NUMERIC | sim |  |
| `Inativa` | bit | BOOLEAN | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |

**Campos-chave:**

- PK: `idContaBancaria`
- Datas: `DataInicial`, `DataAlt`
- Valores: `SaldoInicial`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `ContaBancariaLancamento`

**Lançamentos bancários** · **5,188 linhas** · 18 colunas

> Lançamentos bancários internos. Base para saldo bancário atual e extrato interno. Complementa o OFX externo.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `idLanctoContaBancaria` | bigint | INTEGER | **não** | PK |
| `Empresa` | int | INTEGER | sim |  |
| `Numero` | int | INTEGER | sim |  |
| `TipoLancto` | char(1) | TEXT | sim | enum |
| `DataLancto` | datetime | TIMESTAMPTZ | sim | data |
| `Documento` | varchar(250) | TEXT | sim |  |
| `Descricao` | varchar(30) | TEXT | sim |  |
| `ContaBancaria` | int | INTEGER | sim |  |
| `ContaBancariaDestino` | int | INTEGER | sim |  |
| `Valor` | money | NUMERIC | sim | valor monetário |
| `CentroResultado` | int | INTEGER | sim |  |
| `PlanoConta` | int | INTEGER | sim |  |
| `Liquidado` | bit | BOOLEAN | sim |  |
| `Conciliado` | bit | BOOLEAN | sim |  |
| `idExtratoBanco` | varchar(250) | TEXT | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |
| `idOrigemTransferencia` | int | INTEGER | sim |  |

**Campos-chave:**

- PK: `idLanctoContaBancaria`
- Datas: `DataLancto`, `DataAlt`
- Valores: `Valor`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `ControleCaixa`

**Abertura/fechamento de caixa** · **502 linhas** · 10 colunas

> Abertura e fechamento do caixa físico (PDV). 502 registros = operações de caixa desde o início.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `idControleCaixa` | bigint | INTEGER | **não** | PK |
| `Empresa` | int | INTEGER | sim |  |
| `Caixa` | int | INTEGER | sim |  |
| `DataAbertura` | datetime | TIMESTAMPTZ | sim | data |
| `ValorAbertura` | money | NUMERIC | sim | valor monetário |
| `UsuarioAbertura` | varchar(20) | TEXT | sim |  |
| `DataFechamento` | datetime | TIMESTAMPTZ | sim | data |
| `ValorFechamento` | money | NUMERIC | sim | valor monetário |
| `UsuarioFechamento` | varchar(20) | TEXT | sim |  |
| `Justificativa` | varchar(250) | TEXT | sim |  |

**Campos-chave:**

- PK: `idControleCaixa`
- Datas: `DataAbertura`, `DataFechamento`
- Valores: `ValorAbertura`, `ValorFechamento`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `ControleCaixaItens`

**Itens do caixa (vendas balcão)** · **1,861 linhas** · 6 colunas

> Itens de cada operação de caixa — vendas no balcão, recebimentos, sangrias. Faturamento canal físico.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `idControleCaixaItens` | bigint | INTEGER | **não** | PK |
| `idControleCaixa` | bigint | INTEGER | **não** | PK |
| `Valor` | money | NUMERIC | sim | valor monetário |
| `ValorFechamento` | money | NUMERIC | sim | valor monetário |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |

**Campos-chave:**

- PK: `idControleCaixaItens`, `idControleCaixa`
- Datas: `DataAlt`
- Valores: `Valor`, `ValorFechamento`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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
