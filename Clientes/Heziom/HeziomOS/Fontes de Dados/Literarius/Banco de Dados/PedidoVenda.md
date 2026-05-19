---
tags: [literarius, schema, banco-de-dados, vendas]
status: mapeado
criado: 2026-05-18
fonte: pymssql direto — 192.168.18.10:1433
---

# Literarius DB — Módulo Vendas — Pedidos

> Schema mapeado diretamente do banco SQL Server em produção (2026-05-18).
> Colunas, tipos reais e amostras de dados incluídos.

---

## `PedidoVenda`

**Pedidos de venda** · **22,857 linhas** · 47 colunas

> 22.857 pedidos. Campo `siteIdPedido` é a chave de conciliação com a Tray. Campo `tipoPedido`: 1=Venda, 2=Consignação. Campo `canalVenda` identifica e-commerce vs físico.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `idPedidoVenda` | bigint | INTEGER | **não** | PK |
| `Empresa` | int | INTEGER | **não** |  |
| `Numero` | int | INTEGER | **não** |  |
| `TipoPedido` | int | INTEGER | sim | enum |
| `Cliente` | int | INTEGER | sim |  |
| `DataPedido` | datetime | TIMESTAMPTZ | sim | data |
| `Vendedor` | int | INTEGER | sim |  |
| `CanalVenda` | int | INTEGER | sim |  |
| `Setor` | int | INTEGER | sim |  |
| `OperacaoFiscal` | bigint | INTEGER | sim |  |
| `PedidoCliente` | varchar(50) | TEXT | sim |  |
| `Status` | int | INTEGER | sim | enum |
| `Separado` | bit | BOOLEAN | sim |  |
| `Conferido` | bit | BOOLEAN | sim |  |
| `EnderecoEntrega` | int | INTEGER | sim |  |
| `Transportadora` | int | INTEGER | sim |  |
| `QtdeFrete` | int | INTEGER | sim |  |
| `FretePorConta` | int | INTEGER | sim |  |
| `Especie` | varchar(50) | TEXT | sim |  |
| `Marca` | varchar(50) | TEXT | sim |  |
| `PesoBruto` | numeric | NUMERIC | sim |  |
| `PesoLiquido` | numeric | NUMERIC | sim |  |
| `TotalProduto` | money | NUMERIC | sim | valor monetário |
| `Desconto` | money | NUMERIC | sim |  |
| `OutrasDespesas` | money | NUMERIC | sim |  |
| `ValorFrete` | money | NUMERIC | sim | valor monetário |
| `TotalImpostos` | money | NUMERIC | sim | valor monetário |
| `TotalPedido` | money | NUMERIC | sim | valor monetário |
| `FormaPagto` | int | INTEGER | sim |  |
| `Comanda` | int | INTEGER | sim |  |
| `Observacao` | text(2147483647) | TEXT | sim |  |
| `SiteIdPedido` | varchar(60) | TEXT | sim |  |
| `SiteStatusPedido` | varchar(20) | TEXT | sim | enum |
| `cNF` | bigint | INTEGER | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |
| `Agrupado` | bit | BOOLEAN | sim |  |
| `UsuarioAgrupamento` | varchar(20) | TEXT | sim |  |
| `DataAgrupamento` | datetime | TIMESTAMPTZ | sim | data |
| `NumeroFrete` | varchar(10) | TEXT | sim |  |
| `DataPedidoOriginal` | datetime | TIMESTAMPTZ | sim | data |
| `ObservacaoLogistica` | text(2147483647) | TEXT | sim |  |
| `Revisao` | bit | BOOLEAN | sim |  |
| `Impresso` | bit | BOOLEAN | sim |  |
| `idPedidoOrigem` | bigint | INTEGER | sim |  |
| `PedidoMercus` | bit | BOOLEAN | sim |  |
| `PreFaturado` | bit | BOOLEAN | sim |  |

**Campos-chave:**

- PK: `idPedidoVenda`
- Datas: `DataPedido`, `DataAlt`, `DataAgrupamento`, `DataPedidoOriginal`
- Valores: `TotalProduto`, `ValorFrete`, `TotalImpostos`, `TotalPedido`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `PedidoVendaItens`

**Itens dos pedidos** · **43,041 linhas** · 27 colunas

> 43.041 itens. Detalhe de produto, quantidade, valor unitário e desconto por pedido.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `idPedidoVendaItens` | bigint | INTEGER | **não** | PK |
| `idPedidoVenda` | bigint | INTEGER | sim |  |
| `Item` | int | INTEGER | sim |  |
| `Produto` | int | INTEGER | sim |  |
| `Descricao` | varchar(150) | TEXT | sim |  |
| `UnidadeMedida` | varchar(6) | TEXT | sim |  |
| `QtdePedido` | numeric | NUMERIC | sim |  |
| `QtdeFaturado` | numeric | NUMERIC | sim |  |
| `QtdeCancelado` | numeric | NUMERIC | sim |  |
| `ValorUnitario` | money | NUMERIC | sim | valor monetário |
| `PercDesconto` | money | NUMERIC | sim |  |
| `ValorDesconto` | money | NUMERIC | sim | valor monetário |
| `ValorUnitarioLiquido` | money | NUMERIC | sim | valor monetário |
| `ValorTotal` | money | NUMERIC | sim | valor monetário |
| `QtdeConferencia` | numeric | NUMERIC | sim |  |
| `BoxConferencia` | varchar(20) | TEXT | sim |  |
| `PesoBruto` | money | NUMERIC | sim |  |
| `PesoLiquido` | money | NUMERIC | sim |  |
| `Separado` | bit | BOOLEAN | sim |  |
| `Conferido` | bit | BOOLEAN | sim |  |
| `Excluido` | bit | BOOLEAN | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |
| `SiteIdPedido` | varchar(80) | TEXT | sim |  |
| `idMontagemKit` | int | INTEGER | sim |  |
| `QtdeReservado` | numeric | NUMERIC | sim |  |
| `TabelaPreco` | int | INTEGER | sim | valor monetário |

**Campos-chave:**

- PK: `idPedidoVendaItens`
- Datas: `DataAlt`
- Valores: `ValorUnitario`, `ValorDesconto`, `ValorUnitarioLiquido`, `ValorTotal`, `TabelaPreco`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `PedidoVendaVencimento`

**Vencimentos dos pedidos** · **37,842 linhas** · 12 colunas

> 37.842 vencimentos. Condições de pagamento por pedido — prazo, forma de pagamento, valor.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `idPedidoVendaVencimento` | bigint | INTEGER | **não** | PK |
| `idPedidoVenda` | bigint | INTEGER | sim |  |
| `Item` | int | INTEGER | sim |  |
| `Prazo` | int | INTEGER | sim |  |
| `DataVencto` | datetime | TIMESTAMPTZ | sim | data |
| `Valor` | money | NUMERIC | sim | valor monetário |
| `FormaPagto` | int | INTEGER | sim |  |
| `Alterado` | bit | BOOLEAN | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |
| `CondicaoPagto` | int | INTEGER | sim |  |
| `ValorTaxa` | money | NUMERIC | sim | valor monetário |

**Campos-chave:**

- PK: `idPedidoVendaVencimento`
- Datas: `DataVencto`, `DataAlt`
- Valores: `Valor`, `ValorTaxa`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `PedidoVendaStatus`

**Status disponíveis** · **12 linhas** · 4 colunas

> Tabela de enumeração dos 12 status possíveis (Digitando → Faturado → Cancelado).

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `Codigo` | int | INTEGER | **não** |  |
| `Descricao` | varchar(50) | TEXT | sim |  |
| `Cor` | varchar(50) | TEXT | sim |  |
| `Ordem` | int | INTEGER | sim |  |

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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
