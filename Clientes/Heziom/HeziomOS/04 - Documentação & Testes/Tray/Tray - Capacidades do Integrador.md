---
tags: [tray, api, integração, capacidades, parceiro, marketplace]
status: pesquisado
criado: 2026-05-19
fonte: Documentação pública Tray (developers.tray.com.br)
---

# Tray — Capacidades do Integrador

> O que é possível fazer como parceiro integrador na Tray.  
> Base para definir o escopo da integração Literarius ↔ Tray no HeziomOS.

---

## Visão geral — o que a API permite

A Tray oferece ~30+ categorias de endpoints REST. Para uma editora como a Heziom, os recursos mais relevantes se dividem em:

| Categoria | Endpoints | Relevância HeziomOS | Doc detalhada |
|---|---|---|---|
| **Produtos** | CRUD completo + variações + imagens | 🔴 Sync catálogo Literarius → Tray | [[Tray - Sync Agent — Endpoints e Estratégia]] |
| **Estoque** | Por produto + Multi-CD | 🔴 Sync saldo Literarius → Tray | [[Tray - Sync Agent — Endpoints e Estratégia]] |
| **Pedidos** | CRUD + produtos do pedido | 🔴 Captura de vendas Tray → Literarius | [[Tray - Pedidos]] |
| **Pagamentos** | Status + taxa gateway + `price_seller` | 🔴 DRE: receita líquida real | [[Tray - Pagamentos]] |
| **Notas Fiscais** | Vincular NF emitida ao pedido | 🔴 Ciclo fiscal completo | [[Tray - Invoices]] |
| **Clientes** | CRUD + endereços | 🟡 CRM unificado com Literarius | [[Tray - Clientes]] |
| **Frete/Transportadoras** | Calcular + configurar + rastrear | 🟡 Painel logística + separação | [[Tray - Frete e Logística]] |
| **Cupons/Promoções** | CRUD | 🟡 ROI de campanhas | [[Tray - Cupons e Promoções]] |
| **Categorias** | CRUD hierárquico (parent_id) | 🟡 Filtros por gênero editorial (BISAC) | [[Tray - Categorias e Marcas]] |
| **Marcas** | CRUD | 🟡 Selos editoriais como filtro | [[Tray - Categorias e Marcas]] |
| **Webhooks** | 10 eventos em tempo real | 🔴 Reação imediata (pagamento, cancelamento) | [[Tray - Webhooks]] |
| **Scripts** | CRUD de scripts injetados | 🟡 Pixels, analytics, chat sem editar tema | [[Tray - Carrinho Abandonado e Scripts]] |
| **Carrinho Abandonado** | Listar carrinhos incompletos | 🟡 Remarketing automático | [[Tray - Carrinho Abandonado e Scripts]] |
| **Configurações da loja** | Leitura das configs | ⚪ Monitoramento | — |

---

## O que a API NÃO permite (importante saber)

| O que não é possível via API | Alternativa |
|---|---|
| Criar/modificar temas e templates HTML/CSS da loja | OpenCode CLI (programa parceiro separado) — ver [[Tray - OpenCode — Desenvolvimento de Temas]] |
| Criar templates de e-mail transacional | Configurar no admin da loja |
| Publicar direto no marketplace | Requer homologação → ticket Tray |
| Alterar layout do checkout | Admin da loja (configuração fixa) |

> **Nota:** Scripts no front-end provavelmente SÃO possíveis via `/scripts` endpoint (similar a GTM). Confirmar após desbloqueio da loja.

> **Impacto no HeziomOS:** a integração é predominantemente back-end e dados. Customização visual da loja usa OpenCode (tema) ou Scripts (pixel/analytics).

---

## Endpoints detalhados — Tray API v2

### Produtos e Estoque

```
GET/POST/PUT/DELETE /products
GET/POST /products/:id/variations
GET/PUT  /products/:id/stock          ← sync de saldo Literarius → Tray
GET/PUT  /stock/multicd               ← estoque multi-depósito
```

**Para o HeziomOS:** sincronizar `vwProdutoEstoque` do Literarius → `/products/:id/stock` da Tray.  
Chave de conciliação: `Produto.SiteID` (Literarius) = `product.id` (Tray).

### Pedidos

```
GET/POST/PUT/DELETE /orders
POST /orders/:id/products
DELETE /orders/:id/products/:prod_id
GET /orders/:id                       ← status em tempo real
```

### Pagamentos

```
GET/POST/PUT /orders/:id/payments
```

Campo crítico: `price_seller` = valor líquido após taxa do gateway.  
O Literarius **não captura** esse dado — só disponível via Tray.

### Notas Fiscais

```
GET/POST /invoices
GET /invoices/:id
GET /invoices?order_id=:id
```

**Fluxo:** Literarius emite NF → HeziomOS faz `POST /invoices` com a `NFeChave` → Tray vincula ao pedido.

### Frete

```
GET/POST/PUT /shipping
GET /shipping/calculate
GET /shipping/carriers
```

Pode conectar Correios, transportadoras regionais ou lógica customizada (ex: frete grátis para atacado acima de R$X).

### Webhooks

```
POST /webhooks      ← registrar endpoint receptor
GET /webhooks
DELETE /webhooks/:id
```

Escopos suportados: `product`, `order`, `customer`  
Ações: `insert`, `update`, `delete`

---

## Marketplace de Apps da Tray

Sim, existe. Após a homologação, o app Heziom OS pode ser **publicado no catálogo interno da Tray** — acessível a todas as lojas Tray no menu "Aplicativos" do admin.

**Isso significa:** outras editoras/livrarias que usam Tray poderiam instalar o HeziomOS. É um canal de expansão de negócio.

**Para publicar:**
1. Completar homologação (ver abaixo)
2. Abrir ticket: "Marketplace Release for Heziom OS"
3. Tray publica no catálogo

---

## Processo de Homologação (obrigatório)

**Prazo:** até **13/08/2026** (120 dias das credenciais recebidas em 15/04/2026)

### Requisitos mínimos de evidência

A Tray exige comprovação de uso real da API:
- URLs das requisições feitas
- Payloads JSON (request + response)
- Mínimo: **2 requisições POST + 2 PUT em 2 recursos diferentes**
- Se não atingir o mínimo → testes adicionais via Postman/Insomnia obrigatórios

### Como submeter

1. Abrir ticket em: `https://atendimento.tray.com.br/hc/pt-br/requests/new`
2. Escopo: **TRAY DESENVOLVEDORES**
3. Categoria: **INTEGRAÇÕES API**
4. Assunto: `Homologacao Heziom OS`
5. Anexar: evidências de requisições (URLs, payloads, responses)

### Após aprovação

- Solicitar liberação para lojas: "App Liberation for [lojas]"
- Tempo estimado: 5–10 dias úteis

---

## Integrações possíveis além do Literarius

| Integração | Como | Benefício para Heziom |
|---|---|---|
| **Correios / transportadoras** | `/shipping` + credenciais próprias | Calcular frete automaticamente, rastrear entregas |
| **Gateways de pagamento** | `/orders/:id/payments` | Multi-gateway, taxa menor por volume |
| **Mercado Livre** | API Tray + ML integração oficial | Centralizar estoque entre Tray e ML |
| **Amazon** | Idem | Idem |
| **Cupons de marketing** | `/coupons` | Medir ROI de campanhas com dados do Literarius |
| **Multi-CD (estoque)** | `/stock/multicd` | Se Heziom tiver múltiplos depósitos |

---

## Referências

- [[Tray - Autenticação]] — credenciais + OAuth
- [[Tray - Pedidos]] — campos detalhados
- [[Tray - Pagamentos]] — `price_seller`, taxas
- [[Tray - Rate Limit e Paginação]] — implementação obrigatória
- [[Tray - Sync Agent — Endpoints e Estratégia]] — o que sincronizar e como
- [[Tray — Correlação com Literarius]] — mapa de correlação

---

*Documentado em 2026-05-19 — JG Novais (Trivia)*
