---
id: STORY-046
titulo: "JimmyChat: lista de conversas (multi-conv per brand) com switcher e nova conversa"
fase: 3
modulo: jimmy-jimmychat
status: em-revisao
prioridade: alta
origem: claude
agente_responsavel: ""
criado: 2026-05-06
atualizado: 2026-05-06
---

# STORY-046 — JimmyChat: lista de conversas multi-conv per brand

## Contexto

Hoje o JimmyChat só mostra **1 conversa ativa por brand** — a chave `localStorage.jimmychat:conv:{brandId}` aponta pra um único `conversation_id`. No DB, `agent_conversations` já tem múltiplas conversas (cada `sendMessage` quando não há `conversation_id` cria nova), mas o frontend só vê a "última usada".

Resultado prático: usuário não consegue:
- Voltar a uma conversa antiga ("aquele papo sobre campanha X de duas semanas atrás")
- Manter threads paralelas (estratégia Q3 vs análise diária)
- Começar conversa nova sem perder a atual

Esta story expõe a lista, permite trocar entre conversas e iniciar nova — fechando o loop de "workbench AI".

Sem nova tabela. RLS já está em `agent_conversations` e `agent_messages` (STORY-021/024). Frontend lê via Supabase client direto.

## Spec de Referência

- STORY-021 — `agent_conversations` schema (já tem brand_id, last_message_at, status)
- STORY-044 — `hydrateConversation` reusável pra carregar histórico ao trocar
- STORY-029 — `JimmyChatPage` header com brand+skill selectors (onde adicionamos o switcher)
- `src/features/jimmychat/hooks/useJimmyOrchestrator.ts` — hook que precisa expor `switchConversation`

## Critérios de Aceite

### Hook de listagem

- [ ] CA1 — Novo hook `useJimmyConversations(brandId, activeConversationId)` em `src/features/jimmychat/hooks/useJimmyConversations.ts`. Faz query em `agent_conversations` filtrando por `brand_id` (RLS garante user scope), ordenado por `last_message_at desc`, limit 30.
- [ ] CA2 — Hook retorna `{ conversations: Conversation[], isLoading: boolean, refresh: () => void }`. `Conversation` tem `id, title, lastMessageAt, preview?, isActive`.
- [ ] CA3 — Auto-título: primeiras 60 chars da primeira message do usuário daquela conv (subselect/JOIN em `agent_messages`). Fallback "Conversa em {data formatada PT-BR}" se sem msg user.
- [ ] CA4 — `preview`: primeiras 80 chars da mensagem mais recente do assistant (opcional — mostra na lista pra dar contexto). Sem fetch separado massivo — em batch via JOIN.
- [ ] CA5 — `refresh()` re-busca; é chamado depois de `sendMessage` bem-sucedido pra atualizar `last_message_at` e `preview`.
- [ ] CA6 — `isActive` baseado no parâmetro `activeConversationId` recebido.

### switchConversation no orchestrator hook

- [ ] CA7 — `useJimmyOrchestrator` ganha método `switchConversation(id: string)`. Atualiza state interno + localStorage + dispara re-hidratação via `hydrateConversation`.
- [ ] CA8 — `resetConversation` (existente) continua = "começar conversa nova" (limpa convId, próxima sendMessage cria nova).
- [ ] CA9 — Se `switchConversation` chamado com `id === conversationId` atual, é no-op.

### ConversationSwitcher UI

- [ ] CA10 — Componente `ConversationSwitcher` em `src/features/jimmychat/components/ConversationSwitcher.tsx` usando Popover/DropdownMenu shadcn.
- [ ] CA11 — Trigger no header mostra ícone (ex: `MessageSquare`) + título da conv ativa truncado (ou "Nova conversa" se nenhuma) + chevron.
- [ ] CA12 — Conteúdo: header "Conversas recentes", lista scrollável, item ativo destacado (bg muted + text bold), click switcha. Footer: botão "+ Nova conversa".
- [ ] CA13 — Cada item mostra: título (truncado), `lastMessageAt` formatado relativo ("há 2h", "ontem", "10/05"), `preview` em segunda linha dim.
- [ ] CA14 — Estado vazio (nenhuma conv ainda): mostra só "+ Nova conversa" + texto explicativo.
- [ ] CA15 — Loading state: 3 skeleton items.

### Integração no JimmyChatPage

- [ ] CA16 — `ConversationSwitcher` adicionado entre o brand selector e o `SkillSelector` no header da página.
- [ ] CA17 — Mobile (sm:hidden): switcher continua visível mas trunca mais agressivamente (max-w-[120px]).
- [ ] CA18 — Após `sendMessage` ou `confirmAction` bem-sucedido, hook chama `refresh` da lista pra atualizar preview/order.
- [ ] CA19 — Click em "Nova conversa" chama `agent.resetConversation()` + fecha popover.

### Validações

- [ ] CA20 — `npx tsc --noEmit` exit 0
- [ ] CA21 — `npm run build` exit 0
- [ ] CA22 — Smoke: criar 3 convs, trocar entre elas, ver histórico hidrata corretamente
- [ ] CA23 — Smoke: "+ Nova conversa" → próxima mensagem cria nova conv no DB
- [ ] CA24 — RLS sanity: outro user não enxerga convs alheias (RLS atual já cobre)

## Arquitetura

### Arquivos novos

- `src/features/jimmychat/hooks/useJimmyConversations.ts` (~110 linhas) — fetch via Supabase com JOIN-like (subselects), title generator, refresh
- `src/features/jimmychat/components/ConversationSwitcher.tsx` (~140 linhas) — Popover com lista

### Arquivos modificados

- `src/features/jimmychat/hooks/useJimmyOrchestrator.ts` — `switchConversation` exposto
- `src/pages/JimmyChatPage.tsx` — header ganha `<ConversationSwitcher>`, prop `onSwitch`/`onNew` chamando hook do orchestrator
- `src/features/jimmychat/index.ts` — re-export do switcher se for público

### Decisões

- **Sem nova edge function**: RLS protege; query é simples. Subselect pra título dentro do mesmo round-trip.
- **Limit 30**: equilíbrio entre carregar suficiente histórico e não pesar a query. Pagination/infinite scroll fora do escopo (futuro).
- **Auto-título**: usuário não nomeia. Se virar dor, mini-story adiciona rename inline.
- **Preview opcional**: pode ser caro. Implementação inicial pode pular se complicar a query (CA4 marca como "opcional").
- **Não persistir conv ativa por sessão server-side**: localStorage basta. Se trocar de máquina, vê a primeira da lista.

## Out of scope

- Renomear conversa manualmente
- Arquivar conversa (status='archived' já no schema, não exposto)
- Search/filter na lista
- Pagination/infinite scroll (limit 30 é suficiente)
- Compartilhar conversa
- Multi-select / delete bulk
- Migrar conversas entre brands

## Riscos

| Risco | Mitigação |
|---|---|
| Query com subselect pesa | Limit 30 + index em `(brand_id, last_message_at desc)` já existe (STORY-018) |
| Trocar conv mid-streaming corrompe state | switchConversation cancela stream em vôo via cancelStream |
| Auto-título gera bobagem ("Oi", "OK") | Fallback pra data se primeira msg < 5 chars |
| RLS quebra com brand_id de outra org | Já testado nas STORYs anteriores; query usa `.eq("brand_id", ...)` que RLS valida cruzando com user.org_id |
| Race entre refresh e novo sendMessage | refresh é debounced/idempotente; última escrita ganha — ok |

## Verificação (smoke)

1. Iniciar nova conv ("Quanto custou Meta semana passada?") → enviar msg → ver na lista com título auto-gerado
2. Clicar em "+ Nova conversa" → input vazio → digitar nova pergunta → vê 2 convs na lista, ativa muda
3. Voltar pra primeira conv → histórico hidrata, pode continuar conversa
4. F5 → ainda na ativa, lista carrega
5. Trocar de brand → lista mostra convs da nova brand (sem misturar)
6. Mobile: header tudo cabe sem quebrar layout

---

## Implementação

**Status:** `em-revisao` (deployed em 2026-05-06)

**Arquivos novos:**
- `src/features/jimmychat/hooks/useJimmyConversations.ts` (~135 linhas) — fetch via Supabase com 3 queries em Promise.all (convs do brand, primeira msg user, última msg assistant), Map lookups pra deriving title + preview
- `src/features/jimmychat/components/ConversationSwitcher.tsx` (~115 linhas) — Popover shadcn; trigger compacto com título da conv ativa truncado; lista scrollável com active highlight; footer com botão "Nova conversa"; formatRelative em PT-BR

**Arquivos modificados:**
- `src/features/jimmychat/hooks/useJimmyOrchestrator.ts` — `switchConversation(id)` exposto: aborta stream em vôo, atualiza localStorage + state, dispara `hydrateConversation` (reusa STORY-044). `resetConversation` continua = "nova conversa".
- `src/pages/JimmyChatPage.tsx` — usa `useJimmyConversations(brandId, conversationId)`; refresh automático ao terminar mensagem (effect em `lastMessage.id` + `!isLoading && !isStreaming`); switcher inserido entre brand selector e SkillSelector

**Validações:**
- ✅ `npx tsc --noEmit` exit 0
- ✅ `npm run build` exit 0 em 29.29s
- ✅ Sem nova edge function nem migration; só leitura via Supabase client (RLS protege)

**Critérios de aceite:**
- [x] CA1 — `useJimmyConversations(brandId, activeConversationId)` em `hooks/useJimmyConversations.ts`; query em `agent_conversations` ordenada por `last_message_at desc`, limit 30
- [x] CA2 — Retorna `{ conversations, isLoading, refresh }` com `JimmyConversation { id, title, lastMessageAt, preview?, isActive }`
- [x] CA3 — Auto-título: primeiras 60 chars da primeira msg user; fallback "Conversa em {data PT-BR}" se vazio/curto
- [x] CA4 — Preview: primeiras 80 chars da última msg assistant `message_type='text'`. Promise.all evita N+1 round-trips
- [x] CA5 — `refresh()` re-busca via `setRefreshTick`; chamado no JimmyChatPage quando `lastMessage.id` muda + não está mais loading/streaming
- [x] CA6 — `isActive` baseado em comparação com `activeConversationId` recebido
- [x] CA7 — `switchConversation(id)` exposto; aborta stream, limpa state, atualiza localStorage, hidrata via DB
- [x] CA8 — `resetConversation` mantido (limpa convId, próxima sendMessage cria nova)
- [x] CA9 — `switchConversation(id === current)` é no-op
- [x] CA10 — `ConversationSwitcher` em `components/ConversationSwitcher.tsx` usando Popover shadcn
- [x] CA11 — Trigger: ícone `MessageSquare` + título truncado + chevron
- [x] CA12 — Conteúdo: header "Conversas recentes", lista scrollável com active highlight, footer com "+ Nova conversa"
- [x] CA13 — Cada item: título truncado + `lastMessageAt` formatado relativo ("há 2h", "ontem", etc) + preview dim em segunda linha
- [x] CA14 — Estado vazio: "Nenhuma conversa ainda. Comece a conversar pra criar a primeira."
- [x] CA15 — Loading: 3 Skeleton items
- [x] CA16 — Switcher integrado entre brand selector e SkillSelector
- [x] CA17 — Trigger com `max-w-[160px] sm:max-w-[220px]` pra mobile-first
- [x] CA18 — `conversations.refresh()` após sendMessage/confirmAction completarem
- [x] CA19 — "+ Nova conversa" chama `agent.resetConversation()` + fecha popover
- [x] CA20 — `npx tsc --noEmit` exit 0
- [x] CA21 — `npm run build` exit 0
- [ ] CA22 — Smoke 3 convs + switch (validar em prod)
- [ ] CA23 — Smoke "+ Nova conversa" → próxima msg cria nova (validar em prod)
- [ ] CA24 — RLS sanity (já testado em STORYs anteriores; query usa `.eq('brand_id')` que RLS valida)

**Notas de implementação:**

- **3 queries em paralelo via Promise.all** evita N+1 (uma query por conv pra title/preview). Resultado em Maps com lookup O(1).
- **Filtra `status != 'closed'`**: STORY-021 schema tem status `open|closed|flagged`. Closed não aparece (decisão futura: expor "arquivadas" como toggle).
- **`first message user` ordered ASC + `last message assistant` ordered DESC**: garante consistência sem subselect SQL complexo. Trade-off: carrega mais linhas. Com limit 30 convs e ~5-50 msgs cada é aceitável (<2k linhas).
- **Refresh em `effect [lastMessage.id, isLoading, isStreaming]`**: dispara só quando uma mensagem completou, não a cada delta de streaming. Eslint-disable necessário pra não incluir o objeto `conversations` no deps array (referência muda toda render).
- **Trigger Button compacto** (h-7, text-xs): consistente com SkillSelector pills.
- **Sem nova edge function**: leitura via Supabase client direto. RLS de `agent_conversations` (STORY-021) já filtra por `user_id = auth.uid()`.

---

## QA

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] CA1-CA24 validados
- [ ] Build sem erros
- [ ] Smoke completo
- [ ] RLS sanity em outro user
- [ ] Não regrediu STORY-042/043/044/045

---

## Notas e Decisões

- **Foco no fluxo "voltar pra conversa antiga"**: principal dor identificada
- **Switcher no header**, não sidebar: economiza espaço; conteúdo do chat continua maximizado
- **Auto-título por primeira msg do user**: padrão Slack/ChatGPT. Suficiente sem rename manual
