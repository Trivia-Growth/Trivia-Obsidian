---
id: STORY-020
titulo: "CRUD de posts (editor MDX + lint Jimmy 3.0)"
fase: 6
modulo: "Admin/Conteúdo"
status: done
prioridade: alta
agente_responsavel: ""
criado: 2026-05-08
atualizado: 2026-05-08
epic: EPIC-001
---

# STORY-020 — CRUD de posts (editor MDX + lint Jimmy 3.0)

## Contexto

Editor de posts no painel admin, com lint Jimmy 3.0 ativo no save (não no build). Coração do EPIC-001 dado o volume esperado de 5+ posts/mês. Precisa equilibrar:

- **Rigor AEO/GEO** — lint Jimmy 3.0 enforça ≥3 estatísticas, blocos H2 50-150 palavras, lede 40-60, FAQ 4-8
- **Produtividade do editor** — feedback inline durante a escrita, não só no save
- **Preview fiel** — editor mostra exatamente como vai ficar em produção

## Critérios de Aceite

### Decisão técnica do editor

- [ ] CA1 — **Decisão registrada em ADR-012** (editor MDX): comparar 3 opções
  - **Monaco** (VSCode editor): poderoso, syntax MDX, peso ~600KB
  - **TipTap** (rich text com markdown shortcuts): UX moderna, mas custom para MDX é complexo
  - **textarea + preview lado a lado**: simples, suficiente, ~0KB extra
  - **Recomendação inicial:** Monaco com plugin MDX — vale o peso pelo poder

- [ ] CA2 — Setup do editor escolhido + tema escuro/claro alinhado com painel

### Listagem de posts

- [ ] CA3 — Rota `/admin/posts`:
  - Tabela com: thumbnail (capa), título, status (badge: rascunho/agendado/publicado/arquivado), categoria, autor, data publicação, atualizado em, ações
  - Filtros: status, categoria, autor, busca por título
  - Visível conforme permissão `posts.read`
  - Botão "Novo post" (visível com `posts.create`)
  - Ações por linha: Editar, Visualizar, Duplicar, Arquivar, Excluir (cada ação respeitando permissão correspondente)

### Editor de post

- [ ] CA4 — Rota `/admin/posts/novo` e `/admin/posts/[id]/editar`:
  - Layout 2 colunas: campos do frontmatter (esquerda) + editor MDX (direita)
  - Toolbar superior: status (rascunho/publicar/agendar), botão Salvar (autosave a cada 30s), botão Visualizar (preview em iframe), botão Duplicar
  - Frontmatter: titulo (max 80), slug (auto-gerado do título, editable), categoria, publicadoEm (date picker), autor (select de auth.users), lede (text com contador 40-60 palavras + cor de feedback), conclusoesPrincipais (lista 3-5 items), estatisticas (sub-form repetível com valor/descricao/fonte/fonteUrl), faq (sub-form repetível pergunta/resposta), schemaTipo (Article/BlogPosting/HowTo), imagemCapa (image picker da biblioteca), ctaBg/ctaTitulo/ctaTexto (opcionais), descricaoSEO (max 180), mostrarSumario (toggle), dropCap (toggle), proximoPost (opcional)
  - Editor MDX para o corpo

### Lint Jimmy 3.0 inline

- [ ] CA5 — Edge Function `validate-post`:
  - Recebe payload completo do post
  - Aplica Zod (lede 40-60 palavras, faq.resposta 40-150, estatisticas com fonte+URL, FAQ 4-8 perguntas)
  - Aplica lint estrutural (≥3 ocorrências de `<Estatistica>` no corpo, blocos H2 50-150 palavras)
  - Retorna `{ ok: true }` ou `{ ok: false, errors: [{ campo, mensagem, nivel: 'erro'|'aviso' }] }`

- [ ] CA6 — Editor consome a Edge Function em **debounce de 1s** durante edição:
  - Erros aparecem inline (sublinhado vermelho + tooltip) e numa barra lateral "Validação Jimmy 3.0"
  - Avisos (não bloqueantes) aparecem em laranja
  - Status na toolbar: "✓ Conforme" / "✗ N erros, M avisos"

- [ ] CA7 — **Save bloqueado se houver erros** quando status='publicado'. Status='rascunho' aceita save com erros.

- [ ] CA8 — **Atalhos visuais Jimmy 3.0** no editor:
  - Botão "Inserir Estatística" → modal com campos valor/descricao/fonte/fonteUrl + insere `<Estatistica ... />` no MDX
  - Botão "Inserir Citação" → insere `<Citacao>` (depende STORY-014 ter criado o componente)
  - Botão "Inserir Callout" → idem
  - Botão "Inserir Figura" → image picker + insere `<FiguraInline>`
  - Botão "Inserir H2 (pergunta)" → snippet com placeholder de pergunta

### Preview live

- [ ] CA9 — Modo "Preview" mostra o post renderizado em iframe lado a lado, com mesmos estilos da página real
- [ ] CA10 — Preview reflete frontmatter + corpo em tempo real (debounce 500ms)
- [ ] CA11 — Preview mostra também o **JSON-LD** que será injetado (debug AEO)

### Rascunho, agendamento e publicação

- [ ] CA12 — Status `rascunho`: visível só para autor + admin-previx, NÃO entra no sitemap, NÃO entra no rebuild
- [ ] CA13 — Status `agendado`: usuário escolhe data futura, cron diário verifica e publica automaticamente
- [ ] CA14 — Status `publicado`: aciona `site.publish_post(post_id)` que dispara webhook Netlify build hook → site rebuilda → post aparece em produção
- [ ] CA15 — Status `arquivado`: post some do site público mas mantém URL retornando 410 Gone (LGPD-friendly se conteúdo foi removido) ou 301 redirect para post substituto

### Histórico e versões

- [ ] CA16 — Cada save grava em `audit_log` com `payload_before` e `payload_after` (JSONB)
- [ ] CA17 — Aba "Histórico" no editor mostra últimas 10 versões + diff visual + botão "Restaurar"
- [ ] CA18 — Restaurar uma versão = INSERT novo registro em audit + UPDATE com payload da versão escolhida (não destrutivo)

### Webhook de rebuild

- [ ] CA19 — Build Hook do Netlify criado (via API ou painel) — URL guardada em `supabase.secrets`:
  ```bash
  supabase secrets set NETLIFY_BUILD_HOOK_URL=https://api.netlify.com/build_hooks/...
  ```
- [ ] CA20 — Função `site.publish_post` faz `pg_notify('publish', post_id::text)` ou Edge Function dispara fetch ao build hook
- [ ] CA21 — Throttle: se múltiplos posts publicarem em <1min, agrupar em 1 rebuild (queue)

## Pendências externas

- JG fornece **NETLIFY_BUILD_HOOK_URL** (cria no painel ou autoriza eu criar via CLI)
- Decisão JG: editor agendado dispara cron Postgres ou Edge Function chamada por cron Vercel/Netlify? (sugestão: cron Postgres é mais simples)
- Decisão JG: posts arquivados → 410 Gone ou 301 redirect?

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** `backlog`

**Branch/PR:**

**Arquivos esperados:**
- `supabase/functions/validate-post/index.ts`
- `supabase/functions/publish-post/index.ts` (chama build hook)
- `supabase/migrations/20260508140000_publish_post_function.sql`
- `src/admin/pages/posts/PostsListPage.tsx`
- `src/admin/pages/posts/PostEditor.tsx`
- `src/admin/pages/posts/components/MDXEditor.tsx`
- `src/admin/pages/posts/components/FrontmatterForm.tsx`
- `src/admin/pages/posts/components/LintPanel.tsx`
- `src/admin/pages/posts/components/PreviewPane.tsx`
- `src/admin/pages/posts/components/HistorySidebar.tsx`
- `src/admin/lib/lint-jimmy.ts` (espelho do `scripts/lint-content.ts`)

---

## QA

**Gate:**

**Checklist:**
- [ ] Editor abre, autosave funciona, lint inline aparece em <1s
- [ ] Save bloqueado quando publicar com erros Jimmy 3.0
- [ ] Save permitido como rascunho com erros
- [ ] Preview reflete frontmatter + corpo em tempo real
- [ ] Publicar dispara build hook, post aparece em produção em <2min
- [ ] Histórico mostra últimas 10 versões e restaurar funciona
- [ ] Editor-blog não vê posts de outros editores (se decisão for "vê só os próprios")
- [ ] admin-previx vê tudo
- [ ] Lint Jimmy 3.0 idêntico ao do build (mesmas regras, mesmos resultados)
