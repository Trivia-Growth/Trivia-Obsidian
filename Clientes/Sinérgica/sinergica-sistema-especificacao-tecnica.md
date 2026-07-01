# Sinérgica Manutenções Patrimoniais
## Especificação Técnica — Sistema de Gestão
### Módulo PMOC + Plano de Manutenção + OS Hub

**Versão:** 1.0  
**Data:** 30/06/2026  
**Responsável:** Fabrício Medeiros — Sócio Fundador / Engenheiro de Manutenções  
**Destinatário:** Equipe de Desenvolvimento  

---

## Índice

1. [Contexto da Empresa](#1-contexto-da-empresa)
2. [Visão Geral do Sistema](#2-visão-geral-do-sistema)
3. [Stack e Arquitetura](#3-stack-e-arquitetura)
4. [O que é PMOC — Contexto para Desenvolvedores](#4-o-que-é-pmoc--contexto-para-desenvolvedores)
5. [Módulo PMOC — Especificação Completa](#5-módulo-pmoc--especificação-completa)
6. [Módulo PCM — Plano de Manutenção Geral](#6-módulo-pcm--plano-de-manutenção-geral)
7. [Equipamentos de Ar Condicionado no Plano Geral](#7-equipamentos-de-ar-condicionado-no-plano-geral)
8. [OS Hub — Central de Ordens de Serviço](#8-os-hub--central-de-ordens-de-serviço)
9. [Integração com Auvo](#9-integração-com-auvo)
10. [Fluxos de Informação — Diagramas](#10-fluxos-de-informação--diagramas)
11. [Schema do Banco de Dados](#11-schema-do-banco-de-dados)
12. [Regras de Negócio e Alertas](#12-regras-de-negócio-e-alertas)
13. [Especificação de Telas](#13-especificação-de-telas)
14. [Glossário Técnico](#14-glossário-técnico)

---

## 1. Contexto da Empresa

**Sinérgica Manutenções Patrimoniais** é uma empresa de engenharia de manutenção predial fundada em 2019, localizada em Campinas/SP, atuando em toda a Região Metropolitana de Campinas.

| Dado | Valor |
|------|-------|
| Setor | Engenharia de Manutenção Predial |
| Fundação | 2019 |
| Localização | Campinas/SP + RMC |
| Equipe | 7 pessoas: 5 técnicos de campo, 1 engenheiro (Fabrício), 1 sócia (escritório) |
| Carteira atual | 30+ condomínios |
| OS executadas | +20.000 |
| Unidades atendidas | +6.800 famílias |

### 1.1 Disciplinas de Manutenção

O sistema deve suportar todas as disciplinas de manutenção da empresa:

| Disciplina | Descrição |
|-----------|-----------|
| **Elétrica** | Instalações elétricas, quadros, luminárias |
| **Hidráulica** | Tubulações, bombas, reservatórios, caixas d'água |
| **Climatização** | Ar condicionado (foco deste módulo PMOC) |
| **SPCI / Incêndio** | Sistemas de prevenção e combate a incêndio |
| **Civil** | Alvenaria, impermeabilização, pisos, revestimentos |
| **SPDA** | Sistema de proteção contra descargas atmosféricas (para-raios) |
| **Termografia** | Inspeção termográfica elétrica |

### 1.2 Tipos de Contrato

| Plano | Descrição |
|-------|-----------|
| **Avulso** | Manutenção corretiva pontual, sem contrato recorrente |
| **Completo** | Contrato recorrente: todas as disciplinas, relatórios mensais, emergencial 24h |
| **Premium Gestão Patrimonial** | Tudo do Completo + gestão patrimonial completa |

---

## 2. Visão Geral do Sistema

O sistema é chamado internamente de **Sinérgica Campo** e tem como objetivo central conectar o campo (técnicos) ao escritório (engenheiro + gestão) em tempo real, eliminando retrabalho manual e gerando documentação automaticamente.

### 2.1 Módulos do Sistema

```
App-Shell (React)
├── Módulo 1: Propostas Comerciais        ← já em desenvolvimento
├── Módulo 2: PCM / OS (Plano de Manutenção)  ← este documento
│   ├── Sub-módulo: PMOC (Ar Condicionado)    ← foco principal deste documento
│   ├── Sub-módulo: OS Hub (todas as OS)
│   └── Sub-módulo: Equipamentos / Inventário
├── Módulo 3: Financeiro                  ← fase futura
└── Módulo 4: Clientes / CRM              ← fase futura
```

### 2.2 Fluxo Geral do Sistema

```
[Campo: Técnico]  ←→  [Auvo - app OS]  ←→  [Sistema Sinérgica]  ←→  [Escritório: Fabrício]
       ↕                                              ↕
  Executa OS                                 Gera documentos
  Preenche checklist                         Emite laudos PDF
  Registra fotos                             Envia ao cliente
  Fecha OS                                   Controla PMOC
```

---

## 3. Stack e Arquitetura

| Componente | Tecnologia |
|-----------|-----------|
| Front-end | React + TypeScript + Tailwind CSS |
| Back-end / Banco | Supabase (PostgreSQL) |
| Hospedagem | Netlify |
| Autenticação | Supabase Auth |
| Storage (fotos/PDFs) | Supabase Storage |
| OS em Campo | Auvo (integração via API REST + Webhooks) |
| Geração de PDF | Biblioteca a definir (ex: react-pdf, puppeteer) |

### 3.1 Padrões de Nomenclatura do Banco

- Tabelas: `snake_case` com prefixo do módulo (ex: `pmoc_contracts`, `pcm_equipment`)
- UUIDs como chaves primárias: `gen_random_uuid()`
- Timestamps: `created_at` e `updated_at` em todas as tabelas
- Soft delete: coluna `active boolean default true` em vez de exclusão real

---

## 4. O que é PMOC — Contexto para Desenvolvedores

> **Esta seção é crítica.** O PMOC é um documento legal obrigatório com lógica específica de engenharia. Ler com atenção antes de modelar qualquer funcionalidade deste módulo.

### 4.1 Definição

**PMOC = Plano de Manutenção, Operação e Controle**

É um documento técnico-legal **obrigatório por lei federal** para qualquer edificação de uso coletivo que possua sistema de climatização (ar condicionado). Ele define:

- Quais equipamentos existem no imóvel
- Que manutenções devem ser feitas em cada equipamento
- Com que frequência cada manutenção deve ocorrer
- Quem é o responsável técnico (engenheiro com ART)
- Registro de todas as visitas e serviços executados

### 4.2 Base Legal

| Norma | Conteúdo |
|-------|---------|
| **Portaria MS nº 3.523/1998** | Obrigatoriedade do PMOC para edificações de uso coletivo |
| **ABNT NBR 13.971/2014** | Especificações técnicas dos procedimentos de manutenção |
| **ANVISA RDC 09/2003** | Padrões de qualidade do ar interior — obriga análise microbiológica semestral |

### 4.3 Quem é Obrigado

Qualquer edificação de **uso coletivo** com sistema de ar condicionado:
- Condomínios residenciais com sistemas nas áreas comuns
- Edifícios comerciais
- Clínicas e consultórios
- Academias e clubes
- Escritórios corporativos
- Shoppings e galerias

### 4.4 O que Acontece se não Tiver PMOC

- Multa da ANVISA/Vigilância Sanitária
- Responsabilidade civil do proprietário em caso de doenças respiratórias
- Invalidação de seguro do imóvel em sinistros relacionados

### 4.5 Estrutura do PMOC

O PMOC é composto por:

1. **Identificação** — dados do imóvel, responsável, empresa executora e ART do engenheiro
2. **Inventário de Equipamentos** — cadastro técnico de cada aparelho
3. **Cronograma Anual** — calendário de todas as manutenções previstas
4. **Procedimentos por Periodicidade** — checklists específicos para mensal, trimestral, semestral e anual
5. **Ficha de Registro** — laudo emitido após cada visita
6. **Análise Microbiológica** — laudo de qualidade do ar (semestral, laboratório externo)
7. **Não-Conformidades** — registro de problemas encontrados e ações corretivas
8. **Responsabilidades** — obrigações da empresa executora e do cliente

### 4.6 Periodicidades de Manutenção

Este é o coração do PMOC. Existem 4 tipos de manutenção, cada um com seu checklist próprio:

| Tipo | Frequência | Quando ocorre | Acumulativa? |
|------|-----------|---------------|-------------|
| **Mensal (M)** | Todo mês | Meses 1 a 12 | Base |
| **Trimestral (T)** | A cada 3 meses | Meses 3, 6, 9, 12 | Inclui itens mensais |
| **Semestral (S)** | A cada 6 meses | Meses 6 e 12 | Inclui itens mensais + trimestrais |
| **Anual (A)** | Uma vez por ano | Mês 12 | Inclui tudo acima |

> **Regra importante para o desenvolvedor:** As manutenções são **acumulativas**. Uma visita trimestral executa tudo do mensal + os itens extras trimestrais. Uma semestral executa tudo do mensal + trimestral + os extras semestrais. Uma anual executa tudo.

> **Regra da análise microbiológica:** Na visita semestral (meses 6 e 12), é **obrigatório por lei** realizar coleta de amostra de ar para análise microbiológica em laboratório acreditado pelo INMETRO. O laudo deve ser arquivado. O sistema deve controlar isso ativamente.

### 4.7 ART — Anotação de Responsabilidade Técnica

A ART é um documento emitido pelo CREA (Conselho Regional de Engenharia) que vincula o engenheiro ao serviço executado. Para o PMOC:

- É obrigatória para a vigência do contrato
- Deve ser renovada anualmente
- O sistema deve alertar com 30 dias de antecedência do vencimento

---

## 5. Módulo PMOC — Especificação Completa

### 5.1 Fluxo Principal do Módulo PMOC

```
Novo cliente com AR condicionado
         ↓
1. Cadastrar imóvel (pmoc_properties)
         ↓
2. Levantar e cadastrar equipamentos (pmoc_equipment)
         ↓
3. Criar contrato PMOC (pmoc_contracts)
   → Define vigência (1 ano)
   → Vincula engenheiro + número ART
         ↓
4. Sistema gera automaticamente o cronograma anual (pmoc_schedules)
   → 12 visitas mensais
   → 4 trimestrais (meses 3, 6, 9, 12)
   → 2 semestrais (meses 6 e 12)
   → 1 anual (mês 12)
   [Obs: mesmas datas, tipos diferentes — são visitados juntos]
         ↓
5. D-7 antes de cada visita: sistema cria OS no Auvo
         ↓
6. Técnico executa, preenche checklist no Auvo, fecha OS
         ↓
7. Webhook do Auvo → sistema cria pmoc_records (laudo)
         ↓
8. Sistema gera PDF do laudo e envia por e-mail ao cliente
         ↓
9. Dashboard mostra status do contrato, conformidades, vencimentos
```

### 5.2 Entidades do Módulo PMOC

#### 5.2.1 Imóvel (`pmoc_properties`)

Representa o local físico onde os equipamentos estão instalados.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária |
| `client_id` | UUID | FK para tabela de clientes do sistema |
| `name` | text | Nome do imóvel (ex: "Cond. Flores do Campo") |
| `type` | enum | `residencial` / `comercial` / `industrial` / `saude` / `outro` |
| `address` | text | Endereço completo |
| `city` | text | Default: Campinas |
| `state` | text | Default: SP |
| `zipcode` | text | CEP |
| `cnpj_cpf` | text | CNPJ do condomínio ou CPF do responsável |
| `contact_name` | text | Nome do síndico/responsável |
| `contact_role` | text | Cargo (síndico, administrador, gerente) |
| `contact_phone` | text | Telefone |
| `contact_email` | text | E-mail para envio de laudos |
| `created_at` | timestamptz | |

#### 5.2.2 Equipamentos de Ar Condicionado (`pmoc_equipment`)

Um registro por sistema (evaporadora + condensadora = 1 equipamento).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária |
| `property_id` | UUID | FK para pmoc_properties |
| `tag` | text | Código único no imóvel (AC-01, AC-02...). Único por property_id |
| `type` | enum | `split-hiwall` / `cassete` / `piso-teto` / `duto` / `vrf-vrv` / `fancoil` / `central-agua-gelada` / `self-contained` / `janeleiro` / `portatil` / `outro` |
| `brand` | text | Marca (ex: Daikin, Carrier, LG) |
| `model` | text | Modelo |
| `serial_evap` | text | Número de série da evaporadora |
| `serial_cond` | text | Número de série da condensadora |
| `capacity_btu` | integer | Capacidade em BTU/h |
| `location` | text | Localização livre (ex: "Bloco A, 3º andar") |
| `environment` | text | Ambiente específico (ex: "Sala de Reunião 302") |
| `floor` | text | Andar |
| `refrigerant` | enum | `R-22` / `R-410A` / `R-32` / `R-404A` / `R-407C` / `outro`. Default: R-410A |
| `power_kw` | numeric | Potência elétrica em kW |
| `phase` | enum | `mono` / `bi` / `tri` |
| `install_date` | date | Data de instalação (se conhecida) |
| `condition` | enum | `bom` / `regular` / `ruim` / `critico`. Default: bom |
| `photo_url` | text | URL da foto da plaqueta (Supabase Storage) |
| `active` | boolean | Default: true (soft delete) |
| `notes` | text | Observações livres |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

> **Nota de UX:** Na tela mobile de cadastro de equipamento, o campo `serial_evap` e `serial_cond` devem permitir ao técnico fotografar a plaqueta, enviando a imagem para extração automática via IA (AWS Nova ou Gemini). Os campos são preenchidos automaticamente após análise da imagem.

#### 5.2.3 Contrato PMOC (`pmoc_contracts`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária |
| `property_id` | UUID | FK para pmoc_properties |
| `technician_name` | text | Default: "Fabrício Medeiros" |
| `crea` | text | Número do CREA do engenheiro responsável |
| `art_number` | text | Número da ART no CREA |
| `art_date` | date | Data de emissão da ART |
| `start_date` | date | Início da vigência (obrigatório) |
| `end_date` | date | Fim da vigência (obrigatório) |
| `status` | enum | `ativo` / `encerrado` / `renovar`. Default: ativo |
| `notes` | text | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

> **Regra automática:** Quando `end_date - 30 dias = hoje` → mudar `status` para `renovar` e disparar alerta.

#### 5.2.4 Cronograma de Visitas (`pmoc_schedules`)

Gerado automaticamente ao criar o contrato. Uma linha por visita planejada.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária |
| `contract_id` | UUID | FK para pmoc_contracts |
| `property_id` | UUID | FK para pmoc_properties |
| `scheduled_date` | date | Data planejada da visita |
| `maintenance_type` | enum | `mensal` / `trimestral` / `semestral` / `anual` |
| `month_ref` | integer | Mês de referência (1-12) |
| `year_ref` | integer | Ano de referência |
| `status` | enum | `agendado` / `realizado` / `atrasado` / `cancelado`. Default: agendado |
| `record_id` | UUID | FK para pmoc_records (preenchido após execução) |
| `auvo_os_id` | text | ID da OS criada no Auvo |
| `created_at` | timestamptz | |

> **Lógica de geração do cronograma:** Para um contrato de 12 meses:
> - Meses 1, 2, 4, 5, 7, 8, 10, 11 → gerar 1 schedule do tipo `mensal`
> - Meses 3, 9 → gerar 1 schedule do tipo `trimestral`
> - Meses 6 → gerar 1 schedule do tipo `semestral`
> - Mês 12 → gerar 1 schedule do tipo `anual`
>
> **Nota:** Os tipos são acumulativos. Uma visita `anual` executa anual + semestral + trimestral + mensal. O cronograma registra apenas o tipo mais alto da visita.

#### 5.2.5 Registro de Visita / Laudo (`pmoc_records`)

Criado automaticamente pelo webhook do Auvo quando a OS é fechada.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária |
| `schedule_id` | UUID | FK para pmoc_schedules |
| `contract_id` | UUID | FK para pmoc_contracts |
| `property_id` | UUID | FK para pmoc_properties |
| `executed_date` | date | Data real de execução |
| `time_start` | time | Hora de início |
| `time_end` | time | Hora de término |
| `maintenance_type` | enum | Tipo executado |
| `technician_name` | text | Nome do técnico |
| `auvo_os_number` | text | Número da OS no Auvo |
| `equipment_records` | jsonb | Array: por equipamento atendido (ver schema abaixo) |
| `checklist` | jsonb | Checklist completo por seção (ver definições na seção 5.3) |
| `materials_used` | jsonb | Array: `[{item, qty, obs}]` |
| `nonconformities` | jsonb | Array: `[{equipment_id, tag, description, severity, action, deadline}]` |
| `observations` | text | Observações gerais da visita |
| `pending_items` | text | Pendências para próxima visita |
| `next_visit_date` | date | Previsão da próxima visita |
| `technician_signed` | boolean | Assinatura digital do técnico |
| `client_signed` | boolean | Assinatura digital do responsável do imóvel |
| `pdf_url` | text | URL do PDF do laudo gerado (Supabase Storage) |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**Schema do campo `equipment_records` (JSONB):**
```json
[
  {
    "equipment_id": "uuid",
    "tag": "AC-01",
    "type": "split-hiwall",
    "location": "Sala 302",
    "services_executed": ["Limpeza filtros", "Verificação dreno"],
    "conformity": "conforme",
    "observations": "Filtro com desgaste, recomendar troca em 3 meses"
  }
]
```

**Schema do campo `nonconformities` (JSONB):**
```json
[
  {
    "equipment_id": "uuid",
    "tag": "AC-03",
    "description": "Serpentina com acúmulo severo de lodo",
    "severity": "alta",
    "recommended_action": "Limpeza química urgente",
    "deadline": "2026-07-15"
  }
]
```

#### 5.2.6 Análise Microbiológica (`pmoc_microbio_analysis`)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária |
| `contract_id` | UUID | FK para pmoc_contracts |
| `property_id` | UUID | FK para pmoc_properties |
| `analysis_date` | date | Data da coleta |
| `lab_name` | text | Nome do laboratório |
| `lab_accreditation` | text | Nº de acreditação INMETRO |
| `collection_points` | integer | Quantidade de pontos de coleta |
| `fungi_ufc_m3` | numeric | Resultado fungos (limite legal: ≤ 750 UFC/m³) |
| `ie_ratio` | numeric | Relação interior/exterior (limite legal: ≤ 1,5) |
| `coliforms_result` | enum | `ausencia` / `presenca` |
| `status` | enum | `conforme` / `nao-conforme` / `pendente` |
| `report_number` | text | Número do laudo do laboratório |
| `report_url` | text | PDF do laudo (Supabase Storage) |
| `corrective_action_needed` | boolean | Default: false |
| `notes` | text | |
| `created_at` | timestamptz | |

> **Regra de status automático:** Se `fungi_ufc_m3 > 750` OU `ie_ratio > 1.5` OU `coliforms_result = 'presenca'` → `status = 'nao-conforme'` + criar NC + alertar engenheiro imediatamente.

### 5.3 Definição dos Checklists por Tipo de Manutenção

Estes checklists são a **referência canônica** do sistema. São usados para:
- Pré-preencher as OS no Auvo
- Registrar o que foi executado no `pmoc_records.checklist`
- Gerar o laudo PDF

#### Manutenção Mensal

**Evaporadora:**
- `m_e_01` Limpeza dos filtros de ar (lavagem ou aspiração)
- `m_e_02` Limpeza do painel frontal e gabinete externo
- `m_e_03` Verificação e desobstrução do dreno de condensado
- `m_e_04` Verificação de ruídos e vibrações anormais
- `m_e_05` Verificação das temperaturas de insuflamento e retorno
- `m_e_06` Verificação do funcionamento de todos os modos (frio, quente, ventilação, auto)
- `m_e_07` Verificação do controle remoto / painel de comando
- `m_e_08` Verificação visual de vazamentos de refrigerante
- `m_e_09` Verificação de odores anormais

**Condensadora:**
- `m_c_01` Verificação visual de acúmulo de sujeira nas aletas
- `m_c_02` Verificação de ruídos e vibrações
- `m_c_03` Verificação de obstruções ao fluxo de ar
- `m_c_04` Verificação do estado da fiação elétrica aparente

#### Manutenção Trimestral (além dos itens mensais)

**Evaporadora:**
- `t_e_01` Limpeza completa da serpentina evaporadora (spray higienizante)
- `t_e_02` Limpeza e higienização da bandeja de condensado
- `t_e_03` Verificação e limpeza das pás do ventilador
- `t_e_04` Verificação e aperto das conexões elétricas do módulo interno
- `t_e_05` Medição da corrente elétrica do motor do ventilador
- `t_e_06` Verificação do estado dos rolamentos (ruído, folga)
- `t_e_07` Verificação da integridade do isolamento térmico das tubulações

**Condensadora:**
- `t_c_01` Limpeza das aletas condensadoras (jato d'água ou ar comprimido)
- `t_c_02` Limpeza das pás do ventilador condensador
- `t_c_03` Verificação e aperto das conexões elétricas
- `t_c_04` Medição da corrente elétrica do compressor e ventilador
- `t_c_05` Verificação visual do estado do compressor

**Sistema Geral:**
- `t_s_01` Verificação do nível de gás refrigerante (delta-t mínimo 8°C)
- `t_s_02` Verificação de vazamentos nas conexões de refrigerante
- `t_s_03` Verificação do funcionamento dos protetores e alarmes
- `t_s_04` Registro de temperatura de bulbo seco no insuflamento e retorno

#### Manutenção Semestral (além de mensal + trimestral)

**Limpeza Profunda:**
- `s_l_01` Limpeza química da serpentina evaporadora (bactericida/fungicida)
- `s_l_02` Limpeza química da serpentina condensadora
- `s_l_03` Higienização completa do gabinete interno e externo
- `s_l_04` Limpeza do dreno com jato de pressão

**Elétrico:**
- `s_e_01` Medição de tensão de alimentação (desvio ≤ ±10% do nominal)
- `s_e_02` Medição de corrente em todas as fases (comparar com plaqueta)
- `s_e_03` Verificação do estado dos capacitores

**Refrigeração:**
- `s_r_01` Verificação de pressão do sistema (manifold gauge)
- `s_r_02` Verificação do superaquecimento e subresfriamento
- `s_r_03` Verificação de vazamentos com detector eletrônico

**Microbiológico (OBRIGATÓRIO POR LEI):**
- `s_m_01` ⚠️ Coleta de amostra microbiológica do ar — laboratório acreditado INMETRO
- `s_m_02` ⚠️ Emissão de laudo microbiológico pelo laboratório
- `s_m_03` ⚠️ Registro e arquivamento do laudo no sistema (validade 6 meses)

#### Manutenção Anual (além de tudo acima)

**Revisão Geral:**
- `a_r_01` Inspeção completa de todas as tubulações e conexões
- `a_r_02` Verificação da integridade dos suportes e fixações
- `a_r_03` Verificação do estado das buchas e vedações
- `a_r_04` Avaliação da vida útil dos componentes (filtros, pás, capacitores)
- `a_r_05` Verificação e recarga de gás refrigerante (se necessário — emitir certificado)
- `a_r_06` Troca de filtros de ar quando danificados
- `a_r_07` Emissão de relatório técnico anual completo

**Documentação:**
- `a_d_01` Renovação da ART para o próximo período
- `a_d_02` Atualização do inventário de equipamentos
- `a_d_03` Emissão de novo PMOC (ou aditivo) para a vigência seguinte

---

## 6. Módulo PCM — Plano de Manutenção Geral

O PCM (Plano de Controle de Manutenção) é o módulo que agrega **todas as disciplinas** de manutenção predial em um único plano operacional.

### 6.1 Diferença entre PMOC e PCM

| | PMOC | PCM |
|---|------|-----|
| **Escopo** | Apenas ar condicionado | Todas as disciplinas (elétrica, hidráulica, civil, SPCI...) |
| **Obrigação** | Lei federal | Boa prática de engenharia + contrato |
| **Documento gerado** | PMOC (documento legal assinado) + Laudos de visita | Relatório Mensal de Manutenções |
| **Frequência** | Mensal a anual (definida por lei) | Definida no contrato com o cliente |
| **Rastreio legal** | Obrigatório (ANVISA, CREA) | Contratual |

### 6.2 Estrutura do PCM

O PCM organiza o trabalho por:
- **Imóvel** → quais sistemas têm
- **Sistema/Disciplina** → que manutenções são necessárias
- **Periodicidade** → quando deve ser feito
- **OS** → ordem de serviço gerada e enviada para o técnico via Auvo

---

## 7. Equipamentos de Ar Condicionado no Plano Geral

Este é um ponto de integração crítico. Os equipamentos de AR cadastrados no PMOC **devem aparecer no plano de manutenção geral** do imóvel, sem duplicação de dados.

### 7.1 Modelo de Integração

```
pcm_equipment (tabela geral de equipamentos)
    ├── id, property_id, discipline, type, tag, ...
    └── pmoc_equipment_id (FK nullable) ← link quando for AR condicionado
         ↓
    Quando pmoc_equipment_id está preenchido:
    → O equipment é de AR condicionado
    → Suas manutenções são regidas pelo PMOC
    → O checklist vem do módulo PMOC
    → O histórico de manutenções vem dos pmoc_records
```

### 7.2 Tabela `pcm_equipment` (geral — todas as disciplinas)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária |
| `property_id` | UUID | FK para propriedade/imóvel |
| `pmoc_equipment_id` | UUID | FK nullable para pmoc_equipment (quando for AR) |
| `discipline` | enum | `eletrica` / `hidraulica` / `climatizacao` / `spci` / `civil` / `spda` / `outro` |
| `type` | text | Tipo específico (bomba, quadro elétrico, split, reservatório...) |
| `tag` | text | Código único no imóvel (EL-01, HI-01, AC-01...) |
| `name` | text | Descrição do equipamento |
| `brand` | text | Marca |
| `model` | text | Modelo |
| `serial` | text | Número de série |
| `location` | text | Localização |
| `install_date` | date | |
| `last_maintenance` | date | Atualizado automaticamente |
| `next_maintenance` | date | Calculado conforme plano |
| `condition` | enum | `bom` / `regular` / `ruim` / `critico` |
| `photo_url` | text | |
| `active` | boolean | |
| `notes` | text | |
| `created_at` | timestamptz | |

### 7.3 Fluxo de Integração PMOC ↔ PCM

```
Técnico cadastra equipamento de AR no PMOC
          ↓
Sistema cria pmoc_equipment (dados técnicos do AR)
          ↓
Sistema cria automaticamente pcm_equipment vinculado
  discipline = 'climatizacao'
  pmoc_equipment_id = <id do pmoc_equipment>
  tag = mesmo tag do PMOC (AC-01)
          ↓
No plano geral do imóvel, AC-01 aparece com:
  → Dados do equipamento (marca, modelo, BTU, local)
  → Próxima manutenção (vem do pmoc_schedules)
  → Histórico (vem dos pmoc_records)
  → Status de conformidade PMOC
          ↓
O técnico não vê "PMOC" ou "PCM" — ele vê apenas a OS no Auvo
```

---

## 8. OS Hub — Central de Ordens de Serviço

O OS Hub é o núcleo operacional que unifica todas as OS, independente da origem.

### 8.1 Tipos de OS

| Código | Nome | Origem | Prazo SLA | Cor no sistema |
|--------|------|--------|-----------|----------------|
| **C1** | Emergencial | Chamado urgente | Mesmo dia / 4h | 🔴 Vermelho |
| **C2** | Corretiva Programada | Chamado normal | 72h | 🟠 Laranja |
| **P1** | Preventiva PMOC | Módulo PMOC (automático) | Janela ±3 dias | 🔵 Azul |
| **P2** | Preventiva Predial | Módulo PCM (automático) | Janela ±7 dias | 🟢 Verde |
| **IN** | Inspeção / Follow-up | Detectada em visita anterior | Prazo acordado | 🟣 Roxo |

### 8.2 Tabela `os_hub`

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | UUID | Chave primária |
| `type` | enum | `C1` / `C2` / `P1` / `P2` / `IN` |
| `priority` | integer | 1 (mais urgente) a 5 (menos urgente) — calculado |
| `status` | enum | `aberta` / `agendada` / `em-execucao` / `concluida` / `cancelada` / `atrasada` |
| `property_id` | UUID | FK para imóvel |
| `discipline` | enum | Disciplina (eletrica, climatizacao...) |
| `equipment_ids` | UUID[] | Array de equipamentos envolvidos |
| `description` | text | Descrição do serviço |
| `requested_by` | text | Quem solicitou (cliente, sistema PMOC, sistema PCM) |
| `technician_id` | UUID | FK para técnico atribuído |
| `scheduled_date` | date | Data agendada |
| `sla_deadline` | timestamptz | Prazo máximo conforme SLA |
| `pmoc_schedule_id` | UUID | FK nullable para pmoc_schedules |
| `pcm_plan_id` | UUID | FK nullable para plano PCM |
| `auvo_task_id` | text | ID da task no Auvo (após criação) |
| `auvo_task_url` | text | Link direto para a OS no Auvo |
| `completed_at` | timestamptz | |
| `pmoc_record_id` | UUID | FK para pmoc_records (após conclusão, se P1) |
| `notes` | text | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### 8.3 Cálculo de Prioridade

```
Função calcular_prioridade(os):
  se os.type = 'C1' → prioridade = 1  (emergencial - deslocar agora)
  se os.type = 'C2' → prioridade = 2  (corretiva programada)
  se os.type = 'P1' e scheduled_date < hoje → prioridade = 2  (PMOC atrasada = risco legal)
  se os.type = 'P1' e scheduled_date >= hoje → prioridade = 3  (preventiva no prazo)
  se os.type = 'P2' → prioridade = 3  (preventiva predial)
  se os.type = 'IN' → prioridade = 4  (inspeção/follow-up)
```

> **Nota importante:** Uma OS de PMOC atrasada (`P1` + data vencida) sobe para prioridade 2, igual a uma corretiva programada. Isso porque o atraso no PMOC representa **risco legal** para o cliente e para a Sinérgica.

### 8.4 Regra dos Dias Preventivos

Para evitar que as corretivas consumam toda a capacidade e as preventivas fiquem sempre atrasadas, o sistema deve respeitar **blocos de agenda preventiva**:

- **Dias preventivos (configurável por técnico):** Os dias definidos como "preventivos" só recebem OS tipo P1 e P2. OS tipo C2 e IN não são alocadas nesses dias.
- **Dias abertos:** Recebem qualquer tipo de OS.
- **Exceção:** OS tipo C1 (emergencial) pode ser inserida em qualquer dia, incluindo dias preventivos.

Sugestão padrão (configurável): 2 dias/semana por técnico = dias preventivos.

---

## 9. Integração com Auvo

O Auvo é o aplicativo que os técnicos usam em campo. Toda OS do sistema Sinérgica deve ser espelhada no Auvo.

### 9.1 Fluxo de Integração

```
Sistema Sinérgica                    Auvo
       │                               │
       │── POST /tasks ───────────────►│  Cria OS no Auvo
       │   (D-7 antes da visita)       │
       │                               │
       │                        Técnico executa
       │                        Preenche checklist
       │                        Fecha OS
       │                               │
       │◄── Webhook (POST) ────────────│  Notifica conclusão
       │                               │
  Atualiza os_hub.status
  Cria pmoc_records (se P1)
  Gera PDF do laudo
  Envia e-mail ao cliente
```

### 9.2 Criação de OS no Auvo — Payload

```json
POST /api/v1/tasks

{
  "title": "[P1] Preventiva PMOC Trimestral — Cond. Flores",
  "client_id": "<auvo_client_id>",
  "scheduled_date": "2026-07-01",
  "assigned_technician_id": "<auvo_tech_id>",
  "description": "Manutenção preventiva trimestral — PMOC\nEquipamentos: AC-01, AC-02, AC-03, AC-04, AC-05\nContrato PMOC: #2026-001",
  "custom_fields": {
    "sinergica_os_id": "<os_hub_uuid>",
    "os_type": "P1",
    "maintenance_type": "trimestral",
    "pmoc_schedule_id": "<pmoc_schedule_uuid>",
    "checklist_ref": "trimestral"
  },
  "checklist": [
    { "id": "m_e_01", "label": "Limpeza dos filtros de ar", "required": true },
    { "id": "m_e_02", "label": "Limpeza do painel frontal", "required": true },
    ...
  ]
}
```

### 9.3 Nomenclatura Padrão das OS no Auvo

```
[TIPO] Tipo de Manutenção — Nome do Cliente — Mês/Ano

Exemplos:
[P1] Preventiva PMOC Mensal — Cond. Flores — Jul/2026
[P1] Preventiva PMOC Trimestral — Ed. Central — Jul/2026
[C1] EMERGENCIAL Elétrica — Cond. Flores — 01/07/2026
[C2] Corretiva Hidráulica — Ed. Park Life — Jul/2026
[P2] Preventiva Predial Elétrica — Cond. Flores — Jul/2026
```

### 9.4 Webhook do Auvo → Sistema Sinérgica

Quando o técnico fecha a OS no Auvo, o sistema recebe:

```json
POST /webhooks/auvo/task-completed

{
  "task_id": "<auvo_task_id>",
  "custom_fields": {
    "sinergica_os_id": "<os_hub_uuid>",
    "os_type": "P1",
    "pmoc_schedule_id": "<uuid>"
  },
  "completed_at": "2026-07-01T14:32:00Z",
  "technician_name": "João Silva",
  "checklist_completed": [
    { "id": "m_e_01", "checked": true },
    { "id": "m_e_02", "checked": true },
    ...
  ],
  "photos": ["url1", "url2"],
  "notes": "Filtro AC-03 com desgaste, recomendar troca",
  "materials": [
    { "item": "Produto higienizante serpentina", "qty": 1 }
  ]
}
```

**Processamento do webhook pelo sistema:**
1. Localizar `os_hub` pelo `sinergica_os_id`
2. Atualizar `os_hub.status = 'concluida'`
3. Se `os_type = 'P1'`: criar `pmoc_records` com dados do checklist
4. Atualizar `pmoc_schedules.status = 'realizado'`
5. Atualizar `pcm_equipment.last_maintenance = completed_at`
6. Calcular e atualizar `pcm_equipment.next_maintenance`
7. Gerar PDF do laudo
8. Enviar e-mail ao cliente com laudo em anexo

---

## 10. Fluxos de Informação — Diagramas

### 10.1 Fluxo Completo: Contrato PMOC → Execução → Laudo

```
┌─────────────────────────────────────────────────────────────────┐
│  ESCRITÓRIO                                                      │
│                                                                  │
│  1. Cadastrar imóvel          2. Cadastrar equipamentos AR       │
│     (nome, endereço,             (tag, tipo, marca, BTU,         │
│      responsável, CNPJ)           localização, foto plaqueta)   │
│             │                              │                     │
│             └──────────────┬───────────────┘                     │
│                            ▼                                     │
│  3. Criar contrato PMOC                                          │
│     (datas, engenheiro, ART)                                     │
│             │                                                    │
│             ▼                                                    │
│  4. Sistema gera cronograma automático                           │
│     12 visitas × tipo (M/T/S/A)                                  │
└─────────────────────────────────────────────────────────────────┘
                       │
            D-7 antes de cada visita
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  SISTEMA SINÉRGICA                                               │
│                                                                  │
│  5. Cria OS no Auvo com:                                         │
│     → Tipo: [P1] Preventiva PMOC                                 │
│     → Cliente e endereço                                         │
│     → Lista de equipamentos                                      │
│     → Checklist pré-carregado (mensal/trimestral/semestral/anual)│
│     → Técnico responsável                                        │
└─────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  CAMPO — TÉCNICO (app Auvo)                                      │
│                                                                  │
│  6. Recebe notificação da OS                                     │
│  7. Executa manutenção por equipamento                           │
│  8. Marca checklist (item por item)                              │
│  9. Registra NCs encontradas                                     │
│  10. Tira fotos dos equipamentos                                 │
│  11. Fecha a OS no Auvo                                          │
└─────────────────────────────────────────────────────────────────┘
                       │
                 Webhook Auvo
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  SISTEMA SINÉRGICA — PÓS-EXECUÇÃO                                │
│                                                                  │
│  12. Recebe webhook → atualiza OS Hub                            │
│  13. Cria pmoc_records (laudo)                                   │
│  14. Atualiza pmoc_schedules.status = realizado                  │
│  15. Gera PDF do laudo com logo Sinérgica                        │
│  16. Envia e-mail ao responsável do imóvel                       │
│  17. Atualiza histórico no PCM geral                             │
└─────────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  CLIENTE (responsável do imóvel)                                 │
│                                                                  │
│  18. Recebe e-mail com laudo PDF da visita                       │
│  19. Laudo fica arquivado no sistema para acesso futuro          │
└─────────────────────────────────────────────────────────────────┘
```

### 10.2 Fluxo do OS Hub — Todas as Origens

```
                  FONTES DE TRABALHO
                         │
         ┌───────────────┼───────────────┐
         │               │               │
   Cliente liga     PMOC gera        PCM gera
   (corretiva)     preventiva       preventiva
         │           D-7 auto          auto
         │               │               │
         └───────────────┼───────────────┘
                         │
                         ▼
               ┌─────────────────┐
               │   TRIAGEM/HUB   │
               │                 │
               │  Atribui tipo:  │
               │  C1/C2/P1/P2/IN │
               │                 │
               │  Calcula        │
               │  prioridade     │
               │  (1 a 4)        │
               │                 │
               │  Verifica       │
               │  agenda         │
               │  técnico        │
               └────────┬────────┘
                        │
               API POST /tasks
                        │
                        ▼
               ┌─────────────────┐
               │      AUVO       │
               │                 │
               │  OS disponível  │
               │  no app do      │
               │  técnico        │
               └────────┬────────┘
                        │
                   Execução +
                   fechamento
                        │
                   Webhook POST
                        │
                        ▼
               ┌─────────────────┐
               │  PÓS-EXECUÇÃO   │
               │                 │
               │  Atualiza PMOC  │ ← se P1
               │  Gera laudo PDF │ ← se P1
               │  Envia cliente  │ ← se P1
               │  Atualiza PCM   │ ← sempre
               └─────────────────┘
```

### 10.3 Fluxo de Priorização de OS

```
Nova OS entra no sistema
         │
         ▼
    Qual o tipo?
         │
    ┌────┴─────────────────────────────────────────┐
    │          │           │           │            │
   C1          C2          P1          P2           IN
    │          │           │           │            │
    ▼          │     Está atrasada?    │            │
PRIORIDADE 1   │     │         │       │            │
Deslocar agora │    Sim       Não      │            │
               │     │         │       │            │
               ▼     ▼         ▼       ▼            ▼
          PRIORIDADE 2    PRIORIDADE 3  PRIORIDADE 3  PRIORIDADE 4
         (igual corretiva) (no prazo)  (predial)    (follow-up)
```

### 10.4 Integração PMOC ↔ PCM ↔ Equipamentos

```
pmoc_equipment (AR Condicionado)
         │
         │ ao criar
         ▼
pcm_equipment (disciplina=climatizacao)
  pmoc_equipment_id = <id> ← link
         │
         │ próxima manutenção vem de
         ▼
pmoc_schedules (cronograma PMOC)
  next_scheduled → pcm_equipment.next_maintenance
         │
         │ histórico vem de
         ▼
pmoc_records (laudos executados)
  → pcm_equipment.last_maintenance
  → pcm_equipment.condition (atualizado pelo técnico)
```

---

## 11. Schema do Banco de Dados

```sql
-- ══════════════════════════════════════════════════
-- MÓDULO PMOC
-- ══════════════════════════════════════════════════

CREATE TABLE pmoc_properties (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID REFERENCES clients(id),
  name            TEXT NOT NULL,
  type            TEXT CHECK (type IN ('residencial','comercial','industrial','saude','outro')),
  address         TEXT,
  city            TEXT DEFAULT 'Campinas',
  state           TEXT DEFAULT 'SP',
  zipcode         TEXT,
  cnpj_cpf        TEXT,
  contact_name    TEXT,
  contact_role    TEXT,
  contact_phone   TEXT,
  contact_email   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pmoc_equipment (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id     UUID NOT NULL REFERENCES pmoc_properties(id),
  tag             TEXT NOT NULL,
  type            TEXT CHECK (type IN ('split-hiwall','cassete','piso-teto','duto','vrf-vrv',
                              'fancoil','central-agua-gelada','self-contained','janeleiro','portatil','outro')),
  brand           TEXT,
  model           TEXT,
  serial_evap     TEXT,
  serial_cond     TEXT,
  capacity_btu    INTEGER,
  location        TEXT,
  environment     TEXT,
  floor           TEXT,
  refrigerant     TEXT DEFAULT 'R-410A' CHECK (refrigerant IN ('R-22','R-410A','R-32','R-404A','R-407C','outro')),
  power_kw        NUMERIC,
  phase           TEXT CHECK (phase IN ('mono','bi','tri')),
  install_date    DATE,
  condition       TEXT DEFAULT 'bom' CHECK (condition IN ('bom','regular','ruim','critico')),
  photo_url       TEXT,
  active          BOOLEAN DEFAULT TRUE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (property_id, tag)
);

CREATE TABLE pmoc_contracts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id       UUID NOT NULL REFERENCES pmoc_properties(id),
  technician_name   TEXT DEFAULT 'Fabrício Medeiros',
  crea              TEXT,
  art_number        TEXT,
  art_date          DATE,
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  status            TEXT DEFAULT 'ativo' CHECK (status IN ('ativo','encerrado','renovar')),
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pmoc_schedules (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id         UUID NOT NULL REFERENCES pmoc_contracts(id),
  property_id         UUID NOT NULL REFERENCES pmoc_properties(id),
  scheduled_date      DATE NOT NULL,
  maintenance_type    TEXT NOT NULL CHECK (maintenance_type IN ('mensal','trimestral','semestral','anual')),
  month_ref           INTEGER CHECK (month_ref BETWEEN 1 AND 12),
  year_ref            INTEGER,
  status              TEXT DEFAULT 'agendado' CHECK (status IN ('agendado','realizado','atrasado','cancelado')),
  record_id           UUID REFERENCES pmoc_records(id),
  auvo_os_id          TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pmoc_records (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id         UUID REFERENCES pmoc_schedules(id),
  contract_id         UUID NOT NULL REFERENCES pmoc_contracts(id),
  property_id         UUID NOT NULL REFERENCES pmoc_properties(id),
  executed_date       DATE NOT NULL,
  time_start          TIME,
  time_end            TIME,
  maintenance_type    TEXT CHECK (maintenance_type IN ('mensal','trimestral','semestral','anual','corretiva')),
  technician_name     TEXT,
  auvo_os_number      TEXT,
  equipment_records   JSONB,
  checklist           JSONB,
  materials_used      JSONB,
  nonconformities     JSONB,
  observations        TEXT,
  pending_items       TEXT,
  next_visit_date     DATE,
  technician_signed   BOOLEAN DEFAULT FALSE,
  client_signed       BOOLEAN DEFAULT FALSE,
  pdf_url             TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pmoc_microbio_analysis (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id                 UUID NOT NULL REFERENCES pmoc_contracts(id),
  property_id                 UUID NOT NULL REFERENCES pmoc_properties(id),
  analysis_date               DATE NOT NULL,
  lab_name                    TEXT,
  lab_accreditation           TEXT,
  collection_points           INTEGER,
  fungi_ufc_m3                NUMERIC,
  ie_ratio                    NUMERIC,
  coliforms_result            TEXT CHECK (coliforms_result IN ('ausencia','presenca')),
  status                      TEXT DEFAULT 'pendente' CHECK (status IN ('conforme','nao-conforme','pendente')),
  report_number               TEXT,
  report_url                  TEXT,
  corrective_action_needed    BOOLEAN DEFAULT FALSE,
  notes                       TEXT,
  created_at                  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pmoc_nonconformity_log (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id             UUID REFERENCES pmoc_records(id),
  contract_id           UUID REFERENCES pmoc_contracts(id),
  equipment_id          UUID REFERENCES pmoc_equipment(id),
  tag                   TEXT,
  description           TEXT NOT NULL,
  severity              TEXT CHECK (severity IN ('alta','media','baixa')),
  recommended_action    TEXT,
  responsible           TEXT,
  deadline              DATE,
  completed_at          DATE,
  status                TEXT DEFAULT 'aberto' CHECK (status IN ('aberto','em-andamento','fechado')),
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════
-- MÓDULO PCM — EQUIPAMENTOS GERAIS
-- ══════════════════════════════════════════════════

CREATE TABLE pcm_equipment (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id         UUID NOT NULL,
  pmoc_equipment_id   UUID REFERENCES pmoc_equipment(id),  -- link se for AR
  discipline          TEXT NOT NULL CHECK (discipline IN ('eletrica','hidraulica','climatizacao',
                                           'spci','civil','spda','outro')),
  type                TEXT,
  tag                 TEXT NOT NULL,
  name                TEXT,
  brand               TEXT,
  model               TEXT,
  serial              TEXT,
  location            TEXT,
  install_date        DATE,
  last_maintenance    DATE,
  next_maintenance    DATE,
  condition           TEXT DEFAULT 'bom' CHECK (condition IN ('bom','regular','ruim','critico')),
  photo_url           TEXT,
  active              BOOLEAN DEFAULT TRUE,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════
-- OS HUB
-- ══════════════════════════════════════════════════

CREATE TABLE os_hub (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type                TEXT NOT NULL CHECK (type IN ('C1','C2','P1','P2','IN')),
  priority            INTEGER CHECK (priority BETWEEN 1 AND 4),
  status              TEXT DEFAULT 'aberta' CHECK (status IN
                        ('aberta','agendada','em-execucao','concluida','cancelada','atrasada')),
  property_id         UUID NOT NULL,
  discipline          TEXT,
  equipment_ids       UUID[],
  description         TEXT,
  requested_by        TEXT,
  technician_id       UUID,
  scheduled_date      DATE,
  sla_deadline        TIMESTAMPTZ,
  pmoc_schedule_id    UUID REFERENCES pmoc_schedules(id),
  pcm_plan_id         UUID,
  auvo_task_id        TEXT,
  auvo_task_url       TEXT,
  completed_at        TIMESTAMPTZ,
  pmoc_record_id      UUID REFERENCES pmoc_records(id),
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 12. Regras de Negócio e Alertas

### 12.1 Geração Automática de Cronograma (trigger ao criar contrato)

Ao inserir um registro em `pmoc_contracts`, o sistema deve:

1. Calcular todos os meses entre `start_date` e `end_date`
2. Para cada mês, determinar o tipo de manutenção:
   - Mês 12 (ou múltiplo de 12): `anual`
   - Mês 6 (ou múltiplo de 6, exceto 12): `semestral`
   - Mês 3, 9 (ou múltiplo de 3, exceto 6 e 12): `trimestral`
   - Demais meses: `mensal`
3. Inserir uma linha em `pmoc_schedules` por mês

### 12.2 Atualização de Status Atrasado (cron job diário)

```
Todos os dias às 00:01:
  UPDATE pmoc_schedules
  SET status = 'atrasado'
  WHERE status = 'agendado'
  AND scheduled_date < CURRENT_DATE

  UPDATE os_hub
  SET status = 'atrasada', priority = 2
  WHERE status IN ('aberta','agendada')
  AND sla_deadline < NOW()
```

### 12.3 Criação de OS no Auvo (cron job diário)

```
Todos os dias às 08:00:
  Buscar pmoc_schedules onde:
    status = 'agendado'
    scheduled_date = CURRENT_DATE + 7 dias
    auvo_os_id IS NULL

  Para cada schedule encontrado:
    → Criar OS no Auvo via API
    → Salvar auvo_os_id no schedule
    → Criar registro em os_hub
```

### 12.4 Alerta de ART Vencendo

```
Todos os dias às 08:00:
  Buscar pmoc_contracts onde:
    status = 'ativo'
    end_date - 30 dias <= CURRENT_DATE

  Para cada contrato:
    → Mudar status para 'renovar'
    → Notificar Fabrício (e-mail + dashboard)
    → Mensagem: "PMOC de {imóvel} vence em {X} dias. Renovar ART."
```

### 12.5 Análise Microbiológica Vencendo

```
Todos os dias às 08:00:
  Para cada pmoc_contract ativo:
    Buscar última análise microbiológica do contrato
    Se (data da última análise + 180 dias) <= CURRENT_DATE + 30:
      → Alertar no dashboard
      → Mensagem: "Análise microbiológica de {imóvel} vence em {X} dias."
```

### 12.6 NC Alta Detectada

```
Ao criar pmoc_records com nonconformities onde severity = 'alta':
  → Notificar Fabrício imediatamente (push + e-mail)
  → Inserir em pmoc_nonconformity_log com status = 'aberto'
  → Mensagem: "NC ALTA detectada em {imóvel} — {tag}: {descrição}"
```

### 12.7 Análise Microbiológica Não-Conforme

```
Ao inserir pmoc_microbio_analysis:
  Se fungi_ufc_m3 > 750 OU ie_ratio > 1.5 OU coliforms_result = 'presenca':
    → status = 'nao-conforme'
    → corrective_action_needed = TRUE
    → Notificar Fabrício imediatamente
    → Notificar responsável do imóvel
    → Criar NC no pmoc_nonconformity_log
    → Mensagem: "ATENÇÃO: Análise microbiológica NÃO CONFORME em {imóvel}. Ação imediata necessária."
```

---

## 13. Especificação de Telas

### 13.1 Dashboard PMOC (escritório)

**URL:** `/pmoc/dashboard`

**Widgets:**

| Widget | Fonte de dados |
|--------|---------------|
| Total de contratos PMOC ativos | `COUNT(pmoc_contracts WHERE status='ativo')` |
| Visitas realizadas este mês | `COUNT(pmoc_schedules WHERE status='realizado' AND month_ref=atual)` |
| Visitas pendentes este mês | `COUNT(pmoc_schedules WHERE status='agendado' AND month_ref=atual)` |
| Visitas atrasadas | `COUNT(pmoc_schedules WHERE status='atrasado')` |
| Análises microbiológicas vencendo em 30 dias | Cálculo sobre `pmoc_microbio_analysis` |
| Contratos vencendo em 60 dias | `COUNT(pmoc_contracts WHERE end_date <= hoje+60)` |
| NCs abertas por severidade | `COUNT(pmoc_nonconformity_log GROUP BY severity WHERE status!='fechado')` |

### 13.2 Lista de Contratos PMOC

**URL:** `/pmoc/contratos`

Tabela com: imóvel, início, fim, status (badge colorido), total de equipamentos, próxima visita, conformidade geral (% de visitas realizadas no prazo).

Filtros: status, mês, imóvel.

Ação: **+ Novo Contrato**

### 13.3 Detalhe do Contrato PMOC

**URL:** `/pmoc/contratos/:id`

Abas:
1. **Identificação** — dados do imóvel, engenheiro, ART, vigência
2. **Inventário** — lista de equipamentos com fotos, condição, últimas manutenções
3. **Cronograma** — tabela 12 meses × status (✅ realizado, ⏳ agendado, ⚠️ atrasado)
4. **Laudos** — lista de registros com link para PDF
5. **Análises Micro.** — histórico de análises microbiológicas
6. **Não-Conformidades** — NCs abertas e fechadas

### 13.4 Cadastro de Equipamento (mobile-first)

**URL:** `/pmoc/equipamentos/novo`

Campos em sequência (wizard):
1. Tirar foto da plaqueta → IA extrai dados automaticamente
2. Confirmar/corrigir: marca, modelo, BTU, número de série
3. Definir: localização, ambiente, andar
4. Definir: tipo de equipamento, refrigerante, fase
5. Salvar

### 13.5 Laudo de Visita (visualização)

**URL:** `/pmoc/laudos/:id`

- Cabeçalho: dados do imóvel, data, técnico, tipo de manutenção
- Tabela de equipamentos atendidos
- Checklist por seção (com itens marcados)
- Não-conformidades com severidade
- Materiais utilizados
- Observações e pendências
- Assinaturas
- Botão: **Baixar PDF** / **Reenviar por e-mail**

### 13.6 OS Hub — Fila Unificada

**URL:** `/os-hub`

Visão por status (Kanban ou lista) com filtros por:
- Tipo (C1, C2, P1, P2, IN)
- Técnico
- Imóvel
- Disciplina
- Período

Cada card mostra: tipo (badge colorido), imóvel, descrição, técnico, data agendada, SLA restante.

### 13.7 Plano de Manutenção Geral por Imóvel

**URL:** `/imóveis/:id/plano`

Lista todos os equipamentos do imóvel (`pcm_equipment`) com:
- Tag, tipo, disciplina
- Condição (badge: bom/regular/ruim/crítico)
- Última manutenção
- Próxima manutenção
- Status: ✅ em dia / ⚠️ vence em breve / 🔴 atrasado
- Para equipamentos de AR: link para contrato PMOC

---

## 14. Glossário Técnico

| Termo | Definição |
|-------|----------|
| **PMOC** | Plano de Manutenção, Operação e Controle — documento legal obrigatório para sistemas de AR condicionado em edificações coletivas |
| **ART** | Anotação de Responsabilidade Técnica — documento do CREA que vincula o engenheiro à obra/serviço |
| **PCM** | Plano de Controle de Manutenção — planejamento geral de todas as manutenções do imóvel |
| **BTU/h** | British Thermal Unit por hora — unidade de capacidade de refrigeração (12.000 BTU = 1 TR) |
| **TR** | Tonelada de Refrigeração — unidade de capacidade (1 TR = 12.000 BTU/h) |
| **UFC/m³** | Unidades Formadoras de Colônia por metro cúbico — medida de contaminação microbiológica do ar |
| **Relação I/E** | Relação entre contagem de fungos interior vs. exterior — indicador de qualidade do ar |
| **Split Hi-Wall** | Tipo mais comum de AR condicionado: unidade evaporadora na parede + condensadora externa |
| **Evaporadora** | Parte interna do AR condicionado (onde o ar é resfriado) |
| **Condensadora** | Parte externa do AR condicionado (onde o calor é dissipado) |
| **Serpentina** | Conjunto de tubos por onde passa o refrigerante — componente crítico de limpeza |
| **Dreno** | Canal de escoamento da água condensada na evaporadora — deve ser desobstruído mensalmente |
| **Refrigerante** | Fluido que circula no sistema (R-410A é o mais comum em equipamentos modernos) |
| **R-22** | Refrigerante antigo (HCFC) — proibido em equipamentos novos desde 2015, ainda presente em instalações antigas |
| **Manifold** | Equipamento do técnico para medir pressão do sistema de refrigeração |
| **VRF/VRV** | Volume de Refrigerante Variável — sistema central para múltiplos ambientes |
| **Fancoil** | Unidade terminal de climatização ligada a uma central de água gelada |
| **Delta-T (ΔT)** | Diferença de temperatura entre insuflamento e retorno — indica se o sistema está refrigerando corretamente |
| **CREA** | Conselho Regional de Engenharia e Agronomia |
| **INMETRO** | Instituto Nacional de Metrologia, Qualidade e Tecnologia — acredita laboratórios microbiológicos |
| **ANVISA** | Agência Nacional de Vigilância Sanitária — emitiu a RDC 09/2003 |
| **OS** | Ordem de Serviço |
| **NC** | Não-Conformidade — problema encontrado durante manutenção |
| **Auvo** | Plataforma de gestão de equipes de campo — app usado pelos técnicos da Sinérgica |
| **SLA** | Service Level Agreement — prazo máximo para atendimento conforme tipo de OS |

---

*Documento elaborado por Fabrício Medeiros — Sinérgica Manutenções Patrimoniais*  
*Versão 1.0 — Junho/2026*  
*Para dúvidas técnicas de engenharia: contato@sinergicamanutencoes.com.br*
