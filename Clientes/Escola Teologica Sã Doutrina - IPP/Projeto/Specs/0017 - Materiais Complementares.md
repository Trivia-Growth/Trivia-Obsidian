---
numero: "0017"
titulo: Materiais Complementares
tier: pequeno
status: rascunho
fase: 1
modulo: M9
criado: 2026-07-01
atualizado: 2026-07-01
---

# 0017 — Materiais Complementares

> Espelho de `specs/0017-materiais-complementares/` no repositório. Fonte da verdade é o repo — edite
> lá primeiro (`product.md`, `spec.md`, `tasks.md`) e atualize aqui só o resumo.

**Tier:** pequeno (feature isolada, reutiliza o domínio de Aula de 0007 → sem `design.md`/`domain.md`)
**Status:** rascunho (specs escritas, ainda não clarificadas nem implementadas)
**Módulo (ESPECIFICACAO.md):** M9 — Materiais Complementares
**Depende de:** 0007 (Conteúdo de Aulas — Aula/Curso/Modalidade); 0005 (Papel via `user_role`)
**Repo:** `specs/0017-materiais-complementares/`

---

## Resumo (spec.md)
Professor/Secretaria/Administrativo anexam Material Complementar a uma **Aula** — tipo **link** (URL)
ou **documento** (upload em bucket **privado** do Storage) — e o **Aluno matriculado** no Curso da
Aula acessa (abre o link ou baixa o documento por URL assinada curta). Não-matriculado é bloqueado por
RLS. É o principal veículo de conteúdo do **presencial**, que não tem vídeo.

## Critérios de aceite
- [ ] AC-0 — Mockup da UI de materiais aprovado pelo JG antes de codar UI
- [ ] AC-1 — Adicionar material do tipo link a uma Aula
- [ ] AC-2 — Adicionar material do tipo documento (upload no Storage privado)
- [ ] AC-3 — Entrada inválida de material é rejeitada (sem objeto órfão)
- [ ] AC-4 — Aluno matriculado acessa material (documento por URL assinada curta)
- [ ] AC-5 — Aluno não-matriculado não acessa (RLS + 403 na URL assinada)
- [ ] AC-6 — Só dono do Curso ou Secretaria/Administrativo gerencia material

## Questões em aberto (§12 — não viram AC)
- Granularidade: material por aula / módulo / curso? Esta spec ancora **na Aula**.
- Inadimplência bloqueia acesso ao material? Após quantos dias? (fora dos AC por ora)

## Fora de escopo
- Cronograma/drip de liberação progressiva (feature 0011 — aqui só consumimos o sinal).
- Ancorar material em Módulo/Curso (questão em aberto).
- Vídeo (Vimeo, M10); versionamento/preview/antivírus.
- Bloqueio por inadimplência e regras de pagamento (M8).

## Tasks (tasks.md)
| # | Task | Status |
|---|------|--------|
| 1 | Value objects `TipoMaterial`/`UrlMaterial` (domínio) | todo |
| 2 | Agregado `MaterialComplementar` (invariantes) | todo |
| 3 | Migration `educacao.materiais_complementares` + CHECK tipo↔coluna | todo |
| 4 | Bucket privado de Storage + policy sem acesso público | todo |
| 5 | RLS FORCE + pgTAP por linha da matriz | todo |
| 6 | Caso de uso `AdicionarMaterialLink` (application) | todo |
| 7 | Caso de uso `AdicionarMaterialDocumento` (compensa órfão) | todo |
| 8 | Adapters Supabase (repo + Storage) na infrastructure | todo |
| 9 | Edge Function `material-signed-url` (URL assinada curta) | todo |
| 10 | Mockup das telas aprovado pelo JG | todo |
| 11 | UI do gestor (adicionar link/documento, listar/remover) | todo |
| 12 | UI do Aluno (listar, abrir link, baixar por URL assinada) | todo |

## Decisões / ADRs relacionados
- Sem ADR próprio (não há decisão difícil de reverter; granularidade está em aberto).
- ADR-0004 — Papel via JWT custom claim (`docs/adr/0004-papel-via-jwt-custom-claim.md` no repo).
