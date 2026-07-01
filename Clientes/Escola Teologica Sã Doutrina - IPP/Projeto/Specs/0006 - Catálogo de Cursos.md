---
numero: "0006"
titulo: Catálogo de Cursos
tier: arquitetural
status: rascunho
fase: 1
modulo: M2
criado: 2026-07-01
atualizado: 2026-07-01
---

# 0006 — Catálogo de Cursos

> Espelho de `specs/0006-catalogo-cursos/` no repositório. Fonte da verdade é o repo — edite
> lá primeiro (`product.md`, `spec.md`, `design.md`, `domain.md`, `tasks.md`) e atualize aqui só o
> resumo.

**Tier:** arquitetural (exige `design.md` + ADR — feitos)
**Status:** rascunho (specs escritas, aguardando clarificação/aprovação e `@dev` implementar)
**Módulo (ESPECIFICACAO.md):** M2 — Catálogo de Cursos e Conteúdo (esta feature é só o Curso; Módulo/Aula é 0007)
**Depende de:** 0005 — Identidade e Acesso (papel via JWT)
**Repo:** `specs/0006-catalogo-cursos/`

---

## Por quê / para quem (product.md)
Abre o bounded context **Educação** (schema `educacao`) — fundação de todo o MVP de oferta e gestão
(M3–M10). Para Secretaria/Administrativo, que criam e publicam Cursos; indiretamente para todos os
módulos que referenciam Curso.

## Resumo (spec.md)
CRUD de **Curso** classificado por **tipo** (Livre/Formação) e **modalidade** (EAD/Presencial), com a
combinação `Livre + Presencial` barrada por invariante + CHECK (ADR-0005 —
`docs/adr/0005-modelo-curso-tipo-e-modalidade.md` no repo). Curso Livre é sempre EAD; Curso de
Formação existe em EAD e presencial (o que o define é ter Turma, não a modalidade). Presencial usa a
mesma lógica de curso, sem vídeo. Escrita restrita a Secretaria/Administrativo por RLS FORCE.

## Critérios de aceite
- [ ] CA0 — Mockup do catálogo aprovado pelo JG antes de codar UI
- [ ] AC-1 — Secretaria/Administrativo cria Curso classificado por tipo e modalidade
- [ ] AC-2 — Combinação Curso Livre + Presencial é rejeitada (invariante + CHECK)
- [ ] AC-3 — Curso de Formação aceita EAD e Presencial
- [ ] AC-4 — Quem não é Secretaria/Administrativo não escreve no catálogo (RLS)
- [ ] AC-5 — Publicar e despublicar altera o status do Curso (com auditoria)
- [ ] AC-6 — Título vazio e classificação fora do domínio são rejeitados

## Fora de escopo
- Módulo e Aula (estrutura de conteúdo) — spec 0007 (M2).
- Vídeo/Vimeo (M10) e Materiais Complementares (M9).
- Turma, Unidade, inscrição, liberação progressiva (drip) — M3/M5.
- Matrícula, Inscrição, Progresso, Presença — M7/M3.
- Preço, Recorrência, pagamento — M8 (nenhum valor monetário aqui).
- Curso Avulso de Música — M6.
- Vitrine pública / SEO — Fase 2.

## Questões em aberto (§12 / design.md)
- Leitura do catálogo por Aluno/Financeiro: só cursos publicados, ou só via matrícula (M3/M4)? Não vira AC até decidir.
- Recorrência por Turma vs. por Curso (não afeta 0006).
- Curso Avulso de Música presencial/EAD/ambos (M6).
- Arquivar/soft-delete de Curso sem quebrar Turmas/Matrículas futuras.

## Tasks (tasks.md)
| # | Task | Status |
|---|------|--------|
| 0 | Mockup do catálogo aprovado pelo JG (CA0) | **bloqueada** — precisa mockup |
| 1 | Value objects tipo/modalidade/status + agregado `Curso` (domínio) | done |
| 2 | Migration schema `educacao` + `cursos` + enums + CHECK + RLS FORCE | done |
| 3 | Policies RLS de `cursos` + testes pgTAP | done |
| 4 | Teste pgTAP do CHECK `chk_livre_so_ead` | done |
| 5 | Casos de uso `CriarCurso`/`EditarCurso` (application) | done |
| 6 | Casos de uso `PublicarCurso`/`DespublicarCurso` (application) | done |
| 7 | Zod na borda + repositório Supabase de cursos (infrastructure) | done |
| 8 | Auditoria em `audit.events` (via trigger — SPEC_DEVIATION resolvido) | done |
| 9 | Tela de catálogo (Secretaria/Administrativo) | **bloqueada** — precisa mockup (CA0) |

> **Status: 8/9 tasks concluídas e verificadas** (vitest, pgTAP, typecheck). Só resta a UI (task 9),
> que depende de mockup aprovado — mesma situação da 0005.

## Decisões / ADRs relacionados
- ADR-0005 — Modelo de Curso: tipo (Livre/Formação) × modalidade (EAD/Presencial) num só agregado (`docs/adr/0005-modelo-curso-tipo-e-modalidade.md` no repo).
- ADR-0004 — Papel via JWT custom claim (claim `user_role` consumida pela RLS deste catálogo).

Link do repo: `specs/0006-catalogo-cursos/`
