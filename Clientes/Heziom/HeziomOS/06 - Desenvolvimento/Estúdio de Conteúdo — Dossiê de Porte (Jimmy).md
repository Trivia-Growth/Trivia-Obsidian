# Estúdio de Conteúdo — Dossiê de Porte (Jimmy Studio → HeziomOS)

> **O quê:** playbook técnico nível linha-a-linha para portar o motor de conteúdo do Jimmy
> Studio (`triviadash-analytics`) para o Estúdio da área Marketing do HeziomOS (Epic 40).
> Cada story do E40 referencia o capítulo relevante — ninguém precisa reabrir o Jimmy.
>
> **Gerado:** 2026-07-11 por dissecação multi-agente do código-fonte real dos dois repos.
> **Fato-âncora:** as 8 flags do motor estão **ON** em produção (verificado via Management
> API 11/07) → tudo aqui documenta o caminho **flag-ON** (ex.: bloco de marca = dnaRich
> enxuto; motor por intenção ATIVO; anti-invenção por recência ATIVO). O código legado
> sob flag-OFF é dead-code no porte.
>
> **Convenção:** cada peça marcada **PORTA** (traz ~igual) · **ADAPTA** (traz mudando X) ·
> **DESCARTA** (não vem — por quê).

## Índice
1. [Dissecação de `generate-content` (3.130 linhas)](#capítulo-1)
2. [Pipeline de imagem + catálogo plugável](#capítulo-2)
3. [Especificação completa do prompt v4.0 (flags ON)](#capítulo-3)
4. [Motor de intenção + fidelidade (goldens)](#capítulo-4)
5. [Kit do lado HeziomOS (o que reusar)](#capítulo-5)
6. [Plano de porte executável + inventário de arquivos](#capítulo-6)
7. [Apanhado de alertas (todos os capítulos)](#alertas)

---

<a id="capítulo-1"></a>
> Fonte: `/Users/joaogabrielnovais/Documents/Obsidian/Github/triviadash-analytics/supabase/functions/generate-content/index.ts` (3130 linhas — o cabeçalho "3.131" do enunciado conta o EOF).
> Alvo: `/Users/joaogabrielnovais/heziomos-wt-e40/supabase/functions/` (área Marketing, schema `crm`, tabelas `content_*`, single-tenant, reuso de `_shared/ai.ts`).
> Todas as 8 flags do motor estão **ON** em prod (11/07) → o comportamento documentado é SEMPRE o do caminho flag-ON. O código do caminho legado ainda existe no arquivo mas é dead-code sob flag-ON e pode ser removido no porte.

---

## 0. Forma da função (visão de topo)

`serve(async (req) => { … })` — um único handler Deno. Fluxo real:

1. Preflight/auth/org/quota (l.36-77)
2. Parse body + escolhe entre **dois modos**: `captionOnly` (l.119-308, fluxo completo alternativo, retorno JSON não-stream) ou **normal** (l.310+, retorno SSE streaming).
3. No modo normal: carrega marca → monta system+user prompt → pesquisa Perplexity → chama modelo em streaming → transforma o stream em SSE OpenAI-compat e devolve.

Funções auxiliares no mesmo arquivo (todas top-level, fora do `serve`):
`mergeContextWithStrategy` (l.910), `getJsonStructureTemplate` (l.976), `BRAND_ARCHETYPES`/`GTM_LABELS`/`VALUE_ZONE_LABELS` (l.1376-1542), `buildArchetypeInstructions` (l.1545), `buildICPContext` (l.1602), `buildStrategyContext` (l.1693), `buildVoiceFewShot` (l.1786), `buildSystemPrompt` (l.1809), `buildUserPrompt` (l.2701), `buildTrafficVariationsPrompt` (l.2896).

---

## 1. Imports (l.1-30) → par no OS

| Import Jimmy (arquivo) | Assinatura/forma | Par no OS | Destino + razão |
|---|---|---|---|
| `serve` (deno std http/server@0.168) | `serve(handler)` | `Deno.serve` nativo (padrão das edges novas do OS) | **ADAPTA** — trocar por `Deno.serve` (edges recentes do OS não importam `serve`). |
| `createClient` (supabase-js@2.55.0) | `createClient(url, key)` | mesmo pkg `@supabase/supabase-js@2`, mas com `{ db: { schema: "crm" } }` | **ADAPTA** — no OS o schema não é `public`; instanciar client apontando para `crm` (ver `authz.ts` como padrão). |
| `z` (npm:zod@3.23.8) | schemas | zod (OS usa zod nas edges) | **PORTA** — igual. |
| `corsHeaders` (`../_shared/cors.ts`) | **const** `Record<string,string>` (spread direto `{ ...corsHeaders }`) | `_shared/cors.ts` do OS exporta **função** `corsHeaders(origin?)` | **ADAPTA** — no OS é `...corsHeaders(req.headers.get("origin"))`. Todas as ~10 ocorrências de `{ ...corsHeaders }` no index precisam do argumento origin. |
| `getFrameworkInstructions, getContentTypeTemplate, getAudienceTemperatureInstructions, getMetaAdsFramework, getStyleEssence` (`./framework-instructions.ts`, 44 KB) | funções de string-building | não existe | **PORTA** — copiar `framework-instructions.ts` para junto da edge. `getStyleEssence` é onde vive a flag **STYLES_CANONICAL_V1** (via `styles-catalog.ts`). |
| `callClaudeStream, DEFAULT_CLAUDE_MODEL, CLAUDE_MODELS` (`../_shared/anthropic.ts`) | `callClaudeStream(opts): Promise<ReadableStream<Uint8Array>>` — **streaming**, via **OpenRouter** (`/chat/completions`, `stream:true`), modelo `anthropic/claude-sonnet-4` | `_shared/ai.ts` → `callLLM(opts): Promise<LlmResult>` — **NÃO-streaming**, retorna objeto normalizado | **ADAPTA/criar** — é a maior divergência do porte (ver §7). `CLAUDE_MODELS.SONNET_4_6 = 'anthropic/claude-sonnet-4'`. |
| `calculateTextCost, DEFAULT_EXCHANGE_RATE` (`../_shared/ai-costs.ts`) | cálculo de custo em R$ | não existe | **DESCARTA** — camada de custo/comercial; não há no OS single-tenant. |
| `logAiCost` (`../_shared/log-ai-cost.ts`) | grava custo por `org_id` | não existe | **DESCARTA** — depende de `org_id` e de tabelas de custo. Opcional: criar log simplificado single-tenant depois. |
| `getBrazilDateString` (`../_shared/date-helpers.ts`) | `(): string` data BRT | `_shared/business-hours.ts` (tem BRT, mas não a string de data) | **criar** — helper trivial (ou portar `date-helpers.ts` inteiro; expõe também `getBrazilDate/Formatted/MonthYear/TimeString`). |
| `searchWithPerplexity, formatPerplexityForPrompt` (`../_shared/perplexity.ts`, 8 KB) | busca em tempo real | não existe | **criar** — portar `perplexity.ts`. Dependência de segredo `PERPLEXITY_API_KEY`. |
| `buildContentSearchQuery` (`../_shared/search-query-builder.ts`) | monta query p/ Perplexity | não existe | **criar** — portar. |
| `buildEditorialPostureBlock, buildCalendarBriefBlock` (`../_shared/editorial-posture.ts`, 22 KB) | blocos de prompt | não existe | **criar** — portar. |
| `resolveIntent, DEFAULT_INTENT, autoHookPoolForIntent, buildCarouselStructureBlock, buildShortModeSlideFunction, buildContentLeadLine, buildSovereigntyBlock, buildComunicadoStyleBlock, buildStaticComunicadoBlock, buildAdCarouselArcBlock, FACTUAL_DIRETO_HOOK, ContentIntentKey` (`../_shared/intent-prompt.ts`, 16 KB) | Épico 125 (intenção) | não existe | **criar** — portar `intent-prompt.ts`. Núcleo do comportamento de intenção. |
| `recentArchetypes, ARCHETYPE_LABEL, ALL_ARCHETYPES` (`../_shared/opening-archetype.ts`) | anti-mesmice (flag CONTENT_ANTISAMENESS_V2) | não existe | **criar** — portar. |
| `getLeanBrandDNA` (`../_shared/brand-dna-summary.ts`, dynamic import em l.183) | DNA enxuto p/ captionOnly | não existe | **criar** — portar (só usado no captionOnly). |
| `OPENROUTER_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY` (env, l.32-34) | segredos | `SUPABASE_URL`/`SERVICE_ROLE_KEY` existem; `OPENROUTER_API_KEY` conforme decisão de provider | **ADAPTA** — ver §7 sobre provider. |

---

## 2. Tabela de PORTE — bloco lógico por bloco (modo normal)

| Faixa | O que faz | Provider / tabela | Destino + razão |
|---|---|---|---|
| **l.36-39** | Preflight: `if req.method==='OPTIONS' return new Response(null,{headers:corsHeaders})` | — | **ADAPTA** — `corsHeaders(origin)` (função no OS). |
| **l.41-45** | Exige header `authorization`, senão `throw "Missing authorization header"` | — | **ADAPTA** — trocar por `requireAuth(req)` de `_shared/auth.ts` (valida JWT via `auth.getUser` com **anon key**, retorna user ou null). |
| **l.47-55** | `createClient(url, SERVICE_ROLE)` + `supabase.auth.getUser(token)`; `throw "Unauthorized"` se inválido | Supabase Auth | **ADAPTA** — no OS a validação de identidade é `requireAuth` (client anon), e o client service-role fica separado (padrão `authz.ts`). Não validar JWT com a service key. |
| **l.57-65** | Org lookup: `profiles.select('org_id').eq('user_id',user.id).single()`; `throw "User profile not found"` | tabela `profiles` (`org_id`) | **DESCARTA (org) / ADAPTA (autorização)** — OS é single-tenant, sem `org_id`. Substituir por gate de área: `canManageArea(user.id, 'marketing')` (`_shared/authz.ts`) → `403 forbidden()` se false. |
| **l.67-77** | Gate de quota: `rpc('can_generate_content',{p_org_id})`; retorna **402** "Faça upgrade do seu plano" se false | RPC `can_generate_content` | **DESCARTA** — camada comercial/quota; não existe no OS e o enunciado exclui quota/planos/créditos. |
| **l.79** | `await req.json()` | — | **PORTA**. |
| **l.81-99** | Dois schemas Zod: `captionOnlySchema` (captionOnly literal true, existingSlides, existingContent, contentId uuid, instructions max2000) e `normalSchema` (brandId uuid opcional, channel min1, contentFormat min1, contentStyle opcional, `intent` enum[resposta_direta, educacional, comunicado, engajamento, institucional]) | — | **PORTA** — Zod é obrigatório nas edges do OS. Adaptar mensagens de erro para `badRequest()` (RFC 7807, `_shared/errors.ts`). |
| **l.101-117** | `safeParse` por modo; **400** com `parsed.error.errors[0].message` | — | **ADAPTA** — usar `badRequest(msg, corsHeaders(origin), reqId)`. |
| **l.119-308** | **Fluxo captionOnly inteiro** (2º fluxo): resolve `contents` por `contentId` (brand_id/channel/content_format/generated_content); monta `contentContext` de slides/existingContent/fallback; carrega DNA via `getLeanBrandDNA(brands+brand_context)`; regras por canal (linkedin/blog/meta_ads/instagram); `callClaudeStream(SONNET_4_6, maxTokens 2000, temp 0.7)`; consome o stream **internamente** e retorna **JSON não-stream** `{caption, hashtags}` | `contents`, `brands`, `brand_context`, storage; modelo | **PORTA (lógica) / ADAPTA (I/O)** — fluxo válido para o Estúdio (regenerar legenda). Tabelas → `crm.content_items`, `crm.content_brands`, `crm.content_brand_context`. Modelo → `callLLM` (aqui é fácil: já é resposta única, não precisa streaming). Fácil de esquecer no porte por ser um "return" no meio do handler. |
| **l.310-328** | Destructuring de ~40 campos do payload: `brandId, channel, contentFormat, contentStyle, objective, topic, contextFiles, toneLevel, hookType, requiredKeywords, customCta, contentLength, captionLength, emojiLevel, generateVariations, regenerationInstructions, previousContent, audienceTemperature, storiesCount, slidesCount, trafficVariationsEnabled, trafficOutputFormats, variationsCount, variateHooks, variateMiddle, variateCtas, textDepth, referenceUrls, framework_intensity, calendar_brief, intent: intentFromPayload` | — | **PORTA** — contrato de entrada do motor. Manter todos; são lidos adiante. |
| **l.330-352** | Log + validação de campos obrigatórios (`brandId` opcional se `channel==='blog'`; `contentStyle` opcional se blog); `throw "Missing required fields"` | — | **PORTA/ADAPTA** — manter regra; trocar `throw` por `badRequest`. Decidir se "blog" segue existindo como canal no Estúdio. |
| **l.354-411** | Carga de contexto de marca. **Promise.all (l.376-393)**: (a) `brands` + `brand_context(*)` `.single()`; (b) `brand_strategy` `.maybeSingle()`; (c) `brand_icp_profiles` `.in(profile_type,[icp,primary,acp,dcp])`; (d) `brand_preferences` (query montada em l.364-374 com flag **LEARNING_VALIDATION_ENABLED**: se on, filtra `validation_status != refuted` e ordena por status/confidence/weight; se off, só weight). Branch blog sem marca usa objeto genérico (l.407-411) | `brands`, `brand_context`, `brand_strategy`, `brand_icp_profiles`, `brand_preferences` | **ADAPTA** — mapear todas para `crm.content_*` (ex.: `crm.content_brands`, `crm.content_brand_context`, `crm.content_brand_strategy`, `crm.content_brand_icp_profiles`, `crm.content_brand_preferences`). Manter LEARNING_VALIDATION (flag ON). Manter o Promise.all (4 queries paralelas). |
| **l.406** | `context = mergeContextWithStrategy(rawContext, strategy, icpProfiles)` | — | **PORTA** (ver §5). |
| **l.413-426** | Custom frameworks: baixa `context.custom_framework_files` do bucket **`brand-frameworks`** e concatena | storage `brand-frameworks` | **ADAPTA/DESCARTA** — depende de criar o bucket no OS. Se o Estúdio v1 não tiver upload de framework, DESCARTA por ora (o `customFrameworks` só é injetado se existir). |
| **l.428-477** | Context files: pega até 3 arquivos, consulta cache em **`file_extractions`**; se não houver, lê txt/md/csv do bucket **`processing-files`**; senão placeholder "aguardando processamento async" | `file_extractions`, storage `processing-files` | **ADAPTA/DESCARTA** — sistema de extração assíncrona de arquivos é dependência pesada. Para v1 do Estúdio, DESCARTAR (ou portar depois como `crm.content_file_extractions`). |
| **l.479-510** | Anti-repetição: últimos 5 `contents` da marca (`order created_at desc limit 5`), extrai abertura (1º slide → 1ª linha da caption → título), 180 chars | `contents` | **PORTA** — mapear para `crm.content_items`. Comportamento desejável no Estúdio. |
| **l.512-517** | `resolveIntent(CONTENT_INTENT_V1, intentFromPayload, objective)` → `ContentIntentKey`. Flag **CONTENT_INTENT_V1** ON → usa intent do payload; senão deriva do objetivo | — | **PORTA** — portar `intent-prompt.ts`. |
| **l.519-538** | Rotação de hook no **backend** quando `hookType` ausente/'auto' e `framework_intensity<=50`: sorteia de `autoHookPoolForIntent(intent)`; bias: se ≥2 aberturas recentes têm '?', remove 'contraintuitivo' do pool. Resultado em `effectiveHookType` | — | **PORTA** — decisão de produto (evitar o LLM escolher sempre igual). |
| **l.540-542** | `buildSystemPrompt(...)` e `buildUserPrompt(...)` (ver §3 e §4) | — | **PORTA**. |
| **l.544-556** | `buildEditorialPostureBlock(context)` e `buildCalendarBriefBlock(calendar_brief)` anexados ao userPrompt | — | **PORTA** — portar `editorial-posture.ts`. |
| **l.558-566** | Anexa `[CONTEXTO DOS ARQUIVOS]` (se houver) e `[REGENERACAO]`/`[INSTRUCOES]` (regenerationInstructions + previousContent) | — | **PORTA** (arquivos condicionado ao destino do bloco l.428-477). |
| **l.568-575** | Traffic Variations Lab: se `trafficVariationsEnabled && channel==='meta_ads'` → `buildTrafficVariationsPrompt(...)` | — | **PORTA/ADAPTA** — feature de A/B de tráfego pago. Manter se o Estúdio cobrir Meta Ads; senão adiar. |
| **l.577-693** | **Pesquisa Perplexity** (obrigatória por padrão: `context.enable_realtime_search !== false`). Extrai domínios de `referenceUrls`; regras de skip: **comunicado** sempre pula (l.605-607); brief rico + URLs pula e injeta URLs como contexto (l.608-623); detecta briefing estruturado 🎯/📊/📝 (l.625-633). Executa `searchWithPerplexity({query, model 'sonar'|'sonar-pro', maxTokens, searchRecencyFilter:'month', searchDomainFilter, timeoutMs})`; anexa `formatPerplexityForPrompt` ao userPrompt; `logAiCost` da busca (l.685-690) | `searchWithPerplexity` (Perplexity API); `logAiCost` | **criar (Perplexity) / DESCARTA (logAiCost)** — portar `perplexity.ts` + `search-query-builder.ts`; requer `PERPLEXITY_API_KEY`. Remover o `logAiCost` (usa `org_id`). Se não portar Perplexity de imediato, o motor degrada (searchResult null) mas não quebra — porém números do prompt ficam só qualitativos. |
| **l.695-708** | Otimização de memória: se `system.length+user.length > 120000`, trunca `fileContents` a 6000 chars | — | **PORTA** (barato; evita OOM na edge). |
| **l.710-723** | Preserva flags de status da busca (`referenceSearchSucceeded/Skipped`, `preservedCitations`) antes de liberar `searchResult` | — | **PORTA**. |
| **l.725-729** | Libera `fileContents/customFrameworksContent/searchResult` (GC) | — | **PORTA**. |
| **l.733-734** | `maxTokens = (trafficVariationsEnabled \|\| channel==='blog') ? 8192 : 4096` | — | **PORTA**. |
| **l.736-746** | **Temperatura dinâmica**: `intensity = framework_intensity ?? 0`; flag **CONTENT_INTEGRITY_V2** ON → `freeModeTemp=0.75` (senão 0.9); `dynamicTemperature = intensity===0 ? freeModeTemp : intensity<=50 ? 0.85 : 0.65` | — | **PORTA** — manter (flag ON = 0.75 no modo Livre). |
| **l.748-763** | Diretiva criativa: 30% de chance (`intensity<=50 && Math.random()<0.3`) de injetar 1 de 6 constraints estilísticas | — | **PORTA**. |
| **l.765-779** | **Integrity tail** (flag **CONTENT_INTEGRITY_V2** ON): anexa, como ÚLTIMA instrução do userPrompt, bloco anti-invenção de números/valores/fontes (nomeando padrões fabricados observados). `finalUserPrompt = userPrompt + creativeDirective + integrityTail` | — | **PORTA** — recência importa; é o P1 da STORY-133. |
| **l.782-788** | **Chamada ao modelo**: `callClaudeStream({model: CLAUDE_MODELS.SONNET_4_6, system: systemPrompt, messages:[{role:'user',content:finalUserPrompt}], maxTokens, temperature: dynamicTemperature})` | OpenRouter (streaming SSE) | **ADAPTA/criar** — ver §7 (streaming vs `callLLM`). |
| **l.790-803** | `subscription_plans` (period_start/end) + insert em `feature_usage_log` (usage_count 1 por org) | `subscription_plans`, `feature_usage_log` | **DESCARTA** — comercial/quota. |
| **l.805-886** | **Transform stream SSE**: `new ReadableStream` que (1) emite `warning` se URLs falharam (l.813-819); (2) emite `meta.perplexity_citations` (l.822-827); (3) lê o stream do modelo, parseia linhas `data: `, reempacota `event.choices[0].delta.content` em `{choices:[{delta:{content}}]}`, captura `usage.prompt_tokens/completion_tokens`, emite `[DONE]` em `finish_reason==='stop'`; (4) ao fim, `logAiCost('content_generation')` com tokens reais | modelo (parse SSE OpenAI), `logAiCost` | **ADAPTA** — o parser depende do shape **OpenAI/OpenRouter** (`delta.content`, `finish_reason`). Se o OS usar Anthropic nativo, o shape do stream muda (`content_block_delta`) e este parser quebra. Remover `logAiCost`. Manter warning/citations events se o front do Estúdio os consumir. |
| **l.888-890** | `return new Response(transformedStream, {headers: {...cors, Content-Type:'text/event-stream', Cache-Control:'no-cache', Connection:'keep-alive'}})` | — | **ADAPTA** — `corsHeaders(origin)`. |
| **l.891-898** | `catch` → `console.error` + **500** JSON `{error}` | — | **ADAPTA** — `internalErrorSafe(msg, err, corsHeaders(origin), reqId)` (`_shared/errors.ts`) para não vazar detalhe cru. |

---

## 3. `buildSystemPrompt` (l.1809) — ordem dos blocos v4.0

Assinatura real (l.1809):
```ts
function buildSystemPrompt(channel, format, style, brand, context, customFrameworks,
  learnedPreferences, audienceTemperature?, captionLength?, storiesCount?, strategy?,
  icpProfiles?, frameworkIntensity?, intent: ContentIntentKey = DEFAULT_INTENT)
```
Flags lidas no topo da função (l.1810-1817): `CONTENT_DNA_RICH` (dnaRich), `CONTENT_STYLE_V2` (styleV2), `PROMPT_COHERENCE_V1` (coherenceV1), `CONTENT_INTEGRITY_V2` (integrityV2). `intensity = frameworkIntensity ?? 50`.

O comentário-âncora da hierarquia está em **l.1830-1837**. Ordem REAL de concatenação do prompt (com as 8 flags ON):

1. **Base + Regras Absolutas** (l.1839-1869): persona "Jimmy" + `[DATA ATUAL]` (`getBrazilDateString`) + 3 blocos: REGRA ABSOLUTA DADOS/NÚMEROS (nunca inventar, só do Perplexity/contexto com fonte citada), REGRA ABSOLUTA PONTUAÇÃO (proibido travessão/hífen-separador), REGRA ABSOLUTA EXPRESSÕES PROIBIDAS (proíbe "Não é sobre X, é sobre Y").
2. **Hierarquia + Integridade equalizada** (l.1873-1888, `coherenceV1` ON): bloco `[HIERARQUIA DE PRIORIDADE]` (1.Integridade 2.Voz/DNA 3.Intenção/Estilo 4.Estrutura) + `[INTEGRIDADE — escreva forte SEM inventar]`.
3. **Brand Context Core (topo)**:
   - `buildVoiceFewShot(context)` (l.1893, `dnaRich` ON) — few-shot de voz (copy aprovada + amostras).
   - `buildICPContext(icpProfiles)` (l.1894) — persona/dores/objeções/desejos/termos de busca.
   - `buildStrategyContext(strategy)` (l.1895) — proposta de valor/USPs/GTM/zona de valor/preço/gargalo.
   - `buildArchetypeInstructions(strategy)` (l.1897, `dnaRich` ON) — arquétipo → tom de voz obrigatório.
4. **Framework & Style (condicional)** (l.1899-1972):
   - `intent==='comunicado'` → `buildComunicadoStyleBlock(channel,format,style)` (neutraliza estilo).
   - `intensity 1..50` (Guiado) → bloco `[PRINCÍPIOS DE BOA COPY]` (não checklist) + `CANAL/FORMATO/ESTILO`; se `styleV2` ON, `getStyleEssence` injeta INTENÇÃO+TOM; integridade só se `!coherenceV1` (evita duplicar).
   - `intensity > 50` (Estruturado) → com `coherenceV1` ON: essence + `[ESTRUTURA — use como GUIA, não fôrma]` (não exige número). (O ramo legado com `getFrameworkInstructions`+`getContentTypeTemplate` está em l.1956-1965 e é dead-code sob flag ON.)
   - `intensity === 0` (Livre) → só rótulos `CANAL/FORMATO/ESTILO`.
5. **Nota anti-rótulo** (l.1974-1976): "NÃO inclua títulos de seção no texto final".
6. **Regras por canal/formato** (l.1978-2584): Instagram 2026 (limites de caption por `captionLength`, SEO, hashtags, sends, carousel-body-respiro, stories-quantidade) l.1978-2065; Meta Ads (`getMetaAdsFramework` + `getAudienceTemperatureInstructions` + specs por formato) l.2067-2258; blog/GEO+AEO l.~2260-2353; carousel l.2356-2427 e highlight_suggestions l.2475-2501; article LinkedIn l.2431-2472; static (comunicado → `buildStaticComunicadoBlock`, senão regras estático) l.2503-2535; post l.2537-2584.
7. **Bloco MARCA + ESTRUTURA JSON**:
   - `dnaRich` ON → **bloco enriquecido** (l.2631-2675): helper `ln(label,v)` que OMITE campos vazios; adiciona Objeções/Crenças/Glossário de nicho; termina com `RESTRIÇÕES` + `ESTRUTURA JSON OBRIGATÓRIA` (`getJsonStructureTemplate(format,storiesCount)`) + "Retorne APENAS JSON válido sem markdown". (O bloco MARCA legado l.2587-2628 é dead-code sob flag ON.)
8. **Custom frameworks** (l.2677) — só se `customFrameworks` não-vazio.
9. **Preferências aprendidas** (l.2679-2682) — `learnedPreferences` como `- [category] preference`.
10. **Checagem final integridade** (l.2688-2696, `integrityV2` ON) — bloco `[CHECAGEM FINAL … INTEGRIDADE DE DADOS]` no FIM (recência).

**Destino:** **PORTA** (função inteira). Sob flags ON, os ramos legados (l.1956-1965 e l.2587-2628) podem ser removidos para simplificar — decisão consciente de dead-code.

---

## 4. `buildUserPrompt` (l.2701)

Assinatura (l.2701):
```ts
function buildUserPrompt(objective, topic?, format, toneLevel?, hookType?, requiredKeywords?,
  customCta?, contentLength?, emojiLevel?, captionLength?, textDepth?, recentHookSamples?,
  slidesCount?, intent: ContentIntentKey = DEFAULT_INTENT)
```
Sequência: `buildContentLeadLine(format,objective,intent)` (l.2703) → `TEMA:` ou "escolha tema pelos pilares" (l.2704-2705) → `buildSovereigntyBlock(intent)` (l.2708) → array `custom[]`: tom (l.2712-2716), gancho por `hookType` com `hookInstructions`+`legacyMap`+regra de ancoragem ao tema+anti-padrões (l.2717-2759), requiredKeywords/customCta (l.2760-2761), **profundidade** `textDepth` (short/medium/detailed, com `legacyMap standard→medium, long→detailed`; limites de chars por slide + fonte mín) (l.2776-2814), estrutura de carrossel via `buildCarouselStructureBlock(intent, slidesTarget, integrityV2)` para `['carousel','ad_carousel','slides','presentation']` (l.2820-2827), `captionLength` SEO (l.2830-2849), emojiLevel (l.2851-2852) → junta como `PERSONALIZAÇÕES:` (l.2854) → **anti-repetição** com `recentHookSamples` + rotação de arquétipo via `recentArchetypes/ALL_ARCHETYPES` (flag **CONTENT_ANTISAMENESS_V2** ON, l.2871-2886) → `Retorne APENAS JSON válido.` (l.2889).

**Destino:** **PORTA** — depende de `intent-prompt.ts` e `opening-archetype.ts` portados. `slidesTarget = clamp(slidesCount||7, 3, 10)` (l.2784).

---

## 5. Funções auxiliares — destino

| Função (linha) | Papel | Destino |
|---|---|---|
| `mergeContextWithStrategy` (l.910-974) | Se `strategy.id`, sobrescreve `context`: `customer_description→target_audience_persona`; ICP `biggest_pains→pain_points`, `deep_desires→interests`, `main_objections`, `purchase_triggers`; `value_proposition→brand_mission` (se vazio); `brand_personality` etc. | **PORTA** — pura, sem I/O. |
| `getJsonStructureTemplate` (l.976-1373) | Template JSON por formato (post/carousel/thread/article/email + Meta Ads ad_* + WhatsApp wpp_* + static/stories/reels); stories dinâmico por `storiesCount` | **PORTA** — decidir quais formatos o Estúdio expõe (WhatsApp/Meta Ads podem ficar fora do v1). |
| `BRAND_ARCHETYPES` (l.1376-1527) | 12 arquétipos (label/trait/language/toneGuidelines) | **PORTA**. |
| `GTM_LABELS`/`VALUE_ZONE_LABELS` (l.1530-1542) | rótulos de estratégia | **PORTA**. |
| `buildArchetypeInstructions` (l.1545-1599) | arquétipo → tom obrigatório (usa `strategy.brand_archetype`) | **PORTA**. |
| `buildICPContext` (l.1602-1690) | ICP → bloco de prompt | **PORTA**. |
| `buildStrategyContext` (l.1693-1783) | estratégia → posicionamento | **PORTA**. |
| `buildVoiceFewShot` (l.1786-1807) | voz da marca (few-shot) | **PORTA**. |
| `buildTrafficVariationsPrompt` (l.2896-3130) | Lab A/B Meta Ads (hookFormulas, ctaTypes, JSON por formato de vídeo/estático/carrossel/stories) | **PORTA/ADAPTA** — só se Meta Ads entrar no Estúdio. |

---

## 6. Flags (8 ON) — onde cada uma age no index.ts

| Flag | Linha(s) | Efeito com ON |
|---|---|---|
| `CONTENT_INTENT_V1` | l.515-516 | `resolveIntent` usa `intent` do payload (senão deriva do objetivo). |
| `LEARNING_VALIDATION_ENABLED` | l.363-374 | `brand_preferences` filtra `validation_status != refuted` e ordena por status/confidence/weight. |
| `CONTENT_DNA_RICH` | l.1811, l.1893, l.1897, l.2631-2675 | Voz few-shot + arquétipo no topo; bloco MARCA **enriquecido** (omite vazios, + objeções/crenças/glossário). |
| `CONTENT_STYLE_V2` | l.1813, l.1921-1938 | No Guiado, `getStyleEssence` injeta INTENÇÃO+TOM (não fôrma) + integridade qualitativa. |
| `PROMPT_COHERENCE_V1` | l.1815, l.1873-1888, l.1940-1954 | Bloco HIERARQUIA+INTEGRIDADE equalizado em todos os modos; Estruturado "coerente" (estrutura como guia). |
| `CONTENT_INTEGRITY_V2` | l.744-746, l.768-778, l.1817, l.2688-2696, l.2825 | Temp Livre 0.9→0.75; integrity tail no fim do userPrompt; checagem final no systemPrompt; arco de carrossel sem "número sem prova". |
| `CONTENT_ANTISAMENESS_V2` | l.2871-2886 | Rotação explícita de arquétipo de abertura (nomeia usados, pede novo). |
| `STYLES_CANONICAL_V1` | **não no index.ts** | Vive em `framework-instructions.ts`/`styles-catalog.ts` (dentro de `getStyleEssence`). Portar junto. |

---

## 7. A grande ADAPTA — chamada ao modelo (streaming)

- **Jimmy `callClaudeStream`** (`_shared/anthropic.ts` l.191-245): faz `fetch` direto no **OpenRouter** (`https://openrouter.ai/api/v1/chat/completions`, `stream:true`), modelo `anthropic/claude-sonnet-4`, e devolve `response.body` cru (`ReadableStream<Uint8Array>` em SSE formato OpenAI). O index consome esse stream e re-emite SSE ao browser (l.805-886). Assinatura: `CallClaudeOptions {model?, maxTokens?, temperature?, system?, messages, stream?}`.
- **OS `callLLM`** (`_shared/ai.ts` l.401-454): **NÃO-streaming**. Resolve provider (`ai_providers_config` → env → gateway Lovable), suporta Anthropic nativo (`api.anthropic.com/v1/messages`) e shape OpenAI; retorna `LlmResult {stopReason, text, toolUses, content, usage}`. Opções: `LlmCallOptions {provider, apiKey, model, system: string|LlmBlock[], messages: LlmMessage[], tools?, temperature?, maxTokens?, signal?}`.

Duas rotas de porte:
1. **Manter SSE (recomendado se a UI do Estúdio faz streaming):** criar um `callLLMStream` novo em `_shared/` (ou reusar/portar `anthropic.ts` do Jimmy) que devolva `ReadableStream`. Requer decidir provider: usar OpenRouter (paridade exata: `anthropic/claude-sonnet-4`) ou Anthropic nativo (então o parser SSE de l.849-868 muda de `choices[].delta.content`/`finish_reason` para `content_block_delta`/`message_stop`).
2. **Trocar por resposta única (`callLLM`):** mais simples, reusa `ai.ts`, mas perde o streaming token-a-token na UI — o front do Estúdio teria de esperar o JSON completo. Para `captionOnly` isso já é o caso hoje (o stream é consumido internamente), então lá `callLLM` encaixa direto.

O provider/modelo importa para o **comportamento**: o motor foi calibrado (temperaturas, integridade) com `claude-sonnet-4` via OpenRouter. Trocar de modelo muda estilo/qualidade — para paridade, fixar `MODEL_DEFAULTS.agent = "claude-sonnet-4-6"` (já é o default do `ai.ts`, l.173) e o provider correspondente.

---

## 8. Mapa de identidade/tabelas (resumo do porte)

- **Identidade:** `authHeader`→`requireAuth`; `profiles.org_id`→remover; autorização por `canManageArea(user.id,'marketing')`. Sem `org_id` em nada.
- **DESCARTAR inteiros:** gate `can_generate_content` (l.67-77), `subscription_plans` (l.791-795), `feature_usage_log` (l.800-803), `logAiCost` (l.685-690, l.876-881), `ai-costs.ts`.
- **Tabelas `brand_*`/`contents`/`file_extractions`** → schema `crm`, prefixo `content_*` (ex.: `crm.content_brands`, `crm.content_brand_context`, `crm.content_brand_strategy`, `crm.content_brand_icp_profiles`, `crm.content_brand_preferences`, `crm.content_items`, `crm.content_file_extractions`).
- **Buckets** `brand-frameworks` e `processing-files` → criar no OS ou DESCARTAR features dependentes no v1.
- **Erros/CORS:** `_shared/errors.ts` (badRequest/forbidden/internalErrorSafe + `reqId = crypto.randomUUID().slice(0,8)`) e `corsHeaders(origin)` (função).

---

<a id="capítulo-2"></a>
# Capítulo 2 — Dissecação do Pipeline de Imagem

Fontes lidas (Jimmy / `triviadash-analytics`):
- `/Users/joaogabrielnovais/Documents/Obsidian/Github/triviadash-analytics/supabase/functions/generate-image/index.ts` (2.239 linhas)
- `_shared/image-model-config.ts`, `_shared/ai-gateway.ts`, `_shared/openrouter-provider.ts`, `_shared/ai-costs.ts`, `_shared/admin-client.ts`, `_shared/log-ai-cost.ts`
- Irmãs: `generate-image-prompt/`, `compose-editorial/`, `compose-editorial-carousel/`, `generate-blog-cover/`, `regenerate-slide-prompt/`
- Migrations `content_visual_plan`/`content_image_drafts` (base `20251129002615_...sql`) e RPCs `reserve_image_credit`/`finalize_image_credit`

Destino (OS / `heziomos-wt-e40`): stories **40.11** (ADR catálogo plugável) e **40.12** (edge `crm-content-image`), tabela `crm.content_image_drafts` da **40.2**, transporte a construir em `supabase/functions/_shared/image-models.ts`. O `_shared/ai.ts` (callLLM/callAiText) do OS só serve a etapa de texto (tradução) — a chamada de imagem é código novo (ver §7).

---

## 1. Panorama do módulo e destino por arquivo

| Arquivo (Jimmy) | O que é | Destino |
|---|---|---|
| `generate-image/index.ts` | Handler assíncrono: reserva crédito → cria draft `processing` → responde na hora → gera em background (`EdgeRuntime.waitUntil`) → upload → `completed` | **ADAPTA** — é o corpo da 40.12; tira créditos, tira multi-tenant, troca bucket p/ privado |
| `_shared/image-model-config.ts` | `getImageModel()` devolve modelo FIXO `google/gemini-3-pro-image-preview` | **DESCARTA** — substituído pelo catálogo plugável `_shared/image-models.ts` (40.11) |
| `_shared/ai-gateway.ts` | Transporte `callAI`/`callAIRaw`: OpenRouter primário + fallback Lovable + retry Vertex no content_filter | **ADAPTA** — porta a lógica de content_filter/Vertex; **remove** fallback Lovable (40.11 CA3) |
| `_shared/openrouter-provider.ts` | `providerForModel` (força `google-ai-studio` depois `google-vertex`), `isGoogleImageModel`, `retryImageOnVertexIfFiltered` | **PORTA** ~igual (é a inteligência de roteamento do Nano Banana) |
| `_shared/ai-costs.ts` | Tabela de preços por modelo + `calculateImageCost` (token-based) | **ADAPTA** — mantém a matemática; grava em `crm.content_ai_costs` (não `ai_usage_costs`), sem `org_id` |
| `_shared/admin-client.ts` | `getAdminClient()` service_role sem propagar JWT em background | **PORTA** — o OS já tem esse padrão; usar o client service_role da casa |
| `_shared/log-ai-cost.ts` | Insert em `ai_usage_costs` | **DESCARTA/reescreve** — vira insert em `crm.content_ai_costs` (40.12 CA5) |
| `generate-image-prompt/` | Gera o `slides_plan`/prompt visual a partir do conteúdo (Gemini texto) | **Fase 2** — 40.12 gera 1 imagem por slide a partir do post; plano visual multi-slide fica p/ depois (40.12 OUT) |
| `compose-editorial/` + `compose-editorial-carousel/` | Render server-side (Satori/wasm) que compõe TEXTO por código sobre um fundo — flag `EDITORIAL_SATORI_V1` | **DESCARTA v1** (40.12 OUT: "composição server-side de arte final — fase 2") |
| `generate-blog-cover/` | Capa de blog: analisa artigo (Gemini flash) → gera 1 imagem; fetch direto ao OpenRouter | **DESCARTA** (é feature de blog do Jimmy, fora do escopo do Estúdio) |
| `regenerate-slide-prompt/` | Regenera só o texto do prompt de um slide (Gemini texto) | **Fase 2** (junto com o plano visual) |

---

## 2. `generate-image/index.ts` — mapa de porte por bloco

Arquitetura (comentário `l.134-138`): **retorno rápido** (handler cria draft `processing` e responde em ~1-2s) + **background real** via `EdgeRuntime.waitUntil()` (`l.2211-2212`).

### 2.1 Request / validação — `l.21-27`, `l.2000`

```ts
interface GenerateImageRequest {
  visual_plan_id: string;
  slide_number: number;
  prompt: string;
  prompt_adjustments_pt?: string;
  resolution?: string;   // default '1024x1024'
}
```

O parse é `await req.json()` cru (`l.2000`) — **não há Zod** no Jimmy. **ADAPTA:** no OS o payload da 40.12 é `{ postId, slideNumero?, prompt, ajustesPt?, modelo? }`, validado com **Zod** + auth + gate `crm.can_manage_area('marketing')` + RFC 7807 + `reqId` (padrão da casa, 40.12 CA1). `visual_plan_id` (ligação ao `content_visual_plan`) some — o OS liga direto ao `post_id`.

### 2.2 Reserva de crédito — `l.2126-2151` → **DESCARTA**

```ts
const { data: reservationData } = await supabase.rpc('reserve_image_credit', { p_org_id: orgId });
if (!reservation?.success)  // → 200 com error_code 'LIMIT_REACHED'
```

`reserve_image_credit` (migration `20251210144535_...sql:2`) faz `SELECT ... FOR UPDATE` no plano, soma `feature_usage_log` do período, compara com `image_generations_monthly + addon_extra_images*10` e insere uma linha `status:'reserved'` **atomicamente** (defesa contra corrida multi-tenant).

**No lugar (single-tenant, sem camada comercial):** nada de reserva. O handler vai direto para "criar draft" (§2.9). O rate-limit, se existir, é o do padrão da casa (não quota de plano). Toda a máquina `subscription_plans`/`feature_usage_log` **não vem**.

### 2.3 Tradução dos ajustes PT→EN — `l.30-61`, chamada em `l.2004-2016` → **PORTA (adaptando o transporte)**

```ts
// l.36-52
const aiResult = await callAI({
  apiKey: lovableApiKey,
  model: 'google/gemini-2.5-flash-lite',   // modelo BARATO dedicado
  messages: [ { role:'system', content: '...translator specializing in image prompts...' },
              { role:'user', content: textPt } ],
});
```

Roda **antes** do background (no handler, `l.2008`) e concatena o resultado ao prompt como `ADDITIONAL USER ADJUSTMENTS` (`l.2011-2014`). Falha → devolve o texto PT original (`l.59`). Barato e melhora aderência — 40.11 CA4 decide **manter**.

**ADAPTA:** trocar `callAI` pelo `_shared/ai.ts` do OS. Como é texto simples, use `callAiText(cfg, system, user)` (resolvendo o provider por `resolveAiProvider`) OU um modelo barato do próprio catálogo via o adaptador de transporte. Não precisa do callLLM (que é para tool-use).

### 2.4 Construção do prompt (o coração) — `l.328-1405`

É a maior parte do arquivo. Monta um mega-prompt de texto (`fullTextPrompt`, `l.1399-1405`) concatenando, nesta ordem:
`fontSizeReminder + antiTechPrefix + photoCompositionPrefix + edgeToEdgeInstruction + qualityPrefix + layoutInstruction + formatInstruction + textInstructions + personCloningInstruction + basePrompt + actualTextContent`.

Sub-blocos e destino:

| Sub-bloco | Linhas | O que faz | Destino |
|---|---|---|---|
| `aspectInstructions` (1:1/3:4/4:3/16:9/9:16) | `l.526-535` | Trava dimensões e "edge-to-edge, no borders" | **PORTA** |
| `noTextInstruction` | `l.538-545` | Proíbe qualquer texto na imagem (modo `no_text`) | **PORTA** |
| Extração do texto do slide (`slideTextToRender`) | `l.549-582` | Lê `generatedContent.slides[n]` ou single | **ADAPTA** — no OS a fonte é `content_posts.conteudo` (jsonb), não `contents.generated_content` |
| **Fontes mínimas por `text_depth`** (cap-height) | `l.605-642` | Deriva `minBodyFont/titleMin/titleMax` de `contents.text_depth` (short/medium/detailed; capa vs interno) | **PORTA a lógica**, **ADAPTA a fonte** (§ver 2.4.1) |
| `withTextInstruction` (FLAT TEXT, cores travadas) | `l.663-707` | Regras de renderização de texto plano, sem sombra/borda/gradiente | **PORTA** |
| Cover dominance / cover_uppercase | `l.710-729` | Reforço da capa | **PORTA** |
| Highlights (2-tone/bold/background/underline, por slide) | `l.762-994` | Palavras destacadas | **PORTA** (é robusto e independente de tenant) |
| `personCloningInstruction` + IDENTITY ANCHOR | `l.998-1060`, `l.1628-1693` | Clonagem facial fiel (hierarquia de identidade) | **ADAPTA/opcional** — editorial usa foto de livro/mockup, raramente pessoa; manter mas desligado por padrão |
| `LAYOUT_STYLE_INSTRUCTIONS` (split/grid/orbiting/editorial/tweet…) | `l.1063-1232` | Composições nomeadas | **PORTA parcial** — traz os que a Editora usa; tweet/editorial_carousel dependem da fase 2 |
| `STYLE_CATEGORY_MAP` + `QUALITY_PREFIXES` | `l.1297-1360` | Prefixo de qualidade por categoria (fotografia/ilustração/3d…) | **PORTA** |
| `antiTechPrefix` (proíbe CGI/holográfico) | `l.1387-1393` | Autenticidade visual | **PORTA** |

#### 2.4.1 Tipografia proporcional (cap-height) — **PORTA (comprovada em prod)**

É o item que a 40.12 CA/Gotcha manda portar junto. Vive em dois pontos:

- **Cálculo** (`l.605-642`): a partir de `text_depth` define, p.ex. medium → corpo 36-40px, título interno 48-60px, título de capa 56-72px, com piso absoluto 22px.
- **Instrução ao modelo** — a "proporção" é a parte confiável, não o px:

```ts
// l.672 (dentro de withTextInstruction)
`⚠️ PROPORTION (more reliable than px for an image model — HONOR THIS STRICTLY): the CAP-HEIGHT of the
 title letters ≈ ${Math.round(titleMin/1080*100)}–${Math.round(titleMax/1080*100)}% of the image WIDTH; ...`
```

Repetida no lembrete pt-BR do topo do prompt (`fontSizeReminder`, `l.1395-1397`). **ADAPTA só a fonte de `text_depth`:** hoje lê `contents.text_depth` (`l.613-618`); no OS não existe essa coluna na v1 → default `medium` ou ler de `content_posts.briefing`.

### 2.5 Montagem do `messageContent` multimodal — `l.1414-1693` → **PORTA (mecânica)**

Estratégia de **recência de identidade** (comentário `l.1408-1413`): as fotos reais da pessoa entram **por último**, no bloco `IDENTITY ANCHOR` (`l.1628-1693`), logo antes do "GENERATE NOW", porque o Gemini Image dá mais peso ao conteúdo visual mais próximo da instrução final. Referências de estilo entram no meio (`l.1580-1626`), assets "foto sagrada" antes (`l.1465-1539`).

Imagens são convertidas para **base64 data-URI** via `fetchImageAsBase64` (`l.99-132`; timeout 10s, teto **5MB**, senão cai para URL direta). Refs de estilo limitadas a **5** (`l.438`, `l.1606`), fotos de pessoa a **4** (`l.1668`). **PORTA** — no editorial as "referências" viram capa/mockup do livro; manter a conversão base64 (mais confiável que URL, sobretudo com bucket privado — §2.7).

### 2.6 Geração: transporte + best-of-2 + pontuação — `l.1695-1808`

**Chamada** (`l.1699-1718`):

```ts
const imageModel = getImageModel('content_image');   // → 'google/gemini-3-pro-image-preview'
return await callAIRaw({
  apiKey: lovableApiKey,                 // ⚠ é a OPENROUTER_API_KEY (§ Alertas)
  model: imageModel,
  messages: [{ role: 'user', content: messageContent }],
  retries: 0,
  extraBody: { modalities: ['image','text'], n: 2, seed,
               generationConfig: { seed, candidateCount: 2 } },
});
```

`callAIRaw` → `callAI` (ai-gateway.ts `l.217-220`), então a geração **passa pelo mesmo gateway**: OpenRouter primário, **fallback Lovable** se `LOVABLE_API_KEY` existir (`ai-gateway.ts l.44-48`), e o retry **Vertex** quando o Google devolve `finish_reason:'content_filter'` em HTTP 200 (STORY-123, `ai-gateway.ts l.140-191`). `providerForModel` força ordem `google-ai-studio` → `google-vertex` (`openrouter-provider.ts l.36-46`).

**O que PORTA:** o roteamento OpenRouter + o tratamento de `content_filter`/Vertex (é o que faz o Nano Banana funcionar). **O que DESCARTA:** o **fallback Lovable** — 40.11 CA3 é explícita ("SEM fallback Lovable, herança descartada"). Ou seja: no OS o transporte é OpenRouter puro (+ Vertex), sem a segunda cota.

**Best-of-2 + pontuação** (`l.226-283` = `validatePersonClone`; loop em `l.1734-1808`):
- Pede `n:2` → o modelo devolve até 2 candidatas na MESMA chamada (comentário `l.1700-1705`: "aproveitamos as 2 imagens que o modelo já retorna, elevando clonagem de ~75% p/ ~99.6% sem custo de geração adicional").
- `validatePersonClone` (`l.179-295`) usa **`google/gemini-2.5-flash` como juiz de visão** (fetch direto ao OpenRouter, `l.226-235`) com tool `rate_face_clone`, e escolhe a candidata de maior score facial. `best_index` é recalculado pelo score real (`l.284-291`), não confiando no que o modelo diz. Se `best_score < 60` (`FACE_SCORE_THRESHOLD`, `l.1728`) e ainda há retry (`MAX_FACE_RETRIES=1`, `l.1729`), regenera.
- Com **1 candidata só**, retorna score 100 sem validar (`l.194-201`).

**Vale portar? Custo:** o best-of-2 só rende quando há **rosto real a clonar**. Para arte editorial (capa de livro, frase, mockup 3D) não há face → o ganho some e o custo dobra o token de imagem por chamada (2 candidatas) + ~US$0,001 do juiz. **Recomendação (alinha 40.11 CA4): ADAPTA** — `n:1` por padrão no editorial; ligar `n:2` + `validatePersonClone` **apenas** quando o post anexar foto de pessoa. Se ligado, o juiz deve ser um modelo barato **do catálogo** (não hardcode).

### 2.7 Upload no Storage — `l.1821-1843` → **ADAPTA (bucket privado)**

```ts
const fileName = `${visualPlanId}/${slideNumber}/${Date.now()}.png`;   // l.1824
await supabase.storage.from('content-images').upload(fileName, buffer, { contentType:'image/png', upsert:false }); // l.1826
const { data: urlData } = supabase.storage.from('content-images').getPublicUrl(fileName);  // l.1837 → URL PÚBLICA
```

Jimmy usa bucket **público** e guarda `getPublicUrl` em `image_url`. **ADAPTA:** a 40.2 CA8 cria o bucket **`crm-content-studio` NÃO-público**; a 40.12 CA3/CA6 manda gravar **`storage_path`** (não URL) e servir por **URL assinada** sob o gate de marketing. Path recomendado (40.12 CA3): `posts/{postId}/{draftId}.png`. Manter o decode `atob(base64)`→`Uint8Array` (`l.1822-1823`).

### 2.8 Fecho do draft + custo — `l.1846-1915`

- `content_image_drafts.update({ status:'completed', image_url, prompt_used, generation_model, completed_at })` (`l.1846-1855`). **ADAPTA** colunas (§6).
- `finalize_image_credit(success:true)` (`l.1863-1874`) → **DESCARTA** (§2.10).
- `logAiCost({ featureType:'image_generation', model, tokensInput, tokensOutput, ... })` (`l.1898-1915`) → insere em `ai_usage_costs`. **ADAPTA** para `crm.content_ai_costs` (tipo `imagem`, `modelo`, `custo_estimado_brl`, `post_id`, `image_draft_id`), sem `org_id` (40.12 CA5). Tokens reais vêm de `aiResult.usage` (`l.1894-1896`).

### 2.9 Criação do draft + retorno rápido — `l.2153-2226`

```ts
const requestId = crypto.randomUUID();
const { data: draft } = await supabase.from('content_image_drafts').insert({
  visual_plan_id, slide_number, image_url:'', prompt_used: prompt,
  status:'processing', request_id: requestId, started_at, generated_by: user.id, org_id, is_selected:false,
}).select().single();   // l.2156-2171
(globalThis as any).EdgeRuntime?.waitUntil?.(generateImageInBackground(backgroundParams));  // l.2212
return Response({ success:true, status:'processing', draft_id: draft.id, request_id, remaining_credits: ... }); // l.2217
```

**ADAPTA:** cria `crm.content_image_drafts` com status `gerando` e responde `{ draftId }` (40.12 CA2); tira `org_id`/`request_id`/`generated_by`. O front faz polling do draft (40.13).

### 2.10 Caminho de erro + finalize(false) — `l.1919-1960` → **DESCARTA a parte de crédito**

No catch: marca draft `failed` + `error_message` amigável, com tratamento especial de **content_filter** (STORY-124, `l.1928-1938`: mensagem determinística "provável direito autoral", sem sugerir "tente de novo"). Depois `finalize_image_credit(success:false)` que **deleta a reserva** para devolver o crédito (migration `20251130091504_...sql:161` `DELETE FROM feature_usage_log`).

**No OS:** mantém o mapeamento de erro (incl. content_filter → mensagem clara) gravando `crm.content_image_drafts.erro`; **remove** a chamada de crédito (não existe reserva a devolver).

### 2.11 Extras do handler a considerar

- **Auto-cleanup de drafts zumbis** (`l.2044-2057`): marca `failed` qualquer `processing` com `created_at` > 10 min, na próxima invocação. **PORTA a ideia** — resolve a 40.12 CA4 (draft nunca fica preso em `gerando`). Alternativa: pg_cron simples.
- **Atalho "Foto Real"** (`COMPOSED_BG_STYLES`, `l.2059-2124`): quando o brief tem um asset `type:'photo'`, usa a foto anexada **fielmente** como fundo, cria draft `completed` **sem IA e sem crédito**. **PORTA/ADAPTA** — útil no editorial (mockup de livro entra sem regenerar); no OS já não há crédito, só grava o draft apontando pro `storage_path` da foto.

---

## 3. `_shared` — o que cada um faz e destino

### `image-model-config.ts` — **DESCARTA**
`getImageModel()` (`l.18-20`) ignora o argumento e devolve sempre `DEFAULT_IMAGE_MODEL = 'google/gemini-3-pro-image-preview'` (`l.16`). O override por secret foi removido em abr/2026 (comentário `l.4-8`). Substituído pelo catálogo da §7.

### `ai-gateway.ts` — **ADAPTA**
`callAI` (`l.41-67`) monta a lista de gateways (`l.44-48`): OpenRouter sempre; Lovable só se `LOVABLE_API_KEY` existir. `tryGateway` (`l.70-212`): headers `HTTP-Referer:'https://jimmystudio.app'`/`X-Title` (`l.81-82`), spread de `providerForModel` só no OpenRouter (`l.89`), retry 429/503 (`l.103-107`), classificação `fallbackable` (`l.111`: só 429/503/5xx). Bloco STORY-123/124 (`l.140-191`) trata `content_filter`. **Porta o núcleo OpenRouter+Vertex; remove o gateway Lovable; troca os headers de branding.** `callAIRaw` (`l.217-220`) é `callAI` devolvendo `data` cru — necessário porque a imagem vem em `data.choices[0].message.images[]`, que o callLLM do OS **não** expõe (§7).

### `openrouter-provider.ts` — **PORTA**
`isGoogleImageModel` (regex `^google/gemini-.*-image`, `l.19-26`), `providerForModel` (ordem AI Studio→Vertex, `l.36-46`), `retryImageOnVertexIfFiltered` (`l.57-98`, versão p/ quem faz fetch próprio) e `providerForGeminiText` (`l.111-123`). É lógica pura, sem tenant — traz igual.

### `ai-costs.ts` — **ADAPTA**
`AI_COSTS['google/gemini-3-pro-image-preview']` (`l.8-17`): input US$2/M, output_text US$12/M, **output_image US$120/M**, defaults 500 in / 100 txt / **1120 img** tokens. `calculateImageCost` (`l.178-221`) faz `(inTok*in + txtTok*txt + imgTok*img)/1e6`, `DEFAULT_EXCHANGE_RATE=6.10` (`l.167`). Custo/imagem estimado (1 candidata, defaults): `(500·2 + 100·12 + 1120·120)/1e6 = US$0,137 ≈ R$0,83`. Com `n:2` ~dobra o token de imagem → ~US$0,27 + juiz. **Mantém a matemática**; grava BRL em `crm.content_ai_costs.custo_estimado_brl`.

### `admin-client.ts` — **PORTA (usar o equivalente do OS)**
`getAdminClient()` (`l.16-25`): service_role **sem** propagar `Authorization` do usuário — o comentário (`l.3-14`) documenta o incidente Fev–Abr/2026 em que propagar o JWT em background disparava RLS e perdia log de custo silenciosamente. Regra de ouro a manter no OS: **background = service_role puro**.

### `log-ai-cost.ts` — **DESCARTA/reescreve**
Insert em `ai_usage_costs` (`l.32-45`) com `org_id`. No OS vira insert em `crm.content_ai_costs` sem `org_id`.

---

## 4. Funções irmãs (1-2 linhas + destino)

- **`generate-image-prompt/`** — a partir do `content_id`, gera o `slides_plan`/prompt visual por slide (Gemini texto, `providerForGeminiText`), convertendo refs a base64. **Fase 2** (o plano visual estruturado é OUT da 40.12).
- **`compose-editorial/`** — casca HTTP do render Satori/wasm (`_shared/editorial-render.ts`), compõe UM slide (texto por código sobre fundo). Flag `EDITORIAL_SATORI_V1`. **DESCARTA v1** (arte composta = fase 2).
- **`compose-editorial-carousel/`** — orquestra o render in-process de TODOS os slides do carrossel (pega fundo, `buildEditorialSpec`, `renderSlide`, upload, salva `composed_image_url`). **DESCARTA v1**.
- **`generate-blog-cover/`** — capa de blog: analisa o artigo (`google/gemini-3-flash-preview`) e gera 1 imagem via fetch direto ao OpenRouter + `retryImageOnVertexIfFiltered`. **DESCARTA** (feature de blog, fora do Estúdio).
- **`regenerate-slide-prompt/`** — regenera só o texto do prompt de um slide (Gemini texto). **Fase 2**.

---

## 5. Estrutura das tabelas do Jimmy

`content_visual_plan` (base `20251129002615_...sql:44-68`): `id`, `content_id` (FK `contents` ON DELETE CASCADE), `aspect_ratio`, `resolution`, **`slides_plan jsonb`** (array por slide: `visual_description`, `suggested_prompt`, `elements[]`, `mood`), `created_at/updated_at`, `UNIQUE(content_id)`. É o "plano visual" que o `generate-image-prompt` preenche e o `generate-image` consome (`text_mode`, `aspect_ratio`, `unified_style`, `slides_plan`).

`content_image_drafts` (base `l.72-92` + ALTERs): base = `id`, `visual_plan_id` (FK ON DELETE CASCADE), `slide_number int`, `image_url text NOT NULL`, `prompt_used text NOT NULL`, `generation_model text` (default `gemini-2.5-flash-image-preview`), `is_selected bool`, `created_at`; **índice único parcial** `idx_one_selected_draft_per_slide (visual_plan_id, slide_number) WHERE is_selected=true` (garante 1 selecionado/slide). ALTERs posteriores acrescentaram `status`, `request_id`, `started_at`, `completed_at`, `generated_by`, `org_id`, `error_message` (colunas que o código de fato usa em `l.2156-2171` e `l.1846-1855`). RLS por `contents.org_id = get_user_org_id(auth.uid())`.

`content_image_brief` — brief por `content_id` (person_groups, visual_assets, reference_images/mode, preferred_style, background_mode, font_*, highlight_*, cover_uppercase…). No `generate-image` é lido em `l.2034-2038` e domina a construção do prompt. **No OS v1** esses campos vêm do `content_posts.briefing` (jsonb) — não há tabela de brief separada.

## 6. O que a 40.2 já criou no OS × mapeamento de campos

`crm.content_image_drafts` (40.2, `docs/stories/active/40.2.story.md:121-129`):

```sql
CREATE TABLE crm.content_image_drafts (
  id uuid PK, post_id uuid REFERENCES crm.content_posts(id) ON DELETE CASCADE,
  slide_numero int, prompt text NOT NULL, modelo text NOT NULL,
  status text DEFAULT 'gerando' CHECK (status IN ('gerando','pronto','falhou','escolhido','descartado')),
  storage_path text, erro text, created_at timestamptz
);
```

Além dela, a 40.2 cria `crm.content_ai_costs` (`tipo`, `post_id`, `image_draft_id`, `modelo`, `tokens_entrada/saida`, `custo_estimado_brl`) e o bucket privado `crm-content-studio`. RLS: `content_image_drafts`/`content_ai_costs` = **SELECT** para authenticated-com-área; **escrita só via edge** (service_role). Índice `content_image_drafts(post_id)` (CA5).

Mapa Jimmy → OS:

| Jimmy | OS (`crm.content_image_drafts`) | Nota |
|---|---|---|
| `visual_plan_id` (FK plano visual) | `post_id` (FK `content_posts`) | OS liga ao post; v1 sem `content_visual_plan` |
| `slide_number` | `slide_numero` | igual |
| `image_url` (URL pública) | `storage_path` | bucket privado → path, servido por signed URL |
| `prompt_used` | `prompt` | igual |
| `generation_model` | `modelo` | passa a vir do catálogo (§7) |
| `status` (`processing/completed/failed`) | `status` (`gerando/pronto/falhou/escolhido/descartado`) | enum novo; seleção virou estado |
| `is_selected bool` + índice parcial | `status='escolhido'/'descartado'` | OS dobra "selecionado" no enum; **atenção:** perdeu a garantia "1 selecionado/slide" — se precisar, recriar índice único parcial sobre `WHERE status='escolhido'` |
| `error_message` | `erro` | igual |
| `org_id`, `generated_by`, `request_id`, `started_at`, `completed_at` | — | **DESCARTA** (single-tenant; sem reserva; timestamps reduzidos a `created_at`) |

---

## 7. Recomendação concreta: catálogo plugável `_shared/image-models.ts`

Alinhado à 40.11 CA3 e 40.12 CA1/CA3. O `id` do catálogo é gravado em `content_image_drafts.modelo`; trocar default = editar 1 linha, sem migration.

```ts
// supabase/functions/_shared/image-models.ts
export type ImageProvider = 'openrouter' | 'openai';
export type ImageUso = 'capa' | 'slide' | 'stories' | 'default';

export interface ImageModel {
  id: string;              // id ESTÁVEL do catálogo (gravado em content_image_drafts.modelo)
  transportModel: string;  // id real p/ o provider (ex.: 'google/gemini-3-pro-image-preview')
  provider: ImageProvider; // qual adaptador de transporte usar
  rotulo: string;          // rótulo pt-BR p/ a UI (40.13)
  custoPorImgBrl: number;  // custo estimado observado no bench 40.11 (mostra na UI)
  usoDefault: ImageUso[];  // p/ quais usos este modelo é o default
  ativo: boolean;
}

export const IMAGE_MODELS: ImageModel[] = [
  { id: 'nano-banana-pro',   transportModel: 'google/gemini-3-pro-image-preview', provider: 'openrouter',
    rotulo: 'Nano Banana Pro (Google)',      custoPorImgBrl: 0.85, usoDefault: ['capa', 'default'], ativo: true },
  { id: 'nano-banana-flash', transportModel: 'google/gemini-2.5-flash-image',     provider: 'openrouter',
    rotulo: 'Nano Banana Flash (rápido)',    custoPorImgBrl: 0.42, usoDefault: ['slide', 'stories'], ativo: true },
  { id: 'gpt-image',         transportModel: 'openai/gpt-5.4-image-2',            provider: 'openrouter',
    rotulo: 'GPT Image (OpenAI)',            custoPorImgBrl: 0.55, usoDefault: [],                   ativo: false },
];

export function resolveImageModel(id: string | undefined, uso: ImageUso = 'default'): ImageModel {
  if (id) {
    const m = IMAGE_MODELS.find((x) => x.id === id && x.ativo);
    if (!m) { const e: any = new Error(`modelo '${id}' fora do catálogo`); e.status = 422; throw e; } // 40.12 CA1
    return m;
  }
  return IMAGE_MODELS.find((x) => x.ativo && x.usoDefault.includes(uso))
      ?? IMAGE_MODELS.find((x) => x.ativo && x.usoDefault.includes('default'))!;
}
```

**Transporte unificado** (adaptador único, dispatch por `provider`). O caminho OpenRouter carrega a inteligência portada do Jimmy (providerForModel + Vertex no content_filter). O `openai` direto só existe para um eventual modelo que não esteja no OpenRouter:

```ts
// supabase/functions/_shared/image-transport.ts  (esboço)
import { IMAGE_MODELS, ImageModel } from './image-models.ts';
import { isGoogleImageModel, providerForModel } from './openrouter-provider.ts';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function generateImage(model: ImageModel, messages: any[], opts: { n?: number; seed?: number }) {
  if (model.provider === 'openrouter') {
    const body = {
      model: model.transportModel, messages,
      modalities: ['image', 'text'], n: opts.n ?? 1,
      ...(opts.seed ? { seed: opts.seed, generationConfig: { seed: opts.seed, candidateCount: opts.n ?? 1 } } : {}),
      ...(isGoogleImageModel(model.transportModel) ? providerForModel(model.transportModel) : {}),
    };
    let data = await postOpenRouter(body);                                   // Bearer OPENROUTER_API_KEY
    data = await retryVertexOnContentFilter(model.transportModel, body, data); // STORY-123 portado
    return data;                                                             // sem fallback Lovable (40.11 CA3)
  }
  // provider === 'openai' → /v1/images/generations (shape b64_json) — só se o modelo não estiver no OpenRouter
  return await postOpenAIImages(model.transportModel, messages, opts);
}
```

Na 40.12: `const model = resolveImageModel(payload.modelo, uso)` no handler (valida/resolve, grava `model.id` no draft), e no background chama `generateImage(model, messageContent, { n, seed })`. A extração da imagem continua `data.choices[0].message.images[0].image_url.url` (como `l.1742-1744`). **Por que não reusar o `callLLM` do OS aqui:** o `LlmResult` (`_shared/ai.ts:145-154`) normaliza texto/tool_use e **não** carrega `message.images` — imagem exige o `data` cru, então o transporte é código próprio. O `callLLM`/`callAiText` cobrem apenas a etapa de **texto** (tradução PT→EN, §2.3).

---

## 8. Sequência final recomendada da edge `crm-content-image` (40.12)

1. Auth + gate marketing + Zod `{ postId, slideNumero?, prompt, ajustesPt?, modelo? }` + `reqId`.
2. `resolveImageModel(modelo, uso)` (422 se fora do catálogo).
3. (opcional) tradução `ajustesPt`→EN via `callAiText`.
4. Carrega `content_posts` (conteúdo/briefing) → monta `messageContent` (todo o §2.4/2.5 portado; cap-height incluso).
5. Insert `crm.content_image_drafts` (`gerando`, `modelo=model.id`) → responde `{ draftId }`.
6. `EdgeRuntime.waitUntil(background)`: `generateImage(model, messageContent, { n, seed })` → (opcional best-of-2 só se houver pessoa) → decode → upload no `crm-content-studio` (`posts/{postId}/{draftId}.png`) → update draft `pronto` + `storage_path` → insert `crm.content_ai_costs`.
7. Falha em qualquer etapa → draft `falhou` + `erro` legível (content_filter tratado); cleanup de zumbi por checagem na próxima invocação ou pg_cron (CA4).

---

<a id="capítulo-3"></a>
> Base dos caminhos: `triviadash-analytics/supabase/functions/`. Referências `arquivo:linha` são reais (lidas em 11/07).
> Origem de tudo: `generate-content/index.ts` (`buildSystemPrompt` l.1809-2699, `buildUserPrompt` l.2701-2892) + `_shared/intent-prompt.ts`, `_shared/opening-archetype.ts`, `_shared/editorial-posture.ts`, `_shared/styles-catalog.ts`, `generate-content/framework-instructions.ts`.
> **Confirmado**: as 8 flags estão ON em prod. Este capítulo documenta SÓ o caminho flag-ON. Onde há branch legado (flag-off), ele está marcado como **código morto sob flags-on → DESCARTA**.

---

## 0. Como o prompt é montado (call site) e onde cada flag entra

O handler monta DUAS strings independentes e chama o LLM com `system` separado de `user`.

- `systemPrompt = buildSystemPrompt(...)` — `index.ts:541`
- `userPrompt = buildUserPrompt(...)` — `index.ts:542`
- Depois o `userPrompt` recebe **appends** (nesta ordem): postura editorial (`:546-549`), briefing do calendário (`:553-556`), conteúdo de arquivos (`:558-560`), regeneração (`:562-566`), traffic variations (`:570-575`), URLs de brief rico / leitura de briefing estruturado (`:620-633`), contexto Perplexity (`:677-680`).
- **Montagem final** — `index.ts:779`:
  ```ts
  const finalUserPrompt = userPrompt + creativeDirective + integrityTail;
  ```
- Chamada — `index.ts:782-788`: `callClaudeStream({ model: CLAUDE_MODELS.SONNET_4_6, system: systemPrompt, messages: [{ role:'user', content: finalUserPrompt }], maxTokens, temperature })`. No HeziomOS isto vira `callLLM` de `_shared/ai.ts`.
  - `maxTokens` = 8192 p/ `blog`/traffic, senão 4096 (`:734`).
  - `temperature` dinâmica (`:744-746`): **Livre = 0.75** (porque `integrityV2` ON; legado era 0.9), Guiado = 0.85, Estruturado = 0.65. Intensidade default = 50 → Guiado (`buildSystemPrompt:1822`).

**Mapa das 8 flags (onde são lidas e o que ligam):**

| Flag | Lida em | Liga (flag-ON) |
|---|---|---|
| `CONTENT_INTENT_V1` | `index.ts:515` → `resolveIntent` (`:516`) | Intenção real do post (resposta_direta/educacional/comunicado/engajamento/institucional). Off ⇒ força `resposta_direta`. |
| `CONTENT_DNA_RICH` | `buildSystemPrompt:1811` | Voz few-shot no topo (`:1893`), arquétipo (`:1897`), bloco MARCA enxuto que omite vazios (`:2631-2675`). Off ⇒ bloco MARCA legado com 30+ campos "N/A" (`:2587-2628`). |
| `CONTENT_STYLE_V2` | `buildSystemPrompt:1813` | No Guiado, injeta essência do estilo (intenção+tom) via `getStyleEssence` (`:1921-1938`). |
| `PROMPT_COHERENCE_V1` | `buildSystemPrompt:1815` | Bloco HIERARQUIA + INTEGRIDADE no topo (`:1873-1888`); no Estruturado troca framework rígido por essência+guia (`:1940-1954`). |
| `CONTENT_INTEGRITY_V2` | `:1817` (system), `:744` (temp), `:768` (tail user), `:2825` (FOMO carrossel) | Checagem final no fim do system (`:2688-2696`); "última instrução" no fim do user (`:768-778`); baixa temp; troca FOMO "mensurável" por "observável sem número". |
| `STYLES_CANONICAL_V1` | `getStyleEssence` (`framework-instructions.ts:786`) | `getStyleEssence` resolve via catálogo canônico (`styles-catalog.ts` → `resolveCanonicalStyle`) em vez do template legado. |
| `CONTENT_ANTISAMENESS_V2` | `buildUserPrompt:2871-2872` | Rotação explícita de ARQUÉTIPO de abertura (`opening-archetype.ts`) no bloco anti-repetição (`:2874-2886`). |
| `LEARNING_VALIDATION_ENABLED` | `index.ts:363` | Query de `brand_preferences` descarta `refuted` e ordena por `validation_status`/`confidence_score` (`:368-374`). Só muda QUAIS prefs entram no bloco "PREFERÊNCIAS APRENDIDAS" (`:2679-2682`). |

**Inputs do payload** (`index.ts:310-328`): `brandId, channel, contentFormat, contentStyle, objective, topic, ..., framework_intensity, calendar_brief, intent`. Antes do `buildUserPrompt`, o `hookType='auto'` é **sorteado no backend** por intenção (`:524-538`, pool em `autoHookPoolForIntent`) e passa como `effectiveHookType`.

---

## (a) SYSTEM PROMPT — blocos em ORDEM (flags ON)

`buildSystemPrompt` monta `prompt` string sequencialmente. Ordem real de concatenação:

| # | Bloco | Linha | Condição/flag (ON) | Conteúdo real (resumo) |
|---|---|---|---|---|
| 1 | Preâmbulo + `[DATA ATUAL]` | 1839-1841 | sempre | "Voce e o Jimmy, especialista... METODOLOGIA JIMMY STUDIO" + data BRT (`getBrazilDateString`). |
| 2 | `[REGRA ABSOLUTA - DADOS E NUMEROS]` | **1843-1856** | sempre | **Regra absoluta anti-invenção**: nunca inventar número/estatística/R$; dados só de (a) bloco Perplexity "CONTEXTO ATUALIZADO"/"INTELIGENCIA DE MERCADO" com fonte citada ou (b) contexto da marca; sem dado real ⇒ afirmação qualitativa forte; "autoridade de ARGUMENTO > número falso". |
| 3 | `[REGRA ABSOLUTA - PONTUACAO]` | 1858-1863 | sempre | Proíbe travessão e hífen-separador; hífen só em compostos ("bem-estar", "e-commerce"). Vale p/ legenda/slide/headline/CTA. |
| 4 | `[REGRA ABSOLUTA - EXPRESSOES PROIBIDAS]` | 1865-1869 | sempre | Proíbe a fôrma "Não é sobre X, é sobre Y" e variações ("Não se trata de...", "O problema não é..."). Clichê de IA. |
| 5 | `[HIERARQUIA DE PRIORIDADE]` + `[INTEGRIDADE — escreva forte SEM inventar]` | **1873-1888** | `coherenceV1` | **Hierarquia canônica**: 1º INTEGRIDADE > 2º VOZ/DNA > 3º INTENÇÃO/ESTILO > 4º ESTRUTURA/FRAMEWORK. Diz que toda instrução adiante que peça "dado/métrica/case" é subordinada ao item 1; "ESTRUTURA OBRIGATÓRIA" é guia, não fôrma (não escrever nomes de seção no texto). |
| 6 | `[VOZ DA MARCA - IMITE ESTES EXEMPLOS]` | 1893 → `buildVoiceFewShot` (1786-1807) | `dnaRich` | Few-shot de `context.approved_copy_examples` + `context.voice_samples`. "Têm PRIORIDADE sobre qualquer estilo genérico". Vazio se marca não tem exemplos. |
| 7 | `PERFIL DO CLIENTE IDEAL (ICP)` | 1894 → `buildICPContext` (1602-1690) | ICP existe | Persona, dores (com aspas), objeções, desejos, termos de busca, estágio de consciência. Usa `icpProfiles[0]`. |
| 8 | `ESTRATÉGIA DA MARCA - POSICIONAMENTO` | 1895 → `buildStrategyContext` (1693-1783) | strategy tem dados | Proposta de valor, USPs, GTM (plg/mlg/slg), zona de valor, preço, gargalo atual. |
| 9 | `ARQUÉTIPO DA MARCA - TOM DE VOZ OBRIGATÓRIO` | 1897 → `buildArchetypeInstructions` (1545-1599) | `dnaRich` + `strategy.brand_archetype` | Arquétipo primário/secundário (`BRAND_ARCHETYPES`), palavras características, objetivo emocional, gatilho de memória. Vazio se sem arquétipo. |
| 10 | **Framework & Estilo** (branch) | 1904-1972 | intent + intensidade | Ver detalhe abaixo. |
| 11 | "NAO inclua titulos de secao" | 1974-1976 | sempre | "O framework e guia interno." |
| 12 | **Regras de CANAL** | instagram 1978-2065 · meta_ads 2067-2243 · whatsapp 2246-2273 · blog 2276-2353 | `channel === X` | Ver (c) para o que DESCARTA/ADAPTA. |
| 13 | **Regras de FORMATO** | carousel 2356-2428 (+highlight 2475-2501) · article LinkedIn 2431-2472 · static 2506-2535 · post 2538-2584 | `format === X` | Limites de char, formatação visual, exemplos de caption. |
| 14 | **Bloco MARCA (dnaRich enxuto)** | **2631-2675** | `dnaRich` | Ver detalhe abaixo. Fecha com `ESTRUTURA JSON OBRIGATÓRIA` (`getJsonStructureTemplate`, `:1818`) + "Retorne APENAS JSON válido sem markdown". |
| 15 | `FRAMEWORKS:` custom | 2677 | `customFrameworks` != '' | Frameworks personalizados do usuário. |
| 16 | `PREFERÊNCIAS APRENDIDAS:` | 2679-2682 | `learnedPreferences.length` | `- [categoria] preferência`. Lista filtrada por `LEARNING_VALIDATION_ENABLED`. |
| 17 | `[CHECAGEM FINAL ... INTEGRIDADE DE DADOS]` | **2688-2696** | `integrityV2` | Releia e REMOVA todo número/fonte que não veio literal do Perplexity/contexto; "sem fonte literal = ZERO número"; inventar a fonte é tão grave quanto o número; "na dúvida, ELIMINE". |

### Detalhe do bloco 10 (Framework & Estilo) sob flags-ON

Branch em `:1904-1972`, decidido por `intent` e `intensity` (default 50):

- **`intent === 'comunicado'`** (`:1904-1905`) → `buildComunicadoStyleBlock(channel, format, style)` (`intent-prompt.ts:176-185`): neutraliza estilo, registro "informativo", proíbe "pare o scroll"/"UM insight"/"feche com CTA".
- **Guiado, `0 < intensity <= 50`** (default) (`:1906-1938`):
  - `[PRINCÍPIOS DE BOA COPY - use como inspiração, não checklist]` (`:1910-1917`): pare o scroll, UM insight, ordem/formato livres, evite estrutura óbvia.
  - `CANAL | FORMATO | ESTILO` (`:1919`).
  - `styleV2` ON (`:1921-1930`): `getStyleEssence` → `ESTILO "<label>": <intent>. Tom: <tom>.` "Use como INTENÇÃO e TOM, não estrutura."
  - Integridade duplicada **NÃO** é injetada aqui: `if (!coherenceV1)` (`:1932`) — com ambas ON, pula (integridade já veio no bloco 5). **Pegadinha importante**.
- **Estruturado, `intensity > 50`** (`:1939-1954`, ramo `coherenceV1`):
  - `CANAL | FORMATO | ESTILO` + `getStyleEssence` (`:1944-1949`) + `[ESTRUTURA — modo estruturado, use como GUIA, não como fôrma]` (`:1950-1954`).
  - **Ramo legado** (`:1955-1966`, `getFrameworkInstructions` + `getContentTypeTemplate`, framework de 5 elementos rígido): **inalcançável com `coherenceV1` ON → código morto → DESCARTA essas duas funções**.
- **Livre, `intensity === 0`** (`:1967-1971`): só o rótulo `CANAL | FORMATO | ESTILO`, sem framework.

### Detalhe do bloco 14 (MARCA dnaRich) — `:2631-2675`

Helper `ln(label, v)` (`:2632`) só emite a linha se `v` tem conteúdo (**omite vazios**, ao contrário do legado que imprimia "N/A"). Campos, em ordem: Descrição, Slogan, Missão, Valores, Produtos/Serviços, Diferenciais(USPs), Concorrentes, Tom Principal/Secundário, Guidelines de Escrita, Pilares, Keywords Primárias/Secundárias, Persona, Faixa Etária, Interesses, Dores, **Objeções da Audiência** (`audience_objections`, novo vs legado), **Crenças/Teses Centrais** (`core_beliefs`, novo), Guidelines Extras, Teses da Marca, Gatilhos Emocionais, FAQs, Anti-referências, Limites Pessoais, Detalhes Pessoais, Formatos Detalhados, Funil de Conversão. Depois:
- **Glossário** (`:2662-2668`): de `context.niche_glossary`, lista termos com `simplify:true` → "use \"<alternative>\"".
- **Inimigo em comum** (`:2669`): se `context.common_enemy`, injeta "nós vs. eles".
- **RESTRIÇÕES** (`:2670-2672`): `Proibido:` (`forbidden_topics`) + `Evitar:` (`words_to_avoid`).
- Fecha com `ESTRUTURA JSON OBRIGATÓRIA` + "Retorne APENAS JSON válido sem markdown" (`:2673`).

O bloco MARCA legado (`:2587-2628`, `if (!dnaRich)`) **NÃO roda** com `dnaRich` ON → DESCARTA. (Nota: os exemplos de copy aprovada do legado, `:2623`, já foram para `buildVoiceFewShot` no bloco 6.)

---

## (b) USER PROMPT — ordem de montagem (flags ON)

`buildUserPrompt` (`:2701-2892`), depois appends no call site.

| # | Peça | Linha | Condição/flag | Conteúdo |
|---|---|---|---|---|
| 1 | **Lead line por intenção** | 2703 → `buildContentLeadLine` (`intent-prompt.ts:153-158`) | sempre | `comunicado` ⇒ "Crie conteúdo <fmt> para INFORMAR/COMUNICAR (aviso direto, sem venda)."; senão "Crie conteúdo <fmt> com objetivo: <objective>." |
| 2 | `TEMA: <topic>` | 2704-2705 | `topic` | Senão: "Escolha tema relevante baseado nos pilares da marca." |
| 3 | **Soberania (comunicado)** | 2708-2709 → `buildSovereigntyBlock` (`intent-prompt.ts:163-170`) | `intent==='comunicado'` | "[MODO COMUNICADO — A MENSAGEM DO USUÁRIO É SOBERANA]" — proíbe arco de venda/FOMO/CTA de conversão. Vazio nas demais intenções. |
| 4 | **PERSONALIZAÇÕES** (array `custom[]`) | 2711-2761, join em 2854 | por campo | Tom (`toneLevel`, `:2712-2716`); **gancho** (`:2717-2759`, ver abaixo); `Inclua: <keywords>`; `CTA: "<customCta>"`. |
| 5 | **Profundidade do texto** | 2786-2814 | sempre | `short`/`medium`/`detailed` (default medium). Limites de char por slide (70-110 / 130-170 / ≤240) atados à fonte mínima na imagem (36/32/29px). |
| 6 | **Estrutura por intenção** (carrossel) | 2820-2827 → `buildCarouselStructureBlock(intent, slidesTarget, integrityV2)` (`intent-prompt.ts:106-120`) | format ∈ {carousel, ad_carousel, slides, presentation} | `resposta_direta` ⇒ arco dor→tensão→VIRADA→CTA (`buildSalesArcBody`, `intent-prompt.ts:81-99`) com **FOMO observável sem número** (porque `integrityV2` ON, `:82-84`); `comunicado`/`educacional` têm seus corpos próprios; demais ⇒ só contagem de slides. |
| 7 | `LEGENDA SEO 2026` | 2830-2849 | `captionLength` | Limites ~300/1000/2000 + estrutura SEO (gancho c/ keyword, CTA de compartilhamento, hashtags do nicho). |
| 8 | Emojis | 2851-2852 | `emojiLevel` | "SEM emojis" / "MUITOS emojis". |
| 9 | **PERSONALIZAÇÕES:** (join do `custom[]`) | 2854 | `custom.length` | `- item` por linha. |
| 10 | **Anti-repetição + rotação de arquétipo** | 2857-2887 | `recentHookSamples.length` | Lista as N aberturas recentes; "NÃO repita estrutura/ritmo/padrão". Se `CONTENT_ANTISAMENESS_V2` ON (`:2871-2874`): `recentArchetypes` (`opening-archetype.ts:70-77`) rotula os arquétipos usados e pede um **arquétipo ainda não usado** (pergunta/dado/cena/confissão/afirmação). |
| 11 | "Retorne APENAS JSON válido." | 2889 | sempre | Fecha o `buildUserPrompt`. |

**Gancho (peça 4, `:2717-2759`)**: `hookInstructions` descreve os 4 ganchos como **PRINCÍPIO** (não fórmula): `problema_agudo`, `contraintuitivo`, `historia_tensao`, `curiosidade_loop`, + `factual_direto` (`FACTUAL_DIRETO_HOOK` de `intent-prompt.ts:232`). `legacyMap` (`:2731-2738`) remapeia tipos antigos. Sempre acompanha "REGRA DE ANCORAGEM AO TEMA" + ANTI-PADRÕES + exemplos ancorados.

**Appends pós-`buildUserPrompt` (no call site), em ordem real:**

| Ordem | Peça | Linha | Condição |
|---|---|---|---|
| A | **Postura editorial** | 546-549 → `buildEditorialPostureBlock` (`editorial-posture.ts:76-124`) | sempre (se retorna algo) |
| B | **Briefing do calendário** | 553-556 → `buildCalendarBriefBlock` (`editorial-posture.ts:461-493`) | se `calendar_brief` | 
| C | Contexto de arquivos | 558-560 | `fileContents` |
| D | Regeneração | 562-566 | `regenerationInstructions` |
| E | Traffic variations | 570-575 → `buildTrafficVariationsPrompt` (`:2896`) | meta_ads + flag |
| F | URLs de brief rico / leitura de briefing estruturado 🎯📊📝 | 620-623 / 630-633 | brief rico / topic estruturado |
| G | Contexto Perplexity | 677-680 | pesquisa rodou |
| H | **Diretiva criativa (30%)** | 759-763 (montado), append em **779** | `intensity <= 50` e `Math.random() < 0.3` | 
| I | **Integrity tail (POR ÚLTIMO)** | 768-778 (montado), append em **779** | `integrityV2` ON |

**Integrity tail** (`:768-778`) é a **última coisa** que o modelo lê (recência): "[ÚLTIMA INSTRUÇÃO — LEIA ANTES DE ESCREVER (prioridade sobre TODO o resto)] Você NÃO recebeu nenhum bloco de pesquisa... PROIBIDO valor em R$ inventado / percentual / payback / fonte inventada... Um único número fabricado reprova o post inteiro."

> **A integridade aparece 3× de propósito**: (1) topo do system — HIERARQUIA (`:1873`), (2) fim do system — CHECAGEM FINAL (`:2688`), (3) fim do user — ÚLTIMA INSTRUÇÃO (`:768`). É prevenção por recência, não verificação pós-geração. Porte as três.

---

## (c) PORTE EDITORIAL 40.6 — MANTÉM / ADAPTA-EDITORIAL / DESCARTA

Alvo: escrever `content-prompt.ts` (schema `crm`, single-tenant, sem org_id, sem camada comercial, reusando `callLLM` de `_shared/ai.ts`).

### SYSTEM

| Bloco | Linha | Destino | Motivo |
|---|---|---|---|
| Preâmbulo "Voce e o Jimmy" | 1839 | **ADAPTA-EDITORIAL** | Trocar identidade "Jimmy Studio" por marca/persona do Estúdio Heziom (parametrizar o nome). |
| `[DATA ATUAL]` BRT | 1841 | **MANTÉM** | `getBrazilDateString` — America/Sao_Paulo já é padrão HeziomOS. |
| REGRA ABSOLUTA DADOS E NÚMEROS | 1843-1856 | **MANTÉM** | Núcleo anti-invenção; independe de tenant. |
| REGRA ABSOLUTA PONTUAÇÃO (sem travessão) | 1858-1863 | **MANTÉM** | Regra de estilo universal. |
| REGRA ABSOLUTA EXPRESSÕES PROIBIDAS | 1865-1869 | **MANTÉM** | Anti-clichê universal. |
| HIERARQUIA + INTEGRIDADE (coherenceV1) | 1873-1888 | **MANTÉM** | Espinha do motor; flag ON = sempre presente. |
| `buildVoiceFewShot` | 1786-1807 | **MANTÉM** | Lê `context.approved_copy_examples`/`voice_samples`. Garantir campos equivalentes no schema `crm.content_*`. |
| `buildICPContext` | 1602-1690 | **ADAPTA-EDITORIAL** | Mantém a lógica; mapear origem do ICP para as tabelas HeziomOS. |
| `buildStrategyContext` | 1693-1783 | **ADAPTA-EDITORIAL** | Idem — origem `brand_strategy` → tabela equivalente. |
| `buildArchetypeInstructions` | 1545-1599 | **MANTÉM** (se houver `brand_archetype`) | Depende de `BRAND_ARCHETYPES` + `strategy`. Vazio se ausente — seguro. |
| Framework/Estilo Guiado (princípios+essência) | 1904-1938 | **MANTÉM** | Caminho vivo sob flags. |
| Framework/Estilo Estruturado coerente | 1939-1954 | **MANTÉM** | Caminho vivo sob `coherenceV1`. |
| Framework legado (`getFrameworkInstructions`+`getContentTypeTemplate`) | 1955-1966 | **DESCARTA** | Código morto sob `coherenceV1` ON. Não portar as 2 funções. |
| Regras de canal **Instagram** | 1978-2065 | **ADAPTA-EDITORIAL** | Regras SEO/algoritmo 2026 são genéricas; manter. Só revisar limites de char por decisão de produto. |
| Regras de canal **Meta Ads** (`getMetaAdsFramework` + `getAudienceTemperatureInstructions` + specs) | 2067-2243 | **ADAPTA-EDITORIAL** ou **DESCARTA** | Portar só se o Estúdio Heziom fizer tráfego pago. Se escopo inicial é orgânico, DESCARTA `meta_ads` e `traffic variations` (`:570-575`, `:2896`). |
| Regras de canal **WhatsApp** | 2246-2273 | **ADAPTA-EDITORIAL** | Útil (HeziomOS tem WhatsApp), mas revisar tom. |
| Regras de canal **Blog GEO/AEO** | 2276-2353 | **ADAPTA-EDITORIAL + parametrizar** | Estrutura GEO/AEO é ótima; **mas menções "Jimmy Studio" hardcoded em `:2289, 2303-2310, 2337, 2340, 2342` = DESCARTA/parametrizar** — substituir por variável de marca (ex.: "Editora Heziom") ou remover a seção 4 (CTAs ao produto) se não fizer sentido. |
| Regras de FORMATO (carousel/article/static/post) | 2356-2584 | **MANTÉM** | Limites de char/formatação visual são agnósticos de tenant. |
| highlight_suggestions (carousel) | 2475-2501 | **MANTÉM** | Agnóstico. |
| Bloco MARCA dnaRich | 2631-2675 | **ADAPTA-EDITORIAL** | Mantém a estrutura `ln()` que omite vazios; mapear os ~30 campos de `context` para o schema `crm.content_*`. |
| Bloco MARCA legado | 2587-2628 | **DESCARTA** | Código morto sob `dnaRich` ON. |
| `getJsonStructureTemplate` | 1818 | **MANTÉM** | Define o contrato JSON de saída por formato — porta obrigatória. |
| `customFrameworks` | 2677 | **MANTÉM** (opcional) | Só se HeziomOS tiver frameworks custom por marca. |
| `PREFERÊNCIAS APRENDIDAS` + `LEARNING_VALIDATION` | 2679-2682 / 363-374 | **ADAPTA-EDITORIAL** | Manter o bloco; mapear `brand_preferences` para tabela HeziomOS. Se não houver aprendizado ainda, bloco fica vazio — seguro. |
| CHECAGEM FINAL (integrityV2) | 2688-2696 | **MANTÉM** | Flag ON = sempre. |

### USER

| Peça | Linha | Destino | Motivo |
|---|---|---|---|
| Lead line / soberania / estrutura por intenção (todo `intent-prompt.ts`) | — | **MANTÉM** | Máquina de intenção é PORTA integral (5 intenções, arco de venda, comunicado, educacional). |
| Personalizações (tom/gancho/keywords/CTA) | 2711-2761 | **MANTÉM** | Agnóstico. |
| Profundidade do texto | 2786-2814 | **MANTÉM** | Limites atados a legibilidade de imagem — agnóstico. |
| captionLength SEO | 2830-2849 | **MANTÉM** | Agnóstico. |
| Anti-repetição + arquétipo (`opening-archetype.ts`) | 2857-2887 | **MANTÉM** | Depende de `recentHookSamples` (histórico da marca) — mapear a query de histórico. |
| **Postura editorial `buildEditorialPostureBlock`** | 546-549 / `editorial-posture.ts:76-124` | **ver abaixo** | — |
| — anti-DIY / "REGRA DE OURO generate_demand" | `editorial-posture.ts:81-104` | **DESCARTA** | Lógica de prestador-de-serviço (não ensinar o cliente a fazer). Editora Heziom **vende produto** (livros), não serviço; o padrão default `service_provider`+`generate_demand` (`:41, :48`) injetaria a proibição de DIY erradamente. Descartar a golden rule OU forçar `content_intent='mixed'`/product. |
| — cabeçalho "MODELO DE NEGÓCIO E POSTURA" | `editorial-posture.ts:117-123` | **ADAPTA-EDITORIAL** | Manter o "o que a marca vende" + modelo, sem a proibição DIY. |
| `buildCalendarBriefBlock` | `editorial-posture.ts:461-493` | **MANTÉM** | Se o Estúdio tiver calendário editorial; senão retorna vazio. |
| `buildIcpBlock`/`buildAudienceBlock`/`fetchIcps` | `editorial-posture.ts` | **ADAPTA-EDITORIAL** | Usadas por calendário; mapear tabelas de ICP. |
| Diretiva criativa 30% | 759-763 | **MANTÉM** | Agnóstico. |
| Integrity tail (POR ÚLTIMO) | 768-778 | **MANTÉM** | Flag ON. Mantê-la literalmente por último no `finalUserPrompt`. |
| Traffic Variations | 570-575 / 2896 | **DESCARTA** (se orgânico) | Só se portar tráfego pago. |

### `getStyleEssence` + catálogo (`styles-catalog.ts`)

- `getStyleEssence` (`framework-instructions.ts:780-799`): com `STYLES_CANONICAL_V1` ON, resolve via `resolveCanonicalStyle` (`styles-catalog.ts:72-76`) → `{name: label, objective: intent, tom}`. **PORTA** `styles-catalog.ts` inteiro + o ramo canônico de `getStyleEssence`. **DESCARTA** o ramo legado (`:792-798`, `KNOWN_STYLE_KEYS`/template) — morto sob flag ON.
- **`getLeanBrandDNA` (`brand-dna-summary.ts`) = DESCARTA para o `content-prompt.ts` principal.** O próprio arquivo (`:7-11`) diz que `generate-content` usa o DNA **completo** (o bloco dnaRich), não o enxuto. `getLeanBrandDNA` só serve a funções secundárias (`regenerate-slot-topic`, `regenerate-slide-prompt`). Não é bloco do prompt de geração principal.

---

## Trechos load-bearing (texto exato)

- **Montagem final do user** (`index.ts:779`): `const finalUserPrompt = userPrompt + creativeDirective + integrityTail;` — a ordem importa: tail é sempre o último.
- **Assinaturas reais**:
  - `buildSystemPrompt(channel, format, style, brand, context, customFrameworks, learnedPreferences, audienceTemperature?, captionLength?, storiesCount?, strategy?, icpProfiles?, frameworkIntensity?, intent=DEFAULT_INTENT)` (`:1809`).
  - `buildUserPrompt(objective, topic?, format, toneLevel?, hookType?, requiredKeywords?, customCta?, contentLength?, emojiLevel?, captionLength?, textDepth?, recentHookSamples?, slidesCount?, intent=DEFAULT_INTENT)` (`:2701`).
  - `buildCarouselStructureBlock(intent, slidesTarget, integrityV2=false)` (`intent-prompt.ts:106`).
  - `resolveIntent(flagOn, intentFromPayload, objective)` (`intent-prompt.ts:63`).
  - `getStyleEssence(style, brandType): {name, objective, tom} | null` (`framework-instructions.ts:780`).

---

<a id="capítulo-4"></a>
> Fonte lida (repo Jimmy `triviadash-analytics`):
> - `supabase/functions/_shared/intent-prompt.ts` (267 l — cópia canônica do motor, Deno) — **zero imports** (self-contained)
> - `src/config/contentIntents.ts` (279 l — fonte de verdade do FRONTEND) — importa `STYLES, getStylesForBrandType` de `./contentChannels`
> - `supabase/functions/_shared/intent-prompt.test.ts` (249 l — deno test)
> - `supabase/functions/_shared/intent-prompt.golden.txt` (2259 bytes, 15 linhas, **sem newline final**)
> - `supabase/functions/_shared/intent-prompt.golden.gen.ts` (15 l — regravador do golden)
> - `src/config/contentIntents.test.ts` (163 l — vitest)
> - Consumo real: `supabase/functions/generate-content/index.ts` (linhas 515-542, 2141, 2703-2708, 2825-2826)

## 4.0 Mapa de arquivos → destino

| Arquivo (Jimmy) | Destino OS | Peça |
|---|---|---|
| `_shared/intent-prompt.ts` | `supabase/functions/_shared/intent-prompt.ts` | **PORTA byte-a-byte** — não tem `org_id`, não tem camada comercial, **zero imports**. Nada a mudar para single-tenant. |
| `src/config/contentIntents.ts` | front Marketing (ex.: `apps/web/src/config/contentIntents.ts`) | **PORTA** ajustando só o caminho do import `./contentChannels` (depende do capítulo de Estilos). |
| `_shared/intent-prompt.golden.txt` | `supabase/functions/_shared/intent-prompt.golden.txt` | **PORTA byte-a-byte** — preservar 2259 bytes SEM `\n` final. |
| `_shared/intent-prompt.golden.gen.ts` | idem `_shared/` | **PORTA** (regravador do fixture). |
| `_shared/intent-prompt.test.ts` | idem `_shared/` | **PORTA**, alinhando a versão do `std/assert`. |
| `src/config/contentIntents.test.ts` | front Marketing | **PORTA** (vitest; importa `OBJECTIVES` de `./contentChannels`). |

**Fato-chave de porte:** o lado Deno (`intent-prompt.ts`) e o lado front (`contentIntents.ts`) são **cópias manuais** — não há import compartilhado nem assert cross-file automatizado. O comentário `intent-prompt.ts:3-5` diz explicitamente que a paridade "é coberta por teste (STORY-132)", ou seja, por testes duplicados, não por código único. Mudar um exige mudar o outro à mão.

---

## 4.1 As 5 intenções — atributos reais (fonte: `contentIntents.ts:62-128`)

A tabela rica (label/verb/cta/…) vive **só no front** `CONTENT_INTENTS`. O motor Deno **não** carrega esses metadados — só conhece as chaves + os textos de prompt. Se a 40.5 quiser expor label/cta/etc. no backend, tem que portar o objeto `CONTENT_INTENTS` também.

| key | label | verb | structure | hookFamily | cta | research | showsAngle | showsFunnel | sovereignty |
|---|---|---|---|---|---|---|---|---|---|
| `resposta_direta` (DEFAULT) | **Vender** | Vender / converter | arco de resposta direta: gancho → dor → tensão/FOMO → virada de esperança → CTA | dor/tensão/curiosidade | `obrigatorio` | `sim` | `true` | **`true`** | `media` |
| `educacional` | **Educar** | Ensinar / agregar valor | contexto → insight central → aplicação prática (sem FOMO, sem virada de venda; produto não é clímax) | curiosidade/insight | `suave` | `sim` | `true` | `false` | `media` |
| `comunicado` | **Comunicar** | Avisar / informar | fato claro: o que muda + quando/onde + (opcional) 1 ação. Sem arco, sem gancho de dor. | factual/direto | `opcional` | **`nao`** | **`false`** | `false` | **`alta`** |
| `engajamento` | **Engajar** | Provocar conversa | pergunta/provocação/opinião que convida à conversa (CTA de conversa, não de venda) | pergunta/opinião | `conversa` | `opcional` | `true` | `false` | `media` |
| `institucional` | **Posicionar** | Conectar / posicionar | manifesto/valores/bastidores: afirmação de valor desenvolvida com exemplos reais (sem venda dura) | afirmação de valor | `suave` | `opcional` | `true` | `false` | `media` |

Tipos dos enums (`contentIntents.ts:28-30`):
- `CtaPolicy = 'obrigatorio' | 'suave' | 'opcional' | 'conversa' | 'nenhum'`
- `ResearchPolicy = 'sim' | 'nao' | 'opcional'`
- `MessageSovereignty = 'alta' | 'media'`

Invariantes travadas por `contentIntents.test.ts:28-40`: **só `resposta_direta` tem `showsFunnel=true`**; `comunicado` tem `showsAngle=false` + `research='nao'` + `sovereignty='alta'`.

Ordem de exibição no seletor (`contentIntents.ts:133-139` `INTENT_DISPLAY_ORDER`): `resposta_direta, comunicado, educacional, engajamento, institucional` (Vender = default primeiro; Comunicar destacado em 2º).

`defaultObjectiveForIntent` (`contentIntents.ts:187-196`) — preenche o `objective` (NOT NULL no banco) quando o Funil não aparece: `resposta_direta→sales`, `engajamento→engagement`, `educacional/institucional/comunicado→awareness`.

---

## 4.2 `buildCarouselStructureBlock` — como escolhe o corpo (`intent-prompt.ts:106-120`)

Assinatura real:
```ts
export function buildCarouselStructureBlock(
  intent: ContentIntentKey, slidesTarget: number, integrityV2 = false
): string
```

Header **sempre** presente (l.107):
```
QUANTIDADE EXATA DE SLIDES: ${slidesTarget} slides no total (OBRIGATÓRIO).
```

`switch (intent)` (l.108-119):

| intent | corpo | função |
|---|---|---|
| `resposta_direta` | `header + "\n" + buildSalesArcBody(slidesTarget, integrityV2)` | `intent-prompt.ts:81-99` |
| `comunicado` | `header + "\n" + buildComunicadoBody(slidesTarget)` | `intent-prompt.ts:139-147` |
| `educacional` | `header + "\n" + buildEducacionalBody(slidesTarget)` | `intent-prompt.ts:125-134` |
| `engajamento` / `institucional` (`default`) | **só o `header`** (nada além da contagem) | — |

> O comentário original da task cita `buildComunicadoBody l.128` / `buildEducacionalBody l.130`; **os endereços reais** são `buildEducacionalBody:125-134` e `buildComunicadoBody:139-147`. `engajamento`/`institucional` não têm bloco próprio — retornam **apenas** `QUANTIDADE EXATA DE SLIDES: N slides no total (OBRIGATÓRIO).` (travado por `intent-prompt.test.ts:57-62`).

### `buildSalesArcBody` (l.81-99) — arco e a chave `integrityV2`
Só `resposta_direta` injeta o arco. A **única** linha que muda com `integrityV2` é a `fomoLine` (l.82-84):

- `integrityV2 = true` (l.83): FOMO **"CONCRETO E OBSERVÁVEL … SEM número, valor em R$, percentual ou estatística a menos que haja prova REAL"**.
- `integrityV2 = false` (l.84, **legado**): FOMO **"ESPECÍFICO E CONCRETO (uma consequência real, tangível e mensurável…)"**.

Numeração derivada de `slidesTarget` (l.85-91):
- Slide 1 `cover` (gancho) · Slide 2 `content` (dor) · **Slides 3 a `${slidesTarget-2}`** `content` (FOMO) · **Slide `${slidesTarget-1}`** `content` (VIRADA) · **Slide `${slidesTarget}`** `cta`.
- Ex.: 7 slides → "Slides 3 a 5", "Slide 6 … VIRADA", "Slide 7 (type "cta")". Para 5 → "Slides 3 a 3", "Slide 4 … VIRADA", "Slide 5" (travado por `intent-prompt.test.ts:49-55`).

**Runtime vs golden (nuance crítica):** em prod `CONTENT_INTEGRITY_V2` está ON → o caller passa `integrityV2=true` (`generate-content/index.ts:2825-2826`), logo a linha viva é a **"OBSERVÁVEL / a menos que haja prova REAL"**. Mas o **golden.txt trava o texto FLAG-OFF** (contém "mensurável") — de propósito (ver §4.5). Portar os **dois** textos com fidelidade.

`buildComunicadoBody` (l.139-147): estrutura "informe com clareza, SEM arco de venda" — título informativo, fatos (o que muda/quando/onde/para quem), CTA opcional, e a linha "A MENSAGEM DO USUÁRIO É SOBERANA". `buildEducacionalBody` (l.125-134): "contexto → insight central → aplicação", gancho de curiosidade (sem dor/FOMO), "SEM 'virada de esperança'", "CTA SUAVE e opcional".

---

## 4.3 `INTENT_AUTO_HOOK_POOL` (`intent-prompt.ts:236-247`)

```ts
export const INTENT_AUTO_HOOK_POOL: Record<ContentIntentKey, string[]> = {
  resposta_direta: ['problema_agudo', 'contraintuitivo', 'historia_tensao', 'curiosidade_loop'],
  comunicado:      ['factual_direto'],
  educacional:     ['curiosidade_loop', 'contraintuitivo'],
  engajamento:     ['contraintuitivo', 'curiosidade_loop'],
  institucional:   ['historia_tensao', 'curiosidade_loop'],
};
```

| intent | pool sorteável |
|---|---|
| `resposta_direta` | `problema_agudo`, `contraintuitivo`, `historia_tensao`, `curiosidade_loop` (**= HOOK_POOL legado, 4 ganchos — não-regressão**, travado em `intent-prompt.test.ts:116-121`) |
| `comunicado` | `factual_direto` (único) |
| `educacional` | `curiosidade_loop`, `contraintuitivo` |
| `engajamento` | `contraintuitivo`, `curiosidade_loop` |
| `institucional` | `historia_tensao`, `curiosidade_loop` |

`autoHookPoolForIntent(intent)` (l.250-252) devolve `INTENT_AUTO_HOOK_POOL[intent] ?? INTENT_AUTO_HOOK_POOL.resposta_direta`.

Consumo real (`generate-content/index.ts:524-538`): quando `hookType` ausente/`'auto'` **e** `framework_intensity ≤ 50`, faz `HOOK_POOL = autoHookPoolForIntent(intent)`, aplica um viés (se ≥2 aberturas recentes contêm `?`, remove `contraintuitivo`) e sorteia (`Math.random`). `FACTUAL_DIRETO_HOOK` (l.232-233) é o texto do gancho `factual_direto`.

**Dependência de porte:** essas strings são **chaves de tipo de gancho** que precisam existir no catálogo `hookInstructions` dentro do `generate-content` do OS — senão o sorteio devolve uma chave sem instrução. `factual_direto ↔ FACTUAL_DIRETO_HOOK`.

---

## 4.4 `OBJECTIVE_TO_INTENT` + `resolveIntent` — PORTA (não DESCARTA)

Mapa legado (idêntico nos dois arquivos — `intent-prompt.ts:42-49` e `contentIntents.ts:159-169`):
```ts
sales→resposta_direta, conversion→resposta_direta, leads→resposta_direta,
launch→resposta_direta, engagement→engajamento, awareness→educacional
```

`resolveIntent(flagOn, intentFromPayload, objective)` (`intent-prompt.ts:63-71`):
1. `!flagOn` → `resposta_direta` (legado, 100% não-regressivo).
2. `flagOn` + payload válido → devolve o payload.
3. `flagOn` + payload inválido/ausente → `intentForObjective(objective)` → `OBJECTIVE_TO_INTENT` (fallback `resposta_direta`).

Chamado em `generate-content/index.ts:516`. Como **as 8 flags estão ON**, o caminho 2 domina: a **UI nova manda `intent` nativo**, então o ramo `OBJECTIVE_TO_INTENT` **quase nunca é exercitado pela UI**.

**Veredito: PORTA (mantém como safety-net dormente).** Não DESCARTA porque:
- O mapa ainda é o único fallback para **gerações disparadas por slot de calendário/payload legado sem `intent`** (comentário `contentIntents.ts:172-179`).
- Os testes de paridade (`intent-prompt.test.ts:93-100, 241-248`; `contentIntents.test.ts:58-75`) **dependem** dele. Remover quebra a suíte e a fidelidade byte-a-byte que a 40.5 exige.
- Custo zero (funções puras). Se a UI do OS sempre enviar `intent`, o mapa simplesmente fica inerte.

---

## 4.5 Mecânica dos goldens + recriação no OS

### O que o `golden.txt` captura exatamente
`golden.txt` = a saída **literal** de `buildCarouselStructureBlock('resposta_direta', 7)` com `integrityV2` no default (**`false`** → texto **FLAG-OFF**, contém "mensurável"). São **2259 bytes, 15 linhas, terminando em `de um slide.` — SEM `\n` final** (verificado por `wc -c` + `xxd`). Cobre header + arco completo (cover/dor/FOMO/virada/CTA) + regra de 2ª pessoa + guardrails de tom.

Decisão de design (`golden.gen.ts:8-10` e `intent-prompt.test.ts:1-8`): o golden trava **só** o caminho flag-OFF; a variante flag-ON (`CONTENT_INTEGRITY_V2`) é validada por **testes próprios** (`intent-prompt.test.ts:219-229`, STORY-133 CA1/CA2), **não** pelo golden. Assim "flag off = idêntico ao legado" fica garantido byte-a-byte, enquanto o comportamento vivo (flag-ON) é coberto separadamente.

### Como o `.gen.ts` regrava (`golden.gen.ts:6-14`)
```ts
import { buildCarouselStructureBlock } from './intent-prompt.ts';
const golden = buildCarouselStructureBlock('resposta_direta', 7);   // 2 args → integrityV2=false
const url = new URL('./intent-prompt.golden.txt', import.meta.url);
await Deno.writeTextFile(url, golden);                                // NÃO adiciona \n
console.log(`golden regravado (${golden.length} chars) em intent-prompt.golden.txt`);
```
Comando: `deno run --allow-read --allow-write _shared/intent-prompt.golden.gen.ts`. Roda **só** quando a mudança no arco for intencional.

### Como o teste valida (`intent-prompt.test.ts:31-36`)
```ts
const goldenUrl = new URL('./intent-prompt.golden.txt', import.meta.url);
const golden = await Deno.readTextFile(goldenUrl);        // top-level await → precisa --allow-read
Deno.test('GOLDEN — resposta_direta (7 slides) idêntico...', () => {
  assertEquals(buildCarouselStructureBlock('resposta_direta', 7), golden);
});
```
Import do assert: `https://deno.land/std@0.224.0/assert/mod.ts` (`assert`, `assertEquals`, `assertStringIncludes`). Qualquer alteração no texto do arco por 128/130/131/133 **quebra** o `assertEquals` a menos que o golden seja regravado — esse é o guard-rail de não-regressão.

O mesmo `assertEquals(..., golden)` reaparece em `intent-prompt.test.ts:187` (STORY-130 CA3) e `:214-216` (STORY-133 CA4), reforçando que educacional/comunicado/integrityV2-off **não** alteram a saída de `resposta_direta`.

### Passo-a-passo para recriar no OS (40.5)
1. **Copiar `_shared/intent-prompt.ts`** para `supabase/functions/_shared/` do OS — byte-a-byte (zero deps; sem `org_id`; manter `integrityV2 = false` no default).
2. **Copiar os 3 arquivos de golden/teste** para o mesmo `_shared/`: `intent-prompt.golden.txt`, `intent-prompt.golden.gen.ts`, `intent-prompt.test.ts`. Preservar o `golden.txt` **sem newline final** (2259 bytes). Recomendado: regravar na máquina alvo com `deno run --allow-read --allow-write _shared/intent-prompt.golden.gen.ts` para evitar qualquer diferença de EOL introduzida no copy/paste.
3. **Alinhar o import do `std/assert`** (`intent-prompt.test.ts:11-13`) à versão que o `_shared/` do OS já usa (evitar misturar versões de `std`).
4. **Copiar `src/config/contentIntents.ts` + `contentIntents.test.ts`** para o front Marketing do OS, ajustando o import `./contentChannels` (depende do capítulo de Estilos: `STYLES`, `getStylesForBrandType`, `OBJECTIVES`). O teste front roda no vitest do OS.
5. **Rodar os testes:**
   - Deno (golden): a partir de `supabase/functions/` → `deno test --allow-read _shared/intent-prompt.test.ts` (o `--allow-read` é obrigatório por causa do `Deno.readTextFile` do golden).
   - Front: o `vitest run` do OS cobre `contentIntents.test.ts`.
6. **Plugar no CI:** No Jimmy **não existe `.github/workflows/`** — os testes Deno são rodados **manualmente**; `npm test` (`package.json:12` → `vitest run`) cobre **só** o front (`contentIntents.test.ts`), **não** o golden Deno. No OS, incluir `_shared/intent-prompt.test.ts` explicitamente no passo `deno test` do CI de edge functions (o glob que já roda os testes de `supabase/functions/_shared/`), senão o guard-rail do golden fica fora da esteira.

### Pontos de wiring no `generate-content` (para o port fiel)
| Função | Chamada real (Jimmy) |
|---|---|
| `resolveIntent` | `index.ts:516` (flag `CONTENT_INTENT_V1` lida em l.515) |
| `autoHookPoolForIntent` | `index.ts:527` (dentro do sorteio de gancho, l.524-538) |
| `buildCarouselStructureBlock` | `index.ts:2826` (com `integrityV2` de `CONTENT_INTEGRITY_V2` lido em l.2825) |
| `buildAdCarouselArcBlock` | `index.ts:2141` |
| `buildContentLeadLine` | `index.ts:2703` |
| `buildSovereigntyBlock` | `index.ts:2708` |

> O **clamp de `slidesTarget` (3..10)** citado em `intent-prompt.test.ts:49` **não** está em `buildCarouselStructureBlock` — é responsabilidade do **caller** (`generate-content`). `buildCarouselStructureBlock` só interpola. Portar só o `_shared` sem replicar o clamp do caller pode gerar numeração degenerada (ex.: 3 slides → "Slides 3 a 1").

---

<a id="capítulo-5"></a>
ём# Capítulo 5 — Kit do lado HeziomOS (o que já existe para reusar)

> Repo de referência lido: `/Users/joaogabrielnovais/heziomos-wt-e40`
> Todos os caminhos abaixo são relativos a `supabase/functions/` salvo indicação. Edge Functions são Deno (`Deno.serve`), import por URL (`esm.sh`), sem bundler.

O objetivo deste capítulo é responder: **o que o dev NÃO precisa reescrever** ao portar o motor de conteúdo do Jimmy. A resposta curta: quase toda a "casca" (auth, cors, errors, validate, rate-limit, cliente de LLM com tools+cache, padrão de RPC SECURITY DEFINER, registro de verify_jwt, teste Deno) já existe e é madura. O que se porta do Jimmy é o **miolo de prompt** (blocos dnaRich/style/coherence/antisameness) e a **forma dos dados** (`content_*`). Este capítulo mapeia o KIT.

---

## 5.1 — `_shared/ai.ts` — o cliente de LLM da casa (INTEIRO)

Arquivo: `supabase/functions/_shared/ai.ts` (454 linhas). **Contém DUAS gerações de cliente** — é crítico não confundir:

### 5.1.1 Geração legada: `resolveAiProvider` + `callAiJson` / `callAiText`

- `getProviderConfig(provider, apiKey): AiConfig` (`ai.ts:9-20`) — devolve `{ apiKey, apiUrl, model }`. Todos os provedores caem no **shape OpenAI `/chat/completions`**. Note que aqui `"anthropic"` aponta para `https://ai.gateway.lovable.dev/...` com model `"anthropic/claude-3.5-sonnet"` — ou seja, **a geração legada NÃO fala com a Anthropic nativa**, vai via gateway Lovable.
- `resolveAiProvider(supabase): Promise<AiConfig | null>` (`ai.ts:23-53`) — resolve na ordem: tabela `ai_providers_config` (`is_active=true`, prioridade google→openai→anthropic) → env (`GOOGLE_AI_API_KEY`/`OPENAI_API_KEY`/`ANTHROPIC_API_KEY`) → `LOVABLE_API_KEY` (fallback gateway). Retorna `null` se nada configurado.
- `callAiJson(cfg, system, user): Promise<any>` (`ai.ts:66-83`) — pede JSON, faz `parseJsonLoose` (`ai.ts:56-63`, tolera fence ```` ```json ````). `temperature: 0.7` **hardcoded**.
- `callAiText(cfg, system, user): Promise<string>` (`ai.ts:86-102`) — devolve texto cru. `temperature: 0.7` **hardcoded**. É o que `crm-preparation-visual` usa para gerar HTML.

**Destino: DESCARTA para o caminho principal do Estúdio.** O contexto fixou "reusar callLLM". `callAiText` seria o análogo mais próximo (texto de saída), mas: (a) não tem controle de `model`, (b) não tem `cache_control`, (c) `temperature` travada em 0.7, (d) `"anthropic"` cai no gateway Lovable, não na Anthropic nativa (mata o prompt cache que o motor do Jimmy quer). Pode servir de fallback trivial, mas o motor rico vai no `callLLM`.

### 5.1.2 Geração de agente: `callLLM` (o que porta)

Assinatura real (`ai.ts:401`):

```ts
export async function callLLM(opts: LlmCallOptions): Promise<LlmResult>
```

`LlmCallOptions` (`ai.ts:156-167`):

```ts
export interface LlmCallOptions {
  provider: string;                 // "anthropic" | "openai" | "openrouter" | "lovable" | "google"
  apiKey: string;                   // resolvido pelo CHAMADOR (callLLM não resolve chave)
  model: string;                    // slug "bare" (ex.: "claude-sonnet-4-6")
  system: string | LlmBlock[];      // LlmBlock = { text: string; cache?: boolean }
  messages: LlmMessage[];
  tools?: LlmTool[];                // { name, description, input_schema } (JSON Schema)
  temperature?: number;             // opt-in; se omitido, provedor decide
  maxTokens?: number;               // DEFAULT 1024 (ai.ts:404) — ver alerta
  signal?: AbortSignal;             // ex.: AbortSignal.timeout(25000)
}
```

`LlmResult` (`ai.ts:145-154`):

```ts
export interface LlmResult {
  stopReason: "end_turn" | "tool_use" | "max_tokens" | "other";
  text: string;                     // texto concatenado dos blocos de texto
  toolUses: { id; name; input }[];  // vazio quando stopReason !== "tool_use"
  content: LlmContentBlock[];       // turno normalizado p/ empilhar no histórico
  usage: { inputTokens; outputTokens; cacheReadTokens };
}
```

**Anthropic nativo vs shape OpenAI** — o switch está em `ai.ts:406-453`:

- `provider === "anthropic"` (`ai.ts:406-429`): POST `https://api.anthropic.com/v1/messages` (const `ANTHROPIC_URL`, `ai.ts:193`), headers `x-api-key` + `anthropic-version: 2023-06-01`. `system` vai como array de text blocks via `toAnthropicSystem` (com `cache_control`). `messages` são passadas **cruas** — porque `LlmContentBlock` (text/tool_use/tool_result/image) já É o formato nativo Anthropic. Resposta normalizada por `normalizeAnthropicResponse` (`ai.ts:330-359`), que lê `usage.cache_read_input_tokens`.
- qualquer outro provider (`ai.ts:431-453`): POST em `endpointFor(provider)` (`ai.ts:201-203`, tabela `OPENAI_ENDPOINTS` em `ai.ts:194-199`), header `Authorization: Bearer`. Converte tudo: `toOpenAIMessages` (`ai.ts:248-312`, transforma tool_use→`tool_calls`, tool_result→`role:"tool"`, image→`image_url` data-URL), `toOpenAITools` + `tool_choice:"auto"`. Resposta por `normalizeOpenAIResponse` (`ai.ts:361-395`) — **`cacheReadTokens` sempre 0** (`ai.ts:392`, "shape OpenAI não expõe cache read").

**`cache_control`** — `toAnthropicSystem` (`ai.ts:214-228`): recebe blocos, filtra vazios, e marca **UM único breakpoint `{ type:"ephemeral" }` no ÚLTIMO bloco com `cache:true`**. A justificativa está no comentário (`ai.ts:207-213`): um breakpoint cacheia todo o prefixo estável, seguro dentro do limite de 4 da Anthropic. Isso é exatamente o que o motor do Jimmy precisa: pôr os blocos estáveis (dnaRich, style, guardrails) primeiro com `cache:true` e o pedido volátil por último sem cache.

**Resolução de modelo** (`ai.ts:172-191`):

```ts
export const MODEL_DEFAULTS = {
  agent: "claude-sonnet-4-6",
  specialist: "claude-haiku-4-5",
  hard: "claude-opus-4-8",
} as const;
export function resolveModel(model, role: ModelRole = "agent"): string  // vazio → default do papel
export function mapModelForProvider(model, provider): string            // openrouter prefixa "anthropic/"; anthropic remove prefixo
```

`mapModelForProvider` é chamado dentro do próprio `callLLM` (`ai.ts:403`) — o chamador passa o slug bare.

**CONFIRMADO: não há streaming.** `callLLM` faz um único `await fetch(...)` seguido de `await res.json()` (`ai.ts:418-428` e `ai.ts:443-453`); não há `stream:true`, nem leitura de `res.body` / SSE, em nenhum lugar do arquivo. Todos os 3 consumidores (§5.1.3) esperam `Promise<LlmResult>`.

**Destino: PORTA (usar como está).** O Estúdio consome `callLLM` sem modificá-lo. A única peça a replicar do lado do chamador é a **resolução de chave por provider** — não existe helper compartilhado para isso; o padrão de referência é `resolveKey(sb, provider)` em `crm-specialist-runner/index.ts:42-57` (tenta `ai_providers_config` ativo → env `OPENAI_API_KEY`/`ANTHROPIC_API_KEY`/`GOOGLE_AI_API_KEY`). Copiar essa função para a edge de conteúdo.

### 5.1.3 Consumidores atuais de `callLLM` (os 3 que não podem quebrar)

```
crm-specialist-runner/index.ts:148   const result = await callLLM({...})
crm-ai-orchestrator/index.ts:305     const result = await callLLM({...})
crm-ai-eval-corrections/index.ts:101 const answer = await callLLM({...})
crm-ai-eval-corrections/index.ts:111 const judge  = await callLLM({...})
```

(`_shared/ai-loop.ts` importa só **tipos** de `ai.ts` — `import type { LlmMessage, LlmTool }`, `ai-loop.ts:10` — não chama `callLLM`; o loop de rede `runToolLoop` vive no orchestrator.)

### 5.1.4 Proposta de `callLLMStream` opt-in (NÃO quebra os 3 consumidores)

O Estúdio gera textos longos (posts) e a UI se beneficia de stream. A regra de ouro: **não tocar na assinatura de `callLLM`**. Adicionar uma FUNÇÃO NOVA exportada ao lado, reaproveitando as conversões puras já existentes (`toAnthropicSystem`, `toOpenAIMessages`, `toAnthropicTools`, os `normalize*`). Assinatura proposta:

```ts
// _shared/ai.ts — ADITIVO. callLLM permanece intacto.
export interface LlmStreamHandlers {
  onText: (delta: string) => void;          // chunk de texto (para SSE ao browser)
  onDone?: (result: LlmResult) => void;     // resultado final reconstruído
}

/** Igual ao callLLM, mas emite deltas de texto conforme chegam.
 *  Resolve com o MESMO LlmResult (texto acumulado + usage final),
 *  para que o chamador persista igual ao caminho não-stream. */
export async function callLLMStream(
  opts: LlmCallOptions,
  handlers: LlmStreamHandlers,
): Promise<LlmResult>
```

Por que não quebra nada:
- É export novo; `callLLM` e `LlmCallOptions`/`LlmResult` ficam idênticos. Os 3 consumidores continuam compilando e rodando sem 1 caractere alterado.
- Reusa `LlmCallOptions` (mesmo `provider/apiKey/model/system/messages/tools/temperature/maxTokens/signal`) → zero conceito novo para o dev.
- Resolve com `LlmResult`: o handler de conteúdo acumula deltas, e no fim persiste via a MESMA `rpc_content_persist_geracao` que o caminho batch usaria.

Implementação (esboço, sem novas libs):
- **Anthropic** (`provider==="anthropic"`): mesmo body de `ai.ts:407-416` **+ `stream: true`**; ler `res.body` como SSE, tratar eventos `content_block_delta` (`delta.text` → `onText`), `message_delta` (`usage.output_tokens`), `message_start` (`usage.input_tokens`, `cache_read_input_tokens`); ao `message_stop`, montar `LlmResult` com `stopReason` de `mapAnthropicStop`.
- **Shape OpenAI**: body de `ai.ts:432-441` **+ `stream: true`, `stream_options:{ include_usage:true }`**; parsear linhas `data: {json}` (choices[0].delta.content → `onText`), última chunk traz `usage` (prompt/completion tokens; `cacheReadTokens=0` como no batch).
- Reaproveitar `toAnthropicSystem`/`toOpenAIMessages`/`toAnthropicTools`/`toOpenAITools` verbatim — a montagem do request é a mesma; só muda o parsing da resposta.

Nota de escopo: se o Estúdio 40.x não precisar de tool-use no stream (geração de conteúdo é texto puro), o esboço acima pode ignorar `tool_use` no caminho stream e cair de volta em `callLLM` (batch) quando `tools?.length`. Isso simplifica o parser SSE sem perder generalidade.

**Destino: ADAPTA (adicionar função nova).** Peça de trabalho do próprio épico do Estúdio, não pré-existe.

---

## 5.2 — `_shared/auth.ts` — identidade do chamador

Arquivo: `_shared/auth.ts` (52 linhas). Três helpers, todos usados no molde:

```ts
export async function requireAuth(req: Request): Promise<User | null>   // auth.ts:9-25
export function isServiceRoleCaller(req: Request): boolean               // auth.ts:32-39
export function isCronCaller(req: Request): boolean                      // auth.ts:47-52
```

- `requireAuth` valida o JWT via `supabase.auth.getUser(token)` com a **ANON key** (`auth.ts:16-19`) — a anon key é JWT válido do projeto mas `getUser` devolve `null` para ela, então acesso público é barrado. Retorna o `user` ou `null`. Comentário `auth.ts:7`: "NUNCA confiar em dados do body para identificar o usuário."
- `isServiceRoleCaller` compara o Bearer com `SUPABASE_SERVICE_ROLE_KEY` em tempo constante (`constantTimeEqual` de `crypto.ts`). Para chamadas internas função→função.
- `isCronCaller` compara header `x-cron-secret` com `CRON_SECRET`. Para pg_cron.

**Destino: PORTA.** O `crm-content-generate` é chamado pelo browser autenticado → usa `requireAuth`. Se houver uma edge de geração assíncrona disparada por cron/interna (ex.: lote), usa `isServiceRoleCaller`/`isCronCaller`.

### 5.2.1 `_shared/authz.ts` — gate por ÁREA (Marketing)

Arquivo: `_shared/authz.ts`. Espelho TS de `crm.can_manage_area`:

```ts
export type ManagedArea = "marketing" | "comercial" | "atendimento"
  | "logistica" | "financeiro" | "lideranca" | "relatorios";
export async function canManageArea(userId: string, area: ManagedArea): Promise<boolean>  // authz.ts
```

Regra (`authz.ts`): `manager/admin/owner/superadmin` → `true` para qualquer área; `coordenador` → só se `area ∈ profiles.allowed_areas`. Cria o próprio client service_role internamente (não recebe client). **Comentário forte no topo do arquivo: NUNCA usar como "é manager?" genérico nem alargar para incluir coordenador globalmente.**

O Estúdio vive na área **Marketing** (mesma de LPs e campanhas). Gate: `canManageArea(user.id, "marketing")` — idêntico ao `crm-lp-publish/index.ts:73` e `crm-campaign-send/index.ts:514`.

**Destino: PORTA.** Usar `canManageArea(user.id, "marketing")` como gate único do Estúdio.

---

## 5.3 — `_shared/errors.ts` — RFC 7807 problem+json

Arquivo: `_shared/errors.ts` (74 linhas). Todas as edges devem responder erro por aqui. Assinaturas (Story 8.13):

```ts
badRequest(message: string, headers?: Headers, reqId?: string): Response      // errors.ts:39
unauthorized(headers?: Headers, reqId?: string): Response                     // errors.ts:43 (detail fixo "Não autorizado")
forbidden(headers?: Headers, reqId?: string): Response                        // errors.ts:47 (detail fixo "Acesso negado")
notFound(message: string, headers?: Headers, reqId?: string): Response        // errors.ts:51
internalError(message: string, headers?: Headers, reqId?: string): Response   // errors.ts:55
internalErrorSafe(clientMsg: string, err: unknown, headers?, reqId?): Response // errors.ts:65
```

- Corpo: `{ type:"about:blank", title, status, detail, reqId? }`, `Content-Type: application/problem+json` (`errors.ts:20-37`).
- **`internalErrorSafe` (F-023 / CWE-209, `errors.ts:59-74`) é o que usar em erro de DB/RPC**: devolve mensagem estática segura ao cliente e LOGA o erro real server-side com reqId. Não usar `internalError(dbErr.message)` — vaza nome de tabela/coluna. Toda a `crm-lp-publish` usa `internalErrorSafe` (linhas 98, 151, 168, 190, 203, 218).
- Convenção obrigatória (regra `.claude/rules/pr-workflow.md`): `const reqId = crypto.randomUUID().slice(0, 8)` no topo do handler.

**Destino: PORTA.**

---

## 5.4 — `_shared/validate.ts` — parse + Zod

Arquivo: `_shared/validate.ts` (21 linhas):

```ts
import { z, ZodSchema } from "https://esm.sh/zod@3";
export { z };
export async function parseBody<T>(req, schema: ZodSchema<T>)
  : Promise<{ data: T } | { error: string }>   // validate.ts:4-21
```

`parseBody` faz `req.json()` + `safeParse`; em falha, concatena `path: message` de cada issue. Uso canônico: `const parsed = await parseBody(req, schema); if ("error" in parsed) return badRequest(parsed.error, cors, reqId);` (ver `crm-specialist-runner/index.ts:93-94`).

**Destino: PORTA.** Definir o schema Zod da requisição do Estúdio (ex.: `{ tipo, briefing, canal, ... }`) e passar por `parseBody`.

---

## 5.5 — `_shared/rate-limit.ts` — fixed window + failOpen

Arquivo: `_shared/rate-limit.ts` (68 linhas):

```ts
export async function checkRateLimit(
  supabase: SupabaseClient<any,any,any>,
  key: string, limit: number, windowSecs: number,
  failOpen = true,
): Promise<{ allowed: boolean; remaining: number }>            // rate-limit.ts:16-50
export function rateLimitExceeded(corsHeaders, windowSecs = 60): Response  // rate-limit.ts:53-68 (429 + Retry-After)
```

Backing: RPC `increment_rate_limit(p_key, p_window_start)` na tabela `rate_limits`. **`failOpen`**: default `true` (permite em erro de DB); para **funções de custo/IA usar `failOpen=false`** — o padrão F-025 está em `crm-preparation-visual/index.ts:41`: `checkRateLimit(supabase, key, 5, 60, false)` com comentário "geração paga; sob erro de DB o limite FECHA".

**Destino: PORTA.** O Estúdio é custo de IA → `failOpen=false`. Chave sugerida: `content-generate:${user.id}` (ou por tipo/canal). Devolver `rateLimitExceeded(cors)` quando `!allowed`.

---

## 5.6 — `_shared/cors.ts` — origens permitidas

Arquivo: `_shared/cors.ts` (36 linhas):

```ts
export function corsHeaders(origin?: string | null): Record<string,string>  // cors.ts:23-30
export const publicCorsHeaders: Record<string,string>                       // cors.ts:33-36 ("*")
```

`corsHeaders(origin)` só ecoa a origem se ela estiver na allowlist (`os.heziom.com.br`, `heziomos.netlify.app`, `hezionosdev.netlify.app`, `localhost:5173/5219` + previews `*--heziomos.netlify.app`); senão devolve a primeira (`cors.ts:1-16, 24-25`). `publicCorsHeaders` = `*`, só para webhooks públicos (Meta/Z-API).

**Destino: PORTA.** O Estúdio é chamado do app logado (`os.heziom.com.br`) → usar `corsHeaders(origin)` (NÃO `publicCorsHeaders`). Handler abre com `const origin = req.headers.get("origin"); const cors = corsHeaders(origin);`.

### 5.6.1 Auxiliares menores

- `_shared/single-tenant.ts`: `SINGLE_WORKSPACE_ID = "00000000-0000-0000-0000-000000000001"`. A plataforma é single-tenant; fallback quando o front não manda `workspace_id`. **DESCARTA/IGNORA** para o Estúdio — o contexto já fixou "single-tenant SEM org_id"; as tabelas `content_*` não precisam de coluna de workspace.
- `_shared/roles.ts`: `ATTENDING_ROLES`, `TEAM_ROLES`. Irrelevante para o Estúdio (é atendimento). **DESCARTA.**

---

## 5.7 — Tabela-resumo do KIT (PORTA / ADAPTA / DESCARTA)

| Peça | Arquivo:linha | Destino | Nota |
|---|---|---|---|
| `callLLM` (tools + cache + normalização) | `_shared/ai.ts:401` | **PORTA** | Usar sem alterar; resolver `provider/apiKey/model` no chamador |
| `resolveModel` / `MODEL_DEFAULTS` / `mapModelForProvider` | `_shared/ai.ts:172-191` | **PORTA** | Passar slug bare; default `agent`=sonnet-4-6 |
| `toAnthropicSystem` (cache_control) | `_shared/ai.ts:214-228` | **PORTA** | Blocos estáveis com `cache:true`, pedido volátil por último |
| `callAiText`/`callAiJson`/`resolveAiProvider` (legado) | `_shared/ai.ts:66-102, 23-53` | **DESCARTA** | Sem model/cache; temperature travada; `anthropic`→gateway Lovable |
| `callLLMStream` (SSE) | — | **ADAPTA** | Função NOVA aditiva; não toca em `callLLM` (§5.1.4) |
| `resolveKey(sb, provider)` | `crm-specialist-runner/index.ts:42-57` | **PORTA** (copiar) | Único jeito de alimentar `apiKey` do `callLLM` |
| `requireAuth` / `isServiceRoleCaller` / `isCronCaller` | `_shared/auth.ts:9,32,47` | **PORTA** | Browser → `requireAuth` |
| `canManageArea(uid,"marketing")` | `_shared/authz.ts` | **PORTA** | Gate de área do Estúdio |
| `badRequest/forbidden/unauthorized/notFound/internalErrorSafe` + reqId | `_shared/errors.ts` | **PORTA** | DB error → `internalErrorSafe` (F-023) |
| `parseBody` + `z` | `_shared/validate.ts:4` | **PORTA** | Schema Zod da requisição |
| `checkRateLimit(...,failOpen=false)` + `rateLimitExceeded` | `_shared/rate-limit.ts:16,53` | **PORTA** | Custo de IA → failOpen=false |
| `corsHeaders(origin)` | `_shared/cors.ts:23` | **PORTA** | App logado, não webhook |
| `SINGLE_WORKSPACE_ID` / `roles.ts` | `_shared/single-tenant.ts`, `_shared/roles.ts` | **DESCARTA** | Single-tenant sem workspace_id; roles é atendimento |

---

## 5.8 — Melhor edge para copiar como MOLDE do `crm-content-generate`

**Escolha: `crm-lp-publish/index.ts` (221 linhas).** É o molde mais fiel. Comparação das candidatas:

- **`crm-lp-publish` — VENCEDORA.** É a única que junta, em ~200 linhas legíveis, TODA a espinha que o Estúdio precisa **e na área Marketing**: `requireAuth` (`:62`) → client service_role com `{db:{schema:"crm"}}` (`:65-69`) → gate `canManageArea(user.id,"marketing")` (`:73`) → validação de body (`:77-88`) → carga de linha → **persistência via RPC** `sb.rpc("lp_commit_version", {...})` (`:143`) → resposta JSON. Usa `internalErrorSafe` em todo erro de DB e `reqId` no topo (`:50`). É literalmente o esqueleto "auth→gate area→validate→lógica→persist RPC→resposta" pedido, só faltando o passo de rate-limit e a chamada de IA.
- `crm-specialist-runner` (181 linhas): ótima **referência de `callLLM` + loop de tool + `resolveKey`** (§5.1.2), mas é função **interna** (`isServiceRoleCaller`, `:87`, `publicCorsHeaders`), sem gate por área nem rate-limit — não é o molde do handler público. Copiar dela SÓ o `resolveKey` e o padrão de montar `systemBlocks: PromptBlock[]` com `cache:true`.
- `crm-ai-orchestrator` (1410 linhas): grande demais, é o loop de atendimento; ruído.
- `crm-preparation-visual` (77 linhas): boa **referência de rate-limit `failOpen=false`** (`:41`) e de "IA gera → sobe storage → grava URL", mas usa `callAiText` (legado) e auth por capability (trainingId), não `requireAuth`+área. Copiar dela SÓ o padrão de rate-limit de custo.

### 5.8.1 Esqueleto do handler `crm-content-generate` (ordem canônica)

Combinando o molde `crm-lp-publish` + `resolveKey`/`callLLM` do `specialist-runner` + rate-limit `failOpen=false` do `preparation-visual`:

```ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { requireAuth } from "../_shared/auth.ts";
import { canManageArea } from "../_shared/authz.ts";
import { parseBody, z } from "../_shared/validate.ts";
import { checkRateLimit, rateLimitExceeded } from "../_shared/rate-limit.ts";
import { badRequest, forbidden, unauthorized, internalErrorSafe } from "../_shared/errors.ts";
import { callLLM, resolveModel, type LlmBlock } from "../_shared/ai.ts";
// resolveKey(sb, provider) copiado de crm-specialist-runner:42-57

const schema = z.object({
  tipo: z.string().min(1),            // intenção de post (CONTENT_INTENT_V1)
  briefing: z.string().min(1),
  canal: z.string().optional(),
  // ... campos do motor do Jimmy
});

Deno.serve(async (req) => {
  const reqId = crypto.randomUUID().slice(0, 8);
  const origin = req.headers.get("origin");
  const cors = corsHeaders(origin);
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });   // 1. CORS
  if (req.method !== "POST") return badRequest("Método não suportado.", cors, reqId);

  try {
    const user = await requireAuth(req);                                        // 2. AUTH
    if (!user) return unauthorized(cors, reqId);

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { db: { schema: "crm" } },
    );

    if (!(await canManageArea(user.id, "marketing"))) return forbidden(cors, reqId); // 3. GATE ÁREA

    const parsed = await parseBody(req, schema);                                 // 4. VALIDATE
    if ("error" in parsed) return badRequest(parsed.error, cors, reqId);
    const input = parsed.data;

    const rl = await checkRateLimit(sb, `content-generate:${user.id}`, 20, 60, false); // 5. RATE-LIMIT (failOpen=false)
    if (!rl.allowed) return rateLimitExceeded(cors);

    // 6. LÓGICA: resolver provider/chave + montar blocos do motor do Jimmy
    const provider = "anthropic"; // ou lido de ai_providers_config
    const apiKey = await resolveKey(sb, provider);
    if (!apiKey) return badRequest("Nenhum provedor de IA configurado.", cors, reqId);

    const system: LlmBlock[] = [
      { text: DNA_RICH_BLOCK,   cache: true },   // blocos estáveis primeiro (flag-ON)
      { text: STYLE_V2_BLOCK,   cache: true },
      { text: COHERENCE_BLOCK,  cache: true },
      { text: ANTISAMENESS_BLOCK, cache: false },// volátil por último → cache breakpoint no anterior
    ];
    const result = await callLLM({
      provider, apiKey, model: resolveModel(null, "agent"),
      system, messages: [{ role: "user", content: buildUserPrompt(input) }],
      temperature: 0.7, maxTokens: 2000,          // ⚠️ default é 1024 — subir p/ conteúdo longo
      signal: AbortSignal.timeout(25_000),
    });

    // 7. PERSIST via RPC service_role (§5.9)
    const { data: geracao, error: persistErr } = await sb.rpc("rpc_content_persist_geracao", {
      p_user: user.id, p_tipo: input.tipo, p_texto: result.text,
      p_input_tokens: result.usage.inputTokens, p_output_tokens: result.usage.outputTokens,
      p_cache_tokens: result.usage.cacheReadTokens,
    });
    if (persistErr) return internalErrorSafe("Erro ao salvar a geração.", persistErr, cors, reqId);

    // 8. RESPOSTA
    return new Response(JSON.stringify({ ok: true, id: geracao, texto: result.text }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (err) {
    return internalErrorSafe("Erro interno.", err, corsHeaders(origin), reqId);
  }
});
```

---

## 5.9 — Padrão de RPC SECURITY DEFINER da casa (para 40.5 e 40.4)

A casa **não deixa a edge escrever/ler direto nas tabelas de negócio**: a edge usa client service_role e chama uma RPC `SECURITY DEFINER` que centraliza a transação/autorização. Três exemplos reais recentes, cada um cobrindo um dos formatos que o Estúdio vai usar.

### 5.9.1 Persistência transacional (molde para `rpc_content_persist_geracao` — 40.5)

Exemplo real: **`crm.lp_commit_version`** — `supabase/migrations/20260708100000_crm_landing_pages.sql:215-255`. É o molde exato de "edge já autorizou o humano, RPC só escreve como definer":

```sql
CREATE OR REPLACE FUNCTION crm.lp_commit_version(
  p_lp_id uuid, p_design jsonb, p_html text, p_etag text, p_user uuid
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = crm, public                        -- trava search_path
AS $$
DECLARE v_version integer;
BEGIN
  SELECT COALESCE(MAX(version),0)+1 INTO v_version FROM crm.landing_page_versions WHERE lp_id = p_lp_id;
  INSERT INTO crm.landing_page_versions (...) VALUES (...);   -- insert + update
  UPDATE crm.landing_pages SET ... WHERE id = p_lp_id;        -- atômico numa RPC
  RETURN v_version;
END; $$;

COMMENT ON FUNCTION crm.lp_commit_version(...) IS 'Story 22.4: ... Chamada só pelo crm-lp-publish (service_role) ...';
REVOKE ALL ON FUNCTION crm.lp_commit_version(uuid,jsonb,text,text,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION crm.lp_commit_version(uuid,jsonb,text,text,uuid) TO service_role;
```

Pontos que a `rpc_content_persist_geracao` copia:
- `SECURITY DEFINER` + `SET search_path = crm, public` (sempre; blinda hijack de search_path).
- **REVOKE de `PUBLIC, anon, authenticated` + GRANT EXECUTE só a `service_role`** — porque quem autoriza o humano é a EDGE (`requireAuth`+`canManageArea`); a RPC é braço interno. Isso evita que um usuário `authenticated` chame a RPC direto pelo PostgREST e pule o gate de área.
- `COMMENT ON FUNCTION` documentando story + quem chama.

### 5.9.2 Gate 42501 dentro da RPC (quando a RPC é exposta a `authenticated`)

Dois padrões reais de levantar erro de permissão:

- **`crm.reassign_conversation`** — `supabase/migrations/20260714120000_crm_reassign_conversation_rpc.sql:26-78`: `SET search_path = crm`, autoriza internamente e `RAISE EXCEPTION '...' USING ERRCODE = '42501'` (`:40, :60, :65`) quando o caller não pode. Grant final: `REVOKE ALL ... FROM PUBLIC, anon; GRANT EXECUTE ... TO authenticated, service_role;` (`:77-78`).
- **`crm.rpc_estoque_kpis`** — `supabase/migrations/20260725100000_lit_estoque_posicao_rpc.sql:136-185`: `STABLE SECURITY DEFINER SET search_path = crm, lit_mirror_estoque, ...`; gate `IF NOT crm.can_read_literarius_bi() THEN RAISE insufficient_privilege USING MESSAGE = 'Acesso restrito à liderança.'` (`:148-150`) — `insufficient_privilege` é o SQLSTATE 42501; `REVOKE ... FROM PUBLIC, anon; GRANT EXECUTE ... TO authenticated, service_role;` (`:184-185`).

### 5.9.3 Leitura agregada (molde para `rpc_content_busca_catalogo` — 40.4)

`rpc_estoque_kpis`/`rpc_estoque_posicao` (`20260725100000_lit_estoque_posicao_rpc.sql`) são o molde de "read RPC" da casa: `STABLE SECURITY DEFINER`, `SET search_path`, gate por papel dentro (42501), `RETURNS jsonb` com tudo agregado no banco (`jsonb_build_object`), e a **view interna sem grant a `authenticated`** (`:129` `REVOKE ALL ON ... v_estoque_posicao FROM PUBLIC, anon, authenticated`) — acesso só via RPC gateada.

Duas opções para `rpc_content_busca_catalogo`, conforme quem chama:
- Se chamada só pela **edge** (service_role) após gate na edge: seguir §5.9.1 — `GRANT EXECUTE ... TO service_role` apenas.
- Se chamada **direto do browser** (`authenticated`, via `supabase.rpc()` no front): seguir §5.9.2 — gate `canManageArea`-equivalente em SQL + `RAISE ... 42501` + `GRANT EXECUTE ... TO authenticated, service_role`. (Não há helper SQL `can_manage_marketing` pronto; existe `crm.can_manage_area(uid, area)` — o espelho do `authz.ts` — usar esse.)

**Destino 40.5: PORTA o padrão `lp_commit_version` (service_role only). Destino 40.4: PORTA o padrão read-RPC `rpc_estoque_*`** (escolher grant conforme o chamador).

### 5.9.4 Convenção de arquivo de migration

`CLAUDE.md` (seção "Migrations — convenção"): **nome por timestamp** `supabase migration new <slug>` → `AAAAMMDDHHMMSS_slug.sql`. **Nunca** prefixo numérico de 4 dígitos (o job CI "Migration versions" reprova PR com prefixo duplicado). Toda migration **idempotente** (`CREATE OR REPLACE`, `IF NOT EXISTS`, `DROP ... IF EXISTS`) porque o `db push` roda automático no merge para `main`. Tabelas `content_*` vão no schema **`crm`** (já listado em `config.toml:7`).

---

## 5.10 — Registro no `config.toml` (`verify_jwt`)

Arquivo: `supabase/config.toml` (360 linhas). O bloco `[api].schemas` (`config.toml:7`) já inclui `crm` (e outros) — nada a fazer no schema. Cada edge tem uma seção `[functions.<nome>]` com `verify_jwt` + comentário explicando a decisão. Exemplos que servem de guia direto:

- **Chamada pelo browser autenticado → `verify_jwt = true`**: `crm-lp-publish` (`config.toml:191-192`, comentário "publish = SÓ usuário logado; papel manager+ checado na função"), `crm-atendimento-metrics` (`:47-50`), `crm-meta-wa-audit` (`:308-311`).
- **Cron/interna sem JWT → `verify_jwt = false`**: `crm-ai-orchestrator` (`:97-98`), `crm-evolution-history-import` (`:42-46`).

Para o Estúdio:
- `crm-content-generate` é browser autenticado → **`verify_jwt = true`** (ou omitir, pois o default do gateway já é true — mas **adicionar explicitamente** ao `config.toml`: o fix de config-drift da auditoria 22/06, `config.toml:282-285`, tornou o arquivo source-of-truth; funções ausentes foram acusadas). Ex.:

```toml
[functions.crm-content-generate]
# Estúdio de Conteúdo (Epic 40): chamada pelo browser (usuário autenticado) →
# verify_jwt=true + gate canManageArea('marketing'); geração via callLLM (service_role client).
verify_jwt = true
```

- Se houver edge interna de lote/worker do Estúdio disparada por cron → `verify_jwt = false` + auth interna (`isCronCaller || isServiceRoleCaller`), como `crm-campaign-worker` (`:123-127`).

**Reference operacional** (memória do repo): edge pública sem JWT que ESQUECE `verify_jwt=false` leva a 401 no gateway ANTES do handler (falha silenciosa) — já quebrou o `tray-sync` e o cron do `crm-tray-sync-products` ("descoberto ao vivo em 04/07", `config.toml:264-266`). Como o `crm-content-generate` é `verify_jwt=true`, não corre esse risco; a atenção é para eventuais workers cron.

**Destino: PORTA o padrão** (adicionar a seção `[functions.crm-content-generate]`).

---

## 5.11 — Padrão de teste Deno (arquivo de referência)

Convenção: teste ao lado do código, sufixo **`_test.ts`**, `Deno.test(...)`, asserts de `https://deno.land/std@0.224.0/assert/mod.ts`. Comando: `deno test <arquivo>` (documentado no cabeçalho dos próprios testes) e `deno check supabase/functions/*/index.ts` no checklist de PR (`.claude/rules/pr-workflow.md`).

Arquivo de referência ideal: **`supabase/functions/_shared/ai_test.ts`** (197 linhas). Testa as **transformações puras** de `ai.ts` sem rede: `resolveModel`/`mapModelForProvider` (`ai_test.ts:20-34`), `toAnthropicSystem` incl. o breakpoint de cache (`:37-65`), `toOpenAIMessages` tool_use/tool_result (`:100-132`), `normalizeAnthropicResponse`/`normalizeOpenAIResponse` incl. usage e `_raw` de arguments quebrado (`:135-197`). Cabeçalho (`ai_test.ts:1-3`) dá o comando: `deno test supabase/functions/_shared/ai_test.ts`.

**Lição para o Estúdio**: testar as peças puras do motor (montagem de blocos de prompt dnaRich/style, parsing de saída, dedupe/antisameness) num `crm-content-generate/*_test.ts` ou `_shared/content-*_test.ts`, isolando de `callLLM` (rede) — exatamente como `ai_test.ts` isola `callLLM` testando só `toAnthropicSystem`/`normalize*`. Outros exemplos de teste puro no repo: `prompt-builder_test.ts` (158 linhas), `catalog-tool_test.ts` (44), `roles_test.ts` (30).

**Destino: PORTA a convenção** (`_test.ts` + `Deno.test` + std assert), espelhando `ai_test.ts`.

---

## 5.12 — O que NÃO existe do lado HeziomOS (o dev precisa criar)

- **Nenhuma** função `crm-content-*`, tabela `content_*`, RPC `rpc_content_*`, nem migration com `estudio`/`content_geracao` no repo (busca em §exploração retornou vazio). O Estúdio é greenfield sobre o KIT acima.
- **Não há helper compartilhado** que resolva provider+apiKey para `callLLM`; copiar `resolveKey` de `crm-specialist-runner/index.ts:42-57`.
- **Não há streaming** em `_shared/ai.ts` — `callLLMStream` (§5.1.4) é peça nova.
- Os **blocos de prompt do motor** (dnaRich enxuto flag-ON, StyleV2, PromptCoherenceV1, AntiSameness V2, guardrails de No-Invention) são o que vem do Jimmy — o HeziomOS não tem equivalente; o mais próximo é `_shared/prompt-builder.ts` (do agente de atendimento), que serve de **referência de forma** (`PromptBlock[]` com `cache`, `renderCorrectionsBlock`) mas não de conteúdo.

**Destino do miolo do Jimmy: ADAPTA** — texto dos blocos e forma dos dados portam; a casca (auth/cors/errors/validate/rate-limit/callLLM/RPC/config/test) já está pronta e é PORTA.

---

<a id="capítulo-6"></a>
> **Escopo deste capítulo.** Mapa-mestre para implementar o Estúdio de Conteúdo no HeziomOS portando o motor do Jimmy. Cruza as 18 stories do E40 (`/Users/joaogabrielnovais/heziomos-wt-e40/docs/stories/active/40.*.story.md`) + 4 do E42 (`42.*`) com o código-fonte real em `/Users/joaogabrielnovais/Documents/Obsidian/Github/triviadash-analytics`. Todos os `arquivo:linha` foram lidos e conferidos (11/07). Alvo no OS = worktree `heziomos-wt-e40`. Premissas fixas (não rediscutidas): single-tenant sem `org_id`, sem camada comercial (quota/créditos/planos), reuso de `_shared/ai.ts` (`callLLM`), **as 8 flags do motor estão TODAS `on` em prod** → documenta-se só o caminho flag-ON.

---

## 6.1 — Convenção de destino

| Marca | Significado |
|---|---|
| **PORTA** | Traz ~igual (adaptar só imports/tipos). Fidelidade provada por golden test. |
| **ADAPTA** | Traz mudando X explícito (auth, persistência, provider, remoção de andaime SaaS). |
| **DESCARTA** | Não vem no v1 — motivo declarado (fora de escopo / camada comercial / learning loop / fase 2). |
| **REUSA** | Já existe no OS — não portar, só consumir. |

Base de linhas (medido por `wc -l`, 11/07): `generate-content/index.ts` = **3.130** linhas / 148KB; `generate-image/index.ts` = **2.238**; `generate-image-prompt/index.ts` = **3.127**.

---

## 6.2 — INVENTÁRIO A: motor de TEXTO — `_shared/` do Jimmy

| Arquivo (Jimmy) | ~Linhas | Destino | Alvo no OS | Story | Notas de porte (arquivo:linha reais) |
|---|---|---|---|---|---|
| `_shared/anthropic.ts` | 414 | **DESCARTA** | — (usa `_shared/ai.ts`) | 40.1 decide; 40.5 consome | Transport OpenRouter puro: `OPENROUTER_URL` l.67, `callClaude` l.129, `callClaudeStream` l.191 (`ReadableStream<Uint8Array>`), `parseClaudeStream` l.357. `CLAUDE_MODELS` l.58-62: `SONNET_4_6`/`SONNET_4_5`/`SONNET_4` **todos** = `'anthropic/claude-sonnet-4'` (rótulo "4.6" é fake). Substituído por `callLLM` (`ai.ts:401`) + `MODEL_DEFAULTS` (`ai.ts:172-176`: agent `claude-sonnet-4-6`, specialist `claude-haiku-4-5`, hard `claude-opus-4-8`). `ai.ts` tem `toAnthropicSystem` l.214 c/ `cache_control` (prompt caching p/ o system grande e estável). |
| `_shared/intent-prompt.ts` | 267 | **PORTA** | `supabase/functions/_shared/content-intent.ts` | **40.5/CA3** | Núcleo das 5 intenções. Exports: `resolveIntent` l.63, `buildCarouselStructureBlock` l.106 (escolhe corpo por intenção), `buildSalesArcBody` l.81 (só resposta_direta, FOMO observável), `buildEducacionalBody` l.125, `buildComunicadoBody` l.139, `buildSovereigntyBlock` l.163, `buildContentLeadLine` l.153, `INTENT_AUTO_HOOK_POOL` l.236, `autoHookPoolForIntent` l.250. **Remover ao portar:** `OBJECTIVE_TO_INTENT` l.42 + `intentForObjective` l.52 (a UI nova já fala intenção nativa). Flag-ON: `resolveIntent` sem branch de flag. |
| `_shared/opening-archetype.ts` | 77 | **PORTA** | `_shared/opening-archetype.ts` | **40.7/CA4** | Anti-mesmice. `classifyOpening` l.38 (determinístico: pergunta/dado/cena/confissão/afirmação), `ALL_ARCHETYPES` l.26, `ARCHETYPE_LABEL` l.17, `recentArchetypes` l.70. Tem `opening-archetype.test.ts` (portar junto). |
| `_shared/perplexity.ts` | 194 | **PORTA (atrás de toggle)** | `_shared/perplexity.ts` | **40.9** | `searchWithPerplexity` l.28 (`model: 'sonar'|'sonar-pro'|'sonar-deep-research'`, `search_domain_filter` l.68), `formatPerplexityForPrompt` l.118. No Jimmy é obrigatória; no OS vira `pesquisa:true` default OFF. Via OpenRouter (mesma `OPENROUTER_API_KEY`). Add timeout 10s (40.9/CA6). |
| `_shared/brand-dna-summary.ts` | 59 | **ADAPTA** | dentro de `_shared/content-prompt.ts` | **40.6** (bloco VOZ) | `getLeanBrandDNA` l.37 — usado no `captionOnly` do fonte. No OS o caption vira `formato:'legenda'` (40.5 gotcha), reusa o DNA enxuto. Vira helper do bloco VOZ. |
| `_shared/styles-catalog.ts` | 104 | **ADAPTA (avaliar)** | `_shared/content-prompt.ts` (bloco estilo) | **40.6** | `CANONICAL_STYLES` l.29 (`STYLES_CANONICAL_V1=on`), `resolveCanonicalStyle` l.72, `stylesForIntent` l.81, `avoidStylesForIntent` l.95. Taxonomia genérica de SaaS; manter só se o form 40.8 mantiver campo "estilo" secundário à intenção — senão DESCARTA. Decidir na 40.6. |
| `_shared/editorial-posture.ts` | 493 | **DESCARTA** | — | **40.6** (remoção explícita) | Anti-DIY para prestador de serviço — irrelevante p/ editora. Tem `editorial-posture.test.ts` (8.4KB) que morre junto. CA3 da 40.6 exige grep-zero de "editorial_posture" no bundle. |
| `_shared/ai-gateway.ts` | 220 | **ADAPTA** | transporte de imagem (40.12) | **40.11/40.12** | `callAI` l.41, `callAIRaw` l.217. OpenRouter primário + **fallback Lovable** (`LOVABLE_API_KEY`, l.44/48) só em 429/503. Porte de imagem **DESCARTA o fallback Lovable** (decisão 40.11). Usa `openrouter-provider.ts`. |
| `_shared/openrouter-provider.ts` | 123 | **ADAPTA** | helper do catálogo de imagem | **40.11/40.12** | `providerForModel`, `isGoogleImageModel` (importados por `ai-gateway.ts:11`). Reaproveitável no adaptador plugável de imagem. |
| `_shared/creative-diversity.ts` | 92 | **DESCARTA** | — | — | Diversidade de **criativos de anúncio Meta** (edge `creative-diversity`), não do motor de conteúdo. A "diretiva criativa 30%" do conteúdo é inline em `generate-content/index.ts:750-763`, não neste arquivo. |
| `_shared/search-query-builder.ts` | 138 | **ADAPTA (só se preciso)** | dentro de 40.9 | 40.9 | Constrói query de pesquisa; verificar se `searchWithPerplexity` depende. Portar só o mínimo que a pesquisa usa. |
| `_shared/editorial-render.ts` | 373 | **DESCARTA** | — | fase 2 | Composição server-side de arte de carrossel (`compose-editorial*`). 40.12 marca composição como fase 2. |
| `_shared/editorial-spec.ts` | 446 | **DESCARTA** | — | fase 2 | Idem — spec do carrossel editorial. Tem `editorial-spec.test.ts` + `editorial-audience.test.ts`. |
| `_shared/brand-learning.ts` | 268 | **DESCARTA** | — | OUT v1 | Loop de aprendizado (`brand_preferences`). `LEARNING_VALIDATION_ENABLED=on` no Jimmy mas o loop é OUT do porte (sem impacto). |
| `_shared/learning-llm.ts` | 137 | **DESCARTA** | — | OUT v1 | Idem loop de aprendizado. |
| `_shared/preference-analyzers.ts` | 353 | **DESCARTA** | — | OUT v1 | Idem. |
| `intent-prompt.golden.txt` / `intent-prompt.test.ts` / `intent-prompt.golden.gen.ts` | 2.3KB / 12.2KB / 0.8KB | **ADAPTA** | `_shared/*.test.ts` + goldens do OS | **40.1/CA5 → 40.5/CA3** | Estratégia de fidelidade: goldens capturam o prompt COMPLETO montado por intenção com dados fixos TESTE_INTERNO. Regravação só via script dedicado (portar `.golden.gen.ts`). Rodam no `deno test` do CI. |

---

## 6.3 — INVENTÁRIO B: `generate-content/index.ts` (3.130) — blocos in-file

O grosso da adaptação da 40.5/40.6/40.7 vive DENTRO deste arquivo (não em `_shared/`). Mapa dos pontos de porte:

| Bloco / função (index.ts) | Linha | Destino | Story | Adaptação |
|---|---|---|---|---|
| Auth `supabase.auth.getUser()` | l.42-55 | ADAPTA | 40.5/CA1 | → `_shared/auth.ts` (OS) + gate `can_manage_area('marketing')` (substitui org-lookup l.57-65). |
| Quota `can_generate_content` → 402 | l.68-77 | **DESCARTA** | 40.5 (decisão D) | Removido. Substituído por rate-limit técnico `_shared/rate-limit.ts` `failOpen:false` (~30/h). |
| Zod payload | l.81-117 / l.310-328 | ADAPTA | 40.5/CA2 | Schema novo `{brandId, launchId?, canal, formato, intencao, ...}`. |
| Contexto paralelo + `mergeContextWithStrategy` | l.361-406 / **l.910-974** | **DESCARTA (merge) / ADAPTA (fetch)** | 40.6 | 2 SELECTs: `content_brands` (voz) + `content_launches` (público). SEM merge Strategy×Context. |
| Anti-repetição (5 aberturas) | l.484-510 | PORTA | 40.5#5 / 40.7/CA4 | Lê `content_posts` por `brand_id`. |
| Sorteio de gancho backend (viés anti-"?") | l.519-538 | PORTA | 40.7 | Usa `INTENT_AUTO_HOOK_POOL`. No OS `crypto.getRandomValues`. |
| Pesquisa Perplexity | l.577-693 (skip comunicado l.605-612) | ADAPTA (toggle) | 40.9 | Default OFF. |
| Temperatura por modo | l.744-746 | PORTA | 40.5#9 | Livre 0.75 / Guiado 0.85 / Estruturado 0.65. maxTokens 4096 (8192 blog, l.734). |
| Diretiva criativa 30% | l.750-763 | PORTA | 40.7/CA4 | `crypto.getRandomValues` na edge. |
| **Integrity tail** (`finalUserPrompt = userPrompt + creativeDirective + integrityTail`) | **l.765-779** | PORTA | **40.7/CA1** | Recência: tail é a ÚLTIMA concatenação. Invariante coberta por teste. |
| `callClaudeStream` | l.782 | ADAPTA | 40.1/40.5/CA8 | Provider/streaming decididos na 40.1. |
| `buildSystemPrompt` (ordem v4.0) | l.1809 / l.1830-1837 | ADAPTA | 40.6/CA1 | Espinha v4.0 preservada, recheio editorial. |
| `[REGRA ABSOLUTA - DADOS E NUMEROS]` | l.1843-1856 | PORTA | 40.7/CA1 | Camada 1. |
| `[HIERARQUIA]` + `[INTEGRIDADE]` | l.1873-1888 | PORTA | 40.7/CA1 | Camada 2. |
| `[CHECAGEM FINAL]` no fim do system | l.2688-2696 | PORTA | 40.7/CA1 | Defesa em profundidade. |
| `buildUserPrompt` | l.2701 | ADAPTA | 40.6/CA1 | Bloco público/assunto por lançamento. |
| Injeção 5 aberturas + proibição de repetir | l.2857-2867 | PORTA | 40.7/CA4 | Anti-mesmice STORY-084. |
| Blog hardcoded "Jimmy Studio" | l.2279-2352 | **DESCARTA/ADAPTA** | 40.6 | Parametrizar pela marca emissora. |
| `BRAND_ARCHETYPES` (12 arquétipos) | **l.1376-1527** | PORTA | **40.3/CA3** | → `apps/web/src/features/marketing/lib/archetypes.ts` + cópia em `_shared/` da edge. |
| `productLinksBlock` (referência p/ Helena) | l.1013-1047 | (referência) | 40.15 | Molde do bloco derivado ao vivo. |
| `framework-instructions.ts` (arquivo irmão) | **1.169** linhas | **DESCARTA** | 40.6 | `framework_intensity` 0/50/100 + frameworks custom por upload — OUT v1. |

---

## 6.4 — INVENTÁRIO C: motor de IMAGEM (edges + irmãs)

| Arquivo (Jimmy) | ~Linhas | Destino | Alvo no OS | Story | Notas |
|---|---|---|---|---|---|
| `generate-image/index.ts` | 2.238 | **ADAPTA** | `supabase/functions/crm-content-image/index.ts` | **40.12** | Remove créditos (`reserve_image_credit`/`finalize_image_credit`, decisão D). Preserva: tradução ajustes PT→EN (modelo barato) → geração background `EdgeRuntime.waitUntil` → draft `content_image_drafts` → upload Storage → status. Pontuação da melhor imagem (`generate-2-e-pontua`, l.226-283 do fonte) avaliada no bench 40.11. Regras de tipografia proporcional (cap-height %) mantidas (validadas em prod). |
| `_shared/image-model-config.ts` | 20 | **DESCARTA** | `_shared/image-models.ts` (catálogo novo) | **40.11/40.12** | Modelo FIXO `google/gemini-3-pro-image-preview` (`DEFAULT_IMAGE_MODEL`), override removido abr/2026. Substituído por catálogo plugável (id/provider/rótulo/custo/default por uso). |
| `generate-image-prompt/index.ts` | 3.127 | **ADAPTA-parcial / DESCARTA v1** | trecho em 40.13/CA2 | 40.13 | Constrói `content_visual_plan` multi-slide (OUT v1 — fase 2, 40.12). Extrair só o "prompt sugerido a partir do texto do slide" p/ 40.13/CA2; o resto DESCARTA. |
| `regenerate-slide-prompt/index.ts` | 430 | **DESCARTA** | — | fase 2 | Regenera prompt de slide do visual plan. |
| `generate-blog-cover/index.ts` | 280 | **DESCARTA** | — | fase 2 | Capa de blog (canal blog é secundário no v1). |
| `generate-style-example/index.ts` | 273 | **DESCARTA** | — | — | Exemplo visual de estilo (feature do onboarding SaaS). |
| `generate-demo-image/index.ts` | 379 | **DESCARTA** | — | — | Demo/trial. |
| `compose-editorial/index.ts` | 53 | **DESCARTA** | — | fase 2 (40.12 OUT) | Composição server-side de arte final. |
| `compose-editorial-carousel/index.ts` | 174 | **DESCARTA** | — | fase 2 (40.12 OUT) | Idem carrossel. |
| `analyze-content-edit/index.ts` | 381 | **DESCARTA** | — | OUT (learning) | Analisa edições p/ aprendizado. |
| `correct-grammar/index.ts` | 192 | **DESCARTA (v1)** | — | fase 2 | Utilitário de edição — avaliar na fase 2. |
| `suggest-topics/index.ts` | 405 | **DESCARTA (v1)** | — | 40.10/40.17 | Sugestão de pauta por IA. 40.10/CA3 é criação em lote pragmática (sem IA); 40.17 é pauta data-driven por RPC própria (não esta edge). |
| `generate-calendar/index.ts` | 1.275 | **DESCARTA (v1)** | — | 40.10 | Geração de calendário por IA. 40.10 usa criação em lote determinística. |

---

## 6.5 — INVENTÁRIO D: front-end (Jimmy `src/`)

| Arquivo (Jimmy) | ~Linhas | Destino | Alvo no OS (`apps/web/src/`) | Story | Notas |
|---|---|---|---|---|---|
| `src/config/contentIntents.ts` | 278 | **PORTA** | `features/marketing/config/content-intents.ts` | **40.5/CA4 + 40.8** | `CONTENT_INTENTS` l.62 (5 chaves), interface `ContentIntent` l.32 (`label/verb/hookFamily/cta/research/showsAngle/showsFunnel/sovereignty`). Teste de paridade front↔edge (como `contentIntents.test.ts`). |
| `src/components/agencia/ContentForm.tsx` | 1.321 | **ADAPTA** | `features/marketing/.../ContentForm.tsx` | **40.8** | UX STORY-131: intenção é a 1ª escolha e reorganiza o form. **Mudança estrutural:** começa por marca → lançamento (novo eixo). Sub-componentes: `ContentFormVariations.tsx`, `ContentFormFormats.tsx`, `ContentFormAdvanced.tsx` (ADAPTA-parcial). |
| `src/hooks/useContentGeneration.ts` | 958 | **ADAPTA** | `features/marketing/hooks/use-content-generate.ts` | **40.8** | **Persistência migra p/ a edge** (40.5). No fonte o FRONT grava: `.insert` l.289/658/801/904, com **bug `generation_model:'google/gemini-2.5-flash'` hardcoded l.668/811** (40.5/CA7 corrige). Consumo SSE l.402-452 (`getReader`/`reader.read`) → depende da decisão de streaming 40.1. Portar `validateContentStructure`+`enforceInstagramLimits` → **servidor** (40.5/CA6). |
| `src/hooks/useImageGeneration.ts` | 593 | **ADAPTA** | `features/marketing/hooks/use-content-images.ts` | **40.13** | `pollForDraftCompletion` l.26 (polling do draft, backoff, resiliência). Remove créditos. **Gotcha:** o fonte faz poll por `status='completed'`/`'failed'` (l.53/58) — o DDL da 40.2 usa `'pronto'`/`'falhou'`: alinhar enum. |
| `src/pages/agencia/GerarConteudo.tsx` | 319 | **ADAPTA** | rota `_crm.estudio.gerar.tsx` | 40.8 | Página host do form. |
| `src/pages/agencia/ConteudoDetalhe.tsx` | 173 | **ADAPTA** | detalhe do post | 40.8/CA6 | Editor Tiptap + versões → `content_post_versions` (origem `edicao`). |
| `src/pages/agencia/BrandHub.tsx` | 183 | **ADAPTA** | página "Marcas" | **40.3** | Enxugado: sem campos de público (foram p/ lançamento), sem multi-org, sem quota `can_add_brand`. |
| `src/components/agencia/BrandContextForm.tsx` | **1.438** (caminho real difere da story: fica em `agencia/`, não em `brand-hub/`) | **ADAPTA** | ficha da marca (40.3) | 40.3/CA3 | Achata os 25+ campos em `content_brands`. Sub-dir `brand-hub/` tem só header/cards/sheet/progressCalculators. |

---

## 6.6 — INVENTÁRIO E: OS já tem (REUSA — não portar)

| Arquivo/objeto no OS | Uso | Story |
|---|---|---|
| `supabase/functions/_shared/ai.ts` (`callLLM` l.401, `MODEL_DEFAULTS` l.172, `resolveModel` l.181, `mapModelForProvider` l.187, `toAnthropicSystem` l.214 c/ `cache_control`) | Provider do motor | 40.1 (ADR) → 40.5 |
| `_shared/auth.ts`, `_shared/errors.ts` (RFC 7807), `_shared/rate-limit.ts`, `_shared/cors.ts` | Casca das edges novas | 40.5 / 40.12 |
| `_shared/email-layout.ts` (`wrapEmailLayout` l.34; **`isFullDocument` l.16 NÃO exportado**) | Validação do canal email | 40.5/CA11 · 40.16 |
| `_shared/catalog-tool.ts` | Refactor de FATOS compartilhados (`brand-facts.ts`) c/ a Helena | 40.6 (task) |
| `crm-ai-orchestrator/index.ts` (bloco derivado ao vivo, `resolve_conversation_kb`) | Injeção do bloco de lançamento | 40.15 |
| `config.toml` linha 7 (`schemas=[...,'editorial',...]`) | `editorial` **já exposto** no PostgREST | **42.1/CA2** (Opção A já viável — client lê/escreve direto sob RLS) |
| `crm.update_updated_at_column()`, `crm.can_manage_area`, `crm.is_manager_or_admin`, `build_segment_where` | Fundação de RLS/segmento | 40.2 / 42.1 / 40.16 |

---

## 6.7 — SEQUÊNCIA DE IMPLEMENTAÇÃO (grafo de dependências)

### Pré-requisitos externos (antes de tocar código do épico)

1. **Merge do PR #364 (E29+E31) ANTES da 40.2** — conflito certo em `migrations/` e `nav.ts`. Fixa o piso de timestamp das migrations em **> 20260727110000**. Sem ele, também ficam bloqueados os CAs opcionais 40.10/CA9 (feiras `exposicoes_feira`) e 40.17 (posição de estoque E31).
2. **E42 42.1 + 42.2 ANTES da 40.4** — a Ficha Mestre (`editorial.livros_ficha`) alimenta o pre-fill de público/sinopse/tese do lançamento (42.3 roda em par com 40.4). 42.1 não depende de código (base = main) → pode começar já.

### Grafo (→ = bloqueia)

```
[#364 merge] ─┐
              ├─► 40.2 (migração content_*) ─► 40.3 (Marcas)
              │                              ├─► 40.4 (Lançamentos) ◄── 42.1 ─► 42.2 ─► 42.3
              │                              ├─► 40.5 (edge generate) ◄── 40.1 (ADR provider/stream/golden)
              │                              │        ├─► 40.6 (prompt editorial) ─► 40.7 (guardrails)
              │                              │        ├─► 40.8 (UI form/preview) ◄── 40.3,40.4
              │                              │        ├─► 40.9 (Perplexity toggle)
              │                              │        └─► 40.10 (calendário) ◄── 40.8
              │                              ├─► 40.15 (ponte Helena) ◄── 40.4
              │                              ├─► 40.16 (post→campanha) ◄── 40.5,40.8,40.10
              │                              ├─► 40.17 (pauta data-driven) ◄── 40.4,#364/E31
              │                              └─► 40.18 (LP do lançamento) ◄── 40.4,E42,E22
[40.1 ADR] ──► 40.5, 40.6, 40.7, 40.9
[40.11 ADR imagem] ─► 40.12 (edge imagem) ─► 40.13 (UI imagem) ◄── 40.8
TODAS (40.1–40.13) ──► 40.14 (security gate + PR do épico)
```

### Caminho crítico (a espinha que produz o 1º post)

`#364 → 40.1 → 40.2 → 40.5 → 40.6 → 40.7 → 40.8` (com 40.3+40.4 alimentando 40.8).
40.1 e 40.2 podem correr em paralelo (40.1 é spike sem código de prod; 40.2 é migração). 40.5 precisa dos dois.

### O que paraleliza (2–3 frentes)

- **Frente TEXTO (crítica):** 40.1 ‖ 40.2 → 40.5 → 40.6 → 40.7; UI 40.3/40.4/40.8 em paralelo assim que 40.2 fecha.
- **Frente IMAGEM (independente do texto):** 40.11 (ADR/bench, começa no dia 1 sem depender de nada) → 40.12 → 40.13 (só 40.13 depende de 40.8 p/ ancorar no detalhe do post).
- **Frente FICHA (E42):** 42.1 (dia 1, base main) → 42.2 → 42.3 (junto de 40.4).
- **Frente INTEGRAÇÕES (após o motor de pé):** 40.15 (Helena), 40.16 (campanha email), 40.17 (pauta), 40.18 (LP) — todas dependem de 40.4 e/ou 40.5/40.8, e podem entrar depois do 1º post.

### Bloqueios sutis (não óbvios no grafo)

- **40.6 ↔ 40.7 são "par"** e ambas dependem de 40.5 ter o esqueleto da edge (a 40.5 pode usar prompt "cru" portado; 40.6/40.7 especializam). Não travar 40.5 esperando prompt final.
- **40.7 é frágil a refactor:** qualquer concatenação após o integrity tail quebra a recência silenciosamente (invariante-teste 40.7/CA1). Guardrail é comportamental → só valida no provider real (saída da 40.1/CA6).
- **40.10/CA9 e 40.17** deslizam sem travar o épico se #364 atrasar (dependem de objetos E29/E31).
- **40.16/CA4** estende `build_segment_where` (objeto do E20/21 em prod) — validar injeção SQL em PG isolado.

---

## 6.8 — ESTIMATIVA RELATIVA (P/M/G) + marcos de valor

| Story | Tam. | Tipo | Justificativa |
|---|---|---|---|
| 40.1 | **M** | Spike/ADR | POCs de streaming + 3 gerações comparativas + experimento de recência + ADR. CA1 (snapshot flags) já FEITO. |
| 40.2 | **G** | Migração | 8 tabelas + RLS FORCE gated + triggers de transição/aprovação + índices + bucket + seed + types + bateria adversarial. |
| 40.3 | **M** | Full-stack | CRUD marca + catálogo 12 arquétipos + seed real (sessão com time). Mockup antes. |
| 40.4 | **G** | Full-stack | Coração da adaptação: público próprio + RPC `rpc_content_busca_catalogo` (SECURITY DEFINER, gate 42501) + best-effort Tray + herança da Ficha (42.3) + UTM. |
| 40.5 | **G** | Edge/IA | Porte de 3.130 linhas: pipeline + motor intenção + goldens + RPC transacional de persistência + validação server-side + rate-limit + contrato email. |
| 40.6 | **G** | Prompt | Reescreve montagem do prompt por eixo (voz/público/assunto) + remoções + goldens + blind test. É o "muito mais preciso". |
| 40.7 | **M** | Prompt | 4 camadas anti-invenção + anti-mesmice + bateria de 10+ iscas no provider real. |
| 40.8 | **G** | Front | Form dinâmico por intenção + preview carrossel/legenda + editor + versões + nav/rotas + `nav.test.ts`. |
| 40.9 | **P** | Backend | Porte perplexity + toggle + resiliência + custo. |
| 40.10 | **G** | Full-stack | Calendário grade+kanban + drag c/ transições válidas + gerar-do-slot + aprovação interna. |
| 40.11 | **M** | Spike/ADR | Pesquisa de mercado + bench cego (3 modelos × 4 casos) + ADR catálogo plugável. |
| 40.12 | **G** | Edge/IA | Porte de 2.238 linhas sem créditos + catálogo + background + storage + custo. |
| 40.13 | **M** | Front | Composer por slide + galeria + seletor de modelo + polling + download. |
| 40.14 | **M** | Gate/QA | Security gate + adversarial multi-agente + E2E com JG + docs + PR único. |
| 40.15 | **M** | Backend/IA | Coluna `launch_id` + `renderLaunchBlock` + injeção no orchestrator (toca Helena em prod → gate). |
| 40.16 | **M** | Full-stack | Botão post→campanha + variantes A/B + segmentos + extensão `build_segment_where`. |
| 40.17 | **P/M** | Full-stack | RPC pauta (set-based, sem R$ no payload) + painel read-only. Condicionada a #364. |
| 40.18 | **P/M** | Full-stack | Template seed LP + merge + botão. Pode deslizar p/ fase seguinte. |
| 42.1 | **M** | Migração | `editorial.livros_ficha` + RLS + decisão de exposição + types. |
| 42.2 | **M** | Front | Aba "Book Info" na ficha do título + find-or-create + seed real. |
| 42.3 | **P/M** | Integração | Herança ficha→lançamento (cópia + re-sync). Roda junto de 40.4. |
| 42.4 | **P** | Export | Fase 2 — depende do template real do Vendor. |

**Distribuição:** 7×G (40.2, 40.4, 40.5, 40.6, 40.8, 40.10, 40.12) · 9×M · 4×P/M · 2×P.

### Marcos de valor

- **Marco 0 — infra pronta:** #364 mergeado + 40.1 (ADR) + 40.2 (tabelas) verdes. Nada visível ainda.
- **Marco 1 — 1º POST END-TO-END (o mais importante):** exige **40.1 + 40.2 + 40.5 + 40.6 + 40.7 + 40.8** com pelo menos um seed de marca (40.3/CA4) e um de lançamento (40.4/CA7). É o menor conjunto que gera e salva um post real. **Atalho para antecipar:** os seeds reais podem entrar por **SQL antes** das telas 40.3/40.4 existirem (a própria 40.6/CA5 e 40.7/CA3 preveem isso) — permite validar o motor sem esperar toda a UI.
- **Marco 2 — fluxo completo de texto:** + 40.9 (pesquisa) + 40.10 (calendário/aprovação). Time opera a produção do mês.
- **Marco 3 — copy + imagem:** + 40.11/40.12/40.13. Post com arte pronta p/ baixar.
- **Marco 4 — épico fechado:** + 40.14 (gate/PR) + integrações 40.15–40.18.

---

## 6.9 — CHECKLIST DE PRÉ-VOO (antes da 1ª linha de código)

### A. Secrets no OS (`supabase secrets list`; NUNCA colar chave em chat/commit)

- [ ] `OPENROUTER_API_KEY` — **já existe** no Vault do OS (Helena usa via openrouter). Confirmar. Cobre texto (se ADR 40.1 escolher openrouter) E pesquisa Perplexity (40.9) E imagem via OpenRouter (40.12).
- [ ] Se o ADR 40.1 escolher **anthropic nativo** p/ o texto: garantir `ANTHROPIC_API_KEY` (o `ai.ts` suporta anthropic com prompt caching). A pesquisa continua via OpenRouter (documentar a dupla — 40.9/CA1).
- [ ] **NÃO** criar `LOVABLE_API_KEY` no OS (fallback Lovable descartado, 40.11).
- [ ] **NÃO** portar `PERPLEXITY_API_KEY` direta nem `IMAGE_MODEL_OVERRIDE` (legados órfãos do Jimmy — CA1 da 40.1).
- [ ] Bucket **`crm-content-studio`** a criar via migration (40.2/CA8) — não é secret, mas é pré-req de storage (molde `20260701210000_crm_outbound_media_bucket.sql`). ⚠️ Story 40.12 alterna entre `content-studio` e `crm-content-studio` no texto — **fixar o nome `crm-content-studio`** (convenção de prefixo da casa) e usar em todo o épico.

### B. Decisões PENDENTES da 40.1 que travam o resto (fechar no ADR antes de 40.5)

- [ ] **Provider:** reusar `callLLM` (`ai.ts`, recomendação default) vs. portar `anthropic.ts`. (CA2)
- [ ] **Streaming:** (a) add stream opt-in no `callLLM` sem quebrar os 3 consumidores (crm-ai-orchestrator, crm-specialist-runner, crm-ai-eval-corrections), (b) resposta única com progresso na UI, ou (c) SSE só nessa edge. (CA3)
- [ ] **CONTRATO da edge** definido no ADR (se SSE: nomes de eventos + evento final `{postId, tokens}`; se resposta única: JSON completo). 40.5 e 40.8 referenciam esse contrato — não fixar shape antes. (CA3)
- [ ] **Modelo cravado por papel:** geração (candidato `claude-sonnet-4-6`) vs. o que o Jimmy realmente roteia via OpenRouter; utilitários (haiku). (CA4)
- [ ] **Recência confirmada** no provider escolhido (CA6) — resultado alimenta 40.7.
- [ ] **40.11 (ADR imagem):** catálogo de modelos + default por uso + manter/descartar "gerar-2-e-pontuar". Independente — pode fechar em paralelo à 40.1.
- [ ] **42.1/CA2:** exposição de `editorial` — já está no `config.toml` linha 7, então Opção A (client direto sob RLS) é viável; registrar a escolha.

### C. Mockups aprovados pelo JG ANTES de codar UI (regra da casa — `feedback_design_validation_first`)

- [ ] 40.3 Marcas (listagem + ficha em seções Identidade/Voz/Vocabulário/Amostras).
- [ ] 40.4 Lançamentos (listagem + ficha Livro/Público/Argumentos/Campanha).
- [ ] 40.8 ContentForm (briefing + estado gerando + preview + edição).
- [ ] 40.10 Calendário (grade mensal + kanban + criação de grade).
- [ ] 40.13 Imagens (lista de slides + galeria + seletor de modelo).
- [ ] 42.2 Aba "Book Info" (7 seções).
- [ ] 40.18 Template LP `lp-livro`.

### D. Seeds reais a coletar com o time (sem "Claude"; usar TESTE_INTERNO nos testes)

- [ ] DNA real da **Editora Heziom** + 3–5 amostras de voz reais (40.3/CA4) — sem isso o motor gera genérico.
- [ ] 1 marca `autor` real (40.3/CA5).
- [ ] 2 lançamentos reais com público de verdade (40.4/CA7) — ex.: lançamento corrente + Combo Spurgeon.
- [ ] Ficha completa de 2–3 livros da campanha corrente (42.2/CA4) — insumo do blind test 40.6/CA5 e do E2E 40.14/CA6.

### E. Confirmações técnicas de ambiente

- [ ] `git worktree list` + `origin/main..HEAD` antes de branchar (checkout compartilhado colide branch — `reference_heziomos_checkout_compartilhado`).
- [ ] Validar migrations em **Postgres isolado** com role `service_role` (CI não aplica SQL no PR — `reference_heziomos_migration_local_validacao`).
- [ ] `dnd-kit` já é dependência do monorepo? (40.10 kanban) — verificar antes.
- [ ] Dependência de zip client-side (`fflate`/`client-zip`) p/ "baixar todas" (40.13/CA5) — se o review travar, rebaixar p/ "uma a uma".
- [ ] `vitest run --no-file-parallelism` p/ `@heziom/web` (flaky sob carga — `reference_heziomos_vitest_flaky`).

---

<a id="alertas"></a>

## Apanhado de alertas (pegadinhas que só o código revela)

**Cap. 1 — Dissecação de generate-content/index.ts (motor do Jimmy → Es:**
- callClaudeStream (Jimmy) é STREAMING via OpenRouter e devolve response.body cru (ReadableStream SSE formato OpenAI); o callLLM do OS (_shared/ai.ts) é NÃO-streaming e devolve LlmResult. Portar exige decidir: criar um callLLMStream (mantém a UI token-a-token) ou trocar por resposta única (quebra o streaming do front). Para o fluxo captionOnly o callLLM encaixa direto (já consome o stream internamente).
- O parser SSE em l.849-868 depende do shape OpenAI/OpenRouter (event.choices[0].delta.content e finish_reason==='stop'). Se o OS chamar Anthropic NATIVO, o shape do stream muda (content_block_delta/message_stop) e o parser quebra silenciosamente (nenhum delta emitido).
- corsHeaders no Jimmy é uma CONST espalhada com {...corsHeaders} em ~10 lugares; no OS é FUNÇÃO corsHeaders(origin). Cada ocorrência precisa virar ...corsHeaders(req.headers.get('origin')). Erro fácil que pode passar no typecheck se adaptado errado (spread de função retorna lixo).
- Modelo real é 'anthropic/claude-sonnet-4' via OpenRouter (CLAUDE_MODELS.SONNET_4_6), NÃO Anthropic nativa. O motor foi calibrado (temperaturas 0.75/0.85/0.65, blocos de integridade) nesse modelo; trocar de provider/modelo altera estilo e qualidade. Para paridade, fixar provider openrouter + claude-sonnet-4-6.
- Toda a cadeia comercial usa profiles.org_id: gate can_generate_content (402), subscription_plans, feature_usage_log, logAiCost. É DESCARTE integral no OS single-tenant — se copiar sem remover, as queries batem em tabelas/RPC inexistentes e o handler quebra.
- captionOnly (l.119-308) é um SEGUNDO fluxo completo dentro do MESMO handler, com prompt próprio, chamada ao modelo e retorno JSON não-stream. É um 'return' no meio do arquivo — fácil de esquecer no porte. Usa getLeanBrandDNA via dynamic import (brand-dna-summary.ts).
- buildSystemPrompt injeta a identidade da marca em DOIS pontos separados: voz few-shot + ICP + estratégia + arquétipo no TOPO (l.1893-1897), e o dump MARCA + ESTRUTURA JSON OBRIGATÓRIA no FIM (l.2631-2675). Não é um bloco único; inverter a ordem muda a hierarquia v4.0.
- As 8 flags são lidas por Deno.env.get DENTRO das funções em runtime. Com todas ON, os ramos legados continuam no arquivo como dead-code (bloco MARCA legado l.2587-2628; framework completo l.1956-1965; freeModeTemp 0.9 l.745; integrity só se !coherenceV1 l.1932). Podem ser removidos no porte para simplificar, mas é decisão consciente — não são no-ops se alguma flag for desligada.
- STYLES_CANONICAL_V1 (uma das 8 flags ON) NÃO aparece no index.ts — ela vive dentro de getStyleEssence (framework-instructions.ts / styles-catalog.ts). Precisa portar esses arquivos junto, senão o estilo canônico do modo Guiado/Estruturado se perde.
- Perplexity é OBRIGATÓRIA por padrão (context.enable_realtime_search !== false), com exceções (comunicado sempre pula; brief rico+URLs pula). Sem portar perplexity.ts + search-query-builder.ts + a chave PERPLEXITY_API_KEY, toda geração tenta buscar e falha silenciosa (searchResult null): degrada (só linguagem qualitativa) mas não quebra. É dependência de segredo externo a provisionar.
- Buckets de storage 'brand-frameworks' (l.419) e 'processing-files' (l.464) + tabela file_extractions (l.435) são um subsistema de extração assíncrona de arquivos. Não existem no OS; para o v1 do Estúdio o mais seguro é DESCARTAR esses blocos (o customFrameworks/fileContents só entram no prompt se preenchidos) e portar depois como crm.content_file_extractions.
- maxTokens sobe para 8192 quando channel==='blog' ou trafficVariations (l.734). Se 'blog' não for um canal do Estúdio, revisar; caso contrário o formato blog/article (GEO+AEO, l.~2260-2353) e seu template JSON precisam vir junto.

**Cap. 2 — Dissecação do Pipeline de Imagem (generate-image → crm-conte:**
- Misnomer de chave: em generate-image a variável chama-se `lovableApiKey` mas lê `Deno.env.get('OPENROUTER_API_KEY')` (index.ts:1975); os fetches diretos (validatePersonClone l.229, generate-blog-cover) usam essa mesma variável como Bearer do OpenRouter. Ao portar, NÃO conecte uma chave Lovable ali — é a chave do OpenRouter. O único ponto que usa a chave Lovable de verdade é o fallback do ai-gateway (LOVABLE_API_KEY, l.44).
- A geração de imagem passa por callAIRaw→callAI, então HERDA o fallback Lovable e o retry Vertex embutidos no ai-gateway. A 40.11 CA3 decidiu SEM fallback Lovable — se você portar o ai-gateway inteiro sem remover o gateway Lovable, a imagem pode silenciosamente ir para outra conta/cota. Porte só o caminho OpenRouter + Vertex.
- content_filter do Google volta como HTTP 200 com finish_reason:'content_filter' (sem imagem) — NÃO é pego pelo fallback baseado em erro. Sem o tratamento explícito (ai-gateway l.140-191 / retryImageOnVertexIfFiltered), o draft fica sem imagem e o usuário não entende. É determinístico (direito autoral/política): mostre mensagem clara e não retente à toa (STORY-124, index.ts:1928-1938).
- Draft zumbi: não há timeout server-side real; se o EdgeRuntime.waitUntil for morto pelo wall-clock da Supabase, o draft fica preso em 'gerando'. O Jimmy só limpa na PRÓXIMA invocação (index.ts:2044, >10min). A 40.12 CA4 exige garantir que nunca fique preso — implemente cleanup por checagem na edge OU pg_cron.
- Bucket: o Jimmy grava getPublicUrl de um bucket PÚBLICO 'content-images' (index.ts:1837). A 40.2 CA8 criou 'crm-content-studio' NÃO-público. É obrigatório trocar para gravar storage_path e servir por URL assinada (40.12 CA3/CA6) — senão vaza arte de post inédito.
- best-of-2 (n:2 + candidateCount:2, index.ts:1711-1716) dobra o token de imagem por chamada + adiciona uma chamada de visão gemini-2.5-flash como juiz. Só compensa quando há ROSTO real a clonar. Arte editorial (capa/mockup de livro) não tem face → mantenha n:1 por padrão e ligue best-of-2 só quando o post anexar foto de pessoa; o juiz deve ser um modelo barato do catálogo, não hardcode.
- content_image_drafts do OS dobrou 'is_selected' no enum de status ('escolhido'/'descartado'), perdendo o índice único parcial idx_one_selected_draft_per_slide que garantia 1 selecionado por slide no Jimmy. Se a UI 40.13 permitir escolher 1 draft por slide, recrie um índice único parcial WHERE status='escolhido'.
- Conversão base64 tem teto de 5MB e timeout 10s (fetchImageAsBase64 l.99-132); acima disso cai para URL direta. Com bucket privado, a URL direta 400a a request inteira do Gemini ('Received 400 status code when fetching image from URL'). Mockups de livro grandes precisam ser redimensionados antes, ou sempre inlinados como base64 via signed URL.
- logAiCost grava em ai_usage_costs com org_id (log-ai-cost.ts:32) — no OS a tabela é crm.content_ai_costs SEM org_id. Reescreva o insert (tipo 'imagem', modelo real, custo_estimado_brl, post_id, image_draft_id); não porte o helper como está.
- Regra de background da casa: NUNCA propagar o JWT do usuário no client de background (admin-client.ts:3-14 documenta o incidente Fev-Abr/2026 de perda silenciosa de log por RLS). Use service_role puro dentro do waitUntil; um client autenticado só no nível do handler para leituras que respeitam RLS.
- text_depth (que define as fontes cap-height, index.ts:613-618) é lido de contents.text_depth — coluna que não existe no schema crm v1. Sem adaptar a fonte (default 'medium' ou ler de content_posts.briefing), o cálculo cai no catch e usa medium, mas confirme para não gerar título fora de escala.

**Cap. 3 — Especificação Completa do Prompt v4.0 (todas as flags ON):**
- INTEGRIDADE aparece 3× de propósito (system topo l.1873 + system fim l.2688 + user fim l.768). Não deduplicar ao portar: o motor depende da recência da 'última instrução' (l.768-778) ser literalmente o último token do finalUserPrompt (montado em l.779: userPrompt + creativeDirective + integrityTail).
- getLeanBrandDNA (brand-dna-summary.ts) NÃO é usado em generate-content — o próprio arquivo diz isso (l.7-11). O bloco de marca do prompt de geração é o dnaRich completo (index.ts:2631-2675) + buildVoiceFewShot. Portar getLeanBrandDNA para content-prompt.ts principal seria erro; ele é só para regenerate-slot-topic/regenerate-slide-prompt.
- Com PROMPT_COHERENCE_V1 ON, o ramo Estruturado legado (getFrameworkInstructions + getContentTypeTemplate, index.ts:1955-1966) é INALCANÇÁVEL. Idem o ramo legado de getStyleEssence (framework-instructions.ts:792-798) sob STYLES_CANONICAL_V1 ON, e o bloco MARCA legado (index.ts:2587-2628) sob CONTENT_DNA_RICH ON. Portar essas 3 peças é trazer código morto.
- Duplicação de integridade no Guiado é evitada por 'if (!coherenceV1)' (index.ts:1932). Com styleV2 E coherenceV1 ambos ON, o bloco de integridade do styleV2 NÃO é injetado — a integridade vem só do topo (hierarquia). Se alguém portar sem esse guard, o prompt fica com integridade duplicada no meio.
- buildEditorialPostureBlock tem defaults perigosos para uma editora: normalizeBusinessModel→'service_provider' (l.41) e normalizeContentIntent→'generate_demand' (l.48). Sem setar business_model/content_intent no context, a REGRA DE OURO anti-DIY (l.81-104) é injetada e proíbe tutoriais/guias — errado para quem VENDE produto (livros). Descartar a golden rule ou forçar intent product/mixed.
- As menções 'Jimmy Studio' hardcoded no bloco de blog (index.ts:2289, 2303-2310, 2337, 2340, 2342) e no preâmbulo (l.1839) são literais no prompt. Portar sem parametrizar faz o conteúdo do Estúdio Heziom citar 'Jimmy Studio'. Já há histórico de bug 'Claude'/'Jimmy' vazando em produção — parametrizar o nome da marca é obrigatório.
- O hookType efetivo pode ser SORTEADO no backend antes do user prompt (index.ts:524-538) quando é 'auto' e framework_intensity<=50, via autoHookPoolForIntent — o pool depende da intenção. Portar buildUserPrompt sem essa rotação prévia muda o comportamento (o LLM tende a repetir o mesmo gancho).
- getStyleEssence e buildContentStyleHints leem Deno.env DENTRO da função (framework-instructions.ts:786; editorial-posture.ts:134). No HeziomOS as flags precisam existir no ambiente das edge functions (config.toml/secrets) ou o resolvedor cai no ramo legado/errado silenciosamente. Confirmar que as 8 flags são resolvidas server-side no runtime do HeziomOS, não só documentadas.
- A temperatura é dinâmica e acoplada a CONTENT_INTEGRITY_V2 (index.ts:744-746): Livre=0.75 (não 0.9), Guiado=0.85, Estruturado=0.65. E maxTokens=8192 só para blog/traffic, senão 4096 (l.734). Portar a chamada callLLM com temperatura fixa ou maxTokens errado degrada qualidade/trunca blog.
- buildCarouselStructureBlock recebe integrityV2 e troca o FOMO 'mensurável' por 'observável sem número' (intent-prompt.ts:82-84). Existe um golden test citado no código ('não alterar sem regravar o golden', l.75) — a paridade de bytes do arco de venda é testada. Ao portar, decidir se replica o golden ou aceita divergência controlada.

**Cap. 4 — Motor de Intenção + Fidelidade (goldens):**
- golden.txt tem 2259 bytes e NAO termina em newline (ultimo byte e '.', termina em 'de um slide.'). Prettier/editorconfig/git autocrlf que adicione \n final ou converta LF->CRLF quebra o assertEquals (intent-prompt.test.ts:35). Trave via .gitattributes/.editorconfig OU regenere com o golden.gen.ts na maquina alvo.
- O golden trava o texto FLAG-OFF (integrityV2=false, contem 'mensuravel'), MAS em prod CONTENT_INTEGRITY_V2 esta ON -> o runtime de resposta_direta usa a linha 'CONCRETO E OBSERVAVEL / a menos que haja prova REAL' (SEM 'mensuravel'). O golden NAO reflete o runtime atual, e proposital (golden.gen.ts:8-10). Portar os DOIS textos.
- _shared/intent-prompt.ts (Deno) e src/config/contentIntents.ts (front) sao COPIAS MANUAIS: nao ha import compartilhado nem assert cross-file automatizado. A paridade so e garantida por testes DUPLICADOS (STORY-132). Mudar um exige mudar o outro a mao.
- A tabela rica das 5 intencoes (label/verb/cta/research/showsAngle/showsFunnel/sovereignty) existe SO no front contentIntents.ts (CONTENT_INTENTS, l.62-128). O motor Deno intent-prompt.ts so conhece as CHAVES + textos de prompt. Expor esses atributos no backend exige portar o objeto CONTENT_INTENTS tambem.
- As strings de INTENT_AUTO_HOOK_POOL (problema_agudo, contraintuitivo, historia_tensao, curiosidade_loop, factual_direto) sao chaves de tipo de gancho que precisam existir no catalogo hookInstructions do generate-content, senao o sorteio (index.ts:527-536) devolve chave sem instrucao. factual_direto <-> FACTUAL_DIRETO_HOOK.
- Com as flags ON, resolveIntent (index.ts:516) usa o intent nativo do payload e NUNCA chega em OBJECTIVE_TO_INTENT; o mapa vira safety-net dormente (so slots de calendario/legado sem intent o exercitam). Mas testes STORY-132/helpers dependem dele: DESCARTAR quebra a suite e a fidelidade byte-a-byte. PORTA.
- O clamp de slidesTarget (3..10) NAO esta em buildCarouselStructureBlock -- e do caller (generate-content). Portar so o _shared sem o clamp do caller pode gerar numeracao degenerada ('Slides 3 a 1' para 3 slides).
- contentIntents.ts importa STYLES/getStylesForBrandType de ./contentChannels (l.19) e o teste importa OBJECTIVES: anglesForIntent e defaultObjectiveForIntent nao compilam sem esse modulo (dependencia do capitulo de Estilos).
- O teste do golden faz top-level await Deno.readTextFile -> precisa 'deno test --allow-read'. No Jimmy NAO ha .github/workflows; npm test (vitest) cobre so o front. O golden Deno roda manualmente. No OS tem que ser plugado explicitamente no passo deno test do CI de edge functions.
- Import do assert e https://deno.land/std@0.224.0/assert/mod.ts (intent-prompt.test.ts:11-13). Alinhar essa versao com a que o _shared do OS ja usa para nao misturar versoes de std no runtime de teste.

**Cap. 5 — Kit do lado HeziomOS (o que já existe para reusar):**
- callLLM tem maxTokens DEFAULT = 1024 (ai.ts:404). Geração de conteúdo longo (posts) SERÁ TRUNCADA se o chamador não passar maxTokens explícito. O molde crm-lp-publish não usa callLLM, então não há exemplo de maxTokens alto no molde — passar >=2000.
- Existem DUAS gerações de cliente em ai.ts. A legada (callAiText/callAiJson/resolveAiProvider) tem temperature 0.7 HARDCODED, sem model, sem cache, e mapeia provider 'anthropic' para o gateway Lovable (ai.ts:16), NÃO para a Anthropic nativa. Só o callLLM fala com api.anthropic.com. Se portar no callAiText por engano, perde prompt cache e controle de modelo.
- Prompt cache (cache_control) só funciona no caminho Anthropic NATIVO do callLLM (provider==='anthropic' → x-api-key em api.anthropic.com). Para isso ai_providers_config precisa ter provider='anthropic' com uma chave Anthropic REAL (x-api-key). Se a chave for do gateway Lovable, o cache degrada silenciosamente para cacheReadTokens=0 (normalizeOpenAIResponse, ai.ts:392). Sem erro visível.
- callLLM NÃO resolve provider/apiKey/model — o chamador tem que resolver. Não há helper compartilhado; é preciso copiar resolveKey(sb, provider) de crm-specialist-runner/index.ts:42-57 (ai_providers_config ativo → env OPENAI/ANTHROPIC/GOOGLE_AI_API_KEY).
- A RPC de persistência (rpc_content_persist_geracao) deve seguir lp_commit_version: REVOKE de PUBLIC/anon/AUTHENTICATED e GRANT EXECUTE só a service_role. Se der GRANT a authenticated sem gate 42501 interno, um usuário logado chama a RPC direto pelo PostgREST e PULA o canManageArea('marketing') da edge.
- canManageArea NUNCA deve ser alargado para tratar coordenador como manager global (aviso explícito no topo de authz.ts). Coordenador só passa no gate se 'marketing' estiver em profiles.allowed_areas. Manter o gate exatamente canManageArea(user.id,'marketing').
- Erro de DB/RPC deve usar internalErrorSafe (errors.ts:65), NUNCA internalError(err.message) — a mensagem crua do PostgREST vaza nome de tabela/coluna/constraint (F-023/CWE-209). O molde crm-lp-publish já usa internalErrorSafe em todos os 6 pontos de erro de DB.
- Rate-limit de função de IA/custo tem que usar failOpen=false (padrão F-025 em crm-preparation-visual:41). O DEFAULT de checkRateLimit é failOpen=true (rate-limit.ts:24) — deixar o default deixaria a geração paga passar livre quando a tabela rate_limits estiver com erro.
- Adicionar a seção [functions.crm-content-generate] no config.toml mesmo com verify_jwt=true (default). O arquivo é source-of-truth desde o fix de config-drift 22/06 (config.toml:282-285); função ausente é acusada em auditoria. Para eventuais workers cron do Estúdio, esquecer verify_jwt=false causa 401 no gateway ANTES do handler — falha silenciosa que já quebrou tray-sync (config.toml:264-266).
- Usar corsHeaders(origin) do cors.ts (allowlist os.heziom.com.br + previews), NÃO publicCorsHeaders ('*'). publicCorsHeaders é só para webhooks públicos (Meta/Z-API). O Estúdio é chamado do app logado.
- Client Supabase nas edges usa createClient(url, service_role_key, { db: { schema: 'crm' } }). As tabelas content_* precisam viver no schema crm (já listado em config.toml:7). Sem o { db: { schema } }, o PostgREST bate no schema errado.
- callLLMStream é peça NOVA (não existe stream em ai.ts). Manter a assinatura de callLLM intacta e adicionar função separada, senão quebra os 3 consumidores existentes: crm-specialist-runner:148, crm-ai-orchestrator:305, crm-ai-eval-corrections:101 e :111.

**Cap. 6 — Plano de Porte Executável + Inventário de Arquivos (Estúdio :**
- NOME DO BUCKET INCONSISTENTE NA PRÓPRIA STORY: 40.2/CA8 manda criar `crm-content-studio` (convenção de prefixo da casa), mas 40.12/CA3/CA6 e 40.13 referenciam `content-studio` (sem prefixo). Fixar `crm-content-studio` em TODO o épico antes de codar, senão a edge de imagem (40.12) sobe arquivo num bucket que não existe.
- ENUM DE STATUS DO DRAFT DIVERGE ENTRE FONTE E DDL: `useImageGeneration.ts:53/58` (Jimmy) faz polling por `status==='completed'` / `'failed'`, mas o DDL da 40.2 define `content_image_drafts.status CHECK (... 'pronto','falhou' ...)`. Ao portar o hook (40.13) e a edge (40.12) tem que traduzir para os valores em pt-BR do DDL, ou o polling nunca detecta conclusão.
- BUG REAL DO FONTE A NÃO REPLICAR: `useContentGeneration.ts:668` e `:811` gravam `generation_model:'google/gemini-2.5-flash'` HARDCODED e ERRADO (não é o modelo que gerou). 40.5/CA7 exige gravar o ID REAL do modelo — a persistência migra do front para a edge exatamente por isso; não copiar o insert do front.
- `isFullDocument` no OS (`_shared/email-layout.ts:16`) NÃO é exportado (só `wrapEmailLayout` l.34 é). A 40.5/CA11 precisa validar que o `corpo_html` do canal email é FRAGMENTO — vai ter que exportar/duplicar `isFullDocument` ou o validador não compila. Não assumir que já está disponível.
- RECÊNCIA É FRÁGIL A REFACTOR (40.7): no fonte o integrity tail é a ÚLTIMA concatenação do user prompt (`generate-content/index.ts:765-779`, `finalUserPrompt = userPrompt + creativeDirective + integrityTail`). Qualquer helper que concatene algo DEPOIS do tail quebra a defesa anti-invenção silenciosamente. É a razão do teste-invariante 40.7/CA1 — implementar esse teste ANTES de mexer na composição.
- O rótulo de modelo do Jimmy é enganoso: `CLAUDE_MODELS.SONNET_4_6`, `SONNET_4_5` e `SONNET_4` (anthropic.ts:58-62) apontam TODOS para o mesmo id `anthropic/claude-sonnet-4`. Não existe comparação real '4.6 vs 4.5' no fonte — o roteamento efetivo é do OpenRouter. A 40.1/CA4 deve cravar o modelo do OS explicitamente (candidato `claude-sonnet-4-6` do `MODEL_DEFAULTS`) e comparar com o que o Jimmy REALMENTE serve, sem confiar no rótulo.
- `callLLM` do OS (`ai.ts:401`) NÃO tem streaming (chamada única com AbortSignal); o Jimmy é SSE ponta a ponta (`callClaudeStream` anthropic.ts:191 → front `getReader` useContentGeneration.ts:402-452). A decisão de streaming (40.1/CA3) é pré-requisito duro de 40.5 E 40.8 — se optar por adicionar stream ao `callLLM`, é preciso não quebrar os 3 consumidores atuais (crm-ai-orchestrator, crm-specialist-runner, crm-ai-eval-corrections).
- DOIS ADRs (40.1 texto e 40.11 imagem) são bloqueadores no dia 1 e não têm código de produção. Se forem tratados como 'documentação depois', travam respectivamente 40.5/40.6/40.7/40.9 e 40.12/40.13. 40.11 é independente de tudo — deve começar em paralelo já no início (bench leva tempo de ida-e-volta com o time p/ avaliação cega).
- `framework-instructions.ts` (1.169 linhas) fica DENTRO de `generate-content/`, não em `_shared/` — é o maior arquivo 'invisível' do porte e é DESCARTA integral (framework_intensity + frameworks custom OUT v1, 40.6). Não confundir com os builders de intenção; ao portar `generate-content` não arrastar esse arquivo junto.
- `generate-image-prompt/index.ts` tem 3.127 linhas (MAIOR que o próprio generate-content) e é quase todo DESCARTA v1 (constrói o content_visual_plan multi-slide, que é fase 2). Só o trecho de 'prompt sugerido por slide' entra na 40.13/CA2. Não orçar o porte de imagem como se as 3.127 linhas viessem.
- PRÉ-REQUISITO DE MERGE: a 40.2 exige timestamp de migration > 20260727110000 (depois do PR #364, E29+E31, ainda ABERTO conforme memória). Se a 40.2 for escrita antes do #364 mergear, há conflito certo em migrations/ e nav.ts, e os CAs 40.10/CA9 (feiras) e 40.17 (estoque E31) ficam sem os objetos que leem — eles deslizam sem travar o épico, mas a 40.2 não deve nascer antes do #364.
- `editorial` JÁ está exposto no PostgREST do OS (`config.toml` linha 7). A 42.1/CA2 apresenta isso como decisão em aberto (Opção A vs B), mas o fato conferido é que a Opção A (client direto sob RLS) já está destravada — evita criar RPCs em crm desnecessariamente.
