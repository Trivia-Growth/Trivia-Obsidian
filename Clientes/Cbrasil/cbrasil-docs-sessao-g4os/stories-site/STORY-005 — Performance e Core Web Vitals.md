---
id: STORY-005
titulo: "Performance — imagens, fontes, lazy load, Lighthouse 95+"
fase: 2
modulo: "infra"
status: backlog
prioridade: media
agente_responsavel: "@dev"
criado: 2026-05-22
atualizado: 2026-05-22
---

# STORY-005 — Performance e Core Web Vitals

## Contexto

O logo original tem ~1MB. Fontes carregam do Google Fonts (ja com `display=swap`). Scripts precisam ser `defer`. Meta: Lighthouse 95+ em todas as categorias.

## Spec de Referencia

- Plano: `PLANO-EXECUCAO.md` item 5

## Criterios de Aceite

- [ ] CA1 — Logo em formato `.webp` com fallback PNG via `<picture>`
- [ ] CA2 — `<link rel="preload" as="font">` para os 2 pesos mais usados de Source Serif e Manrope
- [ ] CA3 — `font-display: swap` confirmado em todas as fontes
- [ ] CA4 — Imagens fora do viewport com `loading="lazy"`
- [ ] CA5 — Scripts com `defer` (main.js e briefing.js)
- [ ] CA6 — Lighthouse Performance >= 95
- [ ] CA7 — Lighthouse Accessibility >= 95
- [ ] CA8 — Lighthouse Best Practices >= 95
- [ ] CA9 — Lighthouse SEO >= 95

---

## Implementacao

**Status:** `backlog`

**Branch/PR:**

**Arquivos alterados:**
-

**Notas de implementacao:**

---

## QA

**Gate:**

**Checklist:**
- [ ] Criterios de aceite validados
- [ ] Lighthouse report salvo
- [ ] WebP carrega em Chrome/Safari/Firefox
- [ ] Fallback PNG funciona em navegadores sem WebP
- [ ] Sem layout shift (CLS < 0.1)

**Notas:**

---

## Notas e Decisoes

- Critical CSS inline e opcional (ganho marginal para site estatico)
- Priorizar LCP: hero image/logo deve carregar rapido
