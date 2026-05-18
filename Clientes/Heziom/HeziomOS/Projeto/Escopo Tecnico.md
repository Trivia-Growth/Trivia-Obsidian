**HEZIOM OS**

Complemento Técnico: Infraestrutura, Segurança e Confiabilidade

Referência: Documento Executivo v1.0 | Março/2026 | Confidencial

**Contexto**

Este documento complementa o Heziom OS — Documento Executivo v1.0, apresentado ao Conselho em março de 2026. Cobre as decisões técnicas de infraestrutura, segurança, conformidade com LGPD, resiliência operacional, controle de acesso dos agentes e modelo de manutenção. Preparado por Lucas \[sobrenome\], Tech Lead responsável pela arquitetura técnica do projeto, com experiência em sistemas de alta disponibilidade e segurança em larga escala.

**1\. Stack Técnica e Decisões de Arquitetura**

A stack do Heziom OS foi definida com base em três critérios não negociáveis: segurança por padrão, resiliência operacional e capacidade de evolução sem reescrita.

**Camada**

**Tecnologia**

**Justificativa**

Frontend

React 18 + TypeScript

Tipagem estática em toda a base de código, eliminando erros em tempo de execução. Comportamento auditável em sistema que exibe dados financeiros e operacionais sensíveis.

Backend e lógica sensível

Deno (Edge Functions)

Toda lógica de autenticação, autorização, integração com sistemas externos e execução dos agentes roda server-side, sem exposição de credenciais ao cliente.

Banco de dados

PostgreSQL via Supabase na AWS

Infraestrutura AWS com redundância gerenciada, failover automático, backups diários e criptografia em repouso e em trânsito por padrão.

Validação de dados

Zod (todas as Edge Functions)

Validação de schema em 100% das entradas, incluindo instruções aos agentes de IA. Sem exceções.

Orquestração de agentes

Edge Functions + OpenRouter

Roteamento entre modelos de linguagem sem dependência de fornecedor único. Modelos avaliados: Claude (Anthropic) e GPT-4o (OpenAI).

Infraestrutura de deploy

Lovable + CDN

Build otimizado com code splitting, lazy loading por rota e bundle analisado antes de cada release.

Monitoramento

Audit logs + Web Vitals + alertas

Toda ação dos agentes registrada com timestamp e rastreabilidade completa. Alertas configurados para padrões anômalos.

Cada decisão de stack passou pelo seguinte filtro: o componente reduz ou amplia a superfície de ataque? Componentes que exigem abertura de portas, credenciais em código ou dependências externas não auditáveis foram descartados. A arquitetura serverless elimina a gestão de servidores expostos. O princípio central de segurança que orienta o projeto: se o código fosse público amanhã, o sistema ainda estaria seguro.

**2\. Segurança em Profundidade**

O Heziom OS adota o modelo de defesa em profundidade: cada camada do sistema se protege de forma independente, mesmo que outra camada seja comprometida. Não existe ponto único de falha de segurança.

**Camada**

**Controles implementados**

**Frontend**

Validação de inputs com Zod, sanitização de HTML com DOMPurify, sem segredos no client, Content Security Policy e HTTP Security Headers.

**Edge Functions**

JWT validado server-side via auth.getUser(), validação Zod em todo body recebido, rate limiting por rota, CORS restritivo com domínio fixo em produção, logging estruturado com identificador de requisição.

**Banco de dados**

Row Level Security com FORCE em todas as tabelas sensíveis, políticas de menor privilégio, views mascaradas para PII, SERVICE\_ROLE\_KEY exclusivamente em Edge Functions.

**Infraestrutura**

HTTPS obrigatório com HSTS, variáveis de ambiente no cofre do provedor, auditoria de dependências antes de todo deploy, rotação de secrets documentada.

**Autenticação e sessões**

Toda autenticação é gerenciada pelo Supabase Auth com JWT validado exclusivamente no backend via auth.getUser(). O frontend nunca é fonte de verdade sobre identidade. Acesso administrativo exige autenticação de múltiplos fatores. Sessões são invalidadas globalmente em caso de suspeita de comprometimento.

**Proteção de credenciais**

Chaves de acesso de todos os sistemas integrados como Literárius, Meta Ads e WhatsApp API são armazenadas exclusivamente como variáveis de ambiente no servidor, validadas na inicialização da aplicação. Nenhuma credencial trafega por nenhuma outra camada do sistema.

**Rate limiting e prevenção de abuso**

*   Login: 5 tentativas em 15 minutos.
*   API geral: 20 requisições por minuto por usuário.
*   Operações financeiras: 3 tentativas em 5 minutos com bloqueio progressivo.
*   IPs com padrão anômalo de requisições são bloqueados automaticamente.

**Auditoria e rastreabilidade**

Toda ação executada pelos agentes de IA é registrada com timestamp, identificação do agente, dados consultados e resultado da operação. Esses registros são retidos por no mínimo 12 meses e estão disponíveis para consulta pelo Conselho a qualquer momento. Nenhum log contém dados sensíveis como senhas, tokens ou PII em texto claro.

**3\. Controle de Acesso dos Agentes de IA**

O escopo de atuação de cada agente é definido e limitado no nível do banco de dados via Row Level Security com FORCE ativo em todas as tabelas sensíveis. Esse controle é estrutural: persiste independentemente de qualquer camada acima dele, incluindo o código da aplicação. Um agente mal configurado ou comprometido não consegue acessar dados fora do seu escopo definido.

**Perfil**

**Escopo de acesso**

Superagente executivo

Leitura de todas as tabelas operacionais para consulta e análise. Sem permissão de escrita direta.

Agente Financeiro

Leitura e escrita em contas a pagar, contas a receber e conciliações. Sem acesso a módulos de CRM ou editorial.

Agente de E-commerce

Leitura e escrita em leads, carrinhos e réguas de relacionamento. Sem acesso a dados financeiros ou fiscais.

Agente de Atendimento

Leitura de pedidos e políticas de troca. Escrita restrita ao histórico de atendimento. Sem acesso a dados financeiros.

Agente Editorial

Leitura e escrita no pipeline editorial. Sem acesso a qualquer módulo financeiro ou de clientes.

Usuário financeiro

Lançamento e consulta. Sem permissão de aprovação ou execução de pagamentos.

Diretores

Aprovação de pagamentos exclusivamente via Internet Banking do Santander, fora de qualquer sistema interno.

Toda ação irreversível, incluindo pagamentos, cancelamentos de pedidos, exclusão de dados e comunicações em massa, exige aprovação explícita de um usuário autorizado antes de ser processada. Os agentes propõem, os humanos aprovam.

**4\. Integração Bancária e Fluxo de Pagamentos**

A execução financeira da Heziom continuará operando pelo Literárius, que possui integração ativa com o Santander via transmissão de arquivos CNAB, contratada diretamente com o banco. O Heziom OS não terá acesso de execução sobre pagamentos em nenhuma hipótese.

O agente financeiro identificará obrigações de pagamento com base no histórico de lançamentos, reconhecendo padrões recorrentes como fornecedores fixos, vencimentos e valores esperados. A partir disso, poderá preparar a fila de pagamentos de forma autônoma ou submeter a proposta para validação do responsável financeiro antes de enviá-la ao Literárius, conforme configuração definida pela gestão.

O Literárius centraliza o lançamento e gera o arquivo de remessa transmitido ao Santander. A liberação efetiva de qualquer pagamento exige aprovação de dois diretores financeiros diretamente no Internet Banking do banco, fora de qualquer sistema interno. Os usuários do Heziom OS e do Literárius operam com permissão de lançamento e consulta, sem qualquer acesso à etapa de aprovação.

Essa arquitetura cria três camadas independentes entre a automação e o dinheiro: o Heziom OS processa e propõe, o Literárius estrutura e transmite, o Santander executa mediante aprovação humana de dois diretores. Nenhum agente de IA participa ou influencia as etapas de aprovação e execução financeira.

**5\. Conformidade com LGPD**

O Heziom OS será construído com privacidade por padrão em todos os módulos que tratam dados pessoais de clientes, colaboradores e parceiros.

**Base legal para tratamento**

*   Dados de clientes: execução de contrato para pedidos, entregas e financeiro, e legítimo interesse para CRM, com opt-out disponível.
*   Dados de colaboradores: obrigação legal e execução de contrato de trabalho. Nenhum dado de colaborador será usado para treinamento de modelos de IA.

**Direitos dos titulares**

O módulo de CRM incluirá funcionalidade de exclusão e exportação de dados de um titular específico, atendendo os direitos de portabilidade e esquecimento previstos na LGPD.

**Fornecedores de infraestrutura**

Supabase, AWS, OpenAI e Anthropic possuem Data Processing Agreements disponíveis e são conformes com GDPR, o padrão mais restritivo vigente, cobrindo os requisitos da LGPD brasileira.

**Encarregado de dados**

Será nomeado formalmente um encarregado de dados no início do projeto, conforme exigido para organizações que tratam dados pessoais em escala.

**6\. Resiliência e Disponibilidade**

A estratégia de resiliência do Heziom OS parte de um princípio central: o sistema deve operar em Graceful Degradation, nunca falhar de forma opaca. Em qualquer cenário de instabilidade, o comportamento esperado é definido, comunicado e não destrutivo.

**Infraestrutura com disponibilidade gerenciada**

A hospedagem na AWS via Supabase inclui redundância de instâncias, failover automático e backups diários com retenção configurável e point-in-time recovery. A responsabilidade pela disponibilidade da camada de dados é contratual com o provedor, com SLA de 99,99% de uptime.

**Padrões de resiliência implementados**

**Padrão**

**Implementação**

Error Boundaries

Toda feature possui Error Boundary na raiz. Falha em um módulo não afeta os demais.

Retry automático

TanStack Query configurado com 2 retries e backoff exponencial em todas as requisições.

Graceful Degradation

Se um sistema externo como Meta Ads ou Bookwire estiver indisponível, os demais módulos continuam operando normalmente. O dashboard exibe os dados do último ciclo de sincronização com indicação de horário.

Fallback de modelos IA

Via OpenRouter: se o modelo primário estiver indisponível, o sistema roteia para o modelo alternativo sem interrupção para o usuário.

Operações atômicas

Ações financeiras são executadas de forma atômica com idempotência via requestId, prevenindo duplicação em caso de falha de rede.

Health checks

Edge Functions críticas expõem endpoint de health check para monitoramento contínuo.

Ambientes isolados

Produção e staging completamente separados desde o início. Toda atualização passa pelo staging com testes de regressão antes de chegar à produção.

**Monitoramento e observabilidade**

*   Erros de frontend capturados via Error Boundaries com logging estruturado.
*   Edge Functions com logs no formato \[FUNCAO\]\[REQUEST\_ID\] para rastreabilidade completa.
*   Web Vitals monitorados continuamente: LCP abaixo de 2,5s, INP abaixo de 200ms.
*   Alertas configurados para mudanças de saldo, acesso administrativo e rate limit atingido.

**7\. IA Confiável: Controle e Precisão**

**Agentes operam sobre dados estruturados**

Os agentes consultam tabelas com schema definido e executam ações com base em condições verificáveis. O modelo responde perguntas como qual o saldo desta conta no período X, em vez de interpretar documentos ou fazer inferências sobre dados ausentes. Toda instrução enviada aos modelos de IA passa por validação e sanitização antes do processamento.

**Rastreabilidade das respostas**

Toda resposta gerada pelo superagente inclui a fonte dos dados: tabela, período e timestamp de extração. O usuário pode verificar a origem de qualquer informação apresentada pelo sistema.

**Testes de regressão**

A cada atualização do sistema, um conjunto de consultas e cenários de teste é executado para verificar que os agentes continuam respondendo corretamente. Desvios são identificados antes de chegar ao ambiente de produção.

**8\. Propriedade do Sistema e Modelo de Manutenção**

**Propriedade do código**

O código do Heziom OS será de propriedade integral da Heziom, armazenado em repositório privado com acesso controlado. A Heziom detém o código completo independentemente de qualquer relação comercial futura com a equipe executora.

**Custo de infraestrutura após implantação**

**Item**

**Custo mensal**

Infraestrutura (Supabase Pro + AWS via Vercel Pro)

R$ 300 a R$ 600/mês

Tokens de IA (OpenAI / Anthropic para agentes)

até R$ 2.000/mês

**TOTAL ESTIMADO**

**R$ 2.300 a R$ 2.600/mês**

**Suporte técnico e manutenção corretiva**

O suporte técnico e a manutenção corretiva do sistema serão prestados sem custo adicional pelo período de 2 anos após a implantação completa, como parte do escopo contratado.

**9\. Primeiros Passos Técnicos após Aprovação**

As três primeiras semanas serão dedicadas a estabelecer a base técnica antes de qualquer desenvolvimento de produto:

*   Setup completo dos ambientes de produção e staging com todas as configurações de segurança, RLS e políticas de acesso aplicadas desde o início.
*   Configuração do repositório, pipeline de integração contínua, checklist de revisão de código e auditoria de dependências.
*   Início das integrações com as APIs do Literárius já mapeadas: Produtos, Estoque, Pedidos de Venda e Notas Fiscais.
*   O Dashboard Executivo, primeira entrega do projeto, estará operacional em até 30 dias após o início.

Heziom OS — Complemento Técnico v2.0 | Confidencial | Março/2026