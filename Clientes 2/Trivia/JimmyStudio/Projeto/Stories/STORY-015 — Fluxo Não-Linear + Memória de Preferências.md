---
id: STORY-015
titulo: "Fluxo Não-Linear + Memória de Preferências por Marca"
fase: 3
modulo: "agencia"
status: backlog
prioridade: média
origem: claude
agente_responsavel: "@dev"
criado: 2026-05-01
atualizado: 2026-05-01
---

# STORY-015 — Fluxo Não-Linear + Memória de Preferências por Marca

## Contexto

Após STORY-013 (polimento) e STORY-014 (streaming), o chat continua **rígido** em dois aspectos:

1. **Fluxo linear obrigatório** — mesmo se o usuário escreve "carrossel para Acme sobre produtividade" como primeira mensagem, ele é forçado a passar por: ask_brand → ask_format → collect_idea. Não dá pra pular etapas.
2. **Sem memória entre conversas** — `detectPreferences()` em `content-creation-agent/index.ts:125-155` já detecta padrões de tom/comprimento/emojis, mas as preferências **não são persistidas**. Cada conversa começa do zero, mesmo se o usuário já corrigiu Jimmy 5x para a mesma marca.

Esta story ataca os 2 últimos pontos de robotização do roadmap original. É a story de maior risco (migration nova, mudança em state shape, novo path no Edge Function) — feature flag obrigatória.

## Spec de Referência

- Plano roadmap em `/root/.claude/plans/radiant-brewing-hejlsberg.md` (seção STORY-015 — Esboço)
- `detectPreferences()` existente: `supabase/functions/content-creation-agent/index.ts:125-155`
- Pattern de RLS + FORCE: tabelas existentes (ex: `content_visual_plan`, `brands`)

## Critérios de Aceite

- [ ] CA1 — Intent detection no welcome: se a primeira mensagem do usuário (após ask_brand) tem brand match no DB + format match em config + topic substantivo, agente pula para `review_research` direto (gera pesquisa Perplexity em background)
- [ ] CA2 — Backtrack real: cada step ≥ `confirm_params` ganha botão "← Voltar" no chat. Step state vira stack (`stepStack: Step[]`) em vez de scalar; `pop()` ao voltar restaura UI do step anterior
- [ ] CA3 — Pergunta esclarecedora: se input em `collect_idea` for muito vago (heurística: <10 caracteres OU sem substantivo identificável), agente responde com pergunta antes de gerar pesquisa
- [ ] CA4 — Nova tabela `jimmy_brand_preferences` (`id uuid PK`, `brand_id uuid FK→brands(id)`, `category text`, `preference text`, `created_at timestamptz`, `updated_at timestamptz`) com RLS habilitado + FORCE
- [ ] CA5 — Policies: SELECT/INSERT/UPDATE permitidos para usuários da org dona da brand; DELETE só admin
- [ ] CA6 — `detectPreferences()` passa a fazer `INSERT ... ON CONFLICT (brand_id, category) DO UPDATE` no DB ao final de cada conversa
- [ ] CA7 — Próxima conversa para a mesma brand carrega preferências e injeta no system prompt (`<brand_preferences>` block): "Esta marca prefere tom informal, sem emojis, texto curto..."
- [ ] CA8 — Feature flag `JIMMY_NONLINEAR_FLOW` na Edge Function (env var) controla CA1+CA3 — se `false`, comportamento volta ao linear (rollback rápido)
- [ ] CA9 — E2E para os 4 caminhos: linear (sem brand match), atalho (intent completo), backtrack (clica voltar no review_research), input vago (recebe pergunta esclarecedora)
- [ ] CA10 — Migration `supabase db push` executada; `supabase functions deploy content-creation-agent` executado
- [ ] CA11 — TypeScript sem erros, build OK, todos os E2E verdes

## Restrições

- **Feature flag obrigatória** — fluxo não-linear pode ter regressões inesperadas; precisa ser desativável por env var sem redeploy de código (`Deno.env.get('JIMMY_NONLINEAR_FLOW') === 'true'`)
- Mudança em state shape (`step: Step` → `stepStack: Step[]`) requer migration de localStorage se houver persistência de conversa (verificar `loadHistoryConversation` em `useContentCreationAgent.ts:271+`)
- Memória de preferências é **opt-in implícito** — se o usuário corrigir uma preferência, registra. Não pedir consentimento explícito (UX de bot novamente). Mas adicionar botão "Esquecer preferências desta marca" em config futura (não nesta story).

---

## Implementação

**Status:** `backlog`

**Arquivos a criar:**
- `supabase/migrations/YYYYMMDDHHMMSS_create_jimmy_brand_preferences.sql`
  - Tabela `jimmy_brand_preferences` com schema CA4
  - `ALTER TABLE jimmy_brand_preferences ENABLE ROW LEVEL SECURITY;`
  - `ALTER TABLE jimmy_brand_preferences FORCE ROW LEVEL SECURITY;`
  - Policies SELECT/INSERT/UPDATE/DELETE conforme CA5
  - `CREATE UNIQUE INDEX ON jimmy_brand_preferences (brand_id, category);` para suportar `ON CONFLICT`
  - Trigger `updated_at` (reusar pattern existente)

- `supabase/functions/content-creation-agent/intent-detection.ts`
  - `detectIntent(message: string, brands: Brand[]): { brandId?, format?, topic? } | null`
  - Heurística simples: regex/fuzzy match em nomes de brand, lookup em config de formats, resto vira topic se >20 chars

- `src/features/content-creator-chat/components/BackButton.tsx`
  - Botão pequeno "← Voltar" alinhado com `pl-11` das mensagens da assistente

**Arquivos a modificar:**
- `supabase/functions/content-creation-agent/index.ts`
  - Wrap CA1+CA3 atrás de `if (Deno.env.get('JIMMY_NONLINEAR_FLOW') === 'true')`
  - Após `detectPreferences()`, persistir via Supabase Admin client (`supabase.from('jimmy_brand_preferences').upsert(...)`)
  - No início do request, carregar preferências da brand selecionada e injetar em `<brand_preferences>` block do system prompt
  - Detector de input vago (`isVagueInput(text: string): boolean`) para CA3

- `src/features/content-creator-chat/types/index.ts`
  - `step: Step` → `stepStack: Step[]` (ou manter `step` derivado como `stepStack[stepStack.length - 1]` para retrocompat)

- `src/features/content-creator-chat/hooks/useContentCreationAgent.ts`
  - Funções de transição (`selectBrand`, `selectFormat`, etc.) passam a fazer `push` no stack
  - Nova `goBack()` faz `pop` e remove a última mensagem da assistente
  - Migração de state se houver localStorage persistido

- `src/features/content-creator-chat/components/ContentCreationChat.tsx`
  - Renderizar `<BackButton onClick={agent.goBack}>` em steps ≥ `confirm_params`

**Arquivos de teste:**
- `tests/assistente-nonlinear.spec.ts` (novo) — 4 caminhos de CA9
- Atualizar `tests/assistente-golden-path.spec.ts` para tolerar tanto fluxo linear (default) quanto atalho (se flag ativada no ambiente de teste)

**Notas de implementação:**

(preenchido durante)

---

## QA

**Gate:** PENDING

**Checklist:**
- [ ] CA1-CA11 validados
- [ ] Build sem erros, TypeScript strict
- [ ] RLS + FORCE verificado na nova tabela (`SELECT * FROM jimmy_brand_preferences` sem auth deve retornar vazio)
- [ ] Policies por papel testadas (`agency` da org dona, `super_admin`, outro usuário)
- [ ] Zod no upsert da Edge Function (já existente, precisa estender o schema)
- [ ] `supabase db push` executado
- [ ] `supabase functions deploy content-creation-agent` executado
- [ ] `supabase secrets set JIMMY_NONLINEAR_FLOW=true` (ou false para rollback)
- [ ] E2E `assistente-golden-path.spec.ts` continua verde com flag `false`
- [ ] E2E `assistente-nonlinear.spec.ts` verde com flag `true`
- [ ] `npm audit` sem Critical/High
- [ ] Smoke manual: criar conteúdo, corrigir Jimmy ("mais informal"), abrir nova conversa para mesma marca, verificar que tom já vem ajustado

**Notas:**

---

## Notas e Decisões

- **Por que feature flag e não rollout gradual?** Sem ambiente de staging (CLAUDE.md), feature flag por env var é o único mecanismo seguro de rollback. `supabase secrets set JIMMY_NONLINEAR_FLOW=false` reverte sem redeploy.
- **Por que `stepStack` e não `previousStep`?** Backtrack pode encadear (voltar 2x). Stack é a estrutura natural; o overhead é mínimo.
- **Memória de preferências sem consentimento explícito:** UX preview > UX de bot. Quem quiser controle terá botão futuro em config da marca (fora do escopo).
- **Pré-requisito:** STORY-014 (streaming) estável em produção por ~1 semana antes de iniciar. Se streaming for adiada, esta story pode rodar antes — não há dependência técnica direta, só de capacidade de validação.
- **Rollback de migration:** caso precise reverter, criar `DROP TABLE jimmy_brand_preferences;` em nova migration. Não derruba dados em outras tabelas.
