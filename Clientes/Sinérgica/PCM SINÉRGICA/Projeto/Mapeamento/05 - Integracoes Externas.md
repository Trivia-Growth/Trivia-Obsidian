# 05 - Integrações Externas — PCM Sinérgica

**Data:** 2026-06-18
**Projeto Supabase:** `sfprfvltbtysvtsqutla` (São Paulo)
**Fonte:** código em `pcm-sinergica-v2` + verificação direta na PRODUÇÃO (Management API, REST service_role, Supabase CLI, Evolution API)

> Este documento cobre **Auvo**, **OpenRouter** e o **resumo** da Evolution (WhatsApp). O detalhe completo da Evolution está no doc **04**.

---

## 0. Visão geral das integrações

| Integração | Função no PCM | Direção | Estado em produção |
|---|---|---|---|
| **Auvo** (gestão de campo) | Fonte de verdade de clientes, técnicos, equipamentos, tasks/OS e questionários | Auvo ↔ PCM (bidirecional) | **Parcial** — sync de clientes/técnicos/tasks rodou; webhook e equipamentos NÃO funcionando (ver §1.7) |
| **OpenRouter** (LLM) | Cérebro do Zé, laudos SPDA, inspeção, import de PDF, propostas, relatório mensal | PCM → OpenRouter | Ativo |
| **Evolution API** (WhatsApp) | Canal de mensagens do Zé com os grupos dos condomínios | PCM ↔ WhatsApp | Conectado (instância `ze-pcm-v2`, state `open`) — detalhe no doc 04 |

---

## 1. AUVO

**Base da API:** `https://api.auvo.com.br/v2`
**Autenticação:** login por `apiKey` + `apiToken` na query string → retorna `accessToken` (Bearer). Cada function faz seu próprio login a cada execução (não há cache de token).

### 1.1 Functions Auvo (todas ACTIVE em produção)

| Function | Versão prod | Gatilho | O que faz | Tabela(s) que escreve |
|---|---|---|---|---|
| `pcm-auvo-customers-sync` | 5 | Manual / cron (a confirmar) | Pagina `/customers` (100/pág) e faz upsert de cada cliente | **`pcm_clients`** (onConflict `auvo_customer_id`) |
| `pcm-auvo-users-sync` | 8 | Manual / cron (a confirmar) | Pagina `/users` + enriquece com `/teams`; upsert de técnicos | **`pcm_technicians`** (onConflict `auvo_user_id`) |
| `pcm-auvo-equipment-sync` | 7 | Manual / por cliente | Para cada `pcm_clients` com `auvo_customer_id`, pagina `/equipments` filtrando por `associatedCustomerId` | **`pcm_equipment_cache`** (onConflict `client_id,auvo_id`) |
| `pcm-auvo-tasks-sync` | 9 | Manual / cron (default mês corrente) | Para cada cliente, pagina `/tasks` no período; mapeia status Auvo→PCM; resolve técnico | **`pcm_ordens_servico`** (onConflict `auvo_task_id`) |
| `pcm-auvo-create-task` | 5 | Body `{ os_id }` (app) | Cria task no Auvo a partir de uma OS do PCM e faz o link bidirecional (PCM `os.id` → Auvo `externalId`; Auvo `taskID` → PCM `auvo_task_id`) | `pcm_ordens_servico` (update de volta) |
| `pcm-auvo-webhook` | 10 | Webhook do Auvo (HTTP) | Recebe eventos de customer/task/equipment e dispara fluxos pós-finalização | `pcm_auvo_webhook_logs`, `pcm_clients`, `pcm_ordens_servico`, `pcm_equipment_cache` |
| `pcm-auvo-import-questionnaire` | 5 | Body `{ os_id \| auvo_task_id }` (chamada pelo webhook ou manual) | Importa questionários de task finalizada; gera backlog dos "Não OK" | `pcm_auvo_questionarios`, `pcm_auvo_nao_ok`, `pcm_backlog_items` |
| `pcm-auvo-patch-task-orientation` | 4 | Body `{ os_id }` (app) | Faz `PUT /tasks/{id}` para inserir `CH-{numero_os}` na orientação que o técnico vê no app Auvo | `pcm_ordens_servico` (update `descricao`) |

> **Atenção (divergência de naming):** os nomes das functions usam `pcm-auvo-*`, mas as tabelas de destino dos syncs **NÃO** são `pcm_auvo_*` — são as tabelas centrais do PCM (`pcm_clients`, `pcm_technicians`, `pcm_equipment_cache`, `pcm_ordens_servico`). Só o **webhook** e o **import de questionário** escrevem em tabelas com prefixo `pcm_auvo_*`.

### 1.2 Mapeamento de status (task Auvo → status PCM)

`pcm-auvo-tasks-sync` e `pcm-auvo-webhook` usam o mesmo mapa:

| Auvo `taskStatus` | Significado Auvo | Status PCM |
|---|---|---|
| 5 | Finalizada | `finalizado` |
| 3 / 4 | CheckIn / CheckOut | `em_execucao` |
| 2 | Deslocamento | `em_execucao` |
| 1 / outros | Aberta etc. | `corretiva` |

### 1.3 Fluxo do webhook (`pcm-auvo-webhook`) — entityTypes

| `entityType` | Entidade | Ação principal |
|---|---|---|
| 7 | Customer | upsert em `pcm_clients`; `action=3` → desativa cliente |
| 4 | Task | busca task completa, resolve cliente/técnico, upsert em `pcm_ordens_servico`; `action=3` → desvincula (`auvo_task_id=null`) |
| 27 | Equipment | upsert em `pcm_equipment_cache`; `action=3` → `ativo=false` |

**Detecção de chamado pai:** ao processar uma task, o webhook procura `CH-XXX` na `orientation`/`externalId` e vincula a OS a um `chamado_pai_id` (match por `numero_os` + `client_id`).

### 1.4 Fluxos pós-finalização (task finalizada, `taskStatus=5`)

Disparados pelo `pcm-auvo-webhook` quando a task fecha:

| Condição | Ação | Task type ID (hardcoded no código) |
|---|---|---|
| Task tem questionários | Chama `pcm-auvo-import-questionnaire` | — |
| Task é **Ronda** + tem questionários | Cria uma OS corretiva (`status=solicitacao`, `origem=vistoria`) para cada item "Não OK" | `179776` (BRP Ronda Semanal), `220523` (Luggo Ronda Diária), `220524` (Tennessee) |
| Task é **Levantamento de Serviço e Material** | Move OS para `status=planejamento` (aguardando ação) | `141540` |
| Task é **FIM VISITA** + tem técnico e cliente | Chama `pcm-relatorio-diario-enviar` (gera relatório diário + envia no WhatsApp) | `137087` |

`pcm-auvo-create-task` usa `DEFAULT_TASK_TYPE_ID = 228714` (Corretiva) quando a OS não tem tipo definido.

### 1.5 Import de questionário (`pcm-auvo-import-questionnaire`)

1. Resolve a OS por `os_id` ou `auvo_task_id`.
2. Busca a task completa no Auvo (inclui `questionnaires`).
3. Para cada questionário: upsert em **`pcm_auvo_questionarios`** (onConflict `auvo_task_id,questionnaire_id`) com `raw_data` bruto.
4. Para cada item "Não OK" (detecção restrita às variantes literais "não ok"/"nao ok"): cria item em **`pcm_backlog_items`** (`origem=auvo_questionario`, GUT 3/3/3) **e** registro de rastreio em **`pcm_auvo_nao_ok`** ligando questionário ↔ OS ↔ backlog.
5. Tenta anexar foto: olha o item seguinte do questionário e captura URL se for `.jpg/.png/s3.amazonaws`.

### 1.6 Dados em produção (contagem real — 2026-06-18)

| Tabela | Linhas | Observação |
|---|---|---|
| `pcm_clients` | **51** | 49 com `auvo_customer_id` (96% vindos do Auvo) |
| `pcm_technicians` | **5** | 5 com `auvo_user_id` (100%); último sync **2026-06-06 23:01** |
| `pcm_equipment_cache` | **0** | **VAZIA** — equipamentos nunca sincronizados |
| `pcm_ordens_servico` | **517** | 509 com `auvo_task_id` (98%); último sync **2026-06-16 09:45**; 500 sincronizadas nos últimos 7 dias |
| `pcm_auvo_webhook_logs` | **0** | **VAZIA** — webhook do Auvo nunca registrou um evento |
| `pcm_auvo_questionarios` | **5** | importados em **2026-06-07 ~01:14** (janela única, provável teste manual) |
| `pcm_auvo_nao_ok` | **3** | mesma origem |
| `pcm_backlog_items` | **76** | apenas 3 com `origem=auvo_questionario` |

### 1.7 Diagnóstico de sincronização real

- **Sync de tasks/OS: FUNCIONANDO.** 509/517 OS linkadas ao Auvo, 500 atualizadas nos últimos 7 dias, último sync 16/06. Esse é o fluxo vivo.
- **Sync de clientes: FUNCIONANDO.** 49/51 clientes vindos do Auvo.
- **Sync de técnicos: rodou uma vez** (06/06), 5 técnicos. Não há reexecução recente (a confirmar se há cron).
- **Equipamentos: NÃO funcionando.** `pcm_equipment_cache` está zerada. O `equipment-sync` depende de chamada manual por cliente e aparentemente nunca foi executado com sucesso em volume.
- **Webhook do Auvo: NÃO está chegando.** `pcm_auvo_webhook_logs` = 0 linhas. A function está ACTIVE, mas nenhum evento foi registrado — ou o webhook não está cadastrado no painel do Auvo, ou está apontando para outro lugar. **Consequência:** todos os fluxos pós-finalização (relatório diário via FIM VISITA, corretivas de ronda, import automático de questionário, levantamento→planejamento) **não disparam automaticamente** hoje; a sincronização de tasks vem do `tasks-sync` (polling/manual), não do webhook. **(a confirmar no painel Auvo se o webhook está registrado e com que URL/secret.)**
- **Questionários: só 5 registros, todos de uma janela de ~1 min em 07/06** — consistente com teste manual do `import-questionnaire`, não com operação contínua (que dependeria do webhook).

### 1.8 Secrets do Auvo (produção — confirmados via `supabase secrets list`)

| Secret | Presente em prod? | Uso |
|---|---|---|
| `AUVO_API_KEY` | ✅ | login na API Auvo |
| `AUVO_API_TOKEN` | ✅ | login na API Auvo |
| `AUVO_WEBHOOK_SECRET` | ❌ **ausente** | O webhook só valida o header `x-webhook-secret` **se** esse secret existir. Como não existe em prod, **a validação de segredo do webhook está desativada** — qualquer POST válido é aceito. Risco de segurança (a tratar). |

---

## 2. OPENROUTER (LLM)

**Endpoint:** `https://openrouter.ai/api/v1/chat/completions`
**Auth:** `Authorization: Bearer ${OPENROUTER_API_KEY}` + headers `HTTP-Referer` e `X-Title` (variam por function).
**Helper compartilhado:** `_shared/utils.ts → callOpenRouter()` (usado pelas propostas). As demais functions têm seu próprio `callLLM`/`fetch`.

### 2.1 Onde é usado e qual modelo cada um (lido do código)

| Function | Uso | Modelo(s) | max_tokens |
|---|---|---|---|
| `pcm-ze-agent` | **Zé** — agente WhatsApp que abre/consulta chamados (com tools, `tool_choice: auto`) | `google/gemini-2.5-flash` (hardcoded `MODEL`); pode ser sobrescrito por cliente via `pcm_clients.ze_model` | 500 |
| `laudos-agent` | 4 agentes de **Laudos SPDA** (analisador de foto, consultor NBR, diagnóstico, redator) numa só function | `anthropic/claude-sonnet-4-6` | 1024 (default) |
| `analisar-item-inspecao` | **Inspeção** — análise de item/foto de inspeção | `anthropic/claude-sonnet-4-6` | 1024 |
| `importar-relatorio-pdf` | Import de **PDF de relatório**: extrator + analisador (2 passes) | extrator `anthropic/claude-sonnet-4-6`; analisador `anthropic/claude-haiku-4-5` | — |
| `pcm-generate-proposal` | **Propostas** — gera proposta orçamentária + revisor (2 passes, com tools) | `anthropic/claude-sonnet-4-5` (ambos os passes) | 8000 (gerador) / 4000 (revisor) |
| `pcm-relatorio-mensal-worker` | **Relatório mensal** — sumarização do mês | `anthropic/claude-haiku-4-5` | 8000 |

> `pcm-proposal-docx` **não** usa OpenRouter (só monta o DOCX a partir da proposta já gerada).

### 2.2 Divergência importante: modelo do Zé (código × produção)

- **Código:** `MODEL = 'google/gemini-2.5-flash'` (default), confirmado também na versão **REAL baixada da produção** (CLI download) — código e prod batem.
- **Produção (dados):** a coluna `pcm_clients.ze_model` está com **`google/gemini-3.1-flash-lite`** em **49 de 51 clientes** (todos com `ze_mode = off`). Só **1 cliente** está `ze_mode = active`, e esse usa `google/gemini-2.5-flash`. Outro está `off` com `gemini-2.5-flash`.
- **Conclusão:** o Zé está efetivamente **ligado em apenas 1 condomínio** hoje, rodando `gemini-2.5-flash`. A maioria dos clientes tem override para `gemini-3.1-flash-lite` mas com o Zé desligado. (a confirmar se o `gemini-3.1-flash-lite` é a intenção de modelo padrão futuro.)

> Observação: a memória do projeto registrava "OpenRouter LLM gemini-2.5-flash" de forma genérica. Na prática **convivem dois fornecedores via OpenRouter**: Google Gemini (Zé) e Anthropic Claude (laudos, inspeção, PDF, propostas, relatório mensal).

### 2.3 Secret do OpenRouter

| Secret | Presente em prod? | Uso |
|---|---|---|
| `OPENROUTER_API_KEY` | ✅ | todas as 6 functions de LLM acima |

---

## 3. EVOLUTION API (WhatsApp) — resumo (detalhe no doc 04)

**Host:** `https://fascinatingsnail-evolution.cloudfy.live`
**Instância:** `ze-pcm-v2` — verificada em produção com `state: open` (conectada). A instância `evo-andre-sdr` também existe no mesmo host (não é do PCM).

| Aspecto | Valor |
|---|---|
| Functions que falam com a Evolution | `pcm-ze-agent` (envia respostas do Zé), `pcm-wa-poller` (poll de mensagens), `pcm-whatsapp-webhook` (recebe), `pcm-evolution-groups` (lista grupos), `pcm-relatorio-diario-enviar` (envia relatório) |
| Instância usada | `EVOLUTION_INSTANCE_ZE` (prod) = `ze-pcm-v2` |
| **Divergência código × prod** | No código os defaults são `'ze-pcm'` ou `'ze-carlos'` (fallbacks); o secret de prod sobrescreve para **`ze-pcm-v2`**. Sempre vale o secret. |

### 3.1 Secrets da Evolution

| Secret | Presente em prod? | Uso |
|---|---|---|
| `EVOLUTION_API_URL` | ✅ | host do Cloudfy |
| `EVOLUTION_API_KEY` | ✅ | header `apikey` |
| `EVOLUTION_INSTANCE_ZE` | ✅ | nome da instância (`ze-pcm-v2`) |

---

## 4. Inventário consolidado de secrets (produção)

Confirmado via `supabase secrets list --project-ref sfprfvltbtysvtsqutla`:

| Secret | Integração | Status |
|---|---|---|
| `AUVO_API_KEY` | Auvo | ✅ |
| `AUVO_API_TOKEN` | Auvo | ✅ |
| `AUVO_WEBHOOK_SECRET` | Auvo (webhook) | ❌ **AUSENTE** → validação de webhook desligada |
| `OPENROUTER_API_KEY` | OpenRouter | ✅ |
| `EVOLUTION_API_URL` | Evolution | ✅ |
| `EVOLUTION_API_KEY` | Evolution | ✅ |
| `EVOLUTION_INSTANCE_ZE` | Evolution | ✅ |
| `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_ANON_KEY` | infra (todas as functions) | ✅ |
| `SUPABASE_DB_URL`, `SUPABASE_JWKS`, `SUPABASE_PUBLISHABLE_KEYS`, `SUPABASE_SECRET_KEYS` | infra | ✅ (não usados diretamente nas functions de integração) |

---

## 5. Achados / riscos

1. **Webhook do Auvo não está recebendo eventos** (`pcm_auvo_webhook_logs` = 0). Toda a automação pós-finalização (relatório diário, corretivas de ronda, import de questionário, levantamento→planejamento) depende dele e hoje **não dispara**. Verificar cadastro do webhook no painel Auvo.
2. **`AUVO_WEBHOOK_SECRET` ausente em produção** → quando o webhook voltar a receber, ele aceitará qualquer POST sem validação de segredo. Risco de segurança.
3. **`pcm_equipment_cache` vazia** — equipamentos nunca sincronizados; o `equipment-sync` precisa ser disparado.
4. **Divergência de modelo do Zé** — código/função usa `gemini-2.5-flash`, mas 49/51 clientes têm override para `gemini-3.1-flash-lite` (todos com Zé desligado). Zé ativo em apenas 1 cliente.
5. **Sync de técnicos sem atualização recente** (último 06/06) — confirmar se há cron ou se é só manual.
6. **Naming confuso:** functions `pcm-auvo-*` gravam majoritariamente em tabelas centrais (`pcm_clients`, `pcm_ordens_servico`), não em `pcm_auvo_*`.
