---
id: STORY-005
titulo: "Infraestrutura de descoberta — SEO, OG tags, sitemap, robots"
fase: 1
modulo: "Descoberta / Metadados / Netlify Functions"
status: concluido
prioridade: P1
agente_responsavel: "@dev"
criado: 2026-04-24
atualizado: 2026-04-25
---

# STORY-005 — Infraestrutura de descoberta

## Contexto

O site não tinha metadados de SEO, Open Graph, sitemap.xml ou robots.txt — invisível para motores de busca e sem preview em redes sociais.

## Solução

- Meta tags (title, description, OG, Twitter Card) em todas as rotas via `__root.tsx`.
- `sitemap.xml` e `robots.txt` servidos via Netlify Functions.
- Schema.org `Organization` e `WebSite` no head.

## Status

**Concluído** — deploy em produção 2026-04-25.
