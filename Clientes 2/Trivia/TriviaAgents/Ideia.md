# PROJECT REQUIREMENTS — Jimmy Agents

> **Documento vivo.** Toda mudança de escopo, decisão técnica ou regra de negócio é refletida aqui antes de virar código. **Documentação é código.**

---

## 1. Identificação do Projeto

|Campo|Valor|
|---|---|
|**Nome**|Jimmy Agents|
|**Versão**|0.1.0 (MVP)|
|**Tipo**|SaaS multi-tenant — Plataforma de agentes IA conversacionais|
|**Owner técnico**|Lucas Azevedo|
|**Owner comercial**|João Gualberto Novais|
|**Stack alvo**|React + Vite + TypeScript + Tailwind • Supabase (Postgres + Edge Functions + Auth) • Netlify (CI/CD via Git) • Z-API (WhatsApp) • Claude API (BYOK)|
|**Prazo MVP**|4 semanas|
|**Status**|Em especificação|

---

## 2. Visão e Posicionamento

### 2.1. One-liner

Plataforma de criação de agentes IA conversacionais com personalidade, base de conhecimento em markdown, regras operacionais e memória corrigível — operando via WhatsApp com handoff humano controlado.

### 2.2. Analogia de produto

"Fábrica de SDRs IA". Cada agente é um funcionário digital configurável: você define quem ele é, o que ele sabe, quando ele trabalha, quando ele passa pra um humano. Quando ele erra, você corrige uma vez e ele aprende pra sempre.

### 2.3. Diferenciais

1. **Base de conhecimento em markdown editável** — sem RAG, sem chunking, sem complexidade. O conteúdo vai direto no contexto do modelo.
2. **Memória corrigível** — toda correção feita por um humano vira lição permanente injetada no prompt. O agente nunca repete o mesmo erro.
3. **Regras operacionais explícitas** — horário, limite, handoff. O agente não opera fora do que foi configurado. Caso marque como tratada por humano IA nao interage mais
4. **BYOK nativo** — o cliente conecta sua própria chave Anthropic/OpenRouter. Controle de gasto fica com ele.
5. **Handoff humano de primeira classe** — não é um plugin, é parte do core. Conversas em handoff são invisíveis pro agente.
6. Visão de volume de atendimentos
7. Tem um CRM minimo para ter as informações do cliente e ver se aquele contato foi tratado, uma pipeline de vendas

### 2.4. Não-objetivos do MVP

- Não é um construtor visual no-code (Jimmy Agents Visual — fase 2)
- Não é um CRM (JimmyAtende cobre essa frente)
- Não é multi-canal (só WhatsApp via Z-API — Telegram/Slack/Teams/Discord ficam pra fase 2)
- Não tem RAG vetorial (base markdown direto no prompt)
- Não tem capability marketplace (capabilities são hardcoded no core)

---

## 3. Personas e Casos de Uso

### 3.1. Personas

|Persona|Descrição|Necessidade primária|
|---|---|---|
|**Operador**|Dono ou gestor que cria e mantém o agente|Criar agente, editar conhecimento, corrigir erros, acompanhar conversas|
|**Atendente humano**|Pessoa que recebe o handoff e assume a conversa|Ser notificado, ver histórico, assumir e devolver conversas|
|**Contato final**|Cliente da empresa que conversa pelo WhatsApp|Ser atendido com qualidade, ser transferido quando necessário|

### 3.2. Caso de uso primário (vertical farmácia — demo)

1. Cliente envia foto de receita médica para o WhatsApp da farmácia
2. Agente recebe, lê a imagem (Claude Vision) e valida contra checklist de normas de manipulação
3. Se algo estiver errado → responde explicando o que falta/está incorreto
4. Se estiver tudo certo → diz que vai transferir e marca a conversa como handoff
5. Durante o atendimento humano, agente fica em silêncio naquela conversa
6. Em paralelo, caso nao esteja marcado para somente humano atender, agente responde dúvidas gerais sobre manipulação, prazos, formas farmacêuticas (com base no conhecimento configurado)

### 3.3. Caso de uso genérico (qualquer vertical)

Operador cria agente "SDR Imobiliária X" → cola base de conhecimento sobre os imóveis → define horário 9-19h seg-sáb → conecta número Z-API → agente atende leads, qualifica e marca handoff quando lead é qualificado.

---

## 4. Escopo Funcional do MVP

### 4.1. Features incluídas

#### F1 — Gestão de Agentes

- Criar/editar/pausar/ativar agente
- Cada agente tem: nome, identidade (markdown), número WhatsApp, instância Z-API, API key (BYOK), modelo LLM
- Status: `ativo`, `pausado`

#### F2 — Base de Conhecimento (Markdown)

- N documentos markdown por agente
- Editor de markdown no painel (com preview)
- Ordem definida pelo operador (drag and drop)
- Documentos são concatenados no system prompt em ordem
- Limite recomendado: ~50k tokens totais por agente

#### F3 — Regras Operacionais

- **Horário de trabalho:** dias da semana + janelas de horário
- **Mensagem fora do horário:** texto fixo enviado automaticamente
- **Limite diário por contato:** N mensagens/dia (após, vira handoff automático)
- **Gatilhos de handoff:** lista de palavras-chave que forçam handoff
- **Mensagem de handoff:** texto enviado ao contato quando handoff é acionado

#### F4 — Memória Corrigível

- Operador abre conversa → seleciona mensagem do agente → "Corrigir"
- Preenche: contexto (quando), resposta errada (auto), resposta correta
- Correção fica ativa e é injetada no system prompt em todas as chamadas futuras
- Operador pode desativar/editar/deletar correções
- Correções são por agente (não compartilhadas entre agentes)

#### F5 — Handoff Humano

- Conversa pode estar em status `ativo` ou `handoff`
- Em `handoff`, agente não responde àquela conversa
- Handoff pode ser acionado por:
    - Gatilho automático (palavra-chave, limite, fora do horário, tool call do próprio agente)
    - Botão manual do operador no painel
- Retomada: operador clica "Devolver para o agente" → status volta a `ativo`
- Notificação visual no painel quando há handoff novo

#### F6 — Canal WhatsApp (Z-API)

- Conexão de instância Z-API por agente (URL + token, encrypted)
- Webhook recebe mensagens (texto + imagem)
- Envio de mensagens (texto + imagem suportados no MVP)
- Marcação de mensagem como lida

#### F7 — Visão de Conversas

- Lista de conversas (filtros: status, agente, contato)
- Timeline de mensagens com indicadores (corrigida, handoff, fora do horário)
- Histórico completo persistido

#### F8 — Capability de Visão (Imagem)

- Quando contato envia imagem, agente baixa via Z-API e envia ao Claude Vision junto da mensagem
- Não há OCR separado — o modelo multimodal faz tudo
- Usado especialmente para o caso farmácia (receita médica)

#### F9 — BYOK (Bring Your Own Key)

- Cliente conecta chave Anthropic ou OpenRouter
- Chave armazenada encrypted (pgcrypto) no Supabase
- Descriptografada apenas no momento da chamada (Edge Function)
- Operador pode rotacionar/trocar chave

#### F10 — Controle de Gastos (Token Guard)

- Toda chamada LLM registra: tokens input, output, cached, modelo, custo estimado (USD e BRL)
- Dashboard simples: consumo diário e mensal por agente
- Limite configurável: máximo de turns por mensagem (default 6)
- Alerta visual quando consumo do mês ultrapassa threshold

### 4.2. Features explicitamente fora do MVP

|Feature|Justificativa|Fase|
|---|---|---|
|Telegram, Slack, Teams, Discord, Instagram, LinkedIn|Foco em vender com WhatsApp primeiro|2|
|API Oficial Meta, Evolution API|Z-API resolve no MVP|2|
|RAG vetorial (pgvector)|Base markdown direto no prompt é suficiente até 50k tokens|2|
|Capability marketplace|Capabilities ainda são hardcoded|2|
|Self-service signup público|Cadastro só pelo admin no MVP|2|
|Cobrança via Mercado Pago|Fora do escopo simplificado|2|
|Sub-agentes orquestrados|1 agente, 1 prompt no MVP|2|
|Construtor visual no-code|Jimmy Agents Visual é produto separado|3|
|Multi-idioma de interface|Português apenas|2|
|App mobile nativo|Painel web responsivo é suficiente|3|

---

## 5. Requisitos Não-Funcionais

|Categoria|Requisito|
|---|---|
|**Disponibilidade**|99% no MVP (sem SLA contratual). Z-API tem disponibilidade própria que escapa do nosso controle.|
|**Performance**|Resposta do agente ao contato em ≤ 8s no caso médio (sem visão), ≤ 15s com imagem.|
|**Segurança**|Chaves BYOK e tokens Z-API encrypted em repouso. RLS habilitado em todas as tabelas. HTTPS obrigatório.|
|**Auditabilidade**|Toda mensagem enviada/recebida persistida. Todo uso de token logado. Toda correção rastreável.|
|**Custo de infra MVP**|< R$ 200/mês (Supabase free tier + Netlify free tier + Z-API por instância).|
|**Custo de LLM**|Por conta do cliente (BYOK). Plataforma exibe estimativa em BRL.|
|**Idioma**|Interface e prompts default em pt-BR.|
|**Compliance receita médica**|A plataforma NÃO substitui validação humana. Agente sempre transfere receitas válidas pra um farmacêutico humano. Disclaimer visível.|

---

## 6. Arquitetura Técnica

### 6.1. Stack confirmada

|Camada|Tecnologia|Razão|
|---|---|---|
|Frontend|React 18 + Vite + TypeScript + Tailwind + shadcn/ui|Padrão Trívia / Bulletproof React|
|Hospedagem frontend|**Netlify** integrado ao Git (deploy automático em push na branch `main`)|CI/CD zero-config, preview por PR|
|Auth|Supabase Auth (email + senha)|Built-in|
|Banco de dados|Supabase Postgres|RLS multi-tenant, pgcrypto pra BYOK|
|Backend lógico|**Supabase Edge Functions (Deno)**|Webhooks Z-API, agent runner, integração LLM|
|Storage|Supabase Storage|Imagens de receita/conversa|
|Secrets|**Variáveis de ambiente do Supabase Edge Functions** (`supabase secrets set`)|Chaves de plataforma, encryption keys|
|LLM|Claude API (Anthropic) ou OpenRouter — escolhido por agente (BYOK)|BYOK + flexibilidade de modelo|
|WhatsApp|Z-API (1 instância por agente)|Simples, barato, sem burocracia Meta|
|Versionamento|Git (GitHub)|Padrão|
|CI/CD|Netlify (frontend) + Supabase CLI deploy (Edge Functions) acionado via GitHub Action|Doc-as-code, deploys reproduzíveis|

### 6.2. Decisão arquitetural: por que Edge Functions e não worker dedicado

Considerei worker em VPS Hetzner com fila. Decidi por **Edge Functions** no MVP pelos motivos:

1. **Latência:** Z-API webhook → Edge Function → resposta Claude → Z-API leva ≤ 8s no caso médio. Edge Function tem timeout de ~150s, mais que suficiente.
2. **Custo:** zero infra adicional. Sem VPS, sem Redis, sem fila.
3. **Stateless friendly:** estado da conversa vive no Postgres. Cada webhook é uma execução independente.
4. **Operacional:** zero servidor pra cuidar. Deploy via `supabase functions deploy`.

**Quando migrar pra worker:** quando aparecer fluxo de longa duração (ex: agente que faz follow-up agendado, ou processamento batch). Hoje não é o caso.

### 6.3. Fluxo de mensagem entrante

```
WhatsApp do contato
   │
   ▼
Z-API (webhook)
   │  POST https://<projeto>.supabase.co/functions/v1/zapi-webhook
   ▼
Edge Function: zapi-webhook
   │  1. Valida token Z-API (compara com env var)
   │  2. Identifica agente pelo número de destino
   │  3. Cria/recupera conversa
   │  4. Persiste mensagem (texto + URL da mídia se houver)
   │  5. Responde 200 OK imediato pra Z-API
   │  6. Dispara Edge Function agent-runner via fetch async
   ▼
Edge Function: agent-runner
   │  1. Verifica status da conversa (ignora se handoff)
   │  2. Verifica regras: horário, limite diário
   │  3. Verifica gatilhos de handoff automático
   │  4. Carrega: identidade + knowledge_docs ordenados + corrections ativas + últimas N mensagens
   │  5. Monta system prompt completo
   │  6. TokenGuard.check() — bloqueia se exceder budget
   │  7. Descriptografa BYOK + chama Claude (com vision se imagem)
   │  8. Loop tool use (max_turns configurável, default 6)
   │  9. Se tool solicitar_handoff foi chamada → marca conversa
   │  10. TokenGuard.log() — registra consumo real
   │  11. Envia resposta via Z-API helper
   ▼
Z-API → WhatsApp do contato
```

### 6.4. Variáveis de ambiente (Supabase Edge Functions)

Configuradas via `supabase secrets set` ou painel do Supabase:

|Nome|Descrição|
|---|---|
|`SUPABASE_URL`|URL do projeto (auto)|
|`SUPABASE_SERVICE_ROLE_KEY`|Service role pra Edge Function ter bypass de RLS|
|`ENCRYPTION_KEY`|Chave simétrica usada por pgcrypto pra encrypt/decrypt BYOK e tokens Z-API|
|`ZAPI_WEBHOOK_SECRET`|Secret compartilhado com Z-API pra validar webhook|
|`ANTHROPIC_API_KEY_FALLBACK`|(opcional) Chave da plataforma usada quando agente não tem BYOK configurado em ambiente de teste|
|`LOG_LEVEL`|`debug` / `info` / `warn` / `error`|
|`MAX_TURNS_DEFAULT`|Limite global de turns por mensagem (default `6`)|

### 6.5. Integração Git ↔ Netlify ↔ Supabase

**Frontend (Netlify):**

- Repositório GitHub conectado ao Netlify
- Branch `main` → deploy automático em produção
- Branches feature → preview deploys automáticos
- Variáveis de ambiente do frontend (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) configuradas no Netlify

**Edge Functions (Supabase):**

- Diretório `supabase/functions/` versionado no Git
- GitHub Action em `.github/workflows/deploy-functions.yml`:
    - Trigger: push em `main` que altere arquivos em `supabase/functions/**` ou `supabase/migrations/**`
    - Steps: setup Supabase CLI → `supabase functions deploy` → `supabase db push`
    - Secret no GitHub: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`

**Migrations:**

- Versionadas em `supabase/migrations/`
- Deploy via mesma GitHub Action

---

## 7. Modelo de Dados

### 7.1. Tabelas principais

```sql
-- Tenancy
tenants (id, name, created_at)
users (id PK ref auth.users, tenant_id, email, role)

-- BYOK
api_keys (id, tenant_id, provider, key_encrypted, alias, created_at)
  -- provider: 'anthropic' | 'openrouter'

-- Agentes
agents (
  id, tenant_id, name,
  identity_md text,
  whatsapp_number text,
  zapi_instance_id text,
  zapi_token_encrypted text,
  api_key_id uuid,
  model text default 'claude-sonnet-4-5',
  status text default 'ativo',     -- 'ativo' | 'pausado'
  created_at, updated_at
)

knowledge_docs (
  id, agent_id, title, content_md, order_idx,
  created_at, updated_at
)

agent_rules (
  agent_id PK,
  work_hours jsonb,                 -- {"seg":[9,18],"ter":[9,18],...}
  out_of_hours_message text,
  max_messages_per_contact_day int default 50,
  handoff_triggers text[] default '{}',
  handoff_message text,
  updated_at
)

corrections (
  id, agent_id,
  trigger_context text,             -- "quando perguntarem sobre desconto"
  wrong_response text,
  correct_response text,
  active boolean default true,
  created_at
)

-- Conversas
conversations (
  id, tenant_id, agent_id,
  contact_phone text,
  contact_name text,
  status text default 'ativo',      -- 'ativo' | 'handoff' | 'encerrado'
  handoff_at timestamptz,
  handoff_reason text,
  handoff_by uuid,                  -- user que assumiu
  message_count_today int default 0,
  last_message_at timestamptz,
  created_at timestamptz
)

messages (
  id, conversation_id,
  role text,                        -- 'user' | 'assistant' | 'tool'
  content jsonb,                    -- {type:'text'|'image'|'tool_use', text, image_url, tool_name, tool_input}
  was_corrected boolean default false,
  created_at
)

-- Token Guard
token_usage_log (
  id bigserial, tenant_id, agent_id, conversation_id,
  model, input_tokens, output_tokens, cached_input_tokens,
  cost_usd numeric(12,6), cost_brl numeric(12,4),
  created_at
)
```

### 7.2. Políticas RLS

Todas as tabelas multi-tenant têm RLS habilitada com policy padrão:

```sql
USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()))
```

Edge Functions usam `SUPABASE_SERVICE_ROLE_KEY` para bypass de RLS quando necessário (webhook entrante não tem usuário autenticado).

### 7.3. Encryption

`pgcrypto` instalado. Helper functions:

```sql
encrypt_secret(text) returns text  -- pgp_sym_encrypt com ENCRYPTION_KEY
decrypt_secret(text) returns text  -- pgp_sym_decrypt
```

---

## 8. Construção do Prompt (Core do Agente)

O system prompt é montado dinamicamente a cada chamada, na seguinte ordem:

```
1. CABEÇALHO DO SISTEMA
   "Você é um agente de atendimento operando via WhatsApp.
    Responda sempre em português do Brasil, de forma concisa e clara."

2. IDENTIDADE (do agents.identity_md)
   Conteúdo markdown da identidade do agente

3. BASE DE CONHECIMENTO (concatenação ordenada de knowledge_docs)
   ## [título do doc 1]
   [conteúdo]
   ## [título do doc 2]
   [conteúdo]
   ...

4. LIÇÕES APRENDIDAS (corrections ativas)
   ## Lições aprendidas — siga sempre estas correções
   - CONTEXTO: [trigger_context]
     ERRADO: [wrong_response]
     CORRETO: [correct_response]
   ...

5. REGRAS OPERACIONAIS
   Horário atual: [calculado]
   Você está [dentro/fora] do horário de trabalho.
   Total de mensagens hoje com este contato: [N] / [limite]

6. INSTRUÇÕES DE HANDOFF
   "Se em qualquer momento o contato pedir atendimento humano,
    se você não souber a resposta, ou se a situação fugir das suas
    instruções, chame a tool 'solicitar_handoff' com um motivo claro."

7. FERRAMENTAS DISPONÍVEIS
   - solicitar_handoff(motivo: string)
```

**Prompt caching:** As partes 1–4 são marcadas com `cache_control: ephemeral` pra aproveitar o desconto da Anthropic em conversas recorrentes.

---

## 9. Fluxos Críticos

### 9.1. Handoff automático

Disparado quando:

- Tool `solicitar_handoff` é chamada pelo agente
- Mensagem do contato contém qualquer `handoff_trigger`
- `message_count_today` excede `max_messages_per_contact_day`
- Mensagem chega fora do `work_hours` (responde com `out_of_hours_message` e marca handoff)

### 9.2. Correção de resposta

1. Operador abre conversa no painel
2. Clica em mensagem do agente → menu "Corrigir"
3. Modal abre com: `trigger_context` (vazio), `wrong_response` (preenchido), `correct_response` (vazio)
4. Operador preenche e salva
5. Backend cria registro em `corrections`
6. Marca a mensagem original com `was_corrected = true`
7. Próxima chamada ao LLM daquele agente já inclui a nova correção no system prompt

### 9.3. Retomada de conversa após handoff

1. Operador finaliza atendimento humano
2. Clica em "Devolver para o agente" ou "Encerrar"
3. Status muda para `ativo` ou `encerrado`
4. Se voltar pra `ativo`, agente passa a responder novas mensagens dali pra frente

### 9.4. Vertical Farmácia — fluxo completo

1. Cliente envia foto de receita
2. Webhook recebe, baixa imagem, anexa à mensagem como `content: {type:'image', image_url}`
3. Agent runner monta prompt incluindo doc específico de farmácia (`validacao_receita.md`)
4. Claude Vision analisa a imagem com base no checklist do markdown
5. Duas saídas possíveis:
    - **Receita com problema:** responde texto detalhando o que falta (data vencida, falta CRM, ilegível, etc.)
    - **Receita ok:** responde "Recebi sua receita, vou te encaminhar para nosso farmacêutico" + chama tool `solicitar_handoff(motivo: "receita validada — aguardando farmacêutico")`
6. Dúvidas gerais durante o aguardo continuam sendo respondidas pelo agente (a menos que esteja em handoff)

---

## 10. Estrutura do Repositório

```
jimmy-agents/
├── .github/
│   └── workflows/
│       └── deploy-functions.yml          # CI: deploy Edge Functions + migrations
├── apps/
│   └── web/                              # Frontend Netlify
│       ├── src/
│       │   ├── app/                      # router, providers
│       │   ├── features/
│       │   │   ├── auth/
│       │   │   ├── agents/               # CRUD agente
│       │   │   ├── knowledge/            # editor markdown
│       │   │   ├── rules/                # config de regras operacionais
│       │   │   ├── conversations/        # viewer + correção
│       │   │   ├── corrections/          # gestão de correções
│       │   │   └── tokens-dashboard/
│       │   ├── lib/
│       │   │   ├── supabase.ts
│       │   │   └── zod-schemas.ts
│       │   └── components/ui/            # shadcn/ui
│       ├── netlify.toml
│       ├── vite.config.ts
│       └── package.json
├── supabase/
│   ├── functions/
│   │   ├── _shared/
│   │   │   ├── llm.ts                    # cliente Anthropic + OpenRouter
│   │   │   ├── zapi.ts                   # cliente Z-API
│   │   │   ├── crypto.ts                 # encrypt/decrypt helpers
│   │   │   ├── prompt-builder.ts         # monta system prompt
│   │   │   ├── token-guard.ts
│   │   │   └── pricing.ts
│   │   ├── zapi-webhook/
│   │   │   └── index.ts
│   │   ├── agent-runner/
│   │   │   └── index.ts
│   │   └── correction-apply/
│   │       └── index.ts
│   ├── migrations/
│   │   ├── 0001_init.sql
│   │   ├── 0002_rls_policies.sql
│   │   └── 0003_seed_demo.sql
│   └── config.toml
├── docs/
│   ├── PROJECT_REQUIREMENTS.md           # este arquivo
│   ├── ARCHITECTURE.md
│   ├── PROMPT_DESIGN.md
│   └── RUNBOOK.md
├── .gitignore
├── README.md
└── package.json
```

---

## 11. Plano de Entrega (4 semanas)

### Semana 1 — Fundação

**Objetivo:** Edge Function recebe webhook Z-API, chama Claude, responde texto simples.

- [ ] Repo no GitHub + estrutura monorepo
- [ ] Projeto Supabase criado + variáveis de ambiente configuradas
- [ ] Migrations: tabelas core (`tenants`, `users`, `agents`, `messages`, `conversations`, `api_keys`)
- [ ] Helper de encryption funcionando
- [ ] Edge Function `zapi-webhook` recebendo e persistindo
- [ ] Edge Function `agent-runner` com loop mínimo (sem corrections, sem rules)
- [ ] Netlify conectado ao GitHub, frontend "Hello World" no ar
- [ ] GitHub Action deployando Edge Functions

**Marco:** mandar "oi" no WhatsApp do agente demo e receber resposta gerada pelo Claude.

### Semana 2 — Painel + Conhecimento

**Objetivo:** operador cria agente e configura conhecimento pelo painel.

- [ ] Auth no frontend (login/logout)
- [ ] CRUD de agente (criar, editar, listar, pausar)
- [ ] Editor markdown de `knowledge_docs` com preview
- [ ] Drag-and-drop pra reordenar docs
- [ ] Viewer de conversas com timeline
- [ ] Connection helper Z-API (testa instância + número)

**Marco:** criar um agente pelo painel, colar uma base de conhecimento, conversar com ele.

### Semana 3 — Regras + Memória Corrigível + Handoff

**Objetivo:** o diferencial da plataforma funcional.

- [ ] Config de `agent_rules` (horário, limite, gatilhos, mensagens)
- [ ] Lógica de horário/limite no `agent-runner`
- [ ] Tool `solicitar_handoff` registrada e tratada
- [ ] Modal de correção no viewer de conversas
- [ ] Tabela `corrections` + injeção no prompt
- [ ] Botão manual "Assumir conversa" / "Devolver para o agente"
- [ ] Notificação visual de novos handoffs

**Marco:** corrigir uma resposta errada e ver o agente acertar na próxima.

### Semana 4 — Vision (farmácia) + Polimento + Demo

**Objetivo:** vertical farmácia funcionando + plataforma apresentável.

- [ ] Suporte a imagem no webhook (download da mídia Z-API + upload no Storage)
- [ ] Envio de imagem ao Claude Vision no `agent-runner`
- [ ] Agente farmácia configurado com docs de validação de receita
- [ ] Dashboard de tokens (consumo diário + estimativa BRL)
- [ ] Tratamento de erros: BYOK inválido, Z-API offline, LLM falhou
- [ ] Vídeo demo de 90s
- [ ] 1-pager comercial

**Marco:** demo end-to-end da farmácia gravada e plataforma estável pra mostrar a prospect.

---

## 12. Critérios de Aceite (por feature)

### F1 — Agente

- [ ] Operador consegue criar agente com nome, identidade, número e BYOK
- [ ] Agente em status `pausado` não responde a webhooks
- [ ] Editar identidade reflete na próxima resposta

### F2 — Base de Conhecimento

- [ ] Operador cria, edita, deleta documentos markdown
- [ ] Ordem dos docs é respeitada no system prompt
- [ ] Preview do markdown renderizado funciona

### F3 — Regras Operacionais

- [ ] Mensagem fora do horário recebe `out_of_hours_message`
- [ ] Contato que excede `max_messages_per_contact_day` é movido pra handoff
- [ ] Palavra-chave em `handoff_triggers` força handoff imediato

### F4 — Memória Corrigível

- [ ] Modal de correção carrega resposta original automaticamente
- [ ] Correção salva aparece como ativa por padrão
- [ ] Próxima chamada LLM inclui a correção no prompt
- [ ] Operador consegue desativar correção

### F5 — Handoff

- [ ] Tool `solicitar_handoff` muda status pra `handoff` e envia `handoff_message`
- [ ] Conversa em `handoff` não dispara `agent-runner`
- [ ] Operador devolve conversa pro agente e ela volta a `ativo`

### F6 — Z-API

- [ ] Webhook valida secret
- [ ] Mensagem entrante é persistida com mídia (se houver)
- [ ] Mensagem de resposta é entregue ao contato

### F7 — Conversas

- [ ] Lista paginada com filtros por status, agente
- [ ] Timeline mostra ordem cronológica, distingue user/assistant
- [ ] Indicadores visuais: `was_corrected`, `handoff`, `fora do horário`

### F8 — Visão

- [ ] Imagem enviada pelo contato chega ao agent-runner
- [ ] Claude Vision processa e responde baseado no conteúdo da imagem
- [ ] Caso farmácia retorna análise estruturada da receita

### F9 — BYOK

- [ ] Chave salva fica encrypted no banco
- [ ] Chave nunca aparece em log ou response
- [ ] Operador pode trocar chave sem perder agente

### F10 — Token Guard

- [ ] Toda chamada LLM gera registro em `token_usage_log`
- [ ] Custo USD e BRL calculados pela tabela de pricing
- [ ] Dashboard mostra consumo do dia e do mês

---

## 13. Riscos e Mitigações

|Risco|Probabilidade|Impacto|Mitigação|
|---|---|---|---|
|Z-API cair durante demo|Média|Alto|Tirar prints e vídeo gravado em backup|
|Claude Vision ler receita errado|Média|Alto|Prompt afinado + sempre encaminha pra humano em caso de dúvida|
|BYOK do cliente ficar sem crédito|Alta|Médio|TokenGuard captura 429/insufficient_credit, marca agente pausado e notifica operador|
|Loop de tool use sem fim|Baixa|Médio|`MAX_TURNS_DEFAULT=6`, hard limit|
|Vazamento de chave BYOK|Baixa|Crítico|Encrypted em repouso, nunca em log, service role só em Edge Function|
|Lucas atrasar por demandas Itaú|Alta|Médio|Buffer de sábado por semana, escopo enxuto|
|Receita médica e implicações regulatórias|Média|Alto|Disclaimer claro: agente não substitui farmacêutico, sempre faz handoff|
|Edge Function exceder timeout de 150s|Baixa|Médio|`max_turns=6` mantém execução < 30s no caso típico|

---

## 14. Métricas de Sucesso do MVP

|Métrica|Meta|
|---|---|
|Tempo de resposta médio (texto)|≤ 8s|
|Tempo de resposta médio (imagem)|≤ 15s|
|Taxa de handoff bem-sucedido|100% (sem perda de conversa)|
|Custo de LLM por conversa média (10 turns)|≤ R$ 0,30 (estimativa Sonnet com cache)|
|Tempo pra criar e colocar 1 agente novo no ar|≤ 30 min|
|Demo gravada de 90s|Entregue na semana 4|
|Primeiro prospect agendado|Semana 5|

---

## 15. Glossário

|Termo|Definição|
|---|---|
|**Agente**|Configuração completa (identidade + conhecimento + regras + canal) que conversa com contatos|
|**Operador**|Usuário humano que gerencia agentes no painel|
|**Contato**|Pessoa do outro lado do WhatsApp que conversa com o agente|
|**Handoff**|Transferência da conversa do agente para um humano|
|**Correção**|Lição registrada quando o operador ajusta uma resposta do agente|
|**BYOK**|Bring Your Own Key — cliente conecta a própria chave do LLM|
|**Capability**|Habilidade que o agente tem (no MVP: visão de imagem, handoff)|
|**Token Guard**|Mecanismo de medição e limite de consumo de tokens LLM|

---

## 16. Histórico de Versões

|Versão|Data|Autor|Mudança|
|---|---|---|---|
|0.1.0|2026-05-11|Lucas + Claude|Versão inicial do MVP (escopo simplificado pós-pivot)|

---

**Próximo documento a criar:** `ARCHITECTURE.md` (detalhamento técnico de cada Edge Function) e `PROMPT_DESIGN.md` (templates e estratégia de cache).