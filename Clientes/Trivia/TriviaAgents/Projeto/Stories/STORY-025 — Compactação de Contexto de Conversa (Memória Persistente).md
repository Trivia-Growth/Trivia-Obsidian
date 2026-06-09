# STORY-025 — Compactação de Contexto de Conversa (Memória Persistente)

**Status:** Draft  
**Tipo:** Feature  
**Prioridade:** Alta  
**Estimativa:** 3 dias  
**Sprint:** Backlog

---

## Problema

Após um volume alto de mensagens numa mesma conversa (tipicamente 15-20+ trocas), o agente começa a repetir perguntas que já foram respondidas pelo lead — como nome, empresa, interesse, etc. A causa raiz é a janela de contexto do LLM: ao atingir o limite de tokens, o modelo "esquece" mensagens mais antigas e perde informações extraídas no início da conversa.

**Impacto:**
- Experiência ruim para o lead (frustração de repetir informações)
- Perda de qualificação acumulada (score, dados coletados)
- Ineficiência: tokens gastos reprocessando contexto completo a cada turno

---

## Solução

Implementar um sistema de **memória persistente por conversa** com compactação automática:

1. **Trigger de compactação**: quando `message_count` atingir um threshold configurável (ex: 20 mensagens), disparar compactação automática
2. **Extração de memória**: chamar o LLM (modelo barato/rápido) com o histórico completo para extrair um resumo estruturado com as informações-chave
3. **Armazenamento**: salvar o resumo na tabela `conversations` (campo novo `context_summary`)
4. **Injeção no prompt**: ao construir o histórico para o agent-runner, se houver `context_summary`, inserir como mensagem de sistema no início do histórico em vez de carregar todas as mensagens antigas
5. **Janela deslizante**: manter apenas as últimas N mensagens do histórico completo + o resumo, garantindo que o contexto total fique dentro do limite

---

## Acceptance Criteria

- [ ] **CA1** — Campo `context_summary` (text) adicionado à tabela `conversations` via migration
- [ ] **CA2** — Campo `context_compacted_at` (timestamptz) e `context_compaction_count` (int, default 0) adicionados à tabela `conversations`
- [ ] **CA3** — Edge Function `compact-context` criada: recebe `conversationId`, busca histórico completo, chama LLM para gerar resumo, salva em `context_summary`
- [ ] **CA4** — O `agent-runner` detecta quando `message_count >= compaction_threshold` (configurável no agente, default 20) e dispara `compact-context` de forma assíncrona (fire-and-forget com `waitUntil` ou após resposta)
- [ ] **CA5** — O `agent-runner` injeta o `context_summary` como bloco de sistema no início do histórico quando disponível, usando apenas as últimas 10 mensagens do histórico bruto (janela deslizante)
- [ ] **CA6** — O resumo gerado inclui: nome do lead, empresa, cargo, interesse declarado, objeções levantadas, próximos passos acordados, score atual, dados de qualificação coletados
- [ ] **CA7** — A compactação não bloqueia a resposta do agente (executa em paralelo ou após o envio da resposta)
- [ ] **CA8** — Recompactação automática a cada N mensagens adicionais após a primeira compactação (threshold configurável, default: a cada 10 mensagens após a primeira)
- [ ] **CA9** — Interface no dashboard mostra `context_summary` na aba de detalhes da conversa (leitura apenas, colapsável)

---

## Dev Notes

### Estrutura do Resumo (prompt de extração)

```
Você é um assistente de CRM. Analise a conversa abaixo e extraia um resumo estruturado em JSON com:
{
  "nome": string | null,
  "empresa": string | null,
  "cargo": string | null,
  "interesse_principal": string | null,
  "objecoes": string[],
  "informacoes_coletadas": Record<string, string>,
  "proximos_passos": string | null,
  "tom_geral": "positivo" | "neutro" | "negativo" | "indeciso",
  "resumo_narrativo": string  // 2-3 frases resumindo a conversa
}
```

### Injeção no agent-runner

```typescript
// Antes de montar messages[]
const systemMemory = conversation.context_summary
  ? `## Memória da Conversa (resumo das mensagens anteriores)\n\n${conversation.context_summary}`
  : null;

// Pegar apenas últimas 10 mensagens do DB
const recentMessages = allMessages.slice(-10);

// Montar system prompt com memória
const systemPrompt = [agentSystemPrompt, systemMemory].filter(Boolean).join("\n\n---\n\n");
```

### Trigger de compactação

```typescript
// Após salvar resposta do agente no agent-runner
const shouldCompact =
  conversation.message_count >= compactionThreshold &&
  (!conversation.context_compacted_at ||
    conversation.message_count - conversation.context_compaction_count >= recompactionInterval);

if (shouldCompact) {
  // Fire-and-forget — não bloqueia resposta
  EdgeRuntime.waitUntil(
    fetch(`${SUPABASE_URL}/functions/v1/compact-context`, {
      method: "POST",
      headers: { Authorization: `Bearer ${SERVICE_ROLE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: conversation.id }),
    })
  );
}
```

### Modelo para compactação

Usar modelo barato e rápido: `claude-haiku-4-5` ou equivalente via OpenRouter. Custo mínimo por compactação (~$0.001).

### Configuração por agente

Adicionar campos à tabela `agents`:
- `context_compaction_threshold` (int, default 20) — número de mensagens que dispara primeira compactação
- `context_window_size` (int, default 10) — quantas mensagens recentes manter no histórico

---

## Tasks

- [ ] **Task 1** — Migration: adicionar `context_summary`, `context_compacted_at`, `context_compaction_count` em `conversations`; adicionar `context_compaction_threshold`, `context_window_size` em `agents`
- [ ] **Task 2** — Edge Function `compact-context`: recebe `conversationId`, busca histórico, chama LLM, salva resumo
- [ ] **Task 3** — Modificar `agent-runner`: injetar `context_summary` no system prompt e usar janela deslizante de mensagens
- [ ] **Task 4** — Modificar `agent-runner`: disparar `compact-context` quando threshold atingido
- [ ] **Task 5** — Deploy das edge functions e migration
- [ ] **Task 6** — UI: exibir `context_summary` colapsável na aba de detalhes da conversa no dashboard
- [ ] **Task 7** — Testes: simular conversa longa, verificar que compactação ocorre, verificar que agente não repete perguntas

---

## File List

*(a preencher pelo Dev Agent)*

---

## Dev Agent Record

**Agent Model Used:** —  
**Completion Notes:** —  
**Debug Log:** —  
**Change Log:** —
