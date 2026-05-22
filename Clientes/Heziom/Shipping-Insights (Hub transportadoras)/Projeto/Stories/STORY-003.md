---
id: STORY-003
titulo: "Controle de acesso: papéis reais e isolamento de dados (RLS)"
fase: 1
modulo: "Segurança/Acesso"
status: concluido
prioridade: alta
agente_responsavel: "Claude Code"
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-003 — Controle de acesso: papéis reais e isolamento de dados

## Contexto

A auditoria ([[Projeto/Diagnóstico Técnico]]) apontou que o sistema praticamente
não tem controle de acesso: qualquer usuário logado vê e altera tudo, as rotas
admin não checam papel, e o auto-cadastro é aberto.

**Decisão JG (22/05):** o sistema é de uso **interno** da equipe Heziom. Não há
portal externo de fornecedores. Isso simplifica o escopo: o papel `fornecedor`
não é necessário e não há isolamento de dados por fornecedor.

## Modelo de papéis (definido)

- `admin` — configura integrações, usuários e toda a operação.
- `user` — equipe de operação interna: lançamentos, envios, relatórios, alertas
  e o portal de pedidos (vendor) — tudo, exceto as telas de administração.

Mantém-se o enum atual (`admin` / `user`) — sem migração de enum.

## Critérios de Aceite

- [x] CA1 — Rotas `/admin/*` e `/usuarios` protegidas por checagem de admin
  (prop `requireAdmin` em `ProtectedRoute`)
- [x] CA2 — Auto-cadastro fechado: aba "Cadastrar" removida do `Auth.tsx` +
  `disable_signup=true` no Supabase Auth
- [x] CA3 — `FORCE ROW LEVEL SECURITY` nas 15 tabelas; 10 policies de
  usuário/admin movidas de `public` para `authenticated` (fechava acesso anônimo)
- [x] CA4 — Gravação (INSERT/UPDATE) por anônimo fechada (efeito da CA3). No
  modelo interno, gravação por equipe autenticada é aceitável.
- [x] CA5 — *Reavaliada:* não aplicável. `daily_shipping_metrics` e
  `shipping_costs` são dados operacionais da própria equipe (Lançamentos e
  Relatórios). Sem fornecedor externo, não há de quem isolá-los — basta exigir
  autenticação (coberto pela CA3).
- [x] CA6 — Procedimento de bootstrap do primeiro admin documentado (abaixo)

## Bootstrap do primeiro admin

Com o auto-cadastro desativado e o convite exigindo um admin existente, o
**primeiro** admin precisa ser criado manualmente:

1. Supabase Dashboard → Authentication → Users → **Add user** (e-mail + senha).
2. SQL Editor → rodar (trocando pelo UUID do usuário criado):
   ```sql
   INSERT INTO public.user_roles (user_id, role)
   VALUES ('<uuid-do-usuario>', 'admin');
   ```
3. Esse admin faz login e convida os demais pela tela **Usuários**.

## Implementação

**Commit:** `5f6480b` — `feat: controle de acesso e endurecimento de RLS (STORY-003)`

- `ProtectedRoute.tsx` — prop `requireAdmin`; `App.tsx` — 8 rotas admin protegidas.
- `Auth.tsx` — aba de cadastro removida.
- Migration `20260522120000_story003_hardening_rls.sql` — aplicada no banco.
- Supabase Auth — `disable_signup` ativado via Management API.

## QA

**Gate:** `PASS`

- [x] `npm run build` — passou (3,81s)
- [x] FORCE RLS confirmado nas 15 tabelas
- [x] Zero policies de usuário/admin em `{public}` (anônimo bloqueado)
- [x] `disable_signup=true` confirmado no Supabase

## Referência

- [[Projeto/Diagnóstico Técnico]] — seção 1, itens S4, S7, S8, S9, S10
- `SECURITY_DEBT.md` SEC-002

## Notas e Decisões

- `2026-05-22` — Story criada a partir do diagnóstico técnico.
- `2026-05-22` — Escopo simplificado após decisão do JG (uso interno; sem portal
  de fornecedor externo). Concluída — commit `5f6480b`.
