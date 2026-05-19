# API Nota Fiscal

NOTA FISCAL
PROPRIEDADE TIPO DESCRIÇÂO
idNotaFiscal Inteiro Código de controle interno
empresa Inteiro Código da empresa cadastrada no Literarius
Quando inserido um número válido, o sistema vai tentar encontrar o
numero Inteiro
Nota Fiscal, para uma nova Nota Fiscal inserir 0
1: Venda
2: Remessa de Consignação
3: Acerto de Consignação
4: Devolução de Consignação
5: Devolução Simbólica
6: Devolução Venda
7: Devolução Compra
tipoNota Inteiro 8: Doação
9: Transferência
10: Compra
11: Diversos
12: Recebimento em Consignação
13: Venda do PDV
14: Remessa de Feira
15: Retorno de Feira
serie Inteiro Série da Nota Fiscal
modelo Inteiro Modelo da Nota Fiscal
entradaSaida Char(1) Informa se a Nota Fiscal foi de Entrada ou Saída
dataEmissao Data DD/MM/AAAA
dataSaida Data DD/MM/AAAA

vendedor Inteiro Cadastrado no Literarius
canalVenda Inteiro Cadastrado no Literarius
operacaoFiscal Inteiro Cadastrado no Literarius
naturezaOperacao String (50) Cadastrado no Literarius
pessoa Objeto Parceiro Pertence ao Objeto Parceiro
nome String(200)
fisJur Char(1) Pessoa Física ou Jurídica
cnpjCpf String(14)
inscEstRg String(15) Inscrição Estadual
cep String(8)
endereco String(250)
enderecoNumero String(10)
complemento String(60)
bairro String(100)
cidade String(150)
cidadeIBGE Inteiro Código da Cidade no IBGE
estado String(2)
estadoIBGE Inteiro Código do Estado no IBGE
pais String(150)
paisBACEN String
email String(250)
fone String(15)
totalProdutos Money
desconto Money
enderecoEntrega Inteiro Código do endereço que será utilizado na entrega EX: 1, 2 ou 3
totalProduto Money
desconto Money

outrasDespesas Money
valorFrete Money
totalImpostos Money
totalNota Money
icmsBase Money
icmsValor Money
icmsStBase Money
icmsStValor Money
ipiValor Money
pisValor Money
iiValor Money
cofinsValor Money
transportadora Inteiro
transpPlaca String(8)
transpUF String(2)
0 - Contratado remetente
1 - Contratado Destinatário
2 - Contratado Terceiros
fretePorConta Inteiro
3 - Próprio Remetente
4 - Próprio Destinatário
9 - Sem Ocorrência
qtdeFrete Inteiro Volumes da Nota Fiscal
especie String(50) Exemplo: Caixa
marca String(50)
numeroFrete String(10)
pesoBruto Numeric(12,3)
pesoLiquido Numeric(12,3)

observacao Text Observação da Nota Fiscal
observacaoFisco Text
observacaoAutomatica Text
setor Inteiro Cadastrado no Literarius
formaPagto Inteiro
moveEstoque Boolean
geraFinanceiro Boolean
atualizaCusto Boolean
pedidoCliente String(60)
ufEmbarque String(2)
localEmbarque String(60)
localDespacho String(60)
nfeFinalidade Inteiro
nfeIdentificadorDestino inteiro
nfeLote Inteiro
nfeCodigo Inteiro
nfeStatus Inteiro
nfeOcorrencia Inteiro
nfeMotivoOcorrencia String(250)
nfeChave String(50)
nfeRecibo String(20)
nfeDataHoraRecebido String(20)
nfeProtocolo String(50)
nfeProtocoloCancelamento String(50)
nfeDataHoraCancelamento String(20)
nfeJustificativaCancelamento String(200)

usuarioAlt String(20)
dataAlt Data DD/MM/AAAA
vendedor Inteiro
enderecoEntrega Inteiro
canalVenda Inteiro
idPedidoVenda Inteiro
idPedidovendaItens Inteiro
situacao Inteiro Cadastrado no Literarius
portador Inteiro Cadastrado no Literarius
consignação Inteiro Cadastrado no Literarius
gerarNotaRelacao Boolean
foiGerada Boolean
siteIdPedido String(20)
SiteStatusPedido String(20)
transmiteNfe Boolean
exposicaoFeira Inteiro
setorDestino Inteiro
nfeIndicadorPresenca Inteiro
nfeIndicadorImtermediario Inteiro
nfeCnpjIntermediador String(14)
nfeIdentificacaoIntermediador String(60)
items Objeto NotaFiscalItens Pertence ao Objeto NotaFiscalItens
Objeto
venctos NotaFiscalVencimento Pertence ao Objeto NotaFiscalVencimento
volumes Objeto NotaFiscalVolume Pertence ao Objeto NotaFiscalVolume
dis Objeto NotaFiscalDI Pertence ao Objeto NotaFiscalDI
diAdicoes Objeto NotaFiscalDIAdicoes Pertence ao Objeto NotaFiscalDIAdicoes

LISTA OBJETO ITENS
idNotaFiscalItens Inteiro Código de Controle Interno
item Inteiro Número de Sequência dos Itens
produto Inteiro Código do produto cadastrado no Literarius
descricao String(150)
unidadeMedida String(6)
qtde Numeric(12,4)
qtdeGravada Numeric(12,4)
valorUnitario Money
percDesconto Money
valorDesconto Money
valorUnitarioLiquido Money
valorTotal Money
cfop String(5)
isEstoque Boolean
origem inteiro
valorFrete Money
valorSeguro Money
valorOutrasDespesas Money
relcaoNotaEmitidaRecebida String(1)
relacaoNotaEmpresa Inteiro
relacaoNotaParceiro Inteiro
relacaoNotaNumero Inteiro
relacaoNotaSerie Inteiro
relacaoNotaIdItem Inteiro
icmsCst String(3)
icmsBase Money

icmsReducao Money
icmsAcrescimo Money
icmsAliq Money
icmsValor Money
icmsIncidencia Inteiro
icmsModalidade Inteiro
ipiCst String(3)
ipiBase Money
ipiReducao Money
ipiAcrescimo Money
ipiAliq Money
ipiValor Money
ipiIncidencia Money
ipiEnquadramento String(5)
pisCst String(3)
pisBase Money
pisReducao Money
pisAcrescimo Money
pisAliq Money
pisValor Money
pisIncidencia Inteiro
cofinsCst String(3)
cofinsBase Money
cofinsReducao Money
cofinsAcrescimo Money
cofinsAliq Money
cofinsValor Money

cofinsIncidencia Inteiro
icmsStBase Money
icmsStReducao Money
icmsStAcrescimo Money
icmsStAliq Money
icmsStValor Money
icmsStIncidencia Inteiro
icmsStModalidade Inteiro
difalBaseDestino Money
difalAliqInternaDestino Money
difalAliqInterestadual Money
difalPercentualProvisorio Money
difalValorOrigem Money
difalValorDestino Money
fcpBase Money
fcpAliq Money
fcpValor Money
iiValor Money
iibase Money
iiDespAdu Money
iiIof Money
nfexPed String(15)
nfenIetmPed Inteiro
ibptTribFedNac Money
ibptTribFedImp Money
ibptTribEst Money
ibptTribMun Money

ibptChave String(20)
ibptVersao String(10)
ibptFonte String(20)
impostoManual Boolean
planoConta Inteiro
centroResultados Inteiro
idPedidoVenda Inteiro
idPedidoVendaItens Inteiro
usuarioAlt String(20)
dataAlt Data DD/MM/AAAA
LISTA OBJETO NOTA FISCAL SERIE
serie Inteiro
descricao String(20)
modelo String(5) Modelo Fiscal
LISTA OBJETO NOTA FISCAL VENCIMENTO
item Inteiro Número de Sequência dos Vencimentos
prazo Inteiro
vencimento Data
valor Money
valorTroco Money
formaPagto Inteiro Código da Forma de pagamento Cadastrado no Literarius
alterado Booelan Quando os valores são modificados
condicaoPagto Inteiro
usuraioAlt String(20) Usuario de Cadastro ou Alteração
dataAlt Data Data do Cadastro ou Alteração DD/MM/AAAA
LISTA OBJETO NOTA FISCAL VOLUME
peso Numeric(12,3)

docResponsavel String(15)
transportadora Inteiro
dataHoraColeta Data
tanspPlaca String(8)
responsavelColeta String(100)
item Inteiro
etiqueta String(50)
observacoes String(250)
LISTA OBJETO NOTA FISCAL DE IMPORTAÇÂO
numero String(15)
item Inteiro
dataDesembaraco Data
localDesembaraco String(60)
dataDI Data
intermedio Inteiro
ufDesembaraco Data
valorAFRMM Money
viaTransporte Inteiro
idNotaFiscalDI Inteiro
codigoExportador String(60)
LISTA OBJETO NOTA FISCAL DE IMPORTAÇÂO
ADIÇOES
sequencia Inteiro
valorDesconto Money
numero Inteiro
item Inteiro
idNotaFiscalDIAdicoes Inteiro

fabricante String(60)
OBJETO PARCEIRO
codigo Inteiro Código identificação do Parceiro, caso o código seja 0, será utilizado
nome String(200)
fantasia String(100)
isCliente Boolean
isFornecedor Boolean
isTransportadora Boolean
isEditora Boolean
isAutor Boolean
contato String(30)
fisJur String(1) Identificação do parceiro Físico ou Jurídico
cnpjCpf String(14)
inscEstRg String(20) Inscrição Estadual
inscMun String(20) inscrição Municipal
1 - Contribuinte
perfilTributario Inteiro
2 - Isento
9 - Não Contribuinte
sexo String(1)
dataAniversario Data DD/MM/AAAA
dataCadastro Data DD/MM/AAAA
observacao String
enderecos Lista Objeto Endereço Pertence a Lista Objeto Endereço
tipoCliente Objeto Tipo Cliente Pertence ao Objeto Tipo Cliente
TIPO CLIENTE
codigo Inteiro Código do tipo do cliente cadastrado no Literarius

descricao String
LISTA OBJETO ENDEREÇO
1 - Principal
tipoEndereco Inteiro 2 - Entrega
3 - Cobrança
descricao String(20)
cep String(8)
endereco String(100)
numero String(10)
complemento String(50)
bairro String(80)
codPais Inteiro
pais String(60)
codEstado Inteiro
estado String(2)
codCidade Inteiro
cidade String(60)
email String(250)
fone1 String(15)
fone2 String(154
fax String(15)
contato String(100)
cnpjCpfEndereco String(14)
inscEstRgEndereco String(20)