# Instalação do AIOX

O AIOX é instalado dentro do **repositório de código** (não no vault Obsidian).

---

## Pré-requisitos

- [ ] **Node.js 18+** instalado
  - Verificar: `node --version` (deve mostrar v18 ou superior)
  - Instalar: https://nodejs.org/en/download
- [ ] **Claude Code** instalado
  - Instalar: `npm install -g @anthropic-ai/claude-code`
  - Verificar: `claude --version`
- [ ] Repositório de código clonado localmente

---

## Instalação

```bash
# 1. Navegar para a raiz do repositório de código
cd caminho/para/seu-projeto-app

# 2. Instalar o AIOX
npx aiox@latest install

# 3. Verificar instalação
cat .aiox-core/version.json
```

A instalação cria a pasta `.aiox-core/` na raiz do repositório com todos os agentes, templates e configurações.

---

## O que é instalado

```
.aiox-core/
├── development/
│   └── agents/          ← definições dos 12 agentes
│       ├── aiox-master.md
│       ├── analyst.md
│       ├── architect.md
│       ├── data-engineer.md
│       ├── dev.md
│       ├── devops.md
│       ├── pm.md
│       ├── po.md
│       ├── qa.md
│       ├── sm.md
│       ├── squad-creator.md
│       └── ux-design-expert.md
├── constitution.md      ← princípios do framework
├── version.json         ← versão instalada
└── ...
```

---

## Como Invocar um Agente no Claude Code

Dentro do Claude Code (terminal), use a barra seguida do nome do agente:

```
/sm      → Scrum Master (criar stories, gerenciar backlog)
/dev     → Desenvolvedor (implementar código)
/qa      → QA (validar critérios de aceite)
/architect → Arquiteto (decisões técnicas)
/po      → Product Owner (refinamento de produto)
```

O agente lê o contexto do repositório (incluindo o CLAUDE.md) e começa a trabalhar dentro do seu papel.

---

## CLAUDE.md — Configuração para os Agentes

O arquivo `CLAUDE.md` na raiz do repositório é lido pelos agentes antes de qualquer ação. Configure com os dados do projeto:

```markdown
# CLAUDE.md — [Nome do Projeto]

## Documentação
Vault Obsidian: ../[NomeVault]/Clientes/[Cliente]/[Projeto]/

## Stack
React + Vite + TypeScript | Supabase | Netlify

## Regras
1. Ler PROJECT_REQUIREMENTS.md antes de implementar
2. Diff Plan obrigatório → aguardar OK → implementar
3. RLS em toda tabela com dados sensíveis
4. Valores calculados no backend, nunca no frontend
5. Commitar código + docs juntos
```

Ver template completo em [[../07 - Templates de Código/CLAUDE.md|Template CLAUDE.md]].

---

## Referência Real

O AIOX está instalado no HeziomOS em:
```
Clientes/Heziom/HezionOS/.aiox-core/
```

Versão: **5.0.4** (instalada em 2026-04-10)
