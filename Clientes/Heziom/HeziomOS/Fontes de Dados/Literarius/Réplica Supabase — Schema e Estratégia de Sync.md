---
tags: [literarius, supabase, replica, sync, schema]
status: especificação
criado: 2026-05-18
---

# Réplica Literarius → Supabase — Schema e Estratégia

> O HeziomOS nunca lê o Literarius diretamente em tempo de execução.  
> O Raspberry Pi sync agent copia as tabelas necessárias para o Supabase.  
> O dashboard, as Edge Functions e os agentes de IA leem **apenas o Supabase**.

---

## Conceito

```
Literarius SQL Server          Supabase PostgreSQL
(fonte de verdade)    ──────►  (réplica de leitura)
192.168.18.10:1433             HeziomOS DB
       │                              │
  lido pelo Pi               lido por tudo mais
  (read-only)                (dashboard, agentes,
                              alertas, Edge Fn)
```

Benefícios:
- **Zero impacto no Literarius** — leitura única por ciclo de sync, sem polling contínuo
- **Dashboard rápido** — queries no Supabase (PostgreSQL gerenciado, índices próprios)
- **Sem rate limiting** — não depende da API HTTP do Literarius
- **Histórico** — o Supabase guarda o que o Literarius pode não guardar (ex: snapshots de estoque por data)

---

## Tabelas a replicar

### Grupo A — Sync frequente (30 min)

#### `lit_estoque` — Posição de estoque
```sql
CREATE TABLE lit_estoque (
  produto_id      INTEGER     NOT NULL,
  empresa         INTEGER     NOT NULL DEFAULT 1,
  setor           INTEGER     NOT NULL DEFAULT 1,
  saldo           INTEGER     NOT NULL DEFAULT 0,
  synced_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (produto_id, empresa, setor)
);
```
Fonte: `TEstoqueController` / SQL: `SELECT produto, empresa, setor, saldo FROM Estoque`

---

#### `lit_pedido_venda` — Pedidos de venda
```sql
CREATE TABLE lit_pedido_venda (
  id                  INTEGER     PRIMARY KEY,  -- idPedidoVenda
  empresa             INTEGER,
  numero              INTEGER,
  tipo_pedido         INTEGER,     -- 1=Venda, 2=Consignação, 3=Orçamento...
  cliente_id          INTEGER,
  data_pedido         DATE,
  status              INTEGER,     -- 1..10 (ver enum)
  canal_venda         INTEGER,
  site_id_pedido      TEXT,        -- chave de conciliação com Tray
  site_status_pedido  TEXT,
  transportadora_nome TEXT,
  total_produto       NUMERIC(12,2),
  desconto            NUMERIC(12,2),
  valor_frete         NUMERIC(12,2),
  total_pedido        NUMERIC(12,2),
  forma_pagto         INTEGER,
  observacao          TEXT,
  data_alt            TIMESTAMPTZ,
  synced_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON lit_pedido_venda (data_pedido);
CREATE INDEX ON lit_pedido_venda (site_id_pedido);
CREATE INDEX ON lit_pedido_venda (status);
```

---

#### `lit_pedido_venda_item` — Itens dos pedidos
```sql
CREATE TABLE lit_pedido_venda_item (
  id                  INTEGER PRIMARY KEY,  -- idPedidoVendaItens
  pedido_id           INTEGER REFERENCES lit_pedido_venda(id),
  item                INTEGER,
  produto_id          INTEGER,
  descricao           TEXT,
  ean                 TEXT,
  qtde_pedido         INTEGER,
  qtde_faturado       INTEGER,
  valor_unitario      NUMERIC(10,2),
  perc_desconto       NUMERIC(5,2),
  valor_total         NUMERIC(12,2),
  synced_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON lit_pedido_venda_item (pedido_id);
CREATE INDEX ON lit_pedido_venda_item (produto_id);
```

---

### Grupo B — Sync frequente (60 min)

#### `lit_nota_fiscal` — Notas fiscais de saída
```sql
CREATE TABLE lit_nota_fiscal (
  id                  INTEGER PRIMARY KEY,  -- idNotaFiscal
  empresa             INTEGER,
  numero              INTEGER,
  serie               INTEGER,
  modelo              INTEGER,     -- 55 = NF-e
  entrada_saida       CHAR(1),     -- 'S' ou 'E'
  data_emissao        TIMESTAMPTZ,
  data_saida          TIMESTAMPTZ,
  natureza_operacao   TEXT,
  cliente_id          INTEGER,
  valor_total         NUMERIC(12,2),
  synced_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON lit_nota_fiscal (data_emissao);
CREATE INDEX ON lit_nota_fiscal (numero);
```

---

### Grupo C — Sync 2× por dia (6h e 18h)

#### `lit_titulo_financeiro` — Contas a pagar e a receber
```sql
CREATE TABLE lit_titulo_financeiro (
  id                  INTEGER PRIMARY KEY,
  empresa             INTEGER,
  tipo_titulo         CHAR(1),     -- 'R' = Receber, 'P' = Pagar
  parceiro_id         INTEGER,
  numero_titulo       TEXT,
  data_emissao        DATE,
  data_vencimento     DATE,
  valor               NUMERIC(12,2),
  valor_pago          NUMERIC(12,2) DEFAULT 0,
  pago                BOOLEAN DEFAULT FALSE,
  plano_conta_id      INTEGER,
  historico           TEXT,
  synced_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON lit_titulo_financeiro (data_vencimento);
CREATE INDEX ON lit_titulo_financeiro (tipo_titulo, pago);
CREATE INDEX ON lit_titulo_financeiro (parceiro_id);
```

---

#### `lit_titulo_financeiro_baixa` — Liquidações (pagamentos efetivados)
```sql
CREATE TABLE lit_titulo_financeiro_baixa (
  id                  INTEGER PRIMARY KEY,
  titulo_id           INTEGER REFERENCES lit_titulo_financeiro(id),
  data_baixa          DATE,
  valor_baixa         NUMERIC(12,2),
  conta_bancaria_id   INTEGER,
  historico           TEXT,
  synced_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON lit_titulo_financeiro_baixa (data_baixa);
CREATE INDEX ON lit_titulo_financeiro_baixa (titulo_id);
```

---

#### `lit_conta_bancaria` — Saldos bancários
```sql
CREATE TABLE lit_conta_bancaria (
  id                  INTEGER PRIMARY KEY,
  empresa             INTEGER,
  descricao           TEXT,
  banco               TEXT,
  agencia             TEXT,
  conta               TEXT,
  saldo_atual         NUMERIC(14,2),
  synced_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

#### `lit_conta_bancaria_lancamento` — Extrato interno (lançamentos manuais)
```sql
CREATE TABLE lit_conta_bancaria_lancamento (
  id                  INTEGER PRIMARY KEY,
  conta_id            INTEGER REFERENCES lit_conta_bancaria(id),
  data_lancamento     DATE,
  historico           TEXT,
  valor               NUMERIC(12,2),  -- positivo = crédito, negativo = débito
  tipo                CHAR(1),
  synced_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON lit_conta_bancaria_lancamento (data_lancamento);
CREATE INDEX ON lit_conta_bancaria_lancamento (conta_id);
```

---

### Grupo D — Sync 1× por dia (5h30 — antes do briefing das 7h)

#### `lit_estoque_snapshot` — Histórico diário de estoque (não existe no Literarius)
```sql
-- Tabela própria do HeziomOS — não réplica, calculada pelo sync agent
CREATE TABLE lit_estoque_snapshot (
  snapshot_date   DATE        NOT NULL,
  produto_id      INTEGER     NOT NULL,
  saldo           INTEGER     NOT NULL,
  valor_estoque   NUMERIC(12,2),
  PRIMARY KEY (snapshot_date, produto_id)
);
```
> O Literarius só tem o saldo atual — não guarda histórico. O Pi grava um snapshot diário no Supabase, permitindo gráficos de evolução de estoque ao longo do tempo.

---

### Grupo E — Sync 1× por semana (domingo 2h)

#### `lit_produto` — Catálogo de produtos
```sql
CREATE TABLE lit_produto (
  id                  INTEGER PRIMARY KEY,
  titulo              TEXT,
  sub_titulo          TEXT,
  isbn                TEXT,
  ean                 TEXT,
  tipo_produto        TEXT,
  editora_id          INTEGER,
  editora_nome        TEXT,
  preco               NUMERIC(10,2),
  situacao            TEXT,
  inativo             BOOLEAN DEFAULT FALSE,
  is_consignacao      BOOLEAN DEFAULT FALSE,
  num_paginas         INTEGER,
  altura              NUMERIC(5,1),
  largura             NUMERIC(5,1),
  profundidade        NUMERIC(5,1),
  peso_bruto          NUMERIC(6,3),
  idioma              TEXT,
  edicao_ano          TEXT,
  bisac               TEXT,
  url_imagem          TEXT,
  sinopse             TEXT,
  synced_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

#### `lit_produto_autor` — Autores por produto
```sql
CREATE TABLE lit_produto_autor (
  produto_id          INTEGER REFERENCES lit_produto(id),
  autor_id            INTEGER,
  nome_autor          TEXT,
  tipo_participacao   INTEGER,
  PRIMARY KEY (produto_id, autor_id)
);
```

---

#### `lit_parceiro` — Clientes / fornecedores / transportadoras
```sql
CREATE TABLE lit_parceiro (
  id                  INTEGER PRIMARY KEY,
  nome                TEXT,
  fantasia            TEXT,
  cnpj_cpf            TEXT,
  fis_jur             CHAR(1),    -- 'J' = jurídica, 'F' = física
  is_cliente          BOOLEAN,
  is_fornecedor       BOOLEAN,
  is_transportador    BOOLEAN,
  tipo_cliente_id     INTEGER,    -- 1=Igrejas, 2=Livrarias, 3=Distribuidoras...
  cidade              TEXT,
  estado              CHAR(2),
  status              INTEGER,
  synced_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON lit_parceiro (cnpj_cpf);
CREATE INDEX ON lit_parceiro (tipo_cliente_id);
```

---

#### `lit_plano_conta` — Plano de contas (DRE)
```sql
CREATE TABLE lit_plano_conta (
  id                  INTEGER PRIMARY KEY,
  codigo              TEXT,
  descricao           TEXT,
  tipo_categoria      TEXT,       -- 'R'=Receita, 'D'=Despesa, 'A'=Ativo (bug no Literarius — todos estão 'A')
  nivel               INTEGER,
  pai_id              INTEGER,
  synced_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
```
> ⚠️ `tipo_categoria = 'A'` em todos os 115 registros — bug no Literarius que bloqueia o DRE automático. Replicar assim mesmo e corrigir no HeziomOS com tabela `plano_conta_override`.

---

## Tabela de controle de sync

```sql
-- Registra cada execução do sync agent
CREATE TABLE sync_log (
  id            BIGSERIAL PRIMARY KEY,
  tabela        TEXT        NOT NULL,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at   TIMESTAMPTZ,
  rows_upserted INTEGER     DEFAULT 0,
  rows_deleted  INTEGER     DEFAULT 0,
  error         TEXT,                   -- NULL = sucesso
  duration_ms   INTEGER
);
CREATE INDEX ON sync_log (tabela, started_at DESC);
```

O sync-watchdog da Edge Function consulta essa tabela para verificar se o Pi está ativo.

---

## Estratégia de upsert (idempotência)

Todos os inserts usam `onConflict` — rodar o sync 2× seguidas não duplica nada:

```ts
// Exemplo: sync de estoque
await supabase
  .from('lit_estoque')
  .upsert(rows, { onConflict: 'produto_id,empresa,setor' })
```

Para tabelas grandes (TituloFinanceiro, PedidoVenda): sync incremental por `data_alt` ou `id > ultimo_id_synced`. Não rebuscar tudo a cada ciclo.

---

## O que NÃO replicar

| Tabela | Motivo |
|---|---|
| Tabelas de configuração interna do Literarius | Sem relevância para o HeziomOS |
| Dados de outros usuários do sistema | Princípio de menor privilégio |
| Senhas, tokens, configurações de integração | Fora do escopo do `acessoExterno` |
| Tabelas de auditoria interna do Literarius | Volume muito alto sem utilidade |

---

## Referências

- [[ADR-001 — Sync Agent no Raspberry Pi]] — onde o sync roda
- [[ADR-002 — Segurança do Sync Agent]] — como proteger o Pi
- [[Fontes de Dados/Literarius/Banco de Dados/TituloFinanceiro]]
- [[HeziomOS — Arquitetura]]
- [[Projeto/Stories/STORY-009 — Setup Raspberry Pi Sync Agent]]

---

*Especificado em 2026-05-18 — Lucas Azevedo (Trivia)*
