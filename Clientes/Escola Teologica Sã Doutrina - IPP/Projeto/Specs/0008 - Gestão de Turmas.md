---
numero: "0008"
titulo: Gestão de Turmas
tier: arquitetural
status: rascunho
fase: 1
modulo: M5
criado: 2026-07-01
atualizado: 2026-07-01
---

# 0008 — Gestão de Turmas

> Espelho de `specs/0008-gestao-turmas/` no repositório. Fonte da verdade é o repo — edite
> lá primeiro (`product.md`, `spec.md`, `design.md`, `domain.md`, `tasks.md`) e atualize aqui só o resumo.

**Tier:** arquitetural (exige `design.md` + `domain.md` — feitos)
**Status:** rascunho (specs escritas, aguardando `/clarificar` e `@dev` implementar)
**Módulo (ESPECIFICACAO.md):** M5 — Gestão de Turmas
**Depende de:** 0006 (Catálogo de Cursos — classificação Curso Livre × Curso de Formação)
**Repo:** `specs/0008-gestao-turmas/`

---

## Por quê / para quem (product.md)
Curso de Formação (EAD ou presencial) não pode ser vendido nem operado sem a entidade que agrupa
alunos, controla a janela de inscrição e ancora liberação de conteúdo e recorrência. Para
Secretaria/Administrativo (criam/gerem Turmas), Professor (lê) e, indiretamente, Aluno (entra via
Inscrição em M4).

## Resumo (spec.md)
Agregado **Turma** único para EAD e presencial (conceito único, ADR-0006 —
`docs/adr/0006-turma-unificada-ead-presencial.md` no repo): vincula a um Curso de Formação, carrega
a **Modalidade**, exige **Unidade** quando presencial (nula quando EAD) e controla a **janela de
inscrição** (abre/fecha), com estado aberto/fechado derivado do relógio. Base para Inscrição (M4),
Matrícula (M7), Recorrência (M8) e Liberação progressiva (0009).

## Critérios de aceite
- [ ] CA0 — Mockup da tela de Turmas aprovado pelo JG antes de codar UI
- [ ] AC-1 — Criar Turma EAD com janela de inscrição
- [ ] AC-2 — Criar Turma presencial exige Unidade
- [ ] AC-3 — Turma EAD não pode ter Unidade
- [ ] AC-4 — Janela inválida (`abre > fecha`) é rejeitada
- [ ] AC-5 — Estado de inscrições aberto/fechado deriva da janela
- [ ] AC-6 — Só Secretaria/Administrativo criam ou alteram Turma
- [ ] AC-7 — Professor lê as Turmas; Aluno não vê Turma diretamente

## Fora de escopo
- Liberação progressiva (drip) — feature 0009 (M5).
- Inscrição do aluno na Turma dentro da janela — M4.
- Matrícula aluno↔Turma e status de pagamento — M7.
- Recorrência / cobrança (Pagar.me) — M8 (aqui só a marcação `cobrada_por_recorrencia`).
- Cadastro rico de Unidade (Vila Natal/Pinheiros) — M3.
- Presença (M3) e Progresso (M7); estados de ciclo de vida além da janela (fase 2).

## Tasks (tasks.md)
| # | Task | Status |
|---|------|--------|
| 1 | Value objects `Modalidade` + `JanelaInscricao` (domínio) | todo |
| 2 | Agregado `Turma` + invariante modalidade↔unidade | todo |
| 3 | Migration enums + tabela `educacao.turmas` + constraints | todo |
| 4 | RLS FORCE de `educacao.turmas` + policies + pgTAP | todo |
| 5 | pgTAP das constraints (modalidade↔unidade, janela) | todo |
| 6 | Caso de uso `CriarTurma` (application) | todo |
| 7 | Caso de uso `AlterarJanelaInscricao` (application) | todo |
| 8 | Adapter `TurmaRepository` (infrastructure) | todo |
| 9 | Auditoria `TurmaCriada` / `JanelaInscricaoAlterada` em `audit.events` | todo |
| 10 | Mockup da tela de Turmas aprovado pelo JG (CA0) | todo |
| 11 | Tela mínima de gestão de Turmas (features/educacao) | todo |

## Questões em aberto
- Validação "curso é Curso de Formação" depende do campo de classificação de 0006 (M2).
- Granularidade da recorrência (por Turma × por Curso) — ESPECIFICACAO §12, em aberto.

## Decisões / ADRs relacionados
- ADR-0006 — Turma como conceito único para EAD e presencial (`docs/adr/0006-turma-unificada-ead-presencial.md` no repo).
- ADR-0004 — Papel via JWT custom claim (consumido pela RLS de `educacao.turmas`).
