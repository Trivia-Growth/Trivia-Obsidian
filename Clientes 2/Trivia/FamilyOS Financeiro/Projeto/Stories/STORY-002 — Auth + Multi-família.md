---
id: STORY-002
titulo: "Auth + Multi-família (magic link, criação de família, RLS por family_id)"
fase: 1
modulo: M11 Segurança
status: done
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-002 — Auth + Multi-família

## Contexto

O FamilyOS é multi-família: cada família é um universo isolado. Esta story cria a estrutura de auth (magic link, sem senha) e garante que o isolamento por `family_id` via RLS esteja funcionando antes de qualquer dado financeiro entrar no sistema.

## Spec de Referência

- [[00 - Índice]] — papéis de usuário (`admin` e `viewer`)
- Repositório: `PROJECT_REQUIREMENTS.md` — Módulo M11

## Critérios de Aceite

- [x] CA1 — Login via magic link (Supabase Auth): usuário recebe email, clica no link, está autenticado
- [x] CA2 — Primeiro acesso: Edge Function `family-setup` cria família e define como `admin`
- [x] CA3 — Admin pode convidar membro por email; convidado entra como `viewer`
- [x] CA4 — Admin pode promover `viewer` para `admin`
- [x] CA5 — RLS com `FORCE ROW LEVEL SECURITY` nas tabelas `families` e `family_members`
- [x] CA6 — Teste de isolamento: usuário de família A não vê dados de família B (RLS valida `user_id = auth.uid()`)
- [x] CA7 — Rota protegida: usuário não autenticado é redirecionado para `/login`
- [x] CA8 — Logout funcionando e limpando sessão
- [x] CA9 — Usuário sem família vai para `/onboarding`
- [x] CA10 — Login demo "Família Trívia" com dados populados (Edge Function `demo-setup`)
- [x] CA11 — AuthCallback page processa token do magic link

## Schema de Banco

```sql
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'viewer')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(family_id, user_id)
);

ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE families FORCE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members FORCE ROW LEVEL SECURITY;
```

---

## Implementação

**Status:** Done
**Branch/PR:** Direto na `main`
**Arquivos alterados:**
- `supabase/migrations/20260504000001_create_families.sql`
- `supabase/migrations/20260504000002_create_family_members.sql`
- `supabase/migrations/20260504000003_create_family_invites.sql`
- `supabase/migrations/20260504000004_families_rls_policies.sql`
- `supabase/migrations/20260504000015_fix_family_members_rls_recursion.sql`
- `supabase/functions/family-setup/index.ts`
- `supabase/functions/invite-member/index.ts`
- `supabase/functions/demo-setup/index.ts`
- `supabase/config.toml` (verify_jwt = false para demo-setup)
- `src/features/family/hooks/useAuth.ts`
- `src/features/family/hooks/useFamily.ts`
- `src/features/family/components/LoginPage.tsx`
- `src/features/family/components/OnboardingPage.tsx`
- `src/features/family/components/AuthCallbackPage.tsx`
- `src/features/family/components/AuthGuard.tsx`
- `src/features/family/components/FamilySettingsPage.tsx`

---

## QA

**Gate:** PASS
**Checklist:**
- [x] Critérios de aceite validados
- [x] Build sem erros, TypeScript strict
- [x] RLS verificado — fix de recursão infinita aplicado (migration 000015)
- [x] `npm audit` sem Critical/High

**Notas QA:**
- Policy RLS original causava recursão infinita (subquery na própria tabela) → corrigida para `user_id = auth.uid()`
- Demo login usa `verify_jwt = false` no config.toml para endpoint público
- Rate limit do magic link tratado com cooldown de 30s no frontend

---

## Notas e Decisões

- `family_id` nunca vem do frontend — sempre derivado do JWT no backend
- Magic link é a única forma de auth (sem senha, sem OAuth por ora)
- Login demo usa `signInWithPassword` com usuário pré-criado via `auth.admin.createUser`
- AuthGuard aguarda `isFetching` para evitar redirect prematuro após login
