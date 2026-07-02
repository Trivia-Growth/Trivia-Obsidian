---
name: ARCHITECTURE
description: Documento vivo da arquitetura OS — bounded contexts, context-map, schemas. Puxe ao tocar fronteira de domínio.
alwaysApply: false
---

# ARCHITECTURE — <nome do sistema OS>

> Documento **vivo** (atualize quando a fronteira mudar). Vale só no perfil **OS**. Decisão
> estrutural aqui vira **ADR** em `docs/adr/`.

## Visão geral
<O que o sistema OS é, em 2–3 frases. Quais sistemas/domínios ele reúne.>

## Bounded contexts (context-map)
| Contexto      | Subdomínio | Schema(s) Postgres | App/feature             | Relação com outros |
|---------------|------------|--------------------|-------------------------|--------------------|
| CRM           | core       | `crm`              | `apps/web/.../crm`      | Supplier do Comercial |
| Comercial     | supporting | `comercial`        | `apps/web/.../comercial`| Customer do CRM (ACL) |
| <…>           | <…>        | <…>                | <…>                     | <…>                |

> Mapeie relações com a linguagem de DDD: Customer/Supplier, Conformist, Anti-Corruption Layer,
> Shared Kernel. Cada contexto tem sua linguagem ubíqua (ver `domain.md` das features).

## Estrutura do monorepo
```
apps/web/src/features/<dominio>/{pages,components,hooks,types}   ← um diretório por bounded context
packages/{config,database,shared,ui}                            ← compartilhado
supabase/{migrations,functions}                                 ← banco + Edge Functions
```
Regra: **features de domínios diferentes não se importam** — compartilhe via `packages/`.

## Camadas (DDD tático)
`interfaces → application → domain ← infrastructure` (igual ao `base/CLAUDE.md`).
O `domain/` de cada contexto não conhece framework nem outro contexto.

## Dados
- Schemas por domínio (ver `supabase/migrations/0001_schemas_dominio.sql`).
- Governança: `audit.*` (append-only), `lgpd.*`, `config.*`.
- Espelhos (`*_mirror`): app só lê; sync externo escreve.

## Decisões estruturais (ADRs)
- <ADR-NNNN — …>
