# HeziomEduTech — Índice

Mapa central do projeto **HeziomEdutech**. Use o Graph View para visualizar as conexões entre módulos e fontes de dados.

**Arquitetura completa:** [[HeziomOS — Arquitetura]] — stack React + Vite + Supabase, diagrama de componentes, decisões técnicas.

---

## Acompanhamento do Projeto

- [[Dashboard do Projeto]] — status das stories em tempo real (requer plugin Dataview)
- [[Roadmap]] — 3 fases com milestones e critérios de saída
- [[Sprint Atual]] — o que está sendo construído agora
- [[Backlog]] — todas as stories por fase e prioridade
- [[Setup João]] — como acessar e contribuir com este vault

---

## Agente Financeiro

- [[Agente Financeiro — Prompt]] — system prompt completo para uso no Claude

---

## CEO Dashboard

- [[Dashboard CEO]] — posição financeira, DRE MTD, faturamento por canal, alertas
- [[KPIs e Métricas]] — definições formais de cada indicador e fonte de dados

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
- [[_a mapear]] — índice Tray
- [[Tray - Autenticação]]
- [[Tray - Pedidos]]
- [[Tray - Pagamentos]]
- [[Tray - Invoices]]
- [[Tray - Webhooks]]

---

## Documentação de Referência

- [[DDL Banco de dados Literarius]] — schema completo do banco
- [[PUML Tabelas Literarius]] — diagramas ER
