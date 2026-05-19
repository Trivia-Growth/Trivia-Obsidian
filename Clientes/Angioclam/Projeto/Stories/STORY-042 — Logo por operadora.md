---
id: STORY-042
titulo: "Logo por operadora (cadastro + capa do relatório)"
fase: 4
modulo: "parameters/report"
status: concluido
prioridade: media
agente_responsavel: "claude"
criado: 2026-05-19
atualizado: 2026-05-19
---

# STORY-042 — Logo por operadora

## Contexto

JG pediu: subir a logo de cada operadora no cadastro e exibi-la no relatório.

## Decisão

Logo gravada como **data URI** em `operadoras.logo_url` (não URL externa):
o relatório é um HTML/PDF autocontido (download/impressão/offline) — imagem
embutida garante que a logo sempre aparece. Limite 250 KB.

## Critérios de Aceite

- [x] CA1 — Migration `operadoras.logo_url text`
- [x] CA2 — Cadastro com upload de logo (valida imagem, ≤250KB, preview)
- [x] CA3 — Definir/trocar logo das operadoras já existentes (miniatura na lista)
- [x] CA4 — Capa do relatório usa `<img>` da logo; sem logo → fallback texto
- [x] CA5 — Export PDF e prévia incluem a logo; números seguem dos KPIs
- [x] CA6 — 54 testes; build + lint; validado via API (RLS superadmin)

## Implementação

**Arquivos:** `migrations/20260519085927_operadora_logo.sql`,
`parameters/api/parameters.ts` (logo_url, updateOperadora),
`api/useParameters.ts` (useUpdateOperadora), `OperadorasPage.tsx` (upload),
`report/lib/buildHtml.ts` (param opLogo + .logo-img),
`report/api/useOperadoraLogo.ts`, `ReportHtmlPreview.tsx`, `ReportPage.tsx`.

## QA

**Gate:** `PASS` — commit `9ef02e9`, migration aplicada. API: superadmin
define/lê logo (revertida p/ não deixar logo de teste em produção; JG sobe as
reais pela tela `/operadoras`).

## Notas

- `2026-05-19` — Logo embutida (data URI) também garante fidelidade no
  Exportar PDF (impressão do HTML). RLS `operadoras_admin` já cobria o update.
