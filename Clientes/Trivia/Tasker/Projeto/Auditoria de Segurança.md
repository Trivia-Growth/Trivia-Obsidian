# Auditoria de Seguranca - Vista Intel Pro (Trivia Tasker)

**Data:** 2026-05-30
**Auditor:** @security (Cipher) - TRIVIAIOX Framework
**Projeto:** Vista Intel Pro (Trivia Tasker)
**Stack:** React 18 + Vite + TypeScript + Supabase + Netlify
**Status:** PRODUCAO

---

## Resumo Executivo

| Severidade | Quantidade |
|---|---|
| CRITICAL | 3 |
| HIGH | 5 |
| MEDIUM | 7 |
| LOW | 4 |
| INFO | 4 |

**Nota geral: 5.5/10** - O sistema possui boa base de RLS multi-tenant, mas apresenta falhas criticas em autenticacao de Edge Functions, policies excessivamente permissivas, e ausencia de FORCE ROW LEVEL SECURITY.

---

## Findings

---

### CRITICAL-01: Edge Functions sem autenticacao (run-automation-trigger, ai-insights, generate-weekly-report, seed-demo-construction-data)

**Severidade:** CRITICAL
**Impacto:** Qualquer pessoa com a URL da funcao pode executa-la, manipulando dados de qualquer organizacao.

**Descricao:**
Multiplas Edge Functions NAO validam o JWT do usuario e operam diretamente com `service_role_key`:

- `run-automation-trigger`: Nao verifica auth. Aceita `organization_id` no body e executa automacoes de qualquer org.
- `ai-insights`: Nao verifica auth. Aceita `organizationId` no body e retorna dados de IA de qualquer org.
- `generate-weekly-report`: Nao verifica auth. Itera TODAS as organizacoes ativas.
- `seed-demo-construction-data`: Nao verifica auth. Hardcoded org ID, mas qualquer um pode invocar.

**Localizacao:**
- `supabase/functions/run-automation-trigger/index.ts:55-67`
- `supabase/functions/ai-insights/index.ts:18-33`
- `supabase/functions/generate-weekly-report/index.ts:29-38`
- `supabase/functions/seed-demo-construction-data/index.ts:42-49`

**Recomendacao:**
1. Implementar validacao JWT em TODAS as funcoes invocaveis pelo frontend
2. Para funcoes de cron (generate-weekly-report, check-task-deadlines), usar `x-cron-secret` como ja feito em `check-task-deadlines`
3. Para `run-automation-trigger`, validar que o usuario pertence a organizacao informada

---

### CRITICAL-02: Ausencia total de FORCE ROW LEVEL SECURITY

**Severidade:** CRITICAL
**Impacto:** Qualquer funcao usando `service_role_key` que tenha bug ou seja comprometida pode bypassar RLS completamente. Sem FORCE, o owner da tabela (service_role) ignora policies.

**Descricao:**
Nenhuma tabela do sistema utiliza `ALTER TABLE ... FORCE ROW LEVEL SECURITY`. Isso significa que conexoes usando a `service_role_key` automaticamente ignoram todas as policies RLS. Se uma Edge Function for comprometida ou tiver um bug de IDOR (Insecure Direct Object Reference), ela pode acessar dados de qualquer organizacao.

**Localizacao:** Todas as 76+ tabelas em `supabase/migrations/`

**Recomendacao:**
1. Adicionar `ALTER TABLE <tabela> FORCE ROW LEVEL SECURITY` em tabelas sensiveis (organizations, profiles, tasks, projects, time_entries, user_rates, proposals)
2. Criar policies explicitamente para `service_role` onde necessario (como ja feito em `organization_ai_summaries`)
3. Considerar criar um role separado para Edge Functions que nao seja service_role

---

### CRITICAL-03: Senha hardcoded em seed-demo-organization

**Severidade:** CRITICAL
**Impacto:** Senha previsivel para todos os usuarios demo. Se esta funcao for executada em producao (nao ha guard), cria usuarios com senha conhecida publicamente.

**Descricao:**
A funcao `seed-demo-organization` contem uma senha hardcoded:
```typescript
const DEMO_PASSWORD = "Demo@2026";
```
E um org ID hardcoded em `seed-demo-construction-data`:
```typescript
const DEMO_ORG_ID = "ba080390-94c6-4813-955c-34e969488a97";
```

Combinado com a falta de autenticacao (CRITICAL-01), qualquer atacante pode criar usuarios com senha conhecida.

**Localizacao:**
- `supabase/functions/seed-demo-organization/index.ts:12`
- `supabase/functions/seed-demo-construction-data/index.ts:9`

**Recomendacao:**
1. Remover funcoes de seed de producao ou protege-las com auth de superadmin
2. Se mantidas, gerar senhas aleatorias (como ja feito em `reset-pedreira-passwords`)
3. Bloquear invocacao dessas funcoes via Supabase Dashboard (desabilitar para anon)

---

### HIGH-01: Policies com WITH CHECK (true) - Insercao irrestrita

**Severidade:** HIGH
**Impacto:** Qualquer usuario autenticado (ou anonimo em alguns casos) pode inserir dados em tabelas criticas.

**Descricao:**
Multiplas tabelas possuem policies de INSERT com `WITH CHECK (true)`, permitindo insercao sem restricao:

| Tabela | Risco |
|---|---|
| `notifications` | Qualquer autenticado pode inserir notificacoes falsas |
| `audit_logs` | Qualquer autenticado pode inserir logs falsos |
| `ai_predictions` | Qualquer autenticado pode inserir predicoes falsas |
| `automation_logs` | Qualquer autenticado pode inserir logs falsos |
| `project_reports` | Qualquer autenticado pode inserir relatorios falsos |
| `proposal_interactions` | Qualquer autenticado pode inserir interacoes |
| `proposal_legal_acceptances` | ANON pode inserir aceites legais falsos |
| `proposal_meeting_requests` | PUBLIC pode inserir solicitacoes |

**Localizacao:**
- `supabase/migrations/20251110150047_...sql:86` (notifications)
- `supabase/migrations/20251110023339_...sql:25` (audit_logs)
- `supabase/migrations/20251123190357_...sql:44` (ai_predictions)
- `supabase/migrations/20251211121350_...sql:98` (automation_logs)
- `supabase/migrations/20251123190654_...sql:34` (project_reports)
- `supabase/migrations/20251126115240_...sql:8` (proposal_legal_acceptances)
- `supabase/migrations/20251112131614_...sql:37` (proposal_meeting_requests)

**Recomendacao:**
1. Para tabelas criadas por Edge Functions (notifications, audit_logs, automation_logs, project_reports, ai_predictions): usar policy `TO service_role` em vez de `WITH CHECK (true)`
2. Para `proposal_legal_acceptances` e `proposal_meeting_requests`: aceitavel para fluxo publico, mas adicionar rate limiting na Edge Function
3. Implementar validacao de `organization_id` no INSERT para evitar cross-tenant injection

---

### HIGH-02: support_rate_limit com policy USING (true) para ALL

**Severidade:** HIGH
**Impacto:** Qualquer usuario autenticado pode manipular (update/delete) registros de rate limit de QUALQUER usuario, efetivamente bypassando a protecao de rate limiting do suporte.

**Descricao:**
A tabela `support_rate_limit` possui a policy:
```sql
CREATE POLICY "System can manage rate limits"
ON public.support_rate_limit FOR ALL
USING (true);
```
Isso permite que qualquer usuario autenticado DELETE ou UPDATE qualquer registro de rate limit, zerando a protecao.

**Localizacao:** `supabase/migrations/20251213194806_...sql:73-75`

**Recomendacao:**
Alterar para `TO service_role` ou restringir a `USING (user_id = auth.uid())` para operacoes do usuario.

---

### HIGH-03: proposal_legal_acceptances acessivel por anon/authenticated sem restricao

**Severidade:** HIGH
**Impacto:** Qualquer usuario anonimo pode visualizar TODOS os aceites legais (contendo nomes, emails, IPs, timestamps) e inserir aceites falsos.

**Descricao:**
As policies permitem leitura e escrita publica total:
```sql
CREATE POLICY "Public can view their acceptances"
ON proposal_legal_acceptances FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Public can insert acceptances"
ON proposal_legal_acceptances FOR INSERT TO anon, authenticated
WITH CHECK (true);
```

**Localizacao:**
- `supabase/migrations/20251126120138_...sql:4-8`
- `supabase/migrations/20251126115240_...sql:3-8`

**Recomendacao:**
1. SELECT: Restringir para `USING (accepted_by_email = auth.email())` ou via `proposal_id` vinculado
2. INSERT: Adicionar validacao que o `proposal_id` informado existe e esta em status valido
3. Considerar usar um token temporario no link de proposta para validar acesso

---

### HIGH-04: CORS wildcard em TODAS as Edge Functions

**Severidade:** HIGH
**Impacto:** Qualquer dominio pode fazer requests as Edge Functions, facilitando ataques CSRF e exposicao de APIs.

**Descricao:**
TODAS as 25 Edge Functions utilizam:
```typescript
'Access-Control-Allow-Origin': '*'
```

Isso permite que qualquer site malicioso faca requests as funcoes, especialmente critico quando combinado com funcoes sem autenticacao (CRITICAL-01).

**Localizacao:** Todos os `index.ts` em `supabase/functions/*/`

**Recomendacao:**
1. Restringir para o dominio de producao: `'Access-Control-Allow-Origin': 'https://seu-dominio.netlify.app'`
2. Para funcoes publicas (proposal/checkout), manter wildcard mas com validacoes extras
3. Para funcoes de cron/webhook (stripe-webhook, check-task-deadlines), nao precisam de CORS

---

### HIGH-05: Retorno de tempPassword no response da create-organization-with-admin

**Severidade:** HIGH
**Impacto:** Senha temporaria trafega em plaintext na response HTTP e pode ser interceptada ou logada.

**Descricao:**
A funcao retorna a senha temporaria gerada no corpo da resposta:
```typescript
return new Response(JSON.stringify({
  success: true,
  ...
  tempPassword: mode === 'new' ? tempPassword : undefined,
}), ...);
```

Isso significa que a senha fica visivel no DevTools do browser, pode ser logada por proxies, e persiste no historico de requests.

**Localizacao:** `supabase/functions/create-organization-with-admin/index.ts:325`

**Recomendacao:**
1. NAO retornar a senha na response
2. Enviar apenas por email (ja implementado com `autoSendCredentials`)
3. Se precisar mostrar no UI, usar um fluxo de magic link em vez de senha temporaria

---

### MEDIUM-01: Profiles publicamente visiveis (SELECT USING true)

**Severidade:** MEDIUM
**Impacto:** Qualquer usuario autenticado pode listar TODOS os perfis do sistema (email, nome, avatar) independente da organizacao.

**Descricao:**
```sql
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
```

Em um sistema multi-tenant, isso expoe dados de usuarios de outras organizacoes.

**Localizacao:** `supabase/migrations/20251109235700_...sql:116`

**Recomendacao:**
Restringir para membros da mesma organizacao:
```sql
USING (
  EXISTS (
    SELECT 1 FROM organization_users ou1
    JOIN organization_users ou2 ON ou1.organization_id = ou2.organization_id
    WHERE ou1.user_id = id AND ou2.user_id = auth.uid()
  )
  OR is_superadmin(auth.uid())
)
```

---

### MEDIUM-02: Validacao de senha fraca (min 6 chars)

**Severidade:** MEDIUM
**Impacto:** Senhas fracas facilmente quebraveis por brute force.

**Descricao:**
A validacao minima de senha e de apenas 6 caracteres:
```typescript
if (newPassword.length < 6) {
  throw new Error('A senha deve ter no minimo 6 caracteres');
}
```

Nao ha requisitos de complexidade (maiusculas, numeros, caracteres especiais).

**Localizacao:**
- `supabase/functions/reset-user-password/index.ts:20`
- `src/pages/ChangePassword.tsx:37`

**Recomendacao:**
1. Aumentar para minimo 8 caracteres
2. Adicionar requisitos de complexidade (maiuscula + numero + especial)
3. Implementar verificacao contra senhas comuns (have-i-been-pwned API)

---

### MEDIUM-03: Org ID hardcoded em reset-pedreira-passwords

**Severidade:** MEDIUM
**Impacto:** Funcao de reset em massa vinculada a um org ID especifico. Se o ID vazar, qualquer atacante sabe qual org tem usuarios com senhas resetadas recentemente.

**Descricao:**
```typescript
const PEDREIRA_ONIX_ORG_ID = '9d052e92-4d12-40eb-8674-a1c2443cd46f';
```

**Localizacao:** `supabase/functions/reset-pedreira-passwords/index.ts:8`

**Recomendacao:**
1. Mover para variavel de ambiente
2. Tornar generico (aceitar org_id como parametro com validacao de superadmin)
3. Remover funcao se foi one-time-use

---

### MEDIUM-04: SQL Injection potencial via ilike no clawbot-api

**Severidade:** MEDIUM
**Impacto:** Input do usuario e interpolado diretamente em filtro ilike.

**Descricao:**
No `clawbot-api`, o parametro `query` e usado diretamente em:
```typescript
req = req.ilike("name", `%${query}%`);
```

O Supabase client SDK parametriza queries, entao o risco real de SQL injection e baixo. Porem, patterns com `%` e `_` podem ser usados para brute-force de nomes.

**Localizacao:** `supabase/functions/clawbot-api/index.ts:86`

**Recomendacao:**
1. Sanitizar caracteres especiais de LIKE (`%`, `_`, `\`)
2. Limitar tamanho do `query` (max 100 chars)
3. Implementar rate limiting para buscas

---

### MEDIUM-05: Ausencia de rate limiting em funcoes sensiveis

**Severidade:** MEDIUM
**Impacto:** Brute force em login, enumeracao de dados, abuso de AI.

**Descricao:**
Apenas `support-chat` possui rate limiting implementado. As demais funcoes nao tem protecao:
- `desktop-agent-data` (login endpoint): sem rate limit
- `create-checkout-session`: sem rate limit
- `ai-insights`: sem rate limit (custo de API IA)
- `create-team-member`: sem rate limit

**Localizacao:** Todas as funcoes sem rate limiting

**Recomendacao:**
1. Implementar rate limiting via Redis/KV ou tabela Supabase (como feito em support-chat)
2. Para o login em `desktop-agent-data`, usar Supabase GoTrue rate limiting nativo
3. Considerar Cloudflare Rate Limiting no Netlify ou Supabase Edge

---

### MEDIUM-06: Falta de timeout/expiracoes de sessao

**Severidade:** MEDIUM
**Impacto:** Sessoes podem permanecer ativas indefinidamente.

**Descricao:**
O cliente Supabase esta configurado com:
```typescript
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

Nao ha inactivity timeout. O `autoRefreshToken: true` mantem a sessao indefinidamente.

**Localizacao:** `src/integrations/supabase/client.ts:11-15`

**Recomendacao:**
1. Configurar session lifetime no Supabase Dashboard (ex: 7 dias)
2. Implementar inactivity timeout no frontend (ex: 30 min sem interacao)
3. Adicionar deteccao de dispositivos novos com notificacao

---

### MEDIUM-07: create-checkout-session nao valida autenticacao

**Severidade:** MEDIUM
**Impacto:** Qualquer pessoa pode criar sessoes de checkout para qualquer proposta (desde que em status valido).

**Descricao:**
A funcao `create-checkout-session` nao verifica JWT. Usa `service_role_key` diretamente. A unica protecao e que a proposta precisa estar em status `sent` ou `viewed`.

**Localizacao:** `supabase/functions/create-checkout-session/index.ts:15-31`

**Recomendacao:**
Aceitavel para fluxo publico de pagamento (link de proposta enviado ao cliente), mas:
1. Adicionar token unico no link de proposta para validar que quem acessa e o destinatario
2. Implementar rate limiting (max 3 tentativas por proposta/hora)
3. Logar IP e user-agent de quem cria a sessao

---

### LOW-01: Dependencias desatualizadas

**Severidade:** LOW
**Impacto:** Vulnerabilidades conhecidas em versoes antigas.

**Descricao:**
- `deno.land/std@0.168.0` (em varias Edge Functions) - versao muito antiga, atual e 0.220+
- `deno.land/std@0.190.0` (stripe-webhook) - inconsistencia de versoes
- `stripe@14.21.0` (create-checkout-session) vs `stripe@18.5.0` (stripe-webhook) - inconsistencia

**Localizacao:** Varios `index.ts` em `supabase/functions/`

**Recomendacao:**
1. Padronizar versao do `deno.land/std` (usar 0.220+)
2. Padronizar versao do Stripe SDK
3. Usar import maps para centralizar versoes

---

### LOW-02: Console.log com dados sensiveis

**Severidade:** LOW
**Impacto:** Dados sensiveis podem aparecer em logs de producao (Supabase Edge Functions logs).

**Descricao:**
Varias funcoes logam dados potencialmente sensiveis:
- `create-organization-with-admin`: loga email do admin
- `stripe-webhook`: loga IDs de sessao e metadata
- `run-automation-trigger`: loga payloads completos

**Localizacao:**
- `supabase/functions/create-organization-with-admin/index.ts:91`
- `supabase/functions/stripe-webhook/index.ts:96-97`
- `supabase/functions/run-automation-trigger/index.ts:70-76`

**Recomendacao:**
1. Remover ou reduzir logs em producao
2. Nunca logar emails, passwords, ou tokens completos
3. Usar nivel de log configuravel por environment

---

### LOW-03: Falta de validacao de input com schema (Zod)

**Severidade:** LOW
**Impacto:** Inputs malformados podem causar erros inesperados ou comportamento indefinido.

**Descricao:**
Apesar de `zod` estar no `package.json` do frontend, NENHUMA Edge Function usa validacao de schema. Inputs sao parseados diretamente de `req.json()` sem validacao de tipo/formato.

Excecao: `desktop-agent-events` tem boa validacao manual com `validateEvent()`.

**Localizacao:** Todas as Edge Functions exceto `desktop-agent-events`

**Recomendacao:**
1. Adicionar Zod em todas as Edge Functions para validar body
2. Usar `zod` ou `@sinclair/typebox` para Deno
3. Rejeitar requests com campos extras (strip unknown)

---

### LOW-04: XSS mitigado mas com riscos residuais

**Severidade:** LOW
**Impacto:** Risco baixo - DOMPurify e usado corretamente.

**Descricao:**
O uso de `dangerouslySetInnerHTML` e protegido com `DOMPurify.sanitize()`:
```tsx
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(task.description) }} />
```

O pacote `dompurify@3.3.3` esta atualizado. O risco residual e em conteudo gerado por TipTap editor que pode conter HTML.

**Localizacao:** `src/pages/TaskDetails.tsx:158`

**Recomendacao:**
1. Manter DOMPurify atualizado
2. Configurar allowlist de tags no DOMPurify (nao permitir iframe, script, etc.)
3. Sanitizar tambem no servidor (Edge Function) antes de salvar

---

### INFO-01: Frontend expoe apenas variaveis publicas

**Severidade:** INFO
**Impacto:** Nenhum. Configuracao correta.

**Descricao:**
O frontend usa apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key), que sao publicas por design. Nenhum segredo exposto.

**Localizacao:** `src/integrations/supabase/client.ts:5-6`

---

### INFO-02: DiagnosticLogContext implementa redaction

**Severidade:** INFO
**Impacto:** Positivo. Boa pratica de seguranca.

**Descricao:**
O contexto de diagnosticos faz redaction de campos sensiveis antes de logar:
```typescript
.replace(/"password"\s*:\s*"[^"]*"/gi, '"password": "[REDACTED]"')
.replace(/"apikey"\s*:\s*"[^"]*"/gi, '"apikey": "[REDACTED]"')
```

**Localizacao:** `src/contexts/DiagnosticLogContext.tsx:43-47`

---

### INFO-03: .gitignore bem configurado

**Severidade:** INFO
**Impacto:** Positivo. Segredos nao sao commitados.

**Descricao:**
O `.gitignore` cobre adequadamente: `.env`, `.env.local`, `.env.*.local`, `*.key`, `*.pem`.

---

### INFO-04: Stripe Webhook valida signature corretamente

**Severidade:** INFO
**Impacto:** Positivo. Protege contra webhooks forjados.

**Descricao:**
O `stripe-webhook` valida a assinatura corretamente:
```typescript
const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
```
E inclui verificacao de idempotencia para evitar reprocessamento.

**Localizacao:** `supabase/functions/stripe-webhook/index.ts:36-46`

---

## Plano de Acao Priorizado

### Sprint 1 (Urgente - 1 semana)
1. **CRITICAL-01**: Adicionar auth em `run-automation-trigger` e `ai-insights`
2. **CRITICAL-03**: Proteger/remover funcoes de seed de producao
3. **HIGH-01**: Restringir policies de INSERT com `WITH CHECK (true)` para `TO service_role`
4. **HIGH-05**: Remover tempPassword do response body

### Sprint 2 (Alta prioridade - 2 semanas)
5. **HIGH-02**: Corrigir policy de `support_rate_limit`
6. **HIGH-03**: Restringir `proposal_legal_acceptances`
7. **HIGH-04**: Implementar CORS restritivo
8. **MEDIUM-01**: Restringir visibilidade de profiles por org

### Sprint 3 (Media prioridade - 1 mes)
9. **CRITICAL-02**: Implementar FORCE ROW LEVEL SECURITY
10. **MEDIUM-02**: Fortalecer politica de senhas
11. **MEDIUM-05**: Rate limiting em funcoes criticas
12. **MEDIUM-06**: Session timeout
13. **MEDIUM-07**: Token de validacao para checkout

### Backlog
14. **LOW-01**: Atualizar dependencias
15. **LOW-02**: Reduzir logs sensiveis
16. **LOW-03**: Validacao com Zod nas Edge Functions

---

## Pontos Positivos

- RLS habilitado em TODAS as tabelas (76+ tabelas)
- Multi-tenant via `organization_id` consistente
- Helper functions `is_superadmin()` e `get_user_org_role()` centralizadas
- DOMPurify para sanitizacao de HTML
- Stripe webhook com validacao de signature + idempotencia
- Audit logs para acoes administrativas
- Desktop agent com auth dual (Bearer + token hash)
- Rate limiting implementado no support-chat
- `.gitignore` cobrindo segredos
- Diagnostic context com redaction de dados sensiveis
