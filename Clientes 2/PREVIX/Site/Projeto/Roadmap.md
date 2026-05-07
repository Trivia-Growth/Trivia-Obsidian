# Roadmap — Site PREVIX

> Briefing fonte: [[../Briefing Inicial]]. Decisões técnicas: [[../Decisões Arquiteturais]] e (depois da STORY-001) `architecture.md` no repo de código.

---

## Fase 1 — LP Institucional Online *(atual)*

**Objetivo:** O Site PREVIX está no ar, com Home + Sobre + Serviços + Contato + Orçamento, infra Triviaiox/Astro/Netlify/Supabase configurada, identidade visual aplicada e Schema base injetado em todas as páginas. Ainda não tem blog migrado, ainda não tem gerador AEO/GEO completo.

**Postura:** Setup + LP estática.

**Cadeia de stories da Fase 1:**

| # | Story | Status | Bloqueada por | Bloqueia | Resumo |
|---|-------|--------|--------------|----------|--------|
| 1 | [[../Stories/STORY-001 — Setup Astro + Triviaiox + Repo\|STORY-001]] | ✅ concluido (2026-05-06) | — | todas | Repo + Astro 6 + Triviaiox v5 + Netlify (https://previx-site-app.netlify.app) + Supabase shared + 5 templates |
| 2 | [[../Stories/STORY-002 — Estrutura Bulletproof + UI Tokens\|STORY-002]] | ✅ concluido (2026-05-06) | 001 | 003-007 | empresa.ts + seo.ts (schema-dts) + Header + Footer + BaseLayout c/ Org+LocalBusiness+WebSite + /styleguide |
| 3 | [[../Stories/STORY-003 — Migração de Conteúdo do WordPress\|STORY-003]] | ✅ concluido (2026-05-07) | 002 | 004 | 6 collections + 35 clientes + 2 depoimentos reais + 4 números + 6 diferenciais + 3 servicos.md + sobre.md + assets (logos, fotos, bgs) + ServiceIcons SVG |
| 4 | [[../Stories/STORY-004 — Páginas Institucionais\|STORY-004]] | ✅ concluido (2026-05-07) | 003 | 005, 008, 010 | Home (Hero+Servicos+Numeros+Diferenciais+Depoimentos+Carrossel+CTA), Sobre, /servicos/index, /servicos/[slug] (3 rotas), Contato, Orçamento, 404. Service+BreadcrumbList JSON-LD nas internas |
| 5 | [[../Stories/STORY-005 — Schema Markup + Sitemap + robots.txt + llms.txt\|STORY-005]] | ✅ concluido (2026-05-07) | 004 | 006-010 | robots.txt com 16 user-agents (12 IA), llms.txt spec llmstxt.org, scripts/validate-schema.ts (postbuild gate), Maps link em /contato |

**Critério de saída da Fase 1:** Site no ar (em URL Netlify temporária) com todas as páginas institucionais navegáveis e Schema válido em todas. Conteúdo migrado do WP. **Sem blog ainda.** **Sem captura de leads ainda.**

> ✅ **Fase 1 concluída em 2026-05-07.** Site live em https://previx-site-app.netlify.app com 10 páginas (Home + Sobre + Servicos + 3 sub + Contato + Orçamento + 404 + Styleguide), JSON-LD validado em build (`scripts/validate-schema.ts`), robots.txt permitindo 12 IA crawlers, llms.txt na raiz, sitemap automático, headers de segurança aplicados. Pronta para Fase 2 (conteúdo migrado e FAQ).

---

## Fase 2 — Conteúdo Migrado e FAQ Pública

**Objetivo:** Os 4 posts existentes (Case SKY, Kit câmeras, Postes IA, PX One) estão no novo formato AEO/GEO. Página FAQ pública injeta `FAQPage` Schema. Site começa a ser citado por IAs.

| # | Story | Status | Bloqueada por | Bloqueia | Resumo |
|---|-------|--------|--------------|----------|--------|
| 6 | [[../Stories/STORY-006 — Migração dos 4 Posts Existentes\|STORY-006]] | ⚪ backlog | 005 | — | Reescrever os 4 posts no novo schema Zod, validar lint |
| 7 | [[../Stories/STORY-007 — Página de FAQ AEO-otimizada\|STORY-007]] | ⚪ backlog | 005 | — | Page `/faq` com categorias, FAQPage Schema, Atomic Facts |

**Critério de saída da Fase 2:** Posts WP migrados visíveis em `/noticias`. Página `/faq` indexável. Schema validado em [Schema Markup Validator](https://validator.schema.org/). Pendência: o gerador completo (lint enforce) ainda não está implementado — chega na Fase 4.

---

## Fase 3 — Captura de Leads

**Objetivo:** Formulários de orçamento e contato gravam leads no Supabase. Painel admin permite ao `admin-site` qualificar e fechar leads. Webhook envia notificações para Teams Previx.

| # | Story | Status | Bloqueada por | Bloqueia | Resumo |
|---|-------|--------|--------------|----------|--------|
| 8 | [[../Stories/STORY-008 — Captura de Leads (Supabase)\|STORY-008]] | ⚪ backlog | 004 | 010 | Tabela `site_leads`, Edge Function Zod, painel admin, webhook Teams |

**Critério de saída da Fase 3:** Lead enviado por `/orcamento` cai em `site_leads`, dispara webhook, aparece em `/admin/leads`.

---

## Fase 4 — Gerador AEO/GEO (Metodologia Jimmy 3.0)

**Objetivo:** Sistema completo de geração + lint enforce. Posts não conformes não chegam a produção.

| # | Story | Status | Bloqueada por | Bloqueia | Resumo |
|---|-------|--------|--------------|----------|--------|
| 9 | [[../Stories/STORY-009 — Gerador de Blog AEO_GEO (Metodologia Jimmy 3.0)\|STORY-009]] | ⚪ backlog | 006 | 010 | Schema Zod completo, componentes Estatistica/FAQ, lint custom no build, 1 post novo gabarito |

**Critério de saída da Fase 4:** Build do site **falha** se um post tiver < 3 estatísticas, blocos fora de 50-150 palavras, JSON-LD inválido, ou `resumoDireto` fora de 40-60 palavras. 1 post novo escrito 100% pela metodologia (case da Previx) está no ar e passa o lint. Posts antigos da Fase 2 podem precisar de retoque para passar no novo lint mais rigoroso.

---

## Fase 5 — Deploy Produção e Cutover

**Objetivo:** `grupoprevix.com.br` aponta para o novo site. WordPress é desligado. Redirects 301 estão no ar para preservar SEO existente.

| # | Story | Status | Bloqueada por | Bloqueia | Resumo |
|---|-------|--------|--------------|----------|--------|
| 10 | [[../Stories/STORY-010 — Deploy Produção + Domínio grupoprevix.com.br\|STORY-010]] | ⚪ backlog | 008 + 009 | — | DNS cutover, redirects 301, monitoramento, desligamento WP |

**Critério de saída da Fase 5:** `https://grupoprevix.com.br` serve o novo site. Lighthouse > 90 em todas as rotas-chave. Sentry/monitoramento ativo. Cliente Previx aprova para encerramento.

---

## Fase 6 — Ecossistema (sub-projetos futuros, mapeados aqui)

**Objetivo:** Após Site no ar, expandir o ecossistema. Cada item abaixo vira sub-projeto próprio com pasta `Clientes 2/PREVIX/<NomeDoSub>/` e repo separado. Stack canônica Trívia (ADR-002).

| Sub-projeto | Pré-requisito | Resumo |
|-------------|---------------|--------|
| **Portal do Cliente** | Site Fase 5 + decisão de stack/escopo | Área logada com contratos, ocorrências, fotos de ronda, relatórios. SSO via Supabase Auth. |
| **SSO unificado Site ↔ Organograma** | Portal iniciado | Organograma passa a aceitar login do Supabase compartilhado. Cliente Previx logado vê seu organograma + Portal num único cookie. |
| **App PX One** | Portal estabilizado | App mobile (React Native? PWA?) — botão de pânico, rastreamento, histórico. Decisão de stack na época. |
| **App Postes IA** | Portal estabilizado | App de monitoramento — visualização de câmeras, alertas, configurações. Decisão de stack na época. |

> Esta fase **não tem stories detalhadas** ainda. Cada sub-projeto vai ganhar seu próprio briefing e roadmap quando for priorizado pela Previx.

---

## Milestones

| Marco | Data prevista | Status |
|-------|--------------|--------|
| Documentação inicial do projeto Site no vault | 2026-05-06 | ✅ concluído |
| Setup de infraestrutura (STORY-001) | 2026-05-06 | ✅ concluído |
| Primeiro deploy verde em produção | 2026-05-06 | ✅ concluído (https://previx-site-app.netlify.app) |
| LP institucional no ar em URL Netlify (Fase 1) | 2026-05-07 | ✅ concluído (5 de 5 stories) |
| Conteúdo WP migrado + FAQ (Fase 2) | [PREENCHER] | ⚪ pendente |
| Captura de leads ativa (Fase 3) | [PREENCHER] | ⚪ pendente |
| Gerador Jimmy 3.0 + lint enforce (Fase 4) | [PREENCHER] | ⚪ pendente |
| Cutover de domínio para grupoprevix.com.br (Fase 5) | [PREENCHER] | ⚪ pendente |
| Aprovação Previx do MVP do Site | [PREENCHER] | ⚪ pendente |

---

## Decisões e Histórico

> Decisões de escopo. Decisões técnicas profundas vão em `architecture.md` (ADRs) — mirror narrativo em [[../Decisões Arquiteturais]].

- `2026-05-06` — Projeto Site PREVIX iniciado. Pasta `Clientes 2/PREVIX/Site/` criada espelhando o padrão do Organograma. ADRs 001-006 aceitos.
- `2026-05-06` — **ADR-003 confirmado por JG (cliente-wide):** Supabase compartilhado entre TODOS os sub-projetos da Previx (Organograma, Site, Portal, PX One, Postes IA). Project ref `yqexjddpotlaqraljwvl`. Schemas isolados por prefixo. Decisão registrada em [[../00 - Índice PREVIX|00 - Índice PREVIX]] e [[../../Visão Estratégica de Produtos]].
- `2026-05-06` — Artigo do Jimmy Studio (`SEO, AEO e GEO 2026`) arquivado em [[../Referências/Jimmy Studio — AEO GEO 2026]] como fonte primária da Metodologia Jimmy 3.0 (Article IV — No Invention).
- `2026-05-06` — 10 stories esboçadas (5 da Fase 1, 2 da Fase 2, 1 da Fase 3, 1 da Fase 4, 1 da Fase 5). Fase 6 mapeada sem stories ainda.
- `2026-05-06` — **STORY-001 concluída.** Repo `Trivia-Growth/previx-site-app` (renomeado de `previx`) com Astro 6 + Triviaiox v5 + 5 templates Trívia. Site no ar em https://previx-site-app.netlify.app. Commit inicial `b2be209`. Push direto em `main` autorizado por JG. Triviaiox instalado manualmente via `cp -R` (issue de pacote não publicado registrada em SEC-005).
- `2026-05-06` — **STORY-002 concluída.** UI base e SEO foundation prontas: `src/lib/seo.ts` com 8 builders tipados via schema-dts (Organization, LocalBusiness, WebSite/SearchAction, Service, Article, BlogPosting, HowTo, FAQPage, BreadcrumbList), Header/Footer com dados de `empresa.ts`, BaseLayout injeta Organization+LocalBusiness+WebSite em todas as páginas, `/styleguide` interna (noindex). Commit `66397db`. 9 `@type` confirmados em produção.
- `2026-05-07` — **STORY-003 concluída.** Conteúdo institucional do WordPress migrado: 6 Astro Content Collections (35 clientes, 2 depoimentos reais [Afeet+Munir Abbud], 4 números [+500 colab/24h/+100 empresas/10+ anos], 6 diferenciais, 3 serviços, sobre.md). Assets copiados (6 logos Previx + 35 logos clientes em `public/`, 15 fotos + 3 bgs em `src/assets/` para otimização Astro). 3 GIFs do WP substituídos por SVG inline (`ServiceIcon.astro`) com animação CSS no hover. Logo Previx aplicado em Header (colorido) e Footer (branco). Header agora exibe logo PNG. Commit `b629bb9`.
- `2026-05-07` — **STORY-004 concluída.** Páginas institucionais publicadas: Home com 7 seções (Hero+Servicos+Numeros+Diferenciais+Depoimentos+Carrossel+CTA), `/sobre` consumindo `paginas/sobre.md`, `/servicos` (mãe) + 3 rotas dinâmicas via `getStaticPaths` injetando `Service` Schema + `BreadcrumbList`, `/contato` e `/orcamento` com UI completa de formulários (desabilitada até STORY-008), `/404` com atalhos. 10 páginas no build. Otimização automática de imagens: Carrossel_01 (674KB) → 45-86KB webp + srcset; bg-pb04 (190KB) → 9-40KB. Typecheck verde. Commit `6f8b958`.
- `2026-05-07` — **STORY-005 concluída — Fase 1 fechada.** AEO/GEO foundation: `robots.txt` com 16 user-agents declarados explicitamente (12 IA + tradicionais), `llms.txt` na raiz seguindo spec llmstxt.org com autorização explícita de uso e Política de citação, `scripts/validate-schema.ts` (postbuild gate, falha o build se schemas obrigatórios faltarem em qualquer página-alvo), `/contato` com link "Ver no Google Maps" (sem iframe — preserva CSP). Commit `adab236`. **Próxima: STORY-006 (migração dos 4 posts WP) — abre a Fase 2.**
