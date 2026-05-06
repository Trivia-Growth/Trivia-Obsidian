---
id: STORY-017
titulo: "Feature Flags — Toggle de Features por Workspace"
modulo: "Plataforma / Superadmin"
status: "backlog"
fase: 7
prioridade: 2
agente_responsavel: "—"
atualizado: 2026-05-06
---

# STORY-017 — Feature Flags por Workspace

## Contexto

O produto cresce em features e nem todo workspace deve ter acesso a tudo ao mesmo tempo. Precisamos de um sistema de feature flags controlado pelo superadmin que permita habilitar/desabilitar features por workspace de forma granular, sem necessidade de deploy.

Isso também suporta rollout gradual (beta para clientes selecionados), features pagas (habilitadas ao mudar de plano) e kill-switch rápido em caso de problemas.

## O que fazer

### Migrations

- [ ] Criar tabela `feature_flags` (id, key, label, description, default_enabled, category)
  - `key`: slug único ex. `flow_builder`, `ai_copilot`, `roleplay`, `nps_csat`, `api_publica`
  - `category`: ex. `automation`, `ai`, `analytics`, `integrations`
  - `default_enabled`: boolean — se true, todos os workspaces têm acesso por padrão
- [ ] Criar tabela `workspace_feature_flags` (workspace_id, flag_key, enabled, updated_at, updated_by)
  - override por workspace: se registro existe, usa este valor; caso contrário, usa `default_enabled`
- [ ] RLS: apenas superadmin pode ler/escrever `feature_flags`; workspace_members lêem apenas flags do próprio workspace
- [ ] Seed inicial com as features atuais do produto (todas enabled por padrão)

### Edge Function — manage-feature-flags (nova)

- [ ] `GET /manage-feature-flags?workspace_id=` → retorna flags com estado resolvido (override ou default)
- [ ] `POST /manage-feature-flags` → { workspace_id, flag_key, enabled } — superadmin only
- [ ] `POST /manage-feature-flags/bulk` → { workspace_id, flags: [{key, enabled}] } — superadmin only
- [ ] Valida JWT, verifica role superadmin antes de qualquer mutação

### Hook Global no Frontend

- [ ] Criar hook `useFeatureFlag(key: string): boolean` que consulta as flags do workspace atual
- [ ] Carregar flags uma vez na inicialização da sessão (query cacheada por 5 min)
- [ ] Componente `<FeatureGate flag="key">` que renderiza children somente se flag habilitada
- [ ] Fallback: se flag não encontrada, usar `default_enabled`

### Frontend — Superadmin: Gestão de Feature Flags (/admin/features)

- [ ] Tabela de flags com colunas: key, label, categoria, default, workspaces com override
- [ ] Toggle de default_enabled global (afeta todos sem override)
- [ ] Botão "Ver por Workspace" → modal com lista de workspaces e toggle individual
- [ ] Filtro por categoria e por workspace
- [ ] Histórico de alterações (quem mudou, quando, de/para)

### Uso nas Features Existentes

- [ ] Envolver `FlowBuilder`, `Roleplay`, `NPS/CSAT`, `Copiloto IA`, `API Pública` em `<FeatureGate>`
- [ ] Quando feature desabilitada: exibir tela "Feature não disponível no seu plano" com CTA de contato

## Critérios de Aceite

- [ ] Superadmin consegue habilitar/desabilitar qualquer feature para qualquer workspace sem deploy
- [ ] Workspace sem override usa `default_enabled` da feature
- [ ] Hook `useFeatureFlag` retorna valor correto em < 100ms (cache local)
- [ ] Feature desabilitada some da UI do workspace (não apenas bloqueia rota)
- [ ] Histórico de alterações registrado no audit_log
- [ ] `npm run build` sem erros, TypeScript strict

## Dependências

- STORY-016 (audit_log já existe lá)
- Pode ser implementada antes da STORY-016 se necessário (tabelas independentes)
