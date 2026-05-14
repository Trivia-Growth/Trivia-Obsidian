"""
Motor do Relatório de Eficiência Clínica Angioclam — v2.0
=========================================================

Recebe os 3 exports padrão do Klingo e calcula todos os KPIs do relatório.
Implementação determinística: mesmas planilhas → mesmo resultado, sempre.

USO:
    python motor_relatorio_v2.py

INPUTS (caminhos hardcoded na função main, ajustar):
    - relatorio_solicitados.csv   (B1: exames solicitados)
    - relatorio_producao.csv      (B2: procedimentos realizados/faturados)
    - dados_atendimentos.xlsx     (B3: atendimentos com comorbidades)

OUTPUT:
    - dados_relatorio.json  (todos os KPIs prontos para o gerador de HTML)
    - validacao_qa.txt      (log de QA da execução)
"""

import pandas as pd
import re
import unicodedata
import json
import os
import sys
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')


# ============================================================================
# CONSTANTES DA SKILL
# ============================================================================

CUSTOS_ANGIOCLAM = {
    'ergometria':           104,
    'doppler_venoso_mmii':  309,
    'doppler_carotidas':    236,
    'consulta_angiologia':  115,
}

CUSTOS_EVITADOS = {
    'cintilografia':     2500,
    'cateterismo':      10000,   # consistente nos slides 3 e 7
    'angiotc':           1500,
    'cirurgia_varizes': 10000,
    'endarterectomia':  30000,
}

BENCHMARKS = {
    'cintilografia_sobre_ergo':      0.15,
    'cateterismo_sobre_ergo':        0.05,
    'varizes_sobre_dop_ven':         0.05,
    'angiotc_sobre_cons_angio':      0.10,
    'cateterismo_sobre_cons_angio':  0.01,
    'endarter_sobre_dop_car':        0.02,
}

OPERADORAS_CORES = [
    ('SULAM',   {'nome': 'SulAmérica',         'cor_primaria': '#771F1F'}),
    ('BRADESCO',{'nome': 'Bradesco Saúde',     'cor_primaria': '#CC0000'}),
    ('AMIL',    {'nome': 'Amil',               'cor_primaria': '#003087'}),
    ('UNIMED',  {'nome': 'Unimed',             'cor_primaria': '#007A33'}),
    ('HAPVIDA', {'nome': 'Hapvida',            'cor_primaria': '#1B2D6E'}),
    ('NOTRE',   {'nome': 'NotreDame',          'cor_primaria': '#1B2D6E'}),
    ('PORTO',   {'nome': 'Porto Seguro Saúde', 'cor_primaria': '#003366'}),
    ('GOLDEN',  {'nome': 'Golden Cross',       'cor_primaria': '#8B0000'}),
]

# Procedimentos em B2 que aparecem com Qtd=2 (bilateral em 1 linha)
# Convenção: contar pelo nº de linhas, não pela soma de Qtd
PROCEDIMENTOS_BILATERAIS = {
    'DOPPLER COLORIDO VENOSO DE MEMBRO INFERIOR',
    'DOPPLER COLORIDO ARTERIAL DE MEMBRO INFERIOR',
    'DOPPLER COLORIDO ARTERIAL DE MEMBRO SUPERIOR',
    'DOPPLER COLORIDO VENOSO DE MEMBRO SUPERIOR',
    'DOPPLER COLORIDO DE ORGÃO OU ESTRUTURA ISOLADA',
}


# ============================================================================
# TAXONOMIA - ordem importa, primeiro padrão que casa vence
# ============================================================================

TAXONOMIA = [
    # CARDIOLOGIA
    ('ergometria',       [r'ERGOMETR', r'TESTE\s+DE\s+ESFORC']),
    ('ecocardiograma',   [r'ECODOPPLERCARDIOGRAMA', r'ECOCARDIOGRAMA', r'ECO\s*TRANSTORAC']),
    ('ecg',              [r'\bECG\b', r'ELETROCARDIOGR']),
    ('holter',           [r'HOLTER']),
    ('mapa',             [r'\bMAPA\b', r'MONITORIZACAO AMBULATORIAL.*PRESSAO']),
    ('cintilografia',    [r'CINTILOG']),
    ('cateterismo',      [r'CATETERISMO', r'CINEANGI']),
    ('angiotc',          [r'ANGIOTOMOGRAFIA', r'ANGIO[\s\W]*TC', r'ANGIOTC']),

    # ANGIOLOGIA/VASCULAR - ordem específica → genérica
    ('doppler_carotidas', [r'CAROTID', r'CAROT(I|R)?D', r'CARORTID',
                            r'VASOS\s+CERVICAIS\s+ARTERIAIS', r'DUPLEX.*CAROT']),
    ('doppler_cervic_venoso', [r'VASOS\s+CERVICAIS\s+VENOS']),
    ('doppler_arterio_venoso_mmii', [r'ARTERIAL\s+E\s+VENOSO.*MEMBROS\s+INFERIORES']),
    ('doppler_venoso_mmii', [r'VENOSO.*(MEMBR|MMII).*INFERIOR', r'VENOSO.*MMII',
                              r'(DOPPLER|ECODOPPLER).*VENOSO.*MEMBROS\s+INFERIORES']),
    ('doppler_arterial_mmii', [r'ARTERIAL.*(MEMBR|MMII).*INFERIOR', r'ARTERIAL.*MMII',
                                r'(DOPPLER|ECODOPPLER).*ARTERIAL.*MEMBROS\s+INFERIORES']),
    ('doppler_mms', [r'MEMBROS?\s+SUPERIOR', r'MMSS']),
    ('doppler_aorta_iliaca', [r'AORTA.*ILIACAS']),
    ('doppler_aorta',        [r'\bAORTA\b']),
    ('doppler_renais',       [r'ARTERIAS\s+RENAIS']),
    ('doppler_orgao_isolado',[r'OR[GÃ]?[AÃ]O\s+OU\s+ESTRUTURA\s+ISOLADA']),

    # USG não vascular
    ('usg_tireoide',     [r'TIREOID']),
    ('usg_abdome',       [r'ABDOM(E|EM)', r'ABD\s+(INF|SUP)']),
    ('usg_mamas',        [r'\bMAMAS?\b']),
    ('usg_prostata',     [r'PROSTAT']),
    ('usg_transvaginal', [r'TRANSVAGINAL']),
    ('usg_articular',    [r'ARTICULAR', r'JOELHO', r'PUNHO']),
    ('usg_estruturas_superf', [r'ESTRUTURAS\s+SUPERFICIAIS', r'OR[GÃ]?[AÃ]OS?\s+SUPERFICIAIS',
                                r'GLANDULAS\s+SALIVARES', r'BOLSA\s+ESCROTAL', r'TESTICULOS', r'AXILAS']),
    ('usg_urinario',     [r'APARELHO\s+URIN', r'URINARIO', r'RINS']),
    ('usg_parede_abd',   [r'PAREDE\s+ABDOMINAL']),
    ('usg_cervical',     [r'\bCERVICAL\b']),

    # CONSULTAS
    ('consulta_cardiologia',  [r'CARDIOLOGIA']),
    ('consulta_angiologia',   [r'ANGIOLOGIA']),
    ('consulta_endocrino',    [r'ENDOCRIN']),
    ('consulta_dermato',      [r'DERMATO']),
    ('consulta_nutricao',     [r'NUTRICIONIST', r'NUTRICAO']),
    ('consulta_psicologia',   [r'PSICOLOG']),
    ('consulta_clinico',      [r'CLINICO']),
    ('consulta_medica',       [r'CONSULTA\s+MEDICA']),

    # PROCEDIMENTOS
    ('proc_pele',     [r'LESAO.*PELE', r'EXERESE', r'ELETROCOAGULA', r'CURETAGEM',
                       r'CRIOESCLEROTERAPIA', r'LASER\s+TRANSDERMICO']),
    ('proc_estetica', [r'BOTOX', r'PREENCHIMENTO\s+RESTYLANE']),

    # CIRURGIAS (importantes para evitação - termos cirúrgicos REAIS)
    ('cirurgia_varizes', [r'SAFENECT', r'FLEBECT', r'LIGADURA.*SAFEN',
                           r'CIRURGIA.*VARIZ', r'ABLAÇÃO.*SAFEN']),
    ('endarterectomia',  [r'ENDARTER', r'ANGIOPLASTIA.*CAROT']),

    # LABORATÓRIO
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

    # IMAGEM AVANÇADA
    ('rnm',           [r'\bRNM\b', r'RESSONANCIA']),
    ('tomografia',    [r'TOMOGRAFIA\s+COMPUTADORIZADA', r'\bTC\s+(DE|DO)']),
    ('mamografia',    [r'MAMOGRAFIA']),
    ('densitometria', [r'DENSITOMETRIA']),
    ('radiografia',   [r'RADIOGRAFIA', r'\bRX\b', r'\bRAIO\s*X']),
    ('endoscopia',    [r'ENDOSCOPIA']),
]


# ============================================================================
# FUNÇÕES UTILITÁRIAS
# ============================================================================

def normalizar_nome(s):
    """Normaliza nome de paciente: strip + upper + sem acento + colapsa espaços."""
    if pd.isna(s):
        return ''
    s = str(s).strip().upper()
    s = unicodedata.normalize('NFKD', s).encode('ASCII', 'ignore').decode()
    return ' '.join(s.split())


def strip_acc(s):
    """Versão para textos genéricos (procedimentos, exames)."""
    if pd.isna(s):
        return ''
    s = str(s).upper().strip()
    return unicodedata.normalize('NFKD', s).encode('ASCII', 'ignore').decode()


def classificar(nome):
    """Classifica um nome de procedimento/exame em categoria canônica."""
    if pd.isna(nome):
        return 'OUTROS'
    n = strip_acc(nome)
    for cat, patterns in TAXONOMIA:
        for p in patterns:
            if re.search(p, n):
                return cat
    return 'OUTROS'


def converter_valor_br(serie):
    """Converte '1.234,56' → 1234.56"""
    return pd.to_numeric(
        serie.astype(str).str.replace('.', '', regex=False).str.replace(',', '.', regex=False),
        errors='coerce'
    )


def detectar_operadora(df_real, df_com):
    """Detecta operadora via substring no campo operadora."""
    candidatos = []
    if 'Operadora' in df_real.columns:
        candidatos += df_real['Operadora'].dropna().astype(str).tolist()
    if 'operadora' in df_com.columns:
        candidatos += df_com['operadora'].dropna().astype(str).tolist()
    texto = ' '.join(candidatos).upper()
    for chave, info in OPERADORAS_CORES:
        if chave in texto:
            return info
    return {'nome': 'Operadora não identificada', 'cor_primaria': '#333333'}


# ============================================================================
# VALIDAÇÃO DE INTEGRIDADE
# ============================================================================

def validar_csv(path):
    """Confere que pandas lê todas as linhas do arquivo."""
    with open(path, 'r', encoding='utf-8') as f:
        linhas_fisicas = sum(1 for _ in f)
    df = pd.read_csv(path, sep=';', encoding='utf-8')
    if len(df) != linhas_fisicas - 1:
        raise ValueError(
            f"INTEGRIDADE FALHOU em {path}: "
            f"lidas {len(df)}, esperadas {linhas_fisicas - 1}"
        )
    return df


# ============================================================================
# IDENTIFICAÇÃO DE PACIENTES
# ============================================================================

def propagar_id_paciente(df_sol, df_real, df_com):
    """Cria coluna id_paciente_inferido em B1 e B2 via lookup em B3."""
    df_sol['nome_norm']  = df_sol['Paciente'].apply(normalizar_nome)
    df_real['nome_norm'] = df_real['Paciente'].apply(normalizar_nome)
    df_com['nome_norm']  = df_com['paciente'].apply(normalizar_nome)

    # Dicionário {nome_norm: id_paciente} a partir de B3
    mapa_nome_id = dict(zip(df_com['nome_norm'], df_com['id_paciente']))

    # Contador para ids sintéticos
    contador_sintetico = [0]
    nomes_sinteticos = {}

    def resolver(nome_norm):
        if nome_norm in mapa_nome_id:
            return int(mapa_nome_id[nome_norm])
        if nome_norm not in nomes_sinteticos:
            contador_sintetico[0] += 1
            nomes_sinteticos[nome_norm] = -contador_sintetico[0]
        return nomes_sinteticos[nome_norm]

    df_sol['id_paciente_inferido']  = df_sol['nome_norm'].apply(resolver)
    df_real['id_paciente_inferido'] = df_real['nome_norm'].apply(resolver)
    df_com['id_paciente_inferido']  = df_com['id_paciente']

    return contador_sintetico[0]


# ============================================================================
# MOTOR PRINCIPAL
# ============================================================================

def gerar_kpis(df_sol, df_real, df_com):
    """Gera dicionário completo de KPIs para o relatório."""

    # Preparação
    df_real['Valor_num'] = converter_valor_br(df_real['Valor'])
    df_real['data_dt'] = pd.to_datetime(df_real['Data Atend'], errors='coerce')
    df_sol['data_dt']  = pd.to_datetime(df_sol['Data Solicitação'], errors='coerce')
    df_real['data_norm'] = df_real['data_dt'].dt.date
    df_sol['data_norm']  = df_sol['data_dt'].dt.date

    # Classificação
    df_real['cat'] = df_real['Procedimento'].apply(classificar)
    df_sol['cat']  = df_sol['Exame'].apply(classificar)

    # Idade em B3
    df_com['idade_num'] = df_com['idade'].astype(str).str.extract(r'(\d+)').astype(float)

    # ----- Período inferido -----
    data_min = min(df_real['data_dt'].min(), df_sol['data_dt'].min(), df_com['data'].min())
    data_max = max(df_real['data_dt'].max(), df_sol['data_dt'].max(), df_com['data'].max())
    periodo = {
        'inicio': data_min.strftime('%d/%m/%Y'),
        'fim':    data_max.strftime('%d/%m/%Y'),
    }

    # ----- Operadora -----
    operadora = detectar_operadora(df_real, df_com)

    # ============= SLIDE 2 - PERFIL EPIDEMIOLÓGICO =============
    n_pac   = df_com['id_paciente'].nunique()
    n_atend = len(df_com)
    pac_unico = df_com.drop_duplicates('id_paciente').copy()

    # Faixa etária
    bins = [0, 20, 30, 40, 50, 60, 70, 80, 200]
    labels = ['0-19','20-29','30-39','40-49','50-59','60-69','70-79','80+']
    pac_unico['faixa'] = pd.cut(pac_unico['idade_num'], bins=bins, labels=labels, right=False)

    sexo = pac_unico['sexo'].value_counts()
    n_f = int(sexo.get('F', 0))
    n_m = int(sexo.get('M', 0))

    # Comorbidades: paciente único com SIM em qualquer atendimento
    comorb_map = {
        'haspacmed': 'HAS', 'dmiipacmed': 'DM2', 'dlppacmed': 'Dislipidemia',
        'daciampacmed': 'DAC/IAM', 'obespacmed': 'Obesidade',
        'sedpacmed': 'Sedentarismo', 'avcpacmed': 'AVC',
    }
    comorbidades = {}
    for col, nome in comorb_map.items():
        qtd = df_com[df_com[col] == 'SIM']['id_paciente'].nunique()
        comorbidades[nome] = {'qtd': int(qtd), 'pct': round(qtd / n_pac * 100, 1)}

    epidem = {
        'pacientes': int(n_pac),
        'atendimentos': int(n_atend),
        'idade_media': round(float(pac_unico['idade_num'].mean()), 1),
        'idade_mediana': int(pac_unico['idade_num'].median()),
        'feminino': n_f, 'masculino': n_m,
        'pct_f': round(n_f / n_pac * 100, 1),
        'pct_m': round(n_m / n_pac * 100, 1),
        'faixas': {str(k): int(v) for k, v in pac_unico['faixa'].value_counts().sort_index().items()},
        'comorbidades': comorbidades,
    }

    # ============= SLIDE 5 - PANORAMA =============
    total_proc = len(df_real)
    n_profissionais = df_real['Profissional'].nunique()
    cat_consultas = df_real[df_real['Categoria'] == 'CONSULTAS']
    cat_exames = df_real[df_real['Categoria'].isin(['EXAMES', 'ULTRASSONOGRAFIA DIAGNÓSTICA'])]

    # Top exames para gráfico
    def info_exame(cat_nome):
        sub = df_real[df_real['cat'] == cat_nome]
        return {'qtd': int(len(sub)), 'valor': round(float(sub['Valor_num'].sum()), 2)}

    panorama = {
        'total_proc': int(total_proc),
        'profissionais': int(n_profissionais),
        'consultas': int(len(cat_consultas)),
        'val_consultas': round(float(cat_consultas['Valor_num'].sum()), 2),
        'exames': int(len(cat_exames)),
        'faturamento_total': round(float(df_real['Valor_num'].sum()), 2),
        'volumes': {
            'ecg': info_exame('ecg'),
            'doppler_venoso_mmii': info_exame('doppler_venoso_mmii'),
            'ergometria': info_exame('ergometria'),
            'mapa': info_exame('mapa'),
            'holter': info_exame('holter'),
            'ecocardiograma': info_exame('ecocardiograma'),
            'doppler_carotidas': info_exame('doppler_carotidas'),
        },
    }

    # ============= INDICADORES =============
    # Volumes base
    n_ergo    = (df_real['cat'] == 'ergometria').sum()
    n_dop_ven = (df_real['cat'] == 'doppler_venoso_mmii').sum()
    n_dop_car = (df_real['cat'] == 'doppler_carotidas').sum()

    # REGRA TRAVADA: Consultas Angiologia via B2 (Categoria=CONSULTAS + Especialidade=ANGIO)
    cons_angio = df_real[
        (df_real['Categoria'] == 'CONSULTAS') &
        (df_real['Especialidade'].str.contains('ANGIO', case=False, na=False))
    ]
    n_cons_angio = len(cons_angio)

    # Custo unitário FATURADO real (média de B2) para uso nos indicadores
    def custo_unit_real(cat_nome):
        sub = df_real[df_real['cat'] == cat_nome]
        return float(sub['Valor_num'].mean()) if len(sub) > 0 else 0

    unit_ergo    = custo_unit_real('ergometria')
    unit_dop_ven_linha = custo_unit_real('doppler_venoso_mmii')  # por linha (bilateral)
    unit_dop_car = custo_unit_real('doppler_carotidas')
    unit_cons_angio = float(cons_angio['Valor_num'].mean()) if len(cons_angio) else 0

    # Solicitações deduplicadas (B1 - chave: paciente, data, categoria)
    def solic_dedup(cat_nome):
        sub = df_sol[df_sol['cat'] == cat_nome]
        return len(sub.drop_duplicates(['Paciente', 'data_norm']))

    def realizadas_angioclam(cat_nome):
        return int((df_real['cat'] == cat_nome).sum())

    n_cint_sol   = solic_dedup('cintilografia')
    n_cint_real  = realizadas_angioclam('cintilografia')
    n_cat_sol    = solic_dedup('cateterismo')
    n_cat_real   = realizadas_angioclam('cateterismo')
    n_angtc_sol  = solic_dedup('angiotc')
    n_angtc_real = realizadas_angioclam('angiotc')
    n_var_sol    = solic_dedup('cirurgia_varizes')
    n_endar_sol  = solic_dedup('endarterectomia')

    # ----- INDICADOR 1: Ergometria → Cintilografia -----
    cint_esp = round(n_ergo * BENCHMARKS['cintilografia_sobre_ergo'])
    custo_ergo = n_ergo * CUSTOS_ANGIOCLAM['ergometria']
    ind1 = {
        'base_qtd': int(n_ergo),
        'base_custo': float(custo_ergo),
        'unit_base_real': round(unit_ergo, 2),
        'esperadas': int(cint_esp),
        'solicitadas': int(n_cint_sol),
        'realizadas_angioclam': int(n_cint_real),
        'evitadas_vs_realizadas': int(cint_esp - n_cint_real),
        'evitadas_vs_solicitadas': int(cint_esp - n_cint_sol),
        'custo_evitado_unit': CUSTOS_EVITADOS['cintilografia'],
        'econ_bruta_A': float((cint_esp - n_cint_real) * CUSTOS_EVITADOS['cintilografia']),
        'econ_liq_A':   float((cint_esp - n_cint_real) * CUSTOS_EVITADOS['cintilografia'] - custo_ergo),
        'econ_bruta_B': float((cint_esp - n_cint_sol) * CUSTOS_EVITADOS['cintilografia']),
        'econ_liq_B':   float((cint_esp - n_cint_sol) * CUSTOS_EVITADOS['cintilografia'] - custo_ergo),
    }

    # ----- INDICADOR 2: Ergometria → Cateterismo -----
    cat_esp = round(n_ergo * BENCHMARKS['cateterismo_sobre_ergo'])
    ind2 = {
        'base_qtd': int(n_ergo),
        'base_custo': float(custo_ergo),
        'esperados': int(cat_esp),
        'solicitados': int(n_cat_sol),
        'realizados_angioclam': int(n_cat_real),
        'evitados_vs_realizadas': int(cat_esp - n_cat_real),
        'evitados_vs_solicitadas': int(cat_esp - n_cat_sol),
        'custo_evitado_unit': CUSTOS_EVITADOS['cateterismo'],
        'econ_bruta_A': float((cat_esp - n_cat_real) * CUSTOS_EVITADOS['cateterismo']),
        'econ_liq_A':   float((cat_esp - n_cat_real) * CUSTOS_EVITADOS['cateterismo'] - custo_ergo),
        'econ_bruta_B': float((cat_esp - n_cat_sol) * CUSTOS_EVITADOS['cateterismo']),
        'econ_liq_B':   float((cat_esp - n_cat_sol) * CUSTOS_EVITADOS['cateterismo'] - custo_ergo),
    }

    # ----- INDICADOR 3: Doppler Venoso MMII → Varizes -----
    var_esp = round(n_dop_ven * BENCHMARKS['varizes_sobre_dop_ven'])
    custo_dop_ven = n_dop_ven * CUSTOS_ANGIOCLAM['doppler_venoso_mmii']
    ind3 = {
        'base_qtd': int(n_dop_ven),
        'base_custo': float(custo_dop_ven),
        'unit_declarado': CUSTOS_ANGIOCLAM['doppler_venoso_mmii'],
        'unit_faturado_real': round(unit_dop_ven_linha, 2),
        'esperadas': int(var_esp),
        'solicitadas': int(n_var_sol),
        'realizadas_angioclam': 0,
        'evitadas_vs_realizadas': int(var_esp),
        'evitadas_vs_solicitadas': int(var_esp - n_var_sol),
        'custo_evitado_unit': CUSTOS_EVITADOS['cirurgia_varizes'],
        'econ_bruta_A': float(var_esp * CUSTOS_EVITADOS['cirurgia_varizes']),
        'econ_liq_A':   float(var_esp * CUSTOS_EVITADOS['cirurgia_varizes'] - custo_dop_ven),
        'econ_bruta_B': float((var_esp - n_var_sol) * CUSTOS_EVITADOS['cirurgia_varizes']),
        'econ_liq_B':   float((var_esp - n_var_sol) * CUSTOS_EVITADOS['cirurgia_varizes'] - custo_dop_ven),
    }

    # ----- INDICADOR 4: Consulta Angio → AngioTC + Cateterismo -----
    angtc_esp = round(n_cons_angio * BENCHMARKS['angiotc_sobre_cons_angio'])
    cat_ang_esp = round(n_cons_angio * BENCHMARKS['cateterismo_sobre_cons_angio'])
    custo_cons_angio = n_cons_angio * CUSTOS_ANGIOCLAM['consulta_angiologia']
    econ_angtc_A = (angtc_esp - n_angtc_real) * CUSTOS_EVITADOS['angiotc']
    econ_cat_A   = (cat_ang_esp - n_cat_real) * CUSTOS_EVITADOS['cateterismo']
    econ_angtc_B = (angtc_esp - n_angtc_sol) * CUSTOS_EVITADOS['angiotc']
    econ_cat_B   = (cat_ang_esp - n_cat_sol) * CUSTOS_EVITADOS['cateterismo']
    ind4 = {
        'base_qtd': int(n_cons_angio),
        'base_custo': float(custo_cons_angio),
        'unit_faturado_real': round(unit_cons_angio, 2),
        'angiotc_esperadas': int(angtc_esp),
        'angiotc_solicitadas': int(n_angtc_sol),
        'angiotc_realizadas_angioclam': int(n_angtc_real),
        'cat_esperados': int(cat_ang_esp),
        'cat_solicitados': int(n_cat_sol),
        'econ_bruta_A': float(econ_angtc_A + econ_cat_A),
        'econ_liq_A':   float(econ_angtc_A + econ_cat_A - custo_cons_angio),
        'econ_bruta_B': float(econ_angtc_B + econ_cat_B),
        'econ_liq_B':   float(econ_angtc_B + econ_cat_B - custo_cons_angio),
    }

    # ----- INDICADOR 5: Doppler Carótidas → Endarterectomia -----
    endar_esp = round(n_dop_car * BENCHMARKS['endarter_sobre_dop_car'])
    custo_dop_car = n_dop_car * CUSTOS_ANGIOCLAM['doppler_carotidas']
    ind5 = {
        'base_qtd': int(n_dop_car),
        'base_custo': float(custo_dop_car),
        'unit_faturado_real': round(unit_dop_car, 2),
        'esperadas': int(endar_esp),
        'solicitadas': int(n_endar_sol),
        'realizadas_angioclam': 0,
        'evitadas_vs_realizadas': int(endar_esp),
        'evitadas_vs_solicitadas': int(endar_esp - n_endar_sol),
        'custo_evitado_unit': CUSTOS_EVITADOS['endarterectomia'],
        'econ_bruta_A': float(endar_esp * CUSTOS_EVITADOS['endarterectomia']),
        'econ_liq_A':   float(endar_esp * CUSTOS_EVITADOS['endarterectomia'] - custo_dop_car),
        'econ_bruta_B': float((endar_esp - n_endar_sol) * CUSTOS_EVITADOS['endarterectomia']),
        'econ_liq_B':   float((endar_esp - n_endar_sol) * CUSTOS_EVITADOS['endarterectomia'] - custo_dop_car),
    }

    # ----- CONSOLIDADO -----
    consolidado_A = {
        'proc_evitados': (ind1['evitadas_vs_realizadas'] + ind2['evitados_vs_realizadas'] +
                          ind3['evitadas_vs_realizadas'] + ind4['angiotc_esperadas'] - ind4['angiotc_realizadas_angioclam'] +
                          ind4['cat_esperados'] - n_cat_real + ind5['evitadas_vs_realizadas']),
        'econ_bruta': (ind1['econ_bruta_A'] + ind2['econ_bruta_A'] + ind3['econ_bruta_A'] +
                       ind4['econ_bruta_A'] + ind5['econ_bruta_A']),
        'econ_liq':   (ind1['econ_liq_A'] + ind2['econ_liq_A'] + ind3['econ_liq_A'] +
                       ind4['econ_liq_A'] + ind5['econ_liq_A']),
    }
    consolidado_B = {
        'proc_evitados': (ind1['evitadas_vs_solicitadas'] + ind2['evitados_vs_solicitadas'] +
                          ind3['evitadas_vs_solicitadas'] +
                          (ind4['angiotc_esperadas'] - ind4['angiotc_solicitadas']) +
                          (ind4['cat_esperados'] - ind4['cat_solicitados']) +
                          ind5['evitadas_vs_solicitadas']),
        'econ_bruta': (ind1['econ_bruta_B'] + ind2['econ_bruta_B'] + ind3['econ_bruta_B'] +
                       ind4['econ_bruta_B'] + ind5['econ_bruta_B']),
        'econ_liq':   (ind1['econ_liq_B'] + ind2['econ_liq_B'] + ind3['econ_liq_B'] +
                       ind4['econ_liq_B'] + ind5['econ_liq_B']),
    }

    return {
        'periodo': periodo,
        'operadora': operadora,
        'epidem': epidem,
        'panorama': panorama,
        'indicadores': {
            'ind1_cintilografia': ind1,
            'ind2_cateterismo':   ind2,
            'ind3_varizes':       ind3,
            'ind4_consulta_angio': ind4,
            'ind5_endarterectomia': ind5,
        },
        'consolidado_A_vs_realizadas': consolidado_A,
        'consolidado_B_vs_solicitadas': consolidado_B,
    }


# ============================================================================
# QA AUTOMATIZADO
# ============================================================================

def gerar_qa(df_sol, df_real, df_com, kpis):
    """Roda checks de qualidade e devolve relatório em texto."""
    out = []
    out.append("=" * 80)
    out.append("RELATÓRIO DE QA — MOTOR ANGIOCLAM v2.0")
    out.append("=" * 80)
    out.append(f"Execução: {datetime.now().isoformat()}")
    out.append("")

    # Cobertura taxonomia
    cob_b2 = (df_real['cat'] != 'OUTROS').mean() * 100
    cob_b1 = (df_sol['cat']  != 'OUTROS').mean() * 100
    out.append(f"Cobertura taxonomia B2: {cob_b2:.2f}% (mínimo 95%) " +
               ("✓" if cob_b2 >= 95 else "⚠️ ABAIXO DO MÍNIMO"))
    out.append(f"Cobertura taxonomia B1: {cob_b1:.2f}% (mínimo 90%) " +
               ("✓" if cob_b1 >= 90 else "⚠️ ABAIXO DO MÍNIMO"))

    # Período
    out.append(f"\nPeríodo inferido: {kpis['periodo']['inicio']} → {kpis['periodo']['fim']}")

    # Operadora
    out.append(f"Operadora detectada: {kpis['operadora']['nome']} (cor {kpis['operadora']['cor_primaria']})")

    # Pacientes
    out.append(f"\nPacientes únicos: {kpis['epidem']['pacientes']:,}")
    out.append(f"Atendimentos: {kpis['epidem']['atendimentos']:,}")

    # Volumes
    out.append(f"\nVolumes-chave em B2:")
    for k, v in kpis['panorama']['volumes'].items():
        out.append(f"  {k}: {v['qtd']:,} (R$ {v['valor']:,.2f})")

    # Indicadores
    out.append(f"\nINDICADORES — Versão A (vs realizadas Angioclam):")
    cA = kpis['consolidado_A_vs_realizadas']
    out.append(f"  Procedimentos evitados: {cA['proc_evitados']}")
    out.append(f"  Economia bruta: R$ {cA['econ_bruta']:,.2f}")
    out.append(f"  Economia líquida: R$ {cA['econ_liq']:,.2f}")

    out.append(f"\nINDICADORES — Versão B (vs solicitadas):")
    cB = kpis['consolidado_B_vs_solicitadas']
    out.append(f"  Procedimentos evitados: {cB['proc_evitados']}")
    out.append(f"  Economia bruta: R$ {cB['econ_bruta']:,.2f}")
    out.append(f"  Economia líquida: R$ {cB['econ_liq']:,.2f}")

    # Alertas
    out.append("\n" + "-" * 80)
    out.append("CHECKS DE INTEGRIDADE")
    out.append("-" * 80)

    alertas = []
    if kpis['consolidado_A_vs_realizadas']['econ_liq'] < 0:
        alertas.append("⚠️ Economia líquida (A) negativa — revisar custos")
    if kpis['indicadores']['ind5_endarterectomia']['base_qtd'] > 1500:
        alertas.append(f"⚠️ Doppler Carótidas com volume alto ({kpis['indicadores']['ind5_endarterectomia']['base_qtd']}) — checar dedup")

    if alertas:
        for a in alertas:
            out.append(a)
    else:
        out.append("✓ Nenhum alerta crítico detectado")

    return "\n".join(out)


# ============================================================================
# MAIN
# ============================================================================

def main():
    # CONFIGURAR CAMINHOS aqui
    PATH_SOL  = "/mnt/user-data/uploads/relatorio__22_.csv"
    PATH_REAL = "/mnt/user-data/uploads/relatorio__24_.csv"
    PATH_COM  = "/mnt/user-data/uploads/data__10__1.xlsx"
    PATH_OUT_JSON = "/mnt/user-data/outputs/dados_relatorio.json"
    PATH_OUT_QA   = "/mnt/user-data/outputs/validacao_qa.txt"

    print(">>> Validando integridade dos CSVs...")
    df_sol  = validar_csv(PATH_SOL)
    df_real = validar_csv(PATH_REAL)
    df_com  = pd.read_excel(PATH_COM)
    print(f"  B1: {len(df_sol):,} linhas")
    print(f"  B2: {len(df_real):,} linhas")
    print(f"  B3: {len(df_com):,} linhas")

    print("\n>>> Propagando id_paciente...")
    n_sint = propagar_id_paciente(df_sol, df_real, df_com)
    print(f"  Pacientes com id sintético (sem match em B3): {n_sint}")

    print("\n>>> Calculando KPIs...")
    kpis = gerar_kpis(df_sol, df_real, df_com)

    print("\n>>> Gerando QA...")
    qa = gerar_qa(df_sol, df_real, df_com, kpis)
    print(qa)

    print("\n>>> Salvando outputs...")
    os.makedirs(os.path.dirname(PATH_OUT_JSON), exist_ok=True)
    with open(PATH_OUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(kpis, f, indent=2, ensure_ascii=False, default=str)
    with open(PATH_OUT_QA, 'w', encoding='utf-8') as f:
        f.write(qa)
    print(f"  JSON: {PATH_OUT_JSON}")
    print(f"  QA:   {PATH_OUT_QA}")


if __name__ == "__main__":
    main()
