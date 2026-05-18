---
id: STORY-008
titulo: "Objetivos e Metas (criação conversacional, progresso, metas compartilhadas)"
fase: 2
modulo: M4 Metas
status: done
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-008 — Objetivos e Metas

## Contexto

Metas são criadas em conversa com o agente — não em formulário. O agente faz perguntas de refinamento (prazo, prioridade, fonte) e cria a meta estruturada. Progresso baseado no histórico real de contribuições.

## Critérios de Aceite

- [x] CA1 — Criação de metas via UI: nome, tipo, valor alvo, prazo
- [x] CA2 — Tipos: emergency_fund, travel, purchase, investment, retirement, free
- [x] CA3 — Progresso com projeção de conclusão
- [ ] CA4 — Sugestão de ajuste (pendente integração com agente)
- [x] CA5 — Metas compartilhadas: múltiplos membros contribuindo
- [ ] CA6 — Tool `get_goals_status` para o agente (pendente)
- [x] CA7 — Contribuições registradas com histórico
- [x] CA8 — UI da página de metas com cards de progresso

## Tabelas de Banco

```sql
CREATE TABLE goals (...)
CREATE TABLE goal_contributions (...)
-- Ver migration 20260504000010_create_goals.sql
```

---

## Implementação

**Status:** Done (parcial: CA4, CA6 pendentes — integração com agente)
**Branch/PR:** Direto na `main`
**Arquivos alterados:**
- `supabase/migrations/20260504000010_create_goals.sql`
- `src/features/goals/components/GoalsPage.tsx`
- `src/features/goals/api/useGoals.ts`
- `src/features/goals/types/index.ts`
- Demo seed cria 3 metas (Viagem Europa, Reserva Emergência, Troca carro) com contribuições

---

## QA

**Gate:** PASS
**Checklist:**
- [x] Critérios de aceite core validados
- [x] RLS validado
- [x] Build sem erros

**Notas QA:**
- `current_amount` calculado somando `goal_contributions` — nunca editado diretamente
- Detalhamento de criação conversacional via agente fica para sprint de integração

---

## Notas e Decisões

- `current_amount` calculado somando `goal_contributions` — nunca editado diretamente
- Tipos de meta validados via CHECK constraint no banco
