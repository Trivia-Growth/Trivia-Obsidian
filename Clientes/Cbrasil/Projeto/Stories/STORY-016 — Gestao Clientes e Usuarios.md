---
id: STORY-016
titulo: "Gestao Clientes e Usuarios"
fase: 1
modulo: admin
status: concluido
prioridade: alta
agente_responsavel: ""
criado: 2026-05-08
atualizado: 2026-05-08
---

# STORY-016 — Gestao de Clientes e Usuarios

## Descricao

Painel administrativo para a C. Brasil gerenciar seus clientes e os usuarios vinculados a cada cliente. Essencial para multi-tenancy funcional onde novos clientes sao adicionados sem tocar no banco diretamente.

## Contexto

Hoje os clientes e usuarios existem no banco (tabelas `clients` e `client_users`) mas foram criados manualmente via SQL/seed. Nao ha UI para:
- Criar novo cliente
- Vincular usuarios a clientes
- Gerenciar roles
- Configurar dados Contmatic do cliente

## Criterios de Aceite

### Gestao de Clientes (role: admin)
- [ ] Pagina /admin/clientes listando todos clientes
- [ ] Criar novo cliente: nome, CNPJ, contmatic_codigo, contmatic_apelido
- [ ] Editar dados do cliente
- [ ] Ativar/desativar cliente (soft delete)
- [ ] Ver resumo: qtd lancamentos, usuarios vinculados, ultima atividade
- [ ] Filtro: ativos / inativos / todos

### Gestao de Usuarios (role: admin)
- [ ] Dentro de cada cliente: lista de usuarios vinculados
- [ ] Convidar novo usuario: email + role (cliente/contador)
- [ ] Convite cria conta no Supabase Auth + vincula em client_users
- [ ] Alterar role de usuario existente
- [ ] Remover vinculo usuario-cliente (sem deletar a conta)
- [ ] Um usuario pode estar vinculado a multiplos clientes (ex: contador)

### Configuracao Contmatic (role: admin/contador)
- [ ] Dentro de cada cliente: aba "Config Contmatic"
- [ ] Campo: Codigo empresa no Contmatic
- [ ] Campo: Apelido (nome abreviado)
- [ ] Vinculo com conta bancaria → conta_contabil
- [ ] Preview: "Ao exportar, os lancamentos saiRao com codigo X"

### Seguranca
- [ ] Apenas role='admin' acessa /admin/clientes
- [ ] Contador ve apenas seus clientes vinculados
- [ ] Cliente nao ve nada de admin
- [ ] RLS reforçado: admin ve tudo, contador ve seus clientes, cliente ve so o seu

## UI

### Lista de Clientes
```
┌─────────────────────────────────────────────────────────────┐
│ Clientes                              [+ Novo Cliente]      │
│ [▼ Todos]  [🔍 Buscar...]                                   │
├─────────────────────────────────────────────────────────────┤
│ IPP - Igreja Pentecostal da Promessa                        │
│   Contmatic: 507 · 2 usuarios · 408 lancamentos            │
│   Ultimo lancamento: 07/05/2026               [Gerenciar →]│
├─────────────────────────────────────────────────────────────┤
│ Igreja Batista Central                                      │
│   Contmatic: 512 · 1 usuario · 0 lancamentos               │
│   Sem lancamentos                            [Gerenciar →] │
└─────────────────────────────────────────────────────────────┘
```

### Detalhe do Cliente
```
┌─────────────────────────────────────────────────────────────┐
│ IPP - Igreja Pentecostal da Promessa                        │
│ CNPJ: 12.345.678/0001-90                                   │
├──────────────┬──────────────────────────────────────────────┤
│ [Geral] [Usuarios] [Contmatic] [Categorias] [Contas]       │
├──────────────┴──────────────────────────────────────────────┤
│                                                             │
│ Tab: Usuarios                                               │
│                                                             │
│ ┌───────────────────────────────┬────────┬────────────────┐│
│ │ Email                         │ Role   │ Acoes          ││
│ ├───────────────────────────────┼────────┼────────────────┤│
│ │ tesoureiro@ipp.org.br         │Cliente │ [Editar][Remov]││
│ │ teste@cbrasil.com.br          │Admin   │ [Editar]       ││
│ └───────────────────────────────┴────────┴────────────────┘│
│                                                             │
│ [+ Convidar Usuario]                                        │
└─────────────────────────────────────────────────────────────┘
```

## Banco de Dados

Tabelas ja existem (`clients`, `client_users`). Adicionar:

```sql
-- Campos adicionais em clients (se nao existem)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS cnpj TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS email_contato TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS telefone TEXT;

-- Indice para busca
CREATE INDEX IF NOT EXISTS idx_clients_nome ON clients(nome);
```

## Edge Functions Necessarias

### invite-user
```typescript
// 1. Criar conta no Supabase Auth (generateLink ou admin.createUser)
// 2. Inserir em client_users com role e client_id
// 3. Enviar email de convite (Supabase Auth envia automaticamente)
```

## Notas

- O convite de usuario usa `supabase.auth.admin.createUser()` com `emailRedirectTo`
- O service_role_key e necessario na Edge Function para criar usuarios
- Um contador pode ser vinculado a multiplos clientes (padrao para equipe interna)
- Admin ve TODOS clientes (sem filtro de client_id no RLS)
- A navegacao /admin so aparece no menu para role='admin'
