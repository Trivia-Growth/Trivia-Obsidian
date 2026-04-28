# Roadmap — Organograma PREVIX

> Briefing fonte: [[../Briefing Inicial]]. Decisões técnicas: `architecture.md` no repo de código.

---

## Fase 1 — MVP Interno *(atual)*

**Objetivo:** A liderança da Previx gerencia o organograma corporativo com autonomia total dentro da empresa, sem depender de designer. Substitui o ciclo "PDF estático + designer" pelo ciclo "edita e vê na hora".

**Postura:** Operacional (CRUD completo).

**Cadeia de stories da Fase 1:**

| # | Story | Status | Bloqueada por | Bloqueia | Resumo |
|---|-------|--------|--------------|----------|--------|
| 1 | [[../Stories/STORY-001 — Setup Infraestrutura\|STORY-001]] | ✅ concluido | — | todas | Infra: Lovable + Supabase + Netlify + AIOX + repo + docs |
| 2 | [[../Stories/STORY-002 — Modelo de Dados Inicial\|STORY-002]] | 🟡 em-review | STORY-001 | 003-007 | Schema `pessoas` + `departamentos` + RLS + seed |
| 3 | [[../Stories/STORY-003 — Auth e Edge Function Admin\|STORY-003]] | ✅ concluido | STORY-002 | 004-007 | Auth + Edge Function admin para `app_metadata.user_role` |
| 4 | [[../Stories/STORY-004 — CRUD Departamentos UI\|STORY-004]] | 🟡 em-review | STORY-003 | — | UI CRUD de departamentos com seletor de cor |
| 5 | [[../Stories/STORY-005 — CRUD Pessoas e Storage Fotos\|STORY-005]] | 🟡 em-review | STORY-003 + 004 | 006, 007 | UI CRUD pessoas + upload foto com crop + soft delete |
| 6 | [[../Stories/STORY-006 — Hierarquia Anti-Loop Transitiva\|STORY-006]] | 🟡 em-review | STORY-005 | 007 | Anti-loop transitivo (CTE) + drag-and-drop |
| 7 | [[../Stories/STORY-007 — POC Visual do Organograma\|STORY-007]] | ⚪ backlog | STORY-005 + 006 | — | Cards estilizados + zoom/pan/mini-mapa + busca + filtro (conclui Fase 1) |

**Módulos por status:**
- [✅] Infraestrutura — STORY-001
- [✅] Schema com RLS — STORY-002
- [ ] Autenticação e três papéis — STORY-003
- [ ] CRUD de departamentos com cor customizável — STORY-004 (schema ✅ STORY-002, UI pendente)
- [ ] CRUD de colaboradores com upload de foto — STORY-005 (schema ✅ STORY-002, UI pendente)
- [ ] Hierarquia anti-loop transitiva + drag-and-drop — STORY-006 (auto-loop ✅ STORY-002, transitivo pendente)
- [ ] Visualização rica (zoom, pan, mini-mapa, busca, filtro) — STORY-007

**Critério de saída da Fase 1:** Previx consegue cadastrar todas as ~25 pessoas da estrutura atual, atribuir hierarquia e visualizar o organograma completo no app, sem depender de designer.

**Status:** `em andamento` (2 de 7 stories concluídas)

---

## Fase 2 — Compartilhamento e Exportação *(futura)*

**Objetivo:** Previx envia organograma atualizado a clientes finais sem ciclo do designer. PDF fiel à identidade visual institucional.

**Stories da Fase 2 (todas concluídas em 2026-04-27):**
- ✅ **STORY-008 — Compartilhamento via token público.** Mergeada PR #7.
- ✅ **STORY-009 — Exportação PDF.** ADR-002 fechado em `@react-pdf/renderer` client-side. Mergeada PR #8 (`ec0b1c7`).
- ✅ **STORY-010 — Exportação PNG.** Captura via `html-to-image` em `.react-flow` (filtra Controls/MiniMap). ADR-012 (proposta). Mergeada PR #9 (`f64212c`).
- ✅ **STORY-011 — Auditoria.** Tabela `audit_log` + função genérica `audit_trigger()` SECURITY DEFINER + triggers em `pessoas` e `departamentos`. Página `/admin/auditoria` com filtros (entidade/ação/datas), paginação 50/página e Sheet lateral com diff visual. Detecção de soft-delete e reativação no frontend. ADR-013 (proposta). Mergeada PR #10 (`3aeaa1c`).

**Critério de saída da Fase 2:** Previx envia link público a um cliente final e/ou exporta um PDF de qualidade comercial sem assistência técnica.

**Status:** ✅ `concluída em 2026-04-27` — todas as 4 stories mergeadas em main.

---

## Fase 3 — Diferenciais *(futura)*

**Objetivo:** Aprofundar a proposta de valor com features que o PDF estático nunca poderia entregar. Estabilizar a Previx como referência de cliente "satisfeito que continua expandindo".

**Stories da Fase 3:**
- ✅ **STORY-012 — Histórico com diff visual.** Tabs "Editar | Histórico" no Sheet de edição de pessoa. Timeline reverse-chronológica + resumo curto via `summarizeChange` + DiffSheet on-demand. Editor passou a ler audit_log também. Mergeada PR #11 (`a807a1d`) em 2026-04-27.
- ✅ **STORY-013 — Múltiplas unidades.** Tabela `unidades` + junção `pessoa_unidades` + árvore livre de departamentos via `parent_id`. Visualizador escopado a uma unidade; admin/editor cross-unidade. ADRs 014-015. Mergeada PR #14 (`f714073`) em 2026-04-28.
- ⚪ **STORY-014 — Campos customizáveis.** Tabela `campos_customizados` (admin define) + valores em `pessoas_campos`. Form de pessoa renderiza dinamicamente.
- ✅ **STORY-015 — Modo de impressão otimizado.** `@media print` global + Tailwind `print:` prefix + PrintButton em ambas as páginas. A3 landscape, vetorial nativo. Coexiste com PDF (formal) e PNG (raster). Mergeada PR #12 (`a8f4002`) em 2026-04-27.

**Status:** `em andamento` (2 de 4 concluídas — restam STORY-013 multi-tenancy e STORY-014 campos custom)

> Escopo de Fase 3 será refinado durante Fase 2 — pode ser que "Múltiplas unidades" vire produto separado caso a Previx peça organogramas dos clientes finais (e não da própria estrutura interna).

---

## Milestones

| Marco | Data prevista | Status |
|-------|--------------|--------|
| Setup de infraestrutura (STORY-001) | 2026-04-23 | ✅ concluído |
| Primeiro deploy verde em produção | 2026-04-23 | ✅ concluído (https://organograma-previx.netlify.app) |
| Schema com RLS (STORY-002) | 2026-04-23 | 🟡 em-review (PR #1) |
| Auth funcional (STORY-003) | [PREENCHER] | pendente |
| CRUD pessoas + departamentos (STORY-004 + 005) | [PREENCHER] | pendente |
| Hierarquia drag-and-drop (STORY-006) | [PREENCHER] | pendente |
| Visualização rica (STORY-007) | [PREENCHER] | pendente |
| MVP Fase 1 com 25 pessoas reais cadastradas | [PREENCHER] | pendente |
| Aprovação Previx do MVP Fase 1 | [PREENCHER] | pendente |
| Fase 2 (compartilhamento + PDF + auditoria) entregue | [PREENCHER] | pendente |

---

## Decisões e Histórico

> Registrar aqui decisões importantes de escopo, mudanças de direção ou contexto relevante para o projeto. Decisões técnicas profundas vão em `architecture.md` (ADRs).

- `2026-04-23` — Projeto iniciado seguindo o padrão Trivia (vault + repo de código separados, AIOX, Lovable + Claude).
- `2026-04-23` — Briefing recebido (ver [[../Briefing Inicial]]). Escopo dividido em 3 fases (MVP, Compartilhamento, Diferenciais).
- `2026-04-23` — **ADR-002 pendente:** decisão sobre engine de PDF (puppeteer server vs html2canvas client) postergada para início da Fase 2 — não bloqueia o MVP.
- `2026-04-23` — **ADR-003 pendente:** decisão sobre engine de visualização (`@xyflow/react` provável) postergada para a primeira story de visualização.
- `2026-04-23` — STORY-002 implementada: tabelas `departamentos` + `pessoas` com RLS por papel, 8 policies, 4 índices, 2 triggers, 6 deptos seedados. **ADR-008 fixou `app_metadata.user_role`** como mecanismo do JWT (mais seguro que `user_metadata`).
- `2026-04-23` — Stories STORY-003 a STORY-007 criadas (Fase 1 completa). Encadeamento: 003 (auth) → 004 (UI deptos) → 005 (UI pessoas) → 006 (hierarquia anti-loop) → 007 (visualização rica). STORY-007 conclui a Fase 1.
- `2026-04-23` — Stories STORY-008 a STORY-011 esboçadas para Fase 2 (compartilhamento, PDF, PNG, auditoria). Refinamento detalhado quando Fase 1 estiver concluída.
