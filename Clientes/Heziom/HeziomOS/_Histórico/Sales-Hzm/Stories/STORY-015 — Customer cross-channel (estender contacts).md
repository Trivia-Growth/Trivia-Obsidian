---
id: STORY-015
titulo: "Customer cross-channel — estender contacts + histórico de compras"
fase: 2
modulo: "crm"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-15
atualizado: 2026-06-15
---

# STORY-015 — Customer cross-channel (estender `contacts` + histórico de compras)

## Contexto

> Fundação do CRM Unificado (Fase 2.2). A entidade central do HeziomOS é o **Customer** cross-channel, deduplicado por **CPF/CNPJ**, consolidando Tray (D2C), Literarius (B2B) e marketplaces. O Sales-Hzm já tem `contacts` (27 colunas), mas com semântica **B2B-vendas** — falta a camada de cliente/compra.

**Decisão:** **estender** a tabela `contacts` (não criar `crm_contacts` paralelo), pois `deals`, `conversations` e `activities` já têm FK para `contacts`. Ver [[Arquitetura — Adaptação HeziomOS (CRM, Atendimento, Comercial)]].

## Spec de Referência
- [[Arquitetura — Adaptação HeziomOS (CRM, Atendimento, Comercial)]] §3.1
- [[Guia — Adaptação Marketing CRM Atendimento]] §6 (Entidade Customer)
- [[Flowbiz — Dashboard e Métricas CRM]] (campos comportamentais a importar)

## Critérios de Aceite

- [ ] CA1 — Migration adiciona a `contacts` (todas **nullable**, zero breakage): `cpf_cnpj` (text, UNIQUE parcial por workspace), `type` (text: B2C/B2B/igreja), `source_channel` (text), `lifetime_value` (numeric), `last_purchase_date` (timestamptz), `purchase_frequency` (int), `average_order_value` (numeric), `preferred_categories` (jsonb), `data_nascimento` (date), `genero` (text), `is_high_value` (bool), `is_delinquent` (bool).
- [ ] CA2 — Índices em `cpf_cnpj`, `last_purchase_date`, `type`.
- [ ] CA3 — Nova tabela `crm_contact_purchases` (id, contact_id FK, source 'tray'|'literarius', source_order_id, purchase_date, total_value, category, product_ids text[], created_at) com **RLS habilitada** (ENABLE + policy por workspace via contact).
- [ ] CA4 — `types.ts` regenerado; build + typecheck **0 erros**.
- [ ] CA5 — Função/trigger que recalcula `lifetime_value`, `purchase_frequency`, `average_order_value`, `last_purchase_date` a partir de `crm_contact_purchases` (pode ser SQL function chamada no insert ou job).
- [ ] CA6 — UI: aba de contato exibe os novos campos (somente leitura por enquanto) sem quebrar o layout atual.
- [ ] CA7 — RLS verificada por `has_table_privilege`/policy; banco zerado segue íntegro.
- [ ] CA8 — **LGPD/decisão de semântica:** (a) decidir se os campos editoriais de RFV **reaproveitam** `segment`/`subsegment`/`cluster`/`lead_tier` (hoje usados pelo `lead-scorer`/`cluster_rules`, semântica B2B) ou se ganham campos novos — documentar a escolha; (b) `cpf_cnpj` tratado como dado sensível (acesso por RLS, fora de logs); (c) usar o `deleted_at`/`deletion_scheduled_at` já existentes como base para retenção/direito ao esquecimento.

---

## Implementação
> Preenchido pelo `@dev`.

**Status:** `concluido`

**Branch/PR:** commit `9111fb8` em `main` (Org-Heziom/heziom-sales)

**Arquivos alterados:**
- `supabase/migrations/20260611000001_story015_customer_crosschannel.sql` (novo)
- `src/integrations/supabase/types.ts` (regenerado)
- `src/hooks/use-contacts.tsx` (interface `Contact` estendida)
- `src/components/crm/ContactDetailSheet.tsx` (seção "Cliente (CRM)")

**Notas de implementação:**
- **CA1/CA2:** +12 colunas nullable em `contacts`; índice único `(workspace_id, cpf_cnpj) WHERE cpf_cnpj IS NOT NULL` (permite múltiplos NULL); índices em `last_purchase_date` e `type`.
- **CA3:** `crm_contact_purchases` com `workspace_id` direto (padrão `contact_products`) → RLS por `is_member_of_workspace`/`is_workspace_admin`; dedup idempotente por `(workspace_id, source, source_order_id)`.
- **CA5:** `recompute_contact_purchase_stats()` + trigger AFTER INSERT/UPDATE/DELETE (SECURITY DEFINER + `search_path=public`).
- **CA8:** decisão de **campos aditivos** — não sobrescreve `segment`/`subsegment`/`cluster`/`lead_tier` (semântica B2B usada por `lead-scorer`/`cluster_rules`); `cpf_cnpj` protegido por RLS; retenção via `deleted_at` existente.

---

## QA
> Preenchido pelo `@qa`.

**Gate:** `PASS`

**Checklist:**
- [x] CA1–CA8 validados
- [x] Migration aplicada (HTTP 201) + `types.ts` regenerado (`crm_contact_purchases` presente)
- [x] typecheck **0** · build OK · **27 testes** verdes
- [x] RLS confirmada (`relrowsecurity=true`, **4 policies**, trigger ativo)
- [x] E2E do trigger: recálculo (LTV 600,50 / freq 3 / ticket 200,17 / última 2026-06-10), dedup idempotente, recálculo após delete
- [x] Visual: seção "Cliente (CRM)" no `ContactDetailSheet` (CPF, LTV R$ 448,90, ticket, compras, última, categorias) sem quebrar layout
- [x] Banco zerado restaurado (0 orgs / 0 purchases)

---

## Notas e Decisões
> Estender `contacts` evita duplicar o modelo. `segment`/`subsegment`/`cluster`/`lead_tier`/`health_score` já existem (B2B) e podem ser reaproveitados/repropostos para o editorial.
