---
status: backlog
tipo: feature
sprint: 4
prioridade: alta
---

# STORY-011 — Contas Bancarias e Caixa

## Descricao

O cliente precisa registrar quais contas bancarias (e caixa fisico) ele possui. Cada lancamento sera vinculado a uma conta. O saldo de cada conta e calculado automaticamente.

## Contexto

A tabela `client_bank_accounts` ja existe no banco com RLS. Falta:
- UI para o cliente gerenciar suas contas
- Vincular conta ao lancamento (campo `bank_account_id` ja existe na tabela transactions)
- Calcular e exibir saldo por conta

## Criterios de Aceite

- [ ] Pagina /contas acessivel pelo menu lateral
- [ ] Lista de contas do cliente com: banco, agencia, conta, descricao, saldo atual
- [ ] Formulario para adicionar nova conta (banco, agencia, conta, descricao, saldo inicial)
- [ ] Editar dados de conta existente
- [ ] Desativar conta (soft delete — nao apaga lancamentos vinculados)
- [ ] Saldo calculado: saldo_inicial + sum(entradas) - sum(saidas) por conta
- [ ] Conta "Caixa" como opcao (sem agencia/numero)
- [ ] RLS: cliente so ve/edita suas contas
- [ ] Campo obrigatorio no lancamento: selecionar conta

## Banco de Dados

Tabela ja existe:
```sql
client_bank_accounts (
  id UUID PK,
  client_id UUID FK → clients,
  banco TEXT,
  agencia TEXT,
  conta TEXT,
  conta_contabil TEXT, -- codigo no plano de contas Contmatic (invisivel pro cliente)
  descricao TEXT,
  ativo BOOLEAN,
  created_at TIMESTAMPTZ
)
```

Adicionar:
```sql
ALTER TABLE client_bank_accounts ADD COLUMN saldo_inicial NUMERIC(14,2) DEFAULT 0;
```

## UI (Cliente)

```
┌─────────────────────────────────────────┐
│ Minhas Contas                    [+ Nova]│
├─────────────────────────────────────────┤
│ 🏦 Bradesco 5632-4                      │
│    Ag 0001 · Conta 5632-4               │
│    Saldo: R$ 45.230,00           [Editar]│
├─────────────────────────────────────────┤
│ 🏦 Caixa Fisico                         │
│    Saldo: R$ 1.200,00           [Editar] │
└─────────────────────────────────────────┘
```

## Notas

- O campo `conta_contabil` e preenchido pelo admin/contador na configuracao. O cliente nunca ve.
- Cada lancamento obrigatoriamente tem uma conta vinculada (bank_account_id)
- O saldo e sempre calculado (nao armazenado) para evitar inconsistencias
