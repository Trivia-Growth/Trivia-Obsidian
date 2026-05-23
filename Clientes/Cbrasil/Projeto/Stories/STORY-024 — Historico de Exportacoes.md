---
id: STORY-024
titulo: "Historico de Exportacoes (UI)"
fase: 1
modulo: exportacao
status: done
prioridade: média
agente_responsavel: ""
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-024 — Historico de Exportacoes (UI)

## Contexto

A tabela `export_logs` ja registra cada exportacao ODS (periodo, total de
lancamentos, ultimo numero, quem gerou), mas nao ha tela para consultar esse
historico. O contador precisa enxergar as exportacoes feitas e, se necessario,
baixar de novo um arquivo ja gerado.

## Spec de Referencia

- [[GAP-ANALYSIS]] — secao "Historico de Exportacoes"
- Tabela `export_logs` (migration `20260507184000`)

## Criterios de Aceite

- [ ] Tela listando as exportacoes: data, periodo, qtd de lancamentos, quem gerou
- [ ] Re-download do arquivo ODS de uma exportacao anterior
- [ ] (avaliar) Desfazer exportacao — voltar status `exportado` → `revisado`
- [ ] Acesso restrito a `superadmin` / `contador`
- [ ] Loading state e empty state

## Implementacao

> Preenchido pelo `@dev` apos concluir.

## QA

> Preenchido pelo `@qa`.

## Notas e Decisoes

- "Desfazer exportacao" e sensivel — confirmar a regra de negocio com o
  contador antes de implementar.
