---
numero: "0016"
titulo: Presencial — Presença
tier: pequeno
status: rascunho
fase: 1
modulo: M3
criado: 2026-07-01
atualizado: 2026-07-01
---

# 0016 — Presencial — Presença

> Espelho de `specs/0016-presencial-presenca/` no repositório. Fonte da verdade é o repo — edite
> lá primeiro (`product.md`, `spec.md`, `tasks.md`) e atualize aqui só o resumo.

**Tier:** pequeno (só `product.md` + `spec.md` + `tasks.md`; sem `design.md`)
**Status:** rascunho (specs escritas, aguardando `/clarificar` + `@dev` implementar)
**Módulo (ESPECIFICACAO.md):** M3 — Modalidade Presencial
**Depende de:** 0015 (Matrícula manual presencial), 0008 (Gestão de Turmas / encontros), 0005 (papel)
**Repo:** `specs/0016-presencial-presenca/`

---

## Por quê / para quem (product.md)
Presença das Turmas presenciais (Vila Natal, Pinheiros) é feita no papel, sem histórico nem lugar
para a justificativa de falta — dor D4 da ESPECIFICACAO. Para o **Professor** e a **Secretaria**
(que registram) e o **Aluno** (que consulta o próprio histórico).

## Resumo (spec.md)
Registrar a Presença (presente/falta) de cada aluno matriculado, por encontro de uma Turma
presencial, com campo de justificativa na falta, e expor o histórico de Presença do aluno. Escrita
restrita a Professor da Turma / Secretaria / Administrativo (papel via claim `user_role`, spec 0005).

## Critérios de aceite
- [ ] CA0 — Mockup das telas aprovado pelo JG antes de codar UI
- [ ] AC-1 — Professor da Turma registra Presença de um encontro
- [ ] AC-2 — Falta permite justificativa; presença não tem justificativa
- [ ] AC-3 — Registro idempotente por (aluno, encontro): reregistrar atualiza, não duplica
- [ ] AC-4 — Só registra Presença de aluno matriculado e de encontro da própria Turma
- [ ] AC-5 — Registro/alteração bloqueado fora de Professor da Turma / Secretaria / Administrativo
- [ ] AC-6 — Aluno consulta o próprio histórico de Presença
- [ ] AC-7 — Professor/Secretaria/Administrativo consultam o histórico da Turma

## Fora de escopo
- Matrícula do aluno na Turma (é 0015).
- Criação/gestão de Turmas e dos encontros/cronograma (é 0008/M5).
- Progresso por aula do EAD (M4/M7) — conceito distinto de Presença.
- Cálculo de frequência, aprovação/reprovação por faltas, alertas e relatórios.
- Notas/avaliações; consulta por responsável legal de menor (questão em aberto).

## Questões em aberto
- Modelo de "encontro" depende de 0008/M5 (não inventar cronograma aqui).
- Menores de idade: consulta do histórico por responsável legal (§12) — fora do escopo por ora.

## Tasks (tasks.md)
| # | Task | Status |
|---|------|--------|
| 0 | Mockup das telas aprovado pelo JG (CA0) | todo |
| 1 | Value object `SituacaoPresenca` (domínio) | todo |
| 2 | Migration `educacao.presencas` + enum + índice único idempotência | todo |
| 3 | RLS FORCE de `educacao.presencas` + pgTAP | todo |
| 4 | Caso de uso `RegistrarPresenca` (application) | todo |
| 5 | Caso de uso `ConsultarHistoricoPresenca` (application) | todo |
| 6 | Adapter `PresencaRepository` (infrastructure) | todo |
| 7 | Edge Function `registrar-presenca` | todo |
| 8 | UI de registro de Presença por encontro | todo |
| 9 | UI de histórico de Presença do aluno | todo |

## Decisões / ADRs relacionados
- Sem ADR nova (não há decisão difícil de reverter).
- ADR-0004 — Papel via claim `user_role` no JWT (reutilizado da 0005).
