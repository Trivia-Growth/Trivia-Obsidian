**Documentação Literarius API**

API Literarius possui os recursos de Inserir, Consultar Pedido de Venda, Consultar Status e modificar o Status de um Pedido de Venda, Consultar Parceiro, Inserir Parceiro, Consultar Tipo do Cliente, Consultar Empresa.

Endereço da requisição padrão: {URL:Porta}/literariusAPI.dll/datasnap/rest/ .

A Autenticação do Literarius API é básica com USUÁRIO e SENHA fornecida pela Literarius.

Todas as requisições ao servidor devem conter no HEADER da requisição a chave denominado “USER\_LITERARIUS”, que deve ser alimentada com o usuário (String) que será gravado no Literarius como responsável pela inserção ou atualização dos dados.  

**Os métodos para utilizar os recursos da API Literarius são:**

Método a ser utilizado: **GET**  
Consultar um Pedido de Venda específico: TPedidoVendaController/PedidoVenda/{ID Pedido de Venda}. Caso não seja informado o ID do pedido de venda a consulta retornara todos os Pedido de Venda.

  
Método a ser utilizado: **GET**  
Consultar o Status de um Pedido de Venda: TPedidoVendaController/PedidoVendaStatus/{Código Empresa}/{Código Status}  

Método a ser utilizado: **GET**  
Mudar Status de um Pedido de Venda: TPedidoVendaController/PedidoVendaStatus/{Código Empresa}/{Numero}/{Status}

  
Método a ser utilizado: **GET**  
Consultar de Parceiro: TParceiroController/Parceiro/{ID Parceiro}. Caso o ID do parceiro não seja informado, a consulta retornara todos os parceiros.

  
Método a ser utilizado: **GET**  
Consulta Tipo de Cliente: TParceiroController/TipoCliente/{ID Tipo Cliente}. Caso o ID do tipo de cliente não seja informado, a consulta retornara todos os tipos de cliente.

Método a ser utilizado: **GET**  
Consulta de Empresa: TParceiroController/Empresa/{ID Empresa}. Caso o ID da empresa não seja informado, a consulta retornara todas as empresas.



Abaixo as propriedades a serem alimentadas no PayLoad da requisição.

**PEDIDO VENDA**

**PROPRIEDADE**

**TIPO**

**DESCRIÇÂO**

idPedidoVenda

Inteiro

Código de controle interno

empresa

Inteiro

Código da empresa cadastrada no Literarius

numero

Inteiro

Quando inserido um número válido, o sistema vai tentar encontrar o  
pedido de venda, Para um novo pedido de venda inserir 0

tipoPedido

Inteiro

1: Venda  
2: Consignação  
3: Orçamento  
4: Doação  
5: Diversos

cliente

Objeto Parceiro

Pertence ao Objeto Parceiro

dataPedido

Data

DD/MM/AAAA

vendedor

Inteiro

Necessário informar um vendedor, OBS: Vendedor cadastrado no Literarius

canalVenda

Inteiro

Necessário informar um Canal de Vendas, OBS: Canal de Vendas cadastrado no Literarius

operacaoFiscal

Inteiro

Cadastrado no Literarius

pedidoCliente

String(50)

Código de identificação do pedido no cliente

status

Inteiro

1: Digitando...  
2: Aguardando Aprovação  
3: Aguardando Conferência  
4: Aguardando Faturamento  
5: Nota Fiscal Gerada  
6: Pedido Faturado  
7: Pedido Cancelado  
8: Aguardando Separação  
9: Separação em Andamento  
10: Pedido Enviado  
OBS: Necessário Informar um Status para o Pedido de Venda

enderecoEntrega

Inteiro

Código do endereço que será utilizado na entrega EX: 1, 2 ou 3

transportadora

Inteiro

Código do Parceiro Transportadora cadastrado no Literarius

transportadoraNome

String

totalProduto

Money

Não permite nulo

desconto

Money

Não permite nulo

outrasDespesas

Money

Não permite nulo

valorFrete

Money

Não permite nulo

totalImpostos

Money

Não permite nulo

totalPedido

Money

Não permite nulo

formaPagto

Inteiro

Código da Forma de Pagamento cadastrado no Literarius

fretePorConta

Inteiro

0 - Contratado remetente  
1 - Contratado Destinatário  
2 - Contratado Terceiros  
3 - Próprio Remetente  
4 - Próprio Destinatário  
9 - Sem Ocorrência

observacao

String

setor

Inteiro

Código do setor Cadastrado no Literarius

pesoBruto

Money

Não permite nulo

pesoLiquido

Money

Não permite nulo

items

Lista Objeto Itens

Pertence a Lista Objeto Itens, OBS: Necessário informar algum Item para o Pedido Venda

venctos

Lista Objeto Vencimentos

Pertence a Lista objeto Vencimentos

**LISTA OBJETO ITENS**

idPedidoVendaItens

Inteiro

Código de Controle Interno

item

Inteiro

Número de Sequência dos Itens

produto

Inteiro

Código do produto cadastrado no Literarius, Necessário informar um ou mais produtos

descricao

String(150)

unidadeMedida

String(6)

ean

String(30)

isbn

String(30)

qtdePedido

Double

Não permite nulo, necessário informar a quantidade do Produto

qtdeFaturado

Double

Não permite nulo

qtdeCancelado

Double

Não permite nulo

valorUnitario

Currency

Não permite nulo, necessário informar um valor unitário

percDesconto

Currency

Não permite nulo, necessário informar um percentual de desconto

valorDesconto

Currency

Não permite nulo

valorUnitarioLiquido

Currency

Não permite nulo, necessário informar um valor unitário Liquido

valorTotal

Currency

Não permite nulo, necessário Informar um Valor Total

pesoBruto

Currency

Não permite nulo

pesoLiquido

Currency

Não permite nulo

**LISTA OBJETO VENCIMENTO**

idPedidoVendaVencimento

Inteiro

Código de Controle Interno

item

Inteiro

Número de Sequência dos Vencimentos

prazo

Inteiro

dataVencto

Data

DD/MM/AAAA

valor

Currency

Não permite nulo

formaPagto

Inteiro

Código da Forma de pagamento Cadastrado no Literarius

alterado

Booelan

Quando os valores são modificados

**OBJETO PARCEIRO**

codigo

Inteiro

Código identificação do Parceiro, caso o código seja 0, será utilizado  
CPF/CNPJ para buscar o parceiro, caso não encontre, será cadastrado um novo

nome

String(200)

Necessário informar o nome do Cliente

fantasia

String(100)

isCliente

Boolean

Indica se o parceiro é um Cliente

isFornecedor

Boolean

Indica se o parceiro é um Fornecedor

isTransportadora

Boolean

Indica se o parceiro é uma Transportadora

isEditora

Boolean

Indica se o parceiro é uma Editora

isAutor

Boolean

Indica se o parceiro é um Autor

contato

String(30)

fisJur

String(1)

Identificação do parceiro Físico ou Jurídico

cnpjCpf

String(14)

Necessário informar o CPF/CNPJ do Cliente

inscEstRg

String(20)

Inscrição Estadual

inscMun

String(20)

inscrição Municipal

perfilTributario

Inteiro

1 - Contribuinte  
2 - Isento  
9 - Não Contribuinte

sexo

String(1)

dataAniversario

Data

DD/MM/AAAA

dataCadastro

Data

DD/MM/AAAA

observacao

String

enderecos

Lista Objeto Endereço

Pertence a Lista Objeto Endereço

tipoCliente

Objeto Tipo Cliente

Pertence ao Objeto Tipo Cliente

**TIPO CLIENTE**

codigo

Inteiro

Código do tipo do cliente cadastrado no Literarius

descricao

String

**LISTA OBJETO ENDEREÇO**

tipoEndereco

Inteiro

1 - Principal  
2 - Entrega  
3 - Cobrança  
OBS: Necessário informar o tipo de endereço

descricao

String(20)

cep

String(8)

endereco

String(100)

numero

String(10)

complemento

String(50)

bairro

String(80)

codPais

Inteiro

pais

String(60)

codEstado

Inteiro

estado

String(2)

codCidade

Inteiro

cidade

String(60)

email

String(250)

fone1

String(15)

fone2

String(154

fax

String(15)

contato

String(100)

cnpjCpfEndereco

String(14)

inscEstRgEndereco

String(20)

**Mudar Status do Pedido de Venda:**

Método a ser utilizado: **POST**  
URL: {URL Basica} + TPedidoVendaController/PedidoVenda/ /{Código Empresa}/{Numero}/{Status}