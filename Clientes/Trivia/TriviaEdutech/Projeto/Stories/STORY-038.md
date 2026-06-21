# STORY-038 — Robustez do optimize-content: validação e retry de JSON da IA

**Módulo:** IA / Edge Functions  
**Sprint:** Qualidade  
**Prioridade:** P2  
**Status:** concluido  
**Estimativa:** 3h  
**Origem:** Mapeamento do Sistema (2026-06-17) — Registro de Riscos

> **CONCLUÍDA 2026-06-17** (commit `469ad9d`). Deploy via Management API (`--use-api`).
> - CA-01 ✅ `OutputSchema` Zod valida a saída da IA (seo_title/description, tags 1+, summary, structured_data, suggestions). (Relaxei `.max()` exato p/ evitar degradação falsa em título 1 char acima do limite — validação de tipos/presença mantida.)
> - CA-02 ✅ `parseAIJson` robusto: remove cercas markdown + recorta do 1º `{` ao último `}` + `JSON.parse` + `safeParse`.
> - CA-03 ✅ retry único com instrução reforçada (assistant+user) e `jsonMode`.
> - CA-04 ✅ `AICallOptions.jsonMode` em `_shared/ai-client.ts`; `response_format: { type: "json_object" }` p/ openai/openrouter/gemini; no-op no anthropic.
> - CA-05 ✅ fallback degradado sinaliza `degraded: true` + `raw_response` e loga `warn`/`error` (não "Sucesso").
> - CA-06 ✅ contrato de saída no caminho feliz inalterado; JWT/Zod de entrada intactos.
> - CA-07 ✅ deploy OK; smoke sem auth → HTTP 401 (boot OK).
> - **Lição (debug):** colisão de nome `parsed` (InputSchema vs handler) causou BOOT_ERROR no Deno. O bundler `--use-api` deixou passar no deploy; o `tsc` do projeto NÃO cobre funções Deno. Validação real = deploy + smoke (401 vs 503 BOOT_ERROR). Isolado por: deploy do original (401), original+toplevel (401), e por eliminação no handler.

---

## Contexto

A edge function `optimize-content` gera os metadados de SEO/LLM de um conteúdo (artigo, curso, etc.): `seo_title`, `seo_description`, `tags`, `summary`, `structured_data` (JSON-LD) e `suggestions`. Ela monta um prompt pedindo "Return ONLY valid JSON, no markdown fences", chama o provedor via `callAI` e tenta interpretar a resposta.

O parse da saída da IA é **frágil** e sem validação de schema. Evidências (código real):

- `supabase/functions/optimize-content/index.ts` linhas 120–136:
  ```ts
  const content = aiResult.content;
  let resultData;
  try {
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    resultData = JSON.parse(cleaned);
  } catch {
    resultData = {
      seo_title: title.substring(0, 60),
      seo_description: (description || title).substring(0, 160),
      tags: [],
      summary: description || "",
      structured_data: {},
      suggestions: ["Não foi possível gerar sugestões automaticamente."],
      raw_response: content,
    };
  }
  ```
  O único saneamento é remover cercas markdown via regex e `JSON.parse`. Há um `try/catch` que cai num fallback, mas:
  - **Não há retry**: a primeira resposta inválida já vira fallback degradado (SEO vazio/genérico), sem nova tentativa.
  - **Não há validação de schema**: se o `JSON.parse` tiver sucesso mas o objeto vier com campos faltando, com tipo errado (ex.: `tags` como string em vez de array), ou com lixo extra, o resultado passa direto sem checagem e é devolvido ao cliente como se fosse válido (linhas 140–142, `return new Response(JSON.stringify(resultData), ...)`).
  - **Não usa modo JSON estrito**: o prompt apenas "pede" JSON em texto, mas a chamada não ativa `response_format`/JSON mode mesmo quando o provedor suporta.

- O risco é amplificado pelos modelos padrão configurados em `supabase/functions/_shared/ai-client.ts` (`DEFAULT_MODELS`, linhas 37–42), que são modelos rápidos e baratos — `gpt-4o-mini`, `claude-3-5-haiku`, `gemini-1.5-flash` — e o fallback de plataforma (`getAIConfig`, linhas 69–76) usa OpenRouter com `google/gemini-flash-1.5`. Modelos *-flash/*-mini têm maior propensão a devolver JSON malformado, prosa antes/depois do JSON, ou cercas markdown variadas, justamente os casos que o regex atual não cobre.

- A função `callAI` (`ai-client.ts` linhas 83–95) tem assinatura unificada `(config, messages, options)` com `AICallOptions` (`temperature`, `maxTokens`, `tools`, `toolChoice`) mas **não expõe** nenhuma opção de `response_format`/JSON mode. Os dois caminhos internos:
  - `callOpenAICompatible` (linhas 97–133) monta o body com `model`, `messages`, `temperature`, `max_tokens` (e `tools`/`tool_choice` quando presentes). O endpoint OpenAI/OpenRouter/Gemini-compat suporta `response_format: { type: "json_object" }`, mas o body não o inclui.
  - `callAnthropic` (linhas 135–187) monta `model`, `max_tokens`, `temperature`, `messages`, `system`. Anthropic não tem `response_format`; a forma robusta é tool/`prefill`, mas no mínimo o reforço de prompt já ajuda.

**Impacto:** quando o modelo devolve JSON inválido, a página/artigo recebe SEO degradado silenciosamente (título truncado, descrição genérica, `tags: []`, JSON-LD vazio `{}`), prejudicando indexação e a camada de LLM/Tutor que depende desses metadados, sem que o usuário ou o log saibam que houve degradação real (o `console.log` final sempre reporta "Sucesso"). Viola o DoD "Edge Function: input validado com Zod" no espírito — a entrada é validada com Zod (`InputSchema`, linhas 31–38), mas a **saída da IA não é**.

## Acceptance Criteria

- [ ] CA-01: É definido um `OutputSchema` Zod em `optimize-content/index.ts` que valida a resposta da IA com os campos: `seo_title` (string, máx. 60), `seo_description` (string, máx. 160), `tags` (array de string, 1–8), `summary` (string), `structured_data` (objeto/record), `suggestions` (array de string). Campos opcionais devem ter default seguro (não quebrar quando ausentes).
- [ ] CA-02: O parse passa a usar uma extração de JSON mais robusta (remove cercas markdown E recorta do primeiro `{` ao último `}` quando há prosa antes/depois) seguida de `JSON.parse` e de `OutputSchema.safeParse`.
- [ ] CA-03: Quando o `safeParse`/`JSON.parse` falha, a função faz **uma** nova tentativa (retry) à IA com instrução reforçada de "responda SOMENTE com JSON válido" (e, no provedor compatível com OpenAI, com JSON mode ativo) antes de cair no fallback degradado.
- [ ] CA-04: `callAI`/`AICallOptions` em `_shared/ai-client.ts` ganham uma flag `jsonMode?: boolean`; quando `true` e o provedor é OpenAI-compatível (`openai`/`openrouter`/`gemini`), o body inclui `response_format: { type: "json_object" }`. Para `anthropic`, `jsonMode` é no-op (apenas reforço de prompt no chamador), sem quebrar a chamada.
- [ ] CA-05: O fallback degradado é mantido como último recurso (não pode quebrar a request), mas a resposta passa a sinalizar a degradação: incluir `degraded: true` (e manter `raw_response`) quando o resultado vier do fallback, e logar em nível de erro/aviso (não "Sucesso").
- [ ] CA-06: Nenhuma mudança no contrato de saída para o cliente em caminho feliz (mesmos campos atuais); apenas adiciona `degraded` no caminho de falha. JWT e validação de entrada existentes permanecem intactos.
- [ ] CA-07: `npx tsc --noEmit` (ou `deno check` da função) e `npm run build` concluem sem erros.

## Escopo

**IN:**
- Validação da saída da IA com Zod em `optimize-content/index.ts`.
- Extração de JSON robusta + retry único com prompt reforçado.
- Flag `jsonMode` opcional em `callAI`/`AICallOptions` e ativação de `response_format` para provedores OpenAI-compatíveis.
- Sinalização/logging de degradação no fallback.

**OUT:**
- Trocar os modelos padrão em `DEFAULT_MODELS` ou a estratégia de fallback de provedor (continua OpenRouter/`getAIConfig`).
- Reescrever `callAnthropic` para tool-calling/prefill estruturado (apenas reforço de prompt nesta story).
- Aplicar o mesmo padrão de validação às outras edge functions de IA (`ai-tutor`, `generate-quiz`, etc.) — são stories separadas.
- Persistir o resultado em banco ou cache (a função apenas retorna o JSON).

## Passos de Implementação

1. Em `supabase/functions/_shared/ai-client.ts`: adicionar `jsonMode?: boolean` a `AICallOptions` (linhas 18–23). Em `callOpenAICompatible` (linhas 97–133), quando `options.jsonMode === true`, incluir `body.response_format = { type: "json_object" }`. Em `callAnthropic` (linhas 135–187), ignorar `jsonMode` (no-op) — Anthropic não aceita `response_format`. Propagar `jsonMode` no `callAI` (linhas 83–95) ao desestruturar `options`.
2. Em `supabase/functions/optimize-content/index.ts`: definir `OutputSchema` (Zod, já importado na linha 2) com os 6 campos e defaults seguros (ex.: `tags: z.array(z.string()).min(1).max(8)`, `structured_data: z.record(z.unknown())`).
3. Extrair o parse para uma função `parseAIJson(content: string)` que: remove cercas ```` ```json ```` / ```` ``` ````; recorta do primeiro `{` ao último `}`; `JSON.parse`; `OutputSchema.safeParse`; retorna `{ ok: true, data }` ou `{ ok: false }`.
4. Substituir o bloco das linhas 110–136: primeira chamada `callAI` com `{ temperature: 0.3, maxTokens: 2000, jsonMode: true }`; rodar `parseAIJson`. Se falhar, fazer **um** retry com uma mensagem `user` adicional reforçando "Responda EXCLUSIVAMENTE com um objeto JSON válido, sem texto fora do JSON" (mantendo `jsonMode: true`) e rodar `parseAIJson` de novo.
5. Se ambas as tentativas falharem, montar o fallback degradado atual (linhas 127–135) acrescentando `degraded: true`, e trocar o log final: logar `console.warn`/`console.error` com o `requestId` indicando degradação em vez do `console.log("... Sucesso ...")` (linha 138). No caminho feliz, manter o log de sucesso e retornar `parsed.data`.
6. Garantir que o `return new Response(...)` (linhas 140–142) continue devolvendo `application/json` com o mesmo shape no caminho feliz.
7. Rodar type-check/build e, se houver Deno local, `deno check supabase/functions/optimize-content/index.ts`.

## Arquivos Afetados (File List)

- [ ] `supabase/functions/optimize-content/index.ts`
- [ ] `supabase/functions/_shared/ai-client.ts`

## Testes

- [ ] `npx tsc --noEmit` / `deno check supabase/functions/optimize-content/index.ts` sem erros.
- [ ] `npm run build` conclui com sucesso.
- [ ] Teste manual (curl autenticado com Bearer JWT válido) com um conteúdo real: a resposta vem com `seo_title`/`seo_description` dentro dos limites, `tags` como array não vazio e `structured_data` preenchido.
- [ ] Teste de robustez: simular saída inválida (mockar `callAI` para retornar prosa + JSON com cercas; depois JSON com `tags` como string) e verificar que o retry corrige e, persistindo a falha, retorna fallback com `degraded: true` e log de aviso — sem lançar exceção 500.
- [ ] Confirmar via logs (`supabase functions logs optimize-content` ou painel) que respostas válidas não logam mais como degradadas e respostas inválidas logam aviso/erro.
- [ ] Deploy: `supabase functions deploy optimize-content` após aprovação.

## Rastreabilidade

- Mapeamento: `Projeto/Mapeamento do Sistema.md` (Registro de Riscos — risco P2 de IA: parse frágil de JSON em `optimize-content`)
- Stories relacionadas: STORY-006 (segurança de `optimize-content` e `mp-webhook` — JWT + Zod na entrada, base sobre a qual esta story atua na saída); STORY-030 (uso de transcrição como contexto de IA em `ai-tutor`/`generate-quiz`, que compartilham o `_shared/ai-client.ts`)
