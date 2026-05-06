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
- [x] Deal Drawer completo (forecast, próximo passo, velocity, desconto) — Lovable ✅
- [x] Flags visuais no Kanban (sem próximo passo, deal parado, data vencida, commit) — Lovable ✅
- [x] Pipeline Review: visão tabular com filtros, inline edit e export CSV — Lovable ✅
- [x] Equipe expandida: metas mensais, OTE, peso de distribuição — Lovable ✅
- [ ] ICP Tier A/B/C/D: coluna `lead_tier` em contacts + badge no KanbanCard → **STORY-008**
- [ ] Deal Monitor: cron de alertas para deals sem próximo passo / parados → **STORY-008**
- [ ] Routing automático na criação de deals → **STORY-008**

**Stories:** STORY-008
**Status:** `em andamento`

---

## Fase 4 — Analytics & Dashboard *(próxima)*

**Objetivo:** KPIs reais, forecast gerencial e performance individual da equipe.

**Módulos:**
- [ ] Forecast Gerencial (Commit/Best Case/Pipeline por vendedor) → **STORY-009**
- [ ] MTD Tracking com pace indicator e alertas automáticos → **STORY-010**
- [ ] Performance Individual (win rate, ciclo, ticket, ROAS, playbook) → **STORY-011**
- [ ] 9-Box de Performance (matriz resultado × competência) → **STORY-011**

**Stories:** STORY-009, STORY-010, STORY-011
**Status:** `planejada`

---

## Fase 5 — Flow Builder *(futura)*

**Objetivo:** Canvas visual de automações multicanal (WhatsApp + E-mail) com engine de execução.

**Módulos:**
- [ ] Canvas drag-and-drop com React Flow + tipos de bloco → **STORY-012**
- [ ] Flow Engine (cron) + Flow Action Executor → **STORY-012**
- [ ] Templates de e-mail + integração Resend → **STORY-013**
- [ ] Clusterização customizável + gatilhos avançados → **STORY-013**
- [ ] Log de execução visual + simulação de fluxo → **STORY-013**

**Stories:** STORY-012, STORY-013
**Status:** `planejada`

---

## Fase 6 — Ecossistema Completo *(futura)*

**Objetivo:** Plataforma completa pronta para go-to-market com billing.

**Módulos:**
- [ ] Agendamentos com Google Calendar/Outlook (bidirecional) → **STORY-014**
- [ ] NPS/CSAT completo (envio, webhook resposta, health score) → **STORY-014**
- [ ] Pós-venda: alerta renovação 60d, churn reason, upsell notes → **STORY-014**
- [ ] Roleplay: processo seletivo público + planos de treinamento por IA → **STORY-015**
- [ ] Superadmin expandido: impersonação, métricas globais, audit log completo → **STORY-016**
- [ ] API pública: tokens, inbound webhooks, log de requisições → **STORY-016**
- [ ] Planos + limites + billing AppMax (ativação manual) → **STORY-016**
- [ ] LGPD: exportação e deleção de dados de contato → **STORY-016**

**Stories:** STORY-014, STORY-015, STORY-016
**Status:** `planejada`

---

## Milestones

| Marco | Data prevista | Status |
|-------|--------------|--------|
| Fase 1 concluída | 2025-12 | concluído |
| Fase 2 concluída | 2026-04 | concluído |
| Fase 3 concluída | 2026-05 | em andamento |
| Fase 4 concluída | 2026-06 | pendente |
| Fase 5 concluída | 2026-07 | pendente |
| Fase 6 concluída | 2026-08 | pendente |

---

## Decisões e Histórico

- `2026-05-06` — Stories 008–016 documentadas (MVPs 3–6 completos)
- `2026-05-05` — Projeto migrado ao padrão Trivia com TRIVIAIOX instalado; STORY-003 a 007 implementadas (TypeScript strict, Error Boundary, Zod, rate limiting, RLS FORCE, API key DB-first)
- `2026-04` — IA meeting analysis adicionada (edge function `ai-meeting-analysis`)
- `2025-xx` — Roleplay/Treinamento portado do TriviaAtende (22 componentes)
- `2025-xx` — MVPs 0–2 completos pela Lovable (Auth, CRM, WhatsApp+IA)
