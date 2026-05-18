---
id: STORY-020
titulo: "E-mail como Canal de Atendimento — Gmail e Outlook/Microsoft 365"
modulo: "Atendimento / Canais"
status: "backlog"
fase: 8
prioridade: 2
agente_responsavel: "—"
atualizado: 2026-05-06
---

# STORY-020 — E-mail como Canal de Atendimento (Gmail + Outlook)

## Contexto

A plataforma hoje atende clientes exclusivamente via WhatsApp (Z-API e Meta Cloud API). Para PMEs brasileiras, o e-mail ainda é um canal essencial de atendimento B2B — suporte técnico, propostas comerciais e acompanhamento pós-venda chegam frequentemente por e-mail.

Esta story adiciona **e-mail como canal nativo de atendimento**, com integração OAuth com Gmail (Google Workspace) e Outlook (Microsoft 365). Os e-mails recebidos viram conversas na plataforma, com histórico unificado no CRM, suporte a IA e copiloto — exatamente como no WhatsApp.

## Arquitetura de Canais (pós-STORY-020)

```
Canais de entrada
├── WhatsApp
│   ├── Z-API (zapi-webhook)
│   └── Meta Cloud API (meta-wa-webhook)
└── E-mail (novo)
    ├── Gmail — OAuth2 Google + Gmail API (Push via Pub/Sub ou polling)
    └── Outlook — OAuth2 Microsoft + Microsoft Graph API (webhook subscriptions)
```

## O que fazer

### Migrations

**Tabela `email_accounts`:**
- [ ] Criar `email_accounts` (id, workspace_id, provider CHECK IN('gmail','outlook'), label, email_address, oauth_access_token, oauth_refresh_token, oauth_token_expires_at, microsoft_subscription_id, google_history_id, assigned_to FK → profiles, agent_persona_id FK → agent_personas, copilot_persona_id FK → agent_personas, is_active, webhook_registered, created_by, created_at, updated_at)
- [ ] RLS FORCE: SELECT → workspace_members; ALL → admin/manager/superadmin
- [ ] Index: workspace_id, email_address

**Evolução de tabelas existentes:**
- [ ] ALTER `conversations` ADD COLUMN `email_account_id` uuid FK → email_accounts (nullable)
- [ ] Atualizar CHECK de `channel`: `CHECK (channel IN ('whatsapp', 'email'))`
- [ ] ALTER `messages` ADD COLUMN `email_message_id` text (ID do e-mail no provider: RFC Message-ID)
- [ ] ALTER `messages` ADD COLUMN `email_thread_id` text (thread/conversation ID no provider)
- [ ] ALTER `messages` ADD COLUMN `email_subject` text
- [ ] ALTER `messages` ADD COLUMN `email_from` text
- [ ] ALTER `messages` ADD COLUMN `email_to` text[]
- [ ] ALTER `messages` ADD COLUMN `email_cc` text[]
- [ ] ALTER `messages` ADD COLUMN `email_html` text (corpo HTML do e-mail)

**Tabela `oauth_states`** (para o fluxo PKCE/state do OAuth):
- [ ] Criar `oauth_states` (id, workspace_id, user_id, provider, state uuid UNIQUE, created_at, expires_at)
- [ ] RLS FORCE

### Edge Functions

**`email-oauth-connect` (nova):**
- [ ] `GET /email-oauth-connect?provider=gmail&workspace_id=xxx` → gera URL de autorização OAuth2 com state
- [ ] `GET /email-oauth-connect?code=xxx&state=xxx` → callback: troca code por tokens, armazena em email_accounts, inicia webhook subscription
- [ ] Suportar ambos providers (gmail e outlook) pelo query param `provider`
- [ ] Input validado com Zod; JWT via auth.getUser()

**`email-webhook-gmail` (nova):**
- [ ] Recebe notificações push do Google Pub/Sub (`POST /email-webhook-gmail?workspace_id=xxx`)
- [ ] Verifica autenticidade via Google Pub/Sub token
- [ ] Usa Gmail API com access_token para buscar mensagens novas (via historyId delta)
- [ ] Normaliza para o formato interno: cria/atualiza conversa + inserção de message
- [ ] Auto-vincula a contato existente por email_from
- [ ] Dispara ai-orchestrator se ai_mode='ai'
- [ ] Retorna 200 imediato (Google exige ACK em < 10s)

**`email-webhook-outlook` (nova):**
- [ ] Recebe notificações do Microsoft Graph API (subscription webhook)
- [ ] Verifica validationToken na primeira chamada (GET de validação)
- [ ] Busca e-mail via Graph API: `GET /messages/{id}` com access_token
- [ ] Normaliza para o formato interno: cria/atualiza conversa + inserção de message
- [ ] Dispara ai-orchestrator se ai_mode='ai'
- [ ] Retorna 202 para Microsoft

**`email-send` (nova):**
- [ ] Rota unificada para envio (Gmail ou Outlook), chamada pelo `whatsapp-router` evoluído
- [ ] Detecta provider via email_account.provider
- [ ] Gmail: POST `https://gmail.googleapis.com/gmail/v1/users/me/messages/send` (MIME base64)
- [ ] Outlook: POST `https://graph.microsoft.com/v1.0/me/sendMail`
- [ ] Suporta reply-in-thread: usa email_thread_id para manter threading nativo
- [ ] Persiste outbound message com email_message_id e email_thread_id
- [ ] Atualiza conversa (last_message_at, preview)

**`email-token-refresh` (nova — cron):**
- [ ] Executa a cada hora via Supabase Cron Jobs (pg_cron)
- [ ] Busca email_accounts com oauth_token_expires_at < now() + 10min
- [ ] Faz refresh do access_token via endpoint apropriado (Google ou Microsoft)
- [ ] Atualiza tokens no banco
- [ ] Em falha: marca is_active=false e alerta workspace via notificação

**Evoluir `whatsapp-router` → `channel-router` (ou adicionar lógica):**
- [ ] Ao detectar `conversations.channel='email'`, roteia para `email-send`
- [ ] Mantém compatibilidade com conversas WhatsApp existentes

### Frontend

**Settings → Nova aba "E-mail":**
- [ ] Lista de contas conectadas (provider badge Gmail/Outlook, email, status, webhook ativo/pendente)
- [ ] Botão "Conectar Gmail" → abre popup OAuth Google (escopos: gmail.modify, gmail.send)
- [ ] Botão "Conectar Outlook" → abre popup OAuth Microsoft (escopos: Mail.ReadWrite, Mail.Send, offline_access)
- [ ] Por conta: toggle ativo/inativo, selects Agente Autônomo + Copiloto (agent_personas), botão desconectar (revoga tokens)
- [ ] Badge de status: conectado / token expirado / webhook inativo

**Tela de Conversas — adaptações:**
- [ ] Identificador de canal no header da conversa: ícone de e-mail + endereço
- [ ] Assunto do e-mail visível abaixo do nome do contato
- [ ] Campo de resposta: suporte a texto rico (formato HTML básico) para e-mails
- [ ] Thread de e-mail: mensagens agrupadas por thread_id mostram assunto + metadata (from, to, cc)
- [ ] Badge de canal na lista de conversas: ✉️ para e-mail, vs 📱 para WhatsApp

**CRM — Ficha do Contato:**
- [ ] Campo `email` já existe na tabela contacts — vincular automaticamente conversas de e-mail a contatos

### Segurança

- [ ] OAuth tokens armazenados apenas no servidor (nunca no frontend)
- [ ] Rotação automática de refresh tokens antes da expiração
- [ ] Revogar tokens ao desconectar a conta (`email-oauth-connect DELETE`)
- [ ] Scopes mínimos necessários: sem acesso à caixa inteira, apenas mensagens recebidas após a conexão
- [ ] state param com CSRF token no fluxo OAuth (tabela oauth_states)

### Observações Técnicas

**Gmail:**
- API: Gmail API v1 + Google Pub/Sub para push notifications
- Pub/Sub tópico por workspace: `projects/{gcp_project}/topics/gmail-{workspace_id}`
- historyId: armazenar último historyId processado para evitar reprocessamento
- Limite de quota: 1 bilhão de unidades/dia — não é problema para PME

**Outlook / Microsoft 365:**
- API: Microsoft Graph API v1.0
- Webhooks: subscription com validade de 3 dias → renovação automática via cron
- Suporte a contas @outlook.com E contas corporativas (Azure AD / Entra ID)
- Token endpoint difere entre contas pessoais (https://login.microsoftonline.com/consumers) e corporativas (https://login.microsoftonline.com/organizations)

**Threading:**
- Gmail usa `threadId` nativo
- Outlook usa `conversationId` nativo
- Internamente: `conversations.phone` = email_address do remetente (mantém arquitetura atual)

## Critérios de Aceite

- [ ] Admin conecta conta Gmail via OAuth sem sair da plataforma
- [ ] Admin conecta conta Outlook (pessoal ou corporativo) via OAuth
- [ ] E-mails recebidos aparecem como conversas em tempo quase real (< 30s)
- [ ] Resposta enviada pela plataforma chega no e-mail do cliente com threading correto
- [ ] Agente IA pode responder e-mails automaticamente quando ai_mode='ai'
- [ ] Copiloto sugere respostas para e-mails
- [ ] Tokens renovados automaticamente sem intervenção do usuário
- [ ] `npm run build` sem erros, TypeScript strict
- [ ] RLS verificado em todas as novas tabelas

## Dependências

- STORY-002 (Meta WA): introduziu `channel` em conversations e `whatsapp-router` — STORY-020 reutiliza a mesma arquitetura multi-canal
- STORY-019 (Personas): agent_persona_id e copilot_persona_id em email_accounts — reutiliza personas existentes
- Google Cloud Project com Gmail API habilitada + Pub/Sub tópico configurado
- Microsoft Azure App Registration com escopos Mail.ReadWrite + Mail.Send
- Variáveis de ambiente novas:
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_PUBSUB_TOPIC`
  - `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID`

## Sprints Sugeridos

| Sprint | Entregável |
|--------|-----------|
| **A** | Migrations + `email_accounts` + evolução conversations/messages |
| **B** | OAuth connect (Gmail + Outlook) + Settings UI |
| **C** | Webhooks de recebimento (gmail + outlook) |
| **D** | `email-send` + evolução channel-router + UI de resposta |
| **E** | Token refresh cron + UI polish + testes |

## Complexidade

Alta. Recomenda-se execução por sprints com testes de integração reais (conta Gmail e Outlook de teste) antes de liberar para produção.
