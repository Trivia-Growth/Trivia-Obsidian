
## Relatório de Security Gate — HeziomOS

**Data:** 2026-06-16 | **Auditoria por:** Cipher (@security)

---

## Veredicto Geral: **CONCERNS**

O projeto demonstra maturidade de segurança acima da média para um sistema desse estágio. As regras arquiteturais estão implementadas onde mais importam. Os findings abaixo são reais e exploráveis, não teóricos — nenhum é CRITICAL, mas os HIGH exigem correção antes de processar dados de clientes em volume.

---

## Achados por Categoria

### HIGH

**H1 — `temp_password` retornado em plain-text na resposta HTTP da Edge Function**

- **Onde:** `/supabase/functions/crm-admin-create-user/index.ts` linha 128
- **O que:** A resposta `201` inclui `{ "temp_password": "AbCd23!7" }`. A senha temporária trafega em plain-text via HTTP response, é recebida pelo frontend (`Team.tsx:163`, `Admin.tsx:645`, `SuperadminsPanel.tsx:122`) e armazenada em React state.
- **Risco real:** Qualquer middleware (proxy, CDN, logging de request/response na Supabase ou Netlify), ou uma aba do DevTools aberta, expõe a senha temporária. Em Netlify, o log de funções e o log de edge pode capturar esse payload. O mais grave: se a Supabase ou qualquer ferramenta de APM estiver logando response bodies, isso vira PII em repouso em sistema de terceiro.
- **Correção:** Não retornar a senha na response. Em vez disso: (1) enviar o magic link via email — o Supabase Auth já suporta `generateLink()` para isso sem precisar de senha temporária; ou (2) se a senha temporária for necessária por UX, enviar exclusivamente por email (Resend já está integrado) e retornar apenas `{ "user_id": "...", "email": "...", "message": "Credenciais enviadas por e-mail" }`. Remover `temp_password` do payload JSON de resposta.

---

**H2 — `crm-nps-csat-webhook`: endpoint público sem autenticação processa dados de clientes e aciona IA com custo financeiro**

- **Onde:** `/supabase/functions/crm-nps-csat-webhook/index.ts`
- **O que:** O endpoint aceita qualquer request sem validar autenticação — apenas checa `survey_id` (UUID). O UUID é usado como "capability token" (segurança por obscuridade). O endpoint aciona OpenAI (`gpt-4o-mini`) para categorizar o comentário, gerando custo por chamada.
- **Risco real:** (a) Enumeração de UUIDs — baixíssima probabilidade, mas não zero para UUIDs gerados com fraqueza; (b) mais relevante: um atacante que tenha interceptado um survey_id válido (link de email não-expirado) pode reusar a URL para spam de chamadas OpenAI. O anti-replay existe (`if (survey.score != null)` → 409), mas protege apenas o recurso de dado, não o custo de IA — a chamada `categorizeWithAI(comment)` ocorre **antes** da checagem de `survey.score`.
- **Correção:** Mover `categorizeWithAI()` para **depois** da validação anti-replay. Com essa inversão, surveys já respondidos retornam 409 imediatamente sem chamar a IA. Adicionar rate limit por IP no endpoint (`checkRateLimit` já existe em `_shared/rate-limit.ts` — basta aplicar). Custo de implementação: ~10 linhas.

---

**H3 — CORS `*` (wildcard) em Edge Functions com autenticação JWT**

- **Onde:** Mais de 20 funções: `crm-meetings-oauth-start`, `crm-flow-engine`, `crm-whatsapp-router` (parcialmente), `crm-initialize-workspace`, `crm-predictive-ai`, `crm-roleplay-voice-token`, `crm-admin-create-user`, etc.
- **O que:** `"Access-Control-Allow-Origin": "*"` combinado com `Authorization: Bearer <JWT>` cria uma superfície para ataques de Cross-Site Request Forgery em contextos específicos, e viola o princípio de menor exposição.
- **Risco real:** Browsers modernos bloqueiam cookies com `SameSite=Strict` em requisições cross-origin, mas o padrão aqui é `Authorization header`, não cookie — então o risco de CSRF clássico é baixo. O risco real é outro: um site malicioso pode chamar essas funções usando o token JWT da vítima **se** o token for acessível (ex: `localStorage`, XSS). O `*` amplia a superfície. Para funções de webhook de terceiros (Z-API, Mandae, Logmanager), CORS wildcard é necessário e correto. Para funções chamadas pelo frontend autenticado, não.
- **Correção:** Substituir o CORS `*` hardcoded pelos módulos-chave (`crm-admin-create-user`, `crm-initialize-workspace`, `crm-predictive-ai`, `crm-roleplay-voice-token`, `crm-meetings-oauth-start`) pela função `corsHeaders()` já existente em `_shared/cors.ts` — que aceita apenas `https://triviacrmatende.netlify.app`. Webhooks de terceiros continuam com `publicCorsHeaders`. O utilitário já existe, é só aplicar consistentemente.

---

### MEDIUM

**M1 — `RouteGuard` depende de dado do lado do cliente para RBAC (race window)**

- **Onde:** `/apps/web/src/shell/RouteGuard.tsx`
- **O que:** O papel (`workspace.role`) é carregado via `useWorkspace()` que faz query ao banco. Durante `loading=true`, o componente retorna `null` — não redireciona, não bloqueia, apenas não renderiza. Se a query demorar ou falhar silenciosamente, o comportamento é indeterminado.
- **Risco real:** Isto é **frontend-only RBAC** — o real controle de acesso está nas RLS policies e na lógica das Edge Functions. Um atacante com acesso direto à API (Supabase URL + anon key, que é pública) não é bloqueado pelo `RouteGuard`. O risco real é limitado, mas: (a) um usuário removido de um workspace pode ter uma janela de acesso visual enquanto o cache do React Query não expira; (b) se `workspace` for `null` por qualquer motivo de erro de rede, `meetsRole(undefined, rule.minRole)` pode ter comportamento inesperado dependendo da implementação de `meetsRole`.
- **Correção:** Verificar a implementação de `meetsRole` quando `workspace` é `null` — garantir que retorna `false` (bloqueio, não permissão). Adicionar timeout ou fallback explícito no `loading` state. Documentar que este guard é UX-only e que o enforcement real é server-side (já está na arquitetura, só precisa de documentação explícita).

---

**M2 — `active_workspace_id` em `localStorage` sem validação server-side na troca**

- **Onde:** `/apps/web/src/features/crm/hooks/use-workspace.tsx` linhas 84-92
- **O que:** O `active_workspace_id` é lido do `localStorage` e usado para selecionar qual workspace carregar. Não há validação de que o usuário autenticado tem membership no workspace salvo antes de usá-lo como "ativo".
- **Risco real:** Baixo, porque as RLS policies validarão no banco — mas um usuário que foi removido de um workspace ainda tem o ID salvo no browser. Ele pode ver a UI do workspace por uma sessão inteira até a query falhar. Potencial para confusão de contexto, não exfiltração de dados.
- **Correção:** Após buscar os workspaces do usuário, validar que o `savedId` existe na lista retornada pelo banco (já feito em `list.find((w) => w.id === savedId)`) antes de usá-lo. Se não encontrar, limpar o `localStorage` e usar o primeiro da lista. O código já faz isso parcialmente — mas não limpa o valor stale do localStorage quando o workspace não está mais acessível.

---

**M3 — Rate limiter "fail-open" em produção**

- **Onde:** `/supabase/functions/_shared/rate-limit.ts` linhas 32-34
- **O que:** Se a query ao banco falha, o rate limiter retorna `{ allowed: true }` — ou seja, qualquer falha de banco desabilita o rate limiting completamente.
- **Risco real:** Em cenário de stress ou ataque de DB DoS, o rate limiter para de funcionar exatamente quando mais seria necessário. Para funções com custo de IA (`crm-ai-orchestrator`, `crm-predictive-ai`), isso pode resultar em custo financeiro não controlado.
- **Correção:** Em caso de erro de DB, retornar `{ allowed: false }` para funções de IA. Para outros contextos (leads, webhooks), fail-open pode ser aceitável. Adicionar parâmetro `failOpen: boolean` ao `checkRateLimit` e passar `false` nas funções de IA.

---

**M4 — `hub.*` tabelas de pedidos sem isolamento por tenant (qualquer usuário autenticado lê)**

- **Onde:** `/supabase/migrations/0002_hub_schema.sql` linhas 470-478
- **O que:** `pedidos_vendor`, `pedidos_itens`, `orders`, `amazon_purchase_orders`, `shipments`, `tracking_events`, `shipment_trackings` têm políticas como `FOR SELECT TO authenticated USING (true)` — sem filtro de tenant.
- **Risco real:** Qualquer usuário autenticado no Supabase pode ler pedidos de outros tenants (se o Hub for multi-tenant). Se o Hub é single-tenant (só a Heziom usa), o risco é mitigado. Mas a arquitetura define `hub.user_roles` com workspace isolation — a inconsistência existe.
- **Correção:** Verificar se o Hub é single ou multi-tenant. Se multi-tenant, adicionar filtro por `workspace_id` ou equivalente nas policies de SELECT para as tabelas de pedidos. Se single-tenant, documentar explicitamente que `authenticated` equivale a "funcionário Heziom" e o acesso aberto é intencional.

---

### LOW

**L1 — `constantTimeEqual` duplicada em dois módulos compartilhados**

- **Onde:** `_shared/auth.ts:27` e `_shared/crypto.ts:2` — implementações diferentes, mesmo propósito
- **O que:** `auth.ts` define `constantTimeEqual` como função privada. `crypto.ts` exporta uma implementação idêntica. `crm-zapi-webhook` importa de `crypto.ts`, `auth.ts` usa a sua local.
- **Risco:** Mínimo hoje, mas divergência futura pode criar timing oracle se uma das versões for modificada incorretamente.
- **Correção:** Remover a duplicata de `auth.ts` e importar de `crypto.ts` onde necessário.

---

**L2 — `VITE_DEV_ADMIN_EMAIL` e `VITE_DEV_ADMIN_PASSWORD` expostos em variáveis VITE_**

- **Onde:** `/apps/web/.env.local` e `vite-env.d.ts`
- **O que:** Variáveis com prefixo `VITE_` são **injetadas no bundle do cliente** pelo Vite. A senha está vazia, mas a estrutura existe e pode ser preenchida descuidadamente.
- **Risco:** Baixo agora (senha vazia), mas a convenção de nomear credenciais de admin com `VITE_` é perigosa. Se alguém preencher `VITE_DEV_ADMIN_PASSWORD=xyz123` em desenvolvimento, esse valor vai para o bundle.
- **Correção:** Remover essas variáveis do frontend completamente. Credenciais de dev admin devem existir apenas fora do código (ex: anotação local). Remover as declarações de `vite-env.d.ts`.

---

**L3 — `crm-nps-csat-webhook` e outros webhooks aceitam request sem validar tamanho do body**

- **Onde:** Vários webhooks públicos
- **O que:** Sem `Content-Length` check ou limite explícito de tamanho de payload, é possível enviar payloads grandes para consumir memória/tempo de execução.
- **Risco:** Baixo — Edge Functions têm timeout e limite de memória configurado pela Supabase. Mas a ausência de validação de tamanho é má prática.
- **Correção:** Adicionar `if (req.headers.get('content-length') && parseInt(req.headers.get('content-length')!) > 65536) return new Response(..., { status: 413 })` nos webhooks públicos.

---

## O que está correto (pontos positivos explícitos)

1. **Sem service_role_key no frontend.** Os três clientes (`supabase`, `crmSupabase`, `hubSupabase`) usam exclusivamente `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key). Pesquisa no código-fonte confirma zero ocorrências de `SUPABASE_SERVICE_ROLE_KEY` no `apps/web/src/`.
    
2. **RLS FORCE em todos os schemas.** `crm`, `hub`, `audit`, `financeiro`, `config`, `lgpd`, `lit_mirror` — todos com `FORCE ROW LEVEL SECURITY`. Nenhuma tabela encontrada sem RLS.
    
3. **`audit.*` genuinamente append-only.** O schema de audit implementa `AS RESTRICTIVE FOR UPDATE USING (false)` e `FOR DELETE USING (false)` — não apenas omite políticas de update/delete, mas as bloqueia ativamente com policies restritivas. Correto.
    
4. **`constantTimeEqual` em comparações de tokens.** Tanto o `Client-Token` do Z-API quanto o `CRON_SECRET` são comparados com algoritmo de tempo constante. Timing attacks prevenidos.
    
5. **OAuth CSRF protegido.** `crm-meetings-oauth-start` gera nonce server-side e persiste em banco antes de redirecionar. O callback valida e consome o nonce. Implementação correta.
    
6. **`crm-admin-create-user` valida superadmin no servidor.** Não confia em claims do token — faz `supabase.rpc("is_superadmin")` que consulta a tabela de superadmins no banco.
    
7. **Crypto segura para senhas temporárias.** Usa `crypto.getRandomValues()` (CSPRNG), não `Math.random()`. O comentário no código referencia a história que corrigiu isso — evidência de awareness de segurança.
    
8. **Zod + validação de input nas funções principais.** `crm-whatsapp-router` usa `z.object()` com UUID validation e `max(4096)` para o content.
    
9. **`.env` e `.env.local` no `.gitignore`.** Confirmado. Nenhum segredo real encontrado no código rastreado pelo git (os valores em `.env` estão vazios; `.env.local` tem URL e anon key públicas, que é o padrão Supabase).
    
10. **`requireAuth` nunca confia no body para identificar o usuário.** O comentário no código é explícito: _"NUNCA confiar em dados do body para identificar o usuário"_ — implementação consistente com esse princípio.
    

---

## Top 3 Ações Imediatas

**#1 (H1) — Remover `temp_password` da response HTTP.** Risco de exposição via logs de APM/CDN é real. Custo de correção: mínimo. Enviar a senha apenas por email (já implementado via Resend) e remover do JSON de resposta.

**#2 (H2) — Mover `categorizeWithAI()` para depois da checagem anti-replay.** Uma linha de código move o custo de IA para depois do guard. Protege contra replay com custo financeiro sem nenhum tradeoff.

**#3 (H3) — Aplicar `corsHeaders()` restrito nas funções chamadas pelo frontend.** O utilitário `_shared/cors.ts` já existe e restringe a origem. Substituir o `"Access-Control-Allow-Origin": "*"` hardcoded nas funções de negócio (não nos webhooks de terceiros) é uma mudança de configuração com zero impacto funcional para usuários legítimos.

---

— Cipher, think like an attacker. Build like a defender. 🛡️
# Revisão Arquitetural — HeziomOS (2026-06-16)

**Aria / @architect — TRIVIAIOX**

---

## Avaliação Geral: Aceitável com tendência a Sólida

A arquitetura reflete decisões técnicas corretas e bem documentadas. O conjunto ADR-0001 a ADR-0012 cobre os vetores de risco relevantes e as escolhas (TanStack Router, schemas por domínio, 3 clientes Supabase, Edge Functions + Inngest diferido) são defensáveis. O que mantém a nota em "Aceitável" e não "Sólida" são três problemas concretos que se acumularão antes do lançamento: o padrão de auth guard no Hub é inconsistente e manual (risco de rota desprotegida em produção), o _shared das Edge Functions tem adoção parcial com CORS inlined em pelo menos 61 funções, e o `@heziom/shared` existe mas entrega quase nada (4 schemas Zod genéricos). Nenhum desses é bloqueador hoje, todos viram bloqueadores na Fase 2.

---

## Pontos Fortes Arquiteturais

**Separação de schemas PostgreSQL (ADR-0004) é exemplar.** Domínio operacional, espelho e governança em schemas distintos com RLS FORCE e `audit.*` append-only é o nível correto de controle para um sistema financeiro. A migração `0009_expose_schema_grants.sql` garante que apenas `crm`, `hub` e `audit` estão expostos via PostgREST — não sobram brechas públicas.

**O `_shared/auth.ts` das Edge Functions está correto.** A distinção entre `requireAuth` (JWT do usuário), `isServiceRoleCaller` (service_role key como secret compartilhado) e `isCronCaller` (x-cron-secret via pg_net) com comparação em tempo constante é a implementação certa. Quem errou essa parte comprometeu segurança; aqui está feito adequadamente.

**TanStack Router com file-based routing é a escolha certa para este volume.** 78 route files, `routeTree.gen.ts` gerado automaticamente, `_crm.tsx` como layout pathless com `RequireAuth + WorkspaceProvider + AppLayout` — a estrutura CRM está bem modelada. O `$.tsx` (global catch-all) e `hub.$.tsx` (hub catch-all) estão presentes.

**ADR-0003 sobre Edge Functions + Inngest diferido é pragmaticamente correto.** Não forçar Inngest na Fase 1 e cobrir tudo com Edge Functions stateless foi a decisão certa. O `crm-flow-engine` demonstra o limite da abordagem (workflows de automação com nós `wait` gerenciados por cron) e confirma que Inngest é necessário na Fase 2 — mas a arquitetura atual não está incorreta, está no limite previsto.

**Documentação arquitetural de alta qualidade.** 12 ADRs com contexto, alternativas descartadas e consequências explícitas. O `docs/PROJECT.md` como documento vivo é raras vezes visto em projetos desta maturidade. A pendência P1 (conflito token Tray) estar registrada formalmente indica higiene arquitetural.

---

## Riscos e Gaps

### Alto

**Hub sem layout pathless de auth — `RequireAuth` manual por rota.**

- Onde está: Hub tem 30 route files (`hub.*.tsx`). O CRM usa um layout pathless `_crm.tsx` que aplica `RequireAuth` uma vez para todas as 48 rotas filhas. O Hub não tem equivalente — cada rota define `RequireAuth` individualmente nos componentes (hub.index.tsx, hub.pedidos.tsx, hub.mercadolivre.tsx etc).
- Consequência real: `hub.auth.tsx`, `hub.reset-password.tsx` e possivelmente outras rotas Hub não têm o guard. Qualquer nova rota Hub adicionada sem o `RequireAuth` manual vai para produção desprotegida. Como o guard está no nível do componente e não da route, falhas silenciosas são prováveis — a rota renderiza sem session e falha na query, não redireciona para login.
- Recomendação: Criar `_hub.tsx` como layout pathless espelhando `_crm.tsx`. Todas as rotas `hub.*` (exceto `hub.auth.tsx` e `hub.reset-password.tsx`) passam a ser `_hub.hub.*`. Elimina os 20+ `RequireAuth` inline e fecha a superfície de ataque de forma estrutural. Isso é uma história de 1 ponto.

**CORS da `_shared/cors.ts` referencia domínio morto e tem adoção quase zero.**

- Onde está: `/supabase/functions/_shared/cors.ts` linha 1 — `ALLOWED_ORIGINS = ["https://triviacrmatende.netlify.app"]`. O app está em `heziomos.netlify.app`. Apenas 9 funções das 77 importam essa utilidade; as demais 61+ definem `corsHeaders = { "Access-Control-Allow-Origin": "*" }` inline.
- Consequência real: duas consequências distintas. (1) A `_shared/cors.ts` está configurada para o domínio errado — qualquer função que a use vai bloquear requisições do app real em produção. (2) As 61 funções com `*` wildcard aceitam requisições de qualquer origem, o que é problemático para endpoints que aceitam JWT de usuário (qualquer site pode fazer chamadas autenticadas em nome do usuário via CORS).
- Recomendação: (1) Atualizar `ALLOWED_ORIGINS` para `["https://heziomos.netlify.app"]` agora — é uma linha. (2) Para funções com JWT de usuário, migrar para `corsHeaders(req.headers.get("origin"))` do _shared. Funções de webhook público (Meta, Z-API, pg_cron) ficam com `*` legitimamente. Separar os dois casos explicitamente.

### Médio

**`@heziom/shared` é um placeholder — não cumpre sua função arquitetural.**

- Onde está: `packages/shared/src/` tem `index.ts`, `schemas.ts` (4 schemas Zod genéricos: uuid, email, dateRange, pagination) e `types.ts`. O monorepo inteiro tem apenas 2 arquivos que importam de `@heziom/database` — e `@heziom/shared` tem zero importações encontradas no `apps/web/src`.
- Consequência real: cada Edge Function e cada feature frontend redefine validação própria (Zod inline) sem compartilhamento. Na Fase 2 com WhatsApp, agentes e financeiro, isso vira drift de contrato entre frontend e Edge Functions sem mecanismo de detecção.
- Recomendação: Mover para `@heziom/shared` os schemas Zod que são compartilhados entre Edge Functions e frontend: `ContactSchema`, `WorkspaceSchema`, `PaginationSchema` (já existe mas não é usada), `DealSchema`. Não refatorar tudo de uma vez — adicionar à medida que cada domain area entra em Fase 2.

**`useParams({ strict: false })` em 16 pontos — perde type-safety em params.**

- Onde está: 16 ocorrências no `apps/web/src`. O ADR-0011 reconhece isso como limitação da migração.
- Consequência real: refatorações de URL que mudam o nome de parâmetros dinâmicos (`:id` → `:sessionId`, por exemplo) não produzem erro de compilação — falham em runtime. Na Fase 2 com mais rotas aninhadas de roleplay, vendor e agentes, o risco sobe.
- Recomendação: Migrar para `Route.useParams()` por rota nas 6-8 rotas mais críticas (roleplay, vendor, flows). Não precisa ser tudo de uma vez — priorizar rotas com lógica de negócio relevante.

**Migration `0008_fix_frontend_schema_gaps.sql` revela processo de schema.**

- Onde está: A migration se chama explicitamente "fix_frontend_schema_gaps" e repõe colunas que foram perdidas na migração do monorepo. O comentário interno menciona avaliar dropar colunas (`cluster_name`/`rules_json`/`priority`) numa migração futura.
- Consequência real: O schema atual tem colunas órfãs em `crm.cluster_rules` (colunas antigas + novas coexistindo) sem cleanup. Antes de Fase 2 adicionar tabelas de agentes/financeiro, o schema precisa estar limpo.
- Recomendação: Criar `0010_schema_cleanup.sql` que dropa as colunas órfãs de `cluster_rules` e faz o inventory de qualquer outra tabela com estrutura duplicada. Tarefa para @data-engineer.

**Conflito de token Tray (P1) sem ADR.**

- Onde está: Pendência P1 no `docs/PROJECT.md` — "Conflito token Tray (CAPI × HeziomOS) — centralizar ou separar apps". Não há ADR nem decisão registrada.
- Consequência real: O `crm-tray-sync` já está em cron (2h) e deployado. Se a decisão for "separar apps", a Edge Function atual pode precisar de refactor. Se for "centralizar", é apenas configuração. A ausência de ADR significa que a decisão pode ser feita ad-hoc e sem considerar as implicações de segurança (token compartilhado vs. token separado por domínio).
- Recomendação: Antes do próximo sprint que toque Tray, formalizar ADR-0013 cobrindo: quem detém o token OAuth Tray (CAPI ou HeziomOS), como renovar e onde armazenar. Esta decisão tem implicações de segurança (surface de ataque do token).

### Baixo

**`apps/web/src/components/` mistura componentes de domínio CRM com componentes de shell.**

- `components/conversations/`, `components/meetings/`, `components/crm/` são componentes de domínio CRM vivendo no diretório `components/` global, ao lado de `components/ui/` (shadcn) e `components/settings/`. O `features/crm/pages/Settings.tsx` importa de `@/components/settings/` — o que é correto mas a localização é ambígua.
- Consequência: não é crítico agora (single-tenant, um só frontend), mas quando Fase 2 adicionar módulos novos (financeiro, pessoas), a convenção de onde fica cada componente precisará ser explícita.
- Recomendação: Mover `components/conversations/`, `components/meetings/`, `components/crm/` para dentro de `features/crm/components/`. `components/settings/` pode ficar onde está como componente de shell cross-domain.

**`@heziom/ui` existe mas provavelmente duplica `apps/web/src/components/ui/`.**

- Não consegui confirmar se `@heziom/ui` tem conteúdo substantivo vs. ser placeholder, mas `apps/web/src/components/ui/` tem os componentes shadcn inline. Se ambos coexistem, qualquer atualização de design token precisa ser feita em dois lugares.
- Recomendação: Verificar o conteúdo de `packages/ui/src/`. Se for placeholder, documentar como TODO. Se tiver componentes, garantir que `apps/web` os consome em vez de duplicar.

---

## Dívida Técnica Crítica — Resolver Antes da Fase 2

Ordenado por urgência:

1. **`_shared/cors.ts` com domínio morto** — correção de 1 linha, risco imediato em produção para as 9 funções que a usam. `ALLOWED_ORIGINS = ["https://heziomos.netlify.app"]`. Fazer agora.
    
2. **Layout pathless `_hub.tsx`** — sem isso, cada nova rota Hub em Fase 2 é um potencial vetor de rota desprotegida. A criação do layout e re-estruturação das rotas Hub deve acontecer antes de adicionar rotas de financeiro ou agentes que cruzem domínios.
    
3. **Microsoft SSO (ADR-0006)** — o ADR explica o risco: se usuários reais entrarem com e-mail/senha e depois migrar para SSO, os UUIDs em `auth.users` mudam e invalidam todas as FKs de `created_by` em audit e tabelas operacionais. A configuração do Azure AD app registration precisa acontecer antes da entrada de usuários reais em produção. Não é código — é configuração e coordenação.
    
4. **ADR-0013 para token Tray** — sem decisão formalizada, o `crm-tray-sync` pode ser bloqueado por conflito de autenticação em produção sem plano de contingência documentado.
    
5. **Migração de cleanup de schema (`0010`)** — antes de Inngest Workers adicionarem tabelas ao schema `agents`, o schema precisa estar livre de colunas órfãs para não propagar a dívida.
    

---

## Próximas Decisões Arquiteturais que Precisarão ser Tomadas

**ADR-0013: Gestão de tokens OAuth de terceiros (Tray, Melhor Envio, MercadoLivre)**

A Fase 2 traz mais integrações OAuth. A decisão de como armazenar, renovar e isolar tokens de terceiros (no Vault do Supabase? em secrets do GitHub Actions? por função ou centralizado?) precisa ser tomada antes de escalar. O conflito Tray é o primeiro caso que força essa decisão.

**ADR-0014: Estratégia de cache para Dashboard CEO**

O `docs/PROJECT.md` indica que o Dashboard CEO está com "infraestrutura pronta, views materializadas pendentes". Quando o `lit_mirror` estiver operacional e alimentando dados, as queries de agregação financeira (DRE, MTD, previsões) vão precisar de estratégia de cache. A decisão envolve: materialized views com `pg_cron` refresh, Redis/Upstash para cache de API, ou TanStack Query com stale-time agressivo. Cada opção tem tradeoffs distintos de consistência vs. latência.

**ADR-0015: Inngest deployment e boundary com Edge Functions**

A Fase 2 vai forçar a decisão de onde rodam os workers Inngest (Fly.io vs. Railway vs. Supabase Edge Functions com streaming), como o frontend aciona workflows (diretamente via Inngest API ou via Edge Function intermediária), e qual é o boundary exato entre "operação Edge Function" e "operação Inngest". O `crm-flow-engine` já está no limite (loop de cron gerenciando state de workflow) — essa decisão precisa vir antes de WhatsApp e agente financeiro.

**Decisão tática: `@heziom/shared` como contrato de API**

Com Inngest workers sendo um runtime separado que também vai se comunicar com o Supabase, os tipos Zod em `@heziom/shared` se tornam o contrato entre três consumidores: frontend, Edge Functions e workers Inngest. A decisão é: `@heziom/shared` é source of truth de schemas (requer que Edge Functions Deno o consumam via URL ou bundle) ou cada runtime mantém cópia dos schemas validada por CI? Essa é uma decisão de DX com implicações de drift de contrato.

---

_Aria / @architect — revisão concluída. Nenhum problema estrutural bloqueador identificado para Fase 1. Dois itens de segurança (CORS com domínio morto, Hub sem layout pathless) devem ser resolvidos antes de usuários reais._

**Aria (@architect) — Aceitável com tendência a Sólida**

Dois achados críticos que se somam ao relatório da Cipher:

|Severidade|Item|
|---|---|
|**Alto**|`_shared/cors.ts` aponta para domínio morto `triviacrmatende.netlify.app` — 9 funções que a usam vão **bloquear requests do app real em produção**. Fix de 1 linha urgente.|
|**Alto**|Hub sem layout pathless `_hub.tsx` — guard de auth manual por rota, qualquer nova rota Hub sem `RequireAuth` vai pra prod desprotegida|
|Médio|`@heziom/shared` é placeholder — zero importações no app, Fase 2 vai sofrer sem contrato compartilhado|
|Médio|`useParams({ strict: false })` em 16 pontos — renomear params de URL não gera erro de compilação|
|**ADR faltando**|ADR-0013 para decisão do token Tray ainda não existe — P1 sem resolução formal|

**Dívida crítica antes da Fase 2**: CORS domínio morto (agora), layout `_hub.tsx` (antes de mais rotas Hub), Microsoft SSO (antes de usuários reais), ADR-0013 (antes do próximo sprint Tray).

O `_shared/cors.ts` com domínio errado é o achado mais imediato — já posso corrigir essa linha enquanto aguardamos Rex e Dex, se quiser.

# Relatório SRE — HeziomOS (2026-06-16)

**Avaliado por:** Rex (@reliability) **Escopo:** CI/CD, Edge Functions, cron jobs, banco de dados, frontend, monitoramento e continuidade operacional

---

## SLO Atual Estimado

Com base na arquitetura atual (sem monitoramento ativo configurado), a disponibilidade percebida é estimada em:

- **Frontend (Netlify):** ~99,5% — Netlify tem SLA próprio elevado, mas com deploy manual, qualquer build quebrado exige ação humana para rollback
- **Backend API (Supabase Edge Functions):** ~99,0% — Supabase Free/Pro tem SLA de 99,9%, mas Edge Functions sem retry automático ou circuit breaker reduzem a disponibilidade efetiva
- **Cron `crm-tray-sync`:** ~85-90% estimado — sem dead letter queue, sem alerta de falha, sem confirmação de execução bem-sucedida
- **SLO composto da plataforma:** ~98% — limitado pela ausência de monitoramento ativo

---

## Riscos de Continuidade

### CRITICO

**C1 — Conflito de token Tray (CAPI × HeziomOS) já em produção**

- **Cenário:** `refresh_token` da Tray é de uso único. Se `heziom-api` (sistema legado) e `crm-tray-sync` (cron 2h) chamam a mesma loja simultaneamente, um invalida o token do outro. Isso já aconteceu durante a sessão de ontem.
- **Impacto:** O cron falha silenciosamente. O CRM para de atualizar. Os 112 contatos e R$135k em compras ficam desatualizados sem nenhum alerta.
- **Mitigação:** Decisão estava pendente (handoff item 1). Precisa ser resolvida antes de qualquer uso em produção. Opções: centralizar token num único owner, ou separar em lojas Tray distintas.

**C2 — Sem alerta de falha do cron `crm-tray-sync`**

- **Cenário:** O job pg_cron dispara via `pg_net.http_post`. Se a Edge Function retorna 500 (token Tray expirado, Supabase fora, rede degradada), a execução falha. Não há dead letter queue, não há notificação no Teams, não há registro acessível de falha fora dos logs do Supabase.
- **Impacto:** O time pode não saber por horas ou dias que o sync parou. Dados de compra ficam stale sem evidência visível.
- **Mitigação:** Adicionar logging estruturado na tabela `audit.*` (já append-only) com status de cada execução do cron + notificação Teams via `_shared/teams-notifier.ts` (já existe, basta usar) em caso de erro.

**C3 — 21 integrações com zero secrets configurados**

- **Cenário:** As 77 Edge Functions estão deployadas, mas as que dependem de `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `RESEND_*`, `ZAPI_CLIENT_TOKEN`, `META_APP_SECRET`, `CORREIOS_*`, `MANDAE_*` e outras (~21 variáveis) vão retornar 500 ou comportamento indefinido quando invocadas.
- **Impacto:** Qualquer usuário que acionar funcionalidade de IA, e-mail, WhatsApp ou rastreamento vai ver erro genérico. O problema é invisível até o momento de uso real.
- **Mitigação:** Antes de habilitar qualquer feature no frontend, configurar os secrets no painel Supabase. Criar um healthcheck de bootstrap que valida `Deno.env.get` dos secrets críticos e logar o resultado no startup.

---

### ALTO

**A1 — Migration pipeline sem rollback e sem gate de validacao pré-prod**

- **Cenário:** O workflow `supabase-migrate.yml` faz `supabase db push` direto em produção ao detectar mudança em `supabase/migrations/**`. Não há staging, não há dry-run, não há validação de idempotência antes do push. Se uma migration for mal escrita (ex: `DROP COLUMN` sem `IF EXISTS`, ou lock em tabela grande), ela impacta produção imediatamente.
- **Impacto:** Downtime de banco de dados imediato. As migrations existentes (`0001` tem 75kb) têm vários `ALTER TABLE` que poderiam travar em produção com dados reais.
- **Mitigação urgente:** Criar um projeto Supabase de staging (quando sair do free plan) ou adicionar um step de `supabase db diff` antes do push. Pelo menos adicionar `workflow_dispatch` com confirmação manual (já existe) como gate obrigatório em vez de auto-trigger por push.

**A2 — `crm-flow-daily-triggers` sem timeout e sem cap de duração**

- **Cenário:** A função itera sobre todos os workspaces, depois sobre todos os 4 triggers, depois chama `fetch()` para o `flow-engine` para cada `contact_id`, com cap de 500 por trigger. Em 500 contatos × 4 triggers = até 2000 chamadas HTTP sequenciais numa única Edge Function. Edge Functions Supabase têm timeout de 150s (plano Free) ou 400s (plano Pro). Com latência de rede real, isso pode estourar.
- **Impacto:** A função é cortada pelo timeout do Supabase. Contatos processados até o corte ficam sem status. Os não processados ficam sem o trigger disparado. Nenhum alerta.
- **Mitigação:** Adicionar `AbortSignal.timeout()` por chamada individual ao `flow-engine`, limitar o batch diário com paginação/cursor persistido, ou mover para Inngest (já planejado na Fase 2).

**A3 — SUPABASE_ACCESS_TOKEN exposto no chat durante sessão**

- **Conforme documentado no handoff:** o token foi compartilhado. O handoff diz "convém rotacionar" — se isso ainda não foi feito, é uma exposição de credencial ativa de produção.
- **Impacto:** Acesso irrestrito ao projeto Supabase `ouvfthknhqcciuothrqb` para quem tiver o log do chat.
- **Ação imediata:** Revogar o token antigo no painel Anthropic/Supabase e confirmar que o secret no GitHub Actions já aponta para o novo.

**A4 — Auto-publish Netlify travado sem runbook de rollback**

- **Cenário:** O Netlify está com auto-publish desabilitado (deploy manual). Se um build ruim for publicado manualmente por engano, não há documentação de como fazer rollback para o deploy anterior via Netlify UI.
- **Impacto:** Tela branca ou funcionalidade quebrada para todos os usuários até alguém lembrar de fazer rollback pelo painel.
- **Mitigação:** Criar um runbook de 3 passos (abaixo em "Runbook Gaps").

**A5 — `crm-deal-monitor` sem autenticação de cron caller**

- **Cenário:** O comentário no código diz "Invoked by cron (pg_cron) or manually — no JWT required (service-role only)". Mas a função não implementa `isCronCaller()` nem valida service role. Se `verify_jwt = false` (que provavelmente está configurado dado o padrão), qualquer pessoa com a URL da função pode invocá-la sem autenticação.
- **Impacto:** Exposição de dados de deals de todos os workspaces para chamadas não autenticadas.
- **Mitigação:** Adicionar `isServiceRoleCaller(req)` no topo da função, igual ao padrão do `crm-tray-sync`.

---

### MEDIO

**M1 — Sentry/observabilidade de frontend comentada mas não conectada**

O `ErrorBoundary.tsx` tem o comentário explícito: `// STORY-011: ponto único de reporte de erro — plugar Sentry aqui`. O `queryClient.ts` só faz `console.error`. Erros de runtime do frontend são invisíveis para o time até um usuário reportar.

**M2 — ErrorBoundary duplicada (3 instâncias)**

Existe `shell/ErrorBoundary.tsx`, `components/ErrorBoundary.tsx` (re-export) e `features/hub/components/ErrorBoundary.tsx` (implementação própria com comportamento diferente). A versão do Hub pode silenciar erros de forma diferente da shell. O root está coberto (`__root.tsx` usa a shell), mas rotas do Hub podem usar a versão local com comportamento divergente.

**M3 — React Query sem retry em mutations, sem global error toast**

`mutations.retry = 0` é correto, mas não há um `MutationCache` com `onError` global equivalente ao `QueryCache`. Mutações com erro (salvar contato, enviar campanha) dependem de cada componente tratar o erro individualmente. Se algum não trata, falha silenciosamente.

**M4 — pg_cron `crm-refresh-segments-daily` às 4h sem monitoramento**

Segundo cron job (além do tray-sync): roda a função SQL `crm.refresh_all_crm_segments()` diariamente. Não há logging de duração, não há alerta se a função trava ou retorna erro. A única evidência de falha seria via `cron.job_run_details` no banco, que ninguém consulta proativamente.

**M5 — `netlify.toml` com publishable key hardcoded no repositório**

A chave `VITE_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_s6ug89IRFfzWvpiRkITThg_6AANj04N"` está versionada. Embora seja a chave pública (anon), qualquer pessoa com acesso ao repositório pode fazer chamadas à API Supabase em nome da aplicação. Com RLS ativado isso é aceitável, mas merece registro explícito de que a decisão foi consciente.

---

## O que está bem

**Idempotência do `crm-tray-sync`:** O upsert usa `onConflict: "workspace_id,source,source_order_id"`, o que significa que rodar duas vezes consecutivas não duplica dados. A idempotência está implementada corretamente.

**Autenticação de cron com timing-safe comparison:** O `isCronCaller()` usa `constantTimeEqual()` para comparar o `x-cron-secret`, prevenindo timing attacks. Implementação correta e rara de ver bem feita.

**Índices bem distribuídos:** CRM e Hub têm índices em todas as foreign keys relevantes e colunas de filtro frequente (`workspace_id`, `status`, `contact_id`, `tracking_code`, `created_at`). O índice composto `contacts_workspace_cpf_cnpj_uniq` garante dedup correto no sync.

**RLS FORCE em todos os schemas:** Conforme arquitetura, nenhuma tabela sem policy. Auditoria anterior confirmou que críticos do `heziom-sales` foram remediados.

**ErrorBoundary na raiz com reset real:** O `handleReset` muda o `resetKey` para remontar a subárvore, não apenas limpar o estado. Isso é a implementação correta — a maioria dos projetos implementa errado e a tela continua quebrada após "tentar novamente".

**Headers de segurança no Netlify:** `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` e `Permissions-Policy` configurados corretamente no `netlify.toml`.

**CI com build gate real:** O job `build` depende de `lint` e `typecheck` passarem. Build artifact é retido por 7 dias, o que permite inspecionar o que foi deployado.

**`_shared/teams-notifier.ts` já existe:** Infraestrutura de notificação para o Microsoft Teams já está implementada e disponível para uso. Basta plugar nos pontos de falha dos cron jobs.

---

## Top 5 Melhorias de Confiabilidade (impacto/esforço)

**#1 — Logging de execução de cron em tabela audit (impacto: alto / esforço: 1-2h)**

Criar uma tabela `audit.cron_runs` (ou usar a tabela de auditoria existente) com `(job_name, started_at, finished_at, status, records_processed, error_message)`. No final de `crm-tray-sync` e `crm-flow-daily-triggers`, inserir um registro. Isso dá visibilidade imediata de falhas sem precisar de ferramenta externa.

**#2 — Alerta Teams em falha de cron (impacto: alto / esforço: 30min)**

No catch block do `crm-tray-sync` (e `crm-flow-daily-triggers`), chamar `_shared/teams-notifier.ts` com o erro. A infraestrutura já existe. É literalmente 3-4 linhas de código. Hoje uma falha silenciosa passa despercebida por horas.

**#3 — Adicionar autenticação ao `crm-deal-monitor` (impacto: alto / esforço: 15min)**

Adicionar `if (!isServiceRoleCaller(req)) return unauthorized(corsHeaders)` no topo da função. Copiar o padrão do `crm-tray-sync`. Verificar no `config.toml` se `verify_jwt = false` está ativo para essa função.

**#4 — Gate manual obrigatório no pipeline de migration (impacto: alto / esforço: 30min)**

Mudar o trigger do `supabase-migrate.yml` de auto-push para `workflow_dispatch` apenas. Adicionar um step de dry-run antes do push real: `supabase db diff --use-migra` para validar o que será aplicado. Isso evita que uma migration mal escrita vá direto para produção.

**#5 — Sentry Free no ErrorBoundary e MutationCache (impacto: médio / esforço: 2-3h)**

O código já tem o ponto de integração comentado. Criar uma conta Sentry Free, adicionar `VITE_SENTRY_DSN` como env var no Netlify, descomentar e completar a linha no `ErrorBoundary.componentDidCatch`, adicionar `MutationCache` com `onError` global no `query-client.ts`. Sem isso, erros de produção só chegam via relato de usuário.

---

## Runbook Gaps

Os seguintes cenários de falha não têm documentação de recuperação e precisam de runbook mínimo (pode ser um arquivo `.md` em `docs/runbooks/`):

**Gap 1 — Rollback de deploy Netlify** Como reverter um deploy ruim: Netlify UI > Deploys > selecionar deploy anterior > "Publish deploy". Ninguém que entrou recentemente no projeto sabe disso. O diretório `docs/runbooks/` está vazio.

**Gap 2 — Token Tray inválido (cron parou de sincronizar)** Sintomas: `crm-tray-sync` retorna erro de auth. Diagnóstico: verificar `crm.tray_tokens` no banco. Recuperação: chamar manualmente `crm-tray-token-refresh` com service role, verificar que o novo token foi gravado, reexecutar o sync manualmente.

**Gap 3 — Migration falhou em produção** O workflow não tem rollback automático. Passos: identificar a migration que falhou (log do GitHub Actions), executar SQL de compensação manualmente via Supabase Studio, criar uma nova migration de fix (nunca editar a anterior), aplicar via `workflow_dispatch`.

**Gap 4 — Supabase fora de ar (degradação total do backend)** O frontend fica sem API. Não há fallback. Runbook deve documentar: onde verificar status (status.supabase.com), como comunicar usuários, quais features ficam inoperantes vs. quais têm dados cacheados no React Query (staleTime 30s, gcTime 5min — curto demais para outages longos).

**Gap 5 — Rotação de secrets de produção** Não há documentação de quais secrets existem, onde ficam (Supabase env vars, GitHub Actions secrets) e como rotacionar. Isso ficou evidenciado quando o `SUPABASE_ACCESS_TOKEN` foi exposto no chat e a recuperação foi ad-hoc.
**Rex (@reliability) — SLO estimado 98%**

O achado mais urgente do Rex que complementa os outros:

|Severidade|Item|
|---|---|
|**CRÍTICO**|`SUPABASE_ACCESS_TOKEN` exposto no chat — se ainda não foi rotacionado, é credencial de produção ativa comprometida|
|**CRÍTICO**|21 secrets não configurados no Supabase — qualquer feature de IA, email, WhatsApp retorna 500 silencioso|
|**CRÍTICO**|Cron `crm-tray-sync` falha sem alerta — time não sabe por horas se o sync parou|
|Alto|`crm-deal-monitor` sem autenticação de cron caller — endpoint expõe deals de todos os workspaces sem JWT|
|Alto|Migration pipeline sem gate — push direto em prod sem dry-run|

**O que está bem**: idempotência do tray-sync (upsert com conflict), timing-safe comparison no cron caller, índices bem distribuídos, ErrorBoundary com reset real, headers de segurança no Netlify.
# Relatório de Qualidade de Código — HeziomOS pós-migração TanStack Router

**Dex | @dev | TRIVIAIOX** Data: 2026-06-16

---

## Score Geral: B

A migração foi executada com rigor técnico acima da média. Os 78 route files seguem padrão consistente, a camada de autenticação migrou corretamente para `@tanstack/react-router`, e a arquitetura de shims para compatibilidade de imports foi uma solução pragmática. O que impede o A são dois problemas concretos que afetam confiabilidade em produção: `any` explícito em componente crítico de negócio (RoleplaySession), e dados não normalizados por useEffect sem dependência completa no EnvioDetalhe. Nada que bloqueie o desenvolvimento, mas precisa ser pago antes do codebase crescer.

---

## 1. Migração TanStack Router

### Bem implementado

Os 78 route files são **homogêneos sem exceção**. Cada arquivo segue a mesma estrutura:

```tsx
const Component = lazy(() => import('@/features/.../Page'));
export const Route = createFileRoute('/path')({ component: ... });
```

A divisão em dois padrões — CRM usa `_crm` (pathless layout route) e Hub usa rotas flat prefixadas com `hub.` — reflete diferenças reais de layout e é correta. Não há mistura de padrões dentro de cada módulo.

**`useParams({ strict: false })`** está sendo usado consistentemente em todos os componentes que consomem params dinâmicos:

- `/Users/lucasazevedo/Documents/GitHub/Heziom/heziomos/apps/web/src/features/crm/pages/FlowEditor.tsx` linha 75: `const { id } = useParams({ strict: false })`
- `/Users/lucasazevedo/Documents/GitHub/Heziom/heziomos/apps/web/src/features/crm/components/roleplay/RoleplaySession.tsx` linha 32: `const { sessionId } = useParams({ strict: false })`
- `/Users/lucasazevedo/Documents/GitHub/Heziom/heziomos/apps/web/src/features/hub/pages/VendorDetail.tsx` linha 51: `const { id } = useParams({ strict: false })`
- `/Users/lucasazevedo/Documents/GitHub/Heziom/heziomos/apps/web/src/features/hub/pages/AlertFollowup.tsx` linha 34: `const { trackingId } = useParams({ strict: false })`
- `/Users/lucasazevedo/Documents/GitHub/Heziom/heziomos/apps/web/src/features/hub/pages/EnvioDetalhe.tsx` linha 49: `const { id } = useParams({ strict: false })`

### Problema — deve-corrigir

**`to={item.href as never}` em `/features/hub/components/Layout.tsx` linha 79 e 134**

O Hub Layout usa `Link` nativo do TanStack Router com `to={item.href}` diretamente, onde `item.href` é `string`. O compilador aceita porque `Link` aceita strings, mas o problema é diferente: o Nav do Hub tem 16 rotas hardcoded no array `navigation`/`adminNavigation` (linhas 27-47) que **não participam do sistema de feature flags nem da guarda de papel do `nav.ts`**. Se o CRM é a camada de referência (RBAC via `nav.ts` + `RouteGuard`), o Hub ainda é uma ilha separada com controle de acesso próprio via `useUserRole().isAdmin`, mais frágil.

Impacto: se uma rota hub for removida ou renomeada, o tipo não vai reclamar — só vai quebrar em runtime com 404.

Correção recomendada: tipar o array `navigation` com `readonly { href: ValidHubRoute, ... }[]` usando o tipo gerado pelo `routeTree.gen.ts`, ou migrar para o mesmo sistema `nav.ts`.

**`to={to as never}` em NavLink.tsx linha 17**

O `as never` em `/Users/lucasazevedo/Documents/GitHub/Heziom/heziomos/apps/web/src/components/NavLink.tsx` linha 17 é necessário porque a prop `to` é `string` e o TanStack Router espera um tipo literal do routeTree. É um workaround pragmático, mas significa que rotas inválidas passam em silêncio. Aceitável no curto prazo desde que o `NavLink` seja usado apenas pelo sidebar (que lê `nav.ts` com URLs controladas).

---

## 2. TypeScript Quality

### Problema grave — deve-corrigir

**`any` explícito em RoleplaySession.tsx linhas 37 e 75**

`/Users/lucasazevedo/Documents/GitHub/Heziom/heziomos/apps/web/src/features/crm/components/roleplay/RoleplaySession.tsx`

- Linha 37: `const [sessionInfo, setSessionInfo] = useState<any>(null)` — `sessionInfo` é o objeto de sessão do roleplay que depois é acessado como `sessionInfo?.scenario`, `sessionInfo?.status`, `sessionInfo.started_at`. Sem tipagem, qualquer erro de campo passa em silêncio.
- Linha 75: `.map((m: any) => ({ id: m.id, role: m.role, content: m.content }))` — os dados de `roleplay_messages` da query do Supabase são castados para `any` antes de ser mapeados.

Violação direta da regra inviolável "TypeScript strict — sem `any`". RoleplaySession é um componente crítico de negócio (IA + billing de sessão).

Correção: definir interfaces `RoleplaySession` e `RoleplayMessage` com os campos usados, ou usar o tipo gerado em `packages/database/src/types.ts` se as tabelas já foram declaradas lá.

**`as never` em use-contacts.tsx linha 99**

`/Users/lucasazevedo/Documents/GitHub/Heziom/heziomos/apps/web/src/features/crm/hooks/use-contacts.tsx` linha 99:

```ts
.insert({ ...form, workspace_id: wid!, created_by: user!.id } as never)
```

O `as never` está sendo usado para contornar a tipagem do Supabase no insert. Isso silencia potenciais erros de campos obrigatórios faltando. Deve ser corrigido declarando o tipo de insert explicitamente.

### Deveria-corrigir

**`Record<string, unknown>` como workaround de tipagem em use-workspace.tsx**

`/Users/lucasazevedo/Documents/GitHub/Heziom/heziomos/apps/web/src/features/crm/hooks/use-workspace.tsx` linhas 69-78: o join do Supabase retorna `workspaces` como `Record<string, unknown>` e então cada campo é castado manualmente (`w.id as string`, `w.name as string`, etc). Isso é consequência da query `select('..., workspaces(...)')` que o Supabase não tipou automaticamente — a correção correta é ajustar a query para que o tipo inferido inclua o nested object, ou usar o tipo do `packages/database/src/types.ts`.

**`console.error` em query-client.ts linha 23 e ErrorBoundary.tsx linha 22**

`/Users/lucasazevedo/Documents/GitHub/Heziom/heziomos/apps/web/src/lib/query-client.ts` linha 23: `console.error('[query-error]', ...)` — o próprio comentário no ErrorBoundary menciona que o ponto certo é plugar Sentry. Esses `console.error` são instrumentais mas vão para produção. Se Sentry não está configurado ainda, são aceitáveis como ponto de integração futuro — mas deveriam ser guardados por uma checagem `if (import.meta.env.PROD && window.Sentry)`.

---

## 3. Padrões de Código

### Bem implementado

**Naming conventions estão consistentes**: hooks prefixados com `use`, componentes PascalCase, arquivos kebab-case. A única exceção intencional são os hooks do Hub (`useAuth`, `useUserRole`, `useVendorOrders`) que usam camelCase no nome do arquivo — é uma inconsistência com os hooks do CRM (`use-workspace`, `use-contacts`) mas está documentada via bridge shims.

**Bridge shims são a decisão correta**: todos os arquivos em `/hooks/` são re-exports com comentários explicando a origem. Evitaram quebrar todas as importações existentes durante a migração. São dívida técnica conhecida e gerenciável.

### Deveria-corrigir

**Imports duplicados em AppLayout.tsx**

`/Users/lucasazevedo/Documents/GitHub/Heziom/heziomos/apps/web/src/shell/AppLayout.tsx` linhas 14-15:

```ts
import { Outlet } from '@tanstack/react-router';
import { useNavigate } from '@tanstack/react-router';
```

Dois imports separados do mesmo módulo. Biome/ESLint deve estar reportando isso. Deve ser consolidado em uma linha.

**Dashboard.tsx do Hub é um componente de 650 linhas com responsabilidades misturadas**

`/Users/lucasazevedo/Documents/GitHub/Heziom/heziomos/apps/web/src/features/hub/pages/Dashboard.tsx` — 653 linhas. O componente faz: fetch de 5 queries diferentes, 7 `useMemo` de transformação de dados, lógica de UI de filtro de data, e renderização de 4 gráficos. Isso não é um problema novo da migração, mas é a maior concentração de responsabilidade do codebase visível.

Impacto: qualquer mudança em qualquer gráfico ou métrica exige navegar 650 linhas. Risco de regressão alto.

**Lógica de data inline em Dashboard.tsx**

`/Users/lucasazevedo/Documents/GitHub/Heziom/heziomos/apps/web/src/features/hub/pages/Dashboard.tsx` linha 590-604: bloco `{(() => { const lineData = metrics ? Object.values(metrics.reduce(...)) : []; return <ResponsiveContainer>...</ResponsiveContainer>; })()}` — IIFE inline no JSX para transformar dados antes de renderizar. Isso deveria ser um `useMemo` ou função utilitária.

---

## 4. React Patterns

### Bem implementado

**useEffect com cleanup está correto nos lugares certos**: `supabase.auth.onAuthStateChange` em `auth.tsx` e `features/hub/hooks/useAuth.tsx` retornam `subscription.unsubscribe()` corretamente. O `timerRef` do RoleplaySession faz `clearInterval` no cleanup.

**ErrorBoundary com resetKey**: A implementação em `/Users/lucasazevedo/Documents/GitHub/Heziom/heziomos/apps/web/src/shell/ErrorBoundary.tsx` usa `Fragment key={resetKey}` para forçar remontagem da subárvore no "Tentar novamente". Decisão correta — evita o bug clássico de resetar o estado mas re-renderizar o mesmo componente quebrado.

**React.lazy + Suspense em todos os 78 routes**: carregamento lazy é universal, o fallback `LazyFallback` está no root. Correto.

### Problema — deve-corrigir

**EnvioDetalhe: `fetchData` declarada como função comum dentro do componente sem `useCallback`, chamada no `useEffect` que não a lista como dependência**

`/Users/lucasazevedo/Documents/GitHub/Heziom/heziomos/apps/web/src/features/hub/pages/EnvioDetalhe.tsx` linhas 58-88: `fetchData` é uma função async declarada no corpo do componente. O `useEffect` (inferido pelo `useEffect(() => { fetchData(); }, [id])`) não inclui `fetchData` nas dependências porque ela é recriada a cada render. Em modo strict (que está ativado no `main.tsx`) o effect roda duas vezes em desenvolvimento. Se `fetchData` captura `id` do closure de um render anterior, pode ter race condition.

Além disso, a função é chamada diretamente no componente (linha implícita com botão "Atualizar") sem ser memoizada, o que cria nova referência a cada render.

### Deveria-corrigir

**RoleplaySession: `fetchSession` declarada sem `useCallback` e chamada no `useEffect([], [sessionId])`**

`/Users/lucasazevedo/Documents/GitHub/Heziom/heziomos/apps/web/src/features/crm/components/roleplay/RoleplaySession.tsx` linhas 57-84: `fetchSession` é uma função async sem `useCallback`. O `useEffect` na linha 47 a chama com `[sessionId]` como deps, mas `fetchSession` não está nas deps (ESLint teria reportado). Se `sessionId` mudar, um novo `fetchSession` é criado mas o effect não re-roda porque `fetchSession` não mudou na lista de deps — ou o efeito re-roda mas a referência antiga ainda está sendo usada.

**`navigate` dentro de efeitos sem condição de saída em RequireAuth**

`/Users/lucasazevedo/Documents/GitHub/Heziom/heziomos/apps/web/src/lib/auth.tsx` linhas 57-61: `useEffect(() => { if (!loading && !session) { navigate({ to: '/login' }) } }, [session, loading, navigate])`. Esta é a implementação de guarda de auth recomendada pelo TanStack Router, mas há uma race condition: se `loading` e `session` chegam ao mesmo tempo (possível em SSE), pode redirecionar e cancelar a sessão sendo estabelecida. A forma mais robusta é usar `beforeLoad` no route file ao invés de `useEffect` — mas é uma migração não-trivial.

---

## 5. Dead Code

### Deveria-corrigir

**`ProtectedRoute.tsx` em `/components/ProtectedRoute.tsx` — wrapper redundante**

`/Users/lucasazevedo/Documents/GitHub/Heziom/heziomos/apps/web/src/components/ProtectedRoute.tsx` — 11 linhas que apenas envolvem `RequireAuth`. Tem uma prop `requireAdmin?: boolean` que é declarada mas **nunca usada** (a desestruturação ignora ela: `function ProtectedRoute({ children }: ProtectedRouteProps)`). O componente é um wrapper de zero valor sobre `RequireAuth`, sem nenhum importador visível nos route files (todos usam `RequireAuth` diretamente). Candidato à remoção.

**`CHART_COLORS` em Dashboard.tsx linha 36 vs `CARRIER_COLORS` linha 44 — sobreposição parcial**

Dois arrays de cores para charts no mesmo arquivo. `CHART_COLORS` é usado apenas como fallback em `carrierPieData` (linha 566). `CARRIER_COLORS` cobre as 4 transportadoras conhecidas. Se a lista de transportadoras for sempre fixa, `CHART_COLORS` pode ser eliminado.

**`findNavItem` em nav.ts linha 142 não tem nenhum consumidor visível**

`/Users/lucasazevedo/Documents/GitHub/Heziom/heziomos/apps/web/src/lib/nav.ts` linha 142: `export function findNavItem(pathname: string)` — `navRuleForPath` (linha 152) é usada pelo RouteGuard, mas `findNavItem` aparentemente não é chamada em lugar nenhum no código visível. Se não há consumidor, é dead code.

---

## 6. Packages Compartilhados

### Bem implementado

`@heziom/ui` está sendo usado em todo o codebase — todas as páginas importam de `@/components/ui/...` que mapeia para o package. Não há reinvenção de componentes base.

`@heziom/shared` e `@heziom/database` não foram verificados em profundidade nesta revisão, mas a tipagem de `Contact` em `use-contacts.tsx` está definida localmente em vez de vir de `@heziom/shared` — o que pode indicar duplicação.

### Nice-to-have

**`analytics.ts` é um arquivo de funções puras excelente** — deve ser o padrão para extração de lógica de negócio de componentes gordos. O Dashboard do Hub (`Dashboard.tsx`, 653 linhas) deveria passar pelo mesmo tratamento que `analytics.ts` recebeu.

---

## 7. Consistência CRM vs Hub

### Inconsistências estruturais (deveria-corrigir)

**Autenticação duplicada**: Existem dois `AuthProvider` e dois `useAuth` completamente independentes:

- CRM: `src/lib/auth.tsx` — usa `supabase` (cliente padrão, anonKey CRM)
- Hub: `src/features/hub/hooks/useAuth.tsx` — usa `hubSupabase` (cliente separado)

Isso significa que logar no CRM não loga no Hub e vice-versa. É intencional? Se sim, falta documentação. Se não, é bug de arquitetura.

**Layout separado**: O Hub tem seu próprio `Layout.tsx` (166 linhas) com sidebar hardcoded, enquanto o CRM usa `AppLayout` + `AppSidebar` com `nav.ts` e feature flags. O Hub está 2 gerações atrás em termos de arquitetura.

**RBAC diferente**: CRM usa `role: 'agent' | 'manager' | 'admin' | 'superadmin'` via `workspace_members`. Hub usa `role: 'admin' | 'user'` via tabela `user_roles`. São sistemas de controle de acesso incompatíveis no mesmo monorepo.

**Rotas Hub sem layout route**: As rotas `hub.*` não têm uma rota pai `hub.tsx` que centralize `RequireAuth`. Cada route file individual repete `<RequireAuth>`. Se o CRM tem `_crm.tsx` como ponto central de autenticação, o Hub deveria ter o equivalente. Hoje são 20+ route files hub repetindo o wrapper — risco de esquecer em um novo arquivo.

---

## Padrões bem implementados — referências para o time

1. **Shim de bridge**: A estratégia de manter arquivos em `@/components/X` e `@/hooks/X` como re-exports durante a migração evitou 200+ mudanças de import. É o padrão correto de migração incremental.
    
2. **`nav.ts` como fonte única da verdade**: `NAV_MODULES` alimenta tanto o sidebar quanto o `RouteGuard`. Mudança em uma rota exige mudança em um único lugar. Excelente.
    
3. **`routeTree.gen.ts` autogerado + `@ts-nocheck`**: A declaração correta de `Register { router: typeof router }` no `App.tsx` ativa o type checking de rotas sem poluir o código de produção.
    
4. **`query-client.ts` centralizado**: Defaults sensatos (`retry: 1`, `staleTime: 30s`, `refetchOnWindowFocus: false`) definidos em um lugar só. O `QueryCache.onError` é o ponto certo para futura integração Sentry.
    
5. **`analytics.ts`**: Funções puras de cálculo extraídas de componente gigante. Testáveis sem React. Este é o padrão que o Dashboard do Hub precisa seguir.
    
6. **FeatureGate no route file**: O wrapper `<FeatureGate flag="..." label="...">` diretamente no route file (não dentro da page) significa que a feature flag é verificada antes de qualquer lógica da página carregar. Correto.
    

---

## Dívida Técnica Consolidada — Antes de Crescer

|#|Item|Arquivo|Severidade|
|---|---|---|---|
|1|`any` em RoleplaySession|`roleplay/RoleplaySession.tsx:37,75`|CRÍTICO|
|2|`as never` em insert de contacts|`use-contacts.tsx:99`|ALTO|
|3|Dois sistemas de auth incompatíveis|`lib/auth.tsx` vs `hub/hooks/useAuth.tsx`|ALTO|
|4|Hub sem layout route central|20+ route files repetindo `RequireAuth`|MÉDIO|
|5|`fetchData` sem `useCallback` em EnvioDetalhe|`EnvioDetalhe.tsx:58`|MÉDIO|
|6|`Record<string, unknown>` workaround em workspace|`use-workspace.tsx:69`|MÉDIO|
|7|`ProtectedRoute` dead code|`components/ProtectedRoute.tsx`|BAIXO|
|8|`findNavItem` sem consumidor|`lib/nav.ts:142`|BAIXO|
|9|Dashboard Hub: 650 linhas, múltiplas responsabilidades|`hub/pages/Dashboard.tsx`|MÉDIO|
|10|Imports duplicados de `@tanstack/react-router`|`shell/AppLayout.tsx:14-15`|BAIXO|

---

## Próxima História de Qualidade Recomendada

**Story: "Hub Auth Consolidation — um sistema de autenticação para CRM e Hub"**

Justificativa: O risco mais alto de manutenção não é TypeScript — é ter dois `AuthProvider` independentes usando dois clientes Supabase diferentes. Se a decisão de longo prazo é que CRM e Hub são o mesmo produto para o mesmo usuário, a dívida de consolidar autenticação só cresce enquanto o Hub ganha features. A story deve:

1. Decidir (com `@architect`) se Hub e CRM compartilham o mesmo workspace ou têm contextos separados
2. Criar um layout route `hub.tsx` análogo ao `_crm.tsx` (centraliza `RequireAuth`)
3. Migrar Hub para o mesmo RBAC do CRM (`workspace_members.role`) ou documentar formalmente que são sistemas separados
4. Eliminar os shims de bridge assim que o Hub migrar para o mesmo `useAuth` do `lib/auth.tsx`
## Avaliação Multi-Agente — HeziomOS (2026-06-16)

**Participantes:** Cipher (@security), Aria (@architect), Rex (@reliability), Dex (@dev)

---

### Veredicto por Agente

|Agente|Veredicto|Resumo|
|---|---|---|
|Cipher|**CONCERNS**|3 HIGH, 4 MEDIUM, 3 LOW — sem CRITICAL|
|Aria|**Aceitável → Sólida**|Decisões corretas, 2 riscos altos que crescem na Fase 2|
|Rex|**SLO ~98%**|3 CRÍTICOs operacionais, 5 ALTOs, 5 runbook gaps|
|Dex|**B**|Migração rigorosa, `any` violando regra inviolável, dois sistemas de auth|

---

### Ações Imediatas (antes de qualquer novo desenvolvimento)

**1. Corrigir domínio morto em `_shared/cors.ts`** — 1 linha `ALLOWED_ORIGINS = ["https://triviacrmatende.netlify.app"]` → deve ser `"https://heziomos.netlify.app"`. As 9 funções que usam essa utilidade estão bloqueando requests do app real em produção agora.

**2. Remover `temp_password` do JSON de resposta** — `crm-admin-create-user/index.ts:128` Senha temporária em plain-text na response HTTP é capturada por logs de CDN/APM. Enviar apenas via Resend (já integrado), retornar só `{ user_id, email }`.

**3. Adicionar auth em `crm-deal-monitor`** — 15 min Sem `isServiceRoleCaller(req)`, qualquer chamada sem JWT expõe deals de todos os workspaces. Copiar padrão do `crm-tray-sync`.

**4. Mover `categorizeWithAI()` depois do anti-replay** — `crm-nps-csat-webhook` Atualmente a IA é chamada antes de validar se o survey já foi respondido. Replay com custo OpenAI não controlado.

**5. Confirmar rotação do `SUPABASE_ACCESS_TOKEN`** (Rex/handoff) Se o token exposto no chat de ontem ainda está ativo, revogar agora no painel Supabase e atualizar o secret no GitHub Actions.

---

### Antes de Usuários Reais em Produção

**6. Criar layout route `_hub.tsx`** (Aria + Dex convergem) Hub tem 20+ route files com `RequireAuth` manual. Qualquer nova rota Hub sem o wrapper vai pra prod desprotegida. Espelhar o `_crm.tsx` — história de 1 ponto.

**7. Decidir arquitetura de autenticação CRM vs Hub** (Dex — ALTO) Dois `AuthProvider` completamente independentes (`lib/auth.tsx` vs `hub/hooks/useAuth.tsx`), dois sistemas RBAC incompatíveis (`workspace_members.role` vs `user_roles.role`). Logar no CRM não loga no Hub. Se o objetivo é plataforma unificada, isso precisa convergir antes de crescer.

**8. Configurar os 21 secrets no Supabase** (Rex) 77 Edge Functions deployadas, mas OpenAI, Anthropic, Resend, Z-API, Meta, Mandaê, Correios etc. com zero configuração. Qualquer feature de IA/email/WhatsApp retorna 500 silencioso.

---

### Antes da Fase 2

**9. ADR-0013: token OAuth Tray** (Aria) Conflito P1 sem decisão formal. `crm-tray-sync` em prod sem saber qual client detém o token.

**10. Gate manual no pipeline de migration** (Rex) `supabase-migrate.yml` aplica direto em prod no push. Mudar para `workflow_dispatch` + dry-run antes.

**11. Alerta Teams em falha de cron** (Rex — 30 min) `_shared/teams-notifier.ts` já existe. Adicionar 3-4 linhas no catch block do `crm-tray-sync`. Hoje falhas passam despercebidas por horas.

**12. Rate limiter fail-closed para funções de IA** (Cipher M3) `_shared/rate-limit.ts` retorna `allowed: true` quando DB falha. Para `crm-ai-orchestrator` e `crm-predictive-ai`, adicionar `failOpen: false`.

---

### Dívida Técnica (não bloqueia hoje, cresce amanhã)

|#|Item|Onde|Severidade|
|---|---|---|---|
|D1|`any` em RoleplaySession|`RoleplaySession.tsx:37,75`|Viola regra inviolável|
|D2|`as never` em insert de contacts|`use-contacts.tsx:99`|Silencia erros de campo|
|D3|CORS `*` em 61 funções com JWT|61 Edge Functions|Cipher H3|
|D4|`useParams({ strict: false })` em 16 pontos|Varios routes|Params renomear sem erro|
|D5|`@heziom/shared` com zero adoção|`packages/shared/`|Drift de contrato na F2|
|D6|Dashboard Hub com 650 linhas|`hub/pages/Dashboard.tsx`|Alta concentração|
|D7|`ProtectedRoute.tsx` dead code|`components/ProtectedRoute.tsx`|Remover|

---

### O que está muito bem (não mudar)

- RLS FORCE em todos os schemas, `audit.*` genuinamente append-only ✓
- Sem `service_role_key` no frontend (confirmado em todos os clients) ✓
- `constantTimeEqual` em comparações de token ✓
- OAuth CSRF com nonce server-side no `crm-meetings-oauth-start` ✓
- Idempotência do tray-sync (upsert com conflict key) ✓
- ErrorBoundary com `resetKey` (implementação rara e correta) ✓
- `routeTree.gen.ts` + `nav.ts` como fonte única de verdade de rotas ✓
- 78 route files com lazy loading universal ✓
- Headers de segurança no Netlify (`X-Frame-Options`, `X-Content-Type-Options`, etc.) ✓

---

**Posso começar pelas correções imediatas agora** — os itens 1, 2, 3, 4 são todos pequenos e de alto impacto. Quer que eu execute tudo numa única sessão, ou prefere priorizar algum em especial?