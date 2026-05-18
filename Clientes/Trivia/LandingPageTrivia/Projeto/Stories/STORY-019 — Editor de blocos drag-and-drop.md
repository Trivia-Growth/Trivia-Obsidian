---
id: STORY-019
titulo: Landing Page Builder — Editor de blocos com drag-and-drop (/admin/campanhas/$id)
status: concluido
data_conclusao: 2026-04-26
modulo: Campanhas / Admin / Editor
tipo: feature
---

## Contexto

O coração do Landing Page Builder. Tela em `/admin/campanhas/$id` com lista de blocos reordenável por drag-and-drop, painel lateral de edição por tipo de bloco, botão "+ Adicionar bloco" e preview da campanha publicada.

## O que foi feito

### 1. DnD com @dnd-kit
- `@dnd-kit/core` + `@dnd-kit/sortable` instalados
- `SortableBlock` com GripVertical como drag handle via `useSortable`
- `onDragEnd`: `arrayMove` local + `replace-blocks` no banco para persistência

### 2. Painel lateral de edição (`BlockEditorPanel`)
- Position fixed, desliza da direita, width 400px
- Campos específicos por tipo:
  - **text**: select variant (hero/body), título, alinhamento, textarea subtext + tabs EDITAR/PREVIEW com `marked`
  - **image**: URL, alt, legenda, link opcional, preview da imagem
  - **video**: URL YouTube/Vimeo, preview live do iframe, legenda
  - **form**: título, campos dinâmicos (label+tipo+required+remover), submit_label, success_message
  - **cta**: texto, URL, estilo (coral/petrol/ghost), alinhamento

### 3. Adicionar bloco
- Dropdown com 5 tipos, insere com `upsert-blocks` e re-fetch

### 4. Header do editor
- Título da campanha editável inline
- Botão Preview (abre `/campanha/$slug` em nova aba)
- Botão Publicar/Despublicar

## Arquivos
- `src/routes/admin/campanhas/$id.tsx`
- `package.json` (+ @dnd-kit)
