---
tipo: arquitetura
projeto: angioclam-relatorio-eficiencia
versao: 1.0
data: 2026-05-14
tags:
  - arquitetura
  - sistema-final
  - lenira
parent: "[[00 - Sistema Angioclam - MOC]]"
---

# 20 - Design das 3 Camadas

## Visão geral

O sistema final, integrado ao ecossistema Angioclam que a Lenira está construindo, terá **3 camadas independentes** com responsabilidades bem definidas. Esse design garante determinismo nos cálculos, transparência na auditoria, e supervisão humana antes do envio.

## Os 5 requisitos do sistema final (Sergio)

1. **Determinismo entre execuções** — mesma lógica, mesmas regras, sem variação aleatória
2. **Robustez de volume** — funciona com qualquer quantidade de planilhas e linhas
3. **Parâmetros editáveis** — custos e benchmarks editaveis por operadora
4. **Mitigação com IA** — IA valida e sugere edições antes do export
5. **Aprovação humana** — nada vai pra operadora sem revisão

## Arquitetura em 3 camadas

```
┌─────────────────────────────────────────────────────────┐
│  CAMADA 1 — MOTOR DETERMINÍSTICO (Python)               │
│                                                          │
│  Função: calcular TODOS os KPIs                          │
│                                                          │
│  • Lê as N planilhas Klingo (qualquer volume)            │
│  • Detecta tipo de cada arquivo pelo conteúdo            │
│  • Aplica taxonomia + dedup + regras travadas            │
│  • Recebe parâmetros editáveis como input                │
│  • Produz JSON com todos os KPIs                         │
│  • SEM IA — 100% reprodutível e auditável                │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  CAMADA 2 — MITIGAÇÃO COM IA (Claude API)                │
│                                                          │
│  Função: fiscalizar e enriquecer                         │
│                                                          │
│  • Recebe o JSON da camada 1                             │
│  • Roda checks de sanidade                               │
│  • Compara com histórico de relatórios anteriores        │
│  • Gera ALERTAS (não calcula nada novo)                  │
│  • Sugere textos para os slides                          │
│  • Adapta tom por operadora                              │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  CAMADA 3 — INTERFACE (Lenira)                           │
│                                                          │
│  Função: revisão humana e export final                   │
│                                                          │
│  • Tela com todos os KPIs visualmente                    │
│  • Painel de edição manual de qualquer número            │
│  • Painel de configuração dos parâmetros                 │
│  • Visualização dos alertas da IA                        │
│  • Aprovação humana obrigatória                          │
│  • Geração final do PDF/HTML                             │
└─────────────────────────────────────────────────────────┘
```

## Por que separar em 3 camadas

| Vantagem | Como funciona |
|---|---|
| Testabilidade | Cada camada testada isoladamente |
| Auditabilidade | Cálculo (Py) separado de narrativa (IA) |
| Manutenibilidade | Mudar regra clínica não mexe na IA |
| Segurança | IA não toca em números |
| Custo controlado | IA só roda 1x após cálculo |

## Princípio fundamental: IA NÃO CALCULA

A IA fiscaliza, sugere e escreve. **Não calcula KPI.**

| O que a IA FAZ | O que a IA NÃO FAZ |
|---|---|
| Validar consistência | Calcular benchmarks |
| Sugerir textos | Decidir números finais |
| Detectar anomalias | Aplicar regras de dedup |
| Comparar com histórico | Substituir o Python |

## Detalhamento das camadas

### Camada 1 - Motor Determinístico

**Tecnologia:** Python + pandas

**Inputs:**
- N planilhas Klingo (CSV, XLSX)
- Dicionário de parâmetros editáveis (custos + benchmarks)

**Outputs:**
- JSON estruturado com todos os KPIs
- Log de QA da execução

**Responsabilidades:**
- Validação de integridade dos arquivos
- Detecção automática de tipo
- Concatenação de múltiplos arquivos do mesmo tipo
- Aplicação da taxonomia
- Deduplicação de exames
- Identificação de pacientes
- Cálculo de todos os indicadores

Ver detalhes em: [[11 - Motor Python v2 - Código Referência]] e [[21 - Parâmetros Editáveis]]

### Camada 2 - Mitigação com IA

**Tecnologia:** Claude API (Sonnet ou Opus)

**Inputs:**
- JSON da Camada 1
- Histórico de JSONs anteriores (para comparação)
- Operadora e contexto

**Outputs:**
- Lista de alertas (anomalias detectadas)
- Textos sugeridos para os slides
- Insights destacáveis
- Avisos de risco para auditoria

**Responsabilidades:**
- Sanity checks (números fora do esperado)
- Comparação temporal (vs período anterior)
- Detecção de inconsistências internas
- Sugestões de narrativa
- Adaptação de tom por operadora

Ver detalhes em: [[22 - Papel da IA]]

### Camada 3 - Interface

**Tecnologia:** o que a Lenira definir (provavelmente web)

**Inputs:**
- JSON da Camada 1
- Outputs da Camada 2

**Outputs:**
- HTML/PDF do relatório aprovado

**Responsabilidades:**
- Tela de configuração de parâmetros por operadora
- Tela de upload de planilhas
- Tela de revisão dos KPIs
- Tela de edição manual (com log de auditoria)
- Visualização dos alertas da IA
- Aprovação humana
- Geração do arquivo final

## Fluxo completo da operação

1. **Configuração inicial** (uma vez por operadora)
   - Cadastrar operadora
   - Editar tabela de custos
   - Editar benchmarks
   - Definir paleta de cores

2. **Geração de relatório** (recorrente)
   - Upload das N planilhas Klingo
   - Sistema valida arquivos
   - Camada 1 calcula KPIs → JSON
   - Camada 2 audita e gera textos → alertas + narrativa
   - Camada 3 mostra tudo na tela
   - Humano revisa, edita se preciso
   - Aprova
   - Sistema gera PDF/HTML final

## Vantagens vs skill atual

| Aspecto | Skill v2 | Sistema 3-camadas |
|---|---|---|
| Parâmetros editáveis | Não | Sim |
| Volume ilimitado | Limitado pelo Claude | Sim |
| Múltiplas planilhas | Manual | Automático |
| Integração com Angioclam | Não | Sim |
| Comparação com histórico | Não | Sim |
| Edição antes do export | Não | Sim |
| Custo de execução | Tokens IA | Quase zero (1x IA pós-cálculo) |

## Links relacionados

- [[21 - Parâmetros Editáveis]]
- [[22 - Papel da IA]]
- [[23 - Robustez de Volume e N Planilhas]]
- [[24 - Bateria de Testes]]
- [[11 - Motor Python v2 - Código Referência]]
