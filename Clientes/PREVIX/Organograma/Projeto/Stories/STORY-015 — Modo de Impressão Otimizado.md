---
id: STORY-015
titulo: "Modo de impressão otimizado — @media print + botão Imprimir"
fase: 3
modulo: "exportacao"
status: pronto
prioridade: media
agente_responsavel: "@sm"
criado: 2026-04-27
atualizado: 2026-04-27
---

# STORY-015 — Modo de Impressão Otimizado

## Contexto

> Terceira modalidade de saída do organograma, complementando PDF (STORY-009) e PNG (STORY-010). Use case: usuário ocasional aciona Ctrl+P direto no app sem baixar arquivo, e o browser imprime/salva PDF com layout limpo.
>
> Diferente do PDF (3 páginas institucionais formatadas) e do PNG (raster snapshot), o "modo impressão" usa **renderização vetorial nativa do browser** — texto selecionável, alta qualidade, sem assets externos. É o caminho mais simples pra um usuário "preciso disso impresso pra reunião".

## Spec de Referência

- [[STORY-009 — Exportação PDF]] — modo formal (3 páginas)
- [[STORY-010 — Exportação PNG]] — modo raster snapshot
- `PROJECT_REQUIREMENTS.md` → Fase 3, "Modo de impressão otimizado"

## Decisões arquiteturais

### CSS @media print global, não dependente de JS

`window.print()` dispara o evento de print do browser. Toda a transformação de layout vai em `@media print` no CSS global. Sem React state condicional. Beneficia também o uso direto de Ctrl+P (sem clicar no botão).

### Tailwind `print:` prefix onde der, CSS bruto pros internals do xyflow

Componentes nossos: `print:hidden`, `print:h-screen`, etc. via Tailwind v4. Internals do xyflow (`.react-flow__controls`, `.react-flow__minimap`, `.react-flow__attribution`) são DOM gerado por lib externa — não dá pra adicionar classe nossa. Vai em `@media print` cru no `styles.css`.

### Página A3 landscape

Organograma é tipicamente wider que tall. A3 (29.7 x 42 cm) landscape dá mais espaço horizontal pra ramificações. `@page { size: A3 landscape }` instrui o browser a sugerir esse formato. Usuário ainda pode trocar no diálogo de print do browser.

### Captura o estado visível atual (mesmo princípio do PNG)

Filtros e busca aplicados aparecem no print. Zoom/pan também (mas com canvas expandido pra full-page, geralmente o usuário vai dar fitView antes). Não tentamos "imprimir tudo independente do zoom" — overhead maior, feature menor.

## Critérios de Aceite

### CSS

- [ ] **CA1 — Bloco `@media print` no `src/styles.css`:**
  - `@page { size: A3 landscape; margin: 1cm; }`
  - Esconde `.react-flow__controls`, `.react-flow__minimap`, `.react-flow__attribution`, `.react-flow__panel`
  - Background do body branco (`background: white !important;`) pra anular oklch dark mode
  - `body { color: black !important; }` pra forçar texto preto na impressão (alguns browsers ignoram dark mode no print mas vale garantir)

- [ ] **CA2 — Tailwind `print:` prefixes:**
  - Header de `_authenticated.tsx`: `print:hidden`
  - Botões de export, filtros, busca em `OrganogramaPage`: `print:hidden`
  - Header de `OrganogramaPublico`: `print:hidden` (ou manter só o título? decidir)
  - Container do canvas xyflow: `print:h-screen print:rounded-none print:border-0`

### Componente

- [ ] **CA3 — `<PrintButton />`** em `src/features/exportacao/components/PrintButton.tsx`. Chama `window.print()`. `disabled` quando `pessoas.length === 0`.

- [ ] **CA4 — Wire em `OrganogramaPage`** ao lado de PNG/PDF.

- [ ] **CA5 — Wire em `OrganogramaPublico`** ao lado de PNG/PDF.

### Qualidade

- [ ] **CA6 — Build + typecheck + lint** limpos.

- [ ] **CA7 — Validação visual:** abrir `/` no browser, fitView no canvas, Ctrl+P → preview do print mostra apenas o canvas centrado, sem header/botões/Controls/MiniMap. Texto selecionável.

### Doc updates

- [ ] **CA8:** `Roadmap.md` (vault): "Modo de impressão otimizado" ✅

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** —

**Branch/PR:** —

**Arquivos esperados:**
- `src/styles.css` (adicionar bloco @media print no final)
- `src/features/exportacao/components/PrintButton.tsx` (novo)
- `src/features/organograma/components/OrganogramaPage.tsx` (wire + classes print:)
- `src/features/organograma/components/OrganogramaView.tsx` (classes print: no container)
- `src/features/publico/components/OrganogramaPublico.tsx` (wire + classes print:)
- `src/routes/_authenticated.tsx` (header com print:hidden)

---

## QA

**Gate:** —

**Checklist:**
- [ ] CA1-CA8
- [ ] Ctrl+P em `/` → preview limpo
- [ ] Click no botão "Imprimir" → mesmo preview
- [ ] Texto do canvas é selecionável no PDF gerado pelo print
- [ ] Funciona em Safari + Chrome + Firefox

---

## Notas

- `2026-04-27` — Story refinada após STORY-012 (primeira da Fase 3 mergeada). Decisão de UX: três modalidades de saída coexistem (PDF formal · PNG raster · Print vetorial-nativo). Cada uma cobre um use case distinto, sem sobreposição forte.
