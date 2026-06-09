---
id: STORY-021
titulo: "Player de Áudio Inline na Conversa"
fase: 2
modulo: "conversations"
status: backlog
prioridade: média
agente_responsavel: "@dev"
criado: 2026-06-09
atualizado: 2026-06-09
---

# STORY-021 — Player de Áudio Inline na Conversa

## Contexto

Mensagens de áudio recebidas via WhatsApp (Evolution API) aparecem na timeline da conversa apenas com a transcrição em texto. O atendente não consegue ouvir o áudio original — precisa de um player inline na própria bolha da mensagem, sem abrir nova aba.

## Critérios de Aceite

### CA1 — Player inline na bolha de áudio
- Mensagens com `content.type === 'audio'` e `content.audio_url` exibem um player HTML5 inline
- Design: bolha diferenciada (ícone de microfone + waveform visual estático + botão play/pause + duração)
- Compatível com formatos `ogg`, `mp4`, `webm`, `mpeg`

### CA2 — Transcrição colapsável
- Se `content.transcript` existir, exibir abaixo do player em texto menor
- Texto colapsável: mostrar primeiras 2 linhas com botão "ver mais" se for longo

### CA3 — Fallback sem URL
- Se `audio_url` estiver vazio mas `transcript` existir: exibir só o texto da transcrição com ícone de microfone
- Se ambos vazios: exibir "🎤 Áudio não disponível"

### CA4 — Sem dependências externas
- Usar `<audio>` nativo do HTML5 — sem libs externas
- Estilizar com Tailwind/CSS para combinar com o dark theme existente

## Arquitetura

### Arquivo a modificar
- `src/features/conversations/components/ConversationTimeline.tsx`
  - Adicionar `AudioBubble` component inline para `content.type === 'audio'`

### Estrutura do AudioBubble
```tsx
function AudioBubble({ audio_url, transcript }: { audio_url: string; transcript: string }) {
  // <audio> nativo + controles customizados ou controls nativo estilizado
  // Transcrição colapsável abaixo
}
```

---

## Implementação

**Status:** `backlog`

**Branch/PR:**

**Notas:**
- O `audio_url` aponta para o Supabase Storage (bucket `conversation-attachments`)
- Verificar política de acesso público no bucket antes de implementar
