---
id: STORY-017
titulo: "Feature Flags — Toggle de Features por Workspace"
modulo: "Plataforma / Superadmin"
status: "concluida"
fase: 7
prioridade: 2
agente_responsavel: "Dex (@dev) + Aria (@architect)"
atualizado: 2026-05-06
commit: "STORY-017: Feature Flags por Workspace"
---

# STORY-017 — Feature Flags por Workspace

## Contexto

Sistema de feature flags controlado pelo superadmin para habilitar/desabilitar features por workspace sem deploy. Suporta rollout gradual, features pagas e kill-switch rápido.

## Decisões Arquiteturais (@architect)

- **Sem Edge Function** — RLS + client direto é suficiente; superadmin escreve diretamente nas tabelas com is_superadmin() RLS
- **TanStack Query staleTime 5min** em vez de Supabase Realtime — flags mudam raramente; overhead de WebSocket não justificado
- **Seed via `ON CONFLICT (key) DO NOTHING`** — idempotente, não sobrescreve customizações posteriores
- **FeatureGate null durante loading** — evita flash de `<FeatureUnavailable>` antes das flags chegarem

## O que foi implementado

### Migration (`20260509000003_story017_feature_flags.sql`)

- `feature_flags(id, key UNIQUE, label, description, category, default_enabled, created_at)`
  - RLS: SELECT → auth.uid() IS NOT NULL; ALL → is_superadmin(auth.uid())
- `workspace_feature_flags(workspace_id, flag_key, enabled, updated_at, updated_by, PK(workspace_id, flag_key))`
  - RLS: SELECT → is_member_of_workspace(workspace_id); ALL → is_superadmin(auth.uid())
- Index: `idx_workspace_feature_flags_workspace`
- Seed: 8 flags com `ON CONFLICT (key) DO NOTHING`

### Hook + Componente (`src/hooks/use-feature-flags.tsx`)

- `useWorkspaceFlags()` — query paralela feature_flags + workspace_feature_flags; monta override map; staleTime 5min
- `useFeatureFlag(key): boolean` — selector do cache; retorna `true` se loading ou flag desconhecida
- `<FeatureGate flag label? fallback?>` — null durante loading; `<FeatureUnavailable>` (com CTA suporte) se desabilitado
- `FeatureUnavailable` — card com Lock icon + link mailto:suporte@trivia.com.br

### Admin — FeatureFlagsPanel (`src/components/admin/FeatureFlagsPanel.tsx`)

- Tabela de flags com: key (código), label, CategoryBadge, contagem de overrides ativos
- Toggle "Global" (default_enabled) por flag — grava em feature_flags + audit_log
- Botão "Por workspace" → Sheet com lista de todos os workspaces + toggle individual (upsert workspace_feature_flags + audit_log)
- Filtro por categoria (Select)
- Histórico implícito via audit_logs (action: "feature_flag_toggle", scope: "global" ou "workspace")

### Admin.tsx — nova tab

- Tab "Feature Flags" (ToggleLeft icon) adicionada ao TabsList + TabsContent

### App.tsx — FeatureGate nas rotas

- `/flows`, `/flows/:id`, `/flows/:id/logs` → `flow_builder`
- `/meetings`, `/calendar` → `meetings`
- `/forecast` → `forecasting`
- Todas as rotas `/roleplay/*` → `roleplay`

## Critérios de Aceite

- [x] Superadmin consegue habilitar/desabilitar qualquer feature para qualquer workspace sem deploy
- [x] Workspace sem override usa `default_enabled` da feature
- [x] Hook `useFeatureFlag` retorna valor correto em < 100ms (cache local)
- [x] Feature desabilitada mostra `<FeatureUnavailable>` (não apenas bloqueia rota)
- [x] Histórico de alterações registrado no audit_log
- [x] `npm run build` sem erros TypeScript strict

## Arquivos criados/modificados

### Criados
- `supabase/migrations/20260509000003_story017_feature_flags.sql`
- `src/hooks/use-feature-flags.tsx`
- `src/components/admin/FeatureFlagsPanel.tsx`

### Modificados
- `src/pages/Admin.tsx` — import FeatureFlagsPanel + tab "Flags"
- `src/App.tsx` — import FeatureGate + wrapping de rotas
- `PROJECT_REQUIREMENTS.md` — seção STORY-017 adicionada
