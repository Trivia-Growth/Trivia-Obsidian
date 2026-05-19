---
tags: [heziom, mapeamento, operação, departamentos, escopo]
status: ativo
criado: 2026-05-19
fonte: Respostas do diretor executivo ao questionário de escopo completo
---

# Mapeamento Completo da Operação Heziom

**Documento de referência para arquitetura e desenvolvimento do Heziom OS**
**Editora Heziom — Associação Editora Presbiteriana de Pinheiros**
**Versão consolidada — Maio/2026**

---

## 1. Identidade e Modelo de Negócio

A Heziom (Associação Editora Presbiteriana de Pinheiros) é uma editora missionária cristã reformada fundada em 2021, cujo lucro integral é revertido para a Junta Missionária de Pinheiros. Opera no modelo D2C com expansão para atacado, marketplaces e varejo físico.

**Faturamento 2025 estimado:** R$ 6,64M
**Margem bruta:** 62,2%
**Margem de contribuição:** 50,5%
**Margem líquida:** 12,7%
**Faturamento médio mensal:** R$ 586 mil

Trabalha com consignação concedida e recebida. Não possui modelo recorrente hoje, mas planeja comunidade com e-books, audiobooks e assinaturas dentro do Heziom OS.

---

## 2. Departamentos e Equipe

Estrutura total de aproximadamente 20 pessoas.

| Área | Composição |
|---|---|
| Marketing | 4 internos + gestora de tráfego PJ + designer PJ |
| Expedição | 1 coordenador + 2 operadores (freelancers em picos) |
| Financeiro | 2 internos |
| Editorial | 1 coordenadora interna + tradutores, capistas, diagramadores e revisores terceirizados |
| Comercial | 3 internos |
| Livraria física (IPP + Embu) | 1 coordenador + 4 freelancers |
| Atendimento | 2 internos |

**Pendência:** nomes, cargos e função operacional específica de cada usuário-chave por departamento ainda não foram formalizados.

---

## 3. Stack Tecnológica Atual

### 3.1. Sistemas que permanecem integrados ao Heziom OS

| Sistema | Departamento | Função |
|---|---|---|
| Literárius | Todos (espinha dorsal) | ERP: produtos, estoque, pedidos, NF, financeiro |
| Tray | E-commerce | Hub de vendas D2C e marketplaces |
| Meta Ads / Google Ads | Marketing | Tráfego pago |
| Bookwire | Editorial | Distribuição de e-books |
| BookInfo | Editorial | Metadados e ISBN |
| Amazon Vendor | Comercial | Atacado direto com Amazon |
| Jimmy Studio | Marketing | Criação de conteúdo e análise de ads |
| Shipping Insights (proprietário) | Expedição | Hub interno consolidando todas as transportadoras |
| Santander Internet Banking | Financeiro | Execução de pagamentos com dupla aprovação |
| OneDrive | Editorial | Armazenamento de contratos e arquivos de obras |
| DocuSign | Editorial | Assinatura digital de contratos |

### 3.2. Sistemas a serem substituídos pelo Heziom OS

| Sistema | Departamento | Dor identificada | Documentação técnica |
|---|---|---|---|
| ClickUp | Operação inteira | Board genérico, 530+ tarefas acumuladas no financeiro, sem inteligência de processo | developer.clickup.com/reference/getaccesstoken |
| Flowbiz | Marketing/CRM | Desconectado dos dados reais de compra da Tray e Literárius, segmentações limitadas | flowbiz.readme.io/docs/bem-vindo |
| Unnichat | Atendimento | Histórico fragmentado, sem autonomia de IA, depende de atendente humano para o trivial | paginas.unnichat.com.br |
| Qive | Fiscal | Custo recorrente, falta integração nativa com pedidos do Literárius | developers.qive.com.br/docs/post/v2/dfe/nfe |
| POS Controle | Totens Livraria física | Operação isolada do restante. O Literárius já está desenvolvendo aplicação para absorver essa demanda |  |
| Power BI externo | Diretoria | Encerrado em março/26, custo de R$ 3.500/mês sem retorno |  |

**Importante:** consultar documentação de cada API antes de definir o escopo do módulo substituto no Heziom OS, para mapear tudo o que é feito hoje e o que precisa ser replicado e interligado.

---

## 4. Catálogo e Editorial

### 4.1. Visão geral

O catálogo possui mais de 60 títulos ativos, com média de 2 lançamentos por mês em 2026. A equipe editorial é composta por 1 coordenadora interna; todos os demais profissionais (tradutores, capistas, diagramadores, revisores) são terceirizados.

A distribuição digital é feita via Bookwire (e-books), BookInfo (catálogo e metadados) e Amazon Vendor (atacado direto com a Amazon).

O fluxo editorial atual é gerido por uma única pessoa que acumula responsabilidades desde a assinatura de contratos até a entrega do livro impresso e digital. Percorre 10 etapas sequenciais apoiadas por processos contínuos (contato com autores, gestão de sprints), utilizando 9 ferramentas distintas que não se integram entre si.

A lógica macro do fluxo segue: **Planejamento → Orçamento e Produção → Gráfica e Distribuição.**

### 4.2. Etapas sequenciais do fluxo editorial

#### 4.2.1. Calendário de Publicações

**Ferramenta atual:** Google Sheets

Planilha anual que define quais obras serão publicadas e quando. Ponto de partida estratégico de todo o fluxo. Norteia os lançamentos e pode ser revisitada e alterada conforme necessidades editoriais, comerciais ou de produção ao longo do ano.

**O que o Heziom OS precisa absorver:**

- Visão anual de lançamentos com possibilidade de reordenação
- Vínculo direto entre a obra no calendário e todas as etapas subsequentes (contrato, orçamento, produção, gráfica, distribuição)
- Histórico de alterações no calendário (quando e por que uma data foi movida)
- Visibilidade para outros setores (marketing, comercial, expedição) consultarem as datas de lançamento

#### 4.2.2. Contratos

**Ferramentas atuais:** OneDrive (armazenamento) + DocuSign (assinatura digital)

Contratos com autores e eventuais cessionários são elaborados, assinados digitalmente via DocuSign e armazenados no OneDrive. Arquivos das obras (originais, versões em produção, arquivos finais) também ficam no OneDrive.

**O que o Heziom OS precisa absorver:**

- Repositório de contratos vinculado a cada obra
- Status do contrato (em elaboração, enviado para assinatura, assinado, vigente, encerrado)
- Integração ou substituição do fluxo de assinatura digital
- Armazenamento centralizado dos arquivos das obras com controle de versão (original, preparado, revisado, diagramado, final)
- Permissões de acesso por perfil (editorial, financeiro, jurídico)

#### 4.2.3. Orçamento Editorial (planilha-coração)

**Ferramenta atual:** Google Sheets

Planilha mais crítica de todo o editorial. Calcula custo, prazos e alocação de profissionais para cada projeto. É o coração operacional do setor.

**Regras de cálculo de custo:**

Fórmula: Custo total = Quantidade de laudas × Preço por lauda

Tetos por tipo de projeto:

| Tipo de projeto | Teto por lauda |
|---|---|
| Nacional | R$ 40,00 |
| Internacional | R$ 60,00 |

Valores por tarefa com 3 níveis de complexidade (baixa, média, alta):

| Tarefa | Baixa | Média | Alta |
|---|---|---|---|
| Tradução (apenas internacional) | R$ 20,00 | R$ 23,00 | R$ 26,00 |
| Leitura crítica (apenas internacional) | R$ 6,00 | R$ 8,00 | R$ 10,00 |
| Preparação de texto | R$ 12,00 | R$ 14,00 | R$ 16,00 |
| Edição de texto | R$ 10,00 | R$ 13,00 | R$ 16,00 |
| Diagramação | R$ 5,00 | R$ 5,00 | R$ 5,00 |
| Revisão de prova | R$ 4,00 | R$ 5,00 | R$ 6,00 |
| Conferência de emendas | R$ 1,00 | R$ 1,00 | R$ 1,00 |

Além das faixas de complexidade, existem tabelas de valores já praticados com cada profissional, que podem variar conforme urgência e complexidade específica do projeto.

**Regras de cálculo de prazo (produtividade laudas/dia):**

| Tarefa | Produtividade |
|---|---|
| Tradução / Leitura crítica | 5 |
| Preparação de texto | 7 |
| Edição de texto | 10 |
| Diagramação | 100 |
| Capa | 10 dias (fixo) |
| Revisão de prova | 20 |
| Plotter | 500 |

Fórmula: Prazo (dias) = Quantidade de laudas ÷ Produtividade (laudas/dia)

Prazos de cada etapa são somados sequencialmente para compor o prazo total do projeto.

**Estrutura da planilha:**

- Aba principal com cálculos de custo e prazo
- Aba de tabela de valores praticados por profissional
- Aba MATRIZ_PRAZOS com a produtividade média
- Abas individuais para projetos em andamento (cada livro tem sua aba com dados específicos)

**O que o Heziom OS precisa absorver:**

- Motor de cálculo de custo por lauda com suporte a 3 níveis de complexidade
- Tetos configuráveis por tipo de projeto (nacional/internacional)
- Cadastro de profissionais com valores praticados (histórico de pagamentos)
- Motor de cálculo de prazos baseado em produtividade
- Simulador: ao inserir quantidade de laudas e tipo de projeto, gerar automaticamente custo estimado, prazo estimado e sugestão de alocação de profissionais
- Vinculação direta com cada projeto no sistema

#### 4.2.4. Produção Editorial e Kanban

**Ferramentas atuais:** ClickUp (kanban) + OneDrive (arquivos das obras)

A produção editorial envolve coordenação de colaboradores externos que executam as seguintes etapas, nesta ordem:

1. Tradução (apenas projetos internacionais)
2. Leitura crítica (apenas projetos internacionais)
3. Preparação de texto
4. Edição de texto
5. Diagramação
6. Capa (pode correr em paralelo à diagramação)
7. Revisão de prova
8. Conferência de emendas
9. Plotter (prova final antes da gráfica)

Cada etapa é atribuída a um colaborador externo específico. O acompanhamento de em qual etapa cada obra se encontra é feito por um kanban no ClickUp.

**O que o Heziom OS precisa absorver:**

- Kanban editorial com as etapas listadas como colunas
- Cada card de obra com título, autor, profissional alocado, prazo da etapa, status e arquivos vinculados
- Transição de etapa com registro automático de data (quando entrou e saiu de cada fase)
- Notificações para o coordenador editorial quando prazo estiver próximo ou atrasado
- Possibilidade de vincular colaboradores externos a etapas específicas
- Integração com repositório de arquivos (receber e entregar versões)

#### 4.2.5. Registro no Literárius

**Ferramenta atual:** Literárius

Após cálculo do orçamento editorial, valores finais de cada projeto são registrados no Literárius para que o setor financeiro tenha visibilidade do custo editorial. Apenas valores consolidados são passados, não o detalhamento por tarefa.

**O que o Heziom OS precisa absorver:**

- Exportação ou integração com o Literárius
- Geração de relatório de custo editorial por projeto para o financeiro
- Visão consolidada: custo total por período, por tipo de projeto, por profissional

#### 4.2.6. Orçamento Gráfico

**Ferramenta atual:** Contato direto com a gráfica (sem sistema)

Após plotter aprovado, o coordenador entra em contato com a gráfica para solicitar orçamento de impressão. Precificação do livro é feita com markup 7 sobre o custo gráfico.

**Regra de negócio:** Preço de capa = Custo gráfico unitário × 7

**O que o Heziom OS precisa absorver:**

- Módulo de orçamento gráfico vinculado ao projeto
- Campos: gráfica, especificações técnicas (formato, papel, acabamento, tiragem), custo total, custo unitário
- Cálculo automático do markup (configurável, atualmente 7)
- Histórico de orçamentos por gráfica e por projeto
- Comparativo entre gráficas (se houver mais de um orçamento)

#### 4.2.7. Centralização de Custos para o Time

**Ferramenta atual:** Google Sheets

Após orçamento gráfico, o coordenador editorial consolida todas as informações em uma planilha que serve como ponto de comunicação com os demais setores.

| Informação | Destinatário |
|---|---|
| Custo total + condições de pagamento | Financeiro |
| Custo unitário | Marketing e Comercial (cálculo de metas e precificação) |
| Prazo de entrega + tiragem | Todos os setores (incluindo expedição, para gestão de estoque) |

**O que o Heziom OS precisa absorver:**

- Dashboard ou ficha de projeto acessível por todos os setores com as informações acima
- Permissões diferenciadas: cada setor vê apenas o que lhe é pertinente
- Notificação automática quando informações forem preenchidas ou atualizadas
- Integração com expedição para planejamento de estoque

#### 4.2.8. Cadastro do Livro

**Ferramentas atuais:** BookInfo + Amazon Vendor

Informações bibliográficas e comerciais do livro são cadastradas em duas plataformas: BookInfo (metadados editoriais e ISBN) e Amazon Vendor (para venda na Amazon).

**O que o Heziom OS precisa absorver:**

- Ficha catalográfica completa de cada obra (ISBN, título, subtítulo, autor, sinopse, número de páginas, formato, peso, preço, classificação, público-alvo etc.)
- Possibilidade de exportar metadados para BookInfo e Amazon Vendor (ou integração via API, se disponível)
- Centralização: cadastrar uma vez, distribuir para múltiplas plataformas

#### 4.2.9. Hub de Lançamento para o Marketing

**Ferramenta atual:** ClickUp

Para cada obra em fase de lançamento, o coordenador editorial prepara e centraliza no ClickUp um conjunto de materiais e informações que o time de marketing precisa para divulgar o livro:

- Resumo da obra
- Perguntas frequentes (FAQ)
- Guia de estudo
- Mockup do livro
- Vídeo explicativo
- Metadados editoriais

**O que o Heziom OS precisa absorver:**

- Seção de lançamento vinculada a cada obra
- Campos estruturados para cada tipo de material (texto, arquivo, link, vídeo)
- Status de cada material (pendente, em produção, pronto, aprovado)
- Acesso direto do time de marketing para consulta e download
- Checklist de lançamento: tudo o que precisa estar pronto antes da data

#### 4.2.10. E-book

**Ferramenta atual:** Bookwire (distribuição digital)

Após finalização do projeto editorial, é solicitada a produção do e-book. Ao receber o arquivo, o coordenador faz upload na Bookwire para distribuição digital.

**O que o Heziom OS precisa absorver:**

- Status do e-book no fluxo de cada projeto (não solicitado, solicitado, em produção, recebido, publicado)
- Registro do arquivo do e-book vinculado ao projeto
- Controle de distribuição: em quais plataformas o e-book foi publicado

### 4.3. Processos contínuos

#### 4.3.1. Contato com autores

O coordenador editorial mantém comunicação constante com os autores ao longo de todo o processo, desde o entendimento inicial do projeto até a entrega do livro. Inclui alinhamento do escopo, aprovação de etapas (capa, diagramação, revisão), atualizações sobre o andamento e resolução de dúvidas.

**O que o Heziom OS precisa absorver:**

- Registro de comunicações com autores vinculado a cada projeto
- Portal do autor (futuro): espaço onde o autor acompanha o andamento do seu livro
- Fluxo de aprovação: pontos em que o autor precisa aprovar entregas (capa, diagramação, texto final)

#### 4.3.2. Gestão de sprints

**Ferramenta atual:** ClickUp

O coordenador organiza suas próprias tarefas em sprints no ClickUp, cobrindo todas as demandas operacionais do setor editorial.

**O que o Heziom OS precisa absorver:**

- Módulo de tarefas pessoais ou sprints para o coordenador
- Geração automática de tarefas com base nos prazos dos projetos (ex: "solicitar orçamento gráfico do Livro X" quando a etapa de plotter for concluída)

### 4.4. Regras de negócio críticas

1. **Teto de custo por lauda:** Nacional R$ 40,00, Internacional R$ 60,00. O sistema deve alertar quando um orçamento ultrapassar o teto.
2. **Três níveis de complexidade:** Cada tarefa editorial tem valores para complexidade baixa, média e alta. O nível é definido por projeto.
3. **Markup gráfico:** Preço de capa = Custo gráfico unitário × 7. O multiplicador deve ser configurável.
4. **Sequência de etapas editoriais:** As etapas seguem ordem obrigatória (tradução → leitura crítica → preparação → edição → diagramação → revisão → conferência → plotter), exceto a capa, que pode correr em paralelo à diagramação.
5. **Produtividade por tarefa:** Prazos são derivados da produtividade média (laudas/dia) de cada tipo de tarefa. Esses valores devem ser configuráveis no sistema.
6. **Calendário é o ponto de partida:** Nenhum projeto deve avançar sem estar vinculado ao calendário de publicações.
7. **Informações para o time são sequenciais:** Financeiro, marketing, comercial e expedição recebem informações em momentos específicos do fluxo. O sistema deve controlar quando cada setor é notificado.

### 4.5. Evolução prevista do editorial

Substituição progressiva de profissionais terceirizados das etapas de texto (tradução, leitura crítica, preparação, edição, revisão, conferência de emendas) por agentes especialistas de IA, cumprindo stack e padrão da editora, melhorando qualidade, acelerando produção e reduzindo custo. Diagramação, capa e plotter permanecem com profissionais humanos especialistas.

---

## 5. Operação Comercial e Vendas

### 5.1. Modelo CPC

O modelo comercial unifica Marketing, Comercial e Atendimento sob o CPC (Comunicação, Performance e Conversão), dividido em:

- **Vendas Online:** meta R$ 214.503/mês, ROI mínimo 4:1
- **Vendas Offline:** meta R$ 371.851/mês

### 5.2. Fluxo de Atacado

Exclusivo para igrejas e livrarias que não atuam em marketplaces, com volume de aproximadamente 150 pedidos/mês. Contato via WhatsApp comercial. Vendedores lançam o pedido no Literárius e informam a expedição no ClickUp, que aciona as próximas etapas (financeiro para boleto, etc.).

Setor com gestão amadora hoje: sem posição geral das vendas, vendas por canal, pace de vendas ou forecast.

### 5.3. Fluxo D2C

Tray como hub: todos os marketplaces integram nela, pedidos caem automaticamente no Literárius que gerencia a expedição.

**Exceções:** Full do Mercado Livre e Amazon. A expedição prepara o envio da remessa inteira para os centros logísticos deles, mas há trâmite específico de etiquetas e integrações.

### 5.4. Canais de Venda e Recebimento

| Canal | Receita 2025 | % | Sistema na ponta | Banco de recebimento |
|---|---|---|---|---|
| E-commerce D2C | R$ 2,58M | 37,0% | Tray | AppMax |
| Atacado (igrejas/livrarias) | R$ 1,78M | 25,4% | Literárius direto + WhatsApp | Sem definição fixa: PIX Santander ou Stone, link de pagamento Stone/Mercado Pago/AppMax, ou boleto Santander |
| Livraria física (IPP + Embu) | R$ 1,31M | 19,7% | POS Controle + Literárius | Stone via maquininhas ou PIX na conta |
| Marketplaces (ML, Amazon, Magalu, Shopee) | R$ 729K | 11,0% | Tray (hub) + Amazon Vendor direto | ML: Mercado Pago. Amazon Seller: Santander |
| Outros (showroom, eventos, feiras) | R$ 240K | 6,9% | Literárius manual | Stone |

### 5.5. Necessidades estratégicas mapeadas

**APIs de marketplaces:** mapear as APIs do Mercado Livre e Amazon Seller para identificar dados e funções que não passam pela Tray mas são importantes para gestão e aumento de performance nesses canais.

**Cross-channel de clientes:** ter um banco de dados de clientes que faça o cross entre canais. Nos marketplaces só temos acesso ao CPF dos compradores e, através dele, precisamos saber se o cliente já comprou conosco em outros canais.

**Chat de vendas na Tray:** desenvolver um tema na Tray com modo chat de vendas, onde o visitante pesquise e consulte livros, receba recomendações, tenha informações de preço, estoque e venda, e receba o link do carrinho pronto para fechar a compra.

**Agente de vendas 24/7:** agente autônomo que consulte todos os livros, suas informações e estoque, faça indicação e venda atuando como humano, calcule frete por CEP, coloque no carrinho e finalize a compra.

---

## 6. Marketing e CRM

### 6.1. Aquisição

Canal principal: Instagram com Meta Ads. **Investimento médio mensal: R$ 80 mil.** ROAS em queda: era 4x, hoje em média 2x. Canal orgânico relevante: livraria IPP física.

Jimmy Studio já em uso para criação de conteúdo e análise de ads.

### 6.2. Base e métricas

| Métrica | Valor |
|---|---|
| Base de contatos no Flowbiz | 40.000+ contatos (a migrar) |
| CAC médio | R$ 40,00 |
| Taxa de recompra | 25,27% |
| LTV | Não formalizado (a calcular) |

### 6.3. CRM e segmentação

CRM B2B precisa ser nativo no Heziom OS para gestão de igrejas, livrarias e distribuidores parceiros, com tabelas de preço diferenciadas via API de Listas de Preço da Tray.

**Réguas e segmentações que ganham com Heziom OS:** "clientes que compraram teologia reformada nos últimos 90 dias e não abriram os últimos 3 e-mails", "igrejas que fizeram pedido institucional há mais de 6 meses". Impossível hoje no Flowbiz por estar desconectado dos dados de compra.

---

## 7. Logística e Expedição

### 7.1. Pontos de estoque

Múltiplos pontos controlados no Literárius:

- Sede
- Livraria IPP
- Livraria Embu
- Showroom
- Estoque provisório de fim de ano

### 7.2. Equipe

1 coordenador interno + 2 operadores, com freelancers em picos de demanda.

### 7.3. Transportadoras

| Transportadora/Hub | Uso |
|---|---|
| Melhor Envio | Hub de transportadoras (D2C) |
| Mandaê | Hub de transportadoras (D2C) |
| Correios | Módico (institucional) |
| Transpo | Atacado |
| DHL | Internacional |

Picking e packing estruturado via Literárius. **Shipping Insights** (aplicação proprietária da Heziom) consolida todos os hubs de transportadora e será integrado ao Heziom OS.

### 7.4. Consignação

Trabalham com consignação concedida e recebida.

**Pendência:** volume atual de consignação (contratos abertos e valor em rua) e processo de baixa/acerto.

---

## 8. Financeiro

### 8.1. Estrutura de custos 2025

| Item | % do faturamento |
|---|---|
| CPV | 38% |
| Despesas fixas (comerciais R$ 1,345M + administrativas R$ 1,302M) | 37,7% |
| Despesas variáveis | 11,5% |
| Resultado líquido | 12,7% |

### 8.2. Processos atuais

Processos financeiros (contas a pagar, a receber, conciliação) feitos no Literárius. Relatórios gerenciais montados via exportação de planilhas do Literárius para Excel. Controle de margem por título existe (CMV cadastrado no Literárius com preço de venda).

**Dores específicas mapeadas:**

**Fluxo de caixa manual:** sem visualização da posição de caixa de todos os bancos vs. contas a receber e a pagar.

**Fechamento mensal moroso:** a separação de toda documentação para a contabilidade exige extrair relatórios e arquivos de diversos locais, preparar o pacote e enviar. A Contábil Ribeiro recebe documentação física + pasta compartilhada com arquivos de múltiplas origens. Quando começam a mexer, leva praticamente 30 dias para fechar o DRE do mês. A diretoria fica sem visibilidade durante esse período.

### 8.3. Fluxo de pagamentos (camadas independentes)

1. O agente financeiro do Heziom OS identifica obrigações de pagamento com base no histórico de lançamentos, reconhecendo padrões recorrentes (fornecedores fixos, vencimentos, valores esperados)
2. Prepara a fila de pagamentos de forma autônoma ou submete para validação do responsável financeiro antes de enviar ao Literárius (conforme configuração da gestão)
3. O Literárius centraliza o lançamento e gera o arquivo de remessa CNAB
4. O Santander executa mediante aprovação de dois diretores financeiros diretamente no Internet Banking, fora de qualquer sistema interno
5. Os usuários do Heziom OS e do Literárius operam com permissão de lançamento e consulta apenas

O Santander já tem o pacote de transmissão de arquivos contratado.

### 8.4. Prioridade do fundador

Financeiro é a área prioritária para o Heziom OS. Objetivo: dashboards e relatórios automatizados, corte de custos e redução da equipe via agentes autônomos (meta: 1 pessoa gerencia o restante).

---

## 9. Atendimento e Pós-Venda

WhatsApp ativo e reativo, com 2 pessoas focadas no atendimento online. Chatbot ativo via Unnichat (atendimento centralizado).

**Horário atual:** segunda a sexta, das 08h às 18h.

**Principais chamados:** compra via WhatsApp, problema no pedido, consulta sobre envio.

**Plano de evolução:** agentes autônomos para escalar, atendimento 24/7 e aumento de conversão. Resolução autônoma de rastreio, trocas e vendas assistidas.

---

## 10. Pessoas e Gestão

Cultura baseada em resultado, excelência, relações e performance. Dados para reuniões vêm de múltiplas origens sem consolidação. Avaliação de desempenho pendente.

Gestão de pessoas, RH, DP e onboarding serão módulos do Heziom OS, incluindo cálculo automático de comissionamento CPC (faixas de 0,5% a 3,5% já parametrizadas).

Visão de eliminar reuniões de diretoria com superagente autônomo interagindo com todas as áreas.

---

## 11. Processos Repetitivos Identificados

### 11.1. Financeiro

- Conciliação de boletos com NF-e
- Classificação de despesas
- Geração de DRE semanal
- Identificação de obrigações de pagamento recorrentes (fornecedores fixos, vencimentos)
- Preparo da fila de pagamentos para envio ao Literárius
- Fluxo de caixa manual
- Separação de documentação mensal para a contabilidade

### 11.2. E-commerce

- Recuperação de carrinhos abandonados
- Disparo de réguas de relacionamento
- Segmentação de leads por comportamento
- Sugestões de cross-sell

### 11.3. Atendimento

- Consulta de rastreio
- Processamento de trocas dentro da política
- Vendas assistidas via WhatsApp
- Respostas sobre prazo e disponibilidade

### 11.4. Editorial

- Cobrança de prazos com tradutores, capistas, preparadores e revisores
- Movimentação manual de cards entre etapas do pipeline
- Alerta sobre gargalos
- Cadastro repetido de obras em múltiplas plataformas (Literárius, Tray, BookInfo, Amazon Vendor, Bookwire)

### 11.5. Comercial atacado

- 150 pedidos/mês via WhatsApp
- Lançamento manual no Literárius
- Comunicação manual via ClickUp para expedição e financeiro

### 11.6. Fluxos entre departamentos hoje dependentes de aviso manual

- Vendedor lança pedido no Literárius e avisa expedição via ClickUp, que aciona financeiro para boleto
- Editorial termina arquivo e avisa Comercial para pré-venda
- Marketing pede relatórios manuais para diretoria toda segunda-feira
- Atendimento escala para vendedor quando vira oportunidade de venda assistida

---

## 12. Prioridades e Dores Centrais

### 12.1. Duas prioridades centrais formalizadas

**Primeira:** visibilidade executiva absoluta em tempo real (faturamento, margem, pace, forecast, ROI), sem depender de consolidação manual nas reuniões de segunda-feira.

**Segunda:** eficiência operacional extrema, eliminando tarefas repetitivas no financeiro (530+ tarefas acumuladas), e-commerce (carrinhos e réguas) e atendimento (rastreio, trocas, vendas assistidas).

### 12.2. O que o CEO perde mais tempo buscando hoje

Dados consolidados de faturamento por canal, margem de contribuição real, pace vs. meta CPC (R$ 214.503 online + R$ 371.851 offline), ROI de tráfego pago. Tudo isso hoje exige planilhas manuais alimentadas por cada head.

### 12.3. O que causa mais retrabalho

- Dupla digitação entre Literárius, Tray, ClickUp e planilhas
- Avisos manuais entre departamentos
- Relatórios reconstruídos a cada reunião
- No editorial: 9 ferramentas não integradas e dependência total da coordenadora editorial

---

## 13. Infraestrutura e Restrições

### 13.1. Custos recorrentes dimensionados

| Item | Custo mensal |
|---|---|
| Supabase Pro (base) | US$ 25/mês |
| Infraestrutura completa (Supabase + AWS via Vercel) | R$ 300 a R$ 600/mês |
| Tokens de IA via OpenRouter (cap) | R$ 2.000/mês |
| **Total de infraestrutura** | **R$ 2.300 a R$ 2.600/mês** |

### 13.2. Equipe técnica

Lucas Azevedo como Tech Lead pela Trívia Growth (pessoa jurídica, não indivíduo). Suporte e manutenção corretiva inclusos por 2 anos pós-launch.

### 13.3. Mobile

O agente de atendimento opera via WhatsApp Business API e o Clawbot envia alertas proativos por WhatsApp para o diretor executivo. Uso mobile relevante para consumo (consulta e notificação), não necessariamente para operação completa de cadastros.

**Pendência:** confirmar se há expectativa de operação mobile completa para algum perfil de usuário (expedição, vendedor de campo, atendimento).

---

## 14. Pendências do Mapeamento

Itens a serem confirmados com os heads de cada área:

1. Nomes, cargos e função operacional dos usuários-chave por departamento
2. Outras ferramentas em uso fora as já citadas (Google Workspace, ponto, integração com Contábil Ribeiro, planilhas críticas)
3. Modelo de royalties editorial (estrutura, cálculo e onde vive o controle)
4. Volume atual de consignação (contratos abertos, valor em rua) e processo de baixa
5. Confirmação do ranking das 3 maiores dores operacionais
6. Expectativa de operação mobile completa por perfil
7. Volume de pedidos D2C/marketplaces formalizado
8. Documentação completa das APIs do Mercado Livre e Amazon Seller
9. Estágio atual do desenvolvimento da aplicação Literárius que substituirá o POS Controle

---

*Documento consolidado a partir dos materiais existentes do projeto Heziom OS, do relatório detalhado do fluxo editorial (maio/2026) e das evoluções de mapeamento realizadas pelo diretor executivo.*
