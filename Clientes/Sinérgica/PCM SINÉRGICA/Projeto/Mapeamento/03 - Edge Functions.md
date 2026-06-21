# 03 - Edge Functions — PCM Sinérgica

**Data:** 2026-06-18
**Projeto Supabase:** `sfprfvltbtysvtsqutla` (São Paulo)
**Método:** `supabase functions list` + `functions download` (versão REAL de produção) comparado com o repo `pcm-sinergica-v2`. `verify_jwt` lido via Management API e validado com POST sem header. Secrets e crons confirmados na produção.

---

## Resumo executivo

- **20 Edge Functions ACTIVE em produção.** Todas baixadas e auditadas, exceto `importar-relatorio-pdf` (download falhou com erro 500 do bundler — documentada pela versão do repo, **a confirmar** se idêntica à produção).
- **4 functions existem no repo mas NÃO estão deployadas:** `pcm-generate-proposal`, `pcm-proposal-docx`, `run-migration`, `setup-storage-policies`. O módulo de Propostas no frontend depende dessas duas primeiras — provável feature incompleta/não publicada.
- **Divergência repo × produção:** das 14 functions baixáveis presentes em ambos, **todas batem byte a byte com o repo** (`diff` = SAME). Bom sinal — neste momento o Git está alinhado com a produção das functions auditadas.
- **`verify_jwt`:** 19 das 20 exigem JWT. A única aberta é `laudos-agent` (`verify_jwt=false`).
- **Achado de segurança:** `pcm-auvo-webhook` tem validação por `AUVO_WEBHOOK_SECRET`, mas **esse secret não está configurado** em produção → a checagem de segredo é pulada (cai no `if (expectedSecret)` falso). A proteção real hoje é apenas o JWT anon que o Auvo precisa enviar.
- **2 cron jobs** ativos (pg_cron): fila do Zé (1 min) e worker de relatório mensal (2 min). O `pcm-wa-poller` **não está agendado** em cron (a confirmar se é acionado por outro meio ou está ocioso).

---

## Secrets configurados em produção

Lidos via Management API (valores são hash, só os nomes são visíveis):

| Secret | Usado por |
|--------|-----------|
| `AUVO_API_KEY` / `AUVO_API_TOKEN` | Todas as functions Auvo + relatórios mensais |
| `EVOLUTION_API_URL` / `EVOLUTION_API_KEY` / `EVOLUTION_INSTANCE_ZE` | Zé, webhook WA, poller, grupos, relatório diário enviar |
| `OPENROUTER_API_KEY` | Zé, laudos-agent, analisar-item-inspecao, importar-relatorio-pdf |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Praticamente todas (injetados automaticamente) |
| **`AUVO_WEBHOOK_SECRET`** | **AUSENTE** — esperado por `pcm-auvo-webhook`, não configurado |

`EVOLUTION_INSTANCE_ZE`: o runtime usa o valor do secret. A instância viva e conectada na Evolution é **`ze-pcm-v2`** (state=open, webhook apontando para `pcm-whatsapp-webhook`). Os fallbacks no código (`ze-pcm`, `ze-carlos`, `ze-carlos`) são nomes velhos e só seriam usados se o secret sumisse (dívida SEC-009).

---

## Cron jobs (pg_cron)

| Job | Schedule | Comando |
|-----|----------|---------|
| `process-wa-queue` | `* * * * *` (1 min) | `SELECT process_wa_queue_cron()` — varre `pcm_wa_queue` (não processadas, `process_after <= now()`) e dispara `pcm-ze-agent` por `queue_key` com Bearer service_role |
| `relatorio-mensal-worker` | `*/2 * * * *` (2 min) | `net.http_post` direto para `pcm-relatorio-mensal-worker` com Bearer service_role |

Observação: ambos os crons carregam o **JWT service_role hardcoded** no corpo do job (visível em `cron.job.command`). Funciona, mas é segredo em texto no banco.

---

## Por área

### Área 1 — WhatsApp / Agente Zé

| Function | v | verify_jwt | Gatilho |
|----------|---|-----------|---------|
| `pcm-whatsapp-webhook` | 17 | true | Webhook Evolution (`MESSAGES_UPSERT`) |
| `pcm-ze-agent` | 21 | true | Webhook (via `waitUntil`) + cron `process-wa-queue` + poller |
| `pcm-wa-poller` | 5 | true | Manual / a confirmar (sem cron) |
| `pcm-evolution-groups` | 7 | true | UI (config de Agentes) |

#### `pcm-whatsapp-webhook`
- **Propósito:** ponto de entrada das mensagens do WhatsApp. Recebe o evento da Evolution, resolve o remetente (trata `@lid` do Evolution v2), salva em `pcm_wa_messages`, enfileira em `pcm_wa_queue` com `process_after = now + 3s` (agrupa rajadas) e dispara o `pcm-ze-agent` via `EdgeRuntime.waitUntil` após o delay.
- **Inputs:** payload Evolution `{ event, instance, data }` (aceita `data` em base64).
- **Integrações:** Supabase (service_role) + chama `pcm-ze-agent`.
- **Secrets:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- **Auth:** `verify_jwt=true`. POST sem header → **401** (confirmado). A Evolution envia um **JWT anon** no header `Authorization` configurado no webhook (visto em `/webhook/find/ze-pcm-v2`), por isso passa.
- **Tabelas:** `pcm_wa_messages`, `pcm_wa_queue`.

#### `pcm-ze-agent`
- **Propósito:** o cérebro do Zé. Lê a fila, monta histórico (20 msgs), decide responder ou `SKIP`, roda loop agêntico de tool-calls e envia resposta via Evolution.
- **Dois modos:**
  - **Grupo (cliente):** resolve cliente por `whatsapp_group_jid` em `pcm_clients`; respeita `ze_mode` (`off`/`monitor`/`active`) e `ze_prompt_custom`/`ze_model`. Tools: `criar_chamado`, `listar_chamados_abertos`, `buscar_chamado`, `atualizar_chamado`.
  - **DM (admin/gestor):** valida número em `pcm_wa_admins` (`active=true`); "Agente Geral" com acesso a todos os clientes. Tools: `listar_clientes`, `listar_chamados_cliente`, `buscar_chamado_global`, `criar_chamado`, `atualizar_chamado`.
- **Detecção determinística:** regex para nome "Zé"/menção por @ (IDs `5519982252881` / `124335561912531`) força resposta mesmo se o LLM tentar `SKIP` (rede de segurança).
- **Inputs:** `{ queue_key, sender_phone, is_group }`.
- **Integrações:** Supabase + **OpenRouter** (`google/gemini-2.5-flash`, configurável por cliente) + **Evolution** (`/message/sendText`).
- **Secrets:** `OPENROUTER_API_KEY`, `EVOLUTION_API_URL/KEY`, `EVOLUTION_INSTANCE_ZE`, Supabase.
- **Auth:** `verify_jwt=true`. POST sem header → **401** (confirmado). Acionado com Bearer service_role pelo webhook/cron.
- **Tabelas:** `pcm_clients`, `pcm_wa_admins`, `pcm_wa_queue`, `pcm_wa_messages`, `pcm_ordens_servico`.

#### `pcm-wa-poller`
- **Propósito:** fallback do webhook. Busca as últimas 50 mensagens recebidas na Evolution (`/chat/findMessages`), filtra novas (não existentes em `pcm_wa_messages`), salva, enfileira e dispara o Zé. Monta mapa `@lid → número` via `/chat/findContacts`. Grouping delay de 8s.
- **Inputs:** nenhum obrigatório (POST `{}`).
- **Integrações:** Evolution + Supabase + chama `pcm-ze-agent`.
- **Auth:** `verify_jwt=true` → **401** sem header.
- **Gatilho:** **não há cron** apontando para ele. (a confirmar) — provavelmente botão manual de UI ou resíduo de período em que o webhook estava instável.

#### `pcm-evolution-groups`
- **Propósito:** lista os grupos WhatsApp da instância (`/group/fetchAllGroups`) para a tela de config de Agentes vincular `whatsapp_group_jid` a um cliente.
- **Inputs:** nenhum (GET/POST).
- **Integrações:** Evolution. Não toca o banco.
- **Auth:** `verify_jwt=true`. Fallback de instância no código é `ze-carlos` (velho).

---

### Área 2 — Auvo (gestão de campo)

| Function | v | verify_jwt | Gatilho |
|----------|---|-----------|---------|
| `pcm-auvo-webhook` | 10 | true | Webhook Auvo |
| `pcm-auvo-tasks-sync` | 9 | true | Manual / UI (sync de OS por período) |
| `pcm-auvo-customers-sync` | 5 | true | Manual / UI |
| `pcm-auvo-users-sync` | 8 | true | Manual / UI |
| `pcm-auvo-equipment-sync` | 7 | true | Manual / UI |
| `pcm-auvo-create-task` | 5 | true | UI (criar OS no Auvo a partir do PCM) |
| `pcm-auvo-patch-task-orientation` | 4 | true | UI/fluxo (vincular CH-XXX) |
| `pcm-auvo-import-questionnaire` | 5 | true | `pcm-auvo-webhook` (finalização) + manual |

Padrão comum: todas autenticam no Auvo via `GET /v2/login?apiKey=&apiToken=` para obter `accessToken`, depois chamam `api.auvo.com.br/v2`.

#### `pcm-auvo-webhook` ⚠️
- **Propósito:** recebe eventos do Auvo e sincroniza para o PCM. Entidades tratadas: **Customer (7)**, **Task (4)**, **Equipment (27)** (action 3 = exclusão → desativa/desvincula).
- **Fluxos pós-finalização de task (taskStatus=5):**
  1. Importa questionários → chama `pcm-auvo-import-questionnaire`.
  2. **Ronda** (tipos 179776/220523/220524) → cria OS corretiva para cada item "Não OK".
  3. **Levantamento** (141540) → move OS para `planejamento`.
  4. **FIM VISITA** (137087) → chama `pcm-relatorio-diario-enviar`.
- Detecta `CH-XXX` na orientation/externalId e vincula `chamado_pai_id`.
- **Inputs:** evento(s) Auvo `{ entityType, action, entityId }` (aceita array).
- **Integrações:** Auvo + Supabase + chama `import-questionnaire` e `relatorio-diario-enviar`.
- **Secrets:** `AUVO_API_KEY/TOKEN`, `AUVO_WEBHOOK_SECRET` (esperado, **ausente**), Supabase.
- **Auth:** `verify_jwt=true` → **401** sem header. **Risco:** a validação de `x-webhook-secret` está no código mas, sem o secret configurado, é ignorada. Proteção atual = só o JWT que o Auvo precisa mandar.
- **Tabelas:** `pcm_auvo_webhook_logs`, `pcm_clients`, `pcm_ordens_servico`, `pcm_equipment_cache`, `pcm_technicians`.

#### `pcm-auvo-tasks-sync`
- Sincroniza OS (tasks) do Auvo por cliente/período (default mês corrente) para `pcm_ordens_servico`. Pagina (100/pág), mapeia status Auvo→PCM, resolve técnico por `auvo_user_id`. Upsert por `auvo_task_id`.
- **Inputs:** `{ client_id?, start_date?, end_date? }`.

#### `pcm-auvo-customers-sync`
- Importa todos os clientes do Auvo → `pcm_clients` (upsert por `auvo_customer_id`). Sem parâmetros.

#### `pcm-auvo-users-sync`
- Importa usuários (técnicos) do Auvo + nome de equipe (`/teams`) → `pcm_technicians` (upsert por `auvo_user_id`). Sem FK para `auth.users`.

#### `pcm-auvo-equipment-sync`
- Importa equipamentos por cliente (`associatedCustomerId`) → `pcm_equipment_cache`. **Inputs:** `{ client_id? }`.

#### `pcm-auvo-create-task`
- Cria uma task no Auvo a partir de uma OS do PCM e vincula bidirecionalmente (PCM `os.id` → Auvo `externalId`; Auvo `taskID` → PCM `auvo_task_id`). Mapeia prioridade PCM→Auvo. Default `taskType=228714` (Corretiva). Bloqueia se já vinculada (409).
- **Inputs:** `{ os_id }`.

#### `pcm-auvo-patch-task-orientation`
- Atualiza (PUT) a orientation da task Auvo para incluir `CH-{numero_os}` quando a OS filha vai para `planejamento` — o técnico vê o chamado pai no app Auvo.
- **Inputs:** `{ os_id }` (OS precisa ter `auvo_task_id` + `chamado_pai_id`).

#### `pcm-auvo-import-questionnaire`
- Importa questionários de task finalizada → `pcm_auvo_questionarios` (raw), e para cada "Não OK" cria `pcm_auvo_nao_ok` + item em `pcm_backlog_items` (GUT 3/3/3, tenta achar foto no item seguinte). Idempotente (upsert por `auvo_task_id,questionnaire_id`).
- **Inputs:** `{ os_id? | auvo_task_id? }`.

---

### Área 3 — Relatórios

| Function | v | verify_jwt | Gatilho |
|----------|---|-----------|---------|
| `pcm-relatorio-diario` | 5 | true | Chamada interna / UI (gera texto) |
| `pcm-relatorio-diario-enviar` | 5 | true | `pcm-auvo-webhook` (FIM VISITA) + UI |
| `pcm-relatorio-mensal` | 4 | true | UI / Zé / cron (cria job + batches) |
| `pcm-relatorio-mensal-worker` | 10 | true | Cron 2 min + manual |

#### `pcm-relatorio-diario`
- Gera o relatório diário (técnico × cliente × data) no formato operacional da Sinérgica (`Relatorio - CLIENTE - DD/MM`, planejadas + "Extra"). Só monta o texto/estrutura; não envia.
- **Inputs:** `{ technician_id? | auvo_user_id?, client_id?, date? }`.
- **Tabelas:** `pcm_ordens_servico`, `pcm_clients`, `pcm_technicians`.

#### `pcm-relatorio-diario-enviar`
- Chama `pcm-relatorio-diario`, salva em `pcm_relatorios_diarios` e **envia no grupo WhatsApp** via Evolution (se `client.whatsapp_group_jid` e `ze_active`). Respeita janela de horário por turno (`pcm_visitas`). `dry_run` para preview.
- **Inputs:** `{ technician_id, client_id, date?, dry_run? }`.
- **Integrações:** Supabase + chama `pcm-relatorio-diario` + Evolution. Fallback de instância `ze-carlos` (velho).

#### `pcm-relatorio-mensal`
- Cria o **job** do relatório mensal: lê OS finalizadas do PCM (source of truth) no período, agrupa por dia de visita, divide dias com >10 OS em batches ≤10, cria `pcm_relatorios_mensais` (+ código de rastreio) e enfileira `pcm_relatorio_mensal_batches`. **Não gera PDF** — só enfileira.
- **Inputs:** `{ client_id, periodo_inicio, periodo_fim, gerado_por? }`.

#### `pcm-relatorio-mensal-worker`
- Processa **um batch por execução** (acionado pelo cron de 2 min): busca dados da OS no PCM + detalhes no Auvo (fotos, respostas, assinatura), **gera PDF com `pdf-lib`**, faz merge do batch, sobe no Storage (bucket `pcm-relatorios`). Quando todos os batches terminam → merge final e status `pronto`.
- **Inputs:** `{}` ou `{ relatorio_id }`.
- **Integrações:** Auvo + Supabase Storage + `pdf-lib` (esm.sh).
- **Tabelas:** `pcm_relatorios_mensais`, `pcm_relatorio_mensal_batches`, `pcm_ordens_servico`. **Maior function do projeto (~1075 linhas).**

---

### Área 4 — Inspeções / Laudos / IA documental

| Function | v | verify_jwt | Gatilho |
|----------|---|-----------|---------|
| `laudos-agent` | 11 | **false** | UI (módulo Laudos SPDA) |
| `analisar-item-inspecao` | 8 | true | UI (módulo Inspeções) |
| `importar-relatorio-pdf` | 19 | true | UI (a confirmar — download falhou) |

#### `laudos-agent` ⚠️
- **Propósito:** 4 agentes de laudo SPDA num só endpoint: `analisador_foto` (visão), `consultor_nbr`, `diagnostico`, `redator`. Modelo **`anthropic/claude-sonnet-4-6`** via OpenRouter. Persiste em `laudos_agente_analises` se vier `Authorization` + `laudo_id`.
- **Inputs:** `{ tipo, payload }`.
- **Auth:** **`verify_jwt=false`** — POST sem header retorna **400** (porque exige body `tipo`), não 401. **Única function pública do sistema.** Como gasta tokens de LLM caros (Sonnet), é candidata a abuso/custo se a URL vazar. Recomendado ligar `verify_jwt` ou validar no código.
- **Modelo nomeado:** `claude-sonnet-4-6`.

#### `analisar-item-inspecao`
- Analisa foto + descrição de item de inspeção predial e retorna JSON (título backlog, citação normativa, GUT, esforço). Modelo **`anthropic/claude-sonnet-4-6`**. Grava em `pcm_inspecao_analises`.
- **Inputs:** `{ item_id, inspecao_id, client_id, foto_url, descricao_tecnico, sistema, localizacao }`.
- **Auth:** `verify_jwt=true` → **401** sem header.
- **Modelo nomeado:** `claude-sonnet-4-6`.

#### `importar-relatorio-pdf` (a confirmar)
- **Download da produção falhou** (HTTP 500 "Failed to retrieve function bundle"). Documentado pela versão do repo (168 linhas) — **a confirmar** se idêntica à produção (versão prod é a 19, bem mais avançada que as vizinhas, o que sugere que pode ter divergido).
- **Propósito (repo):** recebe texto já extraído de PDF pelo browser, usa LLM **extrator** (`claude-sonnet-4-6`) para itens e **analisador** (`claude-haiku-4-5`) para enriquecer cada item com norma/GUT.
- **Auth:** `verify_jwt=true` → exige JWT.
- **Modelos nomeados (repo):** `claude-sonnet-4-6` (extrator), `claude-haiku-4-5` (analisador).

---

### Área 5 — Infra / utilidades

| Function | v | verify_jwt | Observação |
|----------|---|-----------|------------|
| `image-proxy` | 7 | true | Busca imagem externa (S3 Auvo) server-side e devolve base64 (contorna CORS). Proteção SSRF básica + limite 5 MB. POST sem header → **401**. Inputs `{ url }`. |

---

## Functions no repo mas NÃO deployadas

| Function | Linhas | O que é |
|----------|--------|---------|
| `pcm-generate-proposal` | 424 | Geração de proposta com IA (survey → orçamentário → revisor, Claude). Portado do `gerador-de-propostas-v2`. **Não deployada** — módulo Propostas no front pode estar quebrado/incompleto. |
| `pcm-proposal-docx` | 272 | Geração de DOCX da proposta. **Não deployada.** |
| `run-migration` | 48 | Utilitário de migração ad-hoc. **Não deployada** (correto — não deve ir pra prod). |
| `setup-storage-policies` | 32 | Setup de policies de Storage. **Não deployada.** |

> **Achado:** a área de Propostas tem código no repo (`modules/proposals`) mas suas duas Edge Functions não estão em produção. Confirmar com o time se Propostas é feature planejada/pausada.

---

## Mapa de chamadas entre functions

```
Evolution (ze-pcm-v2) ──webhook──> pcm-whatsapp-webhook ──> pcm-ze-agent ──> Evolution (sendText)
                                          │ (cron 1min: process_wa_queue_cron)──┘
pcm-wa-poller (fallback) ──────────────> pcm-ze-agent

Auvo ──webhook──> pcm-auvo-webhook ──┬──> pcm-auvo-import-questionnaire ──> backlog
                                     └──> pcm-relatorio-diario-enviar ──> pcm-relatorio-diario + Evolution

UI/Zé ──> pcm-relatorio-mensal (cria batches) ──(cron 2min)──> pcm-relatorio-mensal-worker ──> PDF/Storage
```

---

## Achados e riscos (consolidado)

| Severidade | Achado |
|-----------|--------|
| Alta | `pcm-auvo-webhook` espera `AUVO_WEBHOOK_SECRET` mas o secret **não existe** em produção → validação de segredo desativada. Configurar o secret e o header no painel do Auvo. |
| Média | `laudos-agent` está com `verify_jwt=false` (pública) e usa Claude Sonnet (caro). Risco de abuso/custo se a URL vazar. Ligar `verify_jwt` ou validar no código. |
| Média | `importar-relatorio-pdf` (v19) não pôde ser baixada da produção (bundle 500). Não foi possível confirmar paridade com o repo — **a confirmar**, inclusive se a função ainda builda. |
| Baixa | `pcm-wa-poller` não tem cron nem gatilho claro. Confirmar se é manual ou resíduo. |
| Baixa | Fallbacks de instância Evolution no código (`ze-carlos`/`ze-pcm`) são nomes velhos (SEC-009). Só atuam se o secret sumir, mas confundem. |
| Info | JWT service_role aparece em texto em `cron.job.command` (2 jobs). Funcional, mas é segredo exposto no banco. |
| Info | As 14 functions baixáveis presentes no repo batem byte a byte com a produção — Git alinhado neste momento. |
