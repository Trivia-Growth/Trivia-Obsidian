# TriviaEdutech — Arquitetura do Sistema

> **Fase:** Brownfield Discovery — Phase 1 (@architect)
> **Data:** 2026-06-13 (atualizado: 2026-06-13 — Sprint de Segurança)
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
| Vídeo | Mux / Panda Video / Vimeo | — |
| Pagamentos | Mercado Pago | v2 |
| IA | OpenAI / Gemini / Anthropic / OpenRouter | — |

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

> **Nota (features/settings):** aba "IA" adicionada em Settings (Admin > Configurações) com cards por provedor, toggle de ativação, campo API key e botão "Testar conexão".
> **Nota (features/admin):** `manage-ai` page conectada à Edge Function `manage-ai` para CRUD de provedores de IA por tenant.
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
| IA | ai_provider_settings |
| Utilitários | faq_items, notifications, nudge_log, tenant_plan_limits |

### Tabela `ai_provider_settings` (nova)

Armazena configuração de provedor de IA por tenant. Apenas um provedor pode estar ativo (`enabled = true`) por tenant por vez.

| Coluna | Tipo | Observação |
|--------|------|------------|
| `id` | UUID | PK |
| `tenant_id` | UUID | FK → tenants. RLS obrigatório |
| `provider` | text | `openrouter` \| `openai` \| `gemini` \| `anthropic` |
| `enabled` | boolean | Apenas 1 ativo por tenant |
| `api_key` | text | Chave do provedor (plaintext — migrar para Vault) |
| `model_chat` | text | Modelo usado pelo Tutor IA |
| `model_generate` | text | Modelo usado para geração de quiz + SEO |
| `created_at` | timestamptz | — |
| `updated_at` | timestamptz | — |

---

## Edge Functions — 17 Funções

| Função | Auth | Zod | CORS | Propósito |
|--------|------|-----|------|-----------|
| `submit-quiz` | JWT ✅ | ✅ | Whitelist ✅ | Score server-side (respostas nunca expostas) |
| `manage-users` | JWT ✅ | ✅ | Whitelist ✅ | CRUD usuários + roles (bug fix: create-superadmin usa upsert) |
| `batch-enroll` | JWT ✅ | ✅ | Whitelist ✅ | Matrícula em massa |
| `generate-quiz` | JWT ✅ | ✅ | Whitelist ✅ | AI quiz via transcrição (usa shared ai-client) |
| `manage-ai` | JWT ✅ | ✅ | Whitelist ✅ | **NOVA** — get-providers, upsert-provider, test-connection |
| `mp-create-preference` | JWT ✅ | ✅ | Whitelist ✅ | Checkout MP (preço do DB, nunca do client) |
| `mp-oauth` | JWT ✅ | — | Whitelist ✅ | OAuth flow MP |
| `video-proxy` | JWT ✅ | — | Whitelist ✅ | Proxy URL vídeo |
| `panda-video` | JWT ✅ | — | Whitelist ✅ | API Panda Video |
| `auto-enroll` | API Key | ✅ | Whitelist ✅ | Matrícula via chave externa |
| `accept-invite` | Token | ✅ | Whitelist ✅ | Aceitar convite por email |
| `create-org` | Público | ✅ | Whitelist ✅ | Registro de nova organização |
| `mp-webhook` | HMAC ✅ | ✅ | Whitelist ✅ | Notificação MP — assinatura verificada via `MERCADOPAGO_WEBHOOK_SECRET` |
| `optimize-content` | JWT ✅ | ✅ | Whitelist ✅ | AI otimização — autenticação JWT adicionada (era público ❌) |
| `ai-tutor` | JWT ✅ | ✅ | Whitelist ✅ | Tutor AI via shared ai-client (migrado de Lovable Gateway) |
| `sitemap` | Público | — | Whitelist ✅ | Sitemap XML dinâmico |
| `llms-txt` | Público | — | Whitelist ✅ | llms.txt para AI indexing |

> **CORS:** todas as funções agora usam whitelist restritiva de origens (triviaedutech.com, app.triviaedutech.com, localhost). Wildcard `"*"` completamente eliminado.

### Shared Module: `_shared/ai-client.ts`

Client de IA compartilhado entre Edge Functions. Elimina o acoplamento anterior com Lovable AI Gateway.

- Suporte a provedores: OpenAI, Gemini, Anthropic, OpenRouter
- Entrada: `{ provider, apiKey, model, messages[] }`
- Saída: resposta normalizada (mesmo formato para todos os provedores)
- Usado por: `ai-tutor`, `generate-quiz`, `optimize-content`
- Config por tenant: lida da tabela `ai_provider_settings` em runtime

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

---

## Deploy e Infra — Netlify

### `netlify.toml` (criado na Sprint de Segurança)

Configura security headers e cache otimizado para o frontend.

**Security Headers aplicados a todas as rotas (`/*`):**

| Header | Valor |
|--------|-------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | restricts camera, microphone, geolocation |
| `Content-Security-Policy` | whitelist de origens permitidas |

**Cache:** assets estáticos (`/assets/*`) com `Cache-Control: public, max-age=31536000, immutable`.

---

## Variáveis de Ambiente

| Variável | Onde | Observação |
|----------|------|------------|
| `VITE_SUPABASE_URL` | Netlify (frontend) | — |
| `VITE_SUPABASE_ANON_KEY` | Netlify (frontend) | Renomeada de `VITE_SUPABASE_PUBLISHABLE_KEY` |
| `PLATFORM_API_KEY` | Supabase Secrets | Renomeada de `LOVABLE_API_KEY` (referências Lovable removidas) |
| `MERCADOPAGO_WEBHOOK_SECRET` | Supabase Secrets | HMAC signature do mp-webhook |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Secrets (Edge Functions) | Nunca no frontend |

> **Referências Lovable removidas:** `LOVABLE_API_KEY` renomeada para `PLATFORM_API_KEY`. Endpoint movido de `api.lovable.dev` para OpenRouter diretamente. CORS não inclui mais `lovable.app`.
