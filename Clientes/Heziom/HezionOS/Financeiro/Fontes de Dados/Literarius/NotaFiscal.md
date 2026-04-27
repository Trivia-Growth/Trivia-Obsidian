---
tags: [literarius, tabela, financeiro]
fonte: Literarius
tipo: tabela
---

# NotaFiscal

## Descrição

Notas fiscais emitidas e recebidas pela Literarius. As NFs de saída (`EntSai = 'S'`) com `GeraFinanceiro = 1` disparam a criação de títulos em [[TituloFinanceiro]]. Contém os valores totais da operação e informações fiscais completas.

---

## Colunas Relevantes para o Financeiro

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `idNotaFiscal` | bigint | PK |
| `Empresa` | int | Código da empresa |
| `Numero` | int | Número da NF |
| `Serie` | int | Série da NF |
| `Cliente` | int | FK → Parceiro |
| `EntSai` | char(1) | `'E'` = entrada, `'S'` = saída |
| `TipoNota` | int | Tipo de nota fiscal |
| `DataEmissao` | datetime | Data de emissão |
| `DataSaida` | datetime | Data de saída/entrega |
| `TotalProduto` | money | Subtotal de produtos |
| `Desconto` | money | Desconto |
| `OutrasDespesas` | money | Outras despesas |
| `ValorFrete` | money | Frete |
| `TotalImpostos` | money | Total de impostos (ICMS, IPI, PIS, COFINS) |
| `TotalNota` | money | Valor total da nota |
| `IcmsValor` | money | ICMS destacado |
| `IcmsStValor` | money | ICMS ST |
| `IpiValor` | money | IPI |
| `PisValor` | money | PIS |
| `CofinsValor` | money | COFINS |
| `CBSValor` | money | CBS (reforma tributária) |
| `IBSUFValor` | money | IBS estadual |
| `IBSMUNValor` | money | IBS municipal |
| `GeraFinanceiro` | bit | `1` = gera título em [[TituloFinanceiro]] |
| `MoveEstoque` | bit | `1` = movimenta estoque |
| `Cancelada` | bit | `1` = nota cancelada |
| `CanalVenda` | int | FK → CanalVenda |
| `FormaPagto` | int | FK → [[FormaPagto]] |
| `idPedidoVenda` | bigint | FK → [[PedidoVenda]] |
| `SiteIdPedido` | varchar(60) | ID do pedido no e-commerce (chave Tray) |
| `OperacaoFiscal` | int | FK → OperacaoFiscal — define o CFOP e se gera financeiro |
| `NFeChave` | varchar(50) | Chave de acesso da NF-e (44 dígitos) |
| `NFeStatus` | int | Status de transmissão na SEFAZ |

---

## Operações Fiscais Confirmadas (tabela OperacaoFiscal)

Campo crítico: `GeraFinanceiro` por operação determina se a NF gera título financeiro, independentemente do campo da própria NF.

| ID | Nome | GeraFinanceiro | Obs |
|----|------|---------------|-----|
| 6 | ACERTO DE CONSIGNAÇÃO DE VENDA | ✅ Sim | Acerto com parceiro gera receita |
| 71 | MERCADO LIVRE FULL 5106 | ❌ Não | ML Full operado diretamente pela ML — não gera título |
| … | (demais 18 operações mapeadas no banco) | — | Ver tabela `OperacaoFiscal` |

> ⚠️ **Canal MERCADO LIVRE - FULL (código 12)** aparece com faturamento muito baixo porque as NFs da operação Full são emitidas com `GeraFinanceiro = False` — o repasse é feito diretamente pela Mercado Livre e não passa pela NF normal.

---

## Usada por

- [[Pedidos e Vendas]] — documento fiscal da venda
- [[Contas a Receber]] — origem dos títulos quando `GeraFinanceiro = 1`

---

## Relações

- FK → [[PedidoVenda]] via `idPedidoVenda`
- FK → [[FormaPagto]] via `FormaPagto`
- 1:N → [[TituloFinanceiro]] (via `Origem` + `OrigemIdRegistro` no título)
- Conciliação Tray: `SiteIdPedido` = chave de match
