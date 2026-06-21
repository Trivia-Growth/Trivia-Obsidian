# STORY-048 — Gamificação confiável (triggers no banco + badges que funcionam)

**Módulo:** Gamificação / Banco (Triggers)
**Sprint:** Conexões & Jornadas
**Prioridade:** P2
**Status:** concluido
> **CONCLUÍDA 18/06/2026.**
> - Migration `20260618140000_gamification_triggers.sql`: índice único parcial em `user_points` (dedup antes) + helpers `award_points`/`award_badge`/`update_streak` + 5 triggers (`gamify_on_lesson_complete`, `gamify_on_course_complete`, `gamify_on_community_comment`, `gamify_on_lesson_comment`, `notify_on_certificate`).
> - `first_comment` e `streak_7` agora são concedíveis (eram impossíveis); `award_badge` notifica conquista nova.
> - Frontend: removidas `useAwardPoints`/`useUnlockBadge`/`useGamificationActions` e as chamadas no `CourseDetail` (gamificação agora 100% no banco; hook só leitura). Type-check OK.
> - **Certificado** (adiado da STORY-046): `notify_on_certificate` adicionado aqui.
> - **Teste funcional real:** 10 pts/aula + first_lesson, idempotente (segue 10 após 2º update), 100 pts/curso + course_complete, notificação de certificado — todos ✅. `streak_7`/`first_comment` validados por lógica (mesmos helpers).
> - `PROJECT_REQUIREMENTS.md` §10 atualizado.
**Estimativa:** 1 dia
**Origem:** [[Mapeamento-Conexoes-e-Jornadas]] — jornada quebrada #6

---

## Contexto

A gamificação funciona **só pelo player** (`CourseDetail.tsx:281-288` → `useGamification`): conclui aula = 10 pts, conclui curso = 100 pts, badges `first_lesson`/`ten_lessons`/`fifty_lessons`/`course_complete`/`five_courses`. Dois problemas:

1. **Badges impossíveis.** `first_comment` tem a função `onFirstComment()` definida (`useGamification.ts:283-295`) mas **nunca é chamada** (código morto). `streak_7` é definido mas **não tem nenhuma lógica de detecção** — nunca é atribuído. Ambos aparecem como conquistáveis e são impossíveis.
2. **Tudo client-side.** Pontos/badges só existem se o aluno passar pelo player. Conclusão de aula por outro caminho (import, admin, API) não pontua. Não há trigger nem edge function.

## Decisão de arquitetura

Mover a atribuição de **pontos e badges para triggers no banco** (`SECURITY DEFINER`), na mesma linha da [[STORY-046]]. O gatilho natural é `lesson_progress` (conclusão de aula) e `enrollments` (conclusão de curso):

- `lesson_progress` AFTER UPDATE quando `completed` vira `true` → +10 pts (`action_type='lesson_complete'`, `reference_id=lesson_id`, idempotente por `reference_id`), checar badges de quantidade de aulas.
- `enrollments` AFTER UPDATE quando `progress_percentage` chega a 100 → +100 pts (`course_complete`), badge `course_complete`, contar cursos concluídos para `five_courses`.

Badges consertados:
- **`first_comment`** — trigger em `community_comments`/`lesson_comments` AFTER INSERT: se for o primeiro comentário do usuário, desbloquear.
- **`streak_7`** — trigger em `lesson_progress` que mantém uma sequência de dias com atividade. Calcular a partir das datas de `lesson_progress.completed_at` do usuário (7 dias consecutivos com pelo menos 1 aula concluída). Implementar como função que recomputa o streak no insert/update.

Idempotência: `user_points` ganha índice único parcial por (`user_id`, `action_type`, `reference_id`) para não pontuar a mesma aula duas vezes; `user_badges` já é por `badge_key` (garantir `UNIQUE(user_id, badge_key)`).

> **Migração sem regressão:** ao mover para triggers, **remover** a atribuição client-side equivalente em `useGamification`/`CourseDetail.tsx` para não duplicar pontos. Atenção também à interação com a notificação de "curso concluído" e badge (ver [[STORY-046]] CA-04) — definir uma única fonte de verdade.

## Acceptance Criteria

- [ ] CA-01: Concluir aula dá +10 pts e concluir curso dá +100 pts via **trigger**, independente do caminho (player, admin, import).
- [ ] CA-02: Sem duplicação — pontos não são dados duas vezes para a mesma aula/curso (índice único por `action_type`+`reference_id`); atribuição client-side removida.
- [ ] CA-03: Badges `first_lesson`, `ten_lessons`, `fifty_lessons`, `course_complete`, `five_courses` continuam funcionando (agora via trigger).
- [ ] CA-04: `first_comment` passa a ser atribuído no primeiro comentário (comunidade ou aula).
- [ ] CA-05: `streak_7` passa a ser atribuído ao completar 7 dias consecutivos com atividade — **ou**, se inviável agora, **removido** da lista de badges visíveis (não deixar conquista impossível).
- [ ] CA-06: Leaderboard e perfil continuam lendo `user_points`/`user_badges` sem mudança de UI.
- [ ] CA-07: Backfill opcional — não recalcular histórico (pontos passados ficam como estão); documentar a decisão.
- [ ] CA-08: Multi-tenant respeitado (pontos/badges com `tenant_id` correto vindo da linha de origem).

## Escopo

**IN:**
- Migration: triggers de pontos/badges em `lesson_progress` e `enrollments`; badges `first_comment` e `streak_7`.
- Índices de idempotência (`user_points`, `user_badges`).
- Remoção da atribuição client-side duplicada.

**OUT:**
- Novos tipos de badge além dos existentes.
- Loja/resgate de pontos.
- Recalcular histórico retroativo (CA-07).

## Arquitetura — Migration (trechos)

```sql
-- idempotência de pontos
create unique index if not exists ux_user_points_action_ref
  on public.user_points (user_id, action_type, reference_id)
  where reference_id is not null;

-- +10 pts ao concluir aula
create or replace function public.award_lesson_points()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.completed = true and (old.completed is distinct from new.completed) then
    insert into public.user_points (tenant_id, user_id, points, action_type, reference_id)
    values (new.tenant_id, new.user_id, 10, 'lesson_complete', new.lesson_id)
    on conflict (user_id, action_type, reference_id) where reference_id is not null do nothing;

    perform public.check_lesson_badges(new.tenant_id, new.user_id);
    perform public.update_streak(new.tenant_id, new.user_id); -- streak_7
  end if;
  return new;
end; $$;
create trigger trg_award_lesson_points after update on public.lesson_progress
  for each row execute function public.award_lesson_points();

-- primeiro comentário
create or replace function public.award_first_comment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_badges (tenant_id, user_id, badge_key)
  values (new.tenant_id, new.user_id, 'first_comment')
  on conflict (user_id, badge_key) do nothing;
  return new;
end; $$;
create trigger trg_first_comment after insert on public.community_comments
  for each row execute function public.award_first_comment();
-- (trigger análogo em lesson_comments)
```

> Funções auxiliares a implementar: `check_lesson_badges` (conta `lesson_progress.completed` do usuário e desbloqueia `first/ten/fifty_lessons`), `award_course_points` + `check_course_badges` (em `enrollments`), `update_streak` (recomputa sequência de dias).

## Arquivos Afetados

- [ ] `supabase/migrations/<timestamp>_gamification_triggers.sql` (novo)
- [ ] `src/features/gamification/hooks/useGamification.ts` (remover atribuição duplicada; manter só leitura)
- [ ] `src/pages/CourseDetail.tsx` (remover chamadas de award que viraram trigger)
- [ ] `PROJECT_REQUIREMENTS.md` (seção 10 Gamificação)

## Plano de Teste

- Concluir aula → +10 pts uma única vez (reabrir/recompletar não duplica).
- Concluir curso → +100 pts + badge `course_complete`.
- Concluir aula via ação de admin (não pelo player) → também pontua.
- Primeiro comentário → badge `first_comment`.
- 7 dias consecutivos com aula → `streak_7` (ou badge removido se adiado).
- Leaderboard reflete os pontos.

## Rastreabilidade

- [[Mapeamento-Conexoes-e-Jornadas]] §1 jornada #6
- Evidência: `useGamification.ts:283-295` (código morto `onFirstComment`), `streak_7` sem lógica
- Relaciona com: [[STORY-046]] (evitar duplicar notificação de badge/curso concluído)
