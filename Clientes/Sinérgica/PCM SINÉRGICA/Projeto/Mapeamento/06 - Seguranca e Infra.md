# 06 - Segurança e Infra — PCM Sinérgica

> Auditoria de SEGURANÇA e INFRA verificada **na produção** (Supabase ref `sfprfvltbtysvtsqutla`, Evolution Cloudfy, Netlify).
> Data: **2026-06-18**
> Agente: @qa/@security (Triviaiox) — dimensão `seguranca`.
> Método: SQL direto via Management API (`pg_class`, `pg_policies`, `storage.buckets`, `cron.job`, `pg_proc`), Management API de Functions (`verify_jwt`), Supabase CLI (`functions list`, `secrets list`), Evolution API (estado/webhook), leitura do código em `pcm-sinergica-v2`.

Tudo abaixo foi confirmado contra produção, salvo o que estiver marcado **(a confirmar)**.

---

## 1. Resumo executivo

| Área | Situação | Severidade do pior item |
|------|----------|-------------------------|
| RLS por tabela | 63/63 com RLS habilitada, **0 com FORCE** | Alta (SEC-002) |
| Policies / isolamento | Modelo por **papel** (admin/escritorio/tecnico), **não por `client_id`**; várias policies permissivas `qual=true` | Média |
| Storage buckets | 2 de 5 **públicos** (`inspecao-fotos`, `pcm-relatorios`) | Alta (SEC-010) |
| IDOR `pcm-ze-agent` | **CONFIRMADO** — `atualizar_chamado` faz UPDATE só por `numero_os` | **Crítica** (SEC-001) |
| CORS / auth / Zod | CORS `*` em todas as functions; `auth.getUser()` ausente; Zod ausente | Alta |
| Functions admin perigosas | `run-migration`/`setup-storage-policies` **existem no repo mas NÃO estão deployadas** em produção | Média |
| Segredos no frontend | **OK** — só `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` | Info |
| Segredos em texto (cron/webhook) | service_role JWT em texto no `cron.job`; anon JWT no webhook Evolution | Alta |
| Infra Netlify | Headers/CSP presentes; CSP com `unsafe-inline`/`unsafe-eval` | Baixa |

Já existe um `SECURITY_DEBT.md` no repo (SEC-001 a SEC-011). Esta auditoria **valida** esses itens contra produção e acrescenta achados novos (laudos-agent sem JWT; webhook protegido só por anon key; segredos em texto no cron).

---

## 2. SEGURANÇA

### 2.1 RLS / FORCE por tabela

Confirmado via `SELECT relrowsecurity, relforcerowsecurity FROM pg_class` (schema `public`, relkind `r`):

| Métrica | Valor |
|---------|-------|
| Tabelas em `public` | **63** |
| Com `RLS habilitada` (`relrowsecurity=true`) | **63** |
| Com `RLS OFF` | **0** |
| Com `FORCE RLS` (`relforcerowsecurity=true`) | **0** |
| Com `FORCE OFF` | **63** |

**Resultado: 63/0** — bate exatamente com o esperado pelo briefing. RLS está universalmente habilitada, mas **nenhuma** tabela tem `FORCE ROW LEVEL SECURITY`. Sem FORCE, o **owner** da tabela (e qualquer conexão via service_role / SQL direto que assuma o owner) ignora as policies. Como as Edge Functions usam `service_role` (que já bypassa RLS de qualquer jeito), o impacto prático do FORCE aqui é menor que num app puro-cliente — mas o padrão Trívia exige FORCE e é a defesa contra um futuro acesso autenticado escrevendo direto. → **SEC-002**.

### 2.2 Policies por papel — isolamento

Total: **89 policies** em `public`. O modelo de isolamento do PCM é por **papel de usuário**, resolvido pela função `pcm_get_my_role()`:

```sql
CREATE FUNCTION public.pcm_get_my_role() RETURNS text
  LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT role FROM pcm_profiles WHERE id = auth.uid(); $$
```

Papéis: `admin`, `escritorio`, `tecnico`. **Importante:** as policies do PCM **NÃO isolam por `client_id`**. `admin`/`escritorio` enxergam **todos** os 51 clientes; `tecnico` tem leitura ampla + escrita no que é próprio (`tecnico_id = auth.uid()`). Isso é **coerente com o desenho single-tenant**: existe uma única empresa operadora (Sinérgica) gerenciando todos os condomínios. Ou seja, "multi-tenancy" aqui é isolamento **entre papéis internos**, não entre clientes finais. O risco de IDOR (2.4) é o caso onde essa premissa quebra (o agente do WhatsApp opera por grupo/condomínio).

Tabelas `pcm_*` com isolamento por papel adequado (exemplos): `pcm_clients`, `pcm_backlog_items`, `pcm_ordens_servico`, `pcm_visitas`, `pcm_inspecoes` (com `tecnico_id = auth.uid()` no técnico), `pcm_proposals`, `pcm_wa_*` (admin only). Esse desenho está **bem feito**.

**Policies permissivas (`qual=true`) — atenção:**

| Tabela | Policy | Papel | Risco |
|--------|--------|-------|-------|
| `pcm_relatorios_diarios` / `_mensais` / `_mensal_batches` / `_mensal_config` | `*_read` / `*_write` | `authenticated` | Qualquer usuário logado lê e (na maioria) escreve relatórios — sem filtro de papel/cliente |
| `pcm_equipment_cache`, `pcm_plan_items` | `authenticated_all_*` | `authenticated` | ALL com `true` |
| `pcm_materials_catalog` | `catalog_read_all` | `authenticated` | leitura global (aceitável p/ catálogo) |
| `pcm_technicians`, `pcm_auvo_nao_ok`, `pcm_auvo_questionarios` | `*_read` | `authenticated` | leitura global |
| `message_*_queue`, `nina_processing_queue`, `round_robin_state`, `send_queue` | `Allow all operations` | **public** | ALL com `true` para **public** (sistema CRM/Nina) |

**Entulho de outro sistema (CRM/"Nina") no mesmo projeto** — tabelas vazias mas com policies permissivas: `deals` (`authenticated`, ALL, `auth.role()='authenticated'`), `contacts`, `conversations`, `messages`, `appointments`, `deal_activities`, `pipeline_stages`, `teams`, `team_members`, `tag_definitions`, `whatsapp_instances`, `whatsapp_instance_secrets`, etc. Confirma o desenho do briefing: a policy de `deals` é **permissiva por `authenticated`** — qualquer usuário PCM logado leria/escreveria `deals` se a tabela tivesse dados. Hoje estão vazias (entulho de template), mas é superfície de ataque/confusão. → **SEC-011**.

> Observação: `whatsapp_instance_secrets` (do sistema Nina, não do PCM) tem policy `admin` — porém é tabela de **segredos** convivendo no mesmo banco; reforça o argumento de remover/isolar o template Nina.

### 2.3 Buckets de Storage — públicos

Confirmado via `storage.buckets`:

| Bucket | `public` | Limite | MIME | Veredito |
|--------|----------|--------|------|----------|
| **`inspecao-fotos`** | **TRUE** | 10 MB | image/* | **PÚBLICO** — fotos de inspeção predial acessíveis por URL sem auth |
| **`pcm-relatorios`** | **TRUE** | 50 MB | application/pdf | **PÚBLICO** — relatórios (PDF) acessíveis por URL sem auth |
| `laudos-fotos` | FALSE | 10 MB | image/* | privado (OK) |
| `laudos-pdf` | FALSE | — | — | privado (OK) |
| `pcm-proposals` | FALSE | — | — | privado (OK) |

Os dois buckets do briefing (`inspecao-fotos`, `pcm-relatorios`) estão **públicos** — qualquer pessoa com a URL acessa fotos de inspeção e relatórios de clientes, sem autenticação. Tornar privados e servir por **signed URLs**. → **SEC-010**.

Policies de `storage.objects` (só authenticated, por bucket): `inspecao_insert/update/delete_auth` (inspecao-fotos), `laudos_pdf_all`, "manage inspection photos" (laudos-fotos). As policies de escrita estão razoáveis; o problema é o flag `public=true` que libera **leitura** anônima independentemente das policies.

### 2.4 IDOR no `pcm-ze-agent.atualizar_chamado` — CONFIRMADO

**Confirmado no código de produção** (`supabase/functions/pcm-ze-agent/index.ts`, função em prod versão 21). Trecho (linhas ~606-611):

```ts
const { data, error } = await supabase
  .from('pcm_ordens_servico')
  .update(updates)
  .eq('numero_os', numeroOs)          // <-- SÓ numero_os
  .select('numero_os, titulo, status, prioridade')
  .single()
```

A function roda com **`service_role`** (bypassa RLS). No contexto de grupo de WhatsApp, ela resolve `clientId` a partir do `whatsapp_group_jid` e **as tools de leitura filtram por `client_id`** (linhas 495, 512, 553 — `.eq('client_id', clientId)` / `.in('client_id', clientIds)`). Mas a tool **`atualizar_chamado`** faz o UPDATE **apenas por `numero_os`**, sem `client_id`. Como `numero_os` é um contador **global** da `pcm_ordens_servico` (517 chamados em prod), o grupo do Condomínio A pode **editar/cancelar o chamado de qualquer outro condomínio** acertando o número — incluindo mudar `status='cancelado'`, `titulo`, `descricao`, `prioridade`, `local_descricao`.

- **Gatilho:** linguagem natural no grupo ("cancela o chamado 318") → o LLM chama `atualizar_chamado(numero_os: 318)`.
- **Impacto:** quebra de isolamento multi-tenant + adulteração/cancelamento de OS alheia.
- **Correção:** no UPDATE, adicionar `.eq('client_id', resolvedClientId)` quando o contexto não for admin (mesmo padrão das tools de leitura). → **SEC-001 (P0/Crítico)**.

### 2.5 CORS, auth.getUser, Zod, functions admin, segredos

**CORS `*`:** confirmado em `_shared/utils.ts` (`Access-Control-Allow-Origin: '*'`) e replicado em ~22 functions (`run-migration`, `setup-storage-policies`, `pcm-ze-agent`, `pcm-whatsapp-webhook`, `laudos-agent`, todas as `pcm-auvo-*`, `pcm-relatorio-*`, etc.). Nenhuma restringe à origem do app. → **SEC-003**.

**`auth.getUser()` / validação de role em código:** **ausente** — `grep` por `auth.getUser`/`getUser(` nas functions retornou **zero** ocorrências. A proteção depende 100% do `verify_jwt` da plataforma. Estado real do `verify_jwt` em produção (Management API):

| verify_jwt | Functions |
|------------|-----------|
| **true** | todas, exceto a de baixo (19 functions) |
| **false** | **`laudos-agent`** |

- `laudos-agent` está **pública** (`verify_jwt=false`, CORS `*`) e dispara chamadas pagas ao OpenRouter (`anthropic/claude-sonnet-4-6`) sem nenhuma autenticação → **abuso de custo / DoS financeiro**. **Achado novo, não estava no SECURITY_DEBT.** → **SEC-012**.
- Para as `verify_jwt=true`: como **não há `auth.getUser()` nem checagem de role no código**, qualquer portador de um JWT válido (inclusive a **anon key pública**) passa. Vide webhook abaixo. → **SEC-004**.

**`pcm-whatsapp-webhook`:** `verify_jwt=true`, mas a Evolution autentica enviando a **anon key** no header `Authorization` (confirmado em `/webhook/find/ze-pcm-v2`). Como a anon key é **pública** (embutida no frontend), o endpoint do webhook é, na prática, **chamável por qualquer um** que tenha a anon key, e processa o payload com **service_role**, sem validar assinatura/secret da Evolution nem rodar Zod. Risco: injeção de mensagens forjadas no pipeline do Zé. → **SEC-005 / SEC-013**.

**Zod / validação de input:** **ausente** — `grep` por `zod`/`z.object` retornou **zero**. Payloads do webhook (`data.key.remoteJid`, etc.) e args das tools do LLM (`numero_os`, `status`...) são consumidos sem schema. → **SEC-005**.

**Webhook Auvo:** **valida** `x-webhook-secret` (`pcm-auvo-webhook` linha ~152-157). Esse está melhor que o do WhatsApp — bom precedente a replicar.

**Functions admin perigosas:** `run-migration` e `setup-storage-policies` existem no repo, rodam com `service_role` + CORS `*`; `run-migration` tem **UID hardcoded** (`29653d73-f419-460d-94dc-fd521535adda`, Fabrício) e era usada para rodar SQL arbitrário/diagnóstico. **Verificação positiva contra produção: nenhuma das duas aparece no `supabase functions list`** (20 functions deployadas; ambas ausentes). Logo, **não estão expostas em prod hoje** — risco residual é alguém deployá-las. Manter fora do deploy / remover do repo. → **SEC-006** (severidade rebaixada de crítico p/ médio por não estarem em prod).

**Segredos no frontend:** **OK.** `grep` por `OPENROUTER|EVOLUTION_API_KEY|AUVO_API|SERVICE_ROLE|sk-or-` em `src/` → **zero**. O frontend só usa `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (`src/shared/lib/supabase.ts`). Nenhum segredo de servidor vaza no bundle.

**Segredos em texto (novo achado):**
- O **`cron.job` jobid 3** (`relatorio-mensal-worker`) tem o **service_role JWT em texto puro** dentro do `command` SQL (header `Authorization: Bearer eyJ...service_role...`). Qualquer um com acesso de leitura a `cron.job` (qualquer admin de DB / token Management) lê a chave mais poderosa do projeto. → **SEC-014**.
- O webhook da Evolution armazena a **anon key** em texto no Cloudfy (esperado, key é pública, mas registra a superfície).

---

## 3. INFRA

### 3.1 Netlify (`netlify.toml`)

| Item | Valor | Veredito |
|------|-------|----------|
| Build | `npx vite build` (pula `tsc -b`) | OK (intencional — `npm run build` faz `tsc -b && vite build` e pode falhar por tipo) |
| Node | 22 | OK |
| SPA redirect | `/* → /index.html 200` | OK |
| `X-Frame-Options` | `DENY` | OK |
| `X-Content-Type-Options` | `nosniff` | OK |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | OK |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | OK |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` | OK |
| **CSP** | `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ... connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-src 'none'; object-src 'none'` | Parcial |

CSP existe e é razoável, mas **`script-src` usa `'unsafe-inline'` e `'unsafe-eval'`**, o que neutraliza boa parte da proteção contra XSS. Vite em produção normalmente não precisa de `unsafe-eval`; `'unsafe-inline'` pode ser trocado por nonce/hash. `connect-src` cobre só Supabase (correto, o front fala só com Supabase). → **SEC-008** (headers já adicionados; refinar CSP).

### 3.2 Cloudfy / Evolution API (WhatsApp)

| Item | Valor |
|------|-------|
| Host | `https://fascinatingsnail-evolution.cloudfy.live` |
| Instância | `ze-pcm-v2` |
| Estado da conexão | **`open`** (confirmado — conectada) |
| Webhook URL | `https://sfprfvltbtysvtsqutla.supabase.co/functions/v1/pcm-whatsapp-webhook` |
| Webhook auth | header `Authorization: Bearer <anon key>` (pública) |
| Eventos | `MESSAGES_UPSERT`, `MESSAGES_UPDATE`, `CONNECTION_UPDATE`, `QRCODE_UPDATED` |
| `webhookByEvents` / `Base64` | false / false |
| Atualizado | 2026-06-18T01:40Z |

`apikey` global da Evolution (`FgkOLH...`) dá controle total da instância (criar/derrubar/ler QR). Está no header do briefing e nos secrets do Supabase (`EVOLUTION_API_KEY`). Webhook protegido só por anon key — ver SEC-013.

### 3.3 Supabase

**Crons (`cron.job`):**

| jobid | schedule | nome | comando | nota |
|-------|----------|------|---------|------|
| 1 | `* * * * *` (1 min) | `process-wa-queue` | `SELECT process_wa_queue_cron()` | OK (função interna) |
| 3 | `*/2 * * * *` (2 min) | `relatorio-mensal-worker` | `net.http_post` → `pcm-relatorio-mensal-worker` | **service_role JWT em texto no comando** (SEC-014) |

**Buckets:** 5 (ver 2.3) — 2 públicos.

**Secrets (só nomes, via `secrets list`):** `AUVO_API_KEY`, `AUVO_API_TOKEN`, `EVOLUTION_API_KEY`, `EVOLUTION_API_URL`, `EVOLUTION_INSTANCE_ZE`, `OPENROUTER_API_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_DB_URL`, `SUPABASE_JWKS`, `SUPABASE_PUBLISHABLE_KEYS`, `SUPABASE_SECRET_KEYS`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_URL`. (Sem valores expostos no list — bom.)

**Functions deployadas (20, todas ACTIVE):** `laudos-agent`, `analisar-item-inspecao`, `importar-relatorio-pdf`, `image-proxy`, `pcm-whatsapp-webhook`, `pcm-ze-agent`, `pcm-evolution-groups`, `pcm-auvo-*` (8), `pcm-relatorio-diario`/`-enviar`, `pcm-relatorio-mensal`/`-worker`, `pcm-wa-poller`. **`run-migration` e `setup-storage-policies` NÃO estão deployadas** (existem só no repo).

---

## 4. Tabela de débitos (SEC-XXX)

| ID | Sev | Título | Status verificado em prod | Correção |
|----|-----|--------|---------------------------|----------|
| **SEC-001** | **Alta (P0)** | IDOR multi-tenant no `pcm-ze-agent.atualizar_chamado` (UPDATE só por `numero_os`) | **Confirmado** (prod v21) | `.eq('client_id', resolvedClientId)` no UPDATE quando não-admin |
| **SEC-002** | Alta | Nenhuma tabela com `FORCE RLS` (63/0) | **Confirmado** | `ALTER TABLE ... FORCE ROW LEVEL SECURITY` em todas |
| **SEC-010** | Alta | Buckets `inspecao-fotos` e `pcm-relatorios` **públicos** | **Confirmado** | Tornar privados + signed URLs |
| **SEC-012** | Alta | `laudos-agent` com `verify_jwt=false` (pública, queima OpenRouter) | **Confirmado** (novo) | Ligar `verify_jwt` + checar role; rate limit |
| **SEC-013** | Alta | `pcm-whatsapp-webhook` autenticado só por anon key (pública); processa c/ service_role; sem secret/assinatura | **Confirmado** | Validar secret/assinatura da Evolution; não confiar só na anon key |
| **SEC-014** | Alta | service_role JWT em **texto puro** no `cron.job` (jobid 3) | **Confirmado** (novo) | Usar Vault/secret p/ o header; rotacionar chave após exposição |
| **SEC-003** | Média | CORS `*` em todas as Edge Functions | **Confirmado** | Restringir à origem Netlify de produção |
| **SEC-004** | Média | `auth.getUser()`/checagem de role ausente no código (depende só do `verify_jwt`) | **Confirmado** | Validar usuário+role nas functions sensíveis |
| **SEC-005** | Média | Sem validação de input (Zod ausente) em webhooks e tools do LLM | **Confirmado** | Zod em todo payload externo |
| **SEC-006** | Média | `run-migration`/`setup-storage-policies` perigosas (service_role, CORS `*`, UID hardcoded) | **Não deployadas em prod** (só no repo) | Remover do repo / manter fora do deploy |
| **SEC-011** | Média | Tabelas do CRM/"Nina" no mesmo projeto; `deals` permissiva p/ `authenticated`; `public` ALL em filas | **Confirmado** (vazias) | Remover/isolar o template Nina |
| **SEC-007** | Baixa | Sem rate limiting (webhook WhatsApp, ze-agent, laudos-agent → custo OpenRouter) | Confirmado (ausência) | Throttle por origem/instância |
| **SEC-008** | Baixa | CSP com `unsafe-inline`/`unsafe-eval` no `script-src` | **Confirmado** | Trocar por nonce/hash; remover `unsafe-eval` |
| **SEC-009** | Baixa | Fallbacks de instância Evolution com nomes velhos (`ze-carlos`/`ze-pcm`) | (a confirmar no código atual de cada fn) | Falhar explícito se secret ausente |
| SEC-R01 | Resolvido | `EVOLUTION_INSTANCE_ZE` vazio | Resolvido 2026-06-17 (`ze-pcm-v2`, instância `open`) | — |
| SEC-R02 | Resolvido | Webhook 401 (faltava `Authorization`) | Resolvido 2026-06-17 (anon key no header) — mas vira SEC-013 | — |

> Numeração mantém compatibilidade com o `SECURITY_DEBT.md` do repo; **SEC-012/013/014 são achados novos** desta auditoria.

---

## 5. Recomendações priorizadas

1. **Agora (P0):** SEC-001 (filtro `client_id` no UPDATE do ze-agent). É exploração trivial via linguagem natural e quebra o isolamento entre condomínios.
2. **Esta semana (Alta):** SEC-010 (buckets privados + signed URLs), SEC-012 (`laudos-agent` JWT on), SEC-013 (secret no webhook WhatsApp), SEC-014 (tirar service_role do cron), SEC-002 (FORCE RLS).
3. **Backlog (Média/Baixa):** SEC-003/004/005 (CORS restrito + Zod + checagem de role — preferível centralizar num middleware compartilhado), SEC-011 (remover Nina), SEC-006 (remover functions admin do repo), SEC-007 (rate limit), SEC-008 (CSP), SEC-009.

### Pontos positivos confirmados
- RLS habilitada em 100% das tabelas; policies `pcm_*` por papel bem desenhadas (admin/escritorio/tecnico com `auth.uid()` no técnico).
- Nenhum segredo de servidor no frontend.
- `verify_jwt` ligado em 19/20 functions; webhook Auvo já valida `x-webhook-secret`.
- Headers de segurança e CSP presentes no Netlify; instância do Zé conectada (`open`).
- `run-migration`/`setup-storage-policies` confirmadamente **fora** de produção.
