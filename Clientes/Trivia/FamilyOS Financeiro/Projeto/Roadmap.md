---
tags: [projeto, roadmap, fases]
---

# Roadmap — FamilyOS Financeiro

Três fases progressivas. Cada fase entrega algo utilizável antes de avançar.

---

## Fase 1 — Fundação ✅ *(concluída)*

**Objetivo:** Agente conversacional funcionando, família cadastrada, primeiros extratos importados e orçamento básico visível.
**Postura do sistema:** Consulta e visualização. O agente responde, organiza e categoriza. Sem automação ainda.
**Critério de saída:** Lucas consegue perguntar "como foi meu mês?" e receber uma resposta estruturada com dados reais.

### Milestones

- [x] **M1.1** — Infraestrutura pronta (Supabase + Netlify + AIOX instalado)
- [x] **M1.2** — Auth + multi-família funcionando com RLS validado
- [x] **M1.3** — Agente Core no ar: chat web, memória de longo prazo, onboarding conversacional
- [x] **M1.4** — Upload e parser de extratos funcionando (Nubank, Itaú)
- [x] **M1.5** — Orçamento mensal + dashboard central com cards e gráficos

### Stories da Fase 1

| Story | Módulo | Status |
|-------|--------|--------|
| [[Clientes/Trivia/FamilyOS Financeiro/Projeto/Stories/STORY-001 — Setup Infraestrutura]] | Infra | done |
| [[STORY-002 — Auth + Multi-família]] | M11 Segurança | done |
| [[STORY-003 — Agente Core + Chat Web]] | M1 Agente | done |
| [[STORY-004 — Extratos Upload e Parser]] | M2 Extratos | done |
| [[STORY-005 — Extratos Categorização e Revisão]] | M2 Extratos | done |
| [[STORY-006 — Orçamento Mensal]] | M3 Orçamento | done |
| [[STORY-007 — Dashboard Central]] | M9 Dashboard | done |

---

## Fase 2 — Inteligência Financeira ✅ *(concluída)*

**Objetivo:** Agente analisa, compara com metas e sugere ajustes. Investimentos visíveis. WhatsApp funcionando.
**Postura:** IA analisa e sugere; humano decide.
**Critério de saída:** Agente proativamente avisa sobre gastos fora do padrão e sugere ajustes de orçamento.

### Milestones

- [x] **M2.1** — Metas com progresso e projeções
- [x] **M2.2** — Dashboard de investimentos com alocação e simulador
- [x] **M2.3** — WhatsApp com comandos rápidos e webhook funcional
- [x] **M2.4** — Score de Saúde Financeira e Score de Decisão
- [x] **M2.5** — Config LLMs com BYOK por família

### Stories da Fase 2

| Story | Módulo | Status |
|-------|--------|--------|
| [[STORY-008 — Objetivos e Metas]] | M4 Metas | done |
| [[STORY-009 — Investimentos]] | M5 Investimentos | done |
| [[STORY-010 — WhatsApp Z-API]] | M6 WhatsApp | done |
| [[STORY-011 — Inteligência Proativa]] | M10 Proativo | done |
| [[STORY-012 — Config LLMs OpenRouter]] | M8 Config LLMs | done |

### Itens pendentes (infra-dependentes)

- pg_cron para análise semanal e mensagens proativas (requer Supabase Pro)
- Transcrição de áudio via Whisper (requer decisão de provider)
- Tools do agente para metas e investimentos (sprint 4)

---

## Fase 3 — Automação e Ecossistema *(em planejamento)*

**Objetivo:** Processos recorrentes rodam sozinhos. Agente com tools completas. Calendário financeiro. Open Finance.
**Postura:** IA age; humano monitora e excepciona.
**Critério de saída:** Revisão mensal guiada gerada automaticamente; OCR de recibos funcional; tools do agente para metas e investimentos ativas.

### Sprint 4 — Tools + Calendário + OCR

| Story | Módulo | Descrição | Status |
|-------|--------|-----------|--------|
| [[STORY-013 — Tools do Agente]] | M1 Agente | Tools para metas, investimentos, categorias | backlog |
| [[STORY-014 — Calendário Financeiro]] | M3 Orçamento | Linha do tempo: vencimentos, salários, eventos | backlog |
| [[STORY-015 — OCR de Recibos]] | M2 Extratos | Foto de nota fiscal → transação categorizada | backlog |
| [[STORY-016 — Pergunta da Semana]] | M10 Proativo | Card semanal com reflexão proativa do Fin | backlog |

### Sprint 5 — Automação + Visão Patrimonial

| Story | Módulo | Descrição | Status |
|-------|--------|-----------|--------|
| [[STORY-017 — Relatório Mensal Auto]] | M10 Proativo | Narrativa mensal gerada pelo Fin (pg_cron) | backlog |
| [[STORY-018 — Projeção Patrimônio Líquido]] | M9 Dashboard | Gráfico PL de longo prazo com projeções | backlog |
| [[STORY-019 — Score de Decisão]] | M10 Proativo | Avaliação antes de compra grande | backlog |

### Sprint 6 — Ecossistema

| Story | Módulo | Descrição | Status |
|-------|--------|-----------|--------|
| M7 Notion + Obsidian | Relatório mensal e metas no Notion | backlog |
| Open Finance | Sincronização automática com corretoras | backlog |
| Export IR | Agrupamento para declaração de IR | backlog |
| Ollama | Suporte a modelos locais | backlog |

---

## Milestones (Timeline)

| Marco | Data prevista | Status |
|-------|--------------|--------|
| Infraestrutura no ar | 2026-05-04 | ✅ concluído |
| Agente conversando com dados reais | 2026-05-04 | ✅ concluído |
| Fase 1 concluída | 2026-05-04 | ✅ concluído |
| Fase 2 concluída | 2026-05-04 | ✅ concluído |
| Tools do agente integradas | 2026-06 | pendente |
| Fase 3 Sprint 4 início | 2026-05 | pendente |
| Calendário + OCR + Pergunta da Semana | 2026-06 | pendente |
| Fase 3 concluída | 2026-07 | pendente |

---

## Decisões e Histórico

- `2026-05-04` — Projeto iniciado. Documentação base criada no Obsidian e no repositório de código.
- `2026-05-04` — Decisão: OpenRouter como gateway de IA (BYOK por família). Modelo principal: `anthropic/claude-sonnet-4-5`. Parser de extratos: Gemini Flash (custo baixo).
- `2026-05-04` — Decisão: auth via magic link (sem senha). Isolamento total por `family_id` + RLS.
- `2026-05-04` — Decisão: conversa antes de tela. Toda feature deve funcionar via chat antes de virar UI.
- `2026-05-04` — Fase 1 e Fase 2 implementadas. 12 stories concluídas. Frontend redesenhado com design system Trívia (Instrument Serif, Inter Tight, JetBrains Mono; petrol/coral/paper).
- `2026-05-04` — **Redesign v2**: Análise por @analyst, @pm e @ux-design-expert. Design system atualizado para Montserrat + JetBrains Mono, paleta coral quente (#ff7e5f), radius 0.75rem, shadows com tint coral. Dashboard com card hero do agente. Fase 3 detalhada com 7 stories (STORY-013 a STORY-019).
- `2026-05-04` — Config LLMs movida de Fase 3 para Fase 2 (requisito do Agente Core).
