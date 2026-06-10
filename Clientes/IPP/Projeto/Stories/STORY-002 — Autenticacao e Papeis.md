---
id: STORY-002
titulo: "Autenticação (usuário/senha) e Papéis"
fase: 1
modulo: auth
status: em-review
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-10
atualizado: 2026-06-10
---

# STORY-002 — Autenticação (usuário/senha) e Papéis

## Contexto

Todo acesso é autenticado. Login por **usuário/e-mail + senha** (Supabase Auth). Cada usuário tem um papel (`lider`, `financeiro`, `admin`) que rege o que ele vê e faz. Base de segurança de todo o sistema.

## Spec de Referência

- [[Arquitetura e Fluxos]] (seção Segurança)
- [[Documentos Trivia/Padrão Projetos/03 - Segurança/Checklist de Segurança|Checklist de Segurança]]

## Critérios de Aceite

- [x] Login com usuário/e-mail + senha (Supabase Auth) + logout
- [x] Recuperação de senha por e-mail (request + redefinir)
- [x] Tabela `usuarios_perfil` (1-1 com `auth.users`): nome, papel
- [x] Papel disponível para o frontend (perfil) e backend (função `meu_papel()` p/ Edge Functions)
- [x] Rotas protegidas por autenticação; redireciona não-logado para login
- [x] RLS + FORCE em `usuarios_perfil`; usuário só lê o próprio perfil (admin/financeiro leem todos)
- [x] Telas com loading/erro; mensagens genéricas (sem enumeração de e-mail)

## Implementação

**Commit:** `023c2d4` · **Migration:** `supabase/migrations/20260610120000_usuarios_perfil.sql` (aplicada no projeto `kqijwarjfzwltrqzjkfa`).

- Banco: `usuarios_perfil` + RLS+FORCE; trigger `handle_new_user` cria o perfil no signup; trigger `protege_papel` impede que usuário final não-admin altere o próprio papel (backend/admin podem).
- Frontend: `features/auth` (AuthProvider, useAuth, api, login/forgot/reset) + `components/protected-route` + dashboard placeholder com papel e logout.

## Segurança 🔒 — verificação

Self-check do [[Documentos Trivia/Padrão Projetos/03 - Segurança/Checklist de Segurança|checklist]] feito com testes reais no Supabase:
- [x] RLS+FORCE confirmado; anon lê `[]`; usuário lê só o próprio perfil
- [x] Escalonamento de papel bloqueado (`Apenas admin pode alterar o papel`)
- [x] Mensagens genéricas no login e no "esqueci senha" (sem enumeração)
- [x] Nenhum segredo no client (só URL + anon key)
- [ ] **Pendente (config Supabase, não código):** confirmar rate-limit/brute-force no Auth e política de senha forte no painel do Supabase. *(item de @security)*

> Login end-to-end testado pela UI (preview): login → dashboard com papel → logout. Usuário de teste criado e removido (nome neutro).

## Dependências

STORY-001. Habilita 003, 005, 006, 008.
