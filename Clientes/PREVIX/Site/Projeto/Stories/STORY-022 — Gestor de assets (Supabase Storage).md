---
id: STORY-022
titulo: "Gestor de assets (Supabase Storage)"
fase: 6
modulo: "Admin/Assets"
status: done
prioridade: alta
agente_responsavel: ""
criado: 2026-05-08
atualizado: 2026-05-08
epic: EPIC-001
---

# STORY-022 — Gestor de assets (Supabase Storage)

## Contexto

Biblioteca centralizada de imagens/banners/vídeos pra todas as outras telas usarem (image picker do editor de posts, banner de Sobre, foto dos serviços, etc.). Hoje todos os assets vivem em `public/assets/` no repo Git e são editados via commit. Esta story migra pro Supabase Storage com UI completa.

## Critérios de Aceite

### Bucket e organização

- [ ] CA1 — Bucket `site-assets` no Supabase Storage (criado na STORY-018):
  - Public read (URLs públicas para uso no site)
  - Authenticated upload com permissão `assets.upload`
  - Path convention:
    - `posts/<post-slug>/<filename>` — capas e imagens inline de posts
    - `banners/<pagina>/<filename>` — banners de páginas (home, sobre, servicos, contato, faq)
    - `logos/<filename>` — logos clientes
    - `servicos/<slug>/<filename>` — fotos de serviços
    - `depoimentos/<filename>` — logos de empresas dos depoimentos

### Upload com otimização

- [ ] CA2 — Edge Function `upload-asset`:
  - Valida `assets.upload`
  - Aceita JPEG/PNG/WebP/SVG (block GIF, MP4 e demais por ora)
  - Tamanho máximo 5MB
  - Resize automático: gera 3 variantes (1920w original, 768w mobile, 320w thumbnail) em WebP
  - Salva metadata em `site.assets`: bucket, path, mime, tamanho, alt_text (vazio inicialmente), tags (vazio), uploaded_by, timestamps
  - Retorna URL pública + ID

- [ ] CA3 — Frontend de upload:
  - Drag-drop ou file input
  - Preview imediato
  - Campo Alt text (obrigatório — acessibilidade + AEO)
  - Campos opcionais: tags, dominio_uso (multi-select)
  - Progress bar durante upload

### Biblioteca

- [ ] CA4 — Rota `/admin/assets`:
  - Grid responsivo de assets (lazy load)
  - Filtros: tipo (foto, logo, banner, ícone), domínio de uso, tags, busca por nome/alt
  - Click em asset → modal com:
    - Preview grande
    - Metadata (dimensões, tamanho, uploaded_by, criado_em)
    - URLs disponíveis (1920/768/320)
    - Botão "Copiar URL"
    - Botão "Editar metadata" (alt, tags, domínio)
    - Botão "Excluir" (visível com `assets.delete-own` para próprios uploads ou `assets.delete-all` para tudo)

### Image picker (componente compartilhado)

- [ ] CA5 — Componente `<ImagePicker />` para uso em outros editores (post, sobre, depoimentos, etc.):
  - Abre modal com a biblioteca
  - Filtros pré-definidos por contexto (ex: image picker do banner do Sobre filtra por `dominio_uso=banner`)
  - Botão "Upload novo" inline
  - Retorna URL escolhida

### Edição inline

- [ ] CA6 — No editor de post, botão "Inserir Imagem" abre image picker, ao escolher → insere `<FiguraInline src="..." alt="..." legenda="..." />` no MDX

### Limpeza

- [ ] CA7 — Cron diário verifica assets sem referência em nenhum recurso (post/copy/etc.) → marca como "órfão" (não deleta automaticamente)
- [ ] CA8 — Tela "Assets órfãos" pra admin-previx revisar e deletar manualmente

### Migração de assets existentes

- [ ] CA9 — Script `scripts/migrate-assets.ts` que:
  - Lê `public/assets/` recursivamente
  - Faz upload para Supabase Storage
  - Popula `site.assets`
  - Mapeia caminhos antigos → URLs novas
  - Gera relatório de migração em `docs/ASSETS_MIGRATION.md`

- [ ] CA10 — Após migração validada, posts/copies migram referências para URLs Supabase (via STORY-024)

## Pendências externas

- Confirmar limites do plano Supabase (storage, transfer, transformations)
- Decisão JG: SVG pode ser servido direto (sem resize) ou precisa sanitização? (sugestão: passar por DOMPurify equivalente para evitar XSS via SVG malicioso)
- Decisão JG: vídeos do YouTube embed continuam como hoje (URL externa) ou hospedar internamente? (sugestão: continua YouTube — barato, performático, escala)

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** `backlog`

**Branch/PR:**

**Arquivos esperados:**
- `supabase/functions/upload-asset/index.ts`
- `src/admin/pages/assets/AssetsPage.tsx`
- `src/admin/pages/assets/AssetUploader.tsx`
- `src/admin/components/ImagePicker.tsx` (compartilhado)
- `scripts/migrate-assets.ts`
- `docs/ASSETS_MIGRATION.md`

---

## QA

**Gate:**

**Checklist:**
- [ ] Upload com resize gera 3 variantes WebP
- [ ] Image picker funciona em editor de post (CA6 da STORY-020)
- [ ] Editor-blog faz upload, vê apenas próprios na "Excluir" (delete-own)
- [ ] admin-previx vê tudo e pode deletar todos
- [ ] Migração de assets existentes não quebra nenhuma referência em produção
- [ ] Lighthouse Performance mantém ≥90 (imagens otimizadas)
