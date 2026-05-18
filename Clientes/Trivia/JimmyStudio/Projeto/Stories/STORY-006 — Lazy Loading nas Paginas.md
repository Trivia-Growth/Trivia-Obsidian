---
id: STORY-006
titulo: "Lazy Loading nas 52 Páginas sem Code Splitting"
fase: 2
modulo: "infra"
status: backlog
prioridade: media
agente_responsavel: "@dev"
criado: 2026-04-29
atualizado: 2026-04-29
---

# STORY-006 — Lazy Loading nas 52 Páginas

## Contexto

Das 54 páginas do sistema, apenas 2 usam `lazy()` para code splitting. As outras 52 carregam no bundle inicial, aumentando o tempo de carregamento para todos os usuários — incluindo aqueles que nunca vão acessar módulos como `/admin`, `/auditoria` ou `/agencia/contratos`.

A função `lazyWithRetry()` já existe em `src/lib/lazy-with-retry.ts` — basta substituir os imports diretos nas rotas do `App.tsx`.

Esta é uma mudança de baixo risco: apenas altera como o código é carregado, não o que ele faz. Mas precisa de teste E2E validando que todas as rotas ainda funcionam.

**Pré-requisito:** STORY-002 (testes) concluída, especialmente os testes E2E das rotas principais.

## Spec de Referência

- `architecture.md` — seção Performance
- `PROJECT_REQUIREMENTS.md` — item 6 da tabela de Questões Abertas

## Critérios de Aceite

- [ ] CA1 — Todas as 54 páginas usam `lazyWithRetry()` em vez de import direto
- [ ] CA2 — Cada rota tem `<Suspense fallback={<LazyLoadFallback />}>` (componente já existe)
- [ ] CA3 — Build de produção (`npm run build`) passa sem erros
- [ ] CA4 — `npx playwright test` confirma que as rotas principais ainda funcionam após a mudança
- [ ] CA5 — Bundle inicial reduzido (verificar com `npm run build -- --analyze` ou similar)

## Restrições

- Não alterar o código dos componentes de página — apenas a forma de importar em `App.tsx`
- Manter a hierarquia de `<Suspense>` existente
- Testar antes de commitar (sem staging)

---

## Implementação

> Preenchido pelo `@dev` após concluir.

**Status:** —

**Branch/PR:** —

**Arquivo a modificar:**
- `src/App.tsx` (imports das páginas → lazyWithRetry)

**Padrão:**
```tsx
// Antes:
import Dashboard from '@/pages/Dashboard';

// Depois:
const Dashboard = lazyWithRetry(() => import('@/pages/Dashboard'));
```

---

## QA

> Preenchido pelo `@qa` após implementação.

**Gate:** —

**Checklist:**
- [ ] Todas as 54 rotas testadas manualmente ou via Playwright
- [ ] Nenhuma rota mostra tela em branco ou erro de import
- [ ] Loading state (LazyLoadFallback) aparece durante a navegação
- [ ] Build sem erros

**Notas:** —
