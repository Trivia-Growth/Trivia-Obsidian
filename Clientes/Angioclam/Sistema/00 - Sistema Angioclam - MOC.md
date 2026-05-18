---
tipo: moc
projeto: angioclam-relatorio-eficiencia
cliente: Angioclam
contato_principal: Sergio Pires
status: em-desenvolvimento
data_inicio: 2026-05-13
data_atualizacao: 2026-05-14
tags:
  - moc
  - angioclam
  - relatorio-operadoras
  - sistema
related:
  - "[[Angioclam - Hub]]"
  - "[[Heziom - Hub]]"
---

# Sistema de Relatório de Eficiência Clínica - Angioclam

## Visão geral

Sistema para geração automatizada do Relatório de Eficiência Clínica e Impacto Econômico da Angioclam para operadoras de saúde (SulAmérica, Bradesco, Amil, Unimed e outras). O sistema lê exports do Klingo, calcula indicadores de economia gerada para a operadora, e produz HTML/PDF para envio.

## Estado atual

A skill v2 está funcional e gerando relatórios corretos. Validada contra dados reais de 12 meses (mai/2025 a mai/2026, operadora SulAmérica). 100% de aderência entre HTML gerado e cálculos do motor.

Próxima etapa: evoluir para sistema integrado dentro do ecossistema Angioclam que a Lenira está desenvolvendo, com parâmetros editáveis por operadora, suporte a N planilhas, e camada de IA para mitigação e redação.

## Mapa de notas

### Contexto e estratégia
- [[01 - Contexto do Projeto]]
- [[02 - Auditoria do PDF Original]]
- [[03 - Decisões Travadas]]

### Skill atual (v2)
- [[10 - SKILL.md v2 - Conteúdo Completo]]
- [[11 - Motor Python v2 - Código Referência]]
- [[12 - Taxonomia de Exames]]
- [[13 - Validação HTML Gerado]]

### Sistema futuro (Lenira)
- [[20 - Design das 3 Camadas]]
- [[21 - Parâmetros Editáveis]]
- [[22 - Papel da IA]]
- [[23 - Robustez de Volume e N Planilhas]]
- [[24 - Bateria de Testes]]

### Operacional
- [[30 - Roadmap]]
- [[31 - Mensagens e Conversas]]
- [[32 - Próximos Passos]]

## Stakeholders

| Pessoa | Papel | Empresa |
|---|---|---|
| Sergio Pires | Dono da Angioclam, decisor | Angioclam |
| Lenira | Desenvolvedora do sistema maior Angioclam | Angioclam |
| JG (eu) | Estrategista e arquiteto | Trívia Studio |

## Indicadores de progresso

- [x] Auditoria do PDF original
- [x] Identificação dos 5 bugs da skill v1
- [x] Construção da skill v2 (SKILL.md)
- [x] Motor Python de referência
- [x] Taxonomia validada (100% B2, 97% B1)
- [x] HTML gerado validado
- [ ] Refactor do motor para parâmetros editáveis
- [ ] Documentação para a Lenira
- [ ] Camada de IA (auditora + redatora)
- [ ] Bateria de testes com múltiplos datasets
- [ ] Integração no sistema Angioclam
- [ ] Aprovação final do Sergio
- [ ] Envio do primeiro relatório à SulAmérica
