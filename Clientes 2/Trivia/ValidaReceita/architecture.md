# ValidaReceita — Arquitetura do Sistema

> **Status:** Produção  
> **Deploy:** https://validareceita-platform.netlify.app  
> **Repositório:** https://github.com/Trivia-Growth/ValidaReceita  
> **Última atualização:** 2026-05-12

---

## Visão Geral

SaaS multi-tenant para farmácias com três pilares: validação de receitas via IA, atendimento WhatsApp com agente SDR configurável, e CRM/pipeline de vendas.

```
┌─────────────────────────────────────────────────┐
│                   Netlify CDN                    │
│          React 19 + Vite + Tailwind v4           │
└──────────────┬──────────────────────────────────┘
               │ HTTPS / Supabase JS SDK
┌──────────────▼──────────────────────────────────┐
│                   Supabase                       │
│  Auth │ PostgreSQL │ Storage │ Realtime │ Edge   │
└─────────────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────────────┐
│              Edge Functions (Deno)               │
│  analyze-prescription │ agent-reply              │
│  analyze-quality      │ webhook-zapi             │
└──────────────┬──────────────────────────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
   Anthropic      OpenRouter
   (Claude)    (multi-modelo)
```

---

## Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | React + Vite + TypeScript | 19 / 6 / 5 |
| CSS | Tailwind CSS v4 (`@theme` directive) | 4.x |
| Estado global | Zustand | 5.x |
| Estado servidor | TanStack Query | 5.x |
| Roteamento | React Router v7 | 7.x |
| Backend | Supabase (Auth, PostgreSQL, Storage, Realtime, Edge) | — |
| WhatsApp | Z-API (webhook) | — |
| IA | Anthropic direto + OpenRouter | — |
| DnD | @dnd-kit/core + @dnd-kit/sortable | — |
| Charts | Recharts | — |
| Testes | Vitest + @testing-library/react | — |
| CI/CD | Netlify | — |

---

## Estrutura de Pastas (Bulletproof React)

```
src/
├── app/
│   ├── layout/          # Sidebar, topbar, AppLayout
│   ├── providers/       # AuthProvider (Zustand store)
│   └── routes/          # router.tsx, ProtectedRoute.tsx
├── features/
│   ├── auth/            # Login, ResetPassword, AuthCallback
│   ├── agents/          # Listagem + AgentDetailPage (5 tabs)
│   ├── chat/            # Conversations + MessageThread
│   ├── pipeline/        # Kanban DnD (6 estágios)
│   ├── prescriptions/   # Upload + análise IA + modal aprova/rejeita
│   ├── quality/         # Análise IA de atendimentos humanos
│   ├── reports/         # 6 gráficos (Bar, Line, Pie, Radar)
│   └── settings/        # IA, SLA, Respostas Rápidas
├── shared/
│   ├── components/ui/   # Button, Input, Modal, Badge, Avatar...
│   ├── hooks/           # usePermission, useDebounce...
│   └── types/           # index.ts — todos os tipos do domínio
└── test/
    ├── unit/            # Button, Badge, LoginPage, usePermission
    └── e2e/             # auth.test.ts (fluxo completo mockado)
```

---

## Banco de Dados (22 tabelas)

### Tabelas principais

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Usuários com role (superadmin/admin/analyst) e org_id |
| `organizations` | Farmácias/tenants |
| `contacts` | Pacientes/leads vindos do WhatsApp |
| `conversations` | Atendimentos (phone, mode: bot/human, status) |
| `messages` | Mensagens com direction (inbound/outbound), is_bot |
| `prescriptions` | Receitas com status e análise IA |
| `deals` | Pipeline de vendas por estágio |
| `agents` | Configuração de agentes IA por número WhatsApp |
| `agent_messages` | Logs de uso IA (tokens, custo, latência) |
| `quality_reviews` | Análises de qualidade de atendimentos |
| `quick_replies` | Templates de resposta rápida |
| `internal_notes` | Notas internas por conversa |
| `tags` | Tags coloridas para conversas |
| `invites` | Convites de usuário por token |
| `llm_settings` | Config IA por org (provider, modelo, key enc, orçamento) |
| `sla_settings` | Config SLA por org |
| `csat_surveys` | Pesquisas de satisfação |
| `business_hours` | Horários de funcionamento por agente/dia |
| `audit_log` | Log de compliance LGPD/CRF |

### Funções RLS

```sql
my_org_id()  -- retorna org_id do usuário autenticado
my_role()    -- retorna role do usuário autenticado
```

Todas as tabelas têm RLS habilitado. Políticas baseadas em `my_org_id()` garantem isolamento entre tenants.

---

## RBAC

```
superadmin  →  acesso total (plataforma)
admin       →  acesso total (sua org)
analyst     →  validate_prescriptions, view_reports, chat
```

| Permissão | superadmin | admin | analyst |
|-----------|:---:|:---:|:---:|
| manage_agents | ✓ | ✓ | — |
| manage_settings | ✓ | ✓ | — |
| view_reports | ✓ | ✓ | ✓ |
| view_quality_reviews | ✓ | ✓ | — |
| validate_prescriptions | ✓ | ✓ | ✓ |

Hook: `usePermission()` → `{ can(permission), hasRole(minRole) }`  
Hierarquia: `analyst < admin < superadmin`

---

## Edge Functions

### `analyze-prescription`
- Recebe: `{ prescriptionId, fileUrl }`
- Busca config LLM da org via `_shared/llm.ts`
- Prompt: analisa CRM, validade, controlado (Portaria 344), posologia
- Retorna: `{ valid, issues[], score, medications[], prescriber }`
- Salva resultado + custo em `prescriptions` e `agent_messages`

### `agent-reply`
- Recebe: `{ conversationId, messageId, playground? }`
- Carrega identidade + knowledge + regras + histórico recente
- `MOCK_LLM=true` → retorna resposta estática
- Salva reply como mensagem outbound + log de custo

### `analyze-quality`
- Recebe: `{ conversationId }`
- Analisa transcrição em 6 critérios: empathy, clarity, resolution, speed, protocol, accuracy
- Score 0-100 (média ponderada)
- Retorna strengths, improvements, overall_score

### `webhook-zapi`
- Recebe payload Z-API via POST
- Upsert de contato e conversa
- Salva mensagem inbound
- Dispara `agent-reply` se mode === 'bot'
- Envia resposta via Z-API REST se `zapi_token_enc` configurado

### `_shared/llm.ts`
```ts
callLLM({ orgId, prompt, system, maxTokens })
// → Anthropic API ou OpenRouter baseado em settings.provider
// → retorna { content, inputTokens, outputTokens, costUsd }
```

---

## Fluxo de Dados

### Receita via WhatsApp
```
WhatsApp → Z-API Webhook → Edge Function webhook-zapi
  → upsert contact/conversation/message
  → agent-reply (bot mode)
    → se é imagem/PDF → analyze-prescription
      → farmaceutico revisa na UI
        → aprova/rejeita → atualiza prescription.status
```

### Atendimento Humano
```
Mensagem inbound → Realtime → TanStack Query invalidate
  → MessageThread atualiza
  → farmaceutico responde → useSendMessage → message outbound
  → Z-API envia para WhatsApp (se configurado)
```

### Realtime
```
supabase.channel('conversations').on('postgres_changes', ...)
  → queryClient.invalidateQueries(['conversations'])

supabase.channel(`messages-${convId}`).on('postgres_changes', ...)
  → queryClient.setQueryData(['messages', convId], append)
```

---

## Variáveis de Ambiente

| Variável | Onde | Descrição |
|----------|------|-----------|
| `VITE_SUPABASE_URL` | Netlify | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Netlify | Chave anon pública |
| `VITE_MOCK_LLM` | Netlify | `true` em dev (sem custo IA) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Secrets | Para Edge Functions |
| `ANTHROPIC_API_KEY` | Supabase Secrets | Chave da Anthropic |
| `OPENROUTER_API_KEY` | Supabase Secrets | Chave OpenRouter |

---

## Testes

```
src/test/
├── unit/
│   ├── Button.test.tsx      # 5 testes — render, click, disabled, loading
│   ├── Badge.test.tsx       # 4 testes — variants (success/danger/robot)
│   ├── LoginPage.test.tsx   # 4 testes — render, submit, error, supabase call
│   └── usePermission.test.ts # 6 testes — roles, hasRole hierarchy
└── e2e/
    └── auth.test.ts         # 16 testes — auth flow, RBAC, prescriptions, chat, pipeline, quality
```

**Total: 35 testes, 5 suites — todos passando.**

Supabase completamente mockado via `vi.mock('@/shared/lib/supabase', ...)`.

---

## Deploy

- **Frontend:** Netlify auto-deploy via GitHub (`main` branch)
- **URL produção:** https://validareceita-platform.netlify.app
- **Supabase:** Projeto `zlxxbhisguumrixaynnj` (São Paulo / sa-east-1)
- **Migrations:** `supabase/migrations/00001_initial_schema.sql` aplicada

---

## Decisões Técnicas Relevantes

1. **Tailwind v4 sem config file** — usa `@theme { }` em `globals.css`, sem `tailwind.config.js`. Tokens de cor como CSS custom properties.

2. **Dual LLM provider** — org escolhe Anthropic (melhor qualidade) ou OpenRouter (multi-modelo, mais barato) em Settings → IA.

3. **Mock mode** — `VITE_MOCK_LLM=true` evita custo de IA em dev/staging. Edge Functions também respeitam `MOCK_LLM=true`.

4. **TanStack Query + Realtime** — Supabase Realtime apenas invalida/atualiza o cache do TanStack Query. Não há estado local de mensagens — tudo vai ao Postgres.

5. **Z-API sem credenciais de prod** — webhook completo implementado. Em dev, `zapi_token_enc = null` → step de envio silenciosamente skippado.

6. **RLS first** — toda política de acesso está no banco, não apenas na UI. Frontend é segunda camada de defesa.
