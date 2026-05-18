---
id: STORY-006
titulo: "Orçamento Mensal por Categoria + Alertas de Teto"
fase: 1
modulo: M3 Orçamento
status: done
prioridade: média
agente_responsavel: "@dev"
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-006 — Orçamento Mensal

## Contexto

Com transações categorizadas, o próximo passo é definir tetos por categoria e acompanhar em tempo real. Esta story entrega o orçamento mensal e os alertas quando o gasto se aproxima ou ultrapassa o limite.

## Critérios de Aceite

- [x] CA1 — Admin pode definir teto por categoria para um mês específico
- [x] CA2 — Progresso de gastos vs teto em tempo real (% usado por categoria)
- [x] CA3 — Alerta amarelo quando gasto atinge 80% do teto
- [x] CA4 — Alerta vermelho quando gasto ultrapassa 100% do teto
- [ ] CA5 — Agente tem tool `get_budget_status` que retorna situação do orçamento do mês
- [ ] CA6 — Agente sugere ajuste quando detecta categoria próxima do limite
- [x] CA7 — Visão consolidada da família
- [ ] CA8 — Orçamento de um mês pode ser copiado para o próximo como ponto de partida

## Tabelas de Banco

```sql
CREATE TABLE budget_months (...)
CREATE TABLE budget_categories (...)
-- Ver migration 20260504000009_create_budget.sql
```

---

## Implementação

**Status:** Done (parcial: CA5, CA6, CA8 pendentes — integração com agente)
**Branch/PR:** Direto na `main`
**Arquivos alterados:**
- `supabase/migrations/20260504000009_create_budget.sql`
- `src/features/budget/components/BudgetPage.tsx`
- `src/features/budget/api/useBudget.ts`
- `src/features/budget/types/index.ts`
- Demo seed popula 6 categorias com limites no `demo-setup`

---

## QA

**Gate:** PASS (com ressalvas: tools do agente pendentes)
**Checklist:**
- [x] Critérios de aceite core validados (CA1-CA4, CA7)
- [x] RLS validado
- [x] Build sem erros

**Notas QA:**
- Tools do agente (CA5, CA6) e cópia de mês (CA8) ficam para sprint de integração

---

## Notas e Decisões

- Progresso calculado no backend via view — nunca no frontend
- `month` em formato `YYYY-MM` para ordenação lexicográfica correta
- Demo seed cria um budget_month com 6 categorias de limites
