---
id: STORY-014
titulo: "Streaming SSE Token-by-Token no Chat do Jimmy"
fase: 3
modulo: "agencia"
status: backlog
prioridade: média
origem: claude
agente_responsavel: "@dev"
criado: 2026-05-01
atualizado: 2026-05-01
---

# STORY-014 — Streaming SSE Token-by-Token no Chat do Jimmy

## Contexto

Após STORY-013 (polimento conversacional + identidade Jimmy), o chat continua percebido como "menos vivo" porque mensagens chegam de uma vez (resposta JSON monolítica). O `content-creation-agent` chama `callClaude()` síncrono, e o frontend renderiza tudo de uma vez quando o `fetch` resolve. Em respostas longas (review_copy follow-ups, pesquisa), o usuário fica olhando o `TypingIndicator` por 5-15 segundos sem feedback visual de progresso.

A Edge Function `generate-content` já usa `callClaudeStream()` + SSE — o pattern existe no codebase e está em produção. Esta story aplica o mesmo padrão ao `content-creation-agent`, mas com um desafio extra: o agente retorna **JSON estruturado** (`{message, action}`), não texto livre, então não dá pra streamar JSON parcial sem quebrar o parser.

## Spec de Referência

- Plano roadmap em `/root/.claude/plans/radiant-brewing-hejlsberg.md` (seção STORY-014 — Esboço)
- Pattern SSE existente: `supabase/functions/generate-content/index.ts:200+`
- Helper compartilhado: `supabase/functions/_shared/anthropic.ts` (`callClaudeStream`)

## Critérios de Aceite

- [ ] CA1 — Edge Function `content-creation-agent/index.ts` passa a usar `callClaudeStream()` + responde como `text/event-stream` (SSE)
- [ ] CA2 — Contrato de resposta muda: Claude emite `<message>...texto livre markdown...</message>` (streamável) seguido de `<action>{...JSON...}</action>` (parseado no fim do stream). System prompt atualizado com exemplos.
- [ ] CA3 — Frontend (`useContentCreationAgent.ts`) lê `ReadableStream`, atualiza `state.messages[last].content` incrementalmente conforme tokens chegam (replace, não append, do último assistant message)
- [ ] CA4 — Parser robusto: se Claude quebrar o XML (`<message>` não fechada, `<action>` malformada), faz fallback para uma mensagem de erro humana e step não avança
- [ ] CA5 — `TypingIndicator` desaparece assim que o primeiro token chega (transição suave), e a mensagem "vai aparecendo" no balão da assistente
- [ ] CA6 — `AbortController` permite cancelar o stream se o usuário sair da página ou clicar "Cancelar" (novo botão opcional)
- [ ] CA7 — Cobertura E2E nova: testar abort em meio ao stream, parse correto da `<action>` no fim do stream, fallback de XML quebrado
- [ ] CA8 — TypeScript sem erros, build OK, `supabase functions deploy content-creation-agent` executado

## Restrições

- Zero mudança em `useContentGeneration` (geração da copy final, separado do agente conversacional)
- Manter compatibilidade do `AgentResponse` type existente (parser final entrega o mesmo shape)
- Não streamar `action.params` no meio do stream — só renderizar UI condicional (BrandSelector, ResearchResultCard, etc.) **após** o stream completar e a `<action>` ser parseada

---

## Implementação

**Status:** `backlog`

**Arquivos a criar:**
- `src/features/content-creator-chat/utils/streamParser.ts`
  - `parseAgentStream(reader: ReadableStreamDefaultReader, onToken: (msg: string) => void): Promise<{message: string, action: ActionDirective}>`
  - Estado interno: buffer, dentroDeMessage, dentroDeAction, parsedAction
  - Trata SSE format (`data: {...}\n\n`), extrai delta, alimenta buffer, emite tokens via callback enquanto está dentro de `<message>`
  - No final, parseia `<action>` com `JSON.parse` em try/catch

**Arquivos a modificar:**
- `supabase/functions/content-creation-agent/index.ts`
  - Substituir `callClaude` por `callClaudeStream` (já em `_shared/anthropic.ts`)
  - Resposta vira `text/event-stream` com headers SSE
  - System prompt: regra mudada para emitir `<message>texto</message><action>JSON</action>` em vez de JSON puro
  - Manter detecção de `preferences` (linhas 125-155) inalterada — roda no início, antes do stream
- `src/features/content-creator-chat/hooks/useContentCreationAgent.ts`
  - `callAgent()` passa a usar `fetch` com `body.getReader()`, `parseAgentStream()`, e callback `onToken` que faz setState do último message incrementalmente
  - Tratamento de abort + fallback se parse falhar
- `src/features/content-creator-chat/components/ContentCreationChat.tsx`
  - `TypingIndicator` só aparece **antes** do primeiro token (depois desaparece e a mensagem aparece no balão)
  - Auto-scroll precisa rodar a cada token (talvez throttled)

**Arquivos de teste:**
- `tests/assistente-streaming.spec.ts` (novo)
  - Mock do endpoint para retornar SSE controlado
  - Asserts: TypingIndicator some após primeiro token, mensagem cresce caractere a caractere, action é parseada no fim, abort funciona

**Notas de implementação:**

(preenchido durante)

---

## QA

**Gate:** PENDING

**Checklist:**
- [ ] CA1-CA8 validados
- [ ] Build sem erros, TypeScript strict (sem `any`)
- [ ] `supabase functions deploy content-creation-agent` executado
- [ ] E2E `assistente-golden-path.spec.ts` continua passando
- [ ] E2E novo `assistente-streaming.spec.ts` verde
- [ ] Smoke manual: abrir chat, enviar mensagem longa, ver tokens "digitando" no balão
- [ ] Smoke manual: cancelar stream no meio (recarregar página) — sem race condition

**Notas:**

---

## Notas e Decisões

- **Decisão de contrato:** XML wrappers (`<message>`/`<action>`) em vez de JSON streaming porque JSON parcial é frágil e Claude historicamente quebra ao tentar manter JSON válido durante stream. XML permite streamar texto livre dentro de `<message>` e fazer parse estrito da `<action>` no fim.
- **Risco principal:** Claude pode "esquecer" de fechar tags ou inverter ordem. Parser precisa ser tolerante e o system prompt precisa repetir a regra MÚLTIPLAS vezes com exemplos.
- **Rollback:** se streaming der problema em produção, reverter o commit. Edge Function volta ao síncrono. Frontend continua funcionando porque o parser detecta `Content-Type: application/json` e cai no path antigo.
- **Pré-requisito:** STORY-013 estável em produção por ~1 semana antes de iniciar.
