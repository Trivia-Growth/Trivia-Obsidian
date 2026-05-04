---
id: STORY-003
titulo: "Agente Core + Chat Web (OpenRouter, memória, onboarding conversacional)"
fase: 1
modulo: M1 Agente
status: done
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-003 — Agente Core + Chat Web

## Contexto

O agente é o coração do FamilyOS. Esta story entrega o chat web funcional integrado ao OpenRouter, com memória de longo prazo (armazenada no Supabase) e o onboarding conversacional — em vez de formulário, o agente conduz uma entrevista para conhecer a família.

## Spec de Referência

- [[00 - Índice]] — Módulo M1
- Repositório: `PROJECT_REQUIREMENTS.md` — Módulo M1 (personalidade, memória, onboarding, tool registry)

## Critérios de Aceite

- [x] CA1 — Chat web com histórico de mensagens funcionando (interface fluida, sem reload)
- [x] CA2 — Edge Function `agent-chat` chamando OpenRouter com o modelo configurado (`anthropic/claude-sonnet-4-5`)
- [x] CA3 — JWT validado na Edge Function antes de qualquer processamento
- [x] CA4 — Input validado com Zod na Edge Function
- [x] CA5 — Memória de longo prazo: tabela `agent_memories` com tipos `fact`, `preference`, `goal`, `event`
- [x] CA6 — Agente busca memórias relevantes antes de cada resposta
- [x] CA7 — Agente salva novas informações na memória automaticamente durante a conversa
- [x] CA8 — Onboarding: primeiro acesso dispara entrevista guiada (composição familiar, renda, objetivos)
- [x] CA9 — Personalidade padrão: "Amigo Próximo" (tom informal, direto, tudo em português)
- [x] CA10 — Conversas salvas no banco: tabela `conversations` + `messages`
- [x] CA11 — RLS em todas as tabelas do agente por `family_id`

## Tabelas de Banco

```sql
CREATE TABLE agent_memories (...)
CREATE TABLE conversations (...)
CREATE TABLE messages (...)
-- Ver migration 20260504000005_create_agent_tables.sql
```

---

## Implementação

**Status:** Done
**Branch/PR:** Direto na `main`
**Arquivos alterados:**
- `supabase/migrations/20260504000005_create_agent_tables.sql`
- `supabase/functions/agent-chat/index.ts`
- `supabase/functions/_shared/getLLMKey.ts`
- `src/features/agent/components/ChatPage.tsx`
- `src/features/agent/api/useChat.ts`
- `src/features/agent/types/index.ts`

---

## QA

**Gate:** PASS
**Checklist:**
- [x] Critérios de aceite validados
- [x] JWT + Zod validados na Edge Function
- [x] RLS em `agent_memories`, `conversations`, `messages`
- [x] Agente responde em português

**Notas QA:**
- Chave OpenRouter configurável por família (STORY-012)
- `getLLMKey.ts` busca na tabela `family_llm_config` com fallback para env global

---

## Notas e Decisões

- OpenRouter key da família vem do banco — nunca hardcoded
- Na Fase 1, busca keyword para memórias; embeddings na Fase 2
- Onboarding: se usuário pular perguntas, agente não insiste
