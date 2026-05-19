# Arquitetura — TriviaAgents

> Última atualização: 2026-05-18

---

## Stack

| Camada | Tecnologia | Por quê |
|--------|-----------|---------|
| Frontend | React 19 + Vite + Tailwind v4 + TypeScript | Padrão Trivia |
| Roteamento | TanStack Router (file-based) | Type-safe, SSR-ready |
| State/Cache | TanStack Query v5 | Cache + invalidação automática |
| UI | shadcn/ui | Componentes acessíveis, customizáveis |
| Backend | Supabase Edge Functions (Deno) | Serverless, deploy rápido |
| Banco | Supabase PostgreSQL | RLS nativo, Realtime |
| Auth | Supabase Auth | JWT, multi-tenant |
| Deploy Frontend | Netlify | Auto-deploy via git push |
| Deploy Backend | Supabase CLI | `supabase functions deploy` |
| IA | Anthropic Claude (Haiku / Sonnet / Opus) | Melhor em português, tool use nativo |
| WhatsApp | Evolution API / Z-API / Meta Cloud API | Multi-provider |

---

## Estrutura de Pastas

```
src/
├── routes/                    # Rotas file-based (TanStack Router)
│   ├── __root.tsx             # Layout raiz + providers
│   ├── _app.tsx               # Layout autenticado + guard
│   ├── index.tsx              # Landing page (/)
│   ├── login.tsx              # Login
│   ├── docs.tsx               # Documentação pública (/docs)
│   └── _app/
│       ├── dashboard.tsx
│       ├── pipeline.tsx
│       ├── customers.tsx
│       ├── tokens.tsx
│       ├── agents/
│       │   ├── index.tsx
│       │   ├── new.tsx
│       │   └── $agentId.tsx   # 7 abas: overview, knowledge, rules, corrections, channels, specialists, playground
│       ├── conversations/
│       │   ├── index.tsx
│       │   └── $conversationId.tsx
│       ├── specialists/
│       │   ├── index.tsx
│       │   └── $specialistId.tsx
│       └── admin/
│           └── users.tsx
│
├── features/                  # Módulos (Bulletproof React)
│   ├── agents/                # api/, components/, hooks/, types/
│   ├── specialists/           # tenant-scoped, reutilizáveis
│   ├── conversations/         # timeline, handoff, takeover
│   ├── pipeline/              # kanban, colunas configuráveis
│   ├── customers/             # base de clientes + histórico
│   ├── dashboard/             # KPIs, gráficos
│   ├── knowledge/             # docs por agente
│   ├── rules/                 # regras por agente
│   ├── corrections/           # correções por agente
│   ├── channels/              # configuração WhatsApp
│   ├── tokens/                # rastreamento de custos
│   └── admin/                 # gestão de usuários
│
├── components/
│   ├── ui/                    # shadcn components
│   └── layout/                # Sidebar, AppLayout
│
├── hooks/                     # Hooks compartilhados (useCurrentUser, etc.)
├── integrations/
│   └── supabase/              # client.ts, types.ts, auth-middleware.ts
└── lib/                       # utils.ts, error-capture.ts

supabase/
├── functions/
│   ├── agent-runner/          # executa o agente
│   ├── specialist-runner/     # executa o especialista
│   ├── webhook-whatsapp/      # recebe mensagens WA
│   ├── human-send/            # envia mensagem humana
│   └── _shared/               # prompt-builder, llm-client, crypto, zapi, meta
└── migrations/                # SQL migrations versionadas
```

---

## Fluxo de uma Mensagem Recebida

```
WhatsApp → Evolution API → webhook-whatsapp (Edge Function)
  ↓
Verifica conversation (cria se não existe)
  ↓
Verifica assumed_by — se preenchido: ignora (humano está atendendo)
  ↓
agent-runner (Edge Function)
  ↓
Carrega: agent + rules + knowledge_docs + corrections + specialist_links
  ↓
buildSystemPrompt() → blocos cacheáveis (identidade, conhecimento, correções, especialistas)
  ↓
Claude API (streaming ou single-shot)
  ↓
Tool use loop (specialist-runner, solicitar_handoff)
  ↓
Salva mensagem no banco → envia resposta ao WhatsApp
```

---

## Fluxo de um Especialista

```
agent-runner detecta tool use `chamar_especialista__nome`
  ↓
specialist-runner (Edge Function)
  ↓
Carrega: specialist + specialist_knowledge_docs + specialist_rules + specialist_corrections + specialist_apis
  ↓
buildSystemPrompt() para o especialista
  ↓
Claude API (especialista tem modelo próprio)
  ↓
Tool use loop para specialist_apis (chamadas HTTP)
  ↓
Retorna resultado para agent-runner
  ↓
agent-runner reescreve resultado no seu próprio tom
```

---

## Multi-tenancy

- Todas as tabelas têm `tenant_id UUID NOT NULL`
- RLS FORCE garante isolamento: `tenant_id = auth.jwt() ->> 'tenant_id'`
- `tenant_id` injetado via JWT claim (Supabase Auth custom claims)
- Edge Functions usam `SERVICE_ROLE_KEY` mas validam `tenantId` do body

---

## Human Takeover

```
TakeoverBar (UI) → useTakeoverConversation()
  ↓
PATCH conversations SET assumed_by = userId, status = 'handoff'
  ↓
agent-runner: if (conversation.assumed_by) → return { skipped: true }
  ↓
Analista usa HumanReplyBar → human-send Edge Function → WhatsApp
  ↓
useReleaseConversation() → assumed_by = null, status = 'ativo'
  ↓
agent-runner volta a responder normalmente
```

---

## Prompt Building (prompt-builder.ts)

Blocos montados na ordem (todos exceto o estado operacional são `cache_control: ephemeral`):

1. Cabeçalho do sistema (cacheável)
2. Identidade do agente — `identity_md` (cacheável)
3. Base de conhecimento — `knowledge_docs` concatenados (cacheável)
4. Lições aprendidas — `corrections` (cacheável)
5. Especialistas disponíveis — com `when_to_call` (cacheável)
6. APIs externas — apenas para especialistas (cacheável)
7. Estado operacional — horário, dia, contagem de mensagens (NÃO cacheável)

---

## Decisões Técnicas Relevantes

| Decisão | Motivo |
|---------|--------|
| Especialistas tenant-scoped (não por agente) | Reutilização entre agentes sem duplicar configuração |
| `when_to_call` texto livre | Flexibilidade — a IA interpreta melhor do que categorias fixas |
| APIs Externas no especialista, não no agente | Especialista é o "expert" — faz sentido ele ter acesso às APIs do seu domínio |
| `assumed_by` check na Edge Function (não no frontend) | Garantia server-side — frontend pode ser bypassado |
| N+1 queries em `useCustomerConversations` | Aceitável para MVP; RPC pode substituir se escalar |
| Cast `as never` em tabelas novas | `types.ts` gerado automaticamente não atualiza em tempo real; cast documenta o trade-off |
