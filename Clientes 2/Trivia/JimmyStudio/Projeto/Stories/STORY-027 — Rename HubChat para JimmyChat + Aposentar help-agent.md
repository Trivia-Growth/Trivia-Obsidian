---
id: STORY-027
titulo: "Rename HubChat → JimmyChat + Aposentar help-agent (chat antigo)"
fase: 3
modulo: jimmy-jimmychat
status: concluido
prioridade: alta
origem: claude
agente_responsavel: ""
criado: 2026-05-02
atualizado: 2026-05-06
---

# STORY-027 — Rename HubChat → JimmyChat + Aposentar help-agent (chat antigo)

## Contexto

Após o rollout da Fase 1 do HubChat, o app tinha **dois FABs flutuantes** no canto direito (HubChat roxo + help-agent azul) e marca dupla confusa: orquestrador novo se chamava "HubChat" mas o produto se chama "Jimmy". Esta story:

1. Renomeou "HubChat" → "JimmyChat" em todo o stack (marca única alinhada com o produto)
2. Aposentou o chat antigo (help-agent): widget global deletado, edge function deletada
3. Manteve `InsightsAgentChat` (chat embarcado em dashboards) funcional via renomeação da edge function `help-agent-chat` → `dashboard-insights-chat`

JimmyChat é agora o **único chat global** do app.

## Critérios de Aceite

### Rename completo (HubChat → JimmyChat)

- [x] CA1 — Pasta `src/features/hubchat/` renomeada para `src/features/jimmychat/` via `git mv` (preserva histórico)
- [x] CA2 — Arquivos: `JimmyHubChat.tsx` → `JimmyChat.tsx`, `HubChatFAB.tsx` → `JimmyChatFAB.tsx`
- [x] CA3 — Componentes/tipos: `JimmyHubChat` → `JimmyChat`, `HubChatFAB` → `JimmyChatFAB`, `HubChatFABProps` → `JimmyChatFABProps`, `HubChatMessage` → `JimmyChatMessage`
- [x] CA4 — Strings visíveis ao usuário: tooltip ("JimmyChat"), header ("JimmyChat"), label sidebar ("JimmyChat")
- [x] CA5 — `LOCALSTORAGE_PREFIX = "jimmychat:conv:"` (era `hubchat:conv:` — hard cut, perda mínima)
- [x] CA6 — Custom event `jimmychat:open` (era `hubchat:open`) — dispatcher Layout.tsx + listener JimmyChat.tsx
- [x] CA7 — Env vars: `VITE_JIMMYCHAT_ENABLED` (frontend) e `JIMMYCHAT_ENABLED` (Supabase secret)
- [x] CA8 — `grep -ri "hubchat" src/ supabase/functions/jimmy-orchestrator supabase/functions/dashboard-insights-chat` retorna **zero hits** em código tracked (exceto stories antigas)

### Aposentar help-agent

- [x] CA9 — Renomeada edge function `help-agent-chat` → `dashboard-insights-chat` via `git mv` (código interno preservado, propósito mais focado)
- [x] CA10 — Movido `ChatMessage.tsx` para `src/components/chat/` (compartilhado entre `InsightsAgentChat` e `ContentCreationChat`)
- [x] CA11 — `InsightsAgentChat.tsx` atualizado: import de ChatMessage + URL endpoint `/functions/v1/dashboard-insights-chat`
- [x] CA12 — `ContentCreationChat.tsx` atualizado: import de ChatMessage
- [x] CA13 — Deletados: `HelpAgentWidget.tsx`, `ChatDrawer.tsx`, `FloatingChatButton.tsx`, `ConversationHistory.tsx`, `useHelpAgent.ts` (5 arquivos, ~500 linhas)
- [x] CA14 — `Layout.tsx`: import `HelpAgentWidget` + JSX `<HelpAgentWidget />` removidos
- [x] CA15 — `supabase functions delete help-agent-chat` (deletado da plataforma)

### Validação técnica

- [x] CA16 — `npx tsc --noEmit` exit 0
- [x] CA17 — `npm run build` exit 0 em 29.75s
- [x] CA18 — `JimmyChatFAB` reposicionado para `bottom-6 right-6` (posição que era do help-agent FAB, agora único FAB visível em desktop)
- [⏸] CA19 — Smoke manual em produção (validar com você após deploy completar)

## Implementação

**Status:** `em-revisao` (deployed em 2026-05-02)

**Branch/PR:** sem branch (push direto em main)

**Commit:** `cdd4921c — refactor(chat): rename HubChat → JimmyChat + aposenta help-agent (STORY-027)`

**Arquivos criados:**
- `src/components/chat/ChatMessage.tsx` (movido de `help-agent/`)

**Arquivos modificados:**
- `src/components/Layout.tsx` (remove HelpAgentWidget, atualiza imports/event/label/flag)
- `src/components/unified-dashboard/InsightsAgentChat.tsx` (2 mudanças: import ChatMessage + URL endpoint)
- `src/features/content-creator-chat/components/ContentCreationChat.tsx` (1 mudança: import ChatMessage)
- `src/features/jimmychat/components/JimmyChat.tsx` (renomeado de JimmyHubChat — refs ao componente, event, header, FAB)
- `src/features/jimmychat/components/JimmyChatFAB.tsx` (renomeado de HubChatFAB — interface, label, posição bottom-6)
- `src/features/jimmychat/hooks/useJimmyOrchestrator.ts` (LOCALSTORAGE_PREFIX, tipos, mensagens de erro)
- `src/features/jimmychat/types/index.ts` (HubChatMessage → JimmyChatMessage)
- `src/features/jimmychat/index.ts` (re-exports)
- `supabase/functions/jimmy-orchestrator/index.ts` (env JIMMYCHAT_ENABLED, mensagem 503)

**Arquivos renomeados (via `git mv`):**
- `src/features/hubchat/` → `src/features/jimmychat/` (pasta inteira)
- `src/components/help-agent/ChatMessage.tsx` → `src/components/chat/ChatMessage.tsx`
- `supabase/functions/help-agent-chat/` → `supabase/functions/dashboard-insights-chat/`

**Arquivos deletados:**
- `src/components/help-agent/HelpAgentWidget.tsx`
- `src/components/help-agent/ChatDrawer.tsx`
- `src/components/help-agent/FloatingChatButton.tsx`
- `src/components/help-agent/ConversationHistory.tsx`
- `src/hooks/useHelpAgent.ts`

**Deploy:**
- ✅ `supabase functions deploy dashboard-insights-chat` (preserva InsightsAgentChat)
- ✅ `supabase functions deploy jimmy-orchestrator` (rebundle com env nova)
- ✅ `supabase functions delete help-agent-chat` (removido da plataforma)
- ✅ `supabase secrets set JIMMYCHAT_ENABLED=true`
- ✅ `netlify env:set VITE_JIMMYCHAT_ENABLED true` (all contexts)
- ✅ `netlify env:unset VITE_JIMMY_HUBCHAT_ENABLED` (cleanup cosmético)
- ✅ `git push origin main` → Netlify auto-deploy

## Notas de implementação

- **Stories antigas (017, 018, 019, 021, 022, 026)** mantidas como histórico imutável — referem "HubChat" mas representam o estado de quando foram escritas
- **JimmyChatFAB** moveu de `bottom-24 right-6` (acima do help-agent) para `bottom-6 right-6` (canto natural) já que help-agent FAB sumiu
- **ChatMessage compartilhado** em `src/components/chat/` — ainda usado por `InsightsAgentChat` e `ContentCreationChat`
- **`dashboard-insights-chat` edge function** preserva 100% do código interno do `help-agent-chat` — só mudou nome de pasta e propósito documentado
- **Conv IDs em localStorage** com prefix antigo (`hubchat:conv:`) viraram lixo — sem impacto (backend cria novo se não recebido)
