# Monitoramento sem Ferramentas de Observabilidade

Como monitorar o sistema em produção usando apenas as ferramentas nativas (Supabase, Netlify, DevTools) — sem Sentry, Datadog ou similares.

---

## O que monitorar e onde

| O que | Onde verificar | Com que frequência |
|-------|---------------|--------------------|
| Erros de Edge Function | Supabase → Edge Functions → Logs | Ao suspeitar de problema |
| Queries lentas / erros SQL | Supabase → Database → Logs | Ao suspeitar de problema |
| Deploy com erro | Netlify → Deploys | Após cada push |
| Performance do frontend | Chrome DevTools → Lighthouse | Antes de concluir story com UI |
| Autenticação com falha | Supabase → Authentication → Logs | Ao suspeitar de problema |
| Erros no browser do usuário | Console do browser (requer acesso) | Quando usuário reportar problema |

---

## Supabase — Logs de Edge Function

**Como acessar:**
1. Supabase Dashboard → seu projeto
2. **Edge Functions** → clique na função → **Logs**
3. Filtre por nível: `error` ou `warning`

**O que procurar:**
- `ZodError` → input inválido chegando da UI
- `JWT expired` ou `invalid JWT` → usuário com sessão expirada tentando acessar
- `row-level security violation` → usuário tentando acessar dado sem permissão
- `connection timeout` → banco sobrecarregado ou query lenta

**Dica:** o template de Edge Function já loga um `reqId` por request. Use para rastrear uma requisição específica quando o usuário reportar erro:
```
[pagar-titulo][a3f92c1b] POST /pagar-titulo
```

---

## Supabase — Logs de Database

**Como acessar:**
1. Supabase Dashboard → **Database → Logs**
2. Use o filtro de SQL para encontrar queries lentas:
   ```sql
   SELECT query, calls, mean_exec_time
   FROM pg_stat_statements
   ORDER BY mean_exec_time DESC
   LIMIT 10;
   ```

**O que procurar:**
- Queries com `mean_exec_time > 1000ms` (acima de 1 segundo) — candidatas a otimização com índice
- Tabelas sem RLS em produção:
  ```sql
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public' AND rowsecurity = false;
  ```

---

## Netlify — Logs de Deploy

**Como acessar:**
1. Netlify Dashboard → seu site → **Deploys**
2. Clique em qualquer deploy para ver o log completo

**O que procurar:**
- Erros de build TypeScript (`error TS...`) — o build falhou, o site não foi atualizado
- `Module not found` — import incorreto
- Variáveis de ambiente não definidas — o build usa `undefined` em variáveis críticas

**Status dos deploys:**
- `Published` → deploy ok, site atualizado
- `Failed` → código não subiu, versão anterior ainda está no ar
- `Skipped` → Netlify ignorou (ex: commit sem mudanças relevantes)

---

## Chrome DevTools — Performance

Antes de concluir qualquer story com interface nova:

1. Abra o site em produção ou preview
2. F12 → aba **Lighthouse**
3. Clique em **"Analyze page load"** (marque apenas Performance e Accessibility)
4. Verifique as metas:

| Métrica | Meta |
|---------|------|
| LCP | < 2.5s |
| INP | < 200ms |
| CLS | < 0.1 |
| Performance Score | > 70 |

**Problemas comuns e soluções:**

| Problema | Sintoma | Solução |
|----------|---------|---------|
| Bundle grande | LCP alto, score baixo | Verificar se lazy() está nas rotas |
| Re-renders excessivos | INP alto | Revisar se TanStack Query está em uso (sem useEffect+setState) |
| Layout shift | CLS alto | Usar Skeleton com dimensões fixas no loading |
| Imagens sem tamanho | CLS alto | Definir width/height em `<img>` |

---

## Quando um usuário reporta erro

Protocolo de investigação sem ferramentas de observabilidade:

**1. Perguntar ao usuário:**
- Em qual tela aconteceu?
- Qual ação você fez antes do erro aparecer?
- Qual é o texto exato do erro na tela?
- Que horas aconteceu? (para correlacionar com logs)

**2. Reproduzir localmente:**
- Rodar com os mesmos dados e mesmo usuário (ou papel similar)
- Abrir DevTools → aba **Network** → reproduzir a ação → ver qual request retornou erro

**3. Cruzar com logs:**
- Se for erro de Edge Function: buscar o `reqId` nos logs do Supabase no horário informado
- Se for erro de autenticação: verificar Supabase → Authentication → Logs

**4. Se não conseguir reproduzir:**
- Verificar se o Netlify deployou com sucesso depois do horário do erro
- Verificar se houve migration de banco na mesma janela de tempo
- Verificar se o `npm audit` tem alguma vulnerabilidade que pode ter sido explorada

---

## Alertas via Teams Webhook (sem custo extra)

Mesmo sem ferramentas de observabilidade, dá para criar alertas básicos dentro das Edge Functions existentes.

**Alerta de erro crítico:**

```typescript
// Em qualquer Edge Function, no catch do erro inesperado:
async function alertarTeams(mensagem: string, reqId: string) {
  const webhook = Deno.env.get('TEAMS_WEBHOOK_URL');
  if (!webhook) return;

  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'message',
      attachments: [{
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          type: 'AdaptiveCard',
          version: '1.2',
          body: [{
            type: 'TextBlock',
            text: `⚠️ **Erro em produção** [${reqId}]\n\n${mensagem}`,
            wrap: true,
          }],
        },
      }],
    }),
  });
}

// No catch do serve():
} catch (e) {
  await alertarTeams(`Erro inesperado em [nome-da-function]: ${e.message}`, reqId);
  return problemResponse(500, 'Erro interno', reqId);
}
```

Isso envia uma mensagem no canal do Teams sempre que uma Edge Function tiver um erro 500 inesperado — sem nenhuma ferramenta adicional.

---

## SLOs Mínimos (Service Level Objectives)

Toda aplicação em produção deve ter estes targets definidos. Medir semanalmente usando os logs nativos.

| Componente | Métrica | Target | Como medir |
|------------|---------|--------|------------|
| Edge Functions | Uptime (% requests com status 2xx/3xx) | ≥ 99% | Supabase → Edge Functions → Logs → filtrar por período |
| Edge Functions | Latência p95 | < 2s | Supabase → Edge Functions → Logs → ordenar por duração |
| Edge Functions | Error rate (5xx / total) | < 1% | Contar erros nos logs vs total de invocações |
| Database | Query p95 | < 1s | `pg_stat_statements` → `mean_exec_time` |
| Frontend | LCP | < 2.5s | Lighthouse em produção |
| Frontend | Deploy success rate | 100% | Netlify → Deploys → sem "Failed" na semana |
| Auth | Login success rate | ≥ 98% | Supabase → Auth → Logs (falhas / tentativas) |

### Quando um SLO é violado

1. **Abrir story de investigação** no sprint atual (prioridade alta)
2. **Comunicar no canal do time** — não esperar alguém perceber
3. **Definir ação corretiva** antes do próximo deploy (ex: índice, cache, fix de código)
4. Se violação persistir por > 1 semana: escalar para `@architect` para decisão estrutural

---

## Alertas Obrigatórios

Expandir o padrão de Teams webhook para cobrir **todos** os cenários críticos. Cada projeto deve ter ao menos estes alertas configurados:

### 1. Error rate elevado (já existente — expandir)

O template de `alertarTeams` no catch das Edge Functions cobre erros individuais. Adicionar **contagem em janela** para detectar surtos:

```typescript
// _shared/alert-throttle.ts
// Usar KV do Supabase ou variável em memória (reset a cada cold start)
const errorCounts = new Map<string, { count: number; firstSeen: number }>();

export function shouldAlert(functionName: string, windowMs = 60_000, threshold = 5): boolean {
  const now = Date.now();
  const entry = errorCounts.get(functionName);
  
  if (!entry || now - entry.firstSeen > windowMs) {
    errorCounts.set(functionName, { count: 1, firstSeen: now });
    return false;
  }
  
  entry.count++;
  if (entry.count >= threshold) {
    errorCounts.delete(functionName);
    return true; // alertar: X erros em Y segundos
  }
  return false;
}
```

```typescript
// No catch de qualquer Edge Function:
} catch (e) {
  if (shouldAlert('pagar-titulo')) {
    await alertarTeams(`🔴 SURTO: 5+ erros em 60s em [pagar-titulo]: ${e.message}`, reqId);
  }
  return problemResponse(500, 'Erro interno', reqId);
}
```

### 2. Latência degradada

```typescript
// No início e fim de cada Edge Function:
const start = Date.now();
// ... processamento ...
const duration = Date.now() - start;

if (duration > 3000) { // > 3s = degradação
  await alertarTeams(`🟡 LENTIDÃO: [${functionName}] levou ${duration}ms (SLO: <2000ms)`, reqId);
}
```

### 3. Auth failures em massa

Criar uma Edge Function dedicada (ou cron) que verifica auth logs:

```typescript
// supabase/functions/monitor-auth/index.ts (rodar via cron ou scheduled)
// Consultar auth.audit_log_entries das últimas 5 min
const { data, error } = await supabaseAdmin
  .from('auth.audit_log_entries')
  .select('*')
  .eq('event', 'login_failed')
  .gte('created_at', new Date(Date.now() - 5 * 60_000).toISOString());

if (data && data.length > 20) {
  await alertarTeams(`🔴 AUTH: ${data.length} login failures nos últimos 5min — possível ataque de força bruta`, 'monitor-auth');
}
```

### 4. Deploy failure (Netlify webhook)

Configurar no Netlify: **Site settings → Build & deploy → Deploy notifications → Add notification → Outgoing webhook**
- Event: "Deploy failed"
- URL: Teams webhook URL

---

## Integração com @reliability

O agente `@reliability` entra no fluxo em dois momentos:

### Pós-deploy (reativo)
```
@devops deploy → @devops smoke test → [PASS] → @reliability verifica SLOs por 15min
                                      → [FAIL] → @devops rollback (ver Deploy Supabase)
```

### Monitoramento contínuo (proativo)
- **Semanal:** `@reliability` revisa logs e SLOs, reporta violações
- **Ao ser acionado:** investiga degradação, propõe fix ou escalação
- **Pós-incidente:** documenta o que aconteceu e propõe ação preventiva

### Comandos do @reliability

| Comando | O que faz |
|---------|-----------|
| `*health-check` | Verifica SLOs atuais e reporta status |
| `*incident [descrição]` | Inicia investigação de incidente |
| `*post-mortem [data]` | Gera documento de post-mortem |
| `*slo-report` | Relatório semanal de cumprimento de SLOs |

---

## Escalation Matrix

| Severidade | Critério | Quem é notificado | Tempo de resposta | Ação esperada |
|------------|----------|-------------------|-------------------|---------------|
| **SEV1 — Crítico** | Sistema fora do ar / dados corrompidos / breach de segurança | Lucas + @reliability + @devops | ≤ 15 min | Rollback imediato, investigação, comunicação ao time |
| **SEV2 — Alto** | Feature core quebrada / error rate > 5% / SLO violado | @reliability + @devops | ≤ 1 hora | Fix ou rollback, story de investigação |
| **SEV3 — Médio** | Feature secundária com erro / performance degradada | @reliability | ≤ 4 horas | Story no próximo sprint, monitorar |
| **SEV4 — Baixo** | Erro cosmético / warning nos logs / dep desatualizada | @qa | Próximo sprint | Adicionar ao backlog |

### Classificação rápida

```
Usuários não conseguem usar o sistema? → SEV1
Funcionalidade principal quebrada para alguns? → SEV2
Algo está lento ou com erro intermitente? → SEV3
Ninguém reclamou mas apareceu nos logs? → SEV4
```

---

## Checklist de saúde (rodar mensalmente ou ao suspeitar de problema)

- [ ] Supabase → Edge Functions → Logs: algum erro recorrente?
- [ ] Supabase → Database: tabela sem RLS?
- [ ] Supabase → Database: query lenta (> 1s) sem justificativa?
- [ ] Netlify → Deploys: algum deploy com status `Failed` recente?
- [ ] `npm audit` no repositório local: vulnerability nova?
- [ ] Supabase → Backups: backup automático rodando (plano Pro)?
- [ ] SLOs da semana: algum target violado?
- [ ] Alertas disparados: algum padrão recorrente que precisa de fix estrutural?
- [ ] Auth logs: picos de falha incomuns?
