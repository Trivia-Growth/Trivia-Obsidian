---
tags: [literarius, schema, banco-de-dados, compras]
status: mapeado
criado: 2026-05-18
fonte: pymssql direto — 192.168.18.10:1433
---

# Literarius DB — Módulo Compras — Entradas de Mercadoria

> Schema mapeado diretamente do banco SQL Server em produção (2026-05-18).
> Colunas, tipos reais e amostras de dados incluídos.

---

## `Entrada`

**NFs de entrada (compra)** · **217 linhas** · 38 colunas

> 217 NFs de entrada (compra de mercadoria). Cabeçalho com fornecedor, data, valor total, NF do fornecedor.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `IdEntrada` | bigint | INTEGER | **não** | PK |
| `Empresa` | int | INTEGER | **não** |  |
| `Fornecedor` | int | INTEGER | **não** |  |
| `NotaFiscal` | int | INTEGER | **não** |  |
| `Serie` | int | INTEGER | **não** |  |
| `TipoEntrada` | int | INTEGER | sim | enum |
| `ModeloNota` | int | INTEGER | sim |  |
| `DataEmissao` | datetime | TIMESTAMPTZ | sim | data |
| `DataRecepcao` | datetime | TIMESTAMPTZ | sim | data |
| `OperacaoFiscal` | bigint | INTEGER | sim |  |
| `Comprador` | int | INTEGER | sim |  |
| `Transportadora` | int | INTEGER | sim |  |
| `FretePorConta` | int | INTEGER | sim |  |
| `ValorFrete` | money | NUMERIC | sim | valor monetário |
| `ValorSeguro` | money | NUMERIC | sim | valor monetário |
| `OutrasDespesas` | money | NUMERIC | sim |  |
| `Desconto` | money | NUMERIC | sim |  |
| `TotalProduto` | money | NUMERIC | sim | valor monetário |
| `TotalNota` | money | NUMERIC | sim | valor monetário |
| `Setor` | int | INTEGER | sim |  |
| `SetorOrigem` | int | INTEGER | sim |  |
| `Situacao` | int | INTEGER | sim | enum |
| `Portador` | int | INTEGER | sim |  |
| `FormaPagto` | int | INTEGER | sim |  |
| `Consignacao` | bigint | INTEGER | sim |  |
| `ChaveNFe` | varchar(44) | TEXT | sim |  |
| `MoveEstoque` | bit | BOOLEAN | sim |  |
| `GeraFinanceiro` | bit | BOOLEAN | sim |  |
| `AtualizaCusto` | bit | BOOLEAN | sim |  |
| `CTeTipo` | int | INTEGER | sim | enum |
| `CTeCodCidadeIni` | int | INTEGER | sim |  |
| `CTeCidadeIni` | varchar(150) | TEXT | sim |  |
| `CTeCodCidadeFim` | int | INTEGER | sim |  |
| `CTeCidadeFim` | varchar(150) | TEXT | sim |  |
| `Observacao` | text(2147483647) | TEXT | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |
| `AbaterCredito` | bit | BOOLEAN | sim |  |

**Campos-chave:**

- PK: `IdEntrada`
- Datas: `DataEmissao`, `DataRecepcao`, `DataAlt`
- Valores: `ValorFrete`, `ValorSeguro`, `TotalProduto`, `TotalNota`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `EntradaItens`

**Itens das entradas** · **5,527 linhas** · 50 colunas

> 5.527 itens de entrada. Produto, quantidade recebida, custo unitário. Base para CMV e custo de estoque.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `idEntradaItens` | bigint | INTEGER | **não** | PK |
| `IdEntrada` | bigint | INTEGER | **não** | PK |
| `Item` | int | INTEGER | **não** |  |
| `Produto` | int | INTEGER | sim |  |
| `Descricao` | varchar(150) | TEXT | sim |  |
| `Unidade` | varchar(6) | TEXT | sim |  |
| `Qtde` | numeric | NUMERIC | sim |  |
| `ValorUnitario` | money | NUMERIC | sim | valor monetário |
| `Desconto` | money | NUMERIC | sim |  |
| `PercDesconto` | money | NUMERIC | sim |  |
| `ValorTotal` | money | NUMERIC | sim | valor monetário |
| `Cfop` | varchar(5) | TEXT | sim |  |
| `PlanoConta` | int | INTEGER | sim |  |
| `CentroResultado` | int | INTEGER | sim |  |
| `IsEstoque` | bit | BOOLEAN | sim |  |
| `Origem` | int | INTEGER | sim |  |
| `IcmsCst` | varchar(3) | TEXT | sim |  |
| `IcmsBase` | money | NUMERIC | sim |  |
| `IcmsAliq` | money | NUMERIC | sim |  |
| `IcmsValor` | money | NUMERIC | sim | valor monetário |
| `IcmsStBase` | money | NUMERIC | sim |  |
| `IcmsStAliq` | money | NUMERIC | sim |  |
| `IcmsStValor` | money | NUMERIC | sim | valor monetário |
| `IpiCst` | varchar(3) | TEXT | sim |  |
| `IpiBase` | money | NUMERIC | sim |  |
| `IpiAliq` | money | NUMERIC | sim |  |
| `IpiValor` | money | NUMERIC | sim | valor monetário |
| `PisCst` | varchar(3) | TEXT | sim |  |
| `PisBase` | money | NUMERIC | sim |  |
| `PisAliq` | money | NUMERIC | sim |  |
| `PisValor` | money | NUMERIC | sim | valor monetário |
| `CofinsCst` | varchar(3) | TEXT | sim |  |
| `CofinsBase` | money | NUMERIC | sim |  |
| `CofinsAliq` | money | NUMERIC | sim |  |
| `CofinsValor` | money | NUMERIC | sim | valor monetário |
| `ValorSeguro` | money | NUMERIC | sim | valor monetário |
| `ValorFrete` | money | NUMERIC | sim | valor monetário |
| `OutrasDespesas` | money | NUMERIC | sim |  |
| `OutrosDescontos` | money | NUMERIC | sim |  |
| `CustoUnitario` | money | NUMERIC | sim |  |
| `idPedidoCompra` | bigint | INTEGER | sim |  |
| `idPedidoCompraItens` | bigint | INTEGER | sim |  |
| `RelacaoNotaEmitidaRecebida` | char(1) | TEXT | sim |  |
| `RelacaoNotaEmpresa` | int | INTEGER | sim |  |
| `RelacaoNotaParceiro` | int | INTEGER | sim |  |
| `RelacaoNotaNumero` | int | INTEGER | sim |  |
| `RelacaoNotaSerie` | int | INTEGER | sim |  |
| `RelacaoNotaIdItem` | bigint | INTEGER | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |

**Campos-chave:**

- PK: `idEntradaItens`, `IdEntrada`
- Datas: `DataAlt`
- Valores: `ValorUnitario`, `ValorTotal`, `IcmsValor`, `IcmsStValor`, `IpiValor`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `EntradaVencimento`

**Vencimentos das entradas** · **477 linhas** · 9 colunas

> 477 vencimentos de compra. Liga a NF de entrada → TituloFinanceiro a pagar.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `idEntradaVencimento` | bigint | INTEGER | **não** | PK |
| `IdEntrada` | bigint | INTEGER | **não** | PK |
| `Item` | int | INTEGER | **não** |  |
| `Prazo` | int | INTEGER | sim |  |
| `DataVencto` | datetime | TIMESTAMPTZ | sim | data |
| `Valor` | money | NUMERIC | sim | valor monetário |
| `Alterado` | bit | BOOLEAN | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |

**Campos-chave:**

- PK: `idEntradaVencimento`, `IdEntrada`
- Datas: `DataVencto`, `DataAlt`
- Valores: `Valor`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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
