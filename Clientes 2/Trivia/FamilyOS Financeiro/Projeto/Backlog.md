---
tags: [projeto, backlog]
---

# Backlog — FamilyOS Financeiro

Lista completa de stories organizadas por fase.

---

## Fase 1 — Fundação ✅

| ID | Story | Módulo | Status | Prioridade |
|----|-------|--------|--------|------------|
| [[STORY-001 — Setup Infraestrutura\|001]] | Setup Infraestrutura | Infra | done | 🔴 alta |
| [[STORY-002 — Auth + Multi-família\|002]] | Auth + Multi-família | M11 Segurança | done | 🔴 alta |
| [[STORY-003 — Agente Core + Chat Web\|003]] | Agente Core + Chat Web | M1 Agente | done | 🔴 alta |
| [[STORY-004 — Extratos Upload e Parser\|004]] | Extratos: Upload + Parser LLM | M2 Extratos | done | 🔴 alta |
| [[STORY-005 — Extratos Categorização e Revisão\|005]] | Extratos: Categorização + Revisão | M2 Extratos | done | 🔴 alta |
| [[STORY-006 — Orçamento Mensal\|006]] | Orçamento Mensal por Categoria | M3 Orçamento | done | 🟡 média |
| [[STORY-007 — Dashboard Central\|007]] | Dashboard Central | M9 Dashboard | done | 🟡 média |

---

## Fase 2 — Inteligência Financeira ✅

| ID | Story | Módulo | Status | Prioridade |
|----|-------|--------|--------|------------|
| [[STORY-008 — Objetivos e Metas\|008]] | Objetivos & Metas | M4 Metas | done | 🔴 alta |
| [[STORY-009 — Investimentos\|009]] | Investimentos | M5 Investimentos | done | 🔴 alta |
| [[STORY-010 — WhatsApp Z-API\|010]] | WhatsApp via Z-API | M6 WhatsApp | done | 🔴 alta |
| [[STORY-011 — Inteligência Proativa\|011]] | Inteligência Proativa | M10 Proativo | done | 🟡 média |
| [[STORY-012 — Config LLMs OpenRouter\|012]] | Config LLMs (OpenRouter BYOK) | M8 Config LLMs | done | 🟡 média |

---

## Fase 3 — Automação e Ecossistema (backlog)

### Sprint 4

| ID | Story | Módulo | Status | Prioridade |
|----|-------|--------|--------|------------|
| [[STORY-013 — Tools do Agente\|013]] | Tools do Agente (metas, invest., categorias) | M1 Agente | backlog | 🔴 alta |
| [[STORY-014 — Calendário Financeiro\|014]] | Calendário Financeiro Visual | M3 Orçamento | backlog | 🔴 alta |
| [[STORY-015 — OCR de Recibos\|015]] | OCR de Recibos (foto → transação) | M2 Extratos | backlog | 🟡 média |
| [[STORY-016 — Pergunta da Semana\|016]] | Pergunta da Semana do Fin | M10 Proativo | backlog | 🟡 média |

### Sprint 5

| ID | Story | Módulo | Status | Prioridade |
|----|-------|--------|--------|------------|
| [[STORY-017 — Relatório Mensal Auto\|017]] | Relatório Mensal Automático (pg_cron) | M10 Proativo | backlog | 🟡 média |
| [[STORY-018 — Projeção Patrimônio Líquido\|018]] | Projeção de Patrimônio Líquido | M9 Dashboard | backlog | 🟡 média |
| [[STORY-019 — Score de Decisão\|019]] | Score de Decisão (antes de compra grande) | M10 Proativo | backlog | 🟢 baixa |

### Sprint 6 (Ecossistema)

| Módulo | Descrição | Status |
|--------|-----------|--------|
| M7 Notion + Obsidian | Sincronização bidirecional Notion, export Obsidian | backlog |
| M10 Export IR | Agrupamento para declaração de imposto de renda | backlog |
| Open Finance | Integração automática com corretoras | backlog |
| Modelos locais | Suporte a Ollama para famílias com servidor local | backlog |

---

## Itens Pendentes (cross-cutting)

| Item | Depende de | Impacto |
|------|-----------|---------|
| pg_cron automações | Supabase Pro | STORY-010 CA4, STORY-011 CA8/CA9 |
| Áudio Whisper | Provider decision | STORY-010 CA5 |
| Tools do agente | Sprint 4 | STORY-008 CA4/CA6, STORY-009 CA3/CA6 |
| Revisão Mensal Guiada | pg_cron + tools | STORY-011 CA9 |
