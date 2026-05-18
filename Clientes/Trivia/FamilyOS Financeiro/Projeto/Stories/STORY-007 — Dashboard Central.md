---
id: STORY-007
titulo: "Dashboard Central (cards, gráfico de fluxo, feed do agente)"
fase: 1
modulo: M9 Dashboard
status: done
prioridade: média
agente_responsavel: "@dev"
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-007 — Dashboard Central

## Contexto

Visão consolidada para quando o usuário quiser ver os números sem conversar. O dashboard complementa o agente — não o substitui. Deve ser rápido, claro e ter atalho permanente para o chat.

## Critérios de Aceite

- [x] CA1 — Card: saldo líquido do mês (entradas − saídas)
- [x] CA2 — Card: total de gastos do mês atual vs mês anterior
- [x] CA3 — Card: progresso do orçamento geral (% do total gasto vs total planejado)
- [x] CA4 — Gráfico de fluxo: Recharts AreaChart dos últimos 6 meses (entradas vs saídas)
- [x] CA5 — Feed do agente: últimos insights ou alertas gerados
- [x] CA6 — Atalho fixo e visível para abrir o chat com o agente (botão "Fin")
- [x] CA7 — Loading skeleton em todos os cards enquanto dados carregam
- [x] CA8 — Error state com retry
- [x] CA9 — Dados do dashboard buscados via TanStack Query com cache de 2 minutos
- [x] CA10 — Responsivo: mobile-first (max-w-lg, design editorial Trívia)

---

## Implementação

**Status:** Done
**Branch/PR:** Direto na `main`
**Arquivos alterados:**
- `src/features/dashboard/components/DashboardPage.tsx` (homepage com gráficos)
- `src/features/dashboard/components/DashboardDataPage.tsx` (visão geral detalhada)
- `src/features/dashboard/api/useDashboard.ts`
- `src/features/dashboard/types/index.ts`
- `package.json` — adicionado `recharts`

---

## QA

**Gate:** PASS
**Checklist:**
- [x] Critérios de aceite validados
- [x] Loading skeleton presente em todos os cards
- [x] Error state com retry testado
- [x] Mobile-first (testado viewport 375px)
- [x] Design tokens Trívia aplicados (Instrument Serif, Inter Tight, petrol/coral/paper)

**Notas QA:**
- Gráfico usa Recharts AreaChart com gradientes
- Barra de progresso de orçamento substitui BarChart por simplicidade
- Header sticky com backdrop-blur

---

## Notas e Decisões

- Dashboard é leitura pura — nenhuma escrita acontece nesta feature
- Cálculos financeiros feitos no backend via Edge Function `dashboard-data`
- Design system: Instrument Serif (display), Inter Tight (body), JetBrains Mono (labels)
- Paleta: petrol #071925, coral #FC544C, paper #FAFAF7
