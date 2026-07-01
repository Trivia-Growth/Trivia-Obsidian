---
numero: "0019"
titulo: Curso Avulso de Música
tier: pequeno
status: rascunho
fase: 1
modulo: M6
criado: 2026-07-01
atualizado: 2026-07-01
---

# 0019 — Curso Avulso de Música

> Espelho de `specs/0019-curso-avulso-musica/` no repositório. Fonte da verdade é o repo — edite
> lá primeiro (`product.md`, `spec.md`, `tasks.md`) e atualize aqui só o resumo.

**Tier:** pequeno (sem `design.md`/ADR — reusa catálogo/matrícula/pagamento já planejados)
**Status:** rascunho (specs escritas, aguardando clarificação e `@dev`)
**Módulo (ESPECIFICACAO.md):** M6 — Curso Avulso de Música
**Repo:** `specs/0019-curso-avulso-musica/`
**Depende de:** 0006 (catálogo), 0010 (matrícula), 0011 (pagamento avulso), 0005 (papéis)

---

## Por quê / para quem (product.md)
A escola vende aula de música individual com o aluno escolhendo o professor — não cabe em Curso
Livre nem Curso de Formação (dor D8). Falta um produto vendável onde a **matrícula fique vinculada
ao professor escolhido** e a cobrança seja **avulsa**. Para Aluno (contrata), Secretaria/Administrativo
(marca o curso, cura professores) e Professor (recebe matrículas vinculadas).

## Resumo (spec.md)
Um Curso do catálogo pode ser marcado como **Curso Avulso de Música** com uma lista de **professores
disponíveis**; ao contratar, o Aluno **seleciona um professor** e a **Matrícula** (`0010`) fica
**vinculada** a ele; cobrança **avulsa** (`0011`). Sem Turma, sem recorrência.

## Critérios de aceite
- [ ] CA0 — Mockup da tela de seleção de professor aprovado pelo JG antes de codar UI
- [ ] AC-1 — Curso pode ser marcado como Avulso de Música com professores disponíveis
- [ ] AC-2 — Aluno lista os professores disponíveis do curso
- [ ] AC-3 — Contratação exige professor disponível e cria Matrícula avulsa vinculada a ele
- [ ] AC-4 — Selecionar professor não disponível (ou nenhum) é recusado
- [ ] AC-5 — Seleção de professor só se aplica a Curso Avulso de Música
- [ ] AC-6 — Visibilidade do vínculo professor↔matrícula respeita o Papel (RLS)

## Fora de escopo
- Agenda/disponibilidade horária por professor (questão aberta §12).
- Definir a Modalidade do curso (presencial/EAD/ambos — questão aberta §12).
- Preço, cobrança, webhook, ativação (é `0011`); recorrência (é `0012`).
- Criação do agregado Matrícula e CRUD base de Curso (são `0010` e `0006`).
- Presença/Progresso/Materiais/vídeo; split/repasse ao professor (Financeiro Fase 2).
- Troca de professor de matrícula já criada.

## Questões em aberto (§12)
- Curso Avulso de Música é presencial/EAD/ambos? Agenda por professor necessária?
- Menores de idade / responsável financeiro-legal no cadastro?

## Tasks (tasks.md)
| # | Task | Status |
|---|------|--------|
| 1 | Mockup da seleção de professor aprovado pelo JG | todo |
| 2 | Domínio: `TipoCurso avulso_musica` + regra professor obrigatório/disponível | todo |
| 3 | Migration: tipo no curso + `curso_professores_disponiveis` + `matriculas.professor_id` | todo |
| 4 | RLS FORCE de `curso_professores_disponiveis` + valida Papel professor | todo |
| 5 | RLS FORCE do vínculo professor↔matrícula (pgTAP) | todo |
| 6 | Caso de uso `MarcarCursoAvulsoMusica` (application) | todo |
| 7 | Caso de uso `ContratarCursoAvulsoMusica` → chama `CriarMatricula` | todo |
| 8 | Edge Function `contratar-curso-avulso-musica` | todo |
| 9 | UI: marcar curso + selecionar professor ao contratar | todo |

## Decisões / ADRs relacionados
- Sem ADR próprio (tier pequeno). Reusa ADR-0007 (Matrícula agregado central) e ADR-0004 (papel via JWT).
