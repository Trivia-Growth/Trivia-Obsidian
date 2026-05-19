---
id: STORY-007
titulo: "Visual polish — sidebar, cards, dashboard, formulários"
fase: 1
modulo: "ui"
status: concluido
prioridade: média
agente_responsavel: "@dev"
criado: 2026-05-12
atualizado: 2026-05-12
---

# STORY-007 — Visual Polish e Design System

## Contexto

A plataforma estava funcional mas sem refinamento visual. Precisávamos de polish: gradiente no logo, hover states mais responsivos, sombras internas sutis e ícones dos KPIs com mais destaque. Manter o dark theme zinc.

## Spec de Referência

- Plano executado: `/sessions/260511-bright-laurel/plans/v2-finalizacao.md` (Entrega 6)

## Critérios de Aceite

- [x] CA1 — Logo da sidebar com gradiente `violet-600 → violet-500`
- [x] CA2 — Item ativo no nav usa `border-violet-500` (não mais `border-primary` coral)
- [x] CA3 — Cards (agents, customers, specialists) com `hover:border-zinc-700` e sombra interna sutil
- [x] CA4 — StatsCard: ícone com wrapper `bg-{color}-500/20` (aumentado de 10% para 20%)
- [x] CA5 — Dashboard com `gap-8` entre seções (era `gap-6`)
- [x] CA6 — Empty states com ícone `h-12 w-12` (era menor)

---

## Implementação

**Status:** `concluido`

**Branch/PR:** `main` — commit `351f977`

**Arquivos alterados:**
- `src/components/layout/Sidebar.tsx` — gradiente logo, border-violet-500 ativo, hover 50%
- `src/features/agents/components/AgentCard.tsx` — borda 60%, sombra interna, hover border
- `src/features/customers/components/CustomerList.tsx` — sombra interna, hover border nos cards
- `src/features/dashboard/components/StatsCard.tsx` — iconWrapper de 10% para 20% opacity; sombra interna no card
- `src/routes/_app/dashboard.tsx` — gap-8

**Notas de implementação:**
- `shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]` é a sombra interna sutil padrão aplicada em todos os cards
- CSS global (`styles.css`) não foi alterado — mudanças via Tailwind classes apenas
- Botões primários mantidos com `bg-violet-600` explícito (não via CSS variable `primary` que é coral no design system)

---

## QA

**Gate:** `PASS`

**Checklist:**
- [x] Critérios de aceite validados
- [x] Build sem erros
- [x] Sem alteração de variáveis CSS globais
- [x] Consistência visual mantida entre os módulos

**Notas:** Nenhuma regressão visual identificada.
