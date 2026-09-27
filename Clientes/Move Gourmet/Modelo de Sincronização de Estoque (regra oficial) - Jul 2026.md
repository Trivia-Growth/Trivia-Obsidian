---
tags:
  - move-gourmet
  - integrador
  - estoque
  - regra
  - decisao
cliente: Move Gourmet
data: 2026-07-03
atualizado: 2026-07-25
status: vigente com correção (tipo 3/kit mudou)
---

# Modelo de Sincronização de Estoque — regra oficial (Move Gourmet)

> Decisão de 03/07/2026, validada com dados reais do Omie (malha/estrutura) e do Shopify. Define
> como cada tipo de item é tratado no integrador Omie↔Shopify multi-CD. Complementa o
> [[Achado - SKUs Shopify x Omie - Jul 2026]] e a
> [[Integrador Estoque Multi-CD - Especificação Técnica - Jul 2026]].

## 🔴 CORREÇÃO IMPORTANTE (25/07/2026) — leia antes do resto

**A regra do tipo 3 (kit) mudou, e o que está escrito abaixo sobre "saldo próprio" NÃO vale mais
para as caixas `KMOVE-*`.** O código mudou entre 08 e 11/07 e ninguém atualizou esta nota; a
divergência foi encontrada e medida em 25/07.

**O que vale hoje:**

> `estoque da caixa no site = piso( (saldo da UNIDADE no Omie − 5%) ÷ unidades por caixa )`

**Consequência prática para a Move — a parte que mais importa:**
**lançar produção no SKU do KIT (`KMOVE-…`) não muda NADA no site.** O integrador olha só a
**unidade** (`PRD…`). Quem lança no kit acha que resolveu e o site continua igual. **Sempre lançar
na unidade** — todas as caixas daquele item se ajustam sozinhas.

**Medido em produção (25/07):** dos **17 kits ativos, 17 derivam da unidade e ZERO usam saldo
próprio.** O modelo descrito abaixo como "estoque próprio" tem **zero casos vivos** hoje. Ele segue
sendo o caminho previsto para **cestas multi-item**, que continuam fora de escopo.

**Também corrigido em 25/07:** a margem de segurança de 5% incide na **unidade, antes de dividir**.
Antes incidia na caixa, e isso **apagava a última caixa de todo kit** (`piso(1 × 0,95) = 0`) — um
kit de 20 só aparecia no site a partir de 40 unidades. **8 caixas voltaram a vender** ao corrigir.

**Corrigido em 26/07 — a margem nunca mais zera o que existe.** O arredondamento para baixo ainda
comia **a última unidade** de qualquer produto (`piso(1 × 0,95) = 0`) e a **caixa cheia exata** do
kit (6 unidades num kit de 6 dava zero). Regra nova:

> **Havendo saldo no Omie, o site nunca recebe zero.** 1 unidade publica 1 unidade. Unidades
> suficientes para 1 caixa publicam 1 caixa. Quem tem saldo alto não sente (100 segue 95).

E o que **não** mudou: saldo 0 continua 0 — o piso não inventa estoque, e 1 unidade num kit de 6
continua não formando caixa. **7 produtos estavam com mercadoria em Salvador e esgotados no site.**

> 💡 **O princípio, para quem for mexer nisso:** a margem de segurança existe para **não vender o que
> não há** — nunca para **esconder o que há**.

🔴 **E o zero custa mais caro do que parecia.** Descobrimos em 26/07 que existe um **Shopify Flow**
que **despublica o produto** da loja **e dos anúncios de Facebook, Instagram e Google** quando o
estoque zera (e republica quando volta). Então publicar zero **não deixa o item "esgotado": tira o
item do ar.** Ver [[Automacao Shopify Flow - despublica produto sem estoque - Jul 2026]] — inclusive
porque isso explica a pendência antiga de "produtos ativos mas não publicados", que **não** era
esquecimento da equipe.

Registro no repo: **ADR-0004** (`docs/adr/0004-kit-deriva-da-unidade.md`), que substitui o tipo 3 do
ADR-0002, `specs/quick/001-buffer-na-unidade-do-kit/` e
`specs/quick/002-buffer-piso-de-uma-unidade/`.

## Princípio único
No site e no controle de estoque só existe **produto vendável**. **Ingrediente/insumo** de produção
(batata, azeite, sal, geleia, manteiga, caixa MDF, fita, flores, café) **nunca** vira produto no
site nem entra no sync — vive só na **receita de produção (malha)** do Omie. O estoque de um produto
final vem da **produção**, não da soma de ingredientes.

## Três tipos de item e seu tratamento

| Tipo | Exemplos | Tratamento no sync |
|---|---|---|
| **1. Produto final** | crostini, coxinha, empada, pastel, pães, tortas, potes, suco | 1 produto no site; estoque = **saldo próprio** no Omie (`ListarPosEstoque`). Aplica **fator** de pacote quando o site vende em pacote (ex.: empada unidade → pacote de 6 = fator 6). |
| **2. Produto com variações** | kombucha (3 sabores), trufas, tortas (15/20 cm) | 1 produto no Shopify com **variantes**; cada variação = 1 SKU no Omie. Sincroniza por variante (inventoryItem). Melhor UX (uma página, cliente escolhe). |
| **3. Kit / Cesta** | Kit Sabores, Cesta Organize, etc. | ⚠️ **SUPERADO em 25/07 para as caixas `KMOVE-*`** (ver correção no topo): a caixa **deriva da unidade**, `piso((unidade − 5%) ÷ fator)`. O texto original — *"produto fabricado com estoque próprio (empurra o saldo do kit montado), sem cálculo de composição do nosso lado"* — só valeria para **cestas multi-item**, que não têm nenhum caso ativo. **NÃO** usar bundle nativo do Shopify segue valendo. |

## Por que kit NÃO vira bundle (classificação real das 9 cestas/kits — 03/07)
Verifiquei a receita (`geral/malha/ConsultarEstrutura`) de todas. **Nenhuma é boa candidata a bundle**,
por dois motivos que confirmam o princípio acima:

1. **Cestas têm ingrediente/embalagem de verdade** (não são produtos): caixa MDF, fita de cetim,
   morango, kiwi, manteiga ghee, geleia, café drip, queijo mussarela, kombucha de revenda, flores.
2. **Kits "limpos" (só itens finais) são feitos de unidades avulsas** (`PMUND`: mini quiche 120g,
   brownie 34g, coxinha 40g, pão move 170g) que **não são vendidas soltas** no site (o site vende a
   caixa `PMCX` e o kit). Virar bundle exigiria publicar dezenas de unidades avulsas que ninguém
   compra separado — só sujaria a loja.

| Kit / Cesta | Composição | Veredito |
|---|---|---|
| KIT SABORES | 14 itens, todos unidades avulsas (PMUND) | Estoque próprio |
| CESTA MOVIMENTE | finais + ingredientes (queijo, geleia, kombucha revenda, café) | Estoque próprio |
| CESTA EXPERIMENTE VIVER | finais + embalagem/hortifruti (caixa MDF, fitas, morango, kiwi, manteiga, café, flores) | Estoque próprio |
| CESTA VIVER ALÉM DE EXISTIR | finais + embalagem (caixa MDF, fitas) | Estoque próprio |
| CESTA ORGANIZE | finais + ingredientes (manteiga ghee, geleia, café) | Estoque próprio |
| KIT EXPERIMENTAÇÃO | só finais, todos unidades avulsas | Estoque próprio |
| KIT DOCE VIDA | só finais; 2 vendidos no site, 5 avulsos | Estoque próprio |
| KIT PRIMEIRA MORDIDA | sem receita cadastrada | Estoque próprio |
| CESTA MOVE KIDS | sem receita cadastrada | Estoque próprio |

**Resultado: 9/9 → estoque próprio.** Bundle do Shopify fica como opção futura só se um dia decidirem
vender unidades avulsas (não é o caso hoje).

## Disciplina de processo que sustenta o modelo (lado Move)
- **Registrar a produção no Omie** ao fabricar produto final e ao montar kit/cesta. É o que mantém o
  saldo próprio fiel. Sem isso, o estoque não sobe e o site zera com produto pronto.
  ⚠️ **Correção 25/07:** para as caixas `KMOVE-*`, lançar **na UNIDADE** (`PRD…`). Lançar no SKU do
  kit não muda o site. **Saldo negativo na unidade é o sintoma clássico de produção não lançada** —
  em 25/07 havia `PRD00851` = −40 e `PRD00678` = −20 (venda deu baixa, produção nunca deu entrada),
  e os 3 produtos correspondentes estavam esgotados no site tendo estoque físico.
- **Atenção redobrada ao overlap:** componentes que também são vendidos avulsos no site — **SUCO DE
  UVA** (PRD00620), **BROWNIE em caixa** (PRD00739) e **TRUFA** (PRD00522) aparecem no site E dentro
  de cestas. Se a montagem da cesta não for lançada no Omie, o mesmo item fica disponível em dois
  lugares e vende a mais.
- Todos os kits têm **SP = 0** (montados só em Salvador) → no split multi-CD, kit sai de Salvador.

## O que isso entrega
- **Controle funcional:** uma fonte de verdade (Omie), um número por produto vendável, ninguém
  contando ingrediente. Baixa manutenção.
- **Loja aproveitada:** variantes deixam o catálogo limpo; produtos finais e kits com estoque certo.
- **Integrador simples:** sincroniza produtos finais + variantes por CD; kit é só mais um produto
  final. Sem BOM, sem bundle.

## Impacto no design (repo)
Registrado como **ADR-0002** no repositório do integrador (`docs/adr/0002-modelo-estoque-kits-variantes.md`).
`product_map`: chave = SKU Omie → variante Shopify (inventoryItemId) + `fator`; ~~flag "kit/fabricado" é
apenas informativa (o sync usa sempre o saldo próprio do produto)~~.

⚠️ **Corrigido pelo ADR-0004 (25/07):** `is_kit`, `unidade_sku` e `fator_kit` são **funcionais**, não
informativos — é deles que sai o estoque da caixa. A afirmação riscada acima é o que a divergência
entre ADR e código escondeu por duas semanas. Ver `docs/adr/0004-kit-deriva-da-unidade.md`.
