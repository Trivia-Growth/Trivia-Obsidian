---
id: STORY-003
titulo: "Auth básica + Edge Function admin para atribuir user_role"
fase: 1
modulo: "auth"
status: pronto
prioridade: alta
agente_responsavel: "@sm"
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

- [ ] **CA1 — Tela de login** em `/login` com:
  - Form `email` + `senha` (Zod validation client-side)
  - Botão "Entrar" → `supabase.auth.signInWithPassword`
  - Link "Esqueci minha senha" → `/recover-password`
  - Estilo: `bg-previx-bg`, card centralizado, fonte Inter, accent `previx.accent`
  - Estado de loading no botão durante submit
  - Estado de erro: mensagem amigável (sem expor detalhes técnicos)

- [ ] **CA2 — Tela de recuperação** em `/recover-password`:
  - Form `email` → `supabase.auth.resetPasswordForEmail` com `redirectTo: <URL>/reset-password`
  - Mensagem de sucesso "Verifique seu e-mail" (não revelar se o email existe — anti-enumeration)

- [ ] **CA3 — Tela de reset** em `/reset-password`:
  - Captura tokens da URL (Supabase passa via fragment)
  - Form `nova senha` + `confirmação` (Zod min 8, igual)
  - `supabase.auth.updateUser({ password })` → redireciona pra `/dashboard`

- [ ] **CA4 — Hook `useAuth`** em `src/hooks/useAuth.ts`:
  - Retorna `{ user, userRole, isLoading, signOut }`
  - Lê `user_role` de `user.app_metadata?.user_role` (string `'admin' | 'editor' | 'visualizador' | null`)
  - Subscribe em `supabase.auth.onAuthStateChange`
  - SSR-safe (TanStack Start renderiza no servidor — usar `useSuspenseQuery` ou contexto)

- [ ] **CA5 — Layout protegido** `src/routes/_authenticated.tsx` (TanStack Router file-based layout):
  - `beforeLoad` verifica sessão; sem sessão → `throw redirect({ to: '/login' })`
  - Sub-rotas (`/dashboard`, `/admin/*`) ficam dentro deste layout
  - `Outlet` renderiza filhos

- [ ] **CA6 — Header com botão Sair**: componente `UserMenu` no header autenticado mostra nome/avatar + dropdown com "Sair" → `signOut()` → redireciona `/login`.

### Backend — Edge Function admin

- [ ] **CA7 — Edge Function `assign-user-role`** em `supabase/functions/assign-user-role/index.ts`:
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

- [ ] **CA8 — Página admin de usuários** em `/admin/usuarios` (apenas role `admin`):
  - Lista todos os usuários (chamada via Edge Function `list-users` ou via `supabase.auth.admin.listUsers` se acessível — provavelmente outra Edge Function `list-users` precisa ser criada nesta story)
  - Para cada user: nome, email, papel atual, dropdown "Alterar papel"
  - Mudar papel chama `assign-user-role` Edge Function
  - Toast de sucesso/erro
  - Loading + Error states com retry
  - Guard: rota acessível só com `userRole === 'admin'`; senão redireciona pra `/dashboard` com toast de "Acesso negado"

### Bootstrap inicial

- [ ] **CA9 — Documentar bootstrap do primeiro admin** em `architecture.md` como nota operacional:
  - Passo 1: criar usuário via Supabase Dashboard → Authentication → Users → Add user (com email/senha do piloto)
  - Passo 2: editar o usuário → "Raw user app metadata" → `{"user_role": "admin"}`
  - Passo 3: a partir daí, esse admin pode promover outros via `/admin/usuarios`

### Testes (CA10-CA12)

- [ ] **CA10 — Login + RLS funcionam end-to-end:**
  - Criar admin via Dashboard (passo bootstrap)
  - Login no app
  - Fazer SELECT em `departamentos` (criadas na STORY-002) → retorna 6 linhas (RLS aceita admin)
  - Logout → SELECT volta vazio (RLS bloqueia anon)

- [ ] **CA11 — Edge Function nega chamadas de não-admin:**
  - Logar como `editor` (criar via Dashboard ou via outro admin)
  - Chamar `assign-user-role` via curl → resposta `403 Forbidden`

- [ ] **CA12 — Logs e telemetria mínimos:**
  - Edge Function logga via `console.log` o `requestId`, ação, `caller_id`, `target_user_id`, `new_role`. Sem logar segredos.
  - Verificar no Supabase Dashboard → Edge Functions → Logs

### Decisões a documentar (ADRs novos)

- [ ] **ADR-009 — Magic link vs email/senha:** decidido **email/senha** por previsibilidade e familiaridade dos usuários internos. Magic link pode ser feature opcional futura.
- [ ] **ADR-010 — Bootstrap manual do primeiro admin:** documentar que o primeiro `admin` é setado via Supabase Dashboard (nunca self-service). Próximos via Edge Function.

### Doc updates (CA13)

- [ ] **CA13 — Documentação atualizada no mesmo PR:**
  - `architecture.md`: ADR-009 + ADR-010 + atualização de "Próximos Passos"
  - `PROJECT_REQUIREMENTS.md`: seção "Papéis" detalhada (já está) + nota sobre Edge Function admin
  - `SECURITY_DEBT.md`: marcar SEC-005 como resolvido
  - `Roadmap.md` no vault: módulo "Autenticação" ✅
  - `specs/technical/API_SPECIFICATION.md` (criar agora) — documentar contrato da Edge Function

---

## Implementação

> Preenchido pelo `@dev` após concluir.

**Status:** —

**Branch/PR:** —

**Arquivos esperados:**
- `src/features/auth/` (api, components, schemas)
- `src/routes/login.tsx`, `recover-password.tsx`, `reset-password.tsx`
- `src/routes/_authenticated.tsx` (layout)
- `src/routes/admin/usuarios.tsx`
- `src/hooks/useAuth.ts`
- `supabase/functions/assign-user-role/index.ts`
- `supabase/functions/list-users/index.ts` (provavelmente necessária)
- `supabase/functions/_shared/cors.ts` (helper CORS)
- `architecture.md`, `SECURITY_DEBT.md`, `specs/technical/API_SPECIFICATION.md`

**Notas de implementação:**

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
