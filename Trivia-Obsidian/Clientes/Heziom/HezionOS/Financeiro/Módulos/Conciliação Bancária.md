---
tags: [financeiro, modulo, conciliacao, bancario, ofx, cnab]
status: especificação
criado: 2026-04-15
---

# Conciliação Bancária

Módulo que automatiza o cruzamento entre os lançamentos do extrato bancário (Santander) e os títulos financeiros registrados no Literarius, eliminando o processo manual atual que consome boa parte do tempo do analista financeiro.

---

## Problema Resolvido

Hoje a conciliação bancária é feita manualmente, planilha por planilha. O processo consome tempo significativo do analista financeiro (Igor Santos) e é propenso a erros e omissões. Sem conciliação automática:
- Pagamentos duplicados passam despercebidos
- Recebimentos não identificados ficam sem baixa
- Lançamentos estranhos (possível fraude) não são detectados rapidamente

---

## Objetivo

1. Importar extratos bancários (OFX/CNAB) do Santander
2. Auto-conciliar lançamentos do extrato × `TituloFinanceiroBaixa` no Literarius
3. Exibir fila de itens não conciliados com sugestões de match
4. Permitir conciliação manual para casos sem match automático
5. Atingir >95% de conciliação automática (meta)
6. Alertar lançamentos sem origem conhecida (possível irregularidade)

---

## Fontes de Dados

### Literarius (leitura)
| Tabela | Campos-chave | Uso |
|--------|-------------|-----|
| [[TituloFinanceiroBaixa]] | idTituloFinanceiro, DataBaixa, Valor, FormaPagto, ContaBancaria | Base do match |
| [[TituloFinanceiro]] | Parceiro, TipoTitulo, Descricao, Valor | Contexto do título |
| [[ContaBancaria]] | Codigo, Descricao, Banco, Agencia, Conta | Identificar qual conta conciliar |
| [[ContaBancariaLancamento]] | Data, Valor, Descricao, Tipo | Lançamentos diretos (tarifas, transferências) |

### HeziomOS DB (leitura + escrita)
| Tabela | Campos | Uso |
|--------|--------|-----|
| `bank_statements` | id, conta_bancaria, data_import, arquivo_origem, total_creditos, total_debitos | Extratos importados |
| `bank_statement_items` | id, statement_id, data, valor, descricao, tipo (C/D), documento | Cada linha do extrato |
| `bank_reconciliations` | id, statement_item_id, titulo_baixa_id, confianca, tipo_match, data_match, usuario | Matches |

---

## Algoritmo de Match Automático

### Critérios e Pesos

| Critério | Peso | Tolerância |
|---------|------|-----------|
| Valor exato | 40 pts | — |
| Valor com tolerância ±R$1,00 | 25 pts | Taxas bancárias |
| Data: mesmo dia | 30 pts | — |
| Data: ±1 dia útil | 20 pts | Liquidação D+1 |
| Data: ±2 dias úteis | 10 pts | — |
| Número do documento | 20 pts | CPF/CNPJ ou nº titulo |
| Descrição parcial | 10 pts | "PIX recebido" + nome |

**Threshold de auto-match:** soma de pontos ≥ 80 → concilia automaticamente
**Sugestão de match:** 50–79 pontos → aparece como sugestão na fila manual

### Casos Especiais
- **Repasse Tray:** crédito com descritivo "TRAY" → buscar soma de pedidos do período
- **Tarifa bancária:** débito com descritivo "TAR" ou "IOF" → criar lançamento em `ContaBancariaLancamento`
- **Transferência entre contas:** descartar automaticamente (conta 106 no PlanoConta)
- **Estorno:** valor igual ao débito anterior ± 24h → sinalizar para revisão manual

---

## Formatos de Extrato Suportados

### OFX (Open Financial Exchange) — Fase 1
- Santander disponibiliza via internet banking → Exportar → OFX
- Formato XML proprietário padronizado pelo mercado
- Campos úteis: `<DTPOSTED>`, `<TRNAMT>`, `<NAME>`, `<MEMO>`, `<FITID>`

```xml
<STMTTRN>
  <TRNTYPE>CREDIT</TRNTYPE>
  <DTPOSTED>20260415</DTPOSTED>
  <TRNAMT>1500.00</TRNAMT>
  <FITID>202604150001</FITID>
  <NAME>TRANSFERENCIA PIX</NAME>
  <MEMO>PIX DE LIVRARIA EXEMPLO CNPJ 12.345.678/0001-90</MEMO>
</STMTTRN>
```

### CNAB 240 Retorno — Fase 1
- Arquivo de retorno de cobranças (boletos emitidos)
- Confirma quais boletos foram pagos e quando

### Open Banking API — Fase 2
- Santander Developers: GET /accounts/{accountId}/transactions
- Elimina upload manual

---

## Fluxo

```
Upload OFX no HeziomOS (ou import automático via API)
  │
  ├── Parse OFX → inserir em bank_statement_items
  │
  ├── Para cada item (job diário 22h):
  │   ├── Busca TituloFinanceiroBaixa com critérios de match
  │   ├── Score ≥ 80 → concilia automaticamente
  │   ├── Score 50-79 → adiciona à fila com sugestão
  │   └── Score < 50 → fila sem sugestão + flag "não identificado"
  │
  ├── Lançamentos não identificados → alerta Teams financeiro
  │
  └── Dashboard de conciliação:
      ├── Taxa de match automático do dia
      ├── Total conciliado vs. extrato
      └── Fila pendente de revisão manual
```

---

## Tela — Dashboard de Conciliação

```
┌──────────────────────────────────────────────────────────────────┐
│  Conciliação Bancária — Santander 15/04/2026                     │
│                                                                  │
│  Extrato: R$ 48.320,00 (32 lançamentos)                          │
│  ✅ Conciliados automaticamente: 28 (87,5%)                       │
│  ⚠  Fila manual: 4 lançamentos  →  [Revisar]                     │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Fila de Revisão Manual                                    │  │
│  │                                                            │  │
│  │  [C] R$ 3.200,00  15/04  "PIX DEPOSITO"  → Sugestão: #412 │  │
│  │  [D] R$    87,50  15/04  "TAR DOC TED"   → Tarifa bancária│  │
│  │  [C] R$ 1.100,00  14/04  "TED RECEBIDO"  → Sem sugestão ⚠ │  │
│  │  [D] R$ 5.000,00  13/04  "PAGAMENTO"     → Sugestão: #389 │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Query de Referência

```sql
-- Baixas do Literarius não conciliadas (candidatos a match)
SELECT
    tfb.idTituloFinanceiroBaixa,
    tfb.DataBaixa,
    tfb.Valor,
    tf.TipoTitulo,
    p.Nome        AS Parceiro,
    cb.Descricao  AS ContaBancaria,
    fp.Descricao  AS FormaPagto
FROM Literarius.dbo.TituloFinanceiroBaixa tfb
JOIN Literarius.dbo.TituloFinanceiro tf  ON tf.idTituloFinanceiro = tfb.idTituloFinanceiro
JOIN Literarius.dbo.Parceiro         p  ON p.Codigo              = tf.Parceiro
JOIN Literarius.dbo.ContaBancaria    cb ON cb.Codigo             = tfb.ContaBancaria
JOIN Literarius.dbo.FormaPagto       fp ON fp.Codigo             = tfb.FormaPagto
WHERE tfb.DataBaixa >= DATEADD(DAY, -30, GETDATE())
ORDER BY tfb.DataBaixa DESC;
```

---

## Módulos Relacionados

- [[Contas a Receber]] — baixas de recebimento a conciliar
- [[Contas a Pagar]] — baixas de pagamento a conciliar
- [[Aprovação de Pagamentos]] — remessa CNAB gera lançamentos que precisam ser conciliados
- [[Bancos — CNAB e OFX]] — especificação técnica dos formatos
- [[Alertas e Notificações]] — alerta para lançamentos não identificados
- [[HeziomOS — Arquitetura]] — visão geral do sistema
