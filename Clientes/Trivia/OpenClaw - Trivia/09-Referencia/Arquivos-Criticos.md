---
title: Referência — Arquivos Críticos
tags: [referencia, arquivos, configuracao]
created: 2026-04-17
updated: 2026-06-05
---

# Arquivos Críticos

## Gateway e configuração global

| Arquivo | Função |
|---------|--------|
| `/root/.openclaw/openclaw.json` | Config completa do gateway (canais, modelos, agents, bindings) |
| `/root/.openclaw/openclaw.json.bak.[1-4]` | Backups rotativos automáticos |
| `/root/.openclaw/.env` | Variáveis de ambiente (CRM_API_TOKEN, etc.) |
| `/root/.openclaw/cron/jobs.json` | Jobs de cron OpenClaw (hot-reload) |
| `/root/.openclaw/supabase_config.json` | URL + service_role_key do Supabase |
| `/root/.openclaw/supabase_schema.sql` | DDL canônico (fonte para reinstalação) |
| `/root/.openclaw/exec-approvals.json` | Aprovações de comandos exec |
| `/root/.openclaw/CLAUDE.md` | Documentação completa do sistema (fonte histórica) |

## Hooks e captura

| Arquivo | Função |
|---------|--------|
| `/root/.openclaw/hooks/message-capture/handler.js` | Managed hook (Teams + WA @menção) |
| `/root/.openclaw/wa-capture/capture-server.js` | Servidor HTTP captura WA sem @menção |
| `/root/.openclaw/wa-capture/patch.js` | Patch idempotente no dist |
| `/root/.openclaw/wa-capture/agent.js` | Agente standalone do serviço |
| `/usr/lib/node_modules/openclaw/dist/login-5bkOoKyX.js` | Dist patcheado (auto-repatch via path watcher) |

## Ferramentas compartilhadas

| Arquivo | Função |
|---------|--------|
| `/root/.openclaw/workspace/tools/teams-proactive.js` | Envio proativo no Teams |
| `/root/.openclaw/workspace/tools/sales-daily-data.js` | Consolidador JimmyAtende (9 endpoints → ~11KB) |
| `/root/.openclaw/workspace/tools/jimmy-studio-api.js` | API de produção, SLA, sync IG/LI |
| `/root/.openclaw/workspace/tools/captura-mensagens.cjs` | Backup de captura + processamento de áudio |
| `/root/.openclaw/workspace/tools/resumos-diarios.cjs` | Resumos diários (cron 02h) |
| `/root/.openclaw/workspace/tools/tarefas-cli.cjs` | CLI de tarefas e lembretes |
| `/root/.openclaw/workspace/tools/transcribe-audio.js` | Transcrição de áudio |
| `/root/.openclaw/workspace/tools/transcript-monitor.js` | Monitor de transcrições de reuniões |
| `/root/.openclaw/workspace/tools/clawbot-api.js` | Cliente API ClawBot |
| `/root/.openclaw/workspace/tools/extract-docx.js` | Extração de texto de DOCX |
| `/root/.openclaw/workspace/tools/pipeline-summary.js` | Resumo de pipeline |
| `/root/.openclaw/workspace/tools/teams-transcripts.js` | Coleta de transcripts Teams |
| `/root/.openclaw/supabase_integration.cjs` | CLI Supabase (mensagens, cobranças, etc.) |

## Ferramentas dos agencia/sales (locais)

| Arquivo | Função |
|---------|--------|
| `/root/.openclaw/workspace-jimmy-agencia-head/tools/memory-rotate.cjs` | Rotação MEMORY agencia |
| `/root/.openclaw/workspace-jimmy-agencia-head/workspace/tools/verificar-alertas.js` | Verificação SLA sem resposta |
| `/root/.openclaw/workspace-jimmy-agencia-head/workspace/tools/enviar-alertas.js` | Envio de alertas pendentes |
| `/root/.openclaw/workspace-jimmy-agencia-head/workspace/tools/resumo-clientes.js` | Resumo 04h07 diário |
| `/root/.openclaw/workspace-jimmy-sales-head/tools/memory-rotate.cjs` | Rotação MEMORY sales |

## Agentes — arquivos principais por workspace

| Workspace | Estrutura |
|-----------|-----------|
| `/root/.openclaw/workspace` | `IDENTITY.md`, `SOUL.md`, `AGENTS.md`, `BOOTSTRAP.md`, `TOOLS.md`, `USER.md`, `HEARTBEAT.md` |
| `workspace-jimmy-agencia-head` | + `MEMORY.md`, `docs/`, `hooks/`, `memory/`, `sessions/`, `skills/`, `tools/` |
| `workspace-jimmy-sales-head` | + `MEMORY.md`, `avatars/`, `memory/`, `skills/`, `tools/` |
| `workspace-jimmy-cs-head` | + `MEMORY.md`, `avatars/`, `memory/` |

## Skills ativas

| Workspace | Skills |
|-----------|--------|
| agencia-head | `pop-colaboradores`, `producao-trivia`, `sla-agencia`, `sla-publicacoes` |
| sales-head | `analise-reuniao`, `crm-api`, `relatorio-diario-julia`, `vendas-objecoes`, `vendas-posicionamento`, `vendas-reuniao` |

## Logs

| Log | Conteúdo |
|-----|---------|
| `/root/.openclaw/logs/message-capture.log` | Managed hook (Teams + WA @menção) |
| `/root/.openclaw/logs/wa-capture-agent.log` | WA sem @menção |
| `/root/.openclaw/logs/captura-mensagens.log` | Cron de captura backup |
| `/root/.openclaw/logs/resumos-diarios.log` | Cron resumos diários |
| `/root/.openclaw/logs/alertas.log` | Verificar/enviar alertas + resumo-clientes |
| `/root/.openclaw/logs/tarefas-cli.log` | Crons de tarefas |
| `/root/.openclaw/logs/memory-rotate.log` | Rotação MEMORY.md agencia-head |
| `/root/.openclaw/logs/memory-rotate-sales.log` | Rotação MEMORY.md sales-head |
| `/root/.openclaw/logs/session-reset.log` | Reset semanal de sessões |

## Serviços systemd

| Serviço | Função |
|---------|--------|
| `openclaw-gateway` (user) | Gateway OpenClaw |
| `wa-capture-agent` | Servidor HTTP de captura WA (porta 19876) |
| `wa-capture-repatch.path` + `.service` | Re-aplica patch quando dist é alterado |
| `fail2ban` | SSH protection |
| `nginx` | Reverse proxy |
