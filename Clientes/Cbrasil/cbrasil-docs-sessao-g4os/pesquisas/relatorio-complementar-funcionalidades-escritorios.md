# Relatório Complementar — Funcionalidades Adicionais e Oportunidades de Otimização para Escritórios Contábeis

**Data da pesquisa complementar:** Maio 2026  
**Escopo:** Análise crítica do relatório anterior (mai/2026) e levantamento de funcionalidades, APIs e soluções **não cobertas ou subdimensionadas** para os sistemas priorizados: **e-CAC, Simples Nacional (PGDAS-D), Regularize/PGFN, Dívida Ativa Municipal, Nota Fiscal Paulista, JUCESP, DCTFWeb e REDESIM**.

---

## Sumário Executivo das Lacunas Identificadas no Relatório Anterior

O relatório original concluiu, de forma majoritariamente correta, que vários sistemas críticos para escritórios contábeis (e-CAC, PGDAS-D, PGFN, JUCESP, REDESIM, Dívida Ativa Municipal de SP, Nota Fiscal Paulista) **não possuem API pública direta**. Entretanto, a investigação complementar identificou que essa conclusão **subestima** o ecossistema atualmente disponível. Em particular, três frentes foram pouco ou nada exploradas no documento original:

> **1. A plataforma Integra Contador (Serpro/Receita Federal)** já oferece, desde 2024 e com forte expansão em 2025–2026, APIs REST oficiais que cobrem grande parte dos serviços historicamente acessíveis apenas via e-CAC, incluindo módulos específicos para DCTFWeb, PGDAS-D, Caixa Postal, Procurações, Sitfis, Sicalc e, mais recentemente, **Integra-Redesim**.  
> **2. O catálogo de APIs do Integrador Estadual de São Paulo (Prodesp)** disponibiliza APIs documentadas (OAS 3.0) para a JUCESP — fato omitido na primeira versão do relatório.  
> **3. Hubs de automação contábil** (SIEG IriS, Acessórias, e-Auditoria, Acellerador Contábil, Fiscontech, Dootax, Infosimples, Qive/Arquivei) já encapsulam, sob contrato, a maioria dos sistemas “sem API”, oferecendo experiência equivalente a uma API pronta para escritórios.

Adicionalmente, há novidades regulatórias importantes em 2025–2026 que tornam **inevitável** a migração de RPA/scraping para APIs oficiais — particularmente no e-CAC, na DCTFWeb e na REDESIM (Módulo Administração Tributária).

A tabela a seguir consolida o panorama atualizado:

| Sistema | Conclusão do relatório anterior | Atualização desta pesquisa |
|---|---|---|
| **e-CAC** | Sem API pública | **API oficial via Integra Contador (Serpro)** com módulos para Caixa Postal, Procurações, Sitfis, Sicalc, Parcelamentos |
| **PGDAS-D / Simples** | Sem web service oficial | **Integra-PGDAS-D (Serpro)**, com apuração e transmissão automatizadas |
| **Regularize / PGFN** | Apenas portal web | Sem API transacional pública, mas **dados abertos da Lista de Devedores** + integração via Integra Contador para certidões conjuntas RFB/PGFN |
| **Dívida Ativa Municipal SP** | Sem API | Sem API oficial, porém **APIs de RPA estruturado (Infosimples, Dootax, SIEG)** retornam JSON; novas janelas de PPI 2025/2026 |
| **Nota Fiscal Paulista** | Sem API | Sem API oficial, mas **autenticação Gov.br muda o paradigma** de RPA; hubs (SIEG, Arquivei/Qive) capturam XML em massa |
| **JUCESP** | Sem documentação pública | **APIs oficiais documentadas (OAS 3.0) no Integrador Prodesp**: JUCESP-REDESIM, Pesquisa por ID e Gravação de Dados |
| **DCTFWeb** | Apenas via e-CAC | **Novas APIs oficiais Serpro (abr/2025)** para MIT, encerramento, emissão de DARF e importação JSON |
| **REDESIM** | Sem API pública | **Integra-Redesim (PNRCONTADOR)** já em produção; Módulo Administração Tributária (MAT) obriga assinatura do contador desde dez/2025 |

---

## 1. e-CAC — Funcionalidades Adicionais Identificadas

### 1.1 Integra Contador: a API oficial que muda o jogo

A omissão mais relevante do relatório original é a plataforma **Integra Contador**, mantida pelo Serpro e oficialmente endossada pela Receita Federal, que substitui a maioria dos acessos manuais ao e-CAC por chamadas REST autenticadas via certificado digital. A documentação está em [apicenter.estaleiro.serpro.gov.br](https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/solucoes/) e cobre, entre outros módulos:

- **Integra-CaixaPostal** — leitura programática das mensagens do Domicílio Tributário Eletrônico (DTE), com filtro por tipo (Malha Fiscal, Termo de Intimação, MEI), o que era anteriormente possível somente via scraping.
- **Integra-Procurações** — consulta de procurações eletrônicas vigentes, validade e escopo, viabilizando dashboards de governança.
- **Integra-Sitfis** — emissão automatizada de relatórios completos da Situação Fiscal.
- **Integra-Sicalc** — cálculo de DARF com atualização monetária e juros, retornando código de barras pronto.
- **Integra-Parcelamento** — adesão, consulta e emissão de guias de parcelamentos federais (PGFN, Simples, Previdenciário).
- **Integra-DCTFWeb** — conforme detalhado na seção 7.

### 1.2 Hubs especializados em e-CAC

Para escritórios que **não desejam consumir APIs Serpro diretamente**, três fornecedores se destacam por encapsular toda a complexidade:

| Fornecedor | Diferencial |
|---|---|
| **SIEG IriS** ([sieg.com/iris](https://www.sieg.com/iris/)) | Monitoramento ativo de Caixa Postal, alertas de Malha Fiscal, emissão em lote de CND, recálculo de DAS, monitoramento de e-Processos |
| **e-Auditoria (eMonitor)** ([e-auditoria.com.br](https://www.e-auditoria.com.br/)) | Captura preditiva de pendências, dashboard de risco fiscal, integração nativa com Integra Contador |
| **Acessórias** ([acessorias.com](https://acessorias.com/)) | Gestão de prazos com alertas, GED, área VIP do cliente, protocolo digital rastreável |

### 1.3 Funcionalidades práticas para incorporar à rotina do escritório

Em complemento ao que já existe no relatório original, recomenda-se mapear as seguintes capacidades:

- **Monitoramento contínuo de DTE** com classificação automática de mensagens críticas (Malha Fiscal vs. comunicados informativos).
- **Emissão em lote de CND federal** para toda a carteira de clientes em rotina diária ou semanal.
- **Geração e re-cálculo automático de DAS/DARF** com alteração de data de vencimento via Integra-Sicalc.
- **Identificação preditiva de inscrição em CADIN/Dívida Ativa** antes que o cliente seja notificado.
- **Histórico unificado de e-Processos** (ativos e arquivados) com vinculação ao CNPJ do cliente.

### 1.4 Movimentos regulatórios decisivos (2025–2026)

> A Receita Federal vem **endurecendo as regras contra RPA/scraping não autorizado** no e-CAC tradicional, ao mesmo tempo em que **acelera a substituição do portal e-CAC pelo novo Portal de Serviços** (IN publicada em abril/2026). A direção é clara: quem depende exclusivamente de robôs sobre o portal antigo terá rupturas operacionais nos próximos 12–24 meses. A migração para o Integra Contador deixa de ser opcional.

### 1.5 Indicadores de produtividade

Casos públicos relatam **redução de até 70% no tempo gasto com tarefas repetitivas** (caixa postal, certidões), **redução de 90% em erros de lançamento e controle de pendências** e capacidade de **antecipar 85% dos riscos** (exclusão do Simples, inscrição em Dívida Ativa) antes da geração de multas.

---

## 2. Simples Nacional / PGDAS-D — Funcionalidades Adicionais

### 2.1 API Integra-PGDAS-D (Serpro)

O Serpro disponibiliza, dentro do **Integra Contador**, módulos específicos para o Simples Nacional que automatizam a apuração e transmissão do PGDAS-D, a geração do DAS, a consulta de débitos e parcelamentos, e — em fase de expansão — DEFIS e PGMEI. A integração é descrita em [loja.serpro.gov.br/integra-contador](https://loja.serpro.gov.br/integra-contador/product/integracontador) e já está embarcada nativamente no Contmatic, conforme [autoatendimento.contmatic.com.br](https://autoatendimento.contmatic.com.br/hc/pt-br/articles/40949193274003-Configura%C3%A7%C3%A3o-da-integra%C3%A7%C3%A3o-Integra-Contador-PGDAS).

### 2.2 Soluções especializadas

| Fornecedor | Funcionalidade-chave |
|---|---|
| **Contmatic** (PGDAS via Integra Contador) | Rotina em lote para todas as empresas Simples da carteira |
| **e-Auditoria — Motor do Simples Nacional** | Auditoria prévia + transmissão ao PGDAS-D + envio do DAS ao cliente |
| **Jettax** | Apuração automática com certificado A1 |
| **Sittax Simples** | Apuração fiscal automatizada |
| **Tron Informática** | Checklist interativo + RPA para obrigações acessórias |

### 2.3 Funcionalidades concretas a serem adotadas

- Apuração e transmissão automática ao PGDAS-D **sem intervenção manual**.
- **Geração e download em lote do DAS** para múltiplos CNPJs simultaneamente.
- **Envio automático ao cliente** via e-mail e portal (e WhatsApp em alguns hubs).
- **Auditoria pré-transmissão** com cruzamento de notas fiscais x faturamento declarado.
- **Alertas de prazo e MAED** (multa por atraso de entrega) integrados ao calendário fiscal.

### 2.4 Novidade regulatória crítica

A **Resolução CGSN nº 183/2025** instituiu, a partir de **1º de janeiro de 2026**, novas regras de MAED para PGDAS-D e DEFIS:

> Multa **desde o primeiro dia** de atraso, de 2% ao mês (limitada a 20%) com **mínimo de R$ 50,00 por declaração**.

Isso transforma a automação de **conveniência em obrigação econômica**: um escritório com 200 clientes Simples que perca o prazo coletivamente em um mês pode acumular R$ 10 mil em multas mínimas, valor superior ao custo anual do Integra Contador.

Soma-se a isso o início da **fase de transição da Reforma Tributária (IBS/CBS)** em 2026, que cria regime híbrido para o Simples Nacional e amplia drasticamente a complexidade da apuração — outro vetor que torna a automação inevitável.

### 2.5 Indicador de produtividade

Casos relatados indicam que a automação completa do fluxo PGDAS-D **elimina até 21 tarefas manuais por cliente** (do login no portal ao envio do DAS), além de eliminar erros de digitação e liberar a equipe para atividades consultivas.

---

## 3. Regularize / PGFN — Funcionalidades Adicionais

### 3.1 O que existe além do portal

Embora o relatório original esteja correto ao afirmar que **não há API transacional pública** do Regularize, três caminhos foram subexplorados:

- **Lista de Devedores da PGFN** (dados abertos): permite consulta em lote para monitoramento da carteira de clientes e prospects, sem necessidade de autenticação.
- **Sistema unificado de certidões conjuntas RFB/PGFN** lançado em julho/2025, com histórico completo, que abre caminho para web services no curto prazo.
- **Integração via Integra Contador** para emissão de certidões conjuntas e consulta de parcelamentos federais administrados pela PGFN.

### 3.2 Soluções de terceiros mais relevantes

| Fornecedor | Diferencial específico para PGFN |
|---|---|
| **SIEG IriS** | Emissão de guias de parcelamento PGFN, consulta de Dívida Ativa/CADIN, monitoramento de caixa postal |
| **Fiscontech** | Download automático de guias + envio via WhatsApp/e-mail + portal do cliente |
| **e-Auditoria** | Captura automática de pendências PGFN, antecipação de riscos |
| **Dootax** | Gestão centralizada de CNDs incluindo PGFN |

### 3.3 Funcionalidades que otimizam o trabalho

- **Download em lote** de DARF e DAS de parcelamentos federais.
- **Renovação automática de CND conjunta RFB/PGFN** com alerta de validade.
- **Identificação automática de inclusão em Dívida Ativa da União e CADIN**.
- **Disparo automático ao cliente** via WhatsApp/e-mail das guias de parcelamento.
- **Monitoramento de transações tributárias** vigentes e adesão a novos editais (Lei do Contencioso 13.988/2020).

### 3.4 Indicador de produtividade

Soluções como SIEG IriS e Fiscontech relatam **ganho de mais de 2 horas úteis por dia** no time fiscal, principalmente pela eliminação do download manual mensal de guias de parcelamento.

---

## 4. Dívida Ativa Municipal de São Paulo — Funcionalidades Adicionais

### 4.1 Caminhos viáveis sem API oficial

Diferentemente da União, **não há catálogo Conecta Gov para a Dívida Ativa Municipal de SP**, e o Portal de Dados Abertos da Prefeitura ([dados.prefeitura.sp.gov.br](http://dados.prefeitura.sp.gov.br/)) não expõe consulta transacional. As alternativas práticas são:

| Fornecedor | Funcionalidade |
|---|---|
| **Infosimples** ([infosimples.com](https://infosimples.com/consultas/pref-sp-sao-paulo-divida-ativa/)) | API estruturada (RPA) que retorna **JSON** de Dívida Ativa Municipal SP por CNPJ/CPF/SQL/placa |
| **Dootax** | Automação de DAM/DARE/DARF, integração com ERPs |
| **SIEG IriS** | Monitoramento de pendências municipais, certidões automatizadas |

### 4.2 Funcionalidades a incorporar

- Verificação contínua de débitos inscritos por CNPJ/CPF e por SQL imobiliário (relevante para clientes com múltiplos imóveis).
- **Emissão automática de DAM/DARE** para parcelamentos.
- **Renovação em lote da CND municipal** unificada CPF/CNPJ.
- **Alerta de inscrição no CADIN Municipal** (espelho municipal do CADIN federal).
- Integração financeira com sistemas dos clientes (relevante para escritórios que prestam BPO financeiro).

### 4.3 Janela regulatória aberta em 2025–2026

> O **Programa “Fique em Dia”** e o **PPI 2024/2025** foram prorrogados para fevereiro de 2026, com descontos de **até 95%** sobre multas e juros. Adicionalmente, o **PL 0003/2025** prevê a criação da Câmara de Conciliação, Cobrança e Transação na PMSP, podendo introduzir interfaces digitais nos próximos meses.

Escritórios contábeis com automação de consulta da Dívida Ativa Municipal podem **prospectar ativamente clientes** com débitos elegíveis a esses programas — uma oportunidade comercial direta para **upsell de serviços de regularização**.

---

## 5. Nota Fiscal Paulista (NFP) — Funcionalidades Adicionais

### 5.1 Realidade técnica atualizada

O relatório original está correto: **não há API pública** da SEFAZ-SP especificamente para a NFP (saldo de créditos, transferência, contestação). Entretanto, três fatos relevantes foram omitidos:

- **A obrigatoriedade do login Gov.br** (níveis Prata ou Ouro) altera o paradigma de RPA — soluções antigas baseadas em login/senha simples deixaram de funcionar e precisam ser refeitas com **e-CNPJ A1**.
- A SEFAZ-SP mantém **Web Services SOAP completos para NF-e, NFC-e e CT-e** (escopo estadual de produtos), endereçáveis em [portal.fazenda.sp.gov.br/servicos/nfe](https://portal.fazenda.sp.gov.br/servicos/nfe/Paginas/URL-WEBSERVICES.aspx).
- Hubs como **SIEG, Arquivei/Qive e Acessórias** já capturam XML em massa diretamente da SEFAZ-SP e prefeituras, sem depender da NFP.

### 5.2 Funcionalidades que otimizam a rotina

- **Captura automática de XMLs** emitidos contra o CNPJ (NF-e, NFS-e, CT-e), sem depender do envio pelo cliente.
- **Verificação proativa de notas frias** emitidas indevidamente contra o CNPJ (antifraude).
- **Monitoramento de cancelamentos, denegações e inutilizações**.
- Para clientes que utilizam saldo NFP como créditos, **conciliação automática** dos extratos baixados manualmente do portal com os lançamentos contábeis.

### 5.3 Indicador

Hubs de captura de XML reduzem em **até 80%** o tempo de digitação e conferência fiscal.

---

## 6. JUCESP — Funcionalidades Adicionais (CORREÇÃO IMPORTANTE)

### 6.1 Existem APIs oficiais documentadas — corrigindo o relatório anterior

Esta é a **maior correção factual** ao relatório original. O **Integrador Estadual de São Paulo (Prodesp)** publica, em catálogo oficial OAS 3.0, três APIs para a JUCESP:

| API | Função | URL |
|---|---|---|
| **JUCESP-REDESIM** | Envio de solicitações empresariais à JUCESP e notificações à RFB | [integrador.sp.gov.br/wps/portal/integrador/catalogoApis/API/jucesp-redesim](https://integrador.sp.gov.br/wps/portal/integrador/catalogoApis/API/jucesp-redesim) |
| **JUCESP — Pesquisa por ID** | Obtém dados da empresa pelo ID interno JUCESP | [integrador.sp.gov.br/wps/portal/integrador/catalogoApis/API/cdesp-emp-jucesp-emp-id](https://integrador.sp.gov.br/wps/portal/integrador/catalogoApis/API/cdesp-emp-jucesp-emp-id) |
| **JUCESP — Gravação de dados** | Gravação dos dados de registro empresarial | [api.prodesp.sp.gov.br/portaldeapis/category/cat%C3%A1logo-de-apis/apis-para-governo/jucesp/0ZGKj000001I9QyOAK](https://api.prodesp.sp.gov.br/portaldeapis/category/cat%C3%A1logo-de-apis/apis-para-governo/jucesp/0ZGKj000001I9QyOAK) |

> **Atenção:** essas APIs estão classificadas como “APIs para governo” no portal Prodesp; o acesso para escritórios privados normalmente exige convênio/credenciamento. Vale, no entanto, formalizar consulta direta à Prodesp para confirmar elegibilidade e custos — abre-se a possibilidade de **integração nativa para abertura/alteração de empresas**, hoje feita manualmente.

### 6.2 Soluções de terceiros para JUCESP

| Fornecedor | Diferencial |
|---|---|
| **Infosimples** | API com download e OCR/parse da Ficha Cadastral Completa |
| **Consulta API** | Consulta de Ficha Cadastral por NIRE/CNPJ/CPF |
| **Dootax** | Gestão de Certidão Simplificada, Específica e Inteiro Teor |
| **Acessórias / SIEG** | Automação de rotinas e gestão de obrigações |

### 6.3 Funcionalidades a incorporar

- **Download e parse automático da Ficha Cadastral Completa** com extração estruturada de eventos (alteração de capital, sócios, endereço).
- **Emissão em lote de Certidões Simplificadas** (essencial para due diligence e processos licitatórios).
- **Consulta cadastral em massa** por carteira de clientes.
- **Sincronismo automático Cadesp ↔ JUCESP ↔ RFB**.

### 6.4 Novidades 2025–2026

- **Via única de documentos presenciais** desde 1º/maio/2025.
- **Integração JUCESP ↔ municípios via API REDESIM** (Facilita SP) iniciada em fev/2025.
- **Deferimento imediato** de processos elegíveis, reduzindo o lead time de abertura/alteração.

---

## 7. DCTFWeb — Funcionalidades Adicionais (BLOCO COM MAIORES NOVIDADES)

### 7.1 Novas APIs Serpro lançadas em abril de 2025 — não citadas no relatório original

A Receita Federal anunciou em [gov.br/receitafederal — Notícia abr/2025](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2025/abril/disponibilizadas-novas-apis-que-simplificam-e-facilitam-o-preenchimento-e-transmissao-da-dctfweb) a disponibilização de APIs específicas para a DCTFWeb dentro do Integra Contador:

| API | Função |
|---|---|
| **Consulta da apuração MIT** | Lê dados do Módulo de Inclusão de Tributos |
| **Encerramento do MIT** | Finaliza apuração programaticamente |
| **Emissão de DARF** | Gera DARF mesmo com a DCTFWeb em andamento |
| **Importação JSON** | Carga estruturada de débitos e suspensões no MIT |

Isso **invalida a afirmação categórica do relatório anterior** de que “DCTFWeb não tem API/Web service próprio”. Há, sim, e desde abril/2025.

### 7.2 Soluções especializadas

| Fornecedor | Diferencial |
|---|---|
| **Acellerador Contábil** ([acelleradorcontabil.com.br](https://acelleradorcontabil.com.br/)) | Conferência Domínio × e-CAC, transmissão DCTFWeb em 1 clique, salvamento automático de guias e recibos |
| **e-Auditoria (eMonitor)** | Captura via APIs Serpro, alertas de pendências |
| **SIEG / Qive (Arquivei)** | Captura de XMLs e alimentação das bases que geram DCTFWeb |

### 7.3 Funcionalidades concretas

- **Conferência automatizada ERP × e-CAC** antes da transmissão.
- **Transmissão em lote** da DCTFWeb com salvamento de recibos por empresa.
- **Geração e organização automática de DARFs** por competência e cliente.
- **Importação JSON do MIT** a partir do ERP, eliminando preenchimento manual.

### 7.4 Marco regulatório

> **Janeiro/2025:** implantação do MIT, extinção da DCTF PGD, unificação na DCTFWeb.  
> **Abril/2025:** abertura oficial das APIs Serpro para DCTFWeb.

### 7.5 Indicadores

Acellerador Contábil reporta **economia média de 7 minutos por declaração** e a Escola Superior SN documenta caso de **redução de 40 horas para 3 horas mensais** (ROI de 92%) no fechamento contábil.

---

## 8. REDESIM — Funcionalidades Adicionais (CORREÇÃO IMPORTANTE)

### 8.1 Existe API oficial — Integra-Redesim

O relatório anterior afirmou que “não foi encontrada API pública documentada”, o que está **desatualizado**. O Serpro publicou o módulo **Integra-Redesim (PNRCONTADOR)**, descrito em [apicenter.estaleiro.serpro.gov.br/.../integra-redesim/pnrcontador](https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/solucoes/integra-redesim/pnrcontador/), com as seguintes operações:

- Consulta de **vínculos ativos** entre contador e clientes.
- **Renúncia** de vínculo contábil.
- Consulta de **renúncias anteriores**.
- **Emissão do comprovante de renúncia** em PDF.

### 8.2 Módulo Administração Tributária (MAT) — vigente desde dez/2025

A Receita Federal implementou o **MAT integrado à REDESIM**, alterando o fluxo de abertura de empresas:

> A partir de **1º/dezembro/2025**, a definição do regime tributário (Simples Nacional, Lucro Presumido, etc.) passou a ser exigida **antes** da emissão do CNPJ, durante o processo de abertura, com **assinatura obrigatória do contador**. Fonte: [gov.br/receitafederal — Nov/2025](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2025/novembro/receita-federal-anuncia-a-implementacao-do-modulo-administracao-tributaria-mat-modernizacao-e-simplificacao-para-todo-o-brasil) e [CFC](https://cfc.org.br/noticias/abertura-de-empresas-brasileiras-dependera-da-assinatura-de-um-contador/).

### 8.3 Soluções de terceiros relevantes

| Fornecedor | Diferencial |
|---|---|
| **Domínio Sistemas (Thomson Reuters)** | Integração nativa com Integra Contador |
| **Omie** | Emissão de DBE padronizada, integração REDESIM |
| **Contmatic** | Soluções de abertura integradas + adequação à Reforma |
| **PalSys** | RPA alternativo ao Integra Contador para casos de baixo volume |
| **SIEG / Acessórias** | Acompanhamento de protocolos e legalização |

### 8.4 Funcionalidades a incorporar

- **Gestão em lote de vínculos contábeis** via Integra-Redesim (consulta, renúncia, comprovantes).
- **Preenchimento automatizado do Coletor Nacional/DBE**.
- **Definição do regime tributário no MAT** já no fluxo de abertura.
- **Sincronização cadastral** REDESIM ↔ ERP do escritório.

---

## 9. Recomendações Consolidadas para o Escritório

### 9.1 Plano de implementação por prioridade

A combinação de novidades regulatórias (MAED do Simples, MAT obrigatório, fim progressivo do e-CAC tradicional) com a maturidade do Integra Contador faz com que **2026 seja o ano de migração estrutural**. Recomenda-se a sequência:

1. **Curto prazo (0–3 meses):** Contratar/ativar o **Integra Contador** (Serpro) e priorizar os módulos **Caixa Postal, Sitfis, Sicalc, PGDAS-D e DCTFWeb/MIT**. Esses módulos cobrem os pontos de maior fricção operacional e maior risco de multa em 2026.
2. **Curto-médio prazo (3–6 meses):** Avaliar contratação de um **hub de RPA contábil** (SIEG IriS, e-Auditoria ou Acellerador Contábil) para encapsular as funções que ainda não migraram para API oficial — em particular Dívida Ativa Municipal SP, NFP e funcionalidades acessórias do JUCESP.
3. **Médio prazo (6–12 meses):** Formalizar consulta à **Prodesp** sobre acesso às APIs JUCESP (REDESIM, Pesquisa por ID, Gravação) — esse é um diferencial competitivo significativo se o escritório atende muitas operações de M&A, due diligence e abertura/alteração de empresas em SP.
4. **Médio-longo prazo (12+ meses):** Construir **dashboard interno** consolidando dados das APIs (saúde fiscal, prazos, riscos, oportunidades de regularização — ex.: PPI Municipal SP), transformando o escritório em consultor proativo, não apenas executor de obrigações.

### 9.2 Tabela-síntese de funcionalidades não cobertas no relatório original

| Sistema | Funcionalidade nova relevante | Origem |
|---|---|---|
| e-CAC | Caixa Postal via API; Sicalc via API; Procurações via API | Integra Contador |
| PGDAS-D | Apuração e transmissão programática; integração nativa Contmatic | Integra-PGDAS-D |
| PGFN | Lista de Devedores aberta; certidão conjunta unificada | Dados Abertos PGFN + RFB |
| Dívida Ativa SP | API estruturada via Infosimples; oportunidade comercial PPI 95% | Infosimples + PMSP |
| NFP | Login Gov.br obriga reformular RPA; hubs capturam XML em massa | SIEG / Arquivei / Qive |
| JUCESP | **3 APIs OAS 3.0 oficiais Prodesp** | Integrador SP |
| DCTFWeb | **APIs Serpro (abril/2025)** para MIT, encerramento, DARF, JSON | Integra Contador |
| REDESIM | **Integra-Redesim (PNRCONTADOR)**; MAT obrigatório dez/2025 | Integra Contador + RFB |

### 9.3 Riscos a monitorar

- **Endurecimento contra RPA não autorizado** no e-CAC: rotinas baseadas em scraping têm prazo de validade.
- **MAED do Simples desde 1º/jan/2026**: qualquer atraso gera multa mínima por declaração; volume × clientes pode tornar a operação manual economicamente inviável.
- **MAT na abertura de empresas**: escritórios sem fluxo digital integrado terão atrito com clientes que abrem CNPJ rapidamente via plataformas digitais.
- **Reforma Tributária (IBS/CBS) 2026–2033**: regimes híbridos para Simples elevam complexidade da apuração e exigem automação para evitar erros.

---

## 10. Fontes Consultadas (complementares ao relatório original)

- Integra Contador (Serpro): [apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador](https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/)
- Integra-Redesim PNRCONTADOR: [apicenter.estaleiro.serpro.gov.br/.../integra-redesim/pnrcontador](https://apicenter.estaleiro.serpro.gov.br/documentacao/api-integra-contador/pt/solucoes/integra-redesim/pnrcontador/)
- Receita Federal — APIs DCTFWeb (abr/2025): [gov.br/receitafederal — Notícia](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2025/abril/disponibilizadas-novas-apis-que-simplificam-e-facilitam-o-preenchimento-e-transmissao-da-dctfweb)
- Receita Federal — Implementação do MAT (nov/2025): [gov.br/receitafederal — Notícia MAT](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2025/novembro/receita-federal-anuncia-a-implementacao-do-modulo-administracao-tributaria-mat-modernizacao-e-simplificacao-para-todo-o-brasil)
- Catálogo de APIs Prodesp / Integrador SP: [integrador.sp.gov.br/wps/portal/integrador/catalogoApis](https://integrador.sp.gov.br/wps/portal/integrador/catalogoApis)
- API JUCESP Pesquisa por ID: [integrador.sp.gov.br/.../cdesp-emp-jucesp-emp-id](https://integrador.sp.gov.br/wps/portal/integrador/catalogoApis/API/cdesp-emp-jucesp-emp-id)
- API JUCESP REDESIM: [integrador.sp.gov.br/.../jucesp-redesim](https://integrador.sp.gov.br/wps/portal/integrador/catalogoApis/API/jucesp-redesim)
- SIEG IriS: [sieg.com/iris](https://www.sieg.com/iris/)
- e-Auditoria — Captura automática do e-CAC: [e-auditoria.com.br](https://www.e-auditoria.com.br/blog/captura-automatica-do-e-cac-o-novo-padrao-da-contabilidade-digital/)
- Acellerador Contábil: [acelleradorcontabil.com.br](https://acelleradorcontabil.com.br/)
- Acessórias: [acessorias.com](https://acessorias.com/)
- Fiscontech: [fiscontech.com.br](https://www.fiscontech.com.br/)
- Dootax: [dootax.com.br](https://dootax.com.br/)
- Infosimples — Dívida Ativa SP: [infosimples.com/consultas/pref-sp-sao-paulo-divida-ativa](https://infosimples.com/consultas/pref-sp-sao-paulo-divida-ativa/)
- Contabeis — Fim do e-CAC: [contabeis.com.br/noticias/76129](https://www.contabeis.com.br/noticias/76129/receita-federal-reforca-fim-do-e-cac-em-nova-in/)
- CFC — Abertura de empresas e contador (MAT): [cfc.org.br/noticias/abertura-de-empresas-brasileiras-dependera-da-assinatura-de-um-contador](https://cfc.org.br/noticias/abertura-de-empresas-brasileiras-dependera-da-assinatura-de-um-contador/)
- Resolução CGSN nº 183/2025 e MAED: [Receita Federal — Simples Nacional Notícias](https://www8.receita.fazenda.gov.br/simplesnacional/noticias/NoticiaCompleta.aspx?id=1e17613a-4a08-4ba0-9a7d-550e833f3e13)
- Facilita SP — Adesão à REDESIM: [facilitasp.sp.gov.br/.../ADESAO-A-REDESIM-v2.pdf](https://www.facilitasp.sp.gov.br/wp-content/uploads/2025/02/ADESAO-A-REDESIM-v2.pdf)
- Câmara Municipal SP — PL 0003/2025: [camararp.sp.gov.br/tramitacoes/1/120146](https://www.camararp.sp.gov.br/tramitacoes/1/120146)
