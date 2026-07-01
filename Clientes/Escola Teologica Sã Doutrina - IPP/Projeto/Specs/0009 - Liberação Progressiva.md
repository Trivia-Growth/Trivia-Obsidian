---
numero: "0009"
titulo: Liberação Progressiva
tier: pequeno
status: rascunho
fase: 1
modulo: M5
criado: 2026-07-01
atualizado: 2026-07-01
---

# 0009 — Liberação Progressiva

> Espelho de `specs/0009-liberacao-progressiva/` no repositório. Fonte da verdade é o repo — edite
> lá primeiro (`product.md`, `spec.md`, `tasks.md`) e atualize aqui só o resumo.

**Tier:** pequeno (feature isolada — `product.md` + `spec.md` + `tasks.md`, sem `design.md`)
**Status:** rascunho (specs escritas, aguardando `/clarificar` + `@dev`)
**Módulo (ESPECIFICACAO.md):** M5 — Gestão de Turmas (liberação progressiva / drip)
**Depende de:** 0005 (Identidade), 0010 (Matrícula), 0008 (Gestão de Turmas)
**Repo:** `specs/0009-liberacao-progressiva/`

---

## Por quê / para quem (product.md)
Turmas de Curso de Formação precisam liberar o conteúdo aos poucos (drip), por cronograma — não tudo
de uma vez (dor D6). Para o Aluno (EAD e presencial), que só deve ver o que já foi liberado, e para
Secretaria/Professor/Administrativo, que configuram o cronograma.

## Resumo (spec.md)
Cada unidade de conteúdo de uma Turma (Aula/Módulo no EAD, Material Complementar no presencial) tem
uma data de liberação por Turma. O Aluno matriculado só acessa o que já foi liberado
(`data_liberacao <= agora`). Mesma regra para as duas modalidades — muda a unidade liberada, não a
mecânica. Sem data = não liberado (padrão seguro).

## Critérios de aceite
- [ ] AC-1 — Papel operacional define a data de liberação de um conteúdo na Turma
- [ ] AC-2 — Aluno só vê conteúdo já liberado na sua Turma
- [ ] AC-3 — Aluno NÃO vê conteúdo ainda não liberado
- [ ] AC-4 — Conteúdo sem data de liberação fica indisponível ao Aluno
- [ ] AC-5 — Regra vale igual para EAD e presencial
- [ ] AC-6 — Aluno de uma Turma não vê o conteúdo de outra Turma
- [ ] AC-7 — Só papéis operacionais alteram o cronograma

## Fora de escopo
- Janela de inscrição da Turma (é da 0008-gestao-turmas).
- CRUD de Curso/Módulo/Aula (M2) e Material Complementar (M9).
- Bloqueio por inadimplência (questão aberta §12, decidida em M8).
- Notificação ao Aluno quando um conteúdo é liberado.
- Progresso e Presença (M7/M3).
- Drip relativo por aluno (esta spec usa data absoluta por Turma).

## Questões em aberto (ESPECIFICACAO §12)
- Granularidade da liberação (por Aula/Módulo/Material) depende de onde o Material se prende — M9.
- Inadimplência bloqueia acesso? — M8.

## Tasks (tasks.md)
| # | Task | Status |
|---|------|--------|
| 0 | CA0 — mockup aprovado pelo JG antes de codar UI | todo |
| 1 | Value object `DataLiberacao` (domínio) | todo |
| 2 | Migration `educacao.liberacao_conteudo` + RLS FORCE | todo |
| 3 | RLS + testes pgTAP (matriz de decisão) | todo |
| 4 | Caso de uso `DefinirLiberacaoConteudo` (application) | todo |
| 5 | Caso de uso `ListarConteudoLiberado` (application) | todo |
| 6 | Adapter/repositório Supabase (infrastructure) | todo |
| 7 | UI painel de cronograma da Turma (papel operacional) | todo |
| 8 | UI listagem do Aluno (só conteúdo liberado) | todo |

## Decisões / ADRs relacionados
- Sem ADR próprio (não é decisão difícil de reverter; parte depende de questão aberta §12).
- ADR-0004 — Papel via JWT custom claim (`docs/adr/0004-papel-via-jwt-custom-claim.md` no repo).
