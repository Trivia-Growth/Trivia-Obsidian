---
id: STORY-013
titulo: "Setup Monorepo heziomos"
fase: 1
modulo: infra
status: backlog
prioridade: alta
agente_responsavel: ""
criado: 2026-06-15
atualizado: 2026-06-15
---

# STORY-013 — Setup Monorepo heziomos

## Contexto

A arquitetura v3 (ADR-0001) define um monorepo único `heziomos` com `pnpm workspaces + Turborepo`. Atualmente existem 3 repos separados que precisam ser centralizados:

- `heziom-sales` → `apps/crm`
- `hubtransportadorashzm` → `apps/hub`
- `tribe-criativo-lab` → `apps/tribe`

O `literarius-sync` **permanece como repo separado** — roda no Windows Server Intelinove via Task Scheduler, com deploy e ciclo de vida independentes.

Esta story cobre a criação do monorepo, importação dos repos existentes, setup de packages compartilhados, configuração do TRIVIAIOX e CI/CD.

## Spec de Referência

- [[HeziomOS — Arquitetura v3]] — ADR-0001 a ADR-0010
- [[Monorepo — Estrutura e Setup]] — blueprint completo desta story
- [[STORY-001 — Setup Infraestrutura]] — predecessor (Supabase + secrets + branch protection)

## Critérios de Aceite

### Repositório e Estrutura
- [ ] CA1 — Repositório privado `heziomos` criado na org `Org-Heziom` no GitHub
- [ ] CA2 — Estrutura de pastas conforme [[Monorepo — Estrutura e Setup]]:
  - `apps/web`, `apps/crm`, `apps/hub`, `apps/tribe`, `apps/agent-runtime`
  - `packages/config`, `packages/shared`, `packages/ui`, `packages/database`, `packages/integrations`, `packages/whatsapp`, `packages/agents`
  - `supabase/migrations`, `supabase/functions/_shared`
  - `docs/adr`, `docs/runbooks`
  - `.github/workflows`
- [ ] CA3 — `pnpm-workspace.yaml` listando `apps/*` e `packages/*`
- [ ] CA4 — `turbo.json` com pipelines: `build`, `dev`, `lint`, `typecheck`, `test`
- [ ] CA5 — `package.json` root: `private: true`, engines (`node>=20`, `pnpm>=9`), scripts turbo
- [ ] CA6 — `biome.json` configurado (lint + format, substitui ESLint + Prettier)
- [ ] CA7 — `tsconfig.base.json` com `strict: true`, `noUncheckedIndexedAccess: true`
- [ ] CA8 — `CLAUDE.md` na raiz com: estrutura do monorepo, regras invioláveis, comandos principais, path do vault Obsidian (`../Trivia-Obsidian/Clientes/Heziom/HeziomOS/`)

### Importação dos Repos Existentes (git subtree)
- [ ] CA9 — `heziom-sales` importado em `apps/crm` via `git subtree add --squash`
- [ ] CA10 — `hubtransportadorashzm` importado em `apps/hub` via `git subtree add --squash`
- [ ] CA11 — `tribe-criativo-lab` importado em `apps/tribe` via `git subtree add --squash`
- [ ] CA12 — `apps/crm` e `apps/hub` funcionam após importação (build e dev sem erros)
- [ ] CA13 — `apps/tribe` funciona após importação (`python app.py` sem erros)

### Packages Compartilhados
- [ ] CA14 — `packages/config` exporta preset Biome e tsconfigs (react, base)
- [ ] CA15 — `packages/shared` exporta tipos base (User, Role, ApiResponse) com Zod schemas
- [ ] CA16 — `packages/ui` configurado com shadcn/ui e Heziom design tokens
- [ ] CA17 — `packages/database` com script de geração de types Supabase (`supabase gen types`)

### apps/web (novo — skeleton apenas)
- [ ] CA18 — `apps/web` criado com React 19, Vite, TanStack Router, Tailwind v4, shadcn/ui
- [ ] CA19 — Estrutura de rotas básica: root, `/dashboard`, `/auth`
- [ ] CA20 — `src/integrations/supabase/client.ts` configurado
- [ ] CA21 — `netlify.toml` com SPA routing + security headers

### Deploy Isolado — Netlify
- [ ] CA22 — 3 sites Netlify criados: `heziom-os`, `heziom-crm`, `heziom-hub`
- [ ] CA23 — Cada site tem `Base directory` configurado para sua pasta (`apps/web`, `apps/crm`, `apps/hub`)
- [ ] CA24 — Deploy de `apps/crm` NÃO dispara rebuild de `apps/web` ou `apps/hub`
- [ ] CA25 — Deploy Previews ativos em todos os sites

### Supabase — Schema Unificado
- [ ] CA26 — Todos os apps apontam para o **mesmo projeto Supabase** (1 projeto, não 3)
- [ ] CA27 — Schemas de domínio criados: `crm`, `hub`, `financeiro`, `comercial`, `editorial`, `atendimento`, `pessoas`, `tarefas`, `fiscal`, `lit_mirror`, `tray_mirror`, `audit`, `agents`, `lgpd`, `config`
- [ ] CA28 — RLS FORCE em todos os schemas; `audit.*` append-only

### CI/CD — GitHub Actions
- [ ] CA29 — `ci.yml`: lint + typecheck + test + build com filtro por paths (só rebuilda app afetado)
- [ ] CA30 — `supabase-migrate.yml`: `supabase db push` ao merge em `main`
- [ ] CA31 — `edge-deploy.yml`: `supabase functions deploy` ao merge em `main`
- [ ] CA32 — Secrets configuradas: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`
- [ ] CA33 — Branch protection em `main`: PR obrigatório, status checks, sem force-push

### TRIVIAIOX
- [ ] CA34 — TRIVIAIOX instalado no monorepo (`npx triviaiox-core install`)
- [ ] CA35 — `npx triviaiox-core doctor` passa sem erros
- [ ] CA36 — Agentes disponíveis e funcionando no Claude Code: `@dev`, `@qa`, `@architect`, `@sm`, `@devops`
- [ ] CA37 — `docs/stories/` configurado como pasta de stories do projeto

---

## Implementação

> ⚠️ Preenchido pelo @dev após concluir. Não editar manualmente.

**Status:**
**Branch/PR:**
**Arquivos alterados:**
-

---

## QA

> ⚠️ Preenchido pelo @qa. Não editar manualmente.

**Gate:** `PASS` | `CONCERNS` | `FAIL`
**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Sem regressões: apps/crm e apps/hub continuam funcionando igual ao repo original
- [ ] Build do monorepo completo < 120s (`pnpm turbo build`)
- [ ] Deploy isolado verificado: push em apps/crm não disparou rebuild de apps/web
- [ ] Supabase schemas criados com RLS FORCE confirmado
- [ ] TRIVIAIOX doctor pass

**Notas QA:**

---

## Notas e Decisões

- `literarius-sync` **permanece fora do monorepo** — deploy e ciclo de vida independentes no Windows Server (ver [[STORY-009 — Setup Raspberry Pi Sync Agent]])
- `apps/tribe` entra no monorepo apenas para gestão centralizada de código; deploy permanece no HuggingFace Space; sem integração com Supabase HeziomOS (CC-BY-NC-4.0)
- Deploy isolado via Netlify Base Directory — mudança em um app não impacta os outros
- **1 projeto Supabase** compartilhado, isolamento por schema de domínio (não por projeto)
- Após importação via git subtree, repos originais podem ser arquivados na org
- TRIVIAIOX: `@devops` é a única autoridade para `git push`; todo push passa por QA gate primeiro

## Dependências

- [[STORY-001 — Setup Infraestrutura]] — Supabase prod/staging, secrets, org GitHub (predecessor)
- Acesso admin à org `Org-Heziom` no GitHub
- Credenciais Netlify para criação dos 3 sites
