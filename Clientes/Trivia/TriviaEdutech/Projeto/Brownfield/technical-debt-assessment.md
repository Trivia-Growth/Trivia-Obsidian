# TriviaEdutech — Avaliação de Débito Técnico

> **Fase:** Brownfield Discovery — Phase 8 (Assessment Final)
> **Data:** 2026-06-13
> **Agentes:** @architect (Aria), @security (Cipher), @data-engineer (Dara), @qa (Quinn)
> **Score geral de saúde:** 5.5/10 — Arquitetura sólida, débitos de qualidade críticos

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

### P0-001 · `.env` commitado no Git ⚠️ EMERGÊNCIA

**Risco:** Credenciais Supabase, chaves de API e secrets expostos no histórico git.

**Impacto:** Breach imediato se repo for público; exposure interna se privado.

**Ação:**
1. Rotacionar TODAS as chaves no Supabase Dashboard + Mercado Pago
2. Remover do histórico: `git filter-branch --tree-filter 'rm -f .env'`
3. Adicionar `.env` ao `.gitignore` (já deve estar — verificar)
4. Configurar variáveis no Netlify UI (não no repo)

---

### P0-002 · `optimize-content` sem autenticação

**Risco:** Qualquer pessoa pode chamar a função e disparar chamadas à Lovable AI Gateway às custas do projeto.

**Impacto:** DoS financeiro (cost explosion) + vazamento de uso de AI.

**Ação:** Adicionar `auth.getUser()` obrigatório. Redeployar.

---

### P0-003 · `netlify.toml` ausente — sem security headers

**Risco:** Sem HSTS, X-Frame-Options, CSP, X-Content-Type-Options.

**Impacto:** Clickjacking, MIME sniffing, downgrade HTTPS.

**Ação:** Criar `netlify.toml` com security headers completos (template no padrão Trivia).

---

### P0-004 · `mp-webhook` sem verificação de assinatura

**Risco:** Qualquer pessoa pode simular um webhook do Mercado Pago e criar purchases fraudulentos.

**Impacto:** Acesso a cursos pagos sem pagamento real.

**Ação:** Implementar validação de assinatura MP (`X-Signature` header) antes de processar.

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

### P1-004 · CORS `"*"` em funções financeiras

**Funções afetadas:** `ai-tutor`, `mp-webhook`, `mp-create-preference`

**Risco:** Funções financeiras aceitam requisições de qualquer origem.

**Ação:** Mover para whitelist restritiva igual ao padrão das outras funções:
```typescript
const ALLOWED_ORIGINS = [
  "https://triviaedutech.com",
  "https://app.triviaedutech.com",
  "http://localhost:8080",
];
```

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

### P2-007 · Dependência externa: Lovable AI Gateway

**Problema:** `ai-tutor` e `generate-quiz` chamam `https://api.lovable.dev/v1/chat/completions`.

**Risco:** Acoplamento com serviço externo não gerenciado. Se Lovable mudar API ou descontinuar, essas features param.

**Ação:** Migrar para provider diretamente controlado (Anthropic API, OpenRouter, ou OpenAI via variável de ambiente do Supabase).

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

### Sprint 1 — Segurança Emergencial
- STORY-004: Rotacionar credenciais + remover .env do git
- STORY-005: `optimize-content` — adicionar autenticação JWT
- STORY-006: `mp-webhook` — implementar verificação de assinatura MP
- STORY-007: Criar `netlify.toml` com security headers completos

### Sprint 2 — Qualidade Crítica
- STORY-008: TypeScript strict — habilitar e corrigir erros
- STORY-009: Lazy routes + Suspense em todas as 49 páginas
- STORY-010: Error Boundaries (raiz + features críticas)
- STORY-011: CORS restrictivo nas funções financeiras

### Sprint 3 — Segurança de Dados
- STORY-012: Supabase Vault para tokens OAuth MP
- STORY-013: Criptografia de API keys de vídeo
- STORY-014: RLS storage policies para library-files
- STORY-015: FORCE RLS em profiles, user_roles, enrollments

### Sprint 4 — Qualidade de Código
- STORY-016: Refatorar Admin Dashboard (968→<300 linhas)
- STORY-017: Refatorar CourseDetail (780→<300 linhas)
- STORY-018: Eliminar 11 usos de `any`
- STORY-019: Rate limiting em funções críticas

### Sprint 5 — Independência de Ferramentas
- STORY-020: Migrar AI Gateway de Lovable para provider direto
- STORY-021: Testes unitários — Edge Functions e hooks críticos
- STORY-022: FORCE RLS nas tabelas remanescentes
