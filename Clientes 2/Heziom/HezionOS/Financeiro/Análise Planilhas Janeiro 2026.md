---
tags: [financeiro, analise, planilhas, janeiro, confirmado]
status: analisado
criado: 2026-04-15
fonte: Planilhas financeiras da equipe Heziom
---

# Análise das Planilhas Financeiras — Janeiro 2026

Resultado da leitura e análise das planilhas enviadas pelo time financeiro da Heziom. Referência: pasta `Financeiro HEziom 1-JANEIRO`.

---

## Arquivos analisados

| Arquivo | Conteúdo |
|---------|----------|
| `FATURAMENTO.xls` | 4.251 NFs de saída de janeiro — base de faturamento |
| `CMV.xls` | Ranking de produtos com custo, margem e faturamento |
| `controle de contas a pagar.xls` | 863 títulos a pagar (fev–dez 2026) |
| `DRE/Levantamento por competencia.xlsx` | DRE manual jan/2026 por linha |
| `DRE/faturamento por setor.xls` | Faturamento detalhado por setor/canal |
| `DRE/ml full.xls` | NFs individuais do canal ML Full |
| `DFC/Fluxo Santander.xlsx` | Extrato Santander x Literarius (conciliado) |
| `DFC/Extratos/` | Extratos: Amazon, Mercado Pago, Pagarme, Stone, Santander |
| `DFC/Fornecedores*.xls` | Pagos e abertos por categoria (CMV e revenda) |

---

## 1. Faturamento Bruto por Canal — Janeiro 2026

Fonte: `FATURAMENTO.xls` (4.251 NFs, filtro `GeraFinanceiro=1`)

| Canal | NFs | Bruto | Frete | Líquido (s/ frete) |
|-------|-----|-------|-------|---------------------|
| SITE (Tray) | 1.648 | R$ 301.546 | R$ 34.047 | **R$ 267.499** |
| ATACADO | 82 | R$ 296.951 | R$ 12.387 | **R$ 284.564** |
| MERCADO LIVRE - MP | 853 | R$ 108.717 | R$ 10.418 | **R$ 98.299** |
| LIVRARIA | 748 | R$ 90.172 | R$ 0 | **R$ 90.172** |
| AMAZON - MP | 864 | R$ 74.979 | R$ 1.092 | **R$ 73.887** |
| MERCADO LIVRE - FULL | 43 | R$ 2.193 | R$ 28 | **R$ 2.165** |
| MARKETING | 3 | R$ 1.247 | R$ 0 | **R$ 1.247** |
| SHOWROOM | 10 | R$ 967 | R$ 0 | **R$ 967** |
| **TOTAL** | **4.251** | **R$ 876.773** | **R$ 47.972** | **R$ 818.801** |

> ⚠️ DRE Levantamento mostra R$ 881.339 — diferença de ~R$ 4.600 inclui AMAZON FULL que tem NFs separadas.

**Operações fiscais presentes no faturamento:**
- VENDA DE MERCADORIA: 4.197 NFs (98,7%)
- ACERTO DE CONSIGNAÇÃO: 4 NFs → ✅ confirma que acerto de consignação é receita real
- REMESSA DE DOAÇÃO OU BONIFICAÇÃO: 4 NFs → não fatura, custo
- DEVOLUÇÃO DE VENDA: 1 NF → devoluções existem mas são raras
- VENDA EBOOK: 1 NF

---

## 2. DRE Manual — Janeiro 2026

Fonte: `DRE/Levantamento por competencia.xlsx` (construído manualmente pela equipe)

### Receitas brutas (por canal)
| Canal | Bruto |
|-------|-------|
| SITE | R$ 301.546 |
| ATACADO | R$ 296.951 |
| Marketplaces (total) | R$ 191.703 |
| — AMAZON - MP | R$ 74.979 |
| — MERCADO LIVRE - MP | R$ 108.717 |
| — MERCADO LIVRE - FULL | R$ 2.193 |
| — AMAZON - FULL | R$ 5.814 |
| Livraria | R$ 90.172 |
| Showroom | R$ 967 |
| **TOTAL** | **R$ 881.339** |

> ℹ️ AMAZON FULL (R$ 5.814) aparece no DRE mas não no FATURAMENTO.xls — provavelmente NFs com série/modelo diferente ou GeraFinanceiro=0.

### Despesas detalhadas (extraídas do Levantamento)

| Categoria                    | Subcategoria                         | Valor Jan     |
| ---------------------------- | ------------------------------------ | ------------- |
| **Direitos Autorais**        | Arival Dias Casimiro                 | R$ 52.203     |
|                              | Eneias + Felipe                      | R$ 1.897      |
|                              | Outros (Marcos, Viviane, Nilson...)  | R$ 1.562      |
| **Total Direitos Autorais**  |                                      | **R$ 55.663** |
| **Comissões**                | Lucas                                | R$ 2.273      |
|                              | Bruno                                | R$ 1.485      |
| **Total Comissões**          |                                      | **R$ 3.758**  |
| **Taxas de Gateways**        | Mercado Pago                         | R$ 45.119     |
|                              | Amazon                               | R$ 21.745     |
|                              | Pagarme                              | R$ 9.630      |
|                              | Santander                            | R$ 269        |
|                              | Stone                                | R$ 53         |
| **Total Taxas**              |                                      | **R$ 76.817** |
| **Fretes**                   | Mandae                               | R$ 49.205     |
|                              | Modicos                              | R$ 4.139      |
|                              | To On Log                            | R$ 1.520      |
|                              | Transpo                              | R$ 1.096      |
| **Total Fretes**             |                                      | **R$ 55.960** |
| **Tráfego Pago/Publicidade** | Tráfego pago                         | R$ 79.778     |
|                              | Mercado Livre (ads)                  | R$ 15.375     |
|                              | Amazon (ads)                         | R$ 3.660      |
| **Total Marketing**          |                                      | **R$ 98.813** |
| **Co-produção**              | Cultura Cristã (provisão trimestral) | R$ 42.895     |

> ℹ️ O DRE é montado **manualmente** pela equipe todo mês. Igor é o responsável por puxar os relatórios de ML e Amazon. O modelo atual não é automático — é exatamente o problema que o HeziomOS precisa resolver.

---

## 3. Fluxo de Caixa Santander — Janeiro 2026

Fonte: `DFC/Fluxo Santander.xlsx`, aba `extrato-literarius`

| Métrica | Valor |
|---------|-------|
| Total entradas | R$ 573.137 |
| Total saídas | R$ 742.864 |
| **Saldo líquido mês** | **-R$ 169.727** |

> ⚠️ Saldo negativo em janeiro — mais pagamentos que recebimentos no Santander. Isso é normal se os recebimentos de gateways (MP, Stone, Pagarme) chegam com defasagem de 30d+ e são transferidos nos meses seguintes.

**Entradas por categoria:**

| Plano de Contas | Valor |
|-----------------|-------|
| TRANSFERENCIA ENTRE CONTAS | R$ 357.480 ← TEDs dos gateways |
| VENDA DE LIVROS | R$ 111.451 ← boletos + cartão diretamente |

**Principais saídas (excl. transferências internas):**

| Plano de Contas | Valor |
|-----------------|-------|
| Producao Material Proprio | -R$ 146.952 |
| Materiais Para Revenda | -R$ 69.361 |
| Frete Sobre Mercadorias | -R$ 53.895 |
| **Bonus** | **-R$ 45.064** ← alto — verificar se anual |
| Marketing E Publicidade | -R$ 43.389 |
| Remuneração Autônomos - Administração | -R$ 18.436 |
| Diretoria - PJ | -R$ 12.218 |
| Salarios A Pagar | -R$ 10.973 |
| Remuneração Autônomos - Marketing | -R$ 10.667 |
| Sistemas e Softwares | -R$ 10.054 |
| Remuneração Autônomos - Editorial | -R$ 10.000 |
| Empréstimos e financiamentos | -R$ 10.000 |
| Aluguel | -R$ 9.804 |
| Remuneração Autônomos - Expedição | -R$ 9.823 |

**Por Centro de Resultado:**

| CR | Valor |
|----|-------|
| TRANSFERENCIAS ENTRE CONTAS | R$ 357.480 |
| Receita de vendas | R$ 110.827 |
| Administrativo | -R$ 189.735 |
| Impressões (CMV) | -R$ 146.952 |
| CPC Offline | -R$ 93.038 |
| Expedição | -R$ 73.853 |
| CPC Online | -R$ 67.687 |
| Editorial | -R$ 35.588 |
| Financeiro | -R$ 9.902 |
| Livraria | -R$ 8.780 |
| Fiscal | -R$ 8.358 |
| Evento | -R$ 4.140 |

> ✅ **Conciliação Santander-Literarius perfeita** — a aba `literarius-santander` compara diariamente e a diferença é 0 em todos os dias. O Literarius captura 100% dos movimentos do Santander.

---

## 4. CMV — Top Produtos Janeiro 2026

Fonte: `CMV.xls` — 603 produtos ranqueados por faturamento. **Atenção: período pode ser acumulado, não apenas janeiro.**

| #   | Produto                                     | Bruto      | Líquido    | Un.   | Margem | Editora                      |
| --- | ------------------------------------------- | ---------- | ---------- | ----- | ------ | ---------------------------- |
| 1   | MAES ORANDO, DEUS AGINDO 2026 — PROJETO ANA | R$ 361.783 | R$ 152.213 | 2.418 | 64%    | ASSOC. EDITORA PRESBITERIANA |
| 2   | DEVOCIONAL MAES DA ALIANCA 2026             | R$ 200.353 | R$ 180.520 | 1.548 | 81%    | HEZIOM                       |
| 3   | Orando as Promessas de Deus — Arival        | R$ 85.054  | R$ 74.183  | 1.385 | 78%    | HEZIOM                       |
| 4   | Meditações em Provérbios Vol.2              | R$ 40.161  | R$ 33.799  | 388   | 81%    | ASSOC. EDITORA PRESBITERIANA |
| 5   | PLANNER MAES DA ALIANCA 2026                | R$ 38.308  | R$ 35.140  | 409   | 74%    | —                            |
| 6   | Meditações em Provérbios Vol.1              | R$ 39.520  | R$ 24.754  | 348   | 76%    | ASSOC. EDITORA PRESBITERIANA |
| 7   | O talão de cheques do banco da fé           | R$ 29.033  | R$ 25.151  | 433   | 79%    | ASSOC. EDITORA PRESBITERIANA |
| 8   | Forjados                                    | R$ 27.071  | R$ 18.960  | 293   | 81%    | ASSOC. EDITORA PRESBITERIANA |
| 9   | BIBLIA DA MULHER EXTRAORDINARIA - ROSA      | R$ 21.417  | R$ 20.816  | 99    | 53%    | EDITORA HAGNOS               |

**Margem bruta total CMV:** ~71% (custo total R$ 439K sobre líquido R$ 1.52M)

**Por editora:**

| Editora | Bruto | CMV% | Observação |
|---------|-------|------|------------|
| EXTERNO (sem nome) | R$ 1.169.373 | 29% | Possivelmente totalizador |
| ASSOC. EDITORA PRESBITERIANA | R$ 641.400 | 29% | Co-produção principal |
| HEZIOM | R$ 326.489 | 22% | Produção própria — maior margem |
| EDITORA HAGNOS | R$ 48.300–55K | 47% | Distribuída |

> ⚠️ **"PROJETO ANA"** = co-produção Mães Orando com IPP. Desconto médio de 58% sobre o bruto — é o maior produto em volume mas com margem comprimida. A investigar: qual o modelo de co-produção com a Presbiteriana?

---

## 5. Contas a Pagar — Top Credores (fev–dez 2026)

Fonte: `controle de contas a pagar.xls` — 863 títulos, **período fev–dez 2026**. Total: **R$ 7.78M**

| Credor | Valor Total | Categoria |
|--------|-------------|-----------|
| ASSOC. EDITORA PRESBITERIANA | R$ 856.930 | CMV — materiais co-produção |
| IPSIS GRAFICA E EDITORA | R$ 526.764 | CMV — impressão |
| Promove Artes Graficas | R$ 269.188 | CMV — impressão |
| MANDAE | R$ 267.564 | Frete — logística |
| Arival Dias Casimiro | R$ 264.574 | Direitos autorais |
| JOAO GABRIEL NOVAIS | R$ 199.558 | RH (autônomo) |
| LAW CONSULTORIA EMPRESARIAL | R$ 110.175 | Jurídico/contábil |
| Paris Arrais Editoracao LTDA | R$ 110.000 | Editorial |
| IGREJA PRESBITERIANA DE PINHEIROS | R$ 110.000 | Co-produção |
| EDITORA HAGNOS LTDA | R$ 91.458 | Materiais para revenda |
| IAGO BARRIOS MEDEIROS | R$ 84.700 | RH (autônomo) |
| Igor Santos Correia Rocha | R$ 74.250 | RH (Igor — analista financeiro?) |
| BIANCA DE ASSIS FARIAS | R$ 73.335 | RH |
| Receita Federal | R$ 71.500 | Impostos/DARFs |
| CONTABIL RIBEIRO | R$ 44.693 | Contabilidade |
| LITERARIUS | **R$ 35.585** | ERP — licença |

> ℹ️ **LITERARIUS** (ERP) custa R$ 35.585 em obrigações registradas — confirma que é um custo fixo recorrente. Valor mensal ~R$ 2.965.

---

## 6. Estrutura DRE Real — Descobertas

### Centro de Resultado — confirmados no extrato

| CR | Tipo |
|----|------|
| Receita de vendas | Receita |
| Impressões (CMV) | CMV |
| CPC Offline | Custo/despesa canal offline |
| CPC Online | Custo/despesa canal online |
| Expedição | Despesa operacional |
| Editorial | Despesa operacional |
| Administrativo | Despesa administrativa |
| Financeiro | Despesa financeira |
| Livraria | Despesa operacional |
| Fiscal | Impostos e DARFs |
| Evento | Despesa operacional |
| TRANSFERENCIAS ENTRE CONTAS | Excluir do DRE |

### "Cod XXXX" no PlanoConta — RESOLVIDO

A aba `Planilha1` do Fluxo Santander revela que os códigos "Cod XXXX" (1082, 1138, 1170, etc.) têm **conta contábil 64** e são agrupados como `Cod 0561 | Cod 1082 | Cod 1138 | ...`. Isso confirma que são **DARF e tributos** — recolhimentos de impostos (Receita Federal, INSS, etc.), não despesas operacionais. Devem ficar na linha "Fiscal" do DRE.

### Plano de Contas mapeado completo (da Planilha1):

O extrato Santander contém um mapeamento completo de Plano de Contas → Conta Contábil. Contas identificadas mas faltantes no Literarius:
- `Despesas Eventos Externos` (247), `Despesas Custos Eventos` (Evento)
- `Pedágio` (711 — ligado a Frete)
- `Vale Refeição` (202), `Vale Transporte` (201), `Vale Cesta Básica` (203)
- `Capacitação Profissional` (211), `Bolsa de Estudos` (211)
- `Bens de pequeno valor` (41), `Bens Imobilizados` (263)
- `FGTS` (categoria fiscal)

---

## 7. ML Full — Entendimento Confirmado

Fonte: `DRE/ml full.xls` — 43 NFs individuais de janeiro.

- Canal ML Full emite **NF-e Modelo 55** individual para cada cliente (com nome e CPF)
- Operação fiscal: "Venda de mercadorias" (diferente do ML MP)
- Produtos vendidos: maioria R$ 30,90–R$ 99,90 (livros de menor preço)
- Faturamento total: R$ 2.193 em 43 transações = ticket médio R$ 51
- Canal **não** foi incluído no filtro `GeraFinanceiro=1` no Literarius — confirma análise anterior

---

## 8. Premissas Confirmadas / Novas Descobertas

### ✅ Confirmadas
- Conciliação Santander-Literarius 100% precisa
- Direitos autorais de Arival = R$ 52K/mês = despesa dominante na categoria (94%)
- O DRE é construído manualmente todo mês pela equipe (Igor coordena relatórios ML/Amazon)
- ML Full emite NF individual por cliente (não agrupada)
- LITERARIUS tem custo de licença de ~R$ 2.965/mês

### 🔴 Novas dúvidas críticas

1. **CMV.xls — período**: cobre apenas janeiro ou é acumulado? Os volumes sugerem acumulado.
2. **Bonus de R$ 45.064 em janeiro**: é pagamento anual (13º, PLR) ou recorrente? Impacta DRE operacional.
3. **Saldo Santander negativo em janeiro (-R$ 169K)**: os pagamentos superam as entradas. Os gateways (MP, Pagarme) repassam com defasagem? Qual é o prazo médio de repasse?
4. **"PROJETO ANA"**: qual é a estrutura do contrato de co-produção de Mães Orando com IPP? A Heziom compra, co-produz ou apenas distribui?
5. **Cultura Cristã (R$ 42.895/mês, provisão trimestral)**: é distribuição, co-produção ou licença?
6. **LAW CONSULTORIA (R$ 110K/ano)**: o que faz? Jurídico? Compliance?
7. **Igor Santos Correia Rocha (R$ 74.250/ano)**: é o analista financeiro? RH fixo?
8. **CC 6277/9094/7369**: essas contas têm fluxo próprio — são filiais, caixas ou gatilhos de conciliação?
9. **Amazon Full (R$ 5.814 no DRE)**: por que não aparece no FATURAMENTO.xls? Quais NFs emite?

---

Ver também: [[Análise Conexão Direta DB]] · [[Premissas e Entendimentos]] · [[DRE e Fluxo de Caixa]] · [[Dúvidas para Insights do CEO]]
