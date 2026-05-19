# HeziomOS — Índice

Mapa central do projeto **HeziomOS**. Use o Graph View para visualizar as conexões entre módulos e fontes de dados.

**Mapeamento da Operação:** [[Mapeamento Completo da Operação Heziom]] — 🔴 documento-mãe: 7 departamentos, 11 sistemas integrados, 6 a substituir, fluxo editorial completo, regras de negócio, canais de venda, prioridades (19/05/2026) ✅
**Módulos e Escopo Completo:** [[HeziomOS — Módulos e Escopo Completo]] — 🔴 proposta expandida: 6 novos módulos (Editorial, CRM, Atendimento, Comercial, Pessoas, Tarefas) + faseamento + decisões pendentes (19/05/2026) ✅
**Arquitetura Fase 1 (Financeiro):** [[HeziomOS — Arquitetura e Fluxos]] — proposta técnica: 10 fluxos, 4 camadas, cronograma, stack completa, modelo de dados (19/05/2026) ✅
**Arquitetura (histórico):** [[HeziomOS — Arquitetura]] — blueprint inicial do módulo financeiro (15/04/2026); consultar só como referência.

> 🗺️ **Mapa estrutural do vault:** [[Mapa do Vault]] — inventário completo de pastas e notas + log de organização.

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

## Documentação de Referência

- [[DDL Banco de dados Literarius]] — schema completo do banco
- [[PUML Tabelas Literarius]] — diagramas ER
