---
projeto: Sales-Hzm
tipo: índice
organizacao: Heziom
tenancy: single-tenant
status: em-remediacao
criado: 2026-06-09
atualizado: 2026-06-09
---

# Sales-Hzm — Índice do Projeto

CRM/Sistema de vendas da Heziom. Stack **React + Vite + TypeScript + Tailwind/shadcn** no front; **Supabase** (Postgres + 39 Edge Functions Deno) no back. Construído originalmente na **Lovable** e agora trazido para o **Padrão Trívia** (Triviaiox).

- **Código:** `Org-Heziom/heziom-sales` (GitHub) — local em `~/Documents/Obsidian/Github/Heziom-Sales`
- **Supabase (temporário):** `apzbaesprzohoalknzxd` — será migrado depois para o **banco unificado da Heziom**

> [!important] Decisão de arquitetura: SINGLE-TENANT
> Este sistema será usado por **uma única organização** (a própria Heziom). **Não** será multi-tenant.
> Isso reordena as prioridades da auditoria: os achados de "vazamento entre clientes/workspaces" deixam de ser críticos. Já os achados de **exposição à internet pública** (funções abertas sem senha, RLS desligada deixando a chave pública ler tudo, segredos no frontend, webhooks sem assinatura) **continuam valendo**, pois não dependem de existir mais de um cliente.
>
> **Estratégia para o multi-tenant: travar em 1 organização (meio-termo).** Não vamos arrancar o `workspace_id` (refatoração grande e arriscada, ainda mais com banco temporário), mas vamos **remover a criação/troca de organização** e fixar uma só. A estrutura `workspace_id` + RLS por membership **permanece** apenas como escopo de segurança dos dados. Ver [[STORY-014 — Travar em organização única (single-tenant)|STORY-014]].

---

## Documentos

- [[Auditoria TRIVIAIOX — Sales-Hzm|🔍 Auditoria TRIVIAIOX]] — relatório completo (75 achados)
- [[SECURITY_DEBT|🔐 SECURITY_DEBT]] — registro de débito de segurança
- [[Dashboard Stories|📊 Dashboard de Stories]]

## Padrão de referência

- [[_Template Story]] · [[Ciclo de uma Story]] · [[Definition of Done]] · [[Checklist de Segurança]] · [[Edge Functions Seguras]] · [[RLS Supabase — Template]]

---

## Backlog de Remediação (epics)

Stories derivadas da auditoria, **já reordenadas para single-tenant**. Prioridade: **P0** bloqueia produção · **P1** até 1 semana · **P2** backlog próximo · **P3** quando possível.

| Story | Tema | Prioridade | Módulo |
|-------|------|------------|--------|
| [[STORY-001 — Fechar Edge Functions públicas sem autenticação\|STORY-001]] | Funções abertas (`verify_jwt=false` + `service_role`) | **P0** | segurança |
| [[STORY-002 — Habilitar RLS e padronizar policies\|STORY-002]] | RLS desligada / exposição via chave pública | **P0** | banco |
| [[STORY-003 — Proteger webhooks e callback OAuth\|STORY-003]] | Assinatura Z-API, HMAC Meta, state OAuth | **P1** | edge-functions |
| [[STORY-004 — Proteger segredos e dados sensíveis\|STORY-004]] | Tokens/keys em texto puro, PII em log | **P1** | segurança |
| [[STORY-005 — Type-check no build e correção de erros TS\|STORY-005]] | 316 erros TS, `any` disseminado | **P1** | qualidade |
| [[STORY-006 — CICD mínimo e gates automáticos\|STORY-006]] | Pipeline, npm audit, lockfile, lint | **P1** | devops |
| [[STORY-007 — Corrigir features quebradas e bugs de runtime\|STORY-007]] | Funções inexistentes, catch vazios, mic ligado | **P1** | qualidade |
| [[STORY-008 — Endurecer Edge Functions restantes\|STORY-008]] | `.or()` injection, erros genéricos, rate limit | **P2** | edge-functions |
| [[STORY-009 — Suíte de testes para lógica crítica\|STORY-009]] | Forecast, parser SSE, Analytics | **P2** | qualidade |
| [[STORY-010 — Camada de serviço e consolidação de config\|STORY-010]] | Service layer, helper edge, env único | **P2** | arquitetura |
| [[STORY-011 — Resiliência: ErrorBoundary, Sentry, QueryClient\|STORY-011]] | Boundary por rota, defaults, toast único | **P2** | arquitetura |
| [[STORY-012 — Validar e configurar os agentes Triviaiox\|STORY-012]] | core-config, devLoadAlwaysFiles, squad | **P2** | agentes |
| [[STORY-013 — Quebrar componentes-gigantes e alinhar arquitetura\|STORY-013]] | Componentes >300 linhas, drift de docs | **P3** | arquitetura |
| [[STORY-014 — Travar em organização única (single-tenant)\|STORY-014]] | Remover criação/troca de organização; fixar single-org | **P1** | arquitetura |

---

## Como rodar uma story

Seguir o [[Ciclo de uma Story]]: `@sm` refina → piloto aprova (`pronto`) → `@dev` propõe Diff Plan e implementa (`em-progresso`/`em-review`) → `@qa` valida contra a [[Definition of Done]] (`concluido`) → deploy (`supabase db push` / `functions deploy` / merge Netlify).
