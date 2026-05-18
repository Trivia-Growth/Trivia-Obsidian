---
tags: [processos, consignacao, kr2]
criado: 2026-05-07
atualizado: 2026-05-11
---

# KR2 — Consignação

Gestão de livros em consignação — modelo de negócio relevante para a Heziom (editora). O Literarius possui módulo dedicado para consignação.

**Contexto:** Consignação é quando livros são enviados para um parceiro vender, sem transferência de propriedade até a venda efetiva. O acerto periódico define quantos foram vendidos, quais devolvidos e o valor a receber/pagar.

> ⚠️ **Ponto crítico:** Posição de consignação concedida aberta: **R$ 1,15M** (abril 2026). Clientes que não fazem acerto há meses representam receita travada — o HeziomOS deve trazer visibilidade disso para o CEO.

---

## Fluxo 1 — Consignação Concedida

> Heziom **envia** livros para clientes/livrarias venderem em consignação.

🎬 [▶ Envio da remessa](KRs/KR%202%20-%20Consignação/Consignação%20Concedida/01.%20Envio%20da%20remessa.webm)
🎬 [▶ Fornecer o mapa de consignação](KRs/KR%202%20-%20Consignação/Consignação%20Concedida/02.%20Fornecer%20o%20mapa%20de%20consignação%20para%20cliente%20em%20consignado.webm)
🎬 [▶ Acerto de consignação concedida](KRs/KR%202%20-%20Consignação/Consignação%20Concedida/03.%20Acerto%20de%20consignação%20concedida.webm)

**HeziomOS:** 🟡 Otimizado — Fase 3
**Fase:** 3

### Passo 1 — Envio da remessa

1. Emitir **NF de remessa em consignação** no Literarius
   - `GeraFinanceiro = 0` (não gera receita — é apenas saída de estoque)
2. Registrar a saída do estoque (não é venda)
3. Envio físico dos livros

### Passo 2 — Fornecimento do mapa de consignação

1. Heziom envia ao cliente o **mapa atualizado das obras disponíveis**
2. Feito periodicamente ou por solicitação do cliente

### Passo 3 — Acerto de consignação concedida

1. Cliente informa quantos livros foram **vendidos no período**
2. Heziom emite **NF de venda** para os livros vendidos → gera `TituloFinanceiro` a receber
3. Livros não vendidos: cliente devolve ou **renova a consignação**
4. Atualizar o estoque no Literarius

### Dados no Literarius

- Módulo de consignação dedicado no Literarius
- Posição de consignação aberta: **R$ 1,15M** (abril 2026 — ver [[Análise dos Dados Extraídos]])
- NFs de remessa com `GeraFinanceiro = 0`

### HeziomOS — O que será entregue

- Dashboard exibe **aging** dos R$ 1,15M em consignação: quanto há >30d, >60d, >90d sem acerto
- Alerta automático quando consignação está aberta além do prazo acordado
- **Módulo futuro:** Aging de consignações (Fase 3 — já no Backlog)

---

## Fluxo 2 — Consignação Recebida

> Heziom **recebe** livros de outros editores/fornecedores para vender em sua livraria.

🎬 [▶ Troca de notas — entrada](KRs/KR%202%20-%20Consignação/Consignação%20Recebida/01.Troca%20de%20notas%20Consignação%20recebida.mp4)
🎬 [▶ Acerto de consignação recebida (parte 1)](KRs/KR%202%20-%20Consignação/Consignação%20Recebida/02.Acerto%20de%20consignação%20recebida.webm)
🎬 [▶ Acerto de consignação recebida (parte 2)](KRs/KR%202%20-%20Consignação/Consignação%20Recebida/03.Acerto%20de%20consignação%20recebida.mkv)

**HeziomOS:** 🟡 Otimizado — Fase 3
**Fase:** 3

### Passo 1 — Troca de notas (entrada)

1. Fornecedor emite **NF de remessa em consignação** para a Heziom
2. Heziom registra a entrada no Literarius (Série 0 para entradas antigas)
3. Livros entram no estoque sob **custódia** (não são propriedade da Heziom)

### Passo 2 — Acerto de consignação recebida

1. Heziom informa ao fornecedor quantos livros foram **vendidos**
2. Fornecedor emite **NF de venda** → Heziom recebe NF de compra
3. Heziom paga o fornecedor pelo que foi vendido
4. Livros não vendidos: **devolução com NF de devolução**

### Dados no Literarius

- Módulo de consignação recebida no Literarius
- Títulos a pagar gerados apenas **após acerto** (não no recebimento)

### Obs — Série 0

Entrada antiga no Literarius para consignações recebidas anteriores ao sistema atual. Processo legado que ainda pode existir em estoque.

### HeziomOS — O que será entregue

- Posição de estoque em consignação recebida exibida no módulo [[Gestão de Estoque e CMV]]
- Alertas de títulos a pagar oriundos de acertos no módulo [[Contas a Pagar]]
- Fila de NF-e recebidas via [[Qive — NF-e Automática]] captura NFs de acerto do fornecedor

---

## Pontos de atenção (AMPA)

**Consignação Concedida:** Sem observações adicionais.

**Consignação Recebida:**
- Mapear com todos os fornecedores (editoras) e **agendar dias específicos** ao longo do mês para realizar o acerto
- Preferencialmente **fora da primeira semana do mês** para não coincidir com o fechamento para contabilidade

**Melhoria geral:**
> A principal melhoria já realizada foi a implantação do novo sistema (agosto 2025) e a realização do processo de consignação por meio dele. Agora as editoras, juntamente com seus processos de consignação, estão devidamente inseridas no sistema.

---

## Resumo KR2

| Fluxo | Complexidade | Impacto financeiro | Fase HeziomOS |
|-------|-------------|-------------------|---------------|
| Concedida | Alta | Alto (R$ 1,15M em aberto) | 3 |
| Recebida | Média | Médio | 3 |

---

Ver também: [[Índice dos Processos]] · [[Gestão de Estoque e CMV]] · [[Contas a Receber]] · [[Backlog]]
