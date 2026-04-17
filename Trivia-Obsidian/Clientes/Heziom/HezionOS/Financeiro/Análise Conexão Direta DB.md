---
tags: [financeiro, analise, dados, banco, confirmado]
status: analisado
criado: 2026-04-14
---

# Análise — Conexão Direta ao Literarius

Resultado da consulta direta ao banco via Python/pymssql. Dados confirmados em tempo real.

---

## 1. O mistério das NFs sem canal — RESOLVIDO

O R$1.28M "sem canal" que aparecia na análise histórica era um **falso alarme** causado pela ausência do filtro `GeraFinanceiro = 1` na query original.

**Com o filtro correto aplicado:**
- Março 2026 sem canal: apenas **R$11.950** (103 NFs pequenas)
- As NFs grandes sem canal são **todas** `GeraFinanceiro = False` — não entram no faturamento real

**O que são essas NFs sem canal + GeraFinanceiro=0:**
- `TipoNota 4 e 5` = NFs de **consignação** (saída em consignação — livros vão para livraria parceira mas a receita só é reconhecida quando vendido)
- `TipoNota 11` = operações com **imunidade de ICMS** (CF Art. 150 — livros imunes)
- Observações confirmam: "CONFORME CONSTA NO CONTRATO DE CONSIGNACAO", "IMUNE AO ICMS PELA CF"
- Estas NFs movimentam estoque mas **não geram receita ainda** — correto não gerar financeiro

> ✅ **Conclusão:** o faturamento filtrado com `GeraFinanceiro = 1` está correto. A consignação é tratada separadamente.

---

## 2. Faturamento de Março 2026 — Real (com filtros corretos)

| Canal | NFs | Bruto | Frete | Líquido |
|-------|-----|-------|-------|---------|
| LIVRARIA | 1.453 | R$ 193.777 | R$ 0 | **R$ 193.777** |
| SITE (Tray) | 1.143 | R$ 187.917 | R$ 22.670 | **R$ 165.247** |
| ATACADO | 83 | R$ 138.476 | R$ 3.198 | **R$ 135.278** |
| MERCADO LIVRE - MP | 521 | R$ 69.018 | R$ 7.527 | **R$ 61.491** |
| AMAZON - MP | 151 | R$ 10.606 | R$ 200 | **R$ 10.406** |
| SEM CANAL | 103 | R$ 11.950 | R$ 0 | **R$ 11.950** |
| SHOWROOM | 23 | R$ 1.719 | R$ 0 | **R$ 1.719** |
| **TOTAL** | **3.477** | **R$ 613.465** | **R$ 33.595** | **R$ 579.868** |

> ℹ️ `TotalImpostos = 0` em todos os canais — esperado para livros (imunidade constitucional)

---

## 3. Aging de Recebíveis — ALERTA CRÍTICO

```
Faixa             | Qtd   | Saldo
A vencer          | 3.851 | R$  371.964  (16%)
Vencido até 30d   | 2.714 | R$  285.182  (12%)
Vencido 31–60d    | 3.326 | R$  300.491  (13%)
Vencido 61–90d    | 3.865 | R$  363.643  (15%)
Vencido > 90d     | 9.428 | R$1.045.895  (44%)
─────────────────────────────────────────
TOTAL             |23.184 | R$2.367.177
```

**84% do contas a receber está vencido.** O grupo > 90 dias (R$1.04M) é o maior — sinal de inadimplência crônica ou títulos que não foram baixados corretamente.

> ⚠️ Antes de levar ao CEO: verificar se títulos > 90 dias são inadimplência real ou registros desatualizados (ex: atacado com prazo diferenciado não atualizado no sistema).

---

## 4. Aging de Contas a Pagar — Situação Confortável

```
Faixa             | Qtd | Saldo
A vencer          | 721 | R$3.511.616  (86%)
Vencido até 30d   |  69 | R$  267.435  (7%)
Vencido 31–60d    |   2 | R$      201  (0%)
Vencido 61–90d    |   4 | R$   58.716  (1%)
Vencido > 90d     | 122 | R$  254.381  (6%)
─────────────────────────────────────────
TOTAL             | 918 | R$4.092.350
```

86% das obrigações ainda a vencer — a empresa está em dia com os fornecedores. Apenas R$580K está vencido (14%).

---

## 5. PlanoConta — Uso Real Confirmado

### Receitas identificadas pelo uso

| Conta | Nome | Registros | Valor Total |
|-------|------|-----------|-------------|
| 2 | VENDA DE LIVROS | 38.556 | R$ 5.123.091 |
| 4 | VENDA DE E-BOOK | 1.514 | R$ 129.151 |
| 112 | Receitas financeiras | 14 | R$ 6 |
| 116 | Outras receitas | — | — |

**VENDA DE LIVROS domina com 97% da receita.**

### Principais despesas por valor (confirmadas em uso)

| Conta | Nome | Valor |
|-------|------|-------|
| 21 | Produção Material Próprio | R$ 2.065.728 |
| 20 | Materiais Para Revenda | R$ 785.176 |
| **106** | **TRANSFERENCIA ENTRE CONTAS** | **R$ 676.704** ← excluir DRE |
| 30 | Frete Sobre Mercadorias | R$ 495.433 |
| 29 | Marketing E Publicidade | R$ 429.232 |
| 32 | Direitos Autorais | R$ 355.002 |
| 96 | Remuneração Autônomos - Administração | R$ 302.727 |
| 99 | Diretoria - PJ | R$ 178.158 |
| 98 | Remuneração Autônomos - Livraria | R$ 177.700 |
| 28 | Remuneração Autônomos - Marketing | R$ 190.145 |
| 84 | Sistemas e Softwares - Adm Marketing | R$ 160.285 |
| 23 | Salários A Pagar | R$ 163.684 |
| **8** | **A VERIFICAR** | **R$ 132.015** ← classificar urgente |
| 33 | Remuneração Autônomos - Editorial | R$ 121.522 |
| 93 | Remuneração Autônomos - Expedição | R$ 120.002 |
| 95 | Remuneração Autônomos - Financeiro | R$ 108.250 |
| **115** | **Empréstimos e financiamentos** | **R$ 60.000** ← excluir DRE operacional |

### Contas "Cod XXXX" — valores em uso (precisam de nome real)

| Conta | Valor lançado |
|-------|--------------|
| Cod 1191 (52) | R$ 53.229 |
| Cod 1138 (49) | R$ 24.587 |
| Cod 3208 (57) | R$ 10.056 |
| Cod 1082 (48) | R$ 10.150 |
| Cod 5952 (109) | R$ 3.087 |
| Cod 1170 (50) | R$ 3.073 |

---

## 6. Domínios confirmados

### TipoNota mapeado (por contexto dos dados)

| Tipo | Qtd | Hipótese |
|------|-----|----------|
| 1 | 19.918 | NF-e saída padrão (venda normal) |
| 13 | 7.882 | NFC-e PDV (venda balcão/livraria/evento) |
| 11 | 231 | NF-e com imunidade ICMS (atacado/institucional) |
| 5 | 75 | NF saída consignação |
| 4 | 26 | NF saída consignação (série diferente) |
| 2 | 57 | NF complementar ou transferência |

> Tipos 1 e 13 = **99% do faturamento real**. Demais = consignação/transferência/operações especiais.

### Origem do TituloFinanceiro

| Origem | Qtd | Hipótese |
|--------|-----|---------|
| 1 | 40.002 | NotaFiscal (origem mais comum) |
| NULL | 2.430 | Lançamento manual |
| 2 | 399 | PedidoVenda direto |
| 6 | 194 | Provavelmente lançamento bancário/avulso |
| 13 | 15 | Editorial ou canal específico |

---

## 7. Premissas atualizadas

| Premissa | Antes | Status |
|----------|-------|--------|
| NFs sem canal = R$1.28M problema | Alerta crítico | ✅ Falso alarme — eram consignações com GeraFinanceiro=0 |
| GeraFinanceiro=0 = vendas perdidas | Preocupação | ✅ São consignações — correto não gerar financeiro |
| Impostos afetam faturamento | Premissa | ✅ Livros são imunes — TotalImpostos = 0 |
| 84% do recebível está vencido | — | ⚠️ Confirmado — investigar se é inadimplência ou dado sujo |
| Conta 8 "A VERIFICAR" tem R$132K | Risco | 🔴 Confirmado — classificar urgente |
| Conta 106 "Transferência" tem R$676K | Risco | 🔴 Confirmado — excluir do DRE |

---

## 8. Domínios adicionais confirmados via DB direto

### PedidoVenda — Status confirmados (12 valores)

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
| 6 | Pedido Faturado | ✅ Concluído |
| 10 | Pedido Enviado | ✅ Concluído |
| 7 | Pedido Cancelado | ❌ Cancelado |
| 11 | Erro Faturamento | ⚠️ Erro |

### OperacaoFiscal — Achados críticos

| ID | Nome | GeraFinanceiro | Impacto |
|----|------|----------------|---------|
| 6 | ACERTO DE CONSIGNAÇÃO DE VENDA | ✅ Sim | Receita real — acerto com parceiro |
| 71 | MERCADO LIVRE FULL 5106 | ❌ Não | Explica baixo faturamento do canal ML Full |

> ⚠️ Canal MERCADO LIVRE - FULL (código 12) aparece subnotificado no faturamento por causa da OperacaoFiscal 71 ter `GeraFinanceiro = False`. O repasse é feito diretamente pela ML.

### Setores (tabela Setor)

| Código | Nome |
|--------|------|
| 1 | EDITORA |
| 2 | IPP |
| 3 | EMBU-GUACU |
| 4 | SHOWROOM |
| 5 | PRÉDIO 9 |
| 98 | PICKING |
| 99 | SEPARAÇÃO |

### Parceiros

| Tipo | Qtd |
|------|-----|
| Clientes | 42.957 |
| Fornecedores | 115 |
| Ambos | 22 |

> ⚠️ **PK da tabela Parceiro é `Codigo`** (não `idParceiro`). JOIN correto: `JOIN Parceiro p ON p.Codigo = tf.Parceiro`.

### Saldos bancários (abr/2026)

| Conta | Tipo | Saldo |
|-------|------|-------|
| Santander | Banco | R$ 3.401.000 |
| CC 7369 | Carteira | R$ 252.000 |
| CC 9094 | Carteira | R$ 195.000 |
| CC 6277 | Carteira | R$ 76.000 |
| Stone | Gateway | R$ 25.000 |
| **Total** | | **R$ 3.949.000** |

### Recebimentos por forma (últimos 12 meses)

| Forma | Valor | % |
|-------|-------|---|
| Cartão de Crédito | R$ 1.071.000 | 38% |
| PIX SITE | R$ 1.028.000 | 37% |
| PIX | R$ 587.000 | 21% |
| Boleto | R$ 161.000 | 6% |

### Faturamento mensal (sistema ativo desde set/2025)

| Mês | Faturamento Líquido |
|-----|---------------------|
| Set/2025 | R$ 363.000 |
| Out/2025 | R$ 594.000 |
| Nov/2025 | R$ 818.000 |
| Dez/2025 | **R$ 1.058.000** |
| Jan/2026 | R$ 774.000 |
| Fev/2026 | R$ 599.000 |
| Mar/2026 | R$ 580.000 |
| Abr/2026 | R$ 170.000 (parcial) |

### Consignação em aberto

80 NFs de saída em consignação (TipoNota 4 e 5) com `GeraFinanceiro = 0` = **R$ 1.152.000** acumulados desde set/2025. São livros enviados para parceiros (livrarias consignadas) que ainda não tiveram acerto financeiro.

---

## Próximas queries recomendadas

```sql
-- Top devedores (com JOIN correto em Parceiro.Codigo)
SELECT TOP 15 p.Nome, p.Codigo, COUNT(*) AS QtdTitulos,
       SUM(tf.Valor - tf.ValorPago) AS SaldoAberto
FROM TituloFinanceiro tf
JOIN Parceiro p ON p.Codigo = tf.Parceiro
WHERE tf.TipoTitulo = 'R' AND tf.Pago = 0
GROUP BY p.Codigo, p.Nome ORDER BY SaldoAberto DESC

-- Detalhar conta "A VERIFICAR" (código 8) — o que são esses R$132K?
SELECT tf.Numero, tf.Emissao, tf.Vencimento, tf.Valor, tf.TipoTitulo,
       tf.Pago, tf.Observacao
FROM TituloFinanceiro tf
JOIN TituloFinanceiroRateio tfr ON tfr.idTituloFinanceiro = tf.idTituloFinanceiro
WHERE tfr.PlanoConta = 8
ORDER BY tf.Emissao DESC

-- Detalhar consignações em aberto (saída sem retorno ou acerto)
SELECT nf.Numero, nf.DataEmissao, nf.TotalNota, nf.TipoNota, nf.Observacao
FROM NotaFiscal nf
WHERE nf.TipoNota IN (4, 5) AND nf.EntSai = 'S' AND nf.Cancelada = 0
ORDER BY nf.TotalNota DESC
```

---

Ver também: [[Análise dos Dados Extraídos]] · [[Premissas e Entendimentos]] · [[Agente Financeiro — Prompt]]
