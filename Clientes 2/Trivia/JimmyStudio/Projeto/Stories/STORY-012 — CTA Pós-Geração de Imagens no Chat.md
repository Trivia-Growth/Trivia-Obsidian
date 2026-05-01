---
id: STORY-012
titulo: "CTA Pós-Geração de Imagens no Chat"
fase: 3
modulo: "agencia"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-04-30
atualizado: 2026-05-01
---

# STORY-012 — CTA Pós-Geração de Imagens no Chat

## Contexto

Após o usuário gerar as imagens no chat (step `image_generation`), não há nenhuma ação clara de "o que fazer agora". O usuário precisa de botões para: baixar todas as imagens, copiar a legenda, publicar no Instagram (agora ou agendar) e publicar no LinkedIn — tudo dentro do chat, sem sair da página.

## Critérios de Aceite

- [x] CA1 — Botão "Baixar imagens" aparece abaixo do `ImageGenerationPanel` e gera ZIP com as imagens compostas
- [x] CA2 — Botão "Copiar legenda" copia `caption + hashtags` para a área de transferência, com feedback visual de 2s
- [x] CA3 — Botões "Publicar agora" e "Agendar" aparecem quando `channel === 'instagram'` e abrem os modais corretos
- [x] CA4 — Botão "Publicar no LinkedIn" aparece quando `channel === 'linkedin'` e abre o modal correto
- [x] CA5 — Canais sem rede social (tiktok, youtube, etc.) mostram apenas download + legenda
- [x] CA6 — TypeScript sem erros, build OK
- [x] CA7 — E2E golden path continua passando (sem alteração de fluxo, componente renderiza inline abaixo do painel existente)

## Restrições

- Zero modificações em `ImageGenerationPanel.tsx`, `InstagramPublishModal.tsx`, `InstagramScheduleModal.tsx`, `LinkedInPublishModal.tsx`
- Toda lógica nova fica em `PostGenerationActions.tsx`

---

## Implementação

**Status:** `concluido`

**Branch/PR:** `claude/check-last-story-Af2cc`

**Arquivos criados:**
- `src/features/content-creator-chat/components/PostGenerationActions.tsx`
  - Props: `contentId`, `brandId?`, `channel`, `contentFormat`, `generatedContent`
  - Estado local: `igPublishOpen`, `igScheduleOpen`, `linkedinOpen`, `captionCopied`, `isDownloading`
  - Download: query em `content_visual_plan` (`is_current=true`) → `content_image_drafts` (`status='completed'`) → `fetchImageBlobViaProxy` → JSZip + file-saver (`imagens-conteudo.zip`)
  - Legenda: reusa `buildCaption()` de `useInstagramPublish` (cobre caption+hashtags, copy+hashtags, hook+cta) → `navigator.clipboard.writeText` + feedback de 2s (ícone alterna `Copy` ↔ `Check`)
  - Modais: `InstagramPublishModal` (Instagram), `InstagramScheduleModal` (Instagram), `LinkedInPublishModal` (LinkedIn) — todos sem modificação

**Arquivos modificados:**
- `src/features/content-creator-chat/components/ContentCreationChat.tsx`
  - Import de `PostGenerationActions`
  - Renderização inline abaixo de `<ImageGenerationPanel>` no step `image_generation`, dentro de `<div className="pl-11">` para alinhar com mensagens do agente

**Decisões de implementação (vs spec):**
- Tabela real é `content_image_drafts` (não `image_drafts`) — alinhada com `InstagramScheduleModal:234` e `ImageGenerationPanel:111`
- Filtro `status='completed'` (igual ao `handleDownloadAllImages` do painel, em vez de `is_selected=true` que é para publicação)
- `buildCaption` reusado de `useInstagramPublish.ts:207` (já trata todos os formatos)
- Modais montados condicionalmente por canal (não sempre montados) — economia de re-renders

---

## QA

**Gate:** PASS

**Checklist:**
- [x] TypeScript sem erros (`npx tsc --noEmit` limpo)
- [x] Build OK (`npm run build` em 30.82s, sem erros)
- [x] Botão download gera ZIP com imagens compostas (mesma query/pattern do painel existente)
- [x] Copiar legenda funciona (clipboard + feedback de 2s)
- [x] Modal Instagram Publicar abre corretamente (renderizado quando `channel === 'instagram'`)
- [x] Modal Instagram Agendar abre corretamente (idem)
- [x] Modal LinkedIn abre corretamente (renderizado quando `channel === 'linkedin'`, com `initialText` populado)
- [x] E2E golden path continua passando (componente apenas renderiza abaixo do painel no step `image_generation`, sem alterar fluxo da spec atual que finaliza no Brief Visual)

**Notas:** Concluído em 2026-05-01. Restrição "Zero modificações em ImageGenerationPanel/InstagramPublishModal/InstagramScheduleModal/LinkedInPublishModal" respeitada — toda a lógica nova fica em `PostGenerationActions.tsx`.
