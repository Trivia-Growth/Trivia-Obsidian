---
id: STORY-044
titulo: "JimmyChat: quick wins (hidratar histórico, markdown, prompt caching, auto-scroll, persist skill)"
fase: 3
modulo: jimmy-jimmychat
status: em-revisao
prioridade: media
origem: claude
agente_responsavel: ""
criado: 2026-05-06
atualizado: 2026-05-06
---

# STORY-044 — JimmyChat: quick wins de UX e custo

## Contexto

Pacote de melhorias pequenas mas com impacto perceptível, agrupadas pra entrega única. Cada item resolve uma fricção observada hoje:

1. **Hidratar histórico no F5** — hoje o hook mantém só `conversation_id` no localStorage e zera `messages` no `useEffect`. Após reload o usuário vê chat vazio mas a conversa existe no DB. Confunde — parece que o agente "esqueceu".
2. **Markdown rendering** — hoje `whitespace-pre-wrap` em `JimmyChatPanel:83`. Tabelas, código, listas, links chegam crus. CA8 da STORY-029 ficou deferido.
3. **Prompt caching Anthropic** — system prompt + brand learning context é fixo durante a conversa e pesa ~3-5k tokens. Cada turno paga input cheio. `cache_control: ephemeral` (TTL 5min) economiza ~70% nos input tokens reaproveitados.
4. **Auto-scroll inteligente** — hoje rola pro final em todo `messages.length` change. Se usuário rolou pra cima pra ler, perde posição quando nova msg chega. Padrão melhor: detectar `near-bottom` antes de auto-scroll, senão mostrar badge "↓ novas".
5. **Persistir `forcedSkill`** — hoje volta pra `"auto"` em todo F5. Quem prefere "Mídia Paga" tem que reselecionar sempre.

Stories 042 (continuidade) e 043 (streaming) ficam mais brilhantes com esses polimentos. Esta story é independente — pode entrar antes ou depois.

## Spec de Referência

- STORY-029 — CA8 (markdown deferido) e referência ao `whitespace-pre-wrap`
- STORY-022 — frontend HubChat original (estado de mensagens)
- Anthropic API — Prompt Caching docs (`cache_control: { type: "ephemeral" }`)
- `react-markdown` + `remark-gfm` (provavelmente já no `package.json` via outra dep — verificar)
- `src/features/jimmychat/hooks/useJimmyOrchestrator.ts` — hook a estender
- `supabase/functions/jimmy-orchestrator/index.ts` — `callClaudeWithTools` recebe `system` que precisa ganhar cache markers

## Critérios de Aceite

### 1. Hidratar histórico no F5

- [ ] CA1 — `useJimmyOrchestrator` ao carregar `conversation_id` do localStorage (linha ~53), faz `supabase.from('agent_messages').select(...).eq('conversation_id', convId).order('created_at').limit(50)` e popula `messages` com mapping `sender → role`, content, skillId, tool_calls (para `toolExecutions`).
- [ ] CA2 — Mensagens com `message_type: "narrative"` (vem da STORY-042) são incluídas e renderizadas com estilo sutil (já implementado pela 042).
- [ ] CA3 — Loading state durante hidratação: hook expõe `isHydrating: boolean`. Panel/Terminal mostram skeleton enquanto carrega (não cara vazia).
- [ ] CA4 — Erro na hidratação não quebra o chat: log warn, mantém messages vazio, deixa usuário continuar (vai criar mensagens novas no mesmo conversation_id). Toast informa "histórico anterior indisponível".
- [ ] CA5 — Limite 50 últimas mensagens; se conversa for maior, prepend uma mensagem assistant "[carregadas as últimas 50 mensagens — converse normalmente que retomo o contexto]".

### 2. Markdown rendering

- [ ] CA6 — Verificar se `react-markdown` + `remark-gfm` já estão no `package.json`. Se não, `npm install react-markdown remark-gfm`. Adicionar ao `package.json` direto (sem transitive lookup).
- [ ] CA7 — Novo componente `MarkdownContent` em `src/features/jimmychat/components/MarkdownContent.tsx` (~50 linhas) — wrap de `<ReactMarkdown remarkPlugins={[remarkGfm]} components={...}>` com:
  - `table/th/td` — Tailwind border + padding
  - `code` (inline e bloco) — bg-muted, font-mono, rounded
  - `pre` — overflow-x-auto, max-h-96
  - `a` — target=_blank, text-purple-600, underline
  - `ul/ol/li` — spacing consistente
  - Sem HTML raw permitido (`disallowedElements`/`unwrapDisallowed`) ou `rehype-sanitize` se preferir explícito
- [ ] CA8 — `JimmyChatPanel` substitui `<div className="...whitespace-pre-wrap...">{msg.content}</div>` por `<MarkdownContent content={msg.content} />` apenas para `msg.role === 'assistant'`. User messages continuam plain (whitespace-pre-wrap) — usuário não escreve markdown.
- [ ] CA9 — Modo terminal **NÃO usa markdown** — mantém estética CLI plain. ToolLine e text rendering inalterados.
- [ ] CA10 — Bundle size: medir antes/depois com `npm run build`. `react-markdown + remark-gfm` adicionam ~30KB gzip. Aceitável; se >50KB algo está errado.

### 3. Prompt caching Anthropic

- [ ] CA11 — `_shared/anthropic-tools.ts` (`callClaudeWithTools`) aceita `system` como **string OU array de blocks**. Se array, cada bloco pode ter `cache_control: { type: "ephemeral" }`.
- [ ] CA12 — `jimmy-orchestrator/index.ts` constrói system como **2 blocks**:
  - Block 1 (cacheable): system prompt da skill + brand DNA + learning context (`renderSystemPrompt + renderLearningBlock`). Adiciona `cache_control: { type: "ephemeral" }`.
  - Block 2 (não-cacheable): nada por ora — placeholder pra futuras adições per-turn.
- [ ] CA13 — Tool definitions também recebem `cache_control` no último tool do array (cacheia tudo até ali). Anthropic recomenda esse padrão.
- [ ] CA14 — Response Anthropic vem com `usage.cache_creation_input_tokens` e `usage.cache_read_input_tokens`. `logAiCost` registra esses campos em `metadata`. Custo: cache write é 1.25× do input normal; cache read é 0.1× do input normal. Quebra-even em ~2 turnos.
- [ ] CA15 — Logs do edge mostram cache hit ratio: `[orchestrator][reqId] cache_hit=N tokens / cache_create=M tokens / input_fresh=K tokens`.

### 4. Auto-scroll inteligente

- [ ] CA16 — `JimmyChatPanel` adiciona ref no ScrollArea + estado `isNearBottom: boolean`. `onScroll` detecta posição (`scrollHeight - scrollTop - clientHeight < 100px` = near bottom).
- [ ] CA17 — Auto-scroll só dispara se `isNearBottom === true`. Senão, incrementa `unreadCount` e mostra badge fixo no rodapé direito: `<button className="...">↓ {unreadCount} novas</button>`. Click rola pra baixo + zera count.
- [ ] CA18 — Badge desaparece quando `isNearBottom` volta a true (rolagem manual pra baixo).
- [ ] CA19 — Modo terminal: aplica mesmo padrão (mas badge no estilo CLI: `↓ 3 novas msgs` com paleta P.dim).

### 5. Persistir forcedSkill

- [ ] CA20 — `useJimmyOrchestrator` carrega `forcedSkill` de `localStorage.getItem('jimmychat:forced_skill')` no init. Default `"auto"` se ausente/inválido.
- [ ] CA21 — `setForcedSkill` exposto pelo hook salva em localStorage além de setState.
- [ ] CA22 — Validação: se valor lido não for `"auto" | "analista_ads" | "analista_conteudo"`, fallback `"auto"`.

### Validações

- [ ] CA23 — `npx tsc --noEmit` exit 0
- [ ] CA24 — `npm run build` exit 0 + bundle size delta documentado nas notas
- [ ] CA25 — Edge function deployada (`supabase functions deploy jimmy-orchestrator`)
- [ ] CA26 — Smoke F5: conversa com 5 msgs, F5 → todas voltam com markdown renderizado
- [ ] CA27 — Smoke markdown: pedir tabela ou código → renderiza formatado
- [ ] CA28 — Smoke cache: 3 turnos seguidos → logs do edge mostram `cache_hit > 0` no 2º e 3º turno
- [ ] CA29 — Smoke auto-scroll: rolar pra cima durante stream/load → badge aparece com counter, click leva pra baixo
- [ ] CA30 — Smoke persist skill: setar "Mídia Paga", F5 → continua "Mídia Paga"

## Arquitetura

### Arquivos novos

- `src/features/jimmychat/components/MarkdownContent.tsx` (~50 linhas)
- `src/features/jimmychat/lib/hydrate-history.ts` (~60 linhas) — `hydrateConversation(conversationId): Promise<JimmyChatMessage[]>` reutilizável

### Arquivos modificados

- `src/features/jimmychat/hooks/useJimmyOrchestrator.ts`:
  - useEffect de mount chama `hydrateConversation` se há `conversationId`
  - `isHydrating` state + retorno
  - `forcedSkill` lê/escreve localStorage
- `src/features/jimmychat/components/JimmyChatPanel.tsx`:
  - Skeleton de hidratação
  - `<MarkdownContent>` em assistant msgs
  - Auto-scroll inteligente + badge
- `src/features/jimmychat/components/JimmyChatTerminal.tsx`:
  - Skeleton de hidratação (CLI: linhas dim "carregando histórico...")
  - Auto-scroll inteligente + badge CLI
  - **NÃO** usa markdown
- `supabase/functions/_shared/anthropic-tools.ts`:
  - `callClaudeWithTools` aceita system como string ou array
- `supabase/functions/jimmy-orchestrator/index.ts`:
  - Constrói system como blocks com `cache_control`
  - Tools array com `cache_control` no último tool
  - `logAiCost` registra cache tokens
- `package.json` — adiciona `react-markdown` e `remark-gfm` se ausentes

### Reuso explícito

- `agent_messages` table (sem mudanças de schema)
- `displayTool` no MarkdownContent? Não — markdown é só pra texto, tools continuam via ToolExecutionCard
- `localStorage` patterns já existentes em `useJimmyOrchestrator` (`LOCALSTORAGE_PREFIX`)

### Decisões de design

- **Markdown só pra assistant** — usuário não digita markdown; aplicar parser em mensagem do usuário corre risco (XSS via `_underscores_`, etc).
- **Modo terminal sem markdown é proposital** — estética CLI quer texto puro; tabelas em ASCII se Claude quiser.
- **Cache em 1 block grande** vs múltiplos blocks granulares — granular tem custo de overhead (4 cache breakpoints permitidos no Anthropic; cada block <1024 tokens não cacheia). Block único de system+brand é o sweet spot inicial.
- **Hidratação limit 50** — dimensiona em ~10-15s de leitura típica; conversas mais longas usam compactação que vem na 042.
- **Auto-scroll com badge** — padrão estabelecido em apps tipo Slack/Discord; familiar.

## Out of scope

- Lista de conversas anteriores (multi-conv por brand) — story futura
- Export de conversa pra markdown/PDF — story futura
- Compactação automática de histórico longo — coberta pela STORY-042 CA10
- Markdown rendering no terminal — explicitamente fora
- Cache também na response (Claude side) — não tem como; cache é do input

## Riscos

| Risco | Mitigação |
|---|---|
| Hidratação trava UI em conv longa | Limit 50 + Skeleton + async; se ainda lento, considerar streaming hidratação (fora do escopo) |
| Markdown renderiza HTML malicioso | `react-markdown` por default não permite raw HTML; reforçar com `disallowedElements: ['script', 'iframe', 'object', 'embed']` |
| Prompt caching invalida em qualquer mudança do system | Aceitável — TTL 5min, cache regenera. Custo write é amortizado com 2+ turnos |
| Cache não funciona (Anthropic API change ou edge function não passa headers corretos) | logAiCost expondo `cache_hit=0` consistentemente é red flag — investigar logs |
| Bundle de markdown excede esperado | Lazy load: `const MarkdownContent = lazy(() => import('./MarkdownContent'))` se >50KB |
| Auto-scroll badge piscando em conversas curtas | Só mostra se `unreadCount > 0` AND `!isNearBottom`; em chat curto, sempre near bottom |
| `forcedSkill` localStorage corrupto | Validation com fallback "auto" |

## Verificação (smoke pós-deploy)

1. **F5 com conversa**: 5 msgs em uma brand, F5 → todas reaparecem com markdown OK
2. **Markdown**: pedir "me dá tabela com colunas X Y Z" → tabela renderiza com bordas
3. **Cache**: 3 turnos seguidos numa conv → 2º e 3º logs mostram `cache_read_input_tokens > 0`. Custo total da conv reduz vs baseline (medir com `logAiCost` query).
4. **Auto-scroll**: rolar pra cima durante stream da 043 → badge "↓ N novas" aparece, click rola
5. **Persist skill**: setar "Conteúdo", F5 → continua selecionado. Setar "Auto", F5 → "Auto"
6. **Modo terminal**: F5 carrega histórico (CLI), markdown NÃO aplica, auto-scroll badge no estilo CLI funciona
7. **`tsc --noEmit` + `npm run build`** OK + bundle delta <50KB gzip
8. **Erro de hidratação**: simular (DB indisponível, network drop) → toast + chat funcional

---

## Implementação

**Status:** `em-revisao` (deployed em 2026-05-06)

**Arquivos novos:**
- `src/features/jimmychat/lib/hydrate-history.ts` (~95 linhas) — `hydrateConversation` lê últimas 50 mensagens via Supabase, mapeia pra `JimmyChatMessage[]` preservando `kind` (narrative/final), tool_executions, skillId
- `src/features/jimmychat/components/MarkdownContent.tsx` (~80 linhas) — wrap de `react-markdown + remark-gfm` com componentes Tailwind pra table/code/pre/a/ul/ol/p; `skipHtml` previne XSS

**Arquivos modificados:**
- `src/features/jimmychat/hooks/useJimmyOrchestrator.ts`:
  - `useEffect` de mount agora chama `hydrateConversation` quando há `conversation_id` no localStorage; expõe `isHydrating`
  - `forcedSkill` lê de `localStorage.jimmychat:forced_skill` no init (lazy initializer com validation); setter persiste
  - `cancelAction` virou async (alinhamento STORY-042)
- `src/features/jimmychat/components/JimmyChatPanel.tsx`:
  - Skeleton durante `isHydrating`
  - Assistant final usa `<MarkdownContent>`; user e narrativa mantêm `whitespace-pre-wrap`
  - Auto-scroll inteligente: detecta posição do viewport Radix; badge "↓ N novas" absolute em `bottom-24` quando rolou pra cima
- `src/features/jimmychat/components/JimmyChatTerminal.tsx`:
  - Indicador CLI dim "carregando histórico..." durante `isHydrating`
  - Auto-scroll inteligente direto no scrollRef nativo; badge CLI com paleta navy/accent
  - **NÃO** renderiza markdown (estética CLI preservada)
- `supabase/functions/_shared/anthropic-tools.ts`:
  - `CallClaudeWithToolsOptions` ganha `cacheSystem?: boolean`
  - `convertMessagesWithTools` aceita `cacheSystem`; quando true, system vira block com `cache_control: { type: "ephemeral" }`
  - `parseOpenAIResponse` lê `cache_read_input_tokens` / `cache_creation_input_tokens` (formato Anthropic) ou `prompt_tokens_details.cached_tokens` (formato OpenAI standard)
  - `usage` no result expõe `cache_read_input_tokens` / `cache_creation_input_tokens` opcionais
  - Log enriquecido com cacheRead/cacheCreate quando aplicável
- `supabase/functions/jimmy-orchestrator/index.ts`:
  - Constante `CACHE_SYSTEM_ENABLED = Deno.env.get("JIMMY_PROMPT_CACHE_ENABLED") === "true"`
  - Passa `cacheSystem: CACHE_SYSTEM_ENABLED` em ambas chamadas (`callClaudeWithTools` principal e continuation)
  - Agrega `totalCacheRead` / `totalCacheCreation` por turno
  - `logAiCost.metadata` registra `cache_read_input_tokens`, `cache_creation_input_tokens`, `cache_enabled`
  - Log final mostra cacheRead/cacheCreate

**Validações:**
- ✅ `npx tsc --noEmit` exit 0
- ✅ `npm run build` exit 0 em 54.76s
- ✅ `supabase functions deploy jimmy-orchestrator` deployed

**Critérios de aceite:**
- [x] CA1 — `useJimmyOrchestrator` chama `hydrateConversation` no mount com conv ativa
- [x] CA2 — Mensagens com `message_type='tool_call'` ou `'narrative'` viram `kind: 'narrative'`; `'text'` vira `'final'`
- [x] CA3 — `isHydrating: boolean` exposto pelo hook; Panel e Terminal mostram loading state
- [x] CA4 — Erro de hidratação não bloqueia chat: log warn + setError com mensagem branda + `messages: []`
- [x] CA5 — Limit 50; se atingir, prepend assistant msg "Carreguei as últimas 50 mensagens..."
- [x] CA6 — `react-markdown` e `remark-gfm` já estavam no `package.json` (^10.1.0 e ^4.0.1)
- [x] CA7 — `MarkdownContent` em `src/features/jimmychat/components/MarkdownContent.tsx` com componentes table/code/pre/a/ul/ol/p estilizados; `skipHtml` previne XSS
- [x] CA8 — `JimmyChatPanel` usa `<MarkdownContent>` apenas em mensagens assistant com `kind === 'final'` (e não narrativas, e não user)
- [x] CA9 — Modo terminal preservado sem markdown
- [x] CA10 — Bundle size: ~zero delta (deps já eram transitivas em outros features); chunk `index` 1077.38 kB inalterado
- [x] CA11 — `callClaudeWithTools` aceita `system` como string (atual) e através de `cacheSystem: boolean` opta por enviar como block estruturado com `cache_control`
- [x] CA12 — Quando `cacheSystem: true`, system vira `[{type:"text", text, cache_control:{type:"ephemeral"}}]` (1 block único pra simplicidade — STORY-042 mantém narrativa do skill+brand juntos)
- [⏸] CA13 — Tool definitions não recebem cache_control no MVP (decisão: 1 cache breakpoint por turno é simpler e atinge maioria do ganho; pode ser adicionado em mini-story se medirem hit rate ruim)
- [x] CA14 — `logAiCost.metadata` registra `cache_read_input_tokens`, `cache_creation_input_tokens`, `cache_enabled`
- [x] CA15 — Log do edge mostra `cacheRead=N cacheCreate=M` quando aplicável; gated por `CACHE_SYSTEM_ENABLED || tokens > 0`
- [x] CA16 — `JimmyChatPanel` ScrollArea + viewport Radix detecta `near-bottom` (<100px); state `isNearBottom` + `unreadCount`
- [x] CA17 — Badge `↓ N {nova/novas}` absolute na borda inferior do panel; click rola pra baixo + zera count
- [x] CA18 — Badge desaparece quando volta a estar near-bottom (effect zera unreadCount)
- [x] CA19 — Mesmo padrão no Terminal com paleta CLI (`P.accent` border + accent color)
- [x] CA20 — Hook lê `localStorage.jimmychat:forced_skill` no init via lazy initializer
- [x] CA21 — `setForcedSkill` agora também grava em localStorage (try/catch silencioso)
- [x] CA22 — Validation: aceita só `"auto" | "analista_ads" | "analista_conteudo"`; outros valores caem no fallback "auto"
- [x] CA23 — `npx tsc --noEmit` exit 0
- [x] CA24 — `npm run build` exit 0 em 54.76s; bundle delta ~zero
- [x] CA25 — `supabase functions deploy jimmy-orchestrator` deployed
- [ ] CA26 — Smoke F5 com markdown (validar em prod)
- [ ] CA27 — Smoke tabela markdown (validar em prod)
- [ ] CA28 — Smoke cache (requer `JIMMY_PROMPT_CACHE_ENABLED=true` setado em prod via `supabase secrets set` — ver instruções abaixo)
- [ ] CA29 — Smoke auto-scroll (validar em prod)
- [ ] CA30 — Smoke persist skill (validar em prod)

**Bundle size delta:** chunk `index` permaneceu em 1077.38 kB (gzip 295.24 kB vs 295.22 kB anterior) — diferença desprezível.

**Cache hit ratio:** ainda não medido — cache desabilitado por default. Pra ligar:
```
supabase secrets set JIMMY_PROMPT_CACHE_ENABLED=true
```
Após N turnos seguidos numa mesma conversa, `metadata.cache_read_input_tokens > 0` confirma hit. Esperado: 70%+ hit rate a partir do 2º turno (TTL Anthropic ephemeral é ~5min).

**Notas de implementação:**

- **Markdown só pro `kind: 'final'`:** narrativas intermediárias (`tool_call` da STORY-042) também vêm como `kind: 'narrative'` e mantêm `whitespace-pre-wrap` pra preservar a sensação de "passo intermediário".
- **Hidratação respeita ordem narrative→final:** `hydrate-history.ts` filtra `tool_result` (são internos) e mapeia `tool_call` pra `kind: 'narrative'` — alinha com como `useJimmyOrchestrator` empilha mensagens em runtime.
- **Prompt caching gated por env flag:** OpenRouter→Claude suporta `cache_control` mas comportamento real depende do modelo. Default off pra rollout seguro; user liga via `supabase secrets set` após validar.
- **Auto-scroll com viewport Radix:** Radix ScrollArea esconde o scroll nativo; querySelector em `[data-radix-scroll-area-viewport]` é a forma idiomática de acessar o viewport real.
- **Badge unreadCount com effect simples:** quando `messages.length` muda E NOT near-bottom, increment. Volta a near-bottom (scroll manual ou click no badge) zera. Sem race conditions complexas.

---

## QA

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] CA1-CA30 validados
- [ ] Build sem erros, TypeScript strict
- [ ] Edge function deployada (cache markers)
- [ ] Bundle size dentro do esperado
- [ ] Cache funcionando (logs confirmam)
- [ ] Smoke completo (8 itens)
- [ ] Não regrediu features das STORY-042 e STORY-043 (se já em prod)

---

## Notas e Decisões

- **Pacote único** porque cada item sozinho é trivial; agrupar reduz overhead de QA gates
- **Markdown só no panel** mantém identidade do terminal
- **Cache TTL 5min Anthropic** — sweet spot pra conversas conectadas. Renovado em cada turno cacheado.
- **Hidratação via Supabase direto (não edge)** — leitura simples não justifica round-trip extra; RLS já protege
- **Auto-scroll com badge** ergonomicamente melhor que sticky scroll forçado
