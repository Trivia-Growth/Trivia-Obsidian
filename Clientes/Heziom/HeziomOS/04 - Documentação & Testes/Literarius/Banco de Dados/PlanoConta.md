---
tags: [literarius, schema, banco-de-dados, financeiro]
status: mapeado
criado: 2026-05-18
fonte: pymssql direto — 192.168.18.10:1433
---

# Literarius DB — Módulo Financeiro — Plano de Contas

> Schema mapeado diretamente do banco SQL Server em produção (2026-05-18).
> Colunas, tipos reais e amostras de dados incluídos.

---

## `PlanoConta`

**Plano de contas (DRE)** · **115 linhas** · 10 colunas

> Estrutura contábil. 115 registros. ⚠️ **BUG CRÍTICO**: campo `tipoCategoria = "A"` em todos os registros — deveria ser R=Receita ou D=Despesa. Bloqueia o DRE automático. Depende de correção pela equipe Literarius.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `Codigo` | int | INTEGER | **não** |  |
| `Descricao` | varchar(100) | TEXT | sim |  |
| `Grupo` | varchar(5) | TEXT | sim |  |
| `ContaContabil` | varchar(20) | TEXT | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |
| `PlanoContaPai` | int | INTEGER | sim |  |
| `Nivel` | smallint | INTEGER | sim |  |
| `TipoCategoria` | varchar(1) | TEXT | sim | enum |
| `GrupoDRE` | int | INTEGER | sim |  |

**Campos-chave:**

- Datas: `DataAlt`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `CentroResultado`

**Centros de resultado** · **13 linhas** · 4 colunas

> 13 centros de resultado. Permite segmentar DRE por área (editorial, e-commerce, livraria física, etc.).

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `Codigo` | int | INTEGER | **não** |  |
| `Descricao` | varchar(50) | TEXT | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |

**Campos-chave:**

- Datas: `DataAlt`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `AjusteManualCusto`

**Ajustes manuais de CMV** · **2,649 linhas** · 10 colunas

> 2.649 ajustes manuais de CMV. Entram no cálculo de margem — sem isso o DRE de resultado tem distorção.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `idAjusteCusto` | bigint | INTEGER | **não** | PK |
| `Empresa` | int | INTEGER | **não** |  |
| `Produto` | int | INTEGER | **não** |  |
| `DataAjuste` | datetime | TIMESTAMPTZ | sim | data |
| `CustoAnterior` | money | NUMERIC | sim |  |
| `SaldoEstoque` | numeric | NUMERIC | sim |  |
| `CustoAjuste` | money | NUMERIC | sim |  |
| `Observacao` | varchar(255) | TEXT | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |

**Campos-chave:**

- PK: `idAjusteCusto`
- Datas: `DataAjuste`, `DataAlt`
- Valores: `SaldoEstoque`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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
