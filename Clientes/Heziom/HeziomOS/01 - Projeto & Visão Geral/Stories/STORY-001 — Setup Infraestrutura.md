---
id: STORY-001
titulo: "Setup Infraestrutura (Monorepo + Supabase + Netlify + Actions)"
fase: 1
modulo: infra
status: em revisão
prioridade: alta
agente_responsavel: ""
criado: 2026-04-16
atualizado: 2026-05-26
versao: 2.0
substitui_versao_anterior: 1.0 (baseada em arquitetura v1, 2 repos + Lovable)
---

# STORY-001 — Setup Infraestrutura

## Contexto

Antes de qualquer desenvolvimento, a base técnica precisa estar no lugar: **monorepo único** com `apps/web`, `apps/sync-agent`, `apps/agent-runtime`, banco Supabase configurado (com schemas por domínio + governança), deploy automático no Netlify e CI no GitHub Actions.

> ⚠️ **Mudança vs versão 1.0:** a arquitetura v1 previa 2 repositórios (`HezionOS` docs + `heziom-os-app` código) e desenvolvimento via Lovable. A [[HeziomOS — Arquitetura v3]] consolidou tudo em **1 monorepo** (`heziomos`) sem Lovable — desenvolvimento via TRIVIAIOX + Claude Code/Codex. O vault Obsidian (`Trivia-Obsidian`) permanece separado e já configurado.

## Spec de Referência

- [[HeziomOS — Arquitetura v3]] — vigente, ADRs 0001–0010
- [[Setup do Repositório]] — passo a passo de criação do repo, branch protection, secrets, CODEOWNERS
- [[Views — Camada de Acesso HeziomOS]] — views a solicitar para equipe Literarius

## Critérios de Aceite

### Repositório
- [ ] CA1 — Organização GitHub da Heziom identificada (ou criada) — registrada em [[Setup do Repositório]]
- [ ] CA2 — Repositório privado `heziomos` criado na org Heziom, propriedade da Heziom (§8 Escopo Técnico)
- [ ] CA3 — Estrutura monorepo conforme §5 da Arquitetura v3:
  - `apps/web` (React 19 + Vite + TanStack Router)
  - `apps/sync-agent` (Deno)
  - `apps/agent-runtime` (Inngest workers — placeholder Fase 2)
  - `packages/{database,shared,ui,integrations,whatsapp,agents,config}`
  - `supabase/{migrations,functions}`
  - `docs/{adr,runbooks}`
  - `.github/workflows`
- [ ] CA4 — Stack do monorepo configurada: pnpm workspaces + Turborepo + Biome + TypeScript strict + Vitest
- [ ] CA5 — `CLAUDE.md` na raiz com path do vault (`../Trivia-Obsidian/Clientes/Heziom/HeziomOS/`), papéis, regras invioláveis, deploy commands
- [ ] CA6 — Branch protection em `main`: PR obrigatório, status checks (lint+typecheck+test), 1 reviewer mínimo, sem force-push
- [ ] CA7 — CODEOWNERS configurado (Lucas Azevedo como owner padrão; áreas críticas com revisão obrigatória)
- [ ] CA8 — Templates de Issue (bug, story, decisão) e PR (com checklist DoD)

### Supabase
- [ ] CA9 — Projetos Supabase criados: **prod** e **staging** (ambientes isolados desde o dia 1, conforme §6 Escopo Técnico)
- [ ] CA10 — Extensões habilitadas: `pgvector`, `pg_cron`, `pg_net`
- [ ] CA11 — Schemas criados conforme §6 da Arquitetura v3: `financeiro`, `editorial`, `crm`, `atendimento`, `comercial`, `pessoas`, `tarefas`, `fiscal`, `lit_mirror`, `tray_mirror`, `audit`, `agents`, `lgpd`, `config`
- [ ] CA12 — RLS habilitado + FORCE em todas as tabelas criadas
- [ ] CA13 — Policy de append-only em `audit.*` (deny UPDATE/DELETE para todos, inclusive `service_role`)
- [ ] CA14 — Variáveis configuradas:
  - Frontend (Netlify): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
  - Edge Functions: `SUPABASE_SERVICE_ROLE_KEY`, `TEAMS_WEBHOOK_URL`
  - Sync Agent (servidor Heziom): credenciais SQL Literarius + Supabase service_role

### CI/CD
- [ ] CA15 — Netlify conectado ao repo, deploy automático no push para `main` (frontend)
- [ ] CA16 — Netlify Deploy Previews ativados para PRs
- [ ] CA17 — GitHub Actions: workflow `ci.yml` rodando lint + typecheck + test em todo PR
- [ ] CA18 — GitHub Actions: workflow `supabase-migrate.yml` rodando `supabase db push` ao merge em `main` (com diff check)
- [ ] CA19 — GitHub Actions: workflow `edge-deploy.yml` rodando `supabase functions deploy` ao merge em `main`
- [ ] CA20 — Secrets configuradas no Actions: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`

### Vault Obsidian
- [ ] CA21 — Vault `Trivia-Obsidian` continua funcional (sem mudanças); JG e Lucas seguem usando obsidian-git conforme [[Setup João]]
- [ ] CA22 — Atalho/link adicionado no `CLAUDE.md` do monorepo apontando para `../Trivia-Obsidian/Clientes/Heziom/HeziomOS/`

### Sync Agent (Windows)
- [ ] CA23 — Instalador Windows (`HeziomOS-Sync-Setup-vX.Y.Z.exe`) gerado via `deno compile` + Inno Setup ou WiX
- [ ] CA24 — Setup registra a aplicação no **Agendador de Tarefas do Windows** com restart-on-fail
- [ ] CA25 — Heartbeat funcionando: sync envia "estou vivo" para Supabase a cada minuto
- [ ] CA26 — Alerta Teams configurado: se heartbeat falhar por 5 min, dispara alerta
- [ ] CA27 — Instalação validada no servidor da Heziom (mesmo servidor que hospeda o PowerBI legado)

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

**Gate:**
**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Sem regressões em outras features (N/A — primeira story)
- [ ] Segurança verificada: RLS FORCE, secrets fora do client, policies append-only em audit
- [ ] Performance aceitável: build do monorepo < 60s, deploy Netlify < 3min
- [ ] Sync agent: heartbeat estável por 24h em ambiente de teste

**Notas QA:**

---

## Notas e Decisões

- **1 monorepo único** `heziomos` (não 2 repos como na versão v1)
- **Sync-agent dentro do monorepo** como `apps/sync-agent`; build gera `.exe` standalone via `deno compile`
- **Sem Lovable** — desenvolvimento todo via TRIVIAIOX + Claude Code/Codex
- **Microsoft SSO configurado desde o dia 1** mas só ativado na entrega (ADR-0006)
- **Endpoints LGPD desde a Fase 1** mesmo sem dados de cliente ainda — preparar `lgpd-export` e `lgpd-delete` (placeholder ok)
- **Vault Obsidian** continua em repo separado (`Trivia-Obsidian`) — sem migração
- **Ambientes prod + staging desde já**, conforme §6 Escopo Técnico

---

## Dependências

- [[Setup do Repositório]] — pré-requisito para CA1–CA8
- D4 (6 views Literarius) — bloqueia CA25 quando sync-agent começar a popular `lit_mirror`
- Definição do servidor Windows da Heziom — bloqueia CA27
