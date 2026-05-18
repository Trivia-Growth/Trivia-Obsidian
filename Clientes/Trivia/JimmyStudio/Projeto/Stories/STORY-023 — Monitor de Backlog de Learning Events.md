---
id: STORY-023
titulo: "Monitor de Backlog de Learning Events"
fase: 3
modulo: jimmy-learning
status: em-revisao
prioridade: média
origem: claude
agente_responsavel: ""
criado: 2026-05-02
atualizado: 2026-05-02
---

# STORY-023 — Monitor de Backlog de Learning Events

## Contexto

A STORY-017 entregou o pipeline de aprendizado (`learning_events` → worker → `brand_preferences`) com cron rodando a cada 5 min. Mas o critério CA12 ("backlog monitorado, alerta se > 100") ficou pendente — não havia ferramenta de alerta acessível na sessão de implementação.

Sem monitoramento, falhas silenciosas do worker (Claude API down, regex falhando, etc.) acumulam eventos não processados sem visibilidade. Hoje precisa-se rodar `SELECT count(*) FROM learning_events WHERE processed = false` manualmente.

Esta mini-story entrega monitoramento básico via edge function + cron horário, sem inventar canais de alerta novos. Logs estruturados ficam no Supabase Functions logs (consultáveis no Dashboard) e endpoint retorna JSON pra futuro componente admin consumir.

## Spec de Referência

- STORY-017 (foundation do aprendizado)
- Padrão de cron + edge function: `cost-logging-audit` + migration `20260429110438_a9676a42-*.sql`

## Critérios de Aceite

- [ ] CA1 — Edge function `learning-backlog-monitor` retorna JSON estruturado com:
  - `total_unprocessed` (count)
  - `oldest_unprocessed_age_minutes` (idade do mais antigo em min)
  - `errors_last_24h` (count de events com `processing_error IS NOT NULL`)
  - `processed_last_24h` (count)
  - `severity` ('ok' | 'warning' | 'critical')
- [ ] CA2 — Thresholds configurados:
  - `severity='ok'` se backlog ≤ 50 e age ≤ 15 min
  - `severity='warning'` se backlog 51-200 OU age 15-60 min OU errors > 5
  - `severity='critical'` se backlog > 200 OU age > 60 min OU errors > 20
- [ ] CA3 — Logs estruturados via `console.warn` (severity=warning) ou `console.error` (severity=critical) com prefixo `[STORY-023][learning-backlog]` — facilita filtro nos Functions logs
- [ ] CA4 — Cron pg_cron horário (`0 * * * *`) invoca o monitor — logs ficam disponíveis pra inspeção
- [ ] CA5 — Edge function aceita GET (consulta) e POST (cron trigger) — auth via `apikey` no header
- [ ] CA6 — Smoke test: invocar manualmente, validar JSON retornado e severity correta

## Arquitetura

### Edge function `learning-backlog-monitor/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const THRESHOLDS = {
  warning: { backlog: 50, age_minutes: 15, errors: 5 },
  critical: { backlog: 200, age_minutes: 60, errors: 20 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const reqId = crypto.randomUUID().slice(0, 8);
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Backlog total
  const { count: totalUnprocessed } = await supabase
    .from("learning_events")
    .select("*", { count: "exact", head: true })
    .eq("processed", false);

  // Idade do mais antigo
  const { data: oldest } = await supabase
    .from("learning_events")
    .select("created_at")
    .eq("processed", false)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  const oldestAgeMin = oldest
    ? Math.floor((Date.now() - new Date(oldest.created_at).getTime()) / 60000)
    : 0;

  // Errors últimas 24h
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: errorsLast24h } = await supabase
    .from("learning_events")
    .select("*", { count: "exact", head: true })
    .not("processing_error", "is", null)
    .gte("created_at", since24h);

  // Processados últimas 24h
  const { count: processedLast24h } = await supabase
    .from("learning_events")
    .select("*", { count: "exact", head: true })
    .eq("processed", true)
    .gte("processed_at", since24h);

  // Severity
  const t = THRESHOLDS;
  const isCritical =
    (totalUnprocessed ?? 0) > t.critical.backlog ||
    oldestAgeMin > t.critical.age_minutes ||
    (errorsLast24h ?? 0) > t.critical.errors;
  const isWarning =
    (totalUnprocessed ?? 0) > t.warning.backlog ||
    oldestAgeMin > t.warning.age_minutes ||
    (errorsLast24h ?? 0) > t.warning.errors;
  const severity = isCritical ? "critical" : isWarning ? "warning" : "ok";

  const result = {
    total_unprocessed: totalUnprocessed ?? 0,
    oldest_unprocessed_age_minutes: oldestAgeMin,
    errors_last_24h: errorsLast24h ?? 0,
    processed_last_24h: processedLast24h ?? 0,
    severity,
    reqId,
    checked_at: new Date().toISOString(),
  };

  // Log com nível apropriado
  if (severity === "critical") {
    console.error(`[STORY-023][learning-backlog][${reqId}] CRITICAL`, result);
  } else if (severity === "warning") {
    console.warn(`[STORY-023][learning-backlog][${reqId}] WARNING`, result);
  } else {
    console.log(`[STORY-023][learning-backlog][${reqId}] OK`, result);
  }

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
});
```

### Migration `<ts>_cron_learning_backlog_monitor.sql`

```sql
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'learning-backlog-monitor-hourly') THEN
    PERFORM cron.unschedule('learning-backlog-monitor-hourly');
  END IF;
END $$;

SELECT cron.schedule(
  'learning-backlog-monitor-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://kjixezlzateraihxltfa.supabase.co/functions/v1/learning-backlog-monitor',
    headers := '{"Content-Type": "application/json", "apikey": "<ANON_KEY_INLINE>", "Authorization": "Bearer <ANON_KEY_INLINE>"}'::jsonb,
    body := jsonb_build_object('triggered_at', now(), 'source', 'pg_cron')
  );
  $$
);
```

### Reuso explícito

- Padrão de cron pg_cron + pg_net da migration `20260429110438_a9676a42-*.sql` (cost-logging-audit)
- `_shared/cors.ts`
- Mesma edge function pattern de `process-learning-events`

## Out of scope

- Canal de alerta externo (email/Slack/Discord) — quando o ferramentário de alerta for definido, abrir story de seguimento que invoca o endpoint
- UI no admin dashboard consumindo o endpoint — quando o painel admin de learning for criado (Fase 2 do plano integrado)
- Auto-recovery (retry de eventos com erro) — story futura

## Riscos

| Risco | Mitigação |
|---|---|
| Logs de OK gerando ruído nos Functions logs | Logs OK em `console.log` (filtrar por `WARNING\|CRITICAL` no Dashboard) |
| Cron falha silenciosamente se anon key expirar | Mesma key já usada por `cost-logging-audit-daily` — gerenciado em conjunto |
| Endpoint acessível por anon: vaza estatísticas | Stats são contadores agregados sem PII; aceitável; opcional adicionar JWT na Fase 2 |

---

## Implementação

**Status:** `em-revisao` (deployed em 2026-05-02 16:01)

**Branch/PR:** sem branch (mudanças diretas)

**Arquivos criados:**
- `supabase/functions/learning-backlog-monitor/index.ts`
- `supabase/migrations/20260502170000_cron_learning_backlog_monitor.sql`

**Deploy:**
- ✅ `supabase functions deploy learning-backlog-monitor`
- ✅ Cron registrado via `supabase db query --linked -f` (mesma estratégia da STORY-017 pra evitar conflito de migration history) — job ID 63

**Smoke test passou (2026-05-02 16:01):**
```
GET /functions/v1/learning-backlog-monitor
→ {
    "total_unprocessed": 0,
    "oldest_unprocessed_age_minutes": 0,
    "errors_last_24h": 0,
    "processed_last_24h": 1,
    "severity": "ok",
    "reqId": "075316c4",
    "checked_at": "2026-05-02T16:01:27.220Z"
  }
```

`processed_last_24h=1` confirma o event de smoke test da STORY-017 está computado.

**Cron registrado e ativo:**
```
jobname: learning-backlog-monitor-hourly
schedule: 0 * * * *
active: true
```

**Critérios de aceite:**
- [x] CA1 — JSON com 5 campos esperados (total_unprocessed, age, errors, processed, severity)
- [x] CA2 — Thresholds aplicados conforme spec (50/200 backlog, 15/60min age, 5/20 errors)
- [x] CA3 — Logs estruturados com prefixo `[STORY-023][learning-backlog]` em níveis warn/error/log
- [x] CA4 — Cron horário registrado e ativo
- [x] CA5 — Endpoint aceita GET (verificado) e POST (cron usa POST)
- [x] CA6 — Smoke test passou

**Notas de implementação:**
- Reusa exatamente o padrão de cron de `cost-logging-audit-daily` e `process-learning-events-5min` — mesma anon key inline
- Sem mudanças no frontend

---

## QA

**Gate:** `PASS` | `CONCERNS` | `FAIL`

**Checklist:**
- [ ] CA1-CA6 validados
- [ ] Build sem erros
- [ ] Edge function deployada
- [ ] Cron registrado e ativo (`SELECT * FROM cron.job WHERE jobname='learning-backlog-monitor-hourly'`)
- [ ] Smoke test: invocação manual retorna JSON correto

---

## Notas e Decisões

- **Cron horário em vez de mais frequente:** worker roda a cada 5 min — backlog acumula devagar; horário é suficiente pra detectar problemas dentro de 1h
- **Sem alerta externo na Fase 1:** evita inventar canal de alerta sem o ferramentário definido. Logs estruturados nos Functions logs do Dashboard são suficientes pra inspeção manual nessa fase
- **Severity como string em vez de boolean:** facilita evolução pra mais níveis (ex: 'recovering') sem migration
