---
title: Integração — Supabase
tags: [supabase, banco, mensagens, cobrancas, tarefas]
created: 2026-04-17
updated: 2026-06-05
---

# Supabase

**URL:** `https://lcfzuzxafzvbkeryesxc.supabase.co`
**Config:** `/root/.openclaw/supabase_config.json` (URL + service_role_key)
**Schema canônico:** `/root/.openclaw/supabase_schema.sql`
**Integração CommonJS:** `/root/.openclaw/supabase_integration.cjs` (atualizada 18/05/2026)
**Schema integration JS legado:** `/root/.openclaw/supabase_integration.js` (não usar)

## Tabelas

### `clientes`
PK string `CLI-XXX`. Colunas relevantes: `nome`, `responsavel`, `grupo_teams_id`, `grupo_whatsapp_id`. Carga inicial via DDL com CLI-001 a CLI-007.

### `colaboradores`
PK UUID. `nome`, `teams_user_id`, `whatsapp_numero`.

### `mensagens`
Histórico de todas as mensagens capturadas (pelos hooks e pelo wa-capture).

| Campo | Tipo | Conteúdo |
|-------|------|---------|
| `cliente_id` | text FK | CLI-XXX |
| `canal` | enum | `teams`, `whatsapp` |
| `direcao` | enum | `entrada`, `saida` |
| `remetente` | text | Nome ou ID |
| `conteudo` | text | Texto da mensagem |
| `metadata` | jsonb | Dados extras (groupId, messageId, transcrição de áudio, flag suspicious) |
| `processado` | bool | Flag de processamento |

### `alertas` (cobranças, SLA, reclamações)

| Campo | Conteúdo |
|-------|----------|
| `tipo` | `sem_resposta`, `prazo`, `reclamacao`, `outro`, `cobranca` |
| `descricao` | texto |
| `destinatario_teams` | obrigatório (fallback `julia` quando sem colaborador) |
| `status` | `pendente`, `enviado`, `resolvido` |
| `mensagem_origem_id` | FK opcional para `mensagens` |

### `sessoes_agente`
Snapshot opcional de contexto de sessão por cliente.

### `tarefas` (criada em 27/04/2026)

| Campo | Conteúdo |
|-------|----------|
| `origem` | `owner_pedido`, `agente_auto`, `cron_sla`, `cobranca_aberta`, `cs_para_agencia` |
| `agente_dono` | `trivia`, `jimmy-agencia-head`, `jimmy-sales-head`, `jimmy-cs-head` |
| `cliente_id` | FK opcional |
| `colaborador_id`, `destinatario_teams`, `destinatario_wa` | quem recebe a cobrança |
| `titulo`, `descricao` | |
| `due_at`, `snoozed_until` | timestamps |
| `prioridade` | `baixa`, `normal`, `alta`, `urgente` |
| `status` | `pendente`, `disparada`, `escalada`, `concluida`, `cancelada`, `snoozed` |
| `contexto_mensagem_id`, `alerta_id` | rastreamento de origem |
| `metadata` | jsonb |

Índices: `(status, due_at) WHERE status IN ('pendente','snoozed')`, `(agente_dono, status)`, `(cliente_id) WHERE status='pendente'`.

### `escalonamentos` (criada em 27/04/2026)

| Campo | Conteúdo |
|-------|----------|
| `origem_tipo` | `alerta` ou `tarefa` |
| `origem_id` | UUID |
| `cliente_id` | FK opcional |
| `motivo` | texto |
| `horas_uteis_decorridas` | numeric |
| `enviado_em`, `resolvido_em` | timestamps |

### `resumos_diarios`
Tabela auxiliar para o cron `resumos-diarios.cjs`.

### `suspicious_events` (parte do [[Hardening]])
Eventos de injeção detectados pelos agentes.

| Campo | Conteúdo |
|-------|----------|
| `agent_id` | qual agente detectou |
| `conversation_id` | de qual conversa veio |
| `content_snippet` | trecho (primeiros 200 chars) |
| `detected_at` | timestamp |

## RLS

Habilitado em `clientes`, `colaboradores`, `mensagens`, `alertas`, `sessoes_agente`. Policy `service_role_*` libera tudo via `service_role` key (a única usada pelos scripts).

## Comandos de consulta (CLI `supabase_integration.cjs`)

```bash
# Teste de conexão (default)
node /root/.openclaw/supabase_integration.cjs

# Mensagens de um cliente
node /root/.openclaw/supabase_integration.cjs mensagens --cliente CLI-XXX --horas 24 [--canal whatsapp|teams]

# Verificar alertas (gera 'sem_resposta')
node /root/.openclaw/supabase_integration.cjs alertas

# Cobranças
node /root/.openclaw/supabase_integration.cjs cobrancas [--cliente CLI-XXX] [--status pendente|resolvido]
node /root/.openclaw/supabase_integration.cjs cobranca-registrar --cliente CLI-XXX --colaborador <nome> --descricao "..."
node /root/.openclaw/supabase_integration.cjs cobranca-fechar --id <uuid>
```

## Tarefas via CLI dedicado

```bash
node /root/.openclaw/workspace/tools/tarefas-cli.cjs criar --agente <id> --titulo "..." [...]
node /root/.openclaw/workspace/tools/tarefas-cli.cjs listar [--agente <id>] [--vencidas] [--json]
node /root/.openclaw/workspace/tools/tarefas-cli.cjs concluir --id <uuid>
node /root/.openclaw/workspace/tools/tarefas-cli.cjs snooze --id <uuid> --ate "amanhã 9h"
node /root/.openclaw/workspace/tools/tarefas-cli.cjs cobrar-vencidas [--dry-run]
node /root/.openclaw/workspace/tools/tarefas-cli.cjs escalar-stale [--dry-run]
```

Ver [[Tarefas-e-Lembretes]] para a operação completa.

## Uso nos agentes

- [[jimmy-agencia-head]]: contexto de conversas por cliente, cobranças abertas, tarefas recebidas do CS
- [[jimmy-sales-head]]: registros de cobranças (`destinatario_teams: 'julia'`)
- [[jimmy-cs-head]]: histórico de atendimento por grupo WA + criação de tarefas A2A
- [[Cron-Captura]] + [[Managed-Hook]] + [[WA-Capture-Patch]]: gravação de mensagens
