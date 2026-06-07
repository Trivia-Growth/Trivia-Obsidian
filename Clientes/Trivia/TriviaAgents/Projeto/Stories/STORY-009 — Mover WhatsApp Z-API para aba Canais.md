---
id: STORY-009
titulo: "Mover configuração WhatsApp Z-API da Visão Geral para aba Canais"
fase: 1
modulo: "agents / channels"
status: backlog
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-07
atualizado: 2026-06-07
---

# STORY-009 — Mover WhatsApp Z-API para aba Canais

## Contexto

A configuração do canal WhatsApp (número, URL da instância Z-API e token) está hoje na aba "Visão Geral" do agente, misturada com identidade e modelo LLM. Isso é inconsistente: Instagram e Facebook já ficam na aba "Canais". WhatsApp deve viver no mesmo lugar, tornando a UX previsível — tudo sobre canais de mensagem em um único lugar.

## Critérios de Aceite

- [ ] CA1 — A seção "Integração WhatsApp (Z-API)" é removida do `AgentForm` (aba Visão Geral)
- [ ] CA2 — Os campos `whatsapp_number`, `zapi_instance_url` e `zapi_token` aparecem no `ChannelsEditor` (aba Canais), no mesmo estilo visual dos cards Instagram/Facebook
- [ ] CA3 — Salvar os campos WhatsApp no `ChannelsEditor` faz PATCH no agente (mesma lógica atual, sem migração de banco)
- [ ] CA4 — Os campos `whatsapp_number`, `zapi_instance_url`, `zapi_token` são removidos do schema Zod do `AgentForm` e do payload `formValuesToAgentPayload`
- [ ] CA5 — Criação de novo agente funciona sem os campos WhatsApp (eles são opcionais e configurados depois na aba Canais)

## Diff Plan

### `src/features/agents/components/AgentForm.tsx`
- Remover campos `whatsapp_number`, `zapi_instance_url`, `zapi_token` do schema Zod
- Remover seção JSX "Integração WhatsApp (Z-API)"
- Remover esses campos dos helpers `agentToFormValues` e `formValuesToAgentPayload`

### `src/features/channels/components/ChannelsEditor.tsx`
- Adicionar card WhatsApp Z-API com os 3 campos (número, URL instância, token)
- Carregar valores atuais via prop `agent` (já passada pela rota)
- Salvar via PATCH no agente (endpoint existente `useMutateAgent` ou fetch direto para `agents` table)

### Sem migração de banco
- Campos `whatsapp_number`, `zapi_instance_url`, `zapi_token_encrypted` permanecem na tabela `agents`

---

## Implementação

**Status:** `backlog`

**Branch/PR:**

**Arquivos alterados:**

**Notas de implementação:**

---

## QA

**Gate:** pendente

**Checklist:**
- [ ] CA1–CA5 validados
- [ ] Build sem erros, TypeScript strict
- [ ] Salvar WhatsApp na aba Canais persiste corretamente
- [ ] Criar agente sem preencher WhatsApp funciona
- [ ] Aba Visão Geral não tem mais campos Z-API
