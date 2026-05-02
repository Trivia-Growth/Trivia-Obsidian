---
id: STORY-019
titulo: "Helpers Compartilhados do Orquestrador HubChat"
fase: 3
modulo: jimmy-hubchat
status: pronto
prioridade: alta
origem: claude
agente_responsavel: ""
criado: 2026-05-02
atualizado: 2026-05-02
---

# STORY-019 — Helpers Compartilhados do Orquestrador HubChat

## Contexto

Antes de construir o `jimmy-orchestrator` (STORY-021), precisamos de 4 helpers reusáveis em `_shared/`:

1. **`anthropic-tools.ts`** — estende `anthropic.ts` (que só tem streaming texto) com `callClaudeWithTools()` que aceita array de tools no formato Anthropic e parseia `tool_use` no response. Via OpenRouter (consistência com resto do sistema).
2. **`agent-skills.ts`** — define as 2 skills do orquestrador (`analista_ads`, `analista_conteudo`) + função `selectSkill()` que infere intenção via Claude no primeiro turno.
3. **`agent-tools.ts`** — TOOL_REGISTRY mapeando `tool_name → {edge_function, params_transform, requires_confirmation}` + função `executeAgentTool()` que invoca, valida com Zod, captura duração e persiste em `agent_tool_executions`.
4. **`brand-learning.ts`** — `getBrandLearningContext(brandId, depth)` substitui gradualmente `getLeanBrandDNA` (mantém retrocompatibilidade), agregando brand DNA + top preferências + (Fase 2) exemplos.

Todos serão consumidos pelo orquestrador (STORY-021) e pelos sub-agentes (STORY-020). Sem essa story, as próximas não saem do papel.

## Spec de Referência

- Plano integrado: `~/.claude/plans/vamos-comecar-a-trabalhar-temporal-ullman.md` (seções 3.1, 4.2, 4.3)
- Helper existente a estender: `supabase/functions/_shared/anthropic.ts`
- Helper existente a substituir gradualmente: `supabase/functions/_shared/brand-dna-summary.ts` (`getLeanBrandDNA`)

## Critérios de Aceite

- [ ] CA1 — `_shared/anthropic-tools.ts` exporta `callClaudeWithTools(options: { model, system, messages, tools, temperature, maxTokens })` retornando `{ content, stopReason, toolUses, usage }`
- [ ] CA2 — `callClaudeWithTools` envia tools no formato Anthropic via OpenRouter (header `anthropic-beta` se necessário) e parseia `tool_use` blocks
- [ ] CA3 — `_shared/agent-skills.ts` exporta `SKILLS` (array tipado) com 2 skills: `analista_ads` e `analista_conteudo` (system_prompt template, tools[], temperature)
- [ ] CA4 — `_shared/agent-skills.ts` exporta `selectSkill(intent: string, ctx)` que faz 1 chamada Claude leve pra inferir skill ou retorna `null` (delegação direta)
- [ ] CA5 — `_shared/agent-tools.ts` exporta `TOOL_REGISTRY` com pelo menos 12 tools mapeadas (todas as listadas nas skills da STORY-021 + `delegar_estrategista_marca` e `delegar_gerador_conteudo`)
- [ ] CA6 — `_shared/agent-tools.ts` exporta `executeAgentTool(toolName, params, ctx)` que: valida Zod schema do tool, invoca edge function via `supabase.functions.invoke`, captura duração, persiste em `agent_tool_executions`, retorna resultado ou erro estruturado
- [ ] CA7 — Tools com `requires_confirmation: true` retornam `{ requires_confirmation: true, summary }` em vez de executar (orquestrador apresenta ao usuário antes de chamar de novo com flag `confirmed: true`)
- [ ] CA8 — `_shared/brand-learning.ts` exporta `getBrandLearningContext(supabase, brandId, options)` retornando `{ brandDna, preferences, positiveExamples, negativeExamples, contradictions }`
- [ ] CA9 — `getBrandLearningContext` reutiliza `getLeanBrandDNA` quando `depth='lean'` e busca completa quando `depth='full'`
- [ ] CA10 — Testes unitários: `callClaudeWithTools` com mock retornando `tool_use`; `executeAgentTool` validando Zod; `selectSkill` retornando skill correta pra intents conhecidas; `getBrandLearningContext` agregando dados corretamente
- [ ] CA11 — TypeScript strict, zero `any`

## Arquitetura

### `_shared/anthropic-tools.ts`

```typescript
import { DEFAULT_CLAUDE_MODEL, OPENROUTER_API_KEY, OPENROUTER_BASE_URL } from "./anthropic.ts";

export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: { type: "object"; properties: Record<string, unknown>; required?: string[] };
}

export interface ToolUseBlock {
  type: "tool_use";
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface CallClaudeWithToolsOptions {
  model?: string;
  system: string;
  messages: Array<{ role: "user" | "assistant"; content: string | Array<unknown> }>;
  tools: ToolDefinition[];
  temperature?: number;
  maxTokens?: number;
}

export interface CallClaudeWithToolsResult {
  content: Array<{ type: "text" | "tool_use"; text?: string } & Partial<ToolUseBlock>>;
  stopReason: "end_turn" | "tool_use" | "max_tokens";
  toolUses: ToolUseBlock[];
  usage: { input_tokens: number; output_tokens: number };
}

export async function callClaudeWithTools(opts: CallClaudeWithToolsOptions): Promise<CallClaudeWithToolsResult> {
  // POST OpenRouter no formato Anthropic (passthrough)
  // Parse tool_use blocks do response
  // Retorna estruturado
}
```

### `_shared/agent-skills.ts`

```typescript
export interface SkillDefinition {
  id: "analista_ads" | "analista_conteudo";
  name: string;
  description: string;
  systemPromptTemplate: string;  // {brand_dna}, {learning_context}, {date}
  tools: string[];               // tool_names do TOOL_REGISTRY
  temperature: number;
}

export const SKILLS: SkillDefinition[];

export function renderSystemPrompt(skill: SkillDefinition, ctx: { brandDna: string; learningContext: string; date: string }): string;

export async function selectSkill(intent: string, supabase, brandId): Promise<SkillDefinition | null>;
```

### `_shared/agent-tools.ts`

```typescript
import { z } from "npm:zod@3.23.8";

export interface ToolMapping {
  tool_name: string;
  edge_function: string;
  description: string;
  input_schema: ToolDefinition["input_schema"];
  zod_schema: z.ZodSchema;
  params_transform: (params: unknown) => Record<string, unknown>;
  requires_confirmation: boolean;
}

export const TOOL_REGISTRY: Record<string, ToolMapping>;

export interface ExecuteToolContext {
  supabaseAdmin: SupabaseClient;
  conversationId: string;
  messageId?: string;
  authHeader: string;
  confirmed?: boolean;
}

export async function executeAgentTool(
  toolName: string,
  params: unknown,
  ctx: ExecuteToolContext
): Promise<{ success: true; result: unknown } | { success: false; error: string } | { requires_confirmation: true; summary: string }>;
```

Exemplos de tools no TOOL_REGISTRY:
```typescript
"buscar_insights_meta": { edge_function: "meta-import-insights-incremental", requires_confirmation: false, ... },
"pausar_campanha_meta": { edge_function: "meta-manage-campaign", requires_confirmation: true, params_transform: (p) => ({ action: "pause_campaign", ...p }), ... },
"delegar_estrategista_marca": { edge_function: "estrategista-marca-agent", requires_confirmation: false, ... },
"delegar_gerador_conteudo": { edge_function: "gerador-conteudo-agent", requires_confirmation: true, ... },
"consultar_aprendizado_marca": { edge_function: null /* leitura direta */, requires_confirmation: false, ... },
```

### `_shared/brand-learning.ts`

```typescript
import { getLeanBrandDNA } from "./brand-dna-summary.ts";

export interface BrandLearningContext {
  brandDna: string;
  preferences: string;
  positiveExamples: string;
  negativeExamples: string;
  contradictions: string[];
}

export async function getBrandLearningContext(
  supabase: SupabaseClient,
  brandId: string,
  options: { depth?: "lean" | "full"; includeExamples?: boolean } = {}
): Promise<BrandLearningContext> {
  const depth = options.depth ?? "full";
  // 1. Carrega brand_context completo OU usa getLeanBrandDNA
  // 2. SELECT top 20 preferências por weight DESC, formata como bullets
  // 3. (Fase 2) SELECT brand_examples — Fase 1 retorna string vazia
  // 4. Detecta contradições (mesma category com prefs opostas)
  // 5. Retorna struct
}
```

### Reuso explícito

- `_shared/anthropic.ts` — `DEFAULT_CLAUDE_MODEL`, `OPENROUTER_BASE_URL`, padrão de fetch (não duplicar)
- `_shared/brand-dna-summary.ts` `getLeanBrandDNA` — chamado por `brand-learning.ts` em modo lean
- Tabela `brand_preferences` — leitura direta com `order by weight desc limit 20`
- Padrão de Zod schemas de outras edge functions (ex: `content-creation-agent`)

## Out of scope

- Edge function `jimmy-orchestrator` que consome esses helpers (STORY-021)
- Sub-agentes que também usam (STORY-020)
- `brand_examples` table (Fase 2)
- Streaming (Fase 2)

## Riscos

| Risco | Mitigação |
|---|---|
| OpenRouter não suporta tool use no formato Anthropic | Validar com chamada teste antes de implementar; fallback é usar formato OpenAI (`tool_calls`) e converter |
| TOOL_REGISTRY fica desatualizado quando novas edges são criadas | Documentar processo: toda nova edge function que vira tool entra no registry junto |
| `getBrandLearningContext` fica caro (muitas queries) | Cachear por brand_id + depth durante request lifecycle |
| `selectSkill` adiciona latência de 1-2s no primeiro turno | Tornar opcional — input pode forçar skill via `forced_skill_id` |

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
- [ ] CA1-CA11 validados
- [ ] Build sem erros, TypeScript strict, zero `any`
- [ ] Testes unitários cobrem cenários principais
- [ ] Helpers exportam tipos públicos corretamente
- [ ] `npm audit` sem Critical/High

---

## Notas e Decisões

- **Por que não migrar tudo de `getLeanBrandDNA` pra `getBrandLearningContext` agora:** retrocompatibilidade — outras edges (suggest-topics, generate-calendar, etc.) continuam usando o lean. Migração progressiva pra reduzir risco.
- **OpenRouter vs Anthropic SDK direto:** decisão arquitetural confirmada — manter OpenRouter por consistência. Validar suporte a tools antes de codar muito.
