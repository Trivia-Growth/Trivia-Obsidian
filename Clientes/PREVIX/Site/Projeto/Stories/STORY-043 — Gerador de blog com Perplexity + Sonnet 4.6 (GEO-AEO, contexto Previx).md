---
id: STORY-043
titulo: "Gerador de artigos de blog com pesquisa Perplexity, redação Claude Sonnet 4.6 e estrutura GEO/AEO no contexto Grupo Previx"
fase: 6
modulo: "Blog/CMS · Geração de Conteúdo IA"
status: rascunho
prioridade: alta
agente_responsavel: ""
criado: 2026-07-11
atualizado: 2026-07-11
depende_de: [STORY-027, STORY-009]
---

# STORY-043 — Gerador de blog com Perplexity + Sonnet 4.6 (GEO/AEO)

## Contexto

O gerador de posts do Site PREVIX hoje é a Edge Function `generate-post` (Deno, OpenRouter, Claude Sonnet 4.6). Ela monta um system prompt via `buildSystemPrompt` (supabase/functions/generate-post/index.ts:74-153) e devolve UM objeto JSON já no shape do frontmatter de `site.posts` (titulo, slug, lede, conclusoes_principais, estatisticas, faq, corpo_mdx com H2 em forma de pergunta e `<Estatistica>` inline, descricao_seo). A edge NÃO grava o post: ela retorna `{ ok, draft }` ao cliente (index.ts:387); quem persiste em `site.posts` é o cliente, no `PostEditor.tsx`, via `supabase.schema('site').from('posts').insert/update` sob o JWT/RLS do usuário logado. Duas limitações centrais motivam esta story:

1. As estatísticas do artigo NÃO vêm de pesquisa. Elas são recicladas de `site.posts.estatisticas` de posts já existentes, com dedup por `fonteUrl` (index.ts:253-265). Com o banco novo ou pobre de estatísticas, o próprio prompt manda a IA "retornar erro pedindo para cadastrar estatísticas" (index.ts:123). Isso é um bootstrap morto: sem dado catalogado, não sai artigo bom.

2. Não existe nenhuma integração com Perplexity. A palavra aparece só como IA-alvo no texto do prompt, no robots.txt, no GTM e em docs. Não há etapa de research antes do Claude nem helper de busca.

O piloto (JG) quer um gerador que receba um TEMA, pesquise dados reais via Perplexity, desenvolva a copy com Claude Sonnet 4.6 e produza um artigo no padrão GEO/AEO (Generative Engine Optimization + Answer Engine Optimization), tudo reposicionado para a marca e os serviços do Grupo Previx. O padrão de pesquisa já existe implementado no repo do Jimmy Studio (triviadash-analytics): helper `searchWithPerplexity`, injeção via `formatPerplexityForPrompt`. Vamos portar SÓ essa cadeia de pesquisa e enriquecer o contrato de saída ATUAL do `generate-post`, sem reescrever o parser que já funciona.

Decisão de escopo (importante): o `generate-post` de hoje já pede à IA o shape de `site.posts` direto. Esta story NÃO introduz o contrato JSON GEO/AEO intermediário do triviadash (title/subtitle/tldr/sections[]/h3_subsections) nem um tradutor sections→MDX. Isso reescreveria um parser estável e reabriria o risco de "campo vira vazio em silêncio". Mantemos o contrato de saída atual e apenas adicionamos: (a) a injeção Perplexity antes do Claude, (b) a marca/CTA Previx, (c) a cota de estatística relaxada, e (d) três campos novos (subtitle, keywords, reading_time) guardados em `geo_meta`.

O invariante de negócio permanece: a geração nunca publica (o `draft.status` volta sempre `rascunho`, index.ts:367), o acesso à geração é restrito a `admin-previx`/`admin-site`/`editor-blog` com JWT validado, a escrita da linha do post é feita pelo cliente sob RLS do usuário, e a service role da edge só LÊ contexto e grava `site.audit_log`. O `validate-post` (rodado no publish) segue como rede de segurança.

## Spec de Referência

- [[STORY-027]] Publicação de Blog PREVIX (EPIC-002): fonte única em `site.posts`, rebuild, gate Jimmy 3.0 no publish. Esta story alimenta esse pipeline com rascunhos melhores.
- [[STORY-009]] Geração de post via IA (base da Edge Function `generate-post` e do modal `GerarPostModal`).
- [[STORY-039]] Coleção `blog` DB-only: `src/content/blog/` está VAZIO (só `.gitkeep`; os 19 posts legados foram para `docs/legacy-blog/`), e `getAllPosts()` (`src/lib/data/posts.ts`) lê SOMENTE `site.posts`. Consequência direta para a cota de estatística (ver "Decisão sobre cota").
- [[Prompt GEO-AEO — contrato de geração]]: o prompt colado pelo piloto (regras 1 a 7), transcrito e adaptado ao Previx na seção "Regras do artigo GEO/AEO" abaixo.
- Referência de implementação da PESQUISA (NÃO é o repo alvo, é modelo a portar): triviadash-analytics
  - `supabase/functions/_shared/perplexity.ts` (helper `searchWithPerplexity`, `formatPerplexityForPrompt`)
  - `supabase/functions/_shared/ai-gateway.ts` (`callAI`)
  - `supabase/functions/generate-content/index.ts` (research antes do Claude, extração de citations, evento SSE `meta.perplexity_citations`)
- Contrato estrutural atual do Previx e onde cada gate atua de fato:
  - `supabase/functions/generate-post/index.ts` (gerador; `sanityCheck` em :166, emissão do shape em :137, status em :367, persistência é no cliente)
  - `src/components/admin/PostEditor.tsx` (persistência real: insert/update no schema `site` sob RLS do usuário, linhas ~272/275) e `GerarPostModal` (`mapFromDraft` ~linha 220, payload de save ~linha 250)
  - `supabase/functions/validate-post/index.ts` (ÚNICO gate que toca posts gerados; `lintPost` 98-218; lede 40-60 palavras em :117; travessão em :169-190; estatística frontmatter em :135; `<Estatistica>` no corpo em :202; leitura de `cta_titulo`/`cta_texto` em :178-179)
  - `src/content.config.ts` e `scripts/lint-content.ts`: gateiam APENAS `src/content/blog/*.mdx`, diretório VAZIO no fluxo DB-only. NÃO gateiam o rascunho gerado. Tocá-los é opcional e defensivo (exports futuros ao Git), nunca o caminho do gerador.
- Renderização (para saber onde cada campo aparece): `src/pages/noticias/[slug].astro` (lede como `<p class=lede>` :99; `conclusoesPrincipais` via `<ConclusoesPrincipais>` :102; `faq` via `<PostFAQ>` :118; bloco de CTA só aparece se `ctaTitulo` for truthy, com `cta_titulo` como `<h2>` em :138 e :134) e `src/pages/admin/posts/preview/[id].astro` (:203 `cta_bg` default `/assets/backgrounds/bg-pb04.jpg`, :205 `cta_titulo`).
- Contexto de marca Previx (fonte de verdade da copy):
  - `src/content/paginas/sobre.md`, `src/content/servicos/*.md`, `src/content/faq/faq.json`
  - Vault: `Clientes/PREVIX/Site/Briefing Inicial.md`

## Regras do artigo GEO/AEO (contrato de geração)

Transcrição essencial do prompt do piloto, já adaptada ao Previx. O redator age como especialista sênior em GEO e AEO. Artigo altamente escaneável, autoritativo, em blocos prontos para extração por modelos RAG. A IA emite os NOMES DE CAMPO do shape atual de `site.posts` (titulo, lede, conclusoes_principais, corpo_mdx, estatisticas, faq, descricao_seo, categoria, cta_titulo, cta_texto), mais os três campos novos de `geo_meta` (subtitle, keywords, reading_time). Não há contrato JSON intermediário.

1. Estrutura e hierarquia (obrigatório)
   - `titulo` (H1) descritivo, palavra-chave principal nas TRÊS primeiras palavras, máximo 60 caracteres (o schema tolera até 80, mas a regra GEO é 60).
   - `lede` (intro): 1 parágrafo, 40 a 60 palavras (enforce real em validate-post/index.ts:117). Renderiza fora do corpo, como `<p class=lede>`.
   - `conclusoes_principais`: EXATAMENTE 3 itens acionáveis (o schema aceita 3 a 5), cada item 40 a 280 caracteres, soma máxima de 100 palavras. Renderiza fora do corpo, via `<ConclusoesPrincipais>`.
   - Dentro do `corpo_mdx`, todo H2/H3 é ESTRITAMENTE uma pergunta em linguagem natural ("Como funciona a portaria virtual?", "Por que o controle de acesso importa para o CD?").
   - Mínimo 4 seções H2 no `corpo_mdx` (sem contar conclusão e FAQ, que ficam nos arrays de frontmatter).
   - `faq`: 4 a 5 pares (interseção entre o prompt, que pede 3 a 5, e o contrato Previx, que exige 4 a 8). Renderiza fora do corpo, via `<PostFAQ>`. Pelo menos 1 FAQ conecta o tema ao Grupo Previx e seus serviços.

2. Estilo "atomic facts" (obrigatório)
   - Pirâmide invertida: sob cada H2/H3, resposta direta e completa nas 2 primeiras frases (40 a 60 palavras). Contexto depois.
   - Frases-resposta autocontidas, 10 a 20 palavras.
   - Parágrafos curtos (máximo 3 a 4 linhas).
   - Proibido fluff, superlativo vazio, jargão vago, frases longas com subordinadas empilhadas.

3. Densidade de evidências (obrigatório)
   - Quando houver dado real (vindo do bloco Perplexity, com fonte citada), usar ao longo do texto via componente `<Estatistica />` no `corpo_mdx` e no array `estatisticas`. NÃO há cota obrigatória: sem dado real, NÃO inventar, usar argumentação qualitativa forte. NUNCA atribuir número ou citação a "especialista" ou "pesquisa" sem fonte real verificável.
   - Incluir pelo menos 1 citação formatada (`<Citacao autor cargo fonte fonteUrl>`) de fonte de autoridade, quando a pesquisa fornecer.
   - Usar listas (bullets ou numeradas) para processos, benefícios e comparações.

4. Referências e CTAs à marca (obrigatório)
   - Menções contextuais e naturais ao Grupo Previx ao longo do texto, sempre como QUEM PRESTA e PLANEJA o serviço físico. O verbo da marca é proteger, planejar, supervisionar, integrar. NUNCA automatizar, gerar ou otimizar conteúdo.
   - CTA final direciona ao Grupo Previx como solução comercial e humana (ver seção "Adaptação de marca").
   - A conclusão reforça como os serviços da Previx se conectam ao tema.

5. Metadados
   - `descricao_seo` máximo 155 caracteres, com a palavra-chave (o schema permite até 180).
   - `keywords`: array de 5 a 8, incluindo "Grupo Previx" (guardado em `geo_meta`).
   - `reading_time` (ex.: "7 min de leitura", guardado em `geo_meta`).
   - `subtitle` (guardado em `geo_meta`).

6. Formato de resposta da IA (campos estáveis, shape de site.posts)

   A IA devolve UM objeto com os campos abaixo (mesma convenção do gerador atual; a edge faz apenas a normalização leve que já existe, ex.: `descricao_seo`→`descricaoSEO`, `conclusoes_principais`→`conclusoesPrincipais`, na hora de montar o draft):
   ```
   { "titulo", "subtitle", "lede",
     "conclusoes_principais":[3 itens, 40 a 280 chars cada],
     "corpo_mdx",
     "estatisticas":[{ "id","valor","descricao","fonte","fonteUrl" }],
     "faq":[{ "pergunta","resposta" }],
     "categoria", "descricao_seo",
     "cta_titulo", "cta_texto",
     "keywords":[5 a 8], "reading_time" }
   ```
   Obrigatórios no `sanityCheck`: os 11 campos atuais MAIS `descricao_seo` (ver CA18). `corpo_mdx` deve conter APENAS as seções H2 de conteúdo (mínimo 4) e a conclusão dobrada no fim. `lede`, `conclusoes_principais` e `faq` NÃO entram no `corpo_mdx` (senão duplicam na página e reprovam no validate-post). `subtitle`/`keywords`/`reading_time` viajam no draft e o cliente os grava em `geo_meta` (ver "Persistência e geo_meta").

7. Formatação
   - NUNCA travessão (—) nem meia-risca (–) em nenhum campo. NUNCA emoji em nenhum campo. Usar vírgula, ponto, dois-pontos ou hífen simples. Nunca começar frase ou item com travessão. Um passo de sanitização, ANTES de persistir, (a) troca — (U+2014) e – (U+2013) por hífen "-" e (b) remove emoji (strip dos ranges Unicode de emoji), senão o publish bloqueia por travessão (validate-post/index.ts:169-190) e o conteúdo nasce com emoji indevido.
   - Pode usar **negrito** e *itálico* markdown. Parágrafos curtos.

## Contexto Previx a injetar (serviços, marca, ICP)

O `buildSystemPrompt` deve injetar, além do TEMA e do bloco de pesquisa Perplexity, o contexto fixo da marca:

- Serviços: segurança patrimonial (vigilância armada e desarmada, CFTV, controle de acesso), portaria (presencial e virtual), limpeza e conservação, terceirização de mão de obra, facilities (gestão integrada de múltiplos serviços em contrato único).
- Marca: Grupo Previx, mais de 15 anos de mercado, atuação em São Paulo (capital e região), mais de 500 colaboradores, mais de 100 empresas atendidas. Clientes-âncora de referência: Mackenzie, DASA, Trisul, Pernambucanas, Estapar.
- ICP (ordem por peso real do negócio, conforme sobre.md e briefing): 1) RH, facilities e segurança patrimonial de empresas e indústrias (corporativo); 2) gestores de instituições de ensino e saúde (institucional); 3) operações de logística e varejo (centros de distribuição, lojas); 4) síndicos e administradoras de condomínios residenciais. Residencial é UM dos quatro segmentos, não o padrão.
- Exemplos de afirmação de marca a injetar (rebalanceados, nunca só condomínio):
  - "A Previx integra portaria, CFTV e limpeza em um contrato único para centros de distribuição e hospitais."
  - "A Previx dimensiona vigilância armada e desarmada para plantas industriais e edifícios corporativos."
  - "No Grupo Previx a avaliação técnica para análise de risco é gratuita."
  - "A Previx dimensiona a equipe de portaria conforme o fluxo do condomínio." (segmento residencial, um exemplo entre vários)
- Autor institucional dos posts: nome "Equipe Editorial Previx", cargo "Comunicação institucional". Nunca citar "Claude" nem "Jimmy Studio" em conteúdo visível ao público. "Jimmy Studio" só pode permanecer como atribuição de metodologia em comentário de dev.

## Persistência e geo_meta (onde cada campo aterrissa)

A geração é em duas camadas. A edge NÃO escreve no post; ela devolve o `draft`. Fluxo dos campos:

1. `generate-post` (service role, só leitura de contexto): roda a pesquisa, chama o Claude, sanitiza (travessão + emoji), cruza a proveniência das estatísticas (ver CA20) e RETORNA `{ ok, draft }`, com `draft` no shape de `site.posts` mais os campos novos `subtitle`, `keywords`, `reading_time`.
2. `GerarPostModal.mapFromDraft` (~linha 220): mapeia o draft para o estado do post no editor, INCLUINDO `geo_meta = { subtitle, keywords, reading_time }`. `geo_meta` precisa existir no tipo do estado do post.
3. `PostEditor.tsx` (~linhas 250/272/275): o payload de save carrega `geo_meta` até o `insert/update` no schema `site`, sob o JWT/RLS do usuário logado (NÃO service role).

Campos preenchidos fora da IA: `slug` (kebab de `titulo`, com anti-colisão existente em index.ts:358-366), `autor` fixo `{nome:"Equipe Editorial Previx", cargo:"Comunicação institucional"}`, `status` sempre `rascunho`, `schema_tipo` default `BlogPosting`, `imagem_capa` da lista `site.assets` (como hoje), `cta_bg` default `/assets/backgrounds/bg-pb04.jpg`, `mostrar_sumario`/`drop_cap` defaults do template.

`estatisticas[]`: cada item `{id, valor, descricao (>=20 chars), fonte, fonteUrl}`, com `fonteUrl` obrigatoriamente pertencente às `citations` retornadas pela pesquisa (CA20). As mesmas viram `<Estatistica valor descricao fonte fonteUrl />` distribuídas no `corpo_mdx`.

### Coluna nova geo_meta

Os campos `subtitle`, `keywords` e `reading_time` não têm coluna tipada em `site.posts`. Criar UMA coluna jsonb nova `geo_meta` (nullable) em `site.posts` e guardar os três lá (`{subtitle, keywords, reading_time}`). Justificativa: evita 3 migrações de coluna, mantém os dados GEO disponíveis para SEO e JSON-LD sem poluir o frontmatter tipado, e é reversível. Migration no schema `site`, nunca no `public`.

A `conclusion` do artigo NÃO tem campo próprio: é dobrada no fim do `corpo_mdx` (opcionalmente dentro de `<Callout tipo="dica">`). O `subtitle` renderiza a partir de `geo_meta` no template (fora do escopo desta story renderizar; basta persistir).

## Decisão sobre cota de estatísticas

Tensão aparente: o prompt diz "sem cota obrigatória, não invente"; o contrato exige `>= 3` estatísticas. Mas o único gate que toca o rascunho GERADO é o `validate-post` (schema DB-only desde STORY-039): `content.config.ts` e `scripts/lint-content.ts` validam apenas `src/content/blog/*.mdx`, que está VAZIO, então não gateiam nada gerado. Além disso, `content.config.ts` é Zod, binário (passa ou falha o build), sem nível de "warning".

Decisão recomendada: RELAXAR a cota mínima SOMENTE no `validate-post`, mantendo a trava de fonte real.

- No `validate-post/index.ts`: rebaixar o mínimo de 3 para 1 e converter a falta de estatística de ERRO para WARNING, tanto no array `estatisticas` do frontmatter (linha 135) quanto na contagem de `<Estatistica>` no corpo (linha 202).
- MANTER como ERRO duro a validação por item: toda estatística presente PRECISA de `valor` + `descricao (>=20 chars)` + `fonte` + `fonteUrl` (URL http/https válida). Nada de estatística sem fonte.
- Opcional/defensivo (fora do caminho do gerador, só se quiser consistência para exports futuros ao Git): em `content.config.ts` trocar `.min(3)` por `.min(1)` (Zod não emite warning) e afrouxar `scripts/lint-content.ts:142`. Deixar explícito que isso NÃO afeta o fluxo do gerador.
- A pesquisa Perplexity deve MIRAR trazer 3 ou mais fontes reais quando o tema permitir. O relaxamento é a válvula de escape para temas com pouca base pública, não a regra do dia a dia.

Justificativa: Article IV (No Invention) é prioridade constitucional. Uma cota dura de 3 pressiona estruturalmente a inventar dados para atingir o número. O gate de `fonte` + `fonteUrl` por item, mais o cruzamento contra as citations (CA20), é a rede que impede número solto. Como o `validate-post` é gate suave no publish (STORY-040, "publicar mesmo assim"), a segurança real vem da regra por item e da proveniência, não da contagem.

Alternativa rejeitada: manter `>= 3` exigindo que o Perplexity sempre traga 3 fontes. Rejeitada porque acorrenta a publicação à sorte da pesquisa e reabre a porta para preencher cota com dado fraco ou fabricado quando a busca rende menos de 3.

## Contexto Previx: adaptação de marca e CTA

A reposição NÃO é troca literal do nome de um SaaS. O material de referência da metodologia é peça de venda do SaaS Jimmy Studio (CTA "Começar grátis"). Isso precisa virar bloco de autoridade da Previx como prestadora do serviço físico.

- Menções de marca: substituir qualquer autopromoção de ferramenta por afirmações de prestação, rebalanceadas entre corporativo, institucional, logística e condomínio (ver exemplos em "Contexto Previx a injetar").
- CTA (botão, `cta_texto`): comercial e humano, apontando para orçamento ou avaliação. Textos aceitos, alinhados à copy viva do site: "Fale com um especialista do Grupo Previx", "Solicite uma avaliação técnica gratuita", "Solicite uma avaliação gratuita", "Faça uma cotação agora", "Solicite seu orçamento personalizado", "Falar com a Previx". Destino: `/contato#orcamento` (ou o `WhatsAppChatWidget` do footer). Proibido: "automatize seu conteúdo", "comece grátis", "teste a plataforma" ou qualquer trial de SaaS.
- Headline do CTA (`cta_titulo`): TEXTO OBRIGATÓRIO, senão o bloco de CTA some na página (`noticias/[slug].astro:134` só renderiza se `ctaTitulo` for truthy). Default padrão, na voz de prestador, sem travessão e sem emoji: **"Solicite uma avaliação gratuita"** (headline que o site já usa em `servicos/[slug].astro:165`). Alternativa aceita: "Proteja seu patrimônio com o Grupo Previx". `cta_bg` default: `/assets/backgrounds/bg-pb04.jpg`.
- Observação de vocabulário: "análise de risco" NÃO é um produto grátis avulso; é etapa obrigatória de toda contratação ("Sem análise de risco, não há contrato fechado", `faq/faq.json:40`). O gratuito é a AVALIAÇÃO/VISITA TÉCNICA durante a qual a análise é feita. Redigir sempre "avaliação técnica gratuita", nunca "análise de risco gratuita" como oferta.
- A FAQ obrigatória de marca conecta o tema aos serviços da Previx (ex.: "Como o Grupo Previx integra portaria e CFTV em um centro de distribuição?"), nunca a um produto de software.

## Fallback

Se a pesquisa Perplexity falhar, der timeout ou retornar sem citations, a geração NÃO bloqueia. O helper `searchWithPerplexity` retorna `null` (nunca lança) e `formatPerplexityForPrompt` retorna string vazia. Nesse caso, a redação segue só com contexto interno (marca, serviços, ICP e, se houver, estatísticas já catalogadas em `site.posts`). O post gerado sem pesquisa tende a ter poucas ou nenhuma estatística, o que é aceitável pela decisão de cota acima (No Invention vence).

Gatilhos reais de fallback (todos testáveis): erro HTTP do modelo de pesquisa, timeout do `searchWithPerplexity`, ou `citations` vazias. "Chave ausente" NÃO é gatilho de fallback: a pesquisa reusa a MESMA `OPENROUTER_API_KEY`, e a edge já retorna 500 duro se `OPENROUTER_API_KEY` faltar (index.ts:204-206) antes de qualquer geração, então sem a chave nada roda (nem a redação Claude).

## Critérios de Aceite

- [ ] CA1. Helper Perplexity portado: existe `supabase/functions/_shared/perplexity.ts` no repo previx-site-app com `searchWithPerplexity(options): Promise<PerplexitySearchResult | null>` e `formatPerplexityForPrompt(result, type)`, delegando a `callAI` de `_shared/ai-gateway.ts`, lendo `OPENROUTER_API_KEY` (a MESMA da redação, sem chave Perplexity separada), com modelo enviado como `perplexity/<model>` e parâmetros específicos (`search_recency_filter`, `search_domain_filter`, `temperature`) em `extraBody`.
- [ ] CA2. Extração de citations em dois caminhos: `result.data.citations` (top-level) e fallback `result.data.choices[0].message.annotations[].url_citation.url`, filtrando strings não vazias. Confiar só no top-level é reprovado.
- [ ] CA3. Query com contexto Previx: `generate-post` monta a `searchQuery` a partir do TEMA + serviços/ICP Previx (foco Brasil e São Paulo quando aplicável) e roda a pesquisa ANTES da chamada ao Claude, injetando o bloco via `formatPerplexityForPrompt(searchResult, 'content')` no user prompt.
- [ ] CA4. Redação Sonnet 4.6 preservada: a chamada de redação continua em `anthropic/claude-sonnet-4.6` via OpenRouter, `response_format` json_object, temperature 0.7, com `max_tokens` elevado (mínimo 8192) para o artigo GEO/AEO não truncar. A pesquisa é uma PRIMEIRA chamada de research, não substitui o modelo de redação.
- [ ] CA5. Estrutura GEO/AEO respeitando a renderização: o `corpo_mdx` gerado contém APENAS as seções H2 de conteúdo (mínimo 4, cada 50 a 150 palavras) e a conclusão dobrada no fim; pirâmide invertida em cada seção (resposta direta nas 2 primeiras frases). `lede`, `conclusoes_principais` e `faq` ficam SÓ nos campos/arrays de frontmatter, renderizados por `<p class=lede>`, `<ConclusoesPrincipais>` e `<PostFAQ>`, NUNCA embutidos no `corpo_mdx` (embutir causa duplicação na página e reprova no validate-post).
- [ ] CA6. H2 e H3 como perguntas: todo H2 e H3 do `corpo_mdx` é uma pergunta em linguagem natural. Nenhum H2 dispara o warning `h2-deveria-ser-pergunta` do lint.
- [ ] CA7. Seções H2 dentro de 50 a 150 palavras cada, e pelo menos 1 H2 no corpo (não reprova `h2-50-150-palavras` nem `sem-secoes-h2`).
- [ ] CA8. Campos gerados no shape de `site.posts`: a IA emite `titulo`, `lede` (40 a 60 palavras), `conclusoes_principais` (3 itens, 40 a 280 chars), `corpo_mdx`, `estatisticas`, `faq` (4 a 5), `descricao_seo` (máx. 155/180), `categoria`, `cta_titulo`, `cta_texto`, mais `subtitle`, `keywords` (5 a 8) e `reading_time`. A edge só aplica a normalização leve já existente para os nomes de coluna; NÃO há tabela de reconciliação nem flatten de sections→MDX.
- [ ] CA9. Migration nova cria coluna `geo_meta jsonb` nullable em `site.posts` (schema `site`, nunca `public`).
- [ ] CA10. Fluxo de `geo_meta` fim a fim: o `draft` retornado pela edge carrega `subtitle`/`keywords`/`reading_time`; `GerarPostModal.mapFromDraft` monta `geo_meta = {subtitle, keywords, reading_time}` no estado do post; o payload de save do `PostEditor` carrega `geo_meta` até o `insert/update`. `geo_meta` está tipado no estado do post e no payload.
- [ ] CA11. Adaptação de marca e CTA: as menções ao longo do texto tratam o Grupo Previx como prestador (proteger, planejar, supervisionar, integrar), rebalanceadas entre corporativo/institucional/logística/condomínio; `cta_texto` é comercial e humano apontando para `/contato#orcamento`; `cta_titulo` é preenchido (nunca vazio) com o default de marca; `cta_bg` recebe `/assets/backgrounds/bg-pb04.jpg`; pelo menos 1 FAQ conecta o tema aos serviços da Previx. Nenhuma menção a SaaS, "automatize", "comece grátis", "análise de risco gratuita" como oferta, ou "Jimmy Studio" no conteúdo visível.
- [ ] CA12. Autor fixo `{nome:"Equipe Editorial Previx", cargo:"Comunicação institucional"}` em todo post gerado.
- [ ] CA13. Fallback gracioso: em erro HTTP da pesquisa, timeout, ou `citations` vazias, a geração conclui sem pesquisa (helper retorna null, prompt segue sem bloco de research) e ainda produz um rascunho válido no schema. "Chave ausente" não é cenário de fallback (a edge 500 antes de gerar).
- [ ] CA14. No Invention por item: toda `estatistica` persistida tem `valor` + `descricao (>=20 chars)` + `fonte` + `fonteUrl` válida. Nenhum número ou citação atribuído a "especialista"/"pesquisa" sem fonte real. Sem pesquisa, o post pode sair com zero estatística (nunca fabricada).
- [ ] CA15. Cota relaxada, escopo correto: o mínimo de estatística cai de 3 para 1 e vira WARNING (não erro) SOMENTE em `validate-post/index.ts` (linha 135, array de frontmatter; linha 202, contagem de `<Estatistica>` no corpo), o único gate que toca o rascunho gerado. A validação por item (fonte + fonteUrl) permanece ERRO duro. Alterações em `content.config.ts`/`scripts/lint-content.ts` são opcionais e defensivas (não afetam o fluxo do gerador; Zod não tem nível de warning).
- [ ] CA16. Sanitização de travessão E emoji: um passo (a) troca — (U+2014) e – (U+2013) por hífen "-" e (b) remove emoji (strip dos ranges Unicode de emoji) em todos os campos textuais antes de persistir; o rascunho gerado nunca dispara `zero-travessoes` no lint, nunca leva a proibição de travessão do validate-post, e nunca nasce com emoji.
- [ ] CA17. Invariante de publicação e camadas: o `draft.status` é sempre `rascunho` e a geração nunca publica. A GERAÇÃO é restrita a `admin-previx`/`admin-site`/`editor-blog` com JWT validado na edge. A ESCRITA da linha do post é client-side, no `PostEditor`, no schema `site`, sob o JWT/RLS do usuário logado (não service role). A service role da edge só LÊ contexto e grava `site.audit_log`.
- [ ] CA18. Audit log estendido: o insert em `site.audit_log` (tipo `post_generated`) passa a registrar `perplexity_used` (bool), `perplexity_citations_count`, `perplexity_stats_rejected` (quantas estatísticas foram descartadas por proveniência, CA20) e os tokens da pesquisa e da redação separados, além dos campos atuais (tema, slug, tokens). Best-effort, não bloqueia.
- [ ] CA19. sanityCheck cobre o novo obrigatório: incluir `descricao_seo` (nome snake_case que o gerador emite, index.ts:137) no `required[]` do `sanityCheck` (index.ts:166). Não duplicar `lede` (já está nos 11 campos atuais). O sanityCheck não reprova por menos de 3 estatísticas (cota relaxada).
- [ ] CA20. Proveniência das estatísticas verificada no edge: antes de retornar o draft, montar um `Set` com as `citations` extraídas (CA2) e DESCARTAR toda estatística cujo `fonteUrl` não pertença ao Set (registrando a contagem no audit_log via `perplexity_stats_rejected`). É o único ponto onde `citations` e `fonteUrl` coexistem (o `validate-post` nunca vê as citations e só checa a URL sintaticamente). Sem esse cruzamento, CA14 é só promessa do modelo.
- [ ] CA21. Timeout e orçamento de latência: `searchWithPerplexity` tem timeout próprio e curto (25 a 30s via `AbortSignal`); a soma `timeout_pesquisa + timeout_redação` cabe no limite de wall-clock da Edge Function do Supabase (reduzir o `AbortSignal.timeout(120_000)` do Claude em index.ts:296 se necessário). Se a pesquisa estourar o timeout, o helper retorna null (fallback) SEM consumir o orçamento do Claude. O cenário "Perplexity lento" é testado explicitamente.
- [ ] CA22. Tipagem de CTA no validate-post: declarar `cta_titulo?`/`cta_texto?` na interface `PostPayload` (validate-post/index.ts:84-96), que hoje lê esses campos em :178-179 sem declará-los (erro latente em TS strict). Coberto por `npm run typecheck`.
- [ ] CA23. Validação ao vivo: gerar um post real a partir de um TEMA que NÃO tenha estatística prévia no banco (ex.: um serviço específico da Previx no segmento corporativo/logística), confirmar que o Perplexity trouxe fontes reais (ou que o fallback rodou), que o cliente salvou o rascunho em `site.posts` com `geo_meta` populado, e que ao abrir no PostEditor o `validate-post` retorna sem erros duros (warnings de estatística são aceitáveis).

## Implementação

(a preencher por @dev)

## QA

- [ ] Gerar post COM Perplexity ativo: conferir que as estatísticas do corpo têm `fonteUrl` presentes nas citations da pesquisa (checar audit_log `perplexity_citations_count` > 0) e que `perplexity_stats_rejected` reflete eventuais descartes por proveniência.
- [ ] Gerar post com a pesquisa FALHANDO (simular erro HTTP / timeout / citations vazias, sem mexer na `OPENROUTER_API_KEY`): confirmar que conclui sem erro, `perplexity_used=false`, e o rascunho é válido.
- [ ] Testar "Perplexity lento": pesquisa perto do teto de timeout; confirmar que o helper corta em 25-30s, retorna null e a redação Claude ainda roda dentro do orçamento (request não morre por wall-clock).
- [ ] Rodar o `validate-post` sobre um rascunho gerado: nenhum erro duro; warnings de cota de estatística toleráveis. (Rodar `npm run lint:content` só se tocou content.config.ts/lint-content.ts; ele não gateia o rascunho gerado.)
- [ ] `npm run typecheck` passa, exercitando `cta_titulo?`/`cta_texto?` em `PostPayload` e `geo_meta` no estado/payload do post.
- [ ] Verificar ausência total de — e – E de emoji em titulo, subtitle, lede, descricao_seo, corpo_mdx, cta_titulo, cta_texto, conclusoes_principais, estatisticas e faq.
- [ ] Verificar que todo H2 e H3 é pergunta e que cada seção H2 tem 50 a 150 palavras; que `corpo_mdx` NÃO contém lede, conclusões nem FAQ embutidos (sem duplicação na página).
- [ ] Verificar CTA: `cta_texto` aponta para `/contato#orcamento`, menciona o Grupo Previx como prestador, sem termo de SaaS; `cta_titulo` preenchido; `cta_bg` = `/assets/backgrounds/bg-pb04.jpg`; o bloco de CTA aparece na preview.
- [ ] Verificar que as menções de marca cobrem segmentos além de condomínio (corporativo/institucional/logística) e que não há "análise de risco gratuita" como oferta.
- [ ] Verificar autor "Equipe Editorial Previx" e ausência de "Claude"/"Jimmy Studio" no conteúdo público.
- [ ] Verificar `geo_meta` populado com subtitle, keywords (5 a 8) e reading_time, sobrevivendo do draft até o registro em `site.posts`.
- [ ] Verificar slug com anti-colisão e status `rascunho`.
- [ ] Testar acesso negado (403) à GERAÇÃO com usuário sem role permitida; confirmar que a escrita do post respeita o RLS do schema `site`.

## Notas e Decisões

- Escopo enxuto: mantido o contrato de saída atual do `generate-post` (IA emite o shape de `site.posts` direto). NÃO foi importado o contrato JSON GEO/AEO intermediário do triviadash (title/subtitle/tldr/sections[]/h3_subsections) nem um tradutor sections→MDX; isso reescreveria um parser estável e reintroduziria o risco de "campo vira vazio em silêncio". Portado SÓ o helper de pesquisa Perplexity, mais os quatro deltas de valor (pesquisa, marca/CTA, cota relaxada, geo_meta).
- Camadas: a edge NÃO persiste o post. Ela retorna `{ ok, draft }`; a escrita em `site.posts` é client-side no `PostEditor` sob RLS do usuário. `geo_meta` precisa viajar draft → `mapFromDraft` → payload de save, senão some entre o edge e o DB. A service role da edge só lê contexto e grava `audit_log`.
- No Invention (Article IV) vira invariante VERIFICÁVEL pelo cruzamento `fonteUrl` ∈ `citations` no edge (CA20), único ponto onde as duas coisas coexistem. O `validate-post` só checa a URL sintaticamente e nunca vê as citations, então a trava real de proveniência é no edge; a cota passa a ser gate suave por decisão constitucional. Documentar isso no `validate-post` para não regredir a `>= 3` num refactor futuro.
- Cota: o único gate que toca o rascunho gerado é o `validate-post` (coleção `blog` DB-only desde STORY-039; `src/content/blog` vazio). Relaxar `content.config.ts`/`lint-content.ts` é opcional e defensivo; Zod é binário (sem warning).
- FAQ: o prompt pede 3 a 5, o contrato Previx exige 4 a 8. Resolvido para 4 a 5 (interseção), sempre com pelo menos 1 FAQ de marca. `conclusion` e `subtitle` não são colunas tipadas: `conclusion` é dobrada no fim do `corpo_mdx`; `subtitle` vai para `geo_meta`.
- Citations: aqui a fonte vira `fonteUrl` das estatísticas persistidas (o que o gate do Previx exige) e é filtrada pela proveniência (CA20). NÃO está no escopo renderizar uma seção "Fontes" separada no post; se o piloto quiser depois, é trabalho novo (consumir `meta.perplexity_citations` no cliente + campo/coluna de fontes + render).
- Vocabulário de marca: "análise de risco" é etapa obrigatória de toda contratação, não oferta grátis avulsa; o gratuito é a "avaliação técnica". Copy alinhada ao site (faq.json, index.astro, sobre.astro, servicos/[slug].astro).
- ICP rebalanceado: corporativo/institucional/logística vêm primeiro; residencial é um dos quatro segmentos. Fonte de verdade: `sobre.md` e briefing (âncoras Mackenzie, DASA, Trisul, Pernambucanas, Estapar).
- Modelo de pesquisa sugerido: `sonar` por padrão, `sonar-pro` quando houver URLs de referência no briefing. Recency default `month`. Ajustar por tema.