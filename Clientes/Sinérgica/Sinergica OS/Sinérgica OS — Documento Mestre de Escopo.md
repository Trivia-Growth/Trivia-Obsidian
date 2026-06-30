---
documento: Escopo Mestre do Projeto
projeto: Sinérgica OS
cliente: Sinérgica Manutenções Patrimoniais
autor: Trívia Studio
versão: 1.0
data: 2026-06-29
status: escopo de referência (vivo)
---

# Sinérgica OS — Documento Mestre de Escopo

> **Propósito deste documento.** Escopar, de ponta a ponta, o sistema operacional da Sinérgica
> Manutenções: as dores do mercado de manutenção predial e climatização, a visão de produto, os
> módulos, suas regras de negócio, a integração com o Auvo e o roadmap. É o documento de
> referência de produto — abaixo dele vivem os blueprints técnicos por módulo (`docs/blueprint/`)
> e as specs SDD (`specs/`). Documentos relacionados:
> [[Sinérgica OS — Visão Geral]] · [[Sinérgica OS — Escopo Contratual (Cláusula 3ª)]] ·
> [[Mapeamento Auvo x PCM como Hub (29-06-2026)]] · [[Sinérgica OS — PCM v2 → OS (Módulos)]]

---

## 1. Sumário Executivo

A Sinérgica é uma empresa de **manutenção predial e de climatização (HVAC)** que atende
condomínios e empresas em Campinas/SP. Como toda empresa do setor que cresce, ela bateu no teto
de uma operação coordenada por WhatsApp, planilhas e um app de campo (Auvo) sem um cérebro central
que conecte comercial, operação, campo, financeiro e cliente.

O **Sinérgica OS** é esse cérebro: um sistema operacional único onde a liderança **opera a empresa
inteira a partir de um só lugar**. Ele não substitui o Auvo — o técnico continua no Auvo, no campo.
Ele **comanda** o Auvo e é realimentado por ele, e ao redor disso constrói tudo que falta: visão
360 por cliente, controle de backlog e SLA, plano preventivo legalmente conforme (PMOC, SPDA),
ciclo financeiro fechado, CRM comercial, agentes de IA no atendimento e portal do cliente.

**A tese central:** numa empresa de manutenção, o ativo mais valioso não é o técnico nem a
ferramenta — é a **memória da operação**. Quem fez o quê, em qual equipamento, quando, por quê, e
quanto custou. Hoje essa memória está fragmentada (cada coisa num lugar). O OS a unifica numa base
única, e é dela que tudo passa a fluir: decisões, faturamento, prestação de contas e inteligência.

---

## 2. As Dores do Mercado (e o que o OS resolve)

Esta seção é o coração do diagnóstico. Foram organizadas por quem sente a dor.

### 2.1. Dores da Liderança / Gestão

| # | Dor | Hoje | Como o OS resolve |
|---|-----|------|-------------------|
| L1 | **"Não tenho visão por cliente."** | Para saber tudo de um condomínio, é preciso cruzar WhatsApp + Auvo + planilha + memória do gestor | **Visão 360 do Cliente** — uma tela com contrato, equipamentos, backlog, histórico de OS, preventivo, relatórios, financeiro e comunicação |
| L2 | **"Não sei se o contrato dá lucro."** | Receita é conhecida; custo real (mão de obra + peças + deslocamento) não | Módulo Financeiro consolida custo real por OS → **rentabilidade por contrato** com alerta de margem negativa |
| L3 | **"Não sei o que está pendente."** | Backlog mora na cabeça das pessoas e em mensagens soltas | **Backlog priorizado (GUT)** por cliente, com indicador de saúde (horas pendentes ÷ horas contratuais) |
| L4 | **"Cumprimos o preventivo?"** | Sem rastreio de % de preventivo realizado vs planejado | **Calendário de manutenção** + indicador de aderência ao plano (crítico para PMOC/conformidade) |
| L5 | **"Onde está minha equipe?"** | Telefonema para o técnico | GPS dos técnicos (via Auvo) no painel do OS, em horário operacional |
| L6 | **"Quanto vou faturar e receber este mês?"** | Estimativa de cabeça | Fluxo de caixa + contas a receber + faturamento automático a partir das OS e contratos |
| L7 | **"Por que perdi aquele cliente?"** | Sem histórico de relacionamento nem sinais de churn | CRM + indicadores de satisfação (NPS) + histórico completo no Cockpit |
| L8 | **"Estou em conformidade legal?"** | Controle manual de laudos, ARTs, vencimentos | Gestão de **conformidade** — PMOC, SPDA, análise de água, AVCB, com alertas de vencimento (ver §9) |

### 2.2. Dores da Operação / Escritório (PCM)

| # | Dor | Como o OS resolve |
|---|-----|-------------------|
| O1 | Chamado chega por WhatsApp e some no histórico do grupo | **Agente Zé** transforma a conversa em OS formal, rastreável, com confirmação |
| O2 | Abrir OS, lançar no Auvo e avisar o técnico é trabalho triplo e manual | OS aberta no PCM **vira tarefa no Auvo automaticamente** (`externalId` idempotente) |
| O3 | Inspeção em campo vira um caderno de fotos sem destino | **Inspeção com IA**: foto + descrição → sugestão de não-conformidade, norma, prioridade → vira backlog |
| O4 | Planejar a semana dos técnicos é Tetris no quadro branco | **Cronograma e Visitas** — agendamento por cliente/turno/técnico com os itens de backlog a executar |
| O5 | Relatório para o síndico é montado à mão toda vez | Relatório **diário e mensal gerados automaticamente** (texto por IA + PDF) e enviados |
| O6 | Cadastro de equipamento sem padrão, sem histórico | **Árvore de ativos** (Cliente → Torre → Área → Equipamento) com histórico por equipamento |

### 2.3. Dores do Técnico de Campo

| # | Dor | Como o OS resolve |
|---|-----|-------------------|
| T1 | Recebe ordem vaga, sem contexto do que já foi feito | OS chega no Auvo com orientação clara + histórico do equipamento puxado do PCM |
| T2 | Dúvida técnica em campo sem quem perguntar | **Agente de IA de apoio ao técnico** (procedimentos, normas, diagnóstico assistido) — *escopo a definir, ver §6.2* |
| T3 | Retrabalho por falta de peça | Estoque e separação de peças por OS antecipam a necessidade |

> **Premissa intocável:** o trabalho de campo (check-in/out, foto, assinatura, checklist) **permanece
> no app Auvo**. O OS não tenta reconstruir o app móvel — ele alimenta o técnico de contexto e
> recebe de volta o que aconteceu.

### 2.4. Dores do Cliente Final (Síndico / Gestor Predial)

| # | Dor | Como o OS resolve |
|---|-----|-------------------|
| C1 | Não sabe o status do chamado que abriu | **Portal do Cliente** + respostas do Zé com nº do chamado |
| C2 | Cobra "prova" do serviço para a assembleia | Relatórios mensais, fotos de antes/depois, laudos — disponíveis no portal |
| C3 | Não tem onde ver o que já foi feito no prédio | Histórico completo de OS e preventivo no portal |
| C4 | Atrito sobre o que está em dia financeiramente | Situação financeira (faturas, vencimentos) no portal |

### 2.5. Dores Comerciais e de Crescimento

| # | Dor | Como o OS resolve |
|---|-----|-------------------|
| G1 | Proposta demora e sai sem padrão de preço | **Motor de precificação** (volante/residente) + geração assistida por IA a partir do levantamento |
| G2 | Lead esfria porque ninguém respondeu a tempo | **Agentes de IA comerciais** (SDR/closer) qualificam e conduzem |
| G3 | Marketing reativo e sem constância | Módulo Marketing produz conteúdo multicanal de ponta a ponta |
| G4 | Verba de anúncio gasta no escuro | Módulo Growth lê Meta/Google Ads e orienta o investimento |
| G5 | Não sabe de onde vêm os bons clientes | Atribuição de leads (canal → proposta → contrato) |

---

## 3. Visão de Produto

### 3.1. O que o OS é

> Um **sistema nervoso central** da empresa de manutenção. A liderança e o escritório operam **tudo**
> a partir dele. O Auvo é o **braço de campo**. Os clientes têm uma **janela** (portal). Os agentes de
> IA são **funcionários digitais** que atuam no atendimento, no comercial e no apoio técnico.

### 3.2. O que o OS **não** é
- Não é um app de campo (isso é o Auvo).
- Não é um ERP fiscal completo (emissão de NF-e pode ser integração, não reconstrução).
- Não é um sistema genérico — é moldado às dores de manutenção predial e climatização.

### 3.3. Princípios de produto
1. **Uma porta, uma verdade.** Todo dado de gestão nasce e vive no OS. Todo dado de campo nasce no Auvo. Sem duplicidade, sem "qual está certo?".
2. **Visão centrada no cliente.** A unidade mental do sistema é o **condomínio/contrato**, não a OS isolada.
3. **Conformidade como cidadã de primeira classe.** PMOC, SPDA e laudos não são "relatórios" — são obrigações com prazo, e o sistema cuida do prazo.
4. **IA onde tira trabalho repetitivo.** Atendimento, triagem, geração de texto, análise de foto, sugestão de preço — sempre com humano no controle da decisão.
5. **Prestação de contas automática.** O cliente recebe prova do serviço sem o escritório montar nada à mão.

---

## 4. Arquitetura de Alto Nível

```
┌────────────────────────────────────────────────────────────────┐
│                         SINÉRGICA OS                            │
│  (React SPA · Supabase · onde a liderança e o escritório operam)│
│                                                                │
│  Comercial · Atendimento(IA) · PCM/Operação · Estoque ·        │
│  Financeiro · Marketing · Growth · Gestão(Cockpit) · Dados     │
└───────────────┬───────────────────────────────┬───────────────┘
                │ escreve (cria OS, cliente,    │ janela (read-only
                │ equipamento, preventivo)      │ + abrir chamado)
                ▼                               ▼
        ┌──────────────┐               ┌─────────────────┐
        │     AUVO     │               │ ÁREA DO CLIENTE │
        │ (app campo)  │               │   (síndico)     │
        └──────┬───────┘               └─────────────────┘
               │ devolve (status, foto, checklist,
               │ peça, GPS, assinatura) via webhook + polling
               ▼
        ┌──────────────┐
        │ SINÉRGICA OS │  ← realimentado
        └──────────────┘

Canais de IA:  WhatsApp (Evolution API) ── Agentes ── OpenRouter (Gemini/Claude)
```

**Regra de ouro PCM × Auvo:** PCM é origin of truth das **decisões** (abrir, priorizar, atribuir,
planejar); Auvo é origin of truth da **execução** (GPS, foto, checklist, assinatura). Detalhe técnico
em [[Mapeamento Auvo x PCM como Hub (29-06-2026)]].

---

## 5. Mapa de Módulos

| # | Módulo | Papel no negócio | Maturidade hoje |
|---|--------|------------------|-----------------|
| 1 | **PCM / Operação** | Espinha dorsal — o ciclo de vida da manutenção | Evolução de software existente |
| 2 | **Atendimento (Agentes de IA)** | Porta de entrada e relacionamento automatizado | Parcial (Zé existe) |
| 3 | **Comercial (CRM)** | Funil: prospect → proposta → contrato | Parcial (propostas existem) |
| 4 | **Operação & Estoque** | Peças, custo de material, suprimento | Novo |
| 5 | **Financeiro** | Caixa, faturamento, rentabilidade | Novo |
| 6 | **Marketing** | Geração de demanda (conteúdo) | Novo |
| 7 | **Growth** | Inteligência de anúncios | Novo |
| 8 | **Gestão (Cockpit)** | Visão executiva e indicadores | Novo |
| 9 | **Área do Cliente** | Transparência e prestação de contas | Novo |
| 10 | **Dados (Base Única)** | Fundação — fonte única que alimenta a IA | Arquitetural |

---

## 6. Detalhamento por Módulo

> Cada módulo abaixo descreve: **dor que resolve · funcionalidades · entidades · regras de negócio ·
> integrações · indicadores**. O detalhe técnico (schema, RLS, edge functions) vive nos blueprints.

### 6.1. PCM / Operação — *a espinha dorsal*

**Por que é o coração.** É a evolução do PCM atual da Sinérgica — que funciona, mas é "pobre": não
tem visão centralizada por cliente e não fecha as dores de operação. Este módulo é o que justifica o
projeto inteiro do ponto de vista operacional.

**Funcionalidades:**

- **Visão 360 do Cliente (feature-âncora).** Uma tela por condomínio reunindo: dados do contrato,
  árvore de equipamentos, backlog priorizado, histórico de OS, calendário preventivo, relatórios,
  situação financeira e linha do tempo de comunicação. *Esta é a resposta direta à dor L1.*
- **Cadastro de Clientes/Condomínios** — dados de gestão, contatos, grupo de WhatsApp, contrato.
- **Árvore de Ativos** — `Cliente → Torre/Bloco → Área → Sistema → Equipamento`, com ficha e
  histórico por equipamento (qual a vida daquela bomba, daquele chiller).
- **Backlog & Priorização GUT** — score Gravidade × Urgência × Tendência (1–5 cada, máx 125),
  faixas (crítica ≥100, alta ≥50, média ≥20, baixa <20), indicador de saúde do contrato
  (horas pendentes ÷ horas/semana → verde/amarelo/vermelho). Sugestão de repriorização por IA.
- **Ordens de Serviço (Kanban)** — `solicitação → planejamento → em execução → finalizado →
  faturado/cancelado`. Ao entrar em planejamento, gera tarefa no Auvo. Categorias: corretiva,
  preventiva, inspeção, levantamento, emergencial.
- **Inspeções com IA** — técnico fotografa e descreve; LLM sugere não-conformidade, norma (ex.
  NBR 5674), prioridade GUT e esforço; técnico confirma; itens não-conformes viram backlog.
- **Plano Preventivo & PMOC** — equipamento + periodicidade + mês/dia de início → gera OS
  recorrentes. **Trata PMOC como tipo especial de preventivo legalmente obrigatório** (ver §9).
- **Calendário de Manutenção** — duas visões (compacta = próxima data; calendário = grid mensal/anual
  com status colorido). Detalhe em [[PCM — Calendário de Manutenção Preventiva (Requisito Visual)]].
- **Cronograma & Visitas** — grade semanal; agendamento por cliente/turno/técnico com itens de
  backlog; planejamento enviado por WhatsApp; registro de resultado por item.
- **Relatório Diário** — um por (técnico, cliente, dia); texto por IA; enviado ao grupo do condomínio.
- **Relatório Mensal** — PDF do período (OS, preventivas cumpridas, SLA, NPS, assinatura); batch agendado.
- **Laudos Técnicos** — SPDA (NBR 5419:2026, wizard de 8 etapas, cálculo de risco, assinatura com
  hash) e, futuramente, outros laudos de conformidade.

**Entidades principais:** Cliente, Contrato, Equipamento/Ativo, Backlog Item, Visita, Ordem de
Serviço, Inspeção, Plano Preventivo (e PMOC), Relatório Diário, Relatório Mensal, Laudo.

**Regras de negócio-chave:**
- Idempotência PCM→Auvo via `externalId = os.id` (reenviar nunca duplica).
- Inspeção não-conforme → backlog com `origem = inspecao`.
- OS preventiva atrasada (data passada + status ≠ finalizado) = pendência no calendário.

**Indicadores:** SLA (abertura→despacho→execução→fechamento), % preventivo cumprido, backlog em
semanas, taxa de não-conformidade, aderência ao PMOC.

---

### 6.2. Atendimento — *Agentes de IA*

**Dor:** o relacionamento (entrada de chamado, qualificação de lead, condução de venda, pós-venda)
depende de gente disponível e se perde em conversas de WhatsApp.

O contrato (cláusula 3.1.2) prevê **múltiplos agentes de IA**, não só o Zé. Proposta de papéis:

| Agente | Papel | Canal | Status |
|--------|-------|-------|--------|
| **Zé (Operacional)** | Abre/atualiza chamados de manutenção dos clientes ativos | WhatsApp (grupos/DM) | Existe — em evolução |
| **SDR (Qualificação)** | Recebe e qualifica leads no topo do funil | WhatsApp / web / social — *a definir* | A escopar |
| **Closer (Vendas)** | Conduz a proposta, tira dúvidas, acelera o fechamento | WhatsApp / e-mail — *a definir* | A escopar |
| **CS (Pós-venda)** | Acompanha satisfação, antecipa churn, coleta NPS | WhatsApp / portal — *a definir* | A escopar |
| **Apoio ao Técnico** | Responde dúvida técnica, ajuda diagnóstico por foto, procedimento/norma | *Canal a definir (WhatsApp do técnico? dentro do OS?)* | A escopar (dor T2 e cláusula 3.1.5) |

**Zé — regras já desenhadas:**
- Detecção determinística de menção **antes** do LLM (regex `\bz[eé]\b` ou `@bot`).
- Modos por condomínio: `off` / `monitor` (só se chamado) / `active` (responde a qualquer
  referência a serviço).
- Só abre OS após confirmar **problema + local + urgência**; idempotente por chat.
- Fila com agrupamento de rajada (3–8s); fallback por cron; latência alvo <10s.
- Tools: `criar_chamado`, `atualizar_chamado`, `consultar_chamados`, `consultar_backlog`.

**Decisões em aberto (ver §11):** canais e fronteiras dos agentes SDR/Closer/CS; se são um schema
próprio ou extensão do Zé; o que exatamente o agente de apoio ao técnico faz.

**Entidades:** mensagem (wa_messages), fila (wa_queue), config de agente, vínculo grupo↔cliente,
admins de DM.

**Indicadores:** latência de resposta, taxa de abertura completa de chamado, taxa de qualificação de
lead (SDR), conversão assistida (closer), NPS coletado (CS).

---

### 6.3. Comercial (CRM)

**Dor:** o funil de vendas não é gerido; proposta sai lenta e sem padrão de preço; não se sabe a
origem dos bons clientes.

**Funcionalidades:**
- **Funil/Pipeline** — prospect → lead qualificado → proposta → negociação → contrato (ganho/perdido),
  com motivo de perda.
- **Propostas (4 tipos)** — convergem em uma proposta salva e exportável (DOCX):
  - **Levantamento de campo** — chat com IA + fotos + notas + disciplinas → proposta gerada (Gemini).
  - **Volante** — cálculo dinâmico (técnicos × frequência × nível × margem).
  - **Residente** — cálculo (nível + cobertura + margem) para posto fixo no local.
  - **Simples** — formulário manual (legado).
- **Motor de Precificação:** `Custo Total (MO + Benefícios + Material + Veículo + Suporte) × (1+Margem)
  ÷ (1 − Alíquota Anexo IV Simples)`; piso = custo com gross-up de imposto; desconto máx = 1 − Piso/Preço.
- **Contratos** — geração a partir da proposta aceita; tipos (residente, volante, avulso); recorrência,
  reajuste, vigência, escopo (sistemas cobertos, periodicidades).
- **Fluxo único** (exigência contratual 3.1.1) — do lead ao contrato sem trocar de ferramenta.

**Integração:** Comercial → Financeiro (proposta aceita/contrato → faturamento recorrente);
Comercial → PCM (contrato ativo → cria cliente/condomínio e plano preventivo).

**Indicadores:** taxa de conversão por etapa, ciclo de venda, ticket médio, win/loss por motivo,
desconto médio vs piso, origem do lead (com Growth).

---

### 6.4. Operação & Estoque

**Dor:** retrabalho por falta de peça; custo de material por OS desconhecido; sem controle de
catálogo nem de saldo.

**Funcionalidades:**
- **Catálogo de materiais/peças** (com custo, unidade, fornecedor).
- **Estoque** — saldo, entradas/saídas, mínimo, ponto de reposição; opcional: estoque por técnico/van.
- **Consumo por OS** — peças usadas em campo (vindas do Auvo) baixam estoque e compõem o custo da OS.
- **Separação/kit por visita** — peças previstas para a visita planejada.
- **Compras** (escopo a confirmar) — sugestão de reposição quando abaixo do mínimo.

**Integração:** Auvo devolve peças consumidas por tarefa; PCM associa à OS; Financeiro usa para custo.

**Indicadores:** giro de estoque, custo de material por OS, ruptura (OS parada por falta de peça).

---

### 6.5. Financeiro

**Dor (L2, L6):** não se sabe se o contrato é lucrativo; faturamento manual; sem fluxo de caixa.

> **Atenção de escopo:** o contrato (3.1.6) pede **contas a pagar e a receber, faturamento, fluxo de
> caixa e conciliação**. O blueprint atual cobre só o lado a receber + rentabilidade. Os itens novos
> (pagar, caixa, conciliação) precisam de definição de escopo mínimo para o go-live — ver §11.

**Funcionalidades:**
- **Contas a Receber** — fatura por contrato/período; vencimento por cliente; baixa no pagamento;
  inadimplência com alertas (D+3/D+7/D+15); bloqueio opcional de novas OS em atraso.
- **Faturamento** — gerado a partir de OS finalizadas e/ou contrato recorrente; integração com NF-e
  (a definir — pode ser integração, não reconstrução).
- **Contas a Pagar** — fornecedores, despesas (combustível, benefícios, peças, terceiros).
- **Fluxo de Caixa** — entradas e saídas, previsto vs realizado, posição de caixa.
- **Conciliação** — extrato bancário × lançamentos (mínimo: importação CSV/OFX, baixa manual).
- **Custo & Rentabilidade** — custo real por OS (MO + material + deslocamento) consolidado por
  contrato; margem; alerta de margem negativa por 2 meses consecutivos.

**Integração:** PCM (OS finalizada → custo), Estoque (material), Comercial (contrato → receita),
Auvo (peças/horas), Gestão (alimenta o caixa do Cockpit).

**Indicadores:** margem por contrato, inadimplência, ticket médio de corretiva, DSO (prazo médio de
recebimento), posição de caixa projetada.

---

### 6.6. Marketing (Conteúdo Multicanal)

**Dor:** marketing reativo, sem constância; produzir post é trabalhoso.

**Funcionalidades:**
- **Produção de conteúdo de ponta a ponta** — pauta/redação (IA) → geração de imagem → revisão/aprovação
  → publicação.
- **Calendário editorial** com fluxo de aprovação.
- **Multicanal** — Instagram, Facebook, LinkedIn, etc. (canais a confirmar).
- **Biblioteca de marca** — tom de voz, identidade, templates.

**Integração:** Growth (resultado dos posts/anúncios), Comercial (lead gerado por conteúdo).

**Indicadores:** cadência de publicação, alcance/engajamento, leads atribuídos a conteúdo.

---

### 6.7. Growth (Análise de Anúncios)

**Dor (G4):** verba de Meta/Google Ads gasta sem leitura clara de retorno.

**Funcionalidades:**
- **Conexão Meta Ads + Google Ads** (APIs).
- **Leitura e análise** de campanhas (gasto, CPL, CTR, conversão).
- **Atribuição de leads** — canal/campanha → proposta → contrato (amarra com o Comercial).
- **Orientação de investimento** — onde colocar/retirar verba.

**Indicadores:** CPL por canal, CAC, ROAS, % de receita atribuível a cada canal.

---

### 6.8. Gestão (Cockpit / Painel de Indicadores)

**Dor:** a liderança não tem visão executiva consolidada.

**Funcionalidades:** painel gerencial com **operação** (SLA, OS abertas, produtividade do técnico,
aderência ao preventivo), **margem** (rentabilidade por contrato), **atrasos** (SLA estourado,
inadimplência), **funil** (comercial), **caixa** (financeiro). Visões por período, por cliente, por
técnico, por sistema. Tecnicamente são **views** sobre os schemas dos outros módulos (não duplica dado).

**Indicadores-chave do negócio:** receita recorrente (MRR), churn, margem média, backlog total em
semanas, % preventivo cumprido, NPS, posição de caixa.

---

### 6.9. Área do Cliente (Portal do Síndico)

**Dor (C1–C4):** o cliente não enxerga o serviço e cobra prova.

**Funcionalidades (read-only + abrir chamado):**
- **Painel do condomínio** — OS abertas, backlog visível, preventivo do mês.
- **Histórico de OS** — com filtros; fotos antes/depois.
- **Documentos** — relatórios mensais, laudos (SPDA/PMOC), certificados — download (signed URL).
- **Situação financeira** — faturas, vencimentos, comprovantes (exige views de `financeiro` para o
  papel `cliente-sindico`).
- **Abrir chamado** — formulário web (alternativa ao Zé).

**Regras de acesso:** RLS restrita ao próprio condomínio; sem dados internos (custo, rentabilidade,
backlog de priorização). Mobile-first.

---

### 6.10. Dados (Base Única)

**O que é:** a fundação. Todos os módulos gravam na mesma base (Supabase, schemas por domínio), o que
torna a operação **uma fonte única de verdade** — e é dessa base que os Agentes de IA tiram contexto.

> **Decisão de produto (§11):** o contrato lista "Dados" como **módulo**. Definir se é só o princípio
> arquitetural (sem tela) ou se há entregável visível — ex.: painel de **qualidade de dados**
> (duplicatas, campos faltantes, última sincronização com o Auvo) e **configuração de contexto da IA**.

**Governança:** RLS FORCE em toda tabela; colunas de auditoria; `audit.*` append-only; LGPD
(consentimento, export/delete); espelhos de cache (Auvo) só-leitura no app.

---

## 7. Integração com o Auvo (a fronteira)

Resumo (detalhe completo em [[Mapeamento Auvo x PCM como Hub (29-06-2026)]]):

- **PCM → Auvo (escrita):** cria/atualiza cliente, equipamento, tarefa, preventivo (Service Order),
  orçamento, NF, conta a receber. Cobertura total da API.
- **Auvo → PCM (webhook):** só 6 entidades (User, Task, Customer, Equipment, Invoice, Ticket).
  Webhook é "magro" → ao receber, o PCM faz `GET` para puxar o detalhe (foto, checklist, peça).
- **Auvo → PCM (polling):** o que não tem webhook — preventivo recorrente, checklist, GPS, orçamento,
  contas a receber, despesas, NPS.
- **Fronteira fixa:** o campo (check-in/out, foto, assinatura, checklist) é **sempre** no app Auvo.
- **Cuidados críticos:** segurança do webhook (7 camadas — token na URL, reconsulta GET, idempotência,
  só-enfileirar, rate-limit, não-logar-segredo, rotação); eco/loop (idempotência por `externalId`);
  token expira 30 min; rate limit 400 req/min/IP compartilhado.

---

## 8. Papéis e Permissões

| Papel | Acesso |
|-------|--------|
| `admin` | Total — configura agentes de IA, integrações, usuários, parâmetros |
| `escritorio` | Operacional — clientes, chamados, backlog, visitas, propostas, relatórios, financeiro |
| `comercial` | Funil, propostas, contratos (pode ser refinamento de `escritorio`) |
| `tecnico` | Restrito — leitura geral + escrita no próprio (OS, inspeções) + agente de apoio |
| `cliente-sindico` | Portal + WhatsApp (Zé) — só dados do próprio condomínio |

Princípio: **menor privilégio**; dado financeiro sensível nunca exposto ao síndico além da própria
situação; RLS por condomínio.

---

## 9. Conformidade Legal & Laudos (diferencial de domínio)

Empresa de manutenção predial/HVAC vive de cumprir obrigações com **prazo legal**. Tratar isso como
módulo de primeira classe é um diferencial competitivo. *Os marcos abaixo devem ser validados com a
engenharia da Sinérgica antes de virar regra rígida no sistema — periodicidades variam por município
e por norma vigente.*

| Obrigação | O que é | Por que importa no OS |
|-----------|---------|----------------------|
| **PMOC** | Plano de Manutenção, Operação e Controle de climatização (Lei Fed. 13.589/2018) | Obrigatório para sistemas de AC de uso coletivo/acima de porte. O preventivo de AC **é** o PMOC — precisa de plano documentado, responsável técnico (ART) e registro das atividades |
| **QAI** | Qualidade do Ar Interior (base ANVISA RE 9/2003) | Limpeza de dutos/filtros, análise — entra como rotina preventiva e laudo |
| **SPDA** | Sistema de Proteção contra Descargas Atmosféricas (NBR 5419) | Inspeção periódica + laudo; já há wizard no PCM |
| **Análise de água / Legionella** | Limpeza de reservatório (geralmente semestral, varia por município) e torres de resfriamento | Rotina preventiva + laudo de potabilidade |
| **AVCB / sistema de incêndio** | Auto de Vistoria do Corpo de Bombeiros, extintores, hidrantes | Controle de vencimento + alerta |
| **NR-13** | Vasos de pressão e caldeiras | Inspeção por profissional habilitado, registro |
| **ART / TRT** | Anotação de Responsabilidade Técnica (CREA) | Vinculada a laudos e contratos |

**Funcionalidade transversal:** um **painel de conformidade** por cliente, com o que está em dia, o
que vence e quando — alimentando alertas e o Cockpit. Responde diretamente à dor L8.

---

## 10. Roadmap de Construção (fases)

> Alinhado ao cronograma contratual (Mês 1 diagnóstico/casca ✅ · Mês 2 construção · Mês 3 ativação) e
> ao roadmap técnico do hub Auvo. Granularidade fina vive em `docs/epics/ROADMAP.md`.

### Fase 1 — Espinha dorsal operacional (loop mínimo)
PCM (Visão 360, clientes, ativos, backlog GUT, OS Kanban) + integração Auvo fase 1 (criar tarefa,
sync cliente/equipamento, webhook seguro) + Agente Zé (abertura de chamado). **Entrega:** abrir OS no
OS → vira tarefa no Auvo → técnico executa → volta sozinho.

### Fase 2 — Fechar o operacional + comercial
Visitas/cronograma, inspeção com IA, calendário preventivo/PMOC, relatórios diário/mensal; CRM
(funil + propostas migradas); Estoque (consumo por OS); polling Auvo (preventivo, GPS, checklist).

### Fase 3 — Ciclo financeiro
Custo por OS, rentabilidade, contas a receber, faturamento; depois contas a pagar, fluxo de caixa,
conciliação. Orçamento/NF/satisfação via Auvo.

### Fase 4 — Crescimento e cliente
Marketing (conteúdo multicanal), Growth (Meta/Google Ads), Área do Cliente (portal), Cockpit
executivo; agentes comerciais (SDR/closer/CS) e agente de apoio ao técnico. Go-live.

---

## 11. Decisões em Aberto (precisam de Fabrício / produto)

> Bloqueadores de produto, não técnicos. Recomenda-se alinhar antes de abrir as specs dos módulos
> afetados. Origem detalhada em [[Sinérgica OS — Escopo Contratual (Cláusula 3ª)]].

| # | Tema | Pergunta |
|---|------|---------|
| D1 | **Agentes comerciais** | Quais papéis (SDR/closer/CS) a Sinérgica quer? Em quais canais? Schema próprio ou extensão do Zé? |
| D2 | **Agente de apoio ao técnico** | O que faz (dúvida técnica, diagnóstico por foto, checklist)? Por qual canal? |
| D3 | **Financeiro completo** | Escopo mínimo de contas a pagar, fluxo de caixa e conciliação para o go-live? Integra com banco ou só CSV/OFX? |
| D4 | **Módulo Dados** | É só arquitetura (sem tela) ou há painel de qualidade de dados / config de IA? |
| D5 | **Portal — financeiro** | Quais dados financeiros o síndico vê (faturas, vencimentos, comprovantes)? |
| D6 | **Portal — documentos** | Quais documentos (só laudos? contratos? certificados de conformidade)? |
| D7 | **Conformidade legal** | Quais obrigações a Sinérgica controla hoje? Quais periodicidades valem (validar §9)? |
| D8 | **NF-e** | Emissão de nota é integração com sistema fiscal existente ou reconstrução no OS? |
| D9 | **Marketing — canais** | Quais redes sociais e qual nível de automação de publicação? |
| D10 | **Calendário preventivo** | Conteúdo da célula e códigos — definir quando soubermos o que volta do Auvo (já decidido: MVP só cor/ícone) |

---

## 12. Glossário rápido

- **OS** — Ordem de Serviço.
- **PCM** — Planejamento e Controle de Manutenção (módulo espinha dorsal).
- **PMOC** — Plano de Manutenção, Operação e Controle (climatização, obrigatório).
- **SPDA** — Sistema de Proteção contra Descargas Atmosféricas (para-raios).
- **GUT** — Gravidade, Urgência, Tendência (matriz de priorização).
- **Posto residente** — técnico fixo alocado no cliente. **Volante** — técnico em rota de visitas.
- **Backlog** — itens de manutenção pendentes, priorizados.
- **Origin of truth** — sistema que é dono autoritativo de um dado.
- **Zé** — agente de IA de atendimento no WhatsApp.
