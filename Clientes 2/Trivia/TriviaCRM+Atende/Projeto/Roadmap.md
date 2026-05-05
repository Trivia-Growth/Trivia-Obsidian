# Roadmap — TriviaCRM+Atende

---

## Fase 1 — Base + CRM Core *(concluída)*

**Objetivo:** Workspace multi-tenant funcional com CRM completo (contatos, empresas, pipeline kanban, deals, equipe, dashboard).

**Postura:** Operacional

**Módulos:**
- [x] Auth (email/senha) com Supabase Auth
- [x] Onboarding: criação de workspace + pipeline padrão
- [x] Workspace multi-tenant com RLS
- [x] Contatos: CRUD, busca, tags, vínculo com empresa
- [x] Empresas: CRUD, enriquecimento por CNPJ (BrasilAPI)
- [x] Pipeline Kanban: drag-and-drop, estágios customizáveis
- [x] Deals: CRUD, valor, data prevista, status
- [x] Equipe: listagem, convite por email, roles
- [x] Dashboard: cards de resumo, gráficos Recharts

**Status:** `concluída`

---

## Fase 2 — WhatsApp + IA *(concluída)*

**Objetivo:** Integração WhatsApp via Z-API com agente de IA e copiloto para atendentes.

**Postura:** Autônomo (modo IA)

**Módulos:**
- [x] Configuração de IA: providers, agentes, copiloto, base de conhecimento
- [x] Chat WhatsApp: layout 3 painéis, toggle IA/Humano/Pausado, atribuição
- [x] Agente IA: responde automaticamente quando ai_mode='ai'
- [x] Copiloto: sugestões para atendente humano

**Status:** `concluída`

---

## Fase 3 — Gestão Comercial *(atual)*

**Objetivo:** Deal Drawer avançado com forecast, lead scoring e roteamento de leads.

**Postura:** Operacional

**Módulos:**
- [ ] Deal Drawer completo (forecast, próximo passo, velocity, desconto)
- [ ] Flags visuais no Kanban (sem próximo passo, deal parado, data vencida)
- [ ] Pipeline Review: visão tabular com filtros e export CSV
- [ ] Lead Scoring: edge function `lead-scorer`, ICP Score A/B/C/D
- [ ] Equipe expandida: metas mensais, OTE, peso de distribuição
- [ ] Roteamento de leads: meritocrático / round-robin / manual / segmento

**Status:** `em andamento`

---

## Fase 4 — Analytics & Dashboard *(futura)*

**Objetivo:** KPIs reais, forecast gerencial e performance individual.

**Módulos planejados:** Dashboard KPIs, Forecast Gerencial, MTD Tracking, 9-Box, Performance individual. *(Stories criadas quando Fase 3 estiver concluída)*

**Status:** `planejada`

---

## Fase 5 — Flow Builder *(futura)*

**Objetivo:** Canvas visual de automações com engine de execução e integração e-mail.

**Módulos planejados:** Canvas drag-and-drop, Flow Engine, Resend API. *(Escopo definido durante Fase 4)*

**Status:** `planejada`

---

## Fase 6 — Ecossistema Completo *(futura)*

**Objetivo:** Agendamentos, NPS/CSAT, API pública e billing.

**Módulos planejados:** Google Calendar, NPS/CSAT, Superadmin expandido, API pública, Planos + billing. *(Escopo definido durante Fase 5)*

**Status:** `planejada`

---

## Milestones

| Marco | Data prevista | Status |
|-------|--------------|--------|
| Fase 1 concluída | 2025-12 | concluído |
| Fase 2 concluída | 2026-04 | concluído |
| Fase 3 concluída | [PREENCHER] | pendente |
| Fase 4 concluída | [PREENCHER] | pendente |

---

## Decisões e Histórico

- `2026-05-05` — Projeto migrado ao padrão Trivia com TRIVIAIOX instalado
- `2026-04` — IA meeting analysis adicionada (edge function `ai-meeting-analysis`)
- `2025-xx` — Roleplay/Treinamento portado do TriviaAtende (22 componentes)
