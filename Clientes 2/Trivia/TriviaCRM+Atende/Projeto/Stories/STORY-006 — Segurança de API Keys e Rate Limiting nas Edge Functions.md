---
id: STORY-006
titulo: "Segurança de API Keys e Rate Limiting nas Edge Functions"
modulo: "Segurança"
status: "concluido"
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
- [ ] `ai-orchestrator`: as chamadas a OpenAI/Anthropic/Google devem ser feitas via `Deno.env.get()` de secrets pré-configurados — nunca buscar key do banco e passar como string
- [ ] `roleplay-chat`: mesma refatoração
- [ ] Mover API keys para Supabase Secrets (`supabase secrets set`) — não armazenar em tabela do banco
- [ ] Tabela `ai_providers_config` pode manter qual provider usar, mas não a key em texto plano

### Rate Limiting
- [ ] Implementar rate limit por `workspace_id` nas funções de IA (`ai-orchestrator`, `roleplay-chat`, `copilot-suggest`)
- [ ] Implementar rate limit por IP em funções públicas (`lead-intake`, `zapi-webhook`)
- [ ] Usar Supabase KV ou tabela `rate_limits` para estado

### CORS
- [ ] Criar constante `ALLOWED_ORIGINS = ['https://triviacrmatende.netlify.app']`
- [ ] Substituir `"Access-Control-Allow-Origin": "*"` por verificação de origem em todas as funções
- [ ] Manter `*` apenas para funções que precisam de acesso público irrestrito (como `zapi-webhook` que recebe do Z-API)

## Critérios de Aceite

- [ ] `ai-orchestrator` e `roleplay-chat` lendo API keys via `Deno.env.get()`, não do banco
- [ ] Rate limiting funcionando para funções de IA (teste: 429 após limite excedido)
- [ ] CORS restrito ao domínio de produção nas funções autenticadas
- [ ] `supabase secrets list` mostra as API keys configuradas
- [ ] `supabase functions deploy` passa para todas as funções alteradas
