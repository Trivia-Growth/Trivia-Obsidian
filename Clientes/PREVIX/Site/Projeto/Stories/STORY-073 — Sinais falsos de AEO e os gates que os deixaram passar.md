---
id: STORY-073
titulo: "Sinais falsos de AEO e os gates que os deixaram passar"
fase: 7
modulo: "Site · AEO/GEO"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-09-02
atualizado: 2026-09-02
epico: EPIC-002
tipo: correcao
executor: cli
---

# STORY-073 — Sinais falsos de AEO e os gates que os deixaram passar

## Origem

JG trouxe um relatório de AEO/GEO feito para outro site (o do psicólogo Leandro Sola) e
pediu para ver o que faltava no site da Previx.

**A resposta curta é que o site já estava à frente daquele checklist em quase todos os
itens.** llms.txt, robots com bots de IA, JSON-LD, canonical, privacidade, Search Console e
validação automatizada já existiam, em geral mais ricos. CSP completa, HSTS, 410 para paths
do WordPress, TTFB de 58 ms, HTML 100% estático, e os quatro crawlers de IA testados recebem
a página inteira.

O que faltava era outra coisa, que o relatório não contempla: **três sinais que mentiam para
os buscadores** e **dois gates de build que passavam vazios**. JG pediu escopo máximo.

## Diagnóstico

### D1 — `dateModified` era carimbo de operação, não de edição

27 dos 28 posts tinham `atualizado_em` idêntico **ao microssegundo**. Cadeia fechada de ponta
a ponta:

- `atualizado_em` sobe em qualquer UPDATE (trigger `trg_posts_atualizado_em`);
- `noticias/[slug].astro:61` alimentava `dateModified` direto dessa coluna;
- o RPC `site.reorder_posts` faz `set ordem = ..., atualizado_em = now()` item a item;
- `handleSaveOrder` manda a **lista inteira**, não só os movidos, e dispara rebuild.

**Um clique em "Salvar ordem" reescrevia a data de modificação do blog inteiro e publicava na
hora.** Não foi acidente de migration: repetia a cada reordenação.

### D2 — `HowTo` inválido em 3 posts publicados

`buildArticle` montava um objeto só e devolvia com `as Article | BlogPosting | HowTo`. O cast
calou o compilador, e saíam nós `HowTo` sem `step` (obrigatória) e com `headline` (que
`HowTo` não possui). Parser estrito descarta o nó inteiro, levando junto `author`,
`publisher` e as datas.

O `HowTo` foi escolha deliberada do [[Plano AEO-GEO — Previx nas Respostas das IAs]]. Mas os
H2 desses posts são taxonomia de tópicos ("O que é", "Comparativo de custos"), não
procedimento: derivar `step` seria fabricar um passo a passo que o texto não descreve. E o
Google aposentou o rich result de HowTo em setembro de 2023.

### D3/D4 — Open Graph

`og:type` era `"website"` inclusive nos 25 posts, sem nenhuma meta `article:*`. Nenhuma
imagem OG tinha razão de card, e `/servicos` e `/contato` usavam **retrato 1080×1350**.

### G1 — o gate de schema validava 3 de 25 posts

`validate-schema.ts` usava lista escrita à mão. Foi por essa fresta que o `HowTo` passou. Não
olhava canonical, `og:`, `twitter:`, robots, sitemap nem links.

### G2 — o lint não apodreceu: foi movido, e a premissa caiu

Correção ao diagnóstico inicial. O `lint:content` vazio é decisão escrita em
`architecture.md:215` (ADR-010): "vira no-op, lint roda no Edge Function `validate-post`". O
que mudou depois e ninguém reconciliou:

- o ADR dizia "Painel **bloqueia** publicação"; hoje é diálogo com "Publicar mesmo assim"
  (STORY-040);
- as regras **divergiram**: `validate-post` relaxou `<Estatistica>` para `>= 1` aviso
  (STORY-043 CA15) e o script manteve `>= 3` duro;
- nada revalidava conteúdo já publicado, nem cobria escrita por SQL.

### C1 — ligar o painel ao JSON-LD publicaria duas regressões

JG decidiu tornar `site.configs_seo` a fonte do JSON-LD. Com os dados de então:

1. `configs_seo.empresa.whatsapp` era `551138751148` — o **telefone fixo**. O default do
   próprio `ConfigsSeoPage` trazia esse número.
2. `areas_atendidas` não tinha "Brasil", e ler do banco sem mais nada desfaria o fix do
   commit `8076324` (STORY-066) calado.

## O que o gate novo achou na primeira execução

- **11 dos 25 posts publicavam um `FAQPage` OCO**: o jsonb `faq` era
  `[{pergunta:"",resposta:""}]`. Ninguém via porque esse campo não é renderizado para o
  humano, só vira JSON-LD.
- 3 descrições passavam de 180 chars. O "40-180" da migration original é **comentário, não
  CHECK**.
- `/servicos/limpeza`: 36 páginas linkavam para um 404.
- Slug `e2e-minimercado-...-570195` publicado e indexado.

## Mudanças

| Pacote | Commit |
|---|---|
| dateModified, HowTo, og:type, imagens OG | `06fe6fd` |
| Gate que descobre as páginas | `9fb871c` |
| robots, llms.txt, llms-full.txt, RSS gerados | `9f8a6ee` |
| sitemap lastmod + imagens, Blog, Bing | `427d54e` |
| painel vira fonte do JSON-LD, geo_meta visível | `ece8d04` |
| lint em modo relatório, slug, tipos | `6b408cf` |

Migrations: `20260902140000` (conteudo_atualizado_em), `150000` (schema_tipo sem HowTo),
`160000` (descrições no teto), `170000` (prosa do llms.txt no banco), `180000` (reconciliar
configs_seo), `190000` (slug sem prefixo e2e).

## Decisões de projeto

- **Trigger condicional, não escrita pelo editor.** O trigger tem o `OLD` por construção e
  cobre todo escritor, inclusive `reorder_posts`, psql e o Studio. Válvula de sessão
  `previx.pular_conteudo_ts` para migration de correção em massa declarar que não é novidade
  editorial. **Provada em migration real**: a de descrições rodou, o texto mudou e o carimbo
  continuou nulo.
- **Sem backfill de `conteudo_atualizado_em`.** Não há fonte para reconstruir a data
  editorial real. `NULL` com fallback para `publicado_em` é a única afirmação defensável.
- **A tabela do gate descreve TIPOS, não PÁGINAS.** Vocabulário fechado de ~20 entradas que
  muda uma vez por ano, contra um conjunto aberto que cresce toda semana. A lista curada
  sobrevive como `ROTAS_OBRIGATORIAS`, gate de existência.
- **"Brasil" no `areaServed` fica no código, não no banco.** É estrutural, e no código
  ninguém o apaga sem querer pelo painel. O gate prova que continua lá.
- **`/servicos/limpeza`: tirei o link em vez de criar a página.** A copy legada é pré-v7
  (+500 colaboradores, e um ganho de 30% sem fonte) e a página renderiza descrições de
  sub-serviço que não existem. A rota segue pronta: basta a linha em `site.servicos`.
- **Lint em modo relatório.** Religar o bloqueio é decisão de política, e derrubar a main por
  dívida editorial acumulada seria o gate provando a entrega em vez da decisão.

## Verificação

- `npm run build` verde: 36 HTMLs varridos, 35 indexáveis validados por perfil, 25 posts com
  data conferida, 0 links quebrados. Antes: 9 páginas.
- `npm run typecheck`: 223 → 143 erros (regen de tipos), 0 warnings.
- Ligação painel → JSON-LD **provada com sentinela**: valor distinto no banco, build, achado
  no `description` do Organization e do LocalBusiness, revertido.
- Trigger provado nas quatro fases: UPDATE de ordem e de capa **não** carimbam, UPDATE do
  corpo carimba, e a válvula suprime.
- Gate provado contra a regressão: recriei `public/robots.txt` e o build caiu.
- `dek` medido em 1280 e em 375: hierarquia 56/18/14 px, sem overflow horizontal.

## Adendo: FAQ escrita para os 11 posts (02/09/2026)

Commit `c78076c`, migration `20260902200000`, deploy `6a983161`. **53 perguntas, 4 a 6 por
post**, respostas entre 82 e 98 palavras. **25 de 25 posts com FAQPage em produção.**

Article IV respeitado: toda resposta sai do próprio artigo. Nenhum número novo foi
introduzido; as estatísticas citadas já estavam no corpo dos posts com `fonte` e `fonteUrl`.
Validei contagem de palavras, duplicidade, travessão e vocabulário proibido antes de gerar o
SQL.

### O gate disparou, e estava certo

`faq` está na lista editorial do trigger, então os 11 posts receberam carimbo de revisão com
o mesmo timestamp. O gate derrubou o build: 11 posts alegando revisão no mesmo instante é
**indistinguível, só pelo timestamp**, de um UPDATE em massa vazando.

A mensagem de erro previa um só desfecho (usar a válvula) e faltava o segundo: **quando o
lote é real, quem sabe é quem o fez.** Deliberadamente NÃO usei a válvula aqui: adicionar FAQ
é revisão editorial de verdade, e suprimir o carimbo seria mentir na direção oposta à do
defeito que esta story corrigiu.

Nasceu daí o `LOTES_EDITORIAIS_CONHECIDOS`, indexado pelo **timestamp exato**. É isso que
impede a lista de virar buraco permanente: entrada antiga para de casar com qualquer coisa, e
um novo UPDATE em massa gera outro timestamp e derruba o build de novo. Cada linha cobre um
evento, e só ele. O lote reconhecido sai como **aviso visível** no log, não em silêncio.

### Verificado no ar

| O quê | Resultado |
|---|---|
| Posts com FAQPage | 25 de 25 |
| Perguntas por post | 4 a 6 |
| Question/Answer vazios | 0 |
| llms-full.txt | 285 KB → 320 KB, com a FAQ nova |
| Blocos JSON-LD por post | 6, todos parseáveis |

Nota operacional: o primeiro `netlify deploy` falhou com
`TypeError: Cannot read properties of undefined (reading 'packageName')` no CLI 27.4.2.
Repetir o mesmo comando resolveu. Transitório, não configuração.

## Adendo: vocabulário de categoria fechado (02/09/2026)

Commit `c88b20c`, migration `20260902210000`, deploy `6a98344c`.

### O que estava errado

Sete valores para 27 posts, com sobreposição real. `Facilities` (5) e `Multisserviços` (3)
eram o **mesmo pilar** (o serviço no site se chama "Multisserviços (Facilities)"), e
`Segurança` (2), `Notícias` (1) e `Notícias · Segurança` (1) eram órfãs.

Pior que a bagunça: existiam **três vocabulários e nenhum casava com os dados**.

| Onde | O que oferecia |
|---|---|
| `site.posts.categoria` | os 7 valores acima |
| `<input>` do PostEditor | texto livre, qualquer coisa |
| `CATEGORIAS_SUGERIDAS` do GerarPostModal | 6 opções, das quais `Postes IA`, `Casos de Sucesso` e `Tecnologia` **nunca** foram usadas |

E os três posts sobre portaria terceirizada estavam em três categorias diferentes:
Facilities, Segurança Eletrônica e Segurança Patrimonial.

### O que foi feito

Nova tabela `site.categorias_post` como fonte única, com quatro categorias alinhadas aos
pilares vendidos. `servico_id` amarra o cluster editorial ao serviço, que é o ganho de AEO:
o blog deixa de ser 25 posts soltos. O `slug` já deixa pronta a rota de hub.

| Categoria | Posts | Pilar |
|---|---|---|
| Segurança Eletrônica | 9 | `eletronica` |
| Multisserviços | 8 | `facilities` |
| Segurança Patrimonial | 5 | `patrimonial` |
| Institucional | 5 | — |

Cada destino foi decidido lendo título e lede, não por substituição mecânica: **portaria
virtual é eletrônica, portaria terceirizada é mão de obra**, e case, parceria e oferta
comercial falam da Previx, não de um tema técnico.

### Três camadas, cada uma cobrindo o furo da anterior

1. **FK `posts_categoria_fk`** — nem SQL escapa. Testada: recusa com `23503`.
2. **`<select>` lendo do banco** no PostEditor e no GerarPostModal. Categoria nova entra sem
   deploy; tirar de circulação é `ativo=false`, não editar constante e torcer para ninguém
   reverter. A lição da STORY-068 fica mais forte assim.
3. **Checagem no build**, para o caso de alguém remover a constraint.

Dois cuidados de UI que evitam troca silenciosa de dado: o `<select>` do PostEditor preserva
valor fora do vocabulário como opção visível, em vez de cair para a primeira opção; e o
GerarPostModal só aplica default depois que a lista chega pela rede.

`categoria` não está na lista editorial do trigger, então a recategorização corretamente
**não** contou como revisão. Conferido: seguem 11 carimbados (o lote da FAQ), não 27.

### Verificado no ar

Quatro categorias, zero órfãs, consistentes em todas as superfícies: `articleSection` do
JSON-LD, agrupamento do llms.txt, `<category>` do RSS e o badge da listagem. Os três posts
de portaria terceirizada agora aparecem juntos em Multisserviços.

Typecheck em 143 erros, o mesmo de antes; zero nos arquivos novos.

### Desbloqueado

O hub por categoria (`/noticias/categoria/<slug>`) estava travado exatamente por isto. Com o
vocabulário fechado e o `slug` na tabela, ele passa a ser trabalho direto: quatro páginas com
`CollectionPage` + `ItemList` e link de cada página de serviço para o hub correspondente.

## Adendo: hubs por categoria (02/09/2026)

Commit `9371f1b`, deploy `6a983fdb`. Quatro páginas em `/noticias/categoria/<slug>`, rota de
dois segmentos, sem colisão com `/noticias/<slug>`.

**O ganho de AEO não é a página: é o `about` do CollectionPage apontando para o `@id` do
Service.** Isso transforma "25 posts soltos" no corpo de conhecimento de um pilar que a
empresa efetivamente vende. Para isso o nó `Service` ganhou `@id` (não tinha), e `hasPart`
referencia cada post pelo `@id` que a página dele já emite, então o grafo mescla em vez de
duplicar.

O laço fecha nos dois sentidos: chips por categoria com contagem na listagem, o hub linkando
de volta para o índice e para o serviço do pilar, e a página de cada serviço com botão para
os artigos daquele pilar.

Categoria sem post publicado não gera página: hub vazio é página fina.

### Duas coisas que só a medição pegou

1. `.btn-ghost` global é branco sobre transparente, feito para hero escuro. O bloco de
   serviço tem fundo claro, e o botão sairia **invisível**. Variante navy escopada em
   `.svc-block .actions`.
2. O gate reclamou de `hasPart` pela mesma razão que já havia reclamado de `blogPost`: nó
   dentro de coleção é resumo, não declaração canônica.

**E uma armadilha de método:** medi primeiro no `astro dev` e ele mostrou os DOIS botões sem
estilo nenhum, inclusive o "Solicitar orçamento" que já existia e sempre funcionou. O
`site.css` não carregava naquela rota em dev. O `dist/` tinha as regras e o `<link>`
corretos. Como o adapter Netlify não suporta `astro preview`, servi o `dist/` com
`npx serve` e aí a medição bateu. **Medir no dev quase gerou um "conserto" de um defeito que
não existia.**

### Verificado no ar

| O quê | Resultado |
|---|---|
| Os 4 hubs | 200, com `CollectionPage` |
| `about` → `@id` do Service | resolve (conferido `/servicos/facilities#service` nos dois lados) |
| Chips na listagem | Patrimonial (5), Eletrônica (8), Multisserviços (8), Institucional (4) |
| Botão nas 3 páginas de serviço | "Ler os N artigos sobre …" |
| Hubs no sitemap · no llms.txt | 4 · 4 |
| Layout medido no build servido | 1280: botões 196x53 e 374x53 lado a lado · chips 37px, raio 999px · 375: 3 linhas, sem overflow |

40 HTMLs no build, contra 36.

## Adendo: política do lint resolvida (02/09/2026)

Commit `29b988f`, migrations `20260902220000` e `230000`, deploy `6a984524` + edge
`validate-post`.

### Regras em um lugar só

`supabase/functions/_shared/lint-jimmy.ts` é um módulo **puro** (sem I/O, sem API de Deno,
sem import), importado pelo `validate-post` (Deno) **e** pelo `scripts/lint-content.ts`
(Node/tsx). O validate-post caiu de 266 para 71 linhas. A divergência que existia
(`<Estatistica>` >= 1 aviso na edge contra >= 3 erro no script) morre por construção: agora é
a mesma função.

### A política

| Camada | Papel |
|---|---|
| `validate-post`, no save | **Confirmação**, não bloqueio. O autor pode seguir com "Publicar mesmo assim" (STORY-040) |
| `lint:content`, no build | **Bloqueia**, com catraca. `TETO_DE_DIVIDA` por campo; teto zero para todo campo sem entrada |

O gate de build cobre o que a edge não alcança: post publicado por SQL, post antigo que nunca
passou pelo editor, e o autor que clicou em "Publicar mesmo assim".

Não é lista de exceção por slug: é teto por **tipo de violação**, então post novo com o mesmo
defeito derruba o build. **Testei as duas direções**: teto em 3 derruba com exit 1 nomeando o
post e a seção; teto em 5 passa e avisa para baixar o número.

### O que a régua completa achou

Aplicada pela primeira vez ao conteúdo publicado, ela apontou 58 violações. Duas viraram
correção em vez de dívida aceita:

1. **`estatisticas` estava OCA em 13 dos 25 posts** (52 violações), mesmo padrão do `faq`:
   `[{"valor":"","fonte":"",...}]`. Invisível porque o campo é lido no build e **nunca
   renderizado**. Extraí as 50 estatísticas das próprias tags
   `<Estatistica valor descricao fonte fonteUrl />` do corpo: mesmo dado, agora estruturado,
   zero invenção. **COM válvula**, porque o texto renderizado não muda.
2. **Dois posts concentravam o resto.** `beneficios-...` tinha título de 97 chars (teto 80),
   lede de 79 palavras (faixa 40-60) e resposta de FAQ com 36 (mínimo 40).
   `terceirizacao-servicos-limpeza-guia` tinha 3 perguntas, a primeira vazia. Corrigidos com
   material do próprio artigo. **SEM válvula**, porque aqui o texto muda para o leitor.

O contraste entre esses dois casos é a válvula funcionando nas duas direções, que era
justamente o desenho.

### Estado final

**A catraca começa em 4**: quatro seções H2 fora da faixa de 50-150 palavras, em quatro
posts. Todo o resto está em zero.

Verificado no ar: título e lede novos publicados, o guia de limpeza com 5 perguntas, e **zero
`"name":""`** em todo o blog.

## Adendo: catraca zerada (02/09/2026)

Commit `f3aefa3`, migration `20260902240000`, deploy `6a9847d5` + edge `validate-post`.

A catraca nasceu em `corpo_mdx: 4` e fechou em **zero no mesmo dia**. Teto existe para dívida
que não dá para pagar; aquela dava.

| Seção | Antes | Tratamento |
|---|---|---|
| "Portaria presencial, remota ou híbrida" | 36 palavras | Contexto tirado das duas seções seguintes |
| "O que o cliente da Previx disse" | 33 de prosa autoral | Contexto que o próprio depoimento relata |
| "Benefício sozinho não sustenta equipe" | 156 | Fecho enxugado, sem perder afirmação |
| "Quando vale a pena contratar portaria" | 151 | Frase de transição enxugada |

### A quinta ocorrência virou regra, não conteúdo

O depoimento media **312 palavras** porque a contagem incluía a citação reproduzida na
íntegra. `countContentWords` passou a excluir blocos `<Citacao>`: a faixa de 50-150 mede
densidade da **prosa autoral**, e encurtar a carta de um cliente para caber nela falsificaria
a fonte.

Confirmei o alcance antes de mexer: **apenas 2 posts usam `<Citacao>`**, então a mudança não
relaxa nada em silêncio. Como a regra vive no módulo compartilhado, ela passou a valer para a
edge e para o gate ao mesmo tempo, com um único deploy.

Efeito colateral que o próprio lint apontou: sem a citação, a seção caiu para 33 palavras e
virou **curta demais**. Ou seja, a regra nova não escondeu o problema, mudou o diagnóstico.

### O mecanismo dos lotes foi exercido de novo

Os 4 posts receberam o mesmo carimbo, o gate parou o build, e o timestamp entrou em
`LOTES_EDITORIAIS_CONHECIDOS`. **Segunda vez no dia**, e das duas o gate parou antes de eu
registrar, que é exatamente o comportamento desenhado.

`TETO_DE_DIVIDA` fica **vazio**: teto zero em todo campo. Acrescentar uma linha ali passa a
ser admissão explícita de dívida.

### Verificado no ar

Os dois trechos novos publicados, o **depoimento íntegro** (fecho presente), e os 4 posts com
`dateModified` em `2026-09-02T15:57:00.066Z`.

## Adendo: deploys parados e o painel volta a bloquear (25/09/2026)

Nenhuma publicação entrou no ar entre 10/09 e 25/09. Foram duas causas em sequência, e a
segunda só ficou visível depois de resolver a primeira.

**1. Acesso ao repositório.** Todo build morria no clone com `remote: Repository not
found` (exit 128). O Netlify clona pela instalação `126522961` do app Netlify na
organização Trivia-Growth, configurada com *repositórios selecionados*. A lista foi alterada
em **11/09 às 22:54**, depois do último deploy bom (10/09) e antes da primeira falha (23/09).
A instalação seguia funcionando para outros sites: o `atendimentotrivia` clonou por ela em
23/09, uma hora antes da Previx falhar. O `previx-site-app` tinha saído da lista. JG
readicionou o repositório. Quem mexeu não aparece pela API (o audit log da organização não
é exposto); fica em Settings → Audit log, filtro `integration_installation`, 11/09.

**2. O gate desta story travou o site inteiro.** Com o clone de volta, o build passou a
falhar no `lint:content`: 11 violações no post `implantacao-previx-portaria-zeladoria-condominio`,
publicado em 24/09 às 22:46 pelo **"Publicar mesmo assim"** (o audit_log registra as duas
publicações do Arthur, com 11 violações cada). O diálogo do painel dizia que publicar assim
"reduz a chance de ser citado por IAs". Desde a política de 02/09, publicar assim barrava
todo build seguinte.

**O erro foi desta story.** O adendo da política do lint escreveu que o gate "cobre o autor
que clicou em Publicar mesmo assim". Cobrir era travar: a regra era a mesma nas duas pontas,
mas só o build bloqueava, e a falha acontecia longe de quem clicou. O post também estava
estruturalmente quebrado, não só fora de contagem:

- duas seções do corpo tinham ido parar no campo `pergunta` do FAQ, com parágrafo inteiro
  e uma resposta vazia;
- `<Citacao>` aberto e nunca fechado;
- `fonteUrl` sem `https://`, e uma estatística afirmando "a adesão segue crescendo em 2026",
  que a página da SíndicoNet não diz (os números 78,2%, até 30% e 40% conferem);
- uma resposta citando a CNseg sem fonte.

**Correções (commit `7f245fd`, migration `20260925120000`):**

- **Painel bloqueia.** O botão "Publicar mesmo assim" saiu; o diálogo explica que um post com
  erro impede qualquer atualização de entrar no ar. O **Preview de post publicado**, que salva
  com status publicado e dispara rebuild sem validar, passou pelo mesmo gate. Validação
  indisponível também bloqueia. O registro `publicado_com_violacao_jimmy3` no audit_log ficou
  sem uso e saiu.
- **Post corrigido por migration**, preservando o texto do autor. As seções voltaram ao corpo,
  o `<Citacao>` foi fechado e a carta do cliente ficou íntegra, com três intervenções
  marcadas: travessão virou hífen, "como o esse" virou "como o [condomínio]" e a introdução
  deixou de dizer "sem cortes". O FAQ ficou com 5 perguntas, o lede com 58 palavras e o
  título ganhou o acento em "Síndica". Sem válvula, porque o texto muda para o leitor.
- A mensagem do `lint:content` imprimia "Campos todos os demais campos têm teto zero"
  (interpolação errada), e foi corrigida. O CLAUDE.md ainda descrevia o gate como "modo relatório".
- `architecture.md` (ADR-010) ganhou a revisão com o motivo.

**Pendente com o Arthur:** a pergunta "Quais práticas da Previx garantiram o resultado
positivo desde o primeiro dia?" lista 5 práticas que a carta não menciona. Uma delas,
"falhas operacionais herdadas", é do *outro* depoimento publicado. Passa no lint, mas não
tem fonte neste caso.

**Lição.** Quando duas camadas aplicam a mesma regra, a que fala com o autor tem que dizer
o que a que publica vai fazer. Um aviso que o build contradiz é pior que nenhum aviso: o
autor segue tranquilo, e o site para sem ninguém saber.

## Aberto (decisão do JG)

1. **`dateModified` anda para trás** no primeiro rebuild em produção — de 02/09 para as
   respectivas `publicado_em`. Intencional; o Google recalibra, mas aparece no Search Console.
2. ~~11 posts sem FAQ real.~~ **Resolvido em 02/09/2026** — ver adendo acima.
3. **Token do Bing Webmaster Tools.** O `msvalidate.01` já está no layout e não é emitido
   enquanto `empresa.verificacoes.bing` estiver vazio.
4. **Política do lint (ADR-010).** O build volta a bloquear? Sugestão: alinhar as regras com
   o `validate-post`, erro duro só onde zero posts falham hoje, e catraca no resto.
5. **Vocabulário de `categoria`** antes de qualquer hub. Hoje é `<input>` livre com 6 valores
   sobrepostos: `Facilities` (5) e `Multisserviços` (3) são a mesma coisa; `Segurança` (2) e
   `Notícias · Segurança` (1) são órfãs.
6. **`astro check` entra no build ou no CI?** Hoje não roda em lugar nenhum.
7. **`/servicos/limpeza`**: criar a página exige copy aprovada pela Previx.

## EM PRODUÇÃO (02/09/2026)

Merge fast-forward na `main` (`5105cc1..6b408cf`, 6 commits, 50 arquivos) e deploy
`6a982a943db3024e810d9516`.

A GitHub Action falhou pela terceira vez seguida no passo "Deploy to Netlify" com
`Unauthorized: could not retrieve project` — o token temporário do Netlify segue expirado
(desde a STORY-072). A Action **monta o site corretamente** e morre na última linha. Publiquei
pela sessão local do `netlify-cli`, conferindo antes que o CLI apontava para
`previx-site-app` / `f95cfc51-9cf1-4f00-912b-a57755b7107f` (a sessão local alcança dois times).

**A janela de risco do slug fechou:** o 301 entrou na `main` junto com a migration.

### Verificado no ar

| O quê | Resultado |
|---|---|
| `Claude-SearchBot`, `Claude-User`, `Perplexity-User` no robots | presentes |
| `Disallow: /` solto | 0 |
| `HowTo` nos 3 ex-posts | 0, 0, 0 |
| `dateModified` == `datePublished` nos 25 posts | 25 de 25 — **nenhum post alega revisão que não teve** |
| llms.txt / llms-full.txt / rss.xml | 200 · 27,9 KB / 285 KB / `application/rss+xml` |
| posts no llms.txt · itens no RSS | 25 · 25 |
| `lastmod` · `<image:loc>` no sitemap | 25 · 25 |
| `Blog` em /noticias | presente |
| slug antigo | 301 para o novo; novo 200 |
| `/feed` | 301 para `/rss.xml` (era sitemap) |
| `/servicos/limpeza` no rodapé | 0 referências |
| `og:type` + `article:*` no post | `article` + published/modified/section |
| `og:image:width/height` em /contato | 1200 × 630 |
| `FAQPage` oco | some onde não há FAQ; permanece onde há |
| Identidade do `configs_seo` | telefone em E.164; `areaServed` do LocalBusiness com "Brasil" |
| GPTBot, ClaudeBot, Claude-SearchBot, PerplexityBot, Perplexity-User | 200, 59.757 b cada |

`npm run build` verde a partir da `main`: 36 HTMLs, 35 indexáveis por perfil, 25 posts com
data conferida, 0 links quebrados.

### Pendência de infraestrutura, não desta story

O **token do Netlify** continua expirado no GitHub Secrets. Enquanto não for renovado, toda
publicação exige o passo manual pelo CLI local. `NETLIFY_SITE_ID` é da mesma data (11/07) e
vale conferir junto. Ver [[STORY-072 — Geração de post morre quando a IA erra a pontuação do JSON]].

## Estado anterior: código na branch, banco já em produção

Os commits estão em `feat/aeo-geo-sinais-gates-artefatos`. **As seis migrations já foram
aplicadas no banco de produção.** O site publicado continua servindo o HTML do build
anterior, então nada mudou para o visitante ainda.

Quase tudo é inerte até o merge: a coluna nova não é lida pelo código publicado, as chaves
`llms_*` são ignoradas, e `schema_tipo = 'Article'` é aceito pelo código antigo sem
problema.

> **Uma exceção, com janela de risco real.** A migration `20260902190000` renomeou o slug do
> post do minimercado, e o 301 correspondente está no `netlify.toml` **desta branch**. Se
> alguém publicar um post pelo painel antes do merge, o rebuild sai da `main` — com o slug
> novo vindo do banco e **sem** o redirect. A URL antiga, hoje 200 e indexada desde maio,
> passaria a 404 até a branch entrar.
>
> Conferido em 02/09/2026: `origin/main:netlify.toml` não tem a regra, e
> `/noticias/e2e-minimercado-autonomo-24h-parceria-previx-click-pronto-570195` responde 200.
>
> Some no instante em que a branch for para a `main`.
