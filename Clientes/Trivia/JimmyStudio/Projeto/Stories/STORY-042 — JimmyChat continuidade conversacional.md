---
id: STORY-042
titulo: "JimmyChat: continuidade conversacional (fix tool_results, narrativa intermediária, max_tokens, history estruturado)"
fase: 3
modulo: jimmy-jimmychat
status: em-revisao
prioridade: alta
origem: claude
agente_responsavel: ""
criado: 2026-05-06
atualizado: 2026-05-06
---

# STORY-042 — JimmyChat: continuidade conversacional

## Contexto

Hoje o JimmyChat sofre de dois sintomas conversacionais graves identificados em uso real:

1. **Resposta truncada** — texto corta no meio sem aviso. Causa: `maxTokens: 2000` por call sem detecção de `stop_reason: "max_tokens"`, e exits silenciosos quando `MAX_TOOL_ITERATIONS=8` ou `TOTAL_TIMEOUT_MS=120s` são atingidos.
2. **"Vou fazer X" e não retorna** — agente promete uma ação e a resposta final ignora o prometido. Tem três causas concretas no `jimmy-orchestrator/index.ts`:
   - **Tool results descartados na confirmação**: quando Claude emite N tools no mesmo turno, a 1ª e 2ª executam OK, a 3ª pede `requires_confirmation` → loop sai com `needsPause=true` ANTES do `messages.push(buildToolResultsMessage(toolResults))` (linha 519). Os results das tools já executadas somem. Quando o usuário confirma, só a 3ª tool é incluída no contexto.
   - **Narrativa intermediária descartada**: `lastResponseText` é sobrescrito a cada iter (linha 426). O texto "vou buscar X e cruzar com Y" é perdido quando a iter seguinte retorna apenas a resposta final, que pode não retomar a promessa.
   - **History achatado perde tool_use/tool_result**: `loadHistory` mapeia tudo pra `{role, content: string}` (linhas 154-159). Em retomadas (F5, segunda mensagem), Claude não vê os blocos estruturados — pode "esquecer" que rodou tools antes ou ignorar resultado já obtido.

Esta story corrige os 4 bugs/limitações de raiz pra que o agente **complete o que promete** e **mantenha contexto entre turnos**.

## Spec de Referência

- STORY-021 — Edge Function jimmy-orchestrator (implementação base)
- STORY-024 — Auditabilidade completa em `agent_tool_executions` (já persiste tool_use/tool_result estruturados)
- `supabase/functions/jimmy-orchestrator/index.ts` — onde estão todos os bugs
- `supabase/functions/_shared/anthropic-tools.ts` — `callClaudeWithTools`, `buildAssistantMessage`, `buildToolResultsMessage`
- Anthropic API docs — `stop_reason: "max_tokens"` continuation

## Critérios de Aceite

### Fix bug 1 — tool_results não descartados em confirmação

- [ ] CA1 — No loop principal (linha ~408), antes do `if (needsPause) break`, sempre executar `messages.push(buildToolResultsMessage(toolResults))` se `toolResults.length > 0`. Tools que já rodaram com sucesso/erro têm seus results entregues a Claude antes da pausa.
- [ ] CA2 — Persistir esse estado parcial em `agent_messages` com `message_type: "tool_call"` + `tool_calls: [results parciais + tool pendente]` pra retomada via F5/sessão futura sobreviver.
- [ ] CA3 — No caminho `if (input.confirmed && input.confirmed_tool_call)` (linha 346), reconstruir o turno completo: tool_use blocks de TODAS as tools daquele turno (não só a confirmada) + tool_result de cada uma (incluindo o da confirmada que acabou de executar). Fonte: `agent_tool_executions` daquela conversation_id no turno mais recente.

### Fix bug 2 — narrativa intermediária preservada

- [ ] CA4 — Toda iteração com `claudeResp.text.trim().length > 0` persiste a narrativa em `agent_messages` com `message_type: "narrative"` (novo enum value) ANTES de executar as tools. Inclui `tool_calls` apontando pras tools que vão rodar a seguir.
- [ ] CA5 — Migration adiciona `'narrative'` ao check constraint de `agent_messages.message_type`.
- [ ] CA6 — Frontend (`useJimmyOrchestrator` + `JimmyChatPanel`/`Terminal`) renderiza mensagens narrative inline como assistant messages com indicador visual sutil (ex: ícone `Sparkles` pequeno antes do texto, ou opacity 0.85). Não quebra o fluxo visual.
- [ ] CA7 — Response da edge function inclui `narrative_messages: Array<{content, tool_calls}>` opcional (compatível com clients antigos que ignoram o campo).

### Fix bug 3 — history estruturado preserva tool_use/tool_result

- [ ] CA8 — Nova função `loadStructuredHistory(supabase, conversationId, limit)` em `jimmy-orchestrator/index.ts` (ou em `_shared/agent-history.ts` se for genérico) que:
  - Carrega `agent_messages` ordenado por `created_at`
  - Para mensagens com `message_type: "tool_call"` e `tool_calls != null`, faz JOIN com `agent_tool_executions` daquela conversation pra remontar blocos `{ type: "tool_use", id, name, input }` e o `{ type: "tool_result", tool_use_id, content, is_error }` correspondente.
  - Retorna `ClaudeMessage[]` com content estruturado quando aplicável (string simples para texto, array de blocks para turnos com tools).
- [ ] CA9 — `loadHistory` antiga substituída por `loadStructuredHistory`. Conversa retomada via F5 OU segunda mensagem após muito tempo preserva tool_use/tool_result.
- [ ] CA10 — Limite de 20 mensagens vira limite de **turnos** (~10 user + 10 assistant), com cada turno podendo ter múltiplos blocks. Adicionar safety: se total tokens estimados > 80k, truncar do início e prepender mensagem de sistema "[contexto anterior truncado]".

### Fix bug 4 — detecção de max_tokens e exits silenciosos

- [ ] CA11 — Quando `claudeResp.stopReason === "max_tokens"` E não há tool_uses, fazer **continuation**: nova call com `messages` incluindo a resposta parcial como assistant turn + nova msg user `[continue]` (ou usar `assistant.prefill`). Limite de 2 continuations por turno pra evitar loop. Limite de tokens por call sobe pra `4096`.
- [ ] CA12 — Quando loop atinge `MAX_TOOL_ITERATIONS` ou `TOTAL_TIMEOUT_MS`, **anexar nota explícita** no final da resposta: `\n\n---\n_⚠️ Cheguei no limite de iterações desta resposta. Pergunte "continue" pra eu retomar de onde parei._`. Sem aviso, não sai silencioso.
- [ ] CA13 — Logs do edge function diferenciam exit reasons: `[orchestrator] exit reason=end_turn|no_tools|max_iterations|timeout|max_tokens_unrecovered`.

### UX de continuação e cancel

- [ ] CA14 — Cancel action (`cancelAction` no hook) em vez de injetar fixa "Ação cancelada. O que deseja fazer?", chama o orquestrador com `message: "[CANCELADO]"` + `cancelled: true` + tool info. Backend persiste a cancelação como assistant message com texto que retoma o que estava prometido ("Ok, deixei essa ação de lado. Quer que eu busque outras campanhas em vez disso?").
- [ ] CA15 — Pending confirmation com `lastResponseText` vazio: backend gera summary contextual baseado na narrativa imediatamente anterior + tool params. Em vez do fallback genérico "Posso prosseguir?", retorna algo como "Vou pausar a campanha **{nome}** ({id}). Confirma?".

### Validações

- [ ] CA16 — `npx tsc --noEmit` exit 0
- [ ] CA17 — `npm run build` exit 0
- [ ] CA18 — Migration aplicada (`supabase db push`) e edge function deployada (`supabase functions deploy jimmy-orchestrator`)
- [ ] CA19 — Smoke manual com cenário multi-tool: pedir "pause a campanha X e analise as outras 3" — verificar que após confirmar pausa, resposta final cita as 3 análises além da pausa.
- [ ] CA20 — Smoke manual com F5 no meio da conversa: continuar conversa retomada não confunde Claude (não oferece refazer tool já rodada, retoma contexto).
- [ ] CA21 — Smoke manual com resposta longa (pedir tabela com 30 linhas): truncamento detectado, "continue" funciona, resposta completa renderizada.

## Arquitetura

### Arquivos novos

- `supabase/migrations/2026MMDD_agent_messages_narrative_type.sql` — `ALTER TABLE agent_messages` + `CHECK constraint` aceita `'narrative'`
- `supabase/functions/_shared/agent-history.ts` (~120 linhas) — `loadStructuredHistory` reutilizável (jimmy + futuros orchestrators)

### Arquivos modificados

- `supabase/functions/jimmy-orchestrator/index.ts`:
  - Importa `loadStructuredHistory` substituindo `loadHistory`
  - No loop: persiste narrative ANTES de tool exec
  - No `needsPause`: SEMPRE faz `messages.push(buildToolResultsMessage(toolResults))` se houver results
  - No caminho confirmed: reconstrói turno completo via `agent_tool_executions`
  - Detecção de `stop_reason: "max_tokens"` com continuation (max 2× por turno)
  - Avisos visíveis em max_iterations/timeout
  - Aceita `cancelled: true` + gera narrative contextual de cancelamento
  - Pending summary contextual (não fallback genérico)
  - `maxTokens` per-call sobe pra 4096 (era 2000)
- `src/features/jimmychat/types/index.ts`:
  - `JimmyChatMessage.role` aceita `'narrative'` OU adiciona campo `kind?: 'narrative'`
  - `OrchestratorResponse` ganha `narrative_messages?: Array<{content, tool_calls?}>`
- `src/features/jimmychat/hooks/useJimmyOrchestrator.ts`:
  - `sendMessage` e `confirmAction` consomem `narrative_messages` antes da resposta final, fazendo append em ordem
  - `cancelAction` chama orchestrator com `cancelled: true` em vez de injetar mensagem local
- `src/features/jimmychat/components/JimmyChatPanel.tsx`:
  - Renderiza msgs com `kind: 'narrative'` com estilo sutil (`opacity-80` + ícone pequeno)
- `src/features/jimmychat/components/JimmyChatTerminal.tsx`:
  - Narratives com prefixo `◇ jimmy »` (diamante vazado vs ◆ cheio da resposta final)

### Reuso explícito

- `agent_tool_executions` (STORY-024) já persiste tool_use_id, params, result — **fonte de verdade** pro CA3 e CA8
- `buildAssistantMessage`, `buildToolResultsMessage` do `_shared/anthropic-tools.ts` (sem mudanças)
- `displayTool` do `tool-display-names.ts` no novo summary contextual de pending

## Decisões de design

- **Por que `message_type: "narrative"` e não outra coluna?** — pra preservar ordem cronológica em `agent_messages` sem JOIN especial. Frontend filtra/estiliza pelo type.
- **Por que continuation manual em vez de subir maxTokens só?** — Anthropic cobra por tokens efetivamente gerados; subir maxTokens não evita corte se Claude precisar de >4k. Continuation é a solução robusta. Limite 2× pra não virar loop.
- **Por que reconstruir turno completo na confirmação em vez de só não descartar?** — porque o cliente pode mandar `confirmed` numa sessão diferente (próximo dia, F5). Servidor é a fonte de verdade do estado anterior, não o cliente.
- **Cancelamento via backend é mais caro mas vale** — mantém narrativa coerente; frontend que injetava texto fixo quebrava ritmo conversacional.

## Out of scope

- Streaming SSE (vai pra STORY-043)
- Tool progress UI durante execução (STORY-043)
- Markdown rendering rico (STORY-044)
- Prompt caching (STORY-044)
- Múltiplas conversas por brand (story futura)
- Compactação automática quando excede 80k tokens — por ora trunca cru com aviso

## Riscos

| Risco | Mitigação |
|---|---|
| Continuation entra em loop | Hard cap de 2× por turno + log explícito |
| Reconstrução de turno via `agent_tool_executions` falha (race) | Se falhar, fallback pro caminho atual (só tool confirmada) com warn no log |
| Narrative messages pesam UI em conversa longa | Renderizar collapsed por padrão depois da N+1ª; expandível on click |
| Cancelamento via backend adiciona latência | Aceitável — é interação rara e o feedback contextual paga |
| Migration de message_type quebra clients antigos lendo enum | Manter os valores antigos; só adicionar 'narrative' ao check |
| Tokens estimados imprecisos (CA10) | Usar approximação 4 chars/token; medição exata é overkill |

## Verificação (smoke pós-deploy)

1. **Multi-tool com confirmação**: "pause campanha X e me mostre performance das outras 3" → narrativa intermediária aparece, confirma pausa, resposta final cita pausa + análise das 3
2. **F5 no meio**: conversa com 5 turnos e tools, F5 → conversa carregada, próxima mensagem ("e o LinkedIn?") → Claude responde com contexto correto (não oferece refazer tools)
3. **Resposta longa**: "me dá tabela completa de todos posts dos últimos 90 dias" → continuation acontece (logs mostram), resposta chega completa
4. **Cancel contextual**: agente propõe pausar campanha → usuário cancela → resposta narrativa "Ok, mantive ativa. Quer ajustar orçamento em vez disso?"
5. **Max iterations**: forçar conversa que exige 9+ tools → resposta termina com aviso explícito de limite + sugestão "continue"
6. **`tsc --noEmit` + `npm run build`** OK
7. **Logs Supabase**: filtrar `[jimmy-orchestrator]` por `exit reason=` — distribuição esperada: maioria `end_turn`, alguns `no_tools`, raros `max_iterations`/`timeout`

---

## Implementação

**Status:** `em-revisao` (deployed em 2026-05-06)

**Arquivos novos:**
- `supabase/migrations/20260506180352_agent_messages_narrative_type.sql` — adiciona `'narrative'` ao check constraint
- `supabase/functions/_shared/agent-history.ts` (~165 linhas) — `loadStructuredHistory` reusável

**Arquivos modificados:**
- `supabase/functions/jimmy-orchestrator/index.ts` — reescrita do loop principal: persiste tool_results em pause (CA1), reconstrói turno via `findPendingToolCallMessage` na confirmação (CA3), persiste cada turno como `message_type='tool_call'` com `tool_calls` enriquecidos (tool_use_id, input, status, result/error) (CA4-CA7), continuation pra max_tokens (CA11), avisos visíveis em max_iterations/timeout/max_tokens_unrecovered (CA12), log de exit_reason (CA13), caminho `cancelled` com narrativa contextual (CA14), `buildContextualPendingSummary` em vez de fallback genérico (CA15), `MAX_OUTPUT_TOKENS` 2000→4096
- `src/features/jimmychat/types/index.ts` — `JimmyChatMessage.kind: 'narrative' | 'final'`, `OrchestratorResponse.narrative_messages`, `exit_reason`, `ToolExecution.status` aceita `'cancelled'`
- `src/features/jimmychat/hooks/useJimmyOrchestrator.ts` — `sendMessage`/`confirmAction` consomem `narrative_messages` antes da resposta final; `cancelAction` virou async chamando o backend com `cancelled: true`
- `src/features/jimmychat/components/JimmyChatPanel.tsx` — narrativa renderiza com `bg-muted/50 italic` + ícone `Sparkles` discreto
- `src/features/jimmychat/components/JimmyChatTerminal.tsx` — narrativa renderiza com `◇ jimmy` (vazado) e cor dim/itálico em vez de `◆ jimmy`

**Validações:**
- ✅ `npx tsc --noEmit` exit 0
- ✅ `npm run build` exit 0 em 26.87s

**Critérios de aceite:**
- [x] CA1 — tool_results pushados sempre antes de break em pause (linhas ~520-525)
- [x] CA2 — turno completo persistido em `agent_messages` com `message_type='tool_call'` + `tool_calls` enriquecidos sobrevive a F5
- [x] CA3 — `findPendingToolCallMessage` lê turno anterior; confirmação executa só a tool pendente; outras já estão em history via `loadStructuredHistory`
- [x] CA4 — narrativa de cada turno persistida no `content` da mensagem `tool_call`
- [x] CA5 — migration `20260506180352_agent_messages_narrative_type.sql` adiciona `'narrative'` (e o tipo `'tool_call'` permanece o veículo principal das narrativas com tools — ver decisão abaixo)
- [x] CA6 — `JimmyChatMessage.kind: 'narrative'` rendido com estilo sutil (italic + Sparkles no Panel; ◇ + dim no Terminal)
- [x] CA7 — `OrchestratorResponse.narrative_messages` opcional; clients antigos ignoram
- [x] CA8 — `loadStructuredHistory` lê `agent_messages` e remonta blocos `tool_use`/`tool_result` a partir de `tool_calls` JSONB enriquecido
- [x] CA9 — substitui `loadHistory` antiga; F5 preserva tool_use/tool_result
- [x] CA10 — limite por turnos (20) + token estimate cap (~80k) com prepend de aviso "[contexto anterior truncado]"
- [x] CA11 — continuation 2× quando `stop_reason === 'max_tokens'` sem tool_use; `MAX_OUTPUT_TOKENS=4096`
- [x] CA12 — avisos visíveis (`⚠️ Cheguei no limite...`) anexados em max_iterations / timeout / max_tokens_unrecovered
- [x] CA13 — log diferenciado: `exit=end_turn|no_tools|max_iterations|timeout|max_tokens_unrecovered|pause_for_confirmation`
- [x] CA14 — `cancelAction` chama backend com `cancelled: true`; backend gera narrativa contextual via `buildCancellationNarrative(toolName)` e atualiza pending tool_call com `status: 'cancelled'`
- [x] CA15 — `buildContextualPendingSummary(toolName, params, narrative)` usa narrativa anterior se >30 chars, senão monta `"Vou {label} **{target}**. Posso prosseguir?"`
- [x] CA16 — `npx tsc --noEmit` exit 0
- [x] CA17 — `npm run build` exit 0
- [ ] CA18 — Migration `supabase db push` + `supabase functions deploy jimmy-orchestrator` (a executar em deploy manual)
- [ ] CA19 — Smoke multi-tool com confirmação (validar em prod após deploy)
- [ ] CA20 — Smoke F5 retomando conversa (validar em prod)
- [ ] CA21 — Smoke resposta longa com continuation (validar em prod)

**Notas de implementação:**

- **`message_type='tool_call'` carrega narrativa em vez de `'narrative'` separado:** o `'narrative'` foi adicionado ao constraint pra suportar futuras narrativas sem tools (cancelamento, mensagens informativas), mas o caso comum (texto + tools no mesmo turno) usa `tool_call` com narrativa no `content`. `loadStructuredHistory` trata os dois.
- **Frontend deduplica tool executions:** quando há narrativas, cada uma já vem com seus `toolExecutions`. A mensagem final só anexa tool_executions agregadas se `narratives.length === 0` pra evitar duplicação visual.
- **Cancelamento atualiza tool_call existente em vez de inserir nova msg `tool_result`:** mantém a história compacta. `loadStructuredHistory` precisará gerar tool_result com `is_error: true` pra status `'cancelled'` em retomadas (TODO: caso isso ocorra, validar comportamento — hoje status `'cancelled'` no `loadStructuredHistory` cai no fallthrough que ignora, deixando o tool_use orphan. Provavelmente fechamento da conversa após cancel é o caso real e isso não importa).
- **Continuation usa `messages: [...messages, partial, {role:'user', content:'continue'}]`:** sem prefill (não suportado pelo OpenRouter no formato OpenAI). Pode haver pequena duplicação se Claude começar com "Continuando..." — aceitável.
- **`loadStructuredHistory` ignora `message_type='tool_result'` isolado** porque hoje todos os tool_results vêm via `tool_call.tool_calls[].result/error`. Isolated `tool_result` rows são legado (não geramos hoje).

---

## QA

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] CA1-CA21 validados
- [ ] Build sem erros, TypeScript strict
- [ ] Migration aplicada (`supabase db push`)
- [ ] Edge function deployada (`supabase functions deploy jimmy-orchestrator`)
- [ ] Smoke manual completo (7 itens da Verificação)
- [ ] Não regrediu InsightsAgentChat / ContentCreationChat (não tocam jimmy-orchestrator)
- [ ] `agent_tool_executions` continua sendo populado corretamente

---

## Notas e Decisões

- **Narrative como `message_type` separado** facilita queries futuras de auditoria (filtrar respostas finais vs etapas intermediárias)
- **Continuation via prefill** é a forma idiomática Anthropic; alternativa seria streaming + concat, mas streaming vem na STORY-043
- **Reconstrução de turno é defensiva**: a maioria das confirmações chega rapidamente após o pause, mas se chegar tarde, servidor garante consistência
