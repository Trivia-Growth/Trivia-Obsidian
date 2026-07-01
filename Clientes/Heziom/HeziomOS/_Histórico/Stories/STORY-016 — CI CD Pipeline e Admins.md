---
id: STORY-016
titulo: "CI/CD Pipeline GitHub Actions + Admins Supabase"
fase: 1
modulo: infra
status: concluido
prioridade: alta
agente_responsavel: "@devops"
criado: 2026-06-16
atualizado: 2026-06-16
---

# STORY-016 — CI/CD Pipeline GitHub Actions + Admins Supabase

## Contexto

Com o monorepo e o Supabase configurados, precisamos de um mecanismo para aplicar migrations automaticamente via git (sem CLI local). Esta story cobre os 3 workflows GitHub Actions e a configuração dos usuários fundadores como admins.

Relações: [[STORY-013 — Setup Monorepo heziomos]] · [[STORY-014 — Setup Supabase Unificado]] · [[STORY-015 — Instalação TRIVIAIOX]]

## Critérios de Aceite

- [x] `.github/workflows/ci.yml` — lint + typecheck + build via turbo
- [x] `.github/workflows/supabase-migrate.yml` — `supabase db push` no push para main + `workflow_dispatch`
- [x] `.github/workflows/edge-deploy.yml` — `supabase functions deploy` no push de functions
- [x] Secrets configurados: SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_REF, SUPABASE_DB_PASSWORD
- [x] Migrations 0000-0007 aplicadas com sucesso no projeto `ouvfthknhqcciuothrqb`
- [x] João (87f2cc24-cb72-4d41-a3eb-cfc2d1d845a6) como superadmin + owner
- [x] Lucas (78fb5d14-2fae-44e6-aeb6-62dea4d0e9d5) como superadmin + owner
- [x] Workspace "Heziom Editora" criado (id: 00000000-0000-0000-0000-000000000001)

## Problemas Encontrados e Resolvidos

| Problema | Causa | Solução |
|----------|-------|---------|
| `SUPABASE_ACCESS_TOKEN` vazio | `environment: production` isola secrets | Removido environment block |
| Rate limit no `setup-cli` | `version: latest` usa GitHub API | Pinado `version: 2.23.4` |
| `extension "pgvector" is not available` | Nome errado | `"vector"` não `"pgvector"` |
| `column workspace_id does not exist` | junction tables (contact_tags, pipeline_stages, persona_knowledge_bases) | Políticas individuais via FK parent |
| `invalid enum app_role: "owner"` | 'owner' faltava no enum | Adicionado ao ENUM |
| `extensions.cron.schedule` cross-db error | Prefixo errado | Corrigido para `cron.schedule` |
| `logmanager_order_id` em tabela errada | Índice apontava para shipment_trackings | Movido para hub.shipments |
| FK violation em workspace_members | Workspace só no seed.sql (não roda via db push) | Workspace incluído na migration 0007 |
| UUIDs errados dos admins | Usuários foram recriados | Corrigidos via screenshot atual |

## Resultado

**7 migrations aplicadas com sucesso:**
- 0000: schemas + extensões
- 0001: CRM completo (~73 tabelas)
- 0002: Hub completo (shipments, rastreamento, scan states)
- 0003: Financeiro
- 0004: lit_mirror
- 0005: audit (append-only)
- 0006: config + lgpd
- 0007: workspace + admins + seed data

## Próximas Stories (bloqueadas por João)

| Story | Descrição | Bloqueio |
|-------|-----------|---------|
| 2.1 | Frontend Shell (apps/web + login + AppShell) | Aguardar João finalizar heziom-sales |
| 2.2 | Migração CRM (heziom-sales → features/crm) | Aguardar 2.1 + João OK |
| 2.3 | Migração Hub (hubtransportadorashzm → features/hub) | Aguardar 2.1 |
| 2.4 | Gerar DB Types (@heziom/database) | `supabase login` no ambiente CI |
