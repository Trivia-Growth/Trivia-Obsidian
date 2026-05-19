---
id: STORY-004
titulo: "Dashboard v2 — insights de atendimento, métricas e volume por status"
fase: 1
modulo: "dashboard"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-12
atualizado: 2026-05-12
---

# STORY-004 — Dashboard v2 — Insights de Atendimento

## Contexto

O dashboard original tinha apenas 4 KPIs básicos (agentes ativos, conversas hoje, handoffs, custo) e um gráfico de tokens. Precisávamos de mais inteligência operacional: taxa de resolução da IA, volume por status, ranking de agentes e contatos únicos.

## Spec de Referência

- Plano executado: `/sessions/260511-bright-laurel/plans/v2-finalizacao.md` (Entrega 3)

## Critérios de Aceite

- [x] CA1 — Segunda linha de KPIs: Taxa de Resolução IA, Contatos Únicos, Agente Mais Ativo
- [x] CA2 — Gráfico de Volume por Status (Ativo / Handoff / Encerrado) com cores distintas
- [x] CA3 — Card Top 5 Agentes nos últimos 7 dias com barra de progresso proporcional
- [x] CA4 — Layout em 4 linhas: KPIs operacionais → KPIs de atendimento → gráficos principais → top agentes + recentes
- [x] CA5 — Auto-refresh mantido a cada 60 segundos

---

## Implementação

**Status:** `concluido`

**Branch/PR:** `main` — commit `351f977`

**Arquivos alterados:**
- `src/features/dashboard/api/useDashboardStats.ts` — novos campos: `uniqueContacts`, `resolutionRate`, `topAgentDisplayName`, `topAgents[]`
- `src/features/dashboard/components/StatusChart.tsx` — novo componente BarChart por status
- `src/features/dashboard/components/TopAgentsCard.tsx` — novo componente ranking agentes
- `src/routes/_app/dashboard.tsx` — layout reestruturado em 4 linhas, gap-8

**Notas de implementação:**
- `resolutionRate` calculado como `encerrado - pendingHandoffs / encerrado` (aproximação conservadora)
- Top agentes via query de `conversations` agrupada por `agent_id` com join `agents(display_name)` — feita no frontend por limitação da API Supabase (sem GROUP BY nativo via JS client)
- `uniqueContacts` conta `Set` de `contact_phone` distintos de todas as conversas

---

## QA

**Gate:** `PASS`

**Checklist:**
- [x] Critérios de aceite validados
- [x] Build sem erros, TypeScript strict
- [x] Loading states em todos os novos componentes (Skeleton)
- [x] Estados vazios tratados (topAgents vazio, sem dados)
- [x] Sem alteração de banco — dados calculados das tabelas existentes

**Notas:** Sem migrations. Apenas frontend. Build limpo.
