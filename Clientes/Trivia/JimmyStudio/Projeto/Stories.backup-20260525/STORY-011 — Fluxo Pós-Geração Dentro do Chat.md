---
id: STORY-011
titulo: "Fluxo Pós-Geração Dentro do Chat"
fase: 3
modulo: "agencia"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-04-30
atualizado: 2026-04-30
---

# STORY-011 — Fluxo Pós-Geração Dentro do Chat

## Contexto

Após gerar o conteúdo, o chat navegava automaticamente para `/agencia/conteudo/:id`, quebrando a experiência conversacional. O usuário precisava sair do chat para revisar a copy e depois clicar para gerar imagens — tudo em telas separadas. O objetivo desta story é manter o usuário no chat do início ao fim.

## Critérios de Aceite

- [x] CA1 — Após geração, `ContentPreview` aparece inline no chat (sem navegação)
- [x] CA2 — URL permanece em `/agencia/assistente` durante todo o fluxo
- [x] CA3 — Botão "Criar imagens" aparece no chat após a copy
- [x] CA4 — Clicar "Criar imagens" renderiza `ImageBriefForm` ("Brief Visual") no chat
- [x] CA5 — Após salvar brief, `ImageGenerationPanel` aparece no chat
- [x] CA6 — Input de texto continua disponível em `review_copy` para ajustes na copy
- [x] CA7 — Teste E2E golden path passando com 10 STEPs (2 passed, 54s)

## Restrições

- `ConteudoDetalhe` em `/agencia/conteudo/:id` mantida para acesso via links diretos/biblioteca
- Fluxo manual em `/agencia/gerar` não alterado

---

## Implementação

**Status:** `concluido`

**Branch/PR:** main (commit direto)

**Arquivos modificados:**
- `src/features/content-creator-chat/types/index.ts`
  - Steps `image_brief` e `image_generation` adicionados ao tipo `Step`
- `src/features/content-creator-chat/hooks/useContentCreationAgent.ts`
  - Callbacks `startImageBrief()` e `onImageBriefComplete()` adicionados
  - `navigate` removido do useEffect de geração
- `src/features/content-creator-chat/components/ContentCreationChat.tsx`
  - `useNavigate` e `ArrowRight` removidos
  - `ContentPreview`, `ImageBriefForm`, `ImageGenerationPanel` importados
  - Bloco `review_copy`: renderiza `ContentPreview` + botão "Criar imagens"
  - Bloco `image_brief`: renderiza `ImageBriefForm`
  - Bloco `image_generation`: renderiza `ImageGenerationPanel`
- `tests/assistente-golden-path.spec.ts`
  - STEPs 8-10 atualizados para o novo fluxo inline
  - Timeout elevado para 240s

---

## QA

**Gate:** PASS

**Checklist:**
- [x] TypeScript sem erros
- [x] Build OK
- [x] 10 STEPs do E2E passando (2 passed, 54s)
- [x] URL permanece em /agencia/assistente durante todo o fluxo (verificado no STEP 8)
- [x] ContentPreview renderiza inline após geração
- [x] ImageBriefForm ("Brief Visual") abre no chat após clicar "Criar imagens"
- [x] Verificado em produção: jimmystudio.com.br/agencia/assistente

**Notas:** Concluído em 2026-04-30. Geração real de conteúdo validada: 3 fontes Perplexity recebidas, carrossel instagram gerado com slides/caption/hashtags.
