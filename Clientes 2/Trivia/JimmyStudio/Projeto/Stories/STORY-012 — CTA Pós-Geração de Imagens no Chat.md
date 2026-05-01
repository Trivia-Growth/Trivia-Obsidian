---
id: STORY-012
titulo: "CTA Pós-Geração de Imagens no Chat"
fase: 3
modulo: "agencia"
status: backlog
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-04-30
atualizado: 2026-04-30
---

# STORY-012 — CTA Pós-Geração de Imagens no Chat

## Contexto

Após o usuário gerar as imagens no chat (step `image_generation`), não há nenhuma ação clara de "o que fazer agora". O usuário precisa de botões para: baixar todas as imagens, copiar a legenda, publicar no Instagram (agora ou agendar) e publicar no LinkedIn — tudo dentro do chat, sem sair da página.

## Critérios de Aceite

- [ ] CA1 — Botão "Baixar imagens" aparece abaixo do `ImageGenerationPanel` e gera ZIP com as imagens compostas
- [ ] CA2 — Botão "Copiar legenda" copia `caption + hashtags` para a área de transferência, com feedback visual de 2s
- [ ] CA3 — Botões "Publicar agora" e "Agendar" aparecem quando `channel === 'instagram'` e abrem os modais corretos
- [ ] CA4 — Botão "Publicar no LinkedIn" aparece quando `channel === 'linkedin'` e abre o modal correto
- [ ] CA5 — Canais sem rede social (tiktok, youtube, etc.) mostram apenas download + legenda
- [ ] CA6 — TypeScript sem erros, build OK
- [ ] CA7 — E2E golden path continua passando

## Restrições

- Zero modificações em `ImageGenerationPanel.tsx`, `InstagramPublishModal.tsx`, `InstagramScheduleModal.tsx`, `LinkedInPublishModal.tsx`
- Toda lógica nova fica em `PostGenerationActions.tsx`

---

## Implementação

**Status:** `backlog`

**Arquivos a criar:**
- `src/features/content-creator-chat/components/PostGenerationActions.tsx`
  - Props: `contentId`, `brandId`, `channel`, `contentFormat`, `generatedContent`
  - Estado local: `igPublishOpen`, `igScheduleOpen`, `linkedinOpen`, `captionCopied`
  - Download: busca `image_drafts` (status `completed`) da Supabase → JSZip + file-saver
  - Legenda: `caption + hashtags` via `navigator.clipboard.writeText`
  - Modais: `InstagramPublishModal`, `InstagramScheduleModal`, `LinkedInPublishModal` (já existentes)

**Arquivos a modificar:**
- `src/features/content-creator-chat/components/ContentCreationChat.tsx`
  - Adicionar bloco `PostGenerationActions` abaixo do `ImageGenerationPanel` quando `step === 'image_generation'`

**Props verificados:**
- `InstagramPublishModal`: `contentFormat` (string), `slotId?`, `brandId?`, `generatedContent`
- `InstagramScheduleModal`: `contentFormat` (string), `slotId?`, `brandId?`, `generatedContent`
- `LinkedInPublishModal`: `format` (string), `initialText?`, `contentId?`, `slotId?`, `brandId?`
- `fetchImageBlobViaProxy` confirmado em `src/lib/imageDownload.ts`
- `jszip` e `file-saver` já no `package.json`

---

## QA

**Gate:** PENDING

**Checklist:**
- [ ] TypeScript sem erros
- [ ] Build OK
- [ ] Botão download gera ZIP com imagens compostas
- [ ] Copiar legenda funciona (clipboard + feedback)
- [ ] Modal Instagram Publicar abre corretamente
- [ ] Modal Instagram Agendar abre corretamente
- [ ] Modal LinkedIn abre corretamente
- [ ] E2E golden path continua passando
