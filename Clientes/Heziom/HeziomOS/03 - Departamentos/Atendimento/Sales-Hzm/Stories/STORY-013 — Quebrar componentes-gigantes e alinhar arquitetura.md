---
id: STORY-013
titulo: "Quebrar componentes-gigantes e alinhar arquitetura"
fase: 3
modulo: "arquitetura"
status: em-progresso
prioridade: baixa
agente_responsavel: "@dev"
criado: 2026-06-09
atualizado: 2026-06-09
---

# STORY-013 — Quebrar componentes-gigantes e alinhar arquitetura

## Contexto

> O `CLAUDE.md` documenta uma arquitetura "Bulletproof React" com `features/` e "componentes < 300 linhas", mas o `src/features/` só tem um README e o código vive em componentes-gigantes: `Analytics.tsx` (1256 linhas, ~48 chamadas Supabase + transformações), `Settings.tsx` (780), `AISettingsTab.tsx` (679). Lógica de negócio e data-fetching concentrados no JSX.

Achados **#22, #23, #66**. Independe de tenancy. Naturalmente vem **depois** da camada de serviço (STORY-010).

## Spec de Referência

- [[Auditoria TRIVIAIOX — Sales-Hzm]] — achados #22, #23, #66
- [[Estrutura de Código]] · [[Componentes React]]

## Critérios de Aceite

- [ ] CA1 — Quebrar os componentes-gigantes em subcomponentes < 300 linhas, extraindo data-fetching para hooks (`use*`) e cálculos para funções puras testáveis.
- [ ] CA2 — `Analytics.tsx`, `Settings.tsx`, `AISettingsTab.tsx` deixam de fazer cálculo de negócio no JSX (movido para hooks/serviços da STORY-010).
- [ ] CA3 — Decidir e registrar: adotar de fato a estrutura `features/` **ou** atualizar a doc para a estrutura real (`components/<domínio>` + `pages`). Sem `features/` morto.
- [ ] CA4 — Nenhum componente novo > 300 linhas (validar no review).

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** `em-progresso` (CA3 feito)

**Branch/PR:** commit `920ab9a`

**Arquivos alterados:**
- `src/features/README.md` (removido), `CLAUDE.md`

**Notas de implementação:**
- ✅ **CA3 (#22/#66):** decisão fixada — adotar a estrutura **real** (`components/` + `pages/`), **não** a `features/` (Bulletproof React). Pasta `src/features/` morta (só README) removida; `CLAUDE.md` atualizado com a decisão + dívida registrada.
- 🚧 **CA1/CA2 (em andamento):** **padrão estabelecido e provado** — extrair lógica pura → testar → ligar (preserva comportamento, risco baixo). Primeira fatia do `Analytics.tsx` feita (`7a6b809`): `computeKpiMetrics`, `groupConversationsByDay`, `groupOpenDealsByStage`, `groupContactsBySource` → `src/lib/analytics.ts` (testado). Analytics 1255→1224.
- ⏳ **Restante (mesmo padrão, incremental):** demais blocos do Analytics (`performanceHistory`, `paceData`, cohort...), `Settings.tsx` (~780), `AISettingsTab.tsx` (~679). Cada bloco = extrair p/ `lib/` ou hook + teste. Pode ser tocado aos poucos sem risco.

---

## QA

> Preenchido pelo `@qa`.

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] Componentes ≤ 300 linhas
- [ ] Sem lógica de negócio no JSX
- [ ] Estrutura de pastas alinhada à doc
- [ ] Build sem erros, TypeScript strict

**Notas:**

---

## Notas e Decisões
