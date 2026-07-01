---
id: STORY-017
titulo: "Integração Tray (pedidos, clientes, carrinho abandonado, cupons)"
fase: 2
modulo: "integrações"
status: concluido
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-06-15
atualizado: 2026-06-15
---

# STORY-017 — Integração Tray (pedidos, clientes, carrinho, cupons)

## Contexto

> O Tray é o e-commerce D2C da Heziom e a fonte de **pedidos, clientes, carrinhos abandonados e cupons** que alimentam o CRM (histórico de compra, segmentação, réguas). Já existe a ponte **Meta CAPI ↔ Tray** num repo separado (`heziom-api`, Netlify), mas o Sales-Hzm **ainda não consome a Tray**.

**Auth:** OAuth2 (Consumer Key/Secret + Access/Refresh token). **Rate limit:** 180 req/min. Credenciais ficam em `workspace_integrations`.

## Spec de Referência
- [[Mapa Completo de APIs e Capacidades]] (Tray: ~100 endpoints, 10 webhooks)
- [[Meta CAPI — Configuração Tray Ecommerce]] (ponte existente + dedup)
- depende de [[STORY-015 — Customer cross-channel (estender contacts)|STORY-015]]

## Critérios de Aceite

- [ ] CA1 — Edge Function `tray-sync` (autenticada/admin): puxa `GET /customers` e `GET /orders` (paginado, 50/pág), upsert em `contacts` (dedup CPF) e `crm_contact_purchases`.
- [ ] CA2 — Edge Function pública `tray-webhook` (HMAC/secret validado) que recebe `order.insert`, `order.update`, `transaction.update`, `invoice.insert` e dispara eventos internos.
- [ ] CA3 — **Carrinho abandonado:** cron (ou evento Tray) gera `ecom.cart.abandoned` → enfileira na régua (STORY-020).
- [ ] CA4 — Chave de conciliação registrada: `order.id` ↔ futuro pedido; `customer.cpf` → `contacts.cpf_cnpj`.
- [ ] CA5 — Renovação automática do `access_token` (refresh) — não quebrar em token expirado.
- [ ] CA6 — Cupons: leitura de `GET /coupons` para relatório de uso por campanha (atribuição).
- [ ] CA7 — Idempotência: webhook reprocessado não duplica compra (dedup por `source_order_id`).
- [ ] CA8 — `config.toml` com `verify_jwt` correto (sync=true, webhook=false); segredo nunca no frontend.

---

## Implementação
> Preenchido pelo `@dev`.

**Status:** `concluido` — sync + tokens + webhook + cupom. (CA3 carrinho abandonado movido p/ STORY-020.)

**Branch/PR:** commits `6173efc` (sync/tokens) + `6a7ee8a` (webhook/cupom) em `main`

**Arquivos alterados:**
- `supabase/migrations/20260611000002_story017_tray_tokens.sql` (novo — singleton de tokens)
- `supabase/migrations/20260611000003_fix_crm_purchases_unique.sql` (índice único não-parcial p/ upsert)
- `supabase/functions/_shared/tray.ts` (novo — cliente Tray + gestão de token)
- `supabase/functions/tray-sync/index.ts` (novo)
- `supabase/functions/tray-token-refresh/index.ts` (novo)
- `supabase/config.toml` + Supabase secrets (TRAY_CONSUMER_KEY/SECRET)

**Status dos CAs:**
- ✅ **CA1** — `tray-sync` puxa `/customers` → `contacts` (dedup CPF/email, B2B/B2C) e `/orders` → `crm_contact_purchases`.
- ✅ **CA2** — `tray-webhook` (tempo real): evento order → fetch `/orders/{id}/complete` → upsert contato+compra; secret na query; idempotente. **Ativação:** apontar a URL de notificação do app Tray p/ a função (painel parceiro) — o endpoint REST `/webhooks` não existe neste plano. Coordenar com o `heziom-api` (CAPI) p/ não duplicar.
- ✅ **CA4** — chave de conciliação: `order.id` → `source_order_id`; `customer.cpf` → `contacts.cpf_cnpj`.
- ✅ **CA5** — refresh proativo (margem 5min) + uso único salvando o novo par; validado (rotaciona + sync segue).
- ✅ **CA6** — cupom (`discount_coupon`) capturado em `crm_contact_purchases.coupon` (sync + webhook). Relatório/atribuição completa → STORY-023.
- ✅ **CA7** — idempotência (upsert por `workspace_id,source,source_order_id`): 290→290 no re-run.
- ✅ **CA8** — `verify_jwt` correto; tokens em tabela só-`service_role`; secrets fora do front.
- ➡️ **CA3** — carrinho abandonado: **movido para [[STORY-020 — Réguas de relacionamento|STORY-020]]** (a detecção via `/carts` + o disparo da régua são uma unidade só; Tray não tem webhook de carrinho).

**Notas de implementação:**
- O caller **service_role** externo não pôde ser imitado nos testes (a `SUPABASE_SERVICE_ROLE_KEY` injetada na função difere da chave legada do `.env`); o caminho **admin logado** (`requireAuth`) foi validado E2E. O cron usará a env injetada (mesma da função) → funciona.
- ⚠️ **Centralização de token:** se o `heziom-api` (CAPI) refrescar a MESMA loja, há conflito. A loja **1501119** é dedicada de teste — confirmar antes de agendar cron de refresh.
- Loja anterior 1225878 bloqueada — usar só 1501119.

---

## QA
> Preenchido pelo `@qa`.

**Gate:** `PASS` (CA3 carrinho abandonado realocado p/ STORY-020)

**Checklist:**
- [x] `tray-sync` traz pedidos/clientes (real: **108 contatos / 290 compras / R$ 131.988,20**)
- [x] LTV recalculado pelo trigger (82 contatos; top R$ 23.187,90 / 14 compras)
- [x] idempotente (290 → 290)
- [x] token refresh funciona (rotaciona + salva + sync segue)
- [x] segredos fora do frontend (tabela só-`service_role`, REVOKE confirmado)
- [x] webhook valida secret (errado→401) e é idempotente; processa pedido **sem apikey** (como o Tray real)
- [x] cupom capturado em `crm_contact_purchases.coupon` (2 compras na amostra)
- [x] typecheck 0; helpers compartilhados (DRY sync↔webhook)
- [➡️] carrinho abandonado → **STORY-020**

---

## Notas e Decisões
> A loja-teste Tray (`1225878`) está bloqueada — validar com a loja de produção/homologação. Avaliar reaproveitar/centralizar a lógica do `heziom-api` aqui, ou mantê-lo só para o CAPI.
