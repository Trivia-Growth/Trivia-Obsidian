---
id: STORY-010
titulo: "Multi-Provider WhatsApp — Evolution API v2 + WhatsApp Business API oficial"
fase: 2
modulo: "channels / agents"
status: backlog
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-07
atualizado: 2026-06-07
---

# STORY-010 — Multi-Provider WhatsApp (Evolution API + Oficial)

## Contexto

Hoje o único canal WhatsApp suportado é Z-API. Para atender clientes com diferentes necessidades (custo, escala, compliance), a plataforma precisa suportar:

- **Evolution API v2** — open source, self-hosted, alternativa ao Z-API
- **WhatsApp Business API (Meta Cloud)** — API oficial Meta, obrigatória para empresas que exigem número verificado e conformidade

Esta story depende da STORY-009 (WhatsApp movido para aba Canais) estar concluída, pois o card WhatsApp na aba Canais é onde o usuário selecionará o provider.

Referências:
- Evolution API v2: https://doc.evolution-api.com/v2/pt/get-started/introduction
- WhatsApp Business API: https://developers.facebook.com/docs/whatsapp/cloud-api

## Critérios de Aceite

- [ ] CA1 — Campo `whatsapp_provider` adicionado à tabela `agents` com enum `zapi | evolution | official` (default `zapi`)
- [ ] CA2 — Card WhatsApp na aba Canais exibe selector de provider; campos de configuração mudam conforme o provider selecionado
- [ ] CA3 — **Evolution API**: webhook recebe mensagens e dispara `agent-runner`; `human-send` envia via Evolution API
- [ ] CA4 — **WhatsApp Oficial**: webhook recebe mensagens via `meta-webhook` (já existe para Instagram/Facebook); `human-send` envia via Meta Cloud API
- [ ] CA5 — `agent-runner` roteia envio de resposta pelo `whatsapp_provider` do agente
- [ ] CA6 — Z-API continua funcionando sem alteração para agentes existentes

## Campos por Provider

### Z-API (existente, sem mudança de banco)
- `zapi_instance_url` — URL da instância
- `zapi_token_encrypted` — token criptografado

### Evolution API (novos campos em `agents`)
- `evolution_instance_url` — URL base da instância (ex: `https://evo.empresa.com`)
- `evolution_instance_name` — nome da instância
- `evolution_api_key_encrypted` — API key criptografada

### WhatsApp Oficial / Meta Cloud (via `agent_channels`, já usado por Instagram/Facebook)
- `channel_type = 'whatsapp_official'`
- `page_id` = Phone Number ID
- `access_token_encrypted` — token de acesso permanente

## Diff Plan

### Migration Supabase
```sql
ALTER TABLE agents
  ADD COLUMN whatsapp_provider text NOT NULL DEFAULT 'zapi'
    CHECK (whatsapp_provider IN ('zapi', 'evolution', 'official')),
  ADD COLUMN evolution_instance_url text,
  ADD COLUMN evolution_instance_name text,
  ADD COLUMN evolution_api_key_encrypted text;
```

### Nova Edge Function: `evolution-webhook`
- Recebe webhooks Evolution API v2
- Normaliza payload → mesmo formato interno do `zapi-webhook`
- Identifica agente por `evolution_instance_name`
- Dispara `agent-runner`

### Alterar `meta-webhook`
- Identificar `whatsapp_official` além de `instagram`/`facebook` pelo `phone_number_id`
- Extrair texto de `entry[].changes[].value.messages[]`

### Alterar `human-send`
- Router por `whatsapp_provider`:
  - `zapi` → lógica atual
  - `evolution` → `POST {evolution_instance_url}/message/sendText/{instance_name}`
  - `official` → `POST https://graph.facebook.com/v21.0/{phone_number_id}/messages`

### Alterar `agent-runner`
- Ao enviar resposta do agente, rotear por `whatsapp_provider` (mesmo router do `human-send`)
- Extrair para função compartilhada `_shared/whatsapp-sender.ts`

### Frontend — `ChannelsEditor`
- Card WhatsApp ganha `Select` de provider (Z-API / Evolution API / WhatsApp Oficial)
- Campos condicionais renderizados por provider
- Salva `whatsapp_provider` + campos correspondentes no agente

---

## Implementação

**Status:** `backlog`

**Depende de:** STORY-009 (concluída)

**Branch/PR:**

**Arquivos alterados:**

**Notas de implementação:**

---

## QA

**Gate:** pendente

**Checklist:**
- [ ] CA1–CA6 validados
- [ ] Z-API não regrediu
- [ ] Evolution API: mensagem recebida → resposta enviada end-to-end
- [ ] WhatsApp Oficial: mensagem recebida → resposta enviada end-to-end
- [ ] `supabase db push` executado (migration)
- [ ] `supabase functions deploy evolution-webhook` executado
- [ ] `supabase functions deploy meta-webhook human-send agent-runner` executados
- [ ] TypeScript strict, sem `any`
