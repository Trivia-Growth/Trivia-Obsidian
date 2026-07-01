---
numero: "0014"
titulo: EAD — Curso de Formação
tier: pequeno
status: rascunho
fase: 1
modulo: M4
criado: 2026-07-01
atualizado: 2026-07-01
---

# 0014 — EAD — Curso de Formação

> Espelho de `specs/0014-ead-curso-formacao/` no repositório. Fonte da verdade é o repo — edite
> lá primeiro (`product.md`, `spec.md`, `tasks.md`) e atualize aqui só o resumo.

**Tier:** pequeno (feature isolada — não exige `design.md`)
**Status:** rascunho (specs escritas, aguardando clarificação/aprovação)
**Módulo (ESPECIFICACAO.md):** M4 — Modalidade Online (EAD)
**Depende de:** 0008 (Gestão de Turmas), 0010 (Matrículas e Progresso), 0012 (Recorrência)
**Repo:** `specs/0014-ead-curso-formacao/`

---

## Por quê / para quem (product.md)
Curso de Formação EAD tem Turma, janela de inscrição e liberação progressiva — não é comprável a
qualquer momento como o Curso Livre. Falta um fluxo que force a Inscrição só dentro da janela e ligue
a Matrícula à Recorrência (mensalidade). Para o Aluno (EAD), a Secretaria e o Financeiro.

## Resumo (spec.md)
O Aluno se inscreve numa Turma de Curso de Formação EAD **somente dentro da janela de inscrição**; a
Inscrição cria a Matrícula aluno↔Turma (0010) pendente de pagamento e **dispara a Recorrência**
(0012). Fora da janela, bloqueado.

## Critérios de aceite
- [ ] AC-1 — Inscrição dentro da janela cria Matrícula e dispara Recorrência
- [ ] AC-2 — Inscrição antes da abertura da janela é bloqueada
- [ ] AC-3 — Inscrição após o fechamento da janela é bloqueada
- [ ] AC-4 — Inscrição duplicada na mesma Turma é rejeitada
- [ ] AC-5 — Só o próprio Aluno cria sua Inscrição; Matrícula visível a ele e aos papéis de gestão
- [ ] AC-6 — Turma que não é de Curso de Formação EAD não aceita este fluxo

## Fora de escopo
- Criação/edição da Turma e da janela (spec 0008).
- Modelo de Matrícula e transições por pagamento (spec 0010).
- Motor de Recorrência / webhook Pagar.me (specs 0011/0012) — aqui só dispara.
- Liberação progressiva do conteúdo (spec 0009).
- Curso Livre EAD (spec 0013) e Curso de Formação presencial (spec 0015).

## Questões em aberto (ESPECIFICACAO §12)
- Granularidade da Recorrência: por Turma ou por Curso?
- Inadimplência bloqueia acesso? Após quantos dias?
- Menores de idade: responsável financeiro/legal no cadastro?
- Transacionalidade Matrícula × Recorrência se o disparo falhar.

## Tasks (tasks.md)
| # | Task | Status |
|---|------|--------|
| 0 | CA0 — mockup da tela de inscrição aprovado pelo JG | todo |
| 1 | Value object `JanelaInscricao` (domínio) | todo |
| 2 | Regra de domínio `podeInscrever` | todo |
| 3 | Migration `educacao.matriculas` + índice único | todo |
| 4 | RLS FORCE de `educacao.matriculas` + pgTAP | todo |
| 5 | Caso de uso `InscreverEmTurma` (application) | todo |
| 6 | Adapters Supabase (matrículas) + cliente Recorrência | todo |
| 7 | Edge Function `ead-inscrever-turma` | todo |
| 8 | Tela mínima de inscrição (Aluno) | todo |

## Decisões / ADRs relacionados
- Sem ADR nesta feature (não há decisão difícil de reverter).
- ADR-0001 — Dinheiro em centavos (valores da mensalidade).
