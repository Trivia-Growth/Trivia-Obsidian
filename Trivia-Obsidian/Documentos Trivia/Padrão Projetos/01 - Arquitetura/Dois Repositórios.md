# Dois Repositórios — Código e Documentação Separados

Todo projeto tem dois repositórios (ou espaços) separados: um para o **código** e um para a **documentação**.

---

## Por que separar?

| | Repositório de Código | Vault Obsidian |
|--|----------------------|---------------|
| Conteúdo | `src/`, `supabase/`, `sync/`, configs | Specs, stories, análises, contexto de negócio |
| Quem acessa | Desenvolvedores, agentes, CI/CD | Todos: devs, CEO, sócio de negócio |
| Ferramentas | Git, VS Code, terminal | Obsidian (interface visual) |
| Sync | Git push/pull manual ou CI | obsidian-git automático a cada 10 min |

Misturar os dois no mesmo repositório cria conflitos: a Lovable só deve tocar em `src/`, o CEO não deveria ver commits de código, os agentes AIOX precisam de acesso diferente a cada um.

---

## Estrutura Recomendada

```
[Pasta raiz — ex: "Projetos" ou "Clientes/Heziom"]
├── [projeto]-app/          ← repositório de código (GitHub)
│   ├── src/
│   ├── supabase/
│   ├── sync/               ← scripts Deno locais (se houver)
│   ├── specs/technical/
│   ├── CLAUDE.md           ← aponta para o vault com caminho relativo
│   ├── PROJECT_REQUIREMENTS.md
│   ├── architecture.md
│   └── SECURITY_DEBT.md
│
└── Trivia-Obsidian/        ← este vault (clonado ao lado do repositório)
    └── Clientes/[Cliente]/[Projeto]/
        ├── 00 - Índice.md
        ├── Projeto/
        │   ├── Stories/
        │   ├── Dashboard do Projeto.md
        │   └── Roadmap.md
        └── [módulos específicos do projeto]
```

---

## Setup local (passo a passo)

Para que os agentes AIOX consigam navegar entre código e documentação, os dois repositórios precisam estar na **mesma pasta pai** na máquina local.

### 1. Criar a pasta raiz

```bash
mkdir ~/Projetos/[Cliente]
cd ~/Projetos/[Cliente]
```

### 2. Clonar o repositório de código

```bash
git clone https://github.com/[org]/[projeto]-app.git
```

### 3. Clonar (ou mover) o vault Obsidian

Se o vault já existe localmente, mova-o para a mesma pasta:
```bash
mv ~/Documents/Trivia-Obsidian ~/Projetos/[Cliente]/Trivia-Obsidian
```

Se precisar clonar do zero:
```bash
git clone https://github.com/[org]/Trivia-Obsidian.git
```

### 4. Confirmar a estrutura

```bash
ls ~/Projetos/[Cliente]/
# Deve mostrar:
# [projeto]-app/
# Trivia-Obsidian/
```

### 5. Verificar o CLAUDE.md

O `CLAUDE.md` na raiz do repositório de código deve referenciar o vault com caminho relativo:

```markdown
## Documentação (Obsidian Vault)
Path relativo: ../Trivia-Obsidian/Clientes/[Cliente]/[Projeto]/
```

Se os caminhos não batem, o agente não vai encontrar as stories. Ajuste o path no `CLAUDE.md` conforme a estrutura real da sua máquina.

---

## CLAUDE.md — A Ponte Entre os Dois

O arquivo `CLAUDE.md` na raiz do repositório de código é o que conecta os dois repositórios para os agentes:

```markdown
# CLAUDE.md — [Nome do Projeto]

## Documentação (Obsidian Vault)
Path relativo: ../[NomeVault]/Clientes/[Cliente]/[Projeto]/

Antes de implementar qualquer coisa:
1. Ler PROJECT_REQUIREMENTS.md neste repositório
2. Consultar a story em Projeto/Stories/STORY-XXX.md no vault
3. Seguir o Diff Plan obrigatório
```

O agente lê o CLAUDE.md e sabe exatamente onde encontrar specs, stories e contexto de negócio.

---

## Quem toca em quê

| Ferramenta/Pessoa | Repositório de código | Vault Obsidian |
|------------------|----------------------|---------------|
| **Lovable** | `src/` apenas | Não acessa |
| **Claude Code** | `src/`, `supabase/`, `sync/`, docs técnicos | Stories, specs via path relativo |
| **Agentes AIOX** | Código + testes + docs técnicos | Stories (lê e atualiza status) |
| **Lucas (piloto)** | Revisão de PRs, decisões arquiteturais | Aprovação de stories, Roadmap |
| **Colaborador de negócio** | Não acessa | Dashboard, Roadmap, stories (leitura) |
| **CI/CD (GitHub Actions)** | Build, testes, deploy | Não acessa |
