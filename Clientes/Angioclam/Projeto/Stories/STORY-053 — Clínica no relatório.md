---
id: STORY-053
titulo: "Clínica no relatório (seleção + capa/CNPJ)"
fase: 5
modulo: "report"
status: pronto
prioridade: alta
agente_responsavel: "claude"
criado: 2026-05-19
atualizado: 2026-05-19
---

# STORY-053 — Clínica no relatório

## Contexto

Cada lote de planilhas é de uma clínica. O relatório deve ser rotulado com a
clínica escolhida (nome + CNPJ) no lugar do "Angioclam" hardcoded.

## Critérios de Aceite

- [ ] CA1 — dropdown de clínica na área de upload do relatório
- [ ] CA2 — `clinica {nome,cnpj}` entra no `AggregadoBruto`→`Kpis` (PII-free)
- [ ] CA3 — `buildHtml` usa o nome da clínica no lugar de "Angioclam" + CNPJ na
  capa (fallback "Angioclam" quando ausente)
- [ ] CA4 — `recompute-report` valida/persiste `clinica_id`
- [ ] CA5 — paridade SulAmérica intacta

## Implementação

**Status:** `pronto`
