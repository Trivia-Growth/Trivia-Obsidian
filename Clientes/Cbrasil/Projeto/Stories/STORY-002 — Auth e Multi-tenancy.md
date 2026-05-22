---
id: STORY-002
titulo: "Auth e Multi-tenancy"
fase: 1
modulo: auth
status: concluido
prioridade: alta
agente_responsavel: ""
criado: 2026-05-07
atualizado: 2026-05-07
---

# STORY-002 — Auth e Multi-tenancy

## Descricao

Implementar autenticacao com Supabase Auth e isolamento de dados por cliente via RLS. Tres papeis: admin, contador, cliente.

## Criterios de Aceite

- [x] Login com email/senha funcionando
- [x] Tabela `client_users` criada com vinculo user_id ↔ client_id
- [x] RLS em todas as tabelas filtrando por client_id via client_users
- [x] Papel admin ve todos os dados (bypass no policy)
- [x] Papel contador ve apenas clientes designados
- [x] Papel cliente ve apenas seus dados
- [x] Rota protegida: redireciona para login se nao autenticado
- [x] Pagina de login com estados: loading, erro, sucesso
- [x] Role resolvido via client_users (nao via user_metadata — mais flexivel)

## Banco de Dados

```sql
CREATE TABLE client_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'cliente' CHECK (role IN ('admin', 'contador', 'cliente')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, client_id)
);

ALTER TABLE client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_users FORCE ROW LEVEL SECURITY;
```

## Policies RLS (exemplo para transactions)

```sql
CREATE POLICY "Cliente ve seus lancamentos"
  ON transactions FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT client_id FROM client_users WHERE user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM client_users
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

## Notas Tecnicas

- Supabase Auth ja esta habilitado no projeto
- Usar `user_metadata` para armazenar role no signup (configurado pelo admin)
- A tabela `client_users` permite um usuario estar vinculado a multiplos clientes (caso do contador)
