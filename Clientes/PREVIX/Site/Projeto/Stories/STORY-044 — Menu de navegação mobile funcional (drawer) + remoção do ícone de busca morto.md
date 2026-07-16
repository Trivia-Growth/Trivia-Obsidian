---
id: STORY-044
titulo: "Menu de navegação mobile funcional (drawer) + remoção do ícone de busca morto"
fase: 6
modulo: "Layout · Header/Navegação"
status: concluido
prioridade: critica
agente_responsavel: "@dev"
criado: 2026-07-14
atualizado: 2026-07-14
epico: null
tipo: hotfix
---

# STORY-044 — Menu de navegação mobile funcional (drawer)

> **Hotfix P0.** JG reportou que os botões de busca e menu do header não funcionavam
> nem no desktop nem no mobile. No mobile o impacto era grave: **sem navegação alguma**.

## Contexto / Diagnóstico (código real)

O `src/components/layout/SiteHeader.astro` (usado no site inteiro via `BaseLayout`)
tinha os botões de busca e menu como `<span class="icon-btn">` puramente decorativos,
vindos do handoff de design — **nunca houve JavaScript ligado a eles**. Nenhum handler
de clique, nenhum drawer, nenhum overlay.

Agravante no mobile: em `src/styles/site.css` (`@media max-width:1000px`), a navegação
principal some (`.nav-main, .nav-social { display: none; }`). Ou seja, no celular/tablet
o hambúrguer era a **única** forma de navegar — e ele não fazia nada. Usuário ficava
preso na página. No desktop os ícones também eram inertes, mas como a nav completa
aparece, passava despercebido.

Busca: **não existe feature de busca no site** (o `/pesquisa/[slug]` é pesquisa de
satisfação/NPS, coisa diferente). A lupa era decoração sem destino. **Decisão do JG:
remover o ícone de busca** (não inventar feature — Triviaiox Art. IV No Invention).

## Escopo

### ✅ Inclui
1. **Remover** o ícone de busca (lupa) do header.
2. Transformar o hambúrguer de `<span>` em `<button>` real acessível
   (`aria-expanded`, `aria-controls`, `aria-label` que alterna Abrir/Fechar).
3. **Drawer off-canvas** (desliza da direita) com os 5 links de navegação + redes
   sociais, funcionando em desktop e mobile.
4. Fechamento por: botão X, clique no backdrop, tecla **Esc**, e clique em qualquer
   link (navega e fecha). `body.nav-open` trava o scroll do fundo.
5. Estilo consistente com a marca (fundo `--c-navy`, hover/ativo `--c-cyan`).

### ❌ NÃO inclui
- Qualquer feature de busca (removida por decisão do JG).
- Mudança na navegação de desktop (a `.nav-main` continua igual).

## Critérios de Aceite

- [x] CA1 — Ícone de busca removido do header em todas as páginas.
- [x] CA2 — Hambúrguer abre o drawer com os 5 links + redes sociais.
- [x] CA3 — No mobile (≤1000px), com a `.nav-main` oculta, o drawer é a via de navegação e funciona.
- [x] CA4 — Drawer fecha por X, backdrop, Esc e ao clicar num link.
- [x] CA5 — Link ativo destacado em ciano (`is-active`) também dentro do drawer.
- [x] CA6 — `npm run build` passa (astro build + validate:schema + lint:content verdes).
- [x] CA7 — Nenhum erro/warning novo de typecheck além do baseline conhecido.

## Arquivos

| Arquivo | Mudança |
|---------|---------|
| `src/components/layout/SiteHeader.astro` | Remove lupa; hambúrguer vira `<button>`; markup do drawer (backdrop + aside) fora do `<header>`; `<script>` de abrir/fechar (clique, backdrop, Esc, link). Links/sociais em arrays reaproveitados por nav-main e drawer. |
| `src/styles/site.css` | Estilos do drawer (`.nav-drawer`, `.nav-drawer-backdrop`, `.nav-drawer-links`, `.nav-drawer-social`, `.nav-drawer-close`), reset de `button.icon-btn` e `body.nav-open` (scroll lock). |

## Notas de Implementação (2026-07-14)

- **Feito e verificado.** Commit em `main` (deploy Netlify automático).
- Verificação: teste ao vivo na home (dev server) — desktop e mobile 375px — drawer
  abre com todos os links + sociais, Esc fecha, clique em "Sobre" navega e fecha; a
  `.nav-main` some no mobile como esperado. **Build de produção** confirma o header
  novo (drawer presente, lupa ausente) em **todas** as rotas do `dist/` (home, sobre,
  serviços, notícias, contato, faq e páginas aninhadas), com o script do drawer
  inlinado em cada página e todas as regras de CSS do drawer presentes no bundle.
- Pegadinha de dev: o adaptador `@astrojs/netlify` no `astro dev` serve páginas
  SSR/prerender pela função emulada usando os assets do último `astro build`, o que
  causou cache de rota velha e FOUC inconsistente em páginas internas durante o teste
  local (irrelevante pro deploy — o `dist/` é a verdade). Limpar `node_modules/.vite`
  + restart normaliza o dev.
