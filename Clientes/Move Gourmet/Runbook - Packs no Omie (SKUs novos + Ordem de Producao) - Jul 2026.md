---
tags:
  - move-gourmet
  - omie
  - runbook
  - producao
  - estoque
cliente: Move Gourmet
data: 2026-07-05
status: vigente
---

# Runbook — Packs (pastel/empada 6un) no Omie: SKUs novos + Ordem de Produção

> Feito em 04-05/07/2026. Corrige o cadastro dos pacotes de 6 unidades (pastel/empada) no Omie,
> instalando a **lógica de dois estágios** (cru → unidade → pacote) do jeito certo, e liga o estoque
> ao site pelo integrador. Complementa o [[Modelo de Sincronização de Estoque (regra oficial) - Jul 2026]]
> e o [[Integrador - Status de Construção - Jul 2026]].

## Por que mexemos
Os SKUs de pacote antigos estavam bagunçados: 2 empada packs **inativos** (a API do Omie não reativa),
pastel bacalhau com receita de **cru** (inconsistente), pastel frango **ambíguo**, e todos com **saldo 0**
(produção do pack nunca lançada). Decisão do JG: **criar SKUs novos, certos, e deixar os antigos como
backup** — sem puxadinho no integrador para cadastro/processo errado.

## O que foi feito (04-05/07)

**1. Criados 4 SKUs novos de pacote (ativos), clonando os fiscais do antigo (NCM/tipoItem/família):**

| SKU novo | nCodProd | Substitui (backup) | Receita | Shopify (REF) |
|---|---|---|---|---|
| KMOVE-EMPFRANGO-6 | 10033279978 | PRD00766 (inativo) | 6× PRD00678 | SV045 Empada Frango 6un |
| KMOVE-EMPBACALHAU-6 | 10033280229 | PRD00767 (inativo) | 6× PRD00728 | SV044 Empada Bacalhau 6un |
| KMOVE-PASTBACALHAU-6 | 10033280243 | PRD00770 (cru) | 6× PRD00693 | SV085 Pastel Bacalhau 6un |
| KMOVE-PASTFRANGO-6 | 10033280248 | PRD00752 | 6× PRD00681 | SV086 Pastel Frango 6un |

**2. Lançadas as Ordens de Produção iniciais** (do estoque de unidade real, em Salvador):

| Pack | OP produziu | Unidade baixou |
|---|---|---|
| Empada Frango | +1 | PRD00678: 7 → 1 |
| Empada Bacalhau | +5 | PRD00728: 34 → 4 |
| Pastel Bacalhau | +10 | PRD00693: 62 → 2 |
| Pastel Frango | +9 | PRD00681: 57 → 3 |

**3. `product_map` reapontado** para os SKUs novos (os 3 packs antigos desligados do sync).

## Processo para a Move manter (o "como deve ser")
**Sempre que montarem um lote de N pacotes de pastel/empada:**
1. Omie → **Produção → Ordem de Produção → Incluir**.
2. Produto = o SKU do pacote (`KMOVE-...`); Quantidade a produzir = **N**.
3. **Concluir a OP.** O Omie sobe **+N** no pacote e baixa **6×N** unidades automaticamente.
4. A unidade (PMUND) é reposta por contagem/entrada normal da produção (como já fazem).

> Regra de ouro: **o site vende o pacote; o pacote sai da unidade.** Nunca vender a unidade solta no site.

## Ingredientes (recomendação)
Ingrediente (massa, recheio, requeijão, gema) **não entra no controle de estoque do Omie por ora** —
hoje está meio-controlado e negativo (pior dos mundos). Controlar à parte (contagem) até quererem custo
real; aí sim trazer pro Omie **direito** (registrar compra + consumo). A unidade é o nível mais baixo que
o estoque precisa refletir.

## Backup / como reverter
- Estado ANTES salvo em `Omie - Backup packs (antes das OPs) - Jul 2026.json` (saldos + receitas).
- SKUs antigos **intactos como backup** (PRD00766/767 inativos; PRD00770/752 ativos — **inativar depois**).
- Reverter uma OP: Omie `ReverterOrdemProducao` (devolve as unidades, tira os packs).
- Reverter o mapa: reapontar `product_map` pros SKUs antigos.

## Adendo 05/07 — Caixa de trufa (20un) + shapes corretos da API Omie
Criada a **KMOVE-TRUFABRANCAFV-20** (nCod 10033630251) = 20× a trufa individual PRD00845. Estrutura +
OP produziram 3 caixas consumindo 60 trufas (63→3). Site reapontado (is_kit, ativo).

**Shapes exatos da API (para os próximos kits — NÃO sondar na tentativa-e-erro, dispara rate-limit de 30min):**
- Criar produto: `geral/produtos IncluirProduto` (clonar unidade PCT / NCM / tipoItem 03 / família do avulso).
- Estrutura: `geral/malha IncluirEstrutura` → `{ intProduto, itemMalhaIncluir:[{ intMalha, idProdMalha, quantProdMalha }] }`.
- OP incluir: `produtos/op IncluirOrdemProducao` → `{ identificacao:{ cCodIntOP, dDtPrevisao, nCodProduto, nQtde, codigo_local_estoque }, itens:[{ cUtilizarDoEstoque:"S", nIdProdutoMalha }] }`. **O item NÃO leva quantidade** — o Omie calcula pela malha × produzido. (Sem o array `itens`, a OP produz o pacote mas NÃO baixa os componentes → estoque infla.)
- OP concluir: `produtos/op ConcluirOrdemProducao` → `{ cCodIntOP, dDtConclusao, nQtdeProduzida }`.
- OP reverter: `produtos/op ReverterOrdemProducao` → `{ cCodIntOP }` (sem data).

## Pendências
- **Inativar** os SKUs de pacote antigos ainda ativos (PRD00770, PRD00752) quando confortável.
- Demais sabores de "Trufas 20un" (aguardando Nat listar) → uma caixa KMOVE por sabor, mesmo processo.
- Go-live do integrador (exec) segue dependendo de: host + rotacionar segredos + `STOCK_SYNC_MODE=exec`.
