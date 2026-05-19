---
tags: [literarius, schema, banco-de-dados, cadastro]
status: mapeado
criado: 2026-05-18
fonte: pymssql direto — 192.168.18.10:1433
---

# Literarius DB — Cadastro — Parceiros (Clientes e Fornecedores)

> Schema mapeado diretamente do banco SQL Server em produção (2026-05-18).
> Colunas, tipos reais e amostras de dados incluídos.

---

## `Parceiro`

**Clientes e fornecedores** · **47,000 linhas** · 112 colunas

> 47.000 registros — toda a base de clientes, fornecedores, transportadoras. 112 colunas. Campo `tipoCliente`: 1=Igrejas, 2=Livrarias, 3=Distribuidoras, 4=ONGs, 5=PF, 6=Colaborador, 7=Empresas. Segmentação para análise de receita por canal.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `Codigo` | int | INTEGER | **não** |  |
| `Nome` | varchar(200) | TEXT | sim |  |
| `Fantasia` | varchar(100) | TEXT | sim |  |
| `IsCliente` | bit | BOOLEAN | sim |  |
| `IsFornecedor` | bit | BOOLEAN | sim |  |
| `IsTransportador` | bit | BOOLEAN | sim |  |
| `IsEmpresa` | bit | BOOLEAN | sim |  |
| `IsFuncionario` | bit | BOOLEAN | sim |  |
| `IsEditora` | bit | BOOLEAN | sim |  |
| `IsAutor` | bit | BOOLEAN | sim |  |
| `Contato` | varchar(30) | TEXT | sim |  |
| `FisJur` | char(1) | TEXT | sim |  |
| `CnpjCpf` | varchar(14) | TEXT | sim |  |
| `InscEstRg` | varchar(20) | TEXT | sim |  |
| `InscMun` | varchar(20) | TEXT | sim |  |
| `PerfilTributario` | int | INTEGER | sim |  |
| `Cep` | varchar(8) | TEXT | sim |  |
| `Endereco` | varchar(100) | TEXT | sim |  |
| `Numero` | varchar(10) | TEXT | sim |  |
| `Complemento` | varchar(50) | TEXT | sim |  |
| `Bairro` | varchar(80) | TEXT | sim |  |
| `CodPais` | int | INTEGER | sim |  |
| `Pais` | varchar(60) | TEXT | sim |  |
| `CodEstado` | int | INTEGER | sim |  |
| `Estado` | varchar(2) | TEXT | sim |  |
| `CodCidade` | int | INTEGER | sim |  |
| `Cidade` | varchar(150) | TEXT | sim |  |
| `Email` | varchar(250) | TEXT | sim |  |
| `Fone1` | varchar(15) | TEXT | sim |  |
| `Fone2` | varchar(15) | TEXT | sim |  |
| `Fax` | varchar(15) | TEXT | sim |  |
| `Sexo` | char(1) | TEXT | sim |  |
| `DataAniversario` | datetime | TIMESTAMPTZ | sim | data |
| `DataCadastro` | datetime | TIMESTAMPTZ | sim | data |
| `Status` | int | INTEGER | sim | enum |
| `Observacao` | text(2147483647) | TEXT | sim |  |
| `CodigoAnterior` | int | INTEGER | sim |  |
| `EmpresaMatriz` | int | INTEGER | sim |  |
| `EmpresaRegimeTributario` | int | INTEGER | sim |  |
| `EmpresaWebSite` | varchar(100) | TEXT | sim |  |
| `EmpresaCaminhoLogo` | varchar(250) | TEXT | sim |  |
| `ClienteTipoCliente` | int | INTEGER | sim | enum |
| `ClienteDesconto` | money | NUMERIC | sim |  |
| `ClienteSituacao` | int | INTEGER | sim | enum |
| `ClientePortador` | int | INTEGER | sim |  |
| `ClienteFormaPagto` | int | INTEGER | sim |  |
| `ClientePrazoPagto` | varchar(150) | TEXT | sim |  |
| `ClienteLimiteCredito` | money | NUMERIC | sim |  |
| `ClienteTransportadora` | int | INTEGER | sim |  |
| `ClienteVendedor` | int | INTEGER | sim |  |
| `ClienteCanalVenda` | int | INTEGER | sim |  |
| `FornecedorDesconto` | money | NUMERIC | sim |  |
| `FornecedorFormaPagto` | int | INTEGER | sim |  |
| `FornecedorPrazoPagto` | varchar(150) | TEXT | sim |  |
| `TransportadoraRNTRC` | varchar(20) | TEXT | sim |  |
| `AutorBanco` | varchar(50) | TEXT | sim |  |
| `AutorAgencia` | varchar(50) | TEXT | sim |  |
| `AutorConta` | varchar(50) | TEXT | sim |  |
| `FuncionarioBanco` | varchar(50) | TEXT | sim |  |
| `FuncionarioAgencia` | varchar(50) | TEXT | sim |  |
| `FuncionarioConta` | varchar(50) | TEXT | sim |  |
| `idRoyalties` | bigint | INTEGER | sim |  |
| `updateRoyalties` | datetime | TIMESTAMPTZ | sim | data |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |
| `UsuarioCadastro` | varchar(20) | TEXT | sim |  |
| `AutorCalculaIRRF` | char(1) | TEXT | sim |  |
| `AutorAliquotaIRRF` | money | NUMERIC | sim |  |
| `ClienteFretePorConta` | smallint | INTEGER | sim |  |
| `syncRoyalties` | bit | BOOLEAN | sim |  |
| `lastEmailRoyalties` | datetime | TIMESTAMPTZ | sim |  |
| `FornecedorBanco` | varchar(50) | TEXT | sim |  |
| `FornecedorAgencia` | varchar(10) | TEXT | sim |  |
| `FornecedorConta` | varchar(20) | TEXT | sim |  |
| `FornecedorContaDigito` | varchar(10) | TEXT | sim |  |
| `FornecedorTipoContaBancaria` | varchar(30) | TEXT | sim | enum |
| `FornecedorTipoChavePix` | smallint | INTEGER | sim | enum |
| `FornecedorChavePix` | varchar(150) | TEXT | sim |  |
| `FuncionarioContaDigito` | varchar(10) | TEXT | sim |  |
| `FuncionarioTipoContaBancaria` | varchar(30) | TEXT | sim | enum |
| `FuncionarioTipoChavePix` | smallint | INTEGER | sim | enum |
| `FuncionarioChavePix` | varchar(150) | TEXT | sim |  |
| `AutorContaDigito` | varchar(10) | TEXT | sim |  |
| `AutorTipoContaBancaria` | varchar(30) | TEXT | sim | enum |
| `AutorTipoChavePix` | smallint | INTEGER | sim | enum |
| `AutorChavePix` | varchar(150) | TEXT | sim |  |
| `CodigoSeloBookInfo` | varchar(30) | TEXT | sim |  |
| `CodigoSeloMB` | varchar(30) | TEXT | sim |  |
| `ClienteFidelidade` | bit | BOOLEAN | sim |  |
| `AutorNomeBeneficiario` | varchar(150) | TEXT | sim |  |
| `AutorCpfCnpjBeneficiario` | varchar(20) | TEXT | sim |  |
| `syncMercus` | bit | BOOLEAN | sim |  |
| `FornecedorEnviaPedidoBookHub` | int | INTEGER | sim |  |
| `EmpresaTokenBookHub` | text(2147483647) | TEXT | sim |  |
| `TipoLogradouro` | varchar(15) | TEXT | sim | enum |
| `RacaCor` | varchar(10) | TEXT | sim |  |
| `EstadoCivil` | varchar(15) | TEXT | sim |  |
| `Cbo` | varchar(15) | TEXT | sim |  |
| `GrauInstrucao` | varchar(150) | TEXT | sim |  |
| `Profissao` | varchar(100) | TEXT | sim |  |
| `DataContrato` | datetime | TIMESTAMPTZ | sim | data |
| `Matricula` | varchar(30) | TEXT | sim |  |
| `Nacionalidade` | varchar(40) | TEXT | sim |  |
| `PaisNascimento` | varchar(60) | TEXT | sim |  |
| `TempoResidenciaBrasil` | varchar(20) | TEXT | sim |  |
| `CondicaoIngressoBrasil` | varchar(20) | TEXT | sim |  |
| `PcdFisica` | char(1) | TEXT | sim |  |
| `PcdVisual` | char(1) | TEXT | sim |  |
| `PcdAuditiva` | char(1) | TEXT | sim |  |
| `PcdMental` | char(1) | TEXT | sim |  |
| `PcdIntelectual` | char(1) | TEXT | sim |  |
| `Reabilitado` | char(1) | TEXT | sim |  |

**Campos-chave:**

- Datas: `DataAniversario`, `DataCadastro`, `updateRoyalties`, `DataAlt`, `DataContrato`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `CanalVenda`

**Canais de venda** · **13 linhas** · 9 colunas

> 13 canais cadastrados (e-commerce, físico, distribuidora, consignação…). Liga pedidos ao canal de origem.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `Codigo` | int | INTEGER | **não** |  |
| `Descricao` | varchar(50) | TEXT | sim |  |
| `DestacaNFe` | bit | BOOLEAN | sim |  |
| `NFeIndicadorPresenca` | int | INTEGER | sim |  |
| `NFeIndicadorIntermediador` | int | INTEGER | sim |  |
| `NFeCnpjIntermediador` | varchar(14) | TEXT | sim |  |
| `NFeIdentificacaoIntermediador` | varchar(60) | TEXT | sim |  |
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

## `FormaPagto`

**Formas de pagamento** · **13 linhas** · 8 colunas

> 13 formas de pagamento (boleto, cartão, PIX, etc.). Usado em pedidos e títulos financeiros.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `Codigo` | int | INTEGER | **não** |  |
| `Descricao` | varchar(100) | TEXT | sim |  |
| `Avista` | bit | BOOLEAN | sim |  |
| `CodigoExterno` | varchar(5) | TEXT | sim |  |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |
| `Taxa` | money | NUMERIC | sim |  |
| `Prazo` | int | INTEGER | sim |  |

**Campos-chave:**

- Datas: `DataAlt`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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

## `TipoCliente`

**Tipos de cliente** · **7 linhas** · 4 colunas

> 7 tipos de cliente. Tabela de enumeração usada no Parceiro.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `Codigo` | int | INTEGER | **não** |  |
| `Descricao` | varchar(50) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |

**Campos-chave:**

- Datas: `DataAlt`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

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
