---
id: STORY-008
titulo: "Painel Orçado vs. Realizado"
fase: 1
modulo: painel
status: backlog
prioridade: média
agente_responsavel: ""
criado: 2026-06-10
atualizado: 2026-06-10
---

# STORY-008 — Painel Orçado vs. Realizado

## Contexto

O líder precisa enxergar como está a verba do seu departamento ao longo do ano: quanto foi orçado, quanto já foi gasto (realizado) e quanto sobra. No MVP, o realizado é a soma dos reembolsos pagos no sistema (a conciliação com o Prover vem na Fase 2).

## Spec de Referência

- [[Arquitetura e Fluxos]] (seção "Orçado vs. Realizado")
- [[Orçamento 2026]]

## Critérios de Aceite

- [ ] Por departamento e ano: orçado, realizado, saldo, % consumido
- [ ] Realizado (MVP) = soma das solicitações `pagas` do departamento no ano
- [ ] Cálculo no backend (view/Edge Function); frontend só exibe
- [ ] **Painel do líder:** vê só os seus departamentos (verba + barra de consumo)
- [ ] **Administração do financeiro:** consolidado de **todos** os departamentos, agrupado por Ministérios / Sociedades, com orçado/realizado/saldo/% e barra por linha
- [ ] **Destaque de estouro:** departamento acima de 100% do orçado aparece em vermelho; cards de topo mostram total orçado, realizado, % geral e nº acima do orçado
- [ ] Linha do departamento é clicável → abre o extrato/solicitações daquele departamento
- [ ] Visão mensal (orçado mensal × realizado do mês) — orçado é mensal × 12
- [ ] Estados de loading/erro/sem dados

## Dependências

STORY-003, STORY-004, STORY-006.

## Notas

Estrutura preparada para, na Fase 2, somar também os lançamentos do Prover não conciliados.
