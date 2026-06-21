# 04 - Agente Zé e WhatsApp

> Mapeamento técnico do Agente Zé (WhatsApp) do PCM Sinérgica
> Data: 2026-06-18
> Fonte: versões **de produção** das Edge Functions (baixadas via `supabase functions download`, conferidas contra o repo `pcm-sinergica-v2`), Evolution API (instância `ze-pcm-v2`) e consultas SQL diretas na produção (Supabase `sfprfvltbtysvtsqutla`).

---

## 1. Resumo executivo

O **Zé** é o assistente de WhatsApp do PCM Sinérgica. Ele vive dentro dos grupos de WhatsApp dos condomínios (e em DMs com gestores internos), lê as mensagens, decide se deve responder e — quando faz sentido — abre/consulta/edita chamados de manutenção no sistema, respondendo direto no grupo.

Pontos-chave confirmados em produção:

- A instância WhatsApp **`ze-pcm-v2` está conectada** (estado `open`), número `5519982252881`, perfil "Zé Carlos - PCM Sinérgica".
- O webhook da Evolution está **ativo e apontando para a função certa**, recebendo `MESSAGES_UPSERT`.
- O modelo LLM é **`google/gemini-2.5-flash`** (via OpenRouter), configurável por cliente.
- Há **três modos por cliente**: `off`, `monitor` e `active`. Hoje só **1 cliente está ativo** ("Sinérgica - Escritório"); os outros 50 estão `off`.
- O pipeline tem **dois gatilhos redundantes**: `waitUntil` no próprio webhook (rápido) + um **cron de 1 minuto** (rede de segurança). Os dois funcionam.
- O **código do repo está idêntico ao de produção** nas 4 funções analisadas (sem divergência Git × produção desta vez).

---

## 2. Componentes e estado em produção

| Componente | Detalhe | Estado verificado |
|---|---|---|
| Instância WhatsApp | `ze-pcm-v2` (Evolution no Cloudfy) | `open` (conectada). Número `5519982252881`, perfil "Zé Carlos - PCM Sinérgica" |
| Webhook Evolution | URL `…/functions/v1/pcm-whatsapp-webhook` | `enabled: true`; eventos `MESSAGES_UPSERT`, `MESSAGES_UPDATE`, `CONNECTION_UPDATE`, `QRCODE_UPDATED`; `webhookBase64: false` |
| `pcm-whatsapp-webhook` | Recebe eventos, salva msg, enfileira, dispara o agente | ACTIVE, versão 17 |
| `pcm-ze-agent` | Cérebro: monta prompt, chama LLM, executa tools, envia resposta | ACTIVE, versão 21 |
| `pcm-wa-poller` | Fallback que puxa mensagens da Evolution (caso o webhook falhe) | ACTIVE, versão 5 |
| `pcm-evolution-groups` | Lista os grupos do WhatsApp (para vincular cliente↔grupo na UI) | ACTIVE, versão 7 |
| Cron `process-wa-queue` | Roda a cada minuto, processa fila pendente | `active: true`, jobid 1 |
| Modelo LLM | `google/gemini-2.5-flash` (OpenRouter) | Confirmado no código e no `ze_model` do cliente ativo |

---

## 3. Pipeline ponta a ponta

### 3.1 Fluxo principal (via webhook — caminho rápido)

```
WhatsApp (grupo/DM)
      │
      ▼
Evolution API (ze-pcm-v2)  ──MESSAGES_UPSERT──►  pcm-whatsapp-webhook
                                                       │
                  1. ignora fromMe / broadcast / não-upsert
                  2. resolve telefone do remetente (trata @lid do Evo v2)
                  3. extrai conteúdo (texto/imagem/áudio/doc/vídeo)
                  4. INSERT em pcm_wa_messages
                  5. reset process_after dos pendentes do mesmo queue_key (agrupa rajada)
                  6. INSERT em pcm_wa_queue (process_after = agora + 3s)
                  7. responde 200 IMEDIATAMENTE p/ a Evolution
                  8. EdgeRuntime.waitUntil → espera ~3,5s e dispara pcm-ze-agent
                                                       │
                                                       ▼
                                                pcm-ze-agent
                  1. busca fila pendente (process_after <= now) do queue_key
                  2. resolve contexto: grupo (cliente) ou DM (admin)
                  3. checa modo off/monitor/active
                  4. detecção determinística de menção ao "Zé"
                  5. monta prompt (BASE ou ADMIN) + histórico (últimas 20)
                  6. chama LLM (gemini-2.5-flash) com tools
                  7. loop agêntico (até 5 voltas) executando tools de chamado
                  8. se resposta ≠ SKIP → converte p/ formato WhatsApp
                  9. INSERT da resposta em pcm_wa_messages (from_me=true)
                 10. envia via Evolution (/message/sendText/ze-pcm-v2)
                 11. marca itens da fila como processed=true
                                                       │
                                                       ▼
                                          WhatsApp (resposta no grupo)
```

### 3.2 Fluxo de segurança (via cron — caminho garantido)

O webhook dispara o agente por `waitUntil`, mas se o isolate morrer antes (ou o disparo falhar), nada se perde: o **cron `process-wa-queue` roda a cada minuto** e relê a fila.

```
cron.job (* * * * *)  →  SELECT process_wa_queue_cron()
        │
        ▼
process_wa_queue_cron()  (SQL, SECURITY DEFINER)
   - pega DISTINCT ON (queue_key) os itens da fila com processed=false e process_after <= now()
   - para cada queue_key, faz net.http_post para pcm-ze-agent
        │
        ▼
   pcm-ze-agent (mesmo fluxo do 3.1)
```

Resultado: a mensagem é processada pelo caminho rápido (webhook+waitUntil) na maioria dos casos, e o cron cobre as falhas em até ~1 minuto. A função `pcm-ze-agent` é idempotente porque só processa itens `processed=false` e os marca como `true` ao final — se o webhook já processou, o cron não acha nada pendente.

> **Nota:** o nome da função SQL é `process_wa_queue_cron` (confirmado). Não existe uma função separada chamada `process_wa_queue` em produção.

### 3.3 Fluxo alternativo (poller — fallback de ingestão)

O `pcm-wa-poller` **não substitui o webhook**; ele cobre o cenário de o webhook não ter chegado. Em vez de receber push da Evolution, ele **puxa** as últimas 50 mensagens (`/chat/findMessages`), filtra as que ainda não estão em `pcm_wa_messages` (por `wa_message_id`), salva as novas, enfileira e dispara o agente — exatamente como o webhook. Diferenças relevantes:

- Usa `GROUPING_DELAY_MS = 8s` (o webhook usa 3s).
- Resolve `@lid` consultando os contatos (`/chat/findContacts`) e montando um mapa LID→número via `pushName`.
- Dispara o agente com `setTimeout` simples (não tem `waitUntil`).
- **(a confirmar)** Não há cron agendado chamando o poller hoje — nos `cron.job` só existem `process-wa-queue` e `relatorio-mensal-worker`. O poller parece ser acionado sob demanda/manualmente.

---

## 4. Agrupamento (grouping) e latência

A ideia do grouping é não responder mensagem por mensagem quando a pessoa manda uma "rajada" (várias mensagens seguidas). O sistema **espera um tempinho** e trata o conjunto de uma vez só.

| Parâmetro | Valor | Onde |
|---|---|---|
| Delay de agrupamento (webhook) | **3.000 ms** | `GROUPING_DELAY_MS` em `pcm-whatsapp-webhook` |
| Delay extra antes de disparar o agente | + 500 ms | `setTimeout` no `waitUntil` |
| Delay de agrupamento (poller) | **8.000 ms** | `GROUPING_DELAY_MS` em `pcm-wa-poller` |
| Espera adicional no agente | **0 ms** | `WAIT_BEFORE_PROCESS = 0` (o webhook já esperou) |
| Cron de fallback | a cada **60 s** | `cron.job` jobid 1 |

**Como o agrupamento funciona na prática:** cada nova mensagem do mesmo `queue_key` (grupo ou DM) **reseta o `process_after`** dos itens pendentes para "agora + 3s". Ou seja, enquanto a pessoa continua digitando/mandando, o relógio reinicia; o agente só processa 3s depois da última mensagem. Quando finalmente roda, o `pcm-ze-agent` pega **todos** os itens pendentes daquele `queue_key` e junta o conteúdo (`newMessages.map(...).join('\n')`).

**Latência típica de resposta:** ~3,5s de grouping + tempo do LLM (1 ou mais chamadas se houver tool call) + envio pela Evolution. Na prática, alguns segundos. Pelo caminho do cron, o pior caso sobe para ~1 minuto.

**`queue_key`:** é o identificador da conversa — `remoteJid` (`...@g.us`) para grupos, ou `dm_<telefone>` para DMs.

---

## 5. Detecção determinística de menção (não confia só no LLM)

O time aprendeu que, com histórico ruidoso, o LLM às vezes "pula" mesmo sendo chamado. Por isso há uma **camada determinística** (regex) que força a resposta quando o Zé é claramente endereçado. Há **dois pontos** distintos:

### 5.1 Gate do modo `monitor` (decide se processa)
No início do agente, **só no modo monitor**:
```js
const combinedText = newMessages.map(m => m.content).join(' ').toLowerCase()
const mentioned = /\bz[eé]\b|@z[eé]/.test(combinedText)
```
Se não houver "zé/ze" como palavra isolada nem "@zé", o agente **nem processa** (marca como lido e sai). No modo `active` esse gate não existe — sempre processa.

### 5.2 "Directly addressed" (força resposta, anti-SKIP)
Antes de chamar o LLM, em **grupos** (não em DM admin):
```js
const ZE_IDS = ['5519982252881', '124335561912531']  // número e id interno do bot
const textOnly = userContent.replace(/^\[[^\]]*\]:\s*/gm, '')   // tira o prefixo "[nome]: "
const calledByName  = /(?:^|[\s,.;:!?@()"'-])z[ée](?:$|[\s,.;:!?()"'-])/i.test(textOnly)
const directlyAddressed = !isAdminDm && (calledByName || ZE_IDS.some(id => textOnly.includes(id)))
```
Quando `directlyAddressed` é verdadeiro:
- injeta no prompt: *"ATENÇÃO: … Você DEVE responder … e NÃO pode retornar SKIP."*;
- se mesmo assim o LLM responder SKIP/vazio, há uma **rede de segurança**: refaz a chamada proibindo SKIP e, em último caso, responde *"Oi! Estou aqui. Como posso ajudar?"*.

> Os dois IDs reconhecidos são o número `5519982252881` e o id interno `124335561912531`. **(a confirmar)** o id `124335561912531` é o LID/id do contato do próprio Zé usado nas menções por @ — bater isso contra o WhatsApp se for ajustar menção.

### 5.3 Validação com dados reais
As últimas mensagens em produção confirmam o comportamento: "Zé fala comigo", "Quem é você zé?", "Zé fala comigo pra eu ver uma coisa" → o Zé respondeu em todos. E quando alguém falou **sobre** ele sem endereçar, ele não atrapalhou. O grupo de teste é o **"Sinérgica - Escritório"** (`120363426277257798@g.us`), com Fabrício Medeiros e João Novais.

---

## 6. Prompts (BASE e ADMIN)

São dois prompts de sistema distintos, escolhidos por contexto (`isAdminDm`):

### 6.1 BASE_PROMPT (grupos de condomínio)
- **Identidade:** Zé, assistente de manutenção predial da Sinérgica, dentro do grupo de um condomínio cliente; tom profissional mas acessível; nunca inventar.
- **Responsabilidades:** receber solicitações e abrir chamados; informar status; confirmar planejamento/relatórios de visita; tirar dúvidas de manutenção.
- **Regra de quando responder (SEMPRE):** (1) chamado pelo nome "Zé"; (2) mencionado por @ (número `5519982252881` / id `124335561912531`); (3) mensagem com pedido de serviço, reclamação, problema ou qualquer referência a manutenção.
- **Quando usar SKIP:** só para off-topic puro ("bom dia a todos", memes) ou reações curtas ("👍", "ok") — **e desde que não o chamem pelo nome nem por @**. Em dúvida: responde.
- **Abertura de chamado:** JAMAIS abre sem confirmar **problema, local e urgência**; pergunta primeiro.
- **Formato:** máx. 3 linhas, sem markdown pesado, poucos emojis.
- **Retorno especial:** se não requer resposta, retorna exatamente `SKIP`.
- Ao prompt são anexados dinamicamente: `CLIENTE ATUAL: <nome>` e, se houver, `INSTRUÇÕES ESPECÍFICAS DESTE CLIENTE` (campo `ze_prompt_custom`).

### 6.2 ADMIN_PROMPT (DM com gestor interno)
- **Identidade:** Zé, assistente **interno** da Sinérgica, conversando em DM com um gestor (acesso a **todos** os clientes e chamados).
- **Capacidades:** listar clientes; ver/buscar chamados de qualquer cliente; criar/editar/cancelar chamados; ver backlog.
- **Regras:** sempre usar tools (nunca assumir dados); confirmar problema/local/urgência antes de criar; editar via `atualizar_chamado`; cancelar via `status='cancelado'`; respostas diretas; **nunca usar SKIP em DM com gestor**.

O modo é decidido por: grupo → BASE; DM cujo número está em `pcm_wa_admins` (active) → ADMIN. DM de número desconhecido → ignorado.

---

## 7. Tools de chamado

Há dois conjuntos de tools, conforme o contexto. Todas operam sobre `pcm_ordens_servico` / `pcm_clients`.

### 7.1 Tools de grupo (`TOOLS`) — cliente já fixado pelo grupo
| Tool | O que faz | Parâmetros principais |
|---|---|---|
| `criar_chamado` | Abre chamado para o cliente do grupo | `titulo`, `descricao`, `prioridade` (critica/alta/media/baixa), `local_descricao`, `solicitante` |
| `listar_chamados_abertos` | Lista chamados não finalizados/cancelados do cliente | `limit` (padrão 5) |
| `buscar_chamado` | Busca por número `CH-XXX` ou palavra-chave do título | `termo` |
| `atualizar_chamado` | Edita/cancela chamado | `numero_os`, `titulo`, `descricao`, `prioridade`, `local_descricao`, `status`, `observacao` |

### 7.2 Tools de admin (`ADMIN_TOOLS`) — acesso a todos os clientes
| Tool | O que faz | Parâmetros principais |
|---|---|---|
| `listar_clientes` | Lista clientes ativos | `busca` (filtro por nome) |
| `listar_chamados_cliente` | Lista chamados abertos de um cliente por nome | `nome_cliente`, `limit` (10), `status` |
| `buscar_chamado_global` | Busca chamado em todos os clientes | `termo` (CH-XXX ou palavra) |
| `criar_chamado` | Cria chamado p/ um cliente nomeado | `nome_cliente`, `titulo`, `descricao`, `prioridade`, `local_descricao`, `solicitante` |
| `atualizar_chamado` | Edita/cancela chamado | `numero_os`, `titulo`, `descricao`, `prioridade`, `local_descricao`, `status` |

**Detalhes do executor (`executeTool`):**
- `criar_chamado` insere em `pcm_ordens_servico` com `status='solicitacao'`, `origem='solicitacao_cliente'`, `categoria='corretiva'`, `prioridade` default `media`; retorna `CH-<numero_os>`. No admin, resolve o cliente por `nome_cliente` via `ilike`.
- `atualizar_chamado` monta só os campos passados; cancelar = `status='cancelado'`. **Atenção:** no contexto de grupo, ele atualiza por `numero_os` **sem filtrar por `client_id`** — ou seja, um grupo poderia editar um chamado de outro cliente se acertasse o número (risco de IDOR a registrar no SECURITY_DEBT).
- Loop agêntico: até **5 voltas** de tool calls antes de exigir resposta final em texto.

---

## 8. Modos do Zé (off / monitor / active)

Configurado por cliente em `pcm_clients` (`ze_mode`, com fallback legado em `ze_active`).

| Modo | Comportamento | Gate de menção |
|---|---|---|
| `off` | Ignora tudo silenciosamente (marca a fila como processada e sai) | — |
| `monitor` | Só processa se o Zé for **explicitamente mencionado** (regex `\bz[eé]\b\|@z[eé]`) | Sim — se não mencionado, não processa |
| `active` | Processa toda mensagem do grupo; o LLM decide responder ou SKIP | Não no gate; mas a camada "directly addressed" ainda força resposta quando chamado |

Resolução do modo no código: se `ze_mode` existe, usa ele; senão cai para `ze_active ? 'active' : 'off'`. Cliente sem grupo vinculado ou `off` → ignora.

**Estado em produção (verificado):**

| ze_mode | nº de clientes |
|---|---|
| `active` | 1 |
| `off` | 50 |

O único cliente ativo:

| name | ze_mode | ze_model | whatsapp_group_jid | prompt custom |
|---|---|---|---|---|
| Sinérgica - Escritório | active | google/gemini-2.5-flash | 120363426277257798@g.us | não |

---

## 9. Modelo LLM

| Item | Valor |
|---|---|
| Provedor | OpenRouter (`https://openrouter.ai/api/v1/chat/completions`) |
| Modelo default | `google/gemini-2.5-flash` (constante `MODEL`) |
| Override por cliente | campo `ze_model` em `pcm_clients` (hoje todos no default) |
| `tool_choice` | `auto` |
| `max_tokens` | 500 |
| Headers | `HTTP-Referer: pcm-sinergica-v2.netlify.app`, `X-Title: PCM Sinergica - Agente Ze` |
| Pós-processamento | `toWhatsApp()` converte markdown → formatação WhatsApp (`**x**`→`*x*`, bullets→•, remove links etc.) |

---

## 10. Tabelas e dados em produção (verificado)

| Tabela | Papel |
|---|---|
| `pcm_wa_messages` | Log de todas as mensagens (recebidas e enviadas pelo Zé) |
| `pcm_wa_queue` | Fila de processamento por `queue_key` com `process_after` / `processed` |
| `pcm_wa_admins` | Números autorizados a falar com o Zé em DM (modo admin) |
| `pcm_clients` | Clientes; guarda `ze_mode`, `ze_model`, `ze_prompt_custom`, `whatsapp_group_jid` |
| `pcm_ordens_servico` | Chamados (onde as tools de chamado escrevem/leem) |

**Números reais (em 2026-06-18):**

| Métrica | Valor |
|---|---|
| Mensagens totais (`pcm_wa_messages`) | 172 |
| — recebidas (from_me=false) | 114 |
| — enviadas pelo Zé (from_me=true) | 58 |
| Primeira mensagem | 2026-06-05 17:53 UTC |
| Última mensagem | 2026-06-18 02:19 UTC |
| Fila `pcm_wa_queue` (total / processados / pendentes) | 115 / 115 / 0 |
| Clientes com Zé ativo | 1 (Sinérgica - Escritório) |
| Admins ativos (DM) | 3 — Fabricio (5519982811772), Admin 2 (5519982715174), Admin 3 (5519414134422) |

> **(a confirmar)** Os dados de mensagens estão concentrados no grupo de teste interno "Sinérgica - Escritório". Ainda não há tráfego de grupos de condomínio reais — o Zé está em fase de validação interna.

---

## 11. Pontos de atenção / riscos

1. **`atualizar_chamado` sem escopo de cliente (IDOR):** no contexto de grupo, o update é feito só por `numero_os`, sem `client_id`. Um grupo poderia, em tese, alterar/cancelar chamado de outro cliente acertando o número. Registrar no `SECURITY_DEBT.md`.
2. **Fallback de nome de instância divergente:** `pcm-evolution-groups` usa fallback `'ze-carlos'` e `pcm-ze-agent`/`pcm-wa-poller` usam `'ze-pcm'` quando `EVOLUTION_INSTANCE_ZE` está ausente. Em produção o secret está setado (`ze-pcm-v2`), então não afeta hoje — mas é dívida (alinhar com SEC-009).
3. **Webhook lê base64 mas produção está com `webhookBase64=false`:** o código trata os dois casos (decodifica só se vier string), então está OK; mas vale saber que mudar esse flag na Evolution não quebra.
4. **Poller sem cron agendado (a confirmar):** se o webhook falhar na ingestão (não só no disparo do agente), nada repõe automaticamente — o cron `process-wa-queue` só reprocessa o que **já** está na fila. Avaliar agendar o poller como rede de segurança de ingestão.
5. **Token service_role hardcoded em `cron.job` e em `process_wa_queue_cron`:** o JWT de service_role aparece em texto no comando do cron e na definição da função SQL. Funciona, mas é exposição de credencial em metadados do banco.

---

## 12. Referências de código

- `supabase/functions/pcm-whatsapp-webhook/index.ts` — ingestão + grouping + waitUntil
- `supabase/functions/pcm-ze-agent/index.ts` — prompts, tools, modos, LLM, envio
- `supabase/functions/pcm-wa-poller/index.ts` — fallback de ingestão (pull)
- `supabase/functions/pcm-evolution-groups/index.ts` — listagem de grupos
- SQL: `cron.job` (jobid 1, `process-wa-queue`) + função `public.process_wa_queue_cron()`

> Conferência Git × produção: as 4 funções acima estão **idênticas** entre o repo `pcm-sinergica-v2` e a versão baixada de produção (sem regressão nesta data).
