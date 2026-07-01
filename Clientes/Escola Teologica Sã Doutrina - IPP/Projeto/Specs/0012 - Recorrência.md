---
numero: "0012"
titulo: Recorrência
tier: arquitetural
status: rascunho
fase: 1
modulo: M8
criado: 2026-07-01
atualizado: 2026-07-01
---

# 0012 — Recorrência

> Espelho de `specs/0012-recorrencia/` no repositório. Fonte da verdade é o repo — edite lá primeiro
> (`product.md`, `spec.md`, `design.md`, `tasks.md`) e atualize aqui só o resumo.

**Tier:** arquitetural (exige `design.md` — feito)
**Status:** rascunho (specs escritas, backlog — ainda não clarificado/aprovado)
**Módulo (ESPECIFICACAO.md):** M8 — Pagamentos e Recorrência (Pagar.me)
**Depende de:** `0011` (Pagamentos avulso), `0010` (Matrículas), `0006` (mensalidade), `0005` (papel)
**Repo:** `specs/0012-recorrencia/`

---

## Por quê / para quem (product.md)
A escola cobra **mensalidade** do Curso de Formação (EAD e presencial), mas hoje a recorrência e a
inadimplência vivem fora da plataforma (dor D5). Para o **Aluno** (mensalidade automática) e o
**Financeiro** (assinatura ao matricular, inadimplência sem conciliação manual). O avulso (`0011`) não
cobre mensalidade.

## Resumo (spec.md)
Cobra a mensalidade de uma Matrícula de **Curso de Formação** por **Recorrência** no Pagar.me: cria uma
Assinatura com o valor resolvido no backend ao matricular, confirma cada ciclo por webhook idempotente
e assinado, mantém a Matrícula `ativa` no ciclo pago e a marca `inadimplente` no ciclo falho —
reaproveitando o domínio financeiro de `0011` e o contrato de transição de `0010`.

## Critérios de aceite
- [ ] AC-1 — Criar assinatura para Matrícula de Curso de Formação usa a mensalidade do backend
- [ ] AC-2 — Recorrência é recusada para Matrícula que não é de Curso de Formação (avulsos → `0011`)
- [ ] AC-3 — Ciclo pago mantém/ativa a Matrícula
- [ ] AC-4 — Ciclo falho marca a Matrícula como inadimplente
- [ ] AC-5 — Webhook de recorrência é idempotente
- [ ] AC-6 — Webhook com assinatura HMAC inválida é rejeitado sem efeito
- [ ] AC-7 — Valor e status vivem no backend; cliente não os define (RLS)

## Questões em aberto (ESPECIFICACAO §12 — não viram AC até o negócio decidir)
- Granularidade: mensalidade por **Turma** ou por **Curso** (troca de turma re-cobra?).
- Inadimplência: `inadimplente` bloqueia acesso? Após quantos dias/ciclos?
- Menores de idade: responsável financeiro titular da cobrança?

## Fora de escopo
- Pagamento avulso (Curso Livre / Curso Avulso de Música) — é `0011`.
- Definição do valor da mensalidade — é do Catálogo (`0006`); aqui só se lê.
- Criação da Matrícula e máquina de estados — é de `0010`; aqui só se dispara transições.
- Efeito da inadimplência no acesso (bloqueio/prazos) — questão aberta §12.
- Granularidade e troca de turma — questão aberta §12.
- Estorno/reembolso, chargeback, dunning customizado, conciliação — Fase 2.
- UI de checkout rica; responsável financeiro de menor.

## Tasks (tasks.md)
| # | Task | Status |
|---|------|--------|
| 0 | CA0 — mockup da tela mínima aprovado pelo JG antes de codar UI | todo |
| 1 | Value object `StatusAssinatura` + reuso de `ValorCentavos` | todo |
| 2 | Regra de transição por ciclo (idempotente) | todo |
| 3 | Migration `financeiro.assinaturas` + `alter` de `pagarme_eventos` | todo |
| 4 | RLS FORCE de `financeiro.assinaturas` + pgTAP | todo |
| 5 | Caso de uso `CriarAssinatura` (application) | todo |
| 6 | Caso de uso `ProcessarCicloAssinatura` (application) | todo |
| 7 | Adapter Pagar.me Subscriptions (infrastructure) | todo |
| 8 | Edge Function `criar-assinatura` | todo |
| 9 | Extensão da Edge Function `pagarme-webhook` (paid/failed) | todo |
| 10 | Auditoria em `audit.events` | todo |
| 11 | Tela mínima de Recorrência (conforme mockup) | todo |

## Decisões / ADRs relacionados
- **Sem ADR próprio.** Reaproveita ADR-0008 (integração Pagar.me: preço backend + webhook idempotente
  assinado, `docs/adr/0008-...` no repo). Um ADR de granularidade só nasce depois que §12 for decidida.
