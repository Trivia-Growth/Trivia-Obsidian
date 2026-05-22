---
id: STORY-007
titulo: "Saúde do código e build (TS strict, deps, testes)"
fase: 1
modulo: "Qualidade"
status: backlog
prioridade: media
agente_responsavel: "Claude Code"
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-007 — Saúde do código e build

## Contexto

A auditoria ([[Projeto/Diagnóstico Técnico]]) apontou dívidas de qualidade que
aumentam o risco de regressão e bugs silenciosos.

## Critérios de Aceite

- [ ] CA1 — TypeScript `strict` ligado e erros resultantes corrigidos
- [ ] CA2 — `npm audit fix` aplicado; vulnerabilidades high tratadas
- [ ] CA3 — Biblioteca `xlsx` substituída por versão segura (SheetJS CDN ou `exceljs`)
- [ ] CA4 — Lockfiles unificados (manter só `package-lock.json`)
- [ ] CA5 — Error Boundary global + tratamento de erro de query nas telas
- [ ] CA6 — Primeira suíte de testes (Vitest) com smoke tests por área
- [ ] CA7 — Code-splitting: rotas com `lazy()` + `Suspense`
- [ ] CA8 — `CARRIER_LABELS` / `STATUS_LABELS` centralizados em um módulo

## Referência

- [[Projeto/Diagnóstico Técnico]] — seção 4 (qualidade) e item S18
- `SECURITY_DEBT.md` SEC-006, SEC-007

## Notas e Decisões

- `2026-05-22` — Story criada a partir do diagnóstico técnico.
