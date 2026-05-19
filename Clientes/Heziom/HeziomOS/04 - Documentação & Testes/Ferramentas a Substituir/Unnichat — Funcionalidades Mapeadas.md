---
tags: [heziom, unnichat, substituição, atendimento, funcionalidades]
status: documentado
criado: 2026-05-19
fonte: paginas.unnichat.com.br
módulo-substituto: Atendimento
---

# Unnichat — Funcionalidades Mapeadas

> Inventário completo das funcionalidades da Unnichat para garantir que o módulo de Atendimento do HeziomOS replique tudo o que é necessário.
> A Unnichat será substituída pelo módulo [[Índice Atendimento]].

---

## Uso atual na Heziom

| Aspecto | Valor |
|---|---|
| Canais ativos | WhatsApp |
| Equipe | 2 atendentes |
| Horário | Seg–Sex 08h–18h |
| Chatbot ativo | Sim (fluxos básicos) |
| Volume estimado | Não formalizado |

**Dores identificadas:** histórico fragmentado, sem autonomia de IA, depende de atendente humano para o trivial, sem integração com dados de pedido/estoque.

---

## Funcionalidades Completas da Unnichat

### 1. Canais de Mensageria

| Canal | Unnichat | HeziomOS precisa? | Prioridade |
|---|---|---|---|
| WhatsApp (API oficial Meta) | ✅ | ✅ Sim (canal principal) | Alta |
| Instagram DM | ✅ | ⚠️ Fase futura | Baixa |
| Facebook Messenger | ✅ | ❌ Não usa | — |
| Webchat | Provável | ❌ Tray tema resolve | — |

### 2. Automação e Chatbot

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Flows de automação ilimitados | ✅ Sim (agente IA substitui) | Alta |
| Templates pré-prontos | ✅ Sim (respostas comuns) | Média |
| Captura de leads no WhatsApp | ✅ Sim (vincula a crm_contacts) | Alta |
| Formulários e surveys no WhatsApp | ⚠️ Nice-to-have | Baixa |
| Respostas automáticas (FAQ) | ✅ Sim (agente IA) | Alta |

### 3. CRM Integrado

| Funcionalidade | HeziomOS precisa? | Como resolve |
|---|---|---|
| Pipelines ilimitados | ❌ | Módulo Comercial tem pipeline próprio |
| Movimentação automática de etapa | ❌ | Cross-triggers fazem isso |
| Contatos (até 50k) | ❌ | CRM Unificado (sem limite) |
| Lead tracking | ❌ | CRM + Tray + Literarius |

### 4. Agentes de IA

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Agentes IA para WhatsApp | ✅ Sim (core do módulo) | Alta |
| Agentes IA para Instagram | ⚠️ Fase futura | Baixa |
| Operação 24/7 | ✅ Sim (meta explícita) | Alta |
| Treinamento de agentes | ✅ Sim (system prompts + contexto) | Alta |
| Até 3 atendentes no plano base | ✅ Sim (2 humanos + agente) | Alta |

### 5. Integrações

| Integração Unnichat | Equivalente HeziomOS |
|---|---|
| Meta (WhatsApp/Instagram) | WhatsApp Business API (direto) |
| Hotmart / Kiwify / Eduzz | ❌ Não relevante |
| WooCommerce | ❌ Não usa |
| **Tray** | ✅ Direto via API (já mapeado) |
| ActiveCampaign | ❌ Não usa (Flowbiz → CRM próprio) |
| Webhooks ilimitados | ✅ Edge Functions |
| API | ✅ Supabase API |

### 6. Analytics

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Dashboard de performance | ✅ Sim (métricas de atendimento) | Alta |
| Tempo médio de resposta | ✅ Sim | Alta |
| Taxa de resolução | ✅ Sim | Alta |
| Satisfação (NPS/CSAT) | ✅ Sim | Média |

### 7. Gestão de Atendimento

| Funcionalidade | HeziomOS precisa? | Prioridade |
|---|---|---|
| Fila de atendimento | ✅ Sim (quando escala para humano) | Alta |
| Transferência entre atendentes | ✅ Sim | Média |
| Tags em conversas | ✅ Sim | Média |
| Histórico unificado por contato | ✅ Sim (vinculado ao CRM) | Alta |
| Notas internas | ✅ Sim | Média |

---

## O que o HeziomOS NÃO precisa replicar da Unnichat

- CRM integrado (tem CRM próprio mais poderoso)
- Pipelines de vendas (módulo Comercial resolve)
- Integrações com infoprodutos (Hotmart, Kiwify)
- Formulários/surveys no WhatsApp (não é caso de uso)
- Instagram DM na Fase 1 (pode adicionar depois)

---

## O que o HeziomOS faz MELHOR que a Unnichat

| Capacidade | Unnichat | HeziomOS |
|---|---|---|
| Contexto do cliente | Apenas conversa | Pedidos + financeiro + estoque + histórico completo |
| Resolução de rastreio | Manual (humano busca) | Automática (API Mandaê/Melhor Envio) |
| Verificação de estoque | Manual | API Literarius em tempo real |
| Processamento de trocas | Manual | Automático dentro da política |
| Vendas assistidas | Humano só | Agente IA com catálogo + frete + carrinho |
| Escalação inteligente | Por fila | Por tipo de demanda (venda → comercial, problema → suporte) |
| Dados para segmentação CRM | Isolados | Alimenta CRM Unificado |

---

## Plano de Migração

1. **Configurar WhatsApp Business API** (Meta Cloud API ou BSP)
2. **Migrar número** da Unnichat para a nova integração
3. **Treinar agente IA** com FAQ, políticas de troca, catálogo de produtos
4. **Configurar escalação** para os 2 atendentes humanos
5. **Paralelo 15 dias** — ambos ativos, medir taxa de resolução
6. **Desligar Unnichat** após validação

**Dependências:**
- WhatsApp Business API ativa (Meta Cloud ou BSP — decisão pendente D1)
- Módulo CRM com `crm_contacts` populado
- APIs de rastreio (Mandaê + Melhor Envio) integradas

---

*Documentado em 2026-05-19 — para referência durante desenvolvimento do módulo Atendimento*
