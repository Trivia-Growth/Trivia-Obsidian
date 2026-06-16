# HeziomOS — Guia Completo: Marketing, CRM e Atendimento

> **Propósito:** Documento de referência para adaptar o sistema de atendimento existente (Sales-Hzm) às necessidades do HeziomOS. Consolida TODAS as notas do vault com links diretos para detalhamento.
>
> **Data:** 15/06/2026 · **Autor:** JG Novais + G4 OS

---

## 1. Visão Geral — O que estamos construindo

O HeziomOS precisa de 3 módulos interligados que substituem ferramentas pagas atuais:

| Módulo | Fase | Substitui | Custo atual | Economia/ano |
|---|---|---|---|---|
| **CRM Unificado** | 2.2 | Flowbiz | R$ 1.978/mês | ~R$ 23.000 |
| **Atendimento** | 2.5 | Unnichat | ~R$ 400/mês | ~R$ 4.800 |
| **Comercial (B2B)** | 2.3 | WhatsApp manual + ClickUp | — | Produtividade |

**Base existente que será adaptada:** Sales-Hzm (CRM React+Vite+Supabase, construído na Lovable)

---

## 2. O Sistema Base — Sales-Hzm (o que já existe)

### Referência completa
- [[Sales-Hzm — Índice]] — `03 - Departamentos/Atendimento/Sales-Hzm/Sales-Hzm — Índice.md`
- [[Auditoria TRIVIAIOX — Sales-Hzm]] — `03 - Departamentos/Atendimento/Sales-Hzm/Auditoria TRIVIAIOX — Sales-Hzm.md`
- [[Dashboard Stories]] — `03 - Departamentos/Atendimento/Sales-Hzm/Dashboard Stories.md`
- [[SECURITY_DEBT]] — `03 - Departamentos/Atendimento/Sales-Hzm/SECURITY_DEBT.md`
- [[Próxima Sessão]] — `03 - Departamentos/Atendimento/Sales-Hzm/Próxima Sessão.md`

### Stack
- **Frontend:** React + Vite + TypeScript + Tailwind/shadcn
- **Backend:** Supabase (Postgres + 39 Edge Functions Deno)
- **Hospedagem:** Netlify (front) + Supabase Cloud (back)
- **Código:** `Org-Heziom/heziom-sales` (GitHub) — local `~/Documents/Obsidian/Github/Heziom-Sales`
- **Supabase (temporário):** `apzbaesprzohoalknzxd` — será migrado para o banco unificado

### Decisão arquitetural: SINGLE-TENANT
O Sales-Hzm era multi-tenant (Lovable padrão). Decisão: **travar em 1 organização** (a Heziom). Manter `workspace_id` como escopo de segurança, mas remover criação/troca de org. Ver STORY-014.

### Estado da auditoria (75 achados)
| Severidade | Qtd | Status |
|---|---|---|
| 🔴 Crítico | 5 | Stories P0 criadas (STORY-001, STORY-002) |
| 🟠 Alto | 11 | Stories P1 criadas (STORY-003 a 007) |
| 🟡 Médio | 40 | P2 (STORY-008 a 013) |
| 🔵 Baixo | 19 | P3 |

### Stories de remediação (backlog)
| Story | Prioridade | O que resolve |
|---|---|---|
| STORY-001 | P0 | Fechar Edge Functions públicas sem auth |
| STORY-002 | P0 | Habilitar RLS nas 4 tabelas expostas |
| STORY-003 | P1 | Proteger webhooks (Z-API, Meta HMAC, OAuth) |
| STORY-004 | P1 | Segredos em texto puro → Vault/criptografia |
| STORY-005 | P1 | 316 erros TS — type-check real no build |
| STORY-006 | P1 | CI/CD mínimo + npm audit |
| STORY-007 | P1 | Features quebradas (funções inexistentes) |
| STORY-008 | P2 | Endurecer Edge Functions restantes |
| STORY-009 | P2 | Suíte de testes |
| STORY-010 | P2 | Camada de serviço + consolidação config |
| STORY-011 | P2 | ErrorBoundary, Sentry, QueryClient |
| STORY-012 | P2 | Validar agentes Triviaiox |
| STORY-013 | P3 | Quebrar componentes-gigantes |
| STORY-014 | P1 | Travar em organização única |

### O que o Sales-Hzm já tem implementado (features existentes)
- Pipeline/Kanban de deals
- Contatos com custom fields
- AI Predictions (scoring)
- Roleplay de vendas (treinamento)
- WhatsApp send via Z-API + Meta WA
- Quotes/propostas (PDF generation)
- NPS send/webhook
- Knowledge base (RAG)
- Flow engine (automações de fluxo)
- Routing engine (atribuição de deals)
- Commercial reports
- Meetings (OAuth + transcrição)
- Lead intake (webhook de captura)

---

## 3. Flowbiz — O CRM de Marketing a ser substituído

### Referências completas (4 documentos)

| Documento | Caminho | O que cobre |
|---|---|---|
| [[Flowbiz — Análise e Substituição]] | `04 - Documentação & Testes/Ferramentas a Substituir/Flowbiz — Análise e Substituição.md` | Business case, custos, contrato, plano de migração completo |
| [[Flowbiz — Funcionalidades Mapeadas]] | `04 - Documentação & Testes/Ferramentas a Substituir/Flowbiz — Funcionalidades Mapeadas.md` | Inventário de features a replicar, prioridades, comparativo HeziomOS |
| [[Flowbiz — Automações e Fluxos Mapeados]] | `04 - Documentação & Testes/Ferramentas a Substituir/Flowbiz — Automações e Fluxos Mapeados.md` | 10 jornadas de carrinho + 6 fluxos ativos com métricas completas |
| [[Flowbiz — Dashboard e Métricas CRM]] | `04 - Documentação & Testes/Ferramentas a Substituir/Flowbiz — Dashboard e Métricas CRM.md` | 12 meses de métricas, SQL schemas, KPIs a replicar |

### Urgência
- **Contrato vence: 26/06/2026** (11 dias a partir de hoje!)
- **Fatura atual:** R$ 1.978/mês (14,8x superdimensionado — usa só 6,7%)
- **Ação pendente:** Contatar Flowbiz para solicitar não renovação

### O que a Flowbiz faz (a substituir)

#### 3.1 Base de dados
- **96.718 contatos** (backup exportado ✅ em 05/06/2026)
- **40 listas** (7 com >1.000 contatos)
- **168 campanhas** históricas (1.336.712 envios)
- **345 campos personalizados**
- **168 templates HTML** exportados (6,3 MB) ✅

#### 3.2 Automações ativas (performance real — detalhes em [[Flowbiz — Automações e Fluxos Mapeados]])

**Carrinho Abandonado (R$ 216k recuperados no histórico):**

| Jornada | Canal | Delay | Taxa Recup. | Receita |
|---|---|---|---|---|
| Primeiro contato | WhatsApp Web | Imediato | **54,24%** | R$ 25.159 |
| 15 minutos | WhatsApp API | 15 min | 6,71% | **R$ 98.825** |
| 30 minutos | E-mail | 30 min | 0,67% | R$ 19.866 |
| Carrinhos > R$300 | WhatsApp API | 30 min | 2,75% | R$ 8.088 |
| 1 hora | WhatsApp API | 1h | 4,6% | R$ 51.893 |
| 1 dia | E-mail | 1 dia | 0,18% | R$ 4.997 |
| 3 dias | E-mail | 3 dias | 0,27% | R$ 6.362 |
| 1 semana | E-mail | 7 dias | 0,09% | R$ 2.365 |

**Fluxos de relacionamento:**

| Fluxo | Conversão | Canal dominante | Cupom |
|---|---|---|---|
| **Boas-Vindas Assinantes** | **12,06%** (melhor) | E-mail + WA | NEWSLETTER10 (10%) |
| Cliente VIP Ativo | 4,56% | WA (65% abertura) + Email | VIP15 (15%) |
| Lembrete de Recompra | 1,64% | WA (CTOR 18%) + Email | EBDC / GENERO |
| Aniversário | 1,42% | WA (CTOR **47%**) + Email | ANIVER |

#### 3.3 Métricas CRM (detalhes em [[Flowbiz — Dashboard e Métricas CRM]])

| Métrica | Valor (12 meses) | Meta HeziomOS |
|---|---|---|
| Taxa de Recompra | 25,89% | 35-40% |
| Receita Total | R$ 2.714.712 | — |
| Ticket Médio (recorrente) | R$ 192 | — |
| Ticket Médio (novo) | R$ 153 | — |
| Tempo médio recompra | **74,55 dias** | D+75 trigger |
| Receita novos vs recorrentes | 69% / 31% | Inverter para 50/50 |
| ROI e-mail | 11,75x | Manter |
| WhatsApp abertura | 65% vs Email 10% | Priorizar WA |
| Captação diária | 134/dia (119% meta) | Manter |

#### 3.4 Backup exportado
- **Local:** `OneDrive — Editora Heziom / Heziom / Flowbiz / backup-2026-06-05`
- `/contatos/` — 31 JSON + 31 CSV + `TODOS_CONTATOS_CONSOLIDADO.csv` (96.692)
- `/campanhas/` — completo + resumo
- `/listas/` — 40 listas + 345 campos personalizados
- `/templates/` — 168 HTMLs (6,3 MB)
- `/tags/` — 2 tags

#### 3.5 O que o HeziomOS faz MELHOR que a Flowbiz (detalhes em [[Flowbiz — Funcionalidades Mapeadas]])

| Capacidade | Flowbiz | HeziomOS |
|---|---|---|
| Dados de compra | Só Tray (parcial) | Tray + Literarius + marketplaces + livraria |
| Segmentação cross-channel | Impossível | Nativa (CPF como chave) |
| Histórico financeiro | Não | A/R, inadimplência, ticket médio |
| Classificação B2B | Manual (tags) | Automática (TipoCliente do Literarius) |
| Dados de estoque | Não | Sim ("produto voltou ao estoque") |
| Contexto editorial | Não | Sim (lançamentos, pré-venda por interesse) |

---

## 4. Unnichat — O sistema de atendimento a ser substituído

### Referência completa
- [[Unnichat — Funcionalidades Mapeadas]] — `04 - Documentação & Testes/Ferramentas a Substituir/Unnichat — Funcionalidades Mapeadas.md`

### Uso atual
| Aspecto | Valor |
|---|---|
| Canais ativos | WhatsApp apenas |
| Equipe | 2 atendentes |
| Horário | Seg–Sex 08h–18h |
| Chatbot | Fluxos básicos |
| Dores | Sem IA, sem integração com pedidos/estoque, histórico fragmentado |

### O que o HeziomOS faz MELHOR que a Unnichat

| Capacidade | Unnichat | HeziomOS |
|---|---|---|
| Contexto do cliente | Só conversa | Pedidos + financeiro + estoque + histórico |
| Rastreio | Manual (humano busca) | Automático (API Mandaê/Melhor Envio) |
| Estoque | Manual | Literarius em tempo real |
| Trocas/devoluções | Manual | Automático dentro da política |
| Vendas assistidas | Humano só | Agente IA + catálogo + frete + carrinho |
| Escalação | Por fila | Por tipo (venda→comercial, suporte→atendimento) |

### Plano de migração
1. Configurar WhatsApp Business API
2. Migrar número da Unnichat
3. Treinar agente IA (FAQ, políticas, catálogo)
4. Configurar escalação para 2 humanos
5. Paralelo 15 dias — medir taxa de resolução
6. Desligar Unnichat

---

## 5. Módulo Atendimento — Especificação completa

### Referência
- [[Índice Atendimento]] — `03 - Departamentos/Atendimento/Índice Atendimento.md`

### Tipos de chamado
1. **Compra via WhatsApp** → resolve direto ou encaminha Comercial
2. **Problema no pedido** (rastreio, atraso, divergência)
3. **Consulta sobre envio** (prazo, frete)
4. **Trocas e devoluções**

### Fluxo de resolução (Agente IA)
```
Mensagem WhatsApp → Classificação IA
├── Rastreio → API Mandaê/Melhor Envio → Resposta automática
├── Disponibilidade → API Literarius GET /Estoque → Resposta automática
├── Troca/Devolução → Verifica política
│   ├── Dentro da política → Processa automaticamente
│   └── Fora → Escala para humano
├── Venda → Agente com catálogo + frete + carrinho + link Tray
└── Complexo → Escala para humano (tipo: vendas→comercial, suporte→atendimento)
```

### Integrações necessárias
| Sistema | Endpoint | Dado |
|---|---|---|
| WhatsApp Business API | Meta Cloud API ou BSP (D1 pendente) | Canal principal |
| Mandaê | `GET /trackings/{code}` | Rastreio de envios |
| Melhor Envio | API de rastreio | Rastreio alternativo |
| Literarius | `GET /Estoque` | Disponibilidade em tempo real |
| Literarius | `GET /PedidoVenda` | Status do pedido B2B |
| Tray | `GET /orders/:id/complete` | Detalhes pedido D2C |
| Mandaê | `/postalcodes/rates` | Cotação de frete ao vivo |
| CRM | `crm_contacts` | Contexto do cliente (LTV, última compra) |
| AppMax/Stone | Token cards | Vendas assistidas com cartão |
| PIX | QR Code dinâmico | Pagamento B2B sem maquininha |

### Tabelas Supabase (planejadas)
```sql
atendimento_conversations (id, contact_id, channel, status, assigned_to, started_at, ...)
atendimento_messages (id, conversation_id, direction, content, agent_type, timestamp, ...)
atendimento_tickets (id, conversation_id, type, status, resolution, ...)
```

### Metas de sucesso
| Métrica | Fase 2 | Fase 3 |
|---|---|---|
| % resolvido sem humano | 40% | 70% |
| Tempo médio resposta | < 2 min | < 30 seg |
| Disponibilidade | 08–18h | 24/7 |
| NPS | Baseline | > 4.5/5 |

### Submódulos planejados
| Submódulo | Fase | Nota |
|---|---|---|
| Agente de Atendimento v1 | 2 | Rastreio, FAQ, disponibilidade |
| Agente de Atendimento v2 | 3 | Trocas, vendas assistidas |
| Painel de Conversas | 2 | Histórico unificado, métricas |
| Escalação Inteligente | 2 | Regras de quando escala |

---

## 6. Módulo CRM Unificado — Especificação completa

### Referências
- [[Índice Marketing e CRM]] — `03 - Departamentos/Marketing e CRM/Índice Marketing e CRM.md`
- [[HeziomOS — Módulos e Escopo Completo]] — `01 - Projeto & Visão Geral/HeziomOS — Módulos e Escopo Completo.md`

### Entidade central: Customer (perfil cross-channel)
- **Chave de cruzamento:** CPF (dedup entre Tray D2C, Literarius B2B, marketplaces)
- **Fontes de dados:**

| Fonte | Dados | Chave |
|---|---|---|
| Tray `GET /customers` | Compradores D2C | `customer.cpf` |
| Literarius `TParceiroController` | Clientes B2B (47k registros) | `Parceiro.CnpjCpf` |
| Marketplaces (via Tray) | Compradores ML/Amazon/Shopee | CPF quando disponível |
| Flowbiz (migração) | Base histórica de contatos | Email + telefone |
| Tray `GET /orders` | Histórico compras online | `order.customer_id` |
| Literarius `PedidoVenda` | Histórico compras offline | `PedidoVenda.Cliente` |

### Tabelas Supabase (planejadas)
```sql
crm_contacts (id, name, email, phone, cpf_cnpj, type, source_channel, ...)
crm_contact_tags (contact_id, tag)
crm_segments (id, name, rules_json, auto_refresh, count, ...)
crm_communications (id, contact_id, channel, direction, content, timestamp, ...)
crm_campaigns (id, segment_id, channel, template, status, sent_count, opened, clicked, ...)
```

### Segmentações desejadas (impossíveis na Flowbiz)
- "Compraram teologia reformada nos últimos 90 dias + não abriram 3 últimos e-mails"
- "Igrejas com pedido institucional > 6 meses"
- "Compradores marketplace que também compraram D2C" (cross-channel via CPF)
- "LTV > R$ 500 sem compra há 60 dias"

### Automações a implementar (em ordem de prioridade)

| # | Fluxo | Trigger | Canal | Delay | Cupom |
|---|---|---|---|---|---|
| 1 | Boas-vindas | Novo cadastro | E-mail + WA | Imediato | NEWSLETTER10 |
| 2 | Carrinho Abandonado | Webhook Tray | WA (15min) → Email (30min) → WA (1h) → Email (1d, 3d, 7d) | Sequencial | — |
| 3 | Carrinho > R$300 | Webhook Tray + valor > 300 | WA API | 30 min | Personalizado |
| 4 | Lembrete Recompra | D+75 sem compra | WA + Email | D+75 | EBDC / GENERO |
| 5 | Cliente VIP | 2ª+ compra (segmento "Recompra") | WA + Email | Imediato | VIP15 |
| 6 | Aniversário | D-7 da data nascimento | Email + WA | D-7 às 08:00 | ANIVER |
| 7 | Sazonais | Manual | WA + Email | Manual | Variável |

### Métricas obrigatórias no dashboard (SQL em [[Flowbiz — Dashboard e Métricas CRM]])
- Taxa de Recompra (global + por mês)
- Receita Total por período + por tipo de cliente (novo vs recorrente)
- Ticket Médio por pedido e por cliente
- Pedidos por cliente
- Tempo médio de recompra
- Clientes pagantes únicos
- Captação diária
- ROI de campanhas
- Funil de conversão (envio → abertura → clique → pedido)

---

## 7. Eventos e Interligação entre Módulos

### Referência
- [[HeziomOS — Interligação Completa entre Módulos]] — `02 - Sistema (Fluxos & Processos)/HeziomOS — Interligação Completa entre Módulos.md`

### Eventos relevantes para Marketing/Atendimento

| Evento | Emitido por | Consome |
|---|---|---|
| `ecom.order.created` | Tray webhook | CRM (atualiza histórico), Financeiro, Logística |
| `ecom.order.shipped` | Logística | CRM (notifica cliente), Atendimento (tracking disponível) |
| `ecom.cart.abandoned` | Tray webhook | CRM (dispara régua de carrinho) |
| `ecom.stock.low` | Literarius | Logística + Dashboard (ruptura) |
| `crm.segment.triggered` | CRM engine | Enfileira para campanha/régua |
| `crm.contact.inactive` | CRM (D+X sem compra) | Dispara régua de reativação |
| `crm.contact.high_value` | CRM (LTV > threshold) | Marca para tratamento VIP |
| `crm.b2b.no_order_6m` | CRM | Cria tarefa de reativação comercial |
| `editorial.book.published` | Editorial | CRM (campanha lançamento), Marketing (checklist) |
| `atend.conversation.started` | WhatsApp | Agente IA classifica/responde |
| `atend.conversation.escalated` | Atendimento | Comercial (pipeline item) |
| `atend.sale.assisted` | Atendimento | Ecommerce (pedido), Comercial (meta vendedor) |
| `atend.ticket.resolved` | Atendimento | CRM (atualiza satisfação) |

---

## 8. Alertas e Notificações (engine compartilhada)

### Referência
- [[Alertas e Notificações]] — `02 - Sistema (Fluxos & Processos)/Integrações/Alertas e Notificações.md`

### Canais
- **Teams** (Adaptive Cards via webhook) — canal primário
- **Email** (SMTP/SendGrid/SES) — CEO briefing e críticos

### Alertas relevantes para Marketing/Atendimento
| Nível | Alerta | Destinatário |
|---|---|---|
| 🔴 Crítico | Conta Amazon AT_RISK | Comercial |
| 🟡 Atenção | Pedido sem tracking > 24h | Logística + Atendimento |
| 🟡 Atenção | Devolução solicitada | Atendimento |
| 🔵 Info | Resumo diário de atendimentos | CEO |
| 🔵 Info | Captação vs meta | Marketing |

---

## 9. Integrações Externas Completas

### Referências
- [[Mapa Completo de APIs e Capacidades]] — `04 - Documentação & Testes/Mapa Completo de APIs e Capacidades.md`
- [[APIs Externas — Credenciais e Passo a Passo]] — `04 - Documentação & Testes/APIs Externas — Credenciais e Passo a Passo.md`
- [[Features Expandidas — APIs × Módulos HeziomOS]] — `01 - Projeto & Visão Geral/Features Expandidas — APIs × Módulos HeziomOS.md`
- [[Estudo de APIs — Capacidades e Gaps]] — `01 - Projeto & Visão Geral/Estudo de APIs — Capacidades e Gaps.md`

### APIs necessárias para Marketing/Atendimento

| Sistema | API | Para que serve | Módulo |
|---|---|---|---|
| **WhatsApp Business** | Meta Cloud API ou BSP | Canal de atendimento + réguas | Atendimento + CRM |
| **Tray** | REST + Webhooks | Pedidos, clientes, carrinhos, cupons | Todos |
| **Literarius** | REST (`.NET`) | Estoque, pedidos B2B, parceiros (47k) | Atendimento + CRM |
| **Mandaê** | REST | Rastreio de envios | Atendimento |
| **Melhor Envio** | REST | Rastreio alternativo | Atendimento |
| **Meta Ads** | Marketing API | ROI, custo por campanha | CRM + Dashboard |
| **Google Ads** | API | ROAS | Dashboard |
| **Resend/SES** | SMTP/API | Envio de e-mail marketing | CRM |
| **AppMax** | Webhooks (21 eventos) | Pagamentos, tokenização | Financeiro + Atendimento |
| **Stone** | API | PIX QR Code dinâmico | Atendimento + Comercial |
| **ML Messages** | API | Unificar mensagens marketplace no Atendimento | Atendimento |

---

## 10. Campanhas e LPs Ativas (contexto de Marketing)

### Referências
- [[LP Coleções 2026 (Plano Bomba) — Configuração]] — `03 - Departamentos/Marketing e CRM/LP Coleções 2026 (Plano Bomba) — Configuração.md`
- [[Plano Bomba — Tráfego Pago Meta Ads]] — `03 - Departamentos/Marketing e CRM/Plano Bomba — Tráfego Pago Meta Ads.md`
- [[Meta CAPI — Configuração Tray Ecommerce]] — `03 - Departamentos/Marketing e CRM/Meta CAPI — Configuração Tray Ecommerce.md`
- [[00 - Bíblia 120 — Projeto LP]] — `03 - Departamentos/Marketing e CRM/Bíblia 120 anos - Claude Design/00 - Bíblia 120 — Projeto LP.md`

### Status atual
| Campanha | Domínio | Status | Verba |
|---|---|---|---|
| Plano Bomba (11 combos) | `colecoes.editoraheziom.com.br` | ✅ No ar | R$ 200k Meta Ads |
| Bíblia 120 anos IPP | `lp-biblia120-heziom.netlify.app` | 🟡 Homologação | — |
| TRIBE Criativo Lab | — | 🛠️ Em construção | — |

### Tracking implementado (já operacional)
- Meta Pixel `297709555050094`
- CAPI server-side (Tray webhooks → HeziomOS)
- GA4 `G-RPPLKVTJTV`
- Eventos: PageView, scroll depth, ViewContent, AddToCart, Purchase (dedup browser↔server)

---

## 11. Decisões Pendentes que Impactam a Implementação

| ID | Decisão | Impacto | Responsável |
|---|---|---|---|
| **D1** | WhatsApp: Meta Cloud API vs BSP (Z-API, Waba) | Custo + complexidade do Atendimento | CEO + Tech |
| **D2** | Prioridade: CRM vs Editorial vs Tasks na Fase 2 | Ordem de desenvolvimento | CEO |
| **D5** | Budget de tokens IA (R$ 2k/mês) para 6 agentes | Viabilidade Fase 3 | Tech |

---

## 12. Infraestrutura Necessária (checklist)

| Componente | Para que serve | Status |
|---|---|---|
| WhatsApp Business API | Atendimento + Marketing | ⬜ Pendente D1 |
| Provedor E-mail (Resend/SES) | Campanhas + automações | ⬜ A definir |
| Supabase `crm_contacts` | Base unificada | ⬜ A criar (ou adaptar do Sales-Hzm) |
| Webhooks Tray | Cart abandon, order.created, shipped | ⬜ A configurar |
| Mandaê API | Rastreio no agente | ⬜ A integrar |
| Melhor Envio API | Rastreio alternativo | ⬜ A integrar |
| Literarius API | Estoque, pedidos, clientes B2B | ✅ Já mapeado |
| Meta CAPI | Atribuição server-side | ✅ No ar |
| Z-API | WhatsApp send (se BSP) | ✅ Já no Sales-Hzm |
| Meta WA webhook | WhatsApp receive (se Cloud API) | ✅ Já no Sales-Hzm |
| SQS/EventBridge AWS | Notifications Amazon SP-API | ⬜ A configurar |

---

## 13. O que adaptar no Sales-Hzm para virar o sistema HeziomOS

### O que já tem e pode ser reaproveitado:
- ✅ Estrutura de contatos/deals (adaptar para `crm_contacts`)
- ✅ WhatsApp send (Z-API + Meta WA) — já implementado
- ✅ WhatsApp receive (webhooks Z-API + Meta) — já implementado
- ✅ AI Orchestrator (orquestra respostas IA) — base para Agente de Atendimento
- ✅ Flow Engine (automações por gatilho) — base para réguas de marketing
- ✅ NPS send/webhook — reaproveitável para satisfação pós-atendimento
- ✅ Knowledge base (RAG) — base para FAQ do agente
- ✅ Lead intake webhook — base para captura de leads das LPs
- ✅ Pipeline Kanban — base para pipeline atacado B2B

### O que precisa ser ADICIONADO:
- ⬜ Integração Tray (pedidos, clientes, carrinhos abandonados)
- ⬜ Integração Literarius (estoque, pedidos B2B, parceiros)
- ⬜ Integração Mandaê/Melhor Envio (rastreio)
- ⬜ Módulo de campanhas em massa (bulk email + WhatsApp)
- ⬜ Editor de templates de e-mail
- ⬜ Segmentação dinâmica (rules engine com auto-refresh)
- ⬜ Réguas de relacionamento (séries temporais: D+15, D+75, etc.)
- ⬜ Carrinho abandonado (webhook Tray → sequência WA/Email)
- ⬜ Métricas CRM (recompra, LTV, ticket médio, funil)
- ⬜ Dashboard de atendimento (tempo resposta, resolução, NPS)
- ⬜ Escalação inteligente (por tipo de demanda)
- ⬜ Painel de conversas unificado (histórico por cliente)

### O que precisa ser CORRIGIDO (urgente, antes de usar em produção):
- 🔴 STORY-001: Fechar funções públicas sem auth
- 🔴 STORY-002: Habilitar RLS
- 🟠 STORY-003: Proteger webhooks
- 🟠 STORY-014: Travar single-tenant

---

## 14. Mapa de Notas (índice de referência rápida)

### Visão geral e arquitetura
| Nota | Caminho completo |
|---|---|
| [[00 - Índice]] | `Clientes/Heziom/HeziomOS/00 - Índice.md` |
| [[HeziomOS — Módulos e Escopo Completo]] | `01 - Projeto & Visão Geral/HeziomOS — Módulos e Escopo Completo.md` |
| [[HeziomOS — Interligação Completa entre Módulos]] | `02 - Sistema (Fluxos & Processos)/HeziomOS — Interligação Completa entre Módulos.md` |
| [[Mapa de Dados]] | `02 - Sistema (Fluxos & Processos)/Mapa de Dados.md` |
| [[Alertas e Notificações]] | `02 - Sistema (Fluxos & Processos)/Integrações/Alertas e Notificações.md` |

### Marketing e CRM
| Nota | Caminho completo |
|---|---|
| [[Índice Marketing e CRM]] | `03 - Departamentos/Marketing e CRM/Índice Marketing e CRM.md` |
| [[LP Coleções 2026 (Plano Bomba) — Configuração]] | `03 - Departamentos/Marketing e CRM/LP Coleções 2026 (Plano Bomba) — Configuração.md` |
| [[Plano Bomba — Tráfego Pago Meta Ads]] | `03 - Departamentos/Marketing e CRM/Plano Bomba — Tráfego Pago Meta Ads.md` |
| [[Meta CAPI — Configuração Tray Ecommerce]] | `03 - Departamentos/Marketing e CRM/Meta CAPI — Configuração Tray Ecommerce.md` |
| [[00 - Bíblia 120 — Projeto LP]] | `03 - Departamentos/Marketing e CRM/Bíblia 120 anos - Claude Design/00 - Bíblia 120 — Projeto LP.md` |

### Atendimento
| Nota | Caminho completo |
|---|---|
| [[Índice Atendimento]] | `03 - Departamentos/Atendimento/Índice Atendimento.md` |
| [[Sales-Hzm — Índice]] | `03 - Departamentos/Atendimento/Sales-Hzm/Sales-Hzm — Índice.md` |
| [[Auditoria TRIVIAIOX — Sales-Hzm]] | `03 - Departamentos/Atendimento/Sales-Hzm/Auditoria TRIVIAIOX — Sales-Hzm.md` |
| [[Dashboard Stories]] | `03 - Departamentos/Atendimento/Sales-Hzm/Dashboard Stories.md` |
| [[SECURITY_DEBT]] | `03 - Departamentos/Atendimento/Sales-Hzm/SECURITY_DEBT.md` |
| [[Próxima Sessão]] | `03 - Departamentos/Atendimento/Sales-Hzm/Próxima Sessão.md` |

### Ferramentas a substituir
| Nota | Caminho completo |
|---|---|
| [[Flowbiz — Análise e Substituição]] | `04 - Documentação & Testes/Ferramentas a Substituir/Flowbiz — Análise e Substituição.md` |
| [[Flowbiz — Funcionalidades Mapeadas]] | `04 - Documentação & Testes/Ferramentas a Substituir/Flowbiz — Funcionalidades Mapeadas.md` |
| [[Flowbiz — Automações e Fluxos Mapeados]] | `04 - Documentação & Testes/Ferramentas a Substituir/Flowbiz — Automações e Fluxos Mapeados.md` |
| [[Flowbiz — Dashboard e Métricas CRM]] | `04 - Documentação & Testes/Ferramentas a Substituir/Flowbiz — Dashboard e Métricas CRM.md` |
| [[Unnichat — Funcionalidades Mapeadas]] | `04 - Documentação & Testes/Ferramentas a Substituir/Unnichat — Funcionalidades Mapeadas.md` |

### APIs e integrações
| Nota | Caminho completo |
|---|---|
| [[Mapa Completo de APIs e Capacidades]] | `04 - Documentação & Testes/Mapa Completo de APIs e Capacidades.md` |
| [[APIs Externas — Credenciais e Passo a Passo]] | `04 - Documentação & Testes/APIs Externas — Credenciais e Passo a Passo.md` |
| [[Features Expandidas — APIs × Módulos HeziomOS]] | `01 - Projeto & Visão Geral/Features Expandidas — APIs × Módulos HeziomOS.md` |
| [[Estudo de APIs — Capacidades e Gaps]] | `01 - Projeto & Visão Geral/Estudo de APIs — Capacidades e Gaps.md` |

---

*Gerado em 15/06/2026 para servir como guia de adaptação do Sales-Hzm → HeziomOS (módulos Marketing, CRM e Atendimento).*
