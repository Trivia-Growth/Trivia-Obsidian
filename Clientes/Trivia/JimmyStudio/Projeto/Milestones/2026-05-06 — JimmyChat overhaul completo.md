---
data: 2026-05-06
modulo: jimmy-jimmychat
tipo: milestone
fase: 3
---

# 2026-05-06 — JimmyChat overhaul completo (sessão única)

## Objetivo da sessão

Transformar o JimmyChat de "drawer com bugs de continuidade" em **workbench de marketing AI completo** com 7 stories shipadas e validadas em produção via E2E real consumindo tokens Anthropic.

## Stories entregues

| Story | Foco | Commit |
|---|---|---|
| [[STORY-042 — JimmyChat continuidade conversacional]] | Tool results não descartados em confirmação, narrativa intermediária preservada, history estruturado com tool_use blocks, max_tokens continuation, exits visíveis, cancel/pending contextuais | `3a5672d2` |
| [[STORY-043 — JimmyChat streaming SSE e tool progress]] | callClaudeWithToolsStream, runJimmyStream, sse-client, render incremental Panel+Terminal, `VITE_JIMMYCHAT_STREAM` flag | `3a49c53d` |
| [[STORY-044 — JimmyChat quick wins de UX e custo]] | Hidratar histórico no F5, react-markdown, prompt caching Anthropic (gated), auto-scroll inteligente, persist forcedSkill | `2dada1dc` |
| [[STORY-045 — JimmyChat ergonomia (Cmd+K, cancelar stream, erros tipados)]] | Atalho Cmd+K global, botão Parar/ESC durante streaming, categorizeError com 7 categorias e action contextual | `7b7e1331` |
| [[STORY-046 — JimmyChat lista de conversas multi-conv]] | useJimmyConversations, ConversationSwitcher (Popover), switchConversation, multi-conv per brand | `d36643e6` |
| [[STORY-047 — JimmyChat rename + archive + bug refresh stream]] | Rename inline via localStorage, archive via UPDATE status='closed', hover-actions com Pencil/Archive | `5ea9086d` |
| [[STORY-048 — JimmyChat search nas conversas]] | Input de busca local + filter case-insensitive em title/preview, empty state, foco automático | `84e51350` |

Todas em status `em-revisao` (deployed em prod, smoke pós-deploy pendente em alguns CAs).

## Bug crítico de produção encontrado e corrigido

**Sintoma:** Switcher de conversas mostrava "Nenhuma conversa ainda" mesmo havendo conv com `status='open'` no DB.

**Causa-raiz:** `useJimmyConversations` selecionava `created_at` em `agent_conversations`, mas o schema (STORY-021) usa `started_at`. Query falhava com Postgres error `42703 — column does not exist`. Erro só aparecia em `console.warn`, invisível em uso normal. Bug existia desde STORY-046.

**Como foi pego:** Suite E2E real instrumentou `console.log` via `page.on('console')` e capturou o warn que ninguém via.

**Fix:** Trocar `created_at` por `started_at` em select + RawConvRow + uso. Commit `a28b9440`.

**Lição:** Erros silenciosos em `console.warn` precisam de monitoramento ou fallback visual. Considerar adicionar Sentry ou similar pra capturar warnings em prod.

## Suite E2E real

`tests/jimmychat-e2e.spec.ts` — 8/8 verde contra `https://jimmystudio.com.br` com user de teste autenticado.

Cobre:
- Mensagem simples (sem tool)
- Pergunta com tool (consultar_marca real, retornou dados de marca real)
- Criar nova conversa via switcher
- Listar conversas (validou 19 convs após fix)
- Search local + empty state
- Toggle modo terminal
- Atalho Cmd+K global

Consumiu tokens Anthropic via OpenRouter intencionalmente para validar integração ponta-a-ponta.

## Estado da feature em prod

✅ **Funcional:**
- Continuidade conversacional (promete e cumpre, F5 retoma)
- Multi-conv per brand com rename/archive/search
- Modo terminal CLI
- Atalho Cmd+K, ESC pra cancelar streaming
- Erros tipados com ação contextual
- Markdown renderizado em respostas finais

⏸️ **Gated por feature flag (default off em prod):**
- `VITE_JIMMYCHAT_STREAM=true` — streaming SSE token-by-token
- `JIMMY_PROMPT_CACHE_ENABLED=true` — prompt caching Anthropic (~70% economia em turnos seguidos)

⏸️ **Pendente:**
- Migration `20260506180352_agent_messages_narrative_type.sql` — adiciona `'narrative'` ao constraint. Não-bloqueante: orchestrator usa `'tool_call'` como veículo de narrativas.

## Próximas direções possíveis

1. **Export conversa** (markdown/PDF) — share insights com cliente/time
2. **Ativar streaming + prompt caching em prod** + smoke
3. **Tests automatizados unit** dos hooks (vitest)
4. **Outras frentes**: Heziom fluxo de caixa, monthly-report, C Brasil Contabilidade

## Referências

- Repo: `Triviastudio/triviadash-analytics` branch `main` (commits `3a5672d2..a28b9440`)
- E2E: `tests/jimmychat-e2e.spec.ts`
- Doc consolidado no repo: `docs/jimmychat-overhaul-2026-05-06.md`
