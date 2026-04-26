---
id: STORY-010
titulo: "Rotas públicas de caso, diário e privacidade"
fase: 1
modulo: "Landing / Rotas TanStack / MDX"
status: concluido
prioridade: P2
agente_responsavel: "@dev"
criado: 2026-04-24
atualizado: 2026-04-25
---

# STORY-010 — Rotas públicas de caso, diário e privacidade

## Contexto

As seções "Cases" e "Diário" na landing apontavam para rotas que não existiam (`/casos/:slug`, `/diario/:slug`, `/privacidade`), gerando 404.

## Solução

- Rota `/casos/:slug` — página individual de caso com layout editorial.
- Rota `/casos` — listagem de cases (criada também em STORY-013).
- Rota `/diario/:slug` — artigo de blog/diário.
- Rota `/privacidade` — política de privacidade LGPD.
- Conteúdo inicial via dados estáticos (não CMS ainda).

## Status

**Concluído** — deploy em produção 2026-04-25.
