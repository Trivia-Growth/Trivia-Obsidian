---
projeto: Sales-Hzm
tipo: auditoria
gerado_por: Agentes Triviaiox (architect, data-engineer, devops, qa, dev)
metodo: 40 sub-agentes em paralelo + verificação adversarial
criado: 2026-06-09
atualizado: 2026-06-09
---

# Auditoria TRIVIAIOX — Sales-Hzm

> [!info] Como esta auditoria foi feita
> Os 5 agentes de auditoria do Triviaiox (🏛️ architect, 📊 data-engineer, ⚡ devops, ✅ qa, 💻 dev) varreram o projeto inteiro em **7 frentes paralelas** (front-end, edge functions, banco, config — com qa e dev rodando em duas frentes cada). **77 achados brutos** passaram por **verificação adversarial** dos críticos/altos (2 descartados como falso-positivo, 30 confirmados). Total de **40 sub-agentes** e ~1,4M tokens. As correções estão organizadas em stories no Padrão Trívia — ver [[Sales-Hzm — Índice]].

> [!important] Reavaliação SINGLE-TENANT (leia antes de priorizar)
> A auditoria foi escrita assumindo um SaaS **multi-tenant**, então tratou "vazamento entre clientes/workspaces" como o risco número 1. **Este projeto é single-tenant** (uma só organização — a Heziom). Logo:
>
> **Caem de prioridade** (dependiam de existir vários clientes):
> - **#2 — IDOR cross-tenant** (funções confiando em `workspace_id`/`deal_id` do corpo): com um só workspace, passar "o id de outro tenant" não é ataque relevante. → rebaixado para baixo/médio.
> - **#60/#61** (policies sem `TO` / mistura de padrões de isolamento entre tenants): rebaixados.
> - A parte "vazamento ENTRE workspaces" dos achados de RLS perde sentido.
>
> **CONTINUAM válidos** (são exposição à internet pública, não dependem de multi-tenant):
> - **#1 — RLS desligada** (`FORCE` sem `ENABLE`): a **chave anônima é pública** (vai no JS do site). Sem RLS, qualquer um na internet com essa chave lê `quotes`, `ai_predictions` etc. via API REST. **Continua crítico.**
> - **#3/#4 — Edge Functions públicas sem autenticação** usando `service_role`: qualquer um com a URL executa, grava dados e **queima as chaves de IA pagas**. **Continua crítico.**
> - **#7/#6/#5 — segredos em texto puro** (Z-API, Meta, chaves de IA, tokens) lidos pelo frontend: **continua alto.**
> - **#8–#11 — webhooks/OAuth sem prova de origem:** **continua alto.**
> - **Todos os achados de qualidade/processo** (#12 type-check, #47 testes, #49 CI, duplicação, arquitetura): independem de tenancy — **inalterados.**
>
> Resumo: a *natureza* do risco muda de "um cliente vê o outro" para "a internet vê/abusa do sistema", mas a **urgência de segurança permanece**. A reordenação final está no índice e nas prioridades das stories.

---


## Resumo executivo

O Heziom-Sales é um CRM multi-tenant (React + Vite + Supabase, construído na Lovable) que, apesar de funcional, apresenta falhas estruturais sérias de isolamento entre tenants e de garantia de qualidade. A auditoria confirmou cinco vulnerabilidades críticas que, juntas, comprometem a premissa básica de um SaaS multi-tenant: quatro tabelas (`quotes`, `custom_fields`, `custom_field_values`, `ai_predictions`) ficaram com RLS inerte (FORCE sem ENABLE); uma correção de segurança da STORY-016 nunca chegou ao banco por uso indevido de `CREATE TABLE IF NOT EXISTS`; e diversas Edge Functions com `service_role` confiam em `workspace_id`/`deal_id` vindos do corpo da requisição (umas sem nenhuma autenticação, outras autenticadas mas sem checar membership), abrindo vazamento cross-tenant, IDOR e abuso de custo das chaves de IA do cliente. Soma-se a isso um aparato de qualidade que é teatro: o build não roda type-check (316 erros de TS vão para produção), há um único teste trivial, nenhum CI/CD e segredos sensíveis (Z-API, Meta, chaves de IA, tokens de API) armazenados e trafegados em texto puro. Muitos achados médios e baixos são sintomas clássicos de código gerado por Lovable — duplicação massiva, `config/env.ts` morto com env var errada, arquitetura `features/` documentada mas inexistente, e quebras silenciosas via `catch {}` vazios.

| Severidade | Quantidade |
|---|---|
| 🔴 Crítico | 5 |
| 🟠 Alto | 11 |
| 🟡 Médio | 40 |
| 🔵 Baixo | 19 |
| **Total** | **75** |

Estatísticas de processo: 77 achados brutos, 77 após deduplicação, 32 verificados adversarialmente, 2 rejeitados como falso-positivo, 30 confirmados.

---

## 🔴 Críticos

### Isolamento de tenant quebrado no banco (RLS)

#### 1. Tabelas `quotes`, `custom_fields`, `custom_field_values` e `ai_predictions` sem RLS habilitado (FORCE sem ENABLE) ✅ confirmado
- **O que é:** As quatro tabelas são criadas apenas com `ALTER TABLE ... FORCE ROW LEVEL SECURITY`, nunca com `ENABLE ROW LEVEL SECURITY`. No PostgreSQL, FORCE sozinho NÃO ativa o RLS — as policies ficam inertes e o role `authenticated` lê/escreve todas as linhas de todos os workspaces.
- **Onde:** `supabase/migrations/20260321192649_663151c4-3cf9-432b-b163-a3dc2808d4da.sql:17` (custom_fields), `:38` (custom_field_values), `:65` (quotes), `:93` (ai_predictions). Nenhuma das 35 migrations chama ENABLE para essas tabelas; a migration de fortalecimento `20260505000001` lista contacts/deals/etc. mas NÃO inclui estas quatro.
- **Por que importa:** Vazamento total cross-tenant de propostas comerciais (subtotal, desconto, total, itens), valores de campos customizados de contatos e predições de IA.
- **Como corrigir:** Criar migration imediata com `ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;` (idem as outras três) e adicioná-las ao bloco DO/FOREACH da `20260505000001`. Validar com `SELECT relname, relrowsecurity FROM pg_class WHERE relname IN (...)`. **Esforço: trivial.**

#### 2. IDOR cross-tenant: funções autenticadas confiam no `workspace_id`/`deal_id` do corpo sem checar associação ✅ confirmado
- **O que é:** Funções que autenticam qualquer usuário logado (`getUser`) mas depois usam o client `service_role` para ler/escrever com base em ids recebidos no corpo, sem verificar membership do usuário no workspace.
- **Onde:** `supabase/functions/generate-quote-pdf/index.ts:22-36`, `predictive-ai/index.ts:22-50`, `analyze-meeting/index.ts:30-50`, `lead-scorer/index.ts:18-20`. grep confirma 0 chamadas a `is_member_of_workspace`/`workspace_members` nessas funções, enquanto ~17 outras funções (ex.: `copilot-suggest:70`) fazem o check correto.
- **Por que importa:** Um usuário do workspace A passa o `deal_id`/`contact_id` do workspace B e gera PDF de proposta alheia, roda análise preditiva sobre dados de outro tenant ou lê transcrições de reunião de outro workspace. `predictive-ai` e `lead-scorer` nem filtram por workspace.
- **Como corrigir:** Após autenticar, validar membership antes de qualquer query com service_role: `await supabase.rpc('is_member_of_workspace', { _user_id: user.id, _workspace_id: workspace_id })` e retornar 403 se falso. Idealmente derivar o workspace do próprio registro. **Esforço: medium.**

### Edge Functions públicas com `service_role` sem autenticação

#### 3. Funções públicas (`verify_jwt=false`) sem nenhuma autenticação interna usando `service_role` ✅ confirmado
- **O que é:** Sete funções marcadas com `verify_jwt = false` no config.toml e sem qualquer checagem interna (sem `getUser`/`getClaims`/segredo), todas instanciando o client com `SUPABASE_SERVICE_ROLE_KEY` (BYPASSRLS) e lendo `workspace_id`/`session_id`/`deal_id` direto do corpo.
- **Onde:** `roleplay-chat/index.ts:27`, `roleplay-evaluate/index.ts:23`, `flow-engine/index.ts:21`, `routing-engine/index.ts:14`, `nps-send/index.ts:14`, `knowledge-import/index.ts:28`, `commercial-report/index.ts:16` — todas com `verify_jwt=false` em `supabase/config.toml`. Existe um helper `_shared/auth.ts` (`requireAuth`) que nenhuma delas importa.
- **Por que importa:** Qualquer pessoa com a URL invoca para qualquer workspace: acesso cross-tenant, queima de tokens das chaves de IA do cliente (roleplay-chat/evaluate, knowledge-import, commercial-report), disparo de NPS via Z-API (nps-send), reatribuição de deals (routing-engine) e inscrição de contatos em fluxos (flow-engine). Apenas `roleplay-chat` tem rate limit.
- **Como corrigir:** Validar o JWT do chamador via `getUser` (de `_shared/auth.ts`) + verificar membership no `workspace_id`; para funções só-cron/internas, exigir header de segredo compartilhado comparado de forma constante. Nunca expor service_role sem barreira de auth. **Esforço: medium.**

#### 4. `commercial-report` e `knowledge-import` públicas sem auth interna usando `service_role` ✅ confirmado
- **O que é:** Recorte específico do achado acima, com detalhamento do impacto sobre chaves de IA. Ambas leem `workspace_id` do corpo (commercial-report:21, knowledge-import:12) e usam service_role sem auth.
- **Onde:** `supabase/config.toml:48` (commercial-report) e `:51` (knowledge-import); `commercial-report/index.ts:16,21`; `knowledge-import/index.ts:28,12`. A irmã `lead-scorer:18-20` valida via `auth.getUser()`, provando que é anomalia.
- **Por que importa:** `knowledge-import` permite gravar conhecimento em qualquer workspace e lê a `api_key` do provider de IA da vítima (linhas 33-35); `commercial-report`, sem `workspace_id`, enumera até 100 workspaces (linha 32) e dispara geração de relatório para todos, lendo api_keys cross-tenant. Viola a regra do `SECURITY_DEBT.md` ("JWT via auth.getUser(), nunca confiar no body").
- **Como corrigir:** Remover `verify_jwt=false` (forçar JWT na borda) e validar membership, OU exigir um segredo de serviço (`x-service-secret`) antes de usar service_role. **Esforço: small.**

### Falha silenciosa de migração

#### 5. STORY-016 não aplicou hardening de `api_tokens`/`inbound_webhooks` (`CREATE TABLE IF NOT EXISTS` em tabela já existente) ✅ confirmado
- **O que é:** A STORY-016 tenta recriar `api_tokens` (com `token_hash`, `token_prefix`, `permissions`, acesso só-admin) e `inbound_webhooks` usando `CREATE TABLE IF NOT EXISTS`. Como ambas já existem (migrations `20260321041945` e `20260321191750`), o CREATE é um no-op silencioso: as novas colunas e policies de segurança nunca são criadas.
- **Onde:** `supabase/migrations/20260509000002_story016_superadmin_api_billing.sql:8-56`. O `types.ts` (gerado do banco deployado) confirma o schema antigo: `api_tokens` (linhas 267-304) ainda mostra `token`/`label`/`is_active`; `inbound_webhooks` (1333-1382) ainda mostra `token`/`field_mapping`/`is_active`. A antiga policy "Members can view api_tokens" continua expondo o token em texto puro.
- **Por que importa:** A correção de segurança que a story acreditava ter aplicado nunca existiu no banco. Tokens de API e webhook permanecem em plaintext, sem hashing — regressão de segurança real e mascarada.
- **Como corrigir:** Migration de reconciliação explícita: `ALTER TABLE api_tokens ADD COLUMN token_hash/token_prefix/permissions`; backfill/rotacionar; `DROP` da coluna `token` antiga; `DROP` da policy "Members can view"; criar policy só-admin. Idem `inbound_webhooks`. Nunca usar `CREATE TABLE IF NOT EXISTS` para alterar schema de tabela existente. **Esforço: medium.**

---

## 🟠 Altos

### Segredos em texto puro

#### 6. `api_tokens` guarda token em texto puro e é legível por qualquer membro ✅ confirmado
- **Onde:** `supabase/migrations/20260321041945_3f9dc2d0-...:6,16-18`; validado em `lead-intake/index.ts:44` (`.eq("token", apiToken)`). Coluna `token` via `encode(gen_random_bytes(32),'hex')`; policy "Members can view api_tokens" usa `is_member_of_workspace` (não filtra papel, alcança `agent`).
- **Por que importa:** Qualquer membro, inclusive `agent`, lê o token e pode forjar requisições de criação de leads/contatos. (Verificação rebaixou de critical para high: exige insider autenticado, escopo limitado ao próprio workspace.)
- **Como corrigir:** Migrar para token hasheado (sha256) + prefixo de exibição; restringir SELECT a admin/superadmin; hashear no `lead-intake` antes de comparar; remover a policy "Members can view"; rotacionar tokens existentes. **Esforço: medium.**

#### 7. Credenciais sensíveis (tokens Z-API, `access_token` Meta, `api_key` de IA) em texto puro ✅ confirmado
- **Onde:** `20260317200650:8-10` (zapi_instances.token/client_token), `20260509000007:11` (whatsapp_accounts.access_token/verify_token), `20260317202450:11` (ai_providers_config.api_key). Pior: o frontend lê as colunas cruas — `Settings.tsx:276` (`select('*')` em zapi_instances), `MetaWATab.tsx:61,139` (lê e usa `access_token` no client), `AISettingsTab.tsx:97` (api_key). `maskToken`/`maskKey` só mascaram a exibição; o valor pleno trafega no payload.
- **Por que importa:** Segredos faturáveis e que enviam mensagem em nome do cliente, expostos a todo membro e visíveis no DevTools. Risco agravado se algum RLS falhar.
- **Como corrigir:** Mover para Supabase Vault (pgsodium) ou criptografar em coluna; restringir SELECT dessas colunas a service_role; usar view sem as colunas sensíveis para o frontend. **Esforço: large.**

### Webhooks e OAuth sem prova de origem

#### 8 e 9. Webhook `zapi-webhook` (`verify_jwt=false`) sem verificação de assinatura/segredo ✅ confirmado
- **Onde:** `supabase/config.toml:6`; `supabase/functions/zapi-webhook/index.ts:9,15,44`. Body vem de `req.json()` e `workspace_id` de query param não confiável; grep por hmac/signature/client-token na função retorna nada. A tabela `zapi_instances` JÁ tem a coluna `client_token` (header de segurança do Z-API) mas o código nunca a usa. Contraste: `meta-wa-webhook` implementa HMAC-SHA256 completo.
- **Por que importa:** Quem descobrir a URL injeta mensagens falsas em qualquer workspace variando `?workspace_id=`, infla `unread_count` e dispara o `ai-orchestrator` (linhas 142-172), consumindo tokens de LLM pagos e gerando respostas automáticas no WhatsApp real do contato.
- **Como corrigir:** Validar o `Client-Token` do Z-API (já usado em zapi-send/whatsapp-router/ai-orchestrator/nps-send) ou um secret por workspace, retornando 401 antes de tocar no banco. **Esforço: medium.** *(Nota: achados 8 e 9 são o mesmo problema relatado por duas lentes; tratar como uma correção única.)*

#### 10. Callback OAuth de meetings aceita `state` forjável (sem assinatura) — open redirect e sequestro de integração ✅ confirmado
- **Onde:** `supabase/functions/meetings-oauth-callback/index.ts:8-100`. `state` é apenas `JSON.parse(atob(state))` (linha 23) com `{user_id, workspace_id, origin}`, sem HMAC nem nonce; `origin` (linha 100) vira o destino do redirect 302 (linha 103) sem allowlist; tokens gravados via service_role no upsert (linhas 86-87).
- **Por que importa:** Open redirect incondicional (phishing) + misbinding de tokens OAuth a outra conta/workspace. Mitigação parcial: o hijack só atinge workspaces que já têm a integração Teams ativa, mas o open redirect é sempre explorável.
- **Como corrigir:** Persistir nonce server-side (tabela `oauth_states` com expiração) e validar no callback, ou assinar o state com HMAC; validar `origin` contra allowlist fixa. **Esforço: medium.**

#### 11. Verificação HMAC do webhook Meta é condicional e usa comparação não constante ✅ confirmado
- **Onde:** `supabase/functions/meta-wa-webhook/index.ts:90-98,28`. A validação só roda `if (appSecret)` (linha 91); sem `META_APP_SECRET` o bloco é pulado, sem else nem return de erro — fail-open silencioso. `expected === signature` (linha 28) não é comparação de tempo constante.
- **Por que importa:** O HMAC é a única autenticação deste webhook público; se a secret faltar em prod, o endpoint fica aberto, e o handler usa service_role + dispara `ai-orchestrator` (linhas 261-275).
- **Como corrigir:** Tornar `META_APP_SECRET` obrigatória (retornar 500/403 se ausente); usar comparação de tempo constante; mesmo princípio para o `verify_token` do GET. **Esforço: small.**

### Qualidade que vai para produção sem barreira

#### 12. 316 erros de TypeScript não bloqueiam o build — strict é teatro ✅ confirmado
- **Onde:** `tsconfig.app.json` (`strict: true`, `noUnusedLocals`, `noUnusedParameters`) + `package.json` (`"build": "vite build"`, sem tsc). `npx tsc --noEmit` retorna exatamente 316 erros (90 TS2339, 55 TS2345, 50 TS6133, 49 TS2322, 43 TS2769...); `vite build` completa em ~2s com exit 0 apesar deles.
- **Por que importa:** Type-checking não bloqueia o build e código quebrado vai a produção. Muitos TS2339 são queries Supabase contra colunas que o compilador acha que não existem (ex.: `FeatureFlagsPanel.tsx:209` "column 'flag_key' does not exist") — bugs de schema mascarados. A DoD do CLAUDE.md (linha 173) exige "Build OK, TypeScript strict (sem any)", hoje falso.
- **Como corrigir:** Adicionar typecheck ao build/CI (`"build": "tsc -b && vite build"` ou script `typecheck` no CI); corrigir em lote por categoria, começando por TS6133 e TS2339 de schema. **Esforço: large.**

#### 13. `types.ts` do Supabase desatualizado: tabelas `feature_flags`/`workspace_feature_flags` ausentes — ❌ rejeitado (falso-positivo)
- *Marcado como "erro" na verificação. Não conta como achado confirmado.*

### Features quebradas em produção

#### 14. Front chama Edge Functions que não existem (`preparation-quiz` e `roleplay-import`) ✅ confirmado
- **Onde:** `src/components/roleplay/PreparationQuiz.tsx:41` (`invoke('preparation-quiz')`) e `src/components/roleplay/DocumentImporter.tsx:43` (`invoke('roleplay-import')`). `ls supabase/functions/` (39 funções) não contém nenhuma com esses nomes; ambos os componentes estão montados (`RoleplayPreparation.tsx:92`, `TrainingConfig.tsx:243`).
- **Por que importa:** O quiz de preparação nunca gera e a importação de documento sempre falha após extrair o texto. Há try/catch + toast, sem crash; impacto restrito a roleplay/treinamento.
- **Como corrigir:** Criar as funções ou corrigir as chamadas (`roleplay-import` provavelmente deveria apontar para `knowledge-import`/`ingest-knowledge-document` — verificar contrato). Adicionar teste de fumaça que cruze nomes invocados com diretórios em `supabase/functions`. **Esforço: medium.**

---

## 🟡 Médios

### Configuração e env (origem Lovable)

#### 15. `config/env.ts` é código morto e quebrado — referencia env var inexistente ✅ confirmado
- **Onde:** `src/config/env.ts:3` lê `VITE_SUPABASE_ANON_KEY`, mas o `.env` só define `VITE_SUPABASE_PUBLISHABLE_KEY`; `grep '@/config/env'` retorna 0 usos. O CLAUDE.md aponta este arquivo como ponto único de config.
- **Por que importa:** Código morto + armadilha latente: se alguém o usar de boa-fé, o app recebe chave undefined. Doc desalinhada da realidade.
- **Como corrigir:** Tornar `env.ts` a fonte única, com o nome correto (`VITE_SUPABASE_PUBLISHABLE_KEY`), refatorar `client.ts` e usos espalhados; validar no boot (Zod) e falhar cedo. **Esforço: small.**

#### 16. Três convenções concorrentes de variável de ambiente para a mesma chave Supabase
- **Onde:** `src/integrations/supabase/client.ts:6` (PUBLISHABLE_KEY), `src/config/env.ts:3` (ANON_KEY), `Onboarding.tsx:25-26` (PUBLISHABLE_KEY + PROJECT_ID). Sem `.env.example` específico do app. **Esforço: small.**

#### 17. Mismatch de nome de variável: `config/env.ts` lê ANON_KEY mas o client real usa PUBLISHABLE_KEY
- **Onde:** `src/config/env.ts:3` vs `src/integrations/supabase/client.ts:6`. Provável origem do bug copiado para `PublicSelectionSessionChat`. **Esforço: trivial.**

#### 18. `.env.example` versionado é template genérico do TRIVIAIOX e não documenta as variáveis reais do app
- **Onde:** `.env.example:15-48` lista DEEPSEEK/OPENROUTER/etc., mas nenhuma `VITE_*` que o app consome. Onboarding/repro quebrado para novo dev. **Esforço: trivial.**

#### 19. URL do projeto Supabase hardcoded em múltiplos arquivos de UI
- **Onde:** `IntegrationsSettingsTab.tsx:108,162,255`; `WebhooksTab.tsx:93`; `Settings.tsx:268`; `Meetings.tsx:23`; `MetaWATab.tsx:156`. Outros pontos montam via `VITE_SUPABASE_PROJECT_ID` — duas estratégias coexistem. **Esforço: small.**

### Arquitetura (origem Lovable)

#### 20. Ausência de camada de serviço/API — acesso ao Supabase espalhado por componentes e páginas ✅ confirmado
- **Onde:** `find api/services` = 0; `supabase.from/rpc` em 29 componentes, 7 páginas e 5 hooks. `src/features/` vazio, apesar do CLAUDE.md documentar `features/[feature]/api → hooks TanStack Query`. **Esforço: large.**

#### 21. Único ErrorBoundary global, sem isolamento por rota e sem reporte de erros ✅ confirmado
- **Onde:** `src/App.tsx:78` (boundary único sobre `<Routes>`), `ErrorBoundary.tsx:20-22` (só `console.error`). `grep sentry` = 0 embora `SENTRY_DSN` exista no `.env.example`. "Tentar novamente" (linha 36) só faz `setState({hasError:false})` sem resetKeys — erro determinístico reaparece. **Esforço: medium.**

#### 22. Diretório `features/` documentado mas inexistente — arquitetura "Bulletproof React" é fachada
- **Onde:** `src/features/README.md` (único arquivo). Código vive em `src/components/<domínio>/` (113) e `src/pages/` (30). Doc diz "componentes < 300 linhas" mas `Analytics.tsx` tem 1256. **Esforço: medium.**

#### 23. Lógica de negócio e data-fetching concentrados em componentes-gigantes
- **Onde:** `Analytics.tsx` (1256 linhas, ~48 `supabase.from/rpc`+transformações), `Settings.tsx` (780), `AISettingsTab.tsx` (679). Fere "componentes < 300 linhas" e "nenhum cálculo sensível no frontend". **Esforço: large.**

### Duplicação (origem Lovable)

#### 24. Chamada a `initialize-workspace` replicada em dois arquivos
- **Onde:** `WorkspaceSwitcher.tsx:51-66` e `Onboarding.tsx:25-43` — bloco quase byte-a-byte, com divergência sutil ("organização" vs "workspace"). Extrair para `useCreateWorkspace` via `functions.invoke`. **Esforço: small.**

#### 25. Padrões inconsistentes de chamada a Edge Functions (fetch cru vs `functions.invoke`)
- **Onde:** `IntegrationsSettingsTab.tsx:106-120` (fetch cru com URL hardcoded e header manual) vs 14 usos de `functions.invoke`. Padronizar em `functions.invoke()`. **Esforço: medium.**

#### 26. URL do Supabase hardcoded e fluxo de fetch a Edge Functions duplicado em ~19 arquivos
- **Onde:** `Meetings.tsx:23`, `Settings.tsx:268`, `WebhooksTab.tsx:93`, `IntegrationsSettingsTab.tsx:108/162/255`, `MetaWATab.tsx:156` (+ ~12 com fetch manual). Criar helper `src/lib/edge.ts: callEdge(fn, payload)`. **Esforço: medium.**

#### 27. `_shared/` subutilizado: CORS, erros e validação reimplementados inline em ~22 funções
- **Onde:** `_shared/{cors,errors,validate}.ts` vs 22 funções com `corsHeaders` inline usando `'*'`, ignorando a allowlist de `cors.ts`. Só 11 das 39 funções importam `_shared`. **Esforço: large.**

### Segurança (banco e funções)

#### 28. Redefinição de `update_updated_at_column` remove `SET search_path` (risco de search_path hijacking)
- **Onde:** `20260509000007_story002_whatsapp_accounts.sql:76-79`. Função de trigger usada em todas as tabelas, perdeu o `SET search_path = public` da versão original (`20260317185728:150`). **Esforço: trivial.**

#### 29. Funções SECURITY DEFINER sem `SET search_path` (`is_superadmin`, `hybrid_search`)
- **Onde:** `20260509000004_story018_superadmins_table.sql:55-69` (is_superadmin — função central de autorização, vulnerável a escalonamento), `20260509000006_story019_pgvector_rag.sql:24-90` (hybrid_search). **Esforço: trivial.**

#### 30. Definição duplicada/contraditória de `is_superadmin` entre migrations
- **Onde:** `20260321035305:3-14` (consulta `workspace_members.role='superadmin'`, com search_path) vs `20260509000004:55-69` (consulta tabela `superadmins`, perde search_path, muda assinatura). `types.ts` mostra `_user_id` obrigatório, indicando que o deploy pode não refletir a versão com DEFAULT. **Esforço: small.**

#### 31. Fallback de superadmin legado concede permissões totais via role em `workspace_members`
- **Onde:** `manage-superadmins/index.ts:32-51`. Se o usuário não está em `superadmins`, fallback checa `workspace_members.role='superadmin'` e concede TODAS as permissões hardcoded — porta de escalonamento de privilégio. **Esforço: small.**

#### 32. `meta-wa-send` confia em `user_id` e `workspace_id` do corpo sem validar o chamador
- **Onde:** `meta-wa-send/index.ts:41-66`. `verify_jwt=true` (default) mas vai do parseBody direto a operações service_role com ids do corpo, sem `getUser` nem membership nem segredo interno. Usuário de outro tenant poderia enviar WhatsApp com o `access_token` de outra conta Meta. **Esforço: small.**

#### 33. Filtros PostgREST `.or()` construídos com input do usuário (telefone) — risco de injeção de filtro
- **Onde:** `lead-intake/index.ts:99` (sanitizado), `zapi-webhook/index.ts:83`, `meta-wa-webhook/index.ts:200` (sem filtro). Vírgulas/parênteses no valor podem quebrar o filtro; combinado com service_role (sem RLS), amplia o impacto. Usar `.eq()` separados ou sanitizar para só dígitos. **Esforço: small.**

#### 34. Mensagens de erro internas (`err.message`) refletidas ao cliente
- **Onde:** `nps-send:93`, `zapi-send:185`, `zapi-webhook:180`, `knowledge-import:137`, `roleplay-chat:181`, `roleplay-evaluate:228`, `analyze-meeting:171`, `initialize-workspace:116`, `nps-csat-webhook:146`. Vaza nomes de colunas/constraints do Postgres e respostas de erro do provider de IA. Usar `internalError()` de `_shared/errors.ts`. **Esforço: small.**

#### 35. Dados sensíveis (corpo de webhooks com PII e leads) logados em texto puro ✅ confirmado
- **Onde:** `zapi-webhook/index.ts:16`, `meta-wa-webhook/index.ts:107`, `lead-intake/index.ts:65` — `console.log(JSON.stringify(body))` com telefones, nomes, conteúdo de mensagens, email. Risco de LGPD para quem tem acesso aos logs. Redigir campos sensíveis, logar só metadados. **Esforço: trivial.**

#### 36 e 37. Senha temporária com `Math.random()` e devolvida no corpo/e-mail ✅ confirmado
- **Onde:** `admin-create-user/index.ts:60,110,130`, `manage-superadmins/index.ts:137,223`, `invite-member/index.ts:77`. `Math.random().toString(36)` (não-criptográfico) + `temp_password` no JSON; e-mail em claro só em `admin-create-user:110`. Gated por superadmin/admin. Usar `crypto.getRandomValues` / magiclink, não retornar a senha no corpo. **Esforço: small.** *(Dois achados sobrepostos — uma correção.)*

#### 38. Rate limiting ausente em funções de IA/custo públicas e fail-open no limiter
- **Onde:** `knowledge-import` (sem rate limit), `predictive-ai`, `analyze-meeting`; `_shared/rate-limit.ts:33-36` faz fail-open em erro de banco (`return allowed:true`). Vetor de esgotamento de cota/custo das chaves de IA. Aplicar `checkRateLimit` por workspace; reavaliar fail-open em endpoints sensíveis a custo. **Esforço: small.**

#### 39. Tratamento de erro inconsistente: `err.message` cru em `catch (unknown)` viola strict ✅ confirmado
- **Onde:** `nps-csat-webhook:146`, `nps-send:93`, `zapi-webhook:180`, `zapi-send:185`, `initialize-workspace:116`. Padrão correto (`err instanceof Error ? ...`) existe em ai-orchestrator/copilot-suggest/invite-member/test-persona. Padronizar. **Esforço: small.**

### Bugs e robustez (front e funções)

#### 40. Sessão de voz não encerra o stream do microfone (mic fica ligado) ✅ confirmado
- **Onde:** `RoleplayVoiceSession.tsx:74` — MediaStream de `getUserMedia` descartado, sem `getTracks().forEach(t => t.stop())` em endCall nem no cleanup. Mic permanece ativo após a sessão (privacidade/recurso). Guardar stream em ref e parar tracks. **Esforço: small.**

#### 41. Recuperação de buffer do parser SSE é frágil e pode corromper o streaming
- **Onde:** `RoleplaySession.tsx:99` (idêntico em `PublicSelectionSessionChat.tsx:160`). No catch, `textBuffer = line + '\n' + textBuffer; break` só funciona se a linha for a última; linhas partidas sem `data: ` são descartadas via `continue` (linha 86/137). Em respostas longas, pedaços faltando/JSON quebrado. **Esforço: medium.**

#### 42. Drag-and-drop do pipeline sem optimistic update gera race com o polling/invalidação
- **Onde:** `Pipeline.tsx:65-73,103-112` + `use-deals.tsx:125-135`. `handleDragEnd` chama `updateDeal.mutate` sem `onMutate`; só invalida `['deals', wid]` no onSuccess — snap-back perceptível e oscilação com polling. Adicionar optimistic update + rollback; padronizar queryKey. **Esforço: medium.**

#### 43 e 44. Vários `catch {}` silenciosos engolem erros no módulo roleplay
- **Onde:** `TrainingPlansTab.tsx:24`, `TrainingPlanView.tsx:48`, `RoleplayReport.tsx:34`, `PreparationQuiz.tsx:35,60`, `RoleplayPreparation.tsx:43`, `PreparationAudioPlayer.tsx:28`. Em `PreparationQuiz:60` o insert da tentativa de quiz falha em silêncio — candidato acha que passou mas nada é persistido. Logar + toast. **Esforço: small.** *(Relatado por duas lentes.)*

#### 45. Respostas de erro sem `Content-Type: application/json` nas funções admin
- **Onde:** `admin-create-user/index.ts:37,41,45,50,57,71,91,135` e `admin-reset-password/index.ts:18,22,26,33,38,41,50,89`. Só o sucesso inclui o header; erros saem como text/plain implícito. Usar helpers de `_shared/errors.ts`. **Esforço: small.**

#### 46. Chamadas de IA sem checar `response.ok` antes de parsear
- **Onde:** `generate-training-plan/index.ts:186-205`, `nps-csat-webhook/index.ts:36-37`. Num 4xx/5xx, o corpo é JSON de erro e cai no fallback silencioso, mascarando falha de config da IA. Adicionar `if (!aiResponse.ok)` + log de status. **Esforço: small.**

### Qualidade e processo

#### 47. Cobertura de testes essencialmente nula (apenas 1 teste trivial) ✅ confirmado
- **Onde:** `src/test/example.test.ts` (`expect(true).toBe(true)`), único teste em ~169 arquivos/30k linhas. Priorizar hooks de dados, parser SSE, cálculos de Analytics. **Esforço: large.**

#### 48. Funções cron sem try/catch de topo nem agendamento detectável ✅ confirmado
- **Onde:** `deal-monitor/index.ts:4`, `mtd-tracker/index.ts:4`, `performance-calculator/index.ts:4` — `Deno.serve` sem try/catch; exceção vira 500 opaco. `grep cron.schedule/net.http_post` nas migrations = 0; config.toml não lista as três (pg_cron pode estar no dashboard). Envolver em try/catch com log; versionar agendamento. **Esforço: medium.**

#### 49. Ausência de CI/CD — nenhum quality gate automatizado ✅ confirmado
- **Onde:** `.github/` só contém `agents/`, sem `workflows/`. `netlify.toml:2` faz `npm run build` direto, sem lint/test/audit; sem husky/hooks. Criar `ci.yml` com `npm ci`, lint, test, `tsc --noEmit`, `npm audit --audit-level=high`. **Esforço: medium.**

#### 50. Vulnerabilidades em dependências de produção (lodash, react-router, ws, picomatch) ✅ confirmado
- **Onde:** `package.json:66` + node_modules. `npm audit --omit=dev` = 4 (3 moderate, 1 high); completo = 10. O HIGH em prod é lodash transitivo via recharts (vetor `_.template` não exposto). DoD exige "sem Critical/High". `npm audit fix`. **Esforço: small.**

#### 51. Dois lockfiles conflitantes (`bun.lock` + `package-lock.json`) e peer inválido do vite
- **Onde:** `bun.lock` (158KB), `package-lock.json` (306KB), `.npmrc:1` (`legacy-peer-deps=true`), `package.json:90,95`. `vite@8.0.0` viola peer de `lovable-tagger` (`>=5 <8`). Escolher um gerenciador; resolver o peer em vez de mascarar. **Esforço: small.**

#### 52. Modelos de IA hardcoded e dispersos por múltiplas funções
- **Onde:** `roleplay-chat:234-252`, `roleplay-evaluate:258-274`, `commercial-report:217-246`, `predictive-ai:95`, `nps-csat-webhook:28`, `knowledge-import:51`, `analyze-meeting:77`. Strings divergentes para o mesmo provedor; lógica `isLovable/getProvider` duplicada. Extrair `_shared/ai.ts`. **Esforço: medium.**

---

## 🔵 Baixos

### Bugs e env

#### 53 e 54. Chat público de seleção usa env var inexistente (`Bearer undefined`) ✅ confirmado (rebaixado de critical → low)
- **Onde:** `PublicSelectionSessionChat.tsx:112,178` usam `VITE_SUPABASE_ANON_KEY` (inexistente; resto do app usa `VITE_SUPABASE_PUBLISHABLE_KEY`). Como `roleplay-chat`/`roleplay-evaluate` têm `verify_jwt=false` e não leem o header, o fluxo ainda funciona — defeito de consistência, não quebra de runtime. Trocar pela var correta. **Esforço: trivial.** *(Dois achados idênticos.)*

#### 55. Erro de digitação no `.select` da query de pipelines (parêntese extra)
- **Onde:** `use-deals.tsx:162` — `.select('*, pipeline_stages(*))')`. PostgREST tolera hoje, mas pode falhar com parser mais estrito e derrubar o Kanban. Corrigir para `(*)`. **Esforço: trivial.**

#### 56 e 57. `config/env.ts` é dead code com a env var errada (landmine latente)
- **Onde:** `src/config/env.ts:3`. Sem imports; o primeiro a usá-lo terá undefined silencioso. Remover ou corrigir e adotar como fonte única. **Esforço: trivial.** *(Sobreposto aos achados 15/17.)*

#### 58. Mutation `markRead` sem tratamento de erro (`unread_count` pode nunca zerar)
- **Onde:** `use-conversations.tsx:116-128` — sem `onError`; com polling de 5s, badge de não-lidas fica preso. Adicionar onError/log; idealmente mover marcação para o backend. **Esforço: trivial.**

#### 59. `NotificationBell` faz `window.location.href = n.link` sem validação (open redirect)
- **Onde:** `NotificationBell.tsx:104` — navega para link do banco sem validar interno/esquema (`javascript:`/`data:`). Validar que começa com `/` ou usar `navigate`. **Esforço: trivial.**

### RLS e banco

#### 60. Policies de `appointments` e `contact_products` sem cláusula `TO` (aplicam ao role public/anon)
- **Onde:** `20260508000001_appointments_table.sql:36-60`, `20260508000003_contacts_churn_upsell_products.sql:32-55`. Omite `TO authenticated`; o USING com subquery mitiga o vazamento direto, mas amplia a superfície e inlina a subquery em vez de usar `is_member_of_workspace()`. **Esforço: small.**

#### 61. Mistura inconsistente de padrões de RLS entre migrations Lovable e de story
- **Onde:** `supabase/migrations/` (geral). Helpers SECURITY DEFINER vs subqueries inline em `workspace_members` (risco de reintroduzir recursão de RLS, ver `20260320203308`). Algumas tabelas só ganharam FORCE tardiamente na `20260505000001`. Padronizar nos helpers. **Esforço: medium.**

### Qualidade, tipagem e config

#### 62. eslint desliga `no-unused-vars` e não tem `no-explicit-any` — gate fraco
- **Onde:** `eslint.config.js:23` (`"@typescript-eslint/no-unused-vars": "off"`). Reativar como warn + adicionar `no-explicit-any: warn`; rodar lint no CI. **Esforço: trivial.**

#### 63. CSP permite `unsafe-inline` e `unsafe-eval` em `script-src`
- **Onde:** `netlify.toml:20`. Enfraquece a proteção XSS. Avaliar remover `unsafe-eval` e migrar inline para nonce/hash. **Esforço: medium.**

#### 64. QueryClient sem configuração de defaults (retry, staleTime, error handling global)
- **Onde:** `App.tsx:63` (`new QueryClient()` inline, sem `defaultOptions`); não há `lib/query-client.ts`. Centralizar política de cache/retry e onError. **Esforço: small.**

#### 65. Dois sistemas de toast coexistindo (sonner e shadcn use-toast)
- **Onde:** `App.tsx:3-4` montam ambos; 45 arquivos importam `sonner`, 18 usam `use-toast`. Bundle maior + UX inconsistente. Migrar para sonner. **Esforço: medium.**

#### 66. `src/features/` morta — arquitetura documentada nunca implementada
- **Onde:** `src/features/` (só README); `src/app/` não existe. Alinhar CLAUDE.md à estrutura real ou migrar de fato. **Esforço: small.**

#### 67. Formatação de moeda BRL duplicada em ~9 arquivos
- **Onde:** `Team.tsx:30`, `Forecast.tsx:13`, `ForecastHistoryChart.tsx:19`, `DealDetailSheet.tsx:92`, `KanbanCard.tsx:31`, `KanbanColumn.tsx:19`, `PipelineReview.tsx:201`. `src/lib/utils.ts` só tem `cn`. Adicionar `formatBRL()`. **Esforço: small.**

#### 68. ~50 imports e variáveis declarados e nunca usados (TS6133)
- **Onde:** `App.tsx:23`, `Analytics.tsx:19/30/91/218/228/446` (constantes mortas como `COHORT_COLORS`), `APISettingsTab.tsx`, e ~40 outros. `noUnusedLocals` não barra porque o build não roda tsc. Rodar `tsc --noEmit`/eslint e limpar. **Esforço: small.**

#### 69. Uso disseminado de `as any` mascarando tipos do schema (34 ocorrências no front)
- **Onde:** `ChatPanel.tsx:150`, `Pipeline.tsx:124`, `PipelineReview.tsx:69,76`, `use-companies.tsx:50`, `Settings.tsx:397,531,643`, vários em roleplay/. Desliga a checagem onde o schema pegaria erro. **Esforço: medium.**

#### 70. 121 usos de `any` contrariando "TypeScript strict, sem any"
- **Onde:** `Meetings.tsx` (10), `RoleplayReport.tsx` (10), `IntegrationsSettingsTab.tsx` (8), `TrainingPlanView.tsx` (7), `Team.tsx` (6), + ~30 arquivos. Tratar como dívida incremental após regenerar `types.ts`. **Esforço: medium.**

#### 71. Cobertura de testes inexistente apesar de exigida na DoD
- **Onde:** `src/test/example.test.ts` (único). Sobreposto ao achado 47; foco em lógica pura de forecast/feature-flags/Analytics. **Esforço: medium.**

#### 72. OPTIONS/preflight ausente em 4 funções
- **Onde:** `deal-monitor`, `mtd-tracker`, `performance-calculator`, `meetings-oauth-callback`. Para os crons o impacto é baixo; `meetings-oauth-callback` é chamado do src (2x). Adicionar handler. **Esforço: trivial.**

---

## 🎯 Plano de ação priorizado

### Quick wins (trivial/small, alto impacto)

1. **[CRÍTICO #1]** ENABLE RLS em `quotes`, `custom_fields`, `custom_field_values`, `ai_predictions` — migration imediata, fecha vazamento total cross-tenant. *(trivial)*
2. **[CRÍTICO #4]** Remover `verify_jwt=false` de `commercial-report`/`knowledge-import` ou exigir segredo de serviço. *(small)*
3. **[ALTO #11]** Tornar `META_APP_SECRET` obrigatória (bloquear fail-open) + comparação de tempo constante no `meta-wa-webhook`. *(small)*
4. **[MÉDIO #35]** Parar de logar `JSON.stringify(body)` com PII em zapi/meta/lead-intake. *(trivial)*
5. **[BAIXO #55]** Corrigir parêntese extra em `use-deals.tsx:162` (protege o Kanban). *(trivial)*
6. **[BAIXO #53/54]** Trocar `VITE_SUPABASE_ANON_KEY` por `VITE_SUPABASE_PUBLISHABLE_KEY` no chat público. *(trivial)*
7. **[MÉDIO #28/29]** Restaurar `SET search_path = public` em `update_updated_at_column`, `is_superadmin`, `hybrid_search`. *(trivial)*
8. **[MÉDIO #50 / #51]** `npm audit fix` + resolver lockfiles/peer do vite. *(small)*
9. **[MÉDIO #31/#32/#33/#34/#38]** Endurecer funções: remover fallback legado de superadmin, validar caller em `meta-wa-send`, sanitizar `.or()`, generalizar erros ao cliente, aplicar rate limit nas funções de IA. *(small cada)*
10. **[BAIXO #59 / #58 / #62]** Validar `n.link` em NotificationBell, `onError` em `markRead`, reativar regras de lint. *(trivial)*

### Investimentos maiores (medium/large, em ordem de prioridade)

1. **[CRÍTICO #2 e #3]** Adicionar autenticação + checagem de membership (`is_member_of_workspace`) a todas as Edge Functions com `service_role` que confiam em ids do corpo (roleplay-chat/evaluate, flow-engine, routing-engine, nps-send, generate-quote-pdf, predictive-ai, analyze-meeting, lead-scorer). *(medium)* — **a maior fonte de risco multi-tenant.**
2. **[CRÍTICO #5]** Migration de reconciliação para `api_tokens`/`inbound_webhooks` (hashing real + policies só-admin + rotação). *(medium)*
3. **[ALTO #8/9 e #10]** Validar origem do `zapi-webhook` (Client-Token) e assinar/validar o `state` do OAuth de meetings + allowlist de redirect. *(medium)*
4. **[ALTO #12]** Adicionar `tsc` ao build/CI e corrigir os 316 erros em lote — desmascara bugs de schema. *(large)*
5. **[MÉDIO #49]** Criar CI/CD mínimo (lint + test + tsc + audit + build) bloqueando merge. *(medium)*
6. **[ALTO #7]** Migrar segredos (Z-API, Meta, IA) para Vault/coluna criptografada e tirá-los do frontend. *(large)*
7. **[ALTO #14]** Resolver `preparation-quiz`/`roleplay-import` (criar funções ou corrigir chamadas) + smoke test de nomes invocados. *(medium)*
8. **[ALTO #6]** Hashear `api_tokens` e remover a policy "Members can view". *(medium)*
9. **[MÉDIO #20/#22/#23/#24/#25/#26/#27/#52]** Introduzir camada de serviço por domínio + hooks TanStack Query, quebrar componentes-gigantes, consolidar `_shared/ai.ts` e helpers de CORS/erro. *(large)*
10. **[MÉDIO #47]** Suíte de testes para a lógica pura de maior risco (forecast, parser SSE, cálculos de Analytics). *(large)*

---

## 📌 Notas específicas de origem Lovable

Os achados desenham um perfil consistente de código gerado por Lovable, com armadilhas recorrentes que valem atenção em qualquer revisão futura deste repositório:

- **RLS aplicado de forma incompleta/silenciosa.** O caso `FORCE` sem `ENABLE` (#1) e as policies sem `TO authenticated` (#60) mostram que o RLS é configurado por padrão, mas com lacunas que passam despercebidas porque o banco não reclama. Tabelas iniciais só ganharam `FORCE` tardiamente (#61). Sempre validar `relrowsecurity = true` por tabela, não confiar na presença de policies.
- **Migrações que falham em silêncio.** `CREATE TABLE IF NOT EXISTS` usado para "alterar" schema de tabela existente (#5) é o anti-padrão mais perigoso: a story acredita ter aplicado a correção, mas o banco continua no estado antigo. O `types.ts` gerado é a fonte de verdade do que realmente foi deployado — sempre cruzar.
- **Edge Functions com `service_role` confiando no corpo.** Padrão repetido em mais de uma dezena de funções (#2, #3, #4, #32): `service_role` (BYPASSRLS) + `workspace_id`/`deal_id` lidos do body sem checar membership. Existem os helpers corretos (`_shared/auth.ts`, `is_member_of_workspace`) e funções que os usam bem (copilot-suggest, lead-scorer) — o problema é a aplicação inconsistente.
- **Drift entre documentação e código.** O CLAUDE.md descreve arquitetura `features/`, camada `config/env.ts`, `lib/query-client.ts`, testes e "strict sem any" — nada disso existe de fato (#15, #20, #22, #66, #64, #47, #12). Doc aspiracional tratada como descritiva induz humanos e agentes a erro.
- **Confusão de nomenclatura de env.** Três nomes para a mesma chave Supabase (`ANON_KEY` vs `PUBLISHABLE_KEY` vs montagem por `PROJECT_ID`) geram código morto e bugs latentes de `Bearer undefined` (#15, #16, #17, #18, #53/54).
- **Duplicação massiva por ausência de camadas.** URL do Supabase hardcoded em ~7 lugares, fetch a Edge Functions copiado em ~19 arquivos, `corsHeaders` reinventado em 22 funções, formatação BRL em 9, modelos de IA em 10 (#19, #24, #25, #26, #27, #52, #67). Falta de camada de serviço e de helpers compartilhados é a raiz.
- **Quebras silenciosas.** `catch {}` vazios engolindo inserts importantes (#43/44), mutations sem `onError` (#58), respostas de IA sem checar `.ok` (#46), só 4 `console.*` no projeto inteiro — falhas ficam invisíveis, sem ErrorBoundary por rota nem Sentry (#21).
- **Garantia de qualidade ausente.** Build sem type-check (316 erros em prod), 1 teste trivial, nenhum CI, lint com regras desligadas (#12, #47, #49, #62). Nada impede regressão de chegar à produção via deploy automático do Netlify.

Recomendação geral: tratar primeiro o bloco de isolamento de tenant (críticos #1–#5 e altos #6–#11), pois comprometem a confidencialidade entre clientes; em paralelo, instalar o gate mínimo de CI com type-check, que transforma boa parte dos achados médios/baixos em barreira automática antes da migração para o DB unificado da Heziom.