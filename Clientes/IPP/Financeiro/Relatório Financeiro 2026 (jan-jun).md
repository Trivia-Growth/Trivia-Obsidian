---
title: Relatório Financeiro IPP — 2026 (jan a 10/jun)
cliente: IPP — Igreja Presbiteriana de Pinheiros
fonte: API Prover · GET /exportacao/lancamentos-financeiros
periodo: 2026-01-01 a 2026-06-10
extraido_em: 2026-06-10
tags: [ipp, financeiro, relatorio, prover]
---

# Relatório Financeiro — IPP (2026, jan a 10/jun)

> Extraído da **API do Prover** (`GET /exportacao/lancamentos-financeiros`) em 2026-06-10.
> Instituição: **IGREJA PRESBITERIANA DE PINHEIROS**.
> ⚠️ **Dados agregados, sem PII.** Os lançamentos brutos (com nomes/CPF de doadores) ficam apenas localmente no repositório (`data/`, fora do Git). Não versionar dados pessoais no vault compartilhado.

## Resumo executivo

| Indicador | Valor |
|-----------|------:|
| Entradas (receitas) | **R$ 15.803.544,29** |
| Saídas (despesas) | **R$ 14.856.728,23** |
| Resultado do período | **R$ 946.816,06** (superávit) |
| Nº de lançamentos | 33.746 |
| Transferências entre contas (excluídas) | 512 |

*Transferências internas (`is_transferencia=1`) foram excluídas para não inflar receita/despesa. Valores de saída já vêm com sinal negativo na origem.*

## Por mês

| Mês | Entradas | Saídas | Resultado |
|-----|---------:|-------:|----------:|
| 2026-01 | R$ 4.219.890,33 | R$ 2.809.450,03 | R$ 1.410.440,30 |
| 2026-02 | R$ 3.341.017,92 | R$ 2.801.859,83 | R$ 539.158,09 |
| 2026-03 | R$ 4.126.826,31 | R$ 2.870.516,48 | R$ 1.256.309,83 |
| 2026-04 | R$ 3.987.285,08 | R$ 3.145.796,78 | R$ 841.488,30 |
| 2026-05 | R$ 93.692,08 | R$ 2.811.360,93 | R$ -2.717.668,85 |
| 2026-06 | R$ 34.832,57 | R$ 417.744,18 | R$ -382.911,61 |

> ⚠️ **Atenção:** as entradas de **maio e junho/2026 caem abruptamente** (R$ 93 mil e R$ 35 mil, vs. ~R$ 4 mi/mês). Quase certamente é **defasagem de lançamento** das receitas (dízimos/ofertas ainda não conciliados no Prover), não uma queda real de arrecadação. Conferir antes de usar como base.

## Receitas por categoria

| Categoria | Valor | % |
|-----------|------:|--:|
| DÍZIMOS E OFERTAS | R$ 14.987.031,49 | 94.8% |
| RECEITAS NÃO OPERACIONAIS | R$ 271.752,41 | 1.7% |
| SOCIEDADES INTERNAS | R$ 258.133,89 | 1.6% |
| MINISTÉRIOS | R$ 151.876,45 | 1.0% |
| ENTRADAS (ESTORNO) | R$ 63.217,88 | 0.4% |
| RECEITAS OPERACIONAIS | R$ 56.835,45 | 0.4% |
| PARCERIAS | R$ 14.696,72 | 0.1% |

*Os **dízimos e ofertas** representam 95% de toda a arrecadação.*

## Despesas por categoria (top 15)

| Categoria | Valor | % |
|-----------|------:|--:|
| REPASSES | R$ 7.035.946,03 | 47.4% |
| DESPESAS GERAIS | R$ 1.627.600,32 | 11.0% |
| TENDA | R$ 1.033.061,98 | 7.0% |
| SOCIEDADES INTERNAS | R$ 921.724,23 | 6.2% |
| AQUISIÇÕES DE PATRIMÔNIO | R$ 859.400,38 | 5.8% |
| DPTO PESS - ENCARGOS / BENEFÍCIOS | R$ 706.546,74 | 4.8% |
| DESPESAS NÃO OPERACIONAIS | R$ 639.437,06 | 4.3% |
| MINISTÉRIOS | R$ 530.238,04 | 3.6% |
| GABINETE PASTORAL | R$ 303.900,54 | 2.0% |
| MANUTENÇÃO DE PATRIMÔNIO | R$ 267.737,81 | 1.8% |
| DPTO PESS - CLT | R$ 224.544,27 | 1.5% |
| DESPESAS DE CONSUMO | R$ 182.953,20 | 1.2% |
| CULTOS | R$ 166.659,02 | 1.1% |
| GABINETE PAST - ENCARGOS / BENEFÍCIOS | R$ 81.216,23 | 0.5% |
| IMPOSTOS E TAXAS | R$ 78.586,81 | 0.5% |

## Despesas por centro de custo

| Centro de custo | Valor |
|-----------------|------:|
| REPASSES | R$ 6.925.946,03 |
| DESPESAS OPERACIONAIS | R$ 4.438.859,50 |
| RECURSOS HUMANOS | R$ 1.281.730,69 |
| SOCIEDADES INTERNAS | R$ 902.411,28 |
| DEPESAS NÃO OPERACIONAIS | R$ 640.210,94 |
| MINISTÉRIOS | R$ 547.182,41 |
| ENTRADAS (ESTORNOS) | R$ 67.676,73 |
| (não informado) | R$ 52.437,88 |
| EAD CURSOS | R$ 140,48 |
| PROJETO EXPANSÃO | R$ 132,29 |

## Despesas por forma de pagamento

| Forma | Valor |
|-------|------:|
| TRANSFERÊNCIA | R$ 7.047.748,31 |
| BOLETO | R$ 4.489.499,62 |
| PIX | R$ 1.101.437,71 |
| TED | R$ 1.082.014,56 |
| GUIA DE IMPOSTOS | R$ 429.926,15 |
| CARTÃO DE CRÉDITO | R$ 283.196,22 |
| DÉBITO EM CONTA | R$ 256.667,30 |
| (não informado) | R$ 58.620,00 |
| CHEQUE | R$ 57.112,62 |
| BANCO | R$ 26.488,74 |
| DINHEIRO | R$ 16.000,00 |
| CARTÃO DE DÉBITO | R$ 3.890,83 |
| DEPÓSITO EM CONTA | R$ 2.115,82 |
| OUTROS | R$ 2.010,35 |

## Pegada de reembolsos / adiantamentos

> Relevante para o projeto **IPP Reembolsos**. Busca por `reembolso/adiantamento/ressarcimento` em categoria, item, histórico e observação.

| Qtde | Valor | Categoria | Item |
|-----:|------:|-----------|------|
| 11 | R$ 52.657,95 | GABINETE PASTORAL | PASTORES AUXILIARES |
| 4 | R$ 36.000,00 | GABINETE PASTORAL | PASTOR EFETIVO |
| 1 | R$ 17.007,64 | DPTO PESS - CLT | OUTRAS |
| 1 | R$ 778,00 | DESPESAS GERAIS | LANCHES E COZINHA |
| 1 | R$ 240,00 | ENTRADAS (ESTORNO) | VALORES ESTORNADOS |
| 7 | R$ 225,49 | DESPESAS GERAIS | DESPESAS CX ADM |

*Apenas 25 lançamentos no período batem nessa busca — o reembolso hoje é **pouco estruturado** no Prover (aparece diluído em 'adiantamento' do gabinete pastoral e despesas gerais). Isso reforça a oportunidade do sistema de reembolsos.*

---

## Metodologia e ressalvas

- **Fonte:** API Prover, endpoint de exportação de lançamentos financeiros (read-only). Ver [[API Prover - Mapeamento Completo]].
- **Período:** 01/01/2026 a 10/06/2026.
- **Transferências** (`is_transferencia=1`): excluídas dos totais (512 lançamentos).
- **Sinais:** entradas positivas, saídas negativas na origem; resultado = entradas + saídas.
- **PII:** nomes e CPFs de doadores/fornecedores **não** entram neste relatório. Bruto só local em `ippreembolsos/data/` (gitignored).
- **Defesa de qualidade:** receitas de mai/jun parecem subnotificadas (defasagem de conciliação) — validar com a tesouraria da IPP.