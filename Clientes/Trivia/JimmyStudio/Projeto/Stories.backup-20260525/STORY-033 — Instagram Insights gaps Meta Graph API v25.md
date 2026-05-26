---
id: STORY-033
titulo: "Instagram Insights — gaps da Meta Graph API v25"
fase: 2
modulo: instagram-insights
status: concluido
prioridade: alta
origem: claude
agente_responsavel: claude-code
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-033 — Instagram Insights — gaps da Meta Graph API v25

## Contexto

O projeto pina a Meta Graph API em `v25.0` (`supabase/functions/_shared/meta-config.ts`), mas o sync `instagram-fetch-insights` ainda usava métricas anteriores. Duas pendências bloqueavam o aproveitamento da versão atual:

1. **`impressions` em stories foi deprecado** pela Meta em 2025-04 para mídias criadas após 2024-07-02 — virava 0 silenciosamente em mídias novas.
2. **Métricas novas de Reels e tracking de reposts** (disponibilizadas em dez/2025) não eram coletadas: `reels_skip_rate`, `reposts_count`.

Cliente final via stories com "0 visualizações" e dashboards sem visibilidade de Reels skip rate ou reposts.

## Spec de Referência

- `architecture.md` — ADR-011
- [Meta Graph API v25 changelog](https://developers.facebook.com/docs/graph-api/changelog/version25.0/)
- [Instagram Platform changelog](https://developers.facebook.com/docs/instagram-platform/changelog/)

## Critérios de Aceite

- [x] CA1 — Stories: `metric=impressions` substituído por `metric=views` em `instagram-fetch-insights` e `instagram-full-sync`
- [x] CA2 — Reels: `reels_skip_rate` adicionado à chamada paralela de Reels-specific metrics
- [x] CA3 — Reposts: `reposts` no `metricsToFetch` principal (todos os tipos) e `reposts_count` no `mediaFields` do `/media`
- [x] CA4 — `saved_count`/`shares_count` adicionados ao `mediaFields` como fallback inicial
- [x] CA5 — Migration aditiva criando `reels_skip_rate NUMERIC`, `reposts_count INTEGER` em `instagram_post_insights` e `views INTEGER` em `instagram_story_insights`
- [x] CA6 — UI mostra colunas "Reposts" (todos) e "Skip Rate" (Reels-only) na tabela de posts
- [x] CA7 — Backfill não retroativo aceito (Meta não retorna `reels_skip_rate` confiável fora da janela de attribution)

---

## Implementação

**Status:** `concluido`

**Commit:** `3daa88ba` (origin/main)

**Arquivos alterados:**
- `supabase/migrations/20260504170703_instagram_v25_metrics.sql` (novo)
- `supabase/functions/instagram-fetch-insights/index.ts`
- `supabase/functions/instagram-full-sync/index.ts`
- `src/integrations/supabase/types.ts`
- `src/pages/agencia/InstagramInsights.tsx`
- `PROJECT_REQUIREMENTS.md`
- `architecture.md` (ADR-011)

**Notas de implementação:**
- Helper `getEffectiveMediaType` reutilizado para tratar Reels separados de VIDEO
- Migração aplicada via `supabase db query --linked --file` (não `db push`) por causa da dessincronia Lovable.dev: 200+ migrations locais com timestamps que não batem com o remote
- Edge Functions deployadas individualmente: `instagram-fetch-insights` e `instagram-full-sync`

---

## QA

**Gate:** `PASS`

**Checklist:**
- [x] Critérios de aceite validados
- [x] Build sem erros, TypeScript sem erros novos
- [x] Migration aditiva (3 ADD COLUMN IF NOT EXISTS), defaults seguros (0)
- [x] Smoke test em produção: 4.907 posts existentes têm as colunas novas com default 0
- [x] Edge Functions deployadas e respondendo

**Notas:**
- Lint mantém baseline 2216 (sem novos erros)
- `tsc --noEmit` limpo

---

## Notas e Decisões

- **Manter `impressions` no schema** de `instagram_story_insights` por retrocompatibilidade — preenchido com 0 daqui pra frente. Remoção fica para cleanup posterior.
- **Migração futura pendente:** Page Viewer Metric (substituto do `reach` legacy) — Meta deadline jun/2026 (registrado em "próximos passos" do `architecture.md`).
- **v25 adicional não coberta:** `crossposted_views`, `facebook_views` (Reels crossposted no FB), agregados `total_*` cross-placement. Story futura se virar requisito.
