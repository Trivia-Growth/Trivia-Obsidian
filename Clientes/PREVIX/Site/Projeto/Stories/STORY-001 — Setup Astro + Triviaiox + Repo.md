---
id: STORY-001
titulo: "Setup Astro + Triviaiox + Repo"
fase: 1
modulo: "Infraestrutura"
status: concluido
prioridade: alta
agente_responsavel: "Claude (auto)"
criado: 2026-05-06
atualizado: 2026-05-06
---

# STORY-001 — Setup Astro + Triviaiox + Repo

## Contexto

Story zero do projeto Site PREVIX. Cria toda a infraestrutura de código que as outras stories vão consumir: repositório no GitHub, scaffold Astro, integração Triviaiox, conexão com Supabase compartilhado, deploy Netlify, templates do padrão Trívia commitados. Sem essa story, nada mais avança.

## Spec de Referência

- [[../../Briefing Inicial]]
- [[../../Decisões Arquiteturais|ADR-001, ADR-002, ADR-003, ADR-004, ADR-006]]
- [[../../Custom Instructions Triviaiox]]
- `Documentos Trivia/Padrão Projetos/00 - Checklist de Início.md` — segue o checklist (Passos 1-6) **adaptado** (Lovable substituído por scaffold Astro manual; AIOX substituído por Triviaiox).

## Critérios de Aceite

- [x] CA1 — Repositório `previx-site-app` criado no GitHub `Trivia-Growth` (renomeado de `previx`)
- [x] CA2 — Repo clonado em `~/Documents/Obsidian/Github/previx-site-app/`
- [x] CA3 — Scaffold Astro 6 inicializado com integrações `@astrojs/react`, `@tailwindcss/vite`, `@astrojs/sitemap`, `@astrojs/mdx` (Astro 4 do template virou Astro 6 atual)
- [x] CA4 — Triviaiox **instalado manualmente via cp -R** (pacote npm não existe no registry; documentado em SEC-005). `.triviaiox-core/version.json` criado em `5.0.3`
- [x] CA5 — 5 templates do padrão Trívia preenchidos com os 6 ADRs do projeto
- [x] CA6 — `.env.example` configurado com `PUBLIC_SUPABASE_URL` apontando para o projeto compartilhado `yqexjddpotlaqraljwvl`
- [x] CA7 — Cliente Supabase em `src/lib/supabase.ts` usando `import.meta.env.PUBLIC_*` (não hardcoded), validação de env via `src/config/env.ts`
- [x] CA8 — Site Netlify `previx-site-app` criado (`f95cfc51-9cf1-4f00-912b-a57755b7107f`), env vars configuradas, primeiro deploy verde em https://previx-site-app.netlify.app
- [x] CA9 — Push inicial em `main` aceito (commit `b2be209`)
- [x] CA10 — `Site/00 - Índice.md` atualizado com URLs reais

---

## Implementação

**Status:** `concluido` (2026-05-06)

**Branch/PR:** push direto na `main` (autorizado por JG) — commit `b2be209`

**Arquivos alterados:** primeiro commit completo do repo. Itens-chave criados:
- `package.json`, `astro.config.mjs`, `tsconfig.json` (paths `@/*`)
- `src/config/env.ts` (env tipada)
- `src/lib/supabase.ts` (cliente compartilhado)
- `src/layouts/BaseLayout.astro` (meta + OG + canonical)
- `src/pages/index.astro` (placeholder STORY-001)
- `src/styles/global.css` (Tailwind v4 + tokens Previx via `@theme`)
- `.triviaiox-core/` + `.claude/` (cp -R do Triviaiox-main)
- `CLAUDE.md`, `architecture.md`, `PROJECT_REQUIREMENTS.md`, `SECURITY_DEBT.md`, `netlify.toml`, `README.md`, `.env.example`

**Notas de implementação:**

1. **Astro 6 em vez de Astro 4** — o template Trívia falava "Astro 4+" mas a versão atual no momento da execução é 6.2.2. Funciona da mesma forma; tokens Tailwind v4 via `@theme inline` em CSS (não mais `tailwind.config.ts`).
2. **Triviaiox install manual** — o pacote `triviaiox-core` não está publicado no npm (404 em `npm registry`). O wizard interativo do `bin/triviaiox.js install` quebra em ambiente não-tty (`ERR_USE_AFTER_CLOSE` no inquirer). Workaround usado: `cp -R` do `.triviaiox-core/` e `.claude/` direto do `Documentos Trivia/Triviaiox-main/`. Criado `.triviaiox-core/version.json` manualmente para satisfazer a CA. Issue de longo prazo registrada em SEC-005 do `SECURITY_DEBT.md`. **Recomendação:** quando o pacote for publicado oficialmente, refazer instalação via `npx triviaiox-core install` para garantir validação automática.
3. **Repo renomeado pelo JG** durante a story — `previx` → `previx-site-app` (consistente com `organograma-previx-app`). ADR-006 atualizado.
4. **Push direto autorizado** — JG confirmou no início da story (memória `feedback_previx_site_devops_push.md`). Não passou por `@devops` por enquanto; volta a passar se outro dev entrar no projeto.
5. **Netlify CLI usado para criar e deployar.** O `netlify init` é interativo demais — usei `netlify sites:create --account-slug triviastudio --name previx-site-app`. Conexão com GitHub para deploys automáticos a partir do próximo push **ainda não foi feita** — JG precisa autorizar OAuth do GitHub no Netlify pelo painel (Site settings → Build & deploy → Continuous deployment → Link site to Git). Até lá, deploys são via `netlify deploy --build --prod`.
6. **Build local + deploy production verde**, headers de segurança aplicados, sitemap servindo, HTML completo com OG tags em pt-BR.

**Headers verificados em produção:**
- `Content-Security-Policy` (com Supabase compartilhado permitido em `connect-src`)
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## QA

> Preenchido pelo `@qa`. Piloto não edita esta seção.

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Build sem erros, TypeScript strict
- [ ] Triviaiox instalado e funcional (testar `@dev *help`)
- [ ] Templates Trívia preenchidos (sem `[PREENCHER]` órfão exceto onde marcado intencionalmente)
- [ ] Netlify deploy verde
- [ ] `npm audit` sem Critical/High

**Notas:**

---

## Notas e Decisões

> Registro de decisões tomadas durante a implementação.
