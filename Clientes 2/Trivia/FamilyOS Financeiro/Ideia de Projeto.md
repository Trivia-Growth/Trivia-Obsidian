## FamilyOS Financeiro — Especificação Refinada

### Visão Geral

Um sistema financeiro familiar inteligente, operado por um agente de IA que age como consultor financeiro pessoal. O sistema centraliza extratos, metas, investimentos e planejamento — e pode ser acessado via interface web ou WhatsApp, com sincronização bidirecional com Notion e Obsidian.

Stack: React + Vite + TypeScript + Tailwind + Supabase + Claude API via OpenRouter.

**1. O agente é o produto, não um módulo.** A versão original tratava o agente como uma feature dentro do sistema. Mas pela tua intenção real, o agente é a interface principal — tudo gira em torno dele. WhatsApp, Notion, dashboard, são apenas superfícies onde o agente aparece. Isso muda a arquitetura.

**2. Memória precisa ser estrutural desde o dia 1.** Sem memória persistente e contexto familiar bem modelado, o agente vira um chatbot genérico. Isso precisa estar na fundação, não vir depois.

**3. Tool calls são o esqueleto da inteligência.** O agente não "sabe" nada — ele consulta dados via tools. Cada feature do sistema precisa expor uma ou mais tools que o agente possa chamar. Isso simplifica o escopo: ao invés de construir telas complexas, construímos tools, e o agente traduz para o usuário.

**4. Separar conhecimento estruturado de conversacional.** Investimentos, mercado, regras tributárias — isso é conhecimento que muda. Precisa de uma camada de RAG ou tool calls com web search, não pode estar no prompt do agente.

**5. O agente precisa de personalidade definida.** "Consultor financeiro" é vago. Precisa decidir: é o consultor sério estilo private banker? É o coach que te chama atenção? É o amigo que explica simples? Isso define como o sistema é percebido.

---

### Arquitetura Proposta

```
┌─────────────────────────────────────────────────┐
│  Superfícies (onde o agente aparece)            │
│  Web Chat │ WhatsApp │ Email │ Notion           │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│  Agent Core                                     │
│  - Orchestrator                                 │
│  - Memory (curto + longo prazo)                 │
│  - Personality & System Prompt                  │
│  - Tool Registry                                │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│  Tools (capacidades do agente)                  │
│  Financial Tools │ Investment Tools │ Market    │
│  Tools │ Memory Tools │ External Tools          │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│  Data Layer (Supabase)                          │
│  Transações │ Metas │ Carteira │ Memória │ Logs │
└─────────────────────────────────────────────────┘
```

---

### Módulo Inicial: Agente Consultor Financeiro

Vamos começar por aqui, com um corte vertical: agente funcional ponta a ponta, mesmo que ainda não tenha extratos reais sendo processados.

#### Fase 1 — Agente Conversacional com Contexto (Semana 1)

**Objetivo:** ter um agente que conhece a família, conversa com contexto, e tem personalidade definida. Mesmo sem dados financeiros reais ainda.

Features:

- **Onboarding conversacional.** Ao invés de formulário, o agente faz uma entrevista guiada. Coleta: composição familiar, renda, dívidas, objetivos de vida, perfil de risco, estilo de comunicação preferido. Tudo vira memória estruturada.
- **Personalidade configurável.** Cinco arquétipos pré-definidos (Private Banker, Coach Direto, Amigo Próximo, Mentor Acadêmico, Estrategista). O usuário escolhe e pode ajustar tom (formal/informal, direto/cuidadoso). Isso vai pro system prompt.
- **Memória de longo prazo.** Tabela `agent_memory` com tipos: fact (informação verificada), preference (estilo do usuário), goal (objetivo declarado), event (algo que aconteceu). Cada memória tem confidence score e timestamp.
- **Memória de curto prazo (conversa).** Janela de mensagens recentes mantida na conversa ativa.
- **Web chat funcional.** Interface limpa de chat, streaming de tokens, capacidade de o agente fazer perguntas de volta ao usuário.
- **Configuração OpenRouter.** Campo de API key, seleção de modelo por função (chat, parsing, embeddings).

Entregável: Lucas e Bianca conseguem ter conversas reais com o agente sobre finanças, e ele lembra do que foi dito antes.

---

#### Fase 2 — Tools Financeiras Básicas (Semana 2)

**Objetivo:** dar olhos e mãos ao agente para os dados financeiros que já existem ou são informados manualmente.

Features:

- **Tool: `register_transaction`.** O usuário diz "gastei 80 reais no mercado" e o agente registra. Categoria sugerida automaticamente.
- **Tool: `query_spending`.** "Quanto gastei com delivery esse mês?" → o agente consulta o banco, retorna resposta narrativa com números.
- **Tool: `register_goal`.** Criação de metas via conversa. O agente faz perguntas de refinamento.
- **Tool: `update_goal_progress`.** Progresso registrado conversacionalmente.
- **Tool: `register_income`.** Receitas e fontes.
- **Tool: `summarize_month`.** Resumo do mês em prosa, não tabela. O agente conta como foi o mês.
- **Categorização automática com regras + IA.** Tabela `category_rules` aprendida ao longo do tempo. Quando o agente categoriza algo novo, salva a regra.

Entregável: Lucas pode usar o agente como diário financeiro. Mesmo sem upload de extrato, já tem valor real.

---

#### Fase 3 — Upload de Extratos & Parsing (Semana 3)

**Objetivo:** automatizar a entrada de dados que hoje seria manual.

Features:

- **Upload de PDF/CSV/OFX.** Detecção automática do banco/cartão.
- **Parser via LLM.** Edge Function `parse-statement` que envia o PDF para um modelo cheap (Gemini Flash via OpenRouter) e extrai transações estruturadas.
- **Revisão antes de salvar.** Lista de transações extraídas, usuário confirma ou edita, depois grava em lote.
- **Categorização em batch.** Aplicação das regras existentes + IA para o que não casar.
- **Detecção de duplicatas.** Não importar a mesma transação duas vezes (hash por data + valor + descrição).
- **Tool: `import_statement`.** O agente pode ser perguntado "como foi minha fatura do Itaú?" e ele consulta os dados importados.

Entregável: pipeline real de extrato → categorização → análise pelo agente.

---

#### Fase 4 — Skill de Investimento (Semana 4)

**Objetivo:** o agente sabe falar de investimentos com base na carteira real e em dados de mercado.

Features:

- **Tool: `register_investment_position`.** Cadastro manual de posições.
- **Tool: `query_portfolio`.** Visão consolidada: alocação, rentabilidade, vencimentos.
- **Tool: `get_market_data`.** Web search direcionado para CDI, IPCA, IBOV, cotações.
- **Tool: `simulate_investment`.** Cálculos de juros compostos, comparação CDB vs Tesouro vs FII.
- **Tool: `analyze_portfolio`.** O agente avalia diversificação, concentração, alinhamento com objetivos. Usa o perfil de risco da memória.
- **Knowledge base de produtos financeiros.** Documentos curtos sobre CDB, LCI, Tesouro Direto, FIIs, ações, BTC — usados via RAG quando o agente precisa explicar algo. Evita alucinação.
- **Disclaimer estrutural.** Toda recomendação vem com aviso de que não é recomendação formal de investimento. Isso é embutido no system prompt da skill.

Entregável: agente capaz de discutir carteira real e responder dúvidas sobre investimentos sem alucinar.

---

#### Fase 5 — WhatsApp via Zapi (Semana 5)

**Objetivo:** levar o agente para onde a família já está.

Features:

- **Configuração Zapi.** Token e instance ID nas settings. Validação ao salvar.
- **Webhook Edge Function.** Recebe mensagens, identifica o usuário pelo telefone, roteia pro agente.
- **Mesma memória, mesmo contexto.** Conversa no WhatsApp e no web compartilham a memória de longo prazo. Janelas de curto prazo são separadas (porque são threads diferentes).
- **Comandos rápidos.** `/resumo`, `/meta`, `/carteira`, `/gasto` para ações comuns.
- **Mensagens proativas.** Edge Function agendada que envia alertas: vencimento de fatura, meta atingida, gasto fora do padrão. Usuário configura o que quer receber.
- **Múltiplos membros.** Cada telefone cadastrado tem perfil próprio mas compartilha o contexto familiar.
- **Áudio (opcional fase 5.5).** Transcrição via Whisper para mensagens de voz.

Entregável: Lucas manda áudio no WhatsApp "gastei 50 no Uber" e o agente registra. Bianca pergunta "como tá a meta da viagem?" e ele responde com contexto.

---

#### Fase 6 — Sincronização Notion & Obsidian (Semana 6)

**Objetivo:** o agente alimenta o segundo cérebro do usuário.

Features:

**Notion:**

- Conexão via OAuth ou API token.
- O agente pode escrever no Notion via tool: cria página de relatório mensal, atualiza database de metas, registra reflexões financeiras.
- O agente pode ler do Notion via tool: páginas marcadas como "contexto financeiro" entram na memória do agente.
- Sincronização agendada (semanal) ou sob demanda.

**Obsidian:**

- Pasta configurada (sincronizada via Dropbox/iCloud com o vault local).
- Geração de notas Markdown com frontmatter YAML, tags e links internos.
- Relatório mensal como nota interligada com notas de metas.
- Possibilidade de o usuário arrastar uma nota do Obsidian e o agente lê o conteúdo.

Entregável: o sistema vira parte do PKM do Lucas, não uma ilha.

---

#### Fase 7 — Inteligência Proativa (Semana 7+)

**Objetivo:** o agente deixa de só responder e passa a iniciar conversas relevantes.

Features:

- **Revisão Mensal Guiada.** No primeiro dia útil do mês, o agente envia uma sessão estruturada: como foi o mês passado, ajustes nas metas, projeções, reflexões.
- **Score de Saúde Financeira.** Algoritmo que combina: taxa de poupança, alinhamento com metas, diversificação, reserva de emergência, dívidas. Atualizado mensalmente.
- **Detecção de padrões.** Tool agendada que roda análise estatística e sinaliza desvios. "Seus gastos com delivery aumentaram 60% nas últimas 4 semanas."
- **Score de Decisão.** Antes de uma compra grande, o usuário descreve e o agente avalia impacto nas metas. Sugere alternativas.
- **Calendário financeiro inteligente.** Vencimentos, salários, parcelas — o agente avisa antes e sugere ajustes se houver risco.
- **Modo "Pergunta da Semana".** O agente faz uma pergunta provocativa por semana para estimular reflexão. Ex: "Se tivesse 30k extras hoje, o que faria — e por quê?"

Entregável: o agente vira presença, não ferramenta.

#### Módulo 8 — Configuração de LLMs via OpenRouter

- Painel de configurações com campo para API Key do OpenRouter
- Seleção de modelo por função:
    - Agente principal (ex: `anthropic/claude-sonnet-4-5`)
    - Parsing de extratos (modelo mais rápido/barato, ex: `google/gemini-flash`)
    - Embeddings para memória semântica
- Fallback automático entre modelos
- Monitor de uso e custo estimado por mês
- Possibilidade de usar modelos locais via Ollama (futuro)

**Supabase:** tabela `llm_configs` com BYOK (chave por família)
#### Módulo 9 — Dashboard Central

Visão consolidada da saúde financeira familiar:

- Cards: saldo líquido, gastos do mês, progresso das metas, rentabilidade da carteira
- Gráfico de fluxo de caixa (receitas vs despesas, 12 meses)
- Linha do tempo de eventos financeiros futuros
- Feed do agente: insights e alertas do dia
- Atalho para conversar com o agente diretamente na interface

---

#### Módulo 10 — Segurança & Multi-família

- Auth via Supabase (email + magic link)
- RLS por `family_id` — dados completamente isolados por família
- Convite de membros familiares por email
- Permissões: admin (visualiza tudo, configura) e viewer (visualiza sem editar)
- Logs de auditoria de alterações sensíveis
---

### Modelagem de Dados (olhando para o futuro)

Schema enxuto na fundação, mas com forma para crescer:

```
families              -- unidade familiar (RLS root)
├── family_members    -- Lucas, Bianca, futuramente Lara
├── agent_configs     -- personalidade, modelo, OpenRouter key
├── agent_conversations
│   └── messages      -- histórico completo
├── agent_memory      -- fatos, preferências, eventos (com embeddings)
├── transactions      -- todas as movimentações
│   └── categories
├── category_rules    -- aprendidas pelo agente
├── statements        -- extratos importados (raw + parsed)
├── goals             -- metas familiares e individuais
│   └── goal_contributions
├── investments       -- posições da carteira
│   └── investment_history
├── budgets           -- planejamento por categoria
├── integrations      -- Notion, Obsidian, Zapi tokens
├── whatsapp_sessions
└── proactive_jobs    -- tarefas agendadas do agente
```

Tudo com RLS por `family_id`. Tokens sensíveis (OpenRouter, Zapi, Notion) criptografados em nível de aplicação antes de salvar.

---

### Decisões Importantes Antes de Começar

Para eu construir já hoje, preciso de definição em três pontos:

**1. Personalidade do agente.** Qual arquétipo? Aqui quero ter a opção de escolher
**2. Modelo principal via OpenRouter.** `anthropic/claude-sonnet-4-5` para o agente principal (qualidade da conversa importa muito), `google/gemini-2.5-flash` para parsing de extratos (volume, custo)

**3. Nome do agente.** Atlas

---

### Por onde começar

Proponho entregar a Fase 1 completa hoje:

- Schema Supabase (migrations completas das tabelas da fase 1)
- Setup do projeto React + Vite + TypeScript + Tailwind
- Página de auth (Supabase magic link)
- Página de configurações (OpenRouter key, escolha de personalidade, dados da família)
- Onboarding conversacional (agente faz a entrevista inicial)
- Chat principal com streaming
- Sistema de memória persistente funcionando
- Edge Function `agent-chat` com tool registry vazio (estrutura pronta para receber as tools da fase 2)
### Sugestões Adicionais

**Receipts OCR:** upload de foto de nota fiscal ou comprovante — o agente extrai e categoriza automaticamente.

**Projeção de Patrimônio Líquido:** gráfico de longo prazo mostrando evolução do PL com base nas metas e investimentos atuais.

**Modo "Revisão Mensal":** o agente conduz uma sessão guiada no início de cada mês — faz perguntas, revisa o mês anterior, ajusta o plano.

**Score de Decisão:** antes de uma compra grande, o usuário descreve e o agente avalia o impacto nas metas e na saúde financeira.

**Export para IR:** agrupamento de transações e investimentos para auxiliar na declaração do Imposto de Renda.