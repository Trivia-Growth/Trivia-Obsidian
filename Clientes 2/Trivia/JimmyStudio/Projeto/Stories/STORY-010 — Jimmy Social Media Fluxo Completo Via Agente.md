---
id: STORY-010
titulo: "Jimmy Social Media: Fluxo Completo Via Agente"
fase: 3
modulo: "agencia"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-04-30
atualizado: 2026-04-30
---

# STORY-010 — Jimmy Social Media: Fluxo Completo Via Agente

## Contexto

A STORY-009 implementou o chat básico, mas o fluxo estava incompleto:
- Não havia histórico de conversas para o usuário
- O agente sugeria o formato em vez de perguntar antes
- Não havia etapa de pesquisa (Perplexity) com resumo + fontes antes de gerar
- O preview da copy aparecia na mesma página do chat em vez de página dedicada

O objetivo desta story é que **todo conteúdo seja criado diretamente pelo agente**, sem usar o fluxo manual de "Gerar Conteúdo". O agente conduz: seleção de marca → seleção de formato → pesquisa com fontes → copy → imagens → calendário.

## Spec de Referência

- `docs/stories/STORY-010.md` (repo)
- `plan mode` — plano detalhado gerado antes da implementação

## Critérios de Aceite

- [x] CA1 — Seleção de marca via BrandSelector (botões), com data-testid para testes
- [x] CA2 — Seleção de formato via FormatSelector (grade canais × formatos), com data-testid
- [x] CA3 — Após selecionar formato, textarea habilita imediatamente (sem chamar a edge function)
- [x] CA4 — Pesquisa Perplexity integrada: ResearchResultCard mostra summary + fontes
- [x] CA5 — "Confirmar e gerar" não chama a edge function — transição local para generating_copy
- [x] CA6 — Geração via useContentGeneration com researchSummary injetado no topicDescription
- [x] CA7 — Navegação automática para /agencia/conteudo/:contentId após geração
- [x] CA8 — Histórico de conversas visível no painel lateral (ConversationHistoryPanel)
- [x] CA9 — Teste E2E golden path passando end-to-end (2 passed, 49s)

## Restrições

- Não altera o fluxo existente de /agencia/gerar (fluxo manual paralelo)
- Reutiliza sem modificar: ContentPreview, ImageBriefForm, ImageGenerationPanel, useContentGeneration

---

## Implementação

**Status:** `em-progresso`

**Branch/PR:** main (commit direto)

**Arquivos criados:**
- `src/features/content-creator-chat/components/FormatSelector.tsx`
- `src/features/content-creator-chat/components/ResearchResultCard.tsx`
- `src/features/content-creator-chat/components/ConversationHistoryPanel.tsx`
- `tests/assistente-golden-path.spec.ts`

**Arquivos modificados:**
- `src/features/content-creator-chat/hooks/useContentCreationAgent.ts`
  - Removido `sendMessage` de `confirmResearch`, `confirmParams` e `selectFormat`
  - Tratamento de action `show_research` → ResearchResultCard
  - Tratamento de action `ask_format` → FormatSelector
- `src/features/content-creator-chat/components/ContentCreationChat.tsx`
  - Rendering de FormatSelector (step=ask_format)
  - Rendering de ResearchResultCard (step=review_research)
  - Adicionado `data-testid="content-creation-chat"` no root
  - Logs de diagnóstico no useEffect de geração
- `src/features/content-creator-chat/components/BrandSelector.tsx`
  - Adicionado `data-testid="brand-selector"` e `data-testid="brand-btn-{id}"`
- `src/features/content-creator-chat/components/FormatSelector.tsx`
  - Adicionado `data-testid="format-selector"` e `data-testid="format-btn-{channel}-{format}"`
- `src/hooks/useContentGeneration.ts`
  - Log de diagnóstico no início de generateContent
- `src/features/content-creator-chat/types/index.ts`
  - Tipos Step e ActionType expandidos (review_research, show_research, etc.)
  - ResearchResult adicionado ao ConversationState

---

## Bugs Encontrados e Corrigidos

### Bug 1 — confirmResearch chamava edge function
`confirmResearch()` chamava `sendMessage('Confirmado!', 'confirm_params')`, fazendo o Claude gerar o carrossel como texto na conversa em vez de disparar o fluxo de geração.
**Fix:** removido sendMessage, substituído por mensagem local + setState(step=generating_copy).

### Bug 2 — Locatores do E2E matchavam botões do painel de histórico
Botões do histórico apareciam antes do BrandSelector no DOM, fazendo `.first()` pegar o botão errado.
**Fix:** data-testid em BrandSelector e FormatSelector; teste usa locatores escopados.

### Bug 3 — selectFormat chamava edge function e recebia action='ask_format'
A edge function retornava `action.type='ask_format'` ao processar a seleção de formato, sobrescrevendo o step='collect_idea' e deixando a textarea permanentemente desabilitada.
**Fix:** removido sendMessage de selectFormat; mensagem local confirma a seleção e step vai direto para collect_idea.

---

## QA

**Gate:** PASS

**Checklist:**
- [x] TypeScript sem erros (npx tsc --noEmit)
- [x] Build OK
- [x] Todos os 9 STEPs do E2E passando (2 passed, 49s)
- [x] Edge Function content-creation-agent com Perplexity integrado (7 fontes recebidas)
- [x] Verificado em produção: jimmystudio.com.br/agencia/assistente
- [x] Conteúdo real criado no banco: 8209bb41-b52b-45c2-abc8-e36127c5ee79

**Notas:** A causa raiz dos bugs era que `selectBrand`, `selectFormat`, `confirmResearch` e `confirmParams` chamavam `sendMessage` (edge function), e as respostas assíncronas chegavam depois que o usuário já tinha avançado no fluxo, sobrescrevendo o estado. Solução: todas essas transições passaram a usar mensagens locais sem chamada à API.
