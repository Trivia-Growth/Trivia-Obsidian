---
tags: [financeiro, analise, dados, achados, pendente]
status: analisar com equipe
criado: 2026-04-13
---

# Análise dos Dados Extraídos do Literarius

Resultado da análise dos CSVs exportados via DBeaver. Separado em **bloqueadores críticos**, **achados relevantes** e **dados confirmados**.

---

## 🔴 Bloqueadores críticos (impedem DRE)

### 1. PlanoConta — TipoCategoria = 'A' em TODAS as 115 contas

```
TipoCategoria | Qtd
A             | 115
```

**Nenhuma conta** está classificada como Receita (`'R'`) ou Despesa (`'D'`). Todas estão como `'A'` (provavelmente "Ambos" ou não configurado). O campo `GrupoDRE` também é `0` para todas.

**Impacto:** impossível gerar DRE automaticamente pelo campo de categoria. Toda a estrutura de DRE precisa ser construída manualmente com base nos nomes das contas — ou o `TipoCategoria` precisa ser configurado no Literarius antes de qualquer análise.

**Contas que precisam de atenção especial:**
| Conta | Nome | Problema |
|-------|------|---------|
| 8 | A VERIFICAR | Nome explícito de pendência |
| 48–59 | Cod 1082, Cod 1138, Cod 1170... | Sem nome descritivo — o que são? |
| 106 | TRANSFERENCIA ENTRE CONTAS | Deve ser excluído do DRE |
| 112 | Receitas financeiras | Parece receita — não está marcada como tal |
| 116 | Outras receitas | Idem |
| 115 | Empréstimos e financiamentos | Passivo — não deve entrar no DRE operacional |

---

### 2. Situacao — valor único em todos os 43.040 títulos

```
Situacao | Qtd
1        | 43.040
```

O campo `Situacao` tem o mesmo valor (`1`) em 100% dos títulos — não está sendo usado para gestão de estados. O único discriminador real de pagamento é o campo `Pago`.

**Impacto:** qualquer lógica baseada em `Situacao` retorna todos os registros ou nenhum. Usar apenas `Pago = 0/1`.

---

### 3. NFs sem canal = R$ 1.28M em 2026 (maior grupo do ano)

```
Canal        | Qtd NFs | Faturado 2026
(sem canal)  | 185     | R$ 1.280.558  ← MAIOR valor do ano
ATACADO      | 363     | R$ 778.458
SITE         | 4.356   | R$ 756.029
LIVRARIA     | 3.602   | R$ 442.752
```

185 notas fiscais sem canal identificado somam mais que qualquer canal individual em 2026. Em 2025 eram apenas 28 NFs e R$ 171K — o problema cresceu significativamente.

**Impacto:** análise por canal está incompleta e enganosa enquanto esse grupo não for classificado.

---

## 🟡 Achados relevantes

### 4. R$ 1.89M em NFs que não geram financeiro

```
GeraFinanceiro | Qtd NFs | Valor Total
0              | 383     | R$ 1.895.840
(nulo)         | 990     | R$    97.922
1              | 26.731  | R$ 5.277.459
```

R$ 1.895.840 em NFs de saída que não geram título financeiro. O que são? Bonificações? Transferências entre filiais? Remessas? Esse valor é muito alto para ser ignorado.

**Pergunta para o Literarius:** quais critérios definem `GeraFinanceiro = 0`?

---

### 5. Contas a pagar em aberto: R$ 4.09M

```
TipoTitulo | Pago | Qtd    | Valor Total
P          | 0    | 918    | R$ 4.092.352  ← em aberto
P          | 1    | 2.024  | R$ 3.936.630  ← pagos
R          | 0    | 23.184 | R$ 2.367.177  ← a receber
R          | 1    | 16.914 | R$ 2.952.378  ← recebidos
```

**Contas a pagar em aberto (R$ 4.09M) superam os recebíveis em aberto (R$ 2.37M)** — sinal de que há mais obrigações pendentes que direitos a receber. Precisa de aging para entender vencimentos.

---

### 6. TipoBaixa = 1 em 100% das baixas (18.936)

O campo `TipoBaixa` tem valor único (`1`) em todas as baixas — assim como o `Situacao`, não está discriminando tipos. Não é possível distinguir baixa manual de automática por esse campo.

---

### 7. TipoNota — 14 tipos existentes, só 2 relevantes para receita

```
TipoNota | Qtd    | (hipótese)
1        | 19.918 | NF-e modelo 55 (saída padrão)
13       | 7.882  | NFC-e modelo 65 (PDV/consumidor)
8        | 231    |
5        | 75     |
2        | 57     |
...      | ...    |
```

Precisa confirmar quais tipos representam venda real antes de usar em filtros de faturamento. Se tipo 13 (NFC-e) for venda ao consumidor final pelo PDV, ele precisa entrar no faturamento — mas a query atual não discrimina por tipo.

---

### 8. Gateways tratados como ContaBancaria

```
ContaBancaria    | Banco
CONTA CAIXA      | NÃO É UM BANCO
Santander        | BANCO SANTANDER ✓
Stone            | NÃO É UM BANCO (gateway)
CC 9094/6277/7369| NÃO É UM BANCO (carteiras?)
CONTAMAX         | NÃO É UM BANCO
Mercado Pago     | NÃO É UM BANCO (gateway)
Vindi            | NÃO É UM BANCO (gateway)
Pagarme          | NÃO É UM BANCO (gateway)
APPMAX           | NÃO É UM BANCO (gateway)
```

Gateways (Stone, Mercado Pago, Vindi, Pagarme, APPMAX) estão cadastrados como contas bancárias. É um padrão válido no Literarius — cada gateway é uma "conta" de onde saem/entram recursos. Relevante para conciliação e fluxo de caixa real.

---

### 9. Pedidos Tray: 94–95% com SiteIdPedido

```
Ano  | Total   | Com SiteId | Sem SiteId | Cobertura
2026 | 7.958   | 7.486      | 472        | 94%
2025 | 11.309  | 10.703     | 606        | 95%
```

Boa cobertura — a integração está funcionando para a maioria. Os ~5% sem SiteId podem ser pedidos manuais ou de canais sem integração direta.

---

## ✅ Dados confirmados (premissas validadas)

| Premissa | Status |
|----------|--------|
| `TipoTitulo` só tem `'R'` e `'P'` | ✅ Confirmado |
| `EntSai` só tem `'E'` e `'S'` | ✅ Confirmado |
| `TipoLancto` só tem `'C'` e `'D'` | ✅ Confirmado |
| Rateio de títulos está sendo usado | ✅ 43.477 registros para 43.040 títulos |
| Rateio de baixas está sendo usado | ✅ 19.134 registros |
| Uma única empresa no banco | ✅ Empresa = 1 em todas as contas bancárias |

---

## Canais de venda confirmados (13)

| Código | Canal | Tipo |
|--------|-------|------|
| 1 | SITE | Digital — Tray (site próprio) |
| 2 | MERCADO LIVRE - MP | Marketplace |
| 3 | AMAZON - MP | Marketplace |
| 4 | TIKTOKSHOP | Marketplace |
| 5 | ATACADO | B2B |
| 6 | LIVRARIA | Físico |
| 7 | SHOWROOM | Físico |
| 8 | MARKETING | Interno/brinde |
| 9 | EVENTO | Físico — eventuais |
| 10 | LIVRARIA EMBU GUACU | Físico |
| 11 | AMAZON - FBA | Marketplace |
| 12 | MERCADO LIVRE - FULL | Marketplace |
| 13 | EDITORIAL | Interno |

---

## Faturamento bruto por canal — 2025 vs 2026 (jan–abr)

| Canal | 2025 | 2026 (jan–abr) |
|-------|------|----------------|
| SITE (Tray) | R$ 1.341.531 | R$ 756.029 |
| ATACADO | R$ 799.905 | R$ 778.458 |
| LIVRARIA | R$ 654.326 | R$ 442.752 |
| MERCADO LIVRE - MP | R$ 233.676 | R$ 281.086 |
| AMAZON - MP | R$ 143.384 | R$ 115.011 |
| EVENTO | R$ 34.194 | R$ 78.791 |
| MERCADO LIVRE - FULL | R$ 74.243 | R$ 11.317 |
| AMAZON - FBA | R$ 13.413 | — |
| MARKETING | R$ 26.550 | R$ 15.939 |
| SHOWROOM | R$ 11.853 | R$ 4.746 |
| EDITORIAL | — | R$ 1.584 |
| **Sem canal** | **R$ 171.864** | **R$ 1.280.558** |
| **Total** | **~R$ 3.505.000** | **~R$ 3.766.000** |

> ⚠️ 2026 já tem R$ 3.77M em apenas 4 meses — ritmo anualizado de ~R$ 11.3M, versus R$ 3.5M em todo 2025. Isso pode indicar dados não filtrados corretamente, NFs de períodos anteriores lançadas em 2026, ou crescimento real expressivo.

---

## Perguntas abertas geradas por esta análise

- [ ] O que são as 185 NFs sem canal em 2026 com R$ 1.28M? Atacado não faturado corretamente?
- [ ] O que define `GeraFinanceiro = 0`? Quais operações disparam isso?
- [ ] `TipoNota 13` (7.882 NFs) = NFC-e de PDV? Entra no faturamento ou não?
- [ ] O `TipoCategoria = 'A'` vai ser corrigido no Literarius antes de construir o DRE?
- [ ] As contas "Cod XXXX" e "A VERIFICAR" no PlanoConta são obsoletas ou ativas?
- [ ] O volume de 2026 (~R$ 3.77M em 4 meses) é real ou há problema de competência?

---

Ver também: [[Dúvidas para Insights do CEO]] · [[Premissas e Entendimentos]] · [[Mapa de Dados]]
