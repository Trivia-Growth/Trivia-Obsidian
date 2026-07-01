---
tags: [heziom, arquitetura, interligação, fluxos, eventos, dados]
status: proposta
criado: 2026-05-19
atualizado: 2026-05-23
base: Módulos e Escopo Completo + Ferramentas a Substituir (ClickUp, Flowbiz, Unnichat, Qive) + APIs Externas + Questionário Financeiro
---

# HeziomOS — Interligação Completa entre Módulos

> Como os 10 módulos do HeziomOS se conectam, quais dados compartilham, quais eventos geram e como tudo alimenta um banco único.
> Este documento é o "sistema nervoso" do OS — mapeia cada sinapse entre departamentos.

---

## Visão Macro: Grafo de Dependências

```mermaid
graph LR
    %% Módulos
    FIN[💰 Financeiro]
    ECOM[🛒 E-commerce]
    EDIT[📚 Editorial]
    CRM[👥 CRM]
    ATEND[💬 Atendimento]
    COMER[🏪 Comercial]
    PEOPLE[👤 Pessoas]
    TASKS[✅ Tarefas]
    LOG[📦 Logística]
    DASH[📊 CEO Dashboard]
    
    %% Fluxos de dados (setas = "alimenta")
    ECOM -->|pedidos, receita| FIN
    ECOM -->|pedidos, clientes| CRM
    ECOM -->|status pedido| LOG
    COMER -->|pedidos atacado| FIN
    COMER -->|clientes B2B| CRM
    COMER -->|pedidos| LOG
    EDIT -->|custo editorial| FIN
    EDIT -->|lançamento| CRM
    EDIT -->|materiais| COMER
    ATEND -->|tickets| TASKS
    ATEND -->|oportunidades| COMER
    ATEND -->|histórico| CRM
    CRM -->|segmentos| ATEND
    CRM -->|base| COMER
    LOG -->|rastreio| ATEND
    LOG -->|estoque| ECOM
    PEOPLE -->|comissões| FIN
    PEOPLE -->|metas| COMER
    TASKS -->|tarefas| EDIT
    TASKS -->|tarefas| FIN
    
    %% Todos alimentam o Dashboard
    FIN --> DASH
    ECOM --> DASH
    EDIT --> DASH
    CRM --> DASH
    COMER --> DASH
    LOG --> DASH
    PEOPLE --> DASH
    ATEND --> DASH
```

---

## Barramento de Eventos Internos

O HeziomOS opera por **eventos**: quando algo muda num módulo, outros módulos reagem automaticamente. Isso substitui os "avisos manuais via ClickUp" que a Heziom faz hoje.

**Implementação técnica:** Supabase Realtime (pg_notify) + Edge Functions (listeners) + tabela `system_events`

```
system_events (
  id uuid,
  event_type text,        -- ex: 'order.approved', 'editorial.stage_completed'
  source_module text,     -- ex: 'comercial', 'editorial'
  payload jsonb,          -- dados do evento
  created_at timestamptz,
  processed boolean
)
```

---

## Mapa Completo de Eventos e Reações

### Eventos do E-COMMERCE → Reações

| Evento | Trigger | Reage: Módulo | Ação |
|---|---|---|---|
| `ecom.order.created` | Tray webhook `order.insert` | Financeiro | Cria título a receber |
| `ecom.order.created` | Tray webhook `order.insert` | Logística | Enfileira para separação |
| `ecom.order.created` | Tray webhook `order.insert` | CRM | Atualiza histórico do cliente |
| `ecom.order.paid` | Tray webhook `transaction.update` | Financeiro | Baixa no título |
| `ecom.order.paid` | Tray webhook `transaction.update` | Logística | Libera para picking |
| `ecom.order.shipped` | Melhor Envio webhook | CRM | Envia notificação ao cliente |
| `ecom.order.shipped` | Melhor Envio webhook | Atendimento | Disponibiliza rastreio para agente |
| `ecom.order.cancelled` | Tray webhook `order.delete` | Financeiro | Cancela título |
| `ecom.order.cancelled` | Tray webhook `order.delete` | Logística | Remove da fila |
| `ecom.cart.abandoned` | Cron (verifica Tray a cada 1h) | CRM | Dispara régua de recuperação |
| `ecom.stock.low` | Sync agent (saldo < mínimo) | Logística | Alerta de ruptura |
| `ecom.stock.low` | Sync agent | CEO Dashboard | Alerta visual |

---

### Eventos MULTI-GATEWAY (AppMax, Stone, Mercado Pago, Amazon, ML) → Reações

| Evento | Trigger | Reage: Módulo | Ação |
|---|---|---|---|
| `gateway.payment.approved` | AppMax webhook `order.approved` / MP webhook | Financeiro | Cria/baixa título a receber; registra em `heziom_transactions` |
| `gateway.payment.approved` | Idem | CEO Dashboard | Atualiza receita real-time |
| `gateway.refund.created` | AppMax webhook `order.refunded` / MP webhook | Financeiro | Cria título de estorno; ajusta DRE |
| `gateway.refund.created` | Idem | CRM | Marca contato para régua de retenção |
| `gateway.settlement.received` | Polling Stone extrato / MP settlement report | Financeiro | Conciliação item-por-item (tolerância ≤R$0,01) |
| `gateway.settlement.received` | Idem | Financeiro | Atualiza fluxo de caixa com `settlement_date` real |
| `gateway.balance.updated` | Polling Stone/MP saldo cada 15min | CEO Dashboard | Saldo consolidado cross-gateway |
| `gateway.balance.updated` | Idem | Financeiro | Alerta se saldo < threshold |
| `amazon.financial_event.posted` | SP-API polling diário | Financeiro | Registra taxas/comissões Amazon em `heziom_transactions` |
| `ml.invoice.available` | ML API polling | Financeiro | Captura NF do Mercado Livre para pacote contábil |
| `ml.order.created` | ML API polling | CRM | Atualiza histórico do contato (canal ML) |
| `ml.order.created` | Idem | Logística | Enfileira para separação |

---

### Eventos do COMERCIAL (Atacado) → Reações

| Evento | Trigger | Reage: Módulo | Ação |
|---|---|---|---|
| `comercial.order.created` | Vendedor lança no sistema (ou agente WhatsApp) | Financeiro | Gera título (boleto/PIX) |
| `comercial.order.created` | Idem | Logística | Enfileira separação |
| `comercial.order.created` | Idem | Tarefas | Cria tarefa "separar pedido #X" para expedição |
| `comercial.order.approved` | Status muda para aprovado | Financeiro | Confirma título e agenda cobrança |
| `comercial.order.approved` | Idem | Logística | Prioriza separação |
| `comercial.goal.achieved` | Cálculo diário pace vs. meta | Pessoas | Atualiza atingimento para comissão |
| `comercial.goal.achieved` | Idem | CEO Dashboard | Atualiza pace CPC |
| `comercial.lead.escalated` | Atendimento identifica oportunidade de venda | Comercial | Cria item no pipeline |
| `comercial.lead.escalated` | Idem | Tarefas | Tarefa "follow-up com #{cliente}" |

---

### Eventos do EDITORIAL → Reações

| Evento | Trigger | Reage: Módulo | Ação |
|---|---|---|---|
| `editorial.project.created` | Coordenadora registra nova obra | Tarefas | Gera timeline de tarefas automáticas |
| `editorial.stage.completed` | Etapa muda (ex: tradução → preparação) | Tarefas | Cria tarefa para próximo profissional |
| `editorial.stage.completed` | Idem | Editorial | Atualiza kanban + registra data |
| `editorial.stage.overdue` | Cron diário (prazo vencido) | Tarefas | Alerta para coordenadora |
| `editorial.stage.overdue` | Idem | CEO Dashboard | Flag de atenção |
| `editorial.plotter.approved` | Plotter finalizado | Tarefas | "Solicitar orçamento gráfico de #{título}" |
| `editorial.budget.approved` | Orçamento gráfico aprovado | Financeiro | Registra custo (título a pagar para gráfica) |
| `editorial.budget.approved` | Idem | Comercial | Informa custo unitário (precificação) |
| `editorial.budget.approved` | Idem | Logística | Previsão de chegada de estoque |
| `editorial.book.published` | Cadastro + estoque recebido | E-commerce | Sync produto → Tray (`POST /products`) |
| `editorial.book.published` | Idem | CRM | Dispara campanha de lançamento |
| `editorial.book.published` | Idem | Tarefas | Checklist de lançamento para Marketing |
| `editorial.launch.ready` | Todos materiais prontos (mockup, FAQ, guia) | CRM | Dispara pré-venda segmentada |
| `editorial.cost.registered` | Custo consolidado no Literarius | Financeiro | Atualiza CMV do produto |

---

### Eventos do FINANCEIRO → Reações

| Evento | Trigger | Reage: Módulo | Ação |
|---|---|---|---|
| `fin.payment.due_soon` | Cron (vencimento em 3 dias) | Tarefas | Tarefa "aprovar pagamento #{fornecedor}" |
| `fin.payment.approved` | Responsável aprova | Financeiro | Enfileira para CNAB |
| `fin.payment.executed` | Retorno CNAB processado | Financeiro | Baixa no título a pagar |
| `fin.receivable.overdue` | Cron (título em aberto > vencimento) | CRM | Régua de cobrança |
| `fin.receivable.overdue` | Idem | Comercial | Alerta ao vendedor responsável |
| `fin.receivable.overdue` | Idem | CEO Dashboard | Aging visual atualizado |
| `fin.reconciliation.mismatch` | Conciliação item-por-item (tolerância ≤R$0,01) detecta divergência | Tarefas | Tarefa "resolver divergência #{desc}" |
| `fin.dre.closed` | DRE mensal finalizado | CEO Dashboard | Atualiza KPIs |
| `fin.cashflow.alert` | Projeção indica caixa negativo em X dias | CEO Dashboard | Alerta crítico |
| `fin.cashflow.alert` | Idem | Tarefas | Tarefa urgente para financeiro |
| `fin.nfe.received` | Módulo fiscal captura NF-e via SEFAZ | Financeiro | Cria título a pagar (associa ao pedido de compra) |
| `fin.nfe.received` | Idem | Tarefas | "Aprovar NF-e #{número} de #{fornecedor}" |

---

### Eventos do CRM → Reações

| Evento | Trigger | Reage: Módulo | Ação |
|---|---|---|---|
| `crm.segment.triggered` | Contato entra em segmento (regra dinâmica) | CRM | Enfileira para campanha/régua |
| `crm.campaign.sent` | Campanha disparada | CRM | Registra métricas (opens, clicks) |
| `crm.contact.inactive` | Sem compra há X dias (configurável) | CRM | Dispara régua de reativação |
| `crm.contact.high_value` | LTV calculado > threshold | Comercial | Flag VIP para atendimento diferenciado |
| `crm.contact.cross_channel` | CPF identificado em novo canal | CRM | Unifica perfis |
| `crm.b2b.no_order_6m` | Igreja/livraria sem pedido há 6 meses | Comercial | Tarefa "reativar #{parceiro}" |

---

### Eventos do ATENDIMENTO → Reações

| Evento | Trigger | Reage: Módulo | Ação |
|---|---|---|---|
| `atend.conversation.started` | Nova mensagem WhatsApp | Atendimento | Agente IA classifica e responde |
| `atend.conversation.escalated` | Agente não resolve / detecta venda | Comercial | Transfere para vendedor |
| `atend.ticket.created` | Problema identificado (troca, reclamação) | Tarefas | Tarefa para equipe responsável |
| `atend.ticket.resolved` | Ticket fechado | CRM | Atualiza satisfação do contato |
| `atend.sale.assisted` | Venda fechada via WhatsApp | E-commerce | Registra pedido (Tray ou Literarius) |
| `atend.sale.assisted` | Idem | Comercial | Conta para meta do vendedor |

---

### Eventos da LOGÍSTICA → Reações

| Evento | Trigger | Reage: Módulo | Ação |
|---|---|---|---|
| `log.order.picked` | Separação concluída | Logística | Avança para embalagem |
| `log.order.shipped` | Etiqueta gerada + coletado | E-commerce | Atualiza Tray (`PUT /orders/:id` com tracking) |
| `log.order.shipped` | Idem | CRM | Notifica cliente (email/WhatsApp) |
| `log.order.delivered` | Confirmação de entrega | CRM | Dispara NPS / pesquisa satisfação |
| `log.order.delivered` | Idem | Financeiro | Marca receita como "realizada" |
| `log.stock.received` | Nova remessa da gráfica chegou | E-commerce | Sync estoque → Tray |
| `log.stock.received` | Idem | Editorial | Atualiza status do projeto ("estoque recebido") |
| `log.stock.received` | Idem | CRM | Avisa waitlist (se houver) |
| `log.consignment.overdue` | Contrato de consignação vencido | Comercial | Tarefa "cobrar acerto #{parceiro}" |
| `log.consignment.overdue` | Idem | Financeiro | Provisão de inadimplência |

---

### Eventos de PESSOAS → Reações

| Evento | Trigger | Reage: Módulo | Ação |
|---|---|---|---|
| `people.commission.calculated` | Fechamento mensal de comissões | Financeiro | Gera títulos a pagar (comissões) |
| `people.goal.updated` | Meta CPC atualizada | Comercial | Atualiza target no dashboard |
| `people.evaluation.due` | Ciclo de avaliação | Tarefas | Tarefas de avaliação para gestores |

---

### Eventos de TAREFAS → Reações

| Evento | Trigger | Reage: Módulo | Ação |
|---|---|---|---|
| `task.overdue` | Prazo vencido sem conclusão | CEO Dashboard | Flag de atenção por departamento |
| `task.completed` | Tarefa concluída | Tarefas | Verifica se gera próxima tarefa (cadeia) |
| `task.completed` | Se é tarefa editorial | Editorial | Avança etapa no pipeline |

---

## Matriz de Dados Compartilhados

### Entidades que cruzam múltiplos módulos

| Entidade | Módulos que consomem | Chave primária | Tabela Supabase |
|---|---|---|---|
| **Cliente/Contato** | CRM, Comercial, Atendimento, Financeiro, E-commerce | `crm_contacts.id` (CPF como chave de dedup) | `crm_contacts` |
| **Pedido** | E-commerce, Comercial, Financeiro, Logística | `orders.id` | `lit_pedido_venda` + `tray_orders` |
| **Produto** | E-commerce, Editorial, Logística, Comercial | `products.id` | `lit_produto` |
| **Título Financeiro** | Financeiro, Comercial, Editorial, Pessoas | `fin_titulos.id` | `lit_titulo_financeiro` |
| **Tarefa** | Todos os departamentos | `tasks.id` | `tasks` |
| **Projeto Editorial** | Editorial, Financeiro, Comercial, Marketing, Logística | `editorial_projects.id` | `editorial_projects` |
| **Conversa** | Atendimento, CRM, Comercial | `conversations.id` | `atendimento_conversations` |
| **Transação Unificada** | Financeiro, E-commerce, CEO Dashboard | `heziom_transactions.id` | `heziom_transactions` |

---

## Fluxos End-to-End (Cross-Module)

### Fluxo 1: Vida completa de um livro (Editorial → Venda → Pós-venda)

```mermaid
sequenceDiagram
    participant CAL as Calendário
    participant EDIT as Editorial
    participant FIN as Financeiro
    participant LOG as Logística
    participant ECOM as E-commerce
    participant CRM as CRM
    participant ATEND as Atendimento
    
    CAL->>EDIT: Obra planejada para Jul/2026
    EDIT->>EDIT: Pipeline: tradução → ... → plotter
    EDIT->>FIN: Custo editorial consolidado (título a pagar por profissional)
    EDIT->>FIN: Orçamento gráfico aprovado (título a pagar para gráfica)
    EDIT->>LOG: Previsão de chegada (tiragem + data)
    
    Note over LOG: Gráfica entrega estoque
    LOG->>ECOM: Sync estoque disponível → Tray
    EDIT->>ECOM: Cadastro produto (POST /products)
    EDIT->>CRM: Lançamento marcado → campanha
    
    CRM->>CRM: Dispara para segmento "teologia reformada"
    
    Note over ECOM: Cliente compra
    ECOM->>FIN: Título a receber
    ECOM->>LOG: Pedido para separar
    LOG->>ECOM: Tracking code
    ECOM->>CRM: Notifica cliente (enviado)
    
    Note over ATEND: Cliente pergunta rastreio
    ATEND->>LOG: Consulta tracking
    LOG->>ATEND: Status atual
    ATEND->>CRM: Registro da interação
```

---

### Fluxo 2: Pedido atacado completo (Comercial → Financeiro → Logística)

```mermaid
sequenceDiagram
    participant WA as WhatsApp
    participant COMER as Comercial
    participant FIN as Financeiro
    participant LOG as Logística
    participant LIT as Literarius
    
    WA->>COMER: Igreja pede 50 livros
    COMER->>LIT: PUT /PedidoVenda (cria pedido)
    LIT-->>FIN: Título a receber (boleto)
    LIT-->>LOG: Pedido enfileirado
    
    FIN->>WA: Envia boleto ao cliente
    
    Note over FIN: Pagamento confirmado
    FIN->>LOG: Libera para separação
    LOG->>LOG: Picking → Packing
    LOG->>WA: Notifica: pedido enviado + rastreio
    
    Note over FIN: Vencimento D+30
    FIN->>COMER: Alerta: título em aberto
    COMER->>WA: Cobrança ao cliente
```

---

### Fluxo 3: Atendimento com escalação para venda

```mermaid
sequenceDiagram
    participant CLI as Cliente (WhatsApp)
    participant AI as Agente IA
    participant COMER as Comercial
    participant ECOM as E-commerce
    participant CRM as CRM
    
    CLI->>AI: "Quero comprar 10 livros para minha igreja"
    AI->>AI: Classifica: VENDA (não suporte)
    AI->>COMER: Escala → vendedor
    
    Note over COMER: Vendedor assume
    COMER->>CLI: Atendimento personalizado
    COMER->>ECOM: Cria pedido (atacado)
    ECOM->>CRM: Atualiza perfil (novo pedido)
    CRM->>CRM: Reclassifica: cliente B2B
```

---

### Fluxo 4: Fechamento mensal automatizado (substitui processo manual de 30 dias)

```mermaid
sequenceDiagram
    participant CRON as Cron (dia 1)
    participant FIN as Financeiro
    participant CONC as Conciliação
    participant DASH as CEO Dashboard
    participant CONT as Contabilidade (ext)
    participant OD as OneDrive
    
    CRON->>FIN: Trigger: fechar mês anterior
    FIN->>FIN: Agregar receitas (Tray + AppMax + ML + Amazon + Stone + MP)
    FIN->>CONC: Conciliação item-por-item (tolerância ≤R$0,01 + dedup OFX)
    CONC->>FIN: Divergências sinalizadas → tarefas manuais
    FIN->>FIN: Agregar despesas (títulos pagos por PlanoContas)
    FIN->>FIN: Calcular DRE: receita − CPV − desp. fixas − variáveis
    FIN->>FIN: Gerar pacote contábil: NFs (XML + PDF) + extratos + relatórios
    FIN->>FIN: Gerar "Movimentação Mensal" (doc físico obrigatório)
    FIN->>OD: Upload pacote na pasta compartilhada contabilidade
    Note over OD,CONT: Contabilidade acessa, apura guias (IRPJ/CSLL/PIS/COFINS)
    CONT->>FIN: Retorna guias para pagamento
    FIN->>DASH: Publica DRE na hora (sem esperar 30 dias)
    
    Note over DASH: CEO tem visibilidade imediata
```

---

### Fluxo 5: Comissão CPC end-to-end

```mermaid
sequenceDiagram
    participant ECOM as E-commerce
    participant COMER as Comercial
    participant PEOPLE as Pessoas
    participant FIN as Financeiro
    
    Note over ECOM,COMER: Mês inteiro: vendas registradas
    
    COMER->>PEOPLE: Vendas atacado líquidas por vendedor (bruto − devoluções − descontos)
    PEOPLE->>PEOPLE: Lucas: 1,5% sobre vendas líquidas atacado
    PEOPLE->>PEOPLE: Bruno: 5% sobre vendas líquidas atacado
    PEOPLE->>FIN: Gera títulos a pagar (comissões)
    FIN->>FIN: Enfileira para CNAB do mês seguinte
```

> **Nota:** Comissões incidem apenas sobre **vendas atacado líquidas** (NET), não sobre D2C/e-commerce. Fórmula: `comissão = net_atacado_vendedor × %_fixa`.

---

## Banco Único: Schema Consolidado

```mermaid
erDiagram
    crm_contacts ||--o{ atendimento_conversations : "has"
    crm_contacts ||--o{ lit_pedido_venda : "places"
    crm_contacts ||--o{ tray_orders : "places"
    crm_contacts ||--o{ comercial_pipeline : "in"
    
    lit_pedido_venda ||--o{ lit_titulo_financeiro : "generates"
    tray_orders ||--o{ lit_titulo_financeiro : "generates"
    tray_orders ||--o{ heziom_transactions : "produces"
    
    editorial_projects ||--o{ editorial_stages : "has"
    editorial_projects ||--o{ lit_titulo_financeiro : "costs"
    editorial_projects ||--o{ lit_produto : "becomes"
    
    lit_produto ||--o{ lit_pedido_venda : "sold_in"
    lit_produto ||--o{ tray_orders : "sold_in"
    lit_produto ||--o{ stock : "stored"
    
    lit_titulo_financeiro ||--o{ people_commission_calculations : "includes"
    
    heziom_transactions {
        uuid id PK
        text source "tray|appmax|stone|mp|amazon|ml"
        text external_id
        numeric gross_amount
        numeric fee_amount
        numeric net_amount
        date settlement_date
        text channel "d2c|atacado|marketplace"
        text status "pending|settled|refunded"
    }
    
    tasks ||--o{ editorial_stages : "tracks"
    tasks ||--o{ comercial_pipeline : "tracks"
    tasks ||--o{ atendimento_conversations : "escalates"
```

---

## Pontos de Integração com Sistemas Externos

| Sistema externo | Direção | Módulo HeziomOS | Protocolo | Frequência |
|---|---|---|---|---|
| **Literarius SQL** | ← leitura | Todos (via sync) | TCP/MSSQL | A cada 15min |
| **Literarius REST** | ↔ leitura + escrita | Comercial, Financeiro | HTTP REST | On-demand |
| **Tray API** | ↔ leitura + escrita | E-commerce, CRM | HTTP REST | Polling 15min + webhooks |
| **Tray Webhooks** | → push | E-commerce | HTTPS POST | Real-time |
| **Melhor Envio API** | ↔ | Logística, Atendimento, Financeiro | OAuth2 REST | Real-time webhooks + polling |
| **Shipping Insights** | ← leitura | Logística | API interna (TBD) | On-demand |
| **WhatsApp Business API** | ↔ | Atendimento, Comercial, CRM | HTTP REST + webhooks | Real-time |
| **Meta Ads API** | ← leitura | CRM, CEO Dashboard | HTTP REST | Diário |
| **Google Ads API** | ← leitura | CEO Dashboard | HTTP REST | Diário |
| **Santander OFX** | ← upload | Financeiro | Arquivo OFX | Diário (manual MVP) |
| **SEFAZ** | ← consulta | Financeiro (fiscal) | Certificado A1 | Cron 6h (Fase 3) |
| **OneDrive** | ← leitura | Editorial | MS Graph API | On-demand |
| **DocuSign** | ↔ | Editorial | REST API | On-demand |
| **Bookwire** | → escrita | Editorial | TBD | Por lançamento |
| **BookInfo** | → escrita | Editorial | TBD | Por lançamento |
| **AppMax API** | ↔ | Financeiro, E-commerce | OAuth2 REST (Client Credentials) | Real-time webhooks + polling 15min |
| **Stone Banking API** | ← leitura | Financeiro | OAuth2 + JWT RSA | Polling cada 15min |
| **Mercado Pago API** | ← leitura | Financeiro, CRM | Bearer Token (permanente) | Polling cada 15min |
| **Amazon SP-API** | ← leitura | Financeiro, E-commerce, CRM | LWA OAuth + AWS SigV4 | Diário |
| **Mercado Livre API** | ↔ | Financeiro, CRM, E-commerce | OAuth2 Authorization Code | Polling cada 15min |
| **Supabase Realtime** | ↔ interno | Todos os módulos | WebSocket | Real-time |

---

## Permissões e Visibilidade (RLS por módulo)

| Perfil | Módulos com acesso | Nível |
|---|---|---|
| **CEO / Diretoria** | Todos | Leitura total + aprovações |
| **Financeiro** | Financeiro, parte de Comercial (inadimplência) | CRUD financeiro |
| **Comercial** | Comercial, CRM (contatos B2B), Tarefas próprias | CRUD vendas |
| **Editorial** | Editorial, Tarefas próprias | CRUD editorial |
| **Marketing** | CRM, Campanhas, Tarefas próprias | Leitura produtos + CRUD campanhas |
| **Atendimento** | Atendimento, CRM (leitura), Logística (rastreio) | Leitura + chat |
| **Logística** | Logística, Pedidos (leitura) | CRUD expedição |
| **Agente IA** | Todos (leitura) + ações específicas via tools | Controlado por system prompt |

---

## O que deixa de ser manual

| Hoje (aviso manual) | HeziomOS (evento automático) |
|---|---|
| Vendedor avisa expedição via ClickUp | `comercial.order.created` → tarefa automática para logística |
| Expedição avisa financeiro para gerar boleto | `comercial.order.approved` → título criado automaticamente |
| Editorial avisa Comercial que livro está pronto | `editorial.book.published` → notificação + produto na Tray |
| Marketing pede relatório toda segunda | CEO Dashboard atualiza em tempo real |
| Atendimento escala manualmente para vendedor | `atend.conversation.escalated` → pipeline do comercial |
| Financeiro separa documentos para contabilidade | `fin.month.closed` → pacote gerado e enviado automaticamente |
| Coordenadora editorial cobra prazos de terceiros | `editorial.stage.overdue` → alerta automático |
| CEO busca dados consolidados em múltiplas fontes | Tudo no Dashboard, atualizado em tempo real |

---

## Resumo Quantitativo

| Métrica | Valor |
|---|---|
| Módulos interligados | 10 |
| Eventos mapeados | 64 (+12 multi-gateway) |
| Fluxos end-to-end documentados | 5 |
| Sistemas externos integrados | 21 (+5 gateways/banking, −1 Mandaê) |
| Avisos manuais eliminados | 8 processos recorrentes |
| Entidades compartilhadas | 8 (+heziom_transactions) |
| Perfis de acesso | 8 |

---

## Referências

- [[HeziomOS — Módulos e Escopo Completo]] — escopo de cada módulo
- [[HeziomOS — Arquitetura e Fluxos]] — arquitetura técnica Fase 1
- [[Mapeamento Completo da Operação Heziom]] — processos por departamento
- [[ClickUp — Funcionalidades Mapeadas]] — cross-triggers que substituem avisos manuais
- [[Flowbiz — Funcionalidades Mapeadas]] — réguas e automações a replicar
- [[Unnichat — Funcionalidades Mapeadas]] — fluxo de atendimento e escalação
- [[Qive — Funcionalidades Mapeadas]] — workflow fiscal
- [[APIs Externas — Credenciais e Passo a Passo]] — documentação e credenciais para AppMax, Stone, MP, Amazon, ML
- [[Features Expandidas — APIs × Módulos HeziomOS]] — features habilitadas pelas integrações multi-gateway
- [[Fechamento Mensal — Automação Completa]] — fluxo detalhado do fechamento com regras confirmadas
- [[Questionário Fechamento — Para Equipe Financeira]] — respostas da equipe financeira (Ana/Rafael)

---

*Análise de interligação criada em 2026-05-19 — Atualizada em 2026-05-23 com integrações multi-gateway, regras de comissão confirmadas e fluxo de fechamento detalhado — JG Novais (Trivia)*
