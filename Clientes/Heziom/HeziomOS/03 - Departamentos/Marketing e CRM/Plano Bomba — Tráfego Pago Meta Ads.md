---
tags: [heziom, marketing, trafego-pago, meta-ads, plano-bomba]
status: em campanha
criado: 2026-06-02
vigencia: 27/05/2026 a 23/07/2026
gestora: Bia (PJ)
---

# Plano Bomba — Tráfego Pago (Meta Ads)

> Campanha de aceleração para liquidar capital empatado em estoque (R$ 1,19M, ~132 mil unidades) via 11 combos + brinde + LP dedicada. Arquitetura sob a lógica Meta 2026 (Andromeda + GEM + Lattice).
> LP: [[LP Coleções 2026 (Plano Bomba) — Configuração]] · Tracking: [[Meta CAPI — Configuração Tray Ecommerce]]
> Gestora: **Bia** (tráfego PJ) · Aprovação criativo: **JG** (SLA 4h)

---

## Sumário

| Métrica | Valor |
|---|---|
| Verba total aprovada | **R$ 200.000** em 60 dias |
| Estrutura | 2 tranches de R$ 100k (Junho + Julho) — Tranche 2 sob aprovação em 24/06 |
| ROAS médio esperado | 2,8x a 3,0x (mínimo aceitável 2,2x) |
| Receita atribuída esperada | R$ 560k a R$ 590k |
| Meta de kits | 8.900 em 60 dias |
| Plataforma | Meta Ads (Instagram + Facebook) |
| Carros-chefe | Box 7 Lançamentos (R$ 99) + Box MDA Premium (R$ 179) |

**Princípio guia 2026:** *criativo é o novo targeting*. 70-80% da performance vem do criativo, não do targeting/orçamento. Estruturas fragmentadas sabotam o algoritmo → consolidar sinal.

---

## Arquitetura — 3 campanhas CBO

```
C1 — HEZIOM SALES (Advantage+ Shopping, CBO)   R$ 2.400/dia
  ├── AS1 MDA Premium (sazonal)        floor R$ 1.400/dia até 16/06  🔴
  ├── AS2 Box 7 Lançamentos            floor R$ 430/dia              🟠
  ├── AS3 Pool Reformado/Teológico     sem floor                     🟠
  │     (CBH, Solas, Bíblia Estudo, Spurgeon, Tratados, AT-NT)
  └── AS4 Pool Cristão Amplo           sem floor                     🟡
        (Família a partir 10/06, Mulher Cristã, Discipulado)

C2 — RETARGETING (manual, CBO)                  R$ 130/dia
  ├── AS1 Visitantes LP 30d, não compradores
  └── AS2 AddToCart 14d, não compradores

C3 — REATIVAÇÃO (manual, CBO)                    R$ 800/dia
  └── AS1 Compradores 90-365d (CRM upload) + LAL 1%
        Foco ticket maior: MDA Premium, Bíblia Estudo
```

Após esgotar o MDA Premium (~16/06), o floor de R$ 1.400/dia migra para Box 7 Lançamentos (+R$ 700) e Pool Reformado (+R$ 700). Decisão formal no marco D+21.

### Distribuição Tranche 1 (R$ 100k / junho)

| Campanha / Ad Set | Verba 30d | Floor |
|---|---|---|
| C1 / AS1 MDA Premium | R$ 28.000 | R$ 1.400/dia até 16/06 |
| C1 / AS2 Box 7 Lançamentos | R$ 13.000 | R$ 430/dia |
| C1 / AS3 Pool Reformado | R$ 22.000 | — |
| C1 / AS4 Pool Cristão Amplo | R$ 9.000 | — |
| C2 / AS1 Retargeting LP | R$ 2.400 | — |
| C2 / AS2 Retargeting ATC | R$ 1.600 | — |
| C3 / AS1 Reativação | R$ 20.000 | — |
| Reserva de otimização | R$ 4.000 | — |
| **TOTAL** | **R$ 100.000** (R$ 3.333/dia) | |

### Critério de liberação da Tranche 2 (decisão 24/06)

Liberar R$ 100k de julho se ≥ 3 dos 4 indicadores estiverem positivos:
- ROAS médio acumulado ≥ 2,5x
- Box 7 Lançamentos ≥ 600 kits em 28 dias
- MDA Premium ≥ 500 kits acumulado
- Estoque saudável (nenhum SKU de combo < 200 un)

---

## Configuração de entrega

- **Otimização:** Compras (não Landing Page Views, não Link Clicks)
- **Value Optimization:** ativo em C1 (valor de compra real do pixel)
- **Targeting:** 100% broad + Advantage+ Audience; interesses só como **sugestão**, não restrição. Único filtro: Brasil + 25-65+
- **Atribuição:** 7d clique + 1d view (tático) + Incremental Attribution (estratégico)
- **Posicionamentos:** Advantage+ Placements (excluir Audience Network se CPA subir 50% acima da média)
- **Leilão:** Lowest cost (cost cap só após 14d com dado estável)
- **LAL:** só 1% em C3. LALs 2%/3% e de engajamento **fora** (competem com broad sem vantagem)

### Exclusões obrigatórias (todos os ad sets C1)

- Compradores últimos 90 dias (evita canibalizar venda orgânica)
- Funcionários Heziom + Trívia
- Audiência do C3 Reativação (evita overlap)

---

## Criativos (framework Entity ID)

- **15 a 20 conceitos distintos** rodando simultâneos na C1 (não 2-3 variações). Total na largada: 27-33 peças únicas → garante diversidade de Entity ID
- Foco em **ângulo** (autor, problema do leitor, ocasião, social proof), não em formato. Desconto entra só no fechamento
- Reposição **por morte individual**, não troca em lote a cada 14d

### Os 10 ângulos brifados

1. Autor como autoridade (Spurgeon, Manton, Casimiro) · 2. Mãe lendo MDA com filha · 3. Pastor recomendando · 4. "O que sua família vai herdar?" · 5. Unboxing do Box 7 · 6. 7 livros vs R$ 99 · 7. MDA + Planner empilhados · 8. Estudo bíblico em casal · 9. "O que minha biblioteca diz da minha fé" · 10. Brinde > R$ 79 como gatilho de fechamento

### Critério de morte do criativo (individual)

- Frequency > 4,0 **E** ROAS < 2,0x por 4 dias → pausa
- Hook Rate < 20% nas primeiras 24h → pausa preventiva
- CTR < 0,8% por 4 dias → pausa
- Top performers (ROAS > 3,5x): **mantém e cria variantes** para escalar

### Termos proibidos

❌ Queima, liquidação, saldão, promoção, encalhe, saída de estoque · **travessão "—"** · palavra **"jornada"**
✅ Curadoria editorial, edição especial, coleção limitada, condição especial, boxes temáticos

---

## KPIs e metas por ad set

| Ad Set | ROAS meta | ROAS mín | CPA meta | Hook Rate |
|---|---|---|---|---|
| C1 AS1 MDA Premium | 3,2x | 2,5x | R$ 55 | >25% |
| C1 AS2 Box 7 Lançamentos | 2,8x | 2,2x | R$ 25 | >30% |
| C1 AS3 Pool Reformado | 3,0x | 2,4x | R$ 35 | >25% |
| C1 AS4 Pool Cristão Amplo | 2,8x | 2,2x | R$ 28 | >28% |
| C2 AS1 Retargeting LP | 4,0x | 3,0x | R$ 20 | >35% |
| C2 AS2 Retargeting ATC | 5,5x | 4,0x | R$ 15 | >35% |
| C3 AS1 Reativação | 4,5x | 3,5x | R$ 30 | >30% |
| **Geral** | **2,8-3,0x** | **2,2x** | **R$ 30-40** | **>25%** |

### Regras de aprendizado

- Cada ad set precisa de ~50 conversões em 7d para sair de aprendizado. **Não pausar antes de 7d**
- Aumento > 20% no orçamento reseta aprendizado. Subir em incrementos ≤ 20%, mín. 4 dias entre aumentos
- Subir verba: ROAS ≥ 3,5x **E** Frequency < 3,0 por 4 dias → +20%
- Baixar verba: ROAS < 2,2x por 7 dias **E** Frequency > 4,0 → -30%
- Matar ad set: ROAS < 1,8x por 14 dias após otimização criativa

---

## Atribuição e triangulação

3 fontes: **Meta Ads Manager** (diária, Bia) · **GA4** (semanal) · **ERP Literárius** (quinzenal, receita real).

**Métrica unificadora — MER mensal = Receita Total Heziom (todos os canais) / Gasto Total Meta.**
Meta MER: junho ≥ 4,0x · julho ≥ 4,5x. MER captura o halo effect (28% do faturamento é livraria física, 14% marketplaces, sem pixel) — métrica mais honesta que o ROAS Meta.

- Meta ROAS vs GA4 divergem > 25% → auditoria CAPI + UTM em 48h
- ROAS Meta > 3,0x mas MER < 3,5x → atribuição inflada, cuidado ao escalar
- ROAS Meta < 2,5x mas MER > 4,0x → halo alto, vale aumentar verba

---

## Cadência de revisão

| Data | Marco |
|---|---|
| D+1 (28/05) | Smoke test: pixel/CAPI disparando, gasto rodando |
| D+3 (30/05) | Hook Rate dos top 5 (pausar < 20%) |
| D+7 (03/06) | Saída de aprendizado |
| D+14 (10/06) | Revisão formal + 3 novos conceitos |
| D+21 (17/06) | Mid-tranche: floor MDA migrando? |
| **D+28 (24/06)** | **Decisão Tranche 2** (MER + critérios) |
| D+42 (08/07) | Revisão Tranche 2 + 5 conceitos |
| D+56 (22/07) | Sprint final |
| D+60 (26/07) | Fechamento + MER consolidado |

**Reuniões:** weekly quarta 30min (Bia + JG) · bi-weekly 1h (Bia + JG + MKT) · decisão Tranche 2 em 24/06.

---

*Origem: vault JG OS · `02 - Heziom/Crise de Caixa Abr-Jun 2026` (nota 20 v2.1, briefing para Bia).*
