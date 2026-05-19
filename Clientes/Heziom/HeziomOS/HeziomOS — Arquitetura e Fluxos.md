---
tags: [heziom, arquitetura, fluxos, sistema, proposta]
status: proposta
criado: 2026-05-19
autor: JG Novais (Trivia)
---

# HeziomOS — Arquitetura Completa e Fluxos entre Aplicações

> Proposta consolidada da lógica de sistema, fluxos de dados e interconexões entre todas as aplicações que compõem o HeziomOS.

---

## O que é o HeziomOS

```
HeziomOS = Camada de Inteligência Operacional
           sobre o ERP Literarius + E-commerce Tray

Não substitui nenhum dos dois — CONECTA e POTENCIALIZA.
```

**Para o CEO:** Um painel único com tudo que importa — sem precisar abrir 5 sistemas.
**Para o Financeiro:** Automação de aprovações, conciliação e alertas proativos.
**Para a Operação:** Estoque sincronizado, pedidos rastreados, consignações controladas.

---

## Diagrama de Arquitetura Completa

```mermaid
graph TB
    subgraph INTERNET["☁️ Cloud"]
        NETLIFY[Netlify CDN<br>React + Vite]
        SUPA[(Supabase<br>PostgreSQL + Edge Functions)]
        CLAUDE[Claude API<br>Assistente IA]
        TEAMS[Microsoft Teams<br>Alertas]
        TRAY_API[Tray API v2<br>E-commerce]
        QIVE[Qive API<br>NF-e SEFAZ]
    end

    subgraph LAN["🏢 Rede Heziom (LAN)"]
        LIT[(Literarius<br>SQL Server<br>192.168.18.10)]
        PI[Raspberry Pi 4<br>Sync Agent<br>Deno Runtime]
    end

    subgraph USERS["👤 Usuários"]
        CEO[CEO<br>Dashboard + Briefing]
        FIN[Financeiro<br>Aprovações + Conciliação]
        OPS[Operação<br>Estoque + Logística]
    end

    CEO --> NETLIFY
    FIN --> NETLIFY
    OPS --> NETLIFY
    NETLIFY --> SUPA

    PI -->|SQL read every 15-60min| LIT
    PI -->|REST PUT pedidos| LIT
    PI -->|upsert data| SUPA
    PI -->|GET/PUT orders,stock| TRAY_API
    
    TRAY_API -->|webhooks push| SUPA
    QIVE -->|NF-e captura| SUPA
    SUPA -->|Edge Function| TEAMS
    SUPA -->|Edge Function| CLAUDE
    SUPA -->|Edge Function| TRAY_API
```

---

## Camadas do Sistema

### Camada 1 — Fontes de Dados (Read)

| Fonte | Protocolo | Dados | Frequência |
|---|---|---|---|
| **Literarius SQL** | TCP/1433 (mssql) | 150 tabelas, 61 views, tudo financeiro + operacional | 15min – 1×/sem |
| **Literarius REST** | HTTP/1983 | Pedidos (write!), Produtos, Estoque, Parceiros, NFs | On-demand |
| **Tray API** | HTTPS REST | Pedidos, Pagamentos, Estoque, Clientes, Catálogo | 15min polling + webhooks |
| **Tray Webhooks** | HTTPS POST (push) | 10 eventos em tempo real | Instantâneo |
| **Qive** | HTTPS REST | NF-e recebidas da SEFAZ | 1×/dia |
| **Santander OFX** | Upload manual (futuro: API) | Extratos bancários | 1×/dia |

### Camada 2 — Processamento (Sync Agent + Edge Functions)

| Componente | Onde roda | Responsabilidade |
|---|---|---|
| **Sync Agent** | Raspberry Pi (LAN) | Ler Literarius → upsert Supabase; Ler/Escrever Tray |
| **Webhook Receiver** | Supabase Edge Function | Receber webhooks Tray + processar em tempo real |
| **Cron Jobs** | Supabase (cron) | Briefing 7h, alertas periódicos, relatórios |
| **Matching Engine** | Supabase Edge Function | Conciliação OFX × Títulos (fuzzy match) |
| **AI Router** | Supabase Edge Function | Chat MCP → query SQL → resposta Claude |

### Camada 3 — Armazenamento (Supabase PostgreSQL)

| Schema | Tabelas | Propósito |
|---|---|---|
| `lit_*` | 15 tabelas espelho | Réplica read-only do Literarius (para queries rápidas) |
| `tray_*` | 5 tabelas espelho | Réplica dos dados Tray (enriquecida com JOINs) |
| `ops_*` | Workflow tables | Estado operacional (aprovações, batches, filas) |
| `analytics_*` | Views materializadas | KPIs pré-calculados para o dashboard |

### Camada 4 — Apresentação (React + Vite)

| Módulo | Telas | Audiência |
|---|---|---|
| **Dashboard CEO** | Posição financeira, DRE, Canais, Alertas, Cash Flow | CEO |
| **Financeiro** | A/P, A/R, Aprovações, CNAB, Conciliação | Financeiro |
| **Estoque** | Posição, Giro, Cobertura, Alertas de reposição | Operação |
| **Assistente** | Chat em linguagem natural | Todos |
| **Admin** | Configuração de alertas, regras, usuários | TI / CEO |

---

## Fluxos Completos — Ciclo de Vida dos Dados

### FLUXO 1: Venda no E-commerce (end-to-end)

```mermaid
sequenceDiagram
    participant CLIENTE as Cliente
    participant TRAY as Tray Loja
    participant WH as Webhook
    participant SUPA as Supabase
    participant PI as Sync Agent
    participant LIT as Literarius
    participant DEPO as Depósito
    participant TEAMS as Teams

    CLIENTE->>TRAY: Compra livro (checkout)
    TRAY->>WH: order.insert (pedido criado)
    WH->>SUPA: Upsert tray_orders (status: pendente)
    
    Note over TRAY: Gateway processa pagamento
    TRAY->>WH: transaction.update (status: approved)
    WH->>SUPA: Update tray_orders (status: aprovado)
    SUPA->>TEAMS: 🔔 "Pedido #X aprovado - R$Y"
    
    Note over PI: Sync a cada 30min
    PI->>LIT: SELECT vwPedidoVenda WHERE SiteIdPedido = X
    PI->>SUPA: Enrich tray_orders com lit_pedido_id
    
    Note over DEPO: Separação física
    DEPO->>LIT: Fatura pedido → gera NF + TituloFinanceiro
    
    PI->>LIT: Detecta nova NF com SiteIdPedido
    PI->>TRAY: POST /invoices {access_key: NFeChave}
    PI->>SUPA: Update tray_orders (nf_vinculada: true)
    
    DEPO->>TRAY: Registra código de rastreio
    TRAY->>WH: order.update (sending_code preenchido)
    WH->>SUPA: Update tray_orders (rastreio: BR123...)
    TRAY->>CLIENTE: Email com rastreio
```

**Resultado:** O CEO vê no dashboard:
- Pedido apareceu, foi aprovado, teve NF emitida, foi enviado
- Receita líquida = `price_seller` (após taxa do gateway)
- Título financeiro gerado automaticamente no Literarius

---

### FLUXO 2: Sync de Estoque (Literarius → Tray)

```mermaid
sequenceDiagram
    participant LIT as Literarius
    participant PI as Sync Agent
    participant SUPA as Supabase
    participant TRAY as Tray Loja
    participant TEAMS as Teams

    Note over PI: Timer a cada 30min
    PI->>LIT: SELECT Codigo, QtdeDisponivel FROM vwProdutoEstoque WHERE DataAlt > @lastSync
    LIT-->>PI: [produtos com mudança de saldo]
    
    loop Para cada produto com SiteID
        PI->>TRAY: PUT /products/{SiteID}/stock {quantity: QtdeDisponivel}
        TRAY-->>PI: 200 OK
    end
    
    PI->>SUPA: Log sync (timestamp, qtd_produtos, erros)
    
    alt Produto com estoque = 0
        PI->>SUPA: Alerta: produto zerado
        SUPA->>TEAMS: ⚠️ "Produto X zerou no estoque"
    end
    
    alt Produto abaixo do mínimo
        PI->>SUPA: Alerta: reposição necessária
        SUPA->>TEAMS: 📦 "Produto X abaixo do mínimo (15 un, mín: 50)"
    end
```

**Regras de negócio:**
- Usar `QtdeDisponivel` (não saldo bruto) — exclui reservados
- Só sincronizar produtos com `SiteID` preenchido (já cadastrados na Tray)
- Se estoque = 0 → produto fica "esgotado" na loja (não remove)
- Rate limit: 180 req/min → batch de ~150 produtos/ciclo com margem

---

### FLUXO 3: DRE Automático (Mensal)

```mermaid
graph TD
    A[TituloFinanceiroBaixaRateio] -->|soma por PlanoConta| B[Receitas]
    A -->|soma por PlanoConta| C[Despesas]
    D[Tray payments.price_seller] -->|receita líquida e-commerce| B
    E[DireitoAutoralFechamentoItens] -->|royalties pagos| C
    F[NotaFiscalItens.custo] -->|CMV| C
    
    B --> G[Receita Bruta]
    G -->|menos| H[Deduções: devoluções + impostos]
    H --> I[Receita Líquida]
    I -->|menos| C
    C --> J[EBITDA]
    J -->|menos depreciação| K[Resultado do Período]
    
    style G fill:#4CAF50,color:#fff
    style K fill:#2196F3,color:#fff
```

**Fontes por linha do DRE:**

| Linha DRE | Fonte Literarius | Fonte Tray | Cálculo |
|---|---|---|---|
| **Receita Bruta** | `SUM(NotaFiscal.TotalNota)` WHERE EntSai='S' | — | Todas as NFs de saída do período |
| **(−) Devoluções** | `SUM(NotaFiscal.TotalNota)` WHERE EntSai='E' + motivo devolução | — | NFs de entrada por devolução |
| **(−) Impostos** | `SUM(NotaFiscalItens.IcmsValor + PisValor + CofinsValor)` | — | ⚠️ Livros = 0% (imune) — verificar outros produtos |
| **= Receita Líquida** | Calculado | — | |
| **(−) CMV** | `SUM(EntradaItens.CustoUnitario × qtde vendida)` + Royalties | — | Custo gráfico + autoral |
| **(−) Taxa gateway** | — | `SUM(price_payment - price_seller)` | Exclusivo Tray |
| **= Lucro Bruto** | Calculado | | |
| **(−) Despesas Operacionais** | `SUM(TituloFinanceiroBaixaRateio)` por centro de resultado | — | Rateio por PlanoConta |
| **= EBITDA** | Calculado | | |

> ⚠️ **Bloqueio atual:** `PlanoConta.TipoCategoria = 'A'` em todos os registros. Sem corrigir isso, o DRE não consegue separar receitas de despesas automaticamente. **Workaround:** usar `CentroResultado` para segmentar por departamento.

---

### FLUXO 4: Aprovação de Pagamentos

```mermaid
stateDiagram-v2
    [*] --> Pendente: Título criado no Literarius (TipoTitulo=P, Pago=0)
    Pendente --> AutoAprovado: valor < R$5.000
    Pendente --> AguardandoCEO: valor >= R$5.000
    
    AguardandoCEO --> Aprovado: CEO aprova no HeziomOS
    AguardandoCEO --> Rejeitado: CEO rejeita
    AguardandoCEO --> Pendente: Solicita esclarecimento
    
    AutoAprovado --> NoBatch: Adicionado ao batch CNAB do dia
    Aprovado --> NoBatch: Adicionado ao batch CNAB do dia
    
    NoBatch --> CNABGerado: Edge Function gera arquivo CNAB 240
    CNABGerado --> Enviado: Upload manual ao Santander
    Enviado --> Pago: Confirmação bancária (OFX)
    
    Rejeitado --> [*]
    Pago --> [*]
```

**Regras de alçada:**

| Valor | Aprovação | SLA |
|---|---|---|
| < R$ 1.000 | Automática | Imediato |
| R$ 1.000 – R$ 5.000 | Financeiro | 24h |
| R$ 5.000 – R$ 20.000 | CEO | 48h |
| > R$ 20.000 | CEO + confirmação adicional | 72h |

---

### FLUXO 5: Conciliação Bancária

```mermaid
graph LR
    A[Upload OFX<br>Extrato Santander] --> B[Parse lançamentos]
    B --> C{Match Engine}
    
    C -->|Score > 90%| D[Auto-conciliado ✅]
    C -->|Score 60-90%| E[Sugestão para revisão 🟡]
    C -->|Score < 60%| F[Manual ❌]
    
    D --> G[bank_reconciliations<br>status: matched]
    E --> H[Fila de revisão<br>Financeiro analisa]
    F --> I[Sem match<br>Investigar origem]
    
    H -->|Confirma| G
    H -->|Rejeita| I
```

**Algoritmo de matching:**
1. Buscar `TituloFinanceiroBaixa` com `ValorBaixa ≈ lançamento.valor` (±R$0,50)
2. Data da baixa ≈ data do lançamento (±3 dias úteis)
3. Se ambos batem → score = 95%
4. Se valor bate mas data difere > 5 dias → score = 70%
5. Se nenhum título bate → verificar se é transferência entre contas (ContaBancaria → ContaBancaria)

**Meta:** >95% de conciliação automática em estado estável.

---

### FLUXO 6: Briefing Diário (7h)

```mermaid
graph TD
    A[Cron 7h] --> B[Edge Function: gerar_briefing]
    
    B --> C[Query: Saldo bancário<br>SUM ContaBancaria.Saldo]
    B --> D[Query: A/R vencendo hoje + 7d<br>TituloFinanceiro WHERE TipoTitulo=R]
    B --> E[Query: A/P vencendo hoje + 7d<br>TituloFinanceiro WHERE TipoTitulo=P]
    B --> F[Query: Alertas ativos<br>ops_alerts WHERE resolved=false]
    B --> G[Query: Faturamento MTD<br>SUM NotaFiscal.TotalNota]
    B --> H[Query: Pedidos Tray pendentes<br>tray_orders WHERE status=pendente]
    
    C --> I[Compor Card Teams]
    D --> I
    E --> I
    F --> I
    G --> I
    H --> I
    
    I --> J[POST Teams Webhook<br>Canal: CEO-Briefing]
```

**Formato do card:**
```
📊 Briefing HeziomOS — 19/Mai/2026

💰 Saldo bancário: R$ XXX.XXX
📈 Faturamento MTD: R$ 339.881 (+42% vs Abr)
📥 A receber (7d): R$ XX.XXX (Y títulos)
📤 A pagar (7d): R$ XX.XXX (Z títulos)
🛒 Pedidos Tray pendentes: N
⚠️ Alertas: 3 (1 crítico, 2 atenção)

[Ver Dashboard →]
```

---

### FLUXO 7: Assistente IA (Chat MCP)

```mermaid
sequenceDiagram
    participant CEO
    participant REACT as Frontend React
    participant EDGE as Edge Function
    participant CLAUDE as Claude API
    participant DB as Supabase DB
    participant MEM as pgvector (Memória)

    CEO->>REACT: "Qual foi o faturamento por canal esse mês?"
    REACT->>EDGE: POST /chat {message, session_id}
    
    EDGE->>MEM: Buscar contexto relevante (embedding similarity)
    MEM-->>EDGE: [contexto anterior, preferências]
    
    EDGE->>CLAUDE: System prompt + contexto + schema + pergunta
    CLAUDE-->>EDGE: SQL sugerido + resposta natural
    
    EDGE->>DB: Executar query segura (RLS + read-only)
    DB-->>EDGE: Resultados
    
    EDGE->>CLAUDE: Resultados + "formatar para o CEO"
    CLAUDE-->>EDGE: Resposta formatada
    
    EDGE->>MEM: Salvar interação (embedding)
    EDGE-->>REACT: Resposta + dados + gráfico sugerido
    REACT->>CEO: Card com texto + tabela/gráfico
```

**Guardrails:**
- Queries sempre com `LIMIT 1000` e `timeout 5s`
- Não executar UPDATE/DELETE (apenas SELECT)
- Prefixo de contexto: "Você é o assistente financeiro da Heziom, editora cristã..."
- Memória via pgvector: últimas 50 interações + preferências do CEO

---

### FLUXO 8: Catálogo Automático (Literarius → Tray)

```mermaid
graph TD
    A[Novo livro no Literarius<br>DataLancamento próxima] --> B[Sync Agent detecta<br>DataAlt > lastSync]
    
    B --> C{SiteID preenchido?}
    C -->|Sim| D[PUT /products/:id<br>Atualizar dados]
    C -->|Não| E[POST /products<br>Criar novo na Tray]
    
    E --> F[Tray retorna product.id]
    F --> G[Gravar SiteID no Literarius<br>via REST PUT?]
    
    D --> H[Mapear BISAC → Categoria Tray]
    E --> H
    
    H --> I[PUT /products/:id<br>Assign categories + brand]
    
    I --> J[Upload imagens<br>POST /products/:id/images]
    J --> K[PUT /products/:id/stock<br>Saldo inicial]
    
    K --> L[Produto publicado na loja ✅]
    
    style L fill:#4CAF50,color:#fff
```

**Dados do livro enviados à Tray:**

| Campo Tray | Origem Literarius | Observação |
|---|---|---|
| `name` | `Produto.Titulo` | |
| `description` | `Produto.Sinopse` | HTML permitido |
| `price` | `ProdutoPreco.Preco` (vigente) | |
| `reference` | `Produto.CodigoIsbn` | ISBN como referência |
| `ean` | `Produto.CodigoBarras` | Para leitores de código |
| `weight` | `Produto.Peso` | Em kg (para frete) |
| `height/width/depth` | `Produto.Altura/Largura/Profundidade` | Em cm |
| `stock` | `Estoque.QtdeDisponivel` | Disponível (não bruto) |
| `categories` | Mapeamento BISAC → category_id | |
| `brand` | `Produto.EditoraFantasia` → brand_id | |
| `images` | `Produto.Imagem1..7` URLs | |

---

### FLUXO 9: Consignação e Aging

```mermaid
graph TD
    A[Literarius: Consignacao<br>50 contratos, 3.360 itens] --> B[Sync Agent<br>1×/dia]
    B --> C[Supabase: lit_consignacao]
    
    C --> D{Contrato vencido?<br>DataFim < hoje}
    D -->|Sim| E[Alerta: Consignação vencida<br>Solicitar devolução ou acerto]
    D -->|Não| F{Vendas sem acerto?<br>QtdeVendida > 0 AND sem NF}
    
    F -->|Sim| G[Alerta: Acerto pendente<br>R$ X em vendas não faturadas]
    F -->|Não| H[OK — monitorar]
    
    E --> I[Teams: 🚨 Consignação vencida]
    G --> J[Teams: 💰 Acerto de consignação pendente]
    
    C --> K[Dashboard: Aging de Consignação]
    K --> L[Gráfico: R$ por faixa de tempo<br>0-30d / 30-60d / 60-90d / >90d]
```

---

### FLUXO 10: Score de Saúde Financeira

```mermaid
graph LR
    A[Cash Score<br>40%] --> E[Health Score<br>0-100]
    B[Margin Score<br>25%] --> E
    C[Receivables Score<br>20%] --> E
    D[Approvals Score<br>15%] --> E
    
    style E fill:#2196F3,color:#fff
```

**Cálculo:**

| Componente | Peso | 100 pontos | 0 pontos |
|---|---|---|---|
| **Cash** | 40% | Saldo > 3 meses de despesa | Saldo < 1 semana de despesa |
| **Margem** | 25% | Margem bruta > 80% | Margem < 50% |
| **Recebíveis** | 20% | <10% vencido | >50% vencido |
| **Aprovações** | 15% | 0 pendências > 48h | >10 pendências atrasadas |

**Alerta por faixa:**
- 80-100: 🟢 Saudável
- 60-79: 🟡 Atenção — monitorar semanalmente
- 40-59: 🟠 Risco — ação corretiva em 7 dias
- 0-39: 🔴 Crítico — ação imediata

---

## Modelo de Dados Unificado (Supabase)

```mermaid
erDiagram
    lit_pedido_venda ||--|{ lit_pedido_venda_itens : itens
    lit_pedido_venda ||--o| lit_nota_fiscal : fatura
    lit_nota_fiscal ||--|{ lit_titulo_financeiro : gera
    lit_titulo_financeiro ||--o{ lit_titulo_financeiro_baixa : paga
    lit_titulo_financeiro ||--|{ lit_titulo_financeiro_rateio : rateia
    
    tray_orders ||--o| lit_pedido_venda : "SiteIdPedido"
    tray_orders ||--|{ tray_payments : pagamento
    tray_orders ||--o| tray_invoices : "NF vinculada"
    
    lit_produto ||--o| tray_products : "SiteID"
    lit_estoque }|--|| lit_produto : saldo
    
    lit_titulo_financeiro_baixa ||--o| bank_reconciliations : concilia
    bank_statements ||--|{ bank_reconciliations : match
    
    payment_approvals ||--|| lit_titulo_financeiro : "titulo_id"
    payment_approvals ||--o| cnab_batches : "batch_id"
```

---

## Stack Tecnológica Confirmada

| Camada | Tecnologia | Justificativa |
|---|---|---|
| **Frontend** | React 18 + Vite + shadcn/ui (Tailwind) | Lovable-compatible; fast; customizable |
| **Deploy frontend** | Netlify | Auto-deploy GitHub; preview branches |
| **Backend** | Supabase Edge Functions (Deno) | Serverless; cold start <100ms |
| **Database** | PostgreSQL 14+ (Supabase managed) | RLS; pgvector; JSON nativo |
| **Auth** | Supabase Auth | 3 roles: CEO, Financeiro, Analista |
| **Sync runtime** | Deno (Raspberry Pi) | Leve; npm:mssql nativo; single binary |
| **Sync scheduling** | systemd timers | Robusto; auto-restart; logs via journald |
| **Alerting** | MS Teams Incoming Webhooks | Já usado pela Heziom |
| **AI** | Claude API (Sonnet/Haiku) | Chat MCP + análise de dados |
| **Embeddings** | pgvector (Supabase) | Memória do assistente |
| **CNAB** | Geração local (Deno) | Formato Santander CNAB 240 |
| **Monitoring** | Supabase logs + sync-watchdog | Alert se Pi silencioso >2h |

---

## Cronograma de Implementação

### Fase 1 — Fundação (4–6 semanas)

| Semana | Entrega | Dependência |
|---|---|---|
| S1 | Provisionar Supabase + schema inicial + GitHub repo | — |
| S1 | Adquirir Pi + setup Deno + conectar Literarius | — |
| S2 | Sync Agent v1: TituloFinanceiro + ContaBancaria | Pi rodando |
| S2 | Sync Agent v1: PedidoVenda + NotaFiscal + Estoque | Pi rodando |
| S3 | Frontend: Dashboard CEO (posição financeira + DRE) | Sync rodando |
| S3 | Edge Function: Briefing 7h Teams | Sync rodando |
| S4 | Tray: obter access_token + testar GET /orders | Loja desbloqueada |
| S4 | Sync Tray: orders + payments → Supabase | Token obtido |
| S5 | PUT /stock: Literarius → Tray (Fase 1.1 do Roadmap) | Tray ativo |
| S5 | POST /invoices: NF → Tray (Fase 1.4) | Tray ativo |
| S6 | Dashboard: Faturamento por canal + Health Score | Dados completos |

### Fase 2 — Inteligência (6–10 semanas após Fase 1)

| Entrega | Complexidade |
|---|---|
| Workflow de aprovação de pagamentos | Média |
| Conciliação bancária (OFX import + match) | Alta |
| Webhooks Tray em tempo real | Média |
| Sync catálogo Literarius → Tray | Média |
| Chat MCP (Claude API + pgvector) | Alta |
| Painel de logística (rastreio) | Baixa |
| Cupons e ROI de marketing | Baixa |

### Fase 3 — Autonomia (3–6 meses após Fase 2)

| Entrega | Complexidade |
|---|---|
| Geração CNAB 240 automática | Média |
| Conciliação >95% sem intervenção | Alta |
| Publicação no Marketplace Tray (HeziomOS como produto) | Média |
| Multi-CD estoque | Baixa |
| Tema editorial para marketplace (projeto paralelo Trivia) | Alta |
| Royalty provisioning automático | Média |

---

## Decisões Pendentes (para alinhar com Heziom)

| # | Decisão | Opções | Impacto |
|---|---|---|---|
| 1 | **Quem compra o Raspberry Pi?** | Trivia inclui no projeto / Heziom compra | Setup da Fase 1 |
| 2 | **Supabase: plano Free ou Pro?** | Free (500MB, 2 Edge Functions) vs Pro ($25/mês, 8GB, unlimited) | Escala do banco |
| 3 | **Alçada de aprovação:** valores exatos | R$1k/5k/20k sugeridos — CEO confirma? | Workflow de pagamentos |
| 4 | **Corrigir PlanoConta.TipoCategoria** | Equipe Literarius corrige / HeziomOS faz workaround | DRE automático |
| 5 | **6 views otimizadas** | Literarius cria / HeziomOS faz JOINs direto | Performance do sync |
| 6 | **Tema da Tray: fazer ou não agora?** | Agora (paralelo) / Depois da homologação do app | Oportunidade de mercado |
| 7 | **Chat MCP: Claude Sonnet ou Haiku?** | Sonnet (melhor) / Haiku (mais barato, R$0,25/call) | Custo vs qualidade |

---

## Referências

- [[00 - Índice]] — mapa central do vault
- [[Fontes de Dados/Mapa Completo de APIs e Capacidades]] — inventário técnico
- [[Projeto/Roadmap de Integração Tray × Literarius]] — roadmap de integração
- [[Decisões/ADR-001 — Sync Agent no Raspberry Pi]] — decisão de infra
- [[Decisões/ADR-002 — Segurança do Sync Agent]] — modelo de segurança
- [[Projeto/Dashboard CEO — Análise Maio 2026]] — KPIs reais validados
- [[Financeiro/Mapa de Dados]] — cruzamento módulos × fontes

---

*Proposta consolidada em 2026-05-19 — JG Novais (Trivia)*
*Baseada em análise completa do vault (150+ arquivos, 2 sessões de trabalho)*
