---
numero: "0010"
titulo: Matrículas e Progresso
tier: arquitetural
status: rascunho
fase: 1
modulo: M7
criado: 2026-07-01
atualizado: 2026-07-01
---

# 0010 — Matrículas e Progresso

> Espelho de `specs/0010-matriculas-progresso/` no repositório. Fonte da verdade é o repo — edite
> lá primeiro (`product.md`, `spec.md`, `design.md`, `domain.md`, `tasks.md`) e atualize aqui só o resumo.

**Tier:** arquitetural (exige `design.md` — feito)
**Status:** rascunho (specs escritas, aguardando clarificação/aprovação e `@dev`)
**Módulo (ESPECIFICACAO.md):** M7 — Matrículas e Progresso
**Repo:** `specs/0010-matriculas-progresso/`

---

## Por quê / para quem (product.md)
O vínculo aluno↔conteúdo vive espalhado hoje (dores D2/D3). Sem uma **Matrícula** central, nenhuma
venda entrega acesso e nenhum pagamento ativa o aluno. Para Aluno, Secretaria/Administrativo,
Financeiro e Professor. É pré-requisito das vendas (0013/0014/0015/0019) e do pagamento (0011).

## Resumo (spec.md)
Agregado **Matrícula**: vínculo aluno↔(um Curso Livre **ou** uma Turma), com **status derivado do
pagamento** (`pendente`/`ativa`/`inadimplente`/`cancelada`, ADR-0007 — `docs/adr/0007-matricula-agregado-central.md`
no repo). Sobre ela: **Progresso** por aula no EAD e **histórico do aluno**. As transições de status
são disparadas pela feature de pagamento (M8 — 0011 pagamento / 0012 recorrência); esta spec modela o agregado e a máquina de estados.

## Critérios de aceite
- [ ] CA0 — Mockup das telas de leitura aprovado pelo JG antes de codar UI
- [ ] AC-1 — Matrícula nasce com alvo exclusivo (curso OU turma) e status `pendente`
- [ ] AC-2 — Sem matrícula duplicada não-cancelada para o mesmo aluno↔alvo
- [ ] AC-3 — Status transita só pelas arestas permitidas da máquina de estados
- [ ] AC-4 — Ativação por pagamento é idempotente
- [ ] AC-5 — Progresso por aula existe só para EAD e é idempotente
- [ ] AC-6 — Aluno só vê e mexe nas próprias matrículas e progresso
- [ ] AC-7 — Papéis de gestão veem o que seu papel permite (secretaria/admin/financeiro todas; professor só dos seus cursos)

## Fora de escopo
- Telas/fluxos de venda que criam a Matrícula (0013/0014/0015/0019).
- Cobrança, recorrência e webhook do Pagar.me que dispara as transições (M8 — 0011 pagamento / 0012 recorrência).
- Regra de inadimplência (bloqueia acesso? após quantos dias?) — questão aberta §12.
- Presença (M3), janela de inscrição e liberação progressiva/drip (M5).
- Curso Avulso de Música e seleção de professor (M6/0015).
- Valores/preços — decididos no backend do M8; sem campo de dinheiro aqui.

## Questões em aberto (ESPECIFICACAO §12)
- Granularidade da recorrência: mensalidade por Turma ou por Curso? (afeta se a Matrícula é por turma
  ou reaproveitada entre turmas do mesmo curso).
- Inadimplência bloqueia acesso? após quantos dias? (efeito da transição é do M8 — 0011 pagamento / 0012 recorrência).
- Curso Avulso de Música é EAD/presencial/ambos? (define se tem Progresso).
- Menores de idade: responsável financeiro/legal no cadastro?

## Tasks (tasks.md)
| # | Task | Status |
|---|------|--------|
| 0 | Mockup das telas aprovado pelo JG (CA0) | todo |
| 1 | Value object `StatusMatricula` + transições permitidas (domínio) | todo |
| 2 | Value object `AlvoMatricula` (curso XOR turma) (domínio) | todo |
| 3 | Agregados `Matricula` e `ProgressoAula` (domínio) | todo |
| 4 | Migration `educacao.matriculas` + `progresso_aulas` | todo |
| 5 | RLS FORCE + testes pgTAP | todo |
| 6 | Caso de uso `CriarMatricula` (application) | todo |
| 7 | Caso de uso `TransicionarStatusMatricula` (application) | todo |
| 8 | Caso de uso `MarcarAulaConcluida` (application) | todo |
| 9 | Repositório Supabase (infrastructure) | todo |
| 10 | UI "Meus Cursos" / progresso | todo |
| 11 | UI "Histórico do aluno" | todo |
| 12 | Auditoria em `audit.events` | todo |

## Decisões / ADRs relacionados
- ADR-0007 — Matrícula como agregado central de vínculo aluno↔(curso ou turma), com status derivado
  do pagamento (`docs/adr/0007-matricula-agregado-central.md` no repo).
- ADR-0004 — Papel via JWT custom claim (RLS por papel).
- ADR-0001 — Dinheiro em centavos (quando M8 tocar valor).
