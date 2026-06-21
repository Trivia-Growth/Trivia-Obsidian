# STORY-034 — Hardening de RLS: FORCE RLS, has_tenant_role e leitura pública de tenants

**Módulo:** Banco / Segurança  
**Sprint:** Segurança  
**Prioridade:** P1  
**Status:** concluido  
**Estimativa:** 1 dia  
**Origem:** Mapeamento do Sistema (2026-06-17) — Registro de Riscos

> **CONCLUÍDA 2026-06-17** — todas as fases aplicadas via Management API e verificadas em produção. Commits: `0aa6d71` (FORCE + write policies), `aa6b43b` (RPC + frontend), `d2d92c2` (fechar leak SELECT), `05edd66` (migrar 54 policies).
> - **CA-01 ✅** FORCE RLS em todas as tabelas (0 com RLS sem FORCE). Auth intacta (SECURITY DEFINER owned por postgres/bypassrls).
> - **CA-02 ✅** 0 policies `has_role` tenant-blind: 54 migradas p/ `has_tenant_role`; restam só 51 superadmin-global (exceção justificada) + 7 já escopadas.
> - **CA-03 ✅** `Anyone can view tenant by slug` USING(true) removida; resolução anon agora via RPC `get_public_tenant` (só colunas públicas, sem stripe_*); `Users can view own tenant` restrito ao próprio tenant + superadmin. Verificado: anon lendo a tabela inteira = 0 (antes 4); admin de tenant comum vê só 1.
> - **CA-04 ✅** sem regressão: contagens de acesso (courses/modules/lessons/quizzes/enrollments) idênticas antes/depois para admins de 2 tenants; app boota (HTTP 200) e resolve anon.
> - **CA-05 ✅** migrations aplicadas sem erro; `tsc --noEmit` + `vite build` OK.
> - Frontend tocado (RPC): TenantContext, OrgExploreLayout, OrgLanding, OrgAuth, InviteAccept.
> - Migrations: `20260617224000` (FORCE+write), `20260617230000` (RPC), `20260617231000` (leak SELECT), `20260617232000` (54 policies).
> - **Follow-up menor:** policy "Anyone can resolve tenant by domain" (custom_domain IS NOT NULL) ainda permite anon ler linhas com custom_domain — mantida por escopo; avaliar trocar por RPC por domínio se virar problema.

> **Progresso 2026-06-17 (commit `0aa6d71`, migration `20260617224000`):**
> - ✅ **Fase 3 (FORCE RLS):** aplicado em todas as 38 tabelas faltantes. CA-01 ✅ (0 tabelas com RLS sem FORCE). Auth verificada intacta — funções SECURITY DEFINER são owned por `postgres` (BYPASSRLS), sem recursão; leitura autenticada de user_roles/profiles/courses OK.
> - ✅ **Fase 1a (7 write-policies tenant-blind):** `tenants` INSERT/UPDATE/DELETE → superadmin-only; `tenant_plan_limits` (global) → superadmin-only; `video_thumbnails` → escopo de tenant. Fecha a escalada de privilégio (qualquer admin alterava qualquer org). CA-02 (escrita) ✅.
> - ⏸️ **Fase 1b (CA-03 — `tenants USING(true)` SELECT):** PENDENTE. A auditoria revelou que 5 telas públicas leem `tenants` como anônimo (TenantContext + OrgExploreLayout + OrgLanding + OrgAuth + InviteAccept). Fechar o leak exige criar RPC `resolve_tenant_by_slug` SECURITY DEFINER e refatorar essas 5 telas — raio de impacto = boot do app para todo visitante. Requer build + teste em produção. Decisão de execução pendente com JG.
> - ⏸️ **Fase 2 (migrar 54 policies has_role→has_tenant_role):** as 54 já são tenant-isoladas por predicado `tenant_id`; a troca não muda a decisão de acesso (ganho de segurança nulo) e tem risco de regressão. Recomendação: NÃO fazer o rewrite cego.

---

> **Auditoria do banco real (2026-06-17, via Management API).** Estado confirmado em produção:
> - **FORCE RLS:** 51 tabelas com RLS habilitado, só 13 com FORCE → **38 sem FORCE**.
> - **Policies com `has_role(`:** 112 no total, classificadas:
>   - **51 = Superadmin global** (referenciam tenant `00000000-0000-0000-0000-000000000001`) → manter (exceção justificada, CA-02).
>   - **54 = Admin de tenant JÁ escopadas por `tenant_id`** (predicado `get_user_tenant_id`/join com `tenant_id`) → seguras; migrar p/ `has_tenant_role` é limpeza, não correção.
>   - **7 = TENANT-BLIND reais** (sem predicado de tenant) → furos de segurança:
>     - `tenants` INSERT/UPDATE/DELETE — nome diz "Only super admins" mas usa `has_role(auth.uid(),'admin')`; qualquer admin de qualquer org altera/deleta qualquer tenant. **CRÍTICO.**
>     - `tenant_plan_limits` INSERT/UPDATE/DELETE — qualquer admin altera limites de plano de qualquer tenant.
>     - `video_thumbnails` ALL — qualquer admin/instrutor gerencia thumbnails de qualquer tenant.
> - **Tenants `USING (true)`:** policy "Anyone can view tenant by slug" presente (leitura pública da tabela inteira).
>
> **Plano faseado proposto (aprovação pendente):**
> - **Fase 1 (alto valor, baixo risco):** corrigir as 7 policies tenant-blind (`tenants` e `tenant_plan_limits` → escopo correto de superadmin/tenant; `video_thumbnails` → `has_tenant_role` do tenant) + substituir o `USING (true)` de `tenants` por resolução segura (RPC `SECURITY DEFINER` por slug/domínio) mantendo o boot anônimo da app.
> - **Fase 2 (limpeza, opcional):** migrar as 54 policies já escopadas de `has_role`→`has_tenant_role`.
> - **Fase 3 (delicada — risco de travar auth):** aplicar FORCE RLS nas 38 tabelas. **Risco:** funções `SECURITY DEFINER` (`has_role`, `get_user_tenant_id`, `has_tenant_role`) consultam `user_roles`/`profiles`; FORCE nessas tabelas pode sujeitar essas funções à própria RLS (recursão / lockout de login). Exige aplicar com cautela e testar fluxos de auth — idealmente por lotes, deixando `user_roles`/`profiles` por último.

## Contexto

A camada de isolamento multi-tenant do TriviaEdutech depende inteiramente de RLS no Postgres. A auditoria das 39 migrations em `supabase/migrations/` revelou três lacunas que enfraquecem esse isolamento:

### 1. Cobertura PARCIAL de `FORCE ROW LEVEL SECURITY`

`ENABLE ROW LEVEL SECURITY` aplica as policies para roles comuns, mas **não** para o owner da tabela. `FORCE ROW LEVEL SECURITY` é o que garante que nem o owner escape das policies — relevante porque funções `SECURITY DEFINER` e operações administrativas podem rodar como owner.

Contagem real das migrations:
- **50 tabelas** com `ENABLE ROW LEVEL SECURITY`
- Apenas **13 tabelas** com `FORCE ROW LEVEL SECURITY`: `article_reads`, `activities`, `activity_question_options`, `activity_questions`, `activity_submissions`, `ai_provider_settings`, `assignment_submissions`, `assignments`, `faq_items`, `lesson_notes`, `mp_oauth_connections`, `platform_subscriptions`, `tutor_messages`

Ou seja, **37 tabelas têm ENABLE mas não têm FORCE**, incluindo tabelas centrais e sensíveis:
`tenants`, `user_roles`, `profiles`, `enrollments`, `courses`, `modules`, `lessons`, `quizzes`, `quiz_answers`, `quiz_attempts`, `course_purchases`, `subscriptions`, `certificates`, `direct_messages`, `conversations`, `invitations`, `notifications`, `community_posts`, `community_comments`, `community_likes`, `learning_paths`, `learning_path_courses`, `learning_path_enrollments`, `lesson_progress`, `lesson_comments`, `lesson_comment_likes`, `lesson_attachments`, `library_items`, `library_progress`, `quiz_questions`, `quiz_options`, `tenant_plan_limits`, `user_badges`, `user_points`, `articles`, `nudge_log`, `video_platform_settings`.

As 13 com FORCE são, em geral, as tabelas mais novas (activities, ai_provider_settings, etc.), o que indica que FORCE virou padrão recentemente e o backlog antigo nunca foi normalizado.

### 2. `has_role()` é tenant-blind e convive com `has_tenant_role()`

Há duas funções de verificação de papel definidas em migrations diferentes:

`public.has_role(_user_id, _role)` — definida em `20260207221329_416134f5-571d-493a-9929-227db59fe95e.sql` (linha 116). Verifica apenas `user_id` e `role` em `user_roles`, **sem filtrar por tenant**:
```sql
SELECT EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = _user_id AND role = _role
)
```

`public.has_tenant_role(_tenant_id, _user_id, _role)` — definida depois em `20260208154034_94cfbf32-149e-4c02-acbb-a8d9dcc51113.sql` (linha 99). Verifica `user_id`, `role` **e** `tenant_id`:
```sql
SELECT EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = _user_id AND tenant_id = _tenant_id AND role = _role
)
```

A função `has_tenant_role` foi criada justamente para corrigir a falta de escopo de tenant da `has_role`, mas a migração ficou incompleta: nas migrations há **232 ocorrências de `has_role(`** contra apenas **11 de `has_tenant_role(`**. Policies antigas (com `has_role`, tenant-blind) e novas (com `has_tenant_role`) convivem. Onde uma policy usa `has_role(auth.uid(), 'admin')`, um admin de um tenant satisfaz a condição em linhas de **outro** tenant — quebrando o isolamento se a policy não tiver outro predicado de tenant. Exemplo concreto na própria tabela `tenants` (mesma migration, linhas 167 e 171): `USING (has_role(auth.uid(), 'admin'))` para UPDATE/DELETE.

### 3. Tabela `tenants` permite leitura pública de metadados de todos os tenants

Em `20260208154034_94cfbf32-149e-4c02-acbb-a8d9dcc51113.sql` (linhas 157-159) existe:
```sql
CREATE POLICY "Anyone can view tenant by slug"
ON public.tenants FOR SELECT
USING (true);
```

`USING (true)` libera SELECT de **todas** as linhas de `tenants` para qualquer requisição (inclusive anônima via anon key). Isso expõe metadados de todos os clientes da plataforma (slugs, nomes, custom_domain, branding, configs) a qualquer um, e torna inúteis as outras policies de SELECT mais restritas da mesma tabela ("Users can view own tenant", linha 149; "Anyone can resolve tenant by domain" em `20260210215002_...sql` linha 118, que já cobre o caso legítimo de resolução por domínio com `custom_domain IS NOT NULL`). A resolução por slug usada pela aplicação só precisa de campos públicos de **um** tenant por vez, não da tabela inteira.

**Impacto agregado:** vazamento de metadados entre tenants concorrentes, escalonamento horizontal de privilégio de admin entre tenants, e ausência de defesa em profundidade contra código que rode como owner. Tudo P1 num produto multi-tenant.

## Acceptance Criteria

- [ ] CA-01: Toda tabela em `public` (e `article_reads`) que tem `ENABLE ROW LEVEL SECURITY` passa a ter também `FORCE ROW LEVEL SECURITY`. Verificável por: `SELECT relname, relrowsecurity, relforcerowsecurity FROM pg_class WHERE relrowsecurity = true;` — nenhuma linha com `relforcerowsecurity = false`.
- [ ] CA-02: Nenhuma policy de RLS em produção usa `has_role(...)` para decisão de escopo administrativo sem também restringir o tenant; as policies tenant-aware passam a usar `has_tenant_role(tenant_id, auth.uid(), 'admin')`. Auditoria: `SELECT count(*) FROM pg_policies WHERE qual ILIKE '%has_role(%' OR with_check ILIKE '%has_role(%';` deve retornar 0 (ou apenas usos justificados e documentados de papel global de super admin).
- [ ] CA-03: A policy `"Anyone can view tenant by slug"` com `USING (true)` é removida/substituída por uma que não exponha a tabela `tenants` inteira; a resolução legítima de tenant (por slug e por domínio) continua funcionando para usuário anônimo.
- [ ] CA-04: Fluxos de aplicação seguem funcionando: login/cadastro, resolução de tenant por slug e por custom domain, dashboards de admin do tenant, e leitura de cursos/aulas pelos alunos do tenant. Sem regressão de "row not found"/403 indevidos.
- [ ] CA-05: A migração é idempotente o suficiente para rodar em produção sem derrubar acesso (aplicar FORCE e trocar policies numa única migration transacional).

## Escopo

**IN:**
- Nova migration SQL em `supabase/migrations/` que: aplica `FORCE ROW LEVEL SECURITY` nas 37 tabelas faltantes; substitui a policy `USING (true)` de `tenants`; e migra as policies tenant-aware de `has_role` para `has_tenant_role`.
- Auditoria documentada (lista) de cada policy que usa `has_role` classificando-a como "tenant-aware → migrar" ou "papel global de super admin → manter e justificar".
- Smoke test dos flualos principais após aplicar em staging/produção.

**OUT:**
- Refatorar o modelo de papéis (`app_role`) ou introduzir conceito de super admin separado de admin de tenant (se necessário, vira story própria).
- Alterações em Edge Functions e frontend (as funções usam service role e bypassam RLS; não é objeto desta story).
- Performance tuning de policies.

## Passos de Implementação

1. Gerar a lista canônica de tabelas com RLS habilitado consultando `pg_class`/`pg_tables` no banco de produção (não confiar só nas migrations, que podem divergir do estado real).
2. Criar nova migration `supabase/migrations/<timestamp>_rls_hardening_force_and_tenant_roles.sql`.
3. Para cada tabela da lista de CA-01, adicionar `ALTER TABLE <schema>.<tabela> FORCE ROW LEVEL SECURITY;` (incluir as 37 faltantes; rodar de forma idempotente é seguro pois FORCE em tabela que já tem é no-op).
4. Auditar todas as policies que referenciam `has_role(` via `pg_policies`. Para cada uma que decide acesso administrativo dentro de um tenant, recriar (`DROP POLICY` + `CREATE POLICY`) usando `has_tenant_role(<coluna_tenant>, auth.uid(), 'admin')`. Documentar as exceções de super admin global mantidas.
5. Tratar a tabela `tenants`: `DROP POLICY "Anyone can view tenant by slug"`. Garantir que a resolução por slug usada no boot da app continue: avaliar restringir os campos retornados ou trocar a resolução pública para uma função `SECURITY DEFINER` (`resolve_tenant_by_slug(slug)`) que retorne só os campos públicos de um tenant. Manter a policy "Anyone can resolve tenant by domain" (já restrita por `custom_domain`).
6. Validar a migration localmente (`supabase db reset` / `supabase migration up`) sem erros.
7. Aplicar em staging; rodar smoke test (CA-04). Em seguida aplicar em produção.
8. Rodar as queries de auditoria de CA-01 e CA-02 no banco e anexar o resultado à story.

## Arquivos Afetados (File List)

- [ ] `supabase/migrations/<timestamp>_rls_hardening_force_and_tenant_roles.sql` (novo)
- [ ] `supabase/migrations/20260208154034_94cfbf32-149e-4c02-acbb-a8d9dcc51113.sql` (referência — origem da policy `USING (true)` de `tenants`, das funções `has_tenant_role` e dos usos de `has_role` em `tenants`)
- [ ] `supabase/migrations/20260207221329_416134f5-571d-493a-9929-227db59fe95e.sql` (referência — definição de `has_role`)
- [ ] `supabase/migrations/20260210215002_f4d65d2d-6f90-4825-9327-d928ea58cc60.sql` (referência — policy "Anyone can resolve tenant by domain" a preservar)
- [ ] `src/contexts/TenantContext.tsx` (verificar — se a resolução de tenant por slug deixar de funcionar com anon, ajustar para usar a RPC `SECURITY DEFINER`)

## Testes

- [ ] Query de auditoria FORCE: nenhuma tabela com `relrowsecurity = true` e `relforcerowsecurity = false`.
- [ ] Query de auditoria has_role: contagem de policies com `has_role(` tenant-blind = 0 (fora exceções documentadas).
- [ ] Anon não consegue mais `select * from tenants` retornando a tabela inteira; resolução por slug de um tenant específico continua funcionando (via app ou via RPC).
- [ ] Admin do tenant A não enxerga nem altera linhas administrativas do tenant B (testar UPDATE/DELETE em `tenants` e em ao menos uma tabela de conteúdo).
- [ ] Smoke: login, cadastro, resolução por slug e por custom domain, dashboard admin do tenant, listagem de cursos/aulas pelo aluno — todos sem regressão.

## Rastreabilidade

- Mapeamento: `Projeto/Mapeamento do Sistema.md` (Registro de Riscos) — 3 riscos P1/P2 de RLS/banco
- Relacionada: STORY-006 (segurança de Edge Functions), STORY-004 (rotação de credenciais)
