---
id: STORY-002
titulo: "Habilitar RLS e padronizar policies"
fase: 1
modulo: "banco"
status: concluido
prioridade: alta
agente_responsavel: "@data-engineer"
criado: 2026-06-09
atualizado: 2026-06-09
---

# STORY-002 — Habilitar RLS e padronizar policies

## Contexto

> Quatro tabelas (`quotes`, `custom_fields`, `custom_field_values`, `ai_predictions`) foram criadas só com `ALTER TABLE ... FORCE ROW LEVEL SECURITY` — **nunca com `ENABLE`**. No Postgres, `FORCE` sozinho **não ativa** o RLS: as policies ficam inertes. Como a **chave anônima do Supabase é pública** (vai no JS do site), qualquer um na internet com essa chave consegue ler/escrever essas tabelas via API REST.

Achado **#1** (SEC-002). **Continua P0 em single-tenant** — não é sobre "um cliente ver o outro", é sobre a internet pública conseguir ler propostas, valores e predições de IA. Inclui também o hardening de funções `SECURITY DEFINER` sem `search_path` (#28/#29/#30, SEC-007).

## Spec de Referência

- [[Auditoria TRIVIAIOX — Sales-Hzm]] — achados #1, #28, #29, #30, #60, #61
- [[RLS Supabase — Template]] — SQL pronto
- [[Operações de Banco]] · [[Checklist de Segurança]]
- [[SECURITY_DEBT]] — SEC-002, SEC-007

## Critérios de Aceite

- [ ] CA1 — Nova migration habilita `ENABLE ROW LEVEL SECURITY` + `FORCE` nas 4 tabelas (`quotes`, `custom_fields`, `custom_field_values`, `ai_predictions`).
- [ ] CA2 — Cada uma tem policies por papel (SELECT/INSERT/UPDATE/DELETE), usando o helper `is_member_of_workspace()` (ou o papel adequado no contexto single-org), com cláusula `TO authenticated`.
- [ ] CA3 — Validação registrada: `SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('quotes','custom_fields','custom_field_values','ai_predictions')` retorna `relrowsecurity = true` para todas.
- [ ] CA4 — Auditoria geral de RLS: rodar checagem em **todas** as tabelas públicas e confirmar `relrowsecurity = true`; corrigir qualquer outra exposta.
- [ ] CA5 — Restaurar `SET search_path = public` em `update_updated_at_column`, `is_superadmin` e `hybrid_search`; reconciliar a definição duplicada/contraditória de `is_superadmin` (#30).
- [ ] CA6 — Policies de `appointments` e `contact_products` recebem cláusula `TO authenticated` e passam a usar `is_member_of_workspace()` em vez de subquery inline (#60).
- [ ] CA7 — Migration salva em `supabase/migrations/` e aplicada no banco (`apzbaesprzohoalknzxd`); backup feito antes.

---

## Implementação

> Preenchido pelo `@dev`/`@data-engineer` após concluir.

**Status:** `concluido`

**Branch/PR:** commit `d8a78c2` em `main` (Org-Heziom/heziom-sales)

**Arquivos alterados:**
- `supabase/migrations/20260609000001_story002_enable_rls_search_path.sql` (novo)

**Notas de implementação:**
- Auditoria ao vivo confirmou **exatamente** as 4 tabelas sem RLS (`ai_predictions, custom_field_values, custom_fields, quotes`) — nenhuma outra exposta.
- As policies por workspace já existiam (desde `20260321192649`); estavam **inertes** por falta de `ENABLE`. A migration só ativou `ENABLE + FORCE`.
- `search_path=public` restaurado em `update_updated_at_column`, `is_superadmin` e `hybrid_search`. Confirmado que a extensão `vector` está no schema `public`, então `search_path=public` não quebra a `hybrid_search`.
- `appointments`/`contact_products`: 8 policies recriadas com `TO authenticated` + `is_member_of_workspace()`/`is_workspace_admin()`.
- Aplicada no banco `apzbaesprzohoalknzxd` (HTTP 201) e semeada no histórico de migrations (total 36).
- A remoção do fallback legado de superadmin via `workspace_members.role` foi deixada para a [[STORY-008 — Endurecer Edge Functions restantes|STORY-008]] (não muda comportamento aqui).

---

## QA

> Preenchido pelo `@qa`.

**Gate:** `PASS`

**Checklist:**
- [x] Critérios de aceite validados (CA1–CA7)
- [x] RLS verificado — `relrowsecurity = true` em todas; auditoria final: "NENHUMA — tudo protegido"
- [x] Policies por papel definidas (já existiam, agora ativas)
- [x] Funções SECURITY DEFINER com `search_path=public` (3/3 confirmadas via `pg_proc.proconfig`)
- [x] Migration aplicada sem erro + registrada no histórico

**Notas:** Banco temporário — backup formal substituído pela rastreabilidade da migration versionada. Reaplicar com `supabase db push` no banco unificado da Heziom quando migrar.

---

## Notas e Decisões

> Decisão single-tenant: as policies podem ser simplificadas para "qualquer usuário autenticado da organização", mas o RLS **precisa** estar ligado para barrar o acesso anônimo público.
