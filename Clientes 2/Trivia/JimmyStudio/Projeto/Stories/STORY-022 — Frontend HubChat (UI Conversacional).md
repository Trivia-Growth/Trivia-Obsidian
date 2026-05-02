---
id: STORY-022
titulo: "Frontend HubChat (UI Conversacional)"
fase: 3
modulo: jimmy-hubchat
status: pronto
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

**Status:** `pronto`
**Branch/PR:**
**Arquivos alterados:**
**Notas:**

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
