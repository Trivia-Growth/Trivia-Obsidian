# Relatorio Completo: API Contmatic Developer

**Data da Pesquisa:** 06/05/2026  
**Portal:** https://developer.contmatic.com.br  
**Especificacao OpenAPI:** https://api.contmatic.com.br/public/v3/api-docs

---

## 1. VISAO GERAL

O **Portal Developers Contmatic** e a plataforma oficial de integracao da Contmatic Phoenix com sistemas terceiros. A API e do tipo **REST**, utiliza formato **JSON** para dados, e esta documentada com **ReDoc** (baseado em OpenAPI/Swagger).

### Informacoes Basicas
- **Nome da API:** Documentacao API Public
- **Versao:** 1.0.0
- **Base URL:** `https://api.contmatic.com.br/public`
- **Formato:** JSON (application/json)
- **Tipo:** REST API
- **Documentacao:** ReDoc (OpenAPI 3.0)
- **Contato Comercial:** comercial@contmatic.com.br
- **Download OpenAPI Spec:** https://api.contmatic.com.br/public/v3/api-docs
- **Descricao oficial:** "Servicos REST relacionados a empresas externas"

---

## 2. AUTENTICACAO

### Tipo: API Key (Header)

| Propriedade | Valor |
|---|---|
| Security Scheme Type | API Key |
| Header parameter name | `Authorization` |
| Localizacao | Header HTTP |

### Como Obter o Token

A autenticacao e feita via **ConnectCont**, o sistema unificado de acesso da Contmatic.

**Processo passo-a-passo:**

1. Acessar `developer.contmatic.com.br`
2. Clicar em "Conectar sistemas"
3. Fazer login com credenciais ConnectCont (formato: `usuario@apelido`)
4. Na listagem de tokens, clicar em "Criar token"
5. Selecionar o produto que deseja integrar
6. Clicar em "Gerar token"
7. O token estara disponivel na listagem - copiar e usar no header `Authorization`

**Formato da conta ConnectCont:**
- Padrao: `usuario@apelido`
- Usuario: 1-60 caracteres
- Apelido: 1-30 caracteres
- Total: 3-91 caracteres

**Requisito:** Login com credenciais do **responsavel financeiro** da conta Contmatic.

### Revogacao de Token
- Endpoint: `DELETE /v1/oauth`
- Descricao: Servico destinado a revogacao do token

### Nota sobre SOAP
O artigo do autoatendimento menciona: "Voce consegue a chave de autenticacao para integrar o seu sistema com uma de nossas APIs por meio de **SOAP ou JSON**", indicando que pode haver tambem uma API SOAP alem da REST/JSON documentada.

---

## 3. ENDPOINTS COMPLETOS

### 3.1 Usuario
**Descricao:** Servicos relacionados aos usuarios dos clientes.

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET | `/v1/usuarios` | Consulta de usuarios |

**Query Parameters:**
- `alteradoApos` (string) - filtro por data de alteracao
- `page` (integer) - paginacao
- `size` (integer) - tamanho da pagina

**Response Schema (200 - application/json):**
```json
[
  {
    "emailAlternativo": "string",
    "emailPrincipal": "string",
    "login": "string",
    "pessoaFisica": {},
    "situacao": "string",
    "usuarioId": "string"
  }
]
```

---

### 3.2 Empresa
**Descricao:** Servicos relacionados as empresas dos clientes.

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET | `/v1/empresas` | Consulta de empresas |

**Query Parameters:**
- `alteradoApos` (string) - filtro por data
- `ativo` (boolean) - filtro por situacao
- `cpfcnpj` (string) - filtro por CPF/CNPJ
- `page` (integer) - paginacao
- `size` (integer) - tamanho da pagina

**Response Schema (200 - application/json):**
```json
[
  {
    "apelido": "string",
    "caepf": "string",
    "cei": "string",
    "clienteId": 0,
    "cnpj": "string",
    "cpf": "string",
    "dataClassificacaoTributariaEsocial": "2019-08-24",
    "dataDesativacao": "2019-08-24",
    "inscricaoEstadual": "string",
    "nomeFantasia": "string",
    "razaoSocial": "string",
    "regimeTributario": "string",
    "responsavel": {},
    "situacao": "string",
    "tipoClassificacaoTributariaEsocial": 0,
    "tipoIrpj": 0,
    "uf": "string"
  }
]
```

**Tabela de Tipos IRPJ:**
| Codigo | Tipo |
|---|---|
| 0 | Nenhum |
| 1 | Corretora de Seguros |
| 2 | Lucro Presumido |
| 3 | LP EPP |
| 4 | ME Simples |
| 5 | EPP Simples |
| 6 | ME Federal |
| 7 | Simples Nacional (ME) |
| 8 | Simples Nacional (EPP) |
| 9 | Microempreendedor (Simples Nacional) |
| 10 | Lucro Arbitrado |

---

### 3.3 Cliente
**Descricao:** Servico destinado a consulta do CPF ou CNPJ do cliente.

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET | `/v1/clientes/self` | Consulta dados do cliente autenticado |

**Response Schema (200 - application/json):**
```json
{
  "ambienteESocial": "string",
  "apelido": "string",
  "cadastroInconsistente": true,
  "cnpjCpfCei": "string",
  "contadorId": 0,
  "cpfResponsavel": "string",
  "dataAlteracao": "2019-08-24T14:15:22Z",
  "dataCriacaoSenhaTemporaria": "2019-08-24T14:15:22Z",
  "dataDesativacao": "2019-08-24T14:15:22Z",
  "dataImportacao": "2019-08-24T14:15:22Z",
  "dataInicioESocial": "2019-08-24T14:15:22Z",
  "dataInicioSstESocial": "2019-08-24T14:15:22Z",
  "dataSolicitacaoSenhaTemporaria": "2019-08-24T14:15:22Z",
  "email": "string",
  "emailResponsavel": "string",
  "emailSolicitacaoSenhaTemporaria": "string",
  "empresaVinculo": true,
  "enabledContadorOnline": true,
  "enviarEmailGeral": true,
  "enviarEmailUnificado": true,
  "fax": "string",
  "flagNumeroAtaInformada": 0,
  "flagNumeroAtaUsuario": "string",
  "habilitadoLeiauteSimplificado": true,
  "horaExecucao": "2019-08-24T14:15:22Z",
  "id": 0,
  "idRequisitanteSenhaTemporaria": 0,
  "leiauteESocial": "string",
  "mesesAcessoRescindidos": 0,
  "nomeResponsavel": "string",
  "numeroInicioAta": 0,
  "primeiroAcessoConfirmado": true,
  "primeiroAcessoConnectClient": true,
  "razaoSocial": "string",
  "senhaTemporaria": "string",
  "sincronizarAcessorias": true,
  "sincronizarContabilWeb": true,
  "sincronizarFolhaWeb": true,
  "sincronizarSstWeb": true,
  "site": "string",
  "situacao": "string",
  "situacaoGestor": "string",
  "situacaoImportacao": "string",
  "situacaoImportacaoGestor": "string",
  "solicitacaoSenhaTemporaria": true,
  "telefone": "string",
  "tipoIRPJ": {
    "atividades": [],
    "descricao": "string",
    "id": 0
  },
  "usuarioImportacao": "string"
}
```

---

### 3.4 Funcionario
**Descricao:** Servicos destinados aos funcionarios do cliente.

| Metodo | Endpoint | Descricao |
|---|---|---|
| POST | `/v1/funcionarios` | Integracao de funcionarios |

**Header Parameters:**
- `apelido` (string, required) - apelido da empresa

**Request Body Schema (application/json):**
```json
{
  "anteciparIndenizacaoFgts": true,
  "cargo": {
    "codigo": 0,
    "descricao": "string",
    "id": 0
  },
  "codigoAdmissaoFGTS": "string",
  "contratoFato": true,
  "cpf": "string",
  "dataAdmissao": "2019-08-24T14:15:22Z",
  "dataNascimento": "2019-08-24T14:15:22Z",
  "dataPrevisaoTerminoEstagio": "2019-08-24T14:15:22Z",
  "descricaoFato": "string",
  "descricaoSalarioVariavel": "string",
  "formasPagamento": "string",
  "horario": {
    "codigo": 0,
    "descricao": "string",
    "id": 0
  },
  "horasMensais": "string",
  "horasSemanais": "string",
  "id": 0,
  "indicativoAdmissao": "string",
  "instituicaoEnsino": {
    "codigo": 0,
    "id": 0,
    "razaoSocial": "string"
  },
  "justificativa": "string",
  "motivo": "string",
  "nivelEstagio": "string",
  "nome": "string",
  "opcao13Ferias": "string",
  "regimeJornada": "string",
  "salario": "string",
  "tipoAdmissao": "string",
  "tipoContrato": "string",
  "tipoPagamento": "string",
  "vinculoEmpregaticio": "string"
}
```

---

### 3.5 Cargo
**Descricao:** Servicos destinados aos cargos do cliente.

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET | `/v1/cargos/{apelido}` | Busca de cargos |

**Path Parameters:**
- `apelido` (string, required) - Apelido da empresa

**Response Schema (200 - application/json):**
```json
[
  {
    "codigo": 0,
    "descricao": "string",
    "id": 0
  }
]
```

---

### 3.6 Instituicao de Ensino
**Descricao:** Busca de instituicoes de ensino do cliente.

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET | `/v1/instituicoesensino/{apelido}` | Busca instituicoes de ensino |

**Path Parameters:**
- `apelido` (string, required) - Apelido da empresa

**Response Schema (200 - application/json):**
```json
[
  {
    "codigo": 0,
    "id": 0,
    "razaoSocial": "string"
  }
]
```

---

### 3.7 Horarios
**Descricao:** Servico destinado a busca de horarios.

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET | `/v1/horarios/{apelido}` | Busca horarios |

**Path Parameters:**
- `apelido` (string, required) - Apelido da empresa

**Response Schema (200 - application/json):**
```json
[
  {
    "codigo": 0,
    "descricao": "string",
    "id": 0
  }
]
```

---

### 3.8 Metadata
**Descricao:** Servicos relacionados com as informacoes dos arquivos.

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET | `/v1/metadatas` | Consulta metadatas |

**Query Parameters:**
- `alteradoApos` (string)
- `empresa` (string)
- `page` (integer)
- `size` (integer)

**Response Schema (200 - application/json):**
```json
[
  {
    "atividades": [],
    "categoria": {},
    "codigo": "string",
    "dataCriacao": "2019-08-24T14:15:22Z",
    "descricao": "string",
    "id": 0,
    "mode": "string",
    "nome": "string",
    "nomeFantasia": "string",
    "protocoloMetadatas": [],
    "tamanho": 0,
    "tamanhoFormatado": "string",
    "tipo": "string",
    "usuario": {}
  }
]
```

---

### 3.9 File (Download de Arquivos)
**Descricao:** Servicos relacionados com o arquivo.

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET | `/v1/files/{codigo}` | Download de arquivos |

**Path Parameters:**
- `codigo` (string, required) - Codigo metadata do arquivo a ser baixado

**Response:** application/octet-stream (arquivo binario)

---

### 3.10 Integracao de Metadatas
**Descricao:** Metadata Integracao Controller.

| Metodo | Endpoint | Descricao |
|---|---|---|
| POST | `/v1/metadatasintegracoes` | Integracoes de metadatas |

**Request Body Schema (multipart/form-data):**
- `metadataIntegracao` (required) - Array of MetadataIntegracaoType
- `multipartFile` (required, string binary) - Arquivo ZIP

---

### 3.11 Lancamento Contabil
**Descricao:** Lancamento Contabil Controller.

| Metodo | Endpoint | Descricao |
|---|---|---|
| POST | `/v1/lancamentos/{apelido}/{ano}` | Lancamentos contabeis |

**Path Parameters:**
- `apelido` (string, required)
- `ano` (integer, required)

**Request Body Schema (application/json):**
```json
[
  {
    "data": "2019-08-24T14:15:22Z",
    "lancamentosCreditos": [
      {
        "contaContabilId": 0,
        "historicoId": 0,
        "valor": 0
      }
    ],
    "lancamentosDebitos": [
      {
        "contaContabilId": 0,
        "historicoId": 0,
        "valor": 0
      }
    ],
    "valor": 0
  }
]
```

**Constraints:**
- `valor`: number (double), range [0 .. 10000000000]

---

### 3.12 Plano de Contas
**Descricao:** Plano Contas Controller.

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET | `/v1/planocontas/{apelido}/{ano}` | Consulta plano de contas |

**Path Parameters:**
- `apelido` (string, required) - Apelido da Empresa
- `ano` (integer, required) - Ano do Plano de Contas

**Response Schema (200 - application/json):**
```json
[
  {
    "codigo": 0,
    "conta": "string",
    "contadorId": 0,
    "descricao": "string",
    "historicoContaContabilIntegracoes": [],
    "id": 0,
    "planoContaContabil": {},
    "reduzida": 0,
    "statusSincronizacao": "string",
    "ultimaSincronizacao": "2019-08-24T14:15:22Z"
  }
]
```

---

### 3.13 Empresa Integrada
**Descricao:** Empresa Integrada Controller.

| Metodo | Endpoint | Descricao |
|---|---|---|
| PUT | `/v1/empresas-integradas/{codigoParceiro}/{apelidoEmpresa}` | Gerar token de empresa integrada |

**Path Parameters:**
- `codigoParceiro` (integer, required)
- `apelidoEmpresa` (string, required)

**Response:** String (token gerado)

---

### 3.14 Produto Integrado
**Descricao:** Produto Integrado Controller.

| Metodo | Endpoint | Descricao |
|---|---|---|
| PUT | `/v1/produtos-integrados/{codigoParceiro}` | Gerar token de produto integrado |

**Path Parameters:**
- `codigoParceiro` (integer, required)

**Response:** String (token gerado)

---

### 3.15 Termo
**Descricao:** Termo Controller.

| Metodo | Endpoint | Descricao |
|---|---|---|
| GET | `/v1/termo` | Obter versao do termo |
| POST | `/v1/termo` | Salvar versao do termo |

**Response Schema GET (200 - application/json):**
```json
{
  "clienteId": 0,
  "dataAceite": "2019-08-24T14:15:22Z",
  "origemAceite": "string",
  "usuario": "string",
  "versao": "string"
}
```

---

### 3.16 OAuth
**Descricao:** Oauth Controller.

| Metodo | Endpoint | Descricao |
|---|---|---|
| DELETE | `/v1/oauth` | Revogacao do token |

---

## 4. WEBHOOKS

A API suporta Webhooks para notificacao de eventos em tempo real.

### Topicos Disponiveis

| Topico | Descricao |
|---|---|
| `ARQUIVO_CADASTRO` | Notificacao de cadastro de arquivos |
| `CARGO_CHANGE` | Alteracao em cargos |
| `EMPRESA_CHANGE` | Alteracao em empresas |
| `INSTITUICAO_ENSINO_CHANGE` | Alteracao em instituicoes de ensino |
| `HORARIO_CHANGE` | Alteracao em horarios |
| `USUARIO_CONNECTCONT_CHANGE` | Alteracao em usuarios ConnectCont |

### Endpoints de Webhook

| Metodo | Endpoint | Descricao |
|---|---|---|
| PUT | `/v1/webhooks` | Inscrever em topicos |
| GET | `/v1/webhooks/self` | Buscar webhook cadastrado |
| DELETE | `/v1/webhooks/self` | Excluir webhook |

### Request Body - Inscricao (PUT /v1/webhooks):
```json
[
  {
    "token": "string",
    "topico": "string",
    "urlIntegracao": "string"
  }
]
```

### Response Schema - Busca (GET /v1/webhooks/self):
```json
{
  "id": 0,
  "topicosUsuario": []
}
```

---

## 5. CODIGOS DE RESPOSTA HTTP

| Codigo | Significado |
|---|---|
| 200 | Sucesso |
| 201 | Criado |
| 204 | Sem conteudo (sucesso) |
| 400 | Solicitacao invalida |
| 401 | Nao autorizado |
| 403 | Proibido |
| 404 | Nao encontrado |
| 422 | Solicitacao nao executada (constraints nao cumpridas) |

---

## 6. INTEGRACOES NATIVAS (Parceiros)

### Parceiros Confirmados via API:
1. **Jettax** - Integracao via API para captura e processamento de documentos fiscais
2. **Acessorias** - Integracao para relatorios, obrigacoes e cadastro de funcionarios
3. **Ottimizza** - Integracao para contabilidade
4. **Busca Legal** - Integracoes inteligentes
5. **Contbank/BPO Suite** - Integracoes com contabilidade

### Artigos de Suporte Relacionados:
- "Integracao do Jettax com o sistema G5"
- "Integrar relatorios e obrigacoes dos meus clientes com o sistema da Acessorias"
- "Integrar o cadastro preliminar de funcionarios do sistema Acessorias para o Folha"
- "Integracao do Ottimizza com o Contabil"

### Sincronizacoes Disponiveis (campos do ClienteResource):
- `sincronizarAcessorias` - Sincronizar com Acessorias
- `sincronizarContabilWeb` - Sincronizar com Contabil Web
- `sincronizarFolhaWeb` - Sincronizar com Folha Web
- `sincronizarSstWeb` - Sincronizar com SST Web

---

## 7. MODULOS/RECURSOS DISPONIVEIS VIA API

| Modulo | Operacoes | Tipo |
|---|---|---|
| **Usuarios** | Consulta | Leitura |
| **Empresas** | Consulta | Leitura |
| **Clientes** | Consulta (self) | Leitura |
| **Funcionarios** | Cadastro/Integracao | Escrita |
| **Cargos** | Consulta | Leitura |
| **Horarios** | Consulta | Leitura |
| **Instituicoes de Ensino** | Consulta | Leitura |
| **Metadatas/Arquivos** | Consulta + Upload | Leitura/Escrita |
| **Download de Arquivos** | Download | Leitura |
| **Lancamentos Contabeis** | Criacao | Escrita |
| **Plano de Contas** | Consulta | Leitura |
| **Webhooks** | CRUD | Leitura/Escrita |
| **Empresa Integrada** | Gerar token | Escrita |
| **Produto Integrado** | Gerar token | Escrita |
| **Termo** | Consulta + Salvamento | Leitura/Escrita |
| **OAuth** | Revogacao | Escrita |

### Modulos NAO disponiveis via API (ate onde foi possivel verificar):
- NF-e / Notas Fiscais
- Folha de Pagamento (apenas cadastro de funcionarios)
- SPED
- Obrigacoes Acessorias
- Financeiro
- Impostos/Guias

---

## 8. REQUISITOS E RESTRICOES

### Requisitos para Acesso:
1. **Ser cliente Contmatic** - Necessario ter uma conta ativa
2. **Ter acesso ConnectCont** - Credenciais do responsavel financeiro
3. **Gerar token** - Pelo Portal do Desenvolvedor

### Limitacoes Identificadas:
- **Rate Limits:** NAO documentados publicamente
- **Paginacao:** Suportada via parametros `page` e `size`
- **Custo adicional:** NAO mencionado (parece estar incluso no plano)
- **Plano necessario:** NAO especificado qual plano minimo

### Restricoes Tecnicas:
- Valor maximo para lancamentos contabeis: 10.000.000.000
- Formatos aceitos para upload: multipart/form-data (ZIP)
- Content-type de download: application/octet-stream

---

## 9. DOCUMENTACAO TECNICA

### Recursos Disponiveis:
- **OpenAPI Spec:** https://api.contmatic.com.br/public/v3/api-docs (download direto do JSON)
- **ReDoc:** Documentacao interativa em developer.contmatic.com.br/documentacao
- **Try It Out:** Botoes de teste integrados na documentacao
- **Postman Collection:** NAO encontrada publicamente
- **SDK oficial:** NAO existe

### GitHub:
- 2 repositorios nao-oficiais encontrados (ambos sem documentacao, sem atividade)
  - `CorreiaGui/contmatic-api` (Java, 2023)
  - `abzneto/contmatic-api` (CSS, 2016)
- NAO existe repositorio oficial da Contmatic no GitHub

---

## 10. SUPORTE E COMUNIDADE

### Canais Oficiais:
- **Email Comercial:** comercial@contmatic.com.br
- **Autoatendimento:** autoatendimento.contmatic.com.br
- **Portal do Cliente:** cliente.contmatic.com.br
- **WhatsApp:** Disponivel no site principal

### Recursos de Aprendizado:
- **Contmatic Academy:** 80+ cursos gratuitos
- **Comunidade Contabil Brasil:** Rede social para contadores
- **Blog Contabil:** Noticias contabeis
- **Videos/Lives:** Canal de conteudo

### Comunidade de Desenvolvedores:
- NAO existe forum de desenvolvedores dedicado
- NAO existe canal no Discord/Slack
- NAO existe Stack Overflow tag dedicada
- A comunidade e basicamente inexistente publicamente

---

## 11. EXEMPLO PRATICO DE INTEGRACAO

### Exemplo: Consultando Empresas via cURL

```bash
curl -X GET "https://api.contmatic.com.br/public/v1/empresas?page=0&size=10" \
  -H "Authorization: SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

### Exemplo: Criando Lancamento Contabil

```bash
curl -X POST "https://api.contmatic.com.br/public/v1/lancamentos/APELIDO_EMPRESA/2026" \
  -H "Authorization: SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "data": "2026-05-06T00:00:00Z",
      "lancamentosCreditos": [
        {
          "contaContabilId": 123,
          "historicoId": 1,
          "valor": 1500.00
        }
      ],
      "lancamentosDebitos": [
        {
          "contaContabilId": 456,
          "historicoId": 1,
          "valor": 1500.00
        }
      ],
      "valor": 1500.00
    }
  ]'
```

### Exemplo: Inscrevendo Webhook

```bash
curl -X PUT "https://api.contmatic.com.br/public/v1/webhooks" \
  -H "Authorization: SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "token": "meu_token_secreto",
      "topico": "EMPRESA_CHANGE",
      "urlIntegracao": "https://meu-sistema.com.br/webhook/contmatic"
    }
  ]'
```

### Exemplo: Cadastrando Funcionario

```bash
curl -X POST "https://api.contmatic.com.br/public/v1/funcionarios" \
  -H "Authorization: SEU_TOKEN_AQUI" \
  -H "apelido: APELIDO_EMPRESA" \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "12345678901",
    "nome": "Joao da Silva",
    "dataAdmissao": "2026-05-01T00:00:00Z",
    "dataNascimento": "1990-03-15T00:00:00Z",
    "cargo": {
      "codigo": 1,
      "descricao": "Analista",
      "id": 1
    },
    "salario": "5000.00",
    "tipoContrato": "INDETERMINADO",
    "vinculoEmpregaticio": "CLT"
  }'
```

---

## 12. ALTERNATIVAS DE INTEGRACAO

Alem da API REST, existem outras formas de integracao com a Contmatic:

### 1. Importacao/Exportacao de Arquivos
- Upload de arquivos ZIP via endpoint `/v1/metadatasintegracoes`
- Download de arquivos via `/v1/files/{codigo}`

### 2. SOAP (Mencionado)
- O artigo oficial menciona "SOAP ou JSON", indicando possivel API SOAP
- NAO encontrada documentacao publica da API SOAP

### 3. Integracao Direta via Parceiros
- Jettax, Acessorias, Ottimizza ja possuem integracoes prontas
- Basta gerar token e configurar no parceiro

### 4. Contmatic Nuvem
- Versao cloud mencionada nos produtos
- Pode ter integracoes adicionais

---

## 13. O QUE NAO FOI POSSIVEL ACESSAR

| Item | Motivo |
|---|---|
| Autoatendimento (base de conhecimento) | HTTP 403 - acesso restrito |
| Area autenticada do Portal Developer | Requer login ConnectCont |
| Documentacao SOAP | Nao encontrada publicamente |
| Rate limits detalhados | Nao documentados |
| Precos/Planos da API | Nao publicados |
| Postman Collection | Nao existe publicamente |
| Videos especificos sobre API | Nao encontrados |
| Stack Overflow discussions | Nao existem |
| Changelog/Versionamento | Nao documentado |

---

## 14. RECOMENDACOES PARA C BRASIL CONTABILIDADE

### Acoes Imediatas:
1. **Gerar token de acesso** - Acessar developer.contmatic.com.br com credenciais do responsavel financeiro
2. **Baixar OpenAPI Spec** - https://api.contmatic.com.br/public/v3/api-docs para referencia completa
3. **Testar endpoints** - Usar a funcao "Try It Out" na documentacao

### Oportunidades de Integracao:
1. **Lancamentos Contabeis automaticos** - Integrar sistema financeiro dos clientes direto na contabilidade
2. **Webhooks para monitoramento** - Receber alertas de alteracoes em empresas e usuarios
3. **Sincronizacao de cadastros** - Consultar e manter atualizados dados de empresas e funcionarios
4. **Plano de Contas** - Consultar para mapear contas em integracoes

### Limitacoes a Considerar:
- API focada em **contabilidade e folha** - nao cobre fiscal/NF-e diretamente
- Operacoes de **leitura** sao mais completas que operacoes de **escrita**
- Para NF-e e obrigacoes, considerar integracoes via parceiros (Jettax, Acessorias)

### Proximos Passos Sugeridos:
1. Contatar comercial@contmatic.com.br para confirmar se ha custos adicionais
2. Verificar se ha API SOAP com mais funcionalidades
3. Avaliar parceiros (Jettax/Acessorias/Ottimizza) para funcionalidades nao cobertas pela API
4. Considerar desenvolvimento de integracao propria para lancamentos contabeis automatizados

---

## 15. INFORMACOES DA EMPRESA

- **Razao Social:** Aurum Softmatic LTDA
- **CNPJ:** 17.160.849/0004-78
- **Fundacao:** 1987 (30+ anos)
- **Equipe:** 420+ especialistas
- **Clientes:** 10.000+
- **Produtos:** Contabil Phoenix, G5, JR, Folha, SST, Area do Cliente, Gestao do Escritorio, Contmatic Nuvem
- **Portal Developer:** Copyright 2022 (pode indicar quando a API foi lancada)

---

*Relatorio compilado em 06/05/2026 com base em informacoes publicamente disponiveis.*
