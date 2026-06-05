---
title: "02/04/2026 — Hardening Inicial"
tags: [decisao, seguranca, hardening]
created: 2026-04-17
---

# Hardening Inicial

## O que foi aplicado

- **Fail2Ban** — bloqueia IPs com tentativas SSH repetidas
- **UFW** — portas 22, 80, 443 abertas; 3978 fechada externamente
- `tools.profile: "messaging"` — superfície de ataque reduzida
- `blockStreaming: true` — fix HTTP 403 Teams (v2026.4.1)
- `maxPingPongTurns: 5`
- DMs restritos a JG e Lucas (`dmPolicy: allowlist`)
- Tokens de API movidos para variáveis de ambiente (`/root/.openclaw/.env`)

Ver estado atual em [[Hardening]].
