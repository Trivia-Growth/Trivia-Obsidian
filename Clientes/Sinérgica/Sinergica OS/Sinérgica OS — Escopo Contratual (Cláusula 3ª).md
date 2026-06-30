# Sinérgica OS — Escopo Contratual (Cláusula 3ª)

> Transcrição e mapeamento do escopo vendido × o que está desenhado hoje no OS.
> Use como referência antes de abrir spec — tudo aqui é contrato assinado.
> Gaps marcados com ⚠️ precisam de decisão de produto antes de entrar no Mês 2.

---

## Módulos contratados (Cláusula 3.1)

### 3.1.1 — Comercial (CRM)
> "Gestão completa do funil de vendas, propostas e contratos em fluxo único."

**Mapeamento OS:** bounded context `comercial` · schema `comercial` · feature `features/comercial`

| O que entra | Status no OS |
|-------------|-------------|
| Funil de vendas (prospects → leads → proposta → contrato) | ✅ Documentado (blueprint 03) |
| Propostas — 4 tipos (levantamento, volante, residente, simples) | ✅ Migrado do v2 |
| Contratos mensais (gerados a partir de proposta aceita) | ✅ Documentado |
| **"fluxo único"** (sem sair do módulo para fechar um contrato) | ⚠️ Princípio de UX a garantir nas specs — não está explicitado como requisito |

---

### 3.1.2 — Atendimento com Agentes de IA ⚠️ ESCOPO AMPLIADO
> "Agentes de IA atuando no atendimento (por exemplo, qualificação/SDR, condução de vendas/closer e pós-venda/CS, ou os papéis definidos pela CONTRATANTE)."

**Mapeamento OS:** bounded context `atendimento` · schema `atendimento` · feature `features/atendimento`

**O que está documentado hoje:** só o **Agente Zé** — chatbot WhatsApp para abertura de chamados de manutenção de síndicos/zeladores (clientes existentes).

**O que o contrato implica além disso:**

| Agente | Papel | Canal provável | Status no OS |
|--------|-------|----------------|-------------|
| **Zé (operacional)** | Abertura de chamados via WhatsApp | WhatsApp grupos/DM | ✅ Documentado e em spec |
| **SDR / Qualificação** | Qualifica leads no topo do funil | WhatsApp, formulário web, Instagram DM? | ❌ Não documentado |
| **Closer / Vendas** | Conduz e acelera o fechamento de proposta | WhatsApp, email? | ❌ Não documentado |
| **CS / Pós-venda** | Acompanhamento de satisfação pós-contrato | WhatsApp, portal? | ❌ Não documentado |

> **Decisão de produto necessária:** Os agentes SDR/closer/CS são distintos do Zé (outro schema? outras tools? outro modelo?) ou são extensões do mesmo agente com modos diferentes? A Sinérgica usa WhatsApp para prospecção comercial ou outros canais? Quais "papéis definidos pela CONTRATANTE"?

---

### 3.1.3 — Marketing (Conteúdo Multicanal)
> "Produção de conteúdo para redes sociais de ponta a ponta, da redação à geração de imagem e às publicações."

**Mapeamento OS:** bounded context `marketing` · schema `marketing` · feature `features/marketing`

| O que entra | Status no OS |
|-------------|-------------|
| Redação de conteúdo (texto posts) | ✅ Documentado (blueprint 06) |
| Geração de imagem (integração com modelo de imagem) | ✅ Referenciado no blueprint |
| Publicação automatizada nas redes sociais | ✅ Referenciado no blueprint |
| Calendário editorial + aprovação | ✅ Documentado |

---

### 3.1.4 — Growth (Análise de Anúncios)
> "Leitura e análise de campanhas de Meta Ads e Google Ads para orientação de investimento."

**Mapeamento OS:** bounded context `growth` · schema `growth` · feature `features/growth`

| O que entra | Status no OS |
|-------------|-------------|
| Conexão Meta Ads API | ✅ Documentado (blueprint 07) |
| Conexão Google Ads API | ✅ Documentado |
| Análise de atribuição de leads | ✅ Documentado |
| Dashboard de orientação de investimento (qual canal performou) | ✅ Documentado |

---

### 3.1.5 — Operação Técnica e Estoque ⚠️ AGENTE IA TÉCNICO NÃO DOCUMENTADO
> "Ordens de serviço, agenda dos técnicos, histórico por cliente e controle de estoque de peças, com o apoio de um agente de IA aos técnicos."

**Mapeamento OS:** bounded contexts `pcm` (OS, agenda, histórico) + `estoque` (peças)

| O que entra | Status no OS |
|-------------|-------------|
| Ordens de Serviço (kanban, ciclo completo) | ✅ Documentado no blueprint PCM |
| Agenda dos técnicos (visitas, cronograma) | ✅ Documentado no blueprint PCM |
| Histórico por cliente | ✅ Documentado (parte do módulo PCM) |
| Controle de estoque de peças | ✅ Documentado (blueprint 05 — Operação & Estoque) |
| **"Agente de IA de apoio aos técnicos"** | ❌ **Não documentado** |

> **Decisão de produto necessária:** O agente de IA para técnicos — o que ele faz? Opções prováveis: (a) responde dúvidas técnicas (manual de equipamento, procedimento NBR); (b) auxilia no preenchimento do checklist / OS em campo; (c) análise de foto de equipamento com sugestão de diagnóstico. Via qual canal (app Auvo? whatsapp do técnico? portal PCM)?

---

### 3.1.6 — Financeiro ⚠️ ESCOPO PARCIAL
> "Contas a pagar e a receber, faturamento, fluxo de caixa e conciliação, interligado às propostas e contratos do Módulo Comercial."

**Mapeamento OS:** bounded context `financeiro` · schema `financeiro`

| O que entra | Status no OS |
|-------------|-------------|
| **Contas a receber** | ✅ Documentado (blueprint 04) |
| **Faturamento** (NF gerada a partir de OS finalizada) | ✅ Documentado |
| Rentabilidade por contrato (margem, custo real) | ✅ Documentado |
| Inadimplência + alertas | ✅ Documentado |
| Interligação Comercial → Financeiro (proposta aceita → fatura) | ✅ Documentado |
| **Contas a pagar** (fornecedores, despesas) | ❌ **Não documentado** |
| **Fluxo de caixa** (entradas e saídas projetadas e realizadas) | ❌ **Não documentado** |
| **Conciliação** (banco × sistema) | ❌ **Não documentado** |

> **Decisão de produto necessária:** Contas a pagar e conciliação são funcionalidades mais complexas. Qual o escopo mínimo aceitável para o go-live do Mês 3? (ex.: só lançamento manual de CP + extrato bancário importado por CSV, sem integração com banco).

---

### 3.1.7 — Dados (Base Única) ⚠️ NÃO MAPEADO COMO CONTEXTO
> "Centralização dos dados da operação em fonte única, base de funcionamento dos Agentes de IA."

**Mapeamento OS:** **não existe como bounded context separado hoje**

O OS usa Supabase como banco único (schemas por domínio), o que tecnicamente satisfaz "fonte única". Porém, o contrato o lista como **módulo** — sugerindo alguma interface de usuário ou entregável visível.

Possíveis interpretações:

| Interpretação | O que seria |
|--------------|-------------|
| **Arquitetural** | O fato de todos os dados estarem no mesmo Supabase e alimentarem os Agentes (sem painel próprio) |
| **Painel de dados** | Uma view de administrador mostrando saúde/qualidade dos dados (duplicatas, dados faltantes, última sincronização com Auvo) |
| **Configuração de IA** | Interface para configurar fontes de contexto dos Agentes (quais dados eles acessam) |
| **Exportação / BI** | Exportação estruturada dos dados para ferramentas de BI externas |

> **Decisão de produto necessária:** O que a Sinérgica espera VER neste módulo? É arquitetura (sem tela) ou um painel real? Definir antes de abrir spec.

---

### 3.1.8 — Gestão (Painel de Indicadores)
> "Painel gerencial com operação, margem, atrasos, funil e caixa."

**Mapeamento OS:** bounded context `gestao` (views sobre outros schemas) · feature `features/gestao`

| Indicador | Status no OS |
|-----------|-------------|
| **Operação** (SLA, OS abertas, produtividade técnico) | ✅ Documentado (blueprint 08) |
| **Margem** (rentabilidade por contrato) | ✅ Via views `financeiro` |
| **Atrasos** (OS em SLA, inadimplência) | ✅ Via views `pcm` + `financeiro` |
| **Funil** (prospects → contratos) | ✅ Via views `comercial` |
| **Caixa** (posição de caixa atual) | ⚠️ Depende do Financeiro (fluxo de caixa — item 3.1.6) |

---

### 3.1.9 — Área do Cliente ⚠️ ESCOPO PARCIAL
> "Portal de acesso para os clientes finais da CONTRATANTE acompanharem suas ordens de serviço, status de atendimentos, histórico, documentos e situação financeira."

**Mapeamento OS:** bounded context `area-cliente` · feature `features/area-cliente`

| O que entra | Status no OS |
|-------------|-------------|
| Ordens de serviço (status, filtros) | ✅ Documentado (blueprint 09) |
| Status de atendimentos | ✅ Documentado |
| Histórico | ✅ Documentado |
| Relatórios em PDF (download) | ✅ Documentado |
| Abrir chamado (formulário web alternativo ao Zé) | ✅ Documentado |
| **"Documentos"** (laudos SPDA, contratos, certificados) | ⚠️ Laudos estão no PCM mas não expostos no portal — falta mapear quais documentos e com que acesso |
| **"Situação financeira"** (faturas, o que o síndico deve à Sinérgica) | ❌ **Não documentado** |

> **Decisão de produto necessária:** "Situação financeira" no portal — o síndico vê suas faturas, vencimentos e comprovantes? Se sim, o schema `financeiro` precisa de views RLS para `cliente-sindico`.

---

## Resumo dos Gaps

| # | Gap | Impacto | Decisão necessária |
|---|-----|---------|--------------------|
| G1 | Agentes SDR/closer/CS (módulo 3.1.2) | Alto — novo bounded context ou extensão do Atendimento | Quais canais? Quais papéis definidos pela Sinérgica? |
| G2 | Agente IA para técnicos (módulo 3.1.5) | Médio — nova feature no PCM ou Atendimento | O que faz? Via qual canal? |
| G3 | Contas a pagar + fluxo de caixa + conciliação (módulo 3.1.6) | Alto — dobra o escopo do Financeiro | Escopo mínimo para go-live? |
| G4 | Dados (Base Única) como módulo (3.1.7) | Médio — pode ser só arquitetura | É tela ou princípio arquitetural? |
| G5 | Situação financeira no portal do cliente (3.1.9) | Médio | Views de `financeiro` para síndico |
| G6 | Documentos no portal (3.1.9) | Baixo | Quais documentos? Só laudos? |
| G7 | "Fluxo único" Comercial (3.1.1) | Baixo | Requisito de UX a documentar em spec |

---

## Próximos Passos Sugeridos

1. **Reunião de alinhamento com Fabrício** (Sinérgica) para fechar G1, G2, G3 e G4 — são decisões de produto, não técnicas.
2. Após alinhamento: atualizar blueprints dos módulos afetados (`atendimento`, `financeiro`, `area-cliente`) e criar ADR se houver decisão arquitetural (ex.: novo bounded context para os agentes comerciais).
3. Abrir stories no ROADMAP para os gaps confirmados.
