---
id: STORY-023
titulo: "ROI de Tráfego & Atribuição (Meta/Google Ads, UTM, MER, lead→compra)"
fase: 2
modulo: "crm"
status: em-progresso
prioridade: media
agente_responsavel: "@dev"
criado: 2026-06-15
atualizado: 2026-06-15
---

# STORY-023 — ROI de Tráfego & Atribuição

## Contexto

> 5º submódulo do *Índice Marketing e CRM* (o que faltava no épico). Hoje a Heziom gasta **R$ 80k/mês em Meta Ads** com ROAS caindo (4x→2x) e o Flowbiz é **desconectado dos dados reais**. As LPs (Plano Bomba, Bíblia 120) capturam leads e já têm Pixel + GA4 + **CAPI server-side** (no repo `heziom-api`). Falta o CRM **fechar o ciclo**: lead→compra, UTM→canal, gasto→receita (**MER**).

## Spec de Referência
- [[Plano Bomba — Tráfego Pago Meta Ads]] (MER, ROAS, cadência de decisão)
- [[Meta CAPI — Configuração Tray Ecommerce]] (CAPI + dedup já no ar)
- [[LP Coleções 2026 (Plano Bomba) — Configuração]] (captura de lead, UTM, cupons)
- depende de [[STORY-015 — Customer cross-channel (estender contacts)|STORY-015]] e [[STORY-017 — Integração Tray|STORY-017]]

## Critérios de Aceite

- [x] CA1 — `lead-intake` **enriquecido**: grava `utm_source/medium/campaign/content/term` e `combo_interesse` (lê `body.utm` ou `hz_utm_v1` dentro de `campos_adicionais`) + `lead_captured_at`. ✅
- [x] CA2 — **Atribuição lead→compra:** trigger `crm_attribute_purchase_to_lead` marca `contacts.converted_from_lead=true` quando há compra até **60 dias** após `lead_captured_at`. ✅ *(Vínculo por contato; UTM/campanha de origem já gravados no contato.)*
- [ ] CA3 — Conector **Meta Ads (Marketing API)**. → **adiado:** depende de token Meta em `workspace_integrations`.
- [ ] CA4 — Conector **Google Ads**. → **adiado:** depende de credenciais Google.
- [ ] CA5 — **MER** + ROAS + breakdown. → **adiado:** depende do gasto vindo dos conectores (CA3/CA4).
- [ ] CA6 — Dashboard "Tráfego" (gasto/conversões/ROAS/MER). → **adiado** junto com CA3/CA5.
- [ ] CA7 — **Alerta** ROAS/divergência Meta×GA4. → **adiado** junto com CA3.
- [ ] CA8 — Reusar/consumir o `heziom-api` (CAPI) — **decisão a tomar** quando ligarmos os conectores.

### ✅ Bônus desta fatia (tracking de e-mail — não estava nos CAs mas destrava 019/022)
- [x] **Pixel de abertura + redirect de clique** (`email-track`, função pública; guard de open-redirect só http(s)); `opened_at`/`clicked_at` em `crm_communications`. `campaign-send` e `flow-action-executor` passam a rastrear.
- [x] **Funil** envio→abertura→clique→pedido influenciado + **receita influenciada** (compras até 60d após interagir com e-mail) no `crm_dashboard` e na aba CRM → **fecha o CA3 da STORY-022** e o **tracking de abertura/clique da STORY-019**.

---

## Implementação
> Preenchido pelo `@dev`.

**Status:** `em-progresso` — **Fatia 1 (credential-free) entregue e testada (E2E 11/11):** tracking de e-mail, atribuição lead→compra, captura de UTM e receita influenciada. Os **conectores de anúncios (CA3–CA7)** dependem de token Meta/Google e ficam para a Fatia 2.

**Branch/PR:** commit `7cfb019` direto na `main`.

**Arquivos alterados:**
- `supabase/migrations/20260611000009_story023_tracking_attribution.sql` — `opened_at`/`clicked_at` + índices; colunas UTM/`combo_interesse`/`lead_captured_at`/`converted_from_lead` em contacts; trigger de atribuição; `crm_dashboard` ganha `funnel` + `influenced`.
- `supabase/functions/email-track/index.ts` *(novo)* — pixel + redirect (público, guard open-redirect).
- `supabase/functions/_shared/email-tracking.ts` *(novo)* — injeta pixel + embrulha links.
- `supabase/functions/campaign-send/index.ts`, `flow-action-executor/index.ts` — rastreiam (id = capability); o executor passa a gravar `crm_communications`.
- `supabase/functions/lead-intake/index.ts` — parse de UTM/combo + `lead_captured_at`.
- `src/lib/analytics.ts` (`computeCrmFunnel` + tipos), `src/pages/Analytics.tsx` (card de funil + receita influenciada), `src/test/analytics.test.ts`.

**Notas de implementação:**
- **Capability do tracking** = o próprio `id` (UUID) da `crm_communications`. Não-adivinhável; sem auth na função (pixel precisa abrir em qualquer cliente de e-mail).
- **Open-redirect:** o redirect de clique só aceita `http(s)`; outros esquemas caem no fallback. (O Cloudflare/WAF ainda bloqueia payloads `javascript:` antes da função — proteção dupla.)
- **Receita influenciada:** compras cujo contato abriu/clicou um e-mail nos 60 dias anteriores à compra (espelha a definição do Flowbiz).
- **E2E (11/11):** pixel grava `opened_at` (200 GIF), clique grava `clicked_at` (302 ao destino), open-redirect cai no fallback, capability inválida não quebra, atribuição liga/desliga corretamente, funil e receita influenciada conferem. Visual: card de funil renderiza (30→12→4→4, receita R$800), zero erro de console.

### Fatia 2 (precisa de credenciais) — conectores de anúncios
- Meta Ads (CA3), Google Ads (CA4), MER/ROAS por gasto (CA5), dashboard de Tráfego (CA6), alertas (CA7), decisão CAPI/heziom-api (CA8). Token Meta/Google em `workspace_integrations`.

---

## QA
> Preenchido pelo `@qa`.

**Gate:**

**Checklist:**
- [ ] lead grava UTM/source/combo
- [ ] atribuição lead→compra funciona (amostra)
- [ ] MER/ROAS calculados e batendo com Meta Ads Manager
- [ ] alerta de ROAS/divergência dispara

---

## Notas e Decisões
> Triangulação oficial: Meta Ads Manager (diária) + GA4 (semanal) + ERP Literarius (quinzenal). Métrica unificadora = **MER** (meta ≥ 4,0x jun / ≥ 4,5x jul). Credenciais Meta/Google em `workspace_integrations`.
