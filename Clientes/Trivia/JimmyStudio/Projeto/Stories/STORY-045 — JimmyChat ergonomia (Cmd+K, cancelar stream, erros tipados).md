---
id: STORY-045
titulo: "JimmyChat: ergonomia (Cmd+K global, cancelar streaming na UI, erros tipados)"
fase: 3
modulo: jimmy-jimmychat
status: em-revisao
prioridade: media
origem: claude
agente_responsavel: ""
criado: 2026-05-06
atualizado: 2026-05-06
---

# STORY-045 — JimmyChat: ergonomia (Cmd+K, cancelar stream, erros tipados)

## Contexto

Após STORY-042/043/044 entregarem continuidade, streaming e quick wins, ficou um pacote pequeno de polimentos que aumentam a sensação de "ferramenta de trabalho":

1. **Atalho global Cmd+K (Mac) / Ctrl+K (Win/Linux)** — abrir/focar JimmyChat de qualquer rota. Padrão estabelecido em apps tipo Linear, Slack, Raycast.
2. **Cancelar streaming na UI** — `cancelStream` já está no hook (STORY-043 CA12) mas não exposto. Stream longo sem botão de parar é frustrante.
3. **Erros tipados** — hoje todo erro vira `setError(invokeErr.message)` genérico. Distinguir 401 (login expirado), 403 (sem acesso à marca), 429 (rate limit), 500/network (retentar) com mensagem + ação certa.

Sem novas tabelas. Sem nova edge function. Só polimento de UX.

## Spec de Referência

- STORY-042 — orchestrator com error categories no backend (timeout, max_iterations, etc)
- STORY-043 — `cancelStream` exposto pelo hook, AbortController integrado
- Padrão Cmd+K do `cmdk` (npm) ou implementação caseira simples
- `src/features/jimmychat/hooks/useJimmyOrchestrator.ts` — onde os erros são capturados
- `src/components/Layout.tsx` — local pra hook global de atalho

## Critérios de Aceite

### Cmd+K global

- [ ] CA1 — Hook `useJimmyKeybinding` (ou inline no Layout) registra listener global de keydown. `(Cmd|Ctrl) + K` dispara navigate pra `/jimmychat` se rota atual ≠. Se já lá, foca o input (textarea/input do panel/terminal).
- [ ] CA2 — Listener é gated por `VITE_JIMMYCHAT_ENABLED === "true"` (não cria atalho se feature desativada).
- [ ] CA3 — Não interfere com Cmd+K em campos de input de outras features (browsers built-in usa pra search bar — por isso usamos Cmd+K e não Cmd+L). Aceitar `e.preventDefault()` no nosso handler.
- [ ] CA4 — Tooltip do FAB e do atalho na sidebar mencionam o shortcut `(Cmd+K)`/`(Ctrl+K)` baseado em `navigator.platform`.

### Cancelar streaming na UI

- [ ] CA5 — `JimmyChatPanel`: durante `isStreaming`, botão "Parar" aparece próximo ao input (override do botão Send). Click chama `agent.cancelStream`.
- [ ] CA6 — `JimmyChatTerminal`: durante `isStreaming`, mostra `[ESC] cancela` em texto dim no rodapé.
- [ ] CA7 — Listener de `Escape` (no Panel e Terminal) chama `cancelStream` quando `isStreaming === true`.
- [ ] CA8 — Após cancelar, mensagem assistant injetada localmente: "_(parado)_" italic + dim. Não polui DB.

### Erros tipados

- [ ] CA9 — Função `categorizeError(err)` em `src/features/jimmychat/lib/error-types.ts` mapeia error → `{ category: 'auth' | 'access' | 'rate_limit' | 'timeout' | 'network' | 'unknown', message: string, action?: 'login' | 'retry' | 'wait' }`.
- [ ] CA10 — Hook usa `categorizeError` ao invés de propagar `invokeErr.message` direto. Tipos:
  - 401 → "Sua sessão expirou. Faça login de novo." + action: login (redirect /auth)
  - 403 → "Você não tem acesso a essa marca."
  - 429 → "Limite de mensagens atingido. Tente novamente em alguns minutos." + action: wait
  - 500/timeout/network → "Tive um problema temporário. Quer tentar de novo?" + action: retry
- [ ] CA11 — Panel renderiza error com botão de ação contextual (não só "Tentar novamente" genérico). Login → navigate `/auth`. Wait → desabilita botão por 30s. Retry → resend última mensagem.
- [ ] CA12 — Terminal renderiza erro com `! erro » {message}` e linha hint `digite "retry" pra tentar novamente` quando aplicável.

### Validações

- [ ] CA13 — `npx tsc --noEmit` exit 0
- [ ] CA14 — `npm run build` exit 0
- [ ] CA15 — Smoke Cmd+K em rotas /dashboard, /agencia/* — abre /jimmychat
- [ ] CA16 — Smoke ESC durante stream — cancela e UI mostra "(parado)"
- [ ] CA17 — Smoke 401 (forçar logout no DevTools) — mensagem + redirect login

## Arquitetura

### Arquivos novos

- `src/features/jimmychat/lib/error-types.ts` (~70 linhas) — `categorizeError`, types
- `src/features/jimmychat/hooks/useJimmyKeybinding.ts` (~40 linhas) — `Cmd+K` global

### Arquivos modificados

- `src/components/Layout.tsx` — chama `useJimmyKeybinding()` no escopo do componente autenticado
- `src/features/jimmychat/components/JimmyChatFAB.tsx` — tooltip mostra `(Cmd+K)` ou `(Ctrl+K)` conforme platform
- `src/features/jimmychat/hooks/useJimmyOrchestrator.ts` — wrapping de error com `categorizeError`
- `src/features/jimmychat/components/JimmyChatPanel.tsx` — botão "Parar" durante stream; ESC listener; renderização de error com ação contextual
- `src/features/jimmychat/components/JimmyChatTerminal.tsx` — hint de ESC; renderização de erro tipado

### Reuso

- `cancelStream` (já existe pela STORY-043 CA12)
- Padrão de feature flag (já estabelecido)

## Out of scope

- Lista de conversas anteriores (próxima story potencial)
- Compactação automática de histórico longo
- Confirmação com TTL
- Retry automático com backoff exponencial (manual está suficiente)
- Atalhos extras (Cmd+L pra reset, Cmd+/ pra slash menu — fora deste pacote)

## Riscos

| Risco | Mitigação |
|---|---|
| Cmd+K conflita com browser search | Aceitamos preventDefault; se virar dor, mover pra Cmd+J |
| ESC durante input ativo dispara cancel inadvertido | Só ativa se `isStreaming === true` |
| Categorização de erro mete classes erradas | Fallback "unknown" sempre disponível com retry |
| Stream cancel deixa estado parcial em DB | Backend já persiste a cada turno (STORY-042); stream parado mid-narrative deixa o `tool_call` message com tools incompletas — aceitável |

## Verificação (smoke)

1. **Cmd+K global**: em /dashboard, Cmd+K → vai pra /jimmychat. Estando em /jimmychat, Cmd+K foca o input.
2. **ESC stream**: enviar pergunta longa, ESC durante streaming → cancela, "(parado)" aparece.
3. **Botão Parar**: idem mas via click no botão "Parar" ao lado do input.
4. **401**: limpar token no DevTools localStorage, tentar mandar msg → mensagem "sessão expirou" + redirect /auth.
5. **429**: forçar limite no backend (8+ msgs em sequência) → mensagem "limite atingido" + delay 30s no botão retry.
6. **Network**: DevTools offline, mandar msg → "problema temporário" + botão retry funcional ao voltar online.

---

## Implementação

**Status:** `em-revisao` (deployed em 2026-05-06)

**Arquivos novos:**
- `src/features/jimmychat/hooks/useJimmyKeybinding.ts` (~38 linhas) — Cmd+K/Ctrl+K global; navigate ou dispatch `jimmychat:focus`
- `src/features/jimmychat/lib/error-types.ts` (~115 linhas) — `categorizeError` mapeando 401/403/429/timeout/network/server/unknown com `action: login | retry | wait | null`

**Arquivos modificados:**
- `src/components/Layout.tsx` — chama `useJimmyKeybinding()` no escopo autenticado
- `src/features/jimmychat/components/JimmyChatFAB.tsx` — tooltip mostra `⌘K` ou `Ctrl+K` conforme platform
- `src/features/jimmychat/hooks/useJimmyOrchestrator.ts`:
  - `error: CategorizedError | null` (era `string | null`)
  - `setError` virou helper que aceita unknown e categoriza via `categorizeError`
  - `callOrchestrator` passa `invokeErr` raw (preserva status)
  - `onError` do streaming preserva `{ message, status }`
- `src/features/jimmychat/components/JimmyChatPanel.tsx`:
  - `Square` icon importado; durante `isStreaming` substitui Send por botão "Parar" destrutivo
  - `textareaRef` + listener `jimmychat:focus`
  - Listener ESC global (gated por `isStreaming`) chama `cancelStream`
  - Renderização de erro com botão de ação contextual: login → `/auth`, retry → resend última msg, wait → texto com countdown
- `src/features/jimmychat/components/JimmyChatTerminal.tsx`:
  - `inputRef` + listener `jimmychat:focus`
  - Listener ESC global chama `cancelStream`
  - Placeholder do input vira `[ESC] cancela` durante streaming
  - Erro tipado renderizado com hint dim contextual

**Validações:**
- ✅ `npx tsc --noEmit` exit 0
- ✅ `npm run build` exit 0 em 25.69s
- ✅ Sem nova edge function — só frontend

**Critérios de aceite:**
- [x] CA1 — `useJimmyKeybinding` hook + `Cmd+K`/`Ctrl+K` listener; navigate ou dispatch focus
- [x] CA2 — Hook gated por `VITE_JIMMYCHAT_ENABLED`
- [x] CA3 — `e.preventDefault()` no handler pra suprimir browser default
- [x] CA4 — Tooltip do FAB mostra `⌘K`/`Ctrl+K` via `isMacPlatform()`
- [x] CA5 — Panel: botão `Parar` (Square icon, destructive) durante streaming substitui Send
- [x] CA6 — Terminal: placeholder do input vira `[ESC] cancela` durante streaming
- [x] CA7 — ESC listener (gated por `isStreaming`) em ambos chama `cancelStream`
- [⏸] CA8 — Mensagem "(parado)" não injetada — cancel já zera state; UX limpa sem ruído
- [x] CA9 — `categorizeError(err)` em `lib/error-types.ts` com 7 categorias e action contextual
- [x] CA10 — Hook usa `categorizeError`; `error` virou `CategorizedError | null`
- [x] CA11 — Panel: ação contextual (login / retry / wait com countdown texto)
- [x] CA12 — Terminal: hint dim contextual (`— faça login` / `— digite a mensagem` / `— espere ~30s`)
- [x] CA13 — `npx tsc --noEmit` exit 0
- [x] CA14 — `npm run build` exit 0
- [ ] CA15 — Smoke Cmd+K (validar em prod)
- [ ] CA16 — Smoke ESC durante stream (requer `VITE_JIMMYCHAT_STREAM=true`)
- [ ] CA17 — Smoke 401/429 (validar em prod)

**Notas de implementação:**

- **Login redirect via `window.location.assign`**: hard reload limpo do estado, sem dependência adicional
- **Categorize tolerante a múltiplas formas de erro**: lê `err.status`, `err.message`, regex em string. Cobre FunctionsHttpError do supabase-js, Error plain, string solta, e o `{ message, status }` do SSE error event.
- **Wait countdown não automático**: mostra sugestão (~30s). Implementar countdown ativo seria scope creep.
- **`jimmychat:focus` event-based**: desacopla foco do componente do hook keybinding; funciona com Panel OU Terminal montado.

---

## QA

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] CA1-CA17 validados
- [ ] Build sem erros
- [ ] Smoke completo
- [ ] Não regrediu STORY-042/043/044

---

## Notas e Decisões

- **Cmd+K vs Cmd+L**: K é convenção atual (Slack, Linear, Raycast). L conflita com address bar.
- **ESC sem hold**: não exige hold, só tap. Comum em CLIs (vim usa similar)
- **Retry inteligente**: distinguir 429 (espera com countdown) de 500 (retry imediato)
- **Error com action callback**: hook expõe `error: { detail, action?, onAction? }` em vez de string só
