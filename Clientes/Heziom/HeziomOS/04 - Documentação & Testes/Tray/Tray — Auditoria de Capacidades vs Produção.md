---
tags: [tray, auditoria, capacidades, producao, go-live, api]
status: analise
criado: 2026-07-08
atualizado: 2026-07-08
autor: JG Novais (Trivia) + Claude
fonte: 25 docs Tray do vault + API oficial (developers.tray.com.br via plugin oficial tray-tecnologia/tray-api-ai-plugin, 150+ endpoints)
---

# Tray — Auditoria de Capacidades vs Produção

> **Pergunta que originou esta nota:** ao colocar a loja Tray de produção (**1345958**) no ar, estamos limitando o sistema apenas ao que já foi feito? A resposta é **sim** — e alguns docs do vault têm **endpoints errados** que quebrariam em produção.
>
> Cruzamento: documentação do vault × status de implementação × **API oficial da Tray** (Tray Commerce / grupo Olist — NÃO confundir com tray.io/tray.ai, que é iPaaS americana).

---

## TL;DR

O que está no ar hoje (**ponte CAPI + sync de CRM**) é sólido, mas cobre **uma fatia** do que a Tray oferece e do que o próprio vault já planejou. Foco atual = **marketing + CRM (leitura)**. Ficam de fora áreas de alto valor para editora: **catálogo/estoque (escrita bidirecional), preço B2B, fiscal (NF-e), carrinho abandonado, multi-CD, newsletter**.

A pesquisa na API oficial **corrigiu 6 suposições do vault** e revelou **1 risco crítico de token**.

---

## 🔴 Correções da API oficial (o vault está ERRADO nestes pontos)

| Tema | Vault diz | API oficial |
|---|---|---|
| **Carrinho abandonado** | `GET /abandoned-carts` (inferido) | **NÃO existe.** É `GET /carts` (lista paginada de todos os carrinhos) + `GET /carts/{session_id}/complete`. → corrige o bloqueador do 6.23 (`TRAY_ABANDONED_CARTS_PATH` está errado) |
| **Cupons** | `/coupons` | **`/discount_coupons`** (+ relacionamentos por cliente/produto/categoria/marca/frete/brinde) |
| **Preço B2B / grupos de cliente** | "A Tray **não** segmenta clientes" | **Existe:** `/customers/profiles` (grupos) + `/price-lists` (tabelas B2B, com hífen) |
| **Nota fiscal** | `/invoices` / `/web_api/invoices` | Emissão é **`POST /orders/:order_id/invoices`** (order_id na URL); resposta traz link do DANFE. Consulta geral: `GET /invoices` |
| **Status / rastreio do pedido** | `PUT /orders/:id {sending_code}` | `PUT /orders/:id` com **`status_id` + `tracking_number`**; `/orders/statuses` gerencia os TIPOS de status |
| **Webhooks de transação / NF** | Docs citam `transaction.update` e `invoice.insert` como webhooks | Oficialmente só **9 escopos**: `order`, `product`, `product_price`, `product_stock`, `variant`, `variant_price`, `variant_stock`, `customer`, `store_config`. **Não há webhook de transação, NF, pagamento nem carrinho** → esses têm que ser **polling** |

> As notas de origem que precisam de correção: [[Tray - Carrinho Abandonado e Scripts]], [[Tray - Cupons e Promoções]], [[Tray - Invoices]], [[Tray - Webhooks]], [[Tray - Pedidos]].

## 🔴 Risco crítico de produção — conflito de refresh token

Dois sistemas dão refresh no token da **MESMA loja**: o `heziom-api` (ponte CAPI, refresh a cada 2h) **e** o HeziomOS (sync CRM). O refresh token da Tray é **de uso único** — quando um renova, **invalida** o do outro. Em produção isso derruba a integração de forma intermitente.

**Ação:** definir **um único dono do refresh por loja** antes do go-live. (Risco já anotado na [[STORY-017 — Integração Tray]].)

---

## ✅ O que já está no ar (validado na loja de teste 1501119)

- **Ponte CAPI** (`heziom-api`, Netlify): webhook `order.update` → Purchase no Meta CAPI, com dedup. No ar desde 28/05 (534+ eventos, 8 Purchases reais). Ver [[Tray - Webhook Deploy Guide]] e [[heziom-api — Referência Técnica]].
- **Sync de CRM** (HeziomOS, [[STORY-017 — Integração Tray]]): `GET /customers` (108 contatos), `GET /orders` (290 compras / R$131.988), `GET /orders/{id}/complete`, `GET /coupons` (leitura); webhooks `order.insert/update`, `transaction.update`, `invoice.insert` recebidos; LTV calculado.
- **Catálogo (leitura) + escrita de estoque** (`PUT /products/:id` com `{stock}`) validados.
- **Ingestão via Edge Functions** no schema `tray_mirror` (Story 5.8): `crm-tray-sync`, `crm-tray-sync-products`, `crm-tray-poll-abandoned-carts`, `crm-tray-webhook`, `hub-tray-poll-orders`, `hub-tray-webhook`.
- **Agente de IA** consulta o catálogo Tray (E17, em produção — PR #187).
- OAuth + refresh, rate limiter (180/min), paginação (50/pág).

## 🟡 Documentado no vault, mas PARADO (não implementado)

- **Conciliação financeira**: `payments` / `price_seller` (receita líquida pós-taxa) → gerar/baixar títulos. "Fase 3", nunca ligada. Ver [[Tray - Pagamentos]].
- **Fiscal (NF-e)**: vincular nota emitida no Literarius ao pedido Tray. Ver [[Tray - Invoices]].
- **Recuperação de carrinho abandonado** (STORY-020) e **ROI de cupom por campanha** (STORY-023).
- **Categorização automática por BISAC** + marcas/selos editoriais. Ver [[Tray - Categorias e Marcas]].

## ⚪ A Tray oferece e NEM MAPEAMOS (maior risco de "deixar de fora")

1. **Preço B2B (`/price-lists`) + perfis de cliente (`/customers/profiles`)** — a Heziom **vende B2B** (igrejas, IPP, livrarias, revendas). **Maior alavanca perdida**: preço de atacado por grupo direto na loja.
2. **Multi-CD** (`/multicd/distribution-centers`, `/multicd/stock/detailed/...`) — estoque por centro de distribuição.
3. **Newsletter** (`/newsletters`, double opt-in) — capturar leads da vitrine para o e-mail marketing.
4. **Scripts externos via API** (skill `tray-scripts-externos`) — instalar pixels/tags sem mexer no tema.
5. **Imagens de produto** (`/products/{id}/images`), **características** (ISBN/autor/páginas), **kits/combos**.
6. **Gestão de tipos de status** (`/orders/statuses`) + **write-back de rastreio** (`tracking_number`).
7. ⚠️ **Avaliações de produto NÃO têm API** (só painel admin) — não prometer via integração.

---

## Matriz de capacidades (Tray oferece × documentado × implementado × necessário p/ prod)

Legenda implementado: ✅ sim · 🟡 parcial · ❌ não · ❓ incerto
Legenda prod: 🚧 bloqueador · ⭐ recomendado · ○ opcional

| Área | Capacidade | Endpoint oficial | Documentado | Implementado | Prod |
|---|---|---|---|---|---|
| **Auth** | OAuth (code→token) + refresh | `POST /web_api/auth`, `GET /web_api/auth?refresh_token=` | ✅ | ✅ | 🚧 (re-seed na loja prod) |
| **Auth** | Dono único do refresh por loja | — | 🟡 (risco anotado) | ❌ | 🚧 |
| **Pedidos** | Listar/consultar pedidos | `GET /orders`, `GET /orders/:id`, `GET /orders/:id/complete` | ✅ | ✅ | ⭐ |
| **Pedidos** | Atualizar status + rastreio | `PUT /orders/:id` (`status_id`, `tracking_number`) | 🟡 (path errado) | ❌ | ⭐ |
| **Pedidos** | Cancelar pedido | `PUT /orders/:id/cancel` | ✅ | ❌ | ○ |
| **Pedidos** | Tipos de status da loja | `/orders/statuses` | ❌ | ❌ | ○ |
| **Pagamentos** | Ler pagamentos / taxa / líquido | `GET /payments`, `price_seller` | ✅ | ❌ | ⭐ (financeiro) |
| **Pagamentos** | Formas de pagamento | `GET /payments/options` | ✅ | ❌ | ○ |
| **Fiscal** | Registrar/consultar NF-e | `POST /orders/:id/invoices`, `GET /invoices` | 🟡 (path errado) | ❌ | ⭐ |
| **Catálogo** | CRUD de produtos | `GET/POST/PUT/DELETE /products` | ✅ | 🟡 (leitura) | ⭐ |
| **Catálogo** | Escrita de estoque | `PUT /products/:id {stock}` | ✅ | ✅ | ⭐ |
| **Catálogo** | Preço / preço promo / custo | campos `price/promotional_price/cost_price` | ✅ | 🟡 | ⭐ |
| **Catálogo** | Variações / SKUs | `/products/{id}/variants` | ✅ | ❌ | ○ |
| **Catálogo** | Imagens de produto | `/products/{id}/images` | 🟡 | ❌ | ○ |
| **Catálogo** | Características (ISBN/autor) | recurso de características | 🟡 | ❌ | ⭐ (editora) |
| **Catálogo** | Kits / combos | recurso de kits | ❌ | ❌ | ○ |
| **B2B** | Listas de preço | `/price-lists`, `/price-lists/:id/values` | ❌ | ❌ | ⭐ (alavanca B2B) |
| **B2B** | Perfis/grupos de cliente | `/customers/profiles` | ❌ | ❌ | ⭐ (alavanca B2B) |
| **Clientes** | CRUD + endereços | `GET/POST/PUT /customers`, sub-recurso addresses | ✅ | 🟡 (leitura) | ⭐ |
| **Cupons** | CRUD + relacionamentos | `/discount_coupons` (+ `create_relationship`) | 🟡 (path errado) | 🟡 (leitura) | ○ |
| **Frete** | Cotação / modalidades | cálculo por CEP/peso, `/shippings` | ✅ | ❌ | ○ (temos base Urano) |
| **Estoque** | Multi-CD | `/multicd/...` | 🟡 (citado) | ❌ | ○ |
| **Categorias** | Árvore hierárquica | `/categories` | ✅ | ❌ | ⭐ (BISAC) |
| **Marcas** | CRUD (selos) | `/brands` | ✅ | ❌ | ○ |
| **Carrinho** | Listar carrinhos (abandonado) | `GET /carts`, `GET /carts/{sid}/complete` | 🟡 (path errado) | 🟡 (edge existe) | ⭐ |
| **Marketing** | Newsletter (double opt-in) | `/newsletters`, `/newsletters/confirm` | ❌ | ❌ | ○ |
| **Marketing** | Scripts externos (pixels) | skill `tray-scripts-externos` | 🟡 (inferido) | ❌ | ○ |
| **Config** | Info/config da loja | `GET /web_api/info`, `/store_configs` | 🟡 | ❌ | ○ |
| **Webhooks** | 9 escopos (order default) | ticket manual (sem API REST) | ✅ | 🟡 (order) | 🚧 (re-registrar prod) |
| **Reviews** | Avaliações de produto | **sem API pública** (só admin) | ❌ | ❌ | — |

---

## 🚧 Bloqueadores do go-live

1. **Homologação Tray** não confirmada aprovada — prazo **13/08/2026** (120 dias das credenciais de 15/04). Evidência exigida: URLs + payloads + **≥2 POST e ≥2 PUT** em 2 recursos. Ticket: `atendimento.tray.com.br` → "TRAY DESENVOLVEDORES" → "INTEGRAÇÕES API" → "Homologacao Heziom OS".
2. **Dono único do refresh token** (heziom-api × HeziomOS) — resolver antes de qualquer cron rodar em prod.
3. **Cutover técnico** — instalar app na loja 1345958 → gerar `code` (login manual + reCAPTCHA) → re-seed do token → trocar `TRAY_API_HOST` + consumer key/secret.
4. **Webhooks** — re-registrar por ticket a URL de produção **e pedir os escopos além de `order`** (só `order` vem por padrão; sem backfill histórico → polling `?modified=` cobre o intervalo).
5. **Corrigir endpoints errados** (carts, discount_coupons, invoices/order, price-lists, status_id) antes de codar em cima.

## Checklist de cutover teste→produção

**Fase 0 — cutover (obrigatório)**
- [ ] Homologação aprovada pela Tray (ticket + evidências)
- [ ] Definido o dono único do refresh token por loja
- [ ] App "Heziom OS" instalado na loja **1345958**; `code` gerado e trocado por access/refresh token
- [ ] Token re-semeado: `POST /api/tray-token-seed` (header `X-Seed-Secret: TRAY_WEBHOOK_SECRET`)
- [ ] Envs trocadas: `TRAY_API_HOST=https://www.editoraheziom.com.br`, consumer key/secret, `api_host` persistido por loja
- [ ] Webhook re-registrado por ticket p/ URL de prod + escopos além de `order`
- [ ] Segredos rotacionados no cutover (consumer_secret, service key, CAPI token, webhook secret)
- [ ] Endpoints corrigidos nas notas de origem e no código

**Fase 1 — mínimo de go-live**
- [ ] CAPI + sync de pedidos/clientes rodando em prod (o que já existe)

**Fase 2 — alto valor, curto prazo**
- [ ] Conciliação financeira (`GET /payments` / `price_seller` → títulos)
- [ ] Carrinho abandonado via `GET /carts` (corrigir `TRAY_ABANDONED_CARTS_PATH`)
- [ ] NF-e via `POST /orders/:id/invoices` (conciliação com Literarius)

**Fase 3 — estratégico**
- [ ] Preço B2B (`/price-lists`) + perfis de cliente (`/customers/profiles`)
- [ ] Sync bidirecional de catálogo/estoque com Literarius (produtos, preço, variações, características/ISBN)
- [ ] Multi-CD, newsletter, scripts/pixels via API

---

## Atualização 09/07 — validação ao vivo + incorporação no OS (Epic 38)

O épico foi formalizado no repo como **E38 — Integração Tray Completa** (não mais "E37 provisório").
Trabalho de 09/07 na loja de teste **1501119** com token vivo:

**Integração no HeziomOS (Story 38.12 / ADR-0022):** o CAPI Purchase da Meta foi portado da
`heziom-api` para dentro do OS (edges `crm-tray-webhook` com gancho CAPI, `crm-tray-capi-backfill`,
`crm-tray-token-refresh` como dono único, tabela `crm.tray_capi_events`). Deployado. Falta só ligar
o webhook e provar no Events Manager.

**Bug do refresh corrigido e provado:** o `_shared/tray.ts` não mandava `consumer_key`/`secret` na
chamada `/auth` de refresh — era o que matava o token. Corrigido; refresh do OS rodou OK e rotacionou
o token (dono único validado ponta a ponta).

**Endpoints confirmados ao vivo (respondem 200):** `/orders` (682), `/carts` (16, é o carrinho
abandonado — NÃO `/abandoned-carts`), `/discount_coupons` (64, NÃO `/coupons`), `/customers/profiles`
(1, B2B existe), `/payments` (288), `/products`. **404 na loja de teste:** `/price-lists` e
`/newsletters` — confirmar se é path da versão da API ou recurso não habilitado no plano.

**heziom-api está morta na prática:** o Supabase dela (`eqsjvacbhrezlgqpwipv`) foi **DELETADO**
(não resolve DNS; pausado ainda resolveria). Logo o refresh dela está quebrado há tempo e ela vive de
um token estático do env que expira → **não há guerra de refresh de uso único**; o OS já é o dono
único. Rollback via Netlify não é mais viável. O histórico `tray_webhook_log`/`tray_event_metrics`
foi junto (irrecuperável; Meta deduplica por event_id, não bloqueia).

**Consumer confirmado:** app **"Heziom OS"**, Consumer Key `69a36…246` / Secret `0a18…6e6` batem com
Netlify e com os secrets do OS. Cutover para prod (1345958) troca só `TRAY_API_HOST` + refaz o login
(`code`); o consumer é o mesmo.

**Canal do chamado (homologação + webhook):** é o **formulário de Parcerias técnico** (Octadesk),
não uma página de docs: `https://o192082-4c6.octadesk.com/custom-form/a16aabcf-b8a0-4274-96f1-07337114fd4c`
(Tipo=Integrador · Loja=1501119 · App=Heziom OS). Texto do chamado pronto na Story 38.4 do repo.
Homologação pede evidência de **≥2 POST + ≥2 PUT** reais (anexos).

**Segredos a rotacionar (expostos no chat 09/07):** PAT Supabase `sbp_` (alta), token Netlify `nfp_`
(alta), consumer_secret da Tray `0a18…6e6` (baixa — rotacionar exige regenerar no painel + re-semear).

**Continuação:** JG vai retomar o Epic 38 depois. Próximos passos reais estão nas stories do repo
(38.4 abrir o chamado · 38.5/38.7 dependem de E10/Literarius · 38.8/38.11 dependem dos 404 ·
38.9/38.10 dependem da decisão de fonte-da-verdade).

## Perguntas abertas para confirmar com a Tray

- Qual **plano de rate limit** a conta de produção usa? Padrão (180/min · 10k/dia) vs Corporativo (50k/dia) — decide o dimensionamento do sync de catálogo (milhares de títulos).
- **Homologação já foi submetida/aprovada?** Se não, abrir ticket já (prazo 13/08).
- Os escopos de webhook a solicitar no ticket cobrem tudo que precisamos? (Lembrar: **não há** webhook de transação/NF/carrinho — planejar polling.)
- A conta tem **Multi-CD** ativado? (dispara `store_config/update` quando liga.)

---

## Fontes

- 25 documentos Tray do vault (pasta `04 - Documentação & Testes/Tray/` + [[Tray — Correlação com Literarius]], [[Mapa Completo de APIs e Capacidades]], [[Tray — Conciliação de Repasses]], [[STORY-017 — Integração Tray]], [[Meta CAPI — Configuração Tray Ecommerce]]).
- API oficial: `developers.tray.com.br`, `partners.tray.com.br`, coleção Postman pública e **plugin oficial `tray-tecnologia/tray-api-ai-plugin`** (150+ endpoints, first-party).

> Relacionadas: [[Tray - Capacidades do Integrador]] · [[Tray - Sync Agent — Endpoints e Estratégia]] · [[_a mapear]] · [[heziom-api — Referência Técnica]]
