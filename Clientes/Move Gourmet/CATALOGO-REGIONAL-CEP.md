---
titulo: Catálogo Regional por CEP (Move Gourmet) — Definições e Plano
data: 2026-07-11
autor: Trívia Digital
status: DEFINIDO — a abrir como feature; nada codado ainda
---

# Catálogo Regional por CEP — Move Gourmet

> Decisão do JG (11/07): seguir com a **Opção A** — gate de CEP na entrada +
> catálogo filtrado por região — para resolver de vez o problema do mesmo
> catálogo servindo dois CDs (Salvador/BA e SP) com estoques diferentes.

## 1. Problema que estamos resolvendo
Site com catálogo único e **dois centros de distribuição** (Salvador e SP) com
estoques/produtos diferentes. Cliente tenta comprar item que existe num CD mas
não no outro (ou fresco que só é feito num CD), a compra trava e a pessoa
desiste. O objetivo é o cliente **só ver o que realmente chega até ele**,
falhando cedo (na entrada) e não no checkout.

Observação importante: o Shopify **não** bloqueia a venda só porque um CD está
zerado — ele fatura do CD que tem saldo, desde que o local esteja ativo no canal
e exista frete até o CEP. O problema real é **entregabilidade por região**
(fresco/sob encomenda que só existe num CD), não quantidade.

## 2. Definições travadas com o JG (11/07)
1. **Disponibilidade por região é GERENCIÁVEL** — não é regra fixa derivada só do
   estoque. Move Gourmet decide qual produto aparece em qual região.
2. **CEP obrigatório de verdade na entrada** — sem CEP, não navega.
3. **CEP fora da área atendida → mostra só o catálogo NACIONAL** (o que consegue
   enviar, ex.: seco/industrializado), escondendo o regional/fresco.

## 3. Modelo de região
- Cada produto tem um conjunto de regiões no `product_map`, ex.:
  `["NACIONAL"]`, `["BA"]`, `["BA","SP"]`.
  - `NACIONAL` = todo mundo vê (enviável pra qualquer CEP).
  - `BA` / `SP` = só quem está na região vê (fresco/local).
- CEP → região por faixa: **BA 40000–48999**, **SP 01000–19999**, resto → só NACIONAL.
- Visível pro cliente = produtos `NACIONAL` **ou** cuja região casa com a do CEP.

## 4. Arquitetura por camada
1. **Cadastro de região (fonte de gestão): painel do integrador (`web/`)**, não o
   Shopify. Coluna "Região" editável por produto e em lote (Nat/Fernanda marcam com
   um clique). Evita depender do escopo `write_products` do Shopify pra gerir.
2. **Filtro do site vem do integrador, não do Shopify.** O gate chama um endpoint
   leve — `GET /catalogo-regiao?cep=XXXXX` (Edge Function lendo `product_map`) —
   que devolve os produtos visíveis pra aquela região. Assim o filtro **não**
   depende de metafield no Shopify (fugimos do bloqueio de `write_products`).
3. **Gate de CEP na entrada (tema Shopify):** modal obrigatório, guarda CEP+região
   em cookie, filtra as coleções pela resposta do endpoint. Botão "trocar CEP".
4. **Guarda-dura no checkout:** Shopify Function de validação lê o CEP (atributo do
   carrinho) e **bloqueia finalizar** se houver item fora da região — rede de
   segurança contra link direto / carrinho antigo.

## 5. O que precisamos fazer (a partir de agora)
1. **Verificar o tema da loja** (Liquid padrão vs. headless) — muda como o gate é
   feito. É read-only, não depende de token. **Primeiro passo.**
2. **Abrir como feature no padrão do repo** (`specs/NNNN-catalogo-regional/`):
   product → design → domain → spec → tasks.
3. **Mockup do gate de CEP** pra o JG aprovar o visual **antes** de codar (regra:
   validar design antes de UI).
4. **Banco/integrador:** adicionar campo de regiões no `product_map` + Edge
   Function `catalogo-regiao`.
5. **Painel (`web/`):** coluna "Região" editável (individual + lote).
6. **Tema:** modal de CEP + filtro das coleções via endpoint.
7. **Checkout:** Shopify Function de validação por região (grava CEP como atributo
   do carrinho).

## 6. Bloqueios / dependências conhecidos
- **Novo token do Supabase** — pra o integrador escrever o campo de região no
  `product_map` (o antigo foi rotacionado). Ver [[project_movegourmet_reconciliacao]].
- **Escopo `write_products` no Shopify** — só necessário se algum dia formos gravar
  metafield; o desenho atual evita isso ao servir o filtro pelo integrador.
- **Shopify Functions** — a validação de checkout exige app/deploy de Functions
  (dá pra desenhar sem, mas o deploy depende de acesso).
- **Tema** — confirmar se dá pra customizar (acesso ao tema / código).

## 7. Verificação do tema (11/07) — FEITA (export do tema)

Analisado o export `theme_export__movegourmet...__11JUL2026-0829pm` (219 assets,
143 sections, 106 snippets). Resultado:

- **Tema-base: Dawn 15.3.0 (Shopify), Liquid clássico — NÃO headless.** Editável por
  código no admin (Loja virtual > Temas > Editar código). O gate de CEP no tema é viável.
- **Carrinho é PÁGINA (`/cart`), não drawer** (`cart_type: page`). Ponto de interceptação existe.
- **Coleção NÃO usa a grade nativa do Dawn** — as seções nativas
  (`main-collection-product-grid`, banner, carrossel) estão **desabilitadas**; quem
  renderiza é uma seção sob medida **`grade-move5`** ("Grade Move 5", 1410 linhas).
  Ela itera **server-side em Liquid** (`for product in collections[...].products`) e
  põe **`data-product-id` em cada card** + add-to-cart via `/cart/add.js`. → o filtro
  de região casa por `data-product-id` no cliente (bate com o endpoint do integrador).
- **Camada de apps pesada** plugada no `theme.liquid`: page-builders **Beae, EComposer,
  LayoutHub, PageFly** (home/produto podem ser montados por eles, não pelo Dawn),
  **Appstle (assinaturas)** e **GTM**. O gate tem que carregar global (no `theme.liquid`)
  e a QA precisa cobrir também as telas montadas por builder.
- **NÃO existe** nenhum campo de CEP / calculadora de frete custom hoje (só o campo
  padrão de endereço na conta). Terreno limpo, sem conflito.

### ACHADO QUE MUDA O PLANO: checkout é **Yampi** (não é o Shopify nativo)
O `theme.liquid` injeta o `YampiSnippet`: na página `/cart` ele pega o `cart.json`,
manda pra API do Yampi (`api.dooki.com.br/v2/public/shopify/cart`), limpa o carrinho
Shopify e **redireciona pro checkout hospedado do Yampi**. Consequências:
1. **Camada 4 do plano (Shopify Function validando o checkout) NÃO roda** — o checkout
   não é do Shopify. A trava-dura tem que ficar **antes do handoff pro Yampi**, ou seja
   na própria página `/cart` (validar região e bloquear o botão antes do redirect),
   e/ou usar restrição por região/CEP no painel do próprio Yampi (a checar).
2. O filtro de catálogo tem que ser **client-side via endpoint do integrador**
   (`catalogo-regiao?cep=`), escondendo cards por `data-product-id` — confirma as
   camadas 2/3 e **descarta** filtro puramente server-side em Liquid (a região vive no
   `product_map`/Supabase, que o Liquid não consulta; e sem `write_products` não dá pra
   gravar metafield/tag de região no Shopify).

**Revisão do desenho:** camadas 1–3 seguem como planejado. Camada 4 muda de "Shopify
Function" para "trava na página /cart".

### Yampi tem restrição por CEP nativa? SIM, mas é global (não por produto)
Verificado na doc do Yampi (não deu pra ver o painel da loja — não estamos logados no
Yampi e não digito senha). Recurso **"Restrição de regiões para entrega"** em
Configurações > Logística > Gerenciar:
- É uma **blocklist global de faixas de CEP** que a loja NÃO atende. Bloqueia no
  carrinho e no checkout com mensagem, impedindo criar o pedido.
- **NÃO é por produto.** Não dá pra dizer "produto X só BA, produto Y nacional". É tudo
  ou nada pra loja inteira. Frete do Yampi também é por loja/carrinho, não por produto.
- **Conclusão:** o Yampi NÃO resolve o catálogo regional por produto. Serve só como
  **rede de segurança grossa** pra CEPs que NENHUM CD atende (que no nosso desenho já
  cai no catálogo nacional). A diferenciação por produto/região continua tendo que ser
  **antes do Yampi**, no tema (gate na entrada + filtro da vitrine + trava no /cart).

**Próximo passo real:** mockup do gate de CEP pra o JG aprovar o visual antes de codar.

## 8. Relacionados
- Reconciliação de catálogo em andamento: [[project_movegourmet_reconciliacao]].
- Projeto guarda-chuva: [[project_move_gourmet]].
- Handoff da reconciliação: `RECONCILIACAO-CATALOGO-HANDOFF.md` (mesma pasta).
