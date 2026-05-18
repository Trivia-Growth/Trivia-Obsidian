---
id: STORY-024
titulo: "Cutover conteúdo Git → DB + rebuild on publish"
fase: 6
modulo: "Admin/Cutover"
status: done
prioridade: alta
agente_responsavel: ""
criado: 2026-05-08
atualizado: 2026-05-08
epic: EPIC-001
---

# STORY-024 — Cutover conteúdo Git → DB + rebuild on publish

## Contexto

Última story do EPIC-001. Faz a migração definitiva: conteúdo do site (posts, faq, copies, depoimentos, números, diferenciais, clientes, configs) sai do Git como source of truth e passa pro Supabase. Astro continua gerando estático no build, mas consome dados do DB em vez de Content Collections do filesystem.

**Risco alto** — esta é a story de "ligar a chave". Precisa rollback claro caso algo dê errado.

## Critérios de Aceite

### Pré-requisitos confirmados

- [ ] CA1 — STORY-018 concluída (schema admin no DB)
- [ ] CA2 — STORY-019 concluída (RBAC + perfis)
- [ ] CA3 — STORY-020 concluída (CRUD posts funcional)
- [ ] CA4 — STORY-021 concluída (CRUD copies funcional)
- [ ] CA5 — STORY-022 concluída (assets migrados pro Storage)
- [ ] CA6 — STORY-023 concluída (configs SEO editáveis)

### Migração de dados

- [ ] CA7 — Script `scripts/migrate-content-to-db.ts`:
  - Lê todas as Content Collections em `src/content/`
  - Faz INSERT em `site.posts`, `site.faq`, `site.servicos`, `site.paginas`, `site.depoimentos`, `site.clientes`, `site.numeros`, `site.diferenciais`, `site.configs_seo`
  - Mapeia caminhos de assets para URLs Supabase (mapping da STORY-022)
  - Idempotente (rodar 2x não duplica)
  - Gera relatório `docs/CONTENT_MIGRATION.md` com counts e diffs

- [ ] CA8 — Validação pós-migração:
  - 5 posts em DB com mesmos slugs
  - 16 perguntas FAQ em DB
  - 3 serviços, 35 clientes, 2 depoimentos, 4 números, 6 diferenciais
  - Configs (empresa, redes sociais, áreas atendidas) em DB

### Astro consumindo DB

- [ ] CA9 — `src/lib/data/posts.ts` e similares:
  - `getAllPosts()`, `getPostBySlug(slug)`, `getAllFAQ()`, etc. — consultam Supabase via service_role no build (não anon key — bypass de RLS pra ler tudo no contexto de build)
  - Cache durante build (chamada única por entidade)

- [ ] CA10 — `src/pages/noticias/index.astro` refatorado:
  - `getStaticPaths()` consulta `getAllPosts({ status: 'publicado' })`
  - Lista renderizada igual a hoje, mas dados vêm do DB

- [ ] CA11 — `src/pages/noticias/[slug].astro` refatorado:
  - `getStaticPaths()` retorna apenas posts com status='publicado' e deletado_em is null
  - Renderiza MDX do campo `corpo_mdx` via `astro-mdx-render` ou similar
  - Frontmatter vem do DB

- [ ] CA12 — `src/pages/faq.astro`, `src/pages/servicos/`, `src/pages/sobre.astro` etc. refatorados de forma similar

- [ ] CA13 — `src/lib/empresa.ts` e `src/lib/seo.ts` consomem `site.configs_seo` no build (com fallback para hardcoded caso DB indisponível — defesa)

### Build hook + rebuild incremental

- [ ] CA14 — `NETLIFY_BUILD_HOOK_URL` configurado em `supabase.secrets`
- [ ] CA15 — Função `site.publish_post(post_id)` chama Edge Function `trigger-rebuild` que faz POST no build hook
- [ ] CA16 — Edge Function `trigger-rebuild` aplica throttle (max 1 rebuild a cada 60s, queue se múltiplos publishes em janela)
- [ ] CA17 — Cada save de copy institucional / config / FAQ / depoimento / etc. com efeito no site público dispara rebuild

### Conteúdo Git deprecado

- [ ] CA18 — `src/content.config.ts` mantido vazio ou apenas com schemas que ainda usam Git (se algum) — todas as collections antigas removidas
- [ ] CA19 — `src/content/blog/`, `src/content/faq/`, `src/content/servicos/`, `src/content/paginas/`, etc. — pastas movidas para `archive/content-pre-cutover/` (não deleta — referência histórica)
- [ ] CA20 — Lint Jimmy 3.0 (`scripts/lint-content.ts`) **descontinuado como build gate** (lint vive na Edge Function `validate-post` agora). `package.json` script `lint:content` substituído por `validate:db-content` (ou removido)

### Documentação atualizada

- [ ] CA21 — `architecture.md` atualizado:
  - ADR-005 (Schema markup) anotado como "evoluído pela ADR-010"
  - Diagrama de fluxo de conteúdo redesenhado (DB → Astro build → Netlify edge)
- [ ] CA22 — `CLAUDE.md` atualizado: seção "Conteúdo" agora aponta pra `/admin` em vez de `src/content/`
- [ ] CA23 — `CUTOVER_CHECKLIST.md` (do STORY-010) atualizado se aplicável

### Rollback plan

- [ ] CA24 — Documentar rollback step-by-step em `docs/CONTENT_CUTOVER_ROLLBACK.md`:
  1. Reverter commit do cutover (`git revert`)
  2. Restaurar `src/content/` da pasta archive
  3. Forçar rebuild Netlify
  4. Conteúdo do DB fica intacto (não deletar — usuário pode tentar de novo depois)

### Validação final em produção

- [ ] CA25 — Após cutover, rodar checklist completo do E2E (mesmo do 2026-05-07):
  - 14 rotas públicas → 200
  - 5 posts → BlogPosting + FAQPage Schema OK
  - /faq → 16 Question + 16 Answer no JSON-LD
  - Sitemap completo
  - llms.txt e robots.txt íntegros
  - Headers de segurança presentes
- [ ] CA26 — Validação editorial: criar 1 post novo no painel, publicar, confirmar que aparece em produção em <2min com Schema válido
- [ ] CA27 — Lighthouse Mobile ≥ 90 mantido

## Pendências externas

- Janela de cutover combinada com JG (preferencialmente fora de horário de pico, sábado de manhã)
- Backup completo do estado pré-cutover (snapshot Supabase + tag Git)

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** `backlog`

**Branch/PR:**

**Arquivos esperados:**
- `scripts/migrate-content-to-db.ts`
- `src/lib/data/posts.ts` (novo)
- `src/lib/data/faq.ts` (novo)
- `src/lib/data/servicos.ts` (novo)
- `src/lib/data/paginas.ts` (novo)
- `src/lib/data/configs.ts` (novo)
- `src/pages/noticias/index.astro` (refatorado)
- `src/pages/noticias/[slug].astro` (refatorado)
- `src/pages/faq.astro` (refatorado)
- `src/pages/servicos/*.astro` (refatorado)
- `src/pages/sobre.astro` (refatorado)
- `src/lib/empresa.ts` (refatorado)
- `src/lib/seo.ts` (atualizado para consumir configs_seo)
- `supabase/functions/trigger-rebuild/index.ts`
- `archive/content-pre-cutover/` (movida `src/content/`)
- `docs/CONTENT_MIGRATION.md`
- `docs/CONTENT_CUTOVER_ROLLBACK.md`
- `architecture.md` + `CLAUDE.md` atualizados

---

## QA

**Gate:**

**Checklist:**
- [ ] Migração rodada sem erro, todos os recursos no DB
- [ ] Build do Astro consome DB e produz HTML idêntico ao pré-cutover (diff visual)
- [ ] E2E completo verde (213+ checks como em 2026-05-07)
- [ ] Editor publica post novo no painel, aparece em produção em <2min
- [ ] Editor altera FAQ, rebuild dispara, FAQPage Schema atualizado em produção
- [ ] Editor altera dados da empresa, rebuild, novo telefone em todas as páginas
- [ ] Lighthouse Performance/SEO/Accessibility ≥ 90 mantidos
- [ ] Rollback testado em ambiente de staging (se houver) ou simulado em local
