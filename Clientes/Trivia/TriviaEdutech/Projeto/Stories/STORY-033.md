# STORY-033 — Corrigir UNIQUE de user_roles para incluir tenant_id

**Módulo:** Banco / Multi-tenancy  
**Sprint:** Banco  
**Prioridade:** P1  
**Status:** concluido  
**Estimativa:** 2h  
**Origem:** Mapeamento do Sistema (2026-06-17) — Registro de Riscos

---

> **Concluído em 2026-06-17** (commit `6c9d814`). Migration `supabase/migrations/20260617223000_user_roles_unique_tenant.sql` (idempotente). Aplicada em produção via **Supabase Management API** (não `db push` — sem senha do banco) e verificada:
> - CA-01 ✅ `user_roles_user_id_role_key` removida.
> - CA-02 ✅ criada `user_roles_user_role_tenant_key` → `UNIQUE (user_id, role, tenant_id)` (confirmado via `pg_constraint`).
> - CA-03 ✅ 9 linhas preservadas (sem DELETE/TRUNCATE).
> - CA-04 ✅ testado: tripla duplicada → `duplicate key ... user_roles_user_role_tenant_key`; mesmo `(user, role)` em tenant diferente → aceito (rollback, count seguiu 9).
> - CA-05 ✅ `npx tsc --noEmit` exit 0 (sem mudança em `types.ts`).
> - CA-06 ✅ RLS/policies intactas (migration só mexe na constraint UNIQUE).

## Contexto

A tabela `user_roles` foi criada na migração inicial com a constraint `UNIQUE(user_id, role)`, **sem** `tenant_id`:

`supabase/migrations/20260207221329_416134f5-571d-493a-9929-227db59fe95e.sql` (linhas 24-30):

```sql
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'student',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
```

Como essa constraint é inline e sem nome explícito, o Postgres a nomeou automaticamente como `user_roles_user_id_role_key`.

Depois, a migração de multi-tenancy `supabase/migrations/20260208154034_94cfbf32-149e-4c02-acbb-a8d9dcc51113.sql` adicionou a coluna `tenant_id` (linha 26), fez backfill para o tenant padrão `00000000-0000-0000-0000-000000000001` (linha 34), tornou-a `NOT NULL` (linha 42) e criou índice (`idx_user_roles_tenant`, linha 50). Porém **a constraint UNIQUE original nunca foi alterada** — uma busca por `DROP`/`ADD CONSTRAINT` de `user_roles` em `supabase/migrations/` não retorna nada. O tipo gerado confirma o estado atual da coluna em `src/integrations/supabase/types.ts` (linhas 2023-2054): `tenant_id: string` existe na `Row`/`Insert`/`Update`, mas não há reflexo de UNIQUE composto.

**Impacto (quebra do modelo multi-tenant):** com `UNIQUE(user_id, role)`, um mesmo `user_id` só pode ter um registro de cada `role` em **toda a plataforma**, independentemente do tenant. Isso impede que o mesmo usuário seja, por exemplo, `admin` em um tenant e `student`/`instructor`/`admin` em outro — o `INSERT` na segunda organização viola a constraint. A função `has_tenant_role(_tenant_id, _user_id, _role)` (mesma migração, linhas 99-113) já filtra por `tenant_id`, ou seja, a lógica de autorização **já assume** papéis por tenant, mas o banco não permite gravá-los. O cadastro automático de novos usuários também é afetado: o trigger `handle_new_user` (linhas 117-143) insere `INSERT INTO public.user_roles (user_id, role, tenant_id) VALUES (NEW.id, 'student', _tenant_id)` — se o mesmo usuário (mesmo `auth.users.id`) entrar em um segundo tenant como `student`, o insert falha pela constraint global.

A correção é trocar a constraint para `UNIQUE(user_id, role, tenant_id)` via nova migração, preservando os dados existentes (a troca é não destrutiva: a constraint atual é um subconjunto mais restritivo da nova).

## Acceptance Criteria

- [ ] CA-01: A nova migração remove a constraint `user_roles_user_id_role_key` (UNIQUE antigo `(user_id, role)`) de forma idempotente (`DROP CONSTRAINT IF EXISTS`).
- [ ] CA-02: A nova migração cria a constraint `UNIQUE(user_id, role, tenant_id)` em `public.user_roles` (nome explícito, ex.: `user_roles_user_role_tenant_key`).
- [ ] CA-03: Nenhum dado existente em `user_roles` é perdido ou alterado; a migração não faz `DELETE`/`TRUNCATE` e roda mesmo com dados presentes (a nova constraint é compatível com o estado atual, já que o antigo `(user_id, role)` é mais restritivo).
- [ ] CA-04: Após a migração, é possível inserir o mesmo `(user_id, role)` em `tenant_id` diferentes; e ainda é bloqueado o `(user_id, role, tenant_id)` duplicado.
- [ ] CA-05: `supabase db push` aplica a migração sem erros; `npx tsc --noEmit` continua passando (sem mudanças necessárias em `types.ts`, mas regenerar é permitido).
- [ ] CA-06: RLS e demais policies de `user_roles` permanecem inalteradas (esta story só toca a constraint UNIQUE).

## Escopo

**IN:**
- Nova migração SQL em `supabase/migrations/` que faz `DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key` e `ADD CONSTRAINT ... UNIQUE (user_id, role, tenant_id)`.
- Verificação de paridade do tipo gerado (`src/integrations/supabase/types.ts`) — regenerar apenas se necessário.

**OUT:**
- Alterações em RLS/policies de `user_roles` (mantidas como em `20260208154034`).
- Mudanças nas funções `has_role`, `has_tenant_role`, `get_user_tenant_id` ou no trigger `handle_new_user`.
- Mudanças de UI/frontend (AuthContext, gestão de usuários, etc.).
- Backfill ou migração de dados (não há dados a transformar).

## Passos de Implementação

1. Confirmar o nome real da constraint no banco linkado antes de dropar: `select conname from pg_constraint where conrelid = 'public.user_roles'::regclass and contype = 'u';` (esperado `user_roles_user_id_role_key`). Usar `DROP ... IF EXISTS` para ser idempotente caso o nome difira.
2. Criar a migração `supabase/migrations/<timestamp>_user_roles_unique_tenant.sql` (timestamp posterior à última, `20260613220000_lesson_transcription.sql`) com:
   ```sql
   ALTER TABLE public.user_roles
     DROP CONSTRAINT IF EXISTS user_roles_user_id_role_key;

   ALTER TABLE public.user_roles
     ADD CONSTRAINT user_roles_user_role_tenant_key UNIQUE (user_id, role, tenant_id);
   ```
3. (Opcional, recomendado) Garantir índice de apoio à nova chave — já existe `idx_user_roles_user_id` (por `user_id`) e `idx_user_roles_tenant` (por `tenant_id`); a própria UNIQUE cria índice composto, então não criar índice redundante.
4. Aplicar localmente/no projeto: `supabase db push` (ver `CLAUDE.md` → Deploy). Validar com `supabase db diff` (deve ficar limpo após o push).
5. Validar manualmente os cenários do CA-04 via SQL no banco linkado (inserir mesmo `(user_id, role)` em dois `tenant_id` distintos; tentar duplicar a tripla e confirmar a violação).
6. Rodar `npx tsc --noEmit`; se optar por regenerar tipos, atualizar `src/integrations/supabase/types.ts` e commitar junto.

## Arquivos Afetados (File List)

- [ ] `supabase/migrations/<timestamp>_user_roles_unique_tenant.sql` (novo)
- [ ] `src/integrations/supabase/types.ts` (apenas se regenerar tipos)

## Testes

- [ ] `supabase db push` aplica a migração sem erro em banco com dados existentes.
- [ ] SQL: inserir `(user_id=X, role='admin', tenant_id=A)` e `(user_id=X, role='admin', tenant_id=B)` — ambos devem ser aceitos.
- [ ] SQL: inserir `(user_id=X, role='admin', tenant_id=A)` duas vezes — a segunda deve falhar com violação de unique (`user_roles_user_role_tenant_key`).
- [ ] `supabase db diff` limpo após push (constraint refletida no schema).
- [ ] `npx tsc --noEmit` sem erros.

## Rastreabilidade

- Mapeamento: `Projeto/Mapeamento do Sistema.md` (Registro de Riscos) — risco P1 banco/multi-tenancy.
- Migração de origem do defeito: `supabase/migrations/20260207221329_416134f5-571d-493a-9929-227db59fe95e.sql` (criação de `user_roles` com `UNIQUE(user_id, role)`).
- Migração que introduziu `tenant_id` sem ajustar a UNIQUE: `supabase/migrations/20260208154034_94cfbf32-149e-4c02-acbb-a8d9dcc51113.sql` (define também `has_tenant_role` e `handle_new_user`).
