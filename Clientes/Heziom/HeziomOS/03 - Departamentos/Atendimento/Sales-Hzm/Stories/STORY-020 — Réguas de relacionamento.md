---
id: STORY-020
titulo: "Réguas de relacionamento sobre o flow-engine"
fase: 2
modulo: "crm"
status: em-progresso
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-15
atualizado: 2026-06-15
---

# STORY-020 — Réguas de relacionamento (sobre o flow-engine existente)

## Contexto

> O Sales-Hzm **já tem** o motor de automação completo (`flows`, `flow_nodes`, `flow_enrollments`, `flow_execution_log`, `flow_optouts` + `flow-engine`/`flow-action-executor`). Esta story **configura as réguas** que geravam receita no Flowbiz (R$216k recuperados no histórico), aproveitando esse motor — não recriá-lo.

As 5 réguas (por prioridade de receita): **Boas-vindas** (conv. 10,5%), **Carrinho abandonado** (maior receita; WhatsApp = 87%), **Recompra D+75**, **Cliente VIP** (2ª+ compra), **Aniversário** (CTOR WhatsApp 47%).

## Spec de Referência
- [[Flowbiz — Automações e Fluxos Mapeados]] (todas as réguas: trigger, canal, delay, cupom, performance)
- depende de [[STORY-017 — Integração Tray|STORY-017]] (carrinho), [[STORY-018 — Segmentação dinâmica|STORY-018]] (gatilhos) e [[STORY-019 — Campanhas em massa|STORY-019]] (canais)

## Critérios de Aceite

- [~] CA1 — **Boas-vindas:** trigger novo cadastro → e-mail (cupom `NEWSLETTER10`). ✅ e-mail (2 passos: cupom → reforço). ⏳ passo de WhatsApp na fatia 2. *Obs.: no Flowbiz o passo de e-mail entregou o valor todo (12% conv); WhatsApp tinha 0 envios.*
- [ ] CA2 — **Carrinho abandonado.** → **adiado p/ fatia 2.** Depende de (a) evento de carrinho abandonado da Tray (hoje não existe — a Tray só envia pedidos concluídos) e (b) WhatsApp em massa (90% da receita dessa régua é WhatsApp). Fazer só com e-mail entregaria <5% do valor.
- [~] CA3 — **Recompra D+75:** trigger D+75 sem nova compra (`flow_audience_reorder`) → e-mail (cupons `EBDC`/`GENERO`). ✅ e-mail. ⏳ WhatsApp fatia 2.
- [~] CA4 — **Cliente VIP:** 2+ compras (`flow_audience_vip`, lê `purchase_frequency`) → e-mail (cupom `VIP15`). ✅ e-mail. ⏳ WhatsApp fatia 2.
- [~] CA5 — **Aniversário:** D-7 (`flow_audience_birthday`, compara MM-DD) → e-mail (cupom `ANIVER`). ✅ e-mail. ⏳ WhatsApp fatia 2.
- [x] CA6 — Réguas respeitam `flow_optouts` (já no executor) ✅ e **cancelam ao comprar no meio** (trigger `crm_cancel_flows_on_purchase`, via `trigger_config.cancel_on_purchase`) ✅. Janela WhatsApp → fatia 2.
- [~] CA7 — Métricas por passo via `flow_execution_log` (enviados/erro/skip) ✅ visíveis em `/flows/:id/logs`. ⏳ abertura/clique/receita influenciada → STORY-022/023.
- [ ] CA8 — Cupons (`NEWSLETTER10`, `VIP15`, `ANIVER`, `EBDC`, `GENERO`) no Tray. → **tarefa do JG** (os templates já referenciam; o desconto só vale quando o cupom existir no Tray).

---

## Implementação
> Preenchido pelo `@dev`.

**Status:** `em-progresso` — **fatia de e-mail entregue e testada (E2E 20/20).** O motor de réguas está ligado e rodando; as 4 réguas de e-mail funcionam ponta a ponta. Carrinho abandonado (CA2) e os passos de WhatsApp ficam para a fatia 2.

**Branch/PR:** commit `76df1c5` direto na `main` (push = deploy Lovable + funções já deployadas no Supabase).

**Arquivos alterados:**
- `supabase/migrations/20260611000007_story020_relationship_flows.sql` — `pg_net`; RPCs de público (`flow_audience_new_subscribers/birthday/reorder/vip`) com dedup e exigência de régua ativa; trigger `crm_cancel_flows_on_purchase` (CA6); instalador `install_relationship_flows` + helper `_install_email_regua`; 2 crons (`flow-engine-process` */10, `flow-daily-triggers` 08:00) via `net.http_post` + segredo no Vault.
- `supabase/functions/flow-daily-triggers/index.ts` *(novo)* — varredura diária; monta público por RPC e dispara o `flow-engine` por contato.
- `supabase/functions/flow-engine/index.ts` — aceita o cron-secret; **corrige avanço da espera** (antes re-executava o nó `wait` → re-agendava eterno).
- `supabase/functions/flow-action-executor/index.ts` — `from_email` cai no `RESEND_FROM`.
- `supabase/functions/_shared/auth.ts` — `isCronCaller` (segredo `x-cron-secret`).
- `supabase/functions/initialize-workspace/index.ts` — semeia as 4 réguas (rascunho) ao criar a org.
- `supabase/config.toml` — `flow-daily-triggers` com `verify_jwt=false`.

**Notas de implementação:**
- **Réguas nascem como `draft`** — o admin revisa templates + ativa em `/flows`. Enquanto draft, os RPCs de público retornam vazio (nada dispara). *Para o E2E foram ativadas via SQL.*
- **Arquitetura dos gatilhos:** evento real-time (futuro: carrinho/compra) → `flow-engine` direto; gatilhos por tempo/estado (aniversário, D+75, novo assinante, VIP) → cron diário `flow-daily-triggers`. Sem trigger por-linha em `contacts` (evita disparo em massa na importação Tray; `new_subscriber` exclui `source_channel in (tray,literarius,marketplace)`).
- **Auth do cron:** `pg_net` não tem a service-role *injetada* na função (a chave da API não bate com a injetada — testado, dá 401). Por isso um `CRON_SECRET` dedicado, guardado no Vault (lado do cron) e nos secrets da função.
- **Segredos setados no Supabase:** `RESEND_API_KEY`, `RESEND_FROM=Heziom <onboarding@resend.dev>` (sandbox), `CRON_SECRET`. Vault: `flow_cron_secret`.
- **E2E (20/20):** instalação (4 réguas/8 templates/16 nós, draft), RPCs de público (dedup + exclui import Tray), varredura diária enrolou os 4 públicos, `send_email` executado em cada um (**e-mail real entregue** no sandbox), espera agendada, **cancelamento ao comprar** confirmado, **cron avançou a espera até o 2º e-mail** (bug corrigido), auth negativa (401 sem/segredo errado). + onboarding semeia as 4 réguas.

### Fatia 2 (próxima) — o que falta
- **Carrinho abandonado (CA2):** evento de carrinho abandonado da Tray + WhatsApp em massa.
- **Passos de WhatsApp** em todas as réguas (motor já tem o nó `send_whatsapp`; depende do WhatsApp em massa / templates Meta aprovados — ver STORY-019 CA3/CA9).
- **Janela 24h do WhatsApp** (CA6 parte WhatsApp).
- **Cupons no Tray (CA8)** — tarefa do JG.

---

## QA
> Preenchido pelo `@qa`.

**Gate:**

**Checklist:**
- [ ] cada régua dispara no trigger correto
- [ ] carrinho abandonado cancela ao comprar
- [ ] opt-out e janela WhatsApp respeitados
- [ ] métricas por passo registradas

---

## Notas e Decisões
> **Stopgap p/ prazo Flowbiz (26/06):** se não houver prorrogação, priorizar **CA1 (boas-vindas)** e **CA2 (carrinho abandonado)** como mínimo viável — são as de maior conversão/receita.
