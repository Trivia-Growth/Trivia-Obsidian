---
id: STORY-024
titulo: "Pontuação e Qualificação de Leads"
fase: 2
modulo: "leads / conversations"
status: backlog
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-09
atualizado: 2026-06-09
---

# STORY-024 — Pontuação e Qualificação de Leads

## Contexto

Cada conversa representa um lead. O time de vendas precisa saber quais leads são mais quentes sem precisar ler todas as conversas. Esta story implementa um sistema de score (0–100) e qualificação por estágio (frio, morno, quente, fechado) com visualização na lista de conversas e no detalhe.

## Critérios de Aceite

### CA1 — Schema de pontuação
Adicionar à tabela `conversations`:
```sql
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS lead_score       integer DEFAULT NULL CHECK (lead_score >= 0 AND lead_score <= 100),
  ADD COLUMN IF NOT EXISTS lead_stage       text CHECK (lead_stage IN ('frio', 'morno', 'quente', 'fechado')),
  ADD COLUMN IF NOT EXISTS lead_score_notes text,   -- justificativa da LLM
  ADD COLUMN IF NOT EXISTS lead_scored_at   timestamptz;
```

### CA2 — Pontuação automática pelo agente
- Após cada resposta do `agent-runner`, chamar função de scoring assíncrona
- A função usa LLM (modelo barato — claude-haiku ou openrouter haiku) para analisar o histórico da conversa
- Prompt de scoring:
  > "Analise esta conversa e pontue o lead de 0 a 100. Critérios: interesse demonstrado, urgência, capacidade de decisão, engajamento. Classifique em: frio (0–30), morno (31–60), quente (61–85), fechado (86–100). Retorne JSON: {score: number, stage: string, notes: string}"
- Salvar `lead_score`, `lead_stage`, `lead_score_notes`, `lead_scored_at` na conversa

### CA3 — Visualização na lista de conversas
- Badge colorido com estágio ao lado do nome do contato:
  - 🔵 Frio (0–30)
  - 🟡 Morno (31–60)
  - 🔴 Quente (61–85)
  - 🟢 Fechado (86–100)
- Número do score exibido no badge (ex: "🔴 78")
- Ordenação disponível por score decrescente

### CA4 — Visualização no detalhe da conversa
- Card "Lead Score" no header da conversa (ao lado dos botões existentes)
- Score numérico + estágio + data da última avaliação
- Botão "Reavaliar" para forçar nova pontuação via LLM
- Tooltip com `lead_score_notes` (justificativa da IA)

### CA5 — Filtro por estágio no painel de conversas
- Chips de filtro: Todos | Frio | Morno | Quente | Fechado
- Filtro persiste no estado local (não é uma rota separada)

### CA6 — Pontuação manual (override)
- Atendente pode ajustar o score manualmente (input 0–100)
- Ao salvar manualmente, não sobrescreve nas próximas avaliações automáticas por 24h
- Flag `manual_override_until: timestamptz` para controlar isso

### CA7 — Relatório de qualificação
- Na tela de Relatórios, nova seção "Qualificação de Leads"
- Distribuição por estágio (barra ou pizza)
- Evolução média de score ao longo do tempo (linha)
- Top 10 leads mais quentes com link para a conversa

## Arquitetura

### Scoring flow
```
agent-runner termina → fire-and-forget para score-lead edge function
score-lead:
  1. Carrega histórico (últimas 10 mensagens)
  2. Chama LLM barato com prompt de scoring
  3. Parse JSON da resposta
  4. UPDATE conversations SET lead_score=..., lead_stage=..., lead_score_notes=..., lead_scored_at=NOW()
```

### Nova Edge Function: `score-lead`
```
POST /functions/v1/score-lead
Body: { conversationId, tenantId, agentId }
Auth: service role (chamada interna do agent-runner)
```

## Novos Arquivos
- `supabase/migrations/YYYYMMDD_lead_score.sql`
- `supabase/functions/score-lead/index.ts`
- `src/features/conversations/components/LeadScoreBadge.tsx`
- `src/features/conversations/components/LeadScoreCard.tsx`
- `src/features/reports/components/LeadQualificationChart.tsx`

## Implementação

**Status:** `backlog`

**Branch/PR:**

**Notas:**
- STORY-012 já adicionou `lead_score` ao schema — verificar se as colunas novas são compatíveis ou conflitantes antes de criar migration
- O scoring deve ser fire-and-forget (não bloquear o agent-runner)
- Usar modelo barato para scoring (claude-haiku ou gpt-4o-mini via openrouter)
