---
id: STORY-007
titulo: "Streaming SSE no chat do Jimmy"
fase: 1
modulo: "Netlify Functions / ChatModal"
status: pronto
prioridade: P1
agente_responsavel: "@dev"
criado: 2026-04-24
atualizado: 2026-04-25
---

# STORY-007 — Streaming SSE no chat do Jimmy

## Contexto

O chat atualmente espera a resposta completa do modelo antes de exibir — latência percebida alta (~3-5s). Streaming via Server-Sent Events exibiria a resposta token a token, como um "typing" em tempo real.

## Escopo

- `chat.ts`: trocar para `stream: true` na chamada OpenRouter, retornar SSE.
- `ChatModal.tsx`: consumir stream via `EventSource` ou `fetch` com `getReader()`.
- Extrair o bloco `<brief>` do stream completo ao fechar.

## Status

**Pronto** (aguardando implementação). Não iniciado — dependências de STORY-008 e STORY-012 concluídas.
