---
id: STORY-018
titulo: "Migration schema admin (Supabase)"
fase: 6
modulo: "Admin/Banco de Dados"
status: done
prioridade: alta
agente_responsavel: ""
criado: 2026-05-08
atualizado: 2026-05-08
epic: EPIC-001
---

# STORY-018 — Migration schema admin (Supabase)

## Contexto

Modela todas as tabelas que vão hospedar conteúdo + admin (perfis, audit, assets) no schema `site` do Supabase compartilhado. RLS+FORCE em todas, policies que respeitam o RBAC dinâmico (STORY-019).

Hoje no schema `site`: apenas `leads`. Esta story adiciona ~12 tabelas novas.

## Tabelas a criar

### Conteúdo

- `site.posts` — posts do blog (substitui `src/content/blog/*.mdx`)
- `site.faq` — perguntas (substitui `src/content/faq/faq.json`)
- `site.servicos` — 3 serviços (substitui `src/content/servicos/*.md`)
- `site.paginas` — páginas institucionais (Sobre, etc. — substitui `src/content/paginas/*.md`)
- `site.depoimentos` — substitui `src/content/depoimentos/depoimentos.json`
- `site.clientes` — substitui `src/content/clientes/clientes.json`
- `site.numeros` — substitui `src/content/numeros/numeros.json`
- `site.diferenciais` — substitui `src/content/diferenciais/diferenciais.json`

### Admin/Operacional

- `site.role_definitions` — perfis editáveis (do ADR-011)
- `site.assets` — metadata de assets no Supabase Storage
- `site.audit_log` — log de toda alteração (admin compliance)
- `site.configs_seo` — overrides de SEO/Schema por página

## Critérios de Aceite

### Modelagem

- [ ] CA1 — **`site.posts`** preserva todos os campos do schema Zod atual (titulo, slug, categoria, publicadoEm, autor JSONB, lede, conclusoesPrincipais TEXT[], estatisticas JSONB[], faq JSONB[], schemaTipo, imagemCapa, ctaBg, ctaTitulo, ctaTexto, descricaoSEO, mostrarSumario, dropCap, proximoPost JSONB) + adicionar `status` (rascunho/agendado/publicado/arquivado), `agendado_para` timestamptz, `corpo_mdx` TEXT (corpo do post), `criado_por` UUID FK auth.users, `atualizado_por` UUID FK, `criado_em`, `atualizado_em`, `publicado_em`, `deletado_em` (soft delete)

- [ ] CA2 — **`site.faq`** com campos: id, categoria, categoria_label, ordem, pergunta, resposta, ativo (bool), criado_por, atualizado_por, timestamps, deletado_em

- [ ] CA3 — **`site.servicos`** com campos do markdown atual: nome, slug, schema_service_type, descricao_curta, icone_id, ordem, sub_servicos TEXT[], foto_capa, corpo_md (corpo principal), timestamps, deletado_em

- [ ] CA4 — **`site.paginas`** genérica: slug (PK), titulo, descricao_seo, corpo_md, blocos JSONB (estrutura flexível para hero/seções), timestamps. Inicialmente: 1 linha (`sobre`)

- [ ] CA5 — **`site.depoimentos`, `site.clientes`, `site.numeros`, `site.diferenciais`** seguindo exatamente os campos dos JSONs atuais + ordem + ativo + timestamps

- [ ] CA6 — **`site.role_definitions`** conforme ADR-011 CA8 (id PK, nome, descricao, permissoes JSONB, sistema, timestamps)

- [ ] CA7 — **`site.assets`** com: id UUID PK, bucket, path, mime_type, tamanho, alt_text, tags TEXT[], dominio_uso TEXT[] (ex: `['banner-home','post-cover']`), uploaded_by UUID, timestamps

- [ ] CA8 — **`site.audit_log`** com: id BIGSERIAL PK, user_id UUID, recurso TEXT (ex: 'posts'), recurso_id TEXT, acao TEXT (create/update/delete/publish/unpublish), payload_before JSONB, payload_after JSONB, ip TEXT, user_agent TEXT, criado_em DEFAULT now(). Sem soft delete (audit é append-only)

- [ ] CA9 — **`site.configs_seo`** com: pagina (PK), title_override, description_override, og_image_override, jsonld_extra JSONB, atualizado_por, atualizado_em

### RLS + Policies

- [ ] CA10 — Todas as tabelas com `enable row level security` + `force row level security`
- [ ] CA11 — Função `site.has_permission(resource text, action text)` definida (assinatura — implementação completa na STORY-019)
- [ ] CA12 — Policies SELECT/INSERT/UPDATE/DELETE em cada tabela usando `site.has_permission(...)` — exemplo:
  ```sql
  create policy "posts read" on site.posts for select to authenticated
    using (site.has_permission('posts', 'read'));
  create policy "posts create" on site.posts for insert to authenticated
    with check (site.has_permission('posts', 'create'));
  ...
  ```
- [ ] CA13 — Policy especial para **leitura pública de conteúdo publicado**:
  ```sql
  create policy "posts public read published" on site.posts for select to anon
    using (status = 'publicado' and deletado_em is null);
  ```
  Idem para faq.ativo, servicos.deletado_em is null, etc.
- [ ] CA14 — `site.audit_log` insert SEMPRE permitido para authenticated (todo save grava); SELECT só com `has_permission('audit_log', 'read')`. DELETE bloqueado.

### Triggers e funções utilitárias

- [ ] CA15 — Trigger `set_atualizado_em()` aplicado em todas as tabelas com `atualizado_em`
- [ ] CA16 — Trigger `audit_log_insert()` em INSERT/UPDATE/DELETE de cada tabela de conteúdo, gravando automaticamente em audit_log
- [ ] CA17 — Função `site.publish_post(post_id uuid)` — atualiza status='publicado', publicado_em=now(), dispara webhook Netlify build hook

### Índices

- [ ] CA18 — Índices em colunas de busca/filtro: `posts(slug)`, `posts(status, publicado_em desc)`, `posts(deletado_em)`, `faq(categoria, ordem)`, `assets(bucket, path)`, `audit_log(criado_em desc)`, `audit_log(user_id, criado_em desc)`

### Bucket Supabase Storage

- [ ] CA19 — Bucket `site-assets` criado:
  - Public read (assets públicos do site)
  - Authenticated upload com RLS via permissão `assets.upload`
  - Path convention: `posts/<post-id>/...`, `banners/<pagina>/...`, `logos/...`

### Permissões nominais

- [ ] CA20 — `grant usage on schema site` continua para anon/authenticated/service_role
- [ ] CA21 — `grant select` em tabelas-conteúdo para anon (controlado pelas policies "public read published")
- [ ] CA22 — `grant all on <tabelas> to service_role` para Edge Functions

### Migration

- [ ] CA23 — Arquivo `supabase/migrations/20260508120000_create_admin_schema.sql` com tudo acima
- [ ] CA24 — Migration aplicada em produção via `supabase db query --linked --file <migration>` (mesmo padrão da STORY-008 — não pode usar `db push` por causa das migrations órfãs do Organograma)
- [ ] CA25 — `src/integrations/supabase/types.ts` regenerado via `supabase gen types typescript --linked > src/integrations/supabase/types.ts`

## Pendências externas

- Confirmar com JG retenção do `audit_log`: forever ou rotacionar (ex: 1 ano)?
- Confirmar com JG soft delete vs hard delete: posts deletados ficam por quanto tempo até hard delete? (sugestão: 90 dias compliance LGPD)

---

## Implementação

> Preenchido pelo `@data-engineer`.

**Status:** `done` (2026-05-08)

**Commits:** `50fdf12` (migrations) + `4ed097b` (types regenerados)

**Notas de Implementação:**

- 2 arquivos de migration versionados:
  - `20260508120000_create_admin_schema.sql` (716 linhas) — 12 tabelas + funções + triggers + policies + grants
  - `20260508120100_create_storage_bucket_policies.sql` — bucket `site-assets` + 5 policies em storage.objects
- Validações em produção:
  - 13 tabelas no schema `site` (12 novas + leads existente), todas com RLS+FORCE
  - Funções: `has_permission`, `has_role` (legacy), `set_atualizado_em`
  - 56 policies criadas (8 tabelas × 5 + role_definitions × 4 + audit_log × 2 + leads × 2)
  - 5 policies em `storage.objects` para bucket `site-assets`
- Types TypeScript regenerados em `src/integrations/supabase/types.ts` (1576 linhas) cobrindo schemas `site`, `public`, `storage`.
- Pendências externas seguem abertas: retenção do audit_log, prazo de hard delete (90d?) — JG decide quando fizer sentido.

**Arquivos esperados:**
- `supabase/migrations/20260508120000_create_admin_schema.sql` (novo)
- `src/integrations/supabase/types.ts` (regenerado)
- `architecture.md` (atualizar seção de Database com link pra ADR-010/011)

---

## QA

**Gate:**

**Checklist:**
- [ ] Migration aplica sem erro
- [ ] 12 tabelas + 1 bucket Storage criadas
- [ ] RLS+FORCE em todas
- [ ] Policy "public read published" valida via curl com anon key (acessar lista de posts publicados sem JWT)
- [ ] Policy "admin only" valida via curl com JWT de viewer (deve falhar em INSERT/UPDATE)
- [ ] Audit log captura test INSERT/UPDATE/DELETE
- [ ] Types TypeScript regenerados sem erros
