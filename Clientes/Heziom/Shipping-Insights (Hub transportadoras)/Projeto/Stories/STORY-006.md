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
- [x] CA2 — *Parcial:* retry de HTTP 429 (com `Retry-After`), 5xx e timeout
  implementado no `melhor-envio-sync` (a integração que está em produção),
  com backoff. Commit `fb8ebc8`. Falta propagar o mesmo padrão (idealmente um
  helper compartilhado) às demais funções de polling — fazer quando elas forem
  ativadas.
- [ ] CA3 — Erro pontual de uma transportadora não derruba o lote inteiro
- [ ] CA4 — Refresh de token OAuth robusto (serializar refresh; persistir
  refresh token rotativo de ML/Tray)
- [ ] CA5 — Validação de input (Zod) em todos os webhooks
- [ ] CA6 — `melhor-envio-sync` com lock contra execução concorrente e status de job
- [x] **Extra** — Bug do status `returning` corrigido: `mercadolivre-webhook`
  mapeia `returning` → `in_devolution` (valor válido no CHECK). Commit `fb8ebc8`.

> **Status:** CA1 e CA2 (para a integração viva) concluídas; bug do `returning`
> corrigido. CA3, CA5 e CA6 valem para funções que ainda não estão ativas
> (outras transportadoras, webhooks não registrados). CA4 (OAuth) está adiada
> até as integrações ML/Amazon/Tray terem credenciais — hoje é prematuro.
> O essencial de confiabilidade da integração **em produção** (Melhor Envio)
> está coberto: eventos ordenados + retry resiliente.

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
- `2026-05-22` — Limitação observada no 1º sync do Melhor Envio: `melhor-envio-sync`
  para em **1.000 envios** (teto de 10 páginas no `doSync`). A conta tem volume
  alto (~60/dia), então o histórico além de ~16 dias não vem. Adicionar como CA7:
  paginação por data ou execução em blocos para trazer o histórico completo sem
  estourar o tempo da função.
- `2026-05-22` — CA2 (parcial) + fix do `returning` entregues no commit `fb8ebc8`.
  Achado de UI na verificação E2E: o card "Em Trânsito" conta só
  `in_transit`/`out_for_delivery` — os envios `posted` do Melhor Envio não
  aparecem nele. Decisão de produto / ajuste de UI (registrar na STORY-007).
