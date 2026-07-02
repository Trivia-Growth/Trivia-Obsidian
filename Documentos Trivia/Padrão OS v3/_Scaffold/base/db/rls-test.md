---
name: db-rls-test
description: Como testar que a RLS realmente protege (Supabase local / pgTAP). Puxe ao criar/alterar policy.
alwaysApply: false
---

# Testar RLS de verdade

> Política de RLS sem teste é esperança, não garantia. RLS é a fronteira de autorização do dado —
> **prove** que um papel sem permissão é bloqueado. Roda no **Supabase local**, fora da CI unitária
> (que não tem banco). Faça quando criar/alterar policy de tabela sensível.

## Setup (uma vez)
```bash
supabase start          # sobe Postgres + Auth locais
supabase db reset       # aplica db/migrations/ do zero
```

## Opção A — teste rápido por papel (psql)
Simula o contexto de um usuário autenticado setando os claims do JWT e o `role`:
```sql
-- Simula um 'analista' (só leitura) tentando inserir → deve FALHAR
set local role authenticated;
set local request.jwt.claims = '{"sub":"u1","user_role":"analista"}';
insert into public.comissoes (venda_id, comissao_centavos) values ('v-test', 100);
-- esperado: ERROR: new row violates row-level security policy

-- Simula 'financeiro' lendo → deve PASSAR
set local request.jwt.claims = '{"sub":"u2","user_role":"financeiro"}';
select count(*) from public.comissoes;
reset role;
```

## Opção B — suíte automatizada (pgTAP)
```sql
-- supabase/tests/comissoes_rls.test.sql
begin;
select plan(2);

set local role authenticated;
set local request.jwt.claims = '{"sub":"u1","user_role":"analista"}';
select throws_ok(
  $$ insert into public.comissoes (venda_id, comissao_centavos) values ('x', 1) $$,
  '42501',  -- insufficient_privilege
  'analista não pode inserir comissão'
);

set local request.jwt.claims = '{"sub":"u2","user_role":"financeiro"}';
select lives_ok(
  $$ select 1 from public.comissoes limit 1 $$,
  'financeiro pode ler comissões'
);

select * from finish();
rollback;
```
```bash
supabase test db   # roda os testes pgTAP em supabase/tests/
```

## ⚠️ Pegadinha: `throws_ok` só serve para INSERT / WITH CHECK
RLS bloqueia de **dois jeitos diferentes**, e o teste erra se não distinguir:
- **INSERT** (e o `WITH CHECK` de UPDATE) → **lança erro** `42501 (insufficient_privilege)`.
  Aqui `throws_ok(..., '42501', ...)` funciona.
- **SELECT / UPDATE / DELETE** filtrados pelo `USING` → **NÃO lançam erro**: simplesmente afetam
  **0 linhas** (a linha fica invisível para o papel). `throws_ok` aqui **falha o teste** esperando
  um erro que nunca vem.

Para SELECT/UPDATE/DELETE, teste por **efeito** (linhas afetadas / valor antes-depois), não por erro:
```sql
-- analista NÃO pode atualizar → o UPDATE não lança, apenas afeta 0 linhas
set local request.jwt.claims = '{"sub":"u1","user_role":"analista"}';
update public.comissoes set comissao_centavos = 999 where venda_id = 'v-existente';
select is(
  (select comissao_centavos from public.comissoes where venda_id = 'v-existente'),
  100,  -- valor ORIGINAL: prova que o update não pegou (0 linhas afetadas, sem erro)
  'analista não altera comissão (RLS filtra silenciosamente, não lança 42501)'
);

-- alternativa: checar a contagem afetada
with upd as (
  update public.comissoes set comissao_centavos = 999 where venda_id = 'v-existente' returning 1
)
select is( (select count(*)::int from upd), 0, 'update por analista afeta 0 linhas' );
```
Regra prática: **INSERT bloqueado → `throws_ok`. UPDATE/SELECT/DELETE bloqueado → `is`/contagem.**

## O que sempre cobrir
- Papel sem permissão **bloqueado** (o caso que mais quebra em produção) — usando o método certo
  por comando (ver pegadinha acima).
- Papel com permissão **liberado** (não trancar demais).
- Multi-tenant: usuário de um tenant **não lê** dado de outro tenant.
- Tabela `audit.*` (perfil OS): UPDATE/DELETE negados inclusive para `service_role`.
- **GRANT existe**: uma tabela com RLS mas sem `GRANT` ao papel nega tudo por privilégio, antes da
  policy — o teste de "papel com permissão liberado" pega isso (falha se o GRANT foi esquecido).
