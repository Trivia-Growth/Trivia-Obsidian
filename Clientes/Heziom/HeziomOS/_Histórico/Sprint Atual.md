---
tags: [projeto, sprint]
sprint: 2
inicio: 2026-06-15
fim: ""
objetivo: "Monorepo HeziomOS — Fundação completa + Supabase unificado pronto"
---

# Sprint 2 — Fundação do Monorepo HeziomOS

**Período:** 2026-06-15 → em andamento
**Objetivo:** Monorepo `heziomos` funcional, Supabase unificado com todas as migrations aplicadas, CI/CD operacional e frontend shell básico aguardando migração CRM/Hub.

---

## Stories do Sprint

| Story | Título | Status | Agente |
|-------|--------|--------|--------|
| [[STORY-013 — Setup Monorepo heziomos]] | Setup Monorepo | ✅ concluído | @dev |
| [[STORY-014 — Setup Supabase Unificado]] | Supabase + Migrations | ✅ concluído | @data-engineer |
| [[STORY-015 — Instalação TRIVIAIOX]] | TRIVIAIOX Framework | ✅ concluído | @devops |
| [[STORY-016 — CI CD Pipeline e Admins]] | CI/CD + Admins | ✅ concluído | @devops |
| STORY-017 — Frontend Shell (apps/web) | Login + AppShell | ⏸ bloqueado | @dev |
| STORY-018 — Migração CRM | heziom-sales → features/crm | ⏸ bloqueado | @dev |
| STORY-019 — Migração Hub | hubtransportadorashzm → features/hub | ⏸ bloqueado | @dev |

---

## Estado atual do banco (ouvfthknhqcciuothrqb)

✅ Migrations 0000-0007 aplicadas
✅ 15 schemas criados: crm, hub, financeiro, comercial, editorial, atendimento, pessoas, tarefas, fiscal, lit_mirror, tray_mirror, audit, agents, lgpd, config
✅ ~80 tabelas com RLS FORCE
✅ João Novais e Lucas Azevedo como superadmin + owner
✅ Workspace "Heziom Editora" criado

---

## Critério de conclusão do sprint

- [x] Monorepo com pnpm workspaces + Turborepo
- [x] packages/config, shared, ui, database
- [x] Migrations SQL aplicadas no Supabase prod
- [x] CI/CD GitHub Actions operacional
- [x] TRIVIAIOX doctor passando
- [ ] Frontend shell (login + AppShell) deployado no Netlify
- [ ] Módulo CRM funcionando (aguarda João)
- [ ] Módulo Hub funcionando (aguarda João)

---

## Impedimentos

- **STORY-017/018/019:** Aguardando João finalizar heziom-sales para pegar versão definitiva antes de migrar código
- **@heziom/database generate:** Precisa de `supabase login` no ambiente (personal access token)

---

## Próximo Sprint (previsão)

Sprint 3 — Migração CRM + Hub (quando João der OK)
