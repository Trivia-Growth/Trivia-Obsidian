---
tipo: especificacao
projeto: angioclam-relatorio-eficiencia
versao: 1.0
data: 2026-05-14
tags:
  - robustez
  - escala
  - n-planilhas
parent: "[[00 - Sistema Angioclam - MOC]]"
---

# 23 - Robustez de Volume e N Planilhas

## Contexto

Requisito do Sergio: o sistema deve funcionar com **qualquer número de planilhas** e **qualquer volume de dados**, mantendo determinismo.

## Cenários reais que o sistema precisa cobrir

### Cenário 1: 1 planilha por tipo (atual)
- 1 export de solicitações
- 1 export de produção
- 1 export de atendimentos

### Cenário 2: múltiplas planilhas do mesmo tipo
- 2 exports de solicitações (jan-jun + jul-dez)
- 2 exports de produção (mesmo período dividido)
- 1 export consolidado de atendimentos

### Cenário 3: planilhas adicionais novas
- Tipos que ainda não usamos (financeiro detalhado, agenda, retornos)
- Sistema deve identificar tipo novo e sinalizar para classificação

### Cenário 4: volumes grandes
- 5 anos de dados (até 200k linhas em B2)
- Múltiplos exports concatenados

## Mecanismos de robustez

### 1. Detecção automática de tipo (não por nome de arquivo)

Hoje a skill espera nomes específicos. O motor v3 deve **detectar pelo conteúdo das colunas**:

```python
def detectar_tipo_planilha(df):
    cols = set(df.columns.str.lower())
    
    if {'exame', 'data solicitação'} <= cols:
        return 'B1_solicitados'
    
    if {'procedimento', 'valor', 'id atend'} <= cols:
        return 'B2_realizados'
    
    if {'id_paciente', 'id_atendimento'} <= cols and \
       any('pacmed' in c for c in cols):
        return 'B3_atendimentos'
    
    return 'DESCONHECIDO'
```

### 2. Aceitar N planilhas, agrupar por tipo, concatenar

```python
def carregar_planilhas(lista_paths):
    grupos = {'B1': [], 'B2': [], 'B3': [], 'DESCONHECIDO': []}
    
    for path in lista_paths:
        df = ler_arquivo(path)  # CSV ou XLSX
        tipo = detectar_tipo_planilha(df)
        grupos[tipo].append(df)
    
    # Concatenar cada grupo
    B1 = pd.concat(grupos['B1']) if grupos['B1'] else None
    B2 = pd.concat(grupos['B2']) if grupos['B2'] else None
    B3 = pd.concat(grupos['B3']) if grupos['B3'] else None
    
    return B1, B2, B3, grupos['DESCONHECIDO']
```

### 3. Detecção de gaps e sobreposições

```python
def auditar_periodo(df, coluna_data):
    df['data'] = pd.to_datetime(df[coluna_data])
    df = df.sort_values('data')
    
    # Gaps maiores que 7 dias
    df['gap'] = df['data'].diff().dt.days
    gaps_grandes = df[df['gap'] > 7]
    
    # Datas duplicadas em arquivos diferentes
    if 'arquivo_origem' in df.columns:
        duplicadas = df.groupby('data')['arquivo_origem'].nunique()
        sobreposicoes = duplicadas[duplicadas > 1]
    
    return {
        'periodo_inicio': df['data'].min(),
        'periodo_fim': df['data'].max(),
        'gaps_grandes': gaps_grandes,
        'sobreposicoes': sobreposicoes,
    }
```

### 4. Streaming para volumes grandes

Para arquivos com mais de 100k linhas, ler em chunks:

```python
def ler_csv_grande(path, chunksize=50000):
    chunks = []
    for chunk in pd.read_csv(path, sep=';', chunksize=chunksize):
        chunks.append(processar_chunk(chunk))
    return pd.concat(chunks)
```

### 5. Validação de schema

Se o Klingo mudar nome de coluna entre exports, abortar com erro claro:

```python
def validar_schema(df, tipo_esperado):
    schemas = {
        'B1': ['Unidade', 'Médico', 'Data Solicitação', 'Paciente', 
               'Exame', 'Procedimento1', 'Classe', 'Especialidade', 'Qtd'],
        'B2': ['Profissional', 'Data Atend', 'Operadora', 'Paciente',
               'ID Atend', 'Cod Tuss', 'Procedimento', 'Categoria',
               'Especialidade', 'Qtd', 'Unidade', 'Valor'],
        'B3': ['id_atendimento', 'data', 'id_paciente', 'paciente',
               'operadora', 'plano', 'sexo', 'idade', 'dt_nascimento',
               'procedimento', 'medico', 'unidade', 'recepcao', 'avulso',
               'haspacmed', 'dmiipacmed', 'dlppacmed', 'daciampacmed',
               'obespacmed', 'sedpacmed', 'avcpacmed'],
    }
    
    esperadas = set(schemas[tipo_esperado])
    presentes = set(df.columns)
    faltando = esperadas - presentes
    
    if faltando:
        raise ValueError(
            f"Schema {tipo_esperado} inválido. "
            f"Colunas faltando: {faltando}"
        )
```

## Garantia de determinismo

Para garantir que **mesmas planilhas em qualquer combinação dão o mesmo resultado**:

### Princípios

1. **Ordenação determinística** após concatenação:
   ```python
   B1 = B1.sort_values(['Data Solicitação', 'Paciente', 'Exame']).reset_index(drop=True)
   ```

2. **Deduplicação de linhas idênticas**:
   ```python
   # Se mesmo registro aparece em 2 arquivos, conta 1 vez
   B1 = B1.drop_duplicates()
   ```

3. **Funções puras**: sem aleatoriedade, sem timestamps que mudam, sem ordem dependente de dict (Python 3.7+ resolve isso).

4. **Hashes de entrada e saída** para auditoria:
   ```python
   hash_entrada = hashlib.md5(pd.util.hash_pandas_object(B1).values).hexdigest()
   hash_saida = hashlib.md5(json.dumps(kpis).encode()).hexdigest()
   log_execucao(hash_entrada, hash_saida)
   ```

## QA específico para múltiplas planilhas

O log de QA deve incluir:

```
=== INGESTÃO ===
Arquivos lidos: 5
  - relatorio_solicitados_2024.csv (B1, 12.345 linhas)
  - relatorio_solicitados_2025.csv (B1, 11.987 linhas)
  - relatorio_producao_2024.csv (B2, 8.234 linhas)
  - relatorio_producao_2025.csv (B2, 7.890 linhas)
  - atendimentos_completo.xlsx (B3, 4.092 linhas)

Período inferido: 01/01/2024 → 11/05/2026

=== CONSOLIDAÇÃO ===
B1 final: 24.332 linhas (após dedup: 24.110)
B2 final: 16.124 linhas (após dedup: 16.124)
B3 final: 4.092 linhas

Sobreposições detectadas: NENHUMA
Gaps detectados: 1 (15/01/2025 a 28/01/2025 — 13 dias sem registros)

=== HASH DE EXECUÇÃO ===
Entrada: a3f5b2c8...
Saída:   d7e9f1a4...
```

## Bateria de testes para garantir robustez

Ver detalhes em: [[24 - Bateria de Testes]]

## Próximos passos

- [ ] Implementar detecção automática de tipo
- [ ] Implementar concatenação de N planilhas
- [ ] Implementar validação de schema com mensagem clara
- [ ] Implementar auditoria de período (gaps e sobreposições)
- [ ] Implementar hash de execução para auditoria
- [ ] Testar com 3 datasets de tamanhos diferentes

## Links relacionados

- [[20 - Design das 3 Camadas]]
- [[11 - Motor Python v2 - Código Referência]]
- [[24 - Bateria de Testes]]
