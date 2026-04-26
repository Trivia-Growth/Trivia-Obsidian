---
id: STORY-002
titulo: "Inserir lead no banco + linkar conversation"
fase: 1
modulo: "Landing / ChatModal + netlify/functions"
status: concluido
prioridade: P0
agente_responsavel: "@dev"
criado: 2026-04-24
atualizado: 2026-04-25
---

# STORY-002 — Lead no banco + linkar conversation

## Contexto

O modal de chat coletava nome/email/empresa mas não persistia no banco. As conversas não tinham vínculo com um lead, impossibilitando o acompanhamento comercial.

## Solução

- Netlify Function `lead.ts`: recebe nome/email/empresa, upsert na tabela `leads`, retorna `leadId`.
- `ChatModal.tsx`: ao concluir identidade, chama `/api/lead` e guarda `leadId` no state.
- `chat.ts`: aceita `leadId` opcional e vincula a conversa ao lead na tabela `conversations`.

## Status

**Concluído** — deploy em produção 2026-04-25.
