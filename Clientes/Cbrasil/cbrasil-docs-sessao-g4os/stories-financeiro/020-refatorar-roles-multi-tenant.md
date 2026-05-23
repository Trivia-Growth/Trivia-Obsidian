# Story 020 — Refatorar Roles Multi-Tenant

> ✅ **Concluída** — Deploy: 2026-05-08

## Objetivo
Expandir o sistema de roles de 3 (`admin`, `contador`, `cliente`) para 4 roles com separação clara:

| Role | Escopo | Acesso |
|------|--------|--------|
| `superadmin` | Todas as orgs | Acesso total, gestão do sistema |
| `contador` | Clientes atribuídos | Multi-client, revisão, exportação, plano de contas |
| `admin_cliente` | Sua organização | Configuração completa do financeiro da org |
| `operador` | Sua organização | Só operacional (lançamentos, importar, extrato) |

## Mudanças

### 1. Banco de Dados
- ALTER CHECK constraint em `client_users.role` → `('superadmin', 'contador', 'admin_cliente', 'operador')`
- Migrar dados existentes: `admin` → `superadmin`, `cliente` → `admin_cliente`
- Atualizar `is_admin()` function → `is_superadmin()`
- Atualizar todas as RLS policies para os novos roles
- Políticas de escrita: `superadmin`, `contador`, `admin_cliente` podem INSERT/UPDATE/DELETE
- Políticas de leitura: `operador` pode SELECT nas tabelas do seu client_id

### 2. Frontend — Types
- `UserRole = 'superadmin' | 'contador' | 'admin_cliente' | 'operador'`
- Atualizar `useAuth` hook (hierarquia: superadmin > contador > admin_cliente > operador)

### 3. Frontend — Sidebar
- Sidebar condicional por role
- Section headers: "Operacional", "Contabilidade", "Administração"
- Operador vê: Dashboard, Lançamentos, Extrato, Importar, Configurações (read-only)
- Admin_cliente vê: + Configurações (edita)
- Contador vê: + Revisão, Exportar, Plano de Contas, Clientes, Usuários
- Superadmin vê: tudo

### 4. Frontend — Permissões inline
- Componentes de edição verificam `canEdit` baseado no role
- Operador: botões de criar/editar/deletar ficam ocultos

## Migração de Dados
```sql
UPDATE client_users SET role = 'superadmin' WHERE role = 'admin';
UPDATE client_users SET role = 'admin_cliente' WHERE role = 'cliente';
-- 'contador' permanece 'contador'
```

## Critérios de Aceite
- [x] 4 roles funcionando no banco com RLS
- [x] Login com cada role mostra sidebar correta
- [x] Operador não consegue criar/editar (UI oculta + RLS bloqueia)
- [x] Admin_cliente pode configurar contas/categorias/centros de custo
- [x] Contador acessa múltiplos clientes
- [x] Superadmin acessa tudo
- [x] Build sem erros TypeScript
