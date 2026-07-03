---
tags:
  - move-gourmet
  - integrador
  - estoque
  - regra
  - decisao
cliente: Move Gourmet
data: 2026-07-03
status: vigente
---

# Modelo de Sincronização de Estoque — regra oficial (Move Gourmet)

> Decisão de 03/07/2026, validada com dados reais do Omie (malha/estrutura) e do Shopify. Define
> como cada tipo de item é tratado no integrador Omie↔Shopify multi-CD. Complementa o
> [[Achado - SKUs Shopify x Omie - Jul 2026]] e a
> [[Integrador Estoque Multi-CD - Especificação Técnica - Jul 2026]].

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
| **3. Kit / Cesta** | Kit Sabores, Cesta Organize, etc. | **Produto fabricado com estoque próprio** (empurra o saldo do kit montado). **NÃO** usar bundle nativo do Shopify (ver justificativa). Sem cálculo de composição do nosso lado. |

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
`product_map`: chave = SKU Omie → variante Shopify (inventoryItemId) + `fator`; flag "kit/fabricado" é
apenas informativa (o sync usa sempre o saldo próprio do produto).
