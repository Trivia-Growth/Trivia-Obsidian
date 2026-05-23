# Plano: STORY-002 — Auth e Multi-tenancy

## Objetivo
Implementar autenticação com Supabase Auth, isolamento de dados por cliente via RLS, e três papéis (admin, contador, cliente).

---

## Entregas

### 1. Banco de Dados (Migration)
- Criar tabela `client_users` (user_id ↔ client_id + role)
- RLS policies em `client_users`, `transactions`, `clients`
- Policy padrão: cliente vê seus dados, contador vê clientes designados, admin vê tudo

### 2. Frontend — Auth Feature
- `src/features/auth/api/auth.ts` — login, logout, getSession
- `src/features/auth/hooks/useAuth.ts` — hook com estado do usuário
- `src/features/auth/components/LoginPage.tsx` — formulário funcional
- `src/features/auth/components/AuthGuard.tsx` — proteção de rotas

### 3. Integração
- Provider de auth no `providers.tsx`
- Router atualizado com guard
- Header com nome do usuário + logout
- Redirect para /login se não autenticado

---

## Não inclui (próximas stories)
- Cadastro de novos usuários (admin faz manualmente no Supabase por ora)
- UI de gestão de usuários
- Convite por email
