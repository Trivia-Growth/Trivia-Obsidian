---
id: STORY-009
titulo: "Investimentos (cadastro manual, dashboard, análise pelo agente, simulador)"
fase: 2
modulo: M5 Investimentos
status: backlog
prioridade: alta
agente_responsavel: ""
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-009 — Investimentos

## Contexto

Cadastro manual de posições de investimento, dashboard com alocação por classe e liquidez, análise pelo agente (diversificação, concentração, alinhamento com perfil de risco) e simulador de aportes.

## Spec de Referência

- [[00 - Índice]] — Módulo M5
- Repositório: `PROJECT_REQUIREMENTS.md` — Módulo M5
- Repositório: `specs/technical/BUSINESS_LOGIC.md` — Rentabilidade de investimentos

## Critérios de Aceite

> *(A detalhar ao final da Fase 1)*

- [ ] CA1 — Tipos suportados: CDB, LCI, LCA, Tesouro, FIIs, Ações, BTC, Fundos
- [ ] CA2 — Dashboard: alocação por classe, por liquidez, rentabilidade vs CDI/IPCA/IBOV
- [ ] CA3 — Análise pelo agente: diversificação, concentração, alinhamento com perfil de risco salvo na memória
- [ ] CA4 — Simulador: "quanto terei em 5 anos investindo R$ 1.000/mês a 12% a.a.?"
- [ ] CA5 — Alertas de vencimento de renda fixa (30 dias antes)
- [ ] CA6 — Tool `get_portfolio_summary` para o agente

---

## Notas e Decisões

- Integração com corretoras via Open Finance é Fase 3 — Fase 2 é cadastro manual
- Dados de mercado (CDI, IPCA, IBOV) via tool de web search do agente
