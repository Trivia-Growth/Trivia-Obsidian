---
tags:
  - move-gourmet
  - shopify
  - omie
  - achado
  - sku
  - bloqueador
cliente: Move Gourmet
data: 2026-07-02
status: aberto
prioridade: crítica
---

# Achado crítico — SKUs do Shopify não batem com o Omie

> Levantado em 02/07/2026 por cruzamento automático entre o catálogo do Shopify e o do Omie
> (via API dos dois sistemas). É **pré-requisito** para qualquer sincronização de estoque
> funcionar — com o integrador novo ou com o próprio Omie.Hub. Ver
> [[Integrador Estoque Multi-CD - Especificação Técnica - Jul 2026]] e
> [[Omie - Mapeamento Estoque - Jul 2026]].

---

## 🔄 Atualização 03/07 — a extração do Hub muda o diagnóstico

JG puxou no Omie.Hub a aba **Meus Catálogos → Produtos**: são **50 produtos** que o Hub gerencia
(não 1.432). Extraí os 50 (SKU + nome) e cruzei com o Omie e com o Shopify. Dois resultados:

**Boa notícia:** os **50 SKUs do Hub existem 100% no Omie** (inclusive o `MINTPRD00522`, que é o
`PRD00522` com prefixo do Mintegra). Ou seja, o **universo real a sincronizar são ~50 produtos**,
e o lado Omie está limpo. Não precisamos casar 1.432 itens.

**Notícia ruim (estrutural):** o catálogo do **Shopify é montado de forma diferente do Omie** — e
por isso **não dá para reconstruir o de-para automaticamente**, nem por SKU, nem por nome:

1. **Nomes não batem.** O site usa nome comercial ("Ovo de Páscoa de Chocolate recheado de
   brigadeiro meio amargo… 240g"), o Omie usa nome interno ("OVO PASCOA 240G / brigadeiro meio
   amargo…"). Só 9/50 casam por nome — coincidência.
2. **Cardinalidade N:1 e 1:N.** Ex.: os **3 sabores de Kombucha** (3 SKUs Omie) são **1 produto
   Shopify** ("GARRAFA KOMBUCHA - 280 ML") com **3 variantes** (sabor), todas **sem SKU**. Já as 6
   trufas viram 1 produto com 6 variantes — nesse caso as variantes até carregam os PRD, mas o
   mesmo `PRD00522` aparece em **3 produtos diferentes** (duplicado/errado).
3. **Conversão de unidade (o mais sério).** O Omie controla por unidade ("PMUND PASTEL DE FRANGO
   ORGANICO **65G**"), o Shopify vende em pacote ("Pastel de Frango Orgânico – **6 un. 390g**").
   Uma venda de 1 pacote no site = **6 unidades** baixadas no Omie. Prefixos Omie **PMUND**
   (unidade) x **PMCX** (caixa) codificam isso. Logo o estoque **não é cópia 1:1** — precisa de um
   **fator de conversão** por produto, e **composição (BOM)** para os kits/cestas.

**Conclusão:** copiar o `on_hand` do Omie direto pro Shopify por SKU **não é suficiente** para uma
boa parte do catálogo. O de-para correto (qual variante Shopify = qual SKU Omie, com fator/kit) **já
existe dentro do Hub** — foi a intuição do JG ("os SKUs do Shopify estão no Hub"). O caminho certo é
**extrair o mapeamento do próprio Hub**, não reconstruí-lo por fora.

**Próximo passo de extração (em aberto):** a lista "Meus Produtos" mostra só o lado Omie. Falta a
ligação com a variante do Shopify + o fator. Para pegar isso limpo: (a) conectar a extensão
Claude-no-Chrome e ler a API/telas do Hub (aba **Publicados** / detalhe do produto / resposta de
rede), ou (b) um **export** do Hub, ou (c) o de-para manual da Nat produto a produto. Enquanto isso
não sai, o `--exec` do integrador não roda de verdade.

> **O que muda no design do integrador:** o `product_map` não pode ser `sku → inventoryItem` puro.
> Precisa de **`shopify_variant_id` no nível da variante**, um **`fator`** (unidades Omie por
> unidade vendida no Shopify) e marcação de **kit/BOM**. Registrar como refinamento do épico 0003.

### Verificação dentro do Hub (03/07, tarde) — diagnóstico definitivo

Entrei no Hub (mintegra) via extensão do Chrome e inspecionei os dados por dentro (endpoints
`getProdutosPublicados`, `getVariacoesProdutoLojaByProdutoId`, e o `$scope` do AngularJS). Conclusão
**verificada dos dois lados**:

1. **O registro de produto do Hub NÃO guarda nenhum ID do Shopify.** Os campos são `id` (id interno
   do Hub), `id_sku` (= SKU Omie, ex. `PRD01124`), `id_produto_erp` (id Omie) e `id_catalogo`. Não
   há `shopify_variant_id`, `id_anuncio` nem `gid`. **O Hub casa com o Shopify PELO SKU** — publica
   o produto e o encontra pelo código. Igualzinho ao que o nosso integrador faria.
2. **Não existe tabela de-para mágica dentro do Hub.** A intuição "os SKUs do Shopify estão no Hub"
   se traduz em: o Hub tem os **SKUs corretos do Omie** (os 50) e os nomes internos — isso é ouro
   como fonte autoritativa. Mas ele **não tem** a ligação com a variante real do Shopify.
3. **O outro lado bate:** procurei no Shopify os SKUs que o Hub diz ter publicado (`PRD01124`,
   `PRD00894`, `PRD00817`, `KBML280`, `PRD00681`) → **nenhum existe na loja**. O produto real é
   "Crostini de Parmesão 1un 50g" (nome comercial, **sku vazio**). Ou seja: o Hub marca
   `fg_publicado=1`, mas os produtos que o cliente realmente vende no site foram criados **à mão, em
   paralelo, sem o SKU**. **É por isso que o estoque nunca sincronizou — nem pelo Hub.**

### Virada estratégica (a vantagem de ter integrador próprio)

Como o Hub é preso a casar por SKU, ele **depende** do cliente preencher os SKUs no Shopify. **O
nosso integrador não precisa disso.** O `product_map` pode guardar **`SKU Omie → variante Shopify
(inventoryItemId)` explicitamente**, ignorando o campo SKU do Shopify. Montamos esse de-para **uma
vez** (com confirmação humana da Nat) e o sync roda — **sem exigir a limpeza dos 97 SKUs** do
cliente. A limpeza do catálogo continua boa de fazer (higiene), mas **deixa de ser bloqueio** para o
estoque.

**Próximo passo proposto:** gerar um **de-para proposto** (os ~50 SKUs Omie → variante Shopify +
`fator` derivado do tamanho/pacote), com nível de confiança por linha, para a Nat confirmar os não
óbvios. Com o de-para confirmado carregado no `product_map`, o Fluxo A roda de verdade.

### Planilha gerada para a Nat (03/07) ✅
Arquivo: **`Move Gourmet - De-Para Omie x Shopify (para Nat).xlsx`** (nesta pasta). 4 abas: Leia-me,
1. DE-PARA (revisar), 2. Catálogo Shopify completo (124 variantes, com REF, SKU atual e estoque por
location), 3. Catálogo Omie (50, com saldo Salvador/SP). A Nat trabalha só no Excel, sem exportar
nada. Placar do palpite automático (matcher por raridade de termo + tamanho/pacote + colisão):
**30 confiança ALTA** (1 por SKU que já bate + 29), **3 MÉDIA**, **10 REVISAR (colisão real** — a
mesma variante caiu em 2 SKUs, ex.: ovos 120g×240g, grana padano terrine×pão de queijo), **7 KIT**
(à parte). O `fator` já sai calculado (ex.: empada 76g→pacote 6un = fator 6). Fonte dos dados:
`src/interfaces/cli/montar-planilha-nat.ts` (repo) + gerador xlsx no scratchpad da sessão.

---

## O que foi encontrado (levantamento original 02/07 — mantido por histórico)

Cruzando as **124 variantes** de produto do Shopify com os **1.432 códigos** do Omie:

| Situação | Quantidade | % |
|---|---|---|
| Variantes **sem SKU nenhum** | **97** | 78% |
| Variantes **com SKU, mas que NÃO bate** com o Omie | 18 | 15% |
| Variantes com SKU que **casa** com o Omie | 9 | 7% |
| **Total** | 124 | 100% |

Ou seja: hoje **só 9 de 124 produtos** têm como ser identificados automaticamente entre Shopify
e Omie. Os outros 115 não têm ligação possível.

## Por que isso bloqueia tudo

Toda integração de estoque casa o produto **pelo SKU** (o código do produto). É o SKU que diz
"este produto no Shopify é este produto no Omie". Sem o SKU batendo:

- O integrador não consegue saber de qual produto do Omie puxar o saldo para cada produto do site.
- **Isto provavelmente é a raiz de por que a integração via Omie.Hub nunca funcionou direito** —
  não é só o problema de multi-depósito; o casamento de produto está quebrado na base.
- Não adianta configurar depósito, frete ou automação enquanto o catálogo não estiver casado.

## O que precisa ser feito (ação da Move Gourmet)

**Preencher o campo SKU de cada produto/variante no Shopify com o mesmo código do produto no
Omie (o campo `código`).** Além disso, dois ajustes de dados:

1. **Corrigir SKU duplicado:** o código `PRD00522` está hoje em **3 produtos diferentes** no
   Shopify (ver lista). Cada produto precisa de um SKU **único**, igual ao do Omie.
2. **Limpar produtos de teste/duplicados:** há vários "(Cópia)", "(Plano anual via pix)",
   "Produto teste", "pqlteste", "Brownie ... 2" no catálogo. Esses devem ser **excluídos ou
   arquivados**, não recebem SKU. (Já era uma pendência conhecida de limpeza de catálogo.)

> **Sobre Kits e Cestas** (Kit Sabores, Cesta Presente, etc.): ~~são combos; no Omie kit dá baixa
> por componente; estoque derivado~~ — **CORRIGIDO na verificação de 03/07 (ver abaixo)**: na conta
> da Move eles NÃO são kit-agregador; são **produtos fabricados com malha de produção e saldo
> próprio**. Sincronizam como produto simples (empurra o saldo próprio). Detalhe na subseção
> "Verificação dos kits no Omie".

### Verificação dos kits no Omie (03/07) — via API `ConsultarEstrutura` + `ConsultarProduto`
O Omie tem 2 modelos de combo com estoque OPOSTO: (a) **kit-agregador** (`componentes_kit`, sem saldo
próprio, baixa nos componentes ao faturar — é o que a [doc de KIT](https://ajuda.omie.com.br/pt-BR/articles/5729317-elaborando-e-faturando-o-kit-de-produtos)
descreve); (b) **produto fabricado com malha** (`ConsultarEstrutura`, tem saldo próprio, baixa no
próprio produto; os componentes são consumidos na PRODUÇÃO). **A Move usa o (b):**
- `componentes_kit` **vazio** nos 9 kits/cestas → não são kit-agregador.
- Têm **malha de produção**: KIT EXPERIMENTAÇÃO 9 componentes, KIT DOCE VIDA 7, CESTA ORGANIZE 10.
  Até o "simples" Crostini é fabricado (batata/azeite/queijo/polvilho).
- `tipoItem` = **03 (em processo) / 04 (acabado)** → itens fabricados, não revenda.
- **Saldo próprio** no `ListarPosEstoque` (KIT SABORES = 48 em Salvador; todos SP=0, montados só lá).

**Consequência p/ o integrador:** kit/cesta **sincroniza como produto simples** (empurra o saldo
próprio do kit) — **sem BOM do nosso lado**. Some a ressalva "tratar por componente".

**Risco a vigiar (processo no Omie, não código):** o saldo do kit só é fiel se a Move **registra a
ordem de produção** ao montar. Se não registrar: (1) saldo do kit não sobe e zera no site com kit
físico; (2) componentes que também são vendidos avulsos (ex.: SUCO DE UVA dentro da CESTA ORGANIZE)
podem ficar disponíveis em dobro → risco de vender a mais. Confirmar com Fernanda/Nat se lançam
produção. Endpoints usados: `geral/malha/ConsultarEstrutura`, `geral/produtos/ConsultarProduto`.

## Listas concretas (worklist)

### A. Já têm SKU que casa (9) — conferir os suspeitos
```
10          Pão de Parmesão - 1un. 570g            (⚠️ SKU "10" é genérico, confirmar se é o certo)
PRD00514    Trufa Choc 50% C/ Brigadeiro Meio Amargo 22g
PRD00519    Trufa Branca C/ Doce de Leite 22g
PRD00523    Trufa Choc 70% C/ Brigadeiro Meio Amargo 22g
PRD00527    Trufa Choc 70% C/ Doce de Leite 22g
PRD00529    Trufa Branca C/ Brigadeiro Meio Amargo 22g
PRD00522    Trufa Choc 50% C/ Doce de Leite 22g     ← este SKU está DUPLICADO
PRD00522    Trufa de Chocolate 50% ... Doce de Leite 22g   ← duplicado
PRD00522    Brigadeiro de Pistache - 20un 20g       ← duplicado (produto diferente!)
```

### B. Têm SKU, mas o código NÃO existe no Omie (18) — corrigir o SKU
```
mqf240   Mini Quiche de Fumeiro – 2 un. 240g
mqf      Mini Quiche de Fumeiro – 2 un. 240g (Cópia)          ← produto de teste, excluir
mbl150   Mini Bolo de Laranja com Calda de Laranja – 2 un. 150g
mqf240   Mini Quiche de Fumeiro – 2 un. 240g (Plano anual via pix)  ← duplicado, excluir
mtf      Mini Torta de Frango - 2un. 240g
pmf      Pão Move de Fumeiro - 2un. 340g
mbc70    Mini Bolo de Chocolate 50% Cacau - 2un 168g
mbdl     Mini Bolo de Doce de Leite Zero Lactose - 2un. 168g
pql      Pão de Queijo - 16un 360g
tc-1..tc-6   Trufa de Chocolate - 4un 88g (6 variações)
pqlteste Pão de Queijo Zero Lactose - 16un 360g              ← teste, excluir
mpmf     Mini Pão Move Fumeiro - 6un. 360g
mpmfa    Mini Pão Move Frango - 6un. 360g
```
> Esses usam códigos curtos internos (mqf240, tc-1) que não existem no Omie. Trocar pelo código
> do Omie correspondente a cada produto.

### C. Sem SKU nenhum (97) — preencher. Amostra dos principais:
```
Coxinha de Frango Orgânico – 8 un. 312g       Empada de Frango Orgânico – 6 un. 426g
Brownie – 4 un. 135g                          Empada de Bacalhau Português – 6 un. 456g
Pão Move de Frango - 2un 340g                 Pastel de Frango Orgânico – 6 un. 390g
Coxinha de Fumeiro – 8 un. 312g               Pastel de Bacalhau Português – 6 un. 390g
Mini Quiche de Quatro Queijos - 2un 240g      Crostini de Parmesão 1un 50g
Suco de uva integral - 1un 250ml              Garrafa Kombucha 280ml (3 sabores)
Quiche de Fumeiro c/ Banana da Terra 1,8kg    Torta de Terrine e Grana Padano 1,2kg
Torta de Frango Orgânico Redonda 1,8kg        Quiche 4 Queijos com Damascos 1,9kg
Torta Retangular de Bacalhau 1,3kg            Torta Chiffon de Nozes 15cm
Kits e Cestas (Doce Vida, Sabores, Movimente, etc.) — tratar à parte
Produtos "teste"/"(Cópia)"/"(Plano anual via pix)" — excluir, não preencher
```
São 97 no total. A lista completa (todos os 97 nomes) pode ser exportada em planilha se ajudar a
Nat a trabalhar item a item.

## Como preencher o SKU no Shopify (passo a passo)

1. No admin do Shopify, **Produtos** → abra o produto.
2. Na seção da variante (ou do produto, se não tiver variação), campo **SKU (unidade de manutenção
   de estoque)**.
3. Digite o **código do produto no Omie** (o mesmo `código` que aparece no cadastro do produto no
   Omie). Salvar.
4. Repetir para cada produto. Para produtos com variações (ex.: Trufas, Kombucha), cada variação
   recebe o SKU da sua variação no Omie.

## Como validamos (é medível)

Depois da correção, é só a gente **rodar o cruzamento de novo** (comando `cruzar-sku` do
integrador). Ele mostra na hora quantos passaram a casar. A meta é chegar perto de 100% dos
produtos vendáveis (tirando kits e itens de teste). Hoje: **9/124**.

## Situação técnica (nosso lado)

- O integrador e a leitura dos dois catálogos **já funcionam** (provado ponta a ponta: Omie real
  → banco → Shopify real). O código não é o bloqueio.
- O `product_map` no banco já guardou os **9 que casam**, com os IDs do Shopify.
- **O bloqueio real agora é dado, não código:** a arrumação dos SKUs no Shopify. É trabalho do
  time da Move (quem conhece cada produto e o código dele no Omie).

---

## Texto pronto para enviar à Fernanda / Nat

> Oi Fernanda, tudo bem? Fizemos uma checagem automática cruzando o catálogo do site (Shopify) com
> o do Omie e encontramos a causa de fundo do problema de estoque: os produtos no site estão quase
> todos sem o SKU (código do produto) preenchido, ou com um código diferente do que está no Omie.
> Dos 124 produtos do site, só 9 têm o código batendo com o Omie. Sem esse código igual nos dois
> sistemas, nenhuma integração de estoque consegue saber qual produto é qual, e por isso o estoque
> nunca sincronizou direito, nem pelo Hub.
>
> O que precisamos que o time de vocês faça: preencher, em cada produto do Shopify, o campo SKU com
> o mesmo código que o produto tem no Omie. Aproveitar para excluir os produtos de teste e cópias
> que estão no catálogo, e acertar um código que está repetido em três produtos diferentes.
> Preparamos a lista de quais produtos estão sem código, com código errado e com código repetido
> para facilitar. Assim que isso estiver ajustado, a gente roda a verificação de novo e segue com
> a integração. Qualquer dúvida sobre qual código usar em cada item, a Nat pode alinhar com a gente.
