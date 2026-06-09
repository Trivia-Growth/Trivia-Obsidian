---
projeto: Sales-Hzm
tipo: security-debt
atualizado: 2026-06-09
---

# SECURITY_DEBT — Sales-Hzm

Registro de débito de segurança. Prioridades: **P0** bloqueia produção · **P1** até 1 semana · **P2** backlog.
Origem: [[Auditoria TRIVIAIOX — Sales-Hzm]] (reavaliada para **single-tenant**).

| ID | Prio | Descrição | Achado | Story |
|----|------|-----------|--------|-------|
| SEC-001 | **P0** | 7 Edge Functions com `verify_jwt=false` + `service_role` sem nenhuma autenticação interna — abertas à internet (queima de chaves de IA, escrita arbitrária) | #3, #4 | [[STORY-001 — Fechar Edge Functions públicas sem autenticação\|STORY-001]] |
| SEC-002 | **P0** | RLS inerte (`FORCE` sem `ENABLE`) em `quotes`, `custom_fields`, `custom_field_values`, `ai_predictions` — chave anônima pública lê tudo | #1 | [[STORY-002 — Habilitar RLS e padronizar policies\|STORY-002]] |
| SEC-003 | **P1** | `zapi-webhook` sem validação de origem (Client-Token); HMAC do Meta é fail-open; `state` do OAuth de meetings forjável (open redirect) | #8, #9, #10, #11 | [[STORY-003 — Proteger webhooks e callback OAuth\|STORY-003]] |
| SEC-004 | **P1** | Segredos em texto puro (tokens Z-API, `access_token` Meta, `api_key` de IA) lidos pelo frontend via `select('*')` | #7 | [[STORY-004 — Proteger segredos e dados sensíveis\|STORY-004]] |
| SEC-005 | **P1** | `api_tokens`/`inbound_webhooks` em plaintext; hardening da STORY-016 virou no-op (`CREATE TABLE IF NOT EXISTS`) | #5, #6 | [[STORY-004 — Proteger segredos e dados sensíveis\|STORY-004]] |
| SEC-006 | **P1** | PII (telefone, nome, e-mail, mensagens) logada em texto puro nos webhooks — risco LGPD | #35 | [[STORY-004 — Proteger segredos e dados sensíveis\|STORY-004]] |
| SEC-007 | **P2** | Funções SECURITY DEFINER sem `SET search_path` (`is_superadmin`, `hybrid_search`, `update_updated_at_column`) — risco de search_path hijack | #28, #29, #30 | [[STORY-002 — Habilitar RLS e padronizar policies\|STORY-002]] |
| SEC-008 | **P2** | Filtros PostgREST `.or()` montados com input do usuário (telefone) — injeção de filtro | #33 | [[STORY-008 — Endurecer Edge Functions restantes\|STORY-008]] |
| SEC-009 | **P2** | `err.message` cru refletido ao cliente em 9 funções — vaza schema/erros internos | #34, #39 | [[STORY-008 — Endurecer Edge Functions restantes\|STORY-008]] |
| SEC-010 | **P2** | Senha temporária com `Math.random()` e devolvida no corpo/e-mail | #36, #37 | [[STORY-004 — Proteger segredos e dados sensíveis\|STORY-004]] |
| SEC-011 | **P2** | Rate limiting ausente em funções de IA caras; limiter faz fail-open | #38 | [[STORY-008 — Endurecer Edge Functions restantes\|STORY-008]] |
| SEC-012 | **P2** | CSP com `unsafe-inline`/`unsafe-eval`; CORS `*` em produção em 22 funções | #63, #27 | [[STORY-006 — CICD mínimo e gates automáticos\|STORY-006]] |
| SEC-013 | **P2** | `npm audit`: 1 HIGH + 3 moderate em deps de produção | #50 | [[STORY-006 — CICD mínimo e gates automáticos\|STORY-006]] |
| SEC-014 | P3 | `NotificationBell` faz `window.location.href` sem validar o link (open redirect) | #59 | [[STORY-007 — Corrigir features quebradas e bugs de runtime\|STORY-007]] |

> [!note] Rebaixados por single-tenant
> **#2 (IDOR cross-tenant)**, **#32 (`meta-wa-send` confia no body)**, **#60/#61 (isolamento entre tenants)** — perdem severidade num cenário de uma só organização. Mantê-los no backlog como boa prática (defesa em profundidade) caso o sistema um dia vire multi-org, mas **não bloqueiam** produção.
>
> A estratégia de tratar o multi-tenant (travar em organização única, mantendo `workspace_id`/RLS como escopo de segurança) está em [[STORY-014 — Travar em organização única (single-tenant)|STORY-014]]. A camada de membership **continua sendo necessária** — é ela que mantém a RLS funcionando mesmo com uma só organização.
