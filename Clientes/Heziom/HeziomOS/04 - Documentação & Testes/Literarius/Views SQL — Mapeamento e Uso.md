---
tags: [literarius, views, banco-de-dados, sync]
status: mapeado
criado: 2026-05-18
fonte: INFORMATION_SCHEMA via pymssql direto
---

# Literarius — Views SQL (61 views mapeadas)

> O Literarius tem 61 views que já fazem os JOINs complexos entre tabelas.
> O sync agent deve **preferir views** em vez de JOIN manual nas tabelas brutas.
> Data: 2026-05-18

---

## Por que as views mudam tudo

A equipe Literarius já escreveu e mantém os JOINs complexos como views. Isso significa:

- **Sem JOIN no sync script** — o Deno/Python faz `SELECT * FROM vwProdutoEstoque` e recebe produto + estoque + autores + preço em 1 query
- **Menos erros** — os JOINs já foram testados em produção
- **Manutenção automática** — se o Literarius mudar o schema interno, a view se atualiza
- **Permissão isolada** — `acessoExterno` pode ter SELECT na view sem ver as tabelas brutas

---

## 🔴 Views críticas — usar no sync agent

### `vwProdutoEstoque` — 8.162 linhas, 85 colunas
**A view mais importante.** Combina Produto + Estoque + Autores + Preço + Imagens em uma query.

Colunas-chave disponíveis:
| Campo | Tipo | Descrição |
|---|---|---|
| `Codigo` | int | ID do produto |
| `Titulo` | varchar | Título do livro |
| `CodigoIsbn` | varchar | ISBN |
| `CodigoBarras` | varchar | EAN |
| `Preco` | money | Preço de capa |
| `QtdeEstoque` | numeric | **Saldo atual** |
| `QtdeEstoqueRecebido` | numeric | Qtde recebida |
| `QtdeEstoqueEnviada` | numeric | Qtde enviada |
| `EstoqueMinimo` | numeric | Estoque mínimo |
| `NomeAutor1/2/3` | varchar | Autores já JOINados |
| `Imagem1..7` | varchar | URLs das capas |
| `Inativo` | bit | Produto ativo/inativo |
| `Empresa` / `Setor` | int | Contexto de estoque |
| `SiteID` | varchar | ID no site (conciliação Tray) |
| `DataAlt` | datetime | Última alteração (para sync incremental) |

> **Substitui**: `SELECT Estoque JOIN Produto JOIN ProdutoAutor` — 3 tabelas em 1 query

---

### `vwProdutoCusto` — 5.073 linhas, 26 colunas
Produto com custo atual. Essencial para calcular margem no DRE.

> **Substitui**: JOIN entre `Produto` e tabela de CMV

---

### `vwProdutoHistoricoCusto` — 2.649 linhas, 23 colunas
Histórico de custo por produto (= `AjusteManualCusto`). Custo real ao longo do tempo.

> **Substitui**: `AjusteManualCusto JOIN Produto`

---

### `vwTituloFinanceiro` — 50.263 linhas, 51 colunas
Contas a pagar/receber com dados do parceiro já JOINados.

> **Substitui**: `TituloFinanceiro JOIN Parceiro JOIN PlanoConta`

---

### `vwTituloFinanceiroBaixas` — 30.616 linhas, 59 colunas
Baixas com dados completos do título original.

---

### `vwTituloFinanceiroBaixasComRateio` — 30.849 linhas, 62 colunas
Baixas + rateio por plano de conta. **A query mais complexa do DRE — já pronta.**

> Esta é a view que alimenta o DRE direto. O rateio (qual despesa/receita foi debitada em cada plano de conta) já está calculado.

---

### `vwTituloFinanceiroComRateio` — 50.723 linhas, 54 colunas
Todos os títulos (pago e a pagar) com rateio. Para DRE por competência (não apenas caixa).

---

### `vwPedidoVenda` — 22.856 linhas, 86 colunas
Pedidos com dados do cliente, canal, status e totais. **86 colunas** vs ~20 pela API HTTP.

> **Substitui**: `PedidoVenda JOIN Parceiro JOIN CanalVenda JOIN FormaPagto`

---

### `vwPedidoVendaItens` — 43.026 linhas, 100 colunas
Itens dos pedidos com produto, preço, desconto e totais calculados.

---

### `vwNotaFiscal` — 33.413 linhas, 99 colunas
NFs com cliente, chave NF-e, valores fiscais.

---

### `vwNotaFiscalComItens` — 71.981 linhas, 165 colunas
NF + itens em linha desnormalizada. Para análise fiscal completa.

---

### `vwMovimentoContaBancaria` — 26.966 linhas, 15 colunas
Lançamentos bancários com dados da conta já JOINados. Para conciliação bancária.

---

### `vwLancamentoContaBancaria` — 5.188 linhas, 24 colunas
Extrato interno detalhado por conta.

---

### `vwConsignacaoComItens` — 3.360 linhas, 64 colunas
Os R$1,15M em consignação aberta com itens, cliente e produto já JOINados.

> **Substitui**: `Consignacao JOIN ConsignacaoItens JOIN Produto JOIN Parceiro`

---

### `vwDireitoAutoralFechamento` — 14.039 linhas, 68 colunas
Fechamentos de royalties com autor, produto e valores. **A view de CMV editorial.**

> 68 colunas = autor + produto + período + valores já calculados. DRE editorial depende disso.

---

### `vwEntradaComItens` — 5.527 linhas, 110 colunas
NFs de compra com itens, fornecedor e produto. Para calcular CMV de compra.

---

## 🟡 Views úteis (uso secundário)

| View | Linhas | Uso |
|---|---|---|
| `vwProduto` | 5.073 | Catálogo completo com 88 cols — mais rico que tabela bruta |
| `vwParceiro` | 47.000 | Clientes/fornecedores com 90 cols — endereço, tipo, status |
| `vwEstoqueBox` | 6.436 | Estoque por box/palete (5 cols simples) |
| `vwDireitoAutoralNotas` | 17.041 | Notas de royalties emitidas |
| `vwEntrada` | 217 | NFs de entrada simplificadas |
| `vwComissaoFaturamento` | 1.123 | Comissão por faturamento — vendedores |
| `vwNotaFiscalComVencimentos` | 48.152 | NFs + vencimentos para A/R |

---

## ⚠️ Views com dados vazios / limitados

| View | Situação |
|---|---|
| `vwRankingVendasProdutos` | Retorna 1 linha zerada — precisa de parâmetros de data (período) |
| `vwRankingVendasClientes` | Mesmo problema — view parametrizada pelo Literarius |
| `vwComissaoBaixas` | 0 linhas — comissão não configurada atualmente |

> As views de ranking provavelmente são alimentadas por uma stored procedure ou precisam de um período pré-definido. Usar `MovimentoEstoque` ou `vwPedidoVendaItens` para calcular rankings no HeziomOS.

---

## Impacto no sync agent (Raspberry Pi)

### Antes (tabelas brutas):
```sql
-- Sync agent precisaria montar isso:
SELECT p.*, e.QtdeEstoque, pa.NomeAutor
FROM Produto p
LEFT JOIN Estoque e ON e.Produto = p.Codigo
LEFT JOIN ProdutoAutor pa ON pa.Produto = p.Codigo
WHERE p.DataAlt > @ultimo_sync
```

### Depois (views):
```sql
-- Agora é simplesmente:
SELECT * FROM vwProdutoEstoque
WHERE DataAlt > @ultimo_sync
```

### Tabela de decisão — view vs tabela bruta

| Tabela destino (Supabase) | Fonte SQL recomendada | Motivo |
|---|---|---|
| `lit_estoque` | `vwProdutoEstoque` | Produto + estoque + autores + preço em 1 query |
| `lit_titulo_financeiro` | `vwTituloFinanceiro` | Parceiro já JOINado |
| `lit_titulo_financeiro_baixa` | `vwTituloFinanceiroBaixasComRateio` | Rateio já calculado |
| `lit_pedido_venda` | `vwPedidoVenda` | 86 cols vs 20 da API |
| `lit_pedido_venda_item` | `vwPedidoVendaItens` | 100 cols com produto |
| `lit_nota_fiscal` | `vwNotaFiscal` | Cliente e fiscal juntos |
| `lit_consignacao` | `vwConsignacaoComItens` | Evita 2 queries separadas |
| `lit_direito_autoral` | `vwDireitoAutoralFechamento` | View mais completa que tabela |
| `lit_conta_bancaria_lancamento` | `vwMovimentoContaBancaria` | Conta já JOINada |
| `lit_produto` | `vwProduto` | 88 cols — mais rico |

---

## Sobre a view de BookInfo

As views `vwBookInfo*` (11 views) parecem ser uma integração com a plataforma **BookInfo** (sistema editorial de catálogos). São:
- `vwBookInfoCompras`, `vwBookInfoComprasItens`, `vwBookInfoComprasPagamento`
- `vwBookInfoVendas`, `vwBookInfoVendasItens`, `vwBookInfoVendasPagamento`
- `vwBookInfoProdutos`, `vwBookInfoProdutosCategorias`
- `vwBookInfoLojas`

> Baixa prioridade para o HeziomOS — são views de integração com sistema externo específico.

---

## Pendências

- [ ] Verificar se `acessoExterno` tem SELECT nas views (já confirmado: sim)
- [ ] Checar `vwRankingVendasProdutos` com suporte Literarius — pode precisar de parâmetros
- [ ] Atualizar [[Réplica Supabase — Schema e Estratégia de Sync]] para referenciar views nas queries de sync
- [ ] Atualizar [[STORY-009 — Setup Raspberry Pi Sync Agent]] com queries de sync usando views

---

## Referências

- [[Réplica Supabase — Schema e Estratégia de Sync]] — atualizar fonte das queries
- [[Mapeamento Completo de Tabelas]] — tabelas brutas (usar como fallback)
- [[ADR-001 — Sync Agent no Raspberry Pi]] — onde o sync roda

---

*Mapeado em 2026-05-18 — Lucas Azevedo (Trivia)*