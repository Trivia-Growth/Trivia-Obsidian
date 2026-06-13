# TriviaEdutech — Arquitetura do Sistema

> **Fase:** Brownfield Discovery — Phase 1 (@architect)
> **Data:** 2026-06-13
> **Agente:** Aria (@architect)

---

## Visão Geral

LMS multi-tenant white-label. Cada organização (tenant) opera no mesmo banco de dados com isolamento via RLS. Um único deploy frontend serve todos os tenants com resolução dinâmica por domínio ou slug.

```
┌─────────────────────────────────────────────────────────┐
│                     NETLIFY (CDN)                        │
│           React 18 + Vite SPA (TypeScript)              │
│  TanStack Query · shadcn/ui · Tailwind · React Router   │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE                              │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────┐  │
│  │  PostgreSQL  │  │ Edge Functions│  │  Auth (JWT) │  │
│  │  45+ tables  │  │ 16 Deno fns   │  │   + Roles   │  │
│  │  RLS em tudo │  │  Zod + JWT    │  │  by tenant  │  │
│  └──────────────┘  └───────────────┘  └─────────────┘  │
│  ┌──────────────┐  ┌───────────────┐                    │
│  │   Storage    │  │   Realtime    │                    │
│  │  5 buckets   │  │  (futuro)     │                    │
│  └──────────────┘  └───────────────┘                    │
└─────────────────────────────────────────────────────────┘
              │                       │
     ┌────────┘                       └──────┐
     ▼                                       ▼
┌─────────────┐                    ┌──────────────────┐
│ Mux / Panda │                    │  Mercado Pago    │
│  Video APIs │                    │  (OAuth + Webhook)│
└─────────────┘                    └──────────────────┘
```

---

## Stack Técnica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | React + TypeScript | 18.x / 5.8 |
| Build | Vite + SWC | 5.4 |
| Estilo | Tailwind CSS + shadcn/ui | 3.4 |
| Roteamento | React Router | v6 |
| Estado remoto | TanStack Query | v5 |
| Forms | React Hook Form + Zod | — |
| Backend | Supabase Edge Functions | Deno |
| Database | PostgreSQL (Supabase) | 14.x |
| Auth | Supabase Auth | JWT |
| Deploy frontend | Netlify | — |
| Deploy backend | Supabase CLI | — |
| Vídeo | Mux / Panda Video / Bunny | — |
| Pagamentos | Mercado Pago | v2 |

---

## Estrutura de Código (`src/`)

```
src/
├── App.tsx                    → todas as rotas (SEM lazy ainda — HIGH DEBT)
├── config/
│   └── env.ts                 → variáveis de ambiente tipadas ✅
├── contexts/
│   ├── AuthContext.tsx         → sessão, perfil, roles, helpers
│   └── TenantContext.tsx       → resolução de tenant por domínio/slug
├── features/                  → 19 módulos isolados por domínio
│   ├── admin/                 → gestão (batch-enroll, onboarding, SEO, vídeo)
│   ├── auth/                  → login, registro, ProtectedRoute
│   ├── community/             → feed, leaderboard, membros, mensagens
│   ├── courses/               → CourseCard, useCertificates, useLearningPaths
│   ├── gamification/          → pontos, badges
│   ├── grades/                → boletim
│   ├── help/                  → FAQ
│   ├── lesson/                → notas, discussão
│   ├── library/               → ebooks, audiobooks
│   ├── messages/              → DM (ChatWindow, ConversationList)
│   ├── notifications/         → bell, hooks
│   ├── payments/              → MercadoPago connection card
│   ├── purchases/             → histórico
│   ├── quiz/                  → player, editor, AI generator
│   ├── seo/                   → SeoHead, artigos do blog
│   ├── settings/              → branding, API integrations
│   ├── tutor/                 → AI tutor drawer
│   ├── video/                 → players (Mux, Panda), analytics
│   └── calendar/              → eventos
├── pages/                     → 49 componentes de página
│   ├── admin/ (10)            → Dashboard, Videos, Courses, Users...
│   ├── blog/ (2)              → ArticlesList, ArticleDetail
│   ├── explore/ (5)           → público (cursos, paths, ebooks)
│   └── superadmin/ (1)        → Tenants
├── components/
│   ├── ui/                    → shadcn/ui components
│   ├── layout/                → AppLayout, Header, Sidebar
│   └── explore/               → ExploreLayout, OrgExploreLayout
├── hooks/                     → use-mobile, use-toast, useFeatureFlag
├── lib/                       → utils, generateCertificatePDF, generateGradeReportPDF
└── integrations/supabase/
    ├── client.ts              → instância Supabase
    └── types.ts               → tipos gerados (2317 linhas)
```

---

## Resolução de Tenant

```
1. Domínio customizado?     → tenants.custom_domain
2. Subdomínio *.triviaedutech.com → slug = primeira parte
3. /:orgSlug path           → busca por slug
4. localhost / padrão       → slug "default" (superadmin tenant)
5. Usuário logado?          → tenant_id do perfil sobrescreve slug
```

Superadmin tenant: `00000000-0000-0000-0000-000000000001`

---

## Rotas Definidas

| Grupo | Prefixo | Guard | Contagem |
|-------|---------|-------|----------|
| Públicas | `/landing`, `/auth`, `/blog/*`, `/explore/*` | — | ~10 |
| Protegidas | `/`, `/courses/*`, `/profile`, etc. | `ProtectedRoute` | ~22 |
| Admin | `/admin/*` | `requiredRole="admin"` | 8 |
| Instructor | `/admin/videos`, `/admin/courses/*` | `requiredRole="instructor"` | 3 |
| Superadmin | `/superadmin/tenants` | `superAdminOnly` | 1 |
| Org path | `/:orgSlug/*` | — | ~6 |

> **DEBT:** NENHUMA rota usa `lazy()` + `<Suspense>` — bundle único com 49 páginas.

---

## Banco de Dados — 45+ Tabelas

### Grupos Funcionais

| Grupo | Tabelas |
|-------|---------|
| Auth & Organização | profiles, user_roles, tenants, invitations |
| Cursos & Aprendizado | courses, modules, lessons, lesson_attachments, lesson_progress, enrollments |
| Paths | learning_paths, learning_path_courses, learning_path_enrollments |
| Quiz | quizzes, quiz_questions, quiz_options, quiz_attempts, quiz_answers |
| Assignments | assignments, assignment_submissions |
| Certificados & Gamification | certificates, user_points, user_badges |
| Comunidade | community_posts, community_comments, community_likes, lesson_comments, lesson_comment_likes |
| Mensagens | conversations, direct_messages |
| Biblioteca | library_items, library_progress |
| Blog | articles, article_reads |
| Pagamentos | course_purchases, platform_subscriptions, subscriptions, mp_oauth_connections |
| Vídeo | video_platform_settings, video_thumbnails |
| Utilitários | faq_items, notifications, nudge_log, tenant_plan_limits |

---

## Edge Functions — 16 Funções

| Função | Auth | Zod | Propósito |
|--------|------|-----|-----------|
| `submit-quiz` | JWT ✅ | ✅ | Score server-side (respostas nunca expostas) |
| `manage-users` | JWT ✅ | ✅ | CRUD usuários + roles |
| `batch-enroll` | JWT ✅ | ✅ | Matrícula em massa |
| `generate-quiz` | JWT ✅ | ✅ | AI quiz via transcrição |
| `mp-create-preference` | JWT ✅ | ✅ | Checkout MP (preço do DB, nunca do client) |
| `mp-oauth` | JWT ✅ | — | OAuth flow MP |
| `video-proxy` | JWT ✅ | — | Proxy URL vídeo |
| `panda-video` | JWT ✅ | — | API Panda Video |
| `auto-enroll` | API Key | ✅ | Matrícula via chave externa |
| `accept-invite` | Token | ✅ | Aceitar convite por email |
| `create-org` | Público | ✅ | Registro de nova organização |
| `mp-webhook` | Público | ⚠️ | Notificação MP — SEM assinatura |
| `optimize-content` | **NENHUMA** ❌ | ✅ | AI otimização — CRÍTICO |
| `ai-tutor` | JWT ✅ | ✅ | Tutor AI via Lovable Gateway |
| `sitemap` | Público | — | Sitemap XML dinâmico |
| `llms-txt` | Público | — | llms.txt para AI indexing |

---

## Multi-Tenancy — Isolamento

```sql
-- Função core (SECURITY DEFINER)
get_user_tenant_id(auth.uid()) → tenant_id UUID

-- Padrão de policy
USING (tenant_id = get_user_tenant_id(auth.uid()))

-- Superadmin bypass
USING (tenant_id = '00000000-0000-0000-0000-000000000001')
```

**Status RLS por criticidade:**

| Tabela | RLS | FORCE | Observação |
|--------|-----|-------|------------|
| tutor_messages | ✅ | ✅ | — |
| lesson_notes | ✅ | ✅ | — |
| mp_oauth_connections | ✅ | ✅ | Tokens MP em plaintext ⚠️ |
| platform_subscriptions | ✅ | ✅ | — |
| profiles | ✅ | ❌ | FORCE recomendado |
| user_roles | ✅ | ❌ | FORCE recomendado |
| enrollments | ✅ | ❌ | FORCE recomendado |
| direct_messages | ✅ | ❌ | Sem tenant_id na tabela |
| courses | ✅ | ❌ | Public access intencional |

---

## Provider Nesting (ordem crítica)

```tsx
<QueryClientProvider>        ← staleTime: 2min, gcTime: 5min
  <AuthProvider>             ← session, profile, roles
    <TenantProvider>         ← resolve após AuthContext
      <RouterProvider />
    </TenantProvider>
  </AuthProvider>
</QueryClientProvider>
```

> `TenantProvider` consome `authTenantId` do `AuthContext` — ordem inviolável.
