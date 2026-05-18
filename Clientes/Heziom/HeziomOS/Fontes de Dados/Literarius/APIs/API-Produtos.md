# API Produtos

PROPRIEDADE TIPO DESCRIÇÂO
OBJETO PRODUTO
Código do Produto,
Codigo Integer
Cadastrado no Literarius
Titulo String(100)
SubTitulo String(100)
CodigoOriginal String(20)
ProdutoLivro String(1)
Código de identificação
TipoProduto Integer do Tipo do produto,
Cadastrado no Literarius
IsCompra Boolean
IsVenda Boolean
IsConsignacao Boolean
IsEstoque Boolean
Origem Integer
UnidadeMedida String(6)
DataCadastro DateTime
NCM String(15)
EstoqueMinimo Numeric
EstoqueMaximo Numeric
Altura Numeric
Largura Numeric
Profundidade Numeric
Inativo Boolean
NumeroPagina Integer
CodigoBarras String(30)
CodigoIsbn String(30)
CodigoIssn String(30)
Preco Money
Desconto Money
UsuarioAlt String(20)
DataAlt DateTime
Cest String(10)
Cbnef String(10)
Código de identificação
GrupoProduto Integer do Grupo Produto, Cadastrado
no Literarius
Editora Integer
Código de Identificação do
Selo Integer
Selo, Cadastrado no Literarius
Código de Identificação do
Genero Integer
Genero, Cadastrado no Literarius
Código de Identificação do
Idioma Integer
Idioma, Cadastrado no Literarius
CaracteristicaFiscal String(1)

Encadernacao String(30)
Edicao String(30)
EdicaoAno String(10)
Tiragem Integer
Sinopse String
Observacao String
TipoPreco String(1)
Situacao String(3)
Caminho aonde imagem está
CaminhoImagem String(250) localizada
Url String(200)
OBJETO PRODUTO PREÇO
Código do Produto, Cadastrado
Produto Integer no Literarius
Item Integer
FaixaInicial Integer
FaixaFinal integer
DataVigencia DateTime
Preco Money
DescontoMaximo Money
TipoCliente Integer
OBJETO PRODUTO AUTOR
Código Produto, Cadastrado
Produto Integer no Literarius
Item Integer
Código do Parceiro
Autor Integer Autor, Cadastrado no Literarius
Código do Tipo
Participação, Cadastrado no
TipoParticipacao Integer Literarius
OBJETO PRODUTO CAMPO EXTRA
Código do Produto, Cadastrado
Produto Integer no Literarius
Item Integer
Código do Campo Extra,
CampoExtra Integer Cadastrado no Literarius
ValorCampo String(100)

OBJETO PRODUTO PARCEIRO
Código do Produto, Cadastrado
Produto Integer no Literarius
Código do Parceiro, Cadastrado
Parceiro Integer no Literarius
CodigoParceiro String(50)