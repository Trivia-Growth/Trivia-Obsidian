---
id: STORY-046
titulo: "Admin de posts: arquivar/excluir + capa gerada por IA persiste"
fase: 6
modulo: "Blog/CMS · Admin de Posts"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-07-14
atualizado: 2026-07-14
epico: null
tipo: fix
relacionado: STORY-043
---

# STORY-046 — Arquivar/excluir post + capa gerada persiste

> JG: "Não encontrei como excluir ou arquivar um post do blog, e ao gerar uma capa
> com a IA parece que não salvou."

## Diagnóstico (investigação + verificação adversarial)

**1. Excluir/arquivar — feature AUSENTE só na UI.** O banco já suporta 100%:
`site.posts.status` tem CHECK com `'arquivado'`, coluna `deletado_em` (soft-delete),
RLS de update/delete para authenticated, e `audit_log` aceita `archive`/`delete`/`restore`.
A lista já filtra `deletado_em is null` e pinta o badge `arquivado`, mas **nenhum botão**
escrevia `deletado_em` nem setava `status='arquivado'`. O editor só tinha Salvar
rascunho/Publicar. Padrão de soft-delete client-side já existia em `FAQPage.tsx`.

**2. Capa gerada por IA — present-broken (armadilha de UX de 3 cliques).** A edge
`generate-cover-image` sobe o PNG no bucket `site-assets` (público) e retorna a URL —
funciona. Mas no front, "Gerar capa com IA" só fazia `setCoverPreview(url)` (estado
efêmero). A URL só entrava no post com um 2º clique em "Usar esta" (`update('imagem_capa')`,
só estado) e um 3º clique em Salvar/Publicar. Sem auto-save: quem gerava e não completava
os 3 cliques via a capa "sumir" no reload. (A edge grava só em `audit_log`, não em
`site.assets` — por isso a capa gerada também não aparece na Biblioteca.)

## Escopo

### ✅ Inclui
1. **Lista (`PostsListPage.tsx`)**: coluna "Ações" com **Arquivar/Desarquivar** (toggle
   `status`) e **Excluir** (soft-delete via `deletado_em`, com `confirm()`). Cada ação
   grava sob RLS do usuário, registra `audit_log` (best-effort) e **dispara `trigger-rebuild`**
   (site estático: sem rebuild o post sai do banco mas continua no HTML no ar).
2. **Editor (`PostEditor.tsx`)**: paridade — botões Arquivar/Desarquivar e Excluir na
   toolbar (só em post existente).
3. **Capa (`PostEditor.tsx`)**: "✓ Usar esta" e "✓ Confirmar" (logo) agora chamam
   `aplicarCapa(url)` que **persiste na hora**: post existente grava `imagem_capa` direto
   no banco (+ rebuild se publicado); post novo entra no estado e é gravado no Salvar, com
   **aviso persistente** ("Capa aplicada. Clique em Salvar/Publicar para gravar."). Escreve
   a URL explicitamente (evita closure stale).

### ❌ NÃO inclui
- Hard-delete físico na UI (editor-blog não tem permissão `delete`; soft-delete via UPDATE
  funciona para os dois papéis e é reversível no banco).
- Registrar a capa gerada em `site.assets` para aparecer na Biblioteca (enhancement à parte;
  precisa passar `tamanho` NOT NULL e usar prefixo `posts/` para bater no filtro do ImagePicker).
- Tela de "lixeira" para restaurar soft-deletados (recuperável via banco; arquivar é o
  caminho reversível pela UI).

## Critérios de Aceite

- [x] CA1 — Lista tem Arquivar/Desarquivar e Excluir por post; editor idem (post existente).
- [x] CA2 — Excluir = soft-delete (`deletado_em`), some da lista, recuperável no banco, com confirmação.
- [x] CA3 — Toda ação dispara `trigger-rebuild` (post sai do site no ar) e registra audit_log.
- [x] CA4 — "Usar esta"/"Confirmar" persistem a capa na hora (post existente grava no DB) + aviso no post novo.
- [x] CA5 — `npm run build` (astro build) passa; nenhum erro novo de typecheck no meu código.

## Arquivos

| Arquivo | Mudança |
|---------|---------|
| `src/admin/pages/posts/PostsListPage.tsx` | Coluna "Ações" na `SortableRow` (oculta em reorderMode); mutation `postAction` (archive/restore/delete) com rebuild + auditoria + toast. |
| `src/admin/pages/posts/PostEditor.tsx` | `aplicarCapa()` persiste a capa na hora; `arquivarPost()`/`excluirPost()` + botões na toolbar; estado `capaMsg` (aviso) e `postActioning`. |

## Notas de Implementação (2026-07-14)

- Investigação com verificação adversarial (2 agentes por frente): ambos confirmaram
  o diagnóstico. Soft-delete + arquivar via UPDATE client-side (mesma RLS do save), sem
  migration/edge. Nenhuma edge alterada → só push (deploy Netlify automático do frontend).
- Verificação: `astro build` verde; typecheck sem erro novo no meu código (erros restantes
  são o baseline conhecido do `types.ts` com lixo de CLI, à parte). Click-through visual
  atrás do login (arquivar/excluir/gerar+salvar capa) pendente de validação do JG no admin ao vivo.
- Decisão: Excluir = soft-delete (reversível, seguro, funciona p/ editor-blog e admin).
  Sugestão futura: capa gerada aparecer na Biblioteca (registrar em `site.assets`).
