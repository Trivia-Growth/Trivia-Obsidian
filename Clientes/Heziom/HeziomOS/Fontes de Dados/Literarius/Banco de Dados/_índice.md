---
tags: [literarius, schema, banco-de-dados, índice]
status: mapeado
criado: 2026-05-18
---

# Literarius DB — Índice de Documentação

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
| [[NotaFiscal]] | NotaFiscal, Itens, Vencimento, ProdutoPreco | ~160k | 🔴 Faturamento, fiscal |
| [[Estoque]] | Estoque, MovimentoEstoque, Lancamento, Inventario | ~180k | 🔴 Posição e giro de estoque |
| [[Produto]] | Produto, ProdutoAutor | ~7.6k | 🟡 Catálogo editorial |
| [[Consignacao]] | Consignacao, Itens, NotasDevolucao | ~9.3k | 🔴 R$1,15M em consignação aberta |
| [[DireitoAutoral]] | DireitoAutoralFechamento, Itens, Parametro | ~14.6k | 🟡 Royalties — custo real por título |
| [[Entrada]] | Entrada, Itens, Vencimento | ~6.2k | 🟡 NFs de compra, CMV |
| [[Parceiro]] | Parceiro, CanalVenda, FormaPagto, TipoCliente | ~47k | 🟡 Base de clientes |

---

## Arquivo bruto

- `Schema Detalhado.md` — todas as tabelas em um único arquivo (4.903 linhas)
- `/tmp/literarius_schema.json` — JSON bruto com colunas + amostras (usar para gerar DDL Supabase)

---

## Pendências de mapeamento

| Tabela | Por quê mapear | Prioridade |
|---|---|---|
| `ComissaoParametro` + `ComissaoTipo` | Regras de comissão de vendedores | 🟡 |
| `LogisticaEtiqueta` | Rastreamento de entregas (5.230 etiquetas) | 🟡 |
| `NotaFiscalEventos` | Cancelamentos e cartas de correção SEFAZ | 🟡 |
| `PedidoVendaHistorico` | Auditoria completa de status (193k linhas) | 🟡 |
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
- [[Projeto/Estudo de APIs — Capacidades e Gaps]]

---

*Mapeado em 2026-05-18 — Lucas Azevedo (Trivia)*
