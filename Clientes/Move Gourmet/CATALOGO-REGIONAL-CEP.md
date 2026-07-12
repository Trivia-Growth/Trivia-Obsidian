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

> 🛑 **CORREÇÃO 11/07 (verificado ao vivo) — o Yampi NÃO está ativo. A premissa "checkout é
> Yampi" abaixo está ERRADA (era código morto no tema).** Confirmado em 3 níveis: (1) Yampi não
> está na lista de apps instalados; (2) a própria API do Yampi responde `{"data":{"active":false}}`
> pra este shop (`api.dooki.com.br/v2/public/shopify/status?shop=movegourmet.com.br`) — que é o
> mesmo flag que o snippet usa em `YampiSnippet.liquid:67` (`if(!resp.active){ não faz nada }`);
> (3) teste ao vivo: adicionei item, fui ao checkout e caiu em
> `movegourmet.com.br/checkouts/cn/...` = **checkout NATIVO do Shopify**, sem redirect pro Yampi.
> **O checkout é o nativo do Shopify.** Ver §10 pra a arquitetura corrigida (Shopify Function volta
> a ser viável). Mantido o texto abaixo riscado como registro do erro.

### ~~ACHADO QUE MUDA O PLANO: checkout é Yampi~~ (FALSO — código morto, ver correção acima)
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

> ⚠️ **As conclusões acima sobre a "camada 4" e o "filtro client-side obrigatório"
> foram CORRIGIDAS na seção 8** (auditoria adversarial de 11/07). Leia a 8 antes de agir.

## 8. REVISÃO PROFUNDA — auditoria adversarial (11/07)

Rodada uma auditoria adversarial (11 agentes: investigadores lendo os arquivos reais do
tema + docs oficiais Shopify/Yampi, refutadores por achado, síntese). Corrigiu erros
materiais da primeira passada (que era rasa).

### 8.1 O que a análise rasa errou
- **A vitrine NÃO é só a coleção.** O mesmo produto aparece server-side em 8+ superfícies:
  coleção (`grade-move5`), carrossel da home (`carousel-produtos-2`), **carrossel de upsell
  DENTRO do `/cart`**, grades de kits (`kits-move-grid`/`kits-move2` — só handle, sem
  `data-product-id`), busca `/search` (`card-product`), **busca preditiva** (dropdown AJAX,
  só handle no href), e a **PDP por URL direta `/products/{handle}`** (não tem card pra
  esconder). Chaves divergentes → o filtro precisaria casar por **id E handle**, e mesmo
  assim há apps opacos (Searchanise, PageFly, beae, bundler, Appstle) renderizando fora do
  controle do tema. Um filtro só na grade da coleção era ilusão de cobertura.
- **`products_limit=50` na grade** (`collection.json`): só ≤50 cards vão ao DOM; o filtro
  client-side nem enxerga o resto. Paginação é toda no cliente.
- **"Filtro tem que ser client-side" estava ERRADO.** Filtro client-side é **UX, não trava**
  — qualquer um fura com URL direto `/products/{handle}` ou um POST em `/cart/add.js` (que o
  Shopify não deixa o tema/app bloquear). Existe caminho server-side sem `write_products`
  (App Proxy + a API de Frete do Yampi, abaixo).

### 8.2 O chokepoint real (que faltava): API de Frete do Yampi
O achado "Yampi só tem blocklist global" estava certo no detalhe e **errado na conclusão**.
Além da blocklist global (Config > Logística), o Yampi tem **Frete por API** (Config >
Logística > Novo frete > modalidade API): no checkout, o Yampi faz um POST pro endpoint do
**nosso integrador** com **`zipcode` de destino + array de `skus` do carrinho** (id,
product_id, sku, dimensões, peso) e espera de volta um array `quotes` (timeout 4s).
Docs: [help 6067727](https://help.yampi.com.br/pt-BR/articles/6067727-como-configurar-o-frete-por-api)
· [docs.yampi API de frete](https://docs.yampi.com.br/api-reference/logistica-api-de-frete/introduction).

Isso é **exatamente** o gargalo que falta: **server-side + sabe a região do produto (lookup
dos SKUs no `product_map`) + sabe o CEP + pode RECUSAR a compra** (devolvendo `quotes: []`).
É a única trava-dura por-produto/por-CEP possível neste stack, e ela vive DENTRO do checkout
Yampi. A conclusão anterior ("sem enforcement possível porque a Shopify Function não roda")
estava incompleta.

⚠️ **Pilar NÃO CONFIRMADO — exige teste ao vivo antes de codar:** que `quotes: []` de fato
**impede finalizar** a compra (comportamento plausível e padrão de e-commerce, mas não está
escrito na doc). É o passo 1 abaixo.

### 8.3 Arquitetura corrigida — defesa em profundidade ancorada na API de Frete
Camadas, da mais fraca (UX) à mais forte (trava):
1. **CEP obrigatório na entrada** → cookie/localStorage `mg_cep`+`mg_regiao` (o tema já usa
   localStorage: beae, smi-header). UX + insumo das camadas abaixo.
2. **Filtro de vitrine em TODAS as superfícies** (grade, carrosséis, kits, busca, preditiva),
   por id E handle, alimentado por **App Proxy** que lê o `product_map` (server-side, sem
   `write_products`). Cosmético, mas coerente.
3. **Guard server-side na PDP** (`main-product.liquid`): esconde o bloco de compra se o
   produto não é da região. Fecha o `/products/{handle}` direto pro usuário comum.
4. **API de Frete do Yampi = a trava-dura.** O integrador cruza SKUs×CEP no `product_map` e
   devolve `quotes: []` (ou recusa carrinho misto) quando há item fora de área. É o backstop
   que cobre até os apps opacos, porque age por baixo, no pagamento.
5. **Blocklist global do Yampi** só pra CEPs fora de BA∪SP totalmente não atendidos.

**App Proxy é o cérebro (fonte de verdade da região, lê Supabase); a API de Frete é o músculo
(retém a compra).** App Proxy sozinho não retém pagamento; filtro client-side sozinho é UX.

⚠️ **Regra operacional:** NUNCA usar "Frete customizado por produto" do Yampi nesta loja —
ele bypassa a API de Frete/planilha de CEP e abre buraco de região.

### 8.4 Ainda NÃO CONFIRMADO (teste ao vivo)
- `quotes: []` bloqueia finalizar no Yampi (pilar da arquitetura).
- Atributos do cart Shopify sobrevivem ao handoff Yampi? (por isso a API de Frete deve
  derivar região dos próprios SKUs, não de `cart.attributes`).
- Superfícies de app opacas (Searchanise/PageFly/beae/Appstle) — quanto o filtro de UI vaza.
- Escopos exatos do app do integrador e o `product_map` (não verificados neste ambiente).

### 8.5 Próximo passo concreto (mudou)
Antes de qualquer código ou mockup: **teste de mesa na conta Yampi ao vivo** —
(1) ativar Frete por API apontando pra um endpoint stub do integrador; (2) stub devolve
`quotes: []` pra um SKU + CEP de SP, cotação normal caso contrário; (3) adicionar o SKU ao
carrinho, ir ao checkout com CEP de SP e observar se finaliza. Se bloquear → segue a
arquitetura 8.3. Se não → reabrir a decisão de checkout com o JG (trocar Yampi pelo checkout
nativo + Validation Function é decisão de negócio). Depois disso, mockup do gate de CEP.

> ⚠️ A §8 inteira presume que o checkout é Yampi. **Isso foi refutado ao vivo (ver §10).** O que
> a §8 acertou e continua valendo: (a) produto aparece em 8+ superfícies, não só a coleção; (b)
> filtro client-side é UX, não trava; (c) App Proxy como fonte de verdade da região. O que MORRE
> da §8: tudo que depende da "API de Frete do Yampi" como trava — o Yampi não está ativo.

## 10. CORREÇÃO FINAL — checkout é NATIVO do Shopify (Yampi é código morto)

Verificado ao vivo em 11/07 (a pedido do JG, que não achou o Yampi na lista de apps):
- **Yampi não está instalado** (lista de apps: Appstle, Flow, integrador Movegourmet, Melhor
  Envio, Ticket Spot, Attrac, BOGOS, Delivery & Pickup, SendWILL, Retentionly, e apps de section).
- **API do Yampi diz inativo:** `GET api.dooki.com.br/v2/public/shopify/status?shop=movegourmet.com.br`
  → `{"data":{"active":false,"skip_cart":false,...}}`. É o mesmo flag que `YampiSnippet.liquid:67`
  usa; com `active:false` o snippet não faz nada.
- **Checkout ao vivo:** adicionei item → `/checkout` caiu em `movegourmet.com.br/checkouts/cn/...`
  = **checkout nativo do Shopify**. Sem redirect pro Yampi.

**Consequência: o checkout é o nativo do Shopify → a Shopify Cart & Checkout Validation Function
É viável** (era a "camada 4" original, que eu tinha descartado por causa do Yampi fantasma).

### 10.1 Arquitetura corrigida (checkout nativo)
1. **CEP obrigatório na entrada** (cookie/localStorage `mg_cep`+`mg_regiao`) — UX.
2. **Filtro de vitrine em TODAS as superfícies** (grade, carrosséis, kits, busca, preditiva),
   por id E handle, alimentado por **App Proxy** lendo o `product_map` — UX coerente.
3. **Guard server-side na PDP** (`main-product.liquid`) — fecha o `/products/{handle}` direto.
4. **Shopify Cart & Checkout Validation Function = a trava-dura.** No checkout nativo, a função lê
   o endereço/CEP de entrega + a **região do produto** e bloqueia finalizar se houver item fora de
   área. É a trava nativa, robusta, sem gambiarra de frete.
   - ⚠️ **Restrição real da Function:** ela é WASM determinística, **sem acesso a rede** — não
     consulta o Supabase. A região do produto precisa estar **em metafield do produto** (input da
     função). Gravar metafield exige escopo de escrita (write_products ou escopo de metafield) —
     então o integrador precisa **espelhar `product_map` → metafield `custom.regiao`** (sync).
     Isso reabre a questão do `write_products` que a §8 dizia estar bloqueada — checar o escopo
     real do app "integrador Movegourmet".
5. **Melhor Envio** (já instalado) faz o frete por CEP; a Function é a camada de bloqueio por região.

### 10.2 Decisão do JG + verificação no admin (11/07)
**JG confirmou: checkout nativo do Shopify é pra ficar.** (Yampi fora — reconfirmado: aparece como
app legado "Não instalado" na página de apps personalizados.) Verificado manualmente no admin:

- **Plano: Grow** ($468/ano) — NÃO é Plus. As Cart & Checkout Validation Functions **não têm
  banner de "Plus only"** na doc (diferente das checkout UI extensions), e as fontes indicam que
  rodam em planos não-Plus — **muito provavelmente disponível no Grow, a confirmar num deploy real**
  (docs [cart-checkout-validation](https://shopify.dev/docs/api/functions/latest/cart-and-checkout-validation)).
- **Escopos do app "integrador Movegourmet" (consulta autoritativa via API, `oauth/access_scopes.json`):**
  `read_products, write_inventory, read_inventory, read_locations, read/write_merchant_managed_fulfillment_orders,
  read_orders`. **NÃO tem `write_products`.** (Cuidado: o admin mostra "Produtos: Editar ✓", mas isso é
  o `write_inventory` agrupado sob "Produtos" na visão grossa — a API confirma que write de produto
  NÃO existe.) A premissa original ("sem write_products") estava certa.

### 10.3 O blocker real da arquitetura nativa: metafield precisa de write_products
A Shopify Function é **WASM sem acesso a rede** → ela lê a região do produto de um **metafield**
(input da função). Gravar metafield de produto exige **`write_products`**, que o integrador **não
tem**. Então a arquitetura §10.1 pressupõe **adicionar `write_products` ao app** (mudança de escopo
+ re-consentimento da Fernanda; o app já teve escopos atualizados 1× em 02/07) e um job que espelha
`product_map → metafield custom.regiao`. Bônus: com write_products, a reconciliação também passa a
poder mudar título/tag/arquivar por API (hoje é manual/CSV).

**Caminho alternativo SEM write_products — Carrier Service (frete nativo):** um "shipping rate
provider" custom recebe itens + CEP de destino e devolve as tarifas; devolver **zero tarifas** pra
carrinho fora de região impede finalizar (mesma lógica que a API de Frete do Yampi, mas nativa, e o
endpoint É do integrador, então tem acesso a rede e lê o `product_map` direto — sem metafield/sem
write_products). ⚠️ Frete calculado por transportadora custom historicamente depende de plano
(Advanced+ ou add-on anual) — o Melhor Envio já usa isso, então a capacidade pode existir; **a
confirmar** se dá pra adicionar um carrier service próprio no plano Grow.

**Duas rotas de enforcement nativo, a decidir:** (a) **Validation Function** (precisa write_products
+ sync de metafield; bloqueia com mensagem clara) vs (b) **Carrier Service** (sem write_products, lê
Supabase direto; bloqueia por "sem frete"; depende de plano permitir carrier custom). Testar as duas
premissas antes de escolher.

### 10.4 Pendências de verificação (antes de desenhar)
- Deploy de teste de uma Validation Function no plano Grow → confirma disponibilidade.
- Confirmar se dá pra registrar Carrier Service próprio no plano Grow (rota alternativa).
- Escopo: decidir adicionar `write_products` ao app (destrava metafield + reconciliação por API).

### 10.3 Lição registrada
Duas análises minhas (checkout Yampi, e a arquitetura da API de Frete) foram construídas em cima de
**código do tema sem checar o estado de runtime**. O tema tem MUITO código morto de apps já
desinstalados (beae, pagefly, layouthub, ecomposer, yampi). **Regra: antes de concluir "a loja usa
X", confirmar no app store instalado + comportamento ao vivo, não só no código do tema.**

## 11. Relacionados
- Reconciliação de catálogo em andamento: [[project_movegourmet_reconciliacao]].
- Projeto guarda-chuva: [[project_move_gourmet]].
- Handoff da reconciliação: `RECONCILIACAO-CATALOGO-HANDOFF.md` (mesma pasta).
