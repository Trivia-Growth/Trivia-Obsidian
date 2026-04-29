---
id: STORY-004
titulo: "Revisar agent-api público — Rate Limiting e Proteção"
fase: 2
modulo: "infra"
status: backlog
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

- [ ] CA1 — Investigação: documentar por que `agent-api` está sem JWT (comentário no código ou ADR)
- [ ] CA2 — Se intencional (widget público): adicionar rate limiting por IP (`X-Forwarded-For`) — máximo N requisições por minuto por IP
- [ ] CA3 — Se não intencional: adicionar JWT validation e atualizar `config.toml`
- [ ] CA4 — Adicionar log de cada chamada com IP, timestamp e custo estimado (já existe `ai_usage_costs`?)
- [ ] CA5 — Documentar a decisão em `architecture.md` como ADR

## Restrições

- Não bloquear o funcionamento atual sem entender o caso de uso
- Se for widget público, manter público mas com proteção

---

## Implementação

> Preenchido pelo `@dev` após concluir.

**Status:** —

**Branch/PR:** —

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
