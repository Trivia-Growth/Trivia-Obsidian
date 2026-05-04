---
id: STORY-003
titulo: "Agente Core + Chat Web (OpenRouter, memória, onboarding conversacional)"
fase: 1
modulo: M1 Agente
status: backlog
prioridade: alta
agente_responsavel: ""
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-003 — Agente Core + Chat Web

## Contexto

O agente é o coração do FamilyOS. Esta story entrega o chat web funcional integrado ao OpenRouter, com memória de longo prazo (armazenada no Supabase) e o onboarding conversacional — em vez de formulário, o agente conduz uma entrevista para conhecer a família.

## Spec de Referência

- [[00 - Índice]] — Módulo M1
- Repositório: `PROJECT_REQUIREMENTS.md` — Módulo M1 (personalidade, memória, onboarding, tool registry)
- Repositório: `specs/technical/BUSINESS_LOGIC.md` — Tipos de memória e regras

## Critérios de Aceite

- [ ] CA1 — Chat web com histórico de mensagens funcionando (interface fluida, sem reload)
- [ ] CA2 — Edge Function `agent-chat` chamando OpenRouter com o modelo configurado (`anthropic/claude-sonnet-4-5`)
- [ ] CA3 — JWT validado na Edge Function antes de qualquer processamento
- [ ] CA4 — Input validado com Zod na Edge Function
- [ ] CA5 — Memória de longo prazo: tabela `agent_memories` com tipos `fact`, `preference`, `goal`, `event`
- [ ] CA6 — Agente busca memórias relevantes antes de cada resposta (similaridade semântica ou keyword)
- [ ] CA7 — Agente salva novas informações na memória automaticamente durante a conversa
- [ ] CA8 — Onboarding: primeiro acesso dispara entrevista guiada (composição familiar, renda, objetivos, perfil de risco)
- [ ] CA9 — Personalidade padrão: "Amigo Próximo" (tom informal, direto, tudo em português)
- [ ] CA10 — Conversas salvas no banco: tabela `conversations` + `messages`
- [ ] CA11 — RLS em todas as tabelas do agente por `family_id`

## Tabelas de Banco

```sql
-- Memória de longo prazo
CREATE TABLE agent_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_members(id),
  type TEXT NOT NULL CHECK (type IN ('fact', 'preference', 'goal', 'event')),
  content TEXT NOT NULL,
  confidence_score NUMERIC(3,2) DEFAULT 0.8,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Conversas e mensagens
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  member_id UUID REFERENCES family_members(id),
  surface TEXT NOT NULL CHECK (surface IN ('web', 'whatsapp')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'tool')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Implementação

> ⚠️ Preenchido pelo `@dev` após concluir.

**Status:**
**Branch/PR:**
**Arquivos alterados:**
-

---

## QA

> ⚠️ Preenchido pelo `@qa`.

**Gate:**
**Checklist:**
- [ ] Critérios de aceite validados
- [ ] JWT + Zod validados na Edge Function
- [ ] RLS em `agent_memories`, `conversations`, `messages`
- [ ] Onboarding testado do zero (família nova)
- [ ] Agente responde em português

**Notas QA:**

---

## Notas e Decisões

- OpenRouter key da família vem do banco (criptografada) — nunca hardcoded
- Na Fase 1, usar busca keyword para memórias; embeddings na Fase 2
- Onboarding: se usuário pular perguntas, agente não insiste
