---
id: STORY-032
titulo: "Geração de imagem de capa via IA (Gemini) com logo Previx + contexto da notícia"
fase: 7
modulo: "Admin/Blog"
status: backlog
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-18
atualizado: 2026-05-18
---

# STORY-032 — Geração de imagem de capa via IA (Gemini) com logo Previx

## Contexto

Hoje a imagem de capa (`imagem_capa`) é escolhida manualmente da biblioteca de assets — fotos genéricas de segurança. JG quer gerar capas sob medida para cada artigo usando IA generativa de imagem, incorporando:

1. **Logo do Grupo Previx** — marca d'água/badge visível na capa
2. **Contexto da notícia** — título, categoria e tom visual adequado ao tema

O modelo escolhido é **Gemini** (via fonte `googleai` já ativa no workspace) para geração de imagem com o Imagen/Gemini image generation. A capa gerada é salva no Supabase Storage e o campo `imagem_capa` do post é atualizado automaticamente.

## Critérios de Aceite

### Backend (Edge Function)

- [ ] CA1 — Edge Function `generate-cover-image` (Deno) com:
  - Validação JWT + role (`admin-previx | admin-site | editor-blog`)
  - Body: `{ post_id, titulo, categoria, estilo?: string }`
  - Monta prompt de geração com instruções de estilo: imagem editorial profissional, tema segurança/facilities/limpeza conforme categoria, paleta Previx (azul escuro #1a2b4a, dourado #c5a355), composição com espaço para texto
  - Inclui instrução explícita para posicionar badge/logotipo Previx (canto inferior direito, opacidade 80%)
  - Chama API Gemini imagen (modelo `imagen-3.0-generate-002` ou equivalente disponível)
  - Recebe imagem (base64/bytes), redimensiona para 1200x630px (padrão OG image)
  - Upload para Supabase Storage bucket `site-assets` em `/capas-geradas/{slug}-{timestamp}.webp`
  - Retorna URL pública da imagem gerada
  - Audit log em `site.audit_log` (tipo `cover_generated`, dados: post_id, prompt resumido)

### Composição visual da capa

- [ ] CA2 — Logo Previx aplicada via compositing server-side (Sharp ou canvas no Deno):
  - Logo horizontal branca (PNG com transparência) já existe em `/assets/logos/logo-previx-branca.png`
  - Posição: canto inferior direito, padding 24px, tamanho ~120px largura
  - Opacidade 85% para não competir com a imagem principal
- [ ] CA3 — Estilo visual default por categoria:
  - "Segurança Patrimonial" / "Segurança Eletrônica" → tons escuros, arquitetura corporativa, equipamentos
  - "Facilities" / "Limpeza" → ambiente limpo, bem iluminado, escritório moderno
  - "Portaria" → fachada, lobby, controle de acesso
  - Override possível via campo `estilo` livre no request

### Frontend (Admin)

- [ ] CA4 — Botão "🖼️ Gerar capa com IA" no PostEditor, ao lado do campo `imagem_capa` (aparece quando post tem título preenchido).
- [ ] CA5 — Modal de preview: mostra imagem gerada antes de confirmar. Opções: "Usar esta", "Gerar outra" (re-gera com variação de seed), "Cancelar".
- [ ] CA6 — Ao confirmar, atualiza `imagem_capa` no form state + salva no DB se post já existe.
- [ ] CA7 — Loading state claro (geração pode levar 10-30s): skeleton + mensagem "Gerando capa personalizada..."

### Qualidade e constraints

- [ ] CA8 — Imagem gerada em formato WebP, qualidade 85%, resolução 1200x630px (aspect ratio OG/social share).
- [ ] CA9 — Rate limit: máx 5 gerações por post (evitar spam). Controlado via count no audit_log.
- [ ] CA10 — Fallback: se geração falhar (timeout, API indisponível), exibir erro amigável e manter imagem atual.

## Notas Técnicas

- **Por que Gemini**: JG já usa a source `googleai` no workspace. Imagen 3 produz imagens de alta qualidade com controle de estilo e suporta instruções de composição (incluindo posicionamento de elementos gráficos).
- **Logo overlay server-side**: mais confiável que pedir à IA para "desenhar" o logo (modelos de imagem distorcem logotipos). A logo é aplicada via compositing após geração.
- **1200x630**: padrão OpenGraph. Serve para hero do post, compartilhamento social, e card no Google Discover.
- **Storage path**: `/capas-geradas/` separado de assets manuais para fácil identificação e eventual cleanup.
- **Custo estimado**: ~$0.02-0.04 por geração (Imagen 3 pricing). Com limit de 5/post, máx ~$0.20/post.

## Dependências

- STORY-027 (Geração de post via IA) — padrão de Edge Function + modal + audit log reutilizável.
- STORY-022 (Gestor de assets / Supabase Storage) — bucket e upload pattern já implementados.
- Source `googleai` — já ativa no workspace.

## Estimativa

- Backend: ~4h (Edge Function + compositing + storage)
- Frontend: ~3h (botão + modal preview + integração)
- QA: ~1h (testar categorias, logo overlay, fallback)
