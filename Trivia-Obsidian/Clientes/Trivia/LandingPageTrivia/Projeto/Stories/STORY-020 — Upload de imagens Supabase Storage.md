---
id: STORY-020
titulo: Landing Page Builder — Upload de imagens via Supabase Storage
status: concluido
data_conclusao: 2026-04-27
modulo: Campanhas / Storage
tipo: feature
---

## Contexto

O bloco de imagem aceitava apenas URL externa. Esta story adicionou upload real direto do painel admin para o Supabase Storage, com URL pública preenchida automaticamente.

## O que foi feito

### 1. Bucket no Supabase Storage
- Bucket `campaign-images` criado como público (leitura anon liberada)
- Migration: `20260427_campaign_images_bucket.sql`
- Policy de leitura para `anon`, policy de upload para `service_role`

### 2. Netlify Function `admin-upload.ts`
- Recebe `{ fileName, contentType, data (base64) }` em JSON
- Valida extensão (jpg/jpeg/png/gif/webp/svg) e tamanho (máx 10 MB)
- Sanitiza nome do arquivo com timestamp
- Upload via `supabase.storage.from("campaign-images").upload()`
- Retorna `{ url: string }` com URL pública

### 3. Editor de blocos — bloco `image`
- Campo `<input type="file">` com feedback "Enviando…" e erro inline
- Campo URL mantido como fallback para colar link externo
- Preview da imagem após upload ou URL preenchida

### 4. Admin API
- Método `adminApi.upload.image(file: File): Promise<string>` converte File para base64 e chama a function

## Escopo parcial
CA5 e CA6 (cover_url em `/admin/conteudo` e `/diario/$slug`) adiados para v2.

## Arquivos
- `supabase/migrations/20260427_campaign_images_bucket.sql`
- `netlify/functions/admin-upload.ts`
- `src/lib/admin-api.ts` (namespace `upload`)
- `netlify.toml` (redirect `/api/admin/upload`)
- `src/routes/admin/campanhas/$id.tsx` (editor de imagem)
