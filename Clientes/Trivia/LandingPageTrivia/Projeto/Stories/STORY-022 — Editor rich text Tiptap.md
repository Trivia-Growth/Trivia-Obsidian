---
id: STORY-022
titulo: Landing Page Builder — Editor rich text com Tiptap (negrito, itálico, listas, link)
status: concluido
data_conclusao: 2026-04-27
modulo: Campanhas / Admin / Editor
tipo: enhancement
---

## Contexto

O campo de texto do bloco `text` usava textarea + Markdown com tabs EDITAR/PREVIEW. Lucas pediu edição mais visual com negrito e itálico. Esta story substituiu pelo editor WYSIWYG Tiptap.

## O que foi feito

### 1. Componente `RichTextEditor`
- `src/components/RichTextEditor.tsx` com Tiptap + StarterKit + Link extension
- Toolbar com: negrito, itálico, lista com marcadores, lista numerada, link, linha divisória
- Botões de toolbar com estado ativo (fundo petrol quando ativo)
- `onMouseDown` + `e.preventDefault()` para não perder foco no editor ao clicar toolbar

### 2. Integração no editor de blocos
- Substituiu textarea + tabs EDITAR/PREVIEW no campo `subtext` do bloco `text`
- Output em HTML armazenado em `content.subtext`

### 3. Compatibilidade retroativa
- Renderer público (`/campanha/$slug`) usa função `renderSubtext()`
- Se `subtext.trim().startsWith("<")` → renderiza como HTML (Tiptap output)
- Caso contrário → passa por `marked.parse()` (conteúdo Markdown legado)

### 4. Estilos
- `.tiptap-editor .ProseMirror` em `styles.css`: min-height 120px, focus sem outline, formatação de listas/links

## Decisão técnica
Toolbar fixa em vez de bubble menu flutuante — mais simples e previsível para o contexto de admin.

## Arquivos
- `src/components/RichTextEditor.tsx` (novo)
- `src/routes/admin/campanhas/$id.tsx`
- `src/routes/campanha/$slug.tsx` (função renderSubtext)
- `src/styles.css`
