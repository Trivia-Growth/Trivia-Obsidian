---
tipo: copy-lp
status: em-desenvolvimento
nome-trabalho: LP M.A.P.A. OS · copy + SEO/AEO/GEO
tags: [produto, os-empresarial, lp, copy, seo, aeo, geo, mapa-os]
criado: 2026-06-03
produto: M.A.P.A. OS
repo: Trivia-Growth/pixel-perfect-view
dominio: https://triviastudio.com.br
slug-proposto: /mapa-os
relacionado: ["[[Trívia OS - Plano de Negocio e GTM]]", "[[Trívia OS - Playbook do Diagnóstico]]", "[[Trívia OS - Teste de Prontidão pra Escalar (Spec)]]"]
---

# LP M.A.P.A. OS — COPY + SEO/AEO/GEO (v1)

> *Trívia Studio · Documento Interno · v1 · Copy e configuração para subir no site (TanStack Start, repo `pixel-perfect-view`). Implementa a "LP de conversão" da Seção 06 do [[Trívia OS - Plano de Negocio e GTM]].*

Página de vendas do **M.A.P.A. OS** — o produto de implementação de OS empresarial com IA da Trívia. A promessa-título é **escalar sem inchar**; a conversão principal é o [[Trívia OS - Teste de Prontidão pra Escalar (Spec)|Teste de Prontidão pra Escalar]] (lead magnet); a secundária é o WhatsApp.

-----

## 0 · Decisões de marca e briefing

### O nome e o acrônimo (proposta a confirmar com Lucas)

**M.A.P.A. OS.** A narrativa: *primeiro a Trívia faz o **mapa** da sua operação, depois constrói o **OS** (sistema operacional) que faz ela rodar.* O acrônimo espelha o método (marca = método, mesma sacada do ATLAS):

| Letra | Fase | O que é |
|-------|------|---------|
| **M** | Mapeamento | Diagnóstico: todos os sistemas, fluxos de dado e dores → a planta do OS |
| **A** | Arquitetura | Decisões Substituir/Integrar/Matar + schema de dados + escopo |
| **P** | Plataforma | Construção: fundação de dados, módulos próprios, conectores |
| **A** | Agentes | Agentes de IA especialistas por área + gestão à vista |

> "OS" = o sistema operacional entregue. A fase de Sustentação (time do cliente operando) continua no método, mas fica fora da sigla pra manter o nome curto. *(Era MAPAS no plano; M.A.P.A. OS é a versão de marca.)*

### Parâmetros da página

| Item | Valor |
|------|-------|
| URL (slug) | `/mapa-os` *(brandável; alternativa SEO: `/sistema-operacional-empresarial`)* |
| Promessa-título | Escalar sem inchar o time |
| Gancho emocional | Parar de ser refém da operação |
| Prova de ROI | Custo invisível da fragmentação |
| Vilão (causa-raiz) | Fragmentação — nomeada no diagnóstico, nunca no título |
| CTA primário | **Fazer o Teste de Prontidão pra Escalar** (grátis) |
| CTA secundário | Falar com a gente no WhatsApp |
| ICP | Dono de PME a partir de R$ 2,5MM, operação fragmentada |
| Tom | Confiante, direto, brasileiro, anti-hype (voz Trívia) |

-----

# PARTE 1 · A COPY (seção por seção)

> *Cada seção mapeia para um componente em `src/components/landing/`. Reaproveitar `Nav`, `CTAFooter`, `FAQ`, `atoms`. Seções novas seguem o padrão `useReveal` + `<Container>` + tokens CSS.*

## §1 · Nav (reusar componente existente)
- Links: O problema · O que é · Método · Como começa · FAQ
- Botão à direita (coral): **Fazer o teste grátis**

## §2 · Hero

**Eyebrow (mono):** `SISTEMA OPERACIONAL COM IA · PARA PME QUE QUER ESCALAR`

**H1 (serif) — recomendado:**
> # Sua empresa cresceu. Sua operação não acompanhou.

**H1 — alternativas:**
> A · "Escale sem inchar o time."
> B · "Faça sua empresa crescer sem virar caos."

**Subhead (body):**
> A gente constrói o sistema operacional da sua empresa — tudo unificado num lugar só, com um agente de IA especialista em cada área operando a rotina junto com o seu time. Você cresce com controle, não com mais headcount.

**Frase âncora (AEO — resposta direta, classe `.lead`/`.article-lead` pro speakable):**
> O M.A.P.A. OS é um sistema operacional empresarial sob medida que unifica a operação e os dados de uma PME num lugar só e coloca agentes de IA especialistas para executar a rotina de cada área. É a alternativa entre o ERP de prateleira (rígido) e a agência de automação (sem visão de operação).

**CTAs:**
- Primário (coral): **Descobrir minha prontidão pra escalar →** *(abre o Teste)*
- Secundário (ghost): Falar com a gente

**Trust strip (mono, abaixo):** `Stack própria · Claude + Supabase + WhatsApp · O time do cliente operando no final`

## §3 · O problema (antes → depois)

**Eyebrow:** `O PROBLEMA`

**H2 (serif):**
> Crescer virou sinônimo de contratar, conferir planilha e decidir no escuro.

**Corpo — as 3 dores sentidas (cards):**
1. **Não escala sem inchar.** Cada cliente novo vira mais planilha, mais gente, mais caos. O faturamento sobe e a margem não acompanha.
2. **Refém da própria operação.** A empresa não roda sem você e sem as 2–3 pessoas que têm tudo na cabeça.
3. **Dinheiro vazando sem ver.** Retrabalho, erro entre sistemas, faturamento atrasado, lead que esfria. Sangra todo mês.

**Bloco de revelação (o vilão):**
> Você acha que é problema de ferramenta. Não é. É **fragmentação**: seus sistemas não conversam, então todo crescimento vira trabalho manual. E IA jogada em cima desse caos só piora — alucina, porque não enxerga a operação inteira.

**Antes / Depois (visual, 2 colunas):**
- **Antes:** ERP, planilhas, CRM, financeiro, estoque, ads — soltos, gente fazendo a ponte na mão.
- **Depois:** um OS único. Áreas, dados e inteligência no mesmo lugar. Agentes operando a rotina.

## §4 · O que é o M.A.P.A. OS

**Eyebrow:** `O QUE É`

**H2 (serif):**
> Não é um sistema que você opera. É um sistema que opera com você.

**Corpo:**
> A gente unifica toda a sua operação e os dados num lugar só — substituindo os sistemas que dá pra substituir, integrando os poucos imprescindíveis — e coloca um agente de IA especialista em cada área executando a rotina e puxando resultado. O time interno aprende a operar e fica dono do sistema no final. Sem virar refém de fornecedor.

**Mini-prova (mono, 3 itens):**
- `UNIFICA` o dado numa fonte única da verdade
- `OPERA` com agentes de IA por área, não só mostra relatório
- `ENTREGA` o controle pro seu time no final

## §5 · O diferencial defensável

**Eyebrow:** `POR QUE FUNCIONA`

**H2 (serif):**
> A IA só funciona de verdade porque está tudo unificado.

**Corpo:**
> Unificar dado, um ERP faz. Mostrar a operação num painel, um BI faz. Os dois param aí — e a empresa continua operando tudo na mão. O M.A.P.A. OS não para em mostrar: ele opera. E os agentes só ficam poderosos quando enxergam a operação inteira no mesmo lugar. **Qualquer um pluga um chatbot. Ninguém pluga agentes que operam a empresa toda sem ter feito a unificação antes.**

**O que os agentes fazem (concreto, lista):**
- Conciliam o financeiro e fecham o caixa
- Respondem o cliente no WhatsApp dentro do contexto da operação
- Antecipam ruptura de estoque
- Montam a campanha e leem o resultado
- Cruzam canais e cobram SLA

## §6 · Os 5 ganhos (benefícios)

**Eyebrow:** `O QUE VOCÊ GANHA`

**H2 (serif):**
> Cinco coisas que mudam na semana que o OS entra.

| # | Título (serif curto) | Texto |
|---|----------------------|-------|
| 1 | Escala sem inchar | Os agentes absorvem o volume operacional. Mais clientes não viram mais headcount. |
| 2 | Custo menor | Menos assinaturas soltas, menos gente fazendo ponte manual, menos erro entre sistemas. |
| 3 | Um sistema que se molda a você | Construído sobre a sua operação. Você não muda como trabalha nem paga por função que não usa. |
| 4 | Decisão por dado, não por achismo | Com tudo unificado, o número aparece na hora — e o sistema aponta o que fazer com ele. |
| 5 | Um especialista de IA por área | Não é assistente genérico. É um agente dedicado a financeiro, vendas, operação, marketing e atendimento. |

## §7 · O método M.A.P.A.

**Eyebrow:** `O MÉTODO`

**H2 (serif):**
> Primeiro a gente faz o mapa. Depois constrói o OS.

**As fases (timeline/cards):**
- **M · Mapeamento** — Diagnóstico completo: seus sistemas, onde o dado morre, as dores. Entregamos a planta do seu OS.
- **A · Arquitetura** — Decidimos sistema por sistema o que substituir, integrar ou matar. Escopo travado.
- **P · Plataforma** — Construímos a fundação de dados, os módulos e os conectores. Sua operação num lugar só.
- **A · Agentes** — Instalamos os agentes de IA por área e o painel de gestão à vista. O sistema passa a operar.

**Microcopy de fecho:** *Depois, seu time opera sozinho — com a gente por perto só se você quiser.*

## §8 · Como começa (funil + transparência de preço)

**Eyebrow:** `COMO COMEÇA`

**H2 (serif):**
> Você não compra um projeto de R$ 119 mil no escuro.

**Os 3 passos (cards):**
1. **Teste de Prontidão (grátis, 5 min).** Descubra seu Índice de Escalabilidade e quanto sua operação fragmentada custa hoje.
2. **Diagnóstico (R$ 30 mil, abatível).** A gente mapeia tudo e entrega a planta exata do seu OS, com escopo e investimento. Fechou a implementação? Os R$ 30 mil são abatidos integralmente.
3. **Implementação (a partir de R$ 119 mil).** Construímos seu OS por fases, com escopo travado. Sem mensalidade obrigatória — suporte depois só se você quiser.

**Bloco de reforço (anti-custo-fixo):**
> O M.A.P.A. OS é entregue pra sua empresa operar sozinha. Sem retainer pesado, sem virar mais um SaaS na sua fatura. Você fica dono da sua operação.

**CTA primário (coral):** **Fazer o Teste de Prontidão pra Escalar →**

## §9 · Prova / Cases

**Eyebrow:** `PROVA`

**H2 (serif):**
> A gente vende o que roda em casa.

**Corpo (até ter cases externos):**
> Operamos a Trívia, a Heziom e a infraestrutura própria de atendimento com IA sobre esse mesmo método. Cada caso de uso do M.A.P.A. OS é algo que a gente rodou antes na própria operação.

> *Placeholder: substituir/complementar por cards de case assim que as 3–5 implementações fundadoras concluírem (puxar de `src/content/cases.ts` e linkar pra `/casos`).*

## §10 · FAQ (alimenta o FAQPage schema — ver Parte 3)

**Eyebrow:** `PERGUNTAS FREQUENTES`

1. **O que é o M.A.P.A. OS?**
   Um sistema operacional empresarial sob medida que unifica a operação e os dados da sua PME num lugar só e coloca agentes de IA especialistas para operar a rotina de cada área — vendas, financeiro, operação, marketing e atendimento.

2. **Qual a diferença pra um ERP?**
   ERP unifica parte do dado e engessa a operação (você se adapta ao software). O M.A.P.A. OS é construído sobre a sua operação e, mais importante, ele opera com IA — não só registra e mostra.

3. **E pra uma agência de automação?**
   Agência pluga ferramentas isoladas sem visão de operação, e quebra na primeira mudança. A gente unifica o dado primeiro (a base que destrava a IA) e entrega o sistema pro seu time operar, sem te deixar refém.

4. **Quanto custa?**
   O diagnóstico, que entrega a planta completa do seu OS, custa R$ 30 mil e é abatido integralmente se você fechar a implementação. A implementação começa em R$ 119 mil, faseada. Não há mensalidade obrigatória.

5. **Quanto tempo leva?**
   O diagnóstico leva de 3 a 4 semanas. A implementação é por fases, começando pela fundação de dados e pelo primeiro agente de maior impacto.

6. **Preciso trocar todos os meus sistemas?**
   Não. A gente decide caso a caso: substitui o que é commodity, integra o que é imprescindível (fiscal, pagamento) e elimina o que só existe por causa da bagunça.

7. **Minha empresa é pequena demais?**
   Atendemos PMEs a partir de R$ 2,5 milhões de faturamento. O que importa mais que o tamanho é o nível de fragmentação — se você já usa vários sistemas que não conversam, faz sentido.

8. **O que sobra pra mim e pro meu time no final?**
   O sistema rodando e o seu time operando sozinho. Você fica dono da operação, com a gente por perto só se quiser suporte.

## §11 · CTA final (reusar `CTAFooter`)

**H2 (serif):**
> Descubra, em 5 minutos, se sua empresa está pronta pra escalar.

**Subtexto:** Grátis. Sem compromisso. Você sai com seu Índice de Escalabilidade e o custo invisível da sua operação hoje.

**CTA (coral):** **Fazer o teste agora →**
**CTA secundário:** Prefere conversar? Chama no WhatsApp.

## §12 · Footer (reusar componente existente)

-----

# PARTE 2 · SEO

### Title & meta description
```
<title>: M.A.P.A. OS · Sistema operacional com IA pra sua empresa escalar | Trívia
<meta description>: Unifique sua operação num só lugar e ponha agentes de IA pra operar a rotina. O M.A.P.A. OS faz sua PME escalar sem inchar o time. Comece pelo teste grátis.
```
- Title ≤ 60 caracteres no miolo (o "| Trívia" pode cair em SERP); description ≤ 155.

### URL, canonical, hreflang
- Slug: `/mapa-os` → canonical `https://triviastudio.com.br/mapa-os`
- `hreflang pt-BR` e `x-default` apontando pra própria URL (padrão do `__root.tsx`).

### Hierarquia de headings (1 H1, H2 por seção)
- **H1:** "Sua empresa cresceu. Sua operação não acompanhou." (só no Hero)
- **H2:** uma por seção (§3–§11), conforme a copy acima.
- **H3:** títulos dos cards (gatilhos, fases, dores).

### Cluster de palavras-chave (PT-BR, intenção comercial B2B)
| Tipo | Termos |
|------|--------|
| Cabeça | sistema operacional empresarial, IA para empresas, agentes de IA para empresas |
| Corpo | implementação de IA na operação, automação com IA para PME, unificar sistemas da empresa |
| Cauda longa | como usar IA na operação da minha empresa, alternativa a ERP com IA, IA para PME que não escala, sistema sob medida com agentes de IA |
| Dor | empresa que não escala sem contratar, retrabalho entre sistemas, dado em planilha |

> Distribuir naturalmente em H1/H2, primeiro parágrafo, alt de imagens e FAQ. Sem keyword stuffing — a frase âncora do Hero já carrega a cabeça do cluster.

### Imagens / alt text
- Hero: `alt="Diagrama do M.A.P.A. OS: operação fragmentada virando um sistema único com agentes de IA"`
- Antes/Depois: `alt="Antes: sistemas soltos. Depois: operação unificada no M.A.P.A. OS"`
- OG image: criar `1200×630` com a promessa + marca (salvar em `/public/assets/og-mapa-os.png`).

### Linkagem interna
- Para `/casos` (na §9), `/diario` (artigos de apoio), e home `/`.
- Da home e do menu institucional, **linkar para `/mapa-os`** (do contrário a página fica órfã).

### Sitemap (ação técnica)
- O sitemap é gerado em `netlify/functions/sitemap.ts` a partir de rotas estáticas + cases + posts. **Adicionar `/mapa-os` à lista de rotas estáticas** dessa função (hoje só tem `/`).

-----

# PARTE 3 · AEO · Answer Engine Optimization

Objetivo: ser a resposta que o Google (featured snippet / "People Also Ask") e os assistentes de voz leem.

### 3.1 · Copy "resposta-primeiro"
- A **frase âncora do Hero** (§2) é uma definição completa em 2 frases — formato ideal pra snippet. Marcar com a classe `.article-lead` (já usada no site pro `speakable`).
- Cada pergunta do FAQ responde **na primeira frase**, depois detalha. (Já escrito assim na §10.)

### 3.2 · FAQPage JSON-LD (injetar na rota)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "O que é o M.A.P.A. OS?",
      "acceptedAnswer": { "@type": "Answer", "text": "Um sistema operacional empresarial sob medida que unifica a operação e os dados da sua PME num lugar só e coloca agentes de IA especialistas para operar a rotina de cada área: vendas, financeiro, operação, marketing e atendimento." } },
    { "@type": "Question", "name": "Qual a diferença do M.A.P.A. OS para um ERP?",
      "acceptedAnswer": { "@type": "Answer", "text": "ERP unifica parte do dado e engessa a operação, forçando a empresa a se adaptar ao software. O M.A.P.A. OS é construído sobre a operação da empresa e, principalmente, opera com agentes de IA, em vez de apenas registrar e mostrar dados." } },
    { "@type": "Question", "name": "Quanto custa o M.A.P.A. OS?",
      "acceptedAnswer": { "@type": "Answer", "text": "O diagnóstico, que entrega a planta completa do OS, custa R$ 30 mil e é abatido integralmente se a implementação for fechada. A implementação começa em R$ 119 mil, faseada, sem mensalidade obrigatória." } },
    { "@type": "Question", "name": "Quanto tempo leva a implementação?",
      "acceptedAnswer": { "@type": "Answer", "text": "O diagnóstico leva de 3 a 4 semanas. A implementação é entregue por fases, começando pela fundação de dados e pelo primeiro agente de maior impacto." } },
    { "@type": "Question", "name": "Preciso trocar todos os meus sistemas?",
      "acceptedAnswer": { "@type": "Answer", "text": "Não. Cada sistema é avaliado: o que é commodity é substituído, o que é imprescindível (fiscal, pagamento) é integrado, e o que só existe por causa da fragmentação é eliminado." } },
    { "@type": "Question", "name": "Qual o porte de empresa ideal para o M.A.P.A. OS?",
      "acceptedAnswer": { "@type": "Answer", "text": "PMEs a partir de R$ 2,5 milhões de faturamento anual. O fator decisivo é o nível de fragmentação: empresas que já usam vários sistemas que não conversam entre si." } }
  ]
}
```

### 3.3 · speakable (padrão do site)
Adicionar ao schema da página:
```json
"speakable": { "@type": "SpeakableSpecification", "cssSelector": [".article-lead", "h1"] }
```

-----

# PARTE 4 · GEO · Generative Engine Optimization

Objetivo: ser citado e recomendado por ChatGPT, Claude, Gemini, Perplexity quando alguém perguntar "como implementar IA na operação da minha empresa".

### 4.1 · robots.txt — já coberto
O `public/robots.txt` já libera `GPTBot`, `ClaudeBot` e afins. ✅ Confirmar que `/mapa-os` **não** está em `Disallow`.

### 4.2 · Clareza de entidade (LLMs adoram fatos explícitos)
A copy declara, em texto puro e escaneável: o que é, pra quem é, quanto custa, prazo, e como difere de ERP/BI/agência. Isso é deliberado — LLM extrai fatos, não adjetivos. Manter os números (R$ 30k, R$ 119k, R$ 2,5MM, 3–4 semanas) sempre em texto, nunca só em imagem.

### 4.3 · Service/Offer JSON-LD (injetar na rota)
```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://triviastudio.com.br/mapa-os#service",
  "name": "M.A.P.A. OS — Sistema Operacional Empresarial com IA",
  "serviceType": "Implementação de sistema operacional empresarial com agentes de IA",
  "category": "Inteligência Artificial para empresas",
  "provider": { "@id": "https://triviastudio.com.br/#org" },
  "areaServed": { "@type": "Country", "name": "Brasil" },
  "audience": { "@type": "BusinessAudience", "name": "PMEs a partir de R$ 2,5 milhões de faturamento" },
  "description": "Sistema operacional sob medida que unifica a operação e os dados de uma PME e instala agentes de IA especialistas por área. Entrada por diagnóstico de R$ 30 mil (abatível); implementação a partir de R$ 119 mil.",
  "offers": [
    { "@type": "Offer", "name": "Diagnóstico operacional + planta do OS",
      "price": "30000", "priceCurrency": "BRL",
      "description": "Diagnóstico completo e plano de implementação. Abatido integralmente do valor da implementação se fechada." },
    { "@type": "Offer", "name": "Implementação do M.A.P.A. OS",
      "priceCurrency": "BRL", "priceSpecification": { "@type": "PriceSpecification", "minPrice": "119000", "priceCurrency": "BRL" },
      "description": "Construção faseada do OS: fundação de dados, módulos, conectores e agentes de IA." }
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog", "name": "Casos de uso de agentes de IA",
    "itemListElement": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Agente de qualificação no WhatsApp" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Agente de SAC nível 1" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Conciliação financeira automatizada" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Antecipação de ruptura de estoque" } }
    ]
  }
}
```

### 4.4 · BreadcrumbList JSON-LD
```json
{
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://triviastudio.com.br/" },
    { "@type": "ListItem", "position": 2, "name": "M.A.P.A. OS", "item": "https://triviastudio.com.br/mapa-os" }
  ]
}
```

### 4.5 · Conteúdo de comparação (LLMs citam comparativos)
A §5 e o FAQ já entregam "M.A.P.A. OS vs ERP / vs BI / vs agência" em texto explícito. Reforça a recomendação por LLM. Considerar, no `/diario`, um artigo-pilar "OS empresarial com IA vs ERP vs agência de automação" linkando pra `/mapa-os` (autoridade temática).

### 4.6 · `/llms.txt` (recomendação extra de GEO)
Criar `public/llms.txt` (padrão emergente, lido por crawlers de IA) resumindo a Trívia e o M.A.P.A. OS em markdown, com links pras páginas-chave. Baixo custo, bom upside de citação.

-----

# PARTE 5 · Implementação técnica (handoff pro dev)

> *Respeitando as convenções do repo: seção nova em `src/components/landing/`, página montada em rota nova, tokens CSS (não Tailwind), `useReveal` + `<Container>`, breakpoint 860px, sem shadcn em página pública. Push só após aprovação (via @devops).*

### 5.1 · `head()` da rota `src/routes/mapa-os.tsx`
```ts
head: () => ({
  meta: [
    { title: "M.A.P.A. OS · Sistema operacional com IA pra sua empresa escalar | Trívia" },
    { name: "description", content: "Unifique sua operação num só lugar e ponha agentes de IA pra operar a rotina. O M.A.P.A. OS faz sua PME escalar sem inchar o time. Comece pelo teste grátis." },
    { property: "og:title", content: "M.A.P.A. OS · Sistema operacional com IA pra sua empresa" },
    { property: "og:description", content: "Sua empresa cresceu, sua operação não acompanhou. Unifique tudo e ponha IA pra operar. Faça o teste de prontidão grátis." },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://triviastudio.com.br/mapa-os" },
    { property: "og:image", content: "https://triviastudio.com.br/assets/og-mapa-os.png" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "M.A.P.A. OS · Sistema operacional com IA" },
    { name: "twitter:description", content: "Faça sua PME escalar sem inchar o time. Teste de prontidão grátis." },
  ],
  links: [
    { rel: "canonical", href: "https://triviastudio.com.br/mapa-os" },
    { rel: "alternate", hrefLang: "pt-BR", href: "https://triviastudio.com.br/mapa-os" },
  ],
}),
```

### 5.2 · JSON-LD (injetar via `useEffect`, padrão de `diario/$slug.tsx`)
Injetar três blocos: **Service/Offer** (4.3), **FAQPage** (3.2) e **BreadcrumbList** (4.4). Reusar o helper de injeção do site (criar `appendJsonLd(obj)` se ainda não houver, pra não repetir o `useEffect` três vezes).

### 5.3 · Checklist de subida
- [ ] Criar `src/routes/mapa-os.tsx` (componente + head)
- [ ] Criar seções novas em `src/components/landing/` (Hero OS, Problema, Diferencial, Gatilhos, MétodoMAPA, ComoComeça) — reusar `Nav`, `FAQ`, `CTAFooter`, `atoms`
- [ ] Fiar o CTA primário no Teste de Prontidão (modal ou rota do teste, conforme onde o teste viver)
- [ ] Adicionar `/mapa-os` à função `netlify/functions/sitemap.ts`
- [ ] Linkar `/mapa-os` no menu/nav institucional e na home
- [ ] Gerar e subir `og-mapa-os.png` em `/public/assets/`
- [ ] (Opcional GEO) criar `public/llms.txt`
- [ ] `npm run build` + `tsc --noEmit` + `lint` + `test` verdes
- [ ] Revisão visual aprovada **antes** do push (mockup/preview)

-----

## Decisões em aberto

1. Confirmar nome **M.A.P.A. OS** e a expansão do acrônimo com o Lucas.
2. Slug final: `/mapa-os` (marca) vs `/sistema-operacional-empresarial` (SEO).
3. Onde o Teste de Prontidão vive (modal na LP, rota própria `/teste`, ou WhatsApp) — define o fio do CTA.
4. H1 final (recomendado vs alternativas A/B) — idealmente testar.
5. Aprovar o visual antes de implementar (regra: não codar UI sem mockup aprovado).

-----

*Documento vivo. Copy pronta pra implementação após aprovação visual.*

**Proposta · João Gabriel Novais · Pendente de alinhamento com Lucas Azevedo**
