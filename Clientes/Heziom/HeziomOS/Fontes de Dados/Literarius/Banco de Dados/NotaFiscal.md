---
tags: [literarius, schema, banco-de-dados, vendas]
status: mapeado
criado: 2026-05-18
fonte: pymssql direto — 192.168.18.10:1433
---

# Literarius DB — Módulo Vendas — Notas Fiscais

> Schema mapeado diretamente do banco SQL Server em produção (2026-05-18).
> Colunas, tipos reais e amostras de dados incluídos.

---

## `NotaFiscal`

**Notas fiscais emitidas** · **33,418 linhas** · 112 colunas

> 33.418 NFs emitidas. 112 colunas com dados fiscais completos (CFOP, CST, tributação, emitente, destinatário, chave de acesso SEFAZ). Campo `entradaSaida`: S=saída, E=entrada.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `idNotaFiscal` | bigint | INTEGER | **não** | PK |
| `Empresa` | int | INTEGER | **não** |  |
| `Numero` | int | INTEGER | sim |  |
| `Serie` | int | INTEGER | sim |  |
| `Cliente` | int | INTEGER | sim |  |
| `EntSai` | char(1) | TEXT | sim |  |
| `TipoNota` | int | INTEGER | sim | enum |
| `DataEmissao` | datetime | TIMESTAMPTZ | sim | data |
| `DataSaida` | datetime | TIMESTAMPTZ | sim | data |
| `OperacaoFiscal` | bigint | INTEGER | sim |  |
| `DescricaoOpFiscal` | varchar(50) | TEXT | sim |  |
| `Nome` | varchar(200) | TEXT | sim |  |
| `FisJur` | char(1) | TEXT | sim |  |
| `CnpjCpf` | varchar(14) | TEXT | sim |  |
| `InscEstRg` | varchar(15) | TEXT | sim |  |
| `Cep` | varchar(8) | TEXT | sim |  |
| `Endereco` | varchar(250) | TEXT | sim |  |
| `EndNumero` | varchar(10) | TEXT | sim |  |
| `Complemento` | varchar(60) | TEXT | sim |  |
| `Bairro` | varchar(100) | TEXT | sim |  |
| `CodPais` | int | INTEGER | sim |  |
| `Pais` | varchar(150) | TEXT | sim |  |
| `CodEstado` | int | INTEGER | sim |  |
| `Estado` | varchar(2) | TEXT | sim |  |
| `CodCidade` | int | INTEGER | sim |  |
| `Cidade` | varchar(150) | TEXT | sim |  |
| `Email` | varchar(250) | TEXT | sim |  |
| `Fone` | varchar(15) | TEXT | sim |  |
| `Vendedor` | int | INTEGER | sim |  |
| `EnderecoEntrega` | int | INTEGER | sim |  |
| `TotalProduto` | money | NUMERIC | sim | valor monetário |
| `Desconto` | money | NUMERIC | sim |  |
| `OutrasDespesas` | money | NUMERIC | sim |  |
| `ValorFrete` | money | NUMERIC | sim | valor monetário |
| `TotalImpostos` | money | NUMERIC | sim | valor monetário |
| `TotalNota` | money | NUMERIC | sim | valor monetário |
| `IcmsBase` | money | NUMERIC | sim |  |
| `IcmsValor` | money | NUMERIC | sim | valor monetário |
| `IcmsStBase` | money | NUMERIC | sim |  |
| `IcmsStValor` | money | NUMERIC | sim | valor monetário |
| `IpiValor` | money | NUMERIC | sim | valor monetário |
| `PisValor` | money | NUMERIC | sim | valor monetário |
| `CofinsValor` | money | NUMERIC | sim | valor monetário |
| `IiValor` | money | NUMERIC | sim | valor monetário |
| `Transportadora` | int | INTEGER | sim |  |
| `TranspPlaca` | varchar(8) | TEXT | sim |  |
| `TranspUf` | varchar(2) | TEXT | sim |  |
| `FretePorConta` | int | INTEGER | sim |  |
| `QtdeFrete` | int | INTEGER | sim |  |
| `Especie` | varchar(50) | TEXT | sim |  |
| `Marca` | varchar(50) | TEXT | sim |  |
| `NumeroFrete` | varchar(100) | TEXT | sim |  |
| `PesoBruto` | numeric | NUMERIC | sim |  |
| `PesoLiquido` | numeric | NUMERIC | sim |  |
| `Observacao` | text(2147483647) | TEXT | sim |  |
| `ObservacaoFisco` | text(2147483647) | TEXT | sim |  |
| `ObservacaoAutomatica` | text(2147483647) | TEXT | sim |  |
| `Cancelada` | bit | BOOLEAN | sim |  |
| `Setor` | int | INTEGER | sim |  |
| `SetorDestino` | int | INTEGER | sim |  |
| `Situacao` | int | INTEGER | sim | enum |
| `Portador` | int | INTEGER | sim |  |
| `FormaPagto` | int | INTEGER | sim |  |
| `MoveEstoque` | bit | BOOLEAN | sim |  |
| `GeraFinanceiro` | bit | BOOLEAN | sim |  |
| `AtualizaCusto` | bit | BOOLEAN | sim |  |
| `CanalVenda` | int | INTEGER | sim |  |
| `Consignacao` | bigint | INTEGER | sim |  |
| `ExposicaoFeira` | bigint | INTEGER | sim |  |
| `idPedidoVenda` | bigint | INTEGER | sim |  |
| `PedidoCliente` | varchar(60) | TEXT | sim |  |
| `Caixa` | int | INTEGER | sim |  |
| `CupomDesconto` | varchar(20) | TEXT | sim |  |
| `UFEmbarque` | char(2) | TEXT | sim |  |
| `LocalEmbarque` | varchar(60) | TEXT | sim |  |
| `LocalDespacho` | varchar(60) | TEXT | sim |  |
| `NFeModeloDoctoFiscal` | int | INTEGER | sim |  |
| `NFeFinalidade` | int | INTEGER | sim |  |
| `NFeLote` | bigint | INTEGER | sim |  |
| `NFeCodigo` | bigint | INTEGER | sim |  |
| `NFeStatus` | int | INTEGER | sim | enum |
| `NFeIdentificadorDestino` | int | INTEGER | sim |  |
| `NFeOcorrencia` | int | INTEGER | sim |  |
| `NFeMotivoOcorrencia` | varchar(250) | TEXT | sim |  |
| `NFeChave` | varchar(50) | TEXT | sim |  |
| `NFeRecibo` | varchar(20) | TEXT | sim |  |
| `NFeDataHoraRecibo` | varchar(20) | TEXT | sim | data |
| `NFeProtocolo` | varchar(50) | TEXT | sim |  |
| `NFeIndicadorPresenca` | int | INTEGER | sim |  |
| `NFeIndicadorIntermediador` | int | INTEGER | sim |  |
| `NFeCnpjIntermediador` | varchar(14) | TEXT | sim |  |
| `NFeIdentificacaoIntermediador` | varchar(60) | TEXT | sim |  |
| `NFeProtocoloCancelamento` | varchar(50) | TEXT | sim |  |
| `NFeDataHoraCancelamento` | varchar(20) | TEXT | sim | data |
| `NFeJustificativaCancelamento` | varchar(200) | TEXT | sim |  |
| `SiteIdPedido` | varchar(60) | TEXT | sim |  |
| `SiteStatusPedido` | varchar(20) | TEXT | sim | enum |
| `FoiGerada` | bit | BOOLEAN | sim |  |
| `GerarNotaRelacao` | bit | BOOLEAN | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |
| `Enviado` | bit | BOOLEAN | sim |  |
| `AbaterCredito` | bit | BOOLEAN | sim |  |
| `UsuarioFaturamento` | varchar(20) | TEXT | sim |  |
| `DataFaturamento` | datetime | TIMESTAMPTZ | sim | data |
| `TipoEmissao` | int | INTEGER | sim | enum |
| `integradaMaisVendidos` | bit | BOOLEAN | sim |  |
| `IBSCBSBase` | money | NUMERIC | sim |  |
| `CBSValor` | money | NUMERIC | sim | valor monetário |
| `IBSUFValor` | money | NUMERIC | sim | valor monetário |
| `IBSMUNValor` | money | NUMERIC | sim | valor monetário |
| `PreFaturado` | bit | BOOLEAN | sim |  |

**Campos-chave:**

- PK: `idNotaFiscal`
- Datas: `DataEmissao`, `DataSaida`, `NFeDataHoraRecibo`, `NFeDataHoraCancelamento`, `DataAlt`
- Valores: `TotalProduto`, `ValorFrete`, `TotalImpostos`, `TotalNota`, `IcmsValor`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `NotaFiscalItens`

**Itens das NFs** · **71,986 linhas** · 126 colunas

> 71.986 itens de NF. 126 colunas — mais rico que qualquer API. Inclui NCM, CFOP, base de cálculo de impostos, alíquotas.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `idNotaFiscalItens` | bigint | INTEGER | **não** | PK |
| `idNotaFiscal` | bigint | INTEGER | **não** | PK |
| `Item` | int | INTEGER | **não** |  |
| `Produto` | int | INTEGER | sim |  |
| `Descricao` | varchar(150) | TEXT | sim |  |
| `Unidade` | varchar(6) | TEXT | sim |  |
| `Qtde` | numeric | NUMERIC | sim |  |
| `ValorUnitario` | money | NUMERIC | sim | valor monetário |
| `PercDesconto` | money | NUMERIC | sim |  |
| `ValorDesconto` | money | NUMERIC | sim | valor monetário |
| `ValorUnitarioLiquido` | money | NUMERIC | sim | valor monetário |
| `ValorTotal` | money | NUMERIC | sim | valor monetário |
| `Cfop` | varchar(5) | TEXT | sim |  |
| `PlanoConta` | int | INTEGER | sim |  |
| `CentroResultado` | int | INTEGER | sim |  |
| `IsEstoque` | bit | BOOLEAN | sim |  |
| `Origem` | int | INTEGER | sim |  |
| `ValorFrete` | money | NUMERIC | sim | valor monetário |
| `ValorSeguro` | money | NUMERIC | sim | valor monetário |
| `ValorOutrasDespesas` | money | NUMERIC | sim | valor monetário |
| `ImpostoManual` | bit | BOOLEAN | sim |  |
| `IcmsCst` | varchar(3) | TEXT | sim |  |
| `IcmsBase` | money | NUMERIC | sim |  |
| `IcmsReducao` | money | NUMERIC | sim |  |
| `IcmsAcrescimo` | money | NUMERIC | sim |  |
| `IcmsAliq` | money | NUMERIC | sim |  |
| `IcmsValor` | money | NUMERIC | sim | valor monetário |
| `IcmsIncidencia` | int | INTEGER | sim |  |
| `IcmsModalidade` | int | INTEGER | sim |  |
| `IpiCst` | varchar(3) | TEXT | sim |  |
| `IpiBase` | money | NUMERIC | sim |  |
| `IpiReducao` | money | NUMERIC | sim |  |
| `IpiAcrescimo` | money | NUMERIC | sim |  |
| `IpiAliq` | money | NUMERIC | sim |  |
| `IpiValor` | money | NUMERIC | sim | valor monetário |
| `IpiIncidencia` | int | INTEGER | sim |  |
| `IpiEnquadramento` | varchar(5) | TEXT | sim |  |
| `PisCst` | varchar(3) | TEXT | sim |  |
| `PisBase` | money | NUMERIC | sim |  |
| `PisReducao` | money | NUMERIC | sim |  |
| `PisAcrescimo` | money | NUMERIC | sim |  |
| `PisAliq` | money | NUMERIC | sim |  |
| `PisValor` | money | NUMERIC | sim | valor monetário |
| `PisIncidencia` | int | INTEGER | sim |  |
| `CofinsCst` | varchar(3) | TEXT | sim |  |
| `CofinsBase` | money | NUMERIC | sim |  |
| `CofinsReducao` | money | NUMERIC | sim |  |
| `CofinsAcrescimo` | money | NUMERIC | sim |  |
| `CofinsAliq` | money | NUMERIC | sim |  |
| `CofinsValor` | money | NUMERIC | sim | valor monetário |
| `CofinsIncidencia` | int | INTEGER | sim |  |
| `IcmsStBase` | money | NUMERIC | sim |  |
| `IcmsStReducao` | money | NUMERIC | sim |  |
| `IcmsStAcrescimo` | money | NUMERIC | sim |  |
| `IcmsStAliq` | money | NUMERIC | sim |  |
| `IcmsStValor` | money | NUMERIC | sim | valor monetário |
| `IcmsStIncidencia` | int | INTEGER | sim |  |
| `IcmsStModalidade` | int | INTEGER | sim |  |
| `DifalBaseDestino` | money | NUMERIC | sim |  |
| `DifalAliqInternaDestino` | money | NUMERIC | sim |  |
| `DifalAliqInterestadual` | money | NUMERIC | sim |  |
| `DifalPercentualProvisorio` | money | NUMERIC | sim |  |
| `DifalValorOrigem` | money | NUMERIC | sim | valor monetário |
| `DifalValorDestino` | money | NUMERIC | sim | valor monetário |
| `FcpBase` | money | NUMERIC | sim |  |
| `FcpAliq` | money | NUMERIC | sim |  |
| `FcpValor` | money | NUMERIC | sim | valor monetário |
| `IiBase` | money | NUMERIC | sim |  |
| `IiValor` | money | NUMERIC | sim | valor monetário |
| `IiDespAdu` | money | NUMERIC | sim |  |
| `IiIof` | money | NUMERIC | sim |  |
| `IbptTribFedNac` | money | NUMERIC | sim |  |
| `IbptTribFedImp` | money | NUMERIC | sim |  |
| `IbptTribEst` | money | NUMERIC | sim |  |
| `IbptTribMun` | money | NUMERIC | sim |  |
| `IbptChave` | varchar(20) | TEXT | sim |  |
| `IbptVersao` | varchar(10) | TEXT | sim |  |
| `IbptFonte` | varchar(20) | TEXT | sim |  |
| `idPedidoVenda` | bigint | INTEGER | sim |  |
| `idPedidoVendaItens` | bigint | INTEGER | sim |  |
| `RelacaoNotaEmitidaRecebida` | char(1) | TEXT | sim |  |
| `RelacaoNotaEmpresa` | int | INTEGER | sim |  |
| `RelacaoNotaParceiro` | int | INTEGER | sim |  |
| `RelacaoNotaNumero` | int | INTEGER | sim |  |
| `RelacaoNotaSerie` | int | INTEGER | sim |  |
| `RelacaoNotaIdItem` | bigint | INTEGER | sim |  |
| `NFexPed` | varchar(30) | TEXT | sim |  |
| `NFenItemPed` | int | INTEGER | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |
| `SiteIdPedido` | varchar(80) | TEXT | sim |  |
| `idMontagemKit` | int | INTEGER | sim |  |
| `TabelaPreco` | int | INTEGER | sim | valor monetário |
| `ISCst` | varchar(10) | TEXT | sim |  |
| `ISClassTrib` | varchar(50) | TEXT | sim |  |
| `ISBase` | money | NUMERIC | sim |  |
| `ISAliq` | money | NUMERIC | sim |  |
| `ISAliqEspec` | money | NUMERIC | sim |  |
| `ISUNTrib` | varchar(10) | TEXT | sim |  |
| `ISValor` | money | NUMERIC | sim | valor monetário |
| `IBSCBSCst` | varchar(10) | TEXT | sim |  |
| `IBSCBSClassTrib` | varchar(50) | TEXT | sim |  |
| `IBSCBSBase` | money | NUMERIC | sim |  |
| `IBSUFAliq` | money | NUMERIC | sim |  |
| `IBSUFPercDif` | money | NUMERIC | sim |  |
| `IBSUFValorDif` | money | NUMERIC | sim | valor monetário |
| `IBSUFPercRedAliq` | money | NUMERIC | sim |  |
| `IBSUFAliqEfet` | money | NUMERIC | sim |  |
| `IBSUFValor` | money | NUMERIC | sim | valor monetário |
| `IBSMUNAliq` | money | NUMERIC | sim |  |
| `IBSMUNPercDif` | money | NUMERIC | sim |  |
| `IBSMUNValorDif` | money | NUMERIC | sim | valor monetário |
| `IBSMUNPercRedAliq` | money | NUMERIC | sim |  |
| `IBSMUNAliqEfet` | money | NUMERIC | sim |  |
| `IBSMUNValor` | money | NUMERIC | sim | valor monetário |
| `CBSAliq` | money | NUMERIC | sim |  |
| `CBSPercDif` | money | NUMERIC | sim |  |
| `CBSValorDif` | money | NUMERIC | sim | valor monetário |
| `CBSPercRedAliq` | money | NUMERIC | sim |  |
| `CBSAliqEfet` | money | NUMERIC | sim |  |
| `CBSValor` | money | NUMERIC | sim | valor monetário |
| `IBSUFIncidencia` | int | INTEGER | sim |  |
| `IBSMUNIncidencia` | int | INTEGER | sim |  |
| `CBSIncidencia` | int | INTEGER | sim |  |
| `ISIncidencia` | int | INTEGER | sim |  |
| `CodigoBeneficio` | varchar(20) | TEXT | sim |  |

**Campos-chave:**

- PK: `idNotaFiscalItens`, `idNotaFiscal`
- Datas: `DataAlt`
- Valores: `ValorUnitario`, `ValorDesconto`, `ValorUnitarioLiquido`, `ValorTotal`, `ValorFrete`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `NotaFiscalVencimento`

**Vencimentos das NFs** · **48,152 linhas** · 13 colunas

> 48.152 vencimentos de NF. Liga NF → título financeiro a receber.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `idNotaFiscalVencimento` | bigint | INTEGER | **não** | PK |
| `idNotaFiscal` | bigint | INTEGER | **não** | PK |
| `Item` | int | INTEGER | **não** |  |
| `Prazo` | int | INTEGER | sim |  |
| `DataVencto` | datetime | TIMESTAMPTZ | sim | data |
| `Valor` | money | NUMERIC | sim | valor monetário |
| `ValorTroco` | money | NUMERIC | sim | valor monetário |
| `FormaPagto` | int | INTEGER | sim |  |
| `CondicaoPagto` | int | INTEGER | sim |  |
| `Alterado` | bit | BOOLEAN | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |
| `ValorTaxa` | money | NUMERIC | sim | valor monetário |

**Campos-chave:**

- PK: `idNotaFiscalVencimento`, `idNotaFiscal`
- Datas: `DataVencto`, `DataAlt`
- Valores: `Valor`, `ValorTroco`, `ValorTaxa`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `ProdutoPreco`

**Tabela de preços** · **6,090 linhas** · 12 colunas

> 6.090 preços com vigência por tabela de preço. Campo `vigente` indica o preço atual.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `Produto` | int | INTEGER | **não** |  |
| `Item` | int | INTEGER | **não** |  |
| `FaixaInicial` | int | INTEGER | sim |  |
| `FaixaFinal` | int | INTEGER | sim |  |
| `DataVigencia` | datetime | TIMESTAMPTZ | sim | data |
| `Preco` | money | NUMERIC | sim | valor monetário |
| `DescontoMaximo` | money | NUMERIC | sim |  |
| `TipoCliente` | int | INTEGER | sim | enum |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |
| `TipoTabela` | int | INTEGER | sim | enum |
| `TabelaPreco` | int | INTEGER | sim | valor monetário |

**Campos-chave:**

- Datas: `DataVigencia`, `DataAlt`
- Valores: `Preco`, `TabelaPreco`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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
