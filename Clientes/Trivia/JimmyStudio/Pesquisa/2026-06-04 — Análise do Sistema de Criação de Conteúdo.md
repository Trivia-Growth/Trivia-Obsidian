# Análise do Sistema de Criação de Conteúdo — Jimmy Studio

> **Data:** 04/06/2026
> **Autor:** Claude (a pedido do JG)
> **Escopo:** Mapeamento minucioso de todo o fluxo de criação de conteúdo — configuração de marca (DNA), calendário, copy, imagens, e o sistema de aprendizado/memória.
> **Status:** Diagnóstico. Nenhum código foi alterado.

---

## 1. Resumo executivo (em linguagem simples)

O sistema é **muito grande e bem construído nas fundações**, mas tem três problemas que explicam exatamente o que você sentiu ("complexo e com pouco uso"):

1. **O DNA da marca é coletado de forma rica, mas chega "diluído" na hora de criar.** Você (ou o cliente) preenche dezenas de campos sobre a marca, mas boa parte deles **nunca entra nos textos e imagens gerados** — alguns por bug, outros porque o formulário simplesmente joga fora o que a IA descobriu. O que de fato chega ao gerador entra como uma "lista de campo: valor" sem hierarquia, então a marca soa genérica.

2. **Existem peças duplicadas e peças mortas.** Há dois "assistentes Jimmy" de chat fazendo quase a mesma coisa, três camadas de função para gerar uma copy, e um sistema inteiro de "arquétipos de marca" (que daria personalidade real a cada marca) **construído e desligado**. Isso é a "complexidade sem uso" que você percebeu.

3. **A memória que aprende existe no papel, mas é rasa e tem o cano entupido.** O sistema **registra** quando você edita uma copy ou pede regeneração, processa isso a cada 5 minutos, e devolve "preferências aprendidas" para os próximos textos. **Mas:** (a) a interpretação do que você mudou é feita por **regex** (contar emojis, medir tamanho, procurar palavras como "mais informal") — não há nenhuma IA lendo *por que* você mudou; (b) **aprovar não ensina nada** (só rejeitar ensina); (c) **imagem não aprende nada**; (d) o mecanismo de "confiança" que separaria uma preferência sólida de um palpite **nunca foi ligado**.

**A boa notícia:** a arquitetura para fazer tudo isso direito **já está montada** (tabelas, fila de eventos, crons, gateway de IA com controle de custo). Falta ligar os fios certos e trocar a "inteligência de regex" por "inteligência de IA". É mais trabalho de **refino e religação** do que de reconstrução.

---

## 2. Como o sistema funciona hoje (visão de conjunto)

```
CONFIGURAÇÃO DA MARCA (o "DNA")
  analyze-brand ───┐
  formulário ──────┼──► brand_context (50+ colunas)
  aprendizado ─────┘
  analyze-visual-identity ──► brand_visual_identity (paleta, estilo, fontes, proibições)
  analyze-strategy (wizard 9 passos) ──► brand_strategy + brand_icp_profiles

           │  (o DNA alimenta tudo abaixo)
           ▼
CALENDÁRIO
  CalendarWizard ──► generate-calendar ──► editorial_calendars + calendar_slots
                     (cria SLOTS = temas/ângulos/CTA, sem texto pronto ainda)
           │
           ▼
GERAÇÃO DE COPY
  generate-content (o motor de verdade, 2.881 linhas)
   - cruza brand_context + estratégia + ICP + preferências aprendidas
   - Claude Sonnet (via OpenRouter) → stream de JSON com slides/legenda/CTA
           │
           ▼
GERAÇÃO DE IMAGEM (2 IAs em sequência)
  generate-image-prompt (Gemini 2.5 Pro = planeja o visual a partir da copy)
        │  unified_style + prompt por slide
        ▼
  generate-image (Gemini 3 Pro Image "Nano Banana Pro" = renderiza)
        │  logo é sobreposto depois, no frontend (canvas)
           │
           ▼
PREVIEW → EDIÇÃO → APROVAÇÃO
  ContentPreview (edita copy, regenera) → aprovação interna ou link público
           │
           ▼ (quando você edita/regenera/rejeita)
MEMÓRIA / APRENDIZADO
  log-learning-event / analyze-content-edit ──► learning_events (fila)
        │  cron a cada 5 min
        ▼
  process-learning-events (REGEX, não IA) ──► brand_preferences
        │  injeta de volta no prompt da próxima geração
        └──► generate-content
```

**Modelos de IA em uso:**
- Copy, calendário, temas, estratégia: **Claude Sonnet** (todas via OpenRouter; os "apelidos" Sonnet 4.6/4.5/4 apontam todos para a mesma string `anthropic/claude-sonnet-4` — o versionamento é cosmético).
- Revisão gramatical e traduções de prompt: **Gemini Flash**.
- Imagem: **Gemini 3 Pro Image** ("Nano Banana Pro"), modelo único e fixo.
- Pesquisa em tempo real: **Perplexity** (`sonar` / `sonar-pro`).

---

## 3. Diagnóstico por subsistema

### 3.1 DNA da marca — rico no banco, furado na ponta

O DNA mora em quatro tabelas: `brand_context` (núcleo, 50+ colunas), `brand_visual_identity` (paleta/estilo), `brand_strategy` + `brand_icp_profiles` (wizard de estratégia), e `brand_preferences` (o que foi aprendido).

**Onde é genuinamente rico:** o `generate-content` injeta ~36 campos (tom, teses, anti-referências, amostras de voz, "inimigo em comum" com mecânica "nós vs. eles", exemplos de copy aprovada). O subsistema de **paleta visual** (cores em hex + papéis + regra de variação) é sofisticado e bem aplicado no planejamento da imagem.

**Campos que morrem no caminho (DNA "morto"):**

| Campo | É gerado/coletado? | Usado no prompt? | Problema |
|---|---|---|---|
| `audience_objections` | analyze-brand gera | ❌ Nunca | O formulário (`BrandContextForm.onSubmit`) descarta no save |
| `core_beliefs` | analyze-brand gera | ❌ Nunca | Idem |
| `niche_glossary` | analyze-brand gera | ❌ Na prática não (bug) | Idem + bug de nome/formato |
| `origin_story`, `authority_proof`, `career_milestones` | coluna existe | ❌ Nunca | Ouro para marca pessoal, nunca exposto no formulário |
| `posting_frequency`, `business_model`, `content_intent` | coletado | ❌ Nunca injetado | Coletado e ignorado |

**Causa-raiz:** `src/components/agencia/BrandContextForm.tsx:450-486` (o `onSubmit`) **não inclui** vários campos no save. Mesmo quando a IA de análise os descobre, o formulário os joga fora.

**Dois bugs concretos** no DNA do estrategista (`supabase/functions/_shared/brand-learning.ts`):
- Linha 108: lê `ctx.mission`, mas a coluna real é `brand_mission` → a Missão **sempre sai "—"**.
- Linhas 122-127: lê `ctx.glossary` (coluna real: `niche_glossary`) esperando um array, mas o dado é salvo como objeto → glossário **sempre "—"**.

**Duas fontes de verdade concorrentes:** persona e dores vivem ao mesmo tempo em `brand_context` E em `brand_strategy`/`brand_icp_profiles`, resolvidas por um `mergeContextWithStrategy` em tempo de geração. O usuário preenche "DNA" em dois lugares com modelos diferentes e não sabe qual versão a IA usou.

### 3.2 Geração de copy — motor forte, marca fraca

`generate-content` é o motor real e é robusto (anti-repetição com base nos últimos hooks, regras anti-clichê de IA, três níveis de `framework_intensity`). Mas:

- **A marca entra depois das regras genéricas e sem peso.** O prompt começa com "Você é o Jimmy, METODOLOGIA JIMMY STUDIO" + regras universais (não inventar números, não usar travessão, evitar clichês). O tom específico da marca é só **mais um item de uma lista de ~35 linhas "campo: valor"**, onde campos vazios viram "N/A" literal e poluem o prompt.
- **`voice_samples` e `approved_copy_examples`** — os campos que melhor capturariam a voz real — entram como bullet comum, **sem few-shot real** ("imite ESTE estilo").
- **Sistema de arquétipos morto:** `buildArchetypeInstructions` (`generate-content/index.ts:1489`) já produz "vocabulário característico" + "tom obrigatório" + "objetivo emocional" por arquétipo — exatamente o que daria personalidade a cada marca — e **nunca é chamado** (0 call sites).

**Duplicação/camadas desnecessárias:**
- Dois agentes de chat concorrentes: `content-creation-agent` (página Assistente) e `jimmy-orchestrator` (rota /jimmychat) — cada um com seu próprio "Jimmy" e sua própria pesquisa Perplexity. Ambos terminam chamando o mesmo `generate-content`.
- Três camadas para gerar uma copy: orchestrator → tool `delegar_gerador_conteudo` → `gerador-conteudo-agent` (wrapper fino) → `generate-content`. O wrapper quase não agrega.

### 3.3 Geração de imagem — DNA forte no texto, perdido na renderização

O fluxo é de duas IAs: uma planeja (Gemini 2.5 Pro escreve um `unified_style` + prompt por slide), outra renderiza (Nano Banana Pro). A identidade visual é **muito bem injetada na etapa de planejamento** (paleta hex + papéis + regra de variação + proibições como "regra absoluta").

**Onde a marca se perde:**
1. **Gargalo do texto:** toda a fidelidade de cor depende de a IA de planejamento ter escrito os hex certos no `unified_style`. Se ela resumir ("tons quentes"), a etapa de renderização **não tem como recuperar** — o gerador de imagem nunca recebe a paleta estruturada como dado, só texto em inglês. E modelos de imagem reproduzem cor por texto de forma imprecisa.
2. **`brand_visual_identity` quase não é relido na renderização** — `generate-image` só busca avatar/nome do Instagram; paleta e proibições só chegam se o texto da etapa 1 as carregou.
3. **Logo nunca entra na geração** (é overlay de canvas no frontend) — a IA pode compor elementos justamente onde o logo vai cair.
4. **`generate-blog-cover` ignora a marca por completo** — capas saem genéricas.
5. **Imagem não aprende nada** (ver 3.5).

### 3.4 Calendário e aprovação — bom modelo, fluxo confuso

O `generate-calendar` é a peça **mais robusta** do sistema (anti-repetição de 90 dias, datas comemorativas, grounding anti-fabricação, rebalanceamento de funil e pilares, hierarquia de prioridade explícita: arquivos → campanha → funil → pilares → DNA). O modelo "slot ≠ conteúdo" é correto.

**Fricções:**
- **Quatro botões de "regenerar" semanticamente diferentes** (tema, legenda, formato, conteúdo+instruções) espalhados entre telas — alta carga cognitiva sobre o que cada um afeta e o que persiste.
- **Quatro status paralelos no mesmo slot** (`status` + `copy_status` + `image_status` + `publish_status`) sem máquina de estados única; transições espalhadas por vários arquivos. Ex.: `markAsPublished` força copy/imagem para "approved" mesmo que nunca tenham sido aprovados.
- **O cliente externo não edita a copy** — só descreve mudanças em texto livre, e alguém interno precisa traduzir isso em regeneração manual. Ida-e-volta caro.
- **Versionamento incompleto:** a edição normal de copy **não cria histórico** (`content_versions` só é gravado na troca de formato). Não há "desfazer".

### 3.5 Memória / aprendizado — o foco central

**Veredito honesto:** o sistema é hoje um **"detector de preferências por regex com persistência"**, não uma memória que aprende de verdade.

**O que funciona (loop fechado):**
- Quando você **edita** uma copy → `analyze-content-edit`; quando **regenera com instrução** → `log-learning-event`; quando o cliente **rejeita com feedback** no link público → `log-public-learning-event`. Tudo cai numa fila (`learning_events`).
- Um **cron a cada 5 min** (pg_cron real) chama `process-learning-events`, que vira preferências em `brand_preferences`, e estas **são injetadas** de volta no prompt do `generate-content` (top 15 por peso).

**As pontas soltas graves:**
1. **Nenhuma IA interpreta as edições.** Toda a "interpretação" é **regex/heurística**: mede comprimento, conta emojis, procura "?" e palavras-gatilho ("mais informal", "tira os emojis"). Não há nenhum prompt de LLM lendo "o que mudou e por quê". A única IA do subsistema é uma tradução PT→EN de prompt de imagem.
2. **O ciclo de validação `detected → confirmed → refuted` é fantasma.** Os campos existem, são lidos e renderizados, mas **nenhuma linha de código jamais escreve `confirmed` ou `refuted`**. Toda preferência nasce "detected" e morre "detected". O `confidence_score` cresce mas **nenhuma query de geração filtra ou pondera por ele** — é decorativo.
3. **Aprovar não ensina nada.** O evento só dispara em rejeição (`PublicApproval.tsx:351-353`). O sinal positivo — "o cliente aprovou exatamente assim" — é descartado. É o oposto de "aprender com as aprovações".
4. **Imagem não aprende.** `generate-image-prompt` não lê `brand_preferences`. Os event_types de imagem (`regen_image_instruction`, `image_selection`) existem mas **não têm analyzer** — caem no `default: return []` e morrem em silêncio.
5. **Sinais baratos desperdiçados:** regenerar tema do slot, regenerar legenda, regenerar slide, e a **rejeição interna** (não-pública) não emitem evento nenhum.
6. **Dupla escrita:** `analyze-content-edit` grava direto em `brand_preferences` E emite um learning_event — edits são processados duas vezes (um TODO de "remover em STORY-017.1" que nunca foi feito).
7. **Matching frágil:** preferências são casadas por `ilike(primeiros 40 chars)` — frases ligeiramente diferentes viram duplicatas em vez de reforçar peso.

**Em que medida aprende hoje:** capta que você tende a encurtar/alongar, tirar/pôr emoji, mudar tom formal↔informal, mudar estilo de hook, e captura CTAs editados. Isso volta como bullets genéricos (ex.: "[length] Prefere textos mais concisos ~30%"). Útil como empurrãozinho, longe de uma memória de marca real. **Não aprende o *porquê*, não aprende das aprovações, não aprende nada de imagem.**

---

## 4. Plano de melhorias priorizado

Ordenado por **relação valor/esforço**. Os primeiros itens são pequenos e de alto impacto; os últimos são estruturais.

### Nível 0 — Correções de bug (horas, alto impacto, baixo risco)
1. **Corrigir o vazamento do formulário** (`BrandContextForm.tsx:450-486`): incluir no save `audience_objections`, `core_beliefs`, `niche_glossary`, `preferred_content_formats`, etc. Hoje a IA descobre e o formulário joga fora.
2. **Corrigir os dois bugs do estrategista** (`brand-learning.ts:108,122`): `ctx.mission` → `ctx.brand_mission`; `ctx.glossary` → `ctx.niche_glossary` (tratar como objeto). Sem isso, Missão e Glossário nunca chegam à análise.
3. **Remover a dupla escrita** do `analyze-content-edit` (a TODO STORY-017.1 nunca feita).

### Nível 1 — Religar o que já existe (dias, transforma a percepção de "DNA rebuscado")
4. **Religar o sistema de arquétipos** (`buildArchetypeInstructions`): chamá-lo dentro do `buildSystemPrompt`. Recupera vocabulário/tom por marca **sem escrever nada novo**.
5. **Few-shot real com `voice_samples`/`approved_copy_examples`:** injetar como bloco de alta prioridade **no topo** do prompt ("imite o ritmo, vocabulário e pontuação destes exemplos reais"), antes das regras genéricas.
6. **Filtrar o "N/A" do dump de marca** (já existe `getLeanBrandDNA`, usado só no caption) — destaca o distintivo, reduz ruído.
7. **Inverter o eixo do prompt:** marca primeiro (arquétipo + voice samples + anti-referências como restrições duras), metodologia depois como guard-rail. Hoje toda marca herda o mesmo "Jimmy" e a marca é um apêndice fraco.
8. **Usar `audience_objections` no copy e enriquecer o prompt de imagem** com `emotional_triggers`, `visual_keywords`, `anti_references` (campos já existentes).

### Nível 2 — A memória que aprende de verdade (o pedido central)
9. **Trocar regex por LLM no `process-learning-events`** (maior alavanca): para uma edição, mandar copy original + editada a um modelo com prompt do tipo *"O usuário editou esta copy. Liste em JSON as preferências de marca demonstradas (categoria, descrição específica, confiança). Foque no porquê estilístico, não em métricas."* A infra de custo (`log-ai-cost.ts`) e gateway (`ai-gateway.ts`) já existem.
10. **Aprender com aprovações positivas:** emitir evento também quando `action === 'approved'`, guardando o conteúdo aprovado como exemplo positivo (a estrutura `brand_examples` está prevista e vazia).
11. **Fechar o ciclo de validação:** copy que respeita uma preferência e é **aprovada sem edição** → marca `confirmed` (+confiança); se o usuário **reverte** → `refuted`. Transforma `confidence_score`/`validation_status` de decorativos em funcionais.
12. **Filtrar a injeção por confiança/status** (priorizar `confirmed` + confiança alta, rebaixar `refuted`) em vez de só por peso cru.
13. **Implementar analyzers de imagem** e ligar `brand_preferences` ao `generate-image-prompt` (hoje cego ao aprendizado).
14. **Capturar sinais baratos hoje perdidos:** regenerar tema, regenerar slide, rejeição interna.
15. **Permitir o cliente externo editar a copy inline** no link de aprovação, gravando como `manual_edit` — transforma o maior gargalo (feedback em texto livre) em sinal estruturado de altíssimo valor.
16. **Melhorar o matching** (embeddings ou normalização) para reforçar peso em vez de duplicar.

### Nível 3 — Simplificação estrutural (reduz a "complexidade sem uso")
17. **Consolidar os dois agentes de chat** num só (provavelmente o orquestrador, que já tem skills/tools/learning).
18. **Eliminar a camada `gerador-conteudo-agent`** (apontar a tool direto para `generate-content`).
19. **Unificar a máquina de estados do slot** num único helper com guardas.
20. **Gravar versão em toda edição** de copy (não só na troca de formato) — habilita histórico/undo.
21. **Decidir o destino das colunas órfãs** (`origin_story`, `authority_proof`, etc.): expor no formulário e injetar, ou remover para reduzir ruído de schema.
22. **Unificar persona/ICP** numa fonte de verdade entre `brand_context` e `brand_strategy`.

---

## 5. Sugestão de sequência (caminho mínimo até "DNA rebuscado + memória que aprende")

Se o objetivo é o que você descreveu — cada marca com DNA mais alinhado + memória que aprende com as edições/aprovações — o caminho mais curto e de menor risco é:

1. **Sprint A (bugs + religar):** itens 1, 2, 4, 5, 6, 7. Resultado visível imediato: a copy passa a soar como a marca, não como "o Jimmy genérico".
2. **Sprint B (memória real):** itens 9, 10, 11, 12. Resultado: o sistema passa a entender *por que* você edita e a tratar aprovação como ensino. Este é o coração do pedido.
3. **Sprint C (imagem + cliente + limpeza):** itens 13, 15, 17, 18.

> ⚠️ **Restrições do projeto** (do CLAUDE.md): produção sem staging, mudanças vão direto pro cliente, e há a armadilha de CSS global. Toda mudança em `ContentPreview`/`PublicApproval` precisa de teste antes. Por isso a sequência prioriza edge functions (backend, mais isoláveis) antes de mexer em UI sensível.

---

## 6. Apêndice técnico — arquivos-chave

**DNA da marca:**
- `supabase/functions/generate-content/index.ts:2433-2469` (injeção de marca), `:854-895` (merge estratégia)
- `supabase/functions/_shared/brand-learning.ts:103-142` (bugs nas linhas 108, 122)
- `supabase/functions/analyze-brand/index.ts:137-205`
- `supabase/functions/analyze-visual-identity/index.ts:139-271`
- `src/components/agencia/BrandContextForm.tsx:450-486` (vazamento do save)
- `src/integrations/supabase/types.ts:1738-2862` (schema brand_context / brand_visual_identity)

**Copy:**
- `supabase/functions/generate-content/index.ts` (motor; arquétipos mortos em `:1489`)
- `supabase/functions/generate-content/framework-instructions.ts`
- `supabase/functions/_shared/agent-skills.ts`, `_shared/agent-tools.ts`, `_shared/editorial-posture.ts`, `_shared/brand-dna-summary.ts`, `_shared/anthropic.ts`

**Imagem:**
- `supabase/functions/generate-image-prompt/index.ts:1797-2125` (planejamento), `:487-699` (multimodal)
- `supabase/functions/generate-image/index.ts:1224-1345`, `:1625-1690` (identity anchor)
- `supabase/functions/_shared/image-model-config.ts:15`, `_shared/openrouter-provider.ts:38-45`
- `supabase/functions/generate-blog-cover/index.ts` (sem marca)
- `src/components/agencia/LogoComposer.tsx`

**Calendário e aprovação:**
- `supabase/functions/generate-calendar/index.ts:672-766` (prompt), `:686-718` (DNA)
- `src/components/agencia/ContentPreview.tsx` (editor; save em `:363`)
- `src/components/agencia/CalendarGridView.tsx:243`
- `src/hooks/useApprovalWorkflow.ts`, `src/hooks/useContentGeneration.ts:538`
- `src/pages/PublicApproval.tsx:210,351-364`

**Memória / aprendizado:**
- `supabase/functions/_shared/preference-analyzers.ts` (regex — coração da "interpretação")
- `supabase/functions/process-learning-events/index.ts` (worker)
- `supabase/functions/analyze-content-edit/index.ts` (dupla escrita)
- `supabase/functions/translate-prompt-adjustments/index.ts` (única IA do subsistema)
- `supabase/migrations/20260502120100_brand_preferences_v2.sql` (confidence/validation — campos mortos)
- `supabase/migrations/20260502120200_cron_process_learning_events.sql` (cron 5 min)
- `src/hooks/useBrandPreferences.ts`, `src/components/agencia/BrandPreferencesManager.tsx` (gestão manual)

**Tabelas centrais:** `brand_context`, `brand_visual_identity`, `brand_strategy`, `brand_icp_profiles`, `brand_preferences`, `editorial_calendars`, `calendar_slots`, `contents`, `content_visual_plan`, `content_image_drafts`, `content_versions`, `approval_history`, `learning_events`.
