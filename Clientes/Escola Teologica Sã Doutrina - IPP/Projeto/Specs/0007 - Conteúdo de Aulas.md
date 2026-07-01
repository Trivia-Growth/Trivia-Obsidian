---
numero: "0007"
titulo: Conteúdo de Aulas
tier: pequeno
status: rascunho
fase: 1
modulo: M2
criado: 2026-07-01
atualizado: 2026-07-01
---

# 0007 — Conteúdo de Aulas

> Espelho de `specs/0007-conteudo-aulas/` no repositório. Fonte da verdade é o repo — edite lá
> primeiro (`product.md`, `spec.md`, `tasks.md`) e atualize aqui só o resumo.

**Tier:** pequeno (reutiliza o domínio de 0006 → sem `design.md`/`domain.md` próprios)
**Status:** rascunho (specs escritas, aguardando `/clarificar` e `@dev`)
**Módulo (ESPECIFICACAO.md):** M2 — Catálogo de Cursos e Conteúdo
**Depende de:** 0006 (Catálogo de Cursos) e 0005 (Identidade e Acesso)
**Repo:** `specs/0007-conteudo-aulas/`

---

## Resumo (spec.md)
Organiza um Curso (entregue por 0006) em **Módulos** e **Aulas** ordenáveis e publicáveis: criação,
ordenação e publicação. Aula de curso **EAD** pode guardar a **referência** de um vídeo (o vínculo
real com o Vimeo é a feature 0018); curso **Presencial** não expõe campo de vídeo. Só Módulos/Aulas
**publicados** são visíveis ao Aluno.

## Critérios de aceite
- [ ] AC-0 — Mockup do editor de conteúdo aprovado pelo JG antes de codar UI
- [ ] AC-1 — Criar Módulo e Aula sob um Curso
- [ ] AC-2 — Ordenação determinística de Módulos e Aulas
- [ ] AC-3 — Publicação controla visibilidade para o Aluno
- [ ] AC-4 — Vídeo só existe em Aula de curso EAD
- [ ] AC-5 — Curso Presencial não aceita vídeo em Aula
- [ ] AC-6 — Só o dono do curso ou Secretaria/Administrativo edita o conteúdo

## Fora de escopo
- Integração real do Vimeo (embed/thumbnail/metadados) — feature 0018 / M10.
- Materiais Complementares (link/documento) — feature própria M9.
- Liberação progressiva (drip) por cronograma da Turma — feature 0011 / M5.
- Progresso por aula e Presença (M7 / M3).
- CRUD do Curso, Modalidade e classificação — feature 0006 (dependência).
- Matrícula / Inscrição / pagamento (M7 / M8) e Curso Avulso de Música (M6).

## Questões em aberto
- Granularidade de Material Complementar (por aula/módulo/curso) — §12; muda onde o material ancora.
- Troca de Modalidade (EAD→Presencial) com vídeo pré-existente — destino do vídeo é decisão de 0006.

## Tasks (tasks.md)
| # | Task | Status |
|---|------|--------|
| 1 | Value objects `StatusPublicacao`/`Ordem` (domínio) | todo |
| 2 | Agregados `Modulo`/`Aula` + invariante vídeo-só-EAD | todo |
| 3 | Migration `educacao.modulos` + `educacao.aulas` | todo |
| 4 | RLS FORCE (leitura publicado p/ aluno; escrita dono/secretaria/admin) | todo |
| 5 | Constraint/trigger vídeo só em EAD + pgTAP | todo |
| 6 | Casos de uso `CriarModulo`/`CriarAula` (application) | todo |
| 7 | Caso de uso `ReordenarConteudo` (application) | todo |
| 8 | Caso de uso `PublicarConteudo` (application) | todo |
| 9 | Adapter de repositório Supabase (infrastructure) | todo |
| 10 | Mockup do editor aprovado pelo JG | todo |
| 11 | UI do editor de conteúdo | todo |
| 12 | UI de listagem para o Aluno (só publicado) | todo |

## Decisões / ADRs relacionados
- Sem ADR próprio (não introduz decisão difícil de reverter).
- Base de RLS por Papel: ADR-0004 (`docs/adr/0004-papel-via-jwt-custom-claim.md` no repo).
