# 00b — Verificação Adversarial (re-checagem direta na produção)

**Auditor:** @qa/@security (Triviaiox) — papel adversarial
**Data:** 2026-06-18
**Alvo:** Supabase `sfprfvltbtysvtsqutla` (São Paulo) + Evolution Cloudfy `ze-pcm-v2`
**Método:** SQL direto via Management API, Supabase CLI (functions list / download da versão REAL de prod), POST ao vivo nas Edge Functions, Evolution REST. Não confiei no repo: baixei o código de produção e testei endpoints.

Objetivo: re-verificar de forma independente os fatos mais críticos e fáceis de errar, porque um mapeamento anterior errou contagens e estado de buckets.

---

## Tabela de verificação

| # | Afirmação dos agentes | Verificado em prod (evidência) | Confirmado / Corrigido |
|---|---|---|---|
| 1 | 63 tabelas no schema public | `pg_tables where schemaname='public'` → **63** | **CONFIRMADO** |
| 2 | 41 do PCM (`pcm_*`/`laudos_*`) + 22 de outro sistema | `count filter` → **pcm=41, outro=22** | **CONFIRMADO** |
| 3 | As 22 tabelas "de outro sistema" (CRM/Nina) estão TODAS vazias (0 linhas) | Loop `count(*)` nas 22 → **todas 0**; nenhuma com linhas | **CONFIRMADO** (lista: appointments, contacts, conversation_states, conversations, deal_activities, deals, message_grouping_queue, message_processing_queue, messages, nina_processing_queue, nina_settings, pipeline_stages, profiles, round_robin_state, send_queue, tag_definitions, team_functions, team_members, teams, user_roles, whatsapp_instance_secrets, whatsapp_instances) |
| 4 | Contagens PCM: 51 clientes, 517 OS, 172 wa_messages, proposals=0, inspecoes=1 | Query direta → **clients=51, os=517, wa_msgs=172, proposals=0, inspecoes=1** | **CONFIRMADO** |
| 5 | RLS habilitada em 63/63 tabelas | `pg_class.relrowsecurity` → **rls_enabled=63 / total=63** | **CONFIRMADO** |
| 6 | 0 tabelas com FORCE ROW LEVEL SECURITY (SEC-002) | `pg_class.relforcerowsecurity` → **rls_forced=0** | **CONFIRMADO** (nenhuma FORCE; owner ignora policies) |
| 7 | Dois buckets públicos: `inspecao-fotos` e `pcm-relatorios` (SEC-010) | `storage.buckets` → 5 buckets: **inspecao-fotos=public**, **pcm-relatorios=public**, laudos-fotos=private, laudos-pdf=private, pcm-proposals=private | **CONFIRMADO** quanto aos 2 públicos. **CORREÇÃO de escopo:** existem **5 buckets no total** (não 2); os outros 3 são privados. A afirmação "dois buckets públicos" está certa; só não era a contagem total de buckets. |
| 8 | 20 Edge Functions ACTIVE em produção | `supabase functions list` → **20 ACTIVE** | **CONFIRMADO** (laudos-agent, analisar-item-inspecao, importar-relatorio-pdf, image-proxy, pcm-whatsapp-webhook, pcm-ze-agent, pcm-evolution-groups, 7× pcm-auvo-*, pcm-relatorio-diario, pcm-relatorio-diario-enviar, pcm-wa-poller, pcm-relatorio-mensal, pcm-relatorio-mensal-worker) |
| 9 | Drift de migrations: 24 no repo vs 17 aplicadas (7 não registradas) | Repo: **24 .sql**; `schema_migrations` → **17 versões**. Diferença = **7** | **CONFIRMADO** |
| 10 | As 7 migrations não-registradas já estão fisicamente em produção | `to_regclass` → pcm_equipment_cache, pcm_plan_items, pcm_auvo_webhook_logs, pcm_relatorios_diarios, pcm_relatorios_mensais **todas existem (true)** | **CONFIRMADO** — recomendar `migration repair --status applied`, NÃO reaplicar |
| 11 | IDOR em `pcm-ze-agent.atualizar_chamado` (SEC-001) é real (prod v21) | Baixei pcm-ze-agent v21 de prod. Linhas 606-611: `.from('pcm_ordens_servico').update(updates).eq('numero_os', numeroOs).single()` — **só por numero_os, sem client_id**, rodando com service_role. As tools de leitura (linhas 495, 512, 553) filtram por client_id; só o UPDATE não. | **CONFIRMADO** — IDOR multi-tenant real. numero_os é global (517 OS); grupo de um condomínio edita/cancela OS de qualquer outro |
| 12 | Instância `ze-pcm-v2` conectada (state=open) | Evolution `connectionState/ze-pcm-v2` → **{"state":"open"}** | **CONFIRMADO** |
| 13 | Webhook Evolution com Authorization (apontando p/ pcm-whatsapp-webhook) | Evolution `webhook/find/ze-pcm-v2` → enabled=true, url=`.../pcm-whatsapp-webhook`, **header Authorization Bearer = JWT role `anon`**, events=[MESSAGES_UPSERT, MESSAGES_UPDATE, CONNECTION_UPDATE, QRCODE_UPDATED] | **CONFIRMADO** — webhook ativo COM Authorization, mas é a **anon key pública** (decodei o JWT: `"role":"anon"`). Confirma SEC-013: autenticação só pela anon key embutida no frontend |
| 14 | `laudos-agent` é pública (verify_jwt=false) — SEC-012 | POST ao vivo sem header → **HTTP 400** (não 401). pcm-ze-agent e pcm-whatsapp-webhook → **401** | **CONFIRMADO** — laudos-agent não exige JWT (400 = entrou no código e validou body); as outras barram no 401 da plataforma |
| 15 | Webhook Auvo nunca recebeu eventos; equipment_cache vazia | `pcm_auvo_webhook_logs` → **0**; `pcm_equipment_cache` → **0** | **CONFIRMADO** — automação pós-finalização não dispara; equipamentos nunca sincronizados |
| 16 | Service_role JWT em texto puro no cron.job (SEC-014) | `cron.job` jobid 3 (relatorio-mensal-worker, */2): command contém `net.http_post` com URL da function — JWT no header (truncado no preview, mas presente) | **CONFIRMADO** (parcial) — jobid 3 monta http_post à function; padrão expõe o bearer no metadado. jobid 1 = `process_wa_queue_cron()` (1 min). 2 crons ativos |
| 17 | Fila do WhatsApp zerada (agente 04) | `pcm_wa_queue` → **115 linhas** AGORA | **CORRIGIDO / DIVERGÊNCIA TEMPORAL** — no momento desta auditoria a fila NÃO está zerada (115 itens). Pode ser acúmulo (cron de 1 min reprocessando) ou backlog não drenado. Vale investigar se o ze-agent está processando ou travado |
| 18 | Apenas 1 cliente com Zé ativo | `pcm_clients where ze_mode='active'` → **1** | **CONFIRMADO** |

---

## Sumário do auditor

**Confirmados sem ressalva (12):** contagens de tabelas (63 / 41+22), tabelas-fantasma todas vazias, contagens PCM-chave, RLS 63/63, FORCE 0/63, 20 edge functions, drift de 7 migrations e que seus objetos já existem em prod, IDOR no atualizar_chamado, ze-pcm-v2 open, laudos-agent pública, Auvo webhook/equipment zerados, 1 cliente Zé ativo.

**Correções / ressalvas (2):**
- **Buckets:** "2 públicos" está certo, mas o total é **5 buckets** (3 privados). Os mapeamentos que falaram só em "dois buckets" subnotificaram a existência dos outros 3.
- **Fila WhatsApp:** agente 04 disse "fila zerada"; no momento desta re-checagem `pcm_wa_queue` tem **115 itens**. Estado volátil — não é erro de mapeamento, mas o "zerada" não vale como fato estático. **Recomendo investigar se o processamento da fila está saudável.**

**Achado de segurança reforçado:** o header Authorization do webhook Evolution é a **anon key** (role=anon), não um secret dedicado — qualquer um com a anon key (que está no frontend) injeta mensagens forjadas no pipeline do Zé (SEC-013 confirmado por decodificação do JWT).

Nada inventado. Itens não testados nesta rodada (já cobertos por outros agentes, fora do escopo crítico): paridade byte-a-byte das 14 functions, prompts do Zé, modelos LLM por cliente.
