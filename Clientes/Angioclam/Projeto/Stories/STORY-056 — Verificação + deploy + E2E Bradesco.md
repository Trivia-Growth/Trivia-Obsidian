---
id: STORY-056
titulo: "Verificação + deploy + E2E Bradesco"
fase: 5
modulo: "qa/devops"
status: pronto
prioridade: alta
agente_responsavel: "claude"
criado: 2026-05-19
atualizado: 2026-05-19
---

# STORY-056 — Verificação + deploy + E2E Bradesco

## Contexto

Fechar a Fase 5: testes, deploy e validação ponta a ponta com os 9 arquivos
reais da Bradesco.

## Critérios de Aceite

- [ ] CA1 — `npm test` (todas verdes, incl. paridade SulAmérica), build, lint
- [ ] CA2 — `supabase db push` (clinicas) + `functions deploy recompute-report`
- [ ] CA3 — E2E Bradesco: subir os 9 arquivos, gerar relatório plausível
  (período, operadora "Bradesco", ~54.962 registros no QA, clínica + logo)
- [ ] CA4 — commit/push + Netlify publicado
- [ ] CA5 — Roadmap/STORYs atualizados

## Implementação

**Status:** `pronto`
