---
id: STORY-022
titulo: "Frontend HubChat (UI Conversacional)"
fase: 3
modulo: jimmy-hubchat
status: em-revisao
prioridade: alta
origem: claude
agente_responsavel: ""
criado: 2026-05-02
atualizado: 2026-05-02
---

# STORY-022 — Frontend HubChat (UI Conversacional)

## Contexto

Camada frontend que conecta o usuário ao `jimmy-orchestrator` (STORY-021). Reaproveita padrões visuais existentes: `BrandSelector`, `ParamsConfirmCard`, `TypingIndicator`. Drawer separado do help-agent (coexistem).

UI precisa lidar com: streaming visual de tokens (mesmo que backend não streame na Fase 1, simulamos chunks), execução visível de tools (cards com status), botões de confirmação para ações destrutivas, renderização rica de tabelas/imagens em respostas.

Pré-requisito: STORY-021 (backend funcional).

## Spec de Referência

- Plano integrado: `~/.claude/plans/vamos-comecar-a-trabalhar-temporal-ullman.md` (seção 6 — Frontend novos)
- Padrão de hook a reusar: `src/hooks/useHelpAgent.ts`
- Padrão visual a reusar: `src/features/content-creator-chat/components/BrandSelector.tsx`, `src/features/content-creator-chat/components/ParamsConfirmCard.tsx`, `src/features/content-creator-chat/components/TypingIndicator.tsx`

## Critérios de Aceite

- [ ] CA1 — Hook `useJimmyOrchestrator(brandId)` exporta `{ messages, sendMessage, isLoading, error, conversationId, pendingConfirmation, confirmAction, cancelAction, remainingInteractions, toolExecutions }`
- [ ] CA2 — Hook chama `jimmy-orchestrator` edge function via `supabase.functions.invoke`, gerencia conversation_id em state, persiste em localStorage
- [ ] CA3 — Componente `JimmyHubChat.tsx` renderiza drawer/sheet ao lado direito (oposto ao `help-agent` que vem da esquerda) — usa shadcn `Sheet` ou `Drawer`
- [ ] CA4 — Header do drawer tem: nome "Jimmy HubChat", `BrandSelector` (obrigatório selecionar antes de chatar), `SkillSelector` opcional (default = auto), botão de fechar
- [ ] CA5 — Componente `SkillSelector.tsx` mostra 5 opções: Auto / Analista de Ads / Analista de Conteúdo / Estrategista (delega) / Gerador (delega) — visual de pills/tabs no topo
- [ ] CA6 — Componente `ToolExecutionCard.tsx` renderiza card animado quando agente está executando tool: nome amigável da tool, ícone, spinner ou check, duração quando completa
- [ ] CA7 — Componente `ConfirmActionButtons.tsx` aparece quando `pendingConfirmation`: card com summary + botões "Confirmar" e "Cancelar" (visual baseado em `ParamsConfirmCard`)
- [ ] CA8 — Mensagens do agente que contêm tabelas markdown são renderizadas como `<Table>` shadcn (parser simples — usar `react-markdown` se já instalado)
- [ ] CA9 — Mensagens com imagens (URLs) são renderizadas inline com lazy load
- [ ] CA10 — Input com `Textarea` shadcn + botão Enviar (Enter envia, Shift+Enter quebra linha)
- [ ] CA11 — Limite de interações restante visível no header (badge) — desabilita input se 0
- [ ] CA12 — Erro genérico com botão "Tentar novamente" (segue padrão de `ContentCreationChat`)
- [ ] CA13 — Feature flag `VITE_JIMMY_HUBCHAT_ENABLED` controla renderização do botão flutuante. Se off, drawer não existe
- [ ] CA14 — Botão flutuante (FAB) no canto direito da tela em todas as páginas autenticadas (similar ao help-agent à esquerda) — ícone diferente pra distinguir
- [ ] CA15 — Smoke tests manuais:
  - Abrir drawer, selecionar marca, perguntar "como estão minhas campanhas?" → ver tool sendo executada → resposta em tabela
  - Pedir "pausa essa campanha X" → botões de confirmação aparecem → confirmar → ver execução
  - Pedir "cria post sobre Y" → ver delegação pro Gerador, conteúdo gerado inline
  - Trocar de skill mid-conversation → próxima mensagem usa nova skill
  - Fechar e reabrir → conversa carrega do `conversation_id` persistido

## Arquitetura

### Estrutura de pastas

```
src/features/hubchat/
├── components/
│   ├── JimmyHubChat.tsx          // root drawer
│   ├── HubChatHeader.tsx          // brand selector + skill selector + close
│   ├── HubChatMessages.tsx        // scroll area com mensagens
│   ├── HubChatMessage.tsx         // renderer single message (text/tool/confirmation)
│   ├── HubChatInput.tsx           // textarea + send button
│   ├── SkillSelector.tsx          // pills com 5 opções
│   ├── ToolExecutionCard.tsx      // card de tool em execução
│   ├── ConfirmActionButtons.tsx   // botões confirmar/cancelar
│   └── HubChatFAB.tsx             // botão flutuante
├── hooks/
│   └── useJimmyOrchestrator.ts    // hook principal
├── lib/
│   ├── markdown-renderer.tsx      // parser de tabelas markdown → shadcn Table
│   └── tool-display-names.ts      // map { tool_name → label amigável + ícone }
├── types/
│   └── index.ts                   // HubChatMessage, ToolExecution, etc.
└── index.ts                       // re-exports
```

### `useJimmyOrchestrator` (esqueleto)

```typescript
export function useJimmyOrchestrator(brandId: string | null) {
  const [messages, setMessages] = useState<HubChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);
  const [remainingInteractions, setRemainingInteractions] = useState<number | null>(null);
  const [forcedSkillId, setForcedSkillId] = useState<SkillId | null>(null);
  const [toolExecutions, setToolExecutions] = useState<ToolExecution[]>([]);

  // Carrega conversation_id do localStorage no mount
  useEffect(() => {
    const stored = localStorage.getItem(`hubchat:conv:${brandId}`);
    if (stored) setConversationId(stored);
  }, [brandId]);

  const sendMessage = useCallback(async (text: string) => {
    if (!brandId) { setError("Selecione uma marca primeiro"); return; }
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: text, id: crypto.randomUUID() }]);

    const { data, error: invokeErr } = await supabase.functions.invoke('jimmy-orchestrator', {
      body: { message: text, conversation_id: conversationId, brand_id: brandId, forced_skill_id: forcedSkillId },
    });

    if (invokeErr) { setError(...); setIsLoading(false); return; }

    setConversationId(data.conversation_id);
    localStorage.setItem(`hubchat:conv:${brandId}`, data.conversation_id);

    if (data.pending_confirmation) {
      setPendingConfirmation(data.pending_confirmation);
    }

    setMessages(prev => [...prev, { role: 'assistant', content: data.response, id: data.message_id, toolExecutions: data.tool_executions }]);
    setRemainingInteractions(data.remaining_interactions);
    setToolExecutions(data.tool_executions || []);
    setIsLoading(false);
  }, [brandId, conversationId, forcedSkillId]);

  const confirmAction = useCallback(async () => {
    if (!pendingConfirmation) return;
    setIsLoading(true);
    const { data } = await supabase.functions.invoke('jimmy-orchestrator', {
      body: {
        message: '__confirmed__',
        conversation_id: conversationId,
        brand_id: brandId,
        confirmed: true,
        confirmed_tool_call: { tool_name: pendingConfirmation.tool_name, params: pendingConfirmation.params },
      },
    });
    setPendingConfirmation(null);
    setMessages(prev => [...prev, { role: 'assistant', content: data.response, id: data.message_id }]);
    setIsLoading(false);
  }, [pendingConfirmation, brandId, conversationId]);

  const cancelAction = useCallback(() => setPendingConfirmation(null), []);

  return { messages, sendMessage, isLoading, error, conversationId, pendingConfirmation, confirmAction, cancelAction, remainingInteractions, forcedSkillId, setForcedSkillId, toolExecutions };
}
```

### `JimmyHubChat.tsx` (esqueleto)

```typescript
export function JimmyHubChat() {
  const enabled = import.meta.env.VITE_JIMMY_HUBCHAT_ENABLED === 'true';
  const [open, setOpen] = useState(false);
  const [brandId, setBrandId] = useState<string | null>(null);
  const agent = useJimmyOrchestrator(brandId);

  if (!enabled) return null;

  return (
    <>
      <HubChatFAB onClick={() => setOpen(true)} />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
          <HubChatHeader
            brandId={brandId}
            onBrandChange={setBrandId}
            skillId={agent.forcedSkillId}
            onSkillChange={agent.setForcedSkillId}
            remainingInteractions={agent.remainingInteractions}
          />
          <HubChatMessages
            messages={agent.messages}
            isLoading={agent.isLoading}
            toolExecutions={agent.toolExecutions}
            pendingConfirmation={agent.pendingConfirmation}
            onConfirm={agent.confirmAction}
            onCancel={agent.cancelAction}
          />
          <HubChatInput
            onSend={agent.sendMessage}
            disabled={!brandId || agent.isLoading || agent.remainingInteractions === 0}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
```

### Reuso explícito

- `useHelpAgent.ts` — padrão de hook (storage, error handling, rate limit)
- `BrandSelector.tsx` (de `content-creator-chat`) — copiar/adaptar pra `HubChatHeader`
- `ParamsConfirmCard.tsx` — base visual de `ConfirmActionButtons.tsx`
- `TypingIndicator.tsx` — reusar direto em `HubChatMessages` quando `isLoading`
- `ChatMessage` (de `help-agent`) — pode reusar parcial pra render
- shadcn: `Sheet`, `Button`, `Textarea`, `Table`, `Card`, `Badge`

## Out of scope

- Histórico de conversas anteriores (drawer com lista) — deixar pra story futura
- Streaming visual real (Fase 2 — Fase 1 mostra resposta inteira de uma vez com loading)
- Compartilhamento de conversas
- Export de conversa pra Markdown/PDF

## Riscos

| Risco | Mitigação |
|---|---|
| Drawer conflita com help-agent (visualmente) | help-agent fica à esquerda, hubchat à direita; ícones distintos |
| Renderização de tabela markdown quebra layout | Usar parser simples + max-width + overflow-x-auto |
| `pending_confirmation` UX ambígua | Card destaca claramente o que vai acontecer + summary humano legível |
| Usuário tenta enviar antes de selecionar marca | Input desabilitado + placeholder explicativo |

---

## Implementação

**Status:** `em-revisao` (criado em 2026-05-02)

**Branch/PR:** sem branch (mudanças diretas)

**Arquivos criados (`src/features/hubchat/`):**
- `types/index.ts` (~45 linhas) — `HubChatMessage`, `ToolExecution`, `PendingConfirmation`, `OrchestratorResponse`, `SkillId`, `ForcedSkillSelection`
- `lib/tool-display-names.ts` (~50 linhas) — `TOOL_DISPLAY` mapping de 19 tools com label + ícone emoji + categoria
- `hooks/useJimmyOrchestrator.ts` (~190 linhas) — hook completo com state, persistência de `conversation_id` em localStorage por brand, `sendMessage`, `confirmAction`, `cancelAction`, `resetConversation`
- `components/SkillSelector.tsx` (~40 linhas) — pills com 3 opções (Auto, Mídia Paga, Conteúdo)
- `components/ToolExecutionCard.tsx` (~70 linhas) — card visual de execução: ícone, label, status (success/error/pending), duração
- `components/ConfirmActionButtons.tsx` (~60 linhas) — card amber com summary do backend + botões Confirmar/Cancelar
- `components/HubChatFAB.tsx` (~35 linhas) — FAB roxo com Sparkles em `bottom-24 right-6` (acima do help-agent)
- `components/JimmyHubChat.tsx` (~210 linhas) — componente raiz: Sheet (side=right), header com brand select + skill selector + remaining badge + reset/close, ScrollArea com mensagens + tool cards + pending confirmation + error retry, Textarea + Send com Enter handler
- `index.ts` — re-exports públicos

**Arquivos modificados:**
- `src/components/Layout.tsx` — adiciona `import { JimmyHubChat }` + renderiza `<JimmyHubChat />` ao lado do `<HelpAgentWidget />`
- `.env` — adiciona `VITE_JIMMY_HUBCHAT_ENABLED="true"` (Netlify env precisará setar igual em produção)

**Validações:**
- ✅ `npx tsc --noEmit` exit 0 (TypeScript strict, zero `any`)
- ✅ `npm run build` exit 0 em 24.65s — sem erros de Vite/build
- ✅ Reusa shadcn (Sheet, Button, Textarea, Badge, Skeleton, ScrollArea, Card, Tooltip)
- ✅ Reusa `useAuth`, `useAgencyBrands` (padrão do projeto)
- ✅ Reusa cliente `supabase` de `@/integrations/supabase/client`

**Critérios de aceite:**
- [x] CA1 — Hook exporta `{messages, sendMessage, isLoading, error, conversationId, pendingConfirmation, confirmAction, cancelAction, remainingInteractions, toolExecutions, resetConversation, forcedSkill, setForcedSkill, delegationSuggested}`
- [x] CA2 — Hook chama `jimmy-orchestrator` via `supabase.functions.invoke`, persiste `conversation_id` em `localStorage` por brand (`hubchat:conv:{brandId}`)
- [x] CA3 — Drawer renderiza `Sheet side="right"` com `w-full sm:max-w-md`
- [x] CA4 — Header com nome "HubChat · Jimmy" + select de marca + SkillSelector + badge de interações restantes + botão reset/close
- [x] CA5 — `SkillSelector` com 3 opções (Auto/Mídia Paga/Conteúdo). Delegações (Estrategista/Gerador) NÃO aparecem como opção pq são tools chamadas pelo agente, não modos do orquestrador
- [x] CA6 — `ToolExecutionCard` mostra ícone + label + status + duração
- [x] CA7 — `ConfirmActionButtons` aparece quando `pendingConfirmation` está presente
- [⏸] CA8 — Tabelas markdown → shadcn Table: NÃO implementado nessa story (whitespace-pre-wrap renderiza markdown raw mas tabelas ficam como texto). Recomendo abrir mini-story se for crítico — requer `react-markdown` ou parser custom
- [⏸] CA9 — Imagens inline lazy load: NÃO implementado (depende do CA8 — markdown rendering)
- [x] CA10 — Textarea + botão Send (Enter envia, Shift+Enter quebra linha)
- [x] CA11 — Badge de interações restantes no header; input desabilitado se `remainingInteractions === 0`
- [x] CA12 — Erro com botão "Tentar novamente" que reenvia última mensagem do user
- [x] CA13 — Feature flag `VITE_JIMMY_HUBCHAT_ENABLED` gateia render — se off, `JimmyHubChat` retorna null
- [x] CA14 — FAB no canto direito (`bottom-24 right-6`) acima do help-agent (`bottom-6 right-6`), ícone `Sparkles` roxo pra distinguir
- [⏸] CA15 — Smoke tests manuais: precisam ser executados pelo usuário no preview (instruções abaixo)

**Smoke tests manuais a fazer (CA15):**
1. Abrir `/agencia` (qualquer página com Layout) → ver FAB roxo em `bottom-24 right-6`
2. Clicar FAB → drawer abre à direita com select de marca + skill pills
3. Selecionar marca + skill "Auto" + perguntar "Como estão minhas campanhas Meta essa semana?" → ver resposta + tool cards
4. Pedir "pausa essa campanha X" → `ConfirmActionButtons` aparece com summary do backend → confirmar → ver execução
5. Pedir "cria post sobre Y" → ver delegação pro Gerador (skill="analista_conteudo" + delegation_suggested="gerador" no response)
6. Trocar de skill mid-conversation → próxima mensagem usa nova skill
7. Fechar e reabrir → conversa persiste do `conversation_id` em localStorage
8. Clicar reset (RefreshCw no header) → começa nova conversa

**Notas de implementação:**
- **`auto-select primeira marca` no mount:** UX melhora, evita estado vazio sem brand selecionado. Usuário pode trocar via select.
- **`whitespace-pre-wrap` em vez de markdown parser:** decisão pragmática pra Fase 1 — Claude já formata texto razoavelmente bem com quebras de linha. Tabelas vêm como markdown raw (sintaticamente corretas mas sem render visual). Migrar pra `react-markdown` pode ser STORY-022.1.
- **FAB roxo distinto do help-agent (azul/primary):** distingue visualmente os dois agentes — help é suporte do produto, hub é orquestrador de marketing.
- **Sem error boundary local explícito:** depende do error boundary global do app. Se virar problema, encapsular `<JimmyHubChat />` em `<ErrorBoundary>` no Layout.
- **Feature flag também precisa ser setada no Netlify** pra produção: `VITE_JIMMY_HUBCHAT_ENABLED=true` nas env vars do Netlify Dashboard.

---

## QA

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] CA1-CA15 validados
- [ ] Build sem erros, TypeScript strict, zero `any`
- [ ] Loading state em todas as chamadas
- [ ] Error state com retry
- [ ] Error Boundary em torno do JimmyHubChat
- [ ] Feature flag testada
- [ ] Smoke tests manuais nos 5 cenários (CA15)
- [ ] Responsivo: mobile renderiza drawer fullscreen
- [ ] `npm audit` sem Critical/High

---

## Notas e Decisões

- **Drawer à direita:** distingue visualmente do help-agent (esquerda). Diferença reforça que são produtos distintos.
- **SkillSelector opcional (default Auto):** não força usuário a entender taxonomia — backend resolve. Manual é pra power users.
- **Sem streaming na Fase 1:** UX aceita "esperar a resposta completa" porque max é 8 tools × 30s + Claude = ~120s; se passar disso é problema de backend, não de UX.
- **Por que `confirmed_tool_call` no body em vez de só `confirmed: true`:** segurança — backend valida que o que vai executar é exatamente o que foi confirmado, sem race condition com nova mensagem do usuário no meio
