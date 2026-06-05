---
title: Reset de Sessão Saturada
tags: [sessoes, reset, contexto, operacao]
created: 2026-04-17
updated: 2026-06-05
---

# Reset de Sessão Saturada

## Sintoma

Agente Head retorna `"pending"` em toda chamada do trivia via `sessions_send`. Resposta em ~300ms sem processar.

## Diagnóstico

```bash
openclaw sessions 2>&1 | grep -E "agencia|sales|cs"
```

Se `contextTokens` próximo de 200.000 e `status: failed` → sessão saturada.

## Procedimento de reset

```bash
AGENT=jimmy-agencia-head   # ou jimmy-sales-head, jimmy-cs-head
SESSIONS_DIR=~/.openclaw/agents/$AGENT/sessions

# 1. Descobrir session ID ativo
SESSION_ID=$(python3 -c "
import json
d=json.load(open('$SESSIONS_DIR/sessions.json'))
print(d.get('agent:$AGENT:main',{}).get('sessionId',''))
")

# 2. Arquivar transcript (padrão OpenClaw)
mv $SESSIONS_DIR/${SESSION_ID}.jsonl \
   $SESSIONS_DIR/${SESSION_ID}.jsonl.reset.$(date -u +%Y-%m-%dT%H-%M-%S.000Z)

# 3. Remover entrada do index
python3 -c "
import json, os
f = '$SESSIONS_DIR/sessions.json'
d = json.load(open(f))
d.pop('agent:$AGENT:main', None)
json.dump(d, open(f, 'w'), indent=2)
"
```

## Pós-reset

- A primeira chamada `sessions.send` falha com "session not found"
- O gateway exige `sessions.create` explícito → automático quando trivia chama via `sessions_send`
- Só necessário criar manualmente em testes diretos via WebSocket

## Verificação

```bash
openclaw sessions 2>&1 | grep "$AGENT"
# Deve mostrar contextTokens: 0 ou sessão inexistente
```

## Prevenção

[[Memory-Rotation]] automática semanal mantém MEMORY.md abaixo de 20.000 chars.
Para sessões reativas muito longas, o próprio gateway faz checkpoint automaticamente.

## Incidente de referência

13/04/2026: `agencia-head` com `contextTokens: 200000`, transcript de 240K arquivado. Após reset, respondeu em ~2s com `input: 80` tokens. Ver [[2026-04-13-Agencia-Head-Parametrizacao]].
