---
id: STORY-006
titulo: "Acessibilidade — contraste, ARIA, foco, leitor de tela"
fase: 2
modulo: "ui"
status: backlog
prioridade: media
agente_responsavel: "@dev"
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-006 — Acessibilidade

## Contexto

O site precisa atender WCAG AA para garantir acesso a todos os usuarios e melhorar score de acessibilidade no Lighthouse. A CSS ja contempla `prefers-reduced-motion` mas precisa auditoria completa.

## Spec de Referencia

- Plano: `PLANO-EXECUCAO.md` item 6

## Criterios de Aceite

- [ ] CA1 — Contraste WCAG AA em todos os pares texto/fundo (validar com WebAIM)
- [ ] CA2 — `prefers-reduced-motion` respeitado em todas as animacoes
- [ ] CA3 — `:focus-visible` com outline visivel em todos os elementos interativos
- [ ] CA4 — `aria-current="page"` no link ativo do menu
- [ ] CA5 — `aria-expanded` no hamburger mobile
- [ ] CA6 — `aria-label` em landmarks (nav, main, footer)
- [ ] CA7 — 1 `<h1>` por pagina, hierarquia sem pular niveis
- [ ] CA8 — Alt text em todas as imagens
- [ ] CA9 — Briefing navegavel por teclado (Tab entre steps, Enter para avancar)
- [ ] CA10 — Teste com VoiceOver: navegacao completa pelo briefing

---

## Implementacao

**Status:** `backlog`

**Branch/PR:**

**Arquivos alterados:**
-

**Notas de implementacao:**

---

## QA

**Gate:**

**Checklist:**
- [ ] Criterios de aceite validados
- [ ] axe-core sem violacoes criticas
- [ ] Lighthouse Accessibility >= 95
- [ ] Teste manual com VoiceOver concluido

**Notas:**

---

## Notas e Decisoes

- Foco visivel ja usa `outline: 2px solid var(--yellow)` nos inputs do briefing
- Priorizar correcoes que bloqueiam Lighthouse score
