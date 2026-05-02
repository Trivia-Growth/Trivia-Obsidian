---
id: STORY-028
titulo: "Trocar ícone do FAB do JimmyChat de Sparkles para Bot"
fase: 3
modulo: jimmy-jimmychat
status: pronto
prioridade: baixa
origem: claude
agente_responsavel: ""
criado: 2026-05-02
atualizado: 2026-05-02
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

- [ ] CA1 — `JimmyChatFAB.tsx` importa `Bot` de `lucide-react` em vez de `Sparkles`
- [ ] CA2 — Renderiza `<Bot className="h-6 w-6" />` no FAB
- [ ] CA3 — Atalho da sidebar (Layout.tsx) **continua** usando `Sparkles` (decisão: o ícone da sidebar é decorativo de "ferramenta principal" — Bot ficaria poluído quando aparece como primeiro item da lista; manter Sparkles preserva hierarquia visual)
- [ ] CA4 — Tooltip do FAB continua "JimmyChat"
- [ ] CA5 — `npx tsc --noEmit` exit 0 + `npm run build` exit 0

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

> Preenchido pelo `@dev`.

**Status:** `pronto`
**Branch/PR:**
**Arquivos alterados:**
**Notas:**

---

## QA

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] CA1-CA5 validados
- [ ] Build sem erros
- [ ] Smoke manual: FAB mostra robozinho, click ainda abre o chat (drawer ou página, dependendo de STORY-029)

---

## Notas e Decisões

- **Sidebar mantém Sparkles:** decisão consciente — Sparkles é mais "pretty" como item destacado de menu; Bot fica melhor como ação flutuante/conversacional
