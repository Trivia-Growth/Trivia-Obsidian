---
projeto: "Site PREVIX"
tipo: "ADR-index"
atualizado: 2026-05-06
---

# Decisões Arquiteturais — Site PREVIX

> Lista de ADRs (Architecture Decision Records) do projeto Site. **Decisões finais e versionadas** vão para o `architecture.md` no repositório de código (`previx-site-app`) quando o repo for criado na STORY-001 — este arquivo é o espelho narrativo no vault para discussão e link cruzado com stories.

> Formato: cada ADR tem **status** (`proposta` · `aceita` · `superseded` · `deprecated`), **contexto** (por que precisa decidir), **decisão** (o que decidimos), **consequências** (o que muda).

---

## ADR-001 — LP/site institucional em Astro

- **Status:** aceita (2026-05-06)
- **Contexto:** O Stack Padrão Trívia define **Vite + React (SPA)**. SPA entrega HTML quase vazio no primeiro response — bom para apps autenticados, ruim para crawlers de IA (ChatGPT, Perplexity, Google AI Overviews). O Site PREVIX tem AEO/GEO como objetivo central; sem HTML completo, perde Share of Answer. O documento `Stack Padrão.md` da Trívia explicitamente prevê "CMS/Blog se SEO > 50% do escopo" como caso negociável.
- **Decisão:** Usar **Astro 4+** com integração `@astrojs/react` (ilhas hidratadas só onde precisa) e `@astrojs/tailwind`. Conteúdo em Astro Content Collections com schema Zod.
- **Consequências:**
  - HTML estático completo no primeiro byte — alimenta crawlers de IA com tudo de uma vez.
  - JSON-LD injetado server-side em todas as páginas relevantes.
  - Lint AEO/GEO custom roda no build (`npm run build`) e falha se conteúdo violar Jimmy 3.0.
  - Performance: Lighthouse > 95 esperado em rotas estáticas.
  - **Trade-off:** desvio explícito do padrão Trívia. Documentado em todos os docs do projeto. Esta decisão se aplica **só ao Site** — sistemas (Portal, apps) seguem padrão Trívia (ADR-002).

## ADR-002 — Sistemas dinâmicos seguem o padrão Trívia (Vite)

- **Status:** aceita (2026-05-06)
- **Contexto:** O ecossistema Previx terá outros sub-projetos depois do Site (Portal do Cliente, leads dashboard interno, possíveis apps de PX One e Postes IA). Esses são apps autenticados, dinâmicos, com SEO irrelevante. O custo de fugir do padrão Trívia neles seria alto sem benefício.
- **Decisão:** Todos os sistemas dinâmicos do ecossistema Previx (a partir do Portal do Cliente em diante) usam o **Stack Padrão Trívia canônico**: Vite + React + TypeScript + Tailwind + shadcn/ui + TanStack Query + Supabase + Netlify.
- **Consequências:**
  - Reuso de templates Trívia (CLAUDE.md, architecture.md, padrões de UI).
  - Reuso de Custom Instructions e workflows do Triviaiox.
  - Onboarding de devs já familiarizados com Heziom/Organograma é instantâneo.
  - **Trade-off:** stack mista no ecossistema. Mitigação: cada sub-projeto tem seu próprio repo, e o limite arquitetural é claro (LP/conteúdo = Astro, app = Vite).

## ADR-003 — Supabase compartilhado entre sub-projetos

- **Status:** proposta (2026-05-06) — aguarda confirmação do JG
- **Contexto:** O Organograma PREVIX já tem um projeto Supabase em produção (`yqexjddpotlaqraljwvl`). Site precisa de Supabase para captura de leads e admin do blog. Portal do Cliente, quando vier, precisará de auth e dados. **Manter projetos separados** complica SSO; **compartilhar** simplifica integração mas mistura responsabilidades.
- **Decisão proposta:** Usar o **mesmo projeto Supabase** do Organograma para todos os sub-projetos da Previx. Cada sub-projeto tem schemas isolados via prefixo (`organograma_*` já existe; criar `site_*`, `portal_*`, etc.). RLS garante que cada schema só é lido/escrito pelo seu próprio sub-projeto.
- **Consequências (se aceita):**
  - SSO trivial: o `supabase.auth` é compartilhado entre Site, Portal, Organograma.
  - Custos do Supabase concentrados em 1 projeto (mais barato em escala).
  - Risco: incidente de banco afeta todos os sub-projetos. Mitigação: backups regulares + monitoramento por schema.
  - **Pendência:** confirmar com JG antes de iniciar STORY-001.

## ADR-004 — Triviaiox no lugar do AIOX

- **Status:** aceita (2026-05-06)
- **Contexto:** O padrão Trívia documenta a instalação do AIOX (`npx aiox-core install`) como passo obrigatório do scaffold. JG pediu explicitamente para usar o **Triviaiox** (`Documentos Trivia 2/Triviaiox-main/`) no lugar do AIOX neste projeto. Triviaiox é evolução em CLI First com Constitution formal e Story-Driven Development como artigos invioláveis.
- **Decisão:** Instalar Triviaiox no repo `previx-site-app` via `npx triviaiox-core install`. Aplicar a Constitution Triviaiox (Articles I-VI: CLI First, Agent Authority, Story-Driven, No Invention, Quality First, Absolute Imports).
- **Consequências:**
  - Workflow de stories segue `@po → @dev → @qa → @devops` (com push exclusivo do `@devops`).
  - Lint enforça absolute imports (`@/...`).
  - `.triviaiox-core/` na raiz do repo é fonte de verdade do framework.
  - L1/L2 (framework) protegido por deny rules; L3/L4 mutáveis.

## ADR-005 — Gerador de blog content-first com Metodologia Jimmy 3.0

- **Status:** aceita (2026-05-06)
- **Contexto:** O Site precisa de blog que **garanta** conformidade AEO/GEO em todo post. Soluções genéricas de blog (CMS WordPress, Sanity, Contentful) não enforçam regras estruturais. A receita formal está em [[Referências/Jimmy Studio — AEO GEO 2026]].
- **Decisão:** Astro Content Collections + frontmatter Zod **obrigatório** + componente render-time + **lint custom em `npm run build`** que falha o build se um post violar:
  - Blocos H2 fora de 50-150 palavras
  - Menos de 3 ocorrências de `<Estatistica />` no post
  - JSON-LD inválido (validado com `schema-dts`)
  - `resumoDireto` fora de 40-60 palavras
  - `faq` com menos de 4 itens
- **Consequências:**
  - Posts não conformes nunca chegam à produção.
  - Editores (não-devs) recebem mensagens claras de erro no build.
  - **Custo:** STORY-009 é a story mais complexa do projeto. Implementação em ~2 sprints (lint + Schema builder + componentes UI).
  - Migração dos 4 posts WordPress existentes (STORY-006) é o teste real do schema.

## ADR-006 — Repos separados por sub-projeto, vault único

- **Status:** aceita (2026-05-06)
- **Contexto:** O ecossistema Previx terá 4-6 repositórios de código no fim. Mantê-los todos num monorepo cria acoplamento desnecessário entre stacks (Astro vs Vite) e times (frontend vs backend). Mantê-los em organizações GitHub separadas dilui visibilidade. Vault único concentra a documentação.
- **Decisão:** Cada sub-projeto tem seu próprio repo na org `Trivia-Growth` no GitHub:
  - `organograma-previx-app` (já existe)
  - `previx-site-app` (a criar — STORY-001)
  - `previx-portal-app` (futuro)
  - `pxone-app`, `postesai-app` (futuros)

  Clones locais ficam em `~/Documents/Obsidian/Github/`, irmãos da pasta do vault. Vault Obsidian é único (`Trivia-Obsidian`), com sub-pastas por cliente (`Clientes 2/PREVIX/`) e sub-pastas por sub-projeto.
- **Consequências:**
  - Cada repo é deployável independente (Netlify por repo).
  - Cada repo tem seu próprio `CLAUDE.md`, `architecture.md`, `SECURITY_DEBT.md`, `PROJECT_REQUIREMENTS.md`, `.triviaiox-core/`.
  - Vault concentra a visão estratégica e o roadmap cross-repo.
  - **Custo:** alguma duplicação de código compartilhado (componentes UI). Mitigação: pacote npm interno se a duplicação ficar dolorosa (não no MVP).

---

## ADRs futuros (placeholders)

| ID | Tema | Quando decidir |
|----|------|---------------|
| ADR-007 | Provedor de e-mail transacional para confirmação de leads (Resend? SendGrid? Supabase SMTP?) | Início da STORY-008 |
| ADR-008 | Ferramenta de monitoramento (Sentry? Plausible? Netlify Analytics?) | Antes da STORY-010 (deploy produção) |
| ADR-009 | Estratégia de internacionalização (PT-BR é único idioma? abrir EN no futuro?) | Quando a Previx pedir expansão fora do Brasil |
| ADR-010 | Engine de busca interna (Pagefind? Algolia? servidor próprio?) | Quando o catálogo de posts crescer (>30) |
