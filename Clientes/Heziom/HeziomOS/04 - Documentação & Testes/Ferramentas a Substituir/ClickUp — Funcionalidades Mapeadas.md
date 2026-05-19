---
tags: [heziom, clickup, substituição, funcionalidades]
status: documentado
criado: 2026-05-19
fonte: developer.clickup.com + clickup.com/features
módulo-substituto: Tarefas e Projetos + Editorial Pipeline
---

# ClickUp — Funcionalidades Mapeadas

> Inventário completo das funcionalidades do ClickUp usadas pela Heziom, para garantir que o módulo de Tarefas do HeziomOS replique tudo o que é necessário.
> O ClickUp será substituído pelo módulo [[Tarefas e Projetos]] + [[Pipeline Editorial]].

---

## Uso atual na Heziom

| Departamento | Como usa | Volume |
|---|---|---|
| Financeiro | Board de tarefas | 530+ tarefas acumuladas |
| Editorial | Kanban de produção (9 etapas) | ~12 obras simultâneas |
| Comercial | Comunicação pedido → expedição | ~150 pedidos/mês |
| Marketing | Hub de lançamento (materiais) | Por obra |
| Todos | Avisos inter-departamentais | Diário |

**Dores identificadas:** board genérico, sem inteligência de processo, avisos manuais entre departamentos, acúmulo de tarefas sem priorização automática.

---

## Funcionalidades Completas do ClickUp

### 1. Gestão de Tarefas e Projetos

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Tasks com assignees, due dates, prioridades | ✅ Sim | Alta |
| Subtasks (até 7 níveis) | ⚠️ 2 níveis suficientes | Média |
| Multiple assignees | ✅ Sim | Média |
| Custom task statuses (workflow stages) | ✅ Sim (colunas do kanban) | Alta |
| Custom task types (bug, lead, etc.) | ✅ Sim (por departamento) | Alta |
| Task tags | ✅ Sim | Média |
| Task checklists | ✅ Sim | Média |
| Task templates | ✅ Sim (cross-triggers geram via template) | Alta |
| Task relationships & dependencies | ✅ Sim (editorial: etapas sequenciais) | Alta |
| Recurring tasks | ✅ Sim (financeiro: tarefas mensais) | Alta |

### 2. Views (15+ no ClickUp)

| View | HeziomOS precisa? | Prioridade |
|---|---|---|
| Kanban Board | ✅ Sim (principal) | Alta |
| List View | ✅ Sim | Alta |
| Calendar | ⚠️ Nice-to-have (editorial calendário separado) | Baixa |
| Table View | ✅ Sim (financeiro, bulk edit) | Média |
| Gantt Chart | ❌ Não (editorial usa prazo calculado, não Gantt) | — |
| Workload View | ⚠️ Fase futura (gestão de pessoas) | Baixa |
| Whiteboards / Mind Maps | ❌ Não | — |

### 3. Organização Hierárquica

| Conceito ClickUp | Equivalente HeziomOS |
|---|---|
| Workspace | HeziomOS (instância única) |
| Space | Departamento |
| Folder | Categoria dentro do departamento |
| List | Board/Pipeline |
| Task | Tarefa |

### 4. Goals e Sprints

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Goals (OKRs) | ⚠️ Fase futura (Pessoas e Gestão) | Baixa |
| Sprints | ✅ Sim (editorial usa sprints pessoais) | Média |
| Milestones | ✅ Sim (editorial: etapas do fluxo) | Alta |

### 5. Time Tracking

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Built-in timer | ❌ Não (Heziom não faz timesheet) | — |
| Time estimates | ⚠️ Editorial usa prazo calculado (laudas/dia) | Média |

### 6. Documentação

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Docs colaborativos | ❌ Não (OneDrive permanece) | — |
| Wikis | ❌ Não | — |
| Notepad | ❌ Não | — |

### 7. Colaboração

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Comments em tasks | ✅ Sim | Alta |
| Assign comments (→ action items) | ✅ Sim | Média |
| Notifications | ✅ Sim (alertas e cross-triggers) | Alta |
| Forms (público → cria task) | ⚠️ Nice-to-have | Baixa |
| Permissions / Custom Roles | ✅ Sim (RLS Supabase) | Alta |

### 8. Automações

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Trigger → Action rules | ✅ Sim (cross-department triggers) | Alta |
| When status changes → notify | ✅ Sim | Alta |
| When due date arrives → alert | ✅ Sim | Alta |
| Auto-assign based on rules | ✅ Sim | Média |
| Automations via webhooks | ✅ Sim (eventos internos) | Alta |

### 9. Custom Fields

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Dropdown, text, number, currency | ✅ Sim (configurável por board) | Alta |
| Formula fields | ⚠️ Nice-to-have (editorial calcula via motor) | Baixa |
| Rollup fields | ❌ Não (dashboard resolve) | — |

### 10. Reporting / Dashboards

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Task dashboards | ✅ Sim (visão CEO consolidada) | Alta |
| Custom widgets | ✅ Sim (CEO Dashboard já cobre) | Alta |

### 11. Integrações

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Webhooks (inbound/outbound) | ✅ Sim (Edge Functions) | Alta |
| REST API | ✅ Sim (Supabase auto-generated) | Alta |
| Slack/Teams | ✅ Sim (alertas Teams) | Média |

---

## O que o HeziomOS NÃO precisa replicar do ClickUp

- Whiteboards, Mind Maps, Canvas
- Docs/Wikis (OneDrive permanece)
- Time Tracking / Timesheets
- Gantt Charts
- Map View
- 1000+ integrations genéricas
- AI Brain / Super Agents (HeziomOS tem seu próprio assistente)
- Video clips / Screen recording

---

## O que o HeziomOS faz MELHOR que o ClickUp

| Capacidade | ClickUp | HeziomOS |
|---|---|---|
| Cross-department triggers | Manual (notify) | Automático (evento → tarefa) |
| Dados financeiros na tarefa | Não existe | Integrado (mesmo banco) |
| Alertas inteligentes | Genérico | Contextual (sabe sobre prazos editoriais, vencimentos) |
| Pipeline editorial com motor de custo/prazo | Impossível | Nativo (cálculo por lauda) |
| Tarefas geradas por eventos de negócio | Não | Sim (pedido → separa; NF → confere) |

---

## API do ClickUp (para migração de dados)

**Base URL:** `https://api.clickup.com/api/v2/`
**Auth:** OAuth 2.0 ou Personal API Token
**Doc:** `developer.clickup.com/reference/getaccesstoken`

Endpoints relevantes para extração:

```
GET /team/{team_id}/space          → Espaços (departamentos)
GET /space/{space_id}/folder       → Pastas
GET /folder/{folder_id}/list       → Listas (boards)
GET /list/{list_id}/task           → Tarefas
GET /task/{task_id}                → Tarefa individual com custom fields
GET /task/{task_id}/comment        → Comentários
GET /list/{list_id}/member         → Membros
```

**Plano de migração:**
1. Extrair todas as tarefas ativas do ClickUp via API
2. Mapear para a estrutura HeziomOS (`tasks` table)
3. Preservar histórico de comentários
4. Descartar tarefas concluídas antigas (ou arquivar)
5. Configurar cross-triggers que substituem os avisos manuais

---

*Documentado em 2026-05-19 — para referência durante desenvolvimento do módulo Tarefas*
