# Arquitetura do Triviaiox

## Estrutura de Diretórios

```
Triviaiox/
├── .triviaiox-core/          # Core do framework (NÃO modificar)
│   ├── constitution.md       # Princípios inegociáveis
│   ├── core-config.yaml      # Configuração central
│   ├── development/
│   │   ├── agents/           # Definições dos agentes (.md)
│   │   ├── tasks/            # Tarefas executáveis
│   │   ├── templates/        # Templates de documentos
│   │   └── checklists/       # Checklists de qualidade
│   └── infrastructure/       # Scripts CI/CD
├── .claude/                  # Config Claude Code
│   ├── CLAUDE.md             # Instruções principais
│   ├── agents/               # Cópias sinc. dos agentes
│   └── rules/                # Regras complementares
├── .codex/                   # Config Codex CLI
├── .cursor/                  # Config Cursor
├── .gemini/                  # Config Gemini CLI
├── bin/                      # CLI executables
│   ├── triviaiox.js          # CLI principal
│   └── triviaiox-init.js     # Inicializador
├── docs/                     # Documentação
│   ├── guides/               # Guias (inclui criando-novos-agentes.md)
│   └── stories/              # Stories de desenvolvimento
├── packages/                 # Pacotes internos
├── scripts/                  # Scripts utilitários
└── tests/                    # Testes
```

## Camadas do Framework (L1–L4)

| Camada | Mutabilidade | Paths |
|--------|-------------|-------|
| L1 — Framework Core | NUNCA modificar | `.triviaiox-core/core/`, `bin/triviaiox.js` |
| L2 — Framework Templates | NUNCA modificar | `.triviaiox-core/development/tasks/`, `templates/` |
| L3 — Project Config | Modificável com cuidado | `.triviaiox-core/data/`, `core-config.yaml` |
| L4 — Project Runtime | SEMPRE modificar | `docs/stories/`, `packages/`, `tests/` |

## IDEs Suportadas

| IDE | Config path | Sync command |
|-----|------------|--------------|
| Claude Code | `.claude/` | `npm run sync:ide:claude` |
| Cursor | `.cursor/rules/` | `npm run sync:ide:cursor` |
| Gemini CLI | `.gemini/` | `npm run sync:ide:gemini` |
| Codex CLI | `.codex/` | `npm run sync:ide:codex` |

## Fluxo de Desenvolvimento (Story-Driven)

```
@po *create-story
    ↓
@sm *draft → @po *validate-story-draft
    ↓
@dev *develop-story
    ↓
@qa *qa-gate
    ↓
@devops *push
```

## Constitution (Princípios inegociáveis)

| Artigo | Princípio | Severidade |
|--------|-----------|------------|
| I | CLI First | NON-NEGOTIABLE |
| II | Agent Authority | NON-NEGOTIABLE |
| III | Story-Driven Development | MUST |
| IV | No Invention | MUST |
| V | Quality First | MUST |
| VI | Absolute Imports | SHOULD |
