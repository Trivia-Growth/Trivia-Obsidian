---
id: STORY-001
titulo: "Fix ChatModal boot sequence — undefined em bootLines"
fase: 1
modulo: "Landing / ChatModal"
status: pronto
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-04-24
atualizado: 2026-04-24
---

# STORY-001 — Fix ChatModal boot sequence

## Contexto

Ao clicar em "Abrir o terminal" na landing page, o componente `ChatModal` lança `TypeError: undefined is not an object (evaluating 'l.startsWith')` na linha 320.

O functional updater `(l) => [...l, seq[i]]` captura `i` por referência — em React concurrent mode o updater executa após `i` já ter sido incrementado, acessando `seq[i]` fora dos limites e empurrando `undefined` para `bootLines`.

## Critérios de Aceite

- [ ] CA1 — Clicar em "Abrir o terminal" não lança erro
- [ ] CA2 — Animação de boot exibe 6 linhas corretamente
- [ ] CA3 — Transição para `stage: "identity"` ocorre normalmente
- [ ] CA4 — `npm run build` e `npm run typecheck` passam

---

## Implementação

**Status:** `pronto`

**Diff:** `src/components/landing/ChatModal.tsx` ~linha 70
```diff
- setBootLines((l) => [...l, seq[i]]);
+ const line = seq[i];
+ setBootLines((l) => [...l, line]);
```

---

## QA

**Gate:** —

---

## Notas e Decisões

- Bug descoberto durante sessão de testes locais em 2026-04-24
- Fix revertido para seguir fluxo correto @sm → @dev → @qa
