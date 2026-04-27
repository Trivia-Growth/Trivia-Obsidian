---
id: STORY-017
titulo: Landing Page Builder — DB migration + rota pública /campanha/$slug
status: concluido
data_conclusao: 2026-04-26
modulo: Campanhas / CMS
tipo: feature
---

## Contexto

Primeiro bloco do Landing Page Builder. Criou a fundação: schema no Supabase (tabelas `landing_pages` e `lp_blocks`), Netlify function de CRUD (`admin-campanhas`), namespace na admin-api e rota pública `/campanha/$slug` que renderiza os blocos por tipo.

## O que foi feito

### 1. Migration SQL
- Tabelas `landing_pages` (slug, title, status, template, seo_title, seo_description) e `lp_blocks` (page_id, position, type, content jsonb)
- RLS: anon só lê páginas publicadas e blocos de páginas publicadas
- `supabase db push` executado em produção

### 2. Netlify Function `admin-campanhas.ts`
- Actions: `list-pages`, `create-page`, `update-page`, `delete-page`, `list-blocks`, `upsert-blocks`, `replace-blocks`, `delete-block`
- Auth via `checkAdminToken`
- Validação Zod nos schemas

### 3. Rota pública `/campanha/$slug`
- Loader: Supabase anon key, busca página + blocos, `notFound()` se não publicada
- Renderer por tipo de bloco: `text`, `image`, `video`, `form`, `cta`
- Head com SEO (`seo_title`, `seo_description`)
- FormBlock salva lead em `leads` com `source = "campanha:[slug]"`

### 4. CSS inicial
- Classes `.lp-block-*` em `styles.css` para todos os tipos de bloco

## Arquivos
- `supabase/migrations/20260426_landing_pages.sql`
- `netlify/functions/admin-campanhas.ts`
- `src/lib/admin-api.ts` (namespace `campanhas`)
- `src/routes/campanha/$slug.tsx`
- `src/styles.css`
