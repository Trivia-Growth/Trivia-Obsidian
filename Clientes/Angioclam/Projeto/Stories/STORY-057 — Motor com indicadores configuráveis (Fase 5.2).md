---
id: STORY-057
titulo: "Motor com indicadores configuráveis (Fase 5.2 — diferida)"
fase: 5
modulo: "motor"
status: concluida
prioridade: média
agente_responsavel: ""
criado: 2026-05-19
atualizado: 2026-05-19
---

# STORY-057 — Indicadores configuráveis (DIFERIDA)

## Contexto

Sergio quer, no futuro, que um exame novo gere um indicador novo no relatório
(slide + cálculo), não só um valor editável. JG decidiu fasear: STORY-055
entrega os valores editáveis agora; esta story é a evolução do motor.

## Escopo (a planejar à parte)

Generalizar `calcularKpis`/`buildHtml` para indicadores definidos por dados
(par exame-base → exame-evitado, benchmark, custo, textos), preservando os 5
indicadores atuais como configuração default e a paridade.

## Critérios de Aceite (rascunho)

- [ ] CA1 — modelo de "definição de indicador" (persistido por operadora)
- [ ] CA2 — motor itera indicadores configurados (5 atuais = seed)
- [ ] CA3 — relatório renderiza slides dinamicamente
- [ ] CA4 — paridade SulAmérica intacta com a config default

## Implementação

**Status:** `concluida` (2026-05-19) — abordagem aditiva: os 5 fixos + consolidado travado intocados; indicadores extras opcionais por operadora (calcularExtras pós-calcularKpis, migration aditiva indicadores_extra jsonb default []), CRUD na ParametersPage, slides dinâmicos no buildHtml, recompute-report recalcula. 75 testes verdes (gate de paridade = no-op comprovado). Commits 2428a38 (057-A) + e1fc3ab (057-B); db push + functions deploy. Exame-base inédito (recontar dados) segue diferido.
