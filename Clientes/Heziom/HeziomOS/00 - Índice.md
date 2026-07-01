# HeziomOS — Índice

> ⚠️ **ATUALIZADO 2026-07-01 — leia primeiro.** Este índice foi escrito na fase de planejamento (mai/2026) e descreve módulos por "Fase 2.x" como se fossem futuros. **Muitos já estão em produção.** Para o estado real, use **[[Estado Atual — Espelho dos Épicos]]** (espelho de `docs/epics/README.md` do repo). O plano da limpeza de hoje está em [[_Auditoria e Plano de Limpeza do Vault — 2026-07-01]]. Notas de planejamento legadas (Backlog, Roadmap, Sprint Atual, CEO Dashboard, ADRs Pi, STORY-0XX) foram movidas para a pasta **`_Histórico/`** — os links `[[...]]` continuam funcionando por nome.

Mapa central do projeto **HeziomOS**. Use o Graph View para visualizar as conexões entre módulos e fontes de dados.

**🟢 Arquitetura vigente:** [[HeziomOS — Arquitetura v3]] — doc único de arquitetura (stack, monorepo, schemas por domínio, segurança/LGPD, RNFs).
**🟢 Estado atual (módulos/épicos):** [[Estado Atual — Espelho dos Épicos]] — o que está em produção (E1–E18).
**Base contratual (Conselho):** [[HeziomOS — Complemento Técnico v2 (Conselho)]] — documento aprovado: segurança em profundidade, LGPD, custos (Mar/2026).
**Mapeamento da Operação:** [[Mapeamento Completo da Operação Heziom]] — documento-mãe de negócio: departamentos, processos, regras, canais de venda.

> _Versões antigas de arquitetura (v1, v2), "Módulos e Escopo Completo" e o "Mapa do Vault" foram para `_Histórico/` — superadas pela v3 + Espelho._

---

## Acompanhamento do Projeto

- **[[Estado Atual — Espelho dos Épicos]]** — ✅ estado real (E1–E18); fonte viva é `docs/stories/BACKLOG.md` no repo
- [[Setup João]] — como acessar e contribuir com este vault
- _(Histórico, em `_Histórico/`:)_ [[Dashboard do Projeto]] · [[Roadmap]] · [[Sprint Atual]] · [[Backlog]] — planejamento da fase inicial (mai/2026), superado

---

## Departamentos (Módulos do OS)

### 💰 Financeiro (Fase 1 — prioridade máxima)
- [[Índice Financeiro]] — visão completa do módulo financeiro
- [[Dashboard CEO]] — posição financeira, DRE MTD, faturamento por canal, alertas
- [[KPIs e Métricas]] — definições formais de cada indicador
- [[Agente Financeiro — Prompt]] — system prompt completo para uso no Claude
- [[Assistente — Chat MCP]] — chat em linguagem natural (Claude API)
- [[Pedidos e Vendas]] · [[Contas a Receber]] · [[Contas a Pagar]] · [[DRE e Fluxo de Caixa]]
- [[Aprovação de Pagamentos]] · [[Conciliação Bancária]] · [[Gestão de Estoque e CMV]] · [[Comissões e Repasses]]
- [[Fechamento Mensal — Automação Completa]] — 🔴 mapeamento real da pasta OneDrive + 10 APIs externas + fluxo automatizado (19/05/2026) ✅

### ✅ Tarefas e Projetos (Fase 2.1 — substitui ClickUp)
- [[Tarefas e Projetos]] — boards por departamento, cross-triggers, sprints

### 👥 Marketing e CRM (Fase 2.2 — substitui Flowbiz)
- [[Índice Marketing e CRM]] — CRM unificado, 40k contatos, segmentação comportamental
- [[LP Coleções 2026 (Plano Bomba) — Configuração]] — LP de catálogo dos 11 combos · `colecoes.editoraheziom.com.br` ✅ no ar
- [[00 - Bíblia 120 — Projeto LP]] — LP de pré-venda da Bíblia 120 anos (IPP) · `ipp120.editoraheziom.com.br` ✅ no ar · cupom IPP120 → Tray, captura→Flowbiz+CAPI

### 🏪 Comercial (Fase 2.3)
- [[Índice Comercial]] — atacado B2B, pace vs. meta CPC, pipeline, agente WhatsApp

### 📚 Editorial (Fase 2.4)
- [[Índice Editorial]] — pipeline 9 etapas, orçamento por lauda, calendário de publicações
- [[CDQ — Sistema de Cadastro Multi-Plataforma]] — 🟡 feature planejada: PDF miolo → cadastro completo Literarius + Tray + BookInfo + Amazon Vendor · score CDQ por campo · export XLSM (2026-06-03)

### 💬 Atendimento (Fase 2.5 — substitui Unnichat)
- [[Índice Atendimento]] — agente WhatsApp 24/7, escalação inteligente

### 📦 Logística e Expedição (Fase 1 estoque + Fase 2 painel)
- [[Índice Logística e Expedição]] — multi-ponto, Shipping Insights, consignação

### 👤 Pessoas e Gestão (Fase 2.6)
- [[Índice Pessoas e Gestão]] — comissões CPC, organograma, avaliação

---

## Sistemas a Substituir

| Sistema | Módulo HeziomOS | Fase | Economia est. |
|---|---|---|---|
| ClickUp | Tarefas + Editorial | 2.1 + 2.4 | ~R$ 500/mês |
| Flowbiz | CRM Unificado | 2.2 | ~R$ 300/mês |
| Unnichat | Atendimento | 2.5 | ~R$ 400/mês |
| Qive | Módulo Fiscal | 3 | ~R$ 200/mês |
| POS Controle | Literarius novo app | Externo | ~R$ 150/mês |
| Power BI | CEO Dashboard | 1 ✅ | R$ 3.500/mês |

---

## Mapa de Dados e Análises

- [[Mapa de Dados]] — tabela cruzada módulos × fontes, fluxos de integração
- [[Mapa Completo de APIs e Capacidades]] — 🔴 inventário total: 150 tabelas Literarius + ~100 endpoints Tray + cruzamentos + oportunidades ✅
- [[Dúvidas para Insights do CEO]] — perguntas pendentes para Heziom e Literarius
- [[Premissas e Entendimentos]] — o que está validado e o que ainda está a confirmar
- [[Análise dos Dados Extraídos]] — achados críticos e bloqueadores do DRE
- [[Estoque Heziom — Análise Mai 2026]] — 123 SKUs, 134k unidades, R$8,4M em estoque, top produtos, alertas ✅
- [[Análise Conexão Direta DB]] — análise via conexão ao banco (abril 2026)
- [[Análise Planilhas Janeiro 2026]] — faturamento, DRE, CMV, contas a pagar e DFC de janeiro
- [[DRE Acumulado 2025-2026]] — DRE mensal completo jan/2025 a fev/2026 (arquivo oficial contábil)
- [[Dashboard CEO — Análise Maio 2026]] — KPIs reais 1–15 Mai · faturamento R$340k, A/R R$2M, top produtos
- [[Sessão 2026-05-19 — Continuidade João]] — registro de continuidade + mapa rápido do vault

---

## Integrações

- [[Qive — NF-e Automática]] — captura NF-e recebidas via SEFAZ; fila de aprovação HeziomOS
- [[Bancos — CNAB e OFX]] — importação de extratos + geração de remessa CNAB 240 (Santander)
- [[Alertas e Notificações]] — engine de alertas via Microsoft Teams + email
- [[Tray — Conciliação de Repasses]] — rastreamento de repasses e-commerce × conta bancária

---

## Fontes de Dados

### Literarius (SQL Server — read-only)
**Acesso:** `192.168.18.10:1433` · base `Literarius` · user `acessoExterno`

**Views HeziomOS**
- [[Views — Camada de Acesso HeziomOS]] — 6 views otimizadas (−70% queries)

**Títulos Financeiros**
- [[TituloFinanceiro]]
- [[TituloFinanceiroBaixa]]
- [[TituloFinanceiroRateio]]
- [[TituloFinanceiroBaixaRateio]]
- [[TituloFinanceiroAgrupado]]

**Contas Bancárias**
- [[ContaBancaria]]
- [[ContaBancariaLancamento]]

**Plano de Contas**
- [[PlanoConta]]
- [[CentroResultado]]

**Pagamentos**
- [[FormaPagto]]
- [[CondicaoPagto]]

**Pedidos e Faturamento**
- [[PedidoVenda]]
- [[NotaFiscal]]

**Comissões**
- [[ComissaoParametro]]

### Tray (API)

**Infraestrutura**
- [[Tray - Autenticação]] — OAuth completo + credenciais + código Python ✅
- [[Tray - Rate Limit e Paginação]] — rate limiter + paginação + retry (código Python) ✅
- [[Tray - Webhooks]] — 10 eventos + endpoints + ações recomendadas ✅
- [[Tray - Capacidades do Integrador]] — matriz completa de 14 categorias (atualizado 19/05) ✅

**Dados Transacionais**
- [[Tray - Pedidos]] — GET/POST/PUT/DELETE orders ✅
- [[Tray - Pagamentos]] — price_seller, taxas, status ✅
- [[Tray - Invoices]] — vinculação NF-e ✅
- [[Tray - Clientes]] — CRUD + endereços + correlação Literarius ✅ 🆕

**Catálogo e Marketing**
- [[Tray - Categorias e Marcas]] — hierarquia + selos + BISAC mapping ✅ 🆕
- [[Tray - Cupons e Promoções]] — CRUD + ROI de campanhas ✅ 🆕
- [[Tray - Carrinho Abandonado e Scripts]] — remarketing + pixels ✅ 🆕

**Logística**
- [[Tray - Frete e Logística]] — cálculo, rastreio, fluxo operacional ✅ 🆕

**Integração Literarius ↔ Tray**
- [[Tray - Sync Agent — Endpoints e Estratégia]] — schema Supabase + checklist ✅
- [[Tray — Correlação com Literarius]] — mapa campo a campo + queries de conciliação ✅
- [[Roadmap de Integração Tray × Literarius]] — 🔴 3 fases, oportunidades, mapa de dados completo ✅

**Temas e Parceria**
- [[Tray - Temas e Design]] — marketplace, preços, programa de parceiros, gap editorial ✅
- [[Tray - OpenCode — Desenvolvimento de Temas]] — CLI, estrutura de pastas, stack técnica, checklist zero→publicado ✅

---

## Ferramentas a Substituir (documentação completa)

- [[ClickUp — Funcionalidades Mapeadas]] — inventário completo: tasks, views, automações, custom fields, API de migração ✅
- [[Flowbiz — Funcionalidades Mapeadas]] — CRM, segmentação, réguas, e-commerce tracking, canais, plano de migração 40k contatos ✅
- [[Unnichat — Funcionalidades Mapeadas]] — WhatsApp, chatbot, filas, agentes IA, CRM integrado, integrações ✅
- [[Qive — Funcionalidades Mapeadas]] — NF-e, manifestação SEFAZ, workflow aprovação, CNAB, compliance, plano Fase 3 ✅

---

## Desenvolvimento

- [[Monorepo — Estrutura e Setup]] — blueprint do monorepo `heziomos`: estrutura de pastas, deploy isolado por app, Supabase schema único, TRIVIAIOX, comandos git subtree
- [[STORY-013 — Setup Monorepo heziomos]] — story de implementação do monorepo (backlog)

---

## Documentação de Referência

- [[DDL Banco de dados Literarius]] — schema completo do banco
- [[PUML Tabelas Literarius]] — diagramas ER
