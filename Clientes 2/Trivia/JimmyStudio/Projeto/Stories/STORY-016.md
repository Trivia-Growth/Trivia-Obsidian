# STORY-016 — Modo Terminal Branded Jimmy

**Status:** concluido  
**Branch:** feat/assistente-terminal-mode  

---

## Descrição

Adicionar um modo terminal opcional (toggle) à página "Assistente de Conteúdo". A UI alterna entre o chat atual (`ContentCreationChat`) e um novo componente `JimmyTerminalChat` com estética CLI (navy + neon-purple). Backend intacto — reusa `content-creation-agent` edge function, `useAgencyBrands`, `useContentGeneration` e `parseAgentStream`.

---

## Acceptance Criteria

- [x] Toggle "MODO TERMINAL · BETA" no header da página persistido em localStorage
- [x] Boot sequence de 6 linhas com 180ms entre cada uma
- [x] Brand picker com marcas reais via `useAgencyBrands`
- [x] Format picker com 12 formatos hardcoded
- [x] Streaming de resposta do Jimmy com cursor animado
- [x] Research card com dashed border, summary e fontes
- [x] Copy card com border-left purple e 4 ações (imagem/agendar/refazer/salvar)
- [x] Slash hints popover quando input começa com `/`
- [x] Slash commands: `/limpar`, `/marca`, `/formato`, `/refazer` (funcionais); demais com "em breve"
- [x] Paleta exata do handoff (navy `#071925`, accent `#A855F7`, user `#35DDFF`, jimmy `#A0D4FA`)
- [x] JetBrains Mono carregada via Google Fonts no `index.html`
- [x] TS sem erros, build OK

---

## Arquitetura

### Componentes criados (`src/features/assistente-terminal/`)

| Arquivo | Descrição |
|---------|-----------|
| `types/index.ts` | TerminalStage, TerminalMessage, TerminalFormat, TerminalState |
| `lib/palette.ts` | Tokens de cor e fonte do Branded Jimmy |
| `lib/bootLines.ts` | 6 linhas de boot |
| `lib/slashCommands.ts` | SLASH_COMMANDS + TERMINAL_FORMATS |
| `hooks/useTerminalMode.ts` | Toggle + localStorage |
| `hooks/useStreamingChat.ts` | SSE wrapper sobre content-creation-agent |
| `hooks/useTerminalState.ts` | State machine completa (boot→copy→free) |
| `components/Cursor.tsx` | Bloco 7×14px com animação jimmyBlink |
| `components/TerminalHeader.tsx` | Chrome macOS: 3 dots + label + ONLINE |
| `components/BootSequence.tsx` | 6 linhas com 180ms entre cada |
| `components/MessageLine.tsx` | Renderer: jimmy/user/system |
| `components/BrandPicker.tsx` | Lista real de AgencyBrand |
| `components/FormatPicker.tsx` | 12 formatos hardcoded |
| `components/ResearchCard.tsx` | Dashed border, summary, fontes, botões |
| `components/CopyCard.tsx` | Border-left purple, copy, 4 ações |
| `components/SlashHints.tsx` | Popover de autocomplete de comandos |
| `components/TerminalInput.tsx` | Footer com prompt jimmy@social:~$ |
| `components/JimmyTerminalChat.tsx` | Raiz: grid 3 linhas, orquestra tudo |
| `index.ts` | Re-exports públicos |

### Arquivos editados

| Arquivo | Mudança |
|---------|---------|
| `src/pages/agencia/AssistenteConteudo.tsx` | Toggle no header + render condicional |
| `index.html` | Google Fonts JetBrains Mono |
