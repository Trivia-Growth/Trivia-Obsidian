---
title: Crons — Jobs Automáticos
tags: [crons, jobs, operacao, schedule]
created: 2026-04-17
updated: 2026-06-05
---

# Jobs Automáticos

## Regra crítica: crons de script → crontab do sistema, não OpenClaw

Scripts Node.js/Python sem LLM **devem** usar `crontab` do sistema. OpenClaw cron com `kind: systemEvent` envia "Please relay this reminder" para o trivia → spam na DM do JG.

**Cron OpenClaw:** apenas jobs `agentTurn` com `delivery.mode: none`.

---

## Crons OpenClaw (com LLM)

Arquivo: `/root/.openclaw/cron/jobs.json` (hot-reload). Listar com `openclaw cron list`.

| ID | Nome | Schedule (BRT) | Agente | Estado | Função |
|----|------|---------------|--------|--------|--------|
| `93e915fa` | `agencia-head-resumo-07h` | 07h seg-sex | jimmy-agencia-head | enabled | Relatório por cliente + SLA publicação integrado |
| `8b74152b` | `agencia-head-rotina-horaria` | 10h, 14h, 18h seg-sex | jimmy-agencia-head | enabled | SLA check + cobranças (HEARTBEAT_OK se OK) |
| `9918d77d` | `agencia-head-sla-publicacoes` | 13h seg-sex | jimmy-agencia-head | **disabled** | Integrado ao resumo-07h |
| `6dcf3cc2` | `sales-head-resumo-julia-07h` | 07h seg-sex | jimmy-sales-head | enabled | Relatório coaching Julia |
| `b8f21c3a` | `sales-head-julia-rotina-horaria` | 10h, 14h, 17h seg-sex | jimmy-sales-head | enabled | Rotina pipeline (HEARTBEAT_OK se OK) |

Sessão de execução (todos): `agent:jimmy-<head>:main`. `delivery.mode: none`.

```bash
# Ativar / desativar: editar jobs.json → "enabled": true/false
# Verificar próxima execução
openclaw cron list
```

---

## Crontab do sistema (sem LLM)

```cron
# Captura mensagens (backup via transcripts) — a cada 15 min
*/15 * * * * node /root/.openclaw/workspace/tools/captura-mensagens.cjs >> /root/.openclaw/logs/captura-mensagens.log 2>&1

# Resumos diários — 02h UTC (23h BRT)
0 2 * * * node /root/.openclaw/workspace/tools/resumos-diarios.cjs >> /root/.openclaw/logs/resumos-diarios.log 2>&1

# Verificação de alertas SLA (sem resposta) — a cada 15 min
*/15 * * * * node /root/.openclaw/workspace-jimmy-agencia-head/workspace/tools/verificar-alertas.js >> /root/.openclaw/logs/alertas.log 2>&1

# Envio de alertas pendentes — minutos 2/17/32/47 de cada hora
2,17,32,47 * * * * node /root/.openclaw/workspace-jimmy-agencia-head/workspace/tools/enviar-alertas.js >> /root/.openclaw/logs/alertas.log 2>&1

# Resumo clientes — 04h07 UTC diária
4 7 * * * node /root/.openclaw/workspace-jimmy-agencia-head/workspace/tools/resumo-clientes.js >> /root/.openclaw/logs/alertas.log 2>&1

# Reset semanal de sessões — segunda 05h UTC (02h BRT)
0 5 * * 1 python3 /root/.openclaw/workspace/tools/reset-agent-sessions.py >> /root/.openclaw/logs/session-reset.log 2>&1

# Memory rotate agencia-head — domingo 23h30 BRT (seg 02h30 UTC)
30 2 * * 1 node /root/.openclaw/workspace-jimmy-agencia-head/tools/memory-rotate.cjs >> /root/.openclaw/logs/memory-rotate.log 2>&1

# Memory rotate sales-head — domingo 00h BRT (seg 03h UTC)
0 3 * * 1 node /root/.openclaw/workspace-jimmy-sales-head/tools/memory-rotate.cjs >> /root/.openclaw/logs/memory-rotate-sales.log 2>&1

# Tarefas: cobrar vencidas a cada 5 min
*/5 * * * * node /root/.openclaw/workspace/tools/tarefas-cli.cjs cobrar-vencidas >> /root/.openclaw/logs/tarefas-cli.log 2>&1

# Tarefas: escalar ignoradas 6h úteis (horário comercial seg-sex)
30 8-18 * * 1-5 node /root/.openclaw/workspace/tools/tarefas-cli.cjs escalar-stale >> /root/.openclaw/logs/tarefas-cli.log 2>&1
```

Editar com `crontab -e`. Conferir com `crontab -l`.

---

## Crons removidos / desativados (histórico)

| Nome | Quando | Motivo | Economia |
|------|--------|--------|---------|
| `agencia-head-panorama-1330` | 14/04/2026 | Redundante com 07h + horária | ~$26/mês |
| `sales-head-analise-transcricoes` | 14/04/2026 | Substituído por invocação manual | ~$35/mês |
| `sales-head-rotina-horaria` (versão pesada) | 14/04/2026 | Volume de pipeline não justificava | ~$40/mês |
| `agencia-head-sla-publicacoes` | 04/2026 | Integrado ao `resumo-07h` (passo 1.5) | $15/mês evitado |
| `security-audit-semanal` | não reativado | sem cobertura formal hoje | — |

A `sales-head-julia-rotina-horaria` é a versão escopada da `sales-head-rotina-horaria` antiga (HEARTBEAT_OK quando inócuo).

Ver [[2026-04-14-Reducao-Crons]] e [[2026-04-27-Sistema-Tarefas]].
