---
title: Captura — Cron de Backup
tags: [captura, cron, supabase]
created: 2026-04-17
updated: 2026-06-05
---

# Cron de Captura (complemento/backup)

**Script:** `/root/.openclaw/workspace/tools/captura-mensagens.cjs`
**Frequência:** A cada 15 minutos (crontab do sistema)
**Log:** `/root/.openclaw/logs/captura-mensagens.log`
**Estado de áudios:** `/root/.openclaw/logs/captura-audios-state.json`

## O que faz

1. Lê transcripts de sessão (`.jsonl`) e indexa mensagens que o agente processou. Complementa o [[Managed-Hook]] para sessões onde o LLM foi invocado.
2. Processa áudios em `/root/.openclaw/media/inbound/` (.ogg/.opus/.m4a/.mp3), chama `transcribe-audio.js`, guarda estado por arquivo em `captura-audios-state.json` e indexa transcrições no Supabase.

## Quando é necessário

Cobre o caso onde a mensagem passou pelo LLM mas o hook falhou ou ainda não estava configurado. Na prática, com hook + wa-capture-patch ativos, este cron é backup redundante.

## Tabela de cobertura completa

| Camada | Cobre |
|--------|-------|
| [[Managed-Hook]] | Teams (tudo) + WA com @menção |
| [[WA-Capture-Patch]] | WA grupos sem @menção |
| Cron captura-mensagens | Backup via transcripts LLM |

**Cobertura total:** 100% das mensagens, zero duplicação (testado e verificado em 10/04/2026).
