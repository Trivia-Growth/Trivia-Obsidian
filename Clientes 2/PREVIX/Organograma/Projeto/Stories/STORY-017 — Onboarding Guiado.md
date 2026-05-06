---
id: STORY-017
titulo: "Onboarding guiado no primeiro acesso (troca de senha + tour)"
fase: 1
modulo: "auth"
status: draft
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-06
atualizado: 2026-05-06
---

# STORY-017 — Onboarding Guiado no Primeiro Acesso

## Contexto

> A STORY-016 fechou o fluxo "admin cria usuário com senha inicial + entrega credencial pelo canal interno". Mas a primeira experiência do usuário criado é seca: ele loga com uma senha que o admin sabe, cai direto no `/dashboard` sem nenhuma orientação, e não tem incentivo claro pra trocar a senha (segurança operacional fica prejudicada — admin segue conhecendo a credencial).
>
> Esta story adiciona um onboarding obrigatório no primeiro acesso. O usuário recém-criado é redirecionado pra `/onboarding`, onde **(1)** é forçado a trocar a senha — o admin deixa de conhecer a credencial — e **(2)** passa por um tour curto (3-4 passos) que apresenta o panorama geral do sistema. Só depois consegue navegar pelo app normalmente.
>
> Sem dependência nova: usa `supabase.auth.updateUser` (client-side, sem Edge Function), persiste a flag em `user_metadata.onboarded_at`, e o tour é construído com componentes shadcn já presentes (Dialog/Card + estado local), sem adicionar lib externa.

## Spec de Referência

- [[STORY-016 — Criação de Usuários no Admin]] → criação que origina o estado "precisa de onboarding"
- `architecture.md` → ADR-008 (`app_metadata` x `user_metadata` — esta story usa user_metadata, que o próprio usuário pode atualizar via JWT)
- `src/features/auth/schemas/auth.schema.ts:12` → `resetPasswordSchema` (regras de senha reutilizadas)
- `src/features/auth/components/ResetPasswordForm.tsx` → padrão de form de troca de senha
- `src/routes/_authenticated.tsx` → guard de sessão onde entra a checagem `onboarded_at`

## Critérios de Aceite

### Backend / Auth — Flag de onboarding

- [ ] **CA1 — Persistência via `user_metadata.onboarded_at`** (ISO timestamp):
  - **Sem Edge Function nova** — `supabase.auth.updateUser({ data: { onboarded_at } })` é chamado pelo próprio usuário com seu JWT.
  - Convenção: presença de `user_metadata.onboarded_at` (string ISO) significa "onboarding concluído". Ausência significa "pendente".
  - Tipagem em `src/types/` (ou estendendo `Session`/`User` localmente) que reflita o campo opcional.
  - **Justificativa de não usar `app_metadata`:** o onboarding é UX, não controle de privilégio. A senha trocada via Supabase Auth já é a defesa real (admin perde acesso à credencial). user_metadata permite update pelo cliente sem Edge Function nova.

- [ ] **CA2 — Marcar usuários existentes como já onboarded** (one-shot manual no Supabase Dashboard antes do deploy):
  - Rodar uma única vez no SQL Editor:
    ```sql
    UPDATE auth.users
    SET raw_user_meta_data =
      COALESCE(raw_user_meta_data, '{}'::jsonb)
      || jsonb_build_object('onboarded_at', to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'))
    WHERE COALESCE(raw_user_meta_data->>'onboarded_at', '') = '';
    ```
  - Documentar o passo no PR description e em `architecture.md` (operação manual de migração de dados — usuários ativos hoje não devem ver o onboarding).
  - Após esse update, próximos logins desses usuários carregam `onboarded_at` no session — passam direto sem ver `/onboarding`.

### Frontend — Rota e Guard

- [ ] **CA3 — Rota `/onboarding`** (`src/routes/onboarding.tsx`):
  - Requer sessão (sem sessão → `redirect({ to: "/login" })` no `beforeLoad`).
  - Se já onboarded (`user_metadata.onboarded_at` presente) → `redirect({ to: "/dashboard" })`.
  - Layout standalone (sem header de admin/nav lateral) — usuário ainda não terminou onboarding, não deve ver navegação completa. Exceção: botão de logout visível (única saída além de completar).
  - 2 etapas internas com state local: `step: "password" | "tour"`.

- [ ] **CA4 — Guard em `_authenticated.tsx`**:
  - Após validar sessão, se `!session.user.user_metadata?.onboarded_at` E rota atual não é `/onboarding` → `redirect({ to: "/onboarding" })`.
  - Não pode haver caminho de bypass clicando em links — guard roda no `beforeLoad` de toda rota autenticada.
  - Ordem: `redirect` para `/login` se sem sessão tem prioridade sobre `redirect` para `/onboarding`.

### Frontend — Etapa 1: troca de senha

- [ ] **CA5 — Form de troca obrigatória de senha** (componente em `src/features/auth/components/OnboardingPasswordStep.tsx`):
  - Reutiliza `resetPasswordSchema` (mesmas regras: 8+ chars, 1 maiúscula, 1 número, confirmação).
  - Campos: `password`, `confirm` (ambos type=password com toggle de visibilidade).
  - Submit chama `supabase.auth.updateUser({ password })`.
  - Em sucesso: avança para etapa "tour" (state local). **Não** atualiza `onboarded_at` ainda — só ao final do tour.
  - Em erro: toast genérico "Não foi possível atualizar a senha", mantém na etapa.
  - Texto claro: "Defina sua senha pessoal — quem te deu acesso não saberá mais qual é."

- [ ] **CA6 — Não permitir reutilizar a senha inicial:**
  - O Supabase Auth não bloqueia "mesma senha" por padrão. Adicionar checagem client-side: se a nova senha for igual à digitada no login (que está em memória? não — não está). **Decisão pragmática:** deixar Supabase aceitar; o ganho de validação client-side é baixo e exigiria persistir senha em memória. Documentar isso no comentário do componente.

### Frontend — Etapa 2: tour panorama

- [ ] **CA7 — Tour com 4 passos** (componente em `src/features/auth/components/OnboardingTour.tsx`):
  - Implementação **sem lib externa** — Card centralizado com state local de `currentStep: 0..3`, botões "Voltar / Próximo / Concluir".
  - Cada passo: ícone + título + 1 parágrafo curto + (opcional) screenshot/preview SVG estático.
  - **Conteúdo dos passos** (o copy é parte da story — não inventar):
    1. **"Bem-vindo ao Organograma PREVIX"** — Apresenta o sistema: "Aqui você visualiza e gerencia o organograma do Grupo Previx. Substituímos o PDF estático por algo que vive e atualiza junto com a empresa." Mostra papel atribuído ao usuário (`session.user.app_metadata.user_role`).
    2. **"Organograma interativo"** — "A tela inicial é a visão hierárquica completa: arrasta pra navegar, scroll pra zoom, filtra por departamento. Use a busca pra achar uma pessoa rápido."
    3. **"Cadastro e hierarquia"** *(só pra admin/editor — visualizador pula)* — "Em **Pessoas** você cadastra e edita colaboradores; em **Hierarquia** você define quem reporta a quem com drag-and-drop. Toda mudança fica registrada em **Auditoria** (admin)."
    4. **"Exportação"** — "Geração de PDF e PNG do organograma vivo, com a identidade visual oficial. Ideal pra mandar a clientes finais ou imprimir."
  - **Adaptação por papel:** visualizador vê 3 passos (1, 2, 4). Admin/editor vê 4.
  - Botão "Concluir" no último passo:
    - Chama `supabase.auth.updateUser({ data: { onboarded_at: new Date().toISOString() } })`.
    - Em sucesso: `supabase.auth.refreshSession()` pra recarregar `user_metadata` no client (roteador depende do session).
    - Redireciona pra `/dashboard`.
  - Botão "Voltar" no primeiro passo: desabilitado.

### Auth flow / sessão

- [ ] **CA8 — Após troca de senha, sessão segue válida:**
  - `supabase.auth.updateUser({ password })` mantém o JWT atual válido (testar — Supabase às vezes invalida em outros devices, mas no mesmo client persiste). Não deve forçar relogin.
  - Se Supabase invalidar (sb retorna erro de session expirada), tratar com `refreshSession()` ou — pior caso — redirecionar pra `/login` com toast "Senha trocada — entre novamente".

- [ ] **CA9 — Refresh de session após `onboarded_at`:**
  - O JWT em cache não tem `onboarded_at` ainda. Após `updateUser({ data })`, chamar `supabase.auth.refreshSession()`.
  - Validar que o roteador re-executa o `beforeLoad` do `_authenticated` após refresh — se não reexecutar, forçar via invalidate do query client de auth.

### Header / UI fora do onboarding

- [ ] **CA10 — Logout durante onboarding:**
  - Botão "Sair" visível no canto superior direito da rota `/onboarding`. É a única saída pra quem não quer completar.
  - Ao deslogar: `supabase.auth.signOut()` + redirect `/login`.

### Testes

- [ ] **CA11 — Teste manual em produção:**
  - Admin cria um novo `editor` via `/admin/usuarios` (fluxo STORY-016).
  - Sair, logar com a credencial entregue → redireciona automaticamente pra `/onboarding`.
  - Tentar abrir `/dashboard` na URL → guard redireciona de volta pra `/onboarding`.
  - Trocar senha (regras válidas) → avança pra tour.
  - Tour: 4 passos, "Voltar" funciona, "Concluir" no fim → redireciona pra `/dashboard`.
  - Logout, login de novo → cai direto em `/dashboard` (não vê onboarding de novo).
  - Repetir com `visualizador` (criado com `unidade_id`): vê 3 passos no tour, completa, vai pra `/dashboard`.
  - Logar como admin **legacy** (existente antes do deploy + SQL one-shot do CA2): NÃO vê onboarding.

- [ ] **CA12 — Teste de bypass:**
  - Logado mas com `onboarded_at` ausente, abrir `/admin/pessoas` direto pela URL → guard redireciona pra `/onboarding`.
  - Mesma coisa pra `/admin/usuarios`, `/admin/hierarquia`, `/dashboard`.

### Doc updates

- [ ] **CA13 — Documentação atualizada no mesmo PR:**
  - `PROJECT_REQUIREMENTS.md`: módulo "Autenticação e Permissões" — adicionar bullet "Primeiro acesso de qualquer usuário criado pelo admin passa por onboarding obrigatório (`/onboarding`): troca de senha + tour de 3-4 passos."
  - `architecture.md`: nota operacional sobre o SQL one-shot do CA2 (migração de usuários existentes para `onboarded_at`). Eventualmente um ADR-019 sobre a escolha `user_metadata` vs `app_metadata` pra esta flag.
  - `Roadmap.md` no vault: adicionar bullet STORY-017 e marcar ✅ ao concluir.

## Decisões já tomadas

- **2026-05-06 — `user_metadata.onboarded_at` em vez de `app_metadata`** (JG): onboarding é UX, não controle de privilégio. user_metadata permite update direto pelo client (sem Edge Function nova) e é suficiente — a defesa real contra "admin sabe a senha" é a troca em si via Supabase Auth.
- **2026-05-06 — Tour custom em vez de lib externa** (`react-joyride`/`driver.js`): apenas 3-4 passos, sem necessidade de spotlight/highlight de DOM. Card centralizado é simples e não adiciona dependência. Se a complexidade crescer numa Fase futura, reavaliamos a lib.
- **2026-05-06 — Senha não bloqueia repetição da inicial:** validar isso exigiria persistir a senha original em memória ou enviar pra um endpoint que a compare. Custo > ganho. O fato de o usuário ser **forçado** a digitar uma senha cobrindo as regras já é o suficiente operacionalmente.
- **2026-05-06 — Onboarding bloqueante** (sem botão "pular"): o ganho operacional (admin deixa de conhecer credencial) só acontece se a troca for forçada.
- **2026-05-06 — SQL one-shot pra usuários legacy:** evita um falso "primeiro acesso" para todo mundo que já está usando o sistema. Roda uma única vez no Dashboard antes/junto do deploy.

## Fora de Escopo

- Tour contextual em outras telas (tooltips por feature, "?" no header) → story futura, se necessário.
- Forçar troca periódica de senha (a cada N dias) → fora de escopo (não há requisito Previx).
- Multi-idioma do tour → texto em português apenas (consistente com o resto do app).
- Mostrar tour de novo via UI (botão "Rever onboarding") → não solicitado; pode virar feature futura.
- Email de boas-vindas → STORY-016 já decidiu não usar SMTP; a entrega da credencial segue manual.

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** `draft` (aguardando início)

**Branch/PR:** `feat/story-017-onboarding-guiado` → a abrir

**Arquivos a criar:**
- `src/routes/onboarding.tsx`
- `src/features/auth/components/OnboardingPasswordStep.tsx`
- `src/features/auth/components/OnboardingTour.tsx`

**Arquivos a modificar:**
- `src/routes/_authenticated.tsx` (guard `onboarded_at`)
- `src/features/auth/schemas/auth.schema.ts` (se precisar de schema dedicado pra onboarding — provavelmente reutiliza `resetPasswordSchema`)
- `PROJECT_REQUIREMENTS.md`
- `architecture.md`
- Vault: `Roadmap.md`

**Operação manual antes do deploy do frontend:**
- Rodar o `UPDATE auth.users …` do CA2 no Supabase SQL Editor (uma única vez).

---

## QA

> Preenchido pelo `@qa`.

**Gate:** —

**Checklist:**
- [ ] CA1-CA13 validados
- [ ] Build sem erros, TypeScript strict (sem `any`)
- [ ] SQL one-shot do CA2 executado em produção antes do deploy do frontend
- [ ] Usuário recém-criado é forçado a `/onboarding` em qualquer rota
- [ ] Trocar senha funciona; tour avança/volta; "Concluir" persiste `onboarded_at` e redireciona
- [ ] Logout durante onboarding funciona
- [ ] Usuário legacy (já tinha `onboarded_at` via SQL) NÃO vê onboarding
- [ ] Visualizador vê 3 passos; admin/editor vê 4
- [ ] `npm audit` sem Critical/High

---

## Notas e Decisões

- `2026-05-06` — Story criada após STORY-016 fechar (PR #48 + redeploy de Edge Functions com fix do preflight 204). JG decidiu: usuário recém-criado deve ser forçado a trocar senha + ver panorama geral do sistema.
- `2026-05-06` — Sem lib de tour: 4 passos com Dialog/Card é suficiente. Coerência com a regra do CLAUDE.md ("não introduzir abstrações além do necessário").
