---
id: STORY-021
titulo: "Edge Function jimmy-orchestrator (Backend HubChat)"
fase: 3
modulo: jimmy-hubchat
status: pronto
prioridade: alta
origem: claude
agente_responsavel: ""
criado: 2026-05-02
atualizado: 2026-05-02
---

# STORY-021 — Edge Function jimmy-orchestrator (Backend HubChat)

## Contexto

Esta é a peça central do HubChat: o orquestrador conversacional que recebe mensagens do usuário, escolhe a skill apropriada (ou delega pro sub-agente certo), executa tools em loop, persiste tudo, e retorna a resposta final.

Não substitui `help-agent-chat` (que continua para suporte de produto). Coexistem. Feature flag `JIMMY_HUBCHAT_ENABLED` controla rollout.

Pré-requisitos: STORY-018 (schema), STORY-019 (helpers), STORY-020 (sub-agentes).

## Spec de Referência

- Plano integrado: `~/.claude/plans/vamos-comecar-a-trabalhar-temporal-ullman.md` (seções 3.1, 4.3, 4.4)
- Padrão de edge function de chat existente: `supabase/functions/help-agent-chat/index.ts`, `supabase/functions/content-creation-agent/index.ts`

## Critérios de Aceite

- [ ] CA1 — Edge function `jimmy-orchestrator/index.ts` criada com auth JWT, Zod, CORS no padrão
- [ ] CA2 — Aceita input `{ message, conversation_id?, brand_id, forced_skill_id?, confirmed?: boolean, confirmed_tool_call?: object }` validado por Zod
- [ ] CA3 — Rate limit via RPC `check_agent_interaction_limit` (já existente)
- [ ] CA4 — Cria nova `agent_conversations` se `conversation_id` não fornecido — popula `brand_id`, `skill_id` (se forçada), `org_id`
- [ ] CA5 — Carrega histórico recente da conversa (últimas 20 mensagens) + `getBrandLearningContext(brand_id)`
- [ ] CA6 — Se `forced_skill_id` fornecido OU mensagem casa com Estrategista/Gerador via `selectSkill`: executa em "modo skill" (uma das 2) ou delega
- [ ] CA7 — Loop de tool use: max 8 iterações, max 30s por tool, total 120s — fallback gracioso se exceder
- [ ] CA8 — Tools com `requires_confirmation`: orquestrador interrompe loop, retorna pra UI com `pending_confirmation: { tool_name, params, summary }`. UI confirma → próxima mensagem inclui `confirmed: true, confirmed_tool_call: {...}` → orquestrador executa
- [ ] CA9 — Persiste mensagens em `agent_messages` com `message_type` apropriado (text/tool_call/tool_result), `tool_calls` JSONB, `skill_id`
- [ ] CA10 — Persiste cada execução em `agent_tool_executions` com duração e status
- [ ] CA11 — Loga custo total em `ai_usage_costs` (`feature_type='jimmy_orchestrator'`, `reference_id=message_id`)
- [ ] CA12 — Emite `learning_events` quando detecta feedback inline ("não, mais curto") via heurística simples
- [ ] CA13 — Feature flag `JIMMY_HUBCHAT_ENABLED` (env Supabase): se `false`, retorna 503 com mensagem clara
- [ ] CA14 — Retorna `{ response: string, conversation_id, message_id, action?: object, pending_confirmation?: object, remaining_interactions, tool_executions: Array<{tool_name, status, duration_ms}> }`
- [ ] CA15 — Smoke tests:
  - Conversa simples (sem tool): "olá" → resposta texto
  - Skill `analista_ads`: "como estão minhas campanhas Meta essa semana?" → executa `buscar_insights_meta` + `analisar_performance_meta` → tabela
  - Delegação Estrategista: "qual nosso gap de posicionamento?" → invoca `estrategista-marca-agent`
  - Delegação Gerador: "cria post sobre X" → invoca `gerador-conteudo-agent`
  - Confirmação destrutiva: "pausa essa campanha" → retorna `pending_confirmation` → confirmar → executa

## Arquitetura

### `jimmy-orchestrator/index.ts` (~400 linhas estimadas)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";
import { callClaudeWithTools } from "../_shared/anthropic-tools.ts";
import { SKILLS, selectSkill, renderSystemPrompt } from "../_shared/agent-skills.ts";
import { TOOL_REGISTRY, executeAgentTool } from "../_shared/agent-tools.ts";
import { getBrandLearningContext } from "../_shared/brand-learning.ts";
import { logAiCost } from "../_shared/log-ai-cost.ts";

const inputSchema = z.object({
  message: z.string().min(1).max(4000),
  conversation_id: z.string().uuid().optional(),
  brand_id: z.string().uuid(),
  forced_skill_id: z.enum(["analista_ads", "analista_conteudo"]).optional(),
  confirmed: z.boolean().optional(),
  confirmed_tool_call: z.object({
    tool_name: z.string(),
    params: z.record(z.unknown()),
  }).optional(),
});

serve(async (req) => {
  // 1. Feature flag check
  if (Deno.env.get("JIMMY_HUBCHAT_ENABLED") !== "true") {
    return problem(503, "HubChat ainda não disponível pra essa conta", reqId);
  }

  // 2. Auth + Zod (padrão)

  // 3. Rate limit via check_agent_interaction_limit

  // 4. Resolve conversation (criar OU carregar)

  // 5. Carrega contexto:
  const learningCtx = await getBrandLearningContext(supabaseAdmin, brand_id, { depth: "full" });
  const history = await loadHistory(supabaseAdmin, conversationId, 20);

  // 6. Persiste user message
  await insertMessage(conversationId, "user", message);

  // 7. Se confirmed_tool_call: executa direto, pula seleção de skill
  if (confirmed && confirmed_tool_call) {
    const result = await executeAgentTool(confirmed_tool_call.tool_name, confirmed_tool_call.params, ctx);
    // continua loop
  }

  // 8. Seleção de skill (auto OU forced)
  const skill = forcedSkillId ? SKILLS.find(s => s.id === forcedSkillId)
                              : await selectSkill(message, supabaseAdmin, brand_id);

  // 9. Render system prompt + tools liberadas (subset do TOOL_REGISTRY)
  const systemPrompt = renderSystemPrompt(skill, { brandDna, learningContext, date });
  const tools = skill.tools.map(name => toolDefinitionFromRegistry(name));

  // 10. Loop de tool use (max 8 iterações)
  let iteration = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  const toolExecutions = [];

  while (iteration < 8) {
    const claudeResp = await callClaudeWithTools({
      model: DEFAULT_CLAUDE_MODEL,
      system: systemPrompt,
      messages: conversationMessages,
      tools,
      temperature: skill.temperature,
      maxTokens: 2000,
    });

    totalInputTokens += claudeResp.usage.input_tokens;
    totalOutputTokens += claudeResp.usage.output_tokens;

    if (claudeResp.stopReason === "end_turn") {
      // Resposta final — sai do loop
      break;
    }

    if (claudeResp.stopReason === "tool_use") {
      for (const toolUse of claudeResp.toolUses) {
        const mapping = TOOL_REGISTRY[toolUse.name];

        if (mapping.requires_confirmation && !confirmed) {
          // Interrompe loop, retorna pending_confirmation
          return ok({
            pending_confirmation: { tool_name: toolUse.name, params: toolUse.input, summary: "..." },
            response: "Posso prosseguir com essa ação?",
            ...
          });
        }

        const result = await executeAgentTool(toolUse.name, toolUse.input, ctx);
        toolExecutions.push({ tool_name: toolUse.name, status: result.success ? "success" : "error", duration_ms: ... });

        // Adiciona tool_result ao histórico
        conversationMessages.push({ role: "user", content: [{ type: "tool_result", tool_use_id: toolUse.id, content: JSON.stringify(result) }] });
      }
    }

    iteration++;
  }

  // 11. Persiste assistant message + tool_calls + skill_id
  const messageId = await insertMessage(conversationId, "assistant", finalText, { tool_calls: toolExecutions, skill_id: skill.id });

  // 12. Detecta feedback inline → emite learning_event (heurística simples)
  if (detectsInlineFeedback(message)) {
    await logLearningEvent({ event_type: "inline_feedback", brand_id, agent_message_id: messageId, raw_payload: { message } });
  }

  // 13. Loga custo
  await logAiCost({ feature_type: "jimmy_orchestrator", tokensInput: totalInputTokens, tokensOutput: totalOutputTokens, referenceId: messageId });

  return ok({ response, conversation_id, message_id, tool_executions: toolExecutions, remaining_interactions });
});
```

### Fluxo visual

```
1. POST /jimmy-orchestrator { message, brand_id }
2. Carrega contexto (learning + history)
3. Seleciona skill (auto/forced)
4. Loop:
   ├─ Claude responde → text? → return
   └─ Claude responde → tool_use?
      ├─ Tool requires_confirmation? → pause + return pending
      └─ Execute → append tool_result → next iteration
5. Persiste tudo, loga custo, retorna
```

### Reuso explícito

- Padrão de auth/Zod/CORS de `content-creation-agent/index.ts`
- RPC `check_agent_interaction_limit`
- `_shared/anthropic-tools.ts` (STORY-019)
- `_shared/agent-skills.ts` (STORY-019)
- `_shared/agent-tools.ts` (STORY-019)
- `_shared/brand-learning.ts` (STORY-019)
- `_shared/log-ai-cost.ts`
- `agent_messages`, `agent_conversations`, `agent_tool_executions` (STORY-018)
- `learning_events` (STORY-017) via `log-learning-event` helper

## Out of scope

- Streaming (Fase 2)
- Frontend (STORY-022)
- Analyzer sofisticado de feedback inline (Fase 2 — Fase 1 usa heurística simples)
- Painel de métricas de tools (Fase 3)

## Riscos

| Risco | Mitigação |
|---|---|
| Loop excede 150s timeout do Edge Function | Limite duro de 8 iterações + 30s por tool — total max ~120s antes do timeout |
| Claude usa tool errada (alucinação) | Descriptions detalhadas no TOOL_REGISTRY + `requires_confirmation` em ações destrutivas |
| Custo dispara em conversas longas | `max_tokens=2000` por turno + auditoria diária `ai_usage_costs` + alerta se média/usuário > R$ 1/dia |
| Skill auto seleciona errado | `forced_skill_id` permite override manual via UI; logar acertos pra calibrar |
| `pending_confirmation` perde estado entre requests | Estado fica no histórico (`agent_messages`); próxima request precisa enviar `confirmed_tool_call` explicito — sem servidor stateful |

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
- [ ] CA1-CA15 validados
- [ ] Build sem erros, TypeScript strict
- [ ] Auth JWT + Zod
- [ ] Feature flag testada (on/off)
- [ ] `supabase functions deploy jimmy-orchestrator`
- [ ] Smoke tests passam (5 cenários do CA15)
- [ ] Custo logado corretamente
- [ ] Tool executions persistidas em `agent_tool_executions`

---

## Notas e Decisões

- **Por que sem streaming na Fase 1:** UX simples, evita complexidade de stream + tool use; ativar na Fase 2 quando padrões forem entendidos
- **Por que coexistir com `help-agent-chat`:** help-agent serve outro propósito (suporte ao produto), com prompt e contexto diferentes; substituir seria escopo extra desnecessário
- **`pending_confirmation` é stateless:** sem sessão server-side; toda info necessária pra retomar vem na próxima request
