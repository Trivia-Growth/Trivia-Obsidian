---
title: Integração — Jimmy Studio API
tags: [jimmy-studio, api, publicacoes, sla]
created: 2026-04-17
updated: 2026-06-05
---

# Jimmy Studio API

**Script:** `/root/.openclaw/workspace/tools/jimmy-studio-api.js`
**Auth:** `X-API-Key: jsk_...` (header `agent-api`)
**Org target:** `52327e6e-8c43-4086-bce7-cc8da7ab57ff` (João Novais — org com marcas operacionais da Trívia)

> **Atenção:** Super admin key sem `target_org_id` cai na org do admin (27 marcas de terceiros). Sempre especificar org via `DEFAULT_TARGET_ORG_ID` no código ou flag `--org`.

## Ações principais

```bash
# Relatório completo de produção (fonte oficial)
node jimmy-studio-api.js report --type full_production --month 2026-04 --week 16

# Segunda-feira (semana encerrada): adicionar --force-recap
node jimmy-studio-api.js report --type full_production --month 2026-04 --week 15 --force-recap

# SLA de publicação Instagram
node jimmy-studio-api.js sla-publicacoes --horas 72   # segunda (cobre fim de semana)
node jimmy-studio-api.js sla-publicacoes --horas 24   # terça a sexta

# Sync de contas (mode: full = 500 posts)
node jimmy-studio-api.js sync-all
node jimmy-studio-api.js sync-all --only-errors  # só contas em erro

# Sync manual de uma conta
node jimmy-studio-api.js retry-sync --brand "Nome" --mode full
```

## Marcas da Trívia (CLI_MAP)

| CLI | Marcas no Jimmy Studio |
|-----|------------------------|
| CLI-001 | Arival Dias Casimiro - CLI-001 |
| CLI-002 | Pedras Vivas - CLI-002 |
| CLI-003 | Samuel Pires - Ws - CLI-003, Work Solution - CLI-003 |
| CLI-004 | Traduzzo - CLI-004 |
| CLI-005 | Edilaine Francescato - CLI-005, FFCM - MÉTODO - CLI-005 |
| CLI-006 | MDA - CLI-006 |
| CLI-007 | Gamma pigments - CLI-007 |
| CLI-008 | Grupo Previx - CLI-008 |

## Normalização de marcas mirror

Todas as marcas Trívia são **mirror** (mesmo post em IG e LI). O backend retorna metas dobradas (`ig_target + li_target`). Correção client-side via `normalizeMirrorBrands()`:

- `weekly.target` → dividido por 2
- `monthly.target` → igual ao `ig_target`
- `monthly.delivered` → `MAX(ig_delivered, li_delivered)`

Flag `--no-mirror-fix` desliga a normalização (útil para debug).

## Fonte oficial de dados

`full_production` (não `production`, não `team_performance`). Retorna: weekly_metrics, monthly_metrics, brands[] com meta/entregue/status, team[] com scores por colaborador.

## Sync e cadência

Sincronização deve ocorrer **imediatamente antes** do relatório 07h (descoberto em 13/04: sync stale subestimava entregas do Previx em 6 publicações).

`sync-all` padrão usa `mode: "full"` (500 posts). Timeout do poll: 300s.
