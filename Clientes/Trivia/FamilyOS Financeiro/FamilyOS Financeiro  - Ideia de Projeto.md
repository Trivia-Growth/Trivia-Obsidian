### 1. Visão do Produto

Um sistema financeiro familiar inteligente operado por um agente de IA que age como consultor financeiro pessoal. Centraliza extratos, orçamento, metas, investimentos e planejamento — acessível via web, WhatsApp, Notion e Obsidian. O agente é a interface principal; as telas são complementos visuais.

**Proposta de valor:** transformar a gestão financeira familiar de planilha estática em conversa contínua com um consultor que conhece a família, lembra de tudo, e age proativamente.

**Público:** famílias que querem clareza financeira sem complexidade de planilha — começando pela família Azevedo (Lucas e Bianca).

---

### 2. Princípios de Design

- **Conversa antes de tela.** Toda feature precisa funcionar via chat antes de virar interface gráfica.
- **Memória estrutural.** O agente lembra de tudo o que importa, sem o usuário precisar repetir.
- **Tools como esqueleto.** O agente não "sabe", ele consulta. Cada feature do sistema é uma tool.
- **Família como unidade.** Múltiplos membros, contexto compartilhado, isolamento total entre famílias.
- **Proatividade calibrada.** O agente age antes de ser chamado, mas sem virar spam.
- **Tudo em português.** Linguagem natural, sem jargão técnico.

---

### 3. Arquitetura em Camadas

```
┌─────────────────────────────────────────────────┐
│  Superfícies                                    │
│  Web Chat │ WhatsApp │ Notion │ Obsidian        │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│  Agent Core                                     │
│  Orchestrator │ Memory │ Personality │ Tools    │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│  Módulos Funcionais                             │
│  Extratos │ Orçamento │ Metas │ Investimentos   │
│  Integrações │ Configurações                    │
└─────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────┐
│  Data Layer (Supabase)                          │
│  Postgres + RLS │ Edge Functions │ Storage      │
└─────────────────────────────────────────────────┘
```

---

### 4. Stack Técnica

- **Frontend:** React + Vite + TypeScript + Tailwind, arquitetura Bulletproof React, validação Zod.
- **Backend:** Supabase (Auth, Postgres, RLS, Edge Functions, Storage, pg_cron).
- **IA:** OpenRouter como gateway (BYOK por família), modelo principal sugerido `anthropic/claude-sonnet-4-5`, modelos auxiliares para parsing e embeddings.
- **WhatsApp:** Z-API.
- **Integrações:** Notion API, geração de Markdown para Obsidian.
- **Dev:** Claude Code como par de programação principal.

---

### 5. Módulos do Sistema

#### Módulo 1 — Agente Consultor Financeiro (Core)

O coração do produto. Tudo se conecta nele.

**Personalidade configurável** Cinco arquétipos pré-definidos: Private Banker, Coach Direto, Amigo Próximo, Mentor Acadêmico, Estrategista. Usuário escolhe e ajusta tom (formal/informal, direto/cuidadoso). Define o system prompt.

**Memória de longo prazo** Tabela com tipos: fact (informação verificada), preference (estilo do usuário), goal (objetivo declarado), event (algo que aconteceu). Cada memória tem confidence score, fonte e timestamp. Embeddings para busca semântica.

**Memória de curto prazo** Janela de mensagens recentes mantida na conversa ativa, separada por superfície (web vs WhatsApp).

**Onboarding conversacional** Em vez de formulário, o agente conduz uma entrevista guiada na primeira sessão. Coleta: composição familiar, renda, dívidas, objetivos de vida, perfil de risco, estilo de comunicação. Tudo vira memória estruturada.

**Tool Registry** Lista expansível de capacidades. Cada módulo do sistema registra suas tools aqui. O agente decide quando usar cada uma.

**Skill de Investimento** Especialização ativada quando o assunto é carteira/mercado. Tem knowledge base própria (RAG) com produtos financeiros, evita alucinação. Disclaimer estrutural sobre não ser recomendação formal.

**Skill Financeira** Análise de extratos, orçamento e metas. Detecção de padrões. Simulação de cenários.

---

#### Módulo 2 — Extratos & Transações

**Upload multi-formato** PDF, CSV e OFX dos principais bancos brasileiros (Itaú, Bradesco, Nubank, Santander, BB, Inter, C6, XP).

**Parser inteligente via LLM** Edge Function que envia o arquivo para um modelo cheap (Gemini Flash) e extrai transações estruturadas. Detecção automática do banco e do tipo de conta.

**Categorização híbrida** Regras aprendidas + IA para o que não casar. Cada categorização nova vira regra. Tabela de regras cresce ao longo do tempo.

**Detecção de duplicatas** Hash por data + valor + descrição evita reimportação.

**Revisão antes de salvar** Lista de transações extraídas, usuário confirma ou edita em lote, depois grava.

**Visões de gastos** Por período, por membro, por cartão, por categoria. Tudo acessível pelo agente via tools.

**OCR de recibos** Upload de foto de nota fiscal → o agente extrai e categoriza.

---

#### Módulo 3 — Orçamento & Planejamento Familiar

**Orçamento mensal por categoria** Definição de tetos e acompanhamento em tempo real.

**Múltiplos membros** Lucas, Bianca, futuramente Lara. Visões individuais e consolidada. Permissões: admin (configura) ou viewer.

**Despesas planejadas** Eventos futuros conhecidos: viagem, escola, reforma. Entram no calendário e na projeção.

**Calendário financeiro** Vencimentos, salários, parcelas. O agente avisa com antecedência e sugere ajustes se houver risco.

**Score de Saúde Financeira** Algoritmo que combina taxa de poupança, alinhamento com metas, diversificação, reserva de emergência e dívidas. Atualizado mensalmente.

---

#### Módulo 4 — Objetivos & Metas

**Criação conversacional** Usuário diz "quero juntar 30k pra reserva de emergência" e o agente faz perguntas de refinamento (prazo, prioridade, fonte).

**Progresso visual com projeções** Baseadas no histórico real de poupança, não em números aspiracionais.

**Sugestão de ajustes** "Se cortar R$ 400 em delivery, atinge a meta 2 meses antes."

**Metas compartilhadas** Membros da família podem contribuir para a mesma meta. Histórico de contribuições visível.

**Tipos pré-definidos** Reserva de emergência, viagem, bem material, investimento, aposentadoria, livre.

---

#### Módulo 5 — Investimentos

**Cadastro manual de posições** CDB, LCI, LCA, Tesouro, FIIs, Ações, BTC, fundos. Campos relevantes por tipo.

**Dashboard de carteira** Alocação por classe, por liquidez, rentabilidade vs benchmarks (CDI, IPCA, IBOV).

**Análise pelo agente** Avalia diversificação, concentração, alinhamento com objetivos. Usa o perfil de risco salvo na memória.

**Simulador** "Quanto terei em 5 anos investindo R$ 1.000/mês a 12% a.a.?"

**Alertas de vencimento** Renda fixa próxima do vencimento entra no calendário e vira mensagem proativa.

**Dados de mercado** Tool de web search direcionado para cotações, taxas básicas, notícias de mercado.

**Integração futura** Open Finance para sincronização automática com corretoras.

---

#### Módulo 6 — WhatsApp via Z-API

**Configuração simples** Token e instance ID nas settings, validação ao salvar.

**Webhook** Edge Function recebe mensagens, identifica usuário pelo telefone, roteia para o agente.

**Memória compartilhada** Conversa no WhatsApp e no web compartilham a memória de longo prazo. Janelas de curto prazo separadas.

**Comandos rápidos** `/resumo`, `/meta`, `/carteira`, `/gasto`, `/investir` para ações comuns.

**Mensagens proativas** Edge Function agendada envia: vencimento de fatura, meta atingida, gasto fora do padrão, lembrete de revisão mensal. Usuário configura quais alertas quer receber.

**Áudio** Transcrição via Whisper para registrar gastos por voz: "gastei cinquenta reais no Uber agora."

**Múltiplos números** Cada telefone cadastrado tem perfil próprio mas compartilha o contexto familiar.

---

#### Módulo 7 — Sincronização Notion & Obsidian

**Notion (bidirecional)**

- Conexão via API token.
- Agente escreve: relatório mensal como página, metas como database, transações como tabela.
- Agente lê: páginas marcadas como "contexto financeiro" entram na memória.
- Sincronização agendada (semanal) ou sob demanda.

**Obsidian (export)**

- Pasta configurada (sincronizada via Dropbox/iCloud com o vault local).
- Markdown com frontmatter YAML, tags e links internos.
- Relatório mensal como nota interligada com notas de metas e investimentos.
- Export sob demanda ou automático no fim do mês.

---

#### Módulo 8 — Configuração de LLMs via OpenRouter

**Painel BYOK** API key do OpenRouter por família, criptografada em nível de aplicação.

**Seleção de modelo por função**

- Agente principal (qualidade da conversa)
- Parsing de extratos (custo/velocidade)
- Embeddings (memória semântica)
- Transcrição de áudio (Whisper)

**Fallback automático** Se um modelo falhar, tenta o próximo da lista.

**Monitor de uso e custo** Dashboard com tokens consumidos e custo estimado por mês.

**Suporte futuro a modelos locais** Ollama via endpoint custom.

---

#### Módulo 9 — Dashboard Central

Visão consolidada para quando o usuário quiser ver os números, não conversar.

- Cards: saldo líquido, gastos do mês, progresso das metas, rentabilidade da carteira.
- Gráfico de fluxo de caixa (12 meses).
- Linha do tempo de eventos financeiros futuros.
- Feed do agente com insights e alertas do dia.
- Atalho permanente para conversar com o agente.

---

#### Módulo 10 — Inteligência Proativa

O que diferencia o sistema de um chatbot genérico.

**Revisão Mensal Guiada** No primeiro dia útil do mês, sessão estruturada: como foi o mês passado, ajustes nas metas, projeções, reflexões.

**Detecção de padrões** Análise estatística agendada sinaliza desvios. "Seus gastos com delivery aumentaram 60% nas últimas 4 semanas."

**Score de Decisão** Antes de compra grande, usuário descreve e o agente avalia impacto nas metas. Sugere alternativas.

**Pergunta da Semana** O agente faz uma pergunta provocativa por semana para estimular reflexão.

**Export para IR** Agrupamento de transações e investimentos para auxiliar na declaração.

**Projeção de Patrimônio Líquido** Gráfico de longo prazo com evolução do PL baseado em metas e investimentos atuais.

---

#### Módulo 11 — Segurança & Multi-família

- Auth via Supabase (email + magic link).
- RLS por `family_id` — isolamento total entre famílias.
- Convite de membros por email.
- Permissões: admin e viewer.
- Logs de auditoria de alterações sensíveis.
- Tokens externos (OpenRouter, Z-API, Notion) criptografados em nível de aplicação.
- Edge Functions para qualquer lógica que toque dados sensíveis.