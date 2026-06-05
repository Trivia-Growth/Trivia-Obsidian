---
title: Visão Geral — Arquitetura OpenClaw
tags: [arquitetura, agentes, roteamento]
created: 2026-04-17
updated: 2026-06-05
---

# Visão Geral

Gateway OpenClaw v2026.4.8 rodando em `srv1544969`. Quatro agentes Claude (1 orquestrador + 3 Heads) cobrem orquestração, operação de agência, vendas e customer success, sobre dois canais (Microsoft Teams e WhatsApp), com captura integral de mensagens no Supabase e camada de tarefas/lembretes com disparo automático.

## Quatro agentes

| Agente | Papel | Workspace |
|--------|-------|-----------|
| [[trivia]] | Orquestrador / roteador | `/root/.openclaw/workspace` |
| [[jimmy-agencia-head]] | Operações internas, SLA, publicações | `/root/.openclaw/workspace-jimmy-agencia-head` |
| [[jimmy-sales-head]] | Pipeline de vendas, coaching Julia | `/root/.openclaw/workspace-jimmy-sales-head` |
| [[jimmy-cs-head]] | Customer success, grupos WhatsApp clientes | `/root/.openclaw/workspace-jimmy-cs-head` |

Existe também `/root/.openclaw/agents/jimmy-ceo` como esqueleto, sem `agent/` populado e sem entrada em `agents.list` no `openclaw.json` — não está ativo.

## Roteamento por canal

| Canal | Origem | Agente |
|-------|--------|--------|
| Teams DM JG / Lucas | DM | trivia |
| Teams grupo Lucas+JG | Grupo interno | trivia |
| Teams grupos clientes (CLI-001 a CLI-008) | Grupos internos Trívia | jimmy-agencia-head |
| Teams grupos internos (Núcleo Trívia, JG+Duda, JG+Bruna, Canal Gestão) | Grupos internos | jimmy-agencia-head |
| Teams grupo Julia+Trívia | Vendas | jimmy-sales-head |
| WhatsApp DMs | DM | trivia (allowlist JG+Lucas) |
| WhatsApp grupos clientes (CLI-002 a CLI-008, +RH Previx, +Diretoria Previx) | Grupos WA | jimmy-cs-head |
| WhatsApp grupos prestadores (3) | Grupos WA | jimmy-agencia-head |
| WhatsApp grupos internos (Duda, Matheus, Diretoria) | Grupos WA | trivia |
| Teams / WhatsApp não casados acima | fallback | trivia |

Ver IDs completos em [[Grupos-Teams]] e [[Grupos-WhatsApp]].

## Fluxo de mensagem (Teams grupo)

```
Mensagem chegando → Dispatcher → managed hook message-capture (captura → Supabase)
                                → Gate requireMention
                                  → se @mencionado: LLM invocado
                                  → se não: descartado (captura já feita)
```

## Fluxo de mensagem (WhatsApp grupo)

```
Mensagem chegando → applyGroupGating
                    → se @mencionado: managed hook → LLM
                    → se não @mencionado: wa-capture-patch → Supabase (fire-and-forget)
```

## Camada cross-cutting: Tarefas e Lembretes (desde 27/04/2026)

Toda demanda persistente atravessa as tabelas `tarefas` e `escalonamentos` do Supabase. Cron `cobrar-vencidas` dispara a cada 5 min (zero LLM, fire-and-forget); cron `escalar-stale` roda a cada hora em horário comercial. Ver [[Tarefas-e-Lembretes]].

## Comunicação inter-agente

- `sessions_send` com `timeoutSeconds: 600` é a primitiva única
- Roteamento `trivia` → Heads é síncrono (1 ack + 1 retorno no mesmo turno)
- A2A `cs-head` → `agencia-head` quando precisa de contexto operacional profundo antes de responder ao cliente
- `agentToAgent.maxPingPongTurns: 5` no gateway

## Modelo padrão

- Primário: `openrouter/anthropic/claude-sonnet-4-6`
- Fallback: `openrouter/anthropic/claude-haiku-4-5`
- 100% via OpenRouter (provider direto Anthropic desativado por erro 401)

Ver detalhes em [[Modelos-e-Custos]] e [[Gateway-OpenClaw]].
