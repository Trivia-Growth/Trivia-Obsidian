---
id: STORY-003
titulo: "FORCE ROW LEVEL SECURITY e revisão de policies"
fase: 1
modulo: "banco"
status: concluido
prioridade: alta
agente_responsavel: "@dev / @security"
criado: 2026-06-18
atualizado: 2026-06-18
---

> ✅ **Concluída 2026-06-18.** FORCE RLS aplicado nas 41 tabelas pcm_*/laudos_* (migration 20260618000001). Seguro (dono postgres tem BYPASSRLS). CA3 (revisão de policies permissivas) e tabelas-fantasma seguem na STORY-009.

# STORY-003 — FORCE ROW LEVEL SECURITY e revisão de policies

## Contexto

Achado **SEC-002 (P1)**, confirmado em produção: **63 de 63 tabelas têm RLS habilitada, 0 com `FORCE`**. Sem `FORCE`, o owner da tabela ignora as policies — e como as Edge Functions usam `service_role` (que já bypassa RLS), o `FORCE` é a barreira que garante que qualquer outro acesso respeite as policies. O padrão Trívia exige `FORCE` em toda tabela.

Adicionalmente, há policies permissivas a revisar (ex.: `deals` permite `authenticated`; tabelas-fantasma do CRM/Nina — ver SEC-011).

## Spec de Referência

- `SECURITY_DEBT.md` → SEC-002, SEC-011
- [[../Mapeamento/02 - Banco de Dados]] e [[../Mapeamento/06 - Seguranca e Infra]]

## Critérios de Aceite

- [ ] CA1 — `ALTER TABLE ... FORCE ROW LEVEL SECURITY` aplicado em todas as tabelas `pcm_*` e `laudos_*` em uso (via migration nova).
- [ ] CA2 — Validar que o app e o Zé continuam funcionando após o FORCE (Edge Functions usam service_role e seguem ok; usuários autenticados respeitam policies).
- [ ] CA3 — Policies por papel revisadas; nenhuma tabela PCM com policy mais aberta que o necessário.
- [ ] CA4 — Migration criada via arquivo no repo e aplicada com `supabase db push` (atenção ao drift — ver STORY-007 antes).

---

## Implementação

**Status:** `pronto`

**Notas:**
- ⚠️ **Depende da STORY-007** (reconciliar migrations) — não rodar `db push` antes de alinhar o histórico, senão as 7 migrations não-registradas reexecutam.
- Gerar a lista de tabelas em uso via SQL e montar a migration de FORCE.
- As tabelas-fantasma (CRM/Nina) podem ser tratadas na STORY-009 (faxina) — aqui o foco é proteger as tabelas em uso.

---

## QA

**Gate:** *(pendente)*

- [ ] App web carrega e opera normalmente (login, clientes, OS, backlog).
- [ ] Agente Zé recebe e responde (service_role não é afetado pelo FORCE).
- [ ] Nenhuma policy permite acesso indevido entre clientes.
