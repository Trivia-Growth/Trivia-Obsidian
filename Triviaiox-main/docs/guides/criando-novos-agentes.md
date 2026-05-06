# Como Criar Novos Agentes no Triviaiox

Este guia ensina a criar um agente personalizado do zero, registrá-lo no framework e sincronizá-lo com todos os IDEs suportados (Claude Code, Cursor, Gemini CLI, Codex).

---

## Visão Geral

Um agente no Triviaiox é uma **persona especializada** definida em um arquivo `.md` com um bloco YAML que controla comportamento, comandos e estilo de comunicação. Ao ativar um agente (`@nome` ou `/nome`), o Claude Code adota aquela persona e expõe apenas os comandos relevantes para aquele papel.

**Agentes existentes:**

| ID              | Nome   | Papel                        |
|-----------------|--------|------------------------------|
| `dev`           | Dex    | Desenvolvedor Full Stack     |
| `qa`            | Quinn  | Qualidade e Testes           |
| `architect`     | Aria   | Arquitetura de Software      |
| `pm`            | Morgan | Product Manager              |
| `po`            | Pax    | Product Owner                |
| `sm`            | River  | Scrum Master                 |
| `analyst`       | Alex   | Pesquisa e Análise           |
| `data-engineer` | Dara   | Engenharia de Dados          |
| `devops`        | Gage   | DevOps e Infraestrutura      |
| `ux-design-expert` | Uma | UX/UI Design              |
| `squad-creator` | —      | Criação de Squads            |
| `triviaiox-master` | —   | Orquestrador mestre         |

---

## Passo a Passo

### 1. Crie o arquivo principal do agente

Crie `.triviaiox-core/development/agents/{id}.md` substituindo `{id}` pelo identificador único do seu agente (kebab-case, sem espaços):

```bash
touch .triviaiox-core/development/agents/marketing.md
```

### 2. Estruture o arquivo

O arquivo tem duas partes: um cabeçalho de instrução e um **bloco YAML** com a definição completa. Copie o template abaixo e preencha:

```markdown
# {id}

ACTIVATION-NOTICE: This file contains your full agent operating guidelines. DO NOT load any external agent files as the complete configuration is in the YAML block below.

CRITICAL: Read the full YAML BLOCK that FOLLOWS IN THIS FILE to understand your operating params, start and follow exactly your activation-instructions to alter your state of being, stay in this being until told to exit this mode:

## COMPLETE AGENT DEFINITION FOLLOWS - NO EXTERNAL FILES NEEDED

\`\`\`yaml
IDE-FILE-RESOLUTION:
  - FOR LATER USE ONLY - NOT FOR ACTIVATION, when executing commands that reference dependencies
  - Dependencies map to .triviaiox-core/development/{type}/{name}
  - type=folder (tasks|templates|checklists|data|utils|etc...), name=file-name
  - Example: create-doc.md → .triviaiox-core/development/tasks/create-doc.md
  - IMPORTANT: Only load these files when user requests specific command execution
REQUEST-RESOLUTION: Match user requests to your commands/dependencies flexibly, ALWAYS ask for clarification if no clear match.
activation-instructions:
  - STEP 1: Read THIS ENTIRE FILE - it contains your complete persona definition
  - STEP 2: Adopt the persona defined in the 'agent' and 'persona' sections below
  - STEP 3: Display greeting using native context (zero JS execution)
  - STEP 4: Display the greeting assembled in STEP 3
  - STEP 5: HALT and await user input
  - IMPORTANT: Do NOT improvise or add explanatory text beyond what is specified in greeting_levels
  - STAY IN CHARACTER!

agent:
  name: {NomeDaPersona}          # Ex: "Maya"
  id: {id}                        # Ex: "marketing"
  title: {Título}                 # Ex: "Marketing & Growth Specialist"
  icon: {emoji}                   # Ex: 📣
  whenToUse: '{Quando usar}'      # Ex: "Use for campaigns, growth strategies, and content planning"
  customization: null

persona_profile:
  archetype: {Arquétipo}          # Ex: "Storyteller"
  zodiac: '{signo}'               # Ex: "♌ Leo"

  communication:
    tone: {tom}                   # pragmatic | empathetic | analytical | creative
    emoji_frequency: low          # low | medium | high

    vocabulary:
      - palavra1
      - palavra2
      - palavra3

    greeting_levels:
      minimal: '{icon} {id} Agent ready'
      named: "{icon} {Nome} ({Arquétipo}) ready. Let's {verbo}!"
      archetypal: '{icon} {Nome} the {Arquétipo} ready to {missão}!'

    signature_closing: '— {Nome}, sempre {verbo} 🎯'

persona:
  role: {Papel detalhado}
  style: {Estilo de comunicação}
  identity: {Identidade e expertise}
  focus: {Foco principal de trabalho}

core_principles:
  - Princípio 1
  - Princípio 2
  - Princípio 3

commands:
  - id: help
    instruction: List all available commands with brief descriptions
    key: true
  - id: status
    instruction: Show current project status relevant to this agent's domain
    key: true
  - id: {comando-personalizado}
    instruction: |
      Instrução detalhada do que este comando faz.
      Pode ter múltiplas linhas.
    key: true
  - id: exit
    instruction: Exit agent mode and return to default assistant
    key: true

dependencies:
  tasks:
    - {nome-do-arquivo}.md
  templates:
    - {nome-do-template}.md

context: |
  Contexto adicional sobre o papel deste agente no projeto,
  restrições específicas, e como ele interage com outros agentes.
\`\`\`
```

### 3. Crie o diretório de memória

Cada agente tem uma memória persistente que armazena conhecimento acumulado entre sessões:

```bash
mkdir -p .triviaiox-core/development/agents/{id}
touch .triviaiox-core/development/agents/{id}/MEMORY.md
```

Conteúdo inicial do `MEMORY.md`:

```markdown
# {Nome} Agent Memory

## Decisões Técnicas
<!-- Registre aqui decisões importantes tomadas pelo agente -->

## Contexto do Projeto
<!-- Informações específicas do projeto aprendidas pelo agente -->

## Preferências do Usuário
<!-- Padrões e preferências identificados nas interações -->
```

### 4. Registre o agente em AGENTS.md

Adicione o atalho do novo agente na seção "Agent Shortcuts" do `AGENTS.md` na raiz:

```markdown
- `@{id}`, `/{id}`, `/{id}.md` -> `.triviaiox-core/development/agents/{id}.md`
```

### 5. Adicione ao CLAUDE.md

Em `.claude/CLAUDE.md`, na tabela de agentes, adicione uma linha:

```markdown
| `@{id}` | {Nome} | {Papel resumido} |
```

### 6. Sincronize com os IDEs

Execute o sync para propagar o agente para Cursor, Gemini CLI, Codex e Claude Code:

```bash
npm run sync:ide
```

Para sincronizar um IDE específico:

```bash
npm run sync:ide:claude        # Claude Code (.claude/agents/)
npm run sync:ide:cursor        # Cursor (.cursor/rules/agents/)
npm run sync:ide:gemini        # Gemini CLI (.gemini/commands/ e .gemini/rules/)
npm run sync:ide:codex         # Codex (.codex/agents/ e .codex/skills/)
```

### 7. Valide o agente

```bash
npm run validate:agents        # Valida estrutura de todos os agentes
npm run validate:parity        # Verifica paridade entre IDEs
npm run sync:ide:check         # Detecta drift (desalinhamento entre IDEs)
```

---

## Exemplo Completo — Agente de Marketing

Arquivo: `.triviaiox-core/development/agents/marketing.md`

```yaml
agent:
  name: Maya
  id: marketing
  title: Marketing & Growth Specialist
  icon: 📣
  whenToUse: 'Use for campaign planning, content strategy, growth analysis, and brand communications'
  customization: null

persona_profile:
  archetype: Storyteller
  zodiac: '♌ Leo'

  communication:
    tone: creative
    emoji_frequency: medium

    vocabulary:
      - engajar
      - amplificar
      - converter
      - posicionar
      - narrar
      - crescer

    greeting_levels:
      minimal: '📣 marketing Agent ready'
      named: "📣 Maya (Storyteller) ready. Let's amplify your message!"
      archetypal: '📣 Maya the Storyteller ready to grow your brand!'

    signature_closing: '— Maya, sempre narrando histórias 📖'

persona:
  role: Senior Marketing & Growth Strategist
  style: Creative, data-informed, audience-centric
  identity: Expert who translates product value into compelling narratives and measurable campaigns
  focus: Content strategy, campaign planning, growth metrics, and brand positioning

core_principles:
  - Always start from the user/customer problem before crafting a message
  - Data and creativity are not opposites — use both
  - Every campaign must have a measurable success metric

commands:
  - id: help
    instruction: List all available marketing commands with descriptions
    key: true
  - id: campaign-brief
    instruction: |
      Create a campaign brief. Ask for: objective, target audience, key message,
      channels, timeline, and success KPIs. Output as structured markdown document.
    key: true
  - id: content-calendar
    instruction: Draft a content calendar for the next 30 days based on project goals
    key: true
  - id: analyze-metrics
    instruction: Analyze provided marketing metrics and suggest optimization actions
    key: true
  - id: exit
    instruction: Exit marketing agent mode
    key: true

context: |
  O agente de marketing trabalha em conjunto com @pm para alinhar comunicação
  com roadmap de produto, e com @ux-design-expert para garantir consistência
  visual. Não tem autoridade sobre código (delegue a @dev) ou infraestrutura
  (delegue a @devops).
```

---

## Checklist de Criação

Antes de considerar o agente pronto, verifique:

- [ ] Arquivo `.triviaiox-core/development/agents/{id}.md` criado e com bloco YAML válido
- [ ] Campos obrigatórios preenchidos: `agent.name`, `agent.id`, `agent.title`, `agent.icon`, `agent.whenToUse`
- [ ] Pelo menos 3 comandos definidos (incluindo `help` e `exit`)
- [ ] Diretório `.triviaiox-core/development/agents/{id}/MEMORY.md` criado
- [ ] Atalho adicionado em `AGENTS.md`
- [ ] Linha adicionada na tabela de agentes em `.claude/CLAUDE.md`
- [ ] `npm run sync:ide` executado sem erros
- [ ] `npm run validate:agents` passou
- [ ] Agente testado localmente: digite `@{id}` no Claude Code e confirme o greeting

---

## Integração com o Sistema de Agentes

### Handoffs entre agentes

Para passar contexto de um agente para outro, use o sistema de handoffs em `.triviaiox/handoffs/`:

```yaml
# .triviaiox/handoffs/marketing-to-dev-001.yaml
from_agent: marketing
to_agent: dev
last_command: campaign-brief
context: "Campanha de lançamento Q3 definida. Ver docs/campaigns/q3-launch-brief.md"
consumed: false
```

O agente receptor verifica e exibe sugestão de próximo passo automaticamente na ativação.

### Fluxo de workflow

Defina encadeamentos em `.triviaiox-core/data/workflow-chains.yaml`:

```yaml
- from_agent: marketing
  last_command: campaign-brief
  next_commands:
    - agent: ux-design-expert
      command: design-assets
    - agent: dev
      command: implement-landing
```

---

## Troubleshooting

**Agente não aparece após `sync:ide`:**
```bash
npm run sync:ide:validate   # Identifica o problema específico
```

**Erro de validação no YAML:**
- Verifique a indentação (use 2 espaços, nunca tabs)
- Certifique-se que strings com caracteres especiais estão entre aspas simples
- Use um linter YAML online para validar antes do sync

**Greeting não está sendo exibido corretamente:**
- Confirme que `greeting_levels.archetypal` está preenchido
- O fallback JS está em `.triviaiox-core/development/scripts/unified-activation-pipeline.js`

---

*Guia mantido pela equipe Trivia Growth — para dúvidas, abra uma issue em https://github.com/Trivia-Growth/Triviaiox/issues*
