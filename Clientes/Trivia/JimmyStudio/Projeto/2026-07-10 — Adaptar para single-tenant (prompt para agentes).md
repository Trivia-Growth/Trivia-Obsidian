---
data: 2026-07-10
tipo: projeto / prompt de agentes
modulo: fork / single-tenant
relacionado: STORY-084, STORY-125, STORY-133
origem: pedido do piloto (levar o sistema para outro projeto, single-tenant)
---

# Adaptar o Jimmy Studio para single-tenant — prompt para agentes

> Prompt auto-contido para clonar o `triviadash-analytics` (multi-tenant) num NOVO projeto que
> atende UMA organização. Cópia idêntica versionada no repo em `docs/ADAPTACAO-SINGLE-TENANT.md`.

## Diagnóstico rápido (por que a estratégia é "fixar a org", não "arrancar org_id")
Levantei os três eixos de tenancy do sistema-fonte:

- **Banco:** tenant = tabela `orgs`; coluna `org_id` em ~121 tabelas (FK `orgs(id) ON DELETE
  CASCADE`). Todo isolamento passa por **uma** função — `get_user_org_id(auth.uid())` (lê
  `profiles.org_id`). RLS padrão `org_id = get_user_org_id(auth.uid())`. Um usuário = uma org
  (`profiles.org_id UNIQUE(user_id)`). **O trigger `handle_new_user()` já coloca todo usuário
  numa org fixa `'Default Organization'`** -> na prática já é single-tenant no provisionamento.
- **Edge functions:** sem helper central; o bloco `getUser -> profiles.org_id` está inline em
  ~40 functions. Quotas vivem em RPCs Postgres com `p_org_id` explícito (`can_generate_content`
  etc.).
- **Frontend:** coração em `src/contexts/SuperAdminOrgContext.tsx` + `useEffectiveOrgId()`
  (usado em ~55 hooks). Seletor de org e criação/gestão de orgs só existem para `super_admin`;
  usuário normal já não troca de org.

**Conclusão:** arrancar `org_id` de 121 tabelas seria enorme e arriscado (furo de RLS) e compra
quase nada. Caminho certo = **fixar 1 org e remover a maquinaria de múltiplas orgs**. A RLS por
org é boa segurança mesmo com uma org só — manter.

## Prompt (entregar aos agentes do projeto de destino)

```
# MISSÃO: Clonar o Jimmy Studio e adaptá-lo para SINGLE-TENANT

Você vai clonar o sistema `triviadash-analytics` (Jimmy Studio) para um NOVO projeto
single-tenant. O sistema-fonte é multi-tenant; o destino atende UMA única organização.

## 0. O que você precisa entender antes de tocar em qualquer coisa

Stack do fonte: React 18 + Vite + TS (Netlify) no front; Supabase (Edge Functions Deno +
Postgres) no back. Framework de trabalho: AIOX/SDD (dirigido por stories).

**Modelo de tenancy do fonte (mapeado — confie neste mapa):**
- Tenant = tabela `public.orgs`. Coluna `org_id UUID` em ~121 tabelas, sempre FK
  `REFERENCES public.orgs(id) ON DELETE CASCADE NOT NULL`.
- Resolução central: `public.get_user_org_id(auth.uid())` -> lê `profiles.org_id`. É o
  ÚNICO ponto de resolução (371 chamadas). RLS padrão: `USING (org_id = public.get_user_org_id(auth.uid()))`.
- Usuário <-> org: `profiles.org_id` com `UNIQUE(user_id)` -> um usuário pertence a UMA org.
  NÃO há tabela de membership; NÃO há org em JWT claims.
- Roles são GLOBAIS (`public.user_roles`, sem `org_id`): super_admin/admin/gestor/comercial/
  gestor_trafego/leitura. `super_admin` habilita o "visualizar como" cross-org.
- **Já é quase single-tenant:** trigger `handle_new_user()` coloca TODO usuário novo na org
  fixa `'Default Organization'` (get-or-create).
- Quotas/limites/billing vivem em RPCs Postgres que recebem `p_org_id` explícito:
  `can_generate_content(p_org_id)`, `can_use_ai_analysis`, `can_add_brand`,
  `get_effective_limits`, `can_generate_image` etc.

**Distinção obrigatória:** single-tenant != single-user. Continua tendo login, múltiplos
usuários e roles DENTRO da org única. O que sai é a maquinaria de MÚLTIPLAS orgs.

## 1. Estratégia (DECISÃO JÁ TOMADA — só confirme com o dono se ele pedir a alternativa)

**Estratégia A — FIXAR A ORG ÚNICA (PADRÃO, é o que você vai fazer):**
Mantém a coluna `org_id` e a RLS existentes (a RLS por org é boa segurança mesmo com uma org
só). Você NÃO mexe no schema das 121 tabelas. Você:
1. Garante que existe exatamente UMA org (a "org da casa") e que todo usuário cai nela.
2. Remove do produto a UI/UX de múltiplas orgs (seletor, super_admin cross-org, criação/
   convite/gestão de orgs).
3. Simplifica o onboarding para não criar org nova por signup.
Baixo risco, entrega rápida, reversível.

**Estratégia B — REMOVER `org_id` do schema (NÃO faça a menos que o dono peça explicitamente):**
Arrancar `org_id` de 121 tabelas, reescrever toda a RLS para role-based, tirar `p_org_id` de
todas as RPCs, limpar `.eq('org_id')` de ~55 hooks + ~40 functions. Trabalho enorme, risco
alto de furo de RLS, ganho quase nulo. Se o dono insistir, faça em migration própria, tabela
por tabela, com a suíte de segurança verde a cada passo — e só depois de A funcionando.

Se em algum momento a Estratégia B for pedida, PARE e confirme o escopo antes de codar.

## 2. Regras de trabalho (inegociáveis)

- **Idioma:** tudo em português (pt-BR), linguagem simples e direta.
- **Stories antes de codar:** registre as stories/spec (padrão SDD) ANTES de implementar
  cada entrega. Uma entrega multi-story = arquivos de story criados primeiro.
- **Flag-gated + reversível:** toda mudança de comportamento entra atrás de flag, com
  fallback idêntico ao legado quando a flag está OFF.
- **Gate verde obrigatório antes de qualquer push:** `vitest` (front) + `deno test`
  (functions) + `tsc`/typecheck + `build`. Nada sobe com gate vermelho.
- **Análise adversarial antes do push** nas mudanças de segurança (RLS!) e de geração.
- **Prevenção > verificação:** não adicione etapas de verificação pós-fato para consertar
  algo; conserte na origem (schema/prompt/config).
- **Segredos:** este é um projeto NOVO. NÃO reutilize chaves/segredos do projeto-fonte.
  Crie projeto Supabase novo, chaves novas, secrets novos. Nunca cole segredo em chat/commit.
- **Dados de teste:** nunca use "Claude" em dados visíveis; use nomes neutros (ex.:
  `TESTE_INTERNO`).
- **Git:** confirme com o dono a política do repo novo (branch+PR vs. push direto) antes de
  assumir. Não assuma a política do repo-fonte.

## 3. Plano por fases (com critérios de aceite)

### Fase 0 — Clone e provisionamento do novo ambiente
- Copiar o código para o novo repositório.
- Criar projeto Supabase novo (ref próprio); aplicar as migrations do fonte do zero.
- Configurar env do front (`VITE_*`) e secrets das edge functions com os valores do NOVO
  projeto. Configurar hospedagem (Netlify) do novo domínio.
- CA: o app sobe local e em produção contra o novo Supabase; login funciona; gate verde.

### Fase 1 — Banco: fixar a org única (Estratégia A)
- Definir a "org da casa": criar/garantir 1 linha em `orgs` (nome real do cliente, não
  "Default Organization"). Decidir se o `id` é fixo/conhecido (recomendado: seed idempotente).
- `handle_new_user()`: manter o get-or-create, mas apontando para a org da casa (nome do
  cliente), e definir o role default do primeiro usuário (ex.: `admin`). Garantir que NUNCA
  cria uma segunda org.
- Manter `get_user_org_id` e a RLS `org_id = get_user_org_id(auth.uid())` INTACTAS (é a
  garantia de que só usuários autenticados da org veem os dados).
- Migration de guarda: impedir criação de org adicional (ex.: constraint/trigger que barra
  `INSERT` em `orgs` além da existente), para o sistema não "vazar" para multi-tenant por
  engano.
- CA: novo signup cai na org da casa; não existe forma de criar 2ª org; suíte de RLS verde.

### Fase 2 — Edge functions
- NÃO precisa arrancar `org_id` das functions (Estratégia A). O `getUser -> profiles.org_id`
  continua resolvendo a org da casa. Mantenha.
- Quotas: decidir com o dono se a org única é "ilimitada" ou mantém plano. Se ilimitada,
  ajuste os limites via as RPCs/tabelas de plano (`subscription_plans`/`get_effective_limits`)
  — mexa no Postgres, não no TS. NÃO remova o gate; só afrouxe o limite.
- `agent-api` (auth por `X-API-Key` -> `org_api_keys.org_id`): manter; a chave resolve a org
  da casa. Remover o override `target_org_id` de super_admin.
- Desativar/remover functions que só existem para multi-org admin: `delete-organization`,
  `admin-update-subscription`/`admin-reset-usage`/`extend-trial` (se não fizerem sentido no
  produto single-tenant — confirmar com o dono).
- `trial-signup`: reescrever para NÃO criar org (usar a org da casa) — ou remover se o
  produto não tem trial self-service.
- CA: geração de conteúdo e sync funcionam ponta-a-ponta na org da casa; gate deno verde.

### Fase 3 — Frontend (aqui está o grosso da simplificação)
- `src/contexts/SuperAdminOrgContext.tsx`: `useEffectiveOrgId()` passa a retornar SEMPRE o
  `org_id` do usuário logado (a org da casa). Remover a lógica de seleção/`selectedOrgId`/
  `organizations`/localStorage `super_admin_selected_org`. Manter o hook (55 hooks dependem
  dele) — só simplificar o corpo.
- Remover o seletor de org da UI: `src/components/SuperAdminOrgSelector.tsx` e seu uso em
  `src/components/Layout.tsx` (sidebar).
- Remover/ocultar a criação e gestão de MÚLTIPLAS orgs:
  `src/components/UserManagement.tsx` (opção "Criar Nova Organização" e o campo org na
  criação de usuário — o usuário novo herda a org da casa automaticamente),
  `src/components/admin/OrganizationsTab.tsx`, `src/hooks/useAdminOrganizations.ts`,
  `src/hooks/useDeleteOrganization.ts`, `OrgDetailsModal.tsx`, `OrgJourneyDialog.tsx` e rotas
  do painel super_admin cross-org.
- Onboarding (`src/pages/Onboarding.tsx`) e `useAuth.signUpTrial`: ajustar para não
  pressupor criação de org.
- Manter roles e a tela de equipe (`/agencia/equipe`, `useTeamMembers`) — continuam válidas
  dentro da org única. Rebaixar/absorver o conceito de `super_admin` para `admin` (ou manter
  super_admin só como "admin técnico", sem o "visualizar como").
- Os ~55 hooks que fazem `.eq('org_id', effectiveOrgId)` / `p_org_id: effectiveOrgId`
  continuam funcionando sem mudança (o hook já entrega a org certa). NÃO precisa editá-los.
- CA: nenhuma referência visível a "organização/workspace/visualizar como" na UI; um usuário
  comum e um admin conseguem usar o produto inteiro; gate vitest + tsc + build verdes.

### Fase 4 — Validação
- Gate completo verde (vitest + deno test + typecheck + build).
- Teste E2E: criar usuário de teste (`TESTE_INTERNO`), logar, criar marca, gerar conteúdo,
  confirmar que tudo grava na org da casa e que a RLS bloqueia acesso não autenticado.
- Adversarial de segurança: provar que NÃO é possível (a) criar 2ª org, (b) um usuário ver
  dado de outro contexto, (c) burlar a RLS. A RLS por org deve continuar sendo a defesa.
- Documentar no repo/vault: o que foi removido, o que virou flag, e como reverter.

## 4. Arquivos-âncora (para você não caçar)

Banco (migrations do fonte):
- `orgs`/`profiles`/`user_roles`/`get_user_org_id`/RLS base: migration `..._a0706794-...sql`
- redefinição `get_user_org_id`: `..._8fecf889-...sql`
- trigger `handle_new_user` (auto-org): `..._c71bd7ed-...sql` e `..._19afb706-...sql`
- `is_super_admin` + policies super_admin: `..._a386a820-...sql`
- `can_generate_content`/`get_effective_limits`/`can_add_brand`: `..._2396fd62-...sql`

Edge functions:
- padrão de auth+tenant inline: `generate-content/index.ts:42-65`, gate quota `:68`
- resolução por API key: `agent-api/index.ts:1671-1742`
- criação de org no signup: `trial-signup/index.ts:203-222`
- admin cross-org: `delete-organization`, `admin-*`, `extend-trial`

Frontend:
- `src/contexts/SuperAdminOrgContext.tsx` (`useEffectiveOrgId`, l.82-84,120)
- `src/components/SuperAdminOrgSelector.tsx` + uso em `src/components/Layout.tsx:274-275`
- `src/hooks/useAuth.tsx` (`Profile.org_id`, l.9,139)
- `src/components/UserManagement.tsx` (criação de org, l.449-482/570-600/1042-1052/1323-1330)
- `src/components/admin/OrganizationsTab.tsx`, `src/hooks/useAdminOrganizations.ts`,
  `src/hooks/useDeleteOrganization.ts`

## 5. Armadilhas conhecidas (não erre)

- NÃO enfraqueça a RLS ao remover a UI de org. A RLS `org_id = get_user_org_id(auth.uid())`
  é o que impede acesso não autenticado — mantenha. "Single-tenant" não é "sem segurança".
- NÃO troque `org_id = get_user_org_id(...)` por `true`/`auth.role() = 'authenticated'` sem
  necessidade — isso abriria dados a qualquer usuário logado. Só faça se for a Estratégia B
  aprovada e com role-check no lugar.
- `handle_new_user` é `SECURITY DEFINER` e roda no signup: um erro aí quebra TODO cadastro.
  Teste o cadastro de ponta a ponta depois de mexer.
- `super_admin` aparece em policies e no front; remover cru quebra telas. Rebaixe com cuidado
  e rode o typecheck/gate.
- Quotas: afrouxar limite != remover o gate. Deixe o gate no lugar (só mude o número no plano).
```
