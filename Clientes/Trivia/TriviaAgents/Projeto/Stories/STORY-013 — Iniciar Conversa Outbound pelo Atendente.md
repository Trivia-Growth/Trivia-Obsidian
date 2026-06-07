---
id: STORY-013
titulo: "Iniciar Conversa Outbound pelo Atendente"
fase: 2
modulo: "conversations"
status: backlog
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-07
atualizado: 2026-06-07
---

# STORY-013 — Iniciar Conversa Outbound pelo Atendente

## Contexto

Hoje a plataforma é 100% reativa: uma conversa só existe quando o contato envia a primeira mensagem via webhook. O caso de uso: prospecção ativa, follow-up de leads, reativação de clientes — o atendente preenche o telefone, escolhe o agente/canal, escreve a mensagem e envia. A partir daí, o bot pode assumir automaticamente ou a conversa fica em modo manual.

## Critérios de Aceite

### CA1 — Botão "Nova Conversa"
- Header da `ConversationList` e do `PipelineBoard`
- Visível para todas as roles autenticadas

### CA2 — Modal com campos
| Campo | Obrigatório |
|---|---|
| Telefone do contato (com máscara) | ✅ |
| Nome do contato | ❌ |
| Vincular cliente existente | ❌ |
| Agente (select ativos) | ✅ |
| Canal (dinâmico pelo agente) | ✅ |
| Mensagem inicial | ✅ |
| Modo: "Bot assume" / "Manual" | ✅ |

### CA3 — Validações
- Agente sem canal configurado: aviso inline "Configure o canal antes"
- Instagram/Facebook: erro "Canal não suporta mensagens iniciadas pela empresa"

### CA4 — Edge Function `start-conversation`
1. Cria `conversations` (status `ativo` se bot assume, `handoff` se manual)
2. Insere mensagem como `role: 'atendente'`
3. Envia via API do canal (Z-API / Evolution / Meta Cloud)
4. Se bot assume: dispara `agent-runner`
5. Retorna `{ conversation_id }`

### CA5 — Navegação após envio
- Modal fecha → navega para `/conversations/{id}`
- Toast de sucesso com link

### CA6 — Sem migration
Todos os campos já existem em `conversations`

## Arquitetura

- Nova Edge Function: `start-conversation`
- Novo shared: `_shared/channel-sender.ts` (extraído de `human-send` para reutilizar)
- Novos arquivos frontend: `NewConversationModal.tsx`, `useStartConversation.ts`
- Alterar: `ConversationList`, `PipelineBoard`

---

## Implementação

**Status:** `backlog`

**Branch/PR:**

**Notas de implementação:**

---

## QA

**Gate:** pendente

**Checklist:**
- [ ] CA1–CA6 validados
- [ ] Modo bot e modo manual funcionam corretamente
- [ ] Realtime: conversa aparece na lista sem refresh
- [ ] `supabase functions deploy start-conversation`
- [ ] TypeScript strict, sem `any`
