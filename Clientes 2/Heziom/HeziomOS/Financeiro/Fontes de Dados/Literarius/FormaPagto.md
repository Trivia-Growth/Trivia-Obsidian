---
tags: [literarius, tabela, financeiro]
fonte: Literarius
tipo: tabela
---

# FormaPagto

## Descrição

Cadastro dos meios de pagamento disponíveis (dinheiro, cartão, boleto, PIX, TED, etc.). Referenciada em títulos, pedidos e baixas para identificar como um valor foi ou será pago.

---

## Colunas Relevantes para o Financeiro

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `Codigo` | int | PK |
| `Descricao` | varchar(100) | Nome da forma de pagamento |
| `Avista` | bit | `1` = pagamento à vista |
| `CodigoExterno` | varchar(5) | Código para integração fiscal (SPED/NFe) |
| `Taxa` | money | Taxa percentual da forma de pagamento |
| `Prazo` | int | Prazo padrão em dias |

---

## Usada por

- [[Pedidos e Vendas]] — forma de pagamento do pedido
- [[Contas a Receber]] — meio de recebimento
- [[Contas a Pagar]] — meio de pagamento

---

## Relações

- Referenciada por [[Clientes 2/Heziom/HeziomOS/Financeiro/Fontes de Dados/Literarius/TituloFinanceiro]], [[Clientes 2/Heziom/HeziomOS/Financeiro/Fontes de Dados/Literarius/TituloFinanceiroBaixa]], [[Clientes 2/Heziom/HeziomOS/Financeiro/Fontes de Dados/Literarius/PedidoVenda]], [[Clientes 2/Heziom/HeziomOS/Financeiro/Fontes de Dados/Literarius/NotaFiscal]], [[Clientes 2/Heziom/HeziomOS/Financeiro/Fontes de Dados/Literarius/CondicaoPagto]]
