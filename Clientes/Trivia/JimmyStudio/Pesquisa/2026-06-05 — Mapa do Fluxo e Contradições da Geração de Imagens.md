---
tipo: pesquisa
modulo: agencia / geracao-de-imagem / prompts
origem: claude
criado: 2026-06-05
atualizado: 2026-06-05
relacionado:
  - "[[2026-06-04 — Análise do Sistema de Criação de Conteúdo]]"
  - "[[2026-06-05 — Mapa de Contradições dos Prompts]]"
---

# Mapa do Fluxo e Contradições da Geração de Imagens

> **Objetivo:** fazer com a geração de **imagem** o mesmo trabalho que fizemos com a
> **copy** — DNA mais alinhado, menos contradição/inchaço, e coerência igual em todos
> os modos. Este documento **mapeia** (não altera nada ainda): o fluxo completo + os
> prompts literais + as contradições, no mesmo formato do [[2026-06-05 — Mapa de Contradições dos Prompts]].

---

## Parte 1 — O fluxo, em linguagem simples

Gerar imagem no Jimmy tem **duas etapas** (diferente da copy, que é uma só):

1. **Planejar** (`generate-image-prompt`): uma IA de texto (**Gemini 2.5 Pro**) lê a copy,
   a marca e o brief do usuário e escreve um **plano** — um `unified_style` (o "DNA visual"
   da campanha) + um prompt em inglês para **cada slide**. É aqui que mora ~95% das regras.
2. **Desenhar** (`generate-image`): o prompt de cada slide vai para o **modelo de imagem**
   (**Gemini 3 Pro Image**, via OpenRouter, fixo) que devolve a imagem. Roda em segundo
   plano; o front fica "perguntando se já ficou pronto" (polling, timeout 3 min).

Há ainda **dois fluxos paralelos** que NÃO passam por esse motor:
- **`generate-blog-cover`**: capa de blog. Prompt próprio, minúsculo, que **ignora** marca,
  identidade visual, blocklist e hierarquia. (`generate-blog-cover/index.ts:131`)
- **`regenerate-slide-prompt`**: refaz o prompt de 1 slide.

> **Paralelo com a copy:** o blog-cover é para a imagem o que os "dois Jimmy" eram para o
> texto — um segundo motor com regras próprias, desalinhado do principal.

### Peças do sistema (com caminho)

| Camada | Arquivo | Papel |
|--------|---------|-------|
| Plano | `supabase/functions/generate-image-prompt/index.ts` (2971 linhas) | Monta o system+user prompt; chama Gemini 2.5 Pro |
| Imagem | `supabase/functions/generate-image/index.ts` (2160) | Chama Gemini 3 Pro Image; salva no Storage |
| Capa blog | `supabase/functions/generate-blog-cover/index.ts` (268) | Fluxo isolado |
| Regenerar slide | `supabase/functions/regenerate-slide-prompt/index.ts` (430) | Refaz 1 prompt |
| Modelo | `supabase/functions/_shared/image-model-config.ts` | Modelo fixo `google/gemini-3-pro-image-preview` |
| Estilos (back) | `generate-image-prompt/index.ts:712` `IMAGE_STYLE_PRESETS` | 41 presets |
| Estilos (front) | `src/config/imageStyles.ts` | 41 presets — **catálogo paralelo** |
| Front | `src/hooks/useImageGeneration.ts`, `src/components/agencia/ImageGenerationPanel.tsx`, `ImageBriefForm.tsx` | Dispara plano + imagem, polling |
| DNA visual | tabela `brand_visual_identity` | cores, logos, `reference_images`, `visual_style`, `image_prohibitions` |
| Brief | tabela `content_image_brief` | direção criativa, mood, pessoas, highlights, fontes |
| Dados | `content_visual_plan`, `content_image_drafts` | plano atual + rascunhos de imagem |

### Como o DNA da marca entra
- `brand_visual_identity`: paleta (`full_palette` com papéis), `visual_style`, `image_treatment`,
  `visual_keywords`, `image_prohibitions`, logos, `reference_images`.
- `brand_context` (o mesmo da copy): tom, valores, público, pilares, missão, tópicos proibidos.
- **Imagens de referência** (marca + brief + fotos de pessoas) entram como anexos multimodais,
  com limite (4 brief + 8 marca + 4/pessoa) e ordem de prioridade.

---

## Parte 2 — As 9 famílias de contradição (espelho do mapa da copy)

> Notação: `IMG` = generate-image-prompt/index.ts. Cada item traz file:line.

### IMG-1 🔴 Clichê proibido × exemplo que ensina o clichê — **o "87% dos gestores" da imagem**
A **blocklist de clichês visuais** (`IMG:2252`) proíbe explicitamente:
*"Escadas / degraus / pessoa subindo escada"*, *"Gráfico de barras subindo"*, *"Alvo com flecha"*.
**Mas logo abaixo**, o exemplo **obrigatório** de "coerência texto-imagem" (`IMG:2289-2296`) ensina:
> Copy: "5 passos para aumentar suas vendas" → Prompt: *"ascending staircase with 5 visible steps... shopping cart... upward visual flow"*

O próprio prompt **demonstra o clichê que acabou de banir**. É idêntico ao caso da copy onde
o exemplo "87% dos gestores" ensinava a fabricação que a regra proibia. **Causa-raiz do visual
genérico/cara-de-IA.**

### IMG-2 🔴 Nove "prioridades máximas" concorrentes, sem hierarquia única
Blocos marcados como topo de prioridade, todos dizendo "venho antes dos outros":
- Copy integral ad_static — `🚨🚨🚨 PRIORIDADE #1` (`IMG:1830`)
- Brief do usuário — `PRIORIDADE MÁXIMA` (`IMG:1994`)
- Referências do usuário — `MÁXIMA PRIORIDADE` + "têm prioridade sobre as da marca" (`IMG:2047, 2053`)
- Pessoa pesquisada (Perplexity) — `PRIORIDADE MÁXIMA` (`IMG:2163`)
- Fotos de pessoas — `PRIORIDADE ABSOLUTA` (`IMG:495, 502`)
- Referências por slide — `PRIORIDADE MÁXIMA` (`IMG:601, 2938`)
- Direção criativa — `REGRA PRIORITÁRIA` / "FILTRO PRINCIPAL" (`IMG:2413`)

Sete donos do "primeiro lugar". Quando três colidem (ex.: brief pede X, referência mostra Y,
pessoa pesquisada exige Z), **o modelo decide sozinho**. É exatamente o problema dos
"OBRIGATÓRIO/ABSOLUTO concorrentes" que a hierarquia única resolveu na copy (PROMPT_COHERENCE_V1).

### IMG-3 🔴 Fabricação de precisão técnica — o "número inventado" da imagem
O bloco "ANÁLISE PROFUNDA DE REFERÊNCIAS" (`IMG:2055-2117`) **manda extrair e replicar**:
- *"cores PREDOMINANTES em HEX (#3B82F6)"*, *"60% azul, 30% branco, 10% amarelo"*
- *"temperatura +3500K"*, *"f/1.4 bokeh"*, *"ISO 200"*, *"contraste 1:3"*

Pedir HEX/Kelvin/ISO/proporção **exatos** de uma foto que o modelo só "olha" induz **números
que parecem técnicos mas são inventados** — o equivalente visual de citar estatística falsa.
O `unified_style` "modelo" (`IMG:2106`) reforça isso como gabarito. **Mesma doença, outra forma.**

### IMG-4 🟠 Repetição e inchaço — prompt gigante que se repete
- Regra "fundo escuro/claro, NUNCA cor sólida chapada" reaparece **~5×** em fraseados diferentes:
  override (`IMG:1760-1790`), regras de cor (`IMG:1872`), bloco N/A (`IMG:1898`), regra de saída
  (`IMG:2396`), regra de fundo obrigatória (`IMG:2414`).
- Blocklist de termos tech aparece **2×**: no `sanitizeTechTerms` (`IMG:1860`) e na "BLOCKLIST DE
  TERMOS NO UNIFIED_STYLE" (`IMG:2374`).
- Contagem no system prompt: **26 "OBRIGATÓRIO", 38 "CRITICAL", 20 "NUNCA", 6 "NEVER", 16 "PROIBIDO"**.
- System prompt sozinho: **~800 linhas**. Mesmo diagnóstico da copy: prompt inchado = mais caro e
  menos obedecido.

### IMG-5 🟠 Dois catálogos de estilo (risco de drift) — ⚠️ CORRIGIDO em 05/06
**Correção (auditoria revista):** a 1ª leitura afirmou que `3d`/`3d_stylized` só existiam no
frontend e geravam fallback silencioso. **Isso estava ERRADO** — foi um bug da regex de extração
(não capturava chaves com aspas duplas, ex.: `"3d"`). Recontagem correta:
- **Toda chave selecionável no frontend (40) existe no backend (43).** NÃO há fallback silencioso hoje.
- `splitEducational`, `splitLight`, `editorialCarouselContent` existem só no backend (templates internos) — ok.

O que **de fato** resta:
- **Dois catálogos duplicados** (`src/config/imageStyles.ts` × `IMAGE_STYLE_PRESETS` no `IMG:709`)
  que podem **divergir no futuro** (drift). O frontend só envia a **chave** (`preferred_style`,
  `useImageGeneration.ts:244`); o backend resolve as instruções pelo seu próprio dicionário.
- O `promptInstructions` do frontend é usado **só** no admin "exemplos de estilo"
  (`StyleExamplesTab.tsx:103`) — e diverge levemente do backend para a mesma chave (ex.: `3d`
  no back cita "Octane/Redshift/PBR", no front "ray-tracing... AVOID"). Inconsistência cosmética.
- O **fallback existe no código** (`getEnrichedStyleInstructions`, ramo `if (!preset)`) mas era
  **silencioso**.

Resolvido na 086.3 com: fallback **explícito** (log) + **teste de paridade** front⊆back (anti-drift).
Merge num arquivo único NÃO foi feito (paridade já vale; risco do refactor Vite×Deno não se justifica).

### IMG-6 🟠 `no_text` × tipografia obrigatória — ordens opostas conforme combinação
- Modo `no_text` (`IMG:2417`): *"NUNCA inclua texto... Qualquer texto na imagem gerada tornará ela
  INUTILIZÁVEL."*
- Mas o bloco "TIPOGRAFIA OBRIGATÓRIA" (`IMG:2134`) e os estilos `textual`/`textualWithImage`/
  `textualMixed`/`splitEducational` **mandam renderizar** nome, @handle, data, título exato.

Para estilos textuais, `no_text` e "render exact text" coexistem no mesmo prompt e podem colidir
conforme a combinação `preferred_style × text_mode`. Falta uma regra que diga qual vence.

### IMG-7 🟠 Anti-tech global × presets que SÃO tech
`sanitizeTechTerms` + a blocklist do `unified_style` tratam *neon, holographic, glow, cyberpunk,
futuristic* como **"VIOLAÇÃO = REJEIÇÃO"** (`IMG:2374`). Mas existem presets cujo conceito **é
exatamente isso**: `neon` (Cyberpunk), `retro` (synthwave neon), `gradient` (neon accent).
A exceção existe (`FUTURISTIC_PRESETS`, `IMG:472`) mas está **espalhada** e a blocklist do
unified_style repete a exceção em prosa — frágil, fácil de um modo passar e o outro barrar.

### IMG-8 🟠 Quatro fontes do "assunto" da imagem competindo
A "REGRA DE OURO" (`IMG:2327`) diz: *tema vem do TEXTO, estilo vem das referências.* Mas há
**três exceções** que reabrem a porta do assunto:
- Pessoa pesquisada DEVE ser o sujeito (`IMG:2163`)
- Marcas externas DEVEM aparecer com logo/produto (`IMG:1917`)
- `brief.visual_elements` que o usuário "quer ver" (`IMG:2006`)

Quatro donos do "o que aparece", costurados por lembretes cruzados (`IMG:2345`). Sem ordem clara.

### IMG-9 🟢 Contextualização por indústria reintroduz quase-clichês
O bloco de contextualização (`IMG:2237`) é bom em intenção, mas seus próprios exemplos usam
"funil" e "escada de 5 degraus" — reforçando os clichês que a IMG-1 deveria matar. Alinhar os
exemplos à blocklist.

### Extra — fluxos órfãos
- **`generate-blog-cover`** (`:131`): prompt isolado, **sem** brand DNA, **sem** blocklist de clichês,
  **sem** hierarquia, **sem** identidade visual. Terceira "taxonomia" implícita. (= "dois Jimmy")
- **`new Date()` dentro do prompt** (`IMG:2029`): injeta data/hora no card textual — fonte de
  não-determinismo (a copy teve problema análogo com travessão/limites).

---

## Parte 3 — Decisão deliberada × dívida acidental (parecer)

| Item | Veredito | Por quê |
|------|----------|---------|
| Duas etapas (plano → imagem) | **Deliberado, manter** | dá controle e barateia regeneração |
| Modelo fixo (Gemini 3 Pro Image) | **Deliberado, manter** | override foi removido após A/B (abr/2026) |
| Blocklist de clichês (IMG-1) | **Acidental** | a intenção é ótima; o exemplo que a contradiz é o bug |
| Múltiplas prioridades (IMG-2) | **Acidental** (acúmulo) | cada feature nova colou seu "PRIORIDADE MÁXIMA" |
| Extração HEX/ISO exata (IMG-3) | **Acidental** | tentativa de precisão virou indução à fabricação |
| Inchaço/repetição (IMG-4) | **Acidental** | camadas somadas sem consolidar |
| Catálogo duplicado (IMG-5) | **Acidental** | front e back evoluíram separados (= copy pré-085.4) |
| `no_text` × texto (IMG-6) | **Acidental** | faltou regra de precedência por combinação |
| Anti-tech × presets tech (IMG-7) | **Parcialmente deliberado** | a intenção (evitar cara-de-IA) é boa; falta consolidar a exceção |
| Blog-cover isolado | **Dívida** | nasceu fora do motor; deveria herdar o núcleo |

---

## Parte 4 — Caminho proposto (espelho do épico 085, a aprovar)

Mesma filosofia da copy: **tirar e alinhar, não adicionar**; tudo **atrás de flag**, testável na
Work Solution, reversível. Prevenção no prompt, sem etapa de verificação.

Arquitetura-alvo do `buildSystemPrompt` da imagem em camadas, **uma fonte de verdade por regra**:

```
L0 IDENTIDADE (enxuta)
L1 HIERARQUIA VISUAL (constante) — "Em conflito vale:
     proibições da marca > pessoa/sujeito real > brief do usuário >
     coerência com a copy > estilo/preset > preferências de cor"
L2 INTEGRIDADE VISUAL (constante) — sem fabricar HEX/ISO/Kelvin; descrever
     qualitativamente ("warm amber tones") em vez de número falso
L3 DNA VISUAL DA MARCA (paleta, tratamento, proibições) — sem N/A
L4 TRADUÇÃO DA COPY (clichê-free, exemplos alinhados à blocklist)
L5 ESTILO/PRESET (fonte única; fallback explícito, nunca silencioso)
L6 REGRAS DE CANAL/FORMATO (fundo, safe-zone, no_text vs texto — 1 vez só)
L7 SAÍDA (JSON)
```

Stories candidatas (a abrir só após seu OK), espelhando 085.1–085.6:
- **IMG.1** Hierarquia visual única + integridade visual (mata IMG-2 e IMG-3) — 🔴 P1
- **IMG.2** Corrigir blocklist de clichês: trocar os exemplos que ensinam o clichê (mata IMG-1) — 🔴 P1
- **IMG.3** Catálogo de estilos canônico único front↔back + fim do fallback silencioso (mata IMG-5) — 🟠 P2
- **IMG.4** Desinchar/deduplicar regras de fundo, blocklist e "obrigatórios" (mata IMG-4) — 🟠 P2
- **IMG.5** Regra de precedência `no_text × texto` + consolidar exceção anti-tech (mata IMG-6, IMG-7) — 🟠 P2
- **IMG.6** Trazer `generate-blog-cover` para o núcleo (herdar L1-L4) — 🟡 P3

Flag proposta: `IMAGE_PROMPT_COHERENCE_V1` (default off = idêntico ao atual).
Validação: mesma marca/tema na Work Solution, flag off vs on, comparar (a) não inventa HEX/ISO;
(b) menos clichê de stock; (c) estilo selecionado é honrado (incl. 3D); (d) sem regressão.

---

## Resumo executivo (1 parágrafo)
A geração de imagem tem **exatamente as mesmas 5 doenças da copy**, agora em versão visual:
(1) o prompt **ensina o clichê que proíbe** (escada de "5 passos"); (2) **nove "prioridades
máximas"** brigam sem hierarquia; (3) pede **HEX/ISO/Kelvin exatos** → fabricação de precisão;
(4) **inchaço** com a mesma regra repetida 5×; (5) **dois catálogos de estilo** divergentes com
**fallback silencioso** (pede 3D, recebe genérico). Mais o **blog-cover órfão** (= "dois Jimmy").
O caminho é espelhar o épico 085: hierarquia única + integridade + catálogo único + enxugar, tudo
atrás de `IMAGE_PROMPT_COHERENCE_V1`, reversível.
