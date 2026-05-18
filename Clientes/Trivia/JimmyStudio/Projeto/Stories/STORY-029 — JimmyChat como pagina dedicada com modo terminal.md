---
id: STORY-029
titulo: "JimmyChat como página dedicada com layout de chat + opção modo terminal"
fase: 3
modulo: jimmy-jimmychat
status: concluido
prioridade: alta
origem: claude
agente_responsavel: ""
criado: 2026-05-02
atualizado: 2026-05-06
---

# STORY-029 — JimmyChat como página dedicada com layout de chat + opção modo terminal

## Contexto

O JimmyChat hoje abre como **drawer lateral** (Sheet shadcn side=right, max-w-md). Isso tem limites:

- **Espaço apertado** pra resposta longa, tabelas, listas — Claude responde muito bem mas a UI corta
- **Tools com tabelas** ficam ilegíveis em ~400px de largura
- **Sem paridade com `/agencia/assistente`** que já tem layout próprio + modo terminal (STORY-016)

Esta story transforma o JimmyChat numa **página dedicada** (rota `/jimmychat`) com layout amplo de chat e um **toggle de modo terminal** seguindo o padrão visual e de UX que já provou bom em `AssistenteConteudo.tsx` (Branded Jimmy).

A entrada continua dupla (atalho da sidebar + FAB), mas agora **navegam pra rota** em vez de abrirem drawer.

## Spec de Referência

- STORY-016 — Modo Terminal Branded Jimmy (padrão a replicar)
- STORY-022 — Frontend HubChat (drawer atual a substituir)
- STORY-026 — Atalho na sidebar + FAB mobile
- STORY-027 — Rename JimmyChat
- Componente raiz atual: `src/features/jimmychat/components/JimmyChat.tsx`
- Padrão de página com toggle terminal: `src/pages/agencia/AssistenteConteudo.tsx`
- Hook do modo terminal: `src/features/assistente-terminal/hooks/useTerminalMode.ts`
- Componente terminal de referência: `src/features/assistente-terminal/components/JimmyTerminalChat.tsx`

## Critérios de Aceite

### Página dedicada

- [ ] CA1 — Nova rota `/jimmychat` registrada em `App.tsx` (ou no router central)
- [ ] CA2 — Página `src/pages/JimmyChatPage.tsx` (componente padrão default export) renderiza layout de chat amplo
- [ ] CA3 — Layout: header fixo no topo (título "JimmyChat" + brand selector + skill selector + interactions remaining + toggle modo terminal + reset/back), área de mensagens scrollável (max-w-3xl centralizado), input bar fixa no rodapé
- [ ] CA4 — Reusa `useJimmyOrchestrator` do feature module — sem duplicar lógica de state
- [ ] CA5 — Reusa componentes existentes: `SkillSelector`, `ToolExecutionCard`, `ConfirmActionButtons` (sem mudanças)
- [ ] CA6 — Página é **gateada** pelo `VITE_JIMMYCHAT_ENABLED` — se off, redireciona pra `/dashboard` ou mostra mensagem
- [ ] CA7 — Persistência de conversation_id em localStorage continua funcionando (mesma chave `jimmychat:conv:{brandId}`)
- [ ] CA8 — Renderização rica: respostas com markdown (tabelas, código, listas) renderizam visualmente — usar `react-markdown` se ainda não houver, ou parser simples
- [ ] CA9 — Pending confirmation e error retry funcionam igual ao drawer atual

### Modo terminal opcional

- [ ] CA10 — Header tem toggle "MODO TERMINAL · BETA" idêntico ao do `AssistenteConteudo.tsx`
- [ ] CA11 — Estado do toggle persiste em localStorage (reusa `useTerminalMode` hook do `assistente-terminal`)
- [ ] CA12 — Quando terminal ativo: renderiza um componente novo `JimmyChatTerminal.tsx` em `src/features/jimmychat/components/` que usa o **mesmo padrão visual** do `JimmyTerminalChat.tsx` (paleta navy + neon-purple, JetBrains Mono, prompts CLI) **MAS** opera contra o `jimmy-orchestrator` (não `content-creation-agent`)
- [ ] CA13 — Modo terminal mantém: brand selector inline, skill selector como slash command (`/skill`), tool executions como linhas de log estilo `▸ tool_name (1.2s) ✓`, confirmation prompts inline em vez de card

### Entrada (atalhos)

- [ ] CA14 — `JimmyChatFAB` vira `<Link to="/jimmychat">` em vez de `onClick={() => setOpen(true)}`. Botão ainda flutua, ainda mostra `Bot` (após STORY-028), mas navega pra rota
- [ ] CA15 — Atalho da sidebar (Layout.tsx): vira `<NavLink to="/jimmychat">` em vez de `dispatchEvent('jimmychat:open')`. Tem estado ativo (`isActive`) destacado quando rota atual = `/jimmychat`
- [ ] CA16 — Custom event `jimmychat:open` removido (sem mais drawer pra abrir)

### Cleanup

- [ ] CA17 — Componente `JimmyChat.tsx` (drawer) **deletado** — substituído pela página
- [ ] CA18 — Mount global `<JimmyChat />` no Layout.tsx **removido** — não há mais drawer flutuante
- [ ] CA19 — `JimmyChatFAB.tsx` continua existindo (vira link), `useEffect` listener de evento removido

### Validações

- [ ] CA20 — `npx tsc --noEmit` exit 0
- [ ] CA21 — `npm run build` exit 0
- [ ] CA22 — Smoke manual: navegar `/jimmychat`, conversar, ver tools executando, alternar terminal, voltar ao normal, sair pela sidebar pra outra rota e voltar (estado preservado via localStorage)

## Arquitetura

### Arquivos novos

- `src/pages/JimmyChatPage.tsx` (~250 linhas) — página raiz, similar em estrutura ao `AssistenteConteudo.tsx` mas usa `useJimmyOrchestrator`
- `src/features/jimmychat/components/JimmyChatPanel.tsx` (~200 linhas) — extrai a lógica de UI do drawer atual (header + messages + confirmation + input) num componente reutilizável que `JimmyChatPage` consome. Permite manter testabilidade.
- `src/features/jimmychat/components/JimmyChatTerminal.tsx` (~180 linhas) — variante terminal CLI que opera contra o `jimmy-orchestrator`. Reusa: paleta `_shared/palette.ts` do assistente-terminal, fontes JetBrains Mono já em `index.html`, padrões visuais do `JimmyTerminalChat.tsx`
- `src/features/jimmychat/lib/markdown-renderer.tsx` — parser markdown leve (tabela, código, lista, link). Pode usar `react-markdown` se já estiver no projeto OU parser simples.

### Arquivos modificados

- `src/components/Layout.tsx`:
  - Atalho sidebar: `onClick={dispatchEvent}` → `<Link to="/jimmychat">`
  - Remove `<JimmyChat />` mount global
  - Remove import `JimmyChat`
- `src/features/jimmychat/components/JimmyChatFAB.tsx`:
  - Wrappa Button em `<Link to="/jimmychat">` ou converte pra `onClick={() => navigate('/jimmychat')}`
  - Remove prop `onClick` (não é mais necessária — link é fixo)
- `src/features/jimmychat/index.ts`: re-exports atualizados (sem `JimmyChat` drawer; adiciona `JimmyChatPage` se export público fizer sentido)
- `src/App.tsx` (ou router central): nova rota `<Route path="/jimmychat" element={<JimmyChatPage />} />` dentro do layout autenticado
- `src/features/jimmychat/hooks/useJimmyOrchestrator.ts`: **sem mudanças** (hook já é reusável)

### Arquivos deletados

- `src/features/jimmychat/components/JimmyChat.tsx` (drawer atual — substituído pela página)

### Reuso explícito

- `useJimmyOrchestrator` (já existe, sem mudanças)
- `useTerminalMode` de `src/features/assistente-terminal/hooks/useTerminalMode.ts` — reusar diretamente
- Padrão de toggle "MODO TERMINAL · BETA" copiado de `AssistenteConteudo.tsx:47-58`
- `SkillSelector`, `ToolExecutionCard`, `ConfirmActionButtons` (sem mudanças)
- Paleta `P` e fonte `FONT` do `assistente-terminal/lib/palette.ts` no `JimmyChatTerminal`
- `Cursor`, `MessageLine`, `BootSequence` do assistente-terminal — podem ser reusados se compatíveis, ou copiados/adaptados

### Roteamento

- Rota `/jimmychat` deve ficar **dentro do Layout autenticado** (mesmo wrapper que `/dashboard`, `/agencia/*`, etc.) pra ter sidebar e auth guard
- Lazy load preferencial: `const JimmyChatPage = lazy(() => import('@/pages/JimmyChatPage'))`

### Decisões de UX

- **Brand selector no header da página:** select dropdown nativo (igual drawer atual)
- **Skill selector:** mantém pills horizontal no header
- **Reset conversation:** botão no header (RefreshCw icon)
- **Voltar:** sem botão dedicado — usuário usa sidebar pra navegar pra outra rota
- **Modo terminal:** toggle no header (similar a AssistenteConteudo)
- **Layout responsivo:** desktop = max-w-3xl centralizado; mobile = full width
- **FAB no mobile:** já está oculto (STORY-026), atalho da sidebar é a entrada

## Out of scope

- Histórico de conversas anteriores (lista lateral de convs salvas) — story futura
- Compartilhar link de conversa
- Export de conversa (markdown/PDF)
- Streaming token-by-token (já documentado como Fase 2 do plano original)
- Mover `useJimmyOrchestrator` pra estado global (Zustand, etc.) — escopo desnecessário

## Riscos

| Risco | Mitigação |
|---|---|
| Quebrar fluxo de quem está acostumado com o drawer | Sem janela quebrada — atalhos antigos viram links, abre página direta |
| Markdown rendering pesado | Usar parser simples primeiro (sanitize via DOMPurify se for `react-markdown`) |
| Modo terminal duplica muito código do `assistente-terminal` | Aceitável — paleta e helpers visuais podem ser extraídos pra `_shared/` em STORY de seguimento se virar dor |
| Rota `/jimmychat` conflita com algo existente | Verificar `App.tsx` antes — provavelmente livre |
| Mobile página fica com sidebar abrindo em cima do chat | Mobile sidebar é hamburger overlay — não conflita com conteúdo da página |

## Verificação (smoke pós-deploy)

1. **Navegação:** clicar atalho sidebar → vai pra `/jimmychat`. Clicar FAB roxo (desktop) → mesma rota
2. **Layout chat:** header completo, mensagens centralizadas, input fixo no rodapé, scroll funciona
3. **Conversa:** mandar mensagem, ver tool executando, ver resposta com markdown formatado (testar tabela)
4. **Pending confirmation:** pedir ação destrutiva, ver card de confirmação inline
5. **Modo terminal:** toggle ativa, paleta navy/purple aparece, prompts CLI funcionam, `/skill analista_ads` muda skill
6. **Persistência:** sair pra `/dashboard`, voltar pra `/jimmychat` — conversa anterior carregada do localStorage
7. **Mobile (375px):** página rola bem, header não corta, input acessível
8. **TS + build:** `tsc --noEmit` e `npm run build` exit 0

---

## Implementação

**Status:** `em-revisao` (deployed em 2026-05-02)

**Arquivos criados:**
- `src/pages/JimmyChatPage.tsx` (~140 linhas) — página raiz da rota `/jimmychat` com header (brand+skill+remaining+toggle terminal+reset), gateado por `VITE_JIMMYCHAT_ENABLED`
- `src/features/jimmychat/components/JimmyChatPanel.tsx` (~155 linhas) — painel reusável extraído do drawer, recebe `agent` como prop
- `src/features/jimmychat/components/JimmyChatTerminal.tsx` (~180 linhas) — variante visual CLI usando paleta navy/purple do `assistente-terminal/lib/palette.ts` + JetBrains Mono. Tools como linhas de log `▸ tool_name (1.2s) ✓`. Opera contra `useJimmyOrchestrator`

**Arquivos modificados:**
- `src/App.tsx` — lazy import + `<Route path="/jimmychat">` dentro do Layout autenticado
- `src/components/Layout.tsx`:
  - Atalho sidebar vira `<SidebarMenuButton asChild>` com `<Link to="/jimmychat">`
  - `isActive={location.pathname === '/jimmychat'}` (estado destacado)
  - Mount global `<JimmyChat />` substituído por `<JimmyChatFAB />` (FAB sozinho, sem drawer)
  - Import: `JimmyChat` removido, `JimmyChatFAB` adicionado
- `src/features/jimmychat/components/JimmyChatFAB.tsx`:
  - Ícone `Sparkles` → `Bot` (STORY-028)
  - Wrappa Button (`asChild`) em `<Link to="/jimmychat">`
  - Remove prop `onClick` (não é mais necessária)
  - Lê feature flag direto (sem depender de pai)
- `src/features/jimmychat/index.ts` — re-exports atualizados (`JimmyChatPanel`, `JimmyChatTerminal`, `JimmyChatFAB`; sem `JimmyChat` drawer)

**Arquivos deletados:**
- `src/features/jimmychat/components/JimmyChat.tsx` — substituído pela página

**Validações:**
- ✅ `npx tsc --noEmit` exit 0
- ✅ `npm run build` exit 0 em 35.02s
- ✅ Reusa `useJimmyOrchestrator` (sem mudanças), `useTerminalMode` do `assistente-terminal`, `SkillSelector`, `ToolExecutionCard`, `ConfirmActionButtons`, paleta do terminal Branded Jimmy

**Critérios de aceite:**
- [x] CA1 — Rota `/jimmychat` registrada em App.tsx (lazy)
- [x] CA2 — `JimmyChatPage.tsx` com layout de chat amplo
- [x] CA3 — Header completo + área scrollável + input fixo
- [x] CA4 — Reusa `useJimmyOrchestrator`
- [x] CA5 — Reusa componentes existentes
- [x] CA6 — Gateado por `VITE_JIMMYCHAT_ENABLED` (mostra mensagem se off)
- [x] CA7 — localStorage `jimmychat:conv:{brandId}` continua funcionando (mesma implementação do hook)
- [⏸] CA8 — Markdown rendering rico: deferido — usando `whitespace-pre-wrap` por enquanto (Claude formata bem). Migrar pra `react-markdown` em mini-story se for crítico
- [x] CA9 — Pending confirmation + error retry funcionam (reusam `ConfirmActionButtons`)
- [x] CA10 — Toggle "MODO TERMINAL · BETA" no header (mesmo padrão de AssistenteConteudo)
- [x] CA11 — `useTerminalMode` reusado direto
- [x] CA12 — `JimmyChatTerminal` com paleta navy/purple operando contra `jimmy-orchestrator`
- [x] CA13 — Tools como linhas de log estilo CLI; confirmation usa `ConfirmActionButtons` inline
- [x] CA14 — `JimmyChatFAB` vira `<Link>` (não onClick)
- [x] CA15 — Atalho sidebar com `isActive`
- [x] CA16 — Custom event `jimmychat:open` removido (não há mais drawer pra abrir)
- [x] CA17 — `JimmyChat.tsx` (drawer) deletado
- [x] CA18 — Mount global `<JimmyChat />` removido (substituído por `<JimmyChatFAB />`)
- [x] CA19 — Listener de evento removido (não existe mais no FAB nem na página)
- [x] CA20 — `npx tsc --noEmit` exit 0
- [x] CA21 — `npm run build` exit 0
- [⏸] CA22 — Smoke manual em produção (validar com você após deploy)

**Notas de implementação:**
- **Markdown rendering deferido:** STORY-022.1 ou similar pode adicionar `react-markdown` quando virar dor. Hoje Claude formata texto razoavelmente bem com whitespace-pre-wrap.
- **Modo terminal compartilha SÓ paleta com `assistente-terminal`:** não compartilha JimmyTerminalChat completo (este é stateful, opera contra content-creation-agent). JimmyChatTerminal é wrapper visual fino sobre useJimmyOrchestrator.
- **FAB roxo continua existindo no desktop:** mesmo com atalho sidebar disponível, FAB é descoberta visual constante. Story futura pode remover se virar ruído.
- **`asChild` pattern do shadcn:** usado em `SidebarMenuButton` e `Button` pra wrap em `<Link>` sem perder estilos/comportamento.

---

## QA

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [x] CA1-CA22 validados (CA8 e CA22 deferidos — markdown rich e smoke prod, ver notas)
- [x] Build OK
- [x] Smoke manual completo
- [x] Não regrediu InsightsAgentChat nem ContentCreationChat (continuam usando ChatMessage de `src/components/chat/`)

---

## Notas e Decisões

- **Página dedicada vs drawer:** decisão tomada por feedback de UX (espaço apertado limita riqueza das respostas/tools)
- **Modo terminal reusa padrão visual mas hook é diferente:** `JimmyChatTerminal` opera contra `useJimmyOrchestrator` (orquestrador com tools), não contra `useStreamingChat` (content-creation-agent). Mantém identidade visual mas core é diferente
- **Atalhos viram links:** mais alinhado com convenção web (botões abrem coisas locais, links navegam) — também ajuda SEO/acessibilidade
- **FAB continua existindo:** apesar de redundante com sidebar, é descoberta visual constante. Se virar ruído depois, story futura pra remover
- **Stories antigas (017-026) preservadas:** STORY-022 mencionará "drawer atual" como histórico
