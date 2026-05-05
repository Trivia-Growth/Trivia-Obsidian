---
id: STORY-005
titulo: "Zod e Auth nas Edge Functions"
modulo: "Segurança"
status: "backlog"
fase: 3
prioridade: 1
agente_responsavel: "—"
atualizado: 2026-05-05
---

# STORY-005 — Zod e Auth nas Edge Functions

## Contexto (Auditoria TRIVIAIOX — 2026-05-05)

Nenhuma das Edge Functions usa Zod para validar input. A maioria usa `if` checks manuais que são incompletos e inconsistentes. Além disso, várias funções autenticadas não verificam o usuário via `auth.getUser()` antes de operar com dados sensíveis.

## Problema — Por Função

| Função | Problema |
|--------|---------|
| `lead-intake` | Validação manual sem Zod, X-API-Token custom sem padrão |
| `ai-orchestrator` | `if` checks em `conversationId`, `inboundContent` — sem schema |
| `roleplay-chat` | Validação manual nas linhas 14-19 |
| `zapi-webhook` | Verifica `workspace_id` manualmente |
| `flow-engine` | Validação manual nas linhas 12-14 |
| `cnpj-enrichment` | Validação de CNPJ manual, sem schema |
| `invite-member` | Verifica `email`, `role`, `workspaceId` manualmente |
| `meetings-integration-validate` | Sem schema, sem `auth.getUser()` |

## O que fazer

### Shared (_shared/)
- [ ] Criar `supabase/functions/_shared/validation.ts` — helper `validateBody<T>(req, schema)` com Zod
- [ ] Criar `supabase/functions/_shared/auth.ts` — helper `requireAuth(req)` que chama `auth.getUser()` e retorna 401 se não autenticado
- [ ] Criar `supabase/functions/_shared/errors.ts` — respostas de erro padronizadas (`badRequest`, `unauthorized`, `forbidden`, `internalError`)

### Por Função
- [ ] `lead-intake`: schema Zod para `{ apiToken, contactData }`, validar tipo de cada campo
- [ ] `ai-orchestrator`: schema Zod para `{ conversationId, inboundContent, workspaceId }`
- [ ] `roleplay-chat`: schema Zod para `{ sessionId, message }` + `requireAuth`
- [ ] `zapi-webhook`: schema Zod para payload Z-API
- [ ] `flow-engine`: schema Zod para `{ flowId, triggerId, context }` + `requireAuth`
- [ ] `cnpj-enrichment`: schema Zod `{ cnpj: z.string().regex(/^\d{14}$/) }`
- [ ] `invite-member`: schema Zod `{ email: z.string().email(), role, workspaceId }` + `requireAuth`
- [ ] `meetings-integration-validate`: schema Zod + `requireAuth`

## Critérios de Aceite

- [ ] `_shared/validation.ts`, `_shared/auth.ts`, `_shared/errors.ts` criados
- [ ] Todas as 8 funções listadas usando Zod para validação de input
- [ ] Funções autenticadas retornam 401 quando sem JWT válido
- [ ] Respostas de erro têm formato padronizado `{ error: string, code: string }`
- [ ] `supabase functions deploy` passa para todas as funções alteradas
