# Mapeamento do Fluxo: Planilha do Cliente → Lançamentos Contmatic

**Data:** 2026-05-07  
**Caso analisado:** IPP (Igreja Presbiteriana de Pinheiros) — Conta Bradesco 5632-4 — Abril/2025  
**Arquivos-fonte:**
- Planilha do cliente: `Bradesco 5632-4 04-2025.xlsx`
- Arquivo de importação Contmatic: `507_2025-04-2025_Lctos.ods`

---

## 1. O que o cliente envia (Excel)

### Estrutura da planilha

| Coluna | Conteúdo | Exemplo |
|--------|----------|---------|
| Nº Lançamento | Sequencial do cliente | 1, 2, 3... |
| Origem | Tipo de movimentação | Bradesco 5632 |
| Data | Data da operação | 01/04/2025 |
| Conta | Classificação do cliente | OFERTAS EXPANSÃO - IPP |
| Forma Pagamento | Canal | PIX, TED, Outros |
| Fornecedor | Beneficiário/Pagador | Nome da pessoa ou empresa |
| CPF/CNPJ | Documento | 123.456.789-00 |
| Categoria | Agrupamento | DÍZIMOS E OFERTAS, CONSTRUÇÃO CIVIL |
| Item | Subcategoria | OFERTAS EXPANSÃO - IPP, CONCRETO, ALUGUEL |
| Valor | Montante (R$) | 1.400,00 |
| Centro | Centro de custo | TENDA, ECC, GERAL |
| Nº Documento | Referência fiscal/bancária | NFS 95, NF 7350 |
| Histórico | Descrição livre | PIX RECEBIDO, PAG BOLETO |
| Observação | Notas adicionais | (geralmente vazio) |
| Conferido | Status de verificação | SIM/NÃO |
| Tipo de Lançamento | Direção | ENTRADA, SAÍDA |

### Categorias encontradas (Abril/2025)

**Entradas:**
- DÍZIMOS E OFERTAS → OFERTAS EXPANSÃO - IPP (centenas de doadores via PIX/TED)
- RENDIMENTOS → Aplicação Invest Fácil Bradesco

**Saídas:**
- CONSTRUÇÃO CIVIL → Materiais, serviços, locação (Projeto TENDA)
- SERVIÇOS → Arquitetura, engenharia, assessoria
- IMÓVEIS → Parcelas de aquisição
- TARIFAS BANCÁRIAS → PIX, QR Code
- APLICAÇÕES → Invest Fácil Bradesco

---

## 2. O que o Contmatic recebe (ODS)

### Estrutura do arquivo de importação

| Coluna | Significado | Formato |
|--------|-------------|---------|
| Lançamento | Número sequencial no Contmatic | 20289, 20290... |
| Data | Data no formato DD/MM/AAAA | 01/04/2025 |
| Débito | Código da conta contábil de débito | 18, 105, 249, 250, 530, 61, 43 |
| Crédito | Código da conta contábil de crédito | 319, 18, 43 |
| Valor | Valor com vírgula decimal, sem R$ | 45,00 |
| Histórico Padrão | (vazio neste caso) | — |
| Complemento | Descrição textual do lançamento | "RECEB. OFERTA PROJ. EXPANSÃO - NOME" |
| CCDB | Centro de custo débito | (vazio) |
| CCCR | Centro de custo crédito | (vazio) |
| CNPJ | CNPJ relacionado | (vazio) |

### Estatísticas (Abril/2025)

- **Total de lançamentos:** 452
- **Período:** 01/04/2025 a 30/04/2025

---

## 3. Plano de Contas Identificado

### Contas utilizadas neste mês

| Código | Natureza | Função deduzida | Frequência |
|--------|----------|-----------------|------------|
| **18** | Ativo | Banco Bradesco c/c 5632-4 (conta caixa/banco) | 358 DB + 94 CR |
| **319** | Receita | Ofertas Projeto Expansão (receita de doações) | 318 CR |
| **43** | Ativo | Aplicação Invest Fácil Bradesco | 40 CR + 4 DB |
| **105** | Despesa | Serviços de Terceiros / Construção (TENDA) | 20 DB |
| **249** | Despesa | Projetos / Arquitetura / Engenharia | 11 DB |
| **250** | Despesa | Materiais / Compras (TENDA) | 23 DB |
| **530** | Despesa | Tarifas Bancárias | 32 DB |
| **61** | Ativo/Imobilizado | Imóveis / Aquisições | 4 DB |

---

## 4. Regras de Transformação (Cliente → Contmatic)

### Padrão de lançamento por partida dobrada:

#### Entrada de recurso (doação/oferta):
```
Débito: 18 (Banco)    Crédito: 319 (Receita de Ofertas)
Valor: [valor recebido]
Complemento: "RECEB. OFERTA PROJ. EXPANSÃO - [NOME DO DOADOR]"
```

#### Saída — Pagamento de serviço/material:
```
Débito: 105/249/250 (Despesa por tipo)    Crédito: 18 (Banco)
Valor: [valor pago]
Complemento: "PG [tipo doc] [número], [FORNECEDOR], [DESCRIÇÃO]"
```

#### Saída — Tarifa bancária:
```
Débito: 530 (Tarifas)    Crédito: 18 (Banco)
Valor: [valor da tarifa]
Complemento: "TARIFA BANCARIA [TIPO]"
```

#### Aplicação financeira:
```
Débito: 43 (Aplicação)    Crédito: 18 (Banco)
Complemento: "APLIC INVEST FÁCIL, CF EXT BRADESCO"
```

#### Resgate de aplicação:
```
Débito: 18 (Banco)    Crédito: 43 (Aplicação)
Complemento: "RESG APLIC INVEST FÁCIL, CF EXT BRADESCO"
```

#### Rendimento de aplicação:
```
Débito: 18 (Banco)    Crédito: 43 (Aplicação)
Complemento: "RENTAB INVEST FACIL CRED, CF EXT BRADESCO"
```

---

## 5. Mapeamento: Campos do Cliente → Campos do Contmatic

| Campo Excel (cliente) | → | Campo ODS (Contmatic) | Regra |
|---|---|---|---|
| (gerado) | → | Lançamento | Sequencial automático do Contmatic |
| Data | → | Data | Direto (mesmo formato DD/MM/AAAA) |
| Tipo de Lançamento + Categoria | → | Débito/Crédito | Mapeamento por tabela de-para (ver seção 4) |
| Valor | → | Valor | Direto (formato numérico BR) |
| (não usado) | → | Histórico Padrão | Vazio neste caso |
| Fornecedor + Item + Nº Documento | → | Complemento | Concatenação formatada (ver padrões na seção 4) |
| Centro | → | CCDB / CCCR | Não preenchido neste caso |
| CPF/CNPJ | → | CNPJ | Não preenchido neste caso |

---

## 6. Trabalho Manual do Contador (o que a automação deve substituir)

O contador executa estas tarefas manualmente:

1. **Classificação contábil** — Traduz "Categoria + Item" do cliente para o código de conta do plano de contas (18, 105, 249, 250, 319, 530, 43, 61)

2. **Definição da partida dobrada** — Determina débito e crédito com base no tipo de operação (entrada/saída) e na natureza do gasto

3. **Formatação do histórico** — Monta o "Complemento" seguindo padrão:
   - Entradas: `RECEB. [TIPO] - [NOME]`
   - Saídas: `PG [DOC] [NUM], [FORNECEDOR], [DESCRIÇÃO]`

4. **Numeração** — Atribui número sequencial no Contmatic

5. **Validação** — Confere valores, datas, e coerência

---

## 7. Oportunidade de Automação

### O que pode ser automatizado com regras determinísticas:
- Mapeamento Categoria/Item → Conta contábil (tabela de-para fixa)
- Definição de débito/crédito por tipo de lançamento
- Formatação do complemento
- Numeração sequencial
- Conversão de formato (Excel → ODS/JSON para API)

### O que precisa de IA ou regra heurística:
- Classificação de novos fornecedores/categorias não previamente mapeados
- Detecção de anomalias (valor fora do padrão, duplicatas)
- Tratamento de exceções (lançamentos sem categoria clara)

### API Contmatic (futura integração direta):
```
POST /v1/lancamentos/{apelido}/{ano}
Body: {
  "data": "2025-04-01",
  "lancamentosDebitos": [{"conta": "18"}],
  "lancamentosCreditos": [{"conta": "319"}],
  "valor": 45.00,
  "historicoPadrao": "",
  "complemento": "RECEB. OFERTA PROJ. EXPANSÃO - ERISTON FERR"
}
```

---

## 8. Explicação do Sogro (Transcrição dos Áudios)

### Áudio 1 — Dinâmica de importação do arquivo

> "O João, a dinâmica para eu importar: eu fiz o ajuste da nomenclatura. O seguinte — eu vou te tirando essa parte depois de 2025 — o nome do lote fica **157_2025_Lançamento.ods**. Então, sempre que nós vamos importar, a gente deixa o arquivo com essa base isolado, que é sempre com esse nome. **157 é o número do cliente** (que é a IPP), e **2025 é o ano** onde eu quero importar. Então eu tenho que sempre isolar o arquivo e mandar o Contmatic ir buscar lá. Quando ele importa o arquivo, aí ele coloca uma extensão tipo essa: 04-2025, que pode identificar para diferenciar o arquivo importado. Para importar, é isso que eu te falei."

**Resumo:** O arquivo de importação segue o padrão de nomenclatura `{código_cliente}_{ano}_Lctos.ods` (ex: `507_2025-04-2025_Lctos.ods`). O Contmatic busca esse arquivo em um local específico e, após importar, renomeia com o sufixo do mês para controle.

### Áudio 2 — Processo de tratamento da planilha

> "Assim, João, na verdade a gente pega — a exemplo da IPP — a gente pega a planilha do jeito que está filtrada da IPP lá no sistema dela. A gente puxa as colunas que nos interessam para o layout da Contmatic, a gente faz ali um Ctrl+C / Ctrl+V, o trabalho é preencher na planilha da IPP eliminando todas as colunas que não nos interessam, e dá um Ctrl+C / Ctrl+V geral na sequência, no layout da planilha de importação da Contmatic.
>
> E aí, na planilha da IPP não tem débito/crédito — a coluna de débito/crédito — aí a gente acrescenta essa coluna. A gente informa a conta de débito/crédito para cada lançamento. A gente puxa por banco: tudo que entrou e tudo que saiu no banco vai ser a conta bancária.
>
> Depois, tudo que entrou no banco, a gente tem que verificar no histórico da igreja como está lá definido — se é dízimo, se é oferta, o que for — e a gente também, de acordo com o histórico, classifica o tipo de receita (a conta crédito).
>
> E a conta de débito é mais complicada, porque **cada linha significa uma coisa diferente**. Então existe muita manipulação sim de uma planilha para outra.
>
> O ideal seria se o pessoal da IPP fizesse o registro do histórico — do que eles pagam — se eles fizessem com a dinâmica/formato que nós registramos na contabilidade. Aí fica... eu nunca fiz isso porque fica — a princípio fica — o negócio está na forma financeira ali, que tem a sua dinâmica, para transformar num layout contábil. A gente já fez alguns ajustes para facilitar para nós, mas ainda requer muito — principalmente a parte de histórico — requer muito a nossa manipulação. Mas algo pode melhorar. Tudo, tudo, tudo aqui, me fala aí o que você precisa além disso."

**Resumo do processo descrito:**
1. Pega planilha filtrada do sistema do cliente (IPP)
2. Elimina colunas que não interessam para o layout Contmatic
3. Ctrl+C / Ctrl+V das colunas relevantes para o template de importação
4. Acrescenta colunas de Débito/Crédito (que não existem na planilha do cliente)
5. Classifica a conta bancária (18) como débito/crédito conforme entrada ou saída
6. Para entradas: verifica o histórico da igreja para classificar tipo de receita (dízimo, oferta, etc.)
7. Para saídas: classifica individualmente — "cada linha significa uma coisa diferente"
8. O maior gargalo é o histórico/classificação das despesas (débito)

**Insight-chave:** O sogro reconhece que se o cliente preenchesse já no formato contábil, o trabalho cairia drasticamente. Isso valida a ideia do **sistema financeiro para clientes** — onde o cliente já categoriza no padrão que facilita a importação.

---

## 9. Pendências

- [x] ~~Áudios do sogro~~ — Transcritos via Whisper (seção 8)
- [ ] **Plano de contas completo** — Apenas 7 contas identificadas neste mês. Obter plano completo do Contmatic para mapeamento abrangente.
- [ ] **Outros clientes** — Este caso é uma igreja com doações. Validar se o fluxo é similar para empresas de serviço e ONGs.
- [ ] **Histórico Padrão** — Campo vazio neste caso. Verificar se outros clientes usam códigos de histórico padrão do Contmatic.
- [ ] **Centro de custo** — Não preenchido neste caso (CCDB/CCCR vazios). Verificar se outros clientes usam.
- [ ] **Template do cliente** — Criar sistema onde o cliente já preenche no formato que facilita a importação (insight do sogro).
