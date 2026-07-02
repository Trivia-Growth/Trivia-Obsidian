# Mapeamento Completo — API Auvo v2 (Deep Reference)

> **Base URL:** `https://api.auvo.com.br/v2`  
> **Spec:** OpenAPI 3.1 — publicada em 2026-04-24  
> **Portal:** https://developer.auvo.com.br  
> **Suporte:** help@auvo.com.br  
> **Status page:** https://status.auvo.com.br  
> **Content-Type obrigatório:** `application/json` em PUT/PATCH/POST  
> **Códigos de sucesso:** 200 (GET/PATCH), 201 (POST), 204 (DELETE)  

---

## 1. Infraestrutura

### 1.1 Autenticação

| Item | Detalhe |
|------|---------|
| Tipo | Bearer JWT |
| Validade | 30 minutos |
| Endpoint | `POST /login` |
| Body | `{ "apiKey": "...", "apiToken": "..." }` |
| Response | `{ "result": { "accessToken": "jwt...", "expiration": "2026-06-18T18:30:00Z", "authenticated": true } }` |
| Header | `Authorization: Bearer <accessToken>` |
| Obter credenciais | app.auvo.com.br → Menu → Integração |

**GET /login** também existe (passa apiKey e apiToken via query string) — **não usar em produção** pois credenciais ficam em logs de URL.

**Renovação:** Chamar `POST /login` novamente antes de expirar (recomendado: 2 min antes). Em 401, renovar e reexecutar a chamada original **uma única vez**.

---

### 1.2 Rate Limit

| Item | Valor |
|------|-------|
| Limite | **400 req/min por IP** |
| Throughput máx. | ~23.000 req/hora |
| Resposta ao exceder | HTTP `403` — `{ "error": "Rate limit temporarily exceeded" }` |
| Código futuro | `429` (reserva — tratar igual a 403) |

**Estratégia recomendada:**
```javascript
async function withBackoff(fn) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fn();
    if (res.status !== 403) return res;
    const wait = (2 ** attempt) * 250 + Math.random() * 250;
    await sleep(wait);
  }
  throw new Error('Rate limit não liberou após 5 tentativas');
}
```
- Max 4 req concorrentes por worker
- Separar IPs quando possível (um por ambiente/cliente)
- Cachear dados lentos (categorias, tipos de tarefa)

---

### 1.3 Paginação

**Parâmetros de query:**

| Param | Default | Max | Descrição |
|-------|---------|-----|-----------|
| `page` | 1 | — | Número da página |
| `pageSize` | 10 ou 50* | 100 | Registros por página |
| `order` | `"asc"` / `0` | — | `"asc"`/`0` = Ascendente, `"desc"`/`1` = Descendente |
| `selectfields` | `""` (todos) | — | Campos separados por vírgula |

*Default varia por endpoint (tasks=10, receivables=100, etc.)

**Envelope de resposta:**
```json
{
  "result": {
    "entityList": [ ... ],
    "pagedSearchReturnData": {
      "order": 0,
      "pageSize": 100,
      "page": 1,
      "totalItems": 574
    },
    "links": [
      { "href": "https://api.auvo.com.br/v2/Tasks?Page=1&PageSize=100&Order=Asc", "rel": "self", "method": "GET" },
      { "href": "https://api.auvo.com.br/v2/Tasks?Page=2&PageSize=100&Order=Asc", "rel": "nextPage", "method": "GET" }
    ]
  }
}
```

**Pseudocódigo de iteração:**
```javascript
let page = 1;
while (true) {
  const { result } = await fetchPage(page);
  await process(result.entityList);
  const total = Math.ceil(result.pagedSearchReturnData.totalItems / pageSize);
  if (page >= total) break;
  page += 1;
}
```

---

### 1.4 Filtros (paramFilter)

Todos os endpoints de listagem aceitam `paramFilter` como **query parameter** com valor **JSON encoded como string**.

```
GET /tasks?paramFilter={"startDate":"2026-01-01","endDate":"2026-01-31","status":4}&page=1&pageSize=100&order=desc
```

O JSON é URL-encoded na prática:
```
GET /tasks?paramFilter=%7B%22startDate%22%3A%222026-01-01%22%7D&page=1
```

---

### 1.5 Erros

**Envelope padrão:** `{ "error": "<mensagem>" }`

Alguns endpoints retornam formato expandido:
```json
{
  "message": "The paramFilter is required as ParamUserFilter string json.",
  "target": null,
  "errorCode": 1026,
  "errors": null
}
```

| HTTP | Significado | Retry? | Ação |
|------|-------------|--------|------|
| 400 | Payload inválido / validação | ❌ | Corrigir schema |
| 401 | Token ausente/expirado | ✅ uma vez | POST /login → retry |
| 403 | Rate limit | ✅ com backoff | Aguardar + backoff |
| 404 | Recurso não encontrado | ❌ | Verificar id |
| 409 | Conflito / duplicidade | ❌ | Verificar estado remoto |
| 415 | Content-Type faltando | ❌ | Enviar application/json |
| 422 | Validação semântica | ❌ | Ler mensagem de erro |
| 429 | Rate limit (futuro) | ✅ | Tratar como 403 |
| 500 | Erro interno | ✅ para GET/PUT/DELETE | Reportar com timestamp |

**Regras de retry:**
- Idempotentes (GET, PUT, DELETE): retry com backoff em 5xx e 403
- Não idempotentes (POST, PATCH): usar `externalId` para deduplicar antes de reenviar

---

### 1.6 Idempotência

| Mecanismo | Quando usar |
|-----------|-------------|
| `externalId` | Em POST/PATCH — buscar via GET antes de criar; se 409, buscar existente |
| `deliveryId` | Webhooks — deduplicar entregas repetidas |
| Idempotency-Key | **Em roadmap** (padrão Stripe-like) — ainda não implementado |

```javascript
async function postWithSafety(body) {
  const existing = await findByExternalId(body.externalId);
  if (existing) return existing;
  try {
    return await api.post('/tasks', body);
  } catch (err) {
    if (err.status === 409) return findByExternalId(body.externalId);
    throw err;
  }
}
```

---

### 1.7 Webhooks (Infraestrutura)

**Criar webhook:** `POST /webhooks`

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | number | ❌ | 0=criar novo; id existente=atualizar |
| `entity` | number | ✅ | 1=User, 4=Task, 7=Customer, 27=Equipment, 62=Ticket |
| `action` | number | ✅ | 1=Inclusão, 2=Alteração, 3=Exclusão |
| `targetUrl` | string | ✅ | URL de destino (HTTPS obrigatório). Max 250 chars |
| `active` | boolean | ❌ | Status ativo |

**Payload recebido pelo cliente:**
```json
{
  "event": "task.created",
  "occurredAt": "2026-04-24T13:45:00Z",
  "deliveryId": "01J9F3T2-unique-id",
  "data": { "taskId": 12345, "customerId": 98 }
}
```

**Assinatura de segurança:**
- Header: `X-Auvo-Signature: t=<timestamp>,v1=<hexHmacSha256>`
- Cálculo: `HMAC_SHA256(secret, "${timestamp}.${rawBody}")`
- Rejeitar se: `|ts - now| > 5 min` OU `v1` não bater (usar comparação time-safe)

**Reentrega:**
- Sucesso: resposta `2xx` em ≤ 10 segundos
- Falha: retries com backoff exponencial até **24 horas**
- Header de tentativa: `X-Auvo-Delivery-Attempt: N`
- Deduplicação: usar `deliveryId` (write-once na tabela webhook_deliveries)

---

### 1.8 Versionamento

- URL-based: tudo em `/v2`
- Deprecação: mínimo **90 dias** de aviso
- Sinalização: header `Deprecation: @timestamp`, campo `x-deprecation-date` no spec, changelog, e-mail aos admins

**NÃO é breaking:** campos opcionais novos em requests, campos novos em responses, endpoints novos
**É breaking:** remover/renomear campos, mudar tipos/enums, adicionar campo obrigatório, mudar HTTP codes

---

## 2. Endpoints — Referência Completa por Grupo

---

### 2.1 Login

#### POST /login
Autenticar e receber token JWT.

**Request body:**
```json
{ "apiKey": "<YOUR_KEY>", "apiToken": "<YOUR_TOKEN>" }
```

**Response 200:**
```json
{
  "result": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiration": "2026-06-18T18:30:00Z",
    "authenticated": true
  }
}
```

#### GET /login
Mesma autenticação via query string. **Não recomendado em produção.**

---

### 2.2 Usuários (Users)

#### Objeto User (response)
```json
{
  "userId": 123,
  "externalId": "ERP-USR-001",
  "name": "Jason Silva",
  "smartPhoneNumber": "5562999990000",
  "login": "jason.auvo",
  "email": "jason@empresa.com",
  "culture": "pt-BR",
  "jobPosition": "Técnico de Campo",
  "userType": { "userTypeId": 1, "description": "User" },
  "workDaysOfWeek": [2, 3, 4, 5, 6],
  "startWorkHour": "08:00:00",
  "endWorkHour": "18:00:00",
  "startLunchHour": "12:00:00",
  "endLunchHour": "14:00:00",
  "hourValue": 45.00,
  "pictureUrl": "https://...",
  "basePoint": {
    "address": "Rua C-137, Setor Oeste, Goiânia-GO",
    "latitude": -16.711903,
    "longitude": -49.277575
  },
  "openTaskInPlace": true,
  "grabGalleryPhotos": true,
  "gpsFrequency": 300,
  "checkInManual": true,
  "unavailableForTasks": false,
  "editTaskAfterCheckout": true,
  "informStartTravel": true,
  "changeBasePoint": false,
  "monitoringNotification": {
    "gpsActivation": 1,
    "gpsDisabling": 2,
    "appLogin": 3,
    "appLogout": 1
  },
  "employeeNotification": { "basePointChange": 1 },
  "clientNotification": { "adressChange": 1 },
  "taskNotification": {
    "checkIn": 1,
    "checkout": 2,
    "rescheduling": 3,
    "travelStart": 1,
    "researchAnswer": 3,
    "delay": 3,
    "taskDelete": 3
  }
}
```

**Enum notificações:** 0=None, 1=Email, 2=Push, 3=Both

**Enum userType:** 1=User, 2=Team Manager, 3=Administrator

**Enum gpsFrequency:** 60, 120, 180, 240, 300 (segundos)

**Enum workDaysOfWeek:** 1=Domingo, 2=Segunda, 3=Terça, 4=Quarta, 5=Quinta, 6=Sexta, 7=Sábado

---

#### GET /users — Listar

**Filtros (paramFilter):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `userId` | number | ID do usuário |
| `name` | string | Nome (busca parcial) |
| `smartPhoneNumber` | string | Telefone (só números) |
| `userType` | number | 1=User, 2=Manager, 3=Admin |
| `externalId` | string | IDs externos (múltiplos, separados por vírgula) |

---

#### GET /users/{id} — Consultar único
- Path: `id` (number, required)
- Response: objeto User completo
- Erros: 404 se não existir, 400 se id inválido

---

#### POST /users — Criar
Mesmos campos do PUT/upsert (ver abaixo).

---

#### PUT /users — Upsert (criar ou atualizar)

Usa `id` OR `externalId` como identificador. Retorna 200 se atualizado, 201 se criado.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | number | ❌ | ID Auvo (identificador para upsert) |
| `externalId` | string | ❌ | ID externo (identificador para upsert). Max 255 |
| `name` | string | ✅ | Nome. Max 100 |
| `smartPhoneNumber` | string | ❌ | Telefone. Só números. Max 45 |
| `culture` | string | ✅ | Cultura (ex: `pt-BR`). Max 10 |
| `jobPosition` | string | ❌ | Cargo. Max 250 |
| `userType` | number | ✅ | 1=User, 2=Team Manager, 3=Admin |
| `password` | string | ✅ | Senha. Max 14 |
| `login` | string | ✅ | Login na aplicação. Max 45 |
| `email` | string | ❌ | Email. Max 100 |
| `workDaysOfWeek` | number[] | ❌ | Dias trabalhados [1-7] |
| `workSchedule` | array | ❌ | Escala por dia (avançado) |
| `startWorkHour` | string | ❌ | "HH:mm:ss" (24h) |
| `endWorkHour` | string | ❌ | "HH:mm:ss" (24h) |
| `startLunchHour` | string | ❌ | "HH:mm:ss" (24h) |
| `endLunchHour` | string | ❌ | "HH:mm:ss" (24h) |
| `hourValue` | number | ❌ | Valor/hora (decimal) |
| `checkInManual` | boolean | ❌ | Checkin manual |
| `address` | string | ❌ | Endereço do ponto base |
| `latitude` | number | ❌ | Latitude do ponto base |
| `longitude` | number | ❌ | Longitude do ponto base |
| `openTaskInPlace` | boolean | ❌ | Abrir tarefa in loco pelo app |
| `galleryPhotos` | boolean | ❌ | Permitir fotos da galeria |
| `gpsFrequency` | number | ❌ | 60/120/180/240/300 segundos |
| `unavailableForTasks` | boolean | ❌ | Indisponível para tarefas |
| `editTaskAfterCheckout` | boolean | ❌ | Editar após checkout |
| `informStartTravel` | boolean | ❌ | Informar início de deslocamento |
| `changeBasePoint` | boolean | ❌ | Pode mudar ponto base |
| `monitoringNotification` | object | ❌ | `{ gpsActivation, gpsDisabling, appLogin, appLogout }` — valores 0-3 |
| `employeeNotification` | object | ❌ | `{ basePointChange }` — valores 0-3 |
| `clientNotification` | object | ❌ | `{ adressChange }` — valores 0-3 |
| `taskNotification` | object | ❌ | `{ checkIn, checkout, rescheduling, travelStart, researchAnswer, delay, taskDelete }` — valores 0-3 |

---

#### PATCH /users/{id} — Editar (JSONPatch)

Formato: `{ "op": "replace", "path": "<campo>", "value": "<valor>" }`

Campos editáveis: `login`, `externalId`, `name`, `smartPhoneNumber`, `email`, `jobPosition`, `enterprise`, `culture`, `hourValue`, `userType`, `checkInManual`, `checkOutManual`, `address`, `latitude`, `longitude`, `gpsFrequency`, `openTaskInPlace`, `galleryPhotos`, `unavailableForTasks`, `editTaskAfterCheckout`, `informStartTravel`, `changeBasePoint`

---

#### DELETE /users/{id} — Excluir

---

### 2.3 Clientes (Customers)

#### Objeto Customer (response)
```json
{
  "customerId": 456,
  "externalId": "ERP-CLI-001",
  "name": "Construtora Horizonte LTDA",
  "cpfCnpj": "12.345.678/0001-90",
  "phoneNumber": ["5562999990001", "5562999990002"],
  "email": ["contato@horizonte.com"],
  "manager": "Carlos Souza",
  "note": "Cliente premium, priorizar atendimentos",
  "address": "Av. Brasil 1500, Centro, Goiânia-GO",
  "adressComplement": "Bloco B, Sala 302",
  "latitude": -16.680,
  "longitude": -49.255,
  "maximumVisitTime": 120,
  "unitMaximumTime": 1,
  "groups": ["VIP", "Construção Civil"],
  "segmentId": 5,
  "active": true,
  "legalName": "Construtora Horizonte LTDA ME",
  "talkTo": "Recepção",
  "icmsTaxpayer": 1,
  "stateRegistration": "10.123.456-7",
  "municipalRegistration": "MUN-789",
  "billingEmail": "financeiro@horizonte.com",
  "billingZipCode": "74000-000",
  "billingPublicArea": "Av. Brasil",
  "billingAddressNumber": "1500",
  "billingAddressComplement": "Sala 302",
  "billingDistrict": "Centro",
  "billingCity": "Goiânia",
  "billingState": "GO",
  "notifications": true,
  "observation": "Portaria exige crachá",
  "internalObservation": "Inadimplente 2x em 2025"
}
```

---

#### GET /customers — Listar

**Filtros (paramFilter):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | number | ID do cliente |
| `description` | string | Nome (busca parcial) |
| `externalId` | string | ID externo |
| `segmentId` | number | Segmento |
| `groupId` | number | Grupo de clientes |
| `active` | boolean | Status ativo |
| `dateLastUpdate` | string | Última atualização (yyyy-MM-dd) |
| `creationDate` | string | Data criação |
| `legalName` | string | Razão social |
| `cpfCnpj` | string | CPF/CNPJ |

---

#### PUT /customers — Upsert

Usa `id` OR `externalId` como identificador. Se `identifierBycpfCnpj: true`, também usa CPF/CNPJ.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | number | ❌ | ID Auvo |
| `identifierBycpfCnpj` | boolean | ❌ | Usar CPF/CNPJ como identificador adicional |
| `replaceData` | boolean | ❌ | `true`=substituir todos os dados, `false`=merge. Default true |
| `allowLegalNameClear` | boolean | ❌ | Permitir limpar razão social. Default false |
| `externalId` | string | ❌ | Max 255 |
| `name` | string | ❌ | Max 500 |
| `phoneNumber` | string[] | ❌ | Lista de telefones |
| `email` | string[] | ❌ | Lista de emails |
| `manager` | string | ❌ | Max 500 |
| `note` | string | ❌ | Max 5000 |
| `address` | string | ❌ | Endereço completo |
| `adressComplement` | string | ❌ | Max 1000 |
| `latitude` | number | ❌ | Latitude |
| `longitude` | number | ❌ | Longitude |
| `cpfCnpj` | string | ❌ | CPF ou CNPJ |
| `groupsId` | number[] | ❌ | IDs de grupos |
| `managerTeamsId` | number[] | ❌ | IDs de equipes gestoras |
| `managersId` | number[] | ❌ | IDs de gestores |
| `segmentId` | number | ❌ | ID do segmento |
| `active` | boolean | ❌ | Status ativo |
| `legalName` | string | ❌ | Razão social. Max 100 |

---

#### POST /customers/complete — Criar cliente completo

Todos os campos do upsert básico **MAIS:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `maximumVisitTime` | number | Tempo máximo de visita |
| `unitMaximumTime` | number | Unidade do tempo máximo |
| `groups` | string[] | Nomes de grupos (cria se não existir) |
| `managerTeamsName` | string[] | Nomes de equipes gestoras |
| `managersName` | string[] | Nomes de gestores |
| `teamsName` | string[] | Nomes de equipes associadas |
| `teamsId` | number[] | IDs de equipes associadas |
| `segmentName` | string | Nome do segmento |
| `observation` | string | Observação visível ao cliente |
| `internalObservation` | string | Observação interna |
| `talkTo` | string | Falar com |
| `icmsTaxpayer` | number | Contribuinte ICMS |
| `stateRegistration` | string | Inscrição estadual |
| `municipalRegistration` | string | Inscrição municipal |
| `billingEmail` | string | Email de cobrança |
| `billingZipCode` | string | CEP de cobrança |
| `billingPublicArea` | string | Logradouro de cobrança |
| `billingAddressNumber` | string | Número |
| `billingAddressComplement` | string | Complemento |
| `billingDistrict` | string | Bairro |
| `billingCity` | string | Cidade |
| `billingState` | string | Estado (UF) |
| `notifications` | boolean | Receber notificações |
| `contacts` | array | Contatos adicionais |
| `attachments` | array | Anexos |

---

#### PATCH /customers/{id} — Editar
Campos editáveis via JSONPatch: `name`, `externalId`, `phoneNumber`, `email`, `manager`, `note`, `address`, `latitude`, `longitude`, `maximumVisitTime`, `unitMaximumTime`, `cpfCnpj`, `groupsId`, `managerTeamsId`, `managersId`, `segmentId`, `active`, `adressComplement`, `legalName`

---

#### PUT /customers/{id}/attachments — Anexos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `removeAllAttachmentsInsertedByMe` | boolean | Remove todos os anexos inseridos pela API antes de adicionar novos |
| `attachments` | array | Novos anexos `[{ "name": "...", "src": "base64 ou URL" }]` |

---

### 2.4 Grupos de Clientes

#### POST /customergroups — Criar
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `description` | string | ❌ | Nome do grupo. Max 255 |
| `clientsId` | number[] | ❌ | IDs de clientes para adicionar |

#### GET /customergroups — Listar
#### GET /customergroups/{id}/customers — Clientes do grupo
#### DELETE /customergroups/{id} — Excluir

---

### 2.5 Produtos (Products)

#### POST /products — Criar

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `externalId` | string | ❌ | ID externo |
| `name` | string | ✅ | Nome. Max 255 |
| `description` | string | ❌ | Descrição. Max 1000 |
| `categoryId` | number | ❌ | ID da categoria |
| `associatedEquipmentId` | number | ❌ | Equipamento associado |
| `unitaryValue` | string | ❌ | Valor unitário (decimal como string) |
| `unitaryCost` | string | ❌ | Custo unitário |
| `minimumStock` | number | ❌ | Estoque mínimo |
| `totalStock` | number | ❌ | Estoque total |
| `active` | boolean | ❌ | Status ativo |
| `base64Image` | string | ❌ | Imagem em base64 |
| `productSpecifications` | array | ❌ | Especificações customizadas |
| `employeesStock` | array | ❌ | Estoque por colaborador |
| `attachments` | array | ❌ | Anexos |

#### PUT /products — Upsert
Usa `id` ou `externalId`. Mesmos campos do POST.

#### PUT /products/employee-product-stock — Atualizar estoque colaborador
| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `userId` | number | ✅ |
| `productId` | number | ✅ |
| `amount` | number | ✅ |

#### GET /products — Listar
**Filtros:** `id`, `externalId`, `name`, `description`, `categoryId`, `associatedEquipmentId`, `active`, `lowerThanMinimumStock`

---

### 2.6 Categorias de Produtos

CRUD padrão em `/productcategories`. Campos: `description` (nome da categoria).

---

### 2.7 Serviços (Services)

#### POST /services — Criar

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `title` | string | ❌ | Título do serviço |
| `price` | number | ❌ | Preço |
| `active` | boolean | ❌ | Ativo |
| `description` | string | ❌ | Descrição |
| `externalCode` | string | ❌ | Código externo (deve ser único) |
| `fiscalServiceId` | string | ❌ | GUID do serviço fiscal |

#### GET /services — Listar
**Filtros (paramFilter):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | string (GUID) | ID do serviço |
| `title` | string | Título |
| `description` | string | Descrição |
| `externalCode` | string | Código externo |
| `price` | number | Preço |
| `active` | boolean | Status ativo |
| `fiscalServiceId` | string (GUID) | Serviço fiscal |

#### GET /services/obterListaServicos — Legacy
Retorna **todos** os serviços **sem paginação**. Não recomendado para contas grandes.

#### PUT /services — Upsert

---

### 2.8 Equipamentos (Equipments)

#### POST /equipments — Criar

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `externalId` | string | ❌ | ID externo. Max 255 |
| `parentEquipmentId` | number | ❌ | Equipamento pai (hierarquia) |
| `associatedCustomerId` | number | ❌ | Cliente associado |
| `associatedUserId` | number | ❌ | Usuário associado |
| `categoryId` | number | ❌ | Categoria |
| `name` | string | ✅ | Nome. Max 500 |
| `description` | string | ❌ | Descrição. Max 10000 |
| `identifier` | string | ❌ | Identificador (serial, patrimônio). Max 100 |
| `base64Image` | string | ❌ | Imagem em base64 |
| `expirationDate` | string | ❌ | Data de validade |
| `warrantyStartDate` | string | ❌ | Início garantia |
| `warrantyEndDate` | string | ❌ | Fim garantia |
| `active` | boolean | ❌ | Status ativo |
| `equipmentSpecifications` | array | ❌ | Especificações customizadas |
| `attachments` | array | ❌ | Anexos |

#### GET /equipments — Listar
**Filtros (paramFilter):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `externalId` | string | ID externo |
| `name` | string | Nome |
| `identifier` | string | Identificador (serial/patrimônio) |
| `associatedUserId` | number | Usuário associado |
| `associatedCustomerId` | number | Cliente associado |
| `parentEquipmentId` | number | Equipamento pai |
| `categoryId` | number | Categoria |
| `active` | boolean | Status ativo |
| `warrantyStartDate` | string | Data início garantia |
| `warrantyEndDate` | string | Data fim garantia |

---

### 2.9 Categorias de Equipamentos
CRUD padrão. Campos: `description`.

---

### 2.10 Palavras-Chave (Keywords)
CRUD padrão em `/keywords`. Campo: `description` (required, max 1000).

---

### 2.11 Tipos de Tarefa (Task Types)

#### POST /tasktypes — Criar

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `description` | string | ✅ | Nome do tipo. Max 5000 |
| `standartQuestionnaireId` | number | ❌ | Questionário padrão |
| `standartTime` | string | ❌ | Tempo padrão (TimeSpan) |
| `sendSatisfactionSurvey` | boolean | ❌ | Enviar pesquisa satisfação. Default false |
| `sendDigitalOs` | boolean | ❌ | Enviar OS digital. Default false |
| `active` | boolean | ❌ | Ativo. Default true |
| `requirements` | object | ❌ | Requisitos obrigatórios |
| `requirements.fillReport` | boolean | ❌ | Exigir relatório |
| `requirements.getSignature` | boolean | ❌ | Exigir assinatura |
| `requirements.fillRolledKilometer` | boolean | ❌ | Exigir km rodado |
| `requirements.emailTheTask` | boolean | ❌ | Enviar por email |
| `requirements.minimumNumberOfPhotos` | number | ❌ | Mínimo de fotos |
| `requirements.requiredQuestionnaires` | number[] | ❌ | IDs de questionários obrigatórios |

---

### 2.12 Equipes (Teams)

#### POST /teams — Criar

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `description` | string | ✅ | Nome da equipe. Max 1000 |
| `participants` | number[] | ❌ | IDs de participantes |
| `managers` | number[] | ❌ | IDs de gestores |

#### GET /teams/{teamId}/users — Listar participantes
Path: `teamId` (number, required)
Retorna lista paginada de usuários da equipe.

---

### 2.13 Segmentos
CRUD padrão. Campo: `description` (max 1000).

---

### 2.14 Tarefas (Tasks) ⭐ PRINCIPAL

#### Enums de Task

**taskStatus (resposta):**
| Valor | Status |
|-------|--------|
| 1 | Aberta (Opened) |
| 2 | Em Deslocamento (InDisplacement) |
| 3 | Check-in Realizado (CheckedIn) |
| 4 | Check-out Realizado (CheckedOut) |
| 5 | Finalizada (Finished) |
| 6 | Pausada (Paused) |

**status (filtro de listagem):**
| Valor | Filtro |
|-------|--------|
| 0 | Não concluídas |
| 1 | Auto-finalizadas |
| 2 | Manualmente finalizadas |
| 3 | Auto ou Manualmente finalizadas |
| 4 | Todas |
| 5 | Com pendência |
| 6 | Iniciadas ou finalizadas |
| 7 | Em execução |

**priority:** 1=Low, 2=Medium, 3=High

**checkinType:** 1=Manual, 2=Automático, 3=Usuário

---

#### GET /tasks — Listar

**Filtros (paramFilter):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `taskID` | string | ID da tarefa |
| `externalId` | string | ID externo |
| `idUserTo` | number | Responsável pela execução |
| `startDate` | string | Data início (yyyy-MM-dd) |
| `endDate` | string | Data fim (yyyy-MM-dd) |
| `type` | number | ID do tipo de tarefa |
| `typeList` | string | IDs de tipos (comma-separated) |
| `customerId` | number | ID do cliente |
| `customerGroupId` | number | ID do grupo de clientes |
| `teamId` | number | ID da equipe |
| `status` | number | Status (enum acima) |
| `orientation` | string | Busca na orientação |
| `tags` | string | Tags |
| `priority` | number | 1/2/3 |
| `dateLastUpdate` | string | Data última atualização |
| `showCustomerDocument` | boolean | Incluir CPF/CNPJ do cliente |
| `questionnairesId` | string | IDs de questionários (comma-separated) |

**Response — Objeto Task:**
```json
{
  "taskID": 23,
  "externalId": "OS-2048",
  "idUserFrom": 1,
  "idUserTo": 123,
  "userToName": "Colaborador",
  "userFromName": "Paulo",
  "customerId": 456,
  "taskType": 2,
  "taskTypeDescription": "Visita Técnica",
  "creationDate": "2026-03-23T14:10:35",
  "taskDate": "2026-03-23T18:00:00",
  "address": "Av. Brasil 1500",
  "orientation": "Realizar manutenção preventiva no gerador",
  "priority": 3,
  "finished": true,
  "taskStatus": 5
}
```

---

#### POST /tasks — Criar

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `externalId` | string | ❌ | ID externo. Max 255 |
| `taskType` | number | ✅* | ID do tipo de tarefa |
| `idUserFrom` | number | ✅ | Quem está abrindo a tarefa |
| `idUserTo` | number | ❌ | Responsável pela execução |
| `listIdUserTo` | number[] | ❌ | Múltiplos responsáveis (cria N tarefas) |
| `teamId` | number | ❌ | Equipe |
| `taskDate` | string | ❌ | Data execução `yyyy-MM-ddTHH:mm:ss` |
| `latitude` | number | ❌ | Latitude (se omitido, geocodifica pelo address) |
| `longitude` | number | ❌ | Longitude |
| `address` | string | ❌ | Endereço (se customer omitido, usa esse) |
| `orientation` | string | ✅ | Descrição da tarefa. Max 5000 |
| `priority` | number | ✅ | 1=Low, 2=Medium, 3=High |
| `questionnaireId` | number | ❌ | Checklist vinculado |
| `customerId` | number | ❌ | Cliente (endereço preferencial vem dele) |
| `checkinType` | number | ❌ | 1=Manual, 2=Auto, 3=User |
| `attachments` | array | ❌ | Anexos |
| `keyWords` | number[] | ❌ | IDs de palavras-chave |
| `equipmentsId` | number[] | ❌ | IDs de equipamentos |
| `sendSatisfactionSurvey` | boolean | ❌ | Enviar pesquisa |
| `sendDigitalOs` | boolean | ❌ | Enviar OS digital |
| `taskProducts` | array | ❌ | Produtos `[{ productId, quantity, value, discountType, discountValue }]` |
| `taskServices` | array | ❌ | Serviços `[{ serviceId, quantity, value }]` |
| `taskAdditionalCosts` | array | ❌ | Custos `[{ additionalCostId, value }]` |
| `taskDiscount` | object | ❌ | `{ type: 0=monetário|1=percentual, value: decimal }` |
| `financialCategory` | string | ❌ | Nome da categoria financeira |
| `financialCategoryId` | string | ❌ | GUID da categoria financeira |

**Nota sobre endereço:** O endereço da tarefa é obtido preferencialmente do cliente. Se `customerId` não informado, usa `address`/`latitude`/`longitude` do body. Se lat/lng omitidos, Auvo tenta geocodificar pelo endereço.

---

#### PUT /tasks — Upsert
Usa `id` OR `externalId`. Retorna 200=atualizado, 201=criado. Mesmos campos do POST + campo `id`.

---

#### PATCH /tasks/{id} — Editar
Campos editáveis: `taskType`, `externalId`, `idUserFrom`, `idUserTo`, `teamId`, `taskDate`, `latitude`, `longitude`, `address`, `orientation`, `priority`, `questionnaireId`, `customerId`, `checkinType`, `keyWords`, `sendSatisfactionSurvey`, `sendDigitalOs`, `financialCategory`, `financialCategoryId`

---

#### PUT /tasks/{id}/attachments — Anexos
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `removeAllAttachmentsInsertedByMe` | boolean | Remove todos anteriores da API |
| `attachments` | array | Novos anexos |

---

#### PUT /tasks/{id}/products — Produtos da tarefa
```json
{
  "taskProducts": [
    {
      "productId": "63867f52-b262-410a-a409-cc25ba92ded1",
      "quantity": 2,
      "value": 10.50,
      "discountType": 0,
      "discountValue": 1.00
    }
  ]
}
```
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `productId` | string (GUID) | ID do produto |
| `quantity` | number | Quantidade |
| `value` | number | Valor unitário |
| `discountType` | number | 0=monetário, 1=percentual |
| `discountValue` | number | Valor do desconto |

---

#### PUT /tasks/{id}/services — Serviços da tarefa
```json
{
  "taskServices": [
    { "serviceId": "63867f52-...", "quantity": 1, "value": 50.00 }
  ]
}
```

---

#### PUT /tasks/{id}/additional-costs — Custos adicionais
```json
{
  "taskAdditionalCosts": [
    { "additionalCostId": "63867f52-...", "value": 5.00 }
  ]
}
```

---

#### PUT /tasks/{id}/questionnaire-response — Resposta de questionário

⚠️ **Processamento assíncrono** — resposta 202 Accepted.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `itemID` | string | ✅ | Identificador da instância do questionário na tarefa |
| `codigoChecklist` | string | ✅ | Código do checklist vinculado |
| `codigoPergunta` | string | ✅ | Código da pergunta |
| `resposta` | string | ✅ | Valor da resposta |
| `codigoEquipamento` | string\|null | ❌ | Código do equipamento (se resposta é sobre equip.) |

**Response 202:**
```json
{
  "message": "Answer validated and queued for processing",
  "accepted": true,
  "estimatedProcessingTime": "up to 5 minutes"
}
```

---

#### GET /tasks/GetDeletedTasks — Tarefas excluídas
Mesmos parâmetros e filtros do GET /tasks.

---

### 2.15 Chamados (Tickets)

**Endpoints reais dos auxiliares:**
- Tipos de solicitação: `GET /tickets/request-type` (retorna array direto em `result`)
- Status ativos: `GET /tickets/status` (retorna array direto em `result`)

#### POST /tickets — Criar

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `title` | string | ❌ | Título |
| `description` | string | ❌ | Descrição |
| `requestTypeId` | number | ❌ | Tipo de solicitação |
| `statusId` | number | ❌ | Status inicial |
| `requesterEmail` | string | ❌ | Email do solicitante |
| `requesterName` | string | ❌ | Nome do solicitante |
| `customerId` | number | ❌ | ID do cliente |
| `teamId` | number | ❌ | ID da equipe |
| `userResponsableId` | number | ❌ | Responsável |
| `equipmentId` | number | ❌ | Equipamento (único) |
| `equipmentIds` | number[] | ❌ | Equipamentos (múltiplos) |
| `priority` | number | ❌ | Prioridade |
| `externalId` | string | ❌ | ID externo |
| `customFields` | array | ❌ | Campos customizados: `[{ "customFieldTicket": { "id": N }, "value": "...", "valueDescription": "..." }]` |
| `attachments` | array | ❌ | Anexos |

---

#### GET /tickets — Listar

**Filtros (paramFilter):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `ids` | string | IDs comma-separated |
| `status` | number | Status do chamado |
| `responsableUsersIds` | string | IDs responsáveis (comma-sep) |
| `teamIds` | string | IDs equipes (comma-sep) |
| `customerGroupId` | number | Grupo do cliente |
| `customerId` | number | Cliente |
| `priorities` | string | Prioridades (comma-sep) |
| `openingResponsableUsersId` | string | Quem abriu (comma-sep) |
| `externalId` | string | ID externo |
| `statusIds` | string | Status IDs (comma-sep) |
| `startDate` | string | Data início |
| `endDate` | string | Data fim |
| `startDateLastUpdate` | string | Última atualização início |
| `endDateLastUpdate` | string | Última atualização fim |
| `searchTasks` | boolean | Incluir tarefas associadas |
| `searchInteractions` | boolean | Incluir interações |
| `searchModifications` | boolean | Incluir modificações |
| `searchCustomFields` | boolean | Incluir campos customizados |
| `searchStatusChanges` | boolean | Incluir mudanças de status |

---

#### PATCH /tickets/{id} — Editar
Campos: `externalId`, `statusId`

#### GET /tickets/requesttypes — Tipos de solicitação

---

### 2.16 Status de Chamados
#### GET /ticketstatus — Listar status ativos

---

### 2.17 Questionários

#### GET /questionnaires — Listar
**Filtros:** `id`, `taskIds` (array de task ids)

#### GET /questionnaires/{id} — Consultar

---

### 2.18 GPS

#### GET /gps — Posições

**Filtros (paramFilter):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `userId` | number | Rastrear usuário |
| `getLastKnowPosition` | boolean | Apenas última posição |
| `date` | string | Data (yyyy-MM-dd) |

**Response:**
```json
{
  "userId": 123,
  "positionDate": "2026-06-18 14:30:00",
  "latitude": -16.687,
  "longitude": -49.299,
  "accuracy": 10,
  "batteryLevel": 85,
  "networkOperatorName": "Vivo"
}
```

---

### 2.19 Ordens de Serviço (Service Orders)

#### POST /serviceorders — Criar

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `customerId` | number | ✅ | Cliente |
| `statusId` | string | ✅ | GUID do status |
| `description` | string | ✅ | Descrição da OS |
| `externalCode` | string | ❌ | Código externo |
| `dateFirstVisit` | string | ❌ | Data primeira visita |
| `dateLastVisit` | string | ❌ | Data última visita |
| `startTime` | string | ❌ | Hora início "HH:mm" |
| `duration` | number | ❌ | Duração em minutos |
| `taskTypeId` | number | ❌ | Tipo de tarefa padrão |
| `defaultQuestionnaireId` | number | ❌ | Questionário padrão |
| `defaultResponsibleId` | number | ❌ | Responsável padrão |
| `priority` | number | ❌ | Prioridade (default 2) |
| `financialCategoryId` | string | ❌ | Categoria financeira (GUID) |
| `keywordsIds` | number[] | ❌ | Palavras-chave |
| `attachments` | array | ❌ | Anexos |
| `recurrenceType` | string | ❌ | `"daily"` / `"weekly"` / `"monthly"` / `"yearly"` |
| `recurrenceInterval` | number | ❌ | Intervalo de recorrência |
| `recurrenceDays` | number[] | ❌ | Dias da semana [1-7] (1=Dom...7=Sáb) |
| `monthlyMode` | string | ❌ | `"dayOfMonth"` / `"dayOfWeek"` |

---

#### GET /serviceorders — Listar

**Filtros (paramFilter):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `projectCodes` | string | Códigos de projeto (comma-sep) |
| `externalCodes` | string | Códigos externos (comma-sep) |
| `description` | string | Descrição |
| `startDateDuration` | string | Data início duração |
| `endDateDuration` | string | Data fim duração |
| `startDateLastUpdate` | string | Última atualização de |
| `endDateLastUpdate` | string | Última atualização até |
| `keywordCode` | string | Códigos keyword (comma-sep) |
| `clientCode` | string | Códigos cliente (comma-sep) |
| `cpfCnpj` | string | CPF/CNPJ |
| `clientGroupCode` | string | Códigos grupo (comma-sep) |
| `statusId` | string | GUID do status |
| `equipmentCode` | string | Códigos equipamento (comma-sep) |

---

#### PATCH /serviceorders/{code} — Editar
Path: `code` (number — project code)
Campos: `externalId`, `descricao`, `status` (GUID)

---

### 2.20 Despesas (Expenses)

#### POST /expenses — Criar
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `userToId` | number | Usuário destinatário |
| `typeId` | number | Tipo de despesa |
| `date` | string | Data |
| `amount` | number | Valor |
| `description` | string | Max 1000 |
| `attachment` | string | Dados do anexo |
| `changeAttachment` | boolean | Flag para trocar anexo |

#### GET /expenses — Listar
**Filtros (paramFilter):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `startDate` | string | Data início |
| `endDate` | string | Data fim |
| `userToId` | number | Usuário destinatário |
| `type` | number | Tipo de despesa |
| `id` | number | ID da despesa |
| `description` | string | Busca na descrição |

#### PUT /expenses/{id}/attachments — Anexos da despesa
⚠️ **Schema diferente** dos outros endpoints de anexo:
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `deleteAttachment` | boolean | Deletar anexo existente |
| `attachment` | string | Novo anexo (dados) |

---

### 2.21 Tipos de Despesa
CRUD padrão em `/expensetypes`.

---

### 2.22 Custos Adicionais

#### POST /additionalcosts — Criar
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `name` | string | Nome do custo |
| `value` | number | Valor |

#### PUT /additionalcosts/{id} — Atualizar
#### GET /additionalcosts — Listar

---

### 2.23 Notas Fiscais (Invoices)

⚠️ **Regra de negócio importante:** Após uma NF ser emitida (receipted), os seguintes campos ficam **bloqueados para edição**: `customerId`, `responsibleUserId`, `discountType`, `discountValue`, `products`, `services`, `additionalCosts`, `payment`.

#### POST /invoices — Criar

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `customerId` | number | ✅ | Cliente |
| `issueDate` | string | ✅ | Data emissão |
| `responsibleUserId` | number | ❌ | Responsável |
| `subject` | string | ❌ | Assunto |
| `observations` | string | ❌ | Observações |
| `internalNote` | string | ❌ | Nota interna |
| `footer` | string | ❌ | Rodapé |
| `serviceAddress` | string | ❌ | Endereço de serviço |
| `billingAddress` | string | ❌ | Endereço de cobrança |
| `financialCategoryId` | string | ❌ | Categoria financeira (GUID) |
| `discountType` | string | ❌ | Tipo desconto |
| `discountValue` | number | ❌ | Valor desconto |
| `products` | array | ❌ | `[{ productId, amount, unitaryValue }]` |
| `services` | array | ❌ | `[{ serviceId (GUID), amount, unitaryValue }]` |
| `additionalCosts` | array | ❌ | `[{ costId, value }]` |
| `attachments` | array | ❌ | `[{ name, src }]` |
| `payment` | object | ✅ | **Obrigatório** — ver estrutura abaixo |

**Estrutura payment (invoices):**
```json
{
  "paymentMethods": [
    {
      "paymentMethodId": "guid-...",
      "installmentsCount": 3,
      "installments": [
        { "number": 1, "value": 333.33, "dueDate": "2026-07-01", "observations": "" },
        { "number": 2, "value": 333.33, "dueDate": "2026-08-01", "observations": "" },
        { "number": 3, "value": 333.34, "dueDate": "2026-09-01", "observations": "" }
      ]
    }
  ]
}
```

#### PUT /invoices/{id} — Atualizar
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `replaceData` | boolean | `true`=substituir tudo, `false`=merge. Default true |
| `customerId` | number | Cliente (bloqueado após emissão) |
| `responsibleUserId` | number | Responsável (bloqueado após emissão) |
| `issueDate` | string | Data emissão |
| `subject` | string | Assunto |
| `observations` | string | Observações |
| `internalNote` | string | Nota interna |
| `footer` | string | Rodapé |
| `serviceAddress` | string | Endereço serviço |
| `billingAddress` | string | Endereço cobrança |
| `financialCategoryId` | string | Categoria financeira (GUID) |
| `discountType` | string | Tipo desconto (bloqueado após emissão) |
| `discountValue` | number | Valor desconto (bloqueado após emissão) |

#### GET /invoices — Listar
**Filtros (paramFilter):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `customerId` | number | Cliente |
| `status` | string | Status da NF |
| `startDate` | string | Data emissão início |
| `endDate` | string | Data emissão fim |

---

### 2.24 Orçamentos (Quotations)

#### POST /quotations — Criar

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `statusId` | number | ❌ | ID do status |
| `customerId` | number | ❌ | Cliente |
| `leadName` | string | ❌ | Nome do lead (se não tem cliente) |
| `responsibleUserId` | number | ❌ | Responsável |
| `requestDate` | string | ❌ | Data de solicitação |
| `expireDate` | string | ❌ | Data de expiração |
| `externalCode` | string | ❌ | Código externo |
| `observations` | string | ❌ | Observações |
| `internalNote` | string | ❌ | Nota interna |
| `discountType` | string | ❌ | Tipo desconto |
| `discountValue` | number | ❌ | Valor desconto |
| `taskId` | number | ❌ | Tarefa associada (única) |
| `taskIds` | number[] | ❌ | Tarefas associadas (múltiplas) |
| `products` | array | ❌ | `[{ productId, amount, unitaryValue, unitaryDiscount: { type, value } }]` |
| `services` | array | ❌ | `[{ serviceId (GUID), amount, unitaryValue, unitaryDiscount: { type, value } }]` |
| `additionalCosts` | array | ❌ | `[{ costId, value }]` |
| `attachments` | array | ❌ | `[{ name, src, visibleToClient }]` |
| `payment` | object | ❌ | `{ installments: [{ number, value, dueDate, paymentMethod: { id: "GUID" } }] }` |

#### PATCH /quotations/{id} — Editar
Todos os campos do POST (exceto id).

#### Operações nos itens do orçamento:
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/quotations/{id}/services/{idService}` | Adicionar serviço (idService = GUID) |
| PUT | `/quotations/{id}/services/{idService}` | Atualizar serviço (JSONPatch) |
| DELETE | `/quotations/{id}/services/{idService}` | Remover serviço → 204 |
| POST | `/quotations/{id}/products` | Adicionar produto |
| PUT | `/quotations/{id}/products/{idProduct}` | Atualizar produto (JSONPatch) |
| DELETE | `/quotations/{id}/products/{idProduct}` | Remover produto → 204 |
| PUT | `/quotations/{id}/adicost` | Upsert custo adicional |
| DELETE | `/quotations/{id}/adicost` | Remover custo adicional → 204 |

**POST /quotations/{id}/services/{idService} — Body:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `serviceId` | string (GUID) | ID do serviço |
| `externalCode` | string | Código externo |
| `name` | string | Nome |
| `description` | string | Descrição |
| `amount` | number | Quantidade |
| `unitaryValue` | string | Valor unitário |
| `unitaryDiscount.type` | string | Tipo desconto |
| `unitaryDiscount.value` | number | Valor desconto |

**POST /quotations/{id}/products — Body:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `productId` | number | ID do produto |
| `externalCode` | string | Código externo |
| `amount` | number | Quantidade |
| `unitaryValue` | string | Valor unitário |
| `unitaryDiscount.type` | string | Tipo desconto |
| `unitaryDiscount.value` | number | Valor desconto |

**PUT /quotations/{id}/adicost — Body:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | number | 0=criar novo, id existente=atualizar |
| `costId` | number | ID do tipo de custo |
| `description` | string | Descrição |
| `value` | string | Valor |

**DELETE /quotations/{id}/adicost — Body:**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | number | ID do registro |
| `costId` | number | ID do tipo de custo |

#### GET /quotations — Listar
**Filtros:** `publicId`, `usersId[]`, `customersId[]`, `productsId[]`, `requestStartDate`, `requestEndDate`, `lastUpdateStartDate`, `lastUpdateEndDate`, `currentStage` (comma-sep)

---

### 2.25 Contas a Receber (Receivables)

#### POST /receivables — Criar

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `customerId` | number | ✅ | Cliente |
| `bankAccountId` | string | ✅ | Conta bancária (GUID) |
| `value` | number | ✅ | Valor |
| `dueDate` | string | ✅ | Data vencimento |
| `competencyDate` | string | ❌ | Data competência |
| `description` | string | ❌ | Max 500 |
| `observations` | string | ❌ | Max 1000 |
| `discount` | number | ❌ | Desconto |
| `surcharge` | number | ❌ | Acréscimo |
| `financialCategoryId` | string | ❌ | GUID |
| `paymentMethodId` | string | ❌ | GUID |
| `paid` | boolean | ❌ | Pago? |
| `paidDate` | string | ❌ | Data pagamento |
| `paidValue` | number | ❌ | Valor pago |
| `isRecurrent` | boolean | ❌ | Recorrente? |
| `recurrenceType` | string | ❌ | `daily`/`weekly`/`biweekly`/`monthly`/`bimonthly`/`quarterly`/`yearly` |
| `recurrenceDueDate` | string | ❌ | Próx. vencimento recorrência |
| `recurrenceLimitDate` | string | ❌ | Data limite recorrência |
| `considerWeekends` | boolean | ❌ | Considerar fins de semana |

#### PUT /receivables/{id} — Atualizar
Campos: `bankAccountId`, `value`, `dueDate`, `competencyDate`, `description`, `observations`, `discount`, `surcharge`, `financialCategoryId`, `paymentMethodId`, `paid`, `paidDate`, `paidValue`

#### GET /receivables — Listar
**Filtros:** `customerId`, `bankAccountId`, `status` (0/1/2/4), `isRecurrent`, `dueDateFrom`, `dueDateTo`

---

### 2.26 Categorias Financeiras
#### GET /financialcategories — Listar (somente leitura)
Paginável. Max 100/página. Sem filtros de paramFilter.

---

### 2.27 Métodos de Pagamento
#### GET /paymentmethods — Listar
Paginável. Max 100/página.

**Filtros (paramFilter):**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | number | ID do método |
| `description` | string | Descrição/nome |
| `active` | boolean | Status ativo |

---

### 2.28 Pesquisas de Satisfação

#### GET /satisfactionsurveys — Listar respostas

**Filtros:** `taskId[]` (array), `email` (max 250)

**Response:**
```json
{
  "id": 1,
  "taskId": 123,
  "answerDescription": "Muito Bom",
  "questionDescription": "Como foi o atendimento?",
  "answerDate": "2026-01-15T10:00:00",
  "itemId": "1",
  "email": "cliente@email.com",
  "answersItemQuantity": 5,
  "scoreSum": 4,
  "totalResponse": 1,
  "totalSubmitted": 1
}
```

---

### 2.29 WebHooks

#### GET /webhooks — Listar
**Filtros:** `id`, `entity` (1/4/7/27/62), `action` (1/2/3), `active`

**Response:**
```json
{
  "id": 1,
  "entity": "User",
  "action": "Inclusao",
  "urlResponse": "https://your-url.com/webhook",
  "creationDate": "2024-01-01 14:30:45",
  "deleteDate": null,
  "active": true
}
```

---

## 3. Resumo de Enums Globais

### 3.1 Prioridade
| Valor | Label |
|-------|-------|
| 1 | Baixa (Low) |
| 2 | Média (Medium) |
| 3 | Alta (High) |

### 3.2 Tipo de Usuário (userType)
| Valor | Label |
|-------|-------|
| 1 | Usuário (colaborador de campo) |
| 2 | Gestor de Equipe |
| 3 | Administrador |

### 3.3 Tipo de Checkin
| Valor | Label |
|-------|-------|
| 1 | Manual |
| 2 | Automático |
| 3 | Usuário decide |

### 3.4 Tipo de Desconto
| Valor | Label |
|-------|-------|
| 0 | Valor monetário |
| 1 | Percentual |

### 3.5 Notificações
| Valor | Label |
|-------|-------|
| 0 | Nenhuma |
| 1 | Email |
| 2 | Push |
| 3 | Ambos (Email + Push) |

### 3.6 Entidade de Webhook
| Valor | Entidade |
|-------|----------|
| 1 | User |
| 4 | Task |
| 7 | Customer |
| 27 | Equipment |
| 62 | Ticket |

### 3.7 Ação de Webhook
| Valor | Ação |
|-------|------|
| 1 | Inclusão (Criação) |
| 2 | Alteração (Modificação) |
| 3 | Exclusão (Deleção) |

### 3.8 Frequência GPS (segundos)
60, 120, 180, 240, 300

### 3.9 Dias da Semana
| Valor | Dia |
|-------|-----|
| 1 | Domingo |
| 2 | Segunda |
| 3 | Terça |
| 4 | Quarta |
| 5 | Quinta |
| 6 | Sexta |
| 7 | Sábado |

### 3.10 Tipos de Recorrência
`daily`, `weekly`, `biweekly`, `monthly`, `bimonthly`, `quarterly`, `yearly`

### 3.11 Status de Contas a Receber
| Valor | Significado |
|-------|-------------|
| 0 | (não documentado explicitamente) |
| 1 | (não documentado explicitamente) |
| 2 | (não documentado explicitamente) |
| 4 | (não documentado explicitamente) |

---

## 4. Formatos e Convenções

| Tipo | Formato | Exemplo |
|------|---------|---------|
| Data com hora | `yyyy-MM-ddTHH:mm:ss` | `2026-06-18T09:00:00` |
| Só data | `yyyy-MM-dd` | `2026-06-18` |
| Hora | `HH:mm:ss` (24h) | `08:00:00` |
| Hora curta | `HH:mm` | `09:00` |
| Valores monetários | number (decimal) ou string | `10.50` ou `"10.50"` |
| IDs internos | number | `123` |
| GUIDs | string (UUID) | `"63867f52-b262-410a-a409-cc25ba92ded1"` |
| Telefone | string (só números) | `"5562999990000"` |
| Cultura | string (BCP-47) | `"pt-BR"`, `"en-US"`, `"es-CO"` |
| Booleano | boolean | `true` / `false` |
| Imagem | string base64 | `"data:image/png;base64,..."` ou base64 puro |
| Anexo src | string (URL ou base64) | Depende do endpoint |

---

## 5. Contagem Total de Endpoints

| Grupo | GET | POST | PUT | PATCH | DELETE | Total |
|-------|-----|------|-----|-------|--------|-------|
| Login | 1 | 1 | — | — | — | 2 |
| Usuários | 2 | 1 | 1 | 1 | 1 | 6 |
| Clientes | 2 | 2 | 3 | 1 | 1 | 9 |
| Grupos de Clientes | 2 | 1 | — | — | 1 | 4 |
| Produtos | 2 | 1 | 3 | — | 1 | 7 |
| Cat. Produtos | 2 | 1 | 2 | — | 1 | 6 |
| Serviços | 3 | 1 | 1 | — | 1 | 6 |
| Equipamentos | 2 | 1 | 2 | — | 1 | 6 |
| Cat. Equipamentos | 2 | 1 | 1 | — | 1 | 5 |
| Keywords | 2 | 1 | 1 | — | 1 | 5 |
| Tipos Tarefa | 2 | 1 | 1 | — | 1 | 5 |
| Equipes | 3 | 1 | — | — | — | 4 |
| Segmentos | 2 | 1 | 1 | — | 1 | 5 |
| Tarefas | 3 | 1 | 6 | 1 | 3 | 14 |
| Chamados | 3 | 1 | — | 1 | — | 5 |
| Status Chamados | 1 | — | — | — | — | 1 |
| Questionários | 2 | — | — | — | — | 2 |
| GPS | 1 | — | — | — | — | 1 |
| Ordens Serviço | 2 | 1 | — | 1 | — | 4 |
| Despesas | 2 | 1 | 2 | — | 1 | 6 |
| Tipos Despesa | 2 | 1 | 1 | — | 1 | 5 |
| Custos Adicionais | 1 | 1 | 1 | — | — | 3 |
| Notas Fiscais | 2 | 1 | 1 | — | — | 4 |
| Orçamentos | 2 | 4 | 4 | 1 | 3 | 14 |
| Contas a Receber | 2 | 1 | 1 | — | — | 4 |
| Cat. Financeiras | 1 | — | — | — | — | 1 |
| Métodos Pgto | 1 | — | — | — | — | 1 |
| Pesq. Satisfação | 1 | — | — | — | — | 1 |
| WebHooks | 2 | 1 | — | — | 1 | 4 |
| **TOTAL** | | | | | | **~141** |

---

## 6. Roadmap Público

| Data | Item | Status |
|------|------|--------|
| 2026-Q3 | Sandbox pública `sandbox.api.auvo.com.br/v2` | Planejado |
| Futuro | Suporte nativo a `Idempotency-Key` | Em roadmap |
| Semanal | Changelog publicado | Ativo |

---

## 7. Links Úteis

| Recurso | URL |
|---------|-----|
| Portal principal | https://developer.auvo.com.br |
| Quickstart | https://developer.auvo.com.br/quickstart |
| API Reference | https://developer.auvo.com.br/api-reference |
| Changelog | https://developer.auvo.com.br/changelog |
| Suporte | help@auvo.com.br |
| Guia Auth | https://developer.auvo.com.br/guides/authentication |
| Guia Paginação | https://developer.auvo.com.br/guides/pagination |
| Guia Rate Limit | https://developer.auvo.com.br/guides/rate-limit |
| Guia Webhooks | https://developer.auvo.com.br/guides/webhooks |
| Guia Erros | https://developer.auvo.com.br/guides/errors |
| Guia Idempotência | https://developer.auvo.com.br/guides/idempotency |
| Guia Versionamento | https://developer.auvo.com.br/guides/versioning |
| Doc em Inglês | https://developer.auvo.com.br/en |
| Doc em Espanhol | https://developer.auvo.com.br/es |
| Status Page | https://status.auvo.com.br |
| App (credenciais) | https://app.auvo.com.br/integracao |

---

## 8. SLA de Suporte

| Severidade | Descrição | Tempo de resposta |
|------------|-----------|-------------------|
| **Sev 1** | Produção indisponível | 1 hora (hor. comercial GMT-3) |
| **Sev 2** | Degradado | 4 horas (hor. comercial) |
| **Sev 3** | Dúvidas gerais | Próximo dia útil |

**Antes de abrir ticket:**
1. Verificar https://status.auvo.com.br
2. Consultar guia de erros
3. Reproduzir em curl com o token em uso
4. Anotar `X-Request-Id` e timestamp (UTC)

---

## 9. Paths Reais dos Endpoints (correções vs. documentação genérica)

Alguns paths reais diferem do padrão CRUD esperado:

| Descrição | Path real |
|-----------|----------|
| Tarefas excluídas | `GET /tasks/GetDeletedTasks` |
| Serviços legacy (sem paginação) | `GET /services/obterListaServicos` |
| Participantes da equipe | `GET /teams/{teamId}/users` |
| Tipos de solicitação (ticket) | `GET /tickets/request-type` |
| Status ativos (ticket) | `GET /tickets/status` |
| Estoque colaborador | `PUT /products/employee-product-stock` |
| Custo adicional no orçamento | `PUT /quotations/{id}/adicost` |
| Remover custo adicional orçamento | `DELETE /quotations/{id}/adicost` |
| Serviço no orçamento | `POST /quotations/{id}/services/{idService}` |
| Resposta questionário tarefa | `PUT /tasks/{id}/questionnaire-response` |
| Custos adicionais tarefa | `PUT /tasks/{id}/additional-costs` |

---

## 10. Notas de Comportamento Específico

### Processamento Assíncrono
- `PUT /tasks/{id}/questionnaire-response` retorna **202 Accepted**
- A resposta pode levar até **5 minutos** para refletir na tarefa
- Não é garantia de escrita imediata

### replaceData (merge vs. replace)
- Presente em: `PUT /customers` (upsert), `PUT /invoices/{id}`
- `true` (default): substitui todos os campos, campos omitidos são zerados
- `false`: faz merge, campos omitidos mantêm valor anterior

### identifierBycpfCnpj
- Apenas no `PUT /customers` (upsert)
- Quando `true`, além de id/externalId, o CPF/CNPJ também serve como identificador para localizar o registro

### allowLegalNameClear
- Apenas no `PUT /customers` (upsert)
- Default `false` — impede que a razão social seja apagada acidentalmente

### listIdUserTo (Tarefas)
- Quando enviado no POST /tasks, cria **múltiplas tarefas** (uma para cada userId da lista)
- Não usar junto com `idUserTo` (mutuamente exclusivo)

### Geocodificação automática
- Se `latitude`/`longitude` não informados ao criar tarefa, Auvo tenta geocodificar pelo `address`
- Se `customerId` informado, endereço do cliente tem precedência

### Campos bloqueados após emissão (Notas Fiscais)
- Após NF emitida: `customerId`, `responsibleUserId`, `discountType`, `discountValue`, `products`, `services`, `additionalCosts`, `payment` não podem ser alterados

### removeAllAttachmentsInsertedByMe
- Presente em: tasks, customers (não em expenses)
- Remove **apenas** anexos inseridos pela API (preserva anexos manuais do app)

### JSONPatch em PATCH endpoints
- Formato: `{ "op": "replace", "path": "<campo>", "value": "<valor>" }`
- Referência: http://jsonpatch.com/
- Usado em: Users, Customers, Tasks, Service Orders, Tickets, Quotations (sub-itens)

### Webhook upsert
- `POST /webhooks` com `id=0` cria novo
- Com `id` existente, atualiza (retorna 200 em vez de 201)
- **Limite:** apenas 1 webhook por combinação `entity + action` por admin

---

## 11. Verificação de Completude

**Fonte:** Sitemap XML (`developer.auvo.com.br/sitemap.xml`) + todas as páginas `.md` de cada endpoint.

| Verificado | Item |
|-----------|------|
| ✅ | 29 grupos de endpoints mapeados (28 documentados + WebHooks) |
| ✅ | Todos os filtros de paramFilter de cada GET de listagem |
| ✅ | Todos os campos de request body de cada POST/PUT/PATCH |
| ✅ | Todos os enums com valores numéricos |
| ✅ | Todos os guias (auth, paginação, rate limit, webhooks, erros, idempotência, versionamento) |
| ✅ | Secções OpenAPI (media-types, response-codes, error-states, authentication, rate-limiting) |
| ✅ | Página de suporte (SLA, canais) |
| ✅ | Changelog |
| ✅ | Paths reais corrigidos (vs. slugs da documentação) |
| ✅ | Comportamentos especiais (async, replaceData, geocodificação, bloqueios) |
| ⚠️ | Campos exatos de response de GET /{resource}/{id} — não documentados pela API para todos os endpoints (apenas Users e Tasks têm response examples completos no spec) |
| ⚠️ | Enums de status de Contas a Receber (valores 0/1/2/4) sem descrição oficial |
