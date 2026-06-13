# TriviaEdutech — Avaliação de Débito Técnico

> **Fase:** Brownfield Discovery — Phase 8 (Assessment Final)
> **Data:** 2026-06-13 (atualizado: 2026-06-13 — Sprint de Segurança)
> **Agentes:** @architect (Aria), @security (Cipher), @data-engineer (Dara), @qa (Quinn)
> **Score geral de saúde:** 6.5/10 — Sprint de Segurança concluída, débitos de qualidade pendentes

---

## Sprint de Segurança — Junho 2026 — Itens Implementados

Os seguintes itens foram resolvidos nesta sprint e deixaram de ser débitos ativos:

| ID | Item | Status Anterior | Status Atual |
|----|------|----------------|--------------|
| P0-002 (SEC-017) | `optimize-content` sem autenticação | ❌ CRÍTICO | ✅ RESOLVIDO — JWT implementado |
| P0-004 (SEC-019) | `mp-webhook` sem verificação de assinatura | ❌ CRÍTICO | ✅ RESOLVIDO — HMAC via `MERCADOPAGO_WEBHOOK_SECRET` |
| P0-001 (SEC-016) | `.env` commitado no git | ❌ EMERGÊNCIA | ⚠️ PARCIAL — `.gitignore` corrigido; limpeza do histórico git pendente (ação manual do Lucas) |
| P0-003 (SEC-018) | `netlify.toml` ausente | ❌ CRÍTICO | ✅ RESOLVIDO — criado com security headers completos (HSTS, X-Frame-Options, nosniff, CSP, Permissions-Policy) |
| P1-004 | CORS `"*"` em funções | ⚠️ ALTO | ✅ RESOLVIDO — todas as funções com whitelist restritiva de origens |
| P2-007 | Dependência Lovable AI Gateway | ⚠️ MÉDIO | ✅ RESOLVIDO — migrado para `_shared/ai-client.ts` com suporte a OpenAI/Gemini/Anthropic/OpenRouter |
| — | `LOVABLE_API_KEY` hardcoded | ⚠️ MÉDIO | ✅ RESOLVIDO — renomeada para `PLATFORM_API_KEY`, endpoint movido para OpenRouter direto |
| — | Bug: create-superadmin falhava | ❌ BUG | ✅ RESOLVIDO — `manage-users` agora usa upsert ao invés de update |

**Adições desta sprint:**
- Nova tabela `ai_provider_settings` — configuração de provedor de IA por tenant (RLS habilitado)
- Nova Edge Function `manage-ai` — CRUD de provedores com JWT + Zod
- Painel de IA no Admin (aba "IA" em Configurações) — toggle, API key, teste de conexão
- Requisito mobile P1 documentado — experiência mobile é requisito da plataforma

**Score atualizado por categoria:**

| Categoria | Score Original | Score Atual |
|-----------|---------------|-------------|
| Edge Functions segurança | 6/10 | 8/10 |
| Deploy/Infra | 3/10 | 6/10 |
| Arquitetura de features | 8/10 | 8.5/10 |

---

---

## Resumo Executivo

O projeto tem uma **base arquitetural correta** (multi-tenancy, RLS, TanStack Query, feature modules). No entanto, a geração via Lovable introduziu **débitos de qualidade sistemáticos** que precisam ser corrigidos antes de escalar:

| Categoria | Score | Status |
|-----------|-------|--------|
| Arquitetura de features | 8/10 | ✅ Boa |
| RLS / Segurança de DB | 7.5/10 | ✅ Boa |
| Edge Functions segurança | 6/10 | ⚠️ Requer atenção |
| TypeScript | 2/10 | ❌ Crítico |
| Performance (code splitting) | 0/10 | ❌ Crítico |
| Error handling | 1/10 | ❌ Crítico |
| Testes | 1/10 | ❌ Crítico |
| Deploy/Infra | 3/10 | ❌ Crítico |

---

## P0 — CRÍTICO (Bloquear próximo deploy)

### P0-001 · `.env` commitado no Git ⚠️ EMERGÊNCIA — ⚠️ PARCIAL

**Risco:** Credenciais Supabase, chaves de API e secrets expostos no histórico git.

**Impacto:** Breach imediato se repo for público; exposure interna se privado.

**Status (2026-06-13):** `.gitignore` corrigido ✅. Limpeza do histórico git ainda pendente — ação manual necessária pelo Lucas: `git filter-branch --tree-filter 'rm -f .env' HEAD` ou usar `git-filter-repo`.

**Ação pendente:**
1. ~~Adicionar `.env` ao `.gitignore`~~ ✅ feito
2. Remover do histórico: `git filter-branch --tree-filter 'rm -f .env'` (pendente)
3. Rotacionar chaves se o histórico ainda não foi limpo

---

### P0-002 · `optimize-content` sem autenticação — ✅ RESOLVIDO

**Risco:** Qualquer pessoa pode chamar a função e disparar chamadas à AI às custas do projeto.

**Resolução (2026-06-13):** JWT via `auth.getUser()` implementado e deployado. Requisições sem token recebem 401.

---

### P0-003 · `netlify.toml` ausente — sem security headers — ✅ RESOLVIDO

**Risco:** Sem HSTS, X-Frame-Options, CSP, X-Content-Type-Options.

**Resolução (2026-06-13):** `netlify.toml` criado com HSTS, X-Frame-Options: DENY, nosniff, Referrer-Policy, Permissions-Policy e cache de assets estáticos. Deploy aplicado.

---

### P0-004 · `mp-webhook` sem verificação de assinatura — ✅ RESOLVIDO

**Risco:** Qualquer pessoa pode simular um webhook do Mercado Pago e criar purchases fraudulentos.

**Resolução (2026-06-13):** HMAC signature implementado. Webhook verifica o header `X-Signature` do Mercado Pago usando o secret `MERCADOPAGO_WEBHOOK_SECRET` (configurado nos Supabase Secrets). Requisições sem assinatura válida retornam 401.

---

## P1 — ALTO (Corrigir neste sprint)

### P1-001 · TypeScript strict completamente desabilitado

**Problema:** `noImplicitAny=false`, `strictNullChecks=false`, `strict=false` em tsconfig.app.json.

**Impacto:** Erros de runtime que TypeScript deveria capturar em build-time. 11 `any` encontrados.

**Ação:**
1. Habilitar `strict: true` em `tsconfig.app.json`
2. Rodar `npx tsc --noEmit` para inventariar erros
3. Criar story de correção progressiva

---

### P1-002 · Zero lazy loading — 49 páginas no bundle inicial

**Problema:** `src/App.tsx` importa 49+ page components estaticamente. Sem `lazy()`, sem `<Suspense>`.

**Impacto:** Bundle inicial inclui código de `/admin/dashboard`, `/superadmin`, `/checkout` para todos os usuários. LCP/TTI degradados.

**Ação:** Converter todas as rotas para `React.lazy()` + `<Suspense fallback={<LoadingState />}>`.

```tsx
// ANTES
import AdminDashboard from "./pages/admin/Dashboard";

// DEPOIS
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
```

---

### P1-003 · Zero Error Boundaries

**Problema:** Nenhum Error Boundary em toda a aplicação. Um erro em qualquer componente trava o app inteiro.

**Impacto:** Usuário vê tela branca em qualquer exceção não tratada.

**Ação:**
1. Error Boundary na raiz (`main.tsx`)
2. Error Boundary por feature crítica (VideoPlayer, QuizPlayer, Dashboard)
3. Loading/error states explícitos nas queries

---

### P1-004 · CORS `"*"` em funções financeiras — ✅ RESOLVIDO

**Funções afetadas:** `ai-tutor`, `mp-webhook`, `mp-create-preference` (e todas as demais)

**Resolução (2026-06-13):** Whitelist restritiva implementada em TODAS as Edge Functions. Nenhuma função usa `"*"` como origem. Referências a `lovable.app` removidas da whitelist.

---

### P1-005 · `mp_oauth_connections.access_token` em texto plano (SEC-015)

**Risco:** Se banco comprometido, tokens de sellers MP são expostos.

**Ação:** Implementar Supabase Vault para criptografar `access_token` e `refresh_token`.

---

### P1-006 · API keys de vídeo em texto plano

**Problema:** `video_platform_settings.api_key` e `api_secret` armazenados sem criptografia.

**Ação:** Criptografar no application layer ou migrar para Supabase Vault.

---

### P1-007 · Buckets de storage com acesso público irrestrito (SEC-010)

**Problema:** `library-files` (ebooks/audiobooks pagos) acessível sem autenticação.

**Ação:** Adicionar RLS storage policies com prefixo tenant + verificação de enrollment.

---

## P2 — MÉDIO (Próximo sprint)

### P2-001 · `Admin Dashboard` com 968 linhas (limite: 300)

**Ação:** Extrair para: `<MetricsOverview />`, `<AnalyticsTab />`, `<CoursesTab />`, `<RecentActivityTab />` + hooks dedicados por domínio.

---

### P2-002 · `CourseDetail.tsx` com 780 linhas (limite: 300)

**Ação:** Extrair `<LessonSidebar />`, `<VideoSection />`, `<LessonTabs />` + `useCourseDetail()` hook.

---

### P2-003 · 11 usos de `any` — Dashboard, CourseDetail, QuizPlayer

**Localização:**
- `Dashboard.tsx` linhas 267, 292, 391, 618, 700, 905
- `CourseDetail.tsx` linhas 214, 258, 584-603, 742
- `QuizPlayer.tsx` linhas 43, 68

**Ação:** Criar tipos corretos para joins do Supabase. Usar generics do SDK.

---

### P2-004 · Cobertura de testes: <1%

**Problema:** 1 arquivo de teste placeholder (`expect(true).toBe(true)`). 182 arquivos TypeScript sem testes.

**Prioridade de teste:**
1. Edge Functions (Zod schemas)
2. Hooks críticos (useGamification, useLessonNotes, useQuizzes)
3. Componentes com múltiplos estados (QuizPlayer, VideoPlayer)
4. Utilitários (generateCertificatePDF, utils.ts)

---

### P2-005 · Sem rate limiting em nenhuma Edge Function

**Funções de risco:** `create-org` (spam de registro), `ai-tutor` (cost explosion), `generate-quiz` (AI cost).

**Ação:** Implementar rate limiting via tabela de rate_limit_log ou Upstash Redis.

---

### P2-006 · Nomeação Lovable não-padrão

**Problema:** `VITE_SUPABASE_PUBLISHABLE_KEY` em vez do padrão `VITE_SUPABASE_ANON_KEY`.

**Já mapeado em `env.ts`** — migrar progressivamente quando tocar na área.

---

### P2-007 · Dependência externa: Lovable AI Gateway — ✅ RESOLVIDO

**Problema:** `ai-tutor` e `generate-quiz` chamavam `https://api.lovable.dev/v1/chat/completions`.

**Resolução (2026-06-13):** Migrado para `_shared/ai-client.ts` com suporte nativo a OpenAI, Gemini, Anthropic e OpenRouter. Config por tenant via tabela `ai_provider_settings`. Nenhuma referência a `api.lovable.dev` permanece. Variável renomeada de `LOVABLE_API_KEY` para `PLATFORM_API_KEY`.

---

### P2-008 · Senha mínima de 6 caracteres em `create-org`

**Padrão NIST:** mínimo 12 caracteres.

**Ação:** Aumentar validação Zod + mensagem de erro clara.

---

### P2-009 · FORCE RLS ausente em tabelas críticas

**Tabelas a adicionar FORCE:**
- `profiles` (identidade central)
- `user_roles` (controle de acesso)
- `enrollments` (acesso a cursos)
- `direct_messages` (privacidade)

---

### P2-010 · `conversations` sem `tenant_id`

**Risco:** Usuários de tenants diferentes podem teoricamente trocar mensagens.

**Ação:** Verificar intencionalidade. Se não intencional, adicionar `tenant_id` com migration + RLS.

---

### P2-011 · `generate-quiz` com fallback de API key para env var

**Problema:** Linha 273 usa `process.env.PANDA_VIDEO_API_KEY` como fallback se tenant não tem configuração.

**Ação:** Remover fallback. Se tenant não tem config de vídeo, retornar erro 400 claro.

---

### P2-012 · Sem transação em delete-tenant (SEC-008)

**Risco:** Falha parcial em cascade manual deixa dados órfãos.

**Ação:** Envolver em transação PostgreSQL ou implementar soft-delete com cleanup assíncrono.

---

## O Que Está Bom (Preservar)

| Aspecto | Avaliação |
|---------|-----------|
| TanStack Query sem anti-padrões | ✅ Excelente — zero `useEffect+setState` para dados remotos |
| Isolamento de features | ✅ Features não importam entre si |
| RLS em 40+ tabelas | ✅ Base sólida com `get_user_tenant_id()` |
| `submit-quiz` 100% server-side | ✅ Respostas nunca expostas ao cliente |
| Preços no backend (`mp-create-preference`) | ✅ Client nunca envia o valor |
| `env.ts` tipado | ✅ Centralizado e tipado |
| Schema abrangente (45+ tabelas) | ✅ Modelo de dados maduro |
| 16 Edge Functions com Zod | ✅ Maioria com validação adequada |
| robots.txt + sitemap + llms.txt | ✅ SEO e AI indexing configurados |
| Multi-tenant com helper SECURITY DEFINER | ✅ Função confiável e testada |

---

## Plano de Ação — Épico de Migração

### Sprint 1 — Segurança Emergencial ✅ CONCLUÍDA
- ~~STORY-004: Rotacionar credenciais + remover .env do git~~ ⚠️ PARCIAL (gitignore ok, histórico pendente)
- ~~STORY-005: `optimize-content` — adicionar autenticação JWT~~ ✅ FEITO
- ~~STORY-006: `mp-webhook` — implementar verificação de assinatura MP~~ ✅ FEITO
- ~~STORY-007: Criar `netlify.toml` com security headers completos~~ ✅ FEITO
- ~~CORS wildcard eliminado~~ ✅ FEITO (todas as funções)
- ~~Dependência Lovable removida~~ ✅ FEITO (`_shared/ai-client.ts`)
- ~~Sistema de IA por tenant~~ ✅ FEITO (`ai_provider_settings` + Edge Function `manage-ai`)

### Sprint 2 — Qualidade Crítica (PRÓXIMA)
- STORY-008: TypeScript strict — habilitar e corrigir erros
- STORY-009: Lazy routes + Suspense em todas as 49 páginas
- STORY-010: Error Boundaries (raiz + features críticas)

### Sprint 3 — Segurança de Dados
- STORY-012: Supabase Vault para tokens OAuth MP
- STORY-013: Criptografia de API keys de vídeo (incluindo `ai_provider_settings.api_key`)
- STORY-014: RLS storage policies para library-files
- STORY-015: FORCE RLS em profiles, user_roles, enrollments

### Sprint 4 — Qualidade de Código
- STORY-016: Refatorar Admin Dashboard (968→<300 linhas)
- STORY-017: Refatorar CourseDetail (780→<300 linhas)
- STORY-018: Eliminar 11 usos de `any`
- STORY-019: Rate limiting em funções críticas (ai-tutor, generate-quiz, create-org)

### Sprint 5 — Independência e Testes
- ~~STORY-020: Migrar AI Gateway de Lovable para provider direto~~ ✅ FEITO
- STORY-021: Testes unitários — Edge Functions e hooks críticos
- STORY-022: FORCE RLS nas tabelas remanescentes
