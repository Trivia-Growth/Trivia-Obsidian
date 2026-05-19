---
tags: [projeto, apis, gaps, capacidades]
status: ativo
criado: 2026-05-18
---

# HeziomOS — Estudo de APIs: O que entregamos, o que falta, o que não conseguimos

> Análise cruzada entre os requisitos do projeto (Arquitetura + Doc Técnico) e as APIs disponíveis: **Literarius**, **Tray** e **Mandaê**.  
> Objetivo: clareza sobre o que podemos construir agora, o que precisa de trabalho extra e o que está fora do alcance das APIs.

---

## 1. APIs Disponíveis — Resumo de Capacidades

### 1.1 Literarius API (ERP)
- **Base URL:** `http://200.187.66.71:1983/LiterariusAPI.dll/datasnap/rest`
- **Auth:** HTTP Basic + header `USER_LITERARIUS`
- **Acesso:** Produção ativo, credenciais em mãos
- **Paginação:** Não existe — retorna todos os registros sem ID. **Crítico para uso em volume.**
- **Documentação:** [[Fontes de Dados/Literarius/APIs/Literarius-API-Documentacao]]

| Controller               | Operações disponíveis                                                               |
| ------------------------ | ----------------------------------------------------------------------------------- |
| `TPedidoVendaController` | GET pedido por ID, GET status, **PUT inserir/atualizar pedido**, POST  mudar status |
| `TParceiroController`    | GET parceiro, GET tipos de cliente, GET empresa                                     |
| `TProdutoController`     | GET produto por código ou EAN, GET tipo/grupo/gênero/idioma/autor                   |
| `TEstoqueController`     | GET saldo por empresa/setor/produto; GET por box (WMS)                              |
| `TNotaFiscalController`  | GET nota fiscal por ID                                                              |

**Dados confirmados em produção:**
- Pedidos com `siteIdPedido` (chave de conciliação com Tray)
- Transportadora Mandaê vinculada nos pedidos (`transportadoraNome: "MANDAÊ"`)
- Estoque com saldo real (produto 1 = 1228 unidades)
- Produtos com ISBN, EAN, preço com vigência, autores, dimensões
- NF-e modelo 55 com natureza de operação, emitente, destinatário

**Limitação crítica:** A API Literarius é a face pública do ERP. Dados financeiros profundos (TituloFinanceiro, ContaBancaria, PlanoConta, DRE) **não estão expostos pela API** — apenas pelo SQL Server direto (`192.168.18.10:1433`). A arquitetura correta para esses dados é o **Deno sync script local**, conforme decidido.

---

### 1.2 Tray API (E-commerce)
- **Base URL:** `https://{api_address}/web_api/v2/`
- **Auth:** `access_token` (query param ou header)
- **Rate limit:** 180 req/min · 10.000 req/dia (padrão)
- **Documentação:** [[Fontes de Dados/Tray/_a mapear]]

| Endpoint | Dados disponíveis |
|---|---|
| `GET /orders` | Pedidos com filtro por data, status, cliente; receita bruta, frete, desconto |
| `GET /orders/:id/complete` | Pedido completo: produtos, pagamento, entrega |
| `GET /payments` | Status de liquidação, parcelas, taxas da gateway |
| `GET /payment-options` | Métodos de pagamento disponíveis |
| `GET /invoices` | NFs emitidas pelo e-commerce |
| `PUT /orders/:id` | Atualizar status, rastreio |
| Webhooks | Notificações em tempo real para novos pedidos, pagamentos, etc. |

**Chave de conciliação:**
```
Tray: order.id  ←→  Literarius: PedidoVenda.SiteIdPedido
```

**Gateway de pagamento:** APPMAX (substituiu Pagar.me). Taxas e repasses virão via `GET /payments`.

---

### 1.3 Mandaê API (Logística)
- **Base URL:** `https://api.mandae.com.br/`
- **Auth:** Bearer token via header `Authorization`
- **Sandbox:** `https://sandbox.api.mandae.com.br/`
- **Documentação:** [[Fontes de Dados/Mandae/Mandaê]]

| Endpoint | Função |
|---|---|
| `POST /v4/postalcodes/{CEP}/rates` | Cotação de frete por CEP e dimensões |
| `POST /v2/orders/add-parcel` | Registrar encomenda para coleta |
| `GET /v3/trackings/{trackingCode}` | Histórico completo de rastreamento |
| Webhook `Item Processado` | Notificação quando encomenda é expedida |

---

## 2. O Que Conseguimos Entregar com as APIs Atuais

### ✅ Módulos 100% viáveis

| Módulo                                 | Fonte de dados               | Como                                                             |
| -------------------------------------- | ---------------------------- | ---------------------------------------------------------------- |
| **Dashboard CEO — Posição de Estoque** | Literarius API `/Estoque`    | GET saldo por produto em tempo real                              |
| **Catálogo de Produtos**               | Literarius API `/Produto`    | Títulos, ISBN, preço vigente, autores, estoque                   |
| **Faturamento por Canal (e-commerce)** | Tray `/orders`               | `total`, `date`, `status`; filtrar `status=aprovado` por período |
| **Pedidos Tray → Literarius**          | Tray + Literarius            | `order.id = SiteIdPedido`; cruzar status, NF, rastreio           |
| **Status de pedidos em tempo real**    | Tray Webhooks                | Eventos de novo pedido, pagamento confirmado, cancelamento       |
| **Rastreamento de entregas**           | Mandaê `/trackings`          | Histórico de eventos por `trackingCode`                          |
| **Cotação de frete**                   | Mandaê `/postalcodes/rates`  | Simular frete antes de confirmar pedido                          |
| **Registro de encomendas na Mandaê**   | Mandaê `/orders/add-parcel`  | Automatizar após geração de NF no Literarius                     |
| **Webhook expedição**                  | Mandaê Item Processado       | Capturar `trackingCode` e atualizar pedido no Literarius         |
| **Consulta de parceiros/clientes**     | Literarius API `/Parceiro`   | Segmentação por tipo (Igrejas, Livrarias, Distribuidoras, PF...) |
| **NF-e de saída (consulta)**           | Literarius API `/NotaFiscal` | Número, chave, emitente, natureza                                |

---

### ⚠️ Módulos viáveis com limitações ou trabalho extra

| Módulo | Situação | O que falta |
|---|---|---|
| **DRE Automático** | Bloqueado até correção no Literarius | `PlanoConta.TipoCategoria = 'A'` em todos os 115 registros. API não expõe TituloFinanceiro — precisa SQL direto + correção no ERP |
| **Conciliação Bancária** | Parcialmente viável | Extrato OFX vem do banco (upload manual ou API Santander, não disponível via APIs atuais). TituloFinanceiroBaixa só via SQL direto |
| **Aprovação de Pagamentos** | Viável pela interface HeziomOS | Dados de A/P vêm do SQL direto; API Literarius não expõe TituloFinanceiro |
| **Faturamento multi-canal completo** | Parcial | Tray cobre e-commerce; vendas físicas/consignações/distribuidoras ficam no Literarius SQL |
| **Comissões e Repasses Tray** | Viável via `GET /payments` | Taxas APPMAX devem ser mapeadas; prazo de repasse D+? ainda não confirmado |
| **Sincronização Literarius → Supabase (financeiro)** | Requer Deno local | API não expõe dados financeiros. Script local com `npm:mssql` lê SQL Server diretamente |
| **NF-e Recebidas (Qive)** | Não coberto pelas 3 APIs | Requer integração Qive separada |
| **Pedidos com paginação** | Risco de timeout | Literarius sem paginação nativa; Tray tem `?limit=50&page=1` |

---

### ❌ O Que as APIs Não Respondem

| Necessidade do projeto | Por quê não é coberta | Alternativa |
|---|---|---|
| **Saldo bancário em tempo real** | Nenhuma das 3 APIs acessa contas bancárias | SQL direto: `ContaBancaria` + `ContaBancariaLancamento` no Literarius |
| **Contas a Pagar / Receber (TituloFinanceiro)** | Não exposto pela Literarius API | SQL direto + Deno sync |
| **DRE / Plano de Contas** | Não exposto pela API | SQL direto (`PlanoConta`, `CentroResultado`) + correção `TipoCategoria` |
| **Baixas financeiras (liquidações)** | Não exposto pela API | SQL direto: `TituloFinanceiroBaixa` |
| **Extrato bancário OFX** | Nenhuma das 3 APIs fornece extrato | Upload manual (MVP) ou API bancária Santander (Fase 2) |
| **NF-e recebidas de fornecedores** | Fora do escopo Literarius API e Tray | Qive API (integração separada, Fase 2) |
| **Manifesto SEFAZ (Ciência da Operação)** | Fora do escopo | Via Qive |
| **CNAB 240 (remessa de pagamentos)** | Nenhuma API gera CNAB | Gerado internamente pelo HeziomOS com dados do SQL |
| **Comissões internas (vendedores)** | Não exposto pela API | SQL direto: `ComissaoParametro` |
| **Inventário por setor / consignações (detalhe)** | API de estoque retorna saldo; sem aging de consignação | SQL direto para consignações abertas |
| **Marketplaces ML / Amazon** | Não disponível | Fase 2 (Mercado Pago + Amazon Seller API) |
| **Bookwire (eBooks)** | Relatório externo mensal | Upload manual → sugestão de NFs (Fase 3) |
| **Alertas Teams** | Nenhuma das 3 APIs tem essa saída | MS Teams Incoming Webhook (implementado pelo HeziomOS) |
| **Score de saúde financeira** | Calculado — não fornecido por API | HeziomOS calcula a partir de múltiplas fontes |

---

## 3. Mapeamento por Módulo do Projeto

### Fase 1 — Visibilidade (MVP)

| Story | Fonte Principal | Status das APIs |
|---|---|---|
| STORY-001 Setup Infra | — | ✅ Independente de APIs |
| STORY-002 Sync TituloFinanceiro + ContaBancaria | SQL direto (Deno) | ⚠️ APIs não cobrem — Deno local obrigatório |
| STORY-003 Sync NotaFiscal + PedidoVenda | Literarius API + SQL | ✅ API cobre NF e Pedidos; Deno para volume e financeiro |
| STORY-004 Dashboard CEO — Posição Financeira | SQL direto + Tray | ⚠️ Saldo bancário e A/R só via SQL; faturamento Tray via API |
| STORY-005 Dashboard CEO — DRE MTD | SQL direto | ❌ Bloqueado: PlanoConta.TipoCategoria inválido no Literarius |
| STORY-006 Alertas Teams Briefing 7h | SQL + Tray + Teams Webhook | ⚠️ Dados de caixa requerem SQL; Tray API disponível |

### Fase 2 — Inteligência Assistida

| Módulo | Fonte | Status |
|---|---|---|
| Aprovação de Pagamentos | SQL direto | ⚠️ Não coberto por API — SQL direto |
| Conciliação Bancária | OFX + SQL | ⚠️ OFX externo; SQL para baixas |
| Chat MCP (Assistente) | Literarius API + Tray API | ✅ APIs viáveis como ferramentas do agente |
| Score de Saúde Financeira | Cálculo interno | ✅ Calculado a partir de dados já sincronizados |
| Fluxo de Caixa Projetado | SQL direto | ⚠️ Requer A/R e A/P via SQL |
| Faturamento por Canal | Tray API + Literarius API | ✅ Ambas disponíveis |
| Qive NF-e | Qive API | ❌ Integração separada ainda não mapeada |

---

## 4. Fluxo de Integração Consolidado

```
┌─────────────────────────────────────────────────────────────┐
│                    FONTES DE DADOS                          │
├──────────────┬──────────────────┬───────────────────────────┤
│  Literarius  │      Tray        │         Mandaê            │
│  API (HTTP)  │   API (HTTP)     │       API (HTTP)          │
│              │                  │                           │
│  Pedidos     │  Pedidos         │  Rastreamento             │
│  Produtos    │  Pagamentos      │  Cotação frete            │
│  Estoque     │  NFs e-commerce  │  Registro encomendas      │
│  NF saída    │  Webhooks        │  Webhook expedição        │
│  Parceiros   │                  │                           │
├──────────────┴──────────────────┴───────────────────────────┤
│          Literarius SQL Server (via Deno local)             │
│                                                             │
│  TituloFinanceiro   ContaBancaria   PlanoConta              │
│  TituloFinanceiroBaixa   NotaFiscal   PedidoVenda           │
│  ComissaoParametro   CentroResultado                        │
└─────────────────────────────────────────────────────────────┘
                         │
                   Deno sync local
                   (rede Heziom)
                         │
                         ▼
            ┌────────────────────────┐
            │   Supabase PostgreSQL  │
            │   (HeziomOS DB)        │
            └────────────┬───────────┘
                         │
              Edge Functions (Deno)
                         │
                         ▼
            ┌────────────────────────┐
            │   HeziomOS Frontend    │
            │   React + Vite         │
            │   CEO Dashboard        │
            │   Módulos Financeiros  │
            └────────────────────────┘
```

---

## 5. Pendências Críticas

### Técnicas (bloqueiam desenvolvimento)

| # | Pendência | Impacto | Responsável |
|---|---|---|---|
| P1 | Corrigir `PlanoConta.TipoCategoria` no Literarius — hoje `'A'` em todos os 115 registros | Bloqueia DRE automático (STORY-005) | Equipe Literarius |
| P2 | Criar as 6 views SQL otimizadas no Literarius | Performance do Deno sync; sem views, queries brutas são lentas e pesadas | Equipe Literarius |
| P3 | Definir máquina Heziom para rodar Deno sync | Bloqueia toda sincronização de dados financeiros (STORY-002, 003) | Heziom (infra interna) |
| P4 | Token de produção Mandaê | Sem ele, não há como registrar encomendas nem rastrear via API | Heziom (solicitar à Mandaê) |
| P5 | `access_token` Tray de produção | Sem ele, não há como buscar pedidos e pagamentos via API | Heziom (painel Tray) |
| P6 | Literarius API sem paginação | Endpoints sem ID retornam todos os registros — risco de timeout e sobrecarga em produção | Workaround: sempre filtrar por ID; Deno sync lida com SQL paginado |

### De Negócio (impactam escopo)

| # | Pendência | Impacto |
|---|---|---|
| N1 | Threshold de alçada para aprovação de pagamentos | Define regra do Fluxo 2 |
| N2 | Prazo de repasse Tray (D+?) | Define trigger de alerta de atraso no repasse |
| N3 | Disponibilidade de OFX no Santander | Define se conciliação bancária pode ser automatizada ou é upload manual |
| N4 | Amazon Full vs Normal — são sellers distintos? | Define como modelar reconciliação marketplace |

---

## 6. O Que Ainda Precisa Ser Mapeado

| Integração | Status | Próximo passo |
|---|---|---|
| **Qive API** | Não mapeada | Solicitar documentação e credenciais; relevante para Fase 2 |
| **Santander API Bancária** | Não mapeada | Verificar disponibilidade de OFX/extrato via API (Fase 2) |
| **Mercado Livre / Amazon Seller** | Não mapeada | Fase 2 — após Fase 1 consolidada |
| **WhatsApp API** | Citada no doc técnico | Não está no roadmap financeiro atual; avaliar escopo |
| **Meta Ads** | Citada no doc técnico | Não está no roadmap atual |
| **Tray — Taxas APPMAX detalhadas** | Parcialmente mapeado | Mapear estrutura de `GET /payments` em produção para entender repasses líquidos |
| **Literarius — Campos de consignação** | Não mapeado via API | TipoPedido=2 no SQL; aging dos R$1,15M requer SQL direto |

---

## 7. Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Literarius API retorna todos os pedidos sem filtro de data | Alta | Alto | Sempre chamar com ID específico; volume via SQL/Deno |
| DRE bloqueado indefinidamente por PlanoConta incorreto | Média | Alto | STORY-005 depende de correção externa; mover para pós-Fase 1 |
| Mandaê sem token de produção no início | Média | Médio | Desenvolver com sandbox primeiro |
| Tray APPMAX — estrutura de repasse desconhecida | Alta | Médio | Mapear manualmente antes de automatizar conciliação |
| Deno sync local — máquina offline = sem dados financeiros | Alta | Alto | Monitorar a máquina; considerar retry e alertas de falha de sync |

---

## 8. Referências

- [[HeziomOS — Arquitetura]] — diagrama completo, stack, fases
- [[Fontes de Dados/Literarius/APIs/Literarius-API-Documentacao]] — API Literarius documentada em produção
- [[Fontes de Dados/Mandae/Mandaê]] — API Mandaê documentada
- [[Fontes de Dados/Tray/_a mapear]] — índice Tray API
- [[Projeto/Backlog]] — stories por fase e status
- Documento técnico original: `Heziom-OS-Tecnico.md`

---

*Última atualização: 2026-05-18 — Lucas Azevedo (Trivia)*
