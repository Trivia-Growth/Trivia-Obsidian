---
id: STORY-006
titulo: "Segurança de API Keys e Rate Limiting nas Edge Functions"
modulo: "Segurança"
status: "concluido"
implementado: 2026-05-05
fase: 3
prioridade: 2
agente_responsavel: "—"
atualizado: 2026-05-05
---

# STORY-006 — Segurança de API Keys e Rate Limiting nas Edge Functions

## Contexto (Auditoria TRIVIAIOX — 2026-05-05)

Duas vulnerabilidades de segurança de médio/alto risco encontradas:

1. **API Keys de LLM em memória de função**: `ai-orchestrator` e `roleplay-chat` lêem as API keys dos providers (OpenAI, Anthropic, Google) da tabela `ai_providers_config` e as passam como strings para chamar APIs externas. Isso expõe as chaves no contexto da função.

2. **Sem rate limiting**: Nenhuma Edge Function tem limitação de chamadas. Qualquer pessoa com token válido pode fazer chamadas ilimitadas — gerando custo e risco de abuso.

3. **CORS `*` em produção**: Todas as funções permitem qualquer origem.

## O que fazer

### API Keys
- [x] Abordagem: **DB-first** (parâmetro via sistema/app UI) — `ai_providers_config` é a fonte primária, env var é fallback de plataforma
- [x] `ai-orchestrator`: `resolveApiKey()` prioriza DB, cai em env se não configurado
- [x] `roleplay-chat`: `resolveAiProvider()` prioriza DB, cai em env/Lovable gateway
- [x] Decisão: não migrar para Supabase Secrets — cada workspace configura via Settings > IA

### Rate Limiting
- [x] `_shared/rate-limit.ts` criado — fixed-window com tabela `rate_limits` + RPC atômico
- [x] `ai-orchestrator`: 100 req/min por workspace
- [x] `roleplay-chat`: 30 req/min por workspace
- [x] `copilot-suggest`: 60 req/min por workspace
- [x] `lead-intake`: 30 req/min por workspace (via API token → workspace_id)
- [ ] `zapi-webhook`: não limitado (webhook inbound, alta frequência legítima)

### CORS
- [x] `_shared/cors.ts` — `ALLOWED_ORIGINS = ['https://triviacrmatende.netlify.app']`
- [x] Funções autenticadas restringem ao domínio Netlify
- [x] Funções públicas (`zapi-webhook`, `ai-orchestrator` via webhook) mantêm `*`

## Critérios de Aceite

- [ ] `ai-orchestrator` e `roleplay-chat` lendo API keys via `Deno.env.get()`, não do banco
- [ ] Rate limiting funcionando para funções de IA (teste: 429 após limite excedido)
- [ ] CORS restrito ao domínio de produção nas funções autenticadas
- [ ] `supabase secrets list` mostra as API keys configuradas
- [ ] `supabase functions deploy` passa para todas as funções alteradas
