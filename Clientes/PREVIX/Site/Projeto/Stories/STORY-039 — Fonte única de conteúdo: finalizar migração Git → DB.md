---
id: STORY-039
titulo: "Fonte única de conteúdo: finalizar migração Git → DB e aposentar leitura do Git"
fase: 6
modulo: "Blog/CMS · Conteúdo"
status: backlog
prioridade: alta
agente_responsavel: ""
criado: 2026-07-08
atualizado: 2026-07-08
depende_de: STORY-037, STORY-042
epico: EPIC-002
---

# STORY-039 — Fonte única de conteúdo: finalizar migração Git → DB

> M2. Elimina a **ambiguidade estrutural** de "onde eu edito esse post?". Conclui a "fase 2" da STORY-024 que nunca aconteceu.

## Contexto

`src/lib/data/posts.ts::getAllPosts()` roda uma **"estratégia híbrida"** explícita (comentário linhas 1-6): lê `site.posts` (status publicado) e depois faz merge com `getCollection('blog')`, **excluindo do Git qualquer slug já presente no DB** (linhas 87-88). Resultado prático:

- 19 arquivos `.mdx` em `src/content/blog/` convivem com posts no banco.
- Um post pode existir só no Git, só no DB, ou (perigosamente) nos dois — e a regra de merge silenciosamente prioriza o DB.
- O post mais recente ("Reforma Tributária") foi editado **direto no Git** (`07e9405`, `bcf38dd`), enquanto o fluxo "oficial" é o admin → DB. Ninguém sabe, batendo o olho, qual é a fonte de verdade de cada post.

A STORY-024 previa concluir o cutover ("5 posts existentes saem do Git, ficam em DB"), mas `scripts/migrate-content-to-db.ts` tem o comentário revelador *"Não migrado (fase 2 do épico, quando demanda surgir)"* — a fase 2 nunca rolou.

## Escopo

### ✅ Inclui
1. **Migrar os 19 `.mdx` legados restantes** para `site.posts` via script idempotente (pula slugs já no DB), **sem chave hardcoded** (usa `process.env` — depende de STORY-042 estar feita).
2. **Aposentar a leitura do Git** em `getAllPosts()`: passa a ler **só o DB**. Remove o bloco de merge com `getCollection('blog')` (linhas 85-111).
3. **Destino da collection `blog`:** arquivar os `.mdx` para fora do build (recomendação: mover para `docs/legacy-blog/`) e ajustar/remover a collection em `src/content.config.ts` para não quebrar o build. Deletar de vez só após 1 build verde confirmando paridade.
4. **Reconciliar duplicatas:** para slugs que existem em Git **e** DB, confirmar qual é o conteúdo bom (o do DB vence, mas validar que não há post editado só no Git que se perderia — ex.: "Reforma Tributária", se ainda não estiver no DB).
5. Atualizar `CLAUDE.md`/`architecture.md`/Roadmap: fonte de verdade de conteúdo = **DB**, Git aposentado para posts.

### ❌ NÃO inclui
- Gate de qualidade (STORY-040).
- Mudar o schema `site.posts`.
- Migrar FAQ/páginas/serviços (já vieram no EPIC-001; foco aqui é blog).

## Detalhamento

**Ordem segura de execução:**
1. Rodar o script de migração (idempotente) → confirmar que os 19 slugs estão em `site.posts` com `status` correto.
2. **Auditoria de paridade:** comparar a lista de slugs renderizados hoje (`getAllPosts` híbrido) com a lista pós-corte (só DB). Devem bater 1:1. Prestar atenção especial em "reforma-tributaria-contratos-facilities" e qualquer post editado só no Git.
3. Trocar `getAllPosts()` para ler só o DB.
4. Mover `.mdx` para `docs/legacy-blog/` e ajustar `content.config.ts`.
5. `npm run build` verde + conferir que todas as rotas `/noticias/[slug]` continuam existindo.

**Cuidado com o lint:** hoje `scripts/lint-content.ts` e o Zod de `content.config.ts` operam sobre `src/content/blog/`. Ao esvaziar essa pasta, o lint de build fica sem alvo — isso é **esperado** e será resolvido por STORY-040 (gate migra para o fluxo DB). Documentar a transição para não parecer regressão.

## Critérios de Aceite

- [ ] CA1 — Os 19 `.mdx` legados estão em `site.posts` com título, lede, estatísticas, FAQ e corpo íntegros (spot-check de 3 posts renderizados antes/depois).
- [ ] CA2 — `getAllPosts()` não chama mais `getCollection('blog')`; lê exclusivamente o DB.
- [ ] CA3 — Auditoria de paridade: a lista de slugs publicados é **idêntica** antes e depois do corte (nenhum post some).
- [ ] CA4 — Posts editados só no Git (ex.: Reforma Tributária) foram preservados no DB antes do corte.
- [ ] CA5 — `.mdx` arquivados fora do build; `content.config.ts` ajustado; `npm run build` passa.
- [ ] CA6 — Script de migração sem segredo hardcoded (usa env).
- [ ] CA7 — `CLAUDE.md` + Roadmap atualizados: DB é a fonte única de conteúdo de blog.

## Arquivos esperados

| Arquivo | Mudança |
|---------|---------|
| `scripts/migrate-git-posts-to-db.mjs` | Rodar (idempotente, sem chave hardcoded); usar para migrar os 19 |
| `src/lib/data/posts.ts` | `getAllPosts()` lê só o DB; remove merge com Git |
| `src/content.config.ts` | Ajustar/remover collection `blog` |
| `src/content/blog/*.mdx` → `docs/legacy-blog/` | Arquivar 19 arquivos |
| `CLAUDE.md`, `architecture.md`, Roadmap | Fonte de verdade = DB |

## Riscos

- **Perda de post editado só no Git** se a migração não capturar a última versão do `.mdx`. Mitigação: CA3/CA4 (auditoria de paridade antes de deletar; arquivar em vez de deletar de imediato).
- **Rotas 404** se um slug sumir. Mitigação: comparar `getStaticPaths` antes/depois.
