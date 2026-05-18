---
name: angioclam-relatorio-eficiencia
description: "Geração automatizada do Relatório de Eficiência Clínica e Impacto Econômico da Angioclam para operadoras de saúde. Use quando o usuário enviar os 3 exports padrão do sistema Klingo (XLSX de atendimentos + comorbidades, CSV de exames solicitados, CSV de produção/faturamento) e solicitar a geração do relatório em PDF/HTML. Aplica lógica determinística de identificação de pacientes, classificação de procedimentos, e cálculo de indicadores de economia para a operadora. Detecta automaticamente a operadora a partir dos dados e aplica a paleta de cores correspondente. Funciona para qualquer período (mês, trimestre, ano)."
version: "2.0"
license: "Proprietário Angioclam / Trívia Studio"
---

# Skill: Relatório de Eficiência Clínica Angioclam

## 1. Visão geral

Esta skill recebe 3 exports do sistema Klingo e gera o Relatório de Eficiência Clínica em HTML autossuficiente (CSS inline, SVGs inline), pronto para conversão em PDF.

A skill é **determinística**: mesmas planilhas, mesmo resultado, sempre. Toda decisão de regra de negócio está documentada aqui e não depende de interpretação.

## 2. Inputs esperados

O usuário envia 3 arquivos do Klingo:

| Base | Arquivo padrão | Conteúdo | Granularidade |
|------|----------------|----------|---------------|
| **B1** | `relatorio (XX).csv` com coluna `Exame` | Exames solicitados | 1 linha = 1 exame solicitado |
| **B2** | `relatorio (XX).csv` com coluna `Procedimento` e `Valor` | Procedimentos realizados/faturados | 1 linha = 1 procedimento faturado |
| **B3** | `data (XX).xlsx` ou similar | Atendimentos com comorbidades | 1 linha = 1 atendimento |

Detecção automática: olhar as colunas, não o nome do arquivo.
- B1: tem `Exame` e `Data Solicitação`
- B2: tem `Procedimento`, `Valor` e `ID Atend`
- B3: tem `id_paciente`, `id_atendimento`, `paciente`, e as 7 colunas de comorbidade

O usuário pode enviar **múltiplos CSVs para B1 ou B2** cobrindo períodos diferentes. Nesse caso, concatenar todos antes de processar, e inferir o período pelas datas min/max.

## 3. Validação de integridade (passo obrigatório antes de qualquer cálculo)

```python
# Para cada CSV
with open(path, 'r', encoding='utf-8') as f:
    linhas_fisicas = sum(1 for _ in f)
df = pd.read_csv(path, sep=';', encoding='utf-8')
assert len(df) == linhas_fisicas - 1, f"Erro: lidas {len(df)} de {linhas_fisicas-1} esperadas"
```

Se a validação falhar, **abortar com erro explícito**. Não processar arquivo incompleto.

## 4. Lógica de identificação de pacientes

### 4.1 Hierarquia de chaves (do mais forte ao mais fraco)

**Tier 1 — ID determinístico do Klingo**
- `ID Atend` (B2) ↔ `id_atendimento` (B3): chave numérica forte. Cobertura medida: 94,13% dos atendimentos de B3 cruzam com B2 via ID. Em 3.852 cruzamentos testados, 100% têm o mesmo nome de paciente.
- `id_paciente` (apenas em B3): chave única de paciente. Zero casos de id repetido com nomes diferentes (testado em 2.037 pacientes).

**Tier 2 — Nome normalizado** (única chave disponível em todas as 3 bases)

```python
import unicodedata

def normalizar_nome(s):
    if pd.isna(s): return ''
    s = str(s).strip().upper()
    s = unicodedata.normalize('NFKD', s).encode('ASCII', 'ignore').decode()
    return ' '.join(s.split())  # colapsa múltiplos espaços
```

### 4.2 Propagação de id_paciente

B1 não tem `id_paciente` nem `id_atendimento`. B2 tem só `ID Atend`. Para cruzar tudo:

1. Em B3, construir dicionário `{nome_norm: id_paciente}`
2. Em B1 e B2, criar coluna `id_paciente_inferido` via lookup pelo `nome_norm`
3. Pacientes em B1/B2 sem match em B3 recebem **id sintético negativo** (`-1`, `-2`, etc.)

### 4.3 Tratamento de pacientes sem comorbidade conhecida

**REGRA OPERACIONAL (definida pelo cliente):** pacientes com id sintético (sem registro em B3) entram nas contagens gerais (procedimentos, exames) mas são tratados como **todas as comorbidades = NÃO**.

### 4.4 Caso de homônimo (1 nome → múltiplos ids)

Manter os ids separados. São cadastros distintos no Klingo. Caso conhecido: `CAILE SILVA MELLONI` tem ids 87462 e 87463. Tratar como 2 pacientes.

## 5. Taxonomia de procedimentos

Classificação determinística via regex sobre nome **normalizado** (UPPER + sem acento).

**ORDEM IMPORTA.** O primeiro padrão que casar vence. Por isso padrões mais específicos vêm antes dos genéricos.

```python
TAXONOMIA = [
    # ===== CARDIOLOGIA =====
    ('ergometria',       [r'ERGOMETR', r'TESTE\s+DE\s+ESFORC']),
    ('ecocardiograma',   [r'ECODOPPLERCARDIOGRAMA', r'ECOCARDIOGRAMA', r'ECO\s*TRANSTORAC']),
    ('ecg',              [r'\bECG\b', r'ELETROCARDIOGR']),
    ('holter',           [r'HOLTER']),
    ('mapa',             [r'\bMAPA\b', r'MONITORIZACAO AMBULATORIAL.*PRESSAO']),
    ('cintilografia',    [r'CINTILOG']),
    ('cateterismo',      [r'CATETERISMO', r'CINEANGI']),
    ('angiotc',          [r'ANGIOTOMOGRAFIA', r'ANGIO[\s\W]*TC', r'ANGIOTC']),
    
    # ===== ANGIOLOGIA/VASCULAR (ordem específica → genérica) =====
    # CRÍTICO: cobrir typo do Klingo "CARÓRTIDAS"
    ('doppler_carotidas', [
        r'CAROTID', r'CAROT(I|R)?D', r'CARORTID',
        r'VASOS\s+CERVICAIS\s+ARTERIAIS', r'DUPLEX.*CAROT',
    ]),
    ('doppler_cervic_venoso', [r'VASOS\s+CERVICAIS\s+VENOS']),
    
    # MMII: combinado antes de venoso e arterial isolados
    ('doppler_arterio_venoso_mmii', [r'ARTERIAL\s+E\s+VENOSO.*MEMBROS\s+INFERIORES']),
    ('doppler_venoso_mmii',         [r'VENOSO.*(MEMBR|MMII).*INFERIOR', r'VENOSO.*MMII',
                                      r'(DOPPLER|ECODOPPLER).*VENOSO.*MEMBROS\s+INFERIORES']),
    ('doppler_arterial_mmii',       [r'ARTERIAL.*(MEMBR|MMII).*INFERIOR', r'ARTERIAL.*MMII',
                                      r'(DOPPLER|ECODOPPLER).*ARTERIAL.*MEMBROS\s+INFERIORES']),
    ('doppler_mms',                 [r'MEMBROS?\s+SUPERIOR', r'MMSS']),
    ('doppler_aorta_iliaca',        [r'AORTA.*ILIACAS']),
    ('doppler_aorta',               [r'\bAORTA\b']),
    ('doppler_renais',              [r'ARTERIAS\s+RENAIS']),
    ('doppler_orgao_isolado',       [r'OR[GÃ]?[AÃ]O\s+OU\s+ESTRUTURA\s+ISOLADA']),
    
    # ===== USG NÃO VASCULAR =====
    ('usg_tireoide',     [r'TIREOID']),
    ('usg_abdome',       [r'ABDOM(E|EM)', r'ABD\s+(INF|SUP)']),
    ('usg_mamas',        [r'\bMAMAS?\b']),
    ('usg_prostata',     [r'PROSTAT', r'PROSTAT']),
    ('usg_transvaginal', [r'TRANSVAGINAL']),
    ('usg_articular',    [r'ARTICULAR', r'JOELHO', r'PUNHO']),
    ('usg_estruturas_superf', [r'ESTRUTURAS\s+SUPERFICIAIS', r'OR[GÃ]?[AÃ]OS?\s+SUPERFICIAIS',
                                r'GLANDULAS\s+SALIVARES', r'BOLSA\s+ESCROTAL', r'TESTICULOS', r'AXILAS']),
    ('usg_urinario',     [r'APARELHO\s+URIN', r'URINARIO', r'RINS']),
    ('usg_parede_abd',   [r'PAREDE\s+ABDOMINAL']),
    ('usg_cervical',     [r'\bCERVICAL\b']),
    
    # ===== CONSULTAS =====
    ('consulta_cardiologia',  [r'CARDIOLOGIA']),
    ('consulta_angiologia',   [r'ANGIOLOGIA']),
    ('consulta_endocrino',    [r'ENDOCRIN']),
    ('consulta_dermato',      [r'DERMATO']),
    ('consulta_nutricao',     [r'NUTRICIONIST', r'NUTRICAO']),
    ('consulta_psicologia',   [r'PSICOLOG']),
    ('consulta_clinico',      [r'CLINICO']),
    ('consulta_medica',       [r'CONSULTA\s+MEDICA']),
    
    # ===== PROCEDIMENTOS =====
    ('proc_pele',        [r'LESAO.*PELE', r'EXERESE', r'ELETROCOAGULA', r'CURETAGEM',
                          r'CRIOESCLEROTERAPIA', r'LASER\s+TRANSDERMICO']),
    ('proc_estetica',    [r'BOTOX', r'PREENCHIMENTO\s+RESTYLANE']),
    
    # ===== CIRURGIAS (importantes para evitação) =====
    # Cirurgia de varizes: usar APENAS termos cirúrgicos reais.
    # NÃO incluir crioescleroterapia (é estético ambulatorial).
    ('cirurgia_varizes', [r'SAFENECT', r'FLEBECT', r'LIGADURA.*SAFEN',
                          r'CIRURGIA.*VARIZ', r'ABLAÇÃO.*SAFEN']),
    ('endarterectomia',  [r'ENDARTER', r'ANGIOPLASTIA.*CAROT']),
    
    # ===== LABORATÓRIO =====
    ('lab_hemograma',       [r'HEMOGRAMA', r'HEMOGLOBINA\s+GLICADA']),
    ('lab_glicemia',        [r'GLICEMIA', r'GLICOSE']),
    ('lab_lipidico',        [r'COLESTEROL', r'TRIGLICER', r'\bHDL\b', r'\bLDL\b', r'LIPOPROT']),
    ('lab_funcao_renal',    [r'CREATININA', r'\bUREIA\b']),
    ('lab_funcao_hepatica', [r'\bTGO\b', r'\bTGP\b', r'GAMA\s+GT', r'\bGGT\b', r'FOSFATASE',
                              r'BILIRR', r'\bLDH\b']),
    ('lab_tireoide',        [r'\bTSH\b', r'\bT3\b', r'\bT4\b', r'ANTI\s+TPO']),
    ('lab_eletrolitos',     [r'\bSODIO\b', r'POTASSIO', r'\bCALCIO\b', r'MAGNESIO', r'FOSFORO']),
    ('lab_vitaminas',       [r'VITAMINA', r'25\s+HIDROXI', r'ACIDO\s+FOLICO', r'\bB12\b']),
    ('lab_ferro',           [r'\bFERRO\b', r'FERRITINA']),
    ('lab_acido_urico',     [r'ACIDO\s+URICO']),
    ('lab_hormonios',       [r'\bFSH\b', r'\bLH\b', r'PROLACTINA', r'ESTRADIOL', r'TESTOSTERONA', r'CORTISOL']),
    ('lab_psa',             [r'\bPSA\b']),
    ('lab_coagulacao',      [r'TP\s+COM', r'\bRNI\b', r'COAGULOGRAMA', r'TEMPO\s+DE\s+PROTROMBINA']),
    ('lab_inflamatorio',    [r'\bCPK\b', r'\bPCR\b', r'\bVHS\b']),
    ('lab_urina',           [r'SUMARIO\s+DE\s+URINA', r'UROCULTURA']),
    ('lab_outros',          [r'\bDOSAGEM\b', r'PARASITOLOG', r'\bHIV\b', r'\bVDRL\b']),
    
    # ===== IMAGEM AVANÇADA =====
    ('rnm',           [r'\bRNM\b', r'RESSONANCIA']),
    ('tomografia',    [r'TOMOGRAFIA\s+COMPUTADORIZADA', r'\bTC\s+(DE|DO)']),
    ('mamografia',    [r'MAMOGRAFIA']),
    ('densitometria', [r'DENSITOMETRIA']),
    ('radiografia',   [r'RADIOGRAFIA', r'\bRX\b', r'\bRAIO\s*X']),
    ('endoscopia',    [r'ENDOSCOPIA']),
]
```

Cobertura testada com os dados reais de 12 meses:
- B2 (41 procedimentos distintos): 100,00% classificados
- B1 (627 nomes distintos): 97,57% classificados

## 6. Coluna Qtd: ATENÇÃO CRÍTICA

Alguns procedimentos em B2 vêm com `Qtd = 2` em uma única linha — são exames **bilaterais** faturados juntos (perna esquerda + direita, etc.).

**Lista conhecida de procedimentos com Qtd > 1:**
- DOPPLER COLORIDO VENOSO DE MEMBRO INFERIOR
- DOPPLER COLORIDO ARTERIAL DE MEMBRO INFERIOR
- DOPPLER COLORIDO ARTERIAL DE MEMBRO SUPERIOR
- DOPPLER COLORIDO VENOSO DE MEMBRO SUPERIOR
- DOPPLER COLORIDO DE ORGÃO OU ESTRUTURA ISOLADA
- Estruturas superficiais (cervical, axilas, músculo, tendão)
- USG ARTICULAR

**Convenção:** 1 linha = 1 exame bilateral (mesmo com Qtd=2). Contar pelo **número de linhas**, não pela soma de Qtd. Essa convenção é a que reproduz o PDF original (1.008 Doppler Venoso MMII) e é a interpretação clínica padrão (um exame bilateral é um exame, não dois).

## 7. Deduplicação obrigatória de exames

Para evitar contagem dupla:

```python
# Chave de deduplicação
chave_dedup = (id_paciente_inferido, data_normalizada, categoria_canonica)
```

Exemplo crítico: Doppler de Carótidas em B1 aparece em 7 grafias diferentes (incluindo o typo "CARÓRTIDAS" do Klingo). Sem dedup, um paciente que teve o exame solicitado em duas linhas no mesmo dia é contado 2 vezes.

**ESTE FOI UM DOS BUGS DA SKILL ANTERIOR.** A v1 somava `489 + 388 + 336 + 155 + 22 + 4 + 3 = 1.397` sem deduplicar. O número correto é 1.172 (faturado real em B2) ou 1.205 (B1 deduplicado).

## 8. Conversão de tipos

```python
# Valor monetário brasileiro: "1.234,56" → 1234.56
df['Valor_num'] = pd.to_numeric(
    df['Valor'].astype(str).str.replace('.','',regex=False).str.replace(',','.',regex=False),
    errors='coerce'
)

# Idade em texto "46 anos" → 46
df['idade_num'] = df['idade'].astype(str).str.extract(r'(\d+)').astype(float)

# Datas
df['data_dt'] = pd.to_datetime(df['Data Atend'], errors='coerce')
```

## 9. Cálculos dos indicadores

### 9.1 Custos unitários (valores convencionados)

```python
CUSTOS_ANGIOCLAM = {
    'ergometria':       104,   # R$ 104 por ergometria
    'doppler_venoso_mmii': 309,  # R$ 309 por exame bilateral (linha)
    'doppler_carotidas': 236,  # R$ 236 por exame bilateral
    'consulta_angiologia': 115,  # R$ 115 por consulta
}

CUSTOS_EVITADOS = {
    'cintilografia':     2500,
    'cateterismo':       10000,  # MESMO valor nos slides 3 e 7
    'angiotc':           1500,
    'cirurgia_varizes':  10000,
    'endarterectomia':   30000,
}
```

**REGRA OPERACIONAL:** o cateterismo cardíaco custa **R$ 10.000**. Usar esse valor em TODOS os slides. Não usar R$ 8.000 em lugar nenhum.

### 9.2 Indicadores de eficiência

Para cada indicador, o cálculo é:

```
procedimentos_esperados = volume_base × taxa_benchmark
procedimentos_realizados_angioclam = contagem em B2 (sempre)
procedimentos_solicitados = contagem em B1 (deduplicado)

evitadas_versao_PDF = procedimentos_esperados - procedimentos_realizados_angioclam
evitadas_versao_ajustada = procedimentos_esperados - procedimentos_solicitados

economia_bruta_PDF = evitadas_versao_PDF × custo_evitado_unit
economia_bruta_ajustada = evitadas_versao_ajustada × custo_evitado_unit
```

**REGRA OPERACIONAL (definida pelo cliente):** apresentar **AMBOS** os números no slide, com explicação clara. Cada slide de indicador deve mostrar:
- Versão A: evitadas vs realizadas pela Angioclam (cálculo do PDF original)
- Versão B: evitadas vs solicitadas pelos médicos da Angioclam (cálculo ajustado)

Isso permite ao leitor entender que o número conservador (B) descontа solicitações que viraram exames em outras unidades, e que o número otimista (A) reflete o que a Angioclam efetivamente filtrou.

### 9.3 Benchmarks aplicados

| Indicador | Base | Taxa | Procedimento evitado |
|---|---|---|---|
| 1 | Ergometria | 15% | Cintilografia |
| 2 | Ergometria | 5% | Cateterismo |
| 3 | Doppler Venoso MMII | 5% | Cirurgia de varizes |
| 4 (a) | Consulta Angiologia | 10% | AngioTC |
| 4 (b) | Consulta Angiologia | 1% | Cateterismo |
| 5 | Doppler Carótidas | 2% | Endarterectomia/Angioplastia |

**REGRA OPERACIONAL:** documentar a fonte de cada benchmark no apêndice metodológico do relatório. Hoje as fontes precisam ser confirmadas pelo cliente (diretrizes SBC/SBACV, dados ANS, etc.).

## 10. Fontes específicas por indicador (decisões travadas)

### 10.1 Consultas de Angiologia (slide 3)

**REGRA OPERACIONAL TRAVADA (cliente em 14/mai/2026):** usar **Base 2 (CSV de produção)** com filtro:
```python
consultas_angio = B2[
    (B2['Categoria'] == 'CONSULTAS') & 
    (B2['Especialidade'].str.contains('ANGIO', case=False, na=False))
]
# Resultado: 1.075 consultas (igual ao PDF original)
```

**NÃO USAR** o XLSX para essa contagem (regra anterior estava desatualizada).

### 10.2 Doppler de Carótidas (slide 4)

**REGRA TRAVADA:** usar **Base 2 (faturado real)**, não a soma bruta de Base 1.

```python
dop_carotidas = B2[B2['Procedimento'].str.contains('CERVICAIS ARTERIAIS', case=False, na=False)]
# Resultado: 1.172 dopplers (não 1.397 como na skill v1)
```

### 10.3 Doppler Venoso MMII (slide 8)

**REGRA TRAVADA:** contar pelo número de linhas (1.008), com Qtd=2 sendo 1 exame bilateral.

### 10.4 Comorbidades (slide 2)

**REGRA TRAVADA:** contar paciente único com SIM em **qualquer atendimento** (não apenas linhas com todas as 7 preenchidas).

```python
def contar_comorbidade(B3, coluna):
    return B3[B3[coluna] == 'SIM']['id_paciente'].nunique()
```

Resultados esperados nos dados de teste (mai/2025 a mai/2026):
- HAS: 577 pacientes
- DM2: 276
- Dislipidemia: 608
- DAC/IAM: 114
- Obesidade: 534
- Sedentarismo: 706
- AVC: 54

## 11. Estrutura do relatório (9 slides)

### Slide 1 — Capa
- Logo Angioclam × Logo Operadora
- "Relatório de Eficiência Clínica e Impacto Econômico"
- Período analisado (inferido das datas dos arquivos)
- Boxes de Missão, Visão, Escopo

### Slide 2 — Perfil Epidemiológico
- KPIs: pacientes únicos, idade média/mediana, % sexo, faixa mais frequente
- Gráfico distribuição por faixa etária
- Gráfico de comorbidades (contagem de pacientes únicos, ORDEM decrescente)
- Insight no rodapé

### Slide 3 — Controle de Solicitações (Indicador 4)
- KPIs: consultas angiologia, AngioTC solicitadas, cateterismos solicitados, economia, ROI
- **IMPORTANTE:** apresentar versão A (vs realizadas) e B (vs solicitadas)
- Tabela financeira no lado direito
- **EVITAR:** cards do topo com números diferentes da tabela. Os cards do topo devem refletir o mesmo cálculo da tabela. Bug histórico da skill v1.

### Slide 4 — Doppler de Carótidas (Indicador 5)
- KPIs: dopplers (USAR 1.172, não 1.397), cirurgias esperadas (2%), evitadas, economia, ROI
- Gráfico Esperado vs Realizado

### Slide 5 — Panorama dos Atendimentos
- KPIs: total procedimentos, consultas, exames, profissionais
- Gráfico volume por tipo de exame (decrescente)
- Tabela distribuição por categoria

### Slide 6 — Ergometria → Cintilografia (Indicador 1)
- Aplicar regra dupla (vs realizadas / vs solicitadas)

### Slide 7 — Ergometria → Cateterismo (Indicador 2)
- Custo cateterismo = **R$ 10.000** (consistente com slide 3)
- Aplicar regra dupla

### Slide 8 — Doppler Venoso MMII → Varizes (Indicador 3)
- Custo unitário Doppler = R$ 309 por exame bilateral
- 1.008 dopplers (contagem por linhas)

### Slide 9 — Consolidado
- Tabela com 5 indicadores
- Total consolidado (versão otimista e versão conservadora)
- Boxes: Economia Líquida, Procedimentos Evitados, Economia por Atendimento

## 12. Paleta por operadora

Detectar pela coluna `operadora` (B2 ou B3), substring case-insensitive:

| Operadora | Cor primária | Detecção |
|-----------|--------------|----------|
| SulAmérica | `#771F1F` (vinho) | "SULAM" |
| Bradesco | `#CC0000` (vermelho) | "BRADESCO" |
| Amil | `#003087` (azul escuro) | "AMIL" |
| Unimed | `#007A33` (verde) | "UNIMED" |
| Hapvida/NotreDame | `#1B2D6E` (azul marinho) | "HAPVIDA" ou "NOTRE" |
| Porto Seguro | `#003366` (azul) | "PORTO" |
| Golden Cross | `#8B0000` (vermelho escuro) | "GOLDEN" |

**SulAmérica = VINHO `#771F1F`. NUNCA azul.**

## 13. Geração técnica do HTML

- 9 slides em sequência vertical
- Cada slide: 1100px largura, fundo off-white `#F5EEDC`, bordas arredondadas
- Fundo da página: `#1A1A1A`
- Fonte: Poppins (Google Fonts via link)
- Todos os gráficos: SVG inline (sem CDN externo)
- HTML autossuficiente: CSS inline, SVGs inline

## 14. QA automático antes de entregar

Toda execução deve gerar um log de validação. Se qualquer item falhar, **alertar antes de gerar o relatório**:

- [ ] Linhas lidas = linhas físicas - 1 em cada CSV
- [ ] Cobertura da taxonomia ≥ 95% em B2 e ≥ 90% em B1
- [ ] Período inferido bate com data min/max nas 3 bases
- [ ] Nenhum slide tem números contraditórios entre cards e tabelas
- [ ] Custo de cateterismo = R$ 10.000 em TODOS os lugares
- [ ] Doppler de Carótidas = contagem de B2 (1.172 nos dados de teste)
- [ ] Comorbidades = paciente único com SIM em qualquer atendimento
- [ ] Consultas Angiologia = Base 2 (Categoria + Especialidade ANGIO)
- [ ] Nenhum slide diz "0 realizadas" sem mostrar o número de solicitadas

## 15. Bugs corrigidos da versão anterior

A skill v1 tinha 5 problemas identificados em auditoria de mai/2026. **Estão todos corrigidos nesta versão:**

1. ✅ Doppler Carótidas: usar B2 (1.172) e não soma bruta de B1 (1.397)
2. ✅ Comorbidades: contar paciente único com SIM em qualquer atendimento, não só linhas com todas preenchidas
3. ✅ Slide 3: garantir que cards do topo refletem mesmos números da tabela
4. ✅ Cateterismo: R$ 10.000 em todos os slides (não R$ 8.000 no slide 3)
5. ✅ Apresentar versão A e B das "evitadas" para transparência

## 16. Resultados esperados nos dados de teste

Com as 3 planilhas-base (período mai/2025 a mai/2026, operadora SulAmérica), os números a serem gerados são:

**Slide 2 (Perfil):**
- 2.037 pacientes, 4.092 atendimentos
- 58% feminino (1.187), 42% masculino (844)
- Idade média 46,8 / mediana 46
- Faixa mais frequente: 40-49 (619 pacientes)
- HAS: 577, DM2: 276, Dislipidemia: 608, DAC/IAM: 114, Obesidade: 534, Sedentarismo: 706, AVC: 54

**Slide 5 (Panorama):**
- 14.549 procedimentos | 43 profissionais
- 3.855 consultas (R$ 455.198,32) | 3.348 exames diagnósticos | 7.346 outros
- ECG 1.821 | Doppler Venoso MMII 1.008 | Ergometria 749 | MAPA 474 | Holter 304
- Faturamento total: R$ 3.135.098,10

**Indicadores (versão A — vs realizadas pela Angioclam):**
- Ind 1 (Cintilografia): 112 evitadas, R$ 202.979 líquido
- Ind 2 (Cateterismo): 37 evitados, R$ 296.604 líquido (com R$ 10k, não R$ 8k)
- Ind 3 (Varizes): 50 evitadas, R$ 192.528 líquido
- Ind 4 (AngioTC + Cateterismo via consulta angio): 121 evitados, R$ 240.000 líquido
- Ind 5 (Endarterectomia): **23 evitadas** (não 28), R$ 690.000 (não R$ 840k)

**Indicadores (versão B — vs solicitadas):**
- Ind 1: 86 evitadas, R$ 215.000 bruto
- Ind 2: 35 evitados, R$ 350.000 bruto
- Ind 3: 50 evitadas (sem solicitações de cirurgia real)
- Ind 4: 81 AngioTC + 9 Cateterismos evitados
- Ind 5: 23 evitadas (sem solicitações de endarterectomia)

**Consolidado versão A:** 348 procedimentos, R$ 1.622.111 líquido
**Consolidado versão B:** 284 procedimentos, R$ 1.966.500 bruto
