---
id: STORY-006
titulo: "Human Takeover — analista assume conversa e suspende agente IA"
fase: 1
modulo: "conversations, pipeline"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-12
atualizado: 2026-05-12
---

# STORY-006 — Human Takeover

## Contexto

Com múltiplos analistas usando a plataforma, precisava de um mecanismo para que um analista "pegue" uma conversa exclusivamente para si, suspendendo o agente IA. Sem isso, o agente continuaria respondendo enquanto o analista tenta atender, gerando mensagens duplicadas e confusão para o cliente.

## Spec de Referência

- Plano executado: `/sessions/260511-bright-laurel/plans/v2-finalizacao.md` (Entrega 7)
- Campo `assumed_by UUID` já existia na tabela `conversations` com FK para `users`

## Critérios de Aceite

- [x] CA1 — Analista pode assumir qualquer conversa ativa ou em handoff
- [x] CA2 — Ao assumir: `assumed_by = userId`, `status = handoff`, agente IA bloqueado
- [x] CA3 — `agent-runner` Edge Function ignora mensagens de conversas com `assumed_by` preenchido
- [x] CA4 — Conversa assumida por mim: badge verde "Você está atendendo" + botões "Devolver ao Agente" e "Encerrar"
- [x] CA5 — Conversa assumida por outro analista: badge readonly com nome do analista (sem ação)
- [x] CA6 — Admin pode assumir mesmo que outro analista já esteja atendendo
- [x] CA7 — "Devolver ao Agente" limpa `assumed_by`, seta `status = ativo` — IA retoma
- [x] CA8 — "Encerrar" seta `status = encerrado`, limpa `assumed_by`

---

## Implementação

**Status:** `concluido`

**Branch/PR:** `main` — commit `351f977`

**Arquivos alterados:**

*Frontend:*
- `src/features/conversations/api/useMutateConversation.ts` — adicionados `useTakeoverConversation()`, `useReleaseConversation()`; `useCloseConversation()` atualizado para limpar `assumed_by`; `useReturnToAgent()` atualizado para limpar `assumed_by`
- `src/features/conversations/components/TakeoverBar.tsx` — novo componente barra de takeover
- `src/routes/_app/conversations/$conversationId.tsx` — integração do TakeoverBar

*Edge Function:*
- `supabase/functions/agent-runner/index.ts` — check `conversation.assumed_by` logo após verificar status; retorna `{ skipped: true, reason: 'assumed_by_human' }` se preenchido

**Notas de implementação:**
- `TakeoverBar` renderiza 3 estados: livre / assumida por mim / assumida por outro
- Admin detectado via `currentUser.role === 'admin' || 'superadmin'`
- A barra fica visível em TODAS as conversas não-encerradas (não só em handoff)
- `useAssumeConversation` (antigo — trigger de handoff pelo agente) mantido separado do `useTakeoverConversation` (trigger manual pelo analista) para clareza semântica

---

## QA

**Gate:** `PASS`

**Checklist:**
- [x] Critérios de aceite validados
- [x] Build sem erros, TypeScript strict
- [x] Loading states nos botões (Loader2 animate-spin)
- [x] Toast de confirmação em todas as ações
- [x] agent-runner deployed com a nova verificação
- [x] Sem migração necessária — `assumed_by` já existia no banco

**Notas:** `supabase functions deploy agent-runner` executado com sucesso. Nenhuma migration necessária.
