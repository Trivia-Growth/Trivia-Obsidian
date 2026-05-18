---
tipo: especificacao
projeto: angioclam-relatorio-eficiencia
versao: 1.0
data: 2026-05-14
tags:
  - parametros
  - configuracao
  - sistema-final
parent: "[[00 - Sistema Angioclam - MOC]]"
---

# 21 - Parâmetros Editáveis

## Contexto

Sergio identificou que **custos dos procedimentos** e **benchmarks de incidência** variam por convênio e devem ser editáveis. No motor v2, esses parâmetros estão como constantes no código. No sistema final, viram tabelas editáveis por operadora.

## 15 parâmetros editáveis, organizados em 3 tabelas

### Tabela 1: Custos dos procedimentos EVITADOS (tabela do convênio)

São os procedimentos que a Angioclam ajuda a evitar. O valor varia por operadora (tabela de cobertura).

| Procedimento | Valor default | Aplicação |
|---|---|---|
| Cintilografia | R$ 2.500 | Indicador 1 |
| Cateterismo cardíaco | R$ 10.000 | Indicadores 2 e 4 |
| AngioTC | R$ 1.500 | Indicador 4 |
| Cirurgia de varizes | R$ 10.000 | Indicador 3 |
| Endarterectomia/Angioplastia | R$ 30.000 | Indicador 5 |

### Tabela 2: Custos dos exames REALIZADOS pela Angioclam (tabela da operadora)

São os exames que a Angioclam faz e cobra da operadora. O valor varia por contrato.

| Exame | Valor default | Observação |
|---|---|---|
| Ergometria | R$ 104 | Por exame |
| Doppler Venoso MMII | R$ 309 | Por exame bilateral (1 linha) |
| Doppler Carótidas | R$ 236 | Por exame |
| Consulta Angiologia | R$ 115 | Por consulta |

### Tabela 3: Benchmarks de incidência clínica (%)

São as taxas que justificam quantos procedimentos evitados a cada 100 exames-base. Variam conforme:
- Diretrizes médicas atualizadas
- Perfil da população atendida
- Acordo com a operadora

| Indicador | Taxa default | Significado |
|---|---|---|
| Cintilografia / Ergometria | 15% | A cada 100 ergometrias, 15 teriam ido para cintilografia |
| Cateterismo / Ergometria | 5% | A cada 100 ergometrias, 5 teriam ido direto para cateterismo |
| Cirurgia varizes / Doppler Venoso | 5% | A cada 100 dopplers, 5 evitam cirurgia |
| AngioTC / Consulta Angio | 10% | A cada 100 consultas, 10 evitariam AngioTC |
| Cateterismo / Consulta Angio | 1% | A cada 100 consultas, 1 evitaria cateterismo |
| Endarterectomia / Doppler Carótidas | 2% | A cada 100 dopplers, 2 evitam cirurgia |

## Como implementar no sistema

### Modelo de dados sugerido

```sql
-- Tabela: operadora
CREATE TABLE operadora (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    cor_primaria VARCHAR(7) NOT NULL,
    deteccao_substring VARCHAR(50),  -- ex: "SULAM"
    ativo BOOLEAN DEFAULT TRUE
);

-- Tabela: custos_evitados (por operadora)
CREATE TABLE custos_evitados (
    id SERIAL PRIMARY KEY,
    operadora_id INT REFERENCES operadora(id),
    procedimento VARCHAR(100),  -- ex: "cintilografia"
    valor DECIMAL(10,2),
    fonte_referencia TEXT,  -- ex: "Tabela ANS 2026, item X"
    data_atualizacao TIMESTAMP
);

-- Tabela: custos_angioclam (por operadora)
CREATE TABLE custos_angioclam (
    id SERIAL PRIMARY KEY,
    operadora_id INT REFERENCES operadora(id),
    exame VARCHAR(100),
    valor DECIMAL(10,2),
    fonte_referencia TEXT,
    data_atualizacao TIMESTAMP
);

-- Tabela: benchmarks
CREATE TABLE benchmarks (
    id SERIAL PRIMARY KEY,
    operadora_id INT REFERENCES operadora(id),
    indicador VARCHAR(100),  -- ex: "cintilografia_sobre_ergo"
    taxa DECIMAL(5,4),  -- ex: 0.1500
    fonte_referencia TEXT,  -- ex: "Diretriz SBC 2024"
    data_atualizacao TIMESTAMP
);
```

### Refactor do motor Python

A função `gerar_kpis()` recebe os parâmetros como argumentos:

```python
def gerar_kpis(
    df_sol, df_real, df_com,
    custos_angioclam: dict,
    custos_evitados: dict,
    benchmarks: dict,
):
    # Toda a lógica usa os parâmetros recebidos,
    # em vez das constantes hardcoded.
    ...
```

### Tela de configuração (Camada 3)

A Lenira implementa uma tela com 3 seções:

```
┌─────────────────────────────────────────────┐
│ Configurar Operadora                        │
├─────────────────────────────────────────────┤
│ Nome: [SulAmérica]                          │
│ Cor primária: [#771F1F] [picker]            │
│                                              │
│ ─── Custos Evitados ───                     │
│ Cintilografia:  [R$ 2.500] [fonte: ___]    │
│ Cateterismo:    [R$ 10.000] [fonte: ___]   │
│ AngioTC:        [R$ 1.500] [fonte: ___]    │
│ Cir. varizes:   [R$ 10.000] [fonte: ___]   │
│ Endarterectomia:[R$ 30.000] [fonte: ___]   │
│                                              │
│ ─── Custos Angioclam ───                    │
│ Ergometria:     [R$ 104] [fonte: ___]      │
│ Doppler MMII:   [R$ 309] [fonte: ___]      │
│ Doppler Carot:  [R$ 236] [fonte: ___]      │
│ Cons. Angio:    [R$ 115] [fonte: ___]      │
│                                              │
│ ─── Benchmarks (%) ───                      │
│ Cintilo/Ergo:   [15%] [fonte: ___]         │
│ Cat/Ergo:       [5%]  [fonte: ___]         │
│ Var/DopVen:     [5%]  [fonte: ___]         │
│ AngTC/ConsAng:  [10%] [fonte: ___]         │
│ Cat/ConsAng:    [1%]  [fonte: ___]         │
│ Endar/DopCar:   [2%]  [fonte: ___]         │
│                                              │
│ [Cancelar] [Salvar] [Salvar e Aplicar]      │
└─────────────────────────────────────────────┘
```

## Importância do campo "fonte"

Cada parâmetro editável deve ter um campo **fonte de referência** obrigatório. Isso protege contra auditoria da operadora.

Exemplos de fontes válidas:
- "Tabela ANS 2026, Resolução Normativa nº 465"
- "Contrato Angioclam × SulAmérica, cláusula 4.2"
- "Diretriz SBC Ergometria 2024, capítulo 7"
- "Tabela TUSS atualizada em 03/2026"
- "Cotação de mercado, hospital de referência"

## Histórico de alterações

A tabela deve manter histórico (audit log) de qualquer alteração:

```sql
CREATE TABLE parametros_historico (
    id SERIAL PRIMARY KEY,
    tabela_origem VARCHAR(50),
    registro_id INT,
    campo_alterado VARCHAR(50),
    valor_antigo TEXT,
    valor_novo TEXT,
    alterado_por VARCHAR(100),
    data_alteracao TIMESTAMP DEFAULT NOW(),
    motivo TEXT
);
```

Isso garante que se a operadora questionar "por que esse valor mudou?", há rastreabilidade.

## Validação de parâmetros

O sistema deve impedir:
- Custos negativos ou zero
- Benchmarks acima de 100%
- Salvamento sem preencher fonte de referência
- Alteração sem motivo (em alterações posteriores)

## Próximos passos

- [ ] Refatorar motor Python para receber dicts como parâmetro
- [ ] Implementar modelo de dados (Lenira)
- [ ] Implementar tela de configuração (Lenira)
- [ ] Migrar valores atuais para tabelas iniciais
- [ ] Documentar fonte de cada benchmark atual

## Links relacionados

- [[20 - Design das 3 Camadas]]
- [[11 - Motor Python v2 - Código Referência]]
- [[03 - Decisões Travadas]]
