---
epic: 1
titulo: MVP de Reembolso por Departamento
fase: 1
inicio: 2026-06-10
status: em_andamento
---

# ÉPICO 01 — MVP de Reembolso por Departamento

## Objetivo

Tirar o reembolso do papel. Hoje os líderes das Sociedades Internas e Ministérios gastam, juntam nota/cupom/comprovante **físico** e entregam ao financeiro, que digitaliza e lança tudo na mão. O MVP entrega um sistema onde o líder **solicita o reembolso pelo celular (com foto do comprovante)**, acompanha o status, e enxerga **realizado vs. orçado** do seu departamento — e o financeiro aprova, marca como pago e **exporta no formato do Prover**.

## Princípios

1. **Comprovante é obrigatório** — sem documento anexado, não dá pra enviar (trava no app e no servidor). O financeiro precisa dele para analisar.
2. **Segurança no padrão Trivia** — RLS+FORCE em tudo, Edge Functions com JWT+Zod, Storage privado, LGPD. Frontend nunca muda status nem grava valor direto.
3. **Tudo notificado por e-mail** — cada transição dispara e-mail automático.
4. **Mínimo trabalho do financeiro** — paga no banco, marca pago, exporta pro Prover. Sem redigitar.

## Stories

| # | Story | Prioridade | Segurança | Status |
|---|-------|-----------|:---------:|--------|
| 001 | Setup de Infraestrutura | Alta | — | em-progresso |
| 002 | Autenticação (usuário/senha) e papéis | Alta | 🔒 gate | backlog |
| 003 | Cadastro de departamentos e vínculos | Alta | 🔒 gate | backlog |
| 004 | Orçamento anual (importação + cadastro) | Média | — | backlog |
| 005 | Solicitação de reembolso (câmera/upload) | Alta | 🔒 gate | backlog |
| 006 | Fluxo de aprovação (2 níveis) e auditoria | Alta | 🔒 gate | backlog |
| 007 | E-mails automáticos (Resend) | Média | 🔒 gate | backlog |
| 008 | Painel orçado vs. realizado | Média | — | backlog |
| 009 | Exportação para o Prover | Alta | 🔒 gate | bloqueado |

🔒 = exige `@security *security-gate` antes do merge (auth, PII, dados financeiros, novos endpoints, integrações).

## Dependências

```
STORY-001 (Infra) ──→ tudo
STORY-002 (Auth) ───→ 003, 005, 006, 008
STORY-003 (Deptos) ─→ 004, 005, 008, 009
STORY-004 (Orçamento) ──────────────→ 008
STORY-005 (Solicitação) ─→ 006, 009
STORY-006 (Aprovação) ──→ 007, 008, 009
STORY-009 (Export Prover) — BLOQUEADA até receber o template de importação do Prover
```

## Entrega esperada (fim da Fase 1)

- Líder entra com usuário/senha, abre reembolso pelo celular com foto da nota, acompanha status.
- Líder valida (1º nível); financeiro aprova, marca pago e exporta pro Prover.
- Cada etapa avisa por e-mail.
- Painel mostra orçado vs. realizado por departamento.

## Fora de escopo (Fase 2+)

Sincronização/conciliação automática do realizado com o Prover · aprovação por alçada (valor → Conselho/Junta) · OCR do comprovante · dashboards executivos.

> Specs: [[Arquitetura e Fluxos]] · [[Orçamento 2026]] · [[Departamentos (Sociedades e Ministérios)]] · [[API Prover - Mapeamento Completo]]
