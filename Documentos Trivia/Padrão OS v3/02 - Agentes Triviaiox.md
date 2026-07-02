---
audiência: humano
atualizado: 2026-07-01
---

# 02 — Agentes Triviaiox

> Espelho humano. Detalhe normativo: `_Scaffold/base/AGENTS.md` e o squad
> `_Scaffold/squads/trivia-os/`. Voltar: [[00 - Comece Aqui]].

## Como integramos com o Triviaiox
O Padrão OS **não altera o core do Triviaiox**. Usa os mecanismos de extensão:
- **Squad `trivia-os`**: configura os agentes existentes para a esteira SDD.
- **Artefato canônico único**: os agentes produzem/consomem `spec/domain/design/tasks/product` +
  ADR. A *story* do Triviaiox é a **visão de execução de `tasks.md`** e o *epic* é a **pasta
  `specs/NNNN-<slug>/`** — nenhum artefato paralelo. (Resolve a sobreposição de cerimônias;
  tabela de equivalência em `_Scaffold/base/AGENTS.md`.)
- **Subagentes + hook distribuídos pelo squad** (`squads/trivia-os/claude/`): o installer do
  Triviaiox não os instala — sem o squad, o kickoff não tem quem atender no Claude Code e a
  autoridade do `@devops` fica só em prosa.

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

## Autoridade (preservada do Triviaiox — e aplicada por máquina)
`@devops` é **exclusivo** em `git push`, `gh pr create/merge`, MCP e CI/CD. `@dev` faz git
**local** (add/commit/branch), nunca push. `@dev` não altera AC/escopo da spec.
O hook `enforce-git-push-authority.sh` (fail-closed, instalado pelo squad) **bloqueia** push fora
do `@devops` — a regra não depende de o agente lembrar dela.

## Skills da esteira → agente
`/iniciar-projeto`→@pm (kickoff) · `/clarificar`→@pm · `/nova-feature`→@sm+@dev · `/validar`→@qa ·
`/revisar-pr`→@qa · `/auditar`→@architect · `/handoff`→qualquer.
(As skills ficam em `_Scaffold/base/.claude/skills/`.)
