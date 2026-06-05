---
title: Captura — Managed Hook
tags: [captura, hook, supabase, mensagens]
created: 2026-04-17
updated: 2026-06-05
---

# Managed Hook — message-capture

**Arquivo:** `/root/.openclaw/hooks/message-capture/handler.js`
**Evento:** `message:preprocessed`
**Log:** `/root/.openclaw/logs/message-capture.log`

## Cobertura

| Canal | Cobertura |
|-------|-----------|
| Teams | **TODAS** as mensagens de grupo (gate de menção é no LLM, não no dispatcher) |
| WhatsApp | Apenas mensagens **com @menção** (sem menção: bloqueadas antes do hook) |

## O que captura

- `bodyForAgent` — texto completo (inclui transcrição de áudio)
- Extração de conteúdo `.docx`
- `messageId`
- Dados de contexto: grupo, remetente, canal, direção

## Destino

Tabela Supabase `mensagens`:

| Campo | Conteúdo |
|-------|---------|
| `cliente_id` | CLI-XXX resolvido pelo conversationId |
| `canal` | `teams` ou `whatsapp` |
| `direcao` | `entrada` ou `saida` |
| `remetente` | Nome/ID do remetente |
| `conteudo` | Texto da mensagem |
| `metadata` | JSON com dados extras |
| `processado` | bool |

## Bugs corrigidos (06/04/2026)

1. Evento `message_received` (underscore) → `message:preprocessed` (colon)
2. Handler `(event, context)` → `(internalEvent)` — internal hooks passam objeto único
3. `conversationId` com prefixo `conversation:` → adicionado `stripGroupPrefix()` antes do lookup Supabase

## Classificação remetente

O handler identifica colaboradores Trívia por número WA (`COLLABORATOR_NUMBERS`) ou Teams user ID (`COLLABORATOR_TEAMS_IDS`) e define `direcao` = `saida`. Caso contrário, `entrada`.

## Workspaces alternativos

Mesma estrutura existe em `workspace/hooks/message-capture/` e `workspace-jimmy-agencia-head/hooks/message-capture/`. A versão **managed global** em `/root/.openclaw/hooks/` precede e desabilita as outras.

## Complemento necessário para WA

Mensagens WA **sem @menção** não passam pelo hook (blocked antes). Capturadas pelo [[WA-Capture-Patch]].

Ver também [[Cron-Captura]] para backup via transcripts do LLM.
