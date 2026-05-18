---
id: STORY-004
titulo: "Error Boundary e Estados de Erro nas Pages"
modulo: "Qualidade"
status: "concluido"
fase: 3
prioridade: 2
agente_responsavel: "—"
atualizado: 2026-05-05
---

# STORY-004 — Error Boundary e Estados de Erro nas Pages

## Contexto (Auditoria TRIVIAIOX — 2026-05-05)

Não existe nenhum `ErrorBoundary` no projeto. Se qualquer componente lançar um erro de runtime, o app inteiro quebra com tela branca. Além disso, as pages `Dashboard`, `Analytics`, `Pipeline` e `Contacts` usam `isLoading` do TanStack Query mas nunca exibem `.isError` — o usuário fica sem feedback quando uma query falha.

## Problema

- Nenhum `ErrorBoundary` em `/src/` (auditoria não encontrou nenhum)
- `src/App.tsx:27-50`: routes lazy-loaded com `<Suspense>` mas sem error fallback
- `src/pages/Dashboard.tsx:25-32`: usa `isLoading`, ignora `isError`
- `src/pages/Analytics.tsx:24-32`: mesma omissão
- `src/pages/Pipeline.tsx`: skeleton de loading, sem fallback de erro
- `src/components/roleplay/RoleplaySession.tsx:68-98`: stream sem tratamento robusto de erro

## O que fazer

- [ ] Criar `src/components/ErrorBoundary.tsx` (class component React.Component com `componentDidCatch`)
- [ ] Envolver o `<RouterProvider>` em `src/App.tsx` com `<ErrorBoundary>`
- [ ] Envolver cada rota lazy-loaded com `<ErrorBoundary>` + `<Suspense>`
- [ ] Adicionar estado de erro em `Dashboard.tsx` (exibir alert quando `isError`)
- [ ] Adicionar estado de erro em `Analytics.tsx`
- [ ] Adicionar estado de erro em `Pipeline.tsx`
- [ ] Adicionar estado de erro em `Contacts.tsx`, `Companies.tsx`, `Conversations.tsx`
- [ ] Padronizar componente `<QueryError error={error} />` reutilizável em `src/components/ui/`

## Critérios de Aceite

- [ ] `src/components/ErrorBoundary.tsx` implementado
- [ ] Todas as rotas lazy-loaded protegidas com ErrorBoundary
- [ ] Todas as pages com TanStack Query exibem UI de erro quando `isError = true`
- [ ] Testado: simular falha de query e confirmar que usuário vê mensagem de erro amigável
- [ ] Nenhuma "tela branca" possível — toda falha tem UI de fallback
