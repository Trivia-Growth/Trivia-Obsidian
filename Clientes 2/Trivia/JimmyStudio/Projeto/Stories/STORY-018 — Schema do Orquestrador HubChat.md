---
id: STORY-018
titulo: "Schema do Orquestrador HubChat"
fase: 3
modulo: jimmy-hubchat
status: pronto
prioridade: alta
origem: claude
agente_responsavel: ""
criado: 2026-05-02
atualizado: 2026-05-02
---

# STORY-018 — Schema do Orquestrador HubChat

## Contexto

O HubChat (`jimmy-orchestrator`) precisa persistir mensagens com `tool_calls`, vincular conversas à marca ativa, e logar execuções de tools. As tabelas atuais (`agent_conversations`, `agent_messages`) suportam só texto puro.

Esta story prepara o schema mínimo pro orquestrador: estende `agent_messages` e `agent_conversations` com colunas pra tool use + cria `agent_tool_executions` pra log detalhado de cada chamada de ferramenta.

**Decisão importante:** NÃO adicionar `tokens_used` em `agent_messages` — o sistema já tem `ai_usage_costs` com cron de auditoria diário. Reutilizar com `reference_type='agent_message'` evita duplicação.

## Spec de Referência

- Plano integrado: `~/.claude/plans/vamos-comecar-a-trabalhar-temporal-ullman.md` (seção 3.2)
- Schema atual de `agent_conversations` e `agent_messages`: `supabase/migrations/20260205101955_428bd6c8-*.sql`

## Critérios de Aceite

- [ ] CA1 — `agent_messages` ganha colunas `message_type` (CHECK), `tool_calls` (JSONB), `skill_id` (TEXT) — DEFAULTs preservam comportamento atual
- [ ] CA2 — `agent_conversations` ganha `brand_id` (FK opcional) e `skill_id` (TEXT)
- [ ] CA3 — Tabela nova `agent_tool_executions` criada com colunas conforme spec
- [ ] CA4 — RLS de `agent_tool_executions`: super_admin total + user vê só de conversas próprias
- [ ] CA5 — Index em `agent_tool_executions(conversation_id, created_at DESC)` pra UI mostrar histórico
- [ ] CA6 — Migration roda sem quebrar `useHelpAgent`/`help-agent-chat` (validar query atual continua funcionando)
- [ ] CA7 — Types regenerados em `src/integrations/supabase/types.ts` via `supabase gen types`

## Arquitetura

### Migration única

**`supabase/migrations/<ts>_agent_orchestrator_schema.sql`:**
```sql
ALTER TABLE agent_messages
  ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text'
    CHECK (message_type IN ('text','tool_call','tool_result','system')),
  ADD COLUMN IF NOT EXISTS tool_calls JSONB,
  ADD COLUMN IF NOT EXISTS skill_id TEXT;

ALTER TABLE agent_conversations
  ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS skill_id TEXT;

CREATE TABLE public.agent_tool_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES agent_conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES agent_messages(id) ON DELETE SET NULL,
  tool_name TEXT NOT NULL,
  edge_function TEXT NOT NULL,
  input_params JSONB NOT NULL,
  output_result JSONB,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','running','success','error')),
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_agent_tool_executions_conv
  ON agent_tool_executions (conversation_id, created_at DESC);

ALTER TABLE agent_tool_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tool_executions FORCE ROW LEVEL SECURITY;

CREATE POLICY "super_admin_all" ON agent_tool_executions
  FOR ALL USING (is_super_admin(auth.uid()));

CREATE POLICY "user_read_own_conversations" ON agent_tool_executions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agent_conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );
-- Escrita só via service role (edge function)
```

### Validação de não-regressão

- Rodar `useHelpAgent` em DEV após migration, validar que histórico carrega normalmente
- `SELECT * FROM agent_messages LIMIT 5` deve retornar com `message_type='text'` (DEFAULT)
- `SELECT * FROM agent_conversations LIMIT 5` deve retornar com `brand_id=NULL` e `skill_id=NULL`

### Reuso explícito

- Padrão de RLS de `agent_messages` (criada em `20260205101955_428bd6c8-*.sql`)
- Função `is_super_admin(auth.uid())` — já existe

## Out of scope

- Edge function que escreve nessas colunas (STORY-021)
- Helpers que consomem (STORY-019)
- UI que mostra histórico de tool executions (STORY-022)

## Riscos

| Risco | Mitigação |
|---|---|
| Migration trava em produção (lock de `agent_messages`) | `ADD COLUMN IF NOT EXISTS` com DEFAULT — operação rápida no Postgres 11+ |
| `useHelpAgent` quebra ao ler colunas novas | Colunas têm DEFAULT — query atual continua válida; testar antes do push |

---

## Implementação

**Status:** `pronto`
**Branch/PR:**
**Arquivos alterados:**
**Notas:**

---

## QA

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] CA1-CA7 validados
- [ ] Build sem erros, TypeScript strict
- [ ] RLS verificado em `agent_tool_executions`
- [ ] `supabase db push` executado em produção
- [ ] Types regenerados e commitados
- [ ] `useHelpAgent` testado pós-migration sem regressão
- [ ] `npm audit` sem Critical/High

---

## Notas e Decisões

- **Sem `tokens_used` em `agent_messages`:** decisão deliberada — `ai_usage_costs` com cron de auditoria já cobre. Duplicar quebraria reconciliação.
- **`brand_id` é nullable:** conversas legadas (help-agent atual) não têm marca; o orquestrador exige.
- **`agent_tool_executions` não tem `org_id`:** acesso é via FK pra `agent_conversations` (que tem org_id).
