---
title: "27/04/2026 — Sistema de Tarefas e Lembretes"
tags: [decisao, tarefas, lembretes, cron, supabase, escalonamento, a2a]
created: 2026-04-27
---

# Sistema de Tarefas e Lembretes

## Contexto

Antes de 27/04 o sistema tinha cobranças (`alertas` tipo `cobranca`) e SLA via cron, mas nenhuma camada genérica de "lembrar disso depois". Owner pedia "lembra de X amanhã 14h" → trivia não tinha persistência confiável; a cobrança ficava nas memórias diárias e era esquecida.

Também faltava A2A persistente do CS para a Agência: o `jimmy-cs-head` identificava demanda interna mas dependia de `sessions_send` síncrono, o que não funcionava se o `jimmy-agencia-head` estava em outra sessão ou saturado.

## Decisões

| Item | Decisão |
|------|---------|
| Persistência | Nova tabela `tarefas` no Supabase, separada de `alertas` (cobranças) |
| CLI | `workspace/tools/tarefas-cli.cjs` — zero LLM, scripts puros |
| Disparo | Cron sistema `*/5 * * * *` cobra vencidas e marca como `disparada` |
| Escalonamento | Cron `30 8-18 * * 1-5` escala para Diretoria (Teams + WA) após 6h úteis sem resposta |
| Parser de datas | PT-BR amigável: "amanha 14h", "sexta 9h", "em 2h", "27/04 18h", ISO 8601 |
| Origens | 5 enums: `owner_pedido`, `agente_auto`, `cron_sla`, `cobranca_aberta`, `cs_para_agencia` |
| Fallback de destinatário | `owner_pedido` sem destinatário → Diretoria (Lucas+JG Teams + Diretoria-Trívia WA) |
| Tabela auxiliar | `escalonamentos` para auditoria de quem foi escalado quando |
| Horas úteis | Janela 8h–18h BRT seg-sex |

## Entregáveis

| Entregável | Arquivo |
|-----------|---------|
| Schema SQL | `tarefas` + `escalonamentos` + índices em `/root/.openclaw/supabase_schema.sql` |
| CLI | `/root/.openclaw/workspace/tools/tarefas-cli.cjs` (496 linhas) |
| Cron disparo | `*/5 * * * *` → `cobrar-vencidas` |
| Cron escalonamento | `30 8-18 * * 1-5` → `escalar-stale` |
| Documentação operacional | [[Tarefas-e-Lembretes]] |

## Integração com agentes

- `trivia` registra tarefas `owner_pedido` quando o JG pede algo com prazo
- `jimmy-agencia-head` registra tarefas `agente_auto` para autogestão
- `jimmy-sales-head` mantém cobranças de pipeline em `alertas` (Julia) e tarefas próprias
- `jimmy-cs-head` cria tarefas `cs_para_agencia` em vez de aguardar A2A síncrono

## Observações

- Tarefas têm ID curto (8 chars). Fechamento por prefixo via `concluir --id <prefix>`
- `cobrar-vencidas` também reativa `snoozed` com `snoozed_until` expirado
- `escalar-stale` escala tanto tarefas quanto alertas `cobranca` antigos
- Cron de disparo é `*/5 min` para não saturar Supabase e dar margem de cancelamento humano

Ver operação completa em [[Tarefas-e-Lembretes]] e schema completo em [[Supabase]].
