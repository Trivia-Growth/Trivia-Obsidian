---
id: STORY-008
titulo: "Endurecer Edge Functions restantes"
fase: 2
modulo: "edge-functions"
status: em-progresso
prioridade: média
agente_responsavel: "@dev"
criado: 2026-06-09
atualizado: 2026-06-09
---

# STORY-008 — Endurecer Edge Functions restantes

## Contexto

> Depois de fechar as funções abertas (STORY-001) e os webhooks (STORY-003), sobram endurecimentos transversais nas demais funções: injeção de filtro, vazamento de erro interno, rate limit e tratamento de erro inconsistente.

Achados **#33, #34, #39, #38** e **#31, #32** (estes dois rebaixados por single-tenant, mas mantidos como defesa em profundidade). SEC-008, SEC-009, SEC-011.

## Spec de Referência

- [[Auditoria TRIVIAIOX — Sales-Hzm]] — achados #31, #32, #33, #34, #38, #39
- [[Edge Functions Seguras]]
- [[SECURITY_DEBT]] — SEC-008, SEC-009, SEC-011

## Critérios de Aceite

- [ ] CA1 — Filtros PostgREST `.or()` montados com input de usuário (telefone) sanitizados para só dígitos, ou trocados por `.eq()` separados (`zapi-webhook:83`, `meta-wa-webhook:200`).
- [ ] CA2 — Mensagens de erro ao cliente passam pelo `internalError()` de `_shared/errors.ts` — sem refletir `err.message` cru (9 funções: `nps-send`, `zapi-send`, `zapi-webhook`, `knowledge-import`, `roleplay-chat`, `roleplay-evaluate`, `analyze-meeting`, `initialize-workspace`, `nps-csat-webhook`).
- [ ] CA3 — Tratamento de erro padronizado (`err instanceof Error ? ...`) nas funções que hoje usam `err.message` cru em `catch (unknown)`.
- [ ] CA4 — Rate limiting aplicado por workspace nas funções de IA/custo (`knowledge-import`, `predictive-ai`, `analyze-meeting`); reavaliar o **fail-open** de `_shared/rate-limit.ts` para endpoints sensíveis a custo.
- [ ] CA5 — (Defesa em profundidade) `meta-wa-send` valida o chamador via `auth.getUser()` antes de usar `service_role`; remover o fallback legado de superadmin via `workspace_members.role` em `manage-superadmins`.

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** `em-progresso` (parcial)

**Branch/PR:** commit `f9d46d9`

**Arquivos alterados:**
- `zapi-webhook`, `meta-wa-webhook` (#33), `meta-wa-send` (#32)

**Notas de implementação:**
- ✅ **CA1 (#33):** filtro `.or()` sanitizado (só dígitos/`+`) em zapi-webhook e meta-wa-webhook.
- ✅ **CA5 (#32):** `meta-wa-send` agora exige caller com service-role (whatsapp-router) — testado, anon → 401.
- ⏳ **Restante:** CA2 (#34 erros genéricos via `internalError`, + #45 Content-Type admin, #46 `response.ok`), CA3 (#39 padronizar catch), CA4 (#38 rate limit em predictive-ai/analyze-meeting/knowledge-import), CA5 (#31 remover fallback legado de superadmin).

---

## QA

> Preenchido pelo `@qa`.

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Sem injeção de filtro `.or()`
- [ ] Erros internos não vazam ao cliente
- [ ] Rate limit nas funções de custo
- [ ] Build sem erros, TypeScript strict

**Notas:**

---

## Notas e Decisões
