-- Migration 0001 — tabela de comissões (perfil single-repo, schema public).
-- Reverso (rollback manual): DROP TABLE IF EXISTS public.comissoes;
-- Antes de aplicar em produção: backup manual. Aplicar com `supabase db push` (ver db/README.md).

create table if not exists public.comissoes (
  id            uuid primary key default gen_random_uuid(),
  -- chave de negócio: idempotência (uma comissão por venda)
  venda_id      text not null unique,
  comissao_centavos integer not null check (comissao_centavos >= 0),
  criado_em     timestamptz not null default now()
);

-- Índice para a consulta por venda (idempotência e leitura).
create index if not exists comissoes_venda_id_idx on public.comissoes (venda_id);

-- RLS: sem policy = sem acesso. Baseline mínimo exige RLS habilitada em toda tabela.
alter table public.comissoes enable row level security;

-- Leitura: usuários autenticados com papel financeiro/ceo.
create policy "comissoes_select" on public.comissoes
  for select to authenticated
  using (auth.jwt() ->> 'user_role' in ('ceo', 'financeiro', 'analista'));

-- Escrita: apenas financeiro/ceo. (Em produção, normalmente via Edge Function com service_role.)
create policy "comissoes_insert" on public.comissoes
  for insert to authenticated
  with check (auth.jwt() ->> 'user_role' in ('ceo', 'financeiro'));
