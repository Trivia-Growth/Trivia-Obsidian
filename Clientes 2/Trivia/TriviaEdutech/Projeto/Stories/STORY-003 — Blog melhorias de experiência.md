---
id: STORY-003
titulo: "Blog — melhorias de experiência"
fase: 1
modulo: "Blog"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-04-17
atualizado: 2026-04-17
---

# STORY-003 — Blog — melhorias de experiência

## Contexto

A listagem do blog só tinha busca por texto e sem campos de autor/tags no form. O objetivo era enriquecer a experiência de consumo de artigos com filtros, tracking de leitura, artigos relacionados e progresso de leitura.

## Critérios de Aceite

- [x] CA1 — Campos Autor e Tags no form de criação e edição de artigos
- [x] CA2 — Filtro por categoria e tags na listagem
- [x] CA3 — Ordenação por mais recentes / mais antigos / mais lidos
- [x] CA4 — Badge "Lido" nos cards para usuários logados
- [x] CA5 — Botão "Marcar como lido" no detalhe do artigo
- [x] CA6 — Auto-marca como lido ao atingir 90% de scroll
- [x] CA7 — Artigos relacionados (mesma categoria) no rodapé
- [x] CA8 — Barra de progresso de leitura fixa no topo
- [x] CA9 — TOC automático na sidebar gerado dos headings do markdown

---

## Implementação

**Status:** `concluido`

**Branch/PR:** main (ac30ae5)

**Arquivos alterados:**
- `src/pages/blog/ArticlesList.tsx`
- `src/pages/blog/ArticleDetail.tsx`
- `src/pages/admin/Articles.tsx`
- `src/features/seo/hooks/useArticles.ts`
- `src/features/seo/hooks/useArticleReads.ts` *(novo)*
- `src/integrations/supabase/types.ts`
- `supabase/migrations/20260417195000_blog_author_tags_reads.sql` *(novo)*

---

## QA

**Gate:** `PASS`

**Checklist:**
- [x] Critérios de aceite validados
- [x] Build sem erros, TypeScript strict
- [x] RLS habilitado + FORCE em `article_reads`
- [x] Teste local confirmado pelo piloto
- [x] `supabase db push` executado com sucesso

---

## Notas e Decisões

- `author_name` adicionado como campo texto livre (suporta autores externos sem conta)
- Marcar como lido usa `upsert` com `onConflict` para evitar duplicatas
- TOC é extraído via regex do markdown bruto (não depende de biblioteca extra)
- Ordenação por `most_read` usa `view_count` já existente na tabela
