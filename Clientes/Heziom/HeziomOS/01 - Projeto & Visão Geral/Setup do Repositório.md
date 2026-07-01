---
tags: [heziom, infra, repositorio, setup, vigente]
status: vigente
criado: 2026-05-26
autor: Lucas Azevedo (Trivia Growth)
base: HeziomOS — Arquitetura v3, ADRs 0001-0010
---

# Setup do Repositório — heziomos

Passo a passo completo para criar e configurar o repositório de código do HeziomOS. Esse documento deve ser executado **uma vez**, no início do projeto, pelo Tech Lead. Depois fica como referência permanente.

> **Pré-requisitos:** `gh` CLI instalado e autenticado, conta GitHub do Tech Lead, acesso (ou capacidade de criar) a organização GitHub da Heziom.

---

## 1. Decisão: Organização GitHub da Heziom

### 1.1. Por que organização (e não conta pessoal)

Por contrato (§8 Escopo Técnico), o código é de **propriedade da Heziom**. Hospedar em conta pessoal do Tech Lead cria 3 problemas:

1. **Continuidade:** se o Tech Lead sair, a Heziom precisa transferir o repo (processo manual, sujeito a perda de histórico de issues/PRs).
2. **Compliance:** auditoria interna ou externa pode questionar "por que o código da empresa está numa conta pessoal?"
3. **Acesso:** ampliar time depois fica burocrático.

**Hospedar em organização da Heziom resolve tudo desde o dia 1.**

### 1.2. Descobrir se a Heziom já tem organização GitHub

```bash
# Lista todas as organizações que sua conta tem acesso
gh api user/orgs --jq '.[].login'

# Busca pública por orgs com nome "heziom"
gh api 'search/users?q=heziom+type:org' --jq '.items[] | {login, html_url}'
```

Se aparecer alguma org da Heziom e você não tem acesso, peça ao CEO para te adicionar como `Owner`.

### 1.3. Se não existe, criar

Criar organização não pode ser feito via CLI — só via web:

1. Acesse https://github.com/account/organizations/new
2. **Plan:** Free (suficiente para começar; private repos ilimitados; Actions com 2000 minutos/mês grátis)
3. **Organization name:** sugestão `heziom` (curto, alinhado com o domínio). Alternativas: `heziom-editora`, `heziom-os`
4. **Contact email:** e-mail do CEO ou financeiro
5. **This organization belongs to:** A business or institution
6. Pular convites na criação — adicionamos depois

### 1.4. Configurações iniciais da organização (Owner only)

Acessar `https://github.com/[org]/settings`:

- **General → Member privileges → Base permissions:** `Read` (segurança: ninguém ganha permissão de escrita por padrão)
- **General → Two-factor authentication:** **Require two-factor authentication for everyone in the organization**
- **Security → Authentication security → SSO** (se a Heziom usar Azure AD): configurar SAML SSO depois — não bloqueia o setup inicial
- **Billing:** confirmar que está no plano Free (sem cobrança automática)

---

## 2. Criar o repositório `heziomos`

### 2.1. Decisões registradas

| Item | Decisão |
|---|---|
| Nome | `heziomos` (sem hífen, mais curto, alinhado com `HeziomOS` no marketing) |
| Visibility | **Private** (obviamente) |
| License | Proprietary — sem arquivo LICENSE (default: "All rights reserved") |
| Default branch | `main` |
| Initialize with | README + .gitignore (Node) + sem LICENSE |

### 2.2. Criar via CLI

```bash
# Logado na conta certa
gh auth status

# Criar repo na org Heziom
gh repo create Org-Heziom/heziomos \
  --private \
  --description "HeziomOS — sistema operacional da Heziom (monorepo)" \
  --add-readme \
  --gitignore Node

# Clonar para a máquina local
cd ~/Documents/GitHub
gh repo clone Org-Heziom/heziomos
cd heziomos
```

---

## 3. Branch Protection (main)

Sem branch protection, qualquer pessoa pode fazer push direto em `main` e quebrar a produção. Configurar antes do primeiro PR.

### 3.1. Via CLI

```bash
gh api repos/Org-Heziom/heziomos/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["lint","typecheck","test"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true,"require_code_owner_reviews":true}' \
  --field restrictions=null \
  --field allow_force_pushes=false \
  --field allow_deletions=false \
  --field required_conversation_resolution=true
```

### 3.2. O que isso garante

| Regra | Efeito |
|---|---|
| Required status checks | PR não merge se lint/typecheck/test falharem |
| `strict: true` | PR precisa estar atualizado com `main` antes de merge |
| 1 approving review | Outro humano (ou Claude com revisão) precisa aprovar |
| Dismiss stale reviews | Mudanças após aprovação invalidam o review (precisa reaprovar) |
| Require code owner reviews | Áreas críticas (financeiro, agents, supabase) exigem review do owner específico |
| No force pushes | Histórico do `main` é imutável |
| No deletions | Branch `main` não pode ser deletada |
| Conversation resolution | Comentários abertos no PR bloqueiam merge |

### 3.3. Exceção operacional

`enforce_admins: false` — owners podem pular regras em emergência (hotfix de produção fora de horário). **Usar com extrema parcimônia e registrar incident report em `docs/runbooks/`.**

---

## 4. CODEOWNERS

Define quem é revisor obrigatório de cada área. Criado em `.github/CODEOWNERS`:

```
# Default owner — qualquer arquivo sem regra específica
*                                   @LmAzevedo94

# Áreas críticas — review obrigatório do owner
/apps/web/src/features/financeiro/  @LmAzevedo94
/apps/sync-agent/                   @LmAzevedo94
/apps/agent-runtime/                @LmAzevedo94
/packages/agents/                   @LmAzevedo94
/packages/whatsapp/                 @LmAzevedo94
/supabase/migrations/               @LmAzevedo94
/supabase/functions/                @LmAzevedo94
/.github/                           @LmAzevedo94
/docs/adr/                          @LmAzevedo94

# Quando ampliar time, adicionar:
# /apps/web/src/features/editorial/   @editor-tech-lead
# /apps/web/src/features/crm/         @crm-tech-lead
```

> Substituir `@LmAzevedo94` pelo handle real do Tech Lead. Adicionar mais owners conforme o time cresce.

---

## 5. Secrets do GitHub Actions

Necessárias para os workflows de CI/CD rodarem.

### 5.1. Lista de secrets

| Secret | Onde obter | Usado em |
|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | https://supabase.com/dashboard/account/tokens | Todos os workflows Supabase |
| `SUPABASE_PROJECT_REF_PROD` | Project Settings → General → Reference ID | `supabase-migrate.yml`, `edge-deploy.yml` (prod) |
| `SUPABASE_PROJECT_REF_STAGING` | mesmo, no projeto staging | Mesmos workflows (staging) |
| `SUPABASE_DB_PASSWORD_PROD` | Project Settings → Database → Connection string | Migrations |
| `SUPABASE_DB_PASSWORD_STAGING` | mesmo, staging | Migrations |
| `NETLIFY_AUTH_TOKEN` | https://app.netlify.com/user/applications | Deploy preview (opcional, Netlify integra direto) |
| `NETLIFY_SITE_ID` | Netlify site → Site settings → Site ID | Deploy preview |
| `SYNC_DEPLOY_SSH_KEY` | Gerada com `ssh-keygen` | (Adiada — só se ligar Tailscale no servidor) |

### 5.2. Configurar via CLI

```bash
gh secret set SUPABASE_ACCESS_TOKEN --repo Org-Heziom/heziomos
# (cola o token quando pedir)

gh secret set SUPABASE_PROJECT_REF_PROD --repo Org-Heziom/heziomos
# ...repetir para cada secret
```

### 5.3. Ambientes (Environments) para isolamento prod/staging

```bash
gh api repos/Org-Heziom/heziomos/environments/production --method PUT \
  --field deployment_branch_policy:='{"protected_branches":true,"custom_branch_policies":false}' \
  --field reviewers:='[{"type":"User","id":<ID_DO_LUCAS>}]'

gh api repos/Org-Heziom/heziomos/environments/staging --method PUT
```

- `production` exige aprovação manual antes de rodar workflows críticos (deploy de migration, deploy de edge function)
- `staging` roda automaticamente

---

## 6. Acesso e Permissões

### 6.1. Papéis no GitHub (organização)

| Papel | Capacidade | Quem |
|---|---|---|
| `Owner` | Tudo, incluindo billing e settings da org | CEO + Tech Lead |
| `Member` (padrão) | Acesso `Read` por padrão; permissão por repo | Devs futuros |

### 6.2. Papéis no repo `heziomos`

| Papel | Capacidade | Quem |
|---|---|---|
| `Admin` | Tudo no repo | Tech Lead |
| `Maintain` | Gerenciar issues, PRs, settings (não billing) | Devs sênior futuros |
| `Write` | Push em branches; abrir PR | Devs |
| `Triage` | Gerenciar issues sem write code | PM/QA |
| `Read` | Ver tudo | Stakeholders (CEO, diretores) |

### 6.3. Convites iniciais

```bash
# Convidar pessoa para a org (ela precisa aceitar por e-mail)
gh api orgs/heziom/invitations --method POST \
  --field email='ceo@heziom.com.br' \
  --field role='admin'

# Conceder acesso ao repo (depois que a pessoa aceitou)
gh api repos/Org-Heziom/heziomos/collaborators/<github-handle> \
  --method PUT \
  --field permission='read'   # ou maintain, write, etc.
```

---

## 7. Templates de Issue e PR

### 7.1. PR template

Criar `.github/pull_request_template.md`:

```markdown
## Story / Issue
Closes #<número> | STORY-XXX

## O que muda
<descrição curta>

## Checklist (Definition of Done)
- [ ] Build OK, TypeScript strict (sem `any`)
- [ ] Lint passa sem erros
- [ ] Testes adicionados/atualizados e passando
- [ ] Error Boundary + Loading/Error states (se UI)
- [ ] RLS verificado (se DB) | Zod + JWT (se Edge Function)
- [ ] Migration aplicada em staging (`supabase db push`)
- [ ] Edge Functions deployadas em staging (`supabase functions deploy`)
- [ ] Preview Netlify testado: happy path + erro + sem dados
- [ ] Docs atualizadas no vault (vault commit referenciado em "Vault PR")
- [ ] `git pull --rebase origin main` antes do push

## Vault PR (atualização de docs no Trivia-Obsidian)
<link do commit ou PR no Trivia-Obsidian — obrigatório se docs mudaram>

## Como testar
1.
2.
3.

## Screenshots / vídeos (se UI)
```

### 7.2. Issue templates

`.github/ISSUE_TEMPLATE/story.md`:

```markdown
---
name: Story
about: Nova funcionalidade (corresponde a uma STORY no vault)
title: '[STORY-XXX] '
labels: story, fase-X
---

## Vault
Link para a story: [[STORY-XXX]]

## Resumo
<2-3 linhas>

## Critérios de Aceite
- [ ] CA1 — ...
- [ ] CA2 — ...

## Dependências
- Bloqueia:
- Bloqueado por:
```

`.github/ISSUE_TEMPLATE/bug.md`:

```markdown
---
name: Bug
about: Comportamento incorreto em produção ou staging
title: '[BUG] '
labels: bug
---

## Ambiente
- [ ] Produção
- [ ] Staging
- [ ] Local

## Comportamento esperado

## Comportamento atual

## Passos para reproduzir
1.
2.

## Logs / screenshots

## Severidade
- [ ] Crítico — produção fora do ar
- [ ] Alto — funcionalidade quebrada
- [ ] Médio — UX prejudicada
- [ ] Baixo — cosmético
```

`.github/ISSUE_TEMPLATE/decisao.md`:

```markdown
---
name: Decisão (ADR)
about: Decisão arquitetural a registrar como ADR
title: '[ADR] '
labels: decision, architecture
---

## Contexto

## Opções consideradas

## Decisão proposta

## Trade-offs

## Próximo passo
Criar `docs/adr/00XX-titulo.md` após aprovação.
```

---

## 8. Comandos completos — setup do zero

Resumo executável (depois de criar org e configurar secrets):

```bash
# 1. Criar repo
gh repo create Org-Heziom/heziomos \
  --private \
  --description "HeziomOS — sistema operacional da Heziom (monorepo)" \
  --add-readme \
  --gitignore Node

# 2. Clonar
cd ~/Documents/GitHub
gh repo clone Org-Heziom/heziomos
cd heziomos

# 3. Inicializar monorepo
pnpm init
echo 'packages:
  - "apps/*"
  - "packages/*"' > pnpm-workspace.yaml

# 4. Estrutura base
mkdir -p apps/{web,sync-agent,agent-runtime}
mkdir -p packages/{database,shared,ui,integrations,whatsapp,agents,config}
mkdir -p supabase/{migrations,functions/_shared}
mkdir -p docs/{adr,runbooks}
mkdir -p .github/{workflows,ISSUE_TEMPLATE}

# 5. Configurar Turborepo
pnpm add -Dw turbo @biomejs/biome typescript vitest

# 6. CLAUDE.md, README.md, turbo.json, biome.json, tsconfig.json
# (gerar conforme templates do TRIVIAIOX)

# 7. Branch protection
gh api repos/Org-Heziom/heziomos/branches/main/protection \
  --method PUT \
  --input branch-protection.json   # arquivo com as regras de §3.1

# 8. CODEOWNERS
echo '*  @LmAzevedo94' > .github/CODEOWNERS

# 9. Templates
# (copiar conteúdo de §7)

# 10. Primeiro commit
git add -A
git commit -m "chore: inicializa monorepo heziomos conforme Arquitetura v3"
git push -u origin main
```

---

## 9. Validação final

Checklist após executar tudo acima:

- [ ] `gh repo view Org-Heziom/heziomos` mostra o repo privado
- [ ] `gh api repos/Org-Heziom/heziomos/branches/main/protection` mostra branch protection ativa
- [ ] `gh secret list --repo Org-Heziom/heziomos` lista todas as secrets necessárias
- [ ] Abrir um PR de teste: status checks rodam, review obrigatório, force push bloqueado
- [ ] `pnpm install` na raiz funciona sem erros
- [ ] `pnpm turbo run lint typecheck test` passa nos placeholders

---

## 10. Onde encontrar coisas

| O que | Onde |
|---|---|
| Código | https://github.com/Org-Heziom/heziomos |
| Docs | Este vault, `Clientes/Heziom/HeziomOS/` |
| Issues / Stories | Issues do repo + sincronizadas com vault (`Stories/STORY-XXX.md`) |
| ADRs | `docs/adr/` no repo |
| Runbooks | `docs/runbooks/` no repo |
| Supabase prod | Dashboard Supabase, projeto `heziomos-prod` |
| Supabase staging | Dashboard Supabase, projeto `heziomos-staging` |
| Netlify | Dashboard Netlify, site `heziomos` |
| Vault Obsidian | `Trivia-Obsidian/Clientes/Heziom/HeziomOS/` |

---

## 11. Próximos Passos (depois do setup)

1. Executar [[STORY-001 — Setup Infraestrutura]] (CA9–CA27 — Supabase, CI/CD, Sync Agent)
2. Criar ADRs em `docs/adr/0001` a `0010` conforme §2 da [[HeziomOS — Arquitetura v3]]
3. Convidar João (analista/PM) com permissão `Triage` para gerenciar issues
4. Convidar CEO/Diretor com permissão `Read` para acompanhar progresso
5. Iniciar STORY-002 (sync TituloFinanceiro)

---

## Referências

- [[HeziomOS — Arquitetura v3]] — ADRs 0001–0010
- [[STORY-001 — Setup Infraestrutura]] — critérios de aceite que dependem deste doc
- [[Setup João]] — setup do vault Obsidian (separado do repo de código)
- `gh` CLI docs: https://cli.github.com/manual/
- GitHub branch protection docs: https://docs.github.com/repositories/configuring-branches-and-merges-in-your-repository
