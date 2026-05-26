---
id: STORY-037
titulo: "Exportação PDF do relatório mensal (client-side)"
fase: 2
modulo: monthly-report
status: concluido
prioridade: alta
origem: claude
agente_responsavel: claude-code
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-037 — Exportação PDF do relatório mensal (client-side)

## Contexto

Cliente final quer baixar o relatório como PDF (anexar em email, imprimir, arquivar). Briefing explícito: 100% grátis, sem dependência de serviço externo. Stories 035 (preview) e 036 (link público) renderizam o relatório em HTML; falta a versão "imprimível".

## Spec de Referência

- `architecture.md` — ADR-015
- `PROJECT_REQUIREMENTS.md` — seção 5b (exportação PDF)

## Critérios de Aceite

- [x] CA1 — `@react-pdf/renderer` v4.5+ instalado, lazy-loaded (~530kb gz só ao clicar "Baixar PDF")
- [x] CA2 — Componentes PDF paralelos aos da web em `src/features/monthly-report/pdf/` (Cover, ExecutiveSummary, InstagramSection, LinkedInSection, BestPostingTimes, Footer)
- [x] CA3 — 3 charts SVG manuais (line, donut, heatmap) usando primitives `<Path>`, `<Rect>`, `<Circle>` — qualidade vetorial, sem libs extras
- [x] CA4 — `MonthlyReportPDF.tsx` Document raiz com paginação automática e rodapé fixo numerado
- [x] CA5 — Hook `useDownloadReportPDF` com states `idle | generating | done | error`
- [x] CA6 — Botão "Baixar PDF" no preview interno e no link público
- [x] CA7 — Filename: `relatorio-{slug-marca}-{YYYY-MM}.pdf` (slug normalizado para ascii)
- [x] CA8 — Identidade visual Jimmy Studio em `pdf/styles.ts` (cores neonPurple, electricCyan, navy)
- [x] CA9 — Build passa com chunk separado (lazy-load funciona)
- [x] CA10 — PDF gera em <10s para brand média
- [x] CA11 — **Fix de produção:** CSP do Netlify permite `data:` (WASM) e `fonts.gstatic.com`
- [x] CA12 — **Fix de produção:** fonts.ts usa Helvetica built-in (sem dependência de Google Fonts CDN)

---

## Implementação

**Status:** `concluido`

**Commits:**
- `8d22913a` (entrega inicial)
- `42899c35` (fix CSP — encontrado pelo E2E em produção)
- `db17e763` (fix fonts: Helvetica built-in em vez de Inter via CDN)

**Arquivos alterados:**
- `package.json`, `package-lock.json` (adiciona `@react-pdf/renderer`)
- `src/features/monthly-report/pdf/styles.ts` (novo; depois ajustado em db17e763 para Helvetica)
- `src/features/monthly-report/pdf/fonts.ts` (novo; depois virou no-op em db17e763)
- `src/features/monthly-report/pdf/MonthlyReportPDF.tsx` (novo)
- `src/features/monthly-report/pdf/PdfCover.tsx`
- `src/features/monthly-report/pdf/PdfExecutiveSummary.tsx`
- `src/features/monthly-report/pdf/PdfInstagramSection.tsx`
- `src/features/monthly-report/pdf/PdfLinkedInSection.tsx`
- `src/features/monthly-report/pdf/PdfBestPostingTimes.tsx`
- `src/features/monthly-report/pdf/PdfFooter.tsx`
- `src/features/monthly-report/pdf/charts/PdfLineChart.tsx`
- `src/features/monthly-report/pdf/charts/PdfDonutChart.tsx`
- `src/features/monthly-report/pdf/charts/PdfHeatmap.tsx`
- `src/features/monthly-report/hooks/useDownloadReportPDF.tsx`
- `src/pages/agencia/MonthlyReportPreview.tsx` (botão Baixar PDF)
- `src/pages/PublicMonthlyReport.tsx` (botão Baixar PDF)
- `netlify.toml` (CSP — fix em commit 42899c35)
- `architecture.md` (ADR-015)

**Notas de implementação:**
- 19 arquivos no commit inicial · +1479 linhas
- Inter via Google Fonts CDN não funcionou: URLs `v12/...` retornam 404. Trocado por Helvetica built-in (zero fetch externo, zero CSP issue, geração em <10s)
- Trade-off aceito: PDF não tem fonte exata da identidade Jimmy Studio (Satoshi/Inter). Quando virar requisito, self-hosting do woff2 resolve.

---

## QA

**Gate:** `PASS`

**Checklist:**
- [x] Build passa (`react-pdf.browser` em chunk separado de 532kb gz)
- [x] tsc + lint sem novos erros
- [x] PDF gerado em E2E real: 25.9kb, 7.7s, filename correto
- [x] CSP fix validado: console errors de "violates Content Security Policy" desapareceram após deploy
- [x] Helvetica built-in: zero fetches externos durante geração

**Notas:**
- **Bug crítico encontrado pelo E2E**: sem o fix de CSP, qualquer cliente real teria visto botão "Baixar PDF" voltar pro estado normal sem nada acontecer (catch silencioso do hook). Sem o E2E, esse bug teria chegado ao cliente.
- Warning não-bloqueante observado durante geração: `Node of type SVG can't wrap between pages and it's bigger than available page height`. Provavelmente o heatmap quando IG+LinkedIn ambos têm dados. PDF gera mesmo assim, mas componente fica numa única página em vez de fluir. Tech debt registrado.

---

## Notas e Decisões

- **Geração no main thread**: brand grande pode bloquear UI por 1-3s. Com loading state fica aceitável. Se virar problema, mover pra Web Worker.
- **Componentes PDF duplicados** dos componentes web. Manutenção em 2 lugares quando layout muda. Aceito porque os engines são incompatíveis e `_shared/monthly-report-aggregator.ts` já garante paridade dos **dados**.
- **Não aplicado para email anexo** (Story 038 segue a decisão de mandar só link no email; cliente baixa PDF de dentro do link).
