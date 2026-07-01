---
numero: "0015"
titulo: Presencial — Matrícula Manual
tier: pequeno
status: rascunho
fase: 1
modulo: M3
criado: 2026-07-01
atualizado: 2026-07-01
---

# 0015 — Presencial — Matrícula Manual

> Espelho de `specs/0015-presencial-matricula-manual/` no repositório. Fonte da verdade é o repo —
> edite lá primeiro (`product.md`, `spec.md`, `tasks.md`) e atualize aqui só o resumo.

**Tier:** pequeno (exige `spec.md` + `tasks.md`; sem `design.md`)
**Status:** rascunho (specs escritas, aguardando clarificação/`@dev`)
**Módulo (ESPECIFICACAO.md):** M3 — Modalidade Presencial
**Depende de:** 0006 (Catálogo/Curso de Formação), 0008 (Gestão de Turmas), 0010 (Matrículas), 0011 (Pagamentos/Recorrência), 0005 (Identidade e Acesso)
**Repo:** `specs/0015-presencial-matricula-manual/`

---

## Por quê / para quem (product.md)
Prioridade explícita do negócio: destravar o pagamento do presencial. A Secretaria das Unidades
(Vila Natal, Pinheiros) precisa matricular rápido um aluno já cadastrado numa Turma presencial e
deixar a Recorrência (mensalidade) armada, sem sair do sistema. Beneficiário indireto: o Financeiro.

## Resumo (spec.md)
A Secretaria matricula manualmente um aluno já existente numa Turma de Curso de Formação
**presencial** de uma Unidade, dentro da janela de inscrição; a Matrícula nasce com status de
pagamento `pendente` e Recorrência iniciada via M8 com valor calculado no backend (centavos,
ADR-0001). Presença é a 0016.

## Critérios de aceite
- [ ] CA0 — Mockup da tela de matrícula aprovado pelo JG antes de codar
- [ ] AC-1 — Secretaria matricula manualmente um aluno numa Turma presencial
- [ ] AC-2 — Matrícula presencial inicia a Recorrência com valor do backend
- [ ] AC-3 — Matrícula bloqueada fora da janela de inscrição
- [ ] AC-4 — Só Secretaria/Administrativo criam a Matrícula manual
- [ ] AC-5 — Não permitir Turma EAD nem duplicidade
- [ ] AC-6 — Aluno enxerga a própria Matrícula; Financeiro enxerga para cobrança

## Fora de escopo
- Registro de Presença e justificativa de falta (feature 0016 / M3).
- Cadastro/onboarding de novo aluno ou Perfil (aluno já existe — 0005).
- Criação/config de Turma, janela de inscrição e liberação progressiva (M5/0010).
- Fluxo de pagamento em si: Pagar.me, webhook, inadimplência, bloqueio (M8/0011).
- Matrícula EAD, Curso Livre, Curso Avulso de Música, pagamento avulso.
- Cálculo do valor da mensalidade (nasce na Turma/Curso, backend).
- UI rica de gestão de matrículas.

## Questões em aberto (§12)
- Granularidade da Recorrência: por Turma ou por Curso?
- Menores de idade: responsável financeiro/legal no vínculo da Matrícula?
- Inadimplência bloqueia acesso? após quantos dias? (enforcement é de M8).

## Tasks (tasks.md)
| # | Task | Status |
|---|------|--------|
| 0 | Mockup da tela aprovado pelo JG antes de codar UI | todo |
| 1 | Regra de domínio `podeMatricular` (presencial, janela, sem duplicidade) | todo |
| 2 | Migration `educacao.matriculas` + unicidade (aluno_id, turma_id) | todo |
| 3 | RLS FORCE de `educacao.matriculas` + testes pgTAP | todo |
| 4 | Caso de uso `MatricularAlunoPresencial` (application) | todo |
| 5 | Adapter de Recorrência (M8, valor do backend em centavos) | todo |
| 6 | Edge Function `matricular-aluno-presencial` | todo |
| 7 | Tela de matrícula manual da Secretaria (frontend) | todo |

## Decisões / ADRs relacionados
- Sem ADR novo (feature não introduz decisão difícil de reverter).
- Reusa ADR-0001 (dinheiro em centavos) e ADR-0004 (papel via JWT) — no repo em `docs/adr/`.
