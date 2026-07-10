---
tipo: epic-spec
id: E37
titulo: Integração Tray Completa (loja de teste → produção-ready)
status: draft
criado: 2026-07-08
atualizado: 2026-07-08
numeracao: CONFIRMADA no repo = E38 (09/07). Este arquivo do vault mantém o nome 37 por histórico; a fonte da verdade é docs/epics/epic-38-integracao-tray-completa.md
fonte_de_verdade: docs/epics/README.md e docs/stories/BACKLOG.md no repo heziomos
---

# E37 — Integração Tray Completa (loja de teste → produção-ready)

## Objetivo

Terminar de implementar a integração com a Tray **na loja de teste 1501119**, deixando tudo **parametrizado** para que a virada para a loja oficial de produção (**1345958**) seja apenas troca de configuração — sem mudança de código. Fecha o go-live seguro (correções, financeiro, carrinho, NF-e) e a camada estratégica (preço B2B, sync de catálogo/estoque, marketing).

Base: [[Tray — Auditoria de Capacidades vs Produção]] (08/07/2026), que cruzou 25 docs do vault com a API oficial e achou 6 endpoints errados + 1 risco crítico de token.

## Princípio transversal (vale para TODA story)

> **Store-agnostic:** nada de `store_id`, `api_host`, `seller_id`, `app_code` ou URL hardcoded. `api_host` sempre lido da resposta do `/auth` e persistido por loja. Toda troca teste↔produção deve ser **só configuração/env**. Cada story só é "Done" quando: (a) validada na loja de teste 1501119, e (b) comprovadamente pronta para produção sem tocar em código.

## Contexto do que já existe (não refazer)

- **Ponte CAPI** (`heziom-api`, Netlify): `order.update` → Meta CAPI Purchase + dedup. No ar.
- **Sync CRM** (edges `crm-tray-*` / `hub-tray-*`, schema `tray_mirror`, Story 5.8; STORY-017): leitura de customers/orders/coupons + webhooks recebidos; LTV.
- **Escrita de estoque** `PUT /products/:id {stock}` validada.
- **Agente** com catálogo Tray (E17).

## 🔴 Riscos/correções que ESTE épico resolve

1. Endpoints errados no vault/código: `/abandoned-carts`→`/carts`; `/coupons`→`/discount_coupons`; NF-e→`POST /orders/:order_id/invoices`; status/rastreio→`status_id`+`tracking_number`; B2B→`/customers/profiles`+`/price-lists`.
2. **Conflito de refresh token de uso único** (heziom-api × HeziomOS na mesma loja).
3. Webhooks: só 9 escopos, `order` default, resto por ticket; **sem webhook de transação/NF/carrinho** → polling.
4. Homologação Tray até **13/08/2026** (evidência: ≥2 POST + ≥2 PUT).

## Stories

| ID | Título | Fase | Prioridade |
|----|--------|------|-----------|
| [[37.1 — Parametrização multi-loja e runbook de cutover\|37.1]] | Parametrização multi-loja + runbook de cutover | 0 | 🔴 alta |
| [[37.2 — Dono único do refresh token\|37.2]] | Dono único do refresh token (resolver conflito) | 0 | 🔴 alta |
| [[37.3 — Correção de endpoints e validação na loja de teste\|37.3]] | Correção dos endpoints errados + validação | 0 | 🔴 alta |
| [[37.4 — Webhooks por ticket, polling fallback e evidências de homologação\|37.4]] | Webhook por ticket + polling fallback + evidências homologação | 0 | 🔴 alta |
| [[37.5 — Conciliação financeira (payments → títulos)\|37.5]] | Conciliação financeira (payments/price_seller → títulos) | 2 | 🟠 média-alta |
| [[37.6 — Recuperação de carrinho abandonado via carts\|37.6]] | Carrinho abandonado via `GET /carts` (destrava 6.23) | 2 | 🟠 média-alta |
| [[37.7 — NF-e vínculo e conciliação fiscal\|37.7]] | NF-e: vincular nota + conciliação fiscal Tray↔Literarius | 2 | 🟠 média-alta |
| [[37.8 — Preço B2B (perfis de cliente e listas de preço)\|37.8]] | Preço B2B: `/customers/profiles` + `/price-lists` | 3 | 🟡 média |
| [[37.9 — Sync bidirecional de catálogo\|37.9]] | Sync bidirecional de catálogo (produto/preço/variação/ISBN) | 3 | 🟡 média |
| [[37.10 — Sync de estoque e Multi-CD\|37.10]] | Sync de estoque + Multi-CD | 3 | 🟡 média |
| [[37.11 — Newsletter e scripts-pixels via API\|37.11]] | Newsletter + scripts/pixels via API | 3 | ⚪ baixa |

## Critérios de Aceite do Épico

- [ ] CA-E1 — Toda a integração roda na loja de teste 1501119 sem valor hardcoded de loja.
- [ ] CA-E2 — Existe um runbook de cutover testado (dry-run) que vira a chave só com config (37.1).
- [ ] CA-E3 — Um único componente é dono do refresh token por loja; token sobrevive 24h com heziom-api + HeziomOS ativos (37.2).
- [ ] CA-E4 — Nenhum endpoint errado remanescente no código (37.3).
- [ ] CA-E5 — Fluxos de negócio (financeiro, carrinho, NF-e, B2B, catálogo, estoque) validados na loja de teste com dados reais de teste.
- [ ] CA-E6 — Pacote de evidências de homologação pronto para o ticket da Tray (37.4).
- [ ] CA-E7 — Onde a loja de teste bloqueia validação (ex.: sandbox em `implantacao`), há registro do que fica pendente de reteste em produção.

## Dependências e coordenação

- **E10 Módulo Financeiro** (títulos a receber/pagar) — alvo do 37.5.
- **Módulo E-commerce / Literarius** — alvo do 37.9/37.10 (sync bidirecional).
- **Epic 6.23** (carrinho abandonado dormente) — destravado por 37.6.
- `heziom-api` (repo separado) e HeziomOS precisam coordenar dono do refresh (37.2) e não duplicar processamento de pedido.
- verify_jwt=false nas edges públicas de webhook ([[reference_heziomos_edge_verify_jwt_config]]).

> Docs de referência: [[Tray — Auditoria de Capacidades vs Produção]] · [[Tray - Autenticação]] · [[Tray - Webhooks]] · [[Tray - Sync Agent — Endpoints e Estratégia]] · [[heziom-api — Referência Técnica]]
