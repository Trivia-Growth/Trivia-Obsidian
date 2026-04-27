---
id: STORY-003
titulo: "Auth básica + Edge Function admin para atribuir user_role"
fase: 1
modulo: "auth"
status: em-review
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-04-23
atualizado: 2026-04-23
---

# STORY-003 — Auth Básica + Edge Function admin para atribuir user_role

## Contexto

> A STORY-002 entregou o schema com RLS, mas RLS depende de `app_metadata.user_role` no JWT (ADR-008). Sem auth + sem mecanismo de atribuição de papel, nenhuma operação autenticada passa pelas policies — todo SELECT autenticado volta vazio, todo INSERT volta `42501`. **Esta story é o gargalo que destrava STORY-004, 005, 006, 007.**
>
> Entrega 3 coisas:
> 1. Tela de login + recuperação de senha + logout (Supabase Auth direto).
> 2. Hook `useAuth` que expõe user, papel atribuído e helpers de loading.
> 3. Edge Function `assign-user-role` que só `admin` pode chamar para atribuir/promover papel a outro usuário (escreve `app_metadata` via `service_role` — única forma segura, ADR-008).

## Spec de Referência

- [[../../Briefing Inicial]] → seções "Permissões" (admin/editor/visualizador) e "Páginas mínimas" (1. Login)
- `architecture.md` no repo → ADR-008 (`app_metadata.user_role`), ADR-007 (TanStack Router file-based)
- `SECURITY_DEBT.md` → SEC-005 (esta story resolve)
- [[../../../Documentos Trivia 2/Padrão Projetos/03 - Segurança/Edge Functions Seguras|Edge Functions Seguras]]
- [[../../../Documentos Trivia 2/Padrão Projetos/05 - Lovable e Claude/Workflow Diff Plan]]

## Critérios de Aceite

### Frontend — Auth

- [x] **CA1 — Tela de login** em `/login` com:
  - Form `email` + `senha` (Zod validation client-side)
  - Botão "Entrar" → `supabase.auth.signInWithPassword`
  - Link "Esqueci minha senha" → `/recover-password`
  - Estilo: `bg-previx-bg`, card centralizado, fonte Inter, accent `previx.accent`
  - Estado de loading no botão durante submit
  - Estado de erro: mensagem amigável (sem expor detalhes técnicos)

- [x] **CA2 — Tela de recuperação** em `/recover-password`:
  - Form `email` → `supabase.auth.resetPasswordForEmail` com `redirectTo: <URL>/reset-password`
  - Mensagem de sucesso "Verifique seu e-mail" (não revelar se o email existe — anti-enumeration)

- [x] **CA3 — Tela de reset** em `/reset-password`:
  - Captura tokens da URL (Supabase passa via fragment)
  - Form `nova senha` + `confirmação` (Zod min 8, igual)
  - `supabase.auth.updateUser({ password })` → redireciona pra `/dashboard`

- [x] **CA4 — Hook `useAuth`** em `src/hooks/useAuth.ts`:
  - Retorna `{ user, userRole, isLoading, signOut }`
  - Lê `user_role` de `user.app_metadata?.user_role` (string `'admin' | 'editor' | 'visualizador' | null`)
  - Subscribe em `supabase.auth.onAuthStateChange`
  - SSR-safe (TanStack Start renderiza no servidor — usar `useSuspenseQuery` ou contexto)

- [x] **CA5 — Layout protegido** `src/routes/_authenticated.tsx` (TanStack Router file-based layout):
  - `beforeLoad` verifica sessão; sem sessão → `throw redirect({ to: '/login' })`
  - Sub-rotas (`/dashboard`, `/admin/*`) ficam dentro deste layout
  - `Outlet` renderiza filhos

- [x] **CA6 — Header com botão Sair**: componente `UserMenu` no header autenticado mostra nome/avatar + dropdown com "Sair" → `signOut()` → redireciona `/login`.

### Backend — Edge Function admin

- [x] **CA7 — Edge Function `assign-user-role`** em `supabase/functions/assign-user-role/index.ts`:
  - Endpoint POST: `{ userId: uuid, user_role: 'admin' | 'editor' | 'visualizador' | null }`
  - Validação Zod no input
  - Valida JWT do chamador via `auth.getUser()` (token do header Authorization)
  - **Verifica que o chamador é `admin`** (consultando `app_metadata.user_role` do `user` retornado)
  - Se não admin → 403 Forbidden
  - Cria cliente admin com `service_role` e chama `auth.admin.updateUserById(userId, { app_metadata: { user_role } })`
  - Retorna 200 com `{ success: true, userId, user_role }`
  - Trata `ZodError` → 400 com problem+json
  - CORS configurado: `*` em dev, domínio Netlify em prod (variável de ambiente `ALLOWED_ORIGIN`)
  - Deploy via `supabase functions deploy assign-user-role`

- [x] **CA8 — Página admin de usuários** em `/admin/usuarios` (apenas role `admin`):
  - Lista todos os usuários (chamada via Edge Function `list-users` ou via `supabase.auth.admin.listUsers` se acessível — provavelmente outra Edge Function `list-users` precisa ser criada nesta story)
  - Para cada user: nome, email, papel atual, dropdown "Alterar papel"
  - Mudar papel chama `assign-user-role` Edge Function
  - Toast de sucesso/erro
  - Loading + Error states com retry
  - Guard: rota acessível só com `userRole === 'admin'`; senão redireciona pra `/dashboard` com toast de "Acesso negado"

### Bootstrap inicial

- [x] **CA9 — Documentar bootstrap do primeiro admin** em `architecture.md` como nota operacional:
  - Passo 1: criar usuário via Supabase Dashboard → Authentication → Users → Add user (com email/senha do piloto)
  - Passo 2: editar o usuário → "Raw user app metadata" → `{"user_role": "admin"}`
  - Passo 3: a partir daí, esse admin pode promover outros via `/admin/usuarios`

### Testes (CA10-CA12)

- [ ] **CA10 — Login + RLS funcionam end-to-end:** (testar após bootstrap manual do primeiro admin)
  - Criar admin via Dashboard (passo bootstrap)
  - Login no app
  - Fazer SELECT em `departamentos` (criadas na STORY-002) → retorna 6 linhas (RLS aceita admin)
  - Logout → SELECT volta vazio (RLS bloqueia anon)

- [ ] **CA11 — Edge Function nega chamadas de não-admin:** (testar após bootstrap)
  - Logar como `editor` (criar via Dashboard ou via outro admin)
  - Chamar `assign-user-role` via curl → resposta `403 Forbidden`

- [x] **CA12 — Logs e telemetria mínimos:**
  - Edge Function logga via `console.log` o `requestId`, ação, `caller_id`, `target_user_id`, `new_role`. Sem logar segredos.
  - Verificar no Supabase Dashboard → Edge Functions → Logs

### Decisões a documentar (ADRs novos)

- [ ] **ADR-009 — Magic link vs email/senha:** decidido **email/senha** por previsibilidade e familiaridade dos usuários internos. Magic link pode ser feature opcional futura.
- [ ] **ADR-010 — Bootstrap manual do primeiro admin:** documentar que o primeiro `admin` é setado via Supabase Dashboard (nunca self-service). Próximos via Edge Function.

### Doc updates (CA13)

- [x] **CA13 — Documentação atualizada no mesmo PR:**
  - `architecture.md`: ADR-009 + ADR-010 + atualização de "Próximos Passos"
  - `PROJECT_REQUIREMENTS.md`: seção "Papéis" detalhada (já está) + nota sobre Edge Function admin
  - `SECURITY_DEBT.md`: marcar SEC-005 como resolvido
  - `Roadmap.md` no vault: módulo "Autenticação" ✅
  - `specs/technical/API_SPECIFICATION.md` (criar agora) — documentar contrato da Edge Function

---

## Implementação

**Status:** `em-review` (aguardando @qa via PR + bootstrap manual do primeiro admin)

**Branch/PR:** `feat/story-003-auth` → PR a abrir

**Arquivos criados:**
- `src/features/auth/schemas/auth.schema.ts` — Zod schemas (login, recover, reset, assignRole) + `USER_ROLES` const + tipos
- `src/features/auth/api/auth.ts` — wrappers de Supabase auth (signIn, requestPasswordReset, updatePassword, signOut)
- `src/features/auth/components/LoginForm.tsx`
- `src/features/auth/components/RecoverPasswordForm.tsx` (anti-enumeration)
- `src/features/auth/components/ResetPasswordForm.tsx`
- `src/features/auth/components/UserMenu.tsx` (dropdown header)
- `src/features/auth/components/RoleGuard.tsx` (defesa em profundidade UI)
- `src/hooks/useAuth.ts` — subscribe a `onAuthStateChange`, expõe `user`, `userRole`, `isLoading`, `signOut`
- `src/routes/login.tsx`, `recover-password.tsx`, `reset-password.tsx`
- `src/routes/_authenticated.tsx` — layout protegido com `beforeLoad` checando sessão
- `src/routes/_authenticated/dashboard.tsx` — dashboard placeholder
- `src/routes/_authenticated/admin/usuarios.tsx` — admin only (`beforeLoad` checa role) com `useQuery`/`useMutation`
- `supabase/functions/_shared/cors.ts` — `corsHeaders` + `preflight(req)` (suporta `ALLOWED_ORIGIN` env var)
- `supabase/functions/_shared/problem.ts` — RFC 7807 helper (`problemResponse`, `jsonResponse`)
- `supabase/functions/assign-user-role/index.ts` — verifica admin via JWT, valida Zod, escreve `app_metadata.user_role` via `service_role`. Logs com `reqId`.
- `supabase/functions/list-users/index.ts` — verifica admin, retorna `auth.admin.listUsers` mapeado.
- `specs/technical/API_SPECIFICATION.md` — contrato das duas Edge Functions

**Arquivos modificados:**
- `src/routes/index.tsx` — substituído por `beforeLoad` que redireciona pra `/dashboard` ou `/login` conforme sessão
- `src/routeTree.gen.ts` — regenerado pelo TanStack Router plugin (auto)
- `architecture.md` — ADR-009 (email/senha) + ADR-010 (bootstrap manual primeiro admin) + checklist STORY-003 ✅
- `SECURITY_DEBT.md` — SEC-005 movido para "Itens Resolvidos"

**Notas de implementação:**

- **TanStack Router file-based:** layouts protegidos usam underscore prefix (`_authenticated.tsx`). Sub-rotas em `_authenticated/dashboard.tsx`, `_authenticated/admin/usuarios.tsx`. URL final não inclui o segmento com `_`.
- **Auth pattern:** sessão é carregada client-side via `supabase.auth.getSession()` no `beforeLoad`. SPA puro (ver ADR-011) — sem SSR.
- **Anti-enumeration na recovery:** mensagem de sucesso é a mesma se o e-mail existe ou não.
- **Edge Functions deployed e ativas:**
  - `assign-user-role` (ID `939f70e2-e124-4afe-bf00-bc9bb3c57be9`, version 1)
  - `list-users` (ID `c7f29ac6-94e8-4021-a933-31f88ba2ae86`, version 1)
- **Validação:** typecheck OK; build OK; lint 0 errors (7 warnings pré-existentes shadcn); audit 0 critical/high.
- **Migração para SPA puro durante a story (ADR-011):** Lovable refatorou o scaffold de TanStack Start (Cloudflare Workers SSR) para SPA puro com TanStack Router, porque TanStack Start não tem adapter Netlify nativo na v1.167. Removidos `@tanstack/react-start`, `@lovable.dev/vite-tanstack-config`, `@cloudflare/vite-plugin`, `wrangler`. Adicionados `index.html` raiz + `src/main.tsx`. Mergeou clean com nossa branch.
- **Deploy verde em produção:** https://organograma-previx.netlify.app/ retorna HTTP 200 com `index.html` correto. SPA fallback funcionando (rotas `/login`, `/dashboard`, etc. resolvem).
- **CA10/CA11 não validados pelo @dev** porque exigem o passo de bootstrap manual (criar admin via Dashboard) que precisa ser feito pelo piloto. Após bootstrap, esses dois CAs viram testes manuais de QA.

---

## QA

> Preenchido pelo `@qa`.

**Gate:** —

**Checklist:**
- [ ] CA1-CA13 validados
- [ ] Build sem erros, TypeScript strict
- [ ] Edge Functions deployed (`supabase functions list`)
- [ ] Login → RLS funciona; logout → RLS bloqueia
- [ ] Não-admin chamando `assign-user-role` → 403
- [ ] CORS funciona em prod (testar com Netlify URL)
- [ ] `npm audit` sem Critical/High
- [ ] Story-bootstrap: criar admin via Dashboard funcionou; admin consegue criar editor via UI

---

## Notas e Decisões

- `2026-04-23` — Story criada após STORY-002. Identificada como gargalo crítico — bloqueia 4 stories subsequentes.
- `2026-04-23` — Decidido **não usar OAuth (Google/Microsoft)** nesta fase. Email/senha é suficiente pro MVP interno da Previx. OAuth fica como melhoria futura (ADR a definir se virar requirement).
- `2026-04-23` — Edge Function `list-users` será criada nesta story para a página `/admin/usuarios`. Alternativa de chamar `supabase.auth.admin.listUsers` direto do client é inviável (precisa de `service_role`).
