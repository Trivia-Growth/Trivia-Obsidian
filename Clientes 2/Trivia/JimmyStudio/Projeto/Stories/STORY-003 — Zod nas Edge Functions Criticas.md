---
id: STORY-003
titulo: "Zod nas Edge Functions Críticas"
fase: 2
modulo: "infra"
status: backlog
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-04-29
atualizado: 2026-04-29
---

# STORY-003 — Zod nas Edge Functions Críticas

## Contexto

127 das 132 Edge Functions não validam input com Zod. Isso significa que dados malformados do cliente podem atingir o banco diretamente. As funções mais críticas são as que processam IA (custoso e sem fallback), billing (financeiro) e dados de usuário (privacidade).

Esta story adiciona Zod nas funções de maior risco — não todas de uma vez, mas as prioritárias.

**Pré-requisito:** STORY-002 (testes) concluída, pois cada schema Zod adicionado deve ter teste de input válido e inválido.

## Spec de Referência

- `PROJECT_REQUIREMENTS.md` — item 2 da tabela de Questões Abertas
- `architecture.md` — ADR-007

## Critérios de Aceite

- [ ] CA1 — `agent-api` valida input com Zod (campos: mensagem, conversationId, contexto)
- [ ] CA2 — `generate-content` valida input com Zod (campos: brandId, tipo, instrução)
- [ ] CA3 — `meta-import-insights` valida input com Zod (campos: accountId, dateRange)
- [ ] CA4 — `appmax-create-order` valida input com Zod (campos: planId, userId, coupon)
- [ ] CA5 — `create-user` valida input com Zod (campos: email, role, orgId)
- [ ] CA6 — Cada função retorna HTTP 400 com mensagem clara quando input é inválido
- [ ] CA7 — Testes unitários para cada schema (input válido + inválido + campos faltando)

## Restrições

- Não alterar a lógica de negócio das funções — apenas adicionar validação na entrada
- Usar o Zod já disponível no `_shared/` se existir, ou importar do npm
- Rollback simples: remover o bloco de validação sem afetar o resto da função

---

## Implementação

> Preenchido pelo `@dev` após concluir.

**Status:** —

**Branch/PR:** —

**Arquivos a modificar:**
- `supabase/functions/agent-api/index.ts`
- `supabase/functions/generate-content/index.ts`
- `supabase/functions/meta-import-insights/index.ts`
- `supabase/functions/appmax-create-order/index.ts`
- `supabase/functions/create-user/index.ts`

---

## QA

> Preenchido pelo `@qa` após implementação.

**Gate:** —

**Checklist:**
- [ ] Schemas Zod corretos e sem over-validation (não rejeitar campos opcionais válidos)
- [ ] HTTP 400 retornado com mensagem útil (não só "Bad Request")
- [ ] Funções existentes continuam funcionando com inputs válidos do frontend
- [ ] Testes unitários dos schemas passando
- [ ] `supabase functions deploy [nome]` executado para cada função alterada

**Notas:** —
