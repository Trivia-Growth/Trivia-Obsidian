---
id: STORY-040
titulo: "Investigar e corrigir dados zerados do LinkedIn no Sumário Executivo"
fase: 2
modulo: monthly-report
status: Draft
prioridade: alta
origem: piloto
agente_responsavel: ""
criado: 2026-05-04
atualizado: 2026-05-04
---

# STORY-040 — Investigar e corrigir dados zerados do LinkedIn no Sumário Executivo

## Contexto

No relatório mensal de Abril/2026 da brand **Work Solution - CLI-003** (e
provavelmente outras brands com LinkedIn conectado), o bloco LinkedIn do
Sumário Executivo está exibindo dados parcialmente zerados:

| KPI | Valor exibido |
|-----|--------------|
| Seguidores | 0 |
| Crescimento no mês | +84 |
| Impressões | 0 |
| Engajamento | 0 |
| Posts publicados | 9 |
| CTR | 0,0 % |

O fato de **Posts = 9** e **Crescimento = +84** estarem populados, mas
**Seguidores, Impressões e Engajamento = 0** indica que o problema é de
**ingestão das métricas dos posts e do snapshot atual de seguidores**, não da
agregação. Possíveis causas:

1. `linkedin_post_insights.impressions_count`, `total_engagement`,
   `clicks_count` não estão sendo populados pelo coletor (provavelmente o cron
   `linkedin-posts-collector` ou similar). Posts existem mas os números vêm
   `null` / `0`.
2. `linkedin_follower_stats.total_followers` está zerado ou não tem registro
   recente para essa brand. O aggregator faz `.limit(1).order('fetched_at', desc)`
   — se não há linha, retorna 0.
3. Crescimento (+84) vem de `linkedin_follower_gains_history` (organic + paid
   gains - losses), que aparentemente está populado. Inconsistência: gains
   diários existem, mas o snapshot agregado não — sugere que o coletor de
   `follower_stats` parou em algum ponto enquanto o de `gains_history`
   continuou.

Após o diagnóstico (STORY-040 fase 1), a fase 2 é o fix da causa raiz no
coletor + opcionalmente um warning na UI quando dados estão visivelmente
inconsistentes (ex: posts > 0 mas impressões = 0).

## Spec de Referência

- Aggregator LinkedIn: `supabase/functions/_shared/monthly-report-aggregator.ts:296-490`
  (função `aggregateLinkedIn`, queries em `linkedin_post_insights`,
  `linkedin_follower_stats`, `linkedin_follower_gains_history`)
- Tipo: `src/features/monthly-report/types/report.ts:96-143`
- UI Sumário: `src/features/monthly-report/components/ExecutiveSummary.tsx:99-131`
- Brand de teste: Work Solution - CLI-003 (org Heziom)

## Critérios de Aceite

- [ ] CA1 — Diagnóstico documentado: rodar SQL na produção para identificar
      qual coletor parou:
  ```sql
  SELECT MAX(fetched_at) FROM linkedin_follower_stats WHERE linkedin_account_id = '...';
  SELECT COUNT(*), SUM(impressions_count), SUM(total_engagement)
    FROM linkedin_post_insights
    WHERE linkedin_account_id = '...'
    AND published_at >= '2026-04-01' AND published_at < '2026-05-01';
  ```
  Resultado: capturar em comentário da story qual tabela está com dados ausentes.
- [ ] CA2 — Identificar e corrigir o coletor responsável (provavelmente Edge
      Function agendada via cron). Garantir que `impressions_count`,
      `total_engagement`, `clicks_count`, `total_followers` voltem a ser
      gravados.
- [ ] CA3 — Backfill: rodar coletor manualmente para a janela de Abril/2026 e
      confirmar que os números aparecem no relatório (Sumário Executivo +
      seção LinkedIn detalhada).
- [ ] CA4 — Adicionar guard no aggregator para detectar o caso "posts > 0 mas
      `totalImpressions = 0 AND totalEngagement = 0`" e logar warning no
      console (ajuda monitoramento futuro).
- [ ] CA5 — UI mostra um aviso visível ("Dados em coleta — atualizando…")
      quando esse caso acontece, em vez de números zerados sem contexto.
- [ ] CA6 — Testar em pelo menos 2 brands com LinkedIn conectado (Work
      Solution - CLI-003 + outra) para confirmar que não é problema isolado.

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** `pendente`

**Branch/PR:**

**Arquivos alterados:**
-

**Notas de implementação:**

---

## QA

> Preenchido pelo `@qa`.

**Gate:** `pendente`

**Checklist:**
- [ ] Critérios de aceite validados
- [ ] Build sem erros, TypeScript strict
- [ ] Aggregator rodado contra brand real, números aparecem
- [ ] Coletor agendado validado (próximo run popula dados)
- [ ] UI testada com cenário "dados em coleta"
- [ ] PDF da brand testada gera com números corretos

**Notas:**

---

## Notas e Decisões

- Esse bug é independente do bug que foi corrigido em commit `4eea3000` (split
  do Sumário por canal). O split deixou o problema mais visível porque agora
  os dois canais aparecem lado-a-lado e é óbvio que um está zerado.
- Hipótese inicial mais provável: `linkedin_post_insights` está sendo
  populado com `published_at` correto mas as métricas (`impressions_count`,
  etc.) só são gravadas em uma segunda passada que está falhando — comum em
  LinkedIn API onde insights só ficam disponíveis 24-48h após o post.
