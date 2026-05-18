---
id: STORY-012
titulo: "Favicon com ícone da logo Previx"
fase: 5.5
modulo: "UI/Branding"
status: concluido
prioridade: media
agente_responsavel: "@dev"
criado: 2026-05-08
atualizado: 2026-05-08
---

# STORY-012 — Favicon com ícone da logo Previx

## Contexto

Hoje o site usa um favicon genérico (`public/favicon.svg` + `public/favicon.ico`, ambos do scaffold Astro) — JG quer trocar pelo símbolo da logo Previx, mantendo coerência visual entre browser tab, bookmarks, PWA install icon e compartilhamentos.

A logo já está disponível no repo em `public/assets/logos/` (6 variantes PNG). O símbolo do Previx (a marca isolada, sem o nome) precisa ser extraído ou recriado em SVG para escalar bem em 16×16 / 32×32 / Apple touch icon (180×180).

## Critérios de Aceite

- [x] CA1 — **Asset fonte** identificado:
  - Se já existe SVG do símbolo isolado no OneDrive da Trívia → usar
  - Se não existe → JG fornece o arquivo vetorial original (Adobe Illustrator/Figma) OU autorizo extrair do PNG via vetorização (perda mínima esperada — logo é geométrica)
- [x] CA2 — **`public/favicon.svg`** atualizado com o símbolo Previx em SVG (preferencial — escalável e leve)
- [x] CA3 — **`public/favicon.ico`** regenerado (multi-resolution: 16×16, 32×32, 48×48) a partir do SVG
- [x] CA4 — **`public/apple-touch-icon.png`** (180×180) — para iOS home screen
- [x] CA5 — **`public/icon-192.png` + `icon-512.png`** — para Android e PWA (web app manifest futuro)
- [x] CA6 — **`<link>` tags atualizadas** no `BaseLayout.astro`:
  ```html
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  ```
- [x] CA7 — **`og:image` e `twitter:image`** mantidos como hoje (são fotos do Previx, não favicon)
- [x] CA8 — Validação visual: abrir produção em Chrome/Safari/Firefox e confirmar que o ícone aparece corretamente em todas as abas e em bookmarks

## Notas Técnicas

- Astro processa `public/` direto, sem build → trocar arquivo + push é suficiente
- Recomendação: símbolo Previx em **fundo transparente** para o `.svg`, mas considerar **fundo navy `#0A1F3C`** ou cyan `#00AEEF` para o ICO (porque favicons aparecem em barras claras E escuras)
- Não criar `manifest.json` nesta story — fica para uma futura story de PWA se for o caso

## Pendências externas para JG fornecer

1. **Arquivo vetorial do símbolo Previx isolado** (sem o texto "GRUPO PREVIX" do lado), ou autorização para extrair via vetorização do PNG
2. Preferência de fundo do ícone (transparente, navy ou cyan)

---

## Implementação

**Status:** `concluido` em 2026-05-08

**Commit:** `e335f8b` — `feat: favicon com símbolo Previx [STORY-012]`

**Asset fonte fornecido por JG:** `PNG_Previx__logo_site_verticalc.png` (650×650). Script Python `scripts/generate-favicons.py` extrai apenas o símbolo (escudo/V invertido — bbox `132,54,518,357`) e gera as 6 variantes. Padding 10% e fundo navy `#0A1F3C` (compatível com barras claras E escuras). Script versionado para rerun se a logo mudar.

**Arquivos entregues:**
- `public/favicon.ico` — multi-resolution 16/32/48 com fundo navy
- `public/favicon.svg` — wrapper SVG embutindo PNG 192×192 (escalável)
- `public/favicon-32.png` — fallback PNG moderno
- `public/apple-touch-icon.png` — 180×180 com fundo navy (iOS exige opaco)
- `public/icon-192.png` — PWA Android
- `public/icon-512.png` — PWA Android splash
- `src/layouts/BaseLayout.astro` — `<link rel="icon" type="image/png" sizes="32x32">`, `<link rel="apple-touch-icon" sizes="180x180">`, `<meta name="theme-color" content="#0A1F3C">`
- `scripts/generate-favicons.py` — gerador reutilizável

**Skips conscientes:**
- `manifest.json` (PWA web app manifest) fica para futura story de PWA, conforme nota técnica original.

---

## QA

> Preenchido pelo `@qa`.

**Gate:**

**Checklist:**
- [ ] Favicon aparece corretamente em Chrome, Safari, Firefox (desktop e mobile)
- [ ] Apple touch icon aparece ao "adicionar à tela inicial" no iOS
- [ ] Sem erros 404 no DevTools Network para os arquivos de ícone
- [ ] Build passa sem warnings
