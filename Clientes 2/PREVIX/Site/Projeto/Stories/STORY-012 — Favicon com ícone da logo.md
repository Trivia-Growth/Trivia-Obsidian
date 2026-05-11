---
id: STORY-012
titulo: "Favicon com ícone da logo Previx"
fase: 5.5
modulo: "UI/Branding"
status: backlog
prioridade: media
agente_responsavel: ""
criado: 2026-05-08
atualizado: 2026-05-08
---

# STORY-012 — Favicon com ícone da logo Previx

## Contexto

Hoje o site usa um favicon genérico (`public/favicon.svg` + `public/favicon.ico`, ambos do scaffold Astro) — JG quer trocar pelo símbolo da logo Previx, mantendo coerência visual entre browser tab, bookmarks, PWA install icon e compartilhamentos.

A logo já está disponível no repo em `public/assets/logos/` (6 variantes PNG). O símbolo do Previx (a marca isolada, sem o nome) precisa ser extraído ou recriado em SVG para escalar bem em 16×16 / 32×32 / Apple touch icon (180×180).

## Critérios de Aceite

- [ ] CA1 — **Asset fonte** identificado:
  - Se já existe SVG do símbolo isolado no OneDrive da Trívia → usar
  - Se não existe → JG fornece o arquivo vetorial original (Adobe Illustrator/Figma) OU autorizo extrair do PNG via vetorização (perda mínima esperada — logo é geométrica)
- [ ] CA2 — **`public/favicon.svg`** atualizado com o símbolo Previx em SVG (preferencial — escalável e leve)
- [ ] CA3 — **`public/favicon.ico`** regenerado (multi-resolution: 16×16, 32×32, 48×48) a partir do SVG
- [ ] CA4 — **`public/apple-touch-icon.png`** (180×180) — para iOS home screen
- [ ] CA5 — **`public/icon-192.png` + `icon-512.png`** — para Android e PWA (web app manifest futuro)
- [ ] CA6 — **`<link>` tags atualizadas** no `BaseLayout.astro`:
  ```html
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  ```
- [ ] CA7 — **`og:image` e `twitter:image`** mantidos como hoje (são fotos do Previx, não favicon)
- [ ] CA8 — Validação visual: abrir produção em Chrome/Safari/Firefox e confirmar que o ícone aparece corretamente em todas as abas e em bookmarks

## Notas Técnicas

- Astro processa `public/` direto, sem build → trocar arquivo + push é suficiente
- Recomendação: símbolo Previx em **fundo transparente** para o `.svg`, mas considerar **fundo navy `#0A1F3C`** ou cyan `#00AEEF` para o ICO (porque favicons aparecem em barras claras E escuras)
- Não criar `manifest.json` nesta story — fica para uma futura story de PWA se for o caso

## Pendências externas para JG fornecer

1. **Arquivo vetorial do símbolo Previx isolado** (sem o texto "GRUPO PREVIX" do lado), ou autorização para extrair via vetorização do PNG
2. Preferência de fundo do ícone (transparente, navy ou cyan)

---

## Implementação

> Preenchido pelo `@dev` quando rodar.

**Status:** `backlog`

**Branch/PR:**

**Arquivos esperados:**
- `public/favicon.svg` (atualizado)
- `public/favicon.ico` (atualizado)
- `public/apple-touch-icon.png` (novo)
- `public/icon-192.png` (novo)
- `public/icon-512.png` (novo)
- `src/layouts/BaseLayout.astro` (atualizado — link tags)

---

## QA

> Preenchido pelo `@qa`.

**Gate:**

**Checklist:**
- [ ] Favicon aparece corretamente em Chrome, Safari, Firefox (desktop e mobile)
- [ ] Apple touch icon aparece ao "adicionar à tela inicial" no iOS
- [ ] Sem erros 404 no DevTools Network para os arquivos de ícone
- [ ] Build passa sem warnings
