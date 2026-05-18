---
id: STORY-016
titulo: "Superadmin Expandido + API Pública + Billing"
modulo: "Superadmin / Settings / LGPD"
status: "concluida"
fase: 6
prioridade: 1
agente_responsavel: "Dex (@dev) + Aria (@architect)"
atualizado: 2026-05-06
commit: "STORY-016: Superadmin Expandido + API Pública + Billing"
---

# STORY-016 — Superadmin Expandido + API Pública + Billing

## Contexto

Expandir o painel superadmin com métricas globais reais, impersonação contextual, gestão de status de workspace e criação de usuários. Adicionar settings de API pública (tokens + inbound webhooks) e card de plano. Completar a conformidade LGPD com soft-delete de contatos.

## O que foi implementado

### Migration (`20260509000002_story016_superadmin_api_billing.sql`)

- `workspaces.status` — `active | trial | suspended | cancelled`
- `inbound_webhooks` — id, workspace_id, name, token_hash, source_name, field_mapping_json, flow_id
- `api_tokens` — id, workspace_id, name, token_hash, token_prefix, permissions, last_used_at, expires_at
- `api_request_logs` — id, workspace_id, token_id, endpoint, method, status_code, ip_address
- `contacts.deleted_at` + `contacts.deletion_scheduled_at` (soft delete LGPD)
- RLS FORCE em todas as tabelas novas; policies admin-only para tokens/webhooks; service_role INSERT para logs

### Edge Functions

#### `admin-create-user`
- Superadmin-only (via `is_superadmin()` RPC)
- Input: `{ email, workspace_id, role, display_name }`
- Cria usuário auth + perfil + workspace_member (com rollback se member insert falhar)
- Envia e-mail de boas-vindas com senha temporária via Resend
- Audit log em `audit_logs`

#### `admin-reset-password`
- Superadmin-only
- Input: `{ user_id }`
- Gera recovery link via `supabase.auth.admin.generateLink({ type: "recovery" })`
- Envia por e-mail via Resend
- Audit log em `audit_logs`

### Frontend — Admin.tsx (reescrito)

- **GlobalMetrics**: 6 KPI cards (workspaces ativos, trial, suspensos, MRR, total usuários, total workspaces) calculados em tempo real
- **WorkspacesPanel**: filtro por status, impersonação contextual (banner "Visualizando como X"), suspend/reativar, CreateUserDialog por workspace
- **CreateUserDialog**: chama `admin-create-user` com JWT session token
- **AuditPanel**: filtros por action + workspace_id, export CSV, scroll area 200 registros

### Frontend — Settings.tsx (novas tabs)

#### APISettingsTab (`src/components/settings/APISettingsTab.tsx`)
- **API Tokens**: CRUD completo — nome, permissões granulares (6 tipos), expiração em dias; token exibido uma única vez após criação; revogar via delete
- **Inbound Webhooks**: CRUD — nome, source_name, field_mapping_json (textarea JSON), URL gerada automaticamente; copiar URL
- **Request Logs**: colapsável, últimas 100 chamadas com endpoint, método, status, token, data

#### PlanSettingsTab (`src/components/settings/PlanSettingsTab.tsx`)
- Card com plano atual + status badge
- Progresso de uso (membros, contatos, flows) vs limites do plano com alerta em ≥ 80%
- Banner de aviso para workspaces suspensos/cancelados
- Limites definidos localmente por plano (trial/starter/growth/business/enterprise)

### LGPD — ContactDetailSheet + use-contacts

- `deleteContact` alterado de hard delete para soft delete (`deleted_at = now()`)
- `contactsQuery` filtra `.is("deleted_at", null)` por padrão
- Botão "Excluir contato" restrito a `admin | superadmin`
- Texto explicativo atualizado: "soft-delete auditável pelo superadmin"

## Critérios de Aceite

- [x] `supabase db push` com migration aplicada
- [x] `supabase functions deploy admin-create-user admin-reset-password` OK
- [x] `npm run build` sem erros TypeScript
- [x] Settings > API tab visível e funcional (tokens + webhooks + logs)
- [x] Settings > Plano tab mostra uso real vs limites
- [x] Soft delete funciona (contato some da lista, `deleted_at` preenchido)
- [x] Admin.tsx carrega métricas globais sem erros

---

## Decisões Técnicas

- Token completo exibido uma única vez (padrão GitHub) — não armazenado em plain text, apenas `token_hash` + `token_prefix`
- Inbound webhook usa edge function separada (`inbound-webhook-create`) para geração segura do `token_hash`; update direto via Supabase para edições
- Impersonação é contextual (frontend-only, sem JWT swap) — superadmin mantém seu JWT, queries passam workspace_id explícito
- Limites de plano definidos como constante no frontend para MVP; migrar para tabela `plans` quando billing for integrado com AppMax
- `api_request_logs_service_insert` policy usa `WITH CHECK (true)` para permitir inserção via service role sem exigir workspace membership

## Arquivos criados/modificados

### Criados
- `supabase/migrations/20260509000002_story016_superadmin_api_billing.sql`
- `supabase/functions/admin-create-user/index.ts`
- `supabase/functions/admin-reset-password/index.ts`
- `src/components/settings/APISettingsTab.tsx`
- `src/components/settings/PlanSettingsTab.tsx`

### Modificados
- `src/pages/Admin.tsx` — reescrito com GlobalMetrics, WorkspacesPanel expandido, CreateUserDialog, AuditPanel
- `src/pages/Settings.tsx` — tabs "API" e "Plano" adicionadas
- `src/hooks/use-contacts.tsx` — soft delete + filtro deleted_at + campo deleted_at no tipo
- `src/components/crm/ContactDetailSheet.tsx` — import useWorkspace, role guard no delete, texto atualizado
- `PROJECT_REQUIREMENTS.md` — seção STORY-016 + edge functions atualizadas
