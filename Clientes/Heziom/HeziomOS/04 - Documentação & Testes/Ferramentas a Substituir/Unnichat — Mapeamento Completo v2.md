---
tags: [heziom, unnichat, whatsapp, api-oficial, mapeamento, substituição]
status: documentado
criado: 2026-06-19
fonte: "PDF Unnichat — Guia API Oficial (material comercial/estratégico)"
substituir-por: HeziomOS (crm-meta-wa-send, crm-meta-wa-webhook, crm-flow-action-executor)
---

# Unnichat — Mapeamento Completo v2

> Mapeamento extraído do PDF oficial da Unnichat (guia de API Oficial + funcionalidades da plataforma). Substitui o mapeamento anterior (incompleto).

---

## 1. Visão Geral da Plataforma

A Unnichat é uma ferramenta de **API Oficial do WhatsApp** homologada pela Meta. Concentra:
- Disparos em massa (broadcast)
- CRM integrado
- Fluxos de automação inteligentes
- Livechat com distribuição automática
- Atendimento via IA
- Automações para Instagram

---

## 2. Funcionalidades Mapeadas

### 2.1 Envio e Broadcast

| Funcionalidade | Detalhe | Equivalente HeziomOS |
|---|---|---|
| **Disparo em massa (broadcast)** | Até 3.600 msgs/min (API pura) ou ~300 msgs/min (coexistência) | `crm-meta-wa-send` |
| **Templates de Marketing** | Mensagens promocionais aprovadas pela Meta (sempre cobradas ~US$ 0.0625/msg) | Templates no WhatsApp Cloud API |
| **Templates de Utilidade** | Mensagens transacionais/informativas (grátis dentro janela, ~US$ 0.0068 fora) | Templates no WhatsApp Cloud API |
| **Condicional de janela** | Verifica se janela de 24h está aberta antes de disparar (evita custo de template) | Lógica em `crm-flow-action-executor` |
| **Randomizador** | A/B test de variações de texto/estrutura nos templates | Implementar em `crm-flow-action-executor` |
| **Botões de resposta rápida** | Botões clicáveis que reabrem janela de 24h | Suportado via WhatsApp Cloud API |
| **Mensagens interativas** | Botões, listas, perguntas | Suportado via WhatsApp Cloud API |

### 2.2 Janelas de Conversação

| Conceito | Detalhe |
|---|---|
| **Janela padrão (24h)** | Aberta quando Lead responde ou clica botão. Mensagens livres grátis (exceto template MKT) |
| **Reabertura automática** | Cada nova resposta do Lead reinicia as 24h |
| **Janela CTWA (72h)** | Aberta quando Lead vem de anúncio Click-to-WhatsApp. 72h de msgs grátis sem template |
| **Identificação CTWA** | Unnichat identifica automaticamente Leads oriundos de CTWA e registra origem (ads, campanha, conjunto) |

### 2.3 CRM Integrado

| Funcionalidade | Detalhe | Equivalente HeziomOS |
|---|---|---|
| **Pipes (funil de vendas)** | Organiza Leads por etapa do negócio | CRM Sales-Hzm (pipes/stages) |
| **Tags** | Marcadores para segmentação (ex: CPL assistido, origem, interesse) | Tags no CRM HeziomOS |
| **Campos personalizados** | Dados adicionais do Lead | Campos customizados no CRM |
| **Lead Scoring** | Pontuação automática baseada em ações/interações | Implementar em HeziomOS |
| **Follow-up automatizado** | Mensagens de acompanhamento automáticas por etapa | `crm-flow-action-executor` |
| **Histórico completo** | Registro de todas interações com Lead | HeziomOS conversation log |

### 2.4 Fluxos Inteligentes (Automações)

| Funcionalidade | Detalhe | Equivalente HeziomOS |
|---|---|---|
| **Fluxos com condições** | Lógica condicional (if/else) baseada em tags, campos, janela, scoring | `crm-flow-action-executor` |
| **Detecção de palavra-chave** | Dispara fluxo quando Lead envia palavra específica | Webhook + lógica de roteamento |
| **Contador de interações** | Registra quantas vezes Lead interagiu | Implementar no CRM |
| **Tagueamento automático** | Aplica tags automaticamente baseado em ações | Automação CRM |
| **Importação de fluxos** | Importar modelos prontos | N/A (HeziomOS tem fluxos próprios) |
| **Fluxo de Interação Infinita** | Estratégia para manter janela aberta entre CPLs (concierge + palavra-chave) | Implementar como recipe |
| **Recuperação de carrinho** | Sequência automática após abandono de checkout (10min, 2h, 24h) | `crm-flow-action-executor` + webhook checkout |
| **Onboarding pós-compra** | Template utilidade → abertura janela → upsell/upgrade grátis | `crm-flow-action-executor` |
| **Certificado Magnético** | Fluxo que coleta dados e mantém janela aberta com incentivo de certificado | Recipe customizado |

### 2.5 Atendimento (Livechat)

| Funcionalidade | Detalhe | Equivalente HeziomOS |
|---|---|---|
| **Livechat** | Interface de atendimento para operadores | HeziomOS Atendimento |
| **Distribuição automática de chamados** | Roteia conversas entre atendentes automaticamente | Implementar regra de roteamento |
| **Equipe conectada** | Múltiplos atendentes simultâneos | Multi-agent no HeziomOS |
| **Transferência humano** | IA encaminha para humano quando necessário | Regra de escalation |

### 2.6 Inteligência Artificial

| Funcionalidade | Detalhe | Equivalente HeziomOS |
|---|---|---|
| **Atendimento via IA** | Interpreta dúvidas e intenções do Lead automaticamente | IA HeziomOS (a construir) |
| **Resposta contextual** | Responde com base no contexto da conversa | LLM integration |
| **Qualificação automática** | IA qualifica Lead e classifica intenção | IA + Lead Scoring |
| **Suporte técnico básico** | IA resolve questões simples sem humano | IA HeziomOS |
| **Aprendizado contínuo** | Melhora com interações anteriores | Fine-tuning/RAG |
| **Entrega de materiais** | IA entrega conteúdos automaticamente | Fluxo automático |

### 2.7 Integrações

| Funcionalidade | Detalhe | Equivalente HeziomOS |
|---|---|---|
| **Webhook** | Comunicação em tempo real entre sistemas | Supabase Edge Functions |
| **CRM externo** | Integração com CRMs de terceiros | N/A (CRM próprio) |
| **Plataformas de checkout** | Integração para recuperação de carrinho | Webhook Tray/Literarius |
| **N8N / Make** | Automações low-code | Supabase Edge Functions |
| **Instagram** | Automações para Instagram (mencionado mas sem detalhe) | Meta Graph API |
| **Coexistência** | Mesmo número no app celular + API simultaneamente | Configuração Meta |

### 2.8 Métricas e Relatórios

| Funcionalidade | Detalhe | Equivalente HeziomOS |
|---|---|---|
| **Métricas de campanha** | Leads, cliques, janelas, conversão | Dashboard HeziomOS |
| **Confirmação de entrega** | Envio, entrega, leitura em tempo real | WhatsApp Cloud API callbacks |
| **Monitoramento de cliques** | Rastreia cliques em botões e links | Webhook de eventos |
| **Reputação da conta** | Feedbacks da Meta sobre saúde da conta | Meta Business API |

---

## 3. Modelo de Precificação (referência, válido desde 01/07/2025)

| Tipo | Fora da Janela | Dentro da Janela |
|---|---|---|
| **Template Utilidade** | ~US$ 0.0068 (~R$ 0,04) | Grátis |
| **Template Marketing** | ~US$ 0.0625 (~R$ 0,36) | Pago (mesmo valor) |
| **Mensagem livre (sem template)** | Não permitida | Grátis |
| **Janela CTWA (72h)** | N/A | Grátis (exceto template MKT) |
| **Conversas de serviço (iniciadas pelo cliente)** | N/A | 100% gratuitas |

---

## 4. Regras e Riscos (Meta)

| Regra | Consequência de violação |
|---|---|
| Não enquadrar MKT como Utilidade | Bloqueio de templates por 30 dias; reincidência = bloqueio API + BM |
| Templates precisam de aprovação Meta | Mensagem não entrega se não aprovado |
| Disparo fora da janela sem template | Mensagem não entrega |
| Não incluir opt-out em MKT | Reduz reputação, aumenta bloqueios |
| Consentimento (opt-in) | Obrigatório para iniciar conversa |

---

## 5. O que o HeziomOS precisa replicar (checklist de paridade)

### Prioridade Alta (core operacional)
- [x] Envio de templates Marketing e Utilidade via WhatsApp Cloud API
- [x] Recebimento de mensagens via webhook (substituir Unnichat + Flowbiz)
- [ ] Condicional de janela (verificar se janela aberta antes de cobrar template)
- [ ] Distribuição automática de chats entre atendentes
- [ ] CRM com pipes/funil e tags
- [ ] Lead Scoring
- [ ] Fluxos com condições (if/else, palavra-chave, tags)

### Prioridade Média (diferenciação)
- [ ] Detecção de palavra-chave para trigger de fluxo
- [ ] Contador de interações por Lead
- [ ] Tagueamento automático por ação
- [ ] Recuperação de carrinho (webhook checkout → sequência temporizada)
- [ ] Métricas de campanha (dashboard)
- [ ] Randomizador (A/B test de templates)

### Prioridade Baixa (nice-to-have)
- [ ] IA de atendimento (resposta automática contextual)
- [ ] Importação de fluxos prontos (recipes)
- [ ] Fluxo de Certificado Magnético
- [ ] Automações Instagram

---

## 6. Notas

- O PDF é **comercial/estratégico**, não técnico. Não contém endpoints de API, schemas de webhook, ou documentação de developer.
- Para integração técnica, a referência é a [WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api) diretamente.
- O token permanente já foi extraído (ver `Credenciais — Meta, Google Ads e WhatsApp.md`) e cobre todas as funcionalidades descritas (mesmo app/token para Flowbiz e Unnichat).
- A Unnichat é apenas uma **camada de UI/automação** sobre a API oficial — o HeziomOS substitui essa camada.
