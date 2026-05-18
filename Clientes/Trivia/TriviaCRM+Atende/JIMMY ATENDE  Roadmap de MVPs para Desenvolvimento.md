# Filosofia de Entrega

O JimmyAtende será construído em 7 MVPs incrementais. Cada MVP produz uma plataforma funcional que você já pode usar no dia a dia. A lógica é simples: valor real desde o primeiro deploy, complexidade adicionada em camadas.

**Princípio central:** cada MVP só avança quando o anterior está estável e em uso. Isso evita retrabalho, valida hipóteses com uso real e gera feedback antes de investir nas features mais complexas.

# Visão Geral dos MVPs

|**MVP**|**Nome**|**Semanas**|**Acumulado**|**Valor Entregue**|
|---|---|---|---|---|
|0|Fundação|2|Sem 2|Auth + Multi-tenant + Navegação + Onboarding|
|1|CRM Core|3|Sem 5|Contatos + Empresas + Pipeline Kanban funcional|
|2|WhatsApp + IA|4|Sem 9|Chat WhatsApp + Agente IA + Copiloto básico|
|3|Gestão Comercial|3|Sem 12|Forecast + Próximo Passo + Equipe + Roteamento|
|4|Analytics & Dashboard|2|Sem 14|Dashboards + MTD + 9-Box + Performance|
|5|Flow Builder|4|Sem 18|Automação multicanal visual completa|
|6|Ecossistema Completo|3|Sem 21|Roleplay + NPS + Superadmin + API + Planos|

  

# MVP 0 — Fundação

|   |   |   |
|---|---|---|
|**Duração:** ~2 semanas|**Complexidade:** Baixa|**Risco:** Baixo|

**O que você já consegue usar:** Login, criar workspace, ver a navegação completa da plataforma, convidar usuários com roles diferentes. É o esqueleto que tudo vai plugar.

### Escopo Detalhado

•       **Auth completo:** Supabase Auth com email/senha + magic link. Tela de login, registro e recuperação de senha

•       **Criação de workspace:** Edge function initialize-workspace com pipeline padrão (6 stages), 8 tags padrão

•       **Multi-tenant com RLS:** Row Level Security em todas as tabelas. Nenhum dado vaza entre workspaces

•       **Hierarquia de roles:** superadmin, admin, manager, agent — com permissões distintas

•       **Shell da aplicação:** Layout dark-only, sidebar com navegação completa, tema customizável (branding por workspace)

•       **Página de configurações básica:** Branding (logo, cores), dados do workspace

### Tabelas Supabase

_workspaces, workspace_members, profiles, pipelines, pipeline_stages, tags_

### Critério de Done

•       Usuário cria conta, workspace é provisionado com pipeline padrão

•       Admin convida membros com roles diferentes

•       RLS impede acesso entre workspaces (testar com 2 workspaces)

•       Navegação entre todas as seções (páginas em branco OK para módulos futuros)

  

# MVP 1 — CRM Core

|   |   |   |
|---|---|---|
|**Duração:** ~3 semanas|**Complexidade:** Média|**Risco:** Baixo|

**O que você já consegue usar:** CRM funcional completo. Cadastrar contatos e empresas, enriquecer via CNPJ, gerenciar pipeline com Kanban drag-and-drop, abrir deal drawer com campos básicos. Já dá para operar vendas no dia a dia.

## 1A — Contatos e Empresas (~1.5 semana)

•       **CRUD de Contatos:** lista com paginação, busca, filtros (status, tags, responsável, source)

•       **Ficha do Contato:** dados pessoais, endereço (CEP via ViaCEP), origem/canal, status, tags, atribuição

•       **CRUD de Empresas:** nome, CNPJ, domínio, indústria, porte. Vínculo de contatos a empresas

•       **Enriquecimento CNPJ:** Edge function cnpj-enrichment consulta Receita Federal, preenche campos com badge de origem

•       **Timeline básica:** notas manuais + movimentações do pipeline (os demais eventos serão adicionados nos MVPs seguintes)

## 1B — Pipeline Kanban (~1.5 semana)

•       **Board Kanban:** drag-and-drop, múltiplos pipelines, métricas por coluna (qtd deals, valor total)

•       **Deal Drawer básico:** título, valor, produto, recorrência, responsável, data de criação, contato vinculado

•       **Motivo de perda:** campo obrigatório ao mover para “Perdido” (Preço / Concorrente / Sem budget / etc.)

•       **Filtros no Kanban:** responsável, tags, valor, data

•       **Auto-criação de deal:** ao criar contato com status “lead”, deal é criado automaticamente no primeiro stage

### Tabelas Supabase

_contacts, companies, contact_enrichments, contact_notes, contact_products, deals, deal_activities, products, lead_sources_

### Critério de Done

•       CRUD completo de contatos e empresas com busca e filtros

•       Enriquecimento via CNPJ funcional (Receita Federal)

•       Pipeline Kanban com drag-and-drop e métricas por coluna

•       Deal drawer abre com dados básicos + notas

  

# MVP 2 — WhatsApp + IA

|   |   |   |
|---|---|---|
|**Duração:** ~4 semanas|**Complexidade:** Alta|**Risco:** Médio (integ. WhatsApp)|

**O que você já consegue usar:** Atendimento real via WhatsApp com IA. Receber e responder mensagens, agente de IA atendendo 24/7, copiloto sugerindo respostas, base de conhecimento alimentando a IA. O CRM vira uma central de atendimento de verdade.

## 2A — Configuração de IA (~1 semana)

•       **Nível Organização:** CRUD de API keys (Claude, OpenAI, Gemini) com Supabase Vault. Botão “Testar conexão”

•       **Nível Agente:** cada agente WhatsApp escolhe provider + modelo + temperatura + max_tokens

•       **Nível Copiloto:** perfis de copiloto com provider/modelo independente

•       **Edge function generate-prompt:** gera system prompt baseado na descrição do produto/empresa

## 2B — Chat WhatsApp (~2 semanas)

•       **Layout 3 painéis:** lista de conversas | chat | perfil do contato

•       **Provider inicial:** Evolution API (mais acessível para PMEs). Z-API e API Oficial Meta como segundo passo

•       **Edge function whatsapp-webhook:** recebe mensagens, normaliza payload, cria conversa e contato automaticamente

•       **Tipos de mensagem:** texto, áudio (player inline), imagem, documento

•       **Toggle IA/Humano/Pausado:** controle de quem está atendendo

•       **Atribuição de conversa:** com notificação ao responsável

•       **Timeline atualizada:** mensagens WhatsApp aparecem na timeline 360° do contato

## 2C — Agente IA + Copiloto (~1 semana)

•       **Edge function ai-orchestrator:** processa mensagem com provider+modelo do agente configurado

•       **Comportamento:** sempre ativo / fora do horário / quando offline / nunca

•       **Transferência automática:** palavra-chave ou solicitação explícita

•       **Copiloto (copilot-suggest):** botão Sparkles analisa conversa + perfil, sugere resposta no textarea

•       **Base de conhecimento:** CRUD + import PDF/MD/TXT com vetorização (knowledge-import)

### Tabelas Supabase

_ai_providers_config, ai_agents, conversations, messages, whatsapp_numbers, knowledge_entries, copilot_profiles, notifications_

### Critério de Done

•       Mensagem recebida no WhatsApp aparece no chat em tempo real

•       Agente IA responde automaticamente com o provider/modelo configurado

•       Copiloto sugere respostas baseado na conversa e na base de conhecimento

•       Toggle IA/Humano funcional com transferência automática

  

# MVP 3 — Gestão Comercial de Alta Performance

|   |   |   |
|---|---|---|
|**Duração:** ~3 semanas|**Complexidade:** Média-Alta|**Risco:** Baixo|

**O que você já consegue usar:** Gestão comercial de verdade. Forecast em camadas (Commit/Best Case/Pipeline), próximo passo obrigatório, flags visuais no Kanban, Pipeline Review para gestor, equipe com metas e roteamento. O CRM sai do básico e vira ferramenta de gestão séria.

## 3A — Deal Drawer Completo (~1 semana)

•       **Forecast em camadas:** Commit / Best Case / Pipeline — preenchido pelo Closer

•       **Probabilidade de fechamento:** calculada por fase (histórico) + ajuste manual com justificativa obrigatória

•       **Próximo passo obrigatório:** O quê + Quem + Quando + Status. Deal sem próximo passo = flag vermelho

•       **Velocity:** touchpoints, canal predominante, tempo de ciclo, objeções mapeadas

•       **Desconto com motivo:** percentual + justificativa obrigatória

•       **MRR/ARR projetado:** cálculo automático baseado em ticket + recorrência

## 3B — Flags Visuais + Pipeline Review (~1 semana)

•       **Flags no Kanban:** sem próximo passo (vermelho), deal parado (laranja), data vencida (amarelo), Commit (azul), ICP badge

•       **ICP Score + Lead Scoring:** edge function lead-scorer calcula score com critérios configurados pelo admin

•       **Qualificação SDR:** passou/não passou + justificativa obrigatória

•       **Pipeline Review (tela):** visão tabular com filtros, campos editáveis inline, export CSV

•       **Segmento e subnicho:** campo no contato + propagação para deal

## 3C — Equipe + Roteamento (~1 semana)

•       **Módulo de equipe:** CRUD de membros com role, time, função, peso de distribuição

•       **Metas mensais:** valor de fechamento + número de deals + touchpoints por vendedor

•       **OTE:** salário base + comissão esperada (visível apenas para manager/admin)

•       **Roteamento de leads:** meritocrático / round-robin / manual / por segmento (edge function routing-engine)

•       **Aderência ao playbook:** % de deals com campos obrigatórios preenchidos por vendedor

### Tabelas Supabase (novas)

_lead_scoring_config, routing_rules, performance_snapshots, forecast_history_

### Critério de Done

•       Deal drawer com todos os campos de alta performance preenchidos

•       Flags visuais no Kanban refletindo próximo passo, forecast e ICP

•       Pipeline Review funcional para o gestor conduzir reunião semanal

•       Roteamento automático distribuindo leads por regra configurada

  

# MVP 4 — Analytics & Dashboard

|   |   |   |
|---|---|---|
|**Duração:** ~2 semanas|**Complexidade:** Média|**Risco:** Baixo|

**O que você já consegue usar:** Visibilidade total. Dashboard com KPIs, Forecast Gerencial consolidado, MTD Tracking com pace de cada vendedor, 9-Box de performance, e analytics avançado por segmento e canal. O gestor tem tudo que precisa para tomar decisões baseadas em dados.

## 4A — Dashboard + Forecast Gerencial (~1 semana)

•       **Dashboard principal:** KPIs com filtro de período (Hoje/7d/30d/Custom) + comparativo com período anterior

•       **KPIs:** atendimentos, conversões, tempo médio de resposta, novos leads, taxa autonomia IA

•       **Gráficos:** chats vs conversões/dia, tendência de leads, touchpoints por canal

•       **Forecast Gerencial:** Commit/Best Case/Pipeline por vendedor e time, probabilidade ponderada, comparativo com meta

•       **Edge function forecast-aggregator:** agrega camadas de forecast e calcula receita esperada

## 4B — MTD + 9-Box + Performance (~1 semana)

•       **MTD Tracking:** barra de progresso por vendedor, pace indicator, alertas automáticos (D+10/15/20)

•       **Edge function mtd-tracker:** cron diário calculando pace vs. meta

•       **Performance Individual:** win rate por fase, por segmento, ciclo médio, ticket médio, ROAS, aderência, score roleplay

•       **9-Box:** matriz 3x3 (resultado vs. competência), snapshot mensal, thresholds configuráveis

•       **Edge function performance-calculator:** cron mensal com cálculos de win rate, ROAS, etc.

•       **Analytics avançado:** funil de conversão, análise por segmento/canal, motivos de perda/churn

### Critério de Done

•       Dashboard com KPIs reais calculados a partir dos dados do workspace

•       Forecast Gerencial consolidando Commit/Best Case/Pipeline do time

•       MTD Tracking mostrando pace de cada vendedor com alertas

•       9-Box posicionando vendedores na matriz resultado vs. competência

  

# MVP 5 — Flow Builder

|   |   |   |
|---|---|---|
|**Duração:** ~4 semanas|**Complexidade:** Alta|**Risco:** Médio|

**O que você já consegue usar:** Automação de marketing e vendas completa. Criar fluxos visuais com gatilhos, condições, esperas e ações. Enviar sequências de WhatsApp + e-mail baseadas em clusters de cliente. O JimmyAtende vira uma ferramenta de automação comercial análoga ao ActiveCampaign.

## 5A — Canvas Visual + Engine (~2 semanas)

•       **Editor drag-and-drop:** canvas com blocos conectáveis (Gatilho → Condição → Espera → Ação → Ramificação)

•       **Gatilhos implementados:** novo lead, mudança de stage, tag adicionada/removida, manual pelo vendedor

•       **Condições:** cluster de perfil (ICP), stage atual, produto/plano, horário/dia

•       **Ações:** enviar WhatsApp, enviar e-mail, adicionar/remover tag, mover deal, atribuir responsável, criar tarefa, notificar vendedor

•       **Esperas:** aguardar X dias/horas, aguardar condição (abriu e-mail, respondeu, mudou stage)

•       **Versionamento:** rascunho, publicar, pausar, arquivar. Duplicar fluxo existente

•       **Edge function flow-engine:** processa enrollments, avalia condições, avança nós

•       **Edge function flow-action-executor:** executa cada ação (WhatsApp, e-mail, etc.)

## 5B — E-mail + Clusterização + Logs (~2 semanas)

•       **Templates de e-mail:** editor rich text com variáveis dinâmicas ({{nome}}, {{empresa}}, etc.), preview desktop/mobile

•       **Integração Resend:** API key + domínio customizado com setup guiado de SPF/DKIM

•       **Métricas de e-mail:** abertura, cliques, respostas, opt-outs. Disponíveis no log do fluxo

•       **Clusterização:** clusters customizáveis pelo admin (ICP + segmento + fase + comportamento + produto)

•       **Gatilhos adicionais:** score atingiu X, deal parado X dias, data relativa ao contrato, NPS recebido, formulário Jimmy Studio

•       **Log de execução:** contatos por nó, taxas de saída, simulação de fluxo com contato real

•       **Opt-out:** lista de descadastro por workspace (WhatsApp + e-mail)

### Tabelas Supabase

_flows, flow_nodes, flow_enrollments, flow_execution_log, email_templates_

### Critério de Done

•       Fluxo visual criado, publicado e executando ações automaticamente

•       Sequência WhatsApp + e-mail disparando por gatilho de stage

•       Clusters direcionando contatos para caminhos diferentes no fluxo

•       Log mostrando execução em tempo real com métricas por nó

  

# MVP 6 — Ecossistema Completo

|   |   |   |
|---|---|---|
|**Duração:** ~3 semanas|**Complexidade:** Média-Alta|**Risco:** Baixo-Médio|

**O que você já consegue usar:** Plataforma completa pronta para começar a vender. Roleplay de vendas treinando o time, NPS/CSAT medindo satisfação, agendamentos sincronizados com Google/Outlook, painel superadmin gerenciando workspaces, API pública recebendo leads do Jimmy Studio, e planos com billing.

## 6A — Agendamentos + NPS/CSAT (~1 semana)

•       **Calendário:** CRUD de eventos com vínculo a contato/deal, detecção de conflito

•       **Sincronização:** Google Calendar (OAuth 2.0) + Outlook (Azure App Registration)

•       **Lembrete automático:** e-mail 24h e 1h antes via Resend

•       **NPS/CSAT:** envio automático pós-encerramento (WhatsApp e/ou e-mail), categorização por IA

•       **Health Score:** atualizado por NPS + engajamento + atividade

•       **Pós-venda:** alerta de renovação 60 dias antes, motivo de churn obrigatório, upsell/cross-sell

## 6B — Roleplay de Vendas (~1 semana)

•       **Hub de treinamentos:** CRUD de treinamentos com framework (SPIN/BANT/MEDDIC), cenários e categorias de avaliação

•       **Roleplay texto:** edge function roleplay-chat simula cliente com persona + objeções

•       **Roleplay voz:** ElevenLabs Conversational AI (roleplay-voice-token)

•       **Avaliação automática:** scores por categoria, pontos fortes, áreas de melhoria (roleplay-evaluate)

•       **Processo seletivo:** página pública /selecao/:slug para candidatos sem login

## 6C — Superadmin + API + Planos (~1 semana)

•       **Painel Superadmin:** lista de workspaces com métricas, CRUD, impersonação com audit log

•       **Métricas globais:** workspaces ativos, MRR estimado, uso de IA por workspace

•       **API pública:** POST /api/v1/leads com Bearer Token + rate limit. Integração Jimmy Studio

•       **Webhooks de entrada:** CRUD com mapeamento de campos para receber leads de fontes externas

•       **Planos + AppMax:** Starter/Pro/Business/Enterprise com limites. Ativação manual via superadmin

•       **LGPD:** exportação e deleção de dados (direito ao esquecimento)

### Tabelas Supabase (novas)

_appointments, nps_csat_surveys, roleplay_trainings, roleplay_sessions, api_tokens, inbound_webhooks, audit_logs_

### Critério de Done

•       Agendamento sincronizado com Google Calendar bidirecionalmente

•       NPS enviado automaticamente após encerramento de conversa

•       Roleplay texto funcional com avaliação automática da IA

•       Superadmin gerencia e impersona workspaces com audit log

•       Jimmy Studio envia lead via API e fluxo de boas-vindas é disparado

  

# Mapa de Dependências entre MVPs

Cada MVP depende do anterior estar funcional. O mapa abaixo mostra as dependências críticas e o que pode ser paralelizado.

|**MVP**|**Depende de**|**Desbloqueia**|**Paralelizável?**|
|---|---|---|---|
|0 - Fundação|Nada|Tudo|Não|
|1 - CRM Core|MVP 0|MVP 2, 3|Não|
|2 - WhatsApp+IA|MVP 1 (contatos)|MVP 5 (flow actions)|Não|
|3 - Gestão|MVP 1 (pipeline)|MVP 4 (analytics)|Sim, com MVP 2|
|4 - Analytics|MVP 3 (dados)|MVP 6 (9-box+perf)|Não|
|5 - Flow Builder|MVP 2 (WhatsApp, e-mail)|Automação total|Parcial com MVP 3/4|
|6 - Ecossistema|MVP 4, 5|Go-to-market|Parcial (roleplay)|

### Nota sobre Paralelização

Se você tiver outro desenvolvedor ou quiser usar sessões paralelas no Lovable, existem duas janelas de paralelismo: o MVP 3 (Gestão Comercial) pode começar em paralelo com o MVP 2 (WhatsApp), já que depende do pipeline (MVP 1) e não do chat. Além disso, o canvas do Flow Builder (MVP 5A) pode começar em paralelo com o MVP 4, já que é um módulo visual independente — só a engine de execução precisa do WhatsApp/e-mail prontos.

  

# Estratégia de Desenvolvimento no Lovable

## Prompt Engineering para Cada MVP

Cada MVP deve ser desenvolvido no Lovable com prompts estruturados seguindo este padrão:

•       **Contexto:** "Estou construindo o JimmyAtende, um CRM SaaS multi-tenant com React + Supabase. Stack: React + TypeScript + Vite + Tailwind CSS + Supabase. Tema dark-only."

•       **Escopo exato:** copie o escopo do MVP diretamente deste documento, incluindo campos, tabelas e edge functions

•       **Tabelas primeiro:** sempre peça para criar as tabelas Supabase com RLS antes de qualquer UI

•       **Uma feature por prompt:** não tente construir o MVP inteiro em um prompt só. Quebre em features atômicas

•       **Teste antes de avançar:** valide cada feature antes de pedir a próxima. Corrigir bugs cedo é 10x mais barato

## Ordem de Prompts Sugerida (Exemplo MVP 0)

1.     "Crie as tabelas workspaces, workspace_members e profiles no Supabase com RLS por workspace_id"

2.     "Crie tela de login e registro com Supabase Auth (email/senha + magic link)"

3.     "Crie a edge function initialize-workspace que provisiona pipeline padrão e tags"

4.     "Crie o shell da aplicação: sidebar dark com navegação, branding configurável"

5.     "Crie a página de configurações básicas: logo, nome, cores do workspace"

## Edge Functions — Visão por MVP

As edge functions devem ser criadas junto com o MVP que as necessita. Aqui está a distribuição:

|**MVP**|**Edge Functions**|**Prioridade**|
|---|---|---|
|0|initialize-workspace|Crítica — primeira função|
|1|cnpj-enrichment|Alta — diferencial do CRM|
|2|whatsapp-webhook, ai-orchestrator, copilot-suggest, generate-prompt, knowledge-import|Crítica — core do atendimento|
|3|lead-scorer, routing-engine|Alta — inteligência comercial|
|4|forecast-aggregator, mtd-tracker, performance-calculator, analytics-report|Média — dados calculados|
|5|flow-engine, flow-action-executor, send-email|Crítica — motor de automação|
|6|calendar-sync, nps-csat-send, nps-csat-webhook, deal-monitor, roleplay-chat, roleplay-voice-token, roleplay-evaluate, lead-intake, admin-create-user, admin-reset-password|Média-Alta — ecossistema|

# Timeline Visual

Estimativa de 20–21 semanas para todos os MVPs, assumindo dedicação consistente no Lovable:

||**Mês 1**|**Mês 2**|**Mês 3**|**Mês 4**|**Mês 5**|
|---|---|---|---|---|---|
|**MVP 0**|**██**|||||
|**MVP 1**|**████**|||||
|**MVP 2**||**██████**||||
|**MVP 3**|||**████**|||
|**MVP 4**|||**██**|||
|**MVP 5**||||**██████**||
|**MVP 6**|||||**█████**|

## Marcos de Entrega de Valor

•       **Semana 5 (após MVP 1):** Já pode cadastrar contatos reais, enriquecer CNPJ e gerenciar pipeline. CRM básico operacional.

•       **Semana 9 (após MVP 2):** Atendimento real via WhatsApp com IA. Pode começar a usar com clientes-piloto da Trívia.

•       **Semana 12 (após MVP 3):** Gestão comercial completa. Pode começar a demonstrar para potenciais clientes como ferramenta de gestão.

•       **Semana 14 (após MVP 4):** Dashboards e analytics. Valor percebido pelo gestor dispara — dados viram decisões.

•       **Semana 18 (após MVP 5):** Automação multicanal. Feature killer que diferencia de CRMs commoditizados. Pronto para early adopters.

•       **Semana 21 (após MVP 6):** Plataforma completa. Go-to-market com planos, API, roleplay e NPS. Pronto para vender.

# Decisões Técnicas para o Lovable

•       **Supabase primeiro, UI depois:** sempre crie tabelas + RLS + edge functions antes de pedir a interface. O Lovable gera UI muito melhor quando os dados já existem.

•       **Dark-only simplifica:** não gaste tempo com tema light. Foque em um tema dark profissional e consistente.

•       **Component library:** use shadcn/ui desde o início. O Lovable trabalha muito bem com ele e garante consistência visual.

•       **Real-time com Supabase:** ative subscriptions em tempo real desde o MVP 2 (chat). Isso dá a sensação de app profissional.

•       **Soft delete em tudo:** deleted_at em vez de DELETE real. Implementar desde o MVP 0 para não ter que migrar depois.

•       **WhatsApp provider:** comece com Evolution API no MVP 2. É a opção mais acessível e com melhor DX. Z-API e Meta como fase 2 do próprio MVP 2.

•       **Edge Functions em TypeScript:** padronize todas as edge functions com o mesmo boilerplate (auth check, workspace isolation, error handling).