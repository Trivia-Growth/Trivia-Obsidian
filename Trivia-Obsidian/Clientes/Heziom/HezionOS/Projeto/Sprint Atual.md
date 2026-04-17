---
tags: [projeto, sprint]
sprint: 1
inicio: 2026-04-16
fim: ""
objetivo: "Infraestrutura + sync básico Literarius → Supabase"
---

# Sprint 1 — Infraestrutura e Sync Base

**Período:** A definir
**Objetivo:** Ter a base técnica no lugar e os primeiros dados fluindo do Literarius para o Supabase.

---

## Stories do Sprint

| Story | Status | Agente |
|-------|--------|--------|
| [[STORY-001 — Setup Infraestrutura]] | pronto | — |
| [[STORY-002 — Deno Sync TituloFinanceiro e ContaBancaria]] | backlog | — |
| [[STORY-003 — Deno Sync NotaFiscal e PedidoVenda]] | backlog | — |

---

## Critério de conclusão do sprint

- [ ] Supabase com dados reais do Literarius (mínimo últimos 90 dias)
- [ ] Script Deno rodando automaticamente a cada 15 min na rede da Heziom
- [ ] Repositório `heziom-os-app` no GitHub com deploy automático no Netlify
- [ ] João consegue acessar o vault Obsidian e ver as mudanças sem usar terminal

---

## Impedimentos

> Liste aqui qualquer bloqueador que esteja impedindo o progresso.

- Aguardando definição da máquina que rodará o Deno sync na rede da Heziom
- Aguardando confirmação de credenciais do Supabase

---

## Próximo Sprint (previsão)

Sprint 2 — Dashboard CEO (STORY-004 e STORY-005)
