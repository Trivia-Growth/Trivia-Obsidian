# Setup para Desenvolvedor Técnico (Claude Code + Triviaiox)

Guia para devs que trabalham via Claude Code. Diferente do [[Setup Colaborador]] (perfil de negócio), este guia é para quem vai implementar código.

Dois perfis — identifique o seu:

| Perfil | Você vai... | Precisa de acesso ao framework? |
|--------|-------------|---------------------------------|
| **A — Iniciador** | Criar projetos novos com Triviaiox | Sim — admins do GitHub já têm |
| **B — Implementador** | Desenvolver em projeto já configurado | Não |

Se for Perfil A, siga primeiro o [[00 - Checklist de Início]] Passo 6a para configurar o framework na sua máquina. Depois volte aqui.

---

## Pré-requisitos (uma vez por máquina)

```bash
# Node.js 18+ LTS
node --version

# Claude Code
npm install -g @anthropic-ai/claude-code

# Git
git --version
```

---

## Clonar e instalar

```bash
git clone [URL do repositório do projeto]
cd [nome-do-projeto]
npm install
```

---

## Variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Preencher com as credenciais que o Lucas vai passar. **Nunca commitar `.env.local`.**

---

## O Triviaiox já está configurado

Ao clonar, você já tem os 15 agentes e regras do projeto — não precisa instalar nada do framework:

- `.triviaiox-core/` — 15 agentes especializados (dev, qa, architect, security, devops, etc.)
- `.claude/` — regras e configurações do Claude Code
- `CLAUDE.md` — instruções do projeto (ler antes de qualquer coisa)
- `PROJECT_REQUIREMENTS.md` — requisitos e stack
- `docs/stories/` — stories ativas (o que está sendo implementado agora)

Abrir Claude Code na pasta do projeto:

```bash
claude
```

---

## Fluxo de trabalho

1. `git pull` antes de começar (pode haver mudanças da Lovable ou de outro dev)
2. Ler `docs/stories/STORY-XXX.md` para entender o que implementar
3. Usar `@dev` no Claude Code para implementar
4. Atualizar status e checklist em `docs/stories/STORY-XXX.md`
5. `npm run lint && npm run typecheck && npm run build` antes de commitar
6. Commit — o @devops faz o push para remote

**Atalhos dos agentes (digitar no Claude Code):**
```
/sm        → Scrum Master (cria e gerencia stories)
/dev       → Developer (implementa)
/qa        → QA (valida)
/security  → Cipher — AppSec (review de segurança, obrigatório em features sensíveis)
/architect → Architect (decisões técnicas)
/devops    → DevOps (push para remote — exclusivo)
```

---

## Ciclo completo de uma story

```
@sm cria story
    ↓
@po valida (10-point checklist)
    ↓
@dev implementa (propõe Diff Plan → aguarda aprovação → código)
    ↓
@security *security-gate  ← obrigatório se toca auth, PII, API, pagamentos
    ↓
@qa *gate (7 quality checks)
    ↓
@devops push → deploy automático
```

**Importante:** `@dev` nunca faz `git push`. Sempre delegar para `@devops`.

---

## Protocolo de stories (Claude ↔ Lovable)

Stories ativas ficam em `docs/stories/` do repositório — acessíveis por todos.

| Quem trabalha | O que faz |
|---------------|-----------|
| Claude/dev | Implementa e atualiza `docs/stories/STORY-XXX.md` diretamente |
| Lovable | Implementa e atualiza o mesmo arquivo via commit no repo |

Depois que a story está `concluida`, o Lucas (ou `@sm`) arquiva no vault Obsidian e remove de `docs/stories/`.

---

## Comandos padrão do projeto

```bash
npm run dev        # servidor local
npm run build      # build de produção
npm run lint       # ESLint (só src/ e netlify/)
npm run typecheck  # TypeScript
npm test           # testes
npm run format     # Prettier
```

---

## Referências

- [[../07 - Templates de Código/CLAUDE.md|Template CLAUDE.md]] — estrutura das instruções do projeto
- [[../09 - Migrações/Migrar Projeto Lovable para Padrão Trivia|Migrar da Lovable]] — integrar projeto existente
- [[10 - Sync Lovable e Claude]] — protocolo completo de sincronismo
- [[../04 - Agentes Triviaiox/Equipe de Agentes|Equipe de Agentes]] — todos os 15 agentes e quando usar cada um
