---
id: STORY-013
titulo: "Quebrar componentes-gigantes e alinhar arquitetura"
fase: 3
modulo: "arquitetura"
status: backlog
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

**Status:** `em-progresso` | `concluido`

**Branch/PR:**

**Arquivos alterados:**
-

**Notas de implementação:**

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
