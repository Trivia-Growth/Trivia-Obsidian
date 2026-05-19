---
id: STORY-031
titulo: "Ordenação de notícias (drag & drop + campo ordem no DB)"
fase: 7
modulo: "Admin/Blog"
status: backlog
prioridade: media
agente_responsavel: "@dev"
criado: 2026-05-18
atualizado: 2026-05-18
---

# STORY-031 — Ordenação de notícias no admin

## Contexto

Hoje as notícias em `/noticias` são ordenadas exclusivamente por `publicado_em DESC`. JG quer poder controlar a ordem manualmente — por exemplo, fixar um artigo pilar no topo ou reorganizar a sequência sem alterar datas de publicação. Isso exige um campo `ordem` no DB e uma UI de reordenação no painel admin.

## Critérios de Aceite

### Backend (DB + API)

- [ ] CA1 — Coluna `ordem` (integer, nullable, default null) adicionada em `site.posts`. Posts com `ordem IS NOT NULL` aparecem primeiro (ASC), depois os demais por `publicado_em DESC`.
- [ ] CA2 — Migration SQL idempotente em `supabase/migrations/`.
- [ ] CA3 — RPC ou Edge Function `reorder-posts` que recebe array de `{ id, ordem }` e atualiza em batch. Valida JWT + role (`admin-previx | admin-site | editor-blog`).
- [ ] CA4 — `getAllPosts()` em `src/lib/data/posts.ts` respeita nova lógica de ordenação: `ORDER BY (ordem IS NULL) ASC, ordem ASC, publicado_em DESC`.

### Frontend (Admin)

- [ ] CA5 — Lista de posts no admin (`/admin/posts`) ganha modo "Ordenar" com drag & drop (usar `@dnd-kit/core` ou `react-beautiful-dnd` — o que já estiver no bundle, senão dnd-kit por ser mais leve).
- [ ] CA6 — Ao soltar item, chama `reorder-posts` com as novas posições. Feedback visual: toast de sucesso ou erro.
- [ ] CA7 — Toggle "Ordenação manual ON/OFF" por post: no PostEditor, checkbox "Fixar posição" que ativa/desativa o campo `ordem` para aquele post.
- [ ] CA8 — Posts sem `ordem` (checkbox desmarcado) flutuam por data normalmente abaixo dos fixados.

### Site público

- [ ] CA9 — Página `/noticias` (listagem) e qualquer componente que liste posts respeita a nova ordenação sem breaking change.
- [ ] CA10 — Build Astro + lint + validate-schema passam sem erro.

## Notas Técnicas

- O campo `ordem` nullable permite opt-in gradual: nenhum post existente precisa ser reordenado ao deployar.
- A lógica `(ordem IS NULL) ASC, ordem ASC` garante que posts com ordem definida sempre ficam no topo, e entre si seguem a numeração.
- Batch update via RPC evita N chamadas individuais no drag & drop.

## Dependências

- STORY-020 (CRUD posts funcional) — já concluída.

## Estimativa

- Backend: ~2h (migration + RPC + ajuste `getAllPosts`)
- Frontend: ~3h (drag & drop + toggle + integração)
- QA: ~1h
