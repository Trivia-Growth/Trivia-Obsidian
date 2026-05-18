# RLS Supabase — Template

**RLS (Row Level Security)** garante que cada usuário só acessa os dados que tem permissão. É obrigatório em toda tabela com dados sensíveis.

---

## Template Base (Copiar e Adaptar)

```sql
-- 1. Habilitar RLS na tabela
ALTER TABLE nome_tabela ENABLE ROW LEVEL SECURITY;
ALTER TABLE nome_tabela FORCE ROW LEVEL SECURITY;

-- 2. Policy de leitura — papéis com acesso total
CREATE POLICY "leitura_por_papel"
  ON nome_tabela
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt() ->> 'user_role' IN ('ceo', 'financeiro', 'analista')
  );

-- 3. Policy de escrita — somente financeiro e ceo
CREATE POLICY "escrita_por_papel"
  ON nome_tabela
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.jwt() ->> 'user_role' IN ('ceo', 'financeiro')
  );

-- 4. Policy de atualização
CREATE POLICY "atualizacao_por_papel"
  ON nome_tabela
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'user_role' IN ('ceo', 'financeiro'))
  WITH CHECK (auth.jwt() ->> 'user_role' IN ('ceo', 'financeiro'));

-- 5. Policy de exclusão — somente ceo
CREATE POLICY "exclusao_somente_ceo"
  ON nome_tabela
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'user_role' = 'ceo');
```

---

## Papéis Padrão

| Papel | Acesso típico |
|-------|--------------|
| `ceo` | Leitura total + aprovações + exclusão |
| `financeiro` | Leitura + escrita + atualização (operacional) |
| `analista` | Somente leitura de relatórios |

---

## Como Definir o Papel do Usuário

O papel é armazenado no JWT do Supabase Auth. Ao criar ou atualizar um usuário:

```typescript
// Na Edge Function (usando service_role — nunca no frontend)
const supaAdmin = createClient(url, serviceRoleKey);

await supaAdmin.auth.admin.updateUserById(userId, {
  user_metadata: { user_role: 'financeiro' }
});
```

E a policy lê via `auth.jwt() ->> 'user_metadata' ->> 'user_role'` ou `auth.jwt() ->> 'user_role'` dependendo de como o JWT é configurado.

---

## Verificar se RLS está ativo

```sql
-- Listar tabelas com RLS
SELECT tablename, rowsecurity, forcerowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Listar policies existentes
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

---

## Quando Usar service_role (Bypass de RLS)

O `service_role key` ignora RLS completamente. Usar apenas em:
- Edge Functions que precisam acessar dados de múltiplos usuários
- Scripts de sincronização (Deno local)
- Operações administrativas (criar usuário, migrar dados)

**Nunca** usar `service_role` no frontend — qualquer usuário poderia ver todos os dados de todos.

```typescript
// Edge Function — uso correto do service_role
const supaAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // somente aqui
);

// Frontend — usar apenas anon key (protegida por RLS)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
```

---

## Tabelas que Sempre Precisam de RLS

- Qualquer tabela com dados financeiros
- Tabelas com informações pessoais de clientes
- Tabelas com configurações de sistema (preços, parâmetros)
- Tabelas de log e auditoria

**Regra geral:** se a tabela existe no Supabase, tem RLS. Sem exceção.
