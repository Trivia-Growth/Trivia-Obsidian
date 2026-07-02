---
audiência: humano
atualizado: 2026-06-22
---

# 03 — Perfis de Projeto

> Espelho humano. Detalhe normativo: `_Scaffold/base/` (single-repo) e `_Scaffold/os-layer/`
> (OS). Voltar: [[00 - Comece Aqui]].

## Single-repo (sistema isolado)
Um repositório, um produto/funcionalidade. É o **ponto de partida de todo projeto**.
- Estrutura: `_Scaffold/base/` na raiz (camadas DDD em `src/`, `specs/`, `docs/`, gates).
- Segurança: **baseline mínimo** (`seguranca/baseline-minimo.md`).
- Sem monorepo, sem schemas por domínio.

## OS (monorepo multi-domínio)
**N sistemas/domínios juntos** (ex.: HeziomOS, FamilyOS). Aplica a `os-layer/` por cima da base.
- Estrutura: `apps/*` + `packages/*` (pnpm + Turborepo), schemas Postgres por domínio.
- Segurança: **OS-grade** (RLS FORCE, `audit.*` append-only, Vault, webhooks HMAC).
- Detalhe: [[04 - Arquitetura]] e `os-layer/docs/ARCHITECTURE.md`.

## Quando promover single → OS
Promova **só quando há fronteira de domínio real**:
- Bounded contexts distintos que evoluem em ritmos diferentes;
- Times/responsabilidades separadas por área;
- Necessidade de isolar schemas/segurança por domínio.

**Não** monte monorepo "por precaução" (`ANTI-PADROES.md`). A metodologia (esteira SDD, artefatos,
gates) é **idêntica** nos dois perfis — só muda a estrutura física e o grau de segurança. Por isso
a transição é suave: o que você escreveu como single-repo continua valendo.

## Como promover (resumo)
Ver `_Scaffold/os-layer/README.md`: mover `src/` → `apps/web/`, promover compartilhados para
`packages/`, rodar a migration de schemas, aplicar a segurança OS-grade.
