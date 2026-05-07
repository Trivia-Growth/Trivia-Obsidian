---
id: STORY-018
titulo: "Admin reseta senha de outro usuário (sem email) + senha sempre gerada"
fase: 1
modulo: "auth"
status: draft
prioridade: alta
agente_responsavel: "@dev"
criado: 2026-05-07
atualizado: 2026-05-07
---

# STORY-018 — Admin Reseta Senha de Outro Usuário

## Contexto

> Bug encontrado em produção em 2026-05-07: ao criar `adriano.ferreira@grupoprevix.com.br` via `/admin/usuarios` (fluxo da STORY-016), JG digitou a senha manualmente no `CreateUserDialog`. O usuário foi criado com `email_confirm: true` e `app_metadata` corretos (verificado no Supabase Dashboard), mas Adriano nunca conseguiu logar — `AuthApiError: Invalid login credentials` (HTTP 400) em todas as tentativas.
>
> **Causa raiz:** typo silencioso na digitação. O `Input` de senha do `CreateUserDialog` é `type="password"` por padrão (mostra dots), permite habilitar visualização (toggle olho), mas o admin não está obrigado a verificar antes de submeter. Se digitou errado, só percebe no `created.password` da tela de sucesso — e mesmo lá o admin pode copiar acreditando que é o que pretendia. Adriano recebeu uma senha que **não era** o que JG achava que tinha digitado.
>
> **Agravante:** o app não tem hoje **nenhuma forma** de o admin resetar a senha de outro usuário pelo UI. JG precisou abrir o Supabase Dashboard pra desbloquear o Adriano. Operação manual fora do app é fricção que vai voltar — em qualquer escala (10+ usuários internos da Previx), typos vão acontecer e admins precisam corrigir sem sair do app.
>
> Esta story resolve as duas pontas:
> 1. **Adiciona Edge Function `reset-user-password`** (admin-only) e botão "Resetar senha" por linha em `/admin/usuarios`.
> 2. **Remove o input manual de senha** do `CreateUserDialog` e do novo `ResetUserPasswordDialog` — só botão "Gerar senha". Charset já exclui chars confusos (`0`, `O`, `l`, `1`, `I`). Zero chance de typo do admin, mantém o ganho operacional da STORY-016 (sem SMTP, entrega manual da credencial), e elimina a classe inteira de bug que custou ~30min de debug hoje.
>
> A troca de senha pelo admin **NÃO** dispara o onboarding novamente — `user_metadata.onboarded_at` permanece. O admin reseta senha quando o usuário esqueceu/perdeu, não quando o usuário é novo.

## Spec de Referência

- [[STORY-016 — Criação de Usuários no Admin]] → padrão da Edge Function admin-only + dialog de senha gerada
- [[STORY-017 — Onboarding Guiado]] → confirma que `onboarded_at` em `user_metadata` permanece intocado em reset de senha pelo admin
- `architecture.md` no repo → ADR-008 (`app_metadata.user_role` só via service_role) + ADR-010 (bootstrap manual continua válido)
- `src/features/auth/components/CreateUserDialog.tsx` → padrão de dialog de credencial gerada + cópia
- `supabase/functions/create-user/index.ts` → padrão de Edge Function admin-only com Zod + JWT + `_shared/cors.ts` + `Deno.serve`
- [[../../../Documentos Trivia 2/Padrão Projetos/03 - Segurança/Edge Functions Seguras|Edge Functions Seguras]]

## Critérios de Aceite

### Backend — Edge Function `reset-user-password`

- [ ] **CA1 — Edge Function `reset-user-password`** em `supabase/functions/reset-user-password/index.ts`:
  - Endpoint POST: `{ userId: uuid, password: string }`
  - Validação Zod no input:
    - `userId` formato UUID
    - `password` mínimo 8 caracteres, com 1 maiúscula e 1 número (mesmas regras do `createUserSchema`)
  - Valida JWT do chamador via `auth.getUser()` — só `admin` passa, senão 403
  - **Bloqueia self-reset:** se `userId === caller.id`, retorna 422 com `code: "CANNOT_RESET_SELF"` e detail "Use o fluxo /reset-password pra trocar a sua própria senha". Justificativa: reset pelo admin é caminho de unblock pra OUTRO usuário; admin que perdeu a própria senha usa o fluxo padrão (envio por e-mail) ou é resetado manualmente via Supabase Dashboard.
  - Verifica que o `userId` existe em `auth.users` antes do update (via `supaAdmin.auth.admin.getUserById`); se não existe, retorna 404 com `code: "USER_NOT_FOUND"`.
  - Atualiza senha via `supaAdmin.auth.admin.updateUserById(userId, { password })`.
  - **NÃO toca em `user_metadata` nem em `app_metadata`** — `onboarded_at` permanece, papel permanece, unidade permanece.
  - Retorna 200 `{ userId, email }`.
  - Trata `ZodError` → 400 problem+json (mesma forma que `create-user`).
  - CORS via `_shared/cors.ts`, padrão RFC 7807 via `_shared/problem.ts`.
  - `Deno.serve` global (alinhado ao hotfix 7ec4176).
  - Logs com `reqId`, ação `password_reset`, `caller_id`, `target_user_id` — **nunca logar senha**.
  - Deploy via `supabase functions deploy reset-user-password`.

### Frontend — Schema e geração de senha

- [ ] **CA2 — Schema Zod** em `src/features/auth/schemas/auth.schema.ts`:
  - Novo `resetUserPasswordSchema = z.object({ userId: z.string().uuid(), password: <mesmas regras de senha> })`.
  - Tipo `ResetUserPasswordInput` exportado.
  - Reaproveitar a sub-expressão de senha (extrair pra `passwordSchema` interno se simplificar — opcional).

- [ ] **CA3 — Helper de geração de senha consolidado:**
  - Extrair `generateStrongPassword` do `CreateUserDialog.tsx` para `src/features/auth/utils/password.ts` (export named).
  - Mantém o charset atual (sem `0`, `O`, `l`, `1`, `I`, sem `<>`/`"`/`'`).
  - Mantém a garantia determinística de pelo menos 1 maiúscula e 1 número.
  - Tanto `CreateUserDialog` quanto `ResetUserPasswordDialog` consomem desta utility.

### Frontend — Dialog de reset

- [ ] **CA4 — Componente `ResetUserPasswordDialog`** em `src/features/auth/components/ResetUserPasswordDialog.tsx`:
  - Props: `{ open: boolean; onClose: () => void; userId: string; userEmail: string }`.
  - Estado interno em 3 fases: `idle` (mostrar email-alvo + botão "Gerar nova senha") → `confirming` (mostra senha gerada + botão "Confirmar reset" + "Cancelar") → `success` (mostra credencial copiável + botão "Concluir").
  - **Apenas senha gerada** — sem campo de digitação. O botão "Gerar nova senha" também atua como "Gerar de novo" caso o admin queira outra (com confirmação dupla, pra evitar admin gerar várias antes de copiar).
  - Mutation chama `supabase.functions.invoke("reset-user-password", { body: { userId, password } })`.
  - Em sucesso: invalida `["admin","users"]`, transita pra fase `success`, mostra `email + senha` com botão "Copiar" em ambos.
  - Em erro 422 `CANNOT_RESET_SELF`: toast "Use Esqueci minha senha pra trocar a sua própria" — não abre o dialog se for o user logado (CA5 já bloqueia botão).
  - Em erro 404 `USER_NOT_FOUND`: toast "Usuário não encontrado" + `usersQuery.refetch()`.
  - Em erro 403/500: toast genérico.
  - Aviso explícito antes do confirm: "Esta senha substitui a atual. O usuário será forçado a digitar a nova no próximo login. **Não há como recuperar a senha antiga.**"
  - Aviso pós-sucesso (mesmo padrão da STORY-016): "Copie a senha agora — ela não vai ser exibida novamente. Entregue ao usuário pelo canal interno."

### Frontend — Integração com `/admin/usuarios`

- [ ] **CA5 — Botão "Resetar senha"** em `src/routes/_authenticated/admin/usuarios.tsx`:
  - Em cada `<Card>` da lista de usuários, ao lado do `<Select>` de papel, adicionar um `<Button variant="outline" size="icon">` com ícone `KeyRound` (lucide-react) e `aria-label="Resetar senha"`.
  - **Esconder o botão na linha do próprio admin logado** — fonte: `useAuth().user?.id`. Justificativa: self-reset deve ir pelo fluxo padrão; manter UI consistente com a regra do backend.
  - Ao clicar: abre `ResetUserPasswordDialog` com o `userId` e `userEmail` do usuário daquela linha.
  - Tooltip via `Tooltip` (shadcn) com texto "Resetar senha".

### Frontend — Sem digitação manual de senha (corrige causa raiz)

- [ ] **CA6 — Remover input manual de senha do `CreateUserDialog`:**
  - Remove o `<Input id="password" ...>` editável — substitui por bloco "senha gerada" que mostra a senha (após admin clicar "Gerar senha"), com toggle de visibilidade e botão de re-gerar.
  - Botão "Criar usuário" fica **desabilitado** até o admin clicar em "Gerar senha" pelo menos uma vez (ou seja, até existir senha no estado).
  - Helper text: "A senha é gerada automaticamente — entregue ao usuário pelo canal interno."
  - **Não muda o backend `create-user`** (ele já valida senha forte; quem gera é o client).
  - Mantém o resto do fluxo intacto: success dialog continua mostrando email + senha + cópia.
  - **Justificativa documentada no componente:** "Geração-only previne typo silencioso (bug de 2026-05-07 com adriano.ferreira). Charset exclui chars confusos."

### Auditoria

- [ ] **CA7 — Logs estruturados na Edge Function** (audit log no `audit_log` adiado):
  - A tabela `audit_log` da STORY-011 tem constraint `action IN ('insert','update','delete')` e `entity_type IN ('pessoa','departamento')` — não comporta `user_password_reset` sem migration que altere os CHECKs e o `/admin/auditoria` pra renderizar essa categoria. Fora de escopo desta story.
  - Mantém apenas logs estruturados na Edge Function (`console.log` com `reqId`, `caller_id`, `target_user_id`, `target_email`) — visíveis em Supabase Dashboard → Edge Functions → Logs.
  - Story futura: "Audit log de eventos de auth" (reset, criação, troca de papel, login, logout) — exige migration + UI nova em `/admin/auditoria`.

### Testes

- [ ] **CA8 — Teste manual em produção:**
  - Admin cria editor via UI (fluxo STORY-016 com a mudança do CA6 — só gerada). Valida que login do editor funciona.
  - Admin reseta senha do editor via novo botão. Editor consegue logar com a nova senha; **não** vê onboarding de novo (`onboarded_at` preservado).
  - Tentativa de resetar a própria senha → botão escondido (CA5). Se chamar Edge Function direto → 422 `CANNOT_RESET_SELF`.
  - Tentativa de resetar `userId` inexistente (forjar via DevTools) → 404 `USER_NOT_FOUND`.
  - Não-admin (editor logado) chamando Edge Function direto → 403.
  - **Re-teste do bug original:** criar usuário novo via dialog atualizado (sem campo de senha digitável) → senha gerada; usuário consegue logar de primeira sem nenhum typo.

- [ ] **CA9 — Logs verificados:**
  - Supabase Dashboard → Edge Functions → Logs → `reset-user-password` mostra reset com `reqId`, `caller_id`, `target_user_id` e sem expor senha.

### Doc updates

- [ ] **CA10 — Documentação atualizada no mesmo PR:**
  - `PROJECT_REQUIREMENTS.md`: módulo "Autenticação e Permissões" — adicionar bullet "Admin reseta senha de outro usuário via `/admin/usuarios` (sem email). Senha sempre gerada — sem digitação manual."
  - `architecture.md`: adicionar Edge Function `reset-user-password` na lista; ADR-019 sobre a decisão "senha sempre gerada" (causa raiz do bug 2026-05-07).
  - `specs/technical/API_SPECIFICATION.md`: contrato da Edge Function `reset-user-password` (POST, request/response, codes).
  - `Roadmap.md` no vault: bullet STORY-018 e marcar ✅ ao concluir.
  - `00 - Índice.md` no vault: adicionar link pra STORY-018 quando concluída.

## Decisões já tomadas

- **2026-05-07 — Senha sempre gerada (não digitada)** (JG, durante o debug): elimina a classe de bug "typo silencioso" que custou ~30min hoje. Aceitação UX: charset já exclui chars confusos, e o admin sempre vê a senha em claro na tela de sucesso (mesmo padrão de hoje). Aplica-se a `CreateUserDialog` e `ResetUserPasswordDialog`.
- **2026-05-07 — Sem email em nenhum fluxo:** consistente com a decisão da STORY-016. Reset segue o mesmo modelo: admin gera, copia, entrega pelo canal interno.
- **2026-05-07 — Reset não dispara onboarding:** `user_metadata.onboarded_at` é preservado. Reset é caminho de unblock (esqueci senha), não primeiro-acesso. Se o usuário já passou pelo onboarding, não passa de novo.
- **2026-05-07 — Self-reset bloqueado:** admin que perdeu a própria senha usa o fluxo `/recover-password` (envio por e-mail) ou Supabase Dashboard. Manter dois caminhos pra mesma coisa cria ambiguidade; o reset admin existe pra unblock outros usuários.
- **2026-05-07 — Audit log obrigatório:** reset de senha por outra pessoa é evento de segurança. Tem que aparecer em `/admin/auditoria` pra rastreabilidade. Nunca logar a senha em si.

## Fora de Escopo

- Excluir/desativar usuário pela UI → continua na lista de stories futuras.
- Reset de senha pelo próprio usuário sem email → STORY futura se decidirmos abandonar SMTP totalmente.
- Histórico de tentativas de senha (rate limiting) → fora de escopo (Supabase Auth já tem rate limit nativo).
- Forçar troca periódica de senha → não há requisito Previx.
- Política de "senha não pode ser igual à última N" → fora de escopo (custo > ganho, mesma justificativa do CA6 da STORY-017).
- Importar usuários em lote → fora de escopo.

---

## Implementação

> Preenchido pelo `@dev`.

**Status:** `draft` (a iniciar)

**Branch/PR:** a definir

**Arquivos a criar:**
- `supabase/functions/reset-user-password/index.ts`
- `src/features/auth/components/ResetUserPasswordDialog.tsx`
- `src/features/auth/utils/password.ts` (utility extraída do `CreateUserDialog`)

**Arquivos a modificar:**
- `src/features/auth/schemas/auth.schema.ts` (adicionar `resetUserPasswordSchema`)
- `src/features/auth/components/CreateUserDialog.tsx` (remover input manual; consumir utility de senha)
- `src/routes/_authenticated/admin/usuarios.tsx` (botão "Resetar senha" + estado do dialog + esconder na própria linha)
- `PROJECT_REQUIREMENTS.md`
- `architecture.md` (lista de Edge Functions + ADR-019)
- `specs/technical/API_SPECIFICATION.md`
- Vault: `Roadmap.md`, `00 - Índice.md`

**Operação manual:**
- Bug urgente do `adriano.ferreira@grupoprevix.com.br`: resetar senha via Supabase Dashboard antes do deploy desta story (one-shot pra desbloquear). Após esta story em produção, próximos casos resolvem pela UI.

**Deploy:**
- `supabase functions deploy reset-user-password`
- Deploy do frontend automático via Netlify após push.

---

## QA

> Preenchido pelo `@qa`.

**Gate:** *(pendente)*

**Checklist:**
- [ ] CA1-CA10 validados
- [ ] Build sem erros, TypeScript strict (sem `any`)
- [ ] Edge Function deployed (`supabase functions list` mostra `reset-user-password`)
- [ ] Admin reseta senha de outro usuário via UI; usuário loga com senha nova
- [ ] `onboarded_at` preservado após reset (não vê tour de novo)
- [ ] Audit log mostra `user_password_reset` com actor + target em `/admin/auditoria`
- [ ] Self-reset bloqueado em UI (botão escondido) e backend (422)
- [ ] `userId` inexistente → 404
- [ ] Não-admin chamando direto → 403
- [ ] CreateUserDialog não tem mais input editável de senha; criação ainda funciona end-to-end
- [ ] Senha não aparece em logs do servidor nem em network logs do client após sucesso
- [ ] `npm audit` sem Critical/High

---

## Notas e Decisões

- `2026-05-07` — Story criada após debug em produção do `adriano.ferreira@grupoprevix.com.br`. Sintoma: 400 `Invalid login credentials` em todas as tentativas mesmo com usuário existente, email confirmado e app_metadata correto. Diagnóstico: typo silencioso na digitação manual da senha pelo admin no `CreateUserDialog`. JG resolveu o caso individual via Supabase Dashboard e pediu a feature de reset pela UI.
- `2026-05-07` — Decisão de remover input manual de senha **junto** com a feature de reset (não em story separada): o input manual é a causa raiz do bug; feature de reset sem essa correção só dá ferramenta pra remediar bugs futuros em vez de preveni-los. Custo de incluir é baixo (mesmo PR, mesmo componente).
- `2026-05-07` — Discutido se reset deveria forçar `onboarded_at = null` (forçar tour de novo). Descartado: tour é "primeiro acesso ao sistema", não "primeiro acesso após reset". Se usuário esqueceu senha, ele já conhece o app — não precisa repetir o tour.
