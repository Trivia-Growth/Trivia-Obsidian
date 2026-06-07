---
id: STORY-008
titulo: "Admin — Gestão de Usuários v2"
fase: 1
modulo: "admin"
status: backlog
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-07
atualizado: 2026-06-07
---

# STORY-008 — Admin: Gestão de Usuários v2

## Contexto

A plataforma entra em produção para operação real da Trivia. O módulo de admin atual tem lacunas críticas: não permite criar superadmin, não tem reset de senha e o "deletar" apenas bana o usuário sem remover do banco. Além disso, os dados fictícios do período de desenvolvimento precisam ser removidos para a operação começar limpa.

## Critérios de Aceite

- [ ] CA1 — Dados fictícios removidos: agents, conversations, messages, customers, specialists, knowledge_docs, corrections, token_usage_log, agent_apis, agent_channels, agent_rules. Usuário `admin@triviaagents.com` deletado.
- [ ] CA2 — Superadmin consegue criar outro usuário com role `superadmin` (opção visível no select apenas para superadmins)
- [ ] CA3 — Reset de senha: botão no dropdown → modal com campo "nova senha" → chama Edge Function → atualiza via `auth.admin.updateUserById`
- [ ] CA4 — Deletar usuário: hard delete real — remove do `auth.users` + `public.users` (não mais ban + mudança de role)
- [ ] CA5 — Confirmação antes de deletar com nome/email do usuário

## Diff Plan Aprovado

### Limpeza de dados (banco)
- DELETE em cascata: agents → conversations, messages, customers, specialists, knowledge_docs, rules, apis, channels, corrections, token_usage_log
- DELETE `admin@triviaagents.com` do auth e public.users

### Edge Function `admin-users`
- `PATCH /:id` com `{ action: "reset_password", new_password }` → `auth.admin.updateUserById`
- `DELETE /:id` → hard delete: `auth.admin.deleteUser` + `DELETE FROM public.users`

### Frontend
- `UserFormModal`: passa `callerRole`; superadmin vê opção `superadmin` no select
- `UserTable`: dropdown adiciona "Reset de senha" (abre `ResetPasswordModal`) e troca "Desativar" por "Deletar" (com AlertDialog de confirmação)
- Novo `ResetPasswordModal`: campo nova senha + botão confirmar

---

## Implementação

**Status:** `backlog`

**Branch/PR:** 

**Arquivos alterados:**

**Notas de implementação:**

---

## QA

**Gate:** pendente

**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Build sem erros, TypeScript strict
- [ ] Loading/Error states implementados
- [ ] Hard delete testado (usuário some do auth e da tabela)
- [ ] Reset de senha testado (login com nova senha funciona)
- [ ] Superadmin consegue criar outro superadmin
- [ ] `npm audit` sem Critical/High
