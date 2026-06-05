---
title: Gateway OpenClaw
tags: [gateway, configuracao, operacao]
created: 2026-04-17
updated: 2026-06-05
---

# Gateway OpenClaw

**Versão atual:** v2026.4.8 (pinned em `/usr/lib/node_modules/openclaw`)
**Porta:** 18789 (loopback)
**Auth:** token em `/root/.openclaw/openclaw.json > gateway.auth.token`
**Config principal:** `/root/.openclaw/openclaw.json`
**Bind:** loopback (sem Tailscale; `tailscale.mode: "off"`)

## Comandos essenciais

```bash
# Status geral
openclaw status

# Listar sessões dos agentes head
openclaw sessions 2>&1 | grep -E "agencia|sales|cs"

# Listar crons OpenClaw (LLM)
openclaw cron list

# Logs em tempo real
openclaw logs

# Restart (soft — reconecta WA, mantém processo Node.js)
openclaw gateway restart

# Restart completo (carrega mudanças no dist — wa-capture-patch, etc.)
systemctl --user restart openclaw-gateway
```

> **ATENÇÃO:** `openclaw gateway restart` não recarrega o dist. Para mudanças no código do gateway, usar `systemctl --user restart openclaw-gateway`. O `wa-capture-repatch.path` cuida do caso de update automático do pacote.

## Configuração de canais relevante

### Teams
- `groupPolicy: open` — aceita todos os grupos (nunca usar `allowlist`, causa rejeição silenciosa)
- `requireMention: true` — LLM só invocado com @menção; captura ocorre antes pelo hook
- `dmPolicy: allowlist` — DMs só de JG e Lucas
- `blockStreaming: true` e `blockStreamingCoalesce.idleMs: 5000` — fix HTTP 403 `ContentStreamNotAllowed` (v2026.4.1)
- `dangerouslyAllowNameMatching: true`
- Overrides por grupo: `tools.deny: ["fs.*","exec.*"]` em todos os grupos, com `alsoAllow` nas DMs de JG/Lucas e no grupo Lucas+JG

### WhatsApp
- `groupPolicy: open` — idem Teams, nunca usar `allowlist`
- `groups["*"].requireMention: true`
- `dmPolicy: allowlist` — só JG (5511910054482) e Lucas (5511978963607)
- `groupAllowFrom` com 15 grupos (ver [[Grupos-WhatsApp]])

## Gateway → nodes (CLI/exec) — denylist

```json
gateway.nodes.denyCommands: [
  "camera.snap", "camera.clip", "screen.record",
  "contacts.add", "calendar.add", "reminders.add", "sms.send"
]
```

## Plugins ativos

| Plugin | Estado | Notas |
|--------|--------|-------|
| `openrouter` | habilitado | provider primário |
| `msteams` | habilitado | bot framework com appId/appPassword/tenantId |
| `perplexity` | habilitado | web search |
| `anthropic` | **desabilitado** | causa 401 com prefix errado |

## Hooks internos habilitados

- `session-memory`
- `command-logger`
- `message-capture` (managed — ver [[Managed-Hook]])

## Mídia

- Áudio: transcrição via `workspace/tools/transcribe-audio.js` (echo `🎙️ "{transcript}"`)
- Imagem: model `claude-sonnet-4-6-20251001` (Anthropic direto, exceção pontual)

## Arquivos de configuração

| Arquivo | Conteúdo |
|---------|---------|
| `/root/.openclaw/openclaw.json` | Config completa do gateway (com `.bak.N` rotativos) |
| `/root/.openclaw/.env` | Variáveis de ambiente (CRM_API_TOKEN, etc.) |
| `/root/.openclaw/cron/jobs.json` | Jobs de cron OpenClaw (hot-reload automático) |
| `/root/.openclaw/hooks/message-capture/handler.js` | Managed hook de captura (global) |
| `/root/.openclaw/supabase_config.json` | URL + service_role_key do Supabase |
| `/root/.openclaw/supabase_integration.cjs` | Integração CommonJS (atualizada 18/05/2026) |
| `/root/.openclaw/supabase_schema.sql` | DDL canônico — fonte para reinstalação |
| `/root/.openclaw/exec-approvals.json` | Aprovações de comandos exec |

Ver também [[Reconexao-WhatsApp]] e [[Sessoes-Reset]].
