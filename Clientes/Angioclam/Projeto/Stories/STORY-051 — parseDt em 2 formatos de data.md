---
id: STORY-051
titulo: "parseDt aceita DD/MM/AAAA além de ISO"
fase: 5
modulo: "motor"
status: pronto
prioridade: alta
agente_responsavel: "claude"
criado: 2026-05-19
atualizado: 2026-05-19
---

# STORY-051 — Datas em 2 formatos no parseDt

## Contexto

Os arquivos da Bradesco vêm com datas em `DD/MM/AAAA` (xls) e
`AAAA-MM-DD HH:MM:SS` (csv). O `parseDt` atual só entende ISO.

## Critérios de Aceite

- [ ] CA1 — aceita `DD/MM/AAAA` e `DD/MM/AAAA HH:MM`
- [ ] CA2 — caminho ISO **inalterado**
- [ ] CA3 — período (min/max) correto com formatos mistos no mesmo lote
- [ ] CA4 — paridade SulAmérica intacta

## Implementação

**Status:** `pronto`
