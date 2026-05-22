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
- [x] CA2 — `npm audit fix` aplicado (commit `f7a0ab6`); de 18 vulnerabilidades
  para 3 — as 3 restantes são todas do `xlsx` (sem fix no npm; ver CA3).
- [ ] CA3 — Biblioteca `xlsx` substituída por versão segura (SheetJS CDN ou `exceljs`)
- [x] CA4 — Lockfiles unificados — `bun.lock` e `bun.lockb` removidos e no
  `.gitignore`; o projeto usa só `package-lock.json` (npm)
- [x] CA5 — *Parcial:* Error Boundary global criado (`ErrorBoundary.tsx`)
  envolvendo as rotas. Falta o tratamento de `isError` tela a tela.
- [x] CA6 — Vitest configurado (commit `c663485`): config no `vite.config.ts`,
  setup do testing-library, scripts `npm test` / `npm run test:run`. Primeiros
  3 smoke tests cobrindo os rótulos centralizados — todos passando.
- [x] CA7 — Code-splitting: rotas com `React.lazy()` + `Suspense`. Bundle
  inicial caiu de ~1.670 kB para ~508 kB (85 chunks). Verificado.
- [x] CA8 — `CARRIER_LABELS` / `STATUS_LABELS` centralizados em `src/types/tracking.ts`;
  4 cópias locais removidas. Spec de rótulos aprovada pelo JG. Commit `613d1ee`.

## Implementação

**Commits:** `d835226` (CA4, CA5 global, CA7) · `886cd35` (métrica Em Trânsito)
· `613d1ee` (CA8).

## Pendências

- **CA1** — ligar TS `strict`: migração extensa, turno dedicado.
- [x] **CA2** — concluída (commit `f7a0ab6`). 18 → 3 vulnerabilidades.
- **CA3** — trocar a `xlsx` (vulnerável, sem fix no npm) — exige testar a
  importação de planilha de "Envios Módicos".
- **CA5** (resto) — tratar `isError` das queries nas telas.
- [x] **CA6** — concluída (commit `c663485`).
- [x] **CA8** — concluída (commit `613d1ee`). O `STATUS_LABELS` do Dashboard
  era código morto; as outras cópias foram trocadas por imports de `tracking.ts`.
- [x] **Extra — métrica "Em Trânsito"** (corrigido, commit `886cd35`):
  passou a contar tudo que ainda não chegou (não entregue, sem problema);
  novo card "Enviados ao CD" para o status `shipped`. Spec do JG (22/05).

## Referência

- [[Projeto/Diagnóstico Técnico]] — seção 4 (qualidade) e item S18
- `SECURITY_DEBT.md` SEC-006, SEC-007

## Notas e Decisões

- `2026-05-22` — Story criada a partir do diagnóstico técnico.
- `2026-05-22` — CA4, CA5 (global) e CA7 entregues (commit `d835226`).
- `2026-05-22` — Métrica "Em Trânsito" corrigida + card "Enviados ao CD"
  (commit `886cd35`), com spec definida pelo JG.
- `2026-05-22` — CA8 concluída (commit `613d1ee`) após aprovação dos rótulos
  pelo JG. Restam CA1, CA2, CA3, CA6 e o resto da CA5 — turnos dedicados.
