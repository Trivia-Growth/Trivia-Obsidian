# Operações de Banco de Dados

Procedimentos para migrações, backups e recuperação no Supabase.

---

## Migrações de Schema

### Regra principal

**Nunca altere tabelas diretamente pelo Supabase Studio em produção.** Toda alteração de schema deve ser uma migration SQL versionada no repositório.

### Onde ficam as migrations

```
supabase/
└── migrations/
    ├── 20260410_create_titulos_financeiros.sql
    ├── 20260415_add_observacao_to_titulos.sql
    └── 20260416_create_fornecedores.sql
```

Nomenclatura: `AAAAMMDD_descricao_curta.sql`

### Como criar uma migration

```sql
-- 20260416_add_observacao_to_titulos.sql

-- O que esta migration faz (sempre documente)
-- Adiciona campo observacao na tabela titulos_financeiros

ALTER TABLE titulos_financeiros
  ADD COLUMN IF NOT EXISTS observacao TEXT;

-- Se for adicionar NOT NULL com valor default:
ALTER TABLE titulos_financeiros
  ADD COLUMN IF NOT EXISTS cancelado BOOLEAN NOT NULL DEFAULT false;
```

> **`IF NOT EXISTS` / `IF EXISTS`:** sempre use. Torna a migration idempotente — pode rodar mais de uma vez sem erro.

### Aplicar a migration

```bash
# No Terminal, na raiz do repositório:
supabase db push
```

Se não tiver a CLI do Supabase instalada:
```bash
npm install -g supabase
supabase login
supabase link --project-ref [REF_DO_PROJETO]
```

O `REF_DO_PROJETO` está em **Supabase → Project Settings → General → Reference ID**.

### Verificar antes de aplicar

Sempre revise o SQL gerado antes de aplicar em produção:

```bash
supabase db diff
```

Mostra o que será alterado sem aplicar nada.

---

## Zero Downtime em Colunas NOT NULL

Adicionar uma coluna `NOT NULL` sem default em uma tabela com dados quebra a migration. Faça em duas etapas:

**Passo 1 — Adicionar nullable (migration 1):**
```sql
ALTER TABLE nome_tabela
  ADD COLUMN IF NOT EXISTS nova_coluna TEXT;
```

**Passo 2 — Atualizar dados existentes (migration 2, após confirmar backfill):**
```sql
-- Primeiro popule todos os registros:
UPDATE nome_tabela SET nova_coluna = 'valor_padrão' WHERE nova_coluna IS NULL;

-- Depois adicione a constraint:
ALTER TABLE nome_tabela
  ALTER COLUMN nova_coluna SET NOT NULL;
```

---

## Rollback de Migration

O Supabase **não tem rollback automático**. Para desfazer:

### Rollback simples (coluna adicionada, sem dados)

```sql
-- 20260416_rollback_add_observacao.sql
ALTER TABLE titulos_financeiros DROP COLUMN IF EXISTS observacao;
```

Crie como uma nova migration com o prefixo `rollback_`.

### Rollback de tabela criada

```sql
-- Drop em ordem inversa (respeitar foreign keys)
DROP TABLE IF EXISTS nova_tabela CASCADE;
```

> **Atenção:** `CASCADE` remove dados e relacionamentos. Use com cuidado e apenas quando os dados não são críticos.

### Quando NÃO fazer rollback

Se a tabela já tem dados de produção: **não faça rollback, corrija para frente** com uma nova migration que corrige o problema. Reversão destrutiva em produção exige autorização explícita do Lucas.

---

## Backup

### Backup automático (Supabase nativo)

O Supabase realiza backups automáticos diários em todos os planos pagos.

**Como acessar:**
1. Supabase Dashboard → seu projeto
2. **Database → Backups**
3. Lista dos últimos 7 dias (plano Pro) ou 30 dias (plano Team)

**Plano free:** backups não são garantidos. Para projetos em produção, use pelo menos o plano Pro ($25/mês).

### Backup manual (antes de operações de risco)

Sempre faça um backup manual antes de:
- Migrations que alteram colunas existentes
- Deletes ou updates em massa
- Mudanças estruturais em tabelas financeiras

```bash
# Exportar dump completo do banco
supabase db dump -f backup_$(date +%Y%m%d_%H%M%S).sql
```

Ou pelo Dashboard: **Database → Backups → Create a new backup**.

### Restaurar backup

1. Supabase Dashboard → **Database → Backups**
2. Clique em **"Restore"** no backup desejado
3. Confirme — isso **substitui** o banco atual pelos dados do backup
4. Aguarde (pode levar minutos dependendo do tamanho)

> **Aviso:** restaurar um backup apaga todas as alterações feitas depois da data do backup. Só restaure quando o estado atual estiver corrompido ou quando os dados novos puderem ser descartados.

---

## Checklist antes de migration em produção

- [ ] Migration testada em ambiente local ou em projeto Supabase de staging
- [ ] `IF NOT EXISTS` / `IF EXISTS` usados para tornar idempotente
- [ ] Backup manual criado via Dashboard
- [ ] Script de rollback documentado na migration ou como arquivo separado
- [ ] `supabase db diff` revisado antes de aplicar
- [ ] RLS revisado: se nova tabela, policies criadas imediatamente após a migration

---

## Deploy de Edge Functions

### Criar uma nova Edge Function

A estrutura de arquivos é:
```
supabase/
└── functions/
    ├── nome-da-funcao/
    │   └── index.ts
    └── _shared/
        ├── cors.ts      ← corsHeaders compartilhados entre funções
        └── errors.ts    ← problemResponse compartilhado
```

Criar o arquivo **não** deploya automaticamente. É necessário rodar o comando abaixo.

### Deployar uma Edge Function

```bash
# Deployar uma função específica (recomendado)
supabase functions deploy nome-da-funcao

# Deployar todas as funções de uma vez
supabase functions deploy
```

Rode sempre que:
- Criar uma nova Edge Function
- Alterar código de uma Edge Function existente
- Alterar os arquivos em `_shared/`

> **Lovable e Claude Code escrevem o código, mas não deployam.** O deploy precisa ser rodado manualmente no terminal após o commit.

### Verificar se o deploy funcionou

```bash
# Ver funções deployadas e versão
supabase functions list
```

Ou no Dashboard: **Supabase → Edge Functions** — a função deve aparecer com status "Active" e a data do último deploy.

---

## Variáveis de Ambiente das Edge Functions (Secrets)

### Variáveis automáticas (não precisam de configuração)

Estas três estão disponíveis em toda Edge Function automaticamente:

| Variável | Valor |
|----------|-------|
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_ANON_KEY` | Chave pública (anon) |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de admin (bypass RLS) |

Uso no código:
```typescript
Deno.env.get('SUPABASE_URL')!
Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
```

### Secrets customizados (webhooks, APIs externas)

Para qualquer outra variável (Teams webhook, chave de API externa, etc.):

```bash
# Adicionar ou atualizar um secret
supabase secrets set TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/...
supabase secrets set API_EXTERNA_KEY=valor

# Adicionar vários de uma vez
supabase secrets set CHAVE_A=valor1 CHAVE_B=valor2

# Ver quais secrets estão configurados (sem mostrar os valores)
supabase secrets list

# Remover um secret
supabase secrets unset CHAVE_ANTIGA
```

> Secrets são configurados **por projeto Supabase**. Se tiver um projeto de dev e um de prod, configure em ambos.

### CORS em produção

Toda Edge Function tem o CORS configurado como `*` durante o desenvolvimento. Antes de ir para produção, atualizar para o domínio exato do Netlify:

```typescript
// Antes (dev):
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  ...
};

// Depois (produção):
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://nome-do-projeto.netlify.app',
  ...
};
```

O domínio Netlify está em: **Netlify → Site configuration → General → Site information → Site URL**.

Após alterar o CORS, re-deployar a função:
```bash
supabase functions deploy nome-da-funcao
```

Se usar `_shared/cors.ts`, basta atualizar o arquivo compartilhado e re-deployar todas:
```bash
supabase functions deploy
```
