---
tags: [heziom, tray, literarius, roadmap, integração, produto]
status: planejamento
criado: 2026-05-19
---

# Heziom — Roadmap de Integração Tray × Literarius

> O que é possível construir quando conectamos os dois sistemas.
> Organizado por impacto de negócio e complexidade técnica.

---

## O que cada sistema traz para a mesa

```
LITERARIUS (ERP — fonte da verdade)        TRAY (E-commerce — ponta da venda)
──────────────────────────────────         ──────────────────────────────────
✅ Catálogo completo (5.073 produtos)      ✅ Vitrine online da Heziom
✅ Estoque físico real (167k unidades)     ✅ Pedidos e-commerce em tempo real
✅ Todos os canais financeiros             ✅ Taxa exata do gateway por transação
✅ A pagar / A receber consolidado         ✅ Código de rastreio de entregas
✅ DRE com rateio por plano de conta       ✅ Cupons e campanhas de marketing
✅ Consignação, royalties, CMV             ✅ Webhooks de eventos instantâneos
✅ Histórico desde o início da empresa     ✅ Dados do cliente (CRM e-commerce)
```

---

## Fase 1 — Fundação (imediato, até homologação 13/08/2026)

### 1.1 Sync de Estoque Literarius → Tray
**Impacto:** Eliminar overselling (vender o que não tem em estoque)

```
Literarius: vwProdutoEstoque.QtdeEstoque
    ↓ sync a cada 15 min (Raspberry Pi)
Tray: PUT /products/:id/stock
    ↓ chave: Produto.SiteID = Tray product.id
```

- Fonte Literarius: `vwProdutoEstoque` (8.162 linhas, 85 colunas — já mapeada)
- Frequência: a cada 15 min para produtos com movimentação; 1× dia para catálogo completo
- Prioridade: produtos ativos com estoque > 0 (evitar queries pesadas)

### 1.2 Captura de Pedidos Tray → Literarius (leitura + conciliação)
**Impacto:** Confirmar que 100% dos pedidos aprovados viram NF e título financeiro

```
Tray: GET /orders?status=aprovado&date={delta}
    ↓ sync a cada 15 min
Supabase: tray_orders (tabela espelho)
    ↓ JOIN via SiteIdPedido
Literarius: PedidoVenda + NotaFiscal + TituloFinanceiro
```

- Detecta automaticamente: pedidos aprovados sem NF, pedidos sem título financeiro
- Alerta no HeziomOS quando gap for encontrado

### 1.3 Sync de Pagamentos → Receita Líquida Real
**Impacto:** DRE com receita líquida real (não bruta) do canal e-commerce

```
Tray: GET /payments (price_seller = valor após taxa gateway)
    ↓
Supabase: tray_payments
    ↓ JOIN com tray_orders e lit_titulo_financeiro
HeziomOS: painel DRE com taxa gateway separada por forma de pagamento
```

- Campo `price_seller` da Tray é o **único lugar** onde a taxa exata por transação existe
- O Literarius não captura isso — é um dado exclusivo da Tray

### 1.4 Vinculação de NF-e ao Pedido Tray
**Impacto:** Cliente vê a NF na área do pedido; Heziom tem ciclo fiscal fechado

```
Literarius: NotaFiscal.NFeChave (emitida após pedido aprovado)
    ↓ HeziomOS detecta NF nova com SiteIdPedido preenchido
Tray: POST /invoices { order_id, access_key: NFeChave }
    ↓ Tray vincula NF ao pedido e exibe para o cliente
```

---

## Fase 2 — Operação (1–3 meses após fundação)

### 2.1 Webhooks em Tempo Real
**Impacto:** Reação imediata — sem polling de 15 min

| Evento Tray | Ação HeziomOS |
|---|---|
| `payment_approved` | Confirmar título financeiro no Literarius via Supabase |
| `order_cancelled` | Cancelar NF e título se existirem; devolver estoque |
| `order_shipped` | Registrar código de rastreio no pedido |
| `product_update` (de outras integrações) | Sinc reverso se necessário |

**Endpoint receptor:** Flask/FastAPI no Raspberry Pi ou Supabase Edge Function.

### 2.2 Sync de Catálogo Literarius → Tray (bidirecional)
**Impacto:** Lançamentos de novos livros aparecem automaticamente na loja

```
Novo produto no Literarius (Produto.DataLancamento próxima)
    ↓
HeziomOS detecta (query diária em vwProdutoEstoque WHERE DataAlt > ultimoSync)
    ↓
POST /products na Tray com todos os dados do livro:
  - Título, subtítulo, ISBN, EAN
  - Preço de tabela
  - Imagens (Imagem1..7 da vwProdutoEstoque)
  - Descrição/sinopse (campo Produto.Sinopse)
  - Autores (NomeAutor1/2/3 da vwProdutoEstoque)
  - Peso e dimensões (para cálculo de frete automático)
```

### 2.3 Análise de Cupons e ROI de Marketing
**Impacto:** Saber quais campanhas geram receita real (cruzando Tray × Literarius)

```
Tray: GET /coupons → lista cupons usados por pedido
    ↓ JOIN com tray_orders.discount_coupon
    ↓ JOIN com lit_nota_fiscal via SiteIdPedido
HeziomOS: painel de marketing com:
  - Receita bruta por campanha/cupom
  - Desconto concedido
  - Receita líquida real (após gateway)
  - Número de pedidos por campanha
```

### 2.4 Painel de Logística (Rastreio e Entregas)
**Impacto:** Visão operacional de separação, envio e entrega

```
Tray: Order.sending_code + shipment_integrator
    ↓ sync a cada hora para pedidos em trânsito
HeziomOS: painel com
  - Pedidos aguardando separação
  - Pedidos enviados (com código de rastreio)
  - Pedidos entregues
  - Alertas de pedidos enviados há >X dias sem confirmação de entrega
```

---

## Fase 3 — Expansão (3–6 meses)

### 3.1 Multi-CD — Estoque por Depósito
**Impacto:** Se Heziom tiver múltiplos depósitos (hoje tem setor `ControleCaixa` no Literarius)

```
Literarius: vwProdutoEstoque (col Setor) → múltiplos setores de estoque
    ↓
Tray: PUT /stock/multicd → sincroniza por centro de distribuição
```

### 3.2 Marketplace de Apps — Publicação
**Impacto:** Outras editoras/livrarias com Tray podem instalar o HeziomOS

Após homologação concluída:
1. Ticket para Tray: "Marketplace Release for Heziom OS"
2. App aparece no catálogo interno da Tray
3. Canal de receita para a Trivia (outras empresas pagam pelo HeziomOS)

### 3.3 Conciliação de Repasses Tray
**Impacto:** Confirmar automaticamente quando cada venda do e-commerce caiu na conta bancária

```
Tray: Payment.date_transaction + price_seller
    ↓ prazo de repasse por gateway (ex: cartão D+30, PIX D+1)
    ↓ projeção de quando cada venda vai cair no banco
Literarius: ContaBancaria.Saldo + vwMovimentoContaBancaria
    ↓ confirmar recebimento real
HeziomOS: alerta quando repasse esperado não chegou
```

---

## Oportunidades além do óbvio

### Frete inteligente por canal
O Literarius sabe o peso e dimensão dos livros (`Produto.Peso`, `Produto.Altura`, etc.). A Tray tem `GET /shipping/calculate`. Dá para:
- Configurar frete grátis automático para pedidos atacado acima de R$500
- Comparar fretes de múltiplas transportadoras e escolher o menor
- Alertar no HeziomOS quando o custo de frete supera X% do valor do pedido

### Precificação dinâmica por canal
O Literarius tem o custo de cada livro (`vwProdutoCusto`). A Tray tem o preço de venda. Dá para:
- Calcular margem real por produto por canal
- Alertar quando desconto em cupom comprimir margem abaixo do mínimo
- Sugerir preço mínimo de venda baseado no CMV

### Reposição de estoque automática
O Literarius tem `EstoqueMinimo` por produto. Cruzando com a velocidade de vendas da Tray:
- Calcular `DiasCobertura` (estoque atual / média de vendas diárias)
- Alertar quando cobertura cair abaixo de 30 dias para produtos top seller
- Sugerir quantidade de reposição baseado no histórico

---

## Mapa de dados — o que cada fase precisa

| Fase | Fonte Literarius | Endpoint Tray | Tabela Supabase |
|---|---|---|---|
| 1.1 Estoque | `vwProdutoEstoque` | `PUT /products/:id/stock` | `tray_stock_sync_log` |
| 1.2 Pedidos | `PedidoVenda`, `NotaFiscal` | `GET /orders` | `tray_orders` |
| 1.3 Pagamentos | `TituloFinanceiro` | `GET /payments` | `tray_payments` |
| 1.4 NF-e | `NotaFiscal.NFeChave` | `POST /invoices` | `tray_invoices` |
| 2.1 Webhooks | — (receptor) | `POST /webhooks` | event log |
| 2.2 Catálogo | `vwProduto` + `vwProdutoEstoque` | `POST /products` | `tray_products` |
| 2.3 Cupons | — | `GET /coupons` | `tray_coupons` |
| 2.4 Logística | — | `GET /orders` (status + rastreio) | `tray_orders` (cols adicionais) |

---

## Próximos passos imediatos

- [x] Desbloquear usuário na loja de teste da Tray → Nova loja `1501119` (20/05/2026)
- [x] Instalar app Heziom OS na loja de teste → `code` obtido via OAuth URL
- [x] Executar `POST /web_api/auth` → tokens salvos e refresh funcionando
- [x] Testar `GET /orders` → 2 pedidos retornados, campos confirmados
- [x] Testar `GET /products` → catálogo ok, campos `ean`, `stock`, `price` confirmados
- [x] Testar `PUT /products/:id` (stock) → funciona com `{"Product": {"stock": "N"}}`
- [ ] Confirmar `SiteIdPedido` no Literarius com pedido real de produção
- [ ] Criar tabelas Supabase (`tray_orders`, `tray_payments`)
- [ ] Implementar `sync_tray.py` com rate limiter no Raspberry Pi
- [ ] Webhooks — bloqueados na loja de teste (status `implantacao`). Inaugurar loja ou testar em produção
- [ ] Testar `POST /invoices` (vinculação NF-e)
- [ ] Migrar para loja de produção
- [ ] Submeter evidências para homologação (prazo: 13/08/2026)

---

## Referências

- [[Tray - Capacidades do Integrador]] — o que a API permite
- [[Tray — Correlação com Literarius]] — mapa campo a campo
- [[Tray - Sync Agent — Endpoints e Estratégia]] — implementação técnica
- [[_índice]] — schema Literarius
- [[Views SQL — Mapeamento e Uso]] — views para o sync
- [[ADR-001 — Sync Agent no Raspberry Pi]] — onde o sync roda

---

*Planejado em 2026-05-19 — JG Novais (Trivia)*
