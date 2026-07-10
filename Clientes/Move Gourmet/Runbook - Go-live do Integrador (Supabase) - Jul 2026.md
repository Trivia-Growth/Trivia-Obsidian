---
tags:
  - move-gourmet
  - integrador
  - go-live
  - supabase
  - runbook
cliente: Move Gourmet
data: 2026-07-05
status: pronto-para-executar
---

# Runbook — Go-live do Integrador (Supabase-nativo)

> Tudo o que falta pra ligar o integrador em produção. Cada passo é copy-paste. **Nenhum valor de
> segredo neste arquivo** (o vault sincroniza pro GitHub). O código/config já estão no repo
> `Trivia-Growth/integradormovegourmet` (ver ADR-0003). Roda **em shadow até o passo 8** (não escreve
> no Shopify). Projeto Supabase: `lygxygsjxbpfqujvydxf`.

## Pré-requisito: acesso
As edge functions só deployam pela conta Supabase **dona do projeto** `lygxygsjxbpfqujvydxf` (a conta
do meu CLI deu 403 — é de outra org). Rode os `supabase` abaixo logado nessa conta
(`supabase login`) OU com um Management PAT novo dessa conta em `SUPABASE_ACCESS_TOKEN`.

## Passo 0 — Rotacionar os segredos vazados (só você faz, nos painéis)
Estes passaram pelo chat e **têm que ser regenerados antes de ir pra produção**:
- **Omie:** app.omie.com.br → Configurações → Integrações/API → regenerar **App Key/App Secret**.
- **Shopify:** Dev Dashboard (dev.shopify.com) → app "integrador Movegourmet" → API credentials →
  rotacionar o **Client secret** (`shpss_`).
- **Supabase:** Dashboard → Project Settings → API → (se preciso) novo **service_role**; e Account →
  Access Tokens → revogar o `sbp_` antigo e gerar um novo.
Guarde os novos valores para o passo 2 (não colar aqui nem no chat).

## Passo 1 — Deploy das edge functions
```bash
supabase functions deploy sync-estoque   --project-ref lygxygsjxbpfqujvydxf
supabase functions deploy webhook-shopify --project-ref lygxygsjxbpfqujvydxf
```
(Ou, se a integração nativa GitHub estiver ligada, o merge na main já deploya — as 2 funções estão
declaradas no `config.toml`.)

## Passo 2 — Setar os segredos (com os valores ROTACIONADOS do passo 0)
```bash
supabase secrets set --project-ref lygxygsjxbpfqujvydxf \
  OMIE_APP_KEY=... OMIE_APP_SECRET=... \
  OMIE_LOCAL_SALVADOR=3390627692 OMIE_LOCAL_SAOPAULO=10009035408 \
  SHOPIFY_SHOP_DOMAIN=9ja6tr-1i.myshopify.com \
  SHOPIFY_CLIENT_ID=... SHOPIFY_CLIENT_SECRET=... SHOPIFY_API_VERSION=2026-07 \
  SHOPIFY_LOC_SALVADOR=gid://shopify/Location/85518483692 \
  SHOPIFY_LOC_SAOPAULO=gid://shopify/Location/92526051564 \
  STOCK_SYNC_MODE=shadow STOCK_SAFETY_BUFFER_PCT=5 \
  CRON_SECRET=$(openssl rand -hex 32)
```
> Anote o `CRON_SECRET` gerado (aparece só aqui) — precisa dele no passo 3.
> `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` são injetados automaticamente, não precisa setar.

## Passo 3 — Segredo do cron no Vault (SQL Editor)
```sql
select vault.create_secret('<o mesmo CRON_SECRET do passo 2>', 'cron_secret');
```

## Passo 4 — Validar em SHADOW (antes de ligar o cron)
Invoca a função na mão e confere o plano (não escreve, STOCK_SYNC_MODE=shadow):
```bash
curl -s -X POST 'https://lygxygsjxbpfqujvydxf.supabase.co/functions/v1/sync-estoque' \
  -H "x-cron-secret: <CRON_SECRET>" | jq '.resultados[] | {deposito, operacoes, escritos, erros}'
```
Espera-se `erros: 0` e `operacoes` > 0 nos 2 depósitos. Ver logs em Dashboard → Edge Functions → sync-estoque.

## Passo 5 — Ligar o cron (SQL Editor)
Rodar o script `supabase/deploy/cron-sync.sql` do repo (delta 10min + reconciliação diária).
Ainda em shadow — o cron só roda o mesmo sync do passo 4, sem escrever.

## Passo 6 — Registrar o webhook de pedido no Shopify (Fluxo B, opcional agora)
> O Fluxo A (estoque) NÃO depende disto. O webhook hoje faz só o **roteamento** (corrige a Location);
> a gravação/faturamento do pedido no Omie ainda será fiada depois. Pode pular e ligar só o estoque.
GraphQL Admin (webhookSubscriptionCreate), topic `FULFILLMENT_ORDERS_ORDER_ROUTING_COMPLETE`,
callbackUrl `https://lygxygsjxbpfqujvydxf.supabase.co/functions/v1/webhook-shopify`.

## Passo 7 — Confirmar os 3 de-para pendentes (Nat/Fernanda) e ajustar
Antes do exec, fechar com a Nat: `PRD00732` (pão de queijo grana padano), `PRD00845` (trufa branca
frutas vermelhas), `PRD00894` (terrine grana padano). Ajustar no `product_map` os que ela corrigir.

## Passo 8 — Virar o EXEC (começa a escrever no Shopify)
```bash
supabase secrets set --project-ref lygxygsjxbpfqujvydxf STOCK_SYNC_MODE=exec
```
Rodar 1 ciclo (passo 4) e conferir no site que o estoque bateu. **A partir daqui escreve de verdade.**

## Rollback
- Voltar pra shadow: `supabase secrets set STOCK_SYNC_MODE=shadow`.
- Desligar o cron: `select cron.unschedule('mg-sync-delta'); select cron.unschedule('mg-sync-reconciliar');`
- Reverter OPs dos packs: `ReverterOrdemProducao` (ver runbook dos packs).
