---
id: STORY-008
titulo: "MVP 3 Fechamento — ICP Tier, Deal Monitor e Routing Integration"
modulo: "Gestão Comercial"
status: "em-progresso"
fase: 3
prioridade: 1
agente_responsavel: "Claude Code"
atualizado: 2026-05-06
---

# STORY-008 — MVP 3 Fechamento: ICP Tier + Deal Monitor + Routing

## Contexto

Auditoria do codebase (2026-05-06) revelou que o MVP 3 está ~85% implementado pela Lovable.
DealDetailSheet, PipelineReview, Team.tsx e flags do KanbanCard estão funcionais.
As lacunas remanescentes são:

1. `lead_tier` (A/B/C/D) não existe na tabela `contacts` — só `icp_score` (0-100)
2. KanbanCard não exibe badge de ICP tier
3. Não há botão "Calcular ICP" na ficha do contato
4. `deal-monitor` cron não existe (alertas de deal parado / sem próximo passo)
5. `routing-engine` não é chamado automaticamente na criação de deals

## O que fazer

### Migration
- [x] Adicionar `lead_tier TEXT CHECK (lead_tier IN ('A','B','C','D'))` em `contacts`
- [x] Adicionar `cluster TEXT` em `contacts`

### Edge Function — lead-scorer
- [x] Atualizar para calcular e escrever `lead_tier`:
  - A = score ≥ 80
  - B = score ≥ 60
  - C = score ≥ 40
  - D = score < 40
- [x] Também persistir `cluster` calculado (baseado em segment + lead_tier)

### Edge Function — deal-monitor (nova)
- [x] Cron semanal (segunda-feira 8h BRT)
- [x] Detecta deals sem `next_step_what` → gera notificação in-app para o responsável
- [x] Detecta deals parados (last_activity_date > ciclo médio da fase) → notificação para gestor
- [x] Detecta deals com `next_step_when` vencido → notificação para responsável

### Frontend — KanbanCard
- [x] Badge ICP tier (A/B/C/D) com cores: A=verde, B=amarelo, C=laranja, D=vermelho
- [x] Exibir apenas se `contact.lead_tier` estiver preenchido

### Frontend — Ficha do Contato
- [x] Botão "Calcular ICP Score" → chama edge function `lead-scorer`
- [x] Exibir `lead_tier` e `icp_score` na ficha

### Routing Integration
- [x] Ao criar deal via DealDialog, chamar `routing-engine` se `assigned_to` estiver vazio
- [x] Mostrar toast com o vendedor atribuído automaticamente

## Critérios de Aceite

- [ ] `contacts.lead_tier` populado após cálculo do ICP Score
- [ ] KanbanCard exibe badge colorido A/B/C/D
- [ ] Botão "Calcular ICP" funciona na ficha do contato
- [ ] `deal-monitor` deployado e gerando notificações
- [ ] Routing automático atribui vendedor ao criar deal (quando configurado)
- [ ] `supabase functions deploy deal-monitor lead-scorer` passa
- [ ] `npm run build` sem erros
