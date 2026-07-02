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

## O que foi encontrado

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

> **Sobre Kits e Cestas** (Kit Sabores, Cesta Presente, etc.): são combos. No Omie, kit dá baixa
> por componente. O estoque deles é derivado dos itens — não precisam necessariamente de um SKU
> próprio de sincronização. Tratar à parte, depois dos produtos simples.

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
