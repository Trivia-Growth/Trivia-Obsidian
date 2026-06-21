# STORY-049 — Navegação e páginas órfãs (expor atividades, planos; resolver duplicadas)

**Módulo:** Navegação / Layout
**Sprint:** Conexões & Jornadas
**Prioridade:** P2
**Status:** concluido
> **CONCLUÍDA 18/06/2026.**
> - **Atividades:** rota `/atividades` (hub agregado — `MyActivitiesDashboard` já agregava todos os cursos via edge `get-my-activities`) + link "Minhas Atividades" no menu do aluno.
> - **Planos:** link "Planos" (`/plans`) no menu admin.
> - **`/settings`:** consolidado em `/profile` via redirect (decisão JG/recomendada — `/profile` já edita nome/bio/avatar; `/settings` era subconjunto).
> - **`/members` e `/leaderboard`:** redirecionam para `/community?tab=members` e `?tab=ranking`; páginas standalone removidas (`Members.tsx`, `Leaderboard.tsx`).
> - Type-check OK. `PROJECT_REQUIREMENTS.md` atualizado.
**Estimativa:** meio dia
**Origem:** [[Mapeamento-Conexoes-e-Jornadas]] — jornadas #4 e §2

---

## Contexto

Várias páginas **completas e funcionais** não têm porta de entrada na navegação (`Sidebar.tsx`/`Header.tsx`):

1. **Atividades** — toda a feature (backend + telas) está pronta, rotas `/cursos/:courseId/atividades[...]` existem (`App.tsx:137-138`), mas **não há link no menu do aluno**. O aluno só chega por URL ou de dentro do curso → não descobre que tem atividade pendente. (Jornada #4, alta prioridade dentro desta story.)
2. **`/plans`** — página completa de upgrade de plano, **sem nenhum link**. Monetização sem porta de entrada.
3. **`/settings`** — edição de perfil completa, sem item de menu (redundante com `/profile`).
4. **`/members`** e **`/leaderboard`** — completas, mas **duplicadas** pelas abas "Membros" e "Ranking" dentro de `/community` (o próprio `Sidebar.tsx:71-72` comenta isso). As rotas soltas viraram órfãs.

## Decisão de arquitetura

Sem banco — só navegação e roteamento. Decisões:

- **Atividades:** adicionar "Minhas Atividades" ao menu do aluno. Como as rotas atuais são por curso (`/cursos/:courseId/atividades`), criar um **hub agregado** `/atividades` (lista atividades pendentes/entregues de **todos** os cursos do aluno) e linká-lo no Sidebar. Reusar `MyActivitiesDashboard` adaptado para agregar por curso (hoje recebe `courseId`).
- **`/plans`:** adicionar entrada de upgrade — idealmente no menu do **admin** (quem decide plano é o admin da org), e/ou um CTA no dashboard admin. Não poluir o menu do aluno.
- **`/settings`:** decidir entre (a) remover a rota e consolidar tudo em `/profile`, ou (b) linkar no dropdown do Header como "Configurações". **Recomendado: (a) consolidar** — menos superfície duplicada. Confirmar com JG.
- **`/members` e `/leaderboard`:** **remover as rotas standalone** (já existem como abas de `/community`) OU redirecioná-las para `/community?tab=members|ranking`. **Recomendado: redirect** para não quebrar links salvos.

## Acceptance Criteria

- [ ] CA-01: Existe item "Minhas Atividades" no menu do aluno levando a um hub `/atividades` que agrega atividades de todos os cursos matriculados (pendentes e entregues).
- [ ] CA-02: O hub mostra prazo e status de cada atividade e linka para a atividade específica.
- [ ] CA-03: Upgrade de plano (`/plans`) tem entrada de navegação para o admin (menu admin e/ou CTA no dashboard).
- [ ] CA-04: `/settings` é consolidado em `/profile` (rota removida + redirect) **ou** linkado no Header — conforme decisão de JG.
- [ ] CA-05: `/members` e `/leaderboard` redirecionam para as abas correspondentes de `/community` (sem página órfã duplicada).
- [ ] CA-06: Nenhuma rota existente quebra (redirects no lugar das remoções).
- [ ] CA-07: Itens de menu respeitam papel (atividades = aluno; planos = admin).

## Escopo

**IN:**
- Hub `/atividades` (agregado) + item no Sidebar.
- Entrada de `/plans` no contexto admin.
- Consolidação/redirect de `/settings`, `/members`, `/leaderboard`.

**OUT:**
- Mudar a lógica das atividades em si (já funciona).
- Redesenho do menu.

## Arquivos Afetados

- [ ] `src/components/layout/Sidebar.tsx` (itens: Minhas Atividades; Planos no bloco admin)
- [ ] `src/App.tsx` (rota `/atividades`; redirects de `/members`, `/leaderboard`, opcionalmente `/settings`)
- [ ] `src/pages/activities/MyActivities.tsx` ou novo `MyActivitiesHub.tsx` (versão agregada sem `courseId`)
- [ ] `src/features/activities/components/MyActivitiesDashboard.tsx` (suportar modo "todos os cursos")
- [ ] `PROJECT_REQUIREMENTS.md` (navegação)

## Plano de Teste

- Aluno vê "Minhas Atividades" no menu → hub lista atividades de todos os cursos com prazo e status.
- Admin vê entrada de Planos.
- Acessar `/members` e `/leaderboard` → redireciona para as abas de `/community`.
- `/settings` → conforme decisão (redirect para `/profile` ou link no Header).
- Aluno não vê item de Planos; admin não perde nada.

## Rastreabilidade

- [[Mapeamento-Conexoes-e-Jornadas]] §1 jornada #4 e §2
- Evidência: `App.tsx:137-138`, `Sidebar.tsx:71-72`
- ⚠️ CA-04 depende de decisão de JG (consolidar `/settings` vs linkar) — confirmar antes de implementar (regra: validar antes de mexer em UI)
