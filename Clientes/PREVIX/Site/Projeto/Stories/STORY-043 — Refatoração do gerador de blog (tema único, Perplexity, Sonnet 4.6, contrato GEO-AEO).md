---
id: STORY-043
titulo: "Refatoração do gerador de blog: tema único, pesquisa Perplexity, redação Claude Sonnet 4.6 em contrato GEO/AEO e mapeador determinístico para site.posts (contexto Grupo Previx)"
fase: 6
modulo: "Blog/CMS · Geração de Conteúdo IA"
status: implementado
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-07-11
atualizado: 2026-07-11
depende_de: [STORY-027, STORY-009]
---

# STORY-043 — Refatoração do gerador de blog (Perplexity + Sonnet 4.6, contrato GEO/AEO, mapeador determinístico)

## Contexto

Esta story SUBSTITUI a versão anterior dela, que estava com o escopo errado. A versão anterior mantinha o formato antigo de geração e só acrescentava a pesquisa Perplexity por cima. O piloto (JG) rejeitou esse recorte. O que ele quer é uma REFATORAÇÃO da geração de blog, com um fluxo novo de ponta a ponta.

Como funciona hoje o gerador do Site PREVIX: a Edge Function `generate-post` (Deno, OpenRouter, Claude Sonnet 4.6) monta um system prompt em `buildSystemPrompt` (supabase/functions/generate-post/index.ts:74-153) e pede à IA que devolva UM objeto JSON já no shape do frontmatter de `site.posts` (titulo, slug, lede, conclusoes_principais, estatisticas, faq, corpo_mdx com H2 em pergunta e `<Estatistica>` inline, descricao_seo). A edge NÃO grava o post: ela retorna `{ ok, draft }` (index.ts:387) e quem persiste é o cliente, no `PostEditor.tsx`, via `supabase.schema('site').from('posts').insert/update` sob o JWT/RLS do usuário logado. As estatísticas do artigo não vêm de pesquisa: são recicladas de posts antigos com dedup por `fonteUrl` (index.ts:253-265), e no banco pobre o próprio prompt manda a IA "retornar erro pedindo para cadastrar" (index.ts:123). Não existe nenhuma integração com Perplexity.

Três problemas: (1) a pessoa precisa preencher briefing à mão; (2) o artigo não tem dado real de pesquisa; (3) o formato antigo (IA já emitindo o shape de `site.posts`) mistura estrutura editorial com detalhe de coluna de banco, o que trava a evolução do formato GEO/AEO.

A refatoração desta story separa as duas coisas em camadas limpas:

1. O usuário informa APENAS o tema. Sem briefing obrigatório, sem preencher campo à mão. Briefing e URLs de referência ficam como opcionais.
2. O Perplexity pesquisa e enriquece o tema com dados reais mais citations.
3. O Claude Sonnet 4.6 ESCREVE já no CONTRATO GEO/AEO (o JSON com title, subtitle, intro, tldr, sections, statistics, faq, conclusion, cta, image, meta_description, keywords, reading_time). A IA não emite mais nomes de coluna de banco.
4. O SISTEMA (a própria edge `generate-post`) roda um MAPEADOR DETERMINÍSTICO que traduz o JSON GEO/AEO para o shape de `site.posts` ANTES de retornar o draft. O rascunho já sai completo. Nada é preenchido à mão.

Ponto de desenho central (para conciliar o contrato GEO/AEO rico com o armazenamento e a renderização estáveis do site, sem reabrir o risco de "campo vira vazio em silêncio" que o Jimmy Studio teve): o contrato INTERNO IA para edge passa a ser GEO/AEO, mas o contrato de SAÍDA edge para cliente continua sendo "draft no shape de `site.posts`". O mapeador vive dentro da edge. Assim o `GerarPostModal` e o `PostEditor` quase não mudam: eles continuam recebendo um draft no formato de `site.posts` e persistindo do jeito que já persistem.

O invariante de negócio permanece: a geração nunca publica (o `draft.status` volta sempre `rascunho`, index.ts:367), a geração é restrita a `admin-previx`/`admin-site`/`editor-blog` com JWT validado, a escrita da linha do post é client-side sob RLS do usuário, e a service role da edge só LÊ contexto e grava `site.audit_log`. O `validate-post` segue como rede de segurança no publish.

## Spec de Referência

- [[STORY-027]] Geração de post via IA + Figura ImagePicker (base da Edge Function `generate-post` e do modal `GerarPostModal`).
- [[STORY-009]] Gerador de Blog AEO/GEO (metodologia Jimmy 3.0), origem do lint de qualidade.
- [[STORY-039]] Fonte única DB-only: `src/content/blog/` está VAZIO, `getAllPosts()` (`src/lib/data/posts.ts:44-99`) lê SOMENTE `site.posts`. Impacta a cota de estatística (ver "Decisão sobre cota").
- [[STORY-040]] Gate Jimmy 3.0 no publish: `validate-post` é gate SUAVE ("publicar mesmo assim"), não bloqueio duro.
- Referência de implementação da PESQUISA (repo modelo, NÃO o alvo): triviadash-analytics
  - `supabase/functions/_shared/perplexity.ts` (`searchWithPerplexity`, `formatPerplexityForPrompt`)
  - `supabase/functions/_shared/ai-gateway.ts` (`callAI`)
  - `supabase/functions/generate-content/index.ts` (research antes do Claude, extração de citations)
- Contrato-fonte GEO/AEO de referência (o mesmo formato que esta story adota): triviadash-analytics `generate-content/index.ts:2320-2346`.
- Achatador de referência a NÃO copiar (guarda por truthiness, gera vazio silencioso): triviadash-analytics `BlogManager.tsx:81-130` (`mapAIResponseToBlogArticle`). O mapeador do Previx deve fazer o OPOSTO: assertar presença como o `sanityCheck` do `generate-post` (index.ts:165-180).
- Arquivos do Previx que o mapeador precisa respeitar (componentes e sintaxe MDX exatos):
  - `supabase/functions/generate-post/index.ts` (gerador; `buildSystemPrompt` :74-153; `sanityCheck` :166; parser tolerante a fence/prosa :318-344; anti-colisão de slug :358-366; status :367; audit_log :371-382; timeout do Claude :296)
  - `supabase/functions/validate-post/index.ts` (ÚNICO gate que toca o rascunho gerado; lint 98-218; faq hard-error `< 4` :148; `countContentWords`/faixas de palavras :116-119, :122-131, :146-163, :210-214)
  - `src/lib/data/render-mdx.ts` (renderizador do `corpo_mdx`; :102-148; só entende 4 componentes com atributos string, expressões `{...}` MDX NÃO funcionam; `ICONES_CALLOUT`/`TITULOS_DEFAULT` só têm info/aviso/dica/nota :75-84; cada `<Estatistica>` é envolvido em `\n\n` antes do marked :102-148, então tag no meio da frase quebra o parágrafo em três)
  - `src/pages/noticias/[slug].astro` (onde cada campo aparece; sumário por regex `^##` :35-44; lede :99; conclusoes :102; corpo :114; faq :118; hero renderiza `<h1>{titulo}` :90; bloco CTA só se `!proximoPost && ctaTitulo` :134, link fixo `/contato#orcamento` :139; imagem de capa no hero :86)
  - `src/components/content/*.astro` (Estatistica, Callout, Citacao, FiguraInline, ConclusoesPrincipais, PostFAQ, Sumario)
  - `src/admin/components/GerarPostModal.tsx` e `src/admin/pages/posts/PostEditor.tsx` (recebem e persistem o draft)
  - `supabase/migrations/20260508120000_create_admin_schema.sql:85-119` (colunas de `site.posts`; `estatisticas` jsonb NOT NULL default `'[]'` :107; `imagem_capa` NOT NULL :~; `corpo_mdx` default `''` :107)
- Contexto de marca Previx: `src/content/paginas/sobre.md`, `src/content/servicos/*.md`, `src/content/faq/faq.json`, e no vault `Clientes/PREVIX/Site/Briefing Inicial.md`.

## Objetivo do fluxo (tema -> Perplexity -> Sonnet 4.6 -> preenchimento automático)

O fluxo desejado, ponta a ponta:

1. Input mínimo. O usuário abre o `GerarPostModal` e informa APENAS o tema (mais categoria, que já existe). Campos de briefing e URLs de referência continuam existindo, mas OPCIONAIS. Nada de preencher estrutura à mão.
2. Pesquisa. A edge monta a `searchQuery` a partir do tema mais contexto Previx (serviços, ICP, foco Brasil e São Paulo quando aplicável) e chama o Perplexity ANTES do Claude, via helper portado. Extrai `citations` e guarda o `content` textual da pesquisa (usado depois na verificação de proveniência das estatísticas).
3. Redação. A edge chama o Claude Sonnet 4.6 (via OpenRouter, `response_format` json_object) pedindo o JSON GEO/AEO COMPLETO (contrato abaixo), com o bloco de pesquisa injetado no prompt, o contexto de marca/ICP Previx e a LISTA de assets disponíveis (`site.assets`) para a IA escolher a imagem de capa.
4. Mapeamento automático. A própria edge roda o MAPEADOR DETERMINÍSTICO: pega o JSON GEO/AEO, valida presença E TAMANHO de tudo (sanityCheck adaptado), cruza a proveniência das estatísticas contra as citations e contra o texto da pesquisa, sanitiza travessão e emoji, e traduz para o shape de `site.posts`. Falha explícito se faltar seção, campo, ou se algo sair fora de faixa.
5. Retorno. A edge devolve `{ ok, draft }` com o `draft` JÁ no shape de `site.posts` (mesmo contrato de saída de hoje), acrescido de `geo_meta`.
6. Persistência. O `GerarPostModal`/`PostEditor` recebe o draft pronto e salva em `site.posts` sob RLS do usuário, com `status = rascunho`. O rascunho sai 100% preenchido. A geração NUNCA publica sozinha.

Resumo das camadas: contrato INTERNO IA↔edge = GEO/AEO JSON; contrato de SAÍDA edge↔cliente = draft no shape de `site.posts` (estável). O mapeador é a ponte, e vive só na edge.

## Contrato GEO/AEO (JSON que a IA devolve)

O Claude Sonnet 4.6 passa a devolver EXATAMENTE este JSON. A IA não emite mais nomes de coluna de banco. As estatísticas são um ARRAY ESTRUTURADO próprio (não texto solto): a IA extrai cada número do bloco Perplexity, atribui um `id`, e marca no `content` da seção onde a estatística entra usando o token `{{stat:id}}` em uma LINHA PRÓPRIA. O mapeador é quem transforma o marcador em `<Estatistica ... />` a partir do MESMO objeto do array (fonte única, sem divergência entre os dois stores).

```json
{
  "title": "H1, palavra-chave nas 3 primeiras palavras, max 60 chars",
  "subtitle": "subtitulo complementar",
  "image": "caminho exato de um asset da lista de site.assets fornecida no prompt",
  "intro": "1 paragrafo de 40 a 60 palavras, estatistica mais forte na 2a frase",
  "tldr": ["bullet acionavel 1", "bullet 2", "bullet 3"],
  "statistics": [
    {
      "id": "s1",
      "valor": "numero ou percentual (ex.: 62% ou R$ 1,2 bi)",
      "descricao": "o que o numero significa, minimo 20 chars",
      "fonte": "nome da fonte de autoridade",
      "fonteUrl": "https URL que DEVE estar entre as citations da pesquisa"
    }
  ],
  "sections": [
    {
      "h2": "Pergunta em linguagem natural?",
      "content": "Resposta direta em 40-60 palavras nas 2 primeiras frases, depois contexto. Onde uma estatistica entrar, colocar o token {{stat:s1}} sozinho em uma linha propria (nunca no meio de uma frase).",
      "quote": "citacao de fonte de autoridade (opcional)",
      "bullet_points": ["item1", "item2"],
      "numbered_list": ["passo1", "passo2"],
      "h3_subsections": [
        { "h3": "Sub-pergunta?", "content": "...", "bullet_points": [] }
      ]
    }
  ],
  "faq": [
    { "question": "...", "answer": "resposta objetiva de 40 a 150 palavras, texto puro sem markdown" }
  ],
  "conclusion": "paragrafo final de 50 a 150 palavras reforcando tema + marca",
  "cta": "CTA direcionando a marca",
  "meta_description": "ate 155 chars com a palavra-chave",
  "keywords": ["kw1", "kw2", "Grupo Previx"],
  "reading_time": "X min de leitura"
}
```

Regras de cardinalidade e TAMANHO que o `buildSystemPrompt` deve impor e que o sanityCheck deve verificar (falha explícita quando fora de faixa, para o campo não nascer fora do contrato e só tropeçar no gate suave depois):
- `title`: mira 60 caracteres (regra GEO). Limite DURO do sanityCheck é 80 (o schema de `site.posts` e o `validate-post` toleram 80). Acima de 60 e até 80 é aceitável, não aborta a geração.
- `intro`: 40 a 60 palavras (vira `lede`; `validate-post:116-119`).
- `tldr`: EXATAMENTE 3 itens; cada item 40 a 280 chars.
- `statistics`: opcional (pode vir vazio quando não há dado real; ver "Decisão sobre cota"). Cada item, quando presente, precisa de `id`, `valor`, `descricao (>=20 chars)`, `fonte`, `fonteUrl` (http/https).
- `sections`: MÍNIMO 4. Cada bloco de seção (content + bullets + numbered + H3 aninhados) soma 50 a 150 palavras.
- `conclusion`: 50 a 150 palavras.
- `faq`: 4 a 5 itens (o gate `validate-post:148` erra duro com menos de 4; por isso o piso é 4, não 3), com pelo menos 1 conectando o tema à marca Previx; cada `answer` 40 a 150 palavras.
- `keywords`: 5 a 8 itens, incluindo "Grupo Previx".
- `image`: obrigatório, escolhido da lista de assets fornecida no prompt.
- `quote`, `bullet_points`, `numbered_list`, `h3_subsections`: opcionais por seção.

Regras de estilo "atomic facts" (o prompt deve impor):
- Pirâmide invertida: sob cada H2 e H3, resposta direta e completa nas 2 primeiras frases (40 a 60 palavras). Contexto depois.
- Frases-resposta autocontidas, 10 a 20 palavras. Parágrafos curtos.
- Proibido fluff, superlativo vazio, jargão vago.
- H2 e H3 SEMPRE perguntas em linguagem natural.
- Estatísticas: só do array `statistics`, tecidas pelos marcadores `{{stat:id}}`. Cada `statistics[]` sai do bloco Perplexity, com `valor` que aparece de fato no texto da pesquisa e `fonteUrl` que consta nas citations. SEM cota obrigatória. Sem dado real, deixar `statistics` vazio e argumentar qualitativamente: NÃO inventar número, nunca atribuir número ou citação a "especialista"/"pesquisa" sem fonte verificável. Pelo menos 1 `quote` de autoridade quando a pesquisa fornecer.
- Formatação: NUNCA travessão (— ou –) nem emoji. Usar vírgula, ponto, dois-pontos, hífen simples. Pode usar `**negrito**` e `*itálico*`.

## Mapeador determinístico (GEO/AEO -> site.posts)

O coração da story. A edge recebe o JSON GEO/AEO e produz o shape de `site.posts` por regra fixa, sem improviso. Onde uma transformação exige reescrita (encurtar, expandir, dobrar), a IA já entrega no tamanho certo por instrução no prompt; o mapeador só reorganiza e valida. Nenhum campo é gravado vazio em silêncio.

Sintaxe MDX válida no `corpo_mdx` (render-mdx.ts:102-148): só 4 componentes, todos com atributos string (`attr="valor"`, nada de `{...}`):
- `<Estatistica valor="" descricao="" fonte="" fonteUrl="" variant?="inline|destaque" />` (self-closing; `destaque` é ignorado em post do DB, sempre renderiza inline). Cada tag DEVE ficar em bloco próprio, isolada por linhas em branco (o renderer a envolve em `\n\n`, então tag no meio de uma frase parte o parágrafo em três).
- `<Callout tipo?="info|aviso|dica|nota" titulo?="">md</Callout>` (só esses 4 tipos existem no renderer do DB; NÃO usar `destaque`, que cai em ícone genérico e título "Saiba mais" sem estilo).
- `<Citacao autor="" cargo?="" fonte="" fonteUrl="">texto</Citacao>`.
- `<FiguraInline src="" alt="" legenda?="" credito?="" variant?="default|wide" />`.

Tabela de regras (campo GEO/AEO -> destino em `site.posts`):

| Campo GEO/AEO | Destino em site.posts | Transformação determinística | Armadilha coberta |
|---|---|---|---|
| `title` | `titulo` (string) | Copia direta. Mira 60, tolera até 80. NUNCA emitir `# H1` no `corpo_mdx` (a página já renderiza `<h1>{titulo}` no hero, slug.astro:90). | Emitir `#` no corpo duplica o H1. |
| `subtitle` | `geo_meta.subtitle` (jsonb) | Vai para a coluna nova `geo_meta`. NÃO jogar como parágrafo solto antes do 1º H2 (some do sumário, conta 0 no lint). | Sem coluna própria; sumiria se largado no corpo. |
| `image` | `imagem_capa` (string) | Copia direta o caminho escolhido pela IA da lista `site.assets`. O mapeador VALIDA que o caminho pertence à lista fornecida; se não pertencer, cai no primeiro asset da categoria do post; nunca fica vazio (coluna NOT NULL, usada no hero slug.astro:86). | `imagem_capa` vazio reprova no validate-post:110 e quebra o hero. |
| `intro` | `lede` | A IA já entrega `intro` de 40 a 60 palavras (validate-post:116-119). O mapeador só copia e VALIDA a faixa. Estatística mais forte na 2ª frase (pirâmide invertida). | `intro` fora de 40-60 palavras nasce fora do contrato -> sanityCheck falha explícito. |
| `tldr[]` (exatamente 3) | `conclusoes_principais` (text[]) | Copia os 3 itens. Cada item 40 a 280 chars (validate-post:122-131) -> a IA já entrega expandido. Ênfase deve ser HTML `<strong>...</strong>`, NÃO markdown `**...**` (ConclusoesPrincipais.astro:22-24 usa `set:html`, markdown aparece literal). NÃO recriar como seção `## Principais Conclusões` no corpo. | Bullets curtos (<40 chars) reprovam; `**md**` aparece cru na tela. |
| `sections[].h2` | linha `## {h2}` na coluna 0 do `corpo_mdx` | Prefixo `## ` obrigatório (sumário DB e lint fazem split por regex `^##\s+`, slug.astro:35, validate-post:51). H2 deve ser pergunta. Emitir `<h2>` HTML NÃO conta e zera o sumário. | H2 como HTML zera o sumário em silêncio. |
| `sections[].content` | parágrafo(s) após o `##` | Texto markdown. Os marcadores `{{stat:id}}` viram `<Estatistica ... />` em bloco próprio (ver linha de estatísticas). Cada bloco H2 (com H3 aninhados, exceto texto de `<Estatistica>` que o validate-post descarta) soma 50 a 150 palavras (validate-post:210-214). | Seção fora de 50-150 palavras reprova. |
| `sections[].quote` | blockquote markdown `> {quote}` no bloco do H2 | Usar `>` nativo (marked -> `<blockquote>`). NÃO usar `<Citacao>` aqui: o `quote` é string sem autor/fonte, e `<Citacao>` sem autor/fonte renderiza `<cite></cite>` + href `#` (render-mdx.ts:92-97). `<Citacao autor="" cargo="" fonte="" fonteUrl="">` SÓ quando existir citação REAL atribuída com fonteUrl ∈ citations. | Citação sem fonte vira atribuição quebrada. |
| `sections[].bullet_points[]` | linhas `- {item}` no bloco do H2 | Markdown. Texto CONTA no orçamento 50-150 palavras da seção. | — |
| `sections[].numbered_list[]` | linhas `1. {item}` (2., 3. ...) no bloco do H2 | Markdown. Texto CONTA no orçamento da seção. | — |
| `sections[].h3_subsections[]` | `### {h3}` + content + bullets, dentro do bloco do H2 pai | `splitByH2` só corta em `##`, então todo H3 pertence ao mesmo bloco H2 no cálculo de palavras. Se o bloco do H2 pai estourar 150 palavras, o mapeador PROMOVE a `## {h3}` apenas os H3 cujo próprio texto (content + bullets) já esteja entre 50 e 150 palavras (ver "algoritmo de promoção"). H3 também é pergunta. | H3 rico estoura os 150 da seção pai. |
| `conclusion` | dobrada no FIM do `corpo_mdx` como seção própria `## {pergunta}` | Gerar um H2-pergunta de fecho (ex.: `## Por que agir agora com o Grupo Previx?`) com o texto (50-150 palavras), opcionalmente dentro de `<Callout tipo="dica" titulo="...">`. NÃO deixar parágrafo órfão sem heading. NÃO mapear para `conclusoes_principais` (essa é o `tldr`). | Parágrafo órfão some do sumário e do lint. |
| `faq[]` `{question, answer}` | `faq` jsonb `[{pergunta, resposta}]` | `question`->`pergunta` (>=10 chars), `answer`->`resposta`. Precisa de 4 a 5 itens (piso 4 por causa do hard-error validate-post:148; teto 5 do contrato). A IA já entrega `answer` de 40 a 150 PALAVRAS (validate-post:146-163). `resposta` é TEXTO PURO (`<p>{resposta}</p>`, PostFAQ.astro:33) e entra cru no FAQPage JSON-LD: SEM markdown/HTML. | Respostas curtas (<40 palavras) reprovam; markdown vaza no JSON-LD; menos de 4 FAQs erra duro no publish. |
| `cta` | `cta_titulo` (headline) + `cta_texto` (rótulo do botão) | Derivar do `cta` uma headline de marca em `cta_titulo` (OBRIGATÓRIA e truthy; sem ela o bloco CTA some, slug.astro:134) e um rótulo comercial em `cta_texto` (default "Falar com a Previx"). O LINK é fixo `/contato#orcamento` (slug.astro:139): qualquer URL vinda do `cta` é DESCARTADA. `cta_bg` default `/assets/backgrounds/bg-pb04.jpg`. Atenção: o bloco só renderiza quando `!proximoPost && ctaTitulo`; `cta_titulo` truthy é necessário mas não suficiente. | `cta_titulo` vazio = bloco CTA some sem aviso. |
| `meta_description` | `descricao_seo` | Copia. Máx 155 (o contrato) dentro do teto de 180 do schema (validate-post:165). | Se vazio, a página cai em `lede.slice(0,160)`. |
| `keywords[]` (5-8) | `geo_meta.keywords` (jsonb) | Vai para a coluna nova. Sem coluna tipada em `site.posts`. | Descartado em silêncio se não for para geo_meta. |
| `reading_time` | `geo_meta.reading_time` (jsonb) | Vai para a coluna nova. | Descartado em silêncio se não for para geo_meta. |
| `statistics[]` `{id, valor, descricao, fonte, fonteUrl}` | `estatisticas` jsonb + `<Estatistica ... />` inline no `corpo_mdx` | FONTE ÚNICA dos dois stores. Primeiro filtrar por proveniência (ver CA18) SOBRE o array, ANTES de qualquer assembly. Do array já filtrado: (a) montar `estatisticas` jsonb `[{id, valor, descricao (>=20 chars), fonte, fonteUrl}]`; (b) substituir cada marcador `{{stat:id}}` no `content` por `<Estatistica valor="" descricao="" fonte="" fonteUrl="" />` em bloco próprio. Marcador cujo `id` foi filtrado é REMOVIDO (não deixa tag órfã). O array de frontmatter e as tags inline derivam do MESMO objeto, então nunca divergem. Sem dado real, sai zero estatística (nunca fabricada). | Dois stores independentes podem divergir; marcador órfão infla a contagem do validate-post; sem fonte, não inventar (Article IV). |

Campos preenchidos fora do JSON GEO/AEO (defaults do mapeador): `slug` (kebab de `titulo`, com anti-colisão existente em index.ts:358-366), `autor` fixo `{nome:"Equipe Editorial Previx", cargo:"Comunicação institucional"}`, `status` sempre `rascunho`, `schema_tipo` default `BlogPosting` (`HowTo` só quando o conteúdo for passo-a-passo real), `mostrar_sumario` default `false` (evita TOC com âncoras mortas, pois `renderMdxToHtml` não gera id nos H2), `drop_cap` default `false`.

### Algoritmo de promoção de H3

Regra determinística e testável (evita fabricar seção fora de faixa):

1. Montar o bloco do H2 pai com content + bullets + numbered + todos os H3 aninhados; contar palavras com a MESMA semântica do `countContentWords` do `validate-post` (descontando o texto de `<Estatistica>`).
2. Se o bloco ficar <= 150 palavras, não promover nada.
3. Se estourar 150, promover a `## {h3}` (novo bloco de seção) APENAS os `h3_subsections` cujo próprio texto (content + bullets) já esteja entre 50 e 150 palavras. H3 curto (por exemplo 30 palavras) NÃO é promovido, para não nascer um bloco abaixo do piso de 50.
4. Se, depois de promover todos os H3 elegíveis, o bloco do H2 pai continuar acima de 150 palavras, o mapeador FALHA explícito nomeando a seção (não emite seção inválida).
5. O mapeador CONTA quantos H3 promoveu; esse número entra no invariante de contagem de seções (ver Blindagem).

### Coluna nova geo_meta

`subtitle`, `keywords` e `reading_time` não têm coluna tipada em `site.posts`. Criar UMA coluna jsonb nullable `geo_meta` em `site.posts` (schema `site`, NUNCA `public`) e guardar os três lá: `{subtitle, keywords, reading_time}`. Evita 3 migrações de coluna, mantém os dados GEO disponíveis para SEO/JSON-LD sem poluir o frontmatter tipado, e é reversível. Renderizar `subtitle` a partir de `geo_meta` na página é FORA do escopo desta story (basta persistir e fazer o round-trip no editor).

## Blindagem anti campo-vazio + testes

O maior risco é herdar o padrão do achatador do Jimmy (`mapAIResponseToBlogArticle`, BlogManager.tsx:92-124), que guarda cada bloco por truthiness (`if (section.content)`, `title || ''`, `intro || ''`, `conclusion || ''`) e produz posts estruturalmente válidos porém VAZIOS, sem erro. No Previx isso geraria `corpo_mdx` vazio (coluna default `''`, migration:107), `lede` vazio ou seção H2 de 0 palavras: um post "válido" que publica quebrado.

O mapeador do Previx faz o OPOSTO: assertar presença E TAMANHO, no estilo do `sanityCheck` do `generate-post` (index.ts:165-180). Falha EXPLÍCITA (retorna erro claro, não grava) quando:

- `sections` estiver ausente ou vazio.
- `sections.length < 4`.
- `tldr.length !== 3`.
- `faq.length` fora de 4 a 5.
- Qualquer campo obrigatório vier vazio: `title`, `image`, `intro`, cada `sections[].h2`, cada `sections[].content`, `conclusion`, `meta_description`, `cta`, `keywords`.
- Algum campo sair FORA DE FAIXA de tamanho, medido com a mesma semântica do `countContentWords` do `validate-post` (para os dois não divergirem): `intro` fora de 40-60 palavras; qualquer bloco de seção do `corpo_mdx` fora de 50-150 palavras; a conclusão dobrada fora de 50-150 palavras; qualquer `faq[].answer` fora de 40-150 palavras; `title` acima de 80 chars.
- INVARIANTE DE CONTAGEM DE SEÇÕES (detecta seção PERDIDA, não igualdade rígida): cada `sections[i]` recebida precisa gerar pelo menos 1 bloco `## ` no `corpo_mdx` (nenhuma pode sumir); e a contagem final de blocos `## ` precisa ser igual a `sections.length + h3_promovidos + 1` (a conclusão dobrada). O mapeador conhece `h3_promovidos`, então a asserção usa esse número, NUNCA `N+1` fixo. Uma promoção legítima (que aumenta os blocos) NÃO pode falhar; uma seção que sumiu (N-1) DEVE falhar.
- Uma estatística sobreviver ao cruzamento de proveniência mas ficar sem `valor`, `descricao (>=20 chars)`, `fonte` ou `fonteUrl` válida.

Nunca gravar campo obrigatório vazio em silêncio. A mensagem de erro nomeia o campo e a seção.

Testes unitários do mapeador (obrigatórios, cada tipo de bloco de seção):
- Seção só com `content`.
- Seção com `content` + `quote` (verifica blockquote `>` markdown, não `<Citacao>`).
- Seção com `content` + `bullet_points` (verifica `- item`).
- Seção com `content` + `numbered_list` (verifica `1. item`).
- Seção com `content` + `h3_subsections` aninhado (verifica `### {h3}` e a promoção a `## ` quando o bloco pai estoura 150 palavras).
- Promoção: bloco pai estourado com H3 elegível (50-150 palavras) -> H3 vira `## ` e o INVARIANTE DE CONTAGEM aceita (não falha por N+1). Este caso é o happy-path da promoção.
- Promoção inválida: bloco pai estourado cujos H3 são curtos (<50 palavras) -> mapeador FALHA explícito nomeando a seção, NUNCA emite seção abaixo do piso.
- Seção PERDIDA: uma `sections[i]` que não gerou nenhum `## ` -> FALHA (invariante de seção perdida).
- Seção mista (content + quote + bullets + numbered + h3).
- `tldr[3]` -> `conclusoes_principais` com ênfase em HTML `<strong>`, não `**md**`.
- `intro` -> `lede` (cópia), com caso FORA de 40-60 palavras esperando FALHA.
- `conclusion` -> seção `## {pergunta}` dobrada no fim, nunca em `conclusoes_principais`; caso fora de 50-150 palavras espera FALHA.
- `faq` com 5 itens de 40-150 palavras (sucesso); caso com 3 itens espera FALHA (piso 4); caso com `answer` curto (<40 palavras) espera FALHA do mapeador, não expansão silenciosa.
- `cta` -> `cta_titulo` truthy + `cta_texto`, com URL do `cta` descartada.
- `image` -> `imagem_capa`: caso com caminho fora da lista de assets cai no fallback de categoria e nunca fica vazio.
- `subtitle`/`keywords`/`reading_time` -> `geo_meta`.
- Estatísticas: proveniência filtrada ANTES da assembly. Caso: `statistics` com um item cujo `fonteUrl` está fora das citations E outro cujo `valor` não aparece no texto da pesquisa -> ambos DESCARTADOS, o array `estatisticas` e as tags inline ficam IDÊNTICOS, e o marcador `{{stat:id}}` dos descartados NÃO deixa tag órfã no corpo. Item sobrevivente sem `fonte`/`fonteUrl` reprova por item.
- Casos de FALHA restantes: `sections` vazio; `sections.length < 4`; `tldr.length != 3`; campo obrigatório vazio. Cada um deve lançar/retornar erro claro, nunca gravar.

## Contexto Previx (serviços, marca, ICP, CTA)

O `buildSystemPrompt` injeta, além do tema e do bloco Perplexity, o contexto fixo da marca. A reposição NÃO é troca literal de nome de SaaS: o material de metodologia é peça de venda do Jimmy Studio ("Começar grátis") e precisa virar autoridade da Previx como prestadora do serviço físico.

- Serviços: segurança patrimonial (vigilância armada e desarmada, CFTV, controle de acesso), portaria (presencial e virtual), limpeza e conservação, terceirização de mão de obra, facilities (gestão integrada de múltiplos serviços em contrato único).
- Marca: Grupo Previx, mais de 15 anos de mercado, atuação em São Paulo (capital e região), mais de 500 colaboradores, mais de 100 empresas atendidas. Âncoras de referência: Mackenzie, DASA, Trisul, Pernambucanas, Estapar. O verbo da marca é proteger, planejar, supervisionar, integrar. NUNCA automatizar, gerar ou otimizar conteúdo.
- ICP rebalanceado (ordem por peso real do negócio, conforme sobre.md e briefing): 1) RH, facilities e segurança patrimonial de empresas e indústrias (corporativo); 2) gestores de instituições de ensino e saúde (institucional); 3) operações de logística e varejo, centros de distribuição e lojas; 4) síndicos e administradoras de condomínios residenciais. Residencial é UM dos quatro segmentos, não o padrão. As menções e exemplos devem cobrir os quatro, com corporativo/institucional/logística primeiro.
- Exemplos de afirmação de marca (rebalanceados, nunca só condomínio): "A Previx integra portaria, CFTV e limpeza em um contrato único para centros de distribuição e hospitais."; "A Previx dimensiona vigilância armada e desarmada para plantas industriais e edifícios corporativos."; "No Grupo Previx a avaliação técnica para análise de risco é gratuita."; "A Previx dimensiona a equipe de portaria conforme o fluxo do condomínio."
- CTA comercial e humano. `cta_titulo` OBRIGATÓRIO (senão o bloco some, slug.astro:134). Default de marca, sem travessão e sem emoji: "Solicite uma avaliação gratuita" (headline que o site já usa em servicos/[slug].astro:165). Alternativa: "Proteja seu patrimônio com o Grupo Previx". `cta_texto` (rótulo): "Fale com um especialista do Grupo Previx", "Solicite uma avaliação técnica gratuita", "Faça uma cotação agora" ou "Falar com a Previx". Destino fixo `/contato#orcamento`. Proibido: "automatize seu conteúdo", "comece grátis", "teste a plataforma", qualquer trial de SaaS.
- Vocabulário: "análise de risco" NÃO é produto grátis avulso; é etapa obrigatória de toda contratação ("Sem análise de risco, não há contrato fechado", faq.json:40). O gratuito é a AVALIAÇÃO/VISITA TÉCNICA. Redigir sempre "avaliação técnica gratuita", nunca "análise de risco gratuita" como oferta.
- Autor institucional: nome "Equipe Editorial Previx", cargo "Comunicação institucional". Nunca "Claude" nem "Jimmy Studio" em conteúdo visível ao público.

## Decisão sobre cota de estatísticas

Tensão aparente: o estilo diz "sem cota obrigatória, não invente"; o contrato Previx historicamente exigia `>= 3` estatísticas. O único gate que toca o rascunho GERADO é o `validate-post` (schema DB-only desde STORY-039; `content.config.ts` e `scripts/lint-content.ts` validam apenas `src/content/blog/*.mdx`, que está VAZIO, e Zod é binário, sem "warning").

Decisão: RELAXAR a cota mínima, mantendo a trava de fonte real.

- No `sanityCheck` da edge (novo contrato de entrada GEO/AEO): NÃO reprovar por menos de 3 estatísticas. O sanityCheck valida a ESTRUTURA e o TAMANHO GEO/AEO (`sections >= 4`, cada seção 50-150 palavras, `tldr == 3`, `faq` 4-5 com answer 40-150, `title <= 80`, `intro` 40-60, `conclusion` 50-150, presença de `image`/`intro`/`conclusion`/`meta_description`/`cta`/`keywords`), não a contagem de estatísticas.
- No `validate-post/index.ts`: rebaixar o mínimo de 3 para 1 e converter a falta de estatística de ERRO para WARNING, tanto no array `estatisticas` do frontmatter (linha 135) quanto na contagem de `<Estatistica>` no corpo (linha 202).
- MANTER como ERRO duro a validação POR ITEM: toda estatística presente precisa de `valor` + `descricao (>=20 chars)` + `fonte` + `fonteUrl` (http/https válida). Nada de estatística sem fonte.
- Opcional/defensivo (fora do caminho do gerador): `content.config.ts` `.min(3)` -> `.min(1)` e afrouxar `scripts/lint-content.ts:142`. NÃO afeta o fluxo do gerador (Zod sem warning).
- A pesquisa deve MIRAR 3 ou mais fontes reais quando o tema permitir. O relaxamento é válvula de escape para temas de pouca base pública.

Justificativa: Article IV (No Invention) é prioridade. Uma cota dura de 3 pressiona a inventar. O gate por item (`fonte` + `fonteUrl`) mais o cruzamento contra as citations E contra o texto da pesquisa (CA18) é a rede que impede número solto. Como o `validate-post` é gate suave no publish, a segurança real vem da regra por item e da proveniência, não da contagem.

Alternativa rejeitada: manter `>= 3` exigindo que o Perplexity sempre traga 3 fontes. Acorrenta a publicação à sorte da pesquisa e reabre a porta para preencher cota com dado fraco ou fabricado.

## Fallback

Se a pesquisa Perplexity falhar, der timeout ou retornar sem citations, a geração NÃO bloqueia. O helper `searchWithPerplexity` retorna `null` (nunca lança) e `formatPerplexityForPrompt` retorna string vazia. A redação segue só com contexto interno (marca, serviços, ICP). O post gerado sem pesquisa tende a ter `statistics` vazio, o que é aceitável pela decisão de cota (No Invention vence).

Gatilhos reais de fallback (testáveis): erro HTTP do modelo de pesquisa, timeout do `searchWithPerplexity`, ou `citations` vazias. "Chave ausente" NÃO é fallback: a pesquisa reusa a MESMA `OPENROUTER_API_KEY`, e a edge já retorna 500 duro se a chave faltar (index.ts:204-206) antes de qualquer geração.

## Critérios de Aceite

- [x] CA1. Helper Perplexity portado: existe `supabase/functions/_shared/perplexity.ts` no repo previx-site-app com `searchWithPerplexity(options): Promise<PerplexitySearchResult | null>` e `formatPerplexityForPrompt(result, type)`, delegando a `callAI` de um novo `_shared/ai-gateway.ts`, lendo `OPENROUTER_API_KEY` (a MESMA da redação, sem chave separada), modelo enviado como `perplexity/<model>` e parâmetros específicos (`search_recency_filter`, `search_domain_filter`, `temperature`) em `extraBody`. O resultado expõe as `citations` E o `content` textual da pesquisa (necessário para a verificação de proveniência de CA18). `supabase/functions/_shared/` NÃO existe hoje: ambos os arquivos são criados.
- [x] CA2. Extração de citations em dois caminhos: `result.data.citations` (top-level) e fallback `result.data.choices[0].message.annotations[].url_citation.url`, filtrando strings não vazias. Confiar só no top-level é reprovado.
- [x] CA3. Query com contexto Previx antes do Claude: `generate-post` monta a `searchQuery` a partir do TEMA + serviços/ICP Previx (foco Brasil e São Paulo quando aplicável) e roda a pesquisa ANTES da chamada de redação, injetando o bloco via `formatPerplexityForPrompt(searchResult, 'content')` no prompt.
- [x] CA4. A IA passa a devolver o CONTRATO GEO/AEO: o `buildSystemPrompt` é reescrito para instruir o Claude Sonnet 4.6 a devolver EXATAMENTE o JSON GEO/AEO (`title<=60`, `subtitle`, `image` da lista de assets, `intro` 40-60 palavras, `tldr[3]`, `statistics[]` estruturado com marcadores `{{stat:id}}` no `content`, `sections[>=4]` cada 50-150 palavras, `faq[4-5]` com answer 40-150, `conclusion` 50-150, `cta`, `meta_description`, `keywords[5-8]`, `reading_time`), com as regras de estilo atomic facts, marca/ICP Previx e o bloco de pesquisa. A IA NÃO emite mais nomes de coluna de `site.posts` nem `corpo_mdx` pronto.
- [x] CA5. Redação Sonnet 4.6 preservada: a chamada de redação continua em `anthropic/claude-sonnet-4.6` via OpenRouter, `response_format` json_object, temperature 0.7, `max_tokens` >= 8192 (hoje 16000) para o JSON GEO/AEO não truncar. A pesquisa é uma PRIMEIRA chamada de research, não substitui o modelo de redação.
- [x] CA6. Mapeador determinístico na edge: existe uma função pura de mapeamento GEO/AEO -> shape de `site.posts` que roda ANTES de retornar o draft, seguindo a tabela de regras desta story. O contrato de SAÍDA edge->cliente continua "draft no shape de `site.posts`" (mais `geo_meta`), então `GerarPostModal`/`PostEditor` quase não mudam.
- [x] CA7. Regras de corpo respeitadas pelo mapeador: `title`->`titulo` sem `# H1` no corpo; `intro`->`lede`; `tldr[3]`->`conclusoes_principais` com ênfase HTML `<strong>`; cada `sections[].h2`->linha `## ` coluna 0; `content`->parágrafos com os marcadores `{{stat:id}}` substituídos por `<Estatistica>` em bloco próprio (isolado por linhas em branco, nunca no meio de frase); `quote`->blockquote `>` (nunca `<Citacao>` sem fonte); `bullet_points`->`- `; `numbered_list`->`1. `; `h3_subsections`->`### ` (promovido a `## ` conforme o algoritmo de promoção); `conclusion` dobrada no fim como `## {pergunta}`; `meta_description`->`descricao_seo`; `image`->`imagem_capa`; `cta`->`cta_titulo`+`cta_texto` com URL descartada e link fixo `/contato#orcamento`. `lede`, `conclusoes_principais` e `faq` ficam SÓ no frontmatter, nunca embutidos no `corpo_mdx`.
- [x] CA8. Estrutura editorial respeitando a renderização: o `corpo_mdx` mapeado contém APENAS as seções H2 de conteúdo (>=4, cada 50 a 150 palavras) mais a conclusão dobrada; todo H2 e H3 é pergunta em linguagem natural (nenhum dispara o warning `h2-deveria-ser-pergunta`); pirâmide invertida nas 2 primeiras frases de cada seção; cada `<Estatistica>` fica em bloco isolado por linhas em branco (não parte o parágrafo da resposta).
- [x] CA9. Migration nova cria coluna `geo_meta jsonb` nullable em `site.posts` (schema `site`, nunca `public`). Última migration existente: 20260527190000.
- [x] CA10. Fluxo de `geo_meta` fim a fim: o `draft` retornado carrega `geo_meta = {subtitle, keywords, reading_time}` (montado pelo mapeador na edge); `PostDraft` (GerarPostModal.tsx:9-25) e `PostState`/`EMPTY` (PostEditor.tsx:23-68) estendem `geo_meta`; `handleGenerated` (PostEditor.tsx:213-238) consome `draft.geo_meta`; o payload de save (PostEditor.tsx:248-268) leva `geo_meta` até o `insert/update`. Round-trip: a `queryFn` de load (PostEditor.tsx:117-144) mapeia `data.geo_meta` de volta, senão editar e salvar um post zera o `geo_meta` gravado.
- [x] CA11. Fluxo de CTA fim a fim: `PostDraft` estende `cta_titulo`/`cta_texto`; `handleGenerated` para de hardcodar `cta_titulo:''`/`cta_texto:''`/`cta_bg:''` (PostEditor.tsx:227-229) e passa a consumir `draft.cta_titulo`/`cta_texto`/`cta_bg`; `cta_titulo` nunca chega vazio (default de marca no mapeador); `cta_bg` default `/assets/backgrounds/bg-pb04.jpg`. Observação: o bloco CTA na página só renderiza quando `!proximoPost && ctaTitulo` (slug.astro:134); `cta_titulo` truthy é NECESSÁRIO mas não suficiente (num post com próximo post o bloco não aparece).
- [x] CA12. Blindagem anti campo-vazio: o mapeador FALHA explícito (retorna erro claro, não grava) se `sections` estiver ausente/vazio, se `sections.length < 4`, se `tldr.length != 3`, se `faq` fora de 4-5, se qualquer obrigatório (`title`, `image`, `intro`, `h2`, `content`, `conclusion`, `meta_description`, `cta`, `keywords`) vier vazio, se algo sair fora de faixa de tamanho (`intro` 40-60, seção 50-150, conclusão 50-150, `faq[].answer` 40-150, `title` <= 80), se alguma seção recebida NÃO gerar nenhum bloco `## ` (seção perdida), ou se a contagem final de blocos `## ` não bater com `sections.length + h3_promovidos + 1`. Nunca guarda por truthiness (o oposto de BlogManager.tsx:92-124). O invariante de contagem usa o número de H3 promovidos, nunca `N+1` fixo, para não reprovar promoção legítima.
- [x] CA13. Testes unitários do mapeador: cobrem cada tipo de bloco (só content; content+quote; content+bullets; content+numbered; content+h3 aninhado; misto), a promoção de H3 (happy-path que aceita N+k blocos, e caso inválido de H3 curto que FALHA), a seção perdida (N-1) que FALHA, o `tldr`->conclusoes com `<strong>`, a `conclusion` dobrada, o `cta` com URL descartada, `image`->`imagem_capa` com fallback de categoria, `geo_meta`, os casos de FALHA por tamanho (intro/seção/conclusão/faq answer fora de faixa) e TODOS os caminhos de FALHA de CA12. Cobrem também a proveniência: filtragem ANTES da assembly, estatística com `fonteUrl` fora das citations descartada, estatística cujo `valor` não aparece no texto da pesquisa descartada, marcador de estatística descartada sem tag órfã, os dois stores (array e inline) idênticos, e item sobrevivente sem `fonte`/`fonteUrl` reprovando por item.
- [x] CA14. sanityCheck adaptado ao contrato GEO/AEO: valida `title <= 80` (mira 60, não aborta entre 60 e 80), `sections.length >= 4` com cada seção 50-150 palavras, `tldr.length == 3`, `faq` entre 4 e 5 com answer 40-150 palavras, `intro` 40-60 palavras, `conclusion` 50-150 palavras, e presença de `image`, `intro`, `conclusion`, `meta_description`, `cta`, `keywords`. NÃO reprova por menos de 3 estatísticas (cota relaxada). Substitui o `sanityCheck` antigo, que checava nomes de coluna de `site.posts`.
- [x] CA15. Cota relaxada, escopo correto: o mínimo de estatística cai de 3 para 1 e vira WARNING (não erro) SOMENTE em `validate-post/index.ts` (linha 135, array frontmatter; linha 202, contagem de `<Estatistica>` no corpo). A validação por item (`valor` + `descricao >= 20` + `fonte` + `fonteUrl` válida) permanece ERRO duro. Alterações em `content.config.ts`/`scripts/lint-content.ts` são opcionais e defensivas.
- [x] CA16. Sanitização de travessão E emoji: um passo (a) troca — (U+2014) e – (U+2013) por hífen "-" e (b) remove emoji (strip dos ranges Unicode) em todos os campos textuais do draft mapeado antes de retornar; o rascunho nunca dispara `zero-travessoes` no lint (validate-post:169-197) e nunca nasce com emoji.
- [x] CA17. No Invention por item: toda `estatistica` persistida tem `valor` + `descricao (>=20 chars)` + `fonte` + `fonteUrl` válida, vinda do array `statistics` do contrato (nunca improvisada pelo mapeador). Nenhum número ou citação atribuído a "especialista"/"pesquisa" sem fonte real. Sem pesquisa, `statistics` vem vazio e o post sai com zero estatística (nunca fabricada).
- [x] CA18. Proveniência verificada no edge, ANTES da assembly: montar um `Set` com as `citations` (CA2) e DESCARTAR (contando os descartes) toda estatística do array `statistics` cujo `fonteUrl` não pertença ao Set OU cujo `valor` (dígitos normalizados) não apareça literalmente no `content` textual que a pesquisa retornou (CA1). A filtragem roda SOBRE o array, ANTES de montar o `estatisticas` jsonb e de substituir os marcadores `{{stat:id}}`, para os dois stores derivarem da MESMA lista filtrada e nenhum marcador ficar órfão. É o único ponto onde `citations`, `content` da pesquisa e `fonteUrl` coexistem (o `validate-post` só checa a URL sintaticamente). Sem esse cruzamento, CA17 é só promessa do modelo; pertencer ao Set de URLs sozinho NÃO garante que o número veio da fonte, por isso a checagem de `valor` no texto.
- [x] CA19. Adaptação de marca e CTA: menções ao longo do texto tratam o Grupo Previx como prestador (proteger, planejar, supervisionar, integrar), rebalanceadas entre corporativo/institucional/logística/condomínio; `cta_texto` comercial apontando para `/contato#orcamento`; `cta_titulo` preenchido com default de marca; pelo menos 1 FAQ conecta o tema aos serviços da Previx. Nenhuma menção a SaaS, "automatize", "comece grátis", "análise de risco gratuita" como oferta, ou "Jimmy Studio"/"Claude" no conteúdo visível. Autor fixo `{nome:"Equipe Editorial Previx", cargo:"Comunicação institucional"}`.
- [x] CA20. Fallback gracioso: em erro HTTP da pesquisa, timeout ou `citations` vazias, a geração conclui sem pesquisa (helper retorna null, prompt segue sem bloco de research) e ainda produz um rascunho válido (com `statistics` vazio). "Chave ausente" não é fallback (a edge 500 antes de gerar).
- [x] CA21. Timeout e orçamento de latência (budget DURO, não opcional): `searchWithPerplexity` tem timeout próprio e curto de no máximo 25s (`AbortSignal.timeout(25_000)`); o `AbortSignal.timeout(120_000)` do Claude em index.ts:296 é REDUZIDO para no máximo 100s; a soma (pesquisa + redação) fica comprovadamente abaixo do teto de wall-clock da Edge Function do Supabase. Pesquisa que estoura o timeout retorna null (fallback) SEM consumir o orçamento do Claude. O QA "Perplexity lento" mede o wall-clock total e confirma que a request não morre.
- [x] CA22. Audit log estendido: o insert em `site.audit_log` (tipo `post_generated`) passa a registrar `perplexity_used` (bool), `perplexity_citations_count`, `perplexity_stats_rejected` (quantas estatísticas foram descartadas por proveniência) e os tokens de pesquisa e redação separados, além dos campos atuais (tema, briefing, categoria, schema_tipo, slug, tokens). Best-effort, não bloqueia.
- [x] CA23. Invariante de publicação e camadas: `draft.status` sempre `rascunho`; a geração nunca publica. A GERAÇÃO é restrita a `admin-previx`/`admin-site`/`editor-blog` com JWT validado na edge (auth.getUser). A ESCRITA da linha é client-side no `PostEditor`, no schema `site`, sob RLS do usuário (não service role). A service role da edge só LÊ contexto e grava `site.audit_log`.
- [x] CA24. Tipagem de CTA no validate-post: declarar `cta_titulo?`/`cta_texto?` na interface `PostPayload` (validate-post/index.ts:84-96), que hoje lê esses campos em :178-179 sem declará-los (erro latente em TS strict). Coberto por `npm run typecheck`.
- [x] CA25. Input mínimo do usuário: o `GerarPostModal` gera a partir SÓ do tema (mais categoria); briefing e URLs de referência permanecem opcionais. O rascunho sai 100% preenchido (todos os campos que a página renderiza estão populados, inclusive `imagem_capa`) sem edição manual obrigatória.
- [ ] CA26. (QA pós-deploy) Validação ao vivo: gerar um post real a partir de um TEMA sem estatística prévia no banco (ex.: um serviço da Previx no segmento corporativo/logística), confirmar que o Perplexity trouxe fontes reais (ou que o fallback rodou), que o mapeador produziu um draft completo no shape de `site.posts` com `geo_meta` e `imagem_capa` populados, que o cliente salvou o rascunho em `site.posts`, e que ao abrir no PostEditor o `validate-post` retorna sem erros duros (inclusive faq >= 4; warnings de estatística aceitáveis).

## Implementação

Implementado em 2026-07-11 (branch main, push direto autorizado — Article II).

### File List

Novos:
- `supabase/migrations/20260528120000_add_geo_meta_to_posts.sql` — coluna `geo_meta jsonb` nullable em `site.posts` (CA9).
- `supabase/functions/_shared/ai-gateway.ts` — `callAI` (OpenRouter, parsing seguro + retry curto). Portado/enxuto do Jimmy Studio (CA1).
- `supabase/functions/_shared/perplexity.ts` — `searchWithPerplexity` + `formatPerplexityForPrompt`; citations em 2 caminhos; timeout duro 25s; fallback null (CA1, CA2, CA20, CA21).
- `supabase/functions/generate-post/mapper.ts` — mapeador determinístico GEO/AEO -> site.posts. PURO (sem Deno/imports), roda offline no teste. Coração da story (CA6, CA7, CA8, CA12, CA14, CA16, CA17, CA18).
- `supabase/functions/generate-post/mapper.test.ts` — 23 testes Deno, todos verdes (CA13).

Alterados:
- `supabase/functions/generate-post/index.ts` — REESCRITO: buildSystemPrompt no contrato GEO/AEO + contexto de marca Previx; pesquisa Perplexity antes do Claude; mapeador antes de retornar; audit_log estendido; timeout do Claude 120s -> 100s (CA3, CA4, CA5, CA19, CA22, CA23).
- `supabase/functions/validate-post/index.ts` — cota de estatística 3 -> 1 e ERRO -> AVISO (array e corpo); validação por item mantida como erro; `cta_titulo?`/`cta_texto?` declarados em `PostPayload`; proveniência documentada (CA15, CA24).
- `src/admin/components/GerarPostModal.tsx` — `PostDraft` estende `geo_meta` + `cta_titulo/cta_texto/cta_bg`; copy do modal atualizada para o fluxo novo (só o tema) (CA10, CA11, CA25).
- `src/admin/pages/posts/PostEditor.tsx` — `PostState`/`EMPTY` com `geo_meta`; `handleGenerated` consome `draft.cta_*` e `draft.geo_meta` (fim do hardcode ''); payload de save leva `geo_meta`; round-trip no load; save resiliente (retry sem `geo_meta` se a coluna ainda não existir) (CA10, CA11).

### Verificação

- `deno test supabase/functions/generate-post/mapper.test.ts` -> 23 passed, 0 failed (com type-check).
- `deno check` -> limpo em `mapper.ts`, `_shared/ai-gateway.ts`, `_shared/perplexity.ts` e `generate-post/index.ts` (resolveu as deps jsr do Supabase).
- `npm run typecheck` (astro check) -> **0 erros em `src/`**. Os 191 erros restantes são todos ruído pré-existente de `Deno`/imports remotos em `supabase/functions/**` (o `build` não roda astro check; deploy das edges é manual). Os 2 erros de `cta_titulo/cta_texto` do baseline (CA24) foram eliminados.

### Runbook de deploy (ORDEM IMPORTA)

Aplicar o backend ANTES do frontend ir ao ar, senão um save com `geo_meta` falha (mitigado pelo retry defensivo, mas o correto é a ordem):

```bash
supabase link --project-ref yqexjddpotlaqraljwvl   # se ainda não linkado
supabase db push                                    # aplica a migration geo_meta
supabase functions deploy generate-post
supabase functions deploy validate-post
# frontend: deploy automático no push para main (Netlify)
```

Requisito: secret `OPENROUTER_API_KEY` já configurado no Supabase (a MESMA chave serve pesquisa + redação). Sem ela a edge retorna 500 antes de gerar (não é caso de fallback).

### Pendências (não bloqueiam a implementação)

- CA26 (validação ao vivo): gerar um post real a partir só do tema, com a edge deployada, e confirmar Perplexity + mapeador + save + validate-post sem erro duro. É QA pós-deploy — não dá para rodar localmente (precisa da edge no ar + secret).
- Rotação de segredos (fora do escopo da story, ver [[project_previx_token_rotacao]]): os 3 PATs Supabase e a service_role key seguem pendentes de rotação.

## QA

- [ ] Gerar post COM Perplexity ativo: conferir que as estatísticas do corpo têm `fonteUrl` presentes nas citations, que o `valor` aparece no texto da pesquisa (audit_log `perplexity_citations_count` > 0), e que `perplexity_stats_rejected` reflete os descartes por proveniência (URL fora do Set ou valor ausente no texto).
- [ ] Conferir que o array `estatisticas` do frontmatter e as tags `<Estatistica>` do corpo são IDÊNTICOS (mesma quantidade, mesmos valores) e que nenhum marcador `{{stat:id}}` sobrou no `corpo_mdx`.
- [ ] Gerar post com a pesquisa FALHANDO (simular erro HTTP / timeout / citations vazias, sem mexer na `OPENROUTER_API_KEY`): confirmar que conclui sem erro, `perplexity_used=false`, `statistics` vazio e o rascunho é válido.
- [ ] Testar "Perplexity lento": pesquisa perto do teto de timeout; confirmar corte em 25s, retorno null, e que a redação Claude ainda roda dentro do orçamento (request não morre por wall-clock; medir o tempo total).
- [ ] Rodar os testes unitários do mapeador: todos os tipos de bloco, promoção de H3 (válida e inválida), seção perdida, faixas de tamanho fora de faixa, e todos os caminhos de FALHA (sections vazio, <4 seções, tldr != 3, faq != 4-5, campo obrigatório vazio, contagem divergente) retornam erro claro, nunca gravam vazio.
- [ ] Rodar o `validate-post` sobre um rascunho gerado: nenhum erro duro (faq >= 4 confirmado); warnings de cota de estatística toleráveis.
- [ ] `npm run typecheck` passa, exercitando `cta_titulo?`/`cta_texto?` em `PostPayload` e `geo_meta` no estado/payload do post.
- [ ] Verificar ausência total de — e – E de emoji em titulo, subtitle, lede, descricao_seo, corpo_mdx, cta_titulo, cta_texto, conclusoes_principais, estatisticas e faq.
- [ ] Verificar que todo H2 e H3 é pergunta e que cada seção H2 tem 50 a 150 palavras; que o `corpo_mdx` NÃO contém lede, conclusões nem FAQ embutidos (sem duplicação na página); que cada `<Estatistica>` está em bloco próprio (não parte a frase da resposta na renderização).
- [ ] Verificar que o `tldr` virou `conclusoes_principais` com ênfase em `<strong>` (não `**md**` literal na tela) e que a `conclusion` virou seção `## {pergunta}` no fim, não parágrafo órfão nem item de conclusoes.
- [ ] Verificar CTA: `cta_texto` aponta para `/contato#orcamento`, menciona o Grupo Previx como prestador, sem termo de SaaS; `cta_titulo` preenchido; `cta_bg` = `/assets/backgrounds/bg-pb04.jpg`. Validar a preview do bloco CTA num post SEM próximo post (o bloco é gated por `!proximoPost && ctaTitulo`).
- [ ] Verificar `imagem_capa` populado com um asset real de `site.assets` e o hero renderizando a imagem.
- [ ] Verificar que as menções de marca cobrem segmentos além de condomínio (corporativo/institucional/logística) e que não há "análise de risco gratuita" como oferta.
- [ ] Verificar autor "Equipe Editorial Previx" e ausência de "Claude"/"Jimmy Studio" no conteúdo público.
- [ ] Verificar `geo_meta` populado com subtitle, keywords (5 a 8) e reading_time, sobrevivendo do draft até o registro em `site.posts` e no round-trip (abrir e salvar o post não zera).
- [ ] Verificar slug com anti-colisão e status `rascunho`.
- [ ] Testar acesso negado (403) à GERAÇÃO com usuário sem role permitida; confirmar que a escrita do post respeita o RLS do schema `site`.
- [ ] Gerar a partir de SÓ o tema (sem briefing): confirmar que o rascunho sai completo sem edição manual.

## Notas e Decisões

- Pivô de escopo: esta story SUBSTITUI a versão anterior, que mantinha o formato antigo (IA emitindo o shape de `site.posts`) e só somava Perplexity. Aquilo foi REJEITADO pelo piloto. Agora a IA devolve o JSON GEO/AEO e a edge faz o mapeador determinístico.
- Camadas: contrato INTERNO IA↔edge = GEO/AEO JSON; contrato de SAÍDA edge↔cliente = draft no shape de `site.posts` (estável, mais `geo_meta`). O mapeador vive só na edge, então `GerarPostModal`/`PostEditor` quase não mudam. A edge NÃO persiste; a escrita é client-side sob RLS. A service role só lê contexto e grava `audit_log`.
- Anti "silent empty": a lição do Jimmy Studio é o achatador por truthiness (`if (section.content)`, `x || ''`) que gera post válido-porém-vazio. O mapeador do Previx faz o oposto: assertar presença E TAMANHO e falhar explícito, com testes unitários por tipo de bloco e por caminho de falha. É a garantia principal desta refatoração.
- Estatísticas com PRODUTOR estruturado: o contrato GEO/AEO traz um array `statistics[]` que a IA preenche a partir do bloco Perplexity, com marcadores `{{stat:id}}` no `content` indicando onde cada uma entra. O mapeador vira determinístico de verdade porque parseia UMA fonte de verdade (o array): monta o `estatisticas` jsonb e substitui os marcadores a partir do MESMO objeto, então os dois stores nunca divergem. Sem esse array, extrair valor/descricao/fonte de prosa livre não seria operação determinística.
- Proveniência (Article IV) como invariante VERIFICÁVEL, com ressalva honesta: o cruzamento é `fonteUrl ∈ citations` E `valor` presente no `content` textual da pesquisa (CA18). Pertencer ao Set de URLs sozinho não prova que o número veio da fonte; a checagem do valor no texto fecha a maior parte da brecha, mas não é garantia absoluta de que a afirmação inteira é fiel. A filtragem roda ANTES da assembly, é o único ponto onde citations, texto da pesquisa e fonteUrl coexistem. O `validate-post` só checa a URL sintaticamente; a trava real de proveniência é no edge. Documentar no `validate-post` para não regredir a `>= 3` num refactor futuro.
- Cota: o único gate que toca o rascunho gerado é o `validate-post` (blog DB-only desde STORY-039; `src/content/blog` vazio). Relaxar `content.config.ts`/`lint-content.ts` é opcional e defensivo (Zod é binário, sem warning).
- FAQ: o gate `validate-post:148` erra duro com menos de 4 FAQs. Por isso o contrato pede 4 a 5 (não 3 a 5) e o sanityCheck reprova `< 4`, para o rascunho não passar na geração e falhar no publish. Sempre com pelo menos 1 FAQ de marca. `conclusion` e `subtitle` não são colunas: `conclusion` é dobrada no fim do `corpo_mdx`; `subtitle` vai para `geo_meta`.
- Promoção de H3 vs contagem de seções: a promoção legítima aumenta os blocos `## `, então o invariante NÃO é igualdade rígida `N+1`. Ele detecta seção PERDIDA (nenhum `## ` gerado por uma `sections[i]`) e usa `sections.length + h3_promovidos + 1`. Só se promove H3 já dentro de 50-150 palavras; se o pai continuar estourado depois, o mapeador FALHA em vez de emitir seção abaixo do piso.
- Tamanhos no sanityCheck: além de presença, o mapeador valida faixas (intro 40-60, seção 50-150, conclusão 50-150, faq answer 40-150, title <=80) com a mesma semântica do `countContentWords` do `validate-post`, para os dois não divergirem. O limite de 60 chars do title é MIRA, não hard-fail; o hard-fail é 80 (o que o schema e o gate aceitam), para não abortar uma geração cara por um título de 65 chars perfeitamente publicável.
- Callout: o renderer do DB só conhece info/aviso/dica/nota (render-mdx.ts:75-84); `destaque` não existe e renderiza quebrado. A conclusão dobrada, quando usa Callout, usa `tipo="dica"`.
- Estatística inline: o renderer envolve cada `<Estatistica>` em `\n\n`, então tag no meio da frase parte o parágrafo em três. Por isso o marcador `{{stat:id}}` fica em linha própria e a tag sai em bloco isolado, depois das frases-resposta, não embutida na frase. O word-count do validate-post desconta a tag, então isolar não muda a contagem.
- geo_meta: `subtitle`/`keywords`/`reading_time` não têm coluna tipada; uma única coluna jsonb nova evita 3 migrações e é reversível. Precisa viajar draft -> `handleGenerated` -> payload de save E voltar no load, senão some entre edge e DB ou é zerado ao editar.
- CTA: hoje o `handleGenerated` hardcoda `cta_titulo:''`/`cta_texto:''`/`cta_bg:''` (PostEditor.tsx:227-229) e o mapeador precisa passar a alimentar esses campos; `cta_titulo` vazio faz o bloco CTA sumir. Mas o bloco também depende de `!proximoPost` (slug.astro:134): num post com próximo post ele não aparece mesmo com `cta_titulo` preenchido. A URL do `cta` é sempre descartada (link fixo `/contato#orcamento`).
- imagem_capa: sem campo de imagem no contrato, o mapeador determinístico não teria sinal para escolher um asset relevante. Por isso o contrato ganha o campo `image`, a IA escolhe da lista de `site.assets` injetada no prompt (como o antigo `validImagePaths`), o mapeador valida a escolha e cai no primeiro asset da categoria como fallback, sempre não-vazio (coluna NOT NULL, hero slug.astro:86).
- Vocabulário de marca: "análise de risco" é etapa obrigatória de toda contratação, não oferta grátis avulsa; o gratuito é a "avaliação técnica". ICP rebalanceado: corporativo/institucional/logística primeiro; residencial é um dos quatro. Fonte de verdade: `sobre.md`, `faq.json` e briefing (âncoras Mackenzie, DASA, Trisul, Pernambucanas, Estapar).
- Renderizar `subtitle`/`keywords`/`reading_time` na página pública é FORA do escopo (só persistir e fazer round-trip no editor). Seção "Fontes" separada a partir das citations também é trabalho novo, se o piloto pedir.
- Modelo de pesquisa sugerido: `sonar` por padrão, `sonar-pro` quando houver URLs de referência no briefing. Recency default `month`. `mostrar_sumario` fica `false` por default (o renderer DB não gera id nos H2, então TOC teria âncoras mortas).