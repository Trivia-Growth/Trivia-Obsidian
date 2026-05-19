---
id: STORY-050
titulo: "Multi-arquivo por slot + formatos (.csv ;/, .xlsx .xls binário .xls=HTML)"
fase: 5
modulo: "motor/report"
status: concluida
prioridade: alta
agente_responsavel: "claude"
criado: 2026-05-19
atualizado: 2026-05-19
---

# STORY-050 — Multi-arquivo por slot + formatos

## Contexto

Devolutiva do Sergio: a Bradesco manda vários arquivos por tipo (B1:5, B2:5,
B3:3) misturando `.csv` (`;`) e `.xls` que são HTML (Excel "salvar como página
web"). O sistema só aceita 1 arquivo por slot e 1 formato.

## Spec de Referência

- [[Clientes/Angioclam/Sistema/23 - Robustez de Volume e N Planilhas]]
- Arquivos: `Clientes/Angioclam/Sistema/Arquivos Bradesco`

## Critérios de Aceite

- [ ] CA1 — UploadArea aceita múltiplos arquivos por B1/B2/B3 e lista-os
- [ ] CA2 — `parseArquivo` sniffa: PK/OLE→xlsx; `<table>`→HTML; senão CSV com
  detecção de delimitador (`;`/`,`); registros por cabeçalho (ordem irrelevante)
- [ ] CA3 — concatenação por slot; integridade forte por arquivo CSV, contagem
  para xls/html; QA lista arquivos + totais
- [ ] CA4 — **paridade SulAmérica intacta** (gate parity/motor-core/params)

## Implementação

**Status:** `concluida` (Fase 5 entregue em 2026-05-19)

## QA

**Gate:** —
