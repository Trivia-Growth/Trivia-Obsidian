---
status: backlog
tipo: feature
sprint: 4
prioridade: alta
---

# STORY-012 — Lancamentos CRUD Completo

## Descricao

Sistema completo de lancamentos financeiros para o cliente. Criar, visualizar, editar e excluir lancamentos com interface simples. O cliente pensa em "paguei", "recebi" — nunca em debito/credito.

## Criterios de Aceite

### Criar Lancamento
- [ ] Formulario com campos: data, tipo (Receita/Despesa), categoria, item, valor, conta, fornecedor/pagador, forma de pagamento, documento, observacao
- [ ] Tipo exibido como "Receita" / "Despesa" (nao entrada/saida)
- [ ] Categorias filtradas por tipo selecionado
- [ ] Conta bancaria obrigatoria (dropdown com contas ativas)
- [ ] Valor em formato brasileiro (R$ 1.234,56) com mascara
- [ ] CPF/CNPJ com mascara e validacao de formato
- [ ] Feedback de sucesso apos salvar

### Editar Lancamento
- [ ] Botao editar em cada lancamento com status 'pendente'
- [ ] Lancamentos 'revisado' ou 'exportado' NAO podem ser editados pelo cliente
- [ ] Lancamentos 'rejeitado' podem ser editados e reenviados
- [ ] Formulario pre-preenchido com dados atuais
- [ ] Ao salvar, recalcula traducao contabil automaticamente

### Excluir Lancamento
- [ ] Botao excluir apenas para lancamentos 'pendente'
- [ ] Confirmacao antes de excluir ("Tem certeza?")
- [ ] Exclusao real (DELETE) — nao precisa soft delete pois ainda nao foi processado
- [ ] Lancamentos revisados/exportados nunca podem ser excluidos pelo cliente

### Regras de Negocio
- [ ] Status 'pendente': cliente pode editar e excluir
- [ ] Status 'rejeitado': cliente pode editar (corrigir) e reenviar
- [ ] Status 'revisado': somente visualizacao para o cliente
- [ ] Status 'exportado': somente visualizacao para o cliente
- [ ] Traducao contabil (conta_debito, conta_credito, complemento) acontece automaticamente no backend

## UI (Cliente)

### Formulario de Lancamento
```
┌─────────────────────────────────────────────┐
│ Novo Lancamento                             │
├─────────────────────────────────────────────┤
│ [Data: 08/05/2026]  [Tipo: ▼ Despesa]      │
│                                             │
│ [Categoria: ▼ Despesas Gerais]              │
│ [Item: ▼ Energia Eletrica]                  │
│                                             │
│ [Conta: ▼ Bradesco 5632-4]                  │
│ [Valor: R$ ______]                          │
│                                             │
│ [Fornecedor: ___________]                   │
│ [CPF/CNPJ: ___.___.___/____-__]            │
│ [Forma Pgto: ▼ PIX]                        │
│ [Nº Documento: ______]                      │
│ [Observacao: ___________]                   │
│                                             │
│            [Cancelar]  [Salvar]             │
└─────────────────────────────────────────────┘
```

### Lista de Lancamentos
```
┌────────┬──────────┬────────────────┬───────────┬──────────┬─────────┐
│ Data   │ Tipo     │ Descricao      │ Valor     │ Conta    │ Acoes   │
├────────┼──────────┼────────────────┼───────────┼──────────┼─────────┤
│ 08/05  │ Despesa  │ CPFL Energia   │ -R$450,00 │ Bradesco │ ✏️ 🗑️   │
│ 07/05  │ Receita  │ Oferta Maria   │ +R$100,00 │ Bradesco │ ✏️ 🗑️   │
│ 06/05  │ Despesa  │ Material obra  │ -R$8.200  │ Bradesco │ 👁️      │
└────────┴──────────┴────────────────┴───────────┴──────────┴─────────┘
  👁️ = somente visualizacao (ja revisado/exportado)
  ✏️🗑️ = editavel/excluivel (pendente)
```

## API

### Endpoints necessarios
- `registerTransaction` — ja existe (Edge Function), precisa aceitar bank_account_id
- `updateTransaction(id, data)` — novo, com revalidacao de traducao
- `deleteTransaction(id)` — novo, valida status=pendente antes de deletar

### Edge Function: update-transaction
```typescript
// Validacoes:
// 1. JWT + client_id
// 2. Transaction pertence ao client_id
// 3. Status = 'pendente' ou 'rejeitado'
// 4. Recalcular traducao contabil (buscar categoria, resolver debito/credito/complemento)
// 5. UPDATE com novos dados + status volta pra 'pendente'
```

## Notas

- "Receita" e "Despesa" sao os termos pro cliente. Internamente sao "entrada" e "saida".
- O cliente NUNCA ve conta_debito, conta_credito ou complemento contabil
- A traducao acontece no Edge Function (backend) automaticamente
- Lancamentos importados via planilha tambem aparecem nesta lista e podem ser editados (se pendentes)
