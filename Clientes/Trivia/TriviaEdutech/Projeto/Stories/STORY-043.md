# STORY-043 — Importação automática em lote do Vimeo (10 pastas/hora)

**Módulo:** Vídeo / Admin / Edge Functions / Cron  
**Sprint:** Produto  
**Prioridade:** P1  
**Status:** concluido  
> **CONCLUÍDA 18/06/2026** (commit `d1516e8`).
> - CA-01/02/03 ✅ função `batch-import-vimeo`: lista pastas, detecta pendentes (case-insensitive), importa N em batch, retorna resumo completo.
> - CA-04 ✅ auth duplo: BATCH_IMPORT_SECRET (cron) ou JWT superadmin (manual).
> - CA-05 ✅ pg_cron + pg_net habilitados; job `batch-import-vimeo-etsd` rodando a cada hora (0 * * * *).
> - CA-06 ✅ Primeiro lote de 10 cursos importado imediatamente via curl (75 restantes).
> - CA-07 ✅ config.toml atualizado; função deployada; smoke 401 OK.


**Estimativa:** meio dia  
**Origem:** Pedido JG (18/06/2026)

## Contexto

A conta Vimeo da ETSD tem 85 pastas/570 vídeos. A STORY-042 criou o importador manual (1 pasta por vez via UI). O admin quer importar em lote automaticamente: 10 pastas por hora, criando cursos em rascunho para revisão. Após validar o primeiro lote, decide se continua com os demais.

## Acceptance Criteria

- [ ] CA-01: Nova Edge Function `batch-import-vimeo` lista as pastas Vimeo do tenant, descobre quais ainda não têm curso correspondente no sistema, e importa as próximas N (padrão 10) em batch.
- [ ] CA-02: A função é idempotente: ignora pastas cujo nome já tem curso no tenant (comparação case-insensitive). Pastas sem vídeos são puladas (skipped).
- [ ] CA-03: Resposta inclui `total_folders`, `pending_before`, `remaining_after`, `imported`, `errors`, `skipped`, lista de resultados por pasta.
- [ ] CA-04: Auth duplo: `Authorization: Bearer <BATCH_IMPORT_SECRET>` (para chamadas de cron) OU JWT de superadmin (para trigger manual pela UI).
- [ ] CA-05: pg_cron rodando a cada hora (`0 * * * *`) chamando a função via pg_net para o tenant ETSD com `batch_size=10`. Para quando `remaining_after = 0` (sem erro, só não importa mais).
- [ ] CA-06: Primeiro lote importado imediatamente (não esperar 1 hora).
- [ ] CA-07: `config.toml` atualizado (`verify_jwt = false`); função deployada; smoke 401.

## Escopo

**IN:**
- Edge Function `batch-import-vimeo/index.ts`
- `supabase/config.toml` com entry da nova função
- `BATCH_IMPORT_SECRET` como Supabase secret
- pg_cron schedule via Management API SQL
- Primeiro lote rodado imediatamente via CLI

**OUT:**
- UI de progresso em tempo real (logs ficam no Supabase Edge Function logs)
- Import de outros tenants além de ETSD (parametrizável via body, mas cron é fixo em ETSD)
- Parar/pausar o cron pela UI (usar Supabase dashboard ou script manual)

## Arquivos Afetados

- [ ] `supabase/functions/batch-import-vimeo/index.ts` (novo)
- [ ] `supabase/config.toml` (adicionar entry)

## Passos

1. Criar função `batch-import-vimeo` com lógica de import (reutiliza padrão de `import-vimeo-folder`)
2. Atualizar `config.toml`
3. Setar `BATCH_IMPORT_SECRET` via CLI
4. Deploy da função
5. Setar DB param `app.batch_import_secret` via Management API
6. Criar cron via Management API SQL
7. Rodar primeiro lote manualmente via curl

## Rastreabilidade

- Pedido JG 18/06/2026; usa infraestrutura da STORY-042 (import-vimeo-folder + video-proxy)
- ETSD tenant id: `e7c8d42e-ad16-4a9a-8eac-b57cc6504815`
