---
id: STORY-011
titulo: "Painel de Saúde — Integração Tray ↔ Meta"
fase: 1
modulo: heziom-api / painel
status: em-progresso
prioridade: média
agente_responsavel: ""
criado: 2026-05-28
atualizado: 2026-05-28
---

# STORY-011 — Painel de Saúde (Integração Tray ↔ Meta)

## Contexto

A `heziom-api` roda server-side (Netlify Functions) ligando a loja Tray ao Meta CAPI. Hoje, pra saber se está tudo certo (token válido, webhooks chegando, compras sendo rastreadas), só dá olhando logs do Netlify e o Events Manager do Meta — não-acessível pra operação.

Esta story cria um **Painel de Saúde** visual: responde de relance "a Tray aprovou um pedido → o Meta recebeu o evento?", mostra status do token, erros em linguagem clara e métricas de cobertura.

> **Arquitetura de segurança (inegociável):** o painel **nunca** lê o Supabase direto do navegador. `tray_tokens` guarda segredos (access/refresh token) e `raw_payload` guarda PII de cliente (LGPD). O painel consome **só agregados não-sensíveis** via um endpoint read-only protegido por segredo (contagens, status, validade do token — nunca o token em si, nunca PII).

Visual já validado com JG: padrão da LP (`LPplanobomba`), Fraunces + Manrope + JetBrains Mono, verde Heziom + dourado, com tema claro e escuro. Mockup: `01 - Projeto & Visão Geral/heziom-painel-saude-tray-meta-mockup.html`.

## Spec de Referência
- [[heziom-painel-saude-tray-meta-mockup]] — mockup visual aprovado (claro/escuro)
- [[heziom-api — Referência Técnica]]
- [[Tray - Webhook Deploy Guide]]
- [[Meta CAPI — Configuração Tray Ecommerce]]
- [[STORY-010 — Padronização do repo heziom-api]]

---

## ⚠️ Análise de dados — o que o banco guarda HOJE

O painel do mockup mostra mais indicadores do que a `heziom-api` registra atualmente. Levantamento das tabelas:

**`tray_webhook_log`** (gravado por `webhooks-tray.js`): `scope_name`, `scope_id`, `action`, `seller_id`, `app_code`, `raw_payload` (só o ping do webhook — **não** o pedido completo), `processed` (bool), `created_at`.

**`tray_tokens`**: `store_key`, `access_token`, `refresh_token`, `expires_at`, `refreshed_at`.

| Indicador do mockup | Dá pra entregar hoje? | Observação |
|---|---|---|
| Webhooks recebidos | ✅ | `count` por janela |
| Compras rastreadas (CAPI) | ✅ | `count` de `order/update` com `processed=true` |
| Webhooks deduplicados | ✅ | pedidos com N webhooks → 1 processado |
| Status / validade do token | ✅ | de `tray_tokens` (sem expor o token) |
| Webhooks por status | ⚠️ parcial | só por `scope/action`; o **status do pedido** na Tray não é gravado |
| Aprovados sem rastreio | ❌ | status do pedido não é salvo; `processed=false` ≠ "aprovado e não rastreado" |
| Valor rastreado (R$) | ❌ | `total` do pedido é buscado na Tray mas **não é salvo** |
| Latência webhook → CAPI | ❌ | não há timestamp de "CAPI disparado" |
| Taxa de cobertura | ❌ | falta a base de "aprovados" pra comparar |
| Erros (24h) / erros recentes | ❌ | erros só vão pro `console.log` do Netlify, não pro banco |
| Qualidade (EMQ) | ❌ (externo) | vem do Events Manager do Meta, não do banco local |

**Conclusão:** o painel completo exige **instrumentar o webhook** pra gravar mais dados (status do pedido, valor, resultado do CAPI, timestamp e erro). Sem isso, só dá pra entregar um MVP fino.

---

## Plano em fases

- **Fase A — Instrumentar dados** (mexe em `webhooks-tray.js` + Supabase): gravar `order_status`, `value`, `capi_status` (ok/falha/pulado), `capi_sent_at` e `error` no log (colunas novas ou tabela `tray_event_metrics`). Habilita valor, latência, cobertura e erros reais.
- **Fase B — Endpoint read-only** `GET /api/health-stats`: protegido por segredo (header), retorna só agregados (contagens, status do token, latência, cobertura). Nunca token, nunca PII.
- **Fase C — App do painel**: front consumindo o endpoint, com o visual já aprovado (LP + temas).

> Decisão pendente: rodar Fase A (painel completo) ou só B+C com MVP fino primeiro. Definir também onde o app mora e em que formato. Ver "Notas e Decisões".

---

## Critérios de Aceite
- [ ] CA1 — Endpoint `GET /api/health-stats` protegido por segredo, retornando **só agregados** (sem token, sem PII)
- [ ] CA2 — Painel consome o endpoint e renderiza os indicadores definidos no recorte aprovado
- [ ] CA3 — Tema claro/escuro com persistência (padrão visual LP)
- [ ] CA4 — Banner de homologação (até 13/08/2026) visível
- [ ] CA5 — Segurança: nenhum segredo/PII trafega pro navegador; endpoint nega sem credencial
- [ ] CA6 — Doc atualizada (`API_SPECIFICATION.md`, `architecture.md`) no mesmo commit
- [ ] CA7 — (se Fase A) `webhooks-tray.js` instrumentado sem quebrar o fluxo atual; migração Supabase registrada

---

## Implementação
> ⚠️ Preenchido pelo @dev após concluir.

**Status:** `em-progresso`
**Branch/PR:**
**Arquivos alterados:**
-

---

## QA
> ⚠️ Preenchido pelo @qa.

**Gate:** `—`
**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Sem segredo/PII no navegador nem no endpoint
- [ ] Endpoint nega acesso sem credencial
- [ ] Sem regressão no webhook (caminho feliz + status que não dispara)

---

## Notas e Decisões
- Mockup visual aprovado por JG em 28/05/2026 (padrão LP + tema claro/escuro, 8 KPIs + conciliação + status + token + EMQ + resumo 7d).
- **Decisões pendentes (a confirmar com JG antes de codar a Fase A/C):**
  1. **Escopo de dados:** evoluir o registro do webhook (painel completo) ou MVP fino só com o que já existe?
  2. **Formato/local do app:** HTML único standalone (como o mockup) vs app padrão Trivia (Vite+React); repo novo vs pasta.
  3. **Hospedagem/proteção:** onde o painel fica e como é protegido o acesso.
