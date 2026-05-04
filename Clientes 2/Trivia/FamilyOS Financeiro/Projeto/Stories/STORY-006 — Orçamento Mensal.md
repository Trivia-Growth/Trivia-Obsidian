---
id: STORY-006
titulo: "Orçamento Mensal por Categoria + Alertas de Teto"
fase: 1
modulo: M3 Orçamento
status: backlog
prioridade: média
agente_responsavel: ""
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-006 — Orçamento Mensal

## Contexto

Com transações categorizadas, o próximo passo é definir tetos por categoria e acompanhar em tempo real. Esta story entrega o orçamento mensal e os alertas quando o gasto se aproxima ou ultrapassa o limite.

## Spec de Referência

- [[00 - Índice]] — Módulo M3
- Repositório: `PROJECT_REQUIREMENTS.md` — Módulo M3
- Repositório: `specs/technical/BUSINESS_LOGIC.md` — Regras de orçamento

## Critérios de Aceite

- [ ] CA1 — Admin pode definir teto por categoria para um mês específico
- [ ] CA2 — Progresso de gastos vs teto em tempo real (% usado por categoria)
- [ ] CA3 — Alerta amarelo quando gasto atinge 80% do teto
- [ ] CA4 — Alerta vermelho quando gasto ultrapassa 100% do teto
- [ ] CA5 — Agente tem tool `get_budget_status` que retorna situação do orçamento do mês
- [ ] CA6 — Agente sugere ajuste quando detecta categoria próxima do limite
- [ ] CA7 — Visão consolidada da família + visão individual por membro
- [ ] CA8 — Orçamento de um mês pode ser copiado para o próximo como ponto de partida

## Tabelas de Banco

```sql
CREATE TABLE budget_months (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  month TEXT NOT NULL,  -- formato: 2026-05
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(family_id, month)
);

CREATE TABLE budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_month_id UUID NOT NULL REFERENCES budget_months(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id),
  limit_amount NUMERIC(12,2) NOT NULL,
  UNIQUE(budget_month_id, category_id)
);
```

---

## Implementação

> ⚠️ Preenchido pelo `@dev` após concluir.

**Status:**
**Branch/PR:**
**Arquivos alterados:**
-

---

## QA

> ⚠️ Preenchido pelo `@qa`.

**Gate:**
**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Alertas de 80% e 100% testados
- [ ] Tool do agente retorna dados corretos
- [ ] RLS validado

**Notas QA:**

---

## Notas e Decisões

- Progresso calculado no backend (Edge Function ou view) — nunca no frontend
- `month` em formato `YYYY-MM` para ordenação lexicográfica correta
