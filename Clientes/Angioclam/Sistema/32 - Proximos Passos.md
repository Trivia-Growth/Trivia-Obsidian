---
tipo: tarefas
projeto: angioclam-relatorio-eficiencia
data: 2026-05-14
tags:
  - tarefas
  - proximos-passos
  - todo
parent: "[[00 - Sistema Angioclam - MOC]]"
---

# 32 - Próximos Passos

## Status atual

Skill v2 funcionando e validada. HTML gerado tem 100% de aderência com o motor. Sergio levantou requisitos para sistema final.

## Bloqueios atuais

Nenhum bloqueio técnico. Aguardando decisões estratégicas do Sergio:

- [ ] Aprovação do HTML atual para envio à SulAmérica
- [ ] Definição do papel da IA no sistema final
- [ ] Definição de quando envolver Lenira
- [ ] Documentação das fontes dos benchmarks

## Tarefas por horizonte

### Imediato (esta semana)

- [ ] JG: enviar relatório Obsidian completo para Sergio
- [ ] Sergio: revisar e aprovar HTML da skill v2
- [ ] Sergio: decidir entre 3 caminhos (A/B/C) sobre papel da IA
- [ ] Sergio: buscar fontes oficiais dos 6 benchmarks

### Curto prazo (próximas 2 semanas)

- [ ] Ajustar HTML conforme feedback do Sergio
- [ ] Documentar fontes dos benchmarks no relatório
- [ ] Apresentação formal à SulAmérica
- [ ] Início do refactor do motor (parâmetros editáveis)

### Médio prazo (próximo mês)

- [ ] Refactor completo do motor Python v3
- [ ] Suite de testes implementada
- [ ] Documentação técnica para Lenira
- [ ] Reunião técnica com Lenira

### Longo prazo (próximos 3 meses)

- [ ] Camada de IA implementada
- [ ] Sistema integrado dentro da Angioclam
- [ ] Primeiros relatórios gerados pelo sistema final
- [ ] Validação de qualidade vs skill manual

## Decisões necessárias do Sergio

### Decisão 1: aprovação do HTML atual

**O que decidir:** o HTML gerado pela skill v2 pode ser enviado à SulAmérica?

**Contexto:** Validamos 100% dos números. 4 pontos pequenos de refinamento (ver [[13 - Validação HTML Gerado]]), nenhum crítico.

**Opções:**
- [ ] Sim, enviar como está
- [ ] Ajustar os 4 pontos antes
- [ ] Refazer com correções específicas

### Decisão 2: papel da IA

**O que decidir:** qual papel a IA terá no sistema final?

**Opções:**
- [ ] Papel A - apenas auditora
- [ ] Papel A + B - auditora + redatora (recomendado)
- [ ] Papel A + B + C - tudo, inclusive conversação

Ver detalhes em [[22 - Papel da IA]].

### Decisão 3: envolvimento da Lenira

**O que decidir:** quando passar o projeto para a Lenira integrar?

**Opções:**
- [ ] Já passar com documentação atual
- [ ] Esperar refactor do motor v3 (Fase 2)
- [ ] Esperar Camada de IA (Fase 3)
- [ ] JG faz tudo, Lenira só integra a interface

### Decisão 4: fontes dos benchmarks

**O que entregar:** documentação das 6 taxas de incidência.

| Benchmark | Taxa atual | Fonte necessária |
|---|---|---|
| Cintilografia/Ergo | 15% | ? |
| Cateterismo/Ergo | 5% | ? |
| Varizes/Doppler Ven | 5% | ? |
| AngioTC/Cons Angio | 10% | ? |
| Cateterismo/Cons Angio | 1% | ? |
| Endarterectomia/Doppler Car | 2% | ? |

**Fontes esperadas:**
- Diretrizes da Sociedade Brasileira de Cardiologia (SBC)
- Diretrizes da Sociedade Brasileira de Angiologia (SBACV)
- Dados da ANS
- Papers acadêmicos
- Tabela ANS / TUSS

## Riscos e mitigação

| Risco | Probabilidade | Mitigação |
|---|---|---|
| Operadora questionar benchmarks | Alta | Ter fontes citadas no relatório |
| Klingo mudar formato de export | Média | Schema validation aborta com erro claro |
| Volume futuro travar o motor | Baixa | Streaming implementado na Fase 2 |
| Lenira não conseguir integrar | Baixa | Documentação completa + API REST |
| Mudança de regra clínica | Média | Parâmetros editáveis (Fase 2) |

## Métricas de acompanhamento

### Curto prazo
- [ ] HTML aprovado por Sergio
- [ ] Relatório enviado à SulAmérica
- [ ] Resposta positiva da operadora

### Médio prazo
- [ ] Motor v3 funcionando
- [ ] Testes passando 100%
- [ ] Documentação completa

### Longo prazo
- [ ] Sistema integrado em produção
- [ ] N relatórios gerados pelo sistema
- [ ] Zero bugs reportados pela operadora

## Links relacionados

- [[30 - Roadmap]]
- [[31 - Mensagens e Conversas]]
- [[00 - Sistema Angioclam - MOC]]
