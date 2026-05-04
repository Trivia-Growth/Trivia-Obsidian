---
id: STORY-002
titulo: "Auth + Multi-família (magic link, criação de família, RLS por family_id)"
fase: 1
modulo: M11 Segurança
status: backlog
prioridade: alta
agente_responsavel: ""
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

- [ ] CA1 — Login via magic link (Supabase Auth): usuário recebe email, clica no link, está autenticado
- [ ] CA2 — Primeiro acesso: agente cria uma família automaticamente e define o usuário como `admin`
- [ ] CA3 — Admin pode convidar membro por email; convidado entra como `viewer`
- [ ] CA4 — Admin pode promover `viewer` para `admin`
- [ ] CA5 — RLS com `FORCE ROW LEVEL SECURITY` nas tabelas `families` e `family_members`
- [ ] CA6 — Teste de isolamento: usuário de família A não vê dados de família B
- [ ] CA7 — Rota protegida: usuário não autenticado é redirecionado para `/login`
- [ ] CA8 — Logout funcionando e limpando sessão
- [ ] CA9 — Usuário sem família vai para `/onboarding` (placeholder da STORY-003)

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

> ⚠️ Preenchido pelo `@dev` após concluir.

**Status:**
**Branch/PR:**
**Arquivos alterados:**
-

---

## QA

> ⚠️ Preenchido pelo `@qa`.

**Gate:**
**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Build sem erros, TypeScript strict
- [ ] RLS verificado com 2 usuários em famílias diferentes
- [ ] `npm audit` sem Critical/High

**Notas QA:**

---

## Notas e Decisões

- `family_id` nunca vem do frontend — sempre derivado do JWT no backend
- Magic link é a única forma de auth (sem senha, sem OAuth por ora)
