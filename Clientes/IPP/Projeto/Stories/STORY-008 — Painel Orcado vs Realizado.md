---
id: STORY-008
titulo: "Painel Orçado vs. Realizado"
fase: 1
modulo: painel
status: em-review
prioridade: média
agente_responsavel: "@dev"
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

- [x] Por departamento e ano: orçado, realizado, saldo, % consumido
- [x] Realizado (MVP) = soma das solicitações `pagas` do departamento no ano
- [x] Cálculo no backend: RPC `painel_orcado_realizado(ano)`; frontend só exibe
- [x] **Painel do líder:** vê só os seus departamentos (cards: verba + barra)
- [x] **Administração do financeiro:** consolidado de todos, agrupado por Ministérios/Sociedades, com orçado/realizado/saldo/% e barra
- [x] **Destaque de estouro:** >100% em vermelho; cards de topo (orçado, realizado, % geral, nº acima)
- [ ] ~~Linha clicável → extrato~~ (adiado — drill-down fica para depois)
- [ ] ~~Visão mensal~~ (adiado — MVP entrega o anual; mensal é evolução)
- [x] Estados de loading/erro/sem dados

## Implementação

**Commit:** `3377268` · **Migration:** `supabase/migrations/20260610170000_painel.sql`.

- **RPC `painel_orcado_realizado` SECURITY INVOKER**: respeita RLS, então a *mesma* função serve líder (só seus deptos) e financeiro/admin (todos). Realizado = `sum(valor_total)` das solicitações `paga` no ano.
- Frontend: `features/painel` — painel `/` role-aware (cards p/ líder; consolidado p/ financeiro com destaque de estouro). Substitui o dashboard placeholder.

## Verificação

- [x] Realizado real das pagas (UMP 5.000 = 3%; Recepção 25.000 = **133% em vermelho**, saldo negativo)
- [x] Financeiro vê todos + totais (R$ 2.680.551 orçado · R$ 30.000 realizado); líder vê só os 2 dele
- [x] Estouro destacado em vermelho; testado com dados reais e removidos

## Dependências

STORY-003, STORY-004, STORY-006.

## Notas

Estrutura pronta para, na Fase 2, somar os lançamentos do Prover não conciliados. Drill-down por departamento e visão mensal ficam como evolução.
