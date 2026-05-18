# Relatorio Completo: APIs e Integracoes para Escritorios Contabeis no Brasil

**Data da pesquisa:** Maio 2026  
**Contexto:** Mapeamento de todas as APIs, web services e formas de integracao programatica relevantes para escritorios de contabilidade no Brasil.

---

## RESUMO EXECUTIVO

| Categoria | Status |
|-----------|--------|
| Com API oficial/aberta | eSocial, EFD-Reinf, NFS-e Nacional, NF-e (SEFAZ), Conecta Gov |
| Com API via terceiros | CNPJ, NF-e, NFS-e, Contmatic (portal developer) |
| Exige certificado digital | eSocial, EFD-Reinf, NF-e, SPED, DCTFWeb, e-CAC, NFS-e |
| Somente portal web (sem API) | e-CAC, Simples Nacional (PGDAS-D), Regularize/PGFN, Divida Ativa Municipal SP, JUCESP, Nota Fiscal Paulista (estadual) |

---

## 1. CONTMATIC (Phoenix, Gescon, Folha Phoenix)

### Portal de Desenvolvedor
- **Existe:** Sim. URL: `https://developer.contmatic.com.br`
- **Tipo:** REST API com documentacao tecnica
- **Recursos disponiveis via API:** Clientes, fornecedores, notas fiscais, lancamentos contabeis, folha de pagamento
- **Autenticacao:** Nao detalhada publicamente (requer contato/cadastro)

### Integracoes Nativas Mencionadas
- **Busca Legal** — consulta de dados cadastrais
- **Acessorias** — obrigacoes acessorias
- **Jettax** — compliance tributario
- **Contbank** — servicos financeiros

### Exportacao/Importacao de Dados
- Historicamente suporta importacao/exportacao de arquivos nos formatos comuns do mercado contabil (SPED, XML de NF-e, layouts bancarios OFX/CNAB)
- A documentacao detalhada de formatos nao esta disponivel publicamente — requer acesso ao portal de clientes (`cliente.contmatic.com.br`)

### Avaliacao
- O Contmatic **possui** portal de API (REST), o que e relativamente raro entre sistemas contabeis tradicionais no Brasil
- A documentacao completa requer cadastro/autenticacao
- Para integracoes complexas, recomenda-se contato direto com equipe tecnica Contmatic

---

## 2. APIs da RECEITA FEDERAL DO BRASIL

### 2.1 Consulta CNPJ

| Canal | Detalhes |
|-------|----------|
| **Portal web (oficial)** | `solucoes.receita.fazenda.gov.br/servicos/cnpjreva/` — consulta publica com CAPTCHA, sem API |
| **Dados abertos (download)** | Base completa de CNPJ disponivel para download em `dados.rfb.gov.br` — arquivos CSV atualizados periodicamente |
| **Conecta Gov** | API de consulta CNPJ disponivel para orgaos publicos via plataforma Conecta |
| **APIs de terceiros** | ReceitaWS, BrasilAPI, CNPJ.ws — REST APIs com planos gratuitos e pagos |

#### APIs de Terceiros para CNPJ:
- **BrasilAPI** (`brasilapi.com.br/api/cnpj/v1/{cnpj}`) — REST, JSON, gratuita, dados completos incluindo QSA, CNAEs, regime tributario
- **ReceitaWS** (`receitaws.com.br`) — REST API, plano gratuito limitado + planos pagos
- **CNPJ.ws** (`cnpj.ws`) — REST API, 3 consultas/minuto gratis, planos ate 2.000 req/min, dados de Receita Federal + Sintegra + Suframa

### 2.2 Consulta CPF
- **Portal web oficial:** consulta com CPF + data de nascimento (com CAPTCHA)
- **Conecta Gov:** API de Cadastro Base do Cidadao (CPF) — restrita a orgaos publicos
- **Terceiros:** Servicos como Serpro (API oficial B2B) oferecem consulta de CPF via API

### 2.3 NF-e (Nota Fiscal Eletronica de Produtos)
- **Protocolo:** SOAP (Web Services XML)
- **Operacoes:** Autorizacao, consulta, cancelamento, inutilizacao, manifestacao destinatario
- **Certificado digital:** ICP-Brasil A1 ou A3 OBRIGATORIO
- **Endpoints:** Cada SEFAZ estadual tem seus proprios endpoints SOAP
- **Documentacao:** Portal Nacional da NF-e (`nfe.fazenda.gov.br`)
- **Acesso:** Sistemas integram diretamente via SOAP ou usam APIs intermediarias (Focus NFe, Tecnospeed, eNotas)

### 2.4 Certidoes (CND / CPEND)
- **Conecta Gov:** API de Consulta de Certidao Negativa de Debitos disponivel no catalogo
- **Portal web:** Emissao via e-CAC com certificado digital
- **Para empresas privadas:** Nao ha API publica direta — usar Conecta Gov (orgaos publicos) ou scraping automatizado (nao oficial)

### 2.5 Situacao Fiscal
- Acessivel apenas via **e-CAC** com certificado digital ou gov.br nivel prata/ouro
- **Nao existe API publica** para consulta de situacao fiscal

---

## 3. e-CAC (Centro Virtual de Atendimento ao Contribuinte)

### Status de API
- **NAO existe API oficial publica do e-CAC**
- Acesso exclusivamente via portal web com autenticacao

### Formas de Acesso
1. **Certificado digital** ICP-Brasil (e-CPF ou e-CNPJ) — acesso completo
2. **Gov.br** nivel Prata ou Ouro — acesso parcial
3. **Codigo de acesso** — funcionalidades limitadas (sendo descontinuado)

### Procuracao Eletronica (PROCAD)
- Escritorios contabeis acessam dados de clientes via **procuracao eletronica**
- Cadastro via certificado digital do cliente ou presencialmente na Receita
- Permite delegacao de servicos especificos (DCTF, SPED, consulta fiscal, etc.)
- **Nao ha API para gerenciar procuracoes — apenas portal web**

### Servicos Disponiveis no e-CAC (via portal)
- Consulta de situacao fiscal
- Emissao de certidoes (CND/CPEND)
- Retificacao de declaracoes
- Consulta de processos digitais
- Parcelamentos
- Compensacoes
- Consulta de IRPF/IRPJ
- Acesso a caixas postais de mensagens da Receita

### Automatizacao
- **Oficialmente:** Nao e permitida
- **Na pratica:** Algumas empresas fazem RPA/scraping com certificado digital, porem com riscos de bloqueio e sem suporte oficial
- **Solucoes de terceiros:** Existem empresas que oferecem robos para e-CAC (ex: Acessorias, Busca Legal) — integram com Contmatic

---

## 4. NOTA FISCAL PAULISTA (NFP) / NOTA DO MILHAO

### Nota Fiscal Paulista (Estadual - SEFAZ-SP)
- **Portal:** `nfp.fazenda.sp.gov.br`
- **API publica:** NAO EXISTE
- **Acesso:** Portal web com login (CPF/CNPJ + senha, certificado digital, ou gov.br)
- **Automatizacao:** Nao ha web services publicos documentados
- **Para escritorios:** Acesso individual por empresa via portal web

### Nota do Povo / Nota do Milhao (Municipal - SP)
- **Portal:** `notadopovo.prefeitura.sp.gov.br`
- **API publica:** NAO EXISTE (pagina inacessivel na pesquisa)
- **Acesso:** Apenas portal web

### Avaliacao
- Ambos os programas sao exclusivamente portal web sem integracao programatica oficial

---

## 5. DIVIDA ATIVA FEDERAL (PGFN / Regularize)

### Portal Regularize
- **URL:** `regularize.pgfn.gov.br`
- **API publica:** NAO EXISTE
- **Funcionalidades (portal web):**
  - Consulta de debitos inscritos em divida ativa
  - Parcelamentos e negociacoes
  - Emissao de certidoes (CND/CPEND relativa a divida ativa da Uniao)
  - Transacoes tributarias
- **Acesso:** Gov.br (conta nivel prata/ouro) ou certificado digital
- **Automatizacao:** Nao e possivel oficialmente

### Conecta Gov
- **API de Consulta de Divida Ativa da Uniao** disponivel no catalogo Conecta — porem restrita a orgaos publicos

### Avaliacao
- Para escritorios contabeis: acesso APENAS via portal web
- Nao ha integracao programatica disponivel para o setor privado

---

## 6. DIVIDA ATIVA MUNICIPAL (Sao Paulo)

### Portal Divida Ativa SP
- **URL:** `dividaativa.prefeitura.sp.gov.br`
- **API publica:** NAO EXISTE
- **Servicos disponiveis (portal web):**
  - Consulta de debitos inscritos (IPTU, ISS, taxas)
  - Pagamento a vista ou parcelamento
  - Emissao de certidoes negativas de tributos imobiliarios
  - Certidao unificada CPF/CNPJ
- **Acesso:** Portal web com CPF/CNPJ
- **Contato:** Telefone 156, presencial na Rua Libero Badaro 190

### Avaliacao
- **Nenhuma integracao programatica** disponivel
- Escritorios precisam acessar manualmente o portal para cada cliente/imovel

---

## 7. SPED (Sistema Publico de Escrituracao Digital)

### 7.1 ECD (Escrituracao Contabil Digital) e ECF (Escrituracao Contabil Fiscal)
- **Transmissao:** Via programa validador desktop (PVA) + ReceitanetBX
- **Certificado digital:** ICP-Brasil A1 ou A3 OBRIGATORIO para assinatura e transmissao
- **API/Web service para transmissao:** NAO EXISTE — obrigatoriamente via programa validador da Receita
- **Fluxo:** Sistema contabil gera arquivo texto (layout SPED) -> PVA valida -> ReceitanetBX transmite

### 7.2 EFD-ICMS/IPI e EFD-Contribuicoes
- **Transmissao:** Via programa validador desktop (PVA) + ReceitanetBX
- **Certificado digital:** ICP-Brasil A1 ou A3 OBRIGATORIO
- **API/Web service:** NAO EXISTE para transmissao direta
- **Fluxo:** Idem ECD — arquivo texto gerado pelo sistema fiscal -> PVA -> ReceitanetBX

### 7.3 EFD-Reinf
- **Transmissao:** Via WEB SERVICE (diferente dos demais SPED!)
- **Protocolo:** SOAP (similar ao eSocial)
- **Certificado digital:** ICP-Brasil OBRIGATORIO
- **Endpoints:** Web services proprios da EFD-Reinf (produção e producao restrita)
- **Integracao:** Sistemas podem transmitir diretamente via SOAP sem programa validador
- **Relacao com DCTFWeb:** Eventos da EFD-Reinf alimentam automaticamente a DCTFWeb

### 7.4 Resumo SPED

| Modulo | Forma de Transmissao | Certificado | API/WS |
|--------|---------------------|-------------|--------|
| ECD | Programa Validador + ReceitanetBX | Sim (A1/A3) | Nao |
| ECF | Programa Validador + ReceitanetBX | Sim (A1/A3) | Nao |
| EFD-ICMS/IPI | Programa Validador + ReceitanetBX | Sim (A1/A3) | Nao |
| EFD-Contribuicoes | Programa Validador + ReceitanetBX | Sim (A1/A3) | Nao |
| EFD-Reinf | Web Service SOAP | Sim (ICP-Brasil) | **SIM** |

---

## 8. eSocial

### Web Services
- **Protocolo:** SOAP (XML)
- **Versao atual do layout:** S-1.3
- **Certificado digital:** ICP-Brasil A1 ou A3 OBRIGATORIO

### Endpoints Confirmados (Producao Restrita / Teste)
- **Envio de lotes:** `https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc`
- **Consulta de lotes:** `https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc`

### Documentacao Tecnica
- Manual do Desenvolvedor v.1.15
- Pacote de Comunicacao v.1.6
- Schemas XSD para validacao
- Ambiente de producao restrita para testes

### Integracao
- Sistemas de folha de pagamento integram diretamente via web services SOAP
- Procuracao eletronica e assinatura digital requeridas
- Eventos transmitidos em lotes XML assinados digitalmente

---

## 9. DCTFWeb

- **API/Web service proprio:** NAO EXISTE
- **Funcionamento:** Gerada AUTOMATICAMENTE a partir dos dados transmitidos via eSocial + EFD-Reinf
- **Acesso:** Exclusivamente via e-CAC com certificado digital
- **Fluxo:** eSocial (eventos) + EFD-Reinf (retencoes) -> DCTFWeb (consolidacao) -> Transmissao/Confirmacao via e-CAC
- **Certificado digital:** OBRIGATORIO

---

## 10. FGTS Digital

- **API propria:** Nao ha documentacao publica de API REST/SOAP
- **Funcionamento:** Integrado ao eSocial — usa os dados ja transmitidos via web services do eSocial
- **Guia de recolhimento:** Gerada no portal FGTS Digital com base nos eventos do eSocial
- **Certificado digital:** OBRIGATORIO para acesso ao portal
- **Acesso:** Portal web (`fgtsdigital.gov.br`)
- **Integracao:** A integracao se da VIA eSocial — nao ha transmissao separada de dados trabalhistas

---

## 11. SIMPLES NACIONAL (PGDAS-D)

- **API publica:** NAO EXISTE
- **Acesso:** Portal do Simples Nacional (`www8.receita.fazenda.gov.br/SimplesNacional`)
- **Autenticacao:** Certificado digital ou codigo de acesso
- **Calculo do DAS:** Feito manualmente no portal PGDAS-D
- **Automatizacao:** Nao ha web services oficiais
- **Na pratica:** Alguns sistemas contabeis (incluindo Contmatic) oferecem integracao via RPA/importacao de dados, mas nao via API oficial

---

## 12. REDESIM (Abertura/Alteracao de Empresas)

- **Portal:** `www.gov.br/empresas-e-negocios`
- **API publica documentada:** NAO ENCONTRADA
- **Funcionalidades (portal web):** Abrir CNPJ, alterar CNPJ, consultar CNPJ, viabilidade de nome
- **Integracao:** Conecta com Junta Comercial estadual via Integrador Estadual
- **Automatizacao para escritorios:** Apenas via portal web — sem API para automacao

---

## 13. JUCESP (Junta Comercial do Estado de SP)

- **Portal:** `institucional.jucesp.sp.gov.br` e `jucesponline.sp.gov.br`
- **API publica:** NAO EXISTE documentacao publica
- **Servicos online disponiveis:**
  - Pesquisa de empresas no banco de dados
  - Certidoes digitais
  - Registro e alteracao via VRE (Via Rapida Empresa)
  - Integrador Estadual (REDESIM)
- **Automatizacao:** Apenas via portal web
- **Para escritorios:** Manual de Servicos Online disponivel, mas sem integracao programatica

---

## 14. NFS-e (Notas Fiscais de Servico)

### 14.1 Sistema Nacional NFS-e (Federal)
- **Status:** Em implantacao nacional progressiva
- **Portal:** `gov.br/nfse`
- **APIs disponíveis:** SIM — REST APIs com documentacao
  - **ADN (Ambiente de Dados Nacional):** `adn.nfse.gov.br/docs/index.html`
  - **CNC (Comite Nacional de Coordenacao)**
  - **Parametros Municipais**
  - **DANFSE**
  - **SEFIN Nacional**
- **Ambientes:** Producao e Producao Restrita (homologacao)
- **Certificado digital:** OBRIGATORIO para autenticacao
- **Padrao:** ABRASF (Associacao Brasileira das Secretarias de Financas)

### 14.2 NFS-e Sao Paulo (NF Paulistana)
- **Portal:** `nfe.prefeitura.sp.gov.br`
- **Web services:** Historicamente disponivel via SOAP (padrao ABRASF)
- **Acesso:** Login unificado + certificado digital
- **Documentacao:** Requer contato com Secretaria Municipal da Fazenda (156)
- **Integracao:** Sistemas contabeis integram via web services SOAP com certificado A1

### 14.3 APIs de Terceiros para NFS-e
- **Focus NFe** (`focusnfe.com.br`) — REST API, +1.400 municipios integrados, aceita certificado A1
- **eNotas** (`enotas.com.br`) — Emissao automatica NF-e/NFS-e, integracao com plataformas
- **Tecnospeed** — API de notas fiscais
- Todas essas solucoes abstraem a complexidade dos diferentes padroes municipais

---

## 15. CAGED / RAIS / eSocial

- **CAGED:** Substituido pelo eSocial (evento S-2200/S-2299) desde janeiro 2020
- **RAIS:** Substituida pelo eSocial para a maioria das empresas
- **Transmissao:** Via web services SOAP do eSocial (ja detalhado na secao 8)
- **Nao ha mais sistema separado** — a integracao e exclusivamente via eSocial

---

## 16. CONECTIVIDADE SOCIAL (Caixa Economica Federal)

- **Sendo substituido** pelo FGTS Digital (2024-2025)
- **Historicamente:** Aplicativo desktop com certificado digital para transmissao de SEFIP/GRRF
- **API publica:** NAO EXISTE — era exclusivamente via aplicativo proprietario da CEF
- **Status atual:** Em desativacao progressiva com migracao para FGTS Digital

---

## 17. CONECTA GOV (APIs do Governo Federal)

### APIs Confirmadas no Catalogo
- Consulta CNPJ
- Cadastro Base do Cidadao (CPF)
- Certidao Negativa de Debitos (CND)
- Consulta Divida Ativa da Uniao
- Qualificacao de enderecos
- Faixas de renda familiar
- Registros de emprego
- 100+ APIs no catalogo total

### Restricoes de Acesso
- **Destinado a orgaos publicos** que queiram integrar seus servicos
- **Empresas privadas** em geral NAO tem acesso direto
- Acesso via Plataforma Conecta com credenciais governamentais

---

## 18. SOLUCOES DE TERCEIROS (Resumo)

### Para Consulta de CNPJ/CPF
| Servico | Tipo | Gratuito | Limite Free |
|---------|------|----------|-------------|
| BrasilAPI | REST/JSON | Sim | Ilimitado (open source) |
| ReceitaWS | REST | Parcial | Limitado |
| CNPJ.ws | REST/JSON | Parcial | 3 req/min |
| Serpro (APIs) | REST | Nao | Pago (oficial B2B) |

### Para NF-e / NFS-e / NFC-e
| Servico | Cobertura | Tipo |
|---------|-----------|------|
| Focus NFe | NF-e, NFS-e (1400+ cidades), NFC-e, CT-e, MDFe | REST API |
| eNotas | NF-e, NFS-e | REST API |
| Tecnospeed | NF-e, NFS-e, NFC-e | REST API |
| Nota Control | NFS-e | REST API |

### Para Automatizacao de Obrigacoes
| Servico | Funcao |
|---------|--------|
| Acessorias | Integracao com portais governamentais (eSocial, SPED, Simples) |
| Jettax | Compliance tributario automatizado |
| Busca Legal | Consulta de dados cadastrais |

---

## MATRIZ CONSOLIDADA

### O que TEM API oficial/aberta:
1. **eSocial** — SOAP Web Services (certificado digital)
2. **EFD-Reinf** — SOAP Web Services (certificado digital)
3. **NF-e (SEFAZ)** — SOAP Web Services (certificado digital)
4. **NFS-e Nacional** — REST APIs (certificado digital)
5. **NFS-e Municipais (maioria)** — SOAP ABRASF (certificado digital)
6. **Conecta Gov** — REST (restrito a orgaos publicos)
7. **Contmatic** — REST API (portal developer)
8. **Dados abertos CNPJ** — Download de arquivos CSV

### O que EXIGE certificado digital:
- eSocial, EFD-Reinf, NF-e, NFS-e, SPED (todos os modulos)
- e-CAC (acesso completo)
- DCTFWeb
- FGTS Digital
- Conectividade Social
- Regularize/PGFN (acesso empresarial)
- NFS-e Nacional

### O que so funciona via PORTAL WEB (sem API):
- **e-CAC** (sem API publica)
- **Simples Nacional / PGDAS-D** (sem API)
- **Regularize / PGFN** (sem API)
- **Divida Ativa Municipal SP** (sem API)
- **Nota Fiscal Paulista** (sem API)
- **JUCESP** (sem API)
- **REDESIM** (sem API publica para privados)
- **DCTFWeb** (gerada automaticamente, acesso via e-CAC)
- **FGTS Digital** (portal web, dados via eSocial)

### O que tem SOLUCOES DE TERCEIROS para automatizar:
- Consulta CNPJ/CPF: BrasilAPI, ReceitaWS, CNPJ.ws, Serpro
- NF-e/NFS-e/NFC-e: Focus NFe, eNotas, Tecnospeed
- Obrigacoes acessorias: Acessorias (integra com Contmatic)
- e-CAC: Solucoes de RPA (robotica) — ex: Busca Legal
- Compliance: Jettax
- Contabilidade/ERP: Contmatic (portal developer REST)

---

## RECOMENDACOES PARA C BRASIL CONTABILIDADE

1. **Prioridade alta:** Explorar o portal developer do Contmatic (`developer.contmatic.com.br`) — e o ponto central de integracao do seu sistema principal
2. **NFS-e:** Avaliar integracao via API do sistema nacional NFS-e ou via Focus NFe para cobertura multi-municipal
3. **Consulta CNPJ automatizada:** Usar BrasilAPI (gratuita) ou CNPJ.ws para verificacao cadastral automatica de clientes
4. **eSocial/EFD-Reinf:** Ja integrados via sistema de folha (provavelmente Folha Phoenix) — confirmar se a transmissao SOAP esta ativa
5. **e-CAC/PGFN/Simples Nacional:** Sem API oficial — considerar solucoes de RPA (Busca Legal/Acessorias) ou processos manuais otimizados
6. **CND automatizada:** Avaliar Conecta Gov se houver parceria com orgao publico, ou monitorar evolucao das APIs federais

---

## FONTES CONSULTADAS

- Portal Nacional NF-e: `nfe.fazenda.gov.br`
- Portal eSocial: `gov.br/esocial`
- Portal NFS-e Nacional: `gov.br/nfse`
- Conecta Gov: `gov.br/conecta/catalogo`
- Receita Federal: `gov.br/receitafederal`
- PGFN: `gov.br/pgfn`
- Prefeitura SP: `prefeitura.sp.gov.br`
- Contmatic: `contmatic.com.br` e `developer.contmatic.com.br`
- BrasilAPI: `brasilapi.com.br`
- CNPJ.ws: `cnpj.ws`
- Focus NFe: `focusnfe.com.br`
- eNotas: `enotas.com.br`
- JUCESP: `institucional.jucesp.sp.gov.br`
