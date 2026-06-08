---
id: STORY-017
titulo: "Exibir URL do Webhook Evolution API na tela de Canais"
fase: 2
modulo: "channels"
status: backlog
prioridade: média
agente_responsavel: "@dev"
criado: 2026-06-08
atualizado: 2026-06-08
---

# STORY-017 — Exibir URL do Webhook Evolution API na tela de Canais

## Contexto

Ao configurar a Evolution API, o atendente/admin precisa informar a URL do webhook no painel da Evolution. Atualmente essa URL não aparece em lugar nenhum na plataforma — o usuário precisa saber de cor ou consultar documentação externa.

## Critérios de Aceite

### CA1 — URL visível na configuração do canal
- Na seção de configuração Evolution API dentro de `ChannelsEditor`, exibir a URL do webhook logo abaixo do campo `evolution_instance_name`
- Formato: campo somente-leitura com botão "Copiar"

### CA2 — URL correta por ambiente
- A URL é derivada de `VITE_SUPABASE_URL`:
  ```
  {VITE_SUPABASE_URL}/functions/v1/evolution-webhook
  ```

### CA3 — Feedback de cópia
- Ao clicar em "Copiar": ícone muda para ✓ por 2s + toast "URL copiada!"

### CA4 — Sem migration, sem edge function nova
- Apenas mudança de frontend em `ChannelsEditor.tsx`

## Arquitetura

- Arquivo: `src/features/channels/components/ChannelsEditor.tsx`
- Adicionar bloco após o campo `evolution_instance_name`:
  ```tsx
  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/evolution-webhook`
  ```
- Usar `navigator.clipboard.writeText()` para copiar

---

## Implementação

**Status:** `backlog`

**Branch/PR:**

**Notas:**
