---
id: STORY-026
titulo: "Acesso ao HubChat: atalho no topo da sidebar + remoção do FAB no mobile"
fase: 3
modulo: jimmy-hubchat
status: pronto
prioridade: média
origem: claude
agente_responsavel: ""
criado: 2026-05-02
atualizado: 2026-05-02
---

# STORY-026 — Acesso ao HubChat: atalho na sidebar + remoção do FAB no mobile

## Contexto

Após o rollout da Fase 1 do HubChat (STORY-022, FAB roxo `bottom-24 right-6`), a UX de entrada do drawer tem 2 problemas:

1. **Desktop:** FAB no canto direito é invisível pra muitos usuários — não há sinalização do que ele faz até hover. Um atalho fixo no topo do menu lateral (com ícone + label "HubChat") torna a feature descobrível e dá hierarquia visual de "ferramenta principal".

2. **Mobile:** o FAB sobrepõe conteúdo (especialmente em formulários e listas longas) e disputa espaço com o botão de help-agent (também flutuante, mais abaixo). Como o menu lateral mobile é abertural via hamburger e tem espaço suficiente pra um item destacado, o FAB no mobile vira ruído.

Esta story unifica as 2 mudanças porque ambas mexem no mesmo ponto: **como o usuário abre o HubChat**.

## Spec de Referência

- STORY-022 (frontend HubChat) — implementação atual do FAB
- Componente FAB: `src/features/hubchat/components/HubChatFAB.tsx`
- Componente raiz: `src/features/hubchat/components/JimmyHubChat.tsx`
- Sidebar: `src/components/Layout.tsx` (estrutura de SidebarMenu)

## Critérios de Aceite

### Atalho na sidebar (desktop + mobile)

- [ ] CA1 — Item "HubChat" aparece como **primeiro item** do `SidebarMenu` (acima de qualquer grupo existente — Meta Ads, Jimmy Studio, etc.)
- [ ] CA2 — Visual destacado: ícone `Sparkles` roxo (`text-purple-600`), label "HubChat", badge "Beta" (ou similar) opcional
- [ ] CA3 — Click abre o drawer do HubChat (estado `open` controlado via contexto OU prop drilling — ver arquitetura)
- [ ] CA4 — Item respeita estado `collapsed` da sidebar (mostra só ícone) e expansão mobile
- [ ] CA5 — Ativo quando drawer está aberto (estado visual diferenciado)
- [ ] CA6 — Visível pra todos os usuários autenticados quando `VITE_JIMMY_HUBCHAT_ENABLED=true` (mesmo gate atual)

### Remover FAB no mobile

- [ ] CA7 — `HubChatFAB` NÃO renderiza em viewports `< md` (768px) — usar `hidden md:flex` na classe ou `useIsMobile()` no JimmyHubChat
- [ ] CA8 — No desktop o FAB continua aparecendo como hoje (não regredir)
- [ ] CA9 — No mobile, o atalho da sidebar passa a ser a ÚNICA entrada (CA1 garante visibilidade ao abrir hamburger)

### Testes

- [ ] CA10 — `npx tsc --noEmit` exit 0
- [ ] CA11 — `npm run build` exit 0
- [ ] CA12 — Smoke manual: desktop 1280px → atalho na sidebar OK + FAB OK; mobile 375px → atalho na sidebar OK + FAB ausente

## Arquitetura

### Decisão: estado do drawer compartilhado

Hoje o `JimmyHubChat.tsx` mantém `open` em `useState` local. O atalho da sidebar mora em `Layout.tsx` (componente irmão), então precisa de um canal pra abrir o drawer de fora.

3 opções:

**A) Custom event (window.dispatchEvent)** — segue o padrão existente em `AssistenteConteudo.tsx` (`jimmy:reset-conversation`, `jimmy:load-conversation`). Mínimo refactor. Recomendado.

**B) Context Provider** — criar `HubChatContext` com `{ isOpen, open(), close() }`. Mais "react-correto" mas precisa wrapping no app.

**C) Zustand/jotai store** — overkill pra um boolean.

**Recomendação: opção A.** Adicionar event `hubchat:open` que `JimmyHubChat` ouve.

### Implementação

**`JimmyHubChat.tsx`:** adicionar useEffect que escuta `hubchat:open`:

```typescript
useEffect(() => {
  const handler = () => setOpen(true);
  window.addEventListener('hubchat:open', handler);
  return () => window.removeEventListener('hubchat:open', handler);
}, []);
```

**`HubChatFAB.tsx`:** adicionar `hidden md:flex` na classe do Button:

```typescript
className={cn(
  "fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full shadow-lg",
  "bg-purple-600 hover:bg-purple-700 text-white",
  "hidden md:flex",  // ← novo: oculta em mobile
  "transition-all duration-200 hover:scale-105 active:scale-95",
  "items-center justify-center"
)}
```

**`Layout.tsx`:** adicionar item no topo do SidebarMenu (antes do primeiro grupo existente):

```typescript
const enabled = import.meta.env.VITE_JIMMY_HUBCHAT_ENABLED === 'true';

// Dentro do SidebarMenu, como PRIMEIRO item:
{enabled && (
  <SidebarMenuItem>
    <SidebarMenuButton
      onClick={() => window.dispatchEvent(new CustomEvent('hubchat:open'))}
      tooltip={isCollapsed ? 'HubChat' : undefined}
      className="text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30"
    >
      <Sparkles className="h-5 w-5" />
      {!isCollapsed && (
        <>
          <span className="font-medium">HubChat</span>
          <Badge variant="outline" className="ml-auto text-[9px] px-1.5 py-0 h-4 border-purple-600 text-purple-600">
            Beta
          </Badge>
        </>
      )}
    </SidebarMenuButton>
  </SidebarMenuItem>
)}
```

(Localização exata do PRIMEIRO item depende da estrutura atual do `SidebarContentWrapper` — investigar antes de inserir.)

### Reuso explícito

- Padrão de custom event: `AssistenteConteudo.tsx` linhas 87-95 (`jimmy:reset-conversation`)
- Estilo roxo do HubChat: já em `HubChatFAB.tsx` (`bg-purple-600`)
- shadcn `SidebarMenuButton` (`@/components/ui/sidebar`) — já usado em todos os items existentes
- `Sparkles` (`lucide-react`) — já importado em `Layout.tsx`

## Out of scope

- Atalho de teclado pra abrir o HubChat (ex: `cmd+k`) — story futura se virar pedido
- Notificações no atalho (badge de conversa pendente) — sem `pending_confirmation` persistente entre sessões hoje
- Mover help-agent FAB também — comportamento dele não está em escopo desta story

## Riscos

| Risco | Mitigação |
|---|---|
| Item da sidebar destoa visualmente dos outros (cor diferente) | Manter consistência: usar mesma estrutura do `SidebarMenuButton` mas com `text-purple-600` no hover/ícone — tratamento especial mas dentro do padrão |
| Custom event não dispara se `JimmyHubChat` ainda não montou | Não é problema porque ambos são montados no `Layout.tsx` — montagem síncrona |
| Mobile sem FAB confunde usuários acostumados | Atalho na sidebar é mais descobrível — UX-net positiva. Documentar no release note |

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** `pronto`
**Branch/PR:**
**Arquivos alterados:**
**Notas:**

---

## QA

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] CA1-CA12 validados
- [ ] Build sem erros, TypeScript strict
- [ ] Smoke desktop + mobile (DevTools 375px)
- [ ] Não regrediu help-agent FAB

---

## Notas e Decisões

- **Custom event vs Context:** opção A escolhida pra alinhar com padrão existente do projeto (`jimmy:reset-conversation`) e evitar wrapping de Provider novo
- **Sidebar item PRIMEIRO em vez de num grupo:** sinaliza hierarquia "ferramenta principal", facilita descoberta. Outros itens existentes mantêm sua organização
- **`hidden md:flex` no FAB:** zero JS adicional pra detecção de viewport — Tailwind faz tudo via CSS
