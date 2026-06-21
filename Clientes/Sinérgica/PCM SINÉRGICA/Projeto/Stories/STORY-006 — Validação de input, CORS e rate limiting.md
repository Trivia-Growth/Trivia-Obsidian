---
id: STORY-006
titulo: "Validação de input (Zod), CORS restrito e rate limiting"
fase: 1
modulo: "backend"
status: backlog
prioridade: média
agente_responsavel: "@dev / @security"
criado: 2026-06-18
atualizado: 2026-06-18
---

# STORY-006 — Validação de input, CORS restrito e rate limiting

## Contexto

Endurecimento das Edge Functions, achados confirmados em produção:

- **SEC-005 (P1):** nenhuma function valida o corpo com Zod (ou schema). Inputs do webhook da Evolution e das tools do LLM (`numero_os`, `status`, etc.) são consumidos sem validação.
- **SEC-003 (P1):** CORS aberto (`Access-Control-Allow-Origin: '*'`) em todas as functions.
- **SEC-007 (P2):** sem rate limiting — risco no webhook do WhatsApp e no `pcm-ze-agent` (chamadas pagas ao OpenRouter).

## Spec de Referência

- `SECURITY_DEBT.md` → SEC-005, SEC-003, SEC-007
- [[../Mapeamento/03 - Edge Functions]] e [[../Mapeamento/06 - Seguranca e Infra]]

## Critérios de Aceite

- [ ] CA1 — Validação de schema (Zod) no payload das functions que recebem entrada externa (webhooks e tools).
- [ ] CA2 — CORS restrito à origem do app (domínio Netlify de produção) nas functions chamadas pelo browser.
- [ ] CA3 — Rate limiting básico no `pcm-whatsapp-webhook` e no `pcm-ze-agent` (proteção de custo/abuso).

---

## Implementação

**Status:** `backlog`

**Notas:**
- Centralizar o helper de CORS/validação em `_shared/`.
- Rate limiting pode usar uma tabela de contagem por janela (já há padrão de fila no projeto).

---

## QA

**Gate:** *(pendente)*

- [ ] Payload inválido é rejeitado com erro claro.
- [ ] Origem não autorizada bloqueada por CORS nas functions do frontend.
- [ ] Burst de requisições é limitado.
