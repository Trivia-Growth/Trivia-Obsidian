---
tipo: handoff
projeto: Jimmy Studio
data: 2026-04-30
de: Claude (@dev)
para: Lucas
---

# Handoff — Jimmy Studio

> Atualizado em 2026-04-30 após STORY-004.

---

## Estado atual

**Repo:** `https://github.com/Triviastudio/triviadash-analytics`
**Clone local (João):** `/Users/joaogabrielnovais/Documents/Obsidian/Github/triviadash-analytics`
**Produção:** `https://jimmystudio.com.br` (Netlify — auto-deploy ao push em `main`)
**Supabase:** `https://supabase.com/dashboard/project/kjixezlzateraihxltfa`

---

## Stories concluídas

| Story | O que foi feito | Commit |
|-------|----------------|--------|
| STORY-001 | Padrão Trivia aplicado: CLAUDE.md, architecture.md, PROJECT_REQUIREMENTS.md, SECURITY_DEBT.md, netlify.toml, docs/ completo, AIOX v5.0.7 | vários |
| STORY-002 | Setup de testes: 87 testes unitários (Vitest) + 6 testes E2E (Playwright) — todos passando | `d7e30954` |
| STORY-003 | Zod adicionado em 5 Edge Functions críticas — 27 novos testes de schema | `6bc979be` |
| STORY-004 | Rate limiting 20 req/min por IP no agent-api — ADR-009 documentado | `e3619403` |

---

## Pendência manual — CRÍTICA (STORY-004)

O CLI do Supabase não consegue fazer `db push` porque o remote tem 400+ migrations históricas que não existem no repo local. Isso é um problema herdado — não foi causado por nenhuma mudança desta sessão.

**O que falta:** criar a tabela de rate limiting no banco. Sem ela, o rate limiting está em fail-open (funciona normalmente, mas sem limitar).

**Como resolver:** entrar no [Supabase Dashboard → SQL Editor](https://supabase.com/dashboard/project/kjixezlzateraihxltfa/sql) e rodar:

```sql
CREATE TABLE IF NOT EXISTS public.agent_api_rate_limits (
  ip           text        PRIMARY KEY,
  calls_count  integer     NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now()
);
```

O arquivo de migration já está no repo em `supabase/migrations/20260430172505_agent_api_rate_limits.sql`.

---

## Como rodar os testes

```bash
cd /Users/joaogabrielnovais/Documents/Obsidian/Github/triviadash-analytics

# Sempre puxar antes de qualquer coisa
git pull --rebase origin main

# Testes unitários (87 testes — roda sem internet, sem credenciais)
npm test

# Testes E2E (credenciais já estão em .env.test — não commitar)
npx playwright test

# E2E com interface visual
npx playwright test --ui
```

O `.env.test` já existe na máquina do João com as credenciais do usuário de teste `jimmy@triviastudio.com.br`. Se Lucas precisar rodar os E2E em outra máquina, criar o arquivo:

```env
PLAYWRIGHT_TEST_EMAIL=jimmy@triviastudio.com.br
PLAYWRIGHT_TEST_PASSWORD=T3st3@#$
PLAYWRIGHT_BASE_URL=https://jimmystudio.com.br
```

---

## Como deployar

```bash
# Frontend (Netlify detecta automaticamente)
git push origin main

# Edge Functions (quando alterar alguma função)
supabase functions deploy nome-da-funcao

# Para linkar o projeto primeiro (se necessário)
supabase link --project-ref kjixezlzateraihxltfa
```

**Atenção:** `supabase db push` não funciona por causa do histórico de migrations desincronizado. Migrações novas precisam ser aplicadas manualmente via SQL Editor no Dashboard.

---

## Impacto do que foi implementado

**STORY-003 — Zod nas Edge Functions:**
- Antes: body malformado chegava até o banco ou a Claude API
- Agora: HTTP 400 com mensagem clara antes de executar qualquer lógica
- Funções protegidas: `agent-api`, `generate-content`, `meta-import-insights`, `appmax-create-order`, `create-user`

**STORY-004 — Rate Limiting:**
- Antes: API key válida = chamadas ilimitadas à Claude API (custo irrestrito)
- Agora: máximo 20 chamadas/min por IP (requer a tabela criada manualmente — ver seção acima)
- `verify_jwt = false` no agent-api é **intencional**: auth é feita via `X-API-Key` contra `org_api_keys`

---

## Próximas stories (backlog priorizado)

| Story | Título | Prioridade | O que fazer |
|-------|--------|------------|-------------|
| **STORY-005** | Ativar Sentry em Produção | P1 | Instalar `@sentry/react`, configurar DSN, Error Boundary global |
| **STORY-006** | Lazy Loading nas Páginas | P1 | `React.lazy()` + `Suspense` nas 52 rotas do React Router |
| **STORY-007** | TypeScript Strict Mode Progressivo | P1 | Ativar strict em `src/features/` primeiro, depois expandir |
| **STORY-008** | Substituir select('*') nos Hooks Principais | P1 | Identificar os hooks mais usados e especificar colunas |

Todas as stories com spec completa estão em `Projeto/Stories/` (este vault).

---

## Onde encontrar o que

| O que | Onde |
|-------|------|
| Instruções para agentes (ler primeiro) | `CLAUDE.md` no repo |
| Arquitetura e ADRs | `architecture.md` no repo |
| Módulos e integrações | `PROJECT_REQUIREMENTS.md` no repo |
| Visão geral do sistema | `docs/SYSTEM_OVERVIEW.md` |
| 132 Edge Functions catalogadas | `docs/EDGE_FUNCTIONS.md` |
| Guia de testes | `docs/TESTING.md` |
| Débito técnico | `docs/TECHNICAL_DEBT.md` |
| Stories e roadmap | `Projeto/Stories/` neste vault |
| Painel Supabase | `https://supabase.com/dashboard/project/kjixezlzateraihxltfa` |

---

## Regras invioláveis (resumo — ler CLAUDE.md completo antes de implementar)

- `git pull --rebase origin main` antes de qualquer implementação — sem exceção
- `npm test` deve passar antes de qualquer commit
- `console.log` é intencional — não remover (o piloto usa para debug em produção)
- Sem staging: toda mudança vai direto para produção — mudanças pequenas e reversíveis
- `supabase db push` está quebrado — usar SQL Editor no Dashboard para migrations novas
- Zod obrigatório em toda Edge Function nova ou modificada
- `supabase functions deploy [nome]` após qualquer alteração em Edge Function

---

## Arquitetura em uma linha

SPA React 18 monolítica (779 componentes) + Supabase (227 tabelas, 132 Edge Functions, 17 CRONs) + Netlify. Multi-tenant com RLS FORCE em todas as tabelas. Claude API via OpenRouter para o Jimmy Agent. Novas features em `src/features/` (Bulletproof React progressivo).
