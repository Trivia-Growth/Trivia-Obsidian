---
tags: [financeiro, modulo]
status: especificação
---

# Contas a Pagar

## Objetivo

Gestão de todos os valores a pagar pela Literarius: fornecedores, despesas operacionais, comissões, direitos autorais e encargos. Inclui controle de remessas bancárias e autorizações de pagamento.

---

## Fontes de Dados — Literarius

| Tabela | Campos-chave | Uso |
|--------|-------------|-----|
| [[TituloFinanceiro]] | `TipoTitulo='P'`, `Valor`, `Vencimento`, `Situacao`, `Pago`, `idContasPagarConfig` | Títulos a pagar |
| [[TituloFinanceiroBaixa]] | `DataBaixa`, `ValorBaixa`, `ValorDesconto`, `ValorMulta`, `ValorJuros`, `TipoBaixa` | Registro do pagamento realizado |
| [[TituloFinanceiroBaixaRateio]] | `PlanoConta`, `CentroResultado`, `ValorBaixa` | Rateio contábil do pagamento |
| [[ContaBancaria]] | `Descricao`, `BancoNumero`, `ContaNumero` | Conta de origem do pagamento |
| [[FormaPagto]] | `Descricao`, `Taxa`, `Prazo` | Meio de pagamento (boleto, TED, PIX) |
| `ContasPagarConfiguracao` | `FormaPagamento`, `Convenio`, `ContaBancaria`, `NossoNumero` | Configuração de convênio bancário para remessa |

---

## Fontes de Dados — Tray (a mapear)

- [ ] Comissões de marketplace debitadas por pedido
- [ ] Tarifas de gateway de pagamento

---

## Regras de Negócio

- `TipoTitulo = 'P'` → a pagar
- `DataPermissao` + `UsuarioPermissao` → campos de autorização do pagamento (aprovação dupla)
- `idRemessa` + `DataRemessa` → controle de remessa bancária (arquivo CNAB)
- `ValorTaxa` → tarifa bancária associada ao título
- `VencimentoOriginal` → vencimento antes de renegociação/prorrogação
- `idContasPagarConfig` → liga ao convênio bancário usado para emissão do boleto/remessa

---

## Queries de Referência

```sql
-- Contas a pagar em aberto por vencimento
SELECT
    tf.idTituloFinanceiro,
    tf.Numero,
    tf.Vencimento,
    tf.Valor,
    tf.ValorPago,
    tf.Valor - tf.ValorPago AS Saldo,
    tf.DataPermissao,
    tf.UsuarioPermissao,
    fp.Descricao AS FormaPagamento,
    cb.Descricao AS ContaBancaria
FROM Literarius.dbo.TituloFinanceiro tf
LEFT JOIN Literarius.dbo.FormaPagto fp ON fp.Codigo = tf.FormaPagto
LEFT JOIN Literarius.dbo.ContaBancaria cb ON cb.idContaBancaria = tf.ContaBancaria
WHERE tf.TipoTitulo = 'P'
  AND tf.Pago = 0
ORDER BY tf.Vencimento

-- Pagamentos realizados no mês com rateio contábil
SELECT
    tf.Numero,
    tfb.DataBaixa,
    tfb.ValorBaixa,
    pc.Descricao AS PlanoConta,
    cr.Descricao AS CentroResultado,
    tfbr.ValorBaixa AS ValorRateado
FROM Literarius.dbo.TituloFinanceiro tf
JOIN Literarius.dbo.TituloFinanceiroBaixa tfb ON tfb.idTituloFinanceiro = tf.idTituloFinanceiro
JOIN Literarius.dbo.TituloFinanceiroBaixaRateio tfbr ON tfbr.idTituloFinanceiroBaixa = tfb.idTituloFinanceiroBaixa
LEFT JOIN Literarius.dbo.PlanoConta pc ON pc.Codigo = tfbr.PlanoConta
LEFT JOIN Literarius.dbo.CentroResultado cr ON cr.Codigo = tfbr.CentroResultado
WHERE tf.TipoTitulo = 'P'
  AND MONTH(tfb.DataBaixa) = MONTH(GETDATE())
  AND YEAR(tfb.DataBaixa) = YEAR(GETDATE())
```

---

## Módulos Relacionados

- [[DRE e Fluxo de Caixa]] — pagamentos alimentam saídas no fluxo
- [[Mapa de Dados]]
