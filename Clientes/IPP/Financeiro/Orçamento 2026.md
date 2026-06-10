---
title: Orçamento 2026 — IPP (por departamento)
cliente: IPP — Igreja Presbiteriana de Pinheiros
fonte: imagem enviada por JG (verba orçada mensal e total 2026)
tags: [ipp, reembolso, orcamento, departamentos]
---

# Orçamento 2026 — IPP

> Verba orçada por departamento para 2026. **Orçado mensal × 12 = total anual** (valor mensal uniforme). Fonte: tabela enviada por JG em 2026-06-10. A planilha de orçado vs. realizado (até abril) será enviada depois.

## Ministérios — orçado R$ 958.416,16/ano

| Departamento | Mensal | Anual |
|--------------|------:|------:|
| Aconselamento | 606,78 | 7.281,37 |
| Casais | 4.116,43 | 49.397,21 |
| ECC | 26.666,67 | 320.000,00 |
| UNO | 5.017,93 | 60.215,16 |
| EBD/Adultos | 323,61 | 3.883,32 |
| EBD/Infantil | 7.292,55 | 87.510,64 |
| GPAMDA | 1.585,35 | 19.024,15 |
| Geração de Ouro | 1.325,38 | 15.904,54 |
| Grupo de Pastoreio, Discipulado e Visitação | 2.060,40 | 24.724,79 |
| Mulher Esperança | 2.781,44 | 33.377,27 |
| Música e Coral | 26.530,33 | 318.363,99 |
| Recepção | 1.561,14 | 18.733,73 |
| **Total** | **79.868,01** | **958.416,16** |

## Sociedades Internas — orçado R$ 1.722.134,76/ano

| Departamento | Mensal | Anual |
|--------------|------:|------:|
| Conselho | 8.488,63 | 101.863,51 |
| EJC | 16.280,36 | 195.364,28 |
| Junta Diaconal | 19.768,26 | 237.219,09 |
| SAF | 4.060,47 | 48.725,67 |
| Design-Divino | 8.264,74 | 99.176,88 |
| UCP | 24.709,55 | 296.514,61 |
| UMP | 16.472,68 | 197.672,15 |
| INPACTO | 15.162,99 | 181.955,91 |
| UPA | 19.893,28 | 238.719,35 |
| UPH | 10.410,28 | 124.923,32 |
| **Total** | **143.511,23** | **1.722.134,76** |

**Orçado total IPP 2026: R$ 2.680.550,92**

---

## ⚠️ Mapeamento orçamento ↔ Prover (regra de negócio crítica)

O agrupamento do **orçamento** difere do agrupamento **transacional do Prover** em alguns itens. O sistema precisa de uma camada de mapeamento (`departamento → categoria+item Prover`) para casar realizado e para exportar no formato do Prover.

| Departamento (orçamento) | No Prover |
|--------------------------|-----------|
| Música e Coral (Ministérios) | MÚSICA (Ministérios, 2.2.1.12) **+** CORAL (Sociedades, 2.2.2.02) |
| Mulher Esperança (Ministérios) | MULHER ESPERANÇA (Sociedades, 2.2.2.12) |
| GPAMDA | GEPAMDA (grafia difere) |
| Grupo de Pastoreio, Discipulado e Visitação | GRUPO DE PASTOREIO (2.2.1.10) |
| Design-Divino | DESIGN DIVINO / DESING DIVINO (grafia duplicada no Prover) |

> A tabela definitiva de plano de contas (categoria + item por departamento) virá com o **template padrão de importação do Prover** que JG vai enviar. Até lá, o mapeamento acima é a referência.

> Relacionados: [[Departamentos (Sociedades e Ministérios)]] · [[Despesas Ministérios e Sociedades Internas 2026]] · [[Arquitetura e Fluxos]]
