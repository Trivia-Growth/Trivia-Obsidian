---
tags: [financeiro, modulo]
status: especificação
---

# Pedidos e Vendas

## Objetivo

Consolidar as receitas geradas por pedidos de venda e notas fiscais emitidas pela Literarius, incluindo canais internos e integrações externas (Tray). Serve como ponto de entrada para o módulo de Contas a Receber.

---

## Fontes de Dados — Literarius

| Tabela | Campos-chave | Uso |
|--------|-------------|-----|
| [[PedidoVenda]] | `TotalPedido`, `DataPedido`, `Status`, `CanalVenda`, `SiteIdPedido` | Pedidos brutos, inclui pedidos do e-commerce via `SiteIdPedido` |
| [[NotaFiscal]] | `TotalNota`, `DataEmissao`, `EntSai`, `GeraFinanceiro`, `CanalVenda` | NFs emitidas; `GeraFinanceiro=1` dispara títulos em [[TituloFinanceiro]] |
| [[FormaPagto]] | `Descricao`, `Taxa`, `Prazo` | Meio de pagamento do pedido |
| [[CondicaoPagto]] | `Descricao`, `CondicaoPagto`, `Avista`, `Cartao` | Parcelamento e condições aplicadas |

---

## Fontes de Dados — Tray (a mapear)

- [ ] Endpoint de pedidos (`/orders`)
- [ ] Status de pagamento por pedido
- [ ] Comissões de marketplace

---

## Regras de Negócio

- Um `PedidoVenda` pode gerar uma ou mais `NotaFiscal`
- Somente NFs com `GeraFinanceiro = 1` e `EntSai = 'S'` geram títulos a receber
- Pedidos do Tray chegam com `SiteIdPedido` preenchido — chave de conciliação com a API
- `CanalVenda` identifica se a venda é direta, Tray, marketplace, etc.
- Descontos: `PedidoVenda.Desconto` e `NotaFiscal.Desconto` — considerar no cálculo de receita líquida

---

## Queries de Referência

```sql
-- Receita bruta por canal de venda (mês)
SELECT
    cv.Descricao AS Canal,
    SUM(nf.TotalNota) AS ReceitaBruta,
    SUM(nf.Desconto) AS Desconto,
    SUM(nf.TotalNota - nf.Desconto) AS ReceitaLiquida,
    MONTH(nf.DataEmissao) AS Mes,
    YEAR(nf.DataEmissao) AS Ano
FROM Literarius.dbo.NotaFiscal nf
LEFT JOIN Literarius.dbo.CanalVenda cv ON cv.Codigo = nf.CanalVenda
WHERE nf.EntSai = 'S'
  AND nf.GeraFinanceiro = 1
  AND nf.Cancelada = 0
GROUP BY cv.Descricao, MONTH(nf.DataEmissao), YEAR(nf.DataEmissao)
ORDER BY Ano, Mes, Canal
```

---

## Módulos Relacionados

- [[Contas a Receber]] — títulos gerados pelas NFs
- [[Mapa de Dados]]
