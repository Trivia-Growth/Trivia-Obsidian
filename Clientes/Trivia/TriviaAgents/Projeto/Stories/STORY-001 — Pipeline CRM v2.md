---
id: STORY-001
titulo: "Pipeline CRM v2 — colunas configuráveis, badge robô/humano, regras automáticas e CRM de clientes"
fase: 1
modulo: "pipeline, customers"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-11
atualizado: 2026-05-12
---

# STORY-001 — Pipeline CRM v2

## Contexto

O pipeline existente era estático e sem informação sobre o tipo de atendimento. Precisávamos de colunas configuráveis, visibilidade sobre robô vs humano e uma base de clientes integrada ao pipeline.

## Spec de Referência

- Plano executado: `/sessions/260511-bright-laurel/plans/pipeline-crm-v2.md`

## Critérios de Aceite

- [x] CA1 — Colunas kanban configuráveis (criar, renomear, reordenar, excluir)
- [x] CA2 — Badge visual robô/humano em cada card do pipeline
- [x] CA3 — Regras automáticas de movimentação de colunas por status ou palavra-chave
- [x] CA4 — Base de clientes com CRUD (nome, telefone, email, empresa, notas)
- [x] CA5 — Vincular cliente a uma conversa via pipeline card

---

## Implementação

**Status:** `concluido`

**Branch/PR:** `main` — commit `854abc3`

**Arquivos alterados:**
- `src/features/pipeline/api/usePipelineColumns.ts` (novo)
- `src/features/pipeline/api/usePipelineRules.ts` (novo)
- `src/features/pipeline/components/PipelineBoard.tsx` (atualizado)
- `src/features/pipeline/components/PipelineCard.tsx` (atualizado — badge)
- `src/features/pipeline/components/PipelineRulesEditor.tsx` (novo)
- `src/features/pipeline/components/AttendanceBadge.tsx` (novo)
- `src/features/customers/` (módulo completo novo)
- `src/routes/_app/customers.tsx` (novo)
- `supabase/migrations/` (migration de pipeline_columns, pipeline_rules, customers)

**Notas de implementação:**
- Badge usa campo `assumed_by` para distinguir robô (null) de humano (preenchido)
- Colunas ordenadas por `sort_order`, drag-and-drop via @dnd-kit
- Regras automáticas rodam no frontend ao carregar o pipeline (não Edge Function)

---

## QA

**Gate:** `PASS`

**Checklist:**
- [x] Critérios de aceite validados
- [x] Build sem erros, TypeScript strict
- [x] Loading state implementado
- [x] RLS verificado — tabelas pipeline_columns, pipeline_rules, customers
- [x] Migration aplicada via `supabase db push`

**Notas:** Build limpo. Sem erros TypeScript.
