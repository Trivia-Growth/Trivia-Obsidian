# FamilyOS Financeiro — Arquitetura

> Decisões técnicas do projeto. Versão viva — atualizar quando algo mudar.
> Criado: 2026-05-04

---

## Diagrama de Camadas

```
┌─────────────────────────────────────────────────┐
│  Superfícies                                    │
│  Web Chat │ WhatsApp (Z-API)                    │
│  Notion (export) │ Obsidian (export)            │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│  Agent Core (Edge Function agent-chat)          │
│  Orchestrator │ Memory │ Personality │ Tools    │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│  Módulos Funcionais (Features)                  │
│  Extratos │ Orçamento │ Metas │ Investimentos   │
│  Integrações │ Config                           │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│  Data Layer — Supabase                          │
│  PostgreSQL + RLS │ Edge Functions │ pg_cron    │
└─────────────────────────────────────────────────┘
```

---

## Stack

| Componente | Decisão | Motivo |
|-----------|---------|--------|
| Frontend | React + Vite + TypeScript | Padrão Trivia; Vite rápido; TS evita bugs runtime |
| Estilo | Tailwind + shadcn/ui | Consistência sem CSS custom |
| Estado/Cache | TanStack Query | Cache automático; sem useEffect para fetching |
| Roteamento | React Router v6 | Padrão Trivia |
| Backend | Supabase Edge Functions (Deno) | Serverless, zero infra, perto do banco |
| Banco | Supabase PostgreSQL + RLS | RLS nativo; pg_cron para tarefas agendadas |
| Auth | Supabase Auth — magic link | Sem senha; JWT nativo |
| Deploy | Netlify | CI/CD automático via GitHub |
| IA principal | OpenRouter (BYOK) → `anthropic/claude-sonnet-4-5` | Gateway unificado; chave por família |
| IA parsing extratos | Gemini Flash via OpenRouter | Custo baixo para extração estruturada |
| WhatsApp | Z-API | Integração brasileira consolidada |
| Validação | Zod | Runtime + TypeScript inference |
| Testes | Vitest | Integração nativa com Vite |

---

## Modelo de Dados — Visão Geral

```
families
  └─ family_members          (user_id, role: admin|viewer)
  └─ family_settings         (openrouter_key_enc, zapi_token_enc...)
  └─ agent_memories          (type: fact|preference|goal|event)
  └─ conversations
       └─ messages
  └─ accounts                (banco, tipo: checking|savings|credit)
       └─ transactions       (date, amount, type, category_id, raw_hash)
  └─ categories              (system + custom por família)
       └─ category_rules     (patterns aprendidos)
  └─ budget_months
       └─ budget_categories  (teto por categoria por mês)
  └─ goals
       └─ goal_contributions
  └─ investments             (CDB, LCI, Ações, BTC...)
  └─ planned_expenses
  └─ audit_logs
```

---

## Isolamento Multi-família

Toda tabela com dados de família tem:
```sql
ALTER TABLE [tabela] ENABLE ROW LEVEL SECURITY;
ALTER TABLE [tabela] FORCE ROW LEVEL SECURITY;

-- SELECT: qualquer membro da família
CREATE POLICY "family_select" ON [tabela] FOR SELECT USING (
  family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
);

-- INSERT/UPDATE/DELETE: apenas admins
CREATE POLICY "family_write_admin" ON [tabela] FOR INSERT WITH CHECK (
  family_id IN (
    SELECT family_id FROM family_members
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

`family_id` **nunca** vem do frontend — sempre derivado do JWT no backend.

---

## Fluxo do Agente

```
Usuário envia mensagem
  ↓
Edge Function agent-chat
  1. Valida JWT (auth.getUser())
  2. Busca memórias relevantes (keyword search → Fase 2: embedding)
  3. Busca janela de conversa recente
  4. Monta system prompt (personalidade + memórias + contexto)
  5. Chama OpenRouter com tool definitions
  ↓
LLM decide: responder ou usar tool
  ↓  (se tool)
Executa tool → resultado volta para o LLM
  ↓
LLM gera resposta final
  ↓
Salva mensagem no banco
Atualiza memórias se necessário
Retorna resposta ao frontend
```

---

## Edge Functions

| Função | Trigger | Status |
|--------|---------|--------|
| `agent-chat` | POST frontend | planejada |
| `parse-statement` | POST multipart | planejada |
| `whatsapp-webhook` | POST Z-API | planejada |
| `send-whatsapp` | interno | planejada |
| `monthly-analysis` | pg_cron 1º dia útil | planejada |
| `pattern-detection` | pg_cron semanal | planejada |
| `notion-sync` | manual / pg_cron | planejada |
| `export-obsidian` | manual / mensal | planejada |

---

## Decisões Pendentes

| Decisão | Observação |
|---------|-----------|
| pgvector para embeddings | Preferir nativo do Supabase; avaliar custo por família |
| Criptografia de API keys | Supabase Vault ou AES-256 manual na Edge Function |
| Rate limiting | Upstash Redis ou solução nativa Supabase |
| Estratégia de OCR | Gemini Vision vs Tesseract |
| Modelo de embeddings | Avaliar OpenRouter vs Voyage AI |
