# Avaliacao de Arquitetura - Vista Intel Pro (Trivia Tasker)

**Data:** 2026-05-30
**Avaliador:** @architect (Aria) - TRIVIAIOX
**Stack:** React 18 + Vite + TypeScript + Supabase + Tailwind + shadcn-ui + TanStack Query v5
**Status:** Em producao (Netlify)

---

## Resumo Executivo

| Dimensao | Nota (1-5) | Veredicto |
|----------|:----------:|-----------|
| Estrutura de Codigo | 2.5 | Flat structure, sem feature modules |
| Padroes de Dados | 3.5 | React Query bem usado, mas tipagem fraca em pontos criticos |
| Performance | 2.0 | Sem lazy loading, sem virtualizacao, bundle 8MB |
| Escalabilidade | 3.0 | Indexes bons, mas queries pesadas no frontend |
| Manutenibilidade | 2.5 | Componentes gigantes, zero testes, muitos console.log |
| **Media Geral** | **2.7** | **Funcional mas com dividas tecnicas acumuladas** |

---

## 1. Estrutura de Codigo (Nota: 2.5/5)

### Diagnostico

O projeto NAO segue Bulletproof React. A estrutura e flat por tipo de arquivo:

```
src/
  components/     → 50+ subdiretorios por dominio (bom)
  hooks/          → 100+ hooks em pasta unica (ruim - deviam estar nas features)
  contexts/       → 5 contexts globais
  pages/          → 34 paginas
  lib/            → 30 utilidades
  store/          → 1 arquivo (canvasStore.ts - Zustand)
  types/          → 3 arquivos
  integrations/   → Supabase client + types
  utils/          → Utilidades de canvas
```

### Problemas Identificados

**Componentes gigantes (>300 linhas) - 20+ arquivos:**
- `PublicProposal.tsx` — 1.446 linhas
- `WhiteboardCanvas.tsx` — 1.037 linhas
- `TaskGroupedListView.tsx` — 1.033 linhas
- `SpaceListView.tsx` — 1.003 linhas
- `Canvas.tsx` — 990 linhas
- `SpaceSidebar.tsx` — 989 linhas
- `TaskKanbanPhasesView.tsx` — 945 linhas
- `AdminActions.tsx` — 915 linhas
- `CreateProjectModal.tsx` — 873 linhas

**Imports cruzados entre features:**
- `workspace/` importa de `tasks/` e `projects/`
- `spaces/` importa de `tasks/`
- `dashboard/` importa de `projects/`
- `team/` importa de `tasks/`
- Total de 20+ imports cross-feature identificados

**Ausencia de feature modules:**
- Hooks nao estao co-localizados com seus componentes
- 100 hooks em pasta unica (`src/hooks/`) sem subdivisao
- Nao ha barrel files organizados (apenas 5 index.ts no projeto inteiro)

**Sem lazy loading:**
- ZERO uso de `React.lazy()` ou `Suspense` no codigo
- Todas as 34 paginas sao importadas sincronamente no `App.tsx`
- Contribui diretamente para o bundle de 8MB

### Pontos Positivos
- Path alias `@/` configurado corretamente
- Componentes UI (shadcn) bem separados em `components/ui/`
- Contexts isolados e com proposito claro
- Zustand utilizado pontualmente (canvas store)

---

## 2. Padroes de Dados (Nota: 3.5/5)

### React Query - Configuracao

**QueryClient (App.tsx):**
```typescript
staleTime: 5 * 60 * 1000,   // 5 minutos
gcTime: 15 * 60 * 1000,     // 15 minutos
refetchOnWindowFocus: false,
refetchOnMount: false,
retry: 1,
```

**Sistema de volatilidade (`useQueryConfig.ts`):**
- `realtime`: 30s (notificacoes)
- `volatile`: 2min (propostas)
- `moderate`: 5min (tarefas - padrao)
- `stable`: 10min (projetos)
- `static`: 30min (organizacoes)

Excelente design. Porem, poucos hooks USAM esse sistema — a maioria usa o padrao global.

### Optimistic Updates

O `useTasks.tsx` implementa optimistic updates corretamente:
- `onMutate` cancela queries, faz snapshot, atualiza cache
- `onError` faz rollback
- `onSuccess` invalida queries

Porem, `useProjects.tsx` NAO implementa optimistic updates (apenas invalidacao).

### Invalidacao de Cache

Excessiva em muitos hooks. Exemplo no `updateTask`:
```
invalidateQueries(["tasks"])
invalidateQueries(["task"])
invalidateQueries(["filtered-tasks"])
invalidateQueries(["organization-tasks"])
invalidateQueries(["timeline-data"])
invalidateQueries(["timeline-users-with-tasks"])
invalidateQueries(["timeline-all-org-members"])
invalidateQueries(["personal-tasks"])
```
= 8 invalidacoes por update de uma tarefa. Potencial de cascata de re-fetches.

### Tipagem

**Uso de `any`:** ~64 ocorrencias em 30+ arquivos
- Concentrado em: `useTasks.tsx` (11x), contexts, components de superadmin
- `custom_fields_values?: any` — tipo fraco para dados dinamicos
- `as any` em varios sanitizeInput (reduce patterns)

**Ponto positivo:** Arquivo de tipos Supabase auto-gerado com 4.901 linhas cobrindo todas as 79 tabelas.

---

## 3. Performance (Nota: 2.0/5)

### Bundle Size - Analise de Dependencias Pesadas

| Dependencia | Peso Estimado | Uso |
|-------------|:-------------:|-----|
| `fabric` (fabric.js) | ~800KB | Whiteboard (1 pagina) |
| `recharts` | ~400KB | Graficos (22 arquivos) |
| `@tiptap/*` (35 pacotes!) | ~600KB | Editor rich text |
| `xlsx` | ~400KB | Import/export Excel |
| `react-big-calendar` | ~200KB | Calendario de tarefas |
| `roughjs` | ~100KB | Canvas drawing |
| `@dnd-kit/*` | ~100KB | Drag and drop |
| `react-markdown` + `remark-gfm` | ~100KB | Renderizar MD |
| **lucide-react** | ~200KB (se tree-shaking falhar) | Icones |

**Total estimado das dependencias pesadas: ~2.9MB (sem tree-shaking)**

### Code Splitting - INEXISTENTE

- Zero `React.lazy()`
- Zero `import()` dinamico
- Todas as dependencias carregadas na initial load
- `fabric.js` (800KB) carrega mesmo que usuario nunca acesse Whiteboard
- Vite config NAO define `manualChunks` ou `rollupOptions.output.manualChunks`

### Memoizacao

- `useMemo`: 55 arquivos (razoavel)
- `useCallback`: 35 arquivos (razoavel)
- `React.memo`: 0 usos (!!)
- Componentes de lista (TaskGroupedListView, SpaceListView) NAO memoizam items
- Componentes de ~1000 linhas re-renderizam integralmente a cada state change

### Virtualizacao

- ZERO uso de virtualizacao (react-virtual, react-window, tanstack-virtual)
- `useTasks` limita a 500 resultados no frontend
- `useFilteredTasks` pagina em 25 por pagina (bom)
- Mas views como TaskGroupedListView renderizam TODAS as tasks do grupo no DOM

---

## 4. Escalabilidade (Nota: 3.0/5)

### Banco de Dados

- **79 tabelas** no Supabase (schema robusto e bem estruturado)
- **152 migrations** (6 meses de desenvolvimento ativo)
- **207 indexes** criados (cobertura boa)
- Row Level Security (RLS) ativo em todas as tabelas

### Indexes na tabela `tasks` (principal)

```sql
idx_tasks_org_id (organization_id)
idx_tasks_project_id (project_id)
idx_tasks_assignee_id (assignee_id)
idx_tasks_coordinator_id (coordinator_id)
idx_tasks_status_id (status_id)
idx_tasks_due_date (due_date)
idx_tasks_updated_at (updated_at)
idx_tasks_created_at (created_at DESC)
idx_tasks_start_date (start_date)
idx_tasks_priority (priority)
idx_tasks_task_group (task_group)
idx_tasks_tags_gin (tags) USING GIN
idx_tasks_org_task_type (organization_id, task_type) -- composite!
idx_tasks_org_assignee (organization_id, assignee_id) -- composite!
idx_tasks_org_status (organization_id, status_id) -- composite!
idx_tasks_org_due_date (organization_id, due_date) -- composite!
```
Excelente cobertura de indexes com composites para queries comuns.

### Queries N+1

**Problema no `useProjects.tsx`:**
```typescript
// Query 1: busca todos os projetos
const projectsData = await supabase.from("projects").select(...)
// Query 2: busca TODAS as tarefas de TODOS os projetos
const tasksData = await supabase.from("tasks").select(...)
  .in("project_id", projectIds)  // ate N projetos
```
= 2 queries por load, mas o `.in()` com array grande pode ser lento.

**Problema no `useTasks updateTask`:**
```typescript
// Query 1: busca dados anteriores
const previousTask = await supabase.from("tasks").select(...)
// Query 2: verifica status
const statusData = await supabase.from("project_statuses").select(...)
// Query 3: faz o update
const { data } = await supabase.from("tasks").update(...)
// onSuccess: Query 4: busca nome do projeto
const { data: project } = await supabase.from("projects").select("name")
```
= 4 queries por update de tarefa (inclui automation triggers).

### Limites de Paginacao

- `useTasks`: `.limit(500)` — carrega ate 500 tarefas por projeto
- `useFilteredTasks`: paginado com `.range()` (25 por pagina) — correto
- `useOrganizationTasks`: `limit: 50` com paginacao — correto
- `useTimeEntries`: SEM paginacao — carrega TODOS os time entries

---

## 5. Manutenibilidade (Nota: 2.5/5)

### Testes

- **ZERO arquivos de teste** (nenhum .test.ts, .spec.ts, .test.tsx)
- Sem configuracao de Jest, Vitest ou qualquer test runner
- Em producao sem rede de seguranca

### Console.log em Producao

- **136 ocorrencias de `console.log`** espalhadas em 25 arquivos
- Maioria em hooks criticos (useTasks, OrganizationContext)
- Nenhum mecanismo de log condicional (apenas em dev)

### Codigo Duplicado (DRY violations)

1. **Pattern de sanitizacao repetido** em useTasks, useProjects, useTimeEntries:
   ```typescript
   const sanitizedInput = Object.entries(input).reduce((acc, [key, value]) => {
     if (value === "") { acc[key] = null; } else { acc[key] = value; }
     return acc;
   }, {} as any);
   ```
   Aparece em 5+ hooks sem estar extraido em utility.

2. **Pattern de invalidacao repetido** — cada hook invalida 4-8 query keys manualmente.

3. **Select strings duplicadas** — a mesma select com JOINs de profiles aparece em useTasks (3x), useFilteredTasks (1x), useOrganizationTasks (1x).

### Complexidade

- Componentes de 1000+ linhas com multiplas responsabilidades
- `TaskGroupedListView.tsx` faz: agrupamento, filtragem, drag & drop, batch operations, quick create, resize de colunas
- `useTasks.tsx` (578 linhas) mistura: CRUD, optimistic updates, automation triggers, normalizacao de dados

### Hooks Customizados

Bem abstraidos em muitos casos:
- `useQueryConfig` — excelente abstraction de staleTime
- `usePermissions` — centraliza verificacao de roles
- `useSessionFilters` — filtros persistentes por sessao
- `useBatchTaskUpdate` / `useBatchTaskDelete` — operacoes em lote

Porem, hooks como `useProjects` e `useTasks` estao gordos demais (300-580 linhas).

---

## 6. Oportunidades de Melhoria

### Quick Wins (alto impacto, baixo esforco)

| # | Acao | Impacto | Esforco |
|---|------|---------|---------|
| 1 | **Lazy load de paginas** — adicionar `React.lazy()` para todas as routes em `App.tsx` | -60% initial bundle | 2h |
| 2 | **Dynamic import de fabric.js** — carregar apenas quando Whiteboard e acessado | -800KB do initial load | 1h |
| 3 | **Remover console.log** — substituir por logger condicional | Limpeza + menos leak de info | 1h |
| 4 | **Extrair sanitizeInput utility** — DRY na sanitizacao de inputs | Menos duplicacao, melhor manutencao | 30min |
| 5 | **Vite manualChunks** — separar vendor em chunks (tiptap, recharts, dnd-kit) | Caching melhor, loads paralelos | 1h |

### Dividas Tecnicas Prioritarias

| # | Divida | Risco | Prioridade |
|---|--------|-------|:----------:|
| 1 | **Zero testes** — nenhum teste unitario, integracao ou e2e | Regressoes silenciosas em producao | CRITICA |
| 2 | **Bundle monolitico 8MB** — sem code splitting | UX ruim em conexoes lentas, SEO | ALTA |
| 3 | **Componentes de 1000+ linhas** — 9 arquivos acima de 900 linhas | Dificil de manter/debugar | ALTA |
| 4 | **Sem virtualizacao** — listas de 500 items no DOM | Lag em projetos grandes | MEDIA |
| 5 | **`any` em 64 pontos** — tipagem fraca em operacoes criticas | Bugs em runtime | MEDIA |

### Refactors Recomendados

#### R1: Feature-based Architecture (Esforco: 2 sprints)
Reorganizar para Bulletproof React:
```
src/features/
  tasks/
    api/         → useTasks, useFilteredTasks, useOrganizationTasks
    components/  → TaskCard, TaskListView, BatchActionsBar...
    hooks/       → useTaskDragAndDrop, useFilteredTasks
    types/       → Task, CreateTaskInput
    index.ts     → public API
  projects/
    api/         → useProjects, useProject
    components/  → ProjectCard, CreateProjectModal...
    ...
```

#### R2: Split dos God Components (Esforco: 1 sprint)
- `TaskGroupedListView` (1033 linhas) → extrair:
  - `TaskGroupFilters` (filtros e agrupamento)
  - `TaskGroupList` (renderizacao dos grupos)
  - `TaskBatchOperations` (selecao e batch edit)
  - `TaskQuickCreate` (criacao inline)

#### R3: Implementar Code Splitting (Esforco: 2-3 dias)
```typescript
// App.tsx
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Whiteboard = lazy(() => import('./pages/CollaborativeSpace'));
const Proposals = lazy(() => import('./pages/Proposals'));
// ...todas as paginas
```
+ `vite.config.ts` com `manualChunks`:
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        tiptap: ['@tiptap/core', '@tiptap/react', ...],
        charts: ['recharts'],
        canvas: ['fabric', 'roughjs'],
        dnd: ['@dnd-kit/core', '@dnd-kit/sortable'],
      }
    }
  }
}
```

#### R4: Adicionar Vitest (Esforco: ongoing)
Comecar com testes dos hooks mais criticos:
- `useTasks` — optimistic updates e invalidacao
- `useProjects` — calculo de metricas
- `useFilteredTasks` — logica de filtragem client-side
- `useOrganization` — fluxo de auth + org switch

---

## Metricas do Codebase

| Metrica | Valor |
|---------|-------|
| Total de arquivos TS/TSX | 591 |
| Total de linhas de codigo | ~125.800 |
| Hooks customizados | 100 |
| Componentes | ~200+ |
| Paginas | 34 |
| Contextos globais | 5 |
| Tabelas Supabase | 79 |
| Migrations | 152 |
| Indexes de banco | 207 |
| Testes | 0 |
| Dependencias runtime | 53 |
| Dependencias dev | 12 |

---

## Conclusao

O Vista Intel Pro e um produto funcional e completo em producao, com um backend bem estruturado (Supabase com RLS, indexes compostos, migrations organizadas) e boa cobertura de features. Porem, o frontend acumulou divida tecnica significativa:

1. **Problema mais critico:** ausencia total de testes + bundle de 8MB sem code splitting
2. **Problema mais facil de resolver:** lazy loading de paginas (2h de trabalho, -60% bundle)
3. **Problema estrutural:** componentes monoliticos de 1000+ linhas que precisam ser decompostos

A recomendacao e priorizar: (1) code splitting imediato, (2) setup de Vitest para novos hooks, (3) refactor gradual dos componentes maiores seguindo o padrao feature-first.
