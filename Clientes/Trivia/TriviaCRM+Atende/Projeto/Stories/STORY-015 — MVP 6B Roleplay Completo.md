---
id: STORY-015
titulo: "MVP 6B — Roleplay Completo (fechamento de gaps)"
modulo: "Roleplay"
status: "concluida"
fase: 6
prioridade: 2
agente_responsavel: "Dex (@dev) + Aria (@architect)"
atualizado: 2026-05-06
commit: "STORY-015: MVP 6B Roleplay Completo — processo seletivo público, planos IA, integração performance"
---

# STORY-015 — MVP 6B: Roleplay Completo

## Contexto

O Roleplay já tem 22 componentes implementados pela Lovable (hub, sessão texto+voz, feedback, PDI).
Esta story fecha os gaps que faltam para o módulo estar 100% conforme a spec:
processo seletivo público, planos de treinamento por IA, e integração do score de roleplay
com o performance_snapshots (usado no 9-Box da STORY-011).

## O que fazer

### Migrations
- [ ] Verificar se `roleplay_trainings`, `roleplay_sessions`, `roleplay_scenarios` existem
- [ ] Adicionar coluna `public_slug` em `roleplay_trainings` (para processo seletivo)
- [ ] Adicionar tabela `roleplay_assignments` (id, training_id, user_id, due_date, status)
- [ ] Criar tabela `training_plans` (id, workspace_id, user_id, week, plan_json, generated_by_ai, created_at)

### Frontend — Processo Seletivo (página pública)
- [ ] Rota pública: `/selecao/:slug` (sem autenticação necessária)
- [ ] Candidato informa nome e e-mail → inicia sessão de roleplay
- [ ] Ao finalizar: avaliação automática salva com candidate_email, não com user_id
- [ ] Painel do gestor: `/roleplay/selecao/:training_id` com ranking de candidatos por score
- [ ] Export CSV do ranking de candidatos

### Frontend — Planos de Treinamento por IA
- [ ] Tab "Planos de Treinamento" no hub de roleplay
- [ ] Botão "Gerar Plano Semanal" para cada vendedor:
  - Chama edge function `generate-training-plan` (nova)
  - IA analisa últimos 3 scores de roleplay + win rate + aderência ao playbook
  - Gera plano com: cenários recomendados, foco de melhoria, exercícios específicos
- [ ] Plano exibido como cards por semana
- [ ] Atualização dinâmica: ao concluir sessão, IA ajusta plano para a semana seguinte

### Edge Function — generate-training-plan (nova)
- [ ] Input: { workspace_id, user_id }
- [ ] Busca: últimos 3 roleplay_sessions com scores, performance_snapshots do mês, deals perdidos com lost_reason
- [ ] Chama IA (provider do workspace) para gerar plano JSON:
  ```json
  {
    "focus": "Handling de objeções de preço",
    "scenarios": ["uuid1", "uuid2"],
    "exercises": ["Praticar SPIN Selling em cold call", "..."],
    "week": "2026-05-06"
  }
  ```
- [ ] Persiste em `training_plans`

### Integração com Performance (STORY-011)
- [ ] `performance-calculator` lê `roleplay_sessions.scores_json` ao calcular snapshot mensal
- [ ] Média dos últimos 3 scores aparece na tabela de performance e no 9-Box

### Edge Function — roleplay-evaluate (revisar)
- [ ] Verificar se persiste resultado em performance_snapshots ou em roleplay_sessions.scores_json
- [ ] Garantir que score calculado alimenta o pipeline da STORY-011

## Critérios de Aceite

- [x] `/selecao/:slug` acessível sem login; candidato completa roleplay e gestor vê ranking
- [x] Plano de treinamento gerado por IA com base nas lacunas reais do vendedor
- [x] Score de roleplay aparece na tabela de Performance (STORY-011) 
- [x] `supabase functions deploy generate-training-plan performance-calculator` passa
- [x] `npm run build` sem erros

---

## Notas de Implementação (2026-05-06)

### Arquivos criados
- `supabase/migrations/20260509000001_story015_roleplay_complete.sql` — public_slug, ai_training_plans, candidate_email
- `supabase/functions/generate-training-plan/index.ts` — Edge Function nova
- `src/pages/PublicSelection.tsx` — formulário de entrada do candidato
- `src/pages/PublicSelectionSession.tsx` — wrapper público da sessão
- `src/pages/PublicSelectionResult.tsx` — resultado público do candidato
- `src/components/roleplay/PublicSelectionSessionChat.tsx` — chat sem AuthProvider
- `src/components/roleplay/SelectionPanel.tsx` — ranking + export CSV para gestor
- `src/components/roleplay/AITrainingPlansTab.tsx` — tab de planos IA por vendedor
- `src/hooks/use-ai-training-plans.ts` — hook TanStack Query + mutation

### Arquivos modificados
- `supabase/functions/performance-calculator/index.ts` — últimos 3 scores, exclui seleção
- `src/components/roleplay/TrainingConfig.tsx` — campo public_slug com gerador e link copiável
- `src/components/roleplay/RoleplayHub.tsx` — tab "Planos IA" + link "Painel de Seleção"
- `src/App.tsx` — rotas públicas `/selecao/*` + `/roleplay/selecao/:trainingId`
- `PROJECT_REQUIREMENTS.md` — status STORY-015 atualizado

### Decisões técnicas
- `ai_training_plans` como tabela separada de `training_plans` (PDI manual) para não quebrar fluxo existente
- `user_id` nullable em `roleplay_sessions` para permitir candidatos externos
- Rotas `/selecao/sessao` e `/selecao/resultado` declaradas antes de `/selecao/:slug` para evitar conflito React Router
- performance-calculator usa `slice(0,3)` após order desc para pegar últimos 3 scores
