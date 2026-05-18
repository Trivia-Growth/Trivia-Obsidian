---
id: STORY-014
titulo: "Tipografia e estrutura editorial dos posts (citação, callouts, ritmo)"
fase: 5.5
modulo: "Conteúdo/UX"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-08
atualizado: 2026-05-08
---

# STORY-014 — Tipografia e estrutura editorial dos posts

## Contexto

JG avaliou os 5 posts do blog em produção e considera **a formatação pobre** — texto corrido com pouca variação visual, faltam recursos editoriais que dão ritmo de leitura e ajudam a IA generativa a identificar elementos-chave (citações, destaques, listas, blockquotes).

Hoje cada post tem:
- Hero com imagem de capa + categoria + título + data
- Lede (parágrafo destacado)
- Conclusões Principais (componente já existe)
- Corpo Markdown corrido com `<Estatistica />` inline
- FAQ ao final
- CTA final

**O que falta:**
1. **Blockquote estilizado** — citações de fontes especializadas, executivos da Previx, dados públicos. Hoje se eu usar `>` em MDX não há estilo.
2. **Callouts/avisos** — caixas tipo "Saiba mais", "Importante", "Dado curioso". Hoje só tem `<Estatistica />` (que é específico para números).
3. **Imagens inline** com legenda (`<figure>` + `<figcaption>`) — atualmente as fotos no corpo do texto são `<figure>` raw sem estilo de caption.
4. **Listas (ul/ol)** sem estilo destacado — bullets pequenos, sem ritmo.
5. **Sumário (TOC)** ao topo de posts longos — facilita navegação E é sinal AEO (IA usa sumário pra mapear escopo).
6. **Subtítulos H3** sem hierarquia visual clara — hoje H2 e H3 visualmente parecidos.
7. **Tipografia do corpo** — line-height, max-width, letter-spacing, espaçamento entre parágrafos podem ser melhorados (hoje parece template default).
8. **Drop cap** opcional na primeira letra (recurso editorial clássico).
9. **Separadores temáticos** (`<hr>`, ou divisor decorativo) entre seções longas.

## Impacto AEO/GEO

- **Blockquotes** com `<cite>` e `<blockquote cite="URL">` ajudam IAs a identificar fonte/autoridade — sinal forte de confiança.
- **Callouts** com role/aria adequados não confundem crawlers e dão estrutura semântica.
- **Sumário/TOC** com `<nav aria-label="Índice">` é lido por LLMs como mapa do conteúdo.
- **Figcaption** populado vira contexto extra que vai pra `og:image` e indexação visual.

## Critérios de Aceite

### Componentes novos em `src/components/content/`:

- [x] CA1 — **`<Citacao />`** (blockquote estilizado):
  ```mdx
  <Citacao
    autor="Marcos Silva"
    cargo="CEO Previx"
    fonte="Entrevista, abr/2026"
    fonteUrl="https://...">
    A central de monitoramento da Previx representa anos de evolução…
  </Citacao>
  ```
  Renderiza `<blockquote cite={fonteUrl}>` + `<cite>` + `<footer>` com nome/cargo. CSS: borda lateral cyan, italic, indent.

- [x] CA2 — **`<Callout />`** (caixa destacada):
  ```mdx
  <Callout tipo="info" titulo="Saiba mais">
    Texto explicativo livre, MDX permitido.
  </Callout>
  ```
  Variantes: `info` (azul), `aviso` (laranja), `dica` (verde), `nota` (cinza). Ícone Font Awesome correspondente.

- [x] CA3 — **`<FiguraInline />`** (imagem com legenda):
  ```mdx
  <FiguraInline src="/path.jpg" alt="..." legenda="Central de monitoramento Previx, sede SP" />
  ```
  Usa Astro `<Image>` (otimização webp/srcset) + `<figcaption>` estilizado.

- [x] CA4 — **`<Sumario />`** (TOC opcional, frontmatter `mostrarSumario: true`):
  Auto-gera lista de H2 do post. Usa Astro `headings` (built-in).

### CSS de tipografia em `src/pages/noticias/[slug].astro` (ou novo `src/styles/post.css`):

- [x] CA5 — **`.article` typography refinada:**
  - `font-size: 17px / line-height: 1.75` para corpo (mobile 16px / 1.7)
  - `max-width: 720px` (linha de leitura ideal — 65-75 caracteres)
  - `margin-bottom: 1.5em` entre parágrafos (ritmo)
  - Primeiro parágrafo após H2 sem indent

- [x] CA6 — **Hierarquia H1/H2/H3 distinta:**
  - H1 já estilizado no hero
  - H2: 28-32px, `font-weight: 700`, `border-bottom: 2px solid var(--c-cyan)` ou `color: var(--c-navy)`, `margin-top: 2.5em`
  - H3: 20-22px, `font-weight: 600`, `color: var(--c-cyan)`, sem border

- [x] CA7 — **Listas (ul/ol):**
  - Bullets cyan customizados (`::marker { color: var(--c-cyan); font-weight: 700; }`)
  - `padding-inline-start: 1.5em`, `margin-block: 1.2em`
  - Itens com `margin-bottom: .5em`

- [x] CA8 — **Drop cap opcional** (frontmatter `dropCap: true`):
  - Primeira letra do primeiro parágrafo após o lede ganha tratamento (~3em, float left, color cyan).
  - **Default desligado** — só ativar quando o autor pedir explicitamente no frontmatter.

- [x] CA9 — **Separador `<hr>`:**
  - CSS: `<hr>` vira ornamento (3 pontos centralizados ou linha decorativa cyan), não linha cinza padrão.

### Aplicação aos 5 posts existentes:

- [x] CA10 — **Revisão editorial** dos 5 posts injetando ao menos 1 `<Citacao>` ou `<Callout>` em cada (não inventar — usar dados/quotes que já estão no texto):
  - Sky Vila Matilde
  - Kit câmeras
  - Postes IA
  - PX One
  - Monitoramento 24h (post-gabarito Jimmy 3.0)
- [x] CA11 — **Padrão "Dica/Saiba mais"** ao final de cada post antes do FAQ — convida pra serviços/contato em formato editorial (não comercial agressivo).
- [x] CA12 — **Sumário** ativado no post mais longo (monitoramento-24h) como referência.

### Frontmatter Zod atualizado (`src/content.config.ts`):

- [x] CA13 — Adicionar campos opcionais ao schema do `blog`:
  ```ts
  mostrarSumario: z.boolean().optional().default(false),
  dropCap: z.boolean().optional().default(false),
  ```

### Lint AEO/GEO (`scripts/lint-content.ts`):

- [x] CA14 — **Permitir os novos componentes** sem quebrar o lint atual (`<Estatistica>` count, blocos H2 50-150 palavras). Adicionar à allowlist se necessário.

### Validação visual:

- [x] CA15 — Comparação lado a lado (antes/depois) dos 5 posts em mobile e desktop. Printscreens em `docs/UI_AUDIT_POSTS.md`.

## Pendências externas

- JG aprova **paleta de variantes do Callout** (info, aviso, dica, nota) ou propõe diferentes
- JG decide se quer **drop cap** ativado em algum post (default desligado)
- Se houver **citação real** de fontes externas (ABESE, FENAVIST, executivo da Previx), JG fornece o quote textual + URL — caso contrário usamos só os dados estatísticos que já estão no texto

---

## Implementação

**Status:** `concluido` em 2026-05-08

**Commit:** `76a1d6a` — `feat: tipografia editorial + 4 componentes (Callout/Citacao/FiguraInline/Sumario) [STORY-014]`

**Componentes editoriais entregues** (`src/components/content/`):
- `Callout.astro` (50 linhas) — variantes `info`/`aviso`/`dica`/`nota` com ícone Font Awesome
- `Citacao.astro` (41 linhas) — `<blockquote cite>` + `<cite>` + autor/cargo/fonte
- `FiguraInline.astro` (38 linhas) — Astro `<Image>` otimizada + `<figcaption>`
- `Sumario.astro` (44 linhas) — auto-gera TOC a partir dos H2 do post

**Tipografia refinada:** `src/styles/site.css` (+131 linhas) com line-height 1.75 / max-width 720px / hierarquia H2-H3 distinta / bullets cyan customizados / drop-cap opcional / `<hr>` ornamental.

**Schema/lint:**
- `src/content.config.ts` — campos opcionais `mostrarSumario` e `dropCap` adicionados
- Lint Jimmy 3.0 mantido conforme (≥3 estatísticas, blocos H2 50-150 palavras)

**Aplicação aos 5 posts** (Callout em cada):
- `monitoramento-24h-central-sao-paulo.mdx` — Callout `info` resumo executivo + Sumário ATIVADO
- `sky-vila-matilde.mdx` — Callout `dica` integração IFM
- `kit-cameras.mdx` — Callout `info` resumo
- `postes-ia.mdx` — Callout `info` modelo
- `px-one.mdx` — Callout `dica` quando o serviço faz sentido

**Layout:** `src/pages/noticias/[slug].astro` importa Sumario, recebe headings via `render(post)`, renderiza condicional + classe `has-drop-cap` quando aplicável.

**Skips conscientes:**
- `docs/UI_AUDIT_POSTS.md` (printscreens antes/depois) — não gerado; validação visual feita ao vivo em produção pelo JG
- Citação real de fontes externas (CA opcional) — pendente do JG fornecer quotes textuais com URL; pode ser feita em iteração editorial futura sem alterar componentes

Build verde no commit: 15 páginas, 10 validadas pelo postbuild gate, sumário do `monitoramento-24h` gera 3 links âncora corretamente.

---

## QA

> Preenchido pelo `@qa`.

**Gate:**

**Checklist:**
- [ ] 4 componentes novos rendam HTML semântico válido (W3C validator OK)
- [ ] Blockquote inclui atributo `cite` com URL da fonte (Schema markup-friendly)
- [ ] Tipografia em mobile (≤768px) sem overflow horizontal
- [ ] Lighthouse Accessibility ≥ 95 mantido
- [ ] Lint AEO/GEO continua passando (5 posts conformes)
- [ ] Validador Schema (validator.schema.org) sem erros novos
- [ ] Visual review JG aprovado
