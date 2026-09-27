---
titulo: Catálogo Regional por CEP (Move Gourmet) — Definições e Plano
data: 2026-07-11
atualizado: 2026-07-17
autor: Trívia Digital
status: EM PRODUÇÃO (go-live 17/07) — gate + filtro + fora-de-área + trava no checkout + barra de frete no ar e verificados. Ver §13.
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

### 10.5 EXECUÇÃO write_products (11/07, autorizada pelo JG) — ✅ CONCLUÍDO
Feito no Dev Dashboard (`dev.shopify.com/dashboard/173761009/apps/392324775937`): criada e ativada
a versão **`movegourmetv3-write-products`** adicionando `write_products` aos 7 escopos (aditivo, o
resto da config preservado: app_url=example.com, webhooks 2026-07, embedded).

**Pegadinha resolvida:** a nova versão NÃO re-concede sozinha — os escopos ficam presos ao que a
instalação aprovou. Como o app usa client_credentials e não tem redirect URL, não há tela de
"atualizar permissões" (só "Desinstalar" no menu). **Solução: o JG desinstalou + reinstalou o app**
(11/07). Confirmado via API: `access_scopes.json` agora inclui **write_products** ✅; escopos totais =
read/write_products, read/write_inventory, read_locations, read_orders, read/write_merchant_managed_fulfillment_orders.
Smoke test do token novo OK (lê produtos, shop=Move Gourmet) — Fluxo A/B saudável, reinstall não quebrou nada.

**Lição p/ o futuro (mudar escopo deste app):** editar escopos = nova versão no Dev Dashboard +
**desinstalar/reinstalar** na loja (breve gap no Fluxo A/B). Não há re-consent sem reinstalar.

**Destravou:** (1) rota **Function** agora é possível (gravar metafield `custom.regiao` por produto);
(2) a reconciliação de catálogo passa a poder mudar título/tag/arquivar **por API** (não só CSV/manual).

### 10.3 Lição registrada
Duas análises minhas (checkout Yampi, e a arquitetura da API de Frete) foram construídas em cima de
**código do tema sem checar o estado de runtime**. O tema tem MUITO código morto de apps já
desinstalados (beae, pagefly, layouthub, ecomposer, yampi). **Regra: antes de concluir "a loja usa
X", confirmar no app store instalado + comportamento ao vivo, não só no código do tema.**

## 10.6 TESTE DA ROTA FUNCTION (12/07) — VIÁVEL no plano Grow ✅ (elegibilidade)
Testado via Admin API (token do integrador) + admin da loja. Evidências:
- **Plano:** `shop.plan.displayName = "Shopify"` (marketing "Grow"), `shopifyPlus = false`.
- **`shopifyFunctions` (query) FUNCIONA** no plano não-Plus (retorna vazio — nenhuma function
  instalada ainda). Sem erro de plano.
- **`validations` (query) dá erro de ESCOPO, não de plano:** "Required access: `read_validations`
  access scope". Isso é a prova: se validation function fosse Plus-only, a API responderia erro de
  plano/feature, não de escopo. → o recurso existe neste plano; falta só o app ter os escopos de
  validation.
- **Loja no checkout MODERNO** (Settings > Checkout mostra "Configurações [Novo]" = Checkout
  Extensibility, não `checkout.liquid` legado) — pré-requisito das validation functions. ✅

**Conclusão:** a rota da Function é elegível no Grow. Falta, pra usar de fato:
1. Adicionar escopos **`read_validations` + `write_validations`** ao app (mesma dança: nova versão
   no Dev Dashboard + reinstalar na loja — breve gap no Fluxo A/B).
2. **Construir a validation function** (extensão do app, Wasm Rust/JS) no repo — tarefa de
   implementação spec'da, não hack de navegador. Lê `cart.lines.merchandise.product.metafield
   custom.regiao` + CEP de entrega; bloqueia se item fora de região. **Defensivo:** produto SEM
   metafield de região → nunca bloqueia (cliente real intacto).
3. **Deploy via Shopify CLI** — ⚠️ CLI NÃO está instalada nesta máquina e o Node é 25 (o CLI quer
   18/20/22); deploy de function precisa de auth interativa na org do Dev Dashboard (login por
   navegador). É o gargalo prático do deploy.
4. **Ativar** a validation (`validationCreate`) + testar com metafield de região num produto de
   teste (BA) e checkout com CEP de SP → esperar bloqueio; depois desativar.

**Nada foi deployado/ativado** (não há function instalada; risco de produção zero até aqui). O
próximo passo real é decidir construir a function como feature spec'da no repo (com a reinstalação
dos escopos de validation + resolver o ambiente de CLI/Node).

### 10.7 Escopos de validation (12/07) — ✅ CONCEDIDOS
Criada e ativada a versão **`movegourmetv4-validations`** no Dev Dashboard (+`read_validations`
+`write_validations`, aditivo). JG reinstalou o app → confirmado via `access_scopes.json`:
**read_validations + write_validations concedidos** ✅. Query `validations` que antes dava erro de
escopo **agora funciona** (0 validações ativas, sem erro) → API de validation plenamente acessível
no plano Grow. Smoke test OK (shop/produto/3 locations). Fluxo A/B saudável.

**Escopos finais do app (10):** read/write_products · read/write_inventory · read_locations ·
read_orders · read/write_merchant_managed_fulfillment_orders · read/write_validations.

**Rota Function agora 100% destravada do lado de permissões/plataforma.** Falta só a ENGENHARIA:
1. Escrever a validation function (extensão Wasm) — lê `cart.lines.merchandise.product.metafield
   custom.regiao` + CEP de entrega; erro (bloqueio) se item fora de região; defensiva (sem metafield
   = allow). No repo, como feature spec'da.
2. Deploy via Shopify CLI — ⚠️ gargalo: CLI ausente + Node 25 (quer 18/20/22) + auth interativa na
   org. Precisa de ambiente adequado.
3. `validationCreate` referenciando a function + testar com produto de teste (região BA) e checkout
   CEP SP → esperar bloqueio; depois desativar.
4. Job de sync `product_map → metafield custom.regiao` (usa o write_products já concedido).

## 10.8 EPIC ABERTA NO REPO (12/07)
Feature spec'da e commitada (7737831): **`specs/0009-catalogo-regional-cep/`** no repo
`integradormovegourmet` (product/domain/design/spec/tasks — 11 AC, 12 stories). É a fonte da verdade
de implementação daqui pra frente; este doc do vault vira o registro de decisão/validação de
plataforma. Também no repo: `docs/ROADMAP.md` (Fase 4 / epic 0009) + 6 termos novos no `docs/glossary.md`.
Próximo passo de execução: começar por S1 (modelo de região + domínio) — não depende de bloqueio; os
bloqueios (Move classificar, CLI/Node p/ Function, mockup, acesso ao tema) estão marcados 🔒 no `tasks.md`.

## 12. IMPLEMENTAÇÃO + MERGE EM PROD (13/07)
Implementadas e **mergeadas** (origin/main `3791c0c`, CI verde, migrations aplicadas), cada uma com
verificação adversarial multiagente. **5 das 12 EM PRODUÇÃO** + **S9 e S12 com código** (shadow, deploy 🔒):
- **S1** modelo de região — migration `product_map.regioes` + domínio puro `regiaoDeCep`/`produtoVisivelPara`.
- **S3+S4** metafield `custom.regiao` — definição idempotente + job de sync `product_map → metafield` (shadow).
- **S5** App Proxy `catalogo-regiao` — `GET ?cep=` → produtos visíveis; + coluna `shopify_handle` + backfill.
- **S10** gestão no painel — coluna Região (chips/lote, só operador) + edge `painel-op-regiao` com
  auditoria. Mockup aprovado pelo JG + e2e ao vivo no painel demo.
- **S9** Validation Function de checkout (**"o pilar"** — trava-dura que impede finalizar a compra de item
  fora da área): caso de uso puro `validar-carrinho-regiao` (reusa o MESMO domínio, INV-4 por REUSO — sem
  port Rust; SPEC_DEVIATION registrado) + extensão `validacao-regiao` (adaptador, graphql sem PII,
  README-runbook de deploy/ativação/kill-switch). Código + 16 testes; **deploy 🔒** (Shopify CLI, S0).
- **S12** flag `REGIONAL_CATALOG_V1` (master kill-switch da vitrine, default `off`=dark) + runbook
  operacional `runbooks/catalogo-regional.md` (desligar cada trava, reclassificar, cobertura, rollout).
- **S11** roteiro e2e (`specs/0009-*/e2e-roteiro.md`, por AC + adversarial ADV-1..8) + **revisão
  adversarial de completude** do epic (workflow 4 lentes, 11 achados, 1 confirmado). Fechou 2 lacunas de
  teste: o adaptador da Function não tinha teste (estava fora do glob do vitest) → +10 testes; e o teste
  da assinatura do App Proxy era tautológico → +2 vetores de resposta conhecida. Go-live registrado no
  runbook: agendar `sync-regiao` como cron; classificar todas as variantes de um produto.

Revisão de merge (deploy-safety/segurança/regressão): regressão limpa; 2 achados corrigidos antes de
subir — `catalogo-regiao` passou a exigir **assinatura do App Proxy** (fail-closed) + memoização
anti-DoS; `painel-estoque` com fallback na janela de deploy. CI destravado corrigindo a `audit-esteira`.

**S2 classificação — DECISÃO DO JG (13/07): regra de estoque.** Minha análise técnica dizia que estoque
não serve (Salvador é a fábrica; classificar por estoque esconde industrializados nacionais de SP/Brasil)
e recomendei natureza do produto. **O JG optou pela regra de estoque assim mesmo: `NACIONAL` só com saldo
nos 2 CDs; só Salvador→BA; só SP→SP; zero→BA.** Aplicada sobre o estoque real por CD; 6 produtos
multi-variante harmonizados. **Resultado: ~15 NACIONAL / ~62 BA / ~5 SP.** ⚠️ ~62/82 viraram BA — a **Nat
PRECISA confirmar** antes do go-live (senão a maioria some de SP/nacional). Detalhe: bloco "DECISÃO 13/07"
em `docs/reconciliacao-catalogo/classificacao-regiao-proposta.md`.

### 12.1 ROLLOUT EXECUTADO (13/07 tarde) — tudo INERTE, nada customer-facing

- **Metafields sincronizados** (`sync-regiao --exec`): 67 produtos, 0 conflitos/erros; leitura confirmada.
- **e2e adversarial** (Workflow 21 agentes): 7 confirmados. Núcleo 100%. 2 ALTOS = decisão de produto
  (gate CEP × CEP de entrega do checkout; metafield product-level não representa por-variante). 2 médios
  de tema corrigidos (buracos na grade, carrossel). **Function 6/6 no runtime Wasm real** + 227 testes.
- **DEPLOY FEITO** no app **`integrador Movegourmet`** (Dev Dashboard; reusou o app do integrador — `config
  link` preservou os escopos do Fluxo A/B): **versão `-6` LIVE = Function `validacao-regiao` (INATIVA) +
  App Proxy `/apps/catalogo-regiao`.** Fluxo A/B intacto pós-deploy. Extensão reestruturada pro build
  oficial (`@shopify/shopify_function@2`), reusa o domínio (INV-4).
- **Tema v3** (zip `...FINAL-v3...`, reimportado como rascunho id `163727442156`): fixes do e2e + **Opção 2**
  (aviso de disponibilidade no gate/PDP) + **Opção 3** (CEP vira atributo do carrinho `mg_cep`). **TESTADO
  AO VIVO no preview do rascunho — gate, filtro BA×SP, PDP (bloqueio + aviso), atributo de carrinho: TUDO
  PASSOU, 0 erros no console.** Yampi já tinha sido removido; toggle default OFF.
- **Checkout UI Extension `mg-preencher-cep`** (Preact, auto-fill do CEP no checkout + banner de mismatch):
  construída, API validada campo a campo nos tipos 2026-04, **deploy `--no-release` → versão `-7` STAGED
  (não liberada).** Inerte até o tema regional ir ao ar (só age com `mg_cep`); teste e2e real só no go-live.

**🔒 GO-LIVE SEGURADO** — passo-a-passo (quem roda o quê, comandos, kill-switches) no runbook
`runbooks/catalogo-regional.md` (seção "GO-LIVE"). Ordem: Nat confirma classificação → publicar tema v3 →
ativar Function → liberar `-7` → (opcional) edge no Supabase. **NÃO ativar a Function antes do tema
publicado** (a loja ao vivo mostra tudo e o checkout barraria sem aviso ao cliente). Fonte viva: bloco
"0009 ROLLOUT" em `docs/STATE.md`. **Rotacionar** token de automação `atkn_...37e` + `sbp_`/`nfp_`/Omie.

## 13. GO-LIVE E MELHORIAS (17/07) — EM PRODUÇÃO

Do "aplicar a classificação" ao catálogo regional inteiro no ar, tudo verificado ao vivo em `movegourmet.com.br`.

### 13.1 Classificação aplicada
- Nat/Fernanda devolveram a planilha. Régua do JG: "tudo que tem em SP também tem na BA" e **desmarcar NACIONAL por ora** (só entregam Salvador/BA e São Paulo).
- Planilha gerada só com **ativos+rascunho COM SKU (62 produtos)**, 3 colunas BA/SP/NACIONAL. Entregue em `~/Downloads/MoveGourmet-classificacao-regiao-Nat-Fernanda.xlsx`.
- Gravado em `product_map.regioes` + metafield `custom.regiao` (via `sync-regiao --exec`), verificado ao vivo: **23 BA+SP · 36 BA · 0 NACIONAL**.
- Pegadinha resolvida: alinhei 9 variantes-unidade que conflitavam com o SKU do kit (metafield é product-level; sync recusa variantes divergentes).
- **Dois "ativo" diferentes:** status do Shopify ≠ `product_map.ativo`. **Empada de Bacalhau e Suco de uva** estavam descontinuados no integrador mas ativos no site; JG mandou **reativar** (voltaram como BA).

### 13.2 Limpeza de catálogo
- **14 produtos ativos SEM SKU arquivados** (via `productUpdate status:ARCHIVED`, temos write_products): 5 duplicatas/sazonais (Torta Frango Redonda 1,8kg = dup de PRD00080; Quiche 4 Queijos Damascos 1,9kg = dup de PRD00614; Torta Chiffon "-" = dup de PRD00910/PRD01178; Torta Baunilha FV + Natalina) + 7 embalagens/caixas + 2 add-ons de app (Gift Wrapping, Shipping Protection). Achado: as versões G/redonda boas já existiam com SKU; as sem-SKU eram só duplicata de catálogo.

### 13.3 Go-live (as 3 camadas ligadas)
- **Validation Function** ativada: `validationCreate functionHandle:"validacao-regiao", enable:true, blockOnFailure:false` (fail-open) → validation id `131334380`. Trava-dura do checkout no ar.
- **Flag `REGIONAL_CATALOG_V1=on`** no Supabase (Management API; project ref `lygxygsjxbpfqujvydxf`). ⚠️ Token `sbp_f515…d058` exposto no chat → **ROTACIONAR**.
- **Bug de handles corrigido** (o e2e pegou): App Proxy devolvia handle antigo ≠ handle vivo → escondia produto de BA da própria BA. Rodei `backfill-handle-shopify --exec` (78) + corrigi 8 por variant/sku vivo.
- **Verificação confiável = teste de FALSO-POSITIVO** (paginação/carrossel só escondem, nunca mostram a mais): cliente SP com **0 produtos só-BA visíveis** → filtro correto. App Proxy: BA 69 / SP 23 / Rio(NACIONAL) 0.

### 13.4 Tema v4 (2 melhorias + a barra de frete)
Publicado por **reimport** do export `~/Downloads/movegourmet-catalogo-regional-FINAL-v3-13jul2026/` (zip `movegourmet-tema-v4-17jul2026.zip`).
- **Barra de frete grátis** no carrinho (`sections/main-cart-items.liquid`): Liquid dentro do `.js-contents` → recalcula sozinho no re-render do Dawn (sem JS de cálculo). "Faltam R$ X para frete grátis" + barra + verde "Você garantiu o frete grátis" ao passar de R$220. Valor editável (setting `frete_gratis_valor`, default 220). **R$220 vale BA e SP** (confirmado JG; tarifa Shopify "Entrega Move Gourmet · Grátis a partir de R$220" nas 2 zonas).
- **Mensagem de fora de área** (`assets/mg-regiao.js`+`.css`): região sem catálogo (ex.: NACIONAL) mostra "Ainda não entregamos na sua região" no lugar da grade vazia. **Melhoria 17/07:** esconde também contador/ordenação/paginação/filtros (`.section-grade-move5.mg-empty-region`), reverte quando há produtos.

### 13.5 PEGADINHA DO REIMPORT (lição)
Reimport reverte o `settings_data.json` para o do export. O primeiro reimport **derrubou a feature** (os toggles `mg_regional_enabled`/`mg_use_app_proxy` voltaram ao default OFF de 13/07). JG religou no editor. **Corrigi os defaults dos 2 para `true` no export** (`config/settings_schema.json`), então reimports futuros já sobem ligados. **Lição: reimport de tema reverte settings pós-export; sempre checar/religar toggles depois, ou corrigir defaults antes.** Para iterar sem essa dor, a opção de adicionar `read/write_themes` ao app (eu publico direto + verifico, sem reimport) segue de pé.

### 13.6 Verificação final ao vivo (tudo OK)
Gate obrigatório abre sem CEP · SP: 0 falsos-positivos + tem produtos SP · Rio: só o recado de fora de área (contador/paginação escondidos) · BA: tudo volta ao normal · barra de frete recalcula sozinha e vira verde ≥R$220.

### 13.7 Pendências
- **Rotacionar** `sbp_f515…d058` (+ `atkn_…37e`, `nfp_`, Omie da reconciliação).
- **7 produtos ACTIVE mas NÃO publicados no Online Store** (PDP 404): pão de parmesão, empada de frango, empada de bacalhau, brownie 8un, bem casado red, torta de costela G, torta de frango G. Decidir com a Move: publicar ou não.
- Comunicado à Fernanda enviado (resumo do go-live).

## 14. VERIFICAÇÃO PRÉ-DIVULGAÇÃO + PLANILHAS + FULFILLMENT (18/07)

### 14.1 Teste de checkout ao vivo (o que faltava provar end-to-end)
Antes da Move divulgar, testei a jornada real no checkout nativo (sem finalizar pagamento):
- **Produto BA + endereço de Salvador → LIBERA:** aparece "Forma de frete: Entrega Move Gourmet R$ 25,00"
  e chega no pagamento. A trava NÃO barra pedido válido da região.
- **Mesmo produto + endereço de São Paulo → BLOQUEIA:** "O produto em seu carrinho não está disponível
  para entrega em seu local." Como SP tem zona de frete própria, o bloqueio é da Validation Function, não
  falta de frete. **Trava do checkout funciona nos dois sentidos.**
- **Mobile:** gate + filtro + barra de frete OK no 375px. **Zero erros de console.**

### 14.2 Auditoria de dados (workflow 4 agentes)
- **Vitrine navegável LIMPA:** 0 produtos ACTIVE+publicados sem `custom.regiao` (ligar o filtro não some
  nenhum produto navegável). Metafields batem 100% com o `product_map`. Config da trava saudável
  (`enabled:true`, `fail-open`).
- **Achados abertos (decisão da Move, não travam):** (a) **7 produtos ACTIVE mas NÃO publicados no Online
  Store** (PDP 404, invisíveis no site): pão de queijo parmesão, bem casado red, empada frango, empada
  bacalhau, brownie 8un, torta costela G, torta frango G; (b) **~1.361 linhas `product_map` NACIONAL** só
  do Omie (sem handle/variant → fora da vitrine; higiene antes de ligar ao Shopify); (c) **8 brindes de
  Páscoa UNLISTED sem região** — a lógica defensiva (sem metafield = nunca bloqueia) já cobre.

### 14.3 Planilhas entregues à Move
- `~/Downloads/MoveGourmet-catalogo-completo-17jul2026.xlsx` — 108 produtos (ativos/rascunho/não
  listado/arquivado) com região, preço, estoque total, publicado, handle.
- `~/Downloads/MoveGourmet-estoque-por-CD-17jul2026.xlsx` — 136 SKUs com estoque físico por local
  (Salvador / São Paulo / Shopping Barra), total, região e coluna **"Sob encomenda"** (CONTINUE vende a
  zero; DENY para). Achado: 22 SKUs ativos em 0 no Salvador que PARAM a zero = efetivamente indisponíveis.

### 14.4 CORREÇÃO sobre fulfillment por CD (importante)
Eu havia dito "SP não expede" com base em `Location.shipsInventory=false`. **`shipsInventory` é campo
DEPRECIADO** — a doc do Shopify diz "todos os locais com endereço válido já podem expedir". O que vale é
`fulfillsOnlineOrders`, que **já está `true` nos 3 locais**, inclusive SP (Rua Dr João Toniolo). Ou seja,
**o CD de SP já está apto a expedir pedidos online** — não há botão de "ligar" a fazer no nível do local.
Que um pedido de SP saia de SP depende da **roteirização** (SP ter o estoque do item + prioridade de
local), que é admin-side; o app do integrador só tem `read_locations` (sem escrita). Recomendado: fazer um
pedido-teste com endereço de SP e ver em Pedidos qual local o Shopify atribuiu; se vier Salvador, acertar a
prioridade de locais no admin.

### 14.5 Pendências
- **Rotacionar** `sbp_f515…d058` (usado pra ligar a flag) + `atkn_…37e`, `nfp_`, Omie.
- Move decide os **7 não publicados**; (opcional) limpar as linhas NACIONAL Omie-only e acertar prioridade
  de local pro SP.

## 15. AJUSTE "SÓ BA E SP" NO GATE + CONTAGEM NO OMIE (20/07) — verificado ao vivo

### 15.1 Gate do tema: fora de área agora bloqueia claro (não "Nacional" silencioso)
A Fernanda testou Curitiba e o site "logava normal" — o CEP fora de área virava NACIONAL, o gate
fechava e a pessoa via os produtos sem região (parecia site quebrado). Corrigido em `mg-regiao.js` +
`mg-cep-gate.liquid` (agora versionados no repo em `theme/catalogo-regional/`):
- CEP fora de BA/SP → 2º passo do gate: **"Ainda não entregamos na sua região"** com **"Tentar outro
  CEP"** (não grava, gate reabre) ou **"Ver o site mesmo assim"** (grava `NACIONAL`, mostra o
  **catálogo completo** e a entrega segue barrada no checkout). Pílula rotula "fora da área".
- Publicado (zip `~/Downloads/movegourmet-catalogo-regional-FINAL-v4-20jul2026.zip`). Diff vs tema
  17/07 = **só os 2 arquivos do gate** — sem regressão de frete grátis/settings.
- **Testado ao vivo (Claude no navegador):** gate 7/7 cenários + checkout e2e (produto BA + CEP
  Curitiba → BLOQUEIA "produto não disponível para entrega no seu local"; + CEP Salvador → LIBERA,
  frete R$25). Validation id `131334380` `enabled:true` confirmado.

### 15.2 Contagem física 13/07 lançada no Omie (integrador passou a ESCREVER no Omie)
Antes o integrador só lia o Omie. Passo novo: `POST estoque/ajuste/` → `IncluirAjusteEstoque` com
`tipo:"SLD"` (saldo ABSOLUTO por CD; sem idempotência → conferir por releitura). Casar nome↔SKU pelo
`product_map`, restrito aos SKUs do Shopify. Aplicados em Salvador: 22 confirmados + Coxinha Fumeiro
C/8 (=26, resolveu o conflito C/4×C/8 usando o pacote do site) + 2 tortas ambíguas resolvidas pro
produto PUBLICADO (Torta Retangular de Costela=1, Mini Torta de Frango=2). Itens urgentes empurrados
direto no Shopify (`inventorySetQuantities`) → **Bem Casado Red e Coxinha Fumeiro ficaram disponíveis
no site**. Receita completa no runbook `catalogo-regional.md` §D.

### 15.3 Achado: PDF/Omie têm SKUs de BISTRÔ que não estão no site
Explica por que a maioria dos 120 itens do PDF não batia. Comparativo passou a restringir aos 87 SKUs
do Shopify. Planilha "para preencher" com a Fernanda: `~/Downloads/MoveGourmet_contagem_13jul_para_preencher.xlsx`.
Fica com a Move (grupo WhatsApp "Shopify-Omie Movegourmet"): ~91 itens sem SKU + 17 produtos sem foto
(14 ativos+publicados aparecem sem imagem) + 6 produtos citados que não existem no site.

### 15.4 Handoff ao time da Move (20/07) — FEITO
No grupo WhatsApp explicamos: como o sistema funciona (site segue o Omie por SKU; contagem física no
Omie = fonte da verdade), as responsabilidades deles e o **como proceder**. Entregue a planilha-mãe
`~/Downloads/MoveGourmet_catalogo_completo_Shopify_Omie_20jul2026.xlsx` (1 linha/produto: status,
publicado, foto, SKU, estoque Shopify E Omie por CD lado a lado, situação no Omie colorida, ação
sugerida + aba Resumo). **Placar que virou gestão da Move:** 17 sem foto · 5 ativos não publicados ·
36 SKU não vinculado no Omie · 15 publicados+ativos sem estoque. Instrução dada: vincular o SKU do Omie
no campo SKU do Shopify (vermelhos) → fotos → publicar o que estiver pronto. **Nossa entrega fechou**
(feature no ar + verificada + lista + passo-a-passo); daqui é operação/cadastro deles.

## 11. Relacionados
- Feature/spec no repo: `specs/0009-catalogo-regional-cep/` (Trivia-Growth/integradormovegourmet).
- Reconciliação de catálogo em andamento: [[project_movegourmet_reconciliacao]].
- Projeto guarda-chuva: [[project_move_gourmet]].
- Handoff da reconciliação: `RECONCILIACAO-CATALOGO-HANDOFF.md` (mesma pasta).
