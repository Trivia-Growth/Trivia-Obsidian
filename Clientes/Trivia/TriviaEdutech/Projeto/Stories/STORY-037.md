# STORY-037 — Robustez de Edge Functions: matrícula em submit-quiz/ai-tutor, slug blacklist e delete-tenant transacional

**Módulo:** Edge Functions / Segurança  
**Sprint:** Segurança  
**Prioridade:** P2  
**Status:** concluido  
**Estimativa:** 1 dia  
**Origem:** Mapeamento do Sistema (2026-06-17) — Registro de Riscos

> **CONCLUÍDA 2026-06-17** (commit `3a9d312`). 4 edge functions deployadas via Management API (`--use-api`, sem Docker) + migration aplicada.
> - CA-01/03 ✅ `submit-quiz`: resolve course_id (quiz.module_id ou lesson→module→course), valida tenant (404 se outro tenant) e matrícula (403 se não matriculado e não admin/instrutor) antes de gravar tentativa.
> - CA-02/03 ✅ `ai-tutor`: valida tenant + matrícula antes de montar prompt/chamar IA (nenhuma chamada de IA p/ não-matriculado).
> - CA-04 ✅ `create-org`: `_shared/reserved-slugs.ts` (blacklist com admin/auth/explore/blog/superadmin/default/etc.); slug reservado recebe sufixo.
> - CA-05 ✅ `manage-users/create-tenant`: rejeita slug reservado com 400.
> - CA-06/07/08 ✅ `delete-tenant`: substituído cascade manual pela RPC `delete_tenant_cascade` (SECURITY DEFINER, atômica). Migration `20260617235000`: ordem leaf-first validada em prod (teste ROLLBACK em tenant real, sem violação de FK); guard do tenant default (raise exception ✅ testado); EXECUTE só `service_role` (authenticated → permission denied ✅ testado). Edge trata erro da RPC (problem 5xx, sem mascarar) e só então deleta usuários do Auth; default bloqueado + superadmin exigido preservados.
> - CA-09 ✅ deploy individual das 4 functions OK; smoke: submit-quiz/ai-tutor/manage-users sem auth → HTTP 401 (não 500), confirmando carga sem erro do código novo.
> - **Ressalva de verificação:** testes E2E finos (403 real p/ não-matriculado; sufixo em slug reservado) exigem sessão de usuário/efeitos colaterais — validados por revisão de código + padrão de `submit-activity`/`video-proxy`; a RPC de delete foi testada diretamente.

---

## Contexto

Três lacunas de robustez/segurança foram identificadas nas Edge Functions Deno do projeto. Todas confirmadas no código atual.

### Lacuna 1 — `submit-quiz` e `ai-tutor` não validam matrícula (enrollment)

Outras functions que servem conteúdo a alunos validam explicitamente se o usuário está matriculado no curso antes de liberar a operação:

- `supabase/functions/submit-activity/index.ts` (linhas 138-146):
  ```ts
  // Verificar matrícula
  const { data: enrollment } = await adminClient
    .from("enrollments")
    .select("id")
    .eq("course_id", activity.course_id)
    .eq("user_id", user.id)
    .single();
  if (!enrollment) return problem("Forbidden", 403, "Aluno não matriculado neste curso", requestId, cors);
  ```
- `supabase/functions/video-proxy/index.ts` (linhas 561-571) faz checagem equivalente para o caso "get" de aluno, traversando `lessons → modules → courses → enrollments`.

Já `submit-quiz` e `ai-tutor` **não fazem essa checagem**:

- `supabase/functions/submit-quiz/index.ts`: após autenticar (`auth.getUser()`, linhas 73-80) e validar `max_attempts` (linhas 124-141), insere a tentativa (`quiz_attempts`, linhas 191-208) usando o client admin (que **bypassa RLS**, linha 106). Em nenhum ponto verifica `enrollments`. Qualquer usuário autenticado de qualquer tenant que conheça/adivinhe um `quizId` (UUID) pode submeter tentativas. O `tenant_id` gravado vem de `get_user_tenant_id` (linha 180), ou seja, do usuário — não do quiz —, então uma tentativa pode ser gravada com `tenant_id` diferente do dono real do quiz.
- `supabase/functions/ai-tutor/index.ts`: após autenticar (linhas 61-67) carrega a aula por `lessonId` (linhas 89-93) com client admin (linha 71) e gera resposta de IA sobre o conteúdo da aula (incluindo `content_body` e `transcription_text`, linhas 123-138) **sem verificar se o usuário está matriculado no curso da aula**. Isso permite exfiltrar conteúdo de aulas (incluindo transcrição de vídeo) de cursos em que o usuário não está matriculado, além de consumir crédito de IA do tenant.

A tabela `quizzes` (`src/integrations/supabase/types.ts`, linhas 1711-1738) possui `lesson_id` e `module_id` (ambos `nullable`), permitindo chegar ao `course_id` via `lesson → module → course` ou `module → course`. A tabela `lessons` expõe `module_id` (usada em `ai-tutor`, linha 91 e 107). Logo a checagem de matrícula é viável em ambas as functions reusando o padrão de `submit-activity`.

**Impacto:** quebra de isolamento multi-tenant e de controle de acesso por matrícula em duas functions sensíveis (gravação de notas e tutor de IA com conteúdo do curso).

### Lacuna 2 — Sem blacklist de slugs reservados na criação de organização

`supabase/functions/create-org/index.ts` gera o slug do tenant a partir do nome da empresa (`slugify`, linhas 46-54) e só garante unicidade contra slugs já existentes (linhas 86-94), acrescentando sufixo se houver colisão. **Não há blacklist de slugs reservados.**

Em `src/App.tsx`, a rota de tenant por path é `"/:orgSlug"` (linha 174) e `"/:orgSlug/auth"`, `"/:orgSlug/explore/*"` (linhas 175-182). Essas rotas dinâmicas competem com os prefixos estáticos do app, declarados antes no mesmo `Routes`:

- `/landing` (93), `/signup` (94), `/auth` (95), `/invite/:token` (96), `/payment-status` (97), `/ajuda` (98)
- `/explore` e filhos (101-106), `/blog`, `/blog/:slug` (107-108)
- `/admin/*` (144-162), `/superadmin/tenants` (169) e demais rotas protegidas (`/courses`, `/profile`, `/settings`, etc., linhas 114-137)

Se um tenant receber slug como `admin`, `auth`, `explore`, `blog`, `superadmin`, `signup`, `landing`, `courses`, `settings`, etc., a URL `/{slug}` pode colidir com rotas estáticas (o React Router prioriza match mais específico, mas há ambiguidade em níveis e em links gerados pela plataforma), gerando comportamento imprevisível de navegação e potencial confusão de contexto de tenant. A resolução de tenant documentada (`CLAUDE.md` → Resolução de tenant) também usa o slug `default` para o tenant superadmin — outro valor que jamais deve ser atribuído a um tenant comum.

**Impacto:** colisão de rota / sequestro visual de rotas reservadas; risco de um tenant "ocupar" um caminho administrativo público.

### Lacuna 3 — SEC-008: `delete-tenant` faz cascade manual sem transação

`supabase/functions/manage-users/index.ts`, ação `delete-tenant` (linhas 357-385), apaga dados em múltiplas tabelas em sequência, **sem transação**:

```ts
if (profiles) {
  for (const p of profiles) {
    await adminClient.from("user_roles").delete()...
    await adminClient.from("profiles").delete()...
    await adminClient.auth.admin.deleteUser(p.user_id);
  }
}
await adminClient.from("courses").delete().eq("tenant_id", tenant_id);
await adminClient.from("enrollments").delete().eq("tenant_id", tenant_id);
await adminClient.from("video_platform_settings").delete().eq("tenant_id", tenant_id);
await adminClient.from("tenants").delete().eq("id", tenant_id);
```

Nenhum dos `await` verifica erro e não há rollback. Se qualquer passo falhar no meio (ex.: `deleteUser` de um usuário, ou um `delete` que esbarre em FK de tabela não listada), o tenant fica em **estado parcial**: usuários deletados mas tenant ainda existente, ou cursos removidos com matrículas órfãs, sem forma automática de reverter. A lista de tabelas também é manual e pode não cobrir todas as tabelas com `tenant_id` (o projeto possui muitas tabelas de negócio com `tenant_id`, conforme `CLAUDE.md` → Multi-Tenancy), deixando órfãos.

**Impacto (SEC-008):** corrupção de dados / estado inconsistente do tenant em caso de falha parcial; cleanup incompleto de dados.

## Acceptance Criteria

- [ ] CA-01: `submit-quiz` valida matrícula antes de gravar a tentativa: resolve o `course_id` do quiz (via `lesson_id`/`module_id` → `modules` → `courses`) e confirma `enrollments` para `(course_id, user.id)`; se não matriculado, retorna `403 Forbidden` (problem+json, no padrão das outras functions). Admin/instructor do tenant podem ser isentos da checagem (mesmo critério aplicado nas demais functions, se houver), mas alunos não.
- [ ] CA-02: `ai-tutor` valida matrícula antes de gerar a resposta: resolve o `course_id` da aula (`lessons.module_id` → `modules.course_id`) e confirma `enrollments` para `(course_id, user.id)`; se não matriculado, retorna `403 Forbidden`. Nenhuma chamada de IA (`callAI`) é feita para usuário não matriculado.
- [ ] CA-03: A checagem de matrícula respeita o tenant: a tentativa/uso só é permitido quando o curso pertence ao mesmo tenant do usuário; tentativa de acessar quiz/aula de outro tenant retorna `403`/`404` (sem vazar existência do recurso de forma desnecessária).
- [ ] CA-04: `create-org` rejeita ou ajusta slugs reservados: existe uma blacklist explícita contendo, no mínimo, `admin`, `auth`, `explore`, `blog`, `signup`, `landing`, `superadmin`, `invite`, `payment-status`, `ajuda`, `courses`, `profile`, `settings`, `plans`, `community`, `certificates`, `learning-paths`, `members`, `messages`, `leaderboard`, `grades`, `purchases`, `calendar`, `help`, `cursos`, `default`. Se o slug gerado cair na blacklist, recebe sufixo (mesmo mecanismo da colisão de unicidade) garantindo um slug livre e não reservado.
- [ ] CA-05: A mesma blacklist é aplicada também onde slug é informado manualmente: ação `create-tenant` de `manage-users` (`slug` no payload, linhas 41-49 e 185-194) rejeita slugs reservados com `400`/`409` e mensagem clara.
- [ ] CA-06: `delete-tenant` deixa de produzir estado parcial: a remoção em cascata é feita de forma atômica (RPC/transação no Postgres) OU convertida em soft-delete (marcar tenant como inativo) + cleanup assíncrono idempotente. Em qualquer abordagem, falha no meio do processo não pode deixar o tenant em estado parcialmente apagado.
- [ ] CA-07: `delete-tenant` trata erros: cada passo crítico verifica `error` e, em caso de falha, retorna `problemResponse` (5xx/4xx apropriado) sem mascarar a falha como sucesso.
- [ ] CA-08: Comportamento existente preservado: `delete-tenant` continua bloqueando a exclusão do tenant default `00000000-0000-0000-0000-000000000001` (linhas 362-363) e exigindo superadmin (linha 359); CORS, Zod e auth das três functions permanecem como hoje.
- [ ] CA-09: `npx tsc --noEmit` passa e `npm run lint` sem novos erros; cada Edge Function alterada faz deploy individual (`supabase functions deploy <nome>`).

## Escopo

**IN:**
- Checagem de matrícula em `submit-quiz/index.ts` e `ai-tutor/index.ts`, reaproveitando o padrão de `submit-activity`/`video-proxy`.
- Blacklist de slugs reservados em `create-org/index.ts` e na ação `create-tenant` de `manage-users/index.ts`.
- Tornar `delete-tenant` atômico via RPC/transação (nova migração com função `SECURITY DEFINER`) ou soft-delete + cleanup, com tratamento de erro.
- (Se RPC) nova migração SQL para a função de exclusão transacional do tenant.

**OUT:**
- Mudanças de UI/frontend (telas de criação de org, gestão de usuários, quiz, tutor).
- Reescrita das demais ações de `manage-users` (apenas `delete-tenant` e o slug de `create-tenant`).
- Alteração das regras de RLS das tabelas envolvidas (a checagem é feita no edge com service role, como nas demais functions).
- Mudança no fluxo de geração de slug que não seja a inclusão da blacklist (o `slugify` e o sufixo de unicidade permanecem).
- Cobertura de novos prefixos de rota no `App.tsx` (a story não muda rotas; apenas evita slugs que colidam com as existentes).

## Passos de Implementação

1. **submit-quiz** (`supabase/functions/submit-quiz/index.ts`): após buscar o quiz (linhas 109-121), resolver o `course_id`. O quiz tem `lesson_id` e/ou `module_id`; obter `module_id` (direto ou via `lessons`) e então `modules.course_id`. Em seguida consultar `enrollments` por `(course_id, user_id)` com o `supabaseAdmin` (mesmo padrão de `submit-activity`, linhas 139-146). Se não houver matrícula (e o usuário não for admin/instructor do tenant do curso), retornar `403` em `application/problem+json` antes do passo de inserção (linha 191). Garantir que o `tenant_id` do curso e o do usuário coincidam (CA-03).
2. **ai-tutor** (`supabase/functions/ai-tutor/index.ts`): após carregar `lesson` (linhas 89-93) e `moduleData` (linhas 103-107), usar `moduleData.course_id` para checar `enrollments` por `(course_id, user.id)`. Se não matriculado, retornar `404`/`403` antes de montar o prompt e chamar `callAI` (linhas 156-157). Manter a persistência em `tutor_messages` apenas no caminho autorizado.
3. **create-org** (`supabase/functions/create-org/index.ts`): definir `const RESERVED_SLUGS = new Set([...])` com os valores do CA-04 (derivados das rotas estáticas de `src/App.tsx`). Após `slugify` (linha 85), se `RESERVED_SLUGS.has(slug)` (ou colisão de unicidade), aplicar o mesmo sufixo já usado na linha 93; reavaliar até obter slug livre e não reservado.
4. **manage-users / create-tenant** (`supabase/functions/manage-users/index.ts`): reutilizar a mesma blacklist (extrair para `_shared` se conveniente) e, no bloco `create-tenant` (linhas 185-194), rejeitar `slug` reservado com `problemResponse("Validation Error", 400, ...)` antes do insert.
5. **delete-tenant** (escolher uma abordagem):
   - **Abordagem A (recomendada) — RPC transacional:** criar migração `supabase/migrations/<timestamp>_delete_tenant_fn.sql` com função `public.delete_tenant_cascade(_tenant_id uuid)` `SECURITY DEFINER` que, dentro de uma única transação, apaga (ou usa FKs `ON DELETE CASCADE` já existentes) todas as tabelas com `tenant_id` e o próprio tenant, bloqueando o tenant default. Trocar o bloco das linhas 365-381 por `await adminClient.rpc("delete_tenant_cascade", { _tenant_id: tenant_id })` + tratamento de erro. A remoção dos usuários do Auth (`auth.admin.deleteUser`) permanece no edge (não dá para fazer dentro do SQL), executada após o sucesso da RPC.
   - **Abordagem B — soft-delete + cleanup:** marcar `tenants` como inativo (coluna de status) e disparar cleanup idempotente assíncrono. Documentar a coluna/estado se escolhida.
6. Tratar erro de cada passo de `delete-tenant` (CA-07): verificar `error` retornado e responder via `problemResponse`.
7. Rodar `npx tsc --noEmit` e `npm run lint`.
8. Deploy: `supabase functions deploy submit-quiz`, `supabase functions deploy ai-tutor`, `supabase functions deploy create-org`, `supabase functions deploy manage-users`; e `supabase db push` se a Abordagem A criar migração (ver `CLAUDE.md` → Deploy).

## Arquivos Afetados (File List)

- [ ] `supabase/functions/submit-quiz/index.ts` (checagem de matrícula + tenant)
- [ ] `supabase/functions/ai-tutor/index.ts` (checagem de matrícula antes do callAI)
- [ ] `supabase/functions/create-org/index.ts` (blacklist de slugs reservados)
- [ ] `supabase/functions/manage-users/index.ts` (blacklist em create-tenant + delete-tenant transacional/com tratamento de erro)
- [ ] `supabase/functions/_shared/reserved-slugs.ts` (opcional — blacklist compartilhada)
- [ ] `supabase/migrations/<timestamp>_delete_tenant_fn.sql` (novo — apenas se Abordagem A)

## Testes

- [ ] submit-quiz: usuário NÃO matriculado no curso do quiz recebe `403`; usuário matriculado consegue submeter (happy path inalterado).
- [ ] submit-quiz: usuário de outro tenant não consegue gravar tentativa em quiz de tenant alheio (CA-03).
- [ ] ai-tutor: usuário não matriculado recebe `403`/`404` e `callAI` não é invocado (sem consumo de IA); matriculado recebe resposta normalmente.
- [ ] create-org: nome de empresa que gera slug `admin`/`blog`/`auth`/`explore` resulta em slug com sufixo, nunca o slug reservado puro.
- [ ] manage-users create-tenant: payload com `slug` reservado retorna `400`/`409`.
- [ ] delete-tenant: exclusão de tenant comum remove todos os dados e o tenant de forma atômica; simular falha no meio (ex.: forçar erro) e confirmar que NÃO há estado parcial.
- [ ] delete-tenant: tentativa de apagar o tenant default `00000000-0000-0000-0000-000000000001` continua bloqueada (`409`); não-superadmin continua recebendo `403`.
- [ ] `npx tsc --noEmit` e `npm run lint` sem novos erros.

## Rastreabilidade

- Mapeamento: `Projeto/Mapeamento do Sistema.md` (Registro de Riscos) — 3 riscos P2 edge/segurança.
- SEC-008 — `delete-tenant` cascade manual sem transação (Lacuna 3).
- Padrão de referência (matrícula): `supabase/functions/submit-activity/index.ts` (linhas 138-146) e `supabase/functions/video-proxy/index.ts` (linhas 561-571).
- Rotas estáticas que originam a blacklist: `src/App.tsx` (linhas 93-182).
- Stories relacionadas: STORY-006 (segurança de edge functions optimize-content/mp-webhook), STORY-030 (uso de transcrição em ai-tutor/generate-quiz).
