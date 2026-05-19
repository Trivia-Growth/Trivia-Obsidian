---
tags: [financeiro, fechamento, questionário, pendente]
status: aguardando-resposta
criado: 2026-05-19
destinatário: Ana Zechmann / Igor Santos
referência: "[[Fechamento Mensal — Automação Completa]]"
---

# Questionário — Detalhamento do Processo de Fechamento Mensal

> **Para:** Equipe Financeira (Ana / Igor)
> **De:** JG Novais — Trivia (projeto HeziomOS)
> **Objetivo:** Coletar informações detalhadas para automatizar 100% do processo de fechamento mensal no HeziomOS. Cada resposta nos ajuda a criar a integração correta.
> **Referência técnica:** Documento [[Fechamento Mensal — Automação Completa]]

---

## Como responder

- Respondam **diretamente neste documento** (ou num doc separado referenciando os números)
- Quanto mais detalhe, melhor — prints de tela do Literarius são muito bem-vindos
- Se não souberem a resposta, escrevam "não sei, perguntar para [pessoa]"
- Prazo ideal: até **XX/XX/2026** *(JG: defina a data)*

---

## Seção 1 — Processo de Geração dos Relatórios

> Referência: os arquivos na pasta `OneDrive > Financeiro Editora Heziom > 2026 > Contabilidade > Fechamento Compartilhado > {MÊS}`

### 1.1 — CMV.xls

📁 **Arquivo:** `{MÊS}/CMV.xls`
📋 **Schema confirmado:** ISBN, Descrição, Produto, Total Bruto, Total Líquido, Qtde, Custo, Custo Total, Margem, Desc. Médio, Vlr. Líquido Médio, Editora Nome, Capa Atual

**Perguntas:**

**P1.** Qual o caminho exato no Literarius para gerar este relatório?
> *(Ex: Menu > Relatórios > Faturamento > filtro por período + filtro X)*

**Resposta:** _________________________________________________

**P2.** Em abril o arquivo mudou de nome para "CMV - BRINDES - EBOOKS.xls" com sheets separadas (CMV-EBOOKS: 639 linhas + BRINDE: 5 linhas). Isso é o padrão correto daqui para frente? Ou janeiro (arquivo único "CMV.xls" com 605 linhas de livros) é que era o certo?

**Resposta:** _________________________________________________

**P3.** Qual filtro vocês aplicam? É por PlanoConta (20 = Materiais para Revenda, 21 = Produção Material Próprio)? Tem algum outro filtro (por editora, por tipo de produto)?

**Resposta:** _________________________________________________

---

### 1.2 — Relação de Notas Fiscais por Número

📁 **Arquivo:** `{MÊS}/Relação de notas fiscais por número.xls`
📋 **Schema:** Número, Série, Tipo, Parceiro, Nome, Emissão, Total Nota, Forma Pagto, Op. Fiscal, Frete, Modelo Fiscal, NFe Motivo, Canal Venda, Pedido Cliente (~4.253 NFs/mês)

**Perguntas:**

**P4.** Qual menu/relatório do Literarius gera esse arquivo? Quais filtros são usados (período, tipo de NF, status)?

**Resposta:** _________________________________________________

**P5.** O arquivo inclui NFs CANCELADAS (vimos "Cancelado" no campo NFe Motivo Ocorrência). A contabilidade precisa das canceladas ou só das autorizadas?

**Resposta:** _________________________________________________

---

### 1.3 — Fluxos Bancários (Santander, Stone, CCs)

📁 **Arquivos:** `{MÊS}/DFC/Fluxo Santander.xls`, `Fluxo Stone.xls`, `Fluxo CC *.xlsx`
📋 **Schema:** Tipo (C/D), Número, Data, Documento, Descrição, Valor, Forma Pagto, Origem (BANCÁRIO/BAIXA), **Plano de Contas**, **Centro Resultados**

**Perguntas:**

**P6.** Qual tela/relatório do Literarius gera os "Fluxos"? É o mesmo relatório com filtro por conta bancária diferente?

**Resposta:** _________________________________________________

**P7.** A classificação (Plano de Contas + Centro Resultado) — ela já vem automática do Literarius na hora da exportação? Ou alguém reclassifica manualmente depois?

**Resposta:** _________________________________________________

**P8.** Quando o campo "Origem" diz "BANCÁRIO" vs "BAIXA" — o "BANCÁRIO" são só tarifas/transferências diretas ou inclui outros tipos?

**Resposta:** _________________________________________________

---

### 1.4 — Fornecedores Pagos / A Pagar

📁 **Arquivos:** `{MÊS}/DFC/Fornecedores pagos {mês}.xls` e `Fornecedores a pagar {mês+1}-dez.xls`
📋 **Schema pagos:** 31 colunas incluindo Título, Parceiro, CNPJ, Valor, Data Pagamento, PlanoConta, CentroResultado, NF vinculada

**Perguntas:**

**P9.** Qual relatório do Literarius gera o "Fornecedores pagos"? Quais filtros? (Mês de pagamento? Tipo de título? PlanoConta específico?)

**Resposta:** _________________________________________________

**P10.** O filtro de separação é por PlanoConta: 20 (Mercadorias para Revenda) vs. 21 (Produção Material Próprio)? Ou vocês separam de outra forma?

**Resposta:** _________________________________________________

**P11.** O "Fornecedores a pagar" — é simplesmente os títulos com Pago=0 e vencimento futuro? Ou tem algum critério adicional (tipo ignorar parcelamentos futuros de empréstimo)?

**Resposta:** _________________________________________________

---

### 1.5 — Conciliação Bancária

📁 **Arquivos:** `{MÊS}/DFC/Fluxo Santander.xls` (sheet "Conciliação") e `Conciliação_Stone_*.xlsx`
📋 **Schema Conciliação:** Data | Fluxo Lit | Santander | Diferença

**Perguntas:**

**P12.** A conciliação hoje é feita comparando o saldo diário do Fluxo Literarius × saldo diário do Extrato? Ou é item por item?

**Resposta:** _________________________________________________

**P13.** Quando a conciliação NÃO bate (Diferença ≠ R$0,00) — qual é o procedimento? Vocês investigam um por um? Quais são as causas mais comuns de divergência?

**Resposta:** _________________________________________________

**P14.** A conciliação da Stone — mesma lógica? Compara Fluxo Lit (conta Stone) × Extrato Stone diariamente?

**Resposta:** _________________________________________________

---

## Seção 2 — Fontes Externas e Credenciais

> Referência: dados que hoje vocês **baixam manualmente de portais** e que queremos automatizar via API

### 2.1 — Gateways e Bancos

**P15.** **Stone** — Vocês têm acesso ao painel Stone como admin? Já existe alguma integração via API ativa (webhook, relatórios automáticos por e-mail)? Qual o volume médio mensal de transações?

**Resposta:** _________________________________________________

**P16.** **Mercado Pago** — Qual conta MP vocês usam (e-mail associado)? Tem chave de API (Access Token) criada? Ou só acessam pelo portal web?

**Resposta:** _________________________________________________

**P17.** **AppMax** — AppMax é um gateway separado OU é o gateway dentro da Tray? A gente já tem credenciais Tray mapeadas — confirmar se é a mesma coisa ou conta separada.

**Resposta:** _________________________________________________

**P18.** **Pagar.me** — Qual versão da API vocês usam (v4 ou v5)? Tem API Key gerada? Ou só portal web?

**Resposta:** _________________________________________________

**P19.** **Amazon Seller Central** — Vocês têm acesso ao Developer do Seller Central? (Necessário para SP-API). Quem tem login admin?

**Resposta:** _________________________________________________

### 2.2 — Logística e Frete

**P20.** **Mandaê** — Usam portal web ou já têm integração? Têm API Key gerada? (~77 envios/mês)

**Resposta:** _________________________________________________

**P21.** **Melhor Envio** — Usam a conta Melhor Envio Pro (pós-pago)? Têm app OAuth cadastrado? (~547 transações/mês)

**Resposta:** _________________________________________________

**P22.** **Lalamove** — Credenciais de API (Key + Secret) existem? Ou só app no celular? (~15 entregas/mês)

**Resposta:** _________________________________________________

**P23.** **Mercado Livre** — Usam a API do ML para alguma coisa já, ou só baixam relatórios do portal? Quem tem acesso admin ao Seller?

**Resposta:** _________________________________________________

**P24.** **LogManager** — O que é exatamente? É sistema de uma transportadora? Tem API ou portal? Ou é planilha que alguém manda por e-mail? (~4 lançamentos/mês)

**Resposta:** _________________________________________________

**P25.** **Módico/Correios** — De onde vem o relatório? Portal dos Correios? Fatura dos Correios? (~80 envios/mês)

**Resposta:** _________________________________________________

**P26.** **Transpo** — É uma transportadora específica? O CT-e (Conhecimento de Transporte) vem por XML via e-mail ou portal? (~12 fretes/mês)

**Resposta:** _________________________________________________

---

## Seção 3 — Regras de Negócio e Cálculos

> Referência: `{MÊS}/DRE/Levantamento por competencia.xlsx` — planilha mestre com dados do DRE

### 3.1 — Direitos Autorais

📁 **Arquivo:** Sheet "DADOS PARA DRE" no `Levantamento por competencia.xlsx`
📋 **O que vimos:** ~13 autores com valores mensais (ex: Arival R$52k jan, Hernandes R$33k jan, Lucinho R$18k jan...)

**P27.** Como é calculado o valor de Direitos Autorais de cada autor?
- [ ] % fixo sobre vendas líquidas do mês (qual %?)
- [ ] Valor fixo por contrato
- [ ] % variável por faixa de vendas (escalonado)
- [ ] Outro: _________________________________________________

Onde está a tabela de contratos/parâmetros de cada autor? (Literarius? Planilha? Contrato físico?)

**Resposta:** _________________________________________________

### 3.2 — Comissões

📋 **O que vimos:** Lucas e Bruno com valores mensais

**P28.** Qual a fórmula de comissão?
- [ ] % sobre vendas totais do mês
- [ ] % sobre vendas por canal específico
- [ ] Meta + gatilho (pace CPC)
- [ ] Outro: _________________________________________________

Base de cálculo (vendas brutas? líquidas? de qual canal?): _________________________________________________

### 3.3 — Bônus por Resultado

📋 **O que vimos:** Lucas, Bruno, Ivanise, Hevelyn recebem bônus variável

**P29.** Bônus é aprovado manualmente pela diretoria todo mês? Existe critério formal (meta atingida)? Ou é discricionário?

**Resposta:** _________________________________________________

### 3.4 — Apuração Moda

📁 **Arquivo:** `{MÊS}/DRE/Apuração moda {mês}.xls` (aparece a partir de março/abril)

**P30.** O que é "moda" neste contexto?
- [ ] Um canal de venda (loja física de moda?)
- [ ] Uma categoria de produto (vestuário/acessórios?)
- [ ] Um parceiro/marca específica
- [ ] Outro: _________________________________________________

É um relatório do Literarius? Qual filtro gera ele?

**Resposta:** _________________________________________________

---

## Seção 4 — Formato e Entrega para Contabilidade

**P31.** A Contábil Ribeiro aceita os relatórios em qualquer formato digital (PDF, XLSX, CSV)? Ou EXIGE o formato XLS exatamente como está hoje?

**Resposta:** _________________________________________________

**P32.** Existe algo que a contabilidade ainda exige em PAPEL (documento físico, assinatura)? Se sim, o quê?

**Resposta:** _________________________________________________

**P33.** As guias de recolhimento (Recolher_*.pdf) — quem gera? É a Contábil Ribeiro que manda para vocês pagarem? Ou vocês que geram?

**Resposta:** _________________________________________________

**P34.** Quando o pacote completo do mês está pronto, como vocês entregam hoje para a Contábil Ribeiro? (Link OneDrive? E-mail? Pendrive?)

**Resposta:** _________________________________________________

---

## Resumo do que JÁ sabemos (não precisam responder)

| Item | Status |
|---|---|
| Schema de todos os XLS do fechamento | ✅ Mapeado |
| Fontes Literarius (SQL) para NFs, CMV, Fluxos, Fornecedores | ✅ Queries prontas |
| Classificação contábil (PlanoConta + CentroResultado) | ✅ Já vem do Literarius |
| Conciliação Santander × Literarius bate na maioria dos dias | ✅ Confirmado |
| Volume mensal por fonte (Stone ~1.800, NFs ~4.253, A/P ~863) | ✅ Mapeado |
| Estrutura da pasta OneDrive (12 meses × 3 seções) | ✅ Mapeada |

---

## Próximo Passo

Assim que responderem, vamos:
1. Configurar as APIs externas (vocês só precisam liberar credenciais)
2. Criar o módulo de fechamento automático no HeziomOS
3. Rodar 2-3 meses em paralelo (sistema gera + vocês conferem)
4. Depois que validarem: desligar o processo manual

**Resultado:** o pacote completo do mês estará pronto no **dia 1-2** automaticamente, sem downloads manuais de 8+ portais.

---

*Documento gerado em 19/05/2026 — Projeto HeziomOS, Trivia*
