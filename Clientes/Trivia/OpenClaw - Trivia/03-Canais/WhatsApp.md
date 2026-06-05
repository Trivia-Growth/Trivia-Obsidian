---
title: Canal — WhatsApp
tags: [canal, whatsapp, configuracao, reconexao]
created: 2026-04-17
updated: 2026-06-05
---

# WhatsApp

## Status atual

**Número:** +55 11 99155-0065 (device :18)
**Estado:** Funcionando (confirmado 09/04/2026)

## Configuração ativa

```json
{
  "groupPolicy": "open",
  "groups": { "*": { "requireMention": true } },
  "dmPolicy": "allowlist"
}
```

**NUNCA usar `groupPolicy: allowlist` no WhatsApp.** Mesma causa do Teams: bloqueava todos os grupos mesmo os listados em `groupAllowFrom`. Corrigido em 09/04/2026.

## Captura de mensagens

| Tipo | Mecanismo |
|------|-----------|
| Mensagens **com** @menção | [[Managed-Hook]] |
| Mensagens **sem** @menção | [[WA-Capture-Patch]] |

Cobertura: 100% das mensagens de grupo, zero duplicação.

## Grupos ativos

15 grupos no `groupAllowFrom`:
- 9 ligados a clientes (7 dos 8 CLIs + 2 grupos extras CLI-008: RH Vagas e Diretoria)
- 3 prestadores
- 3 internos (Interno Duda, Interno Matheus, Diretoria-Trívia)

CLI-001 Arival não tem grupo WhatsApp registrado. Os grupos extras do CLI-008 (RH + Diretoria) são mapeados via `EXTRA_GROUP_MAP` no `wa-capture/capture-server.js` (Supabase só permite 1 `grupo_whatsapp_id` por cliente).

Ver IDs completos em [[Grupos-WhatsApp]].

## Procedimento de reconexão

Ver [[Reconexao-WhatsApp]].

## Verificação rápida

```bash
openclaw channels status --probe
openclaw logs 2>&1 | grep "web-heartbeat" | tail -2
```

## Serviços relacionados

- `wa-capture-agent.service` — captura WA sem @menção, escutando em `127.0.0.1:19876`
- `wa-capture-repatch.path` + `wa-capture-repatch.service` — re-aplica patch no dist quando o pacote é atualizado

## Histórico de problemas

| Data | Problema | Fix |
|------|---------|-----|
| 06/04 | `groupPolicy: allowlist` bloqueando todos os grupos | → `open` |
| 06-09/04 | WhatsApp com rate limit de pre-keys (12 re-pairings) | Trocado para novo número |
| 09/04 | Grupos sem resposta mesmo com número novo | Causa era config, não número — fix `groupPolicy` |
| 12/04 | Erro 401 após restart do gateway | Auto-retry ativo; pode precisar de QR rescan |
