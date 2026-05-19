# PROJECT_REQUIREMENTS — TriviaAgents

> Última atualização: 2026-05-18  
> Status: MVP concluído (Fase 1)

---

## Visão do Produto

Plataforma SaaS multi-tenant para criação e operação de agentes de IA de atendimento via WhatsApp. Empresas configuram agentes com identidade, conhecimento e regras, conectam ao WhatsApp e automatizam o atendimento — com controle total via pipeline kanban e histórico de conversas.

---

## Módulos e Funcionalidades

### 1. Agentes

Entidade central. Cada agente é um atendente virtual configurável.

**Abas de configuração:**
- **Visão Geral:** display_name, slug (name), modelo Claude, identity_md
- **Conhecimento:** documentos markdown com drag-and-drop de ordenação
- **Regras:** horário de atendimento por dia, limite de mensagens diárias, gatilhos de handoff, mensagem de handoff
- **Correções:** pares (contexto → resposta errada → resposta correta) para lições aprendidas
- **Canais:** configuração WhatsApp via Evolution API / Z-API / Meta Cloud API
- **Especialistas:** seleção de especialistas + campo `when_to_call` (texto livre)
- **Playground:** chat de teste em tempo real com o agente

### 2. Especialistas

Entidades tenant-scoped independentes. Reutilizáveis entre múltiplos agentes.

**Características:**
- Mesmas abas de configuração do agente (Visão Geral, Conhecimento, Regras, Correções, Especialistas, APIs, Playground)
- APIs Externas ficam no especialista (não no agente)
- Vínculo via `agent_specialist_links` com `when_to_call` texto livre
- Especialistas podem chamar outros especialistas (recursivo via mesmo mecanismo)
- `specialist-runner` Edge Function executa com contexto próprio

### 3. Pipeline

Kanban visual de todas as conversas em tempo real.

**Características:**
- Colunas configuráveis (criar, renomear, reordenar, excluir)
- Regras automáticas de movimentação (por status ou palavra-chave)
- Badge Robô/Humano em cada card
- Indicador de quem assumiu a conversa
- Vincular cliente ao card
- Clique no card navega para timeline completa

### 4. Conversas

Timeline completa de cada atendimento.

**Características:**
- Grupos por data, realtime via Supabase Realtime
- Tipos de mensagem: texto, imagem, áudio, multi (texto+imagem), tool_use (tool calls)
- **Human Takeover:** analista assume conversa → IA bloqueada → exclusividade por analista
- Handoff banner quando status = handoff
- Human Reply Bar para enviar mensagens como atendente
- Correção inline: hover em qualquer resposta do agente abre modal de correção
- Devolver ao agente após atendimento humano
- Encerrar conversa

### 5. Clientes

Base de contatos com histórico completo.

**Características:**
- CRUD: nome, telefone, email, empresa, notas
- Drawer lateral ao clicar: aba Dados (edição) + aba Histórico (conversas vinculadas)
- Histórico mostra: data, agente, status, contagem de mensagens, link direto
- Vincular conversa a cliente via pipeline card ou tela de conversas

### 6. Dashboard

Visão operacional em tempo real.

**KPIs Linha 1 (operacionais):**
- Agentes Ativos
- Conversas Hoje
- Handoffs Pendentes
- Custo do Mês (R$)

**KPIs Linha 2 (atendimento):**
- Taxa de Resolução IA (% conversas encerradas sem handoff)
- Contatos Únicos (telefones distintos)
- Agente Mais Ativo (7 dias)

**Gráficos:**
- Uso de Tokens — últimos 7 dias (BarChart)
- Volume por Status — Ativo / Handoff / Encerrado (BarChart com cores)
- Top 5 Agentes — últimos 7 dias (lista com barra proporcional)
- Conversas Recentes

### 7. Tokens

Rastreamento de custos por chamada ao modelo.

**Campos por registro:**
- `input_tokens`, `output_tokens`, `cached_input_tokens`
- `cost_brl` calculado com pricing da Anthropic
- Agrupável por agente, por dia, por conversa

### 8. Admin

Gestão de usuários e papéis (admin / superadmin apenas).

**Funcionalidades:**
- Listar usuários do tenant
- Criar / editar usuário
- Definir papel: `agent` | `admin` | `superadmin`

### 9. Landing Page e Documentação

**Landing (`/`):**
- Página pública com hero, como funciona, features, benefícios
- Redirect automático para `/dashboard` se autenticado

**Docs (`/docs`):**
- Página pública de documentação completa
- 7 seções cobrindo todos os módulos
- Sidebar de navegação com âncoras

---

## Banco de Dados — Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `agents` | Agentes de IA |
| `agent_rules` | Regras de operação por agente (1:1) |
| `knowledge_docs` | Documentos de conhecimento por agente |
| `corrections` | Correções de resposta por agente |
| `channels` | Configuração de canal WhatsApp por agente |
| `specialists` | Especialistas tenant-scoped independentes |
| `agent_specialist_links` | Vínculo agente↔especialista com `when_to_call` |
| `specialist_knowledge_docs` | Conhecimento por especialista |
| `specialist_rules` | Regras por especialista (1:1) |
| `specialist_corrections` | Correções por especialista |
| `specialist_apis` | APIs externas por especialista |
| `conversations` | Conversas com contato |
| `messages` | Mensagens de uma conversa |
| `customers` | Base de clientes |
| `pipeline_columns` | Colunas do kanban |
| `pipeline_rules` | Regras automáticas do pipeline |
| `token_usage_log` | Registro de uso de tokens por chamada |
| `api_keys` | Chaves Anthropic por tenant |
| `users` | Perfis de usuário (extends Supabase Auth) |

---

## Edge Functions

| Função | Descrição |
|--------|-----------|
| `agent-runner` | Executa o agente: carrega contexto, chama Claude, processa tool use |
| `specialist-runner` | Executa um especialista com seu próprio contexto |
| `webhook-whatsapp` | Recebe mensagens do WhatsApp e dispara agent-runner |
| `webhook-instagram` | Recebe mensagens do Instagram |
| `webhook-facebook` | Recebe mensagens do Facebook |
| `human-send` | Envia mensagem humana via canal configurado |

---

## Regras de Segurança

- RLS FORCE habilitado em **todas** as tabelas
- Policies filtram por `tenant_id` (ou join via agente)
- Nenhuma secret no frontend (apenas `VITE_SUPABASE_URL` e publishable key)
- Edge Functions validam JWT via `auth.getUser()`
- Inputs validados com Zod em todas as Edge Functions
- API Key Anthropic armazenada em `api_keys` criptografada

---

## Fase 1 — Concluída (2026-05-12)

| Story | Status |
|-------|--------|
| STORY-001 — Pipeline CRM v2 | ✅ concluido |
| STORY-002 — Especialistas Redesign | ✅ concluido |
| STORY-003 — Landing Page e Documentação | ✅ concluido |
| STORY-004 — Dashboard v2 | ✅ concluido |
| STORY-005 — Histórico de Clientes | ✅ concluido |
| STORY-006 — Human Takeover | ✅ concluido |
| STORY-007 — Visual Polish | ✅ concluido |
