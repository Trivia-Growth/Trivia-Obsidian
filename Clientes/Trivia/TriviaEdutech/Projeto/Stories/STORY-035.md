# STORY-035 — Regenerar types.ts (módulo activities + transcrição) e remover casts `as never`/`as any`

**Módulo:** Tipos / Qualidade  
**Sprint:** Qualidade  
**Prioridade:** P2  
**Status:** concluido  
**Estimativa:** 2h  
**Origem:** Mapeamento do Sistema (2026-06-17) — Registro de Riscos

> **CONCLUÍDA 2026-06-17** (commit `b0b3982`). `types.ts` regenerado via `supabase gen types` (project-id glarutjwjwqfmwyfqdug), 2317→2614 linhas.
> - CA-01 ✅ + tabelas activities/activity_questions/activity_question_options/activity_submissions.
> - CA-02 ✅ `lessons.Row` agora tem `transcription_text`/`transcription_source`.
> - CA-03/CA-07 ✅ zero `as never` em `src/features/activities/` (useActivities, useSubmissions, QuestionEditor).
> - CA-04 ✅ casts removidos em Reports.tsx (joins courses/quizzes), TranscriptionPanel.tsx.
> - CA-05 ✅ interfaces manuais → `Tables<"activities">` etc.
> - CA-06 ✅ `tsc --noEmit` exit 0 + `vite build` OK. Smoke prod: app/explore HTTP 200 (mudança é só de tipo, runtime idêntico — bundle hash inalterado).
> - Bônus: removidos os `(supabase as any)` da RPC `get_public_tenant` nas 5 telas (agora tipada pela regeneração). Restam 2 `as any` pré-existentes em TenantContext (resolução), fora do escopo (candidatos à STORY-039).
> - Lint: erros pré-existentes no repo (herança Lovable); a story só reduziu `any`, não adicionou.

---

## Contexto

O arquivo de tipos gerados `src/integrations/supabase/types.ts` é o source-of-truth de tipos do banco para o frontend (CLAUDE.md: "Schema Supabase é source of truth"). Hoje ele está **desatualizado em relação ao schema real**: a migração `supabase/migrations/20260613200000_activities.sql` criou 4 tabelas que **não existem** no `types.ts`, e a migração `supabase/migrations/20260613220000_lesson_transcription.sql` adicionou 2 colunas em `lessons` que **também não estão** refletidas no tipo `lessons.Row`.

Evidências (código real):

- `types.ts` NÃO contém as tabelas do módulo de atividades. Verificado: `grep -nE "^      activit" src/integrations/supabase/types.ts` retorna vazio. Faltam:
  - `activities` (migration linha 7)
  - `activity_questions` (linha 70)
  - `activity_question_options` (linha 106)
  - `activity_submissions` (linha 141)
- Como esses tipos não existem, o código contorna o type-checker com `as never` e interfaces escritas à mão:
  - `src/features/activities/hooks/useActivities.ts` — `.from("activities" as never)` nas linhas 49, 65, 82, 98, 114, 133; interfaces `Activity`, `ActivityQuestion`, `ActivityQuestionOption` redigidas manualmente (linhas 4–42), duplicando o schema.
  - `src/features/activities/hooks/useSubmissions.ts` — `.from("activity_submissions" as never)` (linhas 32, 54).
  - `src/features/activities/components/QuestionEditor.tsx` — `.from("activity_questions" as never)` (linhas 26, 42, 69), `.from("activity_question_options" as never)` (linha 54), `insert(opts as never)`.
- A migração de transcrição adicionou `transcription_text` e `transcription_source` em `public.lessons` (`20260613220000_lesson_transcription.sql` linhas 3–4), mas o tipo `lessons.Row` em `types.ts` não tem esses campos. Por isso `src/features/admin/components/TranscriptionPanel.tsx` (linha 43) faz `.select("transcription_text, transcription_source")` e força o retorno com `data as { transcription_text: ...; transcription_source: ... }` (linha 46).
- Em `src/pages/admin/Reports.tsx` há ainda casts `as any` em joins de `activity_submissions`/`courses`/`quizzes` (linhas 142, 209, 232, 262) que perdem type-safety por causa da mesma defasagem.

**Correção do achado original:** as tabelas `tutor_messages`, `user_points` e `user_badges` **já estão presentes** em `types.ts` (confirmado por grep) e são usadas com tipagem correta em `src/features/tutor/hooks/useTutorMessages.ts` (sem cast). Portanto NÃO entram nesta story. O `(supabase as any)` ainda existente em outros módulos (gamification, library, quiz, courses, messages, etc.) é decisão de outra story e fica OUT deste escopo — aqui o foco é fechar a lacuna do schema (activities + colunas de transcrição) e eliminar os `as never`/`as any` correlatos.

**Impacto:** sem os tipos, qualquer drift entre o código de atividades e o schema (campo renomeado, NOT NULL, enum de `status`/`type`) passa silenciosamente pelo build e só quebra em runtime. As interfaces manuais já podem estar divergindo (ex.: `activity_submissions.status` é um CHECK `('draft','submitted','graded','returned')` no banco). Viola a regra "Schema é source of truth" e o DoD "TypeScript strict (sem `any`)".

## Acceptance Criteria

- [ ] CA-01: `src/integrations/supabase/types.ts` é regenerado a partir do schema linkado (`project_id = glarutjwjwqfmwyfqdug`) e passa a conter as tabelas `activities`, `activity_questions`, `activity_question_options` e `activity_submissions` com `Row`/`Insert`/`Update`/`Relationships`.
- [ ] CA-02: O tipo `lessons.Row` em `types.ts` passa a incluir `transcription_text: string | null` e `transcription_source: string | null`.
- [ ] CA-03: Todos os `.from("...activit..." as never)` em `useActivities.ts`, `useSubmissions.ts` e `QuestionEditor.tsx` são substituídos por `.from("tabela")` sem cast, com inferência de tipos do Supabase.
- [ ] CA-04: Os casts `as any`/`as never` correlatos a activities/transcrição em `Reports.tsx`, `SubmissionReview.tsx`, `QuizActivity.tsx` e `TranscriptionPanel.tsx` são removidos (ou substituídos por tipos derivados de `Tables<...>`), mantendo o comportamento atual.
- [ ] CA-05: As interfaces manuais `Activity`/`ActivityQuestion`/`ActivityQuestionOption` em `useActivities.ts` passam a derivar de `Tables<"activities">` etc. (via `Tables<...>`/`type alias`) em vez de redeclarar os campos, OU são mantidas mas validadas campo-a-campo contra o tipo gerado.
- [ ] CA-06: `npx tsc --noEmit` passa sem erros e `npm run build` conclui com sucesso.
- [ ] CA-07: Nenhum `as never` permanece nos arquivos do módulo `src/features/activities/`.

## Escopo

**IN:**
- Regenerar `src/integrations/supabase/types.ts` (tabelas de activities + colunas de transcrição em `lessons`).
- Remover `as never`/`as any` relacionados a activities e transcrição.
- Derivar/alinhar as interfaces manuais do módulo activities a partir dos tipos gerados.

**OUT:**
- Remover o padrão `(supabase as any)` dos demais módulos (gamification, library, quiz, courses, messages, video, lesson, community, certificates, learning paths) — são tabelas já tipadas; eventual limpeza é outra story.
- Qualquer mudança de schema/migração (esta story não cria nem altera tabelas).
- `tutor_messages`, `user_points`, `user_badges` (já tipados).

## Passos de Implementação

1. Confirmar link do projeto Supabase: `supabase projects list` e, se necessário, `supabase link --project-ref glarutjwjwqfmwyfqdug`.
2. Regenerar os tipos: `supabase gen types typescript --linked --schema public > src/integrations/supabase/types.ts` (ou `--project-id glarutjwjwqfmwyfqdug`). Conferir no diff que as 4 tabelas de activities e as colunas `transcription_text`/`transcription_source` em `lessons` apareceram.
3. Em `src/features/activities/hooks/useActivities.ts`: trocar `.from("activities" as never)` por `.from("activities")` em todas as ocorrências; substituir as interfaces manuais por aliases derivados, ex.: `export type Activity = Tables<"activities">;` (importando `Tables` de `@/integrations/supabase/types`), mantendo o tipo composto `Activity & { activity_questions: ... }` onde já é usado.
4. Em `src/features/activities/hooks/useSubmissions.ts`: trocar `.from("activity_submissions" as never)` por `.from("activity_submissions")`; alinhar `SubmissionStatus`/interface ao enum do CHECK (`'draft' | 'submitted' | 'graded' | 'returned'`).
5. Em `src/features/activities/components/QuestionEditor.tsx`: remover os `as never` de `.from(...)` e do `insert(opts as never)`; ajustar tipagem do payload de insert com `TablesInsert<"activity_question_options">`.
6. Em `src/features/admin/components/TranscriptionPanel.tsx`: remover o cast manual do retorno do `.select("transcription_text, transcription_source")`, agora que `lessons.Row` tem os campos.
7. Em `src/pages/admin/Reports.tsx`: remover/estreitar os `as any` dos joins de `activity_submissions`/`courses`/`quizzes` usando os tipos gerados.
8. Conferir `SubmissionReview.tsx` e `QuizActivity.tsx`, que consomem os tipos do hook, e ajustar imports se as interfaces viraram aliases.
9. Rodar `npx tsc --noEmit`, `npm run lint` e `npm run build`; corrigir divergências reveladas pelos tipos reais (ex.: campos opcionais/NOT NULL).

## Arquivos Afetados (File List)

- [ ] `src/integrations/supabase/types.ts`
- [ ] `src/features/activities/hooks/useActivities.ts`
- [ ] `src/features/activities/hooks/useSubmissions.ts`
- [ ] `src/features/activities/components/QuestionEditor.tsx`
- [ ] `src/features/activities/components/SubmissionReview.tsx`
- [ ] `src/features/activities/components/QuizActivity.tsx`
- [ ] `src/features/admin/components/TranscriptionPanel.tsx`
- [ ] `src/pages/admin/Reports.tsx`

## Testes

- [ ] `npx tsc --noEmit` sem erros.
- [ ] `npm run build` conclui com sucesso.
- [ ] `npm run lint` sem novos erros.
- [ ] `grep -rn "as never" src/features/activities/` retorna vazio.
- [ ] Smoke no preview: editor de curso lista/cria atividade tipo quiz (questões + opções), aluno matriculado abre atividade publicada e envia submissão, instrutor revisa em `SubmissionReview`, painel de transcrição (`TranscriptionPanel`) exibe `transcription_text`/`transcription_source` sem regressão.

## Rastreabilidade

- Mapeamento: `Projeto/Mapeamento do Sistema.md` (Registro de Riscos — risco P2 de tipos / `types.ts` defasado)
- Memória do usuário: "Schema Supabase é source of truth" (consultar `src/integrations/supabase/types.ts` antes de `.select()`)
- Stories relacionadas: STORY-030 (entrega da inteligência de vídeo/transcrição que adicionou as colunas em `lessons`)
