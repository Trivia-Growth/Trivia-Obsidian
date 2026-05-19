# API Estoque

Documentação Literarius API
API Literarius conta com o recurso de consultar o saldo dos produtos. Endereço da
requisição padrão: {Endereço Servidor} /literariusAPI.dll/datasnap/rest/
Os Métodos de consulta disponíveis são:
TEstoqueController/Estoque/{empresa}/{setor}/{produto}/{box}
TEstoqueController/EstoqueBox/{empresa}/{box}
TEstoqueController/EstoqueProduto/{empresa}/{produto}
OBS: O parâmetro “box” das requisições somente alimentar caso tenha WMS ativo.
Exemplo de retorno:
{Endereço Servidor} /literariusAPI.dll/datasnap/rest/TEstoqueController/Estoque/1/1/980/{box}
{
"sucess": true,
"message": "",
"data": [
{
"empresa": 1,
"setor": 1,
"box": "",
"produto": 980,
"saldo": 10689
}
]
}
{Endereço Servidor} /literariusAPI.dll/datasnap/rest/TEstoqueController/EstoqueProduto/1/980
{
"sucess": true,
"message": "",
"data": [
{
"box": "D1R02M23P02",
"saldo": 2414
},
{

"box": "TEMP00100000000",
"saldo": 8275
},
{
"box": "D4R01M05P05",
"saldo": 288
},
{
"box": "TEMP09900000000",
"saldo": 23
}
]
}
OBS: Esta requisição somente usar caso tenha WMS ativo.
{EndereçoServidor}/literariusAPI.dll/datasnap/rest/TEstoqueController/EstoqueBox/1/TEMP099
00000000
{
"sucess": true,
"message": "",
"data": [
{
"titulo": "Zac Power Test Drive 02 - O Resgate Radical De Zac",
"codigoBarras": "9788576767251",
"saldo": 68
}
]
}