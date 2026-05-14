---
tipo: especificacao
projeto: angioclam-relatorio-eficiencia
versao: 1.0
data: 2026-05-14
tags:
  - ia
  - claude-api
  - mitigacao
parent: "[[00 - Sistema Angioclam - MOC]]"
---

# 22 - Papel da IA no Sistema

## Princípio fundamental

**A IA não calcula KPI.** Toda matemática é feita pela Camada 1 (motor Python determinístico). A IA atua DEPOIS do cálculo, com 3 papéis possíveis.

## Os 3 papéis possíveis da IA

### Papel A - IA AUDITORA (mínimo seguro)

Função: fiscalizar o que o Python calculou.

**O que faz:**
- Checks de sanidade nos números
- Comparação com histórico
- Detecção de anomalias
- Validação de consistência interna

**Exemplos de checks:**
- "Doppler Carótidas com 4.000 unidades em 1 mês é anormal"
- "Esta operadora teve 30% menos pacientes que o período anterior"
- "Indicador 4 não bate entre slide 3 e slide 9"
- "Comorbidade DM2 caiu 50% sem explicação plausível"

**Saída:** lista de alertas para a tela de revisão.

**Vantagens:** simples, barato, baixo risco.
**Desvantagens:** valor agregado limitado.

### Papel B - IA REDATORA E ANALISTA (alto valor)

Função: gerar textos e insights baseados nos números.

**O que faz:**
- Escreve textos dos slides com base nos KPIs
- Sugere ângulos de narrativa
- Compara com históricos
- Adapta tom por operadora
- Detecta riscos de auditoria

**Exemplos:**
- "Este período teve queda de cintilografias — destacar como vitória"
- "vs último relatório, a economia aumentou 12%"
- "Doppler Carótidas inflado vs período anterior — auditoria pode questionar"
- "Para Bradesco, manter tom formal. Para SulAmérica, aceita narrativo."

**Saída:** textos prontos para os slides + alertas estratégicos.

**Vantagens:** transforma relatório em consultoria, não sistema.
**Desvantagens:** mais complexo, custa tokens, exige supervisão.

### Papel C - IA CONVERSACIONAL (avançado)

Função: copiloto para edição interativa do relatório.

**O que faz:**
- Recebe comandos em linguagem natural do usuário
- Edita textos e destaques
- Adiciona disclaimers
- Compara com relatórios anteriores

**Exemplos de comandos:**
- "Aumenta o destaque do indicador 5"
- "Refaz o texto do slide 3 mais técnico"
- "Adiciona disclaimer sobre os benchmarks"
- "Compara com o relatório do trimestre anterior"

**Vantagens:** experiência de copiloto.
**Desvantagens:** complexidade alta, risco de IA mudar números.

## Recomendação

**Implementar Papel A + Papel B parcial. Papel C fica para v2.**

| Papel | Decisão | Motivo |
|---|---|---|
| A (Auditora) | ✅ Implementar | Protege contra bugs como os da skill v1 |
| B (Redatora) | ✅ Implementar | Alto valor real (textos por operadora e período) |
| C (Conversacional) | ❌ Adiar | Complexidade alta, valor incremental baixo |

## Implementação técnica

### Stack sugerido

- **API:** Anthropic Claude API
- **Modelo:** Claude Sonnet 4 ou Opus 4.7 (para tarefas complexas)
- **SDK:** anthropic-python

### Prompt da Camada 2 (Auditora + Redatora)

```python
PROMPT_TEMPLATE = """
Você é o auditor e redator do Relatório de Eficiência Clínica da Angioclam.

CONTEXTO:
- Operadora: {operadora}
- Período: {periodo}
- Histórico de relatórios anteriores: {historico}

DADOS CALCULADOS (não modificar, apenas analisar):
{json_kpis}

SUAS TAREFAS:

1. AUDITORIA — listar alertas críticos:
   - Anomalias vs histórico
   - Inconsistências internas
   - Riscos de auditoria pela operadora
   - Variações maiores que 20% sem explicação

2. REDAÇÃO — gerar para cada slide:
   - Título principal (curto)
   - Subtítulo explicativo
   - Insight no rodapé (1-2 frases)
   - Tom adaptado à operadora

3. NARRATIVA GLOBAL — destacar:
   - O ponto mais forte do relatório
   - O ponto mais fraco (a ser explicado)
   - Recomendação de prioridade na conversa com a operadora

REGRAS:
- NÃO modifique nenhum número
- NÃO sugira mudar benchmarks ou custos
- Se detectar erro nos cálculos, ALERTE (não corrija)
- Tom profissional, sem floreio
- Nunca use "jornada" ou em-dash

RETORNAR EM JSON:
{
  "alertas": [...],
  "textos_slides": {...},
  "narrativa_global": {...}
}
"""
```

### Fluxo de execução da Camada 2

```python
def executar_camada_2(json_kpis, operadora, historico):
    # 1. Montar prompt
    prompt = PROMPT_TEMPLATE.format(
        operadora=operadora,
        periodo=json_kpis['periodo'],
        historico=historico,
        json_kpis=json.dumps(json_kpis, indent=2),
    )
    
    # 2. Chamar Claude API
    response = anthropic.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}]
    )
    
    # 3. Parsear retorno
    resultado = json.loads(response.content[0].text)
    
    # 4. Validar estrutura esperada
    assert 'alertas' in resultado
    assert 'textos_slides' in resultado
    
    return resultado
```

### Tipos de alerta da Camada 2

| Tipo | Severidade | Ação esperada |
|---|---|---|
| `inconsistencia` | Alta | Bloquear export até resolver |
| `anomalia_volume` | Média | Confirmar manualmente |
| `risco_auditoria` | Média | Adicionar disclaimer |
| `variacao_temporal` | Baixa | Mencionar no relatório |
| `sugestao_narrativa` | Informativa | Considerar incluir |

## Limites e proteções

### O que a IA NÃO PODE fazer

```
PROIBIDO:
❌ Calcular KPIs (isso é Python)
❌ Modificar valores numéricos do JSON
❌ Aplicar benchmarks (são parâmetros)
❌ Substituir o motor de cálculo
❌ Gerar números "estimados" sem base nos dados
```

### Validações pós-IA

A Camada 3 (interface) deve validar:
- JSON da IA não modificou nenhum número da Camada 1
- Textos sugeridos não contêm dados que não existem nos KPIs
- Alertas têm severidade dentro do enum esperado

## Custo estimado por relatório

Com Papel A + B:
- 1 chamada Claude Sonnet 4
- ~3.000 tokens input + ~2.000 tokens output
- Custo: aproximadamente R$ 0,15 por relatório
- Tempo: 5-15 segundos

Comparação:
- Skill atual (todo cálculo + texto via IA): ~30k tokens por execução, R$ 1,50+
- **Sistema 3-camadas: 10x mais barato**

## Próximos passos

- [ ] Definir formato exato do JSON da Camada 1
- [ ] Construir prompt template completo
- [ ] Implementar Camada 2 em Python
- [ ] Testar com 3 datasets diferentes
- [ ] Integrar com Camada 3 (Lenira)

## Links relacionados

- [[20 - Design das 3 Camadas]]
- [[11 - Motor Python v2 - Código Referência]]
- [[24 - Bateria de Testes]]
