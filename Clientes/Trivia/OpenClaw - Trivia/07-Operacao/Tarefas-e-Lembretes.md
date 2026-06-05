---
title: Tarefas e Lembretes
tags: [tarefas, lembretes, cron, supabase, escalonamento]
created: 2026-06-05
---

# Tarefas e Lembretes

Sistema de tarefas persistentes com disparo automático e escalonamento por SLA de horas úteis. Adicionado em 27/04/2026 — ver [[2026-04-27-Sistema-Tarefas]].

## Arquitetura

- **CLI:** `/root/.openclaw/workspace/tools/tarefas-cli.cjs` (zero LLM)
- **Tabela:** `tarefas` no Supabase (+ `escalonamentos` para registro de escalações)
- **Crons:** `cobrar-vencidas` (5 min) e `escalar-stale` (8h–18h seg-sex) no crontab do sistema
- **Envio:** `teams-proactive.js` para Teams, `openclaw message send` para WhatsApp
- **Log:** `/root/.openclaw/logs/tarefas-cli.log`

## Comandos

```bash
# Criar
node tarefas-cli.cjs criar \
  --agente <id> --titulo "..." \
  [--due "amanhã 14h"] [--cliente CLI-XXX] \
  [--colaborador <uuid>] \
  [--destinatario-teams <id>] [--destinatario-wa <jid>] \
  [--prioridade normal] [--origem owner_pedido] \
  [--descricao "..."]

# Listar (vivas por padrão)
node tarefas-cli.cjs listar [--agente <id>] [--status pendente] [--vencidas] [--json]

# Concluir / cancelar / adiar (aceita prefixo de 4+ chars)
node tarefas-cli.cjs concluir --id <uuid|prefixo> [--nota "..."]
node tarefas-cli.cjs cancelar --id <uuid|prefixo> [--motivo "..."]
node tarefas-cli.cjs snooze   --id <uuid|prefixo> --ate "amanhã 9h"

# Crons (chamados pelo crontab — não invocar manualmente em prod)
node tarefas-cli.cjs cobrar-vencidas [--agente <id>] [--dry-run]
node tarefas-cli.cjs escalar-stale   [--dry-run]
```

## Parser de datas (BRT)

| Sintaxe | Exemplo |
|---------|---------|
| Relativa em horas | `em 2h`, `daqui 30min` |
| Dia/mês opcional hora | `27/04`, `27/04 18h`, `27/04 18h30` |
| Hoje | `hoje 14h`, `hoje 14h30` |
| Amanhã | `amanha`, `amanha 9h` (default 9h) |
| Dia da semana | `segunda`, `terca 9h`, `sexta-feira 18h30` |
| Atalho | `mais tarde` (= +4h) |
| ISO | `2026-04-27T18:00:00-03:00` |

Sem dia da semana com hora → 9h BRT. Cron `cobrar-vencidas` ignora timezone na hora do disparo (compara em UTC), mas a entrada do usuário é convertida BRT→UTC.

## Ciclo de vida de uma tarefa

```
pendente ──cobrar-vencidas──→ disparada ──6h úteis──→ escalada (→ Diretoria)
   │                              │
   │                              └──concluir──→ concluida
   │
   ├──snooze──→ snoozed (snoozed_until) ──snoozed_until ≤ now──→ pendente
   └──cancelar──→ cancelada
```

## Origens

| `origem` | Quem cria | Comportamento |
|----------|-----------|---------------|
| `owner_pedido` | JG ou Lucas (via trivia) | Se não tem destinatário, dispara na Diretoria (Lucas+JG Teams + WA) |
| `agente_auto` | Heads quando identificam algo a fazer próprio | Auto-cobrança |
| `cron_sla` | Cron de SLA | Cobrar colaborador via grupo Teams interno |
| `cobranca_aberta` | Conversão de alerta tipo `cobranca` | Mantém rastreamento ao alerta original |
| `cs_para_agencia` | A2A `jimmy-cs-head` → `jimmy-agencia-head` | Fila assíncrona, processada no boot do agencia-head |

## Disparo (cron `cobrar-vencidas`)

A cada 5 min, busca tarefas `pendente` com `due_at <= now`. Para cada uma:

1. Monta mensagem com `titulo`, `descricao`, data de criação e ID curto (8 chars)
2. Inclui instrução de fechamento: `responda "feito <id>" para concluir`
3. Envia para `destinatario_teams` (se houver) e `destinatario_wa` (se houver)
4. Se `origem=owner_pedido` e ambos vazios, usa Diretoria como fallback
5. Marca `status=disparada` e grava `disparada_em` no metadata

Cron também reativa tarefas `snoozed` com `snoozed_until` expirado.

## Escalonamento (cron `escalar-stale`)

Em horário comercial (8h–18h BRT, seg-sex), busca:

- `tarefas` com `status=disparada` + `colaborador_id` + 6h úteis desde `disparada_em`
- `alertas` com `tipo=cobranca` + `status=enviado` + 6h úteis desde `created_at`

Para cada item:
1. Envia mensagem `ESCALONAMENTO: ...` na Diretoria (Teams + WA)
2. Registra em `escalonamentos` com `origem_tipo`, `origem_id`, `horas_uteis_decorridas`
3. Atualiza item para `status=escalada` (tarefa) ou `status=escalado` (alerta)

`horasUteisDesde()` conta minutos entre 8h-18h em dias úteis.

## IDs curtos

CLI imprime e aceita prefixos de UUID com 4+ chars. Resolve client-side procurando entre tarefas vivas (pendente/disparada/snoozed/escalada). Erro se ambíguo.

## Integração com o trivia

Quando o owner manda algo como "lembra de X amanhã 14h":

```
trivia → tarefas-cli.cjs criar --agente trivia --titulo "X" --due "amanha 14h" --origem owner_pedido
```

O disparo cuida do lembrete. O agente não fica responsável por gerenciar timer.

## Integração com jimmy-cs-head → jimmy-agencia-head

```
jimmy-cs-head identifica demanda interna → tarefas-cli.cjs criar --agente jimmy-agencia-head --origem cs_para_agencia [...]
```

A `jimmy-agencia-head` lê a fila no boot e processa.

## Manutenção

```bash
# Vencidas pendentes (deveriam ser zero se cron está rodando)
node tarefas-cli.cjs listar --status pendente --vencidas

# Tudo de um agente
node tarefas-cli.cjs listar --agente jimmy-agencia-head --json | jq

# Conferir disparo manualmente (não dispara, só lista)
node tarefas-cli.cjs cobrar-vencidas --dry-run
node tarefas-cli.cjs escalar-stale --dry-run
```
