---
id: STORY-009
titulo: "Analytics e consent LGPD"
fase: 1
modulo: "Analytics / LGPD"
status: concluido
prioridade: P2
agente_responsavel: "@dev"
criado: 2026-04-24
atualizado: 2026-04-25
---

# STORY-009 — Analytics e consent LGPD

## Contexto

O site não tinha rastreamento de eventos (abertura de chat, envio de lead, mensagens) nem conformidade com LGPD para coleta de dados.

## Solução

- Banner de consentimento LGPD com opções aceitar/rejeitar.
- `src/lib/analytics.ts`: wrapper que só dispara eventos se consent ativo.
- Eventos rastreados: `jimmy_chat_opened`, `jimmy_lead_captured`, `jimmy_first_message`, `jimmy_message_sent`, `jimmy_conversation_complete`.
- Integração com PostHog (opcional — via env var `VITE_POSTHOG_KEY`).

## Status

**Concluído** — deploy em produção 2026-04-25.
