# Vista Intel Pro (Trivia Tasker) — Dashboard

## Dados do Projeto

| Campo | Valor |
|-------|-------|
| Nome | Vista Intel Pro (Trivia Tasker) |
| Cliente | Trivia (interno) |
| Status | Producao |
| Inicio | Novembro 2025 |
| Piloto | Lucas Azevedo |
| Agentes | TRIVIAIOX v5.0.3 |

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| UI | Tailwind CSS 3 + shadcn-ui + Radix UI |
| State Management | TanStack React Query 5 + Zustand |
| Editor Rich Text | TipTap 3 |
| Graficos | Recharts 2 |
| Drag & Drop | dnd-kit |
| Calendario | react-big-calendar + react-day-picker |
| Canvas/Whiteboard | Fabric.js + RoughJS |
| Backend/Auth/Storage | Supabase (PostgreSQL, Auth, Storage, Edge Functions Deno) |
| Deploy Frontend | Netlify (auto via git push) |
| Validacao | Zod |
| Formularios | React Hook Form |
| Planilhas | xlsx (SheetJS) |

## URLs

| Recurso | URL |
|---------|-----|
| Producao (Netlify) | `[placeholder]` |
| Supabase Dashboard | `[placeholder]` |
| Repositorio | https://github.com/Triviastudio/vista-intel-pro |

## Features Atuais

### Gestao de Projetos
- Criacao, edicao e exclusao de projetos
- Visualizacoes: Tabela, Kanban por fases, Spreadsheet, Timeline, Calendario
- Fases e status customizaveis por organizacao
- Campos customizados por projeto
- Atribuicao de equipe por projeto
- Controle de custos e despesas por projeto
- Entregas (deliveries) com timeline
- Exportacao de projetos
- Clonagem de projetos
- Import de projetos (ClickUp, Monday, Excel/CSV)
- Arquivos e documentos por projeto (com editor TipTap)
- Notas de projeto
- Historico de alteracoes
- Prioridade automatica (AI)
- Health Score com pesos configuraveis

### Sistema de Tarefas
- Visualizacoes: Board Kanban, Lista, Lista Agrupada, Spreadsheet, Kanban por Fases, Calendario
- Drag and drop para reorganizacao
- Tags customizaveis (organizacao)
- Subtarefas
- Comentarios e historico
- Anexos de arquivos
- Edicao em batch (selecao multipla)
- Exclusao em batch
- Paginacao
- Campos customizados por tarefa
- Filtros avancados e sessoes de filtro

### Espacos Colaborativos (Spaces)
- Criacao de espacos com listas, documentos, planilhas, canvas, arquivos
- Editor de documentos (TipTap)
- Editor de planilhas
- Editor de Canvas/Whiteboard (Fabric.js)
- Tarefas por espaco com views (Kanban, Lista, Tabela)
- Subtarefas em espaco
- Gerenciador de pastas e arquivos
- Vinculacao de documentos a tarefas

### Propostas Comerciais
- Criacao e edicao de propostas
- Templates personalizaveis
- Comparacao de planos
- Sistema de descontos (plano base, recursos mensais, recursos pontuais)
- Envio por email
- Geracao de PDF
- Link publico para compartilhamento (slug)
- Aceitacao digital com termos legais
- Reunioes solicitadas
- Metricas financeiras de propostas

### Jimmy AI (Assistente Inteligente)
- Analise de riscos de projetos
- Identificacao de gargalos
- Sugestoes de otimizacao
- Previsoes de prazo e orcamento (AI Predictions)
- Digest diario (Edge Function)
- Relatorio semanal automatico
- Insights por projeto

### Rastreamento de Tempo
- Timer ativo (FloatingTimerBubble)
- Registro manual de horas
- Tabela de time entries
- Categorias de time entry
- Importacao de time entries
- Stats de tempo por projeto/usuario
- Desktop Agent (integracao com app desktop para tracking automatico)

### Equipe e Colaboradores
- Adicao e edicao de membros
- Papeis: admin, manager, member
- Timeline de equipe (Gantt)
- Grupos de colaboradores
- Tipos de colaboradores
- Historico de taxas/custo hora
- Movimentacoes de usuarios
- Reset de senhas

### Analytics e Relatorios
- Dashboard organizacional com visao geral
- Dashboard CEO com metricas executivas
- Custo por projeto (drill-down)
- Custo por colaborador
- Performance da equipe (v2)
- Deadlines (v2)
- Projetos criticos
- Coordenacao de projetos
- Propostas financeiras
- Predicoes AI
- Uso da plataforma (App Usage Report)
- Metricas diarias
- Modo apresentacao

### Workspace Pessoal (My Workspace)
- Dashboard pessoal
- Minhas tarefas
- Meus projetos
- Meus time entries
- Tarefas pessoais (todo list)
- Documentos pessoais
- Arquivos pessoais
- Whiteboards pessoais
- Favoritos de projetos

### Automacoes
- Builder visual de automacoes
- Triggers configuraveis (mudanca de status, deadline, etc.)
- Steps/acoes configuradas
- Logs de execucao
- Edge Function para execucao de triggers

### Gestao de Ausencias
- Registro de ferias, faltas, licencas
- Saldo de ferias (vacation balance)
- Aprovacao automatica configuravel
- Detalhes de ausencia

### Organizacao e Administracao
- Multi-organizacao (org switcher)
- Configuracoes de organizacao (fases, status, tags, categorias de despesa, campos)
- Billing e planos (Stripe)
- Limites de uso por plano
- Superadmin: gestao de todas as organizacoes
- Audit logs
- Tokens de agente (API)
- Dispositivos conectados
- Mapeamento de usuarios OS

### Notificacoes
- Centro de notificacoes
- Preferencias de notificacao
- Mencoes (@)
- Alertas de deadline (Edge Function diaria)
- Alertas de projeto (Edge Function diaria)

### Suporte
- Chat com AI (SupportChatWidget)
- Configuracoes de AI para suporte
- Escalacao de conversas
- Rate limiting

### Outros
- Temas (dark/light/system)
- Landing page
- Termos de Uso e Politica de Privacidade
- Pagina de ajuda
- Seed de dados demo (construcao)

## Metricas do Codigo

| Metrica | Quantidade |
|---------|-----------|
| Componentes (.tsx em src/components) | 393 |
| Custom Hooks | 110 |
| Edge Functions | 25 |
| Tabelas no banco | 78 |
| Migrations | 143 |
| Paginas | 31 |
| Contexts | 5 |
