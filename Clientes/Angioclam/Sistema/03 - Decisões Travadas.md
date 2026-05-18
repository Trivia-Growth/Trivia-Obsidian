---
tipo: decisoes
projeto: angioclam-relatorio-eficiencia
data: 2026-05-14
tags:
  - decisoes
  - regras-negocio
parent: "[[00 - Sistema Angioclam - MOC]]"
---

# 03 - Decisões Travadas

Decisões de regra de negócio fechadas durante a auditoria e desenvolvimento da skill v2. Todas validadas com Sergio.

## Decisão 1: Fonte para Consultas de Angiologia

**Decisão:** usar Base 2 (CSV de produção) com filtro `Categoria = CONSULTAS AND Especialidade contém ANGIO`.

**Razões:**
- Reproduz exatamente o número do PDF original (1.075)
- Tem valor faturado associado
- Tem ID Atend para deduplicação
- Reflete o que a operadora pagou efetivamente

**Alternativa rejeitada:** Base 3 (XLSX) que daria 1.123, inclui consultas não faturadas.

## Decisão 2: Tratamento de pacientes sem registro em B3

**Decisão:** incluir com id sintético negativo (-1, -2, ...) e tratar todas as comorbidades como NÃO.

**Razão:** mantém a contagem geral correta sem inflar artificialmente comorbidades.

## Decisão 3: Apresentação dupla de "evitadas"

**Decisão:** mostrar 2 versões em cada indicador:
- **Versão A:** evitadas vs realizadas pela Angioclam (cálculo otimista)
- **Versão B:** evitadas vs solicitadas pelos médicos (cálculo conservador)

**Razão:** transparência. Não esconder que houve solicitações que viraram exames em outras unidades.

## Decisão 4: Convenção de Qtd para exames bilaterais

**Decisão:** 1 linha do CSV = 1 exame bilateral, mesmo com Qtd=2.

**Procedimentos afetados:**
- DOPPLER COLORIDO VENOSO DE MEMBRO INFERIOR
- DOPPLER COLORIDO ARTERIAL DE MEMBRO INFERIOR
- DOPPLER COLORIDO ARTERIAL DE MEMBRO SUPERIOR
- DOPPLER COLORIDO VENOSO DE MEMBRO SUPERIOR
- DOPPLER COLORIDO DE ORGÃO OU ESTRUTURA ISOLADA

**Razão:** interpretação clínica padrão. Um exame bilateral é um exame, não dois.

## Decisão 5: Doppler de Carótidas - fonte

**Decisão:** usar Base 2 (faturado real, 1.172), não soma de Base 1.

**Razão:** corrige o bug 1 da skill v1. O que importa é o que foi efetivamente realizado e faturado.

## Decisão 6: Comorbidades - método de contagem

**Decisão:** contar paciente único (`id_paciente.nunique()`) com SIM em **qualquer atendimento** do período.

**Não usar:** contagem por linhas, ou apenas linhas com todas as 7 comorbidades preenchidas.

## Decisão 7: Custos unitários travados

### Custos dos exames realizados pela Angioclam

| Exame | Custo unitário |
|---|---|
| Ergometria | R$ 104 |
| Doppler Venoso MMII | R$ 309 (por exame bilateral) |
| Doppler Carótidas | R$ 236 |
| Consulta Angiologia | R$ 115 |

### Custos dos procedimentos evitados (convencionados)

| Procedimento | Custo |
|---|---|
| Cintilografia | R$ 2.500 |
| Cateterismo | R$ 10.000 (em TODOS os slides) |
| AngioTC | R$ 1.500 |
| Cirurgia de varizes | R$ 10.000 |
| Endarterectomia/Angioplastia | R$ 30.000 |

**Importante:** o cateterismo deve ser **R$ 10.000 em todos os slides**, sem exceção. Bug histórico da skill v1.

## Decisão 8: Benchmarks de incidência clínica

| Indicador | Base | Taxa |
|---|---|---|
| 1 | Ergometria → Cintilografia | 15% |
| 2 | Ergometria → Cateterismo | 5% |
| 3 | Doppler Venoso MMII → Varizes | 5% |
| 4a | Consulta Angio → AngioTC | 10% |
| 4b | Consulta Angio → Cateterismo | 1% |
| 5 | Doppler Carótidas → Endarterectomia | 2% |

**Pendente:** documentar fonte de cada benchmark (diretrizes SBC/SBACV, dados ANS). Sergio se comprometeu a buscar.

## Decisão 9: Paleta de cores por operadora

| Operadora | Cor | Detecção |
|---|---|---|
| SulAmérica | `#771F1F` (vinho) | "SULAM" |
| Bradesco | `#CC0000` (vermelho) | "BRADESCO" |
| Amil | `#003087` (azul escuro) | "AMIL" |
| Unimed | `#007A33` (verde) | "UNIMED" |
| Hapvida/NotreDame | `#1B2D6E` (azul marinho) | "HAPVIDA"/"NOTRE" |
| Porto Seguro | `#003366` (azul) | "PORTO" |
| Golden Cross | `#8B0000` (vermelho escuro) | "GOLDEN" |

**Regra absoluta:** SulAmérica é vinho, nunca azul.

## Decisão 10: Estrutura do relatório

9 slides em sequência vertical, formato HTML autossuficiente:
1. Capa
2. Perfil Epidemiológico
3. Controle de Solicitações (Indicador 4 - Consulta Angio)
4. Doppler de Carótidas (Indicador 5)
5. Panorama dos Atendimentos
6. Ergometria → Cintilografia (Indicador 1)
7. Ergometria → Cateterismo (Indicador 2)
8. Doppler Venoso MMII → Varizes (Indicador 3)
9. Consolidado

## Decisões pendentes (a definir)

- [ ] Fontes oficiais dos 6 benchmarks (Sergio)
- [ ] Tabela de custos editável por convênio (sistema futuro)
- [ ] Inclusão da Lenira no processo (quando)
- [ ] Papel da IA no sistema final (A, B ou C — ver [[22 - Papel da IA]])

## Links relacionados

- [[02 - Auditoria do PDF Original]]
- [[10 - SKILL.md v2 - Conteúdo Completo]]
- [[20 - Design das 3 Camadas]]
- [[22 - Papel da IA]]
