---
id: STORY-011
titulo: "Inteligência Proativa (detecção de padrões, revisão mensal, score de decisão)"
fase: 2
modulo: M10 Proativo
status: backlog
prioridade: média
agente_responsavel: ""
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-011 — Inteligência Proativa

## Contexto

O que diferencia o FamilyOS de um chatbot genérico: o agente age antes de ser chamado. Detecta padrões de gasto anômalos, conduz revisão mensal guiada no 1º dia útil do mês, e avalia impacto de compras grandes antes de acontecerem.

## Spec de Referência

- [[00 - Índice]] — Módulo M10
- Repositório: `PROJECT_REQUIREMENTS.md` — Módulo M10
- Repositório: `specs/technical/BUSINESS_LOGIC.md` — Gatilhos de proatividade

## Critérios de Aceite

> *(A detalhar ao final da Fase 1)*

- [ ] CA1 — Detecção de padrões: análise semanal (pg_cron) sinaliza gastos com desvio > 2σ da média histórica
- [ ] CA2 — Revisão Mensal Guiada: pg_cron no 1º dia útil do mês inicia sessão estruturada no WhatsApp/web
- [ ] CA3 — Score de Decisão: usuário descreve compra → agente avalia impacto nas metas e sugere alternativas
- [ ] CA4 — Pergunta da Semana: toda segunda-feira, agente envia pergunta provocativa de reflexão financeira
- [ ] CA5 — Score de Saúde Financeira: calculado mensalmente (algoritmo documentado em `BUSINESS_LOGIC.md`)

---

## Notas e Decisões

- Proatividade "calibrada" — usuário configura quais alertas quer receber
- pg_cron para tarefas agendadas, não cron externo
