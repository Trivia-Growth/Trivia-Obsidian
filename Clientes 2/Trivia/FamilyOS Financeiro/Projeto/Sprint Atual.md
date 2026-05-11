---
tags: [projeto, sprint]
sprint: 3
inicio: 2026-05-04
fim: ""
objetivo: "Inteligência Financeira + Canais Alternativos"
---

# Sprint 3 — Inteligência Financeira + Canais

**Período:** 2026-05-04 — em andamento
**Objetivo:** Metas, investimentos, WhatsApp, inteligência proativa e config de LLMs.

---

## Stories do Sprint

| Story | Status | Agente |
|-------|--------|--------|
| [[STORY-008 — Objetivos e Metas]] | done | @dev |
| [[STORY-009 — Investimentos]] | done | @dev |
| [[STORY-010 — WhatsApp Z-API]] | done | @dev |
| [[STORY-011 — Inteligência Proativa]] | done | @dev |
| [[STORY-012 — Config LLMs OpenRouter]] | done | @dev |

---

## Sprints Anteriores

### Sprint 1 — Fundação Técnica ✅

| Story | Status |
|-------|--------|
| [[Clientes 2/Trivia/FamilyOS Financeiro/Projeto/Stories/STORY-001 — Setup Infraestrutura]] | done |
| [[STORY-002 — Auth + Multi-família]] | done |
| [[STORY-003 — Agente Core + Chat Web]] | done |

### Sprint 2 — Extratos e Orçamento ✅

| Story | Status |
|-------|--------|
| [[STORY-004 — Extratos Upload e Parser]] | done |
| [[STORY-005 — Extratos Categorização e Revisão]] | done |
| [[STORY-006 — Orçamento Mensal]] | done |
| [[STORY-007 — Dashboard Central]] | done |

---

## Critério de conclusão do sprint

- [x] Metas criadas com progresso e contribuições
- [x] Investimentos cadastrados com dashboard de alocação
- [x] WhatsApp webhook funcional com comandos rápidos
- [x] Score de Saúde Financeira e Score de Decisão
- [x] Config de LLMs com BYOK por família
- [ ] pg_cron para automações semanais (dependência infra — Supabase Pro)
- [ ] Mensagens proativas via WhatsApp (depende pg_cron)
- [ ] Áudio via Whisper no WhatsApp (pendente)

---

## Impedimentos

- pg_cron requer plano Supabase Pro — bloqueia automações proativas
- Transcrição de áudio (Whisper) aguardando decisão de provider

---

## Próximo Sprint (previsão)

Sprint 4 — Integração Agente + Polimento (tools do agente, Open Finance, revisão mensal automatizada)
