---
title: Agente — trivia
tags: [agente, orquestrador, roteamento]
created: 2026-04-17
updated: 2026-06-05
aliases: [trivia, orquestrador]
---

# trivia

**Papel:** Orquestrador e roteador principal (Chief of Staff Digital).
**Workspace:** `/root/.openclaw/workspace`
**Agent dir:** `/root/.openclaw/agents/main`
**Modelo:** `openrouter/anthropic/claude-sonnet-4-6`
**Identidade:** `Jimmy` ⛛️

## O que faz

- Recebe mensagens dos owners (JG e Lucas) via Teams DM e WhatsApp DM
- Roteia para os Heads via `sessions_send`, sempre síncrono no mesmo turno
- Repassa retorno integral para o owner correto
- Atende grupos internos de baixo tráfego (Diretoria WA, Duda, Matheus, JG+Lucas Teams)

## Canais atendidos

| Canal | ID / Identificador |
|-------|--------------------|
| Teams DM JG | `94ef36b4-4163-4f4f-85c1-b4bc3a519119` |
| Teams DM Lucas | `0cf2bf1a-3c56-4f22-a592-055e3b71b0ed` |
| Teams grupo Lucas+JG | `19:00d834dc8a704b3cab02606096560976@thread.v2` |
| WhatsApp DM JG | `5511910054482` |
| WhatsApp DM Lucas | `5511978963607` |
| WhatsApp Diretoria Trívia | `120363407263988714@g.us` |
| WhatsApp Interno Duda / Matheus | `120363404924721353` / `120363424587623885` |

## Protocolo de roteamento (resumo)

1. Identifica o Head pelo domínio do pedido
2. Emite **uma** linha de ack: `"Acionei o <head>, aguarda um instante."`
3. Chama `sessions_send(sessionKey, message, timeoutSeconds: 600)` e aguarda
4. Recebe o retorno e entrega integralmente como **próxima mensagem do mesmo turno**

Ack e retorno são partes do mesmo turno. Encerrar depois do ack é falha operacional. Multi-head: aciona sequencialmente, consolida e entrega num único bloco final.

## SessionKeys de destino

| Destino | SessionKey |
|---------|-----------|
| Agência | `agent:jimmy-agencia-head:main` |
| Vendas | `agent:jimmy-sales-head:main` |
| Customer Success | `agent:jimmy-cs-head:main` |

## Quando responder direto (sem acionar Head)

- Perguntas gerais ou estratégicas que não envolvem dados de área
- Consultas rápidas via scripts em `workspace/tools/` (captura, mensagens Supabase, resumos)

## Relação com outros agentes

- → [[jimmy-agencia-head]] (operações, SLA, clientes, equipe)
- → [[jimmy-sales-head]] (vendas, pipeline, Julia, JimmyAtende)
- → [[jimmy-cs-head]] (CS, atendimento WA dos clientes)

## Arquivos principais

- `AGENTS.md` — regras + protocolo de roteamento + ack policy
- `SOUL.md` — identidade Trívia + serviços + tom
- `BOOTSTRAP.md` — sequência de boot em 5 passos
- `TOOLS.md` — scripts compartilhados (teams-proactive, supabase, tarefas-cli)
- `USER.md` — perfis de JG e Lucas
