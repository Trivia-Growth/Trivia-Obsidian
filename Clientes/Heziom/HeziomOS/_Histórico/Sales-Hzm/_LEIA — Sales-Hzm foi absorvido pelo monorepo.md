---
tipo: nota-ponte
status: histórico
data: 2026-07-01
---

# ⚠️ LEIA ANTES — Sales-Hzm foi absorvido pelo monorepo `heziomos`

Esta pasta documenta um **repositório antecessor separado**: `Org-Heziom/heziom-sales` — um CRM feito na **Lovable**, **multi-tenant por `workspace_id`**, com Supabase próprio (`apzbaesprzohoalknzxd`) e "49 Edge Functions".

**Esse repositório foi reescrito e absorvido dentro do monorepo atual `heziomos`** (feature `crm`, **single-tenant**, Edge Functions com prefixo `crm-*`) por volta de **jun/2026**. Nada aqui reflete o código de produção atual.

## Como ler as stories desta pasta

- **STORY-001 a 014** = débito de **segurança/qualidade do repo Lovable antigo** (caminhos `src/…`, functions sem prefixo `crm-`). **Não aplicável** ao sistema atual — não "corrigir" esses bugs, eles se referem a um schema que não existe mais.
- **STORY-015 a 024** = features de CRM que **hoje estão em produção no monorepo**. O registro vivo delas é `docs/stories/BACKLOG.md` do repo `heziomos` (Épicos 5, 6, 9, 16, 17).

## Tabela de-para (função antiga → atual)

| Sales-Hzm (antigo) | heziomos (atual) |
|---|---|
| `campaign-send` | `crm-campaign-send` |
| `segment-refresh` | `crm-segment-refresh` |
| `flow-engine` / `flow-daily-triggers` / `flow-action-executor` | `crm-flow-engine` / `crm-flow-daily-triggers` / `crm-flow-action-executor` |
| `tray-sync` / `tray-webhook` / `tray-token-refresh` | `crm-tray-sync` / `crm-tray-webhook` / `crm-tray-token-refresh` (+ `crm-tray-sync-products`, `crm-tray-poll-abandoned-carts`) |
| `email-track` | `crm-email-track` |
| `lead-intake` | `crm-lead-intake` |
| `routing-engine` | `crm-routing-engine` |
| `performance-calculator` | `crm-performance-calculator` |
| `ai-orchestrator` | `crm-ai-orchestrator` (+ `crm-specialist-runner`) |
| `conversation-load` | `crm-conversation-load` |
| single-tenant "manter `workspace_id`" (STORY-014) | remoção real: `_shared/single-tenant.ts` + migration `crm_dashboard_drop_workspace_param` |

## O que fazer com esta pasta

Mantida **apenas como registro histórico** da transição. Para o estado real do CRM/Atendimento, ver:
- `docs/epics/README.md` e `docs/stories/BACKLOG.md` no repo `heziomos`
- No vault: `03 - Departamentos/Atendimento/Índice Atendimento.md` (atualizado)
