---
id: STORY-012
titulo: "Corrigir bugs de segurança e qualidade no chat (Jimmy)"
fase: 1
modulo: "Chat / Segurança"
status: concluido
prioridade: P1
agente_responsavel: "@dev"
criado: 2026-04-25
atualizado: 2026-04-25
---

# STORY-012 — Bugs de segurança e qualidade no chat

## Contexto

Após deploy inicial, o `/api/chat` retornava 500 em produção. Investigação revelou múltiplos bugs.

## Bugs corrigidos

### 1. 500 — TypeError: Cannot convert to ByteString (root cause)
`X-Title: "Trívia Studio — Jimmy"` tinha em dash (U+2014, valor 8212) no header HTTP. Node.js 22 / undici rejeita caracteres > 255 em headers. Corrigido: `"Trivia Studio - Jimmy"`.

### 2. Race condition em upsertConversation
`INSERT ... RETURNING id` retornava null em race condition. Corrigido com retry SELECT.

### 3. leadId null causava 400 no Zod
`JSON.stringify({ leadId: null })` enviava `null` mas schema esperava `string | undefined`. Corrigido: `leadId: leadId ?? undefined`.

### 4. Histórico de conversa não enviado
Frontend enviava apenas mensagens do usuário — Jimmy não tinha memória das próprias respostas. Corrigido: envio de histórico completo `user + assistant` alternando.

### 5. Brief em markdown exposto ao usuário
Modelo usava ` ```json ``` ` em vez de `<brief>...</brief>`. Corrigido: instrução no system prompt + fallback em `extractBrief()`.

## Headers de segurança

Adicionados via `netlify.toml`: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.

## Status

**Concluído** — deploy em produção 2026-04-25.
