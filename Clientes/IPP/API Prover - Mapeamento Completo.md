---
title: API Prover — Mapeamento Completo
cliente: IPP
fonte: https://sis.sistemaprover.com.br/publicapi/doc
spec: https://sis.sistemaprover.com.br/publicapi/site/api
versao_api: 1.0.1
data_mapeamento: 2026-06-10
tags: [api, prover, ipp, integracao]
---

# API Prover — Mapeamento Completo

> Sistema **Prover** (sistemaprover.com.br) — plataforma de gestão para igrejas/instituições religiosas.
> Este documento mapeia **toda** a API pública (Public API) extraída da especificação OpenAPI 3.0.

## Visão geral

| Item | Valor |
|------|-------|
| **Título** | Prover - API |
| **Versão** | 1.0.1 |
| **Padrão** | OpenAPI 3.0.0 (Swagger) |
| **Contato/Suporte** | suporte@plataformaprover.com.br |
| **Documentação (Swagger UI)** | https://sis.sistemaprover.com.br/publicapi/doc |
| **Spec JSON** | https://sis.sistemaprover.com.br/publicapi/site/api |
| **URL base (servidor)** | `https://sis.sistemaprover.com.br/publicapi/v1` |
| **Total de endpoints** | 59 |
| **Total de grupos** | 11 |

### O que é a API

A plataforma Prover é um sistema de gestão eclesiástica. A API pública expõe dados de:

- **Cultos** — registro e listagem de cultos, com presença.
- **Eventos e Ensinos** — inscrições, presenças, encontros, lotes, regras de inscrição/serviço, módulos e aulas.
- **Exportação** — endpoints "data dump" para BI/integração: pessoas, ocorrências, grupos, ministérios, encontros, lançamentos financeiros e presença em cultos.
- **Notícias** — notícias, categorias e anexos (link/áudio/vídeo).
- **Pessoa** — cadastro de pessoas, busca, familiares, ocorrências, grupos, aniversariantes e migração de tipo.
- **Autenticação de Pessoa** — login por usuário/senha e por token temporário.
- **Solicitações** — pedidos (oração, LGPD, etc.), categorias, status e atualizações.

## Autenticação

A API usa **Bearer Token** (esquema `bearerAuth`). Inclua o token no cabeçalho de toda requisição:

```
Authorization: Bearer {seu_token}
```

> O token identifica a **instituição** (a igreja/unidade). Nos endpoints de culto ele aparece explicitamente como parâmetro `Authorization` no header, obrigatório.

### Fluxos de autenticação de pessoa (usuário final)

Além do token de instituição, há endpoints para autenticar **uma pessoa** (membro):

- `POST /pessoa/authenticate-by-user` — login com usuário + senha.
- `POST /pessoa/authenticate-by-temp-token` — login com token temporário.
- `POST /pessoa/{id}/create-temp-token` — gera token temporário para uma pessoa.

## Convenções gerais

- **Formato:** JSON (`application/json`) em requisições e respostas.
- **Datas:** formato `YYYY-MM-DD` (e `YYYY-MM-DD HH:MM:SS` para data+hora).
- **Identificadores:** a maioria das pessoas/entidades usa **UUID**; alguns endpoints usam IDs inteiros.
- **Paginação:** parâmetros `page` / `per-page` (ou `page` + `pageSize` no retorno `pagination`). Respostas paginadas trazem `count`, `totalCount` e `pagination`.
- **Erros:** padrão Yii framework — objeto com `name`, `message`, `code`, `status`, `type`. Códigos comuns: `400` (campos pendentes), `401` (não autorizado), `404` (não encontrado), `500` (erro de servidor).

## Grupos da API

| Grupo | Descrição | Endpoints |
|-------|-----------|-----------|
| Culto | Funções para informações de cultos | 2 |
| Evento | Funções para listagem de eventos | 9 |
| Ensino | Funções para listagem de ensinos | 11 |
| Exportação | Funções para recuperação de dados para exportação. | 19 |
| Noticia | Funções para listagem de noticias | 3 |
| Pessoa | Funções basicas de pessoa | 5 |
| Pessoa - Familiares | Relacionamentos de parentesco | 1 |
| Pessoa - Historico | Historico/ Ocorrencias vinculadas a pessoa | 1 |
| Pessoa - Grupos | Grupos dos quais a pessoa participa | 1 |
| Pessoa - Autenticação |  | 3 |
| Solicitações | Funções para informações de solicitações | 4 |

## Índice de endpoints

| # | Método | Endpoint | Descrição |
|---|--------|----------|-----------|
| 1 | `POST` | `/culto/salvar-presenca` | Salva a presença da pessoa no culto especificado |
| 2 | `GET` | `/culto/listagem-cultos` | Listagem de cultos |
| 3 | `GET` | `/evento/listagem-eventos` | Lista todos os eventos |
| 4 | `GET` | `/evento/listagem-encontros-eventos` | Lista todos os encontros de eventos |
| 5 | `GET` | `/evento/listagem-inscritos-eventos` | Lista todos os inscritos de eventos |
| 6 | `GET` | `/evento/listagem-resumos-eventos` | Lista todos os resumos de inscritos de eventos |
| 7 | `GET` | `/evento/listagem-presenca-eventos` | Lista todas as presencas de inscritos de eventos |
| 8 | `GET` | `/evento/listagem-encarregados-encontro-eventos` | Lista todos os encarregados de encontros de eventos |
| 9 | `GET` | `/evento/listagem-regras-inscricao-eventos` | Lista as regras de inscrições de eventos |
| 10 | `GET` | `/evento/listagem-regras-lote-eventos` | Lista as regras de lote de eventos |
| 11 | `GET` | `/evento/listagem-regras-servico-eventos` | Lista as regras de serviço de eventos |
| 12 | `GET` | `/evento/listagem-ensinos` | Lista todos os ensinos |
| 13 | `GET` | `/evento/listagem-encontros-ensinos` | Lista todos os encontros de ensinos |
| 14 | `GET` | `/evento/listagem-inscritos-ensinos` | Lista todos os inscritos de ensinos |
| 15 | `GET` | `/evento/listagem-resumos-ensinos` | Lista todos os resumos de inscritos de ensinos |
| 16 | `GET` | `/evento/listagem-presenca-ensinos` | Lista todas as presencas de inscritos de ensinos |
| 17 | `GET` | `/evento/listagem-encarregados-encontro-ensinos` | Lista todos os encarregados de encontros de ensinos |
| 18 | `GET` | `/evento/listagem-modulos` | Lista todos os módulos |
| 19 | `GET` | `/evento/listagem-aulas` | Lista todas as aulas |
| 20 | `GET` | `/evento/listagem-regras-inscricao-ensinos` | Lista as regras de inscrições de ensinos |
| 21 | `GET` | `/evento/listagem-regras-lote-ensinos` | Lista as regras de lote de ensinos |
| 22 | `GET` | `/evento/listagem-regras-servico-ensinos` | Lista as regras de serviço de ensinos |
| 23 | `GET` | `/exportacao/pessoas` | Retorna cadastros de pessoa |
| 24 | `GET` | `/exportacao/ocorrencias` | Retrieve occurrences |
| 25 | `GET` | `/exportacao/pessoas-ocorrencias` | Retrieve occurrences of people |
| 26 | `GET` | `/exportacao/grupos` | Retrieve groups information |
| 27 | `GET` | `/exportacao/ministerios` | Retrieve ministries information |
| 28 | `GET` | `/exportacao/grupos-participantes` | Retrieve participant groups |
| 29 | `GET` | `/exportacao/grupos-visitantes` | Lista de visitantes do grupo |
| 30 | `GET` | `/exportacao/grupos-encontros` | Retrieve group meetings |
| 31 | `GET` | `/exportacao/grupos-encontros-participantes` | Retrieve participants of group meetings |
| 32 | `GET` | `/exportacao/grupos-encontros-visitantes` | Retrieve group meeting visitors |
| 33 | `GET` | `/exportacao/grupos-encontros-visitas` | Retrieve group meeting visits |
| 34 | `GET` | `/exportacao/ministerios-participantes` | Retrieve participant ministries |
| 35 | `GET` | `/exportacao/ministerios-visitantes` | Retrieve ministry visitors |
| 36 | `GET` | `/exportacao/ministerios-encontros` | Retrieve ministry meetings |
| 37 | `GET` | `/exportacao/ministerios-encontros-participantes` | Exporta dados de participantes de encontros de ministérios |
| 38 | `GET` | `/exportacao/ministerios-encontros-visitantes` | Exporta dados de ministérios, encontros e visitantes |
| 39 | `GET` | `/exportacao/ministerios-encontros-visitas` | Exporta dados de ministérios, encontros e visitas |
| 40 | `GET` | `/exportacao/lancamentos-financeiros` | Export financial transactions |
| 41 | `GET` | `/exportacao/cultos-presenca` | Retrieve attendance records for cults within a date range |
| 42 | `GET` | `/noticia/listagem-noticias` | Lista as noticias |
| 43 | `GET` | `/noticia/listagem-categorias` | Lista as categorias |
| 44 | `GET` | `/noticia/listagem-noticias-anexos` | Lista os anexos das notícias (Link, Áudio, Vídeo) |
| 45 | `GET` | `/pessoa?page={page}&per-page={perPage}&expand={expand}` | Retorna a listagem de cadastros de pessoa |
| 46 | `GET` | `/pessoa/{id}` | Retorna o cadastro de uma pessoa especifica |
| 47 | `POST` | `/pessoa/search` | Retona a liategem de pessoas aplicando o filtro informado |
| 48 | `GET` | `/pessoa/aniversariantes/{mes}/{dia}` | Retorna lista de pessoas que fazem aniversário no mês e dia informados |
| 49 | `PATCH` | `/pessoa/{id}/migrar` | Migra um cadastro de pessoa de um tipo e subtipo para outro |
| 50 | `GET` | `/pessoa/{id}/familiares` | Retorna todos os familiares vinculados a pessoa |
| 51 | `GET` | `/pessoa/{id}/ocorrencias` | Retorna uma listagem de todas as ocorrencias da pessoa |
| 52 | `GET` | `/pessoa/{id}/grupos` | Retorna uma listagem de todos os grupos que a pessoa participa |
| 53 | `POST` | `/pessoa/authenticate-by-user` | Autenicação por usuário |
| 54 | `POST` | `/pessoa/authenticate-by-temp-token` | Autenticação por token temporário |
| 55 | `POST` | `/pessoa/{id}/create-temp-token` | Create a temporary token for a Pessoa |
| 56 | `GET` | `/solicitacao` | Lista de solicitações |
| 57 | `GET` | `/solicitacao/{id}` | Detalhes de uma solicitação |
| 58 | `POST` | `/solicitacao/{id}/atualizacao` | Adiciona uma atualização a uma solicitação |
| 59 | `GET` | `/solicitacao/categorias` | Lista de categorias de solicitações |

---

# Detalhamento dos endpoints


## Culto

### `POST /culto/salvar-presenca`

Salva a presença da pessoa no culto especificado  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `Authorization` | header | sim | string | Token de autenticação da instituição | Bearer token_xyz |

**Corpo da requisição:**

`application/json`
- `idCulto` (integer) **(obrigatório)** — Id do culto; ex: `123`
- `id` (integer) — ID da agenda do culto; ex: `1234`
- `pessoa` (object) **(obrigatório)**
  - `idPessoa` (string) — ID da pessoa; ex: `2872`

**Respostas:**

- **201** — Criado com sucesso
  - `title` (string) — ex: `Sucesso`
  - `message` (string) — ex: `Presença salva com sucesso`
  - `idCultoAgenda` (integer) — ex: `49213`
- **400** — BadRequest - Campos pendentes
  - `name` (string) — ex: `Bad Request`
  - `message` (string) — ex: `O campo pessoa.idPessoa é obrigatório.`
  - `code` (integer) — ex: `0`
  - `status` (integer) — ex: `400`
  - `type` (string) — ex: `yii\\web\\BadRequestHttpException`
- **404** — NotFound - Culto não encontrado
  - `name` (string) — ex: `Not Found`
  - `message` (string) — ex: `Culto não encontrado`
  - `code` (integer) — ex: `0`
  - `status` (integer) — ex: `404`
  - `type` (string) — ex: `yii\\web\\NotFoundHttpException`
- **500** — InternalServerError - Erro no servidor
  - `name` (string) — ex: `Internal Server Error`
  - `message` (string) — ex: `Erro no servidor. Entre em contato com o nosso suporte`
  - `code` (integer) — ex: `0`
  - `status` (integer) — ex: `500`
  - `type` (string) — ex: `yii\\web\\ServerErrorHttpException`

---

### `GET /culto/listagem-cultos`

Listagem de cultos  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `id` | path | não | integer | Id culto agenda | 12345 |
| `idTipo` | path | não | integer | Id tipo culto | 123 |
| `finalizado` | path | não | integer | Culto finalizado? 0 ou 1 | 1 |
| `dataInicial` | path | não | date | Data Inicial | 2025-11-01 |
| `dataFinal` | path | não | date | Data Final | 2025-11-30 |
| `Authorization` | header | sim | string | Token de autenticação da instituição | Bearer token_xyz |

**Respostas:**

- **400** — BadRequest - Campos pendentes
  - `name` (string) — ex: `Bad Request`
  - `message` (string) — ex: `Necessário informar data final quando data inicial for informada.`
  - `code` (integer) — ex: `0`
  - `status` (integer) — ex: `400`
  - `type` (string) — ex: `yii\\web\\BadRequestHttpException`
- **200** — Response Successful
  - `data` (array de object)
    - `id` (string) — ex: `123456`
    - `tema` (string) — ex: `CULTO DE DOMINGO`
    - `dataInicio` (string) — ex: `2025-11-09 10:00:00`
    - `dataFim` (string) — ex: `2025-11-09 12:00:00`
    - `idCulto` (string) — ex: `1234`
    - `tipo` (string) — ex: `DOMINGO`
    - `pauta` (string)
    - `orientacoes` (string)
    - `resumo` (string)
    - `pregador` (string) — ex: `JOSÉ DA SILVA`
    - `encarregados` (array de object)
      - `pessoa` (string) — ex: `JOÃO DA SILVA`
      - `pessoaUuid` (string) — ex: `cfaaf651-e704-11eb-8fa2-5032078fb9f0`
      - `funcao` (string) — ex: `MÚSICO`
      - `presenca` (string) — ex: `0`
    - `presencas` (array de object)
      - `pessoa` (string) — ex: `JOSÉ LIMA`
      - `pessoaUuid` (string) — ex: `7c9970da-0231-4de5-9f72-563ea8712cc1`
      - `pastor` (string) — ex: `0`
      - `visitaEspecial` (string) — ex: `0`
    - `informacoes` (array de object)
      - `financeiras` (array de object)
        - `item` (string) — ex: `DOAÇÕES`
        - `valor` (integer) — ex: `5000`
      - `estatisticas` (array de object)
        - `item` (string) — ex: `VISITANTES`
        - `valor` (integer) — ex: `10`
  - `count` (integer) — ex: `20`
  - `totalCount` (integer) — ex: `1000`
  - `pagination` (array de object)
  - `status` (boolean) — ex: `True`

---


## Evento

### `GET /evento/listagem-eventos`

Lista todos os eventos  
Retorna a listagem de eventos  

**Respostas:**

- **200** — Operação bem-sucedida
  - `data` (array de object)
    - `uuid` (string) — ex: `7aea25a6-a9e6-48c8-a4db-879eb1b6a178`
    - `tipo` (string) — ex: `EVENTO`
    - `tema` (string) — ex: `15 agosto`
    - `responsavel` (string) — ex: `Nome do responsável`
    - `dataInicio` (string) — ex: `2024-08-15`
    - `dataFim` (string) — ex: `2024-08-16`
    - `enderecoLogradouro` (string) — ex: `Rua Toaldo Tulio`
    - `enderecoNumero` (string) — ex: `4428`
    - `enderecoComplemento` (string)
    - `enderecoBairro` (string) — ex: `Orleans`
    - `enderecoCep` (string) — ex: `82310386`
    - `enderecoCidade` (string) — ex: `Curitiba`
    - `enderecoEstado` (string) — ex: `Parana`
    - `local` (string) — ex: `Nome do local físico`
  - `status` (boolean) — ex: `True`

---

### `GET /evento/listagem-encontros-eventos`

Lista todos os encontros de eventos  
Retorna a listagem de encontros de eventos  

**Respostas:**

- **200** — Operação bem-sucedida
  - `data` (array de object)
    - `uuidEvento` (string) — ex: `7aea25a6-a9e6-48c8-a4db-879eb1b6a178`
    - `tema` (string) — ex: `15 agosto`
    - `idEncontro` (string) — ex: `123`
    - `uuidResponsavel` (string) — ex: `e0d94fc8-491c-11ef-8044-49dd7bd09fad`
    - `materia` (string) — ex: `Encontro 1`
    - `dataInicio` (string) — ex: `2024-08-15 12:00:00`
    - `dataFim` (string) — ex: `2024-08-15 16:00:00`
    - `observacao` (string) — ex: `observacao`
    - `pauta` (string) — ex: `pauta`
    - `resumo` (string) — ex: `resumo`
  - `status` (boolean) — ex: `True`

---

### `GET /evento/listagem-inscritos-eventos`

Lista todos os inscritos de eventos  
Retorna a listagem de inscritos de eventos  

**Respostas:**

- **200** — Operação bem-sucedida
  - `data` (array de object)
    - `uuidEvento` (string) — ex: `7aea25a6-a9e6-48c8-a4db-879eb1b6a178`
    - `tema` (string) — ex: `15 agosto`
    - `uuidPessoa` (string) — ex: `735a1eb1-4926-11ef-8044-49dd7bd09fad`
    - `dataInscricao` (string) — ex: `2024-07-14 16:09:48`
    - `lote` (string) — ex: `primeiro lote`
    - `valorLote` (string) — ex: `500`
    - `valorDesconto` (string)
    - `valorTotal` (string) — ex: `500`
    - `formaPagamento` (string) — ex: `PIX`
    - `regraPagamento` (string)
    - `regraPessoa` (string)
    - `idResumo` (string) — ex: `555`
  - `status` (boolean) — ex: `True`

---

### `GET /evento/listagem-resumos-eventos`

Lista todos os resumos de inscritos de eventos  
Retorna a listagem de resumos de inscritos de eventos  

**Respostas:**

- **200** — Operação bem-sucedida
  - `data` (array de object)
    - `id` (string) — ex: `555`
    - `uuidResponsavel` (string) — ex: `735a1eb1-4926-11ef-8044-49dd7bd09fad`
    - `valor` (string) — ex: `500`
    - `valorLote` (string) — ex: `500`
    - `valorServico` (string) — ex: `0`
    - `valorDesconto` (string) — ex: `0`
    - `valorTaxa` (string) — ex: `0`
    - `parcelas` (string) — ex: `2`
    - `formaPagamento` (string) — ex: `PIX`
    - `status` (string) — ex: `Pendente`
  - `status` (boolean) — ex: `True`

---

### `GET /evento/listagem-presenca-eventos`

Lista todas as presencas de inscritos de eventos  
Retorna a listagem de presencas de inscritos de eventos  

**Respostas:**

- **200** — Operação bem-sucedida
  - `data` (array de object)
    - `id` (string) — ex: `182604`
    - `idEncontro` (string) — ex: `123`
    - `idEncontroReposicao` (string)
    - `uuidPessoa` (string) — ex: `eba87182-4927-11ef-8044-49dd7bd09fad`
    - `presenca` (string) — ex: `1`
    - `saida` (string) — ex: `0`
    - `aproveitamento` (string)
    - `observacao` (string)
    - `idEventoInscricao` (string) — ex: `456789`
    - `dataCheckIn` (string) — ex: `2024-08-15 09:09:40`
    - `dataCheckOut` (string) — ex: `2024-08-15 16:00:00`
  - `status` (boolean) — ex: `True`

---

### `GET /evento/listagem-encarregados-encontro-eventos`

Lista todos os encarregados de encontros de eventos  
Retorna a listagem de encarregados de encontros de eventos  

**Respostas:**

- **200** — Operação bem-sucedida
  - `data` (array de object)
    - `id` (string) — ex: `13843`
    - `idEncontro` (string) — ex: `123`
    - `uuidPessoa` (string) — ex: `2c6729c4-492c-11ef-8044-49dd7bd09fad`
    - `funcao` (string) — ex: `ZELADOR`
    - `presenca` (string) — ex: `1`
  - `status` (boolean) — ex: `True`

---

### `GET /evento/listagem-regras-inscricao-eventos`

Lista as regras de inscrições de eventos  
Retorna a listagem de regras de inscrições de eventos  

**Respostas:**

- **200** — Operação bem-sucedida
  - `data` (array de object)
    - `uuidEvento` (string) — ex: `71741609-240c-402d-9e66-b01166d58681`
    - `id` (string) — ex: `6331`
    - `descricao` (string) — ex: `crianças`
    - `regra` (array de object)
      - `idadeIni` (intenger) — ex: `0`
      - `idadeFim` (intenger) — ex: `12`
      - `loteInscricao` (string) — ex: `crianças`
      - `tipoFiltroNascimento` (string) — ex: `faixa-etaria`
  - `status` (boolean) — ex: `True`

---

### `GET /evento/listagem-regras-lote-eventos`

Lista as regras de lote de eventos  
Retorna a listagem de regras de lote de eventos  

**Respostas:**

- **200** — Operação bem-sucedida
  - `data` (array de object)
    - `uuidEvento` (string) — ex: `1850d7b3-6a7f-4983-bad9-d5a8dcd9d868`
    - `lote` (string) — ex: `lote 1`
    - `id` (string) — ex: `4521`
    - `ordem` (string) — ex: `1`
    - `descricao` (string) — ex: `cupom 10`
    - `regra` (array de object)
      - `regraFixa` (string) — ex: `Cupom de Desconto`
      - `codCupom` (string) — ex: `CUPOM10`
      - `qtdCupom` (integer) — ex: `5`
    - `valor` (string) — ex: `1000`
    - `desconto` (string) — ex: `1`
    - `porcentagem` (string) — ex: `1`
  - `status` (boolean) — ex: `True`

---

### `GET /evento/listagem-regras-servico-eventos`

Lista as regras de serviço de eventos  
Retorna a listagem de regras de serviço de eventos  

**Respostas:**

- **200** — Operação bem-sucedida
  - `data` (array de object)
    - `uuidEvento` (string) — ex: `e83ee34b-48f6-48d8-91c0-c037b27daeb8`
    - `servico` (string) — ex: `COMPLETO`
    - `id` (string) — ex: `3955`
    - `ordem` (string) — ex: `1`
    - `descricao` (string) — ex: `total 1 real`
    - `regra` (array de object)
      - `regraFixa` (string) — ex: `Primeiras Pessoas a se Inscreverem`
      - `valorRegra` (string) — ex: `5`
    - `valor` (string) — ex: `100`
    - `desconto` (string) — ex: `0`
    - `porcentagem` (string) — ex: `0`
  - `status` (boolean) — ex: `True`

---


## Ensino

### `GET /evento/listagem-ensinos`

Lista todos os ensinos  
Retorna a listagem de ensinos  

**Respostas:**

- **200** — Operação bem-sucedida
  - `data` (array de object)
    - `uuid` (string) — ex: `6eabf036-9206-4a7b-951f-c81abdb85039`
    - `tipo` (string) — ex: `CURSO`
    - `tema` (string) — ex: `20 setembro`
    - `responsavel` (string) — ex: `Nome do responsável`
    - `dataInicio` (string) — ex: `2024-09-20`
    - `dataFim` (string) — ex: `2024-09-22`
    - `enderecoLogradouro` (string) — ex: `Rua Toaldo Tulio`
    - `enderecoNumero` (string) — ex: `4428`
    - `enderecoComplemento` (string)
    - `enderecoBairro` (string) — ex: `Orleans`
    - `enderecoCep` (string) — ex: `82310386`
    - `enderecoCidade` (string) — ex: `Curitiba`
    - `enderecoEstado` (string) — ex: `Parana`
    - `local` (string) — ex: `Nome do local físico`
  - `status` (boolean) — ex: `True`

---

### `GET /evento/listagem-encontros-ensinos`

Lista todos os encontros de ensinos  
Retorna a listagem de encontros de ensinos  

**Respostas:**

- **200** — Operação bem-sucedida
  - `data` (array de object)
    - `uuidEnsino` (string) — ex: `6eabf036-9206-4a7b-951f-c81abdb85039`
    - `tema` (string) — ex: `20 setembro`
    - `idEncontro` (string) — ex: `124`
    - `uuidResponsavel` (string) — ex: `e0d94fc8-491c-11ef-8044-49dd7bd09fad`
    - `materia` (string) — ex: `Encontro 1`
    - `dataInicio` (string) — ex: `2024-09-20 13:00:00`
    - `dataFim` (string) — ex: `2024-09-20 16:30:00`
    - `observacao` (string) — ex: `observacao`
    - `pauta` (string) — ex: `pauta`
    - `resumo` (string) — ex: `resumo`
    - `idAula` (string) — ex: `51`
    - `idModulo` (string) — ex: `1`
  - `status` (boolean) — ex: `True`

---

### `GET /evento/listagem-inscritos-ensinos`

Lista todos os inscritos de ensinos  
Retorna a listagem de inscritos de ensinos  

**Respostas:**

- **200** — Operação bem-sucedida
  - `data` (array de object)
    - `uuidEnsino` (string) — ex: `6eabf036-9206-4a7b-951f-c81abdb85039`
    - `tema` (string) — ex: `20 setembro`
    - `uuidPessoa` (string) — ex: `59c7f104-4927-11ef-8044-49dd7bd09fad`
    - `dataInscricao` (string) — ex: `2024-06-22 09:09:40`
    - `lote` (string) — ex: `segundo lote`
    - `valorLote` (string) — ex: `600`
    - `valorDesconto` (string)
    - `valorTotal` (string) — ex: `600`
    - `formaPagamento` (string) — ex: `PIX`
    - `regraPagamento` (string)
    - `regraPessoa` (string)
    - `idResumo` (string) — ex: `556`
    - `status` (string) — ex: `Cursando`
    - `nota` (string) — ex: `70`
  - `status` (boolean) — ex: `True`

---

### `GET /evento/listagem-resumos-ensinos`

Lista todos os resumos de inscritos de ensinos  
Retorna a listagem de resumos de inscritos de ensinos  

**Respostas:**

- **200** — Operação bem-sucedida
  - `data` (array de object)
    - `id` (string) — ex: `556`
    - `uuidResponsavel` (string) — ex: `59c7f104-4927-11ef-8044-49dd7bd09fad`
    - `valor` (string) — ex: `600`
    - `valorLote` (string) — ex: `500`
    - `valorServico` (string) — ex: `0`
    - `valorDesconto` (string) — ex: `0`
    - `valorTaxa` (string) — ex: `0`
    - `parcelas` (string) — ex: `1`
    - `formaPagamento` (string) — ex: `PIX`
    - `status` (string) — ex: `Pago`
  - `status` (boolean) — ex: `True`

---

### `GET /evento/listagem-presenca-ensinos`

Lista todas as presencas de inscritos de ensinos  
Retorna a listagem de presencas de inscritos de ensinos  

**Respostas:**

- **200** — Operação bem-sucedida
  - `data` (array de object)
    - `id` (string) — ex: `182585`
    - `idEncontro` (string) — ex: `124`
    - `idEncontroReposicao` (string)
    - `uuidPessoa` (string) — ex: `1ab37347-492a-11ef-8044-49dd7bd09fad`
    - `presenca` (string) — ex: `0`
    - `saida` (string) — ex: `0`
    - `aproveitamento` (string)
    - `observacao` (string)
    - `idEventoInscricao` (string) — ex: `456789`
    - `dataCheckIn` (string) — ex: `2024-09-20 09:00:00`
    - `dataCheckOut` (string) — ex: `2024-09-20 16:00:00`
  - `status` (boolean) — ex: `True`

---

### `GET /evento/listagem-encarregados-encontro-ensinos`

Lista todos os encarregados de encontros de ensinos  
Retorna a listagem de encarregados de encontros de ensinos  

**Respostas:**

- **200** — Operação bem-sucedida
  - `data` (array de object)
    - `id` (string) — ex: `13844`
    - `idEncontro` (string) — ex: `124`
    - `uuidPessoa` (string) — ex: `a8f78445-492c-11ef-8044-49dd7bd09fad`
    - `funcao` (string) — ex: `PROFESSOR`
    - `presenca` (string) — ex: `1`
  - `status` (boolean) — ex: `True`

---

### `GET /evento/listagem-modulos`

Lista todos os módulos  
Retorna a listagem de módulos  

**Respostas:**

- **200** — Operação bem-sucedida
  - `data` (array de object)
    - `id` (string) — ex: `1`
    - `nome` (string) — ex: `Módulo 1`
    - `descricao` (string) — ex: `Descrição do módulo`
    - `media` (string) — ex: `70`
    - `presenca` (string) — ex: `8000`
  - `status` (boolean) — ex: `True`

---

### `GET /evento/listagem-aulas`

Lista todas as aulas  
Retorna a listagem de aulas  

**Respostas:**

- **200** — Operação bem-sucedida
  - `data` (array de object)
    - `id` (string) — ex: `1`
    - `idModulo` (string) — ex: `1`
    - `nome` (string) — ex: `Aula 1`
    - `descricao` (string) — ex: `Descrição da aula`
    - `tempo` (string) — ex: `50`
    - `ordem` (string) — ex: `1`
  - `status` (boolean) — ex: `True`

---

### `GET /evento/listagem-regras-inscricao-ensinos`

Lista as regras de inscrições de ensinos  
Retorna a listagem de regras de inscrições de ensinos  

**Respostas:**

- **200** — Operação bem-sucedida
  - `data` (array de object)
    - `uuidEnsino` (string) — ex: `6a3d594c-c7b0-4885-b65e-25d5c81c298e`
    - `id` (string) — ex: `6349`
    - `descricao` (string) — ex: `visitantes`
    - `regra` (array de object)
      - `tipoCadastro` (string) — ex: `Visitante`
      - `tipoFiltroNascimento` (string) — ex: `faixa-etaria`
  - `status` (boolean) — ex: `True`

---

### `GET /evento/listagem-regras-lote-ensinos`

Lista as regras de lote de ensinos  
Retorna a listagem de regras de lote de ensinos  

**Respostas:**

- **200** — Operação bem-sucedida
  - `data` (array de object)
    - `uuidEnsino` (string) — ex: `e0b24432-7595-4ead-acf6-b986ad904ba8`
    - `lote` (string) — ex: `lote 1`
    - `id` (string) — ex: `4525`
    - `ordem` (string) — ex: `1`
    - `descricao` (string) — ex: `Desconto de 9,99 pra quem participou em Dez 2024`
    - `regra` (array de object)
      - `regraFixa` (string) — ex: `Pessoas Inscritas no Evento/Ensino`
      - `idProjeto` (string) — ex: `Ensino Dez 2024`
    - `valor` (string) — ex: `999`
    - `desconto` (string) — ex: `1`
    - `porcentagem` (string) — ex: `0`
  - `status` (boolean) — ex: `True`

---

### `GET /evento/listagem-regras-servico-ensinos`

Lista as regras de serviço de ensinos  
Retorna a listagem de regras de serviço de ensinos  

**Respostas:**

- **200** — Operação bem-sucedida
  - `data` (array de object)
    - `uuidEnsino` (string) — ex: `e0b24432-7595-4ead-acf6-b986ad904ba8`
    - `servico` (string) — ex: `HOTEL`
    - `id` (string) — ex: `3964`
    - `ordem` (string) — ex: `1`
    - `descricao` (string) — ex: `Cupom desconto 15%`
    - `regra` (array de object)
      - `regraFixa` (string) — ex: `Cupom de Desconto`
      - `codCupom` (string) — ex: `DESCONTO15`
      - `qtdCupom` (string) — ex: `20`
    - `valor` (string) — ex: `1500`
    - `desconto` (string) — ex: `1`
    - `porcentagem` (string) — ex: `1`
  - `status` (boolean) — ex: `True`

---


## Exportação

### `GET /exportacao/pessoas`

Retorna cadastros de pessoa  

**Respostas:**

- **200** — Lista de pessoas
  - (array)
    - `pessoa_uuid` (string) — ex: `ba839be9-ea58-11eb-bdf2-5cc42d5b90b8`
    - `pessoa_nome` (string) — ex: `USUARIO DE TESTE`
    - `pessoa_sexo` (string) — ex: `Masculino`
    - `pessoa_nascimento` (string) — ex: `2002-11-30`
    - `pessoa_tipo` (string) — ex: `Funcionário`
    - `pessoa_subtipo` (string) — ex: `FINANCEIRO`
    - `pessoa_status` (string) — ex: `ATIVO`
    - `instituicao_nome` (string) — ex: `PROVER`
    - `endereco_cep` (string) — ex: `81200100`
    - `endereco_logradouro` (string) — ex: `Rua Prof. Pedro Viriato`
    - `endereco_numero` (string) — ex: `467`
    - `endereco_bairro` (string) — ex: `Campo Comprido`
    - `endereco_cidade` (string) — ex: `Curitiba`
    - `endereco_estado` (string) — ex: `Paraná`
    - `endereco_latitude` (string) — ex: `10.7719521`
    - `endereco_longitude` (string) — ex: `106.6783333`
    - `profissao` (string) — ex: `TESTER`
    - `escolaridade` (string) — ex: `Ensino Superior (completo)`
    - `estadocivil` (string) — ex: `Solteiro(a)`
    - `ocorrencias` (string) — ex: `DECIDIU POR CRISTO, MIGRAÇÃO DE CADASTRO`
    - `pessoa_celular` (string) — ex: `9999999999`
    - `pessoa_cpf` (string) — ex: `99999999999`
    - `pessoa_rg` (string) — ex: `99999999`
    - `pessoa_email` (string) — ex: `suporte@sistemaprover.com.br`
    - `pessoa_foto` (string) — ex: `https://sis.sistemaprover.com.br/backend/anexo/img?f=185/2024/05/07_118_5sdsfef82e3e5e.png`
    - `dataCadastro` (string) — ex: `2025-11-13 10:00:00`
    - `comoConheceu` (string) — ex: `AMIGO`
- **default** — Response Error

---

### `GET /exportacao/ocorrencias`

Retrieve occurrences  
Retorna a listagem de ocorrências cadastradas  

**Respostas:**

- **200** — Lista de ocorrências
  - (array)
    - `id` (integer) — ID Ocorrência
    - `nome` (string) — Nome Ocorrência
    - `idInstituicao` (integer) — ID Instituição
- **401** — Unauthorized
- **500** — Internal Server Error

---

### `GET /exportacao/pessoas-ocorrencias`

Retrieve occurrences of people  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `nome` | query | não | string | Name of the occurrence |  |
| `dataInicial` | query | não | string | Start date for filtering occurrences |  |
| `dataFinal` | query | não | string | End date for filtering occurrences |  |
| `uuidPessoa` | query | não | string | UUID of the person |  |
| `id` | query | não | integer | ID of the occurrence |  |

**Respostas:**

- **200** — List of occurrences
  - (array)
    - `pessoa_uuid` (string) — UUID of the person
    - `ocorrencia_id` (integer) — ID of the occurrence
    - `ocorrencia_nome` (string) — Name of the occurrence
    - `historico_data` (string) — Date of the occurrence
- **400** — Invalid input
- **401** — Unauthorized
- **500** — Internal server error

---

### `GET /exportacao/grupos`

Retrieve groups information  

**Respostas:**

- **200** — Successful operation
  - (array)
    - `grupo_id` (integer) — Group ID
    - `grupo_nome` (string) — Group name
    - `grupo_tipo` (string) — Group type
    - `grupo_status` (string) — Group status
    - `grupo_data_criacao` (string) — Group creation date
    - `rede_id` (integer) — Network ID
    - `rede_nome` (string) — Network name
    - `grupo_ciclo` (string) — Group cycle
    - `grupo_limite_pessoas` (integer) — Group people limit
    - `endereco_cep` (string) — Address ZIP code
    - `endereco_logradouro` (string) — Address street
    - `endereco_numero` (string) — Address number
    - `endereco_bairro` (string) — Address neighborhood
    - `endereco_cidade` (string) — Address city
    - `endereco_estado` (string) — Address state
    - `endereco_latitude` (number) — Address latitude
    - `endereco_longitude` (number) — Address longitude
    - `instituicao_nome` (string) — Institution name
    - `pessoa_uuid_{nomeFuncao}` (string) — Person UUID for each function
- **401** — Unauthorized
- **403** — Forbidden
- **404** — Not Found

---

### `GET /exportacao/ministerios`

Retrieve ministries information  

**Respostas:**

- **200** — Successful retrieval of ministries information
  - (array)
    - `ministerio_id` (integer) — Ministry ID
    - `ministerio_nome` (string) — Ministry name
    - `ministerio_tipo` (string) — Ministry type
    - `ministerio_status` (string) — Ministry status
    - `ministerio_data_criacao` (string) — Ministry creation date
    - `rede_id` (integer) — Network ID
    - `rede_nome` (string) — Network name
    - `ministerio_ciclo` (string) — Ministry cycle
    - `ministerio_limite_pessoas` (integer) — Ministry people limit
    - `instituicao_nome` (string) — Institution name
    - `pessoa_uuid_<funcao>` (string) — UUID of the person in the specific function
- **401** — Unauthorized
- **500** — Internal Server Error

---

### `GET /exportacao/grupos-participantes`

Retrieve participant groups  

**Respostas:**

- **200** — List of participant groups
  - (array)
    - `grupo_id` (integer) — Group ID
    - `pessoa_uuid` (string) — Person UUID
    - `cargo` (string) — Position name
    - `data_entrada` (string) — Entry date
    - `data_saida` (string) — Exit date
- **401** — Unauthorized
- **500** — Internal Server Error

---

### `GET /exportacao/grupos-visitantes`

Lista de visitantes do grupo  

**Respostas:**

- **200** — Lista de visitantes do grupo
  - (array)
    - `grupo_id` (integer) — ID Grupo
    - `pessoa_uuid` (string) — Pessoa UUID
    - `data_cadastro` (string) — Data de cadastro
    - `data_saida` (string) — data de saída
- **401** — Unauthorized
- **500** — Internal Server Error

---

### `GET /exportacao/grupos-encontros`

Retrieve group meetings  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `dataInicial` | query | sim | string | Start date for filtering meetings |  |
| `dataFinal` | query | sim | string | End date for filtering meetings |  |

**Respostas:**

- **200** — List of group meetings
  - (array)
    - `grupo_id` (integer) — Group ID
    - `grupo_nome` (string) — Group name
    - `encontro_id` (integer) — Meeting ID
    - `tema` (string) — Meeting theme
    - `observacao` (string) — Observation
    - `supervisao` (string) — Supervision
    - `local` (string) — Location
    - `data_inicio` (string) — Start date
    - `data_fim` (string) — End date
    - `status` (string) — Status
    - `oferta` (number) — Offer
    - `pauta` (string) — Pauta
    - `resumo` (string) — Summary
    - `num_criancas` (integer) — Number of children
    - `quilos_doados` (number) — Donated kilos
- **400** — Invalid input
- **401** — Unauthorized
- **500** — Internal Server Error

---

### `GET /exportacao/grupos-encontros-participantes`

Retrieve participants of group meetings  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `dataInicial` | query | sim | string | Start date for filtering meetings |  |
| `dataFinal` | query | sim | string | End date for filtering meetings |  |

**Respostas:**

- **200** — List of participants of group meetings
  - (array)
    - `grupo_id` (integer) — Group ID
    - `grupo_nome` (string) — Group name
    - `encontro_id` (integer) — Meeting ID
    - `tema` (string) — Meeting theme
    - `data_inicio` (string) — Start date
    - `pessoa_uuid` (string) — Person UUID
    - `pessoa_nome` (string) — Person name
    - `presenca` (boolean) — Presence status
    - `anotacao` (string) — Annotation
- **400** — Invalid input
- **401** — Unauthorized
- **500** — Internal Server Error

---

### `GET /exportacao/grupos-encontros-visitantes`

Retrieve group meeting visitors  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `dataInicial` | query | sim | string | Start date for filtering meetings |  |
| `dataFinal` | query | sim | string | End date for filtering meetings |  |

**Respostas:**

- **200** — List of group meeting visitors
  - (array)
    - `grupo_id` (integer) — Group ID
    - `grupo_nome` (string) — Group name
    - `encontro_id` (integer) — Meeting ID
    - `tema` (string) — Meeting theme
    - `data_inicio` (string) — Start date
    - `pessoa_uuid` (string) — Person UUID
    - `pessoa_nome` (string) — Person name
    - `presenca` (boolean) — Presence status
    - `anotacao` (string) — Annotation
- **400** — Invalid input
- **401** — Unauthorized
- **500** — Internal Server Error

---

### `GET /exportacao/grupos-encontros-visitas`

Retrieve group meeting visits  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `dataInicial` | query | sim | string | Start date for filtering visits |  |
| `dataFinal` | query | sim | string | End date for filtering visits |  |

**Respostas:**

- **200** — List of group meeting visits
  - (array)
    - `grupo_id` (integer) — Group ID
    - `grupo_nome` (string) — Group name
    - `encontro_id` (integer) — Meeting ID
    - `tema` (string) — Meeting theme
    - `data_inicio` (string) — Start date
    - `pessoa_uuid` (string) — Person UUID
    - `pessoa_nome` (string) — Person name
- **400** — Invalid input
- **401** — Unauthorized
- **500** — Internal Server Error

---

### `GET /exportacao/ministerios-participantes`

Retrieve participant ministries  

**Respostas:**

- **200** — List of participant ministries
  - (array)
    - `ministerio_id` (integer) — Ministry ID
    - `pessoa_uuid` (string) — Person UUID
    - `cargo` (string) — Position name
    - `data_entrada` (string) — Entry date
    - `data_saida` (string) — Exit date
- **401** — Unauthorized
- **500** — Internal Server Error

---

### `GET /exportacao/ministerios-visitantes`

Retrieve ministry visitors  

**Respostas:**

- **200** — List of ministry visitors
  - (array)
    - `ministerio_id` (integer) — Ministry ID
    - `pessoa_uuid` (string) — Person UUID
    - `data_cadastro` (string) — Registration date
    - `data_saida` (string) — Exit date
- **401** — Unauthorized
- **500** — Internal Server Error

---

### `GET /exportacao/ministerios-encontros`

Retrieve ministry meetings  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `dataInicial` | query | sim | string | Start date for filtering meetings |  |
| `dataFinal` | query | sim | string | End date for filtering meetings |  |

**Respostas:**

- **200** — List of ministry meetings
  - (array)
    - `ministerio_id` (integer) — Ministry ID
    - `ministerio_nome` (string) — Ministry name
    - `encontro_id` (integer) — Meeting ID
    - `tema` (string) — Meeting theme
    - `observacao` (string) — Observation
    - `supervisao` (string) — Supervision
    - `local` (string) — Location
    - `data_inicio` (string) — Start date
    - `data_fim` (string) — End date
    - `status` (string) — Status
    - `oferta` (number) — Offer
    - `pauta` (string) — Pauta
    - `resumo` (string) — Summary
    - `num_criancas` (integer) — Number of children
    - `quilos_doados` (number) — Donated kilos
- **400** — Invalid input
- **401** — Unauthorized
- **500** — Internal Server Error

---

### `GET /exportacao/ministerios-encontros-participantes`

Exporta dados de participantes de encontros de ministérios  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `dataInicial` | query | sim | string | Data inicial no formato YYYY-MM-DD | 2023-01-01 |
| `dataFinal` | query | sim | string | Data final no formato YYYY-MM-DD | 2023-12-31 |

**Respostas:**

- **200** — Dados exportados com sucesso
  - (array)
    - `id` (integer) — ex: `1`
    - `nome` (string) — ex: `Nome do Participante`
    - `ministerio` (string) — ex: `Nome do Ministério`
    - `dataEncontro` (string) — ex: `2023-06-15`
- **400** — Data inicial maior que a data final
  - `message` (string) — ex: `Data inicial maior que a data final`

---

### `GET /exportacao/ministerios-encontros-visitantes`

Exporta dados de ministérios, encontros e visitantes  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `dataInicial` | query | sim | string | Data inicial no formato YYYY-MM-DD |  |
| `dataFinal` | query | sim | string | Data final no formato YYYY-MM-DD |  |

**Respostas:**

- **200** — Dados exportados com sucesso
  - (array)
- **400** — Data inicial maior que a data final
  - `message` (string) — ex: `Data inicial maior que a data final`

---

### `GET /exportacao/ministerios-encontros-visitas`

Exporta dados de ministérios, encontros e visitas  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `dataInicial` | query | sim | string | Data inicial no formato YYYY-MM-DD |  |
| `dataFinal` | query | sim | string | Data final no formato YYYY-MM-DD |  |

**Respostas:**

- **200** — Dados exportados com sucesso
  - (array)
- **400** — Data inicial maior que a data final
  - `message` (string) — ex: `Data inicial maior que a data final`

---

### `GET /exportacao/lancamentos-financeiros`

Export financial transactions  
Retrieve financial transactions based on provided date range.  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `data` | query | sim | string | Start date for the financial transactions in YYYY-MM-DD format |  |
| `dataFinal` | query | não | string | End date for the financial transactions in YYYY-MM-DD format |  |

**Respostas:**

- **200** — Successful retrieval of financial transactions
  - (array)
    - `instituicao_uid` (string) — Institution UID
    - `instituicao_codigo` (string) — Institution code
    - `nome` (string) — Institution name
    - `lancamento_id_interno` (integer) — Internal transaction ID
    - `data` (string) — Transaction date
    - `ano_mes_ref` (string) — Reference year and month
    - `tipo_lancamento` (string) — Type of transaction
    - `valor` (number) — Transaction value
    - `conta_id` (integer) — Account ID
    - `conta_codigo` (string) — Account code
    - `conta_classificacao` (string) — Account classification
    - `conta` (string) — Account name
    - `categoria_id` (integer) — Category ID
    - `categoria_codigo` (string) — Category code
    - `categoria_classificacao` (string) — Category classification
    - `categoria` (string) — Category name
    - `item_codigo_id` (integer) — Item code ID
    - `item_codigo` (string) — Item code
    - `item_classificacao` (string) — Item classification
    - `item` (string) — Item name
    - `observacao` (string) — Observation
    - `historico` (string) — History
    - `pessoa_id` (integer) — Person ID
    - `pessoa_uuid` (string) — Person UUID
    - `pessoa` (string) — Person name
    - `pessoa_cpf` (string) — Person CPF
    - `fornecedor_id` (integer) — Supplier ID
    - `fornecedor` (string) — Supplier name
    - `fornecedor_cpf_cnpj` (string) — Supplier CPF/CNPJ
    - `centro_custo_id` (integer) — Cost center ID
    - `centro_custo_codigo` (string) — Cost center code
    - `centro_custo` (string) — Cost center name
    - `forma_pagamento` (string) — Payment method
    - `num_lancamento` (string) — Transaction number
    - `num_documento_lancamento` (string) — Transaction document number
    - `num_documento_item` (string) — Item document number
    - `is_transferencia` (boolean) — Is transfer
    - `id_origem` (string) — Origin ID
    - `origem` (string) — Origin description
- **400** — Invalid parameters or missing required parameters
  - `message` (string) — Error message
- **401** — Unauthorized
  - `message` (string) — Error message

---

### `GET /exportacao/cultos-presenca`

Retrieve attendance records for cults within a date range  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `dataInicial` | query | sim | string | Start date for the range in YYYY-MM-DD format |  |
| `dataFinal` | query | sim | string | End date for the range in YYYY-MM-DD format |  |

**Respostas:**

- **200** — Successful retrieval of attendance records
  - (array)
    - `culto_regra_id` (integer)
    - `culto_agenda_id` (integer)
    - `culto_tipo` (string)
    - `culto` (string)
    - `horaInicio` (string)
    - `horaFim` (string)
    - `tema` (string)
    - `dataInicio` (string)
    - `dataFim` (string)
    - `pessoa_uuid` (string)
    - `pessoa_nome` (string)
    - `instituicao_uid` (string)
    - `instituicao_codigo` (string)
    - `instituicao_nome` (string)
- **400** — Invalid date range provided
- **401** — Unauthorized

---


## Noticia

### `GET /noticia/listagem-noticias`

Lista as noticias  
Retorna a listagem de noticias  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `uuidCategoria` | query | não | string | Uuid da categoria |  |
| `dataPublicacao` | query | não | string | Data de publicacao formato YYYY-MM-DD |  |
| `visibilidade` | query | não | string | Visibilidade da notícia (app / site) |  |

**Respostas:**

- **200** — Operação bem-sucedida
  - `data` (array de object)
    - `uuid` (string) — ex: `f328a1f4-df27-11eb-a68b-2409be9ede7f`
    - `titulo` (string) — ex: `Esse é o título da notícia`
    - `subtitulo` (string) — ex: `Esse é o subtítulo`
    - `conteudo` (string) — ex: `<p>Conteúdo da notícia</p>`
    - `imagem` (string) — ex: `1/2024/08/12_312129_5d51ad2887dea.png`
    - `imagemSite` (string) — ex: `1/2024/04/17_312129_662025b5f25f3.png`
    - `instituicao` (string) — ex: `Instituição`
    - `uuidCategoria` (string) — ex: `f328c819-df27-11eb-a68b-2409be9ede7f`
    - `categoria` (string) — ex: `Destaques`
    - `divulgarApp` (string) — ex: `1`
    - `divulgarSite` (string) — ex: `0`
    - `destaque` (string) — ex: `1`
    - `url` (string) — ex: `titulo-noticia`
    - `dataHoraInicioPublicacao` (string) — ex: `2024-08-15 00:00:00`
    - `dataHoraFimPublicacao` (string) — ex: `2024-08-16 00:00:00`
  - `status` (boolean) — ex: `True`

---

### `GET /noticia/listagem-categorias`

Lista as categorias  
Retorna a listagem de categorias  

**Respostas:**

- **200** — Operação bem-sucedida
  - `data` (array de object)
    - `uuid` (string) — ex: `f328c819-df27-11eb-a68b-2409be9ede7f`
    - `categoria` (string) — ex: `Destaques`
    - `ordem` (string) — ex: `1`
    - `instituicao` (string) — ex: `Instituição`
  - `status` (boolean) — ex: `True`

---

### `GET /noticia/listagem-noticias-anexos`

Lista os anexos das notícias (Link, Áudio, Vídeo)  
Retorna a listagem de anexos das notícias  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `uuidNoticia` | query | não | string | Uuid da noticia |  |

**Respostas:**

- **200** — Operação bem-sucedida
  - `data` (array de object)
    - `uuidNoticia` (string) — ex: `f328a1f4-df27-11eb-a68b-2409be9ede7f`
    - `tipo` (string) — ex: `Link`
    - `id` (string) — ex: `15461`
    - `ordem` (string) — ex: `1`
    - `nome` (string) — ex: `Sistema Prover`
    - `url` (string) — ex: `https://sis.sistemaprover.com.br/`
    - `config` (string) — ex: `{}`
  - `status` (boolean) — ex: `True`

---


## Pessoa

### `GET /pessoa?page={page}&per-page={perPage}&expand={expand}`

Retorna a listagem de cadastros de pessoa  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `page` | path | sim | integer | Pagina atual da listagem | 1 |
| `perPage` | path | sim | integer | Quantidade de registros listados pro pagina | 10 |
| `expand` | path | não | string | Informações adicionais | contato,endereco |

**Respostas:**

- **200** — Response Successful
- **default** — Response Error

---

### `GET /pessoa/{id}`

Retorna o cadastro de uma pessoa especifica  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `id` | path | sim | string | Identificação da pessoa | 750d874c-eea2-496a-a674-505b1ac0fd56 |

**Respostas:**

- **200** — Response Successful
- **default** — Response Error

---

### `POST /pessoa/search`

Retona a liategem de pessoas aplicando o filtro informado  

**Corpo da requisição:**

`application/json`
- `nome` (string) — nome do usuario.; ex: `John Doe`
- `email` (string) — email do usuario.; ex: `john@doe.com`
- `telefone` (string) — telefone do usuario.; ex: `41999999999`
- `cpf` (string) — CPF do usuario.; ex: `12345678978`

**Respostas:**

- **200** — Response Successful
- **default** — Response Error

---

### `GET /pessoa/aniversariantes/{mes}/{dia}`

Retorna lista de pessoas que fazem aniversário no mês e dia informados  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `mes` | path | sim | integer | The month of the birthday (1-12) | 1 |
| `dia` | path | sim | integer | The day of the birthday (1-31) | 15 |

**Respostas:**

- **200** — List of people with birthdays on the specified date
  - `data` (array de object)
    - `uuid` (string) — Unique identifier of the person
    - `nome` (string) — Name of the person
    - `nascimento` (string) — Birth date of the person
    - `sexo` (string) — Gender of the person
    - `codigo` (string) — Additional code information
    - `divulgar_aniversario` (boolean) — Whether the birthday is public
    - `pessoa_tipo_id` (integer) — Type ID of the person
    - `pessoa_tipo` (string) — Type of the person
    - `pessoa_subtipo_id` (integer) — Subtype ID of the person
    - `pessoa_subtipo` (string) — Subtype of the person
    - `email` (string) — Email of the person
    - `celular` (string) — Mobile phone number
    - `telefone` (string) — Residential phone number
    - `instituicao` (string) — Institution name
    - `instituicao_codigo` (string) — Institution code
- **400** — Invalid input parameters
- **500** — Internal server error

---

### `PATCH /pessoa/{id}/migrar`

Migra um cadastro de pessoa de um tipo e subtipo para outro  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `id` | path | sim | string | Uuid da pessoa | b54447b0-4373-4801-91fb-dc90bdd61a56 |

**Corpo da requisição:**

`application/json`
- `idPessoaTipo` (string) — Id do tipo de pessoa (1: Membro, 2: Pastor, 3: Funcionário, 4: Liderança, 5: Visitante); ex: `1`
- `idSubtipo` (string) — Id do subtipo (tipo de membro); ex: `12345`

**Respostas:**

- **400** — BadRequest - Campos pendentes
  - `name` (string) — ex: `Bad Request`
  - `message` (string) — ex: `Tipo da pessoa não informado`
  - `code` (integer) — ex: `0`
  - `status` (integer) — ex: `400`
  - `type` (string) — ex: `yii\\web\\BadRequestHttpException`
- **200** — Response Successful
  - `message` (string) — ex: `Pessoa migrada com sucesso!`
  - `status` (boolean) — ex: `True`
- **default** — Response Error
  - `message` (string) — ex: `Ocorreu um erro ao migrar a pessoa`
  - `status` (boolean) — ex: `False`

---


## Pessoa - Familiares

### `GET /pessoa/{id}/familiares`

Retorna todos os familiares vinculados a pessoa  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `id` | path | sim | string | id da pessoa | 722d874c-eea2-496a-a674-505b1ac0fd33 |

**Respostas:**

- **200** — Response Successful
- **default** — Response Error

---


## Pessoa - Historico

### `GET /pessoa/{id}/ocorrencias`

Retorna uma listagem de todas as ocorrencias da pessoa  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `id` | path | sim | string | id da pessoa | 2e8491fe-ea21-11eb-96c8-02c5a2c03101 |

**Respostas:**

- **200** — Response Successful
- **default** — Response Error

---


## Pessoa - Grupos

### `GET /pessoa/{id}/grupos`

Retorna uma listagem de todos os grupos que a pessoa participa  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `id` | path | sim | string | id da pessoa | 2e8491fe-ea21-11eb-96c8-02c5a2c03101 |

**Respostas:**

- **200** — Response Successful
- **default** — Response Error

---


## Pessoa - Autenticação

### `POST /pessoa/authenticate-by-user`

Autenicação por usuário  

**Corpo da requisição:**

`application/json`
- `user` (string) **(obrigatório)** — ex: `usuario123`
- `password` (string) **(obrigatório)** — ex: `senha123`

**Respostas:**

- **200** — Login bem-sucedido
  - `user` (object)
    - `uuid` (string) — ex: `123e4567-e89b-12d3-a456-426614174000`
    - `nome` (string) — ex: `Nome do Usuário`
    - `email` (string) — ex: `usuario@example.com`
    - `foto` (string) — ex: `url_da_foto`
  - `unidade` (object)
    - `token` (string) — ex: `token123`
    - `codigo` (string) — ex: `codigo123`
    - `nome` (string) — ex: `Nome da Instituição`
    - `logo` (string) — ex: `url_do_logo`
- **400** — Dados inválidos ou Instituição inativa
  - `message` (string) — ex: `Dados inválidos: os campos 'user' e 'password' são obrigatórios.`
- **401** — Usuário e/ou Senha inválido(s)
  - `message` (string) — ex: `Usuário e/ou Senha inválido(s)`

---

### `POST /pessoa/authenticate-by-temp-token`

Autenticação por token temporário  

**Corpo da requisição:**

`application/json`
- `token` (string) **(obrigatório)** — ex: `tempToken123`

**Respostas:**

- **200** — Autenticação bem-sucedida
  - `user` (object)
    - `uuid` (string) — ex: `123e4567-e89b-12d3-a456-426614174000`
    - `nome` (string) — ex: `Nome do Usuário`
    - `email` (string) — ex: `usuario@example.com`
    - `foto` (string) — ex: `url_da_foto`
  - `unidade` (object)
    - `token` (string) — ex: `token123`
    - `codigo` (string) — ex: `codigo123`
    - `nome` (string) — ex: `Nome da Instituição`
    - `logo` (string) — ex: `url_do_logo`
- **400** — Dados inválidos
  - `message` (string) — ex: `Parametros obrigatorios não informados`
- **401** — Token inválido ou expirado
  - `message` (string) — ex: `Token inválido`
- **404** — Registro não localizado
  - `message` (string) — ex: `Registro não localizado`

---

### `POST /pessoa/{id}/create-temp-token`

Create a temporary token for a Pessoa  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `id` | path | sim | string | UUID of the Pessoa |  |

**Respostas:**

- **200** — Temporary token created successfully
  - `token` (string) — Temporary token
- **400** — Bad Request - Missing or invalid parameters
  - `message` (string) — ex: `Parametros obrigatorios não informados`
- **404** — Not Found - Pessoa not found
  - `message` (string) — ex: `Registro não localizado`
- **500** — Internal Server Error - Error generating token
  - `message` (string) — ex: `Erro ao gerar o token`

---


## Solicitações

### `GET /solicitacao`

Lista de solicitações  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `dataCriacaoIni` | query | não | string | Data de criação inicial |  |
| `dataCriacaoFim` | query | não | string | Data de criação final |  |
| `categoria` | query | não | string | UUID da categoria |  |
| `idStatus` | query | não | integer | id Status da solicitação |  |
| `page` | query | não | integer | paginação |  |

**Respostas:**

- **200** — Lista de solicitações
  - `data` (array de object)
    - *(schema: Solicitacao)*
    - `id` (integer) — ID da solicitação; ex: `1`
    - `idInstituicao` (integer) — ID da instituição; ex: `101`
    - `idPessoa` (integer) — ID da pessoa; ex: `202`
    - `status` (string) — Status da solicitação; ex: `pendente`
    - `respondido` (boolean) — Indica se foi respondido; ex: `False`
    - `data` (string) — Data da solicitação; ex: `2025-04-16 12:00:00`
    - `pedido` (string) — Descrição do pedido; ex: `Pedido de 123`
    - `formaPedido` (string) — Forma do pedido; ex: `APLICATIVO | SISTEMA | PORTAL | FORM_LGPD`
    - `pessoa` (object) — Dados básicos da pessoa
      - `uuid` (string) — UUID da pessoa; ex: `750d874c-eea2-496a-a674-505b1ac0fd56`
      - `codigo` (string) — Código da pessoa; ex: `123456`
      - `cpf` (string) — CPF da pessoa; ex: `123.456.789-00`
      - `nome` (string) — Nome da pessoa; ex: `João Silva`
      - `email` (string) — Email da pessoa; ex: `joao.silva@example.com`
      - `telefone` (string) — Telefone da pessoa; ex: `1234-5678`
      - `celular` (string) — Celular da pessoa; ex: `98765-4321`
  - `count` (integer)
  - `totalCount` (integer)
  - `pagination` (object)
    - `pageSize` (integer)
    - `page` (integer)
- **400** — Erro de validação
  - `error` (string)
  - `message` (string)
- **500** — Erro interno do servidor
  - `error` (string)
  - `message` (string)

---

### `GET /solicitacao/{id}`

Detalhes de uma solicitação  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `id` | path | sim | integer | ID da solicitação |  |

**Respostas:**

- **200** — Detalhes da solicitação
  - `data` (object)
    - *(schema: Solicitacao)*
    - `id` (integer) — ID da solicitação; ex: `1`
    - `idInstituicao` (integer) — ID da instituição; ex: `101`
    - `idPessoa` (integer) — ID da pessoa; ex: `202`
    - `status` (string) — Status da solicitação; ex: `pendente`
    - `respondido` (boolean) — Indica se foi respondido; ex: `False`
    - `data` (string) — Data da solicitação; ex: `2025-04-16 12:00:00`
    - `pedido` (string) — Descrição do pedido; ex: `Pedido de 123`
    - `formaPedido` (string) — Forma do pedido; ex: `APLICATIVO | SISTEMA | PORTAL | FORM_LGPD`
    - `pessoa` (object) — Dados básicos da pessoa
      - `uuid` (string) — UUID da pessoa; ex: `750d874c-eea2-496a-a674-505b1ac0fd56`
      - `codigo` (string) — Código da pessoa; ex: `123456`
      - `cpf` (string) — CPF da pessoa; ex: `123.456.789-00`
      - `nome` (string) — Nome da pessoa; ex: `João Silva`
      - `email` (string) — Email da pessoa; ex: `joao.silva@example.com`
      - `telefone` (string) — Telefone da pessoa; ex: `1234-5678`
      - `celular` (string) — Celular da pessoa; ex: `98765-4321`
- **400** — Erro de validação
  - `error` (string)
  - `message` (string)
- **404** — Solicitação não encontrada
  - `error` (string)
  - `message` (string)
- **500** — Erro interno do servidor
  - `error` (string)
  - `message` (string)

---

### `POST /solicitacao/{id}/atualizacao`

Adiciona uma atualização a uma solicitação  

**Parâmetros:**

| Nome | Local | Obrigatório | Tipo | Descrição | Exemplo |
|------|-------|-------------|------|-----------|---------|
| `id` | path | sim | integer | ID da solicitação |  |

**Corpo da requisição:**

`application/json`
- `idStatusSolicitacao` (integer) — ID do status da solicitação; ex: `1`
- `mensagem` (string) — Mensagem da atualização
- `tipoAtualizacao` (string) — ALTERACAO | COMENTARIO | RESPOSTA; ex: `ALTERACAO`

**Respostas:**

- **200** — Atualização adicionada com sucesso
  - `data` (object)
    - *(schema: SolicitacaoAtualizacao)*
    - `id` (integer) — ID do status; ex: `1`
    - `idSolicitacao` (integer) — ID da solicitação; ex: `101`
    - `data` (string) — Data da atualização; ex: `2025-04-16 12:00:00`
    - `mensagem` (string) — Mensagem da atualização; ex: `Atualização de status`
    - `tipo` (string) — Tipo da atualização; ex: `ALTERACAO | COMENTARIO | RESPOSTA`
    - `pessoa_uuid` (string) — UUID da pessoa que fez a atualização; ex: `750d874c-eea2-496a-a674-505b1ac0fd56`
    - `pessoa_nome` (string) — Nome da pessoa que fez a atualização; ex: `Maria Oliveira`
- **400** — Erro de validação
  - `error` (string)
  - `message` (string)

---

### `GET /solicitacao/categorias`

Lista de categorias de solicitações  

**Respostas:**

- **200** — Lista de categorias de solicitações
  - `data` (array de object)
    - *(schema: SolicitacaoCategoria)*
    - `id` (integer) — ID da categoria; ex: `1`
    - `uuid` (string) — UUID da categoria; ex: `750d874c-eea2-496a-a674-505b1ac0fd56`
    - `nome` (string) — Nome da categoria; ex: `Categoria de Oração`
    - `icone` (string) — Ícone da categoria; ex: `prayer-icon`
    - `ordem` (integer) — Ordem da categoria; ex: `1`
    - `idInstituicao` (integer) — ID da instituição associada; ex: `101`
    - `removido` (boolean) — Indica se a categoria foi removida; ex: `False`
    - `tiposList` (array de object)
      - *(schema: SolicitacaoTipo)*
      - `id` (integer) — ID do tipo; ex: `1`
      - `nome` (string) — Nome do tipo; ex: `Tipo de Oração`
      - `removido` (boolean) — Indica se o tipo foi removido; ex: `False`
    - `statusList` (array de object)
      - *(schema: SolicitacaoStatus)*
      - `id` (integer) — ID do status; ex: `1`
      - `nome` (string) — Nome do status; ex: `Pendente`
      - `removido` (boolean) — Indica se o status foi removido; ex: `False`
  - `count` (integer)
  - `totalCount` (integer)
  - `pagination` (object)
    - `pageSize` (integer)
    - `page` (integer)
- **400** — Erro de validação
  - `error` (string)
  - `message` (string)
- **500** — Erro interno do servidor
  - `error` (string)
  - `message` (string)

---


---

# Schemas / Modelos de dados


### CultoAgendaApi


### CultoPresencaApi


### EscalaFuncaoPessoaApi


### PessoaApi


### Solicitacao

Modelo de Solicitacao

- `id` (integer) — ID da solicitação; ex: `1`
- `idInstituicao` (integer) — ID da instituição; ex: `101`
- `idPessoa` (integer) — ID da pessoa; ex: `202`
- `status` (string) — Status da solicitação; ex: `pendente`
- `respondido` (boolean) — Indica se foi respondido; ex: `False`
- `data` (string) — Data da solicitação; ex: `2025-04-16 12:00:00`
- `pedido` (string) — Descrição do pedido; ex: `Pedido de 123`
- `formaPedido` (string) — Forma do pedido; ex: `APLICATIVO | SISTEMA | PORTAL | FORM_LGPD`
- `pessoa` (object) — Dados básicos da pessoa
  - `uuid` (string) — UUID da pessoa; ex: `750d874c-eea2-496a-a674-505b1ac0fd56`
  - `codigo` (string) — Código da pessoa; ex: `123456`
  - `cpf` (string) — CPF da pessoa; ex: `123.456.789-00`
  - `nome` (string) — Nome da pessoa; ex: `João Silva`
  - `email` (string) — Email da pessoa; ex: `joao.silva@example.com`
  - `telefone` (string) — Telefone da pessoa; ex: `1234-5678`
  - `celular` (string) — Celular da pessoa; ex: `98765-4321`

### SolicitacaoAtualizacao

Modelo de Atualização de Solicitação

- `id` (integer) — ID do status; ex: `1`
- `idSolicitacao` (integer) — ID da solicitação; ex: `101`
- `data` (string) — Data da atualização; ex: `2025-04-16 12:00:00`
- `mensagem` (string) — Mensagem da atualização; ex: `Atualização de status`
- `tipo` (string) — Tipo da atualização; ex: `ALTERACAO | COMENTARIO | RESPOSTA`
- `pessoa_uuid` (string) — UUID da pessoa que fez a atualização; ex: `750d874c-eea2-496a-a674-505b1ac0fd56`
- `pessoa_nome` (string) — Nome da pessoa que fez a atualização; ex: `Maria Oliveira`

### SolicitacaoCategoria

Modelo de Solicitacao Categoria

- `id` (integer) — ID da categoria; ex: `1`
- `uuid` (string) — UUID da categoria; ex: `750d874c-eea2-496a-a674-505b1ac0fd56`
- `nome` (string) — Nome da categoria; ex: `Categoria de Oração`
- `icone` (string) — Ícone da categoria; ex: `prayer-icon`
- `ordem` (integer) — Ordem da categoria; ex: `1`
- `idInstituicao` (integer) — ID da instituição associada; ex: `101`
- `removido` (boolean) — Indica se a categoria foi removida; ex: `False`
- `tiposList` (array de object)
- `statusList` (array de object)

### SolicitacaoTipo

Modelo de Tipo de Solicitação

- `id` (integer) — ID do tipo; ex: `1`
- `nome` (string) — Nome do tipo; ex: `Tipo de Oração`
- `removido` (boolean) — Indica se o tipo foi removido; ex: `False`

### SolicitacaoStatus

Modelo de Status de Solicitação

- `id` (integer) — ID do status; ex: `1`
- `nome` (string) — Nome do status; ex: `Pendente`
- `removido` (boolean) — Indica se o status foi removido; ex: `False`

---

## Notas e observações

- Os três servidores listados na spec apontam todos para `/publicapi/v1` (URL relativa) — a base completa é `https://sis.sistemaprover.com.br/publicapi/v1`.
- Vários endpoints de **Evento** e **Ensino** compartilham o mesmo prefixo de rota (`/evento/...`); a diferença está no recurso final (`-eventos` vs `-ensinos`).
- Os endpoints de **Exportação** retornam arrays "achatados" (flat), ideais para alimentar planilhas/BI; muitos exigem `dataInicial` e `dataFinal`.
- O endpoint `/exportacao/lancamentos-financeiros` é o mais rico para integração financeira (conta, categoria, item, centro de custo, fornecedor, forma de pagamento, etc.).
- Schemas `CultoAgendaApi`, `CultoPresencaApi`, `EscalaFuncaoPessoaApi` e `PessoaApi` estão declarados na spec mas **sem propriedades detalhadas** (provavelmente preenchidos via anotação incompleta na origem).
- Mapeamento gerado automaticamente a partir da spec OpenAPI em **2026-06-10**. Para mudanças, rebaixar da fonte: `Prover - API` v`1.0.1`.
