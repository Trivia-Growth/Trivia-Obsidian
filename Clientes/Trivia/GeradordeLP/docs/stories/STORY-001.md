---
id: STORY-001
titulo: "Auth — Login, proteção de rotas e sessão"
fase: 1
modulo: auth
status: em-review
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-11
atualizado: 2026-05-11
---

# STORY-001 — Auth — Login, proteção de rotas e sessão

## Contexto

O scaffold do projeto tem todas as rotas públicas. O campo `decided_by` em `approvals` usa `auth.uid()` e a RLS de todas as tabelas exige `authenticated`. Sem auth, o pipeline é inoperável em produção.

Acesso exclusivo ao piloto — sem sign-up público.

## Spec de Referência

- `architecture.md` — Rotas: `/login` pública, demais protegidas
- `supabase/migrations/20260506000000_init.sql` — RLS por `authenticated`
- `src/lib/supabase.ts` — cliente Supabase configurado

## Critérios de Aceite

- [x] CA1 — Rota `/login` renderiza formulário email + senha via Supabase Auth
- [x] CA2 — Rotas protegidas redirecionam para `/login` se não autenticado
- [x] CA3 — Login bem-sucedido redireciona para `/analytics`
- [x] CA4 — Logout no AppLayout destrói sessão e redireciona para `/login`
- [x] CA5 — Sessão persiste ao recarregar (Supabase auto-refresh)
- [x] CA6 — Erros de auth exibidos inline no formulário
- [x] CA7 — Loading state durante chamada (botão desabilitado + spinner)

---

## Implementação

**Status:** `concluido`

**Branch/PR:** main

**Arquivos alterados:**
- `src/features/auth/AuthContext.tsx` — Context + Provider + useAuth hook
- `src/features/auth/LoginPage.tsx` — Formulário de login
- `src/components/auth/PrivateRoute.tsx` — Guard de rota
- `src/app/router.tsx` — Rota `/login` pública + PrivateRoute wrapping demais rotas
- `src/app/provider.tsx` — AuthProvider adicionado
- `src/components/layout/AppLayout.tsx` — Botão Sair com signOut
- `tsconfig.app.json` — tipos vite/client adicionados
- `package.json` — tailwindcss-animate instalado

**Notas de implementação:**
- AuthContext usa `onAuthStateChange` para reatividade em tempo real
- PrivateRoute mostra spinner enquanto sessão carrega (evita flash de redirect)
- Build TypeScript strict passando sem erros

---

## QA

**Gate:**

**Checklist:**
- [ ] CAs validados
- [ ] Build sem erros, TypeScript strict
- [ ] Loading state implementado
- [ ] Error state com retry implementado
- [ ] Error Boundary presente
- [ ] RLS verificado
- [ ] `npm audit` sem Critical/High

**Notas:**

---

## Notas e Decisões

- Sem sign-up público — usuário criado manualmente no Supabase dashboard
- Rota `/login` é a única pública; todas as demais atrás de `PrivateRoute`
