---
tipo: plano
status: aprovado-topologia
data: 2026-07-05
fonte_de_verdade: heziomos/docs/reference/literarius-arquitetura-modulos.md (repo)
relacionados: "[[Estado Atual — Espelho dos Épicos]], [[Mapeamento Completo da Operação Heziom]], [[DRE Acumulado 2025-2026]]"
---

# Módulos sobre o Literarius — Plano 2026-07-05

> Fonte de verdade viva: `docs/reference/literarius-arquitetura-modulos.md` + epics/stories no
> repo `heziomos` (PR #262). Esta nota é o espelho executivo no vault.

## Contexto

O `literarius-sync` atingiu **cobertura total** do ERP em 05/07: 59 tabelas espelhadas (todas as
úteis das 188 da fonte), contagens validadas 1:1, incluindo novidades — preços com vigência,
inventários, transferências, NFS-e, numeração de NF, projetos editoriais. Com o dado 100% no
Supabase, o JG decidiu **reconstruir do zero** o consumo (telas), com specs profundas primeiro.

## Decisão de topologia (JG, 05/07)

**Diretriz:** fiscal + contábil + financeiro concentram no **FINANCEIRO**; **EDITORIAL** é módulo
próprio; **vendas** ficam no **COMERCIAL**; **ESTOQUE** é módulo próprio; **LIDERANÇA** vira a
camada executiva (CEO+BI consolidando os módulos — sem dashboard lendo espelho cru).

| Módulo | Epic | Escopo |
|---|---|---|
| Financeiro | E10 Fase 2 (10.7–10.16) | DRE 2 regimes c/ de-para de contas, fluxo projetado, conciliação real, saldo real, fiscal (NF-e/lacunas/NFS-e), compras A/P, comissões, fechamento assistido, lookups |
| Comercial | E29 | vendas por canal + pace vs meta CPC, funil pedido→NF, rankings, devoluções, consignação c/ aging |
| Editorial | E30 | catálogo, margem por título, preços c/ vigência, royalties, projetos |
| Estoque | E31 | giro/cobertura/ruptura/ABC, acuracidade de inventário, transferências, snapshot diário, recebimento |
| Liderança | E32 | CEO (os 7 KPIs pedidos) + BI drill-down + agente IA |

## Achados-chave da revisão (05/07)

1. **DRE automático estava bloqueado pela fonte** (`PlanoConta.TipoCategoria='A'` em 115/115):
   resolvido por arquitetura — tabela de-para própria (`financeiro.dre_conta_map`) com a
   hierarquia REAL do [[DRE Acumulado 2025-2026]] e exclusões (conta 106 transferências, 115
   empréstimos). Réguas de reconciliação: 2025 = R$ 6,62M/821,6k; Jan/26 = 881,3k/136,6k.
2. **Rótulos de status chumbados no DAL estão ERRADOS** (fonte: 6=Pedido Faturado 98% da base) →
   story 10.16 sincroniza os lookups e mata o mapa hardcoded.
3. **As specs de módulo do vault (02 - Sistema/Módulos) foram incorporadas** como "Fase B
   operacional": aprovação+CNAB 240, conciliação OFX c/ score, comissões (Lucas 1,5%/Bruno 5%
   líquido atacado), fechamento mensal (KR1, 19 subprocessos), editorial-produção (laudas/etapas).
4. **Frontend atual (telas do Lucas) será substituído por módulo**, com remoção atômica no PR de
   cada substituto; edge functions/DAL/views corrigidas ficam como base.

## Decisões pendentes (as mesmas do plano, continuam abertas)

- **D1 (CEO):** faixas de alçada de aprovação de pagamento (<5k / 5–50k / >50k?).
- **D2 (JG/Financeiro):** OFX exportável no Internet Banking Santander?
- Conta 8 "A VERIFICAR" (R$ 132k): classificação pelo financeiro.

## Ordem de execução

Financeiro (prioridade CEO) → Editorial / Estoque / Comercial (paralelizáveis) → Liderança por
último. Job de **snapshot de estoque** (31.4) é urgente-independente: cada dia sem ele é história
perdida.
