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
- **typecheck:** 96 erros (informativo, **não bloqueante** — ver STORY-005).
- **E2E completo passou** (backend 27/27 + visual login→dashboard). Banco `apzbaesprzohoalknzxd` **zerado** (0 orgs) — pronto pra criar a organização real da Heziom.
- Dev server fica em `npm run dev -- --port 5190` (registrado como `heziom-sales` no launch global).

## Concluídas ✅
001 (funções públicas), 002 (RLS), 003 (webhooks/OAuth), 006 (CI/CD), 012 (agentes), 014 (single-tenant).

## Retomar por aqui (caminho conhecido e seguro)
1. **STORY-013 + 010 — continuar a extração** (padrão provado: extrair lógica pura → testar → ligar). Próximos blocos:
   - `Analytics.tsx` (ainda ~1224 linhas): `performanceHistory`, `paceData`, cohort → `src/lib/analytics.ts` + testes.
   - Depois `Settings.tsx` (~780) e `AISettingsTab.tsx` (~679).
   - Modelo de referência: o commit `7a6b809` (computeKpiMetrics etc.).
2. **STORY-005 — grind dos 96 erros de TS** (arquivo a arquivo). Quando chegar a 0: tirar `continue-on-error` do `typecheck` no `ci.yml` (vira bloqueante) e promover `no-explicit-any` para error.
3. **Tasks spin-off** (chips): `task_313ccf2f` (segredos Z-API/Meta/api_tokens), `task_7dfbc955` (8 edge functions inexistentes), `task_ef798287` (nps-csat + higiene config.toml).

## Caudas menores (em-progresso)
- 004: resto dos segredos (task acima). 007: #41 SSE, #42 drag-drop optimistic. 008: #34/#39 (erros genéricos→`internalError`). 011: Sentry + unificar toast (sonner).

## ⚠️ Lembrete de segurança
Revogar o access token temporário do Supabase usado nesta jornada (`sbp_…0b0ce`).
