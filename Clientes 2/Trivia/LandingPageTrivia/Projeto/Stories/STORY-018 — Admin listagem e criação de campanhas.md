---
id: STORY-018
titulo: Landing Page Builder — Admin listagem + criar campanha (/admin/campanhas)
status: concluido
data_conclusao: 2026-04-26
modulo: Campanhas / Admin
tipo: feature
---

## Contexto

Com a fundação da STORY-017 pronta, esta story criou a tela de gerenciamento em `/admin/campanhas`. Cards de campanha, modal de criação com seleção de template, publicar/despublicar por card, e link "Editar blocos →" para o editor.

## O que foi feito

### 1. Rota `/admin/campanhas` + layout
- `src/routes/admin/campanhas.tsx` — layout route com `<Outlet />`
- `src/routes/admin/campanhas/index.tsx` — tela de listagem com cards
- Chips de status (publicado/rascunho), template, slug `/campanha/{slug}`
- Filtros por status (Todas / Publicado / Rascunho)

### 2. Modal "Nova campanha"
- Campos: título (auto-gera slug), slug (editável, sanitizado), template
- Templates pré-populam blocos no banco via `upsert-blocks`
- 4 templates: Lançamento, Evento, Lead Simples, Custom (vazio)

### 3. Sidebar
- Link "Campanhas" adicionado em `src/routes/admin.tsx` com ícone `LayoutTemplate`

### 4. Fix de roteamento
- Problema: `campanhas.tsx` + `campanhas/` causava conflito de layout
- Solução: index route pattern (`campanhas/index.tsx` + thin layout `campanhas.tsx`)

## Arquivos
- `src/routes/admin/campanhas.tsx`
- `src/routes/admin/campanhas/index.tsx`
- `src/routes/admin.tsx`
