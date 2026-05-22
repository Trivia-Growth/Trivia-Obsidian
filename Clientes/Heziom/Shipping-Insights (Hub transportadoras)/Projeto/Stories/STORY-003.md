---
id: STORY-003
titulo: "Controle de acesso: papéis reais e isolamento de dados (RLS)"
fase: 1
modulo: "Segurança/Acesso"
status: pronto
prioridade: alta
agente_responsavel: "Claude Code"
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-003 — Controle de acesso: papéis reais e isolamento de dados

## Contexto

A auditoria ([[Projeto/Diagnóstico Técnico]]) apontou que o sistema praticamente
não tem controle de acesso: qualquer usuário logado vê e altera tudo, as rotas
admin não checam papel, e os papéis `operação`/`fornecedor` nem existem no banco.

## Critérios de Aceite

- [ ] CA1 — Modelo de papéis definido e aplicado no enum `app_role` do banco
  (incluir `operacao` e `fornecedor`, ou decisão equivalente documentada)
- [ ] CA2 — Rotas `/admin/*` e `/usuarios` protegidas por checagem de admin
  (componente `RequireAdmin` ou prop em `ProtectedRoute`)
- [ ] CA3 — Rotas `/vendor/*` protegidas por papel `fornecedor`
- [ ] CA4 — RLS revisada: eliminar o padrão `OR user_id IS NULL` que libera todos
  os dados; policies definidas por papel
- [ ] CA5 — `pedidos_vendor` e `pedidos_itens` isoladas por fornecedor (vínculo
  usuário ↔ fornecedor) + `FORCE ROW LEVEL SECURITY`
- [ ] CA6 — Tabelas financeiras (`shipping_costs`, `daily_shipping_metrics`) e
  `alert_followups` restritas a `admin`/`operação`
- [ ] CA7 — Auto-cadastro (`Auth.tsx`) fechado ou condicionado — acesso só por convite
- [ ] CA8 — Procedimento de bootstrap do primeiro admin documentado

## Referência

- [[Projeto/Diagnóstico Técnico]] — seção 1, itens S4, S7, S8, S9, S10
- `SECURITY_DEBT.md` SEC-002

## Notas e Decisões

- `2026-05-22` — Story criada a partir do diagnóstico técnico.
