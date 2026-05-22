---
id: STORY-004
titulo: "Blindar Edge Functions: autenticação de cron e webhooks"
fase: 1
modulo: "Segurança/Backend"
status: concluido
prioridade: alta
agente_responsavel: "Claude Code"
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-004 — Blindar Edge Functions: autenticação de cron e webhooks

## Contexto

A auditoria ([[Projeto/Diagnóstico Técnico]]) apontou que 17 Edge Functions são
endpoints públicos sem autenticação, escrevendo no banco com poder total
(service_role). Webhooks confiam cegamente no payload.

## Critérios de Aceite

- [x] CA1 — As 11 funções de polling/scan/sync saíram de `verify_jwt = false`
  e passam a exigir JWT. Solução mais limpa que um header de cron próprio:
  o usuário autenticado (telas admin) e o cron (service_role) já têm JWT;
  atacante anônimo é barrado pelo gateway do Supabase.
- [x] CA2 — `tray-webhook` valida segredo na URL `?token=` (`TRAY_WEBHOOK_SECRET`)
- [x] CA3 — `mercadolivre-webhook` valida segredo na URL `?token=` (`MELI_WEBHOOK_SECRET`)
- [x] CA4 — `melhor-envio-webhook`: POST sem assinatura HMAC → 401 (bypass de
  "ping" removido; o ping de validação do ME usa GET)
- [ ] CA5 — *Adiado:* fechar o CORS depende do domínio de produção no Netlify
  (tarefa #3, aguarda acesso do JG). Com `verify_jwt`/segredo já no lugar, o
  CORS `*` é de baixo risco. Reabrir quando o domínio existir.
- [x] CA6 — `validate_amazon_po_status()` com `SET search_path = public`
- [x] CA7 — `invite-user` valida `role` contra allowlist; `roleAssigned` na resposta

## URLs de webhook (para a tarefa #7)

Ao re-registrar os webhooks, usar a URL **com o token**:
- Tray: `https://eqsjvacbhrezlgqpwipv.supabase.co/functions/v1/tray-webhook?token=<TRAY_WEBHOOK_SECRET>`
- Mercado Livre: `.../functions/v1/mercadolivre-webhook?token=<MELI_WEBHOOK_SECRET>`

> Os valores de `TRAY_WEBHOOK_SECRET` e `MELI_WEBHOOK_SECRET` estão nas secrets
> do Supabase (Dashboard → Edge Functions → Secrets). Não versionar no vault.

## Implementação

**Commit:** `e319f05` — `feat: blindar Edge Functions (STORY-004)`

- `config.toml` reescrito: só os 5 webhooks ficam com `verify_jwt = false`.
- `verify_jwt = true` aplicado nas 11 funções via Management API.
- 4 funções reimplantadas: tray-webhook, mercadolivre-webhook,
  melhor-envio-webhook, invite-user.
- Migration `20260522130000` aplicada no banco.

## QA

**Gate:** `PASS`

- [x] Smoke test: `tray-webhook`/`mercadolivre-webhook` sem token → 401
- [x] `tray-webhook` com token correto → passa da trava (400 no payload ruim)
- [x] `tray-poll-orders` / `correios-scan-objects` sem auth → 401 (`verify_jwt`)
- [x] `melhor-envio-webhook` sem assinatura → rejeitado (500 fail-closed por
  `ME_APP_SECRET` ainda não configurado; vira 401 quando a credencial chegar)

## Referência

- [[Projeto/Diagnóstico Técnico]] — seção 1, itens S1, S2, S3, S11, S12, S15, S16
- `SECURITY_DEBT.md` SEC-003, SEC-004, SEC-005

## Notas e Decisões

- `2026-05-22` — Story criada a partir do diagnóstico técnico.
- `2026-05-22` — Concluída (commit `e319f05`). CA5 (CORS) adiado por depender do
  domínio de produção no Netlify. CA2/CA3 usam segredo na URL — webhooks ainda
  não registrados, então a tarefa #7 deve usar a URL com `?token=`.
