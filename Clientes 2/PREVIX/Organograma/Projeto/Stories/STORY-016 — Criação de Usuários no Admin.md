---
id: STORY-016
titulo: "Criação de usuários pelo admin (sem convite por email)"
fase: 1
modulo: "auth"
status: done
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-05
atualizado: 2026-05-06
---

# STORY-016 — Criação de Usuários no Admin (sem convite por email)

## Contexto

> A STORY-003 entregou login + atribuição de papel via `/admin/usuarios`, mas a página só lista usuários **já existentes** e altera o papel deles. Não há fluxo no app para **criar** um novo usuário — hoje o admin precisa abrir o Supabase Dashboard, criar manualmente em "Authentication → Users → Add user", e só depois conseguir atribuir papel pela UI.
>
> Esta story resolve isso adicionando uma Edge Function `create-user` e um botão "Novo usuário" em `/admin/usuarios`. **Sem convite por email** (decisão JG, 2026-05-05): o admin define a senha inicial diretamente no formulário e a comunica ao usuário pelo canal apropriado (Slack, WhatsApp interno, etc.). Evita dependência de SMTP do Supabase, simplifica fluxo para uso interno da Previx.

## Spec de Referência

- [[STORY-003 — Auth e Edge Function Admin]] → padrão de Edge Function admin (`assign-user-role`, `list-users`)
- `architecture.md` no repo → ADR-008 (`app_metadata.user_role` só via service_role)
- `architecture.md` no repo → ADR-010 (bootstrap manual do primeiro admin — não muda)
- `PROJECT_REQUIREMENTS.md` → seção "Papéis de Usuário"
- [[../../../Documentos Trivia 2/Padrão Projetos/03 - Segurança/Edge Functions Seguras|Edge Functions Seguras]]

## Critérios de Aceite

### Backend — Edge Function `create-user`

- [x] **CA1 — Edge Function `create-user`** em `supabase/functions/create-user/index.ts`:
  - Endpoint POST: `{ email: string, password: string, user_role: 'admin' | 'editor' | 'visualizador', unidade_id?: uuid }`
  - Validação Zod no input:
    - `email` formato válido
    - `password` mínimo 8 caracteres, com 1 maiúscula e 1 número (mesmas regras de `resetPasswordSchema`)
    - `unidade_id` obrigatório quando `user_role='visualizador'` (mesma regra do `assign-user-role`)
    - Valida que `unidade_id` (se fornecido) aponta pra unidade ativa
  - Valida JWT do chamador via `auth.getUser()` — só `admin` passa, senão 403
  - Cria usuário via `supaAdmin.auth.admin.createUser`:
    - `email`, `password`, `email_confirm: true` (já confirma — admin vai passar credencial)
    - `app_metadata: { user_role, unidade_id }` (direto na criação, sem `updateUserById` em segundo passo)
  - Retorna 201 `{ userId, email, user_role, unidade_id }`
  - Trata duplicação de email → 409 com `code: "EMAIL_ALREADY_EXISTS"`
  - Trata `ZodError` → 400 problem+json
  - CORS via `_shared/cors.ts`, padrão RFC 7807 via `_shared/problem.ts`
  - Logs com `reqId`, ação, `caller_id`, `created_user_id`, `user_role` — **nunca logar senha**
  - Deploy via `supabase functions deploy create-user`

### Frontend — Schema e UI

- [x] **CA2 — Schema Zod** em `src/features/auth/schemas/auth.schema.ts`:
  - Novo `createUserSchema` espelhando o backend (email + password + user_role + unidade_id condicional)
  - Tipo `CreateUserInput` exportado
  - Reaproveitar regras de senha de `resetPasswordSchema`

- [x] **CA3 — Dialog de criação** em `/admin/usuarios`:
  - Botão "Novo usuário" no header da página (visível só pra admin, mas a página inteira já é guard de admin)
  - Dialog (shadcn `Dialog`) com form usando `react-hook-form` + `zodResolver`:
    - Campo `email` (input)
    - Campo `password` (input type=password, com toggle de visibilidade)
    - Select `user_role` (admin / editor / visualizador)
    - Select `unidade_id` (renderiza só quando `user_role === 'visualizador'`; popula via query existente de unidades)
    - Botão "Criar" submete; botão "Cancelar" fecha
  - Mutation chama `supabase.functions.invoke("create-user", ...)`
  - Em sucesso: invalida `["admin","users"]`, fecha dialog, toast "Usuário criado: {email}. Comunique a senha pelo canal interno."
  - Em erro 409: toast "Esse e-mail já está cadastrado"
  - Em erro 400: mapear erros Zod nos campos do form
  - Em erro 403/500: toast genérico "Não foi possível criar o usuário"

- [x] **CA4 — UX da senha**:
  - Botão "Gerar senha forte" no form que preenche o campo com 16 chars random (letra/número/especial)
  - Após criação bem-sucedida, mostrar a senha no toast (ou dialog de confirmação) com botão "Copiar" — admin precisa pegar a senha pra entregar ao usuário, já que não vai por email
  - **Importante:** depois que o admin fechar o toast/confirm, a senha some (não fica salva em lugar nenhum no client)

### Bootstrap não muda

- [x] **CA5 — ADR-010 continua válido**: o **primeiro** admin ainda é criado via Supabase Dashboard. A partir do segundo usuário (qualquer papel), pode ser via UI. Documentar isso em comentário no início de `create-user/index.ts`.

### Testes

- [x] **CA6 — Teste manual em produção:**
  - Admin loga em `/admin/usuarios`, cria usuário `editor` via UI, copia a senha
  - Novo usuário consegue logar com email/senha gerados, RLS reconhece como `editor`
  - Tentativa de criar com email duplicado → toast "já cadastrado"
  - Tentativa de criar `visualizador` sem unidade → erro de validação no form
  - Não-admin (editor logado, se houver) tentando chamar a Edge Function direto → 403

- [x] **CA7 — Logs verificados**:
  - Supabase Dashboard → Edge Functions → Logs → `create-user` mostra criações com `reqId` e sem expor senha

### Doc updates

- [x] **CA8 — Documentação atualizada no mesmo PR:**
  - `PROJECT_REQUIREMENTS.md`: módulo "Autenticação e Permissões" — adicionar bullet "Admin cria novos usuários via `/admin/usuarios` definindo senha inicial (sem email de convite)"
  - `architecture.md`: nota operacional sobre criação manual de senha + atualizar lista de Edge Functions
  - `specs/technical/API_SPECIFICATION.md`: contrato da Edge Function `create-user`
  - `Roadmap.md` no vault: marcar STORY-016 ✅

## Decisões já tomadas

- **2026-05-05 — Sem convite por email** (JG): o admin define senha inicial direto no form e comunica ao usuário fora do app. Reduz dependência de SMTP, simplifica fluxo interno.
- **2026-05-05 — `email_confirm: true` na criação:** o usuário criado já vem confirmado, pode logar imediatamente. Não há etapa de "confirme seu email".
- **2026-05-05 — Mostrar senha gerada no toast pós-criação:** necessário porque o admin precisa entregar a credencial. UI mostra com botão "Copiar" e some quando o admin fecha. Nunca persiste no client.

## Fora de Escopo

- Excluir/desativar usuário pela UI → story futura
- Reset de senha pelo admin sem login do usuário → story futura
- Convite por email (alternativa) → eventual ADR se mudar a postura

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** `done` (mergeada PR #48 + hotfix de preflight em 2026-05-06)

**Branch/PR:** `feat/story-016-create-user` → mergeada (commit `57c89e3`)

**Hotfix pós-merge (2026-05-06):**
- Edge Functions retornavam 500 `EDGE_FUNCTION_ERROR` no preflight OPTIONS porque `_shared/cors.ts` criava `new Response("ok", { status: 204 })` — body em 204 viola spec HTTP e o runtime Deno 2 do Supabase (config `deno_version=2`) lança `RangeError`. Trocado pra `new Response(null, { status: 204 })`.
- No mesmo PR de hotfix: `serve()` (import `std@0.168.0/http/server.ts`) → `Deno.serve()` global em 4 functions (`create-user`, `assign-user-role`, `get-organograma-public`, `validate-and-set-manager`), alinhando com a `list-users` que já estava migrada localmente. Redeployadas via `supabase functions deploy`.

**Arquivos a criar:**
- `supabase/functions/create-user/index.ts`

**Arquivos a modificar:**
- `src/features/auth/schemas/auth.schema.ts`
- `src/routes/_authenticated/admin/usuarios.tsx`
- `PROJECT_REQUIREMENTS.md`
- `architecture.md`
- `specs/technical/API_SPECIFICATION.md`
- Vault: `Roadmap.md`

---

## QA

> Preenchido pelo `@qa`.

**Gate:** PASS (após hotfix de preflight em 2026-05-06)

**Checklist:**
- [x] CA1-CA8 validados
- [x] Build sem erros, TypeScript strict (sem `any`)
- [x] Edge Function deployed (`supabase functions list` mostra `create-user`)
- [x] Admin consegue criar editor via UI; editor loga e RLS reconhece papel
- [x] Email duplicado retorna 409 com toast amigável
- [x] Senha não aparece em logs do servidor nem em network logs do client após sucesso
- [x] Não-admin chamando direto → 403
- [x] `npm audit` sem Critical/High

---

## Notas e Decisões

- `2026-05-05` — Story criada após pedido do JG: "precisa configurar a parte de admin, pois não está dando para criar novos usuários".
- `2026-05-05` — Decidido NÃO usar `inviteUserByEmail` (que dependeria de SMTP) — usar `createUser` com password direto.
- `2026-05-05` — STORY-013 não existe como arquivo no vault (foi consumida implicitamente pela feature de unidades). Por isso esta vai como STORY-016, dando sequência a STORY-014 e STORY-015 que já existem.
- `2026-05-06` — Hotfix pós-merge: preflight OPTIONS retornava 500 em todas as Edge Functions que importavam `_shared/cors.ts`. Causa raiz: body em status 204 (`new Response("ok", { status: 204 })`) — o runtime Deno 2 do Supabase rejeita com `RangeError`. Fix em `_shared/cors.ts` (`null` body) + migração de `serve()` legado pra `Deno.serve()` em 4 functions. Validado por curl + UI: OPTIONS retorna 204, lista de usuários carrega, criação funciona.
