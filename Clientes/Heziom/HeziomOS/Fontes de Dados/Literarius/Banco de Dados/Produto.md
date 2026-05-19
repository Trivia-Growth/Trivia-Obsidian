---
tags: [literarius, schema, banco-de-dados, estoque]
status: mapeado
criado: 2026-05-18
fonte: pymssql direto — 192.168.18.10:1433
---

# Literarius DB — Módulo Estoque — Catálogo de Produtos

> Schema mapeado diretamente do banco SQL Server em produção (2026-05-18).
> Colunas, tipos reais e amostras de dados incluídos.

---

## `Produto`

**Catálogo de produtos** · **5,073 linhas** · 69 colunas

> 5.073 produtos. 69 colunas — catálogo editorial completo: ISBN, EAN, título, subtítulo, editora, autores, páginas, dimensões, peso, sinopse, BISAC, situação, preço vigente.

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `Codigo` | int | INTEGER | **não** |  |
| `Titulo` | varchar(150) | TEXT | sim |  |
| `SubTitulo` | varchar(100) | TEXT | sim |  |
| `CodigoOriginal` | varchar(20) | TEXT | sim |  |
| `ProdutoLivro` | char(1) | TEXT | sim |  |
| `TipoProduto` | int | INTEGER | sim | enum |
| `IsCompra` | bit | BOOLEAN | sim |  |
| `IsVenda` | bit | BOOLEAN | sim |  |
| `IsConsignacao` | bit | BOOLEAN | sim |  |
| `IsEstoque` | bit | BOOLEAN | sim |  |
| `Origem` | int | INTEGER | sim |  |
| `UnidadeMedida` | varchar(6) | TEXT | sim |  |
| `DataCadastro` | datetime | TIMESTAMPTZ | sim | data |
| `Ncm` | varchar(15) | TEXT | sim |  |
| `CEST` | varchar(10) | TEXT | sim |  |
| `CBenef` | varchar(10) | TEXT | sim |  |
| `GrupoProduto` | int | INTEGER | sim |  |
| `EstoqueMinimo` | numeric | NUMERIC | sim |  |
| `EstoqueMaximo` | numeric | NUMERIC | sim |  |
| `Altura` | numeric | NUMERIC | sim |  |
| `Largura` | numeric | NUMERIC | sim |  |
| `Profundidade` | numeric | NUMERIC | sim |  |
| `PesoBruto` | numeric | NUMERIC | sim |  |
| `PesoLiquido` | numeric | NUMERIC | sim |  |
| `NumeroPagina` | int | INTEGER | sim |  |
| `Inativo` | bit | BOOLEAN | sim |  |
| `Editora` | int | INTEGER | sim |  |
| `Selo` | int | INTEGER | sim |  |
| `Genero` | int | INTEGER | sim |  |
| `Idioma` | int | INTEGER | sim |  |
| `Situacao` | varchar(3) | TEXT | sim | enum |
| `CaracteristicaFiscal` | char(1) | TEXT | sim |  |
| `TipoPreco` | char(1) | TEXT | sim | valor monetário |
| `Desconto` | money | NUMERIC | sim |  |
| `CodigoBarras` | varchar(30) | TEXT | sim |  |
| `CodigoIsbn` | varchar(30) | TEXT | sim |  |
| `CodigoIssn` | varchar(30) | TEXT | sim |  |
| `Encadernacao` | varchar(30) | TEXT | sim |  |
| `Edicao` | varchar(30) | TEXT | sim |  |
| `EdicaoAno` | varchar(10) | TEXT | sim |  |
| `Tiragem` | int | INTEGER | sim |  |
| `Sinopse` | text(2147483647) | TEXT | sim |  |
| `Observacao` | text(2147483647) | TEXT | sim |  |
| `Imagem1` | varchar(250) | TEXT | sim |  |
| `Imagem2` | varchar(250) | TEXT | sim |  |
| `Imagem3` | varchar(250) | TEXT | sim |  |
| `Imagem4` | varchar(250) | TEXT | sim |  |
| `Imagem5` | varchar(250) | TEXT | sim |  |
| `Imagem6` | varchar(250) | TEXT | sim |  |
| `Imagem7` | varchar(250) | TEXT | sim |  |
| `LancamentoAte` | datetime | TIMESTAMPTZ | sim |  |
| `Lancamento` | int | INTEGER | **não** |  |
| `Localizacao` | varchar(30) | TEXT | sim |  |
| `SiteID` | varchar(50) | TEXT | sim | FK provável |
| `idRoyalties` | bigint | INTEGER | sim |  |
| `updateRoyalties` | datetime | TIMESTAMPTZ | sim | data |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |
| `Url` | varchar(250) | TEXT | sim |  |
| `Bisac` | varchar(10) | TEXT | sim |  |
| `UsuarioCadastro` | varchar(20) | TEXT | sim |  |
| `CodigoBarrasCaixa` | varchar(30) | TEXT | sim |  |
| `QtdeEmbalagem` | numeric | NUMERIC | sim |  |
| `UnidadeMedidaCompra` | varchar(6) | TEXT | sim |  |
| `EstoqueMinimoPicking` | numeric | NUMERIC | sim |  |
| `AtualizaPickingMinimo` | bit | BOOLEAN | sim |  |
| `DataLancamento` | datetime | TIMESTAMPTZ | sim | data |
| `QtdePalete` | numeric | NUMERIC | sim |  |
| `Preco` | money | NUMERIC | sim | valor monetário |

**Campos-chave:**

- FKs prováveis: `SiteID`
- Datas: `DataCadastro`, `updateRoyalties`, `DataAlt`, `DataLancamento`
- Valores: `TipoPreco`, `Preco`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

```json
[
  {
    "Codigo": 1,
    "Titulo": "Josué",
    "SubTitulo": "Deus cumpre suas promessas",
    "CodigoOriginal": "",
    "ProdutoLivro": "L",
    "TipoProduto": 1,
    "IsCompra": true,
    "IsVenda": true,
    "IsConsignacao": true,
    "IsEstoque": true,
    "Origem": 0,
    "UnidadeMedida": "UN",
    "DataCadastro": "2025-08-25T14:01:13.350000",
    "Ncm": "49019900",
    "CEST": "",
    "CBenef": "SP070130",
    "GrupoProduto": null,
    "EstoqueMinimo": 0.0,
    "EstoqueMaximo": 0.0,
    "Altura": 23.0,
    "Largura": 16.0,
    "Profundidade": 3.0,
    "PesoBruto": 0.45,
    "PesoLiquido": 0.45,
    "NumeroPagina": 240,
    "Inativo": false,
    "Editora": 1,
    "Selo": 1,
    "Genero": null,
    "Idioma": 1,
    "Situacao": "DIS",
    "CaracteristicaFiscal": "C",
    "TipoPreco": "D",
    "Desconto": 0.0,
    "CodigoBarras": "9786552650504",
    "CodigoIsbn": "9786552650504",
    "CodigoIssn": "",
    "Encadernacao": "",
    "Edicao": "1",
    "EdicaoAno": "2025",
    "Tiragem": 0,
    "Sinopse": "O livro de Josué é um chamado vibrante à coragem, à obediência e à confiança no Deus que cumpre infalivelmente cada uma de suas promessas. Desde a travessia do Jordão até a distribuição da Terra Prometida, a narrativa nos mostra que a fidelidade de Deus permanece inabalável, mesmo diante da fragilidade humana. A liderança de Josué, a santidade exigida do povo e a presença constante do Senhor revelam verdades espirituais que ecoam até os nossos dias.    Nesta obra, o pastor e teólogo Arival Dias Casimiro apresenta um comentário exegético, teológico e pastoral profundamente enraizado na teologia da aliança. Josué é retratado como tipo de Cristo, aquele que conduz o povo de Deus rumo à herança prometida, antecipando o descanso eterno que será plenamente consumado em Jesus. O leitor encontrará aqui não apenas explicações rigorosas do texto bíblico, mas aplicações práticas para a vida cristã que fortalecem a fé, encorajam a liderança e sustentam a esperança.    Josué nos ensina que a vitória não está nas estratégias humanas, mas na presença de Deus entre o seu povo. E é pela Palavra, pela fidelidade e pela graça que caminhamos com segurança rumo à promessa final.    A Série Comentário Bíblico Heziom reúne comentários bíblicos profundos e acessíveis, rigorosos exegeticamente e aplicáveis à vida. Cada volume busca auxiliar na devoção e no estudo pessoais, contribuindo para debates que desafiam e edificam, além de auxiliar no ensino e na pregação. Você encontrará em cada volume:    - Esboço completo e detalhado de cada livro bíblico;  - Reflexões devocionais;  - Perguntas para debate em grupos pequenos;  - Espaço para anotações quando o material for utilizado em escolas bíblicas;  - Apontamentos e esboço homilético de cada perícope importante.    Você tem agora uma ferramenta instrutiva, interativa e prática, sem deixar de estar ancorada nos mais confiáveis princípios de interpretação das Escrituras, para se aprofundar e crescer na Palavra de Deus!",
    "Observacao": "",
    "Imagem1": "\\\\192.168.18.10\\Literarius\\Imagens\\9786552650504.jpg",
    "Imagem2": "",
    "Imagem3": "",
    "Imagem4": "",
    "Imagem5": "",
    "Imagem6": "",
    "Imagem7": "",
    "LancamentoAte": null,
    "Lancamento": 0,
    "Localizacao": "",
    "SiteID": "698795",
    "idRoyalties": null,
    "updateRoyalties": null,
    "UsuarioAlt": "Metadados",
    "DataAlt": "2026-03-05T11:02:18.240000",
    "Url": "https://fl-storage.bookinfometadados.com.br/uploads/book/first_cover/thumb_9786552650504.jpg",
    "Bisac": "REL006060",
    "UsuarioCadastro": null,
    "CodigoBarrasCaixa": "",
    "QtdeEmbalagem": 0.0,
    "UnidadeMedidaCompra": "",
    "EstoqueMinimoPicking": 0.0,
    "AtualizaPickingMinimo": false,
    "DataLancamento": "2025-08-22T00:00:00",
    "QtdePalete": 0.0,
    "Preco": 77.9
  },
  {
    "Codigo": 8,
    "Titulo": "Mães da aliança 2025",
    "SubTitulo": "Orando pelos filhos com base nas promessas de Deus",
    "CodigoOriginal": "",
    "ProdutoLivro": "L",
    "TipoProduto": 1,
    "IsCompra": true,
    "IsVenda": true,
    "IsConsignacao": true,
    "IsEstoque": true,
    "Origem": 0,
    "UnidadeMedida": "UN",
    "DataCadastro": "2025-08-28T13:26:12.120000",
    "Ncm": "49019900",
    "CEST": "",
    "CBenef": "SP070130",
    "GrupoProduto": null,
    "EstoqueMinimo": 0.0,
    "EstoqueMaximo": 0.0,
    "Altura": 23.0,
    "Largura": 16.0,
    "Profundidade": 2.5,
    "PesoBruto": 0.59,
    "PesoLiquido": 0.59,
    "NumeroPagina": 400,
    "Inativo": false,
    "Editora": 1,
    "Selo": 1,
    "Genero": null,
    "Idioma": 1,
    "Situacao": "DIS",
    "CaracteristicaFiscal": "C",
    "TipoPreco": "D",
    "Desconto": 0.0,
    "CodigoBarras": "9786552650009",
    "CodigoIsbn": "9786552650009",
    "CodigoIssn": "",
    "Encadernacao": "",
    "Edicao": "2",
    "EdicaoAno": "2024",
    "Tiragem": 0,
    "Sinopse": "Nos dias de hoje, nossas famílias enfrentam um mundo repleto de desafios espirituais e influências negativas. É por isso que as mães precisam unir forças como mães da aliança, levantando um exército de oração pelas novas gerações. As promessas de Deus são nossa garantia de que ele ouvirá nossas súplicas e nos dará o livramento.  Este devocional foi criado especialmente para você, mãe crente e guerreira espiritual. A cada dia, você encontrará nas páginas de Mães da aliança um lembrete da fidelidade de Deus, que estende suas bênçãos não apenas a você, mas a seus filhos e às gerações futuras. Seu papel é semear a Palavra e orar pela transformação e santificação de seus filhos, confiando que o Senhor cumprirá suas promessas.  Mães da aliança já alcançou mais de 30 mil mães, transformando vidas e fortalecendo famílias. Testemunhos de fé e vitória continuam a surgir, revelando o poder da oração persistente e a fidelidade de Deus em cumprir suas promessas. Este devocional é mais que um recurso   é uma experiência de fé que você compartilha com milhares de outras mães. Descubra como a oração pode transformar o destino de gerações",
    "Observacao": "",
    "Imagem1": "\\\\192.168.18.10\\Literarius\\Imagens\\9786552650009.jpg",
    "Imagem2": "",
    "Imagem3": "",
    "Imagem4": "",
    "Imagem5": "",
    "Imagem6": "",
    "Imagem7": "",
    "LancamentoAte": null,
    "Lancamento": 0,
    "Localizacao": "",
    "SiteID": null,
    "idRoyalties": null,
    "updateRoyalties": null,
    "UsuarioAlt": "Metadados",
    "DataAlt": "2026-03-05T11:02:55.483000",
    "Url": "https://fl-storage.bookinfometadados.com.br/uploads/book/first_cover/thumb_9786552650009.jpg",
    "Bisac": "REL012080",
    "UsuarioCadastro": null,
    "CodigoBarrasCaixa": "",
    "QtdeEmbalagem": 0.0,
    "UnidadeMedidaCompra": "",
    "EstoqueMinimoPicking": 0.0,
    "AtualizaPickingMinimo": false,
    "DataLancamento": "2024-10-25T00:00:00",
    "QtdePalete": 0.0,
    "Preco": 89.9
  },
  {
    "Codigo": 9,
    "Titulo": "Mães orando, Deus agindo 2025 - Projeto Ana",
    "SubTitulo": "Especial 140 anos SAF",
    "CodigoOriginal": "",
    "ProdutoLivro": "L",
    "TipoProduto": 1,
    "IsCompra": true,
    "IsVenda": true,
    "IsConsignacao": true,
    "IsEstoque": true,
    "Origem": 0,
    "UnidadeMedida": "UN",
    "DataCadastro": "2025-08-28T13:26:12.167000",
    "Ncm": "49019900",
    "CEST": "",
    "CBenef": "SP070130",
    "GrupoProduto": null,
    "EstoqueMinimo": 0.0,
    "EstoqueMaximo": 0.0,
    "Altura": 23.0,
    "Largura": 16.0,
    "Profundidade": 2.5,
    "PesoBruto": 0.59,
    "PesoLiquido": 0.59,
    "NumeroPagina": 400,
    "Inativo": false,
    "Editora": 1,
    "Selo": 1,
    "Genero": null,
    "Idioma": 1,
    "Situacao": "DIS",
    "CaracteristicaFiscal": "C",
    "TipoPreco": "D",
    "Desconto": 0.0,
    "CodigoBarras": "9786552650016",
    "CodigoIsbn": "9786552650016",
    "CodigoIssn": "",
    "Encadernacao": "",
    "Edicao": "2",
    "EdicaoAno": "2024",
    "Tiragem": 0,
    "Sinopse": "Nos dias de hoje, nossas famílias enfrentam um mundo repleto de desafios espirituais e influências negativas. Por isso, precisamos unir forças como mulheres, formando um exército de oração pelas novas gerações. As promessas de Deus são nossa garantia de que ele ouvirá nossas súplicas e nos concederá o livramento.  Este devocional foi criado especialmente para você, mãe crente e guerreira espiritual. A cada dia, você encontrará nas páginas de Mães orando, Deus agindo um lembrete da fidelidade de Deus, que estende suas bênçãos não apenas a você, mas também a seus filhos e às gerações futuras. Seu papel é semear a Palavra, orar pela transformação e santificação de seus filhos e confiar que o Senhor cumprirá suas promessas.  Este projeto de mães de oração já alcançou mais de 30 mil mães, transformando vidas e fortalecendo famílias. Testemunhos de fé e vitória continuam a surgir, revelando o poder da oração persistente e a fidelidade de Deus em cumprir Suas promessas. Este devocional é mais que um recurso   é uma experiência de fé que você compartilha com milhares de outras mães. Descubra como a oração pode transformar o destino de gerações.",
    "Observacao": "",
    "Imagem1": "\\\\192.168.18.10\\Literarius\\Imagens\\9786552650016.jpg",
    "Imagem2": "",
    "Imagem3": "",
    "Imagem4": "",
    "Imagem5": "",
    "Imagem6": "",
    "Imagem7": "",
    "LancamentoAte": null,
    "Lancamento": 0,
    "Localizacao": "",
    "SiteID": "698471",
    "idRoyalties": null,
    "updateRoyalties": null,
    "UsuarioAlt": "Metadados",
    "DataAlt": "2026-03-05T11:02:54.083000",
    "Url": "https://fl-storage.bookinfometadados.com.br/uploads/book/first_cover/thumb_9786552650016.jpg",
    "Bisac": "REL012080",
    "UsuarioCadastro": null,
    "CodigoBarrasCaixa": "",
    "QtdeEmbalagem": 0.0,
    "UnidadeMedidaCompra": "",
    "EstoqueMinimoPicking": 0.0,
    "AtualizaPickingMinimo": false,
    "DataLancamento": "2024-10-25T00:00:00",
    "QtdePalete": 0.0,
    "Preco": 94.9
  }
]
```

</details>

---

## `ProdutoAutor`

**Autores por produto** · **2,583 linhas** · 6 colunas

> 2.583 vínculos produto-autor. Tipo de participação (autor, organizador, tradutor).

| Coluna | Tipo SQL | Tipo PG | Nulo | Observação |
|---|---|---|---|---|
| `Produto` | int | INTEGER | **não** |  |
| `Item` | int | INTEGER | **não** |  |
| `Autor` | int | INTEGER | **não** |  |
| `TipoParticipacao` | int | INTEGER | **não** | enum |
| `UsuarioAlt` | varchar(20) | TEXT | sim |  |
| `DataAlt` | datetime | TIMESTAMPTZ | sim | data |

**Campos-chave:**

- Datas: `DataAlt`

<details>
<summary>Amostra de dados reais (3 linhas)</summary>

```json
[
  {
    "Produto": 5033,
    "Item": 1,
    "Autor": 15,
    "TipoParticipacao": 1,
    "UsuarioAlt": "rafael",
    "DataAlt": "2026-04-30T15:54:25.017000"
  },
  {
    "Produto": 5032,
    "Item": 1,
    "Autor": 26803,
    "TipoParticipacao": 1,
    "UsuarioAlt": "rafael",
    "DataAlt": "2026-04-30T15:52:49.143000"
  },
  {
    "Produto": 5030,
    "Item": 2,
    "Autor": 28159,
    "TipoParticipacao": 1,
    "UsuarioAlt": "rafael",
    "DataAlt": "2026-04-30T15:44:42.840000"
  }
]
```

</details>

---
