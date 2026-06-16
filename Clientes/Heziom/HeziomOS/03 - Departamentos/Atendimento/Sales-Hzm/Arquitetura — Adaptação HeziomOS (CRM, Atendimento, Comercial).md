---
projeto: Sales-Hzm
tipo: arquitetura
organizacao: Heziom
status: ativo
criado: 2026-06-15
atualizado: 2026-06-15
---

# Arquitetura — Adaptação do Sales-Hzm → HeziomOS (CRM, Atendimento, Comercial)

> **Propósito:** documento canônico de *gap analysis* baseado no **código real** do Sales-Hzm (68 tabelas, 49 Edge Functions, 30 páginas) cruzado com as notas do HeziomOS. Substitui as suposições do [[Guia — Adaptação Marketing CRM Atendimento]] por um mapa aterrado no que existe de fato.
> **Data:** 15/06/2026 · Ver [[Sales-Hzm — Índice]].

---

## 0. Escopo (o que é e o que NÃO é deste sistema)

**HeziomOS ≠ Sales-Hzm.** O HeziomOS tem ~9 módulos. O **Sales-Hzm é a base de 3 deles**:

- **CRM Unificado** (Fase 2.2 — substitui Flowbiz) 🔴 mais urgente
- **Atendimento** (Fase 2.5 — substitui Unnichat)
- **Comercial Atacado** (Fase 2.3)

**Fora deste sistema** (outros tracks, outro pipeline/Supabase): Financeiro/CEO Dashboard (Fase 1, já existe via sync Deno+Literarius), Editorial, Tarefas, Pessoas, Fiscal. As notas "Features Expandidas/Estudo de APIs" são majoritariamente sobre o **Financeiro** (AppMax, Stone, Mercado Pago, Amazon, ML) — não confundir com o escopo do Sales-Hzm.

> ⚠️ **Risco nº1 de escopo:** puxar Financeiro/Editorial para dentro do Sales-Hzm. Manter separado.

---

## 1. Correções de premissa (notas desatualizadas vs. código real)

As notas foram escritas antes da evolução desta sessão. O que mudou:

| Premissa nas notas | Realidade no código (15/06/2026) |
|---|---|
| "39 Edge Functions" | **49 functions** |
| "criar tabelas de atendimento" | `conversations` (16 col) + `messages` (14 col) **já existem** — inbox omnichannel (channel, ai_mode, provider) |
| "criar motor de réguas" | `flows` + `flow_nodes` + `flow_enrollments` + `flow_execution_log` + `flow_optouts` **já existem** |
| "criar editor de e-mail" | `email_templates` (subject/body_html/body_text/variables) + `EmailTemplatesTab` **já existem** |
| "criar `crm_contacts`" | `contacts` já tem **27 colunas** (rico, B2B-vendas) |
| "criar segmentação" | `cluster_rules` + `ClusterRulesTab` (primitivo) **já existe** |

**Veredito:** a adaptação é **mais "estender e integrar" do que "criar"**. A fundação técnica (WhatsApp multi-provider, IA, automação, RAG, segurança single-tenant) está pronta e verificada E2E.

---

## 2. Inventário real do sistema atual

### 2.1 Tabelas (68) por domínio
- **Contatos/Contas (B2B):** `contacts` (27), `companies` (14), `contact_tags`, `tags`, `contact_products`, `custom_fields`, `custom_field_values`, `cluster_rules`.
- **Pipeline/Vendas:** `pipelines`, `pipeline_stages`, `deals` (40), `quotes`, `products`, `forecast_history`, `activities`.
- **Inbox/Atendimento:** `conversations` (16), `messages` (14), `nps_surveys`, `flow_optouts`.
- **WhatsApp/Canais:** `zapi_instances`, `whatsapp_accounts`, `ai_agents`, `agent_personas`, `agent_memory`, `copilot_profiles`.
- **IA/Conhecimento:** `knowledge_bases`, `knowledge_entries` (embedding_vector), `persona_knowledge_bases`, `ai_predictions`, `ai_providers_config`, `lead_scoring_config`.
- **Automação:** `flows`, `flow_nodes`, `flow_enrollments`, `flow_execution_log`, `routing_rules`.
- **Marketing/Leads:** `email_templates`, `api_tokens`, `inbound_webhooks`, `api_request_logs`.
- **Roleplay/Treino:** `roleplay_*` (5), `preparation_quizzes`/`_attempts`, `training_plans`, `training_daily_logs`, `ai_training_plans`.
- **Reuniões/Calendário:** `meetings`, `meeting_transcripts`, `appointments`, `calendar_events`, `user_integrations`.
- **Plataforma:** `workspaces`, `workspace_members` (com OTE/metas), `profiles`, `superadmins`, `audit_logs`, `notifications`, `feature_flags`, `workspace_feature_flags`, `workspace_integrations`, `oauth_states`, `rate_limits`, `commercial_reports`, `performance_snapshots`.

### 2.2 Edge Functions (49) — destaques
- **WhatsApp:** `whatsapp-router` (abstração provider-agnostic), `zapi-send/-webhook`, `meta-wa-send/-webhook/-test`.
- **IA/Agente:** `ai-orchestrator`, `copilot-suggest`, `test-persona`, `predictive-ai`, `lead-scorer`, `cnpj-enrichment`.
- **Automação:** `flow-engine`, `flow-action-executor`, `routing-engine`, `deal-monitor`.
- **Conhecimento (RAG):** `knowledge-import`, `ingest-knowledge-document`.
- **Vendas:** `commercial-report`, `forecast-aggregator`, `mtd-tracker`, `performance-calculator`, `generate-quote-pdf`.
- **Captura:** `lead-intake`, `inbound-webhook-create/-receive`, `api-token-create`.
- **NPS:** `nps-send`, `nps-csat-webhook`. **Reuniões:** `meetings-*`, `analyze-meeting`. **Roleplay:** vários.

### 2.3 Frontend
30 páginas (inclui **Conversations** = inbox, Pipeline, Contacts, Companies, Flows/FlowEditor, Forecast, Reports, Analytics, Meetings, Calendar, Roleplay) + 14 abas de Settings.

---

## 3. Gap por módulo (delta concreto)

### 3.1 CRM Unificado (Flowbiz) — 🔴 prioridade

| Necessidade | Artefato atual | Ação | Story |
|---|---|---|---|
| Customer cross-channel (CPF) | `contacts` (27 col) | **estender** (cpf_cnpj, type, source_channel, ltv, last_purchase_date, purchase_frequency, avg_order_value, preferred_categories, data_nascimento, genero, is_high_value, is_delinquent) | [[STORY-015 — Customer cross-channel (estender contacts)\|STORY-015]] |
| Histórico de compras | `contact_products` (parcial) | **criar** `crm_contact_purchases` | [[STORY-015 — Customer cross-channel (estender contacts)\|STORY-015]] |
| Migração 96.718 contatos | — | **criar** ETL CSV→contacts (dedup email/CPF) | [[STORY-016 — Migração da base Flowbiz\|STORY-016]] |
| Pedidos/clientes/carrinho (D2C) | — | **criar** integração Tray + webhooks | [[STORY-017 — Integração Tray\|STORY-017]] |
| Parceiros B2B (47k) + pedidos offline | — | **criar** integração Literarius (read-only) | [[STORY-021 — Integração Literarius (parceiros B2B + pedidos)\|STORY-021]] |
| Segmentação dinâmica | `cluster_rules` (estático) | **criar** `crm_segments` (rules_json + auto-refresh) | [[STORY-018 — Segmentação dinâmica\|STORY-018]] |
| Campanhas + métricas | `email_templates` ✅ | **criar** `crm_campaigns` + `campaign-send` + bulk WhatsApp | [[STORY-019 — Campanhas em massa\|STORY-019]] |
| Réguas | `flows`+`flow_enrollments` ✅ | **adaptar** (triggers + ações) | [[STORY-020 — Réguas de relacionamento\|STORY-020]] |
| Dashboard estratégico de cliente | página Analytics + `lib/analytics.ts` ✅ | **estender** (recompra/LTV/ticket/funil/cohort) | [[STORY-022 — Dashboard e Métricas CRM\|STORY-022]] |
| ROI de tráfego + atribuição | `lead-intake` ✅ + CAPI (`heziom-api`) | **criar** (Meta/Google Ads, UTM, MER, lead→compra) | [[STORY-023 — ROI de Tráfego e Atribuição\|STORY-023]] |

> **Decisão:** estender `contacts` (não criar `crm_contacts` paralelo) — `deals`, `conversations`, `activities` já têm FK para `contacts`. As 3 fontes de cliente (Tray D2C / Literarius B2B / Flowbiz) deduplicam por **CPF/CNPJ** no mesmo `contacts`.

### 3.2 Atendimento (Unnichat) — ~60% já existe
**Reusar:** `conversations`/`messages` (inbox), página Conversations, `ai-orchestrator` + personas + `agent_memory`, `knowledge_entries` (RAG), `routing-engine`, `nps-send`. **Criar:** `atendimento_tickets` (RMA troca/devolução), classificação IA dos 5 caminhos (rastreio/estoque/troca/venda/escala), integrações Mandaê/Melhor Envio + Literarius `/Estoque` + Tray `/orders/:id/complete`.

### 3.3 Comercial Atacado — pipeline pronto
`deals` (40 col) + forecast + OTE em `workspace_members` já cobrem. **Criar:** integração Literarius `PUT /PedidoVenda` + agente WhatsApp de atacado (sobre ai-orchestrator).

---

## 4. Integrações externas — status real
**Nenhuma API da editora está integrada no Sales-Hzm hoje** (só Z-API/Meta WhatsApp + OAuth reuniões). Cofres de credenciais prontos: `workspace_integrations` / `user_integrations`.

| API | Para | Bloqueio |
|---|---|---|
| **Tray** | pedidos/clientes/carrinho/cupons | loja-teste bloqueada; CAPI já existe em repo separado (`heziom-api`) |
| **Literarius** (REST+SQL) | estoque/pedidos B2B/47k parceiros | sem paginação; bug `PlanoConta` |
| **Mandaê/Melhor Envio** | rastreio/frete | token de produção pendente |
| **E-mail (Resend/SES)** | campanhas | provedor a definir |

---

## 5. Eventos & Alertas
- **Event bus** (`system_events`, 76 eventos): hoje só há `flow-engine` (gatilhos internos). **Criar/estender** para eventos inter-módulos.
- **Alertas:** `notifications` (in-app) existe. **Criar** dispatcher Teams (Adaptive Cards) + e-mail + `alert_config`/`alert_log`.

---

## 6. Urgências, decisões e riscos
- 🔴 **Flowbiz vence 26/06** (backup feito). Decisão de negócio: **prorrogar 1 mês** OU **stopgap** (boas-vindas + carrinho abandonado mínimos sobre o flow-engine).
- **Decisões:** D1 (WhatsApp Meta Cloud vs Z-API); **consolidação de banco** (`apzbaesprzohoalknzxd` + `eqsjvacbhrezlgqpwipv` → DB unificado); provedor de e-mail.
- **Riscos:** Literarius sem paginação + bug PlanoConta; loja-teste Tray bloqueada; escopo (não puxar Financeiro/Editorial).

---

## 7. Epic CRM — sequência de stories (Fase 2.2) — 9 stories
1. [[STORY-015 — Customer cross-channel (estender contacts)|STORY-015]] — fundação de dados (`contacts` + `crm_contact_purchases`)
2. [[STORY-017 — Integração Tray|STORY-017]] + [[STORY-021 — Integração Literarius (parceiros B2B + pedidos)|STORY-021]] — fontes de cliente/compra (D2C + B2B)
3. [[STORY-016 — Migração da base Flowbiz|STORY-016]] — 96.718 contatos
4. [[STORY-018 — Segmentação dinâmica|STORY-018]] — o diferencial sobre Flowbiz
5. [[STORY-019 — Campanhas em massa|STORY-019]] + [[STORY-023 — ROI de Tráfego e Atribuição|STORY-023]] — campanhas + atribuição/MER
6. [[STORY-020 — Réguas de relacionamento|STORY-020]] — boas-vindas → carrinho abandonado
7. [[STORY-022 — Dashboard e Métricas CRM|STORY-022]] — painel estratégico (transversal, ao final)

> **Fora deste epic:** Atendimento (Fase 2.5) e Comercial (Fase 2.3) terão epics próprios. **Eventos + Alertas (Teams)** são **infra transversal** (§5) — devem virar um epic de infra separado, não CRM-puro.
