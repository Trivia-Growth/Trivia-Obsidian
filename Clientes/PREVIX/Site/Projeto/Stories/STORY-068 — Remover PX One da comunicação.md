---
id: STORY-068
titulo: "Remover PX One da comunicação"
fase: 7
modulo: "Site · Portfólio"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-08-05
atualizado: 2026-08-05
epico: EPIC-BRANDING-V7
tipo: conteudo
executor: painel+codigo
---

# STORY-068 — Remover PX One da comunicação

> Item 11 de [[A aplicar no Site Previx]], classificado **P0**. Dr. Ricardo informou em
> 26/05 que o produto ainda está em fase de elaboração. [[Branding Previx]] o lista em
> "🚫 O que NÃO comunicar": *"Não usar em nenhuma peça até nova instrução"*.
>
> O site anuncia o produto há mais de dois meses depois dessa instrução.

## Diagnóstico (código e banco, 05/08/2026)

Três ocorrências vivas, em camadas diferentes:

### 1. Pergunta ativa no FAQ

`site.faq`, id `pxone-o-que-e`, categoria `pxone` (label "PX One"), `ativo = true`. Vai ao ar
em `/faq`. A resposta descreve o produto como existente e contratável:

> "PX One é o serviço de segurança assistida residencial exclusivo da Previx. Você nos avisa
> pelo aplicativo quando vai chegar ou sair de casa e um vigilante credenciado faz o
> acompanhamento até a porta. […] É contratado em formato de mensalidade, sem fidelidade
> longa."

Como é a **única** pergunta da categoria, remover a pergunta remove a categoria inteira da
página — a `/faq` agrupa por categoria (`faq.astro:20-28`).

### 2. Meta description da /faq

`src/pages/faq.astro:45`, hardcoded:

> "Respostas para dúvidas sobre segurança patrimonial, eletrônica, multisserviços, **PX One**,
> Postes IA e atendimento comercial do Grupo Previx em São Paulo."

É o texto que aparece no Google. Não é editável no painel — ver **STORY-065**. O mesmo texto
está em `site.paginas.descricao_seo` do slug `faq`, hoje não consumido.

### 3. Tema de geração de post por IA

`src/admin/components/GerarPostModal.tsx:48` oferece `'PX One'` na lista de temas, e o
placeholder de `:117` sugere literalmente *"mencionar PX One"*. Ou seja: o painel **convida**
o operador a gerar conteúdo sobre um produto que não pode ser comunicado. Enquanto isso
existir, a remoção não é durável — basta alguém gerar um post.

### Onde **não** está

Não há item de menu (`SiteHeader.astro:20-25`), página `/servicos/pxone`, nem imagem em
`public/`. O `[slug].astro:6` fixa quatro serviços e o PX One não é um deles.

## O ponto de projeto

O produto **volta** quando estiver pronto. Então a pergunta não deve ser apagada, e sim
**despublicada**: `ativo = false` preserva o texto para religar depois, e a tabela já tem
`deletado_em` separado justamente para distinguir "escondido" de "removido".

Isso torna o CA de reversibilidade parte da entrega, não um detalhe.

## Escopo

### ✅ Inclui

1. Despublicar a pergunta `pxone-o-que-e` em `/admin/faq` (`ativo = false`, sem apagar).
2. Remover "PX One" da meta description da `/faq`, no código e no `descricao_seo` do banco.
3. Remover `'PX One'` da lista de temas do `GerarPostModal` e a menção no placeholder.
4. Verificar se algum post publicado no blog cita o produto (`site.posts`), e tratar caso
   exista.
5. Confirmar que a `/faq` publicada não exibe a categoria "PX One".

### ❌ NÃO inclui

- Apagar o registro do banco. A instrução é "até nova instrução do Dr. Ricardo".
- Preparar a volta do produto (página, copy nova).

## Critérios de Aceite

- [x] CA1 — `/faq` publicada não mostra a categoria PX One nem a pergunta.
- [x] CA2 — `grep -rni "px one\|pxone" src` não retorna nada que vá ao ar nem que ofereça o
      tema no painel.
- [x] CA3 — Nenhuma meta description do site cita PX One.
- [x] CA4 — Nenhum post publicado cita o produto.
- [x] CA5 — A pergunta continua **existindo** no banco, apenas inativa, e volta ao ar
      trocando `ativo` para true.
- [~] CA6 — `npm run build` verde; `typecheck` com os mesmos 215 erros pré-existentes
      (ver STORY-065).

## Riscos

- **A `/faq` tem JSON-LD `FAQPage`** montado a partir de todas as perguntas
  (`faq.astro:31-33`). Despublicar sem rebuild deixa o dado estruturado antigo indexado.
  Confirmar publicação, não só o registro no banco.
- Se alguém já indexou a URL com âncora da categoria, ela passa a não existir. Impacto baixo,
  mas é o tipo de coisa que aparece depois como "link quebrado".
- CA5 é fácil de quebrar sem perceber se a exclusão for feita por SQL em vez do painel.
  `deletado_em` preenchido não volta pela tela.

## Links

- [[A aplicar no Site Previx]] — item 11 (P0)
- [[Branding Previx]] — 🚫 O que NÃO comunicar
- [[STORY-065 — Copy institucional preso no código]]

## Notas de Implementação (2026-08-05)

Commit `4ef5fba`. Migrations `20260805170000`, `210000`, `220000`, `230000`.

Despublicado, **não apagado** (CA5 preservado): `ativo = false` no FAQ e `deletado_em`
intocado. Volta trocando um booleano.

- Pergunta `pxone-o-que-e` desativada. Como era a única da categoria, a seção "PX One"
  sumiu inteira da `/faq`.
- "PX One" removido da meta description da `/faq`, no código e no banco.
- Tema `'PX One'` removido do `GerarPostModal` e do placeholder. **Enquanto o painel
  oferecesse o tema, a remoção não seria durável** — bastava alguém gerar um post.
- Proibição explícita adicionada ao prompt do `generate-post`.

### O CA4 encontrou muito mais do que o esperado

"Nenhum post publicado cita o produto" parecia formalidade. Havia **um post inteiro**
(`/noticias/px-one`) e um segundo com duas seções H2, um Callout, uma conclusão, a meta
description e mais cinco menções espalhadas. Detalhado na [[STORY-071 — Blog publicado contradiz o branding v7]].

`scripts/validate-schema.ts` exigia `noticias/px-one/index.html` e **derrubou o build**
quando o post saiu. O gate funcionou, pelo motivo errado. Linha removida com comentário
para voltar junto com o produto.

### Verificado

`grep -ri "px one\|pxone" dist/` → **zero ocorrências** em 34 HTMLs.
