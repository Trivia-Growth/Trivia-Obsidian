---
id: STORY-018
titulo: "Superadmin Evoluído — Gestão de Superadmins"
modulo: "Plataforma / Superadmin"
status: "backlog"
fase: 7
prioridade: 2
agente_responsavel: "—"
atualizado: 2026-05-06
---

# STORY-018 — Superadmin: Gestão de Superadmins

## Contexto

Atualmente existe apenas um superadmin hardcoded. Para escalar o suporte e operações internas, precisamos permitir que um superadmin cadastre outros superadmins com controle de acesso granular.

**Nota:** A impersonação de workspace (acessar como um workspace específico) já está escopo da STORY-016. Esta story foca exclusivamente na gestão de quem tem papel `superadmin` na plataforma.

## O que fazer

### Migrations

- [ ] Criar tabela `superadmins` (id, user_id, display_name, email, permissions_json, invited_by, created_at, last_login_at, is_active)
  - `permissions_json`: ex. `{ "manage_workspaces": true, "manage_superadmins": false, "manage_billing": true, "view_audit_log": true }`
  - Superadmin raiz (founder) tem `manage_superadmins: true`
- [ ] RLS: apenas superadmins podem ler `superadmins`; apenas quem tem `manage_superadmins: true` pode inserir/atualizar
- [ ] Função `is_superadmin(user_id)` para uso em outras policies RLS

### Edge Function — manage-superadmins (nova)

- [ ] `GET /manage-superadmins` → lista superadmins com permissões e status
- [ ] `POST /manage-superadmins/invite` → { email, display_name, permissions } — cria usuário Auth + envia convite por e-mail
- [ ] `PATCH /manage-superadmins/{id}` → atualiza permissões ou desativa
- [ ] `DELETE /manage-superadmins/{id}` → desativa (soft delete, nunca exclui o registro)
- [ ] Requer JWT de superadmin com `manage_superadmins: true`
- [ ] Registra toda ação no audit_log

### Frontend — Superadmin: Gestão de Equipe (/admin/team)

- [ ] Lista de superadmins ativos com: nome, e-mail, permissões, último login, status
- [ ] Botão "Convidar Superadmin" → modal com formulário: e-mail, nome, checkboxes de permissões
- [ ] Edição de permissões inline (toggle por permissão)
- [ ] Botão "Desativar" com confirmação (não aparece para o próprio usuário logado)
- [ ] Badge "Você" no row do usuário logado
- [ ] Histórico de ações de cada superadmin (link para audit_log filtrado)

### Segurança

- [ ] Superadmin não pode desativar a si mesmo
- [ ] Superadmin sem `manage_superadmins` vê a lista mas não pode editar
- [ ] Tentativas de acesso sem permissão registradas no audit_log com flag `unauthorized_attempt`
- [ ] E-mail de notificação para todos os superadmins quando novo superadmin é adicionado

## Critérios de Aceite

- [ ] Superadmin com permissão `manage_superadmins` consegue convidar novo superadmin por e-mail
- [ ] Novo superadmin recebe e-mail e consegue acessar /admin após aceitar convite
- [ ] Permissões granulares funcionam: superadmin sem `manage_billing` não vê seção de billing
- [ ] Desativação de superadmin revoga acesso imediatamente (JWT invalidado ou verificação em tempo real)
- [ ] Toda ação registrada no audit_log
- [ ] `npm run build` sem erros, TypeScript strict

## Dependências

- STORY-016 (audit_log, estrutura base do /admin)
- Recomendado implementar após STORY-016
