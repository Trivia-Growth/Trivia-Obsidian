---
id: STORY-003
titulo: "Admin server-side + RLS + rate limit + validação"
fase: 1
modulo: "Admin / Netlify Functions / Supabase"
status: parcial
prioridade: P0
agente_responsavel: "@dev"
criado: 2026-04-24
atualizado: 2026-04-25
---

# STORY-003 — Admin server-side + RLS + rate limit + validação

## Contexto

O painel admin usava o client anon do Supabase, expondo dados sensíveis (leads, conversas) sem proteção adequada. As funções Netlify não tinham rate limiting nem validação robusta.

## Solução (parcial — continuada em STORY-003b)

- Migração para `service_role` nas funções server-side.
- RLS configurado no Supabase para tabelas `leads`, `conversations`, `messages`.
- Rate limiting básico nas funções críticas.

## Status

**Parcial** — refactor de service-role concluído via STORY-003b. RLS parcialmente aplicado. Validação completa pendente.

## Relacionado

[[STORY-003b — Admin service-role refactor]]
