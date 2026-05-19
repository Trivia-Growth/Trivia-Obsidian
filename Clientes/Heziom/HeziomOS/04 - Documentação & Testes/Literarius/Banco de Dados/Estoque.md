---
tags: [literarius, schema, banco-de-dados, estoque]
status: mapeado
criado: 2026-05-18
fonte: pymssql direto — 192.168.18.10:1433
---

# Literarius DB — Módulo Estoque — Saldo e Movimentação

> Schema mapeado diretamente do banco SQL Server em produção (2026-05-18).
> Colunas, tipos reais e amostras de dados incluídos.

---

## `Estoque`

**Saldo atual por produto/setor** · **6,521 linhas** · 9 colunas

> 6.521 registros de saldo atual por empresa/setor/produto. É a fonte do dashboard CEO. Atualizado em tempo real pelo ERP a cada movimentação.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `Empresa` | int | INTEGER | **não** |  |
| `Setor` | int | INTEGER | **não** |  |
| `Produto` | int | INTEGER | **não** |  |
| `QtdeFisica` | numeric | NUMERIC | sim |  |
| `QtdeRecebido` | numeric | NUMERIC | sim |  |
| `QtdeEnviado` | numeric | NUMERIC | sim |  |
| `SaldoProprio` | numeric | NUMERIC | sim |  |
| `UsuarioAlt` | varchar(50) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |

**Campos-chave:**

- Datas: `DataAlt`
- Valores: `SaldoProprio`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `MovimentoEstoque`

**Histórico completo de movimentação** · **163,604 linhas** · 16 colunas

> **163.604 movimentos** — maior tabela operacional. Histórico completo: data, tipo de movimento (venda, entrada, ajuste, transferência), quantidade, custo. Base para giro de estoque e cobertura em dias.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `IdMovimento` | bigint | INTEGER | **não** | PK |
| `Empresa` | int | INTEGER | sim |  |
| `Setor` | int | INTEGER | sim |  |
| `Box` | varchar(20) | TEXT | **não** |  |
| `DataMovto` | datetime | TIMESTAMPTZ | sim | data |
| `EntSai` | char(1) | TEXT | sim |  |
| `Produto` | int | INTEGER | sim |  |
| `Qtde` | numeric | NUMERIC | sim |  |
| `Saldo` | numeric | NUMERIC | sim |  |
| `Origem` | int | INTEGER | sim |  |
| `OrigemIdRegistro` | bigint | INTEGER | sim |  |
| `OrigemIdRegistroItens` | bigint | INTEGER | sim |  |
| `Consignacao` | bigint | INTEGER | sim |  |
| `Observacao` | text(2147483647) | TEXT | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |

**Campos-chave:**

- PK: `IdMovimento`
- Datas: `DataMovto`, `DataAlt`
- Valores: `Saldo`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `LancamentoEstoque`

**Lançamentos manuais de estoque** · **720 linhas** · 10 colunas

> 720 lançamentos manuais de estoque (ajustes, perdas, brindes). Complementa o MovimentoEstoque.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `IdLanctoEstoque` | bigint | INTEGER | **não** | PK |
| `Empresa` | int | INTEGER | **não** |  |
| `Numero` | int | INTEGER | **não** |  |
| `DataLancto` | datetime | TIMESTAMPTZ | sim | data |
| `Setor` | int | INTEGER | sim |  |
| `TipoLanctoEstoque` | int | INTEGER | sim | enum |
| `EntSai` | char(1) | TEXT | sim |  |
| `Observacao` | varchar(250) | TEXT | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |

**Campos-chave:**

- PK: `IdLanctoEstoque`
- Datas: `DataLancto`, `DataAlt`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `Inventario`

**Inventários realizados** · **1,200 linhas** · 10 colunas

> 1.200 inventários realizados. Registro de quando e como foi feito cada contagem.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `idInventario` | bigint | INTEGER | **não** | PK |
| `Empresa` | int | INTEGER | sim |  |
| `Numero` | int | INTEGER | sim |  |
| `DataInventario` | datetime | TIMESTAMPTZ | sim | data |
| `Setor` | int | INTEGER | sim |  |
| `Box` | varchar(20) | TEXT | sim |  |
| `Processado` | bit | BOOLEAN | **não** |  |
| `Observacao` | varchar(250) | TEXT | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |

**Campos-chave:**

- PK: `idInventario`
- Datas: `DataInventario`, `DataAlt`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `InventarioItens`

**Itens dos inventários** · **9,176 linhas** · 11 colunas

> 9.176 itens inventariados. Quantidade contada vs. quantidade no sistema — base para ajuste de estoque.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `idInventarioItens` | bigint | INTEGER | **não** | PK |
| `idInventario` | bigint | INTEGER | sim |  |
| `Item` | int | INTEGER | sim |  |
| `Produto` | int | INTEGER | sim |  |
| `Descricao` | varchar(150) | TEXT | sim |  |
| `Unidade` | varchar(6) | TEXT | sim |  |
| `QtdeContada` | numeric | NUMERIC | sim |  |
| `SaldoEstoque` | numeric | NUMERIC | sim |  |
| `QtdeDiferenca` | numeric | NUMERIC | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |

**Campos-chave:**

- PK: `idInventarioItens`
- Datas: `DataAlt`
- Valores: `SaldoEstoque`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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
