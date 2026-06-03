---
tags: [heziom, marketing, lp, biblia120, ipp, ecommerce]
status: no ar (homologação)
criado: 2026-06-03
url: https://lp-biblia120.netlify.app
repo: heziom/lp-biblia120
---

# Bíblia 120 Anos (IPP) — Projeto da Landing Page

> LP de pré-venda da Bíblia Sagrada comemorativa dos **120 anos da Igreja Presbiteriana de Pinheiros** (Editora Heziom). Layout desenvolvido no Claude Design e integrado à infra de tracking/conversão no padrão da [[LP Coleções 2026 (Plano Bomba) — Configuração|LP Plano Bomba]].

## Status

| | |
|---|---|
| **LP no ar** | https://lp-biblia120.netlify.app (time heziom, auto-deploy via GitHub) |
| **Repositório** | `github.com/heziom/lp-biblia120` · clone local em `~/Documents/Obsidian/Github/lp-biblia120` |
| **Produto** | Bíblia 120 anos · Letra Grande · couro preto e marrom |
| **Oferta** | **R$ 69,90 com cupom IPP120** (de R$ 159,90, −56%) |
| **Lançamento** | 08/07/2026 (aniversário da IPP, fundada em 08/07/1906) |
| **ISBN** | Preta 978-65-5265-134-1 · Marrom 978-65-5265-133-4 |

## Documentos desta pasta

| Arquivo | O que é |
|---|---|
| [[LP Bíblia 120 — Configuração Tracking e Deploy]] | **Guia operacional** de env vars, tracking, GA4, Flowbiz e deploy (para executar) |
| [[BRIEFING-DESIGN]] | Identidade visual, paleta, fontes, estrutura (briefing usado no Claude Design) |
| [[TEXTOS-PRONTOS]] | Copy pronta (hero, sinopse, história, FAQ, CTAs) |
| [[LEIA-ME]] | Como o pacote foi usado no Claude Design |
| `imagens/` | Referência visual (marca, produto, templo, história) |

## Pendências pré-go-live

- Variáveis de ambiente no Netlify: `FLOWBIZ_API_KEY`, `FLOWBIZ_LIST_ID` (lista nova), `META_CAPI_TOKEN`
- Bloco `CONFIG` no `index.html`: URLs reais dos 2 SKUs na Tray + `GA4_ID`
- Lista Flowbiz "LP - Bíblia 120 anos" + AutoResponder do cupom IPP120
- Verificação de domínio no Meta + apontar `biblia120.editoraheziom.com.br`

> O código-fonte vive no repositório git (não no vault). Esta pasta guarda só a documentação de design e o material de referência. O zip bruto de entrega do Claude Design está arquivado em `~/` (fora do vault).
