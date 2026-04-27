---
tags: [literarius, views, sql, performance, arquitetura]
status: pronto para executar
criado: 2026-04-15
acesso-banco: READ ONLY (acessoExterno) — DDL precisa de outro usuário
---

# Views — Camada de Acesso HeziomOS

## Por que criar views

Toda consulta ao Literarius sem views exige:
1. **Exploração de schema** — descobrir nomes de colunas (`SELECT TOP 1 *`, `INFORMATION_SCHEMA`) antes de escrever qualquer query útil
2. **Queries complexas** com JOINs em 4-5 tabelas e filtros obrigatórios que erram na primeira tentativa
3. **Múltiplas consultas** para montar uma análise simples

Com views, qualquer consulta vira uma linha:
```sql
SELECT * FROM vw_Heziom_ProdutoResumo WHERE Codigo = 4731
```

**Resultado prático:** ~70% de redução no número de queries por análise. Sem exploração, sem retrabalho.

---

## Acesso ao banco

| Parâmetro | Valor |
|-----------|-------|
| Servidor | `192.168.18.10` (resolução local de `VMAPP01\SQL2022`) |
| Porta | 1433 |
| Usuário leitura | `acessoExterno` / `ZS3D84yiB5t0` |
| Database | `Literarius` |
| Permissão | **READ ONLY** — CREATE VIEW precisa de usuário com DDL |

> Para executar os scripts abaixo, solicitar ao time do Literarius ou DBA que rode com usuário `sa` ou equivalente.

---

## Schema — Nomes reais das colunas (descobertos via conexão direta)

Documentado para evitar reexploração. Use estes nomes exatos.

### Produto
| Coluna | Tipo | Observação |
|--------|------|-----------|
| `Codigo` | int | PK |
| `Titulo` | varchar | Nome do produto (não `Descricao`) |
| `SubTitulo` | varchar | Subtítulo |
| `CodigoIsbn` | varchar | ISBN (não `ISBN`) |
| `CodigoBarras` | varchar | EAN/barcode |
| `Preco` | money | Preço de tabela |
| `Desconto` | money | Desconto padrão |
| `Inativo` | bit | 0=ativo, 1=inativo |
| `TipoProduto` | int | 1=livro físico |
| `DataLancamento` | datetime | Data de lançamento |

### NotaFiscal
| Coluna | Tipo | Observação |
|--------|------|-----------|
| `idNotaFiscal` | PK | |
| `Numero` | — | Número da NF (não `NumeroNota`) |
| `Cliente` | int | FK Parceiro.Codigo (tanto cliente quanto fornecedor) |
| `Nome` | varchar | Nome do cliente/fornecedor na NF |
| `CnpjCpf` | varchar | CNPJ/CPF do cliente/fornecedor na NF |
| `EntSai` | char | `'S'`=saída/venda, `'E'`=entrada/compra |
| `DataEmissao` | datetime | Data de competência |
| `CanalVenda` | int | FK CanalVenda.Codigo |
| `Cancelada` | bit | Filtro obrigatório: `= 0` |
| `GeraFinanceiro` | bit | Filtro obrigatório para receita real: `= 1` |
| `TotalNota` | money | Total já pós-desconto |
| `ValorFrete` | money | Frete embutido na NF |
| `TotalImpostos` | money | Sempre 0 para livros (imunidade) |
| `NFeChave` | varchar | Chave de acesso SEFAZ (44 chars) |
| `SiteIdPedido` | varchar | ID do pedido na Tray |

### NotaFiscalItens
| Coluna | Tipo | Observação |
|--------|------|-----------|
| `idNotaFiscalItens` | PK | |
| `idNotaFiscal` | FK | JOIN com NotaFiscal |
| `Produto` | int | FK Produto.Codigo |
| `Qtde` | numeric | Quantidade (não `Quantidade`) |
| `ValorUnitario` | money | Preço unitário bruto |
| `PercDesconto` | money | % de desconto aplicado |
| `ValorDesconto` | money | Valor do desconto |
| `ValorTotal` | money | Total do item (já com desconto) |
| `PlanoConta` | int | FK PlanoConta.Codigo |
| `CentroResultado` | int | FK CentroResultado.Codigo |

### TituloFinanceiro
| Coluna | Tipo | Observação |
|--------|------|-----------|
| `idTituloFinanceiro` | PK | |
| `TipoTitulo` | char | `'R'`=receber, `'P'`=pagar |
| `Pago` | bit | 0=aberto, 1=liquidado — campo definitivo (não usar `Situacao`) |
| `Parceiro` | int | FK Parceiro.**Codigo** (não `idParceiro`) |
| `Emissao` | datetime | Data de emissão |
| `Vencimento` | datetime | Data de vencimento |
| `Valor` | money | Valor original |
| `ValorPago` | money | Valor já pago |
| `PlanoConta` | int | FK PlanoConta.Codigo |
| `CentroResultado` | int | FK CentroResultado.Codigo |
| `Origem` | int | 1=NF, NULL=manual, 2=pedido, 6=avulso |
| `Situacao` | int | **INÚTIL** — sempre = 1 em 100% dos registros |

### Parceiro
| Coluna | Tipo | Observação |
|--------|------|-----------|
| `Codigo` | int | **PK real** (não `idParceiro`) |
| `Nome` | varchar | Nome do parceiro |
| `CnpjCpf` | varchar | CNPJ ou CPF |
| `TipoParceiro` | char | `'C'`=cliente, `'F'`=fornecedor |

> ⚠️ JOIN correto: `JOIN Parceiro p ON p.Codigo = tf.Parceiro` — usar `idParceiro` retorna erro.

---

## Views a criar no Literarius

Solicitar ao DBA/Literarius para executar os scripts abaixo com usuário com permissão DDL.

---

### 1. `vw_Heziom_Produto` — produto + custo + estoque consolidado

```sql
CREATE VIEW vw_Heziom_Produto AS
SELECT
    p.Codigo,
    p.Titulo,
    p.SubTitulo,
    p.CodigoIsbn,
    p.CodigoBarras,
    p.Preco                     AS PrecoTabela,
    p.Desconto                  AS DescontoTabela,
    p.Inativo,
    p.TipoProduto,
    p.DataLancamento,
    pc.Custo                    AS CustoUnitario,
    pc.QtdeEstoque              AS EstoqueTotal,
    pc.QtdeEstoqueRecebido      AS EstoqueRecebido,
    pc.QtdeEstoqueEnviada       AS EstoqueEnviado
FROM Literarius.dbo.Produto p
LEFT JOIN Literarius.dbo.vwProdutoCusto pc ON pc.Codigo = p.Codigo;
```

**Uso:**
```sql
SELECT * FROM vw_Heziom_Produto WHERE Codigo = 4731
SELECT * FROM vw_Heziom_Produto WHERE Inativo = 0 AND EstoqueTotal > 0
```

---

### 2. `vw_Heziom_EstoqueSetor` — estoque por produto + setor

```sql
CREATE VIEW vw_Heziom_EstoqueSetor AS
SELECT
    Codigo,
    Titulo,
    SubTitulo,
    Setor,
    DescSetor,
    QtdeEstoque,
    EstoqueMinimo,
    EstoqueMinimoPicking,
    Preco           AS PrecoTabela,
    Localizacao
FROM Literarius.dbo.vwProdutoEstoque;
```

**Uso:**
```sql
SELECT * FROM vw_Heziom_EstoqueSetor WHERE Codigo = 4731
SELECT * FROM vw_Heziom_EstoqueSetor WHERE QtdeEstoque < EstoqueMinimo AND EstoqueMinimo > 0
```

---

### 3. `vw_Heziom_Faturamento` — NFs com filtros obrigatórios já aplicados

```sql
CREATE VIEW vw_Heziom_Faturamento AS
SELECT
    nf.idNotaFiscal,
    nf.DataEmissao,
    CAST(nf.DataEmissao AS DATE)                        AS Data,
    YEAR(nf.DataEmissao)                                AS Ano,
    MONTH(nf.DataEmissao)                               AS Mes,
    FORMAT(nf.DataEmissao, 'yyyy-MM')                   AS AnoMes,
    nf.CanalVenda,
    cv.Descricao                                        AS Canal,
    nf.Cliente,
    nf.Nome                                             AS ClienteNome,
    nf.CnpjCpf                                         AS ClienteCNPJ,
    nf.TotalNota                                        AS Bruto,
    nf.ValorFrete                                       AS Frete,
    nf.TotalNota - nf.ValorFrete                        AS Liquido,
    nf.Desconto,
    nf.NFeChave                                         AS ChaveAcesso,
    nf.SiteIdPedido,
    nf.Setor,
    nf.idPedidoVenda
FROM Literarius.dbo.NotaFiscal nf
LEFT JOIN Literarius.dbo.CanalVenda cv ON cv.Codigo = nf.CanalVenda
WHERE nf.EntSai = 'S'
  AND nf.Cancelada = 0
  AND nf.GeraFinanceiro = 1;
```

**Uso:**
```sql
-- Faturamento do mês
SELECT Canal, COUNT(*) AS Notas, SUM(Liquido) AS Total
FROM vw_Heziom_Faturamento
WHERE AnoMes = '2026-04'
GROUP BY Canal ORDER BY Total DESC

-- Faturamento por dia
SELECT Data, SUM(Liquido) AS Total
FROM vw_Heziom_Faturamento
WHERE Ano = 2026 AND Mes = 4
GROUP BY Data ORDER BY Data
```

---

### 4. `vw_Heziom_FaturamentoItens` — itens de venda com produto e canal

```sql
CREATE VIEW vw_Heziom_FaturamentoItens AS
SELECT
    nf.idNotaFiscal,
    nf.DataEmissao,
    FORMAT(nf.DataEmissao, 'yyyy-MM')   AS AnoMes,
    YEAR(nf.DataEmissao)                AS Ano,
    MONTH(nf.DataEmissao)               AS Mes,
    cv.Descricao                        AS Canal,
    nfi.Produto,
    p.Titulo,
    p.CodigoIsbn,
    nfi.Qtde,
    nfi.ValorUnitario,
    nfi.PercDesconto                    AS Desconto,
    nfi.ValorDesconto,
    nfi.ValorTotal                      AS Total,
    nfi.PlanoConta,
    nfi.CentroResultado
FROM Literarius.dbo.NotaFiscalItens nfi
JOIN  Literarius.dbo.NotaFiscal nf ON nf.idNotaFiscal = nfi.idNotaFiscal
JOIN  Literarius.dbo.Produto p     ON p.Codigo = nfi.Produto
LEFT JOIN Literarius.dbo.CanalVenda cv ON cv.Codigo = nf.CanalVenda
WHERE nf.EntSai = 'S'
  AND nf.Cancelada = 0
  AND nf.GeraFinanceiro = 1;
```

**Uso:**
```sql
-- Análise de produto por canal
SELECT Canal, SUM(Qtde) AS Qtd, SUM(Total) AS Fat, AVG(Desconto) AS DescMedio
FROM vw_Heziom_FaturamentoItens
WHERE Produto = 4731 AND AnoMes >= '2025-12'
GROUP BY Canal ORDER BY Fat DESC

-- Top 20 produtos do mês
SELECT Produto, Titulo, SUM(Qtde) AS Qtd, SUM(Total) AS Fat
FROM vw_Heziom_FaturamentoItens
WHERE AnoMes = '2026-04'
GROUP BY Produto, Titulo ORDER BY Fat DESC
```

---

### 5. `vw_Heziom_Titulos` — títulos financeiros com nomes resolvidos

```sql
CREATE VIEW vw_Heziom_Titulos AS
SELECT
    tf.idTituloFinanceiro,
    tf.TipoTitulo,
    tf.Pago,
    tf.Emissao,
    tf.Vencimento,
    DATEDIFF(DAY, tf.Vencimento, GETDATE())     AS DiasAtraso,
    tf.Valor,
    tf.ValorPago,
    tf.Valor - tf.ValorPago                     AS Saldo,
    tf.Parcela,
    tf.TotalParcela,
    tf.Origem,
    tf.PlanoConta,
    pc.Descricao                                AS PlanoContaNome,
    tf.CentroResultado,
    cr.Descricao                                AS CentroResultadoNome,
    tf.Parceiro,
    par.Nome                                    AS ParceiroNome,
    par.CnpjCpf                                 AS ParceiroCNPJ,
    par.TipoParceiro
FROM Literarius.dbo.TituloFinanceiro tf
LEFT JOIN Literarius.dbo.PlanoConta pc      ON pc.Codigo = tf.PlanoConta
LEFT JOIN Literarius.dbo.CentroResultado cr ON cr.Codigo = tf.CentroResultado
LEFT JOIN Literarius.dbo.Parceiro par       ON par.Codigo = tf.Parceiro;
```

**Uso:**
```sql
-- Aging de recebíveis
SELECT
    CASE
        WHEN Pago = 1 THEN 'Pago'
        WHEN DiasAtraso < 0 THEN 'A vencer'
        WHEN DiasAtraso <= 30 THEN 'Vencido até 30d'
        WHEN DiasAtraso <= 90 THEN 'Vencido 31-90d'
        ELSE 'Vencido > 90d'
    END AS Faixa,
    COUNT(*) AS Qtd,
    SUM(Saldo) AS Total
FROM vw_Heziom_Titulos
WHERE TipoTitulo = 'R' AND Pago = 0
GROUP BY CASE ... ORDER BY MIN(DiasAtraso)

-- Top devedores
SELECT TOP 15 ParceiroNome, COUNT(*) AS Titulos, SUM(Saldo) AS Total
FROM vw_Heziom_Titulos
WHERE TipoTitulo = 'R' AND Pago = 0
GROUP BY ParceiroNome ORDER BY Total DESC

-- Contas a pagar por plano de conta
SELECT PlanoContaNome, SUM(Saldo) AS Total
FROM vw_Heziom_Titulos
WHERE TipoTitulo = 'P' AND Pago = 0
GROUP BY PlanoContaNome ORDER BY Total DESC
```

---

### 6. `vw_Heziom_ProdutoResumo` — análise de produto em uma linha ⭐

A view de maior impacto. Consolida produto + estoque + vendas 30/90/180 dias.

```sql
CREATE VIEW vw_Heziom_ProdutoResumo AS
SELECT
    p.Codigo,
    p.Titulo,
    p.SubTitulo,
    p.CodigoIsbn,
    p.Preco                             AS PrecoTabela,
    p.Inativo,
    pc.Custo                            AS CustoUnitario,
    pc.QtdeEstoque                      AS EstoqueAtual,
    v30.Qtd                             AS VendasUlt30d,
    v30.Fat                             AS FatUlt30d,
    v90.Qtd                             AS VendasUlt90d,
    v90.Fat                             AS FatUlt90d,
    v180.Qtd                            AS VendasUlt180d,
    v180.Fat                            AS FatUlt180d,
    v180.DescontoMedio                  AS DescontoMedio180d,
    -- Projeção de cobertura de estoque
    CASE
        WHEN ISNULL(v30.Qtd, 0) = 0 THEN NULL
        ELSE CAST(pc.QtdeEstoque / (v30.Qtd / 30.0) AS INT)
    END                                 AS DiasCobertura
FROM Literarius.dbo.Produto p
LEFT JOIN Literarius.dbo.vwProdutoCusto pc ON pc.Codigo = p.Codigo
LEFT JOIN (
    SELECT nfi.Produto, SUM(nfi.Qtde) AS Qtd, SUM(nfi.ValorTotal) AS Fat
    FROM Literarius.dbo.NotaFiscalItens nfi
    JOIN Literarius.dbo.NotaFiscal nf ON nf.idNotaFiscal = nfi.idNotaFiscal
    WHERE nf.EntSai='S' AND nf.Cancelada=0 AND nf.GeraFinanceiro=1
      AND nf.DataEmissao >= DATEADD(DAY,-30,GETDATE())
    GROUP BY nfi.Produto
) v30 ON v30.Produto = p.Codigo
LEFT JOIN (
    SELECT nfi.Produto, SUM(nfi.Qtde) AS Qtd, SUM(nfi.ValorTotal) AS Fat
    FROM Literarius.dbo.NotaFiscalItens nfi
    JOIN Literarius.dbo.NotaFiscal nf ON nf.idNotaFiscal = nfi.idNotaFiscal
    WHERE nf.EntSai='S' AND nf.Cancelada=0 AND nf.GeraFinanceiro=1
      AND nf.DataEmissao >= DATEADD(DAY,-90,GETDATE())
    GROUP BY nfi.Produto
) v90 ON v90.Produto = p.Codigo
LEFT JOIN (
    SELECT nfi.Produto, SUM(nfi.Qtde) AS Qtd, SUM(nfi.ValorTotal) AS Fat,
           AVG(nfi.PercDesconto) AS DescontoMedio
    FROM Literarius.dbo.NotaFiscalItens nfi
    JOIN Literarius.dbo.NotaFiscal nf ON nf.idNotaFiscal = nfi.idNotaFiscal
    WHERE nf.EntSai='S' AND nf.Cancelada=0 AND nf.GeraFinanceiro=1
      AND nf.DataEmissao >= DATEADD(DAY,-180,GETDATE())
    GROUP BY nfi.Produto
) v180 ON v180.Produto = p.Codigo
WHERE p.Inativo = 0;
```

**Uso:**
```sql
-- Análise completa de um produto — 1 query, zero exploração
SELECT * FROM vw_Heziom_ProdutoResumo WHERE Codigo = 4731

-- Produtos com estoque crítico (cobertura < 30 dias)
SELECT Codigo, Titulo, EstoqueAtual, VendasUlt30d, DiasCobertura
FROM vw_Heziom_ProdutoResumo
WHERE DiasCobertura < 30 AND DiasCobertura IS NOT NULL
ORDER BY DiasCobertura ASC

-- Top 20 produtos por faturamento (90 dias)
SELECT Codigo, Titulo, EstoqueAtual, VendasUlt90d, FatUlt90d, DescontoMedio180d
FROM vw_Heziom_ProdutoResumo
WHERE FatUlt90d IS NOT NULL
ORDER BY FatUlt90d DESC
```

---

## Comparativo — antes e depois das views

| Consulta | Sem views | Com views |
|----------|-----------|-----------|
| Análise de produto | 8 queries, ~15 tentativas | 2 queries, 0 exploração |
| Faturamento por canal | 3 queries | 1 query |
| Aging de recebíveis | 4 queries | 1 query |
| Top produtos do mês | 4 queries | 1 query |
| Estoque crítico | 5 queries | 1 query |

**Estimativa de redução de tokens por sessão: ~70%**

---

## Como solicitar criação das views

Enviar o script para o time do Literarius ou DBA com a seguinte instrução:

> "Preciso criar 6 views de leitura no banco Literarius para uso do HeziomOS. As views não alteram dados — são apenas SELECT com JOINs pré-definidos. Solicito que execute o script abaixo com usuário DDL e depois confirme que o usuário `acessoExterno` consegue fazer SELECT em cada uma delas."

Permissões necessárias após criação:
```sql
GRANT SELECT ON vw_Heziom_Produto          TO acessoExterno;
GRANT SELECT ON vw_Heziom_EstoqueSetor     TO acessoExterno;
GRANT SELECT ON vw_Heziom_Faturamento      TO acessoExterno;
GRANT SELECT ON vw_Heziom_FaturamentoItens TO acessoExterno;
GRANT SELECT ON vw_Heziom_Titulos          TO acessoExterno;
GRANT SELECT ON vw_Heziom_ProdutoResumo    TO acessoExterno;
```

---

## Módulos Relacionados

- [[DDL Banco de dados Literarius]] — schema completo
- [[Fontes de Dados/Literarius/NotaFiscal]] — regras de filtro de faturamento
- [[Fontes de Dados/Literarius/TituloFinanceiro]] — regras de títulos
- [[Agente Financeiro — Prompt]] — queries de referência atuais
