---
id: STORY-029
titulo: "Hero — controle de posição vertical da imagem + cor de título/lede editáveis"
fase: 6
modulo: "Admin/Conteúdo"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-14
atualizado: 2026-05-14
---

# STORY-029 — Hero com posição vertical + cor de texto editáveis

## Contexto

JG identificou 2 problemas na edição dos heros após STORY-026:

1. **Posição da imagem**: ao trocar a foto da hero por uma com enquadramento diferente, a imagem aparecia cortada errado (`background-position: center` hardcoded no CSS). Sem controle no admin.
2. **Cor do texto**: o lede da Home (parágrafo "Soluções integradas para empresas...") ficou com **baixíssima visibilidade** depois da troca da foto — texto branco fixo em região clara da foto. Print enviado pelo JG mostra a frase praticamente invisível.

JG escolheu: **slider 0-100% com presets Topo/Centro/Base** pra posição + **color picker livre** (hex) pra título/eyebrow e lede separadamente.

## Critérios de Aceite

- [x] CA1 — Tipo `Bloco` hero estendido com 3 campos opcionais novos: `imagemPosicao? (0-100, default 50)`, `corTitulo? (hex, default #ffffff)`, `corLede? (hex, default #ffffff)`. Backwards-compatible.
- [x] CA2 — `FormHero` ganha 3 controles após o ImagePicker:
  - Slider `<input type="range" min=0 max=100>` com label dinâmica "Posição vertical: X%" + 3 botões `[Topo · Centro · Base]` que setam 0/50/100
  - Color picker título (`<input type="color">`) com input texto sincronizado + botão `↺` (reset pra undefined → fallback #ffffff)
  - Color picker lede idem
- [x] CA3 — Os 6 `.astro` (index, servicos, contato, noticias/index, faq, privacidade) consomem novos campos:
  - `style={\`background-image:url(...); background-position: 50% ${heroPos}%;\`}` no `.bg`
  - `style={\`color:${heroCorTit}\`}` no `<h1>` e `<div class="eyebrow">`
  - `style={\`color:${heroCorLede}\`}` no `<p class="lede">`
- [x] CA4 — CSS atual `.hero h1 { color: #fff }` é **sobrescrito por inline style** (cascade vence). Sem mudar `site.css`.
- [x] CA5 — Tipo `Bloco` duplicado entre `institucional.ts:57` e `PaginasAdminPage.tsx:9` atualizado nos 2 lugares no mesmo commit.

## Notas Técnicas

- **Backward-compat**: campo `imagemPosicao` opcional → fallback `?? 50` (mantém comportamento atual `center`). Cores opcionais → fallback `?? '#ffffff'` (mantém branco).
- **Sem preview live**: admin não tem preview do hero em tempo real (preview do post existe via STORY-028, hero não). JG salva → trigger-rebuild → vê em prod ~3min depois. Aceito como first iteration.
- **Solução pra visibilidade da Home**: JG pode trocar `corLede` pra hex escuro (ex: `#1A1A1A`) ou outra cor que contraste com a foto.

## Pendências externas

Nenhuma.

---

## Implementação

**Status:** `concluido` em 2026-05-14

**Commit:** `ec4564e` (junto com STORY-030: unificação Orçamento+Contato + 2 depoimentos novos)

**Arquivos modificados:**
- `src/lib/data/institucional.ts`
- `src/admin/pages/conteudo/PaginasAdminPage.tsx` (tipo Bloco + FormHero)
- `src/pages/index.astro`
- `src/pages/servicos.astro`
- `src/pages/contato.astro`
- `src/pages/noticias/index.astro`
- `src/pages/faq.astro`
- `src/pages/privacidade.astro`

---

## QA

**Gate:** validado em produção 2026-05-14.

**Checklist:**
- [x] Slider de 0-100% renderiza no FormHero com presets Topo/Centro/Base
- [x] 2 color pickers (título + lede) com botão reset
- [x] Build local + build CI verde
- [x] HTML em prod inclui `background-position: 50% Y%` e `color:#hex` inline (default 50% / #ffffff = visual idêntico ao pré-mudança)
- [x] Sem chunk JS facade fantasma (lição da STORY anterior)
