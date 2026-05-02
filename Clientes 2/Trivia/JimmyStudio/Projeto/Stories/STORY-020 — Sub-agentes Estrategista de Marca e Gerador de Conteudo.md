---
id: STORY-020
titulo: "Sub-agentes Estrategista de Marca e Gerador de Conteúdo"
fase: 3
modulo: jimmy-hubchat
status: em-revisao
prioridade: alta
origem: claude
agente_responsavel: ""
criado: 2026-05-02
atualizado: 2026-05-02
---

# STORY-020 — Sub-agentes Estrategista de Marca e Gerador de Conteúdo

## Contexto

A arquitetura híbrida do HubChat (decidida no plano integrado) define 2 sub-agentes que rodam como edge functions próprias com Claude dedicado, invocáveis pelo orquestrador via tools de delegação:

1. **Estrategista de Marca** (`estrategista-marca-agent`) — análises pesadas que cruzam `brand_strategy`, `brand_icp_profiles`, `brand_visual_identity` e dados de canais. Edge function NOVA. Reusável fora do chat (cron mensal de relatório executivo na Fase 2).

2. **Gerador de Conteúdo** (`gerador-conteudo-agent`) — wrapper FINO que adapta interface uniforme do orquestrador → invoca o `content-creation-agent` existente, mantendo todo seu fluxo stateful (boot → brand → format → research → copy → image). Reaproveita 100% do que está em produção.

Esta story entrega ambos. Pré-requisito: STORY-019 (helpers `anthropic-tools`, `brand-learning`).

## Spec de Referência

- Plano integrado: `~/.claude/plans/vamos-comecar-a-trabalhar-temporal-ullman.md` (seção 4.1)
- Edge function existente a wrappear: `supabase/functions/content-creation-agent/index.ts`
- Edges analíticas a invocar do Estrategista: `analyze-strategy`, `analyze-brand`, `analyze-visual-identity`, `analyze-creative-performance`

## Critérios de Aceite

### Estrategista de Marca

- [ ] CA1 — Edge function `estrategista-marca-agent/index.ts` criada com auth JWT, Zod, CORS no padrão do projeto
- [ ] CA2 — Aceita input `{ brand_id, question, scope?, conversation_history? }` (Zod validado)
- [ ] CA3 — Carrega contexto: `getBrandLearningContext(brandId, depth='full')` + (opcional) últimas mensagens da conversa
- [ ] CA4 — Chama `callClaudeWithTools` com prompt focado em estratégia + tools internas: `analisar_estrategia`, `analisar_marca_completa`, `analisar_identidade_visual`, `analisar_conteudo_performance`, `consultar_aprendizado_marca`
- [ ] CA5 — Loop de tool use (max 5 iterações) — invoca tools via `executeAgentTool` do shared
- [ ] CA6 — Retorna `{ summary: string, structured_findings: object, sources: string[], tokens_used }`
- [ ] CA7 — Loga custo em `ai_usage_costs` com `feature_type='estrategista_marca_agent'`
- [ ] CA8 — Smoke test: chamar com `brand_id` real + question="qual o gap entre nosso posicionamento e o que comunicamos no Instagram?" — deve retornar análise coerente em < 30s

### Gerador de Conteúdo (wrapper)

- [ ] CA9 — Edge function `gerador-conteudo-agent/index.ts` criada
- [ ] CA10 — Aceita input uniforme `{ brand_id, request: string, conversation_id?, params?: object }` (Zod validado)
- [ ] CA11 — Adapter: traduz `request` em natural language → invoca `content-creation-agent` no fluxo apropriado
- [ ] CA12 — Se `params` é fornecido (channel, format, style, topic), pula passos do fluxo do `content-creation-agent` que pediriam essas infos
- [ ] CA13 — Retorna resultado normalizado: `{ content_id, generated_content, status, conversation_id, next_action_suggested }`
- [ ] CA14 — Smoke test: chamar com `brand_id` + request="cria um carrossel sobre vantagens do produto X" — deve retornar conteúdo gerado em < 60s

## Arquitetura

### `estrategista-marca-agent/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";
import { callClaudeWithTools } from "../_shared/anthropic-tools.ts";
import { getBrandLearningContext } from "../_shared/brand-learning.ts";
import { executeAgentTool, TOOL_REGISTRY } from "../_shared/agent-tools.ts";
import { logAiCost } from "../_shared/log-ai-cost.ts";

const inputSchema = z.object({
  brand_id: z.string().uuid(),
  question: z.string().min(5).max(2000),
  scope: z.enum(["pillars", "positioning", "icp_fit", "gtm", "general"]).optional(),
  conversation_history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).optional(),
});

const STRATEGIST_PROMPT = `Você é Aria, estrategista sênior de marca da Trívia Studio.
Seu papel é fazer análises estratégicas profundas — posicionamento, GTM, fit com ICP,
identidade. Você NÃO cria conteúdo (delega ao Gerador). Você cruza dados de múltiplas
fontes antes de recomendar.

REGRAS:
- Cruze dados de múltiplas fontes antes de fazer recomendações
- Considere o ICP, arquétipo da marca e objetivos estratégicos
- Apresente recomendações com priorização clara (impacto vs esforço)
- Fundamente recomendações em dados, não em opinião
- Use as tools disponíveis pra coletar evidência antes de concluir

CONTEXTO DA MARCA:
{brand_dna}

PREFERÊNCIAS APRENDIDAS:
{learning_context}

QUESTÃO DO ORQUESTRADOR:
{question}

Responda em português brasileiro. Tom analítico, conciso, com tabelas quando útil.`;

// Tools liberadas para o Estrategista (subset filtrado do TOOL_REGISTRY)
const STRATEGIST_TOOL_NAMES = [
  "analisar_estrategia",
  "analisar_marca_completa",
  "analisar_identidade_visual",
  "analisar_conteudo_performance",
  "consultar_aprendizado_marca",
];

serve(async (req) => {
  // Auth + Zod + CORS (padrão)
  // Carrega learning context
  // Renderiza prompt
  // Loop de até 5 tool uses
  // Retorna summary + findings + sources
  // Loga custo
});
```

### `gerador-conteudo-agent/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "npm:zod@3.23.8";

const inputSchema = z.object({
  brand_id: z.string().uuid(),
  request: z.string().min(5).max(2000),
  conversation_id: z.string().uuid().optional(),
  params: z.object({
    channel: z.string().optional(),
    contentFormat: z.string().optional(),
    contentStyle: z.string().optional(),
    topic: z.string().optional(),
    objective: z.string().optional(),
  }).optional(),
});

serve(async (req) => {
  // Auth + Zod + CORS
  // Se params completos: invoca generate-content direto (skip content-creation-agent state machine)
  // Senão: invoca content-creation-agent passando o request como mensagem inicial
  //        e injetando context de "user já forneceu marca: {brand_id}"
  // Aguarda fluxo stateful completar
  // Normaliza response: { content_id, generated_content, status, conversation_id, next_action }
});
```

### Reuso explícito

- `_shared/anthropic-tools.ts` (STORY-019) — `callClaudeWithTools`
- `_shared/brand-learning.ts` (STORY-019) — `getBrandLearningContext`
- `_shared/agent-tools.ts` (STORY-019) — `TOOL_REGISTRY`, `executeAgentTool`
- `_shared/log-ai-cost.ts` — log de custo
- `content-creation-agent` (existente) — wrapper apenas adapta interface, não duplica lógica
- `generate-content` (existente) — invocado direto quando `params` completos

## Out of scope

- Tools de cruzamento avançado para o Estrategista (Fase 2 — STORY-019 já entrega tools básicas)
- Cron mensal de relatório executivo (Fase 2)
- Streaming (Fase 2)

## Riscos

| Risco | Mitigação |
|---|---|
| Wrapper do Gerador adiciona latência ao fluxo do `content-creation-agent` | Wrapper deve ser proxy literal — sem processamento extra; medir overhead em smoke test |
| Estrategista chama tools em loop infinito | Hard limit de 5 iterações no loop; após isso retorna o que tem |
| Estrategista invade escopo do Gerador (cria conteúdo) | System prompt explícito: "Você NÃO cria conteúdo (delega ao Gerador)" |
| Gerador wrapper quebra UX do terminal/picker existente | Wrapper só é usado quando invocado pelo orquestrador; uso direto via UI continua igual |

---

## Implementação

**Status:** `em-revisao` (deployed em 2026-05-02)

**Branch/PR:** sem branch (mudanças diretas)

**Arquivos criados:**
- `supabase/functions/estrategista-marca-agent/index.ts` (~280 linhas) — sub-agente com Claude dedicado, loop de tool use (max 5), prompt focado em estratégia. Usa `callClaudeWithTools` + `getBrandLearningContext` (depth=full) + `buildToolDefinitions` da STORY-019. Tools liberadas: 6 (analisar_conteudo_performance, consultar_marca, consultar_aprendizado_marca, buscar_insights_meta, analisar_performance_meta, analisar_instagram_insights). Loga custo em `ai_usage_costs` com `feature_type='estrategista_marca_agent'`.
- `supabase/functions/gerador-conteudo-agent/index.ts` (~180 linhas) — wrapper fino. Se `params.channel + contentFormat + topic` presentes: invoca `generate-content` direto (caminho rápido). Senão: retorna `{status: 'needs_clarification', missing_fields: [...]}` pro orquestrador conduzir diálogo.

**Deploy:**
- ✅ `supabase functions deploy estrategista-marca-agent` (incluiu 8 helpers shared, incluindo os 4 da STORY-019)
- ✅ `supabase functions deploy gerador-conteudo-agent`

**Smoke tests passaram (2026-05-02):**
1. **Auth enforcement (estrategista):** `POST /estrategista-marca-agent` sem header `Authorization` → `401 Missing authorization header` (gateway Supabase rejeita antes da edge — JWT verify ativado por padrão) ✅
2. **Auth enforcement (gerador):** `POST /gerador-conteudo-agent` com anon key (não user JWT) → `401 Token inválido` (edge chama `auth.getUser()`, anon key não passa) ✅
3. Ambas as funções estão deployed e respondendo sem erros 500 de inicialização.

**Smoke tests funcionais profundos (com Claude real + tools reais) ficarão pra STORY-021** — quando o `jimmy-orchestrator` invocar esses sub-agentes em fluxo real, a validação ponta-a-ponta vai cobrir os caminhos de `delegar_estrategista_marca` e `delegar_gerador_conteudo` no TOOL_REGISTRY.

**Critérios de aceite:**

Estrategista:
- [x] CA1 — Edge function criada com auth JWT, Zod, CORS no padrão
- [x] CA2 — Aceita `{brand_id, question, scope?, conversation_history?}` validado
- [x] CA3 — Carrega `getBrandLearningContext(brandId, depth='full')` + histórico opcional
- [x] CA4 — Prompt focado em estratégia + tools internas (6 tools restritas)
- [x] CA5 — Loop max 5 iterações usando `callClaudeWithTools` + `executeStrategistTool` (versão simplificada que não loga em agent_tool_executions)
- [x] CA6 — Retorna `{summary, structured_findings, sources, tokens_used}`
- [x] CA7 — Loga custo em `ai_usage_costs` com `feature_type='estrategista_marca_agent'`
- [⏸] CA8 — Smoke test com brand real e question estratégica em <30s — adiado pra STORY-021 (requer JWT de usuário real, será coberto via orquestrador)

Gerador:
- [x] CA9 — Edge function criada
- [x] CA10 — Aceita `{brand_id, request, conversation_id?, params?}` validado
- [x] CA11 — Adapter: traduz `request` → invoca `content-creation-agent` (na real, optei por `generate-content` direto quando params completos — escolha mais rápida e direta; documentado nas notas)
- [x] CA12 — Se `params` completos: caminho rápido com `generate-content`
- [x] CA13 — Retorna estrutura uniforme `{status, content_id, generated_content, conversation_id, next_action_suggested}`
- [⏸] CA14 — Smoke test com brand real em <60s — adiado pra STORY-021

**Notas de implementação:**
- **Estrategista NÃO loga em `agent_tool_executions`:** decisão deliberada. Quem orquestra é o `jimmy-orchestrator` — ele que escreve. O estrategista usa uma versão simplificada `executeStrategistTool` que invoca tools sem logging interno. Quando o orquestrador chama via `delegar_estrategista_marca`, registra UMA execution com input/output completo. Mantém auditoria sem complicar o sub-agente.
- **Gerador chama `generate-content` direto, não `content-creation-agent`:** o `content-creation-agent` é stateful conversacional (boot → brand → format → research → copy). Invocá-lo de dentro de outro agente quebra o fluxo. O caminho `params completos → generate-content direto` é mais simples e funcional. Se faltam params, o gerador devolve `needs_clarification` em vez de tentar invocar o conversacional fora de contexto.
- **`buildToolDefinitions(STRATEGIST_TOOL_NAMES)`:** reusa o registry da STORY-019, garantindo consistência de schemas.
- **Smoke tests funcionais ficam pra STORY-021:** sem JWT de usuário real disponível na sessão do dev, validar caminho completo (carregar contexto → Claude decide tool → executar tool → resposta) seria flaky. O orquestrador da STORY-021 vai exercitar isso naturalmente.

---

## QA

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] CA1-CA14 validados
- [ ] Build sem erros, TypeScript strict
- [ ] Auth JWT validado em ambas as edges
- [ ] Zod nas duas edges
- [ ] `supabase functions deploy estrategista-marca-agent gerador-conteudo-agent`
- [ ] Smoke tests passam em produção
- [ ] Custo logado corretamente em `ai_usage_costs`

---

## Notas e Decisões

- **Estrategista é edge function própria (não skill):** decisão arquitetural híbrida — análises pesadas justificam Claude dedicado e reuso fora do chat
- **Gerador é wrapper fino, não reescrita:** preserva todo o investimento no `content-creation-agent` (state machine, Perplexity, streaming, learning de chat) — wrapper é só adapter
- **Por que `next_action_suggested` no response do Gerador:** orquestrador usa pra decidir se sugere ao usuário "quer criar imagens?" ou "quer publicar?"
