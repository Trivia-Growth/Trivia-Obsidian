---
tipo: especificacao
projeto: angioclam-relatorio-eficiencia
versao: 1.0
data: 2026-05-14
tags:
  - testes
  - validacao
  - qa
parent: "[[00 - Sistema Angioclam - MOC]]"
---

# 24 - Bateria de Testes

## Objetivo

Provar que o sistema produz **resultados corretos e consistentes** em diferentes cenários de uso. Sem testes, não há garantia de assertividade em planilhas futuras.

## Pirâmide de testes

```
        ┌─────────────────┐
        │  Testes E2E     │  ← 3 datasets reais completos
        │  (3 cenários)   │
        ├─────────────────┤
        │  Testes Integ.  │  ← Motor completo com dados sintéticos
        │  (10 cenários)  │
        ├─────────────────┤
        │  Testes Unit.   │  ← Cada função isolada
        │  (50+ casos)    │
        └─────────────────┘
```

## Testes E2E (End-to-End)

### Dataset 1: Período curto (1 mês)

**Setup:**
- B1: ~2.000 linhas
- B2: ~1.200 linhas
- B3: ~340 linhas

**Validação:**
- Sistema infere período correto
- Cálculos batem com versão manual
- Tempo de execução < 5 segundos

### Dataset 2: Período longo (24 meses) com múltiplos arquivos

**Setup:**
- 2 arquivos B1 (12+12 meses)
- 4 arquivos B2 (trimestres)
- 1 arquivo B3 consolidado

**Validação:**
- Sistema detecta tipo automaticamente
- Concatenação correta sem duplicatas
- Período min/max correto
- Tempo de execução < 30 segundos

### Dataset 3: Volume grande (5 anos)

**Setup:**
- B1: ~100.000 linhas
- B2: ~75.000 linhas
- B3: ~20.000 linhas

**Validação:**
- Sistema não trava nem consome memória excessiva
- Streaming/chunks funcionando
- Resultado consistente com versão "tudo de uma vez"

## Testes de Integração

### IT-01: Mesmo dataset em ordem diferente

**Pré:** Dataset 1 carregado.

**Teste:**
1. Rodar com arquivos na ordem A, B, C
2. Rodar com arquivos na ordem C, A, B
3. Comparar hashes de saída

**Resultado esperado:** hashes idênticos (determinismo).

### IT-02: Dataset com typo conhecido

**Pré:** Inserir linha com "CARÓRTIDAS" (typo Klingo) em B1.

**Teste:** rodar o motor.

**Resultado esperado:** linha classificada como `doppler_carotidas`.

### IT-03: Dataset com schema parcialmente inválido

**Pré:** Renomear coluna "Valor" para "valor_total" em B2.

**Teste:** rodar o motor.

**Resultado esperado:** erro claro identificando o problema, sem crash.

### IT-04: Dataset vazio em uma das bases

**Pré:** B1 vazio (0 linhas).

**Teste:** rodar o motor.

**Resultado esperado:** sistema processa com Versão A (sem comparação a B1), avisa que B1 está vazio.

### IT-05: Sobreposição de períodos entre arquivos

**Pré:** 2 arquivos B2 com sobreposição de 1 mês.

**Teste:** rodar o motor.

**Resultado esperado:** sistema detecta, alerta, mantém apenas linhas únicas.

### IT-06: Parâmetros editados

**Pré:** Dataset 1, alterar custo cintilografia de R$ 2.500 para R$ 3.500.

**Teste:** rodar com novos parâmetros.

**Resultado esperado:** Indicador 1 recalculado proporcionalmente.

### IT-07: Operadora não reconhecida

**Pré:** Dataset com operadora "Plano X Saúde".

**Teste:** rodar o motor.

**Resultado esperado:** operadora marcada como "não identificada", cor padrão aplicada, sem crash.

### IT-08: Comorbidade ausente em todos os registros

**Pré:** Coluna `avcpacmed` removida de B3.

**Teste:** rodar o motor.

**Resultado esperado:** slide 2 mostra AVC = 0, sem crash.

### IT-09: Múltiplas linhas para o mesmo paciente

**Pré:** Mesmo paciente com 10 atendimentos.

**Teste:** rodar contagem de pacientes únicos.

**Resultado esperado:** paciente contado 1 vez.

### IT-10: Dataset minimal (1 paciente, 1 procedimento)

**Pré:** B1 com 1 linha, B2 com 1 linha, B3 com 1 linha.

**Teste:** rodar o motor.

**Resultado esperado:** processa sem erro, KPIs zero ou 1 onde aplicável.

## Testes Unitários

### Funções de normalização

```python
def test_normalizar_nome():
    assert normalizar_nome("  João da Silva  ") == "JOAO DA SILVA"
    assert normalizar_nome("MARIA APARECIDA") == "MARIA APARECIDA"
    assert normalizar_nome("José    com    espaços") == "JOSE COM ESPACOS"
    assert normalizar_nome(None) == ""
    assert normalizar_nome("") == ""
```

### Funções de classificação

```python
def test_classificar_doppler_carotidas():
    casos = [
        "DOPPLER ARTERIAL DE CARÓTIDAS E VERTEBRAIS",
        "DOPPLER ARTERIAL DE CARÓRTIDAS E VERTEBRAIS",  # typo
        "DOPPLER DE CARÓTIDAS E VERTEBRAIS COLORIDO",
        "DUPLEX SCAN COLORIDO DE CARÓTIDAS E VERTEBRAIS",
    ]
    for caso in casos:
        assert classificar(caso) == "doppler_carotidas"

def test_classificar_crioescleroterapia_nao_e_cirurgia():
    # IMPORTANTE: crioescleroterapia NÃO deve ser classificada como cirurgia
    assert classificar("CRIOESCLEROTERAPIA C30") != "cirurgia_varizes"
    assert classificar("CRIOESCLEROTERAPIA C30") == "proc_pele"
```

### Funções de conversão

```python
def test_converter_valor_br():
    s = pd.Series(["1.234,56", "609,90", "10.000,00", ""])
    resultado = converter_valor_br(s)
    assert resultado[0] == 1234.56
    assert resultado[1] == 609.90
    assert resultado[2] == 10000.00
    assert pd.isna(resultado[3])
```

### Funções de cálculo

```python
def test_calculo_evitadas_versao_A():
    # 100 ergometrias, 15% benchmark, 0 realizadas Angioclam
    resultado = calcular_evitadas(
        base_qtd=100,
        benchmark=0.15,
        realizadas_angioclam=0,
        versao='A'
    )
    assert resultado == 15

def test_calculo_evitadas_versao_B():
    # 100 ergometrias, 15% benchmark, 5 solicitadas
    resultado = calcular_evitadas(
        base_qtd=100,
        benchmark=0.15,
        solicitadas=5,
        versao='B'
    )
    assert resultado == 10
```

## Casos de regressão

Estes casos voltarão a ser testados a cada release, para garantir que bugs antigos não retornem:

### Reg-01: Doppler Carótidas não pode passar de B2 faturado

```python
def test_regressao_bug1_doppler_carotidas():
    # Dataset fixo: SulAmérica mai/2025-mai/2026
    kpis = gerar_kpis_completo(dataset_referencia)
    # Volume tem que ser 1.172 (B2 faturado), NUNCA 1.397
    assert kpis['indicadores']['ind5_endarterectomia']['base_qtd'] == 1172
```

### Reg-02: Comorbidades contadas por paciente único

```python
def test_regressao_bug2_comorbidades():
    kpis = gerar_kpis_completo(dataset_referencia)
    # Sedentarismo: 706 pacientes, não 492 (que seria contagem errada)
    assert kpis['epidem']['comorbidades']['Sedentarismo']['qtd'] == 706
```

### Reg-03: Cateterismo sempre R$ 10.000

```python
def test_regressao_bug4_custo_cateterismo():
    # Em TODOS os indicadores, cateterismo = R$ 10.000
    parametros = obter_parametros_padrao()
    assert parametros['custos_evitados']['cateterismo'] == 10000
```

### Reg-04: Versões A e B sempre presentes

```python
def test_regressao_bug5_versoes_AB():
    kpis = gerar_kpis_completo(dataset_referencia)
    for indicador in ['ind1_cintilografia', 'ind2_cateterismo', 'ind4_consulta_angio']:
        assert 'econ_bruta_A' in kpis['indicadores'][indicador]
        assert 'econ_bruta_B' in kpis['indicadores'][indicador]
```

## Ferramenta sugerida

- **pytest** para testes unitários e integração
- **pandas** para datasets sintéticos
- **hypothesis** para testes baseados em propriedades

## Estrutura de pastas dos testes

```
tests/
├── unit/
│   ├── test_normalizacao.py
│   ├── test_classificacao.py
│   ├── test_conversao.py
│   └── test_calculos.py
├── integration/
│   ├── test_it01_ordem.py
│   ├── test_it02_typo.py
│   └── ...
├── e2e/
│   ├── dataset_curto/
│   ├── dataset_24_meses/
│   └── dataset_grande/
└── regressao/
    ├── test_reg01_carotidas.py
    ├── test_reg02_comorbidades.py
    ├── test_reg03_cateterismo.py
    └── test_reg04_versoes.py
```

## Critério de aceitação para o sistema final

**Antes de ir para produção, o sistema deve passar em 100% dos testes acima.**

Em particular:
- [x] Os 4 testes de regressão (bugs históricos da v1)
- [ ] Os 10 testes de integração
- [ ] Os 3 testes E2E com datasets reais
- [ ] Os 50+ testes unitários

## Próximos passos

- [ ] Implementar suite de testes unitários (semana 1)
- [ ] Implementar testes de integração (semana 2)
- [ ] Coletar 3 datasets E2E reais (semana 2)
- [ ] Configurar CI/CD para rodar testes a cada mudança
- [ ] Documentar processo de adicionar novos testes

## Links relacionados

- [[20 - Design das 3 Camadas]]
- [[11 - Motor Python v2 - Código Referência]]
- [[23 - Robustez de Volume e N Planilhas]]
