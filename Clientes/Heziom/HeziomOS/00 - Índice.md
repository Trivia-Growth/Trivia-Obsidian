# HeziomOS — Índice

Mapa central do projeto **HeziomOS**. Use o Graph View para visualizar as conexões entre módulos e fontes de dados.

**Arquitetura completa:** [[HeziomOS — Arquitetura]] — stack React + Vite + Supabase, diagrama de componentes, decisões técnicas.

---

## Acompanhamento do Projeto

- [[Clientes/Heziom/HezionOS/Projeto/Dashboard do Projeto]] — status das stories em tempo real (requer plugin Dataview)
- [[Clientes/Heziom/HezionOS/Projeto/Roadmap]] — 3 fases com milestones e critérios de saída
- [[Clientes/Heziom/HeziomOS/Projeto/Sprint Atual]] — o que está sendo construído agora
- [[Clientes/Heziom/HeziomOS/Projeto/Backlog]] — todas as stories por fase e prioridade
- [[Setup João]] — como acessar e contribuir com este vault

---

## Agente Financeiro

- [[Agente Financeiro — Prompt]] — system prompt completo para uso no Claude

---

## CEO Dashboard

- [[Dashboard CEO]] — posição financeira, DRE MTD, faturamento por canal, alertas, score de saúde, fluxo de caixa 90d, aging visual
- [[KPIs e Métricas]] — definições formais de cada indicador e fonte de dados
- [[Assistente — Chat MCP]] — chat em linguagem natural integrado ao Literarius e Tray (Claude API)
- [[Memória do Assistente]] — painel admin de contexto persistente do assistente (pgvector + Supabase)

---

## Módulos Financeiros

### Módulos Existentes
- [[Pedidos e Vendas]] — faturamento multi-canal (Literarius + Tray)
- [[Contas a Receber]] — títulos a receber, aging, inadimplência
- [[Contas a Pagar]] — títulos a pagar, aprovação, remessa
- [[DRE e Fluxo de Caixa]] — resultado mensal, projeção de caixa

### Módulos Novos
- [[Aprovação de Pagamentos]] — workflow de alçadas + geração CNAB 240
- [[Conciliação Bancária]] — extrato OFX × TituloFinanceiroBaixa (meta: >95% automático)
- [[Gestão de Estoque e CMV]] — posição por setor, cobertura, consignações, CMV real
- [[Comissões e Repasses]] — receita líquida por canal, repasses Tray, comissões internas

---

## Mapa de Dados e Análises

- [[Mapa de Dados]] — tabela cruzada módulos × fontes, fluxos de integração
- [[Dúvidas para Insights do CEO]] — perguntas pendentes para Heziom e Literarius
- [[Premissas e Entendimentos]] — o que está validado e o que ainda está a confirmar
- [[Análise dos Dados Extraídos]] — achados críticos e bloqueadores do DRE
- [[Análise Conexão Direta DB]] — análise via conexão ao banco (abril 2026)
- [[Análise Planilhas Janeiro 2026]] — faturamento, DRE, CMV, contas a pagar e DFC de janeiro
- [[DRE Acumulado 2025-2026]] — DRE mensal completo jan/2025 a fev/2026 (arquivo oficial contábil)
- [[Projeto/Dashboard CEO — Análise Maio 2026]] — KPIs reais 1–15 Mai · faturamento R$340k, A/R R$2M, top produtos
- [[Projeto/Sessão 2026-05-19 — Continuidade João]] — registro de continuidade + mapa rápido do vault

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
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Literarius/Banco de Dados/TituloFinanceiro]]
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Literarius/Banco de Dados/TituloFinanceiroBaixa]]
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Literarius/Banco de Dados/TituloFinanceiroRateio]]
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Literarius/Banco de Dados/TituloFinanceiroBaixaRateio]]
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Literarius/Banco de Dados/TituloFinanceiroAgrupado]]

**Contas Bancárias**
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Literarius/Banco de Dados/ContaBancaria]]
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Literarius/Banco de Dados/ContaBancariaLancamento]]

**Plano de Contas**
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Literarius/Banco de Dados/PlanoConta]]
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Literarius/Banco de Dados/CentroResultado]]

**Pagamentos**
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Literarius/Banco de Dados/FormaPagto]]
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Literarius/Banco de Dados/CondicaoPagto]]

**Pedidos e Faturamento**
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Literarius/Banco de Dados/PedidoVenda]]
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Literarius/Banco de Dados/NotaFiscal]]

**Comissões**
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Literarius/Banco de Dados/ComissaoParametro]]

### Tray (API)
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Tray/_a mapear]] — índice Tray
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Tray/_a mapear]] — índice Tray atualizado
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Tray/Tray - Autenticação]] — OAuth completo + credenciais + código Python ✅
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Tray/Tray - Pedidos]]
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Tray/Tray - Pagamentos]]
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Tray/Tray - Invoices]]
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Tray/Tray - Webhooks]]
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Tray/Tray - Rate Limit e Paginação]] — rate limiter + paginação + retry (código Python) ✅
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Tray/Tray - Sync Agent — Endpoints e Estratégia]] — schema Supabase + checklist ✅
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Tray/Tray - Capacidades do Integrador]] — o que a API permite (e o que não) ✅
- [[Clientes/Heziom/HeziomOS/Fontes de Dados/Tray — Correlação com Literarius]] — mapa campo a campo + queries de conciliação ✅
- [[Clientes/Heziom/HeziomOS/Projeto/Roadmap de Integração Tray × Literarius]] — 🔴 3 fases, oportunidades, mapa de dados completo ✅

---

## Documentação de Referência

- [[DDL Banco de dados Literarius]] — schema completo do banco
- [[PUML Tabelas Literarius]] — diagramas ER
