---
id: STORY-011
titulo: "Resiliência: ErrorBoundary, Sentry, QueryClient"
fase: 2
modulo: "arquitetura"
status: backlog
prioridade: média
agente_responsavel: "@dev"
criado: 2026-06-09
atualizado: 2026-06-09
---

# STORY-011 — Resiliência: ErrorBoundary, Sentry, QueryClient

## Contexto

> Existe um único ErrorBoundary global (só `console.error`), sem isolamento por rota e sem reporte de erros — embora `SENTRY_DSN` exista no `.env.example`. O "Tentar novamente" não reseta o estado de verdade. O `QueryClient` é criado sem defaults (retry/staleTime/onError) e há **dois sistemas de toast** coexistindo (sonner + shadcn use-toast).

Achados **#21, #64, #65**. Independe de tenancy.

## Spec de Referência

- [[Auditoria TRIVIAIOX — Sales-Hzm]] — achados #21, #64, #65
- [[Componentes React]] · [[TanStack Query e TypeScript]]

## Critérios de Aceite

- [ ] CA1 — ErrorBoundary por rota/feature (não só um global), com `resetKeys` para o "Tentar novamente" realmente recuperar.
- [ ] CA2 — Integrar Sentry (usar `SENTRY_DSN`) reportando erros capturados pelo boundary e erros globais de query.
- [ ] CA3 — `QueryClient` centralizado em `src/lib/query-client.ts` com `defaultOptions` (retry, staleTime) e `onError` global.
- [ ] CA4 — Unificar em **um** sistema de toast (sonner); remover o shadcn `use-toast` dos 18 arquivos.
- [ ] CA5 — Rotas novas carregadas com `lazy()` + `Suspense` (conforme DoD).

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
- [ ] ErrorBoundary por rota com retry funcional
- [ ] Sentry reportando
- [ ] QueryClient com defaults e onError
- [ ] Toast unificado

**Notas:**

---

## Notas e Decisões
