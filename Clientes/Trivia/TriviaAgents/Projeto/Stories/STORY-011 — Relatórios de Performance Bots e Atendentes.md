---
id: STORY-011
titulo: "Relatórios de Performance — Bots e Atendentes Humanos"
fase: 2
modulo: "reports"
status: backlog
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-07
atualizado: 2026-06-07
---

# STORY-011 — Relatórios de Performance (Bots e Atendentes)

## Contexto

A plataforma já coleta dados ricos: `conversations` (status, handoff_at, assumed_by, channel_type), `messages` (role, created_at), `token_usage_log` (custo por conversa). Falta uma tela de relatórios que transforme esses dados em inteligência operacional — tanto para avaliar a eficiência dos bots quanto para acompanhar a produtividade dos atendentes humanos.

O objetivo é dar ao gestor uma visão clara de: o bot está resolvendo ou só abrindo ticket? Qual atendente responde mais rápido? Qual canal gera mais volume?

## Critérios de Aceite

### CA1 — Nova rota `/reports` na sidebar
- Item "Relatórios" na sidebar com ícone `BarChart2`
- Acesso para roles: `admin` e `superadmin`

### CA2 — Filtros globais persistidos na URL
- Período: Últimos 7d / 30d / 90d / intervalo custom (date picker)
- Agente: todos ou um específico
- Canal: todos | whatsapp | instagram | facebook

### CA3 — Seção: Visão Geral (KPIs do período)
| Métrica | Fonte |
|---|---|
| Total de conversas abertas | `conversations` |
| Taxa de resolução pelo bot | conversas fechadas sem `handoff_at` / total |
| Taxa de handoff | conversas com `handoff_at` / total |
| Tempo médio de resposta do bot | delta entre mensagem `role=user` → próxima `role=assistant` |
| Custo total (BRL) | `token_usage_log.cost_brl` |

### CA4 — Seção: Performance dos Bots (por agente)
| Métrica | Fonte |
|---|---|
| Conversas atendidas | `conversations.agent_id` |
| Taxa de resolução | fechadas sem handoff / total do agente |
| Taxa de handoff | com handoff / total |
| Tempo médio de resposta | delta user → assistant por agente |
| Mensagens por conversa | avg count messages |
| Custo médio por conversa | `token_usage_log` por agente |
| Volume por canal | group by `channel_type` |
| Volume por dia | série temporal para gráfico de linha |

### CA5 — Seção: Performance dos Atendentes (por usuário)
| Métrica | Fonte |
|---|---|
| Conversas assumidas | `conversations.assumed_by` |
| Tempo médio para assumir | `handoff_at` → primeira msg humana pós-handoff |
| Tempo médio de atendimento | primeira msg humana → `last_message_at` quando fechada |
| Conversas fechadas | assumed_by + status=closed |
| Distribuição por horário | heatmap de mensagens enviadas (hora do dia × dia da semana) |

### CA6 — Gráficos (recharts, já disponível via shadcn/ui)
- Linha: volume de conversas por dia (bot vs handoff vs fechadas)
- Barras: conversas por agente
- Barras horizontais: conversas por atendente
- Pizza/donut: distribuição por canal

### CA7 — Exportação CSV
- Botão "Exportar CSV" em cada seção
- Inclui os mesmos dados da tabela filtrada

## Arquitetura

### Edge Function: `reports`
Query server-side com service_role.
- `GET /reports?section=overview&from=&to=&agent_id=&channel=`
- `GET /reports?section=bots&...`
- `GET /reports?section=attendants&...`

### Frontend: nova feature `reports/`
```
src/features/reports/
├── api/useReports.ts
├── components/
│   ├── ReportFilters.tsx
│   ├── OverviewSection.tsx
│   ├── BotPerformance.tsx
│   ├── AttendantPerformance.tsx
│   └── ExportButton.tsx
└── utils/csv.ts
```

---

## Implementação

**Status:** `backlog`

**Branch/PR:**

**Arquivos a criar:**
- `supabase/functions/reports/index.ts`
- `src/features/reports/` (estrutura acima)
- `src/routes/_app/reports.tsx`

**Notas de implementação:**

---

## QA

**Gate:** pendente

**Checklist:**
- [ ] CA1–CA7 validados
- [ ] Filtros funcionando (período, agente, canal)
- [ ] Métricas batem com contagem manual no banco
- [ ] Gráficos com dados reais e com zero dados (empty state)
- [ ] Exportação CSV correta
- [ ] `supabase functions deploy reports` executado
- [ ] Acesso restrito a admin/superadmin
- [ ] TypeScript strict, sem `any`
