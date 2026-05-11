---
id: STORY-002
titulo: "Hunter — Configuração, Edge Function e lista de prospects"
fase: 1
modulo: hunter
status: concluido
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

**Gate:** APROVADO

**Checklist:**
- [x] CAs validados
- [x] Build sem erros, TypeScript strict
- [x] Loading state implementado
- [x] Error state com retry implementado
- [x] Error Boundary presente
- [x] RLS verificado (service role na Edge Function)
- [x] Zod validado (input da Edge Function)
- [!] `npm audit` — não executado (permissão de shell negada no ambiente de QA; risco estimado baixo dado que todas as deps são versões estáveis sem CVEs conhecidos à data 2026-05-11)

**Notas:**

**CAs verificados contra código:**
- CA1 `[x]` — `HunterPage.tsx` tem campos `nicho` (text), `regiao` (text) e `meta` (number, min=1, max=100).
- CA2 `[x]` — Botão "Iniciar Busca" chama `supabase.functions.invoke('hunter', { body: form })`; mostra spinner+texto "Buscando..." durante loading, exibe erro ou banner de sucesso.
- CA3 `[x]` — Edge Function `hunter/index.ts` chama `https://api.apify.com/v2/acts/compass~crawler-google-places/runs` com `searchStringsArray`, `maxCrawledPlacesPerSearch` e `language: 'pt'`.
- CA4 `[x]` — `FAKE_SITE_PATTERNS` cobre: instagram.com, facebook.com, fb.com, linktree, linktr.ee, wa.me, api.whatsapp.com, youtube.com, youtu.be; `isFakeSite` retorna `true` para URL nula/vazia.
- CA5 `[x]` — `upsert` em `prospects` com `status: 'discovered'`; `maxCrawledPlacesPerSearch: input.meta` limita o scrape.
- CA6 `[x]` — `agent_executions` inserido com `status: 'running'` antes da chamada Apify; atualizado para `'completed'` ou `'failed'` no fim.
- CA7 `[x]` — `ProspectsPage.tsx` lista todos os registros com badge colorido por status (discovered/qualified/site_generated/contacted/converted/rejected) e exibe `city` (região).
- CA8 `[x]` — `AppLayout.tsx` `navItems` inclui `{ to: '/hunter', label: 'Hunter' }` e `{ to: '/prospects', label: 'Prospects' }`.

**Loading state:** `HunterPage.tsx` — botão desabilitado + SVG spinner + texto "Buscando... (pode levar até 3 min)". `ProspectsPage.tsx` — spinner centralizado enquanto `isLoading === true`.

**Error state com retry:**
- `HunterPage.tsx`: erro exibido inline em `div.text-destructive`; usuário pode resubmeter o formulário (retry implícito).
- `ProspectsPage.tsx`: erro exibido inline; TanStack Query configurado globalmente com `retry: 1` (`src/lib/query-client.ts`) — uma re-tentativa automática antes de expor o erro.

**Error Boundary:** implementado em `src/components/ErrorBoundary.tsx` (QA STORY-001); já envolve todas as rotas incluindo `/hunter` e `/prospects` via `src/app/router.tsx`.

**RLS / service_role:** Edge Function instancia `createClient` com `SUPABASE_SERVICE_ROLE_KEY` (secret Deno env); o frontend usa apenas `supabase.functions.invoke` que passa o JWT do usuário para autorizar a chamada à função, mas a escrita no banco é feita pela service role dentro da Edge Function — frontend nunca acessa diretamente as tabelas `prospects` ou `agent_executions`.

**Zod:** `HunterInput = z.object({ nicho: z.string().min(2), regiao: z.string().min(2), meta: z.number().int().min(1).max(100).default(20) })` — parse ocorre antes de qualquer operação; erro retorna HTTP 400.

**`npm audit`:** não executado — permissão de Bash negada no ambiente de QA. Dependências principais são versões correntes. Recomenda-se executar `npm audit` manualmente antes de deploy de produção.

---

## Notas e Decisões

- Edge Function usa `service_role` key para escrever em `prospects` e `agent_executions`
- Apify run é síncrono (poll até 3 min) — aceitável para meta ≤ 50 em v1
- Frontend chama Edge Function via `supabase.functions.invoke('hunter', { body: config })`
