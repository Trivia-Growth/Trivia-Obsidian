---
tags: [literarius, tabela, financeiro]
fonte: Literarius
tipo: tabela
---

# CondicaoPagto

## Descrição

Condições de pagamento aplicadas a pedidos e títulos. Define o parcelamento, prazos e a forma de pagamento associada. Ex: "30/60/90 dias", "À vista no boleto", "2x cartão".

---

## Colunas Relevantes para o Financeiro

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `idCondicaoPagto` | int | PK |
| `Descricao` | varchar(150) | Nome da condição |
| `CondicaoPagto` | varchar(250) | Expressão de parcelamento (ex: "30,60,90") |
| `FormaPagto` | int | FK → [[FormaPagto]] |
| `Avista` | bit | `1` = à vista |
| `PermiteTroco` | bit | `1` = permite troco (PDV) |
| `Cartao` | bit | `1` = pagamento via cartão |
| `Portador` | int | FK → Portador padrão |
| `Inativa` | bit | `1` = condição desativada |
| `Taxa` | money | Taxa da condição |
| `Prazo` | int | Prazo total em dias |

---

## Usada por

- [[Pedidos e Vendas]] — condição aplicada no pedido
- [[Contas a Receber]] — determina geração de parcelas

---

## Relações

- FK → [[FormaPagto]] via `FormaPagto`
