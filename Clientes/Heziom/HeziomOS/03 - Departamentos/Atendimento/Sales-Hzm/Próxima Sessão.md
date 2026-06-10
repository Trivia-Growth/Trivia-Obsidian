---
projeto: Sales-Hzm
tipo: handoff
atualizado: 2026-06-09
---

# Próxima Sessão — Handoff

> Onde paramos, com tudo **verde** e sincronizado. Ver [[Sales-Hzm — Índice]] e [[Dashboard Stories]].

## Estado ao fechar (commit `4c…`/`7a6b809` + audit doc)
- **main local == origin/main**, árvore 100% limpa.
- **Gates:** 15 testes verdes · build OK · `npm audit` prod 0 high · CI verde.
- **typecheck:** ✅ **0 erros** (de 320). STORY-005 **CONCLUÍDA** — type-check é **gate bloqueante** no CI. (`no-explicit-any` segue warn = dívida incremental.)
- **E2E completo passou** (backend 27/27 + visual login→dashboard). Banco `apzbaesprzohoalknzxd` **zerado** (0 orgs) — pronto pra criar a organização real da Heziom.
- Dev server fica em `npm run dev -- --port 5190` (registrado como `heziom-sales` no launch global).

## Concluídas ✅
001 (funções públicas), 002 (RLS), 003 (webhooks/OAuth), 006 (CI/CD), 012 (agentes), 014 (single-tenant).

## Retomar por aqui
1. **STORY-005 — grind dos 71 erros de TS restantes.** **Mapa completo e plano de ataque por cluster estão na própria [[STORY-005 — Type-check no build e correção de erros TS|STORY-005]].** Resumo:
   - ⛔ **20 erros do `APISettingsTab` estão BLOQUEADOS** na migration de `api_tokens` → fazer **STORY-004/`task_313ccf2f` primeiro** (derruba ~20 de uma vez).
   - `Landing.tsx` (14, padrão único framer-motion), `ContactDetailSheet.tsx` (14, tipar objeto), depois o resto.
   - ⚠️ **NÃO é deleção segura** — já peguei (pelo próprio typecheck) uma regressão de `sed` global que teria crashado o Settings. Mexer com cuidado, validar build+testes a cada cluster.
   - Quando chegar a 0: tirar `continue-on-error` do `typecheck` no `ci.yml` (vira **bloqueante**) + `no-explicit-any` → error.
2. **STORY-013/010 — continuar extração** se quiser (padrão provado, `baa52a4`): `Settings.tsx`/`AISettingsTab.tsx`. A camada de cálculo do Analytics já está 100% extraída e testada.
3. **Tasks spin-off:**
   - ✅ `task_ef798287` (nps-csat + higiene config.toml) **CONCLUÍDA** (`9929f73`).
   - ✅ `task_313ccf2f` (segredos) **CONCLUÍDA**: api_key, zapi token/client_token, whatsapp access_token bloqueados no front; chamada do Meta movida pra Edge Function `meta-wa-test`; api_tokens hasheados (`api-token-create` + lead-intake por hash, E2E ok); senha temp criptográfica. Commits `bdabd14`, `d101237`, `c014ed5`, `f6c6dce`.
   - ✅ `task_7dfbc955` (8 edge functions inexistentes) **CONCLUÍDA — 8/8**. Infra (E2E completo): `api-token-create`, `inbound-webhook-create`, `inbound-webhook-receive`, `roleplay-voice-save`. IA (`_shared/ai.ts` + guards E2E 13/13; geração real depende de chave de IA na org real): `preparation-quiz`, `roleplay-import`, `preparation-visual` (HTML→storage), `preparation-audio` (OpenAI TTS→storage). **Allowlist do smoke test VAZIA** — toda função referenciada pelo front existe.
   - **E2E mestre (`/tmp/e2e_master.py`): 37/37** + guards das 4 de IA 13/13. Visual: login→dashboard→Analytics (4 abas) sem erros.

> ⚠️ **Pendência das funções de IA:** a geração em si (quiz/cenários/HTML/áudio) só roda com um provedor de IA configurado em `ai_providers_config` (e OpenAI especificamente para o TTS do áudio). Testar de ponta a ponta quando a org real da Heziom tiver a chave.

## Caudas menores (em-progresso)
- 004: resto dos segredos (task acima). 007: #41 SSE, #42 drag-drop optimistic. 008: #34/#39 (erros genéricos→`internalError`). 011: Sentry + unificar toast (sonner).

## ⚠️ Lembrete de segurança
Revogar o access token temporário do Supabase usado nesta jornada (`sbp_…0b0ce`).
