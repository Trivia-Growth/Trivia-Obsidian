---
tipo: contexto
projeto: angioclam-relatorio-eficiencia
data: 2026-05-13
tags:
  - contexto
  - angioclam
  - operadoras
parent: "[[00 - Sistema Angioclam - MOC]]"
---

# 01 - Contexto do Projeto

## O que é a Angioclam

Clínica especializada em **angiologia e cardiologia**, com duas unidades:
- Clínica Angioclam Villas (principal)
- Clínica Angioclam Guarajuba

Foco em **prevenção, diagnóstico e tratamento de doenças cardiovasculares**, com atuação baseada em rastreamento (ergometrias, dopplers, ECGs) para evitar procedimentos invasivos hospitalares.

## Sistema de origem dos dados: Klingo

O Klingo é o sistema de gestão da clínica. Exporta 3 tipos principais de relatório usados neste projeto:

| Tipo | Arquivo padrão | Conteúdo |
|---|---|---|
| Atendimentos + comorbidades | `data (XX).xlsx` | Cada linha = 1 atendimento, com 7 colunas de comorbidade |
| Exames solicitados | `relatorio (XX).csv` | Cada linha = 1 exame solicitado pelo médico |
| Produção/faturamento | `relatorio (XX).csv` | Cada linha = 1 procedimento faturado para a operadora |

**Limitações conhecidas do Klingo:**
- Mesmo exame com até 5 grafias diferentes (Doppler Carótidas tem 7 variações)
- Typos sistêmicos ("CARÓRTIDAS", "ABDOMEM")
- Coluna Especialidade vazia em 47% das linhas em B1
- Idade armazenada como texto ("46 anos")
- Valor monetário em formato brasileiro
- Pode mudar nome de coluna entre exports

## Objetivo do relatório

Demonstrar para operadoras de saúde (SulAmérica, Bradesco, Amil, Unimed, etc) que a atuação criteriosa da Angioclam **gera economia substancial** ao evitar procedimentos invasivos caros.

A lógica é simples: exames de rastreamento (ergometria, dopplers, consultas) funcionam como **filtro clínico**, encaminhando para procedimentos de alto custo (cintilografia, cateterismo, cirurgias) apenas os casos que realmente precisam.

## Operadora-alvo principal: SulAmérica

- **Cor identidade visual**: `#771F1F` (vinho escuro) — nunca azul
- **Período do relatório atual**: 12/05/2025 a 11/05/2026
- **Status**: PDF original ainda não foi enviado, está em revisão

## Indicadores do relatório (5 indicadores)

| # | Base (rastreamento) | Evita | Custo evitado convencionado |
|---|---|---|---|
| 1 | Ergometria | Cintilografia | R$ 2.500 |
| 2 | Ergometria | Cateterismo | R$ 10.000 |
| 3 | Doppler Venoso MMII | Cirurgia de varizes | R$ 10.000 |
| 4 | Consulta Angiologia | AngioTC (10%) + Cateterismo (1%) | R$ 1.500 / R$ 10.000 |
| 5 | Doppler Carótidas | Endarterectomia/Angioplastia | R$ 30.000 |

## Histórico resumido

| Data | Marco |
|---|---|
| Pré-mai/2026 | Skill v1 desenvolvida, gerou primeiro PDF para SulAmérica |
| 13/mai/2026 | Sergio enviou PDF + planilhas para revisão técnica |
| 13/mai/2026 | Auditoria identificou 5 bugs na skill v1 |
| 14/mai/2026 | Motor Python v2 e SKILL.md v2 entregues |
| 14/mai/2026 | HTML gerado pela skill v2 validado (100% aderência) |
| 14/mai/2026 | Sergio aprovou e levantou requisitos para sistema final |

## Links relacionados

- [[02 - Auditoria do PDF Original]]
- [[03 - Decisões Travadas]]
- [[20 - Design das 3 Camadas]]
