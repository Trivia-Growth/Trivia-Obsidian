---
id: STORY-012
titulo: "Rich Media na Conversa + Lead Score"
fase: 2
modulo: "conversations"
status: backlog
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-07
atualizado: 2026-06-07
---

# STORY-012 — Rich Media na Conversa + Lead Score

## Contexto

O atendente humano hoje só consegue enviar texto na `HumanReplyBar`. A timeline já renderiza imagens e áudios *recebidos*, mas não permite que o atendente envie mídia. Além disso, o bot já transcreve áudio via Groq/Whisper (F14), mas o atendente não pode gravar/enviar áudio.

A segunda parte da story adiciona um **Lead Score** automático por conversa — score 0–100 calculado por LLM com base no histórico, que aparece na timeline e no pipeline card para priorizar follow-up.

## Critérios de Aceite

### CA1 — Emoji picker
- Botão 😊 abre picker (`@emoji-mart/react`)
- Emoji inserido na posição do cursor

### CA2 — Envio de imagens/anexos pelo atendente
- Botão 📎, file input (imagem jpeg/png/webp/gif, pdf, até 10MB)
- Preview antes de enviar; upload para Supabase Storage `conversation-attachments`
- Timeline: imagem inline com lightbox, documento como card com download

### CA3 — Gravação e envio de áudio pelo atendente
- Botão 🎤, MediaRecorder, timer, cancelar/confirmar
- Upload → envia via `human-send` → AudioBubble na timeline

### CA4 — Transcrição de áudio do contato
- Manter Groq Whisper (`whisper-large-v3-turbo`) como padrão — já implementado
- OpenRouter não suporta transcrição de áudio (é gateway de LLMs de texto/visão apenas)

### CA5 — Lead Score
- Colunas: `lead_score`, `lead_score_label`, `lead_score_reason`, `lead_score_at`
- Labels: Frio (0–24) · Morno (25–49) · Quente (50–74) · Qualificado (75–100)
- Edge Function `score-lead`: Claude Haiku via BYOK do tenant
- Trigger: botão manual na conversa + automático ao fechar
- Exibição: badge no header da conversa e no PipelineCard

### CA6 — Lightbox para imagens recebidas
- Imagem clicável abre modal de zoom (hoje abre link externo)

## Arquitetura Resumida

- Migration: `ALTER TABLE conversations ADD COLUMN lead_score integer, lead_score_label text, lead_score_reason text, lead_score_at timestamptz`
- Storage bucket: `conversation-attachments` (privado, signed URLs)
- Nova Edge Function: `score-lead`
- Alterar: `human-send` (suporte a mídia), `HumanReplyBar`, `PipelineCard`, `ConversationTimeline`
- Novas deps: `@emoji-mart/react`, `@emoji-mart/data`

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
- [ ] Emoji, imagem, documento, áudio: envio e exibição OK
- [ ] Lead Score calculado, label e badge corretos
- [ ] Score no PipelineCard
- [ ] `supabase db push` + `supabase functions deploy score-lead human-send`
- [ ] TypeScript strict, sem `any`
