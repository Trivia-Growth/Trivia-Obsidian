---
id: STORY-010
titulo: "WhatsApp via Z-API (webhook, comandos rápidos, mensagens proativas, áudio)"
fase: 2
modulo: M6 WhatsApp
status: done
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-010 — WhatsApp via Z-API

## Contexto

WhatsApp como superfície alternativa ao chat web. Mesma memória de longo prazo, comandos rápidos para ações comuns, mensagens proativas automáticas e transcrição de áudio.

## Critérios de Aceite

- [x] CA1 — Edge Function `whatsapp-webhook` recebe mensagem, identifica usuário pelo telefone
- [x] CA2 — Comandos: `/resumo`, `/meta`, `/carteira`, `/gasto [valor] [desc]`, `/investir`
- [x] CA3 — Memória compartilhada: conversa WhatsApp e web compartilham `agent_memories`
- [ ] CA4 — Mensagens proativas: vencimento, meta atingida, gasto fora do padrão (pendente pg_cron)
- [ ] CA5 — Áudio: transcrição via Whisper → texto (pendente)
- [x] CA6 — Webhook validado por secret (header `X-Zapi-Token`)
- [x] CA7 — UI de configuração: admin configura instance_id e token Z-API
- [x] CA8 — Schema de banco para whatsapp_config e whatsapp_messages

## Tabelas de Banco

```sql
CREATE TABLE whatsapp_config (...)
CREATE TABLE whatsapp_messages (...)
-- Ver migration 20260504000012_create_whatsapp.sql
```

---

## Implementação

**Status:** Done (parcial: CA4 e CA5 pendentes)
**Branch/PR:** Direto na `main`
**Arquivos alterados:**
- `supabase/migrations/20260504000012_create_whatsapp.sql`
- `supabase/functions/whatsapp-webhook/index.ts`
- `supabase/functions/whatsapp-send/index.ts`
- `src/features/whatsapp/components/WhatsAppConfigPage.tsx`
- `src/features/whatsapp/api/useWhatsApp.ts`
- `src/features/whatsapp/types/index.ts`

---

## QA

**Gate:** PASS (com ressalvas: mensagens proativas e áudio pendentes)
**Checklist:**
- [x] Critérios de aceite core validados (CA1-CA3, CA6-CA8)
- [x] RLS validado
- [x] Build sem erros

**Notas QA:**
- Tokens Z-API armazenados criptografados no banco — nunca expostos ao client
- Webhook validado com SUPABASE_SERVICE_ROLE + X-Zapi-Token

---

## Notas e Decisões

- Token e instance ID da Z-API ficam em `whatsapp_config`, criptografados
- Cada telefone cadastrado tem perfil próprio mas compartilha contexto familiar
- Mensagens proativas dependem de pg_cron (Fase 2 completa)
