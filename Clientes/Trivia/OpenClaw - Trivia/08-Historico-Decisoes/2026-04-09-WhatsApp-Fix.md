---
title: "09/04/2026 — WhatsApp: Fix crítico de groupPolicy"
tags: [decisao, whatsapp, canal, fix]
created: 2026-04-17
---

# WhatsApp — Fix Crítico de groupPolicy

## Problema

Grupos WhatsApp não respondiam. Causa raiz: `groupPolicy: allowlist` bloqueava **todos** os grupos silenciosamente — mesmo os listados em `groupAllowFrom`. A comparação de IDs falhava antes do `web-inbound`, zerando `lastInboundAt`.

Mesma causa raiz do bug Teams corrigido em 06/04.

## Fix

```json
"channels.whatsapp.groupPolicy": "allowlist" → "open"
```

**Regra permanente:** nunca usar `groupPolicy: allowlist` em nenhum canal.

## Outros itens

- Número WA trocado temporariamente para +55 11 970692737 (device :2) → revertido para +55 11 99155-0065 (device :18) quando descoberta a causa real
- 3 bindings internos adicionados ao `openclaw.json` (Diretoria, Duda, Matheus → trivia)
- Modelo trivia corrigido para `openrouter/anthropic/claude-haiku-4-5` (prefix errado causava 401)
- `wa-capture-patch` ativado permanentemente para captura de WA sem @menção
