---
id: STORY-026
titulo: "Refatorar Data-Fetching para TanStack Query"
fase: 1
modulo: core
status: in_progress
prioridade: média
agente_responsavel: ""
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-026 — Refatorar Data-Fetching para TanStack Query

## Contexto

Varias telas buscam dados com `useEffect` + `setState` manual (`setLoading`,
`setData`, `setError`). Esse padrao funciona, mas o ESLint (regras novas do
`eslint-plugin-react-hooks` v7) o sinaliza, e o projeto ja tem o TanStack Query
instalado sem usa-lo para esses fetches.

Migrar para `useQuery` elimina os warnings de `set-state-in-effect`,
`exhaustive-deps` e `immutability` de forma correta — em vez de apenas rebaixar
a regra (paliativo aplicado na STORY-021).

## Spec de Referencia

- [[Documentos Trivia/Padrão Projetos/02 - Qualidade/TanStack Query e TypeScript]]
- Warnings atuais de `npm run lint` (16, todos sobre hooks)

## Criterios de Aceite

- [ ] Telas com fetch via `useEffect` migradas para `useQuery` / `useMutation`:
      AccountsPage, CategoriesPage, CostCentersPage, DashboardPage, ExtratoPage,
      ReviewPage, TransactionsPage, UsersPage
- [ ] `TransactionForm` — inicializacao do form de edicao sem `setState` no effect
- [ ] `AccountAutocomplete` — reset de indice sem `setState` no effect
- [ ] `context.tsx` — separar o hook `useAuthContext` em arquivo proprio
      (resolve `react-refresh/only-export-components`)
- [ ] `npm run lint` sem warnings de hooks
- [ ] Reverter os rebaixamentos de regra feitos na STORY-021 (voltar a `error`)
- [ ] Comportamento de cada tela inalterado — validar no preview

## Implementacao

> Preenchido pelo `@dev` apos concluir.

## QA

> Preenchido pelo `@qa`.

## Notas e Decisoes

- Risco medio: mexe em 9+ componentes em producao.
- O projeto nao tem suite de testes automatizados — a verificacao de cada
  tela e manual (preview).
