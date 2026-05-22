---
id: STORY-007
titulo: "Saúde do código e build (TS strict, deps, testes)"
fase: 1
modulo: "Qualidade"
status: em-progresso
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
  *(ADIADO — migração grande; ligar `strict` pode revelar dezenas de erros.
  Merece esforço próprio, como o próprio diagnóstico recomendou.)*
- [ ] CA2 — `npm audit fix` aplicado; vulnerabilidades high tratadas
- [ ] CA3 — Biblioteca `xlsx` substituída por versão segura (SheetJS CDN ou `exceljs`)
- [x] CA4 — Lockfiles unificados — `bun.lock` e `bun.lockb` removidos e no
  `.gitignore`; o projeto usa só `package-lock.json` (npm)
- [x] CA5 — *Parcial:* Error Boundary global criado (`ErrorBoundary.tsx`)
  envolvendo as rotas. Falta o tratamento de `isError` tela a tela.
- [ ] CA6 — Primeira suíte de testes (Vitest) com smoke tests por área
- [x] CA7 — Code-splitting: rotas com `React.lazy()` + `Suspense`. Bundle
  inicial caiu de ~1.670 kB para ~508 kB (85 chunks). Verificado.
- [ ] CA8 — `CARRIER_LABELS` / `STATUS_LABELS` centralizados em um módulo

## Implementação

**Commit:** `d835226` — CA4, CA5 (global), CA7.

## Pendências

- **CA1** — ligar TS `strict`: migração extensa, turno dedicado.
- **CA2** — `npm audit fix` (rollup/postcss/ws/yaml têm fix; `xlsx` não).
- **CA3** — trocar a `xlsx` (vulnerável, sem fix no npm) — exige testar a
  importação de planilha de "Envios Módicos".
- **CA5** (resto) — tratar `isError` das queries nas telas.
- **CA6** — configurar Vitest + smoke tests.
- **CA8** — centralizar os mapas de rótulos (hoje duplicados em ~4 lugares).
- **Extra (verificação E2E):** card "Em Trânsito" não conta o status
  `posted` — decisão de produto / ajuste de UI.

## Referência

- [[Projeto/Diagnóstico Técnico]] — seção 4 (qualidade) e item S18
- `SECURITY_DEBT.md` SEC-006, SEC-007

## Notas e Decisões

- `2026-05-22` — Story criada a partir do diagnóstico técnico.
- `2026-05-22` — CA4, CA5 (global) e CA7 entregues (commit `d835226`).
  Demais CAs pendentes — ver Pendências.
