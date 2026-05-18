---
id: STORY-048
titulo: "JimmyChat: busca local na lista de conversas"
fase: 3
modulo: jimmy-jimmychat
status: em-revisao
prioridade: baixa
origem: claude
agente_responsavel: ""
criado: 2026-05-06
atualizado: 2026-05-06
---

# STORY-048 — JimmyChat: busca local na lista de conversas

## Contexto

Após STORY-046/047, lista de conversas tem switcher + rename + archive. Com 30 convs visíveis, scroll virou friccional. Adicionar busca local (substring no título + preview, case-insensitive) reduz tempo pra achar conversa antiga.

Sem nova query no DB — filter sobre o array já carregado pelo `useJimmyConversations`.

## Critérios de Aceite

- [x] CA1 — Input de busca no header do popover, ícone Search à esquerda
- [x] CA2 — Filter case-insensitive em `title` E `preview` (OR substring)
- [x] CA3 — Empty state "Nenhuma conversa encontrada para '{query}'."
- [x] CA4 — Limpa query ao fechar (`useEffect [open]`)
- [x] CA5 — Foco automático no input via `setTimeout` 50ms (após Popover renderizar)
- [x] CA6 — `npx tsc --noEmit` exit 0 + `npm run build` exit 0 em 29.56s

## Arquitetura

Mudança contida em `ConversationSwitcher.tsx`. Sem novo hook ou helper.

## Out of scope

- Busca server-side (com 30 convs, irrelevante)
- Highlight do match (nice-to-have)
- Atalho `/` pra abrir busca (futuro)
- Filter por data range

## Implementação

**Status:** `em-progresso`

**Arquivos alterados:**
- `src/features/jimmychat/components/ConversationSwitcher.tsx` — input de busca + filter local

---

## QA

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] CA1-CA6 validados
- [ ] Smoke: digitar query reduz lista; limpar restaura
