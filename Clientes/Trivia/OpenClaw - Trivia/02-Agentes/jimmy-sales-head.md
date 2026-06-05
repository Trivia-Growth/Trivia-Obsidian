---
title: Agente — jimmy-sales-head
tags: [agente, vendas, pipeline, coaching, julia]
created: 2026-04-17
updated: 2026-06-05
aliases: [sales-head]
---

# jimmy-sales-head

**Papel:** Head de Vendas BU Jimmy Studio — pipeline, coaching diário da Julia, roleplay.
**Workspace:** `/root/.openclaw/workspace-jimmy-sales-head`
**Agent dir:** `/root/.openclaw/agents/jimmy-sales-head/agent`
**Modelo:** `openrouter/anthropic/claude-sonnet-4-6`
**Identidade:** `Jimmy` 📊
**Tools extras:** `alsoAllow: ["exec"]`
**CRM:** JimmyAtende (reports-api)

## Quatro eixos de atuação

1. **Monitoramento diário** — pipeline, leads sem resposta, deals estagnados
2. **Coaching proativo** — relatório 07h no grupo Julia+Trívia (analítico ou prescritivo)
3. **Treinamento / roleplay** — desempenho Julia no JimmyAtende, cobrança diária de treino
4. **Atuação reativa horária** — rotina silenciosa que cobra só se houver crítico

## Crons ativos

| Cron | Schedule (BRT) | Destino |
|------|---------------|---------|
| `sales-head-resumo-julia-07h` | 07h seg-sex | Grupo Julia+Trívia (analítico ou prescritivo) |
| `sales-head-julia-rotina-horaria` | 10h, 14h, 17h seg-sex | Mesma sala — só cobra se houver deal stale ≥5d, overdue ou lead novo sem atividade 48h |

A rotina horária responde apenas `HEARTBEAT_OK` quando nada crítico. Reintrodução escopada (a antiga `sales-head-rotina-horaria` tinha custo alto sem retorno proporcional).

## Grupo Teams atendido

| Grupo | ID |
|-------|----|
| Julia + Trívia (vendas) | `19:d319b12ccd2d4f409deb1f2f138ba530@thread.v2` |

## Fonte de dados

**Consolidador único:** `node /root/.openclaw/workspace/tools/sales-daily-data.js`

Chama 9 endpoints em paralelo e retorna JSON ~11KB com:
- `julia.user_id` + `julia.performance`
- `kpis` — conversas ativas, deals abertos, meetings
- `pipeline` — stages, stale deals, totals
- `overdue[]` — follow-ups vencidos (até 15)
- `recent_messages[]` — últimas 24h (até 20)
- `quality` — avg_score + amostras recentes
- `roleplay` — last_session, week_summary, pending_yesterday

Ver detalhes em [[JimmyAtende-API]].

## Lógica do relatório 07h

### Tom adaptativo
**PRESCRITIVO** (coach direto) quando QUALQUER um destes for verdadeiro:
- `overdue.length > 0`
- `roleplay.pending_yesterday === true`
- Deal em "Em Negociação" ou "Demo Realizada/Proposta Enviada" parado ≥5 dias
- `quality.avg_score < 6`

**ANALÍTICO** (padrão) quando nenhum disparador ativo.

### Regras de roleplay
1. `pending_yesterday = true` → Alerta + Prioridade 1 prescritiva antes das 11h
2. `pending_yesterday = false` + `last_session.score < 70` → linha extra "Ponto a reforçar"
3. `last_session = null` → "Nenhum treino nos últimos 7 dias" + Alerta
4. Fez treino ontem → "Status: novo treino pendente" (sempre cobrar 1/dia)

## Template canônico

```
**Relatório diário — DD/MM (<dia da semana>)**

**Pipeline resumido**
**Conversas (últimas 24h)**
**Follow-ups pendentes**
**Deals em foco hoje**
**Treinamento (roleplay JimmyAtende)**
**Alertas**          ← só se houver item vermelho
**Prioridades sugeridas para o dia**
```

## Skills

| Skill | Função |
|-------|--------|
| `relatorio-diario-julia` | Template + regras completas do 07h |
| `crm-api` | Mapa dos 19 endpoints + lead-intake |
| `vendas-reuniao` | Análise de reunião sob demanda |
| `analise-reuniao` | Estrutura analítica de avaliação |
| `vendas-posicionamento` | Frameworks de posicionamento Jimmy Studio |
| `vendas-objecoes` | Catálogo de objeções + respostas |

## Arquivos principais

- `AGENTS.md` — papel + dois modos (analítico/consultivo) + formato de resposta
- `BOOTSTRAP.md` — boot via `sales-daily-data.js`
- `TOOLS.md` — referência de ferramentas e endpoints
- `tools/memory-rotate.cjs` — rotação semanal do MEMORY.md (dom 00h BRT)

## Histórico

- Coach diário implementado em 17/04/2026 — ver [[2026-04-17-Sales-Head-Coach]]
- Rotina horária reintroduzida em 04/2026 com escopo enxuto (3x/dia, HEARTBEAT_OK quando inócuo)
