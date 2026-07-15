# Epic 49 — Homologação Tray (checklist oficial · projeto Odoo #1723)

**Status:** 📋 Draft (spec + stories, 15/07/2026)
**Criado em:** 2026-07-15
**Pedido:** JG — a Tray enviou o formulário de homologação (projeto Odoo #1723, ticket #1842904, Marcos M. Suporte Técnico). Cumprir todas as exigências.
**Agentes:** @pm · @architect · @dev · @security · @devops
**Relaciona:** [Epic 38 — Integração Tray Completa](epic-38-integracao-tray-completa.md) (integração base; loja teste 1501119 → prod 1345958) · repo externo `heziom-api` (ponte CAPI / API de script) · E17 (catálogo Tray da IA).
**Doc de apoio:** `docs/homologacao-tray-pacote.md` (mapa código↔endpoint das 10 tarefas).

## Objetivo
Passar na homologação da Tray: para **cada API do checklist** (10 tarefas no board Odoo), enviar **print do código da aplicação + print do console** com a **URL consumida (completa)**, o **Content-Type** (no POST/PUT, `x-www-form-urlencoded` ou `application/json`) e o **JSON/payload**. Onde a integração hoje consome de forma **embutida** (categoria/variação/imagem vêm dentro de `/products`), implementar a **chamada dedicada** para gerar a evidência. Reunir tudo e responder as 10 tarefas.

## Fatos da Tray (doc oficial — developers.tray.com.br, 15/07)
- Base: `{api_host}/web_api` (host por loja, vindo do `/auth`; teste = `lojatesteintegracaotray.commercesuite.com.br`).
- **Categorias:** `GET/POST /categories`, `GET/PUT/DELETE /categories/:id`.
- **Variações:** `GET /products/:id/variants`, `GET/PUT/DELETE /products/:id/variants/:variant_id`, `POST /products/:id/variants`.
- **Imagens:** `POST /products/:id/images`, `POST /products/:id/variants/:variant_id/images`, `POST /products/images/remove` (leitura = via o produto).
- **Nota fiscal:** `GET /invoices`, `GET /invoices/:id`, `GET /orders/:order_id/invoices`, `POST /invoices`, `PUT /invoices/:id`.
- **Limite:** **180 req/min por aplicativo** + 10.000 req/dia por loja (50.000 corporativa).
- Token: `GET {api_host}/auth?consumer_key&consumer_secret` (gera) e `...&refresh_token` (renova; refresh de uso único).

## Direção da integração (importante para o escopo)
A Heziom **LÊ** o catálogo da Tray (mirror: produtos/categorias/variações/imagens) **e ESCREVE** estoque (`PUT /products/:id`) e NF-e (`POST /orders/:order_id/invoices`, planejado no E38). O checklist da Tray cita POST/PUT — a evidência de escrita (≥2 POST + ≥2 PUT, risco E38 #4) sai de estoque + NF-e. Para categoria/variação, a evidência é de **leitura (GET)** — o Content-Type/payload só se aplica "em caso de POST/PUT".

## Mapa das 10 tarefas (board Odoo #1723)
| # | Tarefa | Endpoint Tray | Hoje | Story |
|---|--------|---------------|------|-------|
| 01 | Geração de Token | `GET /auth?consumer_key&consumer_secret` | ✅ `tray-auth.ts:21` / `tray.ts` | — (responder) |
| 02 | Renovar Token | `GET /auth?refresh_token&consumer_key&consumer_secret` | ✅ `tray.ts:36-58` | — (responder) |
| 04 | API de categoria | `GET /categories` | ⚠️ embutido em `/products` (`tray-products.ts:91`) | **49.1** |
| 05 | API de Produtos | `GET /products?limit&page` | ✅ `crm-tray-sync-products:47` | — (responder) |
| 06 | API de variação | `GET /products/:id/variants` | ⚠️ embutido (`tray-products.ts:96`) | **49.2** |
| 07 | API de imagem | via produto / `POST .../images` | ⚠️ embutido (`tray-products.ts:20`) | **49.3** |
| 08 | Limite de 180 req/min | (cliente) | ⚠️ sem limitador explícito (`tray.ts`) | **49.4** |
| 09 | API de nota fiscal | `GET /orders/:id/invoices` + `POST /orders/:id/invoices` | ❌ não consumida | **49.5** |
| 09 | Webhook | `POST {SUPABASE_URL}/functions/v1/crm-tray-webhook` | ✅ `crm-tray-webhook` | — (responder; board sem descrição) |
| 10 | Demais APIs (script, MultiCD) | `heziom-api` (CAPI/script) etc. | a mapear | **49.7** |

## Stories
| Story | Título | Prioridade | Status |
|-------|--------|-----------|--------|
| 49.1 | API de categoria — `GET /categories` dedicado no cliente Tray + sync | 🟠 High | Draft |
| 49.2 | API de variação — `GET /products/:id/variants` dedicado | 🟠 High | Draft |
| 49.3 | API de imagem — evidência de consumo + (se preciso) `POST .../images` | 🟡 Medium | Draft |
| 49.4 | Limitador de 180 req/min no cliente Tray (`_shared/tray.ts`) | 🟠 High | Draft |
| 49.5 | Nota fiscal — leitura `GET /orders/:id/invoices` (+ coordenar escrita NF-e com E38) | 🟠 High | Draft |
| 49.6 | Pacote de evidências — script que loga URL/Content-Type/payload de cada chamada + preencher as 10 tarefas no portal | 🔴 Critical | Draft |
| 49.7 | Demais APIs / **API de script** — CAPI `heziom-api` (`tray-capi.js` → Meta `graph.facebook.com/.../events`), detalhamento técnico completo | 🟡 Medium | Draft |
| 49.8 | **API de MultiCD** — confirmar consumo (hoje N/A, estoque único) e evidenciar ou declarar N/A à Tray | 🟡 Medium | Draft |

## Princípio transversal
**Store-agnostic** (herdado do E38): nada hardcoded; `api_host` sempre do `/auth`. Toda chamada nova respeita o token singleton (`getValidToken`) e o limitador de 180/min (49.4). Uma story só é "Done" quando validada na loja de teste 1501119 e com a evidência (código + console) anexada à tarefa correspondente no board Odoo.

## Segurança
Toca integração de 3º + token/credenciais → **Security Gate** nas stories que fazem chamadas novas (49.1, 49.2, 49.5) e no limitador (49.4). Nunca logar `access_token`/`consumer_secret` nos prints — mascarar.
