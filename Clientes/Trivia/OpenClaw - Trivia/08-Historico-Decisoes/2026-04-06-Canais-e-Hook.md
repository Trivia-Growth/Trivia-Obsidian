---
title: "06/04/2026 — Canais e Managed Hook"
tags: [decisao, teams, hook, captura]
created: 2026-04-17
---

# Canais e Managed Hook

## Fix Teams: groupPolicy allowlist → open

Mesma causa raiz que WhatsApp (corrigido depois em 09/04): `groupPolicy: allowlist` verificava IDs de grupos contra lista de IDs de usuários → rejeição silenciosa.

## Managed hook message-capture — 3 bugs corrigidos

| Bug | Causa | Fix |
|-----|-------|-----|
| Hook nunca disparava | Evento `message_received` (underscore, plugin) → `message:preprocessed` (colon, internal) | Corrigir nome do evento |
| Handler com parâmetros errados | `(event, context)` → internal hooks passam `(internalEvent)` único | Reescrever handler |
| `resolveClienteId` sempre null | `conversationId` com prefixo `conversation:` não reconhecido no Supabase | Adicionar `stripGroupPrefix()` |

**Resultado:** 81 mensagens capturadas no mesmo dia (CLI-001, CLI-003, CLI-004, CLI-005, CLI-008 e grupos internos).

## requireMention

`false` → `true` em ambos os canais. Captura garantida pelo managed hook; `requireMention` só controla invocação do LLM.
