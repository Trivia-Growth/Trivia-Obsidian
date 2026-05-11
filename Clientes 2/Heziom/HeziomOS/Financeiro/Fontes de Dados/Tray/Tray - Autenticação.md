---
tags: [tray, api, autenticacao]
fonte: Tray API
tipo: autenticacao
---

# Tray — Autenticação

## Fluxo OAuth

```
1. POST /auth
   → { access_token, refresh_token, date_expiration_access_token, api_host }

2. Usar access_token em todas as chamadas

3. Antes de expirar → GET /auth?refresh_token={token}
   → novo { access_token, refresh_token }
```

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

## Notas

- `api_host` varia por loja — armazenar junto com o token, não usar URL fixa
- Sem a key da Tray ainda — credenciais a obter: `consumer_key`, `consumer_secret`, `code`

---

Ver: [[_a mapear]]
