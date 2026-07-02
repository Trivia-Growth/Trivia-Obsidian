---
tags:
  - omie
  - shopify
  - integração
  - estoque
  - especificação
  - arquitetura
cliente: Move Gourmet
data: 2026-07-02
status: especificação
---

# Integrador de Estoque Multi-CD (Omie ↔ Shopify) — Especificação Técnica

> Levantamento exaustivo das APIs do Shopify e do Omie (documentação oficial,
> julho/2026) para construir um integrador próprio que divida o estoque entre
> **Salvador (Fábrica Move)** e **São Paulo**, algo que o **Omie.Hub não faz** por ser
> single-location. Base para orçar e implementar. Ver contexto em
> [[Omie - Mapeamento Estoque - Jul 2026]] e [[Configuração Frete Shopify - Jun 2026]].

---

## 1. Por que precisamos disto (o problema em uma frase)

O **Omie.Hub só suporta UM local de estoque por loja** (confirmado no painel do Hub em
01/07 e na investigação de campo). Logo, todo pedido do Shopify baixa do depósito padrão
(Fábrica Move / Salvador), e a localização de São Paulo no Shopify nunca reflete o saldo
real do depósito SP do Omie (código 09, que **já tem produto acabado**). Sem separar os
dois, "pedido de SP sai de SP" (economia de frete + prazo) não acontece de verdade.

**A boa notícia (validada nesta pesquisa):** as duas pontas já sabem trabalhar por local.
- O **Omie** lê e escreve estoque **por depósito** via API (`codigo_local_estoque`).
- O **Shopify** lê e escreve estoque **por localização** via API (`InventoryLevel` por
  `Location`). A limitação está **exclusivamente no Hub**, não nas plataformas.

Ou seja: o dado existe dos dois lados; falta o **elo que faz a ponte por local**. É esse
elo que o integrador constrói.

---

## 2. Arquitetura geral

```
                    ┌─────────────────────────────────────────┐
                    │            INTEGRADOR (nosso)            │
                    │   backend + banco + fila + agendador     │
                    └─────────────────────────────────────────┘
                       ▲   │  (polling)          ▲   │ (webhooks + writes)
          leitura de   │   │ escrita de          │   │
          estoque por  │   │ pedido por          │   │
          depósito     │   ▼ depósito            │   ▼
        ┌──────────────┴──────────┐      ┌───────┴───────────────────┐
        │          OMIE           │      │         SHOPIFY           │
        │  (fonte da verdade do   │      │  (loja / vitrine / venda)  │
        │   estoque físico)       │      │                           │
        │  - Fábrica Move (01)    │      │  - Loc. Gerino Silva (BA) │
        │  - SÃO PAULO (09)       │      │  - Loc. João Toniolo (SP) │
        └─────────────────────────┘      └───────────────────────────┘
```

Dois fluxos independentes:

- **Fluxo A — Sincronização de estoque (Omie → Shopify):** o integrador lê o saldo por
  depósito no Omie (polling) e espelha no Shopify na localização correspondente. É o que
  faz o site mostrar estoque certo em cada CD.
- **Fluxo B — Roteamento de pedido (Shopify → Omie):** quando entra um pedido, o
  integrador decide de qual CD ele sai (regra Salvador × SP) e grava o pedido no Omie **já
  com o `codigo_local_estoque` certo**, para a baixa fiscal sair do depósito correto.

O **Omie é a fonte da verdade do estoque físico**; o Shopify é espelho de venda.

---

## 3. Fluxo A — Sincronização de estoque (Omie → Shopify)

### Passo a passo
1. **Mapa SKU:** uma vez (e refresca de tempos em tempos), montar dicionário
   `nCodProd (Omie) → cCodigo/SKU → variantId/inventoryItemId (Shopify)`. Cachear.
2. **Polling do Omie por depósito:** a cada 5–15 min, varrer `ListarPosEstoque` para
   cada `codigo_local_estoque` (Salvador 01 e SP 09), paginando 100/página
   (~14 páginas por depósito → ~28 requisições por ciclo). Guardar snapshot por SKU×local.
3. **Diff:** comparar com o snapshot anterior. Só os SKUs que mudaram vão adiante (evita
   escrever à toa e bater no rate limit).
4. **Escrita no Shopify por localização:** para cada SKU alterado, `inventorySetQuantities`
   com `name: "on_hand"` na `Location` correspondente ao depósito, em **lote** (array
   `quantities` com muitos itens por chamada). Usar `compareQuantity` para concorrência.
5. **Gatilho complementar (opcional):** assinar o webhook `VendaProduto.Faturada`/NF do
   Omie para disparar re-sync mais rápido logo após uma venda — mas o **loop base é
   polling** (ajuste manual, entrada de compra etc. NÃO geram webhook no Omie).

### Por que polling e não webhook
**A API do Omie NÃO tem webhook de estoque.** Os webhooks do Omie cobrem pedido de venda,
NF-e, produto, OS, financeiro e cliente — nunca movimento/saldo de estoque. Confirmado em
duas fontes. Portanto, **polling de `ListarPosEstoque` é obrigatório** para detectar
mudança de saldo.

### Cuidado central: não contar estoque duas vezes
No Shopify: `on_hand = available + committed + reserved + damaged + safety_stock +
quality_control`. Quando um pedido é pago, o Shopify move sozinho de `available` para
`committed` (o `on_hand` só cai quando há fulfillment). O estado **`committed` é gerido
exclusivamente pelo Shopify — nunca escrever nele**.

Regra de ouro: o integrador **espelha `on_hand`/`available`** vindos do Omie via **SET
absoluto** (idempotente), e deixa o Shopify cuidar do `committed` na venda. Nunca processar
a mesma baixa em dois caminhos (webhook de pedido + espelho do ERP). Usar SET (valor
absoluto) e não ADJUST (delta) evita que reentrega de webhook some erro acumulado.

---

## 4. Fluxo B — Roteamento de pedido (Shopify → Omie)

### Passo a passo
1. **Gatilho:** assinar o webhook **`fulfillment_orders/order_routing_complete`** —
   **não** o `orders/create`. O roteamento do Shopify roda num worker em background
   *depois* da criação do pedido; só nesse evento a localização já foi atribuída.
2. **Ler a localização atribuída:** consultar `order.fulfillmentOrders` →
   `assignedLocation.location.id` para saber para onde o Shopify roteou.
3. **Aplicar a regra de negócio Salvador × SP:** se a decisão do Shopify divergir da regra
   (ex.: cliente de SP roteado pra Salvador por falta de estoque), corrigir com
   `fulfillmentOrderMove` para a location certa (só funciona se o destino tiver estoque e
   o FO não estiver fechado).
4. **Gravar o pedido no Omie no depósito certo:** `IncluirPedido` com o
   **`codigo_local_estoque` em `det[].inf_adic` de cada item** (é por item, não no
   cabeçalho — este é exatamente o campo que o Hub não preenche). Usar
   `codigo_pedido_integracao` para dedup.
5. **Fechar o fulfillment (se o integrador for o responsável):** `fulfillmentCreate` sobre
   o FulfillmentOrder já atribuído à location certa, com tracking. A location é **implícita**
   (vem do `assignedLocation` do FO) — por isso o move (passo 3) tem que vir antes.

### Alternativa mais leve
Se configurarmos bem o **Order Routing nativo** do Shopify (Settings → Shipping →
Order routing, lista priorizada de locations + "closest location"), o Shopify já roteia
sozinho e o integrador só **observa** e grava no Omie. Vale validar no admin real da Move
qual comportamento o painel oferece antes de decidir entre "deixar o Shopify rotear" vs.
"corrigir via `fulfillmentOrderMove`".

---

## 5. Especificação — OMIE (o que usar)

**Transporte:** JSON, `POST https://app.omie.com.br/api/v1/{modulo}/`, corpo
`{call, app_key, app_secret, param:[{...}]}`. Só do backend (o secret nunca vai ao browser).

### Endpoints
| Objetivo | Módulo / call | Observações |
|---|---|---|
| Listar depósitos | `estoque/local/` → `ListarLocaisEstoque` | devolve `codigo_local_estoque` (Salvador 01, SP 09) |
| **Ler saldo do catálogo por depósito** (polling) | `estoque/consulta/` → **`ListarPosEstoque`** | params `nPagina`, `nRegPorPagina` (máx 100), `dDataPosicao`, `codigo_local_estoque`. Retorno: `nCodProd`, `cCodigo` (SKU), `nSaldo`, `fisico`, `reservado` |
| Ler saldo de 1 produto em tempo real | `estoque/consulta/` → **`PosicaoEstoque`** | ⚠️ exige `data` (dd/mm/aaaa) **obrigatória** + `id_prod` **ou** `cod_int` + `codigo_local_estoque`. **Era isto que faltava antes** (o método existe; o erro foi ausência de `data`) |
| Mapa SKU | `geral/produtos/` → `ListarProdutosResumido` | monta `nCodProd → codigo (SKU)`; cachear |
| Gravar pedido | `produtos/pedido/` → `IncluirPedido` | **`codigo_local_estoque` em `det[].inf_adic`** (por item); `codigo_pedido_integracao` p/ dedup |
| Consultar pedido | `produtos/pedido/` → `ConsultarPedido` | por `codigo_pedido` ou `codigo_pedido_integracao` |

> ⚠️ **Inconsistência de nomes de paginação entre métodos** (não generalizar):
> `ListarPosEstoque` usa `nPagina`/`nRegPorPagina`/`nSaldo`; `PosicaoEstoque` usa `saldo`;
> `geral/produtos/` e `produtos/pedido/` usam `pagina`/`registros_por_pagina`/`total_de_paginas`.

### Rate limits Omie (números oficiais)
- **960 req/min por IP**; **240 req/min** por IP+AppKey+Método; **4 requisições simultâneas**
  por IP+AppKey+Método (alguns métodos: 1 por vez).
- **Máx 100 registros/página.**
- **Anti-duplicação:** consulta idêntica dentro de **60s** retorna aviso em vez de dados →
  **cachear do nosso lado**.
- **Bloqueio:** na **10ª requisição com erro** (mesmo IP+AppKey+Método) → bloqueio de
  **30 min** (HTTP 425). Tratar erros com cuidado.
- ~1.400 produtos × 2 depósitos = ~28 requisições por ciclo → folgado dentro de 240/min.
  Ciclo completo a cada **5–15 min**.

### Webhooks Omie (para o gatilho complementar do Fluxo A e confirmação de faturamento)
- Configurados no Portal do Desenvolvedor (perfil Admin) → app → "Adicionar novo webhook".
- Eventos úteis: `VendaProduto.Faturada`, NF-e emitida, `produto.alterado`.
- **Sem evento de estoque** (por isso polling).
- Entrega FIFO, sucesso = HTTP 2XX; fila 7s/3 tentativas; DLQ 20s/5 dias/retry 10min.
- ⚠️ Estrutura exata do payload não está publicada — **capturar um POST real** (RequestBin)
  no ambiente de teste antes de codar o parser.

---

## 6. Especificação — SHOPIFY (o que usar)

**API:** GraphQL Admin API, versão estável **`2026-07`** (fixar no código, nunca `latest`).
`POST https://{loja}.myshopify.com/admin/api/2026-07/graphql.json`.

### Auth (custom app)
- App customizado criado no admin (single-store, sem OAuth). Token **`shpat_...`** exibido
  **uma única vez** na instalação.
- Header: **`X-Shopify-Access-Token: shpat_...`**.
- **Escopos:** `read_inventory`, `write_inventory`, `read_locations`, `read_products`
  (`write_products` se for mexer em variante), e para o Fluxo B: `read_orders`,
  `read_merchant_managed_fulfillment_orders`, `write_merchant_managed_fulfillment_orders`.
  ⚠️ `read_orders` cobre só **60 dias**; histórico total exige `read_all_orders` (aprovação
  especial da Shopify) — provavelmente **não** necessário aqui.

### Leitura de estoque por local
Cadeia: `ProductVariant` → `inventoryItem` → `inventoryLevels` (um por `Location`) →
`quantities(names: ["on_hand","available","committed","incoming"])`. `Location` id no
formato `gid://shopify/Location/...`. Query `locations` já devolve só as ativas por padrão;
filtrar `fulfillsOnlineOrders`/`hasActiveInventory`.

### Escrita de estoque por local (o cerne)
- **`inventorySetQuantities`** (SET absoluto) — `name: "on_hand"`, `reason: "correction"`,
  `referenceDocumentUri` (trilha de auditoria), array `quantities[{ inventoryItemId,
  locationId, quantity, compareQuantity }]`. `compareQuantity` = valor que lemos (falha se
  mudou no meio → protege contra corrida). ⚠️ Desde a versão **`2026-04`** exige o diretório
  **`@idempotent`** com chave de idempotência (retry seguro).
- **`inventoryActivate`** (ou `inventoryBulkToggleActivation`) — antes de setar, o item
  precisa estar **ativo (tracked) naquela location**; senão não existe `InventoryLevel`.
- **SET, não ADJUST:** para sync de ERP use sempre SET (determinístico); ADJUST (delta) só
  para eventos incrementais e acumula erro em reentrega.
- **`committed`/`incoming` são derivados — nunca escrever.**

### Rate limits + volume
- GraphQL cost-based (leaky bucket): Standard = balde **1.000 pontos**, restore **100/s**
  (Plus = 10x). Mutation = **10 pontos base** + custo do payload. Ler
  `extensions.cost.throttleStatus.currentlyAvailable` e só disparar a próxima quando houver
  saldo. THROTTLED → esperar ~1s.
- **Lote é a chave:** `inventorySetQuantities` aceita **array `quantities`** → mandar muitos
  itens por chamada. ~2.800 níveis (1.400 SKU × 2 locations) viram **~10–15 chamadas**,
  síncronas, custo trivial. (⚠️ a doc **não** publica um teto numérico por chamada — o "250"
  é heurística; confirmar empiricamente e ajustar o tamanho do lote.)
- **Bulk Operations** (`bulkOperationRunQuery` p/ ler catálogo inteiro em JSONL;
  `bulkOperationRunMutation` p/ escrever) só valem se o catálogo crescer 1–2 ordens de
  grandeza. Para o volume atual, batching de `inventorySetQuantities` é mais simples.

### Webhooks Shopify (Fluxo B)
- Topics: **`fulfillment_orders/order_routing_complete`** (gatilho principal),
  `orders/paid`, `fulfillment_orders/moved`, `inventory_levels/update`,
  `fulfillments/create`.
- Registrar via `webhookSubscriptionCreate` (uri HTTPS, format JSON, `filter`,
  `includeFields`).
- **Verificação HMAC obrigatória:** header `X-Shopify-Hmac-Sha256`, HMAC-SHA256 do **corpo
  bruto** (não parseado) com o client secret, comparação em tempo constante. Dedupe por
  `X-Shopify-Webhook-Id`.
- Retry: responder **200 em <5s**; 8 tentativas em ~4h; após 8 falhas o Shopify **remove a
  subscription** (monitorar). Processar em fila, responder 200 rápido.

### Objetos de pedido (Fluxo B)
- **Order** (compra) → **FulfillmentOrder** (trabalho por location+método, onde o roteamento
  atua) → **Fulfillment** (o que foi despachado, com tracking).
- `fulfillmentOrderMove(id, newLocationId)` corrige a location (falha se CLOSED, sem estoque
  no destino, ou requestStatus SUBMITTED/ACCEPTED).
- `fulfillmentCreate` (a `fulfillmentCreateV2` está deprecada) fecha o envio; location é
  **implícita** pelo FO.

---

## 7. Convivência com o Omie.Hub (crítico)

Vamos ter **dois sistemas** capazes de escrever estoque no Shopify: o Omie.Hub (que já roda)
e o novo integrador. Se os dois escreverem a **mesma location**, o estoque fica oscilando
("flapping", last-write-wins) e pode haver loop de webhook.

**Solução: particionar por localização.** Dois apps podem escrever em **locations diferentes
sem conflito** (o `InventoryLevel` é por item×location; o conflito só existe no mesmo par).
Três desenhos possíveis, do mais simples ao mais limpo:

| Desenho | Hub controla | Integrador controla | Observação |
|---|---|---|---|
| **P1 — Integrador assume tudo** | nada (desligar sync de estoque do Hub p/ Shopify) | Salvador + SP | Mais limpo. Hub fica só com pedido/CRM se ainda usado |
| **P2 — Split de locations** | Salvador (padrão) | só SP | Menos mudança, mas exige o Hub NÃO tocar SP |
| **P3 — Integrador só lê** | Salvador + SP (não faz split) | — | Não resolve; descartado |

Recomendado: **P1** — desligar/escopar a sincronização de estoque do Hub e o integrador
passa a ser a única fonte que escreve `InventoryLevel` no Shopify, para os dois CDs. Elimina
a briga pelo número. (Confirmar com o suporte Omie se dá para desligar só a sync de estoque
do Hub mantendo o resto, ou se o Hub sai de cena de vez.)

Reforço: usar `inventorySetQuantities` + `compareQuantity` (idempotente, detecta corrida) e
filtrar echoes dos próprios writes ao ouvir `inventory_levels/update`.

---

## 8. O que precisa ser construído (stack)

Componentes mínimos do integrador:
- **Backend** (Node/TS ou Python) com:
  - Cliente Omie (JSON POST, retry/backoff, respeito ao rate limit e à janela anti-dup 60s).
  - Cliente Shopify GraphQL (cost-aware, batching de `inventorySetQuantities`, `@idempotent`).
  - **Agendador** (cron) do polling de estoque (5–15 min por depósito).
  - **Receptor de webhooks** (HTTPS público) com verificação HMAC (Shopify) e 2XX rápido.
  - **Fila** para processar webhooks/writes de forma assíncrona e idempotente.
- **Banco** (Postgres/SQLite) para:
  - Mapa SKU ↔ (nCodProd, variantId, inventoryItemId) ↔ location↔depósito.
  - Snapshot do último saldo por SKU×local (para o diff).
  - Log de sincronização / auditoria (o que foi escrito, quando, resultado).
  - Dedup de webhooks (`X-Shopify-Webhook-Id`, `codigo_pedido_integracao`).
- **Hospedagem:** algo que aceite webhook HTTPS e cron. Opções: Netlify/Vercel Functions +
  cron + um Postgres gerenciado (Supabase/Neon), ou um container simples (Fly/Render). O
  padrão Trívia (Netlify Functions + Supabase) atende.
- **Segredos:** APP_KEY/APP_SECRET Omie + token `shpat_` Shopify + client secret (HMAC) em
  variáveis de ambiente, nunca no repo.

### Mapa de locations ↔ depósitos (já levantado)
| Shopify Location | ID Shopify | Omie depósito | `codigo_local_estoque` |
|---|---|---|---|
| Rua Dr Gerino Silva (Salvador/BA) | `85518483692` | Fábrica Move | 01 |
| Rua Dr João Toniolo (SP) | `92526051564` | SÃO PAULO | 09 |
| Shopping Barra (retirada) | — | Linx (fora do Omie) | — (ver ressalva) |

---

## 9. Pontos a validar empiricamente antes de codar

1. **`origem_pedido: "SFY"`** no `IncluirPedido` — a doc pública só enumera "API" e "MLV".
   Enviar um pedido de teste; se rejeitar, usar "API" e diferenciar pelo prefixo do
   `codigo_pedido_integracao`.
2. **Payload dos webhooks Omie** — estrutura campo-a-campo não publicada; capturar um POST
   real (RequestBin) no ambiente de teste.
3. **Teto de itens por `inventorySetQuantities`** — sem número oficial; medir e calibrar o
   lote.
4. **Order Routing nativo do Shopify** — checar no admin real da Move qual estratégia o
   painel oferece (decide entre "deixar rotear" vs. "corrigir via move").
5. **Desligar a sync de estoque do Hub** — confirmar com o suporte Omie se é possível
   escopar (só estoque) ou se o Hub sai inteiro.
6. **SKUs batendo Omie↔Shopify** — auditar quantos SKUs casam por `codigo`(Omie)↔`sku`
   (Shopify); divergência de SKU é a causa nº 1 de falha silenciosa de sync.

---

## 10. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Dupla escrita Hub + integrador | Particionar por location (P1) e desligar sync de estoque do Hub |
| Dupla contagem (committed) | Nunca escrever `committed`; SET absoluto de `on_hand`; um caminho só por location |
| Reentrega de webhook | Idempotência (SET, não ADJUST; dedup por webhook-id) |
| Rate limit Omie (bloqueio 30min) | Backoff, respeitar 240/min e anti-dup 60s, cache |
| Rate limit Shopify (THROTTLED) | Batching + leitura de `throttleStatus`, espera proativa |
| Subscription removida após 8 falhas | Monitorar saúde do webhook; responder 200 rápido |
| SKU divergente | Auditoria de match antes do go-live; log de "SKU não encontrado" |
| Loja física (retirada) no Linx | Fora do Omie → não sincroniza; recomendação já registrada em [[Omie - Mapeamento Estoque - Jul 2026]] |

---

## 11. Fases sugeridas de implementação

1. **Fase 0 — Prova de conceito (leitura):** ler saldo por depósito no Omie
   (`ListarPosEstoque`) e escrever `on_hand` numa location de teste no Shopify
   (`inventorySetQuantities`). Valida auth, mapa SKU e o batching. (Baixo esforço.)
2. **Fase 1 — Sync de estoque em produção (Fluxo A):** polling + diff + escrita nas duas
   locations, com o Hub **desligado** para estoque. Entrega o valor principal (estoque certo
   por CD). Monitoramento e log.
3. **Fase 2 — Roteamento de pedido (Fluxo B):** webhook `order_routing_complete`, regra
   Salvador×SP, `fulfillmentOrderMove` quando necessário, `IncluirPedido` com o depósito
   certo. Fecha o ciclo "pedido de SP sai de SP".
4. **Fase 3 — Refino:** fulfillment via API com tracking, gatilho complementar por
   `VendaProduto.Faturada`, alertas, dashboard de saúde.

> A **Fase 1 sozinha já resolve** a dor central (estoque por CD no site). A Fase 2 é o que
> garante a baixa fiscal saindo do depósito certo e a economia de frete completa.

---

## 12. Fontes (documentação oficial consultada)

**Shopify (shopify.dev):** rate-limits, bulk-operations (queries/imports), access-scopes,
access-tokens, objects Location/InventoryItem/InventoryLevel/FulfillmentOrder,
mutations inventorySetQuantities/inventoryAdjustQuantities/inventoryActivate/
fulfillmentOrderMove/fulfillmentCreate/webhookSubscriptionCreate, enums
WebhookSubscriptionTopic, guias de inventory-management e verify-deliveries (HMAC).

**Omie (developer.omie.com.br + ajuda.omie.com.br):** service-list, estoque/consulta
(PosicaoEstoque, ListarPosEstoque), estoque/local, geral/produtos, produtos/pedido
(IncluirPedido), "Incluindo Pedido de Venda via API", "Utilizando/Características dos
Webhooks", "Limites de Consumo da API", "Tratando os erros de API".
