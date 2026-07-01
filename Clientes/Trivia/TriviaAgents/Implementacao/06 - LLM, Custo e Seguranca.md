# 06 — LLM, Custo e Segurança

> A camada que fala com o modelo, calcula custo, controla orçamento e protege segredos.
> Fontes: `_shared/{llm-client,pricing,token-guard,crypto}.ts`, `.env`.
> Voltar ao [[00 - Guia de Implementacao]].

---

## Cliente LLM (`llm-client.ts`)

Abstração única `callLLM(params)` que suporta **dois provedores** com a mesma interface (formato Anthropic por dentro):

```ts
callLLM({ apiKey, provider, model, maxTokens, system, messages, tools? })
  → { stopReason, content[], usage:{ inputTokens, outputTokens, cacheReadTokens } }
```

- **`provider === 'anthropic'`**: usa o SDK oficial `@anthropic-ai/sdk`. `system` é array de blocos (com `cache_control`), `tools` no formato Anthropic (`input_schema`).
- **`provider === 'openrouter'`**: endpoint OpenAI-compatível `https://openrouter.ai/api/v1/chat/completions`. O cliente **converte na hora** Anthropic↔OpenAI:
  - system blocks → uma string única de system.
  - tools `input_schema` → `function.parameters`; `tool_choice: 'auto'`.
  - `tool_use` (Anthropic) ↔ `tool_calls` (OpenAI); `tool_result` → mensagens `role:'tool'`.
  - `finish_reason: tool_calls → stopReason: tool_use`; `stop → end_turn`.
  - Headers `HTTP-Referer` e `X-Title` (boa prática OpenRouter).
  - OpenRouter não retorna cache tokens → `cacheReadTokens = 0`.

> Isso é o que permite trocar de modelo sem mexer no loop. O resto do sistema só conhece o formato Anthropic.

### Mapa de modelos (IDs)
- Anthropic direto usa IDs com data quando aplicável (ex: `claude-haiku-4-5-20251001`).
- OpenRouter usa slug `org/model` (ex: `anthropic/claude-haiku-4-5`).
- O specialist-runner tem um `SLUG_MAP` para normalizar entre os dois (ver [[04 - Especialistas, APIs e Agenda]]).

---

## Preços e cálculo de custo (`pricing.ts`)

Tabela USD por 1M tokens (atualizar conforme mudar o preço):

| Modelo | input | output | cache hit |
|---|---|---|---|
| claude-opus-4-7 | 15.0 | 75.0 | 1.5 |
| claude-sonnet-4-6 | 3.0 | 15.0 | 0.3 |
| claude-sonnet-4-5 | 3.0 | 15.0 | 0.3 |
| claude-haiku-4-5 | 0.8 | 4.0 | 0.08 |
| openai/gpt-4o | 2.5 | 10.0 | 1.25 |
| google/gemini-2.0-flash | 0.1 | 0.4 | 0.025 |

Default (modelo desconhecido): 3.0 / 15.0 / 0.3.

**Fórmula** (`calculateCost`):
```
billableInput = inputTokens - cachedInputTokens
custoUSD = billableInput/1M * input
         + cachedInputTokens/1M * cacheHit
         + outputTokens/1M * output
custoBRL = custoUSD * BRL_PER_USD   (taxa fixa ≈ 5.8, ajustar)
```
> A taxa câmbio é fixa no código (5.8 no pricing, 5.5 no specialist-runner). Considere centralizar numa config/tenant_settings.

---

## Token guard (`token-guard.ts`)

Controle de orçamento mensal por (tenant, agente):

- **`tokenGuardCheck`**: soma `cost_usd` de `token_usage_log` desde o 1º dia do mês para (tenant, agente). Se ≥ `monthlyBudgetUsd` (**default US$ 50**) → `{ allowed:false, reason }`, e o agent-runner para antes de chamar o LLM. Em erro de query → permite (fail-open) e loga warning.
- **`tokenGuardLog`**: insere no `token_usage_log` com custo calculado (USD+BRL). Chamado ao fim de cada execução.

> Decisão: o guard é por agente, mensal, fail-open. Se quiser teto rígido por tenant, troque a query e o fail-open por fail-closed.

---

## Criptografia (`crypto.ts`) — AES-GCM via Web Crypto

```
getKey():  PBKDF2(ENCRYPTION_KEY, salt='triviaagents-salt-v1', 100k iter, SHA-256) → AES-GCM 256
encrypt(): IV(12 bytes aleatório) + AES-GCM → base64(IV + ciphertext)
decrypt(): base64 decode → separa IV(12) + ciphertext → AES-GCM decrypt
```

Usado para: tokens Z-API/Evolution, access/app secret Meta, BYOK (quando armazenado pela função), tokens OAuth de agenda.

> Em outra stack, qualquer AES-256-GCM com chave derivada serve. O importante: **chave só no servidor (`ENCRYPTION_KEY`)**, IV aleatório por segredo, segredo em texto plano nunca persistido nem logado nem enviado ao modelo.

---

## Variáveis de ambiente (backend)

| Variável | Uso |
|---|---|
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | acesso privilegiado (auto-injetado) |
| `SUPABASE_ANON_KEY` | resolver usuário via JWT (playground/funções autenticadas) |
| `SERVICE_ROLE_JWT` | auth nas chamadas internas entre funções (fallback = service role) |
| `ENCRYPTION_KEY` | chave da criptografia (`openssl rand -hex 32`) |
| `ANTHROPIC_API_KEY_FALLBACK` | chave Anthropic de fallback |
| `OPENROUTER_API_KEY` / `OPENROUTER_DEFAULT_MODEL` | chave + modelo padrão OpenRouter |
| `MAX_TURNS_DEFAULT` (6) | turnos do loop |
| `CONTEXT_RECENT_WINDOW` (10) / `CONTEXT_COMPACTION_THRESHOLD` (20) | janela e compactação |
| `ZAPI_WEBHOOK_SECRET` | valida webhook Z-API |
| `META_APP_SECRET` | valida assinatura Meta |
| `TRANSCRIPTION_PROVIDER` (openai\|groq) + `OPENAI_API_KEY` / `GROQ_API_KEY` | transcrição |
| `GOOGLE_CLIENT_ID/SECRET`, `MICROSOFT_CLIENT_ID/SECRET` | OAuth de agenda |
| `LOG_LEVEL` (info) | log |

**Frontend (público):** apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. Nenhum segredo de LLM/canal no client.

---

## Checklist de segurança (do SECURITY_DEBT + boas práticas)

- [ ] RLS + FORCE em **todas** as tabelas (inclui specialists/specialist_apis).
- [ ] CORS restrito ao domínio de produção (não `*`).
- [ ] Validação de input (Zod ou equivalente) em toda função, especialmente specialist-runner e api-caller.
- [ ] Rate limiting nos endpoints públicos (webhooks).
- [ ] BYOK/segredos nunca em log, response ou prompt.
- [ ] Token de API externa descriptografado só no servidor, nunca em `tool_result`.
- [ ] `service_role` só no backend; frontend usa chave publishable.
- [ ] Webhooks validam autenticidade (secret/HMAC/verify_token) antes de processar.

---

## Resumo da camada

| Componente | Responsabilidade | Reimplementar como |
|---|---|---|
| llm-client | falar com 1+ provedores numa interface só | adapter por provedor, formato interno único |
| pricing | custo por modelo | tabela de preços + fórmula |
| token-guard | teto de gasto | soma mensal + bloqueio |
| crypto | segredos em repouso | AES-256-GCM com chave server-side |
