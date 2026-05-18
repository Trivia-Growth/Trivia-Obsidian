---
tipo: auditoria
projeto: angioclam-relatorio-eficiencia
data: 2026-05-13
tags:
  - auditoria
  - bugs
  - skill-v1
parent: "[[00 - Sistema Angioclam - MOC]]"
---

# 02 - Auditoria do PDF Original

## Contexto

PDF gerado pela skill v1 para a SulAmérica, antes do envio. Auditoria fez validação número a número contra os 3 exports do Klingo (período 12/mai/2025 a 11/mai/2026).

## Volume processado

- 21.067 linhas em B1 (exames solicitados)
- 14.549 linhas em B2 (produção/faturamento)
- 4.092 linhas em B3 (atendimentos com comorbidades)
- Total: 39.708 linhas processadas

## Resultado da auditoria

### Pontos confirmados como CORRETOS no PDF

| Métrica | Status |
|---|---|
| Total procedimentos: 14.549 | ✅ |
| 3.855 consultas médicas (R$ 455.198,32) | ✅ |
| 1.075 consultas Angiologia | ✅ |
| 43 profissionais ativos | ✅ |
| ECG: 1.821 | ✅ |
| Ergometria: 749 (R$ 78.330) | ✅ |
| MAPA: 474, Holter: 304 | ✅ |
| Custos unitários R$ 104 ergo, R$ 236 doppler carótidas | ✅ |
| Perfil demográfico (58% F, 42% M, idade 47) | ✅ |
| Tese clínica geral | ✅ |

### Bugs identificados na skill v1

#### Bug 1 — Doppler de Carótidas inflado

**O que aconteceu:** A skill v1 contou 1.397 dopplers de carótidas somando todas as variações de grafia na planilha de solicitações (B1), sem deduplicar.

**Fórmula reconstruída:**
```
489 (DOPPLER ARTERIAL DE CARÓTIDAS E VERTEBRAIS)
+ 388 (DOPPLER ARTERIAL DE CARÓRTIDAS E VERTEBRAIS) ← typo Klingo
+ 336 (DOPPLER DE CARÓTIDAS E VERTEBRAIS COLORIDO)
+ 155 (DOPPLER ARTERIAL DE CAROTIDAS E VERTEBRAIS)
+ 22  (DUPLEX SCAN COLORIDO DE CARÓTIDAS E VERTEBRAIS)
+ 4   (DOPPLER DE CARÓTIDAS E VERTEBRAIS)
+ 3   (DOPPLER DE CAROTIDAS E VERTEBRAIS)
= 1.397
```

**Número correto:** 1.172 (B2, faturado real)

**Impacto:** endarterectomias evitadas caem de 28 para 23. Economia desse indicador cai de R$ 840k para R$ 690k.

#### Bug 2 — Comorbidades subestimadas em 30-65%

**O que aconteceu:** A skill v1 contou apenas pacientes que tinham TODAS as 7 comorbidades preenchidas (sim ou não), ignorando linhas com qualquer comorbidade faltando.

**Comparativo:**

| Comorbidade | PDF v1 | Real | Diferença |
|---|---|---|---|
| HAS | 429 | 577 | +34% |
| DM2 | 182 | 276 | +52% |
| Dislipidemia | 392 | 608 | +55% |
| DAC/IAM | 77 | 114 | +48% |
| Obesidade | 393 | 534 | +36% |
| Sedentarismo | 492 | 706 | +44% |
| AVC | 33 | 54 | +64% |

**Regra correta:** contar paciente único com SIM em qualquer atendimento, usando `id_paciente` como chave de deduplicação.

**Impacto:** subestima o risco da população. Corrigir FORTALECE a tese do relatório.

#### Bug 3 — Slide 3 com números contraditórios

**O que aconteceu:** No mesmo slide, dois conjuntos de números:
- Cards do topo: R$ 106,5k / ROI 0,86x
- Tabela à direita: R$ 240.000 / ROI 1,94x

Provavelmente sobra de versão anterior do cálculo no template.

**Impacto:** alto. Erro visível em 5 segundos por qualquer auditor.

#### Bug 4 — Cateterismo com dois preços

**O que aconteceu:** O mesmo procedimento aparece com valores diferentes:
- Slide 3: R$ 8.000
- Slide 7: R$ 10.000

**Valor correto:** R$ 10.000 (consistente com tabela documentada).

#### Bug 5 — Solicitações reais ignoradas

**O que aconteceu:** A skill v1 só olhou para o que a Angioclam **realizou** (consultas e exames faturados). Não considerou que a clínica **solicitou** procedimentos que foram realizados em outras unidades:

- 26 cintilografias solicitadas (skill diz "0")
- 2 cateterismos solicitados (skill diz "0")
- 27 AngioTC solicitadas (skill diz 28, próximo mas com regra diferente)

**Decisão travada:** apresentar AMBOS os números no slide (versão A: vs realizadas pela Angioclam; versão B: vs solicitadas).

## Pontos onde a auditoria ERROU (autocorreção)

Durante a auditoria, cometi dois erros que foram corrigidos:

### Erro 1: "Custo Doppler Venoso MMII pela metade"

**Afirmei (errado):** custo real é R$ 607, dobro do R$ 309 do PDF.

**Realidade:** o Doppler Venoso MMII tem `Qtd=2` em 997 das 1.008 linhas (exame bilateral faturado em linha única). Custo unitário real por lado: R$ 305,10, praticamente igual aos R$ 309 do PDF.

**Aprendizado:** sempre conferir a coluna `Qtd` antes de calcular custo médio.

### Erro 2: "36 cirurgias de varizes solicitadas"

**Afirmei (errado):** regex classificou crioescleroterapia como cirurgia de varizes.

**Realidade:** crioescleroterapia é tratamento estético ambulatorial, não cirurgia hospitalar. Zero cirurgias reais foram solicitadas. PDF estava certo nesse ponto.

**Aprendizado:** validar classificação clínica de cada categoria, não confiar apenas em regex.

## Links relacionados

- [[03 - Decisões Travadas]]
- [[10 - SKILL.md v2 - Conteúdo Completo]]
- [[12 - Taxonomia de Exames]]
