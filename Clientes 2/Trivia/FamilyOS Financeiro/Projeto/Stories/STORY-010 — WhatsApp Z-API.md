---
id: STORY-010
titulo: "WhatsApp via Z-API (webhook, comandos rápidos, mensagens proativas, áudio)"
fase: 2
modulo: M6 WhatsApp
status: backlog
prioridade: alta
agente_responsavel: ""
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-010 — WhatsApp via Z-API

## Contexto

WhatsApp como superfície alternativa ao chat web. Mesma memória de longo prazo, comandos rápidos para ações comuns, mensagens proativas automáticas e transcrição de áudio para registro de gastos por voz.

## Spec de Referência

- [[00 - Índice]] — Módulo M6
- Repositório: `PROJECT_REQUIREMENTS.md` — Módulo M6

## Critérios de Aceite

> *(A detalhar ao final da Fase 1)*

- [ ] CA1 — Webhook Z-API: Edge Function recebe mensagem, identifica usuário pelo telefone, roteia para agente
- [ ] CA2 — Comandos: `/resumo`, `/meta`, `/carteira`, `/gasto [valor] [desc]`, `/investir`
- [ ] CA3 — Memória compartilhada: conversa WhatsApp e web compartilham `agent_memories` (janelas de curto prazo separadas)
- [ ] CA4 — Mensagens proativas: vencimento, meta atingida, gasto fora do padrão, revisão mensal
- [ ] CA5 — Áudio: transcrição via Whisper → texto → agente registra gasto
- [ ] CA6 — Webhook validado por secret (header `X-Zapi-Token`)

---

## Notas e Decisões

- Token e instance ID da Z-API ficam em `family_settings`, criptografados — nunca no client
- Cada telefone cadastrado tem perfil próprio mas compartilha contexto familiar
