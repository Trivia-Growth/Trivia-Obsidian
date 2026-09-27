---
id: STORY-064
titulo: "Tagline v7 no hero da home"
fase: 7
modulo: "Conteúdo · Institucional"
status: concluido
prioridade: media
agente_responsavel: "@jg"
criado: 2026-08-05
atualizado: 2026-08-05
epico: EPIC-BRANDING-V7
tipo: conteudo
executor: painel
---

# STORY-064 — Tagline v7 no hero da home

> Item 15 de [[A aplicar no Site Previx]]. A tagline oficial mudou na devolutiva de 26/05 e
> o site nunca acompanhou.

## Diagnóstico (consulta ao banco em 05/08/2026)

O hero vivo está em `site.paginas`, slug `home`, bloco `tipo=hero`:

```
titulo:    <span class="hl">Segurança</span> e serviços de qualidade para seu
           empreendimento, <span class="hl">24 horas por dia</span> com o Grupo Previx.
subtitulo: Soluções integradas para empresas que buscam excelência e tranquilidade.
```

Renderizado em `src/pages/index.astro:47-49`, com fallback hardcoded idêntico em `:17-18`.

### A sub-headline é o exemplo negativo do próprio branding

[[Branding Previx]], na seção "Evitar", lista textualmente:

> Frases genéricas tipo "Soluções integradas..." *(qualquer B2B usaria)*

É exatamente a frase que abre o site hoje.

### O que entra no lugar

| Campo | Novo valor (v7) |
|---|---|
| Título | **Patrimônio seguro. Operação previsível. Gestão simplificada.** |
| Sub-headline | **Há mais de 16 anos protegendo +100 clientes em todo o Brasil.** |

A tagline ancora os três pilares do negócio, um por frase: patrimonial, eletrônica +
multisserviços, e consolidação de fornecedores. A sub-headline troca uma promessa genérica
por prova social com número.

## Escopo

### ✅ Inclui

1. Trocar `titulo` e `subtitulo` do bloco hero da home em `/admin/paginas` → Home.
2. Decidir o **destaque visual**: o campo aceita HTML e o tema já tem a classe `.hl`
   (ciano). O branding manda dar peso visual a "+16 anos" e "+100 clientes". Uma opção é
   destacar uma frase da tríade no título e os dois números na sub-headline.
3. Conferir o resultado em desktop e mobile — a tagline nova é mais curta que a atual, o
   que muda a quebra de linha e a altura do hero.

### ❌ NÃO inclui

- O `fallback` hardcoded em `index.astro:17-18` — ele só aparece se o banco falhar, e
  mexer nele é código. Fica na **STORY-065**.
- Heros das demais páginas (sobre, serviços, contato, notícias, FAQ).
- Trocar a foto de fundo.

## Critérios de Aceite

- [x] CA1 — A home abre com "Patrimônio seguro. Operação previsível. Gestão simplificada."
- [x] CA2 — A sub-headline traz "mais de 16 anos" e "+100 clientes em todo o Brasil".
- [x] CA3 — Nenhuma ocorrência de "Soluções integradas para empresas que buscam excelência"
      no site publicado.
- [x] CA4 — Hero legível em mobile, sem texto cortado nem sobreposição com o CTA.
- [x] CA5 — Alteração **no ar**, não só salva.

## Riscos

- **Sem travessões** em copy comercial ([[feedback_previx_branding_regras]]). A tagline usa
  pontos finais, e é assim que deve ficar.
- O campo aceita HTML cru. Um `<span>` mal fechado quebra o layout do hero inteiro, porque o
  título é injetado com `set:html` (`index.astro:47`). Conferir a página depois de salvar.
- Se a foto de fundo tiver a área clara justamente onde a frase nova cai, o contraste piora.
  O bloco tem `corTitulo`/`corLede` editáveis se precisar.

## Links

- [[A aplicar no Site Previx]] — item 15
- [[Branding Previx]] — tagline oficial v7, tom de voz, o que evitar
- [[Contexto Atualizado - Dr. Ricardo]] — os três pilares

## Notas de Implementação (2026-08-05)

Commit `4ef5fba`. Migration `20260805170000`.

Título e sub-headline trocados no bloco hero de `site.paginas` (slug `home`), via SQL.

Destaque visual: `.hl` aplicado às **três promessas** da tríade — "Patrimônio *seguro*.
Operação *previsível*. Gestão *simplificada*." Fica forte na tela; é uma linha de SQL
mudar se preferir destacar menos.

O fallback hardcoded em `index.astro:17-18` também foi atualizado para a v7 na STORY-065 —
sem isso, uma falha de leitura do banco republicaria a tagline aposentada em silêncio.

Verificado no navegador: hero legível em desktop e mobile, sem transbordo nem scroll
horizontal, CTA no lugar.

### Verificado em produção (grupoprevix.com.br)

Deploy da Netlify concluído. Confirmado por `curl` no site publicado, não no build local:

- Home traz `+700`, `+16`, `99%`; nenhuma ocorrência de "+500", "10+", "15 anos",
  "100 empresas" ou "PX One" em `/`, `/faq`, `/sobre`, `/servicos/facilities` e `/noticias`.
- Hero publicado: "Patrimônio seguro. Operação previsível. Gestão simplificada."
- Rodapé: "Todo o Brasil, com sede em São Paulo".
- Meta description da `/faq` vindo do banco, sem PX One.
- `areaServed` do JSON-LD começa por "Brasil".
- `/noticias/px-one` e `/noticias/seguranca-condominio-residencial` respondem **404**,
  como esperado pela despublicação.
