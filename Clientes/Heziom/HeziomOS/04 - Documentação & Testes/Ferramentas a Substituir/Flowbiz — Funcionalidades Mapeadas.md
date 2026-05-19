---
tags: [heziom, flowbiz, substituição, crm, funcionalidades]
status: documentado
criado: 2026-05-19
fonte: flowbiz.com.br + flowbiz.readme.io
módulo-substituto: Marketing e CRM
---

# Flowbiz — Funcionalidades Mapeadas

> Inventário completo das funcionalidades do Flowbiz para garantir que o módulo CRM do HeziomOS replique tudo o que é necessário.
> O Flowbiz será substituído pelo módulo [[Índice Marketing e CRM]].

---

## Uso atual na Heziom

| Aspecto | Valor |
|---|---|
| Base de contatos | 40.000+ |
| Canais utilizados | Email + WhatsApp |
| Integrações ativas | Tray (e-commerce) |
| Automações ativas | Carrinhos abandonados, réguas básicas |

**Dores identificadas:** desconectado dos dados reais de compra (Tray + Literarius), segmentações limitadas ao que o Flowbiz captura (não cruza com financeiro, estoque ou pedidos offline).

---

## Funcionalidades Completas do Flowbiz

### 1. Gestão de Contatos

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Criação/edição de contatos | ✅ Sim | Alta |
| Custom fields por contato | ✅ Sim | Alta |
| Tags (classificação por comportamento/estratégia) | ✅ Sim | Alta |
| Listas (agrupamento manual) | ✅ Sim (equivale a segmentos estáticos) | Média |
| Lead capture (pop-ups, forms) | ⚠️ Tray resolve via tema | Baixa |
| Importação em massa (CSV/arquivo) | ✅ Sim (migração inicial) | Alta |
| CRM automático do visitante do site | ⚠️ Nice-to-have | Baixa |

### 2. Segmentação

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Segmentos dinâmicos (regras comportamentais) | ✅ Sim | Alta |
| Filtros por compra, recência, frequência, valor | ✅ Sim (RFV) | Alta |
| Filtros por abertura/clique de email | ✅ Sim | Média |
| Segmentos estáticos (listas manuais) | ✅ Sim | Média |

**Vantagem HeziomOS:** segmentação cruza com dados de TODOS os canais (Tray + Literarius + marketplaces + livraria), não só e-commerce.

### 3. Canais de Comunicação

| Canal | Flowbiz | HeziomOS |
|---|---|---|
| Email marketing | ✅ Templates + bulk send | ✅ Via Resend/SendGrid |
| WhatsApp (Meta templates) | ✅ Bulk + automações | ✅ Via WhatsApp Business API |
| SMS | ❌ Não mencionado | ⚠️ Possível mas não prioritário |

### 4. Automações e Réguas

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Flows multicanal (WhatsApp + Email) | ✅ Sim | Alta |
| Triggers comportamentais (pageView, addToCart, orderComplete) | ✅ Sim (via Tray webhooks) | Alta |
| Carrinho abandonado automático | ✅ Sim | Alta |
| Régua de recompra | ✅ Sim | Alta |
| Régua de boas-vindas | ✅ Sim | Média |
| Régua de reativação (inativo há X dias) | ✅ Sim | Média |
| Templates prontos | ⚠️ Nice-to-have | Baixa |
| Scheduling (agendamento futuro) | ✅ Sim | Média |

### 5. E-commerce Tracking

| Evento | Fonte no HeziomOS |
|---|---|
| pageView | Tray (via tema/script) |
| productView | Tray (via tema/script) |
| addToCart | Tray webhook |
| cartSync | Tray `GET /abandoned-carts` |
| checkoutStep | Tray webhook |
| orderComplete | Tray webhook `order.insert` |
| accountSync | Tray `GET /customers` |

### 6. Campanhas

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Criação de campanhas (drag-and-drop) | ✅ Sim (interface simplificada) | Alta |
| Bulk sending para listas segmentadas | ✅ Sim | Alta |
| Templates de email (20+) | ✅ Sim (biblioteca de templates) | Média |
| A/B testing | ⚠️ Fase futura | Baixa |

### 7. Analytics e Atribuição

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Dashboard em tempo real | ✅ Sim (CEO Dashboard já cobre) | Alta |
| Métricas: opens, clicks, sessions, orders, revenue | ✅ Sim | Alta |
| "Receita influenciada" (atribuição) | ✅ Sim | Alta |
| Atribuição last-click e multi-touch | ⚠️ Fase futura | Baixa |
| Indicadores de recompra e abandono | ✅ Sim | Alta |
| ROI por campanha | ✅ Sim | Alta |

### 8. Integrações

| Integração Flowbiz | Equivalente HeziomOS |
|---|---|
| Tray (nativa) | Direto via API (já mapeado) |
| Google Analytics | Via script no tema Tray |
| ERP genérico | Literarius (direto no banco) |
| 80+ plataformas | Não necessário (tudo no mesmo banco) |

---

## O que o HeziomOS NÃO precisa replicar do Flowbiz

- Pop-ups e formulários (Tray resolve nativamente)
- Integração com 80+ plataformas externas (banco unificado elimina)
- Onboarding consultivo de 30 dias (é produto, não serviço)
- Lead scoring genérico (HeziomOS faz RFV com dados reais)

---

## O que o HeziomOS faz MELHOR que o Flowbiz

| Capacidade | Flowbiz | HeziomOS |
|---|---|---|
| Dados de compra | Só Tray (parcial) | Tray + Literarius + marketplaces + livraria |
| Segmentação cross-channel | Impossível | Nativa (CPF como chave) |
| Histórico financeiro | Não existe | A/R, inadimplência, ticket médio |
| Classificação B2B | Manual (tags) | Automática (TipoCliente do Literarius) |
| Dados de estoque | Não | Sim (alertar "produto voltou ao estoque") |
| Contexto editorial | Não | Sim (lançamentos, pré-venda por interesse) |

---

## Plano de Migração

1. **Extrair contatos** via API Flowbiz (`GET /contacts` + custom fields)
2. **Mapear campos** para schema `crm_contacts` do Supabase
3. **Enriquecer** com dados do Literarius (TipoCliente, histórico de pedidos)
4. **Cruzar** com Tray customers (CPF/email como chave)
5. **Recriar automações** como Edge Functions com triggers de webhook
6. **Descontinuar** Flowbiz após validação (~30 dias de paralelo)

**Volume:** ~40.000 contatos + tags + listas + histórico de interações

---

*Documentado em 2026-05-19 — para referência durante desenvolvimento do módulo CRM*
