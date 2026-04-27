---
id: STORY-004
titulo: "Error boundary com identidade Trívia"
fase: 1
modulo: "Router / UI base"
status: concluido
prioridade: P1
agente_responsavel: "@dev"
criado: 2026-04-24
atualizado: 2026-04-25
---

# STORY-004 — Error boundary com identidade Trívia

## Contexto

Erros não tratados em rotas mostravam a tela padrão do TanStack Router, sem identidade visual da Trívia.

## Solução

Error boundary customizado com design system da Trívia (cores petrol/coral, tipografia, botão de retry). Configurado no `__root.tsx` como `errorComponent`.

## Status

**Concluído** — deploy em produção 2026-04-25.
