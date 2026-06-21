---
id: STORY-004
titulo: "Endurecer autenticação das Edge Functions (webhook, laudos, Auvo)"
fase: 1
modulo: "backend"
status: concluido
prioridade: alta
agente_responsavel: "@dev / @security"
criado: 2026-06-18
atualizado: 2026-06-18
---

> ✅ **Concluída 2026-06-18.** SEC-012 (laudos-agent verify_jwt=true), SEC-013 (webhook valida x-webhook-secret, segredo em pcm_app_config), SEC-004 (config.toml). Cutover sem quebra + teste ao vivo do Zé OK ("Estou aqui, João!"). SEC-006b (Auvo) adiado p/ STORY-008. Commit 21a11b1.

# STORY-004 — Endurecer autenticação das Edge Functions

## Contexto

Vários achados de autenticação das Edge Functions, confirmados em produção:

- **SEC-013 (P1):** o webhook da Evolution (`pcm-whatsapp-webhook`) é autenticado **só com a anon key (role=anon)** — que está embutida no frontend. Qualquer um com ela pode forjar `messages.upsert` e injetar mensagens no pipeline do Zé.
- **SEC-012 (P1):** `laudos-agent` é **pública** (`verify_jwt=false`, retorna 400 sem header) e chama `claude-sonnet-4-6` (caro) — risco de abuso de custo se a URL vazar.
- **SEC-006b (P1):** `pcm-auvo-webhook` valida `x-webhook-secret` contra `AUVO_WEBHOOK_SECRET`, mas esse secret **não está configurado** → a checagem é pulada.
- **SEC-004 (P1):** `supabase/config.toml` está vazio — não há declaração explícita de `verify_jwt` por function; tudo depende do default implícito.

## Spec de Referência

- `SECURITY_DEBT.md` → SEC-013, SEC-012, SEC-006b, SEC-004
- [[../Mapeamento/03 - Edge Functions]] e [[../Mapeamento/00b - Verificacao]] (itens 13, 14)

## Critérios de Aceite

- [ ] CA1 — `pcm-whatsapp-webhook` usa um **secret dedicado de webhook** (não a anon key) — header próprio validado no código + configurado na Evolution (`webhook/set`).
- [ ] CA2 — `laudos-agent` com `verify_jwt=true` (ou validação de JWT/role no código).
- [ ] CA3 — `AUVO_WEBHOOK_SECRET` configurado no Supabase e o header correspondente no painel Auvo (quando o Auvo entrar em uso — ver STORY-008).
- [ ] CA4 — `supabase/config.toml` declara `verify_jwt` por function (públicas: webhook do Auvo/Evolution conforme estratégia; demais exigem JWT).

---

## Implementação

**Status:** `pronto`

**Notas:**
- Para o webhook do Zé: como a Evolution só manda 1 header `Authorization`, avaliar (a) um JWT de service dedicado de curta validade, ou (b) validar um token secreto no body/header customizado. Reconfigurar via `/webhook/set/ze-pcm-v2`.
- ⚠️ Baixar versões de produção antes de editar; deployar com `--use-api`.
- Cuidado: mudar verify_jwt do webhook sem atualizar a config na Evolution **quebra o recebimento** (já aconteceu — ver SEC-R02).

---

## QA

**Gate:** *(pendente)*

- [ ] Zé continua recebendo após trocar a auth do webhook (teste real no grupo).
- [ ] `laudos-agent` retorna 401 sem JWT válido.
- [ ] POST forjado sem o secret correto é rejeitado.
