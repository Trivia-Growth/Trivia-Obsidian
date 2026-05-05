# Agentes do Triviaiox

Todos os agentes ficam em `.triviaiox-core/development/agents/` e são sincronizados para os IDEs via `npm run sync:ide`.

## Agentes disponíveis

| Atalho | ID | Nome | Papel | Arquétipo |
|--------|-----|------|-------|-----------|
| `@dev` | `dev` | Dex | Full Stack Developer | Builder |
| `@qa` | `qa` | Quinn | Quality & Testing Specialist | Guardian |
| `@architect` | `architect` | Aria | Software Architect | Visionary |
| `@pm` | `pm` | Morgan | Product Manager | Strategist |
| `@po` | `po` | Pax | Product Owner | Navigator |
| `@sm` | `sm` | River | Scrum Master | Facilitator |
| `@analyst` | `analyst` | Alex | Research & Analysis | Explorer |
| `@data-engineer` | `data-engineer` | Dara | Data Engineering | Architect |
| `@devops` | `devops` | Gage | DevOps & Infrastructure | Operator |
| `@ux-design-expert` | `ux-design-expert` | Uma | UX/UI Design Expert | Craftsperson |
| `@squad-creator` | `squad-creator` | — | Squad Configuration | Organizer |
| `@triviaiox-master` | `triviaiox-master` | — | Master Orchestrator | Commander |

## Como ativar um agente

No Claude Code, Cursor, Gemini CLI ou Codex CLI:
```
@dev           # Ativa o agente Developer (Dex)
@qa            # Ativa o agente QA (Quinn)
*exit          # Sai do modo agente
```

## Comandos universais (todos os agentes)

| Comando | Descrição |
|---------|-----------|
| `*help` | Lista comandos disponíveis do agente atual |
| `*status` | Status do projeto relevante para o agente |
| `*guide` | Instruções completas de uso |
| `*exit` | Sai do modo agente |

## Autoridades exclusivas

| Agente | Autoridade exclusiva |
|--------|---------------------|
| `@devops` | Único que pode fazer `git push` para remote |
| `@po` | Único que pode aprovar stories (Draft → Ready) |
| `@qa` | Único que pode emitir veredicto QA Gate |

## Memória dos agentes

Cada agente tem memória persistente em:
```
.triviaiox-core/development/agents/{id}/MEMORY.md
```

Importada automaticamente via `.claude/rules/agent-memory-imports.md`.

## Para criar um novo agente

Ver: [[Como-criar-agentes]]
