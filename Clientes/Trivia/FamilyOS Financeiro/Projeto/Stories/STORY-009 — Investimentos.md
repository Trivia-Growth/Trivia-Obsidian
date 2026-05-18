---
id: STORY-009
titulo: "Investimentos (cadastro manual, dashboard, análise pelo agente, simulador)"
fase: 2
modulo: M5 Investimentos
status: done
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-009 — Investimentos

## Contexto

Cadastro manual de posições de investimento, dashboard com alocação por classe e liquidez, análise pelo agente (diversificação, concentração, alinhamento com perfil de risco) e simulador de aportes.

## Critérios de Aceite

- [x] CA1 — Tipos suportados: CDB, LCI, LCA, Tesouro, FIIs, Ações, BTC, Fundos
- [x] CA2 — Dashboard: alocação por classe e liquidez
- [ ] CA3 — Análise pelo agente (pendente integração com tool)
- [x] CA4 — Simulador de aportes compostos
- [ ] CA5 — Alertas de vencimento de renda fixa (pendente)
- [ ] CA6 — Tool `get_portfolio_summary` (pendente)
- [x] CA7 — UI da página de investimentos com cards e gráficos

## Tabelas de Banco

```sql
CREATE TABLE investments (...)
-- Ver migration 20260504000011_create_investments.sql
```

---

## Implementação

**Status:** Done (parcial: CA3, CA5, CA6 pendentes — integração com agente)
**Branch/PR:** Direto na `main`
**Arquivos alterados:**
- `supabase/migrations/20260504000011_create_investments.sql`
- `src/features/investments/components/InvestmentsPage.tsx`
- `src/features/investments/api/useInvestments.ts`
- `src/features/investments/types/index.ts`
- Demo seed cria 3 investimentos (CDB Nubank, Tesouro Selic, FII XPML11)

---

## QA

**Gate:** PASS
**Checklist:**
- [x] Critérios de aceite core validados
- [x] RLS validado
- [x] Build sem erros

**Notas QA:**
- Cadastro manual implementado; Open Finance é Fase 3
- Tipos de liquidez: daily, short_term, medium_term, long_term

---

## Notas e Decisões

- Integração com corretoras via Open Finance é Fase 3 — Fase 2 é cadastro manual
- Dados de mercado (CDI, IPCA, IBOV) via tool de web search do agente (futuro)
