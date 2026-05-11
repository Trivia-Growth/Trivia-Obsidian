---
tags: [financeiro, modulo]
status: especificação
---

# Contas a Receber

## Objetivo

Gestão de todos os valores a receber pela Literarius: títulos gerados por vendas, parcelas, baixas (recebimentos) e conciliação bancária.

---

## Fontes de Dados — Literarius

| Tabela | Campos-chave | Uso |
|--------|-------------|-----|
| [[TituloFinanceiro]] | `TipoTitulo='R'`, `Valor`, `Vencimento`, `Situacao`, `Pago`, `Parcela`, `TotalParcela` | Títulos a receber; `Pago=1` indica liquidado |
| [[TituloFinanceiroBaixa]] | `DataBaixa`, `ValorBaixa`, `ValorDesconto`, `ValorMulta`, `ValorJuros`, `Conciliado` | Registro de cada recebimento (parcial ou total) |
| [[TituloFinanceiroRateio]] | `PlanoConta`, `CentroResultado`, `Percentual`, `Valor` | Rateio contábil do título por plano de contas |
| [[TituloFinanceiroAgrupado]] | `idTituloFinanceiro`, `Vencimento`, `Valor` | Agrupamento de títulos (boleto único para múltiplas parcelas) |
| [[ContaBancaria]] | `Descricao`, `BancoNumero`, `ContaNumero` | Conta destino do recebimento |
| [[FormaPagto]] | `Descricao`, `Taxa`, `Prazo` | Meio pelo qual o título será/foi recebido |

---

## Dados Reais Confirmados (via DB — abril 2026)

### Aging de Recebíveis em Aberto

| Faixa | Qtd títulos | Saldo | % |
|-------|-------------|-------|---|
| A vencer | 3.851 | R$ 371.964 | 16% |
| Vencido até 30d | 2.714 | R$ 285.182 | 12% |
| Vencido 31–60d | 3.326 | R$ 300.491 | 13% |
| Vencido 61–90d | 3.865 | R$ 363.643 | 15% |
| **Vencido > 90d** | **9.428** | **R$ 1.045.895** | **44%** |
| **TOTAL** | **23.184** | **R$ 2.367.177** | 100% |

> ⚠️ **84% do recebível está vencido.** Antes de levar ao CEO: verificar se os títulos > 90d são inadimplência real ou registros desatualizados (atacado com prazo diferenciado, consignações não baixadas, etc.).

### Recebimentos por Forma de Pagamento (últimos 12 meses)

| Forma | Valor recebido | % |
|-------|---------------|---|
| Cartão de Crédito | R$ 1.071.000 | 38% |
| PIX SITE | R$ 1.028.000 | 37% |
| PIX | R$ 587.000 | 21% |
| Boleto | R$ 161.000 | 6% |
| **Total** | **R$ 2.847.000** | 100% |

> PIX domina 58% dos recebimentos (SITE + avulso). Cartão representa 38%. Boleto apenas 6%.

---

## Fontes de Dados — Tray (a mapear)

- [ ] Status de pagamento por pedido (aprovado, pendente, estornado)
- [ ] Data de liquidação financeira no marketplace

---

## Regras de Negócio

- `TipoTitulo = 'R'` → a receber; `TipoTitulo = 'P'` → a pagar (ver [[Contas a Pagar]])
- `Situacao` controla o estado do título (aberto, baixado, cancelado — verificar domínio)
- Parcelas: `Parcela` e `TotalParcela` identificam a parcela dentro de um parcelamento; `idPrimeiraParcela` aponta para o título raiz
- `ValorAbatido` = valor abatido sem ser baixa formal (ex: crédito de cliente)
- Conciliação: `TituloFinanceiroBaixa.Conciliado` + `idExtratoBanco` ligam à conciliação bancária
- Agrupamento: quando `Agrupado = 1` o título foi agrupado em boleto único via `TituloFinanceiroAgrupado`

---

## Queries de Referência

```sql
-- Títulos a receber em aberto por vencimento
SELECT
    tf.idTituloFinanceiro,
    tf.Numero,
    tf.Emissao,
    tf.Vencimento,
    tf.Valor,
    tf.ValorPago,
    tf.Valor - tf.ValorPago AS Saldo,
    tf.Parcela,
    tf.TotalParcela,
    fp.Descricao AS FormaPagamento
FROM Literarius.dbo.TituloFinanceiro tf
LEFT JOIN Literarius.dbo.FormaPagto fp ON fp.Codigo = tf.FormaPagto
WHERE tf.TipoTitulo = 'R'
  AND tf.Pago = 0
ORDER BY tf.Vencimento

-- Recebimentos do mês
SELECT
    tfb.DataBaixa,
    SUM(tfb.ValorBaixa) AS TotalRecebido,
    SUM(tfb.ValorDesconto) AS TotalDesconto,
    SUM(tfb.ValorMulta + tfb.ValorJuros) AS TotalAcrescimos
FROM Literarius.dbo.TituloFinanceiroBaixa tfb
WHERE MONTH(tfb.DataBaixa) = MONTH(GETDATE())
  AND YEAR(tfb.DataBaixa) = YEAR(GETDATE())
GROUP BY tfb.DataBaixa
ORDER BY tfb.DataBaixa
```

---

## Módulos Relacionados

- [[Pedidos e Vendas]] — origem dos títulos
- [[DRE e Fluxo de Caixa]] — baixas alimentam o fluxo
- [[Mapa de Dados]]
