---
id: STORY-022
titulo: "Dashboard & Métricas CRM (recompra, LTV, ticket, funil, cohort)"
fase: 2
modulo: "crm"
status: concluido
prioridade: media
agente_responsavel: "@dev"
criado: 2026-06-15
atualizado: 2026-06-15
---

# STORY-022 — Dashboard & Métricas CRM

## Contexto

> O Flowbiz entregava um painel estratégico de CRM que **não pode se perder** na migração. A nota *Flowbiz — Dashboard e Métricas CRM* especifica as métricas (12 meses reais): taxa de recompra global **25,89%**, tempo médio de recompra **74,55 dias**, ticket médio novo R$153 vs recorrente R$192, receita 69% novos / 31% recorrentes (meta: inverter p/ 50/50). O Sales-Hzm já tem a página **Analytics** + `lib/analytics.ts` (funções puras testadas) — esta story **estende** isso.

## Spec de Referência
- [[Flowbiz — Dashboard e Métricas CRM]] (KPIs, SQL, estrutura de tabs)
- [[Guia — Adaptação Marketing CRM Atendimento]] §6 (métricas obrigatórias)
- depende de [[STORY-015 — Customer cross-channel (estender contacts)|STORY-015]], [[STORY-017 — Integração Tray|STORY-017]], [[STORY-021 — Integração Literarius (parceiros B2B + pedidos)|STORY-021]]

## Critérios de Aceite

- [x] CA1 — RPC `crm_dashboard` sobre `crm_contact_purchases`: taxa de recompra (global + por mês), tempo médio de recompra, ticket por pedido e por cliente, pedidos por cliente, clientes pagantes únicos. ✅ (captação diária de leads → fica com o painel de leads/Analytics overview).
- [x] CA2 — Receita total por período **e por tipo** (novo vs recorrente via `row_number` por cliente; % participação `pct_recorrente`). ✅
- [x] CA3 — **Funil** envio→abertura→clique→pedido influenciado. ✅ **fechado na STORY-023** (tracking de e-mail via pixel/redirect; card de funil + receita influenciada na aba CRM).
- [x] CA4 — **Cohort de LTV** por mês da 1ª compra (receita média acumulada por cliente, M+0..M+5). ✅
- [x] CA5 — Nova aba **"CRM"** no Analytics: KPIs + metas + recompra 12m (linha c/ meta) + receita novo×recorrente (barra empilhada) + tabela cohort. ✅
- [x] CA6 — Lógica pura em `lib/analytics.ts` (`computeCrmGoals`, `computeTicketUplift`, `computeCrmFunnel`) **testada** (6 testes novos). ✅ *Agregados pesados ficam no banco (CA8); o cliente só formata/compara metas.*
- [x] CA7 — Comparação contra metas exibida (recompra → meta 35%; receita recorrente → meta 50%) com barra de progresso e gap em pp. ✅
- [x] CA8 — Performance: agregação **no banco** via RPC (1 ida e volta, sem trazer linhas cruas ao cliente) + índices `(workspace_id, contact_id, purchase_date)` e `(workspace_id, purchase_date)`. ✅

---

## Implementação
> Preenchido pelo `@dev`.

**Status:** `em-review` — painel estratégico de cliente entregue e testado. Falta só o **funil com abertura/clique** (CA3), que depende do tracking de e-mail (STORY-019/023).

**Branch/PR:** commit `491ada7` direto na `main`.

**Arquivos alterados:**
- `supabase/migrations/20260611000008_story022_crm_dashboard.sql` — RPC `crm_dashboard(workspace, meses)` devolve KPIs + série mensal + cohort de LTV num jsonb; `SECURITY INVOKER` (respeita RLS); índices `(ws, contact, purchase_date)` e `(ws, purchase_date)`.
- `src/lib/analytics.ts` — tipos `CrmDashboard`/`CrmKpis`/… + funções puras `computeCrmGoals`, `computeTicketUplift`, `computeCrmFunnel`.
- `src/test/analytics.test.ts` — 6 testes novos.
- `src/pages/Analytics.tsx` — aba **CRM** (query RPC + 8 KPIs + metas + 2 gráficos + tabela cohort).
- `src/integrations/supabase/types.ts` — regenerado.

**Notas de implementação:**
- **Decisão CA6 × CA8:** agregação pesada (recompra, ticket, novo/recorrente, cohort) **no banco** (RPC), porque trazer ~tens of thousands de linhas ao cliente não escala (96k contatos). As funções puras do `lib/analytics.ts` cuidam de **metas/benchmark e formatação** (testáveis). `novo vs recorrente` = `row_number()` por cliente ordenado por data (ord=1 → novo).
- **Cohort de LTV:** safra = mês da 1ª compra; `values[k]` = receita acumulada até M+k ÷ tamanho da safra (LTV médio por cliente). Offset em meses via epoch/2629800.
- **E2E (17/17):** dataset controlado (4 pedidos, 3 clientes) → RPC bateu exato com cálculo manual (receita 650, recompra 33,33%, ticket/pedido 162,5, ticket/cliente 216,67, novo 550 / recorrente 100, tempo médio 30d, cohort/mensal presentes).
- **Visual:** seed de 40 clientes/49 compras em 6 meses → aba renderiza KPIs, metas com barra de progresso, gráfico de recompra com linha de meta 35%, receita novo×recorrente empilhada e tabela cohort de LTV (acumulando M+0≤M+1≤M+2). Zero erro de console.

### Falta (para fechar a story)
- **CA3 funil completo** (abertura→clique) — depende do tracking de e-mail (pixel de abertura + redirect de clique) da STORY-019/023.

---

## QA
> Preenchido pelo `@qa`.

**Gate:**

**Checklist:**
- [ ] KPIs batem com cálculo manual de amostra
- [ ] funções de cálculo cobertas por testes
- [ ] aba CRM renderiza sem erro (E2E visual)
- [ ] queries performáticas em volume

---

## Notas e Decisões
> Reaproveitar `computeKpiMetrics`/`computeCohortData` de `lib/analytics.ts` quando possível. Métricas de **campanha** (abertura/clique) ficam na STORY-019; aqui é o painel **estratégico de cliente**.
