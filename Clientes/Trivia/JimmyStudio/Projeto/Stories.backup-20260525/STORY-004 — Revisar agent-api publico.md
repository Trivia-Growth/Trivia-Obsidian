---
id: STORY-004
titulo: "Revisar agent-api público — Rate Limiting e Proteção"
fase: 2
modulo: "infra"
status: concluido
prioridade: alta
agente_responsavel: "@architect"
criado: 2026-04-29
atualizado: 2026-04-29
---

# STORY-004 — Revisar agent-api público: Rate Limiting e Proteção

## Contexto

A Edge Function `agent-api` está configurada com `verify_jwt = false` no `config.toml`, o que significa que qualquer pessoa pode chamar o endpoint diretamente — sem autenticação. Esta função chama a Claude API, que tem custo por token. Se não houver rate limiting implementado internamente, o endpoint está exposto a:

1. Abuso (chamadas massivas gerando custo)
2. Injeção de prompts maliciosos sem rastreamento de usuário
3. Vazamento de dados se o contexto de dados for injetado sem validação de origem

**Esta story é de investigação + ação.** Primeiro entender o motivo do `verify_jwt = false` (pode ser intencional para widget público), depois decidir a melhor proteção.

## Spec de Referência

- `PROJECT_REQUIREMENTS.md` — item 3 da tabela de Questões Abertas
- `architecture.md` — ADR-002

## Critérios de Aceite

- [x] CA1 — Investigação: verify_jwt=false é intencional — auth via X-API-Key contra org_api_keys
- [x] CA2 — Rate limiting: 20 req/min por IP, fail-open se tabela não existir
- [x] CA3 — N/A: auth intencional, não é bug
- [x] CA4 — Custo já rastreado: help-agent-chat → logAiCost → ai_usage_costs
- [x] CA5 — ADR-009 adicionado em architecture.md

## Restrições

- Não bloquear o funcionamento atual sem entender o caso de uso
- Se for widget público, manter público mas com proteção

---

## Implementação

> Preenchido pelo `@dev` após concluir.

**Status:** concluído — deploy em produção (2026-04-30)

**Commit:** `e3619403` — `feat(STORY-004): agent-api — rate limiting por IP + ADR-009`

**Pendente manual:** aplicar migration `20260430172505_agent_api_rate_limits.sql` via Supabase Dashboard → SQL Editor (CLI não consegue `db push` por dessincronia de histórico de migrations herdadas)

**Arquivos potencialmente modificados:**
- `supabase/config.toml` (se mudar verify_jwt)
- `supabase/functions/agent-api/index.ts`
- `architecture.md` (novo ADR)

---

## QA

> Preenchido pelo `@qa` após implementação.

**Gate:** —

**Checklist:**
- [ ] Decisão documentada (ADR ou comentário claro)
- [ ] Proteção implementada e testada (rate limiting ou JWT)
- [ ] Custo de IA continua sendo rastreado
- [ ] `supabase functions deploy agent-api` executado

**Notas:** —
