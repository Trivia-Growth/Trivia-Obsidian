---
tags: [heziom, dashboard, análise, ceo, maio2026]
status: entregue
criado: 2026-05-18
dados: ERP Literarius SQL Server (direto)
período: 2026-05-01 a 2026-05-15
---

# HeziomOS — CEO Dashboard · Análise Maio 2026

> Dashboard HTML interativo gerado com dados reais do Literarius SQL Server.  
> Arquivo: `heziom-ceo-dashboard-maio2026.html`

---

## KPIs Executivos — 1 a 15 de Maio 2026

| Métrica | Valor | Contexto |
|---|---|---|
| **Faturamento 1–15 Mai** | R$ 339.881 | 1.681 NFs emitidas |
| **Variação vs Abr 1–15** | **+42,6%** | R$238k → R$340k |
| **Projeção mês completo** | ~R$ 746k | Pace 2× acima de abr |
| **Fat YTD jan–abr** | R$ 2,56M | Média R$ 640k/mês |
| **Recebido em maio** | R$ 265.375 | Baixas registradas |
| **A/R total** | R$ 2,02M | 80% já vencido |
| **A/R vencido** | **R$ 1,62M** | 🔴 CRÍTICO |
| **A/P total** | R$ 4,14M | Inclui royalties e consign. |
| **Estoque (valor)** | R$ 13,5M | 167.018 unidades |
| **Consignação aberta** | R$ 2,06M | 50 consignações, 3.360 itens |

---

## Faturamento Mensal 2026

| Mês | Faturamento | NFs |
|---|---|---|
| Janeiro | R$ 806.865 | 3.557 |
| Fevereiro | R$ 586.761 | 2.402 |
| Março | R$ 569.737 | 2.255 |
| Abril | R$ 592.020 | 2.569 |
| Maio (1–15) | R$ 373.032 | 1.921 |

> Janeiro é o mês mais forte — lançamentos pós-natal. Fev/Mar/Abr estáveis em ~R$580k. Maio em pace para quebrar recorde.

---

## Canais de Venda — 1 a 15 Mai

| Canal | Faturamento | NFs | Ticket Médio | % do Total |
|---|---|---|---|---|
| **Atacado** | R$ 145.889 | 53 | R$ 2.753 | 42,9% |
| **Site** | R$ 117.568 | 967 | R$ 122 | 34,6% |
| Mercado Livre | R$ 33.753 | 316 | R$ 107 | 9,9% |
| Amazon | R$ 15.888 | 271 | R$ 59 | 4,7% |
| Marketing | R$ 8.126 | 26 | R$ 313 | 2,4% |
| Livraria | R$ 4.789 | 47 | R$ 102 | 1,4% |

**Insights:**
- Atacado = 43% do fat com apenas 53 NFs → poucos clientes, alto impacto
- Digital (Site + ML + AMZ) = 49% do fat com volume massivo (1.554 NFs)
- Amazon tem ticket médio de R$59 — menor de todos, mas volume significativo

---

## Top 5 Produtos — Unidades Vendidas

| # | Produto | Unidades | Receita |
|---|---|---|---|
| 1 | Discipulado Teleios | **9.850** | R$ 356.967 |
| 2 | Mães da Aliança 2026 | **7.254** | R$ 361.606 |
| 3 | Em busca do coração de Deus | 2.355 | R$ 25.630 |
| 4 | Revistas: A Grande Comissão N 16 | 2.240 | R$ 3.948 |
| 5 | Família: um lugar seguro | 2.106 | R$ 19.040 |

> Os 2 primeiros produtos respondem por ~50% de todo o faturamento do período.  
> Revistas (trimestral) têm volume alto mas baixo valor unitário (~R$1,8–2,7).

---

## Estoque

| Produto | Saldo | Preço | Valor Estoque |
|---|---|---|---|
| Discipulado Teleios | 62.560 un | R$ 38,90 | **R$ 2,43M** |
| Mães da Aliança 2026 | 43.290 un | R$ 52,90 | **R$ 2,29M** |
| Família: um lugar seguro | 44.534 un | R$ 39,90 | **R$ 1,78M** |
| Família: kit | 30.562 un | R$ 39,90 | R$ 1,22M |
| Demais revistas | ~200k un | ~R$ 1–3 | ~R$ 500k |

- **4.112 SKUs zerados** — alto, mas maioria são títulos descontinuados/revistas antigas
- **4 SKUs abaixo do mínimo** — revistas T1 2026 (já passou o trimestre — esperado)

---

## Inadimplência — A/R Vencido

| Cliente | Valor Vencido | Dias em Atraso |
|---|---|---|
| PLENITUDE DISTRIBUIDORA | **R$ 89.646** | 242 dias |
| (sem nome) | R$ 55.991 | 238 dias |
| CONSUMIDOR | R$ 40.148 | 258 dias |
| (sem nome) | R$ 20.947 | 259 dias |
| DISTRIBUIDORA CURITIBA | R$ 15.221 | 199 dias |
| ARAUTOS DO EVANGELHO | R$ 13.765 | 174 dias |
| DISTRIBUIDORA CAMPINAS | R$ 12.000 | 131 dias |
| LIBANUS EDITORA | R$ 11.671 | 150 dias |

⚠️ **Ação urgente:** R$1,62M de R$2,02M em A/R está vencido. Distribuidoras acumulando dívidas há 4–8 meses.

---

## Descobertas Técnicas

### 1. Classificação de clientes ausente
93,7% do faturamento está em "Sem tipo". Os clientes não estão categorizados no Literarius. Isso impede análise por segmento (igrejas vs livrarias vs PF). **Oportunidade de melhoria cadastral.**

### 2. "Sem canal" com R$13.868 em 1 NF
Uma NF de alto valor sem canal associado. Provavelmente venda direta não categorizada.

### 3. Consignação: R$2,06M fora da empresa
50 consignações abertas com 3.360 itens. Esse estoque está contabilizado como ativo mas está com terceiros sem data de retorno.

### 4. Faturamento diário irregular
Pico de R$91,6k em 07/Mai — provavelmente lote de atacado. Dias úteis regulares ficam entre R$20k–R$50k. Fins de semana caem para ~R$600.

### 5. Pedidos: 1.586 já faturados, 23 aguardando separação
Pipeline operacional saudável. Apenas 2 cancelamentos no período.

---

## Referências

- `heziom-ceo-dashboard-maio2026.html` — Dashboard interativo
- [[_índice]] — Schema das fontes de dados
- [[Réplica Supabase — Schema e Estratégia de Sync]] — Plano de replicação
- [[ADR-001 — Sync Agent no Raspberry Pi]] — Arquitetura técnica

---

*Análise gerada em 2026-05-18 — Lucas Azevedo (Trivia)*
