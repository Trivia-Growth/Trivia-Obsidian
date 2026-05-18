---
id: STORY-019
titulo: "RBAC dinâmico + gestão de perfis e usuários"
fase: 6
modulo: "Admin/RBAC"
status: done
prioridade: alta
agente_responsavel: ""
criado: 2026-05-08
atualizado: 2026-05-08
epic: EPIC-001
---

# STORY-019 — RBAC dinâmico + gestão de perfis e usuários

## Contexto

Implementa o RBAC dinâmico definido em ADR-011: perfis editáveis no painel + função `site.has_permission(resource, action)` substituindo o `has_role` antigo. Inclui telas de gestão (admin-previx adiciona usuários, atribui roles, cria perfil novo).

## Critérios de Aceite

### Backend

- [ ] CA1 — **`site.has_permission(resource text, action text)` implementada**:
  ```sql
  create or replace function site.has_permission(resource text, action text)
  returns boolean language sql stable security definer
  set search_path = public as $$
    with user_roles as (
      select jsonb_array_elements_text(
        coalesce(auth.jwt() -> 'app_metadata' -> 'roles', '[]'::jsonb)
      ) as role_id
    )
    select coalesce(bool_or(
      (rd.permissoes -> resource) ? action
    ), false)
    from user_roles ur
    join site.role_definitions rd on rd.id = ur.role_id;
  $$;
  ```

- [ ] CA2 — **5 perfis seed** populados via migration (`role_definitions`):
  - `admin-previx` (sistema=true, todas permissões)
  - `editor-blog`: `{posts: [create,read,update,publish], assets: [upload,read,delete-own]}`
  - `editor-copy`: `{faq: CRUD, paginas: CRUD, servicos: update, depoimentos: CRUD, numeros: CRUD, diferenciais: CRUD, clientes: CRUD, assets: [upload,read,delete-own]}`
  - `comercial`: `{leads: [read,update]}`
  - `viewer`: `{posts: [read], faq: [read], paginas: [read], servicos: [read], depoimentos: [read], numeros: [read], diferenciais: [read], clientes: [read], assets: [read]}`

- [ ] CA3 — Migrar **`/admin/leads` (STORY-008)** pro novo modelo: policy de leads passa de `has_role('admin-site')` para `has_permission('leads','read')` e `has_permission('leads','update')`. Usuários com role `admin-previx` ou `comercial` mantêm acesso

- [ ] CA4 — Tabela `site.user_invites` (convites pendentes):
  ```sql
  create table site.user_invites (
    id uuid primary key default gen_random_uuid(),
    email text not null,
    roles text[] not null,
    convidado_por uuid references auth.users,
    token text not null unique,
    aceito_em timestamptz,
    expira_em timestamptz default now() + interval '7 days',
    criado_em timestamptz default now()
  );
  ```

- [ ] CA5 — Edge Function `admin-invite-user`:
  - Valida `has_permission('users','create')`
  - Cria registro em user_invites
  - Envia email via Resend com link `/admin/aceitar-convite?token=...`
  - Quando usuário aceita: cria conta Supabase Auth + popula `app_metadata.roles` + marca aceito_em

- [ ] CA6 — Edge Function `admin-update-user-roles`:
  - Valida `has_permission('users','update')`
  - Recebe `{user_id, roles[]}`
  - Atualiza via admin API: `supabase.auth.admin.updateUserById(user_id, { app_metadata: { roles } })`
  - Grava em audit_log

### Frontend — Tela de Perfis

- [ ] CA7 — Rota `/admin/perfis`:
  - Lista cards com 5 perfis seed + perfis customizados criados
  - Cada card mostra: nome, descrição, contagem de usuários atribuídos, badge "sistema" quando `sistema=true`
  - Botão "Novo perfil" (visível com permissão `roles.create`)
  - Click no card → modal de edição

- [ ] CA8 — Modal de edição de perfil:
  - Nome (editable, exceto sistema)
  - Descrição
  - Matriz de permissões — checkboxes agrupados por recurso:
    ```
    Posts:     [✓] Criar  [✓] Ler  [✓] Atualizar  [✓] Publicar  [ ] Deletar
    FAQ:       [ ] Criar  [✓] Ler  [ ] Atualizar  [ ] Deletar
    Páginas:   ...
    Assets:    [✓] Upload [✓] Ler [✓] Deletar próprios [ ] Deletar todos
    Leads:     ...
    SEO:       ...
    Usuários:  [ ] Criar [ ] Ler [ ] Atualizar [ ] Deletar
    Perfis:    [ ] Criar [ ] Ler [ ] Atualizar [ ] Deletar
    Audit:     [ ] Ler
    ```
  - Botão "Excluir perfil" (oculto se sistema=true ou perfil tem usuários)
  - Save → UPDATE em role_definitions + audit_log

- [ ] CA9 — Validação no save: perfis customizados não podem ter `id` igual aos seed (`admin-previx`, `editor-blog`, etc.)

### Frontend — Tela de Usuários

- [ ] CA10 — Rota `/admin/usuarios`:
  - Tabela com: avatar, nome, email, perfis (badges), último login, ações
  - Filtros: perfil, status (ativo/convidado/removido), busca por nome/email
  - Botão "Convidar usuário" (visível com `users.create`)

- [ ] CA11 — Modal "Convidar usuário":
  - Email
  - Multi-select de perfis (lista vinda de role_definitions)
  - Mensagem opcional
  - Submit → chama Edge Function `admin-invite-user`

- [ ] CA12 — Modal "Editar usuário":
  - Multi-select de perfis (atribui/revoga)
  - Botão "Remover usuário" (chama `auth.admin.deleteUser` ou desabilita conta — decidir)
  - Botão "Resetar senha" (envia email Supabase Auth)
  - Save → chama Edge Function `admin-update-user-roles`

- [ ] CA13 — Página `/admin/aceitar-convite?token=...`:
  - Valida token + expiração
  - Form: nome + senha
  - Submit → cria conta + popula roles + redirect `/admin/dashboard`

### Audit log básico

- [ ] CA14 — Rota `/admin/audit-log`:
  - Tabela com últimos 100 eventos: timestamp, user, ação, recurso, link "Ver detalhes"
  - Filtros por user, recurso, ação, data
  - Modal "Ver detalhes" mostra `payload_before` e `payload_after` em diff visual (json-diff)
  - Visível só com `audit.read`

## Pendências externas

- Decisão JG: convites expiram em 7 dias OK?
- Decisão JG: remover usuário = soft (desabilita) ou hard (delete)?
- Decisão JG: lista de recursos no painel de permissões está completa? (revisar quando a STORY-021 entregar — pode ter recursos novos)

---

## Implementação

> Preenchido pelo `@dev` + `@data-engineer`.

**Status:** `backlog`

**Branch/PR:**

**Arquivos esperados:**
- `supabase/migrations/20260508130000_rbac_dinamico_e_invites.sql`
- `supabase/functions/admin-invite-user/index.ts`
- `supabase/functions/admin-update-user-roles/index.ts`
- `src/admin/pages/perfis/PerfisPage.tsx`
- `src/admin/pages/perfis/PerfilEditor.tsx`
- `src/admin/pages/usuarios/UsuariosPage.tsx`
- `src/admin/pages/usuarios/InviteUserDialog.tsx`
- `src/admin/pages/usuarios/EditUserDialog.tsx`
- `src/admin/pages/audit/AuditLogPage.tsx`
- `src/pages/admin/aceitar-convite.astro` (rota Astro public para aceite)
- Atualizar `src/admin/lib/permissions.ts` (helper `usePermission(resource, action)`)
- Migrar `src/features/admin/LeadsPanel.tsx` para usar `usePermission` em vez de check de role direto
- Atualizar `architecture.md` (deprecação de `has_role`)

---

## QA

**Gate:**

**Checklist:**
- [ ] 5 perfis seed criados via migration
- [ ] Login com usuário `editor-blog` mostra só itens permitidos na sidebar
- [ ] Convite via email funciona end-to-end (Resend dispara, link aceita, usuário entra)
- [ ] admin-previx cria perfil novo, atribui usuário, usuário ganha permissões na próxima sessão
- [ ] admin-previx não consegue deletar perfil sistema
- [ ] admin-previx não consegue deletar perfil com usuários atribuídos (precisa reatribuir antes)
- [ ] Audit log captura cada save
- [ ] `/admin/leads` continua funcional com novo modelo
