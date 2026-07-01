# 03 — Loop de Orquestração (agent-runner)

> O runtime que recebe "tem mensagem nova" e produz a resposta. Fonte: `supabase/functions/agent-runner/index.ts`.
> Voltar ao [[00 - Guia de Implementacao]].

---

## Entrada

O agent-runner é chamado (async, sem segurar o webhook) com:
```json
{ "conversationId", "agentId", "tenantId",
  "channelType": "whatsapp|instagram|facebook",   // default whatsapp
  "senderPageId", "recipientId" }                  // só Meta
```

---

## Sequência completa (passo a passo)

### Guardas (curto-circuito antes de gastar LLM)
1. **Status da conversa** — só prossegue se `status === 'ativo'`. Se `assumed_by` (humano assumiu) → pula (`skipped: assumed_by_human`).
2. **Agente ativo** — carrega `agents` + `api_keys`; se `status !== 'ativo'` → pula.
3. **Regras de horário** (`agent_rules`):
   - Fora do horário → envia `out_of_hours_message`, marca `status='handoff'` (motivo "Fora do horário"), encerra.
   - `message_count_today > max` → handoff "Limite de mensagens diárias atingido", encerra.
   - **Gatilho na última mensagem do usuário**: se o texto (lowercase) contém algum `handoff_trigger` → handoff + envia `handoff_message`, encerra.
4. **Token guard** — soma `cost_usd` do mês para (tenant, agente); se ≥ orçamento mensal (default US$ 50) → bloqueia. Ver [[06 - LLM, Custo e Seguranca]].

### Carregamento de contexto
5. `knowledge_docs` (ordenados) + `corrections` ativas.
6. **Especialistas** via `agent_specialist_links` (join com `specialists`, ambos `active`). APIs ficam dentro do especialista → o agent-runner passa `apis = []`.
7. **Histórico**: janela recente (`CONTEXT_RECENT_WINDOW = 10` últimas mensagens) + contagem total de mensagens (para decidir compactação).
8. **Monta o system prompt** (ver [[02 - Montagem do Prompt]]) incluindo `conversation_summary` se houver.

### Resolução de credenciais (cascata)
9. API key na ordem: **BYOK do agente** (descriptografa `api_keys.key_encrypted`) → **OpenRouter de ambiente** → **Anthropic de ambiente**. Define `provider` e ajusta `model` (se cair no OpenRouter e o model não tiver `/`, usa o default do OpenRouter).

### Preparação das mensagens
10. Converte cada `messages.content` (jsonb) para o formato da API:
    - string → texto; `{type:text}` → texto; `{type:audio}` → `"[Áudio transcrito]: ..."`; `{type:image}` → bloco image (url) + caption; `{type:multi}` → array de partes.
11. Garante que o array **começa com `user`** (Anthropic rejeita começar com `assistant`).

### Loop de tool use (coração)
12. `tools = solicitar_handoff + especialistas + apis`. Loop até **`MAX_TURNS = 6`**:

```
para cada turno (timeout 25s por chamada):
  resp = callLLM(provider, model, maxTokens=600, system, messages, tools)
  acumula tokens (input/output/cache)

  se stopReason == 'end_turn':
     finalResponse = primeiro bloco de texto; PARA

  se stopReason == 'tool_use':
     pega o primeiro bloco tool_use:
       • solicitar_handoff:
            triggerHandoff(motivo); envia handoff_message pelo canal;
            grava message role='tool'; PARA
       • chamar_especialista__{name}:
            POST interno → specialist-runner { specialistId, input, tenantId, conversationId }
            toolResult = data.result (ou erro)
            empilha [assistant: resp.content] + [user: tool_result]; CONTINUA
       • chamar_api__{name}:
            POST interno → api-caller { apiId, method, path, requestBody, agentId, tenantId }
            toolResult = "Status HTTP: {status}\n\n{body}" (ou erro)
            empilha tool_result; CONTINUA
       • tool desconhecida:
            tool_result = "Executado com sucesso."; CONTINUA
```

> `max_tokens = 600` na resposta ao usuário (mensagens de WhatsApp são curtas). Especialista usa 1024.

### Pós-processamento
13. **Log de tokens** (`token_usage_log`) com custo calculado.
14. Se **não** houve handoff e há `finalResponse`:
    - `sanitizeForWhatsApp(finalResponse)` — remove `**negrito**`, `*itálico*`, `__x__`, `_x_`, headers `#`, troca ` — ` por `, ` e remove `—`, colapsa espaços.
    - grava `messages` role='assistant' `{type:text}` e **envia pelo canal** (ver [[05 - Canais de Entrada e Saida]]).
15. **Regras de pipeline** (`applyPipelineRules`): evento = `handoff_triggered` ou `conversation_started`; também `keyword_match` na resposta final; move `conversations.pipeline_label` pela 1ª regra que casar.
16. **Compactação assíncrona**: quando o total de mensagens é múltiplo de `CONTEXT_COMPACTION_THRESHOLD = 20`, dispara `compact-conversation` (resume o histórico → `conversation_summary`). Fire-and-forget via `EdgeRuntime.waitUntil`.
17. **Lead scoring**: em handoff ou na 1ª resposta da conversa, dispara `score-lead` (a menos que `manual_override_until` esteja vigente).

---

## Funções de apoio (replicar)

**`triggerHandoff(conversationId, reason, userId)`** — `UPDATE conversations SET status='handoff', handoff_at=now(), handoff_reason=reason, handoff_by=userId`.

**`sendResponseByChannel(...)`** — roteia por canal:
- `instagram|facebook`: busca `agent_channels` por `page_id`+`channel_type`+`active`, descriptografa `access_token`, chama Meta Graph.
- `whatsapp` (default): `sendWhatsAppMessage` que decide entre Z-API / Evolution / Meta Cloud pelo `whatsapp_provider`.

**`sanitizeForWhatsApp(text)`** — regex que força o texto limpo (mesmo se o modelo escapar das regras de formatação).

---

## Constantes de ambiente do loop

| Var | Default | Função |
|---|---|---|
| `MAX_TURNS_DEFAULT` | 6 | Máx. de turnos de tool use |
| `CONTEXT_RECENT_WINDOW` | 10 | Nº de mensagens recentes no prompt |
| `CONTEXT_COMPACTION_THRESHOLD` | 20 | A cada N msgs, resume a conversa |
| (timeout interno) | 25s | Timeout por chamada de LLM |

---

## O mínimo para reimplementar em outra stack

1. Um endpoint/worker que recebe `(conversationId, agentId, tenantId, canal)`.
2. As 4 guardas (status, agente ativo, regras/horário/gatilho, orçamento).
3. Montagem do prompt + lista de tools.
4. Loop de tool use com no máx. 6 turnos e timeout por chamada.
5. Roteamento `chamar_especialista__*` → runner isolado; `chamar_api__*` → proxy seguro; `solicitar_handoff` → muda status.
6. Sanitização da resposta + envio pelo canal + log de tokens.
7. (Opcional, recomendado) compactação de contexto e lead scoring assíncronos.
