---
tags: [tray, api, autenticacao]
fonte: Tray API
tipo: autenticacao
---

# Tray — Autenticação

## Fluxo OAuth — Visão Geral

```
PASSO 1 — Único, manual, feito uma vez por loja
  Instalar app na loja → Tray gera um "code" (aparece na URL de callback)

PASSO 2 — Programático, troca o "code" pelo primeiro token
  POST https://{api_address}/web_api/auth
  Body: { consumer_key, consumer_secret, code }
  → Retorna: { access_token, refresh_token, api_host, date_expiration_access_token }

PASSO 3 — Todas as chamadas da API
  GET/POST https://{api_host}/web_api/{endpoint}?access_token={token}

PASSO 4 — Renovação antes de expirar (proativo)
  GET https://{api_host}/web_api/auth?consumer_key=…&consumer_secret=…&refresh_token=…
  → Novo { access_token, refresh_token }
```

## Fluxo OAuth — Detalhe Programático

### Passo 1 — Obter o `code` (manual, uma vez)

> ⚠️ Requer login humano — a Tray usa reCAPTCHA no painel.

1. Acesse `https://loja-s.tray.com.br/adm/login.php?loja=1501119`
2. Login: `atendimento@editoraheziom.com.br` / *(senha no `Credenciais.secret.md` local do HeziomOS — não versionar)*
3. Menu lateral → **Aplicativos** → **Instalar novos aplicativos**
4. Pesquisar **Heziom OS** → instalar
5. A Tray redireciona para a URL de callback — o `code` aparece como parâmetro na URL

### Passo 2 — Trocar `code` por Access Token

```python
import requests

CONSUMER_KEY    = "<ver Credenciais.secret.md local do HeziomOS — não versionar>"
CONSUMER_SECRET = "<ver Credenciais.secret.md local do HeziomOS — não versionar>"
CODE            = "<code_obtido_no_passo_1>"
API_ADDRESS     = "loja-s.tray.com.br"  # host da loja de teste (ID 1501119)

url = f"https://{API_ADDRESS}/web_api/auth"
payload = {
    "consumer_key":    CONSUMER_KEY,
    "consumer_secret": CONSUMER_SECRET,
    "code":            CODE,
}

resp = requests.post(url, json=payload)
data = resp.json()

# Salvar para uso posterior
access_token  = data["access_token"]
refresh_token = data["refresh_token"]
api_host      = data["api_host"]       # ⚠️ usar este host em todas as calls, não API_ADDRESS
expires_at    = data["date_expiration_access_token"]
store_id      = data["store_id"]

print(f"Access Token: {access_token}")
print(f"API Host:     {api_host}")
print(f"Expira em:    {expires_at}")
```

> **Importante:** salvar `api_host` junto com os tokens — ele é único por loja e difere do endereço de login.

### Passo 3 — Chamadas autenticadas

```python
# Padrão de chamada com access_token
def tray_get(endpoint, params=None, access_token=None, api_host=None):
    base = f"https://{api_host}/web_api"
    p = params or {}
    p["access_token"] = access_token
    resp = requests.get(f"{base}/{endpoint}", params=p)
    resp.raise_for_status()
    return resp.json()

# Exemplo: listar pedidos aprovados de maio
pedidos = tray_get(
    "orders",
    params={
        "date":   "2026-05-01,2026-05-19",
        "status": "aprovado",
        "limit":  50,
        "page":   1,
    },
    access_token=access_token,
    api_host=api_host,
)
```

### Passo 4 — Renovação do token (refresh)

```python
from datetime import datetime, timedelta

def renovar_token_se_necessario(access_token, refresh_token, expires_at, api_host):
    """Renova o access_token se estiver a menos de 1h de expirar."""
    expira = datetime.fromisoformat(expires_at)
    if datetime.now() < expira - timedelta(hours=1):
        return access_token, refresh_token, expires_at  # ainda válido

    url = f"https://{api_host}/web_api/auth"
    params = {
        "consumer_key":    CONSUMER_KEY,
        "consumer_secret": CONSUMER_SECRET,
        "refresh_token":   refresh_token,
    }
    resp = requests.get(url, params=params)
    data = resp.json()

    return (
        data["access_token"],
        data["refresh_token"],
        data["date_expiration_access_token"],
    )
```

### Armazenamento dos tokens (recomendado para o sync agent)

```python
# Salvar em arquivo local seguro (não versionar)
import json, os

TOKEN_FILE = "/etc/heziom-sync/tray_tokens.json"  # fora do repositório

def salvar_tokens(access_token, refresh_token, expires_at, api_host, store_id):
    data = {
        "access_token":  access_token,
        "refresh_token": refresh_token,
        "expires_at":    expires_at,
        "api_host":      api_host,
        "store_id":      store_id,
        "updated_at":    datetime.now().isoformat(),
    }
    os.makedirs(os.path.dirname(TOKEN_FILE), exist_ok=True)
    with open(TOKEN_FILE, "w") as f:
        json.dump(data, f, indent=2)
    os.chmod(TOKEN_FILE, 0o600)  # leitura só pelo processo

def carregar_tokens():
    with open(TOKEN_FILE) as f:
        return json.load(f)
```

> Para o Raspberry Pi, armazenar em `/etc/heziom-sync/` (fora do código, permissão 600). Ver [[ADR-002 — Segurança do Sync Agent]].

## Campos do token

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `code` | int | Código de retorno |
| `message` | string | Mensagem de status |
| `api_host` | string | Host base da API para esta loja |
| `access_token` | string | Token de acesso (curta duração) |
| `refresh_token` | string | Token de renovação (longa duração) |
| `date_activated` | datetime | Data de ativação |
| `date_expiration_access_token` | datetime | Expiração do access_token |
| `date_expiration_refresh_token` | datetime | Expiração do refresh_token |
| `store_id` | int | ID da loja na Tray |

## Credenciais do Aplicativo Heziom OS

> Recebidas via ticket #1615764 em 15/04/2026. App liberado em **todas as lojas de teste** da Tray.

| Parâmetro | Valor |
|-----------|-------|
| **Nome do app** | Heziom OS |
| **Consumer Key** | `<CONSUMER_KEY no .secret.md local do HeziomOS>` |
| **Consumer Secret** | `<CONSUMER_SECRET no .secret.md local do HeziomOS>` |

> ⚠️ As chaves são únicas por integração e valem em todas as lojas que instalam o app. Nunca expô-las ao usuário final.

### Loja de Teste (atual — ativa)

| Parâmetro | Valor |
|-----------|-------|
| **Loja ID** | `1501119` |
| **URL** | `https://loja-s.tray.com.br/adm/login.php?loja=1501119` |
| **Login** | `atendimento@editoraheziom.com.br` |
| **Senha** | `(senha no .secret.md local)` |
| **Status** | ✅ Ativa (criada 20/05/2026 — loja de teste dedicada para parceiros) |
| **App Heziom OS** | ✅ Instalado e autenticado (20/05/2026) |

> Nova loja de teste criada pela Tray (João G. — Suporte Técnico) para substituir a anterior que estava bloqueada.

### Tokens Ativos (loja 1501119)

| Parâmetro | Valor |
|-----------|-------|
| **access_token** | `APP_ID-8395-STORE_ID-1501119-0398320d2f1d2005ffced89adfe90a6f44d82b8f1de6a5dcccec55e55fe3e279` |
| **refresh_token** | `57c82631562787669e5cbf3f03a8f5786b645fe6c07699367ef101de25a68ac4` |
| **api_host** | `https://lojatesteintegracaotray.commercesuite.com.br/web_api` |
| **store_id** | `1501119` |
| **Ativado em** | 2026-05-20 10:23:24 |
| **Access expira** | 2026-05-20 13:23:24 (3h — renovar com refresh) |
| **Refresh expira** | 2026-06-19 10:23:24 (30 dias) |

> ⚠️ O `access_token` expira em 3h. Usar o `refresh_token` para renovar antes de expirar (ver Passo 4 acima).
> ⚠️ O endpoint correto é `POST /web_api/auth` (sem `/v2/`).

**Teste validado:** `GET /web_api/orders` retornou 2 pedidos da loja de teste com sucesso.

### Loja anterior (descontinuada)

| Parâmetro | Valor |
|-----------|-------|
| **Loja ID** | `1225878` |
| **URL** | `https://loja-s.tray.com.br/adm/login.php?loja=1225878` |
| **Login** | `atendimento@editoraheziom.com.br` |
| **Senha** | `Trayteste@321` |
| **Status** | ❌ Bloqueada por inatividade (mai/2026) — não usar mais |

### Como obter o `code` para gerar o Access Token

1. Acessar a loja de teste **1501119** com as credenciais acima
2. Menu lateral → **Aplicativos** → **Instalar novos aplicativos**
3. Pesquisar por **Heziom OS** e instalar
4. O `code` gerado + `consumer_key` + `consumer_secret` → `POST /auth` → retorna `access_token`

### Rate limit

- **180 requisições/minuto** — implementar controle de backoff obrigatório
- Descumprimento desativa o acesso

### Prazo de homologação

- Máximo **120 dias** após envio das chaves (→ até **13/08/2026**)
- Após esse prazo, integração e acesso podem ser inativados
- Processo: abrir chamado [Homologação de Aplicativo] - Partner Tech na Tray

## Notas

- `api_host` varia por loja — armazenar junto com o token, não usar URL fixa
- Chaves permaneccem as mesmas em todas as lojas (não mudam por ambiente)

---

Ver: [[_a mapear]]
