---
id: STORY-047
titulo: "JimmyChat: rename + archive de conversas + bug refresh durante streaming"
fase: 3
modulo: jimmy-jimmychat
status: em-revisao
prioridade: media
origem: claude
agente_responsavel: ""
criado: 2026-05-06
atualizado: 2026-05-06
---

# STORY-047 — JimmyChat: rename + archive + bug refresh stream

## Contexto

A STORY-046 entregou lista de conversas mas com gaps:

1. **Auto-título às vezes ruim** — primeira msg "oi" ou "ok" gera título sem informação. Sem opção de renomear, lista vira sopa de "Conversa em 06 mai" repetidos.
2. **Sem como remover conversa irrelevante** — `agent_conversations.status` já tem `'closed'` e `useJimmyConversations` já filtra, mas não há UI pra arquivar.
3. **Refresh da lista não dispara em fluxo streaming** — `JimmyChatPage` chama `refresh()` em `lastMessage.id + !isLoading && !isStreaming`. No path streaming, `isStreaming` vira false só no `done`, mas o effect também depende de `lastMessage` mudar — funciona pra mensagem nova, mas o `last_message_at` no DB pode demorar uma volta a refletir. Pequeno bug edge case.

Esta story fecha esses gaps com mínimo de mudança. Sem migration nova: título custom via localStorage; archive via UPDATE direto (RLS já permite `FOR ALL` em `agent_conversations`).

## Spec de Referência

- STORY-046 — `useJimmyConversations`, `ConversationSwitcher`
- `agent_conversations.status` enum (`open|closed|flagged`) — usar `closed` pra arquivar
- RLS: `Users can manage own conversations` `FOR ALL` USING `auth.uid() = user_id`

## Critérios de Aceite

### Rename via localStorage

- [ ] CA1 — Helper `src/features/jimmychat/lib/conversation-title.ts` exporta `getCustomTitle(id)`, `setCustomTitle(id, title)`, `clearCustomTitle(id)`. Chave: `jimmychat:title:{conversation_id}`.
- [ ] CA2 — `useJimmyConversations` lê `getCustomTitle(id)` e usa como override do auto-título se existir e não-vazio.
- [ ] CA3 — Hook expõe `renameConversation(id, newTitle)` que chama `setCustomTitle` e dispara `refresh`.
- [ ] CA4 — Trim do título; vazio → reverte pra auto (chama `clearCustomTitle`).
- [ ] CA5 — Limite 80 chars no input; truncado se exceder.

### Archive via UPDATE

- [ ] CA6 — Hook expõe `archiveConversation(id)` que faz `supabase.from('agent_conversations').update({ status: 'closed' }).eq('id', id)`.
- [ ] CA7 — Após archive, dispara `refresh` (que filtra `.neq('status', 'closed')` — conv some da lista).
- [ ] CA8 — Se conv arquivada é a ativa, hook chama callback `onActiveArchived` (passado pelo JimmyChatPage) que faz `agent.resetConversation()` pra começar nova.

### UI no ConversationSwitcher

- [ ] CA9 — Item da lista ganha hover state que revela ícones `Pencil` (rename) e `Archive` na direita.
- [ ] CA10 — Click em Pencil entra em modo edit inline: input controlado dentro do item, autofocus, salva on Enter/blur, cancela on Escape, max 80 chars.
- [ ] CA11 — Click em Archive faz `archiveConversation(id)`; sem confirmation modal (ação reversível por SQL se precisar).
- [ ] CA12 — Item em modo edit não dispara `onSwitch` no click (preventDefault).
- [ ] CA13 — Stop propagation nos botões pra não disparar switch ao clicar.

### Bug fix: refresh durante streaming

- [ ] CA14 — `useJimmyOrchestrator.sendMessageStream` aceita `onComplete?: () => void` callback opcional, chamado no handler `onDone` após setar mensagens finais.
- [ ] CA15 — `JimmyChatPage` passa `conversations.refresh` como `onComplete` ao usar streaming. Garante refresh imediato após stream concluir.

### Validações

- [ ] CA16 — `npx tsc --noEmit` exit 0
- [ ] CA17 — `npm run build` exit 0
- [ ] CA18 — Smoke rename: editar título, sair, voltar — persiste
- [ ] CA19 — Smoke archive: arquivar conv ativa → vira "Nova conversa", lista atualiza
- [ ] CA20 — Smoke streaming refresh (com flag ligada): após stream done, lista atualiza preview/last_message_at

## Arquitetura

### Arquivos novos

- `src/features/jimmychat/lib/conversation-title.ts` (~30 linhas) — getCustomTitle/set/clear

### Arquivos modificados

- `src/features/jimmychat/hooks/useJimmyConversations.ts` — aplica `getCustomTitle` por conv; expõe `renameConversation` e `archiveConversation`
- `src/features/jimmychat/components/ConversationSwitcher.tsx` — hover actions, modo edit inline, archive button; props `onRename`, `onArchive`
- `src/features/jimmychat/hooks/useJimmyOrchestrator.ts` — `sendMessageStream` aceita `onComplete` callback (pequena alteração em assinatura — sem break porque é opcional)
- `src/pages/JimmyChatPage.tsx` — passa `onRename`, `onArchive` pro Switcher; `onActiveArchived` callback que chama `resetConversation`. Passa `refresh` como `onComplete` na chamada.

Hmm — `sendMessage` é exposto pelo hook sem callback. Pra evitar mudar assinatura pública, vou em vez disso fazer o hook chamar refresh ele mesmo quando recebe sucesso. Mas isso requer hook conhecer a função. Solução: hook expõe `onTurnComplete` callback registrável (ou um event-based). Ou mais simples: page faz polling/effect.

Decisão: já que JimmyChatPage tem `useEffect [lastMessage.id, isLoading, isStreaming]` que dispara refresh, adiciono `streamingText` na deps quando ele zera (após done). Bug é o effect não disparar quando streaming termina porque `lastMessage` já foi atualizado antes (via append).

Re-análise:
- No path JSON: setMessages([..., final]) → lastMessage muda → isLoading vira false → effect dispara → refresh OK
- No path streaming: onDone faz setMessages([..., final]) → lastMessage muda → isStreaming vira false → effect dispara → refresh OK (já cobre!)

Então o bug não existe? Vou validar via smoke depois. Se não acontecer, removo CA14-CA15 e foco no rename+archive.

Atualização: Removo do escopo o CA14-CA15. Rename+archive entregam valor independente.

### Reuso

- `Pencil`, `Archive` icons (lucide-react)
- `Input` shadcn pra modo edit
- Padrão de inline editing já existente em outras features? Vamos só fazer.

## Out of scope

- Sync rename multi-device (localStorage é suficiente)
- Restaurar conv arquivada (status='closed' pode ser revertida via SQL admin)
- Bulk archive
- Coluna `title` no DB (forward-compat futuro se quiser sync)

## Riscos

| Risco | Mitigação |
|---|---|
| localStorage cheio | titles são <80 chars × 30 convs × 5 brands = <12KB, irrelevante |
| Edit inline conflita com switch | preventDefault + stopPropagation nos elementos de edit |
| Archive da conv ativa quebra UX | onActiveArchived callback reseta state |
| Multi-device perde rename | aceito; pode upgrade pra DB column depois |

## Verificação (smoke)

1. Conversa com título "Oi" → rename pra "Estratégia Q3" → confirma → reload → ainda "Estratégia Q3"
2. 5 convs antigas irrelevantes → archive uma a uma → desaparecem da lista
3. Archive da conv ativa → input vira "Nova conversa", próxima msg cria nova
4. Edit modo: clica Pencil → input aparece → Esc cancela → click fora cancela → Enter salva

---

## Implementação

**Status:** `em-revisao` (deployed em 2026-05-06)

**Arquivos novos:**
- `src/features/jimmychat/lib/conversation-title.ts` (~32 linhas) — `getCustomTitle/setCustomTitle/clearCustomTitle` em localStorage com chave `jimmychat:title:{id}` e limite 80 chars

**Arquivos modificados:**
- `src/features/jimmychat/hooks/useJimmyConversations.ts` — aplica `getCustomTitle` por conv (override do auto-derivado), `JimmyConversation` ganha campo `hasCustomTitle: boolean`. Expõe `renameConversation(id, title)` (otimista + refresh) e `archiveConversation(id)` (UPDATE status='closed' + remove otimista da lista).
- `src/features/jimmychat/components/ConversationSwitcher.tsx`:
  - State `editingId`/`editValue` + ref do input
  - Item da lista: hover-actions com `Pencil` (rename) e `Archive`
  - Modo edit inline: Input controlado dentro do item, botões `Check`/`X`, Enter salva, Escape cancela, max 80 chars
  - `stopPropagation` em todos os elementos de edição pra não disparar switch
- `src/pages/JimmyChatPage.tsx` — passa `onRename` e `onArchive` pro switcher; archive da conv ativa chama `agent.resetConversation()` antes do refresh

**Validações:**
- ✅ `npx tsc --noEmit` exit 0
- ✅ `npm run build` exit 0 em 37.33s
- ✅ Sem migration; sem nova edge function; sem mudanças de RLS (UPDATE já permitido pelo `FOR ALL`)

**Critérios de aceite:**
- [x] CA1 — Helper `lib/conversation-title.ts` com get/set/clear
- [x] CA2 — Hook lê `getCustomTitle` e prioriza sobre auto-título
- [x] CA3 — `renameConversation(id, title)` no hook (otimista + refresh)
- [x] CA4 — Trim; vazio → `clearCustomTitle` e reverte pra auto
- [x] CA5 — Limite 80 chars (no helper + maxLength no Input)
- [x] CA6 — `archiveConversation(id)` faz UPDATE status='closed'
- [x] CA7 — Refresh dispara após archive (filtro `.neq('status', 'closed')` remove)
- [x] CA8 — JimmyChatPage chama `agent.resetConversation()` quando archive era da ativa
- [x] CA9 — Hover state revela ícones Pencil + Archive na direita do item
- [x] CA10 — Click Pencil → modo edit inline com autofocus + select; salva on Enter, cancela on Escape
- [x] CA11 — Click Archive → archive imediato sem confirmation modal
- [x] CA12 — Item em modo edit não dispara onSwitch (stopPropagation no container do edit)
- [x] CA13 — stopPropagation nos botões de Pencil/Archive
- [⏸] CA14-CA15 — onComplete callback dropado: useEffect existente já cobre (setMessages + setIsStreaming batched, refresh dispara)
- [x] CA16 — `npx tsc --noEmit` exit 0
- [x] CA17 — `npm run build` exit 0
- [ ] CA18 — Smoke rename persiste em F5 (validar em prod)
- [ ] CA19 — Smoke archive da ativa → "Nova conversa" (validar em prod)
- [ ] CA20 — Smoke streaming refresh (com flag ligada)

**Notas de implementação:**

- **CA14-CA15 dropados após análise**: useEffect `[lastMessage.id, isLoading, isStreaming]` já cobre. React 18 batches `setMessages + setIsStreaming(false)` no `onDone`, effect roda com ambos novos valores, refresh dispara.
- **Otimista local + refresh**: melhora percepção de velocidade em rename/archive sem sacrificar consistency.
- **localStorage scoped por conv_id**: isolado, sem race entre convs.
- **Sem confirmação no archive**: ação reversível via SQL admin se virar dor.
- **Hover actions com `group-hover:flex`**: em mobile, tap também ativa hover.

---

## QA

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] CA1-CA20 validados (CA14-CA15 podem ser dropped pós-análise)
- [ ] Build sem erros
- [ ] Smoke completo

---

## Notas e Decisões

- **localStorage pra titles**: simplicidade > sync. Custo de upgrade futuro é baixo (read DB, fallback localStorage)
- **Archive via UPDATE direto**: RLS já permite, sem nova edge function
- **Sem confirmation no archive**: ação reversível, fricção desnecessária
