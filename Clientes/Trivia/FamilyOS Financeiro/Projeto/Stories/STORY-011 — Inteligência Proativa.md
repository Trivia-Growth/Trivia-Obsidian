---
id: STORY-011
titulo: "Inteligência Proativa (detecção de padrões, revisão mensal, score de decisão)"
fase: 2
modulo: M10 Proativo
status: done
prioridade: média
agente_responsavel: "@dev"
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-011 — Inteligência Proativa

## Contexto

O que diferencia o FamilyOS de um chatbot genérico: o agente age antes de ser chamado. Detecta padrões de gasto anômalos, conduz revisão mensal guiada, e avalia impacto de compras grandes antes de acontecerem.

## Critérios de Aceite

- [x] CA1 — UI Score de Saúde Financeira com gauge visual colorido (verde/amarelo/vermelho)
- [x] CA2 — Dimensões do score: renda vs despesa, aderência ao orçamento, progresso de metas, diversificação, disciplina
- [x] CA3 — Lista de anomalias detectadas (gastos fora do padrão)
- [x] CA4 — Score de Decisão: formulário para avaliar impacto de compra grande
- [x] CA5 — Análise IA: agente avalia a decisão e retorna parecer estruturado
- [x] CA6 — Loading states e empty states
- [x] CA7 — Página `/inteligencia` com rota protegida e NavCard no dashboard
- [ ] CA8 — pg_cron para análise semanal automática (pendente)
- [ ] CA9 — Revisão Mensal Guiada automatizada (pendente)

## Tabelas de Banco

```sql
CREATE TABLE proactive_alerts (...)
CREATE TABLE health_scores (...)
-- Ver migration 20260504000013_create_proactive.sql
```

---

## Implementação

**Status:** Done (parcial: CA8 e CA9 pendentes — dependem de pg_cron)
**Branch/PR:** Direto na `main`
**Arquivos alterados:**
- `supabase/migrations/20260504000013_create_proactive.sql`
- `supabase/functions/health-score/index.ts`
- `supabase/functions/score-decision/index.ts`
- `src/features/proactive/components/ProactivePage.tsx`
- `src/features/proactive/components/__tests__/ProactivePage.test.tsx`
- `src/features/proactive/api/useProactive.ts`
- `src/features/proactive/types/index.ts`

---

## QA

**Gate:** PASS
**Checklist:**
- [x] Critérios de aceite core validados (CA1-CA7)
- [x] 9 testes unitários passando
- [x] RLS validado
- [x] Build sem erros, TypeScript strict

**Notas QA:**
- pg_cron para automação semanal/mensal é item separado (infraestrutura Supabase Pro)
- ScoreGauge com cores dinâmicas por range
- Score de Decisão integrado com agente via Edge Function

---

## Notas e Decisões

- Proatividade "calibrada" — usuário configura quais alertas quer receber
- pg_cron requer Supabase Pro plan — item de infraestrutura separado
