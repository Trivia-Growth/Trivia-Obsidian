---
numero: "0011"
titulo: Pagamentos (Pagar.me)
tier: arquitetural
status: rascunho
fase: 1
modulo: M8
criado: 2026-07-01
atualizado: 2026-07-01
---

# 0011 — Pagamentos (Pagar.me)

> Espelho de `specs/0011-pagamentos-pagarme/` no repositório. Fonte da verdade é o repo — edite
> lá primeiro (`product.md`, `spec.md`, `design.md`, `domain.md`, `tasks.md`) e atualize aqui só o
> resumo.

**Tier:** arquitetural (integração externa nova → exige `design.md` — feito + ADR-0008)
**Status:** rascunho (specs escritas, aguardando clarificação/aprovação e `@dev`)
**Módulo (ESPECIFICACAO.md):** M8 — Pagamentos e Recorrência (Pagar.me)
**Depende de:** `0010` (Matrícula + preço do curso), `0005` (claim `user_role`)
**Repo:** `specs/0011-pagamentos-pagarme/`

---

## Por quê / para quem (product.md)
Hoje a escola não ativa acesso automaticamente ao vender: a compra de Curso Livre (EAD) ou Curso
Avulso de Música depende de conferência manual de pagamento (dores D5/D3). Para o **Aluno** que
compra por pagamento único e o **Financeiro** que não quer conferir à mão.

## Resumo (spec.md)
Pagamento **avulso** (compra única) via **Pagar.me** para Curso Livre e Curso Avulso de Música: o
**preço é resolvido no backend** (centavos, ADR-0001), o **webhook** confirma o pagamento e **ativa a
Matrícula**, com **assinatura validada** e **idempotência** (evento repetido não reprocessa).
Recorrência é a `0012`. Decisão durável em ADR-0008 (`docs/adr/0008-integracao-pagarme-preco-backend-webhook-idempotente.md` no repo).

## Critérios de aceite
- [ ] CA0 — Mockup da tela de compra aprovado pelo JG antes de codar UI
- [ ] AC-1 — Preço da cobrança é o preço oficial do curso, resolvido no backend
- [ ] AC-2 — Webhook confirmado ativa a Matrícula
- [ ] AC-3 — Webhook com assinatura inválida é rejeitado e não tem efeito
- [ ] AC-4 — Webhook é idempotente: evento repetido não reprocessa
- [ ] AC-5 — Iniciar cobrança sem autenticação é bloqueado
- [ ] AC-6 — Só Matrícula avulsa (Curso Livre / Curso Avulso de Música) pode ser cobrada aqui
- [ ] AC-7 — Webhook de falha/expiração não ativa a Matrícula

## Fora de escopo
- Recorrência / mensalidade de Curso de Formação (é a `0012`).
- Regras de inadimplência (dependem de questão aberta §12; são da recorrência).
- Estorno, reembolso, chargeback e conciliação financeira completa (Fase 2).
- Split / repasse a professor e seleção de professor do Curso Avulso de Música.
- Criação da Matrícula e cadastro de preço do curso (são de `0010`).
- Checkout rico (parcelamento, múltiplos meios) e emissão fiscal.

## Tasks (tasks.md)
| # | Task | Status |
|---|------|--------|
| 0 | Mockup da tela de compra aprovado pelo JG | todo |
| 1 | Value objects `ValorCentavos` + `StatusPedido` (domínio) | todo |
| 2 | Regra de transição idempotente de `PedidoPagamento` (domínio) | todo |
| 3 | Migration `financeiro.pedidos_pagamento` + `financeiro.pagarme_eventos` | todo |
| 4 | RLS FORCE + policies + pgTAP | todo |
| 5 | Caso de uso `CriarCobrancaAvulsa` (application) | todo |
| 6 | Caso de uso `ConfirmarPagamentoAvulso` (application) | todo |
| 7 | Adapter Pagar.me + verificador de assinatura HMAC (infra) | todo |
| 8 | Edge Function `criar-cobranca-avulsa` | todo |
| 9 | Edge Function `pagarme-webhook` (idempotente, assinado) | todo |
| 10 | Auditoria em `audit.events` | todo |
| 11 | Tela mínima de compra avulsa (feature-flag) | todo |

## Decisões / ADRs relacionados
- ADR-0008 — Integração Pagar.me: preço no backend, webhook idempotente com assinatura validada
  (`docs/adr/0008-integracao-pagarme-preco-backend-webhook-idempotente.md` no repo).
- ADR-0001 — Dinheiro em centavos.

## Questões em aberto (ESPECIFICACAO §12 — não bloqueiam esta feature)
- Granularidade da recorrência (por Turma ou por Curso) — só afeta `0012`.
- Inadimplência (bloqueia acesso? após quantos dias?) — só afeta a recorrência.
- Curso Avulso de Música presencial/EAD/ambos + agenda por professor — respondido em `0006`.
- Meios de pagamento aceitos no avulso e prazo de expiração da cobrança.
