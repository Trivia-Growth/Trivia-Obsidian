---
title: OpenClaw — Trívia Studio
tags: [index, openclaw, trivia]
created: 2026-04-17
updated: 2026-06-05
---

# OpenClaw — Sistema de Agentes Trívia Studio

Gateway de agentes de IA rodando em `srv1544969`. Quatro agentes especializados cobrem orquestração, operação de agência, vendas e customer success — sobre Microsoft Teams e WhatsApp, com captura integral de mensagens no Supabase, tarefas persistentes com disparo automático e escalonamento por SLA de horas úteis.

**Versão OpenClaw:** v2026.4.8
**Última auditoria do vault:** 05/06/2026

## Navegação rápida

| Seção | Conteúdo |
|-------|---------|
| [[Visao-Geral]] | Arquitetura, agentes, modelos, fluxo de mensagens |
| [[Gateway-OpenClaw]] | Configuração do gateway, porta, auth, restart |
| [[Modelos-e-Custos]] | Claude Sonnet/Haiku, OpenRouter, estimativas de custo |
| [[trivia]] | Orquestrador — roteamento, DMs dos owners |
| [[jimmy-agencia-head]] | Operações internas, relatório 07h, SLA, publicações |
| [[jimmy-sales-head]] | Pipeline, coaching Julia, rotina horária |
| [[jimmy-cs-head]] | Customer success, atendimento WhatsApp |
| [[Teams]] | Configuração do canal Teams, groups, quirks |
| [[WhatsApp]] | Canal WA, reconexão, wa-capture-patch |
| [[Managed-Hook]] | Captura de mensagens via hook interno |
| [[WA-Capture-Patch]] | Captura WA sem menção (patch no dist) |
| [[Cron-Captura]] | Cron de captura backup (transcripts + áudios) |
| [[Supabase]] | Tabelas (mensagens, tarefas, alertas, escalonamentos) |
| [[Jimmy-Studio-API]] | API de produção de conteúdo |
| [[JimmyAtende-API]] | CRM de vendas — endpoints, auth |
| [[Hardening]] | Segurança aplicada (Fail2Ban, UFW, anti-injection) |
| [[Crons]] | Todos os jobs automáticos (OpenClaw + sistema) |
| [[Tarefas-e-Lembretes]] | Sistema de tarefas (CLI, disparo, escalonamento) |
| [[Memory-Rotation]] | Rotação do MEMORY.md por agente |
| [[Sessoes-Reset]] | Como resetar sessão saturada |
| [[Reconexao-WhatsApp]] | Procedimento de QR rescan |
| [[Colaboradores]] | IDs Teams, WhatsApp e CLIs |
| [[Grupos-WhatsApp]] | 15 grupos ativos com IDs |
| [[Grupos-Teams]] | Grupos e canais Teams com IDs |
| [[Arquivos-Criticos]] | Mapa de arquivos-chave do sistema |

## Histórico de decisões

- [[2026-04-02-Hardening]]
- [[2026-04-04-Multi-Agente]]
- [[2026-04-06-Canais-e-Hook]]
- [[2026-04-09-WhatsApp-Fix]]
- [[2026-04-13-Agencia-Head-Parametrizacao]]
- [[2026-04-14-Reducao-Crons]]
- [[2026-04-17-Sales-Head-Coach]]
- [[2026-04-27-Sistema-Tarefas]]
