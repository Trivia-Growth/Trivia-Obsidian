---
tags: [financeiro, fechamento, questionário, respondido]
status: respondido
criado: 2026-05-19
respondido: 2026-05-21
destinatário: Ana Zechmann / Rafael Barbosa
referência: "[[Fechamento Mensal — Automação Completa]]"
---

# Questionário — Detalhamento do Processo de Fechamento Mensal

> **Para:** Equipe Financeira (Ana / Rafael)
> **De:** JG Novais — Trivia (projeto HeziomOS)
> **Respondido em:** 21/05/2026 por Ana Zechmann / Rafael Barbosa
> **Referência técnica:** Documento [[Fechamento Mensal — Automação Completa]]

---

## Seção 1 — Processo de Geração dos Relatórios

### 1.1 — CMV.xls

**P1.** Qual o caminho exato no Literarius para gerar este relatório?

> **Resposta:** Faturamento > Análise de vendas > filtra por período, geralmente de 1 a 31 do mês anterior > Buscar > Exportar

**P2.** Em abril o arquivo mudou de nome para "CMV - BRINDES - EBOOKS.xls" com sheets separadas. Isso é o padrão correto daqui para frente?

> **Resposta:** Sim, agora ao puxar esse arquivo, dentro dele precisamos separar a linha dos itens com a nomenclatura "Brinde" em outra aba no mesmo arquivo e nomear essa aba como BRINDE.

**P3.** Qual filtro vocês aplicam para CMV? É por PlanoConta (20/21)?

> **Resposta:** Referente ao CMV eu não coloco filtro algum. Eu uso esses filtros para puxar os pagamentos do mês referente ao material para revenda e produção material próprio e os passivos futuros para a contabilidade.

---

### 1.2 — Relação de Notas Fiscais por Número

**P4.** Qual menu/relatório do Literarius gera esse arquivo? Quais filtros?

> **Resposta:** Utilitários > Exportar > Faturamento. Nenhum filtro é utilizado nesse relatório para pegar todos os números reservados das notas do mês.

**P5.** O arquivo inclui NFs CANCELADAS? A contabilidade precisa das canceladas ou só das autorizadas?

> **Resposta:** Sim, foi solicitado em algum momento que todas devem estar relacionadas.

---

### 1.3 — Fluxos Bancários (Santander, Stone, CCs)

**P6.** Qual tela/relatório do Literarius gera os "Fluxos"?

> **Resposta:** Utilitários > Exportar > Movimentos Bancários. Exato, altera o filtro para a conta bancária desejada.

**P7.** A classificação (Plano de Contas + Centro Resultado) — ela já vem automática do Literarius?

> **Resposta:** Vem automático depois da classificação no lançamento de cada conta.

**P8.** Quando o campo "Origem" diz "BANCÁRIO" vs "BAIXA" — qual a diferença?

> **Resposta:** Baixa ocorre quando é realizada a baixa no módulo financeiro > Baixa de títulos financeiros. Bancário quando a conta é gerada e baixada via OFX na conciliação bancária.

---

### 1.4 — Fornecedores Pagos / A Pagar

**P9.** Qual relatório do Literarius gera o "Fornecedores pagos"? Quais filtros?

> **Resposta:** Utilitários > Exportar > Títulos Financeiros. Coloco "pagar baixas" > a data do mês de fechamento analisado. Filtro pelo plano de contas 20, puxo o relatório, depois puxo o 21.

**P10.** O filtro de separação é por PlanoConta: 20 vs 21?

> **Resposta:** Sim, dessa forma consigo as duas classificações que a contabilidade precisa.

**P11.** O "Fornecedores a pagar" — é simplesmente os títulos com Pago=0 e vencimento futuro?

> **Resposta:** Fornecedores a pagar é o mesmo procedimento que o dos pagos. A diferença é o "pagar abertos" > filtro de data referente aos meses posteriores ao do fechamento. Por exemplo, hoje é maio, estamos fechando abril — o fornecedores a pagar é referente ao dia 1 de maio até o final do ano. São dois relatórios também com o filtro 21 e 20 no plano de contas.

---

### 1.5 — Conciliação Bancária

**P12.** A conciliação hoje é feita comparando saldo diário ou item por item?

> **Resposta:** Item por item — extrato diário do Literarius com extrato diário dos bancos.

**P13.** Quando a conciliação NÃO bate — qual é o procedimento? Causas mais comuns?

> **Resposta:** Uma das causas é que pode ocorrer diferença de 1 centavo para o valor do boleto que está no banco e o valor do título financeiro — isso é comum de ocorrer. Quem determina os valores é o emissor da NF, boleto e XML. Para resolver é só ir no título financeiro e alterar o valor para corresponder com o que está no banco e então conciliar. Outra causa comum é a duplicação de títulos recebidos: damos baixa nos boletos recebidos e o OFX quer criar outro recebimento por não bater com o nome do Literarius.

**P14.** A conciliação da Stone — mesma lógica?

> **Resposta:** Sim.

---

## Seção 2 — Fontes Externas e Credenciais

### 2.1 — Gateways e Bancos

**P15.** Stone — acesso admin, integração API, volume?

> **Resposta:** Temos acesso ao extrato. Ainda não temos integração via API que a equipe do financeiro saiba. Lançamentos nos bancos aproximadamente 1.260.

**P16.** Mercado Pago — conta, chave API?

> **Resposta:** Só acessamos pelo portal web.

**P17.** AppMax — é gateway separado ou dentro da Tray?

> **Resposta:** Gateway separado. Precisamos ver isso com o João.

**P18.** Pagar.me — versão API, API Key?

> **Resposta:** Pagar.me está descontinuado. Também precisamos ver essa questão da API com o João.

**P19.** Amazon Seller Central — acesso Developer?

> **Resposta:** Temos acesso restrito. O João tem o login de admin.

### 2.2 — Logística e Frete

**P20.** Mandaê — portal web ou API?

> **Resposta:** Esses relatórios são puxados por solicitação da nossa expedição ao gerente da plataforma citada.

**P21.** Melhor Envio — conta Pro, OAuth?

> **Resposta:** Esses relatórios são puxados por solicitação da nossa expedição ao gerente da plataforma citada.

**P22.** Lalamove — credenciais API?

> **Resposta:** Esses relatórios são puxados por solicitação da nossa expedição ao gerente da plataforma citada.

**P23.** Mercado Livre — API ou portal?

> **Resposta:** Não. Quem tem acesso é o João.

**P24.** LogManager — o que é?

> **Resposta:** É mais uma transportadora. Pedimos os relatórios através da expedição para levantamento e envio à contabilidade. É mais conhecida por nós como To On Log.

**P25.** Módico/Correios — de onde vem o relatório?

> **Resposta:** Esses relatórios são puxados por solicitação da nossa expedição ao gerente da plataforma citada.

**P26.** Transpo — CT-e por XML ou portal?

> **Resposta:** Sim, e-mail e portal.

---

## Seção 3 — Regras de Negócio e Cálculos

### 3.1 — Direitos Autorais

**P27.** Como é calculado o valor de Direitos Autorais de cada autor?

> **Resposta:** No geral são % fixa por livro. Relatório retirado do Literarius através do módulo de Direito Autoral > Fechamento de Direito Autoral > seleciona o autor, a data do fechamento (geralmente o último dia do mês) > Buscar > Exportar para fazer o relatório para o autor. O resultado está na coluna Valor Autoral.

**P27b.** Onde está a tabela de contratos/parâmetros?

> **Resposta:** Direito Autoral > Parâmetro Autoral > Percentuais de Direitos Autorais.

### 3.2 — Comissões

**P28.** Qual a fórmula de comissão? (Lucas e Bruno)

> **Resposta:** % líquida das vendas do vendedor — 1,5% do Lucas, 5% do Bruno.

**P28b.** Base de cálculo?

> **Resposta:** Líquidas do canal atacado de cada vendedor.

### 3.3 — Bônus por Resultado

**P29.** Bônus é aprovado manualmente pela diretoria?

> **Resposta:** Existe uma meta estabelecida e é aprovada pela diretoria. Às vezes tem alguma campanha que também contempla isso.

### 3.4 — Apuração Moda

**P30.** O que é "moda" neste contexto?

> **Resposta:** O cálculo do Moda é feito através do relatório de vendas, onde filtramos o produto "Mães Orando, Deus Agindo" e calculamos os custos para chegar no líquido e dividirmos o lucro com a coprodutora Casa Editora Presbiteriana. Como os estoques foram zerados, não teremos mais até a próxima versão. A última apuração foi essa.

**P30b.** É um relatório do Literarius? Qual filtro?

> **Resposta:** É feito através do relatório de vendas onde filtramos o produto "Mães Orando, Deus Agindo" e calculamos os custos para chegar no líquido e dividirmos o lucro com a coprodutora Casa Editora Presbiteriana.

---

## Seção 4 — Formato e Entrega para Contabilidade

**P31.** A Contábil Ribeiro aceita em qualquer formato digital ou exige XLS?

> **Resposta:** Eles pedem as duas versões: XML e PDF.

**P32.** Existe algo que a contabilidade ainda exige em PAPEL?

> **Resposta:** Sim, a Movimentação Mensal — ou seja, a relação de todas as notas fiscais das contas que foram pagas no mês.

**P33.** As guias de recolhimento — quem gera?

> **Resposta:** A contabilidade — tanto a Contábil Ribeiro quanto a Porte Contábil.

**P34.** Quando o pacote está pronto, como entregam para a Contábil Ribeiro?

> **Resposta:** Uma pasta compartilhada no OneDrive.

---

## Síntese das Descobertas-Chave

### Caminhos confirmados no Literarius

| Relatório | Caminho | Filtros |
|---|---|---|
| CMV | Faturamento > Análise de vendas | Período (1 a 31 do mês), sem filtro de PlanoConta |
| NFs por número | Utilitários > Exportar > Faturamento | Nenhum (pega todas, inclusive canceladas) |
| Fluxos bancários | Utilitários > Exportar > Movimentos Bancários | Conta bancária desejada |
| Fornecedores pagos | Utilitários > Exportar > Títulos Financeiros | "Pagar baixas" + período + PlanoConta 20 ou 21 |
| Fornecedores a pagar | Utilitários > Exportar > Títulos Financeiros | "Pagar abertos" + mês seguinte até dez + PlanoConta 20 ou 21 |
| Direitos Autorais | Direito Autoral > Fechamento de Direito Autoral | Autor + data (último dia do mês) |
| Parâmetros DA | Direito Autoral > Parâmetro Autoral > Percentuais | — |

### Regras de negócio confirmadas

| Regra | Detalhe |
|---|---|
| CMV | Não usa filtro PlanoConta — pega todas as vendas do período. Separa "Brinde" em aba separada |
| Comissão Lucas | 1,5% sobre vendas líquidas do canal atacado |
| Comissão Bruno | 5% sobre vendas líquidas do canal atacado |
| Direitos Autorais | % fixa por livro (configurada no módulo Parâmetro Autoral) |
| Bônus | Meta + aprovação diretoria (semi-automático) |
| Moda | Coprodução "Mães Orando, Deus Agindo" × CEP — DESCONTINUADO (estoque zerado) |
| Conciliação | Item por item (NÃO saldo diário) |
| Contabilidade formato | XML + PDF (não XLS) |
| Contabilidade papel | Sim — "Movimentação Mensal" (relação NFs das contas pagas) |
| Entrega | Pasta compartilhada OneDrive |
| Guias | Geradas pela contabilidade (Contábil Ribeiro + Porte Contábil) |

### Mudanças no plano de integração

| Item | Status | Ação |
|---|---|---|
| Pagar.me | ❌ DESCONTINUADO | Remover do roadmap |
| AppMax | ⚠️ Gateway SEPARADO da Tray | Pedir credenciais ao João |
| Logística (Mandaê, Melhor Envio, Lalamove, LogManager, Módico) | ⚠️ Relatórios VIA EXPEDIÇÃO | Não há API direta — solicitação manual ao gerente de cada plataforma |
| Amazon, ML | ⚠️ Acesso restrito | João tem admin — pedir credenciais |
| Stone | ⚠️ Sem API ativa | Financeiro só acessa extrato web — pedir ativação API ao João |
| Mercado Pago | ⚠️ Só portal web | Pedir criação de Access Token ao João |
| LogManager | = To On Log | Transportadora, relatório via expedição |

---

*Respondido em 21/05/2026 — Ana Zechmann / Rafael Barbosa*
*Síntese processada por JG Novais (Trivia) para atualização do HeziomOS*
