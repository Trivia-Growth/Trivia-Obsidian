# Supabase — Configuração e Migrations

## Identificação do Projeto

| Campo | Valor |
|---|---|
| **Project Ref** | `ouvfthknhqcciuothrqb` |
| **URL** | `https://ouvfthknhqcciuothrqb.supabase.co` |
| **Anon Key** | Armazenada em `.env.local` como `VITE_SUPABASE_PUBLISHABLE_KEY` |
| **Netlify Project ID** | `ec0f8589-6d01-48ad-ba70-aa4a4abd4e42` |
| **Região** | `sa-east-1` (São Paulo) |

---

## Estrutura de Schemas

O projeto usa **1 único projeto Supabase** com isolamento por schema de domínio. Cada schema tem RLS FORCE e políticas próprias.

| Schema | Domínio |
|---|---|
| `crm` | CRM, pipeline de vendas, contatos |
| `hub` | Hub de Transportadoras |
| `financeiro` | Financeiro (acesso restrito) |
| `lit_mirror` | Mirror read-only do Literarius |
| `audit` | Logs de auditoria append-only |
| `config` | Módulos e parâmetros globais |
| `lgpd` | Consentimentos e solicitações LGPD |
| `comercial`, `editorial`, `atendimento`, `pessoas`, `tarefas`, `fiscal`, `tray_mirror`, `agents` | Demais domínios HeziomOS |

---

## Migrations

Todas as migrations ficam em `supabase/migrations/` no monorepo. São aplicadas em ordem sequencial.

### `0000_init_schemas.sql` — Init Schemas e Extensões

- Cria os **15 schemas** de domínio
- Habilita as extensões:
  - `pgvector` — embeddings e busca semântica
  - `pg_cron` — jobs agendados no banco
  - `pg_net` — HTTP calls direto do banco (webhooks)
  - `uuid-ossp` — geração de UUIDs
- Define o workspace root da plataforma

### `0001_crm_schema.sql` — CRM Completo

- **55 tabelas** migradas do repo `heziom-sales` (`public.*` → `crm.*`)
- RLS FORCE em todas as tabelas
- Políticas de isolamento por workspace
- Colunas com dados sensíveis (tokens, segredos) com acesso revogado para `authenticated`
- Preserva toda lógica de negócio: pipeline, etapas, atividades, contatos, negócios

### `0002_hub_schema.sql` — Hub de Transportadoras

- **15 tabelas** migradas do repo `hubtransportadorashzm` (`public.*` → `hub.*`)
- Trigger anti-stale para webhooks com semântica **at-least-once** delivery
- Tabelas de rastreamento, cotações, transportadoras, eventos

### `0003_financeiro_schema.sql` — Financeiro

- Financeiro Phase 2
- **Fechado para `authenticated`** — somente `service_role` tem acesso
- Dados de títulos financeiros, contas bancárias, notas fiscais sincronizados via Deno sync

### `0004_lit_mirror_schema.sql` — Mirror Literarius

- Schema **read-only** para dados do sistema Literarius (ERP editorial)
- Escrita permitida **somente para o role `literarius-sync`**
- `authenticated` tem SELECT; INSERT/UPDATE/DELETE bloqueados via RLS

### `0005_audit_schema.sql` — Audit Append-Only

- Tabelas de log de auditoria para todas as operações críticas
- Política **RESTRICTIVE** que **nega UPDATE e DELETE para todos**, incluindo `service_role`
- Garantia de imutabilidade dos logs — uma vez escrito, não pode ser alterado
- Cobre: mudanças de dados, acessos, alterações de configuração

### `0006_config_lgpd_schema.sql` — Config + LGPD

- **Schema `config`**: tabelas de módulos ativos, parâmetros globais, feature flags
- **Schema `lgpd`**: consentimentos de usuários, solicitações de portabilidade/exclusão, registro de tratamento de dados
- Conformidade com LGPD (Lei 13.709/2018)

---

## Seed

O arquivo `supabase/seed.sql` cria os dados iniciais necessários para o funcionamento da plataforma:

- **Workspace Heziom** — workspace raiz com ID fixo
- **Pipeline padrão** — etapas de venda iniciais no CRM
- **Feature flags** — flags de módulos ativos/inativos
- **Parâmetros config** — parâmetros globais de configuração

---

## Como Aplicar as Migrations

### Pré-requisitos

```bash
# Instalar Supabase CLI
brew install supabase/tap/supabase

# Autenticar
supabase login
```

### Linkar e aplicar

```bash
# Na raiz do monorepo heziomos
supabase link --project-ref ouvfthknhqcciuothrqb

# Aplicar todas as migrations pendentes
supabase db push
```

### Verificar status

```bash
supabase migration list
```

---

## Como Criar o Usuário Admin

### Via Dashboard Supabase

1. Acesse [https://supabase.com/dashboard/project/ouvfthknhqcciuothrqb/auth/users](https://supabase.com/dashboard/project/ouvfthknhqcciuothrqb/auth/users)
2. Clique em **Invite User**
3. Digite `admin@editoraheziom.com.br`
4. O usuário receberá um e-mail de convite

### Promover a Superadmin

Após o usuário aceitar o convite, rode o seguinte SQL no **SQL Editor** do Dashboard:

```sql
-- Pegar o ID do usuário criado
SELECT id FROM auth.users WHERE email = 'admin@editoraheziom.com.br';

-- Inserir no workspace como superadmin (usar o ID retornado acima)
INSERT INTO crm.workspace_members (workspace_id, user_id, role)
VALUES (
  (SELECT id FROM crm.workspaces WHERE slug = 'heziom'),
  '<ID_DO_USUARIO>',
  'superadmin'
);
```

> O script completo está no `supabase/seed.sql` com comentários de como promover o admin.

---

## Como Gerar Tipos TypeScript

Os tipos são gerados a partir do schema do banco e ficam em `packages/database/src/types/`.

```bash
# Na raiz do monorepo
pnpm --filter @heziom/database generate
```

Isso roda internamente:

```bash
supabase gen types typescript --project-id ouvfthknhqcciuothrqb > src/types/database.types.ts
```

> Rodar após cada migration aplicada para manter os tipos sincronizados.

---

## GitHub Actions — Secrets Necessários

Configure os seguintes secrets em **Settings → Secrets and variables → Actions** no repositório `Org-Heziom/heziomos`:

| Secret | Valor |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | Token pessoal gerado em [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) |
| `SUPABASE_PROJECT_REF` | `ouvfthknhqcciuothrqb` |
| `SUPABASE_DB_PASSWORD` | Senha do banco (gerada na criação do projeto Supabase) |

Esses secrets são usados nos workflows:
- `supabase-migrate.yml` — aplica migrations ao mergear em `main`
- `edge-deploy.yml` — faz deploy de Edge Functions ao mergear em `main`

---

## Netlify — Variáveis de Ambiente

Configure em cada site Netlify (**Site Settings → Environment variables**):

| Variável | Valor |
|---|---|
| `VITE_SUPABASE_URL` | `https://ouvfthknhqcciuothrqb.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon key do projeto (retirar do `.env.local`) |

> A anon key é pública (publishable), mas nunca expor a `service_role` key nas variáveis do Netlify.

---

## Links Úteis

- [Dashboard Supabase — HeziomOS](https://supabase.com/dashboard/project/ouvfthknhqcciuothrqb)
- [Authentication → Users](https://supabase.com/dashboard/project/ouvfthknhqcciuothrqb/auth/users)
- [SQL Editor](https://supabase.com/dashboard/project/ouvfthknhqcciuothrqb/sql)
- [Table Editor](https://supabase.com/dashboard/project/ouvfthknhqcciuothrqb/editor)
- [[Monorepo — Estrutura e Setup]]
- [[STORY-014 — Setup Supabase Unificado]]
