---
title: Canal — Microsoft Teams
tags: [canal, teams, configuracao]
created: 2026-04-17
updated: 2026-06-05
---

# Microsoft Teams

## Configuração ativa

```json
{
  "groupPolicy": "open",
  "requireMention": true,
  "dmPolicy": "allowlist",
  "blockStreaming": true,
  "dangerouslyAllowNameMatching": true
}
```

## Por que `groupPolicy: open`

`allowlist` verificava o AAD ObjectId do remetente contra `groupAllowFrom` (que contém IDs de grupos, não de usuários) → rejeição silenciosa de todas as mensagens. Corrigido em 06/04/2026 para `open`.

**NUNCA usar `groupPolicy: allowlist` no Teams.**

## Por que `requireMention: true`

O managed hook captura todas as mensagens **antes** do gate de menção. `requireMention` controla apenas se o LLM é invocado — não a captura. Resultado: 100% das mensagens vão para o Supabase; LLM só responde quando @mencionado.

## Por que `blockStreaming: true`

Fix para HTTP 403 `ContentStreamNotAllowed` introduzido no OpenClaw v2026.4.1.

## Grupos e canais

Ver [[Grupos-Teams]] para IDs completos.

## Envio proativo

```bash
node /root/.openclaw/workspace/tools/teams-proactive.js send \
  --chat "<chat_id>" \
  --message "<texto>"
```

## Overrides por grupo / DM

Todos os grupos têm `tools.deny: ["fs.*","exec.*"]` por padrão. Exceções com `alsoAllow` (acesso total a fs/exec):

- DM JG: `94ef36b4-4163-4f4f-85c1-b4bc3a519119`
- DM Lucas: `0cf2bf1a-3c56-4f22-a592-055e3b71b0ed`
- Grupo Lucas+JG: `19:00d834dc8a704b3cab02606096560976@thread.v2`

## App registration

| Campo | Valor |
|-------|-------|
| `appId` | `6225a3a9-02a4-4661-a796-a4f2d559756d` |
| `tenantId` | `8363fc19-5aaa-4b33-83a3-00638515a19a` |
| `appPassword` | em `openclaw.json > channels.msteams.appPassword` |

## Quirks conhecidos

- `requireMention: true` no Teams **não** bloqueia mensagens antes do dispatcher (diferente de WA/Telegram). Todas chegam ao dispatcher; o LLM só é invocado com `WasMentioned: true`.
- Canal Gestão Agência: incoming webhook é mecanismo connector, incompatível com bot framework. `sessions_history` sempre vazio para esse canal.
- SessionKey de canal usa kind `channel:`, não `group:`: `agent:jimmy-agencia-head:msteams:channel:19:mr1a9bdc...`
