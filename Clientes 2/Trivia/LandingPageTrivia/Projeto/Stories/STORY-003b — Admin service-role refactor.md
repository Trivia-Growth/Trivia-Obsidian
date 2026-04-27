---
id: STORY-003b
titulo: "Admin service-role refactor"
fase: 1
modulo: "Admin / Netlify Functions"
status: concluido
prioridade: P0
agente_responsavel: "@dev"
criado: 2026-04-24
atualizado: 2026-04-25
---

# STORY-003b — Admin service-role refactor

## Contexto

Spinoff da STORY-003. O client Supabase nas Netlify Functions usava a anon key, que não tem permissão para escrita em tabelas protegidas por RLS. Era necessário usar a `service_role` key exclusivamente no servidor.

## Solução

- `createSupabaseServerClient()` em `src/lib/supabase-server.ts` usando `SUPABASE_SERVICE_ROLE_KEY`.
- Todas as Netlify Functions migradas para usar o client server-side.
- Anon key mantida apenas no client browser (`src/lib/supabase.ts`).

## Status

**Concluído** — deploy em produção 2026-04-25.
