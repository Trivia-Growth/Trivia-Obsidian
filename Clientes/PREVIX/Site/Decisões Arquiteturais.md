---
projeto: "Site PREVIX"
tipo: "ADR-index"
atualizado: 2026-05-08
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

## ADR-003 — Supabase compartilhado entre TODOS os sub-projetos Previx

- **Status:** **aceita** (2026-05-06, confirmada por JG)
- **Escopo:** **decisão cliente-wide** — vale para Site, Portal do Cliente, futuras integrações, apps PX One, apps Postes IA e qualquer sub-projeto novo da Previx que precisar de Supabase. Documentação espelhada em [[../Visão Estratégica de Produtos|Visão Estratégica de Produtos]] e [[../00 - Índice PREVIX|00 - Índice PREVIX]] como princípio do cliente.
- **Contexto:** O Organograma PREVIX já tem um projeto Supabase em produção (`yqexjddpotlaqraljwvl`). Cada sub-projeto novo precisaria de Supabase próprio. **Manter projetos separados** complica SSO, fragmenta auth, multiplica custo e bloqueia integrações futuras.
- **Decisão:** **Todos** os sub-projetos da Previx usam o **mesmo projeto Supabase** do Organograma (`yqexjddpotlaqraljwvl`). Cada sub-projeto tem schemas isolados via prefixo (`organograma_*` já existe; criar `site_*`, `portal_*`, `pxone_*`, `postesai_*`, etc.). RLS garante que cada schema só é lido/escrito pelo seu próprio sub-projeto. Auth é único — usuário logado no Site é o mesmo logado no Organograma e (futuramente) no Portal.
- **Consequências:**
  - **SSO automático** entre todos os sub-projetos. Cliente Previx loga uma vez e circula entre apps.
  - **Custo Supabase concentrado** em 1 projeto (escala única, plano Pro paga por todos).
  - **Backups e monitoramento centralizados** — JG/Trívia monitora um único projeto.
  - **Risco:** incidente de banco afeta todos os sub-projetos. **Mitigação obrigatória:** backups diários automatizados (Supabase Pro), staging de migrations, runbook de rollback documentado em `SECURITY_DEBT.md` de cada sub-projeto.
  - **Regra cross-projeto:** toda nova migration usa **prefixo de schema** (`site_*`, `portal_*`, etc.). Tabelas no schema `public` são exclusivamente do Organograma (legado). Documentar em `architecture.md` de cada novo repo.
  - **Auth compartilhado:** `app_metadata.user_role` pode ter múltiplos valores quando um usuário pertence a vários sub-projetos (ex: `["admin-organograma","admin-site"]`). Roles novas adicionam, não substituem.

## ADR-004 — Triviaiox no lugar do AIOX

- **Status:** aceita (2026-05-06)
- **Contexto:** O padrão Trívia documenta a instalação do AIOX (`npx aiox-core install`) como passo obrigatório do scaffold. JG pediu explicitamente para usar o **Triviaiox** (`Documentos Trivia/Triviaiox-main/`) no lugar do AIOX neste projeto. Triviaiox é evolução em CLI First com Constitution formal e Story-Driven Development como artigos invioláveis.
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

  Clones locais ficam em `~/Documents/Obsidian/Github/`, irmãos da pasta do vault. Vault Obsidian é único (`Trivia-Obsidian`), com sub-pastas por cliente (`Clientes/PREVIX/`) e sub-pastas por sub-projeto.
- **Consequências:**
  - Cada repo é deployável independente (Netlify por repo).
  - Cada repo tem seu próprio `CLAUDE.md`, `architecture.md`, `SECURITY_DEBT.md`, `PROJECT_REQUIREMENTS.md`, `.triviaiox-core/`.
  - Vault concentra a visão estratégica e o roadmap cross-repo.
  - **Custo:** alguma duplicação de código compartilhado (componentes UI). Mitigação: pacote npm interno se a duplicação ficar dolorosa (não no MVP).

## ADR-007 — Resend como provedor de e-mail transacional

- **Status:** aceita (2026-05-07)
- **Contexto:** STORY-008 precisa enviar notificação de lead novo para o e-mail comercial. Necessita provedor confiável com domínio próprio e API simples para Edge Function Deno.
- **Decisão:** **Resend**. Free tier 3.000 e-mails/mês cobre o volume previsto. API REST via `fetch` direto na Edge Function. Domínio `grupoprevix.com.br` precisa verificação DKIM+SPF+Return-Path no painel Resend (pendência SEC-009).
- **Consequências:** `RESEND_API_KEY` em `supabase secrets`. Notificação é best-effort — se Resend falhar, lead já está no banco e operador vê pelo painel `/admin/leads`. Detalhe completo em `architecture.md` ADR-007.

## ADR-008 — Sentry + Plausible (monitoramento)

- **Status:** aceita (2026-05-07, implementada na STORY-010 prep)
- **Contexto:** Cutover de DNS exige observabilidade de erros JS e tráfego antes de apontar `grupoprevix.com.br`. Critério: privacy-first (LGPD), free tier suficiente, gating por consent.
- **Decisão:** **Sentry** (erros JS) + **Plausible** (tráfego), ambos gateados pelo consent banner LGPD via custom event `previx:consent`. Sentry sem replay/tracing por padrão.
- **Consequências:** Plausible só carrega se localStorage `previx-consent-v1 === 'accepted'`. Sentry replay desligado por LGPD. Detalhe em `architecture.md` ADR-008.

## ADR-009 — GA4 + GTM (placeholder)

- **Status:** pendente — decisão final na STORY-011
- **Contexto:** Plausible cobre tráfego básico; JG pediu camada GA4+GTM com foco AEO/GEO (referrers de IA classificados, scroll depth, dataLayer events) antes do cutover.
- **Direção:** GTM como container único, GA4 dentro do GTM, gating LGPD via mesmo `previx:consent`. Server-side tagging fica para fase 2.

## ADR-010 — Conteúdo do site no Supabase + rebuild Netlify on publish

- **Status:** **aceita** (2026-05-08, decisão JG no EPIC-001)
- **Contexto:** Hoje o conteúdo do site (posts, FAQ, copies, depoimentos, números, diferenciais, clientes) vive em `src/content/` como MDX/MD/JSON e é editado via commit. Volume esperado: 5+ posts/mês com pico inicial maior pra alimentar IAs generativas. Editar via commit não escala.
- **Alternativas avaliadas:**
  - **A. Decap CMS (Git-backed):** rejeitado — não escala pra fluxo editorial sério (rascunho/agendamento/preview).
  - **B. DB + rebuild Netlify on publish** ⭐ aceita — mantém HTML estático no edge (AEO preservado), painel ganha rascunho/agendamento/audit, lint vira validação no save.
  - **C. SSR puro (`output:'server'`):** rejeitado — perde HTML estático, degrada AEO/GEO.
  - **D. TinaCMS:** rejeitado — dependência externa + custos.
- **Decisão:** Migrar conteúdo do Git para tabelas no schema `site` do Supabase compartilhado. Astro consome DB no build (via `service_role` em `getStaticPaths`). Cada publicação dispara webhook do Netlify Build Hook → site rebuilda. **AEO/GEO foundation preservada.**
- **Fluxo edit → publish:** Editor salva → Edge Function valida (Zod + lint Jimmy 3.0) → INSERT/UPDATE em `site.posts`/`faq`/etc. → audit_log → se status='publicado', POST no Build Hook → Astro rebuilda consumindo DB → deploy estático.
- **Rollback:** toda edição grava `payload_before` (JSONB) em `site.audit_log`. Restaurar = UPDATE com payload_before + novo rebuild. Soft delete em todas as tabelas (deletado_em); hard delete só por admin-previx após retenção LGPD (~90 dias).
- **Consequências:** Conteúdo deixa de viver no Git (cutover na STORY-024); `lint:content` script de build vira no-op (lint roda em Edge Function `validate-post`). Supabase Storage habilitado para assets. Throttle no Build Hook: max 1 rebuild/60s.
- Detalhe completo em `architecture.md` ADR-010.

## ADR-011 — Painel admin embutido em `/admin/*` + RBAC dinâmico

- **Status:** **aceita** (2026-05-08, decisão JG no EPIC-001)
- **Contexto:** ADR-010 estabelece painel admin como novo locus de edição. Duas decisões dependentes: (1) onde o painel mora; (2) como modelar perfis de acesso.
- **Alternativas rejeitadas:**
  - Sub-projeto separado `previx-admin-app` em `admin.grupoprevix.com.br` — rejeitado por JG ("admin é só do site, não justifica repo isolado").
  - Roles hardcoded em enum — rejeitado por JG (quer poder criar/editar perfis pelo painel sem deploy).
- **Decisão (localização):** Painel vive em `/admin/*` no próprio `previx-site-app`. Astro modo `output: 'hybrid'`: rotas públicas estáticas (AEO preservado), `/admin/*` server-rendered. SPA React montada via `<AdminApp client:only="react" />`. Stack canônica Trívia (Vite-in-Astro: shadcn/ui, TanStack Query, React Router) embutida em `src/admin/`.
- **Decisão (RBAC dinâmico):**
  - `app_metadata.roles[]` continua array de IDs de role.
  - Tabela `site.role_definitions` armazena perfis editáveis (id, nome, permissoes JSONB, sistema boolean).
  - Função `site.has_permission(resource, action)` substitui `has_role` em policies novas. Faz UNION das permissões dos roles do usuário (multi-papel).
  - Função antiga `site.has_role` mantida pra retrocompat com `/admin/leads` (STORY-008); migra na STORY-019.
- **Seed de 5 perfis iniciais:** `admin-previx` (sistema), `editor-blog`, `editor-copy`, `comercial`, `viewer`. Editáveis via painel pelo `admin-previx`.
- **CSP impactada:** `/admin/*` ganha CSP separada em `netlify.toml` (allow `unsafe-eval` se Monaco MDX precisar, allow `blob:` para preview). `noindex,nofollow` + `Disallow: /admin/` no robots.txt mantidos (defesa em profundidade).
- **Consequências:** Astro adapter Netlify (`@astrojs/netlify`) vira dependência. Login com SSO Supabase Auth (mesmas credenciais do Organograma). Painel filtra UI por `usePermission(resource, action)`. Convite de usuários via Edge Function que dispara email Resend.
- Detalhe completo em `architecture.md` ADR-011.

---

## ADRs futuros (placeholders renumerados)

| ID | Tema | Quando decidir |
|----|------|---------------|
| ADR-012 | Editor MDX do painel admin (Monaco vs TipTap vs textarea+preview) | STORY-020 |
| ADR-013 | Estratégia de internacionalização (PT-BR é único idioma? abrir EN no futuro?) | Quando a Previx pedir expansão fora do Brasil |
| ADR-014 | Engine de busca interna (Pagefind? Algolia? servidor próprio?) | Quando o catálogo de posts crescer (>30) |
