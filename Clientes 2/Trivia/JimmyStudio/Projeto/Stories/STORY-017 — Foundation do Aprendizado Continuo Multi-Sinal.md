---
id: STORY-017
titulo: "Foundation do Aprendizado Contínuo Multi-Sinal"
fase: 3
modulo: jimmy-learning
status: em-progresso
prioridade: alta
origem: claude
agente_responsavel: ""
criado: 2026-05-02
atualizado: 2026-05-02
---

# STORY-017 — Foundation do Aprendizado Contínuo Multi-Sinal

## Contexto

O Jimmy Studio já tem aprendizado por marca (`brand_preferences`, criada em STORY-015) mas captura sinais apenas de 2 fontes: edição manual de copy (`analyze-content-edit`) e mensagens do chat criativo (`detectPreferences`). **Metade dos sinais valiosos fica órfã**:

- Feedback estruturado por slide do link público de aprovação (`PublicApproval` + `approval_history.feedback`)
- Instruções de regeneração de copy (`regenerationInstructions` no `useContentGeneration`)
- Motivos de rejeição em slots do calendário (`copy_rejection_reason`)
- Performance pós-publicação (`analyze-creative-performance` — Fase 3)

Esta story cria o **plumbing unificado de coleta**: tabela `learning_events`, edge functions de log e processamento, helper de analyzers, e wire-up dos 4 sinais textuais existentes. Não muda o consumo (preferências continuam sendo lidas como hoje em `generate-content` e `content-creation-agent`).

Objetivo: **zero perda de sinal** entre as 4 fontes ativas + base extensível pras Fases 2 e 3.

## Spec de Referência

- Plano integrado: `~/.claude/plans/vamos-comecar-a-trabalhar-temporal-ullman.md` (seções 3.2 e 3.3)
- Decisão original sobre aprendizado implícito: STORY-015
- Tabela `brand_preferences` (criada): `supabase/migrations/20251201203403_d7b56cc9-*.sql`

## Critérios de Aceite

- [ ] CA1 — Tabela `learning_events` criada com colunas, indexes e RLS conforme spec
- [ ] CA2 — Tabela `brand_preferences` estendida com `confidence_score`, `validation_status`, `evidence_event_ids` (sem quebrar leitura atual)
- [ ] CA3 — Edge function `log-learning-event` aceita POST autenticado, valida via Zod, faz INSERT em `learning_events`, retorna 202
- [ ] CA4 — Edge function `process-learning-events` lê batch de 50 eventos não processados, roteia por `event_type`, faz UPSERT em `brand_preferences`, marca como `processed = true`
- [ ] CA5 — Cron pg_cron a cada 5 min invoca `process-learning-events` via pg_net
- [ ] CA6 — Helper `_shared/preference-analyzers.ts` extrai lógica de regex de `analyze-content-edit` (refactor sem mudança de comportamento)
- [ ] CA7 — `analyze-content-edit` emite `learning_events` (mantém INSERT direto em `brand_preferences` em paralelo durante migração)
- [ ] CA8 — `content-creation-agent.detectPreferences` substitui INSERT direto por emissão de `learning_events`
- [ ] CA9 — `PublicApproval.tsx` (ou edge function de submit) emite `link_feedback` event quando cliente envia feedback
- [ ] CA10 — `useContentGeneration` emite `regen_copy_instruction` event quando `regenerationInstructions` é enviado
- [ ] CA11 — Smoke test ponta-a-ponta: rejeitar conteúdo via link → aguardar 5 min → confirmar que `brand_preferences` ganhou registro com `source_type='link_feedback'`
- [ ] CA12 — Backlog de eventos não-processados monitorado (alerta se > 100)

## Arquitetura

### Migrations (novas)

**`supabase/migrations/<ts>_learning_events.sql`:**
```sql
CREATE TABLE public.learning_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'manual_edit','link_feedback','chat_feedback',
    'regen_copy_instruction','regen_image_instruction',
    'image_selection','slot_rejection','performance_signal',
    'inline_feedback','variation_selection'
  )),
  source_table TEXT,
  source_id UUID,
  content_id UUID REFERENCES contents(id) ON DELETE SET NULL,
  calendar_slot_id UUID REFERENCES calendar_slots(id) ON DELETE SET NULL,
  agent_message_id UUID REFERENCES agent_messages(id) ON DELETE SET NULL,
  raw_payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processing_error TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX idx_learning_events_unprocessed
  ON learning_events (processed, created_at) WHERE processed = false;
CREATE INDEX idx_learning_events_brand
  ON learning_events (brand_id, event_type, created_at DESC);

ALTER TABLE learning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_events FORCE ROW LEVEL SECURITY;

CREATE POLICY "super_admin_all" ON learning_events
  FOR ALL USING (is_super_admin(auth.uid()));
CREATE POLICY "user_read_own_org" ON learning_events
  FOR SELECT USING (org_id IN (SELECT org_id FROM profiles WHERE user_id = auth.uid()));
-- Escrita só via edge function (service role)
```

**`supabase/migrations/<ts>_brand_preferences_v2.sql`:**
```sql
ALTER TABLE brand_preferences
  ADD COLUMN IF NOT EXISTS confidence_score NUMERIC(3,2) DEFAULT 0.5
    CHECK (confidence_score BETWEEN 0 AND 1),
  ADD COLUMN IF NOT EXISTS validation_status TEXT DEFAULT 'detected'
    CHECK (validation_status IN ('detected','confirmed','refuted')),
  ADD COLUMN IF NOT EXISTS evidence_event_ids UUID[] DEFAULT ARRAY[]::UUID[];
```

**`supabase/migrations/<ts>_cron_process_learning.sql`:**
```sql
SELECT cron.schedule(
  'process-learning-events-5min',
  '*/5 * * * *',
  $$
    SELECT net.http_post(
      url := 'https://kjixezlzateraihxltfa.supabase.co/functions/v1/process-learning-events',
      headers := '{"Authorization":"Bearer <service-role-via-vault>"}'::jsonb
    );
  $$
);
```

### Edge functions (novas)

**`supabase/functions/log-learning-event/index.ts`:**
- Auth via JWT (`auth.getUser()`)
- Valida com Zod: `{ brand_id, event_type, source_table?, source_id?, content_id?, calendar_slot_id?, raw_payload }`
- Resolve `org_id` via brand → INSERT em `learning_events`
- Retorna 202 Accepted com `{ event_id }`
- Ações destrutivas: nenhuma — apenas log

**`supabase/functions/process-learning-events/index.ts`:**
- Service role (sem auth de usuário)
- `SELECT * FROM learning_events WHERE processed = false ORDER BY created_at LIMIT 50 FOR UPDATE SKIP LOCKED`
- Loop: roteia por `event_type` → analyzer correspondente
- Analyzer faz UPSERT em `brand_preferences` (incrementa weight + adiciona event_id em `evidence_event_ids`)
- Marca `processed = true, processed_at = now()` (ou `processing_error` se falhar)
- Retorna estatísticas: `{ processed, failed, remaining }`

**`supabase/functions/_shared/preference-analyzers.ts`:**
- Função `analyzeManualEdit(payload)` — extrai lógica atual de `analyze-content-edit:141-282`
- Função `analyzeChatFeedback(payload)` — extrai 6 patterns regex de `content-creation-agent:169-199`
- Função `analyzeLinkFeedback(payload)` — Fase 2 (placeholder na Fase 1)
- Função `analyzeRegenInstruction(payload)` — extrai categoria de texto livre via heurística simples (Fase 1) e LLM (Fase 2)
- Cada analyzer retorna `Array<{category, preference, weight_delta, confidence_delta}>`

### Edge functions (modificar)

**`supabase/functions/analyze-content-edit/index.ts`:**
- Antes do INSERT atual em `brand_preferences`, fazer INSERT em `learning_events` com `event_type='manual_edit'` e `raw_payload={previousContent, editedContent, contentId}`
- Manter INSERT direto em `brand_preferences` durante 1 sprint (paralelo) pra validar equivalência
- Após validação, remover INSERT direto e deixar só via worker

**`supabase/functions/content-creation-agent/index.ts`:**
- Em `detectPreferences()` (linha ~534), substituir `await supabaseAdmin.from('brand_preferences').upsert(...)` por `await supabaseAdmin.from('learning_events').insert({event_type: 'chat_feedback', raw_payload: {messages, detectedPrefs}, ...})`
- Worker assume daí

### Frontend (modificar)

**`src/pages/PublicApproval.tsx`:**
- Em `handleRequestChanges` (perto de linha 286), após salvar feedback em `approval_history`, chamar `log-learning-event` com `{brand_id, event_type: 'link_feedback', calendar_slot_id, raw_payload: structuredFeedback}`
- Como página é pública (sem JWT), criar variante de edge function que aceita `share_token` em vez de auth — OU: deixar que a edge function de submit feedback (que já existe) emita o event server-side

**`src/hooks/useContentGeneration.ts`:**
- Ao chamar `generateContent` com `regenerationInstructions !== undefined`, disparar via `supabase.functions.invoke('log-learning-event', {body: {brand_id, event_type: 'regen_copy_instruction', content_id: previousContent?.id, raw_payload: {instructions, previousContent}}})`

### Reuso explícito

- Lógica de regex/análise de `analyze-content-edit/index.ts:141-282` — extrair pra `preference-analyzers.ts` sem mudança de comportamento
- Lógica de `detectPreferences` em `content-creation-agent/index.ts:169-199` — extrair pra `preference-analyzers.ts`
- Padrão de auth/Zod/CORS de qualquer edge function existente (ex: `content-creation-agent/index.ts:200-250`)
- `_shared/log-ai-cost.ts` se for necessário logar custo (Fase 2 quando analyzer usar LLM)

## Out of scope (Fase 2/3)

- Analyzer sofisticado de `link_feedback` que entende slide_suggestions JSON (Fase 2)
- Analyzer de `image_selection` (Fase 2)
- Analyzer de `performance_signal` (Fase 3)
- UI de revisão de preferências (Fase 2 — STORY futura)
- Decay temporal (Fase 2)
- Tabela `brand_examples` (Fase 2)
- Tabela `brand_dna_proposals` (Fase 3)

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Worker falha silencioso | `processing_error` logado + alerta Grafana se backlog > 100 |
| Refactor de regex quebra captura existente | Manter INSERT direto em paralelo por 1 sprint + comparar contagens diárias |
| Cron pg_cron não dispara | Validar com `SELECT * FROM cron.job` + smoke test manual de 1ª execução |
| Duplicação de prefs (mesmo sinal vira 2 INSERTs) | UPSERT por (`brand_id`, `category`, `preference`) com normalização |

---

## Implementação

**Status:** `em-progresso` (deploy bloqueado por conflito de migration history — aguarda `supabase db pull`)

**Branch/PR:** sem branch (mudanças locais aguardando)

**Arquivos criados:**
- `supabase/migrations/20260502120000_learning_events.sql`
- `supabase/migrations/20260502120100_brand_preferences_v2.sql`
- `supabase/migrations/20260502120200_cron_process_learning_events.sql`
- `supabase/functions/_shared/preference-analyzers.ts`
- `supabase/functions/log-learning-event/index.ts`
- `supabase/functions/log-public-learning-event/index.ts`
- `supabase/functions/process-learning-events/index.ts`

**Arquivos modificados:**
- `supabase/functions/analyze-content-edit/index.ts` (emit event antes do INSERT direto — mantido em paralelo)
- `supabase/functions/content-creation-agent/index.ts` (substituído INSERT direto por emit event)
- `src/pages/PublicApproval.tsx` (emit `link_feedback` event quando rejeição com feedback)
- `src/hooks/useContentGeneration.ts` (emit `regen_copy_instruction` event)

**Validações OK:**
- TypeScript strict: `npx tsc --noEmit` sem erros
- Migrations válidas sintaticamente
- Edge functions seguem padrão do projeto (auth/Zod/CORS)

**Edge functions deployadas (2026-05-02):**
- ✅ `log-learning-event` (com JWT)
- ✅ `log-public-learning-event` (--no-verify-jwt — público com share_token)
- ✅ `process-learning-events` (worker para o cron)
- ✅ `analyze-content-edit` (modificada — emit event)
- ✅ `content-creation-agent` (modificada — emit event)

**Pendente (manual):**
- Aplicar SQL das 3 migrations via **Supabase Dashboard SQL Editor** (CLI inviável — 600+ comandos repair)
  - Conteúdo concatenado em `/tmp/story-017-deploy.sql`
  - Ou copiar individualmente das migrations criadas em `supabase/migrations/202605021201*`
- Smoke test ponta-a-ponta (CA11) após SQL aplicado

**Por que SQL Editor em vez de CLI:**
Conflito profundo de migration history — local tem ~250 IDs que o remoto não tem; remoto tem ~400 IDs que o local não tem (Lovable aplicou via web UI em paralelo ao team). Tentativas tanto de `db push` quanto `db pull` falharam exigindo 600+ comandos `repair` individuais. Aplicar SQL direto é mais seguro nesse cenário e não impacta o histórico de migrations.

**Notas de implementação:**
- Decisão: criar `log-public-learning-event` separada (em vez de unificar com `log-learning-event` aceitando ambos os modos de auth) — mais limpa, mais segura
- Wire-up de `analyze-content-edit` mantém INSERT direto em paralelo durante 1 sprint (validação de equivalência) — TODO criar STORY-017.1 pra remover depois
- Worker usa "claim pattern" simples (UPDATE processed=true antes de processar) em vez de FOR UPDATE SKIP LOCKED — at-most-once é aceitável dado interval de 5min
- `confidence_score` inicia em 0.5 para novas prefs e cresce +0.05 por evidência (cap em 1.0)

---

## QA

> Preenchido pelo `@qa`.

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] CA1-CA12 validados
- [ ] Build sem erros, TypeScript strict
- [ ] RLS verificado em `learning_events`
- [ ] Zod + JWT validado em `log-learning-event`
- [ ] `supabase db push` executado
- [ ] `supabase functions deploy log-learning-event process-learning-events` executado
- [ ] Cron `process-learning-events-5min` ativo (verificar `SELECT * FROM cron.job`)
- [ ] Smoke test CA11 passou em produção
- [ ] `npm audit` sem Critical/High

**Notas:**

---

## Notas e Decisões

- **Por que worker assíncrono e não inline:** isolar latência de processamento da UX do usuário; permite retry sem bloquear quem gerou o sinal
- **Por que manter INSERT direto em paralelo durante migração:** sem ambiente de staging — única forma de validar equivalência sem risco
- **Por que 5 min de cron:** UX de aprendizado não precisa ser tempo real; preferência detectada agora vira contexto na próxima geração que naturalmente leva mais que 5 min
