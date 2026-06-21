# STORY-044 — Trilhas que matriculam de verdade (auto-enroll + progresso real)

**Módulo:** Trilhas / Matrículas / Banco (Triggers)
**Sprint:** Conexões & Jornadas
**Prioridade:** P1
**Status:** concluido
> **CONCLUÍDA 18/06/2026.**
> - Migration `20260618120000_enroll_in_path_courses.sql`: função `enroll_in_path_courses()` (SECURITY DEFINER) + trigger `AFTER INSERT` em `learning_path_enrollments` + backfill. Aplicada no banco (`glarutjwjwqfmwyfqdug`).
> - `useEnrollInPath.onSuccess` agora invalida `path-enrollments`, `path-course-enrollments` e `enrollments` (UI atualiza na hora).
> - Trigger verificado ativo; disparo confirmado (insert de matrículas executa ao inscrever na trilha).
> - Type-check OK. `PROJECT_REQUIREMENTS.md` §13 atualizado.
> - ⚠️ Aplicada via `db query` direto (não `db push`) por causa de drift pré-existente de migrations da sprint de segurança (17/06) — ver nota ao JG.
**Estimativa:** 1 dia
**Origem:** [[Mapeamento-Conexoes-e-Jornadas]] — jornada quebrada #1

---

## Contexto

Quando o aluno "inicia uma trilha", o sistema grava **apenas** uma linha em `learning_path_enrollments` (`useLearningPaths.ts:161-174`, `useEnrollInPath`). Ele **não é matriculado em nenhum curso** da trilha (`enrollments`).

O problema fecha o ciclo: o progresso da trilha é calculado a partir do progresso dos cursos (`LearningPaths.tsx:117-119`), mas como o aluno nunca é matriculado, `courseEnrollments` vem vazio → **progresso sempre 0%**, para sempre. A feature inteira é cosmética. O campo `is_required` em `learning_path_courses` existe mas nunca é usado.

## Decisão de arquitetura

Matricular nos cursos via **trigger no banco** (`AFTER INSERT ON learning_path_enrollments`), não no frontend. Motivos:
1. Funciona por **qualquer** caminho (UI, import, admin, API), seguindo a estratégia geral do mapeamento (mover efeitos de domínio para o banco).
2. Idempotente e atômico com a inscrição.
3. Não duplica matrícula existente (`ON CONFLICT (user_id, course_id) DO NOTHING`).

O `tenant_id` da matrícula vem da própria linha de `learning_path_enrollments`; o `deadline`/`is_mandatory` herdam de `learning_path_courses.is_required`.

## Acceptance Criteria

- [ ] CA-01: Ao inserir em `learning_path_enrollments`, o aluno é automaticamente matriculado (`enrollments`) em **todos** os cursos vinculados àquela trilha (`learning_path_courses`).
- [ ] CA-02: Idempotente — se o aluno já tem matrícula no curso, nada acontece (sem erro, sem duplicata). Reinscrever na trilha não cria matrículas duplicadas.
- [ ] CA-03: A matrícula criada herda o `tenant_id` da inscrição na trilha e marca `is_mandatory = learning_path_courses.is_required`.
- [ ] CA-04: O progresso da trilha (`LearningPaths.tsx`) passa a refletir o progresso real médio dos cursos da trilha (deixa de ser 0% fixo).
- [ ] CA-05: Backfill — todos os alunos já inscritos em trilhas hoje recebem as matrículas faltantes (rodar uma vez na migration).
- [ ] CA-06: RLS — a criação de matrícula pelo trigger respeita o isolamento por tenant (trigger `SECURITY DEFINER`, mas grava sempre o `tenant_id` correto da trilha).
- [ ] CA-07: Desmatricular da trilha **não** remove as matrículas dos cursos (decisão de produto: o aluno continua com acesso ao que já começou). Documentar.

## Escopo

**IN:**
- Migration com função + trigger `enroll_in_path_courses()`.
- Backfill das inscrições existentes.
- Ajuste no hook `useLearningPaths` para invalidar a query de matrículas após inscrever (UI atualiza na hora).

**OUT:**
- Notificação de "você foi matriculado" (fica na [[STORY-046]], que já cobrirá `enrollments` AFTER INSERT).
- Desmatrícula em cascata (CA-07 define que não acontece).
- Ordenação/pré-requisitos sequenciais entre cursos da trilha (trilha continua liberando todos de uma vez).

## Arquitetura — Migration (SQL)

```sql
-- supabase/migrations/<timestamp>_enroll_in_path_courses.sql

create or replace function public.enroll_in_path_courses()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.enrollments (tenant_id, user_id, course_id, is_mandatory, enrolled_at)
  select
    new.tenant_id,
    new.user_id,
    lpc.course_id,
    coalesce(lpc.is_required, false),
    now()
  from public.learning_path_courses lpc
  where lpc.path_id = new.path_id
  on conflict (user_id, course_id) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_enroll_in_path_courses on public.learning_path_enrollments;
create trigger trg_enroll_in_path_courses
  after insert on public.learning_path_enrollments
  for each row
  execute function public.enroll_in_path_courses();

-- Backfill (CA-05): matricular quem já está em trilha mas não nos cursos
insert into public.enrollments (tenant_id, user_id, course_id, is_mandatory, enrolled_at)
select lpe.tenant_id, lpe.user_id, lpc.course_id, coalesce(lpc.is_required, false), now()
from public.learning_path_enrollments lpe
join public.learning_path_courses lpc on lpc.path_id = lpe.path_id
on conflict (user_id, course_id) do nothing;
```

> Confirmar que existe a constraint `UNIQUE (user_id, course_id)` em `enrollments` (o mapeamento confirma que sim). Se houver índice parcial por tenant, ajustar o `on conflict` para a constraint correta.

## Arquivos Afetados

- [ ] `supabase/migrations/<timestamp>_enroll_in_path_courses.sql` (novo)
- [ ] `src/features/courses/hooks/useLearningPaths.ts` (invalidar `["enrollments"]` no `onSuccess` de `useEnrollInPath`)
- [ ] `src/integrations/supabase/types.ts` (regenerar se necessário — sem mudança de schema, então provavelmente não)
- [ ] `PROJECT_REQUIREMENTS.md` (seção 13 Trilhas: documentar auto-enroll)

## Passos

1. Criar a migration com função + trigger + backfill.
2. `supabase db push`.
3. Ajustar `useEnrollInPath` para invalidar a query de matrículas.
4. Verificar no preview: inscrever numa trilha com 2+ cursos → aparecer matriculado nos cursos e progresso da trilha começar a contar.
5. Atualizar `PROJECT_REQUIREMENTS.md` no mesmo commit.

## Plano de Teste

- Trilha com 3 cursos: inscrever → 3 matrículas criadas, progresso 0% mas funcional; concluir 1 curso → progresso da trilha sobe.
- Aluno já matriculado em 1 dos 3 cursos: inscrever → só cria as 2 faltantes.
- Reinscrever na mesma trilha: nenhuma matrícula nova.
- Multi-tenant: matrículas criadas com o `tenant_id` correto (não vaza entre tenants).

## Rastreabilidade

- [[Mapeamento-Conexoes-e-Jornadas]] §1 jornada #1
- Evidência: `useLearningPaths.ts:161-174`, `LearningPaths.tsx:117-119`
- Depende de: constraint `enrollments UNIQUE(user_id, course_id)`
- Relaciona com: [[STORY-046]] (notificação de matrícula virá de graça via trigger em `enrollments`)
