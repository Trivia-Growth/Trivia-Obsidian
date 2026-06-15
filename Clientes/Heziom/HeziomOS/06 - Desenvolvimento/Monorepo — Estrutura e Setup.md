# Monorepo HeziomOS — Estrutura e Setup

> **Status:** planejado · **Implementação:** pendente (ver [[STORY-013 — Setup Monorepo heziomos]])
> **Decisão:** ADR-0001 (pnpm workspaces + Turborepo) — [[HeziomOS — Arquitetura v3]]

---

## O que é o monorepo `heziomos`

Repositório privado único que centraliza todo o código do HeziomOS. Substitui os repos separados existentes trazendo-os como workspaces (`apps/*`), compartilhando packages comuns e unificando CI/CD.

**Repo:** `https://github.com/Org-Heziom/heziomos.git` ✅ criado em 2026-06-15 (propriedade da Heziom — §8 Escopo Técnico)

---

## Estrutura de Pastas

```
heziomos/
├── apps/
│   ├── web/                # NOVO — HeziomOS frontend unificado
│   │                       # React 19 · Vite · TanStack Router · Tailwind v4 · shadcn/ui
│   │                       # Deploy: Netlify (site principal)
│   │
│   ├── crm/                # ← heziom-sales (importado via git subtree)
│   │                       # React 18 · Supabase · CRM, pipeline, WhatsApp, IA
│   │                       # Deploy: Netlify (site próprio durante transição)
│   │
│   ├── hub/                # ← hubtransportadorashzm (importado via git subtree)
│   │                       # React 18 · Supabase · Hub de transportadoras
│   │                       # Deploy: Netlify (site próprio durante transição)
│   │
│   ├── tribe/              # ← tribe-criativo-lab (importado via git subtree)
│   │                       # Python · Gradio · Brain encoding demo
│   │                       # Deploy: Hugging Face Space (inalterado, CC-BY-NC-4.0)
│   │                       # ⚠️ Licença não-comercial — sem integração com Supabase HeziomOS
│   │
│   └── agent-runtime/      # PLACEHOLDER Fase 2 — Inngest workers
│                           # Deploy: Fly.io ou Railway
│
│   ─────────────────────────────────────────────────────────
│   FORA DO MONOREPO (repo e deploy independentes):
│   literarius-sync → github.com/Org-Heziom/literarius-sync
│   Deno 2.x · Windows Server Intelinove · Task Scheduler
│   Sincroniza Literarius SQL Server → Supabase HeziomOS
│   ─────────────────────────────────────────────────────────
│
├── packages/
│   ├── config/             # @heziom/config
│   │                       # Biome (lint+format) + tsconfig presets compartilhados
│   │                       # Consumido por todos os apps
│   │
│   ├── shared/             # @heziom/shared
│   │                       # Types TypeScript + Zod schemas comuns
│   │                       # Ex: User, Role, ApiResponse, paginação
│   │
│   ├── ui/                 # @heziom/ui
│   │                       # shadcn/ui + Heziom design tokens (cores, tipografia)
│   │                       # Consumido por apps/web, apps/crm, apps/hub
│   │
│   ├── database/           # @heziom/database
│   │                       # Supabase types gerados (supabase gen types typescript)
│   │                       # Source of truth dos tipos do banco
│   │
│   ├── integrations/       # @heziom/integrations
│   │                       # Adapters externos: tray, qive, mandae, bookwire…
│   │
│   ├── whatsapp/           # @heziom/whatsapp
│   │                       # Abstração de provider: meta-cloud, z-api, evolution
│   │
│   └── agents/             # @heziom/agents
│                           # Prompts versionados + tools + guardrails por agente
│
├── supabase/
│   ├── migrations/         # ⭐ SOURCE OF TRUTH das migrations
│   │                       # literarius-sync só referencia daqui
│   ├── functions/          # Edge Functions (Deno + Zod + JWT)
│   │   ├── _shared/        # auth middleware, logger, Zod helpers, request-id
│   │   ├── dashboard-ceo/
│   │   ├── briefing-7h/
│   │   ├── alertas-teams/
│   │   ├── tray-webhook/
│   │   ├── tray-reconcile/
│   │   ├── lgpd-export/
│   │   └── lgpd-delete/
│   └── seed.sql            # Dados iniciais para dev/staging
│
├── docs/
│   ├── adr/                # ADR-0001..0010 (transcritos do vault)
│   └── runbooks/           # Incident response, deploy, sync recovery
│
├── .github/
│   └── workflows/
│       ├── ci.yml          # lint · typecheck · test · build · db diff · audit
│       ├── supabase-migrate.yml
│       └── edge-deploy.yml
│
├── turbo.json              # Pipelines: build, dev, lint, typecheck, test
├── pnpm-workspace.yaml     # Workspaces: apps/*, packages/*
├── package.json            # Root — private, engines (node≥20, pnpm≥9), turbo scripts
├── biome.json              # Lint + format (substitui ESLint + Prettier)
├── tsconfig.base.json      # strict: true, noUncheckedIndexedAccess: true
├── .gitignore
└── CLAUDE.md               # Instruções do agente para o monorepo
```

---

## Arquitetura de Deploy

### Supabase — 1 Projeto Único

Todo o HeziomOS usa **1 projeto Supabase** (não projetos separados por app). O isolamento é feito por **schema de domínio** (PostgreSQL schemas):

| Schema | Sistema dono | Exemplos de tabelas |
|---|---|---|
| `crm` | apps/crm | `crm.contacts`, `crm.deals`, `crm.pipelines` |
| `hub` | apps/hub | `hub.shipments`, `hub.carriers`, `hub.orders` |
| `financeiro` | apps/web (HeziomOS) | `financeiro.payment_proposals`, `financeiro.approvals` |
| `comercial` | apps/web | `comercial.pipeline`, `comercial.goals` |
| `editorial` | apps/web | `editorial.projects`, `editorial.stages` |
| `atendimento` | apps/web | `atendimento.conversations`, `atendimento.messages` |
| `pessoas` | apps/web | `pessoas.members`, `pessoas.commissions` |
| `tarefas` | apps/web | `tarefas.tasks`, `tarefas.boards` |
| `fiscal` | apps/web | `fiscal.nfe_queue` |
| `lit_mirror` | literarius-sync | `lit_mirror.titulo_financeiro`, `lit_mirror.nota_fiscal` |
| `tray_mirror` | webhooks/reconcile | `tray_mirror.orders`, `tray_mirror.products` |
| `audit` | todos (append-only) | `audit.actions_log`, `audit.sync_logs` |
| `agents` | apps/agent-runtime | `agents.sessions`, `agents.memory_embeddings` |
| `lgpd` | apps/web | `lgpd.consent_records`, `lgpd.export_requests` |
| `config` | admin | `config.feature_flags`, `config.alert_config` |

> **Convenção:** `schema.tabela` é o identificador completo. Tabelas não precisam de prefixo extra porque o schema já segrega. Ex: `SELECT * FROM crm.contacts` é inequívoco.

**Regras:**
- RLS FORCE em todos os schemas — nenhuma query passa sem policy
- `audit.*` → append-only (deny UPDATE/DELETE para todos, inclusive `service_role`)
- `packages/database` é o owner dos types gerados

### Netlify — Deploy Isolado por App

Cada app tem **seu próprio site Netlify**. Mudança em `apps/crm` **NÃO** dispara deploy de `apps/hub` ou `apps/web`:

| App | Netlify Base Dir | Comportamento |
|---|---|---|
| `apps/web` | `apps/web` | Rebuild se mudou `apps/web/**` ou `packages/**` |
| `apps/crm` | `apps/crm` | Rebuild se mudou `apps/crm/**` ou `packages/**` |
| `apps/hub` | `apps/hub` | Rebuild se mudou `apps/hub/**` ou `packages/**` |
| `apps/tribe` | — | Deploy permanece no Hugging Face Space |

**Como o isolamento funciona:**
1. Cada site Netlify tem `Base directory` configurado para sua pasta
2. Netlify só rebuilda se arquivos dentro do base dir mudaram
3. GitHub Actions usa filtro `paths:` por job para reforçar o isolamento
4. Turborepo `--filter=[HEAD^1]` detecta somente pacotes afetados no CI

**Target futuro:** features de `apps/crm` e `apps/hub` migram gradualmente para `apps/web` (HeziomOS unificado). Quando uma feature migra, o site Netlify correspondente é desativado.

---

## Como Importar os Repos Existentes

Os 3 repos entram via `git subtree` — preserva histórico de commits:

```bash
cd heziomos

# heziom-sales → apps/crm
git subtree add --prefix apps/crm \
  https://github.com/Org-Heziom/heziom-sales main --squash

# hubtransportadorashzm → apps/hub
git subtree add --prefix apps/hub \
  https://github.com/Org-Heziom/hubtransportadorashzm main --squash

# tribe-criativo-lab → apps/tribe
git subtree add --prefix apps/tribe \
  https://github.com/Org-Heziom/tribe-criativo-lab main --squash
```

Para sincronizar atualizações futuras de um repo externo para o monorepo:

```bash
git subtree pull --prefix apps/crm \
  https://github.com/Org-Heziom/heziom-sales main --squash
```

> **Nota:** após a importação, os repos originais podem ser arquivados. Todo desenvolvimento passa a ser feito no monorepo.

---

## TRIVIAIOX no Monorepo

O monorepo usa o framework **TRIVIAIOX** (v5.0.3) para desenvolvimento guiado por agentes.

### Instalação

```bash
cd heziomos

# Instalar no projeto existente
npx triviaiox-core install

# Verificar saúde
npx triviaiox-core doctor
```

### Agentes Disponíveis (para uso no Claude Code)

| Agente | Nome | Responsabilidade |
|---|---|---|
| `@analyst` | Alex | Business analysis, PRD, FinOps |
| `@pm` | Morgan | Product Manager, requisitos |
| `@architect` | Aria | Arquitetura, ADRs, threat modeling |
| `@sm` | River | Scrum Master, criação de stories |
| `@dev` | Dex | Desenvolvimento e debug |
| `@qa` | Quinn | Quality gates, testes, OWASP |
| `@po` | Pax | Product Owner, backlog, Privacy by Design |
| `@data-engineer` | Dara | Database, schema, queries |
| `@devops` | Gage | CI/CD, infra — **única autoridade para git push** |
| `@security` | Cipher | AppSec gate, secrets scanning |
| `@reliability` | Rex | SRE, SLOs/SLIs, incident response |
| `@prompt-engineer` | Pria | Prompt Ops, LLM engineering |

### Workflow TRIVIAIOX

```
@analyst/@pm → @architect → @sm (cria story) → @dev (implementa) → @qa (gate) → @devops (push)
```

### Estrutura gerada no monorepo

```
heziomos/
├── .triviaiox-core/    # Core do framework (não editar)
├── .claude/
│   ├── CLAUDE.md       # Configuração principal
│   └── rules/          # Regras de autoridade dos agentes
└── docs/stories/       # Stories ativas e concluídas
    ├── active/
    └── completed/
```

---

## Stack Completa por Workspace

| Workspace | Stack | Deploy |
|---|---|---|
| `apps/web` | React 19, Vite, TanStack Router, Tailwind v4, shadcn/ui, TanStack Query, Zod | Netlify |
| `apps/crm` | React 18, Vite, React Router, Tailwind, shadcn/ui, TanStack Query, Zod | Netlify |
| `apps/hub` | React 18, Vite, React Router, Tailwind, shadcn/ui, TanStack Query, Zod | Netlify |
| `apps/tribe` | Python 3.10+, Gradio, TRIBE v2, PyTorch, Claude API | HuggingFace |
| `apps/agent-runtime` | Deno/Node, Inngest, OpenRouter | Fly.io/Railway |
| `packages/config` | Biome, TypeScript | — |
| `packages/shared` | TypeScript strict, Zod | — |
| `packages/ui` | React, shadcn/ui, Tailwind v4 | — |
| `packages/database` | Supabase types gen | — |
| `supabase/functions` | Deno, Zod, JWT | Supabase Edge |
| `literarius-sync` *(externo)* | Deno 2.x, mssql, Zod | Windows Server |

---

## Referências

- [[HeziomOS — Arquitetura v3]] — ADRs 0001–0010, stack decisions
- [[HeziomOS — Complemento Técnico v2 (Conselho)]] — segurança, LGPD, RLS
- [[STORY-001 — Setup Infraestrutura]] — critérios de aceite da infra base
- [[STORY-013 — Setup Monorepo heziomos]] — story de implementação deste setup
