# Avaliacao de Qualidade - Vista Intel Pro (Trivia Tasker)

**Data:** 2026-05-30
**Avaliador:** @qa (Quinn) - TRIVIAIOX Framework
**Escopo:** `src/` (591 arquivos, ~125.800 linhas) + `supabase/functions/` (25 Edge Functions, ~10.900 linhas)
**Stack:** React 18 + Vite + TypeScript + Supabase + Tailwind + shadcn-ui + TanStack Query

---

## Resumo Executivo

| Categoria | Nota | Risco |
|---|---|---|
| TypeScript | D | ALTO |
| Testes | F | CRITICO |
| Error Handling | C+ | MEDIO |
| Acessibilidade | D | ALTO |
| UX/Feedback | B- | BAIXO |
| Codigo Morto | C | MEDIO |

**Score Geral: 4.2 / 10**

---

## 1. TypeScript - SEVERIDADE ALTA

### Findings Criticos

#### 1.1 Strict Mode DESATIVADO
```json
// tsconfig.app.json
"strict": false,
"noImplicitAny": false,
"noUnusedLocals": false,
"noUnusedParameters": false,
"strictNullChecks": false
```
**Impacto:** O compilador nao detecta erros de tipo que causariam bugs em runtime. Sem `strictNullChecks`, acessos a propriedades de objetos `null/undefined` passam despercebidos.

#### 1.2 Uso massivo de `any` - 155+ ocorrencias em 50+ arquivos
- `: any` explicito em 142+ ocorrencias (50+ arquivos)
- `as any` em 75+ ocorrencias (30+ arquivos)
- `Record<string, any>` em 22+ ocorrencias (10+ arquivos)

**Arquivos mais afetados:**
- `useOrganizationTasks.tsx` (12 ocorrencias)
- `useSuperadmin.tsx` (8 ocorrencias)
- `useOrganizationCostMetrics.tsx` (11 ocorrencias)
- `useTimelineUsers.tsx` (9 ocorrencias)
- `useExcelImport.tsx` (7 ocorrencias)
- `useCollaboratorGroups.tsx` (16 `as any`)
- `Canvas.tsx` (14 `as any`)

#### 1.3 @ts-nocheck em 7 arquivos de editor
Arquivos inteiros sem verificacao de tipo:
- `TaskDescriptionEditor.tsx`
- `SpaceDocumentEditor.tsx`
- `EditorToolbar.tsx`
- `DocumentEditor.tsx`
- `EditorBubbleMenu.tsx`
- `ResizableImage.tsx`
- `SlashCommandMenu.tsx`

**Impacto:** Todo o sistema de edicao rich-text opera sem seguranca de tipo.

#### 1.4 ESLint com regras desabilitadas
```js
"@typescript-eslint/no-unused-vars": "off"
```

#### 1.5 Tipos centralizados insuficientes
- Apenas 3 arquivos em `src/types/` (canvas.ts, health-score.ts, whiteboard.ts)
- Tipos de dominio (Task, Project, User, Organization) nao estao em arquivos de tipo dedicados
- O tipo gerado do Supabase (`integrations/supabase/types.ts`) existe, mas muitos hooks usam `any` ao inves de tipar corretamente as respostas

### Recomendacoes TypeScript
1. **Prioridade 1:** Habilitar `strictNullChecks: true` (vai revelar ~200-400 erros, mas previne crashes em producao)
2. **Prioridade 2:** Criar `src/types/domain.ts` com interfaces para Task, Project, User, Organization
3. **Prioridade 3:** Substituir `any` por tipos genericos do Supabase Database types
4. **Prioridade 4:** Resolver os 7 arquivos com `@ts-nocheck` (provavelmente tipos do TipTap)

---

## 2. Testes - SEVERIDADE CRITICA

### Finding: ZERO testes

- Nenhum arquivo `*.test.*` ou `*.spec.*` encontrado
- Nenhum framework de testes configurado (sem Vitest, Jest, Cypress, Playwright)
- Nenhum script `test` no `package.json`
- Nenhum `vitest.config.*` ou `jest.config.*`

### O que DEVERIA ter testes (por prioridade):

| Prioridade | Area | Justificativa |
|---|---|---|
| P0 | Edge Functions (stripe-webhook, create-organization-with-admin) | Lidam com dinheiro e dados criticos |
| P0 | OrganizationContext | Core de toda a aplicacao, 404 linhas de logica complexa |
| P1 | useTasks hook (578 linhas) | CRUD principal do sistema |
| P1 | useOrganizationTasks (326 linhas) | Queries complexas com filtros |
| P1 | Fluxo de autenticacao/permissoes | Guards de rota |
| P2 | Utilitarios (`lib/`) | Funcoes puras, faceis de testar |
| P2 | Componentes de formulario (CreateProjectModal, EditTaskModal) | Validacao de inputs |
| P3 | Fluxo de importacao (Monday, ClickUp, Excel) | Parser complexo sujeito a dados imprevisiveis |

### Recomendacoes Testes
1. Configurar Vitest + React Testing Library imediatamente
2. Comecar com testes unitarios para `src/lib/` (baixo esforco, alto valor)
3. Adicionar testes de integracao para Edge Functions criticas (stripe-webhook, delete-user, purge-organization-data)
4. Considerar Playwright para E2E dos fluxos criticos (login, criar projeto, criar tarefa)

---

## 3. Error Handling - SEVERIDADE MEDIA

### Positivo
- **Edge Functions:** 22/25 functions tem try/catch global com resposta HTTP estruturada
- **Toast notifications:** Presente em 64+ locais para feedback de erro ao usuario
- **Supabase error handling:** Pattern consistente `if (error) throw error` nos hooks

### Problemas

#### 3.1 Nenhum Error Boundary no React
Nao existe nenhum componente `ErrorBoundary`. Se um componente crashar, toda a aplicacao cai com tela branca.

**Impacto:** ALTO em producao. Usuarios perdem trabalho nao salvo.

#### 3.2 console.log excessivo em producao
- **src/**: 129 ocorrencias em 23 arquivos
- **supabase/functions/**: 185 ocorrencias em 20 arquivos

Muitos sao logs de debug que deveriam ser removidos ou condicionados a ambiente de desenvolvimento.

**Piores ofensores:**
- `useMentionNotifications.tsx` (12 console.logs)
- `useTasks.tsx` (14 console.logs)
- `OrganizationContext.tsx` (18 console.logs)
- `stripe-webhook/index.ts` (29 console.logs)
- `run-automation-trigger/index.ts` (40 console.logs)

#### 3.3 Edge Functions sem validacao de input
Apenas 5/25 Edge Functions usam alguma forma de validacao (`validation`, `validate`, `schema`). As demais confiam que o payload esta correto.

#### 3.4 Sem React.Suspense
Nenhum uso de `<Suspense>` para code splitting ou data fetching boundaries.

#### 3.5 Sem React.lazy para code splitting
Nenhum componente usa `React.lazy()`. Todas as 47 pages sao importadas sincronamente no `App.tsx`, resultando em bundle unico grande.

### Recomendacoes Error Handling
1. **Prioridade 1:** Implementar ErrorBoundary global + por rota
2. **Prioridade 2:** Adicionar lazy loading para rotas (reduz bundle inicial em ~60%)
3. **Prioridade 3:** Criar wrapper de logging que respeite environment (dev vs prod)
4. **Prioridade 4:** Adicionar validacao de schema (Zod) nos Edge Functions que recebem input externo

---

## 4. Acessibilidade - SEVERIDADE ALTA

### Findings

#### 4.1 ARIA labels minimos
- Apenas 53 ocorrencias de `aria-` ou `role=` em todo o projeto
- Para 591 arquivos de componente, isso e extremamente baixo (~0.09 por arquivo)
- A maioria vem dos componentes shadcn-ui (automaticos), nao de logica custom

#### 4.2 Keyboard navigation limitada
- Apenas 17 ocorrencias de handlers de teclado (`onKeyDown`, `onKeyUp`, `tabIndex`, `focus`)
- Componentes criticos como Kanban board, Timeline, e Canvas provavelmente nao sao navegaveis por teclado

#### 4.3 Componentes customizados sem acessibilidade
- `TaskKanbanPhasesView.tsx` (945 linhas) - drag & drop sem alternativa keyboard
- `Canvas.tsx` (990 linhas) - canvas interativo sem screen reader
- `TeamTimeline.tsx` / `ProjectTimelineGrid.tsx` - visualizacoes temporais sem alternativa textual

#### 4.4 Contraste de cores nao verificavel via codigo
- O projeto usa Tailwind com variaveis CSS customizaveis (tema por organizacao)
- Nao ha mecanismo para garantir contraste minimo WCAG quando o usuario customiza cores

### Recomendacoes Acessibilidade
1. Audit com axe-core ou Lighthouse Accessibility
2. Adicionar `aria-label` em todos os botoes de icone (varios usam apenas `<Button><Icon/></Button>`)
3. Implementar keyboard navigation nos boards Kanban (arrows para mover entre colunas)
4. Adicionar `sr-only` labels para dados visuais (graficos, timeline)

---

## 5. UX Issues - SEVERIDADE BAIXA

### Positivo
- **Skeleton loaders:** Implementados em 56 componentes (bom coverage)
- **Loading states:** 112+ ocorrencias de `isLoading` patterns
- **Toast notifications:** Sistema de feedback presente
- **Confirm dialogs:** 30+ componentes com confirmacao antes de acoes destrutivas
- **AlertDialog (shadcn):** Usado para delecoes (DeleteProjectDialog, DeleteUserDialog, etc.)
- **Empty states:** 17+ mensagens de "nenhum resultado" detectadas

### Problemas

#### 5.1 Componentes muito grandes (God Components)
Componentes com 700+ linhas que misturam logica e apresentacao:

| Arquivo | Linhas |
|---|---|
| PublicProposal.tsx | 1.446 |
| WhiteboardCanvas.tsx | 1.037 |
| TaskGroupedListView.tsx | 1.033 |
| SpaceListView.tsx | 1.003 |
| Canvas.tsx | 990 |
| SpaceSidebar.tsx | 989 |
| Spaces.tsx | 966 |
| TaskKanbanPhasesView.tsx | 945 |
| AdminActions.tsx | 915 |
| CreateProjectModal.tsx | 873 |

**Impacto:** Dificuldade de manutencao, re-renders desnecessarios, dificuldade de teste.

#### 5.2 useMemo/useCallback sub-utilizado
Apenas 25 ocorrencias para um projeto com 591 arquivos e listas complexas. Os componentes de 900+ linhas com listas filtradas provavelmente causam re-renders excessivos.

### Recomendacoes UX
1. Dividir componentes > 500 linhas em sub-componentes
2. Adicionar `useMemo` para listas filtradas/ordenadas nos hooks pesados
3. Implementar virtualizacao (react-virtual) para listas longas de tarefas

---

## 6. Codigo Morto e Debris - SEVERIDADE MEDIA

### Findings

#### 6.1 TODOs em producao
```
src/hooks/useProjectExport.tsx:199:    // TODO: Implementar logica completa
src/hooks/useOrganizationLimits.tsx:42: 0 // TODO: Calculate inactive users
src/components/analytics/ExecutiveProjectReport.tsx:142: spent: 0 // TODO: calcular gasto real
supabase/functions/generate-weekly-report/index.ts:119: progress: 50, // TODO: calcular progresso real
supabase/functions/generate-weekly-report/index.ts:134: totalSpent: 0, // TODO: calcular gastos reais
```
**Impacto:** Features parcialmente implementadas exibem dados incorretos (hardcoded 0 ou 50) para usuarios em producao.

#### 6.2 console.log como debug permanente
129 console.logs no frontend + 185 no backend = dados sensiveis potencialmente expostos no console do usuario e nos logs do Supabase.

#### 6.3 ESLint `no-unused-vars: off`
Com essa regra desabilitada, imports e variaveis mortas se acumulam silenciosamente. Impossivel quantificar sem rodar analise estatica.

#### 6.4 152 migrations SQL
Alto numero de migrations indica schema em evolucao rapida. Nao e um problema em si, mas vale consolidar periodicamente.

### Recomendacoes Codigo Morto
1. Buscar e resolver todos os TODOs que retornam dados falsos (0, 50, etc.)
2. Substituir console.log por logger condicional (`if (import.meta.env.DEV)`)
3. Habilitar `noUnusedLocals` e `noUnusedParameters` no tsconfig e corrigir gradualmente
4. Rodar `npx depcheck` para encontrar dependencias nao utilizadas

---

## 7. Seguranca (Bonus)

### Observacoes
- **CORS:** Todas as 24 Edge Functions tem headers CORS (187 ocorrencias)
- **RLS:** Migrations incluem configuracoes de Row Level Security (20+ ocorrencias)
- **Env vars:** Apenas 1 arquivo referencia `import.meta.env` (client.ts) - bom isolamento
- **DOMPurify:** Usado em TaskDetails.tsx para sanitizar HTML - bom
- **Supabase client:** Usa apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` (chave publica, seguro)

### Riscos
- Edge Functions sem validacao de input podem ser exploradas com payloads malformados
- `purge-organization-data` e uma funcao destrutiva que precisa validacao rigorosa de permissao
- `reset-pedreira-passwords` parece ser uma funcao especifica para um cliente - deveria ser removida ou generalizada

---

## 8. Performance (Bonus)

### Problemas detectados
- **Sem code splitting:** 47 pages carregadas sincronamente
- **Sem React.lazy/Suspense:** Bundle monolitico
- **TanStack Query:** Apenas 12 configuracoes de `staleTime/cacheTime/retry` para dezenas de queries
- **Componentes grandes:** Re-renders de 1000+ linhas de JSX

### Recomendacoes Performance
1. Implementar route-based code splitting com React.lazy
2. Configurar staleTime adequado nas queries que mudam pouco (ex: lista de projetos, membros)
3. Adicionar virtualizacao para listas de tarefas (react-virtual ou @tanstack/react-virtual)

---

## Plano de Acao Priorizado

### Sprint 1 (Urgente - 1 semana)
- [ ] Implementar ErrorBoundary global
- [ ] Configurar Vitest
- [ ] Resolver TODOs que exibem dados falsos em producao
- [ ] Remover/condicionar console.logs

### Sprint 2 (Importante - 2 semanas)
- [ ] Habilitar `strictNullChecks` e corrigir erros
- [ ] Adicionar testes para Edge Functions criticas (stripe, auth, delete)
- [ ] Implementar React.lazy para code splitting
- [ ] Criar tipos de dominio centralizados

### Sprint 3 (Melhorias - 3 semanas)
- [ ] Resolver `@ts-nocheck` nos editores
- [ ] Adicionar validacao Zod nas Edge Functions
- [ ] Audit de acessibilidade com axe-core
- [ ] Refatorar componentes > 700 linhas

### Sprint 4 (Qualidade continua)
- [ ] Habilitar strict mode completo
- [ ] Setup CI com lint + type-check + testes
- [ ] Adicionar Playwright para E2E dos fluxos criticos
- [ ] Meta: 60% coverage em hooks e lib

---

## Metricas do Projeto

| Metrica | Valor |
|---|---|
| Arquivos TS/TSX | 591 |
| Linhas de codigo (src) | ~125.800 |
| Linhas de codigo (supabase functions) | ~10.900 |
| Edge Functions | 25 |
| Hooks customizados | 110 |
| Componentes (dirs) | 36 subdiretorios |
| Pages | 31 |
| Migrations SQL | 152 |
| Testes | 0 |
| `any` explicito | 155+ |
| `as any` | 75+ |
| `@ts-nocheck` | 7 |
| `console.log` (src) | 129 |
| `console.log` (supabase) | 185 |
| Error Boundaries | 0 |
| React.lazy usage | 0 |
| Skeleton loaders | 56 componentes |
| Toast feedback | 64+ locais |

---

*Relatorio gerado por @qa (Quinn) - TRIVIAIOX Framework*
*Revisao recomendada a cada 30 dias*
