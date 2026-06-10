---
title: Departamentos IPP — Sociedades Internas e Ministérios
cliente: IPP — Igreja Presbiteriana de Pinheiros
fonte: API Prover (itens das categorias SOCIEDADES INTERNAS e MINISTÉRIOS), 2026-01 a 2026-06
tags: [ipp, reembolso, departamentos, cadastro-base]
---

# Departamentos da IPP — Sociedades Internas e Ministérios

> Lista-base para o **IPP Reembolsos**. Cada departamento tem uma **verba orçada/ano** e a maioria das despesas é feita por **reembolso**. Os valores abaixo são o **realizado (saída)** de 2026 (jan–10/jun) extraído do Prover. O **orçado NÃO vem do Prover** — terá de ser cadastrado.

## Sociedades Internas (13)

| Cód. despesa | Departamento | Realizado 2026 (jan–jun) | Lanç. |
|------|--------------|------:|--:|
| 2.2.2.10 | INPACTO | R$ 215.158,56 | 85 |
| 2.2.2.06 | UCP — União de Crianças Presbiterianas | R$ 165.344,12 | 335 |
| 2.2.2.07 | UMP — União de Mocidade Presbiteriana | R$ 130.651,39 | 657 |
| 2.2.2.01 | CONSELHO | R$ 114.062,87 | 20 |
| 2.2.2.04 | JUNTA DIACONAL | R$ 109.144,25 | 12 |
| 2.2.2.08 | UPA — União Presbiteriana de Adolescentes | R$ 91.375,65 | 331 |
| 2.2.2.09 | UPH — União Presbiteriana de Homens | R$ 40.097,53 | 458 |
| 2.2.2.02 | CORAL | R$ 22.255,05 | 9 |
| 2.2.2.05 | SAF — Sociedade Auxiliadora Feminina | R$ 15.473,05 | 19 |
| 2.2.2.12 | MULHER ESPERANÇA | R$ 14.128,09 | 15 |
| 2.2.2.11 | DESIGN DIVINO | R$ 3.019,06 | 5 |
| 2.2.2.03 | EJC | R$ 1.014,61 | 35 |
| — | *(DESING DIVINO — grafia duplicada, só entradas)* | R$ 0,00 | 721 |

**Total realizado: R$ 921.724,23**

## Ministérios (11)

| Cód. despesa | Departamento | Realizado 2026 (jan–jun) | Lanç. |
|------|--------------|------:|--:|
| 2.2.1.12 | MÚSICA | R$ 155.638,72 | 42 |
| 2.2.1.15 | ECC — Encontro de Casais com Cristo | R$ 153.704,53 | 258 |
| 2.2.1.16 | UNO | R$ 94.948,49 | 183 |
| 2.2.1.04 | EBD — INFANTIL | R$ 46.261,37 | 59 |
| 2.2.1.02 | CASAIS | R$ 41.593,44 | 407 |
| 2.2.1.10 | GRUPO DE PASTOREIO | R$ 13.910,57 | 37 |
| 2.2.1.14 | GEPAMDA | R$ 7.483,17 | 15 |
| 2.2.1.09 | GERAÇÃO DE OURO | R$ 7.222,74 | 22 |
| 2.2.1.13 | RECEPÇÃO | R$ 3.923,00 | 3 |
| 2.2.1.03 | EBD — ADULTOS | R$ 3.001,20 | 5 |
| 2.2.1.01 | ACONSELHAMENTO | R$ 2.550,81 | 4 |

**Total realizado: R$ 530.238,04**

## Observações para o cadastro

- **Códigos:** no Prover cada departamento tem um par de códigos — receita (`1.2.xx` ministérios / `1.3.xx` sociedades) e despesa (`2.2.1.xx` / `2.2.2.xx`). Esse código é a chave para casar **realizado** com o **orçado**.
- **Qualidade de dado:** "DESIGN DIVINO" aparece com **duas grafias** ("DESING DIVINO"). Padronizar no cadastro.
- **Orçado:** não existe na API do Prover. O sistema precisa de uma fonte de orçamento anual por departamento (planilha da tesouraria?) — **decisão pendente**.
- **Realizado:** vem do Prover (`GET /exportacao/lancamentos-financeiros`), filtrando por categoria + item. Atualizável periodicamente.
