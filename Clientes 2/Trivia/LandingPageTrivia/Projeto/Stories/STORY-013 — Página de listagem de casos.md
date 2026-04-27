---
id: STORY-013
titulo: "Criar página de listagem /casos"
fase: 1
modulo: "Casos / Rotas"
status: concluido
prioridade: P1
agente_responsavel: "@dev"
criado: 2026-04-25
atualizado: 2026-04-25
---

# STORY-013 — Página de listagem /casos

## Contexto

A rota `/casos` não tinha index — ao acessar diretamente retornava 404. Existia apenas o template de caso individual (`/casos/:slug`).

## Solução

Criado `src/routes/casos/index.tsx` com listagem dos cases disponíveis, links para cada slug e layout consistente com o design system da Trívia.

## Status

**Concluído** — deploy em produção 2026-04-25.
