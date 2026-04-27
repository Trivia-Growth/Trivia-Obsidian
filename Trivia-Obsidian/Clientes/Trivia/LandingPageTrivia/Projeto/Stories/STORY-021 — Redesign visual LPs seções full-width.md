---
id: STORY-021
titulo: Landing Page Builder — Redesign visual (seções full-width + fundos por bloco)
status: concluido
data_conclusao: 2026-04-27
modulo: Campanhas / Visual
tipo: enhancement
---

## Contexto

As landing pages estavam com os blocos "empilhados" em um container estreito, sem separação visual. Lucas pediu que ficasse mais bonito. Esta story transformou cada bloco em uma seção full-width com cor de fundo configurável.

## O que foi feito

### 1. Novo sistema CSS (`.lp-section`)
- Cada bloco vira `<section class="lp-section lp-section--{bg}">` full-width
- `lp-section-inner` com max-width 800px e `margin: 0 auto`
- Variantes: `white` (papel), `bone` (areia), `petrol` (escuro), `coral` (destaque)
- Overrides automáticos de cor de texto para fundos escuros (petrol/coral → papel)
- Hero: `font-size: clamp(48px, 7vw, 88px)` com letter-spacing `-0.025em`

### 2. Formulário como card flutuante
- `lp-block-form`: max-width 480px, card com sombra e border-radius 10px
- Visual limpo, centralizado na seção

### 3. Vídeo com bordas arredondadas
- `lp-video-wrapper`: border-radius 10px + sombra

### 4. Seletor de cor de fundo no editor admin
- 4 swatches coloridos no topo do painel `BlockEditorPanel` (válido para todos os tipos)
- Seleção ativa destacada com borda coral
- Valor salvo em `content.background` no jsonb do bloco

### 5. Renderer público atualizado
- `CampanhaPage` itera blocos e envolve cada um em `<section>`
- Detecta bloco hero para aplicar `.lp-section--hero` com padding maior

## Arquivos
- `src/styles.css`
- `src/routes/campanha/$slug.tsx`
- `src/routes/admin/campanhas/$id.tsx`
