# 05 — Canais de Entrada e Saída

> Como a mensagem entra (webhooks) e sai (senders), o formato de mensagem e a transcrição de áudio.
> Fontes: `zapi-webhook`, `meta-webhook`, `evolution-webhook`, `_shared/{whatsapp-sender,zapi,meta}.ts`, `transcribe-audio`.
> Voltar ao [[00 - Guia de Implementacao]].

---

## Padrão comum dos webhooks de entrada

Todo webhook segue o mesmo esqueleto:

```
1. Validar autenticidade (secret / assinatura HMAC / verify_token)
2. Filtrar: ignorar eventos que não são mensagem recebida; ignorar mensagens próprias (isFromMe / sender == page)
3. Identificar o AGENTE (por número/instância/page_id) — precisa estar 'ativo'
4. Criar ou recuperar a CONVERSA (não-encerrada) para aquele contato+agente
5. Montar o content da mensagem (texto / imagem / áudio→transcrição / multi)
6. Persistir a mensagem (role='user')
7. Atualizar contador + last_message_at
8. Responder 200 IMEDIATAMENTE
9. Disparar agent-runner ASSÍNCRONO (fetch sem await) — só se a conversa está 'ativo'
```

> O passo 8 antes do 9 é essencial: o provedor (Z-API/Meta) re-tenta se não receber 200 rápido. O processamento do LLM roda depois, em background.

---

## Formato do `messages.content` (jsonb)

Flexível, discriminado por `type`. É o que o agent-runner sabe converter:

| Tipo | Forma | Vira no prompt |
|---|---|---|
| Texto | `{ "type":"text", "text":"..." }` | o texto |
| Imagem | `{ "type":"image", "image_url":"...", "caption?":"..." }` | bloco image (url) + caption |
| Áudio | `{ "type":"audio", "audio_url":"...", "transcript":"..." }` | `"[Áudio transcrito]: {transcript}"` |
| Múltiplo | `{ "type":"multi", "parts":[ {text}, {image} ] }` | array de partes |

`role` ∈ `user | assistant | tool | system`. Mensagens do atendente humano entram como `assistant` (via human-send) ou `tool` (handoff/registro).

---

## WhatsApp via Z-API (`zapi-webhook`)

- **Auth:** header `x-webhook-secret` (ou `?secret=`) == `ZAPI_WEBHOOK_SECRET`.
- **Filtro:** só `type === 'ReceivedCallback'`; ignora `isFromMe`; exige phone e algum conteúdo.
- **Identifica agente:** `agents.whatsapp_number == payload.instanceNumber` e `status='ativo'`.
- **Áudio:** se `payload.audio.audioUrl`, chama `transcribe-audio` antes de salvar; o transcript vira o texto enviado ao agente.
- **Dispara:** `agent-runner` com `{ conversationId, agentId, tenantId, messageId, hasMedia }`.

### Sender Z-API (`_shared/zapi.ts`)
- `POST {instanceUrl}/send-text` com header `Client-Token: {token}` e body `{ phone, message }`.
- Também há `send-image`, `read-message`, e download de mídia (base64).

---

## Instagram + Facebook via Meta (`meta-webhook`)

- **GET (verificação):** `hub.mode=subscribe` + `hub.verify_token` (procurado em `agent_channels.webhook_verify_token` ativo) → devolve `hub.challenge`.
- **POST (eventos):** valida assinatura `x-hub-signature-256` (HMAC-SHA256 com `META_APP_SECRET`).
- **Discrimina canal:** `object='instagram'` → instagram; `object='page'` → facebook.
- **Identifica agente:** por `entry.id` (page_id) + `channel_type` em `agent_channels`.
- **Ignora** mensagens em que `sender == pageId`.
- **Áudio:** attachment `type='audio'` → transcreve (mimeType `audio/mp4`).
- **Dispara** agent-runner com `{ channelType, senderPageId: pageId, recipientId: sender }`.

### Sender Meta (`_shared/meta.ts`)
- `POST https://graph.facebook.com/v21.0/me/messages?access_token={token}` com body:
  ```json
  { "recipient": {"id": recipientId}, "message": {"text": message}, "messaging_type":"RESPONSE" }
  ```

---

## WhatsApp via Evolution API (`evolution-webhook`)

Provedor alternativo de WhatsApp (auto-hospedado). O agente usa `whatsapp_provider='evolution'` com `evolution_instance_url`, `evolution_instance_name`, `evolution_api_key_encrypted`.

### Sender Evolution (`_shared/whatsapp-sender.ts`)
- `POST {instance_url}/message/sendText/{instance_name}` com header `apikey: {key}` e body `{ number, text }`.
- A chave pode estar criptografada ou em texto plano (tenta descriptografar; se falhar, usa como está).

---

## WhatsApp Oficial / Meta Cloud API

`whatsapp_provider='official'`. O canal fica em `agent_channels` com `channel_type='whatsapp_official'`, guardando o `phone_number_id` no campo `page_id`.
- `POST https://graph.facebook.com/v21.0/{phone_number_id}/messages` com `Authorization: Bearer {token}` e body:
  ```json
  { "messaging_product":"whatsapp", "to": phone, "type":"text", "text": {"body": message} }
  ```

---

## Roteamento de saída (resumo)

`sendResponseByChannel` (no agent-runner) decide:

```
canal instagram|facebook → Meta Graph (me/messages)
canal whatsapp           → sendWhatsAppMessage → por whatsapp_provider:
    zapi      → Z-API /send-text
    evolution → Evolution /message/sendText
    official  → Meta Cloud /{phone_number_id}/messages
```

---

## Transcrição de áudio (`transcribe-audio`)

- **Entrada:** `{ audioUrl, mimeType, authHeader? }`.
- Baixa o áudio, normaliza o mime (tira `; codecs=...`), monta `multipart/form-data` com `language=pt`.
- **Provedor por env** `TRANSCRIPTION_PROVIDER`:
  - `openai` → `whisper-1` em `api.openai.com/v1/audio/transcriptions`.
  - `groq` → `whisper-large-v3-turbo` em `api.groq.com/openai/v1/audio/transcriptions`.
- **Retorna** `{ text, provider, duration_seconds? }`.

> Para iPhone/web: capturar áudio com input nativo e transcrever depois (processamento pesado fora do caminho crítico) — alinhado à preferência de câmera/áudio nativos.

---

## O mínimo para reimplementar

1. Um webhook por canal seguindo o esqueleto comum (validar → filtrar → identificar agente → upsert conversa → persistir → 200 → disparar runner async).
2. Um sender por canal com as credenciais certas (descriptografadas no servidor).
3. O formato `content` discriminado por tipo, e a conversão dele para o formato do LLM.
4. (Opcional) Transcrição de áudio antes de enfileirar a mensagem.
5. Identidade do agente resolvida por: número (WhatsApp) ou page_id (Meta).
