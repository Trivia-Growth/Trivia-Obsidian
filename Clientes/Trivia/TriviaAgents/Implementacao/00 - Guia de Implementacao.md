# Guia de Implementação — Reconstruir os Agentes de Atendimento

> Tudo o que é necessário para reimplementar a lógica e a configuração dos agentes do TriviaAgents em outro sistema.
> Base: repositório `Trivia-Growth/TriviaAgents` (clone local em `~/Documents/Obsidian/Github/TriviaAgents`). Levantamento: 30/06/2026.
> Visão conceitual de alto nível: [[Mapeamento - Configuracoes dos Agentes]].

---

## O que você está reconstruindo

Uma plataforma multi-tenant de **agentes de IA conversacionais** para atendimento (WhatsApp, Instagram, Facebook). Cada agente é definido por configuração em banco de dados; a cada mensagem recebida, o sistema monta um *system prompt* + uma lista de *ferramentas* e chama um LLM num loop de *tool use*.

O segredo do comportamento NÃO está em código hardcoded — está em **6 blocos de configuração** que viram prompt. Reproduza esses blocos + o loop e o agente se comporta igual, mesmo em outra stack (não precisa ser Supabase/Deno).

```
ENTRADA                      NÚCLEO                          SAÍDA
webhook do canal  ──►  agent-runner (loop LLM)  ──►  sender do canal
(WhatsApp/Meta)        ├─ monta prompt (6 blocos)     (Z-API/Evolution/
                       ├─ chama LLM                     Meta Graph)
                       ├─ tool use:
                       │   • solicitar_handoff
                       │   • chamar_especialista__X ──► specialist-runner (LLM isolado)
                       │   • chamar_api__Y          ──► api-caller (proxy seguro)
                       └─ roteia resposta
```

---

## Ordem de leitura dos documentos

| # | Documento | O que cobre |
|---|---|---|
| 1 | [[01 - Modelo de Dados]] | Todas as tabelas, RLS multi-tenant, criptografia de segredos |
| 2 | [[02 - Montagem do Prompt]] | Como os 6 blocos viram system prompt; texto literal do cabeçalho; regras de formatação; tools |
| 3 | [[03 - Loop de Orquestracao]] | O runtime do agent-runner passo a passo: guardas, tool-use, handoff, pipeline |
| 4 | [[04 - Especialistas, APIs e Agenda]] | Multi-agent: especialista isolado, BYOA seguro, agenda Google/Microsoft |
| 5 | [[05 - Canais de Entrada e Saida]] | Webhooks de entrada, senders de saída, formato de mensagem, áudio/transcrição |
| 6 | [[06 - LLM, Custo e Seguranca]] | Cliente LLM (Anthropic + OpenRouter), preços, token guard, crypto, variáveis de ambiente |

---

## As 7 entidades de configuração (resumo)

| Entidade | Tabela(s) | É o quê |
|---|---|---|
| Agente | `agents` | Identidade, modelo, status, canais |
| Conhecimento | `knowledge_docs` | Markdown que o agente "sabe" |
| Correções | `corrections` | Memória corrigível (errado → certo) |
| Regras | `agent_rules` | Horário, limite diário, gatilhos de handoff |
| Especialistas | `specialists` + `agent_specialist_links` (+ docs/rules/corrections/apis/calendar próprios) | Sub-agentes isolados reutilizáveis |
| APIs externas | `specialist_apis` | Chamadas a terceiros (BYOA) com token protegido |
| Tenant/canais | `tenant_settings`, `api_keys`, `agent_channels`, `pipeline_*` | Chaves, canais Meta, Kanban |

---

## Decisões de arquitetura que você deve decidir manter ou trocar

| ID | Decisão original | Por quê | Pode trocar? |
|---|---|---|---|
| ADR-001 | Edge Functions serverless (não VPS) | Zero infra, stateless, timeout ~150s | Sim — qualquer backend que aguente o loop |
| ADR-002 | Markdown direto no prompt (sem RAG) | Bases até ~50k tokens não precisam de chunking; cache reduz custo | Trocar por RAG só se a base crescer muito |
| ADR-003 | AES-GCM (Web Crypto) p/ segredos | Portável; alternativa ao pgcrypto | Manter algum encryption-at-rest |
| ADR-005 | Token Meta manual (sem OAuth) | OAuth Meta exige app review | Depende da escala |
| ADR-008 | Multi-agent via tool use dinâmico | Orquestração natural, sem framework externo | É o coração — recomendo manter |

---

## Checklist de implementação (macro)

**Infra base**
- [ ] Banco com as tabelas de [[01 - Modelo de Dados]] + isolamento multi-tenant
- [ ] Criptografia de segredos em repouso (AES-GCM ou equivalente)
- [ ] Chaves de LLM (BYOK por tenant) + fallback de ambiente

**Núcleo do agente**
- [ ] Função de montagem de prompt ([[02 - Montagem do Prompt]]) — preservar ordem e cabeçalho
- [ ] Loop de orquestração ([[03 - Loop de Orquestracao]]) — guardas + tool use (máx 6 turnos)
- [ ] Cliente LLM com suporte a tool use ([[06 - LLM, Custo e Seguranca]])

**Multi-agent**
- [ ] Runner de especialista isolado (sem histórico)
- [ ] Proxy de API seguro (token nunca volta ao modelo)
- [ ] (Opcional) Agenda Google/Microsoft

**Canais**
- [ ] Webhook de entrada por canal ([[05 - Canais de Entrada e Saida]])
- [ ] Sender de saída por canal
- [ ] (Opcional) Transcrição de áudio

**Operação**
- [ ] Log de tokens + guard de orçamento
- [ ] Handoff humano + UI de atendimento
- [ ] Pipeline Kanban + regras automáticas

---

## Mapa de arquivos-fonte (no clone)

| Assunto | Arquivo |
|---|---|
| Schema base | `supabase/migrations/20260512000001_init.sql` |
| RLS | `supabase/migrations/20260512000002_rls_policies.sql` |
| Especialistas (redesign) | `supabase/migrations/20260512000010_specialists_redesign.sql` |
| Montagem do prompt | `supabase/functions/_shared/prompt-builder.ts` |
| Loop principal | `supabase/functions/agent-runner/index.ts` |
| Especialista isolado | `supabase/functions/specialist-runner/index.ts` |
| Proxy de API | `supabase/functions/api-caller/index.ts` |
| Cliente LLM | `supabase/functions/_shared/llm-client.ts` |
| Crypto / Pricing / Guard | `supabase/functions/_shared/{crypto,pricing,token-guard}.ts` |
| Canais (in) | `supabase/functions/{zapi-webhook,evolution-webhook,meta-webhook}/index.ts` |
| Canais (out) | `supabase/functions/_shared/{whatsapp-sender,zapi,meta}.ts` |
| Arquitetura geral | `architecture.md` |
