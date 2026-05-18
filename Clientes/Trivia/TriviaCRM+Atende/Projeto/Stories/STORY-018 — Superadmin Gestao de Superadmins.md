---
id: STORY-018
titulo: "Superadmin Evoluído — Gestão de Superadmins"
modulo: "Plataforma / Superadmin"
status: "concluida"
fase: 7
prioridade: 2
agente_responsavel: "Dex (@dev) + Aria (@architect)"
atualizado: 2026-05-06
commit: "STORY-018: Superadmin — Gestão de Superadmins"
---

# STORY-018 — Superadmin: Gestão de Superadmins

## Contexto

Permite que um superadmin (com `manage_superadmins: true`) cadastre e gerencie outros superadmins com permissões granulares, sem necessidade de acesso direto ao banco.

## O que foi implementado

### Migration (`20260509000004_story018_superadmins_table.sql`)

- `superadmins(id, user_id UNIQUE FK auth.users, display_name, email, permissions_json, invited_by, is_active, last_login_at, created_at)`
- `permissions_json` default: `{ manage_workspaces: true, manage_superadmins: false, manage_billing: true, view_audit_log: true }`
- RLS:
  - SELECT → is_superadmin(auth.uid())
  - ALL → superadmins WHERE user_id = auth.uid() AND is_active AND manage_superadmins: true
- `is_superadmin()` reescrita: verifica `superadmins.is_active = true` OR `workspace_members.role = superadmin` (retrocompat)
- Indexes: user_id, is_active

### Edge Function `manage-superadmins`

- `GET /` → lista todos os superadmins (requer is_superadmin)
- `POST /invite` → cria auth user se não existe + insere em superadmins + envia e-mail de convite (magic link) + notifica outros superadmins ativos — requer `manage_superadmins: true`
- `PATCH /{id}` → atualiza permissions_json ou is_active — requer `manage_superadmins: true`; bloqueia self-modification
- `DELETE /{id}` → soft deactivate (is_active = false) — requer `manage_superadmins: true`; bloqueia self-deactivation
- Fallback: superadmin via workspace_members (legacy) tem todas as permissões
- Audit log em todas as mutações; `unauthorized_attempt` quando sem permissão

### Frontend — SuperadminsPanel (`src/components/admin/SuperadminsPanel.tsx`)

- Lista com: nome, e-mail, badge "Você", badge "Desativado", permissões granulares (4 PermBadge verde/cinza), tempo desde criação + último acesso
- Botão "Desativar" com confirm() — oculto para o próprio usuário; só visível se `canManage`
- Botão "Reativar" para superadmins inativos
- InviteDialog: e-mail + nome + 4 switches de permissão → chama edge function
- `canManage`: baseado em `permissions_json.manage_superadmins` ou ausência na tabela (legacy SA)

### Admin.tsx — nova tab

- Tab "Equipe SA" (ShieldCheck icon) + `<SuperadminsPanel />`

## Decisões Técnicas

- Sem invalidação de JWT em tempo real — MVP: verificação via `is_superadmin()` a cada request RLS
- Retrocompatibilidade: `is_superadmin()` still checks `workspace_members.role = superadmin` para não quebrar superadmins existentes
- `callEF()` helper no componente para centralizar fetch + auth header
- Token carregado via `useState` com lazy import do supabase client para evitar circular dependencies

## Arquivos criados/modificados

### Criados
- `supabase/migrations/20260509000004_story018_superadmins_table.sql`
- `supabase/functions/manage-superadmins/index.ts`
- `src/components/admin/SuperadminsPanel.tsx`

### Modificados
- `src/pages/Admin.tsx` — import SuperadminsPanel + tab "Equipe SA"
- `PROJECT_REQUIREMENTS.md` — seção STORY-018 + edge function na tabela
