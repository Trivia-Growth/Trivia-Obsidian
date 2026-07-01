---
tags: [literarius, schema, banco-de-dados, índice]
status: mapeado
criado: 2026-05-18
---

# Literarius DB — Índice de Documentação

> ℹ️ **Nota 2026-07-01:** este é o dicionário de dados do ERP Literarius (válido). O destino de sync **não** é mais "Raspberry Pi + tabelas `lit_*` soltas" (spec antiga) — é o schema **`lit_mirror`** no Supabase, populado pelo repo `literarius-sync` (Windows Server). Os dicionários de 18/06 desta pasta já refletem isso.

> Schema mapeado diretamente do SQL Server em produção via pymssql.  
> Conexão: `192.168.18.10:1433` · Base: `Literarius` · Data: 2026-05-18

---

## Módulos documentados

| Arquivo | Tabelas | Linhas totais | Relevância |
|---|---|---|---|
| [[TituloFinanceiro]] | TituloFinanceiro, Baixa, Rateio, BaixaRateio | ~162k | 🔴 DRE, Fluxo de Caixa, Conciliação |
| [[ContaBancaria]] | ContaBancaria, Lancamento, ControleCaixa, CaixaItens | ~7.5k | 🔴 Saldo bancário, PDV físico |
| [[PlanoConta]] | PlanoConta, CentroResultado, AjusteManualCusto | ~2.8k | 🔴 DRE — ⚠️ bug TipoCategoria |
| [[PedidoVenda]] | PedidoVenda, Itens, Vencimento, Status | ~104k | 🔴 Pedidos, conciliação Tray |
| [[PedidoVendaHistorico]] | PedidoVendaHistorico | ~214k | 🟡 Audit log de trocas de status |
| [[NotaFiscal]] | NotaFiscal, Itens, Vencimento, ProdutoPreco | ~160k | 🔴 Faturamento, fiscal |
| [[NotaFiscalEventos]] | NotaFiscalEventos | ~36k | 🟡 Eventos SEFAZ (cancelamentos, CC-e) |
| [[LogisticaEtiqueta]] | LogisticaEtiqueta | ~6.1k | 🟡 Etiquetas de envio e rastreamento |
| [[Estoque]] | Estoque, MovimentoEstoque, Lancamento, Inventario | ~180k | 🔴 Posição e giro de estoque |
| [[Produto]] | Produto, ProdutoAutor | ~7.6k | 🟡 Catálogo editorial |
| [[MontagemKit]] | MontagemKit, MontagemKitItens | ~609 | 🟡 Kits compostos |
| [[Consignacao]] | Consignacao, Itens, NotasDevolucao | ~9.3k | 🔴 R$1,15M em consignação aberta |
| [[DireitoAutoral]] | DireitoAutoralFechamento, Itens, Parametro | ~14.6k | 🟡 Royalties — custo real por título |
| [[Entrada]] | Entrada, Itens, Vencimento | ~6.2k | 🟡 NFs de compra, CMV |
| [[Parceiro]] | Parceiro, CanalVenda, FormaPagto, TipoCliente | ~47k | 🟡 Base de clientes |
| [[ComissaoTipo]] | ComissaoTipo | 3 | ⚪ Enum de tipos de comissão |

---

## Views SQL (61 views mapeadas)

[[Views SQL — Mapeamento e Uso]] — documento completo com análise de uso no sync agent

| View | Linhas | Por que usar |
|---|---|---|
| `vwProdutoEstoque` | 8.162 | Produto + Estoque + Autores + Preço em 1 query (85 cols) |
| `vwTituloFinanceiroBaixasComRateio` | 30.849 | Baixas + rateio — a query mais complexa do DRE já pronta |
| `vwTituloFinanceiroComRateio` | 50.723 | DRE por competência |
| `vwPedidoVenda` | 22.856 | 86 colunas com cliente e canal JOINados |
| `vwConsignacaoComItens` | 3.360 | R$1,15M em consignação completo |
| `vwDireitoAutoralFechamento` | 14.039 | CMV editorial — autor + produto + royalties |
| `vwMovimentoContaBancaria` | 26.966 | Extrato bancário consolidado |

---

## Arquivo bruto

- `Schema Detalhado.md` — todas as tabelas em um único arquivo (4.903 linhas)
- `/tmp/literarius_schema.json` — JSON bruto com colunas + amostras (usar para gerar DDL Supabase)

---

## Pendências de mapeamento

| Tabela | Por quê mapear | Prioridade |
|---|---|---|
| `ComissaoParametro` | Percentuais de comissão de vendedores | 🟡 |
| `ExposicaoFeira` | Vendas em feiras (8 registros) | ⚪ |

---

## Destaques do mapeamento

### Campos que a API HTTP não expõe mas o SQL tem
- `TituloFinanceiro` — 41 colunas vs ~8 via API
- `NotaFiscal` — 112 colunas com dados fiscais completos (CFOP, CST, alíquotas)
- `NotaFiscalItens` — 126 colunas
- `PedidoVenda` — 47 colunas vs ~20 via API
- `Produto` — 69 colunas (sinopse, bisac, dimensões, peso, tiragem)

### Descobertas relevantes
- `MovimentoEstoque` (163k linhas) → giro de estoque, cobertura em dias, ranking físico de vendas
- `ControleCaixa` + `ControleCaixaItens` → faturamento PDV físico ausente na Tray
- `DireitoAutoralFechamentoItens` (14k) → custo real por título para o DRE
- `ConsignacaoItens` (3.360) → mapeamento dos R$1,15M em consignação aberta
- `PlanoConta` bug → `tipoCategoria = 'A'` em todos os 115 registros (bloqueia DRE)

---

## Referências

- [[Mapeamento Completo de Tabelas]] — todas as 150 tabelas com classificação
- [[Réplica Supabase — Schema e Estratégia de Sync]] — quais replicar e com que frequência
- [[ADR-001 — Sync Agent no Raspberry Pi]]
- [[Estudo de APIs — Capacidades e Gaps]]

---

*Mapeado em 2026-05-18 — Lucas Azevedo (Trivia)*
