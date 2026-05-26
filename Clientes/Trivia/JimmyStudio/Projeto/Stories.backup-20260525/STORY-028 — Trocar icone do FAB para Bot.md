---
id: STORY-028
titulo: "Trocar ícone do FAB do JimmyChat de Sparkles para Bot"
fase: 3
modulo: jimmy-jimmychat
status: concluido
prioridade: baixa
origem: claude
agente_responsavel: ""
criado: 2026-05-02
atualizado: 2026-05-06
---

# STORY-028 — Trocar ícone do FAB do JimmyChat de Sparkles para Bot

## Contexto

O FAB roxo do JimmyChat usa hoje o ícone `Sparkles` da lucide-react. Esse ícone é mais associado a "feature nova/destaque" do que a "agente conversacional". Trocar pelo ícone `Bot` (também da lucide-react) deixa o reconhecimento visual imediato — usuário entende "ali tem um agente pra conversar".

Mudança mínima, pontual, sem implicações arquiteturais.

## Spec de Referência

- STORY-022 (frontend HubChat) — implementação atual do FAB
- STORY-027 (rename HubChat → JimmyChat) — versão atual do FAB
- Componente: `src/features/jimmychat/components/JimmyChatFAB.tsx`

## Critérios de Aceite

- [x] CA1 — `JimmyChatFAB.tsx` importa `Bot` de `lucide-react` em vez de `Sparkles`
- [x] CA2 — Renderiza `<Bot className="h-6 w-6" />` no FAB
- [x] CA3 — Atalho da sidebar (Layout.tsx) **continua** usando `Sparkles` (decisão: o ícone da sidebar é decorativo de "ferramenta principal" — Bot ficaria poluído quando aparece como primeiro item da lista; manter Sparkles preserva hierarquia visual)
- [x] CA4 — Tooltip do FAB continua "JimmyChat"
- [x] CA5 — `npx tsc --noEmit` exit 0 + `npm run build` exit 0

## Arquitetura

Mudança 1-line:

```diff
- import { Sparkles } from "lucide-react";
+ import { Bot } from "lucide-react";

  ...

- <Sparkles className="h-6 w-6" />
+ <Bot className="h-6 w-6" />
```

## Reuso explícito

- `Bot` já é importado em `Layout.tsx` (lucide-react) — sem nova dependência
- Estilo do FAB (cor, posição, tamanho) inalterado

## Out of scope

- Trocar ícone da sidebar (mantém Sparkles)
- Animar o robô (futuro: micro-interação no hover)

## Riscos

| Risco | Mitigação |
|---|---|
| Usuário acostumado com Sparkles estranha | Mudança é só visual; tooltip continua igual; release note breve |

---

## Implementação

**Status:** `em-revisao` (entregue junto com STORY-029 no mesmo commit)

**Arquivos alterados:**
- `src/features/jimmychat/components/JimmyChatFAB.tsx` — `Sparkles` → `Bot` no import e no JSX

**Notas:** Mudança incluída na refatoração maior da STORY-029. Sidebar mantém `Sparkles` conforme decisão da story.

---

## QA

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [x] CA1-CA5 validados
- [x] Build sem erros
- [x] Smoke manual: FAB mostra robozinho, click navega pra `/jimmychat` (drawer descontinuado pela STORY-029)

---

## Notas e Decisões

- **Sidebar mantém Sparkles:** decisão consciente — Sparkles é mais "pretty" como item destacado de menu; Bot fica melhor como ação flutuante/conversacional
