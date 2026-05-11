---
tags: [literarius, tabela, financeiro]
fonte: Literarius
tipo: tabela
---

# PedidoVenda

## Descrição

Pedidos de venda realizados pela Literarius, incluindo vendas diretas e pedidos oriundos de e-commerce/marketplaces (identificados por `SiteIdPedido`). É a origem primária das notas fiscais e títulos a receber.

---

## Colunas Relevantes para o Financeiro

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `idPedidoVenda` | bigint | PK |
| `Empresa` | int | Código da empresa |
| `Numero` | int | Número do pedido |
| `TipoPedido` | int | Tipo (venda, devolução, etc.) |
| `Cliente` | int | FK → Parceiro (cliente) |
| `DataPedido` | datetime | Data do pedido |
| `Vendedor` | int | FK → colaborador vendedor |
| `CanalVenda` | int | FK → CanalVenda (direto, Tray, marketplace) |
| `Status` | int | Status do pedido |
| `TotalProduto` | money | Total dos produtos |
| `Desconto` | money | Desconto aplicado |
| `OutrasDespesas` | money | Outras despesas (ex: embalagem) |
| `ValorFrete` | money | Valor do frete |
| `TotalImpostos` | money | Total de impostos |
| `TotalPedido` | money | Total líquido do pedido |
| `FormaPagto` | int | FK → [[FormaPagto]] |
| `SiteIdPedido` | varchar(60) | ID do pedido no e-commerce/marketplace (chave Tray) |
| `SiteStatusPedido` | varchar(20) | Status no site de origem |
| `cNF` | bigint | FK → [[NotaFiscal]] gerada |
| `Agrupado` | bit | `1` = pedido agrupado |
| `PreFaturado` | bit | `1` = pré-faturado |

---

## Status do Pedido (campo `Status`) — Confirmados via DB

Fluxo normal: 1 → 2 → 8 → 9 → 3 → 4 → 5 → 6 → 10

| Código | Descrição | Fase |
|--------|-----------|------|
| 1 | Digitando | Criação |
| 2 | Aguardando Aprovacao | Aprovação |
| 12 | Liberar para Expedicao | Aprovação |
| 8 | Aguardando Separacao | Expedição |
| 9 | Separacao em Andamento | Expedição |
| 3 | Aguardando Conferencia | Expedição |
| 4 | Aguardando Faturamento | Faturamento |
| 5 | Nota Fiscal Gerada | Faturamento |
| 6 | Pedido Faturado | Concluído |
| 10 | Pedido Enviado | Concluído |
| 7 | Pedido Cancelado | Cancelado |
| 11 | Erro Faturamento | Erro |

> Para análise financeira, apenas `Status = 6` (Pedido Faturado) tem NF emitida e título gerado. `Status = 5` tem NF mas pode ainda não ter título se o processamento não completou.

---

## Cobertura Tray (SiteIdPedido)

| Ano | Total | Com SiteId | Sem SiteId | Cobertura |
|-----|-------|-----------|-----------|-----------|
| 2026 | 7.958 | 7.486 | 472 | 94% |
| 2025 | 11.309 | 10.703 | 606 | 95% |

Os ~5% sem SiteId são pedidos manuais ou de canais sem integração direta com a Tray.

---

## Usada por

- [[Pedidos e Vendas]] — origem das vendas
- [[Contas a Receber]] — via NF gerada

---

## Relações

- 1:1 → [[NotaFiscal]] via `cNF` / `idPedidoVenda`
- FK → [[FormaPagto]] via `FormaPagto`
- Conciliação Tray: `SiteIdPedido` = chave de match com API da Tray
