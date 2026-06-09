---
id: STORY-020
titulo: "Configuração de Provedor de Transcrição por Agente"
fase: 2
modulo: "agents / channels"
status: backlog
prioridade: média
agente_responsavel: "@dev"
criado: 2026-06-09
atualizado: 2026-06-09
---

# STORY-020 — Configuração de Provedor de Transcrição por Agente

## Contexto

A transcrição de áudio hoje é global (via secrets do Supabase). Cada agente deve poder usar seu próprio provedor e chave — um pode usar Groq (gratuito, rápido), outro OpenAI Whisper. Sem essa configuração, todos os agentes compartilham a mesma chave global, sem isolamento de custo ou flexibilidade.

## Critérios de Aceite

### CA1 — Campos no banco
- Adicionar na tabela `agents`:
  - `transcription_provider` text CHECK IN ('groq', 'openai') DEFAULT NULL
  - `transcription_api_key_encrypted` text DEFAULT NULL

### CA2 — UI na tela do agente
- Na aba **Canais** do `ChannelsEditor`, adicionar seção "Transcrição de Áudio" abaixo das configurações de WhatsApp
- Select: **Provedor** — opções: "Groq (Whisper Large v3 — gratuito)", "OpenAI (Whisper-1)"
- Input: **API Key** — placeholder "sk-..." ou "gsk_..." conforme provedor selecionado
- Se já tiver chave salva: mostrar `••••••••` com botão "Alterar"
- Salvar criptografado via `encryptSecret` chamando edge function `encrypt-secret` (criar se não existir) — mesmo padrão das demais chaves

### CA3 — Lógica no transcribe-audio
- Receber `agentId` opcional no body da requisição
- Se `agentId` fornecido: carregar `transcription_provider` e `transcription_api_key_encrypted` do agente e usar
- Fallback: usar `TRANSCRIPTION_PROVIDER` + `GROQ_API_KEY` / `OPENAI_API_KEY` dos secrets globais

### CA4 — Passar agentId no evolution-webhook
- Ao chamar `transcribe-audio`, incluir `agentId: agent.id` no body

### CA5 — Sem quebra retroativa
- Agentes sem configuração continuam usando os secrets globais
- A seção de Transcrição na UI é opcional — se não preenchida, não salva nada

## Arquitetura

### Migration
```sql
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS transcription_provider text CHECK (transcription_provider IN ('groq', 'openai')),
  ADD COLUMN IF NOT EXISTS transcription_api_key_encrypted text;
```

### Arquivos a modificar
- `supabase/migrations/YYYYMMDD_transcription_config.sql` — migration
- `supabase/functions/transcribe-audio/index.ts` — suporte a agentId + BYOK
- `supabase/functions/evolution-webhook/index.ts` — passar agentId ao chamar transcribe-audio
- `src/features/channels/components/ChannelsEditor.tsx` — seção Transcrição de Áudio
- `supabase/functions/encrypt-secret/index.ts` — nova edge function (se não existir) para criptografar via frontend

---

## Implementação

**Status:** `backlog`

**Branch/PR:**

**Notas:**
- Verificar se `encrypt-secret` edge function já existe antes de criar
