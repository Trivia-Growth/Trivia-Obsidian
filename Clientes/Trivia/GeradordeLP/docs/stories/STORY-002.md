---
id: STORY-002
titulo: "Hunter — Configuração, Edge Function e lista de prospects"
fase: 1
modulo: hunter
status: em-review
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-11
atualizado: 2026-05-11
---

# STORY-002 — Hunter — Configuração, Edge Function e lista de prospects

## Contexto

Primeiro agente do pipeline. O piloto configura nicho + região + meta/dia e dispara o Hunter manualmente (ou via cron). O Hunter usa Apify Google Maps Scraper para descobrir SMBs sem site real, filtra negócios que só têm Instagram/Facebook/Linktree como "site", e insere os prospects no banco com status `discovered`. Custo de execução registrado em `agent_executions`.

## Spec de Referência

- `PROJECT_REQUIREMENTS.md` — Épico 1 (Hunter)
- `architecture.md` — Edge Function `hunter`, tabela `prospects`, `agent_executions`
- `supabase/migrations/20260506000000_init.sql` — schema completo

## Critérios de Aceite

- [x] CA1 — Página `/hunter` com formulário: nicho (texto), região (texto), meta/dia (número 1–100)
- [x] CA2 — Botão "Disparar Hunter" chama Edge Function via POST e mostra feedback (loading → sucesso/erro)
- [x] CA3 — Edge Function `hunter` chama Apify Google Maps Scraper com os parâmetros recebidos
- [x] CA4 — Filtra negócios cujo "site" é Instagram, Facebook, Linktree, wa.me, YouTube ou ausente
- [x] CA5 — Insere prospects no banco com status `discovered` (respeita meta como limite)
- [x] CA6 — Registra execução em `agent_executions` (running → completed/failed)
- [x] CA7 — Página `/prospects` lista todos os prospects com status badge colorido e região
- [x] CA8 — Nav lateral inclui "Hunter" e "Prospects"

---

## Implementação

**Status:** `em-review`

**Branch/PR:** main

**Arquivos alterados:**
- `supabase/functions/hunter/index.ts` — Zod validation + Apify call + isFakeSite filter + DB insert + agent_executions tracking
- `src/features/hunter/HunterPage.tsx` — formulário nicho/região/meta + chamada Edge Function + feedback loading/erro/sucesso
- `src/features/hunter/ProspectsPage.tsx` — tabela completa com badges de status + TanStack Query
- `src/app/router.tsx` — rota `/hunter` adicionada (lazy import)
- `src/components/layout/AppLayout.tsx` — Hunter adicionado ao nav

**Notas de implementação:**
- Polling síncrono da Apify run (36× 5s = 3 min max) — suficiente para meta ≤ 100 em v1
- `upsert` com `onConflict: 'google_place_id'` evita duplicatas em buscas repetidas
- CORS OPTIONS handler presente para chamadas do frontend
- `FAKE_SITE_PATTERNS` inclui: instagram, facebook, fb.com, linktree, linktr.ee, wa.me, api.whatsapp.com, youtube, youtu.be

---

## QA

**Gate:**

**Checklist:**
- [ ] CAs validados
- [ ] Build sem erros, TypeScript strict
- [ ] Loading state implementado
- [ ] Error state com retry implementado
- [ ] Error Boundary presente
- [ ] RLS verificado (service role na Edge Function)
- [ ] Zod validado (input da Edge Function)
- [ ] `npm audit` sem Critical/High

**Notas:**

---

## Notas e Decisões

- Edge Function usa `service_role` key para escrever em `prospects` e `agent_executions`
- Apify run é síncrono (poll até 3 min) — aceitável para meta ≤ 50 em v1
- Frontend chama Edge Function via `supabase.functions.invoke('hunter', { body: config })`
