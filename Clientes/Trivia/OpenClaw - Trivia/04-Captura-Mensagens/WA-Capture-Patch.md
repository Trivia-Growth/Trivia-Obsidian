---
title: Captura — WA-Capture-Patch
tags: [captura, whatsapp, patch, wa-capture]
created: 2026-04-17
updated: 2026-06-05
---

# WA-Capture-Patch

Solução para capturar mensagens WhatsApp **sem @menção** — que o managed hook não alcança.

## Problema resolvido

`applyGroupGating` no dist do OpenClaw faz `early return` antes do evento `message:preprocessed` disparar quando a mensagem não tem @menção. O hook nunca chega a rodar.

## Solução

Patch inserido **no dist** (`login-5bkOoKyX.js`) antes do early return. Fire-and-forget para servidor HTTP local.

## Componentes

| Componente | Caminho |
|-----------|---------|
| Patch no dist | `/usr/lib/node_modules/openclaw/dist/login-5bkOoKyX.js` |
| Servidor captura | `/root/.openclaw/wa-capture/capture-server.js` (porta `127.0.0.1:19876`) |
| Script do patch | `/root/.openclaw/wa-capture/patch.js` |
| Serviço | `wa-capture-agent.service` (system) |
| Auto-repatch | `wa-capture-repatch.path` + `wa-capture-repatch.service` |
| Log | `/root/.openclaw/logs/wa-capture-agent.log` |

## Linha ativa no dist (v2)

```javascript
if(params.msg.chatType==="group"&&!effectiveWasMentioned){
  fetch("http://127.0.0.1:19876/capture",{method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({body,conversationId,from,senderName,senderE164,timestamp,wasMentioned})
  }).catch(()=>{});
}
```

`&&!effectiveWasMentioned` evita duplicação com mensagens @mencionadas (capturadas pelo hook).

## Idempotência do patch.js

- v2 já aplicada → skip
- v1 detectada (sem `&&!effectiveWasMentioned`) → upgrade para v2
- sem patch → aplica v2 do zero

## Como re-aplicar manualmente

```bash
node /root/.openclaw/wa-capture/patch.js
systemctl --user restart openclaw-gateway
```

> **ATENÇÃO:** Usar `systemctl --user restart`, não `openclaw gateway restart`. O soft-restart não recarrega mudanças no dist.

## Auto-repatch

`wa-capture-repatch.path` monitora o diretório `dist/`. Se o OpenClaw atualizar e sobrescrever o arquivo, o serviço de repatch é acionado automaticamente: re-aplica o patch e reinicia o gateway.

## EXTRA_GROUP_MAP no capture-server

Supabase `clientes` só permite um `grupo_whatsapp_id` por linha. Grupos adicionais mapeados manualmente em `capture-server.js`:

```javascript
const EXTRA_GROUP_MAP = {
  '120363405672153287@g.us': 'CLI-008', // RH Previx — Divulgação de vagas
  '120363427032711381@g.us': 'CLI-008', // Previx — Diretoria
};
```

## Detecção de injeção (parte do [[Hardening]])

`capture-server.js` aplica `INJECTION_PATTERNS` em todo conteúdo capturado. Quando casa, marca o registro como `suspicious` no metadata para alimentar telemetria. Padrões incluem variações de "ignore previous instructions", marcadores de system prompt, jailbreak DAN, persona-switch e tentativas de listagem cross-cliente.

## Identificação de colaboradores

`COLLABORATOR_NUMBERS` carrega os 6 números (Bruna, Matheus, Fernanda, Duda, JG, Lucas) para classificar `direcao` corretamente como `saida` quando o remetente é Trívia.
