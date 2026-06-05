---
title: "17/04/2026 — Sales Head: Coach Diário da Julia"
tags: [decisao, sales-head, julia, roleplay, cron]
created: 2026-04-17
---

# Sales Head — Coach Diário da Julia

## Contexto

O `jimmy-sales-head` operava 100% reativamente. Os dois crons existentes foram removidos em 14/04 por custo. Objetivo: transformar o agente em coach/analista diário da Julia, consultando o JimmyAtende (com módulo de roleplay recém-lançado) e entregando um relatório todo dia útil às 07h no grupo Teams Julia+Trívia.

## Decisões

| Item | Decisão |
|------|---------|
| Fonte de dados | JimmyAtende via consolidador único (`sales-daily-data.js`) |
| Destino | Grupo Teams Julia+Trívia (`19:d319b12ccd2d4f409deb1f2f138ba530@thread.v2`) |
| Tom | Híbrido adaptativo — analítico por padrão, prescritivo em alerta vermelho |
| Roleplay | Integração dupla: desempenho no relatório + Prioridade 1 se pulou o dia anterior |
| Cadência roleplay | 1 sessão por dia útil |
| Crons não reintroduzidos | `sales-head-analise-transcricoes`, `sales-head-rotina-horaria` |
| Custo esperado | ~$5-10/mês |

## O que foi implementado

| Entregável | Arquivo |
|-----------|---------|
| Consolidador de dados | `/root/.openclaw/workspace/tools/sales-daily-data.js` |
| Skill canônica | `workspace-jimmy-sales-head/skills/relatorio-diario-julia/SKILL.md` |
| Skill CRM API | `workspace-jimmy-sales-head/skills/crm-api/SKILL.md` (reescrita, 19 endpoints) |
| AGENTS.md | seção "Relatório Diário Julia às 07h" adicionada |
| BOOTSTRAP.md | passo 4 atualizado para `sales-daily-data.js` |
| TOOLS.md | consolidador oficial + endpoints documentados |
| memory-rotate.cjs | rotação semanal (dom 00h BRT) |
| Cron 07h | `6dcf3cc2-18c5-499d-ab6c-cec71665a803`, ativado 17/04 |

## Bugs corrigidos durante E2E

| Bug | Causa | Fix |
|-----|-------|-----|
| `kpis` vazio | Dashboard retorna campos aninhados (`conversations.active`); código procurava no topo (`conversations_active`) | Flatten explícito dos campos aninhados |
| `quality` vazio com `date=today` | Endpoint quality sem avaliações feitas hoje; API retorna vazio com filtro de data | Remover `date` do parâmetro da chamada quality |

## Primeiro envio real

17/04/2026 — relatório do dia + mensagem de apresentação enviados manualmente no grupo Julia+Trívia via `teams-proactive.js send`. A partir de 21/04 (segunda-feira), cron dispara automaticamente às 07h BRT.
