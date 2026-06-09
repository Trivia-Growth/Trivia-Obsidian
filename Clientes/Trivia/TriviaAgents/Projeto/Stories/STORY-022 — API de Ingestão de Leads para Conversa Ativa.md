---
id: STORY-022
titulo: "API de Ingestão de Leads para Conversa Ativa"
fase: 2
modulo: "leads / conversations"
status: backlog
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-09
atualizado: 2026-06-09
---

# STORY-022 — API de Ingestão de Leads para Conversa Ativa

## Contexto

Plataformas externas (CRMs, landing pages, formulários, n8n, Make) precisam enviar leads para o TriviaAgents e disparar automaticamente uma conversa ativa via WhatsApp. Hoje isso só é possível manualmente pela tela "Iniciar Conversa". Esta story expõe uma edge function pública autenticada por API key que recebe o lead, registra o contato como cliente, cria a conversa e dispara o agente.

## Critérios de Aceite

### CA1 — Endpoint público autenticado por API key
- Edge function `POST /functions/v1/ingest-lead`
- Autenticação via header `x-api-key: <tenant_api_key>` (não JWT — para integração server-to-server)
- A API key é gerada e gerenciada na tabela `tokens` (já existente) com `type = 'ingest'`

### CA2 — Payload de entrada
```json
{
  "agent_id": "uuid",          // obrigatório — qual agente vai atender
  "phone": "5511999998888",    // obrigatório — telefone com DDI
  "name": "João Silva",        // opcional
  "email": "joao@email.com",   // opcional
  "notes": "Veio do form X, interessado em produto Y, orçamento R$5k", // campo livre
  "first_message": "Olá João, vi que você se inscreveu...", // opcional — mensagem inicial customizada
  "metadata": {}               // opcional — JSON livre para dados extras
}
```

### CA3 — Comportamento ao receber o lead
1. Validar API key → identificar tenant
2. Validar que `agent_id` pertence ao tenant
3. Upsert em `customers`: cria ou atualiza por `phone` + `tenant_id`
4. Criar conversa em `conversations` com `status = 'ativo'`, `channel_type = 'whatsapp'`
   - Se já existe conversa ativa para o mesmo phone + agent: reaproveitar
5. Salvar `notes` + `metadata` no campo `contact_notes` da conversa (ou em `customers.notes`)
6. Se `first_message` fornecido: usar como mensagem inicial do agente
7. Disparar `start-conversation` (edge function existente) OU chamar diretamente `agent-runner`
8. Retornar `{ conversation_id, customer_id, status: "queued" }`

### CA4 — Deduplicação
- Se já existe conversa ativa (não encerrada) para phone + agent_id: não cria nova, apenas responde com `conversation_id` existente + `status: "existing"`
- Permite reenvio seguro sem duplicar conversas

### CA5 — Tela de geração de API key
- Em Admin → Tokens: botão "Gerar Token de Ingestão"
- Exibir token gerado uma única vez com botão copiar
- Listar tokens ativos com nome, criado em, último uso

### CA6 — Documentação inline
- Endpoint retorna `405` com body de exemplo se método for GET:
  ```json
  { "docs": "POST /functions/v1/ingest-lead", "example": {...} }
  ```

## Arquitetura

### Nova Edge Function
- `supabase/functions/ingest-lead/index.ts`
- Sem JWT (`--no-verify-jwt`)
- Valida `x-api-key` contra tabela `tokens` onde `type = 'ingest'` e `active = true`

### Tabela `tokens` (verificar se já tem campos necessários)
Campos esperados: `id`, `tenant_id`, `token_hash`, `type`, `name`, `active`, `last_used_at`
- Se não tiver `token_hash`: adicionar migration com `ALTER TABLE tokens ADD COLUMN token_hash text`
- Armazenar SHA-256 do token (nunca o token em claro)

### Tabela `conversations` — campo `contact_notes`
```sql
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS contact_notes text;
```

### Fluxo de disparo
```
ingest-lead → upsert customer → create/reuse conversation → start-conversation (existente)
```

---

## Implementação

**Status:** `backlog`

**Branch/PR:**

**Notas:**
- Verificar schema atual de `tokens` antes de criar migration
- `start-conversation` já existe — reutilizar lógica ao máximo
- Prioridade: CA1 + CA2 + CA3 + CA4 são o MVP; CA5 pode ser segunda iteração
