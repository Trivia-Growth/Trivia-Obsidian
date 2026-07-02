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
status: em-implementação
---

# Integrador de Estoque Multi-CD (Omie ↔ Shopify) — Especificação Técnica

> Levantamento exaustivo das APIs do **Shopify** (GraphQL Admin `2026-07`) e do **Omie**
> (REST JSON), mais os padrões de engenharia de sincronização de estoque, para construir um
> integrador próprio que divida o estoque entre **Salvador (Fábrica Move)** e **São Paulo**
> — algo que o **Omie.Hub não faz** por ser single-location. Documento pronto para orçar e
> implementar (com JSON/GraphQL/SQL reais). Contexto em
> [[Omie - Mapeamento Estoque - Jul 2026]] e [[Configuração Frete Shopify - Jun 2026]].

> ✅ **CERTIFICADO VIA API (02/07/2026, somente leitura, credenciais reais).** Não é só
> documentação — os pontos-chave foram batidos na API do Omie ao vivo. O que a checagem
> confirmou e **corrigiu**:
> - **Depósitos (inteiros reais):** Salvador/Fábrica Move = **`3390627692`**; SÃO PAULO =
>   **`10009035408`** (os "01"/"09" são só o código de exibição). Usados nos exemplos abaixo.
> - **`PosicaoEstoque` FUNCIONA e lê por depósito** — mesmo produto: Salvador `saldo=5`, SP
>   `saldo=0`. E o campo **`data` é OPCIONAL** (funcionou sem ele) — corrige a doc, que dizia
>   ser obrigatório e ser a causa da "falha" antiga.
> - **Nomes de campo diferem por método:** `ListarPosEstoque` → `nSaldo/fisico/reservado/`
>   `nPendente/nCMC/cCodigo/nCodProd/cCodInt`; `PosicaoEstoque` → `saldo/fisico/reservado/`
>   `pendente/cmc`.
> - **`cCodInt` (codigo_produto_integracao) vem VAZIO** nos produtos → o casamento de SKU tem
>   que ser pelo **`cCodigo`**.
> - **`origem_pedido = "SFY"` é REAL e é o que o Hub grava** (corrige a doc, que só citava
>   "API"/"MLV"). Os 100 pedidos do Hub estão como `SFY`, `codigo_pedido_integracao` prefixado
>   **`OH`** (Omie.Hub).
> - **Prova do problema:** TODO item de TODO pedido do Hub tem `codigo_local_estoque =`
>   `3390627692` (Salvador). O Hub **crava Salvador em tudo** — nenhum item vai pra SP.
> - **Etapas são customizadas nesta conta:** pedido ERP em `etapa "60"`, pedidos do Hub em
>   `etapa "70"`. A etapa de faturamento **não é o "50" genérico** — mapear o Kanban real.
> - **Saldos:** Salvador **1.009** itens com saldo; SP **19** (produtos Move congelados;
>   `PMUND PASTEL DE BACALHAU` está **-1**, ajustar no Omie). Catálogo total 1.432 (29 págs).

## 0. Estado atual (02/07/2026) — DECISÃO: construir e colocar em produção

**Decisão tomada:** seguir o **caminho 3 do Plano B — integração própria** (ver
[[Omie - Mapeamento Estoque - Jul 2026]]). O Hub não faz o split e não há conector de
prateleira confiável; vamos construir o integrador e **resolver de vez**.

**O que já está pronto:**
- ✅ Spec técnica completa das duas APIs + padrões de engenharia (este documento).
- ✅ **Certificação via API do Omie ao vivo** (banner abaixo): depósitos, leitura por local,
  estrutura do pedido, origem SFY, prova de que o Hub crava Salvador em tudo.
- ✅ Lado Omie do cruzamento de SKU: 1.432 `cCodigo` extraídos (todos com `cCodInt` vazio →
  casar por `cCodigo`).

**Onde travou / próximo passo imediato:** para o lado Shopify (cruzamento de SKU + construir),
precisamos de token da Admin API. ⚠️ **A Shopify desativou a criação de apps personalizados
legados a partir de 01/01/2026** — o caminho `shpat_` direto não existe mais. Então o token
sai pelo **Dev Dashboard → criar app → instalar na loja Move Gourmet → gerar Admin API access
token** (escopos read: products, inventory, locations; para produção também write_inventory +
fulfillment). Não mexer no app "Omie Shopify" (é o do Hub, vivo).

**Fila de execução (produção):**
1. Criar/instalar o app no Dev Dashboard e obter o token da Admin API do Shopify.
2. Cruzamento de SKU (Omie `cCodigo` ↔ Shopify `variant.sku`) — de-risca antes de codar.
3. Mapear o Kanban real da Omie (etapa de faturamento; vistos "60"/"70", não "50").
4. Fase 0 (PoC leitura+escrita) → Fase 1 (sync de estoque, cutover do Hub via Strangler Fig).

> 🔒 **Segurança:** o client secret `shpss_...` de um app OAuth criado por engano no Dev
> Dashboard foi colado no chat (02/07) → **excluir esse app** ou rotacionar. Credenciais Omie
> (APP_KEY 3323795676201) e o futuro token Shopify seguem como pendência de rotação.

---

## Índice
1. Problema e objetivo
2. Arquitetura geral
3. Modelo de dados do integrador (schema SQL)
4. Fluxo A — Sincronização de estoque (Omie → Shopify)
5. Fluxo B — Roteamento de pedido (Shopify → Omie)
6. Especificação Omie (endpoints, JSON real, erros, limites)
7. Especificação Shopify (GraphQL, webhooks, limites)
8. Convivência com o Omie.Hub (partição + cutover Strangler Fig)
9. Prevenção de overselling e dupla contagem
10. Confiabilidade: idempotência, filas, DLQ, reconciliação
11. Máquina de estados do pedido
12. Observabilidade e operação
13. Pontos a validar empiricamente
14. Fases de implementação e esforço
15. Fontes

---

## 1. Problema e objetivo

O **Omie.Hub só suporta UM local de estoque por loja** (confirmado no painel em 01/07).
Todo pedido do Shopify baixa do depósito padrão (Fábrica Move / Salvador), e a localização
de São Paulo no Shopify nunca reflete o saldo real do depósito SP do Omie (código 09, que
já tem produto acabado). Sem separar os dois, "pedido de SP sai de SP" (economia de frete +
prazo) não acontece.

**Viabilidade confirmada nesta pesquisa:** as duas pontas trabalham por local nativamente.
- **Omie** lê saldo por depósito (`PosicaoEstoque`/`ListarPosEstoque` com `codigo_local_estoque`)
  e grava pedido por depósito (`det[].inf_adic.codigo_local_estoque`).
- **Shopify** lê/escreve estoque por localização (`InventoryLevel` por `Location`).
A limitação está **exclusivamente no Hub**. Logo, integrador próprio resolve.

**Objetivo do integrador (dois resultados de negócio):**
- **(a) Origem do envio correta** — pedido de SP sai de SP (economia de frete/prazo). É o
  que dá o retorno financeiro. Depende do roteamento + baixa no depósito certo.
- **(b) Acuracidade de estoque por CD** — o site mostra o saldo real de cada depósito.
  Evita overselling e vender o que não está naquele CD.

---

## 2. Arquitetura geral

```
                    ┌─────────────────────────────────────────────┐
                    │              INTEGRADOR (nosso)             │
                    │                                             │
   POLL (cron) ────►│  Poller estoque ─┐                         │
                    │                  ├─► Diff ─► Fila ─► Worker │──► Shopify (escreve on_hand)
   Webhook Shopify ►│  Receptor HMAC ──┘         │         │      │
   (order routing)  │                   Inbox ───┘    Outbox/DLQ  │──► Omie (grava pedido, fatura)
                    │                                             │
                    │   Banco: product_map · stock_snapshot ·     │
                    │          webhook_inbox · outbox · order_sync│
                    └─────────────────────────────────────────────┘
             ▲                                              ▲
   leitura   │ (polling, sem webhook de estoque no Omie)    │ webhooks + GraphQL
   de saldo  │                                              │
        ┌────┴─────────────────┐                   ┌────────┴──────────────────┐
        │        OMIE          │                   │         SHOPIFY           │
        │ fonte da verdade do  │                   │  vitrine / venda / OMS    │
        │ estoque físico       │                   │                           │
        │ • Fábrica Move (01)  │                   │ • Loc. Gerino Silva (BA)  │
        │ • SÃO PAULO (09)     │                   │ • Loc. João Toniolo (SP)  │
        └──────────────────────┘                   └───────────────────────────┘
```

Dois fluxos independentes, detalhados nas seções 4 e 5:
- **Fluxo A (estoque):** Omie → Shopify. **Polling** obrigatório (Omie não tem webhook de
  saldo confiável) com duas camadas: delta frequente + reconciliação completa diária.
- **Fluxo B (pedido):** Shopify → Omie. Dirigido por **webhook** (`order_routing_complete`),
  grava o pedido no Omie com o depósito certo e dispara o faturamento.

**Princípio-mestre:** o **Omie é a fonte da verdade do estoque físico**; o Shopify é espelho
de venda. O integrador nunca inventa saldo — só espelha e roteia.

---

## 3. Modelo de dados do integrador (schema SQL)

Postgres (padrão Trívia via Supabase). Estas tabelas sustentam idempotência, diff e auditoria.

```sql
-- 3.1 Mapa de produto: casa SKU Omie ↔ Shopify e cacheia os GIDs (evita re-resolver)
CREATE TABLE product_map (
    sku                text PRIMARY KEY,          -- chave de casamento (Omie.codigo = Shopify.variant.sku)
    omie_cod_produto   bigint,                    -- nCodProd (id interno Omie)
    omie_cod_integ     text,                       -- codigo_produto_integracao (casamento robusto)
    shopify_variant_id text,                       -- gid://shopify/ProductVariant/...
    shopify_inv_item   text,                       -- gid://shopify/InventoryItem/...
    ativo              boolean NOT NULL DEFAULT true,
    is_kit             boolean NOT NULL DEFAULT false,
    updated_at         timestamptz NOT NULL DEFAULT now()
);

-- 3.2 Snapshot do último saldo por SKU × depósito (base do diff — só escreve no Shopify o que mudou)
CREATE TABLE stock_snapshot (
    sku                text NOT NULL,
    codigo_local       int  NOT NULL,             -- codigo_local_estoque (inteiro real Omie)
    saldo_omie         numeric NOT NULL,          -- último saldo lido do Omie
    on_hand_pushed     numeric,                   -- último valor escrito no Shopify (on_hand)
    last_seen_at       timestamptz NOT NULL DEFAULT now(),
    last_pushed_at     timestamptz,
    PRIMARY KEY (sku, codigo_local)
);

-- 3.3 Inbox de webhooks (idempotência do lado do recebimento) — dedup por delivery-id
CREATE TABLE webhook_inbox (
    source        text NOT NULL,                  -- 'shopify' | 'omie'
    delivery_id   text NOT NULL,                  -- X-Shopify-Webhook-Id | messageId do Omie
    topic         text NOT NULL,
    payload       jsonb NOT NULL,                 -- corpo cru (já verificado)
    status        text NOT NULL DEFAULT 'pending',-- pending|processing|processed|failed|dead
    attempts      int  NOT NULL DEFAULT 0,
    next_attempt_at timestamptz,
    last_error    text,
    received_at   timestamptz NOT NULL DEFAULT now(),
    processed_at  timestamptz,
    PRIMARY KEY (source, delivery_id)             -- a unicidade É a garantia de dedup
);
CREATE INDEX ON webhook_inbox (status, next_attempt_at);

-- 3.4 Outbox (publica p/ Omie de forma confiável — write no banco + evento na MESMA transação)
CREATE TABLE outbox (
    id            bigserial PRIMARY KEY,
    aggregate     text NOT NULL,                  -- 'order' | 'inventory'
    aggregate_id  text NOT NULL,
    event_type    text NOT NULL,                  -- 'IncluirPedido' | 'TrocarEtapa' | 'SetInventory'
    payload       jsonb NOT NULL,
    status        text NOT NULL DEFAULT 'pending',
    attempts      int  NOT NULL DEFAULT 0,
    next_attempt_at timestamptz DEFAULT now(),
    published_at  timestamptz,
    created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON outbox (status, next_attempt_at) WHERE published_at IS NULL;

-- 3.5 Sincronização de pedido (estado do pedido Shopify no Omie — idempotência do Fluxo B)
CREATE TABLE order_sync (
    shopify_order_id   text PRIMARY KEY,
    codigo_pedido_integ text UNIQUE,              -- 'SHOPIFY-<id>' (dedup na Omie)
    omie_codigo_pedido bigint,                    -- retornado pelo IncluirPedido
    assigned_location  text,                      -- gid da Location escolhida
    codigo_local       int,                       -- depósito Omie correspondente
    state              text NOT NULL DEFAULT 'received',
                       -- received|routed|written|invoiced|failed|cancelled
    last_error         text,
    updated_at         timestamptz NOT NULL DEFAULT now()
);
```

---

## 4. Fluxo A — Sincronização de estoque (Omie → Shopify)

### 4.1 Por que polling (e não webhook)
A API do Omie **não tem um evento de estoque confiável e documentado com payload completo**.
Existe `Produto.MovimentacaoEstoque`, mas o payload é "notificação com IDs" (schema não
publicado) e ajustes manuais/entradas de compra nem sempre disparam evento. Logo, **o loop
base é polling**; o webhook de movimentação, quando disparar, serve só como *gatilho de
re-sync acelerado* (opcional). Isto segue o padrão **Polling Consumer** (Hohpe/Woolf).

### 4.2 Duas camadas (padrão consolidado na indústria)
- **Camada 1 — Delta frequente (a cada 5–15 min):** varre `ListarPosEstoque` por depósito,
  compara com `stock_snapshot`, e escreve no Shopify **só os SKUs que mudaram**.
- **Camada 2 — Reconciliação completa (1×/dia, ex.: madrugada):** varre o catálogo inteiro
  dos dois depósitos e reescreve tudo que divergir. Rede de segurança para eventos/deltas
  perdidos, edições manuais e drift (padrão **reconciliation**). Reconcilia sempre para o
  **menor** número em caso de dúvida (subvender é recuperável; sobrevender, não).

> ⚠️ **Sync debt:** o intervalo do delta tem que ser MAIOR que a duração de um ciclo. ~1.400
> SKU × 2 depósitos ÷ 100 por página = ~28 requisições/ciclo → segundos. 5–15 min é folgado.

### 4.3 Passo a passo do delta
```
1. Para cada depósito D em [Salvador(01), SP(09)]:
     página = 1
     repita:
       resp = ListarPosEstoque(nPagina=página, nRegPorPagina=100,
                               dDataPosicao=hoje, cExibeTodos="S", codigo_local_estoque=D)
       para cada produto p em resp.produtos:
         saldo_novo = p.saldo            # ou p.fisico - p.reservado (ver §9)
         se stock_snapshot(p.sku, D).saldo_omie != saldo_novo:
             marcar (p.sku, D) como "mudou"; atualizar snapshot
       página += 1
     até página > resp.nTotPaginas
2. Agrupar os "mudou" em lotes de até 250 e enfileirar writes p/ Shopify (§4.4).
```
Detecção de mudança = **diff contra snapshot** (não reescrever tudo). Se nada mudou, nenhum
write — economiza rate limit dos dois lados.

### 4.4 Escrita no Shopify (batching de `inventorySetQuantities`)
- Escrever **`on_hand`** (nunca `available` — ver §9), na `Location` do depósito.
- Lotes de até **250** `quantities` por chamada → ~2.800 níveis viram ~12 chamadas.
- `changeFromQuantity` = valor que lemos por último (`on_hand_pushed`) para compare-and-set;
  em `CHANGE_FROM_QUANTITY_STALE`, re-ler e reenviar. (Documento GraphQL em §7.3.)
- Antes do primeiro write de um SKU numa Location, garantir tracking com `inventoryActivate`
  / `inventoryBulkToggleActivation` (onboarding).

### 4.5 Semântica de saldo do Omie (o que publicar)
| Campo Omie | Significado | Usar no Shopify? |
|---|---|---|
| `fisico` | físico total no depósito (inclui reservado) | base, se subtrair reservado |
| `reservado` | travado por pedidos não faturados | subtrair se a conta reserva |
| `saldo` | saldo contábil/disponível na data | **recomendado** (mais próximo de "vendável") |
| `pendente` | a receber de pedidos de COMPRA | **nunca** contar como disponível |

Recomendação: publicar **`saldo`** por depósito (ou `fisico − reservado` se a conta reservar
pedidos), menos o buffer de segurança (§9). Nunca somar `pendente`.

---

## 5. Fluxo B — Roteamento de pedido (Shopify → Omie)

### 5.1 Gatilho correto: `order_routing_complete` (não `orders/create`)
O roteamento do Shopify roda num **worker em background** depois de criar o pedido. No
instante do `orders/create` a Location ainda pode não estar atribuída. O evento certo é
**`fulfillment_orders/order_routing_complete`**, que dispara quando o roteamento terminou.

### 5.2 Passo a passo
```
1. Webhook order_routing_complete → verifica HMAC → grava em webhook_inbox (dedup) → 200 rápido.
2. Worker lê o inbox:
   a. Consulta order.fulfillmentOrders → assignedLocation.location.id  (para onde roteou)
   b. Aplica a REGRA Salvador × SP (§5.3). Se divergir e o destino tiver estoque:
        fulfillmentOrderMove(id, newLocationId)   # corrige a origem
   c. Mapeia Location → codigo_local_estoque (Gerino→01, João Toniolo→09)
   d. Garante o cliente no Omie (geral/clientes: consulta/inclui) → codigo_cliente
   e. IncluirPedido:
        - codigo_pedido_integracao = "SHOPIFY-<order_id>"  (dedup/idempotência)
        - etapa = "10"  (aberto, ainda NÃO fatura)
        - cada det[].inf_adic.codigo_local_estoque = depósito do item  ← SPLIT
      (grava order_sync + outbox na MESMA transação)
   f. Se "Pedido já cadastrado" → tratar como sucesso idempotente (ConsultarPedido)
3. Faturar quando apropriado (ex.: no orders/paid, ou logo após gravar):
        TrocarEtapaPedido(codigo_pedido, etapa="50")  → emite NF-e e BAIXA estoque do local certo
```

### 5.3 Regra de roteamento Salvador × SP
Coerente com as zonas de frete já configuradas (ver [[Configuração Frete Shopify - Jun 2026]]):
- Cliente em **Sul/Sudeste/Centro-Oeste** → **São Paulo (09)**.
- Cliente em **Norte/Nordeste (inclui Bahia)** → **Salvador / Fábrica Move (01)**.
- **Fallback:** se o CD preferido estiver sem estoque do item, roteia para o outro (com
  estoque) e loga a exceção. Nunca faturar de um depósito sem saldo.
- Split de linha: se o pedido tem itens que só existem em CDs diferentes, quebrar em
  `det[]` com `codigo_local_estoque` distintos (o Omie aceita local por item).

### 5.4 Separar "gravar" de "faturar"
Incluir em `etapa "10"` e só depois `TrocarEtapaPedido → "50"` separa a gravação (idempotente,
segura) do faturamento (irreversível, baixa estoque). Facilita retry e validação de estoque
antes de emitir NF-e.

---

## 6. Especificação Omie

Transporte: `POST https://app.omie.com.br/api/v1/{modulo}/`, corpo
`{ "call", "app_key", "app_secret", "param":[{...}] }` (`param` sempre array de 1 objeto).
Só do backend (o secret nunca vai ao browser; a API bloqueia CORS/localhost).

> **Depósitos são inteiros.** `01`/`09` são o **código de exibição**; o que trafega na API é
> o inteiro `codigo_local_estoque`. Resolver o mapeamento label→inteiro uma vez e cachear.

### 6.1 `estoque/consulta/` — leitura de saldo

**`PosicaoEstoque`** (1 produto, tempo real) — ✅ certificado ao vivo. Params:
`codigo_local_estoque` (int, obrig), `id_prod` **ou** `cod_int`, `data` (dd/mm/aaaa,
**OPCIONAL** — certificado: funciona sem; sem `data` devolve a posição atual), `apenas_saldo`.
Retorno: `saldo`, `fisico`, `reservado`, `pendente`, `cmc`, `estoque_minimo`,
`codigo_local_estoque` (campos **sem** prefixo `n`).
```json
// request real (id_prod = nCodProd)
{ "call":"PosicaoEstoque","app_key":"...","app_secret":"...",
  "param":[{ "codigo_local_estoque":3390627692, "id_prod":3391736370, "data":"02/07/2026" }] }
// response real (CREATINE 300G em Salvador)
{ "codigo_status":"0","descricao_status":"Posição de estoque ... obtida com sucesso.",
  "saldo":5,"fisico":5,"reservado":0,"pendente":0,"cmc":147.60,"codigo_local_estoque":3390627692 }
// mesmo produto em SP (10009035408) → saldo:0, fisico:0  ← prova de leitura por depósito
```

**`ListarPosEstoque`** (catálogo paginado — o poller usa este) — ✅ certificado. Params:
`nPagina`, `nRegPorPagina` (≤100), `dDataPosicao` (obrig), `cExibeTodos` ("S" inclui zerados),
`codigo_local_estoque` (filtra depósito). Retorno: `nPagina`, `nTotPaginas`, `nTotRegistros`,
`produtos[]` com **`nCodProd`, `cCodigo` (SKU), `cCodInt` (vazio!), `cDescricao`, `fisico`,
`nSaldo`, `reservado`, `nPendente`, `nCMC`, `nPrecoUnitario`** (⚠️ prefixo `n` em saldo/
pendente/CMC — diferente do PosicaoEstoque).
```json
{ "call":"ListarPosEstoque","app_key":"...","app_secret":"...",
  "param":[{ "nPagina":1,"nRegPorPagina":100,"dDataPosicao":"02/07/2026",
             "cExibeTodos":"S","codigo_local_estoque":3390627692 }] }
// → { "nTotPaginas":29,"nTotRegistros":1432,"produtos":[
//      {"nCodProd":3391736370,"cCodigo":"76823","cCodInt":"","cDescricao":"NT CREATINE 300G",
//       "fisico":5,"nSaldo":5,"reservado":0,"nPendente":0,"nCMC":147.60} ...] }
```
> ⚠️ Nomes de paginação **variam por método**: `ListarPosEstoque` usa `nPagina`/`nRegPorPagina`;
> `geral/produtos` e `produtos/pedido` usam `pagina`/`registros_por_pagina`/`total_de_paginas`.

Outros: `ListarMovimentoEstoque`/`MovimentoEstoque` (extrato, só leitura — auditoria),
`ListarSaldoPendente` (entradas de compra). **Ajuste manual de saldo** é em outro módulo:
`estoque/ajuste/` → `IncluirAjusteEstoque` (não usar no fluxo normal — deixar a baixa vir do
faturamento).

### 6.2 `produtos/pedido/` — `IncluirPedido` (split de depósito)
Objeto `pedido_venda_produto`: `cabecalho`, `det[]`, `informacoes_adicionais`, `frete`,
`lista_parcelas`. Mínimos: `cabecalho.codigo_pedido_integracao` (dedup), `codigo_cliente`,
`data_previsao`, `etapa`, `codigo_parcela` ("000"=à vista); `det[].ide.codigo_item_integracao`,
`det[].produto.{codigo_produto,quantidade,valor_unitario}`.

🔑 **O split fica em `det[].inf_adic.codigo_local_estoque`** (por item — não no cabeçalho).
✅ Certificado: pedidos reais têm o `codigo_local_estoque` exatamente aí (chaves do `inf_adic`
incluem `codigo_local_estoque`, `nao_movimentar_estoque`, `nao_gerar_financeiro`, etc.).
```json
{ "call":"IncluirPedido","app_key":"...","app_secret":"...","param":[{
  "cabecalho":{ "codigo_pedido_integracao":"SHOPIFY-1055012345","codigo_cliente":3792227,
    "data_previsao":"02/07/2026","etapa":"10","codigo_parcela":"000","origem_pedido":"SFY" },
  "det":[
    { "ide":{"codigo_item_integracao":"SHOPIFY-1055012345-1"},
      "produto":{"codigo_produto":4422421,"quantidade":2,"unidade":"UN","valor_unitario":89.90},
      "inf_adic":{"codigo_local_estoque":3390627692} },           // ← Salvador (inteiro real)
    { "ide":{"codigo_item_integracao":"SHOPIFY-1055012345-2"},
      "produto":{"codigo_produto":4422500,"quantidade":1,"unidade":"UN","valor_unitario":129.90},
      "inf_adic":{"codigo_local_estoque":10009035408} } ],        // ← São Paulo (inteiro real)
  "informacoes_adicionais":{"consumidor_final":"S","numero_pedido_cliente":"#1001"},
  "frete":{"modalidade":"9"} }] }
// response → { "codigo_pedido":4599123456, "codigo_status":"0", "numero_pedido":"78367" }
```
- ✅ **`origem_pedido = "SFY"` é REAL** (certificado: é o que o Hub grava nos 100 pedidos
  Shopify). Usar `"SFY"` (compatível com o Hub) — a doc pública só citava "API"/"MLV", mas a
  conta aceita "SFY". `codigo_pedido_integracao` prefixado (o Hub usa `OH...`; use `SHOPIFY-...`).
- `inf_adic.nao_movimentar_estoque="S"` = item não baixa (não usar no fluxo normal).

### 6.3 Faturamento e baixa de estoque
Não existe `FaturarPedido`. Fatura-se **movendo para a etapa a faturar**, que valida e emite a
NF-e. A **baixa de estoque ocorre no faturamento** (não na inclusão) e sai **do
`codigo_local_estoque` de cada item**.
> ⚠️ **Etapa é customizada por conta — certificado ao vivo.** O "50 genérico" da doc **não
> vale aqui**: nesta conta um pedido ERP está em `etapa "60"` e os 100 pedidos do Hub estão em
> `etapa "70"`. **Mapear o Kanban real da Move** (quais colunas existem e qual dispara
> faturamento/NF-e) antes de codar o `TrocarEtapaPedido`. Não hard-codar "50".
```json
{ "call":"TrocarEtapaPedido","app_key":"...","app_secret":"...",
  "param":[{ "codigo_pedido":4599123456, "etapa":"<etapa-de-faturamento-da-conta>" }] }
```
Acompanhar autorização por `StatusPedido`/`ConsultarPedido` ou webhook de NF-e emitida.

### 6.4 `geral/produtos/` — casamento de SKU
`ListarProdutosResumido` (carga do mapa): `produto_servico_resumido[]` com `codigo_produto`
(nCodProd), **`codigo`** (= SKU), `codigo_produto_integracao`, `descricao`. `ConsultarProduto`
por `codigo`/`codigo_produto`/`codigo_produto_integracao`; traz `inativo`, `ean`, `unidade`.
- **Casar Shopify `variant.sku` ↔ Omie `codigo`/`cCodigo`.** ⚠️ Certificado: o
  `codigo_produto_integracao`/`cCodInt` vem **VAZIO** nos produtos → não dá pra casar por ele;
  o casamento é pelo **`cCodigo`**. Formatos vistos: SKUs numéricos (`76823`) em produtos de
  revenda "NT…" e `PRDxxxxx` (`PRD00732`) nos produtos Move congelados. **Auditar se esses
  `cCodigo` batem com os `variant.sku` do Shopify** (causa nº1 de falha silenciosa).
- Filtrar `inativo="N"`. Tratar **kits** (baixa por componente — sincronizar componentes, não
  o kit-pai) e **variações** (mapear a variação, não o produto-pai) à parte.

### 6.5 Webhooks Omie
Config no Portal do Desenvolvedor (perfil Admin) → app → "Adicionar novo webhook" → URL →
tópicos → Salvar → recarregar. Envia um **ping** de teste. Tópicos úteis:
`Produto.MovimentacaoEstoque` (re-sync acelerado), eventos de `VendaProduto.*` e **NF-e emitida**
(fechar loop de faturamento).
- **Entrega:** FIFO; sucesso = HTTP **2XX**. Fila 7s/3 tentativas/1–4s; DLQ 20s, retry a cada
  10 min por até 5 dias.
- 🚨 **Bloqueio de cabeça de fila (FIFO):** enquanto um POST falha e re-tenta, **nenhum outro
  do mesmo grupo é enviado**. → responder **2XX rápido** (gravar no inbox e processar async),
  senão trava a fila inteira.
- ⚠️ **Payload = "notificação com IDs"** (schema não publicado). Ao receber, **reconsultar via
  API** (`ConsultarPedido`/`PosicaoEstoque`) o estado real. Não construir lógica dependente de
  campos além dos IDs. Confirmar os strings exatos dos tópicos na tela de cadastro.

### 6.6 Rate limits e catálogo de erros
- **960 req/min por IP**; **240 req/min (=4 req/s) por IP+AppKey+Método**; **4 requisições
  simultâneas** por método (escrita: serializar por registro). **Máx 100/página.** Sem filtro
  de data, retorna últimos 30 dias.
- **Janela anti-duplicação 60s:** reconsultar o mesmo ID em <60s é bloqueado como redundante;
  um erro **reinicia** a janela. → não pollar o mesmo registro em <60s; cachear.
- 🚨 **HTTP 425 — bloqueio de 30 min** após **10 requisições com erro** na mesma
  IP+AppKey+Método. Um bug em loop tira do ar por 30 min → parar retry após poucas falhas.
- Erros comuns (strings): `500 Internal` (param errado/instabilidade → backoff);
  `Too Many Requests`; `Invalid JSON`; **"Pedido de venda já cadastrado…"** (é o dedup do
  `codigo_pedido_integracao` — tratar como **sucesso idempotente**); "…não cadastrado para o
  número…" (entidade inexistente); `PROTO_BYEBYE` (instabilidade, cuidado com registro parcial).
```json
// erro de duplicado (HTTP 500)
{ "faultstring":"ERROR: Pedido de venda já cadastrado para o codigo de integracao [SHOPIFY-1055012345]!",
  "faultcode":"SOAP-ENV:Client-101" }
```

---

## 7. Especificação Shopify

GraphQL Admin API **`2026-07`** (fixar no código, nunca `latest`).
`POST https://{loja}.myshopify.com/admin/api/2026-07/graphql.json`, header
`X-Shopify-Access-Token: shpat_...`.

### 7.1 Auth e escopos
Custom app (single-store, sem OAuth); token `shpat_` exibido **uma única vez**. Escopos:
`read_inventory`, `write_inventory`, `read_locations`, `read_products` (+ `write_products` se
mexer em variante); Fluxo B: `read_orders`, `read_merchant_managed_fulfillment_orders`,
`write_merchant_managed_fulfillment_orders`. ⚠️ `read_orders` cobre só **60 dias** (histórico
total exige `read_all_orders`, aprovação especial — provavelmente desnecessário).

### 7.2 Descobrir Locations e ler estoque
```graphql
query { locations(first: 50, includeInactive: false) {
  nodes { id name isActive fulfillsOnlineOrders address { city province } } } }
```
```graphql
# ler estoque por local de um SKU
query($variantId: ID!) {
  productVariant(id: $variantId) { sku
    inventoryItem { id tracked
      inventoryLevels(first: 10) { nodes {
        location { id name }
        quantities(names: ["on_hand","available","committed","incoming"]) { name quantity } } } } } }
```
Cadeia: `ProductVariant → inventoryItem → inventoryLevels (um por Location) → quantities`.
Para carga inicial em massa, `bulkOperationRunQuery` (varre products→variants→…→quantities em
JSONL, sem `first`, 1 por vez, polling `currentBulkOperation`).

### 7.3 Escrita de estoque — `inventorySetQuantities` (o cerne)
```graphql
mutation SetEstoque($input: InventorySetQuantitiesInput!) {
  inventorySetQuantities(input: $input) {
    inventoryAdjustmentGroup { reason changes { name delta quantityAfterChange } }
    userErrors { field message code } } }
```
```json
{ "input": {
  "name": "on_hand",                          // ← on_hand, NÃO available (ver §9)
  "reason": "correction",
  "referenceDocumentUri": "omie://sync/2026-07-02T10:00:00Z",
  "quantities": [
    { "inventoryItemId":"gid://shopify/InventoryItem/30322695",
      "locationId":"gid://shopify/Location/85518483692", "quantity":42, "changeFromQuantity":40 },
    { "inventoryItemId":"gid://shopify/InventoryItem/30322695",
      "locationId":"gid://shopify/Location/92526051564", "quantity":12, "changeFromQuantity":12 }
  ] } }
```
🚨 **Breaking change 2026-04:** `compareQuantity`/`ignoreCompareQuantity` **removidos**. Agora
é **`changeFromQuantity`** — **obrigatório** em cada item: inteiro (compare-and-set; erro
`CHANGE_FROM_QUANTITY_STALE` se não bater → re-ler e reenviar) **ou** `null` (desliga a
checagem). Omitir = erro.
- **Máx 250 itens** por chamada (teto de arrays de input). ~12 chamadas para ~2.800 níveis.
- `@idempotent(key:...)` disponível → chave estável por lote para retry seguro.
- `inventoryActivate(inventoryItemId, locationId, available, onHand)` /
  `inventoryBulkToggleActivation` — ativar tracking antes de setar (onboarding dos ~1.400 SKU
  nas 2 locations).
- **SET, não ADJUST:** SET (absoluto) é determinístico e idempotente; ADJUST (delta) acumula
  erro em reentrega.

### 7.4 Pedido, roteamento e fulfillment
Objetos: **Order** (compra) → **FulfillmentOrder** (trabalho por Location+método, onde o
roteamento atua) → **Fulfillment** (o despacho, com tracking).
```graphql
query($id: ID!) { order(id:$id) { name
  fulfillmentOrders(first:10) { nodes {
    id status requestStatus
    assignedLocation { name location { id name } }
    lineItems(first:50){ nodes { remainingQuantity lineItem { sku } } } } } } }
```
- `fulfillmentOrderMove(id, newLocationId)` — corrige a Location. Falha se CLOSED, sem
  estoque no destino, ou `requestStatus` SUBMITTED/ACCEPTED. Só merchant-managed.
- `fulfillmentCreate` (a `...V2` está deprecada) — fecha o envio; **Location é implícita** pelo
  FulfillmentOrder (por isso o `move` vem antes). `lineItemsByFulfillmentOrder`, `trackingInfo`,
  `notifyCustomer`.

### 7.5 Webhooks Shopify
Registrar via `webhookSubscriptionCreate(topic, {uri, format:JSON, filter, includeFields})`.
Topics do integrador: **`fulfillment_orders/order_routing_complete`** (gatilho principal),
`orders/paid`, `fulfillment_orders/moved`, `inventory_levels/update`, `fulfillments/create`.
- **Headers:** `X-Shopify-Hmac-Sha256` (assinatura), `X-Shopify-Topic`, **`X-Shopify-Webhook-Id`**
  (chave de dedup), `X-Shopify-Event-Id` (correlação, não dedup), `X-Shopify-Triggered-At`.
- **Verificação HMAC (obrigatória)** — HMAC-SHA256 do **corpo bruto** (não parseado) com o
  client secret, comparação em tempo constante:
```js
const digest = crypto.createHmac('sha256', SHOPIFY_API_SECRET).update(req.rawBody).digest('base64');
if (!crypto.timingSafeEqual(Buffer.from(digest,'base64'), Buffer.from(hmacHeader,'base64')))
  return res.status(401).end();
res.status(200).end();   // responder <5s, processar async
```
- **Retry:** timeout 1s conexão/5s total; **8 tentativas em ~4h**; após 8 falhas a subscription
  é **removida automaticamente** (monitorar!). Dedupe por `X-Shopify-Webhook-Id`.
- Payload de `order_routing_complete` traz o(s) `fulfillment_order` com `order_id`,
  `assigned_location_id` e line items; **use-o só como gatilho** e reconsulte via GraphQL o
  estado canônico (assignedLocation atual) antes de agir.

### 7.6 Rate limit (cost-based)
Leaky bucket: Standard = balde **1.000 pontos**, restore **100/s** (Plus 10×). Mutation = **10
pontos** base + payload. Ler `extensions.cost.throttleStatus.currentlyAvailable` e só disparar
a próxima quando houver saldo; em `THROTTLED`, esperar ~1s (ou respeitar `Retry-After`).

---

## 8. Convivência com o Omie.Hub (crítico)

Vamos ter **dois sistemas** capazes de escrever estoque no Shopify (Hub atual + integrador).
Se os dois escreverem a **mesma Location**, o número oscila (last-write-wins) e pode haver
loop de webhook. O Shopify **não** impõe dono exclusivo — a disciplina é nossa.

**Regra:** para cada **(campo × Location), exatamente um escritor.** Dois apps podem escrever
Locations **diferentes** sem conflito (InventoryLevel é por item×location).

**Desenho recomendado (P1):** o integrador assume o estoque das **duas** Locations e a sync de
estoque do Hub é **desligada/escopada**. O Hub fica, no máximo, com o que não conflita.
Confirmar com o suporte Omie se dá para desligar só a sync de estoque mantendo o resto.

**Cutover sem big-bang (Strangler Fig):**
1. **Shadow mode** — o integrador calcula o que *escreveria* e só loga; o Hub segue
   autoritativo. Comparar paridade.
2. **Cortar 1 Location** — migrar **SP** primeiro para o integrador (a partição torna seguro),
   validar, depois migrar **Salvador**.
3. **Desligar** a sync de estoque do Hub para as Locations migradas.
Nunca dois escritores no mesmo (campo×Location) em produção ao mesmo tempo.

---

## 9. Prevenção de overselling e dupla contagem

Mecânica Shopify: `on_hand = available + committed + reserved + damaged + safety_stock +
quality_control`. Ao vender, o Shopify move `available → committed` sozinho; `committed` é
**gerido só pelo Shopify — nunca escrever**.

🔑 **Publicar `on_hand` (físico), nunca `available`.** Porque ao editar `on_hand`, o Shopify
move só o `available` pelo mesmo delta e **preserva o `committed`**. Se publicássemos o
"disponível" do Omie (que já desconta pedidos), o Shopify descontaria o `committed` **de novo**
→ **subtração dupla → falso esgotado**.
```
on_hand a publicar = estoque físico do Omie no depósito
                     − reservas que só existem no Omie (sem pedido Shopify)
                     − buffer de segurança
```
- Reserva que É pedido Shopify → **não** subtrair (o `committed` cuida).
- Reserva que só existe no Omie (B2B/offline) → subtrair (Shopify não a enxerga).
- **Buffer de segurança:** 5–10% baseline (15–20% em campanha), **por SKU** (por
  velocidade × confiabilidade do feed); em SKU escasso, segurar 1–2 unidades e **parar de
  "subir" saldo** perto de zero.
- O Shopify já previne a corrida da última unidade **dentro** do Shopify (reserva atômica,
  SKIP LOCKED). Nosso risco é o **lag entre sistemas** — o buffer cobre isso.

---

## 10. Confiabilidade: idempotência, filas, DLQ, reconciliação

Modelo mental: **exactly-once não existe. O que se constrói é *effectively-once* =
entrega at-least-once + consumidor idempotente + reconciliação.**

- **Idempotência de entrada (inbox):** `INSERT ON CONFLICT (source, delivery_id) DO NOTHING`.
  0 linhas = duplicado → 200 e para. Chave = `X-Shopify-Webhook-Id` (Shopify) / `messageId`
  (Omie). Reter bem além da janela de retry (7–30 dias).
- **Idempotência de saída:** na Omie, `codigo_pedido_integracao`; no Shopify, SET absoluto +
  `@idempotent`. "Pedido já cadastrado" = sucesso idempotente.
- **Outbox:** gravar estado + evento na **mesma transação**; um relay (polling
  `FOR UPDATE SKIP LOCKED`) publica depois. Garante "envia sse e só se commitou".
- **Fila + DLQ:** retries limitados; erro **permanente** (4xx/HMAC inválido/schema) → DLQ
  imediato; **transitório** (5xx/timeout/429) → retry. Poucas tentativas para operações
  caras/irreversíveis (faturar). Preservar headers originais para replay dedupar.
- **Backoff com Full Jitter** (recomendado AWS): `sleep = random(0, min(cap, base·2^tent))`,
  base 1s, cap 300s, ≤5 tentativas. Respeitar `Retry-After`/limites Omie (parar antes do 425).
- **Reconciliação (rede de segurança):** varredura diária compara Shopify × Omie e reprocessa
  o que faltou pelo **mesmo caminho idempotente**. Métrica: nº de divergências encontradas —
  se sobe, o caminho push está degradando (ou uma subscription foi removida).

---

## 11. Máquina de estados do pedido (Fluxo B)

```
 received ──(order_routing_complete + regra §5.3)──► routed
   │  falha HMAC/parse → descartado (log)              │  destino sem estoque → fallback/exceção
   ▼                                                   ▼
 failed ◄──(erro não-idempotente)────────────── written  (IncluirPedido ok / "já cadastrado")
   ▲                                                   │
   │                                                   ▼ (TrocarEtapaPedido "50" + NF-e autorizada)
   └───────────────(retry backoff)──────────────►  invoiced ──► (baixa de estoque no depósito)
                                                       │
                     orders/cancelled ────────────►  cancelled  (DevolverPedido/Excluir conforme etapa)
```
Persistir o estado em `order_sync.state`. Cada transição é um ponto de retry; `written` e
`invoiced` são idempotentes (dedup por `codigo_pedido_integracao`).

---

## 12. Observabilidade e operação

- **Logar:** cada write de estoque (SKU, local, de→para, resultado), cada pedido gravado/
  faturado, cada webhook recebido/dedupado, cada item que foi p/ DLQ.
- **Métricas/alertas:** fila crescendo; divergência de reconciliação subindo; webhook com
  taxa de falha alta ou **subscription removida** (após 8 falhas); rate limit (THROTTLED /
  Omie 425); SKUs "não casados" Omie↔Shopify; último pedido sincronizado (detectar sync parada).
- **Health check:** endpoint que confirma poller rodando, fila drenando, subscriptions vivas.
- **Princípio:** *corrigir antes de acelerar* — webhooks dão velocidade, reconciliação garante
  correção eventual.

---

## 13. Pontos a validar empiricamente

**✅ Já certificados via API (02/07):**
- Inteiros dos depósitos (Salvador `3390627692`, SP `10009035408`).
- `PosicaoEstoque` funciona e lê por depósito; `data` opcional; nomes de campo por método.
- `origem_pedido="SFY"` é real (Hub usa); `codigo_local_estoque` fica em `det[].inf_adic`.
- Prova de que o Hub crava Salvador em todos os itens; SP tem 19 SKUs com saldo.
- Casamento de SKU é por `cCodigo` (`cCodInt` vazio).

**Ainda a validar (não dava só por leitura de API):**
1. **Etapa de faturamento real** — mapear o Kanban da conta (vistos "60"/"70"); qual coluna
   dispara NF-e/baixa. **Não hard-codar "50".** (Só um teste de escrita em sandbox confirma.)
2. **Payload dos webhooks Omie** — capturar um POST real (RequestBin) e confirmar strings
   exatos dos tópicos na tela do painel.
3. **`nSaldo` vs `fisico − reservado`** — ver como a conta reserva pedidos; escolher a base a
   publicar (nos testes o `reservado` veio 0, mas confirmar em pedido aberto).
4. **Desligar a sync de estoque do Hub** — confirmar com suporte Omie se é escopável (só
   estoque) ou se o Hub sai inteiro.
5. **Auditoria de SKU Omie↔Shopify** — quantos `cCodigo` batem com `variant.sku` (precisa da
   API do Shopify para cruzar).
6. **Order Routing nativo do Shopify** — checar no admin a estratégia do painel.
7. **Faturamento end-to-end** — validar em conta real que a troca de etapa emite NF-e e baixa
   do local certo, e o comportamento se o depósito não tiver saldo (teste de escrita).

---

## 14. Fases de implementação e esforço

| Fase | Entrega | Depende de | Esforço relativo |
|---|---|---|---|
| **0 — PoC leitura+escrita** | ler `ListarPosEstoque` de 1 depósito + `inventorySetQuantities` numa Location de teste; validar auth, mapa SKU, batching, `changeFromQuantity` | credenciais, mapa de depósitos | Baixo |
| **1 — Sync de estoque (Fluxo A)** | poller 2 camadas + diff + escrita nas 2 Locations, Hub desligado p/ estoque; snapshot, reconciliação diária, logs | Fase 0 + cutover Hub | **Médio — entrega a dor central** |
| **2 — Roteamento de pedido (Fluxo B)** | webhook `order_routing_complete` + regra Salvador×SP + `fulfillmentOrderMove` + `IncluirPedido` c/ split + `TrocarEtapaPedido` | Fase 1 + cadastro de cliente Omie | Médio-alto |
| **3 — Refino** | fulfillment via API c/ tracking, gatilho por NF-e/movimentação, dashboard de saúde, alertas | Fases 1–2 | Baixo-médio |

> A **Fase 1 sozinha já resolve** o estoque correto por CD no site (objetivo b). A **Fase 2**
> fecha "pedido de SP sai de SP" com baixa fiscal no depósito certo (objetivo a).

**Stack:** backend Node/TS ou Python; Postgres (Supabase); cron (poller) + endpoint HTTPS
(webhooks) + fila; segredos (APP_KEY/APP_SECRET Omie, `shpat_` + client secret Shopify) em
env. Padrão Trívia (Netlify Functions + Supabase) atende — atenção ao timeout de função no
poller de lote (usar job/agendador dedicado se necessário).

**Mapa de locations ↔ depósitos (✅ inteiros certificados via API):**
| Shopify Location | ID Shopify | Omie depósito | `codigo_local_estoque` (inteiro real) |
|---|---|---|---|
| Rua Dr Gerino Silva (Salvador) | `85518483692` | Fábrica Move (padrão) | **`3390627692`** |
| Rua Dr João Toniolo (SP) | `92526051564` | SÃO PAULO | **`10009035408`** |
| Shopping Barra (retirada) | — | Linx (fora do Omie) | — (ver ressalva no mapeamento) |

---

## 15. Fontes

**Shopify (shopify.dev):** admin-graphql `2026-07` — objects Location/InventoryItem/
InventoryLevel/FulfillmentOrder; mutations inventorySetQuantities (+ changelog compare-and-swap
2026-04)/inventoryAdjustQuantities/inventoryActivate/inventoryBulkToggleActivation/
fulfillmentOrderMove/fulfillmentCreate/webhookSubscriptionCreate; usage rate-limits, bulk-operations,
access-scopes, access-tokens; guias inventory-management (states), verify-deliveries (HMAC),
ignore-duplicates; Shopify Engineering (scaling inventory reservations); Shopify Help
(multi-managed inventory, inventory states).

**Omie (developer.omie.com.br + ajuda.omie.com.br):** service-list; estoque/consulta
(PosicaoEstoque, ListarPosEstoque, ListarMovimentoEstoque, ListarSaldoPendente); estoque/ajuste
(IncluirAjusteEstoque); produtos/pedido (IncluirPedido, TrocarEtapaPedido, ConsultarPedido);
geral/produtos (ListarProdutosResumido, ConsultarProduto); "Incluindo Pedido via API",
"Faturando e emitindo NF-e", "Utilizando/Características dos Webhooks", "Limites de Consumo",
"Tratando os erros da API".

**Padrões de engenharia:** Enterprise Integration Patterns (Polling Consumer, Idempotent
Receiver, Dead Letter Channel, Message Store); microservices.io (Transactional Outbox,
Idempotent Consumer); AWS (Exponential Backoff and Jitter, SQS DLQ); Martin Fowler (Event
Sourcing/reconciliation); Fivetran/Airbyte (incremental + high-water-mark); Stripe (idempotent
requests); Microsoft/AWS (Strangler Fig).
