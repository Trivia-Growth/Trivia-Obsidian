---
tags: [financeiro, modulo, estoque, cmv, produto, consignacao]
status: especificação
criado: 2026-04-15
---

# Gestão de Estoque e CMV

Módulo que consolida a posição de estoque por setor, calcula o CMV (Custo da Mercadoria Vendida) real por produto e período, e alerta sobre rupturas, produtos sem custo cadastrado e consignações em aberto.

---

## Problema Resolvido

| Problema atual | Impacto |
|---------------|---------|
| CMV calculado manualmente pelo contador | Relatório atrasado; sujeito a erro |
| Custo de livros produzidos internamente (gráfica) não está no Literarius | CMV subestimado; margem por produto desconhecida |
| Nenhum alerta de ruptura de estoque | Vendas perdidas por falta de produto |
| Consignações (R$1.15M) não rastreadas | Receita potencial não gerenciada |
| Posição de estoque por setor não visualizada no sistema novo | Time sem visão em tempo real |

---

## Objetivo

1. Dashboard de estoque por setor em tempo real (via views Literarius)
2. Cálculo automático de CMV: custo cadastrado × qtde vendida
3. Cobertura em dias por produto (estoque atual / média de saídas)
4. Alertas de ruptura (cobertura < 30 dias)
5. Lista de produtos sem custo cadastrado (para regularização)
6. Tracking de consignações em aberto com aging por parceiro
7. Integração com Qive: NF-e de gráfica recebida → atualizar custo do produto

---

## Fontes de Dados

### Literarius (leitura)

| Tabela / View | Campos-chave | Uso |
|--------------|-------------|-----|
| `vwProdutoEstoque` | Produto, Setor, QtdeEstoque | Estoque atual por setor |
| `vwProdutoCusto` | Produto, Custo | Custo unitário por produto |
| `vwProdutoResumo` (view HeziomOS) | Titulo, Estoque, Vendas30d, Vendas90d, CoberturaDias | Análise de produto em uma linha |
| `NotaFiscalItens` | Produto, Qtde, ValorUnitario, idNota | Itens vendidos |
| `NotaFiscal` | DataEmissao, EntSai, GeraFinanceiro, Cancelada, CanalVenda | Filtros de NF válida |
| `PedidoVendaItens` | Produto, Qtde, PrecoUnitario | Pedidos (mesmo produto em múltiplos canais) |

### HeziomOS DB (leitura + escrita)

| Tabela | Campos | Uso |
|--------|--------|-----|
| `product_costs` | produto_codigo, custo, origem, data_referencia, nfe_access_key | Custo alimentado via Qive |
| `consignment_tracking` | nfe_id, parceiro, data_emissao, valor, status, data_liquidacao | Tracking de consignações |

### Qive (integração)
- NF-e recebidas de fornecedores gráficos → custo de produção por lote
- `cnpj_rules` HeziomOS mapeia CNPJ da gráfica → produto(s) associado(s)

---

## Setores de Estoque Confirmados

| Setor | Qtde (produto 4731, abril/2026) | Descrição |
|-------|--------------------------------|-----------|
| EDITORA | 730 | Estoque principal da editora |
| PRÉDIO 9 | 825 | Depósito secundário |
| IPP | 14 | Estoque para uso interno IPP |
| SEPARAÇÃO | 145 | Em processo de separação/expedição |
| EMBU-GUAÇU | — | Filial externa |
| SHOWROOM | — | Loja física showroom |
| PICKING | 0 | Área de picking (transitório) |

**Estoque disponível para venda = Total − SEPARAÇÃO − PICKING**

---

## CMV — Metodologia de Cálculo

```
CMV = Σ (custo_unitario × qtde_vendida) por período

Onde:
  - custo_unitario = vwProdutoCusto.Custo (se disponível)
                   = product_costs.custo (alimentado via Qive)
                   = 0 se sem custo cadastrado (flag de alerta)
  - qtde_vendida   = NotaFiscalItens.Qtde WHERE NF válida
                     (EntSai='S', Cancelada=0, GeraFinanceiro=1)
```

**Categorias do CMV (conforme DRE oficial):**
- Custo de mercadorias (livros para revenda): `vwProdutoCusto.Custo`
- Direitos autorais (royalties de autores): `TituloFinanceiro` por PlanoConta específica
- Royalties de marca: idem

---

## Cobertura em Dias

```
Cobertura = Estoque atual / (Vendas últimos 90 dias / 90)

Exemplo produto 4731 (Mães Orando):
  Estoque disponível: 1.569 unidades
  Vendas últimos 90d: ~150 unidades (estimativa)
  Cobertura: 1.569 / (150/90) = ~942 dias
```

**Thresholds de alerta:**
- < 30 dias → Ruptura iminente (alerta crítico)
- 30–60 dias → Atenção (alerta moderado)
- > 60 dias → OK

---

## Consignações em Aberto

**Situação atual (abril/2026):**
- 80 NF-e com `GeraFinanceiro=0` e `TipoNota IN (4, 5)`
- Total: R$1.152.000 em livros enviados para consignação
- **Ação:** esses livros saíram do estoque mas ainda não geraram receita

**Tracking no HeziomOS:**

| Campo | Fonte |
|-------|-------|
| NF-e | `NotaFiscal.idNota`, `ChaveAcesso` |
| Parceiro | `Parceiro.Nome` |
| Data de emissão | `NotaFiscal.DataEmissao` |
| Valor total | `NotaFiscal.TotalNota` |
| Status | `pendente` / `liquidado` / `devolvido` |
| Aging | dias desde emissão |

**Alertas de consignação:**
- > 30 dias sem liquidação → alerta moderado
- > 90 dias sem liquidação → alerta crítico + sugestão de contato com parceiro

---

## Custo via Qive — Fluxo de Alimentação

```
Gráfica emite NF-e de cobrança → Qive captura
  │
  ├── Job NF-e (horário): identifica CNPJ = gráfica conhecida
  ├── Lê itens da NF: descrição, quantidade, valor unitário
  ├── Lookup em cnpj_rules: CNPJ gráfica → código(s) produto Literarius
  ├── INSERT em product_costs: produto, custo, data, access_key da NF
  └── Disponível para cálculo de CMV no próximo report
```

**Limitação atual:** muitos produtos são produzidos internamente e a gráfica pode não discriminar por produto na NF. Nesses casos, custo é proporcional (valor total / qtde total do lote).

---

## Tela — Dashboard de Estoque

```
┌──────────────────────────────────────────────────────────────────┐
│  Estoque e CMV — Abril/2026                                      │
│                                                                  │
│  Posição por Setor:                                              │
│  EDITORA: 42.310 un  |  PRÉDIO 9: 38.820 un  |  IPP: 2.140 un  │
│                                                                  │
│  ⚠ 12 produtos com cobertura < 30 dias  →  [Ver lista]          │
│  ⚠ 38 produtos sem custo cadastrado     →  [Regularizar]        │
│  ℹ Consignações abertas: R$1.152.000 (80 NFs)  →  [Aging]       │
│                                                                  │
│  CMV MTD: R$ 187.420  |  CMV/Receita: 39.2%                     │
└──────────────────────────────────────────────────────────────────┘
```

---

## Queries de Referência

```sql
-- Posição de estoque por setor (via vwProdutoEstoque)
SELECT
    p.Titulo,
    p.Codigo,
    pe.Setor,
    pe.QtdeEstoque,
    COALESCE(pc.Custo, 0) AS CustoUnitario,
    (pe.QtdeEstoque * COALESCE(pc.Custo, 0)) AS ValorEstoque
FROM Literarius.dbo.vwProdutoEstoque pe
JOIN Literarius.dbo.Produto          p  ON p.Codigo = pe.Produto
LEFT JOIN Literarius.dbo.vwProdutoCusto pc ON pc.Produto = pe.Produto
ORDER BY p.Titulo, pe.Setor;
```

```sql
-- Consignações em aberto
SELECT
    nf.idNota,
    nf.Numero,
    nf.DataEmissao,
    par.Nome        AS Parceiro,
    nf.TotalNota    AS ValorConsignado,
    DATEDIFF(DAY, nf.DataEmissao, GETDATE()) AS DiasEmAberto
FROM Literarius.dbo.NotaFiscal nf
JOIN Literarius.dbo.Parceiro   par ON par.Codigo = nf.Cliente
WHERE nf.GeraFinanceiro = 0
  AND nf.EntSai         = 'S'
  AND nf.Cancelada      = 0
  AND nf.TipoNota       IN (4, 5)
ORDER BY DiasEmAberto DESC;
```

```sql
-- CMV por período: custo × vendas
SELECT
    p.Titulo,
    SUM(nfi.Qtde)                             AS QtdeVendida,
    COALESCE(pc.Custo, 0)                     AS CustoUnitario,
    SUM(nfi.Qtde * COALESCE(pc.Custo, 0))     AS CMV,
    SUM(nfi.Qtde * nfi.ValorUnitario)         AS ReceitaBruta
FROM Literarius.dbo.NotaFiscalItens nfi
JOIN Literarius.dbo.NotaFiscal       nf  ON nf.idNota     = nfi.idNota
JOIN Literarius.dbo.Produto          p   ON p.Codigo       = nfi.Produto
LEFT JOIN Literarius.dbo.vwProdutoCusto pc ON pc.Produto  = nfi.Produto
WHERE nf.EntSai         = 'S'
  AND nf.Cancelada      = 0
  AND nf.GeraFinanceiro = 1
  AND nf.DataEmissao   >= DATEADD(MONTH, -1, GETDATE())
GROUP BY p.Titulo, pc.Custo
ORDER BY CMV DESC;
```

---

## Módulos Relacionados

- [[DRE e Fluxo de Caixa]] — CMV alimenta o DRE automaticamente
- [[Qive — NF-e Automática]] — NF-e de gráfica recebida atualiza custo
- [[Contas a Pagar]] — NF-e de gráfica gera título a pagar
- [[Alertas e Notificações]] — ruptura e consignações em atraso
- [[HeziomOS — Arquitetura]] — visão geral do sistema
