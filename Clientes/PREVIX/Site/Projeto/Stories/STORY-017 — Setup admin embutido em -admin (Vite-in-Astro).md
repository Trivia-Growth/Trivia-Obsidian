---
id: STORY-017
titulo: "Setup admin embutido em /admin/* (Vite-in-Astro)"
fase: 6
modulo: "Admin/Setup"
status: done
prioridade: alta
agente_responsavel: ""
criado: 2026-05-08
atualizado: 2026-05-08
epic: EPIC-001
---

# STORY-017 — Setup admin embutido em `/admin/*`

## Contexto

ADR-011 (STORY-016) define que o painel vive em `/admin/*` no repo `previx-site-app`. Esta story implementa a base técnica: Astro hybrid, SPA React montada via ilha cliente, stack canônica Trívia (TanStack Query, shadcn/ui, React Router) embutida.

A página `/admin/leads` atual (STORY-008) é um caso isolado — esta story estabelece o **shell** que vai hospedar todas as telas admin novas (gestão de usuários, perfis, posts, FAQ, copies, assets, configs SEO). `/admin/leads` migra pro novo shell na STORY-019.

## Critérios de Aceite

### Modo Astro

- [ ] CA1 — `astro.config.mjs` com `output: 'hybrid'` (rotas públicas estáticas continuam pre-rendered, `/admin/*` server-rendered)
- [ ] CA2 — Adapter Netlify configurado (`@astrojs/netlify`) — necessário para rotas server
- [ ] CA3 — Build continua produzindo HTML estático em todas as rotas públicas (validar com curl + grep). AEO foundation 100% preservada

### Stack do shell admin

- [ ] CA4 — `src/admin/` (nova pasta no repo) com:
  - `App.tsx` — root da SPA com `<BrowserRouter basename="/admin">`
  - `main.tsx` — entry point client-only
  - `routes.tsx` — definição de rotas internas (`/admin/dashboard`, `/admin/posts`, `/admin/faq`, `/admin/usuarios`, `/admin/perfis`, `/admin/leads`, `/admin/configs`)
  - `layouts/AdminLayout.tsx` — sidebar + topbar + content area
  - `lib/queryClient.ts` — TanStack Query setup
  - `lib/supabase.ts` — cliente reutilizado de `src/lib/supabase.ts`

- [ ] CA5 — Dependências instaladas:
  - `@tanstack/react-query` `@tanstack/react-query-devtools`
  - `react-router-dom` v6+
  - `lucide-react` (ícones)
  - shadcn/ui via CLI (Button, Card, Input, Dialog, Sheet, Sidebar, Table, Form, Select, Toast, Skeleton)
  - `react-hook-form` + `@hookform/resolvers` + `zod`
  - `@uiw/react-md-editor` ou alternativa (decisão na STORY-020 — placeholder por enquanto)

- [ ] CA6 — Tailwind v4 já existente compartilhado entre site público e admin. Tokens próprios para admin em `src/admin/styles/admin.css` (paleta neutra/dark mode opcional, sem conflito com `site.css`)

### Rota Astro server

- [ ] CA7 — `src/pages/admin/[...path].astro` — single catch-all server route que:
  - Valida JWT Supabase (via cookie httpOnly se possível)
  - Bloqueia acesso anônimo (redirect → tela de login interna do shell)
  - Monta `<AdminApp client:only="react" />`
  - Adiciona `<meta name="robots" content="noindex,nofollow">`

- [ ] CA8 — Tela de login admin (`/admin/login`) — Supabase Auth UI ou form custom. **Reusa as credenciais do Organograma** (mesma instância Supabase compartilhada).

- [ ] CA9 — Após login, redirect para `/admin/dashboard` (tela inicial) com cards do que está disponível conforme permissões do usuário.

- [ ] CA10 — Logout limpa sessão Supabase + redireciona para `/admin/login`.

### Layout do shell

- [ ] CA11 — **Sidebar** com seções:
  - Dashboard
  - Conteúdo: Posts, FAQ, Páginas, Depoimentos, Números, Diferenciais, Clientes, Assets
  - Pessoas: Usuários, Perfis (visível só com permissão `users` ou `roles`)
  - Operacional: Leads, Configs SEO, Audit Log
  - Itens da sidebar **filtrados por permissão** — usuário sem `posts.read` não vê Posts

- [ ] CA12 — **Topbar** com:
  - Avatar do usuário + dropdown (perfil, logout)
  - Indicador de ambiente (dev/prod)
  - Notificações (placeholder por enquanto)
  - Botão "Voltar ao site" → abre `/` em nova aba

- [ ] CA13 — **Tela placeholder** "Em construção" para cada rota interna que ainda não tem story (Posts, FAQ, etc.) — para validar layout end-to-end

### CSP e segurança

- [ ] CA14 — `netlify.toml` com bloco separado de headers para `/admin/*`:
  - CSP mais permissiva (allow `'unsafe-eval'` se Monaco precisar, mantém `connect-src` permissivo para Supabase)
  - X-Robots-Tag: noindex (defesa em profundidade ao lado do meta tag)
  - X-Frame-Options DENY mantido

- [ ] CA15 — `src/pages/admin/[...path].astro` valida sessão **antes** de renderizar — usuário sem JWT cai em `/admin/login` sem ver shell

### Testes manuais

- [ ] CA16 — Login com credencial do Organograma funciona
- [ ] CA17 — Acesso direto a `/admin/posts` sem login redireciona pra `/admin/login`
- [ ] CA18 — Sidebar oculta itens conforme permissões (validar com 2 usuários: 1 admin-previx, 1 editor-blog)
- [ ] CA19 — Build do site estático **não é afetado** pelos arquivos novos em `src/admin/` (validar com `npm run build` + checar `dist/`)

### Continuidade STORY-008

- [ ] CA20 — `/admin/leads` atual (página standalone com `LeadsPanel.tsx`) **continua funcionando** durante este épico — só migra pro shell novo na STORY-019

## Pendências externas

- Decisão JG: Astro Netlify adapter no plan team-pro tem custo de invocations? (verificar limite de free tier — provavelmente OK pra admin de baixo tráfego)

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** `backlog`

**Branch/PR:**

**Arquivos esperados:**
- `astro.config.mjs` (hybrid + adapter Netlify)
- `src/admin/App.tsx` (novo)
- `src/admin/main.tsx` (novo)
- `src/admin/routes.tsx` (novo)
- `src/admin/layouts/AdminLayout.tsx` (novo)
- `src/admin/lib/queryClient.ts` (novo)
- `src/admin/components/ui/*` (shadcn/ui via CLI)
- `src/pages/admin/[...path].astro` (novo)
- `src/pages/admin/login.astro` (novo)
- `netlify.toml` (CSP /admin/*)
- `package.json` (deps novas)

---

## QA

**Gate:**

**Checklist:**
- [ ] Build verde (`npm run build`)
- [ ] Site público sem regressões (rotas estáticas servidas como antes)
- [ ] CSP em `/admin/*` distinta de `/` validada via curl
- [ ] Login admin funciona com credencial Organograma
- [ ] Acesso anônimo redireciona para `/admin/login`
- [ ] Sidebar respeita permissões (validar com 2 perfis)
- [ ] Lighthouse Performance ≥ 80 em `/admin/dashboard` (não tão crítico quanto público)
- [ ] `/admin/leads` antigo continua funcionando
