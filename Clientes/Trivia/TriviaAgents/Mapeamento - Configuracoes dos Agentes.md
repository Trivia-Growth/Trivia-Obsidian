# Mapeamento — Configurações dos Agentes de Atendimento

> Inventário completo de tudo o que define um agente no TriviaAgents, para reimplementar em outro sistema.
> Base: repositório `Trivia-Growth/TriviaAgents` (clone local em `~/Documents/Obsidian/Github/TriviaAgents`).
> Data do levantamento: 30/06/2026.
> **Para reconstruir o sistema (passo a passo, com SQL e código):** ver [[Implementacao/00 - Guia de Implementacao]].

---

## Visão geral em uma frase

Um agente de atendimento é a soma de **6 blocos de configuração** que viram um único *system prompt* + uma lista de *ferramentas (tools)* enviados ao modelo a cada mensagem. Quem monta isso é a função `prompt-builder.ts`; quem executa é o `agent-runner`. Se você reproduzir esses 6 blocos no outro sistema, o agente se comporta igual.

```
Identidade  +  Conhecimento  +  Correções  +  Regras  +  Especialistas  +  APIs
        │              │              │           │             │           │
        └──────────────┴──────────────┴───────────┴─────────────┴───────────┘
                                    ▼
                  system prompt (com cache) + tools dinâmicas
                                    ▼
                          Modelo (Claude / OpenRouter)
```

---

## 1. Configuração do AGENTE (tabela `agents`)

O núcleo. Cada linha é um agente.

| Campo | Tipo | Default | Para que serve |
|---|---|---|---|
| `name` | text | — | Nome interno do agente |
| `identity_md` | text (markdown) | `''` | **A personalidade/identidade.** Vira o bloco "Sua Identidade" no prompt |
| `model` | text | `claude-sonnet-4-5` | Modelo de linguagem usado |
| `status` | text | `pausado` | `ativo` ou `pausado` — só roda se `ativo` |
| `api_key_id` | uuid → `api_keys` | null | Qual chave BYOK usar (Anthropic/OpenRouter) |
| **WhatsApp** | | | |
| `whatsapp_number` | text | null | Número que identifica o agente no webhook |
| `whatsapp_provider` | text | `zapi` | `zapi`, `evolution` ou `official` |
| `zapi_instance_url` | text | null | URL da instância Z-API |
| `zapi_token_encrypted` | text | null | Token Z-API (criptografado) |
| `evolution_instance_url` | text | null | URL Evolution API |
| `evolution_instance_name` | text | null | Nome da instância Evolution |
| `evolution_api_key_encrypted` | text | null | Chave Evolution (criptografada) |

> **Ponto-chave:** o que dá "alma" ao agente é o `identity_md`. É um markdown livre com seções como Identidade, Personalidade, Responsabilidades, Aviso Legal. Veja o exemplo "Farmácia Bot" no fim deste documento.

---

## 2. Base de CONHECIMENTO (tabela `knowledge_docs`)

Documentos markdown que o agente "sabe". Vários por agente, ordenados.

| Campo | Tipo | Serve para |
|---|---|---|
| `agent_id` | uuid | A qual agente pertence |
| `title` | text | Título do documento (vira `## Título` no prompt) |
| `content_md` | text | Conteúdo em markdown |
| `order_idx` | integer | Ordem de exibição |

- Todos os docs são concatenados num único bloco "Base de Conhecimento", separados por `---`.
- **Decisão arquitetural (ADR-002):** não usa RAG/busca vetorial. O markdown inteiro vai direto no prompt (com cache). Funciona bem até ~50k tokens de base.

---

## 3. CORREÇÕES / memória corrigível (tabela `corrections`)

Lições aprendidas. O operador corrige uma resposta errada e ela vira regra permanente.

| Campo | Tipo | Serve para |
|---|---|---|
| `trigger_context` | text | Em que situação se aplica |
| `wrong_response` | text | O que o agente respondeu errado |
| `correct_response` | text | O que deveria ter respondido |
| `active` | boolean | Liga/desliga a correção |

Viram um bloco "Lições Aprendidas — Siga SEMPRE estas correções", no formato:
```
- CONTEXTO: ...
  ERRADO: ...
  CORRETO: ...
```

---

## 4. REGRAS operacionais (tabela `agent_rules`, 1:1 com o agente)

Controla horário, limites e transferência humana (handoff).

| Campo | Tipo | Default | Serve para |
|---|---|---|---|
| `work_hours` | jsonb | seg–sex 9–18 | Janela de atendimento por dia da semana |
| `out_of_hours_message` | text | mensagem padrão | Resposta automática fora do horário |
| `max_messages_per_contact_day` | integer | 50 | Limite diário por contato (anti-flood) |
| `handoff_triggers` | text[] | `{}` | Palavras que forçam transferência humana |
| `handoff_message` | text | mensagem padrão | Texto enviado ao transferir |

**Formato do `work_hours`** (hora início, hora fim; `null` = fechado):
```json
{"seg":[8,20],"ter":[8,20],"qua":[8,20],"qui":[8,20],"sex":[8,20],"sab":[8,14],"dom":null}
```

**Lógica no runtime (`agent-runner`):**
1. Fora do horário → manda `out_of_hours_message` + handoff.
2. Passou do limite diário → handoff.
3. Última mensagem contém um `handoff_trigger` → handoff + `handoff_message`.
4. O modelo também pode chamar a tool `solicitar_handoff` por conta própria.

---

## 5. ESPECIALISTAS / sub-agentes (multi-agent)

**Mudança importante na arquitetura (migration 010):** especialistas deixaram de ser "filhos" de um agente e viraram **entidades independentes por tenant**, reutilizáveis entre vários agentes via um vínculo.

### 5a. `specialists` — o especialista em si
| Campo | Tipo | Default | Serve para |
|---|---|---|---|
| `name` | text (slug `^[a-z0-9_]+$`) | — | Nome técnico (vira `chamar_especialista__{name}`) |
| `display_name` | text | — | Nome amigável |
| `description` | text | `''` | O que ele faz (vira a descrição da tool) |
| `identity_md` | text | `''` | Identidade/instruções do especialista |
| `model` | text | `claude-haiku-4-5` | Modelo próprio (Haiku = barato por padrão) |
| `active` | boolean | true | Liga/desliga |

### 5b. `agent_specialist_links` — vínculo agente ↔ especialista
| Campo | Tipo | Serve para |
|---|---|---|
| `agent_id` / `specialist_id` | uuid | Quem chama quem |
| `when_to_call` | text | Texto livre: "quando chamar este especialista" |
| `active` | boolean | Liga/desliga o vínculo |

### 5c. Especialista tem suas próprias sub-configurações
- `specialist_knowledge_docs` — conhecimento próprio (igual ao do agente)
- `specialist_rules` — regras próprias (horário, handoff)
- `specialist_corrections` — correções próprias
- `specialist_apis` — APIs próprias (ver seção 6)
- `specialist_calendar_configs` — agenda (Google/Microsoft) para marcar reuniões

**Como funciona no runtime (`specialist-runner`):**
- Cada chamada é um Claude **isolado**: recebe só `identity_md` + conhecimento + correções do especialista. **Sem histórico da conversa** (evita contaminação de contexto e permite modelo mais barato).
- O agente principal chama via tool `chamar_especialista__{name}`, recebe o resultado e **reescreve** em linguagem natural antes de mandar ao cliente.

### 5d. Especialista de AGENDA (`specialist_calendar_configs`)
| Campo | Default | Serve para |
|---|---|---|
| `provider` | — | `google` ou `microsoft` |
| `timezone` | `America/Sao_Paulo` | Fuso |
| `slot_duration_minutes` | 30 | Duração do slot |
| `buffer_minutes` | 15 | Intervalo entre reuniões |
| `business_hours_start/end` | 8 / 18 | Janela de agendamento |
| `default_meeting_title` | "Reunião agendada via IA" | Título padrão |
| `access/refresh_token_encrypted` | — | OAuth (criptografado) |

Quando ativo, o especialista ganha 2 tools extras: `verificar_disponibilidade` e `criar_evento`.

---

## 6. APIs externas / BYOA (tabela `specialist_apis`)

Permite o agente (via especialista) chamar APIs de terceiros com segurança.

| Campo | Tipo | Default | Serve para |
|---|---|---|---|
| `name` | text (slug) | — | Vira `chamar_api__{name}` |
| `display_name` | text | — | Nome amigável |
| `description` | text | `''` | O que a API faz |
| `base_url` | text | — | URL base |
| `auth_type` | text | `bearer` | `bearer`, `api_key` ou `none` |
| `auth_header` | text | null | Nome do header de auth |
| `token_encrypted` | text | null | Token (criptografado) |
| `docs_md` | text | `''` | Documentação que o modelo lê p/ montar a chamada |
| `active` | boolean | true | Liga/desliga |

**Segurança (BYOA):** o token é descriptografado **só no servidor** (`api-caller`), nunca volta para o modelo nem para o frontend. Resposta truncada em 8000 chars. Métodos permitidos: GET/POST/PUT/PATCH/DELETE. Timeout 15s.

---

## 7. Configurações de TENANT e de canal (contexto)

- **`tenant_settings.system_llm_model`** — modelo usado para tarefas internas do sistema (default `anthropic/claude-haiku-4-5`).
- **`api_keys`** (BYOK) — chaves Anthropic/OpenRouter por tenant, criptografadas.
- **`agent_channels`** — config de Instagram/Facebook por agente: `page_id`, `access_token_encrypted`, `app_secret_encrypted`, `webhook_verify_token`.
- **`pipeline_columns`** e **`pipeline_rules`** — Kanban de conversas e regras de movimentação automática (ex.: `conversation_started → lead_capturado`).
- **Lead score** (`conversations.lead_score*`) — pontuação automática do lead após handoff ou primeira resposta.

---

## 8. Como tudo vira PROMPT (a ordem importa)

O `buildSystemPrompt()` monta os blocos nesta ordem (os marcados com 🧊 usam cache):

1. 🧊 **Cabeçalho fixo** — "Você é um agente via WhatsApp, responda em pt-BR, sem markdown/asteriscos/travessão, tom humano."
2. 🧊 **Sua Identidade** ← `agents.identity_md`
3. 🧊 **Base de Conhecimento** ← `knowledge_docs`
4. 🧊 **Lições Aprendidas** ← `corrections`
5. 🧊 **Especialistas Disponíveis** ← `specialists` vinculados
6. 🧊 **APIs Externas Disponíveis** ← `specialist_apis`
7. **Memória da Conversa** ← `conversations.conversation_summary` (não cacheável)
8. 🧊 **Estado Operacional** ← horário atual, contagem de msgs, gatilhos de handoff

**Tools sempre presentes:** `solicitar_handoff` + uma tool por especialista (`chamar_especialista__*`) + uma por API (`chamar_api__*`). Geradas dinamicamente por `buildToolsList()`.

> Regra reforçada no cabeçalho e no runtime (`sanitizeForWhatsApp`): sem negrito/itálico, sem `#`, sem travessão `—`. Combina com a sua preferência de copy sem emojis e sem travessões para client-facing.

---

## 9. Checklist para reimplementar no outro sistema

Para cada agente que você migrar, replicar:

- [ ] **Identidade** (`identity_md`) — o markdown da personalidade
- [ ] **Modelo** + provider (Anthropic direto ou OpenRouter)
- [ ] **Conhecimento** — todos os docs markdown, na ordem
- [ ] **Correções** ativas
- [ ] **Regras** — horário, mensagem fora-de-horário, limite diário, gatilhos + mensagem de handoff
- [ ] **Especialistas** vinculados (cada um com identidade, modelo, conhecimento, regras, correções)
- [ ] **APIs** de cada especialista (base_url, auth, docs) — re-criptografar tokens
- [ ] **Agenda** se houver (provider, fuso, slots, OAuth)
- [ ] **Canais** — WhatsApp (provider + credenciais) e/ou Meta (page_id + tokens)
- [ ] **Pipeline** — colunas e regras automáticas
- [ ] O **prompt builder** equivalente (a ordem dos blocos + o cabeçalho fixo + regras de formatação)
- [ ] O **loop de tool use** (máx 6 turnos): handoff, especialista, api
- [ ] **Criptografia** de segredos em repouso (o original usa pgcrypto no banco e AES-GCM nas funções)

---

## Anexo — Exemplo real: "Farmácia Bot" (do seed)

**Identidade:** assistente da Farmácia Bem Estar — prestativo, empático, prioriza segurança do paciente; tira dúvidas de medicamentos de venda livre, valida receitas, encaminha receitas válidas ao farmacêutico. Inclui aviso legal de que não substitui o farmacêutico.

**Modelo:** `claude-sonnet-4-5` · **Status:** pausado

**Regras:** Seg–Sex 8–20h, Sáb 8–14h, Dom fechado. Gatilhos de handoff: `falar com atendente`, `falar com farmacêutico`, `urgente`, `emergência`.

**Conhecimento:** (1) Checklist de Validação de Receita Médica; (2) Dúvidas Frequentes (prazos, formas farmacêuticas, pagamento, entrega).

---

## Referências de código (no clone local)

- Schema base: `supabase/migrations/20260512000001_init.sql`
- Especialistas (redesign): `supabase/migrations/20260512000010_specialists_redesign.sql`
- Montagem do prompt: `supabase/functions/_shared/prompt-builder.ts`
- Loop principal: `supabase/functions/agent-runner/index.ts`
- Especialista isolado: `supabase/functions/specialist-runner/index.ts`
- Arquitetura completa: `architecture.md`
