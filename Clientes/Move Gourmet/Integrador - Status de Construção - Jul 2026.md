---
tags:
  - move-gourmet
  - integrador
  - shopify
  - omie
  - status
cliente: Move Gourmet
data: 2026-07-02
status: em-desenvolvimento
---

# Integrador Move Gourmet — Status de Construção

> Diário do que foi construído e **onde paramos** (02/07/2026). Complementa a
> [[Integrador Estoque Multi-CD - Especificação Técnica - Jul 2026|spec técnica]] e o
> [[Achado - SKUs Shopify x Omie - Jul 2026|achado crítico dos SKUs]].

## Resumo em uma frase
O **Fluxo A (sincronização de estoque Omie → Shopify por CD) está pronto no código e provado
ponta a ponta contra os sistemas reais**. O que falta para ir ao ar não é código nosso: é a
**correção dos SKUs no Shopify** (cliente) e a decisão do **host** do serviço.

---

## Repositório e infra
- **Repo:** `Trivia-Growth/integradormovegourmet` (local: `~/Documents/Obsidian/Github/Move Gourmet`).
- **Padrão:** Padrão OS v3 (esteira SDD) + framework TRIVIAIOX v5. Backlog em `docs/ROADMAP.md`,
  8 épicos em `specs/0001`–`0008`. Fonte da verdade em runtime: `CLAUDE.md` + `docs/`.
- **Stack:** Node.js + TypeScript strict, sem frontend (serviço headless). Zod, `@supabase/supabase-js`,
  `tsx`. Gates: biome + vitest + tsc + esteira. Hooks husky ligados (pre-commit lint, pre-push testes).
- **Banco Supabase provisionado:** ref `lygxygsjxbpfqujvydxf`. 5 tabelas criadas (RLS deny-all):
  `product_map`, `stock_snapshot`, `webhook_inbox`, `outbox`, `order_sync`. `product_map` **populado
  com os 1.432 produtos do Omie**; snapshot ainda vazio (nada escrito de verdade).
- **~50 testes verdes**, tudo commitado e pushado na main.

## Estado dos épicos
| Épico | O que é | Status |
|---|---|---|
| 0001 | PoC leitura+escrita | ✅ spec (superado pelos épicos reais) |
| 0002 | Fundação (banco, config, confiabilidade) | ✅ lógica pronta+testada; migrations aplicadas. Falta adapters de fila reais (inbox/outbox no banco) + servidor HTTP |
| 0003 | Mapa de SKU | ✅ Omie carregado (1.432); cruzamento rodado → **achado crítico** |
| 0004 | **Sync de estoque (Fluxo A)** | ✅ **COMPLETO no código** (ver abaixo). Falta só o loop/cron (host) |
| 0005 | Cutover do Hub (Strangler Fig) | ⏳ a fazer (depende do 0004 em prod) |
| 0006–0007 | Fluxo B (pedido) | ⏳ a fazer |
| 0008 | Observabilidade/operação | ⏳ a fazer |

---

## Fluxo A (0004) — o que está pronto e provado
Tudo testado in-memory **e** verificado contra Omie + Shopify + Supabase reais:
- **Ler saldo do Omie por depósito** (`ListarPosEstoque` paginado).
- **Casar produto** via `product_map` (SKU Omie ↔ variant Shopify).
- **Diff contra snapshot** (só escreve o que mudou) — camada delta.
- **Reconciliação diária** (`--reconciliar`): ignora o snapshot, reescreve todos os casados usando
  o `on_hand` real como referência. Corrige drift.
- **Escrever `on_hand` por Location** (`inventorySetQuantities`, lotes de 250) — nunca `available`.
- **Ativar tracking** onde falta (`inventoryActivate`) — necessário no SP.
- **Retry de STALE** (re-lê o on_hand e reenvia), **buffer de segurança**, **shadow mode**.
- Snapshot só avança quando ativação + escrita saem 100% limpas.

**Rodado em shadow no real:** Salvador casa 7 produtos (todos com tracking → seriam setados);
SP casa 7 (nenhum com tracking → seriam ativados). Escrita real verificada em no-op.

### CLIs disponíveis (rodar com `node --env-file=.env --import tsx <arquivo>`)
- `src/interfaces/cli/carregar-mapa-omie.ts` — carrega o catálogo Omie no `product_map`.
- `src/interfaces/cli/cruzar-sku.ts` — cruza Shopify × Omie e gera o relatório.
- `src/interfaces/cli/sync-estoque.ts` — sync dos 2 depósitos. **Shadow por padrão**; `--exec`
  escreve de verdade; `--reconciliar` roda a reconciliação.

---

## Decisões e achados técnicos (o que aprendemos apanhando)
1. **Token do Shopify (2026):** apps personalizados legados foram desativados. O caminho é app no
   **Dev Dashboard** → instalar na loja → **escopos em Versões → Criar versão → Acesso** (não em
   Configurações). Token via **`client_credentials` grant** (client_id + client_secret shpss_ →
   `shpat_` de ~24h; o serviço renova sozinho). O token `atkn_` de automação **não serve** para a
   Admin API. Domínio da loja: `9ja6tr-1i.myshopify.com`.
2. **`@idempotent` é OBRIGATÓRIO** em `inventorySetQuantities` e vai **no campo**
   (`inventorySetQuantities(...) @idempotent(key:...)`), não na operação. Verificado na loja real.
3. **Publicar `on_hand`, nunca `available`** (senão o Shopify desconta o committed 2×). `changeFrom`
   (compare-and-set) vem do on_hand real.
4. **`codigo_local` = bigint** (o ID de depósito do Omie, ex. 3390627692, estoura int4).
5. **Locations do SP sem tracking** — precisam de `inventoryActivate` antes de setar (já tratado).
6. 🚨 **SKUs quebrados** (achado crítico) — só 9 de 124 produtos do Shopify têm SKU que casa com o
   Omie; 97 sem SKU. Bloqueia a sync de verdade. Ver [[Achado - SKUs Shopify x Omie - Jul 2026]].

---

## Onde paramos / próximos passos
**O código do Fluxo A está pronto para produção.** O que falta:
1. **Loop/cron do poller** (agenda o sync delta a cada 5–15 min + reconciliação diária) — depende
   de escolher o **host**.
2. **Fluxo B (0006/0007):** ingestão de pedido (webhook `order_routing_complete` + HMAC), regra de
   roteamento Salvador×SP, gravação no Omie com `codigo_local_estoque` por item, faturamento.
3. **Cutover do Hub (0005):** shadow → migrar SP → Salvador → desligar sync de estoque do Hub.

## Bloqueios reais (nenhum é código nosso travado)
- **SKUs do Shopify** — a Move precisa preencher/corrigir (só 9/124 casam). É o pré-requisito para
  rodar `--exec` de verdade. Material pronto pra Fernanda no [[Achado - SKUs Shopify x Omie - Jul 2026]].
- **Host do serviço** — Fly / Render / Railway (decisão de infra).

## Pendências de segurança (rotacionar — passaram pelo chat)
- **Supabase Management PAT** (`sbp_…`) — token de conta inteira, alto risco.
- **Shopify client secret** (`shpss_…`) e o token de automação `atkn_` criado por engano.
- **Omie APP_KEY/APP_SECRET** (da auditoria).
- As chaves reais vivem só no `.env` (gitignored) e no scratchpad da sessão — nunca no vault/repo.
