---
id: STORY-007
titulo: "Dashboard Central (cards, gráfico de fluxo, feed do agente)"
fase: 1
modulo: M9 Dashboard
status: backlog
prioridade: média
agente_responsavel: ""
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-007 — Dashboard Central

## Contexto

Visão consolidada para quando o usuário quiser ver os números sem conversar. O dashboard complementa o agente — não o substitui. Deve ser rápido, claro e ter atalho permanente para o chat.

## Spec de Referência

- [[00 - Índice]] — Módulo M9
- Repositório: `PROJECT_REQUIREMENTS.md` — Módulo M9

## Critérios de Aceite

- [ ] CA1 — Card: saldo líquido do mês (entradas − saídas)
- [ ] CA2 — Card: total de gastos do mês atual vs mês anterior
- [ ] CA3 — Card: progresso do orçamento geral (% do total gasto vs total planejado)
- [ ] CA4 — Gráfico de barras: fluxo de caixa dos últimos 6 meses (entradas vs saídas por mês)
- [ ] CA5 — Feed do agente: últimos 3 insights ou alertas gerados (leitura, não interação)
- [ ] CA6 — Atalho fixo e visível para abrir o chat com o agente
- [ ] CA7 — Loading skeleton em todos os cards enquanto dados carregam
- [ ] CA8 — Error state com retry em todos os cards (falha isolada não quebra o dashboard inteiro)
- [ ] CA9 — Dados do dashboard buscados via TanStack Query com cache de 5 minutos
- [ ] CA10 — Responsivo: funciona em mobile (viewport mínimo 375px)

---

## Implementação

> ⚠️ Preenchido pelo `@dev` após concluir.

**Status:**
**Branch/PR:**
**Arquivos alterados:**
-

---

## QA

> ⚠️ Preenchido pelo `@qa`.

**Gate:**
**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Loading skeleton presente em todos os cards
- [ ] Error state com retry testado (simular falha de rede)
- [ ] LCP < 2.5s medido com Lighthouse
- [ ] Testado em viewport 375px (iPhone SE)

**Notas QA:**

---

## Notas e Decisões

- Dashboard é leitura pura — nenhuma escrita acontece nesta feature
- Cálculos financeiros (saldo, totais) feitos no backend via view ou Edge Function
- Feed do agente: leitura da tabela `messages` filtrando role = 'assistant' dos últimos dias
