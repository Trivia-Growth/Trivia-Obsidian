# STORY-045 — Boletim unificado (provas + atividades)

**Módulo:** Boletim / Grades / Atividades
**Sprint:** Conexões & Jornadas
**Prioridade:** P1
**Status:** concluido
> **CONCLUÍDA 18/06/2026** (implementada após o teste E2E ter revelado que havia sido pulada na sprint).
> - `useGrades` agora busca DUAS fontes: `quiz_attempts` + `activity_submissions` (status graded/returned, join `activities`), unificadas num modelo comum com `kind`, `title`, `feedback`.
> - `Grades.tsx`: badge de tipo (Prova/Atividade) + feedback do instrutor abaixo do título.
> - Verificado no preview: boletim da aluna Priscila exibe a atividade "Reflexão: O que é adorar a Deus?" 8/10, Aprovado, com feedback.
> - Type-check OK. `PROJECT_REQUIREMENTS.md` §22 atualizado.
**Estimativa:** meio dia
**Origem:** [[Mapeamento-Conexoes-e-Jornadas]] — jornada quebrada #2

---

## Contexto

O instrutor cria atividade, o aluno entrega, o instrutor corrige com **nota e feedback** (`submit-activity`, status `graded`/`returned`, grava `final_score`). Mas o boletim do aluno (`useGrades.ts:17-46`) lê **apenas `quiz_attempts`** — nunca `activity_submissions`. Resultado: a nota da atividade **some** do ponto de vista do aluno. A exportação em PDF (`generateGradeReportPDF.ts`) tem o mesmo problema. `activity_submissions` só é lida no relatório gerencial do admin (`Reports.tsx:142`), nunca no boletim do aluno.

## Decisão de arquitetura

Correção **só de leitura no frontend** — não precisa de banco. O `useGrades` passa a buscar **duas fontes** e unificá-las num modelo comum de "lançamento de nota":

```ts
type GradeEntry = {
  id: string;
  kind: "quiz" | "activity";
  courseTitle: string;
  title: string;           // título da prova ou da atividade
  score: number;           // nota obtida
  maxScore: number;        // nota máxima
  passingScore: number | null;
  passed: boolean | null;
  weight?: number;         // só atividades (activities.weight)
  date: string;            // completed_at / graded_at
  feedback?: string | null; // só atividades
};
```

- **Quizzes:** `quiz_attempts` (já existe) → mapear para `GradeEntry` com `kind: "quiz"`.
- **Atividades:** `activity_submissions` onde `status in ('graded','returned')` join `activities` (título, `max_score`, `passing_score`, `weight`, `course_id` → título do curso) → `GradeEntry` com `kind: "activity"`, `feedback`.

A UI de `Grades.tsx` ganha um indicador de tipo (badge "Prova" / "Atividade") e, para atividades, mostra o feedback do instrutor. O PDF passa a incluir as duas fontes, agrupadas por curso.

## Acceptance Criteria

- [ ] CA-01: O boletim (`/grades`) lista provas **e** atividades corrigidas do aluno, agrupadas por curso.
- [ ] CA-02: Só entram atividades com `status in ('graded','returned')` (entregas pendentes/rascunho não aparecem).
- [ ] CA-03: Cada lançamento mostra: título, curso, nota obtida / nota máxima, situação (aprovado/reprovado quando houver `passing_score`), data e — para atividades — o feedback do instrutor.
- [ ] CA-04: A exportação em PDF (`generateGradeReportPDF`) inclui as duas fontes.
- [ ] CA-05: Estados de loading / erro / vazio preservados; sem `(supabase as any)` novo sem necessidade (usar tipos gerados — `activities`/`activity_submissions` já estão em `types.ts`).
- [ ] CA-06: Multi-tenant respeitado (queries sob RLS, escopo por `user_id`).
- [ ] CA-07: Média ponderada opcional — se a maioria das atividades tiver `weight`, exibir média ponderada do curso; senão, média simples. (Decidir na implementação; pode ficar como melhoria.)

## Escopo

**IN:**
- `useGrades` busca e unifica as duas fontes.
- `Grades.tsx` renderiza o tipo + feedback.
- `generateGradeReportPDF` inclui atividades.

**OUT:**
- Mudar o cálculo de aprovação do curso (continua como está).
- Notificação de "nota lançada" (fica na [[STORY-046]], trigger em `activity_submissions`).
- Boletim por turma para o admin (já existe em `Reports.tsx`).

## Arquivos Afetados

- [ ] `src/features/grades/hooks/useGrades.ts` (adicionar fonte `activity_submissions` + unificação)
- [ ] `src/pages/Grades.tsx` (badge de tipo + feedback)
- [ ] `src/lib/generateGradeReportPDF.ts` (incluir atividades)
- [ ] `PROJECT_REQUIREMENTS.md` (seção 22 Boletim: passa a incluir atividades)

## Esboço da query de atividades

```ts
const { data: activityGrades } = await supabase
  .from("activity_submissions")
  .select(`
    id, final_score, feedback, status, graded_at,
    activities!inner ( id, title, max_score, passing_score, weight, courses!inner ( title ) )
  `)
  .eq("user_id", userId)
  .in("status", ["graded", "returned"]);
```

## Plano de Teste

- Aluno com 2 provas + 2 atividades corrigidas → 4 lançamentos, badges corretos.
- Atividade entregue mas não corrigida → **não** aparece.
- Atividade `returned` (devolvida com nota) → aparece com feedback.
- PDF exportado contém provas e atividades.
- Aluno sem nenhuma nota → estado vazio.

## Rastreabilidade

- [[Mapeamento-Conexoes-e-Jornadas]] §1 jornada #2
- Evidência: `useGrades.ts:17-46`, `Reports.tsx:142`, `submit-activity/index.ts:289-368`
- Relaciona com: [[STORY-046]] (notificação ao corrigir), [[STORY-047]] (prazos no calendário)
