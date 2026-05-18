---
tipo: tecnico
projeto: angioclam-relatorio-eficiencia
versao: 2.0
linguagem: python
data: 2026-05-14
tags:
  - codigo
  - python
  - motor
  - referencia-tecnica
parent: "[[00 - Sistema Angioclam - MOC]]"
arquivos_relacionados:
  - motor_relatorio_v2.py
  - dados_relatorio.json
  - validacao_qa.txt
---

# 11 - Motor Python v2 - Código de Referência

## O que é

Implementação Python determinística de toda a lógica do SKILL.md. É o **núcleo de cálculo** que será integrado ao sistema da Angioclam (Lenira).

## Status

**Funcional e validado.** Rodou nos dados reais sem erros. 100% de cobertura da taxonomia em B2, 96,87% em B1.

## Arquivos

| Arquivo | Função |
|---|---|
| `motor_relatorio_v2.py` | Script Python executável (~29 KB) |
| `dados_relatorio.json` | Output: KPIs prontos para o gerador de HTML |
| `validacao_qa.txt` | Output: log de QA da execução |

## Por que Python e não Skill

| Critério | Skill (IA) | Motor Python |
|---|---|---|
| Determinismo | Alto, mas com variação | 100% reprodutível |
| Custo por execução | Tokens Claude | Zero |
| Velocidade | Segundos a minutos | Milissegundos |
| Integração em sistemas | Difícil | Padrão de mercado |
| Auditável linha a linha | Não | Sim |
| Manutenção | Editar prompts | Editar código |
| Independência de IA online | Não | Sim |

## Estrutura do código

### Constantes (parâmetros)

```python
CUSTOS_ANGIOCLAM = {
    'ergometria': 104,
    'doppler_venoso_mmii': 309,
    'doppler_carotidas': 236,
    'consulta_angiologia': 115,
}

CUSTOS_EVITADOS = {
    'cintilografia': 2500,
    'cateterismo': 10000,
    'angiotc': 1500,
    'cirurgia_varizes': 10000,
    'endarterectomia': 30000,
}

BENCHMARKS = {
    'cintilografia_sobre_ergo': 0.15,
    'cateterismo_sobre_ergo': 0.05,
    'varizes_sobre_dop_ven': 0.05,
    'angiotc_sobre_cons_angio': 0.10,
    'cateterismo_sobre_cons_angio': 0.01,
    'endarter_sobre_dop_car': 0.02,
}
```

> No refactor para o sistema final, esses dicts viram parâmetros de entrada da função, editáveis por operadora.

### Funções principais

| Função | O que faz |
|---|---|
| `validar_csv(path)` | Confere que toda linha foi lida (linhas físicas = linhas pandas) |
| `normalizar_nome(s)` | Strip + upper + sem acento + colapsa espaços |
| `classificar(nome)` | Aplica taxonomia regex sobre nome normalizado |
| `converter_valor_br(serie)` | "1.234,56" → 1234.56 |
| `detectar_operadora(df1, df2)` | Identifica operadora via substring case-insensitive |
| `propagar_id_paciente(...)` | Cria id_paciente_inferido em B1 e B2 via B3 |
| `gerar_kpis(...)` | Calcula TODOS os KPIs do relatório |
| `gerar_qa(...)` | Relatório de QA da execução |
| `main()` | Orquestra o fluxo completo |

### Fluxo de execução

```
1. validar_csv() em B1 e B2
2. pd.read_excel() em B3
3. propagar_id_paciente()
4. gerar_kpis()
   ├── Slide 2: epidemiologia (pacientes, idade, sexo, faixas, comorbidades)
   ├── Slide 5: panorama (volumes B2 por categoria)
   ├── Indicador 1: Ergo → Cintilografia (versões A e B)
   ├── Indicador 2: Ergo → Cateterismo (versões A e B)
   ├── Indicador 3: Doppler Ven → Varizes
   ├── Indicador 4: Consulta Angio → AngioTC + Cat (versões A e B)
   ├── Indicador 5: Doppler Car → Endarterectomia
   └── Consolidado A e B
5. gerar_qa()
6. Salvar JSON + QA
```

## Resultados nos dados de teste (mai/2025 a mai/2026)

| KPI | Valor |
|---|---|
| Pacientes únicos | 2.037 |
| Atendimentos | 4.092 |
| Procedimentos faturados | 14.549 |
| Faturamento total | R$ 3.135.098,10 |
| Procedimentos evitados (Versão A) | 341 |
| Procedimentos evitados (Versão B) | 284 |
| Economia bruta total (A) | R$ 2.112.000 |
| Economia bruta total (B) | R$ 1.966.500 |
| Economia líquida (A) | R$ 1.244.519 |
| Economia líquida (B) | R$ 1.099.019 |

## Próximas evoluções (a fazer)

- [ ] Aceitar parâmetros editáveis (custos + benchmarks como input)
- [ ] Aceitar N planilhas do mesmo tipo (concatenar antes de processar)
- [ ] Detecção automática de tipo por colunas (não por nome de arquivo)
- [ ] Streaming para volumes muito grandes (>100k linhas)
- [ ] API REST para integração com sistema da Lenira
- [ ] Camada de IA para auditoria pós-cálculo
- [ ] Camada de IA para redação de textos dos slides

## Como rodar

```bash
# Ajustar PATHs no início do main()
python3 motor_relatorio_v2.py

# Outputs gerados em:
# - dados_relatorio.json
# - validacao_qa.txt
```

## Dependências

- `pandas` (manipulação de dados)
- `openpyxl` (leitura xlsx)
- Python 3.8+

## Links relacionados

- [[10 - SKILL.md v2 - Conteúdo Completo]]
- [[12 - Taxonomia de Exames]]
- [[13 - Validação HTML Gerado]]
- [[20 - Design das 3 Camadas]]
- [[21 - Parâmetros Editáveis]]
