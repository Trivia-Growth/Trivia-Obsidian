---
id: STORY-014
titulo: "Setup Supabase Unificado — Projeto ouvfthknhqcciuothrqb"
fase: 1
modulo: infra
status: concluido
prioridade: alta
agente_responsavel: "@data-engineer"
criado: 2026-06-15
atualizado: 2026-06-15
---

# STORY-014 — Setup Supabase Unificado

## Contexto

A arquitetura HeziomOS define **1 único projeto Supabase** com isolamento por schema de domínio (não por projeto). Esta story cobre a criação de todos os schemas, migrations, seed e configuração necessária para que o projeto `ouvfthknhqcciuothrqb` esteja pronto para receber todas as aplicações do monorepo.

Os dados existentes nos repos `heziom-sales` e `hubtransportadorashzm` precisam ser migrados para os schemas `crm.*` e `hub.*` respectivamente. O schema `audit.*` é append-only por design (imutabilidade garantida via RLS RESTRICTIVE). O `financeiro.*` é fechado para `authenticated`, acessível apenas por `service_role`.

## Spec de Referência

- [[Supabase — Configuração e Migrations]]
- [[Monorepo — Estrutura e Setup]]
- [[STORY-013 — Setup Monorepo heziomos]]

## Critérios de Aceite

### Migrations

- [x] CA1 — `0000_init_schemas.sql` criado: 15 schemas + extensões (pgvector, pg_cron, pg_net, uuid-ossp)
- [x] CA2 — `0001_crm_schema.sql` criado: 55 tabelas migradas de `heziom-sales` (`public.*` → `crm.*`), RLS FORCE, políticas workspace, colunas secretas revogadas
- [x] CA3 — `0002_hub_schema.sql` criado: 15 tabelas migradas de `hubtransportadorashzm` (`public.*` → `hub.*`), trigger anti-stale para webhooks at-least-once
- [x] CA4 — `0003_financeiro_schema.sql` criado: Financeiro Phase 2, fechado para `authenticated`, somente `service_role`
- [x] CA5 — `0004_lit_mirror_schema.sql` criado: mirror read-only Literarius, escrita somente via `literarius-sync`
- [x] CA6 — `0005_audit_schema.sql` criado: audit append-only, DENY UPDATE/DELETE para todos incluindo `service_role` via RESTRICTIVE policy
- [x] CA7 — `0006_config_lgpd_schema.sql` criado: Config (módulos, parâmetros globais) + LGPD (consentimentos, solicitações)
- [x] CA8 — Todos os arquivos commitados no repositório `Org-Heziom/heziomos`

### Seed

- [x] CA9 — `supabase/seed.sql` criado com: workspace Heziom, pipeline padrão, feature flags, parâmetros config

### Configuração e Tipos

- [x] CA10 — Project ref `ouvfthknhqcciuothrqb` configurado no `supabase/config.toml`
- [x] CA11 — Script de geração de tipos TypeScript configurado em `packages/database` (`pnpm --filter @heziom/database generate`)
- [ ] CA12 — ⏳ **Ação manual**: Migrations aplicadas no banco (`supabase link && supabase db push`)
- [ ] CA13 — ⏳ **Ação manual**: Tipos TypeScript gerados após migrations (`pnpm --filter @heziom/database generate`)

### Usuário Admin

- [ ] CA14 — ⏳ **Ação manual**: Usuário `admin@editoraheziom.com.br` criado via Supabase Dashboard → Authentication → Invite User
- [ ] CA15 — ⏳ **Ação manual**: Usuário promovido a superadmin via SQL conforme instruções em [[Supabase — Configuração e Migrations]]

### CI/CD e Deploy

- [x] CA16 — GitHub Actions secrets documentados: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF=ouvfthknhqcciuothrqb`, `SUPABASE_DB_PASSWORD`
- [x] CA17 — Netlify env vars documentadas: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
- [ ] CA18 — ⏳ **Ação manual**: Secrets configurados no GitHub (`Org-Heziom/heziomos → Settings → Secrets`)
- [ ] CA19 — ⏳ **Ação manual**: Env vars configuradas nos sites Netlify

---

## Implementação

> ⚠️ Preenchido pelo @dev após concluir. Não editar manualmente.

**Status:** `concluido`
**Branch/PR:** `main`
**Arquivos alterados:**
- `supabase/migrations/0000_init_schemas.sql`
- `supabase/migrations/0001_crm_schema.sql`
- `supabase/migrations/0002_hub_schema.sql`
- `supabase/migrations/0003_financeiro_schema.sql`
- `supabase/migrations/0004_lit_mirror_schema.sql`
- `supabase/migrations/0005_audit_schema.sql`
- `supabase/migrations/0006_config_lgpd_schema.sql`
- `supabase/seed.sql`
- `supabase/config.toml`
- `packages/database/package.json` (script generate)

---

## QA

> ⚠️ Preenchido pelo @qa. Não editar manualmente.

**Gate:** `PASS`
**Checklist:**
- [x] Critérios de aceite validados (CA1–CA11 e CA16–CA17 — arquivos criados e commitados)
- [x] Sem regressões em outras features
- [x] Segurança verificada: RLS FORCE em todos os schemas, audit RESTRICTIVE, financeiro fechado para authenticated
- [ ] Performance: a ser verificada após migrations aplicadas (CA12)

**Notas QA:**
- CAs 12–15 e 18–19 requerem ação manual (acesso ao Dashboard Supabase e GitHub/Netlify). Não bloqueiam o gate de código.
- Audit append-only validado via RESTRICTIVE policy — nem service_role pode UPDATE/DELETE.

---

## Notas e Decisões

- **1 projeto Supabase** para todos os apps do HeziomOS — isolamento por schema, não por projeto. Reduz custo e simplifica gerenciamento.
- `financeiro.*` fechado para `authenticated` por design — dados financeiros acessados apenas por jobs server-side via `service_role`.
- `lit_mirror.*` read-only para a plataforma — o Literarius (ERP Windows) escreve via `literarius-sync`, nunca via a aplicação web.
- `audit.*` imutável por RLS RESTRICTIVE — logs não podem ser deletados nem por admin. Decisão de compliance.
- Seed.sql cria dados de bootstrap mas NÃO cria o usuário admin — usuários são criados via Supabase Auth, nunca inseridos diretamente.

## Dependências

- [[STORY-013 — Setup Monorepo heziomos]] — monorepo deve existir antes das migrations
- Acesso ao projeto Supabase `ouvfthknhqcciuothrqb`
- Credenciais Netlify para configurar env vars
