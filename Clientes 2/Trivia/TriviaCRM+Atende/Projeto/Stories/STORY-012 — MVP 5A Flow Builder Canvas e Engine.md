---
id: STORY-012
titulo: "MVP 5A — Flow Builder Canvas Visual + Engine"
modulo: "Flow Builder"
status: "backlog"
fase: 5
prioridade: 1
agente_responsavel: "—"
atualizado: 2026-05-06
---

# STORY-012 — MVP 5A: Flow Builder Canvas + Engine

## Contexto

O Flow Builder é o módulo de automação multicanal (WhatsApp + E-mail) que transforma o JimmyAtende
em ferramenta análoga ao ActiveCampaign. É o maior MVP em complexidade.
Edge functions `flow-engine` e `flow-action-executor` já existem — precisam de revisão e conexão.
Tabelas `flows`, `flow_nodes`, `flow_enrollments`, `flow_execution_log` precisam ser criadas.

## O que fazer

### Migrations
- [ ] Criar tabela `flows` (id, workspace_id, name, status, trigger_type, trigger_config_json, version)
- [ ] Criar tabela `flow_nodes` (id, flow_id, node_type, config_json, position_x, position_y, next_node_id, next_node_id_false)
- [ ] Criar tabela `flow_enrollments` (id, flow_id, contact_id, deal_id, status, current_node_id, enrolled_at, completed_at, exited_reason)
- [ ] Criar tabela `flow_execution_log` (id, flow_id, enrollment_id, node_id, executed_at, result_json)
- [ ] RLS + FORCE em todas as tabelas acima
- [ ] Criar tabela `email_templates` (id, workspace_id, name, subject, body_html, variables_json)

### Edge Functions
- [ ] Revisar `flow-engine/index.ts`:
  - Processa enrollments ativos: avalia condição do nó atual, executa ação, avança para próximo nó
  - Agenda esperas (wait nodes) com `pg_cron` ou timestamp futuro
  - Cron: cada 5 minutos
- [ ] Revisar `flow-action-executor/index.ts`:
  - Ação WhatsApp: chama Z-API com template
  - Ação E-mail: chama Resend
  - Ação Tag: adiciona/remove tag no contato
  - Ação Move Deal: muda stage_id do deal
  - Ação Atribuir: atualiza assigned_to no deal/contact
  - Ação Criar Tarefa: insere em deal_activities
  - Ação Notificar: insere em notifications
  - Ação Webhook: faz POST para URL externa

### Frontend — Canvas Visual (/flows)
Biblioteca: **React Flow** (já usada em projetos Vite/Tailwind)

- [ ] Página `/flows` com lista de fluxos (nome, status, trigger, criado em, enroll count)
- [ ] Botão "Novo Fluxo" → abre editor de canvas
- [ ] Editor canvas com drag-and-drop de blocos:
  - **Gatilhos**: Novo lead | Mudança de stage | Tag adicionada | Score atingiu X | Deal parado X dias | Manual
  - **Condições**: ICP tier A/B/C/D | Stage atual | Produto | Campo customizado | Horário/dia
  - **Ações**: WhatsApp | E-mail | Tag | Mover deal | Atribuir | Criar tarefa | Notificar | Webhook
  - **Espera**: X dias/horas | Aguardar condição
- [ ] Conectar blocos com setas (sim/não nas condições)
- [ ] Sidebar de configuração de cada bloco ao clicar
- [ ] Botões: Salvar rascunho | Publicar | Pausar | Arquivar | Duplicar
- [ ] Validação: não publicar fluxo sem nó de gatilho conectado a pelo menos uma ação

### Frontend — Settings > Flow Builder
- [ ] Lista de todos os fluxos com status toggle (ativo/pausado)
- [ ] Templates prontos: boas-vindas, nurturing, renovação, pós-venda
- [ ] Gestão de opt-outs: lista de descadastro por workspace

## Critérios de Aceite

- [ ] Fluxo criado no canvas é salvo corretamente (flows + flow_nodes)
- [ ] Publicar fluxo → fluxo começa a processar enrollments via flow-engine cron
- [ ] Gatilho "Novo lead" → contato adicionado ao fluxo automaticamente
- [ ] Ação "Enviar WhatsApp" executa via Z-API
- [ ] Log de execução visível por fluxo
- [ ] `supabase functions deploy flow-engine flow-action-executor` passa
- [ ] `npm run build` sem erros TypeScript
