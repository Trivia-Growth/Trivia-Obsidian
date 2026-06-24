---
audiência: humano
atualizado: 2026-06-22
---

# 04 — Arquitetura

> Espelho humano. Detalhe normativo: `_Scaffold/base/CLAUDE.md` (camadas) e os exemplos em
> `specs/0001-calculo-comissao/` (domínio puro) e `specs/0002-registro-comissao/` (camadas com
> I/O: porta→adapter→borda). Voltar: [[00 - Comece Aqui]].

## Camadas DDD (regra de dependência)
```
interfaces → application → domain ← infrastructure
```
- `domain/` não importa framework/I/O nem outra camada (lógica pura, testável). Ex. no scaffold:
  `src/domain/comissao/`. A **porta de persistência** é uma interface no domínio
  (`registro-comissao.ts`) — o domínio define o contrato, não o mecanismo.
- `application/` orquestra casos de uso; depende só de `domain/` e das portas (injetadas).
- `infrastructure/` implementa as portas: adapter **in-memory** (testes) e adapter **Supabase**
  (produção) — mesmo contrato. Ex.: `src/infrastructure/comissao/`.
- `interfaces/` é a borda (API/CLI/UI): valida com Zod, traduz erro para `problem+json`, loga com
  `reqId`. Ex.: `src/interfaces/http/`. Helpers: `src/shared/log.ts`, `interfaces/http/problem.ts`.

> **Exemplo das camadas com I/O:** `specs/0002-registro-comissao/` mostra o caminho completo
> (porta → adapter in-memory/Supabase → caso de uso → borda HTTP → teste de integração → migration).
> É o padrão a imitar quando a feature persiste ou chama algo externo.

## Stack de referência
- Frontend: React + Vite + TypeScript (strict) + Tailwind + shadcn/ui + TanStack Query.
- Backend: Supabase (Postgres + Edge Functions Deno).
- Lint/format: Biome · Testes: Vitest · (OS) Monorepo: pnpm + Turborepo.
- Divergência do stack → vira ADR no projeto. Modelos de IA: usar Claude mais capaz; consultar a
  referência da Claude API antes de integrar (ver [[05 - Qualidade e Segurança]]).

## Banco de dados (nomenclatura)
| Tipo | Padrão | Exemplo |
|------|--------|---------|
| schema | lowercase, underscore | `crm`, `lit_mirror`, `lgpd` |
| tabela | snake_case, sem prefixo do schema | `crm.contacts` |
| coluna | snake_case | `created_at` (não `contact_created_at`) |
| PK / FK | `id uuid` / `<entidade>_id` | `id`, `workspace_id` |
| índice | `idx_<tabela>_<colunas>` | `idx_contacts_ws_created` |

Toda tabela: `created_at/by`, `updated_at/by`, `deleted_at`. RLS sempre; **FORCE em OS**; `audit.*`
append-only. Referência: `os-layer/supabase/migrations/0001_schemas_dominio.sql`.

## Estrutura de código
- **Single-repo:** `src/{interfaces,application,domain,infrastructure}`.
- **OS:** `apps/web/src/features/<domínio>/{pages,components,hooks,types}` + `packages/*`.
- Regra: **features de domínios diferentes não se importam** — compartilhe via `packages/`.
- Componente < 300 linhas; lógica em hooks; 3 estados em dado assíncrono (loading/error/sucesso).
