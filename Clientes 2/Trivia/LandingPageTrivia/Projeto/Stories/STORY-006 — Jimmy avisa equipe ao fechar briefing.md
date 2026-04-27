---
id: STORY-006
titulo: "Jimmy avisa a equipe quando um briefing termina"
fase: 1
modulo: "Netlify Functions / Jimmy"
status: concluido
prioridade: P1
agente_responsavel: "@dev"
criado: 2026-04-24
atualizado: 2026-04-25
---

# STORY-006 — Jimmy avisa equipe ao fechar briefing

## Contexto

Quando o Jimmy encerrava um diagnóstico (`ready_to_close: true`), nenhuma notificação era enviada à equipe Trívia — o lead ficava "perdido" no banco sem alerta.

## Solução

- `chat.ts` detecta `ready_to_close: true` no bloco `<brief>` extraído da resposta do modelo.
- Chama `sendBriefingEmail()` (`src/lib/email.ts`) com resumo do briefing capturado.
- Status do lead atualizado para `"hot"` no banco.
- Conversa marcada como `"complete"` com `ended_at`.

## Bloco `<brief>` (formato)

```json
{
  "stage": "closing",
  "captured": { "site": "...", "instagram": "...", ... },
  "ready_to_close": true
}
```

## Status

**Concluído** — deploy em produção 2026-04-25.
