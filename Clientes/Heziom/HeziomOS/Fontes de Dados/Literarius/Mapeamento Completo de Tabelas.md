---
tags: [literarius, banco-de-dados, mapeamento, schema]
status: mapeado
criado: 2026-05-18
fonte: query sys.tables em produção (192.168.18.10:1433)
---

# Literarius — Mapeamento Completo de Tabelas

> Resultado de `SELECT t.name, SUM(p.rows) FROM sys.tables` em produção.  
> 150 tabelas encontradas. Classificadas por relevância para o HeziomOS.

---

## 🔴 Prioridade Alta — Replicar no Supabase

### Financeiro
| Tabela | Linhas | Observação |
|---|---|---|
| `TituloFinanceiro` | 50.263 | **Central** — A/P e A/R, DRE, fluxo de caixa |
| `TituloFinanceiroRateio` | 50.723 | Rateio por centro de resultado / plano de contas |
| `TituloFinanceiroBaixa` | 30.616 | Pagamentos efetivados — conciliação bancária |
| `TituloFinanceiroBaixaRateio` | 30.849 | Rateio das baixas |
| `ContaBancaria` | 11 | Contas cadastradas (Santander, Stone…) |
| `ContaBancariaLancamento` | 5.188 | Extrato interno — fluxo de caixa |
| `PlanoConta` | 115 | Estrutura contábil — DRE ⚠️ bug `TipoCategoria='A'` |
| `CentroResultado` | 13 | Análise por centro de resultado |
| `ControleCaixa` | 502 | Abertura/fechamento de caixa |
| `ControleCaixaItens` | 1.861 | Itens do caixa — pagamentos no balcão |
| `AjusteManualCusto` | 2.649 | Ajustes de CMV — impacta margem |

### Vendas / NF
| Tabela | Linhas | Observação |
|---|---|---|
| `PedidoVenda` | 22.857 | Pedidos — chave `SiteIdPedido` = conciliação Tray |
| `PedidoVendaItens` | 43.041 | Itens de cada pedido |
| `PedidoVendaVencimento` | 37.842 | Prazo de pagamento dos pedidos |
| `PedidoVendaHistorico` | 193.097 | Log de status — auditoria |
| `NotaFiscal` | 33.418 | NF-e emitidas |
| `NotaFiscalItens` | 71.986 | Itens das NFs |
| `NotaFiscalVencimento` | 48.152 | Vencimentos das NFs |
| `ProdutoPreco` | 6.090 | Preços com vigência por tabela |

### Estoque
| Tabela | Linhas | Observação |
|---|---|---|
| `Estoque` | 6.521 | **Saldo atual** por empresa/setor/produto |
| `MovimentoEstoque` | 163.604 | **Maior tabela operacional** — toda movimentação histórica |
| `Inventario` | 1.200 | Inventários realizados |
| `InventarioItens` | 9.176 | Itens dos inventários |
| `Produto` | 5.073 | Catálogo completo |
| `ProdutoAutor` | 2.583 | Vínculo produto → autor |

### Consignação
| Tabela | Linhas | Observação |
|---|---|---|
| `Consignacao` | 50 | Cabeçalho das consignações abertas |
| `ConsignacaoItens` | 3.360 | Itens — os R$1,15M em consignação aberta |
| `ConsignacaoNotasDevolucao` | 5.860 | Devoluções de consignação |

### Direito Autoral
| Tabela | Linhas | Observação |
|---|---|---|
| `DireitoAutoralFechamento` | 503 | Fechamentos de royalties por período |
| `DireitoAutoralFechamentoItens` | 14.039 | Detalhe por autor/produto |
| `DireitoAutoralParametro` | 90 | Percentuais por autor |
| `DireitoAutoralParametroItens` | 90 | Regras por produto/canal |

---

## 🟡 Prioridade Média — Replicar se necessário

| Tabela | Linhas | Categoria | Observação |
|---|---|---|---|
| `Entrada` | 217 | Compras | NF de entrada (compra de mercadoria) |
| `EntradaItens` | 5.527 | Compras | Itens das entradas |
| `EntradaVencimento` | 477 | Compras | Vencimentos — contas a pagar geradas |
| `LancamentoEstoque` | 720 | Estoque | Lançamentos manuais de estoque |
| `LancamentoEstoqueItens` | 2.603 | Estoque | Itens dos lançamentos |
| `TransferenciaEstoque` | 84 | Estoque | Entre setores/empresas |
| `TransferenciaEstoqueItens` | 813 | Estoque | Itens das transferências |
| `LogisticaEtiqueta` | 5.230 | Logística | Etiquetas geradas — rastreamento |
| `NotaFiscalVolume` | 24.490 | Logística | Volumes/caixas por NF |
| `NotaFiscalEventos` | 32.860 | Fiscal | Eventos SEFAZ (cancelamento, carta corr.) |
| `Parceiro` | 47.000 | Cadastro | Clientes e fornecedores — volumoso |
| `PedidoVendaComentarios` | 717 | Vendas | Observações dos pedidos |
| `ComissaoParametro` | 1 | Financeiro | Regras de comissão de vendedores |
| `ComissaoTipo` | 3 | Financeiro | Tipos de comissão |
| `MontagemKit` | 104 | Estoque | Kits compostos |
| `MontagemKitItens` | 320 | Estoque | Componentes dos kits |
| `LocalizacaoEstoque` | 337 | Estoque | WMS — localização de produto |

---

## ⚪ Ignorar / Baixa relevância

| Tabela | Linhas | Motivo |
|---|---|---|
| `CamposExtras` | 0 | Vazia |
| `ControleCaixaLancamento` | 0 | Vazia |
| `CreditoParceiro` | 0 | Vazia |
| `HubLitearius*` | 0 | Integrações externas não usadas |
| `Mercus*` | 0 | Integração Mercus não ativa |
| `FidelidadeParametro` | 0 | Programa de fidelidade não ativo |
| `PedidoCompra` | 0 | Compras não usadas pelo ERP |
| `ParceiroEndereco` | 136.198 | Volume alto, dados de endereço — baixa utilidade no HeziomOS |
| `NotaFiscalNumero` | 96.871 | Controle de numeração interno do ERP |
| `PedidoVendaItensConferencia` | 81.003 | Controle de conferência WMS interno |
| `SysMenu` / `SysRegistro` / `SysAcesso` | — | Sistema interno do Literarius |
| `LayoutImpressao` | 78 | Layouts de impressão |
| `ConfiguracaoGeral` | 406 | Configurações internas do ERP |
| `Cidade` / `Estado` / `Pais` | — | Tabelas de CEP/localidade |
| `TabelaBisac` | 4.588 | Catálogo BISAC — já vem no produto |
| `UsuarioAcesso` | 2.525 | Log de acesso ao ERP — não relevante |

---

## Descobertas que não estavam no radar

### 1. `MovimentoEstoque` — 163.604 linhas 🔥
A maior tabela operacional. Registra **toda** entrada e saída de estoque com data. Com isso conseguimos:
- Giro de estoque por produto
- Cobertura de dias (saldo ÷ saída média diária)
- Ranking de produtos mais vendidos por quantidade física
- Ruptura histórica (quando foi para zero)

### 2. `DireitoAutoralFechamento` + `DireitoAutoralFechamentoItens` — 14k linhas
Royalties já calculados. Com isso conseguimos o **custo real de cada título** para o DRE — não só o custo de produção, mas o que foi pago em direitos.

### 3. `Consignacao` / `ConsignacaoItens` — 50 cabeçalhos, 3.360 itens
Os R$1,15M em consignações abertas que já mencionamos estão aqui. `ConsignacaoNotasDevolucao` (5.860 linhas) mostra todo o histórico de devoluções — dá para calcular taxa de devolução por cliente/canal.

### 4. `ControleCaixa` + `ControleCaixaItens` — 502 / 1.861
Vendas no balcão físico (PDV). Faturamento do canal físico que **não aparece na Tray** — dado que faltava para o faturamento multi-canal completo.

### 5. `Entrada` + `EntradaItens` + `EntradaVencimento` — 217 / 5.527 / 477
NFs de compra (entradas de estoque). `EntradaVencimento` gera contas a pagar no `TituloFinanceiro` — com isso fechamos o ciclo compra → A/P → baixa.

### 6. `AjusteManualCusto` — 2.649 linhas
Ajustes manuais de CMV. Precisam entrar no cálculo de margem, senão o DRE fica distorcido.

---

## Tabelas críticas revisadas para réplica

Comparando com o schema anterior (`Réplica Supabase — Schema e Estratégia de Sync`), adicionar:

| Tabela nova | Por quê adicionar |
|---|---|
| `MovimentoEstoque` | Giro, cobertura, ranking de vendas físicas |
| `ControleCaixa` + `ControleCaixaItens` | Faturamento canal físico (PDV) |
| `DireitoAutoralFechamento` + `*Itens` | Custo real por título — essencial para margem |
| `Entrada` + `EntradaItens` + `EntradaVencimento` | NFs de compra → A/P |
| `AjusteManualCusto` | Ajustes de CMV |
| `CentroResultado` | Análise por centro — DRE segmentado |
| `NotaFiscalEventos` | Cancelamentos e cartas de correção |
| `TituloFinanceiroRateio` | Rateio por plano de conta — essencial para DRE |
| `TituloFinanceiroBaixaRateio` | Rateio das baixas |

---

## Referências

- [[Réplica Supabase — Schema e Estratégia de Sync]] — schema original (atualizar)
- [[ADR-001 — Sync Agent no Raspberry Pi]]
- [[Projeto/Estudo de APIs — Capacidades e Gaps]]

---

*Mapeado em 2026-05-18 via DBeaver + query sys.tables — Lucas Azevedo (Trivia)*
