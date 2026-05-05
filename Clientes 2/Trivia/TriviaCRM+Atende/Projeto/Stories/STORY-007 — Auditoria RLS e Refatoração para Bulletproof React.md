---
id: STORY-007
titulo: "Auditoria RLS e Refatoração Estrutura Bulletproof React"
modulo: "Arquitetura"
status: "em-progresso"
fase: 3
prioridade: 3
agente_responsavel: "—"
atualizado: 2026-05-05
---

# STORY-007 — Auditoria RLS e Refatoração Estrutura Bulletproof React

## Contexto (Auditoria TRIVIAIOX — 2026-05-05)

### RLS
Multi-tenancy depende totalmente do RLS do Supabase. As queries do frontend filtram por `workspace_id`, mas se o RLS não estiver com FORCE, um token service_role ou uma misconfiguration pode vazar dados entre workspaces.

### Arquitetura
O projeto não segue a estrutura Bulletproof React do padrão Trivia:
- Não existe `src/features/` — todo código de feature está em `src/components/<domínio>/` e `src/hooks/`
- Não existe `src/types/` (coberto na STORY-003)
- Não existe `src/config/` com env tipada
- Hooks de features diferentes são importados livremente entre pages

## Parte 1 — Auditoria RLS (prioridade alta)

- [ ] Acessar Supabase Dashboard → Table Editor → verificar cada tabela:
  - `contacts`: RLS habilitado + FORCE ROW LEVEL SECURITY?
  - `companies`: idem
  - `deals`: idem
  - `activities`: idem
  - `conversations`: idem
  - `messages`: idem
  - `pipelines` / `pipeline_stages`: idem
  - `ai_agents` / `ai_providers_config` / `copilot_profiles` / `knowledge_entries`: idem
  - `zapi_instances`: idem
- [ ] Verificar que todas as policies filtram por `workspace_id` via `is_member_of_workspace()`
- [ ] Registrar resultado em `SECURITY_DEBT.md` — adicionar SEC-005 para cada tabela sem FORCE

## Parte 2 — Estrutura Bulletproof React (prioridade média)

- [x] Criar `src/config/env.ts` com variáveis de ambiente tipadas
- [x] Criar `src/features/` com subpastas: `crm/`, `conversations/`, `meetings/`, `roleplay/`, `settings/`, `dashboard/`
- [x] Criar `src/features/README.md` com regras de isolamento e estratégia de migração gradual
- [ ] Mover componentes de `src/components/crm/` → `src/features/crm/components/` *(migração gradual — não mover tudo de uma vez para evitar conflitos Lovable)*
- [ ] Mover componentes de `src/components/conversations/` → `src/features/conversations/components/`
- [ ] Mover hooks específicos de feature: `use-contacts`, `use-deals`, `use-companies` → `src/features/crm/hooks/`
- [ ] Mover `use-conversations` → `src/features/conversations/hooks/`
- [ ] Manter em `src/components/`: apenas `ui/` (shadcn) e componentes verdadeiramente compartilhados (AppLayout, AppSidebar)
- [ ] Manter em `src/hooks/`: apenas hooks cross-feature (`use-workspace`, `use-profile`, `use-auth`)

## Critérios de Aceite

### RLS
- [ ] Todas as tabelas com dados de workspace têm RLS habilitado + FORCE
- [ ] `SECURITY_DEBT.md` atualizado com resultado da auditoria

### Bulletproof React
- [ ] `src/config/env.ts` criado e importado no `main.tsx`
- [ ] `src/features/` criado com pelo menos `crm/` e `conversations/` migrados
- [ ] `npm run build` passa sem erros após refatoração
- [ ] Nenhuma feature importa hook de outra feature diretamente
