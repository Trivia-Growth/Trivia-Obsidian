-- 0001_schemas_dominio.sql — Padrão OS (perfil monorepo multi-domínio)
-- Referência de schemas por domínio + RLS FORCE + audit append-only.
-- Adapte os schemas aos bounded contexts do SEU projeto (não copie domínios que não usa).
--
-- Convenções (ver vault: 04 - Arquitetura / Banco de Dados):
--   • schema  = lowercase, underscore para múltiplas palavras (crm, lit_mirror, lgpd)
--   • tabela  = snake_case, SEM prefixo do schema (crm.contacts, nunca crm.crm_contacts)
--   • coluna  = snake_case; PK sempre `id uuid`; FK = `<entidade>_id`
--   • índice  = idx_<tabela>_<coluna(s)>
--   • toda tabela: created_at, created_by, updated_at, updated_by, deleted_at
--   • RLS habilitada SEMPRE; FORCE em OS; audit.* é append-only

-- ───────────────────────── DOMÍNIOS OPERACIONAIS ─────────────────────────
create schema if not exists crm;          -- exemplo de domínio core
create schema if not exists comercial;    -- pipeline, metas

-- ───────────────────────── GOVERNANÇA (imutável) ─────────────────────────
create schema if not exists audit;        -- eventos auditáveis, append-only
create schema if not exists lgpd;         -- consentimentos, export/delete
create schema if not exists config;       -- feature flags, thresholds

-- ───────────────────────── ESPELHOS (read-only p/ app) ────────────────────
-- create schema if not exists lit_mirror;  -- sistema externo (sync escreve, app lê)

-- ============================ Exemplo de tabela ============================
create table if not exists crm.contacts (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  name         text not null,
  email        text,
  -- auditoria padrão
  created_at   timestamptz not null default now(),
  created_by   uuid not null references auth.users,
  updated_at   timestamptz,
  updated_by   uuid references auth.users,
  deleted_at   timestamptz
);

-- Índices SEMPRE nomeados; índice composto para listagem ordenada (evita timeout em volume)
create index if not exists idx_contacts_workspace   on crm.contacts (workspace_id);
create index if not exists idx_contacts_ws_created   on crm.contacts (workspace_id, created_at desc);

-- RLS FORCE: nem o dono da tabela escapa das policies
alter table crm.contacts enable row level security;
alter table crm.contacts force row level security;

create policy "contacts: select do próprio workspace" on crm.contacts
  for select using (
    workspace_id in (select workspace_id from crm.workspace_members where user_id = auth.uid())
  );

create policy "contacts: insert no próprio workspace" on crm.contacts
  for insert with check (
    workspace_id in (select workspace_id from crm.workspace_members where user_id = auth.uid())
    and created_by = auth.uid()
  );

-- ============================ Audit append-only ============================
create table if not exists audit.events (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid,
  action      text not null,
  entity      text not null,
  entity_id   uuid,
  payload     jsonb,
  created_at  timestamptz not null default now()
);

alter table audit.events enable row level security;
alter table audit.events force row level security;

-- Append-only: ninguém atualiza ou apaga, nem service_role.
create policy "audit: deny update" on audit.events for update using (false);
create policy "audit: deny delete" on audit.events for delete using (false);
-- (policies de insert/select por papel ficam a cargo do projeto)
