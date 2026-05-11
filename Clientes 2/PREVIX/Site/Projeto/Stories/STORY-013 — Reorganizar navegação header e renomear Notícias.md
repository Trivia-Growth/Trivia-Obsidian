---
id: STORY-013
titulo: "Reorganizar navegação: FAQ só no footer + 'Blog & Notícias'"
fase: 5.5
modulo: "UI/Navegação"
status: backlog
prioridade: media
agente_responsavel: ""
criado: 2026-05-08
atualizado: 2026-05-08
---

# STORY-013 — Reorganizar navegação header e renomear Notícias

## Contexto

Duas mudanças de IA (Information Architecture) pedidas por JG:

1. **Remover "FAQ" do header** — hoje aparece como item de menu principal junto com Home/Sobre/Serviços/Notícias/Orçamentos/Contato. JG considera que o FAQ é destino secundário (consultivo, não decisório) e quer simplificar a barra de navegação.
2. **Renomear "Notícias" para "Blog & Notícias"** — hoje o link é só "Notícias", mas o conteúdo do `/noticias` mistura cases (Sky Vila Matilde), institucional (PX One, Postes IA, monitoramento) e conteúdo evergreen — funcionalmente é blog. Renomear deixa mais claro pro visitante e pro Google entender que ali tem conteúdo recorrente, não só "release notes".

**Manter:**
- Página `/faq` continua no rodapé (link visível ali) e indexada (sitemap, FAQPage Schema, llms.txt).
- URL continua `/noticias` (não vamos quebrar SEO/canonical/redirects). Só o **rótulo do link** muda.

## Critérios de Aceite

- [ ] CA1 — **Header sem FAQ:** remover `<a href="/faq">` de `src/components/layout/SiteHeader.astro` (linha 27). Versão final do menu: Home · Sobre · Serviços · Blog & Notícias · Orçamentos · Contato.
- [ ] CA2 — **Footer com FAQ:** adicionar link "FAQ" → `/faq` no `SiteFooter.astro` (na seção "Navegação" ou equivalente). Hoje footer não tem link pro FAQ — nesta story ganha.
- [ ] CA3 — **Renomear rótulo do header** "Notícias" → **"Blog & Notícias"** em `SiteHeader.astro`. URL `/noticias` permanece (a renomeação afeta só o texto visível).
- [ ] CA4 — **Renomear no footer** se houver link "Notícias" lá → "Blog & Notícias" (manter `href="/noticias"`).
- [ ] CA5 — **`<title>` e meta description da `/noticias/index.astro`**:
  - `<title>Blog & Notícias — Grupo Previx</title>`
  - description atualizada (hoje: "Blog oficial do Grupo Previx. Notícias, cases e novidades..." → manter mas reforçar termo "blog")
- [ ] CA6 — **H1 da página `/noticias`**:
  - Hoje: `<h1><span class="hl">Notícias</span> sobre Segurança</h1>`
  - Novo: `<h1><span class="hl">Blog</span> & Notícias</h1>` (ou variante que JG aprovar — sugerir 2 opções no Diff Plan)
- [ ] CA7 — **BreadcrumbList Schema** nos posts e na listagem: o segundo item passa a ser `{name: "Blog & Notícias", url: "/noticias"}` (era `Notícias`). Ajustar `src/pages/noticias/index.astro` (linha 17) e `src/pages/noticias/[slug].astro` (linha 43).
- [ ] CA8 — **OG title** e **twitter:title** das páginas `/noticias` e `/noticias/[slug]` refletindo o novo nome (compartilhamentos no LinkedIn/X passam a mostrar "Blog & Notícias").
- [ ] CA9 — **llms.txt** atualizado (`public/llms.txt`) — onde estiver "Notícias" como label de seção, virar "Blog & Notícias".
- [ ] CA10 — **Search Console** (manual JG): a renomeação **não muda URLs**, então não precisa redirect 301. Mas vale conferir que o re-crawl do Google captura o novo H1/title em ~2 semanas.

## Notas Técnicas

- **NÃO mudar a URL** `/noticias` para `/blog` — quebraria os 5 posts já indexados, redirects WP→Astro, sitemap, e backlinks futuros. URL é canônica; só rótulo é cosmético.
- Cuidado com o `current` prop do Header: hoje é `'noticias'` (key interna). Manter assim — chave técnica não muda.
- Revisar se há outras referências literais ao rótulo "Notícias" no codebase antes de commitar:
  ```bash
  grep -rn "Notícias\|>Noticias<" src/ public/
  ```

## Pendências externas

Nenhuma. Mudança puramente de UI/copy. JG aprova o H1 final no Diff Plan.

---

## Implementação

> Preenchido pelo `@dev` quando rodar.

**Status:** `backlog`

**Branch/PR:**

**Arquivos esperados:**
- `src/components/layout/SiteHeader.astro` (remove FAQ + renomeia Notícias)
- `src/components/layout/SiteFooter.astro` (adiciona FAQ + renomeia Notícias se aplicável)
- `src/pages/noticias/index.astro` (título, H1, breadcrumb, meta)
- `src/pages/noticias/[slug].astro` (breadcrumb)
- `public/llms.txt` (label da seção)

---

## QA

> Preenchido pelo `@qa`.

**Gate:**

**Checklist:**
- [ ] Header sem FAQ em todas as rotas
- [ ] Footer com FAQ visível em todas as rotas
- [ ] "Blog & Notícias" aparece no header e no H1 da listagem
- [ ] BreadcrumbList nos posts mostra "Blog & Notícias" no JSON-LD
- [ ] `/faq` continua acessível direto e via footer
- [ ] Sem 404 (URL não mudou)
- [ ] Schema Validator (validator.schema.org) sem erros novos
