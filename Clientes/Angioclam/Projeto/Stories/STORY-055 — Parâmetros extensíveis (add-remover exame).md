---
id: STORY-055
titulo: "Parâmetros extensíveis (adicionar/remover exame)"
fase: 5
modulo: "parameters"
status: pronto
prioridade: alta
agente_responsavel: "claude"
criado: 2026-05-19
atualizado: 2026-05-19
---

# STORY-055 — Parâmetros extensíveis

## Contexto

Sergio: poder acrescentar novos exames (custos Angioclam e benchmark) por
operadora. (Os 5 indicadores do relatório seguem iguais nesta fase —
indicadores configuráveis = STORY-057, diferida.)

## Critérios de Aceite

- [ ] CA1 — ParametersPage: adicionar/remover chave em custos_angioclam,
  custos_evitados e benchmarks (nome do exame + valor)
- [ ] CA2 — persiste no jsonb; `saveParams` versiona + audita
- [ ] CA3 — chave nova não quebra os 5 indicadores (motor mescla sobre defaults)

## Implementação

**Status:** `pronto`
