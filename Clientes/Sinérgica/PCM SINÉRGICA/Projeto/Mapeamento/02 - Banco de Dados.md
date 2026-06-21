# 02 - Banco de Dados (PCM Sinérgica)

**Data:** 2026-06-18
**Agente:** @data-engineer (Triviaiox) — dimensão: banco
**Fonte:** Verificação direta na PRODUÇÃO via Supabase Management API (SQL), projeto `sfprfvltbtysvtsqutla` (São Paulo)
**Repo comparado:** `/Users/joaogabrielnovais/Documents/Obsidian/Github/pcm-sinergica-v2`

> Tudo neste documento foi confirmado contra o banco de produção em 2026-06-18, não contra o código. Onde não foi possível confirmar, está marcado com **(a confirmar)**.

---

## 1. Visão geral

| Métrica | Valor (produção) |
|---|---|
| Total de tabelas no schema `public` | **63** |
| Tabelas do PCM em uso (`pcm_*` + `laudos_*`) | **41** |
| Tabelas de OUTRO sistema (CRM + assistente "Nina") | **22** |
| Funções no schema `public` (`pg_proc`) | **22** |
| Triggers no schema `public` (não-internos, `pg_trigger`) | **40** |
| Migrations registradas como aplicadas | **17** |
| Migrations no repo (`supabase/migrations/`) | **24** |
| **Migrations do repo NÃO registradas como aplicadas** | **7 (drift)** |

**Resumo do estado:** o banco está dominado pelo PCM (41 tabelas com ~1.111 linhas no total). As 22 tabelas do "outro sistema" (CRM de vendas + assistente Nina) estão **todas vazias (0 linhas)** — são resíduo de um template/sistema anterior, não estão em uso no PCM. Há **drift de migrations**: 7 migrations do repo criaram objetos que **já existem em produção**, mas não foram registradas na tabela de controle `supabase_migrations.schema_migrations`.

---

## 2. Os dois grupos de tabelas

### 2.1 Grupo (a) — PCM em uso: 41 tabelas

Prefixos `pcm_*` (35 tabelas) e `laudos_*` (12 tabelas) — total 41 (na verdade 29 `pcm_*` + 12 `laudos_*`; ver lista). Linhas confirmadas por `pg_stat_user_tables.n_live_tup` (estimativa):

| Tabela | Linhas (~) | Tabela | Linhas (~) |
|---|---|---|---|
| pcm_ordens_servico | **517** | pcm_relatorios_mensais | 5 |
| pcm_wa_messages | 172 | pcm_technicians | 5 |
| pcm_wa_queue | 115 | pcm_auvo_questionarios | 5 |
| pcm_backlog_items | 76 | laudos_agente_analises | 7 |
| pcm_inspecao_itens | 73 | laudos_dps_inputs | 6 |
| pcm_clients | **51** | laudos_dps_resultados | 6 |
| pcm_relatorio_mensal_batches | 26 | laudos_pontos_medicao | 6 |
| pcm_visitas | 12 | laudos_seguranca_inputs | 6 |
| laudos_laudos | 4 | laudos_assinaturas | 5 |
| pcm_auvo_nao_ok | 3 | laudos_edificios | 3 |
| pcm_wa_admins | 3 | pcm_inspecoes | 1 |
| pcm_wa_instances | 1 | pcm_client_contracts | 1 |
| pcm_plan_items | 1 | pcm_profiles | 1 |

Tabelas PCM com **0 linhas** (estrutura pronta, ainda sem dados): `pcm_backlog_analises`, `pcm_equipment_cache`, `pcm_inspecao_analises`, `pcm_materials_catalog`, `pcm_proposal_survey_messages`, `pcm_proposal_surveys`, `pcm_proposal_versions`, `pcm_proposals`, `pcm_relatorio_mensal_config`, `pcm_relatorios_diarios`, `pcm_visita_itens`, `pcm_auvo_webhook_logs`, `laudos_risco_inputs`, `laudos_risco_resultados`, `laudos_seguranca_resultados`.

**Total de linhas grupo PCM: ~1.111.**

### 2.2 Grupo (b) — OUTRO sistema (CRM + Nina): 22 tabelas, TODAS vazias

Nenhuma com prefixo `pcm_`/`laudos_`. **Todas com 0 linhas em produção** — não fazem parte do produto PCM em uso.

| Subsistema | Tabelas (0 linhas cada) |
|---|---|
| CRM de vendas | `deals`, `deal_activities`, `contacts`, `pipeline_stages`, `appointments`, `teams`, `team_members`, `team_functions`, `tag_definitions`, `round_robin_state`, `user_roles`, `profiles` |
| Assistente "Nina" / WhatsApp genérico | `nina_settings`, `nina_processing_queue`, `whatsapp_instances`, `whatsapp_instance_secrets`, `conversations`, `conversation_states`, `messages`, `message_processing_queue`, `message_grouping_queue`, `send_queue` |

**Total de linhas grupo OUTRO: 0.** São arrasto de um template de CRM/atendimento. Candidatas a remoção (a confirmar com o time antes de dropar — algumas funções/triggers ainda as referenciam).

> Observação: o WhatsApp **em uso** pelo PCM (Zé/Evolution API) está nas tabelas `pcm_wa_*` (com dados: 172 mensagens, 115 na fila, 3 admins, 1 instância), e NÃO nas tabelas `whatsapp_instances`/`messages` do grupo OUTRO (vazias).

---

## 3. Principais tabelas `pcm_*` — colunas-chave, FKs e triggers

### pcm_clients (23 colunas, 51 linhas)
Colunas-chave: `id`, `name`, `cnpj`, `type`, `status`, `active`, `whatsapp_group_jid`, `ze_prompt_custom`, `ze_active`, `ze_mode`, `ze_model`, `auvo_customer_id` (UNIQUE), `created_by`.
FKs: `created_by → pcm_profiles.id`.
Triggers: `pcm_clients_updated_at`.

### pcm_ordens_servico (36 colunas, 517 linhas) — tabela central
Colunas-chave: `id`, `client_id`, `tecnico_id`, `technician_id`, `numero_os`, `categoria`, `prioridade`, `status`, `origem`, `origem_ref_id`, `backlog_item_id`, `inspecao_item_id`, `visita_id`, `chamado_pai_id` (auto-ref), `levantamento_decisao`, `levantamento_markup`, `levantamento_obs`, `auvo_task_id`, `auvo_task_url`, `auvo_sync_status`, `auvo_user_to_id/name`, `data_abertura`.
FKs: `client_id → pcm_clients.id`, `tecnico_id → pcm_profiles.id`, `technician_id → pcm_technicians.id`, `backlog_item_id → pcm_backlog_items.id`, `inspecao_item_id → pcm_inspecao_itens.id`, `visita_id → pcm_visitas.id`, `chamado_pai_id → pcm_ordens_servico.id` (auto), `created_by → pcm_profiles.id`.
Triggers: `trg_os_updated_at`.

### pcm_backlog_items (28 colunas, 76 linhas)
Colunas-chave: `id`, `client_id`, `titulo`, `categoria`, GUT (`gravidade`, `urgencia`, `tendencia`), `score_pcm`, `esforco_estimado`, `status`, `origem`, `origem_ref_id`, `chamado_id`, `auvo_os_id`, `citacao_normativa`, `foto_url`, `foto_urls`, `responsavel_id`.
FKs: `client_id → pcm_clients.id`, `chamado_id → pcm_ordens_servico.id`, `created_by → pcm_profiles.id`, `responsavel_id → pcm_profiles.id`.
Triggers: `trg_backlog_updated_at`.

### pcm_visitas (16 colunas, 12 linhas)
Colunas-chave: `id`, `client_id`, `tecnico_id`, `data_visita`, `turno`, `status`, `planejamento_enviado(_em)`, `relatorio_enviado(_em)`, `auvo_os_id`.
FKs: `client_id → pcm_clients.id`, `tecnico_id → pcm_profiles.id`, `created_by → pcm_profiles.id`.
Triggers: `trg_visitas_updated_at`. (Itens em `pcm_visita_itens`, 0 linhas, FK `visita_id`/`client_id`/`backlog_item_id`.)

### pcm_inspecoes (14 colunas, 1 linha) + pcm_inspecao_itens (33 colunas, 73 linhas)
`pcm_inspecoes`: `id`, `client_id`, `titulo`, `data_inspecao`, `tecnico_id`, `status`, contadores (`total_itens`, `itens_conformes`, `itens_nao_conformes`, `itens_atencao`). FKs: `client_id`, `tecnico_id → pcm_profiles.id`, `created_by`. Trigger: `trg_inspecoes_updated_at`.
`pcm_inspecao_itens`: campos do técnico + campos do agente IA (`agente_descricao`, `agente_citacao_normativa`, `agente_prioridade/categoria/gravidade/urgencia/tendencia`, `agente_esforco_horas`, `agente_titulo_backlog`, `agente_analisado_em`), `resultado`, `backlog_item_id`, `enviado_backlog(_em)`, `foto_urls`. FKs: `inspecao_id → pcm_inspecoes.id`, `client_id`, `backlog_item_id → pcm_backlog_items.id`. Triggers: `trg_inspecao_itens_updated_at` **e** `trg_inspecao_itens_contadores` (recalcula contadores da inspeção via `pcm_recalc_inspecao_contadores`).

### pcm_proposals (26 colunas, 0 linhas)
Colunas-chave: `id`, `client_id`, `number`, `version`, `status`, `type`, `mo_value`, `materials_value`, `total_value`, `contract_monthly_value`, `n_technicians`, `visits_per_week`, `docx_path`, `review_log`, `sent_at`, `accepted_at`, `created_by`, `updated_by`.
FKs: `client_id → pcm_clients.id`, `created_by`/`updated_by → pcm_profiles.id`. Triggers: `pcm_proposals_updated_at`.
Relacionadas (todas 0 linhas): `pcm_proposal_versions`, `pcm_proposal_surveys`, `pcm_proposal_survey_messages`.

### pcm_relatorios_mensais (18 colunas, 5 linhas)
Colunas-chave: `id`, `client_id`, `periodo_inicio/fim`, `status` (pendente→…→pronto/erro), `total_os`, `arquivo_url`, `gerado_por`, `auto_habilitado`, `progresso_batches`, `total_batches`, `codigo`. FK: `client_id → pcm_clients.id`. Sem trigger updated_at registrado nesta tabela **(a confirmar)** — não apareceu na lista de triggers.
Pipeline em `pcm_relatorio_mensal_batches` (26 linhas, FK `relatorio_id`) + config em `pcm_relatorio_mensal_config` (0 linhas, PK = `client_id`).
`relatorios_diarios` (`pcm_relatorios_diarios`, 0 linhas): FKs `technician_id → pcm_technicians.id`, `client_id → pcm_clients.id`.

### pcm_wa_* (WhatsApp do Zé — em uso)
- `pcm_wa_instances` (1 linha): `instance_name`, `phone_number`, `active`.
- `pcm_wa_messages` (172 linhas): `group_jid`, `sender_phone/name`, `content`, `message_type`, `from_me`, `wa_message_id`, `metadata`.
- `pcm_wa_queue` (115 linhas): `queue_key`, `wa_message_id`, `message_id`, `process_after`, `processed`. FK: `message_id → pcm_wa_messages.id`.
- `pcm_wa_admins` (3 linhas): `phone_number`, `name`, `profile_id`, `active`. FK: `profile_id → pcm_profiles.id`.

---

## 4. Funções e triggers

- **Funções (`public`): 22.** Ligadas ao PCM: `pcm_get_my_role`, `pcm_handle_new_user`, `pcm_recalc_inspecao_contadores`, `pcm_set_updated_at`, `process_wa_queue_cron`, `update_plan_items_updated_at`, `update_updated_at_column`, `get_auth_user_id`. Ligadas ao OUTRO sistema (CRM/Nina): `claim_message_processing_batch`, `claim_nina_processing_batch`, `claim_send_queue_batch`, `cleanup_processed_message_queue`, `cleanup_processed_queues`, `create_deal_for_new_contact`, `ensure_single_default_instance`, `get_next_closer`, `get_or_create_conversation_state`, `handle_new_user`, `has_role`, `update_client_memory`, `update_conversation_last_message`, `update_conversation_state`.
- **Triggers (`public`, não-internos): 40.** ~17 em tabelas `pcm_*`/`laudos_*` (majoritariamente `*_updated_at`, mais `trg_inspecao_itens_contadores`); os demais ~23 estão nas tabelas vazias do grupo OUTRO (`update_*_updated_at` em deals/contacts/teams/messages/etc., `auto_create_deal_on_contact`, `ensure_single_default_instance_trigger`, `update_conversation_last_message_trigger`).

---

## 5. DRIFT DE MIGRATIONS (achado principal)

Comparação `supabase_migrations.schema_migrations` (aplicadas em produção) × arquivos em `supabase/migrations/` do repo.

**Aplicadas (17):** 003, 004, 005, 006, 007, 008, 009, 20260101000001 (base), 20260101000002 (proposals), 20260527200000 (laudos_spda), 20260529000001, 20260529000002, 20260603000001, 20260603000002, 20260604000001, 20260605000001 (whatsapp_agents), 20260605000002 (ze_model_config).

**No repo mas NÃO registradas (7) — drift:**

| Migration (arquivo) | Cria | Já existe na PRODUÇÃO? |
|---|---|---|
| `20260606000001_preventivo_module` | Tabelas `pcm_equipment_cache`, `pcm_plan_items` + função/trigger `update_plan_items_updated_at` + RLS | **SIM** — ambas as tabelas existem |
| `20260606000002_auvo_integration` | Coluna `pcm_clients.auvo_customer_id` (UNIQUE); colunas `pcm_ordens_servico.auvo_user_to_id/auvo_user_to_name/data_abertura`; índice único `idx_os_auvo_task_id` | **SIM** — coluna em clients (1/1) e as 3 em OS (3/3) presentes |
| `20260606000003_auvo_webhook_log` | Tabela `pcm_auvo_webhook_logs` + índices + RLS | **SIM** — tabela existe |
| `20260608000001_os_chamado_vinculo` | Colunas `pcm_ordens_servico.chamado_pai_id` (auto-FK), `levantamento_decisao`, `levantamento_markup`, `levantamento_obs` + índice | **SIM** — as 4 colunas presentes (4/4) |
| `20260609000001_relatorios_diarios` | Tabela `pcm_relatorios_diarios` + índices + RLS | **SIM** — tabela existe |
| `20260615000001_relatorios_mensais` | Tabelas `pcm_relatorios_mensais`, `pcm_relatorio_mensal_batches`, `pcm_relatorio_mensal_config` + índices + RLS | **SIM** — as 3 tabelas existem |
| `20260616000001_relatorio_codigo` | Coluna `pcm_relatorios_mensais.codigo` + backfill + índice único | **SIM** — coluna existe e backfill aplicado (5/5 linhas com `codigo`) |

**Conclusão do drift:** os objetos das 7 migrations **já estão fisicamente em produção** (tabelas, colunas, índices, backfill confirmados), porém **não constam** na tabela de controle `schema_migrations`. Ou seja, o schema foi aplicado out-of-band (provavelmente push manual via dashboard/SQL ou `db push` sem registro), e o histórico de migrations do repo está dessincronizado do registro de produção.

**Severidade:** o schema em si está OK (não falta nada em produção). O risco é operacional: rodar `supabase db push`/`migration repair` num ambiente novo, ou o CI, pode (a) tentar reaplicar e, embora a maioria use `IF NOT EXISTS`/`ADD COLUMN IF NOT EXISTS` (idempotente), a migration `20260616000001` roda um `UPDATE ... WHERE codigo IS NULL` (idempotente) mas também `CREATE UNIQUE INDEX IF NOT EXISTS` (ok); e `20260606000001` faz `CREATE POLICY` **sem** `IF NOT EXISTS` (vai falhar se reexecutada). Recomenda-se **`supabase migration repair --status applied`** para as 7 versões, alinhando o registro à realidade, em vez de reaplicar.

> Mitigação parcial já embutida: a maioria das migrations usa `IF NOT EXISTS`, então tabelas/colunas não quebram. As exceções de risco em reaplicação são os `CREATE POLICY` sem guarda (preventivo_module, relatorios_diarios, relatorios_mensais).

---

## 6. Pontos de atenção / a confirmar

- **22 tabelas-fantasma (CRM/Nina) vazias** poluindo o schema e gerando 23 triggers + ~14 funções não usadas. Avaliar limpeza. **(a confirmar com o time se há plano de uso futuro.)**
- **`pcm_relatorios_mensais` sem trigger `updated_at`** na lista (tem coluna `updated_at`) — verificar se a atualização é feita na aplicação. **(a confirmar)**
- **Registro de migrations desalinhado** — recomendar `migration repair` das 7 versões antes de qualquer novo `db push`.
- Coluna `pcm_plan_items.responsavel_id` é `uuid` **sem FK** (comentário no SQL: "FK para pcm_team_members quando o módulo de equipe for criado"). Hoje sem integridade referencial.
