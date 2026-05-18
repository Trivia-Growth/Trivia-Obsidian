CRM de Alta Performance + IA + WhatsApp  
Flow Builder Multicanal · Gestão Comercial · Multi-tenant SaaS para PMEs

v3.0 — Novidades: Flow Builder visual multicanal (WhatsApp + E-mail + clusters) · Forecast em camadas (Commit/Best Case/Pipeline) · Roteamento meritocrático · Campos de gestão comercial (ICP Score, Velocity, Forecast, Pós-venda) · ROAS individual + 9-Box · MTD Tracking · Próximo passo obrigatório

  

**1. Visão Geral do Produto**

O JimmyAtende é a evolução do Jimmy Conversas — um CRM de alta performance com IA integrada, atendimento via WhatsApp, flow builder multicanal, gestão de pipeline com forecast gerencial e treinamento de equipes. Desenvolvido para PMEs brasileiras que precisam de uma plataforma de vendas profissional, gerenciável e escalável sem a complexidade de soluções enterprise.

SaaS multi-tenant: React + TypeScript + Vite + Tailwind CSS + Supabase. Tema dark-only, identidade visual customizável por workspace.

**Proposta de Valor Central**

·    Flow Builder visual: orquestra réguas de comunicação WhatsApp + E-mail com base em clusters de perfil de cliente

·    CRM de alta performance: campos obrigatórios estratégicos, forecast em camadas, roteamento meritocrático de leads

·    Agente de IA 24/7 no WhatsApp com provider e modelo escolhidos por agente individualmente

·    Timeline 360° do cliente: conversas, reuniões, contratos, notas, NPS, forecast e lembretes

·    Enriquecimento automático via CNPJ (Receita Federal) ao cadastrar contato/empresa

·    NPS e CSAT automáticos pós-atendimento com alertas de detratores

·    Dashboard de gestão comercial: ROAS individual, 9-Box, MTD Tracking, win rate por fase

·    Roleplay com IA (texto + voz) para treinar vendedores com feedback automatizado

**Stack Tecnológico**

|   |   |
|---|---|
|**Componente**|**Tecnologia**|
|**Frontend**|React + TypeScript + Vite + Tailwind CSS|
|**Backend/DB**|Supabase (PostgreSQL + RLS + Edge Functions)|
|**Auth**|Supabase Auth (email/senha + magic link)|
|**IA**|Claude, OpenAI, Gemini — provider+modelo configurável por agente individualmente|
|**WhatsApp**|Z-API, Evolution API, API Oficial do WhatsApp (Meta)|
|**E-mail**|Resend (transacional, flow builder, NPS/CSAT, relatórios)|
|**Voz**|ElevenLabs Conversational AI + TTS (roleplay)|
|**Calendário**|Google Calendar API + Microsoft Graph API (Outlook)|
|**Enriquecimento**|API Receita Federal CNPJ (MVP) · LinkedIn/redes sociais (Fase 2)|
|**Transcrição**|Fireflies.ai (Fase 2)|
|**Cobrança**|AppMax — ativação manual pelo superadmin|
|**Hospedagem**|Lovable Cloud / Supabase Cloud|
|**Landing Pages**|Jimmy Studio — integração via webhook/API para jogar leads no JimmyAtende|

  

**2. Arquitetura Multi-Tenant**

Cada empresa é um workspace isolado via Row Level Security no Supabase. Nenhum dado de um workspace é acessível por outro.

**2.1 Hierarquia de Roles**

|   |   |   |
|---|---|---|
|**Role**|**Perfil**|**Permissões**|
|**superadmin**|Lucas — dono do SaaS|Todos os workspaces, impersonação, billing AppMax, audit logs globais, métricas consolidadas|
|**admin**|Comprador do SaaS|Gerencia workspace: usuários, IA, WhatsApp, pipelines, flow builder, NPS, base de conhecimento|
|**manager**|Gerente de vendas|Pipeline Review, roteamento, relatórios de gestão, 9-Box, MTD, ROAS por vendedor|
|**agent**|Vendedor / SDR / Closer|Suas conversas, seus deals, forecast próprio, roleplay, copiloto|

**2.2 Impersonação (Superadmin)**

·    Navega como qualquer usuário com banner persistente: 'Você está acessando como [Nome] — [Empresa]'

·    Todas as ações registradas no audit log com is_impersonated = true

**2.3 Onboarding (initialize-workspace)**

·    Workspace com trial de 14 dias, pipeline padrão (6 stages), 8 tags padrão

·    Agente de IA com defaults, lead_scoring_config com critérios padrão

·    Flow de boas-vindas padrão (3 touchpoints em 7 dias para leads novos)

·    1 cenário de roleplay inicial, metas padrão para MTD Tracking (admin configura os valores reais)

  

**3. Configuração de IA — Modelo por Agente**

Principal diferencial técnico: cada agente, copiloto e função de IA usa provider e modelo diferentes, otimizando custo × qualidade por caso de uso.  **★ NOVO v3.0**

**3.1 Arquitetura de 4 Níveis**

|   |   |   |
|---|---|---|
|**Nível**|**Descrição**|**Granularidade**|
|**Nível 1 — Organização**|Admin cadastra API keys (Claude, OpenAI, Gemini). Define quais providers estão habilitados.|Obrigatório|
|**Nível 2 — Agente de Atendimento**|Cada agente de WhatsApp escolhe provider + modelo. Ex: Agente Vendas → GPT-4o; Suporte → claude-haiku.|Por agente|
|**Nível 3 — Copiloto**|Cada perfil de copiloto tem provider + modelo próprio, independente do agente.|Por perfil|
|**Nível 4 — Funções Especiais**|Lead Scoring, avaliação de Roleplay, Flow Builder e Relatórios podem usar modelos mais potentes.|Por função|

**3.2 Providers e Modelos Suportados**

|   |   |   |
|---|---|---|
|**Provider**|**Modelos Disponíveis**|**Quando Usar**|
|**Claude (Anthropic)**|claude-opus-4-5, claude-sonnet-4-5, claude-haiku-4-5|Raciocínio complexo (Opus/Sonnet), custo e velocidade (Haiku)|
|**OpenAI**|gpt-4o, gpt-4o-mini, gpt-4-turbo|Equilíbrio custo-qualidade (4o-mini), máxima qualidade (4o)|
|**Google Gemini**|gemini-2.0-flash, gemini-1.5-pro, gemini-1.5-flash|Contexto longo (1.5-pro), velocidade (flash)|

|   |
|---|
|**Modelo de uso: cada organização usa sua própria API key**<br><br>  • O JimmyAtende NÃO centraliza custos de IA — cada cliente paga diretamente ao provider.<br><br>  • API keys criptografadas no Supabase Vault — nunca expostas no frontend.<br><br>  • Interface mostra estimativa de custo por modelo (ex: 'Haiku — ~$0.00025/1k tokens').<br><br>  • Botão 'Testar conexão' valida a key e exibe latência + resposta de exemplo.|

  

**4. Flow Builder — Régua de Comunicação Multicanal**

Orquestrador visual de comunicação que combina WhatsApp e E-mail em fluxos automatizados, com segmentação por clusters de perfil de cliente. É o módulo que transforma o JimmyAtende em uma ferramenta de automação comercial completa — análogo ao ActiveCampaign ou RD Station, mas com dados reais do pipeline e do comportamento de vendas.  **★ NOVO v3.0 — feature central**

**4.1 Canvas Visual do Flow Builder**

·    Editor drag-and-drop com blocos de: Gatilho → Condição → Espera → Ação → Ramificação

·    Múltiplos fluxos ativos simultaneamente por workspace, sem limite de complexidade

·    Preview do fluxo com simulação: 'Se o lead fosse João Silva (ICP A, segmento SaaS), seguiria este caminho...'

·    Versionamento de fluxos: salvar rascunho, publicar, pausar, arquivar

·    Duplicar fluxo existente como ponto de partida

·    Log de execução: quantos contatos passaram por cada nó, taxas de saída por condição

**4.2 Blocos Disponíveis no Builder**

|   |   |   |
|---|---|---|
|**Bloco**|**Descrição**||
|**GATILHO — Início do Fluxo**|||
|**Novo lead (API/WhatsApp/webhook)**|Lead criado por qualquer fonte inicia o fluxo selecionado||
|**Mudança de stage no pipeline**|Deal entra ou sai de determinado stage||
|**Tag adicionada/removida**|Contato recebe ou perde uma tag específica||
|**Score de lead atingiu X**|ICP Score cruzou um threshold configurado||
|**Deal parado há X dias**|Deal sem atividade por período configurável||
|**Data relativa ao contrato**|X dias antes/depois de início, renovação ou fim de contrato||
|**NPS/CSAT recebido**|Pesquisa respondida com nota específica (ex: NPS ≤ 6)||
|**Formulário Jimmy Studio**|Lead capturado via landing page no Jimmy Studio via webhook||
|**Manual pelo vendedor**|Vendedor adiciona contato ao fluxo manualmente||
|**CONDIÇÃO — Ramificação**|||
|**Cluster de perfil**|ICP Score A/B/C/D, segmento, subnicho, cargo do decisor||
|**Stage atual no pipeline**|Em qual etapa o deal está||
|**Produto/plano**|Qual produto o contato adquiriu ou está avaliando||
|**Campo customizado**|Qualquer campo do contato ou deal como condição||
|**Comportamento e-mail**|Abriu / não abriu / clicou / não respondeu mensagem anterior||
|**Horário/dia da semana**|Enviar apenas em dias úteis, horário comercial, etc.||
|**AÇÃO — O que fazer**|||
|**Enviar mensagem WhatsApp**|Texto, áudio gerado por ElevenLabs TTS, imagem, documento||
|**Enviar e-mail**|Template com variáveis dinâmicas via Resend||
|**Adicionar/remover tag**|Etiquetar ou desetiquetar o contato automaticamente||
|**Mover deal de stage**|Avançar ou regredir o deal no pipeline||
|**Atribuir responsável**|Rotear o contato/deal para um vendedor específico||
|**Criar tarefa/lembrete**|Gerar uma atividade no deal com prazo||
|**Notificar vendedor (in-app)**|Alerta interno para o responsável agir||
|**Chamar webhook externo**|Integração com Jimmy Studio ou sistemas externos||
|**Atualizar campo do contato**|Alterar qualquer campo (score, status, campo custom)||
|**ESPERA**|||
|**Aguardar X dias/horas**|Pausa configurável antes do próximo bloco||
|**Aguardar condição**|Espera até o contato abrir e-mail, responder, mudar de stage, etc.||

**4.3 Clusterização de Perfil de Cliente**

Segmentação dinâmica que determina qual fluxo o contato segue. Baseada em combinação de atributos:  **★ NOVO v3.0**

·    ICP Score A/B/C/D: determinado pelo lead scoring com IA (critérios configurados pelo admin)

·    Segmento e subnicho: mercado vertical do cliente (ex: 'SaaS B2B', 'Varejo', 'Serviços Profissionais')

·    Fase da jornada: novo lead / em negociação / cliente ativo / em risco de churn / churned

·    Comportamento: respondeu WhatsApp, abriu e-mail, agendou reunião, visitou proposta

·    Produto/plano: qual solução está avaliando ou já possui

·    Clusters são usados tanto no Flow Builder quanto no roteamento de leads para vendedores

·    Admin pode criar clusters customizados combinando qualquer combinação de atributos

**4.4 Integração com Jimmy Studio (Landing Pages)**

·    Jimmy Studio envia lead via webhook POST /api/v1/leads com payload padrão do JimmyAtende

·    Lead cai automaticamente no CRM com source='jimmy_studio' + UTMs preservados

·    Fluxo de boas-vindas configurado no Flow Builder é acionado imediatamente

·    Campos da landing page mapeáveis para campos customizados do contato no CRM

·    CRUD de webhooks de entrada nas configurações de Leads (nome, URL de destino, token, mapeamento de campos)

  

**5. Módulo de Contatos**

**5.1 Ficha Completa do Contato**

|   |   |
|---|---|
|**Categoria**|**Campos**|
|**Dados Pessoais**|Nome, CPF/CNPJ, e-mail, telefone, WhatsApp, cargo, empresa vinculada|
|**Endereço**|CEP (auto via ViaCEP), logradouro, número, complemento, bairro, cidade, estado|
|**Origem e Canal**|Fonte do lead (configurável), campanha, UTMs, data de entrada, indicado por, canal de origem (inbound orgânico / inbound pago / outbound BDR / indicação / evento / parceria / Jimmy Studio)|
|**Status**|lead / prospect / cliente / churned / bloqueado|
|**ICP Score e Cluster**|Score 0–100, tier A/B/C/D, cluster de perfil, justificativa da IA, data do cálculo|
|**Qualificação SDR**|Passou / Não passou na qualificação SDR + justificativa obrigatória quando não passa|
|**Segmento e Subnicho**|Mercado vertical e subnicho (ex: 'SaaS B2B / Vertical de RH'). Permite análise de win rate por segmento|
|**Cargo do Decisor**|Quem assina, quem influencia, quem bloqueia — campo crítico para condução do deal|
|**Número de Decisores**|Quanto maior, maior a complexidade e o ciclo esperado do deal|
|**Produtos/Contratos**|Produto(s), valor, recorrência, data início/fim, método de pagamento, status do contrato|
|**Health Score**|Indicador de saúde do cliente: Saudável / Em risco / Crítico — atualizado por NPS, engajamento e atividade|
|**Upsell/Cross-sell**|Oportunidades de expansão mapeadas na conta (campo texto + valor estimado)|
|**Tags**|Multi-select coloridas, criação inline|
|**Atribuição**|Vendedor responsável, time responsável|
|**Campos Customizados**|Criados pelo admin: texto, número, data, select, multi-select, URL, e-mail|

**5.2 Enriquecimento via CNPJ — Receita Federal**

·    Consulta automática ao informar CNPJ: razão social, nome fantasia, endereço, telefone, e-mail, CNAE, porte, situação, data de abertura

·    Botão 'Enriquecer via CNPJ' na ficha do contato e da empresa

·    Campos importados com badge 'Receita Federal' indicando a origem

·    Log de enriquecimento na timeline com data/hora e campos alterados

**5.3 Qualificação SDR e Roteamento Meritocrático**

Sistema que garante que os melhores leads chegam aos Closers com maior taxa de conversão.  **★ NOVO v3.0**

·    SDR preenche: passou/não passou nos critérios de qualificação + justificativa obrigatória quando não passa

·    ICP Score calculado pela IA com base nos critérios configurados pelo admin

·    Roteamento automático por meritocracia: leads ICP A → Closer com maior win rate nos últimos 30 dias

·    Roteamento configurável pelo admin: meritocrático / round-robin ponderado / manual / por segmento

·    Regras de roteamento: 'Leads do segmento SaaS → sempre para João (maior win rate nesse segmento)'

·    Histórico de roteamento por deal: quem recebeu o lead e por qual critério

**5.4 Timeline 360° do Contato**

Linha do tempo cronológica com todos os eventos do cliente:

·    Mensagens do WhatsApp — preview clicável abre conversa completa

·    Fluxos do Flow Builder — em qual fluxo está, nó atual, histórico de mensagens enviadas pelo fluxo

·    Reuniões e agendamentos — status, participantes, link, duração

·    Transcrições Fireflies (Fase 2) — sumário com IA + link

·    Movimentações no pipeline — quem moveu, de onde para onde, quando

·    Forecast registrado — histórico de camadas de forecast (Commit/Best Case/Pipeline)

·    Produtos e contratos — contratação, renovação, cancelamento

·    Notas — texto livre com autor, menção @usuário

·    Anexos — documentos, imagens (preview inline até 50MB)

·    Lembretes — criados, notificados, concluídos ou expirados

·    Resultados de NPS/CSAT — nota, comentário, canal

·    E-mails das sequências — assunto, abertura, clique

·    Enriquecimentos CNPJ — campos atualizados e data

·    Qualificação SDR — resultado e justificativa

**5.5 Dados de Pós-Venda e Expansão**

Campos que transformam CS em revenue driver, não só em suporte.  **★ NOVO v3.0**

·    Health Score: Saudável / Em Risco / Crítico — calculado por NPS, engajamento, atividade, tempo sem resposta

·    Alerta automático 60 dias antes da renovação do contrato (in-app + e-mail + Flow Builder)

·    Upsell e cross-sell mapeados: quais oportunidades de expansão existem na conta (campo + valor estimado)

·    Motivo de churn obrigatório ao marcar cliente como churned (mesmo rigor do motivo de perda no funil)

·    Histórico de cohort: quando entrou, quanto pagou, quando renovou, quando cancelou

  

**6. Módulo de Empresas**

Gestão de contas para vendas B2B, vinculando múltiplos contatos a uma organização.

·    Campos: nome, CNPJ, domínio, indústria, porte, telefone, e-mail, website, endereço, notas

·    Botão 'Enriquecer via CNPJ' — preenche todos os campos automaticamente

·    Lista de contatos vinculados, deals ativos, histórico de negociações, receita total da conta

·    Segmento e subnicho: campo da empresa propagado automaticamente para os contatos vinculados

·    CRUD com paginação (20/pág), busca por nome, CNPJ, domínio, indústria

  

**7. Módulo de Pipeline — Gestão Comercial de Alta Performance**

**7.1 Board Kanban**

·    Drag-and-drop com múltiplos pipelines por workspace

·    Pipeline padrão: Novos Leads → Qualificação SDR → Oportunidade → Proposta → Fechamento → Ganho → Perdido

·    Métricas por coluna: quantidade de deals, valor total, tempo médio de permanência na fase

·    Filtros: responsável, tags, valor, data, source, ICP Score, segmento, camada de forecast

**7.2 Flags Visuais no Kanban**

Indicadores visuais obrigatórios que o gestor vê sem abrir o deal:  **★ NOVO v3.0**

·    🔴 Sem próximo passo agendado — deal em limbo, requer ação imediata

·    🟠 Deal parado além do ciclo médio histórico da fase — flag de atraso automático

·    🟡 Data prevista de fechamento vencida ou além do ciclo médio — precisa de revisão

·    🔵 Camada Commit — deal com compromisso do Closer para fechar no mês

·    ⚪ Best Case — deal com potencial mas sem certeza

·    Badge de ICP Score (A/B/C/D) e health score visível no card

**7.3 Deal Drawer — Campos de Alta Performance**

Painel lateral do deal com todos os campos necessários para gestão comercial séria.  **★ NOVO v3.0**

**Dados Básicos do Deal**

·    Título, valor do ticket, produto/plano vinculado

·    Recorrência: mensal / anual / único (define o LTV projetado)

·    MRR ou ARR projetado: calculado automaticamente com base no ticket e na recorrência

·    Desconto aplicado: percentual + motivo obrigatório. Desconto sem motivo = campo bloqueado

·    Responsável (Closer), time, data de criação, data do primeiro contato

**Forecast e Probabilidade**

·    Camada de Forecast: Commit / Best Case / Pipeline — preenchido pelo Closer

·    Probabilidade de fechamento: calculada automaticamente por fase (histórico do workspace) + ajuste manual com justificativa obrigatória

·    Data prevista de fechamento: baseada no ciclo médio histórico + ajuste manual

·    Flag automático quando a data prevista ultrapassa o ciclo médio da fase

·    Validação pelo gestor no Pipeline Review: campo 'Gestor validou: Sim/Não + comentário'

**Próximo Passo — Campo Obrigatório**

·    O quê: descrição específica do próximo passo ('Reunião com CFO para ROI' — não 'Follow-up')

·    Quem: responsável pelo próximo passo (pode ser diferente do dono do deal)

·    Quando: data e hora obrigatórias — deal sem data é deal morto

·    Status: Pendente / Concluído / Atrasado (flag automático se data passou sem conclusão)

**Velocity e Atividade**

·    Número de touchpoints: contador automático de todas as interações (WhatsApp, e-mail, reunião, ligação)

·    Canal de comunicação predominante: qual canal está sendo mais usado nesse deal

·    Tempo total de ciclo: dias desde o primeiro contato + comparativo com ciclo médio do time

·    Objeções mapeadas: lista ou texto livre das objeções levantadas e como foram tratadas

·    Gravação/resumo da última reunião: campo texto com pontos principais, objeções e compromissos assumidos

**Atividades do Deal**

·    Timeline de atividades: notas, ligações, e-mails, reuniões, tarefas — CRUD completo

·    Preview das últimas mensagens WhatsApp com link para o chat completo

·    Fluxo ativo no Flow Builder: qual fluxo está rodando, nó atual, próximo envio

**Qualificação**

·    ICP Score e cluster do contato (somente leitura no deal drawer, editável na ficha do contato)

·    Número de decisores mapeados: campo numérico com impacto direto na estimativa de ciclo

·    Motivo de perda obrigatório ao perder o deal: Preço / Concorrente / Sem budget / Sem urgência / Fit ruim / Processo travou / Decisor não encontrado / Outros

**7.4 Pipeline Review — Visão do Gestor**

Tela dedicada para o gestor conduzir o Pipeline Review semanal.  **★ NOVO v3.0**

·    Visão tabular de todos os deals com campos: camada de forecast, próximo passo, data prevista, valor, dias na fase

·    Filtros por: vendedor, camada de forecast, ICP Score, stage, dias parado

·    Ordenação por: valor, data de fechamento, dias sem atividade, probabilidade

·    Campos editáveis inline: o gestor pode ajustar forecast, próximo passo e comentários sem abrir o deal drawer

·    Exportação do Pipeline Review em CSV ou PDF para reuniões de diretoria

**7.5 Automações no Pipeline**

·    Stages com is_ai_managed: IA move o deal ao detectar critério configurado

·    Auto-criação de deal ao receber novo contato via WhatsApp, API ou Jimmy Studio

·    Início automático de fluxo do Flow Builder ao entrar em determinado stage

·    Alerta de deal parado há X dias sem atividade (configurável por stage)

·    Sugestão de próxima ação pela IA baseada no histórico e no ICP Score do lead

  

**8. Módulo de Chat — WhatsApp**

**8.1 Estrutura de Tela (3 Painéis)**

·    Esquerdo: lista de conversas com busca, filtros, não lidas, ICP Score visível, tags, avatar

·    Central: janela de chat com histórico completo, input e controles de atendimento

·    Direito: perfil do contato com dados, ICP Score, health score, NPS/CSAT, fluxo ativo, notas rápidas

**8.2 Funcionalidades do Chat**

·    Mensagens: texto, áudio (player inline), imagem, documento, localização, sticker

·    Input: emoji picker, gravação de áudio (MediaRecorder + Storage), anexo de arquivo

·    Toggle: Agente IA / Atendimento Humano / Pausado

·    Atribuição de conversa com notificação ao responsável

·    Nova conversa manual: contato + número de origem

·    Busca dentro da conversa, scroll infinito, indicador de digitando...

·    Indicador de qual fluxo do Flow Builder está ativo para o contato ('Flow: Boas-vindas SaaS — Nó 3 de 7')

**8.3 Agente de IA por Número**

·    Cada número WhatsApp tem agente independente com provider+modelo próprios (ver seção 3)

·    Comportamento: sempre ativo / fora do horário comercial / quando vendedor offline / nunca

·    Horários comerciais por dia e fuso, delay 0–60s, temperatura e max_tokens configuráveis

·    Tool calling: agendamento de reuniões, atualização de campos do contato, início de fluxo no Flow Builder

·    Transferência automática: palavra-chave, solicitação explícita, horário, ICP Score

**8.4 Copiloto de Vendas**

·    Botão Sparkles analisa conversa + perfil do contato; usa provider+modelo do perfil de copiloto

·    Sugestão alinhada ao framework (SPIN, BANT, MEDDIC) e às objeções já mapeadas no deal

·    Sugestão inserida no textarea para revisão — vendedor decide se envia

·    Base de conhecimento do copiloto: PDF/MD/TXT importáveis, vetorizados

**8.5 Providers WhatsApp**

|   |   |
|---|---|
|**Provider**|**Configuração**|
|**Z-API**|API key + Instance ID + Token. Webhooks configuráveis.|
|**Evolution API**|URL + API Key. Self-hosted ou cloud. QR Code.|
|**API Oficial Meta**|Token permanente + Phone Number ID + WABA ID. Verificação de negócio necessária.|

**8.6 Pesquisas de Satisfação — NPS e CSAT**

·    Envio automático pós-encerramento via WhatsApp e/ou e-mail (configurável)

·    Trigger: ao encerrar / X horas após / manual

·    IA categoriza respostas abertas; alertas para NPS ≤ 6 ou CSAT ≤ 2 ao responsável

·    Health Score do contato atualizado automaticamente com base na resposta

·    Histórico de NPS/CSAT na timeline e no deal drawer

  

**9. Sequências de E-mail (dentro do Flow Builder)**

As sequências de e-mail da v2.0 foram absorvidas e expandidas pelo Flow Builder (seção 4). O Flow Builder é o ponto único de criação de automações de comunicação — qualquer sequência de e-mail é criada como um fluxo com blocos de ação de e-mail.

·    Templates de e-mail com editor rich text, variáveis dinâmicas e preview desktop/mobile

·    Variáveis: {{nome}}, {{empresa}}, {{vendedor}}, {{produto}}, {{link_agendamento}}, {{icp_score}}, qualquer campo customizado

·    Domínio de envio customizado com configuração guiada de SPF/DKIM

·    Métricas: abertura, cliques, respostas, opt-outs — disponíveis no log do fluxo e no Analytics

·    Gestão de opt-outs: lista de descadastro por workspace, respeitada em todos os fluxos

·    A/B testing de assuntos planejado para Fase 2

  

**10. Módulo de Agendamentos e Calendário**

·    Calendário mensal/semanal/diário com visualização de eventos

·    CRUD: título, data, hora, duração, tipo, participantes, URL de reunião, contato/deal vinculado

·    Sincronização bidirecional: Google Calendar e Microsoft Outlook

·    Detecção de conflito antes de confirmar; convite por e-mail via Resend

·    Lembrete automático: e-mail 24h e 1h antes + nó no Flow Builder para follow-up pós-reunião

·    Agente de IA cria agendamentos via tool calling durante conversa no WhatsApp

·    Campo 'Resumo pós-reunião': preenchido pelo vendedor após a reunião, alimenta a timeline do deal

·    Google Calendar: OAuth 2.0; Outlook: Azure App Registration

  

**11. Módulo de Roleplay de Vendas**

**11.1 Hub de Treinamentos (/roleplay)**

·    Tabs: Treinamentos, Atribuições, Processos Seletivos, Planos de Treinamento

·    Admin cria e atribui treinamentos a membros/times com prazo

**11.2 Configuração de Treinamento**

·    Nome, descrição, contexto da empresa, framework (SPIN, BANT, MEDDIC, Challenger, customizado)

·    Categorias de avaliação com pesos — alinhadas às objeções mais comuns do pipeline real

·    Cenários: persona (nome, cargo, empresa, personalidade, situação, resistência), dificuldade, tipos de objeção

·    Tipos de objeção alinhados com as objeções mapeadas no pipeline: Preço / Urgência / Concorrente / Autoridade / Necessidade

·    Provider + modelo de IA configurável por treinamento — avaliação pode usar modelo mais potente

·    Importação de cenários via documento (PDF/MD/TXT)

**11.3 Fluxo de Sessão**

·    RoleplayStart: seleciona cenário, lê briefing, escolhe modo (texto ou voz)

·    RoleplaySession: chat texto com IA simulando o cliente

·    RoleplayVoiceSession: ElevenLabs Conversational AI — vendedor fala, IA responde em voz

·    RoleplayFeedback: scores por categoria, pontos fortes, áreas de melhoria, transcript, comparativo histórico

·    Resultado do roleplay alimenta a aderência ao playbook e o score de performance individual

**11.4 Processos Seletivos e Planos de Treinamento**

·    Página pública /selecao/:slug — candidato faz roleplay sem login, gestor recebe avaliação automática

·    Ranking de candidatos por score para facilitar seleção

·    Planos semanais gerados por IA com ajuste dinâmico por lacunas identificadas

  

**12. Módulo de Equipe**

·    Membros: nome, e-mail, role (admin/manager/SDR/Closer/CS), status, time, função, peso de distribuição de leads

·    Meta mensal individual: valor de fechamento, número de deals, touchpoints — usado no MTD Tracking

·    OTE (On-Target Earnings): salário base + comissão esperada — usado no cálculo de ROAS individual

·    Convidar usuário via edge function admin-create-user; reset de senha via admin-reset-password

·    CRUD de times (SDR, Closer, CS) e funções

·    Cada vendedor pode ter seu número WhatsApp com agente de IA próprio e fluxos atribuídos

·    Roteamento de leads: meritocrático / round-robin / manual / por segmento — configurável

·    Aderência ao playbook: % de deals com campos obrigatórios preenchidos por vendedor

  

**13. Relatórios, Analytics e Gestão Comercial**

**13.1 Dashboard Principal (/dashboard)**

KPIs com filtro de período (Hoje / 7d / 30d / Personalizado) com comparativo ao período anterior:

·    Atendimentos, Conversões, Tempo Médio de Resposta (IA e humano), Novos Leads

·    Taxa de Autonomia da IA, NPS Score médio, CSAT médio

·    Gráficos: chats vs. conversões por dia, tendência de novos leads, touchpoints por canal

**13.2 Forecast Gerencial**

Visão consolidada das camadas de forecast para o gestor tomar decisão sobre o mês.  **★ NOVO v3.0**

·    Tabela de forecast: Commit total / Best Case total / Pipeline total — por vendedor e por time

·    Probabilidade ponderada: valor de cada deal × probabilidade da fase = receita esperada

·    Comparativo com meta do mês: quanto falta para fechar, ritmo atual vs. necessário

·    Deals Commit destacados: lista dos deals que o Closer se comprometeu a fechar no mês

·    Histórico de forecast: como o forecast evoluiu semana a semana (previsão de acurácia do time)

**13.3 MTD Tracking — Ritmo vs. Meta**

Painel de acompanhamento diário do ritmo de cada vendedor em relação à meta do mês.  **★ NOVO v3.0**

·    Barra de progresso por vendedor: % da meta atingida no MTD (Month-to-Date)

·    Pace indicator: se o vendedor continuar no ritmo atual, vai fechar X% da meta — flag se abaixo de 80%

·    Touchpoints do mês: ligações, mensagens, reuniões, propostas enviadas vs. meta de atividade

·    Deals ganhos no mês + valor total por vendedor

·    Alertas automáticos ao gestor quando vendedor está abaixo do pace em D+10, D+15 e D+20 do mês

**13.4 Performance Individual — Dashboard do Vendedor**

Visão completa de performance para decisões de coaching, roteamento e remuneração.  **★ NOVO v3.0**

|   |   |
|---|---|
|**Métrica**|**O que revela**|
|**Win Rate por Fase**|% de deals ganhos por etapa do funil — revela onde cada vendedor perde e em que tipo de conversa precisa de coaching|
|**Win Rate por Segmento**|% de conversão por vertical/subnicho — base para o roteamento meritocrático inteligente|
|**Ciclo Médio Individual**|Dias desde primeiro contato até fechamento — compara com benchmark do time; acima da média = flag|
|**Ticket Médio Individual**|Valor médio dos deals fechados — Closer com ticket abaixo da média pode estar evitando conversa de valor|
|**ROAS Individual**|Receita gerada ÷ custo total (OTE + ferramentas + alocação de gestão) — alinha comissionamento à margem real|
|**Aderência ao Playbook**|% de deals com todos os campos obrigatórios preenchidos — 100% = processo seguido; abaixo disso = onde está quebrando|
|**Score de Roleplay**|Média dos últimos 3 roleplays — indica prontidão técnica para lidar com objeções|
|**Touchpoints por Deal**|Média de interações até fechamento — muitos touchpoints sem avanço indica problema de condução|

**13.5 9-Box de Performance da Equipe**

Matriz 3×3 de posicionamento do time: eixo X = resultado (deals fechados/meta) × eixo Y = competência (win rate + aderência ao playbook + score roleplay).  **★ NOVO v3.0**

·    Quadrante superior direito: Top performers — candidatos a Closer sênior e mentores do time

·    Quadrante superior esquerdo: Alta competência, baixo resultado — problema de leads, roteamento ou momento

·    Quadrante inferior direito: Alto resultado, baixa competência — resultados por volume, risco de escalar mal

·    Quadrante inferior esquerdo: Atenção imediata — plano de desenvolvimento ou desligamento

·    Admin configura os thresholds de cada eixo (ex: 'resultado alto = acima de 80% da meta')

·    Snapshot mensal salvo para acompanhar a evolução individual ao longo do tempo

**13.6 Analytics Avançado (/analytics)**

·    Pipeline: deals total, ganhos, perdidos, valor em aberto, conversão por stage

·    Funil de conversão visual: Leads → Qualificados (SDR) → Oportunidades → Propostas → Ganhos

·    Análise por segmento e subnicho: win rate, ciclo médio e ticket médio por vertical

·    Análise por canal de origem: CAC estimado por canal, deals ganhos por fonte

·    Performance do Flow Builder: contatos em cada fluxo, taxas de abertura/clique/resposta por nó

·    NPS/CSAT: evolução, distribuição, temas recorrentes nas respostas abertas

·    Motivos de perda: ranking dos motivos + evolução ao longo do tempo

·    Motivos de churn: mesma visão para expansão/retenção

**13.7 Relatórios com IA e Análise Preditiva (Fase 2)**

·    Previsão de churn: clientes com alto risco baseado em engajamento, NPS, atividade, health score

·    Oportunidades de upsell: contatos com perfil favorável para upgrade/expansão

·    LTV (Lifetime Value): cálculo do valor esperado ao longo do tempo com base em histórico de cohort

·    Insights de deals perdidos: IA identifica padrões e sugere ajustes de processo/pitch/pricing

·    Relatório executivo semanal automático por e-mail (opt-in pelo admin)

  

**14. CPQ — Cotações e Propostas Comerciais (Fase 2)**

Módulo de geração de propostas vinculado ao deal, planejado para Fase 2.

·    Gerador de cotação com produtos do CRM, preços e descontos aplicados automaticamente do deal

·    Templates com logo, cores e identidade do workspace — PDF gerado automaticamente

·    Link de aceite enviado por e-mail ou WhatsApp — aceite registrado no deal + gatilho no Flow Builder

·    Assinatura eletrônica via Clicksign ou Docusign (a definir)

·    Histórico de versões de proposta com comparativo de valores e descontos

·    Notificação ao vendedor quando proposta é visualizada ou aceita

  

**15. Módulo de Configurações**

**15.1 Configuração de IA (ver seção 3)**

·    Nível org: API keys + providers habilitados

·    Por agente: provider + modelo + temperatura + max_tokens

·    Por copiloto: provider + modelo + framework + base de conhecimento

·    Por função: lead scoring, avaliação roleplay, flow builder, relatórios

**15.2 Flow Builder**

·    Biblioteca de fluxos: CRUD de todos os fluxos do workspace com status (ativo/pausado/rascunho)

·    Templates de fluxo: boas-vindas, nurturing, renovação, recuperação de churn, pós-venda

·    Gestão de opt-outs: lista de descadastro por workspace para WhatsApp e e-mail

·    Log de execução por fluxo: contatos em cada nó, métricas de engajamento, erros de envio

**15.3 WhatsApp**

·    CRUD de números com provider selecionável (Z-API / Evolution / API Oficial)

·    Teste de conexão, atribuição a agente de IA e a vendedor

**15.4 E-mail (Resend)**

·    API key, domínio customizado com configuração guiada de SPF/DKIM

·    Templates globais: onboarding, reunião, NPS/CSAT, relatório semanal

·    Assinatura de e-mail por vendedor; gestão de opt-outs

**15.5 Pesquisas (NPS/CSAT)**

·    Tipo padrão, canal, trigger de envio, template customizável

·    Alertas para respostas negativas: canal e responsável configuráveis

**15.6 Integrações**

·    Google Calendar: OAuth 2.0 com Client ID + Secret configurados pelo admin

·    Microsoft Outlook: Azure App Registration com Client ID + Tenant ID + Secret

·    ElevenLabs: API key, Voice ID, Agent ID para roleplay e agentes de voz

·    Fireflies (Fase 2): API key para transcrições de reuniões

**15.7 API Pública (Intake de Leads + Webhooks de Entrada)**

·    POST /api/v1/leads com Bearer Token e rate limit (padrão: 100 req/min) — integração com Jimmy Studio

·    Payload: nome, telefone, e-mail, source, UTMs, campos customizados

·    Resposta: lead_id, contact_id, deal_id + fluxo iniciado automaticamente

·    CRUD de webhooks de entrada: nome, URL, token, mapeamento de campos — para Jimmy Studio e outros sistemas

·    Webhooks de saída: notifica sistemas externos em eventos de deal, contato, etc.

·    CRUD de tokens com permissões granulares; log de requisições

**15.8 Leads e Qualificação**

·    Fontes de lead (lead_sources): nome, tipo, configuração de webhook de entrada

·    Critérios de qualificação SDR: quais perguntas o SDR deve responder para qualificar um lead

·    Critérios de ICP Score com pesos: configurados pelo admin, usados pelo lead scorer

·    Regras de roteamento: meritocrático / round-robin / manual / por segmento

**15.9 Metas e OTE**

·    Admin configura metas mensais por vendedor: valor de fechamento, número de deals, touchpoints

·    OTE por vendedor: salário base + comissão esperada — usado no cálculo de ROAS individual

·    Período de apuração: mensal (padrão), podendo ser semanal

**15.10 Branding e Campos Customizados**

·    Logo, favicon, nome, cores customizáveis (HSL em tempo real)

·    Campos customizados para Contatos, Empresas e Deals: texto, número, data, select, multi-select, URL, e-mail

  

**16. Painel Superadmin**

**16.1 Gestão de Workspaces**

·    Lista com métricas: membros, contatos, deals, mensagens, plano, providers de IA em uso, fluxos ativos

·    CRUD: ativar/desativar, editar plano, estender trial, editar dados

·    Impersonação com audit log completo

**16.2 Planos Sugeridos — Ativação Manual via AppMax**

|   |   |   |
|---|---|---|
|**Plano**|**Limites e Recursos**|**Preço Sugerido**|
|**Starter**|Até 3 usuários, 1 número WhatsApp, 1 pipeline, 3 fluxos no Flow Builder, sem roleplay de voz, 1 provider de IA|R$ 197/mês|
|**Pro**|Até 10 usuários, 3 números, 3 pipelines, fluxos ilimitados, roleplay completo, NPS/CSAT, MTD + 9-Box, 3 providers de IA|R$ 497/mês|
|**Business**|Usuários ilimitados, números ilimitados, todos os recursos MVP, API pública, campos customizados, CPQ (Fase 2)|R$ 997/mês|
|**Enterprise**|Tudo do Business + onboarding dedicado, customizações, SLA, contrato anual|Sob consulta|

**16.3 Métricas Globais e Audit Log**

·    Workspaces ativos, trial, cancelados; MRR estimado por plano

·    Uso de IA por workspace: tokens consumidos por provider e modelo

·    NPS médio por workspace (saúde do cliente) e workspaces com baixo engajamento

·    Audit log: filtros por workspace, usuário, ação, período; exportação para compliance

  

**17. Modelagem de Banco de Dados (Principais Tabelas)**

|   |   |
|---|---|
|**Tabela**|**Campos Principais**|
|**workspaces**|id, name, slug, plan, trial_ends_at, status, settings_json|
|**workspace_members**|id, workspace_id, user_id, role, status|
|**profiles**|id, workspace_id, full_name, avatar_url, phone, monthly_target_value, monthly_target_deals, ote_base, ote_commission|
|**ai_providers_config**|id, workspace_id, provider (claude/openai/gemini), api_key_encrypted, enabled|
|**contacts**|id, workspace_id, name, email, phone, whatsapp, cnpj, status, company_id, lead_score, lead_tier, cluster, assigned_to, source_id, sdr_qualified, sdr_qualification_notes, segment, subsegment, decision_maker_role, decision_makers_count, enriched_at, health_score, custom_fields_json|
|**contact_enrichments**|id, contact_id, source (receita_federal/linkedin), fields_json, enriched_at|
|**companies**|id, workspace_id, name, cnpj, domain, industry, size, phone, email, segment, enriched_at|
|**contact_products**|id, contact_id, product_id, value, recurrence (monthly/annual/one_time), start_date, end_date, payment_method, contract_status|
|**contact_notes**|id, contact_id, workspace_id, author_id, content, type, file_url|
|**contact_reminders**|id, contact_id, workspace_id, created_by, due_at, channels_json, completed_at|
|**pipelines**|id, workspace_id, name, is_default|
|**pipeline_stages**|id, pipeline_id, name, color, position, is_ai_managed, ai_trigger_criteria, flow_id, avg_cycle_days|
|**deals**|id, workspace_id, pipeline_id, stage_id, contact_id, assigned_to, title, value, product_id, recurrence, mrr_arr_projected, discount_pct, discount_reason, priority, expected_close_date, forecast_layer (commit/best_case/pipeline), close_probability, close_probability_override, close_probability_override_reason, manager_validated, lost_reason, decision_makers_count, touchpoints_count, first_contact_date, last_activity_date, next_step_what, next_step_who, next_step_when, next_step_status, last_meeting_summary, objections_json|
|**deal_activities**|id, deal_id, workspace_id, author_id, type (note/call/email/meeting/task/whatsapp), content, channel, due_at, completed_at|
|**conversations**|id, workspace_id, contact_id, whatsapp_number_id, status, assigned_to|
|**messages**|id, conversation_id, direction, type, content, media_url, sender_type, sent_at|
|**whatsapp_numbers**|id, workspace_id, number, provider, config_json, agent_id, status|
|**ai_agents**|id, workspace_id, whatsapp_number_id, name, provider, model, temperature, max_tokens, system_prompt, mode, business_hours_json|
|**flows**|id, workspace_id, name, status (active/paused/draft), trigger_type, trigger_config_json, version|
|**flow_nodes**|id, flow_id, node_type (trigger/condition/action/wait), config_json, position_x, position_y, next_node_id, next_node_id_false|
|**flow_enrollments**|id, flow_id, contact_id, deal_id, status, current_node_id, enrolled_at, completed_at, exited_reason|
|**flow_execution_log**|id, flow_id, enrollment_id, node_id, executed_at, result_json|
|**email_templates**|id, workspace_id, name, subject, body_html, variables_json|
|**nps_csat_surveys**|id, workspace_id, conversation_id, contact_id, type, score, comment, sent_at, responded_at, channel|
|**appointments**|id, workspace_id, contact_id, deal_id, title, type, start_at, end_at, attendees_json, meeting_url, summary, source, calendar_event_id|
|**knowledge_entries**|id, workspace_id, category, title, content, priority, embedding|
|**copilot_profiles**|id, workspace_id, name, provider, model, temperature, system_prompt|
|**lead_scoring_config**|id, workspace_id, criteria_json, behavioral_weights_json|
|**routing_rules**|id, workspace_id, rule_type (merit/round_robin/manual/segment), config_json, priority|
|**performance_snapshots**|id, workspace_id, user_id, period_month, win_rate, win_rate_by_stage_json, avg_cycle_days, avg_ticket, roas, playbook_adherence, roleplay_score, deals_won, revenue_won|
|**forecast_history**|id, workspace_id, user_id, period_month, week, commit_value, best_case_value, pipeline_value, closed_value|
|**roleplay_trainings**|id, workspace_id, name, description, framework, provider, model, evaluation_categories_json|
|**roleplay_sessions**|id, workspace_id, user_id, scenario_id, mode, status, transcript_json, scores_json, feedback_text|
|**api_tokens**|id, workspace_id, name, token_hash, permissions_json, rate_limit, last_used_at|
|**inbound_webhooks**|id, workspace_id, name, token_hash, source_name, field_mapping_json, flow_id|
|**notifications**|id, workspace_id, user_id, type, title, body, read_at, action_url|
|**audit_logs**|id, workspace_id, user_id, action, resource_type, resource_id, metadata_json, is_impersonated, created_at|
|**products**|id, workspace_id, name, description, price, recurrence, category|
|**lead_sources**|id, workspace_id, name, type, config_json|

  

**18. Edge Functions (Supabase)**

|   |   |
|---|---|
|**Edge Function**|**Responsabilidade**|
|**initialize-workspace**|Cria workspace, roles, pipeline padrão, tags, agente, flow padrão e configs ao signup|
|**whatsapp-webhook**|Recebe mensagens de todos os providers, normaliza e processa|
|**ai-orchestrator**|Usa provider+modelo do agente configurado; executa tool calls; dispara gatilhos no Flow Builder|
|**copilot-suggest**|Usa provider+modelo do copiloto; analisa conversa + objeções mapeadas; retorna sugestão|
|**flow-engine**|Processa enrollments ativos: avalia condições, executa ações, avança nós, agenda esperas|
|**flow-action-executor**|Executa ações individuais de um nó: envia WhatsApp, e-mail, atualiza campo, cria tarefa, chama webhook|
|**lead-intake**|Endpoint público com Bearer Token e rate limiting; inicia flow automaticamente; suporta webhooks de entrada do Jimmy Studio|
|**lead-scorer**|Recalcula ICP Score + tier + cluster; atualiza contato; pode disparar gatilho no Flow Builder|
|**cnpj-enrichment**|Consulta API Receita Federal; preenche contato/empresa; registra na timeline|
|**calendar-sync**|Sincroniza agendamentos com Google Calendar e Outlook|
|**send-email**|Wrapper Resend para e-mails transacionais e templates|
|**nps-csat-send**|Envia pesquisa via WhatsApp ou e-mail ao encerrar conversa|
|**nps-csat-webhook**|Recebe resposta; atualiza health score; alerta se negativo; dispara flow de recuperação se configurado|
|**deal-monitor**|Cron job: detecta deals sem próximo passo, além do ciclo médio, ou no forecast Commit próximo ao fechamento — gera alertas|
|**performance-calculator**|Cron mensal: calcula win rate, ciclo médio, ROAS, ticket médio, aderência ao playbook por vendedor; salva em performance_snapshots|
|**forecast-aggregator**|Agrega camadas de forecast por vendedor/time/workspace; calcula receita esperada ponderada|
|**mtd-tracker**|Cron diário: calcula pace de cada vendedor vs. meta; envia alertas ao gestor em D+10, D+15, D+20|
|**routing-engine**|Aplica regras de roteamento ao receber novo lead: meritocrático, round-robin ou por segmento|
|**roleplay-chat**|Simula cliente no roleplay texto com persona e objeções|
|**roleplay-voice-token**|Gera token temporário para ElevenLabs Conversational AI|
|**roleplay-evaluate**|Avalia sessão com scores e feedback; atualiza score de performance do vendedor|
|**preparation-audio**|Gera áudio preparatório via ElevenLabs TTS|
|**preparation-quiz**|Gera e avalia quiz de preparação com IA|
|**analytics-report**|Gera relatórios consolidados com insights de IA|
|**admin-create-user**|Cria usuário no Supabase Auth e vincula ao workspace|
|**admin-reset-password**|Envia e-mail de reset de senha|
|**generate-prompt**|Gera system prompt de agente baseado na descrição do produto/empresa|
|**knowledge-import**|Processa e vetoriza documentos PDF/MD/TXT|

  

**19. Roadmap de Desenvolvimento**

|   |   |   |
|---|---|---|
|**Fase**|**Prazo**|**Escopo**|
|**MVP — Fase 1**|4–5 meses|Auth + Onboarding completo · Multi-tenant + Roles · Contatos + Empresas + CNPJ Enrichment · Pipeline Kanban com campos de alta performance (forecast, próximo passo obrigatório, velocity) · Forecast em camadas (Commit/Best Case/Pipeline) · Roteamento meritocrático · Flow Builder visual completo (WhatsApp + E-mail + clusters) · Chat WhatsApp (3 providers) + Agente IA por número com provider+modelo individual · Copiloto com provider+modelo próprio · Base de conhecimento · Agendamentos (Google Calendar + Outlook) · NPS/CSAT automático + health score · Roleplay (texto + voz ElevenLabs) · Equipe + Roteamento + Metas/OTE · Lead Scoring híbrido + Qualificação SDR · MTD Tracking + 9-Box + ROAS + Win Rate por fase · Forecast Gerencial + Pipeline Review · API pública + Webhook de entrada (integração Jimmy Studio) · Dashboard + Analytics com segmento/canal · Superadmin + Impersonação · Planos + AppMax (ativação manual)|
|**Fase 2**|2–3 meses após MVP|CPQ — Cotações e Propostas · Análise preditiva churn e LTV · Enriquecimento LinkedIn/redes sociais · Fireflies (transcrições) · A/B testing de fluxos no Flow Builder · Resumo executivo semanal automático · Campos customizados · Processos seletivos (roleplay público) · Planos de treinamento por IA · Webhooks de saída · Mobile PWA · Slack + Zapier|
|**Fase 3**|A definir|App mobile nativo · Campanhas WhatsApp broadcast · Portal do cliente self-service · Marketplace de templates de flow e agente · Multi-idioma (EN/ES)|

  

**20. Segurança, Compliance e LGPD**

·    API keys criptografadas no Supabase Vault — nunca expostas no frontend

·    RLS em todas as tabelas — nenhuma query retorna dados de outro workspace

·    Rate limiting na API pública com respostas 429 padronizadas

·    Audit logs com retenção de 90 dias; backup diário com retenção de 30 dias

·    Soft delete em contatos e deals (deleted_at) — sem perda acidental de dados

·    Validação de webhooks WhatsApp por assinatura HMAC; tokens de API hasheados (SHA-256)

·    LGPD: exportação e deleção de todos os dados de um contato (direito ao esquecimento)

·    Opt-out de WhatsApp e e-mail: lista de descadastro por workspace, respeitada em todos os fluxos

·    Dados de NPS/CSAT não compartilhados com providers de IA sem consentimento

·    Dados de desempenho individual (ROAS, win rate) visíveis apenas para manager e admin — não para peers

**21. Perguntas em Aberto**

·    Limites por plano: número de fluxos ativos no Flow Builder, contatos em fluxos simultâneos, touchpoints/mês

·    Fluxo de checkout AppMax: landing page própria? Self-service futuro?

·    SLA de suporte por plano: chat? E-mail? WhatsApp? Tempo de resposta garantido?

·    CPQ: Clicksign ou Docusign para assinatura eletrônica?

·    Migração de dados do Jimmy Conversas → JimmyAtende: estratégia e prioridade

·    Benchmark de ciclo médio: como inicializar o sistema sem dados históricos? (usar valores padrão por segmento?)

·    ROAS individual: o admin precisa configurar o OTE de cada vendedor — esse dado é sensível, quem pode ver?

Flow Builder: haverá limite de nós por fluxo no plano S