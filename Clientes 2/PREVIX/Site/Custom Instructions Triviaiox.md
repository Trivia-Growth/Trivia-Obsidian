# Custom Instructions — Triviaiox (Site PREVIX)

> Este conteúdo é a referência canônica para os agentes Triviaiox quando trabalharem no repositório `previx-site-app`. **Copiar este arquivo (ou linkar) na raiz do repo de código** ao final da STORY-001, junto com o `CLAUDE.md` do template Trívia.
> Sempre que algo aqui mudar (papéis, fases, regras), atualizar tanto este arquivo quanto o `CLAUDE.md` do repo.
> Briefing fonte: [[Briefing Inicial]]. Decisões formais: [[Decisões Arquiteturais]].

---

## Identidade do Projeto

**Site PREVIX** é o site institucional + blog do **Grupo Previx** (segurança patrimonial, eletrônica e facilities, SP). Substitui o WordPress atual em `grupoprevix.com.br`. **A missão central é Share of Answer em IAs generativas (ChatGPT, Perplexity, Google AI Overviews)**, não tráfego SERP clássico.

**Stack:** **Astro 4+** + React (ilhas) + TypeScript + Tailwind → Netlify estático | **Supabase** (compartilhado com Organograma) só para captura de leads e admin do blog.

**Por que NÃO Vite:** Crawlers de IA precisam de HTML completo no primeiro response. Astro entrega isso nativamente; Vite SPA não. **Esta é a única exceção formal ao Stack Padrão Trívia neste projeto** — ver [[Decisões Arquiteturais|ADR-001]].

**Arquitetura:** Bulletproof React adaptado para Astro (pastas `src/components`, `src/layouts`, `src/pages`, `src/content`, `src/lib`, `src/types`, `src/config`). Dois repositórios: `Trivia-Obsidian/Clientes 2/PREVIX/Site/` (vault — specs) e `previx-site-app/` (código).

**Papéis:**
- `admin-site` — edita posts, FAQ, configs SEO, vê e classifica leads.
- `editor-blog` — cria e publica posts; não acessa leads nem configs.
- `público (sem login)` — leitura completa do site, envio de orçamento.

**Domínio crítico:**
- **Conteúdo é o produto.** O site não é "para mostrar a Previx", é "para ser citado por IAs sobre segurança em SP". Toda decisão é avaliada nesse filtro.
- **Metodologia Jimmy 3.0** (de [[Referências/Jimmy Studio — AEO GEO 2026]]) governa todo conteúdo: Atomic Facts, blocos 50-150 palavras, ≥3 estatísticas/seção com fonte citada, H2/H3 como perguntas, pirâmide invertida, FAQ no fim.
- **Schema Markup é obrigatório.** Build falha sem JSON-LD válido em páginas-chave.
- **`robots.txt` permite explicitamente:** `GPTBot`, `PerplexityBot`, `Google-Extended`, `ClaudeBot` (além de `Googlebot`, `Bingbot`). Bloqueia `/admin/*`.

---

## Identidade Visual (Tailwind theme)

**Tokens em `tailwind.config.ts` → `theme.extend.colors`:**

```ts
previx: {
  primary: '#00AEEF',     // azul ciano — CTAs, destaques, links
  dark: '#0A1F3C',        // azul marinho — nav, fundos dark, footer
  white: '#FFFFFF',
  gray: '#F5F5F5',        // fundos alternados de seção
  text: '#1A1A1A',
  'text-muted': '#4A4A4A',
}
```

**Tipografia:** Inter (Google Fonts) com fallback `system-ui`. Títulos peso 700, corpo 400, labels 500. Tamanhos seguindo escala Tailwind (`text-4xl` h1, `text-2xl` h2, `text-xl` h3, `text-base` corpo).

**Componentes-chave:**
- **Card de serviço:** fundo branco, borda 1px `previx.gray`, ícone no topo (preferir SVG sobre GIF), título h3, lista de subserviços, CTA "Saiba mais".
- **Card de estatística (`<Estatistica />`):** badge inline com valor em destaque, descrição curta, fonte clicável.
- **Hero:** foto institucional + overlay `previx.dark` 60%, headline branca, subheadline `previx.white/80`, CTA primário `previx.primary`.
- **FAQ accordion:** componente React (ilha hidratada), aria-expanded, JSON-LD injetado pelo Astro server-side.

---

## 5 Regras Invioláveis (constituição local + Triviaiox)

1. **Documentação é código.** Ler `PROJECT_REQUIREMENTS.md`, `architecture.md` e o briefing antes de implementar. Atualizar junto com o código.
2. **No Invention** (Triviaiox Article IV). Toda regra AEO/GEO vem de [[Referências/Jimmy Studio — AEO GEO 2026]]. Toda estatística em conteúdo vem de [[Referências/Estatísticas Setor Segurança SP]]. Inventou? Recusa.
3. **Story-Driven** (Triviaiox Article III). Tudo começa com uma story em `docs/stories/` (ou na pasta Obsidian `Site/Projeto/Stories/`). PR sem story referenciada é rejeitado.
4. **Quality First** (Triviaiox Article V). `npm run lint` + `npm run typecheck` + `npm run build` (que inclui o lint AEO/GEO da STORY-009) devem passar antes de qualquer push.
5. **Agent Authority** (Triviaiox Article II). Apenas `@devops` faz `git push` e abre PRs. `@dev` commita local; `@po` valida; `@qa` revisa; `@devops` publica.

---

## Arquitetura de Código (Astro + Bulletproof)

```
previx-site-app/
├── src/
│   ├── pages/                  → rotas Astro (file-based)
│   │   ├── index.astro
│   │   ├── sobre.astro
│   │   ├── servicos/
│   │   │   ├── index.astro
│   │   │   ├── patrimonial.astro
│   │   │   ├── eletronica.astro
│   │   │   └── facilities.astro
│   │   ├── noticias/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── faq.astro
│   │   ├── contato.astro
│   │   ├── orcamento.astro
│   │   ├── admin/              → área logada (Supabase Auth)
│   │   │   ├── leads.astro
│   │   │   └── posts.astro
│   │   └── 404.astro
│   ├── content/                → Astro Content Collections
│   │   ├── config.ts           → schemas Zod (blog, faq, servicos)
│   │   ├── blog/               → posts .md/.mdx
│   │   ├── faq/                → perguntas categorizadas
│   │   └── servicos/           → conteúdo dos serviços
│   ├── components/
│   │   ├── ui/                 → Button, Input, Accordion, Card etc. (React)
│   │   ├── seo/                → JsonLd.astro (Article, FAQPage, LocalBusiness, Service, Organization, BreadcrumbList)
│   │   ├── content/            → Estatistica.astro, FAQ.astro, AtomicFact.astro
│   │   ├── layout/             → Header.astro, Footer.astro, Nav.astro
│   │   └── home/               → Hero, ServicosCards, Numeros, Depoimentos, LogosCarrossel
│   ├── layouts/
│   │   ├── BaseLayout.astro    → injeta Organization + LocalBusiness JSON-LD em todas
│   │   ├── BlogPost.astro      → Article + FAQPage + BreadcrumbList JSON-LD
│   │   └── ServicoLayout.astro → Service JSON-LD
│   ├── lib/
│   │   ├── supabase.ts         → cliente público (anon)
│   │   ├── seo.ts              → builders de JSON-LD com tipos fortes
│   │   └── lint-aeo.ts         → checagens da Metodologia Jimmy 3.0
│   ├── types/
│   ├── config/
│   │   └── env.ts              → import.meta.env tipadas
│   └── styles/
│       └── globals.css
├── public/
│   ├── robots.txt              → GPTBot/PerplexityBot/Google-Extended/ClaudeBot allow
│   ├── llms.txt                → sumário para LLMs
│   └── _redirects              → redirects 301 das URLs WP antigas
├── scripts/
│   └── lint-content.ts         → script de build que enforça Jimmy 3.0
├── astro.config.mjs            → integra @astrojs/react, tailwind, sitemap
├── tailwind.config.ts
├── tsconfig.json
├── netlify.toml
├── CLAUDE.md
├── architecture.md
├── PROJECT_REQUIREMENTS.md
├── SECURITY_DEBT.md
└── package.json
```

**Regras de import:** Use sempre `@/...` (absolute imports — Triviaiox Article VI). Nunca `../../../`. Components React (ilhas) só importam de `@/components`, `@/lib`, `@/types`. Astro components importam livremente.

---

## Receita AEO/GEO (resumo executivo)

> A receita completa está em [[Briefing Inicial]] e em [[Referências/Jimmy Studio — AEO GEO 2026]]. Aqui o resumo enforçável.

**Todo post obrigatoriamente tem:**

1. `resumoDireto` (40-60 palavras) renderizado nas primeiras 2 frases — pirâmide invertida.
2. `conclusoesPrincipais` — 3 a 5 bullets fortes, cada um com pelo menos uma estatística + fonte.
3. Corpo dividido em seções H2 (perguntas em linguagem natural). Cada seção tem 50-150 palavras.
4. ≥3 ocorrências do componente `<Estatistica />` no post inteiro, cada uma com `fonte` e `fonteUrl` obrigatórias.
5. Componente `<FAQ />` no final com 4-8 perguntas — vira `FAQPage` JSON-LD.
6. Frontmatter Zod completo (ver [[Briefing Inicial|seção schema]]).

**Lint em build (`npm run build`):**
- Conta palavras por seção H2 → falha se < 50 ou > 150.
- Conta `<Estatistica />` no post → falha se < 3.
- Detecta H2/H3 sem `?` ou sem palavra interrogativa → warning forte (não falha, mas degrada).
- Valida Schema JSON-LD com `schema-dts` → falha se inválido.

---

## Segurança

- **Edge Function `submit-lead`**: validação Zod + rate limit (10 reqs/min/IP) + honeypot. RLS em `site_leads` impede leitura por anon.
- **Admin (`/admin/*`)**: protegido por Supabase Auth + middleware Astro. JWT validado em toda Edge Function.
- **Sem secrets no client.** Apenas `PUBLIC_SUPABASE_URL` e `PUBLIC_SUPABASE_ANON_KEY`. `service_role` só em Edge Functions.
- **CSP headers** em `netlify.toml`: `default-src 'self'`, scripts permitidos só de domínios Trívia/Supabase/Google Fonts.

---

## Workflow

```
@po *create-story → @dev *develop-story → @qa *qa-gate → @devops *push
```

**Antes de qualquer story:**
- Ler o `Roadmap.md` para entender em que fase a story se encaixa.
- Confirmar que `STORY-{N-1}` foi concluída (se há dependência).

**Definition of Done por story:**
- [ ] Critérios de aceite todos marcados
- [ ] `npm run lint` passa
- [ ] `npm run typecheck` passa
- [ ] `npm run build` passa (inclui lint AEO/GEO em stories que tocam conteúdo)
- [ ] Páginas afetadas validadas no [Schema Markup Validator](https://validator.schema.org/)
- [ ] Lighthouse > 90 em Performance/SEO/Accessibility (rotas-chave)
- [ ] PR com link para a story no vault
- [ ] Após merge, story marcada como `concluido` no vault e checkbox de DoD do projeto atualizado
