---
id: STORY-028
titulo: "Preview de post no admin antes de publicar (renderização fiel ao /noticias/[slug])"
fase: 6
modulo: "Admin/Editor"
status: concluido
prioridade: media
agente_responsavel: "@dev"
criado: 2026-05-14
atualizado: 2026-05-14
---

# STORY-028 — Preview de post antes de publicar

## Contexto

JG pediu poder ver como o post vai aparecer renderizado em produção **antes** de clicar publicar, sem ter que arriscar publicar e depois despublicar. Hoje o PostEditor mostra apenas o form (3 colunas: metadata, conteúdo, lint), nenhuma renderização.

Decisão técnica: rota Astro server-rendered nova `/admin/posts/preview/[id]` que reusa o **mesmo template visual** do `/noticias/[slug]` (BaseLayout + ConclusoesPrincipais + PostFAQ + Sumario + render-mdx). Botão "👁 Preview" no PostEditor faz auto-save (mantém status atual, não rebaixa) + abre nova aba.

## Critérios de Aceite

- [x] CA1 — Edge Function `get-post-preview` (Deno) que recebe `{id}` (UUIDv4) e retorna o post completo via service-role (bypass RLS, permite ler rascunhos). Soft-deleted retornam 404.
- [x] CA2 — Sem auth na Edge Function: security model = "shareable preview link" (UUIDv4 ~10^38 entropy é unpredictable, padrão WordPress/Notion/Ghost).
- [x] CA3 — Rota `/admin/posts/preview/[id].astro` SSR (`prerender = false`):
  - Fetcha Edge Function server-side
  - Renderiza usando `BaseLayout` + componentes `ConclusoesPrincipais`/`PostFAQ`/`Sumario` + `renderMdxToHtml` (mesmo template do `/noticias/[slug]`)
  - Banner sticky no topo com badge de status colorido (rascunho vermelho / agendado azul / publicado verde / arquivado cinza), timestamp do `atualizado_em`, botão "← Editar" volta pro editor e "↻ Atualizar" recarrega
- [x] CA4 — Schema JSON-LD (BlogPosting + FAQPage + BreadcrumbList) gerado igual ao real
- [x] CA5 — Botão "👁 Preview" no header do PostEditor (entre "Salvar rascunho" e "Publicar"). Disabled enquanto save/sem título
- [x] CA6 — `handlePreview()`: `save.mutateAsync(statusToKeep)` + `window.open(/admin/posts/preview/<id>, _blank)`. Mantém status atual (não rebaixa publicado pra rascunho)
- [x] CA7 — Tratamento de erro: se post não encontrado, página exibe mensagem amigável + link voltar pra `/admin/posts`

## Notas Técnicas

- **Por que rota Astro (e não modal React)**: reusa 100% o template real, sem duplicar lógica de render-mdx + componentes Estatistica/Callout/Citacao/FiguraInline em React. Single source of truth.
- **Por que não validar JWT na Edge Function**: simplicidade. URL é UUIDv4, mesmo padrão dos outros tools (Notion/Linear permitem preview por link). Para mudar isso futuro: JWT cookie do Supabase Auth + helper.
- **Cache busting**: rota `prerender:false` + Edge Function sem cache → cada acesso busca DB atualizado.

## Pendências externas

Nenhuma.

---

## Implementação

**Status:** `concluido` em 2026-05-14

**Commit:** `ebc9c0f` — `feat(admin): preview de post antes de publicar`

**Arquivos novos:**
- `supabase/functions/get-post-preview/index.ts`
- `supabase/functions/get-post-preview/deno.json`
- `src/pages/admin/posts/preview/[id].astro`

**Arquivos modificados:**
- `src/admin/pages/posts/PostEditor.tsx` — botão Preview + handlePreview()

**E2E validado em produção (2026-05-14):**
- Preview do post da Click & Pronto (`/admin/posts/preview/50c8520b-1d79-4e11-bffd-9cf828a3f0c3`)
- HTTP 200, 32KB HTML
- Banner sticky com status badge (verde "publicado") + timestamp
- 12 `stat-inline` (3 `<Estatistica/>` × ~4 strings cada), 3 callouts, post-faq, post-hero
- JSON-LD BlogPosting + FAQPage gerados

---

## QA

**Gate:** validado em produção 2026-05-14.

**Checklist:**
- [x] Edge Function `get-post-preview` deployada
- [x] Rota Astro renderiza posts em qualquer status
- [x] Banner sticky muda cor por status
- [x] Botão "← Editar" volta pro PostEditor
- [x] Botão "↻ Atualizar" recarrega
- [x] Componentes editoriais renderizam idêntico ao real
- [x] JSON-LD presente
- [x] Build CI verde (run #25887751965)
