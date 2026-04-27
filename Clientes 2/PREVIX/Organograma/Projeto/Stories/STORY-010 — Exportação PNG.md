---
id: STORY-010
titulo: "Exportação PNG — captura do canvas xyflow"
fase: 2
modulo: "exportacao"
status: pronto
prioridade: media
agente_responsavel: "@sm"
criado: 2026-04-27
atualizado: 2026-04-27
---

# STORY-010 — Exportação PNG

## Contexto

> Complementa a STORY-009 (PDF institucional). O PNG é o **screenshot instantâneo** do organograma no estado em que o usuário o está vendo (zoom, filtros e busca aplicados). Use case típico: "quero colar no slide" ou "quero mandar no WhatsApp pro time" sem o overhead do PDF de 3 páginas.
>
> Diferente do PDF (layout paper-friendly redesenhado), o PNG captura literalmente o canvas xyflow renderizado.

## Spec de Referência

- [[../../Briefing Inicial]] → "Exportação"
- `PROJECT_REQUIREMENTS.md` → Fase 2, "Exportação" (item PNG)
- STORY-007 → render xyflow já está em pé (`OrganogramaView.tsx`)
- STORY-009 → padrão de botão de exportação já estabelecido (`PDFDownloadButton.tsx`)

## Decisão arquitetural (ADR-012 — proposta)

**Escolhido: `html-to-image` capturando `.react-flow__viewport`** (não `html2canvas`, não método nativo do xyflow — não existe).

### Por que

| Caminho | Verdict |
|---------|---------|
| Método nativo do xyflow `toImage()` | ❌ Não existe na API pública v12; nota no Roadmap estava equivocada |
| `html2canvas` | ⚠️ Funciona mas tem problemas conhecidos com `transform: matrix3d` que o xyflow usa pra zoom/pan; renderização inconsistente |
| **`html-to-image` capturando `.react-flow__viewport`** | ✅ Padrão oficial documentado pelo xyflow (reactflow.dev/examples/misc/download-image), suporta SVG inline e transforms corretamente |
| Captura via Canvas API direto | ⚠️ Reimplementaria render do zero — desperdício |

**Trade-off aceito:** o PNG inclui tudo que está visível (busca destacada, filtros aplicados, zoom). É feature, não bug — é um "snapshot do estado atual". Para uma versão sempre-completa-sem-filtros, o usuário usa o PDF.

## Critérios de Aceite

### Geração

- [ ] **CA1 — `html-to-image`** instalado como dependência (~30 kB gzip).

- [ ] **CA2 — Função `exportarOrganogramaPNG(viewportEl)`** em `lib/png-utils.ts`:
  - Recebe o elemento DOM `.react-flow__viewport`
  - Chama `toPng(el, { cacheBust: true, pixelRatio: 2, backgroundColor: "#ffffff" })`
  - Retorna `Promise<string>` com data URL
  - Lança erro descritivo se viewport não encontrado

- [ ] **CA3 — Componente `<PNGDownloadButton />`** em `components/PNGDownloadButton.tsx`:
  - Localiza `.react-flow__viewport` via `document.querySelector` no momento do click
  - Chama `exportarOrganogramaPNG`
  - Cria `<a download>` e dispara click
  - `setTimeout(revoke, 5000)` no objectURL (mesmo padrão do PDFDownloadButton)
  - Toast `success`/`error` + estado `generating`

- [ ] **CA4 — Pixel ratio 2x** para retina-quality (resolução dobrada). Configurável via prop futura se necessário.

- [ ] **CA5 — Background branco explícito** (`#ffffff`) — o viewport do xyflow tem fundo transparente; sem isso o PNG sai com fundo preto/transparente.

### Integração UI

- [ ] **CA6 — Botão "Exportar PNG" em `/` (dashboard)** ao lado do "Exportar PDF". Captura visual do estado atual (com filtros/busca aplicados se houver).

- [ ] **CA7 — Botão "Exportar PNG" em `/p/$token` (público)** no header, ao lado do "Exportar PDF".

- [ ] **CA8 — Nome do arquivo:** `organograma-previx-YYYY-MM-DD.png`.

- [ ] **CA9 — Loading state:** botão mostra "Gerando..." durante captura.

- [ ] **CA10 — Disabled** quando `pessoas.length === 0` (mesma regra do PDF).

### Qualidade

- [ ] **CA11 — Resolução adequada:** PNG abre em ~2x as dimensões do viewport — texto legível em zoom 100%.

- [ ] **CA12 — Tamanho do arquivo:** < 1 MB para 25 pessoas em zoom default.

- [ ] **CA13 — Sem cortes:** captura inclui todos os nodes mesmo se zoom estiver reduzido — `getViewportForBounds(getNodesBounds(getNodes()))` é aplicado antes da captura para enquadrar tudo.

### Doc updates

- [ ] **CA14 — Documentação atualizada:**
  - `architecture.md`: ADR-012 fechado com decisão `html-to-image`
  - `Roadmap.md` (vault): "Exportação PNG" ✅
  - `PROJECT_REQUIREMENTS.md`: confirmar item PNG já listado

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** —

**Branch/PR:** —

**Arquivos esperados:**
- `src/features/exportacao/components/PNGDownloadButton.tsx` (botão wrapper)
- `src/features/exportacao/lib/png-utils.ts` (função `exportarOrganogramaPNG` + helper de fit-to-view)
- Atualizações em `OrganogramaPage.tsx` e `OrganogramaPublico.tsx` (montar o botão ao lado do PDF)
- Possível ajuste em `OrganogramaView.tsx` se precisar expor uma ref ao container — provavelmente não, querySelector já basta
- `architecture.md`, `Roadmap.md`

---

## QA

**Gate:** —

**Checklist:**
- [ ] CA1-CA14
- [ ] Build + typecheck + lint
- [ ] PNG interno e público funcionam — captura todos os nodes mesmo com zoom reduzido
- [ ] Filtros e busca aplicados aparecem no PNG (é feature)

---

## Notas e Decisões

- `2026-04-27` — Story refinada logo após merge da STORY-009. Decisão: usar `html-to-image` em vez do que o roadmap original sugeria (`xyflow.toImage()` que não existe). ADR-012 proposta.
- `2026-04-27` — Trade-off de "snapshot vs documento" formalizado: PNG é o estado visível atual, PDF é o documento institucional formatado. Os dois coexistem.
