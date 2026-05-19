---
tags: [literarius, schema, banco-de-dados, consignacao]
status: mapeado
criado: 2026-05-18
fonte: pymssql direto — 192.168.18.10:1433
---

# Literarius DB — Módulo Consignação

> Schema mapeado diretamente do banco SQL Server em produção (2026-05-18).
> Colunas, tipos reais e amostras de dados incluídos.

---

## `Consignacao`

**Consignações abertas** · **50 linhas** · 14 colunas

> 50 consignações abertas (cabeçalho). Cliente, data de saída, prazo de devolução, status.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `idConsignacao` | bigint | INTEGER | **não** | PK |
| `Empresa` | int | INTEGER | **não** |  |
| `Parceiro` | int | INTEGER | sim |  |
| `TipoConsignacao` | char(1) | TEXT | sim | enum |
| `DataInicio` | datetime | TIMESTAMPTZ | sim | data |
| `DataFim` | datetime | TIMESTAMPTZ | sim | data |
| `TipoDesconto` | char(1) | TEXT | sim | enum |
| `Desconto` | money | NUMERIC | sim |  |
| `TipoPreco` | char(1) | TEXT | sim | valor monetário |
| `Observacao` | text(2147483647) | TEXT | sim |  |
| `Encerrado` | bit | BOOLEAN | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |
| `LimiteCredito` | money | NUMERIC | sim |  |

**Campos-chave:**

- PK: `idConsignacao`
- Datas: `DataInicio`, `DataFim`, `DataAlt`
- Valores: `TipoPreco`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `ConsignacaoItens`

**Itens das consignações** · **3,360 linhas** · 11 colunas

> 3.360 itens — os R$1,15M em livros fora. Produto, quantidade enviada, quantidade devolvida, saldo em aberto.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `idConsignacaoItens` | bigint | INTEGER | **não** | PK |
| `idConsignacao` | bigint | INTEGER | **não** | PK |
| `Produto` | int | INTEGER | **não** |  |
| `QtdeConsig` | numeric | NUMERIC | sim |  |
| `QtdeVendida` | numeric | NUMERIC | sim |  |
| `QtdeDevolvida` | numeric | NUMERIC | sim |  |
| `Saldo` | numeric | NUMERIC | sim |  |
| `ValorPraticado` | money | NUMERIC | sim | valor monetário |
| `DescontoPraticado` | money | NUMERIC | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |

**Campos-chave:**

- PK: `idConsignacaoItens`, `idConsignacao`
- Datas: `DataAlt`
- Valores: `Saldo`, `ValorPraticado`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `ConsignacaoNotasDevolucao`

**Devoluções de consignação** · **5,860 linhas** · 15 colunas

> 5.860 devoluções registradas. Histórico completo de retorno de consignações. Base para calcular taxa de devolução por cliente e canal.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `IdDevolucao` | bigint | INTEGER | **não** | PK |
| `Empresa` | int | INTEGER | sim |  |
| `Parceiro` | int | INTEGER | sim |  |
| `NotaFiscal` | int | INTEGER | sim |  |
| `Serie` | int | INTEGER | sim |  |
| `EmitidaRecebida` | char(1) | TEXT | sim |  |
| `NotaOrigemEmpresa` | int | INTEGER | sim |  |
| `NotaOrigemNumero` | int | INTEGER | sim |  |
| `NotaOrigemSerie` | int | INTEGER | sim |  |
| `NotaOrigemParceiro` | int | INTEGER | sim |  |
| `NotaOrigemEmitidaRecebida` | char(1) | TEXT | sim |  |
| `NotaOrigemItem` | int | INTEGER | sim |  |
| `Qtde` | numeric | NUMERIC | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |

**Campos-chave:**

- PK: `IdDevolucao`
- Datas: `DataAlt`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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
