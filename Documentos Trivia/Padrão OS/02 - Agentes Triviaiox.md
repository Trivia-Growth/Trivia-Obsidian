---
audiência: humano
atualizado: 2026-06-22
---

# 02 — Agentes Triviaiox

> Espelho humano. Detalhe normativo: `_Scaffold/base/AGENTS.md` e o squad
> `_Scaffold/squads/trivia-os/`. Voltar: [[00 - Comece Aqui]].

## Como integramos com o Triviaiox
O Padrão OS **não altera o core do Triviaiox**. Usa os mecanismos de extensão:
- **Squad `trivia-os`**: configura os agentes existentes para a esteira SDD.
- **Artefato canônico único**: os agentes produzem/consomem `spec/domain/design/tasks/product` +
  ADR. A *story* do Triviaiox vira só a **visão de execução de `tasks.md`** — não um artefato
  paralelo. (Isto resolve a sobreposição de cerimônias entre os dois frameworks.)

## Quem produz cada artefato
| Artefato | Dono | Consome |
|----------|------|---------|
| `product.md`, `spec.md` (AC) | `@pm` (com `@analyst`) | todos |
| `domain.md`, `design.md`, ADR | `@architect` | `@dev`, `@qa`, `@data-engineer` |
| `tasks.md` | `@sm` | `@dev`, `@qa` |
| migrations/DDL | `@data-engineer` | `@dev` |

## Ciclo de uma feature
```
@pm/@analyst → product + spec (clarificar AC)
@architect   → domain/design/ADR (só no tier que exige)
@sm          → tasks.md (AC → task → gate)
@dev         → implementa task a task (1 commit/task, git local)
@qa          → valida cada AC pelo gate (/validar) + security gate
@devops      → ÚNICO com git push / PR / CI-CD
```
Features de IA/LLM somam `@prompt-engineer` (ver [[05 - Qualidade e Segurança]]).

## Autoridade (preservada do Triviaiox)
`@devops` é **exclusivo** em `git push`, `gh pr create/merge`, MCP e CI/CD. `@dev` faz git
**local** (add/commit/branch), nunca push. `@dev` não altera AC/escopo da spec.

## Skills da esteira → agente
`/clarificar`→@pm · `/nova-feature`→@sm+@dev · `/validar`→@qa · `/revisar-pr`→@qa ·
`/auditar`→@architect · `/handoff`→qualquer. (As skills ficam em `_Scaffold/base/.claude/skills/`.)
