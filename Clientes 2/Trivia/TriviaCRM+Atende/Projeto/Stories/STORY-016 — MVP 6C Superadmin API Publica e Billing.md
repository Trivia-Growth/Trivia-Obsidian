---
id: STORY-016
titulo: "MVP 6C — Superadmin Expandido, API Pública e Billing AppMax"
modulo: "Ecossistema"
status: "backlog"
fase: 6
prioridade: 3
agente_responsavel: "—"
atualizado: 2026-05-06
---

# STORY-016 — MVP 6C: Superadmin + API + Planos

## Contexto

Superadmin básico já existe (/admin com lista de workspaces e audit log básico).
Lead-intake (API pública) já existe com autenticação por token.
Esta story expande o superadmin, completa a API pública e adiciona gestão de planos/billing.

## O que fazer

### Migrations
- [ ] Adicionar coluna `plan` (starter/pro/business/enterprise) em `workspaces`
- [ ] Adicionar colunas `trial_ends_at`, `status` (active/trial/suspended/cancelled) em `workspaces`
- [ ] Criar tabela `inbound_webhooks` (id, workspace_id, name, token_hash, source_name, field_mapping_json, flow_id)
- [ ] Criar tabela `audit_logs` (id, workspace_id, user_id, action, resource_type, resource_id, metadata_json, is_impersonated, created_at) — se não existir
- [ ] RLS: audit_logs visível apenas para manager+ do workspace; superadmin vê tudo

### Edge Function — admin-create-user (nova)
- [ ] Input (superadmin only): { email, workspace_id, role, display_name }
- [ ] Cria usuário no Supabase Auth (admin.createUser)
- [ ] Insere em workspace_members com o role
- [ ] Envia e-mail de boas-vindas com senha temporária via Resend
- [ ] Registra no audit_log

### Edge Function — admin-reset-password (nova)
- [ ] Input: { user_id }
- [ ] Gera link de reset via Supabase Admin API
- [ ] Envia por e-mail

### Frontend — Superadmin Expandido (/admin)

**Gestão de Workspaces:**
- [ ] Lista com métricas por workspace: membros, contatos, deals, mensagens, plano, status, trial_ends_at
- [ ] Ações: Ativar/Suspender/Cancelar, Editar plano, Estender trial (+ X dias)
- [ ] Impersonação: botão "Acessar como" → banner persistente "Acessando como [workspace]" com botão sair
- [ ] Ao impersonar: todas as ações registradas no audit_log com is_impersonated = true

**Métricas Globais:**
- [ ] KPIs: workspaces ativos, em trial, suspensos; MRR estimado por plano
- [ ] Uso de IA por workspace: tokens estimados por provider (baseado em messages count × avg tokens)
- [ ] Workspaces com baixo engajamento (sem atividade há 7+ dias)

**Audit Log:**
- [ ] Tabela com filtros: workspace, usuário, action, período
- [ ] Exportação CSV para compliance
- [ ] Retenção: 90 dias (cron de limpeza)

### Frontend — API Pública (Settings > Integrações > API)
- [ ] CRUD de API tokens com permissões granulares (lead:create, contact:read, etc.)
- [ ] Log de requisições: endpoint, status, IP, timestamp (últimas 1000)
- [ ] CRUD de Inbound Webhooks: nome, URL de destino, token, mapeamento de campos
- [ ] Documentação inline: exemplos de payload para cada token

### Frontend — Planos e Limites
- [ ] Em Settings > Plano: exibir plano atual, recursos incluídos, data de renovação
- [ ] Limites por plano aplicados no backend (guardar em workspace.settings_json):
  - Starter: 3 usuários, 1 número WhatsApp, 1 pipeline, 3 fluxos
  - Pro: 10 usuários, 3 números, 3 pipelines, fluxos ilimitados
  - Business: ilimitado
- [ ] Quando limite atingido: toast/banner explicativo com CTA de upgrade

### LGPD
- [ ] Botão "Exportar dados do contato" (ficha do contato) → gera JSON com todos os dados + histórico
- [ ] Botão "Deletar contato permanentemente" (admin only) → soft delete com prazo de 30 dias para exclusão real

## Critérios de Aceite

- [ ] Superadmin impersona workspace com banner persistente e audit log
- [ ] MRR estimado calculado corretamente por plano
- [ ] admin-create-user e admin-reset-password deployados e funcionais
- [ ] API tokens com log de requisições visível
- [ ] Limites de plano validados no backend (não apenas no frontend)
- [ ] Exportação LGPD gera arquivo completo do contato
- [ ] `npm run build` sem erros
