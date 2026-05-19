# Literarius API — Documentação de Referência

> Documentado em 2026-05-18 via chamadas exploratórias. Atualizado 2026-05-19 (duplo-check).  
> Base URL: `http://200.187.66.71:1983/LiterariusAPI.dll/datasnap/rest`

> ⚠️ **Não é 100% read-only!** O endpoint `PUT /TPedidoVendaController/PedidoVenda` permite **criar e atualizar pedidos**. O `GET /PedidoVendaStatus/{emp}/{num}/{status}` **altera status** do pedido em produção. Demais controllers são somente leitura.

### Resumo de Capacidades (atualizado 19/05/2026)

| Controller | Leitura | Escrita | Observação |
|---|---|---|---|
| **TPedidoVendaController** | ✅ GET pedidos | ✅ PUT criar/editar pedido · GET altera status | **Write disponível** |
| **TParceiroController** | ✅ GET clientes/fornecedores | ❌ | Somente leitura |
| **TProdutoController** | ✅ GET por código ou EAN | ❌ | Somente leitura |
| **TEstoqueController** | ✅ GET saldo por setor/produto/box | ❌ | Somente leitura |
| **TNotaFiscalController** | ✅ GET NF completa (112+ cols) | ❌ | Somente leitura |

Ver: [[Mapa Completo de APIs e Capacidades]] — inventário consolidado Literarius + Tray

---

## Autenticação

Todas as requisições exigem:

| Mecanismo | Valor |
|---|---|
| HTTP Basic Auth | `UsuarioAPI:<senha>` |
| Header obrigatório | `USER_LITERARIUS: <usuário>` — gravado no Literarius como responsável pela operação |
| Content-Type | `application/json` |

```bash
curl -u "UsuarioAPI:SENHA" \
  -H "USER_LITERARIUS: UsuarioAPI" \
  -H "Content-Type: application/json" \
  "$BASE_URL/<endpoint>"
```

---

## Envelope de Resposta

Todas as respostas seguem o mesmo envelope:

```json
{
  "sucess": true,
  "message": "",
  "data": [ ... ]
}
```

> ⚠️ Campo `sucess` (sem segundo 's') é o padrão da API — não é typo nosso.

---

## Controllers Disponíveis

| Controller | Prefixo |
|---|---|
| Pedido de Venda | `TPedidoVendaController` |
| Parceiro / Cliente | `TParceiroController` |
| Produto | `TProdutoController` |
| Estoque | `TEstoqueController` |
| Nota Fiscal | `TNotaFiscalController` |

---

## 1. TPedidoVendaController — Pedidos de Venda

### 1.1 Consultar Pedido de Venda

```
GET /TPedidoVendaController/PedidoVenda/{id}
```

- Sem `{id}`: retorna **todos** os pedidos (cuidado em produção — sem paginação nativa).
- Com `{id}`: retorna o pedido específico.

**Exemplo de resposta — `PedidoVenda/1`:**

```json
{
  "idPedidoVenda": 1,
  "empresa": 1,
  "numero": 1,
  "tipoPedido": 1,
  "cliente": { ... },
  "clienteEmail": "",
  "clienteCpf": "",
  "dataPedido": "2025-09-01T00:00:00.000Z",
  "vendedor": 11,
  "canalVenda": 1,
  "operacaoFiscal": 1,
  "pedidoCliente": "36445",
  "status": 6,
  "enderecoEntrega": 2,
  "transportadora": 12,
  "transportadoraNome": "MANDAÊ",
  "totalProduto": 50.6,
  "desconto": 0,
  "outrasDespesas": 0,
  "valorFrete": 18.73,
  "totalImpostos": 0,
  "totalPedido": 69.33,
  "formaPagto": 10,
  "fretePorConta": 1,
  "observacao": "",
  "siteIdPedido": "36445",
  "siteStatusPedido": "faturamento",
  "usuarioAlt": "master",
  "dataAlt": "2025-09-01T09:48:37.550Z",
  "setor": 1,
  "pesoBruto": 0,
  "pesoLiquido": 0,
  "revisao": false,
  "items": {
    "ownsObjects": true,
    "listHelper": [
      {
        "idPedidoVendaItens": 1,
        "item": 1,
        "produto": 1,
        "descricao": "Josué",
        "unidadeMedida": "UN",
        "ean": "9786552650504",
        "isbn": "9786552650504",
        "qtdePedido": 1,
        "qtdeFaturado": 1,
        "qtdeCancelado": 0,
        "qtdeConferencia": 1,
        "qtdeReservado": 1,
        "valorUnitario": 50.6,
        "percDesconto": 0,
        "valorDesconto": 0,
        "valorUnitarioLiquido": 50.6,
        "valorTotal": 50.6,
        "pesoBruto": 0.45,
        "pesoLiquido": 0.45
      }
    ]
  },
  "venctos": {
    "ownsObjects": true,
    "listHelper": [
      {
        "idPedidoVendaVencimento": 0,
        "item": 1,
        "prazo": 20333,
        "dataVencto": "1969-12-31T00:00:00.000Z",
        "valor": 69.33,
        "formaPagto": 10,
        "alterado": false
      }
    ]
  },
  "rastreios": {
    "ownsObjects": true,
    "listHelper": []
  }
}
```

**Enum `tipoPedido`:**

| Valor | Descrição |
|---|---|
| 1 | Venda |
| 2 | Consignação |
| 3 | Orçamento |
| 4 | Doação |
| 5 | Diversos |

**Enum `status`:**

| Valor | Descrição |
|---|---|
| 1 | Digitando... |
| 2 | Aguardando Aprovação |
| 3 | Aguardando Conferência |
| 4 | Aguardando Faturamento |
| 5 | Nota Fiscal Gerada |
| 6 | Pedido Faturado |
| 7 | Pedido Cancelado |
| 8 | Aguardando Separação |
| 9 | Separação em Andamento |
| 10 | Pedido Enviado |

**Enum `fretePorConta`:**

| Valor | Descrição |
|---|---|
| 0 | Contratado Remetente |
| 1 | Contratado Destinatário |
| 2 | Contratado Terceiros |
| 3 | Próprio Remetente |
| 4 | Próprio Destinatário |
| 9 | Sem Ocorrência |

> ⚠️ **Campo extra observado na prática (não documentado no PDF original):**  
> `siteIdPedido`, `siteStatusPedido`, `revisao`, `rastreios`, `qtdeConferencia`, `qtdeReservado`

---

### 1.2 Consultar Status dos Pedidos

```
GET /TPedidoVendaController/PedidoVendaStatus/{empresa}/{status}
```

- Retorna pedidos filtrados por empresa e status.
- Sem parâmetros retornados na chamada de teste (data vazia para filtro inválido).

### 1.3 Alterar Status de um Pedido

```
GET /TPedidoVendaController/PedidoVendaStatus/{empresa}/{numero}/{status}
```

> ⚠️ **PRODUÇÃO** — altera o status real do pedido. Usar com cautela.

### 1.4 Inserir Pedido de Venda

```
PUT /TPedidoVendaController/PedidoVenda
```

Body: objeto `PedidoVenda` completo (ver schema no arquivo `API-Pedidos-Venda-docx.md`).

> `numero: 0` para criar novo pedido. Número válido tenta atualizar pedido existente.

---

## 2. TParceiroController — Parceiros / Clientes

### 2.1 Consultar Parceiro

```
GET /TParceiroController/Parceiro/{id}
```

**Campos retornados (verificados em produção):**

```json
{
  "codigo": 1,
  "nome": "ASSOCIACAO EDITORA PRESBITERIANA DE PINHEIROS",
  "fantasia": "EDITORA HEZIOM",
  "isCliente": true,
  "isFornecedor": false,
  "isTransportador": false,
  "isEditora": true,
  "isAutor": false,
  "isFuncionario": true,
  "fisJur": "J",
  "cnpjCpf": "40804477000144",
  "inscEstRg": "130597948110",
  "inscMun": "68445954",
  "perfilTributario": 1,
  "cep": "05511020",
  "endereco": "RUA MIRAGAIA",
  "numero": "121",
  "bairro": "BUTANTÃ",
  "codPais": 1058,
  "pais": "BRASIL",
  "codEstado": 35,
  "estado": "SP",
  "codCidade": 3550308,
  "cidade": "SAO PAULO",
  "status": 1,
  "enderecos": { "ownsObjects": true, "listHelper": [ ... ] },
  "tipoCliente": { "ownsObjects": true, "listHelper": [] },
  "clienteVendedor": 0,
  "clienteTransportadora": 0,
  "clienteFormaPagto": 0,
  "clientePrazoPagto": "",
  "clienteDesconto": 0
}
```

> ⚠️ `enderecos` e `tipoCliente` são objetos com wrapper `ownsObjects + listHelper` — padrão da API para listas.

**Enum `perfilTributario`:**

| Valor | Descrição |
|---|---|
| 1 | Contribuinte |
| 2 | Isento |
| 9 | Não Contribuinte |

### 2.2 Consultar Tipos de Cliente (verificados em produção)

```
GET /TParceiroController/TipoCliente/{id}
```

**Tipos cadastrados na Heziom:**

| Código | Descrição |
|---|---|
| 1 | IGREJAS |
| 2 | LIVRARIAS |
| 3 | DISTRIBUIDORAS |
| 4 | ONGS |
| 5 | PF |
| 6 | Colaborador |
| 7 | Empresas |

### 2.3 Consultar Empresa

```
GET /TParceiroController/Empresa/{id}
```

**Campos específicos de Empresa (além dos campos de Parceiro):**

```json
{
  "empresaRegimeTributario": 1,
  "empresaWebSite": ""
}
```

**Empresa cadastrada:**

| Campo | Valor |
|---|---|
| codigo | 1 |
| nome | ASSOCIACAO EDITORA PRESBITERIANA DE PINHEIROS |
| cnpjCpf | 40804477000144 |
| estado | SP |
| cidade | SAO PAULO |

---

## 3. TProdutoController — Produtos

### 3.1 Consultar Produto

```
GET /TProdutoController/Produto/{codigo}
```

**Campos retornados (verificados em produção — Produto 1 "Josué"):**

```json
{
  "codigo": 1,
  "titulo": "Josué",
  "subTitulo": "Deus cumpre suas promessas",
  "codigoOriginal": "",
  "produtoLivro": "plLivro",
  "tipoProduto": 1,
  "tipoProdutoDescricao": "LIVRO",
  "isCompra": true,
  "isVenda": true,
  "isConsignacao": true,
  "isEstoque": true,
  "origem": 0,
  "unidadeMedida": "UN",
  "dataCadastro": "25/08/2025 14:01:13",
  "nCM": "49019900",
  "cest": "",
  "cBenef": "SP070130",
  "grupoProduto": 0,
  "estoqueMinimo": 0,
  "estoqueMaximo": 0,
  "altura": 23,
  "largura": 16,
  "profundidade": 3,
  "pesoBruto": 0,
  "pesoLiquido": 0,
  "numeroPagina": 240,
  "inativo": false,
  "editora": 1,
  "editoraDescricao": "EDITORA HEZIOM",
  "selo": 1,
  "genero": 0,
  "idioma": 1,
  "idiomaDescricao": "PORTUGUÊS",
  "situacao": "slDisponivel",
  "imagem": "\\\\192.168.18.10\\Literarius\\Imagens\\9786552650504.jpg",
  "caracteristicaFiscal": "cfComercializado",
  "codigoBarras": "9786552650504",
  "codigoIsbn": "9786552650504",
  "codigoIssn": "",
  "encadernacao": "",
  "edicao": "1",
  "edicaoAno": "2025",
  "bisac": "REL006060",
  "tiragem": 0,
  "sinopse": "...",
  "tipoPreco": "tpData",
  "preco": 77.9,
  "desconto": 0,
  "lancamento": false,
  "dataLancamento": "2025-08-22T00:00:00.000Z",
  "url": "https://fl-storage.bookinfometadados.com.br/...",
  "codigoBarrasCaixa": "",
  "qtdePalete": 0,
  "qtdeEmbalagem": 0,
  "imagens": { "ownsObjects": true, "listHelper": [ { "caminhoImagem": "..." } ] },
  "precos": { "ownsObjects": true, "listHelper": [ ... ] },
  "autores": { "ownsObjects": true, "listHelper": [ { "autor": 15, "nomeAutor": "Arival Dias Casimiro", "tipoParticipacao": 1 } ] },
  "camposExtra": { "ownsObjects": true, "listHelper": [] },
  "produtoParceiro": { "ownsObjects": true, "listHelper": [] }
}
```

> ⚠️ **Campos extras observados (não no PDF):** `tipoProdutoDescricao`, `editoraDescricao`, `idiomaDescricao`, `bisac`, `lancamento`, `dataLancamento`, `codigoBarrasCaixa`, `qtdePalete`, `qtdeEmbalagem`, `imagens` (lista), `precos` (lista com vigência), `autores` (lista).

**Endpoints auxiliares:**

```
GET /TProdutoController/ProdutoEAN/{ean}
GET /TProdutoController/TipoProduto/{codigo}
GET /TProdutoController/GrupoProduto/{codigo}
GET /TProdutoController/GeneroProduto/{codigo}
GET /TProdutoController/IdiomaProduto/{codigo}
GET /TProdutoController/AutorParticipacaoProduto/{codigo}
GET /TProdutoController/CamposExtra/{codigo}
```

---

## 4. TEstoqueController — Estoque

### 4.1 Consultar Estoque por Empresa/Setor/Produto

```
GET /TEstoqueController/Estoque/{empresa}/{setor}/{produto}/{box}
```

- `{box}`: preencher apenas se WMS ativo; caso contrário, omitir ou deixar vazio.

**Exemplo de resposta — empresa=1, setor=1, produto=1:**

```json
{
  "empresa": 0,
  "setor": 0,
  "box": "",
  "produto": 0,
  "saldo": 1228
}
```

> ⚠️ Campos `empresa`, `setor` e `produto` retornaram `0` mesmo com parâmetros preenchidos — aparentemente a API retorna apenas o saldo sem ecoar os filtros.

### 4.2 Consultar Estoque por Produto (todos os boxes)

```
GET /TEstoqueController/EstoqueProduto/{empresa}/{produto}
```

Retorna lista de boxes com saldo individual. Requer WMS ativo.

### 4.3 Consultar Estoque por Box

```
GET /TEstoqueController/EstoqueBox/{empresa}/{box}
```

Retorna lista de produtos no box com título, código de barras e saldo. Requer WMS ativo.

---

## 5. TNotaFiscalController — Notas Fiscais

### 5.1 Consultar Nota Fiscal

```
GET /TNotaFiscalController/NotaFiscal/{id}
```

**Campos principais observados (NF 1):**

```json
{
  "idNotaFiscal": 1,
  "empresa": 1,
  "numero": 1,
  "serie": { "serie": 0, "descricao": "", "modelo": 0 },
  "modelo": 55,
  "entradaSaida": "S",
  "tipoNota": 1,
  "dataEmissao": "2025-08-25T14:17:06.000Z",
  "dataSaida": "2025-08-25T14:17:06.000Z",
  "operacaoFiscal": 1,
  "naturezaOperacao": "VENDA DE MERCADORIA",
  "vendedor": 0,
  "canalVenda": 0,
  "pessoa": { ... }
}
```

**Enum `entradaSaida`:** `"S"` = Saída, `"E"` = Entrada  
**Enum `modelo`:** `55` = NF-e eletrônica

---

## Observações de Integração

### Padrão de lista interna

Todos os arrays retornam com wrapper:

```json
{
  "ownsObjects": true,
  "listHelper": [ ... ]
}
```

Ao consumir no código, acessar sempre `.listHelper` para iterar.

### Datas

- Datas `0` ou `"1899-12-30T00:00:00.000Z"` indicam campo não preenchido (null lógico do Delphi/DataSnap).
- `"1969-12-31T00:00:00.000Z"` também ocorre em vencimentos — tratar como nulo.

### Sem paginação nativa

Endpoints sem `{id}` retornam **todos** os registros. Para consultas de volume (pedidos, parceiros), sempre informar o ID ou filtros.

### Campos extras não documentados

A API retorna campos adicionais além dos documentados nos PDFs originais (ex: `siteIdPedido`, `siteStatusPedido`, `bisac`, `tipoProdutoDescricao`). Foram incorporados nesta documentação conforme observado em produção.

---

## Referências

- Documentação original PDFs: pasta `APIs/`
- Data da última verificação em produção: **2026-05-18**
- Ambiente: produção (`200.187.66.71:1983`)
