---
id: STORY-001
titulo: "Fix ChatModal boot sequence — undefined em bootLines"
fase: 1
modulo: "Landing / ChatModal"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-04-24
atualizado: 2026-04-25
---

# STORY-001 — Fix ChatModal boot sequence

## Contexto

Ao clicar em "Abrir o terminal" na landing page, o componente `ChatModal` lançava `TypeError: undefined is not an object (evaluating 'l.startsWith')`. O functional updater `(l) => [...l, seq[i]]` capturava `i` por referência — em React concurrent mode o updater executa após `i` já ter sido incrementado, acessando `seq[i]` fora dos limites.

## Solução

Capturar o valor de `seq[i]` antes do updater evita o stale closure.

**Arquivo:** `src/components/landing/ChatModal.tsx`

```diff
- setBootLines((l) => [...l, seq[i]]);
+ const line = seq[i];
+ setBootLines((l) => [...l, line]);
```

## Status

**Concluído** — deploy em produção 2026-04-25.
