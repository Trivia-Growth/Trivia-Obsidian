# Pacote de Homologação Tray — HeziomOS (projeto Odoo #1723)

**Montado em 2026-07-15** a partir do código real da integração (branch `main`).
Loja conectada hoje: **`lojatesteintegracaotray.commercesuite.com.br`** (store_id **1501119**) — é a loja de TESTE/homologação. Em produção o host muda para a loja oficial.

`{api_host}` = `https://lojatesteintegracaotray.commercesuite.com.br/web_api` (vem de `crm.tray_tokens.api_host`).

Formato exigido pela Tray em cada tarefa: **print do código da aplicação + print do console** mostrando **URL consumida (completa)**, **Content-Type** (no POST, `x-www-form-urlencoded`) e **JSON/payload**.

---

## ✅ Implementado (dá para responder com código + console)

### 01 — Geração de Token
- **Código:** `supabase/functions/_shared/tray-auth.ts:21-23` (e o par no DB em `_shared/tray.ts`).
- **URL:** `GET {api_host}/auth?consumer_key={CONSUMER_KEY}&consumer_secret={CONSUMER_SECRET}`
- **Método:** GET (sem corpo). **Content-Type:** n/a (GET).
- **Resposta:** `{ access_token, refresh_token, date_expiry_access_token }`. Access dura ~24h (cache in-memory) / ~3h no fluxo do DB.
- **Console a capturar:** a URL completa do `/auth` e o JSON retornado (com o token mascarado).

### 02 — Renovar Token
- **Código:** `supabase/functions/_shared/tray.ts:36-58` (`refreshTrayToken`) + cron `crm-tray-token-refresh`.
- **URL:** `GET {api_host}/auth?refresh_token={REFRESH}&consumer_key={KEY}&consumer_secret={SECRET}`
- **Método:** GET. `refresh_token` é de **uso único** — o novo par é salvo na hora em `crm.tray_tokens`.
- **Resposta:** `{ access_token, refresh_token, date_expiration_access_token, date_expiration_refresh_token }`.

### 05 — API de Produtos
- **Código:** `crm-tray-sync-products/index.ts:47` → `trayGet(sb, tok, "/products", { limit: 50, page })` (wrapper em `tray.ts:125-135`).
- **URL:** `GET {api_host}/products?access_token={TOKEN}&limit=50&page={N}`
- **Método:** GET. Paginado (50/página), incremental, upsert por `tray_id`.
- **Resposta:** `{ Products: [ { Product: { id, name, price, promotional_price, stock, available, reference/sku, ProductImage[], Variant[], category_name/Category, url{http,https} ... } } ] }`.

### 09 — Webhook (INBOUND: Tray → Heziom)
- **Código:** `supabase/functions/crm-tray-webhook/index.ts`.
- **URL do webhook (nossa):** `POST {SUPABASE_URL}/functions/v1/crm-tray-webhook` (endpoint público a registrar na Tray).
- **No evento**, a aplicação busca o recurso na Tray: `GET {api_host}/products/{id}` (`:54`) e `GET {api_host}/orders/{id}/complete` (`:72`).
- **Console a capturar:** o payload que a Tray envia ao nosso endpoint + a busca de volta do recurso.
- ⚠️ A tarefa 09-Webhook ainda está **sem descrição** no board da Tray — confirmar o que exatamente eles querem.

### 10 — Demais APIs (Pedidos)
- **Código:** `hub-tray-poll-orders/index.ts:52`, `hub-tray-webhook/index.ts:105`, `crm-tray-webhook/index.ts:72`.
- **URLs:** `GET {api_host}/orders?access_token=...` (listagem/poll) · `GET {api_host}/orders/{id}` · `GET {api_host}/orders/{id}/complete`.
- **Método:** GET.

---

## ⚠️ Lacunas — a Tray pede, mas hoje NÃO chamamos de forma dedicada

> Estas 4 áreas hoje são obtidas **embutidas na resposta de `/products`**, não por endpoints próprios. Para passar na homologação como a Tray define (evidência de consumir cada API), provavelmente precisaremos **implementar as chamadas dedicadas** — ou negociar com a Tray documentar que consumimos pelo `/products`.

### 04 — API de categoria — **NÃO dedicada**
Hoje a categoria vem do próprio produto (`p.category_name` / `p.Category.name`, `tray-products.ts:91`). Não há `GET {api_host}/categories`.
**Para homologar:** implementar `GET {api_host}/categories?access_token=...`.

### 06 — API de variação — **NÃO dedicada**
Variações lidas do payload do produto (`p.Variant`/`variations`, `tray-products.ts:96`). Não há chamada a `.../variants`.
**Para homologar:** implementar `GET {api_host}/products/{id}/variants?access_token=...` (ou o endpoint de variação da Tray).

### 07 — API de imagem — **NÃO dedicada**
Imagens lidas do payload (`ProductImage`/`images`, `tray-products.ts:20-26`). Não há chamada dedicada.
**Para homologar:** implementar `GET {api_host}/products/{id}/images` (ou `product_image`).

### 08 — Limite de 180 requisições/min — **sem limitador explícito**
O sync é sequencial (50/página, ~200ms/produto por causa do embedding) + timeout de 15s por chamada (`tray.ts:9`). Na prática fica bem abaixo de 180/min, mas **não há um rate-limiter explícito**.
**Para homologar:** ou provar a cadência real no console, ou adicionar um limitador explícito (ex.: fila com teto de 180/min).

### 09 — API de nota fiscal — **NÃO consumida**
Não há chamada a `/invoices`/NF no código.
**Para homologar:** implementar a leitura da NF (ex.: `GET {api_host}/orders/{id}/invoice`) se a Tray exigir.

---

## Recomendação
1. **Responder já** as 5 áreas implementadas (01, 02, 05, webhook, pedidos) com print do código (arquivos acima) + print do console das chamadas reais.
2. **Decidir com a Tray / implementar** as 4 lacunas (categoria, variação, imagem, NF) + o limitador de 180/min. Isso é trabalho de dev (novas chamadas) — posso implementar quando você aprovar.
3. Os "prints do console" precisam de captura das requisições reais (rodar contra a loja de teste com log de rede). Definir se eu monto um script que dispara + loga cada chamada, ou se capturamos dos logs da edge.
