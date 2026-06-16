---
id: STORY-019
titulo: "Campanhas em massa (e-mail via Resend/SES + WhatsApp bulk)"
fase: 2
modulo: "crm"
status: em-progresso
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-15
atualizado: 2026-06-15
---

# STORY-019 — Campanhas em massa (e-mail + WhatsApp)

## Contexto

> Substituir o envio em massa do Flowbiz. Já temos `email_templates` (com html/text/variables) e `EmailTemplatesTab`, além de envio **unitário** de WhatsApp (`whatsapp-router`/`zapi-send`/`meta-wa-send`). Falta a camada de **campanha** (disparo em lote para um segmento + métricas) e um **provedor de e-mail**.

No Flowbiz, e-mail tinha ROI 11,75x e o WhatsApp 65% de abertura — campanha multicanal é essencial.

## Spec de Referência
- [[Flowbiz — Dashboard e Métricas CRM]] (métricas a replicar: entrega, abertura, clique, receita influenciada)
- [[Flowbiz — Funcionalidades Mapeadas]] (168 templates exportados)
- depende de [[STORY-018 — Segmentação dinâmica|STORY-018]]

## Critérios de Aceite

- [x] CA1 — Tabela `crm_campaigns` (id, workspace_id, segment_id, name, channel email|whatsapp, template_id, sent/delivered/opened/clicked/bounced/conversion counts, status, scheduled_at, sent_at, created_at) com **RLS**. ✅ + `crm_communications` (log por envio).
- [x] CA2 — Provedor de e-mail + Edge Function `campaign-send`. ✅ envio via **Resend** (chave configurada, e-mail real entregue no teste); throttle simples; fallback dry-run. ✅ **tracking de abertura/clique** (pixel + redirect) entregue na STORY-023. ⏳ só falta JG verificar o domínio p/ enviar à lista toda (hoje sandbox).
- [ ] CA3 — Edge Function `campaign-whatsapp-bulk` (sobre `whatsapp-router`, respeitando opt-out de `flow_optouts` e janela 24h/template aprovado). → **adiado** (precisa de design por-conversa; ver STORY-020/réguas).
- [x] CA4 — Disparo seleciona o público a partir de `crm_segments` (STORY-018); registra `crm_communications`/contadores. ✅ (público = segmento ∖ opt-outs `flow_optouts` email/all).
- [ ] CA5 — Atribuição de receita: cruzar cliques/abertura com pedidos Tray (60 dias) → "receita influenciada" + ROI. → **adiado** p/ STORY-023 (ROI de tráfego).
- [~] CA6 — UI: criar campanha (segmento + template + canal) + ações Prévia(dry-run)/Enviar/Remover + contadores. ✅ slice e-mail. ⏳ agendamento (`scheduled_at`) e dashboard de métricas completo.
- [~] CA7 — LGPD/anti-spam: opt-out **respeitado** no disparo ✅. ⏳ link de opt-out no corpo do e-mail + limite de frequência.
- [ ] CA8 — Importar (ou adaptar) os 168 templates HTML do backup Flowbiz para `email_templates`. → **adiado** (arquivos no OneDrive; ETL próprio).
- [ ] CA9 — **Gestão de templates WhatsApp:** cadastrar/registrar templates **aprovados pela Meta** (HSM) e respeitar a **janela de 24h**. → **adiado** junto com CA3.

---

## Implementação
> Preenchido pelo `@dev`.

**Status:** `em-progresso` — **slice de e-mail entregue e testado** (E2E backend + visual). WhatsApp-bulk, atribuição de receita e import dos 168 templates ficam para stories próprias (CA3/CA5/CA8/CA9 adiados).

**Branch/PR:** commit `1133e84` direto na `main` (push = deploy Lovable).

**Arquivos alterados:**
- `supabase/migrations/20260611000006_story019_campaigns.sql` — `crm_campaigns` + `crm_communications` (RLS por membership; delete restrito a admin).
- `supabase/functions/campaign-send/index.ts` — disparo de e-mail; público = membros do segmento ∖ opt-outs (`flow_optouts` email/all); `render({{var}})` com name/email do contato; auth `requireAuth` OU service_role; **fallback automático para dry-run** quando não há `RESEND_API_KEY` (nunca falha); grava `crm_communications` (queued/sent/skipped/failed) e atualiza contadores da campanha.
- `src/pages/Campaigns.tsx` — lista campanhas; criar (nome/canal/segmento/template/assunto); por campanha: **Prévia (dry-run)**, **Enviar**, **Remover**.
- `src/lib/nav.ts` / `src/App.tsx` — item Marketing > **Campanhas** (`minRole: manager`) + rota `/campaigns`.
- `supabase/config.toml`, `src/integrations/supabase/types.ts` (regenerado).

**Notas de implementação:**
- **Sem provedor configurado → simulação.** `effectiveDry = dry_run || !RESEND_API_KEY`. Isso permite validar audiência, opt-out e contadores sem disparar e-mail de verdade. Para ligar o envio real, JG precisa: criar conta Resend, verificar o domínio `editoraheziom.com.br` e setar `RESEND_API_KEY` (+ opcional `RESEND_FROM`) em `supabase secrets`.
- **Teste E2E backend (5/5 PASS):** segmento B2C de 96 membros → dry-run retornou `audience=96, would_send=95, skipped=1` (1 opt-out); `crm_communications` registrou os 96 (95 queued + 1 skipped).
- **Verificação visual:** workspace de demo semeado (admin), página renderiza em Marketing>Campanhas; botão Prévia chama `campaign-send` (HTTP 200, sem erros de console) e registra as comunicações. Fixture removida ao final.
- **Decisão de provedor:** Resend (simples, ~R$50/mês vs R$1.978 do Flowbiz). SES fica como alternativa se o volume crescer.

---

## QA
> Preenchido pelo `@qa`.

**Gate:**

**Checklist:**
- [ ] disparo em lote (e-mail e WhatsApp) funciona com throttle
- [ ] opt-out respeitado
- [ ] métricas (entrega/abertura/clique) gravadas
- [ ] atribuição de receita cruza com pedidos Tray

---

## Notas e Decisões
> Custo do provedor de e-mail (~R$50/mês) vs. R$1.978/mês do Flowbiz. Decidir Resend (simples) vs SES (volume/barato).
