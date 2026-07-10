---
tags:
  - move-gourmet
  - estoque
  - conferencia
cliente: Move Gourmet
data: 2026-07-06
status: aguardando decisao JG
---

# Conferência de estoque — devolutiva da Nat (06/07/2026)

> Nat devolveu a planilha dos 54+ produtos com o estoque conferido por CD. Abaixo, categorizado por tipo de ação. **Nada foi escrito no Omie/Shopify ainda — aguarda decisão.**

**Total conferido:** 57 produtos.

| Categoria | Qtd | Ação |
|---|---|---|
| Sem mudança (OK + cestas on-demand) | 10 | nada |
| Correção de nº | 24 | ajustar saldo no Omie (⚠️ ver unidade×caixa) |
| Retirar do site | 14 | inativar mapa + unpublish Shopify |
| Sob encomenda (saldo 10) | 3 | setar saldo 10 no Omie |
| Previsão de produção | 3 | setar nº dado (0/1) |
| Novos (incluir no site) | 3 | criar/mapear no Shopify |

## ⚠️ Achado estrutural: unidade × caixa
Nos produtos KMOVE/PMCX o **sistema mostra CAIXAS**, mas a **Nat conta UNIDADES**. Ex.: KMOVE-EMPFRANGO-6 = sistema 1 caixa, Nat 43 unidades (=7 caixas). Se empurrarmos os números dela como caixa, o site **superestima ~6-20x**. Precisa resolver o modelo unidade→caixa (piso(unidades/fator)) antes de aplicar esses. Também há **saldos negativos** no Omie (MINI QUICHE FUMEIRO -1, PAO QUEIJO PARMESAO -1, POTE BRIGADEIRO -4, trufas -2/-3) do modelo de OP em 2 estágios — revisar.

## Correções de nº (24)
- **[CAIXA]** `PRD00739` PMCX BROWNIE CHOCOLATE  70% - 136G — sis SSA=4.0 SP=21.0 → Nat SSA=**129 und** SP=**81 unidades - 20 caixas e 1 unidade**
- **[CAIXA]** `PRD00742` PMCX COXINHA DE FRANGO ORGÂNICO  312G — sis SSA=3.0 SP=12.0 → Nat SSA=**23 pct** SP=**OK**
- **[CAIXA]** `PRD00743` PMCX COXINHA DE FUMEIRO ARTESANAL 312G — sis SSA=5.0 SP=17.0 → Nat SSA=**30 pct** SP=**18 PACOTES**
- **[CAIXA]** `KMOVE-EMPBACALHAU-6` KIT EMPADA BACALHAU PORTUGUES 76G - 6  — sis SSA=5.0 SP=0.0 → Nat SSA=**29 und** SP=**OK**
- **[CAIXA]** `KMOVE-EMPFRANGO-6` KIT EMPADA FRANGO ORGANICO 71G - 6 UNI — sis SSA=1.0 SP=0.0 → Nat SSA=**43 und** SP=**OK**
- `KBABH280` KOMBUCHA GF - ABACAXI COM HORTELA - 28 — sis SSA=3.0 SP=0.0 → Nat SSA=**2.0** SP=**OK**
- `KBML280` KOMBUCHA GF - MORANGO COM LIMAO - 280  — sis SSA=0.0 SP=0.0 → Nat SSA=**** SP=**OK**
- `KBPIM280` KOMBUCHA GF - PITAYA COM MARACUJA - 28 — sis SSA=6.0 SP=0.0 → Nat SSA=**4.0** SP=**OK**
- **[CAIXA]** `PRD00737` PMCX MINI TORTA DE CHOCOLATE - MB RECH — sis SSA=5.0 SP=18.0 → Nat SSA=**52 und** SP=**32 und = 16 caixas**
- **[CAIXA]** `PRD00736` PMCX MINI TORTA DOCE DE LEITE  - MB RE — sis SSA=3.0 SP=18.0 → Nat SSA=**24 und** SP=**30 und = 15 caixas**
- **[CAIXA]** `PRD00738` PMCX MINI BOLO DE LARANJA COM CALDA 15 — sis SSA=5.0 SP=18.0 → Nat SSA=**60 und** SP=**OK 36 und = 18 caixas**
- `PRD00881` PMUND MINI PAO MOVE FRANGO 6UND — sis SSA=0.0 SP=0.0 → Nat SSA=**2 und** SP=**OK**
- `PRD00882` PMUND MINI PAO MOVE FUMEIRO 6UND — sis SSA=0.0 SP=0.0 → Nat SSA=**15 und** SP=**OK**
- **[CAIXA]** `PRD00741` PMCX  MINI QUICHE DE FUMEIRO ARTESANAL — sis SSA=-1.0 SP=19.0 → Nat SSA=**39 und** SP=**36 und = 18 caixas**
- **[CAIXA]** `PRD00740` PMCX MINI QUICHE 4 QUEIJOS 240G — sis SSA=3.0 SP=5.0 → Nat SSA=**23 und** SP=**7 und = 3 caixas e 1 und**
- **[CAIXA]** `PRD00735` PMCX MINI TORTA DE FRANGO ORGANICO 240 — sis SSA=3.0 SP=19.0 → Nat SSA=**20 und** SP=**OK 38 und = 19 caixas**
- **[CAIXA]** `PRD00731` PMCX PAO DE QUEIJO PARMESAO 570G — sis SSA=-1.0 SP=14.0 → Nat SSA=**14 und** SP=**15 caixas**
- **[CAIXA]** `PRD00732` PMCX PAO DE QUEIJO TIPO GRANA PADANO 3 — sis SSA=4.0 SP=29.0 → Nat SSA=**12 und** SP=**OK**
- **[CAIXA]** `PRD00734` PMCX PAO MOVE FUMEIRO ARTESANAL 340G — sis SSA=2.0 SP=23.0 → Nat SSA=**36 und** SP=**OK**
- **[CAIXA]** `KMOVE-PASTBACALHAU-6` KIT PASTEL BACALHAU 65G - 6 UNID — sis SSA=10.0 SP=0.0 → Nat SSA=**31 und** SP=**2 PCT**
- **[CAIXA]** `KMOVE-PASTFRANGO-6` KIT PASTEL FRANGO 65G - 6 UNID — sis SSA=9.0 SP=0.0 → Nat SSA=**51 und** SP=**5 PCT**
- `PRD00514` TRUFA CHOCOLATE C/ BRIGADEIRO 22G — sis SSA=92.0 SP=0.0 → Nat SSA=**84 und** SP=**OK**
- `PRD00522` TRUFA CHOCOLATE  C/ DOCE DE LEITE 22G — sis SSA=77.0 SP=0.0 → Nat SSA=**63 und** SP=**OK**
- **[CAIXA]** `KMOVE-TRUFABRANCAFV-20` KIT TRUFA BRANCA C/ BRIGADEIRO BRANCO  — sis SSA=3.0 SP=0.0 → Nat SSA=**67 und** SP=**OK**

## Retirar do site (14)
- `PRD00557` OVO PASCOA 120G  /  doce de leite e pedaços de bow
- `PRD00818` OVO PASCOA 240G /  doce de leite e pedaços de brow
- `PRD00530` OVO PASCOA BRANCO 120G / brigadeiro branco e gelei
- `PRD00531` OVO PASCOA BRANCO 240G / brigadeiro branco e gelei
- `PRD00817` OVO PASCOA BRANCO 120G/  brigadeiro de Pistache e 
- `PRD00827` OVO PASCOA BRANCO 240G /  brigadeiro de Pistache e
- `PRD00833` OVO PASCOA 120G  / brigadeiro de pistache e mini t
- `PRD00824` OVO PASCOA 240G  / brigadeiro de pistache e mini t
- `PRD00553` OVO PASCOA 120G  / brigadeiro meio amargo e mini t
- `PRD00832` OVO PASCOA 240G  / brigadeiro meio amargo e mini t
- `PRD00519` TRUFA BRANCA C/ DOCE LEITE 22G
- `PRD00523` TRUFA CHOC 70%  C/ BRIGADEIRO MEIO AMARGO 22G
- `PRD00527` TRUFA CHOC 70%  C/ DOCE DE LEITE 22G
- `PRD00529` TRUFA BRANCA C/ BRIGADEIRO 22G

## Novos (incluir no site) (3)
- `PRD01154` PMUND BOMBOM BRANCO C/ FRUTAS VERMELHA — SSA=5 und SP=17 und INCLUIR NO SITE POR FAVOR
- `PRD00949` PMUND BOMBOM BROWNIE — SSA=76 und SP=26 und 
- `PRD00892` PMUND COXINHA COSTELA 85G — SSA=49 und SP=10 und 

## Sob encomenda (deixar saldo 10) (3)
- `PRD01125` POTE BRIGADEIRO 300G
- `PRD01141` POTE DOCE DE LEITE 300G
- `PRD00894` TERRINE GRANA PADANO COM ALHO PORÓ

## Previsão de produção (3)
- `PRD01124` PMUND CROSTINI PARMESAO kg → 0 (previsão de produção na segunda feira)
- `PRD00591` PMUND CROSTINI PARMESAO 50G → 1 (previsão de produção na segunda feira)
- `PRD00733` PMCX PAO MOVE FRANGO ORGANICO 340G → 0  = (previsão de produção na sexta)

## Cestas on-demand (deixar como está) (9)
- `PRD00121` CESTA EXPERIMENTE VIVER
- `PRD00605` CESTA MOVIMENTE
- `PRD00136` CESTA VIVER ALEM DE EXISTIR
- `PRD00891` CESTA MOVE KIDS
- `PRD00869` KIT DOCE VIDA
- `PRD00124` KIT EXPERIMENTACAO
- `PRD00853` KIT PRIMEIRA MORDIDA
- `PRD00576` KIT SABORES
- `PRD00655` CESTA ORGANIZE

## ✅ APLICADO 06/07 — correções de UNIDADE simples (Salvador, via IncluirAjusteEstoque tipo SLD, motivo INV)
Reversível: `ExcluirAjusteEstoque` com o id_ajuste. Local Salvador = 3390627692.

| SKU | Alvo | id_ajuste |
|---|---|---|
| KBABH280 | 2 | 10034790774 |
| KBPIM280 | 4 | 10034791151 |
| PRD00881 | 2 | 10034791155 |
| PRD00882 | 15 | 10034791170 |
| PRD00514 | 84 | 10034791195 |
| PRD00522 | 63 | 10034791215 |
| PRD01125 | 10 | 10034791227 |
| PRD01141 | 10 | 10034791241 |
| PRD00894 | 10 | 10034791263 |
| PRD01124 | 0 | 10034791284 |

## Pendente (não aplicado)
- **Produtos-caixa (KMOVE/PMCX):** aplicar via processo unidade→kit (setar unidade + montar kits/OP). Aguarda story.
- **Retirar 14 do site** (ovos de páscoa + trufas descontinuadas): arquivar no Shopify + inativar mapa.
- **Incluir 3 novos:** bombom branco frutas verm. (PRD01154), bombom brownie (PRD00949), coxinha costela (PRD00892).
- **Auto-ocultar estoque 0** no Shopify (Flow nativo ou integrador) — elimina a gestão manual.
