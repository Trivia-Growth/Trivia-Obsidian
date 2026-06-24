---
audiência: humano
atualizado: 2026-06-24
---

# 09 — Receitas (Banco, Edge Functions, HTTP)

> Espelho humano. **Fonte da verdade: o scaffold** (código e templates abaixo). Esta nota é o
> índice navegável das receitas operacionais. Voltar: [[00 - Comece Aqui]].

## Por que existe
O agente constrói melhor quando tem **o padrão na frente**, não só a teoria. Estas receitas são
código/template reais no scaffold, prontos para imitar — cobrem as camadas que mais doem (I/O,
persistência, borda, banco).

## Banco de dados (perfil single-repo: schema `public`)
- **Padrões de migration** (idempotência, SQL reverso no topo, backup antes): `_Scaffold/base/db/README.md`.
- **Template de RLS** por papel (SELECT/INSERT/UPDATE/DELETE, FORCE, verificação): `_Scaffold/base/db/rls.template.sql`.
- **Testar RLS de verdade** (Supabase local / pgTAP): `_Scaffold/base/db/rls-test.md`.
- Exemplo real aplicado: `_Scaffold/base/db/migrations/0001_comissoes.sql`.
- Perfil **OS** (schemas por domínio, audit append-only): `_Scaffold/os-layer/...` e [[05 - Qualidade e Segurança]].

## Edge Functions (Supabase / Deno)
- **Template completo** (CORS → auth JWT → Zod → lógica → `problem+json`, log com reqId):
  `_Scaffold/base/supabase/functions/_template/index.ts`.
- Helpers compartilhados: `_Scaffold/base/supabase/functions/_shared/` (`auth`, `cors`, `crypto`).
- Webhook de terceiro: validar HMAC com `constantTimeEqual` (nunca `===`).

## Borda HTTP (Node / camada interfaces)
- **Erro padronizado** RFC 7807: `_Scaffold/base/src/interfaces/http/problem.ts`.
- **Handler de exemplo** (Zod + problem+json + log): `_Scaffold/base/src/interfaces/http/registrar-comissao.ts`.
- **Log estruturado** (JSON, reqId, sem PII): `_Scaffold/base/src/shared/log.ts`.
- **Config tipada** (Zod, fail-fast): `_Scaffold/base/config/env.ts`.

## Persistência (porta + adapter)
- Porta no domínio: `_Scaffold/base/src/domain/comissao/registro-comissao.ts`.
- Adapters: `repositorio-em-memoria.ts` (testes) e `repositorio-supabase.ts` (produção) — mesmo contrato.
- Caso de uso orquestrando: `_Scaffold/base/src/application/registrar-comissao.ts`.

→ Detalhe de arquitetura das camadas: [[04 - Arquitetura]]. Operações/deploy: [[06 - Operações]].
