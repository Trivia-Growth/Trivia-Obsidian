---
id: STORY-022
titulo: "Hardening de Seguranca (SEC-001 a SEC-008)"
fase: 1
modulo: seguranca
status: em-review
prioridade: alta
agente_responsavel: ""
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-022 — Hardening de Seguranca (SEC-001 a SEC-008)

## Contexto

O `SECURITY_DEBT.md` listava 8 dividas de seguranca em aberto (3 P1, 5 P2).
Esta story agrupa o tratamento dessas pendencias antes do deploy definitivo.

## Criterios de Aceite

- [x] SEC-001 (P1) — RLS + FORCE habilitado em todas as tabelas
- [x] SEC-002 (P1) — CORS fixado no dominio Netlify (remover `*`)
- [ ] SEC-005 (P1) — service_role key legacy desativada — **pendente acao manual no painel** (ver "Notas")
- [x] SEC-006 (P1) — RLS de transactions filtrando por `client_id` via `client_users`
- [x] SEC-003 (P2) — HSTS, CSP, Permissions-Policy no `netlify.toml`
- [x] SEC-004 (P2) — rate limiting (60 req/min por usuario) nas 5 Edge Functions
- [x] SEC-007 (P2) — validacao CPF/CNPJ com digitos verificadores
- [x] SEC-008 (P2) — audit log com trigger generico em 7 tabelas administrativas

## Implementacao

**Status:** `em-review` — 7 de 8 itens completos; SEC-005 aguarda 1 clique manual.

**Branch/PR:** main (commits diretos)

**Migrations adicionadas:**
- `20260522002000_security_hardening_rls.sql` — limpa policies (de 51 para 24)
- `20260522003000_audit_log.sql` — tabela + trigger generico
- `20260522004000_rate_limit.sql` — tabela + funcao `check_rate_limit`

**Modulos compartilhados adicionados:**
- `supabase/functions/_shared/cors.ts`
- `supabase/functions/_shared/validation.ts`
- `supabase/functions/_shared/rate-limit.ts`

**Achado importante (SEC-006):** a auditoria revelou **policies abertas
(`qual = true`) em 7 tabelas** — qualquer usuario autenticado podia ler/escrever
dados de qualquer cliente. Isolamento multi-tenant estava quebrado. **Era uma
falha de seguranca real, nao apenas dívida de processo.** Agora fechado.

## QA

**Gate:** `CONCERNS` — apenas porque SEC-005 ainda exige acao manual.

- [x] `npm run lint` sem erros
- [x] `npm run build` sem erros
- [x] RLS testado: usuario superadmin continua acessando todas as tabelas
- [x] CORS testado: origem permitida reflete; origem nao autorizada cai na primeira da lista
- [x] Rate limit testado: 3 reqs permitidas, 4ª bloqueada (limite=3 no teste)
- [ ] SEC-005: aguarda clique de "Disable" na legacy `service_role` no painel

## Notas e Decisoes

**SEC-005 — acao manual:**
A `service_role` JWT legacy nao tem endpoint de revogacao trivial na
Management API. O Supabase ja migrou automaticamente o secret
`SUPABASE_SERVICE_ROLE_KEY` das Edge Functions para apontar para a nova
`sb_secret_*` (confirmado por hash). A JWT legacy esta orfa — basta desativar
no painel:

1. https://supabase.com/dashboard/project/nktcuryuogkgpccdrpal/settings/api-keys
2. Aba "Legacy API keys" → `service_role` → botao **Disable**

Depois disso, **revogar/excluir o Personal Access Token** que JG colou no chat
(`sbp_9a02...`) tambem deve ser feito: https://supabase.com/dashboard/account/tokens
