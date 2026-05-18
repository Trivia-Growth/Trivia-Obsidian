---
id: EPIC-001
titulo: "Painel Admin PREVIX (conteúdo + RBAC dinâmico)"
fase: 6
modulo: "Admin/CMS"
status: backlog
prioridade: alta
agente_responsavel: ""
criado: 2026-05-08
atualizado: 2026-05-08
duracao_estimada: "4-8 semanas"
---

# EPIC-001 — Painel Admin PREVIX

## Decisão de escopo (fechada com JG em 2026-05-08)

JG confirmou os 3 pontos de arquitetura discutidos:

1. ✅ **Conteúdo migra do Git para Supabase** + rebuild incremental Netlify ao publicar (mantém AEO/GEO foundation: HTML completo no edge). Lint Jimmy 3.0 vira validação no save em vez de gate de build.
2. ✅ **Painel embutido em `/admin/*`** dentro do `previx-site-app` (não sub-projeto separado). Admin é SPA React montada em rota Astro server-rendered. **NÃO replicar Organograma como repo isolado.**
3. ✅ **RBAC dinâmico — perfis editáveis no painel.** A matriz inicial (admin-previx, editor-blog, editor-copy, comercial, viewer) é seed; o `admin-previx` cria/edita/deleta perfis e ajusta permissões granulares por recurso.

ADRs formais a redigir na STORY-016:
- **ADR-010** — Conteúdo no Supabase + rebuild Netlify on publish
- **ADR-011** — Painel embutido em `/admin/*` + RBAC dinâmico (perfis customizáveis)

## Volume e justificativa

JG estima **5+ posts/mês**, com pico inicial maior pra dar insumo às IAs generativas começarem a recomendar a Previx. FAQ é fixo (não edita com frequência). Justifica painel custom em vez de Decap/Tina porque:

- 5+ posts/mês exige fluxo editorial sério (rascunho, agendamento, preview, audit log)
- Lint Jimmy 3.0 já enforça regras AEO/GEO — precisa rodar no editor, não só no build
- Cada post novo é insumo direto pro Share of Answer (referrers de IA classificados pela STORY-011)
- Edição de banners/copies institucionais cabe no mesmo painel

## Matriz inicial de perfis (seed — editáveis)

| Papel | Blog | FAQ | Copy institucional | Banners/Imagens | Leads | SEO/Schema | Gestão de Usuários | Gestão de Perfis |
|---|---|---|---|---|---|---|---|---|
| **admin-previx** | ✅ tudo | ✅ tudo | ✅ tudo | ✅ tudo | ✅ tudo | ✅ tudo | ✅ tudo | ✅ tudo |
| **editor-blog** | ✅ criar/editar próprio + publicar | — | — | ✅ upload e usar nos posts | — | — | — | — |
| **editor-copy** | — | ✅ editar | ✅ editar Home/Sobre/Serviços/Depoimentos/Números | ✅ trocar banners | — | — | — | — |
| **comercial** | — | — | — | — | ✅ ver/qualificar | — | — | — |
| **viewer** | 👁️ só ler | 👁️ só ler | 👁️ só ler | 👁️ só ler | 👁️ só ler relatório | — | — | — |

**Multi-papel suportado** — `app_metadata.roles[]` é array. Um usuário pode ter `["editor-blog","comercial"]` e acumula permissões.

**Permissões granulares** — cada perfil tem JSON de permissões por recurso/ação:
```json
{
  "posts": ["create","read","update","publish"],
  "faq": [],
  "copy": [],
  "assets": ["upload","read","delete-own"],
  "leads": [],
  "seo": [],
  "users": [],
  "roles": []
}
```

## Sub-stories (executáveis)

| # | Story | Sprint | Bloqueada por | Resumo |
|---|---|---|---|---|
| 016 | [[STORY-016 — ADRs 010 e 011 (arquitetura admin)\|STORY-016]] | M1 | — | ADR-010 (DB+rebuild) + ADR-011 (admin embutido + RBAC dinâmico) em `architecture.md`. Diagrama de fluxo Edit→Validate→Save→Rebuild→Publish |
| 017 | [[STORY-017 — Setup admin embutido em -admin (Vite-in-Astro)\|STORY-017]] | M1 | 016 | Astro `output: 'hybrid'`, `/admin/*` como rota server, React SPA com TanStack Router montada via `<AdminApp client:only />`, shadcn/ui, TanStack Query, layout admin (sidebar + topbar) |
| 018 | [[STORY-018 — Migration schema admin (Supabase)\|STORY-018]] | M1 | 017 | Tabelas em schema `site`: `posts`, `faq`, `servicos`, `sobre`, `depoimentos`, `clientes`, `numeros`, `diferenciais`, `assets`, `role_definitions`, `audit_log`. RLS+FORCE com policies por recurso. Trigger `atualizado_em` global |
| 019 | [[STORY-019 — RBAC dinâmico + gestão de perfis e usuários\|STORY-019]] | M1 | 018 | `site.role_definitions` editável no painel, `site.has_permission(resource, action)` substitui `has_role`. Tela de gestão de usuários (admin-previx convida, atribui roles, deleta). Tela de gestão de perfis (CRUD de papeis com permissões granulares) |
| 020 | [[STORY-020 — CRUD de posts (editor MDX + lint Jimmy 3.0)\|STORY-020]] | M2 | 018 + 019 | Editor MDX (Monaco ou TipTap) com preview live, frontmatter Zod validado no save, lint Jimmy 3.0 portado pra Edge Function (≥3 estatísticas, blocos H2 50-150 palavras, lede 40-60), rascunho/agendamento/publicação, audit_log de cada save |
| 021 | [[STORY-021 — CRUD de FAQ + Serviços + Sobre (copies institucionais)\|STORY-021]] | M3 | 018 + 019 | Editor de FAQ (lista de perguntas por categoria, drag-drop ordem), editor de Serviços (3 cards), editor de Sobre (markdown longo), editor de Depoimentos/Números/Diferenciais. Preview antes de publicar |
| 022 | [[STORY-022 — Gestor de assets (Supabase Storage)\|STORY-022]] | M2 | 018 + 019 | Bucket `site-assets` no Supabase Storage, upload com resize/otimização, biblioteca com busca/tag, troca de banners por página, integração com editor de posts (insere imagem otimizada inline) |
| 023 | [[STORY-023 — Configs SEO-Schema editáveis\|STORY-023]] | M3 | 018 + 019 | Configs por página (meta title/description, OG image, JSON-LD custom override), áreas atendidas (LocalBusiness `areaServed`), redes sociais (`sameAs`), redirects custom adicionais ao netlify.toml |
| 024 | [[STORY-024 — Cutover conteúdo Git → DB + rebuild on publish\|STORY-024]] | M4 | 020+021+022+023 | Migration script: lê MDX/MD/JSON em `src/content/`, popula DB. Astro consome Supabase no build (`getStaticPaths`+RPC). Webhook publish → POST `/build_hooks` Netlify → rebuild incremental. Validação: 5 posts existentes saem do Git, ficam em DB, rebuildam, lint passa |

## Cronograma e marcos

| Marco | Quando | Entrega |
|---|---|---|
| **M1 — Foundation** | semanas 1-2 | ADRs aceitos, `/admin/*` embutido, schema admin no Supabase, RBAC dinâmico funcionando, gestão de usuários/perfis viva |
| **M2 — Editor de Blog + Assets** | semanas 3-4 | Posts criáveis no painel com lint Jimmy 3.0 ativo, biblioteca de imagens, rascunho/agendamento |
| **M3 — Copies + SEO** | semanas 5-6 | FAQ/Serviços/Sobre editáveis, configs SEO/Schema customizáveis |
| **M4 — Cutover de Conteúdo** | semanas 7-8 | Git como source of truth aposentado pra conteúdo. Painel publica → Netlify rebuilda → produção atualiza. STORY-014 (UX editorial) pode rodar em paralelo |

## Pendências / dependências externas

- **Supabase Storage habilitado** no projeto compartilhado `yqexjddpotlaqraljwvl` (validar limites do plano atual)
- **Netlify Build Hook URL** — JG cria no painel Netlify e fornece (ou autorizo criar via CLI)
- **Decisão sobre editor MDX** — Monaco (poderoso, peso) vs TipTap (rico, custom) vs textarea+preview (simples). Decisão na STORY-017
- **Domínio `admin.grupoprevix.com.br`** — descartado. Admin fica em `grupoprevix.com.br/admin/*`. **Robots.txt já bloqueia /admin** (preserva privacidade)

## Dependências entre épicos

- **EPIC-001 não bloqueia STORY-010 (cutover DNS)** — admin pode ser entregue depois do cutover, no mesmo domínio.
- **EPIC-001 não bloqueia STORY-011 (GA4+GTM)** — analytics roda no site público; admin pode usar depois.
- **EPIC-001 paraleliza com STORY-012/013/014** (UX refinements) — quando STORY-024 cutover de conteúdo rolar, posts já estarão no formato editorial novo da STORY-014.

## Decisões em aberto (pra decidir durante o épico)

1. Editor MDX: Monaco / TipTap / textarea-preview (decisão na STORY-017)
2. Modelo de revisão: rascunho → publicado direto, ou rascunho → revisão → publicado? (perguntar JG quando STORY-019 desenhar perfis)
3. Conteúdo deletado: hard delete vs soft delete + retenção 90 dias (LGPD)
4. Multi-idioma futuro: schema admin já prevê coluna `locale` ou ignora por ora?

---

## Implementação

> Sub-stories preenchem cada uma sua própria seção.

**Status do épico:** `backlog`

**Próximo passo:** abrir e executar STORY-016 (ADRs formais) — destrava STORY-017 (setup) e STORY-018 (schema).

---

## QA do épico

> Preenchido ao final, agregando checklists das sub-stories.

**Gate final:**
- [ ] Todos os 9 sub-stories `done`
- [ ] 5 perfis seed criados + admin-previx consegue criar/editar perfil novo
- [ ] 1 post criado no painel, validado pelo lint Jimmy 3.0, rebuild Netlify dispara, post aparece em produção
- [ ] FAQ editado no painel reflete em produção após rebuild
- [ ] Banner trocado no painel reflete em produção após rebuild
- [ ] Audit log captura cada save com user_id + timestamp + diff
- [ ] Lighthouse Mobile ≥ 90 mantido em todas as rotas públicas (admin é noindex, não afeta)
- [ ] Backup automatizado do schema admin (Supabase config) ativo
