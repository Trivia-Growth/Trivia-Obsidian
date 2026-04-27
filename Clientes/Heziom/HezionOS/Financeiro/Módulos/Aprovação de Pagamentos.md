---
tags: [financeiro, modulo, aprovacao, pagamentos, cnab]
status: especificação
criado: 2026-04-15
---

# Aprovação de Pagamentos

Módulo que controla o fluxo de autorização de pagamentos antes da geração de remessa bancária, eliminando o risco de pagamentos indevidos e criando rastreabilidade de quem aprovou o quê.

---

## Problema Resolvido

Hoje não há workflow formal de aprovação. Qualquer pessoa com acesso ao Literarius pode liberar um pagamento. Não há controle de alçada, histórico de quem autorizou, nem geração automática de remessa CNAB para o banco.

---

## Objetivo

1. Criar fila de pagamentos pendentes de aprovação por faixa de valor (alçada)
2. Aprovar/rejeitar individualmente ou em lote
3. Após aprovação: gerar arquivo CNAB 240 para remessa ao Santander
4. Registrar histórico de aprovações para auditoria
5. Alertar no Teams quando há aprovações pendentes há mais de 24h

---

## Fontes de Dados

### Literarius (leitura)
| Tabela | Campos-chave | Uso |
|--------|-------------|-----|
| [[TituloFinanceiro]] | TipoTitulo='P', Pago=0, Valor, Vencimento, Parceiro, PlanoConta | Lista de títulos a pagar |
| [[TituloFinanceiroBaixa]] | idTitulo, DataBaixa, Valor, FormaPagto | Verificar se já foi baixado |
| [[ContaBancaria]] | Codigo, Descricao, Banco, Agencia, Conta | Conta de débito |
| [[FormaPagto]] | Codigo, Descricao | TED, PIX, boleto, cheque |
| `Parceiro` | Codigo, Nome, CNPJ, BancoFavorecido, AgenciaFavorecido, ContaFavorecido | Dados bancários do favorecido |

### HeziomOS DB (leitura + escrita)
| Tabela | Campos | Uso |
|--------|--------|-----|
| `payment_approvals` | id, titulo_id, status, aprovador_id, data_aprovacao, obs | Workflow state |
| `cnab_batches` | id, data_geracao, arquivo_path, status, total_titulos, total_valor | Lotes gerados |
| `cnab_batch_items` | id, batch_id, titulo_id, status_retorno | Itens de cada lote |

---

## Regras de Alçada

| Faixa de Valor | Aprovador |
|---------------|-----------|
| < R$5.000 | Equipe financeiro (auto-aprovação configurável) |
| R$5.000 – R$50.000 | Coordenador Financeiro |
| > R$50.000 | CEO |

*Valores exatos a confirmar com gestão*

---

## Fluxo

```
Literarius: TituloFinanceiro (TipoTitulo='P', Pago=0)
  │
  ├── Leitura diária dos títulos com vencimento em até 7 dias
  │
  ├── Fila HeziomOS:
  │   ├── status = 'pendente' (ainda não avaliado)
  │   ├── status = 'aprovado' (liberado para lote CNAB)
  │   ├── status = 'rejeitado' (bloqueado + motivo)
  │   └── status = 'em_esclarecimento' (aguardando info)
  │
  ├── Alerta Teams:
  │   └── Título ≥ threshold pendente >24h → notificação CEO
  │
  ├── Aprovação:
  │   ├── Aprovador revisa: valor, favorecido, PlanoConta, histórico
  │   └── Aprova individualmente ou em lote do dia
  │
  └── Geração CNAB 240:
      ├── Titulos aprovados → montar arquivo CNAB (layout FEBRABAN)
      ├── Validar dados bancários do favorecido (banco, agência, conta, CNPJ)
      ├── Gerar arquivo .txt → disponibilizar para download
      └── Upload manual no internet banking Santander (fase 1)
          → API Open Banking (fase 2)
```

---

## CNAB 240 — Estrutura

Formato padrão FEBRABAN, layout Santander.

| Segmento | Conteúdo |
|----------|---------|
| Header do arquivo | CNPJ empresa, banco, data |
| Header do lote | Tipo de serviço (pagamentos), forma de pagamento |
| Segmento A | Dados do favorecido: banco, agência, conta, nome, valor, data |
| Segmento B | Complemento: CNPJ favorecido, endereço |
| Trailer do lote | Totalizadores |
| Trailer do arquivo | Total de registros |

**Formas de pagamento suportadas:**
- TED (Transferência entre bancos diferentes)
- PIX (chave CPF/CNPJ/email/aleatória)
- Crédito em conta (mesmo banco — Santander)
- Boleto (código de barras)

---

## Arquivo de Retorno CNAB

Após processamento pelo banco, o Santander retorna um arquivo CNAB de retorno:
- Processar retorno → atualizar `cnab_batch_items.status_retorno`
- Status possíveis: `00` (aprovado), `BD` (beneficiário com documento divergente), `AB` (conta inválida), etc.
- Títulos com retorno OK → **[fase 2]** atualizar `TituloFinanceiro.Pago=1` no Literarius via usuário de escrita

---

## Tela — Lista de Pagamentos Pendentes

```
┌─────────────────────────────────────────────────────────────────┐
│  Pagamentos Pendentes de Aprovação                    [+ Lote]  │
│                                                                 │
│  [ ] Fornecedor X         Boleto  Venc: 20/04  R$ 1.200,00      │
│  [ ] Gráfica São Paulo    TED     Venc: 18/04  R$ 8.500,00  ⚠  │
│  [ ] LAW Consultoria      PIX     Venc: 22/04  R$ 4.300,00      │
│  [✓] Contabil Ribeiro     TED     Venc: 25/04  R$ 2.800,00      │
│                                                                 │
│  ⚠ = exige aprovação CEO                                        │
│                                        [Aprovar selecionados]   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Queries de Referência

```sql
-- Títulos a pagar com vencimento nos próximos 7 dias
SELECT
    tf.idTituloFinanceiro,
    p.Nome        AS Fornecedor,
    p.CNPJ,
    pc.Descricao  AS PlanoConta,
    tf.Valor,
    tf.Vencimento,
    tf.Descricao,
    fp.Descricao  AS FormaPagto,
    cb.Descricao  AS ContaDebito
FROM Literarius.dbo.TituloFinanceiro tf
JOIN Literarius.dbo.Parceiro     p  ON p.Codigo      = tf.Parceiro
JOIN Literarius.dbo.PlanoConta   pc ON pc.Codigo      = tf.PlanoConta
JOIN Literarius.dbo.FormaPagto   fp ON fp.Codigo      = tf.FormaPagto
JOIN Literarius.dbo.ContaBancaria cb ON cb.Codigo     = tf.ContaBancaria
WHERE tf.TipoTitulo = 'P'
  AND tf.Pago       = 0
  AND tf.Vencimento BETWEEN GETDATE() AND DATEADD(DAY, 7, GETDATE())
ORDER BY tf.Vencimento ASC;
```

```sql
-- Histórico de pagamentos ao mesmo fornecedor (últimos 6 meses)
SELECT
    tf.Vencimento,
    tfb.DataBaixa,
    tf.Valor,
    tf.Descricao
FROM Literarius.dbo.TituloFinanceiro tf
JOIN Literarius.dbo.TituloFinanceiroBaixa tfb ON tfb.idTituloFinanceiro = tf.idTituloFinanceiro
WHERE tf.TipoTitulo = 'P'
  AND tf.Parceiro   = :parceiro_codigo
  AND tfb.DataBaixa >= DATEADD(MONTH, -6, GETDATE())
ORDER BY tfb.DataBaixa DESC;
```

---

## Módulos Relacionados

- [[Contas a Pagar]] — fonte dos títulos a aprovar
- [[Bancos — CNAB e OFX]] — geração do arquivo CNAB e conciliação do retorno
- [[Alertas e Notificações]] — Teams alert quando aprovação pendente >24h
- [[HeziomOS — Arquitetura]] — visão geral do sistema
