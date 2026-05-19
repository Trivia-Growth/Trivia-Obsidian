---
tags: [tray, api, rate-limit, paginação, sync]
status: documentado
criado: 2026-05-19
---

# Tray — Rate Limit e Paginação

> Regras obrigatórias para o sync agent. Ignorar qualquer uma pode desativar o acesso.

---

## Rate Limit

| Nível | Limite |
|---|---|
| Padrão | **180 requisições / minuto** |
| Corporativo | 50.000 requisições / dia |
| Consequência de violação | Acesso desativado até ajustes |

### Implementação obrigatória no sync agent

```python
import time
from collections import deque

class TrayRateLimiter:
    """Garante no máximo 180 req/min com margem de segurança."""

    def __init__(self, max_per_minute=160):  # 160 = margem de 20 req/min
        self.max_per_minute = max_per_minute
        self.calls = deque()

    def wait_if_needed(self):
        now = time.time()
        # Remove chamadas com mais de 60s
        while self.calls and self.calls[0] < now - 60:
            self.calls.popleft()

        if len(self.calls) >= self.max_per_minute:
            # Calcula quanto esperar para liberar uma vaga
            oldest = self.calls[0]
            wait = 60 - (now - oldest) + 0.1
            if wait > 0:
                time.sleep(wait)

        self.calls.append(time.time())

# Uso
limiter = TrayRateLimiter()

def tray_get_safe(endpoint, params, access_token, api_host):
    limiter.wait_if_needed()
    resp = requests.get(
        f"https://{api_host}/web_api/v2/{endpoint}",
        params={"access_token": access_token, **params},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()
```

---

## Paginação

Todos os endpoints de listagem da Tray usam paginação por `limit` + `page`.

| Parâmetro | Padrão | Máximo recomendado |
|---|---|---|
| `limit` | 20 | **50** |
| `page` | 1 | — |

### Resposta paginada — estrutura

```json
{
  "code": 200,
  "message": "OK",
  "paging": {
    "total": 1681,
    "page":  1,
    "limit": 50,
    "pages": 34
  },
  "sort": [...],
  "available_filters": [...],
  "Orders": [...]
}
```

### Função de paginação completa

```python
def tray_fetch_all(endpoint, params, access_token, api_host, limiter=None):
    """Busca todas as páginas de um endpoint com rate limit."""
    results = []
    page = 1

    while True:
        p = {**params, "limit": 50, "page": page}

        if limiter:
            limiter.wait_if_needed()

        resp = requests.get(
            f"https://{api_host}/web_api/v2/{endpoint}",
            params={"access_token": access_token, **p},
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()

        # Extrai lista de resultados (nome da chave varia por endpoint)
        # Orders, Products, Payments, etc.
        resource_key = next(
            (k for k in data if k not in ("code", "message", "paging", "sort", "available_filters")),
            None
        )
        if not resource_key or not data.get(resource_key):
            break

        results.extend(data[resource_key])

        paging = data.get("paging", {})
        if page >= paging.get("pages", 1):
            break
        page += 1

    return results
```

### Exemplo — buscar todos os pedidos de maio

```python
pedidos = tray_fetch_all(
    "orders",
    params={
        "date":   "2026-05-01,2026-05-19",
        "status": "aprovado",
    },
    access_token=access_token,
    api_host=api_host,
    limiter=limiter,
)
print(f"Total pedidos: {len(pedidos)}")
```

---

## Filtros de data — formato

```
?date=YYYY-MM-DD,YYYY-MM-DD
```

Aplica-se a `orders`, `payments`, `invoices`. Sem filtro de data, retorna todos os registros (lento e pesado — sempre filtrar).

---

## Estratégia de sync incremental (recomendada)

```python
# Salva o timestamp do último sync bem-sucedido
# Próximo sync busca apenas o delta

from datetime import datetime, timedelta

def get_ultima_sync():
    # Ler de arquivo ou Supabase
    return "2026-05-18"  # exemplo

def sync_pedidos(access_token, api_host):
    ultima = get_ultima_sync()
    hoje = datetime.now().strftime("%Y-%m-%d")

    pedidos = tray_fetch_all(
        "orders",
        params={"date": f"{ultima},{hoje}"},
        access_token=access_token,
        api_host=api_host,
        limiter=limiter,
    )

    # Processar e upsert no Supabase
    # ...

    salvar_ultima_sync(hoje)
    print(f"Sincronizados {len(pedidos)} pedidos de {ultima} até {hoje}")
```

---

## Erros comuns

| Código HTTP | Causa | Solução |
|---|---|---|
| `401` | Token expirado | Renovar via refresh_token |
| `429` | Rate limit excedido | Backoff exponencial + reduzir parallelismo |
| `503` | API temporariamente indisponível | Retry com espera de 30s |
| `404` | Endpoint ou recurso não existe | Verificar ID e endpoint |

```python
import time

def tray_get_com_retry(endpoint, params, access_token, api_host, max_retries=3):
    for tentativa in range(max_retries):
        try:
            limiter.wait_if_needed()
            resp = requests.get(
                f"https://{api_host}/web_api/v2/{endpoint}",
                params={"access_token": access_token, **params},
                timeout=30,
            )
            if resp.status_code == 429:
                wait = 60 * (tentativa + 1)
                print(f"Rate limit — aguardando {wait}s")
                time.sleep(wait)
                continue
            if resp.status_code == 503:
                time.sleep(30)
                continue
            resp.raise_for_status()
            return resp.json()
        except requests.exceptions.Timeout:
            if tentativa == max_retries - 1:
                raise
            time.sleep(10)
    raise Exception(f"Falha após {max_retries} tentativas em {endpoint}")
```

---

## Referências

- [[Tray - Autenticação]] — tokens e credenciais
- [[Tray - Pedidos]] — filtros específicos de pedidos
- [[ADR-001 — Sync Agent no Raspberry Pi]] — arquitetura do sync
- [[Tray — Correlação com Literarius]] — mapeamento completo

---

*Documentado em 2026-05-19 — JG Novais (Trivia)*
