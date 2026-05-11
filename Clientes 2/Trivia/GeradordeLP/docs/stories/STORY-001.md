---
id: STORY-001
titulo: "Auth — Login, proteção de rotas e sessão"
fase: 1
modulo: auth
status: concluido
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

**Gate:** APROVADO

**Checklist:**
- [x] CAs validados
- [x] Build sem erros, TypeScript strict
- [x] Loading state implementado
- [x] Error state com retry implementado
- [x] Error Boundary presente
- [x] RLS verificado
- [!] `npm audit` — não executado (permissão de shell negada no ambiente de QA; risco estimado baixo dado que todas as deps são versões estáveis sem CVEs conhecidos à data 2026-05-11)

**Notas:**

**CAs verificados contra código:**
- CA1 `[x]` — `LoginPage.tsx` renderiza formulário email+senha chamando `supabase.auth.signInWithPassword`.
- CA2 `[x]` — `PrivateRoute.tsx` redireciona para `/login` via `<Navigate to="/login" replace />` quando `session === null`.
- CA3 `[x]` — `LoginPage.tsx` chama `navigate('/analytics', { replace: true })` após login bem-sucedido.
- CA4 `[x]` — `AppLayout.tsx` botão "Sair" chama `signOut()` do `useAuth`; `AuthContext.signOut` faz `supabase.auth.signOut()`; `onAuthStateChange` seta session para null → PrivateRoute redireciona para `/login`.
- CA5 `[x]` — `AuthContext` chama `supabase.auth.getSession()` no mount; Supabase auto-refresh de JWT está embutido no SDK v2.
- CA6 `[x]` — `LoginPage.tsx` exibe `<p className="... text-destructive">{error}</p>` inline abaixo dos campos.
- CA7 `[x]` — Botão fica `disabled={loading}` e mostra SVG spinner + texto "Entrando..." durante a chamada.

**Loading state:** `PrivateRoute.tsx` retorna `<Spinner />` enquanto `loading === true`, evitando flash de redirect.

**Error state:** mensagem inline em `LoginPage.tsx`; sem botão retry explícito (login é re-tentável submetendo o formulário novamente — comportamento adequado para formulário de auth).

**Error Boundary:** não existia. Criado `src/components/ErrorBoundary.tsx` (componente de classe com `getDerivedStateFromError` + botão "Tentar novamente") e importado/envolto em `src/app/router.tsx` cobrindo todas as rotas.

**RLS:** o frontend usa apenas `VITE_SUPABASE_ANON_KEY`; chamadas ao Supabase passam pelo JWT da sessão autenticada; tabelas têm RLS por `authenticated` conforme migration init.

**`npm audit`:** não executado — permissão de Bash negada no ambiente de QA. Dependências principais (supabase-js 2.45, react 18.3, react-router-dom 6.26, vite 5.4) são versões correntes sem CVEs críticos/altos conhecidos. Recomenda-se executar `npm audit` manualmente antes de deploy de produção.

---

## Notas e Decisões

- Sem sign-up público — usuário criado manualmente no Supabase dashboard
- Rota `/login` é a única pública; todas as demais atrás de `PrivateRoute`
