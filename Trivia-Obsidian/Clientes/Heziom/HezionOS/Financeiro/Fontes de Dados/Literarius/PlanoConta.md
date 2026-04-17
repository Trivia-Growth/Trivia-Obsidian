---
tags: [literarius, tabela, financeiro]
fonte: Literarius
tipo: tabela
---

# PlanoConta

## Descrição

Plano de contas contábil/gerencial da empresa. Define a estrutura hierárquica de categorias de receita e despesa, usada no rateio de títulos e na geração da DRE. `GrupoDRE` agrupa as contas nas linhas do demonstrativo.

> ⛔ **LIMITAÇÃO CRÍTICA:** `TipoCategoria = 'A'` em TODAS as 115 contas e `GrupoDRE = 0` em todas. Não é possível gerar DRE automático por categoria. Toda estrutura de DRE precisa ser construída com mapeamento manual das contas pelo nome.

---

## Colunas Relevantes para o Financeiro

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `Codigo` | int | PK |
| `Descricao` | varchar(100) | Nome da conta |
| `Grupo` | varchar(5) | Grupo analítico |
| `ContaContabil` | varchar(20) | Código contábil (integração contábil) |
| `PlanoContaPai` | int | FK → própria tabela (hierarquia) |
| `Nivel` | smallint | Nível na hierarquia (1 = raiz) |
| `TipoCategoria` | varchar(1) | `'R'` = Receita, `'D'` = Despesa |
| `GrupoDRE` | int | Agrupador de linhas na DRE |

---

## Usada por

- [[DRE e Fluxo de Caixa]] — estrutura da DRE
- [[Contas a Receber]] — classificação contábil
- [[Contas a Pagar]] — classificação contábil

---

## Mapeamento Manual de Contas (uso confirmado via DB)

### Receitas
| Código | Nome | Valor histórico | % |
|--------|------|-----------------|---|
| 2 | VENDA DE LIVROS | R$ 5.123.091 | 97% |
| 4 | VENDA DE E-BOOK | R$ 129.151 | 2% |
| 112 | Receitas financeiras | R$ 6 | ~0% |
| 116 | Outras receitas | — | — |

### Principais Despesas (valor pago, últimos 12 meses)
| Código | Nome | Valor pago (12m) |
|--------|------|-----------------|
| 21 | Produção Material Próprio | **R$ 962.000** |
| 20 | Materiais Para Revenda | R$ 468.000 |
| 29 | Marketing E Publicidade | R$ 426.000 |
| 30 | Frete Sobre Mercadorias | R$ 257.000 |
| 32 | Direitos Autorais | R$ 222.000 |
| 96 | Remuneração Autônomos - Administração | R$ 302.727 |
| 98 | Remuneração Autônomos - Livraria | R$ 177.700 |
| 28 | Remuneração Autônomos - Marketing | R$ 190.145 |
| 33 | Remuneração Autônomos - Editorial | R$ 121.522 |
| 93 | Remuneração Autônomos - Expedição | R$ 120.002 |
| 95 | Remuneração Autônomos - Financeiro | R$ 108.250 |
| 99 | Diretoria - PJ | R$ 178.158 |
| 84 | Sistemas e Softwares - Adm Marketing | R$ 160.285 |
| 23 | Salários A Pagar | R$ 163.684 |

### Contas a EXCLUIR do DRE
| Código | Nome | Motivo |
|--------|------|--------|
| 106 | TRANSFERENCIA ENTRE CONTAS | Não é despesa — movimentação interna. R$ 676.704 |
| 115 | Empréstimos e financiamentos | Passivo — não operacional. R$ 60.000 |
| 8 | A VERIFICAR | Sem classificação. R$ 132.015 — classificar urgente |

### Contas não identificadas ("Cod XXXX")
| Código (ID) | Valor lançado | Hipótese |
|-------------|--------------|---------|
| Cod 1191 (52) | R$ 53.229 | Provável código DARF |
| Cod 1138 (49) | R$ 24.587 | Idem |
| Cod 3208 (57) | R$ 10.056 | Idem |
| Cod 1082 (48) | R$ 10.150 | Idem |
| Cod 5952 (109) | R$ 3.087 | Idem |
| Cod 1170 (50) | R$ 3.073 | Idem |

---

## Relações

- Hierarquia recursiva: `PlanoContaPai` → `Codigo` da mesma tabela
- Referenciada por [[TituloFinanceiroRateio]], [[TituloFinanceiroBaixaRateio]], [[ContaBancariaLancamento]]
