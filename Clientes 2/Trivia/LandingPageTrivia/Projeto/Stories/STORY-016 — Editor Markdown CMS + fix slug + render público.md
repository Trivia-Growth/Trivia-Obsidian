---
id: STORY-016
titulo: "Editor Markdown no CMS + fix 400 slug + render público"
modulo: "CMS / Admin / Diário"
status: concluido
prioridade: P1
origem: lucas
agente_responsavel: "@dev"
criado: 2026-04-26
atualizado: 2026-04-26
---

# STORY-016 — Editor Markdown no CMS + fix 400 + render público

## Contexto

O `/admin/conteudo` lança erro 400 "validation failed" ao tentar salvar um artigo. A causa raiz é o campo slug: o Zod backend exige `[a-z0-9-]+` mas o frontend não sanitiza a entrada — qualquer maiúscula, acento ou espaço falha silenciosamente com mensagem genérica.

Além do bug, o editor de corpo (`body`) é um `<textarea>` sem suporte a Markdown. O campo `body` já é descrito no código como "markdown-ish simples", e a rota pública `/diario/$slug` só faz `split("\n\n")` — sem render de headings, blockquotes, citações ou código. Lucas precisa conseguir escrever conteúdo formatado (títulos, citações, listas) e ver isso renderizado na página pública.

Posts criados via admin (Supabase) também são invisíveis publicamente porque `/diario/$slug` lê apenas de `src/content/posts.ts` (estático). Esta story fecha esse gap com um fallback de leitura do Supabase.

## Critérios de Aceite

- [x] CA1 — **Fix slug**: campo slug em `/admin/conteudo` auto-sanitiza em tempo real (lowercase, espaços→hífen, remove chars inválidos). Erro 400 não ocorre mais por slug malformado.
- [x] CA2 — **Lib instalada**: `marked` adicionado ao `package.json` como dependência de produção.
- [x] CA3 — **Editor com preview**: campo "CORPO" no modal de criação tem duas abas — EDITAR (textarea mono) e PREVIEW (render Markdown com class `article-body`). Troca de aba não perde o texto.
- [x] CA4 — **Render público**: `/diario/$slug` renderiza o `body` com `marked.parse()` via `dangerouslySetInnerHTML` e class `article-body`. O split `\n\n` antigo é removido.
- [x] CA5 — **Bridge Supabase**: loader de `/diario/$slug` tenta `posts.ts` (estático) primeiro; se não encontrar, busca em `content_items` do Supabase (anon key, RLS permite SELECT em publicado). Adapta `ContentItem` → estrutura compatível com o template existente.
- [x] CA6 — **CSS `.article-body`**: bloco adicionado em `src/styles.css` com estilos para `p`, `h2`, `h3`, `blockquote`, `code`, `pre`, `ul/ol`, `a`, `strong`, `em`, `hr`. Usa tokens `--petrol`, `--coral`, `--bone`, `--ff-display`, `--ff-mono`.
- [x] CA7 — **Regressão**: posts estáticos existentes (`/diario/agencia-consultoria-estudio` etc.) continuam funcionando sem alteração.
- [x] CA8 — `npx tsc --noEmit` e `npm run lint` sem erros.

## Escopo

**IN:**

- Auto-sanitize do slug no `onChange` em `conteudo.tsx`
- Abas Editar/Preview no `NewContentModal`
- `marked` como única nova dependência
- Render Markdown em `/diario/$slug.tsx`
- Fallback Supabase no loader de `/diario/$slug.tsx`
- Bloco CSS `.article-body` em `styles.css`

**OUT:**

- Mudança no schema Supabase (nenhuma migration necessária)
- Editor WYSIWYG ou biblioteca de editor rich-text
- Suporte Markdown no `/casos/$slug` (próxima story)
- Migração completa de `posts.ts` para Supabase (STORY-011)
- Campo `cover_url` ou `author` no modal (campos já existem no DB, adicionados em story futura)

## Dependências

- STORY-011 (migração CMS) — esta story cria o bridge, não completa a migração
- `src/routes/admin/conteudo.tsx` — modal de criação
- `src/routes/diario/$slug.tsx` — rota pública
- `src/styles.css` — design system
- `src/content/posts.ts` — mantido intacto
- `netlify/functions/admin-content.ts` — NÃO alterado

## Notas Técnicas

### Fix slug (CA1)

```ts
// onChange do input slug em NewContentModal
onChange={(e) =>
  setSlug(
    e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
  )
}
```

### Abas Preview (CA3)

Estado `previewMode: boolean` no `NewContentModal`. Botões pill acima do textarea (sem lib extra). Preview usa `<div dangerouslySetInnerHTML={{ __html: marked.parse(body) }} className="article-body" />`.

### Render público (CA4)

Substituir o bloco de `paragraphs.map(...)` por:

```tsx
<div className="article-body" dangerouslySetInnerHTML={{ __html: marked.parse(p.body) }} />
```

### Bridge Supabase (CA5)

O loader em `/diario/$slug.tsx` importa `createClient` do `@supabase/supabase-js` (já instalado) e usa `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`. Função `adaptContentItem` mapeia `ContentItem` para o tipo `Post` local.

### CSS `.article-body` (CA6)

Tokens obrigatórios: `--petrol`, `--coral`, `--bone`, `--ink-70`, `--ink-15`, `--ff-display`, `--ff-mono`. Blockquote: borda esquerda coral, font-family display, itálico. Code: background bone, font mono. Pre: background petrol, text paper.

## Lista de Arquivos

- [ ] `src/routes/admin/conteudo.tsx` — slug sanitize + abas preview
- [ ] `src/routes/diario/$slug.tsx` — render marked + bridge Supabase
- [ ] `src/styles.css` — bloco `.article-body`
- [ ] `package.json` — `+ marked`

## Complexity

**Estimativa:** M (3-5h)
**Pontos:** 3

## Definition of Done

- [ ] Build OK: `npm run build`
- [ ] TypeScript sem erros: `npx tsc --noEmit`
- [ ] Lint OK: `npm run lint`
- [ ] Preview testado: slug auto-sanitize, abas editar/preview, post publicado renderizando Markdown
- [ ] Regressão: posts estáticos existentes funcionando

## Change Log

| Data       | Agente | Ação                                     |
| ---------- | ------ | ---------------------------------------- |
| 2026-04-26 | @sm    | Story criada                             |
| 2026-04-26 | @dev   | Implementação concluída — commit d5cbd74 |
