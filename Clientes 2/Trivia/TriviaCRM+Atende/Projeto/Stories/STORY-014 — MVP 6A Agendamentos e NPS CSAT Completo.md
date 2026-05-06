---
id: STORY-014
titulo: "MVP 6A — Agendamentos Google/Outlook + NPS/CSAT Completo"
modulo: "Ecossistema"
status: "backlog"
fase: 6
prioridade: 1
agente_responsavel: "—"
atualizado: 2026-05-06
---

# STORY-014 — MVP 6A: Agendamentos + NPS/CSAT Completo

## Contexto

O módulo de Reuniões já existe (OAuth Google Meet, transcrições, análise IA via Gemini).
Esta story completa a integração bidirecional com Google Calendar e Outlook,
adiciona agendamentos no contexto de deals/contatos, e completa o ciclo de NPS/CSAT.

## O que fazer

### Migrations
- [ ] Criar tabela `appointments` (id, workspace_id, contact_id, deal_id, title, type, start_at, end_at, attendees_json, meeting_url, summary, source, calendar_event_id, google_event_id, outlook_event_id)
- [ ] Criar tabela `nps_csat_surveys` (id, workspace_id, conversation_id, contact_id, type, score, comment, sent_at, responded_at, channel)
- [ ] RLS + FORCE em ambas

### Edge Function — calendar-sync (nova)
- [ ] OAuth 2.0 Google Calendar: callback em `meetings-oauth-callback` (já existe, revisar)
- [ ] Sync bidirecional: criar evento no Google/Outlook ao criar appointment no app
- [ ] Receber webhook do Google Calendar ao atualizar/deletar evento
- [ ] Detectar conflito de horário antes de confirmar agendamento
- [ ] Lembrete automático: e-mail 24h e 1h antes via Resend

### Edge Function — nps-csat-webhook (nova)
- [ ] Recebe resposta de NPS/CSAT (via link único ou WhatsApp)
- [ ] Atualiza health_score do contato (NPS ≥ 9 → Saudável, NPS ≤ 6 → Crítico, meio → Em Risco)
- [ ] Gera notificação ao responsável se NPS ≤ 6 ou CSAT ≤ 2
- [ ] Categoriza resposta aberta com IA (provider do workspace)
- [ ] Dispara flow de recuperação se configurado (integration com Flow Builder)

### Frontend — Agendamentos
- [ ] Calendário mensal/semanal/diário em `/meetings` (integrar com Appointments, não só reuniões)
- [ ] CRUD de evento com campos: título, data/hora, duração, tipo (reunião/ligação/visita), participantes, URL reunião, contato/deal vinculado
- [ ] Sincronizar com Google Calendar (OAuth já existe em meetings-integration)
- [ ] Adicionar agendamento direto no Deal Drawer (seção Timeline)
- [ ] Detecção de conflito de horário no formulário

### Frontend — NPS/CSAT
- [ ] UI em Settings > Pesquisas: tipo, canal (WhatsApp/e-mail), trigger (encerrar/Xh após/manual), template
- [ ] Botão "Enviar NPS" manual na conversa do WhatsApp
- [ ] Histórico de NPS/CSAT no perfil do contato (tab)
- [ ] Dashboard NPS: score médio por mês, distribuição (promotores/neutros/detratores), temas das respostas abertas
- [ ] Alertas de detratores: lista de NPS ≤ 6 com link para o chat

### Frontend — Pós-Venda e Health Score
- [ ] Campo `health_score` visível na ficha do contato (Saudável/Em Risco/Crítico com cor)
- [ ] Alerta 60 dias antes da renovação (contact_products.end_date)
- [ ] Campo `churn_reason` obrigatório ao marcar status = 'churned'
- [ ] Campo `upsell_notes` e `upsell_value` na ficha do contato

## Critérios de Aceite

- [ ] Agendamento criado no app aparece no Google Calendar do vendedor
- [ ] Evento cancelado no Google Calendar atualiza o appointment no app
- [ ] NPS enviado via WhatsApp; resposta processada e health_score atualizado
- [ ] Alerta de detrator gerado e visível em Analytics > NPS
- [ ] Alerta de renovação 60 dias antes funcional
- [ ] `supabase functions deploy calendar-sync nps-csat-webhook` passa
