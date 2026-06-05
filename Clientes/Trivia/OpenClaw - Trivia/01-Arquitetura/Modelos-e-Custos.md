---
title: Modelos e Custos
tags: [modelos, custos, openrouter]
created: 2026-04-17
updated: 2026-06-05
---

# Modelos e Custos

## Stack de modelos

| Uso | Modelo | Provider |
|-----|--------|---------|
| Agentes head + trivia (primário) | `claude-sonnet-4-6` | OpenRouter |
| Fallback / crons leves | `claude-haiku-4-5` | OpenRouter |
| PDF | `claude-sonnet-4-6` (fallback haiku) | OpenRouter |
| Imagem (vision) | `claude-sonnet-4-6-20251001` | Anthropic direto (exceção) |

**Todos via OpenRouter** exceto vision (provider direto Anthropic com modelo pinned por versão; o plugin Anthropic global está desligado por causa de 401 com prefix errado).

Modelos auxiliares declarados em `agents.defaults.models`: `openrouter/google/gemini-3-flash-preview`, `openrouter/google/gemini-2.5-flash-lite` (não usados nos crons; ficam disponíveis para experimentação manual).

## Crons LLM ativos (06/2026)

| Job | Frequência | Custo est. |
|-----|-----------|-----------|
| `agencia-head-resumo-07h` | 5x/sem (07h BRT) | ~$20/mês |
| `agencia-head-rotina-horaria` | 3x/dia útil (10h, 14h, 18h BRT) | ~$30/mês |
| `sales-head-resumo-julia-07h` | 5x/sem (07h BRT) | ~$5-10/mês |
| `sales-head-julia-rotina-horaria` | 3x/dia útil (10h, 14h, 17h BRT) | ~$10-15/mês |
| Respostas reativas (grupos + DMs) | variável | ~$30-40/mês |

**Total estimado:** ~$95-115/mês

## Crons sem LLM (zero custo de modelo)

| Job | Frequência | Onde |
|-----|-----------|------|
| `tarefas-cli cobrar-vencidas` | a cada 5 min | crontab sistema |
| `tarefas-cli escalar-stale` | 8h–18h em dias úteis | crontab sistema |
| `captura-mensagens.cjs` | a cada 15 min | crontab sistema |
| `resumos-diarios.cjs` | 02h diária | crontab sistema |
| `verificar-alertas.js` + `enviar-alertas.js` | a cada 15 min / 15 em 15 min com offset | crontab sistema |
| `resumo-clientes.js` | 04h07 diária | crontab sistema |
| `reset-agent-sessions.py` | segunda 05h UTC | crontab sistema |
| `memory-rotate.cjs` (agencia + sales) | domingo 23h30 e 00h BRT | crontab sistema |

Ver lista completa em [[Crons]].

## Crons desativados

| Nome | Estado | Motivo |
|------|--------|--------|
| `agencia-head-sla-publicacoes` | `enabled: false` em `jobs.json` | SLA de publicação foi integrado ao `resumo-07h` (PASSO 1.5) |
| `agencia-head-panorama-1330` | removido em 14/04 | redundante com 07h + horária (~$26/mês economizados) |
| `sales-head-analise-transcricoes` | removido em 14/04 | substituído por invocação manual (~$35/mês) |
| `security-audit-semanal` | nunca reativado | sem cobertura formal de segurança recorrente |

A `sales-head-rotina-horaria` foi removida em 14/04 mas reintroduzida com escopo mais enxuto em 04/2026 como `sales-head-julia-rotina-horaria` (responde HEARTBEAT_OK quando não há crítico).

Ver decisão histórica em [[2026-04-14-Reducao-Crons]].
