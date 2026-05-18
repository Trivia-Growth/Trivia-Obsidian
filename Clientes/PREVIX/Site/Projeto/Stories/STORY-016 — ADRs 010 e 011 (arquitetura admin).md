---
id: STORY-016
titulo: "ADRs 010 e 011 — arquitetura do Painel Admin"
fase: 6
modulo: "Admin/Arquitetura"
status: done
prioridade: alta
agente_responsavel: ""
criado: 2026-05-08
atualizado: 2026-05-08
epic: EPIC-001
---

# STORY-016 — ADRs 010 e 011 (arquitetura do Painel Admin)

## Contexto

JG fechou as 3 decisões grandes do EPIC-001. Antes de codar, formalizar em ADRs no `architecture.md` do repo `previx-site-app`. Isso define o blueprint que orienta todas as outras 8 sub-stories.

## Critérios de Aceite

### ADR-010 — Conteúdo no Supabase + rebuild Netlify on publish

- [ ] CA1 — Documentar **decisão e contexto**:
  - Hoje conteúdo é Git (MDX/MD/JSON em `src/content/`). Lint Jimmy 3.0 roda no build.
  - Volume esperado: 5+ posts/mês justifica painel com fluxo editorial (rascunho/agendamento/preview).
  - Mantém HTML completo no edge (AEO/GEO foundation validada em 213/213 PASS no E2E de 2026-05-07).

- [ ] CA2 — Documentar **fluxo Edit → Publish** com diagrama (mermaid):
  ```
  Editor salva no painel
    → Edge Function valida (Zod + lint Jimmy 3.0)
    → INSERT/UPDATE em site.posts (ou faq, copies, etc.)
    → Audit log
    → Se status="publicado", chama Build Hook do Netlify
    → Netlify rebuilda site
    → Astro getStaticPaths consulta Supabase via service_role no build
    → Páginas estáticas atualizadas no edge
  ```

- [ ] CA3 — Documentar **estratégia de validação**:
  - Frontmatter Zod do `content.config.ts` é portado para validação **runtime** no painel (Edge Function + cliente)
  - Lint Jimmy 3.0 (`scripts/lint-content.ts`) é portado para Edge Function `validate-post` que retorna `{ ok: true }` ou `{ ok: false, errors: [...] }`
  - Painel bloqueia publicação se validação falha

- [ ] CA4 — Documentar **estratégia de rollback**:
  - Toda edição grava em `audit_log` com `payload_before` (JSONB). Reverter = UPDATE com payload_before + novo rebuild
  - Soft delete em todas as tabelas (`deletado_em` timestamptz) — hard delete só por `admin-previx` após retenção LGPD

- [ ] CA5 — Documentar **alternativas rejeitadas**:
  - Decap CMS (Git-backed): rejeitado por não escalar pra 5+ posts/mês com fluxo editorial
  - SSR puro: rejeitado por perda de AEO (HTML não é mais estático no edge)
  - TinaCMS: rejeitado por dependência externa + custos do tier de equipe

### ADR-011 — Painel embutido em `/admin/*` + RBAC dinâmico

- [ ] CA6 — Documentar **decisão de localização**:
  - Painel vive em `/admin/*` no repo `previx-site-app` (1 repo, 1 deploy)
  - Astro modo `output: 'hybrid'`: rotas públicas estáticas, `/admin/*` server-rendered
  - SPA React montada via `<AdminApp client:only="react" />` em rota Astro server
  - **NÃO** usar sub-projeto separado (rejeitado por JG — admin é só do site, não justifica repo isolado)

- [ ] CA7 — Documentar **estratégia RBAC dinâmico**:
  - `app_metadata.roles[]` continua sendo array de IDs de role (string)
  - Tabela `site.role_definitions` armazena perfis editáveis: `id`, `nome`, `descricao`, `permissoes` (JSONB)
  - Função `site.has_permission(resource text, action text)` substitui `site.has_role(role text)` em todas as policies novas
  - Função antiga `site.has_role` **mantida** para retrocompat com STORY-008 (`/admin/leads`) — depreca quando STORY-019 migrar policies de leads pra novo modelo
  - **Multi-papel:** se usuário tem `roles=["editor-blog","comercial"]`, `has_permission` faz UNION das permissões

- [ ] CA8 — Documentar **schema da tabela role_definitions**:
  ```sql
  create table site.role_definitions (
    id text primary key,                -- ex: 'editor-blog'
    nome text not null,                 -- ex: 'Editor de Blog'
    descricao text,
    permissoes jsonb not null default '{}',
    -- ex: { "posts": ["create","read","update","publish"], "assets": ["upload","read"] }
    sistema boolean not null default false,  -- true = não pode deletar (admin-previx)
    criado_em timestamptz default now(),
    atualizado_em timestamptz default now()
  );
  ```

- [ ] CA9 — Documentar **seed de 5 perfis iniciais**:
  - `admin-previx` (sistema=true, full access)
  - `editor-blog` (posts CRUD+publish, assets upload+read)
  - `editor-copy` (faq/copy CRUD, assets upload+read+delete-own)
  - `comercial` (leads read+update)
  - `viewer` (read-only em tudo, sem leads sensíveis)

- [ ] CA10 — Documentar **CSP impactada**:
  - `/admin/*` precisa CSP separada (mais permissiva): permite `unsafe-eval` se Monaco/TipTap precisar, allow `blob:` para preview de imagens, etc.
  - Headers configurados em `netlify.toml` com path `/admin/*` separado das rotas públicas

- [ ] CA11 — Documentar **alternativas rejeitadas**:
  - Sub-projeto separado `previx-admin-app` em `admin.grupoprevix.com.br`: rejeitado por JG (admin é específico do site, repo isolado é overkill)
  - Roles hardcoded em enum: rejeitado por JG (quer poder criar/editar perfis pelo painel)

## Notas Técnicas

- ADRs vão em `architecture.md` do repo `previx-site-app` (mesma estrutura dos ADR-001 a ADR-009 atuais)
- Mirror narrativo no vault em [[../Decisões Arquiteturais]]
- Diagrama mermaid do fluxo edit→publish é embedável no `.md` do GitHub (renderizado nativo)

## Pendências externas

- Confirmar se Supabase Storage está habilitado no projeto `yqexjddpotlaqraljwvl` (verificar plano `nf_team_pro` Netlify também — provavelmente OK)

---

## Implementação

> Preenchido pelo `@dev`/`@architect`.

**Status:** `done` (2026-05-08)

**Branch/PR:** commit incluído no batch da Fase 5.5 + EPIC-001 M1.

**Notas de Implementação:**

- ADR-010 e ADR-011 redigidos em `architecture.md` do repo `previx-site-app`.
- Bonus: corrigida duplicata cega do ADR-008 ("Stack de monitoramento (placeholder)" aparecia 2x); status atualizado para "Aceito" refletindo a implementação real da STORY-010 prep.
- Bonus: ADR-009 adicionado como placeholder para GA4+GTM (será fechado na STORY-011).
- Mirror narrativo no vault em `Decisões Arquiteturais.md` atualizado com ADR-007/008/009/010/011 e renumerados os placeholders especulativos antigos (i18n vira ADR-013, search interna vira ADR-014; ADR-012 reservado para editor MDX da STORY-020).
- Diagrama mermaid do fluxo edit→publish renderiza nativamente no GitHub.

**Arquivos modificados:**
- `architecture.md` (ADR-010 + ADR-011 adicionados)
- `Trivia-Obsidian/Clientes/PREVIX/Site/Decisões Arquiteturais.md` (mirror narrativo)

---

## QA

**Gate:**

**Checklist:**
- [ ] ADR-010 e ADR-011 presentes em `architecture.md` com seções padrão (Context, Decision, Consequences, Alternatives)
- [ ] Diagrama mermaid do fluxo edit→publish renderiza no GitHub
- [ ] Mirror no vault Obsidian atualizado
- [ ] EPIC-001 referencia ADRs corretamente
