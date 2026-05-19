---
id: STORY-002
titulo: "Especialistas Redesign — entidade independente por tenant + vínculos com when_to_call"
fase: 1
modulo: "specialists"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-11
atualizado: 2026-05-12
---

# STORY-002 — Especialistas Redesign

## Contexto

Especialistas eram entidades subordinadas ao agente (`agent_specialists`). A nova arquitetura os torna entidades independentes no escopo do tenant, reutilizáveis por múltiplos agentes. O vínculo agente↔especialista passa por uma tabela junction com campo `when_to_call` (texto livre) que o agente usa como instrução de quando chamar o especialista.

## Spec de Referência

- Plano executado: `/sessions/260511-bright-laurel/plans/specialists-redesign.md`
- Conversa de definição: Lucas confirmou que agente perde aba de APIs; especialistas ganham APIs próprias; `when_to_call` é texto livre.

## Critérios de Aceite

- [x] CA1 — Especialistas são entidades tenant-scoped independentes (sem `agent_id`)
- [x] CA2 — Agente tem aba "Especialistas" para selecionar especialistas e definir `when_to_call`
- [x] CA3 — Especialista tem 7 abas: Visão Geral, Conhecimento, Regras, Correções, Especialistas, APIs, Playground
- [x] CA4 — APIs Externas movidas do agente para dentro do especialista
- [x] CA5 — `agent-runner` carrega especialistas via `agent_specialist_links` com `when_to_call` no system prompt
- [x] CA6 — `specialist-runner` carrega conhecimento/regras/correções/apis próprios do especialista
- [x] CA7 — Especialistas compartilháveis entre múltiplos agentes

---

## Implementação

**Status:** `concluido`

**Branch/PR:** `main` — commit `13d1e27`

**Arquivos alterados:**

*Banco:*
- `supabase/migrations/20260512000010_specialists_redesign.sql` — 6 novas tabelas

*Frontend — novos:*
- `src/features/specialists/types/index.ts` (reescrito)
- `src/features/specialists/api/useSpecialists.ts` (reescrito — sem agentId)
- `src/features/specialists/api/useSpecialistLinks.ts`
- `src/features/specialists/api/useSpecialistKnowledge.ts`
- `src/features/specialists/api/useSpecialistRules.ts`
- `src/features/specialists/api/useSpecialistCorrections.ts`
- `src/features/specialists/api/useSpecialistApis.ts`
- `src/features/specialists/components/SpecialistListPage.tsx`
- `src/features/specialists/components/SpecialistDetail.tsx`
- `src/features/specialists/components/AgentSpecialistLinker.tsx`
- `src/features/specialists/components/SpecialistApiList.tsx`
- `src/routes/_app/specialists/index.tsx`
- `src/routes/_app/specialists/$specialistId.tsx`

*Frontend — modificados:*
- `src/features/specialists/components/SpecialistList.tsx` (shim re-export)
- `src/routes/_app/agents/$agentId/specialists.tsx` (redirect)
- `src/routes/_app/agents/$agentId.tsx` (remove APIs tab, usa AgentSpecialistLinker)
- `src/components/layout/Sidebar.tsx` (add Especialistas nav item)
- `src/integrations/supabase/types.ts` (6 novas tabelas)

*Edge Functions:*
- `supabase/functions/specialist-runner/index.ts` (reescrito)
- `supabase/functions/agent-runner/index.ts` (atualizado — carrega via links)
- `supabase/functions/_shared/prompt-builder.ts` (AgentSpecialist + when_to_call)

**Notas de implementação:**
- Tabelas novas ainda não em `types.ts` gerado → cast `as never` em queries
- `specialist-runner` busca API key da tabela `api_keys` por `tenant_id` (não mais agente)
- Especialistas podem chamar outros especialistas recursivamente (mesma mecânica de links)

---

## QA

**Gate:** `PASS`

**Checklist:**
- [x] Critérios de aceite validados
- [x] Build sem erros, TypeScript strict (0 erros)
- [x] RLS FORCE em todas as 6 novas tabelas
- [x] Migration aplicada via `supabase db push`
- [x] `supabase functions deploy specialist-runner` executado
- [x] `supabase functions deploy agent-runner` executado

**Notas:** Nenhum erro. specialist-runner e agent-runner deployed com sucesso.
