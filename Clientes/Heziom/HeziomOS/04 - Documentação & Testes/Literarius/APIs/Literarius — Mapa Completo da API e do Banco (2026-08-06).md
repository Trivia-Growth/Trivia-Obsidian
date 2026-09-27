---
title: "Mapa do ERP Literarius: API REST, SQL Server, faturamento e superfície de escrita"
data_medicao: 2026-08-06
janela_a: "06/08/2026 13:00 a 17:00 BRT"
janela_b: "06/08/2026 19:20 a 19:55 BRT"
ambiente: "Literarius em produção (Heziom)"
metodo: "somente leitura: GET na API, SELECT no SQL Server"
status: definitivo
tags:
  - literarius
  - erp
  - api
  - sql-server
  - integracao
  - heziom
  - financeiro
  - faturamento
  - seguranca
---

# Mapa do ERP Literarius

Documento de referência da API REST do Literarius, do banco SQL Server por trás dela e do que
dá ou não dá para escrever no ERP a partir de fora.

## Como ler este documento

Tudo aqui é medição própria contra o ERP em produção, em 06/08/2026. Nada foi copiado de
documentação do fornecedor. Onde não houve medição, está escrito que não houve.

Toda chamada foi somente leitura. Na API só GET, no SQL Server só SELECT.
O endpoint `/PedidoVendaStatus/{empresa}/{numero}/{status}` **não foi chamado em nenhuma forma**,
porque esse GET altera status de pedido em produção.

**Duas janelas de medição, e todo número carrega a sua:**

| Janela | Horário (BRT) | O que foi medido nela |
|---|---|---|
| **A** | 06/08/2026, 13:00 a 17:00 | Catálogo de rotas, comportamento da API, varredura inicial do banco |
| **B** | 06/08/2026, 19:20 a 19:55 | Volumes recarimbados, faturamento, devolução, custo, páginas envenenadas, de-para bancário |

Quando os dois números existem e divergem, os dois aparecem, com a hora de cada um.

**Convenção de horário.** Todo horário citado é BRT. O ERP grava BRT nas suas colunas de data:
na mesma consulta da janela B, `GETDATE()` deu 19:22:04 e `SYSUTCDATETIME()` deu 22:22:04.
A API carimba um `Z` no fim de valores que são BRT, e esse `Z` é falso (risco 8).
Ressalva de método: as datas da janela A foram lidas com a versão antiga do utilitário de SQL,
que adiantava o horário em 3 horas e podia virar o dia. Um caso foi pego e corrigido
(`MIN(AjusteManualCusto.DataAjuste)`, que a janela A registrou como 02/09/2025 e é
01/09/2025 23:59:59). **Não varri o documento inteiro atrás de outras datas contaminadas da
janela A.** Datas da janela B estão conferidas contra o relógio do servidor.

**Nenhuma credencial, senha, token ou chave aparece neste documento, em nenhuma forma.**

---

## INCIDENTES ABERTOS

Três coisas que não são "achado de documentação". São incidentes, com dono e com ação.

### Incidente 1. O endpoint de usuário devolve as senhas do ERP em texto legível

**O que é.** `GET /TUsuarioController/Usuario` responde HTTP 200 e traz o cadastro de usuário
com a senha em texto legível. A chamada funciona com a credencial **somente leitura** que a
Heziom usa para integrar, e trafega sobre **HTTP sem TLS** (a base da API é `http://` em IP
público, numa porta alta; endereço mascarado nesta nota, ver a seção 2).

**Número medido.** **19 usuários do ERP.** No banco, a coluna `Usuario.Senha` tem comprimentos
entre 14 e 20 caracteres e apenas **3 tamanhos distintos** entre os 19 registros, o que descarta
hash (MD5 ou SHA teriam comprimento fixo e único). `db_datareader` não tem granularidade de
coluna: quem tem permissão de ler pedido lê a senha de todo mundo.

**Procedência, dita com todas as letras.** A medição do endpoint é de um agente da rodada da
janela A. **Não foi reproduzida depois**, por decisão deliberada de não coletar senha. Nesta
rodada de fechamento o endpoint **não foi chamado**, e nenhum valor de senha foi lido, salvo ou
transcrito em lugar nenhum. O que está confirmado por medição independente é o formato da coluna
no banco (comprimentos e cardinalidade), não o conteúdo.

**De quem é a ação.**
1. **Fornecedor (Literarius):** tirar a senha do payload do endpoint, passar a armazenar hash e
   fechar a API atrás de TLS. É defeito de produto, não de configuração da Heziom.
2. **Heziom, interna e imediata:** rotacionar a senha dos 19 usuários do ERP, partindo do
   princípio de que todas estão comprometidas. Qualquer pessoa com a credencial de leitura da
   integração, hoje, consegue se logar como qualquer usuário do ERP, inclusive os que aprovam
   pedido e dão baixa.

**Enquanto isso não acontecer, a credencial de leitura da integração é, na prática, uma
credencial de escrita no ERP, por caminho indireto.**

### Incidente 2. Seis linhas de rateio corrompidas tornam 10% do contas a pagar inacessível pela API

**O que é.** Seis linhas de `TituloFinanceiroRateio` guardam `Percentual =
-922337203685477,5808`, que é o valor mínimo do tipo `money` do SQL Server. O servidor da API
consegue gravar esse número e **não consegue lê-lo de volta**: ao montar a página, ele falha ao
converter e **aborta a resposta inteira**, não só o registro. A página volta com HTTP 200,
`sucess:false` e **sem a chave `data`**. Um coletor que faça `resp.get("data", [])` termina o
ciclo "com sucesso" e sem os títulos.

**Número medido (janela B, varreduras completas).** Com `?size=200`, **2 das 20 páginas morrem e
400 dos 3.973 títulos a pagar somem, 10,1%**, R$ 773.196,08 de valor colateral. Com o `size`
padrão de 50, a perda é de 200 títulos e R$ 297.070,99. Com `size=500`, sobe para 1.000 títulos
e R$ 2.051.734,99. Os 6 títulos envenenados valem **R$ 0,00**: o estrago é todo colateral. Eles
também não saem pela rota por id (6 de 6 com `sucess:false`), ou seja **não existem para nenhum
consumidor de API**. O lado a receber está limpo: 0 rateios negativos em 59.627 linhas.

**De quem é a ação.**
1. **Fornecedor:** o caminho de escrita e o de leitura não concordam sobre o que é um número
   válido, e uma linha ruim derruba a página inteira. Isso é bug de serialização.
2. **Ou correção no dado, do lado Heziom:** corrigir as 6 linhas de `TituloFinanceiroRateio`
   (que valem zero e pertencem a títulos de valor zero) e colocar um `CHECK` em `Percentual`.
   É a via mais rápida, e depende de alguém com escrita no banco, que a Heziom não tem hoje.

**Enquanto nenhuma das duas acontecer, qualquer integração com `/Pagar/` perde dados em
silêncio, e perde mais quanto maior a página.** Detalhe completo em 4.5.

### Incidente 3. O de-para de conta bancária tem 2 de 17 formas de pagamento configuradas

**O que é.** A tabela `ContaBancariaFormaPagto` diz em qual conta bancária cai o dinheiro de
cada forma de pagamento. Ela tem **2 linhas** para **17 formas de pagamento** e **12 contas**.
Onde falta a linha e a baixa é automática, a baixa entra **sem conta bancária** e some de
`vwMovimentoContaBancaria`, que é o único lugar de onde se tira saldo por conta.

**Número medido (janela B).** **16.885 baixas sem conta bancária, R$ 2.605.932,74, 40,5% das
baixas e 21,9% de todo o dinheiro já baixado no sistema.** Não é passado resolvido: a proporção
piora mês a mês, de 12,1% em janeiro para 63,9% nos seis primeiros dias de agosto, entre
R$ 163 mil e R$ 275 mil por mês. **Quatro linhas de configuração cobrem 96% do buraco**
(R$ 2.501.944,20 de R$ 2.605.932,74).

**A prova de que é o de-para.** O PIX SITE é o experimento que o próprio banco já rodou: até
18/09/2025, 100% das baixas de PIX SITE entravam sem conta; de 19/09/2025 em diante, **0 de
11.784** entram sem conta. Uma linha de configuração virou 100% de perda em 0%.

**De quem é a ação.** **Heziom, e é digitação no ERP, não projeto.** Criar as 4 linhas de
de-para para CARTÃO DE CRÉDITO (3), PIX (12), CARTÃO DE CRÉDITO - SITE (14) e BOLETO SITE (9),
e preencher juros, multa e dias de protesto em `CobrancaConfiguracao`, que hoje estão zerados
com R$ 468.948,96 vencidos em boleto. **É a ação de maior retorno imediato dos três incidentes,
e a única que não depende do fornecedor nem de escrita no banco.**

Ressalva honesta: para qual conta cada forma deve apontar é decisão de negócio, não medição
minha. E não verifiquei se a tela do ERP permite criar essas linhas; medi só o banco. Detalhe
completo em 4.8.

---

## 1. Resumo executivo

1. **A API entrega o cadastro e o documento, e esconde o dinheiro que se move.** Parceiro
   (52.267), Produto (5.238), Pedido de Venda (29.387), Nota Fiscal (42.888) e Título Financeiro
   (59.204 a receber e 3.973 a pagar) têm o total DECLARADO pela API (`page.totalRecords`) batendo
   com o `COUNT(*)` do SQL no mesmo minuto, cinco das seis entidades ao registro (janela B).
   ⚠️ **Declarar não é entregar:** no contas a pagar a API não consegue devolver até 1.000 dos
   3.973 títulos, dependendo do tamanho da página (incidente 2). E o array `baixas[]` do título vem
   **vazio em 100%** de tudo que foi testado, e é ali que mora a data de pagamento.
   **Pela API dá para saber se pagou, nunca quando.**

2. **E o contas a pagar sai incompleto, sem avisar.** Seis linhas de rateio corrompidas matam
   páginas inteiras: com `?size=200` a API perde 400 dos 3.973 títulos (10,1%) e devolve HTTP
   200. Ver incidente 2 e a seção 4.5.

3. **O faturamento existe, é mensurável e nunca tinha sido medido: R$ 7.451.618,11 em 41.955
   notas de venda**, de set/2025 a 06/08/2026 (janela B). Média de **R$ 670.177,33/mês** nos 11
   meses fechados, com **queda de 24,6%** entre o primeiro semestre da série e o segundo. A
   receita mora em `NotaFiscal.TotalNota` e só ali. Quem somar `TotalProduto` erra 40% para
   cima, porque o desconto concedido é de R$ 3.491.499,70.

4. **Um quinto do faturamento vem de um canal que o resto do documento não enxergava.** A Venda
   do PDV (loja física, NFC-e) é **R$ 1.550.747,34, 20,8% da receita**, e **0 de 11.491 notas
   passam por pedido**. Qualquer plano de integração desenhado em cima de `PedidoVenda` cobre no
   máximo três quartos da receita: **26,65% do faturado, R$ 1.986.085,62, nunca teve pedido.**

5. **Só o SQL entrega caixa, custo, faturamento por canal, histórico e classificação contábil.**
   As 41.693 baixas (R$ 11.915.844,14), os R$ 14,2 mi de lançamento bancário, os R$ 3,85 mi de
   compra, os R$ 325.394,75 de direito autoral, as 226.700 linhas de movimento de estoque, as
   247.611 linhas de histórico de pedido, o de-para dos 15 tipos de nota e as tabelas
   `PlanoConta`, `CentroResultado`, `CanalVenda` e `CondicaoPagto` não têm rota nenhuma.

6. **A regra de custo do ERP é reaproveitável, ao contrário do que dizia o rascunho.**
   `fRetornaCustoProduto` é função de tabela e a permissão que vale para ela é SELECT, que está
   concedida. Executada ao vivo em 19:22 BRT, ela devolve custo. **Ninguém precisa reimplementar
   CMV.** O estoque valorizado deu **R$ 1.638.202,37 em 133.885 unidades** (19:26 BRT), com
   567 produtos com saldo físico e custo zero. A view oficial `vwProdutoCusto` continua
   quebrada: zero em 100% das 5.238 linhas.

7. **A devolução não vira dinheiro.** 221 notas de devolução, R$ 2.234.188,08, com
   `GeraFinanceiro=0` em 221 de 221 e **zero títulos gerados**. Não há título negativo, não há
   estorno, e a tabela `CreditoParceiro`, que existe desde 2019 para guardar exatamente isso,
   **nunca recebeu uma linha**. O saldo a receber está inflado por devolução e não é possível
   dimensionar quanto, porque a nota de devolução não aponta para a venda que ela reverte.

8. **A única porta de escrita comprovada não é a API nem o SQL: é o bloco `Integra*` da tabela
   `ConfiguracaoGeral`.** O ERP puxa pedido de uma URL do fornecedor a cada 30 s e já trouxe
   27.633 dos 29.387 pedidos (94%), cerca de 2.400/mês em 2026. O `PUT PedidoVenda` **não foi
   executado** e portanto não é fato. O SQL é somente leitura por GRANT medido objeto a objeto:
   SELECT em 190/190 tabelas, INSERT, UPDATE e DELETE em 0/190.

9. **O ativo do HeziomOS que mais valeria empurrar é justamente o que não tem porta:** 66.753
   pessoas que o ERP não conhece, 6.284 aniversários, 5.253 telefones e 36.446 opt-ins de
   WhatsApp sobre parceiros que já existem lá dentro. E a segmentação tem onde morar: a coluna
   `Parceiro.ClienteTipoCliente` aponta para um lookup de 7 linhas e está **99,52% vazia**
   (253 parceiros classificados em 52.275). O modelo existe, está vazio e é inalcançável de fora.

10. **Três incidentes abertos**, no bloco acima: senha em texto no endpoint de usuário, 10% do
    contas a pagar inacessível, e o de-para bancário com 2 de 17 formas. O terceiro é o de maior
    retorno imediato e é resolvido com digitação.

---

## 2. Acesso e credenciais

| Item | Valor medido |
|---|---|
| Base URL da API | `http://<IP-PUBLICO>:<PORTA>/LiterariusAPI.dll/datasnap/rest` — 🔒 **endereço mascarado**, ver abaixo |
| Transporte | **HTTP puro, sem TLS.** A credencial trafega em Basic auth sobre a rede aberta |
| Servidor | DataSnap REST sobre ISAPI no IIS. `GET /LiterariusAPI.dll` responde 200 com "DataSnap Server" |
| Autenticação | HTTP Basic **mais** o header `USER_LITERARIUS` com o mesmo usuário. Sem auth a mesma URL devolve 401 |
| Banco | SQL Server 2022 Express, instância `VMAPP01\SQL2022`, base `Literarius`, host na LAN |
| Login do banco | `acessoExterno`, criado em 29/01/2026. Medido objeto a objeto: CONNECT mais `db_datareader`, nada além disso |

### 🔒 Por que o endereço da API está mascarado nesta nota

Enquanto o **incidente 1** estiver aberto, o endereço real não é escrito aqui. A razão é a soma,
não cada peça isolada: esta nota reúne o endpoint que devolve as senhas dos 19 usuários, o fato de
o transporte ser HTTP sem TLS, e os logins reais dos operadores citados ao longo do texto. Com o
endereço junto, o documento vira um roteiro completo a que só falta a senha — e o próprio texto
demonstra que a credencial somente-leitura basta para extrair todas as 19.

**Onde achar o endereço real, para quem precisa operar:**
- no arquivo de ambiente local de quem faz a chamada (chave `LIT_BASE`);
- no seed da migration `20260625185157_lit_mirror_financeiro_schema.sql` do repositório heziomos,
  onde ele aparece como exemplo da chave `LITERARIUS_API_BASE_URL`;
- em [[Literarius-API-Documentacao]], nesta mesma pasta.

⚠️ Os dois últimos **não estão mascarados**. Mascarar só aqui reduz a agregação nesta nota, não
elimina a exposição no vault. Fechar isso de verdade depende do incidente 1: TLS, remoção do campo
`password` do payload e rotação das 19 senhas. **Quando o incidente fechar, remova esta seção e
devolva o endereço à tabela acima.**

### Onde a credencial vive, e onde ela não vive

**A credencial NÃO está em `admin.integration_configs` do Supabase.** As três chaves previstas
para ela existem na tabela e estão **vazias em produção**. É o mesmo padrão já visto em outros
sistemas da casa: a tela de configuração nunca gravou, e a tabela que deveria ser a fonte de
verdade ficou em branco enquanto a integração roda por outro caminho.

Procedência: a informação sobre as três chaves vazias foi passada pela orquestração desta
rodada. **Não medi o Supabase aqui**, porque esta rodada teve acesso só ao Literarius.

**Onde a credencial que funciona vive hoje:** num arquivo de ambiente local, fora de qualquer
repositório, no ambiente de quem faz a chamada. Nesta medição foi
`.../scratchpad/literarius.env`, com as chaves `LIT_BASE`, `LIT_USER`, `LIT_PASS` e `MSSQL_*`.
Esse arquivo é temporário e some com a sessão.

**Consequência prática:** não existe hoje fonte de verdade compartilhada da credencial do
Literarius. Quem for automatizar precisa decidir onde ela vai morar **antes** de escrever a
primeira linha de código, porque o lugar desenhado para isso está vazio e o lugar que funciona
é o `.env` de uma máquina. Some-se a isso o incidente 1: a senha do ERP anda em texto legível
por uma rota HTTP, então rotação de credencial aqui não é higiene, é contenção.

**Nenhum valor de credencial é reproduzido neste documento.**

### Formato da rota

A rota da documentação interna **está errada e o erro é mudo**. `/Parceiro/`, `/Produto/`,
`/PedidoVenda/` e `/TFinanceiroController/TituloFinanceiroReceber` devolvem página HTML de erro
500 do IIS em cerca de 70 ms, sem tocar no banco.

A forma real é:

```
/datasnap/rest/T{Entidade}Controller/{Metodo}[/{arg}[/{arg}...]]
```

### Oráculo de existência de rota

| Resposta | Significado |
|---|---|
| HTTP 500 com corpo HTML do IIS (1.211 bytes, iso-8859-1) | A rota **não existe** |
| HTTP 400 com o texto puro `Solicitacao Invalida` (23 bytes) | A rota **existe**, argumento errado |
| HTTP 200 | Rota existe e respondeu |

Validado nos dois sentidos: `/TXyzzyController/Xyzzy/` dá 500, `/TEstoqueController/Estoque/`
dá 400, `/TProdutoController/Produto/1` dá 200. **A raiz de um controller que existe também
devolve 500** (`/TTituloFinanceiroController/` dá 500 mesmo com `/Receber` funcionando). Foi
assim que uma sonda concluiu erradamente que `/TFormaPagtoController/` não existia, quando
`/TFormaPagtoController/FormaPagto/` funciona.

Não há manifesto, discovery, swagger ou WSDL. Todo o mapa de rotas veio de tentativa e erro.

### Envelope

```json
{ "sucess": true, "message": "", "data": [ ... ], "page": {"totalPages":N,"number":N,"size":N,"totalRecords":N} }
```

- A chave é **`sucess`**, com erro de grafia. `resp.get("success")` devolve `None` para sempre e
  nunca acusa nada.
- **`message` troca de tipo**: string vazia no sucesso, `[{"text":"..."}]` no erro. Parser
  tipado quebra.
- O texto de erro **vaza a stack do banco**:
  `[FireDAC][Phys][ODBC][Microsoft][SQL Server Native Client 11.0][SQL Server]...`
- Toda lista aninhada vem embrulhada em `{"ownsObjects":true,"listHelper":[...]}`. É o
  `TObjectList<T>` do Delphi vazando a estrutura interna. Não é array JSON.
- **A resposta pode vir sem a chave `data`.** Página viva tem quatro chaves
  (`sucess`, `message`, `data`, `page`), página morta tem duas (`sucess`, `message`). Ver 4.5.

### Paginação

- `?page=N`, base 1. Default `size=50` (confirmado na janela B: sem `?size`, a resposta traz
  `page.size=50`).
- **`?size=N` existe e não é documentado.** Testado até 5.000 em Parceiro e Título, até 2.000 em
  Pedido. `totalPages` é recalculado.
- **`?pageSize` é ignorado** (cai para 50). **`?pagina` também é ignorado**, e foi o que fez uma
  sonda concluir que `/NotaFiscal/` tinha teto fixo de 50 registros. O parâmetro é `page`.
- `page.totalRecords` vem na primeira chamada e **é confiável**: na janela B bateu com o
  `COUNT(*)` do SQL até a unidade nos dois lados do financeiro (Pagar 3.973 = 3.973, Receber
  59.204 = 59.204). **Não é preciso busca binária para medir volume.**
- Página além do fim devolve 200 com `data:[]`.
- **Erro de parâmetro nunca vira status HTTP.** Medido em 19:33 e 19:34 BRT:
  `?size=0` devolve **HTTP 200** com `sucess:false` e a mensagem "O número de linhas fornecido
  para uma cláusula FETCH deve ser maior que zero" (0,065 s em Produto, 0,046 s em Parceiro).
  `?size=-1` se comporta igual. `?page=0` também devolve **HTTP 200** com `sucess:false` e
  "O deslocamento especificado em uma cláusula OFFSET não pode ser negativo". `?size=1` devolve
  `sucess:true` (controle). **Correção sobre o rascunho: `size=0` não devolve HTTP 500.**
- **Consequência operacional:** quem monitorar essa API por código de resposta não enxerga falha
  nenhuma. **O contrato de erro é o campo `sucess`, não o status HTTP.** Um coletor que só
  cheque `res.ok` grava página vazia como se fosse sucesso.

### Filtro incremental

| Entidade | `?dataAlt` funciona? | Observação |
|---|---|---|
| TituloFinanceiro (Receber/Pagar) | **Sim**, semântica `>=`, milissegundos honrados | Mas **não serve para o financeiro**: a baixa muitas vezes não levanta o `DataAlt` do título. Ver 4.4 |
| Parceiro | **Sim** | A documentação interna diz que é ignorado e está errada. Mas o campo `dataAlt` do payload vem sempre zerado: filtra e não dá watermark |
| Produto | **Sim**, e o campo `dataAlt` do payload vem preenchido de verdade | É o único incremental completo da API |
| PedidoVenda | **Não**, ignorado em silêncio | 12 nomes testados, todos ignorados |
| NotaFiscal | **Não**, ignorado em silêncio | Idem |
| Estoque, Inventário, FormaPagto, OperacaoFiscal | **Não** | Resposta byte a byte idêntica com e sem o parâmetro |

Formato correto: `YYYY-MM-DDTHH:MM:SS`. **Separador espaço descarta a hora em silêncio**
(`?dataAlt=2026-08-06 13:30:00` devolveu 3 produtos, com `T` devolveu 2).

### Throttle

Mantive 400 a 450 ms entre todas as chamadas. A API bate direto no banco do ERP em produção.
Não houve rate limit, mas também não testei o limite. As chamadas com `?size` grande puxaram
cerca de 26 MB em poucos minutos por volta das 13:40 BRT (janela A). Se houver reclamação de
lentidão nesse horário, foram elas.

Throughput medido na janela A: satura em 11 a 12 ms por registro (cerca de 85 registros/s) no
Título Financeiro. Nota Fiscal é o dobro (cerca de 41 ms por registro), por causa dos 110 campos
fiscais por item.

---

## 3. Catálogo de endpoints

**33 endpoints catalogados, 10 descobertos na janela A** (marcados com **NOVO**), incluindo o
controller inteiro do financeiro, cuja rota documentada não existe.

Os volumes das tabelas abaixo foram recarimbados na **janela B** (19:21:41 a 19:21:46 BRT na
API, 19:22:04 no SQL, ou seja 23 segundos de distância entre as duas pontas).

### 3.1 TTituloFinanceiroController

| Path | Verbo | R/W | `page` | `dataAlt` | Devolve | Volume (janela B) | Armadilha principal |
|---|---|---|---|---|---|---|---|
| **NOVO** `/TTituloFinanceiroController/Receber/` | GET | R | sim | sim (`>=`) | Contas a receber, 43 campos, parceiro aninhado, `rateios[]`, `baixas[]` | **59.204** na API = 59.204 no SQL (`TipoTitulo='R'`) | `?dataAlt` inválido devolve a base inteira, R mais P |
| **NOVO** `/TTituloFinanceiroController/Receber/{id}` | GET | R | não (`page:null`) | n/d | O título, dentro de `data[]` | 0,10 a 0,26 s, cerca de 3 KB | Id inexistente devolve 200 com `data:[]`, sem 404 |
| **NOVO** `/TTituloFinanceiroController/Pagar/` | GET | R | sim | sim | Idêntico ao Receber, `tipoTitulo='P'` | **3.973** na API = 3.973 no SQL | **Perde de 50 a 1.000 títulos por varredura, em silêncio. Ver 4.5** |
| **NOVO** `/TTituloFinanceiroController/Pagar/{id}` | GET | R | não | n/d | Idem | 0,12 s, cerca de 2,8 KB | `baixas[]` vazio mesmo em título baixado há 47 minutos |

Filtros não documentados que funcionam e foram conferidos contra o SQL (janela A):
`?pago=true|false` (36.564 e 22.528 no Receber, 3.351 e 619 no Pagar, exatos),
`?parceiro={codigo}` (26582 devolveu 2, SQL 2), `?empresa={n}`, `?size=N`.
Ignorados em silêncio: `referencia`, `vencimento`, `emissao`, `numero`, `impresso`, `situacao`,
`dataBaixa`.

Na janela B, `?pago=false&size=200` no Pagar devolveu 621 de 621 sem perda, e
`?pago=true&size=200` perdeu 600 de 3.352. O filtro muda quais páginas morrem. Ver 4.5.

### 3.2 TParceiroController

| Path | Verbo | R/W | `page` | `dataAlt` | Devolve | Volume (janela B) | Armadilha |
|---|---|---|---|---|---|---|---|
| `/TParceiroController/Parceiro` | GET | R | sim | **sim** | 44 campos mais `enderecos[]` (1 a 9 reais) | **52.267** na API = SQL `WHERE Status=1` (52.267). SQL total **52.275** | Esconde `Status<>1` em silêncio: **8 parceiros invisíveis** (6 com Status=2, 2 com Status=0) |
| `/TParceiroController/Parceiro/{id}` | GET | R | não | n/d | 1 parceiro em `data[]` | 0,09 a 0,10 s | Id inexistente devolve 200 com `sucess:false` |
| `/TParceiroController/Cliente/{id}` | GET | R | não | n/d | Idem, validando o papel | SQL `IsCliente=1` = 51.028 (janela A) | Não existe LISTA de Cliente, só by-id |
| **NOVO** `/TParceiroController/Fornecedor` (lista) | GET | R | sim | não testado | Idem | **147** na API = SQL `IsFornecedor=1` (147), janela A | A documentação só registra o by-id |
| `/TParceiroController/Fornecedor/{id}` | GET | R | não | n/d | Idem | n/d | `/Fornecedor/1` devolve `sucess:false` com HTTP 200 |
| **NOVO** `/TParceiroController/Autor` | GET | R | sim | não testado | Idem | **1.011** na API = SQL `IsAutor=1` (1.011), janela A | Não consta em documentação nenhuma. É o que liga `produto.autores[].autor` |
| `/TParceiroController/Transportadora` | GET | R | sim | não testado | Idem | **21** na API. SQL total 23, com `Status=1` exatamente 21 (janela A) | 2 transportadoras existem e nunca aparecem |
| `/TParceiroController/Vendedor` | GET | R | sim | não testado | Idem | **50** na API (janela A) | `totalRecords=50` com `size=50` parece truncado, mas `page=2` volta vazio: são 50 mesmo. Não há tabela `Vendedor` no banco para cruzar |
| `/TParceiroController/TipoCliente` | GET | R | **não** | n/d | Lookup de 7 linhas | **7** | O lookup existe e está certo. Quem está vazio é o ponteiro: ver abaixo |

**`TipoCliente` é tabela, `ClienteTipoCliente` é coluna.** Verificado em `sys.objects` e
`sys.columns` às 19:26 BRT. `TipoCliente` é uma `USER_TABLE` de 7 linhas (1=IGREJAS,
2=LIVRARIAS, 3=DISTRIBUIDORAS, 4=ONGS, 5=PF, 6=Colaborador, 7=Empresas). `ClienteTipoCliente` é
uma coluna `int` da tabela `Parceiro`, o ponteiro para esse lookup. **Não existe tabela chamada
`ClienteTipoCliente` no banco.** Também existem `ProdutoPreco.TipoCliente` (preço por segmento) e
colunas `DescTipoCliente` derivadas em seis views.

Preenchimento real da coluna nos 52.275 parceiros (19:26 BRT):

| `ClienteTipoCliente` | Parceiros |
|---|---:|
| **0** (não classificado) | **50.788** |
| **NULL** | **1.234** |
| 5 = PF | 179 |
| 1 = IGREJAS | 48 |
| 2 = LIVRARIAS | 15 |
| 7 = Empresas | 6 |
| 6 = Colaborador | 2 |
| 4 = ONGS | 2 |
| 3 = DISTRIBUIDORAS | 1 |

**253 parceiros classificados em 52.275, ou 0,48%.** E 1.234 estão em NULL e não em 0, ou seja
nem o default é uniforme. O `tipoCliente[]` do payload do parceiro nunca vem preenchido.

### 3.3 TProdutoController

| Path | Verbo | R/W | `page` | `dataAlt` | Devolve | Volume (janela B) | Armadilha |
|---|---|---|---|---|---|---|---|
| `/TProdutoController/Produto` | GET | R | sim | **sim, com watermark real** | 65 campos mais `imagens[]`, `precos[]`, `autores[]`, `camposExtra[]`, `produtoParceiro[]` | **5.238** na API = SQL `COUNT(*)` (5.238) | **Não filtra nada**: os 3 produtos com `Inativo=1` vêm com `inativo:true`. Regra oposta à do Parceiro |
| `/TProdutoController/Produto/{id}` | GET | R | não | n/d | 1 produto | 0,12 a 0,20 s, 4,8 KB | `codigo` é o id. `/ProdutoCodigo/1` dá 500 |
| `/TProdutoController/ProdutoEan/{ean}` | GET | R | não | n/d | Busca por EAN | n/d | Único nome que funciona. `/ProdutoCodigoBarras/` e `/ProdutoIsbn/` dão 500 |
| `/TProdutoController/TipoProduto` | GET | R | ? | ? | Lookup de tipo de produto | **não medido** | Rota confirmada como existente pelo oráculo, não sondada em profundidade |

### 3.4 TPedidoVendaController

| Path | Verbo | R/W | `page` | `dataAlt` | Devolve | Volume (janela B) | Armadilha |
|---|---|---|---|---|---|---|---|
| `/TPedidoVendaController/PedidoVenda` | GET | R | sim, sem teto até `size=2000` | **NÃO** | 36 campos, `cliente{}` completo, `items[]` (21 campos), `venctos[]` (9), `rastreios[]` | **29.387** na API = SQL `COUNT(*)` (29.387) | **`?status=` com qualquer valor derruba com HTTP 500**, inclusive vazio. `?Status=` com maiúscula é ignorado |
| `/TPedidoVendaController/PedidoVenda/{id}` | GET | R | não | n/d | Estrutura idêntica à lista, campo a campo | 0,15 a 0,26 s | Id inexistente devolve **200, `sucess:true`, registro fantasma zerado** (`idPedidoVenda=0`, `cliente=null`) |
| `/TPedidoVendaController/PedidoVendaStatus/{empresa}/{numero}/{status}` | GET | **W (altera estado)** | n/d | n/d | n/d | **NÃO CHAMADO** | GET que grava em produção. Recebe `numero`, não `idPedidoVenda` |
| `/TPedidoVendaController/PedidoVenda` | PUT | W | n/d | n/d | n/d | **NÃO EXECUTADO** | Contrato inteiramente inferido. Ver 6.4 |

Filtros não documentados que funcionam, conferidos contra o SQL na janela A: `?cliente=26582`
devolveu 2 (SQL 2), `?canalVenda=1` devolveu 17.869 (SQL 17.869), `?tipoPedido=1` devolveu
28.919 (SQL 28.919), `?empresa=99` devolveu 0.
Ignorados: `siteIdPedido`, `pedidoCliente` e **todos os 12 nomes de filtro de data testados**.

**Lembrete que vale dinheiro:** contar por `PedidoVenda` não conta a loja física. As 11.491
notas do PDV (R$ 1.550.747,34) não têm pedido nenhum. Ver 4.13.

### 3.5 TNotaFiscalController

| Path | Verbo | R/W | `page` | `dataAlt` | Devolve | Volume (janela B) | Armadilha |
|---|---|---|---|---|---|---|---|
| **NOVO** `/TNotaFiscalController/NotaFiscal` | GET | R | **sim, com `?page`** | **NÃO** | 108 campos, `pessoa{}`, `serie{}`, `items[]` (cerca de 110 campos fiscais cada, já com IBS/CBS da reforma), `venctos[]`, `volumes[]`, `dis[]` | **42.888** na API = SQL no mesmo instante (42.888) | **A lista é ordenada por `dataEmissao` ASC, não por id.** Página 1 começa em `idNotaFiscal` 27884, 27885, 27886 e só então cai no id 1 |
| **NOVO** `/TNotaFiscalController/NotaFiscal/{id}` | GET | R | não | n/d | Idêntico à lista, byte a byte (diff da NF 1 deu zero diferenças) | 0,15 a 0,46 s, cerca de 6,5 KB | O argumento é `idNotaFiscal`, **não o número da nota**. `/NotaFiscal/4882` devolve `numero=67088` |

**Não existe campo `cancelada` no JSON.** O cancelamento tem que ser inferido de `nFeStatus=3`.
A equivalência `Cancelada=1` igual a `NFeStatus=3` foi provada no universo inteiro (182 notas,
sem exceção, 19:38 BRT), então o proxy é seguro.

**Divergência entre sondas, resolvida:** uma sonda concluiu que `/NotaFiscal/` tem teto fixo de
50 registros sem paginação. Ela testou `?pagina=2` em português, que é ignorado. Com `?page=N` a
paginação funciona e o endpoint entrega as 42.888 notas.

**Refutação registrada:** a premissa de que os campos de cancelamento só aparecem no by-id está
errada. Comparando o mesmo registro (NF id 1, cancelada) na lista e por id, o payload é
idêntico: `nFeStatus=3`, `nFeOcorrencia=101`, protocolo, data e justificativa presentes nos
dois. O falso positivo apareceu ao comparar registros diferentes.

### 3.6 TEstoqueController

| Path | Verbo | R/W | `page` | `dataAlt` | Devolve | Volume | Armadilha |
|---|---|---|---|---|---|---|---|
| `/TEstoqueController/Estoque/{empresa}/{setor}/{produto}` | GET | R | **não existe listagem** | não | `{empresa, setor, box, produto, saldo}`, só `saldo` tem conteúdo | 1 linha por chamada. SQL (janela A): `Estoque` tem 6.958 linhas, 3.563 produtos distintos, `SUM(QtdeFisica)`=136.224 | `setor=0` é o coringa "todos os setores". **Produto inexistente devolve saldo 0 com `sucess:true`** |
| `/TEstoqueController/Estoque/{empresa}/{setor}/{produto}/{box}` | GET | R | não | não testado | Saldo naquele box | 1 linha | **A ordem é empresa/setor/produto/box**, apesar de o payload listar `box` antes de `produto` |

**Divergência entre sondas, não resolvida:** uma sonda mediu `/1/1/1` e obteve saldo **963**,
outra mediu produto 1 no setor 1 e obteve **893**, batendo com `Estoque.QtdeFisica`=893. As duas
na janela A. Ou o saldo se moveu entre as medições, ou uma das duas leu errado. **Precisa ser
refeito antes de usar como referência.**

**Somar os boxes não dá o saldo do setor.** Existem movimentos com `Box=''`. Produto 1 no setor
2: o box `TEMP00200000000` tem +87, mas há um `Box=''` com −25, e o saldo real do setor é 62.
Conferência box a box acusa sobra que não existe.

### 3.7 TInventarioController

| Path | Verbo | R/W | `page` | `dataAlt` | Devolve | Volume (janela A) | Armadilha |
|---|---|---|---|---|---|---|---|
| `/TInventarioController/Inventario/` | GET | R | **não tem** | não | Dump completo com todos os itens embutidos | **1.589 inventários e 14.127 itens** na API = SQL exato. 3.644.477 bytes | **13,3 s e 18,0 s por chamada, sem filtro nenhum.** Não usar em loop |
| `/TInventarioController/Inventario/{id}` | GET | R | n/d | n/d | 1 inventário | 0,097 a 0,17 s | Id inexistente devolve **200, `sucess:TRUE`, registro fantasma com `dataInventario` 1899-12-30** |

### 3.8 TFormaPagtoController

| Path | Verbo | R/W | `page` | `dataAlt` | Devolve | Volume | Armadilha |
|---|---|---|---|---|---|---|---|
| `/TFormaPagtoController/FormaPagto/` | GET | R | não | não | 8 campos por forma | **17** na API = SQL `COUNT(*)` (17), confirmado na janela B | `codigoExterno` **não é único**: '15' serve para BOLETO SANTANDER e BOLETO SITE, '03' para três cartões, '17' para os três PIX. `taxa=0` e `prazo=0` nas 17 |
| `/TFormaPagtoController/FormaPagto/{codigo}` | GET | R | não | n/d | 1 forma | 0,072 s | **Único controller sondado que sinaliza erro direito**: código inexistente devolve `sucess:false` |

### 3.9 TOperacaoFiscalController

| Path | Verbo | R/W | `page` | `dataAlt` | Devolve | Volume (janela A) | Armadilha |
|---|---|---|---|---|---|---|---|
| `/TOperacaoFiscalController/OperacaoFiscal/` | GET | R | não | n/d | **`data:[]` vazio, 38 bytes** | 0 pela API, **62 no SQL** (todas com `Inativa=0`) | **Causa achada:** não é listagem quebrada, é lookup com id defaultado para 0. `/OperacaoFiscal/0` devolve exatamente a mesma resposta vazia |
| `/TOperacaoFiscalController/OperacaoFiscal/{id}` | GET | R | n/d | n/d | 30 campos, inclusive `cstIBSCBS`, `aliqCBS`, `aliqIBSUF` da reforma | Iterar 1 a 62 custa cerca de 45 s com throttle | Um segundo argumento é aceito e **ignorado**: `/OperacaoFiscal/1/1` é igual a `/OperacaoFiscal/1` |

### 3.10 Outros controllers confirmados

| Path | Status | Observação |
|---|---|---|
| **NOVO** `/TPedidoCompraController/PedidoCompra/` | HTTP 400 em todas as aridades testadas | O controller **existe** (400, não 500), mas nenhum GET serve dado. A tabela `PedidoCompra` tem **0 linhas** no SQL: a Heziom não usa o módulo. Hipótese não verificada: só aceita POST/PUT |
| **NOVO** `/TUsuarioController/Usuario` | HTTP 200 | **Incidente 1.** Devolve senha em texto legível. Não chamado nesta rodada de fechamento, por decisão de não coletar senha |

### 3.11 Rotas testadas que NÃO existem (HTTP 500)

Cerca de 40 nomes deram o 500 do IIS. Os que importam:

`/TTituloFinanceiroBaixaController/`, `/TTituloFinanceiroController/Baixa/`, `/Baixas/`,
`/TPlanoContaController/`, `/TCentroResultadoController/`, `/TContaBancariaController/`,
`/TBancoController/`, `/TCondicaoPagtoController/`, `/TEntradaController/Entrada`,
`/TMovimentoEstoqueController/`, `/TConsignacaoController/`, `/TDireitoAutoralController/`,
`/TRoyaltiesController/`, `/TComissaoController/`, `/TTabelaPrecoController/`,
`/TCanalVendaController/`, `/TNotaFiscalServicoController/`, `/TNotaFiscalController/TipoNota`,
`/TTipoNotaController/TipoNota`, `/TTransferenciaEstoqueController/`,
`/TLancamentoEstoqueController/`, `/TCupomDescontoController/`, `/TEditoraController/`,
`/TEmpresaController/`, `/TSetorController/`, `/TCreditoParceiroController/CreditoParceiro`,
`/TContaBancariaFormaPagtoController/ContaBancariaFormaPagto`,
`/TCobrancaConfiguracaoController/CobrancaConfiguracao`.

**Os quatro últimos foram testados na janela B** e importam para as seções 4.8 e 4.18: nem o
crédito de cliente, nem o de-para de conta bancária, nem a configuração de cobrança têm rota.
E sem `/TNotaFiscalController/TipoNota` não existe, pela API, o de-para dos 15 tipos de nota,
que é o que separa venda de devolução, doação, remessa e consignação.

---

## 4. Financeiro e faturamento

Esta é a seção que mais importa e a que concentra os achados mais graves da rodada.

Ordem das subseções: primeiro o que a API entrega e o que ela esconde (4.1 a 4.6), depois onde o
dinheiro cai (4.7 a 4.9), depois a receita (4.10 a 4.16), depois o caixa (4.17), depois o que
não vira dinheiro (4.18), depois custo (4.19) e os buracos de integridade (4.20).

### 4.1 O que a API entrega, campo a campo

`/Receber/` e `/Pagar/` devolvem exatamente os mesmos **43 campos**. As 41 colunas de
`TituloFinanceiro` no SQL foram conferidas contra o JSON: é **mapeamento 1 para 1**. Os dois
campos extras são `rateios[]` e `baixas[]`, e a coluna `Parceiro int` virou objeto completo.

**Identificação**
`idTituloFinanceiro` (PK real), `tipoTitulo` ('R' ou 'P'), `empresa` (sempre 1), `numero`

**Datas**
`emissao`, `vencimento`, `vencimentoOriginal`, `dataRemessa`, `dataAgrupamento`,
`dataPermissao`, `dataAlt`

**Dinheiro**
`valor`, `valorPago`, `valorAbatido`, `valorAcrescimo`, `valorTaxa`, `moeda` (sempre 'R$')

**Estado**
`pago` (bit), `situacao`, `portador`, `impresso`, `agrupado`

**Cobrança**
`formaPagto` (13 valores distintos em R, 8 em P), `contaBancaria` (0 igual a não informado),
`boleto`, `codBarrasBoleto`, `idCobrancaConfig`, `idRemessa`, `referencia`,
`idContasPagarConfig`

**Parcelamento**
`tipoParcelamento` ('U' ou 'P'), `parcela`, `totalParcela`, `idPrimeiraParcela`

**Auditoria**
`usuarioAlt` (11 usuários distintos numa amostra de 5.000, janela A), `dataAlt`,
`usuarioAgrupamento`, `usuarioPermissao`, `observacao`

#### `tipoTitulo`: domínio fechado em dois valores

Medido às 19:23 BRT sobre as 63.177 linhas de `TituloFinanceiro`, universo inteiro:

| `TipoTitulo` | Títulos | % do total |
|---|---:|---:|
| `R` (a receber) | 59.204 | 93,71% |
| `P` (a pagar) | 3.973 | 6,29% |
| nulo ou outro valor | **0** | 0% |

#### `origem` e `origemIdRegistro`: vínculo polimórfico, sem FK

Distribuição real, medida às 19:23 BRT sobre as 63.177 linhas. O domínio foi decifrado cruzando
faixas de id com as tabelas de destino, o que é inferência forte, não prova documental: **não
existe tabela de domínio de `Origem` no banco.**

| `TipoTitulo` | `Origem` | Significado | Títulos | % do lado | `OrigemIdRegistro` | `SUM(Valor)` |
|---|---:|---|---:|---:|---|---:|
| R | **1** | `NotaFiscal` | **59.099** | **99,82%** | 4 a 43.846 | R$ 7.373.199,92 |
| R | NULL (a API devolve **0**) | Lançamento manual | 90 | 0,15% | nulo | R$ 100.661,85 |
| R | **13** | Não identificado | 15 | 0,03% | 1 a 6 | R$ 16,00 |
| P | NULL (a API devolve **0**) | Lançamento manual | **3.009** | **75,74%** | nulo | R$ 6.957.935,91 |
| P | **2** | `Entrada` (compra) | 554 | 13,94% | 1 a 292 | R$ 2.273.987,75 |
| P | **6** | Direito autoral | 410 | 10,32% | 256 a 723 | R$ 161.339,37 |

Confere: 59.099 mais 90 mais 15 é igual a 59.204, e 3.009 mais 554 mais 410 é igual a 3.973.

Três leituras que saem daí:

1. **Do lado da receita, título nasce de nota fiscal, não de pedido.** `Origem=1` cobre 99,82%
   do lado a receber e 93,55% de todos os títulos.
2. **O lado a pagar é o inverso, e isso é novo:** **75,74% das contas a pagar (3.009 de 3.973,
   R$ 6.957.935,91) não têm origem nenhuma**, são digitadas à mão. Só 24,26% nascem de um
   documento do próprio ERP. **O maior volume de dinheiro do contas a pagar não tem rastro para
   trás.**
3. **A API renderiza `Origem` NULL como `0`.** Verificado no título 65743 às 19:26 BRT
   (`Origem` e `OrigemIdRegistro` nulos no SQL, a API devolve `origem=0` e `origemIdRegistro=0`).
   Quem consome a API não distingue "sem origem" de "origem de código 0". **O zero da API é
   ambíguo por construção.**

#### Aninhados

- `parceiro{}`: 43 campos, com `enderecos[]` populado. Em 5.000 títulos vieram 15.104 endereços
  (janela A). 4.993 parceiros trazem os 3 slots fixos (1=PRINCIPAL, 2=ENTREGA, 3=COBRANÇA, os
  dois últimos quase sempre com strings vazias). 7 de 5.000 vieram sem endereço.
- `rateios[]`: **populado em 5.000 de 5.000** (janela A) e em 3 de 3 na amostra dirigida da
  janela B. `planoConta` nunca veio 0 (8 códigos distintos na amostra), `centroResultado` nunca
  veio 0 (códigos 1, 3, 8 e 13), `sinal='+'` em 100%. 15 de 5.000 têm mais de um rateio.
- `baixas[]`: **vazio em 100%.** Ver 4.3.

### 4.2 Campos mortos, provados no universo e não em amostra

Medições da janela A, salvo indicação em contrário.

| Campo | Estado | Prova |
|---|---|---|
| `situacao` | 1 em 100% | `COUNT(DISTINCT Situacao)` sobre as 63.066 linhas de então é igual a **1** |
| `portador` | 1 em 100% | A tabela `Portador` tem **1 linha**: 'PADRAO', criada em 20/05/2016 |
| `empresa` | 1 em 100% | Só existe 1 empresa com movimento |
| `valorTaxa` | 0 em 100% das baixas | Taxa de cartão e de gateway **nunca entra no sistema** |
| `agrupado` | false em 100% | `TituloFinanceiroAgrupado` tem 0 linhas |
| `dataPermissao` | NULL em 100% | Devolvida como `1899-12-30T00:00:00.000Z` |
| `idContasPagarConfig` | 0 em 100% | n/d |
| `usuarioPermissao`, `usuarioAgrupamento` | `''` em 100% | n/d |
| `rateio.sinal` | '+' em 100% das 63.624 linhas | A separação receita e despesa vem **só** de `tipoTitulo` |

O estado do título mora em `pago` (bit) mais `valorPago`. Nada mais.

### 4.3 O que a API não entrega: a baixa

#### `baixas[]` vem vazio em 100%, reconfirmado por amostragem dirigida

Reconfirmação em **19:25 BRT** (janela B), com o método invertido para eliminar dúvida: o SQL
escolheu 3 títulos cuja baixa foi **gravada hoje**, e cada um foi chamado por id na API logo em
seguida.

| Título | Tipo | SQL: baixas | SQL: gravação da baixa | API: `pago` | API: `valorPago` | API: `baixas[]` | API: `rateios[]` |
|---:|---|---:|---|---|---:|---|---:|
| 20496 | P | 1 (R$ 9.754,45) | 06/08 18:36:49,960 | `true` | 9754.45 | **vazio** | 1 item |
| 65741 | R | 1 (R$ 29,90) | 06/08 17:31:00,440 | `true` | 29.90 | **vazio** | 1 item |
| 65740 | R | 1 (R$ 449,05) | 06/08 17:19:07,953 | `true` | 449.05 | **vazio** | 1 item |

A chave `baixas` **existe** no payload e vem no mesmo embrulho Delphi dos outros aninhados,
`{"ownsObjects":true,"listHelper":[]}`, com `listHelper` de comprimento zero. Não é chave
ausente nem erro: é lista declarada e entregue vazia.

**Não é limitação de formato:** nos mesmos três payloads, `rateios[]` usa exatamente a mesma
estrutura e vem populado com 1 item cada.

Na janela A o mesmo resultado apareceu em: título antigo (id 5, R, pago, 1 baixa no SQL), título
com 2 baixas (id 29784), Pagar baixado no dia anterior (ids 26776 e 65310), título 49514, e nos
5.000 registros de uma amostra grande, mais 3 páginas espalhadas (1, 600, 1183) com 57 títulos
`pago=true`. **Zero casos populados em qualquer momento.**

Estado do que a API não entrega, medido às 19:24 BRT: `TituloFinanceiroBaixa` tem **41.693
linhas** somando **R$ 11.915.844,14** em `ValorBaixa`. **Zero delas alcançáveis pela API.**

#### Consequência direta: não existe data de pagamento na API

Não há endpoint de baixa. `/TTituloFinanceiroBaixaController/`,
`/TTituloFinanceiroController/Baixa/` e `/Baixas/` devolvem 500.

**Pela API dá para saber SE pagou. Nunca QUANDO.**

### 4.4 A baixa não levanta o `dataAlt` do título

Quando o ERP grava uma linha em `TituloFinanceiroBaixa`, ele atualiza `TituloFinanceiro.Pago` e
`TituloFinanceiro.ValorPago`, **mas em boa parte dos casos não levanta o
`TituloFinanceiro.DataAlt`**. O carimbo de alteração do título fica congelado na data em que ele
foi criado ou editado pela última vez, mesmo com a baixa gravada meses depois.

Consequência: um sync incremental que peça `?dataAlt=<último watermark>` puxa o título uma vez,
em aberto, e **nunca mais o vê**. O pagamento acontece fora do campo de visão do watermark.

#### Prova gravada hoje, e reconferida na API 47 minutos depois

Título **20496** (a pagar):

| Campo | Valor medido |
|---|---|
| `TituloFinanceiro.DataAlt` (SQL) | **05/02/2026 16:45:12,730**, usuário `ana` |
| `TituloFinanceiroBaixa.DataBaixa` (SQL) | 06/08/2026 (data pura, sem hora) |
| `TituloFinanceiroBaixa.DataAlt` (SQL) | **06/08/2026 18:36:49,960**, usuário `ana` |
| `ValorBaixa` | R$ 9.754,45 (quita integralmente o título) |
| **API `/Pagar/20496` às 19:25 BRT** | `pago=true`, `valorPago=9754.45`, e **`dataAlt=2026-02-05T16:45:12.730Z`** |

A baixa foi gravada às 18:36 de hoje. Às 19:25 de hoje, quase uma hora depois, **a API ainda
declara que a última alteração do título foi em 5 de fevereiro.** Seis meses de defasagem,
visível ao vivo.

#### O defeito não é universal, e isso importa

Nos títulos **65740** e **65741** (a receber, venda de site) o `DataAlt` do título e o `DataAlt`
da baixa estão a menos de meio segundo um do outro: título criado e baixado na mesma transação
automática. Nesses casos o carimbo está certo.

**Onde a baixa é automática, o `DataAlt` acompanha. Onde alguém baixa depois, na mão, ele não
acompanha.** É exatamente o mesmo eixo do achado de taxa de baixa por forma de pagamento
(automático 100%, manual entre 18% e 47%, ver 4.20).

#### Os dois critérios, lado a lado

Correção sobre o rascunho, e ela muda o número: a descrição anterior falava em "baixa mais de 1
dia depois do último `DataAlt` do título" e se lia como se o critério fosse a `DataBaixa`,
quando o critério medido era o `DataAlt` da própria linha de baixa. São coisas diferentes e
apontam para lados diferentes. A soma anterior também estava R$ 1.000 errada. Tudo abaixo foi
remedido às **19:24 BRT**.

Universo: os **40.018 títulos que têm pelo menos uma baixa** (3.345 P mais 36.673 R), somando
R$ 11.806.760,75 em `Valor`. Critério: existe baixa cuja data é mais de 1 dia posterior ao
`DataAlt` do título.

| Critério de "data da baixa" | O que ele mede | Títulos | `SUM(Valor)` dos títulos | `SUM(ValorPago)` |
|---|---|---:|---:|---:|
| **`TituloFinanceiroBaixa.DataAlt`** (o que foi medido, e o correto) | Quando o ERP **escreveu** a linha de baixa | **10.135** (25,33% do universo) | **R$ 5.851.757,89** (49,56% do universo) | R$ 5.952.085,17 |
| `TituloFinanceiroBaixa.DataBaixa` | Data de competência **digitada pelo operador** | 12.101 (30,24%) | R$ 4.274.460,07 (36,20%) | R$ 4.373.797,35 |

Abertura por lado, pelo critério correto:

| Lado | Títulos | `SUM(Valor)` |
|---|---:|---:|
| A pagar (P) | 2.160 | R$ 4.900.385,29 |
| A receber (R) | 7.975 | R$ 951.372,60 |
| **Total** | **10.135** | **R$ 5.851.757,89** |

Pelo critério `DataBaixa`, para comparação: P 1.278 títulos e R$ 3.177.685,81, R 10.823 e
R$ 1.096.774,26, total 12.101 e R$ 4.274.460,07.

**Metodologia, explícita:** o valor somado é o `TituloFinanceiro.Valor` dos títulos atingidos,
não o valor das baixas. `SUM(ValorPago)` aparece na coluna extra e é **maior** que `SUM(Valor)`
do lado a receber (R$ 1.050.709,69 contra R$ 951.372,60), o que é o defeito já catalogado de
baixa duplicada (`valorPago > valor` em 1.679 títulos R), e não um erro desta conta.

#### Por que os dois critérios divergem, e por que o certo é o `DataAlt` da baixa

`DataBaixa` é **data de competência digitada**, com granularidade de dia e sem hora (no título
20496 ela vem `06/08/2026 00:00:00`). `DataAlt` da baixa é **relógio de gravação**, com
milissegundo. Medido nas 41.693 baixas às 19:24 BRT:

- **34.939 (83,8%) têm `DataBaixa` anterior ao `DataAlt`**: o operador retroage a competência ao
  lançar.
- 6.754 (16,2%) têm `DataBaixa` posterior.
- **2.242 têm `DataBaixa` no futuro**, até 08/05/2027 (parcela de cartão liquidada
  antecipadamente). O `DataAlt` da baixa, esse, **nunca é futuro: 0 linhas**.

Ou seja: a pergunta "o watermark do título ficou para trás?" só pode ser respondida pelo relógio
de gravação. Usar `DataBaixa` mistura decisão contábil do operador com o momento do write.

#### Taxa por mês, pelos dois critérios

Agrupado pelo **mês de gravação da baixa** (`TituloFinanceiroBaixa.DataAlt`):

| Mês | Baixas gravadas | Invisíveis pelo `DataAlt` da baixa | % | Invisíveis pela `DataBaixa` |
|---|---:|---:|---:|---:|
| set/2025 | 2.537 | 979 | 38,6% | 982 |
| out/2025 | 2.653 | 576 | 21,7% | 454 |
| nov/2025 | 2.697 | 116 | 4,3% | 75 |
| dez/2025 | 2.917 | 207 | 7,1% | 86 |
| jan/2026 | 2.373 | 152 | 6,4% | 85 |
| fev/2026 | 2.381 | 248 | 10,4% | 111 |
| mar/2026 | 2.631 | 297 | 11,3% | 224 |
| **abr/2026** | **10.418** | **8.465** | **81,3%** | 8.386 |
| mai/2026 | 3.034 | 89 | 2,9% | 53 |
| jun/2026 | 4.877 | 445 | 9,1% | **1.708** |
| jul/2026 | 4.342 | 223 | 5,1% | **1.378** |
| ago/2026 (parcial, até 19:24 BRT de 06/08) | 833 | 13 | 1,6% | 234 |

Repare em jun e jul/2026: o critério `DataBaixa` acusa de 3 a 6 vezes mais casos que o critério
correto. São as baixas de cartão com data futura entrando como falso positivo.

O evento de **abr/2026** (10.418 baixas no mês, 8.465 sem levantar o `DataAlt`) aparece igual
nos dois critérios, o que reforça que foi baixa em massa real e não artefato de data.
**A causa continua não investigada.**

#### Veredito

**O módulo financeiro não pode ser sincronizado incrementalmente por `?dataAlt`.** Em 06/08/2026
às 19:24 BRT há **R$ 5.851.757,89 em 10.135 títulos** já pagos que um consumidor incremental
ainda enxerga como em aberto. Some-se a isso que `baixas[]` vem vazio, e o resultado é: pela API
não dá para saber **quando** pagou, e por `dataAlt` não dá nem para saber **que** pagou.

### 4.5 As páginas envenenadas do contas a pagar

> **Correção de rumo.** O rascunho deste documento dizia que o título financeiro "sai inteiro
> pela API". **Não sai.** Do lado a pagar, a API perde entre 50 e 1.000 dos 3.973 títulos por
> varredura, dependendo do `?size` que se use, e avisa de um jeito que nenhum dos testes que o
> rascunho sugeria consegue pegar.

Tudo abaixo foi medido ao vivo em 06/08/2026, entre **19:21 e 19:40 BRT**.

#### O que acontece

Varredura de `/TTituloFinanceiroController/Pagar/?size=200` página a página, as 20 páginas.
**Duas voltaram mortas, a 10 e a 15.** As outras 18 vieram completas.

A página morta não é um erro HTTP. É isto:

```
HTTP 200
{"sucess":false,
 "message":[{"text":"Erro ao buscar os títulos financeiros. Segue abaixo o LOG do erro: \r\n
   Erro ao carregar o objeto TTituloFinanceiro. \r\n
   Erro ao carregar o objeto TTituloFinanceiroRateio. \r\n
   '-922337203685478' is not a valid floating point value"}]}
```

Repare no que **não** está aí: não tem `data` e não tem `page`. A página viva tem quatro chaves
(`sucess`, `message`, `data`, `page`), a morta tem **duas** (`sucess`, `message`).

É determinístico: a página 10 foi repetida três vezes seguidas e falhou nas três. **Retry não
resolve**, não é timeout nem concorrência.

#### A causa, confirmada no SQL

```sql
SELECT idTituloFinanceiro, Percentual FROM TituloFinanceiroRateio WHERE Percentual < -1000000
```

**6 linhas.** Todas com `Percentual = -922337203685477,5808`, que é exatamente o **valor mínimo
do tipo `money`** do SQL Server. Todas em títulos do lado **P**:

| idTituloFinanceiro | idTituloFinanceiroRateio | Valor do título | Origem | DataAlt |
|---|---|---:|---|---|
| 29659 | 31884 | R$ 0,00 | manual (NULL) | 14/01/2026 |
| 29707 | 31932 | R$ 0,00 | manual (NULL) | 14/01/2026 |
| 44966 | 49349 | R$ 0,00 | manual (NULL) | 14/04/2026 |
| 45005 | 49405 | R$ 0,00 | manual (NULL) | 14/04/2026 |
| 45021 | 49421 | R$ 0,00 | manual (NULL) | 14/04/2026 |
| 45176 | 49592 | R$ 0,00 | manual (NULL) | 15/04/2026 |

A gravação aceitou um valor que a leitura não consegue ler. O servidor serializa o número para a
string `-922337203685478` e depois falha ao converter essa string de volta para float.
**O caminho de escrita e o de leitura não concordam sobre o que é um número válido.**

A ironia: **os 6 títulos envenenados valem R$ 0,00.** Eles não têm valor financeiro nenhum.
O estrago inteiro é colateral.

#### Uma linha ruim mata a página inteira

O servidor monta a página carregando cada título e, para cada título, materializando o
`rateios[]`. Uma única linha de rateio que não parseia **aborta a construção da resposta
inteira**, não do registro, da **página**. Daí a fórmula:

```
perda = (páginas distintas que contêm ao menos 1 linha envenenada) × size
```

#### Tabela de perda por tamanho de página (medido, não extrapolado)

Todas as varreduras abaixo são completas: foram lidas as N páginas de cada tamanho.
`totalRecords` declarado pela API foi **3.973** em todas, e bate exatamente com o `COUNT(*)` do
SQL para `TipoTitulo='P'` (3.973).

| `?size` | Páginas | Páginas mortas | Números das páginas mortas | Recebidos | **Perda** | % | Valor colateral perdido |
|---:|---:|---:|---|---:|---:|---:|---:|
| 10 | 398 | 5 | 194, 197, 285, 286, 290 | 3.923 | **50** | 1,3% | R$ 67.146,35 |
| **50 (padrão)** | 80 | 4 | 39, 40, 57, 58 | 3.773 | **200** | 5,0% | R$ 297.070,99 |
| 100 | 40 | 2 | 20, 29 | 3.773 | **200** | 5,0% | R$ 297.070,99 |
| 200 | 20 | 2 | 10, 15 | 3.573 | **400** | 10,1% | R$ 773.196,08 |
| 500 | 8 | 2 | 4, 6 | 2.973 | **1.000** | 25,2% | R$ 2.051.734,99 |

**O padrão é o pior lugar para estar distraído:** sem `?size` a API responde `size:50`, ou seja
quem não passa nada já perde 200 títulos e R$ 297 mil por varredura.

#### Por que a perda escala com o tamanho da página

As 6 linhas envenenadas estão em **duas vizinhanças apertadas**. Na ordem em que a API devolve
(id crescente), elas ocupam as posições **1932, 1966** e **2842, 2846, 2856, 2893** de 3.973.

Quando a página cresce, acontecem duas coisas ao mesmo tempo, e elas não se compensam:

- o número de páginas contaminadas **cai devagar** (5, 4, 2, 2, 2), porque os venenos estão
  agrupados e páginas maiores engolem vários de uma vez;
- o custo de cada página contaminada **cresce rápido** (10, 50, 100, 200, 500).

O produto dos dois é a perda. De `size=10` para `size=500` o número de páginas mortas caiu por
2,5 e o tamanho subiu por 50: **a perda multiplicou por 20.**

Aumentar a página para "sincronizar mais rápido" é literalmente aumentar o rombo. É o inverso da
intuição de todo mundo, e é por isso que isso precisa estar escrito.

Detalhe que só aparece medindo: **`size=50` e `size=100` perdem exatamente os mesmos 200
títulos.** De 50 para 100 o número de páginas mortas caiu pela metade na mesma proporção em que
o tamanho dobrou. É o único degrau plano da tabela, e a escalada não é suave.

#### O filtro muda quais páginas morrem

Não é só o tamanho. `?pago=true&size=200` reempacota os mesmos 6 venenos em **3** páginas (8, 9
e 13) em vez de 2, e a perda sobe para **600** de 3.352. Qualquer filtro que mude a ordem ou a
densidade muda o estrago.

#### O que dá para salvar: `?pago=false` vem limpo

Como os 6 títulos envenenados estão todos com `Pago=1`, o recorte dos títulos **em aberto**
escapa inteiro. Varredura completa das 4 páginas de `?pago=false&size=200`: **621 de 621, perda
zero.**

| Recorte | Declarado | Recebido | Perda |
|---|---:|---:|---:|
| `/Pagar/` (sem filtro) | 3.973 | 3.573 | 400 |
| `/Pagar/?pago=true` | 3.352 | 2.752 | 600 |
| `/Pagar/?pago=false` | 621 | **621** | **0** |

Serve como paliativo para quem só precisa da posição de contas a pagar em aberto. **Não serve
para histórico, nem para conciliação, nem para DRE**, tudo isso mora no lado pago.

#### A forma por id também morre

Não existe rota de resgate. `/TTituloFinanceiroController/Pagar/{id}` nos 6 títulos: **os 6
devolvem `sucess:false`** com a mesma mensagem de float inválido.

Controle, para não confundir com rota quebrada: os vizinhos **29658, 29660 e 45177** respondem
`sucess:true` normalmente pela mesma rota.

Ou seja: **esses 6 títulos não existem para nenhum consumidor de API.** Não há paginação, filtro
ou by-id que os alcance. Só o SQL os vê.

#### O lado Receber está limpo, com a ressalva honesta

No SQL, o rateio do lado R não tem veneno: nas **59.627** linhas de rateio de títulos `R`,
`Percentual` vai de **0 a 100** e há **zero** valores negativos, contra 6 negativos nas 4.076
linhas do lado P.

Na API, foram amostradas **22 das 297 páginas** de `/Receber/?size=200`, espalhadas ao longo de
toda a faixa (1, 15, 30, 45, ..., 285, 296, 297): **22 de 22 vivas**, 4.204 registros, nenhuma
morta.

**As 297 páginas não foram varridas.** O que sustenta a conclusão é o SQL, que é censitário. A
amostra da API é corroboração, não prova. Se aparecer um rateio negativo do lado R, o `/Receber/`
passa a ter exatamente o mesmo defeito.

#### O teste que um sync precisa fazer

**O teste que o rascunho sugeria, checar `data[0].id != 0`, não pega isto.** Aquele teste foi
desenhado para a armadilha do *registro fantasma* (PedidoVenda, NotaFiscal e Inventario
devolvendo id 0 para id inexistente). Aqui não há registro fantasma: **não há `data` nenhuma
para indexar.**

O que acontece na prática com o código ingênuo:

```python
# 1) estoura, e pelo menos é barulhento
for t in resp["data"]:            # KeyError: 'data'

# 2) MUITO pior: passa calado, processa zero títulos e segue para a próxima página
for t in resp.get("data", []):    # [] -> o corpo do laço nunca roda
    ...

# 3) também não pega: não há data[0] para olhar
if resp.get("data") and resp["data"][0]["idTituloFinanceiro"] != 0:
```

O padrão 2 é o que mata: a varredura termina "com sucesso", sem exceção, sem log, com 400
títulos a menos. É o mesmo erro de sempre, o default seguro escondendo o defeito.

**Os três testes que pegam, em ordem de custo:**

1. **`sucess` precisa ser `true`, e a chave tem o erro de grafia.** `resp.get("success")` devolve
   `None` para sempre e nunca acusa nada. Tem que ser `resp.get("sucess") is not True`, com
   falha dura que aborta o ciclo.
2. **`data` ausente é erro, não lista vazia.** Proibir `resp.get("data", [])` no código de sync.
   Página sem a chave `data` é página morta, não página vazia.
3. **Reconciliar a contagem no fim da varredura, e este é o teste soberano.** Guardar
   `page.totalRecords` da primeira página viva e comparar com a soma de `len(data)` de todas as
   páginas. Divergiu, o ciclo não commita.

   Esse teste funciona porque **`totalRecords` é confiável**: bate com o SQL até a unidade nos
   dois lados (Pagar API 3.973 igual a SQL 3.973, Receber API 59.204 igual a SQL 59.204). A API
   sabe quantos registros existem, ela só não consegue entregá-los, e continua declarando o
   número certo enquanto entrega a menos. É essa contradição que o sync tem que explorar.

Um quarto teste, mais barato ainda, para o monitor: **página morta não pode ser confundida com
fim de dados.** Como não vem `page`, um laço que decida continuar lendo `page.number <
page.totalPages` da resposta *atual* para na primeira página morta e não avisa. O `totalPages`
tem que vir da primeira página viva e ser fixado para o ciclo inteiro.

#### O conserto de verdade

O sync não conserta isso, só detecta. O conserto é no banco: corrigir as 6 linhas de
`TituloFinanceiroRateio` (que valem R$ 0,00 e pertencem a títulos de valor zero) e colocar um
`CHECK` em `Percentual`. Enquanto isso não acontece, **qualquer integração com `/Pagar/` está
perdendo dados em silêncio, e perdendo mais quanto maior a página.** Ver incidente 2.

### 4.6 Onde a data de pagamento vive de verdade

`TituloFinanceiroBaixa.DataBaixa`. `TituloFinanceiro` **não tem** coluna `DataPagamento`.

Há um atalho pronto: **`vwTituloFinanceiro.DataPagto`**, coluna derivada. Confirmado na janela A
em **39.951 de 39.951** títulos com baixa que `DataPagto = MAX(DataBaixa)` (contra `DataBanco`
bate só em 33.282). Na view: 23.155 sem `DataPagto`, 7 com `Pago=1` e `DataPagto` nula, 0 com
`Pago=0` e `DataPagto` preenchida.

Existe também `DataBanco` (data de crédito), que **diverge da `DataBaixa` em 8.344 linhas**
(janela A).

**Armadilha de data:** há baixas com `DataBaixa` no futuro. Na janela A eram 2.176, até
28/04/2027, quase todas 'CARTÃO DE CRÉDITO - SITE' (R$ 91.949,28). Na janela B, às 19:24 BRT,
são **2.242**, e o máximo se estendeu para **08/05/2027**. São parcelas baixadas
antecipadamente, com a data de liquidação. **Quem somar por `DataBaixa` sem cortar em hoje conta
dinheiro que ainda não entrou.** O `DataAlt` da baixa nunca é futuro (0 linhas), e por isso ele
é o campo certo para perguntas sobre quando o sistema registrou o pagamento.

### 4.7 Conciliação bancária: não existe conciliação para conciliar

Três medições independentes, janela A.

1. **`ContaBancariaLancamento` não tem coluna `idTituloFinanceiro`.** Varredura de `sys.columns`
   por `'%Titulo%'` nas 190 tabelas: só aparece na família `TituloFinanceiro*` e em
   `Produto.Titulo` e `SubTitulo`.
2. **O único join possível, `idExtratoBanco`, dá ZERO.** 13.321 baixas carregam
   `idExtratoBanco`, 9.279 lançamentos carregam `idExtratoBanco`, e a interseção é **0**
   (testada com e sem TRIM). As duas pontas consomem a mesma sequência do OFX e nunca a mesma
   linha: no Santander em 05/08 os lançamentos vão até ...1843057 e a baixa do mesmo dia usa
   ...1843059.
3. **Os dois bits de conciliação são decorativos.** `TituloFinanceiroBaixa.Conciliado=1` em
   **100%** das baixas, `TipoBaixa=1` em 100%, `ContaBancariaLancamento.Conciliado=1` em 9.317
   de 9.318. **Ninguém nunca conciliou nada: o valor já nasce marcado.**

**As contas não são contas bancárias.** Das 12, as que foram inspecionadas (7 a 12) têm
`BancoNumero='000'` e `BancoDescricao='NAO E UM BANCO'`: CONTAMAX, Mercado Pago, Vindi, Pagarme,
APPMAX, CC 8715. Saldo calculado na janela A via `vwMovimentoContaBancaria`:

| Conta | Saldo (06/08/2026, janela A) |
|---|---:|
| CONTA CAIXA | R$ 618.388,18 |
| Santander | R$ 68.799,62 |
| Stone | R$ 8.016,59 |
| CC 9094 | −R$ 7.804,38 |
| CC 6277 | R$ 0,00 |
| CC 7369 | −R$ 0,04 |
| CONTAMAX | R$ 1.002,53 |
| Mercado Pago | R$ 99.165,65 |
| **Vindi** | **R$ 1.597.465,73** |
| Pagarme | R$ 6.070,85 |
| APPMAX | R$ 8.752,00 |
| CC 8715 | R$ 30.000,00 |

O saldo da Vindi de R$ 1,6 mi **não é saldo real**: é acumulado histórico, porque o repasse do
gateway para o banco nunca é lançado. **Nenhum desses números foi conferido contra extrato
bancário.**

E há um problema anterior a tudo isso: 40,5% das baixas nem chegam nessa view, porque entram sem
conta bancária. Isso não é um buraco sem causa. A causa está medida na próxima seção.

### 4.8 `ContaBancariaFormaPagto`: duas linhas de configuração seguram R$ 2,6 mi

Medido no SQL Server em 06/08/2026, entre **19:47 e 19:55 BRT**.

#### 2 linhas para 17 formas de pagamento

`ContaBancariaFormaPagto` é o de-para que diz, para cada forma de pagamento, em qual conta
bancária o dinheiro cai. A tabela tem **4 colunas** (`idContaBancariaFormaPagto`,
`ContaBancaria`, `FormaPagto`, `Empresa`) e, hoje, **2 linhas**:

| id | Forma de pagamento | Conta bancária |
|---:|---|---|
| 3 | 10, PIX SITE | 9, Vindi |
| 4 | 11, BOLETO SANTANDER | 2, Santander |

`FormaPagto` tem **17 linhas**. `ContaBancaria` tem **12**. O de-para cobre **2 de 17 formas,
ou 12%**.

A identity está em `last_value` igual a 4: **só 4 linhas foram criadas na vida da tabela e 2
foram apagadas.** A tabela existe desde 07/04/2021.

Não há rota de API:
`/TContaBancariaFormaPagtoController/ContaBancariaFormaPagto` devolve HTTP 500.

#### Onde o dinheiro cai fora da conta

Todas as 41.693 baixas, por forma de pagamento, às 19:47 BRT. "Sem conta" quer dizer
`TituloFinanceiroBaixa.ContaBancaria` nula, e é nula mesmo, não zero: das 16.885, **16.885 são
NULL e nenhuma é 0**.

| Cód | Forma de pagamento | De-para? | Baixas | Sem conta | % sem conta | Valor total | **Valor sem conta** |
|---:|---|:---:|---:|---:|---:|---:|---:|
| 3 | CARTÃO DE CRÉDITO | não | 18.883 | 9.287 | 49,2% | R$ 2.967.368,54 | **R$ 1.334.921,93** |
| 12 | PIX | não | 3.632 | 2.134 | 58,8% | R$ 3.238.136,82 | **R$ 871.463,54** |
| 14 | CARTÃO DE CRÉDITO - SITE | não | 4.451 | 4.451 | **100,0%** | R$ 220.603,07 | **R$ 220.603,07** |
| 9 | BOLETO SITE | não | 415 | 415 | **100,0%** | R$ 74.955,66 | **R$ 74.955,66** |
| 10 | PIX SITE | **sim** | 12.077 | 293 | **2,4%** | R$ 1.551.831,41 | R$ 39.950,12 |
| 2 | DINHEIRO | não | 278 | 277 | 99,6% | R$ 24.214,64 | R$ 23.526,94 |
| 1 | BOLETO | não | 1.111 | 16 | 1,4% | R$ 3.644.493,52 | R$ 19.921,21 |
| 7 | TRANSFERENCIA | não | 19 | 3 | 15,8% | R$ 10.746,83 | R$ 10.683,29 |
| 5 | DEPÓSITO EM CONTA | não | 19 | 3 | 15,8% | R$ 8.849,59 | R$ 8.448,50 |
| 4 | CARTÃO DE DÉBITO | não | 13 | 6 | 46,2% | R$ 1.948,16 | R$ 1.458,48 |
| 11 | BOLETO SANTANDER | **sim** | 16 | 0 | **0,0%** | R$ 33.017,84 | R$ 0,00 |
| 13 | MERCADO PAGO | não | 737 | 0 | 0,0% | R$ 99.165,65 | R$ 0,00 |
| 17 | DEBITO EM CONTA | não | 34 | 0 | 0,0% | R$ 542,62 | R$ 0,00 |
| 8 | PIX (QR CODE) | não | 8 | 0 | 0,0% | R$ 39.969,78 | R$ 0,00 |
| | **Total** | | **41.693** | **16.885** | **40,5%** | **R$ 11.915.844,14** | **R$ 2.605.932,74** |

Três das 17 formas nunca foram usadas em baixa: CHEQUE, CARTÃO DE DÉBITO - SITE e CARTÃO DE
CRÉDITO - ELO.

**Soma das baixas sem conta bancária: R$ 2.605.932,74 em 16.885 baixas, 21,9% de todo o dinheiro
já baixado no sistema.** O razão de baixas começa em 01/09/2025.

Consolidando pelas duas linhas do de-para:

| Grupo | Baixas | Sem conta | % | Valor sem conta |
|---|---:|---:|---:|---:|
| Formas **com** de-para (PIX SITE, BOLETO SANTANDER) | 12.093 | 293 | **2,4%** | R$ 39.950,12 |
| Formas **sem** de-para (as outras 12) | 29.600 | 16.592 | **56,1%** | **R$ 2.565.982,62** |

#### A prova de que é o de-para, e não coincidência

O PIX SITE é um experimento natural que o próprio banco já rodou. Baixas de PIX SITE, dia a dia,
no primeiro mês:

| Janela (por `DataBaixa`) | Baixas | Sem conta | Com conta |
|---|---:|---:|---:|
| Antes de 19/09/2025 | 296 | **293** (99,0%) | 3 |
| De 19/09/2025 em diante | 11.781 | **0** | **11.781** (100%) |
| **Total** | **12.077** | 293 | 11.784 |

O corte é seco em **19/09/2025**. Antes dessa data, 99% do PIX SITE caía sem conta bancária.
Depois, 100% cai na Vindi, que é exatamente o que a linha de de-para manda. **Uma linha de
configuração transformou 99% de perda em 0%, e desde então 11.781 baixas entraram certas sem
ninguém digitar nada.**

> Medido em 06/08/2026 21:10 BRT, por um critério único (`DataBaixa`). A versão anterior desta
> tabela misturava dois critérios de data e somava 12.080, contando 3 baixas duas vezes — o total
> real de PIX SITE é 12.077.

E o BOLETO SANTANDER, a outra linha do de-para, está em **0 sem conta em 16 baixas**.

**Ressalva honesta:** o de-para não é o único caminho. MERCADO PAGO (737 baixas, 100% na conta
8), DEBITO EM CONTA (34), PIX QR CODE (8) e BOLETO (1.111, 98,6% com conta) acertam a conta
**sem** linha de de-para, então deve haver outra rota, provavelmente no código da integração ou
no preenchimento manual da tela de baixa. **Essa outra rota não foi identificada.** O que está
provado é o contrário, e basta para a decisão: onde falta o de-para e a baixa é automática, a
conta some. CARTÃO DE CRÉDITO - SITE e BOLETO SITE estão em 100% sem conta, e são os dois irmãos
do PIX SITE no mesmo checkout.

#### O que isso quebra

As 16.885 baixas sem conta **desaparecem do único lugar de onde se tira saldo por conta**.
`vwMovimentoContaBancaria` tem 35.070 linhas, e o bloco de baixa financeira (`Origem='BF'`) tem
exatamente **24.808**, que é 41.693 menos 16.885, na bala. **A view não perde as baixas por
acaso: ela só enxerga as que têm conta.**

E não é passado resolvido. Baixas sem conta por mês em 2026:

| Mês | Baixas | Sem conta | % | Valor sem conta |
|---|---:|---:|---:|---:|
| jan/2026 | 6.451 | 780 | 12,1% | R$ 234.141,04 |
| fev/2026 | 6.537 | 1.164 | 17,8% | R$ 184.236,43 |
| mar/2026 | 2.645 | 1.456 | 55,0% | R$ 229.599,32 |
| abr/2026 | 2.184 | 922 | 42,2% | R$ 229.197,98 |
| mai/2026 | 3.100 | 1.442 | 46,5% | R$ 198.722,60 |
| jun/2026 | 3.158 | 1.622 | 51,4% | R$ 163.521,54 |
| jul/2026 | 3.720 | 2.156 | 58,0% | R$ 274.705,71 |
| ago/2026 (até o dia 06) | 706 | 451 | 63,9% | R$ 47.770,25 |

**Entre R$ 163 mil e R$ 275 mil por mês entram no ERP sem conta bancária, e a proporção está
piorando: 12,1% em janeiro, 63,9% na primeira semana de agosto.**

Quatro linhas de configuração, para CARTÃO DE CRÉDITO (3), PIX (12), CARTÃO DE CRÉDITO - SITE
(14) e BOLETO SITE (9), cobrem **R$ 2.501.944,20 dos R$ 2.605.932,74, ou 96%** do buraco. Qual
conta cada uma deve apontar é decisão de negócio, não medição minha. O que o banco mostra é para
onde vão as baixas **que já têm conta** na mesma forma: CARTÃO DE CRÉDITO se espalha entre CONTA
CAIXA (7.562), Vindi (1.156), CC 9094 (511), CC 7369 (215), Pagarme (75) e CC 6277 (74). PIX vai
para Santander (1.444) e Stone (54). CARTÃO DE CRÉDITO - SITE e BOLETO SITE **não têm um único
caso com conta** para servir de referência.

#### `CobrancaConfiguracao` e `ContasPagarConfiguracao`: uma linha cada, tudo zerado

**`CobrancaConfiguracao`, 1 linha.** Tabela criada em 18/05/2021, linha alterada por 'master' em
15/09/2025.

| Parâmetro | Valor |
|---|---|
| Descrição | COBRANÇA - SANTANDER |
| Conta bancária | 2 (Santander), carteira 101, forma de pagamento 11 |
| **Juros** | **0** |
| **Multa** | **0** |
| **Dias de protesto** | **0** |
| Desconto | NULL |
| Dias para baixa | 0 |
| Inativo | não |

**Juros zero, multa zero, protesto zero.** O boleto sai do Literarius sem instrução de encargo e
sem instrução de protesto.

O efeito aparece no razão: de **41.693 baixas, 4 têm juros** (R$ 325,51 no total) e **4 têm
multa** (R$ 991,40). O histórico de baixa vai de 01/09/2025 até hoje: em onze meses de operação
o sistema cobrou **R$ 1.316,91 de encargo de atraso**.

A configuração também mal é usada: `idCobrancaConfig` está preenchido em **24 de 59.204**
títulos a receber (medido 06/08/2026 20:32 BRT; a versão anterior deste documento trazia 59.180,
que é a contagem dos títulos SEM a configuração, não o total). `Boleto` aparece em 1.108 títulos e
`idRemessa` em 18, mas esses dois são contagens dos **dois lados**; só do lado a receber são 43 e 11. Registro de boleto em
banco, na prática, não acontece.

**`ContasPagarConfiguracao`, 1 linha.** Tabela criada em 29/08/2025, linha por 'master' em
15/09/2025: "PAGFOR - SANTANDER", conta bancária 2, layout de forma de pagamento preenchido,
convênio preenchido (**valor não reproduzido aqui, por ser dado bancário identificador**). Mas
`NossoNumero`, `UltimaRemessa` e `Sequencia` estão **NULL nos três**: a remessa de pagamento
nunca rodou.

#### Cruzando com o vencido em aberto

Títulos vencidos e não baixados, medidos às **19:52 BRT** (critério: `Pago=0` e
`Vencimento < hoje`):

| Lado | Títulos | Valor | Mais antigo | Média de atraso |
|---|---:|---:|---|---:|
| A receber | **21.263** | **R$ 2.198.726,53** | 30/08/2025 | 151 dias |
| A pagar | 142 | R$ 447.935,96 | 27/08/2025 | 287 dias |

**Divergência com a janela A, declarada:** na tarde o lado a pagar apareceu como 302 títulos e
R$ 788.582,11. Às 19:52 dá 142 e R$ 447.935,96. Foram testados quatro critérios diferentes
(`Pago=0`, `ValorPago=0`, sem baixa, `ValorPago<Valor`) e todos ficam entre 142 e 149 títulos:
**não foi possível reproduzir os 302 com critério nenhum.** Ou houve pagamento em lote entre as
duas medições, ou o número da tarde usou um filtro que não foi identificado. **Use o número das
19:52.** O lado a receber bate exatamente nas duas medições.

Envelhecimento do lado a receber (19:52 BRT):

| Faixa de atraso | Títulos | Valor |
|---|---:|---:|
| 1 a 30 dias | 1.487 | R$ 138.554,73 |
| 31 a 60 dias | 1.888 | R$ 175.347,65 |
| 61 a 90 dias | 2.714 | R$ 242.086,50 |
| 91 a 180 dias | 7.294 | R$ 677.249,22 |
| **mais de 180 dias** | **7.880** | **R$ 965.488,43** |

**74% do valor vencido já passou de 90 dias.** Por forma de pagamento:

| Forma | Títulos vencidos | Valor |
|---|---:|---:|
| CARTÃO DE CRÉDITO | 17.658 | R$ 1.296.317,03 |
| BOLETO | 293 | R$ 452.421,33 |
| MERCADO PAGO | 3.275 | R$ 430.319,13 |
| BOLETO SANTANDER | 30 | R$ 16.527,63 |
| PIX | 6 | R$ 3.068,41 |
| CHEQUE | 1 | R$ 73,00 |

O cruzamento fecha o círculo: **R$ 468.948,96 estão vencidos em boleto, que é o único instrumento
que aceita juros, multa e protesto, e a única configuração de cobrança do sistema está com os
três em zero.** Nada é cobrado de quem atrasa, nada é protestado, e 7.880 títulos passaram de
seis meses de atraso sem que o ERP emitisse um encargo.

Do outro lado, R$ 1.296.317,03 vencidos em CARTÃO DE CRÉDITO, em 17.658 títulos. É a mesma forma
que aparece em 4.20 com 46,5% de taxa de baixa e é a maior linha da tabela de baixa sem conta
bancária (R$ 1.334.921,93). **Não é inadimplência de cliente, é baixa que ninguém deu.**

#### O que dá para consertar sem código

| Ação | Onde | Efeito medido |
|---|---|---|
| 4 linhas de de-para (formas 3, 12, 14 e 9) | tela de conta bancária por forma de pagamento | fecha 96% do R$ 2.605.932,74 daqui para frente, pelo padrão que o PIX SITE provou em 19/09/2025 |
| Juros, multa e dias de protesto na `CobrancaConfiguracao` | tela de configuração de cobrança | passa a cobrar encargo sobre R$ 468.948,96 vencidos em boleto |
| Ligar `GeraFinanceiro` ou lançar `CreditoParceiro` na devolução | processo, não configuração | hoje 221 notas de devolução, R$ 2.234.188,08, não tocam o financeiro. Ver 4.18 |

As duas primeiras são digitação. **A terceira é decisão de processo, e é a única das três que
precisa de gente pensando antes de digitar.**

Ressalva: **não foi verificado se a tela do ERP permite ao usuário criar linha em
`ContaBancariaFormaPagto` e preencher os encargos em `CobrancaConfiguracao`.** O que foi medido
é o banco. A recomendação de "conserto por digitação" pressupõe que essas telas existem e estão
liberadas para o perfil de quem vai fazer.

### 4.9 Plano de contas e centro de resultado: o de-para não tem porta

`rateios[]` vem populado e traz **só o código numérico**. As duas tabelas de tradução não têm
rota: `/TPlanoContaController/` e `/TCentroResultadoController/` devolvem 500. Medições da
janela A.

- **`PlanoConta`**: 117 contas em 3 níveis (3 raízes no nível 1, 2 no nível 2, 112 folhas no
  nível 3), 92 efetivamente usadas em rateio. Códigos mais usados: 2 igual a VENDA DE LIVROS
  (57.572 usos), 4 igual a VENDA DE E-BOOK, 20 igual a Materiais Para Revenda, 32 igual a
  Direitos Autorais.
- **`CentroResultado`**: 13. 1=Administrativo, 2=Financeiro, 3=CPC Offline, 4=CPC Online,
  5=Expedição, 6=Livraria, 7=Evento, 8=Fiscal, 9=Editorial, 10=Impressões (CMV),
  11=Transferências entre contas, 12=Investimento, 13=Receita de vendas.

**O plano de contas não sabe o que é receita e o que é despesa.** `GrupoDRE=0` em 100% das 117
contas, `TipoCategoria='A'` em 100%, `Grupo=NULL` em 100%. A hierarquia é inconsistente:
"Lanches e Refeições Comercial" é raiz de nível 1 no mesmo patamar de "DESPESAS OPERACIONAIS".

**O lado da receita não tem analítico nenhum:** **99,6% dos recebimentos (R$ 5.199.301,04 de
R$ 5.220.652) caem no CentroResultado 1, "Administrativo"**, enquanto o CR 13, "Receita de
vendas", que existe exatamente para isso, recebeu **R$ 2.454,52**.

**Sem acesso ao SQL, o rateio da API é um número sem significado.**

### 4.10 Faturamento: a linha que faltava no documento

Tudo desta subseção até 4.16 foi medido no SQL Server em 06/08/2026, entre **19:35 e 19:53
BRT** (relógio do servidor: `GETDATE()` igual a `2026-08-06 19:53:00`). Nenhum número veio da
API, salvo onde está dito. Os totais de nota subiram durante a própria sondagem, como o resto do
documento: às 16:50 eram 42.829 notas, às 19:53 são **42.888**.

**A receita mora em `NotaFiscal.TotalNota`, e só ali.** Não há tabela de faturamento, não há view
de receita reconhecida, e o título financeiro não serve de proxy: ele nasce da nota
(`Origem=1`), então usar título como receita conta parcelamento, não venda.

**A primeira armadilha é escolher a coluna errada.** `TotalProduto` **não é receita**, é o preço
de tabela antes do desconto. A identidade abaixo bate em **42.887 das 42.888 notas** (1 exceção,
não investigada):

```
TotalNota = TotalProduto − Desconto + ValorFrete + OutrasDespesas
```

Nas notas de venda válidas o desconto é grande demais para ser ignorado: **R$ 3.491.499,70 sobre
R$ 10.431.485,33 de preço de tabela**. Quem somar `TotalProduto` achando que é faturamento erra
para cima em **40%**.

**Números de topo** (notas de venda, tipos 1 e 13, não canceladas):

| Medida | Valor |
|---|---:|
| Notas | **41.955** |
| **Faturado (`SUM(TotalNota)`)** | **R$ 7.451.618,11** |
| Preço de tabela (`TotalProduto`) | R$ 10.431.485,33 |
| Desconto concedido | R$ 3.491.499,70 (33,5%) |
| Frete cobrado do cliente | R$ 511.631,86 |
| Itens de nota (universo, todos os tipos) | 95.977 |
| Notas de venda canceladas (fora de tudo acima) | 156, R$ 136.297,04 |

O frete de R$ 511.631,86 está **dentro** do faturado. Quem quiser receita de mercadoria pura tem
que tirá-lo.

**Regime.** Isto é faturado por emissão (`DataEmissao`), não recebido. A DRE de caixa de 4.17 é
outro regime e outra tabela (`TituloFinanceiroBaixa`). **Faturado e recebido não foram
reconciliados**, é trabalho em aberto, e as duas séries não são comparáveis linha a linha.

### 4.11 Notas por tipo

`TipoNota` tem 15 códigos e **14 têm movimento** (o 9, Transferência, tem 0 notas). Sem essa
tabela não se separa venda de remessa, doação e consignação dentro das 42.888 notas, e ela **não
tem rota na API** (`/TNotaFiscalController/TipoNota` dá 500, ver 3.11).

Valores da coluna da direita consideram **só as notas não canceladas**.

| Cód | Tipo | Sentido | Notas | Canceladas | Valor (não canceladas) |
|---:|---|:---:|---:|---:|---:|
| 1 | **Venda** | S | 30.562 | 98 | **R$ 5.900.870,77** |
| 13 | **Venda do PDV** | S | 11.549 | 58 | **R$ 1.550.747,34** |
| 8 | Doação | A | 324 | 5 | R$ 115.951,62 |
| 5 | Devolução Simbólica | A | 120 | 4 | R$ 701.110,97 |
| 2 | Remessa de Consignação | S | 77 | 0 | R$ 394.061,69 |
| 11 | Diversos | A | 63 | 0 | R$ 271.360,58 |
| 6 | Devolução Venda | E | 54 | 1 | R$ 30.142,46 |
| 4 | Devolução de Consignação | A | 44 | 11 | R$ 883.579,76 |
| 3 | Acerto de Consignação | A | 41 | 0 | R$ 113.684,98 |
| 12 | Recebimento em Consignação | E | 29 | 3 | R$ 980.405,97 |
| 14 | Remessa para Feira | S | 17 | 1 | R$ 281.308,43 |
| 15 | Retorno de Feira | E | 4 | 0 | R$ 125.703,15 |
| 7 | Devolução Compra | S | 3 | 1 | R$ 10.624,91 |
| 10 | Compra | E | 1 | 0 | R$ 2.561,25 |
| 9 | Transferência | A | **0** | 0 | n/d |

**Só os tipos 1 e 13 são receita.** Os outros movimentam mercadoria com valor fiscal e nenhum
deles é venda: consignação (tipos 2, 3, 4 e 12) soma R$ 2.371.732,40 de mercadoria que circula
sem receita reconhecida, e **doação são 324 notas e R$ 115.951,62 de estoque que sai de graça**.
Isso é custo, não receita, e some de qualquer DRE que filtre só por "nota emitida".

**Cancelamento tem um domínio limpo:** `Cancelada=1` equivale a `NFeStatus=3`, em **182 notas,
sem uma exceção** no universo. Não há terceiro estado.

**As 3 primeiras notas do ERP são teste e estão canceladas** (ids 1, 2, 3, números 1, 2, 3, de
25 a 27/08/2025, R$ 3,90, R$ 3,90 e R$ 77,90). A justificativa gravada na nota 1 é literalmente
`"cancelamento para teste de emissão do VIPP"`. Por isso a série mensal começa em setembro:
**agosto/2025 não tem uma única nota de venda válida.**

### 4.12 Série mensal de faturamento (12 meses)

Tipos 1 e 13, não canceladas, por `DataEmissao`. O agrupamento foi feito dentro do SQL, então
nenhuma conversão de fuso do cliente entra nestes números.

| Mês | Notas | Venda (NF-e) | PDV (NFC-e) | **Total faturado** | PDV % |
|---|---:|---:|---:|---:|---:|
| set/2025 | 2.623 | R$ 309.509,25 | R$ 114.413,88 | **R$ 423.923,13** | 27,0% |
| out/2025 | 3.549 | R$ 515.670,85 | R$ 115.600,45 | **R$ 631.271,30** | 18,3% |
| nov/2025 | 4.294 | R$ 577.966,09 | R$ 298.302,28 | **R$ 876.268,37** | 34,0% |
| dez/2025 | 5.009 | R$ 985.119,72 | R$ 136.814,69 | **R$ 1.121.934,41** | 12,2% |
| jan/2026 | 4.247 | R$ 739.346,78 | R$ 91.139,32 | **R$ 830.486,10** | 11,0% |
| fev/2026 | 3.454 | R$ 519.995,99 | R$ 122.925,36 | **R$ 642.921,35** | 19,1% |
| mar/2026 | 3.559 | R$ 396.388,54 | R$ 195.371,44 | **R$ 591.759,98** | 33,0% |
| abr/2026 | 3.157 | R$ 542.440,37 | R$ 87.712,76 | **R$ 630.153,13** | 13,9% |
| mai/2026 | 4.283 | R$ 446.428,55 | R$ 166.949,72 | **R$ 613.378,27** | 27,2% |
| jun/2026 | 3.485 | R$ 373.798,55 | R$ 94.684,75 | **R$ 468.483,30** | 20,2% |
| jul/2026 | 3.675 | R$ 435.818,11 | R$ 105.553,21 | **R$ 541.371,32** | 19,5% |
| ago/2026 (6 dias) | 620 | R$ 58.387,99 | R$ 21.279,48 | **R$ 79.667,47** | 26,7% |
| **Total** | **41.955** | **R$ 5.900.870,77** | **R$ 1.550.747,34** | **R$ 7.451.618,11** | **20,8%** |

A soma dos 12 meses fecha com o total do universo **ao centavo**: não há nota de venda válida
fora desta janela.

**Média dos 11 meses fechados: R$ 670.177,33 por mês.** Pico em dez/2025 (R$ 1.121.934,41), e o
menor mês fechado de 2026 é junho (R$ 468.483,30).

**A tendência é de queda:** os 6 primeiros meses fechados (set/2025 a fev/2026) somam
R$ 4.526.804,65, média de **R$ 754.467,44 por mês**. Os 5 seguintes (mar a jul/2026) somam
R$ 2.845.145,99, média de **R$ 569.029,20 por mês**, ou **24,6% a menos**. A causa não foi
investigada.

**Ressalva de janela, e ela é séria:** o faturamento começa em **set/2025**. Há **11 meses
fechados e nenhum par ano contra ano**. Qualquer sazonalidade aqui, o pico de dezembro por
exemplo, é de uma observação só. Isso reforça o risco 29.

### 4.13 O PDV: um canal de loja física que o documento inteiro não mencionava

**A Venda do PDV (tipo 13) é 20,8% do faturamento e 27,4% das notas**: R$ 1.550.747,34 em 11.491
notas, todas **NFC-e (modelo 65)**, em 10 séries fiscais. A NF-e da venda normal é modelo 55.

| | Venda (tipo 1) | Venda do PDV (tipo 13) |
|---|---:|---:|
| Notas válidas | 30.464 | 11.491 |
| Faturado | R$ 5.900.870,77 | R$ 1.550.747,34 |
| Participação no valor | 79,2% | **20,8%** |
| Participação nas notas | 72,6% | **27,4%** |
| Ticket médio | R$ 193,70 | **R$ 134,95** |
| Modelo fiscal | 55 (NF-e), 30.171 notas | 65 (NFC-e), 11.491 notas |
| Desconto sobre tabela | 37,8% | **12,6%** |
| Vínculo com pedido | 28.510 de 30.464 | **0 de 11.491** |

**O achado estrutural: o PDV não passa por pedido.** `idPedidoVenda` é nulo ou zero em **11.491
de 11.491** notas de PDV. Consequência direta para o resto do documento:

- **A loja física é invisível em qualquer contagem baseada em `PedidoVenda`.** O canal LIVRARIA
  tem **0 pedidos** e **11.293 notas, R$ 1.535.169,43**. Por isso ele não aparece na lista de
  canais de 5.5, que é contada por pedido, nem nos 29.387 pedidos de 3.4.
- **26,65% do faturamento, R$ 1.986.085,62 em 13.445 notas, nunca passou por um pedido.** Os
  outros 73,35% (R$ 5.465.532,49, 28.510 notas) têm pedido.
- **A porta `IntegraLojaURL` de 6.5 não alcança esse dinheiro.** Ela alimenta pedido, e o PDV não
  tem pedido. Um plano de integração desenhado em cima de pedido cobre, no máximo, três quartos
  da receita.

**Faturamento por canal** (tipos 1 e 13, não canceladas). O desconto varia de 0,2% a 61,2%
conforme o canal, e média nenhuma descreve a operação:

| Canal | Notas | Preço de tabela | Desc. | **Faturado** | Ticket |
|---|---:|---:|---:|---:|---:|
| SITE | 17.727 | R$ 3.182.129,64 | 17,1% | **R$ 2.998.120,93** | R$ 169,13 |
| **ATACADO** | 1.150 | R$ 4.168.139,79 | **61,2%** | **R$ 1.693.165,18** | **R$ 1.472,32** |
| **LIVRARIA (PDV)** | 11.293 | R$ 1.748.630,96 | 12,2% | **R$ 1.535.169,43** | R$ 135,94 |
| MERCADO LIVRE - MP | 5.465 | R$ 753.211,72 | 18,1% | R$ 688.826,33 | R$ 126,04 |
| AMAZON - MP | 4.426 | R$ 345.655,10 | 0,5% | R$ 347.407,96 | R$ 78,49 |
| MERCADO LIVRE - FULL | 1.241 | R$ 101.563,95 | 0,3% | R$ 102.611,73 | R$ 82,68 |
| EVENTO | 62 | R$ 51.816,10 | 43,5% | R$ 29.295,21 | R$ 472,50 |
| (sem canal) | 230 | R$ 35.240,05 | 32,8% | R$ 23.683,25 | R$ 102,97 |
| SHOWROOM | 206 | R$ 31.950,27 | 37,2% | R$ 20.064,95 | R$ 97,40 |
| AMAZON - FBA | 155 | R$ 13.147,75 | 0,2% | R$ 13.273,14 | R$ 85,63 |

**ATACADO é o segundo maior canal em receita com 1.150 notas**: 2,7% do volume, 22,7% do
dinheiro, e ticket quase 9 vezes o do site. Nos canais Amazon e ML-FULL o desconto aparece
negativo porque o frete cobrado supera o abatimento.

**Cobertura de classificação:** o PDV vem melhor classificado que a venda normal. Canal
preenchido em 11.491 de 11.491 notas de PDV, contra 230 sem canal na venda. Vendedor faltando em
105 notas de PDV e em 1 nota de venda.

**Faturamento do PDV contra fechamento de caixa.** `ControleCaixa` tem **633 caixas fechados**
(nenhum em aberto), 6 pontos de caixa, de 01/09/2025 a 06/08/2026, somando **R$ 1.500.190,82** de
`ValorFechamento` contra R$ 1.550.747,34 faturados no PDV, uma diferença de R$ 50.556,52 (3,3%).
**Não foi verificado se essas duas pontas deveriam bater**: podem ter recorte de turno e de
forma de pagamento diferentes. `ValorAbertura` é 0 nos 633.

**O PDV também gera financeiro direito:** as 11.491 notas de PDV geraram título em **100%** dos
casos, 0 sem título. Do lado da venda normal, **1.436 notas válidas, R$ 187.252,47, não têm
título nenhum**.

### 4.14 As tabelas do módulo PDV

Contagens exatas por `COUNT(*)`, não por `sys.partitions`, que 10.2 mostrou ser estimativa.

| Tabela | Linhas | O que tem dentro |
|---|---:|---|
| `ControleCaixa` | **633** | Abertura e fechamento de caixa, R$ 1.500.190,82, 6 pontos de caixa |
| `ControleCaixaItens` | **2.301** | Itens do fechamento |
| `ControleCaixaLancamento` | **0** | Sangria e suprimento nunca usados |
| `ConfiguracaoPdv` | **2** | Config do app de PDV. **Quase toda nula**, ver abaixo |
| `FormaPagtoPdv` | **4** | De-para de forma de pagamento. **O lado Literarius está nulo nas 4** |
| `UsuariosPdv` | **0** | Nenhum operador cadastrado |
| `PosControleConfiguracao` | **14** | Config de PDV de **feira**, com credencial em texto (ver abaixo) |
| `PosControleProduto` | **4.741** | Produtos habilitados no PDV de feira |

**Duas tabelas de configuração do PDV estão praticamente vazias, e o PDV fatura R$ 1,55 mi assim
mesmo:**

- **`FormaPagtoPdv` é um de-para pela metade.** As 4 linhas mapeiam DINHEIRO, PIX, CARTÃO DE
  CRÉDITO e CARTÃO DE DÉBITO do app, e as colunas `FormaPagtoLiterarius` e
  `DescFormaPagtoLiterarius` estão **NULL nas 4**. O lado do ERP nunca foi preenchido.
- **`ConfiguracaoPdv` tem 2 linhas com `OperacaoFiscal`, `Consumidor`, `PlanoConta`,
  `SetorEstoque`, `CanalVenda` e `Vendedor` todos NULL.** Só `ControlaCaixa` ('S' e 'N') e um
  identificador de instância estão preenchidos.

É o mesmo padrão de tabela de configuração vazia com a máquina rodando já visto em 4.8:
**não dá para saber, por essas tabelas, como a forma de pagamento do PDV vira forma de pagamento
do ERP.** O caminho real dessa informação não foi descoberto.

**Achado de segurança, da mesma classe do risco 26:** `PosControleConfiguracao` tem as colunas
**`SenhaPosControle` e `ChaveAPIPosControle`**, legíveis por qualquer conta com SELECT, inclusive
a somente leitura `acessoExterno`. **Os valores dessas colunas não foram lidos e não são
reproduzidos aqui.** Some-se ao inventário de segredos em texto do banco (`ConfiguracaoGeral`,
`Usuario.Senha`).

### 4.15 Impostos: zero em todo o universo, e é intencional

**Todas as colunas de imposto somam exatamente zero.** Quem for montar DRE completa vai procurar
a linha de imposto sobre venda e não vai encontrar. Isto aqui é a resposta.

No cabeçalho, sobre as 42.888 notas:

| Coluna | Soma |
|---|---:|
| `TotalImpostos` | **0** |
| `IcmsValor` e `IcmsBase` | **0 e 0** |
| `IcmsStValor` | **0** |
| `PisValor` | **0** |
| `CofinsValor` | **0** |
| `IpiValor` | **0** |
| `IiValor` | **0** |
| `CBSValor`, `IBSUFValor`, `IBSMUNValor`, `IBSCBSBase` (reforma) | **0 em todas** |

No item, sobre os 95.977 itens de nota: `IcmsValor`, `IcmsBase`, `IcmsStValor`, `PisValor`,
`CofinsValor` e `IpiValor` **todos zero**, e as alíquotas `IcmsAliq`, `PisAliq` e `CofinsAliq`
**também somam zero**. Não é o cabeçalho vazio enquanto o item tem valor: é zero nas duas
camadas.

**Para livro isso é plausível, e o CST confirma que o zero é deliberado, não campo em branco.**
A tributação está codificada como isenta ou não tributada, item a item:

| Tributo | CST | Itens | % |
|---|---|---:|---:|
| ICMS | **40** (isenta) | 66.781 | 69,6% |
| ICMS | **41** (não tributada) | 28.755 | 30,0% |
| ICMS | 300 | 380 | 0,4% |
| ICMS | (vazio) | 61 | 0,1% |
| PIS/COFINS | **08/08** (sem incidência) | 92.857 | 96,7% |
| PIS/COFINS | **07/07** (isenta) | 2.022 | 2,1% |
| PIS/COFINS | **06/06** (alíquota zero) | 946 | 1,0% |
| PIS/COFINS | outros (71, 98, 49, vazio) | 152 | 0,2% |

99,5% dos itens estão em CST 40 ou 41 de ICMS, e 99,8% em CST 06, 07 ou 08 de PIS/COFINS, que é
o padrão esperado da imunidade constitucional de livro.

**O que isso significa e o que não significa.** Significa que **não existe linha de imposto sobre
venda para extrair deste ERP**: a receita bruta é igual à receita líquida de tributo, e quem
montar DRE deve registrar essa linha como zero **medido**, não como dado faltando. **Não
significa** que a empresa não paga tributo nenhum: nada aqui cobre IRPJ, CSLL, tributo sobre
serviço nem retenção, e 4.20 já mostra que `FaixasIRRF` tem 0 linhas e nenhum IR de direito
autoral é calculado. **A apuração fiscal não foi validada com contador**, foi medido o que está
gravado.

### 4.16 Faturamento pela API, e a divergência de `vwBookInfoVendas`

**Dá para calcular o faturamento total pela API**, ao contrário do caixa. O payload de
`/TNotaFiscalController/NotaFiscal` (108 campos) traz `tipoNota`, `totalProduto`, `desconto`,
`valorFrete`, `outrasDespesas` e `totalNota` com os valores corretos, além de `serie{modelo}`.
Duas ressalvas medidas:

1. **Não existe campo `cancelada` no JSON.** O cancelamento tem que ser inferido de
   **`nFeStatus=3`**, mais `nFeProtocoloCancelamento` e `nFeDataHoraCancelamento` preenchidos.
   A equivalência `Cancelada=1` igual a `NFeStatus=3` foi provada no universo (182 notas, sem
   exceção), então o proxy é seguro.
2. **Não dá para quebrar o faturamento por canal, vendedor ou conta contábil pela API**, porque
   `canalVenda`, `vendedor`, `planoConta` e `centroResultado` voltam **0** (risco 21). Ou seja:
   **o total sai pela API, a abertura que interessa só sai pelo SQL.** E como
   `/TNotaFiscalController/TipoNota` não existe (500), o de-para dos 15 tipos também só existe no
   SQL.

**Cuidado com `vwBookInfoVendas` como atalho.** A seção 5.7 recomenda as views `vwBookInfo*`
como caminho de menor esforço para um pipeline. Para faturamento, **elas não devolvem o mesmo
número**, e a diferença foi reconciliada ao centavo:

| Passo | Notas | Valor |
|---|---:|---:|
| Faturamento medido em `NotaFiscal` (tipos 1 e 13, não canceladas) | 41.955 | R$ 7.451.618,11 |
| menos notas de venda que a view **não traz** (391 NF-e modelo 55, 7 modelo 0, 1 NFC-e) | −399 | −R$ 575.016,58 |
| mais linhas que a view traz e **não são venda** (Acerto de Consignação, tipo 3) | +23 | +R$ 41.859,67 |
| **igual a `vwBookInfoVendas` com `cancellation_flag='N'`** | **41.579** | **R$ 6.918.461,20** |

Resíduo: **R$ 0,00**. Nas 41.556 notas presentes nos dois lados, `total` da view é **idêntico** a
`TotalNota`, com 0 divergências e diferença máxima 0. O problema não é o valor por linha, é o
**recorte de linhas**: a view perde R$ 575.016,58 de venda e soma R$ 41.859,67 que não é venda,
errando **7,2% para menos** no total, R$ 533.156,91.

**Não é possível saber por quê:** `acessoExterno` não tem `VIEW DEFINITION` e `OBJECT_DEFINITION`
devolve NULL (ver 5.8 e 10.2). Sei o que a view faz, não por quê. Outros dois detalhes:
`cancellation_flag` é **varchar 'S'/'N'**, não bit (um `CAST(... AS int)` quebra a consulta), e a
view classifica só em `NFe` e `NFCe`, sem o tipo de nota.

**Recomendação:** para faturamento, ler `NotaFiscal` com filtro explícito de `TipoNota` e
`Cancelada`. Usar `vwBookInfoVendas` só depois de reconciliar contra a tabela.

### 4.17 DRE por regime de caixa: dá, só com SQL

`vwTituloFinanceiroBaixasComRateio` (41.929 linhas na janela A) entrega título, baixa e rateio
achatados, com `DescPlanoConta` e `DescCentroResultado` resolvidos. Cobertura de rateio
**perfeita**: 0 baixas sem rateio, 0 linhas com `PlanoConta` ou `CentroResultado` vazio, e a soma
bate exatamente com as baixas do mesmo instante.

Série mensal medida na janela A (recebido menos pago, por `DataBaixa`):

| Mês | Resultado de caixa |
|---|---:|
| set/2025 | +R$ 14.225,15 |
| out/2025 | −R$ 79.471,84 |
| nov/2025 | −R$ 22.717,20 |
| dez/2025 | −R$ 82.654,67 |
| jan/2026 | −R$ 31.725,98 |
| fev/2026 | −R$ 100.916,12 |
| mar/2026 | −R$ 264.386,74 |
| abr/2026 | −R$ 155.897,76 |
| mai/2026 | −R$ 227.841,76 |
| jun/2026 | −R$ 401.622,89 |
| jul/2026 | −R$ 218.472,71 |

**O que falta para essa DRE prestar:** (a) a marcação receita e despesa não existe no banco;
(b) transferência entre contas entra como despesa (R$ 79.276,12 no PlanoConta 106 em julho);
(c) o lado da receita não tem analítico (ver 4.9); (d) taxa de cartão e de gateway nunca é
registrada, então a receita está bruta e a despesa financeira não existe; (e) esta série é por
`DataBaixa`, que inclui as 2.242 baixas com data futura de 4.6, e não corta em hoje.

**Faturado e recebido não foram reconciliados.** São regimes diferentes: 4.12 é competência por
emissão, esta seção é caixa por baixa.

### 4.18 A devolução não vira dinheiro

Medido no SQL Server em 06/08/2026, entre **19:44 e 19:55 BRT**. Nesse instante o banco tinha
42.888 notas fiscais, 63.177 títulos e 41.693 baixas, e a API confirmou o mesmo total de notas
(`page.totalRecords` igual a 42.888), então as duas pontas estão no mesmo instante.

#### As 221 notas de devolução

Valores desta tabela incluem as canceladas, ao contrário da tabela de 4.11.

| TipoNota | Descrição | Notas | Valor | Canceladas | `GeraFinanceiro=1` | `MoveEstoque=1` | Período |
|---:|---|---:|---:|---:|---:|---:|---|
| 4 | Devolução de Consignação | 44 | R$ 1.454.820,23 | 11 | **0** | 17 | 26/09/2025 a 05/08/2026 |
| 5 | Devolução Simbólica | 120 | R$ 736.806,59 | 4 | **0** | 0 | 30/09/2025 a 04/08/2026 |
| 6 | Devolução de Venda | 54 | R$ 31.642,46 | 1 | **0** | 54 | 16/09/2025 a 05/08/2026 |
| 7 | Devolução de Compra | 3 | R$ 10.918,80 | 1 | **0** | 3 | 26/01/2026 a 30/07/2026 |
| | **Total** | **221** | **R$ 2.234.188,08** | 17 | **0** | 74 | |

O flag `GeraFinanceiro` está **desligado nas 221, sem uma exceção**. Ele está ligado em 29.171
das 30.562 notas de venda e em 11.549 de 11.549 do PDV, ou seja o campo funciona e é usado, só
não para devolução.

#### Quantas geram título financeiro: zero, confirmado por três caminhos

`TituloFinanceiro` liga-se à nota por `Origem=1` mais `OrigemIdRegistro=idNotaFiscal`, vínculo já
provado em 4.1. Fazendo o LEFT JOIN das 221 notas contra a tabela inteira de títulos:

| TipoNota | Notas | Títulos gerados | Valor em título |
|---:|---:|---:|---:|
| 4 | 44 | **0** | R$ 0,00 |
| 5 | 120 | **0** | R$ 0,00 |
| 6 | 54 | **0** | R$ 0,00 |
| 7 | 3 | **0** | R$ 0,00 |

Segunda prova, pelo outro lado: `NotaFiscalVencimento` tem **0 parcelas** para as notas de tipo
4, 5 e 7. O tipo 6 tem exatamente **uma** parcela, de R$ 109,90, e mesmo essa **não virou
título**: `GeraFinanceiro=0` mandou mais que o vencimento digitado.

Terceira prova, procurando qualquer outro caminho de reversão no banco inteiro:

- `TituloFinanceiro` com `Valor < 0`: **0**.
- `TituloFinanceiroBaixa` com `ValorBaixa < 0`: **0**.
- `TituloFinanceiro.ValorAbatido <> 0`: 70 títulos, R$ 13.648,72. E esse valor **não é crédito de
  devolução**: a soma dos `ValorDesconto` das baixas desses mesmos 70 títulos dá exatamente
  R$ 13.648,72. `ValorAbatido` é o desconto concedido na hora de receber, nada mais.

Não existe estorno, não existe título negativo, não existe nota que gere contrapartida.
**A devolução é um evento sem lado financeiro.**

#### `CreditoParceiro`: a tabela feita para guardar esse dinheiro nunca recebeu uma linha

O ERP tem a estrutura pronta e completa para crédito de cliente:

| Objeto | Criado em | Linhas hoje | Identity já consumida |
|---|---|---:|---|
| `CreditoParceiro` | 16/12/2019 | **0** | **`last_value` NULL** |
| `CreditoParceiroBaixa` | 16/12/2019 | **0** | **`last_value` NULL** |
| `vwCreditoParceiro` | 22/08/2019 (alterada 20/03/2024) | 0 | n/d |

`last_value` NULL em `sys.identity_columns` significa que **nenhum INSERT jamais foi feito**. Não
é "tinha e apagaram": em **seis anos e oito meses a tabela nunca teve uma linha**. Para
contraste, no mesmo banco `TituloFinanceiro` está com `last_value` 65.743.

A estrutura é rica e é exatamente o que faltaria: `Parceiro`, `DataCredito`, `Valor`,
`ValorBaixa`, `Baixado`, `PlanoConta`, `CentroResultado`, `TipoCredito`, `Movimento`,
`Documento`, `ContaBancaria`, e o par polimórfico `Origem` e `OrigemIdRegistro`, pronto para
apontar para a nota de devolução que o gerou.

**A view `vwCreditoParceiro` funciona.** Executada, responde sem erro e devolve 0 linhas. Ela já
resolve `Nome` e `Fantasia` do parceiro, `DescPlanoConta`, `DescCentroResultado`, `DescOrigem`,
`Referencia` e `DataBaixa`. Não é uma view quebrada como a `vwProdutoCusto` de 4.19: é uma view
certa apontando para uma tabela vazia. No dia em que alguém começar a lançar crédito, o relatório
já existe.

O gancho de consumo do crédito também existe e também está morto: `NotaFiscal.AbaterCredito` está
em **0 de 42.888 notas**.

E não há rota de API para nada disso: `/TCreditoParceiroController/CreditoParceiro` devolve
**HTTP 500 com 1.211 bytes**, que é o oráculo de rota inexistente da seção 2.

#### O que a devolução move de fato

Ela move estoque e emite documento fiscal. Só isso.

- **Estoque:** das 221 notas, **66 produziram linha em `MovimentoEstoque`** (`Origem=1`): 12 do
  tipo 4, 52 do tipo 6, 2 do tipo 7 e **nenhuma** do tipo 5. Repare que o flag `MoveEstoque`
  promete 74 e o razão entrega 66: 8 notas com o flag ligado não geraram movimento. A causa não
  foi investigada.
- **Fiscal:** as 221 têm `NFeStatus` preenchido, e **199 têm chave e protocolo de autorização da
  SEFAZ**. São notas de verdade, autorizadas, com efeito tributário.
- **Financeiro:** nada.

A "Devolução Simbólica" é o caso extremo: **120 notas, R$ 736.806,59, zero movimento de estoque e
zero financeiro.** É papel puro.

#### A devolução de venda nem sabe qual venda ela reverte

Nas 54 notas de tipo 6, Devolução de Venda:

- `idPedidoVenda` é 0 em **54 de 54**;
- `Consignacao` é 0 em **54 de 54**;
- não existe tabela de nota referenciada no banco. Foram varridas as 17 tabelas `NotaFiscal*`:
  há `Itens`, `Eventos`, `Vencimento`, `Volume`, `Numero`, `Serie` e `DI`, mas **nenhuma
  `NotaFiscalReferenciada`**;
- `ObservacaoFisco` está vazia em **53 de 54**, e **nenhuma** das 54 carrega uma sequência de 20
  ou mais dígitos que pudesse ser a chave da nota original.

Ou seja: mesmo com trabalho manual, **não há como o sistema apontar qual recebível deveria ser
estornado.** O elo não existe em campo estruturado nem em texto.

Para as devoluções de consignação (tipos 4 e 5) o quadro é diferente e defensável: **164 de 164
apontam para um `Consignacao`**, e quem fatura consignação é o Acerto de Consignação (TipoNota 3,
41 notas, R$ 113.684,98, com `GeraFinanceiro=1` em 41 de 41). Nesse fluxo, devolução sem
financeiro é o desenho correto: só o acerto cobra.

#### Conclusão

**A devolução no Literarius move estoque e emite documento fiscal, e não reverte recebível nem
gera crédito de cliente.** Três consequências práticas:

1. **O saldo a receber está inflado por devolução.** Quem devolveu mercadoria continua com o
   título aberto, porque nada o baixa, nada o abate e nada o cancela. Nas 54 devoluções de venda
   (tipo 6, R$ 31.642,46) a mercadoria voltou para o estoque e o recebível ficou de pé, e nas 3
   devoluções de compra (tipo 7, R$ 10.918,80) o mesmo vale para o lado a pagar. **Não foi
   possível dimensionar quanto do R$ 2.198.726,53 vencido é devolução**, exatamente porque o elo
   entre a nota de devolução e a venda original não existe.
2. **Não existe saldo de crédito de cliente em lugar nenhum.** A tabela existe desde 2019, a view
   existe, o campo `AbaterCredito` da nota existe, e os três nunca foram usados. Se um cliente
   tem crédito na Heziom hoje, esse crédito mora fora do ERP.
3. **Qualquer consumidor da API está exposto ao mesmo erro.** A API expõe `tipoNota` e
   `geraFinanceiro` no payload da nota (confirmado na NF id 43521, tipo 6: `tipoNota=6`,
   `geraFinanceiro=false`), então dá para filtrar. Mas o **lookup de `TipoNota` não tem rota**:
   `/TNotaFiscalController/TipoNota` e `/TTipoNotaController/TipoNota` dão 500. Quem consumir
   `/NotaFiscal` sem a tabela `TipoNota` na mão soma devolução como se fosse venda, e as 42.888
   notas viram um faturamento que não existe.

### 4.19 Custo: manual, a view oficial está quebrada, mas a regra do ERP é reaproveitável

**Não existe coluna de custo em `Produto`, `Estoque` ou `MovimentoEstoque`.** Varredura de
`sys.columns` por `'%Custo%'`: só `AjusteManualCusto`, `EntradaItens.CustoUnitario`,
`DireitoAutoralFechamentoItens.ValorCusto` e a função.

O motor de custo é a função de tabela
**`fRetornaCustoProduto(@Empresa,@Produto,@TipoProduto,@Editora,@DataBase)`**.

#### A permissão está OK, e isto corrige um erro do rascunho

O rascunho afirmava que `acessoExterno` "não tem EXECUTE" na função e que por isso "não dá para
reaproveitar a regra de custo do ERP". **As duas afirmações estavam erradas.** O erro foi testar
a permissão da classe errada:

| Objeto | `type` em `sys.objects` | SELECT | EXECUTE |
|---|---|:--:|:--:|
| `fRetornaCustoProduto` | `TF` (`SQL_TABLE_VALUED_FUNCTION`) | **1** | 0 |
| `fRetonaLocalizacaoProduto` | `TF` | **1** | 0 |
| `fRetonaListaSeparacaoPedido` | `TF` | **1** | 0 |
| `fRetornaListaSeparacaoListaPedido` | `TF` | **1** | 0 |

As 4 funções de negócio são **table-valued**. Para elas a permissão aplicável é **SELECT**, e ela
**está concedida nas 4**. `HAS_PERMS_BY_NAME(...,'EXECUTE')` devolver 0 numa TVF é erro de
categoria, não negativa de acesso: EXECUTE não é uma permissão que exista para função de tabela.
Ela é consultada com `FROM` ou `CROSS APPLY`, como uma tabela.

**Prova por execução, não por metadado.** Rodando como `acessoExterno` em 06/08 às 19:22 BRT:

```sql
SELECT TOP 20 p.Codigo, c.Custo, c.QtdeEstoque
FROM Produto p
CROSS APPLY dbo.fRetornaCustoProduto(1, p.Codigo, p.TipoProduto, p.Editora, GETDATE()) c;
-- Codigo 1  -> Custo 7,88   / 964 un   | Codigo 7  -> 55,949 / 36 un
-- Codigo 10 -> Custo 5,98   / 5.403 un | Codigo 13 -> 4,32   / 347 un
```

Roda e devolve número. **A regra de custo do ERP é reaproveitável em leitura, e ninguém precisa
reimplementar CMV.** O que continua vedado é escrever (medido às 19:35: SELECT em 190 de 190
tabelas, INSERT, UPDATE e DELETE em 0 de 190) e ler o código-fonte da função (`VIEW DEFINITION`
igual a 0 nas 4).

Para o registro, na mesma varredura: os únicos objetos com EXECUTE concedido são
`fn_diagramobjects` e as 6 procedures `sp_*diagram`, todas criadas em 25/07/2015. São as
auxiliares de diagrama do SSMS e só tocam `sysdiagrams`. **Não são superfície de escrita em dado
de negócio.**

#### Valorização do estoque, medida com a própria função

Medido em 06/08/2026 às **19:26 BRT** (`CROSS APPLY` sobre `Produto`, 34 s, rodado duas vezes com
resultado idêntico):

| Métrica | Valor |
|---|---:|
| Produtos com linha na função | 4.760 |
| Unidades | **133.885** |
| **Valorização** | **R$ 1.638.202,37** |
| Produtos com Custo maior que 0 | 2.198 |
| Produtos com estoque maior que 0 | 2.655 |
| **Produtos com estoque físico e custo ZERO** | **567** |
| Produtos com estoque negativo | 64 |

**Sobre o R$ 1.648.004,03 que o rascunho trazia:** não é erro de conta, é outro horário. É um
número que anda durante o dia. Em 06/08 houve **1.041 movimentos de estoque** (684 saídas, 357
entradas) em 95 produtos, entre 08:42 e 18:36 BRT. Só depois das 15:08 o líquido foi de **−840
unidades** (97 entradas somando 772, 246 saídas somando 1.612), na mesma direção e ordem de
grandeza da diferença de 967 unidades entre os dois números. **Os dois snapshots não foram
reconciliados exatamente**, porque o horário exato da medição anterior não ficou registrado e o
escopo de estoque da função (empresa 1) não é o mesmo recorte de `MovimentoEstoque` cru.
**Regra: valorização de estoque só entra em documento com data e hora.**

#### A armadilha do CROSS APPLY: 1.909 unidades somem da conta

`CROSS APPLY` descarta em silêncio todo produto para o qual a função não devolve linha. Medido
com `OUTER APPLY` às 19:28 BRT:

- `Produto` tem **5.238** linhas (5.235 ativos, 3 inativos).
- A função não devolve linha para **478 produtos (9,1%)**: 443 porque `TipoProduto` ou `Editora`
  está NULL, e **35 com a chave preenchida e mesmo assim vazio**.
- Desses 478, **216 têm estoque físico, somando 1.909 unidades** que ficam fora da valorização.
- Confere: `Estoque` da empresa 1 tem **135.794** unidades, iguais a 133.885 contadas mais 1.909
  fora. A cobertura da valorização é de **98,6% das unidades**.

Essas 1.909 unidades entram no balanço valendo zero, junto com as 567 de custo zero. Quem for
montar CMV precisa tratar os 478 explicitamente, com `OUTER APPLY`, e não com `CROSS APPLY`.

#### `vwProdutoCusto` está quebrada, confirmado às 19:24 BRT

| Medição em `vwProdutoCusto` | Resultado |
|---|---:|
| Linhas | 5.238 |
| `MIN(Custo)` e `MAX(Custo)` | **0 e 0** |
| `MIN(QtdeEstoque)` e `MAX(QtdeEstoque)` | **0 e 0** |
| `SUM(Custo * QtdeEstoque)` | **R$ 0,00** |

Zero em todas as linhas, sem uma única exceção, enquanto a função devolve os valores certos para
os mesmos produtos. **Quem montar CMV por essa view chega em zero e o relatório não acusa erro
nenhum.** Sem `VIEW DEFINITION` não dá para dizer *por que* ela zera, só que a saída diverge da
função.

#### O caminho certo

1. **Fonte de custo:** `dbo.fRetornaCustoProduto`, via `OUTER APPLY` (nunca `CROSS APPLY`), com
   `TipoProduto` e `Editora` vindos de `Produto` e `@DataBase` explícito, não `GETDATE()`, para a
   consulta ser reproduzível.
2. **Nunca** `vwProdutoCusto`.
3. **Quantidade:** pode vir da própria função. `c.QtdeEstoque` foi comparado contra
   `SUM(Estoque.QtdeFisica)` da empresa 1, produto a produto: **4.760 de 4.760 iguais, 0
   divergências**, totais batendo em 133.885. A função é consistente com a tabela de estoque.
4. **Tratar explicitamente** os 478 sem linha e os 567 com custo zero, em vez de deixá-los somar
   zero.

#### O custo é digitado à mão

Não é custo médio calculado por movimento. `AjusteManualCusto`, medido às 19:31 BRT: **2.792
ajustes em 2.758 produtos**, `DataAjuste` de **01/09/2025 23:59:59 a 06/07/2026 15:43**, por 4
usuários (rafael 2.654, ana 131, diego 4, victoria 3). **`CustoAnterior = 0` em 2.749 dos 2.792,
ou 98,5%**: o histórico não encadeia, então não há trilha de como o custo chegou no valor atual.

> Correção de data: o rascunho dizia que os ajustes começavam em 02/09/2025. O valor real de
> `MIN(DataAjuste)` é **01/09/2025 23:59:59**. A data anterior foi lida com o utilitário de SQL
> antes da correção de fuso, que adiantava os horários e virava o dia nesse caso.

### 4.20 Buracos de integridade do financeiro

| Achado | Volume | Valor | Janela |
|---|---:|---:|---|
| Contas a receber vencidas e não baixadas | **21.263** | **R$ 2.198.726,53**, ou 93% do saldo em aberto de R$ 2.356.113,70 | B (19:52), idêntico em A |
| Contas a pagar vencidas | **142** | **R$ 447.935,96** | B (19:52). Ver ressalva abaixo |
| Baixas sem conta bancária | **16.885** | **R$ 2.605.932,74** | B (19:47). Causa medida em 4.8 |
| Notas de venda válidas sem título financeiro | 1.436 | R$ 187.252,47 | B (19:40) |
| NFs com vencimento que nunca geraram título | 1.622 | R$ 315.518,21 | A |
| Entradas que nunca geraram título a pagar | 5 | R$ 129.018,47 | A |
| Direito autoral apurado que nunca virou título | 309 fechamentos (719 menos 410) | **R$ 164.055,38** | A |
| `valorPago > valor` (baixa duplicada) | 1.679 R e 4 P | ex.: id 29784, valor 35,54, valorPago 71,08, 2 baixas idênticas no SQL | A |
| `pago=true` com `valorPago=0` | 6 títulos P | n/d | A |
| Encargo de atraso efetivamente cobrado em 11 meses | 4 baixas com juros e 4 com multa | R$ 1.316,91 | B (19:50) |
| Títulos apagados fisicamente (buraco de identity) | **2.565** | Sem rastro: auditoria desligada | A |
| Baixas apagadas | 1.356 | n/d | A |
| Lançamentos bancários apagados | 132 | n/d | A |

**Ressalva do contas a pagar vencido:** a janela A registrou 302 títulos e R$ 788.582,11, e a
janela B não conseguiu reproduzir esse número com nenhum dos quatro critérios testados, que dão
entre 142 e 149 títulos. Detalhe em 4.8. **O número válido é o de 19:52 BRT.**

**Duas linhas parecidas que medem coisas diferentes:** "NFs com vencimento que nunca geraram
título" (1.622, janela A) parte das notas que tinham parcela digitada. "Notas de venda válidas
sem título" (1.436, janela B) parte de todas as notas de venda não canceladas, com ou sem
parcela. Não são o mesmo conjunto e não devem ser somadas.

**Onde a baixa é automática, funciona. Onde depende de gente, não acontece.** Taxa de baixa por
forma de pagamento (janela A): PIX SITE 100%, CARTÃO DE CRÉDITO - SITE 100%, BOLETO SITE 100%,
**CARTÃO DE CRÉDITO manual 46,5%** (R$ 1.255.067,69 parados), **MERCADO PAGO 18,2%**
(R$ 432.961,89), **BOLETO 29,7%** (R$ 523.325,41).

**Volume por forma de pagamento** (`SUM(ValorBaixa)`, janela B, 19:47): BOLETO R$ 3.644.493,52 ·
PIX R$ 3.238.136,82 · CARTÃO DE CRÉDITO R$ 2.967.368,54 · PIX SITE R$ 1.551.831,41 · CARTÃO DE
CRÉDITO - SITE R$ 220.603,07 · MERCADO PAGO R$ 99.165,65 · BOLETO SITE R$ 74.955,66 · PIX QR CODE
R$ 39.969,78 · BOLETO SANTANDER R$ 33.017,84 · DINHEIRO R$ 24.214,64 · TRANSFERENCIA
R$ 10.746,83 · DEPÓSITO EM CONTA R$ 8.849,59 · CARTÃO DE DÉBITO R$ 1.948,16 · DEBITO EM CONTA
R$ 542,62. Total R$ 11.915.844,14.

**Direito autoral (janela A):** R$ 325.394,75 apurados em 719 fechamentos, 16 autores, 81
produtos, de 10/2025 a 08/2026. **`ValorIR = 0` em todos**, porque a tabela `FaixasIRRF` tem
**0 linhas**: nenhuma retenção é calculada. Cobertura baixa: 1.764 produtos têm autor cadastrado
e só **91** têm parâmetro de royalty.

**Comissão (janela A):** existe exatamente **1 parâmetro** (colaborador 26583, 1,5% sobre o total
faturado, cadastrado por 'rafael' em 05/02/2026). `vwComissaoFaturamento` calcula R$ 19.560,44 em
1.343 linhas e `vwComissaoBaixas` retorna vazio. **Nada registra que uma comissão foi paga**:
comissão é relatório, não razão.

**A auditoria financeira está desligada de ponta a ponta.** `SysLogAuditoriaEntidades` tem as 9
entidades cadastradas (inclui `TituloFinanceiro`, `ContaBancaria`, `ContaBancariaLancamento`,
`NotaFiscal` e `Entrada`) e **todas com `Ativo=false`**. `SysLogAuditoria` tem **0 linhas**. Não
existe campo `Cancelado`: cancelar é apagar.

**As descrições de `CondicaoPagto` mentem:** "Cartão de Crédito 2x" até "10x" têm todas
`CondicaoPagto='1'` (uma parcela), e `Taxa=0` e `Prazo=0` nas 13. O parcelamento real vem de
`NotaFiscalVencimento` e chega correto em `TituloFinanceiro.TotalParcela`, que vai até 20
parcelas (34.303 títulos em 1x, 24.832 parcelados, janela A).

---

## 5. O que só existe via SQL Server

190 tabelas, 62 views, 6 procedures (todas do diagrama do SSMS, nenhuma de negócio). 135 tabelas
com dados somando **1.644.004 linhas**, e **55 tabelas vazias** (contagem da janela A).

### 5.1 Financeiro e caixa

| Objeto | Linhas | Valor e observação | Janela |
|---|---:|---|---|
| `TituloFinanceiroBaixa` | **41.693** | **R$ 11.915.844,14**, a única data de pagamento do sistema | B |
| `TituloFinanceiroBaixaRateio` | 41.919 | DRE por caixa, cobertura 100% | A |
| `ContaBancariaLancamento` | 9.318 | R$ 14.216.354,90 (C 8.584, D 734) | A |
| `ControleCaixa`, `Itens`, `Lancamento` | **633**, **2.301**, **0** | R$ 1.500.190,82 de fechamento de caixa de PDV. Sangria e suprimento nunca usados | B |
| `ContaBancariaFormaPagto` | **2** | De-para de conta por forma de pagamento. **Incidente 3**, ver 4.8 | B |
| `CobrancaConfiguracao` | **1** | Juros, multa e protesto zerados | B |
| `ContasPagarConfiguracao` | **1** | Remessa de pagamento nunca rodou | B |
| `CreditoParceiro`, `CreditoParceiroBaixa` | **0**, **0** | Existem desde 2019 e nunca receberam uma linha. Ver 4.18 | B |
| `PlanoConta` | 117 | Sem `GrupoDRE` | A |
| `CentroResultado` | 13 | n/d | A |
| `ContaBancaria` | 12 | Metade são gateways | A |
| `FormaPagto` | 17 | 3 delas nunca usadas em baixa | B |
| `CondicaoPagto` | 13 | `Taxa` e `Prazo` seriam custo de adquirência e D+n, estão zerados | A |
| `Banco` | 10 | Inútil: as contas usam `BancoNumero` '000' | A |
| `Portador` | 1 | Campo morto | A |
| `vwMovimentoContaBancaria` | **35.070** | UNION de LB (9.350), BF (24.808) e TF (912, previsão). **Única forma correta de tirar saldo, e ela só enxerga baixa com conta** | B |
| `vwTituloFinanceiroBaixasComRateio` | 41.929 | DRE de caixa num SELECT | A |
| `vwTituloFinanceiro` | 63.109 | Traz `DataPagto` derivada | A |
| `vwCreditoParceiro` | 0 | View correta apontando para tabela vazia | B |

### 5.2 Compra e custo

| Objeto | Linhas | Valor e observação | Janela |
|---|---:|---|---|
| `Entrada` | 278 | **R$ 3.854.273,76**, todo o custo de aquisição | A |
| `EntradaItens` | 6.894 | Custo unitário por título | A |
| `EntradaVencimento` | 594 | R$ 2.660.900,65 | A |
| `AjusteManualCusto` | **2.792** | Único custo primário, digitado à mão, `CustoAnterior=0` em 98,5% | B |
| `fRetornaCustoProduto` | função de tabela (`TF`) | **SELECT concedido** a `acessoExterno`, executada e conferida às 19:22. EXECUTE não se aplica a TVF | B |
| `PedidoCompra*` | **0** | Módulo nunca usado | A |

### 5.3 Estoque e histórico

| Objeto | Linhas | Observação | Janela |
|---|---:|---|---|
| `MovimentoEstoque` | **226.700** | Razão com `Saldo` após cada movimento. Única forma de reconstruir estoque retroativo | A |
| `PedidoVendaHistorico` | **247.611** | Maior tabela do banco. 100% dos pedidos têm histórico, média de 8,4 linhas | A |
| `PedidoVendaItensConferencia` | 113.470 | Bipagem na expedição | A |
| `Estoque` | 6.958 | Acordo perfeito com `MovimentoEstoque`: 6.958 pares comparados, **0 divergências**. Empresa 1 soma 135.794 unidades (janela B) | A e B |
| `LancamentoEstoque` e `Itens` | 849 e 2.812 | Ajuste manual de saldo | A |
| `TransferenciaEstoque` e `Itens` | 191 e 1.044 | n/d | A |
| `Inventario` e `InventarioItens` | 1.589 e 14.127 | n/d | A |
| `MontagemKit` e `Itens` | 159 e 485 | n/d | A |

### 5.4 Fiscal e logística

| Objeto | Linhas | Observação | Janela |
|---|---:|---|---|
| `NotaFiscalItens` | **95.977** | Onde moram CST, alíquota e classificação contábil do item | B |
| `NotaFiscalEventos` | 42.045 | Cancelamento, CC-e, manifestação SEFAZ | A |
| `NotaFiscalNumero` | 105.677 | Pool de numeração fiscal. **Não existe equivalente para pedido** | A |
| `NotaFiscalVolume` | 31.903 | A API expõe `volumes[]` e devolve **sempre vazio** | A |
| `LogisticaEtiqueta` | 8.240 | **O rastreio real.** `PedidoVendaRastreio`, que a API expõe, tem **0 linhas** | A |
| `TipoNota` | **15**, sendo 14 com movimento | Sem isso não se separa venda de devolução, doação, remessa e consignação dentro das 42.888 notas. **Sem rota na API** | B |
| `NaturezaOperacao` | 76 | CFOPs | A |
| `NotaFiscalServico` | 6 | Ingressos de evento, set/2025 | A |

### 5.5 Direito autoral, consignação e comercial

| Objeto | Linhas | Valor e observação | Janela |
|---|---:|---|---|
| `DireitoAutoralFechamento` e `Itens` | 719 e 20.183 | R$ 325.394,75 sobre 53.150 exemplares | A |
| `DireitoAutoralParametro` e `Itens` | 95 e 97 | Sem isso não se projeta royalty futuro | A |
| `Consignacao`, `Itens`, `NotasDevolucao` | 56, 3.499, **7.529** | Receita não realizada | A |
| `CanalVenda` | 14 | Por pedido: SITE 17.869, ML-MP 5.523, AMAZON-MP 4.466, ATACADO 1.191, MARKETING 297 | A |
| `ProdutoPreco` | 6.450 | Preço de tabela contra praticado | A |
| `TabelaBisac` | 4.588 | Categorização editorial | A |
| `ExposicaoFeira` | 13 | `vwExposicaoFeiraItens` já calcula enviado, devolvido e vendido | A |
| `ProjetoEditorial` e `Processos` | 12 e 72 | Custo de produção | A |

**Aviso sobre canal:** a linha de `CanalVenda` acima é contada **por pedido**, e por isso o canal
LIVRARIA aparece com zero. A loja física existe e fatura R$ 1.535.169,43, só que por nota, sem
pedido. Para faturamento por canal use a tabela de 4.13, que é contada por nota fiscal.

### 5.6 Cadastro e configuração

| Objeto | Linhas | Observação | Janela |
|---|---:|---|---|
| `Parceiro` | **52.275** | A API entrega 52.267 (só `Status=1`) | B |
| `ParceiroEndereco` | 151.386 | 2,9 por parceiro | A |
| `TipoCliente` | 7 | Lookup certo. O ponteiro `Parceiro.ClienteTipoCliente` está 99,52% vazio, ver 3.2 | B |
| `Produto` | **5.238** | 5.235 ativos, 3 inativos, e a API entrega os 5.238 | B |
| `ProdutoAutor` | 2.590 | n/d | A |
| `Cidade`, `Estado`, `Pais` | 5.565, 28, 7 | Com código IBGE | A |
| `ConfiguracaoGeral` | 406 | **O objeto mais importante para escrita.** Ver 6.5. Contém segredo em texto puro | A |
| `UsuarioAcesso` e `UsuarioEmpresas` | 2.834 e 38 | Segregação de função | A |
| `Usuario` | 19 | **Incidente 1**: a coluna `Senha` não aparenta ser hash | A |
| `SysLogAuditoria` | **0** | Desligada | A |

### 5.7 A pista mais valiosa, com uma ressalva nova: `vwBookInfo*`

Existem **11 views com nomes em inglês e schema de varejo padronizado** (`store_id`,
`store_taxpayer_id`, `sellin_timestamp`, `sellout_timestamp`, `nfe_access_key`, `gross_total`,
`net_total`, `cancellation_flag`, `ean`, `isbn`) cobrindo Vendas, VendasItens, VendasPagamento,
VendasParcelas, Compras, ComprasItens, ComprasPagamento, ComprasParcelas, Produtos,
ProdutosCategorias e Lojas.

`vwBookInfoVendas` tem **41.720 linhas** (janela B).

**É um contrato de dados analítico já modelado e populado dentro do próprio ERP.** É o caminho de
menor esforço para um pipeline, e ninguém precisa reinventar o modelo dimensional.

**A ressalva, medida na janela B:** para faturamento, essa view **não devolve o mesmo número da
tabela**. Ela erra 7,2% para menos (R$ 533.156,91), porque exclui 399 notas de venda e inclui 23
Acertos de Consignação, que não são venda. A reconciliação fecha ao centavo e está em 4.16. Use
as `vwBookInfo*` para acelerar, nunca sem reconciliar antes contra `NotaFiscal`.

### 5.8 Views quebradas ou suspeitas

| View | Problema | Janela |
|---|---|---|
| `vwProdutoCusto` | `Custo=0` e `QtdeEstoque=0` nas 5.238 linhas, sem exceção. **Não usar.** Use a função, ver 4.19 | B |
| `vwBookInfoVendas` | Não está quebrada, mas o recorte de linhas diverge da tabela em 7,2%. Ver 4.16 | B |
| `vwRankingVendasProdutos` | Devolve **1 linha** apesar de ter coluna `Posicao`. Filtrada ou quebrada | A |

**Nenhuma definição de view foi lida.** `acessoExterno` não tem `VIEW DEFINITION`:
`OBJECT_DEFINITION` devolve NULL nas 62 views e `sys.sql_modules` tem 77 linhas com `definition`
NULL. Tudo o que este documento afirma sobre comportamento de view ou trigger vem de medir a
saída, não de ler o SQL.

---

## 6. Superfície de escrita do Literarius

### 6.1 Pelo SQL: zero, e é decisão de GRANT

Medido objeto a objeto com `HAS_PERMS_BY_NAME`, reconferido às 19:35 BRT:

| Permissão | Resultado |
|---|---|
| SELECT nas 190 tabelas | **190** |
| INSERT, UPDATE, DELETE, ALTER | **0, 0, 0, 0** |
| SELECT nas 62 views | 62 |
| `VIEW DEFINITION` | 0 |
| SELECT nas 4 funções de negócio (todas `TF`) | **4**, e é a permissão que vale para função de tabela |
| EXECUTE (não se aplica a `TF`, só `fn_diagramobjects` e as 6 `sp_*diagram` do SSMS têm) | 7 |
| No servidor | só CONNECT SQL |
| No banco | CONNECT mais `db_datareader` |

`fn_my_permissions(DATABASE)` devolve exatamente CONNECT, SELECT e duas permissões de leitura de
chave de criptografia. Não é sysadmin, não é db_owner, não é db_datawriter, não é ddladmin.
`acessoExterno` é o único principal não sistema do banco.

**Nenhuma escrita foi tentada.** A conclusão vem de metadado, com uma exceção que vale registrar:
a leitura via `CROSS APPLY` na função de custo foi executada de verdade e funcionou, o que
confirma que a barreira é de escrita, não de leitura.

### 6.2 O banco não protegeria nada se o GRANT mudasse

| Verificação | Resultado |
|---|---|
| `sys.check_constraints` | **0 no banco inteiro** |
| Triggers | **4, todas AFTER**: 2 em `PedidoVenda` (histórico de status), 2 em `MovimentoEstoque` (saldo). Nenhuma em `PedidoVendaItens`, `PedidoVendaVencimento`, `TituloFinanceiro`, `Parceiro` ou `NotaFiscal` |
| Stored procedures de negócio | **0.** As 6 existentes são utilitários de diagrama do SSMS criados em 25/07/2015 |
| `sys.sequences` | **0** |
| Change Tracking, CDC, temporal, Service Broker | 0 em todos |
| Tabela de staging, fila, import, carga | **Nenhuma** nas 190 |
| Colunas NOT NULL | `Parceiro`: só `Codigo`, de 114 colunas. `TituloFinanceiro`: só a PK, de 41. `PedidoVendaItens`: só a PK. `PedidoVenda`: PK mais `Empresa` mais `Numero` |

A ausência de `CHECK` no banco inteiro não é detalhe acadêmico: é exatamente por isso que
`Percentual = -922337203685477,5808` entrou em `TituloFinanceiroRateio` e derrubou 10% do contas
a pagar da API (incidente 2, seção 4.5).

**A regra de negócio roda no cliente desktop Windows.** `SysAcesso` mostrou 5 sessões ativas na
janela A: IPP-016-NOT, IPP-015-NOT, IPP-EDITORA0317, IPP-EDITORA-070, LAPTOP-OOH9IPF6.

Um INSERT direto em `PedidoVenda` mais `PedidoVendaItens` criaria um pedido que **não reserva
estoque, não gera título financeiro e não gera nota**, só cria linha de histórico de status.
Lixo silencioso que só aparece quando alguém abrir a tela.

### 6.3 Dois geradores de chave que não existem

| Chave | Problema |
|---|---|
| `PedidoVenda.Numero` | NOT NULL, **não é identity**, 0 sequences, não existe tabela de contador, e o UNIQUE é **global**, não Empresa mais Numero. Na janela A: min 1, max 29.440, 29.370 linhas, 70 buracos. Padrão compatível com MAX+1 feito pela aplicação, mas isso é inferência |
| `Parceiro.Codigo` | **Não é identity.** Máximo 52.283 para 52.262 linhas na janela A |

Gravar de fora seria **corrida de condição** contra os operadores digitando no desktop.

Contraste: para nota fiscal existe `NotaFiscalNumero`, um pool pré-alocado de 105.677 linhas com
flags `Usado` e `Inutilizado` (topo usado: número 93.636, série 1). **Para pedido não existe
equivalente.**

### 6.4 Pela API: o PUT não foi executado e não é fato

A rota `PUT /TPedidoVendaController/PedidoVenda` é **inferência**, não medição. Não se sabe se
existe, se cria ou só atualiza, qual o corpo, se exige `idPedidoVenda>0`, se cria o parceiro
junto, nem o que devolve em erro de validação.

O que a estrutura dos dados sugere, para quem for testar:

- **O corpo provavelmente exige o embrulho Delphi.** Toda lista aninhada sai como
  `{"ownsObjects":true,"listHelper":[...]}`. Mandar `"items": [...]` como array puro tende a não
  desserializar.
- **Mínimo provável do cabeçalho**, deduzido de como os 27.633 pedidos de integração estão
  preenchidos, seis campos em 100% deles e zero exceções: `cliente`, `tipoPedido`,
  `operacaoFiscal`, `canalVenda`, `vendedor`, `enderecoEntrega`. Quase sempre: `formaPagto` (44
  de 27.633 sem) e `setor` (39 sem). Opcional: `transportadora` (49% sem).
- **Domínios que o gravador precisa conhecer:** `tipoPedido` 1=Venda, 2=Consignação,
  3=Orçamento, 4=Doação, 5=Diversos · `operacaoFiscal` 1=VENDA DE MERCADORIA (28.917 usos),
  3=REMESSA EM CONSIGNAÇÃO, 13=REMESSA DE DOAÇÃO · `canalVenda` de 1 a 14.
- **A janela para corrigir é única.** Em `vwStatusPedidoVenda`, **só o status 1 (Digitando) tem
  `Altera=true` e `Exclui=true`**, os outros 11 têm os dois false. Na janela A havia 257 pedidos
  parados em status 1.
- **Não há idempotência possível pelo lado do chamador.** `?siteIdPedido=` e `?pedidoCliente=`
  são ignorados no GET. Não dá para perguntar à API se o pedido já entrou.
- **Mesmo funcionando, não vira dinheiro.** `Origem=1`, que aponta para `NotaFiscal`, cobre
  **59.099 dos 59.204 títulos a receber (99,82%)**. O pedido nasce em status 1 e só gera
  financeiro quando alguém fatura no ERP.

Domínio de status de pedido, tirado do SQL sem tocar no endpoint proibido, com a contagem da
janela A:

| Status | Descrição | Pedidos |
|---:|---|---:|
| 1 | Digitando... | 257 |
| 2 | Aguardando Aprovação | 0 |
| 3 | Aguardando Conferência | 51 |
| 4 | Aguardando Faturamento | 35 |
| 5 | Nota Fiscal Gerada | 11 |
| 6 | Pedido Faturado | 28.782 |
| 7 | Pedido Cancelado | 152 |
| 8 | Aguardando Separação | 77 |
| 9 | Separação em Andamento | 4 |
| 10 | Pedido Enviado | 0 |
| 11 | Erro Faturamento | 0 |
| 12 | Liberar para Expedição | 0 |

### 6.5 A porta que existe, está ligada e já carrega massa

A tabela `ConfiguracaoGeral` (Empresa=1) tem o bloco `Integra*`:

| Chave | Valor |
|---|---|
| `IntegraLojaURL` | `http://integra.literarius.com.br/integration/heziom/api/v1` |
| `IntegraLojaTimer` | 30 |
| `IntegraBuscaPedido` | −1 (ligado) |
| `IntegraAtualizaEstoque` | −1 |
| `IntegraAtualizaPreco` | −1 |
| `IntegraAtualizaStatus` | −1 |
| `IntegraGeraPedidoNota` | `'P'` (gera **pedido**) |
| `IntegraLojaSetor` | 1 |
| `IntegraEnviaStringXML` | −1 |
| `IntegraUltAtuPreco` | 01/09/2025 11:18:24 |
| `APIQtdeItensPedido` | 300 (teto de itens por pedido) |

**O Literarius PUXA pedido dessa URL a cada 30 s.** Não é a loja que empurra para o banco.

**Vazão medida na janela A:** **27.633 dos 29.370 pedidos de então (94%) têm `SiteIdPedido`**,
o primeiro em 08/07/2025 e o último às 15:37 de 06/08/2026. Em 2026: jan 3.084 de 3.169 · fev
2.075 de 2.194 · mar 1.753 de 1.906 · abr 2.109 de 2.438 · mai 2.810 de 2.950 · jun 2.332 de
2.434 · jul 2.418 de 2.602 · ago parcial 349 de 365. **Cerca de 2.400 pedidos por mês.** E 52.067
de 59.469 itens estão carimbados com `UsuarioAlt='IntegraLoja'`.

**Três avisos sobre essa porta:**

1. **Ela roda dentro do cliente desktop de uma pessoa, não como serviço.** Os pedidos do site vêm
   carimbados com login humano: arthur 21.017 pedidos (20.375 do site), igor 8.127 (7.106), pedro
   110 (106), mais rayssa, rafael, master e ana. **Não existe usuário técnico** tipo 'integracao'
   ou 'api'. Micro desligado ou deslogado quer dizer entrada de pedido parada. É ponto único de
   falha humano na porta principal.
2. **Não foi verificado se a Heziom pode POSTAR nessa URL.** Ela é do fornecedor. Essa é a maior
   incógnita do documento e a de maior valor. É pergunta comercial para o Literarius, não
   medição.
3. **Ela alimenta pedido, e um quarto da receita não passa por pedido.** As 11.491 notas de PDV,
   R$ 1.550.747,34, e os R$ 1.986.085,62 de faturamento sem pedido de 4.13 estão fora do alcance
   dessa porta por construção.

### 6.6 Módulo de hub de marketplace: existe no schema e está vazio

`HubPedidosCanalVenda`, `HubPedidosFormaPagto`, `HubPedidosTransportadora`, `HubLiterariusProduto`,
`HubLiterariusProdutoCanalVendas`, `HubLiterariusProdutoAnuncios`, `HubLiterariusCategoriaCustom`,
`HubLiterariusCategoriaVinculo`, `HubLiterariusLoteProduto`, `HubLiterariusLoteProdutoItem` e as
6 tabelas `Mercus*`: **todas com 0 linhas**. Pelas colunas são tabelas de de-para. Nunca foram
configuradas. Hoje os marketplaces entram pelo mesmo caminho do site.

---

## 7. O que o HeziomOS tem e o Literarius não tem

Medido em 06/08/2026, entre 14:20 e 15:10 BRT, no Supabase de produção (janela A).
**Estes números não foram remedidos na janela B.**

| Ativo | Volume no HeziomOS | Equivalente no Literarius |
|---|---:|---|
| **Pessoas que o ERP não conhece** | **cerca de 66.753 contatos, 57% da base de 116.291** | n/d |
| Segmentação comercial | 136.455 vínculos: Leads sem compra 91.495, Clientes 24.762, Recompra D+75 19.273, VIP 925 | `cliente_tipo_cliente` preenchido em **247 de 52.003** no espelho, e **253 de 52.275** no SQL ao vivo às 19:26 |
| Opt-in de WhatsApp | **36.446 ativos**, 0 revogados | Campo não existe |
| Conversa | 2.963 conversas, 44.026 mensagens (2.409 e 26.539 nos últimos 30 dias) mais 3.295 comentários de Instagram | `PedidoVendaComentarios`: 893 linhas |
| Aniversário sobre parceiro existente | **6.284** | Aniversário real em **84 de 52.003** |
| Telefone onde o parceiro está sem `fone1` | **5.253** | `fone1` preenchido em 23.862 de 52.003 |
| E-mail novo | 98 | n/d |
| Aquisição | 1.880 contatos com CTWA mais 1.172 eventos CAPI da Tray | `cliente_canal_venda` em 410 parceiros, `cliente_vendedor` em 422 |
| Status de entrega | 460 rastreios, **165 entregas confirmadas** | 8.246 etiquetas, flag `Entregue` marcada em **7** |
| Classificação de DRE | 9 contas mapeadas cobrindo **92,2% do caixa de julho** (R$ 663.165,58 de R$ 719.015,39) | `GrupoDRE=0` em 100% das 117 contas |
| Venda por link de pagamento | 96 links, 37 pagos, R$ 16.689,75 | Não existe até alguém digitar |

**Como o cruzamento foi feito:** CPF normalizado (dígitos mais left-pad 11 ou 14) contra
`lit_mirror_cadastro.parceiros`. Dos 51.186 contatos com CPF, **49.291 existem no ERP e 1.895
não**. Dos 65.105 sem CPF, o alcance por telefone e e-mail é de **no máximo 247** (157 casam por
telefone entre 11.799 com telefone, 90 por e-mail entre 62.939 com e-mail, e a sobreposição não
foi descontada). Não é falha de dedup: o parceiro do ERP só tem `fone1` em 23.862 de 52.003.

Nos **50.705 pares CPF e parceiro**, 25.535 têm opt-in de WhatsApp.

---

## 8. Alimentar o Literarius em massa

| # | Oportunidade | Volume | Porta | Veredito |
|---:|---|---:|---|---|
| 1 | **Pedido de site e marketplace** | 27.633 já entraram, cerca de 2.400 por mês | `IntegraLojaURL`, pull do ERP a cada 30 s | **VIÁVEL e já em produção.** Único caminho comprovado. Três ressalvas: a URL é do fornecedor e não se sabe se a Heziom pode postar nela, o polling roda no desktop de uma pessoa, e **essa porta não alcança os 26,65% do faturamento que não passam por pedido** (4.13) |
| 2 | **Pedido de link de pagamento** | 37 pagos por mês, R$ 16.689,75 | `PUT PedidoVenda` (não provado) ou digitação | **BLOQUEADO.** `payment_links.items` está vazio em **96 de 96**, e o que existe é `description` em texto livre ("Devocionais MDA", "156 livros Lanterna de Mar"). Endereço: **0 de 96**. E `PedidoVendaItens` exige código interno do produto, não EAN |
| 3 | **Enriquecimento de cadastro** (aniversário, telefone, opt-in, tipo de cliente) | 6.284 mais 5.253 mais 36.446 sobre parceiros que **já existem** no ERP | Nenhuma | **IMPOSSÍVEL HOJE.** Não há PUT de Parceiro, não há INSERT no SQL, não há staging, não há procedure. É o maior valor e o "não há caminho" mais bem provado |
| 4 | **Segmentação comercial** | 91.495 leads mais 24.762 clientes classificados | Nenhuma | **IMPOSSÍVEL, e o problema não é falta de modelo.** A segmentação teria onde morar: `Parceiro.ClienteTipoCliente`, coluna `int` que aponta para o lookup `TipoCliente` de 7 linhas. O campo existe e está **99,52% vazio** (253 classificados em 52.275, com 50.788 em 0 e 1.234 em NULL, medido às 19:26). **O modelo existe, está vazio e é inalcançável de fora**: não há rota de escrita nem pela API nem pelo SQL |
| 5 | **Status de entrega** | 165 entregas confirmadas | Nenhuma | **IMPOSSÍVEL.** `PedidoVendaRastreio`, que a API expõe, tem **0 linhas** no banco inteiro. O rastreio real vive em `LogisticaEtiqueta`, sem rota |
| 6 | **Baixa e pagamento** | 3.530 baixas em julho | Nenhuma | **IMPOSSÍVEL.** Sem endpoint de baixa, sem escrita SQL |
| 7 | **Classificação de DRE** | 9 contas, 92,2% do caixa de julho | Nenhuma | **IMPOSSÍVEL escrever, e não precisa.** O ERP não tem onde guardar (`GrupoDRE=0` em 100%). O HeziomOS deve ser a fonte de verdade da DRE, lendo o espelho |
| 8 | **Crédito de cliente por devolução** | 221 notas de devolução, R$ 2.234.188,08, e nenhuma gera financeiro | Nenhuma | **IMPOSSÍVEL de fora, e é decisão de processo antes de ser de integração.** `CreditoParceiro` existe desde 2019 com **0 linhas**, `NotaFiscal.AbaterCredito` está em 0 de 42.888, e `/TCreditoParceiroController/` dá 500. Ver 4.18 |

### 8.1 Os caminhos alternativos, medidos

| Caminho | Veredito |
|---|---|
| **(a) Staging no SQL** | **Não existe e não é acessível.** Varredura das 190 tabelas por import, staging, tmp, temp, fila, queue, carga, integração e extern: nada. E `acessoExterno` tem 0 INSERT em 190 de 190 tabelas |
| **(b) Stored procedure** | **Não existe para negócio.** As 6 procedures são as auxiliares de diagrama do SSMS de 2015 (`sp_creatediagram` e afins): têm EXECUTE concedido, mas só escrevem em `sysdiagrams`. As 4 funções de negócio são `TF` de leitura, com SELECT concedido, e função de tabela não escreve. E o banco não protegeria: 0 check constraints, 4 triggers, nenhuma em tabela financeira |
| **(c) `IntegraLojaURL`** | **A porta real.** Ligada, testada por 27.633 pedidos. Falta a autorização comercial |
| **(d) Planilha de importação do ERP** | **Não medido.** Não há sinal no banco, mas isso é ausência de evidência, não prova |
| **(e) Processo humano** | **É o que roda hoje.** 200 pedidos digitados à mão entre 01/07 e 06/08 (sem `SiteIdPedido`), por arthur 136, igor 51, hevelyn 4, pedro 4, mococa 3, rayssa 2. Cerca de 5,5 por dia útil. Canais 100% manuais no período: ATACADO 88, MARKETING 36, EDITORIAL 4, EVENTO 3, SHOWROOM 3 |

### 8.2 Custo manual que volta na mão hoje

| Tarefa | Volume medido |
|---|---|
| Lançamento de link de pagamento | 37 pagos em 30 dias, 22 marcados. A edge `crm-payment-link-literarius-mark` **só escreve no Supabase**, não toca no ERP. Latência mediana 1,05 h, média 20,24 h, com casos de 84,9 h, 99,1 h e 123,2 h. 15 pendentes, R$ 3.361,97 (janela A) |
| Digitação de pedido | 200 em 36 dias (janela A) |
| Lançamento manual de título | O lado a pagar é 75,74% manual: **3.009 títulos, R$ 6.957.935,91, com `Origem` NULL** (janela B). Por mês, sem origem: jan 320 · fev 170 · mar 155 · abr 169 · mai 172 · jun 139 · jul 90 · ago parcial 7, cerca de 150 por mês (janela A) |
| Baixa | jul 3.720 · jun 3.158 · mai 3.100 · abr 2.184 (janela B). **2.156 de julho, 58%, ficam sem conta bancária**, R$ 274.705,71. Ver 4.8 |
| Cobrança pendurada | 21.263 títulos vencidos, R$ 2.198.726,53, que é 93% do saldo em aberto, e nenhum encargo é cobrado |

A marcação de lançamento é **texto livre**: dos 22 `literarius_numero_pedido`, só 16 são número
puro. Os outros são `"98465 - Site Efésios"`, `"Logística reversa"`, `"Pedido Lit 27627 -
Livraria Logos - Orlando Portela"`, `"Pedido Literarius 27512"`, `"97007 - Site"`. E **nenhum dos
22 é conferível**, porque `lit_mirror_fiscal.pedidos_venda` **não tem a coluna `numero`**: foi
varrido o `information_schema` em todos os schemas `lit_mirror%` e nenhuma tabela expõe o número
do pedido de venda. O comentário da migration 20260729170000 promete "chave de junção futura com
`lit_mirror.numero_pedido`" e essa coluna não existe.

### 8.3 O freio que trava tudo

A ponte de identidade estava quebrada há 28 h na janela A, com erro registrado:

```
permission denied for function chave_telefone_br
```

`audit.sync_rejects`: **1.139 tentativas e 285 parceiros distintos**, o primeiro em 05/08 13:51
UTC e o último em 06/08 17:51 UTC.

Efeito medido: `cad.parceiros` estava parado desde 05/08 12:06 UTC (52.003 no espelho contra
52.263 no SQL ao vivo, 260 a menos), e contatos com `source_channel='literarius'` **pararam de
nascer em 05/08 05:00 UTC**. Às 19:22 BRT da janela B o SQL ao vivo já estava em 52.275 parceiros,
o que aumenta a distância se o espelho continuar parado. **O estado do espelho não foi remedido
na janela B.**

**Enquanto isso não for corrigido, qualquer plano de casar HeziomOS com Literarius por CPF ou
telefone trabalha em cima de cadastro parado.**

E o espelho fiscal perde nota corrente: das 623 NFs de agosto no SQL, **34 faltam** no espelho.
Não é atraso: 11 são doações (TipoNota 8) de 04 a 06/08, 6 são devoluções de venda (TipoNota 6)
de 04 e 05/08, e só 5 são vendas emitidas depois do último ciclo. O padrão se repete todo mês
(julho: 3.797 no SQL contra 3.500 no espelho). **Causa raiz não descoberta.**

---

## 9. Riscos e armadilhas operacionais

### 9.1 As que mudam o dado sem avisar

| # | Armadilha | Consequência |
|---:|---|---|
| 1 | **`?dataAlt` inválido devolve a base inteira com `sucess:true`.** Vale para `?dataAlt=lixo`, `?dataAlt=` vazio, `?dataAlt=2026-13-45` e até `?dataAlt=06/08/2026` no formato brasileiro | Um sync que erre o formato faz varredura completa todo ciclo se achando incremental, e nunca reclama. Em Título devolve a base R mais P |
| 2 | **`/Pagar/?dataAlt=<inválido>` devolve contas a RECEBER.** Reproduzido: `tipoTitulo='R'`, ids 3 a 92, sendo que o menor id de Pagar é 109. O `?page` também é ignorado | Cursor mal formatado faz conta a receber entrar como conta a pagar, em silêncio total |
| 3 | **`?pago` só entende a string `'true'` minúscula.** `?pago=1`, `?pago=TRUE`, `?pago=xyz` e `?pago=` **todos** devolvem o conjunto dos NÃO pagos | Quem escrever `?pago=1` esperando os pagos recebe exatamente o oposto |
| 4 | **`?status=` derruba o PedidoVenda com HTTP 500**, inclusive vazio. `?Status=` com maiúscula é ignorado e responde 200 | Mina terrestre para qualquer montador de querystring |
| 5 | **Id inexistente não dá 404 em lugar nenhum.** PedidoVenda, NotaFiscal e Inventario devolvem **200, `sucess:true`, registro fantasma zerado** (`id=0`, `cliente=null`, data 1899-12-30). Título e Produto devolvem 200 com `data:[]` ou `sucess:false` | Um integrador que confie em `sucess` ou em `data.length` processa lixo. Testar `data[0].id != 0`, e ver o risco 31, que este teste **não** pega |
| 6 | **A lista de NotaFiscal é ordenada por `dataEmissao`, não por id.** Página 1: 27884, 27885, 27886, depois 1 | Paginar assumindo ordem de id perde e repete registros |
| 7 | **`numero` não é `id`.** No título divergem em 37.241 de 63.066 (janela A), no pedido só 1.860 de 29.370 coincidem, e `/NotaFiscal/4882` tem `numero=67088` | O número que o humano vê no ERP não serve para buscar. Usar sempre o `id` |
| 31 | **Página morta: HTTP 200, `sucess:false` e SEM a chave `data`.** No `/Pagar/`, de 50 a 1.000 títulos por varredura, conforme o `?size`. Determinístico, retry não resolve | `resp.get("data", [])` termina o ciclo em silêncio com até 25% dos títulos faltando. **O único teste soberano é reconciliar `page.totalRecords` contra a soma de `len(data)`.** Ver 4.5 |
| 32 | **Erro de parâmetro nunca vira status HTTP.** `size=0`, `size=-1` e `page=0` devolvem **HTTP 200** com `sucess:false` | Monitor que olha código de resposta não vê falha nenhuma. **O contrato de erro é o campo `sucess`, com o erro de grafia, não o status** |
| 33 | **A API renderiza `Origem` NULL como `0`.** Confirmado no título 65743 | Não dá para distinguir "lançamento manual, sem origem" de "origem de código 0". São 3.099 títulos manuais, R$ 7.058.597,76, que a API entrega como se tivessem origem zero |
| 34 | **A API não expõe o tipo de nota traduzido e não tem campo `cancelada`.** `/TNotaFiscalController/TipoNota` dá 500, e o cancelamento só se infere de `nFeStatus=3` | Quem somar `totalNota` das 42.888 notas soma devolução, doação, remessa e consignação como se fossem venda, e ainda conta as 182 canceladas. O faturamento real são só os tipos 1 e 13 não cancelados |

### 9.2 As de tipo e formato

| # | Armadilha | Consequência |
|---:|---|---|
| 8 | **Os timestamps têm 'Z' falso.** A API devolve `2025-08-27T14:09:49.727Z` e o banco guarda literalmente `14:09:49.727`. O relógio do servidor é BRT: na janela B, `GETDATE()`=19:22:04 e `SYSUTCDATETIME()`=22:22:04 na mesma consulta | Quem parsear como UTC erra 3 horas. Em `emissao` e `vencimento`, que vêm `T00:00:00.000Z`, o erro joga a data para o **dia anterior**. **Exceção medida:** no PedidoVenda a API converte certo (SQL 15:30:45 vira API 12:30:45Z). O comportamento **não é uniforme entre controllers** |
| 9 | **Data nula vira `1899-12-30T00:00:00.000Z`** (zero do Delphi), nunca `null` | Filtro de data precisa excluir esse sentinela nos dois extremos. `PedidoVenda` tem `MIN(DataPedido)` igual a 1899-12-30 |
| 10 | **`message` troca de tipo**: string vazia no sucesso, `[{text}]` no erro | Parser tipado quebra no primeiro erro |
| 11 | **Arrays não são arrays**: `{"ownsObjects":true,"listHelper":[...]}` | Cliente tipado que espera lista quebra no parse |
| 12 | **1.304 títulos têm valor com 3 ou 4 casas decimais** (por exemplo 209,235 e 99,2699). O tipo `money` do SQL Server tem 4, e a API transporta fielmente | Quem guardar em `NUMERIC(x,2)` perde centavos |
| 13 | **`cnpjCpf` vem sem zeros à esquerda, e a sujeira está no banco.** `LEN` no SQL: 11 em 40.662, 10 em 8.616, 14 em 825, 9 em 928, 8 em 90, 13 em 63, 7 em 10, 12 em 4, 4 em 1, vazio em 1.055. Cerca de 9,6 mil registros, 18% | Regra: até 11 dígitos, zfill(11) como CPF; de 12 a 14, zfill(14) como CNPJ. Mesma classe do problema já conhecido da chave de telefone sem DDI |
| 14 | **`Produto` mistura dois formatos de data no mesmo objeto**: `dataCadastro` é `'25/08/2025 14:01:13'` e `dataAlt` é ISO com Z | n/d |

### 9.3 As de integridade e negócio

| # | Armadilha | Consequência |
|---:|---|---|
| 15 | **A baixa muitas vezes não levanta o `dataAlt` do título.** R$ 5.851.757,89 em 10.135 títulos nesse estado às 19:24 BRT | Sync incremental do financeiro por `dataAlt` está errado por construção. Ver 4.4 |
| 16 | **Não dá para detectar exclusão.** Não há flag de cancelado (`situacao` é constante) e há 2.563 buracos na sequência de `idTituloFinanceiro`, 2.565 títulos, 1.356 baixas e 132 lançamentos apagados fisicamente | Linha apagada some da API sem sinal nenhum, e a auditoria está desligada |
| 17 | **`valorPago > valor` em 1.679 títulos R e 4 P** (baixa duplicada), e 6 títulos P com `pago=true` e `valorPago=0` | Quem somar `valorPago` como recebimento estoura o caixa |
| 18 | **A API de Parceiro esconde `Status<>1` em silêncio** (8 parceiros, mais 2 transportadoras). Produto faz o oposto e entrega os inativos | Um parceiro desativado não gera evento nenhum, só para de aparecer. **Regras opostas nas duas entidades** |
| 19 | **`volumes[]` da NF vem sempre vazio** apesar de `NotaFiscalVolume` ter 31.903 linhas. A NF 4882 tem 111 volumes no SQL e a API devolve `volumes:[]` com `qtdeFrete=111` no mesmo payload | Usar `qtdeFrete` ou ir ao SQL |
| 20 | **O elo NF para Pedido não existe pela API.** `idPedidoVenda` e `idPedidoVendaItens` vêm 0 no cabeçalho e nos itens, apesar de 28.897 NFs terem o vínculo no SQL | O único correlacionador que sobra é `pedidoCliente`. E `siteIdPedido` da NF também vem vazio, apesar de 27.389 NFs terem o valor no banco, **enquanto no PedidoVenda o mesmo campo funciona** |
| 21 | **A API zera campos de classificação contábil da NF**: `vendedor`, `canalVenda`, `portador`, `situacao`, `planoConta` e `centroResultado` voltam 0, enquanto no banco 94.634 de 95.691 itens (98,9%) têm PlanoConta e CentroResultado, e 42.687 notas têm Vendedor | Pela API **não dá para atribuir receita a vendedor, canal, plano de contas nem centro de resultado**. E o zero se disfarça de "não classificado" em vez de "não enviado" |
| 22 | **`parceiro{}` aninhado é projeção capenga**: `dataAlt` igual a 1899-12-30, `usuarioAlt` igual a `''`, `dataAniversario` e `dataCadastro` como **número 0** em 100% de 5.000 registros | Não serve para sincronizar cadastro nem para detectar mudança |
| 23 | **Em Parceiro, o `dataAlt` do payload vem sempre zerado, mas o filtro funciona** | Dá para pedir o incremental e não dá para saber quando cada registro mudou. **Tem que guardar a data que você pediu** |
| 35 | **Devolução não gera financeiro: 221 notas, R$ 2.234.188,08, `GeraFinanceiro=0` em 221 de 221, e zero títulos.** Não há título negativo nem crédito de cliente em lugar nenhum | O saldo a receber está inflado por mercadoria devolvida, e não é possível dizer quanto: a nota de devolução de venda não aponta para pedido, para nota original nem para título. Ver 4.18 |
| 36 | **De-para de conta bancária com 2 de 17 formas: 16.885 baixas, R$ 2.605.932,74, entram sem conta e somem de `vwMovimentoContaBancaria`** | Saldo por conta é sistematicamente subestimado, e a proporção piora (63,9% na primeira semana de agosto). Ver 4.8 e incidente 3 |

### 9.4 Operacionais e de segurança

| # | Risco |
|---:|---|
| 24 | **`?size` grande castiga o ERP em produção.** size=5000 no Título deu 62 s e 15,7 MB numa resposta, em Parceiro 109 s e 11,5 MB. `/TInventarioController/Inventario/` sozinho é 3,6 MB e 13 a 18 s, sem filtro nenhum. Sweet spot medido: **size=200**. Atenção: no `/Pagar/` size grande também aumenta a perda por página morta (4.5), então o compromisso ali é outro |
| 25 | **O texto de erro vaza a stack do banco**: `[FireDAC][Phys][ODBC][Microsoft][SQL Server Native Client 11.0][SQL Server]...`. Com `?page=0` revelou "OFFSET não pode ser negativo", e a página morta do Pagar revela nome de classe interna (`TTituloFinanceiroRateio`) |
| 26 | **O banco guarda segredo em texto puro, legível por qualquer conta com SELECT, inclusive a somente leitura.** `ConfiguracaoGeral` guarda usuário e senha da integração e `NFeNumeroCertificado`. `PosControleConfiguracao` (14 linhas) tem `SenhaPosControle` e `ChaveAPIPosControle`. `ContasPagarConfiguracao` guarda o convênio bancário. **Nenhum desses valores foi lido ou reproduzido** |
| 27 | **A tabela `Usuario` expõe a coluna `Senha` dos 19 usuários do ERP**, e ela não aparenta ser hash: comprimentos entre 14 e 20, só 3 tamanhos distintos entre 19 usuários, o que descarta MD5 e SHA. `db_datareader` não tem granularidade: quem lê pedido lê a senha do ERP. **Isto é o incidente 1**, e o endpoint `/TUsuarioController/Usuario` devolve o mesmo dado sobre HTTP |
| 28 | **A entrada de pedido depende de um micro ligado.** Ver 6.5 |
| 29 | **A janela de dados é curta.** Quase tudo começa entre agosto e setembro de 2025: `MovimentoEstoque` desde 25/08/2025, `TituloFinanceiro` R desde 31/03/2025, baixas desde 01/09/2025, `ContaBancariaLancamento` desde 01/09/2025, `PedidoVendaHistorico` desde 01/09/2025, `NotaFiscal` desde 02/05/2025, `LogisticaEtiqueta` só desde 05/12/2025, **faturamento de venda válido só desde set/2025**. Só `TituloFinanceiro` P (30/08/2024) e `ProdutoPreco` (06/09/2024) vão mais para trás. **Não há dois anos completos para comparação ano contra ano** |
| 30 | **A base é viva, e a lição não é a que parecia.** Entre a janela A e a B, cerca de 3 horas, a base andou: Parceiro +13, Produto +11, Pedido +17, NF +59, Receber +112, Pagar +3. Mas quando API e SQL foram lidos **a 23 segundos de distância**, o total declarado pela API bateu exatamente com o `COUNT(*)`, ao registro, em cinco das seis entidades (bater no contador não significa entregar as linhas — ver incidente 2). **A conclusão certa não é "os números são instáveis", é: volume só é comparável se as duas pontas forem lidas no mesmo minuto. Comparação com número de horas atrás sempre acusa falsa divergência** |

---

## 10. O que não foi verificado, e por quê

### 10.1 Por proibição explícita

- **`/PedidoVendaStatus/{empresa}/{numero}/{status}` não foi chamado em nenhuma forma**, em
  nenhuma das duas janelas. É um GET que altera status em produção. O domínio de status veio de
  `SELECT` em `PedidoVendaStatus`.
- **`/TUsuarioController/Usuario` não foi chamado na rodada de fechamento**, por decisão de não
  coletar senha. O achado do incidente 1 vem de uma medição da janela A que **não foi
  reproduzida**.
- **Nenhum verbo além de GET.** O contrato inteiro do `PUT PedidoVenda` é inferência a partir do
  GET, do roteamento DataSnap e do schema SQL.
- **Nenhuma escrita no SQL.** Nenhum INSERT, UPDATE ou DELETE foi tentado. A conclusão "não
  consegue escrever" vem de `HAS_PERMS_BY_NAME` por objeto e de `fn_my_permissions`.
- **As 6 procedures `sp_*diagram` não foram executadas**, apesar de terem EXECUTE concedido:
  executá-las seria escrita em `sysdiagrams`. A afirmação de que só tocam `sysdiagrams` vem do
  comportamento conhecido dos objetos de diagrama do SSMS, não de leitura do código.
- **Rotas com 3 ou mais argumentos no `TNotaFiscalController` não foram testadas**,
  deliberadamente: o padrão `/Entidade/{empresa}/{numero}/{status}` é exatamente a assinatura do
  endpoint proibido. Pode existir uma rota de filtro por período que não foi alcançada.

### 10.2 Por limite de permissão do banco

- **Nenhuma definição de view, trigger, função ou procedure foi lida.** `acessoExterno` não tem
  `VIEW DEFINITION`: `OBJECT_DEFINITION` devolve NULL nas 62 views e `sys.sql_modules` tem 77
  linhas com `definition` NULL. O que as 4 triggers fazem está **inferido por nome mais evidência
  de dados**. A composição de `vwMovimentoContaBancaria` (LB, BF, TF) foi deduzida batendo
  contagens. **Por que `vwProdutoCusto` zera e por que `vwBookInfoVendas` recorta linhas
  diferentes são perguntas sem resposta possível com esta permissão**: sei o que elas fazem,
  medido por anti-join e comparação, não por quê.
- **`sys.dm_db_partition_stats` está negado.** Foi usado `sys.partitions`, que é estimativa, e
  cerca de 40 tabelas foram remedidas com `COUNT(*)` exato. Onde dá para comparar, a estimativa
  erra sempre para menos (`MovimentoEstoque` 226.669 estimado contra 226.700 exato).
- **Não foram contadas as linhas de 53 das 62 views**, para não pesar num banco de produção com
  views de mais de 100 colunas.
- **Não foram medidas as permissões dos outros logins do SQL Server.** Existe alguma conta com
  escrita, porque o ERP escreve, mas não se sabe qual nem o que ela pode.

### 10.3 Por decisão de escopo ou cuidado com produção

- **Nenhum dump completo de entidade.** Na janela A: Parceiro 250 registros amostrados, Produto
  200, Título 5.000 mais 3 páginas espalhadas. As afirmações de "sempre" valem para essas
  amostras. As estimativas de tempo de varredura (cerca de 12 min para o Receber, 29 min para
  NotaFiscal, 10 h para varrer NF por id) são **extrapolação**, não medição.
- **As 297 páginas de `/Receber/` não foram varridas.** Foram amostradas 22, espalhadas. A
  conclusão de que o lado R está limpo de páginas envenenadas se apoia no SQL, que é censitário
  (0 `Percentual` negativo em 59.627 linhas de rateio R), não na amostra da API.
- **Não foi testado `?size` acima de 500 nas varreduras do Pagar**, nem descoberto se existe teto
  de `size` aceito pela API. Na janela A, 5.000 funcionou e levou 62 s.
- **Não foi testado se as páginas envenenadas também aparecem em varredura incremental por
  `?dataAlt`.** A perda foi medida só na varredura completa.
- **Não foi testado o `/Receber/{id}` contra nenhum caso de falha**, porque não há candidato
  envenenado do lado R.
- **Não foi auditada nenhuma outra tabela filha atrás do mesmo tipo de envenenamento.** Só
  `TituloFinanceiroRateio`. Não se sabe se `NotaFiscal`, `PedidoVenda` ou `Parceiro/enderecos`
  sofrem da mesma classe de defeito.
- **Não foi testado se há rate limit.** Foram mantidos 400 a 450 ms em todas as chamadas e nunca
  houve bloqueio.
- **Não foram sondados nomes de método por adivinhação no `TPedidoVendaController`**, onde um GET
  pode gravar. Portanto não se sabe se existem endpoints além dos catalogados ali.
- **Nenhum saldo, valor ou conta deste documento foi conferido contra extrato bancário real.**
- **Os números do lado HeziomOS e Supabase da seção 7 e do item 8.3 não foram remedidos na janela
  B.** São todos da janela A.

### 10.4 Perguntas em aberto que valem trabalho

1. **`integra.literarius.com.br/integration/heziom/api/v1` aceita POST da Heziom?** É a maior
   incógnita e a de maior valor de todo o documento.
2. **Quem gravou o `Percentual = -922337203685477,5808` nas 6 linhas de rateio?** Qual tela,
   rotina ou usuário. Sabe-se só que os 6 títulos têm `Origem` NULL, ou seja lançamento manual, e
   `DataAlt` em 14/01, 14/04 e 15/04 de 2026. E não foi medido se corrigir as 6 linhas resolve de
   fato, porque só leitura foi permitida.
3. **Existe rotina de importação por planilha no ERP?** Não há sinal no banco, mas ausência de
   evidência não é prova.
4. **Causa raiz do buraco de NFs no espelho fiscal.** O buraco foi caracterizado (doação,
   devolução, remessa e cerca de 5% das vendas de cada mês), a lógica que o produz não.
5. **Divergência do saldo de estoque do produto 1, setor 1: 963 contra 893**, as duas medidas na
   janela A. Precisa ser refeita.
6. **O que é `origem=13`** (15 títulos R, `OrigemIdRegistro` de 1 a 6, R$ 16,00 no total). Não há
   tabela de domínio de `Origem` no banco e nenhuma tabela de destino casou por faixa.
7. **O evento de abril/2026**: 10.418 baixas no mês, 8.465 delas sem tocar o `DataAlt` do título.
   Aparece igual nos dois critérios de data, o que descarta artefato, mas a rotina que o produziu
   não foi identificada.
8. **Se o `DataAlt` do título é levantado por outras operações além da baixa** (edição de
   vencimento, agrupamento, remessa). Foi medida apenas a relação entre baixa e `DataAlt`.
9. **Qual é a outra rota que preenche `ContaBancaria` na baixa sem existir linha de de-para.**
   MERCADO PAGO, BOLETO, DEBITO EM CONTA e PIX QR CODE acertam a conta sem de-para. Pode ser
   código da integração ou digitação na tela de baixa.
10. **Se a criação da linha de de-para do PIX SITE foi mesmo o evento de 19/09/2025.**
    `ContaBancariaFormaPagto` não tem `DataAlt` nem `UsuarioAlt`, então a coincidência de data é
    forte, mas é inferência. E o que havia nas 2 linhas apagadas (ids 1 e 2) não é recuperável
    por SELECT.
11. **Se a tela do ERP permite criar linha em `ContaBancariaFormaPagto` e preencher juros, multa
    e protesto em `CobrancaConfiguracao`.** A recomendação de conserto por digitação pressupõe
    que essas telas existem e estão liberadas.
12. **Por que 1.436 notas de venda válidas (R$ 187.252,47) não geraram título financeiro**, e por
    que 8 das 74 notas de devolução com `MoveEstoque=1` não geraram movimento de estoque.
13. **Se `ControleCaixa.ValorFechamento` (R$ 1.500.190,82) deveria bater com o faturamento do PDV
    (R$ 1.550.747,34).** A diferença de R$ 50.556,52, ou 3,3%, pode ser recorte de turno ou de
    forma de pagamento.
14. **Como a forma de pagamento do PDV vira forma de pagamento do ERP.** O de-para `FormaPagtoPdv`
    está com o lado Literarius nulo nas 4 linhas e o caminho real não foi encontrado.
15. **A queda de 24,6% no faturamento médio mensal** entre set-fev e mar-jul. Medida, não
    explicada.
16. **A 1 nota de 42.888 em que a identidade `TotalNota = TotalProduto − Desconto + ValorFrete +
    OutrasDespesas` não fecha**, os 380 itens com CST ICMS 300, os 61 com CST vazio e as 230 notas
    sem canal.
17. **Se os 8 parceiros com `Status<>1`** (6 com Status=2, 2 com Status=0) são exclusão lógica,
    bloqueio ou outro estado. Há tabela de domínio de `Status` não consultada. E por que 1.234
    parceiros têm `ClienteTipoCliente` NULL enquanto 50.788 têm 0.
18. **Se os 2.565 títulos apagados** foram cancelamentos legítimos, correções de digitação ou
    outra coisa. Com a auditoria desligada não há como saber.
19. **Se as 2.242 baixas com data futura** são agendamento de liquidação de cartão ou erro. Só
    foram medidos volume e forma de pagamento.
20. **Quem atribui o `PedidoVenda.Numero`.** Está provado que não existe gerador no banco. O
    padrão MAX+1 é inferência sobre os dados, não leitura de código. E não foi lido o `ORDER BY`
    do servidor da API: a ordenação por `idTituloFinanceiro` crescente é inferida das faixas de
    id por página e corroborada por a posição ordinal calculada no SQL ter previsto corretamente
    as páginas mortas nos 5 tamanhos testados.
21. **Se os defeitos da NotaFiscal** (`volumes[]` vazio, `idPedidoVenda=0`, `siteIdPedido` vazio,
    campos contábeis zerados) são bug ou omissão deliberada do fornecedor. O comportamento foi
    constatado contra o banco, a intenção não.
22. **A empresa 2** (Livraria Heziom, mesmo CNPJ 40804477000144) existe cadastrada e tem **0
    movimento** em todas as tabelas medidas. Não se sabe se é filial futura ou resíduo.
23. **Os valores de `ConfiguracaoGeral`** (406 chaves) não foram inspecionados além do bloco
    `Integra*`. Podem conter regras que mudam o número (arredondamento, método de custeio) e
    contêm segredo.
24. **O contraste "165 entregas confirmadas contra 7 no ERP"** tem uma ressalva: nenhum dos 165
    entregues casou com etiqueta do ERP por código (os 215 que casam estão todos em trânsito ou
    postados). Não foi investigado se é formato de código diferente ou etiqueta distinta.
25. **`admin.integration_configs` com as 3 chaves vazias** é informação passada pela orquestração.
    Não foi medida nesta rodada. Ver seção 2.
26. **A apuração fiscal não foi validada com contador.** O zero de imposto é o que está gravado, e
    a leitura de que decorre da imunidade de livro é plausível e sustentada pelos CST, mas não é
    parecer fiscal. IRPJ, CSLL, tributo sobre serviço e retenções não aparecem em `NotaFiscal` e
    não foram procurados em outro lugar.

---

## Anexo A. O que mudou em relação ao rascunho de 06/08

Este documento substitui o rascunho da tarde de 06/08/2026. Sete afirmações daquele texto foram
**refutadas por medição** e não devem sobreviver em nenhuma cópia:

| O rascunho dizia | O que foi medido |
|---|---|
| "O título financeiro sai inteiro pela API" | **Não sai.** O `/Pagar/` perde de 50 a 1.000 títulos por varredura, conforme o `?size`, com HTTP 200 e sem a chave `data`. Ver 4.5 |
| "`acessoExterno` não tem EXECUTE na função de custo, não dá para reaproveitar a regra do ERP" | **Erro de categoria.** As 4 funções são table-valued, a permissão que vale é SELECT, e ela está concedida. A função foi **executada** às 19:22 e devolve custo. Ver 4.19 |
| "`size=0` devolve HTTP 500" | **Devolve HTTP 200 com `sucess:false`.** Nenhum erro de parâmetro vira status HTTP. Ver seção 2 e risco 32 |
| "`Origem=1` em 59.028 de 59.028 títulos" | Número que não existe em recorte nenhum. O real é **59.099 de 59.204 títulos R (99,82%)**, e o lado a pagar é o inverso: **75,74% sem origem**. Ver 4.1 |
| "Baixa mais de 1 dia depois do último `DataAlt` do título: 10.134 títulos, R$ 5.841.003,44" | A descrição não correspondia ao critério medido, e a soma estava R$ 1.000 errada. Pelo critério correto (`DataAlt` da linha de baixa): **10.135 títulos, R$ 5.851.757,89**. Ver 4.4 |
| "`ClienteTipoCliente`" tratado como entidade | É **coluna** de `Parceiro`, ponteiro para a tabela `TipoCliente` de 7 linhas. Ver 3.2 |
| "16.846 baixas sem conta bancária, buraco sem causa atribuída" | A causa está medida: **`ContaBancariaFormaPagto` com 2 de 17 formas**. Hoje são 16.885 baixas e R$ 2.605.932,74, e 4 linhas de configuração cobrem 96%. Ver 4.8 e incidente 3 |

Além disso, os volumes de todas as entidades foram recarimbados com API e SQL a 23 segundos de
distância, o faturamento inteiro (seções 4.10 a 4.16) e a devolução (4.18) são material novo, e
`MIN(AjusteManualCusto.DataAjuste)` foi corrigido de 02/09/2025 para 01/09/2025 23:59:59.
