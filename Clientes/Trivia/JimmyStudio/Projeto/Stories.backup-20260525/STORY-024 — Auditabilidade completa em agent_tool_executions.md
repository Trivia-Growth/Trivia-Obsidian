---
id: STORY-024
titulo: "Auditabilidade completa em agent_tool_executions"
fase: 3
modulo: jimmy-hubchat
status: em-revisao
prioridade: baixa
origem: claude
agente_responsavel: ""
criado: 2026-05-02
atualizado: 2026-05-02
---

# STORY-024 — Auditabilidade completa em agent_tool_executions

## Contexto

Achado durante teste E2E real (sessão 2026-05-02): tools que **falham na validação Zod** ou que retornam **`requires_confirmation`** NÃO são persistidas em `agent_tool_executions`. O INSERT acontece DEPOIS dessas checks no `executeAgentTool` (`_shared/agent-tools.ts:404-414`).

Isso é design intencional (loga só execuções "reais") mas tem custos de auditoria:
- Não dá pra ver quantas vezes Claude tentou usar tools com input inválido (sinal de problema no system prompt ou descrição da tool)
- Não dá pra ver histórico de pending_confirmations canceladas (sinal de UX)
- Bug fix: durante o E2E, Claude chamou `consultar_marca` com `brand_id` não-UUID — invisível em `agent_tool_executions` por causa do Zod fail antecipado

Esta story move o INSERT pra ANTES das checks, mantendo o status semanticamente correto.

## Spec de Referência

- Achado E2E: sessão 2026-05-02, cenários 2 e 3b
- Arquivo afetado: `supabase/functions/_shared/agent-tools.ts:374-414`

## Critérios de Aceite

- [ ] CA1 — `executeAgentTool` faz INSERT em `agent_tool_executions` ANTES da validação Zod, com `status='pending'`
- [ ] CA2 — Se Zod fail: UPDATE `status='error'`, `error_message=zod errors`, `duration_ms=delta` — retorna kind='error' como hoje
- [ ] CA3 — Se requires_confirmation: UPDATE `status='requires_confirmation'`, `duration_ms=delta` — retorna kind='requires_confirmation' como hoje
- [ ] CA4 — Comportamento atual de tools que executam de fato preservado (UPDATE pra success/error como hoje)
- [ ] CA5 — Smoke test: invocar tool com input inválido → `agent_tool_executions` ganha row com `status='error'`
- [ ] CA6 — Smoke test: invocar tool destrutiva sem confirmation → row com `status='requires_confirmation'`
- [ ] CA7 — `npx tsc --noEmit` exit 0; deploy de `jimmy-orchestrator` regenerando bundle

## Arquitetura

Mover o bloco de INSERT (linhas ~404-414 em `agent-tools.ts`) pra logo após o lookup do mapping. Adicionar UPDATEs nos paths de Zod fail e requires_confirmation.

```typescript
export async function executeAgentTool(toolName, params, ctx) {
  const mapping = TOOL_REGISTRY[toolName];
  if (!mapping) return { kind: "error", error: `...` };

  // INSERT log com status=pending JÁ AQUI
  const startedAt = Date.now();
  const { data: execLog } = await ctx.supabaseAdmin
    .from("agent_tool_executions")
    .insert({
      conversation_id: ctx.conversationId,
      message_id: ctx.messageId ?? null,
      tool_name: toolName,
      edge_function: mapping.edge_function ?? "[inline]",
      input_params: typeof params === "object" ? params : { _raw: params },
      status: "pending",
    })
    .select("id")
    .single();
  const execId = execLog?.id as string | undefined;

  // Zod check com UPDATE em fail
  const parsed = mapping.zod_schema.safeParse(params);
  if (!parsed.success) {
    if (execId) {
      await ctx.supabaseAdmin
        .from("agent_tool_executions")
        .update({
          status: "error",
          error_message: `Zod: ${JSON.stringify(parsed.error.errors).slice(0, 500)}`,
          duration_ms: Date.now() - startedAt,
        })
        .eq("id", execId);
    }
    return { kind: "error", error: `Parâmetros inválidos para ${toolName}: ...` };
  }
  const validParams = parsed.data;

  // requires_confirmation com UPDATE
  if (mapping.requires_confirmation && !ctx.confirmed) {
    if (execId) {
      await ctx.supabaseAdmin
        .from("agent_tool_executions")
        .update({
          status: "requires_confirmation",
          duration_ms: Date.now() - startedAt,
        })
        .eq("id", execId);
    }
    return { kind: "requires_confirmation", ... };
  }

  // ... resto fica igual: UPDATE final pra success/error
}
```

Ajuste no CHECK da coluna `status` em migration nova (ou ALTER):

```sql
ALTER TABLE agent_tool_executions DROP CONSTRAINT IF EXISTS agent_tool_executions_status_check;
ALTER TABLE agent_tool_executions ADD CONSTRAINT agent_tool_executions_status_check
  CHECK (status IN ('pending', 'running', 'success', 'error', 'requires_confirmation'));
```

## Out of scope

- Painel admin pra explorar `agent_tool_executions` (UI futura)
- Retry automático de tools com erro

## Riscos

| Risco | Mitigação |
|---|---|
| Volume de `agent_tool_executions` cresce mais rápido (todas as tentativas vs só sucessos) | Aceitável — overhead pequeno; útil pra debug. Cleanup eventual via cron se ficar grande. |
| Bug no CHECK constraint quebra INSERT | Migration aplica novo CHECK incluindo `requires_confirmation` antes do deploy do código |

---

## Implementação

**Status:** `em-revisao` (deployed em 2026-05-02)

**Branch/PR:** sem branch (mudanças diretas)

**Arquivos criados:**
- `supabase/migrations/20260502190000_agent_tool_executions_status_v2.sql` — DROP + ADD CHECK constraint incluindo `requires_confirmation`

**Arquivos modificados:**
- `supabase/functions/_shared/agent-tools.ts:490-575` — refactor de `executeAgentTool`: INSERT movido pra ANTES de Zod e do gate de confirmação. UPDATEs adicionados nos 2 early-returns (Zod fail, requires_confirmation). Status pending → running antes da execução de fato. Comportamento externo preservado (return shapes idênticos).

**Deploy:**
- ✅ Migration aplicada via `supabase db query --linked -f`
- ✅ `supabase functions deploy jimmy-orchestrator` (rebundle com agent-tools.ts atualizado)
- ✅ `npx tsc --noEmit` exit 0

**Smoke tests passaram (2026-05-02):**

| Caso | Conv ID | Persistido em agent_tool_executions |
|---|---|---|
| **CA5 — Zod fail** (Claude tentou `consultar_marca` com brand_id não-UUID) | `efc285cc-...` | `tool_name=consultar_marca, status=error, duration_ms=29, error="Parâmetros inválidos..."` ✅ |
| **CA6 — requires_confirmation** (Claude invocou `pausar_campanha_meta` com `forced_skill_id=analista_ads`) | `657aea57-...` | `tool_name=pausar_campanha_meta, status=requires_confirmation, duration_ms=22` ✅ |

Antes da story essas linhas NÃO existiriam — confirmando que o fix entregou auditabilidade completa.

**Critérios de aceite:**
- [x] CA1 — INSERT antes da validação Zod com `status='pending'`
- [x] CA2 — Se Zod fail: UPDATE com `status='error'`, `error_message`, `duration_ms`
- [x] CA3 — Se requires_confirmation: UPDATE com `status='requires_confirmation'`, `duration_ms`
- [x] CA4 — Tools que executam de fato preservam UPDATE final pra success/error (status pending → running → success/error)
- [x] CA5 — Smoke test Zod fail validado em produção
- [x] CA6 — Smoke test requires_confirmation validado em produção
- [x] CA7 — TypeScript strict + redeploy OK

**Notas de implementação:**
- **3 estados extras** agora possíveis em `agent_tool_executions.status`: `pending` (transiente — input recebido, ainda não validado), `requires_confirmation` (parou no gate destrutivo), `error` agora também cobre Zod fail (não só falha de execução)
- **`input_params` em duas formas:** quando Zod fail, persistimos o input cru `{_raw: params}`. Quando passa Zod, atualizamos pra `validParams` no UPDATE de pending → running. Permite auditar exatamente o que Claude mandou mesmo se for inválido
- **`duration_ms` em early-returns** mede só até o gate (29ms Zod, 22ms confirmação). Mesmo pequeno é útil pra detectar Zod patológicos ou checks pesados no futuro
- **Sub-agentes não afetados:** o `estrategista-marca-agent` usa sua própria `executeStrategistTool` (sem logging) — fora do escopo dessa story

---

## QA

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] CA1-CA7 validados
- [ ] Migration do CHECK aplicada antes do deploy
- [ ] `supabase functions deploy jimmy-orchestrator` (rebundle)
- [ ] Smoke tests CA5 e CA6 passam

---

## Notas e Decisões

- **Por que retro-fit em vez de reescrever:** mudança cirúrgica em uma função compartilhada. Comportamento externo do `executeAgentTool` (return shapes) não muda.
- **Status `requires_confirmation`** vira valor válido na tabela — espelha estado semântico real ("não executou, aguarda confirmação").
- **`duration_ms` em early-returns:** mede só o tempo até o gate (não a execução real). Ainda útil pra detectar Zod lentos ou checks pesados.
