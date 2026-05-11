---
tags: [processos, consignacao, kr2]
criado: 2026-05-07
---

# KR2 — Consignação

Gestão de livros em consignação — modelo de negócio relevante para a Heziom (editora). O Literarius possui módulo dedicado para consignação.

**Contexto:** Consignação é quando livros são enviados para um parceiro vender, sem transferência de propriedade até a venda efetiva. O acerto periódico define quantos foram vendidos, quais devolvidos e o valor a receber/pagar.

---

## Fluxo 1 — Consignação Concedida

> Heziom **envia** livros para clientes/livrarias venderem em consignação.

### Como é hoje

**Passo 1 — Envio da remessa**
- Emissão de NF de remessa em consignação no Literarius
- Registro da saída do estoque (não é venda — não gera receita ainda)
- Envio físico dos livros

**Passo 2 — Fornecimento do mapa de consignação**
- Heziom envia ao cliente (em consignação) o mapa atualizado das obras disponíveis
- Feito periodicamente ou por solicitação do cliente

**Passo 3 — Acerto de consignação**
- Cliente informa quantos livros foram vendidos no período
- Heziom emite NF de venda para os livros vendidos → gera `TituloFinanceiro` a receber
- Livros não vendidos: cliente devolve ou renova a consignação
- Atualização do estoque no Literarius

### Dados no Literarius
- Módulo de consignação dedicado no Literarius
- Posição de consignação aberta: **R$ 1,15M** (dado de abril 2026 — ver [[Análise dos Dados Extraídos]])
- NFs de remessa com `GeraFinanceiro = 0` (não geram receita no momento do envio)

### HeziomOS
**Status:** 🟡 Otimizado — Fase 3
- HeziomOS lê a posição de consignação aberta do Literarius
- Dashboard exibe aging dos R$ 1,15M em consignação: quanto há >30d, >60d, >90d sem acerto
- Alerta automático quando consignação está aberta além do prazo acordado
- Decisão de automação total a definir com base no volume e complexidade dos acertos

**Módulo futuro:** Aging de consignações (Fase 3 — já no Backlog)

---

## Fluxo 2 — Consignação Recebida

> Heziom **recebe** livros de outros editores/fornecedores para vender em sua livraria.

### Como é hoje

**Passo 1 — Troca de notas (entrada)**
- Fornecedor emite NF de remessa em consignação para a Heziom
- Heziom registra a entrada no Literarius (Série 0 para entradas antigas)
- Livros entram no estoque sob custódia (não são propriedade da Heziom)

**Passo 2 — Acerto de consignação recebida**
- Heziom informa ao fornecedor quantos livros foram vendidos
- Fornecedor emite NF de venda → Heziom recebe NF de compra
- Heziom paga o fornecedor pelo que foi vendido
- Livros não vendidos: devolução com NF de devolução

**Obs — Série 0:** Entrada antiga no Literarius para consignações recebidas anteriores ao sistema atual. Processo legado que ainda pode existir em estoque.

### Dados no Literarius
- Módulo de consignação recebida no Literarius
- Títulos a pagar gerados apenas após acerto (não no recebimento)

### HeziomOS
**Status:** 🟡 Otimizado — Fase 3
- Posição de estoque em consignação recebida exibida no módulo [[Gestão de Estoque e CMV]]
- Alertas de títulos a pagar oriundos de acertos de consignação no módulo [[Contas a Pagar]]
- Fila de NF-e recebidas via [[Qive — NF-e Automática]] captura NFs de acerto do fornecedor

---

## Resumo KR2

| Fluxo | Complexidade | Impacto financeiro | Fase HeziomOS |
|-------|-------------|-------------------|---------------|
| Concedida | Alta | Alto (R$ 1,15M em aberto) | 3 |
| Recebida | Média | Médio | 3 |

**Ponto crítico:** O aging dos R$ 1,15M em consignação concedida é um risco financeiro relevante — clientes que não fazem acerto há meses representam receita travada. O HeziomOS deve trazer visibilidade disso para o CEO.

---

Ver também: [[Índice dos Processos]] · [[Gestão de Estoque e CMV]] · [[Contas a Receber]] · [[Backlog]]
