---
titulo: Reconciliação de Catálogo Move Gourmet — Handoff
data: 2026-07-09
autor: Trívia Digital
status: EM ANDAMENTO — 9 produtos integrados; aguardando novo token Supabase + decisões para concluir o resto
---

# Reconciliação de Catálogo Move Gourmet — Handoff

> Documento para **retomar em outra sessão**. Cobre o que foi feito, as respostas da Nat/Fernanda,
> o que falta, os bloqueios e a ordem sugerida de execução.

## 1. Objetivo
Reconciliar o catálogo entre **Omie (ERP)**, o **integrador** (`Trivia-Growth/integradormovegourmet`)
e o **Shopify**, para que nada venda com estoque fantasma: tudo no Omie, por localização, no
integrador e no Shopify.

## 2. Como o integrador funciona (essencial)
- **Fluxo A (estoque):** `pg_cron` a cada 10 min → função `sync-estoque` → lê Omie
  (`estoque/consulta / ListarPosEstoque`, campo `nSaldo`) → aplica **buffer de 5%** com floor
  (`STOCK_SAFETY_BUFFER_PCT=5`) → escreve `on_hand` no Shopify (`inventorySetQuantities`).
  **O casamento é por `product_map.shopify_inv_item` (InventoryItem ID), NÃO por SKU.**
- **Kit:** `product_map.is_kit=true` + `unidade_sku` + `fator_kit`. Estoque do kit =
  `floor(saldo_unidade / fator × 0,95)`. O kit é um produto próprio no Omie, com código `KMOVE-*`
  (tipoItem 03, unidade PCT); o `componentes_kit` do Omie fica **null** — a composição vive no integrador.
- **Fluxo B (pedido):** webhook `ORDERS_PAID` → grava pedido no Omie.
- **Locais:** Salvador (Omie `3390627692` / Shopify Location `85518483692` "Rua Dr Gerino Silva")
  e SP (Omie `10009035408` / Location `92526051564` "Rua Dr João Toniolo"). SP quase sem saldo.
- **Loja:** `9ja6tr-1i.myshopify.com` (domínio `movegourmet.com.br`), API `2026-07`.

## 3. Achados da auditoria (contexto)
- **SKU desalinhado:** só ~6 de 56 produtos tinham SKU do Shopify = código Omie. O integrador
  funciona pelo `iid`; o SKU era uma armadilha (havia `PRD00522` duplicado em 2 produtos, etc.).
- **Flow "esconder esgotado" do Shopify é por EVENTO** (dispara na mudança de estoque), não varredura
  → produtos parados em 0 seguem publicados. Por isso usamos `inventoryPolicy=CONTINUE` nos sob-demanda.
- **Ajuste de SAÍDA no Omie exige CMC≠0** → bloqueia produtos com custo 0.
- **`pg_net` tem timeout de 5s** e a sync leva ~26s → `net._http_response` sempre mostra timeout
  (observabilidade cega, mas a sync funciona). Sugestão: subir `timeout_milliseconds` do `net.http_post`.
- Buffer 5% + floor: produto com 1 unidade vira 0 no site.

## 4. Concluído (08–09/07/2026)
- Reconciliação 3-way: Shopify (93 produtos) × Omie (1.443/CD) × `product_map`.
- **9 produtos finais integrados:**
  - **6 kits criados no Omie** (`KMOVE-*`, NCM clonado da unidade) + mapeados no integrador:
    `KMOVE-BEMCASADORED-8` (8×PRD00851), `KMOVE-BEMCASADOBERRIES-20` (20×PRD00908),
    `KMOVE-MINIBROWNIEDL-QUAD-8` (8×PRD00931), `KMOVE-MINIBROWNIEDL-CORACAO-8` (8×PRD00885),
    `KMOVE-MORANGOCOBERTOBRANCO-20` (20×PRD00879), `KMOVE-BRIGADEIROPISTACHE-20` (20×PRD00668).
  - **3 itens inteiros mapeados:** Torta Bacalhau `PRD00926`, Double Brownie `PRD00925`,
    Torta Fumeiro `PRD00907`.
  - SKUs gravados no Shopify + `CONTINUE` (continuar vendendo) nos 7 sob-demanda, via import do CSV.
  - **Prova end-to-end:** Bem Casado Red kit = 10 no site (91÷8×0,95), Mini Brownie Coração = 2.
- **Fiscal (feito por Nat/Fernanda no Omie):** NCM do Morango `8409.99.79 → 1806.90.00`; custos
  cadastrados (Mini Brownie Quad R$96, Torta Bacalhau R$162, Double Brownie R$290, Torta Fumeiro R$162,
  Quiche 4Q valor atualizado, Morango unidade R$11,25 / kit R$225).
- **Entregáveis (nesta pasta):** `products_export_1_ATUALIZADO.csv`,
  `products_export_INTEGRACAO_SKU.csv`, `Pendencias_Reconciliacao_Natalia.xlsx`,
  `Revisao_Estoque_MoveGourmet.xlsx`, `INFORMACOES-SOL-POR-JOAO_resposta.xlsx` (resposta delas).

## 5. Respostas Nat/Fernanda (09/07) — AÇÕES A EXECUTAR

### 5.1 DESCONTINUAR (não vende mais → inativar em `product_map` + arquivar/despublicar no Shopify)
- **Kits:** Bem Casado Berries (`KMOVE-BEMCASADOBERRIES-20`), Brigadeiro Pistache
  (`KMOVE-BRIGADEIROPISTACHE-20`), Mini Brownie Coração e Quadrado (`KMOVE-MINIBROWNIEDL-*`, só buffet),
  Morango Coberto Branco (`KMOVE-MORANGOCOBERTOBRANCO-20`), Empada Bacalhau (`KMOVE-EMPBACALHAU-6`).
  > Obs.: 4 dos 6 kits criados ontem entram aqui — é a realidade do catálogo, não erro.
- **Trufas 50%/70%:** `PRD00529`, `PRD00523`, `PRD00527`, `PRD00519` (padronizaram tudo em 42%).
- **Outros:** Suco de uva 250ml `PRD00620` (trocar por sucos naturais 300ml), Caixa de trufas acrílico
  `PRD00935` (pausar), Kombucha **Abacaxi/Hortelã** `KBABH280` (manter só Morango-Limão e Pitaya-Maracujá),
  Torta Baunilha "Natalina" (bug, retirar).

### 5.2 CONVERTER EM KIT (`is_kit=true` + `unidade_sku` + `fator_kit` em `product_map`)
| Produto (SKU atual Shopify) | Unidade (composição) | Fator |
|---|---|---|
| Pão Move de Frango 2un (`PRD00733`) | PRD00088 | 2 |
| Mini Bolo de Chocolate 2un (`mbc70`) | PRD00577 | 2 |
| Mini Bolo de Doce de Leite 2un (`mbdl`) | PRD00578 | 2 |
| Mini Bolo de Laranja 2un (`mbl150`) | PRD00083 | 2 |
| Mini Pão Move Frango 6un (`mpmfa`) | PRD00670 | 6 |
| Mini Pão Move Fumeiro 6un (`mpmf`) | PRD00632 | 6 |
| Mini Quiche de Fumeiro 2un (`mqf240`) | PRD00569 | 2 |
| Mini Torta de Frango 2un (`mtf`) | PRD00086 | 2 |
| Pão Move de Fumeiro 2un (`pmf`) | PRD00584 | 2 |
| Pão de Queijo 16un (`pql`) | PRD00692 | 16 |
| Pão de Parmesão (`10`) | PRD00084 | **confirmar fator** |

### 5.3 PRODUTOS NOVOS a incluir no site (sob encomenda, só BA — com preço)
- Torta Chiffon de Nozes: 15cm = `PRD00910`, 20cm = `PRD01178` (já existem no Omie).
- Double Brownie 2,2kg — R$490.
- Bolos 15/20cm: Chocolate c/ Doce de Leite (R$290/R$350), Frutas Vermelhas c/ Doce de Leite
  (R$290/R$390), Chocomove (R$290/R$350).
- Versões G (redondas): Torta Costela retangular R$220 / Costela G R$390, Torta Frango G `PRD00080`
  R$262, Torta Bacalhau G R$390, Quiche 4 Queijos Damascos G `PRD00614` R$340, Quiche Fumeiro Banana G R$350.
  > Confirmar/obter código Omie dos que ainda não têm; criar no Shopify (CSV) e mapear.

### 5.4 TRUFAS individuais — manter só 3 sabores (padronização 42%)
`PRD00522` (doce de leite), `PRD00514` (brigadeiro), `PRD00845` (branca c/ brigadeiro branco e frutas
vermelhas). O `PRD00519` sai e entra o `PRD00845`. Ajustar as variantes do produto de trufa no Shopify.

### 5.5 MUDANÇAS DE SITE (Shopify — precisa de `write_products` → CSV ou manual)
- Pote de Brigadeiro e Pote de Doce de Leite: **300g → 200g**.
- Mini Brownie: corrigir descrição/gramatura.
- Suco de uva: trocar por sucos naturais 300ml.

### 5.6 CASAMENTOS confirmados
- Quiche 4 Queijos com Damascos = `PRD00614` (nome/valor atualizados no Omie).
- Torta de Frango Redonda = `PRD00080`.
- Torta de Baunilha c/ Frutas Vermelhas 15/20cm = **bolo** `PRD00630` / `PRD00567` (usam "torta"
  no nome por questão tributária, mas é o mesmo item).

### 5.7 DECISÕES PENDENTES (voltaram como dúvida)
- **Cestas** (Experimente Viver, Movimente, Organize, Kit Doce Vida, Kit Experimentação, Primeira
  Mordida, Sabores, Move Kids, Viver além): montadas no dia com **vários produtos diferentes**. O
  modelo de kit do integrador é *1 peça × fator* — **não suporta kit multi-componente**. Decidir:
  deixar "sob encomenda" (continua vendendo, sem baixa automática por item) OU avaliar feature de
  kit multi-componente (é desenvolvimento).
- **Trufa de Chocolate 4un (`tc-1..6`):** elas não reconheceram; provável obsoleto (padronização 42%).
  Confirmar retirar.

## 6. BLOQUEIOS para concluir
1. **NOVO TOKEN DO SUPABASE** — o antigo (`sbp_...`) foi **rotacionado**. Todas as escritas no
   integrador (`product_map`: inativar, converter em kit, mapear novos) dependem dele.
2. **Escopo `write_products` no Shopify** — o token do app do integrador só tem inventário.
   Mudanças de nome/gramatura e **arquivar** produtos vão por **CSV re-import** (gerar) ou manual.

## 7. PRÓXIMOS PASSOS (ordem sugerida)
1. Obter o novo token do Supabase.
2. **Inativar** os descontinuados (5.1) em `product_map` (+ CSV/manual para arquivar no Shopify).
3. **Converter em kit** os 11 (5.2) — criar produto-kit no Omie se necessário + `is_kit`/`unidade`/`fator`.
4. **Consolidar trufas** (5.4) — 3 sabores.
5. **Criar/mapear** os produtos novos (5.3) — confirmar códigos Omie faltantes.
6. **Mudanças de site** (5.5) via CSV.
7. Fechar as **decisões** (5.7): cestas + trufa 4un.

## 8. Ferramentas (pasta `scripts/`)
Scripts Python/bash que reproduzem a análise (leem credenciais do `.env` do repo; **sem segredos
hardcoded**): `get_omie.py`, `get_shopify_stock.py`, `reconcile.py`, `build_final_skus.py`,
`create_kits.py`, `add_stock.py`, `set_continue.py`, `build_stock_xlsx.py`, `sbq.sh`.

## 9. Segurança — segredos expostos no chat da sessão (rotacionar)
- Supabase `sbp_` — **já rotacionado ✓** (por isso o token velho deu Unauthorized).
- Netlify `nfp_`, Omie `app_key`/`app_secret` — usados via `.env`; avaliar rotação.
