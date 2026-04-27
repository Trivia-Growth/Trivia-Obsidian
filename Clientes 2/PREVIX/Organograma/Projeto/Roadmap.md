# Roadmap — Organograma PREVIX

> Briefing fonte: [[../Briefing Inicial]]. Decisões técnicas: `architecture.md` no repo de código.

---

## Fase 1 — MVP Interno *(atual)*

**Objetivo:** A liderança da Previx gerencia o organograma corporativo com autonomia total dentro da empresa, sem depender de designer. Substitui o ciclo "PDF estático + designer" pelo ciclo "edita e vê na hora".

**Postura:** Operacional (CRUD completo).

**Módulos:**
- [ ] Autenticação e três papéis (`admin`, `editor`, `visualizador`) — STORY-003
- [~] CRUD de departamentos com cor customizável — schema ✅ (STORY-002), UI pendente (STORY-004)
- [~] CRUD de colaboradores (nome, cargo, depto, foto, e-mail, telefone, status) — schema ✅ (STORY-002), UI pendente (STORY-005)
- [ ] Upload de foto com crop e Supabase Storage
- [ ] Hierarquia com `manager_id` + validação anti-loop (cliente + servidor) — schema parcial ✅ (auto-loop CHECK em STORY-002), CTE recursiva pendente (STORY-006)
- [ ] Visualização do organograma (zoom, pan, mini-mapa)
- [ ] Filtro por departamento e busca por nome (debounced)
- [ ] Drag-and-drop para reorganização hierárquica

**Critério de saída da Fase 1:** Previx consegue cadastrar todas as ~25 pessoas da estrutura atual, atribuir hierarquia e visualizar o organograma completo no app, sem depender de designer.

**Status:** `em andamento`

---

## Fase 2 — Compartilhamento e Exportação *(futura)*

**Objetivo:** Previx envia organograma atualizado a clientes finais sem ciclo do designer. PDF fiel à identidade visual institucional.

**Módulos planejados:**
- Geração de link público com token único + expiração configurável + revogação
- Exportação PDF (3 páginas: institucional, organograma, contatos)
- Exportação PNG do organograma isolado
- Auditoria com log de alterações (visível só para admin)

**Critério de saída da Fase 2:** Previx envia link público a um cliente final e/ou exporta um PDF de qualidade comercial sem assistência técnica.

**Status:** `planejada`

> Bloqueador conhecido: **ADR-002** (engine de PDF) precisa ser decidida no início da Fase 2.

---

## Fase 3 — Diferenciais *(futura)*

**Objetivo:** Aprofundar a proposta de valor com features que o PDF estático nunca poderia entregar. Estabilizar a Previx como referência de cliente "satisfeito que continua expandindo".

**Módulos planejados:**
- Histórico de alterações com diff visual (timeline lateral)
- Múltiplas unidades/contratos (organogramas separados por filial ou cliente final)
- Campos customizáveis (data de admissão, ramal, área de cobertura)
- Modo de impressão otimizado (`@media print`)

**Status:** `planejada`

> Escopo de Fase 3 será refinado durante Fase 2 — pode ser que "Múltiplas unidades" vire produto separado.

---

## Milestones

| Marco | Data prevista | Status |
|-------|--------------|--------|
| Setup de infraestrutura concluído | 2026-04-23 | em andamento |
| Primeiro deploy em produção (placeholder Lovable) | [PREENCHER após Lovable] | pendente |
| MVP Fase 1 com 25 pessoas reais cadastradas | [PREENCHER] | pendente |
| Aprovação Previx do MVP Fase 1 | [PREENCHER] | pendente |
| Fase 2 (compartilhamento + PDF) entregue | [PREENCHER] | pendente |

---

## Decisões e Histórico

> Registrar aqui decisões importantes de escopo, mudanças de direção ou contexto relevante para o projeto. Decisões técnicas profundas vão em `architecture.md` (ADRs).

- `2026-04-23` — Projeto iniciado seguindo o padrão Trivia (vault + repo de código separados, AIOX, Lovable + Claude).
- `2026-04-23` — Briefing recebido (ver [[../Briefing Inicial]]). Escopo dividido em 3 fases (MVP, Compartilhamento, Diferenciais).
- `2026-04-23` — **ADR-002 pendente:** decisão sobre engine de PDF (puppeteer server vs html2canvas client) postergada para início da Fase 2 — não bloqueia o MVP.
- `2026-04-23` — **ADR-003 pendente:** decisão sobre engine de visualização (`@xyflow/react` provável) postergada para a primeira story de visualização.
- `2026-04-23` — STORY-002 implementada: tabelas `departamentos` + `pessoas` com RLS por papel, 8 policies, 4 índices, 2 triggers, 6 deptos seedados. **ADR-008 fixou `app_metadata.user_role`** como mecanismo do JWT (mais seguro que `user_metadata`).
