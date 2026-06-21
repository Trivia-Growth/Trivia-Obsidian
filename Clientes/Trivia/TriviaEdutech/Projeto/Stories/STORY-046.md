# STORY-046 — Motor de notificações por eventos (triggers no banco)

**Módulo:** Notificações / Banco (Triggers) / Realtime
**Sprint:** Conexões & Jornadas
**Prioridade:** P1
**Status:** concluido
> **CONCLUÍDA 18/06/2026.**
> - Migration `20260618130000_notification_engine.sql`: helper `create_notification` + 5 triggers (`notify_on_enrollment`, `notify_on_activity_graded`, `notify_on_direct_message`, `notify_on_community_comment`, `notify_on_community_like`), todos `SECURITY DEFINER`. Aplicada via `db push`.
> - **Refinamento anti-spam:** matrícula só notifica quando `auth.uid() IS DISTINCT FROM new.user_id` (auto-matrícula e entrar em trilha não geram spam; admin/batch/compra notificam).
> - `mp-webhook`: removida a notificação manual de compra (agora coberta pelo trigger de matrícula); função re-deployada.
> - Realtime no sino (`useNotifications`) + fallback de refetch 2 min.
> - **Teste funcional real:** todos os 5 triggers criaram exatamente 1 notificação cada; `activity_graded` não duplica em update que não muda status; nenhum notifica o próprio ator.
> - Type-check OK. `PROJECT_REQUIREMENTS.md` §12 atualizado.
> - **Decisão:** trigger de certificado **adiado** — hoje já existe notificação client-side de "curso concluído → certificado disponível" (`useGamification`); migra para trigger na [[STORY-048]] junto com a gamificação, evitando duplicação.
**Estimativa:** 1,5 dia
**Origem:** [[Mapeamento-Conexoes-e-Jornadas]] — jornada quebrada #3 (peça central)

---

## Contexto

A tabela `notifications` existe e a UI (`NotificationBell`, `useNotifications`) funciona. Mas **quase nada cria notificação**. Hoje só geram notificação: compra aprovada (`mp-webhook:220`), badge desbloqueado e curso concluído (`useGamification.ts`) e nudge manual do admin (`Dashboard.tsx:217`). Tudo client-side, dentro de fluxos específicos.

**Não notificam (deveriam):**
- Receber uma **DM** (`useMessages.ts:155`) — o aluno nunca sabe que recebeu mensagem.
- Ser **matriculado** num curso (`enrollments` insert em `CourseDetail.tsx:211`, `Checkout.tsx:89`, e agora também via trilha — [[STORY-044]]).
- **Certificado** emitido (`useCertificates.ts:68`) — só existe a notificação genérica de "curso concluído".
- Atividade **corrigida/devolvida** (`submit-activity` graded/returned).
- **Comentário/like** na comunidade e em aulas (`CommunityFeed.tsx:172-210`).

## Decisão de arquitetura

**Centralizar a criação de notificações em triggers `SECURITY DEFINER` no banco**, não no frontend. Esta é a peça central da estratégia do mapeamento: um evento de domínio (insert/update numa tabela) dispara a notificação por **qualquer** caminho que o gere, eliminando a dependência do player/telas específicas.

### 1. Helper único

```sql
create or replace function public.create_notification(
  p_tenant_id uuid, p_user_id uuid, p_type text,
  p_title text, p_body text, p_link text default null
) returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (tenant_id, user_id, type, title, body, link, read)
  values (p_tenant_id, p_user_id, p_type, p_title, p_body, p_link, false);
end; $$;
```

### 2. Triggers por evento

| Evento | Tabela / momento | Destinatário | type |
|---|---|---|---|
| Matrícula | `enrollments` AFTER INSERT | `new.user_id` | `enrollment` |
| Certificado | `certificates` AFTER INSERT | `new.user_id` | `certificate` |
| Atividade corrigida | `activity_submissions` AFTER UPDATE (status → graded/returned) | `new.user_id` | `activity_graded` |
| DM recebida | `direct_messages` AFTER INSERT | o **outro** participante da conversa | `message` |
| Comentário na comunidade | `community_comments` AFTER INSERT | autor do post (se ≠ comentarista) | `community_comment` |
| Like na comunidade | `community_likes` AFTER INSERT | autor do post (se ≠ curtidor) | `community_like` |

> Os triggers de **conclusão de curso** e **badge** continuam onde estão por ora (client-side via `useGamification`), ou migram na [[STORY-048]]. Esta story **não** os duplica — atenção para não gerar notificação dobrada de "curso concluído".

### Exemplos de trigger

```sql
-- Matrícula
create or replace function public.notify_on_enrollment()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_title text;
begin
  select title into v_title from public.courses where id = new.course_id;
  perform public.create_notification(
    new.tenant_id, new.user_id, 'enrollment',
    'Você foi matriculado', coalesce(v_title,'um curso') || ' está disponível para você.',
    '/courses/' || new.course_id
  );
  return new;
end; $$;
create trigger trg_notify_enrollment after insert on public.enrollments
  for each row execute function public.notify_on_enrollment();

-- DM recebida (notifica o outro participante)
create or replace function public.notify_on_direct_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_tenant uuid; v_recipient uuid; v_sender_name text;
begin
  select c.tenant_id,
         case when c.participant_1 = new.sender_id then c.participant_2 else c.participant_1 end
    into v_tenant, v_recipient
  from public.conversations c where c.id = new.conversation_id;

  select full_name into v_sender_name from public.profiles where user_id = new.sender_id;

  perform public.create_notification(
    v_tenant, v_recipient, 'message',
    'Nova mensagem', coalesce(v_sender_name,'Alguém') || ' enviou uma mensagem.',
    '/messages'
  );
  return new;
end; $$;
create trigger trg_notify_dm after insert on public.direct_messages
  for each row execute function public.notify_on_direct_message();

-- Atividade corrigida (só quando muda para graded/returned)
create or replace function public.notify_on_activity_graded()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_title text;
begin
  if new.status in ('graded','returned')
     and (old.status is distinct from new.status) then
    select title into v_title from public.activities where id = new.activity_id;
    perform public.create_notification(
      new.tenant_id, new.user_id, 'activity_graded',
      'Atividade corrigida',
      coalesce(v_title,'Sua atividade') || ' foi avaliada.',
      null
    );
  end if;
  return new;
end; $$;
create trigger trg_notify_activity_graded after update on public.activity_submissions
  for each row execute function public.notify_on_activity_graded();
```

(Análogos para `certificates`, `community_comments`, `community_likes` — sempre checando `autor ≠ ator` para não notificar a si mesmo.)

### 3. Remover criação duplicada no frontend

Onde hoje o front cria notificação manualmente para eventos agora cobertos por trigger, **remover** para não duplicar:
- `mp-webhook` cria `enrollment` + notificação ao aprovar compra → como o trigger de `enrollments` passará a notificar, **remover a criação manual de notificação** no webhook (mantendo a criação da matrícula).
- Conferir `useGamification` para não duplicar "curso concluído".

## Acceptance Criteria

- [ ] CA-01: Helper `create_notification` criado.
- [ ] CA-02: Triggers ativos para: matrícula, certificado, atividade corrigida, DM, comentário e like na comunidade.
- [ ] CA-03: Nenhuma notificação para si mesmo (comentar/curtir o próprio post não notifica).
- [ ] CA-04: Sem **duplicação** — remover criação manual de notificação de matrícula no `mp-webhook`; conferir gamificação.
- [ ] CA-05: Cada notificação tem `link` clicável que leva à tela certa (curso, mensagens, certificados, etc.).
- [ ] CA-06: RLS — triggers `SECURITY DEFINER`, mas a notificação é criada com o `tenant_id` e `user_id` corretos do destinatário; o aluno só lê as próprias (policy existente preservada).
- [ ] CA-07: (Opcional, se já houver infra) habilitar **Supabase Realtime** na tabela `notifications` para o sino atualizar na hora em vez de só no refetch de 2 min.
- [ ] CA-08: `notifications.type` documentado — lista fechada de tipos (`enrollment`, `certificate`, `activity_graded`, `message`, `community_comment`, `community_like`, `purchase`, `achievement`, `course_complete`, `nudge`).

## Escopo

**IN:**
- Migration com helper + 6 triggers.
- Limpeza da criação manual duplicada (`mp-webhook`).
- (Opcional) Realtime no sino (`useNotifications`).
- Documentar tipos de notificação.

**OUT:**
- Envio por **email** (segue só in-app; email é dívida à parte — nudge por email).
- Preferências de notificação por usuário (silenciar tipos) — futura.
- Push/web-push.

## Arquivos Afetados

- [ ] `supabase/migrations/<timestamp>_notification_engine.sql` (novo)
- [ ] `supabase/functions/mp-webhook/index.ts` (remover criação manual de notificação de matrícula)
- [ ] `src/features/notifications/hooks/useNotifications.ts` (opcional: subscription Realtime)
- [ ] `PROJECT_REQUIREMENTS.md` (seção 12 Notificações: lista de tipos e gatilhos)
- [ ] `docs/EDGE_FUNCTIONS.md` (nota no `mp-webhook` sobre a mudança)

## Passos

1. Criar migration com helper + triggers.
2. `supabase db push`.
3. Remover criação manual de notificação no `mp-webhook` e `supabase functions deploy mp-webhook`.
4. (Opcional) Realtime no `useNotifications`.
5. Testar cada gatilho no preview.
6. Atualizar docs no mesmo commit.

## Plano de Teste

- Matricular aluno (UI, trilha [[STORY-044]] e compra) → 1 notificação de matrícula (sem duplicar com a compra).
- Enviar DM → o **destinatário** recebe notificação, o remetente não.
- Corrigir atividade → aluno recebe; salvar como rascunho não notifica.
- Comentar/curtir post de outro → autor recebe; no próprio post → nada.
- Emitir certificado → notificação com link para `/certificates`.
- Conferir que não há duplicação de "curso concluído".

## Rastreabilidade

- [[Mapeamento-Conexoes-e-Jornadas]] §1 jornada #3 (resolve 5 desconexões de uma vez)
- Evidência: `useMessages.ts:155`, `useCertificates.ts:68`, `CommunityFeed.tsx:172-210`, `mp-webhook/index.ts:220`
- Relaciona com: [[STORY-044]] (matrícula via trilha passa a notificar), [[STORY-045]] (corrigir atividade notifica), [[STORY-048]]
