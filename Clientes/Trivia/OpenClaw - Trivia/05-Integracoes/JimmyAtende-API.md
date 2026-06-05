---
title: Integração — JimmyAtende API (CRM Vendas)
tags: [crm, jimmyatende, api, vendas, roleplay]
created: 2026-04-17
updated: 2026-06-05
---

# JimmyAtende API

**Base URL:** `https://lcfzuzxafzvbkeryesxc.supabase.co/functions/v1/reports-api`
**Auth:** `X-API-Token: $CRM_API_TOKEN` (token em `/root/.openclaw/.env`)
**Padrão:** query-param `?report_type=<tipo>&<params>`

## Endpoints disponíveis

| Endpoint | Parâmetros principais | Retorna |
|----------|----------------------|---------|
| `dashboard` | `date` | Conversas ativas, deals, appointments |
| `pipeline` | `date`, `stale_days` | Deals por estágio, stale, totals |
| `conversations` | `date`, `limit` | Lista de conversas ativas |
| `team` | `date` | Performance por vendedor |
| `deals_won` | `date` | Deals ganhos no período |
| `deals_lost` | `date` | Deals perdidos no período |
| `overdue` | `date` | Follow-ups vencidos |
| `quality` | *(sem date — retorna últimas avaliações)* | Scores de qualidade dos atendimentos |
| `morning` / `afternoon` / `evening` | `date` | Resumos por turno |
| `conversion` | `date` | Taxa de conversão |
| `messages` | `date`, `limit` | Mensagens históricas |
| `recent_messages` | `date`, `limit` | Feed das últimas 24h |
| `roleplay_summary` | `date_from`, `date_to` | Resumo de treinos por vendedor |
| `roleplay_sessions` | `user_id`, `date_from`, `date_to`, `limit` | Sessões individuais |
| `roleplay_assignments` | — | Assignments de treino atribuídos |
| `roleplay_pending` | `days`, `min_sessions` | Vendedores que pularam treino |
| `roleplay_trainings` | — | Catálogo de treinos disponíveis |

## Ingestão de leads

```
POST /functions/v1/lead-intake
```

## Consolidador para uso diário

**Não chamar endpoints individualmente no cron.** Usar:

```bash
node /root/.openclaw/workspace/tools/sales-daily-data.js
```

Chama 9 endpoints em paralelo (~11KB retornado). Flags: `--verbose`, `--date YYYY-MM-DD`, `--dry-run`.

## Notas sobre o campo `quality`

Endpoint `quality` **não aceita filtro por data** — com `date=today` retorna vazio se não houver avaliações feitas exatamente no dia. Chamar sem `date` para obter as últimas avaliações disponíveis.

## Julia Araujo

- **user_id:** `68ae204d-8ffd-413c-8bd8-f89a50128190`
- Lookup dinâmico em `sales-daily-data.js`: tenta `team.members` → `roleplay_summary.sellers` → `roleplay_summary.users`
