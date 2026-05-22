---
status: backlog
tipo: manutencao
sprint: manutencao
prioridade: baixa
---

# STORY-021 — Limpeza das Pendencias de Lint

## Contexto

Com o ESLint reparado (STORY-020), a verificacao revelou 24 pendencias de
qualidade pre-existentes no codigo: 16 erros e 8 avisos. Nenhuma afeta o
funcionamento do sistema — sao limpeza de codigo.

## Descricao

Corrigir as pendencias apontadas por `npm run lint`.

## Criterios de Aceite

- [ ] `supabase/functions/_shared/translation-engine.ts:38` — 4 variaveis nao usadas
      (`fornecedor`, `documento`, `forma_pagamento`, `centro_custo`)
- [ ] `supabase/functions/import-chart-of-accounts/index.ts:166` — variavel `updated`
      nao usada / deveria ser `const`
- [ ] `supabase/functions/import-spreadsheet/index.ts:137` — variavel `_key` nao usada
- [ ] `src` (TransactionsPage) — avisos `react-hooks/set-state-in-effect` e
      `react-hooks/exhaustive-deps` no `useEffect`
- [ ] `npm run lint` sem erros
- [ ] (avaliar) configurar ESLint para ignorar variaveis prefixadas com `_`

## Notas

- 16 erros + 8 avisos = 24 problemas
- Os erros sao quase todos `no-unused-vars` — correcao trivial, baixo risco
- Os avisos `react-hooks` exigem cuidado: mexer em `useEffect`/dependencias pode
  alterar comportamento — revisar caso a caso
