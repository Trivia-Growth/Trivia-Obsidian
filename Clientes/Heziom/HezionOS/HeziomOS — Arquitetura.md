---
tags: [arquitetura, heziomOS, visao-geral]
status: especificação
criado: 2026-04-15
---

# HeziomOS — Arquitetura do Módulo Financeiro

Blueprint completo do sistema financeiro da Heziom. Serve como ponto de entrada para qualquer desenvolvedor ou stakeholder entender o que está sendo construído, por quê, e como as peças se conectam.

---

## O que é o HeziomOS

HeziomOS é o sistema de gestão operacional construído **sobre** o Literarius (ERP existente da Heziom), não em substituição a ele. É a camada de **inteligência, automação e dashboard** que o ERP não entrega nativamente.

| O que o Literarius faz | O que o HeziomOS adiciona |
|----------------------|--------------------------|
| Registra pedidos, NFs, títulos financeiros | Dashboard em tempo real para o CEO |
| Armazena dados financeiros | Workflows de aprovação de pagamentos |
| Gera relatórios básicos | DRE automatizado com alertas |
| — | Conciliação bancária automática |
| — | Integração com Qive (NF-e recebidas) |
| — | Alertas no Teams para time financeiro |
| — | Controle de estoque com CMV calculado |

---

## Entidade

**ASSOCIAÇÃO EDITORA PRESBITERIANA DE PINHEIROS**
- CNPJ: 40.804.477/0001-44
- Vínculo: Instituto Presbiteriano do Brasil (IPP)
- Natureza: entidade sem fins lucrativos → usa **Superávit** (não Lucro)
- Contabilidade: Contabil Ribeiro LTDA

---

## Diagrama de Componentes

```
┌────────────────────────────────────────────────────────────────────┐
│                        HeziomOS Financeiro                         │
│                  (React + Vite → Netlify)                          │
│                                                                    │
│  ┌─────────────────┐  ┌──────────────────┐                        │
│  │  CEO Dashboard  │  │  Operacional     │                        │
│  │                 │  │  Financeiro      │                        │
│  │  Posição hoje   │  │  Aprovação Pgto  │                        │
│  │  DRE MTD        │  │  Conciliação     │                        │
│  │  Fatur. canal   │  │  Estoque/CMV     │                        │
│  │  Alertas        │  │  Comissões       │                        │
│  └────────┬────────┘  └────────┬─────────┘                        │
└───────────┼────────────────────┼───────────────────────────────────┘
            │ Supabase client    │ Supabase client
            ▼                    ▼
┌────────────────────────────────────────────────────────────────────┐
│                       Supabase Cloud                               │
│                                                                    │
│  ┌──────────────────────┐  ┌─────────────────────────────────┐    │
│  │  PostgreSQL DB       │  │  Edge Functions (Deno)          │    │
│  │                      │  │                                 │    │
│  │  aprovações          │  │  GET /dashboard — posição CEO   │    │
│  │  regras_cnpj         │  │  POST /alertas — Teams webhook  │    │
│  │  bank_statements     │  │  POST /cnab — gera arquivo      │    │
│  │  conciliação         │  │  Scheduled: briefing 7h         │    │
│  │  alertas · logs      │  │  Scheduled: alertas 8h/10h      │    │
│  └──────────────────────┘  └─────────────────────────────────┘    │
│                                                                    │
│  ┌──────────────────────┐                                          │
│  │  Supabase Auth       │  ← controle por papel (CEO/Financeiro)  │
│  └──────────────────────┘                                          │
└────────────────────────────────────────────────────────────────────┘
            ▲                       │ API              │ API
            │ sync (push)           ▼                  ▼
┌───────────────────────┐      Qive API          Tray API
│  Heziom LAN           │      NF-e recv         pedidos
│                       │      manifestação      pagamentos
│  [Literarius :1433]   │
│         ←── Deno sync script (npm:mssql)
│              cron local — máquina Heziom
└───────────────────────┘
```

### Arquitetura de Rede — Por que Deno local?

Edge Functions rodam na nuvem do Supabase e **não alcançam IPs privados** (`192.168.18.10`). O script Deno roda dentro da rede da Heziom, lê o Literarius diretamente e grava no Supabase via SDK. Não é necessário expor o SQL Server externamente.

---

## Stack Tecnológico

| Componente | Tecnologia | Justificativa |
|-----------|-----------|---------------|
| Frontend | **React + Vite** | Compatível com Lovable; build leve e rápido |
| Dev UI | **Lovable** | Preview visual + permite colaboração de não-técnicos na UI |
| Backend (API) | **Supabase Edge Functions (Deno)** | Serverless, integrado ao banco, suporta `npm:` packages |
| Banco HeziomOS | **Supabase (PostgreSQL)** | Gerenciado, Auth + Realtime + Storage embutidos |
| Literarius sync | **Deno script local** (`npm:mssql`) | Roda na rede da Heziom; único componente com acesso ao SQL Server privado |
| Jobs agendados | **Cron local** (Deno) + **Supabase Scheduled Functions** | Local para sync Literarius; Supabase para alertas e briefing |
| Alertas | **MS Teams Incoming Webhook** | Teams já usado pela Heziom; sem SDK extra |
| Autenticação | **Supabase Auth** | Controle de acesso por papel (CEO / Financeiro / Analista) |
| Deploy | **Netlify** (frontend) + **Supabase** (backend) | Netlify integra com GitHub; Supabase gerencia backend |

### Workflow de desenvolvimento

| Quem | Toca o quê | Regra |
|------|-----------|-------|
| **Lovable** | `src/` — componentes React, páginas, estilos | Não edita lógica de negócio |
| **Claude** | `supabase/`, `sync/`, `lib/`, configs | Não reescreve arquivos gerados pelo Lovable inteiros |

### Fases do Projeto

| Fase | Objetivo | Comportamento do sistema |
|------|----------|--------------------------|
| **1 — Visibilidade** | Dashboard CEO + gaps operacionais | Read-only; humano interpreta |
| **2 — Inteligência Assistida** | Sugestões automáticas; humano aprova | IA sugere, humano executa |
| **3 — Autonomia** | Processos rodando sozinhos | IA age, humano monitora |

**Fase 1 MVP:** CEO Dashboard + sync básico Literarius → Supabase + alertas Teams

---

## Módulos Financeiros

### Existentes (já especificados)
- [[Pedidos e Vendas]] — faturamento multi-canal via Literarius
- [[Contas a Receber]] — títulos a receber, aging, baixas
- [[Contas a Pagar]] — títulos a pagar, aprovação, remessa CNAB
- [[DRE e Fluxo de Caixa]] — demonstrativo de resultado e projeção

### Novos (especificados nesta fase)
- [[Aprovação de Pagamentos]] — workflow de alçadas + geração de CNAB 240
- [[Conciliação Bancária]] — extrato OFX × TituloFinanceiroBaixa
- [[Gestão de Estoque e CMV]] — posição, cobertura, custo via Qive
- [[Comissões e Repasses]] — marketplace + vendedores internos

---

## Integrações

| Integração | Direção | Propósito |
|-----------|---------|-----------|
| [[Qive — NF-e Automática]] | IN | Captura NF-e recebidas da SEFAZ; cria fila de aprovação |
| [[Bancos — CNAB e OFX]] | IN/OUT | Importa extratos; gera remessa de pagamento |
| [[Tray — Conciliação de Repasses]] | IN | Pedidos e repasses do e-commerce |
| [[Alertas e Notificações]] | OUT | Teams + email para eventos críticos |
| SEFAZ | OUT (via Qive) | Manifestação do destinatário (210210, 210200) |
| Mercado Livre / Amazon | IN | Fase 2 — reconciliação de pedidos marketplace |

---

## CEO Dashboard

- [[Dashboard CEO]] — layout, KPIs em tempo real, alertas
- [[KPIs e Métricas]] — definições formais de cada indicador e sua fonte

---

## Fontes de Dados Primárias

### Literarius DB (leitura)
- **Conexão:** SQL Server, `192.168.18.10:1433`, base `Literarius`, usuário `acessoExterno`
- **Acesso:** read-only; HeziomOS **não escreve** no Literarius nesta fase
- **Views:** 6 views otimizadas criadas pela equipe Literarius (ver [[Views — Camada de Acesso HeziomOS]])
- **Tabelas principais:** [[TituloFinanceiro]], [[NotaFiscal]], [[PedidoVenda]], [[ContaBancaria]], [[PlanoConta]]

### HeziomOS PostgreSQL (leitura + escrita)
Tabelas próprias do HeziomOS:

| Tabela | Propósito |
|--------|-----------|
| `payment_approvals` | Workflow de aprovação de pagamentos |
| `cnab_batches` | Lotes CNAB gerados para envio ao banco |
| `bank_statements` | Extratos OFX importados |
| `bank_reconciliations` | Matches extrato × TituloFinanceiroBaixa |
| `nfe_queue` | Fila de NF-e recebidas aguardando aprovação |
| `cnpj_rules` | Regras CNPJ emitente → PlanoConta para NF-e |
| `alert_config` | Configuração de alertas por evento |
| `marketplace_rates` | Taxas de comissão por marketplace |

---

## Papéis de Usuário

| Papel | Acesso |
|-------|--------|
| CEO | Dashboard completo + aprovação de pagamentos acima do threshold |
| Financeiro | Todos os módulos operacionais |
| Analista | Leitura de relatórios, sem aprovação |

---

## Fluxos de Automação

### Fluxo 1 — NF-e Recebida (horário)
```
Qive GET /v1/nfe/received?filter=(NOT_EXISTS processed)
  │
  ├── Para cada NF:
  │   ├── Parse XML: CNPJ emitente, valor, vencimentos, itens
  │   ├── Lookup em cnpj_rules → PlanoConta sugerida
  │   ├── Se regra encontrada → enfileira em nfe_queue (status: pendente)
  │   └── Se não encontrada → nfe_queue (status: sem_fornecedor) + alerta Teams
  │
  ├── PUT /v1/nfe/received/processed → value: "true"
  └── POST /v1/nfe/manifest (Ciência da Operação 210210)

Tela HeziomOS: financeiro revisa fila → aprova → [futuramente] cria TituloFinanceiro no Literarius
```

### Fluxo 2 — Aprovação de Pagamentos
```
TituloFinanceiro (TipoTitulo='P', Pago=0) lido do Literarius
  │
  ├── Valor < threshold → aparece na fila do financeiro diretamente
  ├── Valor ≥ threshold → notificação Teams para CEO
  │
  Aprovador: Aprovar / Rejeitar / Solicitar esclarecimento
  │
  ├── Aprovado → adiciona ao lote CNAB 240 do dia
  └── Lote finalizado → arquivo CNAB gerado → download para upload no Santander
```

### Fluxo 3 — Conciliação Bancária (diária 22h)
```
Extrato OFX importado (upload manual ou API)
  │
  ├── Para cada lançamento:
  │   ├── Busca TituloFinanceiroBaixa com valor ≈ X e data ≈ Y
  │   ├── Match > 90% de confiança → concilia automaticamente
  │   └── Match < 90% → adiciona à fila manual com sugestões
  │
  └── Dashboard: taxa de conciliação automática do dia
```

### Fluxo 4 — CEO Briefing (7h diário)
```
Cron 7h → agrega:
  ├── Saldo ContaBancaria (Santander + carteiras CC + Stone)
  ├── TituloFinanceiro a receber próximos 7 dias
  ├── TituloFinanceiro a pagar próximos 7 dias
  ├── Alertas ativos (títulos vencidos, aprovações pendentes)
  └── Faturamento MTD vs. mesmo período mês anterior

→ POST Teams webhook → card formatado no canal CEO
```

---

## Restrições e Decisões

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Escrita Literarius | Não nesta fase | Acesso acessoExterno é read-only; criar user de escrita depende da equipe Literarius |
| NF-e automática | Cria fila, não título direto | Mantém controle humano enquanto regras de CNPJ não estão 100% mapeadas |
| Alertas | MS Teams + email | Teams já é usado pela Heziom |
| SEFAZ | Via Qive | Sem integração direta; Qive já monitora a SEFAZ |
| DRE automático | Bloqueado | PlanoConta.TipoCategoria='A' em todos os 115 registros — depende de correção no Literarius |
| Sync Literarius | Deno script local (não Edge Function) | Edge Functions não alcançam IP privado 192.168.18.10 |

---

## Questões Abertas

1. **Threshold de alçada:** valor acima do qual o CEO precisa aprovar pagamentos
2. **Prazo repasse Tray:** D+? dias (define o trigger de alerta de atraso)
3. **OFX Santander:** confirmar disponibilidade no internet banking
4. **Amazon Full vs. Normal:** dois sellers distintos ou fulfillment diferente?
5. **Máquina Deno sync:** qual servidor/PC na rede da Heziom rodará o script de sincronização?

---

## Próximos Passos

- [ ] Criar conta Supabase + projeto HeziomOS
- [ ] Criar repositório Git com estrutura React + Vite (iniciar via Lovable)
- [ ] Configurar Netlify apontando para o repositório
- [ ] Escrever script Deno de sync Literarius → Supabase (Fase 1: posição financeira, títulos, faturamento)
- [ ] Solicitar à equipe Literarius: criar as 6 views SQL + corrigir PlanoConta.TipoCategoria
- [ ] Definir threshold de alçada para aprovação de pagamentos (CEO)
- [ ] Identificar máquina da Heziom para rodar o Deno sync
