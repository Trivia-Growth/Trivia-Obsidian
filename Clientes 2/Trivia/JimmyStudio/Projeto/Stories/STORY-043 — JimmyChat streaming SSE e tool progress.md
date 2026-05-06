---
id: STORY-043
titulo: "JimmyChat: streaming SSE token-by-token + tool progress em tempo real"
fase: 3
modulo: jimmy-jimmychat
status: pronto
prioridade: alta
origem: claude
agente_responsavel: ""
criado: 2026-05-06
atualizado: 2026-05-06
---

# STORY-043 — JimmyChat: streaming SSE + tool progress em tempo real

## Contexto

Hoje o `jimmy-orchestrator` é request/response síncrono. O usuário envia mensagem, vê um Skeleton genérico, e espera 5–60s pela resposta completa do loop (Claude + N tools). Sintomas:

- Tools que demoram 20s+ (Meta Insights, análise de posts) parecem ter travado
- Sem feedback de "estou buscando X" durante a execução
- Texto chega de uma vez no final — perde-se o efeito conversacional natural
- Usuário cancela/recarrega achando que está quebrado

Esta story implementa **streaming SSE** no edge function + UI consumindo eventos. Claude emite texto em chunks; tool executions emitem `tool_start`/`tool_end` com nome e duração corrente. Usuário vê o agente "pensando" em tempo real.

A STORY-042 corrige a lógica de continuidade (narrativa, tool_results, history estruturado). Esta story é a camada de **percepção** — sem ela, qualquer melhoria conversacional ainda parece travada.

## Spec de Referência

- STORY-014 — Streaming SSE Token-by-Token (Fase 2 do plano original — referência inicial)
- STORY-016 — Modo Terminal Branded Jimmy (UX precedente com cursor blink em streaming)
- `supabase/functions/_shared/anthropic-tools.ts` — `callClaudeWithTools` (precisa de versão streaming)
- Anthropic API docs — Server-Sent Events com `stream: true`
- MDN — Server-Sent Events / EventSource client

## Critérios de Aceite

### Backend — streaming SSE

- [ ] CA1 — Nova função `callClaudeWithToolsStream` em `_shared/anthropic-tools.ts` que faz request com `stream: true` e expõe AsyncIterable de eventos: `text_delta`, `tool_use_start`, `tool_use_input_delta`, `tool_use_complete`, `message_stop`, `usage`.
- [ ] CA2 — `jimmy-orchestrator/index.ts` ganha modo SSE: se header `Accept: text/event-stream` presente, response é stream; senão mantém JSON sync (compat com STORY-042 e clients antigos).
- [ ] CA3 — Eventos emitidos pelo edge no formato SSE padrão (`event: <type>\ndata: <json>\n\n`):
  - `meta` — `{conversation_id, message_id_pending, skill_id, remaining_interactions}` (1× no início)
  - `text_delta` — `{delta: string}` (N× durante geração de texto)
  - `narrative_complete` — `{content, persisted_message_id}` (quando narrativa intermediária é finalizada antes de tool execution — alinha com STORY-042 CA4)
  - `tool_start` — `{tool_use_id, tool_name, display_label, input?}` (quando tool começa execução)
  - `tool_progress` — `{tool_use_id, elapsed_ms}` (a cada 2s enquanto tool roda)
  - `tool_end` — `{tool_use_id, status, duration_ms, error?}` (quando tool termina)
  - `pending_confirmation` — payload igual hoje (quando interrompe pra confirmar)
  - `done` — `{message_id, action, tool_executions, delegation_suggested, reqId}` (1× no fim)
  - `error` — `{detail, status, reqId}` (em qualquer falha)
- [ ] CA4 — Tools são executadas dentro do stream: emit `tool_start`, executa, emit `tool_progress` a cada 2s via interval, emit `tool_end`. Não bloqueia a stream em tool lenta — frontend recebe progresso.
- [ ] CA5 — `tool_progress` interval é cancelado quando tool resolve OU stream é abortado pelo client (cleanup garantido).
- [ ] CA6 — Se loop atinge `MAX_TOOL_ITERATIONS` ou `TOTAL_TIMEOUT_MS`, emit `text_delta` com aviso (alinhado com STORY-042 CA12) ANTES do `done`.
- [ ] CA7 — Persistência em DB acontece igual STORY-042 (narrative messages + final assistant message + agent_tool_executions). Stream é só transport — fonte de verdade continua sendo DB.

### Frontend — consumo de stream

- [ ] CA8 — Novo helper `streamOrchestrator(body, handlers)` em `src/features/jimmychat/lib/sse-client.ts` (~80 linhas). Usa `fetch` com `Accept: text/event-stream` + ReadableStream.getReader() em vez de EventSource (precisa enviar body POST, EventSource só GET). Faz parsing manual SSE.
- [ ] CA9 — `useJimmyOrchestrator.sendMessage` por padrão usa stream se `import.meta.env.VITE_JIMMYCHAT_STREAM === "true"`. Se off, mantém path antigo `supabase.functions.invoke` (rollback rápido).
- [ ] CA10 — Hook expõe novos campos: `streamingText: string` (texto da resposta atual sendo construído), `streamingToolExecutions: ToolExecution[]` (com `status: 'running'` e `elapsed_ms` corrente), `isStreaming: boolean`.
- [ ] CA11 — Quando `done` chega: move `streamingText` pra `messages` (assistant message final), limpa `streamingText`, atualiza `tool_executions` finais.
- [ ] CA12 — `AbortController` integrado: `cancelStream()` exposto pelo hook + chamado em `resetConversation` e ao desmontar a página.

### UI — feedback visual durante stream

- [ ] CA13 — `JimmyChatPanel`: durante streaming, renderiza assistant message bubble com `streamingText` em tempo real + cursor pulsando no fim (`▍` blink). Tool executions com `status: running` mostram `<Loader2 spinning>` + `displayLabel` + `(elapsed_ms / 1000).toFixed(0)s`. Substitui o `Skeleton` genérico atual.
- [ ] CA14 — `JimmyChatTerminal`: idêntico mas no estilo CLI — texto vai aparecendo após `◆ jimmy »`, cursor blink já existe, ToolLine ganha estado `running` com glyph `↻` rotacionando (CSS animation) + `(elapsed_ms/1000)s`.
- [ ] CA15 — Auto-scroll funciona durante stream — usa `requestAnimationFrame` pra não buscar scroll em todo `text_delta` (throttle).
- [ ] CA16 — Erro de stream (network, parse): toast + fallback automático pra path JSON sync (mesma message), preservando UX.

### Validações

- [ ] CA17 — `npx tsc --noEmit` exit 0
- [ ] CA18 — `npm run build` exit 0
- [ ] CA19 — `supabase functions deploy jimmy-orchestrator` (a edge function vai precisar de stream support — verificar runtime Deno)
- [ ] CA20 — Smoke desktop: pergunta longa com tool ("compare performance Meta dos últimos 30d com 30d anteriores") — texto aparece em chunks visíveis, tool aparece com counter, resposta final completa.
- [ ] CA21 — Smoke mobile: mesma pergunta — render fluido, scroll acompanha, sem travamento.
- [ ] CA22 — Smoke modo terminal: cursor blink durante stream, ToolLine `running` com counter.
- [ ] CA23 — Smoke abort: enviar pergunta longa, dar F5 / clicar reset durante stream — request cancela, sem leak de connection.
- [ ] CA24 — Smoke fallback: setar `VITE_JIMMYCHAT_STREAM=false` — tudo continua funcionando como hoje.

## Arquitetura

### Arquivos novos

- `supabase/functions/_shared/anthropic-tools-stream.ts` (~180 linhas) — `callClaudeWithToolsStream`, parser SSE Anthropic, AsyncIterable
- `src/features/jimmychat/lib/sse-client.ts` (~80 linhas) — `streamOrchestrator(body, handlers)` helper
- `src/features/jimmychat/lib/event-types.ts` (~40 linhas) — types SSE compartilhados (mirror do backend)

### Arquivos modificados

- `supabase/functions/jimmy-orchestrator/index.ts`:
  - Detecta `Accept: text/event-stream` → caminho stream
  - `streamLoop` análogo ao loop atual mas emitindo eventos
  - `tool_progress` via `setInterval(2000)` durante `executeAgentTool`, cleanup garantido
  - Compartilha 100% da lógica de DB persist com path sync (chama mesmas funções)
- `src/features/jimmychat/hooks/useJimmyOrchestrator.ts`:
  - `sendMessage` checa `VITE_JIMMYCHAT_STREAM`, escolhe path
  - Novos states: `streamingText`, `streamingToolExecutions`, `isStreaming`, `abortControllerRef`
  - `cancelStream` exposto + chamado em reset/unmount
- `src/features/jimmychat/types/index.ts`:
  - `ToolExecution.status` aceita `'running'`
  - `ToolExecution.elapsed_ms?: number` (durante stream; vira `duration_ms` no final)
  - `UseJimmyOrchestratorReturn` ganha campos novos
- `src/features/jimmychat/components/JimmyChatPanel.tsx`:
  - Renderiza `streamingText` como assistant bubble com cursor `▍`
  - Substitui Skeleton genérico por tool list com `streamingToolExecutions`
- `src/features/jimmychat/components/JimmyChatTerminal.tsx`:
  - `ToolLine` aceita `status: 'running'` com glyph rotacionando
  - Stream text dentro do bubble `◆ jimmy »` em tempo real
- `src/features/jimmychat/components/ToolExecutionCard.tsx`:
  - Novo branch `status === 'running'` com Loader2 spinning + counter

### Reuso explícito

- `executeAgentTool`, `buildToolDefinitions` (sem mudanças)
- `corsHeaders` adaptado pra `Cache-Control: no-cache` + `Connection: keep-alive` em SSE
- Cursor blink CSS do `assistente-terminal` (já existe)
- `displayTool` do `tool-display-names.ts` no `tool_start` event payload

### Decisões de design

- **`fetch + ReadableStream` em vez de `EventSource`** — precisamos POST com body (auth, message, brand_id). EventSource só faz GET.
- **`tool_progress` a cada 2s e não 500ms** — evita flood e custo CPU; suficiente pra UX (counter avança visivelmente).
- **Persistência em DB independente do stream** — se cliente desconecta, conversa não fica órfã. Edge continua até o `done` mesmo se ninguém estiver lendo (com timeout total).
- **Feature flag `VITE_JIMMYCHAT_STREAM`** — rollback granular se algo quebrar em prod (sem ambiente de staging).
- **Compat com path JSON sync** — STORY-042 fica funcional mesmo sem essa story; eventual rollback de stream não regride continuidade.

## Out of scope

- Streaming nas tools individuais (tool em si responder em chunks) — não há ganho real
- Streaming token-by-token "real" (server-side decode markdown) — esperar `text_delta` brutos é o suficiente
- Server-side rendering / Edge config caching — Netlify/Supabase já lidam
- Múltiplas conexões SSE simultâneas (várias abas) — primeira ganha; segunda se conecta normal
- Reconexão automática em case de drop — F5 cobre, não vale complexidade

## Riscos

| Risco | Mitigação |
|---|---|
| SSE não roda bem em Supabase Edge Functions (Deno) | Validar antes via PoC simples; fallback flag se backend não suportar |
| Browser cancela conexão por timeout (proxy/CDN) | Heartbeat: emit comment `:keepalive\n\n` a cada 15s |
| `text_delta` em alta frequência travam React render | `useDeferredValue` ou throttle 60fps via rAF |
| Tool de 60s sem `tool_progress` parece travada | Interval 2s já cobre; aviso visual se >30s ("isso pode levar mais alguns segundos") |
| Custo edge function aumenta (conexão aberta mais tempo) | Aceitável — Supabase cobra por invocation, não duração curta. Total timeout 120s já existe. |
| Mobile data drops mid-stream | Toast + retry button na UI; persistência em DB garante histórico não perde |
| Stream emite `text_delta` antes de `meta` em race | Meta é sempre primeiro evento — emit ANTES de qualquer call Claude |

## Verificação (smoke pós-deploy)

1. **Stream básico**: pergunta simples sem tool — texto aparece chunk-by-chunk com cursor blink
2. **Tool stream**: pergunta com tool — `tool_start` aparece, counter avança a cada 2s, `tool_end` ✓ aparece, texto final continua
3. **Multi-tool**: pergunta que dispara 3 tools — 3 ToolLines em sequência (ou em paralelo se Promise.all entrar — fora do escopo desta story), counters independentes
4. **Modo terminal**: mesmo cenário no toggle terminal — visual CLI consistente
5. **Cancel**: pergunta longa, F5 no meio — sem error de connection leaked, sem zombie em logs
6. **Fallback**: setar `VITE_JIMMYCHAT_STREAM=false` em build — funciona como STORY-042 sync
7. **Mobile**: testar em iPhone/Android real, não só DevTools — confirmar que não trava
8. **`tsc --noEmit` + `npm run build`** OK

---

## Implementação

> Preenchido por @dev após concluir.

**Status:** `pronto`

**Arquivos alterados:**
-

**Notas de implementação:**

---

## QA

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] CA1-CA24 validados
- [ ] Build sem erros, TypeScript strict
- [ ] Edge function deployada com suporte a stream
- [ ] Feature flag `VITE_JIMMYCHAT_STREAM` documentada em `.env.example`
- [ ] Smoke manual desktop + mobile completo
- [ ] Modo terminal continua funcional
- [ ] Path sync (fallback) preservado e testado

---

## Notas e Decisões

- **Stream e DB persistência são independentes** — robustez sobre tudo
- **Feature flag de rollback** essencial dado "sem ambiente de staging"
- **`tool_progress` é UX puro** — não persiste em DB, não afeta auditoria
- **Heartbeat keepalive** previne corte por proxies (Cloudflare/Netlify defaults)
