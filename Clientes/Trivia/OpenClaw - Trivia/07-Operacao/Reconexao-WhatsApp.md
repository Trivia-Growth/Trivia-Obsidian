---
title: Reconexão WhatsApp
tags: [whatsapp, reconexao, qr, operacao]
created: 2026-04-17
updated: 2026-06-05
---

# Reconexão WhatsApp

## Quando é necessário

Apenas se `registered: false`. Verificar antes:

```bash
openclaw channels status --probe
```

Se `registered: True` → não precisa reconectar.

## Procedimento

```bash
# 1. Limpar sessão
openclaw channels logout

# 2. Reiniciar gateway
openclaw gateway restart

# 3. Verificar "not linked" antes de continuar
openclaw channels status

# 4. Gerar QR (só após confirmar "not linked")
openclaw channels login
```

Escanear via **WhatsApp > Configurações > Aparelhos conectados > Conectar aparelho**.

## CRÍTICO: não reiniciar após scan

O WhatsApp envia código 515 (restart automático) — deixar acontecer naturalmente.

Aguardar 3-5 minutos após "✅ Linked after restart". Verificar `registered: True`.

**Se ainda `false` após 5 min:** aguardar até o dia seguinte. Não tentar múltiplos scans no mesmo dia (causa rate limit de pre-keys — ocorreu em abr/2026 com 12 re-pairings).

## Após reconexão

O bot **já estava em todos os 13 grupos** (número +55 11 99155-0065 adicionado anteriormente). Não é necessário adicionar ao grupos novamente.

## Verificação

```bash
openclaw channels status --probe
openclaw logs 2>&1 | grep "web-heartbeat" | tail -2
```

## Histórico de incidentes

| Data | Problema |
|------|---------|
| 06/04 | rate limit pre-keys após 12 QR scans → trocar para novo número resolveu (depois descobriu-se que o problema real era `groupPolicy: allowlist`) |
| 09/04 | Novo número +55 11 970692737 usado temporariamente → revertido para 99155-0065 |
| 12/04 | Erro 401 após restart → auto-retry ativo, resolveu sozinho |
