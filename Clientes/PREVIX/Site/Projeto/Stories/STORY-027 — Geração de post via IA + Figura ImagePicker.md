---
id: STORY-027
titulo: "Geração de post via IA (Claude Sonnet 4.6 OpenRouter) + ImagePicker no atalho '+ Figura'"
fase: 6
modulo: "Admin/Editor"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-14
atualizado: 2026-05-14
---

# STORY-027 — Geração de post via IA + ImagePicker no atalho "+ Figura"

## Contexto

JG estava cansando de preencher manualmente os 18 campos de um post no PostEditor (título, slug, lede 40-60 palavras, 3-5 conclusões, ≥3 estatísticas com fonte+URL, 4-8 FAQs, corpo MDX com componentes editoriais, etc). Com 5+ posts/mês previstos, fricção alta. Pediu:

1. **Botão "✨ Gerar com IA"** que abre modal pedindo tema + briefing + categoria, e a IA preenche **todos** os campos como rascunho conforme Jimmy 3.0. JG revisa, edita, salva.
2. **ImagePicker no "+ Figura"** da toolbar do MDX: hoje insere `<FiguraInline src="" alt="" legenda="" />` literal e JG preenche manualmente. Quer abrir a biblioteca, escolher imagem, e ter `src + alt` preenchidos automaticamente.

JG fechou as decisões: provider **Claude Sonnet 4.6 via OpenRouter** (já tem conta), botão **dentro do PostEditor** (não wizard separado).

## Critérios de Aceite

- [x] CA1 — Edge Function `generate-post` (Deno) com:
  - Validação JWT + role (`admin-previx | admin-site | editor-blog`)
  - Body Zod-equivalent: `tema (5-200), briefing? (max 2000), categoria, schema_tipo?`
  - Carrega contexto (estatísticas distinct dos 5 posts publicados + últimos 80 assets) via service-role
  - Prompt sistema instrui IA a usar APENAS material das listas — alinhado com Triviaiox Article IV (No Invention)
  - Chama OpenRouter `anthropic/claude-sonnet-4.6` com `response_format=json_object`, `max_tokens=16000`, `temperature=0.7`
  - Sanity-check: campos obrigatórios, slug regex, imagem da lista
  - Anti-colisão de slug (append `-2`/`-3`/etc se já existir)
  - Status sempre `'rascunho'` (nunca publica direto)
  - Audit log em `site.audit_log` (tipo `post_generated`, dados: tema/briefing/tokens)
  - JSON parser tolerante a markdown wrapper `\`\`\`json...\`\`\``
- [x] CA2 — `GerarPostModal.tsx` (React): form tema/briefing/categoria/schemaTipo + loading state + erro display + cancelar/gerar
- [x] CA3 — Botão "✨ Gerar com IA" no header do PostEditor (só visível em `/novo`, não em `/:id/editar`)
- [x] CA4 — `handleGenerated(draft)` popula state inteiro do PostEditor + scroll top + status='rascunho'
- [x] CA5 — Atalho "+ Figura" passa a abrir `ImagePickerDialog` em vez de inserir tag literal vazia. Ao escolher imagem, insere `<FiguraInline src="<URL>" alt="<alt do asset>" legenda="" />` com src+alt preenchidos
- [x] CA6 — `ImagePickerDialog` exportado do `ImagePicker.tsx` (era função interna). `onPicked` recebe `(url, asset)` — backwards-compatible (calls existentes ignoram 2º parâmetro)
- [x] CA7 — Secret `OPENROUTER_API_KEY` configurado no Supabase via `supabase secrets set`

## Notas Técnicas

- **Por que OpenRouter** em vez de Anthropic direto: JG mantém budget centralizado em uma conta só (já paga vários modelos via OpenRouter). Headers `HTTP-Referer` e `X-Title` setados pra rastreabilidade.
- **No Invention enforcement**: lint Jimmy 3.0 do `validate-post` continua bloqueando publicação se IA inventar (sem fonte+URL válida). Defesa em 2 camadas: prompt + lint.
- **Custo estimado**: $0.05-0.15 por geração (max_tokens 16k). Audit log captura `tokens` pra acompanhar.
- **Rate limit OpenRouter** tratado: 429 → mensagem amigável "Aguarde 1 min".

## Pendências externas

Nenhuma. JG configurou OPENROUTER_API_KEY no Supabase.

---

## Implementação

**Status:** `concluido` em 2026-05-14

**Commit:** `73f8cfa` — `feat(admin): geração de post via IA + ImagePicker no atalho Figura`

**Arquivos novos:**
- `supabase/functions/generate-post/index.ts` (Edge Function — ~280 linhas)
- `supabase/functions/generate-post/deno.json`
- `src/admin/components/GerarPostModal.tsx` (~140 linhas)

**Arquivos modificados:**
- `src/admin/components/ImagePicker.tsx` — exporta `ImagePickerDialog`, `onPicked` recebe asset
- `src/admin/pages/posts/PostEditor.tsx` — botão IA + handleGenerated + figuraPickerOpen + ImagePickerDialog mount

**E2E validado em produção (2026-05-14):**
- Tema: "Parceria Grupo Previx + Click & Pronto: minimercados autônomos 24h sem custo de implantação"
- Briefing: contexto detalhado (público alvo síndicos/RH, posicionamento como extensão de Multisserviços)
- Status `200` em **56s**
- Draft: 49 palavras lede / 5 conclusões / 3 estatísticas (todas das listas: ABRAFAC IFM 9.3%, FBSP R$ 171bi, ABESE 64%) / 8 FAQs / 3 H2 perguntas / 3 `<Estatistica/>` / 3 `<Callout>`
- `validate-post`: ok=true, **0 erros, 0 avisos** (Jimmy 3.0 100% conforme)
- INSERT em `site.posts` 201 created (id `50c8520b...`)

---

## QA

**Gate:** validado em produção 2026-05-14.

**Checklist:**
- [x] Edge Function deployada e responde 401 sem JWT (gateway válido)
- [x] Modal abre, valida tema mínimo 5 chars, mostra loading
- [x] Geração real consome ~$0.10 e produz draft Jimmy 3.0 conforme
- [x] PostEditor preenche todos campos do form com draft retornado
- [x] "+ Figura" abre ImagePickerDialog
- [x] Tag inserida tem src + alt preenchidos
- [x] Build CI verde (run #25885477059)
