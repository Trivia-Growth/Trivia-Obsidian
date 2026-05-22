---
id: STORY-006
titulo: "Confiabilidade das integrações (dedup, retry, OAuth)"
fase: 1
modulo: "Integrações"
status: em-progresso
prioridade: alta
agente_responsavel: "Claude Code"
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-006 — Confiabilidade das integrações

## Contexto

A auditoria ([[Projeto/Diagnóstico Técnico]]) apontou que as integrações não são
confiáveis sob carga: sem deduplicação, sem retry, login OAuth frágil.

## Critérios de Aceite

- [x] CA1 — Deduplicação/ordenação de eventos. Resolvido com um trigger
  `BEFORE UPDATE` em `shipment_trackings` (`skip_stale_tracking_update`) que
  descarta updates com `event_at` mais antigo que o armazenado. Migration
  `20260522140000`, commit `278e9c7`. Testado.
- [ ] CA2 — Chamadas externas com retry + tratamento de HTTP 429 (`Retry-After`)
- [ ] CA3 — Erro pontual de uma transportadora não derruba o lote inteiro
- [ ] CA4 — Refresh de token OAuth robusto (serializar refresh; persistir
  refresh token rotativo de ML/Tray)
- [ ] CA5 — Validação de input (Zod) em todos os webhooks
- [ ] CA6 — `melhor-envio-sync` com lock contra execução concorrente e status de job

> **Status:** CA1 concluída. CA2–CA6 são um refactor extenso de Edge Functions
> (~10 funções: helper de retry compartilhado, isolamento de erro por
> transportadora, mutex de OAuth + tabela para refresh token rotativo, Zod nos
> webhooks, advisory lock). Merecem um turno dedicado — não foram feitas para
> evitar pressa em código de confiabilidade.

## Referência

- [[Projeto/Diagnóstico Técnico]] — seção 3 (confiabilidade)

## Notas e Decisões

- `2026-05-22` — Story criada a partir do diagnóstico técnico.
- `2026-05-22` — CA1 entregue (trigger de ordenação de eventos). CA2–CA6 pendentes.
- `2026-05-22` — Bug encontrado na verificação E2E: `mercadolivre-webhook` mapeia
  o status `returning` do ML para `'returning'`, mas o CHECK
  `shipment_trackings_status_check` **não inclui `returning`** — um envio do ML
  em devolução faria o upsert falhar. Corrigir junto da CA5 (adicionar `returning`
  ao CHECK via migration, ou mapear para `returned`, que é um valor válido).
