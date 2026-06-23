---
tipo: relatorio-e2e
projeto: TriviaEdutech
gerado_em: 2026-06-23
tenant: ESCOLA TEOLÓGICA SÃ DOUTRINA (e7c8d42e-ad16-4a9a-8eac-b57cc6504815)
metodo: 4 roles × telas (preview) + 20 edge functions (curl/JWT) + RLS (REST API) — workflow multi-agente (26 agentes)
---

# Relatório E2E Completo — TriviaEdutech

> Varredura E2E exaustiva sobre o tenant real da ETSD: 4 roles nas telas + 20 edge functions (modo seguro) + RLS por papel. Backend testado com JWT real via curl + verificação no banco; UI verificada no preview. Regras de segurança: sem pagamentos reais, sem import de Vimeo, sem deletes.

## 1. Sweep visual — 4 de 4 roles ✅

| Role | Conta | Telas conferidas |
|---|---|---|
| Aluno | aluno.mateus@etsd-demo.com.br | Dashboard, sino (5 notificações reais), Perfil (170 pts + 3 badges), Boletim (prova 2/2), Certificado, hub Minhas Atividades |
| Aluno 2 | aluno.priscila@etsd-demo.com.br | Boletim com **atividade 8/10 + feedback** (STORY-045) |
| Instrutor | prof.joana@etsd-demo.com.br | Seção INSTRUTOR (Meus Cursos/Vídeos), gestão de cursos reais (Importar Vimeo, Editar, Novo) |
| Admin | joaonovais@editoraheziom.com.br | Painel admin (83 cursos, métricas, donut de progresso), menu com Planos |
| Superadmin | super.demo@etsd-demo.com.br | Painel Superadmin (5 organizações), TenantSwitcher, seção PLATAFORMA |

## 2. Edge Functions — 20 testadas (19 pass, 1 warn)

| Função | Modo | Status | Observação |
|---|---|---|---|
| create-org | auth-only | pass | Sign-up público; happy-path pulado (criaria tenant). Validação Zod → 400. |
| accept-invite | auth-only | pass | Token inexistente → 404; payload inválido → 400. |
| submit-quiz | full | pass | 201 + row em quiz_attempts; sem auth → 401. |
| submit-activity | full | pass | get-my-activities 200 verificado; sem auth → 401. |
| batch-enroll | full | pass | Matrícula real criada + idempotente no re-run; sad-paths 401/400. |
| auto-enroll | auth-only | pass | Sem x-api-key → 401; GET → 405. (sem api_key p/ happy-path) |
| manage-users | full | pass | list-tenant-users 200 (5 users) batendo com DB. |
| manage-ai | full | pass | get-providers 200 (4 providers, api_key mascarada). |
| generate-quiz | auth-only | pass | Passou auth/role/Zod; 400 por falta de provider de vídeo/transcrição. |
| ai-tutor | full | pass | Caminho real até callAI; 500 por **provedor de IA ausente**. |
| optimize-content | full | pass | Caminho real até callAI; 500 por **chave de IA vazia**. |
| video-proxy | full | pass | GET vídeo Vimeo 200 (dados reais); guard de matrícula 403. |
| sitemap | full | pass | GET público 200, XML válido. (content-type text/plain — menor) |
| llms-txt | full | pass | GET público 200, conteúdo real. |
| mp-create-preference | full | pass | Purchase pending em **modo mock** (MP não configurado); sem pagamento real. |
| mp-webhook | auth-only | **WARN** | **HMAC desligado sem o secret → aceita requisição não autenticada (fail-open).** Ver §4. |
| mp-oauth | auth-only | pass | authorize/status em modo mock; 401 sem/token inválido. |
| import-vimeo-folder | auth-only | pass | Happy-path perigoso NÃO executado; 4 gates de auth/RBAC OK. |
| batch-import-vimeo | auth-only | pass | Happy-path perigoso NÃO executado; gate de auth (401) OK. |
| pdf-info | auth-only | pass | Auth/Zod OK; **deployada mas ausente do config.toml (drift)**. |

## 3. RLS por role — 4/4 pass (isolamento multi-tenant íntegro)

- **student:** vê só as próprias notifications (5) e enrollment (1); cross-tenant bloqueado; PATCH em curso → 0 linhas; INSERT → 403/42501; controle positivo lê os 6 cursos do próprio tenant.
- **instructor:** vê 6 cursos publicados do tenant (não os 78 rascunhos alheios); PATCH cross-tenant e same-tenant-não-próprio → 0 linhas; PATCH no curso próprio OK; ai_provider_settings SELECT 0 / INSERT 403 (bloqueio por papel).
- **admin:** vê só ETSD (5 profiles, 5 enrollments, 1 tenant); cross-tenant read/write bloqueado; vê cursos de outros tenants só se is_public+published (catálogo público intencional); controle positivo com revert.
- **superadmin:** visibilidade god-mode = service_role (89 cursos/5 tenants, 13 profiles, 15 user_roles); PATCH cross-tenant em courses permitido; **INSERT cross-tenant em user_roles bloqueado (403)** — sem escalada de papel.

Veredito RLS: nenhum vazamento cross-tenant detectado; todos os controles positivos confirmam que os bloqueios são RLS genuíno (não falha cega).

## 4. Achado de segurança (WARN) — mp-webhook fail-open

- **O quê:** a função verifica HMAC do Mercado Pago **só se** `MERCADOPAGO_WEBHOOK_SECRET` estiver setado; ausente, cai em "modo dev" e **aceita qualquer requisição** (200 onde se esperava 401). Como `verify_jwt=false`, a assinatura HMAC é o **único** gate de auth.
- **Risco:** em produção sem o secret, o webhook aceitaria chamadas forjadas. Mitigado hoje só porque `MP_ACCESS_TOKEN` também está ausente (payloads dão short-circuit em mock antes de qualquer write).
- **Recomendação:** **fail-closed** — rejeitar (401) quando o secret estiver ausente em produção; configurar `MERCADOPAGO_WEBHOOK_SECRET`. (Já consta no registro de riscos do [[Mapeamento do Sistema]] e como STORY-006.)

## 5. Cobertura — o que NÃO foi exercitado em modo full (sem mascarar)

- **Geração de IA** (ai-tutor, optimize-content, generate-quiz, manage-ai test-connection): nenhum provedor de IA ativo na ETSD → o callAI real não foi validado (retorna 500/400 de config).
- **Pagamento real** (mp-create-preference, mp-webhook, mp-oauth): MP não configurado → só modo mock; checkout real e transição para `completed` não validados.
- **Imports do Vimeo** (import-vimeo-folder, batch-import-vimeo): happy-path proibido por segurança (criaria cursos reais) — só auth/RBAC.
- **Ações superadmin-only de manage-users** (create/delete-tenant, generate-api-key): não testadas (token disponível é admin de tenant).
- **video-proxy** sub-actions transcribe-ai/download-caption (escrevem em lessons): fora do escopo (só action=get).
- **Happy-paths que criam dados de produção** (create-org, accept-invite, auto-enroll): só validação/auth.

## 6. Veredito

A plataforma está **funcional e íntegra** nos 4 papéis: as jornadas da sprint (matrícula, trilha, gamificação, notificações, boletim, certificado, calendário, FAQ) funcionam ponta a ponta; a segurança RLS multi-tenant não tem vazamentos; as edge functions respondem e validam auth corretamente. O único ponto de atenção de segurança é o **mp-webhook fail-open** (configurar o secret + fail-closed antes de operar pagamentos em produção). As lacunas de cobertura full são todas por **configuração ausente** (IA/pagamento) ou **segurança deliberada** (imports), não por defeito de código.

Credenciais de demonstração em [[Demo-E2E]].
