# Vista Intel Pro — Roadmap / Backlog

## Features Concluidas (em producao)

### Core
- [x] Autenticacao e multi-organizacao
- [x] Papeis e permissoes (superadmin, admin, manager, member)
- [x] Dashboard com visao geral
- [x] Tema dark/light/system
- [x] Landing page publica

### Projetos
- [x] CRUD completo de projetos
- [x] 5 visualizacoes (Tabela, Kanban, Spreadsheet, Timeline, Calendario)
- [x] Fases e status customizaveis
- [x] Campos customizados
- [x] Equipe por projeto
- [x] Despesas por projeto com categorias e produtos
- [x] Entregas (deliveries) com timeline
- [x] Exportacao de projetos
- [x] Clonagem de projetos com tarefas
- [x] Import ClickUp, Monday.com, Excel/CSV
- [x] Arquivos e documentos por projeto (editor TipTap)
- [x] Notas de projeto
- [x] Historico de alteracoes
- [x] Health Score configuravel
- [x] Prioridade automatica (AI)
- [x] Filtros avancados e custom field filters

### Tarefas
- [x] CRUD completo de tarefas
- [x] 6 visualizacoes (Board, Lista, Agrupada, Spreadsheet, Kanban Fases, Calendario)
- [x] Subtarefas
- [x] Drag and drop
- [x] Tags
- [x] Comentarios
- [x] Anexos
- [x] Edicao e exclusao em batch
- [x] Paginacao
- [x] Campos customizados
- [x] Filtros e sessoes de filtro

### Espacos Colaborativos
- [x] CRUD de espacos
- [x] Listas com tarefas
- [x] Documentos (editor TipTap)
- [x] Planilhas
- [x] Canvas/Whiteboard (Fabric.js)
- [x] Arquivos com upload
- [x] Pastas
- [x] Sidebar com tree view
- [x] Subtarefas no espaco
- [x] Vinculacao de documentos a tarefas

### Propostas Comerciais
- [x] CRUD de propostas
- [x] Templates
- [x] Comparacao de planos
- [x] Descontos configurados
- [x] Envio por email
- [x] Geracao de PDF
- [x] Link publico (slug)
- [x] Aceitacao digital com termos
- [x] Metricas financeiras

### Jimmy AI
- [x] Insights por projeto
- [x] Predicoes (prazo, orcamento, risco)
- [x] Digest diario automatico
- [x] Relatorio semanal
- [x] Analise de riscos

### Tempo
- [x] Timer ativo (floating bubble)
- [x] Registro manual
- [x] Categorias
- [x] Import de time entries
- [x] Desktop Agent (tracking automatico)

### Equipe
- [x] CRUD de membros
- [x] Timeline (Gantt) de equipe
- [x] Grupos de colaboradores
- [x] Tipos de colaboradores
- [x] Taxas/custo hora com historico
- [x] Movimentacoes
- [x] Reset de senhas

### Analytics
- [x] Dashboard organizacional
- [x] Dashboard CEO
- [x] Custos por projeto e colaborador
- [x] Performance da equipe
- [x] Deadlines
- [x] Projetos criticos
- [x] Coordenacao
- [x] Predicoes AI
- [x] App Usage Report
- [x] Modo apresentacao

### Workspace Pessoal
- [x] Dashboard pessoal
- [x] Minhas tarefas e projetos
- [x] Time entries pessoais
- [x] Todo lists pessoais
- [x] Documentos pessoais
- [x] Arquivos pessoais
- [x] Whiteboards pessoais
- [x] Favoritos

### Automacoes
- [x] Builder visual
- [x] Triggers configuraveis
- [x] Steps/acoes
- [x] Logs
- [x] Execucao via Edge Function

### Administracao
- [x] Billing/Stripe
- [x] Limites por plano
- [x] Superadmin (gestao global)
- [x] Audit logs
- [x] Tokens de agente
- [x] Configuracoes de organizacao completas

### Outros
- [x] Notificacoes e mencoes
- [x] Alertas de deadline (cron)
- [x] Suporte com AI
- [x] Gestao de ausencias/ferias
- [x] Termos de Uso e Politica de Privacidade

---

## Stories em Backlog (docs/stories/)

### STORY-001 — Editar Listas nos Espacos (cor, nome, descricao)
- **Status:** backlog
- **Prioridade:** media
- **Solicitante:** Thomaz (Onix LAB)
- **Descricao:** Apos criar uma lista no espaco, nao ha opcao de editar nome, cor ou descricao. Necessario modal de edicao com reuso do componente de criacao.

### STORY-002 — Redimensionar Colunas na View de Tarefas dos Espacos
- **Status:** backlog
- **Prioridade:** media
- **Solicitante:** Thomaz (Onix LAB)
- **Descricao:** Replicar a funcionalidade de resize de colunas (ja existente em Projetos) para a view de tarefas dos Espacos.

### STORY-003 — Word-Wrap no Texto de Subtarefas
- **Status:** backlog
- **Prioridade:** alta
- **Solicitante:** Thomaz (Onix LAB)
- **Descricao:** Texto das subtarefas e cortado sem quebra de linha. Fix CSS para word-wrap.

### STORY-004 — Excluir e Editar Subtarefas
- **Status:** backlog
- **Prioridade:** alta
- **Solicitante:** Thomaz (Onix LAB)
- **Descricao:** Permitir edicao inline e exclusao de subtarefas (atualmente so e possivel criar).

### STORY-005 — Subtarefas em Tree View na Lista de Tarefas do Espaco
- **Status:** backlog
- **Prioridade:** alta
- **Solicitante:** Thomaz (Onix LAB)
- **Descricao:** Mostrar subtarefas em tree view expandivel abaixo da tarefa pai na lista do espaco, com todas as propriedades (Responsavel, Prioridade, Status, etc.).

---

## Oportunidades de Evolucao Identificadas

### Performance e Escalabilidade
- **Lazy loading de views pesadas** — Componentes como SpaceOverview (36KB), SpaceListView (46KB) e Canvas (68KB) podem beneficiar de code splitting
- **Virtualizacao de listas longas** — Tabelas com muitos registros (tarefas, time entries) poderiam usar react-virtualized
- **Otimizacao de queries** — Alguns hooks carregam dados completos onde paginacao server-side seria mais eficiente

### Arquitetura
- **Migracao para feature-based structure** — CLAUDE.md define uma estrutura por features (`src/features/`) mas o codigo ainda usa a estrutura flat. Migracao gradual recomendada
- **Tipagem mais forte** — Alguns componentes grandes poderiam se beneficiar de tipos mais granulares
- **Testes automatizados** — Nao ha evidencia de testes unitarios/integracao implementados

### UX
- **Offline support** — Sistema 100% online; PWA com sync offline seria valor para mobile
- **Busca global** — Nao ha evidencia de busca unificada cross-feature
- **Atalhos de teclado** — Power users se beneficiariam de shortcuts globais
- **Onboarding guidado** — Para novos usuarios da plataforma

### Inteligencia
- **Jimmy AI mais contextual** — Expandir predicoes para tasks alem de projetos
- **Automacoes mais ricas** — Webhooks, integracoes com Slack/Discord/Teams
- **Sugestoes proativas** — Notificacoes inteligentes baseadas em patterns

### Negocio
- **API publica documentada** — Para integracao com ferramentas externas dos clientes
- **White-label** — Customizacao de branding por organizacao
- **Mobile app** — React Native ou PWA otimizado
