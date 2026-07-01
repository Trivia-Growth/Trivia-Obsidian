---
name: sinergica-os-design
description: Use this skill to build and theme interfaces for Sinérgica OS (the internal multi-module dashboard of Sinérgica Manutenções) — production code or throwaway mocks/prototypes. Contains the product's UI patterns plus the official Sinérgica brand (navy + orange), tokens, logos and screen recreations.
user-invocable: true
---

Read `readme.md` first, then explore `styles.css` + `tokens/` (brand + `product.css`),
`components/`, `ui_kits/app/` (telas reais do produto), and `reference/` (fontes do
repositório `Trivia-Growth/Sinergica-OS`).

**Stack do produto:** React + Tailwind CSS v4 + lucide-react. Monorepo SDD/OS-layer.

**Sempre respeite:**
- Marca = navy `#202B59` (estados ativos: nav, abas, foco, avatar, brand tile) +
  laranja→âmbar `#EF7E25→#F7A600` (CTA, links de ação, destaque). O scaffold do
  repo usa emerald/blue genéricos — **troque pela marca** (ver "Mapa de migração").
- Neutros do produto = ramp frio slate; status (verde/âmbar/vermelho/azul) e
  prioridade GUT são **semânticos**, não mude.
- Cards `rounded-xl` + borda `#E4E8EE`, sem sombra em repouso. Lucide stroke 1.8.
- Símbolo Sinérgica (`assets/symbol-*.png`) no brand tile/login, nunca ícone genérico.
- Tipografia Poppins (UI) + Saira (mono/labels). Português, tom operacional direto.

If creating visual artifacts (mocks, protótipos), copy assets out and produce static
HTML (use Tailwind CDN + the brand `tailwind.config` from `ui_kits/app/index.html`).
If working in the real codebase, apply the brand tokens to `apps/web`.

If invoked without guidance, ask what screen/module to build, then act as an expert
designer outputting HTML artifacts or production-ready React/Tailwind.
