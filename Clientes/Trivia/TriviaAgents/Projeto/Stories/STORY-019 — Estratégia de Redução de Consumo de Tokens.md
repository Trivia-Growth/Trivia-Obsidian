---
id: STORY-019
titulo: "Estratégia de Redução de Consumo de Tokens"
fase: 2
modulo: "agent-runner"
status: backlog
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-09
atualizado: 2026-06-09
---

# STORY-019 — Estratégia de Redução de Consumo de Tokens

## Contexto

O consumo de tokens está alto. O `agent-runner` atualmente carrega as últimas 20 mensagens do histórico a cada invocação, sem compressão ou priorização. Combinado com system prompts longos e modelo sem otimização por complexidade, o custo por conversa é elevado. Esta story implementa um conjunto de otimizações mantendo a qualidade das respostas.

## Critérios de Aceite

### CA1 — Redução do histórico de contexto
- Reduzir `limit(20)` para `limit(10)` no carregamento de mensagens do histórico
- Se a conversa tiver mais de 10 mensagens, incluir um bloco de resumo comprimido antes das últimas 10:
  ```
  [Resumo das mensagens anteriores: <texto gerado pelo LLM ou armazenado>]
  ```
- Implementação inicial: apenas truncar para 10 (sem resumo) — suficiente para maioria dos casos

### CA2 — Limite de tokens de resposta reduzido
- Reduzir `maxTokens` de `1024` para `600` no `callLLM` do agent-runner
- Manter `1024` apenas para conversas com especialistas (tool_use loop)

### CA3 — Seleção de modelo por complexidade
- Adicionar campo `model` configurável por agente (já existe na tabela)
- Garantir que o agente pode usar `claude-haiku-4-5-20251001` para atendimentos simples
- Default mantido como `claude-sonnet-4-6` para novos agentes
- Documentar no UI qual modelo está configurado (já visível na aba de configuração do agente)

### CA4 — Prompt caching explícito
- Verificar que todos os blocos de sistema têm `cache_control: { type: "ephemeral" }` no último bloco
- O `buildSystemPrompt` em `_shared/prompt-builder.ts` já deve marcar o último bloco — verificar e corrigir se necessário

### CA5 — Dashboard de custo no Relatórios
- Exibir custo acumulado do período nos KPIs de Overview (já implementado com `total_cost_brl`)
- Adicionar KPI de **custo médio por conversa** na seção de Overview

## Arquitetura

### Arquivos a modificar
- `supabase/functions/agent-runner/index.ts`
  - `.limit(20)` → `.limit(10)` no carregamento de histórico
  - `maxTokens: 1024` → `maxTokens: 600` (resposta inicial)
- `supabase/functions/_shared/prompt-builder.ts`
  - Verificar `cache_control` no último bloco do system prompt
- `src/features/reports/components/OverviewSection.tsx`
  - Adicionar card "Custo Médio/Conv"
- `supabase/functions/reports/index.ts`
  - Calcular `avg_cost_per_conv` no `getOverview`

### Estimativa de economia
| Mudança | Economia estimada |
|---------|------------------|
| Histórico 20→10 msgs | ~40% dos input tokens |
| maxTokens 1024→600 | ~40% dos output tokens |
| Cache hit no system prompt | ~70% dos input tokens nas msgs seguintes |
| Modelo haiku (opcional) | ~90% do custo total |

---

## Implementação

**Status:** `backlog`

**Branch/PR:**

**Notas:**
- Priorizar CA1 + CA2 + CA4 — impacto imediato sem mudança de UX
- CA3 requer decisão do produto sobre qual modelo usar por padrão
