---
tags: [heziom, api, credenciais, integração, financeiro]
status: pendente-credenciais
criado: 2026-05-21
---

# APIs Externas — Documentação e Passo a Passo para Obter Credenciais

> Guia completo para cada API externa necessária ao fechamento mensal automatizado.
> **Ação necessária:** João precisa executar os passos marcados com 👤 em cada seção.

---

## 1. AppMax (Gateway de Pagamento — SEPARADO da Tray)

### O que é
Gateway de pagamento digital da Heziom para vendas D2C. **Não é parte da Tray** — é um sistema independente com credenciais próprias.

### O que a API oferece
- Consulta de pedidos (`GET /v1/orders/{id}`)
- Pagamentos (cartão, PIX, boleto)
- Estornos (total/parcial)
- Split de pagamentos
- 21 eventos de webhook
- Recorrência (assinaturas)

### Credenciais necessárias

| Item | Descrição |
|---|---|
| `client_id` | ID do merchant (gerado após autorização do app) |
| `client_secret` | Secret do merchant |
| Token OAuth2 | JWT válido por 1h, renovável com client_credentials |

### URLs

| Ambiente | Auth | API |
|---|---|---|
| Produção | `https://auth.appmax.com.br` | `https://api.appmax.com.br` |
| Sandbox | `https://auth.sandboxappmax.com.br` | `https://api.sandboxappmax.com.br` |

### Autenticação — OAuth2 Client Credentials

```python
import requests

# 1. Obter token
resp = requests.post("https://auth.appmax.com.br/oauth2/token", data={
    "grant_type": "client_credentials",
    "client_id": CLIENT_ID,
    "client_secret": CLIENT_SECRET,
})
token = resp.json()["access_token"]  # JWT, válido 1h

# 2. Usar token em todas as chamadas
headers = {"Authorization": f"Bearer {token}"}
order = requests.get(f"https://api.appmax.com.br/v1/orders/{order_id}", headers=headers)
```

### 👤 Passo a passo para o João

1. Acessar o **painel admin AppMax** da Heziom
2. Ir em **AppStore** ou **Integrações** → Criar novo aplicativo (tipo: Privado)
3. Preencher: nome "HeziomOS Sync", email suporte, descrição
4. Selecionar webhooks: `order.approved`, `order.refunded`, `payment.approved`
5. Após criar, anotar o **Application ID** e as credenciais (`client_id` + `client_secret`)
6. Gerar credenciais do merchant via `POST /app/client/generate`
7. **Enviar para JG:** `client_id` e `client_secret` do merchant

> **Documentação:** https://appmax.readme.io
> **Contato homologação:** integracoes@appmax.com.br

---

## 2. Stone (Banking API — Extrato e Saldo)

### O que é
A Heziom usa Stone como conta bancária digital (Conta Stone). Precisamos do **extrato** (~1.260 lançamentos/mês) para conciliação e DFC.

### O que a API oferece (Stone Banking / Open Banking)
- Extrato (`GET /api/v1/accounts/{id}/statement`)
- Saldo (`GET /api/v1/accounts/{id}/balance`)
- Transferências (PIX, TED)
- Pagamentos de boleto
- Agenda de recebíveis (conciliação)

### URLs

| Ambiente | URL |
|---|---|
| Produção API | `https://api.openbank.stone.com.br` |
| Sandbox API | `https://sandbox-api.openbank.stone.com.br` |
| Auth (Keycloak) | `https://accounts.openbank.stone.com.br` |

### Autenticação — OAuth2 + JWT assinado (RSA)

A Stone usa um modelo mais sofisticado: JWT assinado com chave RSA privada.

```python
import jwt, time, uuid, requests
from cryptography.hazmat.primitives import serialization

# 1. Carregar chave privada RSA
with open("private_key.pem", "rb") as f:
    private_key = serialization.load_pem_private_key(f.read(), password=None)

# 2. Gerar JWT
now = int(time.time())
payload = {
    "iss": CLIENT_ID,
    "sub": CLIENT_ID,
    "aud": "accounts.openbank.stone.com.br",
    "exp": now + 300,
    "iat": now,
    "jti": str(uuid.uuid4()),
}
signed_jwt = jwt.encode(payload, private_key, algorithm="RS256")

# 3. Trocar JWT por access_token
resp = requests.post(
    "https://accounts.openbank.stone.com.br/auth/realms/stone_account/protocol/openid-connect/token",
    data={
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "assertion": signed_jwt,
    }
)
access_token = resp.json()["access_token"]  # ~15 min de validade

# 4. Buscar extrato
headers = {"Authorization": f"Bearer {access_token}"}
statement = requests.get(
    f"https://api.openbank.stone.com.br/api/v1/accounts/{ACCOUNT_ID}/statement",
    headers=headers
)
```

### Rate Limits
- ~60-120 requests/minuto por client
- HTTP 429 quando exceder → implementar backoff

### 👤 Passo a passo para o João

1. Acessar **Conta Stone** da Heziom: https://conta.stone.com.br
2. Ir em **Configurações** → **Integrações** ou **Developer** (pode precisar solicitar habilitação)
3. **Registrar aplicação** "HeziomOS"
4. **Gerar par de chaves RSA** (ou a Stone gera):
   ```bash
   openssl genrsa -out private_key.pem 2048
   openssl rsa -in private_key.pem -pubout -out public_key.pem
   ```
5. **Upload da chave pública** (`public_key.pem`) no portal Stone
6. Anotar o **client_id** recebido
7. Anotar o **Account ID** da conta (visível no extrato ou settings)
8. **Enviar para JG:** `client_id` + `private_key.pem` + `account_id`

> **Documentação:** https://docs.openbank.stone.com.br
> **Obs:** Se não houver área Developer no portal, contatar o gerente de conta Stone para habilitar acesso à API Banking.

---

## 3. Mercado Pago (Movimentações e Pagamentos)

### O que é
Gateway de pagamentos integrado ao ecossistema Mercado Livre. A Heziom recebe pagamentos via MP.

### O que a API oferece
- Busca de pagamentos (`GET /v1/payments/search`)
- Movimentações da conta (`GET /v1/account/movements`)
- Saldo (`GET /users/{id}/mercadopago_account/balance`)
- Relatórios de liquidação (settlement reports — CSV assíncrono)
- Detalhes de pagamento individual

### URLs

| Item | URL |
|---|---|
| API Base | `https://api.mercadopago.com` |
| Portal Dev | `https://www.mercadopago.com.br/developers/panel/app` |
| Docs | `https://www.mercadopago.com.br/developers/pt/reference` |

### Autenticação — Bearer Token (Access Token)

```python
import mercadopago  # pip install mercadopago

sdk = mercadopago.SDK("APP_USR-xxxxxxxxxxxx")

# Buscar pagamentos do mês
result = sdk.payment().search({
    "begin_date": "2026-04-01T00:00:00Z",
    "end_date": "2026-04-30T23:59:59Z",
    "status": "approved",
    "offset": 0,
    "limit": 50,
})
payments = result["response"]["results"]

# Para movimentações e saldo, usar requests direto
import requests
headers = {"Authorization": "Bearer APP_USR-xxxxxxxxxxxx"}
user = requests.get("https://api.mercadopago.com/users/me", headers=headers).json()
balance = requests.get(
    f"https://api.mercadopago.com/users/{user['id']}/mercadopago_account/balance",
    headers=headers
).json()
```

### Rate Limits
- ~1.000 requests/minuto (não oficial, mas seguro)
- Paginação limitada a offset 10.000 — usar date ranges para volumes maiores
- HTTP 429 quando exceder

### 👤 Passo a passo para o João

1. Acessar https://www.mercadopago.com.br/developers/panel/app com a conta MP da Heziom
2. Clicar **"Criar aplicação"**
3. Preencher: nome "HeziomOS", selecionar "Pagamentos online"
4. Após criar, ir em **Credenciais de produção**
5. Copiar o **Access Token** (começa com `APP_USR-`)
6. **Enviar para JG:** o Access Token de produção

> **Importante:** O Access Token do MP é permanente (não expira). Guardar com segurança.
> **SDK Python:** `pip install mercadopago`
> **Documentação:** https://www.mercadopago.com.br/developers/pt/docs

---

## 4. Amazon SP-API (Seller Partner API — Finances)

### O que é
API da Amazon para sellers. Extrai eventos financeiros, relatórios de liquidação, taxas e comissões.

### O que a API oferece
- Eventos financeiros (`GET /finances/v0/financialEvents`)
- Grupos de liquidação (`GET /finances/v0/financialEventGroups`)
- Eventos por pedido (`GET /finances/v0/orders/{orderId}/financialEvents`)
- Relatórios de settlement (via Reports API)

### URLs

| Item | URL |
|---|---|
| API Endpoint (BR) | `https://sellingpartnerapi-na.amazon.com` |
| Marketplace ID (BR) | `A2Q3Y263D00KWC` |
| AWS Region | `us-east-1` |
| LWA Token | `https://api.amazon.com/auth/o2/token` |
| Seller Central BR | `https://sellercentral.amazon.com.br` |

### Autenticação — Dupla camada (LWA + AWS SigV4)

```python
# pip install python-amazon-sp-api
from sp_api.api import Finances
from sp_api.base import Marketplaces

credentials = {
    "refresh_token": "Atzr|YOUR_REFRESH_TOKEN",
    "lwa_app_id": "amzn1.application-oa2-client.xxxx",
    "lwa_client_secret": "YOUR_LWA_SECRET",
    "aws_access_key": "AKIAXXXXXXXXX",
    "aws_secret_key": "YOUR_AWS_SECRET",
    "role_arn": "arn:aws:iam::ACCOUNT:role/SP-API-Role",
}

finances = Finances(credentials=credentials, marketplace=Marketplaces.BR)

# Eventos financeiros de abril
response = finances.list_financial_events(
    PostedAfter="2026-04-01T00:00:00Z",
    PostedBefore="2026-04-30T23:59:59Z"
)
```

### Rate Limits
- 0.5 requests/segundo (burst de 30)
- Usar backoff exponencial em HTTP 429

### 👤 Passo a passo para o João (mais complexo — precisa de AWS)

**Parte 1 — Seller Central:**
1. Logar em https://sellercentral.amazon.com.br com conta admin
2. Ir em **Apps & Services > Develop Apps**
3. Completar o **Developer Profile** (se ainda não fez)
4. Criar novo app: selecionar role **"Finance and Accounting"**
5. Informar um redirect URI (pode ser `https://localhost/callback`)
6. Após aprovação (~1-3 dias), copiar: **LWA Client ID** + **LWA Client Secret**
7. Clicar **"Authorize"** (self-authorization) → gera um **Refresh Token**

**Parte 2 — AWS (pode ser feito pela Trivia):**
1. Criar conta AWS (ou usar existente)
2. Criar IAM User com policy `execute-api:Invoke`
3. Criar IAM Role com trust policy para o user
4. Registrar o Role ARN no app do Seller Central
5. Gerar Access Key + Secret Key do IAM User

**Enviar para JG:**
- LWA Client ID
- LWA Client Secret
- Refresh Token
- (Trivia configura AWS IAM)

> **SDK Python:** `pip install python-amazon-sp-api`
> **Documentação:** https://developer-docs.amazon.com/sp-api/
> **Nota:** MWS está descontinuado. Usar apenas SP-API.

---

## 5. Mercado Livre (Orders, Billing, Invoices)

### O que é
Marketplace onde a Heziom vende. API para extrair pedidos, comissões, NFs do ML, e relatórios financeiros.

### O que a API oferece
- Pedidos (`GET /orders/search?seller={id}`)
- Invoices/Billing (`GET /users/{id}/invoices`)
- Balance (`GET /users/{id}/balance`)
- Detalhes de taxas por pedido (`GET /orders/{id}/billing_info`)
- Settlement reports (via Mercado Pago)

### URLs

| Item | URL |
|---|---|
| API Base | `https://api.mercadolibre.com` |
| Auth | `https://auth.mercadolivre.com.br/authorization` |
| Dev Portal (BR) | `https://developers.mercadolivre.com.br/` |
| App Management | `https://applications.mercadolibre.com/` |
| site_id (BR) | `MLB` |

### Autenticação — OAuth2 Authorization Code

```python
import requests

# 1. Redirecionar usuário para autorizar (uma vez):
# https://auth.mercadolivre.com.br/authorization?response_type=code&client_id={APP_ID}&redirect_uri={URI}

# 2. Trocar code por token:
resp = requests.post("https://api.mercadolibre.com/oauth/token", data={
    "grant_type": "authorization_code",
    "client_id": APP_ID,
    "client_secret": SECRET_KEY,
    "code": AUTH_CODE,
    "redirect_uri": REDIRECT_URI,
})
data = resp.json()
access_token = data["access_token"]      # 6h de validade
refresh_token = data["refresh_token"]    # 6 meses, uso único

# 3. Renovar token:
resp = requests.post("https://api.mercadolibre.com/oauth/token", data={
    "grant_type": "refresh_token",
    "client_id": APP_ID,
    "client_secret": SECRET_KEY,
    "refresh_token": refresh_token,
})

# 4. Buscar invoices:
headers = {"Authorization": f"Bearer {access_token}"}
invoices = requests.get(
    f"https://api.mercadolibre.com/users/{USER_ID}/invoices",
    params={"type": "ALL", "month": "2026-04"},
    headers=headers
).json()
```

### Rate Limits
- Varia por endpoint (~1.000 req/min para search)
- Headers `X-RateLimit-Limit`, `X-RateLimit-Remaining`
- Apps certificados têm limites maiores

### 👤 Passo a passo para o João

1. Acessar https://developers.mercadolivre.com.br/ com conta ML da Heziom
2. Ir em https://applications.mercadolibre.com/ → **"Criar nova aplicação"**
3. Preencher:
   - Nome: "HeziomOS"
   - Redirect URI: `https://heziom-sync.trivia.com.br/callback/ml` (ou URL que a Trivia definir)
   - Scopes: `read`, `write`, `offline_access`
4. Após criar, copiar: **App ID** + **Secret Key**
5. **Autorizar a conta do seller:** Acessar o link de auth gerado → Autorizar → Copiar o `code` do redirect
6. **Enviar para JG:** App ID + Secret Key + Code (ou access_token se já trocou)

> **Nota:** O Access Token do ML dura apenas 6h. O Refresh Token dura 6 meses mas é de uso único (cada refresh gera novo refresh_token). O sync agent precisa implementar renovação automática.
> **SDK Python:** `pip install meli-sdk` (desatualizado) — usar `requests` direto
> **Documentação:** https://developers.mercadolivre.com.br/pt_br/api-docs

---

## Resumo — O que pedir ao João

| # | Plataforma | O que precisa | Complexidade | Tempo estimado |
|---|---|---|---|---|
| 1 | **Mercado Pago** | Access Token (permanente) | 🟢 Fácil | 5 min |
| 2 | **AppMax** | client_id + client_secret do merchant | 🟡 Médio | 15 min |
| 3 | **Mercado Livre** | App ID + Secret + Code de auth | 🟡 Médio | 15 min |
| 4 | **Stone** | client_id + private_key + account_id | 🟠 Complexo | 30 min + suporte Stone |
| 5 | **Amazon SP-API** | LWA Client/Secret + Refresh Token + AWS IAM | 🔴 Complexo | 1-3 dias (aprovação) |

### Sugestão de ordem de ataque
1. **Mercado Pago** — mais fácil, token permanente, resolve MP + parcialmente ML
2. **AppMax** — segundo mais fácil, resolve ~2.000 transações/mês do gateway D2C
3. **Mercado Livre** — OAuth similar à Tray (já fizemos), resolve NFs e relatórios ML
4. **Stone** — precisa de suporte Stone para habilitar API, mas resolve o extrato principal
5. **Amazon SP-API** — mais complexo (AWS + Seller Central), mas volume provavelmente menor

---

## Referências

- [[Tray - Autenticação]] — fluxo OAuth Tray (já concluído)
- [[Tray - Sync Agent — Endpoints e Estratégia]] — padrão de sync agent
- [[Fechamento Mensal — Automação Completa]] — documento mestre do fechamento
- [[Roadmap de Integração Tray × Literarius]] — roadmap geral

---

*Pesquisado em 21/05/2026 — JG Novais (Trivia)*
