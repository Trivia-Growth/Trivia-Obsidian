---
id: STORY-004
titulo: "Registro de Lancamentos"
fase: 1
modulo: transacoes
status: concluido
prioridade: alta
agente_responsavel: ""
criado: 2026-05-07
atualizado: 2026-05-07
---

# STORY-004 — Registro de Lancamentos

## Descricao

Interface para o cliente registrar movimentacoes financeiras de forma simplificada. O formulario traduz linguagem financeira (entrada/saida, categoria, fornecedor) para partida dobrada automaticamente via Edge Function.

## Criterios de Aceite

- [ ] Formulario de lancamento funcional com campos: data, tipo, categoria, item, fornecedor, cpf_cnpj, valor, forma_pagamento, centro_custo, documento, observacao
- [ ] Campo tipo (toggle) filtra categorias disponiveis (entrada/saida)
- [ ] Campo categoria filtra itens (cascata)
- [ ] Edge Function `register-transaction` criada e deployada
- [ ] Edge Function resolve categoria → conta debito + credito
- [ ] Edge Function monta complemento via template do historico
- [ ] Lancamento inserido com status `pendente`
- [ ] Validacao Zod no input da Edge Function
- [ ] JWT validado — usuario autenticado obrigatorio
- [ ] Client_id resolvido via client_users (nao vem do frontend)
- [ ] Listagem de lancamentos do cliente com filtro por periodo
- [ ] Estados: loading, erro, sucesso, lista vazia

## Edge Function: register-transaction

```typescript
// Input (do frontend)
{
  data: "2025-04-01",
  tipo: "entrada",
  categoria_id: "uuid-da-categoria",
  fornecedor: "FULANO DE TAL",
  cpf_cnpj: "123.456.789-00",  // opcional
  valor: 1400.00,
  forma_pagamento: "PIX",       // opcional
  centro_custo: "TENDA",        // opcional
  documento: "NFS 95",          // opcional
  observacao: ""                 // opcional
}

// Processamento
1. Validar JWT → obter user_id
2. Buscar client_id via client_users
3. Buscar client_categories pelo categoria_id
4. Resolver conta_debito e conta_credito
5. Montar complemento via historico_template
6. INSERT em transactions

// Output
{ id: "uuid", status: "pendente" }
```

## Campos da tabela transactions (expandidos)

```sql
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS tipo TEXT CHECK (tipo IN ('entrada', 'saida'));
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES client_categories(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS bank_account_id UUID REFERENCES client_bank_accounts(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS fornecedor TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS forma_pagamento TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS centro_custo TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS documento TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS observacao_rejeicao TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS import_batch_id UUID;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS numero_lancamento INTEGER;
```

### Campos adicionais na tabela clients

```sql
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contmatic_codigo INTEGER;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS contmatic_apelido TEXT;
```

## Notas Tecnicas

- O cliente NAO precisa saber nada de contabilidade
- O frontend mostra linguagem financeira: "Entrada", "Ofertas", "PIX recebido"
- A conversao para contabil (debito 18, credito 319, etc.) e invisivel para o cliente
- O campo `complemento` da tabela transactions e preenchido pela Edge Function (nunca pelo cliente)
- Valor sempre positivo — o tipo (entrada/saida) determina a direcao
- Campo `observacao_rejeicao` usado pelo contador na STORY-006 (rejeitar com motivo)
- Campo `numero_lancamento` preenchido na exportacao (STORY-007) — nao no registro
- Campo `centro_custo` opcional — IPP nao usa, mas outros clientes podem precisar
