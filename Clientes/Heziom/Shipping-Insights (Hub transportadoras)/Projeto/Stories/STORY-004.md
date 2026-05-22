---
id: STORY-004
titulo: "Blindar Edge Functions: autenticação de cron e webhooks"
fase: 1
modulo: "Segurança/Backend"
status: pronto
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

- [ ] CA1 — Funções de polling/scan/sync exigem segredo de cron (header
  `X-Cron-Secret` comparado a env var) ou só são acionadas por cron interno
- [ ] CA2 — `tray-webhook` valida origem (checar `seller_id` + segredo)
- [ ] CA3 — `mercadolivre-webhook` valida origem (allowlist de IP ou segredo no path)
- [ ] CA4 — `melhor-envio-webhook` exige assinatura sempre (remover bypass de
  "ping de teste" sem assinatura)
- [ ] CA5 — CORS fechado: origem fixa nas funções chamadas pelo frontend;
  sem headers CORS nos webhooks (servidor-a-servidor)
- [ ] CA6 — Função SQL `validate_amazon_po_status()` com `SET search_path` fixo
- [ ] CA7 — `invite-user` valida `role` recebido com allowlist (Zod)

## Referência

- [[Projeto/Diagnóstico Técnico]] — seção 1, itens S1, S2, S3, S11, S12, S15, S16
- `SECURITY_DEBT.md` SEC-003, SEC-004, SEC-005

## Notas e Decisões

- `2026-05-22` — Story criada a partir do diagnóstico técnico.
