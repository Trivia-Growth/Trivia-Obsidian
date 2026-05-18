# Instalação do TRIVIAIOX (ex-AIOX)

> [!warning] Atualizado em 2026-05-06 — framework migrado de AIOX para TRIVIAIOX
> O framework de agentes evoluiu de AIOX para **TRIVIAIOX**. O repositório local está em `~/Documents/GitHub/Triviaiox/`. O pacote **não está publicado no npm** — a instalação é feita a partir do repo local. Ver erros conhecidos abaixo.

O TRIVIAIOX é instalado dentro do **repositório de código** (não no vault Obsidian).

---

## Pré-requisitos

- [ ] **Node.js 18+** instalado
  - Verificar: `node --version` (deve mostrar v18 ou superior)
  - Instalar: https://nodejs.org/en/download
- [ ] **Claude Code** instalado
  - Instalar: `npm install -g @anthropic-ai/claude-code`
  - Verificar: `claude --version`
- [ ] Repositório de código clonado localmente
- [ ] Repositório TRIVIAIOX clonado em `~/Documents/GitHub/Triviaiox/`

---

## Instalação

```bash
# 1. Garantir que as dependências do TRIVIAIOX estão instaladas (uma vez)
cd ~/Documents/GitHub/Triviaiox
npm install

# 2. Navegar para a raiz do repositório do projeto
cd ~/Documents/GitHub/[nome-do-projeto]

# 3. Instalar o TRIVIAIOX a partir do repo local
node ~/Documents/GitHub/Triviaiox/bin/triviaiox.js install --quiet
```

> **Durante a instalação:** Se perguntar sobre conflito de `.env`, escolha a opção de **merge** (mantém variáveis existentes e adiciona as novas).

**Verificar instalação:**
```bash
cat .triviaiox-core/version.json
```
Deve mostrar `{"version": "5.x.x"}`.

---

## Erros Conhecidos (e como evitar)

### ❌ Erro: `npx triviaiox-core install` — "Missing script"

**Causa:** O npm interpretou `triviaiox-core` como um script local do `package.json`, não como um pacote npx. Acontece quando há um `package.json` na pasta atual.

**Solução:** Usar `node` diretamente apontando para o binário local:
```bash
node ~/Documents/GitHub/Triviaiox/bin/triviaiox.js install --quiet
```

### ❌ Erro: `npm exec triviaiox-core@latest` — "404 Not Found"

**Causa:** O pacote `triviaiox-core` **não está publicado no npm registry público**. Ele existe apenas como repositório local em `~/Documents/GitHub/Triviaiox/`.

**Solução:** Mesma acima — usar `node` apontando para o repo local.

### ❌ Erro: `npx triviaiox-core@latest install` — "Missing script"

**Causa:** Idem ao primeiro erro — `npx` dentro de uma pasta com `package.json` interpreta o argumento como script.

**Solução:** `node ~/Documents/GitHub/Triviaiox/bin/triviaiox.js install --quiet`

---

## O que é instalado

```
.triviaiox-core/
├── development/
│   ├── agents/          ← definições dos agentes (pm, sm, dev, qa, etc.)
│   └── tasks/           ← tasks executáveis pelos agentes
├── constitution.md      ← princípios do framework
├── core-config.yaml     ← configuração do projeto (devStoryLocation, etc.)
├── version.json         ← versão instalada
└── ...

.claude/
├── commands/
│   └── TRIVIAIOX/
│       └── agents/      ← atalhos de slash command para cada agente
│           ├── pm.md
│           ├── sm.md
│           ├── dev.md
│           └── ...
└── skills/              ← skills instaladas
```

---

## Como Invocar um Agente no Claude Code

Dentro do Claude Code (terminal), use a barra seguida do nome do agente:

```
/pm      → Product Manager Morgan (criar PRDs, epics)
/sm      → Scrum Master River (criar stories, gerenciar backlog)
/dev     → Desenvolvedor (implementar código)
/qa      → QA (validar critérios de aceite)
/architect → Arquiteto (decisões técnicas)
/po      → Product Owner (refinamento de produto)
/devops  → DevOps (deploy, CI/CD, git)
/analyst → Analista (pesquisa, requisitos)
```

O agente lê o contexto do repositório (incluindo o `CLAUDE.md`) e começa a trabalhar dentro do seu papel.

---

## Workflow de Criação de Stories (com TRIVIAIOX)

```
/pm *create-brownfield-prd   → cria PRD/Epics em docs/prd/
/sm *create-next-story       → cria STORY-XXX.md em docs/stories/
/dev (implementa a story)
/qa *review-build STORY-XXX  → valida critérios de aceite
/devops (deploy)
```

Stories ficam em `docs/stories/STORY-XXX.md` (configurável em `.triviaiox-core/core-config.yaml` via `devStoryLocation`).

---

## Referência Real

O TRIVIAIOX está instalado no TriviaLPGenerator em:
```
~/Documents/GitHub/TriviaLPGenerator/.triviaiox-core/
```

Versão: **5.0.3** | Instalado em: **2026-05-06** | Método: `node ~/Documents/GitHub/Triviaiox/bin/triviaiox.js install`
