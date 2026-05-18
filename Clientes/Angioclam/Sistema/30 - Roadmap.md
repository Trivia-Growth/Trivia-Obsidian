---
tipo: roadmap
projeto: angioclam-relatorio-eficiencia
versao: 1.0
data: 2026-05-14
tags:
  - roadmap
  - planejamento
parent: "[[00 - Sistema Angioclam - MOC]]"
---

# 30 - Roadmap

## Visão estratégica

3 fases progressivas, da skill atual ao sistema integrado completo.

## Fase 0 — Validação atual (CONCLUÍDA)

**Período:** 13-14 maio 2026

- [x] Auditoria do PDF original da skill v1
- [x] Identificação dos 5 bugs
- [x] Construção da skill v2 (SKILL.md)
- [x] Motor Python v2 de referência
- [x] Taxonomia validada (100% B2, 97% B1)
- [x] HTML gerado validado contra motor
- [x] Documentação completa em Obsidian

## Fase 1 — Aprovação e primeiro envio (CURTO PRAZO)

**Período:** maio-junho 2026

**Objetivo:** validar a skill v2 com Sergio, gerar o relatório final e enviar à SulAmérica.

### Marcos

- [ ] Sergio aprova HTML gerado pela skill v2
- [ ] Decisão sobre os 4 pontos de refinamento (ver [[13 - Validação HTML Gerado]])
- [ ] Documentar fontes dos 6 benchmarks (Sergio)
- [ ] Versão final do relatório SulAmérica
- [ ] Envio formal à operadora
- [ ] Reunião de apresentação com operadora

### Riscos

- Operadora questionar metodologia → ter as fontes prontas
- Sergio querer ajustes de última hora → manter motor flexível

## Fase 2 — Refactor do motor (MÉDIO PRAZO)

**Período:** junho-julho 2026

**Objetivo:** preparar o motor Python para receber parâmetros editaveis e múltiplas planilhas.

### Marcos

- [ ] Refatorar `gerar_kpis()` para receber dicts de parâmetros
- [ ] Implementar detecção automática de tipo de planilha
- [ ] Implementar concatenação de N planilhas
- [ ] Implementar validação de schema
- [ ] Implementar streaming para volumes grandes
- [ ] Hash de execução para auditoria
- [ ] Suite de testes unitários (50+ casos)
- [ ] Testes de integração (10 cenários)
- [ ] Testes E2E com 3 datasets

### Entregáveis

- Motor v3 funcional e testado
- Documentação para a Lenira
- API REST para chamada externa (opcional)

## Fase 3 — Camada de IA (MÉDIO PRAZO)

**Período:** julho-agosto 2026

**Objetivo:** implementar Camada 2 (IA auditora + redatora).

### Marcos

- [ ] Definir formato exato do JSON de entrada da IA
- [ ] Construir prompt template para Papel A (auditora)
- [ ] Construir prompt template para Papel B (redatora)
- [ ] Implementar Camada 2 em Python
- [ ] Configurar Claude API
- [ ] Testar com dados reais
- [ ] Calibrar alertas

### Entregáveis

- Função `executar_camada_2()` integrada
- Logs de auditoria de cada execução
- Catálogo de tipos de alerta

## Fase 4 — Sistema integrado (LONGO PRAZO)

**Período:** agosto-outubro 2026

**Objetivo:** Lenira integra o motor no sistema principal da Angioclam.

### Marcos

- [ ] Reunião técnica com Lenira
- [ ] Decisões arquiteturais (banco de dados, API, frontend)
- [ ] Modelo de dados das operadoras
- [ ] Modelo de dados dos parâmetros
- [ ] Tela de configuração de operadoras
- [ ] Tela de upload de planilhas
- [ ] Tela de revisão dos KPIs
- [ ] Tela de edição manual (com audit log)
- [ ] Tela de aprovação e export
- [ ] Geração final de HTML/PDF
- [ ] Testes de aceitação com Sergio

### Entregáveis

- Sistema Angioclam com módulo de Relatórios
- Manual do usuário
- Manual de manutenção da taxonomia
- Onboarding de novas operadoras

## Fase 5 — Escala e expansão (LONGO PRAZO+)

**Período:** outubro 2026 em diante

**Objetivo:** ampliar uso do sistema.

### Possibilidades

- [ ] Replicar para outras operadoras (Bradesco, Amil, Unimed)
- [ ] Adicionar novos indicadores conforme demanda
- [ ] Dashboard histórico (comparativos temporais)
- [ ] Geração de relatórios em outros formatos (PowerPoint)
- [ ] Skill versão SaaS para outras clínicas (Trívia Studio como vendor)
- [ ] Integração direta com Klingo via API (se disponível)
- [ ] Camada de IA conversacional (Papel C)

## Decisões críticas pendentes

| Decisão | Quem decide | Quando |
|---|---|---|
| Aprovar HTML atual da skill v2 | Sergio | Curto prazo |
| Fontes oficiais dos benchmarks | Sergio | Antes do envio SulAmérica |
| Papel da IA (A, A+B, ou A+B+C) | JG + Sergio | Antes da Fase 3 |
| Quando envolver Lenira | Sergio | Início da Fase 2 |
| Stack tecnológico da interface | Lenira | Fase 4 |

## Métricas de sucesso

### Curto prazo
- Relatório SulAmérica enviado e aceito
- Zero erros encontrados pela operadora

### Médio prazo
- Sistema rodando dentro da Angioclam (Fase 4 concluída)
- 100% dos testes passando
- Tempo de geração de relatório < 1 minuto

### Longo prazo
- Pelo menos 3 operadoras usando o sistema
- Skill servindo de produto SaaS (Trívia Studio)
- Receita recorrente associada ao sistema

## Links relacionados

- [[00 - Sistema Angioclam - MOC]]
- [[20 - Design das 3 Camadas]]
- [[32 - Próximos Passos]]
