# STORY-047 — Calendário com prazos de atividades

**Módulo:** Calendário / Atividades
**Sprint:** Conexões & Jornadas
**Prioridade:** P2
**Status:** concluido
> **CONCLUÍDA 18/06/2026.**
> - `useCalendarEvents`: 4ª fonte = prazos de `activities` (published, due_date não nula, cursos do aluno). Tipo `activity` + campo `link`.
> - `Calendar.tsx`: tipo "Atividade" (ícone/cor), filtro por tipo (chips toggle p/ todos os tipos) e eventos de atividade clicáveis (levam à atividade).
> - Type-check OK. Mudança só de leitura/UI, sem banco. `PROJECT_REQUIREMENTS.md` §21 atualizado.
**Estimativa:** meio dia
**Origem:** [[Mapeamento-Conexoes-e-Jornadas]] — jornada quebrada #5

---

## Contexto

O calendário acadêmico (`useCalendarEvents.ts`) promete agregar deadlines e hoje busca **3 fontes**: `enrollments.deadline` (`:23-39`), `certificates.issued_at` (`:42-55`) e `quiz_attempts` (`:58-72`). Mas **ignora `activities.due_date`** — justamente o tipo de prazo que o aluno mais precisa enxergar (entrega de atividade). A tabela `activities` tem `due_date` e está em `types.ts`.

## Decisão de arquitetura

Correção **só de leitura no frontend** — adicionar uma 4ª fonte ao `useCalendarEvents`. O aluno só deve ver prazos de atividades de cursos em que está matriculado (filtrar por `course_id ∈ matrículas do aluno`), e só atividades `published = true` com `due_date` não nula.

Modelo de evento existente ganha o tipo `activity_due`:

```ts
{
  date: activity.due_date,
  type: "activity_due",
  title: activity.title,
  courseId: activity.course_id,
  link: `/cursos/${activity.course_id}/atividades/${activity.id}`,
}
```

O filtro por tipo de evento na UI ganha a opção "Atividades".

## Acceptance Criteria

- [ ] CA-01: O calendário passa a exibir prazos de atividades (`activities.due_date`) como eventos.
- [ ] CA-02: Só aparecem atividades `published = true`, com `due_date` não nula, de cursos em que o aluno está matriculado.
- [ ] CA-03: O evento é clicável e leva à atividade (`/cursos/:courseId/atividades/:actId`).
- [ ] CA-04: O filtro por tipo de evento inclui "Atividades" e funciona junto com os tipos existentes.
- [ ] CA-05: Cor/ícone distinto para prazo de atividade (consistente com o design atual do calendário).
- [ ] CA-06: Multi-tenant respeitado (RLS + escopo por matrícula).
- [ ] CA-07: Sem regressão nas 3 fontes atuais (matrículas, certificados, provas).

## Escopo

**IN:**
- 4ª fonte em `useCalendarEvents` (atividades).
- Filtro "Atividades" na UI do calendário.

**OUT:**
- Prazos do par legado `assignments` (será removido — ver [[Mapeamento-Conexoes-e-Jornadas]] §3).
- Lembrete/notificação de prazo se aproximando (poderia ser uma story futura com pg_cron; fora do escopo).
- Sincronização com calendário externo (Google/iCal).

## Arquivos Afetados

- [ ] `src/features/calendar/hooks/useCalendarEvents.ts` (adicionar fonte de atividades)
- [ ] `src/pages/Calendar.tsx` (filtro + cor/ícone do novo tipo)
- [ ] `PROJECT_REQUIREMENTS.md` (seção 21 Calendário: 4 fontes)

## Esboço da query

```ts
// cursos do aluno
const { data: myEnrollments } = await supabase
  .from("enrollments").select("course_id").eq("user_id", userId);
const courseIds = (myEnrollments ?? []).map(e => e.course_id);

const { data: activityDue } = await supabase
  .from("activities")
  .select("id, title, due_date, course_id")
  .eq("published", true)
  .not("due_date", "is", null)
  .in("course_id", courseIds);
```

## Plano de Teste

- Atividade com prazo num curso matriculado → aparece no dia certo, clicável.
- Atividade `published = false` ou sem `due_date` → não aparece.
- Atividade de curso não matriculado → não aparece.
- Filtro "Atividades" liga/desliga só esses eventos.
- As 3 fontes antigas continuam aparecendo.

## Rastreabilidade

- [[Mapeamento-Conexoes-e-Jornadas]] §1 jornada #5
- Evidência: `useCalendarEvents.ts:23-72` (3 fontes; falta `activities.due_date`)
- Relaciona com: [[STORY-045]] (boletim de atividades), [[STORY-046]] (notificações)
