---
id: STORY-013
titulo: "Polimento Conversacional + Identidade Jimmy"
fase: 3
modulo: "agencia"
status: concluido
prioridade: alta
origem: claude
agente_responsavel: "@dev"
criado: 2026-05-01
atualizado: 2026-05-01
---

# STORY-013 — Polimento Conversacional + Identidade Jimmy

## Contexto

Após STORY-010/011/012, o chat `/agencia/assistente` está funcional, mas a experiência é a de um formulário conversacional rígido. Foram identificados 8 pontos de robotização — esta story ataca os 6 que não exigem mudança em backend/streaming nem refactor da máquina de estados:

1. Mensagens 100% templated (6 strings fixas em `useContentCreationAgent.ts`)
2. Avatar/nome genérico (`<Bot>` cinza padrão)
3. System prompt sem `<personality>` block
4. Sem typing indicator (apenas skeleton estático)
5. Placeholder do input com 2 variantes genéricas
6. Welcome sem contexto temporal

Streaming token-by-token (STORY-014) e fluxo não-linear/memória de preferências (STORY-015) ficam para próximas stories.

## Critérios de Aceite

- [x] CA1 — System prompt em `content-creation-agent/index.ts` ganhou bloco `<personality>` explícito (voz amigável, frases curtas, varia formulações, exemplos BOM/RUIM)
- [x] CA2 — As 6 mensagens fixas em `useContentCreationAgent.ts` foram substituídas por funções que retornam uma de 4-5 variantes; welcome muda por horário ("Boa madrugada/Bom dia/Boa tarde/Boa noite")
- [x] CA3 — Componente `JimmyAvatar` (círculo com letra "J" em gradiente `from-primary to-primary/60`) substitui `<Bot>` em mensagens da assistente do chat
- [x] CA4 — `TypingIndicator` (3 dots animados com `animate-bounce` e delays escalonados) substitui `AssistantMessageSkeleton` enquanto `agent.isLoading && !isGenerating`
- [x] CA5 — Placeholder do input usa `getInputPlaceholder(state)` que reflete `step`, `brandName`, `selectedFormat.label` com fallbacks graduais
- [x] CA6 — `ChatMessage.tsx` aceita prop opcional `agent?: 'jimmy' | 'help'` (default `'help'`). Zero breaking change para HelpAgent/InsightsAgent (default mantém ícone `<Bot>`)
- [x] CA7 — TypeScript sem erros (`npx tsc --noEmit` limpo), build OK (`npm run build` em 1m 11s)
- [x] CA8 — E2E `assistente-golden-path.spec.ts` ajustado: `text=Jimmy Social Media` → `text=/jimmy/i` (todas as variantes do welcome incluem "Jimmy")

## Restrições

- Sem mudança em Edge Function além do system prompt (CA1). Streaming fica para STORY-014.
- Zero modificações em HelpAgent, InsightsAgentChat, JimmyAgent geral.
- `JimmyAvatar` opt-in via prop no `ChatMessage` (não substitui o avatar default em todo lugar).

---

## Implementação

**Status:** `concluido`

**Branch/PR:** `claude/check-last-story-Af2cc`

**Arquivos criados:**
- `src/features/content-creator-chat/components/JimmyAvatar.tsx` — círculo 32×32 com gradiente `from-primary to-primary/60` e letra "J" branca semibold
- `src/features/content-creator-chat/components/TypingIndicator.tsx` — avatar Jimmy + 3 dots `animate-bounce` com delays `-0.3s`, `-0.15s`, `0s`
- `src/features/content-creator-chat/utils/messageVariants.ts` — 6 funções (`welcomeMessage`, `brandSelectedMessage`, `formatSelectedMessage`, `researchConfirmMessage`, `adjustIdeaMessage`, `adjustParamsMessage`), helper `pickRandom`, e `greetingForHour` para saudação contextual
- `src/features/content-creator-chat/utils/inputPlaceholders.ts` — `getInputPlaceholder(state)` com fallbacks graduais por step

**Arquivos modificados:**
- `supabase/functions/content-creation-agent/index.ts` — bloco `<personality>` adicionado no system prompt (antes de "REGRA ABSOLUTA"). Ainda **precisa deploy** via `supabase functions deploy content-creation-agent`
- `src/features/content-creator-chat/hooks/useContentCreationAgent.ts` — imports das funções de variantes; 6 strings substituídas (welcome, brand, format, research confirm × 2, adjust × 2)
- `src/features/content-creator-chat/components/ContentCreationChat.tsx` — `TypingIndicator` substitui `AssistantMessageSkeleton`; `getInputPlaceholder` no `<Textarea>`; prop `agent="jimmy"` em todos os `<ChatMessage>`. `Skeleton` ainda usado para o painel de geração de copy (não removido).
- `src/components/help-agent/ChatMessage.tsx` — prop opcional `agent?: 'jimmy' | 'help'` (default `'help'` mantém comportamento); quando `'jimmy'` e role assistant, renderiza `<JimmyAvatar>` em vez do `<Bot>`
- `tests/assistente-golden-path.spec.ts` — `text=Jimmy Social Media` → `text=/jimmy/i` no STEP 1 para tolerar variações do welcome

**Notas de implementação:**
- `pickRandom` é um util local (4 linhas) em `messageVariants.ts` — não vale criar lib genérica.
- Variantes têm 4-5 opções cada e usam coloquialismos brasileiros ("show", "fechado", "bora", "tô"). Saudação por horário cobre madrugada/manhã/tarde/noite.
- `getInputPlaceholder` tem fallbacks: brand+format → genérico+brand → genérico+format → genérico.
- `JimmyAvatar` é opt-in via prop (`agent="jimmy"`). HelpAgent e InsightsAgent não foram tocados — mantêm `<Bot>` cinza.

---

## QA

**Gate:** PASS (frontend) / PENDING (Edge Function deploy)

**Checklist:**
- [x] CA1-CA8 validados
- [x] Build sem erros (`npm run build` em 1m 11s), TypeScript strict (`npx tsc --noEmit` limpo)
- [ ] `supabase functions deploy content-creation-agent` — **pendente** (precisa rodar no ambiente com Supabase CLI linkado)
- [ ] E2E golden path verde — pendente execução
- [ ] Smoke manual em produção: avatar J em gradiente, typing 3 dots, placeholder contextual, welcome variando por horário

**Notas:**
- Frontend pronto para deploy via Netlify (push em `main`).
- Edge Function precisa de `supabase functions deploy content-creation-agent` separado — o `<personality>` block só passa a vigorar após o deploy.
- Sem migration, sem secrets novos.

---

## Notas e Decisões

- Decisão estrutural: reformulação profunda do chat (pedido pelo usuário) foi quebrada em 3 stories sequenciais (013 → 014 → 015) por restrições do projeto ("sem staging, mudanças pequenas e isoladas com rollback claro" — CLAUDE.md).
- STORY-014 (streaming SSE) e STORY-015 (fluxo não-linear + memória de preferências) ficam como roadmap.
