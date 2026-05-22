---
id: STORY-025
titulo: "Paginacao das Listas de Lancamentos"
fase: 1
modulo: transacoes
status: backlog
prioridade: baixa
agente_responsavel: ""
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-025 — Paginacao das Listas de Lancamentos

## Contexto

A listagem de lancamentos (`getTransactions`) usa `.limit(50)` fixo — so mostra
os 50 mais recentes. Com o piloto IPP ja em 408 lancamentos, o cliente nao
consegue ver o historico completo pela tela de Lancamentos.

## Spec de Referencia

- [[GAP-ANALYSIS]] — secao "Gestao de Lancamentos > Paginacao real"
- `src/features/transactions/api/transactions.ts` (funcao `getTransactions`)

## Criterios de Aceite

- [ ] Paginacao real na lista de lancamentos (ex.: 50 por pagina, com navegacao)
- [ ] Contagem total de lancamentos exibida
- [ ] Paginacao respeita os filtros ativos (tipo, status, periodo, busca)
- [ ] Loading state ao trocar de pagina

## Implementacao

> Preenchido pelo `@dev` apos concluir.

## QA

> Preenchido pelo `@qa`.

## Notas e Decisoes

- A tela de Extrato (STORY-013) ja tem paginacao — reaproveitar esse padrao.
