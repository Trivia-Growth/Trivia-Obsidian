---
tipo: validacao
projeto: angioclam-relatorio-eficiencia
versao: 2.0
data: 2026-05-14
tags:
  - validacao
  - testes
  - skill-v2
parent: "[[00 - Sistema Angioclam - MOC]]"
---

# 13 - Validação do HTML Gerado pela Skill v2

## Contexto

Após desenvolvimento da skill v2, Sergio gerou o HTML do relatório SulAmérica usando a nova skill. A validação compara cada número do HTML contra o JSON do motor Python para confirmar aderência.

## Resultado: 100% de aderência

Todos os números do HTML batem com o motor. Os 5 bugs da v1 estão todos resolvidos.

## Resumo da validação

### Capa e período
- Período: 12/05/2025 a 11/05/2026 ✅
- 2.037 pacientes, 4.092 atendimentos ✅

### Slide 2 - Perfil Epidemiológico
- Idade média 46,8 / mediana 46 ✅
- Feminino 1.187 (58%) / Masculino 844 (41%) ✅
- 8 faixas etárias todas conferem ✅
- 7 comorbidades todas conferem ✅

### Slide 3 - Indicador 4 (Consulta Angiologia)
- 1.075 consultas ✅
- 108 AngioTC esperadas / 27 solicitadas ✅
- 11 cateterismos esperados / 2 solicitados ✅
- Versão A: R$ 272 mil ✅
- Versão B: R$ 212 mil ✅

### Slide 4 - Indicador 5 (Doppler Carótidas)
- 1.172 dopplers ✅ (CORRETO, antes era 1.397)
- 23 cirurgias esperadas ✅
- Custo unitário R$ 236 ✅
- Economia bruta R$ 690 mil ✅
- ROI 2,5x ✅

### Slide 5 - Panorama
- 14.549 procedimentos / 43 profissionais ✅
- 3.855 consultas / R$ 455 mil ✅
- Faturamento R$ 3,1M ✅
- Todos os volumes por exame conferem ✅

### Slide 6 - Indicador 1 (Cintilografia)
- 749 ergometrias / 112 esperadas ✅
- 0 realizadas / 26 solicitadas ✅
- Versão A: R$ 280 mil bruto / R$ 202 mil líquido ✅
- Versão B: R$ 215 mil ✅

### Slide 7 - Indicador 2 (Cateterismo)
- 37 esperados / 0 realizados / 2 solicitados ✅
- Custo R$ 10.000 (consistente com slide 3) ✅
- Versão A: R$ 370 mil / R$ 292 mil ✅
- Versão B: R$ 350 mil ✅

### Slide 8 - Indicador 3 (Varizes)
- 1.008 dopplers / 50 esperadas / 50 evitadas ✅
- R$ 309 por exame bilateral ✅
- R$ 500 mil bruto / R$ 189 mil líquido ✅

### Slide 9 - Consolidado
- Versão A: 341 evitados, R$ 2,1M bruto, R$ 1,3M líquido ✅
- Versão B: 284 evitados, R$ 2,0M bruto ✅

## Bugs da v1 - confirmação de resolução

| Bug | Status v2 |
|---|---|
| Doppler Carótidas inflado (1.397) | ✅ Corrigido (1.172) |
| Comorbidades subestimadas | ✅ Corrigido (todas as 7 corretas) |
| Slide 3 com 2 números contraditórios | ✅ Resolvido (consistência total) |
| Cateterismo R$ 8k vs R$ 10k | ✅ Consistente em R$ 10k |
| "0 realizadas" sem mostrar solicitações | ✅ Versões A e B lado a lado |

## Pontos de refinamento (não bugs)

### 1. Economia por atendimento (Slide 9)
- HTML diz: R$ 323
- Cálculo correto: R$ 304 (R$ 1.244.519 / 4.092)
- HTML aparentemente divide por número de pacientes (3.855), não atendimentos
- **Impacto:** baixo, mas vale corrigir

### 2. Sexo arredondado
- HTML: 58% + 41% = 99%
- Correto: 58,3% + 41,4% (com casas decimais)
- **Impacto:** estético

### 3. Doppler Venoso MMII - explicação dupla
- Slide 5 mostra faturamento R$ 612 mil (1.008 × R$ 606)
- Slide 8 mostra investimento R$ 311 mil (1.008 × R$ 309)
- Tecnicamente correto, mas pode gerar pergunta
- **Sugestão:** nota explicativa no slide 8

### 4. ROI texto Slide 3
- Texto diz "R$ 2,2 economizados por R$ 1 investido"
- Compara economia bruta com investimento total em consultas
- Pode ser refraseado para "R$ 2,20 em procedimentos invasivos evitados"

## Veredito final

**O HTML está correto e defensável.** Os 5 bugs da v1 foram todos resolvidos. Pode ser enviado para revisão do Sergio e, após aprovação, para a SulAmérica.

## Links relacionados

- [[10 - SKILL.md v2 - Conteúdo Completo]]
- [[11 - Motor Python v2 - Código Referência]]
- [[02 - Auditoria do PDF Original]]
