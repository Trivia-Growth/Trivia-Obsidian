---
id: STORY-030
titulo: "Camada 2 — IA: auditoria + redação (nunca calcula)"
fase: 3
modulo: "ai"
status: concluido
prioridade: alta
agente_responsavel: "claude"
criado: 2026-05-18
atualizado: 2026-05-18
---

# STORY-030 — Camada 2 (IA)

## Contexto

Fase 3: IA-auditora (alertas de consistência sobre os KPIs) + IA-redatora
(textos dos 9 slides). Regra de ouro: a IA **nunca calcula/altera números**.

## Critérios de Aceite

- [x] CA1 — `_shared/ai.ts` puro: model `claude-opus-4-7`, system pt-BR,
  JSON schemas **só-texto**, builders, `sanitizeCopy/sanitizeAudit`
- [x] CA2 — `_shared/anthropic.ts` (Deno): structured outputs
  (`output_config.format`), prompt caching no system, effort; `ANTHROPIC_API_KEY`
  só de `Deno.env`
- [x] CA3 — Edge Functions `ai-audit` (alertas, adaptive) e `ai-copywriter`
  (textos, effort low) com JWT+Zod+rate-limit; 503 controlado sem chave
- [x] CA4 — `buildHtml(k, textos?)` sobrescreve insights; números só dos KPIs
- [x] CA5 — Testes node mockados (51 verdes): schemas só-texto, prompt leva os
  números, sanitização bloqueia injeção de número, textos IA não alteram números
- [x] CA6 — Deploy: ai-audit/ai-copywriter ACTIVE; smoke 401/503 OK
- [x] CA7 — UI de revisão humana (seção inline, mockup validado): alertas +
  textos editáveis, gerar/regenerar/aceitar → aplica em `buildHtml`. Falta só
  ativar `ANTHROPIC_API_KEY` no Supabase (passo do JG).

## Implementação

**Status:** `concluido` (backend) · UI e chave pendentes

**Arquivos:** `supabase/functions/_shared/{ai,anthropic,edge-guard}.ts`,
`supabase/functions/{ai-audit,ai-copywriter}/index.ts`,
`supabase/functions/_shared/ai.test.ts`, `src/features/report/lib/buildHtml.ts`
(param `textos?`), alias `@ai-core` (vite/tsconfig/vitest).

## QA

**Gate:** `PASS` (backend). Live: sem auth→401; com auth sem chave→503
"ANTHROPIC_API_KEY não configurada". 51 testes verdes; build+lint.

## Notas e Decisões

- `2026-05-18` — JG: codar agora, **chave depois** (`supabase secrets set
  ANTHROPIC_API_KEY=...`). ADR-008. SEC-007 resolvido por design.
- IA nunca calcula: schemas sem campo numérico + sanitização. Próximo: validar
  mockup da tela de revisão (alertas + textos editáveis, aceitar/editar/
  regenerar, revisão humana obrigatória antes do export).
