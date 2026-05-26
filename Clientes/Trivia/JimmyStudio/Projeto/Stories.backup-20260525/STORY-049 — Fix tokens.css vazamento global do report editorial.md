---
id: STORY-049
titulo: "Fix: tokens.css do report editorial vazava tema dark globalmente quebrando modo claro"
fase: 3
modulo: monthly-report
status: concluido
prioridade: alta
origem: claude
agente_responsavel: ""
criado: 2026-05-06
atualizado: 2026-05-06
---

# STORY-049 — Fix: tokens.css vazava tema dark globalmente

## Contexto

JG reportou bug visual no modo claro do app: sidebar e dashboard com fundo
escuro/lavanda e cores estranhas. Modo escuro funcionava normalmente.

Investigação inicial olhou as 7 stories do JimmyChat (042-048) achando que
algo da sessão tinha quebrado, mas:

- `git diff 41d87ee8^..HEAD --stat` confirmou que **nenhum arquivo de
  CSS/tema/sidebar foi tocado** nas stories 042-048
- `Layout.tsx` ganhou só 4 linhas (1 import + 1 chamada de `useJimmyKeybinding`)
- `src/index.css` última mudança foi em 2026-02-05 (anterior à sessão)

JG lembrou: "foi após a story de implementar a nova página de relatórios
do instagram+linkedin". Pista certa.

## Causa-raiz

Commit anterior `2ab1ebc4 refactor(monthly-report): substitui componente
por variante editorial premium` adicionou:

- `src/features/monthly-report/editorial/styles/tokens.css`
- `src/features/monthly-report/editorial/styles/editorial.css`

E importou ambos globalmente em `src/main.tsx`:

```ts
import './features/monthly-report/editorial/styles/tokens.css'
import './features/monthly-report/editorial/styles/editorial.css'
```

`editorial.css` está corretamente escopado em `.variant-a .va-*` (141 hits),
**mas `tokens.css` aplicava em seletores globais**:

```css
* { box-sizing: border-box; }

html, body {
  background: var(--bg-deep);   /* hsl(220 30% 4%) — dark */
  color: var(--ink-2);          /* hsl(44 25% 88%) — creme */
  font-family: var(--font-sans);
  ...
}

::selection { background: var(--brand-cyan); color: var(--bg-deep); }
a { color: var(--brand-cyan-soft); }
a:hover { color: var(--brand-cyan); }
```

Resultado: sobrescrevia o `<html>`/`<body>` background+color do app com
tokens dark do report editorial. No **modo claro**, isso causava conflito
visível (fundo escuro/lavanda + cores estranhas). No **modo escuro**, o
conflito era invisível porque os tokens dark batiam com o esperado.

## Fix

Commit `d7425824` — escopar todas as regras dentro de `.variant-a`
(wrapper que já existe em `MonthlyReportEditorial.tsx:55`):

```diff
- * { box-sizing: border-box; }
+ .variant-a, .variant-a * { box-sizing: border-box; }

- html, body {
+ .variant-a {
    background: var(--bg-deep);
    color: var(--ink-2);
    ...
  }

- ::selection { ... }
+ .variant-a ::selection { ... }

- a { color: var(--brand-cyan-soft); }
+ .variant-a a { color: var(--brand-cyan-soft); }
```

`:root { ... }` com as CSS vars (`--bg-deep`, `--ink-2`, etc) permanece
intacto — são definidas mas só consumidas dentro de `.variant-a`. Neutras
fora desse escopo.

## Validação

- ✅ `npx tsc --noEmit` exit 0
- ✅ `npm run build` exit 0 em 15.50s
- ✅ Confirmado por JG: tema light voltou ao normal após hard reload
- ✅ Modo escuro permanece OK (não regrediu)
- ✅ Página de relatório editorial preserva visual dark (escopo `.variant-a`)

## Lições

1. **CSS imports globais devem ser escopados por padrão.** Qualquer arquivo
   importado em `main.tsx` que use seletores como `html`, `body`, `*`, `a`,
   `::selection` afeta o app inteiro.
2. **Modo escuro pode mascarar bugs de tema light.** Sempre testar ambos
   antes de mergear feature visual.
3. **Bisseção por commit é mais rápido que ler código.** A pista de JG
   ("foi após a story do relatório") apontou direto pra `2ab1ebc4`, e o
   `git diff --stat` revelou os 1062 linhas de `editorial.css` + 113 de
   `tokens.css` que valeram inspeção.

## Out of scope

- Corrigir leak de fontes (Fraunces/Geist) carregadas em `index.html` —
  não causam bug visual, só latência de carregamento. Pode virar story de
  perf futura: lazy-load fontes só na rota `/agencia/relatorios/...`.

## Referências

- Commit do fix: `d7425824 fix(monthly-report): tokens.css vazava reset+tema dark globalmente`
- Commit que introduziu: `2ab1ebc4 refactor(monthly-report): substitui componente por variante editorial premium`
- Arquivo: `src/features/monthly-report/editorial/styles/tokens.css`
