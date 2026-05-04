---
tags: [projeto, roadmap, fases]
---

# Roadmap — FamilyOS Financeiro

Três fases progressivas. Cada fase entrega algo utilizável antes de avançar.

---

## Fase 1 — Fundação *(atual)*

**Objetivo:** Agente conversacional funcionando, família cadastrada, primeiros extratos importados e orçamento básico visível.
**Postura do sistema:** Consulta e visualização. O agente responde, organiza e categoriza. Sem automação ainda.
**Critério de saída:** Lucas consegue perguntar "como foi meu mês?" e receber uma resposta estruturada com dados reais.

### Milestones

- [ ] **M1.1** — Infraestrutura pronta (Supabase + Netlify + AIOX instalado)
- [ ] **M1.2** — Auth + multi-família funcionando com RLS validado
- [ ] **M1.3** — Agente Core no ar: chat web, memória de longo prazo, onboarding conversacional
- [ ] **M1.4** — Upload e parser de extratos funcionando (Nubank, Itaú)
- [ ] **M1.5** — Orçamento mensal + dashboard central com cards básicos

### Stories da Fase 1

| Story | Módulo | Status | Prioridade |
|-------|--------|--------|------------|
| [[STORY-001 — Setup Infraestrutura]] | Infra | pronto | alta |
| [[STORY-002 — Auth + Multi-família]] | M11 Segurança | backlog | alta |
| [[STORY-003 — Agente Core + Chat Web]] | M1 Agente | backlog | alta |
| [[STORY-004 — Extratos Upload e Parser]] | M2 Extratos | backlog | alta |
| [[STORY-005 — Extratos Categorização e Revisão]] | M2 Extratos | backlog | alta |
| [[STORY-006 — Orçamento Mensal]] | M3 Orçamento | backlog | média |
| [[STORY-007 — Dashboard Central]] | M9 Dashboard | backlog | média |

---

## Fase 2 — Inteligência Financeira *(futura)*

**Objetivo:** Agente analisa, compara com metas e sugere ajustes. Investimentos visíveis. WhatsApp funcionando.
**Postura:** IA analisa e sugere; humano decide.
**Critério de saída:** Agente proativamente avisa sobre gastos fora do padrão e sugere ajustes de orçamento.

### Módulos previstos

- Objetivos & Metas com projeções reais — [[STORY-008 — Objetivos e Metas]]
- Investimentos: cadastro + dashboard — [[STORY-009 — Investimentos]]
- WhatsApp via Z-API: chat + comandos — [[STORY-010 — WhatsApp Z-API]]
- Inteligência Proativa: detecção de padrões + alertas — [[STORY-011 — Inteligência Proativa]]

*(Stories da Fase 2 serão detalhadas ao final da Fase 1)*

---

## Fase 3 — Automação e Ecossistema *(futura)*

**Objetivo:** Processos recorrentes rodam sozinhos. Integração com Notion, Obsidian e configuração de LLMs por família.
**Postura:** IA age; humano monitora e excepciona.
**Critério de saída:** Revisão mensal guiada gerada automaticamente, relatório no Notion publicado sem intervenção.

### Módulos previstos

- Sincronização Notion (bidirecional) + Export Obsidian
- Configuração de LLMs por família (BYOK + monitor de custo)
- Open Finance (integração automática com corretoras)
- Score de Decisão + Export para IR
- Modelos locais via Ollama

*(Escopo detalhado da Fase 3 será definido durante a Fase 2)*

---

## Milestones

| Marco | Data prevista | Status |
|-------|--------------|--------|
| Infraestrutura no ar | 2026-05 | pendente |
| Agente conversando com dados reais | 2026-06 | pendente |
| Fase 1 concluída | 2026-07 | pendente |
| WhatsApp funcionando | 2026-08 | pendente |
| Fase 2 concluída | 2026-09 | pendente |

---

## Decisões e Histórico

- `2026-05-04` — Projeto iniciado. Documentação base criada no Obsidian e no repositório de código.
- `2026-05-04` — Decisão: OpenRouter como gateway de IA (BYOK por família). Modelo principal: `anthropic/claude-sonnet-4-5`. Parser de extratos: Gemini Flash (custo baixo).
- `2026-05-04` — Decisão: auth via magic link (sem senha). Isolamento total por `family_id` + RLS.
- `2026-05-04` — Decisão: conversa antes de tela. Toda feature deve funcionar via chat antes de virar UI.
