---
id: STORY-066
titulo: "Site comunica cobertura só de São Paulo"
fase: 7
modulo: "Site · Conteúdo e SEO local"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-08-05
atualizado: 2026-08-05
epico: EPIC-BRANDING-V7
tipo: conteudo
executor: codigo+painel
---

# STORY-066 — Site comunica cobertura só de São Paulo

> Item 3 de [[A aplicar no Site Previx]]: *"hoje o site limita o mercado percebido a SP"*.
> Dr. Ricardo corrigiu na devolutiva de 26/05: **atendimento em todo o Brasil, com sede em SP**.

## Diagnóstico (código e banco, 05/08/2026)

Não é uma frase infeliz num canto. A restrição a São Paulo está **estruturada** no site.

### 1. O rodapé lista bairros, em todas as páginas

`src/config/empresa.ts:54-75` define `areasAtendidas` com 18 entradas, comentada como
*"Bairros e zonas de atuação principal em São Paulo (B2B)"*: São Paulo, Vila Hamburguesa,
Lapa, Pinheiros, Vila Olímpia, Itaim Bibi, Moema, Brooklin, Vila Madalena, Vila Mariana,
Tatuapé, Mooca, Santo Amaro, Morumbi, Alphaville, Barueri, Osasco, Guarulhos.

`src/components/layout/SiteFooter.astro:41-43` consome assim:

```ts
const cidade = empresa.areasAtendidas[0];        // "São Paulo"
const bairros = empresa.areasAtendidas.slice(1, 9);
const aindaMais = empresa.areasAtendidas.length - 9;
```

Ou seja: **toda página do site termina com uma lista de bairros da capital.** Para um
prospect em Recife ou Curitiba, o rodapé responde a pergunta antes do comercial responder.

A mesma lista aparece em `src/lib/data/configs.ts:49` (`AREAS_FALLBACK`) e como default do
painel em `src/admin/pages/configs/ConfigsSeoPage.tsx:49`. A fonte primária é
`site.configs_seo`, editável em `/admin/configs/seo`.

### 2. O CTA do rodapé também restringe

`SiteFooter.astro:52`:

> "Atendimento comercial sob medida para empresas, condomínios e instituições **em São Paulo**."

### 3. O FAQ diz que fora de SP é exceção

`site.faq`, id `previx-areas-atendidas` ("Em que cidades e regiões a Previx atende?"),
resposta no ar hoje:

> "A Previx atende São Paulo capital e região metropolitana, incluindo […] Para
> necessidades **fora dessas regiões**, fale com o time comercial em (11) 3875-1148."

O texto trata o Brasil como fora do escopo padrão. É o oposto do posicionamento v7.

### 4. Meta descriptions

`index.astro:40` e `faq.astro:45` terminam em "em São Paulo" — tratado na **STORY-065**.

### 5. O bloco de números

A descrição do item de clientes diz "empresas atendidas em São Paulo" — **STORY-063**.

## A tensão real desta story

O site foi construído com **SEO local** deliberado: bairros no rodapé, perguntas do tipo
"Quanto custa portaria virtual em São Paulo?", "atende meu bairro?". Isso tem valor de busca
concreto e não deve ser jogado fora.

O que muda é a **moldura**: hoje o site diz *"atendemos São Paulo"*; precisa dizer
*"atendemos o Brasil, com sede e forte presença em São Paulo"*. A lista de bairros deixa de
ser o limite e passa a ser a prova de densidade na praça principal.

Essa decisão de redação precisa ser tomada antes de mexer no código — não é refactor.

## Escopo

### ✅ Inclui

1. Definir a moldura nacional na copy: rodapé, FAQ de regiões, CTA do rodapé.
2. Rodapé passa a comunicar cobertura nacional **sem perder** o valor de SEO local dos
   bairros (ex.: "Atendimento em todo o Brasil · Sede em São Paulo" acima da lista).
3. Corrigir o CTA de `SiteFooter.astro:52`.
4. Reescrever a resposta de `previx-areas-atendidas` no `/admin/faq`: nacional primeiro,
   densidade em SP depois, sem tratar o resto do país como exceção.
5. Revisar o comentário de `empresa.ts:53` e o rótulo do campo em `/admin/configs/seo`, que
   hoje ensinam ao próximo editor que a lista é "de São Paulo".
6. Verificar se há schema.org de `areaServed`/`LocalBusiness` limitando a cidade
   (`src/lib/seo.ts`).

### ❌ NÃO inclui

- As meta descriptions (**STORY-065**) e o bloco de números (**STORY-063**), mesmo que
  ambos também citem São Paulo.
- Criar páginas por cidade ou estado.
- As perguntas de SEO local existentes ("atende meu bairro?") — permanecem.

## Critérios de Aceite

- [x] CA1 — Nenhuma página comunica São Paulo como limite de atendimento.
- [x] CA2 — O rodapé afirma cobertura nacional e mantém a lista de bairros como densidade
      local, não como escopo.
- [x] CA3 — A resposta do FAQ sobre regiões começa pelo Brasil e não trata outras praças
      como exceção a negociar.
- [x] CA4 — Nenhum dado estruturado (schema.org) declara área de atuação restrita à capital.
      *(Não estava cumprido na primeira passada: os schemas de `Service` e `LocalBusiness`
      declaravam `areaServed` só com os 18 bairros. Corrigido em `src/lib/seo.ts` —
      "Brasil" entra primeiro na lista. Conferido no JSON-LD do HTML gerado.)*
- [~] CA5 — `npm run build` verde; `typecheck` com os mesmos 215 erros pré-existentes
      (ver STORY-065).

## Riscos

- **Perder ranking local.** As buscas por bairro convertem. Ampliar a moldura sem remover os
  termos locais é o ponto de atenção da story inteira.
- **Divergência de contagem já existente:** duas respostas do FAQ falam em "17 regiões" e
  "18 regiões" para a mesma lista. Ao reescrever, parar de contar — número de regiões é
  dado que envelhece sozinho, igual ao caso dos anos na STORY-063.
- A lista tem **duas fontes** (`site.configs_seo` com fallback em `empresa.ts`). Corrigir só
  o código deixa o banco mandando; corrigir só o banco deixa a armadilha para o próximo
  ambiente. Ver [[feedback_caminho_morto_nao_e_dado_morto]].

## Links

- [[A aplicar no Site Previx]] — item 3
- [[Branding Previx]] — regra de copy 3, "Em todo o Brasil"
- [[Contexto Atualizado - Dr. Ricardo]] — cobertura Brasil todo

## Notas de Implementação (2026-08-05)

Commit `4ef5fba`. Migration `20260805170000`.

A decisão de redação foi a que a story pedia: **não jogar fora o SEO local**. O rodapé
passou a dizer "Todo o Brasil, com sede em São Paulo" e a lista de bairros ganhou o rótulo
"Presença consolidada na capital e Grande SP" — deixou de ser o escopo e virou prova de
densidade.

- CTA do rodapé: "instituições em São Paulo" → "em todo o Brasil".
- FAQ `previx-areas-atendidas` reescrito: nacional primeiro, SP como densidade, sem tratar
  o resto do país como exceção a negociar.
- `previx-o-que-e` e `previx-tempo-mercado` reescritos (também saíram as datas de expansão).
- Comentário de `empresa.ts` corrigido: ensinava ao próximo editor que a lista era "de
  São Paulo".
- Contagem de regiões **removida** do rodapé ("+ N regiões" → "e outras regiões"). Havia
  divergência de 17 vs 18 entre duas respostas do FAQ; número de regiões é dado que
  envelhece sozinho.

### Pegadinha de layout

`.footer-area-principal` é `display: flex`. O `<strong>` e o nó de texto solto viraram dois
itens flex e a vírgula caiu na linha de baixo ("Todo o Brasil" / ", com sede em São Paulo").
Resolvido envolvendo o texto em um `<span>`. Só apareceu no navegador.
