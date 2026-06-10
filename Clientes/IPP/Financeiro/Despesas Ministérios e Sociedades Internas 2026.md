---
title: Despesas IPP — Ministérios e Sociedades Internas (2026)
cliente: IPP — Igreja Presbiteriana de Pinheiros
fonte: API Prover · GET /exportacao/lancamentos-financeiros
periodo: 2026-01-01 a 2026-06-10
tags: [ipp, financeiro, ministerios, sociedades-internas, reembolso]
---

# Despesas — Ministérios e Sociedades Internas (IPP, 2026 jan–10/jun)

> Recorte focado das despesas dessas duas categorias, da extração do Prover em 2026-06-10.
> ⚠️ Agregado, **sem PII**. Nomes/CPF dos beneficiários ficam só no bruto local (`data/`, gitignored).

## Visão geral

| Categoria | Despesa total | Lançamentos |
|-----------|------:|--:|
| MINISTÉRIOS | R$ 530238,04 | 356 |
| SOCIEDADES INTERNAS | R$ 921724,23 | 407 |
| **Soma** | **R$ 1451962,27** | **763** |

## Quem recebe: pessoa física (reembolso) vs. fornecedor

> O ângulo que importa para o **IPP Reembolsos**: quanto dessas despesas é pago a **pessoas físicas** (líderes que gastaram e foram ressarcidos) vs. **fornecedores/empresas**.

| Categoria | A pessoa física | Pessoas | Lanç. | Ticket médio | A fornecedor | Forn. |
|-----------|------:|--:|--:|------:|------:|--:|
| MINISTÉRIOS | R$ 27168,65 | 14 | 51 | R$ 532,72 | R$ 473397,42 | 48 |
| SOCIEDADES INTERNAS | R$ 142448,66 | 41 | 85 | R$ 1675,87 | R$ 718290,45 | 74 |

**No semestre, ~R$ 169617,31 foram pagos diretamente a pessoas físicas** (136 lançamentos, 52 pessoas distintas) nessas duas categorias — é a ordem de grandeza que um fluxo estruturado de reembolso passaria a controlar. Tickets de R$ 37 a ~R$ 20 mil.

## MINISTÉRIOS — detalhe

**Total: R$ 530238,04** em 356 lançamentos.

**Por item (sociedade/ministério):**

| Item | Lanç. | Despesa |
|------|--:|------:|
| MÚSICA | 42 | R$ 155638,72 |
| ECC | 131 | R$ 153704,53 |
| UNO | 23 | R$ 94948,49 |
| EBD - INFANTIL | 59 | R$ 46261,37 |
| CASAIS | 15 | R$ 41593,44 |
| GRUPO DE PASTOREIO | 37 | R$ 13910,57 |
| GEPAMDA | 15 | R$ 7483,17 |
| GERAÇÃO DE OURO | 22 | R$ 7222,74 |
| RECEPÇÃO | 3 | R$ 3923,00 |
| EBD - ADULTOS | 5 | R$ 3001,20 |
| ACONSELHAMENTO | 4 | R$ 2550,81 |

**Por mês:**

| Mês | Despesa |
|-----|------:|
| 2026-01 | R$ 68956,17 |
| 2026-02 | R$ 62458,22 |
| 2026-03 | R$ 89494,22 |
| 2026-04 | R$ 205274,74 |
| 2026-05 | R$ 73148,45 |
| 2026-06 | R$ 30906,24 |

**Por forma de pagamento:**

| Forma | Despesa |
|-------|------:|
| PIX | R$ 172984,69 |
| TED | R$ 162196,78 |
| BOLETO | R$ 126260,05 |
| TRANSFERÊNCIA | R$ 39757,84 |
| CARTÃO DE CRÉDITO | R$ 29038,68 |

## SOCIEDADES INTERNAS — detalhe

**Total: R$ 921724,23** em 407 lançamentos.

**Por item (sociedade/ministério):**

| Item | Lanç. | Despesa |
|------|--:|------:|
| INPACTO | 72 | R$ 215158,56 |
| UCP | 90 | R$ 165344,12 |
| UMP | 87 | R$ 130651,39 |
| CONSELHO | 20 | R$ 114062,87 |
| JUNTA DIACONAL | 12 | R$ 109144,25 |
| UPA | 31 | R$ 91375,65 |
| UPH | 41 | R$ 40097,53 |
| CORAL | 9 | R$ 22255,05 |
| SAF | 19 | R$ 15473,05 |
| MULHER ESPERANÇA | 15 | R$ 14128,09 |
| DESIGN DIVINO | 5 | R$ 3019,06 |
| EJC | 6 | R$ 1014,61 |

**Por mês:**

| Mês | Despesa |
|-----|------:|
| 2026-01 | R$ 103493,19 |
| 2026-02 | R$ 108058,35 |
| 2026-03 | R$ 154925,96 |
| 2026-04 | R$ 294764,29 |
| 2026-05 | R$ 174393,52 |
| 2026-06 | R$ 86088,92 |

**Por forma de pagamento:**

| Forma | Despesa |
|-------|------:|
| PIX | R$ 355847,54 |
| BOLETO | R$ 254829,81 |
| TED | R$ 194798,10 |
| TRANSFERÊNCIA | R$ 54934,73 |
| CARTÃO DE CRÉDITO | R$ 38554,05 |
| (n/d) | R$ 22760,00 |

---

## Leituras para o projeto

- **PIX é o meio dominante** de pagamento nessas categorias — coerente com ressarcir líderes individualmente.
- **Abril concentra o maior gasto** nas duas categorias (picos de R$ 205 mil em Ministérios e R$ 295 mil em Sociedades) — investigar o que aconteceu (evento/campanha).
- Em **Ministérios**, MÚSICA e ECC puxam o gasto; em **Sociedades**, INPACTO, UCP e UMP.
- O pagamento a pessoa física hoje **não tem trilha de aprovação/comprovante** no Prover — é exatamente o gap que o IPP Reembolsos preenche.

*Bruto local: `ippreembolsos/data/` (gitignored). Fonte: ver [[API Prover - Mapeamento Completo]] e [[Relatório Financeiro 2026 (jan-jun)]].*