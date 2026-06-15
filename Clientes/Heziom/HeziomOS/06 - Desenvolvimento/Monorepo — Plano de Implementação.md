# Monorepo HeziomOS — Plano de Implementação

> **Status:** em andamento · **Iniciado:** 2026-06-15
> **Repo:** `https://github.com/Org-Heziom/heziomos.git`
> Ver também: [[Monorepo — Estrutura e Setup]] (blueprint de arquitetura)

---

## Decisões Fechadas

| Decisão | Escolha | Motivo |
|---|---|---|
| React version | **React 18** | Consistência com apps existentes; upgrade para 19 depois |
| Router | **TanStack Router** | Type-safe params/search params; suporte a loaders |
| Frontend | **1 único app** (`apps/web`) | Uma plataforma, uma URL, visão centralizada |
| Supabase | **1 novo projeto** (prod + staging) | Schemas de domínio limpos; sem herança de schema `public.*` |
| Netlify | **1 site** (`apps/web`) | Deploy único, sem cascata |
| literarius-sync | **Fora do monorepo** | Deploy Windows Server independente |
| tribe-criativo-lab | **Fora — Fase futura** | Python + HuggingFace incompatível com monorepo JS |
| TRIVIAIOX | **Instalado** | Framework de agentes para desenvolvimento |
| Auth de teste | **Usuário admin no Supabase** | Criado no dashboard antes do primeiro deploy |
| Identidade visual | **Baseada no heziom-sales** | Cyan #00c8c8, Navy #08090f, Inter, glass morphism |

---

## Estrutura apps/web

```
apps/web/src/
├── routes/
│   ├── __root.tsx          # AppShell: sidebar, topbar, auth guard
│   ├── login.tsx           # Login (Email/Senha + Magic Link)
│   ├── _auth/
│   │   ├── dashboard.tsx   # CEO overview (Phase 1)
│   │   ├── crm/            # Módulo CRM (← heziom-sales)
│   │   └── hub/            # Módulo Hub (← hubtransportadorashzm)
├── features/
│   ├── crm/                # Código migrado de heziom-sales
│   └── hub/                # Código migrado de hubtransportadorashzm
├── components/             # Shell: Sidebar, Topbar, Breadcrumb
├── integrations/supabase/  # Client → novo projeto unificado
└── lib/
```

---

## Fases de Implementação

### ✅ Fase 0 — Pré-condições
- [x] Repo `heziomos` criado no GitHub
- [x] Acesso Supabase e Netlify confirmados
- [ ] João dar OK no heziom-sales (pull da versão final antes das fases 5-6)

### 🔄 Fase 1 — Fundação do Monorepo
`package.json` root · `pnpm-workspace.yaml` · `turbo.json` · `biome.json` · `tsconfig.base.json` · `.gitignore` · `CLAUDE.md` · TRIVIAIOX instalado

### 🔄 Fase 2 — Supabase Unificado
Criar projetos **prod + staging** · Habilitar `pgvector`, `pg_cron`, `pg_net` · Criar todos os schemas de domínio via migrations · RLS FORCE · Criar usuário admin de teste

**Migrations (ordem):**
1. `0000_init_schemas.sql` — CREATE SCHEMA para todos os domínios
2. `0001_crm_schema.sql` — tabelas crm.* (DDL export de heziom-sales)
3. `0002_hub_schema.sql` — tabelas hub.* (DDL export de hub)
4. `0003_financeiro_schema.sql` — tabelas HeziomOS
5. `0004_lit_mirror_schema.sql` — para literarius-sync
6. `0005_audit_schema.sql` — append-only
7. `0006_rls_policies.sql` — RLS FORCE em tudo

### 🔄 Fase 3 — Packages
- `packages/config` — `@heziom/config` (Biome preset + tsconfigs)
- `packages/shared` — `@heziom/shared` (types + Zod schemas)
- `packages/ui` — `@heziom/ui` (shadcn/ui + tokens Heziom)
- `packages/database` — `@heziom/database` (Supabase types gerados)

### 🔄 Fase 4 — apps/web Shell + Auth
React 18 + Vite + TanStack Router + Tailwind v4 + shadcn/ui

**Identidade visual (heziom-sales):**
- Cores: `--primary: 180 100% 39%` (cyan), `--accent: 157 80% 49%` (verde), `--background: 232 40% 5%` (navy)
- Font: Inter 300–800, feature-settings: 'cv11', 'ss01'
- Utilitários: `.glass`, `.glow-primary`, `.press-effect`
- Logo: ícone `Zap` lucide-react em cyan

**Tela de login:**
- Baseada em `heziom-sales/src/pages/Login.tsx`
- Marca: "HeziomOS" (não JimmyAtende)
- Modos: Email/Senha + Magic Link (sem Google OAuth — ferramenta interna)
- Botão "Dev Login" apenas em `import.meta.env.DEV` (auto-preenche com vars de `.env.local`)

**Usuário admin de teste:** criar no dashboard Supabase antes do primeiro deploy
- Email: `lucas@trivia.com.br`
- Senha: definir no dashboard

### ⏳ Fase 5 — Migrar CRM (aguarda João)
- Edge Functions heziom-sales → `supabase/functions/` (atualizar refs `public.*` → `crm.*`)
- Componentes/hooks/pages → `apps/web/src/features/crm/`
- Rotas → `src/routes/_auth/crm/`
- Script migração de dados: `public.*` → `crm.*` no novo Supabase
- Re-convite de usuários via Magic Link

### ⏳ Fase 6 — Migrar Hub (aguarda João)
- Mesma abordagem: 21 Edge Functions + 29 páginas → `apps/web/src/features/hub/`
- Dados: `public.*` → `hub.*`

### 🔄 Fase 7 — CI/CD (GitHub Actions)
- `ci.yml` — lint + typecheck + test + build em todo PR
- `supabase-migrate.yml` — db push ao merge em main
- `edge-deploy.yml` — functions deploy ao merge em main

### 🔄 Fase 8 — Netlify
Site único para `apps/web`:
- Base directory: `apps/web`
- Build command: `cd ../.. && pnpm install && pnpm turbo build --filter=@heziom/web`
- Publish: `apps/web/dist`
- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`

### 🔄 Fase 9 — Verificação
Login funciona · CRM abre · Hub abre · literarius-sync conecta no novo Supabase · TRIVIAIOX doctor pass

### 🔄 Fase 10 — Arquivo e Limpeza
- Arquivar `Org-Heziom/heziom-sales` e `Org-Heziom/hubtransportadorashzm` no GitHub
- Desativar sites Netlify antigos
- Manter Supabase antigos 30 dias (rollback), depois deletar
- Atualizar `.env` do literarius-sync no servidor Windows

---

## Riscos

| Risco | Mitigação |
|---|---|
| Migração de dados incompleta | Script idempotente + checksum; Supabase antigo disponível 30 dias |
| Auth.users não migra entre projetos Supabase | Re-convite por Magic Link (~5-10 usuários internos) |
| React Router → TanStack Router quebra páginas | Migrar rota a rota com PR por feature; preview Netlify para validar |
| Edge Functions com `public.*` hardcoded | Grep por `from('` antes de qualquer deploy |
| literarius-sync fora do ar durante migração | Atualizar .env no servidor APÓS verificação do novo Supabase |

---

## Referências
- [[STORY-013 — Setup Monorepo heziomos]] — story de implementação
- [[Monorepo — Estrutura e Setup]] — blueprint de arquitetura
- [[HeziomOS — Arquitetura v3]] — ADRs e decisões técnicas
