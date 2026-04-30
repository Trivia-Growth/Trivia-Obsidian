---
id: STORY-009
titulo: "Assistente Conversacional de Criação de Conteúdo (Jimmy Social Media)"
fase: 3
modulo: "agencia"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-04-30
atualizado: 2026-04-30
---

# STORY-009 — Assistente Conversacional de Criação de Conteúdo

## Contexto

O fluxo atual exige formulários com múltiplos campos para gerar conteúdo. Esta story cria um caminho paralelo conversacional: o usuário fala com "Jimmy Social Media" (agente IA especialista) que conduz o fluxo inteiro — entende a ideia, gera a copy e aprende preferências da marca — tudo em uma conversa. O resultado é um conteúdo criado no mesmo fluxo normal do calendário.

## Spec de Referência

- `architecture.md` — ADR-010
- `PROJECT_REQUIREMENTS.md` — módulo Agência / Assistente Conversacional
- `docs/stories/STORY-009.md` (repo)

## Critérios de Aceite

- [x] CA1 — Página `/agencia/assistente` acessível e protegida por ProtectedRoute + AgencyRoute
- [x] CA2 — Jimmy Social Media pergunta a marca no início e carrega brand DNA
- [x] CA3 — Usuário descreve a ideia em linguagem natural e o agente extrai parâmetros (channel, format, style, topic)
- [x] CA4 — Usuário aprova parâmetros via card de confirmação (ParamsConfirmCard)
- [x] CA5 — Conteúdo gerado via `useContentGeneration` aparece em `ContentPreview`
- [x] CA6 — Preferências detectadas na conversa são salvas em `brand_preferences` (tone, emoji, length)
- [x] CA7 — Histórico da conversa persistido em `agent_conversations` + `agent_messages`
- [x] CA8 — Loading skeleton durante geração, error state com retry
- [x] CA9 — `npm test` passando com 10 novos testes do schema Zod da Edge Function (97 total)
- [x] CA10 — Edge Function deployada: `supabase functions deploy content-creation-agent`

## Restrições

- Caminho paralelo — não altera o fluxo existente de GerarConteudo
- Nenhum arquivo legacy modificado além de `App.tsx` e docs

---

## Implementação

**Status:** `concluido`

**Branch/PR:** main (commit direto)

**Arquivos criados:**
- `src/features/content-creator-chat/types/index.ts`
- `src/features/content-creator-chat/api/useConversation.ts`
- `src/features/content-creator-chat/hooks/useContentCreationAgent.ts`
- `src/features/content-creator-chat/components/ContentCreationChat.tsx`
- `src/features/content-creator-chat/components/BrandSelector.tsx`
- `src/features/content-creator-chat/components/ParamsConfirmCard.tsx`
- `src/features/content-creator-chat/components/ContentCreatorErrorBoundary.tsx`
- `src/features/content-creator-chat/index.ts`
- `src/pages/agencia/AssistenteConteudo.tsx`
- `supabase/functions/content-creation-agent/index.ts`
- `src/test/schemas/content-creation-agent.test.ts`
- `.aiox-core/development/agents/content-creator/content-creator.md`
- `tests/assistente.spec.ts`
- `docs/stories/STORY-009.md`

**Arquivos modificados:**
- `src/App.tsx` — rota lazy `/agencia/assistente`
- `playwright.config.ts` — testMatch para assistente.spec.ts
- `architecture.md` — ADR-010
- `PROJECT_REQUIREMENTS.md` — módulo Assistente
- `docs/TESTING.md` — contagem atualizada (97 testes + 9 E2E)

---

## QA

**Gate:** PASS

**Checklist:**
- [x] CAs validados (todos 10 marcados)
- [x] Build OK, TypeScript sem erros
- [x] npm test passando — 97 testes (10 novos de schema)
- [x] Edge Function deployada (`content-creation-agent`)
- [x] Rota lazy-loaded com `lazyWithRetry()`
- [x] Error Boundary presente (`ContentCreatorErrorBoundary`)
- [x] 9/9 testes E2E passando (incluindo 3 novos de `/agencia/assistente`)
- [x] Produção verificada em `https://jimmystudio.com.br/agencia/assistente`

**Notas:** Concluído em 2026-04-30. Durante implementação, o `replace_all` do rename Luna→Jimmy Social Media gerou nome de função inválido (`buildJimmy Social MediaPrompt`). Corrigido renomeando para `buildAgentPrompt`. E2E falhou inicialmente por commits não enviados ao GitHub — corrigido com `git push origin main` e verificado após deploy Netlify (~3 min).
