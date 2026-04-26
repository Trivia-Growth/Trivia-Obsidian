---
id: STORY-015
titulo: Hardening de segurança — Admin Auth, IP Rate Limit, HSTS
status: concluido
data_conclusao: 2026-04-26
tipo: segurança
---

## Contexto

Auditoria completa identificou vulnerabilidades reais no projeto. Esta story resolve as três críticas.

## O que foi feito

### 1. Credenciais do admin removidas do bundle JS (CRÍTICO)
- Antes: e-mail, senha e token admin estavam hardcoded no JavaScript público — qualquer um via pelo DevTools
- Depois: criada `netlify/functions/admin-login.ts` — login validado no servidor contra `ADMIN_EMAIL` / `ADMIN_PASSWORD` (env vars server-side)
- Rate limit de tentativas: 5 por IP a cada 15 minutos
- Token retornado ao browser e salvo em localStorage — nunca mais baked no bundle

### 2. Rate limiting por IP no chat
- Novo campo `ip_address` na tabela `conversations` (migration `20260425_ip_rate_limit.sql`)
- Limite: 15 conversas por IP por 24h — bloqueia abuso sem afetar uso legítimo
- IP extraído do header Netlify `x-nf-client-connection-ip`

### 3. HSTS ativado
- `Strict-Transport-Security: max-age=31536000; includeSubDomains` adicionado ao `netlify.toml`
- Browsers passam a forçar HTTPS em visitas futuras

### 4. Melhorias complementares
- `admin-auth.ts`: comparação de token com `crypto.timingSafeEqual` (previne timing attack)
- `admin-messages.ts`: `conversationId` validado como UUID antes de qualquer query

## Arquivos modificados

- `netlify/functions/admin-login.ts` (novo)
- `netlify/functions/_lib/admin-auth.ts`
- `netlify/functions/admin-messages.ts`
- `netlify/functions/chat.ts`
- `netlify.toml`
- `src/routes/admin.tsx`
- `supabase/migrations/20260425_ip_rate_limit.sql` (novo)
- `SECURITY_DEBT.md`

## Deploy

- Commit: `84e8de8`
- Supabase migration aplicada via `supabase db push`
- Env vars configuradas no Netlify Dashboard: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_API_TOKEN`
