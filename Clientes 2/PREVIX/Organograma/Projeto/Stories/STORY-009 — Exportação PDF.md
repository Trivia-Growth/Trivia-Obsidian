---
id: STORY-009
titulo: "Exportação PDF — 3 páginas (institucional + organograma + contatos)"
fase: 2
modulo: "exportacao"
status: pronto
prioridade: alta
agente_responsavel: "@sm"
criado: 2026-04-23
atualizado: 2026-04-23
---

# STORY-009 — Exportação PDF

## Contexto

> Substitui o ciclo "designer entrega PDF estático" pelo ciclo "Previx exporta PDF a qualquer momento". O PDF gerado tem **3 páginas obrigatórias** conforme briefing:
> 1. **Texto institucional** (cabeçalho com nome, descrição da empresa, data de emissão)
> 2. **Organograma** (renderização hierárquica dos colaboradores ativos com cores por departamento)
> 3. **Contatos** (lista de pessoas com cargo + departamento — sem PII no fluxo público; com PII quando exportado por usuário autenticado)
>
> Acessível tanto pelo dashboard interno (admin/editor/visualizador) quanto pela página pública `/p/$token` (cliente final).

## Spec de Referência

- [[../../Briefing Inicial]] → "Exportação"
- `architecture.md` → ADR-002 (engine de PDF — esta story fecha)
- `PROJECT_REQUIREMENTS.md` → Fase 2, "Exportação"
- STORY-008 → tokens_publicos + Edge Function pública (já entrega dados sem PII)

## Decisão arquitetural fechada (ADR-002)

**Escolhido: `@react-pdf/renderer` client-side** (não puppeteer server-side).

### Por que mudou da preferência original (puppeteer)

| Caminho | Verdict |
|---------|---------|
| Puppeteer + Edge Function Supabase | ❌ Inviável: Edge Functions limitadas a 50 MB de bundle, Chromium headless não cabe |
| Puppeteer + Cloud Run/Render dedicado | ⚠️ Funciona mas adiciona infra fora do padrão Trivia (Supabase + Netlify) |
| html2canvas + jsPDF | ⚠️ Funciona mas perde qualidade tipográfica (vira raster) e SVG complexo do organograma quebra |
| **`@react-pdf/renderer` client-side** | ✅ Vector PDF nativo, fontes embedded, layout declarativo em JSX, sem infra extra |

**Trade-off aceito:** o PDF não captura literalmente a tela do organograma renderizada com xyflow. Em vez disso, redesenhamos o organograma usando primitivas do `@react-pdf/renderer` (boxes + lines + text). Resultado: layout otimizado para A4 (paper-friendly) em vez de cópia da tela.

## Critérios de Aceite

### Geração

- [ ] **CA1 — `@react-pdf/renderer`** instalado como dependência (~120 kB gzip; aceitável).

- [ ] **CA2 — Componente `<OrganogramaPDF />`** declarando 3 páginas A4:
  - **Página 1:** cabeçalho "Organograma PREVIX" + bloco institucional fixo + data de emissão
  - **Página 2:** título "Estrutura organizacional" + organograma desenhado em hierarquia top-down (níveis empilhados, cards com cor do depto + nome + cargo, linhas conectando managers)
  - **Página 3:** título "Contatos" + tabela/lista com nome, cargo, departamento. Inclui e-mail/telefone **somente** se contexto for autenticado.

- [ ] **CA3 — Tipografia:** Inter via Google Fonts importada (vem do `@react-pdf/renderer`); fallback Helvetica.

- [ ] **CA4 — Cores institucionais:** paleta Previx aplicada (depto badges com `cor_hex`, accent #1AB6E8 nos títulos).

- [ ] **CA5 — Contexto autenticado vs público:**
  - `<OrganogramaPDF context="interno" pessoasComPII={...} />` — página 3 lista nome + cargo + e-mail + telefone
  - `<OrganogramaPDF context="publico" pessoasSemPII={...} />` — página 3 lista nome + cargo + departamento, sem e-mail/telefone

### Integração UI

- [ ] **CA6 — Botão "Exportar PDF" em `/dashboard`** (página interna) gera PDF com PII. Usa `<PDFDownloadLink />` do react-pdf — gera client-side e dispara download.

- [ ] **CA7 — Botão "Exportar PDF" em `/p/$token`** (público) gera PDF sem PII. Reaproveita os dados que a Edge Function já retorna (já vêm sem e-mail/telefone — ADR-006).

- [ ] **CA8 — Nome do arquivo:** `organograma-previx-YYYY-MM-DD.pdf`.

- [ ] **CA9 — Loading state:** botão mostra "Gerando..." durante render.

### Qualidade

- [ ] **CA10 — Vector PDF:** abre no Adobe Acrobat / Preview Mac com texto selecionável (não bitmap).

- [ ] **CA11 — Layout responsivo a 25-100 pessoas:** se hierarquia for muito larga, página 2 quebra automaticamente em colunas/sub-páginas. Testar com 15 pessoas (seed) e simular 50.

- [ ] **CA12 — Tamanho do arquivo:** < 2 MB para 25 pessoas (sem fotos embedded em vetor; fotos viram links externos para reduzir bundle do PDF).

### Segurança

- [ ] **CA13 — Confirmar não vazamento de PII no contexto público:** baixar PDF gerado em `/p/$token` e verificar que página 3 NÃO contém `email` nem `telefone`.

### Doc updates

- [ ] **CA14 — Documentação atualizada:**
  - `architecture.md`: ADR-002 fechado com a decisão final (`@react-pdf/renderer`)
  - `Roadmap.md` (vault): "Exportação PDF" ✅
  - `specs/technical/API_SPECIFICATION.md`: nota que esta feature é client-only (sem nova EF)

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** —

**Branch/PR:** —

**Arquivos esperados:**
- `src/features/exportacao/components/OrganogramaPDF.tsx` (declaração do documento)
- `src/features/exportacao/components/PDFDownloadButton.tsx` (botão wrapper de `<PDFDownloadLink />`)
- `src/features/exportacao/lib/pdf-utils.ts` (helpers — agrupar por nível, formatar data)
- Atualizações em `OrganogramaPage.tsx` e `OrganogramaPublico.tsx` (substituir botão placeholder)
- `architecture.md`, `Roadmap.md`

---

## QA

**Gate:** —

**Checklist:**
- [ ] CA1-CA14
- [ ] Build + typecheck + lint + audit + vitest
- [ ] PDF interno tem PII; PDF público não tem
- [ ] Layout legível em A4 retrato

---

## Notas e Decisões

- `2026-04-23` — Story refinada após STORY-008. ADR-002 fechado escolhendo `@react-pdf/renderer` client-side — divergência consciente da preferência original (puppeteer server) por inviabilidade técnica em Supabase Edge Functions.
- `2026-04-23` — Página 2 do PDF **não copia** a renderização xyflow. É um redesign hierárquico paper-friendly (cards empilhados com linhas). UX maior fidelidade ao briefing institucional.
