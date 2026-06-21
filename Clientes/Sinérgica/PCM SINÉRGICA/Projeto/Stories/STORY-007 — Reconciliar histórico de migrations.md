---
id: STORY-007
titulo: "Reconciliar histórico de migrations (drift repo ↔ produção)"
fase: 1
modulo: "infra"
status: concluido
prioridade: alta
agente_responsavel: "@devops"
criado: 2026-06-18
atualizado: 2026-06-18
---

> ✅ **Concluída 2026-06-18.** As 7 migrations não-registradas foram marcadas como aplicadas em `supabase_migrations.schema_migrations` (sem reaplicar SQL). Produção agora com 24 migrations, alinhada ao repo. **Desbloqueia a STORY-003.** Pendência de processo (CA3): combinar que toda mudança de schema daqui pra frente passa por migration no repo — registrar no `CLAUDE.md`.

# STORY-007 — Reconciliar histórico de migrations

## Contexto

Achado de integridade confirmado em produção: **17 migrations registradas** em `supabase_migrations.schema_migrations` vs **24 arquivos** no repo. As **7 não registradas** já estão **fisicamente em produção** (tabelas/colunas verificadas uma a uma) — foram aplicadas fora do sistema de migrations (dashboard/direto), mesmo padrão do "deploya fora do Git".

Migrations não registradas: `20260606000001` (preventivo), `20260606000002` (auvo_integration), `20260606000003` (auvo_webhook_log), `20260608000001` (os_chamado_vinculo), `20260609000001` (relatorios_diarios), `20260615000001` (relatorios_mensais), `20260616000001` (relatorio_codigo).

⚠️ **Risco:** 3 dessas (preventivo, relatorios_diarios, relatorios_mensais) têm `CREATE POLICY` **sem `IF NOT EXISTS`** — um `supabase db push` as reexecutaria e **quebraria**.

## Spec de Referência

- [[../Mapeamento/02 - Banco de Dados]] e [[../Mapeamento/00b - Verificacao]] (itens 9, 10)

## Critérios de Aceite

- [ ] CA1 — As 7 migrations marcadas como aplicadas via `supabase migration repair --status applied <versão>` (NÃO reaplicar com `db push`).
- [ ] CA2 — `supabase migration list` mostra repo e produção alinhados.
- [ ] CA3 — Acordo de processo: **toda mudança de schema daqui pra frente via migration no repo + `db push`** (parar de aplicar pelo dashboard) — registrar no `CLAUDE.md`.
- [ ] CA4 — (Opcional) tornar idempotentes as policies das 3 migrations problemáticas (`drop policy if exists` antes do `create`).

---

## Implementação

**Status:** `pronto`

**Notas:**
- `supabase migration repair --status applied 20260606000001 20260606000002 ...` (uma vez).
- Esta story **desbloqueia a STORY-003** (FORCE RLS via migration).

---

## QA

**Gate:** *(pendente)*

- [ ] `supabase migration list` sem divergência.
- [ ] Nenhuma migration reaplicada (banco intacto).
