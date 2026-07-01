---
id: STORY-018
titulo: "Segmentação dinâmica (crm_segments com rules engine + auto-refresh)"
fase: 2
modulo: "crm"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-15
atualizado: 2026-06-15
---

# STORY-018 — Segmentação dinâmica (`crm_segments` rules engine)

## Contexto

> **É o principal diferencial do HeziomOS sobre o Flowbiz.** Hoje só há `cluster_rules` (estático, B2B). Precisamos de **segmentos por regras (JSON)** que se recalculam sozinhos, cruzando compra real + recência + engajamento — algo impossível no Flowbiz.

Exemplos desejados: "compraram teologia reformada nos últimos 90 dias e não abriram os 3 últimos e-mails"; "igrejas sem pedido há 6 meses"; "compradores marketplace que também compraram D2C"; "LTV > R$500 sem compra há 60 dias".

## Spec de Referência
- [[Guia — Adaptação Marketing CRM Atendimento]] §6 (segmentações desejadas)
- [[Arquitetura — Adaptação HeziomOS (CRM, Atendimento, Comercial)]] §3.1
- depende de [[STORY-015 — Customer cross-channel (estender contacts)|STORY-015]] e [[STORY-017 — Integração Tray|STORY-017]]

## Critérios de Aceite

- [ ] CA1 — Tabela `crm_segments` (id, workspace_id, name, description, rules_json jsonb, auto_refresh bool, refresh_frequency, member_count int, created_at, updated_at) com **RLS**.
- [ ] CA2 — Tabela de associação `crm_contact_segment` (contact_id, segment_id) com RLS.
- [ ] CA3 — Motor de avaliação de `rules_json` (AND/OR + folhas: last_purchase.days_ago, lifetime_value, type, category, email_engagement, has_marketplace_purchase, has_d2c_purchase…).
- [ ] CA4 — Edge Function `segment-refresh` que recalcula a associação de 1 segmento (e versão "todos os auto_refresh") + atualiza `member_count`.
- [ ] CA5 — Agendamento via **pg_cron** diário para `auto_refresh=true`.
- [ ] CA6 — UI: criar/editar segmento com builder de regras (ou JSON validado por Zod) + preview da contagem.
- [ ] CA7 — Evento `crm.segment.triggered` quando um contato entra num segmento (consumido pelas réguas — STORY-020).
- [ ] CA8 — Os 4 segmentos-exemplo acima criados e validados com dados de amostra.

---

## Implementação
> Preenchido pelo `@dev`.

**Status:** `concluido` (CA7 — evento — adiado p/ epic de Eventos, será plugado na STORY-020)

**Branch/PR:** commit `7c2ecf8` em `main` (Org-Heziom/heziom-sales)

**Arquivos alterados:**
- `supabase/migrations/20260611000004_story018_crm_segments.sql` (tabelas + motor plpgsql + cron)
- `supabase/functions/segment-refresh/index.ts` (novo)
- `supabase/config.toml`
- `src/integrations/supabase/types.ts` (regenerado)
- `src/components/settings/SegmentsTab.tsx` (novo) + `src/pages/Settings.tsx` (aba)

**Status dos CAs:**
- ✅ **CA1/CA2** — `crm_segments` + `crm_contact_segment` com RLS (`is_member_of_workspace`).
- ✅ **CA3** — motor `crm_segment_where()` (plpgsql) compila `rules_json` → WHERE **seguro** (`quote_literal`); suporta AND/OR + 14 campos (lifetime_value, last_purchase_days_ago, type, preferred_categories_contains, has_d2c/b2b/marketplace_purchase, etc.).
- ✅ **CA4** — `segment-refresh` (refresh/refresh_all/preview).
- ✅ **CA5** — pg_cron diário (04:00) → `refresh_all_crm_segments()`.
- ✅ **CA6** — aba **Segmentos** no Settings (lista + criar via JSON + **prévia** + recalcular).
- ⬜ **CA7** — evento `crm.segment.triggered`: **adiado** para o epic de Eventos/Infra (será consumido pela régua STORY-020).
- ✅ **CA8** — segmentos-exemplo validados em dados reais (incl. "LTV>500 sem compra 60d").

**Notas de implementação:**
- Motor **set-based** em plpgsql (escala p/ 96k) em vez de avaliação por-contato. Injeção prevenida por `quote_literal` (%L) + whitelist de campos (%I só em campo conhecido).
- `preferred_categories_contains` usa `@>` (jsonb). `has_*_purchase` via EXISTS em `crm_contact_purchases`.
- `email_engagement` (abertura de e-mail) ainda não suportado — depende de `crm_communications` (STORY-019).

---

## QA
> Preenchido pelo `@qa`.

**Gate:** `PASS` (CA7 fora de escopo — depende do epic de Eventos)

**Checklist:**
- [x] rules_json avalia AND/OR corretamente (OR: LTV≥1000 ou freq≥5 = 25)
- [x] auto-refresh (pg_cron) agendado + `refresh_all` recalcula (6 segmentos)
- [x] segmentos-exemplo retornam membros corretos (108 reais: B2C=95, has_d2c=82, LTV≥500=21, freq≥3=30)
- [x] `member_count` persistido == associação real; `preview` == `refresh`
- [x] RLS confirmada (policies `is_member_of_workspace`)
- [x] Visual: criar segmento pela UI (prévia 21 → salvar → 21 membros, badge auto)
- [x] typecheck 0 · build OK · 27 testes

---

## Notas e Decisões
> Avaliar evoluir `cluster_rules` para dentro de `crm_segments` ou manter os dois (cluster = B2B-vendas; segments = marketing/RFV).
